# SaylorTwift/openhands

## Resumen

SaylorTwift/openhands no es un modelo de IA: es un espejo de solo lectura del repositorio de GitHub `OpenHands/OpenHands`, la plataforma de desarrollo dirigida por agentes de OpenHands (y origen del paquete pip oficial `openhands`). El repositorio de Hugging Face no contiene pesos, tokenizer ni checkpoints; su tamano declarado es de 0,0 GB, con 0 descargas y 0 likes en el momento de la consulta. Se aloja en el Hub unicamente por visibilidad, y el propio autor indica que el repositorio canonico, el rastreador de incidencias y las pull requests viven en GitHub.

Lo que si contiene es la base de Agent Canvas, un centro de control autoalojado para agentes de programacion y automatizaciones. La plataforma permite ejecutar el agente OpenHands (open source) o agentes de terceros como Claude Code, Codex y Gemini, siempre que implementen el Agent-Client Protocol (ACP), sobre backends locales, contenedores Docker, maquinas virtuales o infraestructura cloud. Entre sus funciones estan las automatizaciones programadas o disparadas por webhooks e integraciones con Slack, GitHub, Linear, Notion y Datadog.

Su relevancia actual es la de una pieza de infraestructura, no la de un modelo: permite "traer tu propio LLM" (bring your own model) mediante perfiles de LLM configurables y desacopla el agente del backend de ejecucion. Por tanto, cualquier dato de arquitectura, parametros o contexto depende del modelo de lenguaje que se conecte a la plataforma y no del contenido de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un espejo del repositorio OpenHands/OpenHands. La arquitectura efectiva depende del LLM que se configure) |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del LLM elegido mediante los perfiles de LLM de la plataforma) |
| Tipos de cuantizacion | no disponible (no contiene pesos que cuantizar) |
| Idiomas soportados | no disponible (la documentacion y la interfaz del proyecto estan en ingles; los idiomas de generacion dependen del LLM conectado) |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos; es codigo fuente en espejo) |
| ID en Hugging Face | SaylorTwift/openhands |
| Autor del espejo | SaylorTwift |
| Repositorio canonico | OpenHands/OpenHands (GitHub) |
| Tags declarados | agent, coding-agent, cli, llm, tool-use |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-16T10:39:47.000Z |
| Fecha de actualizacion | 2026-09-16T10:40:23.000Z |

## Arquitectura y entrenamiento

No existe entrenamiento asociado: este repositorio no es un artefacto de aprendizaje automatico, sino una copia de codigo fuente. No hay dataset, numero de tokens, fases de RLHF o DPO, ni innovaciones de atencion que describir. Cualquier afirmacion sobre arquitectura de red neuronal seria inaplicable a este contenido.

La arquitectura del software, segun la documentacion incluida, se organiza en torno a un servidor de agentes con backends intercambiables (local, Docker, maquina virtual, cloud) y una capa de interfaz denominada Agent Canvas, distribuida tambien como paquete npm `@openhands/agent-canvas`. El sistema ejecuta el agente OpenHands de serie, admite agentes de terceros mediante ACP (Claude Code, Codex, Gemini u otros compatibles) y ofrece un motor de automatizaciones que combina disparadores por programacion temporal o por webhook con conectores a servicios externos. El proyecto se declara en estado beta y vinculado a un programa incubator. La model card disponible esta truncada, por lo que no se puede confirmar el detalle completo del diseno interno.

## Capacidades

Las siguientes capacidades corresponden a la plataforma, no a un modelo de lenguaje:

- Ejecucion de agentes de programacion autoalojados, con opcion de funcionamiento continuo en servidores propios.
- Seleccion de backend de ejecucion: local, contenedor Docker, maquina virtual o infraestructura corporativa; tambien OpenHands Cloud y OpenHands Enterprise como opciones gestionadas.
- Soporte de agentes de terceros mediante Agent-Client Protocol (ACP): Claude Code, Codex, Gemini y cualquier agente compatible.
- Uso de cualquier LLM subyacente mediante perfiles de LLM configurables (bring your own model).
- Automatizaciones programadas o activadas por eventos (webhooks), con flujos predefinidos.
- Integraciones con servicios de terceros como Slack, GitHub, Linear, Notion y Datadog.
- Interfaz de control autoalojada (Agent Canvas) con cambio entre backends sin perder el contexto de la conversacion.
- Distribucion como paquete pip (`openhands`) y como paquete npm (`@openhands/agent-canvas`).
- Capacidades a nivel de modelo (generacion de texto, razonamiento, vision, tool calling nativo): no disponibles en este repositorio, dependen del LLM conectado.

## Casos de uso

- Triaje automatico de incidencias en GitHub: una automatizacion puede descomponer una issue entrante en tareas mas pequenas y asignarlas, usando los conectores de GitHub y el agente configurado. Es adecuado porque el disparador por webhook y la integracion con GitHub son funciones nativas de la plataforma.
- Generacion de informes periodicos publicados en Slack: una automatizacion con programacion temporal puede recopilar datos y publicar el resultado en un canal de Slack, sin intervencion manual.
- Agente de codificacion en pipelines de CI/CD: gracias al soporte de backend en contenedor Docker, el agente puede ejecutarse en un entorno aislado y efimero que se destruye al terminar la tarea.
- Equipo de agentes siempre activo en una maquina dedicada o en la nube: al ejecutarse en un servidor en lugar de un portatil, los agentes siguen trabajando aunque el equipo del desarrollador este apagado, lo que permite lanzarlos desde Slack, GitHub o Datadog.
- Orquestacion de varios agentes especializados: Agent Canvas permite alternar entre OpenHands, Claude Code, Codex o Gemini segun la tarea, manteniendo una unica interfaz de control y sin reconfigurar el flujo de trabajo.
- Despliegue self-hosted con cumplimiento interno: organizaciones que no pueden enviar codigo a servicios gestionados pueden ejecutar el servidor de agentes dentro de su propia infraestructura y conectar el LLM que cumpla sus politicas.
- Automatizacion de flujos con Linear o Notion: los conectores permiten sincronizar tareas y documentacion con el estado real del trabajo del agente.
- Evaluacion comparativa de agentes y modelos: al soportar multiples backends y perfiles de LLM, la plataforma sirve como banco de pruebas interno para medir que combinacion rinde mejor en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni artefactos evaluables, por lo que metricas como MMLU, HumanEval o GSM8K no son aplicables a su contenido. Cualquier cifra de rendimiento correspondiente al agente OpenHands o a Agent Canvas habria que consultarla en el repositorio canonico de GitHub, que no aporta datos numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM para inferencia: no aplicable al repositorio en si, ya que no incluye pesos. La VRAM necesaria depende exclusivamente del LLM que se conecte (por API remota, la VRAM local puede ser cero).
- GPU recomendadas: no disponibles para este repositorio. Si se ejecuta el LLM en local, la GPU requerida dependera de su tamano y cuantizacion (por ejemplo, modelos de 7B a 8B en cuantizacion de 4 bits caben en GPUs de consumo con 8-12 GB de VRAM; modelos grandes exigen A100, H100 o equivalentes). Estos valores no se especifican en la informacion proporcionada.
- Requisitos del servidor de agentes: al menos una maquina capaz de ejecutar el servidor de agentes, preferiblemente con Docker disponible para el aislamiento de los entornos de ejecucion; en el caso de Agent Canvas, tambien el runtime de Node.js asociado al paquete npm.
- Capacidad en GPU de consumo: el repositorio y la plataforma de agentes no consumen GPU por si mismos; solo lo hara el modelo que se conecte.
- Opciones de despliegue: instalacion mediante el paquete pip `openhands`, interfaz Agent Canvas via npm, ejecucion en local, Docker, maquinas virtuales, infraestructura propia, OpenHands Cloud u OpenHands Enterprise. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Dependen del LLM subyacente, del backend de ejecucion y de la red.

## Comparativa con modelos similares

La categoria correcta no es la de modelos de lenguaje, sino la de plataformas de agentes de programacion. La informacion proporcionada solo permite comparar sobre el propio Agent Canvas y los agentes que declara soportar; el resto de datos no estan disponibles.

| Plataforma o agente | Tipo | Relacion con este repositorio | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| OpenHands (este repositorio) | Plataforma de agentes autoalojada | Es el contenido del espejo; agente por defecto de Agent Canvas | MIT | no disponible |
| Claude Code | Agente de terceros compatible con ACP | Se puede ejecutar desde Agent Canvas como backend alternativo | no disponible | no disponible |
| Codex | Agente de terceros compatible con ACP | Se puede ejecutar desde Agent Canvas como backend alternativo | no disponible | no disponible |
| Gemini | Agente de terceros compatible con ACP | Se puede ejecutar desde Agent Canvas como backend alternativo | no disponible | no disponible |

No se dispone de datos de parametros, contexto ni evaluaciones para ninguno de los agentes de terceros mencionados, y sus licencias y condiciones de uso deben verificarse en sus fuentes oficiales antes de un despliegue en produccion.

## Limitaciones y advertencias

- No es un modelo: no se puede cargar con transformers, vLLM ni llama.cpp, y no sirve para tareas de inferencia directa.
- Es un espejo de solo lectura: el autor pide explicitamente que las incidencias y contribuciones se envien al repositorio de GitHub, no al Hub, por lo que cualquier actividad en la pagina de Hugging Face puede quedar sin atencion.
- Posible desincronizacion respecto al repositorio canonico: al tratarse de una copia, puede no reflejar los ultimos cambios de `OpenHands/OpenHands`.
- Estado beta declarado en la propia documentacion (badge de estado y programa incubator), lo que implica posible inestabilidad de API y cambios incompatibles.
- Licencia MIT para el contenido del repositorio, pero los agentes de terceros, las APIs de LLM y los servicios integrados tienen sus propias licencias y condiciones; su uso puede implicar costes y restricciones adicionales.
- Riesgo de seguridad operativa: los agentes ejecutan comandos y manipulan ficheros, de modo que un aislamiento deficiente (por ejemplo, ejecucion sin contenedor) puede exponer el sistema anfitrion.
- Idiomas: la documentacion y la interfaz estan en ingles; no se declaran capacidades multilingues propias.
- La model card disponible esta truncada, por lo que faltan secciones de la guia de autoalojamiento y otros detalles tecnicos.
- Los resultados de la busqueda web realizada no aportan informacion relevante sobre este repositorio: todas las entradas se refieren a ChatGPT y son ajenas al proyecto.
- Sesgos y alucinacion: no aplicables al repositorio, pero si al LLM que se conecte; la plataforma no impone mecanismos de verificacion de hechos por si misma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaylorTwift/openhands
- Repositorio canonico en GitHub: https://github.com/OpenHands/OpenHands
- Programa incubator: https://github.com/OpenHands/incubator-program
- Documentacion: https://docs.openhands.dev/
- Guia de autoalojamiento: https://docs.openhands.dev/openhands/usage/agent-canvas/backends (referencia de backends) y `docs/SELF_HOSTING.md` en el repositorio
- Agentes ACP: https://docs.openhands.dev/openhands/usage/agent-canvas/acp-agents
- Automatizaciones predefinidas: https://docs.openhands.dev/openhands/usage/agent-canvas/prebuilt-automations
- Configuracion de perfiles de LLM: https://docs.openhands.dev/openhands/usage/settings/llm-settings#llm-profiles
- Paquete npm de Agent Canvas: https://www.npmjs.com/package/@openhands/agent-canvas
- Slack de la comunidad: https://go.openhands.dev/slack y https://openhands.dev/joinslack
- Estado de CI: https://github.com/OpenHands/OpenHands/actions/workflows/ci.yml
