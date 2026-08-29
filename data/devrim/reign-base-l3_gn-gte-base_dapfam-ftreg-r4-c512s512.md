# devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r4-c512s512

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es una arquitectura propuesta para escalar eficientemente la longitud de contexto en modelos de embeddings de documentos. Este checkpoint concreto, `reign-base-l3_gn-gte-base_dapfam-ftreg-r4-c512s512`, es un encoder cross-chunk de 3 capas (22,45 millones de parámetros entrenables) que opera sobre una red de guía congelada, `thenlper/gte-base` (110 millones de parámetros), y ha sido ajustado con la receta DAPFAM para recuperación de familias de patentes. El modelo procesa documentos largos dividiéndolos en chunks de 512 tokens con stride 512, y agrega las representaciones de cada chunk mediante el encoder REIGN.

El propósito de liberar este checkpoint es documentar un resultado negativo: el ajuste fino con la receta DAPFAM no supera al rendimiento zero-shot del modelo base en la tarea de recuperación de patentes. Según el paper asociado, ninguna celda del barrido de hiperparámetros mejora al backbone zero-shot, y el ajuste ingenuo con learning rate 1e-5 lo degrada entre 0,4 y 1,5 puntos. Por tanto, este modelo no se recomienda como punto de partida para producción en recuperación de patentes; los checkpoints zero-shot de GoodWiki-Long son preferibles. Aun así, se publica para que el resultado negativo sea inspeccionable y reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (3 capas, d=768, 12 cabezas, FFN 3072) sobre red de guía GTE-base congelada |
| Parametros totales | 22.446.336 (encoder REIGN) + 110M (red de guía congelada, no entrenable) |
| Parametros activos | No aplica (no es MoE; todos los parámetros del encoder son activos durante inferencia) |
| Longitud de contexto | Depende del chunking: chunk size 512, stride 512; soporta documentos arbitrariamente largos mediante múltiples chunks |
| Tipos de cuantizacion | No disponible (solo pesos float32 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN es un encoder cross-chunk que toma como entrada los embeddings de chunks generados por una red de guía (guidance network) congelada, en este caso GTE-base. La red de guía produce representaciones locales para cada ventana de 512 tokens, y el encoder REIGN (3 capas transformer con d=768, 12 cabezas y FFN de 3072) agrega estas representaciones para producir un embedding global del documento. El checkpoint solo contiene los pesos del encoder REIGN; la red de guía debe cargarse por separado y permanece congelada durante inferencia.

El entrenamiento se realizó con la receta DAPFAM: objetivo InfoNCE con temperatura 0,07, enmascaramiento de falsos negativos, 4 negativos por muestra más negativos intra-batch, optimizador AdamW con schedule coseno, learning rate 2e-6, weight decay 0,1, 6 épocas con validación cada 3, batch size 2, precisión mixta de 16 bits y semilla 42. La inicialización fue "warm", partiendo del checkpoint `reign-base-l3_gn-gte-base_val-selected` entrenado en GoodWiki-Long. El resultado reportado es que el ajuste fino no supera al zero-shot en la tarea DAPFAM, lo que constituye un hallazgo negativo documentado.

## Capacidades

- Generación de embeddings L2-normalizados para documentos completos, aptos para similitud coseno (el producto escalar equivale a la similitud coseno).
- Recuperación documento-a-documento (document-to-document retrieval) sobre colecciones largas, gracias al procesamiento por chunks con stride configurable.
- Manejo de entradas multi-chunk: el encoder REIGN agrega información de múltiples ventanas, lo que permite escalar a documentos de longitud arbitraria.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio. Es exclusivamente un modelo de extracción de características (feature extraction).
- Multilingüe: solo inglés, según la etiqueta `language: en`.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite verificar el resultado negativo reportado en el paper REIGN, comparando el rendimiento del ajuste fino DAPFAM frente al zero-shot en la misma tarea.
- Análisis de metodologías de fine-tuning para retrieval: sirve como caso de estudio para entender por qué el ajuste con InfoNCE y lr bajo no mejora sobre el backbone congelado en dominios específicos como patentes.
- Evaluación de arquitecturas cross-chunk: investigadores pueden usar este modelo como referencia para comparar otras estrategias de agregación de chunks en recuperación de documentos largos.
- Desarrollo de pipelines de retrieval con GTE-base: aunque no se recomienda para producción, el código de uso muestra cómo integrar un encoder REIGN con una red de guía congelada, útil para prototipos.
- Inspección de pesos y configuraciones: al ser un checkpoint pequeño (0,1 GB), es adecuado para análisis de representaciones internas o estudios de ablación.
- Benchmarking de hardware: su bajo coste computacional (22,45M de parámetros activos) lo hace útil para medir latencia y throughput en tareas de embedding de documentos largos en GPUs modestas.

## Benchmarks y rendimiento

El modelo reporta resultados de nDCG@100 en el conjunto de test de DAPFAM (recuperación de familias de patentes, corpus FullText, top-100 con auto-coincidencias eliminadas). Estos valores son los que el paper asocia a este checkpoint exacto (Apéndice J).

| Split | nDCG@100 |
|---|---:|
| test | 32,60 |
| test_in | 37,64 |
| test_out | 5,31 |

El propio autor indica que el ajuste fino no supera al zero-shot en esta tarea, y que el rendimiento en `test_out` (familias de patentes fuera del dominio de entrenamiento) es particularmente bajo. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el encoder REIGN tiene 22,45M de parámetros (≈90 MB en float32), y la red de guía GTE-base 110M (≈440 MB en float32). En total, menos de 600 MB de pesos, por lo que cabe en cualquier GPU consumer (incluso en una GTX 1060 de 6 GB) y también en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior permitirá procesar lotes mayores. Para producción con muchos documentos, una A100 o H100 no aporta ventaja significativa dado el pequeño tamaño.
- Despliegue: se usa mediante la librería `reign` (instalable desde GitHub) con `ReignBaselineEncoder`. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo sino un extractor de características.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido, se espera una latencia de pocos milisegundos por documento en GPU moderna, pero depende del número de chunks y del hardware.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de embeddings de documentos largos en la documentación proporcionada. El modelo base GTE-base (110M) es el componente de guía, pero no hay datos de rendimiento relativo frente a alternativas como GTE-large, BGE-M3 o E5-Mistral. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- Resultado negativo documentado: el ajuste fino DAPFAM no supera al zero-shot; para recuperación de patentes se recomienda usar los checkpoints zero-shot de GoodWiki-Long.
- No usar para inputs cortos: si el documento es más corto que el chunk size (512 tokens), el encoder cross-chunk no tiene nada que agregar y el modelo no es adecuado; en ese régimen debe usarse solo la red de guía.
- Solo inglés: no soporta otros idiomas.
- Dependencia de la red de guía: el checkpoint no es autónomo; requiere cargar `thenlper/gte-base` por separado, lo que añade complejidad de despliegue.
- Riesgo de alucinación: no aplica, al ser un modelo de embeddings y no generativo.
- Sesgos: no se han documentado sesgos específicos, pero al entrenarse con datos de Wikipedia (GoodWiki) y patentes, puede reflejar sesgos presentes en esos corpus.
- Licencia: Apache 2.0 para el modelo, pero el dataset `devrim/goodwiki_long_synthetic_ir` está bajo CC BY-SA 4.0, lo que puede afectar a redistribuciones de datos derivados.
- Reproducibilidad: el entrenamiento con precisión mixta de 16 bits no es bit-reproducible; un reentrenamiento no producirá pesos idénticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ftreg-r4-c512s512
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (to appear).
