# Dumi2025/hdfs-line-anomaly-deberta-v3-base

## Resumen

El modelo `hdfs-line-anomaly-deberta-v3-base` es un clasificador de texto especializado en la detección de anomalías a nivel de línea en logs del sistema de ficheros distribuido HDFS (Hadoop Distributed File System). Lo desarrolla el usuario Dumi2025 y se obtiene mediante fine-tuning completo de `microsoft/deberta-v3-base`, un transformer encoder con 184,4 millones de parámetros. La tarea es binaria: cada línea de log se etiqueta como normal (0) o anómala (1), heredando la etiqueta oficial del bloque HDFS_v1 al que pertenece.

Su particularidad es que no clasifica la línea de forma aislada, sino que la presenta como un par de frases junto a un resumen del bloque completo (cada mensaje del bloque con su recuento). Esta contextualización es determinante: según la model card, el F1 de anomalía pasa de 0,0488 en modo línea aislada a 0,9496 con contexto de bloque, con un ROC-AUC de 0,9993. El modelo está pensado para integrarse en pipelines de observabilidad y monitorización de sistemas distribuidos.

El modelo se publicó el 11 de noviembre de 2026, tiene 0 descargas y 0 likes en Hugging Face, y no declara licencia ni idiomas soportados. Su utilidad práctica depende de replicar exactamente el preprocesado de entrada descrito por el autor (sustitución de identificadores y resumen de bloque), por lo que es un artefacto de investigación más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, fine-tuning completo) |
| Parámetros totales | 184.423.682 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el máximo de DeBERTa-v3-base, no declarado en la información) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación de texto binaria (text-classification) |
| Etiquetas | 0 = Normal, 1 = Anomalía |
| Umbral de decisión | 0,2439 (`anomaly_threshold` en config.json) |
| Modelo base | microsoft/deberta-v3-base |
| Tamaño del repo | 0,7 GB |
| Dataset de entrenamiento | LogHub HDFS_v1, 20.000 bloques muestreados |

## Arquitectura y entrenamiento

La arquitectura subyacente es DeBERTa-v3-base, un transformer encoder con atención desacoplada y embeddings de posición relativos, adaptado aquí como clasificador de secuencias. El fine-tuning es completo (no LoRA ni adaptadores): 2,0 épocas, batch de 16, learning rate 2e-05, precisión fp32, sobre una NVIDIA RTX PRO 4500 Blackwell en RunPod (run `deberta-hdfs-linectx-42`, 2026-11-11T01:53:19). No se documenta el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de los 20.000 bloques muestreados de LogHub HDFS_v1.

La innovación técnica no está en la arquitectura sino en la formulación de la entrada: cada ejemplo es un par de frases `(línea de log, resumen de bloque)`. El preprocesado normaliza identificadores (bloques → `BLK`, IPs → `IP`, números largos → `N`) y el resumen de bloque lista cada mensaje una vez con su recuento (formato `3x mensaje ; ...`). La etiqueta oficial del bloque HDFS_v1 se propaga a cada línea. No se menciona RLHF, DPO ni decodificación especulativa, lo cual es coherente con un modelo discriminativo.

## Capacidades

- Clasificación binaria de líneas de log HDFS como normal o anómala.
- Detección contextual: aprovecha el resumen del bloque completo para desambiguar líneas que aisladas serían indistinguibles.
- Normalización robusta de entidades variables (IDs de bloque, IPs, números) mediante tokens especiales.
- Salida con probabilidad calibrada respecto a un umbral de decisión configurable (0,2439).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, solo etiquetas y puntuaciones.
- Capacidades multilingües no declaradas; el dominio es logs técnicos en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Monitorización de clústeres HDFS: clasificar en tiempo real cada línea de log como normal o anómala y disparar alertas cuando la probabilidad supere el umbral de 0,2439, con la ventaja de que el contexto de bloque reduce los falsos positivos respecto a un clasificador de línea aislada.
- Análisis forense de incidentes: procesar logs históricos de HDFS_v1 o de sistemas compatibles para localizar bloques con líneas anómalas y reconstruir la secuencia de eventos de un fallo.
- Enriquecimiento de pipelines de observabilidad: integrar el modelo como etapa de scoring en herramientas tipo ELK, Loki o Splunk, enviando pares `(línea, resumen de bloque)` y almacenando la probabilidad junto al evento.
- Filtrado previo a revisión humana: priorizar las líneas con mayor probabilidad de anomalía para que un operador las revise, reduciendo el volumen de inspección manual.
- Investigación en detección de anomalías en logs: servir como baseline reproducible con métricas publicadas (F1 de anomalía 0,9496, ROC-AUC 0,9993) para comparar con aproximaciones basadas en LLM o en modelos de secuencia.
- Validación de preprocesados alternativos: al depender críticamente del resumen de bloque, es útil para experimentar con distintas formas de contextualización y medir su impacto en el F1.
- Detección de anomalías en logs de sistemas distribuidos similares: con reentrenamiento o adaptación del esquema de normalización, puede aplicarse a otros logs estructurados con agrupación por transacción o bloque.

## Benchmarks y rendimiento

Resultados declarados en la model card, validación cruzada de 5 folds por bloque y a nivel de línea:

| Métrica | Con contexto de bloque | Línea aislada |
|---|---|---|
| F1 de anomalía | 0,9496 | 0,0488 |
| Precisión de anomalía | 0,9419 | 0,0253 |
| Recall de anomalía | 0,9574 | 0,6486 |
| ROC-AUC | 0,9993 | 0,5267 |
| IC 95 % del F1 (bootstrap por bloque) | [0,9337, 0,9642] | no disponible |

Umbral de decisión: 0,2439. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,5 GB en fp16 para los 184,4 millones de parámetros, más el overhead de activaciones según la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento se realizó en una NVIDIA RTX PRO 4500 Blackwell.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con PyTorch, ONNX Runtime, Text Embeddings Inference (TEI) o servicios de inferencia tipo Hugging Face Inference Endpoints. No se documenta compatibilidad con vLLM, llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hdfs-line-anomaly-deberta-v3-base | 184,4 M | no disponible | Clasificación con contexto de bloque | no disponible | Hugging Face |
| LogBERT / baselines HDFS de la literatura | no disponible | no disponible | Modelos de secuencia sobre logs | no disponible | no disponible |
| Clasificador DeBERTa-v3-base sin fine-tuning específico | 184,4 M | no disponible | Clasificación genérica | MIT (modelo base) | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Dependencia crítica del preprocesado: el rendimiento cae drásticamente sin el resumen de bloque (F1 de 0,9496 a 0,0488), por lo que cualquier despliegue debe replicar exactamente el esquema de normalización y construcción de pares.
- Licencia no declarada: no hay autorización explícita para uso comercial; es imprescindible contactar con el autor antes de integrarlo en producción.
- Sesgo de dominio: entrenado únicamente sobre 20.000 bloques de HDFS_v1, por lo que la generalización a otros sistemas de logs no está validada.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos; el umbral de 0,2439 está calibrado para este dataset concreto y puede requerir reajuste.
- Idiomas no declarados: el modelo está orientado a logs técnicos en inglés y no se ha evaluado en otros idiomas.
- Contexto máximo no documentado: secuencias de bloque muy largas podrían truncarse sin que se indique el comportamiento esperado.
- Madurez baja: 0 descargas y 0 likes, publicación reciente y sin validación independiente; el intervalo de confianza del F1 ([0,9337, 0,9642]) refleja variabilidad entre bloques que conviene tener en cuenta.
- El modelo base DeBERTa-v3-base tiene su propia licencia (MIT), pero la licencia del fine-tuning no se ha especificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/hdfs-line-anomaly-deberta-v3-base
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset LogHub HDFS_v1 (DOI): https://doi.org/10.5281/zenodo.8196385
