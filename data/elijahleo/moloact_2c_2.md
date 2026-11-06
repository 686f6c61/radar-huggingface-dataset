# elijahleo/moloact_2c_2

## Resumen

MolmoAct2 es un modelo fundacional abierto para robótica desarrollado por el Allen Institute for AI (Ai2) que mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones de robot (action chunks). El repositorio `elijahleo/moloact_2c_2` es un fine-tuning de dicho modelo base, entrenado con la librería LeRobot de Hugging Face sobre el dataset `manufacturing_finetune` para tareas concretas de manipulación de hardware en un entorno de fabricación.

Se trata de una política de imitación (imitation learning) con 5.591.928.368 parámetros en formato safetensors, que consume el estado articular del robot (vector de 6 dimensiones) junto con tres cámaras RGB de 480x640 (gripper, vista superior y vista lateral) y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó durante 20.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5 sobre 150 episodios y 218.964 frames a 30 FPS.

Es relevante porque demuestra el flujo completo de fine-tuning de un modelo fundacional robótico abierto sobre hardware real con LeRobot 0.6.1, y porque publica la política con licencia Apache 2.0, lo que permite su reutilización y auditoría. No obstante, se trata de un checkpoint de nicho (21 descargas, 0 likes) sin evaluación publicada, por lo que debe considerarse un artefacto experimental más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo fundacional visión-lenguaje-acción para robótica), implementación LeRobot |
| Parámetros totales | 5.591.928.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `follow` |
| Cámaras de entrada | `gripper`, `newtop`, `newside` (3 x 480 x 640) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Tamaño del repositorio | 11,5 GB |
| Librería | LeRobot 0.6.1 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo base MolmoAct2 es un modelo fundacional robótico de Ai2 que combina percepción visual y comprensión de instrucciones en lenguaje para generar chunks de acciones. La implementación disponible en LeRobot permite tanto el entrenamiento como la evaluación de la variante regular de MolmoAct2. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron técnicas de RLHF o DPO.

El fine-tuning publicado se entrenó sobre el dataset `manufacturing_finetune`, compuesto por 150 episodios y 218.964 frames a 30 FPS, con tres tareas descritas en inglés: "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket" y "Put all hardware in bucket". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan innovaciones técnicas adicionales específicas de este checkpoint (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de acciones robóticas a partir de imágenes de cámara e instrucciones en lenguaje natural (visión-lenguaje-acción).
- Percepción visual multi-cámara: procesa simultáneamente tres flujos RGB (gripper, vista superior, vista lateral) a 480x640.
- Condicionamiento por instrucción de tarea en lenguaje natural (tres tareas de manipulación de hardware definidas en el dataset de entrenamiento).
- Producción de chunks de acción de 6 dimensiones compatibles con el robot tipo `follow`.
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito (thinking mode). Es un modelo de política robótica, no un LLM conversacional.

## Casos de uso

- Manipulación de hardware en línea de fabricación: el modelo recibe la instrucción "Take hardware from human and put in taped area" y genera las acciones articulares para recoger piezas de un operario y depositarlas en una zona delimitada, usando las tres cámaras para localizar el hardware y la zona objetivo.
- Clasificación y separación de componentes: con la tarea "put nuts in red cup and bolts in blue bucket", la política distingue tuercas y tornillos por visión y genera las trayectorias de pick-and-place correspondientes hacia los recipientes de color.
- Recogida masiva de piezas: la tarea "Put all hardware in bucket" permite automatizar la recolección de hardware disperso en una superficie de trabajo hacia un contenedor único.
- Base para fine-tuning en nuevos entornos de fabricación: al estar publicada con licencia Apache 2.0 y formato LeRobot, puede servir como punto de partida para reentrenar con `lerobot-train` sobre datasets propios de otras células de montaje.
- Investigación en imitation learning: el checkpoint y la configuración de entrenamiento documentada (pasos, batch, LR, semilla) permiten reproducir experimentos y comparar contra otras políticas LeRobot sobre el mismo dataset.
- Evaluación de modelos fundacionales robóticos en tareas de contacto humano-robot: la primera tarea implica recibir hardware de una persona, lo que permite estudiar el comportamiento de la política en escenarios con presencia humana en el espacio de trabajo.
- Prototipado de automatización de bajo coste: al ejecutarse con `lerobot-rollout` sobre un robot tipo `follow` con cámaras OpenCV estándar, puede desplegarse en configuraciones de hardware asequible para validar casos de uso antes de invertir en soluciones industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, métricas de precisión de agarre ni comparaciones cuantitativas con otras políticas sobre las tareas del dataset `manufacturing_finetune`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5.591.928.368 parámetros, en FP16 serían necesarios aproximadamente 11,2 GB solo para los pesos, más el overhead de activaciones y buffers de las tres cámaras a 480x640; en FP32 ascendería a unos 22,4 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100) sería el rango razonable para FP16; para FP32 se requeriría A100/H100.
- ¿Cabe en GPU de consumo? Con 24 GB (RTX 4090) es plausible en FP16 según la estimación de pesos, pero no está confirmado por el autor ni se documenta cuantización que reduzca el footprint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento), con soporte de CUDA (`--policy.device=cuda`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La política opera a 30 FPS en el dataset de entrenamiento, pero no se publican mediciones de latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| moloact_2c_2 (este) | 5.591.928.368 | no disponible | Política VLA robótica (fine-tuning MolmoAct2) | Apache 2.0 | No |
| MolmoAct2 (base, Ai2) | no disponible en la información | no disponible | Modelo fundacional robótico | no disponible en la información | no disponible |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy, pi0) | no disponible en la información | no disponible | Políticas de imitation learning | varía según modelo | no disponible en la información |

No se dispone en la información proporcionada de datos suficientes sobre modelos comparables (parámetros, contexto, rendimiento) para establecer una comparación cuantitativa rigurosa. La comparación con el modelo base MolmoAct2 solo puede hacerse a nivel cualitativo: este checkpoint es un fine-tuning del base sobre un dataset concreto de fabricación, por lo que hereda su arquitectura pero especializa su comportamiento en tres tareas específicas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni validación en robot real publicadas, por lo que se desconoce su fiabilidad en las tareas para las que fue entrenado.
- Especialización estrecha: entrenado únicamente sobre tres tareas de manipulación de hardware en un entorno de fabricación concreto; es improbable que generalice a otros objetos, disposiciones o instrucciones fuera de ese dominio.
- Dependencia de la configuración de cámaras: la política espera exactamente tres cámaras con nombres `gripper`, `newtop` y `newside` y resolución 480x640; cambios de montaje, iluminación o calibración pueden degradar el comportamiento.
- Dependencia del robot: diseñado para un robot tipo `follow` con estado y acción de 6 dimensiones; no es transferible directamente a otras morfologías sin reentrenamiento.
- Riesgo de sobreajuste: 20.000 pasos sobre solo 150 episodios con batch size 8 puede favorecer el sobreajuste al dataset, y no se documenta validación con conjunto de test.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados por el autor; al ser un modelo entrenado con datos de un entorno de fabricación específico, puede heredar sesgos de las condiciones de captura (posiciones de objetos, operarios, iluminación).
- Alucinación en el sentido robótico: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas ante situaciones fuera de distribución, con riesgo físico en el entorno de trabajo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; para producción industrial sería necesario validar el modelo con protocolos de seguridad propios.
- Madurez: 21 descargas y 0 likes, creado y actualizado el mismo día (2026-10-29), sin demo ni resultados; tratar como artefacto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elijahleo/moloact_2c_2
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para molmoact2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
