# devrim/reign-large-l4_gn-gte-small_s384_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un enfoque para escalar la longitud de contexto en modelos de embeddings de documentos sin aumentar el coste computacional de forma lineal. Este checkpoint concreto, `reign-large-l4_gn-gte-small_s384_val-selected`, es un cross-chunk encoder entrenado sobre el dataset sintético GoodWiki-Long-Synthetic, que procesa una secuencia de embeddings de chunks (generados por una red de guía congelada) en lugar de tokens. El modelo está desarrollado por Devrim Cavuşoğlu y Emre Akbaş, y se presenta en el paper *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, aceptado en Findings of EMNLP 2026.

La arquitectura combina un encoder transformer de 4 capas (d=1024, 16 cabezas, FFN 4096, 52,49M parámetros entrenables) con una red de guía GTE-small (33M parámetros) que permanece congelada. El checkpoint solo contiene los pesos del encoder cross-chunk; la red de guía debe cargarse por separado. El modelo está diseñado para retrieval de documentos largos (document-to-document) y no para inputs cortos. Su relevancia radica en que permite manejar documentos de longitud arbitraria mediante embeddings de chunks, con un coste de inferencia independiente de la longitud total del documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-chunk encoder (REIGN large-l4) + red de guía GTE-small congelada |
| Parametros totales | 51.829.504 (checkpoint) + 33M (red de guía, no incluida en el checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Procesa secuencias de embeddings de chunks; cada chunk de 512 tokens con stride 384, sin límite máximo de chunks (limitado por memoria) |
| Tipos de cuantizacion | No disponible (solo float32 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN es un bi-encoder de documentos largos que opera sobre una secuencia de embeddings de chunks en lugar de tokens. La red de guía (GTE-small, `thenlper/gte-small`) genera embeddings para cada chunk de 512 tokens con un stride de 384, y el encoder cross-chunk (4 capas, d=1024, 16 cabezas, FFN 4096) agrega estos embeddings mediante pooling mean. El encoder es permutation-equivariant, es decir, no utiliza señal de posición, lo que le permite procesar los chunks en cualquier orden.

El entrenamiento se realizó sobre el dataset `devrim/goodwiki_long_synthetic_ir` (sintético basado en Wikipedia, licencia CC BY-SA 4.0) con una función de pérdida de cosine embedding de tres vías (positivo, parcial, negativo) con peso λ=0.5. Se usó AdamW (lr 1e-5, weight decay 1e-4) con cosine annealing, 50 épocas, validación cada 4, selección por mejor nDCG@10 en validación, precisión mixta 16 y seed 42. Los embeddings de la red de guía se precomputaron y cachearon. El entrenamiento se ejecutó en una GPU de 24 GB.

## Capacidades

- Generación de embeddings de documentos L2-normalizados para retrieval semántico.
- Procesamiento de documentos largos mediante chunking con solapamiento (stride 384).
- Retrieval document-to-document, no apto para consultas cortas (menores que el chunk size).
- Soporte de múltiples chunks por documento, con agregación por pooling mean.
- No soporta tool calling, agentes, generación de texto, visión ni audio.
- Multilingüe: solo inglés.

## Casos de uso

- Búsqueda semántica en corpus de documentos extensos (artículos académicos, informes legales, manuales técnicos): el modelo genera embeddings de documentos completos, permitiendo recuperar los más relevantes mediante similitud coseno.
- Sistemas RAG con documentos largos: al procesar chunks de 512 tokens con stride, puede indexar documentos que exceden la ventana de contexto de modelos generativos, y los embeddings resultantes se usan para recuperar pasajes relevantes.
- Deduplicación de documentos: comparar embeddings de documentos largos para identificar duplicados o versiones similares en grandes repositorios.
- Clasificación de documentos por similitud temática: agrupar documentos en clústeres según la similitud coseno de sus embeddings.
- Recuperación de pasajes dentro de documentos largos: aunque el modelo está diseñado para document-to-document, los embeddings de chunks individuales pueden usarse para localizar secciones relevantes.
- Indexación de bases de conocimiento empresariales: integrar el modelo en pipelines de indexación para motores de búsqueda internos que manejan documentos de gran tamaño.

## Benchmarks y rendimiento

El único resultado reportado en la model card es el siguiente:

| Benchmark | Metrica | Eval stride | Valor | Fuente |
|---|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 65.98 | Tabla 7 del paper |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El checkpoint tiene 51,8M de parámetros (float32, ~207 MB), por lo que cabe en cualquier GPU consumer (incluso en CPU).
- La red de guía GTE-small añade 33M de parámetros (~132 MB), totalizando ~340 MB en float32.
- Inferencia en GPU: VRAM estimada < 1 GB para el modelo completo (encoder + guía).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., RTX 2060, GTX 1660) o incluso CPU para inferencia por lotes pequeños.
- Entrenamiento: se realizó en una GPU de 24 GB (p. ej., RTX 3090 o RTX 4090).
- Despliegue: requiere el paquete `reign` (instalable desde GitHub) y HuggingFace Transformers para cargar la red de guía. No es compatible directamente con vLLM, Ollama o TGI por ser un modelo de embeddings personalizado.
- Latencia y throughput: no disponibles; dependen del número de chunks y del hardware.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos de embeddings de documentos largos en la información proporcionada. Como referencia cualitativa, el modelo se basa en GTE-small (33M) como red de guía, pero añade un encoder cross-chunk que permite procesar documentos más largos que la ventana de 512 tokens de GTE-small. Alternativas como E5-large, BGE-large o GTE-large tienen arquitecturas estándar y no procesan secuencias de chunks, por lo que su coste crece linealmente con la longitud del documento. REIGN ofrece una alternativa más eficiente para documentos muy largos, aunque su rendimiento solo se ha evaluado en el benchmark GoodWiki-Long.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe.
- No es adecuado para inputs cortos (menores que el chunk size de 512 tokens); en ese régimen se recomienda usar la red de guía directamente.
- El checkpoint no incluye la red de guía; debe cargarse por separado y permanece congelada, lo que añade complejidad al despliegue.
- El dataset de entrenamiento es sintético (basado en Wikipedia) y puede introducir sesgos o limitaciones en dominios especializados.
- No es un modelo generativo; solo produce embeddings.
- La licencia del dataset (CC BY-SA 4.0) puede imponer restricciones de share-alike en aplicaciones que redistribuyan datos derivados.
- El entrenamiento con precisión mixta no es bit-reproducible; un reentrenamiento no producirá pesos idénticos.

## Enlaces

- HuggingFace: https://huggingface.co/devrim/reign-large-l4_gn-gte-small_s384_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).
