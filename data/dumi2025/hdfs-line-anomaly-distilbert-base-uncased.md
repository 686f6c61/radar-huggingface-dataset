# Dumi2025/hdfs-line-anomaly-distilbert-base-uncased

## Resumen

Dumi2025/hdfs-line-anomaly-distilbert-base-uncased es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning completo) de distilbert/distilbert-base-uncased, orientado a la detección de anomalías a nivel de línea en logs del sistema de ficheros distribuido HDFS. Lo publica el usuario Dumi2025 en Hugging Face y su función es etiquetar cada línea de log como normal o anómala, heredando la etiqueta oficial de bloque de HDFS_v1.

La innovación del modelo no está en la arquitectura, sino en la formulación de la entrada: en lugar de clasificar líneas aisladas, recibe un par de frases formado por la línea de log y un resumen del bloque al que pertenece (con IDs, IPs y números largos enmascarados y las plantillas de mensaje del bloque agregadas con sus recuentos). Según la model card, este contexto de bloque eleva la F1 de anomalía de 0,0530 (línea aislada) a 0,9530 en validación cruzada de 5 particiones agrupadas por bloque.

Se trata de un modelo pequeño y especializado: 66.955.010 parámetros, pesos en safetensors, repositorio de 0,3 GB y pipeline de text-classification. Su relevancia es práctica para pipelines de observabilidad y análisis de logs, donde un clasificador ligero por línea puede complementar o sustituir reglas heurísticas, a costa de depender de que se construya correctamente el resumen de bloque en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT), fine-tuning completo para clasificación de secuencias |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT admite hasta 512 tokens, dato no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precisión original; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés; los logs HDFS son en inglés técnico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Etiquetas | 0 = Normal, 1 = Anomaly |
| Umbral de decisión | 0,9940 (`anomaly_threshold` en config.json) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder de 6 capas obtenido por destilación de BERT-base, con 66.955.010 parámetros, sobre el que se aplica un fine-tuning completo con una cabeza de clasificación binaria. No hay innovaciones arquitectónicas propias; el valor diferencial está en el preprocesado de la entrada y en el esquema de etiquetado.

La entrada es un par de frases `(log line, block summary)`. En ambas se sustituyen los identificadores de bloque por `BLK`, las direcciones IP por `IP` y los números largos por `N`; el resumen de bloque enumera cada mensaje del bloque una sola vez con su recuento en el formato `3x mensaje ; ...`. La etiqueta de cada línea es la etiqueta oficial de bloque de HDFS_v1, heredada por todas las líneas del bloque. El entrenamiento se realizó sobre 20.000 bloques muestreados de LogHub HDFS_v1, con fine-tuning completo, 2,0 épocas, batch 16, learning rate 5e-05 y precisión bf16 sobre una NVIDIA RTX PRO 4500 Blackwell (RunPod), en la ejecución `distilbert-hdfs-linectx-42` del 11 de noviembre de 2026. No se documenta en la información disponible el uso de RLHF, DPO ni de un conjunto de validación independiente distinto de la validación cruzada reportada.

## Capacidades

- Clasificación binaria de líneas de log HDFS en normal o anómala, con salida de probabilidad y umbral de decisión configurable (0,9940 por defecto).
- Aprovechamiento de contexto de bloque: la misma línea puede clasificarse de forma distinta según el resumen del bloque en el que aparece, lo que permite detectar anomalías que solo son visibles en secuencia.
- Normalización de entidades volátiles (IDs de bloque, IPs, números largos) para reducir el ruido y favorecer la generalización entre bloques.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe no documentada; el vocabulario uncased del modelo base y el dominio (logs HDFS en inglés técnico) apuntan a un uso en inglés.

## Casos de uso

- Monitorización de clusters HDFS en producción: el modelo etiqueta cada línea de log con su probabilidad de anomalía y permite alertar sobre bloques con líneas anómalas, usando el resumen de bloque que ya se puede construir a partir del flujo de logs.
- Enriquecimiento de pipelines de observabilidad: integrado como etapa de clasificación por línea dentro de sistemas tipo ELK o Loki, marca líneas sospechosas antes de que lleguen a los dashboards o al sistema de alertas.
- Triaje previo a análisis forense: al reducir el volumen de líneas candidatas mediante el umbral de 0,9940, el equipo de guardia puede revisar solo las líneas señaladas en lugar de miles de líneas normales.
- Detección de fallos silenciosos en bloques: al condicionar la clasificación al resumen del bloque, detecta patrones anómalos que una línea aislada no revela, como secuencias de reintentos o mensajes de error poco frecuentes combinados.
- Generación de datasets etiquetados: el modelo puede usarse para preetiquetar logs HDFS de nuevos entornos y acelerar la creación de conjuntos de entrenamiento supervisados, con revisión humana de las predicciones de alta confianza.
- Validación de reglas heurísticas: comparar las predicciones del modelo con las reglas existentes de detección permite identificar reglas obsoletas o falsos positivos sistemáticos en el sistema de monitorización.

## Benchmarks y rendimiento

Resultados reportados en la model card, validación cruzada de 5 particiones agrupadas por bloque, evaluados por línea de log:

| Metrica | Con contexto de bloque | Linea aislada |
|---|---|---|
| f1_anomaly | 0,9530 | 0,0530 |
| precision_anomaly | 0,9215 | 0,0279 |
| recall_anomaly | 0,9867 | 0,5239 |
| roc_auc | 0,9990 | 0,5381 |
| F1 IC 95 % (bootstrap por bloque) | [0,9247, 0,9732] | no disponible |
| Umbral de decisión | 0,9940 | no disponible |

No se han publicado resultados frente a otros modelos de detección de anomalías en logs (DeepLog, LogAnomaly, LogBERT u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 66,96 M de parámetros; en fp32 ocupa aproximadamente 0,27 GB de pesos, en fp16 unos 0,13 GB y en int8 unos 0,07 GB. Sumando activaciones y overhead de runtime, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: para lotes grandes, una NVIDIA A100, H100 o L4; para despliegues modestos, una RTX 4090, RTX 3090 o incluso una T4. El entrenamiento reportado se hizo en una RTX PRO 4500 Blackwell.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4060, etc.), y también en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un modelo de transformers con pesos safetensors, es compatible con Hugging Face Transformers, Text Embeddings Inference (TEI) y servidores de inferencia basados en transformers; no se documentan artefactos GGUF ni soporte verificado en llama.cpp u Ollama, por lo que su uso en esas herramientas requeriría conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/hdfs-line-anomaly-distilbert-base-uncased | 66,96 M | no disponible | Clasificación de línea con contexto de bloque (HDFS) | no disponible | Hugging Face, safetensors |
| distilbert/distilbert-base-uncased | 66,96 M | 512 tokens (modelo base) | Modelo general de lenguaje, sin fine-tuning para logs | Apache 2.0 (modelo base) | Hugging Face |
| Modelos de detección de anomalías en logs (DeepLog, LogAnomaly, LogBERT) | no disponible | no disponible | Detección secuencial o semántica de anomalías en logs | no disponible | Repositorios de investigación, no comparables directamente en esta ficha |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El rendimiento reportado (F1 de anomalía 0,9530) depende críticamente de disponer del resumen de bloque correcto en tiempo de inferencia; sin él, la F1 cae a 0,0530, lo que hace el modelo prácticamente inútil en modo de línea aislada.
- El modelo se entrenó y evaluó únicamente sobre HDFS_v1 (20.000 bloques muestreados); no hay evidencia de generalización a otros sistemas de logs (Hadoop genérico, Spark, sistemas de microservicios) ni a otros formatos.
- La etiqueta de anomalía se hereda del bloque, de modo que una línea normal dentro de un bloque anómalo se etiqueta como anómala; esto puede generar ruido en el etiquetado a nivel de línea y sesgar el modelo hacia el recall (0,9867) frente a la precisión (0,9215).
- El umbral de decisión de 0,9940 es muy alto y está calibrado para este conjunto; en producción puede requerir recalibración según la distribución de logs del entorno.
- No hay información sobre sesgos, riesgos de alucinación en el sentido generativo (el modelo no genera texto) ni sobre la licencia, por lo que el uso comercial no está garantizado y debe consultarse con el autor.
- El modelo base es uncased y de dominio inglés; no se documenta soporte multilingüe.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/hdfs-line-anomaly-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset LogHub HDFS_v1: https://doi.org/10.5281/zenodo.8196385
