# arvinesmaeilydev/xvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus_epoch_1000-ema

## Resumen

X-VLA es un framework Vision-Language-Action (VLA) basado en flow matching y soft prompting, desarrollado en el ecosistema LeRobot de Hugging Face. Este checkpoint concreto, `xvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus_epoch_1000-ema`, es un fine-tuning del modelo base `lerobot/xvla-base` realizado por el usuario `arvinesmaeilydev` para una tarea de manipulación robótica muy específica: recoger un cubo azul o un cubo rojo con un robot tipo `so_follower` equipado con tres cámaras (top, wrist y una tercera vista).

El modelo resuelve el problema de mapear observaciones visuales y de estado del robot a acciones de control de 6 dimensiones, aprendiendo por imitación a partir de un dataset de 200 episodios y 85.682 frames grabados a 30 FPS. La innovación del enfoque X-VLA radica en tratar cada configuración de hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de soft prompt aprendibles, lo que permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos.

Con 879,7 millones de parámetros y un tamaño de repositorio de 1,8 GB, es un modelo de tamaño medio orientado a despliegue en robótica real, no a generación de texto general. Su relevancia actual reside en que demuestra el flujo completo de LeRobot para fine-tuning de políticas VLA sobre hardware asequible, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompting (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | so_follower |
| Camaras | top, wrist (y una tercera vista adicional) |
| Entradas | observation.images.image (3,256,256), observation.images.image2 (3,256,256), observation.state (8,), observation.images.image3 (3,224,224) |
| Salidas | action (6,) |
| Biblioteca | lerobot 0.6.2 |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con soft prompting y flow matching. Cada configuración de robot o hardware se trata como una "tarea" codificada mediante un pequeño conjunto de embeddings de soft prompt aprendibles, lo que permite que un único modelo maneje morfologías, sensores y espacios de acción heterogéneos. El modelo consume tres flujos visuales (dos a 256x256 y uno a 224x224) más un vector de estado de 8 dimensiones, y produce un vector de acción de 6 dimensiones. La generación de acciones se formula como un problema de flow matching, una alternativa a la difusión que modela directamente el campo de velocidad entre la distribución de ruido y la de acciones.

El fine-tuning se realizó sobre el dataset `arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100_Focus`, compuesto por 200 episodios y 85.682 frames a 30 FPS, con dos tareas: "pick up the blue cube" y "pick up the red cube". La configuración de entrenamiento fue de 3.000 pasos, batch size 32, optimizador `xvla-adamw`, learning rate 0,0001 y semilla 1000, usando LeRobot 0.6.2. El checkpoint corresponde a la época 1000 con EMA (media móvil exponencial) de los pesos. No se dispone de información sobre el volumen total de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa tres vistas simultáneas (top, wrist y una tercera cámara) para localizar objetos y guiar la manipulación.
- Ejecución de tareas de picking condicionadas por lenguaje: responde a las instrucciones "pick up the blue cube" y "pick up the red cube".
- Discriminación de objetos por color: el dataset de entrenamiento incluye cubos azul y rojo, por lo que el modelo aprende a distinguirlos visualmente.
- Integración con LeRobot: compatible con el CLI `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües en el sentido de un LLM; es una política de robótica, no un modelo de lenguaje generativo.

## Casos de uso

- Recogida de cubos en laboratorio: el modelo ejecuta la tarea "pick up the blue cube" o "pick up the red cube" sobre un robot SO-100/SO-101 follower con tres cámaras, sirviendo como referencia para validar pipelines de imitación en hardware de bajo coste.
- Base para fine-tuning en nuevas tareas de picking: al estar construido sobre `lerobot/xvla-base`, puede reentrenarse con `lerobot-train` sobre nuevos datasets para añadir objetos, posiciones o instrucciones adicionales.
- Evaluación de configuraciones de cámaras: al depender de tres vistas (top, wrist y una tercera), permite estudiar cómo afecta la disposición de sensores al éxito de la política en tareas de manipulación.
- Docencia y prototipado en robótica: con licencia Apache 2.0 y pesos safetensors de 1,8 GB, es adecuado para cursos y talleres donde se enseña el ciclo completo de grabación de datos, entrenamiento y despliegue con LeRobot.
- Benchmark interno de políticas VLA: sirve como punto de comparación para medir el efecto de cambios en el dataset (número de episodios, FPS, tareas) sobre el rendimiento de una política X-VLA.
- Automatización de tareas de pick-and-place en entornos controlados: en celdas de laboratorio con iluminación y posiciones de objeto acotadas, el modelo puede ejecutar ciclos repetidos de recogida tras un entrenamiento específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de métricas de pérdida de entrenamiento, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 879,7 M de parámetros, una estimación en FP32 rondaría los 3,5 GB solo de pesos, y en FP16 unos 1,8 GB, pero no se confirma el dtype de despliegue ni el overhead de las tres cámaras.
- GPU recomendadas: no disponible; LeRobot soporta `--policy.device=cuda`, pero no se especifica un modelo de GPU concreto.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros cabría en GPUs consumer modernas, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus_epoch_1000-ema | 879,7 M | no disponible | VLA (flow matching) | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/xvla-base | no disponible | no disponible | VLA (flow matching) | no disponible en la informacion | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la informacion | no disponible | Políticas de imitación | no disponible en la informacion | Ecosistema LeRobot |

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo se entrenó con dos objetos de colores concretos (azul y rojo) y podría no generalizar a otros objetos, colores o posiciones no vistas.
- Riesgo de alucinación: en el contexto robótico, el equivalente es la ejecución de acciones incorrectas o inseguras cuando la escena difiere de la distribución de entrenamiento; no hay evaluación que lo cuantifique.
- Limitaciones de contexto e idioma: no aplica un contexto de texto; las instrucciones están limitadas a las dos tareas del dataset ("pick up the blue cube", "pick up the red cube") y no hay soporte multilingüe documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas en la información disponible.
- Caveat para producción: el modelo no tiene evaluación publicada, cero descargas y cero likes; es un checkpoint de investigación, no validado para entornos reales. Requiere que los nombres de cámara coincidan exactamente con las claves de observación del entrenamiento y un robot `so_follower` calibrado.
- Dependencia de hardware específico: el despliegue exige el robot SO follower y tres cámaras configuradas con los índices y resoluciones correctos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arvinesmaeilydev/xvla_PickUpTheCube_Blue_Red_Dual_2x100_Focus_epoch_1000-ema
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100_Focus
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_Blue_Red_Dual_2x100_Focus
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
