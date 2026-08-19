# istt-aiml-data/Criminal-Qwen3-Reranker-0.6B-Augmented-aio

## Resumen

Criminal-Qwen3-Reranker-0.6B-Augmented-aio es un modelo cross-encoder de reranking desarrollado por istt-aiml-data, especializado en la desambiguación de jerga y lenguaje coloquial vietnamita. Se construye sobre el modelo base Qwen/Qwen3-Reranker-0.6B, que a su vez forma parte de la familia Qwen3 de Alibaba, y se ha ajustado con un conjunto de datos de 1082 muestras etiquetadas que contienen conversaciones con slang y sus correspondientes definiciones contextuales. El modelo resuelve el problema de asignar el significado correcto a términos ambiguos (como "bò vàng" o "đu càng") según el contexto conversacional, una tarea crítica para sistemas de búsqueda semántica, moderación de contenido y análisis de redes sociales en vietnamita.

Con 595 millones de parámetros, es un modelo ligero que se puede ejecutar en hardware de consumo. Su longitud de contexto máxima es de 1024 tokens, suficiente para manejar conversaciones cortas y definiciones. La licencia Apache 2.0 permite uso comercial sin restricciones, y su formato safetensors facilita la integración en pipelines modernos. Aunque es un modelo de nicho, su relevancia radica en cubrir un hueco poco atendido: la comprensión de jerga vietnamita, donde los modelos multilingües generalistas suelen fallar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en Qwen3ForCausalLM con capa LogitScore |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en fp32/fp16) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre la arquitectura Qwen3ForCausalLM, que en su versión de 0.6B es un transformer denso con atención causal. La capa final LogitScore compara las logits de dos tokens especiales (true_token_id 9693 y false_token_id 2152) para producir una puntuación de relevancia entre un par de textos. Este diseño es típico de los rerankers de la familia Qwen3, que se entrenan para predecir si una respuesta es relevante dado un contexto.

El entrenamiento se realizó con la librería sentence-transformers, utilizando la función de pérdida MultipleNegativesRankingLoss sobre un conjunto de datos de 1082 muestras. Los datos consisten en conversaciones en vietnamita con jerga (slang) y definiciones contextuales, junto con ejemplos negativos para enseñar al modelo a distinguir entre significados. No se dispone de información sobre el número de épocas, la tasa de aprendizaje ni la composición exacta del dataset de entrenamiento. Tampoco se menciona el uso de técnicas como RLHF o DPO; el ajuste es supervisado de forma estándar.

## Capacidades

- Reranking de pares de textos: dado un contexto y varias candidatas, asigna una puntuación de relevancia a cada par.
- Desambiguación de jerga vietnamita: identifica el significado correcto de términos polisémicos (por ejemplo, "bò vàng" puede referirse a un animal o a un insulto político) según el contexto conversacional.
- Búsqueda semántica: puede utilizarse como etapa de reranking en pipelines de recuperación para mejorar la precisión de resultados.
- Soporte de entrada multimodal textual: acepta tanto texto plano como mensajes con formato (campo "message" en la arquitectura).
- No soporta tool calling, generación de código, matemáticas avanzadas ni razonamiento multi-paso; es un modelo puramente discriminativo.
- Capacidad multilingüe limitada: entrenado exclusivamente en vietnamita, aunque el modelo base Qwen3 tiene capacidades multilingües, el ajuste fino puede degradar el rendimiento en otros idiomas.

## Casos de uso

- Moderación de contenido en redes sociales vietnamitas: el modelo puede clasificar si una expresión coloquial se usa con intención ofensiva o neutral, ayudando a filtrar discursos de odio o acoso. Se integraría como un clasificador binario sobre pares (conversación, definición) para detectar usos peyorativos.
- Búsqueda semántica en foros y comunidades vietnamitas: al combinar un recuperador inicial con este reranker, se puede mejorar la precisión de resultados cuando los usuarios buscan usando jerga local, ya que el modelo entiende el contexto cultural.
- Análisis de opinión y sentimiento en textos coloquiales: permite identificar el significado real de términos ambiguos en reseñas o comentarios, mejorando la exactitud de los análisis de sentimiento.
- Sistemas de preguntas y respuestas sobre cultura vietnamita: el modelo puede ayudar a responder preguntas que involucran modismos o expresiones locales, seleccionando la definición más adecuada entre varias opciones.
- Asistentes virtuales para atención al cliente en vietnamita: cuando un usuario usa jerga o abreviaturas, el reranker ayuda a interpretar correctamente la intención antes de pasar la consulta a un modelo generativo.
- Investigación sociolingüística: el modelo puede etiquetar grandes corpus de conversaciones para estudiar la evolución del slang vietnamita y su distribución geográfica o social.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación "slang disambiguation eval" (tipo cross-encoder-reranking):

| Metrica | Valor |
|---|---|
| MAP | 0,8387 |
| MRR@10 | 0,8387 |
| NDCG@10 | 0,8799 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores indican un rendimiento sólido en la tarea de desambiguación, con un NDCG@10 superior a 0,87, lo que sugiere que el modelo ordena correctamente las definiciones relevantes en la mayoría de los casos.

## Requisitos de hardware

- VRAM estimada: con 595M parámetros, el modelo ocupa aproximadamente 1,2 GB en fp16 y unos 600 MB en int8. Cabe en cualquier GPU consumer con 4 GB de VRAM o más.
- GPU recomendadas: NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090, o cualquier GPU con al menos 4 GB de memoria. También es viable en CPU con suficiente RAM (unos 2 GB para fp16).
- Opciones de despliegue: sentence-transformers (inferencia directa), vLLM (soporta Qwen3-Reranker según su documentación), Hugging Face Inference Endpoints, o exportación a ONNX para entornos de producción.
- Latencia estimada: al ser un cross-encoder, la inferencia es O(n) con respecto al número de pares. En una GPU moderna, un par de 100 tokens tarda unos pocos milisegundos; en CPU, decenas de milisegundos. El throughput dependerá del batch, pero para un modelo de este tamaño se pueden procesar cientos de pares por segundo en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento (NDCG@10) |
|---|---|---|---|---|---|
| Criminal-Qwen3-Reranker-0.6B-Augmented | 595M | 1024 | vietnamita | Apache 2.0 | 0,8799 (slang disambiguation) |
| Qwen/Qwen3-Reranker-0.6B (base) | 595M | 1024 | multilingue | Apache 2.0 | no disponible |
| BAAI/bge-reranker-v2-m3 | 568M | 8192 | multilingue | MIT | no disponible |

El modelo base Qwen3-Reranker-0.6B es la referencia directa; el ajuste fino con datos de jerga vietnamita debería mejorar el rendimiento en esa tarea específica, aunque no se dispone de una comparativa cuantitativa. BGE-reranker-v2-m3 es un cross-encoder multilingüe con mayor contexto, pero no está especializado en vietnamita coloquial. No se dispone de datos de rendimiento de estos modelos en el dataset de evaluación.

## Limitaciones y advertencias

- Entrenado exclusivamente en vietnamita; no se recomienda su uso en otros idiomas, ya que el ajuste fino puede haber degradado las capacidades multilingües del modelo base.
- El conjunto de entrenamiento es muy reducido (1082 muestras), lo que puede limitar la generalización a jergas regionales o nuevas expresiones no presentes en los datos.
- La longitud de contexto de 1024 tokens es corta para conversaciones largas; en diálogos extensos, el modelo podría perder información relevante.
- Riesgo de sesgo: los ejemplos de entrenamiento incluyen términos políticamente sensibles (como insultos hacia ciertos grupos), por lo que el modelo podría reflejar sesgos sociales o culturales presentes en los datos.
- No se han publicado evaluaciones de robustez ante ataques adversarios ni de rendimiento en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantías sobre la calidad del modelo en escenarios de alto riesgo (moderación automática, decisiones legales, etc.).
- El modelo no es generativo; solo produce puntuaciones, por lo que no puede explicar sus decisiones ni generar texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/istt-aiml-data/Criminal-Qwen3-Reranker-0.6B-Augmented-aio
- Paper de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Documentación de sentence-transformers para Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Guía de vLLM para Qwen3-Reranker: https://docs.vllm.ai/projects/ascend/en/v0.23.0/tutorials/models/Qwen3-Reranker.html
