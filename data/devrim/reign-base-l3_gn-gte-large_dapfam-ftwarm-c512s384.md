# devrim/reign-base-l3_gn-gte-large_dapfam-ftwarm-c512s384

## Resumen

El modelo `devrim/reign-base-l3_gn-gte-large_dapfam-ftwarm-c512s384` es un checkpoint del framework REIGN (Refurbished Embeddings with Integrated Guidance Networks), desarrollado por Devrim Cavusoglu y Emre Akbas. REIGN propone un enfoque para escalar la longitud de contexto en tareas de retrieval de documentos largos: un encoder cross-chunk ligero (3 capas, 22,45 millones de parámetros entrenables) que agrega los embeddings generados por un modelo guía congelado, en este caso GTE-large (335 millones de parámetros). El checkpoint concreto corresponde a un fine-tuning con warm-start sobre la tarea DAPFAM de retrieval de familias de patentes, con un tamaño de chunk de 512 tokens y un stride de 384.

Este modelo se publica con un propósito principalmente científico: los autores reportan que el fine-tuning no supera al zero-shot en esta tarea, y que el ajuste naive degrada el rendimiento entre 0,4 y 1,5 puntos. Por tanto, no se recomienda como punto de partida para retrieval de patentes; se libera para que el resultado negativo sea inspeccionable. La relevancia del modelo reside en documentar una estrategia de escalado de contexto alternativa a los LLMs de ventana larga, y en servir como referencia para investigaciones sobre fine-tuning de embeddings de documentos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder cross-chunk (REIGN base-l3): 3 capas, d=768, 12 cabezas, FFN 3072 |
| Parametros totales | 22.643.456 (encoder REIGN, safetensors) + 335M del guidance network GTE-large congelado |
| Parametros activos | 22,45M (encoder REIGN) |
| Longitud de contexto | 512 tokens por chunk (ventana del guidance network), stride 384, sin límite de longitud total del documento |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN combina un modelo guía congelado (GTE-large) que produce embeddings por chunks de un documento largo, y un encoder cross-chunk (el checkpoint liberado) que agrega esos embeddings para generar una representación única del documento. El encoder cross-chunk es un transformer pequeño de 3 capas con 768 dimensiones ocultas y 12 cabezas de atención, entrenado con el objetivo InfoNCE con temperatura 0,07, usando negativos in-batch y negativos proporcionados por la tarea. El fine-tuning se realizó sobre el dataset DAPFAM (retrieval de familias de patentes, FullText) con warm-start desde un checkpoint pre-entrenado en GoodWiki-Long. El entrenamiento usó AdamW con learning rate 1e-5, weight decay 1e-4, 15 épocas, batch size 2 y precisión mixta fp16. La inicialización cálida proviene del checkpoint `reign-base-l3_gn-gte-large_val-selected`. El resultado principal es que el fine-tuning no mejora el zero-shot, hallazgo que los autores atribuyen a la naturaleza binaria de las etiquetas de DAPFAM y a la sensibilidad del ajuste en esta arquitectura.

## Capacidades

- Generación de embeddings de documentos largos (multi-chunk) para retrieval documento-documento.
- Agregación de representaciones de chunks mediante un encoder cross-chunk entrenado.
- Vectores L2-normalizados, similitud coseno equivalente a producto escalar.
- Soporte de documentos de longitud arbitraria mediante ventanas deslizantes (chunk 512, stride configurable).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Monolingüe (inglés).

## Casos de uso

- Investigación en retrieval de documentos largos: el checkpoint sirve para reproducir y analizar el resultado negativo reportado en el paper, comparando estrategias de fine-tuning frente a zero-shot.
- Evaluación de pipelines de embeddings para patentes: puede usarse como baseline en experimentos que estudien el efecto del fine-tuning en dominios especializados.
- Desarrollo de sistemas de búsqueda de patentes (experimental): aunque el rendimiento es inferior al zero-shot, el modelo puede integrarse en prototipos para medir la degradación y validar hipótesis sobre el ajuste.
- Benchmarking de arquitecturas cross-chunk: permite comparar el encoder REIGN con otros agregadores de embeddings en tareas de retrieval de documentos extensos.
- Estudio de transferencia de conocimiento: el warm-start desde GoodWiki-Long y el posterior fine-tuning en DAPFAM ofrecen un caso de estudio sobre la interacción entre pre-entrenamiento y ajuste en retrieval.
- Inspección de pesos y activaciones: al ser un modelo pequeño, es útil para análisis de interpretabilidad de cómo se combinan los chunks.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados en DAPFAM (nDCG@100, top-100 sobre el corpus FullText, self-matches eliminados):

| Split | nDCG@100 |
|---|---|
| test | 32,79 |
| test_in | 37,48 |
| test_out | 5,56 |

No se han publicado comparaciones con otros modelos en la información disponible. Los autores indican que el fine-tuning no supera al zero-shot del mismo backbone, pero no proporcionan los valores numéricos del zero-shot en esta ficha.

## Requisitos de hardware

- VRAM estimada: el encoder REIGN (22,6M parámetros) más el guidance network GTE-large (335M) en float32 requieren aproximadamente 1,4 GB de memoria. Con batch pequeño, cabe en GPUs de 4 GB o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) o CPU con 8 GB de RAM.
- Despliegue: no es un modelo para vLLM, llama.cpp u Ollama; se usa mediante la librería `reign` (instalable desde GitHub) o directamente con Hugging Face Transformers para el encoder.
- Latencia: al procesar documentos largos, la latencia depende del número de chunks; con chunk 512 y stride 384, un documento de 10.000 tokens genera ~25 chunks, cada uno procesado por GTE-large. En GPU moderna, el throughput estimado es de cientos de documentos por minuto, pero no se dispone de datos oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de retrieval de documentos largos en la documentación proporcionada. El modelo se basa en GTE-large como guidance network, por lo que una comparación natural sería contra GTE-large solo (sin cross-chunk), pero no se reportan esos números. Tampoco hay datos frente a modelos como E5-large, BGE-large o Jina Embeddings v2. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- El fine-tuning no supera al zero-shot en DAPFAM; el modelo no es recomendado para retrieval de patentes en producción.
- Solo soporta inglés.
- No es adecuado para inputs cortos (menores que el chunk size); en ese régimen debe usarse el guidance network directamente.
- El checkpoint solo contiene el encoder REIGN; el guidance network debe cargarse por separado y permanece congelado.
- La licencia Apache 2.0 permite uso comercial, pero el dataset `goodwiki_long_synthetic_ir` está bajo CC BY-SA 4.0, lo que puede imponer restricciones de share-alike si se redistribuyen derivados.
- El entrenamiento con precisión mixta no es bit-reproducible; los pesos no son exactamente replicables.
- No hay garantías de soporte ni mantenimiento; es un artefacto de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-large_dapfam-ftwarm-c512s384
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).
