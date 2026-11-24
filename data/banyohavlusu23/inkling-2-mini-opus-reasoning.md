# banyohavlusu23/Inkling-2-Mini-Opus-Reasoning

## Resumen

Inkling-2-Mini-Opus-Reasoning es un adaptador LoRA (PEFT) publicado por el usuario banyohavlusu23 que se aplica sobre el modelo base thinkingmachines/Inkling-2-Mini. Su objetivo es reducir la longitud de las trazas de razonamiento del modelo base sin degradar la correccion de las respuestas: el autor reporta una reduccion de 4,4 veces en tokens de pensamiento en tareas de codigo (de 645 a 147 de media) manteniendo 20/20 tests superados, y de 2,7 veces en prompts generales (de 2.648 a 983 tokens) sobre cinco prompts mixtos.

El adaptador se entrena mediante SFT sobre trazas de razonamiento cortas destiladas de modelos Opus, con un rango LoRA de 32 aplicado unicamente a las capas de atencion, usando la plataforma Tinker de Thinking Machines. El resultado es un modelo que conserva las capacidades del base pero con un modo de "razonamiento conciso", lo que reduce coste de inferencia y latencia en produccion.

Es relevante ahora porque el coste por token de salida en modelos con modo pensamiento es el principal lastre economico en despliegues de agentes y pipelines de codigo. Un adaptador de 19,5 millones de parametros (0,1 GB de repo) que recorta el pensamiento sin perder acierto es una via barata de optimizar inferencia sin cambiar de modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base Inkling-2-Mini; rango 32, solo capas de atencion |
| Parametros totales | 19.562.496 (adaptador LoRA); parametros del base no disponibles |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento uso max length 8.192) |
| Tipos de cuantizacion | GGUF F16 para el adaptador (`Inkling-2-Mini-Opus-Reasoning-LoRA-F16.gguf`); cuantizaciones del base segun unsloth/Inkling-2-Mini-GGUF (p. ej. Q4_K_XL) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT, `adapter_model.safetensors`) y GGUF (adaptador para llama.cpp `--lora`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado exclusivamente a las capas de atencion del modelo base Inkling-2-Mini (Thinking Machines). No se modifica ni se redistribuye el modelo base; el adaptador se carga encima mediante PEFT en Transformers, o como LoRA en llama.cpp/Ollama sobre una cuantizacion GGUF del base (recomendado `unsloth/Inkling-2-Mini-GGUF:Q4_K_XL`).

El entrenamiento fue SFT de 1 epoca (327 pasos), learning rate 5e-4 con decaimiento lineal, batch de 32 y longitud maxima de 8.192 tokens, ejecutado en Tinker. El dataset consta de 10.464 filas (7,5 millones de tokens) deduplicadas, compuesto por tres conjuntos de trazas de razonamiento de modelos Opus: `Roman1111111/claude-opus-4.6-10000x`, `lordx64/reasoning-distill-claude-opus-4-7-max` y `nohurry/Opus-4.6-Reasoning-3000x-filtered`. El entrenamiento se realizo con el esfuerzo por defecto de la plantilla (0,9). No se reporta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento, con trazas deliberadamente mas cortas que el base.
- Generacion de codigo con verificacion funcional: el autor reporta 20/20 tests superados en 10 tareas Python (Fibonacci O(log n), parentesis balanceados, aplanado de listas, two-sum, subsecuencia comun mas larga, merge intervals, criba de Eratostenes, palindromos, romano a entero, busqueda binaria).
- Razonamiento matematico basico con cadenas de pensamiento compactas (ejemplo del autor: problema de lapices resuelto en una sola linea de pensamiento).
- Modo de razonamiento conciso configurable via el parametro de esfuerzo de la plantilla del modelo base (entrenado a 0,9).
- Capacidades del modelo base (tool calling, agentes, multilingue) no documentadas en la informacion disponible; el adaptador solo declara ingles.
- No se documentan capacidades de vision, audio ni tool calling especificas de este adaptador.

## Casos de uso

- Generacion de codigo en produccion con coste controlado: el adaptador reduce el pensamiento de 645 a 147 tokens de media en tareas de codigo manteniendo los tests, lo que abarata cada llamada en pipelines de CI/CD o asistentes de IDE.
- Agentes multi-paso con presupuesto de tokens ajustado: al recortar 2,7 veces el pensamiento en prompts generales, permite mas iteraciones de agente dentro de la misma ventana y presupuesto.
- Razonamiento matematico en aplicaciones educativas o de calculo: trazas cortas tipo "18/3 x 2 = 12" son mas faciles de mostrar al usuario final que cadenas largas de verificacion.
- Despliegue en hardware modesto: el adaptador pesa 0,1 GB y se aplica sobre cuantizaciones GGUF Q4_K_XL del base, apto para llama.cpp y Ollama en equipos consumer.
- Servicios de atencion al cliente o Q&A donde la latencia importa: menos tokens de pensamiento implican menor tiempo hasta el primer token util y menor coste por respuesta.
- Evaluacion e investigacion de destilacion de razonamiento: sirve como referencia reproducible de como el SFT sobre trazas Opus cortas afecta la longitud de pensamiento sin degradar exactitud.
- Prototipado rapido con PEFT: al ser un adaptador safetensors, se puede cargar junto al base con `PeftModel.from_pretrained` sin reentrenar.

## Benchmarks y rendimiento

El autor publica una comparativa de longitud de pensamiento (tokens) y tests superados entre el base y el LoRA, con esfuerzo 0,9 y temperatura 0,7, 10 tareas Python y 2 muestras por tarea:

| Tarea | Pensamiento base | Pensamiento LoRA | Tests base / LoRA |
|---|---:|---:|---|
| Fibonacci O(log n) | 1.238 | 184 | 2/2 / 2/2 |
| Parentesis balanceados | 1.192 | 58 | 2/2 / 2/2 |
| Aplanar lista anidada | 1.018 | 85 | 2/2 / 2/2 |
| Two-sum | 656 | 433 | 2/2 / 2/2 |
| Subsecuencia comun mas larga | 516 | 115 | 2/2 / 2/2 |
| Merge intervals | 457 | 122 | 2/2 / 2/2 |
| Criba de Eratostenes | 442 | 107 | 2/2 / 2/2 |
| Comprobar palindromo | 362 | 56 | 2/2 / 2/2 |
| Romano a entero | 347 | 110 | 2/2 / 2/2 |
| Busqueda binaria | 222 | 198 | 2/2 / 2/2 |
| **Media** | **645** | **147** | **20/20 / 20/20** |

En prompts generales (5 prompts mixtos): 2.648 → 983 tokens de pensamiento (2,7 veces menos). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: 0,1 GB (19,5 millones de parametros en safetensors/GGUF F16); el grueso de la VRAM la consume el modelo base.
- VRAM del base: no disponible en la informacion proporcionada; depende de la cuantizacion elegida de `unsloth/Inkling-2-Mini-GGUF`.
- GPU recomendadas: no disponibles. Al desplegarse sobre cuantizaciones GGUF Q4_K_XL, es viable en GPUs consumer (familia RTX 4090 y similares) siempre que el base cuantizado quepa en VRAM; no se confirma el tamano exacto.
- Despliegue: llama.cpp (b12622 o superior) con `llama-server --lora`, Ollama con `ADAPTER` en el Modelfile, y Transformers + PEFT (`PeftModel.from_pretrained`).
- Latencia y throughput: no disponibles de forma absoluta; la reduccion de tokens de pensamiento (4,4x en codigo, 2,7x en general) implica una reduccion proporcional del coste de decodificacion en esas tareas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Opus-Reasoning | LoRA sobre Inkling-2-Mini | 19,5 M (adaptador) | no disponible | Conciso (147 tok medios en codigo) | apache-2.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (base) | Modelo completo | no disponible | no disponible | Estandar (645 tok medios en codigo) | apache-2.0 | Hugging Face |
| unsloth/Inkling-2-Mini-GGUF | Cuantizaciones GGUF del base | no disponible | no disponible | Estandar | segun base | Hugging Face |

No se dispone de datos de benchmarks estandar ni de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- El adaptador esta entrenado para reducir el pensamiento; en tareas que requieran razonamiento profundo o verificacion extensa, el recorte puede aumentar el riesgo de error no detectado. El propio autor documenta que en two-sum y busqueda binaria la reduccion es menor (433 y 198 tokens), lo que sugiere variabilidad por tarea.
- Los benchmarks publicados son del autor, con 10 tareas Python y 2 muestras por tarea: muestra pequena y no validada de forma independiente.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas en el adaptador.
- Sesgos conocidos: no documentados en la informacion disponible.
- El adaptador depende del modelo base y de su plantilla de chat (esfuerzo 0,9); cambios en la plantilla o en el tokenizer del base pueden alterar el comportamiento.
- Licencia apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datasets de entrenamiento (MIT / Apache 2.0 segun el autor).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.
- El contexto maximo real del base no se documenta; el entrenamiento uso 8.192 tokens, pero no se confirma que sea el limite del modelo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/banyohavlusu23/Inkling-2-Mini-Opus-Reasoning
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones GGUF del base: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Plataforma de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset lordx64/reasoning-distill-claude-opus-4-7-max: https://huggingface.co/datasets/lordx64/reasoning-distill-claude-opus-4-7-max
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
