# Kimura-881014/cut_act_thesis_cam_all

## Resumen

`cut_act_thesis_cam_all` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. La desarrolla el usuario Kimura-881014 y se distribuye a través de Hugging Face Hub con la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular de un robot y dos flujos de vídeo, y emite comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación: "cut entangle chips", entrenada sobre el dataset `Kimura-881014/cut_entangled_chips_after_deletion`, con 103 episodios y 72.725 fotogramas a 30 FPS. Está diseñado para el robot `so101_follower` con dos cámaras (`wrist` y `side`), lo que lo hace específico de un montaje físico determinado.

Su relevancia es limitada fuera de ese contexto: se trata de un artefacto de investigación reproducible (probablemente una tesis) que demuestra el flujo completo de LeRobot, desde la grabación de datos hasta el despliegue con `lerobot-rollout`. El repositorio ocupa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors, sin resultados de evaluación publicados ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, arXiv 2304.13705) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Robot objetivo | so101_follower |
| Camaras | wrist, side (3, 480, 640) |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (6,) |
| Tamano del repo | 0,2 GB |
| Dataset de entrenamiento | Kimura-881014/cut_entangled_chips_after_deletion |
| Episodios / fotogramas | 103 / 72.725 a 30 FPS |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. La política combina un codificador visual para las dos cámaras (`wrist` y `side`, 480x640) con un transformer que fusiona la observación del estado articular de 6 dimensiones y genera la acción de 6 dimensiones. El modelo tiene 51,6 millones de parámetros, coherente con la escala típica de ACT en LeRobot.

El entrenamiento se realizó durante 20.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.7.0. Los datos provienen de teleoperación sobre el robot `so101_follower` para la tarea "cut entangle chips": 103 episodios y 72.725 fotogramas a 30 FPS. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control visomotor de un robot `so101_follower` para la tarea específica "cut entangle chips".
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular y dos cámaras RGB.
- Fusión multimodal de dos vistas (muñeca y lateral) con el estado del robot.
- Aprendizaje por imitación a partir de teleoperación, sin necesidad de recompensas ni entorno simulado.
- Ejecución autónoma mediante `lerobot-rollout` con estrategia `base` y duración configurable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de una celda de corte de chips entrelazados: el modelo ejecuta la política entrenada sobre el robot `so101_follower` con las cámaras `wrist` y `side`, reproduciendo la secuencia de corte aprendida de las demostraciones.
- Reproducción de experimentos de tesis: sirve como artefacto reproducible para validar el pipeline de LeRobot 0.7.0 (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`).
- Base para fine-tuning en tareas similares: al estar en formato safetensors y cargarse con `--policy.path`, puede reentrenarse con un dataset propio del mismo robot y esquema de observación.
- Benchmark interno de imitación: permite comparar la tasa de éxito de ACT frente a otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo montaje físico y dataset.
- Docencia y formación en robótica de imitación: ejemplo completo de política ACT con configuración de entrenamiento documentada (pasos, batch, LR, semilla).
- Validación de hardware `so101_follower`: útil para verificar calibración de cámaras y puerto del robot antes de desplegar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de ensayos, tasas de éxito ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,6 millones de parámetros en fp32, los pesos ocupan aproximadamente 0,2 GB; el consumo real depende del codificador visual y del tamaño de los frames (480x640).
- GPU recomendadas: no especificadas por el autor. Por escala, una GPU consumer moderna (RTX 3060 o superior) debería ser suficiente para inferencia; el entrenamiento con batch 8 y 20.000 pasos se beneficia de una GPU con al menos 8-12 GB.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo y del repo (0,2 GB).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según la tasa del dataset, pero no se publica latencia medida en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cut_act_thesis_cam_all | 51,6 M | no aplica | Manipulación robótica (ACT) | no disponible | Hugging Face, LeRobot |
| ACT original (arXiv 2304.13705) | no disponible | no aplica | Imitación robótica general | según implementación | Paper y código de referencia |
| Otras políticas LeRobot (Diffusion Policy, VQ-BeT) | no disponible | no aplica | Imitación robótica | según repo | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, formato y disponibilidad.

## Limitaciones y advertencias

- Específico de un robot y montaje: entrenado para `so101_follower` con cámaras `wrist` y `side`; no es transferible sin recalibración ni reentrenamiento.
- Tarea única: solo "cut entangle chips"; no generaliza a otras tareas sin fine-tuning.
- Sin evaluación publicada: no hay tasa de éxito ni ensayos en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posición de objetos o distracciones.
- Licencia no declarada: no se puede asumir uso comercial; la model card marca la licencia como "More Information Needed".
- Riesgo de sobreajuste al dataset: 103 episodios y 20.000 pasos con LR 1e-05; sin validación reportada, el comportamiento fuera de la distribución de demostraciones es incierto.
- Sin capacidades de lenguaje, tool calling ni agentes: no debe evaluarse como un LLM.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no aplican en el sentido habitual, pero tampoco se documentan fallos de política (por ejemplo, colisiones o agarres fallidos).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin comunidad que valide su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Kimura-881014/cut_act_thesis_cam_all
- Dataset: https://huggingface.co/datasets/Kimura-881014/cut_entangled_chips_after_deletion
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kimura-881014/cut_entangled_chips_after_deletion
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
