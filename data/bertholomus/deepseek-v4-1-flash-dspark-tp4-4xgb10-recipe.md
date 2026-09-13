# bertholomus/DeepSeek-V4.1-Flash-DSpark-TP4-4xGB10-Recipe

## Resumen

Este repositorio no contiene un modelo de pesos, sino una receta de despliegue de produccion: la configuracion medida y versionada por BertholomusAI para servir DeepSeek-V4.1-Flash sobre cuatro nodos NVIDIA DGX Spark (GB10, SM121) con tensor-parallel 4, usando SGLang como motor de inferencia. Se publica como artefacto versionado (v1.1.5, nombre en clave gamma-3) derivado del repositorio lanzador `MiaAI-Lab/DeepSeek-v4.1-Flash-DGX-Sparks` en el commit `e59e6eb`, con cuatro parches propios, de los cuales uno (descubrimiento automatico de HCA InfiniBand activa por nodo) se envio como PR #10 al proyecto original.

El interes practico esta en que documenta una configuracion de produccion real verificada sobre hardware vivo (nodos spark1 a spark4) los dias 11 y 13 de septiembre de 2026, con comparativas A/B frente a la configuracion por defecto. Las desviaciones mas relevantes son la ventana de verificacion especulativa DSPARK reducida de 5 a 3, el pool compartido de KV elevado a 8.000.000 de tokens en FP8, `EP_SIZE` ajustado a 2, y una cache KV engram sobre NVMe de 4 GiB por nodo con 16 vias. El resultado declarado es un incremento de throughput agregado de aproximadamente 2,1x en concurrencia 1 y 2, y 1,85x en concurrencia 4 respecto a la configuracion de stock.

El modelo subyacente, DeepSeek-V4.1-Flash (checkpoint `dba1be0a`, licencia MIT, 48 shards), no se redistribuye aqui: la receta solo describe como servirlo. La ventana de contexto configurada es de 1.048.576 tokens por peticion, con un pool KV compartido de 8 millones de tokens, lo que habilita cargas de trabajo agenticas de contexto muy largo sobre un cluster de cuatro nodos pequenos en lugar de GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card describe la pila de servicio, no la arquitectura del modelo servido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por peticion; pool KV compartido de 8.000.000 de tokens en FP8 |
| Tipos de cuantizacion | KV cache en FP8; ruta de indexer FP4 (`--enable-deepseek-v4-fp4-indexer`); backend GEMM FP8 `flashinfer_cutlass`. Cuantizacion de pesos: no disponible |
| Idiomas soportados | en |
| Licencia | AGPL-3.0-or-later para la receta; el checkpoint del modelo se cita como MIT |
| Formato de pesos | no disponible (checkpoint de 48 shards; formato no especificado en la informacion) |
| Version de la receta | v1.1.5 (gamma-3 + durable fixes) |
| Modelo objetivo | DeepSeek-V4.1-Flash, checkpoint `dba1be0a`, 48 shards |
| Repositorio base | `MiaAI-Lab/DeepSeek-v4.1-Flash-DGX-Sparks` @ `e59e6eb` |
| Motor de inferencia | SGLang `dev-dsv41` (imagen `dsv41-4x-spark:local`) |
| Topologia | 4x NVIDIA DGX Spark (GB10, SM121), TP4, tejido de 2 rails CX7 |
| Endpoint | `http://100.64.0.1:8000/v1`, nombre servido `deepseek-v4.1-flash` |
| Estado declarado | produccion activa en A1-A4 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo DeepSeek-V4.1-Flash ni su proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, uso de RLHF o DPO, ni sobre si se trata de un transformer denso, un MoE o una arquitectura hibrida. Tampoco se publican resultados de evaluacion de calidad del modelo. Todo lo documentado pertenece a la capa de servicio.

Lo que si se detalla es la innovacion de despliegue. La receta emplea decodificacion especulativa DSPARK con una ventana de verificacion gamma+1 ajustada a gamma=3 (frente a 5 en el valor de referencia), alineacion de tokens de verificacion al nivel de grafo (`--speculative-dspark-align-verify-tokens-to-graph-tier`), prefill troceado mixto (`--enable-mixed-chunk`), validacion de propuestas plegadas (`SGLANG_DSPARK_FOLDED_PROPOSAL=1`) y un intervalo de aceptacion en linea de 60 segundos. Ademas implementa una cache KV externa en disco NVMe denominada engram, con 4 GiB por nodo y 16 vias, que alcanza una tasa de acierto agregada del 74 % (82 % en el nodo A1 y 44 % en A4). Se conservan los valores de `MEM_FRACTION_STATIC=0.90`, `MAX_RUNNING_REQUESTS=8` y `CHUNKED_PREFILL_SIZE=4096`.

El parche critico es el descubrimiento por nodo de la HCA InfiniBand activa en `start.sh` (+37/-1 lineas): sin el, el arranque TP4 falla cuando conviven nomenclaturas distintas de interfaz (`mlx5_0`/`mlx5_2` frente a `rocep1s0f0/roceP2p1s0f0`). El resto de parches cubren el paso de variables de entorno DSpark a los contenedores, una guarda de codificacion en el Dockerfile y la comprobacion de pesos en `cmd_status`.

## Capacidades

- Servicio de inferencia en produccion para DeepSeek-V4.1-Flash con 1.048.576 tokens de contexto por peticion y pool KV compartido de 8 millones de tokens.
- Decodificacion especulativa DSPARK con ventana de verificacion de 4 tokens (gamma=3), ajustada por barrido empírico 5 -> 4 -> 3.
- Cache KV engram en NVMe por nodo, con monitorizacion de tasa de acierto.
- Parallelismo tensorial en 4 nodos con descubrimiento automatico de HCA InfiniBand activa por nodo.
- API compatible con OpenAI sobre SGLang en `/v1`, con nombre de modelo servido `deepseek-v4.1-flash`.
- Metricas de motor expuestas (`--enable-metrics`, `--enable-metrics-for-all-schedulers`).
- Prefill troceado mixto y ventana de watchdog de 1800 segundos para peticiones largas.
- Capacidades del propio modelo (tool calling, agentes, vision, audio, multilingue): no disponibles en la informacion proporcionada; la model card solo declara el idioma `en`.

## Casos de uso

- Autoservicio de un LLM de contexto largo en cluster propio: la receta permite levantar un endpoint compatible con la API de OpenAI sobre cuatro DGX Spark, con 1 M de tokens por peticion, evitando depender de proveedores externos para cargas con datos sensibles.
- Agentes de codigo sobre repositorios completos: el pool KV de 8 millones de tokens admite aproximadamente ocho sesiones concurrentes de 1 M de tokens, lo que permite mantener en contexto arboles de codigo grandes entre pasos de un agente.
- Asistente documental de larga duracion: ingestas de contratos, expedientes o corpus tecnicos que caben integros en una sola peticion, sin necesidad de pipelines de recuperacion con fragmentacion.
- Laboratorio de evaluacion de decodificacion especulativa: los scripts `tp4_ab.py` y `agentic_single_stream.py` permiten reproducir comparativas A/B a temperatura 0 sobre linea caliente, utiles para medir el efecto de gamma, el tamano de pool KV o el backend GEMM.
- Banco de pruebas de cache KV en disco: el ajuste de engram (`DSV41_CACHE_GIB`, `DSV41_CACHE_WAYS`) y la medicion de tasa de acierto por nodo sirven para estudiar politicas de retencion de KV en almacenamiento local.
- Referencia de despliegue multi-nodo sobre GB10: la receta documenta fabric CX7 de dos rails, NCCL, reparto de memoria por nodo y limites de RAM del host, replicable como plantilla para otros modelos servidos con SGLang en el mismo hardware.
- Atencion al cliente automatizada de contexto largo: con 1 M de tokens por peticion y 8 peticiones concurrentes, es viable mantener historiales multi-turno extensos y politicas internas completas en el mismo contexto, siempre que la calidad del modelo lo permita.
- Inferencia por lotes con metrica de rendimiento: el endpoint expone metricas de motor y sched ulers, lo que facilita integrar el servicio en un sistema de observabilidad junto a consumidores ya existentes.

## Benchmarks y rendimiento

Los datos disponibles son de rendimiento del sistema de servicio (throughput agregado en tokens por segundo), no de calidad del modelo. Mediciones en linea caliente, temperatura 0, medianas. La propia model card advierte que la linea tiene consumidores de produccion en vivo y que las cifras deben considerarse contendidas.

Comparativa frente a la configuracion de stock del lanzador:

| Concurrencia | Stock de referencia | Esta receta | Delta |
|---|---|---|---|
| 1 | 16,9 tok/s | ~35-38 tok/s | ~2,1x |
| 2 | 28,5 tok/s | 59,5-61,4 tok/s | ~2,1x |
| 4 | 42,6 tok/s | 78,8-79,4 tok/s | ~1,85x |

Comparativa frente a los numeros publicados por el autor del repositorio base (`e59e6eb`, triangulo de 3 nodos), con el mismo contador (`gen throughput` de las lineas `Decode batch`):

| Flujos | Base `e59e6eb` (publicado) | Esta receta (linea en vivo) | Delta |
|---|---|---|---|
| 1 | 37,9 tok/s (TTFT 248 ms) | 46,1 tok/s (mediana) | +22 % |
| 2 | 58,9 tok/s (30,5 por flujo) | 72,0 tok/s (36,0 por flujo) | +22 % |
| 3 | 71,2 tok/s (24,5 por flujo) | 94,2 tok/s (31,4 por flujo) | +32 % |
| 4 | 78,6 tok/s (20,9 por flujo) | 103,2 tok/s (25,8 por flujo) | +31 % |

Metricas adicionales declaradas: tasa de acierto de la cache engram del 74 % agregada (82 % en A1, 44 % en A4). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible.

## Requisitos de hardware

- Cuatro nodos NVIDIA DGX Spark con GB10 (SM121), obligatorio: el modelo se reparte en tensor-parallel 4.
- VRAM exacta por nodo: no disponible. La configuracion fija `MEM_FRACTION_STATIC=0.90` y `HEAD_MEM_FRACTION_STATIC=0.90`.
- No cabe en una GPU de consumo individual; el despliegue objetivo son cuatro GB10, no una RTX 4090 ni una A100/H100.
- Tejido de interconexion de 2 rails CX7; NCCL 2.28.3 incluido en la imagen (`NCCL_HOST_DIR` vacio, no se vendoriza NCCL 2.30.7).
- Almacenamiento local para la cache engram: `DSV41_CACHE_GIB=4` y `DSV41_CACHE_WAYS=16`, con `WORKER_ENGRAM_DIR=$HOME/dsv41-engram`. Un valor de 12 GiB fue rechazado experimentalmente por agotamiento de RAM del host unos 90 segundos despues de iniciar la carga de pesos.
- Limite de peticiones concurrentes en ejecucion: `MAX_RUNNING_REQUESTS=8`; prefill troceado de 4096 tokens; watchdog de 1800 segundos.
- Despliegue mediante SGLang (`dev-dsv41`, imagen `dsv41-4x-spark:local`) sobre Docker, con `start.sh` parcheado. No se documentan rutas alternativas tipo llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput medidos: 46,1 tok/s agregados a un flujo y 103,2 tok/s a cuatro flujos. El dato de TTFT de 248 ms corresponde a la medicion publicada del repositorio base, no a esta receta.

## Comparativa con modelos similares

| Alternativa | Naturaleza | Topologia | Contexto | Throughput a 1/2/3/4 flujos | Licencia |
|---|---|---|---|---|---|
| Esta receta (v1.1.5) | Receta de despliegue BertholomusAI | 4x DGX Spark GB10, TP4 | 1.048.576 tok/peticion; pool KV de 8 M | 46,1 / 72,0 / 94,2 / 103,2 tok/s | AGPL-3.0-or-later |
| `MiaAI-Lab/DeepSeek-v4.1-Flash-DGX-Sparks` @ `e59e6eb` | Repositorio lanzador base | 3 nodos en triangulo | 1.048.576 tok/peticion (configuracion heredada) | 37,9 / 58,9 / 71,2 / 78,6 tok/s | AGPL-3.0-or-later |
| Configuracion de stock del lanzador | Valores por defecto sin desviaciones | 4x DGX Spark GB10, TP4 | pool KV de 750.000 tok | 16,9 / 28,5 / no disponible / 42,6 tok/s (conc. 1/2/4) | AGPL-3.0-or-later |

No se dispone de datos comparativos frente a despliegues de DeepSeek-V4.1-Flash sobre otras plataformas (H100, A100 u otros motores), ni frente a modelos alternativos de tamano similar, porque la informacion proporcionada no incluye parametros del modelo ni resultados de calidad.

## Limitaciones y advertencias

- Licencia AGPL-3.0-or-later, y no por eleccion: la receta deriva de un repositorio lanzador con la misma licencia. Cualquier uso en red que incorpore el codigo puede verse afectado por obligaciones de copyleft; revisar `NOTICE.md` antes de un despliegue comercial.
- El checkpoint del modelo se cita como MIT, pero no se distribuye en este repositorio: hay que obtenerlo por separado.
- Todas las cifras de rendimiento se tomaron en una linea con trafico de produccion real, con `#running-req` entre 3 y 8 y `#queue-req` de 2 durante una supuesta ventana tranquila. La propia model card exige citar el marcador de contencion de `tools/bench-normalized.py` al reproducir numeros de un solo flujo.
- No se publican datos de calidad del modelo: sin MMLU, HumanEval, GSM8K ni evaluaciones equivalentes, no hay base para juzgar sesgos, alucinacion o precision en tareas concretas.
- Solo se declara el idioma `en`; no hay soporte multilingue documentado.
- La receta esta fuertemente acoplada al hardware objetivo (4x DGX Spark GB10, SM121, CX7 de dos rails, TP4). No es portable a otras topologias sin revision.
- Los hosts (`spark1`..`spark4`) y las direcciones (`10.0.0.x`, `100.64.0.1`) son marcadores de posicion: hay que sustituirlos.
- El parche de descubrimiento de HCA es obligatorio; sin el, el arranque TP4 falla con nomenclaturas mixtas de interfaz.
- `DSV41_CACHE_GIB=12` provoco agotamiento de RAM del host unos 90 segundos despues de empezar la carga de pesos; el valor validado es 4.
- El despliegue depende de una version concreta de SGLang (`dev-dsv41`) y de la imagen `dsv41-4x-spark:local`, lo que complica la reproducibilidad a medio plazo.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion externa por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-DSpark-TP4-4xGB10-Recipe
- Repositorio lanzador base citado en la model card: `MiaAI-Lab/DeepSeek-v4.1-Flash-DGX-Sparks` en el commit `e59e6eb` (URL no disponible en la informacion).
- Pull request upstream #10, correspondiente al parche de descubrimiento de HCA (URL no disponible).
- Documentacion interna de la receta citada en la model card: `docs/EVIDENCE.md`, `patches/000NN-*.diff`, `NOTICE.md`, `tools/bench-normalized.py`, `tp4_ab.py`, `agentic_single_stream.py` (rutas relativas dentro del propio repositorio; URL no disponible).
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su autor o DeepSeek-V4.1-Flash.
