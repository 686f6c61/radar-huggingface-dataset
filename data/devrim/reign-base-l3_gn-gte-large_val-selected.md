# devrim/reign-base-l3_gn-gte-large_val-selected

## Resumen

REIGN `base-l3` es un codificador cruzado de chunks (cross-chunk encoder) para recuperación de documentos largos, desarrollado por Devrim Cavusoglu. En lugar de procesar tokens directamente, lee una secuencia de embeddings de chunks precomputados por una red guía congelada (GTE-large, 335M parámetros) y los agrega mediante una función de pooling media. El modelo resultante es un bi-encoder ligero (22,45M parámetros entrenables) que opera sobre representaciones de chunks, lo que reduce drásticamente la latencia de inferencia cuando los embeddings están cacheados.

El modelo está entrenado sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir` con una pérdida coseno de tres vías (positiva, parcial, negativa) y alcanza resultados competitivos en benchmarks de recuperación de documentos largos como GoodWiki-Long, LoCo y DAPFAM. Su relevancia actual radica en ofrecer una alternativa eficiente a los modelos de embeddings de contexto largo, con un coste de inferencia 229 veces menor que re-ejecutar la red guía cuando se usan cachés de embeddings.

La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo está disponible en formato safetensors (float32). Está diseñado exclusivamente para entradas multi-chunk (documentos largos); no es adecuado para consultas o textos cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 3 capas (d=768, 12 cabezas, FFN 3072) sobre embeddings de chunks; red guía congelada GTE-large (335M) |
| Parametros totales | 357M (22,45M entrenables del encoder REIGN + 335M de la red guía congelada) |
| Parametros activos | 22,45M (solo el encoder REIGN; la red guía no se actualiza) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red guía); secuencia de chunks variable según memoria |
| Tipos de cuantizacion | No disponible (solo float32 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN `base-l3` es un codificador cruzado de chunks que opera sobre una secuencia de embeddings de chunks generados por una red guía congelada (GTE-large). Cada chunk de 512 tokens se convierte en un embedding mediante la red guía, y el encoder REIGN (3 capas, 768 dimensiones, 12 cabezas) procesa la secuencia de embeddings con pooling media. No se utiliza señal de posición, por lo que el encoder es una función permutacionalmente equivariante sobre el conjunto de chunks.

El entrenamiento se realizó sobre el dataset `devrim/goodwiki_long_synthetic_ir` con una pérdida coseno de tres vías (graded targets s ∈ {1, 0, −1}) con peso parcial λ = 0.5. Se usó AdamW (lr 1e-5, weight decay 1e-4), 50 épocas con validación cada 4, precisión mixta de 16 bits y selección del checkpoint por mejor nDCG@10 en validación. Los embeddings de la red guía se precomputaron y cachearon durante el entrenamiento. El hardware fue una GPU de consumo de 24 GB.

La innovación clave es que el modelo no procesa tokens directamente, sino representaciones de chunks ya calculadas, lo que permite manejar documentos arbitrariamente largos con un coste de inferencia mínimo cuando los embeddings están cacheados (0,5 ms por consulta frente a 118 ms sin caché).

## Capacidades

- Generación de embeddings densos para documentos largos (document-to-document retrieval).
- Recuperación semántica multi-chunk: agrega información de múltiples chunks de un documento en un único vector.
- Funcionamiento zero-shot en benchmarks de recuperación de documentos largos (LoCo, DAPFAM).
- Inferencia eficiente con caché de embeddings: 0,5 ms por consulta en GPU de consumo.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No es adecuado para entradas de un solo chunk (textos cortos); en ese régimen debe usarse la red guía directamente.

## Casos de uso

- Búsqueda semántica en corpus de documentos extensos (informes, artículos científicos, expedientes legales): el modelo genera embeddings de documentos completos divididos en chunks, permitiendo recuperar documentos relevantes por similitud coseno.
- Sistemas RAG con documentos largos: se pueden precalcular los embeddings de chunks de una base documental y usar REIGN para agregarlos en una representación única del documento, reduciendo la latencia de indexación y consulta.
- Deduplicación de documentos: comparar embeddings de documentos largos para detectar duplicados o versiones similares en grandes repositorios.
- Clustering temático de documentos extensos: agrupar por similitud semántica usando los embeddings generados, útil para organización de bibliotecas digitales.
- Recuperación de pasajes dentro de documentos largos: aunque el modelo agrega chunks, se puede usar para identificar qué chunks son más relevantes a una consulta mediante la similitud de los embeddings de chunks individuales.
- Evaluación de similitud entre documentos en entornos legales o de cumplimiento: comparar contratos o políticas extensas para identificar diferencias o coincidencias.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para este checkpoint exacto (valores del paper, no re-derivados):

| Benchmark | Métrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | mejor stride | 66,73 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s384 | 70,77 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s512 | 70,49 |
| DAPFAM test (zero-shot) | nDCG@100 | s384 | 33,06 |
| DAPFAM test (zero-shot) | nDCG@100 | s512 | 33,10 |

En DAPFAM, el modelo es estadísticamente indistinguible de Jina-Embeddings-v3 (+0,12, p = 0,86) y Stella-en-1.5B-v5 (+0,09, p = 0,92) bajo pruebas pareadas con corrección Holm, mientras supera a BM25 (+7,48) y TF-IDF (+3,03) con p < 0,001.

Coste de inferencia medido (paper, Tabla 11): con caché fría (re-ejecutando la red guía) 118,2 ms/query y 1,73 GB pico; con caché de embeddings 0,5 ms/query y 1,45 GB pico. La latencia cacheada es 229,4 veces menor que re-ejecutar la red guía.

## Requisitos de hardware

- VRAM estimada: 1,45 GB con caché de embeddings, 1,73 GB sin caché (según mediciones del paper en GPU de 24 GB).
- GPU recomendada: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, etc.). El entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho más ligera.
- No requiere GPU de datacenter; cabe en GPUs consumer modernas.
- Despliegue: mediante la librería `reign` (instalable desde GitHub). No se menciona soporte para vLLM, Ollama, TGI ni llama.cpp; el modelo se usa a través de la API de Python de la librería.
- Latencia: 0,5 ms por consulta con caché de embeddings; 118 ms sin caché (en GPU de 24 GB, batch 8).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@100 DAPFAM (zero-shot) | Licencia |
|---|---|---|---|---|
| REIGN base-l3 (este) | 22,45M (encoder) + 335M (guía) | 512 tokens/chunk, multi-chunk | 33,10 (s512) | Apache 2.0 |
| Jina-Embeddings-v3 | No disponible | No disponible | 32,98 (diferencia +0,12, p=0,86) | No disponible |
| Stella-en-1.5B-v5 | No disponible | No disponible | 33,01 (diferencia +0,09, p=0,92) | No disponible |
| BM25 (baseline) | — | — | 25,62 (diferencia +7,48) | — |

No se dispone de datos completos de parámetros, contexto o licencia de los modelos comparados en la información proporcionada. La comparación se limita al benchmark DAPFAM reportado en el paper.

## Limitaciones y advertencias

- No apto para entradas de un solo chunk (textos cortos): el modelo está diseñado para documentos multi-chunk; para textos cortos debe usarse la red guía (GTE-large) directamente.
- Solo soporta inglés (etiqueta `en` en HuggingFace).
- No genera texto ni realiza tareas de razonamiento; es exclusivamente un extractor de características (embeddings).
- Depende de la red guía congelada (GTE-large) para producir los embeddings de chunks; ambos componentes deben cargarse juntos.
- El entrenamiento con precisión mixta no es bit-reproducible; un reentrenamiento no producirá pesos idénticos.
- No se han publicado resultados de benchmarks adicionales más allá de los reportados en la model card (GoodWiki-Long, LoCo, DAPFAM).
- No se dispone de información sobre sesgos o riesgos de alucinación, al ser un modelo de embeddings y no generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-large_val-selected
- Código (repositorio GitHub): https://github.com/devrimcavusoglu/reign.git
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Red guía (GTE-large): https://huggingface.co/thenlper/gte-large
