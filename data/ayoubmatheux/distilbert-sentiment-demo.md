# ayoubmatheux/distilbert-sentiment-demo

## Resumen

El modelo `ayoubmatheux/distilbert-sentiment-demo` es un clasificador de sentimiento binario (positivo/negativo) basado en un fine-tuning de `distilbert-base-uncased`. Lo desarrolla el usuario ayoubmatheux y se publica en Hugging Face con licencia Apache 2.0. Su propósito es analizar texto y devolver una etiqueta de sentimiento con un nivel de confianza.

Con 66.955.010 parámetros, es un modelo ligero de arquitectura Transformer encoder (DistilBERT), pensado para tareas de clasificación de texto donde se requiere baja latencia y un coste computacional reducido. La longitud de contexto no se especifica en la información disponible.

El modelo se ha entrenado sobre un conjunto de datos no especificado, con hiperparámetros documentados (learning rate 2e-5, 2 épocas, batch size 16). Aunque no se publican benchmarks estándar, el autor declara una exactitud de 0,8415 en su conjunto de evaluación. Es relevante como ejemplo de fine-tuning sencillo y reproducible de un modelo de lenguaje pequeño para análisis de sentimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | No especificado (pesos en safetensors y ONNX; tag "quantized" presente) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un Transformer encoder destilado de BERT que reduce el número de parámetros manteniendo gran parte de su capacidad. Se ha realizado un fine-tuning supervisado para clasificación de texto, añadiendo una cabeza de clasificación lineal sobre el token `[CLS]`. No se especifica el conjunto de datos de entrenamiento, pero los hiperparámetros indican un entrenamiento con optimizador AdamW (betas 0.9/0.999, epsilon 1e-8), learning rate 2e-5, batch size 16, scheduler lineal y 2 épocas. El proceso se ejecutó con Transformers 5.16.1 y PyTorch 2.11.0+cu128. No se mencionan técnicas de RLHF, DPO ni innovaciones arquitectónicas; se trata de un fine-tuning estándar.

## Capacidades

- Clasificación de sentimiento binario: distingue entre texto con sentimiento positivo o negativo.
- Devuelve una etiqueta y una puntuación de confianza, como es habitual en los pipelines de clasificación de texto de Transformers.
- No es un modelo generativo: no produce texto nuevo, solo clasifica.
- No soporta tool calling, razonamiento multi-paso, ni capacidades de visión o audio.
- Orientado principalmente a texto en inglés, dado que el modelo base es `distilbert-base-uncased`; los idiomas soportados no se especifican en la ficha.
- Compatible con los pipelines de `transformers` para `text-classification`.

## Casos de uso

- Análisis de reseñas de productos: el modelo puede clasificar automáticamente reseñas en positivas o negativas para filtrar comentarios en tiendas online, gracias a su tamaño reducido y baja latencia.
- Monitorización de redes sociales: permite analizar publicaciones o tweets en inglés para detectar sentimiento negativo hacia una marca, integrable en pipelines de procesamiento por lotes.
- Priorización de tickets de soporte: clasifica los mensajes de clientes por sentimiento para enrutar los urgentes a agentes humanos, usando la confianza de la predicción como criterio.
- Análisis de encuestas de satisfacción: procesa respuestas abiertas de encuestas para segmentar clientes satisfechos e insatisfechos sin necesidad de un LLM grande.
- Moderación de contenido: detecta comentarios negativos u ofensivos en foros y comentarios, ayudando a automatizar la revisión.
- Componente en pipelines de NLP: al ser un modelo pequeño, se puede ejecutar en CPU o en GPUs modestas y servir como paso previo para enrutar texto a otros sistemas, por ejemplo, en un sistema de análisis de opiniones financieras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara los siguientes resultados en su conjunto de evaluación:

| Métrica | Valor |
|---|---|
| Pérdida (loss) | 0,4321 |
| Exactitud (accuracy) | 0,8415 |

Durante el entrenamiento, la exactitud de validación alcanzó 0,8405 en la época 1 y 0,8537 en la época 2. No hay comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 268 MB (66.955.010 parámetros × 4 bytes), más overhead; en FP16, unos 134 MB; en INT8, unos 67 MB; en INT4, unos 34 MB. Estas estimaciones no incluyen el overhead del framework ni los buffers de activación.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo una NVIDIA GTX 1650, RTX 3060 o superior. También puede ejecutarse en CPU con ONNX Runtime.
- ¿Cabe en consumer GPU? Sí, incluso en GPUs integradas o en CPU, gracias a su tamaño reducido.
- Opciones de despliegue: Hugging Face Transformers, ONNX Runtime, y los endpoints de Hugging Face (compatible con `text-embeddings-inference` según los tags). No es adecuado para vLLM ni llama.cpp, que están orientados a modelos generativos grandes.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 66,9M parámetros, la inferencia es rápida en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Dataset de fine-tuning | Exactitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ayoubmatheux/distilbert-sentiment-demo | 66.955.010 | No especificado | 0,8415 (evaluación) | Apache 2.0 | Hugging Face |
| HamzaAS/distilbert-sentiment-demo | No disponible | rotten_tomatoes | No disponible | No disponible | Hugging Face |
| distilbert-base-uncased (base) | 66.955.010 | Sin fine-tuning | No aplica | Apache 2.0 | Hugging Face |

Nota: El modelo de HamzaAS es otro fine-tuning de DistilBERT para el mismo propósito, pero con un dataset conocido. El modelo base no está entrenado para sentimiento. No se dispone de más datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se especifican en la ficha. Al heredar los pesos de `distilbert-base-uncased`, puede arrastrar sesgos lingüísticos y culturales del modelo base.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto; solo produce etiquetas de clasificación.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada; el modelo base está pensado para texto en inglés, por lo que su rendimiento en otros idiomas es incierto.
- Dataset de entrenamiento desconocido: la exactitud declarada (0,8415) se ha medido en un conjunto de evaluación no especificado; el rendimiento en otros dominios puede variar significativamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no incluye garantías. El autor no proporciona información sobre el dataset, lo que puede afectar a la trazabilidad y al cumplimiento de normativas de protección de datos.
- No hay benchmarks estándar publicados, por lo que no se puede comparar de forma fiable con otros modelos.

## Enlaces

- https://huggingface.co/ayoubmatheux/distilbert-sentiment-demo
- https://huggingface.co/spaces/Drocho/distilbert-sentiment-demo
- https://huggingface.co/HamzaAS/distilbert-sentiment-demo
- https://github.com/ayoubatouf/distilbert_sentiment_analysis
