# arvinesmaeilydev/xvla_PickUpTheCube_Dual_50_Focus_Regularization-ema

## Resumen

X-VLA es un framework de visión-lenguaje-acción (VLA) basado en *soft prompts* y *flow matching*, presentado en el paper arXiv:2510.10274. El modelo trata cada configuración de robot o hardware como una "tarea" codificada mediante un pequeño conjunto de embeddings de soft prompt aprendibles, lo que permite que un único modelo reconcilie morfologías de robot, sensores y espacios de acción diversos. Este checkpoint concreto es un ajuste fino del modelo base `lerobot/xvla-base` para una tarea de manipulación robótica específica: recoger un cubo.

El modelo que nos ocupa, `xvla_PickUpTheCube_Dual_50_Focus_Regularization-ema`, es una política de imitación entrenada con LeRobot sobre el dataset `arvinesmaeilydev/PickUpTheCube_Dual_50` (50 episodios, 23.278 frames a 30 FPS). Consume tres flujos visuales (dos cámaras de 256x256 y una de 224x224) más un vector de estado de 8 dimensiones, y produce un vector de acción de 6 dimensiones. El sufijo "ema" indica que los pesos publicados corresponden a una media móvil exponencial de los parámetros durante el entrenamiento, una práctica habitual para estabilizar la política final.

Es relevante ahora porque ejemplifica el flujo de trabajo end-to-end de LeRobot para políticas VLA: un modelo base preentrenado, un dataset pequeño de teleoperación y un ajuste fino reproducible con CLI. Con 879,7 millones de parámetros y licencia Apache 2.0, es un punto de partida accesible para investigación en manipulación robótica con hardware tipo SO-100/SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con soft prompts y flow matching |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | so_follower (SO-100/SO-101) |
| Camaras | top, wrist (+ tercera vista de 224x224) |
| Entradas | `observation.images.image` (3,256,256), `observation.images.image2` (3,256,256), `observation.images.image3` (3,224,224), `observation.state` (8,) |
| Salidas | `action` (6,) |
| Libreria | lerobot 0.6.2 |
| Tamano del repo | 1.8 GB |

## Arquitectura y entrenamiento

X-VLA es un transformer multimodal que combina un codificador visual, un modelo de lenguaje y una cabeza de acción entrenada con flow matching (generación de acciones mediante integración de un campo de velocidades). La innovación principal es el uso de *soft prompts*: cada robot o configuración de hardware se representa como un conjunto reducido de embeddings aprendibles que condicionan al modelo, de forma que una sola red puede manejar morfologías, sensores y espacios de acción heterogéneos sin necesidad de cabezas específicas por robot. El modelo parte de `lerobot/xvla-base`, preentrenado de forma multi-robot.

Este checkpoint se ha ajustado fino durante 20.000 pasos con batch size 32, optimizador `xvla-adamw`, learning rate 1e-4 y semilla 1000, sobre 50 episodios (23.278 frames a 30 FPS) de la tarea "pick up the cube". Los pesos publicados corresponden a una EMA de los parámetros. No se especifica en la información disponible el número de tokens de preentrenamiento ni la composición del dataset del modelo base, ni si hubo RLHF/DPO (en robótica de imitación no es lo habitual; el entrenamiento es supervisado sobre demostraciones).

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones a partir de observaciones visuales y de estado proprioceptivo.
- Control viso-motor para tareas de pick-and-place sobre un robot SO-100/SO-101 (`so_follower`).
- Fusión de múltiples vistas de cámara (configuración dual: `top` y `wrist`, más una tercera vista de 224x224).
- Condicionamiento por instrucción en lenguaje natural (el campo `--task="pick up the cube"` en el CLI de rollout).
- Política de imitación entrenada específicamente para una tarea; no es un modelo de propósito general.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni visión generalista: es un modelo de robótica.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: desplegar la política sobre un SO-100/SO-101 con dos cámaras para recoger un cubo de forma autónoma; adecuado porque el modelo está ajustado exactamente a esa tarea y morfología.
- **Punto de partida para ajuste fino en nuevas tareas**: usar este checkpoint como inicialización y reentrenar con `lerobot-train` sobre un dataset propio de otra tarea de manipulación, aprovechando que parte del modelo base multi-robot.
- **Reproducción de experimentos de investigación en VLA**: validar la metodología de soft prompts y flow matching del paper X-VLA con un caso concreto y reproducible.
- **Evaluación de técnicas de regularización (EMA)**: comparar los pesos EMA publicados con los pesos no-EMA del mismo entrenamiento para estudiar estabilidad de políticas de imitación.
- **Benchmark interno de hardware robótico asequible**: medir latencia y tasa de éxito de una política VLA de ~880M parámetros sobre GPUs de consumo en un banco de pruebas con SO-100.
- **Docencia y formación en imitation learning**: ejemplo completo y ligero de pipeline LeRobot (grabación de datos, entrenamiento, rollout) para cursos de robótica.
- **Generación de datos sintéticos de evaluación**: ejecutar la política en simulación o en bucle real para recolectar trayectorias y analizar modos de fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."*

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 879,7 M de parámetros en fp32 serían ~3,5 GB de pesos; en fp16/bf16 ~1,8 GB; en int8 ~0,9 GB. A ello hay que sumar activaciones del codificador visual y del modelo de lenguaje, por lo que una GPU con 8-12 GB es un punto de partida razonable (estimación, no dato del autor).
- **GPU recomendadas**: no especificadas por el autor. Para entrenamiento se usa `--policy.device=cuda`; para rollout, una GPU de consumo moderna es suficiente en principio.
- **¿Cabe en GPU de consumo?**: muy probablemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no está confirmado en la información disponible.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--strategy.type=base`), integración con el stack de HuggingFace LeRobot. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- **Latencia y throughput**: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xvla_PickUpTheCube_Dual_50_Focus_Regularization-ema | 879,7 M | VLA (soft prompt + flow matching) | Apache 2.0 | HuggingFace (este repo) | Ajuste fino para "pick up the cube" sobre SO-100 |
| lerobot/xvla-base | no disponible | VLA base multi-robot | no disponible en esta ficha | HuggingFace | Modelo base del que parte este checkpoint |
| Otras políticas LeRobot (ACT, Diffusion Policy, pi0) | no disponible | Imitation learning / VLA | no disponible en esta ficha | HuggingFace / LeRobot | Alternativas del ecosistema LeRobot; no se aportan datos comparativos en la información disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Sobreajuste a una tarea y morfología**: entrenado solo para "pick up the cube" sobre `so_follower` con dos cámaras; no generaliza a otras tareas sin reentrenamiento.
- **Dataset muy pequeño**: 50 episodios y 23.278 frames; riesgo alto de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- **Sin evaluación publicada**: no hay tasa de éxito reportada; no se puede afirmar su fiabilidad en producción.
- **Sesgos**: no documentados; en robótica de imitación los sesgos provienen de las demostraciones (posiciones, colores, condiciones de laboratorio) y pueden trasladarse a la política.
- **Alucinación**: no aplica en el sentido de texto, pero sí puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- **Idiomas**: no disponibles; el condicionamiento lingüístico se limita a la instrucción de la tarea.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías; verificar el cumplimiento al desplegar en robots reales.
- **Seguridad física**: al controlar un robot real, deben implementarse límites de par, paradas de emergencia y supervisión humana.
- **Formato**: solo safetensors; no hay versiones GGUF/cuantizadas publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arvinesmaeilydev/xvla_PickUpTheCube_Dual_50_Focus_Regularization-ema
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_Dual_50
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_Dual_50
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
