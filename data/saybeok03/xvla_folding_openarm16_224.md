# saybeok03/xvla_folding_openarm16_224

## Resumen

`saybeok03/xvla_folding_openarm16_224` es un policy de robótica (Vision-Language-Action) afinado a partir de `lerobot/xvla-base`, el modelo base del framework X-VLA publicado en el paper arXiv:2510.10274. X-VLA es un marco de flow matching con soft prompts que trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de soft prompt aprendibles, lo que permite a un único modelo reconciliar morfologías, sensores y espacios de acción diversos. Este checkpoint concreto está especializado en una única tarea de manipulación bimanual: doblar una camiseta correctamente con un robot `bi_openarm_follower`.

El modelo consume observaciones compuestas por el estado de las articulaciones (vector de 16 dimensiones) y tres cámaras RGB de 224x224 (`base`, `left_wrist`, `right_wrist`), y produce un vector de acción de 16 dimensiones. Con 879.687.256 parámetros y un repositorio de 1,8 GB en formato safetensors, se distribuye bajo licencia Apache 2.0 y se ejecuta mediante la librería LeRobot 0.6.1. Es relevante ahora porque ejemplifica el patrón actual de reutilizar un modelo fundacional VLA preentrenado y especializarlo con un dataset pequeño de imitación (50 episodios, 135.351 frames a 30 FPS) para una tarea física concreta.

Al ser un modelo de investigación con cero descargas y sin resultados de evaluación publicados, debe tratarse como un artefacto experimental reproducible más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (X-VLA) con flow matching y soft prompts |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | bi_openarm_follower |
| Camaras | base, left_wrist, right_wrist (3, 224, 224) |
| Entrada de estado | observation.state (16,) |
| Salida de accion | action (16,) |
| Libreria | lerobot 0.6.1 |
| Tamano del repositorio | 1,8 GB |
| Dataset de entrenamiento | saybeok03/full_folding_pi05_224 |
| Episodios / frames | 50 / 135.351 a 30 FPS |
| Tarea | "Fold the T-shirt properly" |

## Arquitectura y entrenamiento

X-VLA es un framework VLA basado en flow matching que incorpora soft prompts: cada configuración de robot o hardware se representa como una tarea codificada por un conjunto pequeño de embeddings aprendibles. Esto permite que un único modelo base (`lerobot/xvla-base`) se adapte a morfologías, sensores y espacios de acción distintos sin cambiar la arquitectura, y que el ajuste fino posterior herede ese mecanismo. La política combina observaciones visuales multimodales (tres vistas RGB a 224x224) con el estado propioceptivo del robot para predecir acciones continuas mediante un proceso de flow matching.

El entrenamiento de este checkpoint se realizó por imitación supervisada sobre el dataset `saybeok03/full_folding_pi05_224`, compuesto por 50 episodios y 135.351 frames grabados a 30 FPS de la tarea "Fold the T-shirt properly". La configuración reportada incluye 20.000 pasos de entrenamiento, batch size de 32, optimizador `xvla-adamw`, learning rate de 0,0001 y semilla 1000, ejecutado con LeRobot 0.6.1. No se especifica en la información disponible el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; al tratarse de un policy de imitación, lo habitual es que no las haya.

## Capacidades

- Generación de acciones motoras continuas de 16 dimensiones para un robot bimanual `bi_openarm_follower`.
- Percepción visual multimodal a partir de tres cámaras RGB simultáneas (vista base y dos muñecas).
- Ejecución de una tarea de manipulación bimanual concreta: doblar una camiseta correctamente.
- Acondicionamiento por instrucción de tarea en lenguaje natural (`--task="Fold the T-shirt properly"`).
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- Adaptación a nuevas tareas mediante ajuste fino desde `lerobot/xvla-base`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Doblado automatizado de ropa en un entorno de laboratorio: el policy ejecuta la secuencia completa de plegado de una camiseta sobre un `bi_openarm_follower` con tres cámaras, usando la instrucción de tarea como condicionamiento. Es adecuado porque está entrenado específicamente para esa tarea y esa morfología.
- Reproducción de experimentos de imitación: sirve como referencia para validar pipelines de entrenamiento con LeRobot 0.6.1 y el modelo base X-VLA, comparando configuraciones de hiperparámetros sobre el mismo dataset.
- Punto de partida para ajuste fino en tareas de plegado similares: al heredar de `lerobot/xvla-base`, puede reentrenarse con nuevos datasets de manipulación de tejidos manteniendo el mismo esquema de observaciones y acciones.
- Evaluación de robustez visual en manipulación bimanual: las tres vistas permiten estudiar cómo afectan cambios de iluminación, posición de la prenda o distracciones al éxito del plegado.
- Docencia e investigación en VLA: útil como ejemplo reproducible de flow matching con soft prompts aplicado a robótica de manipulación.
- Benchmark interno de políticas de imitación: al tener una configuración de entrenamiento documentada (pasos, batch, learning rate, semilla), permite comparaciones controladas frente a otros checkpoints afinados sobre el mismo dataset.
- Integración en demostraciones de hardware OpenArm: el policy está ligado al tipo de robot `bi_openarm_follower`, por lo que encaja en montajes con esa plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para este policy ("No evaluation results have been provided for this policy yet") y no incluye tasas de éxito en robot real ni métricas de simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 879,7 millones de parámetros, los pesos en FP32 ocuparían aproximadamente 3,5 GB y en FP16 unos 1,8 GB, a lo que habría que sumar el coste de las tres cámaras y del resto del pipeline; estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible. No se especifica hardware de referencia en la model card.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de parámetros cabría en GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: LeRobot 0.6.1 mediante `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento con `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un policy de robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saybeok03/xvla_folding_openarm16_224 | 879,7 M | no disponible | Plegado de camiseta con bi_openarm_follower | Apache 2.0 | HuggingFace (LeRobot) |
| lerobot/xvla-base | no disponible | no disponible | Modelo base VLA multi-robot (soft prompts) | no disponible en la información | HuggingFace |
| Políticas de imitación tipo ACT/DP afinadas con LeRobot | no disponible | no disponible | Manipulación específica por dataset | variable | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenado únicamente para la tarea "Fold the T-shirt properly" con un robot `bi_openarm_follower`; no se espera generalización a otras tareas, objetos o morfologías sin reentrenamiento.
- Dataset pequeño: 50 episodios y 135.351 frames, lo que limita la diversidad de posiciones, iluminación y variaciones de la prenda cubiertas.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de hardware concreto: requiere el tipo de robot `bi_openarm_follower` y tres cámaras con los nombres `base`, `left_wrist` y `right_wrist`; cambios en la configuración invalidan el policy.
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, fondo, posición de cámara o tipo de camiseta pueden degradar el comportamiento.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es fallo físico en la manipulación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el paper asociado deben citarse según indique el autor; conviene revisar los términos de `lerobot/xvla-base`.
- Cero descargas y cero likes en el momento de la consulta: artefacto de investigación sin validación por la comunidad.
- No se documentan requisitos de seguridad física para la operación del robot bimanual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saybeok03/xvla_folding_openarm16_224
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding_pi05_224
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding_pi05_224
- Guía LeRobot xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
