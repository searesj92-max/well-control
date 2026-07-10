/* Well Control — service worker: app offline após 1ª visita */
const CACHE = "wc-v1";
const CORE = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then((res) => { const cl = res.clone(); caches.open(CACHE).then((c) => c.put("./", cl)); return res; })
        .catch(() => caches.match("./"))
    );
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).then((res) => { const cl = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cl)); return res; }))
    );
  }
});
