# 1bit-MONSTER/Qwen3-Coder-30B-A3B-Instruct-GGUF

# Ficha tecnica: 1bit-MONSTER/Qwen3-Coder-30B-A3B-Instruct-GGUF

## Resumen

Se trata de un reempaquetado en formato GGUF del modelo Qwen3-Coder-30B-A3B-Instruct, publicado por el usuario 1bit-MONSTER. El modelo subyacente es un transformer decoder-only con arquitectura de mezcla de expertos (MoE) desarrollado por Qwen: 30.532.122.624 parametros totales (~30,5B) de los cuales solo ~3B se activan por token, lo que permite inferencia sensiblemente mas barata que un modelo denso del mismo tamano. La cuantizacion incluida en el repositorio es la Q4_K_M realizada por Unsloth, con el tag `imatrix`, y el repositorio ocupa 18,6 GB.

El valor diferencial de esta publicacion no esta en el modelo ni en la cuantizacion, sino en el rehospedaje acompanado de mediciones de rendimiento reales sobre un sistema Strix Halo (APU de AMD con memoria unificada) usando el motor propietario del autor, denominado 1bit engine, sobre backend Vulkan. Los datos reportados son 1.321 tok/s en prefill (pp512) y 76,8 tok/s en generacion (tg128), cifras relevantes para quien quiera ejecutar un MoE de codigo de 30B sin GPU dedicada.

Es relevante ahora porque demuestra que un modelo de codigo de ~30B totales y ~3B activos puede servirse a velocidad interactiva en hardware de clase consumidor con memoria unificada, y porque la licencia Apache 2.0 heredada del modelo base permite uso comercial. Como contrapartida, el repositorio no aporta evaluaciones de calidad (benchmarks) y acumula cero descargas y cero likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE); ~3B parametros activos por token |
| Parametros totales | 30.532.122.624 (~30,5B), dato procedente de safetensors |
| Parametros activos | ~3B (segun la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero incluido); el repositorio lleva el tag `imatrix` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf`) |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct |
| Origen de la cuantizacion | unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF |
| Tamano del repositorio | 18,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos HF) | 2026-09-26T13:47:27.000Z |
| Ultima actualizacion (metadatos HF) | 2026-09-26T13:49:37.000Z |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capa de mezcla de expertos. Segun la informacion disponible, agrega 30,5B parametros totales y activa aproximadamente 3B por token, lo que situa su coste de computo por token en el orden de un modelo denso de ~3B pese a almacenar pesos de un modelo de 30B. El repositorio analizado no entrena ningun modelo: es una redistribucion de una cuantizacion GGUF Q4_K_M ya existente, realizada por Unsloth, que el autor vuelve a publicar junto con mediciones de rendimiento.

No hay informacion disponible sobre el volumen de tokens de entrenamiento del modelo base, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO u otras. Tampoco se documentan innovaciones de atencion o decodificacion especifica en esta ficha. La unica aportacion tecnica verificable del repositorio es la cuantizacion de 4 bits con matriz de importancia (`imatrix`) y la publicacion de cifras de throughput sobre Vulkan en hardware Strix Halo empleando el 1bit engine del autor.

## Capacidades

- Generacion de codigo: el modelo base esta orientado explicitamente a tareas de programacion (tag `coder`), por lo que su uso previsto es la escritura y completado de codigo.
- Conversacion: el repositorio incluye el tag `conversational` y el modelo base es una variante Instruct, es decir, ajustada para seguir instrucciones en formato de dialogo.
- Inferencia eficiente por arquitectura MoE: con ~3B parametros activos, el coste computacional por token es mucho menor que el de un modelo denso de 30B, lo que habilita su despliegue en equipos con memoria unificada.
- Compatibilidad con endpoints: el repositorio lleva el tag `endpoints_compatible`, orientado a su consumo desde servicios de inferencia compatibles.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponible; la model card del rehospedaje no enumera idiomas.
- Capacidad de vision o audio: no disponible; no hay indicios de modalidades adicionales.
- Modo de razonamiento explicito (thinking mode): no documentado en la informacion disponible.

## Casos de uso

- Asistente de codigo en local para desarrolladores individuales: al ser un GGUF Q4_K_M de ~18,6 GB, puede ejecutarse en un equipo con 24 GB de VRAM o con memoria unificada, sin enviar codigo propietario a servicios externos.
- Despliegue en mini-PC o workstation con APU Strix Halo: el escenario exacto medido por el autor, con 1.321 tok/s de prefill y 76,8 tok/s de generacion sobre Vulkan, es adecuado para autocompletado y chat interactivo en el propio escritorio.
- Servidor de generacion de codigo en red interna: levantando un endpoint compatible sobre el fichero GGUF, un equipo de desarrollo puede compartir una unica instancia del modelo para tareas de revision, refactorizacion o generacion de tests.
- Integracion en pipelines de CI/CD: el modelo puede actuar como paso de generacion o de sugerencia en tareas de documentacion automatica, generacion de tests unitarios o resumen de diffs, siempre que el pipeline disponga de una maquina con memoria suficiente para cargar los 18,6 GB del fichero.
- Entornos con requisitos de confidencialidad: sectores con restricciones de tratamiento de datos (banca, sanidad, sector publico) pueden ejecutar el modelo on-premise gracias a la licencia Apache 2.0 y a la ausencia de dependencia de API externas.
- Laboratorios de investigacion en eficiencia de inferencia: la combinacion de un MoE de ~3B activos con cuantizacion Q4_K_M y backend Vulkan lo convierte en un banco de pruebas util para medir throughput y consumo energetico frente a alternativas densas.
- Formacion y experimentacion docente: permite ilustrar en un solo equipo concepts de MoE, cuantizacion de 4 bits y decodificacion con KV cache sin necesidad de clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible. La model card del rehospedaje unicamente incluye mediciones de rendimiento de inferencia sobre Strix Halo con backend Vulkan, que se recogen en la seccion siguiente:

| Metrica | Valor medido |
|---|---|
| Prefill (pp512) | 1.321 tok/s |
| Generacion (tg128) | 76,8 tok/s |
| Plataforma | Strix Halo (memoria unificada), Vulkan |
| Motor | 1bit engine (`1bit serve --device vulkan`) |
| MMLU / HumanEval / GSM8K u otros | no disponibles |

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa aproximadamente 18,6 GB (tamano del repositorio); hay que anadir la memoria para el contexto y la caché KV, por lo que conviene reservar del orden de 20-22 GB de memoria disponible para GPU o memoria unificada.
- GPU dedicadas compatibles sin offload: tarjetas de 24 GB o mas, como RTX 3090, RTX 4090 o RTX 5090; A100 (40/80 GB) y H100 ofrecen margen amplio y mayor ancho de banda.
- GPU de 16 GB: no permiten cargar el modelo completo; requieren offload parcial de capas a CPU/RAM, con la consiguiente penalizacion de velocidad.
- Hardware de clase consumidor: si, tanto en GPU de 24 GB como en sistemas de memoria unificada tipo Strix Halo, que es precisamente la plataforma medida por el autor.
- Opciones de despliegue: el autor documenta el uso de su propio motor con `1bit serve -m Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf --device vulkan`. Al tratarse de un GGUF, el fichero es compatible con runners habituales de este formato, como llama.cpp y Ollama, y con servidores GGUF que expongan una API compatible con OpenAI. Los servidores basados en safetensors (vLLM, TGI) requeririan convertir o usar los pesos originales del modelo base.
- Latencia y throughput: en la unica plataforma medida (Strix Halo, Vulkan) se reportan 1.321 tok/s en prefill y 76,8 tok/s en generacion. No hay datos publicados para otras GPU o backends.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1bit-MONSTER/Qwen3-Coder-30B-A3B-Instruct-GGUF (esta ficha) | ~30,5B / ~3B | no disponible | GGUF Q4_K_M (~18,6 GB) | Apache 2.0 | Publicado en HuggingFace; 0 descargas, 0 likes |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (modelo base) | ~30,5B / ~3B | no disponible | safetensors (bf16; ~61 GB de pesos, estimado) | Apache 2.0 | Repositorio oficial de Qwen |
| unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF | ~30,5B / ~3B | no disponible | GGUF (varias cuantizaciones, segun el autor de la cuantizacion) | Apache 2.0 | Repositorio de Unsloth; origen del fichero Q4_K_M aqui redistribuido |

No se dispone en la informacion proporcionada de comparativas con modelos de otros fabricantes (por ejemplo, alternativas densas de tamano similar), ni de datos de benchmarks que permitan comparar calidad entre estas variantes. La diferencia principal entre las tres filas es el formato y el peso en disco, no la arquitectura ni los pesos entrenados; la redistribucion de 1bit-MONSTER anade unicamente las mediciones de rendimiento sobre su motor.

## Limitaciones y advertencias

- Cuantizacion de 4 bits: el fichero Q4_K_M introduce perdida de precision respecto a los pesos originales en bf16; no se han publicado evaluaciones que cuantifiquen esa degradacion para este repositorio concreto.
- Ausencia de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion en la informacion disponible, por lo que la calidad real del modelo cuantizado no esta verificada.
- Falta de validacion de la comunidad: el repositorio registra cero descargas y cero likes, y su model card es minima; no existe retroalimentacion independiente sobre su funcionamiento.
- Riesgo de alucinacion: como cualquier modelo generativo de codigo, puede producir APIs, funciones o dependencias inexistentes con apariencia plausible; es obligatorio validar el codigo generado antes de llevarlo a produccion.
- Contexto e idiomas sin documentar: no se especifica la longitud de contexto soportada por esta distribucion ni los idiomas cubiertos, lo que impide garantizar un comportamiento correcto en conversaciones largas o en idiomas distintos del ingles.
- Comportamiento dependiente del motor: las cifras de rendimiento publicadas corresponden exclusivamente al 1bit engine sobre Vulkan en Strix Halo; no hay garantia de que se reproduzcan en otros backends o GPUs.
- Memoria requerida: con 18,6 GB solo de fichero, no es desplegable en GPU de 16 GB sin offload, lo que limita su uso en equipos de gama media.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. Conviene verificar igualmente las condiciones del modelo base original de Qwen.
- Trazabilidad: al ser un rehospedaje, la responsabilidad sobre la integridad de la cuantizacion recae en el publicador original (Unsloth); no se aporta en este repositorio ninguna verificacion de checksums ni proceso de validacion reproducible.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/1bit-MONSTER/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio de la cuantizacion original: https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Motor del autor (1bit engine): https://github.com/1bit-MONSTER/engine
- Otra documentacion, papers o demos: no disponible; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.
