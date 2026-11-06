# arnhemlabs/bge-m3-int8-weightonly

## Resumen

`arnhemlabs/bge-m3-int8-weightonly` es una cuantizacion int8 weight-only en formato ONNX del modelo de embeddings `BAAI/bge-m3`, publicada por arnhemlabs. El modelo base, desarrollado por BAAI (Beijing Academy of Artificial Intelligence), es un embedder multilingue que produce representaciones densas de 1024 dimensiones y que originalmente soporta recuperacion densa, dispersa y multi-vector en un unico modelo. Esta version concreta conserva unicamente la salida densa de 1024 dimensiones.

La relevancia de esta ficha es acotada: no se trata de un modelo generativo ni de un modelo nuevo, sino de un artefacto de despliegue. Su proposito es servir como embedder en proceso dentro del motor de memoria Remanence, cargado desde una revision fijada y verificado por SHA-256. Para terceros, su interes radica en disponer de una version ONNX int8 del conocido BGE-M3 que reduce el peso de los pesos de aproximadamente 2,2 GB en FP32 a unos 1,37 GB, manteniendo activaciones y computo en FP32.

La cuantizacion se realizo con `MatMulNBitsQuantizer` de onnxruntime, con `bits=8`, `block_size=128` y cuantizacion simetrica. El autor declara una paridad de coseno de 0,9998 frente al modelo FP32 sobre su conjunto de validacion. La licencia es MIT, heredada del modelo base. Creado y actualizado el 5 de noviembre de 2026, el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BGE-M3, exportado a ONNX); cuantizacion int8 weight-only sobre las matrices MatMul |
| Parametros totales | no disponible (heredados de BAAI/bge-m3; no declarados en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no declarada en la model card; el autor indica que Remanence limita la entrada a 512 tokens por defecto. La longitud maxima del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | int8 weight-only, `bits=8`, `block_size=128`, `is_symmetric=True`; activaciones y computo en FP32 |
| Idiomas soportados | no disponible en esta ficha (el modelo base BGE-M3 es multilingue, pero esta model card no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data` como datos externos) y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es BAAI/bge-m3 en su revision `5617a9f61b028005a4858fdac845db406aefb181`, exportado a ONNX en FP32 por el autor original (`onnx/model.onnx` y `onnx/model.onnx_data`). Sobre esa exportacion, arnhemlabs aplico `MatMulNBitsQuantizer` de onnxruntime: las matrices MatMul pasan a nodos `MatMulNBits` con pesos de 8 bits, mientras que las activaciones y el computo permanecen en FP32. Los pesos cuantizados se guardan como datos externos en `model.onnx.data`.

El proceso de exportacion esta documentado y es reproducible: script `scripts/export-models.sh` del repositorio Remanence en el commit `767aa23`, invocando `scripts/export-models.py`, con el comando `scripts/export-models.sh ./models-export weight-only bge-m3`. El entorno esta fijado por completo: imagen `python@sha256:e697c81897302a4c4333bade000d98038fbb21eb064f8ee1fd42d02ebcd9d337`, `onnx==1.23.2`, `onnxruntime==1.31.1`, `numpy==2.5.4`, `onnx-ir==1.1.0` y `tokenizers==0.23.3`. Cada fichero de entrada se descarga en la revision fijada y se verifica contra su SHA-256 antes de usarse.

La decision de usar cuantizacion weight-only en lugar de cuantizacion dinamica se justifica de forma explicita: la cuantizacion dinamica hace que la salida para un texto dependa del resto del lote, mientras que la weight-only garantiza que la salida de un texto no dependa de que otros elementos esten en el batch. No se documentan en esta model card detalles sobre el dataset de entrenamiento del modelo base, ni sobre fases de RLHF o DPO, ni sobre tecnicas como atencion lineal o decodificacion especulativa; BGE-M3 es un encoder de embeddings, no un modelo generativo.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones a partir de texto, con pooling CLS y normalizacion L2 aplicados por el consumidor (Remanence toma la primera salida, hace CLS-pooling si tiene forma `[batch, sequence, 1024]` y normaliza L2, replicando el comportamiento de TEI al servir BGE-M3).
- Extraccion de caracteristicas (`feature-extraction`) para busqueda semantica, recuperacion y similitud entre textos.
- Entrada mediante `input_ids` y `attention_mask` en int64 con forma `[batch, sequence]`.
- Independencia del lote: la salida para un texto no depende de que otros textos compartan el batch, propiedad que el autor destaca frente a la cuantizacion dinamica.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es un encoder de embeddings.
- No se documenta soporte de tool calling ni de comportamiento agentico en esta model card.
- Capacidades multilingues: no declaradas en esta ficha; el modelo base BGE-M3 es multilingue, pero esta model card no especifica la lista de idiomas ni su cobertura.

## Casos de uso

- Busqueda semantica en aplicaciones en proceso: el modelo se carga dentro del propio proceso de la aplicacion (formato ONNX, sin servidor aparte) y genera embeddings de 1024 dimensiones que se indexan en una base vectorial. Es adecuado cuando se quiere evitar una dependencia de red y el coste de un servicio de embeddings dedicado.
- Motor de memoria para agentes: es exactamente el uso declarado por el autor, que lo emplea como embedder en proceso del motor Remanence, cargandolo desde una revision fijada y verificando cada fichero por SHA-256. Sirve para recuperar recuerdos o fragmentos previos por similitud semantica.
- Deduplicacion y agrupamiento de documentos: al generar embeddings normalizados, se pueden calcular similitudes de coseno directamente y agrupar o descartar documentos casi duplicados en pipelines de ingesta.
- Recuperacion aumentada (RAG) en despliegues con recursos limitados: la reduccion de pesos de aproximadamente 2,2 GB a 1,37 GB permite alojar el embedder junto al generador en la misma maquina, a costa de mantener el computo en FP32.
- Clasificacion y enrutamiento por similitud: comparar el embedding de una consulta contra embeddings de referencia precalculados para dirigirla a un departamento, una categoria o un flujo de trabajo concreto.
- Verificacion de integridad en despliegues regulados: el repositorio publica los SHA-256 de cada fichero y las versiones exactas de las dependencias, lo que facilita la trazabilidad y la reproducibilidad del artefacto en entornos con requisitos de auditoria.
- Filtrado previo en pipelines de moderacion: calcular similitud contra un conjunto de ejemplos etiquetados para priorizar la revision manual de los casos mas proximos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado por el autor es la paridad frente al modelo FP32: coseno de 0,9998 sobre el conjunto de paridad de Remanence (ADR-016, enmienda 1). No se aportan cifras de MMLU, HumanEval, GSM8K, MTEB ni latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos `model.onnx.data` ocupa 1.370.353.680 bytes (aproximadamente 1,37 GB). Al mantener activaciones y computo en FP32, el consumo total de memoria supera esa cifra y depende de la longitud de secuencia y del tamano de lote; no se publican mediciones.
- GPU recomendadas: no disponibles en la informacion proporcionada. El artefacto es ONNX y puede ejecutarse con onnxruntime, que soporta ejecucion en CPU y en GPU, pero la model card no especifica proveedores de ejecucion ni GPUs validadas.
- Compatibilidad con GPU de consumo: no confirmada. El peso de los pesos (1,37 GB) es compatible en terminos de memoria con GPUs de consumo de 8 GB o mas, pero no hay validacion publicada.
- Opciones de despliegue: onnxruntime (version fijada `1.31.1` en el proceso de exportacion); el autor menciona TEI como referencia del comportamiento de pooling y normalizacion de BGE-M3. No se documentan otras opciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| arnhemlabs/bge-m3-int8-weightonly | no disponible | no declarado; limite de 512 tokens por defecto en Remanence | ONNX int8 weight-only | MIT | Salida densa de 1024 dimensiones; paridad coseno 0,9998 frente a FP32 |
| BAAI/bge-m3 (FP32) | no disponible | no disponible en esta ficha | safetensors y ONNX FP32 | MIT | Modelo base; recuperacion densa, dispersa y multi-vector; mayor peso (aproximadamente 2,2 GB en ONNX FP32) |
| Otros embedders multilingues de la familia BGE | no disponible | no disponible | safetensors, GGUF, ONNX | MIT | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

No se dispone de datos de rendimiento comparado (MTEB u otros) en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y peso del artefacto.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo embeddings. Cualquier expectativa de razonamiento o generacion es incorrecta.
- La model card no declara la lista de idiomas soportados ni la longitud maxima de contexto del modelo base; el autor solo indica que Remanence limita la entrada a 512 tokens por defecto.
- La cuantizacion introduce una desviacion respecto al FP32. El autor reporta coseno de 0,9998 sobre su propio conjunto de paridad, que no es publico; no hay evaluacion independiente de la degradacion en tareas de recuperacion reales.
- El artefacto esta disenado y validado para el motor Remanence. El pooling CLS y la normalizacion L2 los aplica el consumidor, no el grafo ONNX; un consumidor distinto debe replicar ese postprocesado para obtener resultados comparables a TEI.
- `model.onnx` referencia sus pesos como `model.onnx.data`: ambos ficheros deben mantenerse en el mismo directorio. Si se separan, el modelo no carga.
- El tokenizer se distribuye byte a byte desde el modelo base; no se ha adaptado ni ampliado.
- No se documentan sesgos conocidos, tasas de alucinacion (no aplica a un encoder) ni evaluaciones de robustez en esta model card.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte. El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion por terceros.
- Fecha de creacion y actualizacion muy proximas (5 de noviembre de 2026, con un minuto de diferencia), lo que sugiere una publicacion sin ciclo de maduracion ni revision externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arnhemlabs/bge-m3-int8-weightonly
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Revision del modelo base utilizada: `5617a9f61b028005a4858fdac845db406aefb181` (en el repositorio de BAAI/bge-m3)
- Repositorio Remanence (scripts `scripts/export-models.sh` y `scripts/export-models.py`, commit `767aa23`): no se proporciona URL en la informacion disponible
- Referencia ADR-016 y enmienda 1 (conjunto de paridad y verificacion SHA-256): no se proporciona URL en la informacion disponible
- Documentacion de onnxruntime `MatMulNBitsQuantizer`: no se proporciona URL en la informacion disponible
- TEI (Text Embeddings Inference), referencia de pooling y normalizacion: no se proporciona URL en la informacion disponible
