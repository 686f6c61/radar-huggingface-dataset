# HIT-Robotics/dummy

## Resumen

HIT-Robotics/dummy es una política robótica de imitación publicada en Hugging Face por la organización HIT-Robotics, entrenada con la librería LeRobot sobre la arquitectura MolmoAct2. MolmoAct2 es un modelo fundacional de robótica abierto desarrollado por el Allen Institute for AI (Ai2) que transforma imágenes de cámara e instrucciones en lenguaje en secuencias de acciones para robots. El repositorio empaqueta los pesos en formato safetensors con 5.591.928.368 parámetros (aproximadamente 5,6 mil millones) y un tamaño total de 11,5 GB.

El modelo está especializado en una única tarea de manipulación: colocar un ladrillo amarillo en una taza azul, ejecutada por un robot UR5e equipado con dos cámaras (muñeca y cenital). La política consume el estado del robot de 7 dimensiones y dos flujos de imagen de 3×480×640, y produce un vector de acción de 7 dimensiones. Su relevancia es limitada como artefacto de producción: el entrenamiento registrado es de solo 2 pasos con un batch de 16 sobre un conjunto de 3 episodios y 793 fotogramas, lo que lo convierte en una prueba de concepto o plantilla de integración más que en un modelo utilizable.

La ficha describe tanto la arquitectura subyacente MolmoAct2 como las características concretas de este checkpoint, que hereda la licencia Apache 2.0 del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo fundacional de robótica visión-lenguaje-acción, implementación LeRobot) |
| Parámetros totales | 5.591.928.368 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | UR5e |
| Cámaras de entrada | wrist_cam, top_cam (3×480×640 cada una) |
| Dimensión de estado | 7 |
| Dimensión de acción | 7 |
| Tamaño del repositorio | 11,5 GB |
| Librería | LeRobot 0.6.1 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo fundacional de robótica que mapea observaciones visuales y lenguaje natural a "chunks" de acciones (secuencias de comandos motores de corto horizonte). La implementación disponible en LeRobot permite tanto el entrenamiento como la evaluación del modelo regular. No se dispone en la información proporcionada de detalles sobre el número de capas, el mecanismo de atención, el esquema de fusión visión-lenguaje ni la composición exacta del corpus de preentrenamiento del modelo base.

El checkpoint concreto de HIT-Robotics/dummy se ha ajustado mediante aprendizaje por imitación sobre el dataset HIT-Robotics/test_20261106_153007, compuesto por 3 episodios y 793 fotogramas a 30 FPS para la tarea "Place the yellow brick in the blue cup". La configuración de entrenamiento registrada es de 2 pasos, batch de 16, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta uso de RLHF, DPO ni de decodificación especulativa en este artefacto.

## Capacidades

- Generación de acciones robóticas a partir de imágenes de cámara e instrucciones en lenguaje natural (política visión-lenguaje-acción).
- Control de un robot UR5e con espacio de acción de 7 dimensiones.
- Procesamiento conjunto de dos cámaras (muñeca y cenital) a resolución 480×640 y 30 FPS.
- Ejecución de la tarea concreta de colocar un objeto en un receptáculo, aprendida por imitación.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-rollout`).
- Soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos de pensamiento: no disponible en la información proporcionada.

## Casos de uso

- Prueba de concepto de manipulación pick-and-place: replicar la tarea "Place the yellow brick in the blue cup" en un UR5e para validar el pipeline completo de LeRobot, desde la grabación de datos hasta el despliegue con `lerobot-rollout`.
- Plantilla de entrenamiento de políticas MolmoAct2: servir como ejemplo mínimo para equipos que quieran ajustar el modelo base a sus propios datasets y tareas, dado que la configuración de entrenamiento está documentada paso a paso.
- Validación de hardware y calibración: comprobar la integración de las cámaras wrist_cam y top_cam con el robot UR5e y verificar que los índices y nombres de cámara coinciden con las claves de observación esperadas.
- Benchmarking de infraestructura de inferencia robótica: medir latencia y throughput del pipeline LeRobot con un checkpoint de ~5,6 mil millones de parámetros antes de escalar a modelos mayores.
- Docencia y formación: ilustrar el flujo de aprendizaje por imitación con un caso de tamaño reducido (3 episodios, 793 fotogramas) fácil de reproducir en laboratorio.
- Integración en pipelines de CI/CD robóticos: usar el repositorio como fixture de pruebas para verificar que los cambios en LeRobot no rompen el entrenamiento ni el despliegue de políticas MolmoAct2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~5,6 mil millones de parámetros en safetensors (11,5 GB), la inferencia en FP16 requiere del orden de 11-12 GB de VRAM solo para los pesos, más memoria para activaciones y buffers de imagen.
- GPU recomendadas: no indicadas por el autor; por tamaño, cabría esperar GPUs con 16 GB o más (RTX 4090, A100, H100), aunque no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en una RTX 4090 (24 GB) en FP16; en GPUs de 8-12 GB requeriría cuantización, no documentada para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para políticas robóticas de este tipo.
- Latencia y throughput estimados: no disponibles. La política debe ejecutarse a 30 FPS para coincidir con la frecuencia de grabación del dataset, pero no se aportan medidas reales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas robóticas visión-lenguaje-acción) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- Entrenamiento extremadamente reducido: 2 pasos de optimización sobre 3 episodios y 793 fotogramas; no es un modelo listo para producción.
- Ausencia total de evaluación: la model card no reporta tasa de éxito ni pruebas en robot real.
- Especialización en una única tarea y un único robot (UR5e); no generaliza a otras tareas, objetos o plataformas sin reentrenamiento.
- Dependencia estricta de la configuración de cámaras: los nombres wrist_cam y top_cam y la resolución 480×640 deben coincidir con la observación de entrenamiento.
- Riesgo de sobreajuste y de comportamiento frágil ante cambios de iluminación, posiciones de objetos o distracciones, no evaluado.
- Sesgos conocidos: no documentados, pero al derivar de un dataset mínimo, cualquier sesgo del mismo se hereda.
- Riesgo de alucinación de acciones: no evaluado; la política puede generar comandos motores no válidos fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base MolmoAct2 y sus condiciones deben verificarse por separado antes de un despliegue comercial.
- Idiomas soportados no documentados; la instrucción de tarea está en inglés.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HIT-Robotics/dummy
- Organización en Hugging Face: https://huggingface.co/HIT-Robotics
- Dataset de entrenamiento: https://huggingface.co/datasets/HIT-Robotics/test_20261106_153007
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HIT-Robotics/test_20261106_153007
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
