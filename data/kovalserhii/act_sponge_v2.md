# kovalserhii/act_sponge_v2

## Resumen

act_sponge_v2 es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicada por el usuario kovalserhii en Hugging Face y construida con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una red neuronal que consume el estado de un brazo robótico y dos flujos de vídeo, y emite comandos de actuación. En concreto, está especializada en una única tarea física: coger una esponja y colocarla sobre un plato.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y está pensado para el robot `so_follower` (familia SO-100/SO-101) con dos cámaras, una cenital y otra en la muñeca. La entrada de estado tiene 6 dimensiones y la salida de acción también 6 dimensiones, con imágenes de 3×360×640 (cenital) y 3×480×640 (muñeca).

Su relevancia es doble: por un lado, ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en hardware de bajo coste; por otro, sirve como punto de partida para hacer fine-tuning sobre datos propios de tareas pick-and-place. La licencia Apache 2.0 permite uso comercial, aunque el autor no ha publicado ninguna evaluación de éxito en robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación con predicción de chunks de acciones |
| Parametros totales | 51.668.614 (≈51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una ventana de observaciones y emite un chunk de acciones, cuyos tamaños no se detallan en la model card) |
| Tipos de cuantizacion | no disponible (no se indican variantes cuantizadas ni formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con la cadena en inglés "pick sponge and place on plate") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag del repositorio); gestión y carga mediante LeRobot |
| Libreria | lerobot (entrenado y publicado con LeRobot 0.6.2) |
| Tipo de robot | `so_follower` |
| Camaras | `overhead`, `wrist` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.overhead` | VISUAL, forma `(3, 360, 640)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Tamano del repositorio | 6,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705 citado en la model card, es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un chunk de varias acciones futuras a partir de una ventana de observaciones. Este enfoque reduce el error de composición acumulado y suaviza la política en tareas de manipulación. La model card no detalla la configuración interna de la red para este checkpoint (número de capas, cabezas de atención, backbones de visión ni tamaño del chunk), por lo que esos datos quedan como no disponibles.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. Los datos proceden del dataset kovalserhii/sponge_plate_v1: 91 episodios, 37.855 fotogramas a 30 FPS (unos 21 minutos de demostraciones teleoperadas) para una única tarea, "pick sponge and place on plate". Con esos números, el entrenamiento equivale aproximadamente a 21 pasadas equivalentes sobre el total de fotogramas (cálculo derivado de los datos publicados, no reportado por el autor). No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, lo cual es coherente con una política de imitación supervisada.

## Capacidades

- Generación de acciones de manipulación: mapea el estado de 6 dimensiones del brazo más dos imágenes de cámara a un vector de acción de 6 dimensiones, adecuado para el robot `so_follower`.
- Percepción visual multimodal: combina una vista cenital (3×360×640) y una vista de muñeca (3×480×640) con el estado propioceptivo.
- Ejecución de una tarea concreta: "pick sponge and place on plate" (coger una esponja y colocarla sobre un plato).
- Control por imitación a partir de demostraciones teleoperadas: no requiere recompensa ni simulación, aprende de episodios reales.
- Predicción de chunks de acciones: genera secuencias cortas de acciones en lugar de un único paso, lo que aporta estabilidad temporal.
- Despliegue por línea de comandos: se ejecuta con `lerobot-rollout` sobre el robot y las cámaras configuradas.
- Reutilización como base para fine-tuning: puede servir de inicialización para tareas pick-and-place similares con datos propios.
- Sin soporte de tool calling ni function calling: no es un modelo de lenguaje ni expone API de herramientas.
- Sin capacidades de agente ni razonamiento multi-paso simbólico: su "razonamiento" es puramente reactivo y visomotor.
- Sin capacidades multilingües: no procesa texto libre; la tarea se pasa como identificador de tarea en inglés.
- Sin modo de pensamiento, visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Automatización de pick-and-place en banco de pruebas: el modelo ejecuta directamente la secuencia de coger una esponja y depositarla en un plato sobre un brazo SO-100/SO-101, sin necesidad de planificación explícita, gracias a la política visomotora entrenada con 91 episodios reales.
- Fine-tuning para tareas propias de manipulación: al ser una política ACT ya entrenada y con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio de otra tarea similar (por ejemplo, colocar objetos en bandejas) partiendo de estos pesos.
- Referencia reproducible del pipeline LeRobot: sirve para validar de principio a fin la cadena de LeRobot (grabación de datos con LeRobot, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) antes de invertir en datasets mayores.
- Docencia y formación en robótica de imitación: con 51,7 M de parámetros y una única tarea, es un ejemplo manejable para explicar aprendizaje por imitación, chunking de acciones y teleoperación en cursos o talleres.
- Evaluación comparativa de hardware y configuraciones de cámara: al fijar la tarea, permite medir cómo afectan la iluminación, la posición de las cámaras, el tipo de pinza o el robot de destino al éxito de la política.
- Generación de rollouts para ampliar el dataset: ejecutando la política con `--strategy.type=base` se pueden registrar episodios adicionales que luego se filtren y se incorporen al conjunto de entrenamiento.
- Pruebas de robustez en producción robótica: sirve como caso de estudio de los modos de fallo típicos de una política de imitación (sensibilidad a la posición inicial, oclusiones, cambios de iluminación) antes de desplegar políticas similares en entornos reales.
- Demostraciones en ferias y laboratorios: su coste computacional reducido permite ejecutarlo en un equipo con GPU modesta o incluso en CPU para demostraciones de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la nota "No evaluation results have been provided for this policy yet", por lo que no existen datos de tasa de éxito en robot real, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación o distractores). Tampoco aplican benchmarks de modelos de lenguaje como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Huella de pesos: con 51.668.614 parámetros, los pesos ocupan aproximadamente 206,7 MB en fp32, 103,3 MB en bf16/fp16 y 51,7 MB en int8 (cálculo derivado del número de parámetros).
- VRAM estimada para inferencia: inferior a 2 GB para el modelo y las activaciones de una única inferencia; conviene reservar 2-4 GB adicionales para el runtime de CUDA/cuDNN y el preprocesado de los dos flujos de vídeo a 30 FPS.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de memoria es suficiente (por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090). Aceleradores como A100 o H100 son enormemente sobredimensionados para 51,7 M de parámetros; solo tendrían sentido si se comparten con otros procesos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en sistemas embebidos tipo Jetson Orin Nano si el resto del pipeline de cámaras y control lo permite.
- CPU: la inferencia en CPU es viable por el reducido tamaño del modelo, aunque la latencia de control a 30 FPS dependerá del preprocesado de imagen y de si se usa un backend optimizado; no hay cifras medidas publicadas.
- Opciones de despliegue: LeRobot con PyTorch es la vía soportada (`lerobot-rollout --policy.path=kovalserhii/act_sponge_v2`). No aplican vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control efectiva, tiempo de inferencia por chunk ni tasa de éxito en hardware real.
- Almacenamiento: el repositorio ocupa 6,2 GB, muy por encima de lo que ocupan los pesos finales; lo más probable es que incluya checkpoints intermedios de los 100.000 pasos de entrenamiento o artefactos adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| act_sponge_v2 (este modelo) | ACT, imitación | 51.668.614 (≈51,7 M) | No es contexto de lenguaje: `observation.state` (6,), dos imágenes 3×360×640 y 3×480×640 | Apache 2.0 | Hugging Face, librería LeRobot | Sin evaluación publicada |
| Otras políticas ACT publicadas en LeRobot | ACT, imitación | No disponible | No disponible | Variable según repositorio | Hugging Face (etiqueta `act`) | No disponible |
| Diffusion Policy (implementación en LeRobot) | Política de difusión para manipulación | No disponible en la información proporcionada | Entradas viso-propioceptivas equivalentes | No disponible en la información proporcionada | Implementación en LeRobot | No disponible |
| SmolVLA (LeRobot) | Modelo visión-lenguaje-acción | No disponible en la información proporcionada | Acepta instrucciones en lenguaje además de observaciones | No disponible en la información proporcionada | LeRobot | No disponible |
| π0 / openpi | Modelo visión-lenguaje-acción | No disponible en la información proporcionada | Acepta instrucciones en lenguaje además de observaciones | No disponible en la información proporcionada | Repositorio openpi | No disponible |

La diferencia cualitativa principal es que act_sponge_v2 es una política mono-tarea sin entrada de lenguaje, mientras que las alternativas basadas en VLA pueden generalizar a múltiples tareas descritas en texto a cambio de un coste computacional y de datos muy superior. No se dispone de datos verificados en la información proporcionada para cuantificar esa diferencia.

## Limitaciones y advertencias

- Mono-tarea: la política solo ha sido entrenada para "pick sponge and place on plate"; fuera de esa tarea no hay garantía de comportamiento útil.
- Sin evaluación publicada: no existe ninguna medida de tasa de éxito en robot real, ni condiciones de prueba, ni número de ensayos. Cualquier uso en producción parte de una base no validada.
- Dataset muy reducido: 91 episodios y 37.855 fotogramas (unos 21 minutos) de una sola tarea, lo que favorece el sobreajuste a posiciones, iluminación y apariencia concretas.
- Dependencia del montaje físico: las claves de observación (`observation.images.overhead` y `observation.images.wrist`) deben existir con esos nombres y resoluciones; cambiar la posición de las cámaras, la resolución o el tipo de pinza degrada el rendimiento.
- Dependencia del robot: entrenada para `so_follower`; usarla en otro robot o en otra unidad de la misma familia puede requerir recalibración o fine-tuning.
- Sin entrada de lenguaje: no se puede pedir una tarea distinta por prompt ni corregir el comportamiento en tiempo de ejecución mediante instrucciones.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no es un componente válido para orquestación de agentes ni para pipelines de texto.
- Riesgo de alucinación no aplicable en el sentido de los modelos de lenguaje, pero sí existen modos de fallo equivalentes: el modelo puede ejecutar la secuencia con objetos ausentes o mal posicionados y generar acciones que no correspondan a la escena.
- Idiomas: no procede; la única referencia textual es el identificador de tarea en inglés.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no se documentan las licencias ni los consentimientos asociados a los datos de teleoperación del dataset `kovalserhii/sponge_plate_v1`, por lo que conviene revisarlos antes de un despliegue comercial.
- Datos anómalos en los metadatos: las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la fecha de consulta habitual, lo que sugiere un posible error de registro; conviene verificarlas en la página del modelo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso por terceros ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kovalserhii/act_sponge_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/kovalserhii/sponge_plate_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kovalserhii/sponge_plate_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelos con la etiqueta `act` en Hugging Face: https://huggingface.co/models?other=act
