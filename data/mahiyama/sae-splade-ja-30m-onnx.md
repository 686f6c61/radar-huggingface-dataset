# mahiyama/sae-splade-ja-30m-onnx

## Resumen

`sae-splade-ja-30m-onnx` es la exportación a ONNX del codificador de consultas (`encode_query`) del modelo japonés de recuperación dispersa aprendida (Learned Sparse Retrieval, LSR) `mahiyama/sae-splade-ja-30m`. Lo desarrolla el usuario independiente mahiyama y está pensado exclusivamente para acelerar la codificación de consultas en CPU, sin incluir la codificación de documentos (`encode_document`). Su función es convertir una consulta en un vector disperso de 65.536 dimensiones del que solo se conservan las 40 dimensiones de mayor valor, representadas como pares de índices y valores.

El modelo forma parte de una arquitectura de dos torres asimétrica: las consultas se codifican con `sae-splade-ja-30m` (un transformer de unos 30 millones de parámetros) y los documentos con `sae-splade-ja-310m`, que proyecta al mismo espacio de 65.536 características. Esta separación permite usar un codificador de consultas muy ligero en el camino crítico de latencia, mientras el codificador de documentos, más pesado, se aplica en indexación por lotes.

La relevancia actual es práctica: el artefacto reduce el coste de codificar una consulta en CPU a unos 2 ms de mediana (frente a los más de 15 ms del codificador de 310 millones), con una pérdida de calidad prácticamente nula en la variante fp32 y de 0,18 puntos de nDCG@10 en la variante INT8. Está etiquetado con `modernbert` y `sparse-autoencoder`, y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado `modernbert`) con pooling SAETopKPooling; exportado como grafo ONNX único (opset 18, dynamo) |
| Parametros totales | no disponible (el modelo base se denomina "30m"; el repo ocupa 0,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; en la evaluación se truncaron consultas a 256 tokens y documentos a 1.024 tokens |
| Tipos de cuantizacion | fp32 (`model.onnx`, 215 MB) e INT8 dinámico solo en las matmuls del transformer (`model_int8.onnx`, 184 MB); la capa de salida (65.536 × 256) permanece en fp32 |
| Idiomas soportados | japonés (`ja`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, `model_int8.onnx`) más `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo base `sae-splade-ja-30m` es un codificador transformer de tipo ModernBERT de aproximadamente 30 millones de parámetros, entrenado para recuperación dispersa aprendida en japonés. La salida se genera mediante una capa de proyección a 65.536 dimensiones seguida de un pooling `SAETopKPooling` que retiene como máximo las 40 dimensiones de mayor valor; el resultado es un vector disperso con como mucho 40 componentes no nulas. La exportación ONNX replica exactamente ese cálculo (`encode_query` hasta el top-40) en un único grafo con ejes de lote y longitud dinámicos.

El modelo está entrenado de forma asimétrica junto con `sae-splade-ja-310m`: las consultas pasan por el codificador de 30M y los documentos por el de 310M, ambos proyectando al mismo espacio de 65.536 características. La model card de esta exportación no detalla el volumen de tokens de entrenamiento, la composición del corpus ni si se emplearon RLHF o DPO; remite a la model card del modelo base para esos datos. La innovación técnica destacable es la cuantización selectiva: al aplicar `quantize_dynamic` de ONNX Runtime también a la capa de salida, el conjunto de las 40 dimensiones top se desviaba del resultado de PyTorch (Jaccard mediano de 0,86), por lo que solo se cuantizó el cuerpo transformer y se mantuvo la salida en fp32.

## Capacidades

- Codificación de consultas en japonés a vectores dispersos de 65.536 dimensiones con un máximo de 40 componentes no nulas.
- Salida estructurada como dos tensores: `indices` (int64, forma [lote, 40]) y `values` (float32, forma [lote, 40]), lista para alimentar un índice invertido.
- Extracción de características para recuperación de información (pipeline `feature-extraction`), no generación de texto.
- Compatibilidad con el espacio de características de `sae-splade-ja-310m`, lo que permite puntuar con producto escalar entre consulta y documento.
- Procesamiento por lotes con longitud variable (ejes dinámicos en el grafo ONNX).
- Ejecución en CPU mediante ONNX Runtime con el proveedor `CPUExecutionProvider`.
- No soporta tool calling, agentes, razonamiento multi paso, visión ni audio.

## Casos de uso

- Motor de búsqueda documental en japonés: se indexan los documentos una vez con `sae-splade-ja-310m` en un índice invertido y se codifican las consultas en tiempo real con esta exportación, obteniendo latencias de ~2 ms por consulta en CPU.
- Búsqueda en aplicaciones de escritorio o Edge sin GPU: al ocupar 184-215 MB y ejecutarse con ONNX Runtime en CPU, cabe en equipos modestos y permite búsqueda local sobre corpus japoneses.
- Primera etapa de un pipeline de recuperación (retrieval) seguida de un re-ranking denso o cross-encoder: el coste bajo permite recuperar cientos de candidatos antes de un modelo más caro.
- Servicio de preguntas y respuestas sobre documentación técnica en japonés: se recuperan pasajes con el scorer disperso y se pasan a un modelo generativo para la respuesta.
- Filtrado y deduplicación de consultas o titulares: la representación top-40 permite comparar consultas entre sí mediante intersección de índices y producto escalar.
- Despliegue en arquitecturas serverless o contenedores con CPU limitada: el binario pequeño y la latencia de milisegundos facilitan el escalado horizontal sin aceleradores.
- Búsqueda dentro de sistemas de atención al cliente o bases de conocimiento internas en japonés, donde la latencia de la consulta es crítica y el corpus es estático.

## Benchmarks y rendimiento

Evaluación sobre las 11 tareas de recuperación de NanoJMTEB-v2 (200 consultas por tarea), con consultas truncadas a 256 tokens, documentos a 1.024 tokens y los 400 primeros componentes del vector de documento de `sae-splade-ja-310m`:

| Codificador de consulta | nDCG@10 medio | Diferencia con PyTorch | Jaccard mediano del top-40 |
|---|---:|---:|---:|
| `sae-splade-ja-30m` (PyTorch, fp32) | 77,43 | — | — |
| `model.onnx` (fp32) | 77,43 | 0,00 | 1,000 |
| `model_int8.onnx` | 77,25 | -0,18 | 0,951 |

Latencia por consulta en CPU (mediana / percentil 90, sin tokenización, Mac mini con Apple M6 y ONNX Runtime 1.31.1, 500 consultas de media 29,7 tokens):

| Codificador | Tamano | 1 hilo | 4 hilos |
|---|---:|---:|---:|
| `model.onnx` | 215 MB | 2,46 / 5,23 ms | 2,20 / 4,36 ms |
| `model_int8.onnx` | 184 MB | 2,27 / 5,08 ms | 1,92 / 4,02 ms |
| `sae-splade-ja-310m` (lado consulta, ONNX fp32) | 1.463 MB | 15,18 / 32,00 ms | 17,19 / 31,58 ms |
| `sae-splade-ja-310m` (lado consulta, cuerpo INT8) | 755 MB | 9,93 / 23,72 ms | 9,43 / 19,38 ms |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo no es generativo y esas métricas no aplican.

## Requisitos de hardware

- VRAM: no requiere GPU; está diseñado para CPU. En memoria RAM, el grafo fp32 ocupa unos 215 MB y el INT8 unos 184 MB, más el overhead de ONNX Runtime.
- GPU recomendadas: no aplica; el proveedor indicado es `CPUExecutionProvider`. Podría ejecutarse con `CUDAExecutionProvider` o `CoreMLExecutionProvider` de ONNX Runtime, pero no se han publicado mediciones.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU; el cuello de botella es la CPU.
- Despliegue: ONNX Runtime (versión verificada 1.31.1), con `hf_hub_download` para obtener los pesos; el codificador de documentos asociado se usa vía `sentence_transformers.SparseEncoder` con `trust_remote_code=True`.
- Latencia y throughput: ~2 ms de mediana por consulta en un solo hilo y ~1,9-2,2 ms con 4 hilos para la variante INT8; percentil 90 en torno a 4-5 ms. El throughput no se publica, pero se deduce del orden de varios cientos de consultas por segundo y núcleo en función de la latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| `mahiyama/sae-splade-ja-30m-onnx` (este) | ~30M (no confirmado) | no disponible | LSR japonés, solo consultas, ONNX | MIT | ~2 ms/consulta en CPU; nDCG@10 77,43 |
| `mahiyama/sae-splade-ja-30m` | ~30M (no confirmado) | no disponible | LSR japonés, PyTorch | MIT | Referencia de calidad; mismo nDCG@10 en CPU fp32 |
| `mahiyama/sae-splade-ja-310m` | ~310M (por nombre) | no disponible | LSR japonés, consultas y documentos | MIT | Codificador de documentos del mismo espacio; lado consulta ~10-17 ms en CPU |
| SPLADE multilingüe / BM25 japonés | no disponible | no disponible | Disperso léxico o neuronal | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de comparaciones con otros modelos LSR japoneses en la información proporcionada; la comparativa se limita a los artefactos de la misma familia.

## Limitaciones y advertencias

- Solo codifica consultas: no incluye `encode_document`; para indexar documentos es obligatorio usar `sae-splade-ja-310m`, y mezclar codificadores de otro espacio de características invalida las puntuaciones.
- Solo japonés: no se ha entrenado ni evaluado para otros idiomas.
- La cuantización INT8 introduce una desviación de 0,18 puntos de nDCG@10 y un Jaccard mediano de 0,951 en el top-40; si se requiere paridad exacta con PyTorch, debe usarse `model.onnx` en fp32.
- Riesgo de sesgo y cobertura: al ser un recuperador léxico-disperso entrenado sobre un corpus no documentado en esta ficha, puede infrarrepresentar vocabulario especializado o variantes ortográficas; la model card remite al modelo base para las notas sobre datos de entrenamiento.
- No es un modelo generativo: no produce texto y, por tanto, no alucina contenido, pero puede recuperar pasajes irrelevantes si la consulta es ambigua.
- En consultas con menos de 40 dimensiones no nulas, la salida rellena con valores 0 cuyos índices no tienen significado; el código consumidor debe filtrar por `values > 0`.
- La licencia MIT se aplica a este artefacto, pero las condiciones sobre los datos de entrenamiento deben consultarse en la model card de `sae-splade-ja-30m` antes de un uso comercial.
- No se documentan límites máximos de longitud de entrada en esta ficha; en la evaluación se truncó a 256 tokens para consultas, lo que sugiere que consultas muy largas pueden degradar la calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahiyama/sae-splade-ja-30m-onnx
- Modelo base (PyTorch): https://huggingface.co/mahiyama/sae-splade-ja-30m
- Codificador de documentos: https://huggingface.co/mahiyama/sae-splade-ja-310m
- Dataset de evaluación NanoJMTEB-v2: https://huggingface.co/datasets/hakari-bench/NanoJMTEB-v2
