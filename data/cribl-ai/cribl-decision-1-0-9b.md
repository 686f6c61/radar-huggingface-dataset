# cribl-ai/cribl-decision-1.0-9B

## Resumen

cribl-decision-1.0-9B es un adaptador LoRA (rank 32, alpha 64, 138,2 MB, 608 tensores) publicado por cribl-ai sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo generativo de texto al uso: se entrena para emitir **distribuciones de probabilidad sobre un conjunto cerrado de candidatos**. Dado un estado (un objeto JSON, texto plano o cualquier cadena), una o varias preguntas tipadas y una lista de opciones etiquetadas, el adaptador devuelve la probabilidad asignada a cada opción.

La innovación es el mecanismo de lectura (*readout*): en lugar de generar tokens, se ejecuta una pasada forward, se toma el estado oculto en la posición del token `(` que cierra la plantilla `Answer: (`, se restringen las filas de `lm_head` a los tokens de las etiquetas candidatas y se calcula un softmax sobre ese subconjunto. El resultado es una decisión estructurada y calibrable, no una cadena de texto que haya que parsear. Soporta tres tipos de decisión: `choice` (elección categórica más distribución), `noul` (probabilidad booleana) y `score` (distribución ordinal más valor esperado), con hasta 255 candidatos por pregunta.

Su relevancia práctica está en sustituir prompts de clasificación con modelos generativos por una cabecera de decisión determinista y de bajo coste: una sola pasada forward puede resolver varias preguntas empaquetadas en distintos slots `Answer k: (`. El adaptador se puede congelar o intercambiar de forma independiente del modelo base de 9B, lo que permite reutilizar la misma infraestructura de inferencia para distintas tareas de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-9B); detalles internos del base no disponibles |
| Parametros totales | Modelo base: 9B (aproximado, segun nombre del checkpoint). Adaptador: 138,2 MB en 608 tensores |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el autor no documenta esquemas de cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen3.5-9B en su revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Modelo base | Qwen/Qwen3.5-9B (revision `c20223623576`) |
| Tipo de adaptador | LoRA, rank 32, alpha 64 |
| Tipos de decision | `choice`, `noul`, `score` |
| Maximo de candidatos | 255 por pregunta (etiquetas A-Z y etiquetas de dos letras de un solo token: AA, AB, ...) |
| Modo de lectura | Estado oculto en el token `(` proyectado sobre las filas de `lm_head` de las etiquetas candidatas, mas softmax. Sin generacion de texto |
| Libreria | peft (transformers) |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 18 de octubre de 2026 (creacion), actualizado el 18 de octubre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un transformer decoder-only de 9B parametros del que la informacion disponible no detalla la arquitectura interna (numero de capas, atencion, ventana de contexto). Lo relevante a nivel de sistema es que cribl-decision **no modifica la cabeza de lenguaje**: reutiliza el `lm_head` nativo del base, restringiendo el calculo de logits a los tokens correspondientes a las etiquetas candidatas. Por eso el modelo se carga con `Qwen3_5ForConditionalGeneration` y no con `AutoModelForCausalLM`; en transformers >= 5.19 esta ultima resuelve a `Qwen3_5ForCausalLM`, que ignora el adaptador de forma silenciosa.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La unica informacion de evaluacion disponible es un conjunto held-out de 26 tareas y 29.743 registros. El diseno multi-slot permite empaquetar varias preguntas en una sola pasada, con la salvedad explicita de que las respuestas se tratan como **condicionalmente independientes**: no hay modelado de dependencias entre preguntas del mismo estado. El *readout* es determinista y de coste fijo, lo que elimina la variabilidad de la decodificacion autoregresiva y el coste de parsear la salida.

## Capacidades

- Eleccion categorica con distribucion completa: devuelve la opcion elegida y la probabilidad de cada candidato (`choice`).
- Decision booleana calibrada: probabilidad de una proposicion y de su negacion (`noul`).
- Puntuacion ordinal: distribucion sobre niveles ordenados mas valor esperado (`score`).
- Hasta 255 candidatos por pregunta mediante etiquetas alfabeticas y de dos letras.
- Multiples preguntas en una sola pasada forward, cada una leida en su slot `Answer k: (`.
- Entrada de estado flexible: objeto JSON, texto plano o cualquier cadena.
- Salida estructurada consumible por programas, sin generacion de texto ni parseo de lenguaje natural.
- No soporta tool calling ni function calling nativo: es una cabeza de decision, no un generador de llamadas a herramientas. Puede usarse como enrutador que alimente un orquestador externo.
- No soporta razonamiento multi-paso agentico ni modos de pensamiento (*thinking*); el modelo no genera cadena de razonamiento.
- Cobertura multilingue: no disponible (el autor no documenta idiomas).
- Vision y audio: no soportados.

## Casos de uso

- **Enrutado de tickets de soporte**: con un estado JSON con el mensaje del cliente y una pregunta del tipo "que departamento debe gestionarlo", el modelo devuelve `billing: 0,82 / technical support: 0,14 / sales: 0,04`. La distribucion permite fijar umbrales de escalado a humano cuando la confianza es baja, en lugar de aceptar siempre la clase mas probable.
- **Triaje de telemetria y observabilidad**: clasificar eventos o alertas en categorias operativas (critico, degradado, informativo) usando `score` para obtener un nivel ordinal y un valor esperado, lo que facilita ordenar una cola de incidentes por prioridad calculada.
- **Enrutado de herramientas en agentes**: dada la descripcion de la tarea y una lista de herramientas disponibles como candidatas, el adaptador selecciona cual invocar con su probabilidad asociada. El orquestador puede decidir entre ejecutar la herramienta, pedir aclaracion o abortar segun la masa de probabilidad.
- **Verificacion de politicas con decision booleana**: preguntas del tipo "cumple esta solicitud la politica de reembolso" devuelven una probabilidad (`noul`) que se usa como senal para autoaprobar, denegar o enviar a revision manual, con umbrales ajustables segun el coste del error.
- **Extraccion de decisiones estructuradas en lote**: el modelo esta pensado para pasadas forward sin decodificacion, por lo que encaja en procesos offline que clasifican grandes volumenes de registros (el conjunto de evaluacion del autor tiene 29.743 registros en 26 tareas) manteniendo coste por registro bajo y salida estable.
- **Puntuacion de riesgo o sentimiento ordinal**: con niveles definidos por el usuario (`low`, `medium`, `high`) el tipo `score` devuelve la distribucion y el valor esperado, util para paneles que necesitan un escalar continuo ademas de la clase dominante.
- **Consolidacion de varias preguntas sobre un mismo estado**: en un formulario de validacion con cinco comprobaciones sobre el mismo registro, el modo multi-slot resuelve las cinco en una sola pasada en lugar de cinco llamadas independientes.
- **Etiquetado asistido y control de calidad**: generar distribuciones sobre datos no etiquetados y priorizar para revision humana aquellos registros con entropia alta, reduciendo el coste de anotacion.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre un conjunto held-out de 26 tareas. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Registros evaluados | 29.743 |
| Tareas | 26 |
| Precision global (overall accuracy) | 78,41 % |
| Precision macro por tarea (task-macro accuracy) | 79,51 % |
| Macro-F1 macro por tarea | 79,45 % |

No se han publicado datos de latencia, throughput ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 138,2 MB; el coste real lo determina el modelo base de 9B que debe cargarse completo.
- VRAM estimada para inferencia en bf16: aproximadamente 18 GB solo de pesos, con overhead practico en torno a 20-24 GB.
- VRAM estimada en 8 bits: aproximadamente 9-10 GB. En 4 bits: aproximadamente 5-6 GB. Son estimaciones por tamano de parametros, no cifras publicadas por el autor.
- GPU recomendadas: A100 (40/80 GB) o H100 (80 GB) para bf16 con margen y concurrencia; L40S o RTX 6000 Ada (48 GB) como alternativa.
- GPU de consumo: una RTX 3090 o RTX 4090 (24 GB) permite bf16 muy justo y sin margen para lote; con cuantizacion de 4 bits cabe con holgura. Tarjetas de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super) requieren cuantizacion.
- Motores de despliegue: el *readout* necesita acceso directo al estado oculto y a las filas de `lm_head`, por lo que la ruta estandar es transformers + peft con un script propio (el autor incluye `example_readout.py`). Los servidores con API compatible con chat (vLLM, TGI, Ollama) no exponen esa ruta sin codigo adicional; si se sirve el base con esos motores, el adaptador no se aprovecha por si solo.
- En equipos con Triton sin `Python.h` (por ejemplo, nodos DGX) la primera pasada forward puede fallar en la compilacion JIT; el autor indica ejecutar `triton_utils.deregister_op_overrides()` antes de importar transformers.
- Latencia y throughput: no disponibles. Al no haber decodificacion autoregresiva, el coste por consulta es el de una unica pasada forward sobre el prompt.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores o modelos de decision estructurada comparables en el material proporcionado. La unica referencia directa es el modelo base sobre el que se aplica.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cribl-decision-1.0-9B | 9B (base) + 138,2 MB de adaptador LoRA | no disponible | 78,41 % de precision global en 26 tareas held-out (evaluacion del autor) | Apache 2.0 | HuggingFace, libreria peft |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible en la informacion | no disponible en la informacion | HuggingFace (modelo base requerido) |
| Alternativas de decision estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sensibilidad a la plantilla**: el autor advierte que usar un formato de prompt distinto al documentado degrada la precision de forma significativa. El formato (`Context:`, `Question:`, `Options:` con etiquetas `(A)`, y cierre `Answer: (`) forma parte del contrato del modelo.
- **No genera texto**: cualquier caso de uso que requiera explicaciones, resumenes o cadenas de razonamiento queda fuera del alcance del adaptador. Solo emite distribuciones sobre candidatos.
- **Dependencia estricta del checkpoint base**: el adaptador esta entrenado contra la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` de Qwen3.5-9B. Otra revision puede invalidar el comportamiento.
- **Trampa de carga silenciosa**: con transformers >= 5.19, `AutoModelForCausalLM` resuelve a `Qwen3_5ForCausalLM` e ignora el adaptador sin lanzar error. Hay que usar `Qwen3_5ForConditionalGeneration`.
- **Independencia condicional entre slots**: las preguntas empaquetadas en una misma pasada no modelan dependencias mutuas; si las preguntas estan correlacionadas, las probabilidades conjuntas no son fiables.
- **Calibracion no verificada de forma externa**: las metricas de 78,41 % de precision y 79,45 de Macro-F1 provienen de la evaluacion del propio autor sobre 26 tareas; no hay validacion independiente ni resultados en benchmarks estandar.
- **Candidatos acotados**: maximo de 255 opciones por pregunta y etiquetas restringidas al esquema A-Z mas etiquetas de dos letras de un solo token.
- **Idiomas no documentados**: se desconoce que idiomas cubre el adaptador; el modelo base no garantiza un rendimiento equivalente en castellano.
- **Riesgo de alucinacion trasladado al base**: al reutilizar el `lm_head` y las representaciones de Qwen3.5-9B, los sesgos del modelo base pueden reflejarse en las distribuciones. No hay informacion sobre sesgos evaluados.
- **Licencia**: el adaptador es Apache 2.0, pero el uso comercial del conjunto depende tambien de la licencia del modelo base Qwen3.5-9B, que no se detalla en la informacion disponible.
- **Madurez**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de terceros ni incidencias documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cribl-ai/cribl-decision-1.0-9B
- Script de ejemplo de lectura: https://huggingface.co/cribl-ai/cribl-decision-1.0-9B/blob/main/example_readout.py
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Organizacion en HuggingFace: https://huggingface.co/cribl-ai
- Sitio de Cribl: https://cribl.io/
- Documentacion de Cribl: https://docs.cribl.io/
- Pagina corporativa: https://cribl.io/about-us/
- Entrada en Wikipedia: https://en.wikipedia.org/wiki/Cribl.io
