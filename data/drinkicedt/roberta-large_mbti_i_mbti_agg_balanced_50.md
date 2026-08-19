# DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50

## Resumen

El modelo `roberta-large_MBTI_I_MBTI_agg_balanced_50`, desarrollado por el usuario DrinkIcedT, es un clasificador de texto basado en la arquitectura RoBERTa-large, diseñado para la clasificación de rasgos de personalidad según el indicador MBTI (Myers-Briggs Type Indicator). El nombre sugiere que se centra en el rasgo "I" (Introversión) frente a "E" (Extraversión), aunque la model card no especifica explícitamente el número de clases ni el dataset de entrenamiento. Se trata de un modelo de 355 millones de parámetros, entrenado desde cero (según la model card) sobre un conjunto de datos no revelado, con un pipeline de clasificación de texto.

La relevancia de este modelo radica en su aplicación potencial para el análisis automático de personalidad a partir de texto, un área con interés en psicometría computacional, análisis de redes sociales y recursos humanos. Sin embargo, la información pública es muy limitada: no se indica la licencia, los idiomas soportados ni el contexto de entrenamiento, lo que dificulta su uso en producción sin una evaluación adicional. El modelo se publicó en agosto de 2026 y no ha recibido descargas ni valoraciones, lo que sugiere que es un proyecto experimental o académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (transformer encoder) |
| Parametros totales | 355.361.794 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-large estándar: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder de 24 capas con 16 cabezas de atención y una dimensión oculta de 1024. Según la model card, fue entrenado desde cero sobre un dataset desconocido, lo que implica que no se realizó un fine-tuning sobre un modelo preentrenado, sino un entrenamiento completo desde pesos aleatorios. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-05, tamaño de lote de 16 por dispositivo (con 4 GPUs, lote total de 64), optimizador AdamW, scheduler lineal con 400 pasos de calentamiento y 5 épocas. No se mencionan técnicas como RLHF, DPO ni otras innovaciones; el entrenamiento parece ser un fine-tuning estándar de clasificación.

## Capacidades

- Clasificación de texto para rasgos de personalidad MBTI, específicamente el rasgo "I" (Introversión) según el nombre del modelo.
- Pipeline de clasificación de texto compatible con la librería transformers y con text-embeddings-inference.
- No se han documentado capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe.
- El modelo está diseñado para inferencia de clasificación binaria o multiclase, aunque el número exacto de clases no se especifica.

## Casos de uso

- Análisis de personalidad en redes sociales: el modelo puede clasificar publicaciones o comentarios para inferir si el autor muestra rasgos de introversión o extraversión, útil para estudios sociológicos o de marketing.
- Selección de personal en recursos humanos: a partir de textos de entrevistas o respuestas a cuestionarios abiertos, el modelo podría ayudar a predecir rasgos de personalidad, aunque requiere validación adicional.
- Investigación psicológica: como herramienta de análisis automático en estudios que correlacionan el lenguaje con el MBTI, permitiendo procesar grandes volúmenes de texto.
- Chatbots personalizados: adaptar el tono de un asistente virtual según la personalidad inferida del usuario, mejorando la experiencia de interacción.
- Análisis de feedback de clientes: clasificar comentarios de productos o servicios para segmentar a los usuarios según su perfil de personalidad y ajustar estrategias de comunicación.
- Detección de sesgos en textos: aunque no es su propósito principal, podría usarse para explorar cómo se manifiestan los rasgos de personalidad en diferentes géneros textuales.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 4.2379 |
| F1 | 0.6785 |
| Threshold | 0.47 |
| F1 At 05 | 0.6749 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El model-index oficial está vacío, por lo que estos valores son los únicos datos de rendimiento disponibles.

## Requisitos de hardware

- El modelo tiene 355 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 1.4 GB (tamaño del repositorio). Para inferencia en fp16, el uso de VRAM sería de unos 0.7 GB, y en int8 alrededor de 0.35 GB.
- Se recomienda una GPU con al menos 4 GB de VRAM para inferencia en fp16 sin cuantización, y 2 GB para cuantización int8. GPUs como la NVIDIA RTX 3060, RTX 4060 o superiores son suficientes.
- Para despliegue en producción, se puede utilizar vLLM, TGI o la API de transformers con `text-classification`. También es compatible con text-embeddings-inference según los tags.
- No se proporcionan datos de latencia o throughput específicos, pero al ser un modelo de tamaño medio, la inferencia en GPU moderna debería ser de decenas de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de MBTI) dentro de la información proporcionada. No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- La model card indica "More information needed" en varias secciones, lo que refleja una documentación incompleta: no se especifica el dataset de entrenamiento, el número de clases, ni el proceso de etiquetado.
- El modelo fue entrenado desde cero sobre un dataset desconocido, lo que implica un alto riesgo de sesgos y una generalización incierta fuera de los datos de entrenamiento.
- La licencia no está especificada, por lo que su uso comercial es incierto y requiere contactar con el autor.
- No se han reportado resultados de benchmarks externos ni comparaciones con otros modelos, lo que limita la confianza en su rendimiento.
- El nombre sugiere que está especializado en el rasgo "I" del MBTI, pero no se confirma si es un clasificador binario o multiclase; esto debe verificarse antes de usarlo.
- La pérdida de validación (4.2379) es alta, lo que podría indicar un sobreajuste o una dificultad inherente en la tarea; se recomienda evaluar en datos propios.

## Enlaces

- [HuggingFace: DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50](https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50)
