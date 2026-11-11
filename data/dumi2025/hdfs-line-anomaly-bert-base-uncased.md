# Dumi2025/hdfs-line-anomaly-bert-base-uncased

## Resumen

`Dumi2025/hdfs-line-anomaly-bert-base-uncased` es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning completo) de `google-bert/bert-base-uncased` sobre la tarea de detección de anomalías a nivel de línea en logs del sistema de ficheros distribuido HDFS. Lo desarrolla el usuario Dumi2025 y resuelve un problema clásico de observabilidad: decidir si una línea concreta de log es normal o anómala, heredando la etiqueta oficial de bloque de HDFS_v1.

La innovación principal no está en la arquitectura (un BERT base estándar de 12 capas y 109,5 millones de parámetros) sino en la formulación de la entrada: se utiliza un par de secuencias `(línea de log, resumen del bloque)` donde el resumen agrega cada mensaje del bloque con su recuento (`3x mensaje ; ...`). Esta contextualización dispara el rendimiento frente a clasificar la línea aislada, pasando de un F1 de anomalía de 0,0540 a 0,9536 en validación cruzada de 5 folds por bloque.

El modelo es relevante para equipos de SRE y plataformas que necesiten etiquetar logs a nivel de línea con contexto de sesión, sin depender de modelos generativos grandes. Su tamaño reducido (0,4 GB en safetensors) permite despliegue en CPU y GPU de consumo, aunque la licencia no está declarada y las descargas son nulas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (12 capas, hidden 768, 12 cabezas de atención) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo base entrenado en inglés; la tarea es específica de logs HDFS) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `bert-base-uncased` con fine-tuning completo para clasificación binaria de secuencias (0 = Normal, 1 = Anomalía). La entrada es un sentence pair compuesto por la línea de log y un resumen del bloque al que pertenece; en el preprocesado se sustituyen IDs de bloque por `BLK`, direcciones IP por `IP` y números largos por `N`, y el resumen enumera cada mensaje del bloque una vez con su frecuencia (`3x mensaje ; ...`). La etiqueta objetivo es la etiqueta oficial de bloque de HDFS_v1, heredada por cada línea.

El entrenamiento se realizó sobre 20.000 bloques muestreados de LogHub HDFS_v1, con 2,0 épocas, batch 16, learning rate 3e-05 y precisión bf16, en una NVIDIA RTX PRO 4500 Blackwell (RunPod), con identificador de ejecución `bert-hdfs-linectx-42` y fecha 2026-11-11T08:17:55. No se documenta uso de RLHF, DPO ni decodificación especulativa; se trata de un ajuste supervisado convencional. La innovación técnica destacable es la ingeniería de entrada con contexto de bloque, que convierte una tarea casi imposible a nivel de línea aislada en una tarea resoluble.

## Capacidades

- Clasificación binaria de líneas de log HDFS como normal o anómala, con etiqueta heredada del bloque.
- Procesamiento de pares de secuencias (línea + resumen de bloque) con agregación de frecuencias de mensajes.
- Normalización de entidades variables (IDs de bloque, IPs, números) mediante tokens especiales `BLK`, `IP`, `N`.
- Salida con probabilidad calibrada y umbral de decisión configurable (`anomaly_threshold` en `config.json`, valor 0,9952).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre.
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento.
- Capacidad multilingüe no documentada; el modelo base es inglés y el dominio es específico de logs HDFS.

## Casos de uso

- Monitorización de clústeres HDFS en producción: el modelo etiqueta cada línea de log con la etiqueta del bloque, permitiendo alertar sobre anomalías a nivel de línea sin perder el contexto de sesión que aporta el resumen del bloque.
- Triaje de incidentes en SRE: dado un bloque de logs sospechoso, se puede pasar cada línea junto al resumen del bloque para localizar las líneas concretas que disparan la anomalía y priorizar la investigación.
- Enriquecimiento de pipelines de observabilidad: integración como etapa de clasificación previa a sistemas de correlación o alertas (por ejemplo, antes de enviar a un SIEM), aprovechando el bajo coste de un BERT base.
- Detección de anomalías en logs históricos: reprocesamiento batch de logs archivados de HDFS_v1 o de sistemas compatibles para construir etiquetas de entrenamiento o auditorías.
- Evaluación de calidad de datos de log: comparar la tasa de anomalías por bloque entre versiones de un sistema para detectar regresiones tras despliegues.
- Investigación en detección de anomalías: línea base reproducible con validación cruzada por bloque, útil para comparar técnicas de contextualización (resumen de bloque frente a línea aislada).
- Despliegue en entornos con recursos limitados: al ocupar 0,4 GB y ser un BERT base, puede ejecutarse en CPU o en GPU de consumo para clasificación de alto volumen con baja latencia.

## Benchmarks y rendimiento

Resultados de validación cruzada de 5 folds por bloque, a nivel de línea de log, según la model card:

| Metrica | Con contexto de bloque | Linea aislada |
|---|---|---|
| f1_anomaly | 0,9536 | 0,0540 |
| precision_anomaly | 0,9162 | 0,0304 |
| recall_anomaly | 0,9941 | 0,2412 |
| roc_auc | 0,9979 | 0,5294 |
| F1 95 % CI (block bootstrap) | [0,9263, 0,9735] | no disponible |
| Umbral de decision | 0,9952 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo está especializado en una tarea de clasificación de logs y no en tareas generativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB para los pesos (109,5 M de parámetros × 4 bytes) más activaciones y overhead del runtime; en bf16/fp16 se reduce a unos 0,22 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 4090, A100, H100 y también en GPUs de consumo modestas (GTX 1650, RTX 3050).
- Cabe en GPU de consumo sin problema; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch, `optimum`/ONNX Runtime, TorchServe o FastAPI con batching. No hay variantes GGUF publicadas para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un BERT base, se espera un throughput alto en GPU (cientos a miles de líneas por segundo con batching), pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/hdfs-line-anomaly-bert-base-uncased | 109,5 M | 512 tokens (BERT base) | Clasificación de líneas de log HDFS con contexto de bloque | no disponible | Hugging Face, 0 descargas |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face, ampliamente usado |
| LogBERT y variantes (referencia académica) | ~110 M (BERT base) | 512 tokens | Detección de anomalías en logs basada en BERT | varía por implementación | Repositorios académicos, no en Hugging Face |
| DeepLog / LogAnomaly (baseline clásico) | no disponible (LSTM) | secuencia de logs | Detección de anomalías en logs | varía | Código académico |

La comparativa directa con alternativas publicadas en Hugging Face no está disponible; los modelos de referencia en detección de anomalías de logs (LogBERT, DeepLog) son académicos y no ofrecen pesos listos para usar con la misma formulación de entrada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre HDFS_v1, el modelo puede sobrerrepresentar patrones de ese sistema y degradarse en otros logs.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y negativos; el umbral 0,9952 está calibrado para el conjunto de validación y puede no transferir a otros entornos.
- Limitación de contexto: 512 tokens de BERT base; bloques con muchos mensajes o líneas muy largas pueden truncarse y perder información del resumen.
- Dependencia del preprocesado: el rendimiento cae drásticamente si no se aplica la sustitución de IDs, IPs y números ni se construye el resumen de bloque (F1 de 0,0540 en línea aislada).
- Restricciones de licencia: la licencia no está declarada, por lo que no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de usarlo en producción.
- Idiomas: no documentados; el modelo base es inglés y la tarea es específica de logs HDFS en inglés.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria; tratar como artefacto experimental.
- No apto para generación de texto, tool calling ni tareas generales; su uso está acotado a clasificación binaria de líneas de log.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/hdfs-line-anomaly-bert-base-uncased
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset LogHub HDFS_v1 (DOI): https://doi.org/10.5281/zenodo.8196385
- LogHub (repositorio general): https://github.com/logpai/loghub
