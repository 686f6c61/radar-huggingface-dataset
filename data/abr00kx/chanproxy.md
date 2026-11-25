# abr00kx/chanproxy

## Resumen

chanproxy es un proyecto publicado en Hugging Face bajo el identificador `abr00kx/chanproxy` que, a pesar de su alojamiento en la plataforma, no es un modelo de inteligencia artificial. Se trata de un proxy inverso autoalojado, escrito en Go (versión 1.26 o superior) y distribuido como binario único, que actúa como intermediario entre el navegador del usuario y hasta dieciséis imageboards y archivos (4chan, Lainchan, desuarchive, 4plebs, entre otros). Su función es normalizar la interfaz de estos sitios e inyectar las extensiones 4chan-neXT y OneeChan.

El proyecto incorpora mecanismos de evasión de huella TLS/HTTP2/HTTP3 mediante la librería `httpcloak` (versión 1.7.4), con presets de navegador como `firefox-133`, `chrome-143`, `chrome-131` y `safari-18`, incluyendo JA3/JA4 coherentes y soporte de `X25519MLKEM768` sobre QUIC. Además, implementa un control de acceso basado en WebAuthn con llaves hardware FIDO2 (YubiKey), sin campos de contraseña, y un sistema de RBAC con roles `admin`, `moderator` y `user`.

La relevancia de esta ficha es limitada en el contexto de evaluación de modelos: el repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes, y no contiene pesos, tokenizador ni configuración de inferencia. No obstante, se documenta aquí por su aparición en el catálogo de Hugging Face, advirtiendo explícitamente de que no se trata de un modelo de lenguaje y de que no procede evaluarlo como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un proxy inverso en Go 1.26+) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la model card está en inglés; el software no declara idiomas de interfaz) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

No aplica entrenamiento: chanproxy no es un modelo entrenado ni dispone de dataset, tokens de entrenamiento, RLHF ni DPO. Su arquitectura es la de un servidor HTTP en Go que se sitúa detrás de Caddy (con eliminación de cabeceras `XFF` y `Real-IP`) y delante de los sitios upstream. El flujo descrito en la model card es: navegador → Caddy (Zero-IP) → chanproxy en el puerto 9966 → `gateMiddleware` (WebAuthn + RBAC) → rutas `/`, `/<site>/<b>/`, `/site/<slug>`, `/proxy/<h>/` y `/ws` → `dynamicTransitTransport` (httpcloak + pool de diez proxies por usuario) → sitios upstream.

La innovación técnica destacable, siempre en el terreno de la red y no del aprendizaje automático, es la coherencia de huella de transporte: presets de TLS/HTTP2/HTTP3 con JA3/JA4 coincidentes, ajustes Akamai de HTTP/2, orden de cabeceras y `X25519MLKEM768` sobre HTTP/3 QUIC. También incluye detección automática de motores de foro (`vichan`, `lynxchan`, `jschan`, `foolfuuka`) mediante el endpoint `POST /api/settings/detect-site`, un hub WebSocket en `/ws` para actualizaciones incrementales de hilos y proxies de privacidad para medios embebidos (YouTube → Piped/Invidious, Twitter/X → Nitter/twimg, Reddit → Redlib, además de `i.pximg.net`, `files.catbox.moe`, `media.vocaroo.com` e `i.imgur.com`).

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- Proxy inverso multi-sitio con normalización de interfaz para dieciséis imageboards y archivos preconfigurados.
- Inyección de las extensiones 4chan-neXT y OneeChan en la interfaz servida.
- Evasión de huella de red configurable mediante `httpcloak` con presets de navegador y diagnóstico en vivo (`/api/settings/test-transit`).
- Autenticación sin contraseña con llaves hardware FIDO2/WebAuthn (`cross-platform`) y RBAC por niveles (`admin`, `moderator`, `user`), con ban y desban de cuentas.
- Pool de proxies upstream por usuario: Bright Data Super Proxy (`brd.superproxy.io:33335`) y API REST, Webshare, Oxylabs, Smartproxy, IPRoyal, APIs JSON/texto genéricas y listas manuales; cada usuario recibe diez proxies aleatorios y elige su nodo de salida.
- Auditoría Zero-IP: registro en `audit.jsonl` por nombre de usuario, sin direcciones IP de cliente, incluyendo número de post (`no:<id>`) pero no su contenido.
- Hub WebSocket en `/ws` para hilos en tiempo real y página de inicio con hilos populares agregados de todos los sitios no-archivo.
- Soporte de 4chan Pass mediante las variables `PROXY_PASS_ID` y `PROXY_PASS_PIN`.

## Casos de uso

- Navegación unificada de imageboards: un usuario despliega el binario con `make run` y accede a 4chan, Lainchan, soyjak.st, Endchan, zzzchan, swedishwin, indiachan y crystal.cafe desde una única interfaz normalizada en `http://127.0.0.1:9966`, sin instalar extensiones en cada navegador.
- Consulta de archivos históricos: los ocho archivos preconfigurados (desuarchive.org, 4plebs, fireden, warosu, archived.moe, thebarchive, arch.b4k.dev, archiveofsins) se sirven a través de `/site/<slug>` con la misma UI, útil para investigación de hilos antiguos.
- Acceso restringido a un equipo pequeño: se activa la puerta YubiKey en `/settings`, se enrola la primera cuenta (que pasa a `admin`) y se asignan roles `moderator` o `user`, de modo que solo portadores de llave hardware acceden a `/`, `/settings`, `/proxy/*`, `/site/*`, `/ws` y `/api/*`.
- Enrutado de salida por usuario: en entornos donde varias personas comparten instancia, cada una recibe diez proxies aleatorios del pool de Bright Data o de otro proveedor y selecciona su nodo activo, de forma que las peticiones y publicaciones salen por una IP distinta según el usuario.
- Auditoría sin retención de IP: un moderador revisa `audit.jsonl` para ver accesos, peticiones API, números de post, inicios de sesión y acciones de moderación asociados a cada `username`, sin que se almacenen direcciones IP de cliente, lo que simplifica el cumplimiento de minimización de datos.
- Monitorización de hilos en tiempo real: un cliente se conecta a `/ws` y recibe actualizaciones incrementales de los hilos activos con bajo consumo de ancho de banda, adecuado para paneles de seguimiento o integraciones propias.
- Onboarding de un foro nuevo: se pega la URL del tablón en `/settings` → **+ Add Site** → **Detect**, y el endpoint `POST /api/settings/detect-site` identifica el motor (`vichan`, `lynxchan`, `jschan` o `foolfuuka`) y rellena la lista de tablones automáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no es un modelo de IA y la model card no incluye métricas de latencia, throughput ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM: no aplica; el proyecto no ejecuta inferencia ni carga pesos en GPU.
- CPU y memoria: no especificados en la model card; el requisito declarado es Go 1.26 o superior para compilar.
- GPU recomendadas: no aplica (A100, H100, RTX 4090 y similares no son relevantes).
- Cabe en cualquier equipo capaz de ejecutar un binario Go; el despliegue de referencia es un contenedor Podman rootless.
- Opciones de despliegue: binario único con `make run` (genera `bin/4chan-proxy` y sirve en `127.0.0.1:9966`), contenedor rootless con Podman y despliegue Zero-IP detrás de Caddy. No se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. chanproxy no es un modelo de lenguaje y no existe una categoría de modelos comparable; los proxies inversos autoalojados para imageboards (por ejemplo, instancias de Foolfuuka o de 4chan-neXT por separado) no publican parámetros, contexto ni benchmarks en los términos de esta ficha, y la información proporcionada no incluye alternativas con datos verificables.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como generador de texto, código o razonamiento; su presencia en Hugging Face responde a un uso de la plataforma como repositorio de artefactos.
- Licencia no declarada: la model card no especifica términos de uso, por lo que el uso comercial o la redistribución quedan sin marco legal explícito y requieren contactar con el autor.
- Repositorio vacío en la práctica: 0.0 GB de tamaño, cero descargas y cero likes; no hay evidencia de mantenimiento ni de comunidad.
- Dependencia de servicios de terceros: Bright Data, Webshare, Oxylabs, Smartproxy e IPRoyal implican coste y condiciones contractuales propias; los proxies de privacidad (Piped, Invidious, Nitter, Redlib) dependen de instancias públicas que pueden desaparecer.
- Riesgo operativo y legal: el diseño está orientado a evadir huellas TLS/HTTP y a enrutar tráfico por proxies residenciales, lo que puede contravenir los términos de servicio de los sitios upstream y las normativas aplicables en la jurisdicción del operador.
- Requiere hardware específico para el control de acceso: sin una llave FIDO2 compatible no es posible autenticarse cuando la puerta está activada, ya que no existen campos de contraseña.
- Fecha de creación anómala (2026-11-25) en los metadatos del repositorio, lo que impide verificar su historial real.
- Sin datos de sesgos ni de alucinación por no ser un modelo generativo; el riesgo relevante es de seguridad (exposición de la instancia, mala configuración de la puerta de acceso o del pool de proxies).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abr00kx/chanproxy
- Librería httpcloak: https://pkg.go.dev/github.com/sardanioss/httpcloak
- Extensión 4chan-neXT: https://github.com/cercos/4chan-neXT
- Extensión OneeChan: https://github.com/KevinParnell/OneeChan
- Go: https://go.dev/
- Bright Data: https://brightdata.com/solutions
- Podman: https://podman.io/
- Yubico (FIDO2/WebAuthn): https://www.yubico.com/
