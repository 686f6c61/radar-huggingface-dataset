# cortexist/gemma-4-E4B-it-qat-exl3-4.0bpw

## Resumen

`cortexist/gemma-4-E4B-it-qat-exl3-4.0bpw` es una conversión experimental al formato EXL3 del checkpoint cuantizado con QAT de Google, `google/gemma-4-E4B-it-qat-q4_0-unquantized`. La conversión la firma el usuario Cortexist y está pensada específicamente para ejecutar inferencia de texto en hardware de borde, en concreto una Jetson Orin Nano 8 GB Super, y también se ha probado en una estación de trabajo con RTX PRO 4500 Blackwell. No es un modelo nuevo: es una recuantización de pesos de un modelo Gemma 4 de la familia E4B (aproximadamente 2.303 millones de parámetros almacenados en safetensors) al formato ExLlamaV3.

El interés del paquete está en el objetivo de cuantización: cuerpo del modelo y tablas de embedding a 4,0 bits por peso, cabeza de salida a 6 bits con vocabulario completo y componente de visión copiado a 16 bits. El fichero resultante ocupa aproximadamente 4,3 GiB dentro de un repositorio de 4,6 GB, y el autor lo distribuye bajo licencia Apache 2.0 del modelo fuente. El soporte confirmado es únicamente generación de texto en inglés (etiqueta `en`).

Es relevante ahora porque aborda un caso muy concreto y poco cubierto: servir un modelo conversacional de la familia Gemma 4 en dispositivos con memoria unificada limitada (8 GB) mediante kernels EXL3 optimizados y streaming de embeddings, algo que no cubren los pesos GGUF convencionales. Ahora bien, el propio autor advierte de que la equivalencia de calidad con el modelo original no está establecida y de que este release no certifica soporte de imagen ni audio, paralelismo de tensores ni calidad de servicio en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E4B; estructura interna no detallada en la informacion proporcionada) |
| Parametros totales | 2.303.501.866 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como limite oficial; el ejemplo de uso del autor fija capacidad de contexto de 4096 tokens (`-cs 4096`) |
| Tipos de cuantizacion | EXL3: cuerpo del modelo 4,0 bits/peso; embeddings de token y por capa 4 bits/peso; cabeza de salida 6 bits/peso (vocabulario completo); vision 16 bits (copiada, no cargada ni validada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (EXL3), biblioteca exllamav3; incluye tokenizer, configuracion y chat template |

Datos adicionales relevantes: calibracion con 32 x 512 tokens del conjunto incluido por el conversor; tamano del repositorio 4,6 GB; fichero del modelo aproximadamente 4,3 GiB; SHA-256 del peso fuente `ad8ef515194b15ab13b6f98d54d37652b691c9a2c787cdf7ed5f951f5ed2c7fa`; SHA-256 del peso convertido `b1685ab35aca62ae1cce488e9fbb005f3a3c372217fc7f40854c358ad80e7994`.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de identificarlo como Gemma 4 E4B IT, es decir, un modelo instruct de la familia Gemma 4 con denominacion E4B. No se detallan en la ficha proporcionada datos como el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni innovaciones de atencion concretas. Lo que si se documenta es el proceso de conversion: se partio del checkpoint QAT ya cuantizado (`q4_0-unquantized`) de Google y se recuantizaron cuerpo, embeddings y cabeza de salida a EXL3 con la herramienta del autor.

La innovacion tecnica del paquete es de infraestructura, no de entrenamiento. Se apoya en un fork de ExLlamaV3 mantenido por Cortexist que anade entradas por capa de la serie E y KV compartida, ademas de soporte de conversion a traves de las APIs habituales de EXL3. El autor incorpora dos recursos de despliegue en Orin: `EXL3_EMBED_STREAM=1`, que hace streaming de filas de embedding para no mantener residentes a la vez las dos tablas grandes, y `EXL3_INT8_GEMV=1`, que activa el modo 1 (feedback de error de activacion) porque el modo 2 por defecto mostraba mayores diferencias numericas entre lote y decodificacion en el estudio inicial.

Hay que subrayar un punto de honestidad tecnica del propio autor: la validacion realizada es numerica, no de calidad de tarea. Se comparo la implementacion E4B con Transformers en FP32 sobre entradas de 64/400 tokens, con RMSE relativo de logits de 0,001615/0,001984 y coincidencia de argmax en los ultimos ocho tokens de 8/8 en ambos casos. Para el checkpoint convertido en Orin, el RMSE relativo logits full frente a cacheado fue de 0,001642/0,001733. La recuantizacion en si introduce un cambio mayor: frente a la referencia FP32 en la estacion de trabajo, RMSE relativo de 0,262/0,243, KL maxima de 1,419/0,415 y coincidencia de argmax de 6/8 y 5/8. La calibracion de 32 x 512 tokens es limitada y la equivalencia de calidad con el original o con un GGUF QAT no esta establecida.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el modelo base es un checkpoint instruct (sufijo IT), orientado a dialogos.
- Inferencia de texto en hardware de borde: validado por el autor en Jetson Orin Nano 8 GB Super y en estacion de trabajo con RTX PRO 4500 Blackwell.
- Contexto configurable mediante capacidad explicita: el ejemplo oficial arranca con `-cs 4096`, sin que se documente un maximo oficial distinto.
- Multilingue: limitado a ingles segun la etiqueta de idioma del repositorio.
- Vision: existe una componente de vision copiada a 16 bits, pero el autor indica expresamente que no se ha cargado ni validado en las pruebas de texto, y que este release no establece soporte de imagen.
- Audio: no disponible; el autor menciona que este release no establece soporte de imagen/audio.
- Tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Compatibilidad de chat: incluye chat template, procesador y tokenizer en el paquete.

## Casos de uso

- Inferencia conversacional en Jetson Orin Nano 8 GB Super: el autor ha probado el modelo en esta placa con `EXL3_EMBED_STREAM=1` para evitar mantener ambas tablas de embedding residentes. Es el escenario principal de diseno del paquete.
- Robots y dispositivos de borde con memoria unificada limitada: un modelo de aproximadamente 2,3 mil millones de parametros cuantizado a 4,0 bits permite sostener un asistente conversacional local sin depender de la nube.
- Prototipado de asistentes de voz con LLM local: aunque el autor aclara que sus medidas son de rendimiento del modelo y no de latencia extremo a extremo de voz, el checkpoint es utilizable como componente de generacion de texto en una pila de asistente.
- Evaluacion de EXL3 frente a GGUF: el repositorio del fork incluye comparativas con GGUF y limites de medicion, por lo que el modelo sirve para comparar ambos formatos en el mismo hardware.
- Experimentacion academica con recuantizacion QAT: el paquete documenta comandos de conversion, hashes y configuracion de cuantizacion, lo que lo hace util para estudiar el impacto de la recuantizacion sobre un modelo ya QAT.
- Despliegue en estacion de trabajo con GPU Blackwell para tareas de generacion de texto en ingles: el autor lo probo en una RTX PRO 4500 Blackwell, con lo que sirve como referencia de reproduccion en escritorio.
- Verificacion de integridad de pesos en pipelines propios: el repositorio incluye `SHA256SUMS` y fichero `conversion.json` con revision de origen, hashes, comando de conversion y modificaciones.
- Integracion en el runtime ExLlamaV3 mediante el fork de Cortexist: cualquier flujo que ya use EXL3 puede cargar el modelo a traves de sus APIs habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo aporta validacion numerica frente a referencias FP32, que se reproduce a continuacion tal cual la publica el autor. No deben interpretarse como benchmarks de calidad de tarea.

| Comparacion | Metrica | Valor |
|---|---|---|
| Implementacion E4B frente a Transformers FP32 (64 tokens) | RMSE relativo de logits | 0,001615 |
| Implementacion E4B frente a Transformers FP32 (400 tokens) | RMSE relativo de logits | 0,001984 |
| Implementacion E4B frente a Transformers FP32 (64 y 400 tokens) | Coincidencia argmax ultimos 8 tokens | 8/8 en ambos |
| Checkpoint convertido en Orin, full frente a cacheado (64 tokens) | RMSE relativo de logits | 0,001642 |
| Checkpoint convertido en Orin, full frente a cacheado (400 tokens) | RMSE relativo de logits | 0,001733 |
| Checkpoint convertido frente a referencia FP32 en estacion (64 tokens) | RMSE relativo de logits | 0,262 |
| Checkpoint convertido frente a referencia FP32 en estacion (400 tokens) | RMSE relativo de logits | 0,243 |
| Checkpoint convertido frente a referencia FP32 en estacion (64 tokens) | KL maxima | 1,419 |
| Checkpoint convertido frente a referencia FP32 en estacion (400 tokens) | KL maxima | 0,415 |
| Checkpoint convertido frente a referencia FP32 en estacion (64 y 400 tokens) | Coincidencia argmax ultimos 8 tokens | 6/8 y 5/8 |

El autor indica que las mediciones de prefill y decode, con hardware, ajustes y limites de comparacion frente a GGUF, estan en el README del fork. Tambien advierte que la repetibilidad y las comprobaciones numericas cacheadas/full son mas estrechas que una evaluacion amplia de calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no se publica una cifra de VRAM como tal. El fichero del modelo ocupa aproximadamente 4,3 GiB y el repositorio 4,6 GB; el autor lo ejecuta con exito en una Jetson Orin Nano 8 GB Super usando capacidad de contexto explicita y streaming de embeddings.
- Memory unificada: en Orin hay que tener en cuenta la memoria de todo el sistema, no solo el peso del modelo. El autor insiste en usar `-cs` con un valor explicito para acotar el consumo.
- GPU validadas por el autor: Jetson Orin Nano 8 GB Super (SM 8.7) y RTX PRO 4500 Blackwell en estacion de trabajo.
- GPU recomendadas adicionales: no disponibles en la informacion proporcionada. No se confirma soporte de otras GPU, y en particular no se certifica una combinacion concreta de PyTorch/CUDA.
- Cabe en GPU de consumo: no confirmado de forma generica. El dato equivalente es que cabe y se ha probado en una plataforma de 8 GB (Orin), lo que sugiere que modelos de 8 GB o mas podrian ser suficientes, pero el autor no lo afirma para tarjetas de consumo.
- Opciones de despliegue: EXL3 a traves de exllamav3, en concreto el fork de Cortexist para soporte de la serie E. El autor proporciona el comando `python examples/chat.py -m MODEL -cs 4096 -mode gemma4` con las variables `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:False`, `EXL3_EMBED_STREAM=1` y `EXL3_INT8_GEMV=1`. Se menciona comparacion con GGUF en el README del fork.
- Compilacion en Orin: hay que construir el fork desde el codigo fuente para SM 8.7 con un PyTorch con CUDA compatible con la instalacion de Jetson; los wheels de escritorio x86 no son binarios validos para Orin.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor remite al README del fork para prefill y decode, y aclara que son mediciones de rendimiento del modelo, no promesas de latencia extremo a extremo de voz.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| cortexist/gemma-4-E4B-it-qat-exl3-4.0bpw | 2.303.501.866 en safetensors | EXL3, cuerpo y embeddings 4,0 bpw, cabeza 6 bpw, vision 16 bits | Capacidad configurable, ejemplo a 4096 tokens | apache-2.0 | Repositorio HuggingFace, runtime EXL3 (fork Cortexist) | Optimizado para Jetson Orin; equivalencia de calidad no establecida |
| google/gemma-4-E4B-it-qat-q4_0-unquantized (modelo base) | no disponible | Checkpoint QAT sin cuantizar | no disponible | apache-2.0 / licencia Gemma 4 | HuggingFace (Google) | Referencia de origen de la conversion; usado como punto de comparacion numerico |
| Variante GGUF QAT del mismo modelo base | no disponible | GGUF (cuantizacion QAT) | no disponible | no disponible | no disponible | Mencionada por el autor como alternativa frente a la que no se ha establecido equivalencia de calidad |

No se dispone de datos de rendimiento comparativo frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La equivalencia de calidad con el modelo original o con un GGUF QAT no esta establecida. El autor lo declara explicitamente.
- La calibracion usada fue de solo 32 x 512 tokens, descrita por el propio autor como limitada; la recuantizacion introduce un cambio numerico considerable (RMSE relativo de hasta 0,262 frente a la referencia FP32).
- La validacion es numerica (logits, KL, argmax) y no una evaluacion amplia de calidad en tareas; no hay benchmarks de MMLU, HumanEval ni similares.
- Solo ingles confirmado. El soporte multilingue no esta documentado.
- La componente de vision esta copiada a 16 bits pero no se cargo ni valido; no hay soporte de imagen confirmado en este release.
- No se ha establecido soporte de audio.
- No se ha establecido soporte de paralelismo de tensores (tensor parallelism).
- No se certifica calidad de servicio en produccion. Se trata de una conversion experimental.
- Los ajustes de ejecucion probados (`EXL3_INT8_GEMV=1`, `EXL3_EMBED_STREAM=1`, `expandable_segments:False`) responden a combinaciones concretas de PyTorch/CUDA y no certifican otras; el autor lo advierte.
- No se ha verificado el soporte de tool calling, agentes o razonamiento multi-paso.
- Licencia: apache-2.0 heredada del modelo fuente, con enlace a la licencia de Gemma 4 de Google. Conviene revisar los terminos de la licencia de Gemma 4 y el `NOTICE` antes de un uso comercial.
- La implementacion EXL3 tiene su propia licencia de repositorio, independiente de la del modelo.
- Riesgo de alucinacion y sesgos: no se aportan datos especificos en la informacion disponible; se remite a la model card del modelo fuente para los usos previstos y las limitaciones del modelo base.
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta, lo que reduce la evidencia de uso por terceros.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/cortexist/gemma-4-E4B-it-qat-exl3-4.0bpw
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Fork de ExLlamaV3 de Cortexist (runtime y mediciones de prefill/decode): https://github.com/cortexist/exllamav3
- Licencia de Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenidos no relacionados (aplicaciones de mensajeria y sus tutoriales de descarga) y se descartan por no ser pertinentes.
