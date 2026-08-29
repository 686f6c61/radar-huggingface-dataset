# devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r3-c512s512

## Resumen

El modelo `devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r3-c512s512` es un encoder de embeddings de documentos largos basado en la arquitectura REIGN (Refurbished Embeddings with Integrated Guidance Networks). Desarrollado por Devrim Cavuşoğlu y Emre Akbaş, este checkpoint concreto es el resultado de un fine-tuning sobre la tarea de recuperación de familias de patentes DAPFAM, partiendo de un checkpoint preentrenado en el dataset sintético GoodWiki-Long. El modelo combina un encoder cross-chunk ligero (22,45 millones de parámetros entrenables) con una red de guía congelada (GTE-base, 110 millones de parámetros) que procesa el texto en fragmentos de 512 tokens.

La relevancia de este modelo radica en su enfoque para escalar la longitud de contexto en tareas de recuperación de documentos sin aumentar drásticamente el coste computacional. En lugar de procesar documentos completos de una sola vez, REIGN divide el texto en chunks y utiliza un encoder adicional para agregar las representaciones de cada fragmento, permitiendo manejar documentos arbitrariamente largos. Sin embargo, los resultados reportados en la model card indican que el fine-tuning en DAPFAM no supera al checkpoint zero-shot (paridad estadística), por lo que el autor recomienda usar las versiones zero-shot para tareas de recuperación de patentes. El modelo está liberado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (3 capas transformer, d=768, 12 cabezas, FFN 3072) + red de guía GTE-base congelada |
| Parametros totales | 22.446.336 (encoder REIGN) + 110M (GTE-base, congelados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por chunk; soporta documentos largos mediante múltiples chunks (sin límite explícito) |
| Tipos de cuantizacion | No disponible (solo pesos float32 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura REIGN, que separa el procesamiento en dos componentes: una red de guía (guidance network) congelada, en este caso GTE-base, que genera embeddings por chunk de 512 tokens, y un encoder cross-chunk (REIGN base-l3) que agrega las representaciones de los chunks para producir un embedding final del documento. El encoder REIGN es un transformer de 3 capas con 12 cabezas de atención y una dimensión oculta de 768, lo que resulta en 22,45 millones de parámetros entrenables. La red de guía permanece congelada durante todo el entrenamiento.

El fine-tuning se realizó sobre el dataset DAPFAM (retrieval de familias de patentes, FullText) utilizando una pérdida contrastiva InfoNCE con temperatura 0,07, máscara de falsos negativos y política de parciales `ignore`. Se emplearon 4 negativos por muestra (familias con score 0) más negativos intra-lote. El optimizador fue AdamW con schedule coseno, learning rate 1e-6, weight decay 1e-2, 8 épocas, batch size 2 y precisión mixta de 16 bits. La inicialización fue "warm", partiendo del checkpoint `reign-base-l3_gn-gte-base_val-selected` entrenado en GoodWiki-Long. El chunk size y stride son ambos 512, lo que produce fragmentos no solapados.

## Capacidades

- Generación de embeddings de documentos largos: procesa textos de longitud arbitraria dividiéndolos en chunks de 512 tokens y agregando sus representaciones mediante el encoder cross-chunk.
- Recuperación de documentos (document-to-document retrieval): produce vectores L2-normalizados, de modo que la similitud coseno se calcula como producto punto.
- Búsqueda por similitud semántica: adecuado para tareas de retrieval en corpus extensos, como patentes o documentos legales.
- Integración con pipelines de RAG: puede usarse como componente de indexación y recuperación en sistemas de generación aumentada por recuperación.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de extracción de características (feature extraction).
- Multilingüe: no, solo inglés.

## Casos de uso

- Recuperación de familias de patentes: el modelo fue fine-tuneado específicamente en DAPFAM, por lo que puede indexar y buscar documentos de patentes completos, agrupando por familia. Aunque el autor advierte que no supera al zero-shot, sigue siendo funcional para este dominio.
- Búsqueda en bases de conocimiento legales: documentos jurídicos extensos (sentencias, contratos) pueden dividirse en chunks y recuperarse mediante similitud coseno, útil para despachos o plataformas de acceso a jurisprudencia.
- Indexación de artículos científicos: repositorios de papers largos (más de 512 tokens) pueden beneficiarse de la agregación cross-chunk para mejorar la precisión en búsquedas temáticas.
- Sistemas RAG sobre documentación técnica: manuales, guías o libros técnicos extensos pueden indexarse con este modelo para alimentar chatbots o asistentes que responden con fragmentos relevantes.
- Deduplicación de documentos: al generar embeddings de documentos completos, permite detectar duplicados o versiones similares en grandes corpora, incluso si las diferencias están distribuidas a lo largo del texto.
- Análisis de similitud entre informes o memorandos: en entornos corporativos, comparar documentos largos (informes anuales, memorandos) mediante la similitud coseno de sus embeddings.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de nDCG@100 sobre el corpus DAPFAM (top-100, con auto-coincidencias eliminadas). Estos valores corresponden al checkpoint exacto y se comparan con el backbone zero-shot (mismo stride 512).

| Split | nDCG@100 (fine-tuned) | nDCG@100 (zero-shot) |
|---|---|---|
| test | 32.73 | 32.68 |
| test_in | 37.76 | no disponible |
| test_out | 5.32 | no disponible |

El autor indica que la diferencia de +0.05 en `test` es estadísticamente insignificante, y que ningún cell del barrido de fine-tuning supera al zero-shot. Además, un fine-tuning ingenuo con lr 1e-5 degrada el rendimiento en 0.4–1.5 puntos. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: el encoder REIGN tiene solo 22,45M de parámetros, lo que en float32 ocupa aproximadamente 90 MB. La red de guía GTE-base (110M) añade unos 440 MB, totalizando ~530 MB en float32. Con cuantización a 8 bits (no disponible oficialmente) se podría reducir, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Incluso puede ejecutarse en CPU con razonable velocidad para inferencia por lotes pequeños.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU consumer (GTX 1060, RTX 2060, etc.) y también en Apple Silicon.
- Opciones de despliegue: el modelo requiere el paquete `reign` (instalable desde GitHub) y se usa mediante Python. No es compatible con vLLM, llama.cpp u Ollama porque no es un LLM generativo. Se puede integrar en pipelines de HuggingFace Transformers si se adapta, pero el flujo oficial usa `ReignBaselineEncoder`.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el pequeño tamaño, se espera una latencia de milisegundos por documento en GPU y de decenas de milisegundos en CPU, dependiendo del número de chunks.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de embeddings de documentos largos (p. ej., Longformer, MPNet, o modelos específicos de retrieval como ColBERT) en la información proporcionada. La única comparación directa es con el checkpoint zero-shot del mismo modelo, que muestra paridad estadística. A continuación se presenta una comparación cualitativa con el modelo base GTE-base (que actúa como red de guía) y con un hipotético modelo de contexto largo estándar.

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| REIGN (este) | 22M (encoder) + 110M (guía) | 512 por chunk, ilimitado en total | Cross-chunk aggregation | Apache 2.0 |
| GTE-base (guía) | 110M | 512 tokens | Embeddings por secuencia | Apache 2.0 |
| Longformer (referencia) | 148M | 4096 tokens | Atención esparsa | Apache 2.0 |

No se dispone de datos de rendimiento para estos modelos en DAPFAM, por lo que la comparación es estructural, no empírica.

## Limitaciones y advertencias

- El fine-tuning en DAPFAM no mejora el rendimiento zero-shot; el autor recomienda usar los checkpoints zero-shot de GoodWiki-Long para tareas de recuperación de patentes. Este checkpoint se libera para inspección del resultado negativo.
- No debe usarse para inputs de menos de 512 tokens: en ese caso, el encoder cross-chunk no tiene nada que agregar y el modelo se comporta como la red de guía sola, lo que puede producir embeddings subóptimos.
- Solo soporta inglés; no hay capacidades multilingües.
- Al ser un modelo de embeddings, no genera texto, por lo que no presenta riesgo de alucinación en el sentido generativo, pero sí puede producir representaciones sesgadas si los datos de entrenamiento (patentes, Wikipedia) contienen sesgos de dominio o geográficos.
- La licencia Apache 2.0 permite uso comercial, pero el dataset `devrim/goodwiki_long_synthetic_ir` está bajo CC BY-SA 4.0, lo que puede imponer restricciones de share-alike si se redistribuyen datos derivados.
- El entrenamiento con precisión mixta no es bit-reproducible; si se reentrena, los pesos no coincidirán exactamente, aunque las métricas deberían ser similares.
- No hay versiones cuantizadas (GGUF, int8, etc.) disponibles; el despliegue en producción requiere float32, lo que limita la optimización en entornos con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r3-c512s512
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset GoodWiki-Long: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).
