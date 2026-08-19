# DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50_2e-05

## Resumen

El modelo `DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50_2e-05` es un fine-tune de RoBERTa-large orientado a la clasificación de texto, concretamente a la predicción de la dimensión "I" (introversión) del indicador tipológico MBTI (Myers-Briggs Type Indicator). Desarrollado por el usuario DrinkIcedT, el modelo se entrenó sobre un conjunto de datos no especificado, aunque el nombre sugiere un agregado balanceado al 50 % entre dos clases. Está diseñado para tareas de clasificación binaria de textos, probablemente para determinar si un texto refleja una personalidad introvertida o extravertida.

Con 355 millones de parámetros, es un modelo de gran tamaño dentro de la familia RoBERTa, lo que le confiere una alta capacidad de representación lingüística, aunque su uso práctico se limita a la clasificación de secuencias cortas (típicamente hasta 512 tokens). El repositorio incluye pesos en formato safetensors y es compatible con la librería Transformers de Hugging Face, así como con herramientas de inferencia como Text Embeddings Inference y endpoints compatibles. La licencia y los idiomas soportados no están declarados, lo que limita su uso en entornos productivos sin una validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (Transformer encoder-only) |
| Parametros totales | 355.361.794 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder-only con 24 capas, 16 cabezas de atención y una dimensión oculta de 1024. A diferencia de los modelos decoder, RoBERTa está diseñado para tareas de comprensión del lenguaje, como clasificación de texto, y no para generación. El fine-tune se realizó sobre una tarea de clasificación binaria, probablemente para distinguir entre dos clases de personalidad MBTI (la dimensión I/E). El dataset de entrenamiento no está documentado; el nombre "agg_balanced_50" sugiere un agregado de datos balanceado al 50 % entre las dos clases, pero no se especifica su origen ni composición.

El entrenamiento se llevó a cabo con una tasa de aprendizaje de 2e-05, un tamaño de lote de 16 por dispositivo (4 GPUs, lote efectivo de 64), durante 5 épocas, con un scheduler lineal y 400 pasos de warmup. Se utilizó el optimizador AdamW. La pérdida de evaluación final fue de 6.4483, con un F1 de 0.6724 y un umbral óptimo de 0.66. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento parece ser un fine-tune supervisado estándar.

## Capacidades

- Clasificación de texto binaria: el modelo está entrenado para predecir una etiqueta binaria (probablemente introversión vs. extraversión en el contexto MBTI).
- Procesamiento de secuencias de hasta 512 tokens (límite estándar de RoBERTa).
- Compatible con la librería Transformers para inferencia en Python.
- Soporte para despliegue mediante Text Embeddings Inference y endpoints compatibles con Hugging Face.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Análisis de personalidad en redes sociales: dado un texto de un usuario (por ejemplo, un tweet o una publicación), el modelo puede clasificarlo como introvertido o extravertido, útil para estudios sociológicos o de marketing.
- Filtrado de contenido en plataformas de citas o redes profesionales: se puede usar para etiquetar perfiles según su estilo comunicativo y sugerir coincidencias compatibles.
- Investigación psicológica: los investigadores pueden aplicar el modelo a corpus de texto para estudiar correlaciones entre el lenguaje y los rasgos de personalidad MBTI.
- Sistemas de recomendación de contenido: si se conoce la personalidad del usuario, se pueden adaptar recomendaciones de lecturas, vídeos o productos.
- Asistentes de escritura: el modelo puede sugerir ajustes de tono en textos para que se perciban como más introvertidos o extravertidos, según el objetivo del autor.
- Análisis de equipos en entornos laborales: clasificar comunicaciones internas para entender la diversidad de estilos de personalidad en un equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El autor reporta únicamente métricas de evaluación durante el entrenamiento, que se muestran a continuación:

| Training Loss | Epoch | Step | Validation Loss | F1 | Threshold | F1 At 05 |
|:-------------:|:-----:|:----:|:---------------:|:--:|:---------:|:--------:|
| 2.6790 | 0.3175 | 200 | 2.5845 | 0.6344 | 0.39 | 0.5363 |
| 2.4516 | 0.6349 | 400 | 2.4236 | 0.6571 | 0.52 | 0.6542 |
| 2.3273 | 0.9524 | 600 | 2.3726 | 0.6723 | 0.51 | 0.6717 |
| 1.9333 | 1.2698 | 800 | 2.4694 | 0.6742 | 0.4600 | 0.6700 |
| 1.8594 | 1.5873 | 1000 | 2.4772 | 0.6874 | 0.35 | 0.6783 |
| 1.7841 | 1.9048 | 1200 | 2.4794 | 0.6846 | 0.38 | 0.6700 |
| 1.1805 | 2.2222 | 1400 | 3.1633 | 0.6807 | 0.35 | 0.6762 |
| 1.2838 | 2.5397 | 1600 | 2.9594 | 0.6715 | 0.38 | 0.6676 |
| 1.2491 | 2.8571 | 1800 | 3.2493 | 0.6755 | 0.4400 | 0.6717 |
| 0.6813 | 3.1746 | 2000 | 4.1686 | 0.6729 | 0.47 | 0.6688 |
| 0.6933 | 3.4921 | 2200 | 4.4958 | 0.6691 | 0.71 | 0.6667 |
| 0.6468 | 3.8095 | 2400 | 4.2346 | 0.6779 | 0.59 | 0.6728 |
| 0.3538 | 4.1270 | 2600 | 5.9187 | 0.6730 | 0.49 | 0.6723 |
| 0.3386 | 4.4444 | 2800 | 6.1454 | 0.6692 | 0.7 | 0.6666 |
| 0.3529 | 4.7619 | 3000 | 6.4483 | 0.6724 | 0.66 | 0.6649 |

El mejor F1 observado fue 0.6874 en el paso 1000 (época 1.59), aunque la pérdida de validación aumentó significativamente en las últimas épocas, lo que sugiere posible sobreajuste.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP32 se necesitan aproximadamente 1.4 GB solo para los pesos; en FP16 se reduce a ~700 MB. Con cuantización a int8 (no declarada, pero posible) se podría bajar a ~350 MB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM para FP16 (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060) y 4 GB para FP32. Una RTX 3090 o A100 permitiría mayor throughput.
- En CPU es posible ejecutar inferencia, pero con latencias altas (del orden de segundos por muestra).
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), Hugging Face Inference Endpoints, o directamente con la librería Transformers en Python.
- Latencia y throughput: no se han publicado mediciones específicas; para un modelo de 355M parámetros, en una GPU moderna (RTX 4090) se pueden esperar latencias de milisegundos por lote pequeño.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar este modelo con alternativas de la misma categoría (clasificación de personalidad MBTI). Como referencia arquitectónica, se puede comparar con otros modelos de clasificación de texto basados en RoBERTa:

| Modelo | Parámetros | Contexto | Licencia | Uso típico |
|---|---|---|---|---|
| roberta-large (base) | 355M | 512 | MIT (original) | Clasificación, NER, QA |
| roberta-base | 125M | 512 | MIT | Clasificación, NER |
| bert-large-uncased | 340M | 512 | Apache-2.0 | Clasificación, QA |

Este modelo es un fine-tune de roberta-large, por lo que hereda su arquitectura y capacidad. No hay evidencia de que supere a otros modelos especializados en MBTI, ya que no se han publicado comparativas.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica la procedencia ni el método de anotación de los datos, lo que impide evaluar su representatividad y posibles sesgos.
- Sesgos potenciales: al tratarse de un clasificador de personalidad, puede reflejar estereotipos culturales o lingüísticos presentes en los datos de entrenamiento.
- Riesgo de alucinación: aunque es un modelo de clasificación y no genera texto libre, puede producir predicciones erróneas con alta confianza en textos ambiguos o fuera de dominio.
- Limitaciones de idioma: no se declaran los idiomas soportados; probablemente esté entrenado principalmente en inglés, dado el uso de RoBERTa.
- Restricciones de licencia: la licencia no está especificada, por lo que no se garantiza su uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- Sobreajuste observado: la pérdida de validación aumenta drásticamente en las últimas épocas, lo que sugiere que el modelo puede no generalizar bien a datos no vistos.
- Sin soporte para tareas generativas ni interacción agéntica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50_2e-05
- Modelo hermano (dimensión P): https://huggingface.co/DrinkIcedT/roberta-large_MBTI_P_MBTI_agg_balanced_50_2e-05
- Código fuente de RoBERTa en Transformers: https://github.com/huggingface/transformers/blob/main/src/transformers/models/roberta/modeling_roberta.py
