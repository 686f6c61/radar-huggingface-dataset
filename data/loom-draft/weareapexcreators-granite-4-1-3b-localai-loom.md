# loom-draft/weareapexcreators-Granite-4.1-3B-LocalAI-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y un fichero `model.json`) generado a partir del checkpoint GGUF `granite-4.1-3b-Q4_K_M.gguf` del modelo `weareapexcreators/Granite-4.1-3B-LocalAI`. El autor del paquete es `loom-draft`, y la generación se ha realizado con la herramienta `loom-next` sin intervención de un LLM en el bucle. El objetivo es ejecutar ese GGUF sobre GPUs AMD concretas: el APU AMD Ryzen AI Max+ 395 «Strix Halo» (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Granite 4.1 de 3B parámetros, cuantizado en Q4_K_M, con una ventana de contexto declarada de 131.072 tokens por petición y capacidad de tool calling en estilo OpenAI. El paquete expone un servidor compatible con `/v1/chat/completions`, admite 4 peticiones concurrentes y limita la salida a 4.096 tokens por preset.

La relevancia de esta ficha es acotada pero práctica: documenta una vía de ejecución de un modelo pequeño en hardware AMD consumer y profesional, con un formato de paquete reproducible y verificación de integridad por sha256. No obstante, la model card indica explícitamente que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, etc.) aún no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de su comportamiento numérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Granite 4.1; el paquete solo aporta programas Loom generados) |
| Parametros totales | 3B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`granite-4.1-3b-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Herramienta de generacion | `loom-next` (generador, sin LLM en el bucle) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `weareapexcreators/Granite-4.1-3B-LocalAI` ni sus datos de entrenamiento (número de tokens, composición del corpus, fases de RLHF/DPO). Lo único documentado es que se trata de un checkpoint GGUF cuantizado en Q4_K_M y que este repositorio lo empaqueta sin modificarlo («unmodified GGUF checkpoint»).

Lo que sí describe la model card es la capa de despliegue: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir de una configuración (`llm_config.json`), junto con el tokenizador (`tokenizer.json`) y un `model.json` con los ficheros fuente fijados por hash sha256, verificados por `loom-fetch`. El servidor `loom-serve` ofrece opciones de ajuste como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva del pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). No se documenta ninguna innovación de decodificación especulativa: la tabla de características marca «not applicable» en speculative decoding y en reasoning/thinking.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en estilo OpenAI, con soporte de `tools` y `tool_calls`.
- Contexto largo: 131.072 tokens por petición, adecuado para documentos extensos o historiales de conversación amplios.
- Concurrencia de 4 peticiones simultáneas con la misma salida que ejecuciones aisladas (según la puerta `consistency`, pendiente de re-medición).
- Bucle de tool calling multi-turno con renderizado exacto del prompt y reutilización del historial (puerta `agent`).
- Muestreo configurable con `temperature`, `top_k` y `seed` (puerta `sampling`).
- Lectura de logits en host (`llm.logits`) para inspección y comparación con llama.cpp (puerta `logits`).
- Capacidades multimodales: no determinadas («not determined» para imagen y audio).
- Modo de razonamiento/thinking: no aplicable.
- Idiomas soportados: no disponibles.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone un endpoint OpenAI, de modo que cualquier cliente compatible puede conectarse sin adaptadores adicionales.
- Automatización de herramientas internas: gracias al soporte de `tools` y `tool_calls`, el modelo puede encadenar llamadas a funciones (consultas a bases de datos, APIs internas) en un bucle multi-turno validado por la puerta `agent`.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por petición, encaja en tareas de resumen o extracción sobre contratos, informes o expedientes que no caben en ventanas de 8k-32k.
- Prototipado en hardware AMD sin CUDA: el paquete está generado específicamente para gfx1151 y gfx1201, lo que permite validar flujos de inferencia en equipos con APU Ryzen AI Max+ 395 o GPU R9700 sin depender de NVIDIA.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas de corrección (`golden`, `compare`, `sampling`, `logits`) diseñadas para contrastar token a token contra la referencia de llama.cpp sobre el mismo GGUF, útil en laboratorios que validan runtimes alternativos.
- Servicio de inferencia ligero con concurrencia moderada: 4 peticiones simultáneas y 4.096 tokens de salida por preset son suficientes para un equipo pequeño de desarrollo o un entorno de pruebas interno.
- Reproducibilidad de despliegues: la verificación sha256 de los ficheros fuente en `model.json.lock` permite auditar que los pesos servidos son exactamente los esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y que todas las puertas de corrección figuran como «not yet re-measured». No hay datos de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M de 3B parámetros; el hardware objetivo declarado incluye una GPU de 32 GB (R9700) y un APU con memoria unificada (Strix Halo), pero la card no publica el consumo real del pool.
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151). No se mencionan GPUs NVIDIA ni consumer de gama baja.
- Compatibilidad con GPU consumer: no confirmada; el paquete está generado para arquitecturas AMD concretas y no se documenta soporte para otras.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete (llama.cpp aparece solo como referencia de corrección).
- Opciones de servicio: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp están pendientes de re-medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-draft/weareapexcreators-Granite-4.1-3B-LocalAI-loom | 3B | 131.072 | Apache 2.0 | Paquete Loom (GGUF Q4_K_M) | Solo AMD gfx1151/gfx1201; sin benchmarks publicados |
| weareapexcreators/Granite-4.1-3B-LocalAI | 3B | no disponible | no disponible | GGUF | Modelo base del paquete; sin datos de rendimiento en la informacion disponible |
| llama.cpp (runtime de referencia) | no aplica | no disponible | MIT (runtime) | GGUF | Usado como referencia de corrección (`golden`, `compare`); no es un modelo |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de evidencia de rendimiento: todas las puertas de corrección y las tablas de rendimiento frente a llama.cpp figuran como «not yet re-measured»; no hay garantía publicada de que la salida coincida con la referencia.
- Alcance de hardware muy restringido: el paquete está generado para gfx1151 y gfx1201; no se documenta funcionamiento en otras GPUs, incluido hardware NVIDIA.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe ni en castellano.
- Capacidades multimodales inciertas: imagen y audio figuran como «not determined».
- Sin modo de razonamiento ni decodificación especulativa: no apto para flujos que dependan de thinking mode o de aceleración especulativa.
- Límite de salida de 4.096 tokens por preset: puede ser insuficiente para generación de documentos largos en una sola respuesta.
- Concurrencia limitada a 4 peticiones: no adecuado para cargas de producción con alta concurrencia sin escalado horizontal.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de 3B, la fiabilidad en tareas de razonamiento complejo es intrínsecamente limitada.
- Licencia Apache 2.0 declarada en el paquete, pero la licencia y condiciones del modelo base `weareapexcreators/Granite-4.1-3B-LocalAI` no se detallan en la información disponible; conviene verificarlas antes de uso comercial.
- Repositorio sin descargas ni likes y creado en 2026-11-19: no hay evidencia de uso en producción ni de mantenimiento por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/weareapexcreators-Granite-4.1-3B-LocalAI-loom
- Modelo base: https://huggingface.co/weareapexcreators/Granite-4.1-3B-LocalAI
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
