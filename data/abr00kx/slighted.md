# abr00kx/slighted

## Resumen

`abr00kx/slighted` es un repositorio alojado en Hugging Face cuyo contenido real no es un modelo de inteligencia artificial, sino un cliente Python y un toolkit de ingenieria inversa del protocolo del motor de imageboard en tiempo real `awoo.cf` / `nekohash`. El autor, `abr00kx`, publica bajo licencia MIT un conjunto de scripts que implementan el handshake completo con el backend `p.awoo.cf`, incluyendo la resolucion del reto WebSocket en seis rondas y la gestion de cookies de Cloudflare extraidas de un perfil de Firefox.

El repositorio documenta dos modos de framing: uno ASCII/JSON para mensajes de control (sincronizacion, presencia, NekoTV y Arcade) y otro binario little-endian con cabecera de `post_id` en float64 y opcode de un byte para streaming de pulsaciones y generacion de tokens en vivo. Estos opcodes cubren supuestamente modelos de terceros como Claude, Imagen, Venice, Atlas y BytePlus, pero el repositorio no incluye pesos, tokenizador, configuracion de transformer ni ningun artefacto de inferencia.

Por tanto, esta ficha documenta el repositorio como lo que es: una herramienta de cliente y protocolo, no un modelo. No hay parametros, contexto, cuantizaciones ni benchmarks que reportar, y asi se indica en cada seccion correspondiente. Es relevante para desarrolladores interesados en protocolos WebSocket binarios, ingenieria inversa de APIs y automatizacion de clientes en tiempo real, no para evaluacion de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un cliente WebSocket y toolkit de protocolo en Python) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene scripts Python y documentacion, no pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni artefactos de pesos. Su "arquitectura" es la de un cliente de red en Python que orquesta: extraccion de cookies de sesion desde un perfil de Firefox (`cf_clearance`, `__cf_bm`, `mgc_fpc`, `meta_pass`, `captcha_session`, `_known`), registro de un parametro `binding` de 32 bytes mediante `POST https://p.awoo.cf/v1/token`, upgrade a `wss://p.awoo.cf/api/socket?binding=<binding>` con cabeceras `Origin` y `Cookie`, y resolucion de un reto de seis rondas en el que el servidor envia un entero `t` en el rango `100000 <= t <= 1999999` y el cliente responde `t + 1`, tras lo cual recibe un token `v2.`.

El framing se divide en dos capas: control en ASCII con prefijo de opcode de dos digitos (`44` sincronizacion, `49` presencia, `54` NekoTV, `80` Arcade, `48` keepalive NOOP) y streaming binario little-endian con `post_id` en float64, payload variable y opcode final de un byte (`02`, `03`, `04` para pulsaciones; `81` Claude Thinking; `11-13` Claude; `14-16` Imagen; `17-34` Video; `64-66` Venice; `67-69` Atlas; `82-84` BytePlus). No hay datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia que documentar.

## Capacidades

- Handshake end-to-end completo y autenticacion contra el backend `p.awoo.cf`, incluyendo resolucion del reto WebSocket de seis rondas.
- Sostenimiento de hasta 30 instancias WebSocket simultaneas abiertas y sincronizadas, segun la model card.
- Streaming en vivo de hilos y posts con decodificacion de frames binarios.
- Documentacion del protocolo reversado en `docs/NEKOHASH.md` y `docs/ARCHITECTURE.md`.
- Protocolo multijugador Arcade con mas de 19 juegos en hilo y especificacion de watch-party NekoTV.
- Pipeline de deduplicacion de medios en cliente mediante SHA-1 contra `/api/upload-hash`.
- Scripts de ejemplo: `awoo_client.py` (cliente unico), `sync_thread.py` (sincronizacion de hilo) y `multi_connect.py` (conexiones concurrentes con `-n` y `-d`).
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues propias; cualquier generacion observada corresponde a los servicios remotos a los que el cliente se conecta.

## Casos de uso

- Monitorizacion de hilos en tiempo real: `sync_thread.py --board g --thread 1256858` permite seguir posts y eventos de escritura de un hilo concreto, util para construir dashboards de actividad o alertas de moderacion sobre el framing binario documentado.
- Pruebas de carga y robustez de protocolo: `multi_connect.py -n 30 -b all` mantiene 30 conexiones simultaneas, lo que sirve para validar la estabilidad del handshake de seis rondas y del keepalive `48` bajo concurrencia.
- Investigacion de protocolos WebSocket binarios: el repositorio documenta el formato `<float64 post_id><payload><opcode>` y los opcodes de control, material util para quienes estudian disenos de framing hibrido ASCII/binario en sistemas de streaming.
- Automatizacion de pipelines de subida de medios: el pipeline SHA-1 contra `/api/upload-hash` permite deduplicar ficheros antes de subirlos, reduciendo ancho de banda en clientes de publicacion masiva.
- Integracion de watch-party y minijuegos: la especificacion NekoTV (opcode `54`) y Arcade (opcode `80`) permite construir clientes alternativos o bots que participen en salas sincronizadas.
- Formacion y auditoria de seguridad: el flujo de extraccion de cookies de Firefox y el binding de 32 bytes sirven como caso de estudio de los mecanismos anti-bot de Cloudflare y de los limites eticos y legales de su automatizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia local ni pesos que cargar.
- GPU: no aplica; el cliente es CPU-only y su coste esta dominado por E/S de red.
- GPU de consumo: no aplica.
- Despliegue: ejecucion directa con Python 3 tras `pip install -r requirements.txt`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como metricas publicadas; la model card solo reporta el sostenimiento verificado de 30 conexiones WebSocket concurrentes.
- Requisitos adicionales: acceso a un perfil de Firefox con sesion valida en `awoo.cf` para extraer las cookies de Cloudflare, y conectividad con `p.awoo.cf`.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la categoria de "modelo de IA", porque este repositorio no es un modelo. Frente a otros clientes de imageboard o toolkits de protocolo, la comparacion exigiria datos de terceros que no se han proporcionado.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con MMLU, HumanEval o GSM8K.
- Dependencia de cookies de sesion extraidas de un perfil de Firefox local; su caducidad o invalidacion rompe el flujo de handshake.
- Dependencia de un backend propietario (`p.awoo.cf`) y de mecanismos anti-bot de Cloudflare; cambios en el servidor pueden invalidar el protocolo reversado.
- Eludir protecciones anti-bot y reutilizar cookies de sesion puede contravenir los terminos de servicio del sitio y la legislacion aplicable; la licencia MIT cubre el codigo, no el uso del servicio remoto.
- Riesgo de alucinacion: no aplica al repositorio; cualquier salida generativa proviene de servicios remotos no verificados por el autor.
- Los opcodes asociados a Claude, Imagen, Venice, Atlas y BytePlus no implican afiliacion ni soporte oficial de esos proveedores; su funcionamiento no esta verificado de forma independiente.
- Sin tests, CI ni versionado de releases documentados; madurez de produccion no acreditada.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abr00kx/slighted
- Documentacion del protocolo: `docs/NEKOHASH.md` (referenciada en la model card)
- Documentacion de arquitectura: `docs/ARCHITECTURE.md` (referenciada en la model card)
- Backend de token: https://p.awoo.cf/v1/token
- Endpoint WebSocket: wss://p.awoo.cf/api/socket
- Sitio del motor: https://awoo.cf
