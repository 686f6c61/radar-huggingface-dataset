# caiovicentino1/DeepSeek-V4.1-Flash-HLWQ-Engram-Q4

## Resumen

DeepSeek-V4.1-Flash-HLWQ-Engram-Q4 es una copia cuantizada y lista para servir del checkpoint oficial DeepSeek-V4.1-Flash, publicada por el usuario caiovicentino1. El cambio respecto al original es quirúrgico: las dos tablas hash Engram del modelo (`layers.1.engram.embed` y `layers.14.engram.embed`, 384 millones de filas × 256 dimensiones cada una, unos 196 000 millones de parametros) se recodifican con HLWQ (Hadamard-Lloyd Weight Quantization) a 4 bits por peso. Los otros 46 shards son identicos byte a byte al release oficial.

El problema que resuelve es de infraestructura, no de calidad: las tablas en FP8 ocupan unos 203 GB de RAM de host cuando se sirven con los adaptadores de row-store habituales, lo que obliga a NVMe o a maquinas muy grandes. Con HLWQ Q4 ese consumo baja a unos 101 GB y la descarga pasa de 510 GB a 408,9 GB, con un error de reconstruccion de 9,7 % RMSE relativo y coseno medio 0,99536 frente a las filas FP8.

Es relevante porque permite autoalojar un MoE de 566 591 466 194 parametros totales en 4× RTX PRO 6000 (96 GB, SM120, sin NVLink) con al menos 128 GB de RAM de host, usando SGLang. La model card reporta degradacion de calidad practicamente nula en prosa, de unos 0,015 nats/token en codigo y de unos 0,04 nats/token en recuperacion de contexto largo, manteniendo todas las "needles" recuperadas. El repositorio declara licencia MIT y tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre arquitectura `deepseek_v41` con dos tablas hash Engram (lookup de filas de 256 dimensiones); en servido se usa atencion `dsv4`, MoE MXFP4 y DSpark block 5 |
| Parametros totales | 566.591.466.194 (~566,6 mil millones), de los cuales ~196 000 millones corresponden a las dos tablas Engram |
| Parametros activos | no disponible |
| Longitud de contexto | 409.600 tokens en la configuracion de servido validada por el autor; el contexto nativo del modelo base no se detalla |
| Tipos de cuantizacion | HLWQ a 4 bits en las tablas Engram (128 nibbles + 2 normas fp16 por fila); el resto de pesos proviene del release oficial en FP8/MXFP4; existe un repo hermano a 5 bits (HLWQ Q5) |
| Idiomas soportados | en, pt (declarados en el repositorio) |
| Licencia | MIT (repositorio); el repo incluye el LICENSE del release oficial de DeepSeek, cuya licencia propia conviene verificar |
| Formato de pesos | safetensors (48 shards `model-*.safetensors` + 4 shards `engram_hlwq_q4_layer{1,14}-*.safetensors`), con `config.json`, tokenizer y `hlwq_config_layer{1,14}.json` |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo en este repositorio: es una recodificacion de pesos del checkpoint oficial DeepSeek-V4.1-Flash. La arquitectura subyacente es la `deepseek_v41` del modelo base, un MoE que en el despliegue de referencia se ejecuta con atencion `dsv4`, capa MoE en MXFP4 y decodificacion DSpark con block 5, en configuracion TP4/EP4 sobre 4 GPUs. La particularidad estructural son las dos tablas Engram, memorias hash de 384 millones de filas por 256 dimensiones alojadas en las capas 1 y 14, que actuan como almacen de patrones consultado por indice.

La innovacion de este repo es el esquema de cuantizacion HLWQ. Cada fila de 256 dimensiones se parte en dos bloques de 128; cada bloque se normaliza por su norma L2 (guardada en fp16), se rota con la matriz de Walsh-Hadamard normalizada H128, se escala por raiz de 128 y cada coordenada se mapea al centroide mas cercano entre 16 centroides de Lloyd-Max para N(0,1), obtenidos con 100 iteraciones de punto fijo sobre la actualizacion de esperanza condicional. Los codigos de 4 bits se empaquetan dos por byte (nibble bajo = indice par). La decuantizacion es la operacion inversa y cuesta tres operaciones tensoriales por lookup: `centroids[codes]`, multiplicacion por H128 y multiplicacion por la norma. Como H es ortogonal e igual a su inversa, no se almacena nada adicional. El cuantizador es determinista, no usa datos de calibracion, Hessiano ni gradientes, y corre en CPU a unas 0,2 millones de filas por segundo con 96 hilos. No se documentan en la informacion disponible los datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto en ingles y portugues, con calidad en prosa equivalente al checkpoint FP8 segun la validacion del autor.
- Modo de razonamiento activable mediante `chat_template_kwargs: {"thinking": true}` en la API compatible con OpenAI; en este build viene desactivado por defecto.
- Recuperacion de informacion en contextos largos: la tabla de validacion indica que todas las needles siguen recuperandose tras la cuantizacion, con un coste de ~0,04 nats/token.
- Generacion de codigo, con una degradacion medida de ~0,015 nats/token frente a FP8.
- Servido de las tablas Engram desde RAM de host o desde NVMe mediante un row store basado en `cudaLaunchHostFunc`; el adaptador autodetecta `hlwq_config_layer1.json` y hace fallback al row store FP8 de 0xSero si se usa el checkpoint oficial.
- Integracion mediante API compatible con OpenAI en el puerto 8000 bajo el nombre `deepseek-v4.1-flash`, servida con SGLang.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues mas alla de ingles y portugues: no disponible.

## Casos de uso

- Autoalojamiento de un MoE de ~566,6 mil millones de parametros en una estacion de trabajo: con 4× RTX PRO 6000 (96 GB, SM120, sin NVLink) y 128 GB de RAM de host, el repositorio permite levantar el modelo completo reduciendo el consumo de las tablas Engram de ~203 GB a ~101 GB.
- Sustitucion directa del checkpoint oficial en una infraestructura SGLang ya existente: al mantener los 46 shards identicos y reutilizar el adapter con deteccion automatica, el cambio se limita a apuntar `DSV41_SOURCE` al nuevo directorio, sin tocar el codigo de hashing, gating, `wkv` ni el all-reduce de TP.
- Recuperacion aumentada sobre corpus largos en ingles o portugues: con 409.600 tokens de contexto validados y recuperacion de needles preservada, es adecuado para RAG sobre documentacion extensa, expedientes o bases de conocimiento donde las respuestas dependen de fragmentos dispersos.
- Asistente de programacion en produccion: la degradacion medida en codigo es de solo ~0,015 nats/token, por lo que puede usarse para autocompletado, revision de parches o generacion de tests en flujos integrados mediante la API compatible con OpenAI.
- Despliegue en maquinas con poca RAM mediante NVMe: con `OFFLOAD_MODE=nvme`, el mismo repositorio funciona en equipos por debajo de 128 GB de RAM de host, a costa de latencia en los lookups de las tablas.
- Investigacion en cuantizacion de pesos: los scripts `tools/hlwq_engram_quant.py`, `tools/split_hlwq.py` y las utilidades de validacion `tools/ab_tf2.py` y `tools/ab_engram.py` permiten reproducir el cuantizador determinista y repetir la comparacion A/B frente a FP8 con las mismas prompts.
- Comparacion controlada de presupuestos de bits: el repo hermano a 5 bits permite medir el compromiso entre 101 GB y ~126 GB de tablas (25 GB adicionales) frente a la reduccion de error de reconstruccion, util para decidir el punto de operacion.
- Validacion previa a produccion de un modelo grande en hardware no datacenter: sirve como banco de pruebas economico antes de mover la carga a B200/B300, que no necesitan los parches de SM120.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Los unicos datos cuantitativos son los de la validacion de la cuantizacion, comparando el checkpoint oficial FP8 con este repo en el mismo servidor y con las mismas prompts:

| Metrica | FP8 (oficial) | HLWQ Q4 (este repo) |
|---|---|---|
| Bytes por fila (256 dimensiones) | 264 (256 fp8 + 8 e8m0) | 132 (128 nibbles empaquetados + 2 normas fp16) |
| Tablas en disco / RAM | ~203 GB | ~101 GB |
| Descarga total del repositorio | ~510 GB | ~408,9 GB |
| RMSE relativo frente a filas FP8 | — | 0,0967 (9,7 %) |
| Coseno medio frente a filas FP8 | — | 0,99536 |
| Coste de lookup (1024 filas, modo RAM) | ~50 µs | ~50 µs + 3 operaciones pequenas de torch |
| Calidad en prosa | referencia | equivalente a FP8 |
| Calidad en codigo | referencia | ~0,015 nats/token de coste |
| Recuperacion en contexto largo | referencia | ~0,04 nats/token de coste, todas las needles recuperadas |

La seccion de validacion de la model card aparece truncada en la informacion proporcionada, por lo que los detalles finales de esa tabla (condiciones exactas de medida y prompts) no estan disponibles. Tampoco se publican cifras de throughput ni de latencia end-to-end mas alla del coste de lookup.

## Requisitos de hardware

- GPUs de referencia: 4× RTX PRO 6000 (96 GB, SM120) sin NVLink, o cualquier configuracion de 4× 96 GB en SM120. Las GPUs de datacenter Blackwell (B200/B300) no necesitan los parches de `patches/`.
- RAM de host: al menos 128 GB para servir las tablas Engram desde RAM; por debajo de esa cifra hay que activar `OFFLOAD_MODE=nvme`.
- Almacenamiento: 408,9 GB para el repositorio completo; el repo hermano Q5 anade unos 25 GB.
- Reparto de pesos: TP4/EP4 con atencion `dsv4`, MoE MXFP4, DSpark block 5 y 16 peticiones concurrentes como configuracion validada.
- Despliegue: SGLang sobre la imagen Docker `lmsysorg/sglang:dev-dsv41`, con `serve.sh` como lanzador de un solo comando. El script se apoya en `PYTHONPATH=/model/adapter` (row store Engram + decuantizacion HLWQ) y en `DSV41_SOURCE`. Cada parametro es una variable de entorno documentada en la cabecera del script.
- Parches: `patches/` incluye el arreglo de prefill para SM120, con contexto en el issue flashinfer#5095.
- VRAM estimada por GPU: no disponible de forma desglosada; el requisito declarado es 4 GPUs de 96 GB.
- Soporte en GPU de consumo: no disponible; el minimo documentado son 4× 96 GB, muy por encima de cualquier GPU consumer.
- Otros runners (llama.cpp, Ollama, TGI, vLLM): no disponible; el repositorio solo documenta SGLang y no publica pesos GGUF.
- Latencia y throughput: no disponibles; el unico dato de rendimiento es el coste de lookup de las tablas (~50 µs para 1024 filas en modo RAM, mas tres operaciones tensoriales).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Tablas Engram | Descarga | Licencia | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-HLWQ-Engram-Q4 (este repo) | 566.591.466.194 | 409.600 tokens en la config validada | ~101 GB en RAM, 4 bits HLWQ, RMSE relativo 0,0967 | 408,9 GB | MIT (repositorio) | Compromiso equilibrado; degradacion de ~0,015 nats/token en codigo |
| DeepSeek-V4.1-Flash-HLWQ-Engram-Q5 (repo hermano) | mismo modelo base | misma config | ~126 GB en RAM (25 GB mas), 5 bits, mitad de error de reconstruccion | ~434 GB | MIT (repositorio) | Mejor fidelidad a cambio de mas disco y RAM |
| DeepSeek-V4.1-Flash (release oficial) | mismo modelo base | misma config | ~203 GB en RAM en FP8 | ~510 GB | la del modelo base (el repo incluye su LICENSE) | Referencia de calidad; requiere mas RAM o NVMe |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria, por lo que la comparacion se limita a estos tres artefactos derivados del mismo checkpoint.

## Limitaciones y advertencias

- Solo se declaran los idiomas ingles y portugues; el comportamiento en castellano u otros idiomas no esta documentado.
- La cuantizacion introduce una perdida medible: 0,0967 de RMSE relativo y coseno medio 0,99536 frente a las filas FP8, con ~0,015 nats/token de coste en codigo y ~0,04 nats/token en recuperacion de contexto largo.
- El cuantizador es determinista y no usa calibracion; al no adaptarse al dominio, el error puede comportarse de forma distinta en distribuciones alejadas de las medidas en la validacion.
- Los requisitos de hardware son muy altos: 4 GPUs de 96 GB y 128 GB de RAM de host en el escenario recomendado, con NVMe como alternativa con penalizacion de latencia.
- Las GPUs SM120 requieren aplicar los parches de prefill incluidos; sin ellos el despliegue no esta soportado segun la documentacion del repo.
- El modo de razonamiento (`thinking`) viene desactivado por defecto en este build, lo que puede degradar tareas que dependan de cadena de pensamiento si no se activa explicitamente.
- Riesgo de alucinacion y sesgos: heredados del modelo base y no cuantificados en la informacion disponible.
- Licencia: el repositorio se declara MIT e incluye el LICENSE del release oficial, pero DeepSeek-V4.1-Flash puede tener terminos propios; conviene verificar la licencia del modelo base antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, fue creado el 2026-09-10 y su validacion es la del propio autor, no una evaluacion independiente.
- El JSON de configuracion (`hlwq_config_layer{1,14}.json`) incluye la lista de particiones con rangos de filas; unir mal las dos partes de cada tabla invalida los pesos.
- El repo hermano Q5 se referencia repetidamente como alternativa con la mitad de error; elegir Q4 implica aceptar ese compromiso de forma consciente.
- La seccion de validacion de la model card esta truncada en la informacion disponible, por lo que no se pueden comprobar los detalles completos del protocolo de medida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/caiovicentino1/DeepSeek-V4.1-Flash-HLWQ-Engram-Q4
- Repo hermano a 5 bits: https://huggingface.co/caiovicentino1/DeepSeek-V4.1-Flash-HLWQ-Engram-Q5
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Receta de despliegue de referencia: https://github.com/0xSero/deepseek-v4.1-flash-4x-rtx-pro-6000
- Issue del parche de prefill para SM120: https://github.com/flashinfer-ai/flashinfer/issues/5095
- Referencias arXiv citadas en los tags del repositorio (sin titulo confirmado en la informacion disponible): https://arxiv.org/abs/2603.29078 y https://arxiv.org/abs/2502.02617

Nota: la busqueda web realizada no devolvio resultados utiles (unicamente paginas de inicio de Google), por lo que no se han podido verificar enlaces adicionales, papers asociados ni demos mas alla de los listados arriba.
