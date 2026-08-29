# devrim/reign-large-l4_gn-gte-large_s384_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un enfoque para escalar la longitud de contexto en modelos de embeddings de documentos. Este checkpoint concreto, `reign-large-l4_gn-gte-large_s384_val-selected`, es un codificador cross-chunk de 4 capas que procesa una secuencia de embeddings de chunks precomputados por una red guía congelada (GTE-large, 335M parámetros) en lugar de tokens. El modelo tiene 52,49 millones de parámetros entrenables y está diseñado para recuperación de documentos largos (document-to-document), donde los documentos exceden la ventana de contexto del modelo base.

Desarrollado por Devrim Cavuşoğlu y Emre Akbaş, el modelo se entrenó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir` (derivado de Wikipedia) con una pérdida de embedding coseno de tres vías. Su relevancia radica en que permite procesar documentos arbitrariamente largos sin necesidad de truncarlos, manteniendo la eficiencia al operar sobre embeddings de chunks en lugar de tokens. El checkpoint fue seleccionado por mejor nDCG@10 en validación y reporta un nDCG@10 de 65,67 en el test de GoodWiki-Long con stride 384.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-chunk (REIGN encoder, 4 capas, d=1024, 16 cabezas, FFN 4096) + red guía GTE-large congelada |
| Parametros totales | 52.486.144 (encoder REIGN) + 335M (GTE-large, congelado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red guía); el encoder procesa secuencias de embeddings de chunks sin límite fijo de número de chunks |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura REIGN: un codificador cross-chunk que recibe como entrada una secuencia de embeddings de chunks, cada uno generado por una red guía congelada (GTE-large) con ventana deslizante de 512 tokens. El encoder REIGN es un transformer de 4 capas con dimensión 1024, 16 cabezas de atención y FFN de 4096, que agrega la secuencia mediante pooling medio. No utiliza señal de posición, por lo que actúa como una función simétrica (permutation-equivariant) sobre el conjunto de chunks.

El entrenamiento se realizó sobre el dataset `devrim/goodwiki_long_synthetic_ir`, con una pérdida de embedding coseno de tres vías (positivo, parcial, negativo) con peso parcial λ=0,5. Se usaron 18 anclas por lote, cada una con 1 positivo, 2 parciales y 17 negativos in-batch (360 pares por paso). El optimizador fue AdamW con lr 1e-5, weight decay 1e-4 y annealing coseno, durante 50 épocas con validación cada 4. La selección del checkpoint se hizo por mejor nDCG@10 en validación. Se usó precisión mixta de 16 bits y semilla 42. Los embeddings de la red guía se precomputaron y cachearon. El hardware de entrenamiento fue una GPU de consumo con 24 GB de VRAM.

## Capacidades

- Generación de embeddings densos de documentos completos a partir de secuencias de chunks, con vectores L2-normalizados (la similitud coseno equivale al producto escalar).
- Recuperación de documentos largos (document-to-document) mediante similitud coseno entre vectores.
- Manejo de documentos de longitud arbitraria sin truncamiento, gracias a la agregación de embeddings de chunks.
- Funciona como una función simétrica sobre el conjunto de chunks, sin depender del orden de los mismos.
- Solo soporta inglés, al estar entrenado sobre datos en ese idioma.
- No apto para inputs cortos (menores a 512 tokens), donde el encoder cross-chunk no tiene nada que agregar; en ese régimen debe usarse la red guía sola.

## Casos de uso

- Búsqueda semántica en corpus de documentos extensos: permite indexar artículos científicos, informes legales o manuales técnicos completos y recuperarlos por similitud temática, sin perder información por truncamiento.
- Sistemas de recuperación aumentada por generación (RAG) sobre documentos largos: se pueden generar embeddings de documentos enteros y usarlos como índice para recuperar pasajes relevantes antes de pasarlos a un LLM generativo.
- Deduplicación de documentos: comparar documentos largos (por ejemplo, patentes o informes) para detectar duplicados o versiones casi idénticas mediante similitud coseno.
- Clasificación de documentos por temática: los embeddings generados pueden alimentar clasificadores supervisados o agrupamiento no supervisado sobre colecciones de documentos largos.
- Recomendación de artículos basada en contenido: en bibliotecas digitales o repositorios, se pueden recomendar documentos similares a uno dado calculando la similitud entre sus embeddings.
- Análisis de similitud entre informes técnicos o normativas: comparar documentos largos de dominios específicos (legal, regulatorio) para identificar solapamientos o divergencias.

## Benchmarks y rendimiento

El único resultado reportado en la model card para este checkpoint exacto es:

| Benchmark | Metrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 65,67 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No hay comparativas con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- El encoder REIGN tiene 52,49M parámetros, lo que en float32 ocupa aproximadamente 210 MB. La red guía GTE-large (335M parámetros) ocupa unos 1,3 GB en float32. En total, la inferencia requiere alrededor de 1,5 GB de VRAM si se cargan ambos en GPU.
- Cabe en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU, aunque la latencia será mayor.
- El entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho más ligera.
- El despliegue se realiza mediante el código del repositorio oficial (`pip install git+https://github.com/devrimcavusoglu/reign.git`), que proporciona la clase `ReignBaselineEncoder`. No hay soporte nativo para vLLM, Ollama o TGI, ya que es un modelo de embeddings, no un LLM generativo.
- La latencia depende del número de chunks: para un documento de 10.000 tokens (unos 20 chunks de 512), el encoder procesa 20 embeddings en una sola pasada, lo que es muy rápido en GPU (del orden de milisegundos). No se dispone de cifras exactas de throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El modelo base GTE-large (thenlper/gte-large) es el punto de partida, pero no se reportan comparaciones de rendimiento entre ambos en la model card. No hay información sobre alternativas como BGE-M3, E5-Mistral u otros modelos de embeddings de documentos largos.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- No es adecuado para inputs cortos (menores a 512 tokens); en ese caso debe usarse la red guía GTE-large directamente, no este checkpoint.
- Requiere cargar la red guía GTE-large por separado y mantenerla congelada; ambos modelos deben estar disponibles en el entorno de inferencia.
- El entrenamiento con precisión mixta de 16 bits no es bit-reproducible, por lo que un reentrenamiento no producirá pesos idénticos; las comparaciones deben hacerse sobre métricas, no sobre pesos.
- El dataset de entrenamiento se distribuye bajo CC BY-SA 4.0, lo que puede implicar restricciones de atribución para usos derivados, aunque el modelo en sí está bajo Apache-2.0.
- Al estar entrenado sobre Wikipedia, puede heredar sesgos presentes en ese corpus (por ejemplo, sesgos de género, geográficos o culturales).
- No se han evaluado riesgos de alucinación porque no es un modelo generativo; su salida son vectores numéricos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-large-l4_gn-gte-large_s384_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of the Association for Computational Linguistics: EMNLP 2026 (to appear).
