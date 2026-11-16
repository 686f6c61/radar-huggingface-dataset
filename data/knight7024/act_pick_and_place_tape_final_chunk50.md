# knight7024/act_pick_and_place_tape_final_chunk50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice bloques cortos de acciones en lugar de pasos individuales, reduciendo el error de composición que afecta a las políticas que actúan paso a paso. Este repositorio concreto, `knight7024/act_pick_and_place_tape_final_chunk50`, es una política entrenada con LeRobot sobre un conjunto de datos propio de teleoperación para la tarea "pick_and_place_tape" (recoger un objeto y colocarlo en una posición objetivo) con un robot `so_follower` y dos cámaras (vista superior y muñeca).

El modelo tiene 51.617.414 parámetros y ocupa 0,2 GB en el repositorio, lo que lo sitúa en el rango de políticas ligeras ejecutables en hardware de consumo. Consume un vector de estado de 6 dimensiones y dos imágenes (240x320 y 480x640) y produce un vector de acción de 6 dimensiones. Se entrenó durante 100.000 pasos con batch size 1 sobre 50 episodios (16.278 frames a 30 FPS).

Es relevante como ejemplo práctico de flujo completo de imitación en robótica con LeRobot 0.6.0: grabación de datos, entrenamiento de política y despliegue en robot real. No es un modelo de lenguaje ni un modelo fundacional generalista; su alcance se limita estrictamente a la tarea y al robot con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación de un solo paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica por cadena en tiempo de ejecución) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que, a partir de observaciones (estado propioceptivo e imágenes), predice un chunk de acciones futuras en lugar de una única acción. Esto mitiga el problema de horizonte y el error acumulado típico de políticas reactivas. En este caso, la entrada combina `observation.state` de forma `(6,)` con dos flujos visuales: `observation.images.top` de `(3, 240, 320)` y `observation.images.wrist` de `(3, 480, 640)`. La salida es un vector `action` de `(6,)`. El nombre del repositorio indica un chunk de 50 acciones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `knight7024/pick_and_place_tape_final`: 50 episodios, 16.278 frames a 30 FPS, con las tareas "pick_and_place_tape" y "Pick up the object and place it at the target location". Configuración: 100.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documentan aumentos de datos, composición adicional del dataset ni etapas de RLHF/DPO (no aplicables a este paradigma). Tampoco se especifican detalles del encoder visual ni del número de capas del transformer en la información disponible.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` en la tarea de recoger y colocar un objeto.
- Percepción visual multimodal: procesa simultáneamente una cámara cenital y una cámara en la muñeca del robot.
- Predicción de chunks de acción: emite secuencias cortas de acciones (chunk de 50 según el nombre del repositorio), lo que mejora la estabilidad frente a políticas paso a paso.
- Aprendizaje por imitación a partir de teleoperación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Ejecución en bucle cerrado con LeRobot: se despliega mediante `lerobot-rollout` con estrategia `base` y duración configurable.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo thinking. No es un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta la secuencia de recogida y colocación de cinta sobre un robot SO-100/SO-101 (`so_follower`) con las dos cámaras calibradas, sustituyendo la programación manual de trayectorias por una política aprendida.
- Prototipado rápido de tareas de manipulación: partiendo de 50 episodios teleoperados, un equipo puede entrenar y desplegar una política funcional en horas, usando `lerobot-train` y `lerobot-rollout` como flujo estándar.
- Banco de pruebas para investigación en imitación: sirve como línea base reproducible (semilla 1000, 100.000 pasos, lr 1e-05) para comparar variantes de ACT, tamaños de chunk o esquemas de aumentos de datos.
- Evaluación de robustez visual: al emplear dos vistas (top y wrist), permite estudiar cómo afectan oclusiones, cambios de iluminación o posiciones de objeto a la tasa de éxito en una tarea acotada.
- Docencia y formación en robótica de aprendizaje: ejemplo completo y ligero (0,2 GB, 51,6 M de parámetros) para enseñar el ciclo datos-entrenamiento-despliegue con LeRobot.
- Integración en pipelines de laboratorio: ejecución con `--duration` acotada para experimentos controlados, con registro de episodios si se usa una estrategia de rollout distinta de `base`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que cualquier GPU con 2-4 GB libres es suficiente, incluyendo GPUs integradas o de portátil.
- GPU recomendadas: no se especifican en la información; por tamaño, una RTX 3060/4060 o superior es más que suficiente. Para entrenamiento con batch size 1 y 100.000 pasos, una GPU de gama media acelera notablemente el proceso.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del repositorio (0,2 GB).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según el dataset, pero no se publican mediciones de latencia de inferencia ni de throughput en robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `knight7024/act_pick_and_place_tape_final_chunk50` | 51,6 M | estado (6,) + 2 imagenes (240x320, 480x640) | pick_and_place_tape en `so_follower` | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (referencia del paper 2304.13705) | no disponible en la informacion | no disponible | manipulacion por imitacion (multi-tarea) | no disponible | paper y codigo de referencia |
| Otras politicas LeRobot (p. ej. Diffusion Policy, pi0) | no disponible en la informacion | no disponible | manipulacion por imitacion | no disponible | ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "pick_and_place_tape" con un robot `so_follower` y una configuración de cámaras concreta; no generaliza a otras tareas, objetos, robots ni disposiciones de cámara.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia del dataset: 50 episodios y 16.278 frames son un volumen reducido; es probable que el rendimiento se degrade ante cambios de iluminación, posiciones de objeto no vistas o distracciones.
- Requisitos de calibración: los nombres e índices de cámara deben coincidir exactamente con las claves de observación (`observation.images.top`, `observation.images.wrist`) y el robot debe estar calibrado; un desajuste invalida la política.
- Riesgo de sobreajuste al entorno de grabación: no se documentan aumentos de datos ni variaciones controladas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no hay garantías del autor sobre el comportamiento del modelo; la responsabilidad de validación recae en el integrador.
- Sin soporte de lenguaje: no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea usada por LeRobot; no debe presentarse como un modelo multimodal general.
- Sin cuantizaciones publicadas ni formatos alternativos: el despliegue está ligado al ecosistema LeRobot y a safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_tape_final_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_tape_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_tape_final
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
