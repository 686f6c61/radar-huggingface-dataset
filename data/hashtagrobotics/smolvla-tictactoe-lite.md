# HashtagRobotics/smolvla-tictactoe-lite

## Resumen

SmolVLA Tic-Tac-Toe Lite es un modelo de visión-lenguaje-acción (VLA) de tipo policy para robótica, desarrollado por HashtagRobotics mediante fine-tuning supervisado del modelo base `lerobot/smolvla_base`. Está especializado en una única tarea de manipulación: colocar fichas de tres en raya (X rojas y O blancas) en celdas concretas de un tablero, usando un robot SO-101 (brazo tipo follower de bajo coste de LeRobot). El modelo recibe el estado articular de 6 dimensiones y hasta cuatro cámaras (tres a 256x256 y una vacía a 480x640) y emite un vector de acción de 6 dimensiones.

Técnicamente es un modelo compacto de aproximadamente 450 millones de parámetros (450.046.176 según los pesos en safetensors), lo que lo sitúa en la gama de políticas VLA ligeras que pueden ejecutarse en hardware de consumo. No es un modelo de lenguaje general: no genera texto ni razona en lenguaje natural; traduce instrucciones de tarea en forma de cadena ("put the red X in the bottom center cell") y observaciones visuales en comandos motores de bajo nivel.

Su relevancia radica en que demuestra el flujo completo de imitación robótica con LeRobot sobre un dataset pequeño y muy específico (65 episodios, 43.839 frames a 30 FPS), y sirve como referencia práctica de fine-tuning de SmolVLA para tareas de pick-and-place estructuradas. La licencia Apache 2.0 facilita su reutilización y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); policy de imitación basada en SmolVLA (transformer multimodal con codificador visual y decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; procesa una observación por paso de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un VLA compacto que combina un codificador visual (procesa las imágenes de cámara a 256x256 y 480x640), un codificador de instrucción de tarea y un decodificador que produce acciones continuas de 6 dimensiones. La entrada incluye `observation.state` de forma (6,), tres cámaras `observation.images.camera1/2/3` de (3, 256, 256) y una cámara `observation.images.empty_camera_0` de (3, 480, 640); la salida es `action` de forma (6,). El tipo de robot es `so_follower` con cámaras `wrist` y `top`.

El entrenamiento es un fine-tuning supervisado (imitation learning / behavior cloning) desde `lerobot/smolvla_base` sobre el dataset `HashtagRobotics/tic-tac-toe-so101-block-a-clean-v1`: 65 episodios, 43.839 frames a 30 FPS, con 18 instrucciones de tarea distintas correspondientes a colocar X rojas u O blancas en celdas específicas del tablero. La configuración reportada incluye 80.000 pasos de entrenamiento, batch size 16, optimizador AdamW, learning rate 1e-4, semilla 42 y LeRobot 0.6.1. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un brazo SO-101 a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones de tarea en inglés: ejecuta consignas del tipo "put the red X in the bottom center cell" o "put the white O in the top right cell".
- Percepción multimodal: integra tres vistas de cámara a 256x256 y una vista adicional a 480x640 junto con el estado articular.
- Imitación de políticas: reproduce comportamientos aprendidos por behavior cloning sobre demostraciones humanas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni agentes conversacionales.
- No es un modelo de generación de texto, código, matemáticas ni visión general.
- Capacidades multilingües: no documentadas; el entrenamiento usa instrucciones en inglés.
- No dispone de thinking mode, audio ni otras modalidades distintas de imagen y estado.

## Casos de uso

- Automatización de pick-and-place estructurado: el modelo coloca fichas en celdas concretas de un tablero de tres en raya, sirviendo de base para tareas de posicionamiento preciso con un SO-101 en entornos de laboratorio.
- Prototipado de políticas VLA con LeRobot: permite reproducir el flujo completo de entrenamiento e inferencia (`lerobot-train` y `lerobot-rollout`) sobre un dataset pequeño, útil para validar hardware y pipelines antes de escalar a tareas mayores.
- Benchmark de imitación con datos limitados: con solo 65 episodios y 43.839 frames, es un caso de referencia para medir hasta qué punto SmolVLA generaliza con pocas demostraciones en una tarea discreta.
- Educación y divulgación en robótica: la tarea de tres en raya es intuitiva y visual, lo que facilita demostraciones docentes de aprendizaje por imitación y evaluación de políticas en robot real.
- Pruebas de integración de cámaras y calibración: al definir explícitamente los keys de observación (`camera1/2/3`, `empty_camera_0`, `wrist`, `top`), sirve para verificar la configuración de sensores y la correspondencia de nombres en despliegues LeRobot.
- Base para fine-tuning en tareas de tablero o ensamblaje: al derivar de `smolvla_base` y usar Apache 2.0, puede reentrenarse con nuevos datasets de manipulación de objetos pequeños y posiciones discretas.
- Investigación en evaluación de robustez: útil para estudiar sensibilidad a cambios de iluminación, posición de cámara o variaciones del tablero en políticas de imitación de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación sin resultados numéricos reportados (el contenido disponible se interrumpe antes de aportar tasas de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros, los pesos en FP32 ocupan aproximadamente 1,8 GB y en FP16 unos 0,9 GB, a lo que hay que sumar el coste de los codificadores visuales y del estado de inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamaño, es viable en GPUs de consumo; el paper de SmolVLA indica despliegue en hardware de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path`), con soporte de CUDA mediante `--policy.device=cuda`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de policy.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere un objetivo de control en torno a ese régimen, pero no se reporta latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HashtagRobotics/smolvla-tictactoe-lite | 450.046.176 | Estado (6,) + 4 cámaras (256x256 y 480x640) | Tres en raya con SO-101 | Apache 2.0 | Hugging Face (55 descargas) |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | Multimodal VLA | Policy VLA general base | no disponible en la informacion proporcionada | Hugging Face |
| Otras políticas LeRobot para SO-101 | no disponible | no disponible | Manipulación con SO-101 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo ejecuta las 18 instrucciones de colocación de fichas del dataset de entrenamiento; fuera de ese dominio su comportamiento no está garantizado.
- Dataset muy pequeño: 65 episodios y 43.839 frames limitan la generalización ante cambios de iluminación, posición de cámara, tablero o robot.
- Dependencia de la configuración de sensores: los nombres y formas de las observaciones (`camera1/2/3`, `empty_camera_0`, `wrist`, `top`) deben coincidir exactamente con los del entrenamiento; un desajuste invalida la inferencia.
- Riesgo de fallo silencioso: como policy de imitación, puede producir acciones plausibles pero incorrectas sin señal de error explícita; requiere supervisión y evaluación en robot real.
- Sesgos conocidos: no documentados; al entrenarse con demostraciones de un operador y un montaje concretos, hereda sus sesgos de trayectoria y estilo de manipulación.
- Idiomas: las instrucciones de tarea están en inglés; no hay evidencia de soporte multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del modelo base y del dataset asociado.
- Sin benchmarks publicados: no hay tasas de éxito reportadas, por lo que la idoneidad para producción debe validarse empíricamente.
- Fecha de creación futura en los metadatos (2026-10-26): conviene confirmar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HashtagRobotics/smolvla-tictactoe-lite
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HashtagRobotics/tic-tac-toe-so101-block-a-clean-v1
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HashtagRobotics/tic-tac-toe-so101-block-a-clean-v1
