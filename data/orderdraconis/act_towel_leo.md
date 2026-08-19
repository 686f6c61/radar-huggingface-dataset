# OrderDraconis/act_towel_leo

## Resumen

El modelo `OrderDraconis/act_towel_leo` es una política de control robótico entrenada con el método Action Chunking with Transformers (ACT) para la tarea de plegar una toalla gris. Ha sido desarrollado por Leo Guillier (usuario `OrderDraconis`) y publicado en Hugging Face bajo licencia Apache 2.0, utilizando la librería LeRobot de Hugging Face. El modelo pertenece a la categoría de robótica y no a la de procesamiento de lenguaje natural: consume observaciones de estado y tres flujos de cámara para producir comandos de acción de 12 dimensiones.

ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control y reduce el error acumulado. El modelo tiene 51.680.908 parámetros, un tamaño modesto que lo hace adecuado para ejecutarse en hardware de consumo. Se entrenó sobre un dataset de 147 episodios teleoperados (139.325 fotogramas a 15 FPS) con la tarea específica "fold the grey towel". Su relevancia radica en ser un ejemplo práctico de aplicación de ACT a un problema de manipulación deformable, un área activa en robótica de aprendizaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.680.908 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones de estado e imágenes, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que codifica observaciones multimodales —un vector de estado de 12 dimensiones y tres imágenes RGB de 480×640 píxeles procedentes de las cámaras `left_left_jaw`, `right_right_jaw` y `right_topdown`— y decodifica un chunk de acciones de 12 dimensiones. El método fue presentado en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705) y está implementado en LeRobot.

El entrenamiento se realizó con 100.000 pasos, tamaño de lote 16, optimizador AdamW y tasa de aprendizaje 1e-5, con semilla 1000 y LeRobot versión 0.6.0. El dataset de entrenamiento (`Janmeier820/combined_greytowelfolding_trimmed_15fps`) contiene 147 episodios de teleoperación a 15 FPS, con un total de 139.325 fotogramas, todos etiquetados con la tarea "fold the grey towel". No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al aprendizaje por imitación supervisado.

## Capacidades

- Control robótico bimanual: genera comandos de acción de 12 dimensiones para el robot `bi_so_follower`.
- Percepción visual multimodal: integra tres cámaras simultáneas (dos de pinza y una cenital) a 480×640 píxeles.
- Predicción de chunks de acciones: produce secuencias de acciones completas en lugar de pasos individuales, lo que mejora la suavidad del movimiento.
- Aprendizaje por imitación: reproduce comportamientos teleoperados sin necesidad de ingeniería de recompensas.
- Especialización en manipulación de objetos deformables: entrenado específicamente para plegado de toallas.
- No dispone de capacidades de lenguaje natural, razonamiento simbólico, tool calling ni procesamiento de audio.

## Casos de uso

- Automatización de plegado de ropa en lavanderías industriales: el modelo puede integrarse en un robot bimanual para doblar toallas de forma autónoma, reduciendo la intervención manual en entornos de alto volumen.
- Investigación en manipulación de objetos deformables: sirve como punto de partida para estudiar estrategias de plegado, seguimiento de esquinas y control de materiales flexibles.
- Desarrollo de pipelines de aprendizaje por imitación con LeRobot: el repositorio incluye scripts de entrenamiento y despliegue (`lerobot-train`, `lerobot-rollout`) que permiten reproducir el flujo completo con otros datasets.
- Benchmarking de algoritmos de action chunking: al ser un modelo pequeño y con una tarea bien definida, puede usarse como referencia para comparar variantes de ACT u otros métodos de imitación.
- Prototipado de asistentes robóticos domésticos: el plegado de toallas es una tarea habitual en el hogar; este modelo demuestra la viabilidad de enseñar dicha habilidad con datos teleoperados.
- Validación de generalización entre robots: aunque entrenado para `bi_so_follower`, puede evaluarse su transferencia a otros robots bimanuales compatibles con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en robot real ni comparaciones con otras políticas. El campo de evaluación del repositorio indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM mínima ni GPU recomendada.
- Dado el tamaño del modelo (51,7 millones de parámetros), es razonable esperar que quepa en GPUs de consumo con al menos 8 GB de VRAM, aunque no hay confirmación del autor.
- El entrenamiento se realizó con LeRobot sobre CUDA, por lo que se asume una GPU NVIDIA compatible.
- Para inferencia, LeRobot ofrece integración con `lerobot-rollout`, que puede ejecutarse en GPU o CPU, aunque la latencia será menor en GPU.
- No se mencionan opciones de despliegue como vLLM, Ollama o TGI, ya que el modelo no es un LLM y no utiliza formatos GGUF ni ONNX.
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints de ACT entrenados para plegado de toallas con los que comparar directamente. El método ACT original (arXiv:2304.13705) se evaluó en tareas de manipulación bimanual con robots ALOHA, pero no se han publicado resultados de este modelo concreto frente a alternativas. En el ecosistema LeRobot existen otras políticas de imitación (como Diffusion Policy o VQ-BeT), pero no hay datos comparativos en este repositorio.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para doblar una toalla gris concreta; no generaliza a otros colores, texturas, tamaños o posiciones iniciales.
- Dependencia del hardware: requiere las tres cámaras específicas y el robot `bi_so_follower`; cambios en la configuración de sensores o en el robot invalidan el comportamiento.
- Sin evaluación en robot real: no hay resultados de éxito en despliegue físico, por lo que su rendimiento real es desconocido.
- Riesgo de sobreajuste: con solo 147 episodios y 100.000 pasos de entrenamiento, es probable que la política memorice las trayectorias del dataset en lugar de aprender una estrategia general.
- Sin capacidades de razonamiento ni lenguaje: no es un modelo multimodal en el sentido de LLM; no puede interpretar instrucciones verbales ni adaptarse a tareas nuevas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el funcionamiento en entornos de producción.
- Fecha de publicación futura: el modelo fue creado en julio de 2026, lo que puede implicar que la documentación asociada aún esté incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrderDraconis/act_towel_leo
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Janmeier820/combined_greytowelfolding_trimmed_15fps
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Janmeier820/combined_greytowelfolding_trimmed_15fps
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de inferencia de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/OrderDraconis
