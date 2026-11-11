# CarAFM/act_so101_pick_place_v2

## Resumen

`CarAFM/act_so101_pick_place_v2` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado en el Hub mediante la librería LeRobot de Hugging Face, y está especializado en una única tarea de manipulación: recoger un bloque y colocarlo en una caja. Se trata, por tanto, de un checkpoint de política específico y no de un modelo de lenguaje generalista.

La política consume observaciones multimodales compuestas por el estado de las articulaciones (vector de 6 dimensiones) y dos cámaras RGB de 480x640 píxeles (frontal y de muñeca), y produce acciones de 6 dimensiones. Con 51.668.614 parámetros totales y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en robots reales tipo SO-101.

El entrenamiento se realizó sobre un dataset propio de 93 episodios y 24.572 fotogramas a 30 FPS, con 20.000 pasos de entrenamiento. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el modelo no incluye resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Libreria | lerobot |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador visual para las dos cámaras con un transformer que procesa la secuencia de observaciones y genera el chunk de acciones. El modelo aprende exclusivamente de datos de teleoperación.

El entrenamiento se realizó con 20.000 pasos, batch size de 32, optimizador AdamW y learning rate de 1e-05, con semilla 1000, sobre el dataset `CarAFM/so101_pick_place_block_v2` (93 episodios, 24.572 fotogramas, 30 FPS, tarea "Pick up the block and place it in the box"). No se documenta en la model card el uso de RLHF, DPO ni innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Manipulación robótica de una única tarea: recoger un bloque y colocarlo en una caja.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular y dos vistas RGB.
- Fusión de información visual frontal y de muñeca para guiar el agarre y la colocación.
- Ejecución en bucle cerrado sobre robot real SO-101 mediante `lerobot-rollout`.
- Entrenamiento reproducible con `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la política de manipulación.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la secuencia recoger-colocar sobre el robot SO-101, adecuada para tareas repetitivas de alimentación de piezas en una celda de fabricación.
- Prototipado rápido de políticas de imitación: sirve como referencia funcional para validar el pipeline completo de LeRobot (grabación, entrenamiento y despliegue) antes de escalar a tareas propias.
- Docencia e investigación en robótica: modelo pequeño (51,7 M de parámetros) y reproducible que permite experimentar con ACT en laboratorios con hardware de bajo coste.
- Base para fine-tuning en tareas similares: al estar entrenado sobre SO-101 con dos cámaras, puede reutilizarse como inicialización para variantes de pick-and-place con el mismo robot.
- Benchmark interno de manipulación: útil para comparar variantes de ACT, configuraciones de cámaras o hiperparámetros sobre una tarea controlada.
- Demostraciones de manipulación visual: la doble vista (frontal y muñeca) permite ilustrar el uso de percepción multimodal en políticas de imitación para divulgación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el flujo de LeRobot usa `--policy.device=cuda`. Para entrenamiento se recomienda una GPU con al menos 8-16 GB de VRAM, aunque el dato exacto no está publicado.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La captura se realiza a 30 FPS según el dataset, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CarAFM/act_so101_pick_place_v2 | 51.668.614 | no aplica | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Manipulación variable | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación variable | variable | Hugging Face |
| Políticas VQ-BeT / TDMPC (LeRobot) | no disponible | no aplica | Manipulación variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea ("Pick up the block and place it in the box"); no generaliza a otras tareas sin reentrenamiento.
- Entrenado para el robot `so_follower` (SO-101) con cámaras `front` y `wrist`; requiere que los nombres e índices de cámara coincidan con las claves de observación.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real, por lo que el rendimiento en producción es desconocido.
- Dataset pequeño (93 episodios, 24.572 fotogramas): riesgo de sobreajuste y baja robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de acciones erróneas o inseguras ante observaciones fuera de distribución.
- Sin capacidades de lenguaje, tool calling ni agentes; no debe confundirse con un modelo conversacional.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar seguridad física del robot antes de desplegar.
- No se documentan sesgos demográficos ni lingüísticos por no ser un modelo de lenguaje, pero el sesgo de datos de teleoperación (un operador, un entorno) puede limitar la generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarAFM/act_so101_pick_place_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/CarAFM/so101_pick_place_block_v2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CarAFM/so101_pick_place_block_v2
