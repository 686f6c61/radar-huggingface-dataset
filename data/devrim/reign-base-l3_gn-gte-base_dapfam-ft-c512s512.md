# devrim/reign-base-l3_gn-gte-base_dapfam-ft-c512s512

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es una arquitectura diseñada para escalar eficientemente la longitud de contexto en modelos de embeddings de documentos. Este checkpoint concreto, `reign-base-l3_gn-gte-base_dapfam-ft-c512s512`, implementa un encoder cross-chunk REIGN de 3 capas (22,45 millones de parámetros entrenables) sobre una red de guía congelada GTE-base (110 millones de parámetros), fine-tuneado sobre la tarea de retrieval de familias de patentes DAPFAM. El modelo procesa documentos largos dividiéndolos en chunks de 512 tokens con stride 512, y el encoder REIGN agrega las representaciones de los chunks para producir un embedding de documento completo.

El desarrollo corre a cargo de Devrim Cavusoglu y Emre Akbas, y el checkpoint se publica como parte de un estudio que documenta un resultado negativo: el fine-tuning en DAPFAM no supera al rendimiento zero-shot del backbone GTE-base. De hecho, los autores advierten explícitamente que este checkpoint no es un punto de partida recomendado para retrieval de patentes, y que para esa tarea prefieren los checkpoints zero-shot de GoodWiki-Long. La relevancia de esta publicación reside en la transparencia científica: permite inspeccionar un experimento fallido y sus métricas, algo poco habitual en el ecosistema de modelos de embeddings.

El modelo está licenciado bajo Apache 2.0, soporta únicamente inglés y se distribuye en formato safetensors. Su pipeline es `feature-extraction`, y está pensado para retrieval documento-a-documento con entradas multi-chunk.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (3 capas, d=768, 12 cabezas, FFN 3072) sobre red de guía GTE-base congelada |
| Parametros totales | 22.446.336 (encoder REIGN) + 110M (red de guía congelada, no incluida en el checkpoint) |
| Parametros activos | 22.446.336 (solo el encoder REIGN; la red de guía no se entrena) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red de guía); el encoder REIGN agrega multiples chunks, sin limite fijo documentado |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

REIGN combina dos componentes: una red de guía (guidance network) que genera embeddings por chunk, y un encoder cross-chunk que agrega esos embeddings para producir una representacion unica del documento. En este checkpoint, la red de guía es `thenlper/gte-base`, un modelo de embeddings de texto de 110M parametros, que permanece congelada durante el entrenamiento. El encoder REIGN es un transformer de 3 capas con 768 dimensiones ocultas, 12 cabezas de atencion y FFN de 3072, inicializado desde cero (cold start). El checkpoint solo contiene los pesos del encoder REIGN; la red de guía debe cargarse por separado.

El entrenamiento se realizo sobre DAPFAM, un dataset de retrieval de familias de patentes con etiquetas binarias de relevancia. Se uso una funcion de perdida InfoNCE con temperatura 0.07, mascara de falsos negativos y politica parcial `ignore`. Se emplearon 4 negativos proporcionados por el dataset (familias con score 0) mas negativos intra-batch. El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4, schedule coseno, 15 epocas con validacion cada 3, batch size 4 y precision mixta de 16 bits. El chunk size y stride fueron ambos 512, lo que produce chunks no solapados. La semilla fue 42.

Una innovacion destacable es el uso de una red de guía congelada para generar embeddings de chunks, lo que permite que el encoder cross-chunk se centre exclusivamente en la agregacion. Sin embargo, el resultado principal del paper es que este enfoque de fine-tuning no mejora el rendimiento zero-shot del backbone en la tarea de patentes, degradandolo entre 0.4 y 1.5 puntos nDCG@100.

## Capacidades

- Generacion de embeddings de documentos largos: procesa documentos completos dividiendolos en chunks de 512 tokens y agregandolos en un unico vector L2-normalizado.
- Retrieval documento-a-documento: disenado especificamente para comparar documentos completos mediante similitud coseno (equivalente al producto punto al estar normalizado).
- Soporte de multiples chunks: el encoder REIGN agrega informacion de todos los chunks, capturando relaciones cross-chunk que un modelo de embeddings por chunk no puede ver.
- Sin soporte de tool calling, agentes, generacion de texto, vision ni audio: es un modelo puramente de embeddings (feature extraction).
- Multilingue: no, solo ingles.
- Sin modo de razonamiento explicito: no es un modelo generativo ni de chat.

## Casos de uso

- Retrieval de familias de patentes: el caso de uso original del fine-tuning. Sin embargo, los propios autores desaconsejan usar este checkpoint para ello, ya que el rendimiento es inferior al zero-shot de GTE-base. Si se necesita retrieval de patentes, es preferible usar el backbone sin fine-tuning.
- Busqueda semantica en corpus de documentos legales largos: el modelo puede indexar sentencias, contratos o expedientes completos y recuperar documentos relevantes por similitud coseno. La ventana de 512 tokens por chunk permite manejar textos de decenas de miles de tokens sin truncamiento.
- Sistemas RAG sobre documentacion tecnica extensa: al generar embeddings de documentos completos, se puede construir una base vectorial para recuperacion aumentada por generacion, aunque para consultas cortas el backbone zero-shot puede ser mas adecuado.
- Deduplicacion de documentos: comparar embeddings de documentos para detectar duplicados o versiones casi identicas en grandes repositorios.
- Clustering de documentos por tematica: agrupar documentos largos (informes, papers, patentes) en clusters semanticos usando los embeddings generados.
- Analisis de similitud entre versiones de un mismo documento: util para control de cambios o deteccion de plagio en textos extensos.

## Benchmarks y rendimiento

El modelo card reporta los siguientes resultados de nDCG@100 sobre DAPFAM (top-k=100, corpus FullText completo, self-matches eliminados). Estos valores corresponden al checkpoint exacto segun el Apendice J del paper.

| Split | nDCG@100 |
|---|---|
| test | 31.83 |
| test_in | 36.58 |
| test_out | 4.90 |

El paper concluye que ningun checkpoint del sweep de fine-tuning supera al backbone zero-shot en esta tarea. El fine-tuning con lr 1e-5 degrada el rendimiento entre 0.4 y 1.5 puntos. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el encoder REIGN tiene solo 22,45M de parametros (aproximadamente 90 MB en float32). La red de guia GTE-base (110M) anade unos 440 MB. En total, menos de 1 GB de VRAM para inferencia en batch pequeno.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o similar puede ejecutar el modelo sin problemas. Para batch grandes o despliegue en produccion, una A10 o A100 seria comoda, pero no es necesaria.
- Cabe en consumer GPU: si, en practicamente cualquier GPU moderna.
- Opciones de despliegue: al ser un modelo de embeddings, se puede servir con librerias de inferencia estandar como sentence-transformers, o mediante el codigo oficial del repositorio REIGN. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no se proporcionan datos concretos. Dado el tamano reducido, la inferencia es rapida; el cuello de botella estara en el procesamiento de los chunks por la red de guia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de embeddings de documentos largos en la informacion proporcionada. Como referencia estructural, se puede comparar con:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| REIGN base-l3 (este) | 22,45M (encoder) + 110M (guia) | Multi-chunk (512 por chunk) | Cross-chunk encoder sobre embeddings de chunks | Apache 2.0 |
| thenlper/gte-base (backbone) | 110M | 512 tokens | Embeddings por secuencia | Apache 2.0 |
| BGE-large-en-v1.5 | 326M | 512 tokens | Embeddings por secuencia | MIT |

No se dispone de benchmarks comparativos directos entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Resultado negativo documentado: el fine-tuning en DAPFAM no mejora el rendimiento zero-shot del backbone. Los autores recomiendan no usar este checkpoint para retrieval de patentes; prefieren los checkpoints zero-shot de GoodWiki-Long.
- Solo ingles: no soporta otros idiomas.
- Regimen de operacion limitado: disenado para entradas multi-chunk (documentos largos). Para inputs mas cortos que el chunk size (512 tokens), el encoder cross-chunk no tiene nada que agregar y el modelo no debe usarse; en ese caso es preferible la red de guia sola.
- La red de guia debe cargarse por separado: el checkpoint solo contiene el encoder REIGN. Si se usa sin la red de guia, el modelo no funciona.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo.
- Sesgos: no se han documentado sesgos especificos, pero al entrenarse sobre patentes, puede reflejar sesgos presentes en ese dominio.
- Reproducibilidad: el entrenamiento con precision mixta de 16 bits no es bit-reproducible incluso con la misma semilla; los pesos retreinados no coincidiran exactamente.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset DAPFAM (si se usa para reentrenar) puede tener restricciones adicionales; el dataset `goodwiki_long_synthetic_ir` esta bajo CC BY-SA 4.0.

## Enlaces

- Repositorio de codigo: https://github.com/devrimcavusoglu/reign
- Pagina del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear)
- Modelo en HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_dapfam-ft-c512s512
- Red de guia (GTE-base): https://huggingface.co/thenlper/gte-base
