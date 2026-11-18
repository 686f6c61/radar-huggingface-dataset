# Diking2000/genkiarm-smolvla-chinese-chess-e3e4

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por el equipo de Hugging Face dentro del ecosistema LeRobot, presentado en el artículo arXiv 2506.01844. Este repositorio concreto, `Diking2000/genkiarm-smolvla-chinese-chess-e3e4`, es un ajuste fino de dicha arquitectura entrenado por el usuario Diking2000 para una tarea robótica muy específica: mover una pieza de ajedrez chino siguiendo la notación ICCS (en este caso, el movimiento e3e4). No se trata, por tanto, de un modelo de propósito general, sino de una política de imitación (imitation learning) orientada a un robot concreto y a una única tarea.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB. La arquitectura subyacente es SmolVLA, un VLA compacto diseñado para ejecutarse en hardware de consumo, que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La política consume observaciones de estado (6 dimensiones) y varias cámaras (tres cámaras de 256x256 y una de 480x640) y produce un vector de acción de 6 dimensiones.

Su relevancia es doble: por un lado, ilustra el flujo de trabajo completo de LeRobot para entrenar políticas VLA sobre robots reales; por otro, demuestra cómo un modelo de 450 millones de parámetros puede adaptarse a tareas de manipulación fina (como mover una pieza de ajedrez) con un dataset relativamente pequeño de 100 episodios. Es un ejemplo práctico de ajuste fino de SmolVLA, no un modelo base listo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal con decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Camaras | wrist, global (mas camaras adicionales segun la model card) |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3, 256, 256), observation.images.empty_camera_0 (3, 480, 640) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,9 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina percepción visual, comprensión del lenguaje y generación de acciones motoras en una sola red. La arquitectura sigue el paradigma VLA: un codificador visual procesa las imágenes de las cámaras, un componente de lenguaje interpreta la instrucción de tarea (en este caso, "Move the Chinese chess piece according to ICCS notation: e3e4.") y un decodificador produce el vector de acción de 6 dimensiones que controla el robot. El artículo original (arXiv 2506.01844) describe SmolVLA como un modelo eficiente que logra rendimiento competitivo con costes computacionales reducidos y desplegable en hardware de consumo.

El ajuste fino de este repositorio se realizó con LeRobot 0.7.0 sobre el dataset `Diking2000/genkiarm-chinese-chess-e3e4`, compuesto por 100 episodios, 37.345 fotogramas a 30 FPS, con una única tarea de manipulación de ajedrez chino. La configuración de entrenamiento fue de 40.000 pasos, batch size 4, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se especifica en la model card si hubo RLHF, DPO ni ninguna innovación técnica adicional más allá de la propia arquitectura SmolVLA. Tampoco se detalla la composición exacta del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Generación de acciones motoras de 6 dimensiones para un robot tipo `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres cámaras de 256x256 y una cámara de 480x640.
- Interpretación de instrucciones de tarea en lenguaje natural (en inglés) para condicionar la política.
- Ejecución de una tarea de manipulación fina: mover una pieza de ajedrez chino según la notación ICCS (e3e4).
- Política de imitación entrenada de extremo a extremo con LeRobot.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento general, código, matemáticas ni otras capacidades de propósito general; es una política robótica especializada, no un LLM conversacional.

## Casos de uso

- Manipulación de piezas de ajedrez chino en un robot de sobremesa: la política ejecuta el movimiento e3e4 sobre un tablero real, usando las cámaras para localizar la pieza y el estado del robot para controlar la trayectoria. Es adecuada porque fue entrenada específicamente para esa tarea con 100 episodios reales.
- Investigación en imitation learning: sirve como ejemplo reproducible de ajuste fino de SmolVLA con LeRobot, permitiendo estudiar el efecto del número de episodios, la configuración de cámaras y los hiperparámetros en el éxito de la tarea.
- Prototipado de pipelines VLA en robótica de bajo coste: al ser un modelo de 450 millones de parámetros y 0,9 GB, puede desplegarse en estaciones de trabajo con GPU de consumo para validar el flujo `lerobot-rollout` antes de escalar a tareas más complejas.
- Docencia y formación en robótica: el repositorio incluye comandos de ejecución y entrenamiento que permiten a estudiantes reproducir el ciclo completo de grabación de datos, entrenamiento y despliegue en un robot `so_follower`.
- Benchmark de referencia para tareas de precisión: el movimiento de una pieza de ajedrez exige precisión milimétrica; la política puede usarse como caso de prueba para evaluar la repetibilidad de un robot y de un pipeline de control.
- Base para transferencia a otras tareas de manipulación: aunque entrenada para e3e4, la arquitectura y el flujo de LeRobot permiten reutilizar el mismo esquema para entrenar políticas en otras tareas de pick-and-place con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, ni comparaciones con otros modelos, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 450 millones de parámetros en precisión completa (fp32) ocuparía aproximadamente 1,8 GB solo en pesos, y en fp16 alrededor de 0,9 GB, pero no se confirma el formato de despliegue ni la cuantización soportada.
- GPU recomendadas: no disponible. La model card menciona que SmolVLA está diseñado para hardware de consumo, pero no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No confirmado explícitamente para este repositorio; el artículo original describe SmolVLA como desplegable en hardware de consumo, pero no se detalla qué GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput estimados: no disponible. El dataset se grabó a 30 FPS, pero no se indica la frecuencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diking2000/genkiarm-smolvla-chinese-chess-e3e4 | 450 M | no disponible | Mover pieza de ajedrez chino (e3e4) | no disponible | Hugging Face (0 descargas) |
| SmolVLA base (Hugging Face) | no disponible en la informacion | no disponible | VLA generalista para robótica | no disponible en la informacion | Hugging Face / LeRobot |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la informacion | no disponible | Imitation learning en robots | no disponible en la informacion | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a la categoría (políticas VLA/imitation learning en LeRobot) y no a métricas de éxito, ya que no se han publicado.

## Limitaciones y advertencias

- Es una política especializada en una única tarea (mover una pieza de ajedrez chino según e3e4); no generaliza a otras tareas ni a otros movimientos sin reentrenamiento.
- Entrenada para un robot concreto (`so_follower`) y una configuración de cámaras específica; cambios en el robot, la iluminación, la posición de las cámaras o el tablero pueden degradar el rendimiento.
- No hay resultados de evaluación publicados, por lo que se desconoce la tasa de éxito real de la política.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo importante para producción.
- Idiomas no disponibles: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Riesgo de sobreajuste al dataset de 100 episodios y a la posición inicial de las piezas; la variabilidad del entorno real puede provocar fallos.
- Sin datos de cuantización ni de latencia, no se puede garantizar el rendimiento en tiempo real en hardware de consumo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No es un modelo de lenguaje general: no debe usarse para generación de texto, código, razonamiento ni tareas conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diking2000/genkiarm-smolvla-chinese-chess-e3e4
- Dataset de entrenamiento: https://huggingface.co/datasets/Diking2000/genkiarm-chinese-chess-e3e4
- Artículo SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Diking2000/genkiarm-chinese-chess-e3e4
