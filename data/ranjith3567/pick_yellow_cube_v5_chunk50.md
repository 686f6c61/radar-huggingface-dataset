# ranjith3567/pick_yellow_cube_v5_chunk50

## Resumen

`pick_yellow_cube_v5_chunk50` es una política de control robótico de tipo vision-language-action (VLA) entrenada mediante aprendizaje por imitación con el framework LeRobot de Hugging Face. Está construida sobre la arquitectura SmolVLA, un modelo compacto y eficiente presentado en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje pequeño y un cabezal de acciones para generar comandos motores directamente a partir de observaciones multimodales. El modelo tiene 450.046.176 parámetros y un tamaño de repositorio de 0,9 GB en formato safetensors.

La política está especializada en una única tarea de manipulación: recoger un bloque amarillo y depositarlo en una caja marrón. Fue entrenada con un dataset propio de 100 episodios y 63.143 fotogramas a 30 FPS, capturados con un robot `so_follower` y varias cámaras (dos superiores y una lateral, además de una cámara vacía de resolución 480x640). El modelo consume el estado articular de 6 dimensiones y las imágenes de las cámaras para producir un vector de acción también de 6 dimensiones.

Es relevante como ejemplo de despliegue de VLA compactos en hardware de consumo dentro del ecosistema LeRobot, y como caso práctico de entrenamiento de políticas de imitación con SmolVLA. No obstante, se trata de un modelo muy específico de un autor individual, sin licencia declarada, sin resultados de evaluación publicados y con cero descargas, por lo que su uso en producción requeriría validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), política de imitación sobre LeRobot |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de robótica, no conversacional) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `Top`, `Side` (más `empty_camera_0`) |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entradas visuales | `camera1`, `camera2`, `camera3` a `(3, 256, 256)`; `empty_camera_0` a `(3, 480, 640)` |
| Salida de acción | `action`, forma `(6,)` |
| Dataset de entrenamiento | `ranjith3567/pick_yellow_cube_v5_20261105_191046` (100 episodios, 63.143 fotogramas, 30 FPS) |
| Tarea | "pick the yellow block and place it in brown box" |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina percepción visual, comprensión del lenguaje y generación de acciones en un único pipeline. La política consume observaciones multimodales (estado articular de 6 dimensiones e imágenes de varias cámaras) y produce un vector de acción de 6 dimensiones que controla el robot `so_follower`. El nombre del repositorio (`chunk50`) sugiere el uso de action chunking con fragmentos de 50 acciones, una técnica habitual en políticas de imitación para reducir la frecuencia de inferencia y mejorar la suavidad del movimiento, aunque este dato no se detalla explícitamente en la model card.

El entrenamiento se realizó con LeRobot 0.6.2 mediante aprendizaje por imitación supervisado sobre 100 episodios (63.143 fotogramas a 30 FPS) de la tarea de recoger el cubo amarillo y colocarlo en la caja marrón. Se usaron 100.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-4 con seed 1000. No se documenta el uso de RLHF, DPO ni datos adicionales fuera del dataset propio; tampoco se especifican innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de estado articular e imágenes.
- Percepción visual multi-cámara: procesa tres cámaras a 256x256 y una cuarta a 480x640.
- Ejecución de una tarea concreta de pick-and-place: "pick the yellow block and place it in brown box".
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Despliegue en hardware de consumo: SmolVLA está diseñado para ejecutarse en equipos de gama consumer según el paper.
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje conversacional).
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede controlar un robot `so_follower` para recoger un cubo amarillo y depositarlo en una caja marrón, reproduciendo la tarea demostrada en los 100 episodios de entrenamiento.
- Prototipado de políticas VLA con LeRobot: sirve como referencia para entender el flujo completo de entrenamiento y despliegue de SmolVLA con `lerobot-train` y `lerobot-rollout`.
- Base para fine-tuning en tareas similares: al partir de una política ya entrenada en manipulación de objetos, puede adaptarse a variantes de la tarea con un dataset propio adicional.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto de hiperparámetros (pasos, batch size, learning rate) en el éxito de una política concreta.
- Docencia y demostraciones de robótica: ejemplo reproducible de pipeline VLA completo con dataset, configuración de entrenamiento y comandos de ejecución documentados.
- Evaluación de action chunking: el sufijo `chunk50` permite experimentar con la longitud de fragmento de acciones y su impacto en la suavidad y latencia del control.
- Benchmark interno de hardware: al ser un modelo de 450 M de parámetros y 0,9 GB, permite medir latencia de inferencia en GPUs de consumo dentro de un bucle de control a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (0,9 GB), la inferencia en FP32 requeriría aproximadamente 1,8 GB de pesos, más overhead de activaciones y codificadores visuales.
- GPU recomendadas: no especificadas por el autor; SmolVLA está diseñado para hardware de consumo según el paper.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial ni cifras medidas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=ranjith3567/pick_yellow_cube_v5_chunk50`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el control opera a 30 FPS según el dataset, pero no se publican medidas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pick_yellow_cube_v5_chunk50` (este) | 450.046.176 | no disponible | Pick-and-place de cubo amarillo | no disponible | Hugging Face, 0 descargas |
| SmolVLA (modelo base del paper) | no disponible en la información | no disponible | VLA generalista compacto | no disponible en la información | Paper arXiv:2506.01844 |
| Otras políticas LeRobot del mismo autor (p. ej. `pick_and_place_black_yellow_cubes`) | no disponible | no disponible | Pick-and-place de cubos | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para una tarea concreta ("pick the yellow block and place it in brown box") y un robot concreto (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que se desconoce su fiabilidad.
- Licencia no disponible: no se declara licencia, lo que impide confirmar si el uso comercial está permitido; se debe contactar con el autor antes de cualquier uso en producción.
- Sesgos y alucinaciones: al ser una política de imitación, puede reproducir sesgos de las demostraciones (posiciones, iluminación, disposición de objetos del dataset) y fallar ante configuraciones no vistas.
- Dependencia del entorno: cambios en iluminación, posición de objetos, cámara o robot pueden degradar el rendimiento; no se documentan pruebas de robustez.
- Cámara vacía: la entrada `observation.images.empty_camera_0` a 480x640 sugiere una configuración de cámaras incompleta o mal etiquetada, lo que puede afectar a la inferencia si no se replica exactamente.
- Idiomas no aplicables: no es un modelo de lenguaje; no debe evaluarse con métricas de texto.
- Madurez: cero descargas y cero likes, creado y actualizado en noviembre de 2026, sin señales de validación por la comunidad.
- Requisitos de hardware no confirmados: aunque el tamaño sugiere que cabe en GPU consumer, no hay medidas oficiales de VRAM ni latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset relacionado en Claru: https://claru.ai/datasets/ranjith3567-pick-yellow-cube-20261009-203921
- Dataset relacionado del mismo autor: https://huggingface.co/datasets/ranjith3567/pick_and_place_black_yellow_cubes_20261104_185149
