# kwondw/reranker-msmarco-v1.1-MiniLM-L12-H384-uncased-lambdaloss-hard-neg

## Resumen

Este modelo es un cross-encoder de reranking desarrollado por kwondw a partir de `microsoft/MiniLM-L12-H384-uncased`. Se utiliza para puntuar pares de texto y reordenar resultados de búsqueda semántica. Con 33.360.385 parámetros y una ventana de contexto de 512 tokens, está diseñado para tareas de reranking en pipelines de recuperación. Fue entrenado con la pérdida LambdaLoss y ejemplos difíciles (hard negatives), según el tag `dataset_size:167224`. Su relevancia radica en mejorar la precisión de sistemas de búsqueda al combinar un recuperador inicial con un reranker cross-encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (BertForSequenceClassification) |
| Parametros totales | 33.360.385 |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder que utiliza la arquitectura BERT de MiniLM-L12-H384-uncased. A diferencia de los bi-encoders, que codifican consulta y documento por separado, un cross-encoder procesa el par concatenado como una única secuencia y produce una puntuación de relevancia directamente. El modelo tiene una única etiqueta de salida (regresión de puntuación). Según los metadatos, fue entrenado con la pérdida LambdaLoss y con ejemplos difíciles (hard negatives), lo que sugiere un enfoque de aprendizaje por ranking. El tamaño del dataset de entrenamiento es de 167.224 ejemplos. No se especifican detalles adicionales sobre la composición del dataset ni sobre técnicas como RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Reranking de pares de texto: asigna una puntuación de relevancia a un par consulta-documento.
- Búsqueda semántica: puede integrarse como segunda etapa en un pipeline de recuperación.
- Clasificación de pares: útil para tareas de NLI o similaridad textual.
- No soporta tool calling ni agentes: es un modelo de puntuación, no un LLM generativo.
- Capacidades multilingües: no disponibles.
- Sin capacidades de visión o audio: solo texto.

## Casos de uso

- Reranking en motores de búsqueda: después de recuperar los 100 mejores documentos con un bi-encoder, este cross-encoder reordena los resultados para mejorar la precisión.
- Recuperación aumentada por generación (RAG): en un pipeline RAG, se usa para filtrar los pasajes más relevantes antes de pasarlos al generador.
- Preguntas y respuestas: para seleccionar la respuesta más adecuada entre varias candidatas.
- Búsqueda en e-commerce: reordenar productos según la consulta del usuario.
- Moderación de contenido: puntuar si una consulta coincide con contenido problemático o si dos textos son similares.
- Deduplicación de documentos: identificar pares de documentos casi idénticos.
- Clasificación de pares de texto: evaluar la relación entre dos textos (entailment, contradicción, neutral).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en conjuntos "Nano" (subconjuntos de 100 documentos):

| Dataset | MAP | MRR@10 | NDCG@10 |
|---|---|---|---|
| NanoMSMARCO R100 | 0.2574 | 0.2449 | 0.324 |
| NanoNFCorpus R100 | 0.3000 | 0.4670 | 0.3059 |
| NanoNQ R100 | 0.3013 | 0.2839 | 0.3513 |
| NanoBEIR R100 mean | 0.2862 | 0.3319 | 0.3271 |

Nota: estos valores no están verificados y corresponden a subconjuntos reducidos, por lo que no son directamente comparables con benchmarks estándar como MS MARCO completo o BEIR.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 133 MB para los pesos; en FP16, aproximadamente 67 MB. Con overhead de ejecución, una GPU con 1 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna, incluso una GTX 1060 o superior. También funciona en CPU.
- Cabe en consumer GPU: sí, es un modelo pequeño.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Text Embeddings Inference, o mediante el pipeline de transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos en la información proporcionada. Se mencionan como referencia modelos cross-encoder similares disponibles en Hugging Face, como `cross-encoder/ms-marco-MiniLM-L-6-v2` y `cross-encoder/ms-marco-MiniLM-L-12-v2`, pero no se aportan datos de parámetros, contexto, rendimiento ni licencia en la información disponible.

## Limitaciones y advertencias

- Sesgos: no disponibles. El modelo base MiniLM fue entrenado en inglés, por lo que puede presentar sesgos del dominio.
- Riesgo de alucinación: como cross-encoder, no genera texto, pero puede producir puntuaciones poco fiables en pares fuera de distribución.
- Limitaciones de contexto: máximo 512 tokens por par, lo que impide evaluar documentos largos.
- Idioma: no especificado, pero el modelo base es "uncased" para inglés, por lo que probablemente solo funcione bien en inglés.
- Restricciones de licencia: licencia no disponible, lo que puede limitar el uso comercial.
- Caveat para producción: los benchmarks son en conjuntos "Nano" (subconjuntos pequeños), por lo que no representan el rendimiento en datos reales a gran escala.

## Enlaces

- HuggingFace: https://huggingface.co/kwondw/reranker-msmarco-v1.1-MiniLM-L12-H384-uncased-lambdaloss-hard-neg
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
