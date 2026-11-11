# Dumi2025/hdfs-line-anomaly-roberta-base

## Resumen

El modelo `Dumi2025/hdfs-line-anomaly-roberta-base` es un ajuste fino de `FacebookAI/roberta-base` publicado por el usuario Dumi2025 para la deteccion de anomalias a nivel de linea en registros (logs) del sistema de ficheros distribuido HDFS. El problema que aborda es concreto: clasificar cada linea de log como normal (etiqueta 0) o anomala (etiqueta 1), heredando la etiqueta oficial a nivel de bloque del dataset HDFS_v1. La innovacion principal no esta en la arquitectura, sino en la formulacion de la entrada: el modelo recibe un par de secuencias (la linea de log y un resumen del bloque al que pertenece) en lugar de la linea aislada.

Esta formulacion es relevante porque, segun los datos del autor, la deteccion de lineas aisladas es practicamente inutil en este corpus (F1 de anomalia de 0,0491), mientras que al aportar contexto del bloque el F1 sube a 0,9245 y el ROC-AUC a 0,9946. Es decir, el modelo demuestra que el contexto agregado del bloque es la senal discriminante, no el contenido de la linea individual.

Arquitectonicamente es un transformer encoder RoBERTa-base con 124.647.170 parametros, sin parametros activos (no es MoE), distribuido en formato safetensors con un tamano de repositorio de 0,5 GB. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas soportados. Es, por tanto, un artefacto de investigacion acotado a una tarea muy especifica de observabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base), clasificacion de pares de secuencias |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-base soporta hasta 512 tokens por secuencia; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (el autor solo publica safetensors en bf16/fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | FacebookAI/roberta-base |
| Tarea | text-classification (deteccion de anomalias en logs) |
| Etiquetas | 0 = Normal, 1 = Anomalia |
| Umbral de decision | 0,0001 (`anomaly_threshold` en `config.json`) |
| Dataset de entrenamiento | LogHub HDFS_v1, 20.000 bloques muestreados |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) de `FacebookAI/roberta-base`, un transformer encoder de 12 capas y 124,6 millones de parametros. La entrada se formula como un par de secuencias `(log line, block summary)`: la linea de log con identificadores de bloque, IPs y numeros largos sustituidos por los tokens `BLK`, `IP` y `N`, y un resumen del bloque que lista cada mensaje una sola vez acompanado de su recuento (formato `3x message ; ...`). La cabeza de clasificacion produce una probabilidad que se compara con un umbral muy bajo (0,0001) para decidir la etiqueta de anomalia.

El entrenamiento se realizo sobre 20.000 bloques muestreados de LogHub HDFS_v1, con 2,0 epocas, tamano de lote 16, tasa de aprendizaje 3e-05 y precision bf16, sobre una NVIDIA RTX PRO 4500 Blackwell en RunPod (ejecucion `roberta-hdfs-linectx-42`, 2026-11-11T07:12:18). No se documenta el uso de RLHF, DPO ni decodificacion especulativa; es un fine-tuning supervisado convencional de clasificacion. La validacion se hizo con 5-fold cross-validation agrupada por bloque, lo que evita fuga de informacion entre lineas del mismo bloque.

## Capacidades

- Clasificacion binaria de lineas de log HDFS como normal o anomala.
- Aprovechamiento de contexto de bloque mediante pares de secuencias, lo que permite desambiguar lineas que aisladas serian indistinguibles.
- Normalizacion de entidades: sustitucion de IDs de bloque, IPs y numeros largos por tokens genericos (`BLK`, `IP`, `N`).
- Manejo de resumenes de bloque con recuentos de mensajes (`3x message ; ...`).
- Salida de probabilidad calibrada contra un umbral configurable (`anomaly_threshold`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues.
- No se documenta capacidad de generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Monitorizacion de clusters HDFS en produccion: el modelo puede puntuar cada linea de log entrante contra el resumen del bloque en curso y disparar alertas cuando la probabilidad supera el umbral, con un F1 de anomalia reportado de 0,9245 en validacion cruzada.
- Triaje de incidentes en observabilidad: al heredar la etiqueta del bloque, permite priorizar bloques con lineas anomalas y reducir el ruido de alertas en sistemas de logging a gran escala.
- Analisis forense de fallos historicos: dado un volcado de logs HDFS, el modelo clasifica linea a linea y permite reconstruir que bloques presentaron comportamiento anomalo, usando el resumen de bloque como contexto.
- Enriquecimiento de pipelines de deteccion existentes: puede integrarse como etapa de clasificacion supervisada junto a heuristicas o modelos no supervisados, aportando una probabilidad calibrada por linea.
- Investigacion en deteccion de anomalias en logs: sirve como linea base reproducible (formulacion linea + contexto de bloque) para comparar con enfoques basados en secuencias, transformers de logs o metodos no supervisados.
- Filtrado previo a almacenamiento: clasificar lineas para decidir cuales requieren retencion detallada o escalado a un sistema de analisis mas costoso, reduciendo volumen en entornos con millones de lineas diarias.
- Validacion de calidad de datos de logging: detectar bloques con patrones anomalos que puedan indicar problemas de instrumentacion o configuracion en el cluster.

## Benchmarks y rendimiento

Resultados reportados por el autor (5-fold cross-validation agrupada por bloque, por linea de log):

| Metrica | Con contexto de bloque | Linea aislada |
|---|---|---|
| f1_anomaly | 0,9245 | 0,0491 |
| precision_anomaly | 0,8857 | 0,0252 |
| recall_anomaly | 0,9669 | 0,9747 |
| roc_auc | 0,9946 | 0,5236 |
| F1 IC 95 % (bootstrap por bloque) | [0,8976, 0,9455] | no disponible |
| Umbral de decision | 0,0001 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo esta especializado en una tarea de clasificacion de logs y no en tareas generativas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en bf16/fp16 (124,6 M de parametros), y en torno a 0,25 GB en int8 si se cuantiza; el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090 o inferiores. Para lotes grandes, una A100 o H100 no aporta ventaja significativa por el reducido tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: `transformers` (Pipeline `text-classification`), TorchServe, ONNX Runtime, y `llama.cpp`/Ollama no aplican directamente por ser un encoder de clasificacion; vLLM y TGI estan orientados a modelos generativos y no son la via natural para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/hdfs-line-anomaly-roberta-base | 124,6 M | no disponible (RoBERTa-base hasta 512 tokens) | Clasificacion linea + bloque HDFS | no disponible | Hugging Face, 0 descargas |
| FacebookAI/roberta-base | 124,6 M | 512 tokens | Modelo base generico (MLM) | MIT (segun el modelo original) | Hugging Face, ampliamente usado |
| LogBERT y similares (deteccion de anomalias en logs) | no disponible | no disponible | Deteccion de anomalias en secuencias de log | no disponible | Repositorios de investigacion |

No se dispone de datos de rendimiento comparables de terceros en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia. Cualquier comparacion de F1 con otros metodos de deteccion de anomalias en HDFS requeriria resultados publicados que no se han facilitado.

## Limitaciones y advertencias

- Especificidad extrema: el modelo esta entrenado exclusivamente sobre HDFS_v1 y no se ha validado en otros sistemas de logging; su generalizacion a otros dominios es desconocida.
- Dependencia del resumen de bloque: sin el contexto de bloque, el rendimiento cae drasticamente (F1 de 0,0491 en linea aislada), por lo que el pipeline debe construir el resumen correctamente.
- Umbral muy bajo (0,0001): la calibracion es agresiva y prioriza recall (0,9669) sobre precision (0,8857); en produccion puede generar falsos positivos si la distribucion de datos difiere.
- Licencia no declarada: no se especifican terminos de uso comercial; debe contactarse con el autor antes de un despliegue productivo.
- Idiomas no declarados: la tarea es sobre logs en ingles tecnico; no hay soporte multilingue documentado.
- Riesgo de sobreajuste al muestreo: solo 20.000 bloques y 2,0 epocas; el intervalo de confianza del F1 ([0,8976, 0,9455]) sugiere variabilidad no despreciable.
- Sin datos de sesgo, alucinacion ni robustez frente a logs malformados o esquemas de normalizacion distintos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion independiente.
- Formato de pesos unico (safetensors): no hay variantes GGUF/ONNX publicadas por el autor, lo que limita el despliegue en entornos sin `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/Dumi2025/hdfs-line-anomaly-roberta-base
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Dataset LogHub HDFS_v1 (DOI): https://doi.org/10.5281/zenodo.8196385
