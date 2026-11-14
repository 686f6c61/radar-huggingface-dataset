# ayatsuri/miroberta-rmi-mentions

## Resumen

miroberta-rmi-mentions es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) del modelo base `mavinsao/mi-roberta-base`, una variante de RoBERTa orientada al castellano. Lo publica el usuario `ayatsuri` en Hugging Face bajo licencia MIT y está pensado, por su nombre y su pipeline (`text-classification`), para detectar o clasificar menciones en el contexto de RMI (probablemente "Retrieval Mention Identification" o un dominio específico no documentado en la model card). El modelo tiene 124.651.784 parámetros, lo que corresponde a la arquitectura RoBERTa base estándar (12 capas, 768 dimensiones ocultas).

La model card es prácticamente automática (generada por el Trainer de Hugging Face) y no documenta el conjunto de datos de entrenamiento, los idiomas soportados ni los usos previstos; el autor deja varios apartados como "More information needed". Aun así, se declaran métricas de evaluación concretas: accuracy 0,8815, recall 0,8718, precision 0,8750 y F1 0,8729 sobre un conjunto de evaluación no especificado, con una pérdida de validación de 0,7509 tras 3 épocas.

Su relevancia es limitada y muy específica: se trata de un clasificador pequeño, ligero y desplegable en CPU, útil como componente de un pipeline mayor (por ejemplo, filtrado o etiquetado de menciones en textos en castellano) más que como modelo generativo de propósito general. Con solo 2 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base, 12 capas, 768 dimensiones ocultas) |
| Parametros totales | 124.651.784 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite hasta 512 tokens de posición, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es de orientación castellana, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de tipo RoBERTa, ajustado a partir de `mavinsao/mi-roberta-base`. No se trata de un modelo generativo ni de un modelo de mezcla de expertos: es un clasificador de secuencias que produce etiquetas a partir de la representación contextual del token `[CLS]` o de la cabeza de clasificación añadida durante el fine-tuning. Con 124,6 millones de parámetros, encaja exactamente en la configuración "base" de RoBERTa (no en la "large").

El entrenamiento se realizó con el Trainer de Hugging Face durante 3 épocas, con `learning_rate` 1e-05, `train_batch_size` y `eval_batch_size` de 32, semilla 42, optimizador AdamW fused (`betas=(0.9, 0.999)`, `epsilon=1e-08`) y scheduler lineal. Se registraron 3951 pasos totales (1317 por época). La pérdida de entrenamiento bajó de 0,9332 a 0,6211, mientras que la de validación se estabilizó en torno a 0,745-0,751 a partir de la segunda época, lo que sugiere un ajuste sin mejora sustancial tras la época 2. No se documenta el conjunto de datos, su composición, el número de tokens ni si hubo técnicas de aumento de datos o balanceo de clases. Tampoco se indica si se aplicó alguna innovación técnica adicional (destilación, decodificación especulativa, atención lineal, etc.); al ser un encoder clasificador, estas técnicas no aplican.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que asigna etiquetas a secuencias de entrada.
- Detección/clasificación de menciones: por el nombre del modelo (`rmi-mentions`), está orientado a identificar menciones en un dominio concreto, aunque la model card no lo detalla.
- Codificación de texto en castellano: hereda del modelo base `mi-roberta-base` la orientación al español, si bien el autor no lo confirma explícitamente.
- Integración con `transformers`: compatible con `pipeline("text-classification")` y con `text-embeddings-inference` según los tags del repositorio.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking"; es un clasificador, no un modelo generativo.
- Capacidades multilingües: no disponibles/no documentadas.

## Casos de uso

- Filtrado de menciones en foros o redes: el modelo puede clasificar cada mensaje o fragmento como "mención" o "no mención" antes de pasarlo a un sistema de moderación o de análisis, reduciendo el volumen de datos a procesar por etapas posteriores más costosas.
- Etiquetado de corpus en castellano: útil para anotar automáticamente grandes volúmenes de texto con etiquetas de mención, generando datos de entrenamiento para modelos mayores o para análisis estadísticos.
- Enrutamiento en pipelines de atención al cliente: si una mención implica una consulta o incidencia, el clasificador puede derivar el mensaje al departamento adecuado en función de la etiqueta predicha, con latencia baja al ser un modelo de 124 M de parámetros.
- Preprocesado en sistemas de extracción de entidades: como primer paso para aislar segmentos con menciones antes de aplicar un NER o un modelo de extracción de relaciones, reduciendo falsos positivos en la etapa siguiente.
- Moderación de contenido en comunidades: clasificar menciones potencialmente problemáticas (spam, referencias a usuarios) para priorizar la revisión humana, dado su bajo coste de inferencia en CPU.
- Investigación en procesamiento de lenguaje natural en español: servir como línea base reproducible (semilla 42, hiperparámetros documentados) para comparar técnicas de clasificación de menciones en castellano, aunque la falta de documentación del dataset limita su reproducibilidad.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, puede ejecutarse en servicios serverless o en el borde (edge) para clasificación en tiempo real de flujos de texto.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card (conjunto de evaluación no especificado). El `model-index` oficial no contiene resultados (`results: []`).

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 (final) |
|---|---|---|---|
| Training loss | 0,9332 | 0,7210 | 0,6211 |
| Validation loss | 0,7872 | 0,7451 | 0,7509 |
| Accuracy | 0,8752 | 0,8817 | 0,8815 |
| Recall | 0,8660 | 0,8727 | 0,8718 |
| Precision | 0,8734 | 0,8754 | 0,8750 |
| F1 | 0,8670 | 0,8729 | 0,8729 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124,6 M de parámetros × 4 bytes) y en torno a 0,25 GB en fp16/bf16; el repositorio ocupa 2,5 GB por incluir pesos en distintos formatos y el optimizador.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 2060, T4, etc.); también funciona en CPU con latencias aceptables para clasificación por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3050 en adelante) e incluso en iGPU con suficiente memoria compartida, al ser un modelo base pequeño.
- Opciones de despliegue: `transformers` (pipeline de clasificación), `text-embeddings-inference` (según tags), Inference Endpoints de Hugging Face; también es convertible a ONNX o cuantizable a int8 para CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (124 M de parámetros) se espera un throughput alto en lotes, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para este modelo ni de alternativas evaluadas en el mismo conjunto. A modo orientativo, se comparan características estructurales con clasificadores encoder de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ayatsuri/miroberta-rmi-mentions | 124,6 M | no disponible | MIT | Hugging Face | Clasificador de menciones, sin dataset documentado |
| roberta-base | 125 M | 512 tokens | MIT | Hugging Face | Modelo base inglés, referencia de arquitectura |
| mavinsao/mi-roberta-base | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva este fine-tuning |
| bert-base-spanish-wwm-cased | 110 M | 512 tokens | Apache 2.0 | Hugging Face | Encoder en español de referencia (BETO) |

La comparación de rendimiento real no es posible porque el autor no publica el conjunto de evaluación ni resultados frente a alternativas.

## Limitaciones y advertencias

- Model card incompleta: el dataset de entrenamiento, los idiomas y los usos previstos figuran como "More information needed", lo que impide evaluar su validez fuera del dominio original.
- Riesgo de sobreajuste: la pérdida de validación no mejora tras la época 2 y el F1 se estanca en 0,8729, lo que sugiere que más épocas no aportarían mejoras y que el modelo puede estar ajustado a un conjunto concreto.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible identificar sesgos de género, origen o dominio; el modelo base de orientación castellana puede heredar sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Limitaciones de contexto e idioma: la longitud máxima de entrada no está confirmada; si se hereda de RoBERTa base, sería de 512 tokens, insuficiente para documentos largos sin troceado.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `mavinsao/mi-roberta-base` tiene una licencia no indicada en la información disponible, por lo que conviene verificar la cadena de licencias antes de un uso comercial.
- Sin validación externa: 2 descargas y 0 likes indican que el modelo no ha sido evaluado por la comunidad; no se recomienda para producción crítica sin una evaluación propia en el dominio objetivo.
- Sin soporte de tool calling ni generación: no puede sustituir a un LLM en tareas de razonamiento o generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayatsuri/miroberta-rmi-mentions
- Modelo base: https://huggingface.co/mavinsao/mi-roberta-base
- Documentación de RoBERTa (arquitectura de referencia): https://huggingface.co/docs/transformers/model_doc/roberta
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Documentación de pipelines de clasificación de texto: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
