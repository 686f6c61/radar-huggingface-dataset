# nesoai/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de vision publicado en Hugging Face bajo el identificador nesoai/Qwen3.8-27B. Segun su model card, forma parte de la familia Qwen3.8 y se presenta como la generacion mas capaz de la serie abierta de Qwen hasta la fecha, construida sobre la base arquitectonica de Qwen3.5. Se trata de un modelo denso de 27.781.427.952 parametros (27,8B) con una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y una arquitectura hibrida que combina capas de atencion lineal Gated DeltaNet con capas de atencion con compuertas (Gated Attention).

El modelo esta orientado a tareas de codificacion, trabajo profesional, investigacion y flujos agenticos de horizonte largo, con soporte nativo de comprension de imagenes y video. Incluye control flexible del modo de razonamiento: el thinking mode esta activado por defecto, puede desactivarse por peticion, y la profundidad de razonamiento se ajusta mediante el parametro reasoning_effort, con retencion del contexto de razonamiento de mensajes previos via preserve_thinking.

Su relevancia actual radica en que ofrece capacidades multimodales y agenticas en un formato denso y desplegable, con licencia Apache 2.0. Conviene senalar que el repositorio esta publicado por el usuario nesoai, no por la organizacion oficial de Qwen, y que el propio autor remite a Qwen Cloud para una version hospedada con contexto de 1M por defecto y herramientas integradas, anunciada como proxima. A fecha de la metadata disponible el repositorio acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de vision; layout hibrido: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 64 capas en total |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos se distribuyen en safetensors y el autor indica compatibilidad con Transformers, vLLM, SGLang y TokenSpeed |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers); tamano del repositorio: 55,6 GB |

Datos adicionales de configuracion declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimension oculta | 5.120 |
| Token embedding | 248.320 (padded) |
| Salida del LM | 248.320 (padded) |
| Capas totales | 64 |
| Gated DeltaNet (atencion lineal) | 48 cabezas lineales para V, 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV; dimension de cabeza 256; dimension de RoPE 64 |
| FFN (intermedio) | 17.408 |
| MTP (Multi-Token Prediction) | Entrenado con multiples pasos |
| Etapa de entrenamiento | Pre-entrenamiento y post-entrenamiento |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido con codificador de vision. El bloque se repite 16 veces y cada bloque contiene tres capas con Gated DeltaNet seguidas de una capa con Gated Attention, lo que da las 64 capas declaradas. Las capas Gated DeltaNet actuan como atencion lineal con 48 cabezas para V y 16 para QK con dimension de cabeza 128, mientras que las capas Gated Attention usan 24 cabezas de consulta y solo 4 de clave-valor con dimension de cabeza 256 y RoPE de dimension 64. Esta mezcla implica que unicamente 16 de las 64 capas mantienen un mecanismo de atencion clasico, lo que reduce el crecimiento de la cache KV respecto a un modelo puramente atencional de la misma profundidad. El FFN tiene dimension intermedia de 17.408 y el vocabulario de entrada y salida es de 248.320 entradas con padding.

El modelo se entrena en dos etapas, pre-entrenamiento y post-entrenamiento, e incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, un mecanismo habitualmente asociado a decodificacion especulativa y a la prediccion de varios tokens por paso. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas concretas de RLHF o DPO; solo se indica de forma implicita un post-entrenamiento orientado al razonamiento, dado que el thinking mode se controla con reasoning_effort y preserve_thinking. Tampoco se documenta la estrategia de entrenamiento del codificador de vision ni el volumen de datos de imagen y video utilizados. Los datos de cuantizacion, el proceso de alineacion y los detalles del ampliado de contexto hasta 1M tokens no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante reasoning_effort y retencion del contexto de razonamiento historico mediante preserve_thinking.
- Codificacion y codificacion agentica en terminal: la model card incluye la categoria "Coding" y el benchmark Terminal Bench 2.1 (Terminus) entre sus evaluaciones.
- Comprension nativa de imagen y video, incluidos diagramas STEM, documentos y videos de duracion de horas, segun el autor.
- Ejecucion agentica de horizonte largo: planificacion autonoma y gestion de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares, segun la model card.
- Soporte de MTP (Multi-Token Prediction) como capacidad arquitectonica orientada a la generacion de varios tokens.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling, ni el listado de idiomas soportados, ni capacidades de audio.

## Casos de uso

- Codificacion agentica en terminal: el modelo esta evaluado especificamente en Terminal Bench 2.1 (Terminus) y declara mejoras en ejecucion autonoma y manejo de feedback del entorno, por lo que encaja en agentes que resuelven tareas de shell, depuracion y gestion de repositorios de forma iterativa.
- Asistencia de programacion en produccion: con 27,8B de parametros densos, contexto nativo de 262.144 tokens y licencia Apache 2.0, puede desplegarse en infraestructura propia para autocompletado, revision de codigo y refactors sobre repositorios completos sin depender de APIs externas.
- Analisis de documentos tecnicos extensos: la ventana de contexto permite ingerir manuales, expedientes o documentacion normativa de cientos de miles de tokens en una sola pasada, con la opcion de ampliar hasta 1M tokens.
- Comprension de diagramas e informes cientificos: su codificador de vision permite interpretar diagramas STEM y documentos escaneados, util en asistencia a investigacion y en extraccion estructurada de informacion.
- Procesado de video de larga duracion: el autor declara soporte nativo de video de hasta horas, aplicable a analisis de grabaciones, resumen de reuniones o supervision de contenido.
- Flujos de trabajo profesionales con razonamiento ajustable: para tareas de analisis financiero, legal o tecnico se puede activar reasoning_effort alto y preserve_thinking para mantener el hilo de razonamiento entre turnos, y desactivar el thinking mode en tareas de baja latencia.
- Migracion a servicio gestionado: el autor remite a Qwen Cloud para una version hospedada con contexto de 1M por defecto y herramientas integradas, util como ruta de escalado sin mantenimiento de infraestructura.
- Evaluacion comparativa interna: al ser un modelo denso de 27,8B con licencia permisiva, sirve como linea base reproducible frente a modelos propietarios en pruebas de codificacion y agentes.

## Benchmarks y rendimiento

La model card incluye una seccion "Benchmark Results" con una tabla de "Text Performance" que contiene, al menos, una categoria "Coding" con la fila "Agentic terminal coding" evaluada con Terminal Bench 2.1 (Terminus). Las columnas de comparacion son Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, los valores numericos quedaron truncados en la informacion proporcionada, por lo que no se reproducen aqui.

| Benchmark | Categoria | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Coding / agentic terminal coding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han facilitado resultados numericos adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No se deben asumir cifras no publicadas.

## Requisitos de hardware

- Pesos en precision de 16 bits: el repositorio ocupa 55,6 GB, coherente con 27,78B de parametros a 2 bytes por parametro. La inferencia requiere anadir activaciones y cache, por lo que se recomienda un acelerador de 80 GB (H100 80 GB, A100 80 GB) o dos GPUs de 48 GB con paralelismo tensorial.
- Pesos en 8 bits (estimacion aritmetica a partir del numero de parametros, sin confirmacion de soporte en la informacion disponible): aproximadamente 28 GB, lo que situaria el modelo en el rango de una A100 40 GB o L40S 48 GB, con margen limitado para cache.
- Pesos en 4 bits (estimacion aritmetica, sin confirmacion de soporte): aproximadamente 14 GB, lo que permitiria ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 5090 (32 GB), siempre que existan pesos cuantizados compatibles.
- La arquitectura hibrida con Gated DeltaNet limita la atencion clasica a 16 de las 64 capas, lo que reduce la presion de memoria de la cache KV frente a un transformer puramente atencional de 64 capas; no se dispone de cifras medidas de consumo de cache.
- Opciones de despliegue confirmadas por el autor: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se confirma compatibilidad con llama.cpp, Ollama, TGI ni formatos GGUF en la informacion proporcionada.
- Latencia y throughput: no disponibles. El modelo incorpora MTP entrenado con multiples pasos, lo que habilita tecnicamente decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

Los unicos modelos comparables citados en la model card son los que aparecen como columnas de su tabla de benchmarks. No se dispone de sus especificaciones en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B (este modelo) | 27,8B densos | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | Pesos en Hugging Face (safetensors) | Tabla publicada, valores no disponibles |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Columna de comparacion, valores no disponibles |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Columna de comparacion, valores no disponibles |
| Muse Glimmer-30B | no disponible (el nombre sugiere ~30B) | no disponible | no disponible | no disponible | Columna de comparacion, valores no disponibles |
| Opus4.6 Max | no disponible | no disponible | no disponible (propietario, presumiblemente) | no disponible | Columna de comparacion, valores no disponibles |

No se dispone de informacion suficiente para establecer una comparativa tecnica rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Procedencia del repositorio: el modelo esta publicado por el usuario nesoai, no por la organizacion oficial de Qwen. La model card reproduce contenido de la familia Qwen y enlaza a Qwen Cloud, por lo que conviene verificar la autenticidad e integridad de los pesos antes de usarlos en produccion.
- Cero adopcion registrada: el repositorio tiene 0 descargas y 0 likes en la metadata consultada, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Idiomas: no se documenta la lista de idiomas soportados ni el comportamiento esperado en castellano. El rendimiento multilingue es, por tanto, desconocido.
- Alucinacion: no se publican tasas de alucinacion ni resultados de evaluacion de veracidad. Como en cualquier modelo generativo, existe riesgo de fabricacion de datos, especialmente en tareas de investigacion y resumen de documentos largos.
- Sesgos: no se documentan los datos de entrenamiento ni los procesos de alineacion, por lo que no es posible evaluar sesgos demograficos, culturales o linguisticos.
- Ambito de contexto: el contexto nativo es de 262.144 tokens, pero la extension hasta 1.000.000 se anuncia para la version hospedada en Qwen Cloud, no necesariamente para estos pesos. El rendimiento en contextos muy largos no esta verificado con datos publicos.
- Modalidades: el soporte de vision y video se declara en la model card, pero no se aportan metricas de evaluacion multimodal en la informacion disponible.
- Cuantizacion y formatos: no se confirma la existencia de pesos GGUF, AWQ o GPTQ, lo que limita el despliegue en herramientas orientadas a esos formatos.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero es responsabilidad del usuario verificar la cadena de custodia de los pesos y el cumplimiento de cualquier termino adicional de la familia Qwen.
- Fechas: la metadata indica creacion el 2026-09-10, fecha posterior a la ventana habitual de publicaciones conocidas; conviene contrastar la informacion con la fuente oficial antes de citarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nesoai/Qwen3.8-27B
- Qwen Cloud: https://www.qwencloud.com
- Resumen de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, a su paper o a repositorios asociados. Las busquedas devolvieron paginas griegas sin relacion con el modelo (Skroutz, tellows, ClarityCheck, SLM Recruitment).
