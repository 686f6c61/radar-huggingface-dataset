# devrim/reign-base-l3_gn-bge-large_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es una arquitectura de bi-encoder diseñada para retrieval de documentos largos. Este checkpoint concreto, `reign-base-l3_gn-bge-large_val-selected`, es el encoder cross-chunk de nivel `base-l3` entrenado sobre una red guía congelada BGE-large (`BAAI/bge-large-en-v1.5`). En lugar de procesar tokens directamente, el modelo lee una secuencia de embeddings de chunks precomputados por la red guía, lo que permite escalar el contexto de forma eficiente sin aumentar el coste computacional por token.

El modelo lo desarrollan Devrim Cavusoglu y Emre Akbas, y se presenta en el artículo *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, aceptado en Findings of EMNLP 2026. El encoder REIGN tiene 22,45 millones de parámetros entrenables (22.643.456 según los pesos reales), mientras que la red guía congelada aporta 335 millones, sumando un stack combinado de 357 millones. El checkpoint solo contiene los pesos del encoder REIGN; la red guía debe cargarse por separado.

La relevancia actual radica en que los modelos de embeddings tradicionales (como BGE) tienen una ventana de contexto limitada (512 tokens en este caso). REIGN supera esa limitación agregando información de múltiples chunks, logrando un nDCG@10 de 66,45 en el benchmark GoodWiki-Long test, sin necesidad de reentrenar la red guía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-chunk de 3 capas (d=768, 12 cabezas, FFN 3072) sobre red guía congelada BGE-large |
| Parametros totales | 22.643.456 (encoder REIGN) + 335M (guidance congelada) = 357M combinado |
| Parametros activos | 22,45M (solo encoder REIGN; la guidance está congelada) |
| Longitud de contexto | Ilimitada en número de chunks; cada chunk tiene 512 tokens (ventana de la guidance) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN es un bi-encoder que opera sobre una secuencia de embeddings de chunks, no sobre tokens. La red guía (BGE-large, congelada) convierte cada chunk de 512 tokens en un embedding de 768 dimensiones. El encoder REIGN, un transformer de 3 capas con 12 cabezas de atención y FFN de 3072 unidades, procesa esta secuencia de embeddings y produce un vector final mediante pooling medio. No se utiliza señal de posición, por lo que el encoder es una función simétrica respecto al orden de los chunks.

El entrenamiento se realizó sobre el dataset `devrim/goodwiki_long_synthetic_ir`, que contiene pares de documentos largos con anotaciones de relevancia graduada. Se empleó una pérdida de cosine embedding de tres vías con objetivos s ∈ {1, 0, −1} (positivo, parcial, negativo) y peso parcial λ = 0,5. El batch se construyó con 18 anclas, cada una con 1 positivo, 2 parciales y 17 negativos in-batch, generando 360 pares por paso. Se usó AdamW (lr 1e-5, weight decay 1e-4) con programación de coseno, 50 épocas, validación cada 4 épocas y selección del mejor checkpoint por nDCG@10 en el split de validación. La precisión fue de 16 bits mixtos y los embeddings de la red guía se precomputaron y cachearon. El entrenamiento se ejecutó en una GPU de consumo de 24 GB.

## Capacidades

- Generación de embeddings densos L2-normalizados para documentos largos (multi-chunk).
- Retrieval documento-a-documento: dado un documento de consulta, recupera los documentos más similares de un corpus.
- Similitud coseno eficiente: al estar los vectores normalizados, la similitud es un producto punto.
- Procesamiento de secuencias de chunks de longitud arbitraria, sin límite fijo de contexto.
- Compatible con el ecosistema de Hugging Face mediante la clase `ReignBaselineEncoder` y `ReignModel`.
- No genera texto, no soporta tool calling ni agentes; es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica en corpus de documentos legales extensos: el modelo puede indexar contratos o sentencias de cientos de páginas dividiéndolos en chunks de 512 tokens y agregando sus embeddings, permitiendo recuperar documentos completos relevantes a partir de una consulta larga.
- Recuperación aumentada por generación (RAG) sobre informes técnicos o papers científicos: al procesar documentos completos, se pueden obtener representaciones que capturan información distribuida a lo largo del texto, mejorando la calidad de los pasajes recuperados para alimentar a un LLM.
- Sistemas de recomendación de artículos académicos: dado un artículo de consulta, se pueden encontrar otros artículos similares en repositorios como arXiv o PubMed, incluso si la similitud se basa en secciones distantes del texto.
- Archivado y deduplicación de documentos: comparar embeddings de documentos largos para detectar duplicados o versiones casi idénticas en bases de datos corporativas.
- Análisis de sentimiento a nivel de documento: aunque no es su uso principal, el embedding agregado puede servir como entrada para clasificadores que operan sobre documentos completos.
- Indexación de libros o manuales técnicos: permite buscar pasajes relevantes dentro de libros completos sin necesidad de dividirlos manualmente en secciones.

## Benchmarks y rendimiento

El único resultado reportado para este checkpoint exacto es el siguiente:

| Benchmark | Metrica | Eval stride | Valor | Fuente |
|---|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | mejor stride | 66,45 | Paper, Tabla 2 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia muy ligera: el encoder REIGN tiene solo 22,6M de parámetros, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU con razonable velocidad.
- La red guía BGE-large (335M) debe cargarse por separado, pero también es ligera (unos 1,3 GB en float32). En conjunto, el stack completo requiere aproximadamente 1,5 GB de memoria.
- Se puede ejecutar en GPUs de consumo como RTX 3060, RTX 4090, o en CPUs modernas con soporte AVX.
- Para despliegue en producción, se recomienda usar el repositorio oficial `reign` (pip install desde GitHub) o integrar los embeddings precomputados en un índice vectorial (FAISS, Milvus, etc.).
- No se requieren GPUs de datacenter; el entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho menos exigente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo se posiciona como una alternativa a los bi-encoders de contexto largo como `BGE-M3` o `E5-Mistral`, pero no se han publicado comparaciones directas en esta ficha.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para documentos largos (multi-chunk). Para inputs de menos de 512 tokens, el encoder REIGN no aporta valor y se debe usar la red guía directamente.
- El dataset de entrenamiento proviene de Wikipedia (GoodWiki), por lo que los embeddings pueden reflejar sesgos presentes en ese corpus, como sesgo geográfico o cultural.
- Al ser un modelo de embeddings, no genera texto y no presenta riesgo de alucinación, pero sí puede producir representaciones poco fiables para dominios muy especializados fuera del ámbito enciclopédico.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el dataset `goodwiki_long_synthetic_ir` está bajo CC BY-SA 4.0, lo que puede imponer obligaciones de share-alike si se redistribuyen derivados del dataset.
- El entrenamiento con precisión mixta no es bit-reproducible; un reentrenamiento no producirá pesos idénticos.
- No se han publicado resultados de rendimiento en otros benchmarks (MTEB, BEIR, etc.), por lo que su comportamiento general fuera de GoodWiki-Long es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devrim/reign-base-l3_gn-bge-large_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (en prensa)
- Red guía: https://huggingface.co/BAAI/bge-large-en-v1.5
