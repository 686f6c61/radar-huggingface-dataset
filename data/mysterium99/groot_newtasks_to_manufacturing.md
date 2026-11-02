# mysterium99/groot_newtasks_to_manufacturing

## Resumen

GR00T N1.7 es un modelo fundacional de robótica de tipo vision-language-action (VLA) desarrollado por NVIDIA, orientado a razonamiento y ejecución de habilidades en robots humanoides y brazos manipuladores. Este repositorio concreto, `mysterium99/groot_newtasks_to_manufacturing`, es un fine-tuning del modelo base GR00T N1.7 empaquetado con la librería LeRobot de Hugging Face, entrenado sobre un conjunto de datos propio de tareas de manufactura con 150 episodios y 218.964 fotogramas a 30 FPS.

El modelo combina un backbone Cosmos-Reason2/Qwen3-VL para la comprensión multimodal de visión y lenguaje con un transformer de acciones basado en flow matching que predice secuencias de acción condicionadas por visión, instrucción en lenguaje natural y propriocepción. Con 3.144.016.000 parámetros y un tamaño de repositorio de 12,6 GB, está pensado para ejecutarse sobre un robot físico tipo `follow` con tres cámaras (gripper, top y side) y un estado de 6 dimensiones.

Es relevante ahora porque ejemplifica el flujo de trabajo completo de LeRobot para adaptar un modelo fundacional de robótica a una tarea industrial concreta mediante imitation learning, publicando tanto los pesos como la configuración de entrenamiento y el dataset asociado, lo que permite reproducir y extender el pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (0.6.1) |
| Tipo de robot | `follow` |
| Camaras | `gripper`, `newtop`, `newside` (3x 480x640) |
| Estado de observacion | `(6,)` |
| Dimension de accion | `(6,)` |
| Tamano del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de razonamiento vision-language (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las tres cámaras junto con la instrucción de tarea, y un transformer de acciones entrenado con flow matching que genera las acciones de 6 dimensiones condicionadas por la representación multimodal y el estado de propriocepción. Este esquema permite transferencia entre morfologías (cross-embodiment), aunque este checkpoint está especializado en un robot `follow` concreto.

El fine-tuning se realizó sobre el dataset `manufacturing_finetune` con 150 episodios y 218.964 fotogramas a 30 FPS, cubriendo tres tareas: "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket" y "Put all hardware in bucket". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW con learning rate 0,0001 y semilla 42, usando LeRobot 0.6.1. No se especifica en la información disponible el número de tokens de entrenamiento del modelo base ni si hubo etapas de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas de 6 dimensiones a partir de observaciones multimodales (tres cámaras RGB más estado de propriocepción).
- Comprensión de instrucciones en lenguaje natural para condicionar la política (por ejemplo, "Put all hardware in bucket").
- Manipulación de objetos en escenarios de manufactura: recogida de hardware de una persona, clasificación de tuercas y tornillos en recipientes distintos, y agrupación de piezas en un cubo.
- Control de un robot tipo `follow` con cámaras montadas en gripper, vista superior y vista lateral.
- Ejecución de políticas de imitation learning entrenadas con LeRobot, desplegables mediante `lerobot-rollout`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de audio en la información disponible.
- Capacidades multilingües: no disponible (la instrucción de tarea se proporciona en inglés en los ejemplos).

## Casos de uso

- Clasificación de piezas en línea de montaje: la política puede distinguir tuercas y tornillos y depositarlos en recipientes codificados por color (rojo/azul), usando las tres vistas para desambiguar objetos pequeños y evitar oclusiones.
- Recepción de componentes de un operario: el modelo está entrenado para "Take hardware from human and put in taped area", lo que permite integrarlo en una estación colaborativa donde un humano entrega piezas y el robot las coloca en una zona delimitada.
- Agrupación de hardware en contenedores: la tarea "Put all hardware in bucket" es directamente aplicable a operaciones de kitting y consolidación de piezas antes de un ensamblaje posterior.
- Base para fine-tuning en nuevas tareas de manufactura: al estar publicado con LeRobot, sirve como punto de partida para reentrenar con `lerobot-train --policy.type=groot` sobre datasets propios con pocos cientos de episodios.
- Investigación en imitation learning: el repositorio incluye configuración de entrenamiento completa (pasos, batch, LR, semilla), lo que facilita estudios de reproducibilidad y ablaciones sobre el modelo base GR00T N1.7.
- Prototipado de estaciones robotizadas con robot `follow`: el comando `lerobot-rollout` permite validar la política en hardware real durante 60 segundos sin grabar episodios, útil para pruebas rápidas de integración.
- Benchmark interno de políticas VLA: al disponer de tres tareas discretas y un dataset etiquetado, se puede usar como referencia para comparar variantes de fine-tuning o estrategias de aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3.144 millones de parámetros en safetensors (aproximadamente 12,6 GB en precisión de entrenamiento), la inferencia en FP16 requeriría del orden de 6-7 GB solo para pesos, más el coste del backbone vision-language y del transformer de acciones; en FP32 se superarían los 12 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A5000, L4) sería el mínimo razonable para FP16; A100 o H100 para entrenamiento o lotes mayores.
- Cabe en GPU consumer: probablemente sí en RTX 4090 (24 GB) en FP16, aunque no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para reentrenamiento) con `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de política robótica.
- Latencia y throughput: no disponible. El control se ejecuta a 30 FPS según el dataset, pero no se publican métricas de latencia por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/groot_newtasks_to_manufacturing` (este) | 3.144 M | no disponible | VLA para robot `follow` en manufactura | apache-2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (modelo base NVIDIA) | no disponible | no disponible | VLA fundacional cross-embodiment | no disponible en la informacion | Referenciado en github.com/NVIDIA/Isaac-GR00T |
| Políticas LeRobot tipo ACT / Diffusion | no disponible | no disponible | Imitation learning sobre robots concretos | no disponible | Hugging Face vía LeRobot |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito ni comparaciones directas con otras políticas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política en las tres tareas entrenadas.
- El modelo está especializado en un robot `follow` concreto con tres cámaras específicas (`gripper`, `newtop`, `newside`); no es directamente portable a otras morfologías sin reentrenamiento.
- El dataset de fine-tuning es pequeño (150 episodios, 218.964 fotogramas), lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y objetos concretos del entorno de captura.
- La instrucción de tarea debe coincidir con las frases de entrenamiento; el modelo no se ha evaluado con paráfrasis ni con instrucciones en otros idiomas.
- Riesgo de alucinación de acciones: como política de flow matching, puede generar trayectorias plausibles pero incorrectas ante distribuciones fuera del dataset (objetos nuevos, oclusiones, distracciones).
- Sesgos conocidos: no documentados por el autor; al depender de datos de captura propios, puede heredar sesgos de posición, color y tipo de pieza del entorno de grabación.
- Licencia apache-2.0 permite uso comercial, pero el autor no proporciona garantías ni evaluación de seguridad para despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No se documentan requisitos de seguridad física ni paradas de emergencia para la operación con robots reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/groot_newtasks_to_manufacturing
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
