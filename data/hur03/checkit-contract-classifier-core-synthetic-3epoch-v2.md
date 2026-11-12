# hur03/checkit-contract-classifier-core-synthetic-3epoch-v2

## Resumen

CheckIt es un modelo de clasificación multietiqueta de cláusulas de contratos laborales, desarrollado por el usuario hur03 y publicado en Hugging Face. Se trata de un fine-tuning de `klue/roberta-base` (RoBERTa adaptado al coreano por KLUE) con 110,6 millones de parámetros, entrenado para asignar hasta 10 etiquetas simultáneas a fragmentos de contratos de trabajo en coreano. No es un modelo generativo ni un asistente: es un clasificador discriminativo pensado para integrarse en un pipeline de revisión documental.

El problema que aborda es la clasificación automática de cláusulas contractuales, una tarea previa a cualquier análisis de legalidad o cumplimiento. El autor advierte explícitamente de que el modelo no determina si una cláusula es ilegal, sino que únicamente la etiqueta según un conjunto cerrado de 10 categorías definidas en el fichero `labels.json`. Es relevante en el contexto de herramientas de asistencia legal para el mercado laboral coreano, donde el volumen de contratos hace útil una primera pasada automática.

El modelo se entrenó con 3.710 documentos de entrenamiento (3.470 de un corpus "clean core" más 240 cláusulas sintéticas), 434 de validación y 446 de test, con 3 épocas, batch size 16, AdamW a learning rate 2e-5 y pérdida BCEWithLogitsLoss. Es un experimento de escala pequeña, con métricas de test de micro F1 0,860 y macro F1 0,849, y sin datos publicados sobre licencia, sesgos o validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base, `klue/roberta-base`) con cabeza de clasificación multietiqueta |
| Parametros totales | 110.625.802 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `klue/roberta-base`, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification (multi-label) |
| Modelo base | klue/roberta-base |
| Etiquetas | 10 clases definidas en `labels.json`, umbral 0,5 sobre sigmoid |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder RoBERTa base adaptado al coreano (KLUE), sobre el que se añade una cabeza lineal de clasificación con 10 salidas y activación sigmoide independiente por etiqueta (multietiqueta, no multinomial). La decisión de umbral se fija en 0,5 sobre cada probabilidad sigmoide, en el orden definido por `labels.json`. No hay innovaciones arquitectónicas: es un fine-tuning estándar de clasificación.

El entrenamiento usó 3.710 documentos de train (3.470 del corpus "clean core" y 240 cláusulas sintéticas generadas aparte, usadas solo en train), 434 de validación y 446 de test, con partición agrupada por documento para evitar fuga de información entre splits. Se entrenaron 3 épocas con batch size 16, AdamW y learning rate 2e-5, con BCEWithLogitsLoss, seleccionando la época por macro F1 en validación. No se documenta RLHF, DPO ni ningún proceso de alineación, algo esperable en un clasificador. El autor indica que las etiquetas sintéticas no han pasado revisión independiente y que el test ya se usó en experimentos previos, por lo que las métricas deben tratarse como exploratorias.

## Capacidades

- Clasificación multietiqueta de cláusulas de contratos laborales en coreano, con hasta 10 etiquetas simultáneas por fragmento.
- Asignación de probabilidad por etiqueta (sigmoide) con umbral configurable a 0,5 por defecto.
- Procesamiento de fragmentos de texto cortos a medios (cláusulas), no de documentos completos de una sola pasada.
- Integración con la librería `transformers` y con Text Embeddings Inference / endpoints compatibles.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni visión.
- Capacidad multilingüe limitada al coreano; no se documenta rendimiento en otros idiomas.
- No incluye modo "thinking" ni capacidades de audio.

## Casos de uso

- Revisión previa de contratos laborales: el modelo etiqueta cada cláusula con las 10 categorías definidas, permitiendo a un revisor humano priorizar las secciones que requieren atención legal antes de una lectura completa.
- Triaje en bufetes o departamentos de RR. HH.: clasificación por lotes de contratos entrantes para enrutar cada documento al especialista adecuado según las cláusulas detectadas.
- Extracción estructurada en pipelines documentales: combinado con un OCR y un segmentador de cláusulas, el clasificador añade metadatos por cláusula que alimentan un índice de búsqueda o un sistema de gestión documental.
- Control de calidad de plantillas: comparar la distribución de etiquetas de contratos reales frente a la plantilla oficial para detectar desviaciones sistemáticas.
- Anonimización y auditoría interna: localizar cláusulas sensibles (por ejemplo, las relativas a condiciones laborales) antes de compartir documentos con terceros, usando las etiquetas como filtro.
- Investigación académica sobre contratos laborales coreanos: el modelo sirve como baseline reproducible para estudiar la distribución de tipos de cláusulas en corpus legales, dado que el autor publica el informe de experimentos.
- Despliegue en servicios de inferencia: al ser un encoder de 110 M de parámetros, se puede servir con Text Embeddings Inference o endpoints compatibles con un coste de cómputo bajo.

## Benchmarks y rendimiento

| Metrica (test core, 446 documentos) | 3 epocas (v2) | 2 epocas (experimento previo) |
|---|---|---|
| Micro F1 | 0,860 | 0,858 |
| Macro F1 | 0,849 | 0,829 |
| Exact match | 83,9 % | 83,6 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores son las únicas reportadas por el autor y corresponden a su propio conjunto de test, que ya se había usado en experimentos previos, por lo que no constituyen una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo de pesos; en fp16, unos 0,22 GB. Con overhead de activaciones y tokenizador, un lote pequeño cabe en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas GPUs y el cuello de botella será el preprocesado.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más; también en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, Text Embeddings Inference (el autor incluye el tag `text-embeddings-inference`), endpoints compatibles, y exportación a ONNX para servir en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hur03/checkit-contract-classifier-core-synthetic-3epoch-v2 | 110,6 M | no disponible | Clasificación multietiqueta de cláusulas (ko) | no disponible | Hugging Face |
| klue/roberta-base | no disponible en la información | no disponible | Modelo base encoder (ko) | no disponible en la información | Hugging Face |
| klue/bert-base | no disponible en la información | no disponible | Modelo base encoder (ko) | no disponible en la información | Hugging Face |

No se dispone de información sobre otros clasificadores de cláusulas contractuales coreanos comparables publicados; por tanto, la comparativa de rendimiento con alternativas directas no está disponible.

## Limitaciones y advertencias

- El propio autor indica que el modelo no determina la legalidad de una cláusula; solo asigna etiquetas. No debe usarse como sustituto de asesoramiento jurídico.
- Las etiquetas sintéticas usadas en entrenamiento no han pasado revisión independiente, lo que puede introducir sesgos en las categorías representadas por esos ejemplos.
- El conjunto de test ya se había usado en experimentos previos, por lo que las métricas (micro F1 0,860) son exploratorias y no una estimación limpia de generalización.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; hay que contactar con el autor antes de integrarlo en producción.
- Solo soporta coreano; no hay evidencia de rendimiento en otros idiomas ni en variedades dialectales.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de falsos positivos y falsos negativos en la clasificación, especialmente en cláusulas ambiguas o con vocabulario fuera del dominio de entrenamiento.
- El umbral fijo de 0,5 puede no ser óptimo para todas las etiquetas; el autor no publica métricas por etiqueta en la model card (remite a `report.json`).
- No hay información sobre sesgos demográficos, geográficos o de género en los datos de entrenamiento.
- Corpus de entrenamiento pequeño (3.710 documentos): puede degradarse en tipos de contrato poco representados.
- El modelo no procesa documentos completos de una vez; requiere segmentación previa en cláusulas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hur03/checkit-contract-classifier-core-synthetic-3epoch-v2
- Modelo base: https://huggingface.co/klue/roberta-base
- Informe de experimentos del autor: https://huggingface.co/hur03/checkit-contract-classifier-core-synthetic-3epoch-v2/blob/main/report.json
- Etiquetas: https://huggingface.co/hur03/checkit-contract-classifier-core-synthetic-3epoch-v2/blob/main/labels.json
