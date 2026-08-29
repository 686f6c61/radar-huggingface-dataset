# devrim/reign-base-l3_gn-gte-base_dapfam-ftwarm-c512s384

## Resumen

El modelo `devrim/reign-base-l3_gn-gte-base_dapfam-ftwarm-c512s384` es un encoder de embeddings para recuperación de documentos largos, desarrollado por Devrim Cavuşoğlu y Emre Akbaş como parte del proyecto REIGN (Refurbished Embeddings with Integrated Guidance Networks). Se trata de un cross-chunk encoder de 3 capas (22,45 millones de parámetros entrenables) que agrega las representaciones generadas por una red de guía congelada, en este caso GTE-base (110 millones de parámetros), sobre fragmentos de 512 tokens con un solapamiento de 384. El checkpoint se libera como parte de un estudio sobre escalado de longitud de contexto en retrieval, pero constituye un resultado negativo: el fine-tuning en la tarea de patentes DAPFAM no supera al modelo zero-shot, y el propio autor recomienda no usarlo como punto de partida para esa tarea concreta.

La relevancia de este modelo reside en que documenta un hallazgo importante para la comunidad: el fine-tuning naive de un cross-chunk encoder puede degradar el rendimiento respecto al zero-shot, incluso con estrategias de warm-start. Su publicación permite inspeccionar y reproducir este resultado negativo, contribuyendo a una mejor comprensión de los límites del ajuste fino en arquitecturas de retrieval de contexto largo. El modelo está pensado exclusivamente para la extracción de características (feature extraction) y no para generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN base-l3 (cross-chunk encoder, 3 capas, d=768, 12 cabezas, FFN 3072) + red de guía GTE-base congelada |
| Parametros totales | 22.446.336 (solo el encoder REIGN; la red de guía añade 110M congelados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Depende del número de chunks; chunk size 512, stride 384 |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN utiliza una arquitectura de doble componente: una red de guía (guidance network) que procesa los chunks del documento de forma independiente y produce embeddings locales, y un cross-chunk encoder que agrega estos embeddings a lo largo de la secuencia de chunks para producir una representación global del documento. En este checkpoint, la red de guía es GTE-base (110M parámetros) y permanece congelada durante todo el entrenamiento; solo se actualizan los 22,45M parámetros del encoder REIGN. El chunk size es 512 tokens, coincidiendo con la ventana de contexto de GTE-base, y el stride de 384 tokens produce un solapamiento del 25% entre fragmentos.

El entrenamiento se realizó sobre DAPFAM, una tarea de recuperación de familias de patentes, con un objetivo InfoNCE con temperatura 0,07, enmascaramiento de falsos negativos y política parcial `ignore`. Se usaron 4 negativos proporcionados por la tarea más negativos intra-lote, con optimizador AdamW, tasa de aprendizaje 1e-5, weight decay 1e-4, 15 épocas, batch size 2 y precisión mixta de 16 bits. El checkpoint parte de una inicialización cálida (warm-start) desde el modelo `reign-base-l3_gn-gte-base_val-selected`, entrenado previamente en el dataset sintético GoodWiki-Long. El resultado principal es que este fine-tuning no supera al zero-shot en DAPFAM, degradando el rendimiento entre 0,4 y 1,5 puntos según la configuración.

## Capacidades

- Generación de embeddings densos L2-normalizados para documentos completos, aptos para búsqueda por similitud coseno.
- Recuperación documento-a-documento en corpus de textos largos, gracias a la agregación de múltiples chunks.
- Manejo de documentos de longitud arbitraria mediante fragmentación con solapamiento controlado (chunk size 512, stride 384).
- Extracción de características para pipelines de retrieval aumentado (RAG) o indexación semántica.
- No soporta generación de texto, tool calling, agentes, visión ni audio; es un modelo puramente encoder.

## Casos de uso

- Indexación semántica de corpus de patentes: el modelo puede generar embeddings de documentos completos de patentes para búsqueda por similitud, aunque el autor advierte que para esta tarea concreta los checkpoints zero-shot de GoodWiki-Long ofrecen mejor rendimiento.
- Recuperación de documentos legales extensos: permite comparar contratos, sentencias o escritos mediante embeddings de documento completo, evitando la pérdida de contexto que sufren los modelos de ventana corta.
- Búsqueda semántica en bases de conocimiento técnico: útil para indexar manuales, especificaciones o informes largos y recuperarlos por similitud semántica.
- Sistemas de recomendación de artículos científicos: al generar embeddings de papers completos, se pueden encontrar trabajos relacionados por contenido, superando las limitaciones de los resúmenes.
- Deduplicación de documentos: la representación de documento completo permite detectar duplicados o versiones cercanas en grandes repositorios.
- Análisis de evolución de dominios técnicos: al comparar embeddings de documentos de diferentes épocas, se pueden identificar tendencias o cambios en la terminología.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de nDCG@100 en la tarea DAPFAM (top-100 sobre el corpus FullText completo, con auto-coincidencias eliminadas). Estos valores corresponden al checkpoint exacto y se recogen en el Apéndice J del paper.

| Split | nDCG@100 |
|---|---|
| test | 32,31 |
| test_in | 36,88 |
| test_out | 5,62 |

El autor indica explícitamente que el fine-tuning no supera al zero-shot en esta tarea, y que el ajuste naive a lr 1e-5 lo degrada entre 0,4 y 1,5 puntos. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, latencia o throughput.
- Estimación orientativa: el encoder REIGN (22,45M parámetros) más la red de guía GTE-base (110M) suman unos 132M parámetros. En float32, el peso total ronda los 528 MB, por lo que cabría en GPUs consumer con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050).
- El despliegue se realiza mediante el paquete `reign` disponible en GitHub, que carga el checkpoint y la red de guía por separado. No se mencionan integraciones con vLLM, Ollama o TGI, al tratarse de un modelo de embeddings y no de un LLM generativo.
- Para inferencia en lote sobre corpus grandes, se recomienda una GPU con al menos 8 GB de VRAM para mantener un throughput razonable, aunque no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de embeddings de documentos largos (p. ej., GTE, BGE, E5). El modelo base GTE-base (110M) es el componente de guía, pero no se reportan métricas comparativas del propio GTE-base en DAPFAM. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Resultado negativo: el fine-tuning en DAPFAM no mejora el zero-shot; para recuperación de patentes se recomienda usar los checkpoints zero-shot de GoodWiki-Long.
- No debe usarse para entradas más cortas que el chunk size (512 tokens), ya que el cross-chunk encoder no tiene nada que agregar y el modelo colapsa a un único embedding.
- Solo soporta inglés; no hay evidencia de rendimiento en otros idiomas.
- No es un modelo generativo; no produce texto, solo embeddings.
- La red de guía debe cargarse por separado y permanece congelada; el checkpoint solo contiene los pesos del encoder REIGN.
- El entrenamiento con precisión mixta no es bit-reproducible, por lo que un reentrenamiento no producirá pesos idénticos.
- Licencia Apache 2.0, pero el dataset `devrim/goodwiki_long_synthetic_ir` se distribuye bajo CC BY-SA 4.0, lo que puede imponer restricciones adicionales si se utiliza ese dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ftwarm-c512s384
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (en prensa).
