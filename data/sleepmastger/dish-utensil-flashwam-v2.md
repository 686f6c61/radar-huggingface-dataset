# SleepMastger/dish-utensil-flashwam-v2

## Resumen

El modelo `dish-utensil-flashwam-v2` es un sistema de visión-lenguaje-acción (VLA) desarrollado por SleepMastger (autor: George) para la manipulación robótica de utensilios de cocina. Está entrenado sobre un dataset de 100 episodios teleoperados con un robot Franka (50 con tenedor y 50 con cuchara, a 10 Hz, 42.863 fotogramas) y resuelve la tarea de recoger platos de un estante, colocarlos en la mesa y posicionar los cubiertos en los platos correspondientes. Es la versión v2, que re-etiqueta los mismos episodios con una nueva instrucción de tarea, manteniendo idénticos los fotogramas, acciones y normalización.

La arquitectura se basa en FlashWAM M1 con fused-KV, RoPE fija y un experto de acción de una capa, partiendo del modelo base Wan2.2-TI2V-5B. El entrenamiento se realizó desde cero (sin reanudar desde LIBERO) durante 30 épocas (40.200 pasos) con batch global 32, LR coseno 1e-4, precisión bf16 y DeepSpeed ZeRO-1 sobre 4 GPU H200. El repositorio ocupa 60,8 GB y contiene checkpoints intermedios cada 5 épocas, junto con el código de preprocesamiento y la configuración resuelta. No se ha evaluado aún en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlashWAM M1 (fused-KV, fixed-RoPE, 1-layer action expert) sobre base Wan2.2-TI2V-5B |
| Parametros totales | no disponible (el modelo base Wan2.2-TI2V-5B tiene 5B, pero no se especifica el total del VLA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el embedding de texto usa contexto 128, pero no se indica el contexto general) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (la instrucción de tarea está en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoints de pesos) |

## Arquitectura y entrenamiento

El modelo combina un experto de video base (Wan2.2-TI2V-5B) con un experto de acción de una sola capa, siguiendo el diseño FlashWAM M1. La entrada visual consiste en dos cámaras RGB de 256x256 (agentview y muñeca), redimensionadas a 224x224 y concatenadas horizontalmente a 224x448. El estado del robot es de 8 dimensiones (posición y orientación del efector final, más apertura de pinza real), y la acción es de 7 dimensiones (delta XYZ, delta rotación y pinza). En este dataset los deltas de rotación son idénticamente cero, indicando teleoperación solo traslacional. La convención de pinza se remapeó de robosuite a LIBERO/RLDS.

El entrenamiento se realizó desde cero con 30 épocas (40.200 pasos), batch global 32, LR coseno 1e-4, bf16 y DeepSpeed ZeRO-1 en 4x H200. Se usó un embedding T5 cacheado para la instrucción de tarea (contexto 128), y la configuración resuelta desactiva el cargador de texto (`load_text_encoder: false`), por lo que el tensor cacheado es parte obligatoria del bundle de inferencia. La normalización se calculó sobre este dataset específico, sin estadísticas preentrenadas.

## Capacidades

- Generación de video condicionada a instrucciones de lenguaje (etiqueta `video-generation`).
- Visión-lenguaje-acción: integra percepción visual, comprensión de instrucciones y control de acciones robóticas.
- Manipulación de objetos en entornos de cocina: recoger platos, colocarlos en mesa, posicionar cubiertos.
- Control de pinza con apertura real (valores continuos entre 0.0002 y 0.080 m), no binaria.
- Soporte de horizonte de 33 observaciones y 32 transiciones de acción a 10 Hz.
- Procesamiento de dos cámaras simultáneas (agentview y muñeca) con concatenación horizontal.

## Casos de uso

- Automatización de tareas de recogida y colocación en cocinas robóticas: el modelo puede ejecutar la secuencia completa de recoger platos de un estante, depositarlos en la mesa y posicionar cubiertos en los platos designados, gracias a su entrenamiento específico en este escenario.
- Investigación en manipulación robótica con VLA: sirve como punto de partida para estudiar el efecto de re-etiquetado de instrucciones en el rendimiento, ya que la v2 difiere solo en la etiqueta y su embedding.
- Desarrollo de sistemas de pick-and-place con control fino de pinza: al usar apertura real continua, puede adaptarse a objetos con diferentes grosores.
- Evaluación de generalización a nuevas instrucciones: el requisito de coincidencia byte-exacta de la instrucción permite probar la sensibilidad del modelo a variaciones de texto.
- Benchmarking de arquitecturas VLA ligeras: al ser un modelo de 5B base con experto de acción de una capa, es adecuado para comparar con otros VLA en tareas de manipulación.
- Entrenamiento de robots en simulación o teleoperación: el bundle incluye código de preprocesamiento y configuración, facilitando la reproducción o extensión del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido evaluado en un robot físico, según indica la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo base y de la cuantización, no especificada).
- GPU recomendadas: el entrenamiento se realizó en 4x H200, pero para inferencia no se indica. Dado el tamaño del repo (60,8 GB) y la arquitectura de 5B, se requeriría al menos una GPU con 24 GB de VRAM para cargar los pesos en bf16, aunque no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; el modelo no está cuantizado y los pesos son `.pt` de PyTorch, lo que sugiere que se necesita una GPU profesional o de gama alta.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El modelo requiere el bundle completo (Wan VAE, código FastWAM, embedding cacheado) y no es standalone.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA para manipulación de utensilios) dentro de los datos proporcionados. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo no ha sido evaluado en un robot físico; su rendimiento real en despliegue es desconocido.
- La instrucción de tarea debe coincidir byte-exactamente con la cadena especificada; cualquier variación rompe la coincidencia del embedding cacheado.
- Los checkpoints son solo pesos y no son standalone: requieren el Wan VAE, el código FastWAM y la configuración incluidos en el repositorio.
- Los archivos `.pt` pueden contener objetos pickled; deben cargarse solo en entornos de confianza.
- No se especifica licencia, por lo que el uso comercial no está claramente permitido.
- El dataset es pequeño (100 episodios) y específico de una tarea; la generalización a otras tareas o entornos es limitada.
- La normalización se calculó sobre este dataset; usar estadísticas diferentes degradaría el rendimiento.
- No se proporcionan datos de sesgos, alucinación o limitaciones de idioma más allá de la instrucción en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SleepMastger/dish-utensil-flashwam-v2
- Dataset de manipulación de utensilios: https://huggingface.co/datasets/SleepMastger/dish-utensil-manipulation
- Repositorio relacionado (fruit-picking-flashwam): https://huggingface.co/SleepMastger/fruit-picking-flashwam
