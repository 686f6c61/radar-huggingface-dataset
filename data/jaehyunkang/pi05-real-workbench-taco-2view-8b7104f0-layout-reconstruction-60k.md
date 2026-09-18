# jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-layout-reconstruction-60k

## Resumen

Pi0.5 Real Workbench — taco-2view-8b7104f0-layout-reconstruction-60k es un checkpoint final de una política robótica (policy) entrenada durante 60.000 pasos de optimización por el usuario jaehyunkang, publicado bajo el ecosistema LeRobot. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, que pertenece a la familia Pi0.5 de modelos visión-lenguaje-acción (VLA), y está especializado en la tarea `layout_reconstruction` sobre el conjunto de datos `Myungkyu/real_workbench-taco-keyframe-gemini`.

El modelo no es un LLM conversacional: su salida son acciones de control para un brazo robótico. Concretamente, consume un estado de 8 dimensiones y dos vistas de cámara (exterior y muñeca) y produce una acción delta EEF de 7 dimensiones (6 de velocidad cartesiana más pinza), con un horizonte de chunk de acción de 50 y 10 pasos de denoising por inferencia. El repositorio ocupa 9,4 GB y contiene 4.143.404.816 parámetros en formato safetensors, junto con la configuración de la política, el preprocesado y los estados de normalización.

Su relevancia es acotada pero clara: es un artefacto de inferencia reproducible para investigación en imitación robótica (behavior cloning) sobre LeRobot, con trazabilidad explícita del dataset, semilla, batch global y número de pasos. No se reclaman métricas de evaluación en robot real ni se han publicado resultados de benchmarks, por lo que debe tratarse como un checkpoint de entrenamiento, no como un resultado validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia Pi0.5; tokenizador/backbone asociado a `google/paligemma-3b-pt-224` |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en precisión original (safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto por subtarea del dataset, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Tarea / ambito | `layout_reconstruction` |
| Dimension de estado | 8 |
| Dimension de accion | 7 (6 de velocidad cartesiana + pinza, como delta EEF) |
| Vistas de entrada | 2 (exterior y muneca) |
| Resolucion de imagen | 224x126 almacenada; la politica rellena (pad) a 224x224 |
| Chunk de accion / horizonte de ejecucion | 50 |
| Pasos de denoising en inferencia | 10 |
| Pasos de optimizacion | 60.000 |
| Batch global / GPUs / semilla | 32 / 2 / 42 |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe un artefacto de política basado en `lerobot/pi05_base`, es decir, la implementación Pi0.5 integrada en LeRobot, con una referencia de tokenizador a `google/paligemma-3b-pt-224` (revisión de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`). Esto sitúa el backbone en la familia PaliGemma de 3B, sobre la que se añade la cabeza de acciones propia de las políticas VLA. El recuento real de 4.143.404.816 parámetros es coherente con un backbone de ~3B más el módulo de acciones y cabezas asociadas, aunque el desglose exacto no se detalla en la ficha.

El entrenamiento se realizó con la implementación `RLWRLD/hiwrld-ll-policy` (LeRobot Pi0.5 vendorizado), durante 60.000 pasos con batch global 32 sobre 2 GPUs y semilla 42. La instrucción se proporciona como texto de subtarea por frame proveniente de parquet, y el modelo consume dos vistas simultáneas (exterior y muñeca). El estado de 8 dimensiones y la acción de 7 dimensiones se normalizan con estados de normalización incluidos en el repositorio. El artefacto excluye el estado de optimizador y de reanudación del entrenamiento, y las rutas específicas del host han sido eliminadas de los metadatos JSON; para reanudar hace falta aportar rutas locales de dataset y salida. No se documentan detalles de composición del dataset, número de tokens de entrenamiento, ni fases de RLHF/DPO, por lo que esos puntos quedan como no disponibles.

## Capacidades

- Generación de acciones de control robótico: dado un estado de 8 dimensiones y dos observaciones de cámara, produce un chunk de 50 acciones delta EEF de 7 dimensiones (6 de velocidad cartesiana y pinza).
- Ejecución condicionada por instrucción textual: la política acepta el texto de subtarea por frame como campo `task`; en modelos de subtarea debe aportarse la subtarea correspondiente.
- Percepción multivista: integra dos vistas (exterior y muñeca); para modelos de 3 vistas, la ficha indica que debe aportarse además la imagen de keyframe definida en el dataset.
- Especialización en reconstrucción de layout: el checkpoint está entrenado específicamente para el ámbito `layout_reconstruction`.
- Inferencia con flow matching: 10 pasos de denoising por chunk generado, con horizonte de ejecución de 50.
- Ajuste fino adicional: al derivar de `lerobot/pi05_base` y publicarse pesos, configuración y normalización, puede servir como punto de partida para nuevos fine-tunes en LeRobot.
- Tool calling / function calling: no disponible; no es una capacidad descrita para esta política.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, visión general): no disponible; la visión está limitada a las vistas de cámara del entorno de trabajo.

## Casos de uso

- Reconstrucción de layouts en banco de trabajo: es la tarea objetivo explícita del checkpoint. El modelo recibe el estado del robot y las vistas exterior y de muñeca, y emite velocidades cartesianas y comandos de pinza para recolocar objetos según el layout esperado, aprovechando el chunk de 50 acciones para trayectorias continuas.
- Manipulación con realimentación visual de dos cámaras: la vista de muñeca permite corregir el agarre en aproximaciones finales, mientras que la vista exterior aporta contexto global de la escena; útil en tareas de pick-and-place donde el objeto queda parcialmente ocluido desde una sola cámara.
- Fine-tuning sobre tareas específicas de laboratorio: al publicarse pesos, configuración y estados de normalización, un equipo puede reentrenar el checkpoint sobre su propio dataset LeRobot partiendo de una política ya adaptada a manipulación de banco, reduciendo el coste frente a partir de `pi05_base`.
- Investigación en imitation learning: sirve como referencia reproducible (semilla 42, batch 32, 60.000 pasos documentados) para reproducir curvas de entrenamiento y estudiar el efecto del número de pasos en el rendimiento de una política VLA.
- Evaluación comparativa de políticas en simulación o banco: al ser un artefacto de inferencia limpio (sin estado de optimizador), puede desplegarse junto a otros checkpoints de la misma familia para comparar tasas de éxito por tarea bajo idénticas condiciones de observación.
- Generación de datos de acción sintéticos para preentrenamiento: los chunks de acción generados pueden usarse para aumentar datasets de demostración, filtrando después por consistencia física antes de incorporarlos a un pipeline de entrenamiento.
- Integración en el stack LeRobot: el modelo se carga con la biblioteca `lerobot` y puede insertarse en bucles de control existentes que ya consuman políticas Pi0.5, siempre que se respeten los campos de entrada personalizados de la implementación de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia ficha del modelo indica explícitamente que se trata de un checkpoint entrenado y no de un resultado de evaluación, y que no se reclaman métricas de evaluación en robot real. Tampoco se aportan cifras de latencia, throughput ni tasas de éxito por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 16,6 GB solo para pesos; en BF16/FP16, unos 8,3 GB; en INT8, unos 4,1 GB; en INT4, unos 2,1 GB. Estas cifras no incluyen activaciones, buffers del encoder de visión ni el overhead del runtime de PyTorch.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento se realizó en 2 GPUs, pero no se especifica el modelo.
- Encaje en GPU de consumo: con 4,14 mil millones de parámetros, en BF16 cabría en GPUs de 24 GB como RTX 3090 o RTX 4090; en INT8 podría encajar en tarjetas de 16 GB, siempre que la implementación de LeRobot soporte esa cuantización (no documentada en el repositorio).
- Opciones de despliegue: la vía soportada es la biblioteca `lerobot` (PyTorch), cargando los pesos safetensors del repositorio. No se han publicado pesos GGUF ni adaptaciones para vLLM, TGI, llama.cpp u Ollama; al tratarse de una política VLA con cabeza de acciones, estos runners de LLM no son aplicables directamente.
- Almacenamiento: el repositorio ocupa 9,4 GB, por lo que conviene prever ese espacio en disco además de la VRAM.
- Latencia y throughput: no disponibles. Como referencia estructural, cada inferencia ejecuta 10 pasos de denoising para generar un chunk de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-real-workbench-taco-2view-8b7104f0-layout-reconstruction-60k | 4,14 mil millones | no disponible | no disponible | HuggingFace, biblioteca lerobot, 0 descargas | Fine-tune especializado en `layout_reconstruction`, 2 vistas |
| `lerobot/pi05_base` | no disponible en la informacion | no disponible | no disponible | HuggingFace | Modelo base del que deriva este checkpoint |
| Otras politicas VLA (por ejemplo, familias tipo OpenVLA o GR00T) | no disponible en la informacion | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de métricas de robot real para ninguno de los modelos listados, por lo que la comparación se limita a la relación de derivación y a la disponibilidad de pesos. Cualquier comparación de rendimiento requeriría una evaluación propia bajo condiciones idénticas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta la composición demográfica, geográfica ni de condiciones de iluminación del dataset de entrenamiento, lo que impide evaluar sesgos de dominio.
- Riesgo de alucinación: en políticas VLA el fallo típico no es textual sino de acción; el modelo puede generar comandos de velocidad o de pinza incorrectos ante escenas fuera de la distribución del dataset de entrenamiento.
- Generalización limitada: está entrenado específicamente para la tarea `layout_reconstruction` con dos vistas; no debe esperarse buen rendimiento en tareas, número de cámaras o morfologías de robot distintos sin un nuevo fine-tune.
- Dependencia de la implementación: la ficha advierte de que los campos de entrada personalizados pueden requerir la implementación concreta `RLWRLD/hiwrld-ll-policy` (LeRobot Pi0.5 vendorizado), por lo que cargarlo con una versión estándar de LeRobot puede fallar.
- Requisito de instrucción por subtarea: para modelos de subtarea hay que aportar el texto de subtarea por frame; para modelos de 3 vistas, además la imagen de keyframe del dataset. Omitir estos campos degrada o invalida la inferencia.
- Licencia no disponible: sin licencia declarada en el repositorio, no hay autorización explícita para uso comercial. Debe aclararse con el autor antes de cualquier despliegue en producción.
- Ausencia de validación: no se reclaman métricas de evaluación en robot real, no hay benchmarks publicados y el modelo tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria de su funcionamiento.
- Estado de entrenamiento excluido: el artefacto no incluye estado del optimizador ni de reanudación, y las rutas del host original han sido eliminadas; reanudar el entrenamiento exige reconstruir rutas locales.
- Fecha del repositorio: creado y actualizado el 18 de septiembre de 2026, con apenas 40 segundos entre ambos eventos, lo que sugiere una subida automatizada sin revisión posterior.
- Idiomas: no disponible; no puede confirmarse el idioma de las instrucciones de tarea ni su cobertura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-layout-reconstruction-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Tokenizador de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementación de entrenamiento: `RLWRLD/hiwrld-ll-policy` (LeRobot Pi0.5 vendorizado); no se proporciona URL en la información disponible
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de un vehículo eléctrico y no guardan relación con este repositorio.
