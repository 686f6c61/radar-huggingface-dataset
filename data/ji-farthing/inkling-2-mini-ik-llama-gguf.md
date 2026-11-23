# ji-farthing/Inkling-2-Mini-ik-llama-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje de tipo transformer desarrollado por Thinking Machines, distribuido originalmente como checkpoint BF16/NVFP4 en Hugging Face bajo el identificador `thinkingmachines/Inkling-2-Mini`. Esta ficha documenta la version cuantizada en formato GGUF publicada por el usuario `ji-farthing`, que incluye ocho variantes de cuantizacion optimizadas para el runtime `ik_llama.cpp` (un fork de llama.cpp orientado a cuantizaciones de baja precision). El modelo cuenta con 26.070.385.152 parametros totales segun los safetensors del checkpoint original, lo que lo situa en la franja de 26B, y esta disenado exclusivamente para generacion de texto.

La relevancia de esta publicacion es doble. Por un lado, ofrece una via practica para ejecutar un modelo de 26B en hardware de consumo o en una sola GPU profesional, gracias a cuantizaciones que van desde 5,83 BPW (19,0 GB) hasta 1,99 BPW (6,5 GB). Por otro, incluye metricas de calidad objetivas (KLD, coincidencia de top token y perplejidad sobre wikitext-2) para cada variante, algo poco habitual en publicaciones de GGUF y muy util para decidir el compromiso entre tamano y fidelidad respecto al checkpoint BF16.

El checkpoint original emplea pesos NVFP4 en las capas 0-19 y MXFP8 en las capas 20-23, lo que sugiere un entrenamiento o ajuste orientado a precisiones bajas. La licencia Apache-2.0 se mantiene tanto en el modelo base como en estas cuantizaciones, lo que permite uso comercial sin restricciones adicionales. La model card no proporciona informacion sobre longitud de contexto nativa, idiomas soportados ni datos de entrenamiento; la configuracion de ejemplo del autor usa `-c 65536`, pero no se confirma que sea el maximo del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; pesos con modulos `attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`, `attn_rel`, `attn_sink_proj`, `attn_v_conv_proj`, expertos enrutados) |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo del autor usa 65.536 tokens) |
| Tipos de cuantizacion | NVFP4-FP8B128, IQ4_KS, IQ4_KT, IQ3_KS, IQ3_KT, IQ2_KS, IQ2_KT, IQ1_KT |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con `ik_llama.cpp`; no carga en llama.cpp estandar) |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura interna es limitada. Los nombres de tensores revelados en la receta de cuantizacion indican atencion con proyecciones separadas de query, key, value y output, ademas de modulos poco habituales como `attn_gate` (posible gating en la atencion), `attn_rel` (posible atencion relativa), `attn_sink_proj` (attention sinks) y `attn_v_conv_proj` (proyeccion convolucional sobre los values). La presencia de "expertos enrutados" (`exps`) confirma que se trata de una arquitectura de mezcla de expertos (MoE), aunque no se especifica el numero de expertos ni cuantos se activan por token.

El checkpoint de referencia distribuye sus pesos en precisiones mixtas: las capas 0-19 almacenan los expertos enrutados en NVFP4 y las capas 20-23 en MXFP8, mientras que el resto de tensores permanece en BF16 y F32. Esta estructura sugiere un proceso de entrenamiento o ajuste consciente de la cuantizacion, aunque la model card no detalla el volumen de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. El modelo base incluye una torre de vision segun el autor de la cuantizacion, pero no se ha incluido en estos GGUF, que son estrictamente de texto.

## Capacidades

- Generacion de texto conversacional: la model card etiqueta el repositorio como `conversational` y `text-generation`.
- Razonamiento y generacion de lenguaje general, segun la categoria del modelo base (no se detallan capacidades especificas en la informacion disponible).
- Compatibilidad con plantillas de chat mediante el flag `--jinja` de `llama-server`.
- Inferencia con expertos enrutados descargados a RAM del sistema (`-ot exps=CPU`), lo que permite ejecutar el modelo con VRAM limitada.
- Capacidades multimodales: el checkpoint original incluye una torre de vision, pero no esta presente en estos GGUF.
- Soporte de tool calling, agentes, thinking mode, audio o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con una sola GPU: la variante IQ4_KS (14,3 GB) permite ejecutar un modelo de 26B en GPUs de 16 GB o 24 GB, manteniendo una coincidencia de top token del 94,6 % respecto al BF16, adecuada para asistentes personales y experimentation.
- Servicio de chat en produccion con VRAM ajustada: la variante NVFP4-FP8B128 (19,0 GB) conserva el 97,8 % de coincidencia de top token y una KLD de 0,0024, por lo que es la opcion recomendada cuando se dispone de 24 GB de VRAM y se prioriza fidelidad al modelo original.
- Ejecucion en hardware de consumo con 8-12 GB de VRAM: las variantes IQ2_KS (8,6 GB) e IQ2_KT (7,8 GB) permiten cargar el modelo completo en GPUs como la RTX 3060 de 12 GB o la RTX 4060 Ti de 16 GB, a costa de una perplejidad mas alta (8,885 y 9,002 frente a 8,205 del BF16).
- Escenarios con RAM abundante y VRAM escasa: el flag `-ot exps=CPU` mantiene los expertos enrutados en memoria del sistema, de modo que un servidor con 64 GB de RAM y una GPU modesta puede servir el modelo IQ4_KS con latencia aceptable para uso interactivo.
- Procesamiento por lotes de texto de dominio general: la perplejidad medida sobre wikitext-2 (8,201 en BF16, 8,227 en IQ4_KS) indica que el modelo mantiene un modelado de lenguaje competitivo tras la cuantizacion, util para tareas de resumen, clasificacion o reescritura por lotes.
- Integracion en pipelines con `llama-server`: la compatibilidad con la API de endpoints de llama.cpp (`endpoints_compatible`) facilita su uso como backend de texto en aplicaciones existentes que ya consumen una API compatible con OpenAI.
- Investigacion sobre cuantizacion: la tabla de KLD y coincidencia de top token por variante convierte este repositorio en un caso de estudio util para evaluar el impacto de IQ1-IQ4 y NVFP4 en un modelo MoE de 26B.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Si incluye metricas de fidelidad de cuantizacion medidas sobre 16 fragmentos de 512 tokens de `wiki.test.raw` (wikitext-2), con el checkpoint BF16 como referencia (PPL 8,205), ejecutadas con `ik_llama.cpp` en una NVIDIA GB10 con `-ngl 99 -fa on`.

| Variante | Tamano | BPW | KLD | Same top | PPL |
|---|---:|---:|---:|---:|---:|
| NVFP4-FP8B128 | 19,0 GB | 5,83 | 0,0024 | 97,8 % | 8,201 |
| IQ4_KS | 14,3 GB | 4,38 | 0,0111 | 94,6 % | 8,227 |
| IQ4_KT | 13,4 GB | 4,12 | 0,0179 | 94,1 % | 8,277 |
| IQ3_KS | 11,7 GB | 3,58 | 0,0307 | 92,4 % | 8,377 |
| IQ3_KT | 10,7 GB | 3,27 | 0,0357 | 92,2 % | 8,383 |
| IQ2_KS | 8,6 GB | 2,65 | 0,1047 | 86,1 % | 8,885 |
| IQ2_KT | 7,8 GB | 2,40 | 0,1188 | 85,8 % | 9,002 |
| IQ1_KT | 6,5 GB | 1,99 | 0,2008 | 81,9 % | 9,719 |

El salto de calidad mas pronunciado se produce entre IQ3_KT (KLD 0,0357) e IQ2_KS (KLD 0,1047), lo que marca el umbral practico de cuantizacion agresiva para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 6,5 GB (IQ1_KT) y 19,0 GB (NVFP4-FP8B128) solo para los pesos; hay que anadir la cache KV, que depende del contexto configurado y no se ha publicado su tamano por token.
- GPU recomendadas: NVIDIA GB10 (usada por el autor para las mediciones), A100 y H100 para las variantes de mayor precision y contextos largos; RTX 4090 (24 GB) para NVFP4-FP8B128 o IQ4_KS; RTX 3090 (24 GB) e RTX 4080 (16 GB) para IQ4_KS e IQ4_KT.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB (IQ2_KS, IQ2_KT), RTX 4060 Ti de 16 GB (IQ4_KS, IQ3_KS) y RTX 4090 de 24 GB (todas las variantes).
- Opciones de despliegue: exclusivamente `ik_llama.cpp` en el commit `1180df7` o posterior (soporte de Inkling 2 Mini anadido en el PR #2967). No carga en llama.cpp estandar. El autor documenta `llama-server` con `-ngl 99 -fa on -c 65536 --jinja`.
- Estrategia con VRAM insuficiente: anadir `-ot exps=CPU` para mantener los expertos enrutados en RAM del sistema.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base frente a alternativas, por lo que la comparacion se limita a parametros, contexto y licencia. Los modelos comparables se han seleccionado por tamano (aproximadamente 24-32B) y por disponibilidad en formato abierto.

| Modelo | Parametros | Contexto | Licencia | Formato / runtime |
|---|---:|---|---|---|
| Inkling-2-Mini (esta ficha) | 26,07B | no disponible | Apache-2.0 | GGUF para `ik_llama.cpp` |
| Gemma 2 27B | 27B | 8.192 tokens | Gemma License (uso comercial con restricciones) | safetensors, GGUF |
| Qwen2.5 32B | 32,5B | 131.072 tokens | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ |
| Mistral Small 24B | 24B | 32.768 tokens | Apache-2.0 | safetensors, GGUF |

Inkling-2-Mini destaca por su licencia Apache-2.0 y por la existencia de cuantizaciones de muy baja precision con metricas de fidelidad publicadas; en cambio, su ecosistema de despliegue es mas restringido (solo `ik_llama.cpp`) y no se han publicado resultados de benchmarks que permitan comparar su calidad real frente a estos modelos.

## Limitaciones y advertencias

- No se han publicado datos de sesgos, alineacion ni evaluaciones de seguridad del modelo base ni de estas cuantizaciones.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones especificas en la informacion disponible.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera del ingles sin validacion previa.
- Longitud de contexto nativa no confirmada; el valor de 65.536 tokens del ejemplo es una configuracion del autor, no una especificacion del modelo.
- Las cuantizaciones IQ2 e IQ1 degradan notablemente la fidelidad (KLD de 0,1047 a 0,2008 y coincidencia de top token por debajo del 87 %); no se recomiendan para tareas que requieran precision alta.
- Los archivos no cargan en llama.cpp estandar ni en la mayoria de frontends que dependen de el (Ollama, LM Studio, etc.); requieren `ik_llama.cpp` en el commit `1180df7` o posterior.
- La torre de vision del checkpoint original no esta incluida; el modelo es solo de texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre estas cuantizaciones.
- La licencia Apache-2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el comportamiento del modelo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ji-farthing/Inkling-2-Mini-ik-llama-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint de referencia usado para la conversion: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Runtime ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- PR de soporte de Inkling 2 Mini en ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp/pull/2967
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Matriz de cuantizacion (imatrix): https://huggingface.co/ji-farthing/Inkling-2-Mini-ik-llama-GGUF/blob/main/inkling2-mini-r1.imatrix
