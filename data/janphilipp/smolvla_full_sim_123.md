# JanPhilipp/smolvla_full_sim_123

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y estado propioceptivo. Este checkpoint concreto (`JanPhilipp/smolvla_full_sim_123`) es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset de simulación de 423 episodios y 307.360 fotogramas a 30 FPS, orientado a tareas de manipulación de herramientas (alicates, martillo y destornillador) entre zonas verde y roja.

El modelo resuelve el problema de la política de imitación end-to-end para robótica: en lugar de programar controladores clásicos, aprende directamente el mapeo de tres cámaras RGB de 256×256 píxeles y un vector de estado de 6 dimensiones a un vector de acción de 6 dimensiones. Con 450.046.176 parámetros, está pensado para desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios e investigadores que necesitan iterar rápido en robótica de imitación sin clústeres de GPU.

La relevancia actual radica en la combinación de un tamaño contenido, licencia Apache 2.0 y una integración directa con la librería LeRobot, que permite tanto el despliegue mediante `lerobot-rollout` como el reentrenamiento con `lerobot-train`. El modelo está entrenado exclusivamente en simulación, por lo que su utilidad principal es la investigación y el prototipado antes de un eventual transfer a robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) compacta, según paper arXiv:2506.01844 |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de política robótica, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (interfaz de instrucciones en inglés en las tareas del dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot 0.6.1 |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `camera1`, `camera2`, `camera3` (3×256×256) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Modelo base | `lerobot/smolvla_base` |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de instrucciones en lenguaje natural y una cabeza de política que produce acciones continuas de 6 dimensiones. La arquitectura concreta se describe en el paper arXiv:2506.01844, que presenta SmolVLA como un modelo compacto y eficiente capaz de alcanzar rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. Este checkpoint concreto es un ajuste fino del modelo base `lerobot/smolvla_base`.

El ajuste fino se realizó sobre el dataset `maxmeyer/three_tool_opt_sim_r4_hybrid_trio_20261105_094503`, compuesto por 423 episodios y 307.360 fotogramas a 30 FPS, con cuatro tareas de manipulación: mover alicates, martillo o destornillador de la zona verde a la roja, y mover todas las herramientas. La configuración de entrenamiento fue de 20.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.1. No se documenta en la información disponible si se emplearon técnicas de RLHF, DPO ni detalles sobre la composición exacta del dataset más allá de las tareas y métricas citadas.

## Capacidades

- Control robótico de manipulación end-to-end: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: consume tres flujos RGB de 256×256 píxeles simultáneamente.
- Seguimiento de instrucciones en lenguaje natural: las tareas se especifican como cadenas de texto en inglés ("Move the pliers from the green area to the red area").
- Ejecución de políticas de imitación entrenadas en simulación para tareas de pick-and-place con múltiples objetos.
- Integración con el ecosistema LeRobot: despliegue mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Compatibilidad con el robot `so_follower` y su pipeline de calibración de hardware.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas, visión general o audio.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida para experimentar con políticas VLA compactas sobre el robot `so_follower`, usando `lerobot-train` para reajustar el modelo a nuevos datasets.
- Prototipado de tareas pick-and-place en simulación: entrenar y validar políticas de manipulación de herramientas antes de transferirlas a hardware real, aprovechando las 423 trayectorias del dataset de origen.
- Benchmarking de políticas VLA: comparar el rendimiento de SmolVLA frente a otras políticas de LeRobot en tareas de manipulación con múltiples objetos y cámaras.
- Automatización de laboratorio educativo: desplegar el modelo en entornos docentes con robots de bajo coste tipo SO-100/SO-101 para demostrar pipelines completos de aprendizaje por imitación.
- Generación de datos sintéticos y aumento de datasets: usar la política como generador de trayectorias en simulación para ampliar datasets de entrenamiento de otros modelos.
- Evaluación de robustez multi-cámara: estudiar cómo afecta la configuración de tres cámaras a la precisión de la política en tareas de clasificación y transporte de objetos.
- Integración en pipelines de investigación reproducibles: al estar en LeRobot 0.6.1 con licencia Apache 2.0, puede incorporarse a flujos de experimentación versionados y compartidos entre equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (probablemente fp32 o bf16), la inferencia cabe holgadamente en GPUs de consumo, aunque no se documenta la huella exacta.
- GPU recomendadas: no disponible; el paper de SmolVLA indica que el modelo está pensado para hardware de consumo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, según la descripción del paper ("can be deployed on consumer-grade hardware"); no se detallan modelos concretos.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) para ejecución sobre robot; `lerobot-train` para reentrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible. El dataset opera a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se publican mediciones de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `JanPhilipp/smolvla_full_sim_123` | 450 M | 3 cámaras 256×256 + estado (6,) | Apache 2.0 | Hugging Face (24 descargas) |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | no disponible | Hugging Face (modelo base oficial) |
| Otras políticas de LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: no hay evidencia de transfer a robot real ni resultados de evaluación reportados.
- Dataset pequeño y específico: 423 episodios y cuatro tareas concretas de manipulación de herramientas; la generalización a otros objetos o entornos es incierta.
- Sin evaluación publicada: la model card indica que no se han proporcionado resultados de éxito, por lo que no se puede afirmar su fiabilidad.
- Dependencia de la configuración de hardware: requiere robot `so_follower` y tres cámaras con nombres e índices que coincidan con las claves de observación del entrenamiento.
- Instrucciones en inglés: las tareas del dataset están en inglés; no se documenta soporte multilingüe.
- Riesgo de sobreajuste a la distribución de simulación: cambios de iluminación, posiciones de objetos o distracciones pueden degradar el rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset de origen deben verificarse por separado.
- Solo 24 descargas y 0 likes: modelo de investigación con escasa validación comunitaria.
- No apto para tareas de lenguaje general, razonamiento o código: es una política robótica, no un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanPhilipp/smolvla_full_sim_123
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/maxmeyer/three_tool_opt_sim_r4_hybrid_trio_20261105_094503
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=maxmeyer/three_tool_opt_sim_r4_hybrid_trio_20261105_094503
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
