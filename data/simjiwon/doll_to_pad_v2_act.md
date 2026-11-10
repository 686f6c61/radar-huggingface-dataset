# simjiwon/doll_to_pad_v2_act

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la tasa de éxito en tareas de manipulación robótica. Este repositorio concreto, `simjiwon/doll_to_pad_v2_act`, es una política entrenada con LeRobot sobre un robot `omx_follower` para una tarea específica: coger un cojín con forma de *yut* desde distintas posiciones y orientaciones y colocarlo sobre una almohadilla de espuma negra.

El modelo es un transformer de 51.668.614 parámetros (unos 51,7 M) que consume el estado del robot (6 dimensiones) y dos cámaras RGB (`wrist` y `top`, 480x640) y emite un vector de acción de 6 dimensiones. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto lingüística; su "contexto" es la observación visual y propioceptiva del robot en cada paso de control.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un *policy* de robótica entrenado con el stack LeRobot, con licencia Apache 2.0 y pesos en safetensors, útil para quienes quieran replicar el flujo de entrenamiento o desplegar una política de manipulación en hardware similar. El entrenamiento fue muy corto (500 pasos, batch 10) sobre un dataset pequeño (15 episodios, 6268 frames a 30 FPS), por lo que debe considerarse una prueba de concepto más que un modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; observación por paso, sin contexto lingüístico) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un *chunk* de acciones futuras. Esto mitiga el problema de acumulación de errores típico de las políticas paso a paso y permite un control más suave. La política consume `observation.state` (6 dimensiones), `observation.images.wrist` (3x480x640) y `observation.images.top` (3x480x640), y produce `action` (6 dimensiones). El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `simjiwon/doll_to_pad_v2`: 15 episodios, 6268 frames a 30 FPS, tarea "Pick up the yut-shaped cushion from different positions and orientations and place it on the black foam pad". Configuración: 500 pasos, batch size 10, optimizador AdamW, learning rate 1e-05, semilla 1000. No se documenta composición del dataset más allá del número de episodios y frames, ni si hubo aumentación de datos o validación.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `omx_follower`.
- Percepción visual multimodal: procesa dos cámaras RGB simultáneas (`wrist` y `top`) a 480x640.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados.
- Tarea única: especializado en coger y colocar un cojín con forma de *yut* sobre una almohadilla negra.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Replicación de experimentos de imitación: usar este *policy* como referencia para reproducir el flujo de entrenamiento de ACT con LeRobot en un robot `omx_follower`, comparando hiperparámetros y resultados.
- Pick-and-place en laboratorio: desplegar la política para la tarea concreta de recoger el cojín *yut* y colocarlo en la almohadilla, útil como banco de pruebas de manipulación.
- Base para *fine-tuning*: partir de estos pesos y reentrenar sobre un dataset propio con objetos o posiciones distintas, aprovechando la arquitectura ACT y el soporte de LeRobot.
- Docencia y formación: ejemplo didáctico de pipeline completo (grabación de datos, entrenamiento, rollout) con comandos `lerobot-train` y `lerobot-rollout`.
- Evaluación de hardware: probar la integración de cámaras `wrist` y `top` y la calibración del robot antes de escalar a tareas más complejas.
- Benchmark interno de políticas: comparar ACT frente a otras políticas de LeRobot (p. ej. Diffusion Policy) sobre la misma tarea y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; con 51,7 M de parámetros el modelo es muy pequeño y probablemente quepa en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible; el comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño (51,7 M de parámetros) es plausible, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La captura se realiza a 30 FPS según el dataset.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simjiwon/doll_to_pad_v2_act | 51,7 M | ACT (imitación) | no aplica | apache-2.0 | Hugging Face |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible | imitación | no aplica | variable | Hugging Face / LeRobot |
| Políticas ACT de terceros en el Hub | no disponible | ACT | no aplica | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Tarea extremadamente específica: solo se entrenó para coger un cojín *yut* y colocarlo en una almohadilla negra; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño: 15 episodios y 6268 frames, con solo 500 pasos de entrenamiento; riesgo alto de sobreajuste y baja robustez ante cambios de iluminación, posición u objetos.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia de hardware: requiere un robot `omx_follower` y dos cámaras con los nombres `wrist` y `top`; el desajuste de nombres o calibración rompe la inferencia.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni agentes; no debe confundirse con un LLM.
- Sesgos y alucinación: no aplican en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin información sobre cuantización ni despliegue en hardware de bajo consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simjiwon/doll_to_pad_v2_act
- Dataset: https://huggingface.co/datasets/simjiwon/doll_to_pad_v2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=simjiwon/doll_to_pad_v2
