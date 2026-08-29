# devrim/reign-base-l3_gn-gte-base_dapfam-ftwarm-c512s512

## Resumen

`devrim/reign-base-l3_gn-gte-base_dapfam-ftwarm-c512s512` es un modelo de embeddings de documentos largos basado en la arquitectura REIGN (Refurbished Embeddings with Integrated Guidance Networks), desarrollado por Devrim Cavuşoğlu y Emre Akbaş. El modelo combina un encoder cross-chunk ligero de 22,45 millones de parámetros con una red guía congelada, GTE-base (110M), que se encarga de generar representaciones por fragmentos. El resultado es un sistema capaz de producir embeddings de documentos completos superando la ventana de contexto del modelo guía, mediante la agregación de fragmentos de 512 tokens sin solapamiento.

Este checkpoint concreto es un fine-tuning warm-start sobre la tarea DAPFAM de recuperación de familias de patentes, partiendo de un checkpoint previamente entrenado en GoodWiki-Long. El autor publica este modelo como parte de un barrido de experimentos y advierte explícitamente que el fine-tuning no supera al rendimiento zero-shot del backbone, por lo que no lo recomienda como punto de partida para recuperación de patentes. Su relevancia radica en que documenta un resultado negativo reproducible y permite inspeccionar el comportamiento del cross-chunk encoder en un dominio especializado.

El modelo está pensado exclusivamente para retrieval documento-a-documento con entradas multi-fragmento, no para generación de texto ni para consultas cortas. Se distribuye bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (3 capas transformer, d=768, 12 cabezas, FFN 3072) + red guía GTE-base congelada (110M) |
| Parametros totales | 22.446.336 (solo encoder REIGN; la red guía añade 110M congelados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por fragmento (chunk size); sin límite práctico de documento gracias al stride 512 |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

REIGN introduce un encoder cross-chunk que opera sobre las representaciones por fragmento generadas por una red guía congelada. En este caso, la red guía es GTE-base (thenlper/gte-base), que procesa cada fragmento de 512 tokens con un stride de 512 (sin solapamiento). El encoder REIGN, con 3 capas transformer y 22,45M de parámetros entrenables, agrega las embeddings de los fragmentos para producir un vector L2-normalizado del documento completo. Esta separación permite escalar a documentos arbitrariamente largos sin aumentar el coste de la red guía.

El entrenamiento de este checkpoint sigue la receta DAPFAM: objetivo contrastivo InfoNCE con temperatura 0,07, enmascaramiento de falsos negativos y política parcial `ignore`. Se usan 4 familias negativas proporcionadas por la tarea más negativos in-batch. El optimizador es AdamW con coseno, learning rate 1e-5, weight decay 1e-4, 15 épocas con validación cada 3, batch size 2 y precisión mixta de 16 bits. El checkpoint parte de una inicialización cálida desde `reign-base-l3_gn-gte-base_val-selected`, previamente entrenado en GoodWiki-Long. El autor señala que el entrenamiento en precisión mixta no es bit-reproducible, por lo que una re-ejecución no producirá pesos idénticos.

## Capacidades

- Generación de embeddings de documentos largos: procesa documentos completos dividiéndolos en fragmentos de 512 tokens y agregándolos mediante el cross-chunk encoder.
- Recuperación documento-a-documento: produce vectores L2-normalizados cuya similitud coseno (equivalente al producto escalar) permite ordenar documentos por relevancia.
- Manejo de entradas multi-fragmento: el encoder cross-chunk agrega información de todos los fragmentos, superando la ventana de contexto de la red guía.
- Fine-tuning específico de dominio: el checkpoint ha sido ajustado para recuperación de familias de patentes (DAPFAM), aunque con resultados negativos frente al zero-shot.
- Integración con el ecosistema REIGN: se usa mediante la clase `ReignBaselineEncoder` del paquete `reign`, que carga la red guía por separado y la mantiene congelada.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es un modelo puramente de feature extraction.

## Casos de uso

- Recuperación de familias de patentes: el modelo puede indexar documentos de patentes completos y recuperar familias relacionadas a partir de un documento consulta, gracias a su capacidad de manejar textos largos sin truncamiento. Sin embargo, el autor recomienda usar los checkpoints zero-shot de GoodWiki-Long para esta tarea, ya que este fine-tuning degrada el rendimiento.
- Búsqueda semántica en documentos legales: contratos, sentencias o escritos extensos pueden ser embedidos completos y comparados por similitud coseno, evitando la pérdida de información por truncamiento.
- Indexación para RAG sobre corpus largos: en pipelines de retrieval-augmented generation, el modelo puede generar embeddings de documentos completos para una primera fase de recuperación, aunque para consultas cortas es preferible usar la red guía sola.
- Deduplicación de documentos: comparar embeddings de documentos completos para detectar duplicados o versiones cercanas en bases de datos de gran tamaño.
- Agrupación (clustering) de documentos por temática: al representar documentos completos, se pueden agrupar por similitud semántica sin depender de resúmenes o fragmentos.
- Análisis de evolución de patentes: seguimiento de familias de patentes a lo largo del tiempo mediante la comparación de documentos completos, útil en estudios de innovación.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de nDCG@100 sobre DAPFAM (top-100 sobre el corpus FullText completo, con auto-coincidencias eliminadas). Estos valores corresponden al checkpoint exacto y se recogen en el Apéndice J del paper.

| Split | nDCG@100 |
|---|---|
| test | 31.19 |
| test_in | 35.60 |
| test_out | 5.36 |

El autor indica explícitamente que el fine-tuning no supera al rendimiento zero-shot del backbone en esta tarea, y que el naive fine-tuning con lr 1e-5 lo degrada entre 0,4 y 1,5 puntos. No se proporcionan comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder REIGN pesa ~90 MB en float32 (22,45M × 4 bytes) y la red guía GTE-base ~440 MB (110M × 4 bytes), total ~530 MB. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1060 6GB, RTX 3060, RTX 4090, o incluso CPU con suficiente RAM.
- Despliegue en consumer GPU: sí, sin problemas. No requiere GPU de datacenter.
- Opciones de despliegue: el paquete `reign` (instalable desde GitHub) proporciona la clase `ReignBaselineEncoder`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible en la información proporcionada. Depende del número de fragmentos por documento y del hardware.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia estructural:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| reign-base-l3 (este) | 22,45M + 110M guía | 512 por fragmento, ilimitado en documento | Cross-chunk encoder sobre GTE-base | Apache 2.0 |
| thenlper/gte-base | 110M | 512 tokens | Embeddings por fragmento, sin agregación | Apache 2.0 |
| BGE-base (BAAI) | 109M | 512 tokens | Embeddings de texto, sin manejo de documentos largos | MIT |

La comparativa directa con otros modelos de retrieval de documentos largos (p. ej., Longformer, ColBERT) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento negativo en fine-tuning: el autor reporta que este checkpoint no supera al zero-shot del backbone en DAPFAM, y que el fine-tuning degrada el rendimiento. No debe usarse como punto de partida para recuperación de patentes.
- Solo entradas multi-fragmento: para inputs más cortos que el chunk size (512 tokens), el cross-chunk encoder no tiene nada que agregar y el modelo no es adecuado; en ese régimen debe usarse la red guía sola.
- Idioma limitado: solo soporta inglés. No hay capacidades multilingües.
- Sin generación de texto: es un modelo de embeddings puro, no un LLM generativo.
- Dependencia de la red guía: el checkpoint solo contiene el encoder REIGN; la red guía GTE-base debe cargarse por separado y permanece congelada, lo que añade complejidad de despliegue.
- Reproducibilidad: el entrenamiento en precisión mixta no es bit-reproducible; una re-ejecución no producirá pesos idénticos.
- Riesgo de alucinación: no aplica, al no ser generativo. El riesgo se limita a la calidad de los embeddings en dominios no cubiertos por el entrenamiento.
- Licencia del dataset: el dataset `devrim/goodwiki_long_synthetic_ir` se distribuye bajo CC BY-SA 4.0, lo que puede imponer restricciones de atribución y share-alike en usos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ftwarm-c512s512
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (to appear).
