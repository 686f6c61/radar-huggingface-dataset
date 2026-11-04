# iseonn/act_am_arm_dagger_ft

## Resumen

`iseonn/act_am_arm_dagger_ft` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. (2023) y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de una observación compuesta por el estado articular del robot (vector de 7 dimensiones) y dos cámaras RGB de 480x640 (muñeca y vista superior), predice directamente una acción de 7 dimensiones. El autor del repositorio es el usuario `iseonn`, y la política está especializada en una única tarea de manipulación denominada "pickup1".

El modelo resuelve el problema clásico de la imitación visomotora de precisión: mapear píxeles y propriocepción a comandos de actuador en tiempo real a 30 FPS. ACT aborda este problema prediciendo trozos de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La política se ha afinado sobre un conjunto de datos propio de 15 episodios y 9.583 fotogramas, con 15.000 pasos de entrenamiento y un tamaño total de 51,67 millones de parámetros (0,2 GB en safetensors), lo que la hace extremadamente ligera y desplegable en hardware de consumo.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un flujo completo de LeRobot (grabación de datos con teleoperación, entrenamiento ACT y despliegue en un robot SO-100/SO-101 de bajo coste) y como referencia para quien quiera adaptar el pipeline a su propia tarea. No obstante, al estar entrenada sobre un dataset mínimo y sin resultados de evaluación publicados, debe considerarse una política experimental y no un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones visuales y de estado que predice chunks de acciones |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por el pipeline ACT) |
| Tipos de cuantización | no disponible (el repo distribuye safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo robótico sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `so_follower` (familia SO-100/SO-101 de LeRobot) |
| Cámaras de entrada | `wrist`, `top` (RGB 3x480x640) |
| Entrada de estado | `observation.state` (7,) |
| Salida | `action` (7,) |
| Tarea entrenada | "pickup1" |
| Dataset de entrenamiento | `iseonn/am_arm_dagger_final` (15 episodios, 9.583 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 15.000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un cuello de botella latente de tipo VAE (CVAE) que procesa las imágenes de las dos cámaras mediante un backbone convolucional, las concatena con el vector de estado proprioceptivo y genera un chunk de acciones futuras en lugar de un único paso. Esta predicción por chunks, junto con el término de regularización del latente, es lo que permite al modelo producir trayectorias suaves y tolerar pequeñas variaciones en la posición inicial. El modelo tiene 51,67 millones de parámetros, un tamaño típico de las políticas ACT de LeRobot y muy inferior al de los modelos vision-language generalistas.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `iseonn/am_arm_dagger_final`, que contiene 15 episodios teleoperados (9.583 fotogramas a 30 FPS) de la tarea "pickup1". La configuración reportada es de 15.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El nombre del checkpoint (`dagger_ft`) sugiere un afinamiento sobre datos agregados de tipo DAgger, aunque la model card no detalla el proceso de recolección ni la proporción de datos humanos frente a datos de política. No se documenta el uso de RLHF, DPO ni ninguna otra etapa de alineación, algo esperable en un modelo de imitación.

## Capacidades

- Control visomotor de manipulación: genera comandos de 7 dimensiones (típicamente 6 articulaciones más pinza) a partir de dos vistas RGB y el estado articular.
- Predicción por chunks de acciones: produce secuencias cortas de acciones coherentes temporalmente, lo que reduce el jitter y mejora la suavidad de la trayectoria.
- Fusión multimodal: integra información visual de muñeca y vista cenital con propriocepción en un único transformer.
- Ejecución en tiempo real: diseñada para inferencia a 30 FPS en GPUs de consumo, compatible con el bucle de control de LeRobot.
- Tarea única: especializada en "pickup1"; no generaliza a otras tareas sin reentrenamiento.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- Sin modo de pensamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Recogida de objetos con brazo SO-100/SO-101: la política ejecuta la tarea "pickup1" sobre el robot `so_follower` con las cámaras `wrist` y `top`; es su uso directo y el único validado por el autor.
- Base para afinamiento con DAgger: al estar etiquetada como `dagger_ft`, puede servir como política inicial sobre la que agregar correcciones humanas y mejorar la robustez en posiciones de objeto no vistas.
- Referencia educativa de un pipeline LeRobot completo: permite reproducir de principio a fin la grabación de datos, el entrenamiento ACT y el despliegue con `lerobot-rollout` en un entorno de laboratorio o docencia.
- Pruebas de integración de hardware de bajo coste: útil para validar cámaras, calibración y puertos serie antes de invertir en datasets mayores.
- Benchmark interno de imitación: sirve como línea base de éxito/fallo para comparar con políticas propias entrenadas sobre el mismo robot y tarea.
- Prototipado de automatización de picking en entornos controlados: con la advertencia de que su dataset es mínimo y no hay tasas de éxito publicadas, por lo que solo es apto para experimentación, no para producción.
- Generación de datos sintéticos de política: ejecutar la política para recolectar rollouts y analizar modos de fallo antes de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, métricas de error de trayectoria ni comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,67 millones de parámetros en FP32 el peso ocupa aproximadamente 0,2 GB, y el consumo real vendrá dominado por las activaciones de las dos cámaras a 480x640 y el batch de inferencia (estimación orientativa por debajo de 2 GB en FP32, no confirmada por el autor).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar el bucle de control a 30 FPS con margen. Para entrenamiento se recomienda RTX 4090, A100 o H100 si se amplía el dataset.
- Cabe en GPU de consumo: sí, con claridad; incluso GPUs de gama de entrada con 4-8 GB de VRAM son suficientes para inferencia.
- Opciones de despliegue: `lerobot-rollout` (comando documentado en la model card) sobre el stack LeRobot; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no se publican mediciones; el diseño de ACT y el dataset a 30 FPS sugieren que el objetivo es operar en tiempo real a esa frecuencia, pero no hay cifras verificables en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iseonn/act_am_arm_dagger_ft` | 51,67 M | ACT (imitación) | Estado (7,) + 2 cámaras 480x640 | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia de LeRobot | ~51 M (típico) | ACT (imitación) | Configuración variable según dataset | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (Chi et al., 2023) | variable, típicamente decenas de millones | Difusión para acciones | Estado + imágenes | MIT/Apache según implementación | Repos públicos y LeRobot |
| π0 / políticas VLA generalistas | miles de millones | Vision-Language-Action | Texto + imágenes + estado | variable | Repos públicos |

La comparación cuantitativa de rendimiento no está disponible: no hay tasas de éxito publicadas para esta política ni una evaluación común con las alternativas. La comparación debe limitarse a parámetros, licencia y tipo de arquitectura.

## Limitaciones y advertencias

- Dataset mínimo: 15 episodios y 9.583 fotogramas son insuficientes para una generalización robusta; es probable un sobreajuste a posiciones, iluminación y objetos concretos de la grabación.
- Sin evaluación publicada: no hay tasas de éxito ni análisis de modos de fallo, por lo que no puede recomendarse para producción.
- Tarea única: solo "pickup1"; no realiza otras tareas ni responde a instrucciones en lenguaje natural.
- Dependencia de hardware: requiere el robot `so_follower` y cámaras con los nombres y resoluciones exactos (`wrist`, `top`, 480x640, 30 FPS); cualquier cambio de cámara o calibración invalida la política.
- Riesgo de alucinación en sentido robótico: puede generar trayectorias plausibles pero incorrectas ante objetos o configuraciones fuera de distribución, sin mecanismo de verificación interno.
- Sesgos: heredados de los datos teleoperados (posiciones, objetos, iluminación y operador concretos); no se documenta diversidad demográfica ni de escenarios.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes de terceros sobre su comportamiento real.
- Fecha de creación futura en los metadatos (2026-11-04): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iseonn/act_am_arm_dagger_ft
- Dataset de entrenamiento: https://huggingface.co/datasets/iseonn/am_arm_dagger_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=iseonn/am_arm_dagger_final
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
