# pavannanjunda333/act_so101_sim_v2

## Resumen

`act_so101_sim_v2` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. La desarrolla el usuario pavannanjunda333 y se distribuye a través de HuggingFace Hub usando la librería LeRobot de HuggingFace. El modelo resuelve una tarea concreta de manipulación robótica: "put the blue cube in the blue box" (introducir el cubo azul en la caja azul), sobre un robot de tipo `so_follower`.

La política consume observaciones multimodales (el estado del robot, un vector de 6 dimensiones, y dos cámaras de 480x640 píxeles: `front` y `gripper`) y produce un vector de acción de 6 dimensiones. El checkpoint tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. Se entrenó sobre un dataset de 1000 episodios y 500.845 fotogramas a 30 FPS.

Es relevante porque ejemplifica el flujo actual de políticas robóticas de código abierto: entrenamiento con LeRobot, publicación en el Hub con la model card estandarizada y despliegue mediante `lerobot-rollout`. No obstante, es un modelo de nicho, con escasa tracción (33 descargas, 0 likes) y sin resultados de evaluación publicados, por lo que debe tratarse como un artefacto experimental más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica mediante el prompt de texto "put the blue cube in the blue box") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política combina un codificador visual para procesar las dos cámaras (`front` y `gripper`, ambas a 480x640), la fusión del estado proprioceptivo del robot (vector de 6 dimensiones) y un transformer que predice secuencias cortas de acciones (chunks) en lugar de una acción por paso. Esta predicción por chunks reduce el error de acumulación y mejora la estabilidad temporal en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `pavannanjunda333/so101_sim_cube_real`: 1000 episodios, 500.845 fotogramas a 30 FPS, una única tarea ("put the blue cube in the blue box"). La configuración reportada es de 200.000 pasos de entrenamiento, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifica en la información disponible si hubo RLHF, DPO ni aumentos de datos; tampoco se detalla la composición exacta del dataset más allá de los episodios y fotogramas citados.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual dual: procesa simultáneamente las cámaras `front` y `gripper` a resolución 480x640.
- Ejecución de una tarea concreta de pick-and-place: "put the blue cube in the blue box".
- Aprendizaje por imitación a partir de datos de teleoperación (1000 episodios).
- Predicción de action chunks para mayor estabilidad temporal.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües ni modos de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de colocar el cubo azul en la caja azul sobre un robot SO-101, útil como banco de pruebas reproducible para comparar métodos de imitación.
- Prototipado de pipelines de aprendizaje por imitación: sirve como referencia para validar el flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`).
- Docencia e investigación en robótica: permite a estudiantes reproducir un entrenamiento ACT con un dataset público de 1000 episodios y 500.845 fotogramas.
- Evaluación de robustez visual: al depender de dos cámaras, permite estudiar cómo afectan cambios de iluminación, posición de objetos o distractores al éxito de la tarea.
- Base para fine-tuning en tareas similares: el checkpoint puede reentrenarse con nuevos datasets de manipulación sobre el mismo tipo de robot `so_follower`.
- Benchmark interno de infraestructura: con 51,7 millones de parámetros y 0,2 GB de pesos, es ligero para pruebas de latencia y throughput en estaciones con GPU consumer.
- Simulación y sim-to-real: el nombre del checkpoint (`sim_v2`) y del dataset (`so101_sim_cube_real`) sugieren uso en entornos simulados y transferencia a real, aunque la model card no detalla el procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en safetensors y pesos de 0,2 GB, la huella en memoria es reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior sería suficiente para inferencia, y una RTX 4090 o A100 para reentrenamiento.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (0,2 GB) y el número de parámetros (51,668,614).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=pavannanjunda333/act_so101_sim_v2`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La política se ejecuta a 30 FPS según la tasa del dataset, pero no se reportan métricas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| act_so101_sim_v2 (este) | ACT / imitación | 51.668.614 | no aplica | apache-2.0 | no |
| Políticas ACT de referencia en LeRobot | ACT / imitación | no disponible | no aplica | apache-2.0 (habitual) | variable |
| Políticas Diffusion Policy | difusión / imitación | no disponible | no aplica | variable | variable |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas de la misma categoría en la información proporcionada. La comparación se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni ensayos que respalden el rendimiento real de la política.
- Tarea única y estrecha: entrenada exclusivamente para "put the blue cube in the blue box"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: diseñada para el robot `so_follower` con cámaras `front` y `gripper`; los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento.
- Riesgo de sobreajuste al dataset: 1000 episodios de una sola tarea pueden no cubrir variaciones de iluminación, posición de objetos o distractores.
- Sin información sobre sesgos: no se documentan sesgos conocidos, aunque al ser un modelo visual puede heredar sesgos de los datos de teleoperación.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí de fallos de ejecución física con posibles consecuencias materiales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset asociado antes de reutilizarlo.
- Madurez baja: 33 descargas y 0 likes en el momento de la consulta; tratar como artefacto experimental.
- Fechas del repositorio: creado y actualizado el 2026-10-27 según los metadatos del Hub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pavannanjunda333/act_so101_sim_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/pavannanjunda333/so101_sim_cube_real
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=pavannanjunda333/so101_sim_cube_real
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
