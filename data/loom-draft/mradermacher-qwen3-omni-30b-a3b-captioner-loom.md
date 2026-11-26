# loom-draft/mradermacher-Qwen3-Omni-30B-A3B-Captioner-loom

## Resumen

`loom-draft/mradermacher-Qwen3-Omni-30B-A3B-Captioner-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/Qwen3-Omni-30B-A3B-Captioner-GGUF`, concretamente la cuantizacion `Qwen3-Omni-30B-A3B-Captioner.Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta pensado para ejecutarse sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genero con `loom-next` de forma automatica, sin intervencion de un LLM en el bucle.

El modelo subyacente es Qwen3-Omni-30B-A3B en su variante Captioner, es decir, un modelo omnicanal de Qwen con 30 000 millones de parametros totales y 3 000 millones activos (arquitectura MoE), afinado para tareas de generacion de descripciones. Conviene subrayar que este paquete Loom no expone las capacidades de imagen y audio del modelo original: la tabla de caracteristicas de la model card marca explicitamente "not supported by Loom (the upstream model has it)" tanto para entrada de imagen como para entrada/salida de audio. Lo que si ofrece es una API compatible con OpenAI (`/v1/chat/completions`), tool calling, modo de razonamiento activable y una ventana de 65 536 tokens por peticion.

La relevancia de esta ficha es acotada: se trata de un artefacto de empaquetado para el ecosistema Loom sobre hardware AMD, no de un modelo nuevo. Las mediciones de rendimiento y los resultados de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU, por lo que no hay evidencia publicada de su comportamiento numerico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (Qwen3-Omni-30B-A3B, variante Captioner); empaquetado Loom para AMD |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | 3 000 millones (3B) |
| Longitud de contexto | 65 536 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del checkpoint base no confirmadas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Qwen3-Omni-30B-A3B-Captioner.Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json` |
| Salida maxima | 4096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Tool calling | Si (estilo OpenAI: `tools` y `tool_calls`) |
| Modo razonamiento | Si, activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Decodificacion especulativa | No aplicable en este paquete |
| Entrada de imagen | No soportada por Loom (el modelo original si la tiene) |
| Entrada/salida de audio | No soportada por Loom (el modelo original si la tiene) |
| Muestreo | No determinado ("not determined") |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Qwen3-Omni de Qwen, con una arquitectura Mixture-of-Experts de 30B parametros totales y 3B activos por token. La variante Captioner esta afinada para generar descripciones, y en su forma original es multimodal (imagen y audio). Esta ficha no dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineacion; esa informacion no aparece en la model card proporcionada ni en los resultados de busqueda, que son irrelevantes (corresponden a la herramienta de grabacion de pantalla Loom, a una marca de ropa y al articulo de Wikipedia sobre el telar).

El paquete Loom en si no modifica los pesos: la model card indica que se parte del checkpoint GGUF "unmodified" y que la generacion se realizo con `loom-next` (solo el generador, sin LLM en el bucle). Lo que anade el paquete es una capa de ejecucion: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, un servidor compatible con OpenAI, gestion de pool de memoria (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). No hay innovaciones de decodificacion especulativa en este paquete: la tabla de caracteristicas la marca como no aplicable.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable por peticion mediante `chat_template_kwargs`.
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas segun la puerta `agent` descrita en la model card.
- Conversacion multi-turno con historial reutilizado (la puerta `agent` verifica "exact prompt rendering, history reuse").
- Ventana de contexto de 65 536 tokens por peticion, adecuada para documentos largos (la puerta `golden` menciona documentos de 1k a 32k).
- Concurrencia de hasta 4 peticiones simultaneas con salida consistente (puerta `consistency`).
- API compatible con OpenAI en `/v1/chat/completions`, lo que facilita la integracion con clientes y SDK existentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: el modelo original los soporta, pero este paquete Loom no los expone.

## Casos de uso

- Generacion de descripciones de texto a partir de documentos largos: con 65 536 tokens de contexto por peticion, el modelo puede recibir articulos, informes o transcripciones extensas y producir resumenes o pies de figura descriptivos en una sola pasada, sin trocear el material.
- Asistentes conversacionales multi-turno en infraestructura AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o Radeon AI PRO R9700, ofreciendo un endpoint compatible con OpenAI que cualquier cliente existente puede consumir sin adaptadores propios.
- Automatizacion con herramientas en pipelines internos: el soporte de `tools` y `tool_calls` permite construir agentes que consulten APIs, bases de datos o servicios internos, con el bucle multi-turno validado por la puerta `agent` del banco de pruebas.
- Prototipado y evaluacion en hardware de escritorio AMD: al estar empaquetado para gfx1151 y gfx1201, permite probar un MoE de 30B en un equipo con Ryzen AI Max+ 395 sin depender de CUDA ni de GPU de datacenter.
- Tareas de razonamiento con control de coste: al poder desactivar el modo thinking por peticion, se puede usar el mismo servidor para consultas rapidas (thinking off) y para problemas que requieran cadena de razonamiento (thinking on), ajustando la latencia segun el caso.
- Servicio de inferencia con concurrencia moderada: con 4 peticiones simultaneas y salida maxima de 4096 tokens, encaja en backends de herramientas internas, bots de documentacion o asistentes de equipo con carga baja o media.
- Evaluacion comparativa frente a llama.cpp: las puertas `golden`, `compare` y `logits` estan disenadas para contrastar token a token la salida del paquete Loom con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace util como banco de pruebas de la propia pila Loom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento y las puertas de correccion no se han vuelto a medir ("not yet re-measured") ni en Strix Halo (gfx1151) ni en Radeon AI PRO R9700 (gfx1201). Las puertas listadas son:

| Puerta | Descripcion | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|---|
| `kernel_tests` | Tests unitarios de los kernels generados frente a implementaciones de referencia | no medida | no medida |
| `golden` | Referencia llama.cpp sobre el mismo GGUF: tokens greedy y top-5 log-probs, prompts cortos y documentos de 1k-32k | no medida | no medida |
| `compare` | Salida greedy frente a la referencia llama.cpp, token a token | no medida | no medida |
| `consistency` | Peticiones concurrentes con la misma salida que ejecutadas por separado | no medida | no medida |
| `spec` | Decodificacion especulativa activada con salida identica a desactivada | no medida | no medida |
| `agent` | Bucle multi-turno de tool calling: renderizado de prompt, reutilizacion de historial, validez de llamadas | no medida | no medida |
| `agent_think_off` | Bucle de tool calling con thinking desactivado | no medida | no medida |
| `sampling` | temperature, top_k y seed segun especificacion; distribucion del primer token frente a llama.cpp | no medida | no medida |
| `logits` | Lectura de logits en host: argmax por fila, top-k frente a llama.cpp, texto greedy sin cambios | no medida | no medida |
| `decision` | Respuestas de decision (choice, score, noul probabilities) frente a llama.cpp | no medida | no medida |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de 30B parametros totales; el paquete declara como objetivo la Radeon AI PRO R9700 con 32 GB y el Ryzen AI Max+ 395 "Strix Halo", cuyo subsistema grafico comparte memoria del sistema.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPU NVIDIA ni otras arquitecturas en la model card.
- Cabe en GPU de consumo: el paquete esta dirigido a hardware AMD con memoria unificada o 32 GB de VRAM; no se confirma compatibilidad con GPU de consumo de gama media ni con CUDA.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` instalado con pipx; `loom-fetch` para materializar el paquete desde Hugging Face y `loom-serve` para servirlo. Parametros relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles. La model card no incluye cifras de tokens por segundo ni de tiempo hasta el primer token para este paquete.
- Concurrencia: 4 peticiones simultaneas segun la tabla de caracteristicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/mradermacher-Qwen3-Omni-30B-A3B-Captioner-loom` | 30B totales, 3B activos (MoE) | 65 536 tokens | MIT | Paquete Loom (`.loom` + `model.json`) sobre GGUF Q4_K_M; AMD gfx1151 y gfx1201 | Sin vision ni audio en Loom; sin mediciones publicadas |
| `mradermacher/Qwen3-Omni-30B-A3B-Captioner-GGUF` | 30B totales, 3B activos (MoE) | no disponible | MIT (segun el paquete derivado) | GGUF; ejecutable con llama.cpp | Checkpoint de origen, sin modificar; conserva las capacidades del modelo original |
| Qwen3-Omni-30B-A3B (modelo original) | 30B totales, 3B activos (MoE) | no disponible en esta ficha | no disponible en esta ficha | Pesos originales | Incluye vision y audio; esta ficha no dispone de sus datos de entrenamiento ni benchmarks |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El paquete no expone las capacidades multimodales del modelo original: la entrada de imagen y la entrada/salida de audio estan marcadas como no soportadas por Loom, aunque el modelo subyacente si las tenga.
- No hay mediciones publicadas de rendimiento ni de correccion para este paquete en ninguna de las dos GPU objetivo; todas las puertas figuran como "not yet re-measured". No debe asumirse equivalencia con llama.cpp sin ejecutar las puertas.
- El muestreo figura como "not determined" en la tabla de caracteristicas, lo que impide garantizar el comportamiento de `temperature`, `top_k` y `seed` sin verificacion previa.
- La salida maxima esta limitada a 4096 tokens por peticion mediante el preset `max_tokens`, muy por debajo de la ventana de contexto de 65 536 tokens.
- La concurrencia esta limitada a 4 peticiones simultaneas, lo que restringe su uso en produccion con carga alta.
- El paquete esta orientado exclusivamente a hardware AMD (gfx1151 y gfx1201); no se documenta compatibilidad con CUDA ni con otras GPU.
- Riesgo de alucinacion y sesgos conocidos: no disponibles en la informacion proporcionada; no se han publicado evaluaciones al respecto para este paquete.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento en castellano ni en otros idiomas.
- La licencia MIT se declara tanto en el paquete como en la model card, pero esta ficha no ha verificado las condiciones del checkpoint base ni de los pesos originales de Qwen3-Omni.
- La fecha de creacion del repositorio (2026-11-26) y el hecho de que no tenga descargas ni likes sugieren un artefacto reciente y sin validacion por parte de la comunidad.
- Los resultados de busqueda web asociados a este modelo corresponden a servicios y marcas ajenas (Loom.com, Loom.fr, Wikipedia); no aportan informacion tecnica sobre el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Qwen3-Omni-30B-A3B-Captioner-loom
- Checkpoint GGUF de origen: https://huggingface.co/mradermacher/Qwen3-Omni-30B-A3B-Captioner-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
