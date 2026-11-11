# shangarot/moveT_TaskA

## Resumen

moveT_TaskA es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario shangarot en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está diseñado para controlar un robot tipo `so_follower` (SO-100/SO-101) equipado con dos cámaras: una cenital (`top`) y otra en la muñeca (`wrist`).

La tarea concreta para la que se ha entrenado es "Place T on yellow T shape", es decir, colocar una pieza con forma de T sobre una plantilla amarilla con esa misma forma. El modelo consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real a 30 FPS sobre hardware de consumo.

Su relevancia radica en que ejemplifica el flujo completo de LeRobot: grabación de datos teleoperados, entrenamiento de una política ACT y despliegue en robot real mediante la CLI `lerobot-rollout`. No es un modelo de propósito general ni un LLM, sino una política especializada de un solo task, útil como referencia para quien quiera replicar el pipeline o adaptarlo a sus propias tareas de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de horizonte de acción, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `top`, `wrist` (3, 480, 640) |
| Estado de observación | `(6,)` |
| Acción de salida | `(6,)` |
| Dataset de entrenamiento | shangarot/moveT_TaskA (40 episodios, 18.478 frames, 30 FPS) |
| Tarea | "Place T on yellow T shape" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer con un encoder visual que procesa las dos cámaras (cenital y de muñeca) y un decoder que genera un chunk de acciones de forma conjunta en lugar de predecir paso a paso. Esta predicción por chunks reduce el error de compounding y mejora la estabilidad en tareas de manipulación fina, a costa de requerir sincronización temporal entre observaciones y acciones.

El entrenamiento se realizó sobre el dataset shangarot/moveT_TaskA, compuesto por 40 episodios teleoperados que suman 18.478 frames a 30 FPS, todos ellos de la misma tarea. Se ejecutaron 20.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000, usando LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre datos teleoperados. Tampoco se detalla la composición exacta de aumentos de datos ni la política de augmentación visual.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de estado articular e imágenes.
- Percepción visual multi-cámara: procesa simultáneamente una vista cenital y una vista de muñeca a 480x640.
- Ejecución de una tarea específica: "Place T on yellow T shape", entrenada de extremo a extremo sobre demostraciones teleoperadas.
- Predicción por chunks de acción: emite secuencias cortas de acciones coherentes temporalmente en lugar de pasos aislados.
- Inferencia en tiempo real: el pipeline está pensado para ejecutarse a 30 FPS, la misma frecuencia de grabación del dataset.
- Integración con LeRobot: compatible con las CLI `lerobot-rollout` y `lerobot-train`, y con el ecosistema de datasets y políticas de Hugging Face.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Replicación de experimentos de imitación: sirve como política de referencia para validar un pipeline completo de LeRobot (grabación, entrenamiento, despliegue) antes de abordar tareas propias.
- Automatización de una celda de pick-and-place con pieza en T: el modelo ejecuta la colocación de la pieza sobre la plantilla amarilla en un entorno controlado, con las dos cámaras como única entrada sensorial.
- Base para fine-tuning en tareas similares: al ser una política ACT de 51,7 M de parámetros, se puede reentrenar con un dataset propio de pocas decenas de episodios siguiendo el mismo esquema (20.000 pasos, batch 8, lr 1e-05).
- Docencia y formación en robótica de imitación: permite mostrar de forma tangible cómo un transformer aprende una política de manipulación a partir de demostraciones humanas.
- Pruebas de integración hardware-software: útil para verificar calibración de cámaras, puertos del `so_follower` y latencia del bucle de control antes de pasar a producción.
- Evaluación comparativa de métodos de imitación: puede servir como baseline ACT frente a otros métodos (Diffusion Policy, VQ-BeT) en la misma tarea y dataset.
- Prototipado rápido de demos: con `lerobot-rollout --strategy.type=base` se puede lanzar una demo de 60 segundos sin grabar episodios, útil para presentaciones o validación visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors (0,2 GB de repositorio), la inferencia en FP32 requiere aproximadamente 0,2-0,3 GB de VRAM para los pesos, más el coste de las activaciones de las dos imágenes de 480x640. En la práctica, cualquier GPU con 4 GB o más es suficiente.
- GPU recomendadas: no se especifican en la model card. Por tamaño, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100; también es viable en GPUs integradas o en CPU para pruebas de baja frecuencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM; el cuello de botella real será la captura de dos cámaras a 30 FPS y la latencia del bus del robot, no el modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no se proporcionan cifras. El diseño apunta a 30 FPS, frecuencia de grabación del dataset, pero no se documenta latencia medida en robot real.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| shangarot/moveT_TaskA | ACT | 51,7 M | Estado (6,) + 2 cámaras 480x640 | Place T on yellow T shape | no disponible | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | ACT | variable según config | Estado + cámaras | Múltiples tareas | según repo | Hugging Face (LeRobot) |
| Diffusion Policy | Diffusion | no disponible | Estado + cámaras | Manipulación | según repo | Repos académicos |
| VQ-BeT | Transformer + VQ | no disponible | Estado + cámaras | Manipulación | según repo | Repos académicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a método, tamaño y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea "Place T on yellow T shape"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante variaciones de posición, iluminación o distractores.
- Dataset pequeño: 40 episodios y 18.478 frames son pocos para garantizar cobertura de condiciones; el riesgo de sobreajuste al entorno de grabación es alto.
- Dependencia del hardware exacto: requiere un robot `so_follower` y dos cámaras con nombres `top` y `wrist`; cambios de calibración, montaje o resolución pueden degradar el comportamiento.
- Licencia no especificada: la model card marca la licencia como "More Information Needed", por lo que no se puede asumir uso comercial sin consultar al autor.
- Idiomas no aplicables: no es un modelo lingüístico; no procesa texto ni instrucciones en lenguaje natural más allá del campo `--task` usado por LeRobot para etiquetar el episodio.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: cualquier expectativa en ese sentido es incorrecta.
- Riesgo de alucinación en el sentido robótico: puede generar acciones plausibles pero incorrectas si la observación se sale de la distribución de entrenamiento; no hay mecanismo de verificación interna.
- Fecha de creación futura (2026-11-11): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shangarot/moveT_TaskA
- Dataset de entrenamiento: https://huggingface.co/datasets/shangarot/moveT_TaskA
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shangarot/moveT_TaskA
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
