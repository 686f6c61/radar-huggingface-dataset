# amais23/so101_smolvla_cube_pouring_45ep

## Resumen

`amais23/so101_smolvla_cube_pouring_45ep` es una política de imitación para robótica basada en SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. El modelo parte de `lerobot/smolvla_base` y se ha afinado sobre el dataset propio `amais23/so101_cube_pouring` para ejecutar una tarea concreta de manipulación: verter un cubo desde una taza de origen a una taza de destino con un robot SO-101 de tipo `so_follower`.

Con 450 millones de parámetros totales, el modelo está pensado para desplegarse en hardware de consumo, no en clústeres de GPU. Consume observaciones multimodales (estado de las articulaciones de 6 dimensiones y hasta cuatro flujos de imagen) y produce un vector de acción de 6 dimensiones a 30 FPS. Es relevante porque demuestra el flujo completo de LeRobot para afinar políticas VLA pequeñas sobre hardware asequible y publicarlas en el Hub.

Se trata de un artefacto muy específico: no es un modelo de propósito general, sino un checkpoint de investigación entrenado con 50 episodios y 33.360 fotogramas para una única tarea. Su utilidad principal es reproducir el pipeline de entrenamiento e inferencia de SmolVLA con LeRobot 0.6.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, transformer multimodal) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.1 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower (SO-101) |
| Entradas | `observation.state` (6,), 3 cámaras a (3, 256, 256), 1 cámara a (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 26,4 GB |
| Descargas | 23 |
| Fecha de creación | 2026-11-12 |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones en un transformer multimodal. La política consume el estado de las articulaciones y las imágenes de las cámaras (frontal y de muñeca, más otras entradas visuales registradas) junto con una instrucción en lenguaje natural, y emite directamente las acciones de control del robot. El modelo se ha diseñado explícitamente para reducir el coste computacional y poder ejecutarse en hardware de consumo.

El afinamiento se realizó sobre el dataset `amais23/so101_cube_pouring`: 50 episodios, 33.360 fotogramas a 30 FPS, con la tarea "Pour the cube from the source cup into the target cup". La configuración de entrenamiento fue de 20.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. No se documentan detalles sobre el preentrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible.

## Capacidades

- Control robótico de imitación para una tarea concreta de manipulación (verter un cubo entre dos tazas).
- Fusión multimodal de estado articular (6 dimensiones) e imágenes de varias cámaras (frontal y de muñeca).
- Condicionamiento por instrucción en lenguaje natural ("Pour the cube from the source cup into the target cup").
- Generación de acciones continuas de 6 dimensiones a 30 FPS para un robot SO-101 (`so_follower`).
- Despliegue en hardware de consumo gracias a su tamaño compacto (450 M parámetros).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como referencia para validar el pipeline completo de LeRobot (grabación de datos, entrenamiento y rollout) sobre un robot SO-101 real.
- Investigación en VLA de bajo coste: permite estudiar el comportamiento de SmolVLA en tareas de manipulación con hardware asequible, sin necesidad de GPUs de datacenter.
- Benchmark de políticas de manipulación: puede usarse como línea base para comparar nuevas políticas entrenadas sobre el mismo dataset de vertido de cubos.
- Docencia y formación en robótica: el modelo y su dataset asociado permiten ilustrar el ciclo de aprendizaje por imitación de principio a fin con una tarea sencilla y medible.
- Prototipado de tareas pick-and-place similares: con un nuevo afinamiento sobre datos propios, la base SmolVLA puede adaptarse a tareas de transferencia de objetos entre recipientes.
- Validación de hardware SO-101: útil para comprobar la calibración de cámaras y articulaciones antes de entrenar políticas propias, ejecutando un rollout corto con `--duration`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M parámetros en precisión completa (fp32) el peso ronda 1,8 GB, y en fp16/bf16 unos 0,9 GB, a lo que hay que sumar activaciones y codificadores visuales.
- GPU recomendadas: no especificadas por el autor; el modelo está diseñado para hardware de consumo.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se documenta una lista concreta de GPUs verificadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento), con `--policy.device=cuda`.
- Latencia y throughput: no disponibles; la política opera a 30 FPS según la frecuencia del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amais23/so101_smolvla_cube_pouring_45ep | 450 M | no disponible | Vertido de cubo (SO-101) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para afinamiento | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información | no disponible | Manipulación por imitación | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Pour the cube from the source cup into the target cup"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad.
- Dataset pequeño: 50 episodios y 33.360 fotogramas son una base limitada; es probable que el modelo sea sensible a cambios de posición de objetos, iluminación o distracciones.
- Dependencia de hardware concreto: requiere un robot SO-101 (`so_follower`) y una configuración de cámaras que coincida con las claves de observación del entrenamiento (frontal, muñeca y cámaras adicionales, incluida `empty_camera_0`).
- Riesgo de sobreajuste al entorno de grabación: no se documenta variabilidad de escenarios.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Tamaño del repositorio de 26,4 GB: conviene revisar qué artefactos adicionales incluye antes de descargarlo en entornos con espacio limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amais23/so101_smolvla_cube_pouring_45ep
- Dataset de entrenamiento: https://huggingface.co/datasets/amais23/so101_cube_pouring
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=amais23/so101_cube_pouring
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
