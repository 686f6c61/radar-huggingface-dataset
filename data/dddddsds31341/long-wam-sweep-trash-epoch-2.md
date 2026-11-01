# dddddsds31341/Long-WAM-Sweep-Trash-Epoch-2

## Resumen

Long-WAM Sweep Trash — Epoch 2 es un checkpoint de evaluación de un ajuste fino independiente del modelo base Efficient-Large-Model/Long-WAM-YAM, orientado a robótica bimanual. Lo publica el usuario dddddsds31341 y resuelve una tarea muy concreta: con un brazo robótico se sujeta la paleta de recogedor y con el otro se maneja el cepillo para barrer dos trozos de papel arrugado hacia la paleta. El modelo combina un codificador de vídeo y otro de acciones (joint video/action model) con un codificador propioceptivo, y consume tres cámaras RGB más el estado de las articulaciones.

El checkpoint corresponde a la época 2 de 5 del entrenamiento, en el paso de optimizador 2022, partiendo del modelo base Long-WAM-YAM y no de otro ajuste de una tarea distinta. Se entrenó sobre el dataset yuyingyinya/sweep_trash, con 100 demostraciones y 48.495 fotogramas a 30 Hz. El repositorio ocupa 12,0 GB e incluye pesos en model.pt, configuración resuelta, estadísticas de normalización y el código de inferencia empaquetado.

Es relevante para quienes investigan imitación robótica de manipulación bimanual de precisión, ya que documenta de forma explícita el esquema de acciones (14 dimensiones de articulaciones absolutas), el layout de vídeo (384×320, historial P48, chunk de 32 pasos) y las dependencias necesarias (VAE Wan2.2, codificador de texto UMT5). No es un modelo de lenguaje ni un modelo Transformers estándar: es un checkpoint de política robótica que requiere el stack Long-WAM para cargarse y ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (joint video/action model) con codificador propioceptivo, basado en Long-WAM-YAM |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Historial de vídeo P48 y chunk de acción de 32 pasos (no es contexto textual) |
| Tipos de cuantizacion | no disponible; pesos almacenados en el dtype de entrenamiento (BF16) |
| Idiomas soportados | no disponible (interfaz de instrucción textual vía UMT5, idioma no especificado) |
| Licencia | other (licencia personalizada; remite a la del modelo base) |
| Formato de pesos | model.pt (PyTorch), más config.yaml, dataset_stats.json, code.zip y requirements-sip.txt |

## Arquitectura y entrenamiento

El modelo parte de Efficient-Large-Model/Long-WAM-YAM y se ajusta de forma independiente sobre la tarea sweep-trash. La arquitectura es un modelo conjunto de vídeo y acción con un codificador propioceptivo: procesa tres flujos de cámara RGB (top_head, hand_left, hand_right) con un layout de vídeo de 384×320, un historial de P48 y genera chunks de acción de 32 pasos. Las acciones se representan como objetivos articulares absolutos de 14 dimensiones con las unidades originales del gripper, ordenadas como 6 articulaciones izquierdas + gripper y 6 articulaciones derechas + gripper. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en [-5, 5].

El entrenamiento usó el dataset yuyingyinya/sweep_trash en la revisión 0dd5ff1f576de17dcf06b49d352e0f125a1f43e6, con 100 demostraciones y 48.495 fotogramas a 30 Hz, todos empleados para entrenamiento. Se ejecutó en cuatro GPUs con batch de 12 por GPU, acumulación de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0,01, precisión BF16 y DeepSpeed ZeRO-1. Cada época supone 1.011 actualizaciones del optimizador y la ejecución completa apunta a 5.055 actualizaciones. El checkpoint publicado es solo de evaluación: incluye pesos y estadísticas, pero no estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento de forma exacta.

## Capacidades

- Generación de acciones robóticas bimanuales de 14 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: tres flujos RGB (top_head, hand_left, hand_right) procesados en un layout de 384×320.
- Seguimiento de instrucciones textuales de tarea mediante el codificador de texto UMT5 y su tokenizador.
- Razonamiento temporal sobre un historial de P48 fotogramas y predicción de chunks de acción de 32 pasos.
- Manipulación bimanual coordinada: sujeción de un objeto con un gripper y operación de herramienta con el otro.
- Integración con el stack Long-WAM mediante longwam.inference.load_run_config y load_model con expected_step=2022 y strict=True.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Barrido de residuos en entorno de laboratorio: el modelo ejecuta la política entrenada para sujetar el recogedor con un brazo y barrer dos trozos de papel con el cepillo del otro, usando las tres cámaras y el estado articular como entrada.
- Evaluación de políticas de imitación bimanual: sirve como checkpoint de referencia en la época 2 para comparar curvas de aprendizaje o variantes de entrenamiento sobre el mismo dataset.
- Reproducción de experimentos: al incluir config.yaml, dataset_stats.json y code.zip, permite reconstruir el pipeline de inferencia y verificar la coherencia de normalización y recorte de acciones.
- Desarrollo de adaptadores de robot: útil para validar la integración de un adaptador robótico con las convenciones de 14 dimensiones y unidades de gripper originales antes de desplegar en hardware.
- Pruebas de carga y formateo de pesos: el checkpoint ha superado comprobaciones de carga de ficheros en CPU, por lo que sirve para validar entornos de despliegue y dependencias (VAE Wan2.2, UMT5) sin necesidad de robot físico.
- Estudio de manipulación de precisión con herramientas: caso de referencia para investigar coordinación entre dos efectores en tareas de barrido y recogida de objetos deformables como papel arrugado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado con robot ni resultado de validación en conjunto reservado, y advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 12,0 GB, lo que da una cota inferior orientativa para cargar los pesos.
- GPU recomendadas: el entrenamiento se realizó en cuatro GPUs con BF16 y DeepSpeed ZeRO-1; no se especifica el modelo exacto de GPU.
- ¿Cabe en GPU de consumo? No disponible; no se documenta el consumo de memoria en inferencia ni se confirma compatibilidad con GPUs de consumo.
- Opciones de despliegue: stack Long-WAM (longwam.inference), con dependencias separadas del VAE Wan2.2, el codificador de texto UMT5 y su tokenizador. No es un modelo Transformers from_pretrained y no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requiere definir LONGWAM_MODEL_ROOT y ajustar rutas de datos, estadísticas y caché para máquinas distintas a la del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Sweep Trash — Epoch 2 | no disponible | P48 de historial, chunk de 32 pasos | Barrido bimanual de residuos | other | HuggingFace, 18 descargas |
| Efficient-Large-Model/Long-WAM-YAM | no disponible | no disponible | Modelo base de política robótica | según metadatos del modelo base | HuggingFace |
| Otros checkpoints de la misma familia Long-WAM | no disponible | no disponible | Distintas tareas de manipulación | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint solo de evaluación: no contiene estado del optimizador ni del scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- No se reporta tasa de éxito en robot real ni validación en conjunto reservado; la pérdida de entrenamiento no debe interpretarse como éxito de la tarea.
- Solo ha superado comprobaciones de carga de ficheros en CPU, no una validación funcional en bucle cerrado.
- Está especializado en una única tarea (sweep-trash) y no se documenta su generalización a otras tareas u objetos.
- Requiere un adaptador de robot compatible y respetar las convenciones originales de 14 dimensiones y unidades de gripper; un adaptador distinto puede invalidar el comportamiento.
- La configuración conserva rutas del sistema de ficheros del entrenamiento original; es necesario reconfigurar LONGWAM_MODEL_ROOT y las rutas de datos, estadísticas y caché.
- Depende de activos externos no incluidos (VAE Wan2.2, UMT5 y tokenizador), lo que complica el despliegue reproducible.
- Licencia "other": es imprescindible revisar los términos del modelo base antes de cualquier uso comercial.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible; al tratarse de una política robótica, los fallos se manifiestan como acciones incorrectas o inseguras, no como texto.
- Idiomas soportados no especificados; la instrucción textual depende del codificador UMT5 y no se detalla cobertura lingüística.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Sweep-Trash-Epoch-2
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset de entrenamiento: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Registro de entrenamiento (Weights & Biases): https://forge.coreweave.com/wandb/bofang/long-wam/runs/nwa2ucgt
- Repositorio de referencia del código base: https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
