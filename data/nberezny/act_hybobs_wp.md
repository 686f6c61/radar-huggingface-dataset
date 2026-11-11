# nberezny/act_hybobs_wp

## Resumen

`nberezny/act_hybobs_wp` es una política de imitación (imitation learning) entrenada con el método Action Chunking with Transformers (ACT) y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor para un brazo robótico Franka Panda en simulación, que aprende a ejecutar una tarea concreta de pick-and-place a partir de datos de teleoperación. El autor es el usuario de Hugging Face `nberezny` y el modelo se publicó el 11 de noviembre de 2026.

El modelo resuelve una tarea única: "Pick up the red cube and place it on the blue square". Consume dos flujos de cámara (overhead y wrist) a resolución 240x320 y un vector de estado de 17 dimensiones, y produce un vector de acción de 11 dimensiones. La innovación central de ACT es predecir *chunks* de acciones (secuencias cortas de pasos) en lugar de acciones individuales, lo que reduce el error de acumulación y estabiliza el control.

Con 51,58 millones de parámetros y un repositorio de 0,4 GB en formato safetensors, es un modelo pequeño y ligero, diseñado para ejecutarse en tiempo real sobre el robot. Su relevancia es como ejemplo reproducible de un pipeline completo de LeRobot: dataset, entrenamiento y despliegue con `lerobot-rollout`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.583.627 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa horizonte de chunk de acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo robótico, no lingüístico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Tipo de robot | `franka_panda_sim_hybrid_wp` |
| Cámaras de entrada | `overhead`, `wrist` (3, 240, 320) |
| Estado de entrada | `observation.state` (17,) |
| Salida | `action` (11,) |
| Dataset de entrenamiento | `nberezny/franka_pick_place_hybobs_wp` |
| Episodios / frames | 400 episodios, 1200 frames, 20 FPS |
| Pasos de entrenamiento | 30000 |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación basada en transformer que combina un encoder visual (procesa las imágenes de las cámaras overhead y wrist) con un transformer que genera predicciones de *chunks* de acciones. En lugar de predecir una acción por paso, el modelo predice una secuencia corta, lo que mitiga el problema de *compounding error* típico de los métodos de behavioral cloning. El vector de estado de 17 dimensiones se concatena con las representaciones visuales para condicionar la predicción de las 11 dimensiones de acción.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `franka_pick_place_hybobs_wp`, compuesto por 400 episodios de teleoperación (1200 frames a 20 FPS) de la tarea de recoger un cubo rojo y colocarlo en un cuadrado azul. Se usaron 30000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni otras fases de alineación, algo esperable en un modelo de imitación supervisada.

## Capacidades

- Control visuomotor para una tarea concreta de pick-and-place sobre robot Franka Panda en simulación.
- Procesamiento de dos cámaras simultáneas (overhead y wrist) a 240x320 píxeles.
- Fusión de información visual con estado proprioceptivo de 17 dimensiones.
- Predicción de chunks de acciones de 11 dimensiones para control estable.
- Ejecución en tiempo real mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera del control robótico.

## Casos de uso

- Automatización de pick-and-place en simulación: el modelo ejecuta la secuencia de recoger el cubo rojo y depositarlo en el cuadrado azul, sirviendo como base para tareas de manipulación en entornos simulados Franka.
- Prototipado de pipelines de imitación con LeRobot: permite validar el flujo completo (grabación de dataset, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de escalar a tareas más complejas.
- Investigación en behavioral cloning: útil como referencia reproducible para comparar variantes de ACT y estudiar el efecto del chunking de acciones en la tasa de éxito.
- Generación de datos sintéticos de control: el modelo puede ejecutar rollouts que sirvan para aumentar datasets de manipulación con estados y acciones etiquetados.
- Benchmarking de hardware de inferencia robótica: con 51,6 M de parámetros, sirve para medir latencia y throughput en GPUs de consumo o embebidas en el contexto de control en tiempo real.
- Educación y demos: ejemplo didáctico de cómo se estructura una política ACT en el Hub, con inputs, outputs y configuración de entrenamiento documentados.
- Base para fine-tuning: punto de partida para adaptar ACT a variantes de la tarea (nuevas posiciones, objetos o iluminación) mediante reentrenamiento con nuevos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors (0,4 GB de repositorio), la inferencia cabe holgadamente en GPUs de consumo (por debajo de 2 GB en fp32, menos aún en fp16).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; una RTX 3060 o superior permite ejecutar el modelo con margen. Para entrenamiento, una RTX 4090 o A100 acelera los 30000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs modestas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=nberezny/act_hybobs_wp`; también es posible cargar los pesos safetensors con PyTorch y la librería `lerobot`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo robótico).
- Latencia y throughput estimados: no disponibles. La ejecución está pensada para control en tiempo real a 20 FPS (frecuencia del dataset), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nberezny/act_hybobs_wp` | 51,6 M | ACT (imitación) | chunk de acciones (no especificado) | no disponible | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | ACT | chunk de acciones | no disponible | paper + código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | variable | imitación / RL | variable | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a categoría, tamaño y disponibilidad; no hay métricas de tasa de éxito para contrastar.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 400 episodios de una única tarea en simulación, el modelo está sobreajustado a la distribución de posiciones, iluminación y objetos del dataset; generalizará mal fuera de ella.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural más allá de la tarea fija.
- Restricciones de licencia: la licencia no está especificada ("More Information Needed"), por lo que no se puede garantizar el uso comercial sin consultar al autor.
- Caveats para producción: no hay evaluación publicada de tasa de éxito; el modelo está entrenado en simulación (`franka_panda_sim_hybrid_wp`), por lo que su transferencia a un robot físico no está validada. Requiere que los nombres e índices de cámara coincidan con los usados en el entrenamiento (`overhead`, `wrist`). El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_hybobs_wp
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_hybobs_wp
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_hybobs_wp
