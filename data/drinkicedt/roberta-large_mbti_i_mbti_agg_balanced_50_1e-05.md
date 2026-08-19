# DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50_1e-05

## Resumen

El modelo `roberta-large_MBTI_I_MBTI_agg_balanced_50_1e-05`, desarrollado por el usuario DrinkIcedT, es un clasificador de texto basado en la arquitectura RoBERTa-large, ajustado para la clasificación de tipos de personalidad MBTI (Myers-Briggs Type Indicator). Se trata de un modelo de transformadores con 355 millones de parámetros, entrenado aparentemente desde cero (según la model card) sobre un conjunto de datos no especificado, con el objetivo de predecir la dimensión "I" (introversión) frente a "E" (extraversión) a partir de texto. La relevancia de este modelo radica en su aplicación potencial en análisis de personalidad a partir de lenguaje natural, aunque su documentación es muy escasa y carece de información clave sobre el dataset, la licencia y los detalles de entrenamiento.

El modelo se publica en Hugging Face con el pipeline de clasificación de texto, en formato safetensors, y su repositorio ocupa 1,4 GB. Los resultados de evaluación reportados durante el entrenamiento muestran un F1 máximo de 0,6835 en validación, con una pérdida final de 4,3322. No se han publicado benchmarks externos ni comparaciones con otros modelos, y la model card generada automáticamente indica que se necesita más información para su uso y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (transformer encoder) |
| Parametros totales | 355.361.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder con 24 capas, 16 cabezas de atención y una dimensión oculta de 1024. La model card indica que fue entrenado "desde cero" (trained from scratch) sobre un dataset desconocido, lo que resulta inusual para un modelo de este tamaño, ya que normalmente se parte de pesos preentrenados. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-05, tamaño de lote de 16 por dispositivo (4 GPUs, lote efectivo de 64), optimizador AdamW, scheduler lineal con 400 pasos de calentamiento y 5 épocas. La pérdida de entrenamiento desciende de 2,71 a 0,72, mientras que la pérdida de validación aumenta progresivamente desde 2,68 hasta 4,33, lo que sugiere un posible sobreajuste. No se especifica el uso de técnicas como RLHF o DPO, ni se detalla la composición del dataset.

## Capacidades

- Clasificación de texto para predecir la dimensión de personalidad MBTI (específicamente la dicotomía I/E, según el nombre del modelo).
- Generación de etiquetas binarias (probablemente introversión vs. extraversión) a partir de fragmentos de texto.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso o capacidades multilingües.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Análisis de personalidad en redes sociales: el modelo puede clasificar publicaciones o perfiles de usuarios para inferir si el texto refleja rasgos de introversión o extraversión, útil para estudios sociológicos o de marketing.
- Selección de personal en recursos humanos: a partir de respuestas escritas de candidatos, el modelo podría ayudar a preseleccionar perfiles según la dimensión MBTI, aunque se requiere validación adicional.
- Asistentes de autoconocimiento: aplicaciones que ofrecen a los usuarios una estimación de su tipo MBTI basada en textos que escriben, como diarios o respuestas a preguntas abiertas.
- Investigación en psicología computacional: clasificación de corpus textuales para estudiar correlaciones entre lenguaje y rasgos de personalidad.
- Moderación de contenido personalizado: adaptar la experiencia de usuario en plataformas según la personalidad inferida, aunque esto plantea cuestiones éticas y de privacidad.
- Herramientas de coaching y desarrollo personal: generar recomendaciones de comunicación basadas en la clasificación de personalidad del texto del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos en la información disponible. El model-index de la model card está vacío. Sin embargo, la model card reporta los siguientes resultados de evaluación durante el entrenamiento:

| Epoch | Validation Loss | F1 | Threshold | F1 At 05 |
|---:|---:|---:|---:|---:|
| 0.3175 | 2.6766 | 0.5785 | 0.47 | 0.5666 |
| 0.6349 | 2.4528 | 0.6386 | 0.4500 | 0.6279 |
| 0.9524 | 2.3498 | 0.6745 | 0.52 | 0.6701 |
| 1.2698 | 2.4031 | 0.6730 | 0.4600 | 0.6656 |
| 1.5873 | 2.3860 | 0.6835 | 0.4600 | 0.6783 |
| 1.9048 | 2.3219 | 0.6790 | 0.4200 | 0.6686 |
| 2.2222 | 2.6639 | 0.6752 | 0.33 | 0.6661 |
| 2.5397 | 2.7574 | 0.6721 | 0.48 | 0.6695 |
| 2.8571 | 2.6145 | 0.6765 | 0.2900 | 0.6682 |
| 3.1746 | 3.4465 | 0.6689 | 0.56 | 0.6681 |
| 3.4921 | 3.4451 | 0.6748 | 0.4100 | 0.6717 |
| 3.8095 | 3.6080 | 0.6721 | 0.53 | 0.6712 |
| 4.1270 | 4.1815 | 0.6759 | 0.53 | 0.6723 |
| 4.4444 | 3.9992 | 0.6793 | 0.54 | 0.6771 |
| 4.7619 | 4.3322 | 0.6721 | 0.51 | 0.6720 |

Estos valores corresponden a la evaluación sobre el conjunto de validación durante el entrenamiento, no a benchmarks estandarizados como MMLU o HumanEval.

## Requisitos de hardware

- El modelo tiene 355 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 1,4 GB de memoria (tamaño del repositorio).
- Para inferencia en fp32, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior), aunque para mayor comodidad se sugiere 8 GB.
- Con cuantización a 8 bits (no documentada oficialmente, pero posible con herramientas como bitsandbytes), podría ejecutarse en GPUs con 2-3 GB de VRAM.
- No se proporcionan datos sobre latencia o throughput.
- Opciones de despliegue compatibles: transformers, text-embeddings-inference (según tags), y potencialmente vLLM u Ollama si se convierte a formatos como GGUF, aunque no se menciona explícitamente.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo es un fine-tuning de RoBERTa-large, pero no se conocen otros modelos de clasificación MBTI con los que comparar en términos de rendimiento, contexto o licencia. Se puede mencionar que el autor ha publicado otras variantes (como `roberta-large_MBTI_I_MBTI_agg_balanced_75`) que podrían ser comparables, pero no se dispone de sus métricas.

## Limitaciones y advertencias

- La model card no especifica el dataset de entrenamiento, lo que impide evaluar sesgos o representatividad.
- La licencia no está indicada, por lo que el uso comercial es incierto y requiere consulta al autor.
- La pérdida de validación aumenta significativamente hacia el final del entrenamiento, lo que sugiere sobreajuste y posible degradación en datos no vistos.
- No se documentan limitaciones de idioma; se desconoce si el modelo funciona solo en inglés u otros idiomas.
- Riesgo de alucinación o clasificaciones erróneas, especialmente en textos ambiguos o fuera del dominio de entrenamiento.
- No hay información sobre la longitud máxima de secuencia soportada; RoBERTa-large típicamente soporta 512 tokens, pero no se confirma.
- El modelo fue entrenado "desde cero" según la model card, lo que implica que no aprovecha el conocimiento preentrenado de RoBERTa, pudiendo tener un rendimiento inferior en tareas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50_1e-05
- Variante con balance 75: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_75
- Variante sin sufijo de learning rate: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50
