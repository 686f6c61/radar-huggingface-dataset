# mrpero23/pi05_test1

## Resumen

`mrpero23/pi05_test1` es un ajuste fino (fine-tune) de π₀.₅ (Pi05), el modelo Vision-Language-Action (VLA) de Physical Intelligence, publicado por el usuario mrpero23 a través de LeRobot. No es un modelo de lenguaje general: es una política de robot entrenada para ejecutar una única tarea de manipulación, «place the yellow cube in the bowl», sobre un robot tipo `so_follower` (SO-101) con tres cámaras (una fija, una en la pinza y una segunda fija). El modelo base, `lerobot/pi05_base`, procede de la implementación de LeRobot del repositorio OpenPI de Physical Intelligence.

El checkpoint es relevante como ejemplo práctico de flujo de trabajo de imitación extremo a extremo: 55 episodios y 41.738 fotogramas a 30 FPS (unos 23 minutos de demostraciones) bastan para especializar un VLA de 4.143.404.816 parámetros (~4,14 mil millones) en una tarea concreta. La entrada combina un vector de estado de 6 dimensiones con tres imágenes RGB de 480x640, y la salida es un vector de acción de 6 dimensiones, es decir, el modelo mapea percepción y estado articular directamente a comandos motores.

Se publica bajo licencia Apache-2.0, con pesos en safetensors compatibles con la librería `lerobot` (versión 0.6.1 en el entrenamiento). No incluye resultados de evaluación en robot real ni datos de benchmarks, y en el momento de la consulta acumula 0 descargas y 0 «likes», por lo que debe tratarse como un experimento reproducible más que como una política lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, con cabeza de acciones *flow-matching* |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE; no disponible dato de sparsity) |
| Longitud de contexto | No disponible (no es contexto textual: ventana de observación de 3 imágenes 3x480x640 + estado de 6 dimensiones) |
| Tipos de cuantización | No disponible (solo se distribuyen pesos safetensors; no se documentan GGUF, INT8 ni FP8) |
| Idiomas soportados | No disponible (la instrucción de tarea del ejemplo está en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 34,6 GB, con checkpoints y estados de entrenamiento) |

Especificaciones de entrada/salida declaradas por el autor:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.fix` | VISUAL | `(3, 480, 640)` |
| `observation.images.grip` | VISUAL | `(3, 480, 640)` |
| `observation.images.fix1` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

El modelo es una política VLA de la familia π₀.₅: un backbone visión-lenguaje que consume imágenes y una instrucción en lenguaje natural, junto con el estado propioceptivo del robot, y una cabeza de acciones basada en *flow matching* que genera las acciones de control (en este caso, un vector de 6 dimensiones por paso). La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence; el detalle del backbone (encoder visual, modelo de lenguaje subyacente, número de capas) no se especifica en la información disponible. La model card de la variante LIBERO de LeRobot indica que este tipo de checkpoint funciona únicamente con la cabeza de acciones de flow matching.

El ajuste fino se realizó sobre `lerobot/pi05_base` con 15.000 pasos, tamaño de lote 24, optimizador AdamW, tasa de aprendizaje 2,5e-5 y semilla 1000, usando LeRobot 0.6.1. El conjunto de datos es `mrpero23/test1_20261017_133008`: 55 episodios, 41.738 fotogramas a 30 FPS (aproximadamente 23 minutos de demostraciones, unas 759 imágenes por episodio), con una única instrucción de tarea. No se documenta composición del dataset más allá de la tarea, ni el uso de RLHF, DPO o refuerzo; se trata de aprendizaje por imitación supervisado sobre demostraciones de teleoperación.

## Capacidades

- Control robótico de manipulación extremo a extremo: genera acciones de 6 dimensiones a partir de estado y visión, sin planificación explícita.
- Ejecución de una tarea específica de pick-and-place: «place the yellow cube in the bowl», condicionada por la instrucción de texto.
- Fusión de tres vistas de cámara (fija, pinza y segunda fija), lo que permite cierta robustez ante oclusiones parciales en la pinza.
- Política condicionada por lenguaje: acepta la instrucción como cadena de texto, aunque el entrenamiento solo cubre una tarea.
- Despliegue mediante `lerobot-rollout` con robots de tipo `so_follower`, con ejecución continua o limitada por duración.
- Reentrenamiento y ajuste fino adicionales disponibles mediante `lerobot-train` partiendo de `lerobot/pi05_base`.
- No dispone de *tool calling*, razonamiento multi-paso explícito, capacidades de audio ni generación de texto libre; no se han documentado dichas capacidades para este checkpoint.

## Casos de uso

- Automatización de pick-and-place en laboratorio: recoger un cubo amarillo y depositarlo en un bol con un SO-101, usando las tres cámaras como entrada y la instrucción de tarea como condicionamiento. Es el escenario exacto para el que fue entrenado.
- Reproducción de experimentos de imitación: servir como referencia de que 55 episodios y 15.000 pasos de ajuste fino sobre π₀.₅ producen una política ejecutable, útil para comparar hiperparámetros o estrategias de recogida de datos.
- Base para *data engineering* de robótica: emplear el par modelo/dataset (`mrpero23/test1_20261017_133008`) como plantilla para validar el formato LeRobot, la tasa de 30 FPS y la nomenclatura de claves de observación antes de escalar a nuevos datasets.
- Pruebas de integración en pipelines de investigación: conectar `lerobot-rollout` a un banco de pruebas con robot real para medir latencia de inferencia y estabilidad de la política antes de invertir en más datos.
- Punto de partida para ajuste fino en una tarea nueva: al estar publicada en Apache-2.0 y derivar de `lerobot/pi05_base`, puede reentrenarse con otro dataset manteniendo la misma configuración de cámaras y robot.
- Docencia y demostraciones: ilustrar un ciclo completo de aprendizaje por imitación (grabación, entrenamiento, despliegue) con un coste de datos bajo y hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía con la nota «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16/fp16 ocupan aproximadamente 8,3 GB (4.143.404.816 parámetros x 2 bytes); con activaciones para tres imágenes de 480x640 y el backbone visión-lenguaje, una estimación razonable se sitúa en 12-18 GB. Cálculo propio a partir del número de parámetros, no dato publicado por el autor.
- El repositorio ocupa 34,6 GB, lo que sugiere que incluye checkpoints intermedios y estados del optimizador además de los pesos finales; para inferencia solo es necesario el conjunto de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en tiempo real y ajuste fino ligero.
- Cabe en GPU de consumo de gama alta (RTX 4090, 3090, 4080 de 16 GB con margen ajustado en bf16). En GPUs de 8-12 GB no se documenta una ruta de cuantización oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento) sobre PyTorch con CUDA. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, lo cual es esperable en una política VLA con cabeza de acciones.
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS en la captura de datos, pero no se publica la frecuencia de control alcanzada ni el tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrpero23/pi05_test1` (este) | 4.143.404.816 | 3 imágenes 480x640 + estado (6,) | Pick-and-place de una tarea | Apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/pi05_base` (π₀.₅ base) | No disponible en la información | Entrada multimodal robot + lenguaje | VLA generalista, punto de partida para ajuste fino | Apache-2.0 (openpi) | Hugging Face / LeRobot |
| `lerobot/pi05_libero_finetuned_v044` | No disponible en la información | Igual que π₀.₅; solo cabeza flow-matching | Tareas LIBERO (benchmark de manipulación) | No disponible | Hugging Face / ModelScope |
| π₀ y π₀-FAST (openpi) | No disponible en la información | Multimodal robot + lenguaje | VLA generalista, predecesores de π₀.₅ | Apache-2.0 | Repositorio openpi en GitHub |

No se dispone de métricas comparativas de rendimiento entre estas variantes en la información proporcionada; la comparación se limita a parámetros publicados, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado con una sola instrucción de tarea y 55 episodios; no se espera generalización a otras tareas, objetos ni posiciones no representadas en los datos.
- Sin evaluación: no hay tasas de éxito ni número de ensayos, por lo que se desconoce la fiabilidad real de la política.
- Dependencia del montaje físico: las cámaras `fix`, `grip` y `fix1` deben coincidir en nombre, resolución (480x640) y colocación con las del entrenamiento; cualquier cambio de calibración o iluminación puede degradar el comportamiento.
- Dependencia del robot: la dimensionalidad de estado y acción es fija (6,) y el tipo de robot es `so_follower`; no es trasladable sin reentrenamiento.
- Riesgo de alucinación en sentido robótico: al ser una política de imitación, puede generar trayectorias plausibles pero incorrectas ante situaciones fuera de distribución, sin señal de incertidumbre ni mecanismo de parada.
- Idiomas: no se documenta soporte multilingüe; la única instrucción conocida está en inglés.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el ecosistema LeRobot pueden arrastrar condiciones adicionales que conviene revisar antes de un despliegue productivo.
- Reputación y madurez: publicación de un usuario individual, 0 descargas y 0 «likes»; sin mantenimiento documentado ni soporte.
- Cuantizaciones no documentadas: no hay rutas oficiales de GGUF/INT8, lo que limita el despliegue en hardware modesto.
- El repositorio de 34,6 GB incluye artefactos de entrenamiento; conviene descargar solo los ficheros necesarios para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrpero23/pi05_test1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mrpero23/test1_20261017_133008
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrpero23/test1_20261017_133008
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Variante π₀.₅ ajustada en LIBERO: https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned_v044
- Perfil del autor: https://huggingface.co/mrpero23
- Resumen de modelos de Physical Intelligence (octubre de 2026): https://physicalailab.io/en/physical-intelligence-pi-models-openpi-api/
- Pruebas del procesador π₀.₅ en LeRobot (referencia de código): https://github.com/box2ai-robotics/rebot-joycon/blob/main/Learning_Model/lerobot/tests/processor/test_pi05_processor.py
