# devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r1-c512s512

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es una arquitectura de codificadores de embeddings diseñada para escalar la longitud de contexto en tareas de recuperación de documentos largos. Este checkpoint concreto, `reign-base-l3_gn-gte-base_dapfam-ftreg-r1-c512s512`, es un codificador cross-chunk de 3 capas (22,45 millones de parámetros entrenables) que se apoya en una red guía congelada, GTE-base (110 millones de parámetros), para procesar documentos completos mediante ventanas deslizantes de 512 tokens con stride 512. El modelo fue desarrollado por Devrim Cavuşoğlu y Emre Akbaş, y se publica bajo licencia Apache 2.0.

El checkpoint se obtuvo mediante fine-tuning del checkpoint `reign-base-l3_gn-gte-base_val-selected` (inicialización warm) sobre la tarea DAPFAM de recuperación de familias de patentes, utilizando una pérdida InfoNCE con temperatura 0,07. El propio autor advierte que el fine-tuning no supera el rendimiento zero-shot del modelo base en esta tarea, y que el resultado es negativo: ningún ajuste de hiperparámetros del barrido mejora al backbone zero-shot. Por tanto, este modelo se publica con fines de inspección y reproducibilidad, no como punto de partida recomendado para recuperación de patentes.

La relevancia de este modelo radica en que ejemplifica una aproximación novedosa al escalado de contexto en embeddings: en lugar de aumentar la ventana del transformer, se utiliza un encoder ligero que agrega representaciones de chunks generadas por una red guía congelada. Esto permite manejar documentos arbitrariamente largos con un coste computacional reducido, aunque en este caso concreto el fine-tuning no haya logrado mejorar el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (transformer de 3 capas, d=768, 12 cabezas, FFN 3072) + red guía GTE-base congelada (110M) |
| Parametros totales | 22.446.336 (solo encoder REIGN; la red guía GTE-base de 110M no es entrenable) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por chunk; soporta documentos largos mediante chunking con stride (512/512) |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN se compone de dos módulos: una red guía (guidance network) congelada, en este caso GTE-base, que genera embeddings por chunks de 512 tokens, y un encoder cross-chunk de 3 capas (d=768, 12 cabezas, FFN 3072) que agrega las representaciones de los chunks para producir un embedding final del documento. El encoder cross-chunk es el único que se entrena; la red guía permanece fija. El modelo está diseñado para entradas multi-chunk: si el documento es más corto que el chunk size, el encoder no tiene nada que agregar y el modelo no debe usarse.

El fine-tuning se realizó sobre el dataset DAPFAM (recuperación de familias de patentes, FullText) con una pérdida InfoNCE de temperatura 0,07, con enmascaramiento de falsos negativos y política `ignore` para parciales. Se usaron 4 familias negativas proporcionadas por el dataset más negativos in-batch. El optimizador fue AdamW con schedule coseno, learning rate 5e-6, weight decay 1e-2, 6 épocas (validando cada 3), batch size 2, precisión mixta de 16 bits y semilla 42. El barrido completo cubrió lr ∈ {1e-5, 5e-6, 2e-6, 1e-6} y weight decay ∈ {1e-4, 1e-2, 1e-1}. La inicialización fue warm, partiendo del checkpoint `reign-base-l3_gn-gte-base_val-selected` entrenado en GoodWiki-Long.

Una innovación técnica destacable es el uso de una red guía congelada para generar representaciones de chunks, lo que permite escalar la longitud de contexto sin aumentar el coste de entrenamiento del encoder principal. El modelo devuelve vectores L2-normalizados, por lo que la similitud coseno se calcula como producto punto.

## Capacidades

- Generación de embeddings de documentos completos (document-to-document retrieval) mediante agregación de chunks.
- Recuperación de documentos largos con contexto ilimitado en la práctica, gracias al chunking con stride configurable.
- Similitud coseno entre documentos a partir de vectores L2-normalizados.
- Soporte para batch de documentos en la API de alto nivel (`ReignBaselineEncoder.encode`).
- Capacidad de ajustar el stride en tiempo de evaluación para controlar el solapamiento entre chunks.
- Integración con el ecosistema Hugging Face mediante `ReignModel` (PreTrainedModel) y `ReignFeatureExtractor`.
- No incluye generación de texto, tool calling, ni capacidades multimodales; es exclusivamente un modelo de embeddings.

## Casos de uso

- Recuperación de familias de patentes: el modelo fue fine-tuneado específicamente para DAPFAM, por lo que puede utilizarse para buscar patentes relacionadas a partir de un texto completo. Sin embargo, el autor recomienda usar los checkpoints zero-shot de GoodWiki-Long para esta tarea, ya que el fine-tuning degrada el rendimiento.
- Búsqueda semántica en corpus de documentos legales extensos: gracias a su capacidad de procesar documentos largos mediante chunking, puede indexar y recuperar sentencias, contratos o escritos legales completos.
- Sistemas de recuperación aumentada por generación (RAG) sobre bases de conocimiento técnicas: el modelo puede generar embeddings de documentos técnicos largos (manuales, especificaciones) para su posterior recuperación.
- Deduplicación de documentos: al generar embeddings de documentos completos, puede detectar duplicados o versiones similares en grandes colecciones.
- Clasificación de documentos por similitud temática: los embeddings pueden alimentar algoritmos de clustering o clasificación para organizar corpus de documentos largos.
- Indexación de artículos científicos o informes: el modelo puede procesar papers completos (más allá de 512 tokens) y permitir búsquedas por contenido, no solo por metadatos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de nDCG@100 sobre DAPFAM (top-100 sobre el corpus FullText completo, con auto-coincidencias eliminadas). Estos valores corresponden al checkpoint exacto y se recogen en el Apéndice J del paper.

| Split | nDCG@100 |
|---|---:|
| test | 32.32 |
| test_in | 37.12 |
| test_out | 5.64 |

El autor indica explícitamente que el fine-tuning no supera el rendimiento zero-shot en esta tarea: ningún ajuste del barrido mejora al backbone zero-shot, y el fine-tuning ingenuo con lr 1e-5 lo degrada en 0,4–1,5 puntos. No se proporcionan comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo es extremadamente ligero: el encoder REIGN tiene 22,45M de parámetros (≈90 MB en float32), y la red guía GTE-base añade 110M (≈440 MB en float32). El conjunto total ocupa aproximadamente 530 MB en memoria.
- Puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños; para producción con alto throughput se recomienda una GPU con al menos 2 GB de VRAM (p. ej., NVIDIA T4, RTX 3060 o superior).
- Cualquier GPU consumer moderna (RTX 3090, RTX 4090) es más que suficiente; incluso GPUs integradas podrían manejarlo.
- Opciones de despliegue: el paquete `reign` (instalable desde GitHub) proporciona la API de alto nivel. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo sino de embeddings.
- La latencia depende del número de chunks: para un documento de 10.000 tokens, se generan ~20 chunks (512 tokens cada uno) que deben procesarse por la red guía y luego agregarse. En GPU, esto es del orden de milisegundos; en CPU, puede ser de décimas de segundo.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de embeddings de documentos largos en la información proporcionada. Como referencia, se puede comparar con el propio GTE-base (modelo base) y con otros checkpoints de la familia REIGN:

| Modelo | Parámetros entrenables | Contexto | Licencia | Uso recomendado |
|---|---|---|---|---|
| `reign-base-l3_gn-gte-base_dapfam-ftreg-r1-c512s512` | 22,45M | Ilimitado (chunking) | Apache 2.0 | Inspección de resultado negativo; no recomendado para producción |
| `thenlper/gte-base` (red guía) | 110M | 512 tokens | Apache 2.0 | Embeddings de textos cortos y retrieval general |
| Otros checkpoints REIGN (GoodWiki-Long) | 22,45M | Ilimitado (chunking) | Apache 2.0 | Retrieval de documentos largos (zero-shot) |

La principal diferencia con GTE-base es que REIGN agrega chunks para manejar documentos largos, mientras que GTE-base solo procesa secuencias de hasta 512 tokens. Los checkpoints zero-shot de REIGN (GoodWiki-Long) son la alternativa recomendada para retrieval de documentos largos, según el autor.

## Limitaciones y advertencias

- El fine-tuning en DAPFAM no mejora el rendimiento zero-shot; el autor recomienda no usar este checkpoint para recuperación de patentes y preferir los checkpoints zero-shot de GoodWiki-Long.
- El modelo solo soporta inglés; no hay soporte multilingüe.
- No debe usarse para inputs de menos de 512 tokens (un solo chunk), ya que el encoder cross-chunk no tiene nada que agregar; en ese régimen es preferible usar la red guía sola.
- La red guía GTE-base está congelada y debe cargarse por separado; el checkpoint solo contiene los pesos del encoder REIGN.
- El entrenamiento con precisión mixta no es bit-reproducible, por lo que un reentrenamiento no producirá pesos idénticos.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de embeddings, no genera texto, pero los sesgos de la red guía pueden propagarse a los embeddings.
- La licencia Apache 2.0 permite uso comercial, pero el dataset `devrim/goodwiki_long_synthetic_ir` está bajo CC BY-SA 4.0, lo que puede imponer restricciones de share-alike si se redistribuyen derivados del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r1-c512s512
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (to appear).
