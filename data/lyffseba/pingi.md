# lyffseba/pingi

## Resumen

PINGI es un proyecto de ajuste fino (fine-tuning) en curso sobre el modelo `thinkingmachines/Inkling-2-Mini`, desarrollado por el usuario lyffseba. Su objetivo es adaptar dicho modelo base al harness de agente de programación `pi` (con herramientas `read`, `bash`, `edit` y `write`), de modo que el modelo aprenda a operar de forma nativa dentro de ese entorno de ejecución de tareas de código.

El modelo base Inkling-2-Mini es un transformer MoE multimodal de 26.400 millones de parámetros totales, con 3.400 millones activos (5.400 millones efectivos gracias a un núcleo MoE con bucle de tres pasadas), ventana de contexto de 1 millón de tokens y licencia Apache 2.0. PINGI hereda esas características y añade un entrenamiento de refuerzo (RL) orientado a agentes y coding, ejecutado sobre la infraestructura Tinker.

En el momento de redactar esta ficha, el proyecto solo ha completado una etapa de humo (smoke test, `pingi-smo`) de tres pasos en Docker local. Las etapas piloto y completa están planificadas pero pendientes, y no se han publicado resultados de benchmarks sobre el modelo ajustado. Por tanto, PINGI debe considerarse un artefacto experimental de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo de bucle de 3 pasadas (heredada de Inkling-2-Mini); multimodal |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (3,4B); 5.400 millones efectivos (5,4B) por el bucle de 3 pasadas |
| Longitud de contexto | 1.000.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el autor indica que Thinking Machines bloquea la descarga directa de checkpoints del modelo base con error 403; los checkpoints entrenados se publican vía Tinker) |

## Arquitectura y entrenamiento

PINGI parte de `thinkingmachines/Inkling-2-Mini`, un modelo MoE multimodal con 26,4B parámetros totales y 3,4B activos, que emplea un núcleo con bucle de tres pasadas que eleva el cómputo efectivo a 5,4B parámetros. La ventana de contexto es de 1M tokens. El ajuste se realiza sobre el harness `pi`, que expone al modelo cuatro herramientas (`read`, `bash`, `edit`, `write`), y se entrena con un pipeline de RL (tags `rl`, `agents`, `coding`) sobre Tinker.

El estado de entrenamiento publicado es el siguiente: la etapa de humo `pingi-smo` se completó con 3 pasos en Docker local y se publicó en Tinker (`tinker://e7bba24a-6366-5c8c-93b8-21e624a621a6:train:0/sampler_weights/final`). La etapa piloto `pingi-pilot` está planificada con 640 rollouts sobre la mezcla `scale800 + termgrade` en Modal. La etapa MVP/full `pingi` está planificada con entre 1.600 y 5.120 rollouts y una puerta de evaluación pareada sobre held-out. El benchmark de referencia del autor es `harness-hub/Qwen3.8-27B-pi-adapted`, entrenado con el mismo harness y la misma mezcla de datos (`scale800-harbor` + `termgrade-train-harbor`), con thinking desactivado y LoRA r=32.

## Capacidades

- Generación de texto, razonamiento y código, heredados del modelo base Inkling-2-Mini.
- Capacidades multimodales (el modelo base es multimodal; el alcance concreto en PINGI no está detallado).
- Operación como agente de programación dentro del harness `pi`, con uso de las herramientas `read`, `bash`, `edit` y `write`.
- Entrenamiento orientado a tareas de terminal y resolución de issues de software (mezclas `scale800-harbor` y `termgrade`).
- Modo de razonamiento (thinking): el autor indica que PINGI usa `none` como valor por defecto, es decir, thinking desactivado por defecto.
- Soporte de tool calling: implícito en el diseño del harness `pi`, aunque no se detalla el formato exacto.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de terminal: el modelo puede ejecutar comandos mediante la herramienta `bash` dentro del harness `pi`, lo que permite encadenar operaciones de shell para tareas de mantenimiento, inspección de repositorios o scripts de build.
- Resolución de issues de software: entrenado sobre mezclas tipo SWE-bench, el modelo puede leer el repositorio con `read`, localizar el código relevante, aplicar un parche con `edit` y verificar el resultado, un flujo adecuado para pipelines de corrección automática de bugs.
- Edición de código asistida en IDE o CLI: la integración nativa con `edit` y `write` permite que el modelo modifique ficheros de forma controlada, lo que encaja en asistentes de programación que operan sobre el árbol de trabajo del desarrollador.
- Evaluación comparativa de modelos para agentes: al compartir harness y mezcla de datos con `Qwen3.8-27B-pi-adapted`, PINGI sirve como referencia para estudiar cómo afecta el tamaño del modelo (3,4B activos frente a 27B densos) al rendimiento en tareas de agente.
- Investigación en RL para agentes: el pipeline sobre Tinker con rollouts escalonados (3, 640 y 1.600-5.120) es un caso de estudio reproducible para quienes diseñan entrenamientos de RL con puertas de evaluación pareadas.
- Procesamiento de contextos largos: con 1M tokens de ventana, el modelo puede analizar repositorios completos o trazas extensas de ejecución en una sola pasada, útil en tareas de auditoría de código o análisis de logs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo ajustado PINGI. El autor indica explícitamente que las puntuaciones pareadas sobre held-out (`pingi-eval`) están pendientes y solo se añadirán cuando se supere la puerta de release. La siguiente tabla recoge los datos de referencia citados en la model card, que corresponden al modelo base y a un adaptativo comparable, no a PINGI:

| Modelo | Activos / Totales | Thinking | Terminal-Bench 2.1 (`pi`) | SWE-bench Pro hard-51 (`pi`) |
|---|---:|---|---:|---:|
| `Qwen/Qwen3.8-27B` (base) | 27B / 27B | off | 39,5% | 39,2% |
| `harness-hub/Qwen3.8-27B-pi-adapted` | 27B / 27B | off | 55,8% (+16,3 pts) | 64,7% (+25,5 pts) |
| `thinkingmachines/Inkling-2-Mini` (card oficial) | 3,4B (5,4B ef.) / 26,4B | default | 71,6% (`pi v0.83.0`) | 77,9% (`mini-swe-agent`) |
| PINGI (`lyffseba/pingi`) | 3,4B (5,4B ef.) / 26,4B | none (default) | pendiente de held-out | pendiente de held-out |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 26,4B parámetros totales requiere del orden de 53 GB en FP16 y unos 14-16 GB en cuantización de 4 bits, pero estos cálculos no proceden de la model card y deben tratarse con cautela.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor menciona Tinker para publicación de checkpoints y Docker local para el smoke test; no se detallan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en agentes | Disponibilidad |
|---|---|---|---|---|---|
| PINGI (`lyffseba/pingi`) | 26,4B totales / 3,4B activos (5,4B ef.) | 1M | Apache 2.0 | pendiente de evaluación | checkpoints vía Tinker; descarga directa del base bloqueada (403) |
| `thinkingmachines/Inkling-2-Mini` | 26,4B totales / 3,4B activos (5,4B ef.) | 1M | Apache 2.0 | 71,6% Terminal-Bench 2.1; 77,9% SWE-bench Pro hard-51 | descarga directa bloqueada (403) |
| `harness-hub/Qwen3.8-27B-pi-adapted` | 27B densos | no disponible | no disponible | 55,8% Terminal-Bench 2.1; 64,7% SWE-bench Pro hard-51 | publicado en Hugging Face |
| `Qwen/Qwen3.8-27B` | 27B densos | no disponible | no disponible | 39,5% Terminal-Bench 2.1; 39,2% SWE-bench Pro hard-51 | publicado en Hugging Face |

## Limitaciones y advertencias

- El modelo se encuentra en estado experimental: solo se ha completado un smoke test de 3 pasos; las etapas piloto y completa están pendientes.
- No existen resultados de benchmarks del modelo ajustado; cualquier comparación con el modelo base o con Qwen es especulativa.
- El autor bloquea explícitamente la publicación de puntuaciones pareadas hasta superar la puerta de release, lo que indica que el rendimiento aún no está validado.
- La descarga directa de checkpoints del modelo base está deshabilitada por Thinking Machines (error 403); los checkpoints entrenados se distribuyen solo vía Tinker, lo que limita la reproducibilidad local.
- No se detallan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial.
- El modo thinking está desactivado por defecto (`none`), lo que puede afectar al rendimiento en tareas que se beneficien de razonamiento extendido.
- No se especifican formatos de pesos ni opciones de cuantización, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lyffseba/pingi
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint de smoke test: https://huggingface.co/lyffseba/pingi-smo
- Código, entrenamiento y evaluación: https://github.com/lyffseba/pingi
- Investigación de arquitectura complementaria (space): https://huggingface.co/spaces/lyffseba/xai
- Dataset de estudios de arquitectura: https://huggingface.co/datasets/lyffseba/xai-studies
- Harness `pi`: https://pi.dev/
- Modelo de referencia adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
