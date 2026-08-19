# kwondw/reranker-ModernBERT-base-gooaq-bce

## Resumen

El modelo `kwondw/reranker-ModernBERT-base-gooaq-bce` es un cross-encoder de reranking de texto, desarrollado por el usuario kwondw mediante fine-tuning del modelo base `answerdotai/ModernBERT-base` sobre el dataset de preguntas y respuestas GooAQ. Su propósito es calcular puntuaciones de relevancia entre pares de textos (consulta y documento), lo que lo hace adecuado para mejorar la precisión de sistemas de recuperación de información, búsqueda semántica y pipelines de retrieval-augmented generation (RAG).

La arquitectura se basa en ModernBERT, un transformer encoder moderno con una longitud de contexto de 8192 tokens, notablemente superior a la de los BERT clásicos. El modelo tiene aproximadamente 149,6 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas. Su relevancia actual radica en que ofrece una alternativa eficiente y de código abierto para tareas de reranking, un componente crítico en sistemas de búsqueda de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (ModernBertForSequenceClassification) |
| Parametros totales | 149.605.633 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, lo que significa que procesa simultáneamente el par consulta-documento como una única secuencia de entrada y produce una puntuación de relevancia en la salida. La arquitectura subyacente es ModernBERT, un encoder transformer que introduce mejoras sobre BERT clásico, como una mayor longitud de contexto (8192 tokens), atención con Flash Attention y una mayor eficiencia computacional.

El entrenamiento se realizó sobre el dataset GooAQ, que contiene pares de preguntas y respuestas de Google. Según los metadatos de HuggingFace, el dataset de entrenamiento tiene un tamaño de 292.161 muestras y se utilizó la función de pérdida `BinaryCrossEntropyLoss`, típica para tareas de clasificación binaria de relevancia. El modelo fue entrenado con la librería sentence-transformers, y el script de entrenamiento está disponible públicamente en el repositorio del autor original.

## Capacidades

- Reranking de pares de textos: calcula una puntuación de relevancia entre una consulta y un documento.
- Búsqueda semántica: puede ordenar una lista de documentos candidatos según su similitud con una consulta dada.
- Integración en pipelines RAG: mejora la calidad de los resultados recuperados por un sistema de retrieval.
- Procesamiento de contexto largo: soporta secuencias de hasta 8192 tokens, útil para documentos extensos.
- Modelo exclusivamente en inglés: no soporta otros idiomas de forma nativa.
- No dispone de capacidades de generación de texto, tool calling ni razonamiento multi-paso, ya que es un encoder puro.

## Casos de uso

- Mejora de motores de búsqueda internos: el modelo puede reordenar los resultados de un buscador corporativo, priorizando los documentos más relevantes para cada consulta y reduciendo el ruido en los resultados.
- Sistemas de preguntas y respuestas (QA): en un pipeline de QA, el modelo puede filtrar y ordenar las respuestas candidatas extraídas de una base de conocimiento, asegurando que la respuesta final sea la más precisa.
- Retrieval-augmented generation (RAG): en un sistema RAG, el reranker puede refinar los fragmentos recuperados antes de pasarlos al modelo generativo, mejorando la coherencia y exactitud de las respuestas generadas.
- Búsqueda de documentación técnica: los equipos de desarrollo pueden integrar el modelo para buscar en manuales, APIs y foros internos, obteniendo resultados más relevantes que con una búsqueda por palabras clave.
- Moderación de contenido o clasificación de pares: aunque no es su uso principal, el cross-encoder puede adaptarse para puntuar la similitud entre textos, como en sistemas de detección de duplicados o recomendación de artículos relacionados.
- Evaluación de relevancia en datasets de IR: investigadores pueden usar el modelo para anotar automáticamente la relevancia de pares consulta-documento en la construcción de datasets de evaluación.

## Benchmarks y rendimiento

Los resultados que se presentan a continuación son los declarados por el autor del modelo en la model card de HuggingFace. No se han verificado de forma independiente.

| Dataset | MAP | MRR@10 | NDCG@10 |
|---|---|---|---|
| gooaq dev | 0.7842 | 0.7827 | 0.8182 |
| NanoMSMARCO R100 | 0.4839 | 0.4753 | 0.5681 |
| NanoNFCorpus R100 | 0.3422 | 0.5542 | 0.3908 |
| NanoNQ R100 | 0.6052 | 0.6189 | 0.6657 |
| NanoBEIR R100 (media) | 0.4771 | 0.5495 | 0.5415 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 149,6 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 600 MB de memoria.
- En cuantización fp16 o bf16, la huella de memoria se reduce a unos 300 MB, lo que permite su ejecución en GPUs de consumo como la RTX 3060 o superiores.
- Para inferencia en CPU, es viable pero con latencias mayores; se recomienda usar una GPU para aplicaciones en tiempo real.
- El despliegue puede realizarse con librerías compatibles con sentence-transformers, como Hugging Face Inference Endpoints, Text Embeddings Inference (TEI) o mediante un servidor Python personalizado.
- No se han publicado datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa cuantitativa con otros cross-encoders de la misma categoría. Como referencia, el modelo base ModernBERT-base es un encoder de propósito general con 149 millones de parámetros y 8192 tokens de contexto, mientras que otros cross-encoders populares como los basados en BERT-base suelen tener 110 millones de parámetros y 512 tokens de contexto. Esta diferencia en el contexto es una ventaja significativa para documentos largos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que su rendimiento en otros idiomas será muy limitado o nulo.
- Al ser un cross-encoder, requiere procesar cada par consulta-documento de forma independiente, lo que puede ser computacionalmente costoso si hay muchos candidatos a reordenar.
- Los benchmarks publicados son declarados por el autor y no han sido verificados de forma independiente; se recomienda validar el rendimiento en el caso de uso específico.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento de GooAQ, que provienen de consultas de Google y pueden reflejar sesgos demográficos o culturales.
- No se han documentado limitaciones específicas de alucinación, al ser un modelo discriminativo y no generativo.
- El tamaño del dataset de entrenamiento (292.161 muestras) es relativamente pequeño en comparación con otros datasets de reranking, lo que podría limitar su generalización a dominios muy especializados.

## Enlaces

- [HuggingFace - kwondw/reranker-ModernBERT-base-gooaq-bce](https://huggingface.co/kwondw/reranker-ModernBERT-base-gooaq-bce)
- [HuggingFace - modelo original de tomaarsen](https://huggingface.co/tomaarsen/reranker-ModernBERT-base-gooaq-bce)
- [GitHub - AnswerDotAI/ModernBERT](https://github.com/AnswerDotAI/ModernBERT)
- [Modelo en AIBase](https://model.aibase.com/models/details/1915693360192577537)
- [Variante del modelo en HuggingFace (Oysiyl)](https://huggingface.co/Oysiyl/reranker-ModernBERT-base-gooaq-bce)
