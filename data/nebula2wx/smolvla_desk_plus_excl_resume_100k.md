# nebula2wx/smolvla_desk_plus_excl_resume_100k

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Esta ficha concreta, `nebula2wx/smolvla_desk_plus_excl_resume_100k`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de demostraciones robóticas (`local/standard_task_4plus5`), orientado a una tarea concreta de manipulación: recoger un bloque rojo y colocarlo en un plato. El modelo tiene 450 millones de parámetros y está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores que no disponen de clústeres de GPU.

La relevancia de SmolVLA radica en su enfoque: un VLA ligero que combina percepción visual, comprensión del lenguaje y generación de acciones motoras en un único modelo, con un coste computacional reducido. Frente a propuestas de VLA de mayor tamaño (decenas de miles de millones de parámetros), SmolVLA apuesta por la eficiencia y el despliegue en robots de bajo coste como el SO-100/SO-101 de LeRobot. Esta variante concreta es un ejemplo de fine-tuning de imitación sobre 127 episodios y 77 729 frames a 30 FPS, con 100 000 pasos de entrenamiento.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, y se ejecuta mediante la librería LeRobot. No obstante, conviene subrayar que se trata de una política específica para una tarea y un robot concretos (`so_follower`), no de un modelo generalista: su utilidad fuera de ese dominio es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA |
| Parámetros totales | 450 046 176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Librería | lerobot |
| Tipo de robot | so_follower |
| Cámaras de entrada | head, wrist (más `empty_camera_0`) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida de acción | `action` de forma `(6,)` |
| Dataset de entrenamiento | local/standard_task_4plus5 (127 episodios, 77 729 frames, 30 FPS) |
| Pasos de entrenamiento | 100 000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repo | 13.2 GB |
| Descargas | 17 |
| Likes | 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que integra un codificador visual, un componente de comprensión del lenguaje y un decodificador de acciones en una arquitectura compacta de 450 millones de parámetros. El modelo consume observaciones multimodales —imágenes de varias cámaras (`head`, `wrist`, `empty_camera_0`) y un vector de estado del robot de 6 dimensiones— y produce un vector de acción de 6 dimensiones. La model card no detalla la composición interna exacta (número de capas, tipo de atención, estrategia de fusión multimodal), por lo que esa información debe consultarse en el paper asociado (arXiv:2506.01844).

El entrenamiento de esta variante es un fine-tuning por imitación (behavior cloning) desde `lerobot/smolvla_base`, realizado con LeRobot 0.6.2 durante 100 000 pasos, batch size 8, AdamW con learning rate 0.0001 y semilla 1000. El dataset contiene 127 episodios y 77 729 frames grabados a 30 FPS para una única tarea: "pick up the red block and put it on the plate". No se documenta en la model card el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje supervisado a partir de demostraciones. Tampoco se especifican innovaciones técnicas adicionales más allá de las propias del modelo base SmolVLA.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de cámara `head`, `wrist` y una cámara adicional (`empty_camera_0`), con resoluciones de 256×256 y 480×640.
- Ejecución de una tarea específica de pick-and-place: "pick up the red block and put it on the plate".
- Aprendizaje por imitación: política entrenada para replicar demostraciones humanas sobre el robot.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite inferencia en GPU de gama media.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto general, matemáticas, código ni procesamiento de audio.
- Capacidades multilingües: no disponibles; el modelo no es un LLM de propósito general.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un bloque rojo y depositarlo en un plato sobre un robot SO-100/SO-101, adecuado para prototipos de investigación en manipulación.
- Reproducción de experimentos de imitación: sirve como referencia para comparar políticas entrenadas con distintos datasets o hiperparámetros, dado que la configuración de entrenamiento está completamente documentada.
- Base para fine-tuning en tareas similares: al partir de `lerobot/smolvla_base` y estar entrenado con LeRobot, puede reutilizarse como punto de partida para nuevas tareas de manipulación con el mismo robot.
- Docencia y formación en robótica: su tamaño reducido y su licencia Apache 2.0 lo hacen apto para cursos prácticos de VLA e imitación sin necesidad de infraestructura costosa.
- Validación de pipelines de datos robóticos: permite comprobar el flujo completo de grabación, entrenamiento y despliegue con LeRobot usando un dataset pequeño (127 episodios).
- Despliegue en robots de bajo coste: al caber en GPU de consumo, puede ejecutarse en estaciones de trabajo locales o en el propio puesto de trabajo del robot, sin depender de la nube.
- Pruebas de robustez visual: al usar varias cámaras con resoluciones distintas, permite evaluar cómo afectan cambios de iluminación, posición de objetos o distracciones a la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parámetros, en FP32 serían aproximadamente 1,8 GB solo de pesos; en FP16, unos 0,9 GB; en cuantización de 8 bits, unos 0,45 GB. A ello hay que sumar el coste de los codificadores visuales y de las activaciones, por lo que se recomienda un mínimo de 4-8 GB de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3060/4060, RTX 4090, A100 y H100; las GPU de consumo son suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas robóticas.
- Latencia y throughput: no disponibles. La model card no proporciona mediciones de frecuencia de control ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebula2wx/smolvla_desk_plus_excl_resume_100k | 450 M | no disponible | Pick-and-place específico (SO follower) | Apache 2.0 | Hugging Face, 17 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("pick up the red block and put it on the plate") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del entorno: el rendimiento puede degradarse con cambios de iluminación, posiciones de objetos, distracciones o un robot distinto del mismo tipo.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones erráticas ante observaciones fuera de la distribución de entrenamiento.
- Sesgos: no documentados; el dataset es pequeño (127 episodios) y puede reflejar sesgos de las demostraciones (posiciones, colores, condiciones concretas).
- Limitaciones de idioma: no aplica como modelo de texto; las instrucciones de tarea se limitan a la cadena de la tarea entrenada.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias de los componentes del modelo base y del dataset.
- Requisitos de calibración: el despliegue exige que los nombres e índices de cámara coincidan con las claves de observación del entrenamiento; un desajuste invalida la inferencia.
- Repositorio grande (13.2 GB) pese al tamaño del modelo, lo que puede dificultar su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebula2wx/smolvla_desk_plus_excl_resume_100k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Guía rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento: https://huggingface.co/datasets/local/standard_task_4plus5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/standard_task_4plus5
