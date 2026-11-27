# IdealReal/act_policy

## Resumen

`IdealReal/act_policy` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub a través de la librería LeRobot. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, una estrategia que reduce el error acumulado y mejora la estabilidad en tareas de manipulación robótica. Lo desarrolla el usuario IdealReal y está entrenado específicamente para la tarea "cube_pick_up" sobre un robot `so102_follower` con una única cámara de muñeca.

El modelo es de tamaño reducido: 51.670.663 parámetros en formato safetensors, con un repositorio de 0,2 GB. Consume observaciones de estado de 7 dimensiones y una imagen RGB de 480x640, y produce acciones de 7 dimensiones. Es, por tanto, una política especializada y de propósito único, no un modelo de lenguaje generalista.

Su relevancia radica en que ejemplifica el flujo de trabajo de imitación end-to-end con LeRobot: grabación de datos, entrenamiento con ACT y despliegue en robot real mediante `lerobot-rollout`. No obstante, la model card no incluye resultados de evaluación, por lo que su rendimiento real en el robot no está documentado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de acciones robóticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de generar una acción por paso de control, el modelo emite una secuencia corta de acciones que se ejecutan de forma abierta o con interpolación temporal. El modelo consume `observation.state` (vector de 7 dimensiones) y `observation.images.cam_wrist` (tensor 3x480x640) y produce `action` (7 dimensiones). La arquitectura concreta de capas, dimensión de embedding y número de cabezas de atención no se detalla en la información disponible.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `IdealReal/pnp_cube`: 60 episodios, 27.929 frames a 30 FPS, para la tarea "cube_pick_up". La configuración reportada incluye 30.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se especifica si hubo aumento de datos, regularización temporal ni técnicas adicionales como decodificación especulativa (no aplicables en este contexto).

## Capacidades

- Generación de acciones robóticas de 7 dimensiones a partir de estado propioceptivo e imagen de muñeca.
- Aprendizaje por imitación de una tarea concreta de manipulación ("cube_pick_up").
- Predicción por chunks de acciones, lo que reduce el error acumulado frente a políticas paso a paso.
- Integración nativa con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI (`lerobot-train`, `lerobot-rollout`).
- Ejecución en robot real `so102_follower` con cámara `cam_wrist`.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: es una política de control, no un modelo generativo de texto.

## Casos de uso

- Recogida de cubos en entorno de laboratorio: la política está entrenada específicamente para "cube_pick_up" sobre el robot `so102_follower`, por lo que su uso directo es la ejecución de esa tarea en el robot real mediante `lerobot-rollout` con `--task="cube_pick_up"`.
- Base para fine-tuning en tareas de pick-and-place: al ser un checkpoint ACT entrenado, puede servir como inicialización para nuevas tareas de manipulación con datasets propios, reduciendo el coste de entrenamiento desde cero.
- Prototipado de pipelines de imitación end-to-end: útil para validar el flujo completo de LeRobot (grabación, entrenamiento, despliegue) en un caso concreto y reproducible.
- Docencia y experimentación en robótica: su tamaño reducido (51,7 M de parámetros, repo de 0,2 GB) permite entrenar y desplegar en hardware modesto, facilitando prácticas con robots de bajo coste tipo SO-102.
- Evaluación comparativa de políticas ACT: sirve como referencia base para comparar variantes de arquitectura, hiperparámetros o datasets en la misma tarea.
- Integración en bancos de pruebas de manipulación: puede incorporarse a entornos simulados o reales para medir tasas de éxito en recogida de objetos con una sola cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que la VRAM necesaria es muy baja (por debajo de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`, por lo que se asume una GPU NVIDIA.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.), así como en CPU para inferencia, aunque la latencia sería mayor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Al ejecutarse a 30 FPS sobre el robot, la política debe inferir en tiempo real, pero no se reportan cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IdealReal/act_policy | 51,7 M | no aplica | cube_pick_up (SO-102) | apache-2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (genéricas) | ~50 M (típico) | no aplica | manipulación variable | apache-2.0 | Hugging Face Hub / LeRobot |
| Diffusion Policy (referencia) | variable | no aplica | manipulación | variable | repositorios de investigación |
| VQ-BeT (referencia) | variable | no aplica | manipulación | variable | repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenada únicamente para la tarea "cube_pick_up"; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Dependencia de la configuración física: asume robot `so102_follower` y cámara `cam_wrist`; cambios de robot, cámara o calibración pueden degradar el rendimiento.
- Sin evaluación publicada: no hay tasas de éxito documentadas, por lo que no se puede garantizar su fiabilidad en producción.
- Dataset pequeño: 60 episodios y 27.929 frames; puede sufrir sobreajuste y baja robustez ante variaciones de iluminación, posiciones de objetos o distractores.
- Sin datos de sesgos: no se reportan análisis de sesgo, aunque al ser una política de control el riesgo se centra en fallos de manipulación más que en sesgos sociales.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de acciones incorrectas o inseguras en el robot real.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No apta para usos fuera de robótica: no procesa lenguaje natural ni tareas cognitivas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IdealReal/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/IdealReal/pnp_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=IdealReal/pnp_cube
