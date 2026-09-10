# pranamjain/bge-finetuned-rag

## Resumen

pranamjain/bge-finetuned-rag es un modelo de embeddings de frases (sentence embedding) obtenido mediante fine-tuning del modelo BAAI/bge-base-en-v1.5. Lo desarrolla el usuario pranamjain y está pensado para tareas de recuperación de información (information retrieval) dentro de pipelines de generación aumentada por recuperación (RAG). Su función es convertir textos en vectores densos de 768 dimensiones para poder calcular similitud semántica y ordenar pasajes candidatos frente a una consulta.

Técnicamente es un transformer encoder de tipo BERT con 109.482.240 parámetros (aproximadamente 0,11 mil millones), el mismo tamaño que su modelo base. Se ha entrenado con un conjunto de datos de 6.300 ejemplos y dos funciones de pérdida: MultipleNegativesRankingLoss (aprendizaje contrastivo para recuperación) y MatryoshkaLoss (representaciones truncables). Los ejemplos de la model card sugieren un dominio de documentos financieros y legales (informes 10-K, patentes, litigios), por lo que el fine-tuning parece orientado a RAG sobre texto corporativo denso en datos.

Es relevante ahora porque reutiliza una arquitectura consolidada y ligera que cabe en hardware de consumo, y porque incorpora Matryoshka, lo que permite reducir la dimensión del embedding en producción sin reentrenar. No obstante, el modelo tiene muy poca tracción (0 descargas, 1 like) y no declara licencia ni idiomas, por lo que debe evaluarse con cautela antes de usarlo en entornos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en BERT (derivado de BAAI/bge-base-en-v1.5) |
| Parámetros totales | 109.482.240 |
| Longitud de contexto | 512 tokens (heredada del modelo base BAAI/bge-base-en-v1.5) |
| Tipos de cuantización | no disponible (pesos en safetensors; los tags indican compatibilidad con text-embeddings-inference) |
| Idiomas soportados | no disponible (el modelo base BAAI/bge-base-en-v1.5 está orientado principalmente al inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensión del embedding | 768 (evaluado como «dim 768» en la model card) |
| Tamaño del repositorio | 0,4 GB |
| Modelo base | BAAI/bge-base-en-v1.5 |
| Biblioteca | sentence-transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, idéntico en estructura a BAAI/bge-base-en-v1.5 (12 capas, dimensión oculta 768, alrededor de 110 millones de parámetros). No es un modelo generativo ni un modelo de mezcla de expertos (MoE): su salida es un vector de embedding de 768 dimensiones que se puede usar directamente con similitud coseno. El entrenamiento parte de los pesos del modelo base y se ha realizado con la librería sentence-transformers, como indica el tag generated_from_trainer.

El conjunto de entrenamiento declarado tiene 6.300 ejemplos y se ha optimizado con dos pérdidas combinadas. MultipleNegativesRankingLoss es una pérdida contrastiva habitual en recuperación, que acerca las consultas a sus pasajes positivos y aleja los negativos del lote. MatryoshkaLoss (Matryoshka Representation Learning, arXiv 2205.13147) entrena el modelo para que los primeros tramos del vector (por ejemplo, las primeras 256 o 128 dimensiones) mantengan la calidad semántica, lo que permite truncar el embedding en inferencia y ahorrar memoria y tiempo de búsqueda. Los tags también referencian Sentence-BERT (arXiv 1908.10084) y una tercera publicación (arXiv 1807.03748). No se especifica en la información disponible qué proporción de RLHF, DPO u otros ajustes por preferencias se han aplicado.

## Capacidades

- Generación de embeddings de frases y pasajes de 768 dimensiones para similitud semántica y recuperación.
- Recuperación de información (information retrieval): ordena pasajes candidatos frente a una consulta por relevancia.
- Extracción de características (feature extraction) y cálculo de similitud semántica (pipeline sentence-similarity).
- Embeddings truncables gracias a Matryoshka: permite usar subvectores de dimensión reducida con pérdida de calidad controlada.
- No es un modelo generativo: no produce texto, no mantiene conversación y no realiza razonamiento multi-paso por sí mismo.
- No se declara soporte de tool calling, function calling ni capacidades de agente.
- No se declara soporte multilingüe explícito; el modelo base está orientado al inglés.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Recuperación aumentada (RAG) sobre documentación corporativa: indexar fragmentos de informes financieros y recuperar los pasajes relevantes para una consulta, aprovechando el ajuste observado en los ejemplos de la model card (10-K, patentes, litigios).
- Búsqueda semántica en corpus legales: consultas sobre cláusulas, demandas o vencimientos de patentes, usando similitud coseno sobre los embeddings de 768 dimensiones.
- Deduplicación y agrupación de documentos: generar embeddings de cada documento y agrupar por cercanía para detectar duplicados o temas repetidos.
- Filtrado y reordenación (reranking ligero) de candidatos: utilizar el modelo como primera etapa de recuperación antes de un reranker más costoso.
- Clasificación por similitud con prototipos: asignar etiquetas comparando el embedding de un texto con embeddings de referencia de cada categoría.
- Sistemas de recomendación basados en contenido: representar ítems y consultas en el mismo espacio vectorial para recomendar documentos o productos similares.
- Indexación económica en producción con Matryoshka: reducir la dimensión del embedding para bajar el coste de almacenamiento del índice vectorial manteniendo buena parte de la precisión de recuperación.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en el model-index de la model card, sobre la tarea Information Retrieval con embeddings de dimensión 768. Los valores no están verificados de forma independiente.

| Métrica (dim 768) | @1 | @3 | @5 | @10 |
|---|---|---|---|---|
| Cosine accuracy | 0,8786 | 0,9486 | 0,9643 | 0,9800 |
| Cosine precision | 0,8786 | 0,3162 | 0,1929 | 0,0980 |
| Cosine recall | 0,8786 | 0,9486 | 0,9643 | 0,9800 |

La model card lista además las métricas cosine_ndcg@10, cosine_mrr@10 y cosine_map@100, pero los valores numéricos de estas tres no están completos en la información proporcionada, por lo que no se reproducen aquí. No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32, unos 0,22 GB en FP16 y alrededor de 0,11 GB en INT8, para el modelo completo (109 millones de parámetros).
- Cabe sin problema en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090, así como en CPU o en dispositivos de borde (por ejemplo, Raspberry Pi) para cargas ligeras.
- GPUs de centro de datos (T4, A10, A100, H100) sobredimensionadas para este modelo; se usan habitualmente para servir muchas réplicas o lotes grandes.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI, etiquetado como text-embeddings-inference y endpoints_compatible en el repositorio), ONNX Runtime y servicios de Hugging Face Inference Endpoints. No se ha confirmado compatibilidad con llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pranamjain/bge-finetuned-rag | 109,48 M | 512 (heredado del base) | no disponible | Hugging Face (sentence-transformers) |
| BAAI/bge-base-en-v1.5 (modelo base) | ~109 M | 512 | MIT (según repositorio público del base) | Hugging Face |
| BAAI/bge-large-en-v1.5 | ~335 M | 512 | MIT (según repositorio público del base) | Hugging Face |
| intfloat/e5-base-v2 | ~109 M | 512 | MIT (según repositorio público del base) | Hugging Face |

No se dispone, en la información proporcionada, de resultados de recuperación comparables entre estos modelos bajo las mismas métricas, por lo que la comparación de rendimiento queda como no disponible. La ventaja diferencial de este modelo frente a su base es el fine-tuning con Matryoshka y múltiples negativos sobre datos del dominio financiero/legal; su desventaja es la falta de licencia declarada y su escasa validación externa.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, no se puede asumir permiso para uso comercial; hay que contactar con el autor o evitar su uso en producción.
- Idiomas no declarados: el modelo base está orientado al inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Sesgos: al derivar de BERT entrenado principalmente con texto en inglés y ajustado sobre documentos financieros/legales, puede heredar sesgos presentes en esos corpus y un sesgo de dominio hacia ese tipo de texto.
- Riesgo de alucinación: aunque un modelo de embeddings no genera texto, un detector de similitud mal calibrado puede recuperar pasajes irrelevantes como si fueran pertinentes, lo que degrada la calidad de un sistema RAG aguas abajo.
- Contexto limitado a 512 tokens: los documentos deben fragmentarse, lo que puede romper la coherencia semántica en pasajes largos.
- Sin verificación independiente: los resultados de la model card son declarados por el autor (verified: false) y no han sido replicados externamente.
- Adopción mínima: 0 descargas y 1 like en el momento de la consulta, sin señales de uso en producción.
- La fecha de creación registrada (2026-09-10) resulta inusual; conviene verificar la vigencia y el mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranamjain/bge-finetuned-rag
- Modelo base BAAI/bge-base-en-v1.5: https://huggingface.co/BAAI/bge-base-en-v1.5
- Sentence-BERT (arXiv 1908.10084): https://arxiv.org/abs/1908.10084
- Matryoshka Representation Learning (arXiv 2205.13147): https://arxiv.org/abs/2205.13147
- Referencia arXiv 1807.03748 citada en los tags: https://arxiv.org/abs/1807.03748
- Las búsquedas web realizadas no devolvieron enlaces relevantes sobre el modelo; los resultados obtenidos eran foros no relacionados.
