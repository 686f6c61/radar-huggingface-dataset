# linabletarou/act_grab_tape_2cam_v2

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `linabletarou/act_grab_tape_2cam_v2`, contiene una política entrenada con LeRobot sobre el robot `so_follower` (SO-100/101 de The Robot Studio) equipado con dos cámaras: frontal y de muñeca.

El modelo resuelve una tarea muy específica: "Grab the tape" (agarrar la cinta). Se entrenó con 52 episodios de teleoperación (29.265 frames a 30 FPS) y 20.000 pasos de entrenamiento con batch size 8 y learning rate 1e-5. Es un modelo pequeño, de 51,7 millones de parámetros, orientado a inferencia en tiempo real sobre hardware de bajo coste.

Su relevancia es práctica: sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) y como punto de partida para quien quiera entrenar sus propias políticas de imitación con dos cámaras. No es un modelo de lenguaje ni un modelo fundacional: es una política visomotora especializada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,5 GB, incluye checkpoints y artefactos de entrenamiento) |

Especificaciones adicionales de la política:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-100/101) |
| Cámaras | `front`, `wrist` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.front` | VISUAL, shape `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Dataset de entrenamiento | `linabletarou/grab_tape_2cam_v2_clean` |
| Episodios / frames / FPS | 52 / 29.265 / 30 |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora. Combina un backbone visual (típicamente ResNet) que procesa las imágenes de las cámaras con un encoder transformer que fusiona las características visuales con el estado propioceptivo del robot (posición de articulaciones). El decoder genera un chunk de acciones de longitud fija en lugar de una sola acción, lo que mitiga el problema de compounding errors inherente a las políticas paso a paso y permite un control más suave.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `grab_tape_2cam_v2_clean`, compuesto por 52 episodios teleoperados de la tarea "Grab the tape" a 30 FPS. Se usaron 20.000 pasos con AdamW, learning rate 1e-5, batch size 8 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; se trata de aprendizaje por imitación supervisado puro (behavior cloning). Tampoco se especifican detalles del backbone visual ni la longitud exacta del chunk de acciones.

## Capacidades

- Control visomotor de un robot SO-100/101 (`so_follower`) para la tarea específica "Grab the tape".
- Fusión de dos vistas (frontal y de muñeca) con el estado de 6 articulaciones para producir acciones de 6 dimensiones.
- Predicción de chunks de acciones, lo que aporta suavidad y robustez frente a errores acumulados.
- Ejecución en tiempo real vía `lerobot-rollout` con estrategia `base`.
- Entrenamiento reproducible con `lerobot-train --policy.type=act`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea "Grab the tape": ejecutar la política con `lerobot-rollout` sobre un SO-100/101 con dos cámaras para validar el pipeline completo de LeRobot de extremo a extremo.
- Punto de partida para fine-tuning: usar este checkpoint como inicialización y reentrenar con un dataset propio de otra tarea de manipulación, aprovechando que ACT converge con pocos episodios (52 en este caso).
- Referencia educativa: estudiar cómo se estructura un repositorio de política ACT en LeRobot (features de observación, configuración de entrenamiento, artefactos de safetensors) para formar a nuevos usuarios del framework.
- Benchmark interno de hardware: medir latencia de inferencia y throughput de una política de 51,7 M de parámetros en GPUs de consumo (RTX 3060/4060/4090) para dimensionar despliegues robóticos de bajo coste.
- Prueba de concepto de manipulación con dos cámaras: comparar el rendimiento de una configuración frontal + muñeca frente a una sola cámara en la misma tarea, usando este modelo como baseline.
- Automatización de laboratorio o aula: desplegar una política de agarre sencilla en entornos docentes donde se necesite una tarea de pick reproducible y con licencia Apache 2.0 para uso comercial y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros (unos 207 MB en fp32, ~104 MB en fp16). Con dos streams de imagen a 480x640 y el backbone visual, la huella real en VRAM es mayor, pero cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para inferencia en tiempo real a 30 FPS, una RTX 3060 o superior es suficiente; una GPU integrada puede no alcanzar la tasa de control.
- Cabe en GPU de consumo: sí, en cualquier RTX 20/30/40 o equivalente AMD con ROCm; también en Jetson Orin para despliegue embebido.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), integración con el stack de LeRobot en PyTorch. No se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (no aplican a este tipo de política).
- Latencia y throughput: no disponibles en la información proporcionada. La tasa de control esperada es de 30 FPS (la del dataset), pero no se confirma en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Cámaras | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `linabletarou/act_grab_tape_2cam_v2` | ACT (LeRobot) | 51,7 M | 2 (front, wrist) | Grab the tape | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot (p. ej. `lerobot/act_aloha_*`) | ACT (LeRobot) | ~50 M (típico) | Variable | Varias tareas ALOHA | Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | Variable | Manipulación | Apache 2.0 | Hugging Face |
| Políticas π0 / OpenVLA | VLA fundacional | miles de millones | Variable | Multi-tarea | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, configuración y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea "Grab the tape" con un robot `so_follower` y una configuración concreta de cámaras. Fuera de ese contexto, el comportamiento no está garantizado.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba documentadas, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia del hardware: los nombres e índices de cámara, el puerto del robot y la calibración deben coincidir exactamente con los del entrenamiento; cualquier cambio invalida la política.
- Sensibilidad a condiciones visuales: cambios de iluminación, posición de la cinta, fondo o distracciones pueden degradar el rendimiento (no cuantificado).
- Riesgo de sobreajuste: 52 episodios y 20.000 pasos con batch 8 es un régimen pequeño; la generalización a variaciones de la tarea es limitada.
- Sin capacidades de lenguaje ni razonamiento: no debe usarse para tareas de NLP, tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio de 2,5 GB: incluye artefactos de entrenamiento además de los pesos; conviene revisar qué se descarga antes de integrarlo en pipelines automatizados.
- Fecha de creación futura en los metadatos (2026-11-09): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linabletarou/act_grab_tape_2cam_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/linabletarou/grab_tape_2cam_v2_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=linabletarou/grab_tape_2cam_v2_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
