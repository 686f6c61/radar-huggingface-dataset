# jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-movement-reversal-60k

## Resumen

`jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-movement-reversal-60k` es un checkpoint final de una política robótica (policy) obtenida por ajuste fino sobre `lerobot/pi05_base`, el modelo base Pi0.5 de LeRobot. No es un modelo de lenguaje conversacional: es un modelo visión-lenguaje-acción (VLA) que, a partir de dos vistas de cámara (exterior y muñeca) y una instrucción de texto por fotograma, genera acciones motoras de 7 dimensiones (6 de velocidad cartesiana más pinza) para un brazo robótico. El alcance declarado de la tarea es `movement_reversal`.

El artefacto corresponde al paso 60.000 de optimización, con batch global 32, 2 GPU de entrenamiento y semilla 42. El repositorio ocupa 9,4 GB y contiene 4.143.404.816 parámetros (unos 4,14 mil millones) en formato safetensors, distribuidos junto con la configuración de política, el preprocesado/postprocesado y los estados de normalización en la raíz del repositorio. Se entrenó sobre el dataset `Myungkyu/real_workbench-taco-keyframe-gemini`.

Su relevancia es acotada pero concreta: es un artefacto de inferencia listo para desplegar en manipulación robótica con pinza, con horizonte de ejecución y pasos de denoising ya fijados. Como contrapartida, el autor no declara licencia, ni idiomas, ni métricas de evaluación en robot real, y advierte de que los campos de entrada personalizados pueden exigir la implementación exacta con la que se entrenó (`RLWRLD/hiwrld-ll-policy`, con LeRobot Pi0.5 vendorizado), lo que limita su portabilidad directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) Pi0.5; ajuste fino de `lerobot/pi05_base`; tokenizer referenciado a `google/paligemma-3b-pt-224` (revision de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`) |
| Parametros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible; la entrada de instruccion es texto de subtarea por fotograma definido en el parquet del dataset |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 9,4 GB |
| Pasos de entrenamiento | 60.000 |
| Batch global / GPU / semilla | 32 / 2 GPU / 42 |
| Vistas de entrada | 2 (exterior y muneca) |
| Resolucion de imagen | 224x126 almacenada; la politica rellena (padding) a 224x224 |
| Dimension de estado | 8 |
| Dimension de accion | 7 (delta EEF: 6 de velocidad cartesiana + pinza) |
| Horizonte de accion / ejecucion | 50 |
| Pasos de denoising en inferencia | 10 |
| Dataset de entrenamiento | `Myungkyu/real_workbench-taco-keyframe-gemini` |
| Alcance de tarea | `movement_reversal` |

## Arquitectura y entrenamiento

Se trata de un ajuste fino de `lerobot/pi05_base` (familia Pi0.5), un modelo visión-lenguaje-acción que combina percepción visual multi-vista, una instrucción textual y un decodificador de acciones. La información disponible confirma la referencia del tokenizer a `google/paligemma-3b-pt-224` y el uso de LeRobot Pi0.5 vendorizado dentro de `RLWRLD/hiwrld-ll-policy`. No se detalla en la model card ni el número de tokens de entrenamiento, ni la composición completa del dataset, ni si hubo fases de RLHF/DPO; esos datos no están disponibles.

El entrenamiento se realizó durante 60.000 pasos de optimización con batch global 32 sobre 2 GPU y semilla 42, con instrucciones tomadas de subtareas por fotograma (parquet) y supervisión en el espacio de acción delta EEF de 7 dimensiones. En inferencia se emplea un chunking de acciones con horizonte 50 y 10 pasos de denoising. Las imágenes se almacenan a 224x126 y la política las rellena hasta 224x224, un detalle relevante porque introduce una relación de aspecto distinta de la nativa en el preprocesado. El repositorio contiene pesos, configuración de política, preprocesado/postprocesado y estados de normalización, y excluye el estado del optimizador y de reanudación del entrenamiento; las rutas específicas de la máquina anfitriona se eliminaron de los metadatos JSON.

## Capacidades

- Generación de acciones de control robótico en espacio delta EEF: 6 componentes de velocidad cartesiana más 1 de pinza.
- Condicionamiento multimodal: dos vistas de cámara (exterior y muñeca) más instrucción de texto por fotograma.
- Ejecución por chunks de acción con horizonte 50 y 10 pasos de denoising, orientada a control continuo.
- Especialización en la tarea `movement_reversal` del banco de trabajo real (real-workbench).
- Entrada de estado de 8 dimensiones, coherente con la configuración de la política.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje con herramientas).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión genérica, audio): no disponibles; la percepción visual está integrada como entrada de política, no como salida descriptiva.

## Casos de uso

- Manipulación robótica en banco de trabajo: el modelo recibe las vistas exterior y de muñeca y emite velocidades cartesianas y apertura/cierre de pinza para ejecutar la subtarea `movement_reversal`, lo que permite reproducir la tarea aprendida en un montaje físico equivalente al del dataset.
- Investigación en políticas VLA: sirve como punto de partida para comparar variantes de ajuste fino sobre `lerobot/pi05_base` con el mismo dataset y presupuesto de pasos (60.000), manteniendo constante el backbone.
- Reentrenamiento y ablaciones: el repositorio incluye estados de normalización y configuración, de modo que se puede reanudar o reiniciar el ajuste sustituyendo rutas locales y campos de entrada del dataset.
- Evaluación de robustez ante cambios de contexto visual: al depender de dos vistas fijas, permite medir la degradación al mover la cámara exterior o al cambiar la iluminación del banco de trabajo.
- Integración en pipelines de aprendizaje por imitación: puede insertarse como política objetivo en bucles de recogida de datos tipo LeRobot, comparando el rendimiento del checkpoint con el del modelo base.
- Prototipado de control con chunking: el horizonte de 50 acciones y 10 pasos de denoising permiten estudiar compromisos entre frecuencia de replanificación y suavidad del movimiento en un lazo de control real.
- Docencia y reproducción de experimentos: al publicarse el dataset, la semilla, el batch y el número de GPU, el experimento es replicable con recursos modestos (2 GPU), lo que facilita prácticas de ajuste fino de políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que se trata de un checkpoint entrenado y no de un resultado de evaluación, y que no se reclama ninguna métrica de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en precisión de 32 bits, unos 16,6 GB solo para los 4.143.404.816 parámetros; en bfloat16/float16, unos 8,3 GB de pesos, más activaciones de las dos vistas a 224x224 y del decodificador de acciones. Una estimación razonable de trabajo se sitúa en el rango de 12-20 GB según precisión y batch (estimación propia, no confirmada por el autor).
- GPU recomendadas: no declaradas por el autor. Por tamaño, una GPU de 24 GB (RTX 4090, L40S) debería ser suficiente en bfloat16; A100 40/80 GB y H100 ofrecen margen para lotes mayores y para el entrenamiento.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y en tarjetas de 16 GB con precisión reducida; no confirmado en la información disponible.
- Opciones de despliegue: la librería declarada es `lerobot`; el autor menciona que la implementación de entrenamiento es `RLWRLD/hiwrld-ll-policy` con LeRobot Pi0.5 vendorizado, y que los campos de entrada personalizados pueden requerir esa implementación concreta. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no son directamente aplicables a una política de acción.
- Latencia y throughput: no disponibles. Los únicos parámetros de inferencia conocidos son el horizonte de acción de 50 y los 10 pasos de denoising.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-movement-reversal-60k` | 4.143.404.816 | No disponible | No disponible | HuggingFace, libreria `lerobot`, 19 descargas | Ajuste fino especializado en `movement_reversal`, 2 vistas, 60.000 pasos |
| `lerobot/pi05_base` | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace | Modelo base del ajuste; política generalista Pi0.5 |
| Otras políticas VLA de manipulacion (OpenVLA, GR00T N1, pi0) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No se han proporcionado datos verificables para comparar parametros, contexto o rendimiento |

No se dispone de datos de benchmarks ni de especificaciones de los modelos alternativos dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Alcance de tarea restringido a `movement_reversal`; no hay evidencia de generalización a otras tareas del banco de trabajo.
- Ausencia total de métricas: no se reclama ningún resultado de evaluación en robot real, por lo que el rendimiento real es desconocido.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: la instrucción es texto de subtarea por fotograma generado desde el dataset; no hay soporte multilingüe documentado.
- Dependencia de implementación: los campos de entrada personalizados pueden requerir la implementación exacta `RLWRLD/hiwrld-ll-policy` con LeRobot Pi0.5 vendorizado. Cargar el checkpoint en una implementación distinta puede producir resultados incorrectos.
- Preprocesado sensible: las imágenes se almacenan a 224x126 y se rellenan a 224x224, lo que altera la relación de aspecto; reproducir ese preprocesado es imprescindible para mantener la coherencia con el entrenamiento.
- Sin estado de reanudación: el repositorio excluye el estado del optimizador y de entrenamiento, y las rutas del host original se eliminaron de los metadatos; reanudar exige aportar rutas locales de dataset y salida.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones fuera de distribución ante escenas distintas de las del dataset, con consecuencias físicas potenciales.
- Sesgos: no hay información sobre la composición del dataset (variedad de objetos, iluminación, posiciones), por lo que no se pueden caracterizar sesgos de distribución.
- Uso en producción: no recomendado sin una evaluación propia en el montaje objetivo y sin medidas de seguridad física (paradas de emergencia, límites de velocidad y de par).
- Trazabilidad: la fecha de creación registrada es 2026-09-19, con 19 descargas y 0 likes, lo que indica una validación comunitaria prácticamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-movement-reversal-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Tokenizer referenciado: https://huggingface.co/google/paligemma-3b-pt-224
- Implementación de entrenamiento citada: `RLWRLD/hiwrld-ll-policy` (referencia textual en la model card; no se proporciona URL)
- Manifiesto de artefacto con tamanos y hashes SHA-256: `artifact_manifest.json` en la raíz del repositorio
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación)
