# kiyu705/act_so101_pick_place_test

## Resumen

`act_so101_pick_place_test` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), publicada por el usuario kiyu705 en Hugging Face. No es un modelo de lenguaje: es un checkpoint de control motor entrenado con la librería LeRobot de Hugging Face para el robot SO-101 (variante `so_follower`), que predice secuencias cortas de acciones (action chunks) a partir de observaciones visuales y del estado de las articulaciones. El modelo resuelve una única tarea concreta de manipulación: coger una bobina de cinta y colocarla sobre una superficie verde.

El checkpoint contiene 51.668.614 parámetros (unos 51,7 M) y ocupa 0,2 GB en el repositorio, con pesos en formato safetensors. Consume dos flujos de imagen de 480x640 píxeles (cámara frontal y de muñeca) más un vector de estado de 6 dimensiones, y produce acciones de 6 dimensiones. Se entrenó durante 20.000 pasos con batch de 8 y tasa de aprendizaje 1e-5 sobre un dataset propio de solo 5 episodios (3.525 fotogramas a 30 FPS).

Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot 0.7.0 y como referencia para quien quiera entrenar su propia política ACT sobre el SO-101. No es un modelo de propósito general, no tiene evaluación publicada y su dataset de entrenamiento es demasiado pequeño para esperar generalización robusta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.7.0 |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Frecuencia de datos | 30 FPS |
| Tarea entrenada | "Grab the tape reel and put it on the green board" |

## Arquitectura y entrenamiento

ACT es un método de imitation learning presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso, el modelo predice un chunk de acciones futuras, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un codificador visual (procesa las dos cámaras), un codificador del estado de las articulaciones y un transformer que genera la secuencia de acciones; además incorpora un mecanismo de CVAE (conditional VAE) para modelar la variabilidad humana en las demostraciones. Los detalles internos de capas y dimensiones no están disponibles en la información proporcionada.

El entrenamiento se realizó con LeRobot 0.7.0 durante 20.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset es `kiyu705/so101_pick_place_20261122_141206`, con 5 episodios, 3.525 fotogramas a 30 FPS y una única tarea. No se documenta composición del dataset, aumentación de datos, ni uso de RLHF/DPO (no aplica en este dominio). No hay información sobre innovaciones técnicas adicionales más allá de las propias del método ACT.

## Capacidades

- Control motor de manipulación robótica: predice chunks de acciones de 6 dimensiones para el robot SO-101.
- Percepción visual multimodal: procesa simultáneamente cámara frontal y de muñeca a 480x640.
- Ejecución de una tarea específica de pick-and-place: coger una bobina de cinta y colocarla sobre una superficie verde.
- Integración con el stack LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de thinking mode, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción de un pipeline de imitation learning: sirve como plantilla para entrenar políticas ACT sobre el SO-101 con LeRobot, usando el comando `lerobot-train` documentado en la model card.
- Benchmark de referencia para el robot SO-101: permite comparar nuevas políticas contra un checkpoint conocido en la tarea "pick the tape reel".
- Docencia y experimentación en robótica: ejemplo mínimo (5 episodios, 3.525 fotogramas) para ilustrar el flujo completo de grabación, entrenamiento y despliegue.
- Pruebas de integración del stack LeRobot 0.7.0: valida la compatibilidad de `lerobot-rollout` con el robot `so_follower` y dos cámaras OpenCV.
- Base para fine-tuning: punto de partida para adaptar la política a tareas similares de pick-and-place con pocos datos adicionales.
- Validación de hardware y calibración: útil para verificar que el robot, las cámaras y los puertos están correctamente configurados antes de entrenar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tasas de éxito en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (51,7 M de parámetros) es un modelo muy ligero, pero no se documenta el consumo exacto.
- GPU recomendadas: no disponible; LeRobot soporta `--policy.device=cuda`, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable por el reducido número de parámetros, pero no confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para CUDA según la configuración de entrenamiento.
- Latencia y throughput: no disponibles; dependen del hardware y de la frecuencia de control del robot (30 FPS en los datos de entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_pick_place_test (este) | 51,7 M | no aplica | Pick-and-place SO-101 | no disponible | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Manipulación genérica | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación genérica | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación se limita a categoría (políticas de imitation learning para robótica) y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 5 episodios y 3.525 fotogramas, lo que limita la generalización y aumenta el riesgo de sobreajuste.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Tarea única y específica: entrenada solo para "Grab the tape reel and put it on the green board"; no se espera que funcione en otras tareas.
- Licencia no especificada: la model card indica "[More Information Needed]"; no se puede garantizar uso comercial.
- Dependencia de hardware concreto: requiere robot SO-101 (`so_follower`), dos cámaras con nombres `front` y `wrist`, y configuración exacta de puertos e índices.
- Sensible a cambios de entorno: posiciones de objetos, iluminación, distractores o un robot distinto del mismo tipo pueden degradar el rendimiento (advertencia estándar de la plantilla de la model card).
- Sin soporte de lenguaje natural ni razonamiento: no es adecuado para tareas cognitivas o conversacionales.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiyu705/act_so101_pick_place_test
- Dataset de entrenamiento: https://huggingface.co/datasets/kiyu705/so101_pick_place_20261122_141206
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kiyu705/so101_pick_place_20261122_141206
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
