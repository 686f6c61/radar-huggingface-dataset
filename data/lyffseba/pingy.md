# lyffseba/pingy

## Resumen

PINGY es un proyecto de ajuste fino (fine-tuning) del modelo `thinkingmachines/Inkling-2-Mini` orientado especificamente al arnes de agente de codigo `pi` (con herramientas `read`, `bash`, `edit` y `write`). El autor, lyffseba, lo publica como un trabajo en curso con licencia Apache 2.0 y lo distribuye a traves de la plataforma Tinker. El modelo base es un MoE multimodal de 26.400 millones de parametros totales, 3.400 millones activos y 5.400 millones efectivos gracias a un nucleo con bucle de tres pasadas, con una ventana de contexto de 1 millon de tokens.

La relevancia del proyecto radica en que busca replicar y superar el rendimiento de adaptaciones equivalentes sobre el mismo arnes: la referencia directa es `harness-hub/Qwen3.8-27B-pi-adapted`, que pasa del 39,5 % al 55,8 % en Terminal-Bench 2.1 y del 39,2 % al 64,7 % en SWE-bench Pro hard-51. PINGY parte de un modelo base mas pequeno en parametros activos (3.400 millones frente a 27.000 millones) pero con un contexto mucho mayor y capacidades multimodales.

En el momento de la publicacion, el unico checkpoint disponible es `pingy-smo`, resultado de una prueba de humo de tres pasos ejecutada en Docker local y publicada en Tinker. Las fases piloto (640 rollouts) y completa (entre 1.600 y 5.120 rollouts) estan planificadas pero pendientes, por lo que no existen aun resultados de evaluacion held-out para el modelo ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con nucleo en bucle de tres pasadas (modelo base Inkling-2-Mini) |
| Parametros totales | 26.400 millones |
| Parametros activos | 3.400 millones (5.400 millones efectivos por el bucle de tres pasadas) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoints publicados via Tinker; la descarga directa del modelo base devuelve 403) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `thinkingmachines/Inkling-2-Mini`: un transformer con mezcla de expertos (MoE) cuyo nucleo aplica un bucle de tres pasadas, lo que eleva los parametros efectivos de 3.400 a 5.400 millones sin incrementar los parametros activos por token. El modelo base es multimodal y soporta una ventana de contexto de 1 millon de tokens, lo que lo hace adecuado para tareas de agente sobre repositorios grandes.

El ajuste se plantea como un proceso de aprendizaje por refuerzo (RL) sobre el arnes `pi`, con datos de entrenamiento compuestos por los conjuntos `scale800-harbor` y `termgrade-train-harbor`, y evaluacion contra `harness-hub/Qwen3.8-27B-pi-adapted` con el mismo arnes y mezcla de datos. El pipeline contempla tres etapas: smoke (3 pasos, completada), piloto (640 rollouts, pendiente) y MVP/full (1.600-5.120 rollouts con puerta de validacion held-out emparejada, pendiente). No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas como RLHF o DPO mas alla del RL con rollouts.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Inkling-2-Mini.
- Capacidades multimodales (el modelo base es multimodal; el alcance tras el ajuste no esta detallado).
- Ejecucion de tareas de agente de codigo mediante las herramientas del arnes `pi`: `read`, `bash`, `edit` y `write`.
- Soporte de razonamiento multi-paso y uso de terminal, orientado a tareas de tipo Terminal-Bench y SWE-bench.
- Capacidad de operar con contexto muy largo (hasta 1 millon de tokens) para navegar repositorios extensos.
- Modo de pensamiento (thinking) del modelo base; en la comparativa de referencia se evalua con thinking desactivado (`none`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reparacion automatizada de bugs en repositorios: el agente puede leer ficheros, ejecutar comandos y aplicar ediciones sobre el codigo, apoyandose en la ventana de 1 millon de tokens para mantener el contexto del repositorio y del historial de cambios.
- Resolucion de tareas de terminal de extremo a extremo: con las herramientas `bash` y `edit`, el modelo puede inspeccionar el entorno, ejecutar pruebas y corregir fallos de forma iterativa, lo que encaja con evaluaciones tipo Terminal-Bench 2.1.
- Integracion en pipelines de CI/CD: el modelo puede invocarse como agente de correccion automatica tras fallos de build o de tests, aplicando parches y verificando el resultado con comandos.
- Asistencia a desarrolladores en IDE o CLI: dado su ajuste al arnes `pi`, puede desplegarse como asistente de linea de comandos que lee, escribe y edita ficheros bajo demanda.
- Migracion y refactorizacion de codigo a gran escala: el contexto de 1 millon de tokens permite procesar modulos completos o varios ficheros relacionados en una sola sesion.
- Investigacion en RL para agentes: el proyecto publica su stack de entrenamiento y evaluacion en GitHub, lo que lo convierte en una referencia para estudiar el ajuste de modelos MoE pequenos en tareas de agente.
- Evaluacion comparativa de arneses: sirve como punto de comparacion frente a adaptaciones de modelos mayores (por ejemplo, Qwen3.8-27B) sobre el mismo arnes y la misma mezcla de datos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de referencia, pero las cifras corresponden al modelo base oficial y a la adaptacion de Qwen, no al modelo PINGY ajustado, cuyos resultados held-out estan pendientes.

| Modelo | Activos / Totales | Thinking | Terminal-Bench 2.1 (`pi`) | SWE-bench Pro hard-51 (`pi`) |
|---|---:|---|---:|---:|
| `Qwen/Qwen3.8-27B` (base) | 27B / 27B | off | 39,5 % | 39,2 % |
| `harness-hub/Qwen3.8-27B-pi-adapted` | 27B / 27B | off | 55,8 % (+16,3 pts) | 64,7 % (+25,5 pts) |
| `thinkingmachines/Inkling-2-Mini` (card oficial) | 3,4B (5,4B ef.) / 26,4B | default | 71,6 % (`pi v0.83.0`) | 77,9 % (`mini-swe-agent`) |
| PINGY (`lyffseba/pingy`) | 3,4B (5,4B ef.) / 26,4B | `none` (por defecto) | pendiente de `pingy-eval` | pendiente de `pingy-eval` |

No se han publicado resultados de benchmarks propios del checkpoint PINGY en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 26.400 millones de parametros totales y 3.400 millones activos, el requisito dependera de la cuantizacion y del soporte de offloading del runtime.
- GPU recomendadas: no especificadas por el autor; por tamano del modelo base, cabria esperar GPUs de datacenter (A100, H100) para inferencia en precision completa y GPUs consumer de gama alta con cuantizacion, aunque no hay datos confirmados.
- Viabilidad en GPU consumer: no confirmada.
- Opciones de despliegue: el autor publica checkpoints via Tinker (`publish_checkpoint_from_tinker_path`); no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI. La descarga directa de los ficheros del modelo base esta deshabilitada por Thinking Machines (error 403).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en arnes `pi` | Disponibilidad |
|---|---|---|---|---|---|
| PINGY (`lyffseba/pingy`) | 26,4B totales / 3,4B activos (5,4B ef.) | 1M tokens | Apache 2.0 | pendiente de evaluacion | checkpoint smoke en Tinker |
| `thinkingmachines/Inkling-2-Mini` | 26,4B totales / 3,4B activos (5,4B ef.) | 1M tokens | Apache 2.0 | 71,6 % Terminal-Bench 2.1; 77,9 % SWE-bench Pro | modelo base, descarga directa bloqueada |
| `harness-hub/Qwen3.8-27B-pi-adapted` | 27B densos | no disponible | no disponible | 55,8 % Terminal-Bench 2.1; 64,7 % SWE-bench Pro | publicado en Hugging Face |
| `Qwen/Qwen3.8-27B` | 27B densos | no disponible | no disponible | 39,5 % Terminal-Bench 2.1; 39,2 % SWE-bench Pro | publicado en Hugging Face |

## Limitaciones y advertencias

- El proyecto esta en fase temprana: solo existe un checkpoint de prueba de humo (3 pasos de entrenamiento); no hay checkpoint piloto ni completo.
- No se han publicado resultados held-out del modelo ajustado, por lo que no puede afirmarse que supere al modelo base ni a la adaptacion de Qwen.
- El modelo base tiene la descarga directa de ficheros deshabilitada (403), lo que limita la reproducibilidad fuera de Tinker.
- No se especifican sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma en la informacion disponible.
- El ajuste esta especializado en el arnes `pi` y sus cuatro herramientas; su comportamiento fuera de ese entorno no esta documentado.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de la plataforma Tinker para uso comercial en produccion.
- La evaluacion de referencia usa thinking desactivado por defecto en PINGY, lo que puede afectar a la comparabilidad con el modelo base, que se evalua con thinking activado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lyffseba/pingy
- Checkpoint smoke: https://huggingface.co/lyffseba/pingy-smo
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Codigo, entrenamiento y evaluacion: https://github.com/lyffseba/pingy
- Investigacion de arquitectura complementaria (space): https://huggingface.co/spaces/lyffseba/xai
- Dataset de estudios de arquitectura: https://huggingface.co/datasets/lyffseba/xai-studies
- Referencia comparativa: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Arnes `pi`: https://pi.dev/
