# iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT

## Resumen

Sentence-Llama-Bi-EN-0.5B-PT es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05, construido sobre una arquitectura Llama y entrenado con aprendizaje contrastivo débilmente supervisado. Forma parte de la familia MIREI, un conjunto de encoders de ~0,5B parámetros que comparten la misma receta de entrenamiento sobre subconjuntos débilmente supervisados del dataset `sentence-transformers/embedding-training-data` (aproximadamente 16,1 millones de pares de entrenamiento).

El modelo envuelve un checkpoint previo (`Llama-Bi-EN-0.5B-PT-stage2`) y produce embeddings de 1.280 dimensiones mediante mean pooling, con una longitud máxima de secuencia de 8.192 tokens. Su propósito es servir como encoder bi-encoder para tareas de similitud semántica, recuperación de información (retrieval) y búsqueda semántica densa en inglés.

Su relevancia radica en la comparación sistemática entre arquitecturas (Llama, ModernBERT, Mistral, Qwen2.5) bajo condiciones de entrenamiento idénticas, documentada en una publicación de NLP2026. Está publicado con licencia MIT y es compatible con `sentence-transformers` y Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder adaptado a encoder bi-encoder) |
| Parametros totales | 661.976.320 (530M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.280 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama, adaptada como bi-encoder para generar representaciones de frases mediante mean pooling sobre las activaciones del modelo. Utiliza RoPE como codificación posicional y un tokenizer SentencePiece con un vocabulario de 102.400 entradas. Parte del checkpoint `iamtatsuki05/Llama-Bi-EN-0.5B-PT-stage2`, que se envuelve con un entrenamiento contrastivo débilmente supervisado.

El entrenamiento se realizó sobre los subconjuntos débilmente supervisados de `sentence-transformers/embedding-training-data`, con aproximadamente 16,1 millones de pares. No se especifican en la información disponible el número total de tokens procesados, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. La innovación principal del trabajo es metodológica: comparar arquitecturas (Llama, ModernBERT, Mistral, Qwen2.5) bajo una receta de entrenamiento idéntica para aislar el efecto de la arquitectura en la calidad de los embeddings.

## Capacidades

- Generación de embeddings de frases y documentos en inglés de 1.280 dimensiones.
- Similitud semántica entre pares de textos mediante distancia coseno.
- Recuperación de información densa (dense retrieval) y búsqueda semántica.
- Extracción de características (`feature-extraction`) para pipelines de NLP.
- Soporte de secuencias de hasta 8.192 tokens, adecuado para documentos largos.
- Integración nativa con `sentence-transformers` y Text Embeddings Inference (endpoints compatibles).
- Compatible con Flash Attention 2 para inferencia eficiente.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un encoder de embeddings, no un modelo generativo de propósito general.

## Casos de uso

- Búsqueda semántica en bases documentales: indexar documentos largos de hasta 8.192 tokens y recuperar los más relevantes ante una consulta en lenguaje natural mediante similitud coseno.
- Sistemas RAG (retrieval-augmented generation): usar el modelo como retriever denso para alimentar un LLM generativo con pasajes relevantes en pipelines de preguntas y respuestas.
- Deduplicación y clustering de textos: generar embeddings normalizados y agrupar documentos o tickets similares por proximidad en el espacio vectorial.
- Motor de recomendación de contenido: calcular similitud entre artículos, productos o publicaciones para sugerir elementos relacionados.
- Moderación y clasificación semántica: comparar mensajes de usuario contra un conjunto de referencia de categorías para asignar etiquetas por vecindad semántica.
- Evaluación de paráfrasis y similitud textual: medir la cercanía semántica entre pares de frases para tareas de control de calidad de traducciones o resúmenes.
- Filtrado previo en pipelines de anotación: reducir el volumen de datos a revisar manualmente seleccionando los ejemplos más representativos o diversos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3-1,5 GB para los pesos (661M parámetros), más memoria para activaciones según la longitud de secuencia.
- Cabe en GPUs de consumo: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, entre otras.
- GPUs de datacenter recomendadas para alto throughput: A100, H100, L40S.
- Despliegue mediante `sentence-transformers` (recomendado, con `trust_remote_code=True`), Text Embeddings Inference (TEI) y `transformers` con `accelerate`.
- Se recomienda Flash Attention 2 (`flash-attn>=2.7.3`) para acelerar la inferencia.
- Requisitos de librerías: `sentence-transformers>=4.1.0`, `transformers>=4.51.0`, `accelerate>=1.6.0`, `sentencepiece>=0.2.0`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentence-Llama-Bi-EN-0.5B-PT | Llama | 661M (530M sin emb.) | 8.192 | MIT | Hugging Face |
| Sentence-ModernBERT-EN-0.5B-PT | ModernBERT | 677M (546M sin emb.) | no disponible | MIT | Hugging Face |
| Sentence-Mistral-Bi-EN-0.5B-PT | Mistral | 518M (469M sin emb.) | no disponible | MIT | Hugging Face |
| Sentence-Qwen2.5-Bi-EN-0.5B-PT | Qwen2.5 | 494M (357M sin emb.) | no disponible | MIT | Hugging Face |

Todos los modelos de la familia MIREI comparten la misma receta de entrenamiento contrastivo débilmente supervisado sobre los mismos ~16,1M de pares, lo que permite una comparación controlada entre arquitecturas. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado ni validado para otros idiomas.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgos heredados de los datos de entrenamiento (`sentence-transformers/embedding-training-data`), que no se detallan en la información disponible.
- La supervisión débil implica que la calidad de los embeddings puede ser inferior a la de modelos entrenados con datos de alta calidad anotados manualmente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas establecidas como los modelos de la familia E5, BGE o GTE.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del autor.
- La licencia MIT permite uso comercial sin restricciones, pero conviene verificar la procedencia de los datos de entrenamiento subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/Llama-Bi-EN-0.5B-PT-stage2
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- README en japonés: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT/blob/main/README_JA.md
- Licencia MIT: https://opensource.org/license/mit/
