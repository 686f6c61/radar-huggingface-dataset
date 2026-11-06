# aidevco/Qwen3.8-Flash-Next-W4A16-g64

## Resumen

Qwen3.8-Flash-Next-W4A16-g64 es una cuantizacion int4 de los expertos enrutados del modelo Qwen3.8-Flash-Next, publicada por el usuario aidevco. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: toma el checkpoint original de Qwen y comprime unicamente las proyecciones `gate_proj`, `up_proj` y `down_proj` de los 512 expertos en cada una de las 48 capas MoE, dejando en bf16 el resto de componentes (shared experts, routers, atencion, torre de vision, embeddings y cabezas de salida). El resultado ocupa 182,6 GB en 131 shards, frente a los 360 GB del original en bf16.

La motivacion concreta es el despliegue en hardware AMD: el autor construyo la cuantizacion para servir el modelo en dos AMD Instinct MI210 (gfx90a, 64 GB cada una) con tensor-parallel de 2. La eleccion de grupo 64 en lugar del 128 habitual responde a una restriccion aritmetica del TP=2: al partir el intermedio de 640 de cada experto en dos mitades de 320, un group size de 128 no divide limpiamente, mientras que 64 si.

El modelo base es un transformer hibrido con atencion gated, capas Gated DeltaNet, un indexador disperso QSA y tablas de embeddings n-gram PLE de aproximadamente 102 GB que se sirven desde memoria de host. Con 180.000 millones de parametros totales y capacidades multimodales image-text-to-text, es relevante para equipos que necesitan ejecutar un MoE grande en infraestructura AMD sin renunciar a la precision del original en las capas sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con Gated DeltaNet, atencion gated, QSA sparse indexer y hyper-connections |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio documentada; capacidad de KV cache de 522.103 tokens a `--gpu-memory-utilization=0.92` |
| Tipos de cuantizacion | W4A16 (int4 simetrico weight-only, group size 64) sobre expertos enrutados; resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors en formato `pack-quantized` de compressed-tensors; 131 shards, 182,6 GB |

## Arquitectura y entrenamiento

El modelo base combina mecanismos de atencion y recurrencia: capas Gated DeltaNet, atencion gated, un indexador disperso QSA y hyper-connections, sobre una columna vertebral MoE con 48 capas y 512 expertos enrutados por capa. Los expertos del checkpoint original se almacenan fusionados (`experts.gate_up_proj`, `experts.down_proj`); el cuantizador los separa en `gate_proj`, `up_proj` y `down_proj` por experto, que es el layout que espera el loader `qwen4_exp` de vLLM, con `gate` como primera mitad de `gate_up_proj`. Ademas de los expertos enrutados, el modelo incorpora shared experts, una torre de vision y tablas de embeddings n-gram PLE de unos 102 GB que se sirven desde memoria de host fijada (pinned).

Esta publicacion no entrena ni ajusta nada: es una cuantizacion data-free (sin conjunto de calibracion) realizada con llm-compressor 0.14.0 (`model_free_ptq`) y compressed-tensors 0.19.0 sobre dos MI210, con kernels eager de PyTorch (`CT_ENFORCE_EAGER=1`) porque el kernel observer de Triton no compila en ROCm. El esquema aplicado es `num_bits=4`, `symmetric=true`, `strategy=group`, `group_size=64`, observer `memoryless-mse`, sin cuantizacion de activaciones. La revision del checkpoint fuente es `de4b8e4d43b917e7706784d8bb445c9af86a3540`. Los detalles de entrenamiento del modelo original (composicion del dataset, numero de tokens, RLHF/DPO) no se recogen en la informacion disponible y remiten a la model card de Qwen.

## Capacidades

- Generacion de texto conversacional multi-turno, con parser de razonamiento `qwen3` para modos de pensamiento.
- Razonamiento matematico y resolucion de problemas aritmeticos y algebraicos.
- Generacion de codigo, con parser de tool calls `qwen3_coder`.
- Tool calling y function calling, verificado en la build con una llamada a `get_weather`.
- Entrada multimodal image-text-to-text segun el pipeline declarado (desactivada en la configuracion de servicio documentada mediante `--limit-mm-per-prompt='{"image":0,"video":0}'`).
- Modo thinking activable y desactivable, con presupuesto de tokens de razonamiento configurable.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo resuelve problemas de algebra y aritmetica con modo thinking; en la sanity check de 50 muestras obtuvo 0,96 en gsm8k y 0,74 en minerva algebra, lo que lo hace adecuado para tutoria o verificacion de calculos en pipelines internos.
- Generacion de codigo en produccion: con 0,90 en humaneval y mbpp (chat) y soporte de tool calling, puede integrarse en asistentes de IDE o revision de parches, teniendo en cuenta que las respuestas vacias por agotar el presupuesto de pensamiento deben reintentarse con mas tokens.
- Agentes multi-paso con herramientas: el parser `qwen3_coder` y el soporte de function calling permiten construir agentes que encadenen llamadas a APIs externas, con la ventana de 32.768 tokens como limite practico por peticion.
- Atencion al cliente automatizada: la capacidad de KV cache de 522.103 tokens permite 15,9 peticiones concurrentes de 32.768 tokens, suficiente para conversaciones multi-turno con historial largo en un solo par de MI210.
- Despliegue soberano en hardware AMD: equipos con Instinct MI210 que no quieren depender de CUDA pueden servir un MoE de 180.000 millones con 35,6 GiB de pesos por tarjeta, dejando el resto del presupuesto de VRAM para KV cache.
- Procesamiento de documentos con imagen y texto: aunque la configuracion documentada desactiva la entrada visual, el pipeline image-text-to-text del modelo base permite, habilitando la torre de vision, extraer y razonar sobre contenido de capturas o escaneos.
- Evaluacion de calidad de cuantizaciones: sirve como referencia para comparar recetas int4 (group 64 frente a group 128) sobre el mismo checkpoint, ya que el autor publica la receta exacta y las comprobaciones post-build.

## Benchmarks y rendimiento

Resultados medidos en 2 x MI210 a TP=2 con vLLM v0.31.0, sobre una build CPU de la misma receta y revision fuente. Las tareas de lm-evaluation-harness usan 50 muestras por tarea con thinking activado.

| Metrica | Resultado |
|---|---|
| gsm8k (50 muestras, thinking on) | 0,96 |
| minerva algebra (50 muestras) | 0,74 |
| humaneval chat (50 muestras) | 0,90 |
| mbpp chat (50 muestras) | 0,90 |
| Pesos en GPU por tarjeta | 35,6 GiB (35,62 GiB en la verificacion) |
| Capacidad de KV cache (`gpu-memory-utilization=0.92`) | 522.103 tokens; 15,9x concurrencia a 32.768 tokens por peticion |
| Throughput, 1.536 prompt / 128 output | 43,2 tok/s a concurrencia 1; 89,7 tok/s a concurrencia 4 |
| Time to first token | 274 ms |

El autor advierte que estas cifras son una comprobacion de que la cuantizacion preserva la calidad, no un benchmark completo. Todas las tareas de codigo falladas fueron respuestas vacias por agotar el presupuesto de 8.192 tokens de pensamiento.

## Requisitos de hardware

- VRAM: aproximadamente 76 GB de pesos en GPU en total, unos 38 GB por tarjeta en TP=2; la medicion real reporta 35,6 GiB por MI210.
- Memoria de host: alrededor de 200 GB recomendados para el servidor, necesarios para mantener las tablas PLE (~102 GB) en memoria fijada mediante `--engram-config='{"cpu_offload": true}'`.
- GPU recomendadas: 2 x AMD Instinct MI210 (gfx90a, 64 GB), que es la configuracion validada. Otras GPU con suficiente VRAM por tarjeta podrian funcionar, pero no estan verificadas en la informacion disponible.
- GPU de consumo: no cabe en tarjetas consumer; los 76 GB de pesos mas la cache KV exceden cualquier GPU domestica actual.
- Despliegue: vLLM (version documentada v0.33.0 con ROCm 10.0 para servir; resultados medidos con v0.31.0), con `CompressedTensorsWNA16MoEMethod`. La cuantizacion se detecta desde la config, por lo que no debe pasarse `--quantization`.
- El pipeline parallelism no esta soportado para esta arquitectura; debe usarse tensor parallelism.
- vLLM v0.31.0 rechaza modelos compressed-tensors en su loader PLE `qwen4_exp`; el stack de servicio del autor incluye un parche `sitecustomize.py` que trata las tablas como no cuantizadas.
- Latencia y throughput: 274 ms de TTFT y 43,2 tok/s a concurrencia 1 en la configuracion medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-W4A16-g64 (esta ficha) | 180.000 M | 32.768 en servicio | int4 W4A16 group 64, resto bf16 | Qwen Community 1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (original) | 180.000 M | no disponible | bf16 | Qwen Community 1.0 | Hugging Face |
| Builds simetricos W4A16 group 128 del mismo modelo | 180.000 M | no disponible | int4 W4A16 group 128 | Qwen Community 1.0 | Referenciados por el autor, sin identificador en la informacion disponible |

La diferencia practica frente al original es el espacio: 182,6 GB frente a 360 GB en bf16, con los expertos a int4. Frente a los builds group 128, la ventaja de esta version es que group 64 divide el intermedio de 320 por experto que resulta de TP=2, lo que permite el despliegue en dos MI210. No se dispone de datos de benchmarks del original ni de los builds group 128 en la informacion proporcionada para comparar calidad.

## Limitaciones y advertencias

- Es una cuantizacion int4 de los expertos: puede haber degradacion de calidad frente al bf16 original, aunque las comprobaciones de 50 muestras no la detectaron. No hay evaluacion completa publicada.
- Los benchmarks son sanity checks de 50 muestras, no resultados representativos; no deben citarse como rendimiento oficial del modelo.
- El modo thinking puede agotar el presupuesto de tokens y devolver respuestas vacias, como ocurrio en tareas de codigo con 8.192 tokens de presupuesto.
- La configuracion de servicio documentada desactiva la entrada de imagen y video (`--limit-mm-per-prompt='{"image":0,"video":0}'`), por lo que las capacidades multimodales no estan validadas en este artefacto.
- Requiere un parche `sitecustomize.py` en el stack de servicio con vLLM v0.31.0; sin el, el loader PLE rechaza el modelo. Esto añade deuda de mantenimiento en produccion.
- No soporta pipeline parallelism; obliga a tensor parallelism, lo que limita las topologias de despliegue.
- Consumo de memoria de host elevado (~200 GB) por las tablas PLE; no es desplegable en nodos con poca RAM.
- Licencia Qwen Community 1.0: es una licencia con condiciones, no OSI; debe revisarse el texto completo antes de uso comercial. La model card indica que el texto integro esta en el repositorio.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de esta build; aplican los del modelo base.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aidevco/Qwen3.8-Flash-Next-W4A16-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: incluida en el repositorio (`LICENSE`)
- llm-compressor: no disponible enlace en la informacion proporcionada
- compressed-tensors: no disponible enlace en la informacion proporcionada
- vLLM: no disponible enlace en la informacion proporcionada
