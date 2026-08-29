# devrim/reign-base-l3_gn-gte-small_s384_val-selected

## Resumen

REIGN base-l3 es un cross-chunk encoder para retrieval de documentos largos, desarrollado por Devrim Cavuşoğlu y Emre Akbaş, presentado en el paper *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling* (Findings of EMNLP 2026). El modelo resuelve el problema de escalar la longitud de contexto en bi-encoders de embeddings: en lugar de procesar tokens directamente, lee una secuencia de embeddings de chunks generados por una red guía congelada (GTE-small), lo que permite manejar documentos arbitrariamente largos con un coste computacional fijo.

La arquitectura combina un encoder REIGN de 3 capas transformer (d=768, 12 cabezas, FFN 3072) con 22,45 millones de parámetros entrenables, más la red guía GTE-small de 33 millones de parámetros congelados, sumando un stack total de 55 millones. El checkpoint publicado contiene solo los pesos del encoder REIGN en formato safetensors (22.150.656 parámetros). El contexto efectivo se define por el tamaño de chunk (512 tokens) y el stride de entrenamiento (384), pero el modelo opera sobre secuencias de embeddings, no sobre tokens, por lo que puede procesar documentos de cualquier longitud.

La relevancia actual radica en que ofrece una alternativa eficiente a los modelos de contexto largo tradicionales, con resultados competitivos en benchmarks de retrieval de documentos largos (nDCG@10 de 67,31 en GoodWiki-Long test) y cero disparo en LoCo (68,87) y DAPFAM (31,10). Está licenciado bajo Apache 2.0 y disponible públicamente en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (REIGN cross-chunk) + guidance network GTE-small congelada |
| Parametros totales | 22.150.656 (checkpoint del encoder REIGN); 55M combinados con la guidance network |
| Parametros activos | 22,45M (encoder REIGN) + 33M (GTE-small, congelados) |
| Longitud de contexto | 512 tokens por chunk (ventana de la guidance network); procesa secuencias de embeddings de chunks |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma REIGN: un encoder cross-chunk que recibe como entrada una secuencia de embeddings de chunks, generados por una guidance network congelada (GTE-small). El encoder REIGN es un transformer de 3 capas con d=768, 12 cabezas de atención y FFN de 3072 unidades, que agrega los embeddings mediante mean pooling sobre la secuencia de chunks. No se utiliza señal de posición, por lo que la función es equivariante a permutaciones. El checkpoint contiene únicamente los pesos del encoder REIGN; la guidance network debe cargarse por separado y permanece congelada durante la inferencia.

El entrenamiento se realizó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir`, con una función de pérdida de cosine embedding de tres vías (positivo, parcial, negativo) con peso parcial λ=0,5. Se usaron 18 anclas por lote, cada una con 1 positivo, 2 parciales y 17 negativos in-batch, totalizando 360 pares por paso. El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4 y annealing coseno, durante 50 épocas con validación cada 4. La selección del checkpoint se basó en el mejor nDCG@10 en la partición de validación. Se empleó precisión mixta de 16 bits y un seed fijo de 42. Los embeddings de la guidance network se precomputaron y cachearon en disco. El entrenamiento se ejecutó en una única GPU de consumo con 24 GB de VRAM.

La innovación principal es que el modelo procesa embeddings de chunks en lugar de tokens, lo que permite escalar la longitud de contexto sin aumentar el coste computacional del encoder. Esto lo hace especialmente adecuado para retrieval de documentos largos, donde los bi-encoders tradicionales se ven limitados por la ventana de contexto del transformer.

## Capacidades

- Generación de embeddings densos L2-normalizados para documentos completos, a partir de secuencias de embeddings de chunks.
- Retrieval document-to-document: dado un documento de consulta, recupera documentos relevantes de un corpus.
- Manejo de documentos de longitud arbitraria, gracias al procesamiento por chunks con stride configurable.
- Zero-shot transfer a dominios no vistos (demostrado en LoCo y DAPFAM).
- Inferencia eficiente: los embeddings de la guidance network pueden precomputarse y cachearse, reduciendo el coste en producción.
- Integración con el ecosistema Hugging Face mediante la librería `reign` (pip installable desde GitHub).

## Casos de uso

- Búsqueda semántica en corpus de documentos legales: el modelo puede indexar contratos, sentencias o normativas extensas, y recuperar los documentos más relevantes a partir de una consulta larga, gracias a su capacidad de procesar documentos completos sin truncamiento.
- Recuperación de pasajes en bases de conocimiento técnico: en entornos empresariales con manuales o documentación API extensa, REIGN permite buscar respuestas en documentos de miles de tokens sin perder información por límites de contexto.
- Sistemas de preguntas y respuestas sobre informes financieros: dado un informe anual o un análisis de mercado, el modelo puede recuperar los documentos más pertinentes para una pregunta concreta, mejorando la precisión de sistemas RAG.
- Deduplicación de documentos en grandes corpora: al generar embeddings de documentos completos, se pueden comparar similitudes coseno para identificar duplicados o versiones casi idénticas en archivos de gran tamaño.
- Clustering temático de artículos científicos: el modelo permite agrupar papers largos por similitud semántica, facilitando la organización de bibliotecas digitales o la detección de tendencias de investigación.
- Moderación de contenido en foros o wikis: al procesar hilos de discusión extensos, REIGN puede clasificar o recuperar mensajes relevantes para tareas de moderación o análisis de sentimiento a nivel de documento.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para este checkpoint exacto, según el paper:

| Benchmark | Métrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 67,31 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s384 | 68,87 |
| DAPFAM test (zero-shot) | nDCG@100 | s384 | 31,10 |
| MTEB ArguAna | nDCG@10 | 512-token inputs | 50,32 |
| MTEB FiQA-2018 | nDCG@10 | 512-token inputs | 32,55 |

Los resultados en MTEB son inferiores al baseline de la guidance network (55,42 y 39,31 respectivamente), porque el modelo está diseñado para inputs multi-chunk; con inputs cortos (menos de 512 tokens) el encoder cross-chunk no tiene nada que agregar. El paper los reporta como límite de alcance, no como resultado competitivo.

## Requisitos de hardware

- VRAM estimada: el stack completo (encoder REIGN + guidance network GTE-small) suma 55M parámetros, lo que en float32 ocupa aproximadamente 220 MB. Con overhead de inferencia, caben en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 3060, RTX 4090) es suficiente. El entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho más ligera.
- Despliegue: la librería `reign` (instalable desde GitHub) proporciona la clase `ReignBaselineEncoder` para carga y codificación. También se puede usar con `transformers` mediante `ReignModel` y `ReignFeatureExtractor`.
- Latencia y throughput: no se proporcionan datos específicos, pero al procesar embeddings de chunks (no tokens), la inferencia es significativamente más rápida que un transformer de contexto largo equivalente. El coste principal es la generación de embeddings de chunks con la guidance network, que puede cachearse.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en los mismos benchmarks dentro de la información proporcionada. El modelo se posiciona como una alternativa a bi-encoders de contexto largo como GTE-large o BGE-M3, pero su enfoque de cross-chunk sobre embeddings es novedoso. Frente a su guidance network base (GTE-small), REIGN mejora sustancialmente en tareas de documentos largos (GoodWiki-Long: 67,31 vs. el baseline de GTE-small, que no se reporta explícitamente), mientras que en inputs cortos es inferior por diseño. No se incluyen comparaciones con otros modelos en la model card.

## Limitaciones y advertencias

- No es adecuado para inputs de menos de 512 tokens: en ese régimen, el encoder cross-chunk no tiene secuencia que agregar y el rendimiento cae por debajo del de la guidance network sola.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- El checkpoint contiene únicamente el encoder REIGN; la guidance network (GTE-small) debe cargarse por separado y permanece congelada, lo que añade complejidad al despliegue.
- Los resultados en MTEB (tareas de contexto corto) son deliberadamente bajos; no debe usarse para retrieval de pasajes cortos.
- El entrenamiento con precisión mixta no es bit-reproducible, por lo que un reentrenamiento no producirá pesos idénticos.
- No se han publicado análisis de sesgos o alucinaciones; al ser un modelo de embeddings, no genera texto, pero los sesgos de la guidance network pueden propagarse a los embeddings.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (`goodwiki_long_synthetic_ir`) tiene su propia licencia que debe verificarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devrim/reign-base-l3_gn-gte-small_s384_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (en prensa).
