# rob089/smolvla_v02

## Resumen

rob089/smolvla_v02 es una política de robótica basada en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) del ecosistema LeRobot de Hugging Face. Se trata de un ajuste fino del checkpoint base lerobot/smolvla_base, publicado por el usuario rob089 bajo licencia Apache 2.0.

El modelo tiene 450.046.176 parámetros (unos 450 M) y está concebido para ejecutarse en hardware de consumo, en línea con el objetivo de SmolVLA de ofrecer un VLA competitivo con un coste computacional reducido. Convierte observaciones multimodales —estado del robot e imágenes de varias cámaras— en comandos de acción para un brazo robótico tipo SO-101 (so_follower).

Su interés práctico es doble: sirve como ejemplo completo del flujo de LeRobot (grabar datos, entrenar y desplegar una política) y como punto de partida para fine-tunes en tareas de manipulación concretas; en este caso, colocar bolas amarillas y rojas en vasos blancos y azules.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA); transformador compacto que combina percepción visual, condicionamiento por lenguaje y generación de acciones |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no documentados; pesos publicados en safetensors (repositorio de 0,9 GB, coherente con precisión de 16 bits) |
| Idiomas soportados | no disponible (los textos de tarea del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto: parte de un modelo de visión-lenguaje preentrenado y añade un experto de acción que genera las secuencias de control (en el artículo SmolVLA, arXiv:2506.01844, se describe un esquema de flow matching y un diseño orientado a la inferencia en tiempo real). El objetivo del diseño es reproducir el comportamiento de VLAs de mayor tamaño con un coste computacional mucho menor y poder desplegarse en hardware de consumo. Los detalles internos concretos de la arquitectura deben consultarse en el artículo referenciado.

El modelo publicado aquí es un fine-tune del checkpoint base lerobot/smolvla_base, entrenado con LeRobot 0.6.1 (versión del 0.6.1 indicada en la model card) sobre el dataset rob089/lerobot_SO101_smolVLA_balls_merged: 129 episodios, 79.848 fotogramas a 30 FPS. La configuración de entrenamiento fue de 30.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Las tareas entrenadas consisten en coger una bola (roja o amarilla) o colocarla en el vaso correspondiente. No se documentan fases de RLHF/DPO, composición detallada del dataset ni aumentos de datos.

## Capacidades

- Generación de acciones de control de un brazo robótico: produce una salida `action` de forma `(6,)` a partir de las observaciones.
- Percepción visual multimodal: consume `observation.images.camera1`, `camera2` y `camera3` (3×256×256) y `observation.images.empty_camera_0` (3×480×640).
- Entrada de estado propioceptivo: consume `observation.state` con forma `(6,)`.
- Condicionamiento por instrucción en lenguaje natural: la política se invoca con una cadena de tarea (`--task="..."`), de modo que la misma red puede ejecutar distintas subtareas entrenadas.
- Ejecución orientada a control en tiempo real: el dataset se capturó a 30 FPS, y SmolVLA está diseñado para despliegue en hardware de consumo.
- Tool calling / function calling: no aplica ni se documenta (no es un modelo de lenguaje de propósito general).
- Agentes y razonamiento multi-paso: no aplica ni se documenta.
- Capacidades multilingües: no disponibles; el condicionamiento de tarea se ha entrenado con instrucciones en inglés.
- Modos especiales (thinking, visión general, audio): no documentados.

## Casos de uso

- Manipulación pick-and-place en laboratorio o aula: el modelo ejecuta la secuencia de coger una bola y depositarla en el vaso correcto, una tarea ideal para prácticas de robótica con un SO-101 de bajo coste.
- Docencia de aprendizaje por imitación: sirve como ejemplo cerrado del ciclo completo de LeRobot (grabar con `lerobot-record`, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`).
- Punto de partida para transfer learning: se puede fine-tunear desde este checkpoint para nuevas tareas que compartan el mismo montaje de robot y cámaras, aprovechando el ajuste previo.
- Reproducción de experimentos de VLA compactos: permite medir en un montaje real el comportamiento de un VLA de ~450 M en hardware de consumo frente a VLAs de miles de millones de parámetros.
- Clasificación y ordenación por color: la política ya distingue bola roja y bola amarilla y los vasos blanco y azul, lo que sirve de base para tareas de segregación por atributos visuales.
- Automatización de demostraciones y vídeos: con `--duration` se pueden generar ejecuciones reproducibles para documentación, validación de hardware o comparativas entre checkpoints.
- Banco de pruebas de robustez: repitiendo tiradas sobre el mismo montaje se puede estudiar la sensibilidad a la posición inicial, la iluminación y los distractores, aunque no haya tasas de éxito publicadas.
- Integración en pipelines de control robótico: la salida `action` de forma `(6,)` se puede conectar directamente a un bucle de control del robot `so_follower`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación para esta política, y no incluye tabla de tareas, ensayos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~450 M de parámetros en precisión de 16 bits los pesos ocupan alrededor de 0,9 GB, por lo que la inferencia completa (codificadores visuales, estado y activaciones) debería situarse en el rango aproximado de 2 a 4 GB, aunque no hay cifras oficiales.
- GPU recomendadas: no documentadas. Por tamaño, cabría esperar funcionamiento cómodo en GPUs de consumo como RTX 3060 (12 GB), RTX 4060/4070, RTX 4090 o superiores; el artículo general de SmolVLA apunta al despliegue en hardware de consumo.
- Compatibilidad con GPU de consumo: sí, por el tamaño del modelo; se recomienda al menos una GPU con 4-8 GB de VRAM.
- Opciones de despliegue: LeRobot mediante la CLI `lerobot-rollout --policy.path=rob089/smolvla_v02`; ejecución en CUDA (por ejemplo `--policy.device=cuda`). No aplican servidores de inferencia para LLM (vLLM, TGI) porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset se capturó a 30 FPS y el diseño de SmolVLA apunta a control en tiempo real, pero no se facilitan medidas de latencia ni de rendimiento para esta política.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| rob089/smolvla_v02 | ~450 M | VLA (fine-tune de manipulación) | Apache 2.0 | Hugging Face (LeRobot) | no disponible |
| lerobot/smolvla_base | ~450 M | VLA (checkpoint base preentrenado) | Apache 2.0 | Hugging Face | no disponible |
| OpenVLA-7B | 7 B | VLA (imagen + instrucción) | no disponible (condicionada por sus componentes) | Hugging Face | no disponible |
| pi0 | no disponible | VLA | no disponible | no disponible | no disponible |

La comparación cuantitativa no puede completarse porque no hay resultados de benchmarks publicados para esta política ni cifras homogéneas de latencia o tasa de éxito en la información disponible. La diferencia principal frente a OpenVLA y otros VLAs de mayor tamaño es el orden de magnitud en parámetros (~450 M frente a 7 B) y el hecho de estar especializado en un montaje concreto.

## Limitaciones y advertencias

- Especialización muy estrecha: la política solo se ha entrenado para coger bolas y colocarlas en vasos; fuera de esas tareas no hay garantía de comportamiento útil.
- Sin evaluación publicada: la model card no incluye tasa de éxito ni número de ensayos, por lo que el rendimiento real en el robot no está verificado de forma documentada.
- Dataset pequeño: 129 episodios y 79.848 fotogramas, lo que limita la generalización a posiciones, iluminación o distractores no vistos.
- Dependencia estricta del montaje: requiere el robot `so_follower` y los nombres exactos de las cámaras de entrenamiento (`camera1`, `camera2`, `camera3`, `empty_camera_0`) con los índices y resoluciones esperados; cualquier cambio en la configuración rompe la inferencia.
- Riesgo de fallo fuera de distribución: cambios en la posición inicial de las bolas, la iluminación o la presencia de objetos nuevos pueden degradar el comportamiento.
- Idioma: no se documentan idiomas soportados; las instrucciones de tarea del dataset están en inglés.
- Sesgos: no se documentan análisis de sesgo; en robótica el principal riesgo es el sesgo de distribución del dataset de demostración.
- Licencia: Apache 2.0 permite uso comercial, pero la seguridad física de la operación en hardware real es responsabilidad del usuario.
- Contexto: no se especifica longitud de contexto ni ventana de memoria; no conviene asumir planificación de largo horizonte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rob089/smolvla_v02
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rob089/lerobot_SO101_smolVLA_balls_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rob089/lerobot_SO101_smolVLA_balls_merged
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
