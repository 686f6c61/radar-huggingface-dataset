# SamShumChun/lerobot_sayhi_dataset_a

## Resumen

`SamShumChun/lerobot_sayhi_dataset_a` no es un modelo de lenguaje, sino una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El autor es SamShumChun y la política se ha entrenado y publicado en el Hub mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real.

El modelo resuelve una tarea concreta de manipulación robótica llamada "SaiHi", aprendida a partir de 30 episodios de teleoperación (13.017 fotogramas a 30 FPS) sobre un robot de tipo `so_follower` con una única cámara frontal. Consume el estado del robot (vector de 6 dimensiones) y la imagen de la cámara (3×720×1280) y produce un vector de acción de 6 dimensiones.

Es relevante como ejemplo reproducible de un pipeline completo de imitación con LeRobot: dataset, entrenamiento (20.000 pasos, batch 8, AdamW, LR 1e-4) y política publicada en el Hub. No es un modelo fundacional ni un LLM: es una política específica de tarea, con 51,6 millones de parámetros en pesos safetensors y un repositorio de 0,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la tarea se etiqueta como "SaiHi") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política consume observaciones multimodales: el estado propioceptivo del robot (`observation.state`, shape `(6,)`) y una imagen de cámara frontal (`observation.images.front`, shape `(3, 720, 1280)`), y emite una acción de 6 dimensiones (`action`, shape `(6,)`).

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `SamShumChun/lerobot_sayhi_dataset_a_20261114_124837`: 30 episodios, 13.017 fotogramas a 30 FPS, tarea "SaiHi". Configuración: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 1000. El robot objetivo es `so_follower` con una cámara `front`. No se documenta composición adicional del dataset, aumento de datos ni etapas de RLHF/DPO (no aplicables a este tipo de política).

## Capacidades

- Control robótico por imitación para la tarea "SaiHi" sobre un robot `so_follower`.
- Predicción de chunks de acción de 6 dimensiones a partir de estado propioceptivo e imagen frontal.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con `--strategy.type=base`.
- Integración con el ecosistema LeRobot (entrenamiento, rollout, visualización de dataset).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües.
- No es un modelo de propósito general: su alcance se limita a la tarea y el robot con los que fue entrenado.

## Casos de uso

- Demostración reproducible de imitación con ACT: sirve como referencia para validar un pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas propias.
- Prototipado de saludos o gestos simples en un robot `so_follower`: la política ejecuta la tarea "SaiHi" durante un tiempo acotado con `--duration`, útil para pruebas de laboratorio.
- Evaluación de la sensibilidad al dominio: al depender de una única cámara frontal y de posiciones concretas, permite estudiar cómo afectan cambios de iluminación o de posición de objetos al éxito de la política.
- Base para *fine-tuning*: el checkpoint puede reentrenarse con `lerobot-train --policy.type=act` sobre un dataset propio con el mismo esquema de observaciones y acciones.
- Docencia y formación: ejemplo mínimo (0,2 GB, 51,6 M de parámetros) para explicar aprendizaje por imitación y chunking de acciones en robótica.
- Integración en bancos de pruebas de políticas robóticas: útil para comparar variantes de ACT con distintas semillas o hiperparámetros sobre la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y pesos safetensors, la huella es reducida (del orden de cientos de MB en FP32), pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible. El comando de entrenamiento de referencia usa `--policy.device=cuda`, lo que implica una GPU con CUDA.
- ¿Cabe en GPU de consumo? Muy probablemente sí por tamaño de parámetros, pero no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles. La política opera a 30 FPS según el dataset, pero no se publican métricas de latencia en el robot.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SamShumChun/lerobot_sayhi_dataset_a` | ACT | 51.668.614 | no aplica | apache-2.0 | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | ACT | no disponible | no aplica | según repositorio | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | no aplica | según repositorio | Hugging Face Hub / docs LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Política específica de tarea ("SaiHi") y de robot (`so_follower`): no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Depende de una única cámara frontal (`observation.images.front`) y de un estado de 6 dimensiones; cambios en la configuración de sensores invalidan la política.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real.
- Riesgo de sobreajuste al dataset reducido (30 episodios, 13.017 fotogramas) y a las condiciones concretas de grabación (posiciones, iluminación, fondo).
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; la etiqueta "SaiHi" es la tarea, no un idioma.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas aplicables a este tipo de política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamShumChun/lerobot_sayhi_dataset_a
- Dataset de entrenamiento: https://huggingface.co/datasets/SamShumChun/lerobot_sayhi_dataset_a_20261114_124837
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamShumChun/lerobot_sayhi_dataset_a_20261114_124837
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
