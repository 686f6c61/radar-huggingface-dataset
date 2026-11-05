# Aranguren-luis/opencode-cloud

## Resumen

OpenCode Cloud no es un modelo de lenguaje, sino un Space de Hugging Face que empaqueta OpenCode, un agente de programación con IA de código abierto que actúa como cliente de más de 75 proveedores de LLM (Anthropic, OpenAI, Google Gemini y el propio OpenCode Zen, entre otros). El repositorio `Aranguren-luis/opencode-cloud` contiene únicamente la capa de despliegue: un `Dockerfile` que instala OpenCode mediante su script oficial y lo ejecuta en modo web (`opencode web`) escuchando en `0.0.0.0:4096`, protegido con autenticación básica HTTP.

El propósito es ofrecer una interfaz de agente de código accesible desde el navegador sin infraestructura propia, aprovechando la capa gratuita de CPU de Hugging Face Spaces. El usuario duplica el Space, introduce sus claves de API como secretos y obtiene un entorno de trabajo efímero en `/home/user/workspace` donde puede clonar repositorios, editar ficheros y ejecutar tareas de refactorización o corrección de código.

Es relevante como ejemplo de patrón de despliegue ("glue code") para herramientas de agentes en Spaces, no como artefacto de inferencia: no incluye pesos, no ejecuta modelos localmente y toda la capacidad de generación proviene de APIs externas. Cualquier evaluación de rendimiento o calidad debe hacerse sobre el proveedor de LLM configurado, no sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (contenedor Docker con OpenCode en modo web; no es un modelo neuronal) |
| Parametros totales | No disponible (no contiene pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del proveedor de LLM configurado por el usuario) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (la interfaz y el agente dependen del LLM subyacente) |
| Licencia | MIT |
| Formato de pesos | No aplica (Dockerfile; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no entrena ni distribuye ningún modelo. Su arquitectura es la de un Space de tipo `docker` con `app_port: 4096`: el `Dockerfile` instala OpenCode con el script oficial y lanza el servidor web, que Hugging Face expone a través de su proxy inverso. La autenticación se resuelve con HTTP basic auth usando el secreto `OPENCODE_SERVER_PASSWORD` (usuario fijo `opencode`), y las credenciales de los proveedores LLM se inyectan como secretos (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` u `OPENCODE_API_KEY`).

No hay datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia que analizar. El único componente técnico reseñable es la orquestación del agente: OpenCode gestiona sesiones, panel de ficheros, modo plan (tecla `Tab`) y el comando `/init`, que genera un `AGENTS.md` para persistir contexto entre sesiones. El estado vive en el sistema de ficheros del contenedor, de modo que se pierde en cada reinicio.

## Capacidades

- Agente de programación conversacional: creación, refactorización y corrección de código mediante instrucciones en lenguaje natural.
- Soporte de más de 75 proveedores de LLM a través de la configuración de claves de API.
- Modo plan: el agente redacta un plan antes de modificar ficheros.
- Panel de ficheros con navegación del workspace, subida de código y editor en el navegador.
- Ejecución de comandos de shell en el contenedor, incluido `git clone`, `git commit` y `git push` sobre repositorios públicos.
- Generación de `AGENTS.md` mediante `/init` para conservar contexto del proyecto entre sesiones.
- Compartición de sesiones mediante enlace público (`/share`).
- Autenticación básica HTTP para proteger la interfaz web.
- No incluye inferencia local: sin GPU, sin ejecución de modelos en el propio Space.

## Casos de uso

- Prototipado rápido de un agente de código sin infraestructura: duplicar el Space, añadir la clave de API y disponer de un entorno web en unos 60-90 segundos, útil para pruebas puntuales o demos.
- Revisión y refactorización de repositorios pequeños: clonar el proyecto en `workspace`, pedir cambios acotados y hacer commit antes de que el Space se reinicie.
- Evaluación comparativa de proveedores LLM: al soportar más de 75 proveedores, permite probar el mismo prompt y flujo de agente con distintas APIs cambiando únicamente el secreto correspondiente.
- Formación y demos docentes: el modo plan y el panel de ficheros facilitan mostrar a estudiantes cómo razona un agente antes de tocar código, sin instalar nada en local.
- Trabajo ocasional desde dispositivos ligeros: al ejecutarse en el navegador y en CPU remota, permite editar y ejecutar comandos desde un portátil sin entorno de desarrollo configurado.
- Generación de documentación de proyecto: usar `/init` para producir un `AGENTS.md` y sesiones posteriores para mantener contexto, útil en equipos que rotan entre tareas.
- Depuración compartida: crear una sesión, resolver un error y compartir la URL con un compañero para revisar el razonamiento y los comandos ejecutados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni evalúa ningún modelo; el rendimiento depende exclusivamente del proveedor de LLM configurado y de los límites de la capa gratuita de CPU de Hugging Face, que el autor describe como limitada para refactorizaciones multi-fichero pesadas.

## Requisitos de hardware

- VRAM: no aplica; el Space se ejecuta en CPU y no realiza inferencia local.
- GPU: no necesaria ni disponible en la capa gratuita; el autor indica explícitamente "CPU only, no GPU".
- Hardware del Space: capa gratuita de CPU de Hugging Face; se puede escalar a `cpu-upgrade` o `cpu-performance` de pago.
- Despliegue: Hugging Face Spaces (SDK Docker, puerto 4096). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI porque no hay modelo que servir.
- Latencia y throughput: no disponibles; dependen de la API del proveedor LLM y del throttling de la capa gratuita.
- Persistencia: efímera; el Space se suspende tras unas 48 horas de inactividad y el sistema de ficheros se pierde en cada reinicio. Se recomienda hacer `git push` con frecuencia o usar el add-on de almacenamiento persistente.
- Alternativa de autoalojamiento mencionada por el autor: Oracle Cloud Always Free (24 GB de RAM, 4 núcleos ARM).

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| OpenCode Cloud (este repositorio) | Space Docker con agente OpenCode | No aplica | Depende del proveedor | MIT | Efímero, CPU gratuita, requiere claves de API externas |
| OpenCode autoalojado | Aplicación local o en servidor propio | No aplica | Depende del proveedor | MIT (OpenCode) | Sin límites de la capa gratuita ni suspensión por inactividad |
| Claude Code / asistentes CLI propietarios | Agente de código de proveedor único | No disponible | No disponible | Propietaria | Sin soporte multi-proveedor documentado en la información disponible |
| Cursor / IDE con agente integrado | Entorno de desarrollo con IA | No disponible | No disponible | Propietaria | Integración en el editor, no desplegable como Space |

La comparación se limita a categoría de producto, no a métricas de modelo, porque este repositorio no contiene pesos evaluables.

## Limitaciones y advertencias

- No es un modelo: no puede evaluarse con MMLU, HumanEval ni GSM8K; cualquier cifra de calidad corresponde al LLM externo configurado.
- Dependencia total de APIs de terceros: sin clave válida de Anthropic, OpenAI, Gemini u OpenCode Zen, el agente no funciona.
- Coste oculto en las APIs: el Space es gratuito, pero el consumo del proveedor LLM se factura aparte.
- Persistencia efímera: los ficheros y sesiones se pierden tras reinicios o tras unas 48 horas de inactividad; hay que hacer `git push` con frecuencia.
- Sin puertos de salida adicionales: solo se pueden clonar repositorios públicos y no se pueden exponer servicios extra.
- Rendimiento limitado por la CPU gratuita y el throttling de Hugging Face en tareas multi-fichero.
- Riesgo de alucinación y de comandos destructivos inherente a cualquier agente de código; el modo plan mitiga pero no elimina este riesgo.
- Seguridad: la protección es únicamente autenticación básica HTTP con una contraseña elegida por el usuario; no se documentan controles adicionales de acceso ni aislamiento reforzado.
- Licencia MIT del repositorio, pero OpenCode es propiedad de Anomaly y su uso se rige por los términos del proyecto original; verificar condiciones antes de un despliegue comercial.
- Idiomas soportados no documentados; dependen del LLM subyacente y de la interfaz de OpenCode.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aranguren-luis/opencode-cloud
- OpenCode (sitio oficial): https://opencode.ai
- Documentación de OpenCode: https://opencode.ai/docs/
- OpenCode Zen (modelos curados): https://opencode.ai/zen
- Consola de Anthropic: https://console.anthropic.com
- Claves de API de OpenAI: https://platform.openai.com/api-keys
- Claves de API de Google AI Studio: https://aistudio.google.com/apikey
