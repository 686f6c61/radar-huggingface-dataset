# mobilint/bge-reranker-v2-m3-ko

## Resumen

bge-reranker-v2-m3-ko es un modelo de reranking (cross-encoder) derivado de dragonkue/bge-reranker-v2-m3-ko, publicado por Mobilint y compilado y optimizado para su hardware NPU `aries-rb`. El modelo puntua pares (consulta, documento) devolviendo la sigmoide del logit de clasificacion, lo que permite reordenar resultados de un recuperador denso o disperso en pipelines RAG y busqueda semantica. Es relevante porque demuestra el despliegue de un reranker de calidad sobre aceleradores NPU dedicados, con cuantizacion de pesos a 8 bits y activaciones a 16 bits.

Arquitectura basada en XLM-RoBERTa (familia bge-reranker-v2-m3), con 264.395.776 parametros totales y ventana de hasta 8.192 tokens por secuencia. Soporta coreano e ingles de forma nativa, incluyendo escenarios cross-linguales coreano-ingles. La licencia es Apache 2.0, lo que facilita su uso comercial.

El modelo no es un checkpoint autonomo de proposito general: requiere el runtime de Mobilint (`transformers-mblt>=0.8.0`), un NPU ARIES (`aries-rb`) y su driver. El encoder esta compilado en `bge-reranker-v2-m3-ko.mxq`; el fichero `model.safetensors` del repo contiene unicamente los pesos de la capa de embeddings del modelo base, sin cambios, y la busqueda de embeddings se ejecuta en el host mientras el encoder y la cabeza de clasificacion corren en la NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (familia bge-reranker-v2-m3), compilado para NPU Mobilint `aries-rb` |
| Parametros totales | 264.395.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.192 tokens por secuencia |
| Tipos de cuantizacion | pesos 8 bits, activaciones 16 bits; cuantizacion post-entrenamiento calibrada; compilador qbcompiler 1.4.1 |
| Idiomas soportados | coreano (ko), ingles (en); calibracion con pasajes en 11 idiomas (ar, de, en, es, fr, it, ja, ko, pt, ru, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (solo embeddings del modelo base), encoder compilado en `bge-reranker-v2-m3-ko.mxq`; libreria transformers con codigo custom (`proxy_xlm_roberta.py`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder derivado de bge-reranker-v2-m3, que a su vez se apoya en la arquitectura XLM-RoBERTa. La tarea es clasificacion de pares (consulta, documento): se concatenan ambos textos, el encoder produce una representacion y la cabeza de clasificacion emite un logit cuya sigmoide se interpreta como puntuacion de relevancia. Este repositorio no entrena el modelo desde cero: parte del checkpoint `dragonkue/bge-reranker-v2-m3-ko` (revision `2aca5884ecac490192af9ebd86836d9073d826cd`) y aplica cuantizacion post-entrenamiento y compilacion para el NPU `aries-rb`. La busqueda de embeddings se delega al host; el encoder y la cabeza de clasificacion se ejecutan en la NPU.

La calibracion de la cuantizacion se realizo sobre 1.072 pares (consulta, pasaje) y 479.663 tokens. La composicion fue: 1.024 pares cortos de hasta 256 tokens (464 pares coincidentes, 280 negativos duros y 280 negativos aleatorios, 64 de ellos cruzando coreano e ingles) y 48 pares largos de 2.048 a 8.192 tokens (24 en coreano, 24 en ingles; 24 coincidentes, 24 negativos duros), que concentran aproximadamente la mitad de los tokens. Las fuentes fueron KLUE-MRC train (29,9%, coreano), SQuAD train (26,9%, ingles), pasajes de FineWeb / FineWeb-2 en 11 idiomas (32,8%), negativos cross-language coreano-ingles (6,0%) y MLDR dev en coreano e ingles (4,5%). No se han publicado detalles sobre RLHF, DPO ni datos de preentrenamiento adicionales en la informacion disponible.

## Capacidades

- Reranking de pares (consulta, documento) mediante puntuacion sigmoide del logit de clasificacion.
- Soporte de secuencias de hasta 8.192 tokens, con procesamiento independiente por secuencia dentro de un batch (sin relleno entre secuencias).
- Modos de ejecucion en NPU: `global8` (por defecto), `global4` y `single`, seleccionables mediante `core_mode=` junto con `target_clusters=` o `target_cores=`.
- Capacidad multilingue nativa para coreano e ingles, con negativos cross-language en la calibracion.
- Uso como segundo etapa en pipelines de recuperacion (retrieval + reranking) sobre embeddings del modelo base.
- Compatibilidad con `transformers` mediante `transformers_mblt.register()` o `trust_remote_code=True`.
- No dispone de generacion de texto, tool calling, agentes ni vision: es un modelo de clasificacion de pares.

## Casos de uso

- RAG sobre documentacion tecnica en coreano e ingles: se recuperan candidatos con un embedder denso y se reordenan con este cross-encoder; su ventana de 8.192 tokens permite puntuar fragmentos largos sin truncar.
- Atencion al cliente automatizada: dado un conjunto de articulos de ayuda, el modelo puntua cual responde mejor a la consulta del usuario; la calibracion incluye pares de QA en coreano (KLUE-MRC) y en ingles (SQuAD).
- Busqueda semantica cross-lingual coreano-ingles: permite que una consulta en coreano recupere pasajes en ingles (y viceversa), aprovechando los negativos cross-language de la calibracion.
- Reranking de documentos largos en recuperacion legal o cientifica: el conjunto largo de evaluacion (MLDR) cubre documentos de 2.048 a 8.192 tokens, con fidelidad medida a cada longitud.
- Filtrado de candidatos en pipelines de moderacion o deduplicacion: la puntuacion de relevancia permite descartar pares con baja similitud semantica antes de etapas costosas.
- Despliegue en edge o entornos con NPU dedicada: al ejecutarse sobre `aries-rb` con latencias de decenas o centenares de milisegundos por secuencia, encaja en servicios con restricciones de consumo energetico o sin GPU disponible.

## Benchmarks y rendimiento

Fidelidad medida en la NPU frente al modelo base en fp32 sobre CPU (la puntuacion fp32 se indica entre corchetes):

| Metrica | Este build |
|---|---|
| Pearson de logits / error absoluto medio frente a fp32 | 0,9984 / 0,097 |
| Spearman frente al orden fp32 (todas las listas / QA) | 0,941 / 0,897 |
| Top-1 igual que fp32 / solapamiento top-3 | 0,972 / 0,948 |
| Pasaje correcto primero, QA [0,970] / multilingue [0,905] | 0,970 / 0,896 |
| nDCG@10 de reranking, Ko-StrategyQA [0,779] / NFCorpus [0,322] / SciFact [0,705] | 0,779 / 0,322 / 0,708 |
| Conjunto largo, 1.024 tokens: top-1 igual que fp32 / documento correcto primero [0,775] | 1,00 / 0,775 |
| Conjunto largo, 2.048 tokens [0,825] | 0,975 / 0,825 |
| Conjunto largo, 4.096 tokens [0,925] | 1,00 / 0,925 |
| Conjunto largo, 6.144 tokens [0,850] | 0,975 / 0,850 |
| Conjunto largo, 8.192 tokens [0,925] | 1,00 / 0,925 |

Tiempo por secuencia en `aries-rb` (segundos) segun longitud 512 / 2.048 / 4.096 / 6.144 / 8.192 tokens:

| Modo | 512 | 2.048 | 4.096 | 6.144 | 8.192 |
|---|---|---|---|---|---|
| `global8` | 0,058 | 0,49 | 1,74 | 3,76 | 6,55 |
| `global4` | 0,093 | 0,95 | 3,44 | 7,45 | 13,0 |
| `single` | 0,31 | 3,18 | 11,7 | 25,6 | 44,8 |

El conjunto corto de evaluacion comprende 1.735 listas de consultas nunca usadas en calibracion (300 de QA, 220 multilingues, 1.215 de retrieval); nDCG@10 reordena el top-10 del embedder fp32. El conjunto largo son 200 listas de 5 documentos del split test de MLDR (coreano e ingles), 40 por longitud de entrada.

## Requisitos de hardware

- NPU Mobilint ARIES (`aries-rb`) con su driver; el modelo no esta pensado para ejecutarse en GPU de proposito general.
- Runtime `transformers-mblt>=0.8.0` (instala `mobilint-qb-runtime`; probado con qbruntime 1.5.3).
- Tamano del repositorio: 1,9 GB.
- La busqueda de embeddings se ejecuta en el host; el encoder y la cabeza de clasificacion en la NPU.
- Modos de core: `global8` (por defecto), `global4` y `single`; el modo elegido determina el throughput (ver tabla de latencias).
- Timeout por defecto de qbruntime: 10 segundos por llamada (`Model_NotAlive`). Para entradas largas en `global4` (mas de unos 6.000 tokens) o `single` (mas de unos 2.000 tokens) hay que ajustar `QBRUNTIME_NPU_TIMEOUT_MS` (por ejemplo, `60000`) antes de cargar el modelo.
- Despliegue mediante `transformers` con codigo custom; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| mobilint/bge-reranker-v2-m3-ko (este) | 264.395.776 | 8.192 tokens | Apache 2.0 | NPU `aries-rb` | Cuantizado 8 bits pesos / 16 bits activaciones; fidelidad a fp32 documentada |
| dragonkue/bge-reranker-v2-m3-ko (base) | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | CPU/GPU (fp32) | Modelo de referencia; este build mantiene sus embeddings sin cambios |
| Otros rerankers de la familia bge-reranker-v2-m3 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | No se aportan datos comparativos en la informacion disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de hardware Mobilint: requiere un NPU ARIES (`aries-rb`) y el driver correspondiente; no funciona en GPU o CPU convencionales con este repositorio.
- El fichero `model.safetensors` del repo solo contiene los embeddings del modelo base; el encoder esta compilado en `.mxq`, por lo que no es un checkpoint portable a otros runtimes.
- El timeout por defecto de 10 segundos puede interrumpir inferencias con entradas largas en modos `global4` o `single`; es necesario configurar `QBRUNTIME_NPU_TIMEOUT_MS`.
- La cuantizacion introduce desviaciones frente a fp32: Pearson de logits 0,9984 y error absoluto medio 0,097; el Spearman baja a 0,897 en QA por intercambio de candidatos con puntuaciones casi identicas.
- Cobertura linguistica limitada a coreano e ingles en la evaluacion; aunque la calibracion incluye pasajes en 11 idiomas, no se documenta rendimiento en el resto.
- No es un modelo generativo: no soporta tool calling, agentes, vision ni audio.
- Riesgo de sesgos y alucinacion heredado del modelo base y de los datos de calibracion (KLUE-MRC, SQuAD, FineWeb, MLDR); no se documentan evaluaciones de sesgo.
- Uso comercial permitido por la licencia Apache 2.0, tanto del modelo base como de este derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilint/bge-reranker-v2-m3-ko
- Modelo base: https://huggingface.co/dragonkue/bge-reranker-v2-m3-ko
- Web de Mobilint: https://mobilint.com
- Dataset KLUE: https://huggingface.co/datasets/klue/klue
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
