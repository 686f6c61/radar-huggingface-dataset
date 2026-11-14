# mgm136044/act_pick_place_cube_chunk10

## Resumen

`mgm136044/act_pick_place_cube_chunk10` es una política de imitación robótica basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub por el usuario mgm136044 y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de dos cámaras (vista cenital y vista de muñeca) y del estado articular del robot, predice directamente comandos de acción de 6 dimensiones para un brazo `so_follower` (SO-100/SO-101 de LeRobot). El modelo resuelve una tarea concreta de manipulación: "Pick and place the cube".

El método ACT, descrito en el paper arXiv:2304.13705, predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y mejora la estabilidad en tareas de manipulación aprendidas por imitación a partir de datos de teleoperación. En este caso el chunking está configurado a 10 pasos, de ahí el sufijo `chunk10` del repositorio.

El modelo tiene 51.576.454 parámetros (dato real de los safetensors), un tamaño de repositorio de 0,2 GB y licencia Apache 2.0. Se entrenó durante 100.000 pasos sobre un dataset propio de 50 episodios y 19.137 fotogramas a 25 FPS. Es relevante ahora como ejemplo reproducible de entrenamiento de políticas robóticas de bajo coste con LeRobot 0.6.0, aunque su alcance es estrictamente limitado a la tarea y al hardware con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones visuales y de estado que predice chunks de acciones |
| Parametros totales | 51.576.454 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de texto; usa ventana de observación por paso y chunk de acciones de 10 pasos) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (no procesa lenguaje; la tarea se especifica con la cadena "Pick and place the cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `overhead`, `wrist` |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Entrada visual | `observation.images.overhead` y `observation.images.wrist`, ambas `(3, 480, 640)` |
| Salida | `action` de forma `(6,)` |
| Dataset de entrenamiento | `mgm136044/pick-place-cube_20261008_100203` (50 episodios, 19.137 fotogramas, 25 FPS) |
| Pasos de entrenamiento | 100.000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer que aprende una política de imitación condicionada por observaciones multimodales. En esta implementación de LeRobot, el modelo recibe el estado articular de 6 dimensiones del robot junto con dos imágenes RGB de 480x640 (cámara cenital y de muñeca), las codifica mediante un backbone visual y un transformer, y emite un chunk de 10 acciones de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación central del método: mitiga el error de composición y produce trayectorias más suaves y estables, a costa de una mayor latencia de decisión efectiva por chunk.

El entrenamiento se realizó por imitación supervisada sobre teleoperaciones, sin indicios de RLHF ni DPO (no aplica a este dominio). La configuración documentada es: 100.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.0. El dataset contiene 50 episodios y 19.137 fotogramas a 25 FPS de la tarea "Pick and place the cube". No se documentan aumentos de datos, composición detallada del dataset ni innovaciones adicionales más allá del chunking.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir de dos vistas de cámara y del estado articular.
- Predicción por chunks de 10 pasos, lo que permite ejecutar secuencias de acción coherentes sin replanificar en cada fotograma.
- Ejecución de una tarea específica de pick-and-place sobre un cubo, aprendida por imitación.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, agentes de texto ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción de la tarea entrenada: ejecutar `lerobot-rollout` con `--policy.path=mgm136044/act_pick_place_cube_chunk10` y `--task="Pick and place the cube"` sobre un `so_follower` con cámaras cenital y de muñeca para recoger y colocar un cubo en el mismo entorno de entrenamiento.
- Base para fine-tuning: usar este checkpoint como inicialización y reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio para adaptar la política a nuevas posiciones de objeto o variaciones de iluminación.
- Referencia educativa de imitación robótica: estudiar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) con un ejemplo real de 50 episodios y 100.000 pasos.
- Pruebas de infraestructura de inferencia robótica: validar pipelines de captura de cámara, calibración y control a 25-30 FPS en un robot de bajo coste.
- Benchmark interno de políticas ACT: comparar el efecto del tamaño de chunk (10 frente a otros valores) y de la configuración de entrenamiento en la tasa de éxito.
- Prototipado de automatización de pick-and-place en laboratorio: evaluar si un brazo SO-100/SO-101 con dos cámaras es suficiente para tareas de recogida simple antes de invertir en hardware mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y pesos en safetensors (0,2 GB de repositorio) la huella es muy reducida, del orden de menos de 1 GB en FP32 incluyendo el backbone visual, aunque no se documenta una cifra exacta.
- GPU recomendadas: no disponibles en la información. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de cámaras se configura a 30 FPS en el ejemplo de rollout, mientras que el dataset se grabó a 25 FPS; no se publican cifras de latencia por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mgm136044/act_pick_place_cube_chunk10` | 51,6 M | chunk de 10 acciones | Pick-and-place de cubo con `so_follower` | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (referencia del método) | Variable | Configurable | Manipulación por imitación | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| Diffusion Policy (referencia alternativa de imitación) | Variable | No disponible | Manipulación por imitación | No disponible en esta ficha | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables concretos en la información proporcionada; la comparativa se limita a la categoría metodológica.

## Limitaciones y advertencias

- Alcance muy restringido: entrenado únicamente para la tarea "Pick and place the cube" con un robot `so_follower` y dos cámaras concretas; no generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: el autor no reporta tasa de éxito ni resultados en robot real, por lo que no hay evidencia cuantitativa de rendimiento.
- Dependencia del hardware: requiere un `so_follower` calibrado y cámaras con los nombres e índices exactos (`overhead`, `wrist`) usados en el entrenamiento.
- Dataset pequeño: 50 episodios y 19.137 fotogramas; es probable un sobreajuste al entorno de grabación (posiciones, iluminación, fondo).
- Riesgo de fallo por distribución fuera de entrenamiento: cambios en la posición del cubo, distractores o iluminación pueden degradar la política sin aviso.
- Sin capacidades de lenguaje ni de razonamiento simbólico; no debe presentarse como un modelo de propósito general.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad del dominio hacen desaconsejable su uso en producción sin validación propia.
- No se documentan sesgos ni consideraciones de seguridad específicas; como política de control físico, un fallo puede provocar colisiones o daños en el robot o el entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mgm136044/act_pick_place_cube_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/mgm136044/pick-place-cube_20261008_100203
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mgm136044/pick-place-cube_20261008_100203
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
