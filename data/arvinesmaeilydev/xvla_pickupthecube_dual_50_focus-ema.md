# arvinesmaeilydev/xvla_PickUpTheCube_Dual_50_Focus-ema

## Resumen

X-VLA es un framework de Vision-Language-Action (VLA) basado en soft prompts y flow matching, desarrollado en el ecosistema LeRobot de Hugging Face. El modelo trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles, lo que permite que un único modelo reconcilie morfologías de robot, sensores y espacios de acción diversos. La ficha que nos ocupa es un fine-tuning concreto del checkpoint base `lerobot/xvla-base`, especializado en una tarea de manipulación de pick-and-place con un robot `so_follower`.

Este fine-tuning concreto (`xvla_PickUpTheCube_Dual_50_Focus-ema`) se ha entrenado sobre el dataset `arvinesmaeilydev/PickUpTheCube_Dual_50_Focus`, que recoge 100 episodios y 34.229 frames a 30 FPS de dos tareas: recoger un cubo azul y recoger un cubo rojo. El modelo consume tres flujos visuales (dos a 256x256 y uno a 224x224) junto con un vector de estado de 8 dimensiones, y produce un vector de acción de 6 dimensiones.

Con 879.687.256 parámetros y un tamaño de repositorio de 1,8 GB en safetensors, es un modelo de política de robot compacto, pensado para despliegue en hardware de laboratorio o de borde, no para inferencia en la nube a gran escala. Su relevancia radica en demostrar el flujo de trabajo de fine-tuning de VLA en LeRobot con datos propios de teleoperación.

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
| Tipo de robot | so_follower |
| Camaras | top, wrist (y una tercera entrada visual) |
| Entrada visual | observation.images.image (3, 256, 256); observation.images.image2 (3, 256, 256); observation.images.image3 (3, 224, 224) |
| Entrada de estado | observation.state (8,) |
| Salida de accion | action (6,) |
| Libreria | lerobot 0.6.2 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

X-VLA es un framework VLA que combina un codificador visual-lenguaje con un cabezal de acción basado en flow matching. La innovación principal es el uso de soft prompts: cada robot o configuración de hardware se representa como una "tarea" mediante un conjunto pequeño de embeddings aprendibles, de modo que un mismo modelo puede adaptarse a morfologías, sensores y espacios de acción distintos sin necesidad de arquitecturas separadas. El entrenamiento de este checkpoint parte de `lerobot/xvla-base` y se ha realizado con 20.000 pasos, batch size 4, optimizador `xvla-adamw`, learning rate 5e-05 y semilla 1000, usando LeRobot 0.6.2.

El dataset de fine-tuning contiene 100 episodios y 34.229 frames a 30 FPS, con dos tareas de manipulación ("pick up the blue cube" y "pick up the red cube"). No se dispone de información sobre el número total de tokens de entrenamiento del modelo base, la composición del corpus multimodal ni si hubo etapas de RLHF o DPO. El sufijo `-ema` en el nombre del repositorio sugiere el uso de pesos promediados exponencialmente (EMA) durante el entrenamiento, aunque la model card no lo detalla explícitamente.

## Capacidades

- Control de robot de manipulación mediante imitación visual: genera acciones de 6 dimensiones a partir de tres vistas de cámara y el estado del robot.
- Ejecución de tareas de pick-and-place sobre objetos concretos (cubo azul y cubo rojo) en el entorno de entrenamiento.
- Fusión multimodal de tres flujos visuales (dos a 256x256 y uno a 224x224) con un vector de estado de 8 dimensiones.
- Política de acción continua basada en flow matching, adecuada para control motor de precisión.
- Integración nativa con LeRobot para rollout, entrenamiento y evaluación.
- Adaptación a nuevas tareas mediante fine-tuning desde `lerobot/xvla-base`.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües o modos de razonamiento explícito, ya que se trata de un modelo de política robótica y no de un LLM conversacional.

## Casos de uso

- Investigación en imitación visual para manipulación: servir como referencia reproducible de fine-tuning de X-VLA con un dataset propio de 100 episodios, útil para comparar hiperparámetros y curvas de aprendizaje en laboratorio.
- Automatización de pick-and-place en bancos de pruebas: el modelo ejecuta las tareas "pick up the blue cube" y "pick up the red cube" sobre un robot `so_follower` con cámaras top y wrist, lo que permite validar pipelines de percepción-acción de extremo a extremo.
- Base para transferencia a nuevas tareas de clasificación de objetos: al partir de `lerobot/xvla-base`, se puede reentrenar con datasets adicionales para ampliar el repertorio de objetos y posiciones.
- Evaluación de políticas VLA en entornos controlados: útil para medir tasas de éxito, robustez a cambios de iluminación y sensibilidad a distractores, aunque el autor no ha publicado resultados de evaluación.
- Docencia y formación en robótica de imitación: el flujo `lerobot-rollout` con `--strategy.type=base` permite demostrar en vivo cómo una política entrenada ejecuta tareas durante un tiempo configurable (`--duration`).
- Integración en pipelines de investigación con LeRobot: el checkpoint se puede cargar directamente con `--policy.path` y combinarse con las herramientas de visualización de datasets y de entrenamiento del ecosistema.
- Prototipado de control continuo de 6 grados de libertad: la salida de acción de 6 dimensiones encaja con robots de tipo seguidor de bajo coste para experimentos de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se ha rellenado la tabla de tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 879,7 millones de parámetros en safetensors (aproximadamente 3,5 GB en fp32 o 1,8 GB en fp16/bf16), se puede estimar un consumo de VRAM de entre 2 y 6 GB según precisión y overhead de activaciones, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder alojar el modelo en fp16, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Por el número de parámetros es probable que sí en tarjetas como RTX 3060/4060 o superiores, pero no hay validación publicada.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arvinesmaeilydev/xvla_PickUpTheCube_Dual_50_Focus-ema | 879.687.256 | no disponible | VLA fine-tuned para so_follower | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/xvla-base | no disponible | no disponible | VLA base multimodal | no disponible en la información | Hugging Face |
| Otros VLA de LeRobot (p. ej. pi0, SmolVLA) | no disponible | no disponible | Políticas VLA | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor no ha publicado resultados de evaluación: se desconoce la tasa de éxito real en las tareas de pick-and-place.
- El modelo está especializado en dos tareas concretas ("pick up the blue cube" y "pick up the red cube") y en un robot `so_follower` con una configuración específica de cámaras; no se espera generalización a otros objetos, morfologías o entornos sin reentrenamiento.
- El dataset de entrenamiento es pequeño (100 episodios, 34.229 frames), lo que limita la robustez frente a variaciones de iluminación, posición de objetos y distractores.
- Riesgo de sobreajuste al entorno de recogida de datos y de fallo ante condiciones no vistas.
- No se dispone de información sobre sesgos, ya que no es un modelo de lenguaje general.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base `lerobot/xvla-base` y del dataset utilizado.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de validación independiente.
- No se dispone de información sobre cuantizaciones soportadas ni sobre latencias en hardware de borde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arvinesmaeilydev/xvla_PickUpTheCube_Dual_50_Focus-ema
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_Dual_50_Focus
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación (grabación y entrenamiento): https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_Dual_50_Focus
