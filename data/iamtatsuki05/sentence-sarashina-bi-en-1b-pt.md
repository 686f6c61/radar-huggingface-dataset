# iamtatsuki05/Sentence-Sarashina-Bi-EN-1B-PT

## Resumen

Sentence-Sarashina-Bi-EN-1B-PT es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 (proyecto MIREI) que envuelve el modelo base sarashina2.2-Bi-1b con un entrenamiento contrastivo débilmente supervisado. Convierte texto en vectores densos de 1.792 dimensiones (mean pooling) mediante una arquitectura Llama de 1.224 millones de parámetros, pensada para tareas de recuperación de información, similitud semántica y feature extraction.

El modelo se entrena sobre los subconjuntos débilmente supervisados de sentence-transformers/embedding-training-data (aproximadamente 43 millones de pares en total, según la serie MIREI), lo que lo sitúa en la categoría de encoders de una sola torre (bi-encoder) para retrieval denso. Su ventana de contexto alcanza los 8.192 tokens, con tokenizer SentencePiece de vocabulario 102.400 y codificación posicional RoPE.

Es relevante porque forma parte de un estudio comparativo de arquitecturas (ModernBERT frente a Llama) bajo condiciones de entrenamiento idénticas, publicado en NLP2026, y porque ofrece una alternativa de 1B parámetros con licencia MIT para pipelines de búsqueda semántica en inglés. El repositorio no registra descargas ni interacciones en el momento de la consulta, lo que indica que es un modelo reciente y poco adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder adaptado a encoder de embeddings) |
| Parametros totales | 1.224.038.144 (1.224M) |
| Parametros activos | no disponible (no es MoE) |
| Parametros sin embeddings | 1.040M |
| Longitud de contexto | 8.192 tokens |
| Dimension de embedding | 1.792 (mean pooling) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tokenizer | SentencePiece, vocabulario 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Tamano del repo | 4,9 GB |
| Libreria | sentence-transformers (>=4.1.0) |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo se construye sobre iamtatsuki05/sarashina2.2-Bi-1b, un transformer de tipo Llama con 1.224M parámetros totales (1.040M excluyendo embeddings). La capa de salida se sustituye por un pooling de media sobre las representaciones del último estado oculto, produciendo vectores de 1.792 dimensiones normalizados para similitud coseno. La codificación posicional es RoPE y el tokenizer es SentencePiece con un vocabulario de 102.400 entradas, lo que explica la diferencia entre parámetros totales y parámetros sin embeddings.

El entrenamiento consiste en aprendizaje contrastivo débilmente supervisado sobre los subconjuntos correspondientes de sentence-transformers/embedding-training-data, con aproximadamente 43 millones de pares en la receta compartida por la serie MIREI. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste fino adicionales. La innovación metodológica principal es la comparación controlada entre arquitecturas (ModernBERT y Llama) bajo idéntico régimen de entrenamiento, presentada en el trabajo citado de NLP2026.

## Capacidades

- Generación de embeddings de frases en inglés de 1.792 dimensiones con normalización L2 opcional.
- Recuperación densa (dense retrieval) y búsqueda semántica mediante similitud coseno.
- Similitud semántica entre pares de frases y detección de duplicados o paráfrasis.
- Feature extraction para pipelines de clasificación, clustering y reranking.
- Procesamiento de secuencias de hasta 8.192 tokens, adecuado para documentos largos y chunks extensos.
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- Soporte de tool calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de chat).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y fragmentos de hasta 8.192 tokens y recuperar los pasajes más relevantes para una consulta en inglés mediante similitud coseno, aprovechando el contexto largo para reducir el número de chunks.
- Motor de recuperación en pipelines RAG: generar embeddings de documentos y consultas para alimentar un sistema de generación aumentada, con la ventaja de que los vectores de 1.792 dimensiones ofrecen mayor capacidad expresiva que modelos de 384 o 768 dimensiones.
- Deduplicación y clustering de contenidos: agrupar artículos, tickets o reseñas semánticamente equivalentes calculando la matriz de similitud coseno sobre los embeddings normalizados.
- Reranking de resultados de búsqueda léxica: combinar BM25 con una segunda fase de reordenación basada en similitud semántica para mejorar la precisión en dominios con vocabulario especializado.
- Moderación y clasificación de textos: usar los embeddings como features de entrada para clasificadores lineales o modelos ligeros de detección de tópicos y toxicidad.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial para calcular afinidad semántica.
- Evaluación de similitud en control de calidad de traducciones o resúmenes: comparar el texto generado con una referencia mediante similitud coseno como métrica automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB solo para pesos (1.224M parámetros × 2 bytes), más overhead de activaciones y del contexto; con secuencias de 8.192 tokens el consumo puede superar los 8-12 GB según el tamaño de batch.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090 o RTX 3090 para inferencia en bfloat16 con batches moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con comodidad; en GPUs de 8-12 GB es viable con batches pequeños o cuantización (no documentada en la información disponible).
- Opciones de despliegue: sentence-transformers (>=4.1.0), transformers (>=4.51.0), accelerate (>=1.6.0), flash-attn (>=2.7.3) y text-embeddings-inference según los tags del repositorio. vLLM, llama.cpp y Ollama no están documentados para este modelo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Dimension embedding | Licencia |
|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-EN-1B-PT | Llama | 1.224M | 8.192 | 1.792 | MIT |
| Sentence-Llama-Bi-EN-1B-PT | Llama | 1.224M | no disponible | no disponible | MIT |
| Sentence-ModernBERT-EN-1B-PT | ModernBERT | 1.304M | no disponible | no disponible | MIT |

Los tres modelos de la serie MIREI comparten la misma receta de entrenamiento débilmente supervisado sobre los 25 subconjuntos de embedding-training-data (unos 43M de pares). Sentence-Sarashina-Bi-EN-1B-PT y Sentence-Llama-Bi-EN-1B-PT tienen idéntico recuento de parámetros, lo que sugiere que la diferencia radica en el modelo base subyacente y no en la arquitectura de embedding. No se dispone de datos de benchmarks que permitan comparar el rendimiento empírico entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no se garantiza calidad en otros idiomas, incluido el castellano.
- El entrenamiento es débilmente supervisado, lo que puede introducir ruido en las representaciones y limitar la precisión en dominios muy especializados frente a modelos entrenados con datos anotados manualmente.
- Riesgo de alucinación no aplicable en sentido generativo (no produce texto), pero sí de falsos positivos en similitud: textos con solapamiento léxico pueden puntuar alto sin equivalencia semántica real.
- Sin datos publicados de benchmarks, no es posible verificar su rendimiento frente a alternativas establecidas como los modelos de la familia E5, BGE o GTE.
- El repositorio no registra descargas ni likes, por lo que carece de validación comunitaria y de casos de uso en producción documentados.
- La licencia MIT permite uso comercial sin restricciones, pero conviene verificar las condiciones del dataset de entrenamiento (sentence-transformers/embedding-training-data) y del modelo base.
- El contexto máximo de 8.192 tokens puede ser insuficiente para documentos completos muy largos; requiere troceado en chunks.
- La dependencia de flash-attn y de versiones concretas de sentence-transformers y transformers incrementa la complejidad del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-1B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/sarashina2.2-Bi-1b
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo hermano (Llama): https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-1B-PT
- Modelo hermano (ModernBERT): https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-1B-PT
- Licencia MIT: https://opensource.org/license/mit/
- Paper de referencia: 岡田 龍樹 and 杉本 徹, "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", 言語処理学会第 32 回年次大会 (NLP2026)
