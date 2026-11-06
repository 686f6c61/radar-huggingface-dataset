# mysterium99/smolvla_stage2c_complexity_4_to_ds3

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots reales a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta, publicada por el usuario `mysterium99`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `ds3` para la tarea "Put all hardware in bucket", y se distribuye con licencia Apache 2.0.

El modelo resuelve el problema de la política de imitación robótica de bajo coste: en lugar de requerir modelos gigantes y hardware de datacenter, SmolVLA está pensado para ejecutarse en hardware de consumo. Con 450.046.176 parámetros (aproximadamente 450 M) y un repositorio de 0,9 GB en formato safetensors, se posiciona en la gama de políticas VLA ligeras que pueden desplegarse en GPUs de consumo o incluso en sistemas embebidos con aceleración adecuada.

Es relevante ahora porque el paper asociado (arXiv:2506.01844) propone una arquitectura VLA eficiente que compite con modelos mucho mayores en tareas de manipulación, y porque LeRobot 0.6.1 facilita el ciclo completo de grabación de datos, entrenamiento y despliegue mediante sus herramientas CLI (`lerobot-train`, `lerobot-rollout`). Este checkpoint concreto es un ejemplo de fine-tuning sobre un robot de tipo `follow` con tres cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según paper arXiv:2506.01844; detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | follow |
| Cámaras de entrada | gripper, newtop, newside |
| Entrada observation.state | STATE (6,) |
| Entrada observation.images.camera1/2/3 | VISUAL (3, 256, 256) |
| Salida action | ACTION (6,) |
| Dataset de entrenamiento | ds3 (50 episodios, 85.293 frames, 30 FPS) |
| Tarea | "Put all hardware in bucket" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | adamw |
| Learning rate | 0,0001 |
| Seed | 0 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repo | 0,9 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

SmolVLA es una política vision-language-action que combina percepción visual multicámara con el estado propioceptivo del robot para producir acciones de control de 6 dimensiones. Según la model card, el modelo base está descrito en el paper arXiv:2506.01844 como un VLA compacto y eficiente que logra rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo. La información proporcionada no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la composición exacta del dataset de preentrenamiento del modelo base.

Este checkpoint concreto es un fine-tuning supervisado (imitación) sobre el dataset `ds3`, compuesto por 50 episodios y 85.293 frames a 30 FPS para la tarea "Put all hardware in bucket". El entrenamiento se realizó con 20.000 pasos, batch size 8, optimizador AdamW y learning rate 0,0001, con semilla 0, usando LeRobot 0.6.1. No se indica en la información disponible si hubo RLHF, DPO ni ninguna otra fase de alineamiento posterior; tampoco se documentan innovaciones técnicas específicas de este fine-tuning más allá de las del modelo base.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones a partir de tres cámaras (gripper, newtop, newside) y del estado de las articulaciones (6,).
- Percepción visual multicámara: procesa tres flujos de imagen de 3×256×256 píxeles de forma simultánea.
- Imitación de tareas específicas: entrenado para la tarea "Put all hardware in bucket" sobre el robot de tipo `follow`.
- Ejecución en bucle cerrado: la política consume observaciones y emite acciones de forma continua durante el rollout (`lerobot-rollout`).
- Integración con LeRobot: compatible con las herramientas de entrenamiento, evaluación y despliegue del ecosistema LeRobot.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo thinking; el modelo está especializado en acción robótica.

## Casos de uso

- Automatización de tareas de recogida y clasificación: el modelo puede ejecutar la tarea "Put all hardware in bucket" en un robot `follow` equipado con las tres cámaras entrenadas, sustituyendo la programación manual de trayectorias por una política aprendida.
- Investigación en imitación robótica: sirve como punto de partida para estudiar el efecto del número de episodios (50) y de pasos de entrenamiento (20.000) en el rendimiento de políticas VLA compactas.
- Fine-tuning sobre nuevos datasets: al estar basado en `lerobot/smolvla_base` y usar LeRobot 0.6.1, puede reentrenarse con `lerobot-train` sobre datos propios de otras tareas de manipulación.
- Despliegue en hardware de consumo: con 450 M de parámetros y 0,9 GB de pesos, es adecuado para entornos de laboratorio con GPUs de gama media o estaciones de trabajo modestas, según la premisa del paper de desplegarse en hardware de consumo.
- Prototipado rápido de políticas de robot: el flujo `lerobot-rollout` permite validar la política en un robot real durante un tiempo acotado (`--duration=60`) antes de integrarla en un pipeline mayor.
- Benchmarking de políticas VLA ligeras: permite comparar el rendimiento de un VLA de 450 M frente a alternativas mayores en tareas de manipulación con múltiples cámaras.
- Educación y demostraciones: útil para mostrar el ciclo completo de grabación, entrenamiento y despliegue de una política robótica con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas de manipulación para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors y un repo de 0,9 GB, la inferencia en precisión completa requeriría del orden de 2 a 4 GB de VRAM, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible. El paper describe el modelo base como desplegable en hardware de consumo, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? Según la model card del modelo base, sí está diseñado para hardware de consumo; no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política robótica.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 30 FPS, pero no se indica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_4_to_ds3 | 450.046.176 | no disponible | VLA robótico (fine-tuning) | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA robótico (base) | no disponible en la información | Hugging Face |
| Otras políticas VLA de la familia SmolVLA | no disponible | no disponible | VLA robótico | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad. No se han identificado en la información proporcionada modelos comparables de otros autores con datos verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset muy pequeño (50 episodios) y una única tarea, la política probablemente está sobreajustada a las condiciones de ese dataset.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento (posiciones de objetos, iluminación, distracciones no vistas).
- Limitaciones de contexto e idioma: el modelo no procesa lenguaje libre de forma general; la tarea se especifica mediante el string "Put all hardware in bucket". No se documentan capacidades multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas en la información disponible.
- Caveat para producción: no hay resultados de evaluación publicados; la model card indica que no se han proporcionado resultados. No se recomienda su uso en producción sin una evaluación propia en el robot objetivo.
- Dependencia de hardware específico: requiere un robot de tipo `follow` con tres cámaras con nombres coincidentes (`gripper`, `newtop`, `newside`) y un estado de 6 dimensiones; cualquier cambio en la configuración invalida la política.
- Fecha de creación futura (2026-11-06) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_4_to_ds3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset ds3: https://huggingface.co/datasets/ds3
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds3
