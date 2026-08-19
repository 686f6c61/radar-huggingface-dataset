# FlagRelease/Qwen3.8-27B-W4A8-arm-FlagOS-Express

## Resumen

El modelo `FlagRelease/Qwen3.8-27B-W4A8-arm-FlagOS-Express` es una versión cuantizada y empaquetada de un modelo de la familia Qwen3.8, publicada por FlagRelease. A pesar del nombre que sugiere 27 000 millones de parámetros, el archivo safetensors contiene 6 240 231 632 parámetros (aproximadamente 6,2 mil millones), lo que indica que el nombre comercial no coincide con el tamaño real del checkpoint. La cuantización es W4A8 (pesos de 4 bits, activaciones de 8 bits) con grupo de 128, en formato compressed-tensors, diseñada específicamente para ejecutarse en CPU Arm, concretamente en el Apple M5 Pro, mediante un runtime propio basado en vLLM 0.20.2, flagtree-cpu y FlagGems.

El modelo está pensado para inferencia local en hardware de Apple sin uso de GPU ni Metal, y se distribuye junto con un runtime precompilado que incluye scripts de despliegue listos para usar. La model card proporciona mediciones de rendimiento en un Apple M5 Pro de 18 núcleos, alcanzando 74,93 tokens/s en prefill y 12,73 tokens/s en decodificación para una carga de 512 tokens de prompt y 128 tokens generados. No se publican datos sobre el entrenamiento, la arquitectura interna, la licencia ni los idiomas soportados, por lo que la ficha se basa únicamente en la información disponible en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer por la familia Qwen3, pero no se especifica) |
| Parametros totales | 6 240 231 632 (segun safetensors; el nombre sugiere 27B pero no coincide) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el comando de ejemplo usa --max-model-len 1024, pero es configuracion del usuario) |
| Tipos de cuantizacion | W4A8 (GPTQ, group size 128, packed compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors packed) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo. El nombre sugiere que pertenece a la familia Qwen3.8, pero no se confirma si se trata de un transformer denso, MoE o híbrido. Tampoco hay datos sobre el dataset de entrenamiento, el numero de tokens, ni el proceso de alineacion (RLHF, DPO, etc.). La model card se centra exclusivamente en el aspecto de despliegue: se trata de un checkpoint cuantizado con GPTQ W4A8, grupo 128, donde las activaciones de entrada se cuantizan dinamicamente a INT8 por token y la capa `lm_head` se mantiene en BF16 y se prepara como W8A8 en el runtime. El modelo es solo de texto; no se habilitan vision ni MTP (multi-token prediction).

## Capacidades

- Generacion de texto y chat conversacional, con soporte de modo de razonamiento (thinking) que se extrae mediante el parser `qwen3` de vLLM, devolviendo el razonamiento en `message.reasoning` y la respuesta final en `message.content`.
- Inferencia exclusivamente en CPU Arm (Apple M5 Pro), sin uso de GPU, Metal o Docker.
- Integracion con el runtime FlagOS que incluye vLLM 0.20.2, flagtree-cpu, FlagGems y vLLM-Plugin-FL, con kernels nativos Arm SDOT/I8MM.
- No se mencionan capacidades de tool calling, function calling, agentes, vision, audio ni multimodalidad.

## Casos de uso

- Asistente local en Mac: el modelo puede desplegarse en un Mac con chip M5 Pro para ofrecer un asistente conversacional privado que no envia datos a la nube, aprovechando la CPU y la memoria unificada de 64 GiB.
- Generacion de texto en entornos sin GPU: al estar cuantizado y optimizado para CPU Arm, es adecuado para equipos de desarrollo o estaciones de trabajo Apple donde no se dispone de aceleradores graficos.
- Prototipado rapido de aplicaciones de chat: gracias al servidor compatible con OpenAI (`vllm serve`), se puede integrar con herramientas como AnythingLLM o clientes que usen la API de chat completions.
- Razonamiento y analisis de texto: el modo de razonamiento permite obtener explicaciones intermedias, util para tareas de depuracion de prompts o para aplicaciones que necesiten transparencia en la generacion.
- Educacion e investigacion: como modelo de 6B cuantizado, puede usarse en experimentos de NLP en local, sin necesidad de infraestructura en la nube.
- Despliegue en entornos con restricciones de hardware: al ejecutarse solo en CPU, es viable en maquinas virtuales o contenedores sin GPU, siempre que sean de arquitectura arm64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia en un Apple M5 Pro (18-core CPU, 64 GiB unified memory, 307 GB/s de ancho de banda) con el runtime FlagOS, para una carga de 512 tokens de prompt y 128 tokens generados:

| Workload | Valor |
|---|---|
| Prefill (pp512) | 74,93 tokens/s |
| Decode (tg128) | 12,73 tokens/s |
| Decode TPOT | 78,55 ms |
| Tiempo total (pp512 + tg128) | 16,81 s |
| Throughput total (640 tokens) | 38,07 tokens/s |

Estos valores corresponden a batch size 1 y a la configuracion exacta descrita en la model card. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- Hardware validado: Apple M5 Pro con 18 nucleos de CPU y 64 GiB de memoria unificada, con 307 GB/s de ancho de banda.
- Inferencia exclusivamente en CPU Arm; no se usa GPU, Metal ni Docker.
- El runtime requiere macOS arm64 y Python 3.11.
- La instalacion se realiza mediante un script que descarga e instala los componentes en `~/Library/FlagOS/`.
- Opciones de despliegue: servidor vLLM compatible con OpenAI (`vllm serve`), con configuracion de max-model-len y batch size limitados a 1024 tokens y 1 secuencia en el ejemplo.
- No se proporcionan estimaciones de VRAM porque no se usa GPU; el consumo de memoria es de la RAM unificada del sistema.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El nombre sugiere que podria compararse con Qwen3.8-27B, pero no se confirma ni se ofrecen datos de otros checkpoints. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo es solo de texto; no soporta vision, audio ni video.
- No se habilita MTP (multi-token prediction) en esta version.
- El runtime esta optimizado exclusivamente para Apple M5 Pro y macOS arm64; no se garantiza su funcionamiento en otros chips o sistemas operativos.
- No se indica la licencia, por lo que el uso comercial puede estar sujeto a restricciones desconocidas.
- No se publican datos sobre sesgos, alucinaciones ni limitaciones de idioma.
- El nombre del modelo ("27B") no coincide con el numero real de parametros (6,2B), lo que puede generar confusion.
- La longitud de contexto nativa no se especifica; el ejemplo de despliegue usa 1024 tokens, pero podria ser superior.
- El repositorio de HuggingFace tiene 0 descargas y 0 likes, y las fechas de creacion y actualizacion son de 2026, lo que sugiere que es un proyecto muy reciente o en fase alfa (version 0.1.0-alpha.1).

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/FlagRelease/Qwen3.8-27B-W4A8-arm-FlagOS-Express
- Repositorio del runtime FlagOS: https://github.com/kevinzs2048/flagos-macos-runtime
- Directorio de benchmarks del runtime: https://github.com/kevinzs2048/flagos-macos-runtime/tree/v0.1.0-alpha.1/benchmarks
- Guia de compilacion: https://github.com/kevinzs2048/flagos-macos-runtime/blob/v0.1.0-alpha.1/BUILDING.md
