# HIT-Robotics/dummy_model

## Resumen

HIT-Robotics/dummy_model es una política robótica de imitación entrenada con LeRobot sobre la arquitectura MolmoAct2, un modelo fundacional de robótica publicado por el Allen Institute for AI (Ai2) que transforma imágenes de cámara e instrucciones en lenguaje natural en secuencias de acciones motrices (action chunks). El repositorio lo distribuye la organización HIT-Robotics bajo licencia Apache 2.0 y contiene 5.591.928.368 parámetros en formato safetensors, con un tamaño de repositorio de 11,5 GB.

El modelo está especializado en una única tarea de manipulación sobre un brazo robótico UR5e equipado con dos cámaras (`wrist_cam` y `top_cam`): colocar un ladrillo amarillo en una taza azul. Consume el estado articular del robot (vector de 7 dimensiones) y dos imágenes RGB de 480x640, y produce un vector de acción de 7 dimensiones a 30 FPS.

Es relevante como ejemplo de integración del stack LeRobot con políticas fundacionales de robótica y como plantilla reproducible para entrenar y desplegar políticas de imitación, si bien su entrenamiento es meramente demostrativo (2 pasos, 3 episodios) y no constituye un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo fundacional de robótica de Ai2), implementado en LeRobot |
| Parametros totales | 5.591.928.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan como texto; el entrenamiento usa una única instruccion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | ur5e |
| Camaras | wrist_cam, top_cam |
| Entrada observation.state | STATE, shape (7,) |
| Entrada observation.images.wrist_cam | VISUAL, shape (3, 480, 640) |
| Entrada observation.images.top_cam | VISUAL, shape (3, 480, 640) |
| Salida action | ACTION, shape (7,) |
| Frecuencia de datos | 30 FPS |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 11,5 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MolmoAct2, un modelo fundacional de robótica desarrollado por Ai2 que mapea observaciones visuales y lenguaje a trozos de acción (action chunks). La implementación utilizada es la de LeRobot, que permite entrenar y evaluar el modelo MolmoAct2 estándar. No se dispone de detalles adicionales sobre la composición interna de la arquitectura (número de capas, mecanismos de atención, etc.) en la información proporcionada.

El entrenamiento se realizó mediante imitación (imitation learning) sobre el dataset HIT-Robotics/test_20261106_133042, compuesto por 3 episodios y 523 fotogramas a 30 FPS para una única tarea: "Place the yellow brick in the blue cup". La configuración de entrenamiento fue de 2 pasos, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. Se trata, por tanto, de un entrenamiento mínimo de carácter demostrativo, no de un ajuste fino sustancial. No se indica en la información disponible si se aplicaron técnicas de RLHF, DPO u otras.

## Capacidades

- Generación de secuencias de acción robótica (action chunks) a partir de imágenes de cámara e instrucciones en lenguaje natural.
- Control de un brazo robótico UR5e con 7 dimensiones de acción.
- Procesamiento de dos flujos visuales simultáneos (cámara de muñeca y cámara cenital) a resolución 480x640.
- Condicionamiento por instrucción de tarea en texto (en el entrenamiento, una única instrucción en inglés).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-rollout`).
- No se dispone de información sobre soporte de tool calling, razonamiento multi-paso, capacidades multilingües avanzadas ni modos de "thinking".

## Casos de uso

- **Demostración de recogida y colocación (pick-and-place)**: el modelo ejecuta la tarea de colocar un ladrillo amarillo en una taza azul sobre un UR5e, útil como ejemplo didáctico de política de imitación en LeRobot.
- **Plantilla para entrenamiento de políticas propias**: sirve como punto de partida para que un equipo entrene su propia política MolmoAct2 con `lerobot-train`, sustituyendo el dataset y el tipo de robot.
- **Validación de pipelines de datos robóticos**: permite verificar el flujo completo de grabación, visualización y entrenamiento de datasets en LeRobot antes de escalar a datasets mayores.
- **Pruebas de integración hardware-software**: útil para comprobar la conexión de un UR5e, la calibración de cámaras y la ejecución de rollouts con `lerobot-rollout` en un entorno controlado.
- **Referencia para investigación en imitación**: como ejemplo de integración de un modelo fundacional de robótica en un framework abierto, puede usarse para estudiar el comportamiento de políticas con muy pocos pasos de entrenamiento.
- **Prototipado rápido de tareas de manipulación**: en laboratorios con un UR5e disponible, permite ensayar la infraestructura de inferencia antes de invertir en entrenamientos más largos y datasets más amplios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 5.591.928.368 parámetros en safetensors (aproximadamente 11,2 GB en precisión de 16 bits), se requiere al menos una GPU con 16 GB de VRAM para cargar los pesos en fp16, sin contar memoria adicional para activaciones y procesamiento de imágenes.
- **GPU recomendadas**: no especificadas por el autor. Por tamaño, una GPU de 24 GB o superior (RTX 4090, A100, H100) es la opción razonable para inferencia en fp16.
- **¿Cabe en GPU de consumo?**: previsiblemente sí en tarjetas con 24 GB o más (por ejemplo, RTX 4090) en precisión de 16 bits; no se dispone de datos sobre cuantización a 8 o 4 bits.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento). No se indica soporte de vLLM, llama.cpp, Ollama o TGI, que no son adecuados para este tipo de política robótica.
- **Latencia y throughput**: no disponibles. Los datos de entrenamiento se registraron a 30 FPS, pero no se especifica la latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia contextual, MolmoAct2 es el modelo fundacional de robótica de Ai2 sobre el que se construye esta política, pero no se han facilitado datos comparativos de parámetros, contexto o rendimiento frente a alternativas como OpenVLA, π0 (pi-zero) u otras políticas de imitación.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HIT-Robotics/dummy_model | 5.591.928.368 | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| MolmoAct2 (Ai2) | no disponible | no disponible | no disponible | blog de Ai2 |
| Alternativas (OpenVLA, π0, etc.) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Entrenamiento mínimo**: solo 2 pasos de entrenamiento y 3 episodios (523 fotogramas) para una única tarea; no es un modelo funcional para uso real, sino una demostración.
- **Sin evaluación**: no se han publicado resultados de éxito en robot real, por lo que se desconoce su fiabilidad.
- **Tarea única y específica**: entrenado exclusivamente para "Place the yellow brick in the blue cup" sobre un UR5e con dos cámaras concretas; no generaliza a otras tareas, objetos o configuraciones sin reentrenamiento.
- **Dependencia de hardware**: requiere un UR5e y cámaras con los nombres e índices exactos (`wrist_cam`, `top_cam`) y la resolución 480x640 a 30 FPS.
- **Riesgo de alucinación motriz**: al ser una política de imitación con datos escasos, puede producir acciones erráticas o inseguras; debe ejecutarse con límites de seguridad y supervisión.
- **Idioma**: la instrucción de tarea está en inglés; no hay evidencia de capacidades multilingües.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base MolmoAct2 y sus términos deben verificarse por separado.
- **Sesgos**: no se dispone de información sobre sesgos; el dataset es muy reducido y de un único entorno.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HIT-Robotics/dummy_model)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HIT-Robotics/test_20261106_133042)
- [Blog de MolmoAct2 (Ai2)](https://allenai.org/blog/molmoact2)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de MolmoAct2 en LeRobot](https://huggingface.co/docs/lerobot/main/en/molmoact2)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Documentación de inferencia/rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Cheat-sheet de CLI](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
