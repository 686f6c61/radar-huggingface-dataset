# mradermacher/rank1-mistral-2501-24b-GGUF

## Resumen

Rank1-mistral-2501-24b es un modelo de reranking (reordenación de resultados de recuperación) desarrollado por el grupo JHU-CLSP (Johns Hopkins University, Center for Language and Speech Processing) y publicado originalmente en Hugging Face bajo el identificador `jhu-clsp/rank1-mistral-2501-24b`. La versión aquí descrita es una cuantización GGUF estática realizada por mradermacher, pensada para su ejecución local con llama.cpp y herramientas compatibles. El modelo parte de una base Mistral de 24B (concretamente 23.573.058.560 parámetros según los pesos safetensors) afinada específicamente para la tarea de reranking dentro de pipelines de recuperación de información (RAG, búsqueda semántica, etc.).

El modelo resuelve el problema de la segunda fase de recuperación: dado un conjunto de documentos candidatos devueltos por un retriever (BM25, embeddings densos, etc.), el reranker asigna una puntuación de relevancia más precisa a cada par consulta-documento. Al estar basado en un LLM de 24B en lugar de un cross-encoder clásico, aprovecha el conocimiento lingüístico y semántico del modelo base, aunque a costa de un mayor coste computacional.

Es relevante ahora porque ofrece una alternativa de código abierto (licencia MIT) a los rerankers propietarios, con cuantizaciones que van desde 9 GB (Q2_K) hasta 25,2 GB (Q8_0), lo que permite desplegarlo en hardware relativamente modesto. El modelo está entrenado exclusivamente en inglés y su uso principal es la reordenación de pasajes en sistemas de recuperación aumentada por generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral), afinado como reranker |
| Parametros totales | 23.573.058.560 (23,57B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral 2501 suele soportar 32k, pero no se confirma en la ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original esta en safetensors |
| Tamano del repo | 161,4 GB (incluye todas las cuantizaciones) |
| Modelo base | jhu-clsp/rank1-mistral-2501-24b |
| Dataset de entrenamiento | jhu-clsp/rank1-training-data |
| Libreria | transformers (modelo original), compatible con llama.cpp para GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Mistral (la variante "2501" de 24B, presumiblemente Mistral Small 3 o una versión similar de la familia Mistral de enero de 2025). Sobre esa base, JHU-CLSP realizó un ajuste fino supervisado específico para reranking utilizando el dataset `jhu-clsp/rank1-training-data`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación principal es el uso de un LLM generativo como reranker, en lugar de un cross-encoder pequeño, lo que permite capturar dependencias semánticas más complejas entre consulta y documento.

La cuantización realizada por mradermacher es de tipo estático (static quants), sin versiones ponderadas con imatrix en el momento de la publicación. Esto implica que las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar más la calidad que sus equivalentes con imatrix. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.) en la información disponible.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia, pensado para la segunda fase de pipelines de recuperación.
- Recuperación de información (retrieval): integrable en sistemas RAG para mejorar la precisión de los documentos seleccionados.
- Procesamiento de texto en inglés: el modelo está entrenado y evaluado únicamente en inglés.
- Conversacional: la etiqueta `conversational` sugiere que el modelo base conserva capacidades de diálogo, aunque su afinamiento está orientado a reranking.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles (solo inglés).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en infraestructuras compatibles con la API de Hugging Face.

## Casos de uso

- Reranking en pipelines RAG: dado un conjunto de fragmentos recuperados por un retriever vectorial o BM25, el modelo reordena los candidatos por relevancia antes de pasarlos al LLM generador, mejorando la calidad de las respuestas y reduciendo alucinaciones por contexto irrelevante.
- Búsqueda semántica en documentación técnica: en un buscador interno sobre manuales o código, el modelo puede puntuar pares consulta-pasaje para priorizar los resultados más útiles, aprovechando su base Mistral de 24B para captar matices semánticos.
- Filtrado de resultados en motores de búsqueda empresarial: integrado como etapa de reordenación sobre los top-k resultados de un motor como Elasticsearch, reduce el ruido en los primeros puestos.
- Sistemas de preguntas y respuestas sobre corpus legales o científicos: el reranker selecciona los pasajes más relevantes de un corpus extenso antes de la generación, lo que es crítico cuando el contexto del LLM es limitado.
- Evaluación de relevancia en datasets de recuperación: puede usarse para anotar o validar pares consulta-documento en tareas de evaluación de sistemas de IR.
- Despliegue local con llama.cpp: gracias a las cuantizaciones GGUF (desde 9 GB en Q2_K), puede ejecutarse en estaciones de trabajo con GPU consumer para prototipos y pruebas de concepto de sistemas de recuperación.
- Investigación en recuperación de información: al ser MIT y de código abierto, sirve como baseline reproducible para experimentos académicos de reranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~9 GB
  - Q3_K_S: ~10,5 GB
  - Q3_K_M: ~11,6 GB
  - Q3_K_L: ~12,5 GB
  - IQ4_XS: ~13 GB
  - Q4_K_S: ~13,6 GB
  - Q4_K_M: ~14,4 GB
  - Q5_K_S: ~16,4 GB
  - Q5_K_M: ~16,9 GB
  - Q6_K: ~19,4 GB
  - Q8_0: ~25,2 GB
- GPU recomendadas: para Q4_K_M (~14,4 GB) cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q8_0 (~25,2 GB) se necesita una A100 40GB, H100 o varias GPU consumer.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con cuantizaciones Q4 o Q5; en GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) caben Q3_K_M o IQ4_XS con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con GGUF; el modelo original en safetensors puede servirse con vLLM o TGI, aunque no se documenta en la ficha.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rank1-mistral-2501-24b (este) | 23,57B | no disponible | MIT | GGUF, safetensors | Reranker basado en Mistral 24B |
| BGE-reranker-v2-m3 | ~568M | 8k (aprox.) | MIT | safetensors, ONNX | Cross-encoder ligero, mucho más rápido pero menos expresivo |
| Cohere Rerank 3.5 | no disponible | no disponible | Propietaria (API) | API | Servicio comercial, sin pesos abiertos |
| jina-reranker-v2-base-multilingual | ~278M | 8k (aprox.) | CC BY-NC 4.0 | safetensors | Multilingüe, no apto para uso comercial sin licencia |

La comparativa con modelos de la misma categoría (rerankers) muestra que este modelo es sustancialmente más grande que los cross-encoders habituales (BGE, Jina), lo que implica mayor coste de inferencia pero potencialmente mayor precisión semántica. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Mistral, puede heredar sesgos del modelo base.
- Riesgo de alucinación: aunque es un reranker (no generativo en su uso principal), al ser un LLM puede producir puntuaciones inconsistentes si se usa fuera de su formato esperado.
- Limitaciones de contexto o idioma: solo inglés; la longitud de contexto no está confirmada en la ficha.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones adicionales, pero el modelo base Mistral puede tener sus propias condiciones (no especificadas aquí).
- Caveats para producción: las cuantizaciones estáticas (sin imatrix) pueden degradar la calidad en Q2_K y Q3_K; se recomienda Q4_K_M o superior para uso en producción. El repo es muy grande (161,4 GB) por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- No se han publicado benchmarks que validen su calidad frente a alternativas, lo que dificulta la comparación objetiva.

## Enlaces

- [Hugging Face: mradermacher/rank1-mistral-2501-24b-GGUF](https://huggingface.co/mradermacher/rank1-mistral-2501-24b-GGUF)
- [Modelo base: jhu-clsp/rank1-mistral-2501-24b](https://huggingface.co/jhu-clsp/rank1-mistral-2501-24b)
- [Dataset de entrenamiento: jhu-clsp/rank1-training-data](https://huggingface.co/datasets/jhu-clsp/rank1-training-data)
- [Página de descargas de mradermacher](https://hf.tst.eu/model#rank1-mistral-2501-24b-GGUF)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [README de referencia para GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico comparativo de cuantizaciones (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
