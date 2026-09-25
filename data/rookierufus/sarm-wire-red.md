# rookierufus/sarm-wire-red

## Resumen

SARM-wire-red es un modelo de recompensa (reward model) para manipulacion robotica, publicado por el usuario rookierufus en Hugging Face bajo el identificador `rookierufus/sarm-wire-red`. No se trata de un modelo de lenguaje ni de un modelo generativo de proposito general, sino de un componente de aprendizaje por refuerzo que estima el progreso de una tarea de manipulacion a partir de video. En concreto, es un modelo dual-head que predice simultaneamente la etapa de la tarea (stage) y el progreso fino (progress) dentro de ella.

El modelo se ha entrenado con el framework SARM (Stage-Aware Reward Modeling) integrado en LeRobot, usando el modo de anotacion `annotation_mode=dual`, sobre demostraciones bimanuales del robot SO-101. La tarea concreta sobre la que se ha ajustado este checkpoint es una tarea de manipulacion con cable ("wire red"), y la unica camara utilizada como entrada es la cenital (`observation.images.left_top`). El checkpoint final corresponde al paso 2500 con un tamano de lote de 128.

Su relevancia es acotada pero clara: los modelos de recompensa densos y conscientes de la etapa son un cuello de botella habitual en el aprendizaje por refuerzo de tareas de horizonte largo y con contacto fisico. Este checkpoint materializa la implementacion SARM descrita en el paper arXiv 2509.25358 sobre un caso real de robot bimanual de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (reward model dual-head basado en video; backbone no especificado en la informacion) |
| Parametros totales | 119.180.551 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el repo ocupa 0,5 GB) |
| Idiomas soportados | no disponible (usa anotaciones de subtareas en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria / framework | LeRobot |
| Pipeline declarado | reinforcement-learning |
| Camara de entrada | unicamente `observation.images.left_top` (cenital) |
| Checkpoint | paso 2500, batch 128 |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla el backbone concreto del modelo (encoder visual, transformer, etc.), solo que se trata de un reward model de tipo dual-head: una cabeza predice la etapa de la tarea y otra el progreso fino dentro de ella. Este diseno procede del framework SARM (Stage-Aware Reward Modeling), descrito en el paper arXiv 2509.25358, que plantea un modelado de recompensa basado en video que predice conjuntamente etapa y progreso apoyandose en anotaciones de subtareas en lenguaje natural. El objetivo declarado del framework es abordar tareas de manipulacion de horizonte largo y ricas en contacto, especialmente con objetos deformables, donde la calidad inconsistente de las demostraciones degrada el aprendizaje.

El entrenamiento de este checkpoint se realizo con la libreria LeRobot, usando el modo de anotacion dual y demostraciones bimanuales del robot SO-101. La entrada se limita a la camara cenital `observation.images.left_top`, lo que reduce la variabilidad de punto de vista pero tambien la informacion visual disponible. El proceso se ejecuto hasta el paso 2500 con un batch de 128. No se especifican en la model card ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos extremos quedan como no disponibles.

## Capacidades

- Prediccion de etapa de tarea: estima en que fase del procedimiento se encuentra la ejecucion a partir de observaciones de video.
- Prediccion de progreso fino: estima el grado de avance dentro de cada etapa, lo que permite generar senales de recompensa densas en lugar de binarias.
- Modelado de recompensa dual: las dos cabezas (stage y progress) se entrenan conjuntamente, tal y como define el modo `annotation_mode=dual`.
- Operacion sobre observaciones visuales: consume unicamente la vista cenital del montaje bimanual SO-101.
- Aprendizaje por refuerzo: pensado para integrarse como fuente de recompensa en bucles de RL de politicas de manipulacion.
- Anclaje en lenguaje natural: el framework SARM utiliza anotaciones de subtareas en lenguaje natural, aunque el idioma concreto soportado no se especifica.
- Tool calling / function calling: no disponible (no es una capacidad propia de este tipo de modelo).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision general o audio: no disponible; la vision se limita a la camara cenital indicada.

## Casos de uso

- Reward shaping en aprendizaje por refuerzo: el modelo se usa como funcion de recompensa densa durante el entrenamiento de una politica de manipulacion, sustituyendo recompensas binarias de exito/fracaso por una senal de progreso continuo que acelera la convergencia en tareas de horizonte largo.
- Evaluacion automatica de politicas: dado un episodio de video, el modelo puntua el progreso alcanzado, lo que permite comparar checkpoints o variantes de politica sin necesidad de etiquetado manual.
- Filtrado de datasets de demostraciones: al predecir etapa y progreso, permite detectar demostraciones incompletas, mal ejecutadas o inconsistentes, y descartarlas antes de reentrenar.
- Segmentacion automatica de tareas en etapas: la cabeza de stage puede emplearse para dividir episodios largos en subtareas, facilitando el entrenamiento jerarquico o el analisis post-mortem de fallos.
- Deteccion temprana de fallo y early stopping: si el progreso estimado deja de avanzar durante la ejecucion, el sistema puede abortar el episodio, ahorrando tiempo de robot y desgaste mecanico.
- Recompensa para RL en simulacion o gemelo digital: el modelo puede predecir progreso sobre renders de la camara cenital, lo que permite aprovechar el mismo reward model en entornos simulados antes del despliegue real.
- Anotacion asistida de nuevos datos: las predicciones de etapa y progreso pueden usarse como preetiquetado semi-automatico para acelerar la anotacion humana de nuevos episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye metricas numericas, y el paper de referencia SARM (arXiv 2509.25358) describe la evaluacion del framework en tareas como el plegado de camisetas, pero los resultados concretos de este checkpoint para la tarea de cable no se reproducen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision float32 los pesos ocupan aproximadamente 477 MB (119,18 M de parametros x 4 bytes); en float16/bf16, unos 238 MB. Sumando buffer de frames de video y activaciones, el consumo realista se situa entre 1 y 2 GB de VRAM para inferencia.
- GPU recomendadas para inferencia: cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: si, con holgura. El modelo es pequeno y no requiere aceleradores de datacenter para inferencia.
- GPU recomendadas para reentrenamiento: el entrenamiento se realizo con batch 128, lo que exige mas memoria; es razonable asumir GPUs de 24 GB o mas (RTX 4090, A5000, L40S) o A100/H100 para lotes grandes o entrenamiento mas rapido. Esta estimacion no procede de la informacion proporcionada y debe validarse.
- Opciones de despliegue: la libreria nativa es LeRobot, por lo que la carga y ejecucion se realizan a traves de ella. Las herramientas habituales de servido de LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints SARM directamente comparables ni sus especificaciones. Como referencia cualitativa, la implementacion publica del framework se encuentra en el repositorio `ilonajulczuk/sarm_behavior`, que contiene pesos SARM tanto en formato de rangos ponderados (solo anotaciones) como derivados de un checkpoint entrenado, pero no se aportan sus cifras de parametros, contexto o rendimiento para poder establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Especificidad de tarea: el checkpoint esta ajustado a una tarea concreta (cable "wire red" sobre SO-101). No es un reward model general y su uso fuera de ese dominio o ese robot no esta respaldado por la informacion disponible.
- Dependencia de un unico punto de vista: la entrada se limita a la camara cenital `observation.images.left_top`. Cualquier cambio de camara, calibracion o iluminacion puede degradar las predicciones.
- Licencia no disponible: la model card no declara licencia. Esto impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- Idiomas no especificados: aunque el framework SARM usa anotaciones en lenguaje natural, no se indica que idiomas soporta el modelo.
- Riesgo de sesgo en las demostraciones: el paper de referencia senala que la calidad inconsistente de las demostraciones es un problema central en este tipo de tareas; un reward model entrenado sobre datos sesgados o incompletos heredara esos sesgos.
- Riesgo de recompensa mal especificada: al ser una senal aprendida, puede ser explotada por la politica (reward hacking) si se usa como unica fuente de recompensa sin validacion externa.
- Sin benchmarks publicados: no hay evidencia cuantitativa en la informacion disponible sobre su precision de etapa o progreso, lo que dificulta estimar su fiabilidad en produccion.
- Ausencia de datos de contexto y cuantizacion: se desconoce la longitud de contexto temporal y los formatos de cuantizacion soportados, lo que limita las estimaciones de despliegue.
- Trazabilidad limitada: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rookierufus/sarm-wire-red
- Paper SARM (abstract): https://arxiv.org/abs/2509.25358
- Paper SARM (HTML v2): https://arxiv.org/html/2509.25358v2
- Repositorio de implementacion SARM: https://github.com/ilonajulczuk/sarm_behavior
- Dataset asociado (Plug_out_wire_red_2): https://huggingface.co/datasets/rookierufus/Plug_out_wire_red_2_20260917_154855/tree/main
- Dataset asociado (Plug_out_wire_red): https://huggingface.co/datasets/rookierufus/Plug_out_wire_red_20260917_134538
