# loom-draft/Qwen-Qwen1.5-0.5B-Chat-loom

## Resumen

Qwen1.5-0.5B-Chat-loom es un paquete de despliegue en formato Loom para el checkpoint Q4_K_M del modelo Qwen1.5-0.5B-Chat de Alibaba Cloud, empaquetado por el autor `loom-draft`. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los del GGUF original de Qwen, sin modificar. Lo que aporta el paquete es un conjunto de programas `.loom` y una tarjeta `model.json` que permiten servir el modelo a través de Loom (`loom-serve`) sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo base es un transformer decoder-only de 0,5 mil millones de parametros, la variante mas pequena de la familia Qwen1.5, afinada para chat mediante instrucciones. Su interes practico esta en su huella minima: cabe holgadamente en GPUs de consumo y en aceleradores integrados, y sirve como pieza de pruebas, prototipado rapido o componente auxiliar (por ejemplo, borrador en decodificacion especulativa, aunque en este paquete esa funcion no esta habilitada).

La relevancia de esta ficha no reside en el modelo en si, sino en el entorno de ejecucion: el autor publica mediciones comparativas frente a llama.cpp ROCm sobre Strix Halo, con mejoras de hasta el 141 % en prefill y del 43 % en throughput agregado con cuatro flujos. Es, por tanto, un artefacto orientado a evaluar el rendimiento del runtime Loom sobre hardware AMD, no un modelo recomendado para tareas de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen1.5), pesos del GGUF original sin modificar |
| Parametros totales | 0,5 mil millones (modelo base Qwen1.5-0.5B-Chat) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 32k tokens en las pruebas publicadas (configuracion de llama.cpp con `-c 65536`); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF dentro de paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen1.5-0.5B-Chat, un transformer decoder-only denso de aproximadamente 0,5 mil millones de parametros, publicado por Alibaba Cloud como parte de la familia Qwen1.5 y afinado para conversacion. La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card original de Qwen, que no se incluye en este paquete.

El paquete Loom no modifica los pesos: envuelve el GGUF `qwen1_5-0_5b-chat-q4_k_m.gguf` con programas de servicio generados por `loom-next` (el generador, sin LLM en el bucle) y una tarjeta de configuracion. La innovacion tecnica esta en el runtime: `loom-serve` expone una API compatible con `/v1/chat/completions` de OpenAI, con opciones de espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). No hay cabeza MTP en el GGUF ni borrador publicado para este modelo exacto, por lo que la decodificacion especulativa queda deshabilitada en las mediciones.

## Capacidades

- Generacion de texto conversacional en formato chat multi-turno mediante API compatible con OpenAI.
- Respuesta a instrucciones propias de un modelo afinado para chat de 0,5B; capacidad de razonamiento limitada por el tamano.
- Generacion de codigo basica y aritmetica simple, sin garantias de fiabilidad en tareas complejas.
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Modo de razonamiento o thinking: no aplicable.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Capacidades multimodales (vision, audio): no disponibles.
- Soporte multilingue: no documentado en la informacion proporcionada.
- Despliegue en GPUs AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) mediante `loom-serve`.

## Casos de uso

- Evaluacion comparativa de runtimes en AMD: servir este paquete con `loom-serve` y comparar decode y prefill frente a llama.cpp ROCm sobre Strix Halo o R9700, reproduciendo la metodologia del autor (medianas de 6 sesiones, mismos prompts y mismo runner).
- Pruebas de integracion de la API OpenAI: validar pipelines que consumen `/v1/chat/completions` (clientes HTTP, orquestadores, frameworks de agentes) sin coste de GPU grande, ya que el modelo Q4_K_M ocupa muy poca memoria.
- Prototipado de chatbots ligeros en local: conversaciones multi-turno con contexto corto o medio en un equipo con GPU AMD integrada, util para demos y entornos de desarrollo.
- Generacion de texto auxiliar de bajo coste: resumenes breves, clasificacion de mensajes o respuestas plantilla en herramientas internas donde la latencia importa mas que la calidad linguistica.
- Banco de pruebas de cuantizacion y memoria: verificar el comportamiento de `--pool_backing=fixed` y `--parameter_mode=preload` con un modelo pequeno antes de pasar a checkpoints mayores en el mismo runtime.
- Docencia y experimentacion: estudiar el flujo completo de fetch, materializacion y servicio (`loom-fetch` con `--materialize=copy`, luego `loom-serve`) en un modelo de 0,5B que no exige infraestructura dedicada.
- Borrador para decodificacion especulativa en investigacion: aunque este paquete no incluye drafter ni cabeza MTP, el checkpoint base es un candidato natural como modelo borrador de bajo coste en experimentos propios.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en Strix Halo (gfx1151), comparando Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374` con el mismo GGUF, mismos prompts y mismas condiciones. Valores en tokens por segundo.

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode, prompt corto | 309,8 | 338,2 | +9 % |
| Decode, contexto 2k | 219,2 | 235,2 | +7 % |
| Decode, contexto 32k | no medido | no medido | no medido |
| Prefill, documento 1k | 13997,5 | 21608,1 | +54 % |
| Prefill, documento 2k | 12359,0 | 22721,8 | +84 % |
| Prefill, documento 8k | 7189,0 | 16459,0 | +129 % |
| Prefill, documento 16k | 4501,3 | 10828,8 | +141 % |
| Prefill, documento 32k | no medido | 5328,2 | no medido |
| 4 flujos, decode agregado | 821,5 | 1171,5 | +43 % |
| Decodificacion especulativa, tokens aceptados | no aplica | no aplica | no aplica |

Para la Radeon AI PRO R9700 (gfx1201, 32 GB) el autor indica que los resultados de este paquete aun no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores son exclusivamente de rendimiento de inferencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 0,5B ocupa del orden de 0,4 GB en pesos; con overhead de runtime y contexto de 32k el consumo real depende de la implementacion de KV cache de Loom, no cuantificado en la informacion proporcionada.
- GPUs validadas por el autor: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: por tamano, el modelo cabe en cualquier GPU con 2 GB o mas de VRAM; no se documentan pruebas en GPUs NVIDIA ni en Radeon de consumo en este paquete.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch huggingface:loom-draft/Qwen-Qwen1.5-0.5B-Chat-loom:chat --materialize=copy --output=qwen1.5-0.5b-chat` y `loom-serve --model=qwen1.5-0.5b-chat '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Throughput medido en Strix Halo: 338,2 tok/s en decode con prompt corto, 235,2 tok/s con contexto de 2k, 21608,1 tok/s de prefill con documento de 1k y 1171,5 tok/s agregados con cuatro flujos.
- Latencia: no publicada de forma explicita; puede derivarse de los valores de decode y prefill anteriores.
- Alternativas de despliegue: el GGUF original es compatible con llama.cpp, Ollama y otros runtimes GGUF; este paquete concreto esta atado al runtime Loom y a las GPUs AMD indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen1.5-0.5B-Chat-loom (este paquete) | 0,5B | hasta 32k en pruebas | MIT | GGUF Q4_K_M en paquete Loom, solo AMD gfx1151/gfx1201 | Optimizado para Loom; sin benchmarks de calidad publicados |
| Qwen1.5-0.5B-Chat (GGUF original) | 0,5B | no disponible en la informacion | MIT (Qwen1.5) | GGUF, llama.cpp/Ollama | Mismo modelo sin envoltorio Loom; sirve de referencia en las mediciones |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la informacion | no disponible en la informacion | safetensors, GGUF | Generacion posterior de la familia; no evaluado en esta informacion |

No se dispone de datos comparativos de calidad (benchmarks) entre estas alternativas en la informacion proporcionada; la comparacion se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad de razonamiento, conocimiento factual y calidad de codigo muy limitadas; no apto para tareas que requieran precision alta.
- Riesgo elevado de alucinacion y de respuestas genericas o incoherentes en conversaciones largas o dominios especializados.
- Sin soporte de tool calling ni de modo de razonamiento segun la tabla de caracteristicas del paquete.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- El paquete esta atado al runtime Loom (`hrx-loom==0.2.0`) y a dos GPUs AMD concretas; no hay validacion en otras plataformas.
- Los pesos son los del GGUF original sin modificar; cualquier limitacion del modelo base Qwen1.5-0.5B-Chat aplica integramente.
- Licencia MIT declarada en el paquete; conviene verificar los terminos del modelo base Qwen1.5 antes de uso comercial.
- Cero descargas y cero likes en el momento de la consulta: artefacto reciente y sin validacion independiente por parte de la comunidad.
- Las mediciones de rendimiento proceden de un unico entorno (DevLab Dispatch, runner X2-LA03-S01-D07, 2026-11-27) y el propio autor advierte que los runners difieren entre sesiones; los margenes de +-3 % se consideran empate.
- La fila de prefill a 32k solo tiene valor para Loom (5328,2 tok/s) y no para llama.cpp, por lo que no hay margen calculado en ese punto.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/Qwen-Qwen1.5-0.5B-Chat-loom
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat-GGUF
- Repositorio del runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia de DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/46044808523
