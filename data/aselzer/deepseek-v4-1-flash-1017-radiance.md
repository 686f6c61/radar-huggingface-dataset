# aselzer/DeepSeek-V4.1-Flash-1017-radiance

## Resumen

DeepSeek-V4.1-Flash-1017-radiance es una conversion de formato del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek al formato `.rad` propietario del servidor de inferencia radiance, desarrollado por Deadcode y colaboradores para GPUs AMD. El autor de la conversion es aselzer, y el objetivo declarado es puramente de reproducibilidad: se trata del fichero de modelo empleado en las mediciones de gran lote del proyecto radiance-ramcache (512 peticiones concurrentes sobre cuatro tarjetas RX 9070 XT de 16 GB con 256 GB de RAM).

No se trata de un fine-tuning ni de una modificacion de pesos: los pesos son los de DeepSeek, liberados bajo licencia MIT, y la unica transformacion es el cambio de formato de fichero. El modelo base es un MoE (mixture of experts) segun las etiquetas del repositorio, con los expertos enrutados conservados en la codificacion MXFP4 original de la release y el resto de pesos en BF16/F32. El fichero `model.rad` ocupa 416 GB.

Su relevancia es acotada pero concreta: demuestra que es posible servir un modelo de esta magnitud en hardware AMD de consumo (RDNA4, gfx1201) mediante offload a RAM del sistema, y proporciona un artefacto verificable para quienes quieran replicar esas mediciones. No hay informacion publicada sobre el numero de parametros totales, la longitud de contexto ni los idiomas soportados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en MXFP4; resto de pesos en BF16/F32; tablas Engram en IQ4_NL (conversion comunitaria) o FP8 (oficial) |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos de DeepSeek; este repositorio solo cambia el formato de fichero) |
| Formato de pesos | `.rad` (formato de radiance); shards originales en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-V4.1-Flash-1017, un transformer con mezcla de expertos segun las etiquetas del repositorio. La conversion a `.rad` se realizo con el conversor de DeepSeek-V4.1 de radiance en el commit `bd65d4e`, con soporte para DeepSeek-V4.1 aportado por baKon en el PR 266 del proyecto. Los expertos enrutados se mantienen en la codificacion MXFP4 de la release original, mientras que el resto de pesos se almacenan en BF16/F32.

El modelo incorpora tablas Engram, un componente especifico de la familia DeepSeek-V4.1. El fichero `.rad` incluye una conversion comunitaria de dichas tablas a IQ4_NL, pero las mediciones de referencia leen las tablas Engram oficiales en FP8 desde los dos ultimos shards de la release original (revision `1bae0e1088993b9b82de08f59de5be5a34e42170`), lo que permite usar los pesos del modelo sin modificar, a la misma velocidad (BIRD 256: 170 s frente a 172 s) y con un NLL ligeramente inferior (0,688 frente a 0,692). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base DeepSeek-V4.1-Flash-1017, si bien la model card no detalla capacidades concretas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Servicio de gran lote: el artefacto esta especificamente validado para 512 peticiones concurrentes en la configuracion de cuatro RX 9070 XT con 256 GB de RAM.

## Casos de uso

- Reproduccion de las mediciones de radiance-ramcache: descargar el fichero `model.rad` y lanzar `serve-batch.sh --model model.rad` permite replicar los experimentos de 512 peticiones concurrentes sobre cuatro RX 9070 XT, lo que resulta adecuado porque el artefacto es exactamente el usado en esas pruebas.
- Evaluacion de servidores de inferencia para AMD: sirve para validar el rendimiento de radiance con modelos MoE de gran tamano en GPUs RDNA4, comparando latencias y throughput con otras configuraciones.
- Investigacion sobre offload a RAM: al requerir 416 GB de fichero y solo 64 GB de VRAM agregada en cuatro RX 9070 XT, el modelo es un banco de pruebas realista para estrategias de paginacion y cache de pesos en memoria del sistema.
- Desarrollo de pipelines de inferencia en hardware de consumo: equipos con varias GPUs AMD de 16 GB y gran cantidad de RAM pueden servir este modelo sin recurrir a aceleradores de datacenter, lo que es util para prototipos y entornos de investigacion con presupuesto limitado.
- Verificacion de conversiones de formato: el repositorio documenta el commit del conversor, los hashes SHA-256 de los shards Engram y las instrucciones de uso, lo que lo convierte en una referencia para validar el conversor de DeepSeek-V4.1 de radiance.
- Pruebas de integracion con tablas Engram en FP8: permite comparar el comportamiento del modelo con tablas Engram comunitarias IQ4_NL frente a las oficiales FP8, con metricas de NLL y tiempo de ejecucion documentadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| BIRD 256 con tablas Engram FP8 oficiales | 170 s |
| BIRD 256 con tablas Engram IQ4_NL comunitarias | 172 s |
| NLL con tablas Engram FP8 oficiales | 0,688 |
| NLL con tablas Engram IQ4_NL comunitarias | 0,692 |
| Peticiones concurrentes medidas | 512 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas cifras corresponden a las mediciones internas del proyecto radiance-ramcache sobre una unica maquina (4x RX 9070 XT gfx1201, EPYC 7443, 256 GB DDR4).

## Requisitos de hardware

- Almacenamiento: 416 GB para `model.rad`, mas los dos shards Engram oficiales (model-00047 y model-00048 de 48) si se desea usar la configuracion FP8.
- VRAM: no disponible de forma exacta; la configuracion probada emplea 4 GPUs de 16 GB (64 GB agregados), lo que implica offload del resto de pesos a RAM del sistema.
- RAM del sistema: 256 GB DDR4 en la configuracion de referencia.
- GPUs probadas: 4x AMD RX 9070 XT (gfx1201, RDNA4).
- GPUs recomendadas: no disponible; solo se documenta la configuracion AMD RDNA4 anterior.
- Cabe en GPU de consumo: si, en el sentido de que la configuracion probada usa GPUs de consumo, pero requiere cuatro unidades y 256 GB de RAM.
- Opciones de despliegue: radiance (servidor de inferencia para GPUs AMD), con el lanzador `serve-batch.sh` de radiance-ramcache. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: BIRD 256 en 170 s con tablas Engram FP8; no se proporcionan mas cifras de latencia por peticion ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-radiance | no disponible | no disponible | `.rad` | MIT | AMD RDNA4 (radiance) |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | safetensors | MIT | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La unica comparacion posible es con el modelo base original, del que este repositorio solo difiere en el formato de fichero y en la codificacion de las tablas Engram.

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: es una conversion de formato, por lo que hereda integramente los sesgos, riesgos de alucinacion y limitaciones del modelo base DeepSeek-V4.1-Flash-1017, sobre el que no se aporta informacion.
- Solo se ha probado en una unica maquina (4x RX 9070 XT, EPYC 7443, 256 GB DDR4); no hay garantias de funcionamiento en otras configuraciones.
- El formato `.rad` es propietario del servidor radiance y no es compatible con los runners habituales (vLLM, llama.cpp, TGI); la portabilidad es muy limitada.
- El fichero incluye por defecto tablas Engram en IQ4_NL de origen comunitario; para usar los pesos sin modificar hay que descargar aparte los dos shards oficiales en FP8 y configurar la variable de entorno correspondiente.
- El requisito de 416 GB de almacenamiento y 256 GB de RAM limita el despliegue a entornos con infraestructura considerable.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el artefacto ni sobre el modelo base.
- No hay informacion sobre idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que impide evaluar su idoneidad para casos de uso concretos mas alla de la reproducibilidad de las mediciones.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aselzer/DeepSeek-V4.1-Flash-1017-radiance
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Servidor radiance: https://codeberg.org/StillDeadcode/radiance
- PR de soporte DeepSeek-V4.1 en radiance: https://codeberg.org/StillDeadcode/radiance/pulls/266
- Proyecto radiance-ramcache: https://github.com/arselzer/radiance-ramcache
