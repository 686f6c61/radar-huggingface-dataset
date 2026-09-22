# nwtgck/Muse-Glimmer-30B-GGUF

## Resumen
Muse-Glimmer-30B-GGUF es el repositorio de conversiones GGUF publicado por el usuario nwtgck a partir del modelo meta-models/Muse-Glimmer-30B, un modelo de lenguaje causal de aproximadamente 30.000 millones de parametros (27.854.794.240 reales, segun los pesos en safetensors del modelo base) desarrollado por Meta Superintelligence Lab, publicado en agosto de 2026 y distribuido bajo licencia Apache 2.0. El modelo combina un decodificador de texto con un encoder de percepcion dedicado para entrada de imagen; esta destilado de Muse Spark y esta disenado especificamente para tareas agenticas autonomas que deben ejecutarse en hardware de consumo, sin infraestructura cloud ni acceso a red.

Este repositorio concreto no contiene pesos bf16 ni un GGUF sin cuantizar. Ofrece dos builds de texto cuantizadas (una Q4_K_M de 16,8 GB y una variante "Dynamic" Q4_K_XL de 19,7 GB), un encoder de percepcion mmproj de 1,4 GB imprescindible para procesar imagenes y un drafter DFlash de 1,6 GB para decodificacion especulativa opcional. El tamano total del repositorio es de 39,4 GB.

Su relevancia practica esta en que permite servir localmente un modelo multimodal con razonamiento multi-paso, uso de herramientas y trazas de pensamiento separadas del texto de salida en una GPU de 24 GB de VRAM, a traves de llama.cpp (build b10353 o posterior) y su servidor compatible con la API de OpenAI. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo de lenguaje causal) con encoder de percepcion dedicado para imagenes; destilado de Muse Spark |
| Parametros totales | 27.854.794.240 (etiquetado comercialmente como 30B) |
| Parametros activos | No aplica: no se documenta arquitectura MoE |
| Longitud de contexto | No disponible como maximo oficial; los ejemplos del autor lanzan el servidor con `-c 131072` y las CLI con `-c 32768` |
| Tipos de cuantizacion | Q4_K_M (KQuant-17GB, 16,8 GB), Q4_K_XL (KQuant-Dynamic, 19,7 GB); encoder de percepcion Q4_K_M (1,4 GB) y drafter DFlash Q4_K_M (1,6 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publica bf16 en este repositorio |

## Arquitectura y entrenamiento
La model card describe Muse Glimmer como un modelo de lenguaje causal de 30.000 millones de parametros con un encoder de percepcion dedicado, destilado de Muse Spark, que integra en un unico modelo razonamiento multi-paso, uso fiable de herramientas, comprension multimodal y recuperacion de fallos. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO: esa informacion no esta disponible en el material proporcionado. Tampoco se detalla si emplea attention lineal, MoE u otra variante; lo unico documentado es la naturaleza causal y la separacion entre el decodificador de texto y el encoder de percepcion.

Las innovaciones tecnicas que si aparecen documentadas en este repositorio son de despliegue, no de preentrenamiento. Por un lado, las cuantizaciones KQuant y KQuant-Dynamic, orientadas a encajar el modelo en 24 GB y 32 GB de VRAM respectivamente. Por otro, la decodificacion especulativa mediante un drafter DFlash de 1,6 GB (`-md` y `-ngld 99` en llama.cpp), que mantiene las mismas salidas con una decodificacion mas rapida. Ademas, el modelo expone una traza de pensamiento separada: el servidor devuelve el texto final en `content` y el razonamiento en `reasoning_content`, y las CLI imprimen la traza con marcas `[Start thinking]` / `[End thinking]` o de forma cruda. El soporte en llama.cpp se fusiono el 10 de agosto de 2026 (PR #26841, commit `62bf73d`) y se distribuyo por primera vez en la release b10353.

## Capacidades
- Generacion de texto conversacional multi-turno, con formato de chat gestionado via `--jinja`.
- Razonamiento multi-paso con traza de pensamiento separada de la respuesta final (`reasoning_content`).
- Uso de herramientas y function calling, orientado a flujos agenticos.
- Recuperacion de fallos dentro de tareas autonomas (reintentos y replanificacion), segun la descripcion del autor.
- Comprension de imagenes mediante el encoder de percepcion mmproj: pipeline `image-text-to-text` y ejecucion con `llama-mtmd-cli`.
- Ejecucion local completa, sin infraestructura cloud ni acceso a red.
- Servicio concurrente mediante `llama-server` con `-np 4` y endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Decodificacion especulativa opcional con el drafter DFlash para reducir la latencia de decodificacion.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Capacidades de audio o de vision mas alla de imagen: no documentadas.

## Casos de uso
- Agentes autonomos locales: el modelo puede ejecutar bucles de razonamiento multi-paso con llamadas a herramientas en una estacion de trabajo con 24 GB de VRAM, sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos estrictos de confidencialidad.
- Asistentes conversacionales de atencion al cliente: con contexto de hasta 131.072 tokens en la configuracion de ejemplo, permite mantener historiales largos de conversacion y documentacion de producto en la misma ventana, sirviendo hasta 4 peticiones concurrentes con `-np 4`.
- Inspeccion y descripcion de imagenes: usando `llama-mtmd-cli` junto con `mmproj-Muse-Glimmer-30B-Q4_K_M.gguf`, se puede pedir la descripcion o el analisis de una fotografia; el coste adicional de memoria es de aproximadamente 2 GB.
- Automatizacion de flujos de trabajo con herramientas: al soportar tool calling y recuperacion de fallos, encaja en pipelines que encadenan busquedas, ejecucion de comandos o consultas a APIs internas y necesitan reintentar pasos fallidos.
- Despliegue en entornos air-gapped: al funcionar sin red y con pesos GGUF autocontenidos, es apto para laboratorios, plantas industriales o sistemas de defensa donde no se permite salida a internet.
- Prototipado e investigacion en una sola GPU: el build de 16,8 GB permite reproducir experimentos de agentes multimodales en una GPU de 24 GB, reservando el build Dynamic para equipos con 32 GB cuando se prioriza la calidad de la cuantizacion.
- Servicio interno autoalojado: `llama-server` expone una API compatible con OpenAI, de modo que se puede sustituir un endpoint remoto por uno local manteniendo los clientes existentes.
- Aceleracion de inferencia interactiva: anadiendo el drafter DFlash (`-md ... -ngld 99`) se obtienen las mismas salidas con una decodificacion mas rapida a cambio de unos 1,6 GB extra de memoria.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web realizada no contienen datos sobre el modelo. El unico dato de rendimiento mencionado es cualitativo: el uso del drafter DFlash produce "las mismas salidas con una decodificacion mas rapida", sin cifras de latencia o throughput.

## Requisitos de hardware
- Memoria estimada segun el propio autor (pesos mas contexto de trabajo):

| Build | Solo texto | Con vision | Con vision y drafter |
|---|---|---|---|
| KQuant-17GB Q4_K_M (16,8 GB) | ~17 GB | ~19 GB | ~20 GB |
| KQuant-Dynamic Q4_K_XL (19,7 GB) | ~20 GB | ~22 GB | ~23 GB |

- El build de 17 GB esta declarado como apto para 24 GB de VRAM; el build Dynamic esta pensado para 32 GB de VRAM.
- GPU concretas: el autor no nombra modelos. Por capacidad de memoria, el build de 17 GB encaja en tarjetas de 24 GB como la RTX 4090 o la RTX 3090; el build Dynamic requiere tarjetas de 32 GB o superiores, como una RTX 5090 o una A100 de 40 GB. No se documentan cifras para A100 de 80 GB ni H100.
- Uso en CPU: es posible compilando llama.cpp sin `-DGGML_CUDA=ON`; Apple Metal esta activado por defecto. En ambos casos la memoria del sistema debe absorber los pesos y el contexto.
- Despliegue: llama.cpp build b10353 o posterior, con los binarios `llama-server`, `llama-cli` y `llama-mtmd-cli`. Los builds b10344 y anteriores no registran la arquitectura y rechazan estos ficheros. No se documentan instrucciones para vLLM, Ollama o TGI.
- Parametros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.95 --top-k 64`.
- Offload completo de capas a GPU con `-ngl 99` y `-ngld 99` para el drafter.
- Latencia y throughput: no disponibles. Solo se indica que el drafter acelera la decodificacion, advertiendo de que el mensaje `[spec] failed to measure draft model memory` al arrancar es inofensivo.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de terceros que permitan una comparacion con modelos de la misma categoria; la informacion proporcionada no incluye benchmarks ni alternativas evaluadas. La unica comparacion posible es interna, entre las variantes publicadas en este repositorio y el modelo base:

| Version | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nwtgck/Muse-Glimmer-30B-GGUF (17gb) | ~27,85 B | No disponible (ejemplos con 131.072) | Q4_K_M, 16,8 GB | Apache 2.0 | GGUF para llama.cpp |
| nwtgck/Muse-Glimmer-30B-GGUF (dynamic) | ~27,85 B | No disponible (ejemplos con 131.072) | Q4_K_XL, 19,7 GB | Apache 2.0 | GGUF para llama.cpp |
| meta-models/Muse-Glimmer-30B (base) | ~27,85 B | No disponible | bf16 | Apache 2.0 | Pesos completos, no GGUF |

Comparacion con modelos de otros desarrolladores: no disponible.

## Limitaciones y advertencias
- El repositorio registra 0 descargas y 0 likes, fue creado el 22 de septiembre de 2026 y no tiene validacion de la comunidad; conviene tratar su contenido como no verificado de forma independiente.
- Requiere llama.cpp build b10353 o posterior. Los builds b10344 y anteriores no reconocen la arquitectura y fallan al cargar los ficheros.
- No se publican pesos bf16 en este repositorio; quien necesite precision completa debe acudir al repositorio del modelo base.
- Discrepancia de nomenclatura: el modelo se anuncia como 30B, pero el recuento real de parametros en safetensors es de 27.854.794.240, aproximadamente un 7 % inferior.
- La model card mezcla informacion del modelo base (autoria de Meta Superintelligence Lab, fecha de publicacion de agosto de 2026) con la de esta conversion GGUF; parte de los datos describe el modelo original, no este repositorio.
- Los comandos de descarga del README apuntan a `meta-models/Muse-Glimmer-30B-GGUF`, mientras que este repositorio es `nwtgck/Muse-Glimmer-30B-GGUF`; es necesario verificar el identificador antes de descargar.
- No se han publicado evaluaciones cuantitativas, por lo que el riesgo de alucinacion no puede acotarse con datos objetivos; se trata de un modelo generativo y ese riesgo existe por definicion.
- La cuantizacion Q4_K_M y Q4_K_XL implican perdida de precision respecto a bf16; el autor recomienda la variante Dynamic cuando se dispone de 32 GB de VRAM, lo que sugiere diferencias de calidad entre ambas.
- Los idiomas soportados no estan documentados, por lo que no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas distintos del ingles.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0, permisiva y apta para uso comercial, pero heredada del modelo base; conviene revisar tambien los terminos de `meta-models/Muse-Glimmer-30B`.
- El uso de la entrada de imagen obliga a cargar el encoder mmproj; sin el, los builds de texto son solo de texto.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo, por lo que no hay prensa, articulos tecnicos ni discusion independiente que permita contrastar las afirmaciones del autor.

## Enlaces
- Repositorio en HuggingFace de esta conversion GGUF: https://huggingface.co/nwtgck/Muse-Glimmer-30B-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Pull request de soporte de la arquitectura (fusionado el 10 de agosto de 2026): https://github.com/ggml-org/llama.cpp/pull/26841
- Releases de llama.cpp (se requiere b10353 o posterior): https://github.com/ggml-org/llama.cpp/releases
- Referencias arXiv citadas en las etiquetas del repositorio: https://arxiv.org/abs/2504.13181 y https://arxiv.org/abs/2602.06036
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos corresponden a paginas genericas de ChatGPT y no guardan relacion con Muse Glimmer.
