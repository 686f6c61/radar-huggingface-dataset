# SamerAyyad/VLA_Samer_31.10.2026_450eps_XVLA_policy

## Resumen

X-VLA es un marco de Vision-Language-Action (VLA) basado en *soft prompting* y *flow matching*, desarrollado en el ecosistema LeRobot de Hugging Face. El modelo trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles, lo que permite que un único modelo reconcilie morfologías de robot, sensores y espacios de acción diversos. Esta ficha concreta es un *fine-tuning* del modelo base `lerobot/xvla-base` sobre un dataset propio de 450 episodios.

El checkpoint aquí descrito (`SamerAyyad/VLA_Samer_31.10.2026_450eps_XVLA_policy`) es una política de imitación entrenada para un robot UR5 equipado con pinza de succión, con la tarea específica de recoger una CPU y depositarla en una caja. Cuenta con aproximadamente 880 millones de parámetros y consume tres flujos visuales junto con el estado del robot para producir acciones de 7 dimensiones.

Su relevancia radica en que demuestra el flujo de trabajo completo de LeRobot para adaptar un VLA preentrenado a una tarea concreta de manipulación con un dataset relativamente modesto (293.624 fotogramas a 30 FPS), publicable íntegramente en el Hub con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con soft prompting y flow matching (X-VLA) |
| Parámetros totales | 879.687.256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

X-VLA es un framework VLA que combina un codificador visión-lenguaje con un cabezal de acciones basado en *flow matching*. La innovación principal es el uso de *Soft Prompt embeddings* aprendibles que codifican la identidad del robot (morfología, sensores, espacio de acción) como una "tarea" adicional, permitiendo que un mismo modelo base sirva para múltiples plataformas sin cambios arquitectónicos. El modelo procesa tres cámaras (dos a 256×256 y una a 224×224) junto con un vector de estado de 8 dimensiones, y emite acciones de 7 dimensiones.

Este checkpoint se ha obtenido por *fine-tuning* del modelo base `lerobot/xvla-base` sobre el dataset `SamerAyyad/VLA_Samer_31.10.2026_450eps` (450 episodios, 293.624 fotogramas, 30 FPS). La configuración de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador `xvla-adamw` con learning rate 1e-4, semilla 1000 y LeRobot 0.6.2. No se especifica en la información disponible el número de tokens de preentrenamiento del modelo base ni la composición del dataset original, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones a partir de observaciones visuales y de estado para un robot UR5 con pinza de succión.
- Percepción visual multi-cámara: integra tres flujos de imagen simultáneos (dos de 256×256 y uno de 224×224) para construir la representación del entorno.
- Ejecución de tareas de pick-and-place: entrenado específicamente para "Pick up the CPU with the suction gripper and place it in the box".
- Aprendizaje por imitación: política entrenable mediante el pipeline de LeRobot a partir de datasets de demostración.
- Transferencia entre morfologías: el diseño de soft prompts del modelo base permite, en teoría, adaptar el mismo framework a otros robots y espacios de acción.
- Despliegue mediante CLI de LeRobot (`lerobot-rollout`) con soporte para ejecución en tiempo real con cámaras OpenCV.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni procesamiento de audio en la información disponible.

## Casos de uso

- Automatización de pick-and-place industrial: el modelo ejecuta la secuencia de recogida de una CPU con ventosa y su depósito en una caja sobre un UR5, adecuado para tareas repetitivas de manipulación en líneas de montaje o clasificación.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para equipos que quieran validar el pipeline de LeRobot (grabación, entrenamiento, rollout) antes de invertir en datasets mayores.
- Investigación en aprendizaje por imitación: permite reproducir y comparar experimentos con X-VLA sobre un dataset público de 450 episodios, facilitando la comparación de hiperparámetros y estrategias de aumento de datos.
- Benchmark de referencia para VLA en manipulación con ventosa: útil como baseline en estudios sobre robustez frente a cambios de iluminación, posición de objetos o distracciones, dado que la tarea está bien delimitada.
- Formación y docencia en robótica: ejemplo completo y reproducible de un flujo de trabajo de VLA con licencia permisiva, apropiado para cursos de robótica de manipulación o aprendizaje automático aplicado.
- Base para *fine-tuning* en dominios adyacentes: al estar bajo Apache 2.0, puede adaptarse a tareas similares (otras piezas, otros contenedores) partiendo de este checkpoint en lugar del modelo base, reduciendo el coste de entrenamiento.
- Integración en entornos de simulación o gemelos digitales: la política puede evaluarse en simuladores compatibles antes de transferirla al UR5 físico, aunque no se documenta soporte explícito de simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 879,7 millones de parámetros, en FP16 se requieren aproximadamente 1,8 GB solo para los pesos; con overhead de activaciones y procesamiento de tres cámaras a 256×256/224×224, se estima un consumo práctico de 4-8 GB de VRAM, aunque este dato no está confirmado en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3090, RTX 4090, A100 o H100 son opciones razonables; también GPUs de gama media con al menos 8 GB podrían ser suficientes en FP16.
- Compatibilidad con GPU de consumo: probable en RTX 3060/4060 en adelante, aunque no verificado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento), con soporte de `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. La ejecución se realiza a 30 FPS según la configuración del dataset, pero no se especifica si la política alcanza ese ritmo en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_31.10.2026_450eps_XVLA_policy | 879,7 M | no disponible | Manipulación UR5 (pick-and-place) | Apache 2.0 | Hugging Face Hub |
| lerobot/xvla-base | no disponible | no disponible | VLA base multi-robot | Apache 2.0 (según modelo base) | Hugging Face Hub |
| Políticas ACT / Diffusion Policy de LeRobot | no disponible | no disponible | Manipulación por imitación | Apache 2.0 | Hugging Face Hub / LeRobot |
| OpenVLA | ~7 B | no disponible | VLA generalista | no disponible en esta ficha | Hugging Face Hub |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de parámetros y contexto de los modelos comparables no se han verificado en esta búsqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un único dataset y una única tarea, la política probablemente está sobreajustada a las condiciones específicas de recogida de datos (posición de la CPU, iluminación, fondo, configuración de cámaras).
- Riesgo de alucinación: en el contexto de políticas VLA, el equivalente es la generación de acciones no válidas o inseguras fuera de la distribución de entrenamiento; no se han publicado evaluaciones de robustez.
- Limitaciones de contexto o idioma: no aplica un contexto de lenguaje natural en el sentido habitual; la tarea se especifica mediante una cadena fija. No se documentan capacidades multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar la licencia del modelo base `lerobot/xvla-base` y del dataset de entrenamiento para confirmar compatibilidad.
- Ausencia de evaluación: la model card indica que no hay resultados de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia del hardware: la política está acoplada a la configuración exacta de cámaras (`observation.images.image`, `image2`, `image3`) y al UR5 con pinza de succión; cambios en la disposición de sensores o en el robot requieren reentrenamiento.
- Dataset limitado: 450 episodios y una sola tarea reducen la generalización a variaciones de objeto, posición o entorno no vistas durante el entrenamiento.
- Sin demo ni vídeo: el autor no ha incluido un GIF o vídeo de la política en funcionamiento, lo que dificulta la validación cualitativa por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_31.10.2026_450eps_XVLA_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_31.10.2026_450eps
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv:2510.10274)
- Guía de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_31.10.2026_450eps
