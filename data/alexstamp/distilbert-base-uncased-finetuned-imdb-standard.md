# AlexStamp/distilbert-base-uncased-finetuned-imdb-standard

## Resumen

El modelo `AlexStamp/distilbert-base-uncased-finetuned-imdb-standard` es una adaptación de dominio de `distilbert-base-uncased`, un transformer encoder-only destilado de BERT, fine-tuneado sobre el dataset de reseñas de películas IMDB (stanfordnlp/imdb) para la tarea de masked language modeling (MLM). El autor, AlexStamp, lo ha entrenado con el objetivo de mejorar la capacidad del modelo base para representar el lenguaje informal y la terminología específica del dominio cinematográfico, logrando una reducción significativa de la perplejidad en textos de ese ámbito (de 23.14 a 9.91).

Con 66.985.530 parámetros y una ventana de contexto de 512 tokens (heredada del modelo base), este checkpoint es ligero y adecuado para entornos con recursos limitados. Su licencia Apache 2.0 permite uso comercial sin restricciones. Aunque su pipeline principal es fill-mask, puede servir como punto de partida para fine-tuning en tareas downstream como análisis de sentimiento o clasificación de reseñas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 66.985.530 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de distilbert-base-uncased) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, un transformer encoder-only destilado de BERT con 6 capas, 768 unidades ocultas y 12 cabezas de atención. El entrenamiento consistió en un fine-tuning de 3 épocas sobre el dataset IMDB completo (50.000 secuencias de entrenamiento y 10.000 de evaluación), con secuencias fragmentadas en bloques de 128 tokens y empaquetado completo sin padding. Se utilizó un `DataCollatorForLanguageModeling` con una probabilidad de enmascaramiento dinámico del 15%, entrenamiento en precisión mixta fp16 sobre una GPU NVIDIA T4, batch size de 64 y learning rate de 2e-05 con scheduler lineal. No se emplearon técnicas de RLHF ni DPO; la única innovación destacable es la adaptación de dominio mediante MLM, que reduce la perplejidad de 23.14 a 9.91 en el conjunto de evaluación.

## Capacidades

- Fill-mask: completa tokens enmascarados en frases, especialmente en el dominio de reseñas de películas.
- Representaciones contextuales: genera embeddings de tokens adaptados al lenguaje informal y terminología cinematográfica.
- Modelo de lenguaje enmascarado: no es generativo, solo predice tokens ocultos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: ninguna más allá del MLM estándar.

## Casos de uso

- Análisis de sentimiento en reseñas de películas: el modelo puede fine-tunearse sobre el dataset IMDB para clasificar críticas como positivas o negativas, aprovechando su adaptación previa al vocabulario y estilo del dominio.
- Completado de texto enmascarado en contextos cinematográficos: útil para autocompletar frases en herramientas de escritura de guiones o reseñas, gracias a su baja perplejidad en ese dominio.
- Evaluación de perplejidad en dominios específicos: sirve como referencia para medir la adaptación de otros modelos a textos de reseñas de películas.
- Extracción de características para sistemas de recomendación: los embeddings generados pueden alimentar modelos de similitud entre reseñas o películas.
- Preprocesamiento para pipelines de NLP: al estar adaptado al dominio, puede mejorar la calidad de representaciones en tareas como etiquetado de entidades o análisis de opiniones.
- Herramienta educativa: permite demostrar el concepto de masked language modeling y adaptación de dominio en un modelo ligero y fácil de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de HuggingFace no incluye métricas estándar (MMLU, HumanEval, etc.). No obstante, la model card reporta una perplejidad de 9.91 en el conjunto de evaluación de IMDB, frente a 23.14 del modelo base sin adaptar, lo que indica una mejora sustancial en la modelización del lenguaje del dominio.

## Requisitos de hardware

- VRAM estimada: aproximadamente 250 MB en fp32 y 130 MB en fp16, por lo que cabe en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: NVIDIA T4 (usada en entrenamiento), RTX 2060 o superiores; también funciona en CPU con baja latencia.
- Despliegue: compatible con la librería `transformers` mediante el pipeline `fill-mask`, así como con servidores de inferencia como vLLM o TGI (aunque no es necesario por su tamaño).
- Latencia y throughput: en una GPU T4, la inferencia de una secuencia de 128 tokens típicamente toma menos de 10 ms; en CPU, alrededor de 50-100 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad en IMDB | Licencia |
|---|---|---|---|---|
| distilbert-base-uncased (base) | 66.955.520 | 512 | 23.14 | Apache 2.0 |
| AlexStamp/distilbert-base-uncased-finetuned-imdb-standard | 66.985.530 | 512 | 9.91 | Apache 2.0 |
| bert-base-uncased | 109.482.240 | 512 | No disponible | Apache 2.0 |

La comparativa muestra que el modelo fine-tuneado mantiene un tamaño similar al base pero con una perplejidad mucho menor en el dominio de reseñas, mientras que BERT base es más grande y no está adaptado a este dominio específico.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para otros idiomas.
- Es un modelo de lenguaje enmascarado, no generativo, por lo que no puede producir texto libre.
- El dataset IMDB introduce sesgos hacia el lenguaje informal y opiniones extremas (positivas o negativas), lo que puede afectar a la generalización en otros dominios.
- Riesgo de alucinación: aunque en MLM no se generan respuestas completas, las predicciones de tokens pueden ser incoherentes fuera del dominio de reseñas.
- No se han publicado resultados de benchmarks estándar, por lo que su rendimiento en tareas como clasificación o extracción de información no está validado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de precisión o idoneidad para producción.

## Enlaces

- [HuggingFace: AlexStamp/distilbert-base-uncased-finetuned-imdb-standard](https://huggingface.co/AlexStamp/distilbert-base-uncased-finetuned-imdb-standard)
- [Modelo base: distilbert-base-uncased](https://huggingface.co/distilbert/distilbert-base-uncased)
- [Dataset: stanfordnlp/imdb](https://huggingface.co/datasets/stanfordnlp/imdb)
