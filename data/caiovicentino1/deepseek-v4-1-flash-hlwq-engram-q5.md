# caiovicentino1/DeepSeek-V4.1-Flash-HLWQ-Engram-Q5

## Resumen

DeepSeek-V4.1-Flash-HLWQ-Engram-Q5 es una copia cuantizada del modelo DeepSeek-V4.1-Flash publicada por el usuario caiovicentino1. No se trata de un reentrenamiento ni de un ajuste fino: 46 de los 48 shards del repositorio son byte a byte idénticos a la release oficial, y la intervención se limita a las dos tablas hash Engram (`layers.1.engram.embed` y `layers.14.engram.embed`, 384 millones de filas de 256 dimensiones cada una, en conjunto unos 196 000 millones de parámetros). Esas tablas se re-codifican con HLWQ (Hadamard-Lloyd Weight Quantization) a 5 bits por peso, mientras que los tensores `q/k/wkv` de esas mismas capas se conservan en los shards 47 y 48.

El problema que resuelve es de despliegue: en FP8 las dos tablas ocupaban ~203 GB de RAM de host (o NVMe) con los adaptadores de row-store usados en GPUs de estación de trabajo, y el repositorio completo implicaba una descarga de ~510 GB. Con HLWQ Q5 el consumo baja a ~126 GB y la descarga a ~433,5 GB, con un error de reconstrucción de 5,4 % RMSE relativo y coseno medio de 0,99856 frente a las filas FP8 originales.

El modelo resultante mantiene la ventana de contexto de 409 600 tokens del modelo base y el pipeline de servicio SGLang con TP4/EP4, MoE MXFP4 y atención `dsv4`. Es relevante ahora porque permite servir un modelo de ~566 600 millones de parámetros totales en una caja de 4× RTX PRO 6000 (96 GB, SM120) sin NVLink, un perfil de hardware muy inferior al que exige la release oficial en FP8. El repositorio tiene licencia MIT declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MoE (MXFP4 en el servicio) y capas Engram de memoria hash; atención `dsv4`. Detalle completo no disponible |
| Parametros totales | 566 591 466 194 (~566,6 B), segun safetensors del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | 409 600 tokens (configuracion de `serve.sh`) |
| Tipos de cuantizacion | HLWQ Q5 (5 bits por peso) en las dos tablas Engram; FP8 en el checkpoint base; existe repositorio hermano con tablas HLWQ Q4 |
| Idiomas soportados | en, pt (declarados en la model card y en los tags) |
| Licencia | MIT |
| Formato de pesos | safetensors (codigos U8 `[rows, 160]` + normas F16 `[rows, 2]` para las tablas; shards estandar para el resto), mas `hlwq_config_layer{1,14}.json`, adaptador en Python/C++ y `serve.sh` |
| Tamano del repositorio | 433,5 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (relacion: quantized) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El repositorio parte del checkpoint oficial DeepSeek-V4.1-Flash y sustituye unicamente la representacion de las dos tablas Engram. La arquitectura declarada del modelo servido es un transformer con mezcla de expertos (MoE) en MXFP4, atencion `dsv4`, block 5 de DSpark, tensor parallelism 4 y expert parallelism 4, mas un mecanismo Engram que funciona como memoria direccionable por hash: cada capa Engram tiene 384 millones de filas de 256 dimensiones y su `embed` se consulta por lookup, no por producto matricial denso.

La innovacion tecnica esta en el cuantizador, que es determinista y se ejecuta en CPU (aproximadamente 0,2 millones de filas por segundo con 96 hilos), sin datos de calibracion, sin Hessiano y sin gradientes. Cada fila de 256 dimensiones se divide en dos bloques de 128; cada bloque se normaliza por su norma L2 (que se guarda en fp16), se rota con la matriz de Walsh-Hadamard normalizada H128, se escala por raiz de 128 y cada coordenada se mapea al mas cercano de 32 centroides Lloyd-Max para N(0,1), obtenidos con 100 iteraciones de punto fijo de la actualizacion de esperanza condicional. Los codigos de 5 bits se empaquetan de ocho en ocho en grupos little-endian de 40 bits (5 bytes). La decuantizacion es la operacion inversa y cuesta tres operaciones de tensor por lookup: `centroids[codes]`, multiplicacion por H128 y multiplicacion por la norma. Como H es ortogonal e igual a su inversa, no se almacena nada mas.

El resultado por fila pasa de 264 bytes en FP8 (256 bytes fp8 + 8 bytes e8m0) a 164 bytes (160 bytes de codigos de 5 bits + 2 normas fp16). No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) ni el proceso de alineacion.

## Capacidades

- Generacion de texto y razonamiento: la API expone un modo de pensamiento que se activa con `chat_template_kwargs: {"thinking": true}`; en este build esta desactivado por defecto.
- Contexto largo: ventana de 409 600 tokens configurada en el servicio, validada con prompts de recuperacion de aguja en contexto largo (todas las agujas recuperadas segun la model card).
- Recuperacion en contexto largo: el autor reporta que en prosa y en recuperacion con contexto largo la calidad de siguiente token coincide con FP8 hasta el cuarto decimal.
- Codigo: genera codigo con un coste declarado de aproximadamente 0,01 nats por token frente al checkpoint FP8.
- Memoria Engram: acceso por lookup a dos tablas de 384 M filas x 256 dimensiones, servidas desde RAM de host o NVMe.
- Multilingue: ingles y portugues declarados.
- API compatible con OpenAI en el puerto 8000, con nombre de modelo `deepseek-v4.1-flash`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Recuperacion sobre corpus masivos: con 409 600 tokens de contexto y tablas Engram servidas desde RAM de host, el modelo puede indexar y consultar conocimiento factual almacenado en las tablas sin aumentar el coste de atencion, algo util en busquedas documentales de gran volumen.
- Analisis de documentos largos: contratos, expedientes o informes de cientos de miles de tokens caben en una sola ventana, evitando pipelines de chunking y re-ranking.
- Generacion y refactorizacion de codigo en produccion: el modelo mantiene calidad cercana a FP8 en codigo y se puede exponer como endpoint compatible con OpenAI para integrarlo en asistentes de IDE o revisiones automatizadas, asumiendo el coste de ~0,01 nats/token declarado.
- Atencion al cliente en ingles y portugues: despliegue on-premise con API compatible OpenAI para conversaciones multi-turno y contexto largo, sin enviar datos a terceros.
- Investigacion en cuantizacion de pesos: el repositorio incluye `tools/hlwq_engram_quant.py`, `split_hlwq.py` y los scripts de validacion A/B, lo que permite reproducir el error de reconstruccion y experimentar con variantes (por ejemplo el hermano Q4).
- Investigacion en capas de memoria dispersa: al ser las tablas Engram un 35 % de los parametros totales, el modelo es un banco de pruebas util para estudiar el equilibrio entre almacenamiento, ancho de banda de memoria y calidad.
- Despliegue en servidores de 4 GPUs de 96 GB: laboratorios y empresas con una unica caja SM120 o Blackwell pueden servir un modelo de ~566,6 B de parametros totales sin cluster dedicado.
- Generacion de datos sinteticos a gran escala: el throughput con 16 peticiones concurrentes y contexto muy largo permite producir lotes de texto largo para destilacion o evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente publica una validacion comparativa FP8 frente a HLWQ Q5 sobre el mismo servidor y los mismos prompts:

| Metrica | FP8 (oficial) | HLWQ Q5 (este repositorio) |
|---|---|---|
| Bytes por fila (256 dims) | 264 (256 fp8 + 8 e8m0) | 164 (160 bytes de codigos de 5 bits + 2 x fp16 de norma) |
| Ambas capas en disco / RAM | ~203 GB | ~126 GB |
| Descarga total del repositorio | 510 GB | ~433,5 GB |
| RMSE relativo frente a filas FP8 | — | 0,0539 (5,4 %) |
| Coseno medio frente a filas FP8 | — | 0,99856 |
| Coste de lookup (1024 filas, modo RAM) | ~50 µs | ~50 µs + 3 operaciones pequenas de torch |
| Prosa, siguiente token | referencia | coincide hasta el cuarto decimal |
| Recuperacion en contexto largo | referencia | todas las agujas recuperadas |
| Codigo | referencia | ~0,01 nats/token de coste |

## Requisitos de hardware

- VRAM: el repositorio ocupa 433,5 GB en disco, de los cuales ~126 GB corresponden a las tablas Engram HLWQ Q5. En la receta validada esas tablas se sirven desde RAM de host (o NVMe), de modo que quedan del orden de 300 GB de pesos que repartir entre las GPUs.
- GPUs recomendadas: 4x RTX PRO 6000 de 96 GB (SM120), sin NVLink, es la configuracion en la que se genero y valido el repositorio. Las GPUs Blackwell de datacenter (B200/B300) tambien sirven y no necesitan el parche de `patches/`, que solo aplica a SM120.
- RAM de host: 128 GB o mas recomendados para servir las tablas desde memoria; por debajo de ese umbral hay que usar `OFFLOAD_MODE=nvme`.
- GPU de consumo: no cabe. Ni las tablas Engram cuantizadas (~126 GB) ni el conjunto de pesos permiten ejecutar el modelo en una GPU consumer.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:dev-dsv41`), con el adaptador incluido (`adapter/engram_backend_hlwq.py`, `adapter/row_store_hlwq.cpp`, `adapter/sitecustomize.py`) y el lanzador `serve.sh`. La API es compatible con OpenAI en el puerto 8000. No hay GGUF, por lo que llama.cpp y Ollama no son opciones.
- Configuracion de servicio: TP4/EP4, atencion `dsv4`, MoE MXFP4, DSpark block 5, 16 peticiones concurrentes, contexto 409 600.
- Latencia y throughput: el coste de lookup es de ~50 µs para 1024 filas en modo RAM; no se publican cifras de throughput ni de latencia por token en la informacion disponible.
- Parche necesario: en SM120 hay que aplicar `patches/` (fix de prefill, contexto en flashinfer#5095) antes de arrancar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de descarga | Error frente a FP8 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-HLWQ-Engram-Q5 | ~566,6 B | 409 600 | 433,5 GB | 5,4 % RMSE rel., coseno 0,99856 | MIT (declarada) | HuggingFace, 0 descargas |
| DeepSeek-V4.1-Flash-HLWQ-Engram-Q4 (hermano) | ~566,6 B (mismo base) | 409 600 | menor que Q5, valor exacto no disponible | mayor que Q5, valor exacto no disponible | MIT (declarada) | HuggingFace |
| DeepSeek-V4.1-Flash (FP8 oficial) | ~566,6 B | 409 600 (configuracion de referencia) | ~510 GB | referencia | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria, por lo que la comparativa se limita al checkpoint oficial y al repositorio hermano Q4.

## Limitaciones y advertencias

- La cuantizacion introduce un error medible: 5,4 % RMSE relativo y coseno medio 0,99856 frente a las filas FP8, con un coste declarado de ~0,01 nats por token en codigo. En prosa y recuperacion en contexto largo el autor no observa degradacion hasta el cuarto decimal, pero la validacion es acotada y no incluye benchmarks estandar.
- La validacion fue realizada por el autor del repositorio, sin replicacion independiente, con 0 descargas y 0 likes en el momento de redactar esta ficha.
- El repositorio declara licencia MIT, pero es una obra derivada de deepseek-ai/DeepSeek-V4.1-Flash; la licencia y las condiciones de uso comercial del modelo base no se detallan en la informacion disponible y deben verificarse antes de un uso en produccion.
- Requisito de hardware muy restrictivo: 4 GPUs de 96 GB (SM120 o Blackwell de datacenter) y 128 GB o mas de RAM de host, o bien servir las tablas desde NVMe asumiendo mas latencia.
- El modo de razonamiento esta desactivado por defecto en este build y hay que habilitarlo explicitamente por peticion.
- Idiomas declarados: ingles y portugues. No hay informacion sobre el resto de idiomas.
- No hay soporte de GGUF, por lo que no se puede ejecutar en llama.cpp ni Ollama.
- En SM120 es obligatorio aplicar el parche de prefill; arrancar sin el provoca fallos no detallados en la model card.
- Capacidades de tool calling, agentes y modalidades adicionales (vision, audio) no estan documentadas en la informacion proporcionada; no deben asumirse.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de fidelidad factual ni de sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/caiovicentino1/DeepSeek-V4.1-Flash-HLWQ-Engram-Q5
- Repositorio hermano con tablas Q4: https://huggingface.co/caiovicentino1/DeepSeek-V4.1-Flash-HLWQ-Engram-Q4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Receta de servicio en 4x RTX PRO 6000: https://github.com/0xSero/deepseek-v4.1-flash-4x-rtx-pro-6000
- Issue de flashinfer sobre el fix de prefill en SM120: https://github.com/flashinfer-ai/flashinfer/issues/5095
- Identificadores arXiv declarados en los tags del repositorio (contenido no verificado): arxiv:2603.29078, arxiv:2502.02617
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces obtenidos no guardan relacion con el contenido de esta ficha.
