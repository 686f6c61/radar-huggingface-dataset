# Bobby821/ai-tg-bot

## Resumen

`Bobby821/ai-tg-bot` no es un modelo de lenguaje, sino un repositorio de codigo publicado en Hugging Face que contiene la implementacion de un bot de Telegram con proposito de asistente personal. El autor, Bobby821, distribuye el codigo fuente del bot a traves de este repositorio, que se utiliza principalmente como almacenamiento gratuito de codigo para su posterior despliegue en servicios como Render. El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta.

El bot funciona como un cliente que se conecta a modelos de lenguaje externos: su proveedor principal es DeepSeek a traves de su chat web (acceso no oficial mediante token de cuenta y resolucion de proof-of-work), y dispone de proveedores de respaldo mediante APIs compatibles con OpenAI (OpenRouter, Gemini, Groq, DeepSeek API o custom). La logica del bot esta implementada sobre aiogram, con persistencia de historial de conversaciones en SQLite o PostgreSQL segun el entorno de despliegue.

No se trata, por tanto, de pesos de un modelo ni de una arquitectura neuronal propia: no hay parametros, contexto ni cuantizaciones que documentar. La relevancia del repositorio radica en su enfoque practico de orquestacion de proveedores LLM gratuitos con acceso restringido por lista de propietarios (`OWNER_IDS`), pensado para uso personal y autoalojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es codigo de aplicacion, bot de Telegram sobre aiogram) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del proveedor externo configurado) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el README esta redactado en ruso; el idioma de respuesta depende del proveedor) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente, no pesos) |

## Arquitectura y entrenamiento

El repositorio contiene una aplicacion Python, no un modelo entrenado. El flujo de ejecucion descrito en la model card es: Telegram → aiogram → chat almacenado en SQLite o PostgreSQL → proveedor → respuesta en streaming de vuelta a Telegram. Los proveedores se dividen en dos categorias: `deepseek_web`, que es un acceso no oficial a chat.deepseek.com mediante token y cookies de la cuenta del usuario, y proveedores con API compatible con OpenAI (`openrouter`, `gemini`, `groq`, `deepseek`, `custom`).

La integracion con DeepSeek web utiliza Playwright para el inicio de sesion en navegador, extraccion de token y cookies, y resolucion del proof-of-work mediante un modulo WebAssembly nativo de DeepSeek. La libreria empleada para ello procede del proyecto `Tsuev/opencode-deepseek` (licencia MIT) y se incluye en el directorio `vendor/`. No hay informacion sobre datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia, porque no existe un modelo propio en este repositorio.

## Capacidades

- Gestion de conversaciones multi-turno en Telegram con historial y memoria independiente por chat.
- Enrutamiento entre un proveedor principal (DeepSeek web) y proveedores de respaldo (OpenRouter, Gemini, Groq, DeepSeek API, custom) ante fallos.
- Respuestas en streaming hacia Telegram.
- Control de acceso privado mediante lista de identificadores de propietario (`OWNER_IDS`).
- Persistencia de historial en SQLite en local o PostgreSQL en entornos con disco efimero.
- Despliegue mediante Docker, systemd o servicios PaaS (Render, Oracle Cloud, Koyeb, Fly.io).
- Inicio de sesion automatizado en DeepSeek web mediante Playwright y resolucion de proof-of-work con WebAssembly.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio, ya que esas capacidades dependerian del proveedor externo y no estan descritas.

## Casos de uso

- Asistente personal privado en Telegram: el bot responde unicamente a los identificadores incluidos en `OWNER_IDS`, con historial separado por chat, lo que permite usarlo como asistente de uso individual sin exponerlo a terceros.
- Orquestacion de LLM gratuitos con tolerancia a fallos: si DeepSeek web no responde o muestra verificacion anti-robot, el bot conmuta a un proveedor de respaldo configurado (OpenRouter, Gemini o Groq) y devuelve la respuesta igualmente.
- Autoalojamiento en infraestructura gratuita: el uso de long polling elimina la necesidad de dominio o IP publica, por lo que puede desplegarse en Render, Oracle Cloud Always Free, Raspberry Pi o un equipo domestico encendido de forma continua.
- Despliegue como servicio persistente: la unidad systemd incluida (`deploy/bot.service`) permite que el bot se reinicie automaticamente tras caidas o reinicios del servidor, adecuado para un asistente siempre disponible.
- Despliegue en contenedor: el `docker-compose.yml` monta `data/` y `session/` como volumenes externos, lo que permite reconstruir la imagen sin perder la base de datos ni la sesion de DeepSeek.
- Persistencia en entorno con disco efimero: al configurar `DATABASE_URL` con PostgreSQL (por ejemplo Neon), el historial sobrevive a reinicios de instancias PaaS que no conservan disco local.
- Uso sin navegador en produccion: al establecer `DEEPSEEK_WEB_ENABLED=false` y usar exclusivamente una API compatible con OpenAI, se elimina la dependencia de Playwright, cookies y sesiones de navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifica VRAM ni requisitos de GPU, ya que el bot no ejecuta inferencia local: delega en proveedores externos.
- El README indica que Google Cloud `e2-micro` (1 GB de RAM) es suficiente para el despliegue, y que Oracle Cloud Always Free ofrece una instancia ARM Ampere con 4 CPU y 24 GB de RAM.
- Cabe en hardware de consumo: Raspberry Pi o un portatil antiguo con conexion a internet y alimentacion continua.
- Opciones de despliegue: Docker y docker compose, systemd con `deploy/bot.service`, servicios PaaS (Render, Koyeb, Fly.io) y VPS convencionales (Hetzner, Timeweb, Aeza).
- Latencia y throughput: no disponibles; dependen de la latencia de red hacia el proveedor externo y de los limites del proveedor.
- Advertencia operativa del autor: desde IP de centro de datos, DeepSeek web muestra con mayor frecuencia la verificacion anti-robot y puede rechazar peticiones.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje, sino una aplicacion cliente de Telegram; no existen alternativas comparables en terminos de parametros, contexto o rendimiento de inferencia dentro de la informacion proporcionada. Como referencia funcional, el propio README menciona el proyecto `Tsuev/opencode-deepseek`, del que se reutiliza la libreria de acceso a DeepSeek web, pero no se ofrecen datos comparativos adicionales.

## Limitaciones y advertencias

- El acceso a DeepSeek web es no oficial y depende de token y cookies de una cuenta personal; puede dejar de funcionar si DeepSeek cambia su mecanismo de autenticacion o de proof-of-work.
- El inicio de sesion se realiza desde la IP domestica del usuario; desde IP de centro de datos aumenta la probabilidad de verificacion anti-robot y de rechazo de peticiones.
- El token de DeepSeek es un secreto y el README advierte explicitamente de no incluirlo en git.
- En servidores gratuitos con disco temporal, el historial debe almacenarse en PostgreSQL externo; de lo contrario se pierde al reiniciar la instancia.
- Los servicios PaaS gratuitos pueden suspenderse por inactividad; el autor propone un pinger externo cada 10 minutos sobre `/health`.
- Hugging Face Spaces con Docker requiere suscripcion PRO segun el README, por lo que no es una via de despliegue gratuita.
- La licencia no esta disponible, lo que impide confirmar condiciones de uso comercial o de redistribucion.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto e idioma propias del modelo, ya que estas dependen del proveedor externo utilizado.
- El repositorio no contiene pesos ni artefactos de modelo; no debe tratarse como un modelo evaluable con benchmarks.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Bobby821/ai-tg-bot
- Proyecto de referencia para el acceso a DeepSeek web: https://github.com/Tsuev/opencode-deepseek
- BotFather (creacion de bots de Telegram): https://t.me/BotFather
- userinfobot (obtencion del ID de Telegram): https://t.me/userinfobot
- DeepSeek chat web: https://chat.deepseek.com
- Neon (PostgreSQL gratuito): https://neon.com
- Render: https://render.com
- OpenRouter: https://openrouter.ai
