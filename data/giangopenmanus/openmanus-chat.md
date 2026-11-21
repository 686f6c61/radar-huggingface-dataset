# giangopenmanus/openmanus-chat

## Resumen

OpenManus Web Chat es un repositorio de Hugging Face publicado por el usuario `giangopenmanus` que, segun su model card, no contiene pesos de un modelo de lenguaje, sino el codigo fuente de compilacion de una imagen Docker para desplegar una interfaz web de chat con contrasena sobre el agente OpenManus. El propio autor lo describe como "build source" para una imagen Docker, sin claves de API, contrasenas, ficheros `.env` ni `config.toml`; los secretos se inyectan al arrancar el contenedor.

El componente de lenguaje no es un modelo propio: la aplicacion delega la inferencia en un endpoint compatible con OpenAI que apunta al modelo Gemini `gemini-3.5-flash-lite`. La aplicacion escucha en el puerto TCP 8080, persiste el historial de chat en una base de datos SQLite ubicada en `/data/chat.db` y expone un endpoint WebSocket en `/ws/chat` tras la autenticacion por contrasena.

Es relevante como ejemplo de empaquetado y despliegue de un agente conversacional en infraestructura de bajo coste (plan gratuito de blitz.cloud con 512 MB de RAM reservada), pero no constituye un modelo de IA open source evaluable: no hay pesos, no hay arquitectura de red neuronal publicada, no hay datos de entrenamiento ni benchmarks. Cualquier evaluacion de capacidades del modelo subyacente debe hacerse sobre Gemini `gemini-3.5-flash-lite`, no sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo de lenguaje; es codigo de aplicacion web sobre OpenManus y un endpoint compatible con OpenAI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo Gemini `gemini-3.5-flash-lite` invocado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene un `Dockerfile` y codigo de servidor, no pesos en safetensors ni GGUF) |

Otros datos tecnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Puerto de escucha | TCP 8080 (`0.0.0.0`) |
| Endpoint WebSocket | `/ws/chat` (tras login por contrasena) |
| Persistencia | SQLite en `/data/chat.db` (carpeta `/data` como volumen persistente) |
| Variables de entorno requeridas | `GEMINI_API_KEY`, `APP_PASSWORD`, `APP_SECRET`, `MOCK_AGENT` |
| Comando de arranque | `uvicorn server:app --host 0.0.0.0 --port 8080 --proxy-headers` |
| Navegador integrado | no incluido (sin Browser Use, Playwright ni Chromium) |
| Descargas en Hugging Face | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-21 |
| Fecha de actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir: el repositorio es una aplicacion web (servidor ASGI sobre Uvicorn, presumiblemente FastAPI por el comando `uvicorn server:app`) que actua como frontend y orquestador del agente OpenManus. La inferencia se externaliza a un endpoint compatible con OpenAI que sirve Gemini `gemini-3.5-flash-lite`. El entrypoint del contenedor genera `config/config.toml` a partir de la variable `GEMINI_API_KEY` y lanza el servidor.

No se documenta ningun proceso de entrenamiento, dataset, numero de tokens, RLHF, DPO ni innovacion tecnica de modelado. La unica decision de diseno reseñable es la exclusion deliberada de Browser Use, Playwright y Chromium para mantener el consumo de RAM cerca del limite de 512 MB del plan gratuito. Tampoco se especifica el framework web exacto ni la version de Python, y no se publican pesos, checkpoints ni artefactos de modelo.

## Capacidades

- Interfaz de chat web protegida por contrasena (`APP_PASSWORD`) con sesion firmada mediante `APP_SECRET`.
- Conversacion multi-turno con historial persistido en SQLite (`/data/chat.db`).
- Canal de comunicacion en tiempo real mediante WebSocket en `/ws/chat`.
- Orquestacion de un agente OpenManus: el repositorio integra el agente y delega el razonamiento y la generacion en Gemini `gemini-3.5-flash-lite`.
- Modo simulado (`MOCK_AGENT=1`) para pruebas sin consumir API real.
- Despliegue reproducible en contenedor con inyeccion de secretos en tiempo de ejecucion, sin secretos en el repositorio.
- No incluye navegacion web automatizada ni capacidades de vision, audio o tool calling propias; cualquier capacidad de ese tipo depende del modelo Gemini subyacente y de las herramientas que OpenManus exponga.

## Casos de uso

- Despliegue de un chat privado de bajo coste: el contenedor se publica en blitz.cloud con 512 MB de RAM reservada y 1 GB de almacenamiento para `/data`, adecuado para uso personal o demos internas con acceso restringido por contrasena.
- Prototipado de agentes OpenManus sin infraestructura propia: al no incluir Playwright ni Chromium, el arranque es rapido y el consumo de memoria se mantiene dentro de limites de planes gratuitos.
- Evaluacion de flujos conversacionales con historial persistente: la base SQLite en `/data/chat.db` permite conservar sesiones entre reinicios si se declara `/data` como carpeta persistente.
- Integracion en pipelines de CI/CD como servicio de pruebas: el modo `MOCK_AGENT=0`/`1` y la configuracion por variables de entorno facilitan levantar instancias efimeras con `podman run --env-file`.
- Demostraciones con autenticacion sencilla: la combinacion de `APP_PASSWORD` y `APP_SECRET` permite exponer una instancia publica sin construir un sistema de usuarios completo.
- Base para extender OpenManus con interfaz web: el codigo sirve como punto de partida para anadir herramientas, cambiar el proveedor LLM o incorporar persistencia distinta de SQLite.
- Entornos con requisitos de no exposicion de secretos: el patron de inyeccion en tiempo de arranque evita versionar claves de API y contrasenas en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el repositorio no ejecuta un modelo local. La inferencia ocurre en la API de Gemini.
- RAM: la model card indica un limite de 512 MB en el plan gratuito de blitz.cloud, con reserva de 512 MB y pico de hasta 1,5 GB; el autor advierte que el tamano "small" por defecto es ajustado.
- Almacenamiento: 1 GB reservado para la carpeta persistente `/data`.
- GPU: no se requiere GPU local; el despliegue recomendado es en la nube (blitz.cloud) o en un contenedor local con `podman`.
- Opciones de despliegue: Docker o Podman con el `Dockerfile` de la raiz del repositorio, y Uvicorn como servidor ASGI. No se mencionan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos locales.
- Latencia y throughput: no disponibles; dependen de la red y de la API de Gemini. La model card indica que el plan gratuito duerme la aplicacion tras 15 minutos sin visita de navegador y tarda unos 10 segundos en despertar, y que los pings programaticos no la reactivan.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje y no se han identificado en la informacion proporcionada alternativas comparables de la misma categoria (aplicaciones web autoalojadas sobre OpenManus). Como referencia, el modelo que consume es Gemini `gemini-3.5-flash-lite`, pero no se dispone de datos de parametros, contexto ni benchmarks en la informacion facilitada.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni configuracion de inferencia; no puede evaluarse con benchmarks de MMLU, HumanEval o GSM8K.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso en produccion.
- Dependencia total de un servicio externo (Gemini `gemini-3.5-flash-lite`) y de la disponibilidad y politica de precios de su API.
- La ausencia de Playwright y Chromium limita las capacidades del agente OpenManus a tareas que no requieran navegacion web.
- El plan gratuito de blitz.cloud duerme la aplicacion tras 15 minutos de inactividad y no responde a pings programaticos, lo que puede romper integraciones automatizadas.
- El limite de 512 MB de RAM es ajustado segun el propio autor; picos de hasta 1,5 GB pueden provocar reinicios.
- Sin datos publicados sobre sesgos, alucinacion o calidad multilingue; cualquier evaluacion de ese tipo debe hacerse sobre el modelo Gemini subyacente.
- La fecha de creacion y actualizacion (2026-11-21) y el nombre del modelo Gemini (`gemini-3.5-flash-lite`) no han podido verificarse con fuentes independientes en la informacion disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de mantenimiento por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/giangopenmanus/openmanus-chat
- Proyecto OpenManus: https://github.com/FoundationAgents/OpenManus
- Panel de blitz.cloud: https://dashboard.blitz.cloud
