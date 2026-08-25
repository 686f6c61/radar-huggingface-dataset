# alexwoods711/distilbert-base-uncased-finetuned-sst-2-english

## Resumen

El modelo `alexwoods711/distilbert-base-uncased-finetuned-sst-2-english` es un checkpoint de DistilBERT-base-uncased, ajustado (fine-tuned) sobre el dataset SST-2 (Stanford Sentiment Treebank) para la clasificación binaria de sentimiento en inglés. DistilBERT es una versión comprimida de BERT mediante destilación de conocimiento, que reduce el número de capas de 12 a 6 y conserva un 97 % del rendimiento del modelo original con un 40 % menos de parámetros. Este checkpoint concreto, publicado por el usuario alexwoods711, alcanza una precisión de 91,05 % en el conjunto de validación de SST-2, frente al 92,7 % de BERT-base-uncased. Su pequeño tamaño (66,9 millones de parámetros) y su licencia Apache 2.0 lo convierten en una opción ligera y accesible para tareas de clasificación de sentimiento en producción, especialmente en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (valor típico de DistilBERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en PyTorch, TensorFlow y ONNX según los tags del repositorio) |

## Arquitectura y entrenamiento

DistilBERT es un modelo transformer encoder basado en la arquitectura de BERT, pero reducido mediante destilación de conocimiento. El proceso de destilación transfiere las representaciones del modelo maestro (BERT-base) a un modelo estudiante con la mitad de capas, manteniendo la misma dimensionalidad de las representaciones internas. El checkpoint aquí descrito se obtiene ajustando el modelo preentrenado `distilbert-base-uncased` sobre el dataset SST-2 (Stanford Sentiment Treebank) para la tarea de clasificación de sentimiento binario (positivo/negativo). No se dispone de información adicional sobre el proceso de fine-tune (número de épocas, tasa de aprendizaje, etc.) más allá de las métricas reportadas en la model card.

## Capacidades

- Clasificación de texto binaria: análisis de sentimiento positivo/negativo sobre oraciones en inglés.
- Modelo encoder puro: no genera texto, no realiza tareas de generación, tool calling ni razonamiento multi-step.
- Soporte exclusivo del inglés; no es multilingüe.
- Adecuado para tareas de clasificación de texto corto (tweets, reseñas, comentarios) gracias a su ventana de contexto típica de 512 tokens.
- Integrable con la librería Transformers de Hugging Face, TensorFlow, ONNX y Rust (según los tags del repositorio).

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar tweets o publicaciones como positivas o negativas, permitiendo monitorizar la opinión pública sobre una marca o producto en tiempo real. Su baja latencia lo hace apto para pipelines de streaming.
- Moderación de comentarios: en foros o secciones de comentarios, se puede usar para filtrar mensajes tóxicos o negativos, aunque no está específicamente entrenado para toxicidad, solo para sentimiento binario.
- Clasificación de reseñas de productos: integrado en un sistema de recomendación, puede etiquetar automáticamente las reseñas de clientes como favorables o desfavorables, facilitando la gestión de feedback.
- Análisis de opiniones en encuestas: procesar respuestas abiertas de formularios y clasificarlas según su polaridad para obtener métricas de satisfacción.
- Detección de noticias o contenido negativo en feeds de noticias: clasificar titulares o artículos en positivo/negativo para alertas tempranas de crisis de reputación.
- Modelo base para transfer learning: aunque ya está ajustado para SST-2, puede servir como punto de partida para fine-tune en otros dominios de clasificación de texto en inglés, dado que el encoder preentrenado de DistilBERT ya captura características lingüísticas generales.

## Benchmarks y rendimiento

Los resultados de la model card (verificados por el autor) se presentan a continuación:

| Métrica | Valor (split validation) |
|---|---|
| Accuracy | 0,91055 |
| Precision | 0,89783 |
| Recall | 0,93018 |
| F1 | 0,91372 |
| AUC | 0,97166 |
| Loss | 0,39014 |

En el split de entrenamiento (SST-2 train), el modelo reporta accuracy de 0,98855, precision macro 0,98820, recall macro 0,98861 y F1 macro 0,98840. La model card indica que el modelo alcanza un 91,3 % de accuracy en el dev set, mientras que BERT-base-uncased logra 92,7 %. No se han publicado comparativas con otros modelos de la misma categoría en la información proporcionada.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de ~66 millones de parámetros, puede ejecutarse en CPU sin problemas. El tamaño de los pesos en FP32 es de aproximadamente 268 MB (66.955.010 × 4 bytes).
- Inferencia en GPU: cualquier GPU con al menos 1 GB de VRAM es suficiente para batch pequeño. Una GPU como la NVIDIA T4, GTX 1660 o RTX 3060 puede ejecutar el modelo con holgura.
- Cuantización: aunque no se han publicado cuantizaciones específicas, el modelo puede cuantizarse a int8 o int4 con herramientas como ONNX Runtime o PyTorch, reduciendo la memoria a ~70 MB y ~40 MB respectivamente.
- Despliegue: se puede servir con la librería Transformers de Hugging Face en Python, con ONNX Runtime para inferencia acelerada, o con Rust mediante la librería `rust-bert`. No es necesario usar servidores como vLLM (orientados a modelos generativos), aunque se puede exponer mediante una API REST con FastAPI y transformers.
- Latencia: en CPU moderna, una clasificación de una oración de ~20 tokens tarda entre 10 y 50 ms; en GPU, sub-5 ms. Throughput estimado: cientos de inferencias por segundo en GPU, decenas en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia |
|---|---|---|---|---|
| `distilbert-base-uncased-finetuned-sst-2-english` (este) | 66.9 M | 512 tokens (típico) | 91,05 % | Apache 2.0 |
| `bert-base-uncased` (fine-tune en SST-2) | 110 M | 512 | 92,7 % | Apache 2.0 |
| `distilbert-base-uncased` (sin fine-tune) | 66.9 M | 512 | no aplica (no entrenado para clasificación) | Apache 2.0 |

No se dispone de comparativas con otros modelos ajustados en SST-2 (como RoBERTa-base) en la información proporcionada.

## Limitaciones y advertencias

- Solo en inglés: el modelo no soporta otros idiomas; para textos no ingleses se obtendrán resultados incorrectos.
- Sesgos del dataset SST-2: el entrenamiento sobre SST-2 puede introducir sesgos relacionados con el dominio (reseñas de películas, lenguaje formal) y no generaliza bien a otros dominios sin fine-tune adicional.
- Riesgo de alucinación no aplica: al ser un modelo encoder, no genera texto, por lo que no hay riesgo de respuestas inventadas.
- Limitaciones de contexto: la ventana de 512 tokens (típica de DistilBERT) limita el análisis a textos cortos; textos largos deben truncarse o segmentarse.
- Solo clasificación binaria: el modelo distingue únicamente entre positivo y negativo; no detecta matices como neutral o mixto.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que se incluya el aviso de licencia.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/alexwoods711/distilbert-base-uncased-finetuned-sst-2-english)
- [Paper de DistilBERT (arXiv:1910.01108)](https://arxiv.org/abs/1910.01108)
- [Catálogo de modelos de Microsoft Foundry](https://ai.azure.com/catalog/models/distilbert-base-uncased-finetuned-sst-2-english)
