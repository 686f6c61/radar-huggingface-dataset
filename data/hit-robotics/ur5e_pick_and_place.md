# HIT-Robotics/ur5e_pick_and_place

## Resumen

`HIT-Robotics/ur5e_pick_and_place` es una política de robótica entrenada con LeRobot sobre el modelo fundacional MolmoAct2 de Ai2 (Allen Institute for AI), cuyo objetivo es mapear imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones (action chunks) para un brazo robótico Universal Robots UR5e. El modelo resuelve una tarea concreta de manipulación pick-and-place: colocar un ladrillo de color (amarillo, rosa o verde) dentro de una taza azul, usando dos cámaras (muñeca y vista cenital) y el estado articular del robot como entrada.

El repositorio contiene 5.591.928.368 parámetros en formato safetensors (11,5 GB), lo que corresponde al backbone MolmoAct2 adaptado como política de imitación. La entrada incluye el estado del robot de 7 dimensiones y dos imágenes RGB de 480x640 píxeles; la salida es un vector de acción de 7 dimensiones, coherente con los 6 grados de libertad del UR5e más el gripper.

Es relevante porque demuestra el flujo completo de LeRobot para ajustar un modelo fundacional de robótica a un robot real con un dataset pequeño (63 episodios, 42.778 frames a 30 FPS) y una configuración de entrenamiento reproducible (8.000 pasos, batch 16, AdamW, LR 1e-5). No obstante, se trata de un artefacto de investigación sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (política visuomotora sobre backbone VLM, implementación LeRobot) |
| Parametros totales | 5.591.928.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política de imitación construida sobre MolmoAct2, el modelo fundacional de robótica de Ai2 que traduce imágenes de cámara e instrucciones en lenguaje a chunks de acciones. La implementación corresponde al tipo de política `molmoact2` de LeRobot 0.6.1. La entrada se compone de `observation.state` (7 dimensiones), `observation.images.wrist_cam` y `observation.images.top_cam` (ambas 3x480x640), y la salida es `action` (7 dimensiones). El robot objetivo es un UR5e con dos cámaras.

El ajuste se realizó sobre el dataset `HIT-Robotics/Pick_and_Place_20261109_120057`, con 63 episodios y 42.778 frames a 30 FPS, para tres tareas de pick-and-place con ladrillos amarillo, rosa y verde sobre una taza azul. La configuración de entrenamiento fue de 8.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan detalles sobre el corpus de preentrenamiento de MolmoAct2 ni sobre etapas de RLHF/DPO en esta ficha.

## Capacidades

- Generación de acciones robóticas a partir de imágenes y una instrucción en lenguaje natural (action chunking).
- Manipulación pick-and-place con un UR5e: colocar ladrillos de color en una taza azul.
- Fusión de dos vistas de cámara (muñeca y cenital) junto con el estado articular del robot.
- Condicionamiento por instrucción de tarea en inglés ("Place the yellow brick in the blue cup", etc.).
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia `base`.
- Entrenamiento y reentrenamiento mediante `lerobot-train` con `--policy.type=molmoact2`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la colocación de ladrillos de color en una taza sobre un UR5e, usando las dos cámaras como realimentación visual y la instrucción de tarea como condicionamiento.
- Base para fine-tuning en tareas de ensamblaje: al ser una política MolmoAct2 entrenada con LeRobot, sirve como punto de partida para reentrenar con nuevos datasets y objetos mediante `lerobot-train`.
- Prototipado rápido de políticas visuomotoras: permite validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) en un robot UR5e real con un dataset de 63 episodios.
- Investigación en imitación con múltiples vistas: útil para estudiar el efecto de la cámara de muñeca frente a la cenital en tareas de manipulación fina.
- Docencia y reproducción de experimentos: la configuración de entrenamiento y el dataset están publicados, lo que facilita reproducir el ajuste y comparar variantes.
- Evaluación de modelos fundacionales de robótica: sirve como referencia para medir la adaptación de MolmoAct2 a un robot industrial de 6 ejes más gripper.
- Demostraciones de manipulación condicionada por lenguaje: el modelo acepta instrucciones de tarea distintas para seleccionar el objeto (amarillo, rosa, verde) y colocarlo en el destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 5,59 mil millones de parámetros en safetensors (11,5 GB), la inferencia en FP16 requeriría del orden de 11-12 GB de VRAM, aunque este dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos, sería plausible en GPUs con 16 GB o más en FP16, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HIT-Robotics/ur5e_pick_and_place | 5.591.928.368 | no disponible | Pick-and-place UR5e | Apache 2.0 | Hugging Face |
| MolmoAct2 (Ai2) | no disponible | no disponible | Modelo fundacional de robótica | no disponible | Blog de Ai2 |
| Otras políticas LeRobot | no disponible | no disponible | Imitación robótica | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en el robot.
- Entrenado para una tarea muy concreta (tres variantes de color de ladrillo y una taza azul); no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Depende de una configuración exacta de hardware: UR5e y dos cámaras con nombres `wrist_cam` y `top_cam` a 480x640 y 30 FPS.
- Dataset pequeño (63 episodios, 42.778 frames), lo que limita la robustez ante cambios de iluminación, distractores o posiciones no vistas.
- Las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: al ser una política de control físico, requiere supervisión y paradas de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías desaconseja su uso en producción sin validación propia.
- No se documentan sesgos, pero al derivar de un modelo fundacional podría heredar sesgos del corpus de preentrenamiento de MolmoAct2, no detallados aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HIT-Robotics/ur5e_pick_and_place
- Dataset de entrenamiento: https://huggingface.co/datasets/HIT-Robotics/Pick_and_Place_20261109_120057
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HIT-Robotics/Pick_and_Place_20261109_120057
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía LeRobot MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
