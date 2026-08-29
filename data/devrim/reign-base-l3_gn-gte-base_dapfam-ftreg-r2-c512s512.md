# devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r2-c512s512

## Resumen

El modelo `devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r2-c512s512` es un checkpoint de investigación del proyecto REIGN (Refurbished Embeddings with Integrated Guidance Networks), desarrollado por Devrim Cavuşoğlu y Emre Akbaş. Se trata de un encoder cross-chunk para recuperación de documentos largos: procesa documentos divididos en fragmentos (chunks) de 512 tokens y agrega sus embeddings mediante una red transformer de 3 capas, mientras que una red guía congelada (GTE-base, 110M parámetros) genera los embeddings de cada chunk. El encoder REIGN tiene 22,45 millones de parámetros entrenables.

Este checkpoint concreto se obtuvo mediante fine-tuning en la tarea DAPFAM (recuperación de familias de patentes) con una inicialización cálida desde un modelo previamente entrenado en GoodWiki-Long. El resultado principal es negativo: el fine-tuning no supera al rendimiento zero-shot del modelo base, y los autores publican este checkpoint para que el resultado sea inspeccionable, no como punto de partida recomendado. Es relevante porque documenta un hallazgo importante sobre los límites del fine-tuning en recuperación de documentos largos, y porque la arquitectura REIGN propone una forma eficiente de escalar el contexto sin aumentar el coste de la red guía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN base-l3 (encoder cross-chunk, 3 capas transformer, d=768, 12 cabezas, FFN 3072) + guidance network congelada GTE-base (110M) |
| Parametros totales | 22.446.336 (solo el encoder REIGN; la guidance network tiene 110M pero no se entrena) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens por chunk (ventana de la guidance network); el modelo procesa múltiples chunks, por lo que el contexto efectivo es ilimitado en la práctica |
| Tipos de cuantizacion | No disponible (los pesos se publican en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) + config.json |

## Arquitectura y entrenamiento

REIGN separa la generación de embeddings de fragmentos (a cargo de una guidance network congelada, en este caso GTE-base) de la agregación cross-chunk (a cargo de un encoder transformer pequeño). El encoder `base-l3` tiene 3 capas, dimensión 768, 12 cabezas de atención y FFN de 3072 unidades, lo que suma 22,45M parámetros entrenables. La guidance network se mantiene congelada durante todo el entrenamiento, lo que reduce drásticamente el coste computacional frente a fine-tunear el modelo completo.

El entrenamiento de este checkpoint se realizó sobre el conjunto DAPFAM (recuperación de familias de patentes, texto completo) con una inicialización cálida desde el checkpoint `reign-base-l3_gn-gte-base_val-selected` (entrenado en GoodWiki-Long). Se usó la receta de fine-tuning de DAPFAM: objetivo InfoNCE con temperatura 0,07, enmascaramiento de falsos negativos, política parcial `ignore`, 4 negativos por muestra más negativos intra-lote, optimizador AdamW con programación coseno, tasa de aprendizaje 2e-6, weight decay 1e-2, 6 épocas con validación cada 3, batch size 2, precisión mixta de 16 bits y semilla 42. El chunk size y el stride son ambos 512, lo que produce fragmentos no solapados.

## Capacidades

- Generación de embeddings L2-normalizados para documentos largos (multi-chunk), orientado a recuperación documento-documento.
- Agregación cross-chunk: el encoder REIGN combina los embeddings de los fragmentos para producir una representación única del documento completo.
- Compatible con el ecosistema de Hugging Face mediante la clase `ReignBaselineEncoder` del paquete `reign`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un modelo de extracción de características (feature extraction).
- Monolingüe: entrenado y evaluado únicamente en inglés, aunque la guidance network GTE-base es multilingüe, el fine-tuning en DAPFAM es específico de inglés.

## Casos de uso

- Recuperación de familias de patentes: el modelo se fine-tuneó en DAPFAM, por lo que puede indexar y buscar documentos de patentes extensos (texto completo) mediante similitud coseno entre embeddings de documentos.
- Búsqueda semántica en corpus legales: documentos jurídicos largos (sentencias, contratos) pueden dividirse en chunks y agregarse con REIGN para recuperar casos relevantes.
- Sistemas RAG con documentos extensos: aunque el autor desaconseja usarlo para inputs cortos, en escenarios donde los documentos superan los 512 tokens, REIGN permite construir índices de embeddings sin truncar el contenido.
- Deduplicación de documentos largos: comparar embeddings de documentos completos para detectar duplicados o versiones similares en bases de datos grandes.
- Clustering temático de artículos científicos: agrupar papers largos por similitud semántica usando las representaciones agregadas.
- Indexación de libros o manuales técnicos: generar embeddings de capítulos o secciones completas para búsqueda interna en bibliotecas digitales.

## Benchmarks y rendimiento

El autor reporta resultados de nDCG@100 en DAPFAM (top-k=100 sobre el corpus FullText completo, con auto-coincidencias eliminadas) para este checkpoint exacto, según el Apéndice J del paper:

| Split | nDCG@100 |
|---|---|
| test | 32,60 |
| test_in | 37,64 |
| test_out | 5,31 |

El propio autor indica que el fine-tuning no supera al rendimiento zero-shot del modelo base, y que el barrido completo de hiperparámetros no encontró ninguna celda que mejorara al backbone zero-shot. El fine-tuning ingenuo con lr 1e-5 degrada el rendimiento entre 0,4 y 1,5 puntos. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el encoder REIGN tiene solo 22,45M parámetros (menos de 100 MB en float32); la guidance network GTE-base tiene 110M (unos 440 MB en float32). En total, menos de 1 GB de VRAM para inferencia en lote pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, o superiores). No requiere hardware especializado.
- Cabe en GPUs de consumo: sí, sin problema.
- Opciones de despliegue: no es un modelo estándar de transformers; requiere instalar el paquete `reign` desde GitHub (`pip install git+https://github.com/devrimcavusoglu/reign.git`) y cargar el checkpoint junto con la guidance network por separado. No es compatible directamente con vLLM, Ollama o TGI.
- Latencia y throughput: no se proporcionan datos. Dado el pequeño tamaño del encoder, la inferencia es rápida, pero el coste principal proviene de la guidance network (GTE-base) al generar embeddings de chunks.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de recuperación de documentos largos. El modelo más cercano es la propia guidance network `thenlper/gte-base`, que sirve como backbone y punto de referencia zero-shot. A modo orientativo:

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| REIGN base-l3 (este) | 22,45M (encoder) + 110M (guía congelada) | 512 por chunk, ilimitado en agregación | Apache 2.0 | Retrieval de documentos largos |
| GTE-base (thenlper) | 110M | 512 tokens | Apache 2.0 | Embeddings de texto general, retrieval |
| BGE-base (BAAI) | 109M | 512 tokens | MIT | Embeddings multilingües, retrieval |

No hay datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo: el fine-tuning en DAPFAM no supera al zero-shot; los autores recomiendan usar los checkpoints zero-shot de GoodWiki-Long para recuperación de patentes.
- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés, a pesar de que la guidance network subyacente sea multilingüe.
- No apto para inputs cortos: si el documento es más corto que el chunk size (512 tokens), el encoder cross-chunk no tiene nada que agregar y el modelo no debe usarse; en ese régimen es preferible la guidance network sola.
- Requiere cargar dos modelos por separado: el checkpoint solo contiene el encoder REIGN; la guidance network debe especificarse en tiempo de construcción, lo que complica el despliegue.
- Reproducibilidad: el entrenamiento con precisión mixta de 16 bits no es bit-reproducible incluso con semilla fija; los pesos retrenados no coincidirán bit a bit.
- Licencia del dataset: aunque el modelo es Apache 2.0, el dataset `devrim/goodwiki_long_synthetic_ir` se distribuye bajo CC BY-SA 4.0, lo que puede afectar a usos derivados que incluyan datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r2-c512s512
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (en prensa).
