# ethanCSL/openarm_pringles_lerobot_real_to_sim_10_3cam_v00

## Resumen

`ethanCSL/openarm_pringles_lerobot_real_to_sim_10_3cam_v00` es un modelo de política viso-lenguaje-acción (VLA) para robótica, resultado del ajuste fino de `lerobot/smolvla_base` sobre un conjunto de datos propio de demostraciones de manipulación. Lo desarrolla el usuario de Hugging Face `ethanCSL` y se distribuye con licencia Apache 2.0 dentro del ecosistema LeRobot. El modelo resuelve una tarea concreta: coger un bote de Pringles con el brazo derecho y pasarlo al brazo izquierdo, sobre el robot `openarm_umeow`.

Se trata de SmolVLA, un VLA compacto de aproximadamente 450 millones de parámetros que procesa tres cámaras RGB a 256x256 píxeles junto con un vector de estado de 6 dimensiones, y emite un vector de acción de 16 dimensiones. Su relevancia radica en que demuestra el flujo completo de imitación real-to-sim con hardware de consumo, un caso práctico de ajuste fino de un modelo base abierto para una tarea bimanual específica.

El repositorio es pequeño (0,9 GB), no acumula descargas ni valoraciones y no incluye resultados de evaluación en el momento de redactar esta ficha. La información disponible se limita a la model card del autor y a los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción), ajuste fino de `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de SmolVLA, un VLA compacto descrito en el paper arXiv:2506.01844. La entrada combina tres flujos visuales (`observation.images.camera1`, `camera2` y `camera3`, cada uno de forma `(3, 256, 256)`) con un vector de estado propioceptivo `observation.state` de forma `(6,)`. La salida es un vector de acción de forma `(16,)`. La model card identifica las cámaras como `body_cam`, `wrist_cam` y `right_wrist_cam`, y el tipo de robot como `openarm_umeow`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_pringles_lerobot_real_to_sim_10_3cam_v00`, compuesto por 65 episodios y 16.654 fotogramas a 30 FPS, con la tarea "Pick up the Pringles can with the right arm, hand it to the left arm". La configuración reportada es de 20.000 pasos, batch size 16, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. No se documentan detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Control robótico de manipulación bimanual: genera acciones de 16 dimensiones a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres cámaras RGB (cuerpo y ambas muñecas) a 256x256.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante una cadena de texto en la invocación (`--task`).
- Aprendizaje por imitación: política entrenada a partir de demostraciones teleoperadas.
- Ejecución en hardware de consumo: SmolVLA está diseñado para desplegarse en equipos asequibles según el paper.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión general, audio ni modo de pensamiento.

## Casos de uso

- Manipulación bimanual de objetos cilíndricos: el modelo ejecuta la secuencia de agarre con el brazo derecho y transferencia al izquierdo, adecuado para tareas de pick-and-handover en líneas de ensamblaje o laboratorios.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar transferencia real-to-sim con SmolVLA y LeRobot.
- Prototipado de políticas VLA en hardware de consumo: al tener 450 M de parámetros y pesos safetensors, puede ejecutarse en estaciones de trabajo convencionales con GPU de gama media.
- Generación de datos sintéticos y aumentación: el nombre del dataset sugiere un pipeline real-to-sim que puede reutilizarse para entrenar variantes con más posiciones de objeto o iluminación.
- Docencia y formación en robótica: ejemplo completo de grabación de datos, entrenamiento y despliegue con la CLI de LeRobot.
- Base para ajuste fino en tareas similares: al derivar de `lerobot/smolvla_base`, puede reentrenarse con nuevos datasets de manipulación bimanual manteniendo la interfaz de observaciones y acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 M de parámetros en fp32 el peso ronda 1,8 GB, aunque no se confirma el formato de despliegue.
- GPU recomendadas: no disponible; SmolVLA se describe como desplegable en hardware de consumo según el paper.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmada en la documentación del repositorio.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`openarm_pringles_...`) | 450.046.176 | no disponible | Manipulación bimanual Pringles | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para ajuste fino | no disponible en la información | Hugging Face |
| OpenVLA | no disponible en la información | no disponible | VLA generalista | no disponible en la información | no disponible |
| RT-2 | no disponible en la información | no disponible | VLA generalista | no disponible en la información | no disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto o parámetros con alternativas de forma rigurosa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni pruebas en robot real publicadas.
- Especialización extrema: entrenado para una única tarea y un único tipo de robot (`openarm_umeow`); no generaliza a otras tareas sin reentrenamiento.
- Dependencia de las cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento.
- Dataset pequeño: 65 episodios y 16.654 fotogramas limitan la robustez ante variaciones de posición, iluminación o distractores.
- Riesgo de sobreajuste al entorno de grabación: no se documentan pruebas con objetos o condiciones distintas.
- Idiomas: no se especifican; la instrucción de tarea está en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin métricas de latencia ni requisitos de hardware confirmados para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_pringles_lerobot_real_to_sim_10_3cam_v00
- Dataset: https://huggingface.co/datasets/ethanCSL/openarm_pringles_lerobot_real_to_sim_10_3cam_v00
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
