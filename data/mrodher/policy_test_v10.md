# mrodher/policy_test_V10

## Resumen

`mrodher/policy_test_V10` es una política de aprendizaje por imitación para robótica entrenada con LeRobot y publicada en Hugging Face por el usuario mrodher. Implementa el método Action Chunking with Transformers (ACT), descrito en el paper arXiv:2304.13705, que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y suele lograr tasas de éxito elevadas en tareas de manipulación aprendidas a partir de datos de teleoperación.

El modelo está especializado en una única tarea concreta: "put the beige piece on the aruco" (colocar la pieza beige sobre el marcador ArUco), ejecutada por un robot de tipo `so_follower` (SO-101) equipado con dos cámaras, `top` y `wrist`, a resolución 640x480 y 30 FPS. Consume un vector de estado de 6 dimensiones junto con las dos imágenes y produce un vector de acción de 6 dimensiones.

Se trata de un modelo pequeño (51.668.614 parámetros, repo de 0,2 GB) y de propósito muy acotado: no es un modelo de lenguaje ni un modelo generalista, sino una política visual-motora entrenada sobre 150 episodios y 43.438 frames. Es relevante como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) y como referencia para quienes experimentan con ACT en hardware SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora con encoder visual y decoder transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consuma observaciones por frame, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica mediante el prompt "put the beige piece on the aruco") |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer que combina un encoder visual (procesa las imágenes de las cámaras `top` y `wrist` a 480x640x3) con un decoder que genera chunks de acciones de dimensión 6 a partir del estado del robot (vector de 6 componentes). El enfoque de action chunking predice varios pasos de acción de una vez en lugar de uno solo, lo que mitiga el error compounding típico de las políticas de imitación paso a paso.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `mrodher/so101_dataset_test_V10_20261117_094655`, compuesto por 150 episodios y 43.438 frames grabados a 30 FPS para la tarea "put the beige piece on the aruco". La configuración reportada es: 20.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documentan detalles sobre aumentación de datos, composición exacta del dataset más allá de los episodios/frames, ni uso de RLHF/DPO (no aplica en este paradigma de imitación supervisada).

## Capacidades

- Control visuomotor de un robot SO-101 (`so_follower`) para una tarea de manipulación específica: colocar una pieza beige sobre un marcador ArUco.
- Percepción multimodal basada en dos cámaras (vista superior `top` y vista de muñeca `wrist`) a 640x480 y 30 FPS.
- Predicción de chunks de acciones de 6 dimensiones (action chunking) a partir de un estado de 6 dimensiones.
- Aprendizaje por imitación a partir de datos de teleoperación (150 episodios, 43.438 frames).
- No dispone de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento/thinking: es una política motora, no un modelo generativo de texto.
- No se documentan capacidades de generalización más allá de la tarea entrenada.

## Casos de uso

- Automatización de una celda de pick-and-place con robot SO-101: la política ejecuta la secuencia "colocar la pieza beige sobre el ArUco" de forma autónoma durante hasta 60 segundos por rollout, usando las cámaras `top` y `wrist` como entrada.
- Reproducción y validación de experimentos de imitación: sirve como referencia para comparar configuraciones de entrenamiento (pasos, batch size, learning rate) sobre el mismo dataset y hardware.
- Prototipado rápido de políticas robóticas: con `lerobot-rollout` se puede desplegar en minutos sobre un SO-101 real, lo que permite iterar sobre la tarea y el dataset sin reentrenar desde cero.
- Docencia y demostraciones de LeRobot: el repositorio y la model card documentan el flujo completo (instalación, hardware, grabación, entrenamiento y rollout), lo que lo hace útil como material de ejemplo.
- Benchmark interno de tareas de manipulación de precisión: al estar acotado a una tarea con marcador ArUco, permite medir tasas de éxito en condiciones controladas (posiciones de objeto, iluminación, distractorores) si se realizan evaluaciones.
- Base para fine-tuning en tareas similares: el checkpoint ACT puede reutilizarse como inicialización para otras tareas de manipulación con el mismo robot y configuración de cámaras, ajustando el dataset y el prompt de tarea.
- Integración en pipelines de investigación en imitation learning: al ser safetensors y compatible con LeRobot, se puede cargar programáticamente para análisis de políticas, extracción de representaciones visuales o comparación con otros métodos (Diffusion Policy, VQ-BeT, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de trials ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo (51,7 M parámetros, repo de 0,2 GB) es plausible que quepa en GPUs consumer modestas, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica entrenamiento en GPU NVIDIA.
- Compatibilidad con GPU consumer: no confirmada oficialmente; el tamaño reducido del checkpoint sugiere que podría ejecutarse en GPUs de gama media, pero debe validarse en el hardware concreto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento), con integración opcional de Weights & Biases (`--wandb.enable=true`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. La política opera a 30 FPS según la tasa de grabación del dataset, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Paradigma | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrodher/policy_test_V10` (este) | ACT (imitation learning) | 51,7 M | 2 cámaras 480x640 + estado (6,) | no disponible | Hugging Face, LeRobot |
| Diffusion Policy | Políticas de difusión para imitación | no disponible | observaciones visuales + estado | no disponible | Implementación en LeRobot |
| VQ-BeT | BeV/vector-quantized behavior transformer | no disponible | observaciones visuales + estado | no disponible | Implementación en LeRobot |
| Otros checkpoints ACT en LeRobot | ACT | variable según configuración | variable | variable | Hugging Face Hub |

No se dispone de datos comparativos de rendimiento (tasas de éxito, latencia) entre este modelo y las alternativas, por lo que la comparación se limita a paradigma, tamaño y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una única tarea ("put the beige piece on the aruco") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sin resultados de evaluación publicados: no hay evidencia documentada de tasa de éxito, robustez o generalización en condiciones variadas (posiciones, iluminación, distractorores).
- Dependencia de configuración hardware: los nombres de cámara (`top`, `wrist`) y sus índices deben coincidir exactamente con los usados en entrenamiento; cualquier cambio en la disposición de cámaras puede degradar el rendimiento.
- Licencia no especificada ("More Information Needed"): no está claro si se permite uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Riesgo de sobreajuste al dataset: con 150 episodios y 43.438 frames para una sola tarea, la política puede memorizar posiciones y condiciones específicas del entorno de grabación.
- Idiomas no disponibles: no aplica como modelo de lenguaje, pero el prompt de tarea está en inglés ("put the beige piece on the aruco") y debe mantenerse consistente.
- Sin cuantizaciones documentadas ni métricas de latencia: no se puede garantizar comportamiento en tiempo real en hardware distinto del usado en entrenamiento.
- Advertencia de la model card: "No evaluation results have been provided for this policy yet", lo que implica que su uso en producción requiere validación empírica previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrodher/policy_test_V10
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/so101_dataset_test_V10_20261117_094655
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/so101_dataset_test_V10_20261117_094655
- Paper ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
