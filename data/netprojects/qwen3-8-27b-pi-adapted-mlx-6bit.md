# netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit

## Resumen

Qwen3.8-27B-pi-adapted-MLX-6bit es una distribucion cuantizada a 6 bits del modelo Qwen3.8-27B de Alibaba Qwen, adaptado mediante LoRA con aprendizaje por refuerzo (AsyncGRPO en TRL) por harness-hub para funcionar como motor del agente de programacion pi (earendil-works/pi). Esta build concreta, publicada por el usuario netprojects, fusiona el adaptador LoRA sobre el modelo base y lo convierte al formato MLX para ejecucion nativa en Apple Silicon, incluyendo el codificador visual y la capa MTP (multi-token prediction) original de Qwen.

El modelo resuelve el problema de disponer de un agente de codificacion y terminal local, sin dependencia de APIs en la nube, sobre hardware de consumo de Apple. Con 27.781.427.952 parametros totales (27,78 mil millones) y un peso de repositorio de 23,1 GB, la cuantizacion 6-bit (affine, group 64) sobre las capas lineales reduce el tamano a menos de la mitad del build bf16 (55,6 GB) manteniendo un 99,0% de coincidencia en el siguiente token respecto a bf16 y una divergencia KL de solo 0,0015.

Es relevante ahora porque demuestra que el ajuste fino con RL sobre tareas de ingenieria de software (SWE-bench Pro, Terminal-Bench) puede empaquetarse en un artefacto ejecutable en un Mac, con soporte de tool calling en formato XML de Qwen y una mejora documentada de hasta 33 puntos porcentuales en SWE-bench Pro hard 51 frente al modelo base. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP (multi-token prediction), base Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine, group size 64 (build principal); familia disponible en 8-bit, 4-bit, 3-bit, 2.5-bit (solo texto), bf16 y adaptador LoRA |
| Idiomas soportados | no disponible (la model card no detalla el listado de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx; incluye `model-mtp.safetensors` para la capa MTP) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.8-27B, un transformer multimodal de 27,78 mil millones de parametros con codificador visual y una capa MTP propia de Qwen que actua como modelo borrador para decodificacion especulativa. El adaptador LoRA de harness-hub se entreno con aprendizaje por refuerzo, concretamente AsyncGRPO implementado en TRL, orientado a tareas de ingenieria de software y de terminal dentro del agente pi. Esta build fusiona ese adaptador (revision `e786f84`) sobre el modelo base Qwen/Qwen3.8-27B (revision `3756181`) y convierte el conjunto a MLX mediante mlx-vlm, cuantizando las capas lineales a 6 bits con esquema affine y group size 64. El tokenizador y la plantilla de chat se conservan sin cambios respecto al modelo de harness-hub, por lo que el vocabulario y el formato de tool calls son identicos a los de Qwen3.8-27B.

La innovacion tecnica destacable es doble. Por un lado, la capa MTP original de Qwen se conserva cuantizada de forma coherente con el resto del modelo y puede usarse como draft model integrado en mlx-vlm pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`. Por otro, la model card recomienda DSpine (drafter de 4 bits, block 5) a traves de dspine-hybrid-mlx como alternativa de decodificacion especulativa, que en esta build 6-bit alcanza aproximadamente 2,3x de aceleracion (52 tok/s frente a 23 tok/s en decodificacion plana), mientras que MTP no aporta mejora con mlx-vlm 0.7.11 sobre pesos de 6 bits (22 tok/s, factor 0,96). Ambos metodos verifican cada token propuesto con el modelo completo, de modo que con decodificacion greedy el texto coincide con la decodificacion plana.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Generacion y edicion de codigo en tareas de ingenieria de software, con especial enfasis en resolucion de bugs y modificaciones de repositorio.
- Operacion como agente de terminal: ejecucion de comandos, lectura de salida y diagnostico de errores en flujos multi-paso.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Entrada multimodal image-text-to-text: procesamiento de imagenes como capturas de pantalla de terminal mediante mlx-vlm.
- Modo thinking desactivable; el adaptador fue entrenado y evaluado con thinking off y la model card recomienda mantenerlo desactivado.
- Reduccion del numero de llamadas a herramientas por tarea (55-64% menos segun los resultados publicados por harness-hub).
- Decodificacion especulativa mediante capa MTP integrada o mediante el drafter externo DSpine.

## Casos de uso

- Reparacion de tests fallidos en local: el modelo puede recibir el contenido de un fichero de tests, ejecutar el runner a traves de tool calling, interpretar la traza de error y proponer el parche, aprovechando su entrenamiento especifico en Terminal-Bench y SWE-bench Pro. Es adecuado porque el adaptador fue ajustado precisamente sobre este tipo de bucles.
- Agente de terminal autonomo en un Mac: integrado en pi mediante un servidor OpenAI-compatible de mlx-lm, el modelo encadena comandos de shell, inspecciona ficheros y corrige errores en varios pasos con menos llamadas a herramientas que el modelo base.
- Asistente de refactorizacion en repositorios medianos: con 27,78 mil millones de parametros y soporte de contexto largo del modelo base, puede mantener el estado de una tarea de refactorizacion multi-archivo dentro de una sesion de agente.
- Analisis de capturas de terminal o de errores visuales: gracias al pipeline image-text-to-text, se le puede pasar una captura de pantalla de una terminal y preguntar que error muestra, util para soporte tecnico o triaje de incidencias.
- Automatizacion de tareas de CI en estaciones de trabajo Apple: servir el modelo con `mlx_lm.server` y conectarlo a scripts que invoquen el endpoint `/v1/chat/completions` para triaje de fallos de build antes de escalar a un runner remoto.
- Prototipado de agentes de codigo sin coste de API: al ser Apache 2.0 y ejecutarse en local, sirve para experimentar con bucles de agente, evaluacion de prompts y comparativas de estrategias de tool calling sin dependencia de proveedores externos.
- Evaluacion de estrategias de decodificacion especulativa: la disponibilidad de builds en 2,5, 3, 4, 6, 8 bits y bf16, junto con MTP y DSpine, permite medir el compromiso entre fidelidad, tamano y throughput en hardware Apple concreto.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo el agente pi y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |

Fidelidad de las cuantizaciones respecto a bf16 (builds de netprojects):

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 8-bit | 30,0 GB | 99,1% | 0,0004 |
| 6-bit (esta build) | 23,1 GB | 99,0% | 0,0015 |
| 4-bit | 16,3 GB | 95,6% | 0,0201 |
| 3-bit | 13,8 GB | 91,4% | 0,0884 |
| 2,5-bit (solo texto) | 11,8 GB | 85,5% | 0,2363 |
| bf16 | 55,6 GB | referencia | referencia |

Throughput medido por el autor (greedy, thinking off, 5 prompts x 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en ejecucion en el Mac, por lo que son valores indicativos):

| Build | Plana | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4-bit, block 5) |
|---|---|---|---|
| 4-bit | 33 tok/s | 61 tok/s (x1,84) | 70 tok/s (x2,25) |
| 6-bit | 23 tok/s | 22 tok/s (x0,96) | 52 tok/s (x2,32) |
| 8-bit | 18 tok/s | 41 tok/s (x2,24) | 54 tok/s (x3,05) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta build cuantizada en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 23,1 GB de pesos en 6 bits, mas overhead de contexto y del codificador visual; se recomienda un Mac con 32 GB de memoria unificada o superior para uso comodo.
- Hardware objetivo: Apple Silicon exclusivamente (libreria MLX). No es ejecutable en GPU NVIDIA ni AMD sin reconversion.
- Modelos de 24 GB: las builds de 3 bits (13,8 GB) y 2,5 bits solo texto (11,8 GB) caben en Macs de 24 GB segun la model card; la de 6 bits no.
- Despliegue: `mlx_lm.server` (servidor compatible con OpenAI, requiere mlx-lm >= 0.32.2) para texto y tool calling; `mlx_vlm.generate` (mlx-vlm >= 0.7.11) para entrada de imagenes. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Aceleracion: MTP integrado sin mejora en 6 bits con mlx-vlm 0.7.11; DSpine con drafter de 4 bits recomendado para velocidad (unas 2,3x).
- Throughput de referencia en 6 bits: 23 tok/s en decodificacion plana y 52 tok/s con DSpine, medido por el autor en un Mac no especificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,78 mil millones | no disponible | MLX 6-bit, Apple Silicon | Apache 2.0 | Ajustado con RL para el agente pi; 55,8% en Terminal-Bench 2.1 |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit | 27,78 mil millones | no disponible | MLX 8-bit, Apple Silicon | Apache 2.0 | Mayor fidelidad (KL 0,0004) y mejor throughput con DSpine, pero 30,0 GB |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,78 mil millones | no disponible | MLX 4-bit, Apple Silicon | Apache 2.0 | 16,3 GB, cabe en mas Macs; fidelidad menor (95,6% de coincidencia) |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | no disponible | safetensors bf16, multiplataforma | no disponible en la informacion | Referencia de los benchmarks; sin el ajuste RL para pi |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia exclusiva de Apple Silicon y de la libreria MLX: no se puede desplegar en servidores con GPU NVIDIA sin reconvertir los pesos.
- El adaptador se entreno y evaluo con thinking desactivado; activar el modo thinking puede degradar el comportamiento esperado y no esta validado.
- La API de referencia es Chat Completions, no Responses; usar la API incorrecta en el cliente puede romper el formato de tool calls.
- La cuantizacion 6-bit introduce una divergencia medible (KL 0,0015, 99,0% de coincidencia en el siguiente token); para tareas de alta precision puede ser preferible la build 8-bit o bf16.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible; en tareas de codigo puede generar APIs o rutas inexistentes.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Cobertura linguistica no documentada; la model card no lista idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto no disponible en la informacion proporcionada; conviene consultar la model card del modelo base Qwen3.8-27B antes de disenar flujos con documentos largos.
- Las cifras de throughput proceden de mediciones del autor con otros servicios en ejecucion en la misma maquina y deben tratarse como indicativas.
- MTP no aporta aceleracion en esta build con mlx-vlm 0.7.11; no asumir ganancias de velocidad sin medir con DSpine.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador de harness-hub antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build 2,5-bit (solo texto): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- Agente pi: https://github.com/earendil-works/pi
