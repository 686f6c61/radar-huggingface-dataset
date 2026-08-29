# devrim/reign-tiny-l1_gn-gte-small_s384_val-selected

## Resumen

REIGN `tiny-l1` es un codificador cruzado de chunks (cross-chunk encoder) desarrollado por Devrim Cavuşoğlu y Emre Akbaş, presentado en el artículo *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling* (Findings of EMNLP 2026, en prensa). El modelo aborda el problema de la recuperación de documentos largos: en lugar de procesar secuencias de tokens completas, lee una secuencia de embeddings de chunks previamente generados por una red guía congelada (GTE-small, 33M de parámetros), agregándolos mediante una capa transformer ligera de solo 0,56M de parámetros entrenables. Esto permite escalar el contexto de forma eficiente sin aumentar el coste computacional por token.

El checkpoint publicado contiene únicamente el codificador REIGN; la red guía debe cargarse por separado y permanece congelada. Está diseñado para entradas multi-chunk (documento a documento) y no debe usarse para consultas cortas de un solo chunk. Su licencia Apache 2.0 y su tamaño reducido lo hacen atractivo para despliegues con recursos limitados, aunque su uso principal es la investigación y la recuperación de documentos largos en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 1 capa (d=192, 3 cabezas, FFN 768) sobre embeddings de chunks; red guía congelada GTE-small (33M) |
| Parametros totales | 556.608 (solo codificador REIGN) + 33M (red guía congelada) |
| Parametros activos | 556.608 (el resto de la red guía está congelado) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red guía); secuencia de chunks ilimitada en la práctica |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

REIGN es un bi-encoder de documentos largos que opera sobre representaciones de chunks en lugar de tokens. La red guía (GTE-small, congelada) convierte cada chunk de 512 tokens en un embedding; el codificador REIGN, un transformer de una sola capa con 3 cabezas de atención y dimensión 192, procesa la secuencia de embeddings de chunks y produce un vector final mediante pooling medio. El modelo es equivariante a permutaciones (no usa señales de posición), lo que lo hace invariante al orden de los chunks.

El entrenamiento utiliza un objetivo de pérdida de coseno de tres vías (positivo, parcial, negativo) con peso parcial λ=0,5, sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir` (licencia CC BY-SA 4.0). Se emplearon 18 anclas por lote con 1 positivo, 2 parciales y 17 negativos intra-lote (360 pares por paso), optimizador AdamW (lr 1e-5, weight decay 1e-4), 50 épocas con validación cada 4, selección por mejor nDCG@10 en validación, precisión mixta de 16 bits y semilla 42. Los embeddings de la red guía se precomputaron y cachearon. El entrenamiento se realizó en una GPU de consumo de 24 GB.

## Capacidades

- Generación de embeddings densos para documentos largos (múltiples chunks) con normalización L2.
- Recuperación documento-a-documento (document-to-document retrieval) mediante similitud coseno.
- Agregación de secuencias de embeddings de chunks sin necesidad de procesar tokens completos.
- Manejo de documentos de longitud arbitraria (limitado solo por la memoria para almacenar embeddings de chunks).
- Equivariancia a permutaciones: el orden de los chunks no afecta al resultado.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo de embeddings.

## Casos de uso

- Recuperación de pasajes en corpus de documentos legales extensos: el modelo procesa contratos o sentencias divididos en chunks de 512 tokens, generando un embedding por documento que permite buscar similitud semántica entre documentos completos sin truncar el contexto.
- Búsqueda semántica en bases de conocimiento técnico (manuales, documentación API): al agregar embeddings de chunks, se pueden indexar documentos de cientos de páginas y consultarlos con frases cortas, obteniendo resultados relevantes a nivel de documento.
- Deduplicación de documentos largos en pipelines de ingestión de datos: comparar embeddings de documentos completos para identificar duplicados o versiones cercanas, incluso cuando el texto supera la ventana de contexto de modelos estándar.
- Clustering de artículos científicos o informes extensos: agrupar documentos por similitud temática usando los embeddings generados, sin necesidad de resumir o truncar el contenido.
- Sistemas de recomendación de documentos basados en contenido: dado un documento de referencia, encontrar otros similares en un repositorio grande, aprovechando la capacidad de manejar entradas largas.
- Investigación en eficiencia de modelos de embeddings: sirve como punto de partida para experimentos con arquitecturas de agregación de chunks, gracias a su tamaño reducido y su diseño modular (código abierto en GitHub).

## Benchmarks y rendimiento

El autor reporta un único resultado para este checkpoint exacto, extraído del artículo (Tabla 7):

| Benchmark | Metrica | Eval stride | Valor |
| --- | --- | ---: | --- |
| GoodWiki-Long test | nDCG@10 | s384 | 64.46 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El valor corresponde al checkpoint seleccionado por mejor nDCG@10 en validación.

## Requisitos de hardware

- Inferencia: el codificador REIGN tiene solo 0,56M de parámetros, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM (incluso CPU). La red guía GTE-small (33M) requiere unos 130 MB en float32, por lo que el conjunto completo puede ejecutarse en GPUs de gama baja como una GTX 1650 o una RTX 3060.
- Entrenamiento: se realizó en una GPU de consumo de 24 GB (p. ej., RTX 3090 o RTX 4090) con precisión mixta.
- Despliegue: el código oficial está disponible en GitHub (`pip install git+https://github.com/devrimcavusoglu/reign.git`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; el modelo se usa mediante la API de Python de REIGN.
- Latencia: no disponible, pero al operar sobre embeddings de chunks precomputados, la inferencia es muy rápida (una sola pasada por el transformer de 1 capa).

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
| --- | --- | --- | --- | --- |
| REIGN tiny-l1 (este) | 0,56M + 33M guía | 512 tokens/chunk, secuencia ilimitada | Cross-chunk sobre embeddings | Apache 2.0 |
| GTE-small (base) | 33M | 512 tokens | Bi-encoder estándar | Apache 2.0 |
| GTE-tiny | ~23M | 512 tokens | Bi-encoder estándar | Apache 2.0 |

REIGN se diferencia de los bi-encoders clásicos al agregar información de múltiples chunks, lo que permite manejar documentos más largos sin aumentar el coste por token. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para entradas multi-chunk (documentos largos). Para consultas o textos de un solo chunk, debe usarse la red guía directamente; este checkpoint no es adecuado para ese régimen.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Al ser un modelo de embeddings, no genera texto y no es susceptible a alucinaciones, pero su calidad depende de la red guía congelada y de la distribución del dataset de entrenamiento (Wikipedia sintética).
- El entrenamiento con precisión mixta no es bit-reproducible; un reentrenamiento no producirá pesos idénticos.
- El dataset de entrenamiento se distribuye bajo CC BY-SA 4.0, lo que puede implicar obligaciones de share-alike si se utilizan los datos derivados.
- No se han publicado evaluaciones de sesgos o robustez; el modelo se ha probado únicamente en el benchmark GoodWiki-Long.
- Para uso en producción, se recomienda validar el rendimiento en el dominio específico, ya que el modelo está orientado a investigación y su cobertura de casos reales es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-tiny-l1_gn-gte-small_s384_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (en prensa).
