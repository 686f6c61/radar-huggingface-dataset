# smlflg/Perplexity

## Resumen

`smlflg/Perplexity` es un repositorio publicado en HuggingFace que, a pesar de su identificador, no contiene un modelo de lenguaje con pesos entrenados, sino el codigo fuente de un servicio denominado "Local Answer Engine". Se trata de una aplicacion API-first que reproduce el flujo de trabajo caracteristico de Perplexity: buscar, extraer, clasificar, sintetizar y citar fuentes para responder a una consulta en lenguaje natural. El autor es el usuario `smlflg` y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, con etiqueta `region:us` y sin licencia declarada.

El problema que aborda es la orquestacion de un pipeline de respuesta aumentada por recuperacion (RAG) sobre fuentes web o corporativas, con un enfasis explicito en la trazabilidad: si el modelo de lenguaje configurado no esta disponible, el servicio devuelve una respuesta extractiva citada en lugar de generar contenido no respaldado. Esta arquitectura de degradacion controlada es relevante para despliegues en produccion donde la verificabilidad de las afirmaciones es un requisito, no un extra.

Al no distribuir pesos, el repositorio no define arquitectura de red, numero de parametros, longitud de contexto ni cuantizaciones propias: todos esos atributos dependen del proveedor de LLM que se configure en tiempo de ejecucion (por defecto un endpoint compatible con OpenAI y, como alternativa, un modelo servido localmente con Ollama). La ficha que sigue documenta, por tanto, el comportamiento del servicio y no las caracteristicas de un modelo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio no publica pesos ni arquitectura de red neuronal; es un servicio de orquestacion (FastAPI) sobre modelos de terceros |
| Parametros totales | No disponible (no se distribuye modelo propio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Depende del LLM configurado: por defecto `LLM_MODEL=openai/gpt-5.5`; alternativa `FALLBACK_LLM_MODEL=ollama/qwen3.6:35b` |
| Tipos de cuantizacion | No disponible (no se publican pesos) |
| Idiomas soportados | No disponibles. El README incluye ejemplos de consulta en aleman e ingles; el soporte real depende del LLM y del buscador configurados |
| Licencia | No disponible |
| Formato de pesos | No disponible (no se publican pesos; el servicio consume APIs o endpoints locales) |
| Pipeline declarado en HuggingFace | No disponible |
| Etiquetas del repositorio | `region:us` |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento asociado a este repositorio: no hay dataset, no hay fases de preentrenamiento, ajuste supervisado, RLHF ni DPO documentadas. Lo que se describe en la model card es una topologia de servicio en cinco etapas encadenadas (search, extract, rank, synthesize, cite) implementada como API HTTP. La capa de busqueda admite dos proveedores: Tavily, que se activa por defecto cuando existe `TAVILY_API_KEY`, y SearXNG como alternativa, apuntada mediante la variable `SEARXNG_URL`. La capa de sintesis admite un proveedor principal compatible con OpenAI y un proveedor secundario servido con Ollama.

La innovacion tecnica destacable no es de modelado sino de diseno de sistema: el servicio implementa una ruta de degradacion explicita. Cuando el LLM configurado no responde, la aplicacion no genera texto libre, sino que compone una respuesta extractiva a partir de las fuentes ya clasificadas, manteniendo las citas. Ademas, incorpora un modo completamente offline (`OFFLINE_MODE=true`) que utiliza fuentes de prueba integradas y no realiza llamadas a Tavily, SearXNG, OpenAI ni Ollama, lo que permite ejecutar pruebas de humo y validar el pipeline sin red ni claves de API. La interfaz incluye endpoints de salud y de introspeccion de proveedores (`/health` y `/v1/providers`) y un canal de streaming basado en Server-Sent Events en `/v1/answer/stream`.

## Capacidades

- Pipeline completo de respuesta con recuperacion: busqueda, extraccion de contenido, clasificacion de fuentes, sintesis y generacion de citas.
- API REST sobre FastAPI con endpoints `/health`, `/v1/providers` y `/v1/answer`.
- Streaming de respuestas token a token mediante Server-Sent Events en `/v1/answer/stream`.
- Modos de respuesta configurables por peticion: el ejemplo de la model card utiliza `"mode":"balanced"`; no se documentan en el material disponible otros modos ni su semantica.
- Conmutacion automatica de proveedor de busqueda: Tavily cuando hay clave, SearXNG como respaldo.
- Conmutacion de proveedor de LLM: endpoint principal compatible con OpenAI y respaldo local con Ollama.
- Respuesta extractiva con citas cuando el LLM no esta disponible, en lugar de generacion sin respaldo.
- Modo offline con fuentes de prueba integradas para entornos sin conectividad ni credenciales.
- Soporte multilingue a nivel de consulta (hay ejemplos en aleman e ingles), condicionado al LLM subyacente.
- No se documenta soporte de tool calling o function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en el material disponible.

## Casos de uso

- Buscador de respuestas con citas sobre documentacion interna: el servicio puede indexar fuentes corporativas accesibles por HTTP, clasificarlas por relevancia y devolver una sintesis con enlaces verificables, lo que encaja con equipos que necesitan justificar cada afirmacion ante auditoria.
- Alternativa autoalojada a Perplexity con privacidad de consultas: al poder apuntar la busqueda a una instancia propia de SearXNG y la sintesis a un modelo local con Ollama, las consultas y los documentos recuperados no salen de la infraestructura controlada por la organizacion.
- Atencion al cliente con trazabilidad de fuentes: las respuestas se acompanan de las fuentes clasificadas que las sustentan, de modo que un operador o un sistema de control de calidad puede revisar de donde proviene cada dato antes de darlo por valido.
- Asistente de investigacion documental: para revisiones bibliograficas o analisis de mercado, el flujo de extraccion y clasificacion permite condensar varias fuentes en una respuesta con referencias, reduciendo el trabajo manual de contraste.
- Componente de RAG dentro de un pipeline mayor: al exponerse como API REST, el servicio puede actuar como microservicio de recuperacion y sintesis invocado desde un orquestador, un chatbot o una herramienta interna.
- Despliegue en entornos air-gapped o de pruebas: con `OFFLINE_MODE=true` se puede validar el comportamiento del pipeline, las rutas de la API y el formato de las citas sin dependencias externas ni coste de API.
- Integracion en herramientas de desarrollo: el endpoint de streaming SSE permite construir interfaces de respuesta progresiva en editores, paneles de operaciones o asistentes internos sin reimplementar la logica de recuperacion.
- Moderacion y control de contenido: la ruta de respuesta extractiva cuando el LLM falla ofrece un modo degradado predecible, util en sistemas donde una alucinacion no verificable es peor que una respuesta incompleta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de respuesta, latencia, throughput ni evaluaciones comparativas, y al no distribuirse pesos propios no procede aplicar metricas de modelo como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El servicio de orquestacion en si es una aplicacion Python gestionada con `uv` y servida con `uvicorn`; puede ejecutarse en CPU sin GPU cuando la sintesis se delega a una API remota.
- Si se usa el proveedor de respaldo local con Ollama, los requisitos pasan a depender del modelo de 35 000 millones de parametros referenciado en la configuracion. Estimacion orientativa calculada a partir del numero de parametros, no medida: en FP16 en torno a 70 GB de VRAM; en 8 bits en torno a 35 GB; en 4 bits en torno a 18-20 GB.
- GPU recomendadas segun ese escenario estimado: A100 80 GB o H100 para precision completa; dos A100 40 GB en paralelo para FP16; una RTX 4090 de 24 GB podria alojar la variante de 4 bits, con holgura limitada para el contexto largo.
- Si se opta por un modelo de menor tamano servido con Ollama, el servicio puede caber en GPU de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) segun la cuantizacion elegida.
- Opciones de despliegue documentadas: `uv run uvicorn answer_engine.api:app` con recarga en desarrollo, integracion con Ollama como backend de sintesis local y cualquier endpoint compatible con la API de OpenAI como backend remoto. No se documentan integraciones con vLLM, TGI, llama.cpp directo ni imagenes de contenedor.
- Utilidades de desarrollo incluidas: `uv sync` para dependencias, `uv run pytest` para pruebas y `uv run ruff check` para analisis estatico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El repositorio no es un modelo, por lo que la comparacion se plantea frente a otros proyectos con la misma funcion declarada (motor de respuestas con busqueda y citas). No se dispone de datos verificados de parametros, contexto ni licencia de las alternativas dentro de la informacion proporcionada, por lo que esas celdas quedan como no disponibles.

| Proyecto | Tipo | Parametros propios | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| `smlflg/Perplexity` (Local Answer Engine) | Servicio de orquestacion RAG sobre LLM de terceros | No disponible (ninguno) | No disponible | No disponible | Busqueda, extraccion, clasificacion, sintesis y citas; degradacion a respuesta extractiva; modo offline |
| Perplexica | Alternativa autoalojada a Perplexity | No disponible | No disponible | No disponible | Interfaz de busqueda conversacional con fuentes citadas |
| Morphic | Motor de respuestas con IA | No disponible | No disponible | No disponible | Interfaz de busqueda generativa con multiples proveedores |
| Khoj | Asistente personal sobre documentos y web | No disponible | No disponible | No disponible | Recuperacion sobre corpus propio y busqueda web con integraciones de cliente |

Nota metodologica: las tres alternativas citadas son proyectos reales de codigo abierto orientados al mismo problema, pero sus parametros, contexto, licencia y rendimiento no se han verificado en esta ficha y no deben tomarse como datos confirmados.

## Limitaciones y advertencias

- El repositorio no publica pesos, por lo que no puede evaluarse como modelo: cualquier comparacion de calidad, sesgo o rendimiento depende enteramente del LLM que se conecte.
- No se declara licencia. Sin licencia explicita no hay autorizacion clara de uso comercial ni de redistribucion, lo que constituye un riesgo juridico relevante para produccion.
- El repositorio registra 0 descargas y 0 likes, sin senales de adopcion ni mantenimiento por parte de terceros. No hay garantia de soporte ni de actualizaciones.
- Dependencia de servicios externos de pago en la configuracion por defecto: Tavily para la busqueda y un endpoint compatible con OpenAI para la sintesis. Esto introduce coste variable, limites de cuota y exposicion de las consultas a terceros.
- Riesgo de alucinacion heredado del LLM de sintesis. El diseno mitiga el caso extremo (LLM no disponible) mediante respuesta extractiva, pero no elimina la posibilidad de que el modelo genere afirmaciones mal atribuidas cuando si responde.
- La calidad de las citas depende por completo de la etapa de clasificacion de fuentes; no se documentan metricas de precision de recuperacion ni de atribucion.
- Cobertura de idiomas no declarada formalmente. Solo hay ejemplos de consulta en aleman e ingles, insuficientes para afirmar soporte multilingue amplio.
- No se documentan mecanismos de autenticacion, limitacion de tasa, control de acceso ni gestion de secretos mas alla de las variables de entorno, aspectos criticos para exponer el servicio fuera de `127.0.0.1`.
- Los proveedores y modelos de referencia del README (`openai/gpt-5.5`, `ollama/qwen3.6:35b`, `ollama/qwen3.6`) deben tratarse como valores de ejemplo de la configuracion; conviene verificar su disponibilidad real y sus condiciones de uso antes de fijarlos en produccion.
- El modo offline esta pensado para pruebas de humo con fuentes de prueba integradas; no es un sustituto de un despliegue con corpus real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/Perplexity
- Documentacion interactiva de la API (una vez levantado el servicio): http://127.0.0.1:8000/docs
- Ejemplo de flujo de trabajo local descrito en la model card: `uv sync`, `uv run uvicorn answer_engine.api:app --reload --host 127.0.0.1 --port 8000`
- No se han encontrado papers, blogs, repositorios complementarios ni demos en los resultados de busqueda web proporcionados. Los unicos resultados devueltos corresponden a un sitio no relacionado (WhatsApp Web) y se descartan por no guardar relacion con el modelo.
