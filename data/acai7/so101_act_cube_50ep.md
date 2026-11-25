# acai7/so101_act_cube_50ep

## Resumen

so101_act_cube_50ep es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face por el usuario acai7. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular de 6 dimensiones e imágenes de dos cámaras a 480x640) a comandos de acción de 6 dimensiones para un brazo robótico de tipo `so_follower` (familia SO-101/SO-100 de bajo coste). El modelo resuelve una tarea concreta de pick-and-place: coger un cubo y depositarlo en una caja.

El modelo es un fine-tuning de `swapnilpaul/so100_pickplace_policy_fast` sobre un dataset propio de 50 episodios teleoperados (31.908 fotogramas a 30 FPS) recogidos con LeRobot 0.7.1. Con 51,7 millones de parámetros y un repositorio de apenas 0,2 GB, está pensado para inferencia en tiempo real sobre hardware modesto, no para despliegues en clúster.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación (grabación de datos, entrenamiento ACT, rollout en robot real) dentro del ecosistema LeRobot, y como punto de partida para quien quiera adaptar una política visomotora a su propio brazo SO-101. No hay resultados de evaluación publicados, por lo que su rendimiento real en el robot no está cuantificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acción |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visomotora; ventana de observación definida por la configuración ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice *chunks* de acciones (varios pasos futuros de una vez) en lugar de una sola acción por inferencia, lo que reduce el error de acumulación y suaviza el control. La arquitectura combina un backbone visual (procesa las dos cámaras, `top` y `wrist`, a 480x640) con un transformer que atiende conjuntamente a las características visuales y al estado articular de 6 dimensiones, y un decodificador que emite el chunk de acciones de 6 dimensiones. La innovación clave del método original es el *temporal ensembling* durante la inferencia, que promedia predicciones solapadas de chunks consecutivos.

El entrenamiento se realizó con LeRobot 0.7.1 durante 25.000 pasos, batch de 16, optimizador AdamW, learning rate 1e-05 y semilla 1000, partiendo del checkpoint `swapnilpaul/so100_pickplace_policy_fast`. El dataset consta de 50 episodios teleoperados (31.908 fotogramas a 30 FPS) de la tarea "Pick up the cube and place it in the box". No se documenta aumento de datos, composición de distractores ni variaciones de iluminación en la model card.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` con 6 grados de libertad a partir de dos cámaras RGB.
- Ejecución de la tarea específica de pick-and-place de un cubo en una caja.
- Predicción de chunks de acción con temporal ensembling para movimientos suaves.
- Inferencia en tiempo real compatible con el comando `lerobot-rollout` de LeRobot.
- Fine-tuning adicional a partir del mismo modelo base mediante `lerobot-train`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni capacidades multilingües: es exclusivamente una política de control.

## Casos de uso

- Pick-and-place de laboratorio: ejecutar la tarea cubo-a-caja en un banco de pruebas SO-101 para validar la cadena completa de LeRobot (calibración, cámaras, rollout) antes de escalar a tareas propias.
- Base para fine-tuning en tareas nuevas: usar el checkpoint como inicialización y reentrenar con `lerobot-train` sobre un dataset propio de pocas decenas de episodios, aprovechando que parte de un modelo ya entrenado en manipulación.
- Docencia y formación en aprendizaje por imitación: sirve como ejemplo mínimo (0,2 GB, 51,7 M de parámetros) para explicar ACT, chunks de acción y temporal ensembling con código ejecutable.
- Prototipado rápido de demos robóticas: al caber en una GPU de consumo y cargarse con la CLI de LeRobot, permite montar una demo de manipulación en horas en lugar de días.
- Benchmark interno de recogida de datos: comparar la calidad de nuevos datasets teleoperados contra este baseline de 50 episodios para decidir cuándo merece la pena reentrenar.
- Investigación en robustez visomotora: evaluar cómo degrada el éxito al variar posiciones del cubo, iluminación o distractores, ya que la model card no reporta estas condiciones.
- Integración en pipelines de evaluación automatizada: ejecutar rollouts con `--duration` fijo y contar éxitos para construir una tabla de evaluación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que cualquier GPU con 2-4 GB libres es suficiente (estimación a partir del tamaño del repositorio, no confirmada por el autor).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 3060, RTX 4060 o superior es más que suficiente. Para entrenamiento, una RTX 4090 o A100 acelera los 25.000 pasos, pero no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política está pensada para control a 30 FPS (frecuencia del dataset), pero el autor no reporta latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| acai7/so101_act_cube_50ep | 51,7 M | Pick-and-place cubo SO-101 | 50 episodios, 31.908 frames | Apache 2.0 | No |
| swapnilpaul/so100_pickplace_policy_fast (base) | no disponible | Pick-and-place SO-100 | no disponible | no disponible | No disponible |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | Manipulación diversa | variable | Apache 2.0 (LeRobot) | Depende del checkpoint |

No se dispone de datos cuantitativos para comparar tasas de éxito con alternativas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay evaluación publicada: se desconoce la tasa de éxito real en robot, por lo que no debe asumirse que la tarea funciona de forma fiable.
- Sesgo de dominio: entrenado con 50 episodios de un único operador, una única disposición de cámara y presumiblemente condiciones de iluminación y posiciones de objeto limitadas; la generalización fuera de ese dominio es incierta.
- Dependencia de la configuración exacta: los nombres de cámara (`top`, `wrist`), resoluciones (480x640), FPS (30) y el tipo de robot (`so_follower`) deben coincidir con los del entrenamiento; cualquier desviación degrada el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento: no es utilizable para tareas de texto, código o agentes.
- Riesgo de sobreajuste al dataset pequeño: 50 episodios es un volumen bajo para manipulación robusta; es esperable fragilidad ante cambios de posición del cubo o distractores.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de origen deben verificarse por separado antes de un despliegue en producción.
- Sin garantías de seguridad física: al controlar un robot real, deben implementarse límites de par, paradas de emergencia y supervisión humana durante los rollouts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acai7/so101_act_cube_50ep
- Modelo base: https://huggingface.co/swapnilpaul/so100_pickplace_policy_fast
- Dataset de entrenamiento: https://huggingface.co/datasets/swapnilpaul/so101_cube_pickplace_pilot_20261120_174602
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=swapnilpaul/so101_cube_pickplace_pilot_20261120_174602
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
