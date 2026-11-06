# kob0105/act_whiteball_blackboard_IR_70ep_NEW

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y permite ejecutar tareas de manipulación con alta tasa de éxito a partir de datos de teleoperación. Este repositorio concreto, `kob0105/act_whiteball_blackboard_IR_70ep_NEW`, es una política entrenada con LeRobot sobre un robot `so_follower` para la tarea "pick place white ball", con dos cámaras (`global` y `palm`) a 480x640 y 30 FPS.

El modelo consume un vector de estado de 6 dimensiones y dos imágenes RGB, y produce un vector de acción de 6 dimensiones. Se entrenó durante 25.000 pasos con batch de 8, optimizador AdamW y learning rate de 1e-5 sobre un dataset de 70 episodios y 34.199 frames. Es, por tanto, una política de robótica de propósito muy específico, no un modelo de lenguaje.

Su relevancia es la de un ejemplo práctico y reproducible de pipeline de imitación end-to-end con LeRobot: dataset público, configuración de entrenamiento documentada y comando de rollout listo para ejecutar. Con 51,7 millones de parámetros y 0,2 GB de repositorio, es ligero y desplegable en hardware modesto, aunque su utilidad queda acotada a la tarea y al robot para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer con codificador visual |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de la política, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con el string "pick place white ball") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual para procesar observaciones (imágenes de las cámaras `global` y `palm` más el estado del robot) y predecir chunks de acciones, es decir, varias acciones futuras en una sola pasada. Esta predicción por chunks es la innovación central del método: reduce el horizonte efectivo de decisión y mitiga el error compounding típico de las políticas que predicen un paso por vez. La entrada de estado tiene forma `(6,)`, las imágenes `(3, 480, 640)` y la salida de acción `(6,)`.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kob0105/record_test_new_whiteball_blackboard_IR_No2`: 70 episodios, 34.199 frames a 30 FPS, tarea "pick place white ball". La configuración fue de 25.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el número de tokens de entrenamiento (no aplica), la composición del dataset más allá de la tarea, ni si hubo etapas de RLHF/DPO (no procede en imitación supervisada).

## Capacidades

- Ejecución de una tarea de manipulación concreta: "pick place white ball" sobre un robot `so_follower`.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado proprioceptivo de 6 dimensiones.
- Fusión de dos vistas de cámara: `global` (vista externa) y `palm` (vista de la pinza), ambas a 480x640 y 30 FPS.
- Aprendizaje por imitación a partir de datos de teleoperación; no requiere definición explícita de recompensas.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica.
- Capacidades especiales: ninguna más allá de la política de control; no hay modo thinking, visión general, audio ni similares.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea "pick place white ball" sobre un `so_follower` con las cámaras para las que fue entrenada, adecuada para prototipos de manipulación reproducibles con LeRobot.
- Reproducción de experimentos de imitación: sirve como referencia para validar un pipeline completo (grabación de dataset, entrenamiento con `lerobot-train`, rollout con `lerobot-rollout`) antes de escalar a tareas propias.
- Base para fine-tuning en tareas similares: al ser una política ACT ligera (51,7 M de parámetros), puede reentrenarse con un dataset propio de pick-and-place y comparar tasas de éxito.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos de ejecución y entrenamiento, lo que facilita demostraciones en cursos y talleres.
- Benchmark interno de hardware: permite medir latencia y estabilidad de un `so_follower` con dos cámaras a 30 FPS en un entorno controlado (pelota blanca sobre pizarra).
- Validación de infraestructura de despliegue: útil para probar integración de LeRobot con GPUs consumer y verificar el bucle de inferencia antes de invertir en tareas más complejas.
- Pruebas de robustez ante cambios de iluminación o posición: al ser una tarea acotada, sirve para estudiar cómo afectan variaciones del entorno a una política de imitación concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB de repo), la política cabe holgadamente en GPUs consumer de 4-8 GB, aunque no se documenta el consumo real.
- GPU recomendadas: no disponible; LeRobot permite `--policy.device=cuda`, por lo que cualquier GPU NVIDIA con CUDA es candidata. Para entrenamiento, una RTX 3090/4090 o superior es razonable dado el batch size 8 y las dos cámaras a 480x640, aunque no hay cifras publicadas.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se especifica el mínimo exacto.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a una política de robótica).
- Latencia y throughput estimados: no disponibles. La política opera a 30 FPS según el dataset, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kob0105/act_whiteball_blackboard_IR_70ep_NEW | 51,7 M | no aplica | pick place white ball (so_follower) | apache-2.0 | Hugging Face (28 descargas) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | tareas de manipulación diversas | generalmente apache-2.0 | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | manipulación por imitación | generalmente apache-2.0 | Hugging Face |
| Políticas VLA (p. ej. SmolVLA, pi0) | cientos de M a miles de M | no aplica | manipulación generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) para este modelo ni para las alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para "pick place white ball" con un robot `so_follower` y dos cámaras concretas; no generaliza a otras tareas, objetos ni configuraciones de cámara.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia del entorno: cambios de iluminación, posición de la pelota, fondo de pizarra o calibración del robot pueden degradar el comportamiento; el nombre del dataset sugiere uso de infrarrojos (`IR`), lo que puede limitar la transferencia a otros sensores.
- Sesgos conocidos: no documentados; en imitación, los sesgos provienen de la política del teleoperador y del dataset (70 episodios), no de datos lingüísticos.
- Riesgo de alucinación: no aplica en el sentido de lenguaje; el riesgo equivalente es la ejecución de acciones erróneas o inseguras ante observaciones fuera de distribución.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación con atribución; no obstante, el autor no ofrece garantías.
- Caveat de producción: requiere hardware `so_follower`, puertos y cámaras configurados manualmente; el comando de rollout incluye placeholders que deben ajustarse por máquina.
- Idiomas: no aplica; la interfaz de tarea es un string en inglés ("pick place white ball").

## Enlaces

- Hugging Face: https://huggingface.co/kob0105/act_whiteball_blackboard_IR_70ep_NEW
- Dataset: https://huggingface.co/datasets/kob0105/record_test_new_whiteball_blackboard_IR_No2
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/record_test_new_whiteball_blackboard_IR_No2
