# nberezny/act_franka_pick_place_wp2

## Resumen

`nberezny/act_franka_pick_place_wp2` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. El modelo ha sido entrenado para una tarea robótica concreta de manipulación: recoger un cubo rojo y depositarlo sobre una casilla azul ("Pick up the red cube and place it on the blue square"). El autor es nberezny y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de un artefacto de investigación o prueba más que de un modelo de producción.

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y suele lograr tasas de éxito altas a partir de datos de teleoperación. En este caso, el modelo consume dos cámaras (`overhead` y `wrist`) a resolución 240x320 y un vector de estado de 17 dimensiones, y produce un vector de acción de 10 dimensiones para un robot simulado de tipo `franka_panda_sim_waypoint`.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo canónico del pipeline de LeRobot para entrenar políticas de robótica real con Transformers; por otro, advierte de las limitaciones de un modelo entrenado sobre un único dataset de 200 episodios y una única tarea, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.582.602 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `franka_panda_sim_waypoint` |
| Cámaras de entrada | `overhead`, `wrist` (3, 240, 320) |
| Entrada de estado | `observation.state` de forma (17,) |
| Salida de acción | `action` de forma (10,) |
| Tamaño del repositorio | 0,8 GB |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias cortas de acciones (chunks) condicionadas por observaciones visuales y de estado. La arquitectura combina un codificador de imágenes (típicamente ResNet) que procesa las dos cámaras, una proyección del vector de estado y un decodificador transformer que genera el chunk de acciones. La innovación principal del método es la predicción de chunks, que mitiga el problema de acumulación de errores en tareas de manipulación de horizonte largo, y el uso de una pérdida de reconstrucción con regularización por una consulta latente (estilo VAE) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó sobre el dataset `nberezny/franka_pick_place_wp2`, compuesto por 200 episodios y 30.404 frames a 20 FPS, con una única tarea de pick-and-place. La configuración reportada incluye 100.000 pasos de entrenamiento, batch size de 8, optimizador AdamW con learning rate 1e-5, semilla 1000 y LeRobot 0.7.0. No se documenta el número de tokens de entrenamiento (no aplica), ni el uso de RLHF/DPO (no aplica a este paradigma), ni detalles sobre aumentos de datos o composición exacta del dataset más allá de la tarea descrita. Tampoco se especifica el backbone visual ni el número de capas del transformer, por lo que esos datos quedan como no disponibles.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 10 dimensiones para un robot Franka Panda simulado a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente las vistas `overhead` y `wrist` a 240x320 píxeles.
- Aprendizaje por imitación: reproduce la tarea de pick-and-place aprendida de 200 episodios teleoperados.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad del control.
- Ejecución en bucle cerrado: la política se ejecuta a través de `lerobot-rollout` con realimentación visual continua.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento explícito: es un modelo puramente de control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT y pipelines de LeRobot en tareas de pick-and-place con Franka Panda simulado.
- Benchmark de manipulación en simulación: permite medir tasas de éxito y robustez frente a cambios de posición de objetos o iluminación en el simulador `franka_panda_sim_waypoint`.
- Docencia y formación en robótica: el modelo y su dataset asociado (200 episodios, 30.404 frames) constituyen un ejemplo completo del flujo grabar-entrenar-desplegar de LeRobot.
- Prototipado rápido de políticas: al estar en formato safetensors y cargarse con `lerobot-rollout`, permite validar la integración de hardware y cámaras antes de entrenar políticas propias.
- Generación de datos sintéticos de control: la política puede ejecutarse en bucle para producir trayectorias adicionales que alimenten experimentos de data augmentation.
- Base para fine-tuning: al ser un checkpoint ACT de 51,6 M de parámetros, puede servir como inicialización para tareas de manipulación relacionadas con el mismo robot y configuración de cámaras.
- Evaluación de robustez de políticas: útil para estudiar cómo degrada el rendimiento un modelo entrenado con solo 200 episodios cuando cambian las condiciones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "_No evaluation results have been provided for this policy yet._"

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en fp32 el peso ocupa aproximadamente 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de las cámaras y el runtime de LeRobot más que por el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para un modelo de este tamaño; se recomienda al menos una RTX 3060 o superior para ejecutar el codificador visual y las dos cámaras a 20 FPS sin cuellos de botella.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, 4060, 4090, etc.), dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la model card no reporta tiempos de inferencia ni frecuencia efectiva de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nberezny/act_franka_pick_place_wp2 | 51,6 M | Pick-and-place Franka sim | no aplica | no disponible | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | Manipulación genérica | no aplica | según repositorio | Hugging Face / GitHub |
| Políticas Diffusion Policy en LeRobot | no disponible | Manipulación genérica | no aplica | según repositorio | Hugging Face / GitHub |
| Políticas VQ-BeT en LeRobot | no disponible | Manipulación genérica | no aplica | según repositorio | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada, por lo que la comparación se limita a la categoría y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado sobre una única tarea y un único robot simulado; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Riesgo de alucinación: en el contexto de control motor, el riesgo se traduce en acciones erróneas o inseguras cuando la observación se sale de la distribución de entrenamiento (posiciones nuevas, iluminación distinta, oclusiones).
- Limitaciones de contexto o idioma: no aplica idioma; la política no procesa lenguaje, solo imágenes y estado. La instrucción de tarea es fija ("Pick up the red cube and place it on the blue square").
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial. La model card indica "More Information Needed".
- Dataset reducido: 200 episodios y 30.404 frames son una base limitada; la robustez fuera de las condiciones de recogida es incierta.
- Sin evaluación publicada: no hay tasas de éxito reportadas, lo que impide valorar su rendimiento real.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación (`observation.images.overhead`, `observation.images.wrist`) para que el modelo funcione.
- Entorno simulado: el robot es `franka_panda_sim_waypoint`, por lo que el modelo no está validado en un Franka Panda físico.
- Madurez: 0 descargas y 0 likes sugieren que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_franka_pick_place_wp2
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_wp2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_wp2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
