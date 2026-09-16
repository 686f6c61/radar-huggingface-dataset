# EliovpAI/Qwen3.8-27B-Quark-AWQ-MXFP4-DFlash2-Paiton-RDNA4

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue (runtime overlay) publicado por EliovpAI para servir el checkpoint Qwen3.8-27B en cuantizacion MXFP4 sobre una unica GPU AMD Radeon AI PRO R9700 (arquitectura RDNA4, gfx1201). El paquete combina kernels HIP nativos de Paiton, tecnicas adaptadas de los proyectos Radiance y libr4d, y decodificacion especulativa DFlash2, todo ello dentro del runtime oficial de vLLM 0.28 para ROCm, sin necesidad de instalar un motor alternativo ni de compilar nada.

El problema que aborda es de eficiencia de servicio, no de capacidad del modelo: segun las mediciones del autor, con el mismo checkpoint MXFP4 y el mismo presupuesto de cache, Paiton entrega un 57 % mas de throughput a ocho peticiones concurrentes, un 22 % mas de decode ponderado y entre un 12,5 % y un 17,3 % mas de velocidad de prefill que la configuracion Radiance + DFlash2 sobre el mismo hardware. El cambio mas notable en experiencia de uso es la gestion de cache: 2,89 veces mas capacidad estimada de tokens en el mismo pool de 5 GiB, con la mediana de tiempo hasta el primer token cayendo de 6,59 segundos a 195 ms a ocho peticiones concurrentes (incluyendo cola).

Es relevante ahora porque demuestra que es posible servir un modelo de 27 000 millones de parametros cuantizado en MXFP4 con latencias utilizables en una sola GPU de estacion de trabajo AMD, usando la API OpenAI estandar de vLLM y sin salir del ecosistema ROCm. La contrapartida es que el alcance declarado es estrecho: solo generacion de texto, solo RDNA4/gfx1201, licencia no especificada y sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe la arquitectura del checkpoint base Qwen3.8-27B; el paquete es un overlay de runtime, no un modelo nuevo) |
| Parametros totales | 27 000 millones (segun la denominacion del modelo base; no se publica desglose) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 8 192 tokens por peticion en el perfil probado (limite del benchmark y de la configuracion por defecto); no se documenta la ventana nativa del modelo base |
| Tipos de cuantizacion | Pesos MXFP4 (checkpoint Quark-AWQ-MXFP4); cache KV en FP8; el motor stock emula W4A4 y las rutas aceleradas usan W4A8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no incluye pesos: descarga aproximadamente 21,9 GB de snapshots de los autores originales, objetivo + borrador) |
| Motor de inferencia | vLLM 0.28 ROCm (entrada `vllm.entrypoints.openai.api_server`) con plugin Paiton y DFlash2 |
| Hardware objetivo | Una Radeon AI PRO R9700 (RDNA4, gfx1201); no se declara soporte para otras arquitecturas de GPU |
| Configuracion probada | 8 peticiones concurrentes, contexto de 8 192 tokens, cache KV en FP8, pool de cache de 5 GiB, chunks de prefill de hasta 4 096 tokens, DFlash2 con 7 tokens especulativos |
| Tamano del repositorio | 0,0 GB (solo overlay de runtime, referencias fijadas, checksums y evidencias de benchmark) |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste fino en este repositorio: el autor lo declara explicitamente ("this repository does not duplicate them or introduce new fine-tuning"). Lo que se distribuye es una capa de runtime nativa que se superpone a la libreria vLLM instalada, que permanece sin modificar. La aceleracion proviene de tres fuentes combinadas: kernels HIP propios de Paiton, tecnicas importadas de Radiance y libr4d, y DFlash2 como mecanismo de decodificacion especulativa con siete tokens de borrador y drafting sin padding.

El modelo base es `amd/Qwen3.8-27B-Quark-AWQ-MXFP4` (cuantizacion Quark de AMD sobre un Qwen3.8-27B) y el borrador especulativo procede de `tcclaviger/Qwen3.8-27B-DFlash2-FP8`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, porque esa informacion pertenece a los autores originales del checkpoint y no a este paquete. La innovacion tecnica destacable es de sistema: mantener la API y la libreria oficiales de vLLM mientras se sustituyen las rutas criticas por kernels nativos y se integra decodificacion especulativa, obteniendo ganancias de throughput y, sobre todo, de latencia bajo carga concurrente mediante una gestion de cache mas eficiente.

## Capacidades

- Generacion de texto autoregresiva con streaming, expuesta mediante un endpoint compatible con `/v1/chat/completions` de OpenAI.
- Plantilla de chat con parametro `enable_thinking`, lo que indica que el modelo base dispone de un modo de razonamiento activable o desactivable por peticion.
- Decodificacion especulativa DFlash2 con siete tokens de borrador, integrada de forma transparente para el cliente.
- Servicio concurrente: el perfil por defecto se cualifica con ocho peticiones simultaneas.
- Prefill por chunks de hasta 4 096 tokens, lo que permite procesar entradas de varios miles de tokens.
- Almacenamiento de cache KV en FP8 con un pool de 5 GiB, con una capacidad estimada de 74 430 slots de tokens segun el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el limite de contexto de 8 192 tokens en el perfil probado restringe cadenas de agente largas.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: el autor indica expresamente que el paquete no reclama soporte de entrada de imagenes.
- El autor solo cualifica generacion de texto en esta configuracion.

## Casos de uso

- Servicio de chat multi-turno interno: con 8 192 tokens de contexto por peticion, cache KV en FP8 y una mediana de 195 ms hasta el primer token a ocho peticiones concurrentes, el modelo es apto para asistentes conversacionales de back-office con carga moderada en una sola GPU.
- Generacion y revision de codigo en herramientas de desarrollo: el ejemplo incluido en la model card resuelve tareas de programacion (por ejemplo, escribir una funcion en Python que elimine duplicados preservando el orden) con temperatura 0 y modo thinking desactivado, lo que encaja en asistentes de autocompletado o revision de parches.
- Procesado por lotes de documentos de entrada media: el prefill probado cubre entradas de aproximadamente 1 556, 3 024 y 5 226 tokens a 3 181, 3 521 y 3 367 tokens por segundo respectivamente, adecuado para resumir o reescribir informes, tickets o documentacion tecnica en pipelines offline.
- Inferencia on-premise con soberania de datos: al ejecutarse como contenedor Docker con acceso local a la GPU y publicar la API en `127.0.0.1:8000`, permite mantener los datos dentro de la organizacion sin depender de APIs externas.
- Backend de bajo capex para prototipos: una unica Radeon AI PRO R9700 sirve el modelo completo, lo que reduce el coste de experimentacion frente a configuraciones multi-GPU.
- Banco de pruebas de rendimiento de vLLM sobre ROCm: los ficheros `BENCHMARKS.md`, `metrics.json`, `throughput.csv` y `deployment-check.json` permiten reproducir y comparar configuraciones de motor (stock, Radiance, Paiton) con la misma carga de 188 peticiones.
- Extraccion y reescritura de texto en herramientas internas: la API compatible con OpenAI permite sustituir un endpoint en la nube por este despliegue cambiando unicamente la URL base, siempre que la tarea quepa en 8 192 tokens.
- Evaluacion de estrategias de decodificacion especulativa: el paquete permite medir el efecto de DFlash2 con siete tokens de borrador frente a rutas no especulativas manteniendo fijo el checkpoint.

## Benchmarks y rendimiento

Todos los datos proceden del autor del paquete y no se ha encontrado validacion independiente. Carga completa de 188 peticiones, mismo checkpoint MXFP4 y mismo presupuesto de cache:

| Metrica (carga completa) | Radiance + DFlash2 | Paiton + DFlash2 |
|---|---:|---:|
| Decode serial ponderado | 86,0 tok/s | 104,9 tok/s |
| Una peticion concurrente | 76,9 tok/s | 89,6 tok/s |
| Dos peticiones concurrentes | 142,7 tok/s | 165,7 tok/s |
| Cuatro peticiones concurrentes | 187,1 tok/s | 254,8 tok/s |
| Ocho peticiones concurrentes | 200,3 tok/s | 314,5 tok/s |
| Prefill, ~1 556 tokens de entrada | 2 828,4 tok/s | 3 181,5 tok/s |
| Prefill, ~3 024 tokens de entrada | 3 002,7 tok/s | 3 521,2 tok/s |
| Prefill, ~5 226 tokens de entrada | 2 925,8 tok/s | 3 367,2 tok/s |
| Slots de tokens estimados en el pool de cache de 5 GiB | 25 746 | 74 430 |

Matriz comun de 54 peticiones con limite de generacion de 128 tokens, comparando tres motores sobre los mismos pesos:

| Motor | Throughput a 8 peticiones concurrentes |
|---|---:|
| vLLM stock O2 | 33,7 tok/s |
| Radiance + DFlash2 | 175,6 tok/s |
| Paiton + DFlash2 | 328,5 tok/s |

Tiempo hasta el primer token (incluye cola; menor es mejor):

| Peticiones concurrentes | Radiance, mediana | Paiton, mediana |
|---|---:|---:|
| Una | 94,8 ms | 105,0 ms |
| Dos | 148,6 ms | 159,9 ms |
| Cuatro | 1 626,8 ms | 180,1 ms |
| Ocho | 6 585,5 ms | 194,8 ms |

No se han publicado en la informacion disponible resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros); las cifras anteriores son exclusivamente de rendimiento de servicio.

## Requisitos de hardware

- GPU obligatoria: una Radeon AI PRO R9700 (RDNA4, gfx1201) con acceso a `/dev/kfd` y `/dev/dri`. El autor no reclama soporte para otras arquitecturas de GPU.
- Pesos: aproximadamente 21,9 GB de ficheros combinados (modelo objetivo + borrador DFlash2), que se descargan y verifican en el primer arranque y se reutilizan desde cache en arranques posteriores.
- Cache: pool de 5 GiB con almacenamiento KV en FP8 en el perfil probado. No se publica un desglose de VRAM total; con una R9700 de 32 GB el conjunto de pesos y pool ajusta, pero conviene reservar margen para activaciones y chunks de prefill de hasta 4 096 tokens.
- GPU de consumo: no se declara compatibilidad. Las tarjetas de consumo basadas en RDNA4 comparten la familia gfx1201, pero el paquete no ofrece validacion ni garantia para ellas, y el propio autor advierte que no reclama soporte de otras arquitecturas.
- Sistema operativo: Linux x86-64 con Docker.
- Despliegue: imagen `ghcr.io/eliovp/paiton-vllm-plugin` fijada por digest, que incluye el runtime oficial vLLM 0.28 ROCm y el plugin Paiton; endpoint OpenAI en el puerto 8000. No se documentan rutas de despliegue con llama.cpp, Ollama, TGI ni formatos GGUF (el checkpoint es MXFP4 y depende de vLLM/ROCm).
- Latencia y throughput medidos: 89,6 tok/s con una peticion concurrente y 314,5 tok/s con ocho en la carga de 188 peticiones; 328,5 tok/s a ocho peticiones en la matriz de 128 tokens; prefill entre 3 181 y 3 521 tok/s.
- Consideraciones de configuracion: en el perfil probado, el prefix caching y la planificacion asincrona estan desactivados; activarlos puede alterar las cifras.

## Comparativa con modelos similares

La comparacion disponible no es entre modelos distintos, sino entre motores de inferencia sobre el mismo checkpoint y el mismo hardware, que es el eje del paquete:

| Motor | Modelo y pesos | Contexto probado | Throughput a 8 concurrentes | TTFT mediana a 8 concurrentes | Licencia |
|---|---|---|---|---|---|
| vLLM stock O2 | Qwen3.8-27B MXFP4, emulacion W4A4 nativa del checkpoint | 8 192 tokens en el perfil comparado | 33,7 tok/s (matriz de 128 tokens) | no disponible | no disponible |
| Radiance + DFlash2 | Qwen3.8-27B MXFP4, rutas W4A8 aceleradas | 8 192 tokens | 200,3 tok/s (carga completa) / 175,6 tok/s (matriz) | 6 585,5 ms | no disponible |
| Paiton + DFlash2 (este paquete) | Qwen3.8-27B MXFP4 sobre vLLM 0.28 ROCm oficial | 8 192 tokens | 314,5 tok/s (carga completa) / 328,5 tok/s (matriz) | 194,8 ms | no disponible |

Comparacion con modelos alternativos de tamano similar (por ejemplo, otras familias de 27 000-32 000 millones de parametros en cuantizacion de 4 bits): no disponible en la informacion proporcionada. Tampoco se dispone de especificaciones tecnicas de los checkpoints base (`amd/Qwen3.8-27B-Quark-AWQ-MXFP4` y `tcclaviger/Qwen3.8-27B-DFlash2-FP8`) mas alla de su identificador.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Conviene consultar las licencias del checkpoint base y del modelo original de Qwen antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: no se puede asumir un comportamiento multilingue correcto sin evaluacion previa.
- Benchmarks autoinformados: todas las cifras provienen del autor del paquete. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no se ha encontrado verificacion externa.
- Alcance multimodal descartado: el autor indica expresamente que el paquete no reclama soporte de entrada de imagenes.
- Contexto limitado en el perfil probado: 8 192 tokens por peticion. La cifra de 74 430 slots de tokens es una estimacion de capacidad de cache, no una ventana de contexto validada por peticion.
- Dependencia de hardware muy concreta: validado unicamente en RDNA4/gfx1201 con Linux x86-64 y Docker. No hay soporte declarado para NVIDIA, Intel ni para GPUs AMD de generaciones anteriores.
- Dependencia de descargas externas: el repositorio ocupa 0,0 GB y no contiene los pesos; el primer arranque descarga aproximadamente 21,9 GB desde los repositorios de los autores originales. Si esos repositorios cambian o desaparecen, el despliegue se rompe.
- Configuracion no optimizada por defecto: prefix caching y planificacion asincrona desactivados en el perfil probado, lo que puede reducir el rendimiento en cargas con prefijos repetidos si no se reconfigura.
- Sin informacion sobre sesgos, tasas de alucinacion o comportamiento en dominios sensibles; al ser una cadena de cuantizacion (AWQ + MXFP4) sobre un modelo base no documentado aqui, la degradacion respecto al modelo original no esta cuantificada.
- La model card proporcionada esta truncada en la seccion de auditoria del runtime, por lo que no se puede verificar el contenido completo de las comprobaciones de integridad.
- La fecha de creacion del repositorio (15 de septiembre de 2026) y la ausencia de descargas sugieren un paquete muy reciente, sin rodaje en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EliovpAI/Qwen3.8-27B-Quark-AWQ-MXFP4-DFlash2-Paiton-RDNA4
- Modelo base (target): https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Modelo base (borrador DFlash2): https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8
- Proyecto Radiance: https://github.com/magiccodingman/vllm-radiance
- Proyecto libr4d: https://codeberg.org/StillDeadcode/libr4d
- Imagen de contenedor: ghcr.io/eliovp/paiton-vllm-plugin@sha256:9b2dae214076d35de785e073b31294b033a376b16e6bc1ec1fdada4e54d96c59
- Evidencias de benchmark incluidas en el repositorio (rutas relativas a la raiz del repo): `BENCHMARKS.md`, `metrics.json`, `throughput.csv`, `release-audit.json`, `deployment-check.json`, `three-engine-throughput.png`, `full-confirmation.png`
- La busqueda web realizada no devolvio resultados relevantes: unicamente coincidencias de la aplicacion Quick Share de Microsoft Store, sin ninguna relacion con el modelo.
