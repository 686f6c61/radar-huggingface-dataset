# ntheunissen03/act_towel_v1

## Resumen

`act_towel_v1` es una política de imitación entrenada con LeRobot por el usuario `ntheunissen03` para un brazo robótico de bajo coste de tipo `so_follower` (familia SO-100/SO-101). No es un modelo de lenguaje: implementa el método ACT (Action Chunking with Transformers, paper arXiv 2304.13705), que aprende de demostraciones teleoperadas y predice trozos de acciones futuras en lugar de un único paso de control. El checkpoint tiene 51.668.614 parámetros (51,7 M) y un repositorio de 0,2 GB en safetensors.

La política resuelve una tarea única y concreta: "Pick up the towel and put it in the bin". Consume como entrada el estado articular de 6 dimensiones y dos cámaras (`front` y `side`, 3x480x640 a 30 fps), y produce una acción de 6 dimensiones. Se entrenó con el dataset `ntheunissen03/towel_v1`, compuesto por 50 episodios y 22.324 frames grabados a 30 FPS, durante 80.000 pasos con batch de 8, optimizador AdamW y tasa de aprendizaje 1e-5.

Su relevancia es la de un artefacto reproducible de investigación: ejemplifica el flujo completo de LeRobot (grabación, entrenamiento, despliegue con `lerobot-rollout`) sobre hardware asequible. Conviene tener expectativas ajustadas: el autor no ha publicado resultados de evaluación, el repositorio no tiene descargas ni likes, y el volumen de datos de entrenamiento es reducido, por lo que la generalización fuera de las condiciones de grabación es una incógnita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según el paper arXiv 2304.13705: transformer encoder-decoder con condicionamiento latente tipo CVAE y extractor visual convolucional. La variante exacta de este checkpoint (tamaño de chunk, backbone, uso de VAE) no está disponible |
| Parámetros totales | 51.668.614 (51,7 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: política de control que consume una observación por inferencia (estado de 6 dimensiones + dos imágenes de 3x480x640). No existe ventana de contexto textual |
| Tipos de cuantización | No disponible: el repositorio solo publica safetensors y no documenta variantes fp16, int8 ni GGUF |
| Idiomas soportados | No disponible: no es un modelo de lenguaje ni procesa texto como entrada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB, librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `front` y `side`, 3x480x640, 30 fps |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida de acción | `action`, shape (6,) |
| Versión de LeRobot | 0.6.1 (según configuración de entrenamiento) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de un único paso, lo que reduce el error acumulado típico del behavioral cloning paso a paso. La formulación del paper combina un encoder-decoder transformer con un componente latente tipo CVAE que modela la variabilidad de las demostraciones humanas, un extractor visual convolucional para las imágenes y, en inferencia, un mecanismo de ensamblado temporal que promedia predicciones solapadas entre chunks. Esta ficha describe el método; los hiperparámetros concretos del checkpoint (tamaño de chunk, dimensión del latente, backbone visual exacto) no están documentados en la model card.

Los datos de entrenamiento son el dataset `ntheunissen03/towel_v1`: 50 episodios teleoperados, 22.324 frames a 30 FPS (aproximadamente 12,4 minutos de interacción efectiva), una única instrucción de tarea y dos vistas de cámara. La configuración reportada es de 80.000 pasos de optimización con batch de 8 (640.000 muestras procesadas, es decir, unas 28,7 pasadas sobre el conjunto de frames), AdamW con learning rate 1e-5 y semilla 1000. No se documenta aumento de datos, mezcla de datasets, RLHF ni DPO (no aplicables a este tipo de política), ni tampoco el tamaño de validación o criterios de selección del checkpoint final.

## Capacidades

- Control robótico end-to-end de 6 grados de libertad a partir de dos cámaras RGB y del estado articular, sin percepción intermedia explícita.
- Ejecución de una única tarea aprendida: recoger una toalla y depositarla en un contenedor.
- Predicción de chunks de acción, lo que suaviza la trayectoria y reduce el compounding error frente a políticas paso a paso.
- Funcionamiento a la frecuencia de las demostraciones (30 fps), adecuado para el bucle de control de un brazo de bajo coste.
- Reutilización como base para fine-tuning con `lerobot-train` sobre nuevos datasets de imitación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, planificación ni uso de agentes.
- No tiene capacidades multilingües ni comprensión de instrucciones en lenguaje natural: ACT no incorpora condicionamiento por texto en su formulación original.
- No dispone de modo thinking, visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea en laboratorio: despliegue con `lerobot-rollout` sobre un `so_follower` con dos cámaras configuradas como `front` y `side` a 640x480 y 30 fps, usando la instrucción exacta de entrenamiento para replicar el experimento del autor.
- Baseline de comparación de métodos de imitación: al estar entrenada sobre un dataset público y con configuración documentada, sirve como referencia para contrastar ACT frente a otras políticas de LeRobot sobre el mismo conjunto `towel_v1`.
- Punto de partida para fine-tuning: reentrenamiento con `lerobot-train` añadiendo episodios propios (nuevas posiciones, objetos o iluminación) para medir cuántos datos adicionales hacen falta antes de que la tasa de éxito se estabilice.
- Docencia y formación en imitation learning: pipeline completo y reproducible (50 episodios, 22.324 frames, 80.000 pasos) que cabe en una práctica de laboratorio con hardware de bajo coste y GPU consumer.
- Validación de infraestructura hardware-software: comprobación de calibración del brazo, sincronización de las dos cámaras, latencia del bucle de control y estabilidad del despliegue antes de invertir en políticas más costosas.
- Prototipo de automatización textil en entorno controlado (lavandería industrial, laboratorio de manipulación): recogida de toallas con supervisión humana y parada de emergencia, asumiendo que el modelo no ha sido evaluado formalmente.
- Protocolo de estrés de robustez: ejecuciones repetidas variando posición inicial del objeto, iluminación y presencia de distractores para caracterizar la degradación de la política, dado que el autor no publicó estas métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente que no se han proporcionado resultados para esta política:

| Tarea | Ensayos | Éxitos | Tasa de éxito |
|---|---|---|---|
| Pick up the towel and put it in the bin | no disponible | no disponible | no disponible |

Los resultados reportados en el paper de ACT (arXiv 2304.13705) corresponden a los experimentos de sus autores y no son trasladables a este checkpoint, que se ha entrenado con un dataset, un robot y una tarea distintos.

## Requisitos de hardware

- Pesos: 51.668.614 parámetros equivalen a aproximadamente 207 MB en fp32 y 103 MB en fp16, consistente con el tamaño de repositorio de 0,2 GB.
- VRAM estimada para inferencia: los pesos ocupan menos de 0,25 GB; el consumo real lo determinan las activaciones del extractor visual sobre dos imágenes de 480x640 y el tamaño de lote. Estimación razonable: entre 2 y 6 GB según precisión y lote (cifra estimada, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 3060, RTX 4060, GTX 1650 en adelante) debería bastar para la inferencia. Para reentrenamiento con 80.000 pasos y batch 8, se recomienda una GPU con 8-16 GB (RTX 4070, RTX 4090, A10, L4) para acortar el ciclo de iteración.
- Ejecución en CPU: técnicamente posible por el tamaño del modelo, pero probablemente incapaz de sostener los 30 fps del bucle de control. La latencia real no está disponible.
- Latencia y throughput: no disponibles. Como referencia de diseño, el dataset se grabó a 30 FPS, por lo que la política debería ejecutarse a esa frecuencia para reproducir la dinámica de las demostraciones.
- Opciones de despliegue: `lerobot-rollout` de LeRobot (estrategia `base` para ejecución sin grabación, con `--duration` para limitar la ejecución) y PyTorch. No aplican servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama.
- Hardware físico necesario: brazo `so_follower` calibrado, puerto serie accesible y dos cámaras OpenCV a 640x480 y 30 fps, con nombres que coincidan con las claves de observación (`front`, `side`).

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ntheunissen03/act_towel_v1` | ACT (action chunking) | 51,7 M | Estado 6 dims + 2 imágenes 480x640 | Apache 2.0 | HuggingFace Hub, librería lerobot |
| ACT de referencia (implementación del paper) | ACT (action chunking) | no disponible | Estado + imágenes | no disponible | Repositorio de los autores del paper |
| Diffusion Policy (implementación en LeRobot) | Difusión sobre acciones | no disponible | Estado + imágenes | no disponible | Disponible como política de LeRobot |
| Políticas VLA con condicionamiento por lenguaje (familia SmolVLA y similares) | Visión-lenguaje-acción | no disponible | Imágenes + instrucción textual | no disponible | Ecosistema LeRobot |

La comparación relevante es metodológica: ACT destaca por su simplicidad y por el bajo coste de entrenamiento e inferencia, mientras que las políticas de difusión suelen requerir más pasos de inferencia y los modelos VLA añaden condicionamiento por lenguaje a cambio de un orden de magnitud más de parámetros. No se dispone de datos numéricos comparativos para este checkpoint concreto.

## Limitaciones y advertencias

- Tarea única: la política solo ha visto la instrucción "Pick up the towel and put it in the bin"; no generaliza a otras tareas ni a otras instrucciones.
- Volumen de datos reducido: 50 episodios y 22.324 frames, con 80.000 pasos de entrenamiento, configuran un escenario de alto riesgo de sobreajuste a las posiciones, texturas e iluminación de la grabación.
- Ausencia total de evaluación publicada: se desconoce la tasa de éxito real, incluso en las condiciones de entrenamiento.
- Dependencia del montaje: las cámaras deben llamarse `front` y `side`, estar a 640x480 y 30 fps, y mantener una colocación similar a la del dataset; cambios de encuadre o de calibración degradan la política.
- Especificidad morfológica: la salida de 6 dimensiones está ligada a la cinemática del `so_follower` empleado; no es transferible directamente a otro robot.
- Sin comprensión de lenguaje: el texto de la tarea en `lerobot-rollout` es metainformación del episodio, no una condición que dirija el comportamiento.
- Sesgos conocidos: no documentados por el autor. En la práctica, una política de imitación replica los sesgos de las demostraciones (trayectorias, velocidades y posiciones del operador).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el análogo de acciones plausibles pero incorrectas cuando la observación cae fuera de la distribución de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no se especifica la licencia del dataset `ntheunissen03/towel_v1`, lo que conviene verificar antes de un uso productivo. El modelo se distribuye sin garantías.
- Seguridad física: cualquier despliegue sobre un brazo real requiere límites de par, parada de emergencia y supervisión, dado que no hay evaluación de fallos ni análisis de modos de error.
- Metadatos: el repositorio no registra descargas ni likes y la fecha de creación indicada en el Hub es posterior a la de la mayoría de referencias del ecosistema; conviene tratarlo como un artefacto de investigación sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ntheunissen03/act_towel_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ntheunissen03/towel_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ntheunissen03/towel_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv: https://arxiv.org/abs/2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
