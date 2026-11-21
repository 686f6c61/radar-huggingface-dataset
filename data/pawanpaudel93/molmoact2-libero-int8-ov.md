# pawanpaudel93/molmoact2-libero-int8-ov

## Resumen

MolmoAct2 LIBERO int8-ov es un paquete de política (policy package) para el motor `ov-policy` de Cascadia, derivado del modelo `allenai/MolmoAct2-LIBERO` de Ai2. Se trata de una conversión a OpenVINO con compresión de pesos a int8 del paquete original en fp16, pensada para ejecutar políticas de visión-lenguaje-acción (VLA) sobre CPUs y GPUs Intel. El modelo resuelve el problema de desplegar control robótico de extremo a extremo en hardware de consumo o servidor no especializado, sin necesidad de GPUs NVIDIA.

El modelo base es un VLA entrenado sobre el benchmark LIBERO, un conjunto de tareas de manipulación robótica. La arquitectura subyacente hereda de Molmo2-ER, cuyo backbone es Qwen3-4B-Instruct-2507, por lo que combina un modelo de lenguaje de 4 mil millones de parámetros con codificación visual para producir acciones motoras. El paquete acepta dos imágenes (vista principal y vista de muñeca), un vector de estado de 8 dimensiones y una descripción textual de la tarea, y devuelve una secuencia de 10 acciones de 7 dimensiones cada una.

Es relevante ahora porque permite evaluar y desplegar políticas VLA en infraestructura Intel estándar mediante OpenVINO, un paso hacia la portabilidad del control robótico. No obstante, el autor indica explícitamente que no se han medido ni la tasa de éxito en tareas ni la latencia en GPU para los pesos int8, y que el motor `ov-policy` aún no está incluido en una release estable de Cascadia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone Qwen3-4B-Instruct-2507 (heredado de Molmo2-ER) |
| Parametros totales | no disponible (modelo base derivado de Qwen3-4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (compresión de pesos sobre grafo fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO (policy package para motor `ov-policy`) |

## Arquitectura y entrenamiento

El paquete es una conversión del modelo `allenai/MolmoAct2-LIBERO` (revisión `0d24a92bd1faf321ef497c3bbd5681af97c65aa2`), que a su vez se apoya en Molmo2-ER y en el backbone Qwen3-4B-Instruct-2507. La arquitectura es un transformer multimodal de tipo VLA: procesa imágenes RGB de 378×378 píxeles (vista principal y vista de muñeca), un vector de estado del robot de 8 dimensiones y una cadena de texto con la tarea, y emite un tensor de acciones de forma [10, 7]. El entrenamiento específico se realizó sobre el benchmark LIBERO de manipulación robótica; los detalles sobre número de tokens, composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica de este paquete concreto es la conversión a OpenVINO con compresión de pesos a int8, que reduce el tamaño del repositorio a 5,0 GB y permite inferencia en CPUs y GPUs Intel. El paquete se sirve mediante el motor `ov-policy` (tipo `molmoact2`) de Cascadia, que no está todavía en una release publicada (el repositorio `labscommunity/cascadia` está en revisión). No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de extremo a extremo: genera secuencias de 10 acciones de 7 dimensiones a partir de observaciones visuales y estado del robot.
- Percepción visual multimodal: procesa simultáneamente una imagen principal y una imagen de muñeca, ambas de 3×378×378 en RGB uint8.
- Condicionamiento por lenguaje: acepta una descripción textual de la tarea (`task`) que guía la política de acción.
- Integración con estado proprioceptivo: consume un vector de estado de 8 dimensiones del robot.
- Ejecución en hardware Intel: soporte de CPU y GPU mediante OpenVINO.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de texto libre ni modos de razonamiento explícito; el modelo está especializado en acción motora.

## Casos de uso

- Evaluación de políticas VLA en laboratorio: servir el paquete con `cascadia run ./molmoact2-libero-int8-ov --engine ov-policy --device GPU` para reproducir tareas de LIBERO en un banco de pruebas con hardware Intel.
- Manipulación robótica en entornos con CPU: desplegar control de brazo robótico en estaciones sin GPU NVIDIA, aprovechando la compresión int8 y el runtime OpenVINO.
- Prototipado de agentes físicos: usar el modelo como política de bajo nivel en un pipeline de investigación que combine planificación de alto nivel con ejecución motora.
- Benchmarking de cuantización: comparar la tasa de éxito y la latencia del paquete int8 frente al paquete fp16 original para estudiar el impacto de la compresión en tareas de manipulación.
- Investigación en imitación visual: entrenar o ajustar políticas derivadas partiendo de este paquete como referencia de despliegue en OpenVINO.
- Educación y demostraciones: ejecutar políticas VLA en equipos de escritorio Intel para docencia o demostraciones de robótica, dado el tamaño contenido del repositorio (5,0 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la tasa de éxito en tareas y la latencia en GPU no se han medido para los pesos int8.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 5,0 GB en int8; se requiere memoria suficiente para cargar el grafo OpenVINO completo, aunque no se especifica el consumo en ejecución.
- GPU recomendadas: GPUs Intel (el paquete está diseñado para CPUs y GPUs Intel vía OpenVINO); no se documentan requisitos para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada para GPUs NVIDIA; el soporte declarado es para hardware Intel.
- Opciones de despliegue: motor `ov-policy` de Cascadia (`cascadia run ... --engine ov-policy --device GPU`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no medidos para int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pawanpaudel93/molmoact2-libero-int8-ov | no disponible (base Qwen3-4B) | no disponible | OpenVINO int8 | Apache-2.0 | Paquete de política para Cascadia `ov-policy`; sin métricas de éxito ni latencia |
| allenai/MolmoAct2-LIBERO | no disponible (base Qwen3-4B) | no disponible | no disponible | Apache-2.0 | Modelo original en fp16 del que deriva este paquete |
| allenai/Molmo2-ER | no disponible (backbone Qwen3-4B) | no disponible | no disponible | Apache-2.0 | Modelo base del que hereda la arquitectura MolmoAct2 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sin verificación empírica: la tasa de éxito en tareas y la latencia en GPU no se han medido para los pesos int8, por lo que se desconoce la degradación frente al fp16.
- Dependencia de software no estable: el motor `ov-policy` de Cascadia no está en una release publicada; se requiere una build con ese tipo de política (repositorio en revisión).
- Especialización estrecha: el modelo está entrenado para tareas de manipulación del benchmark LIBERO; su generalización a otros entornos y morfologías robóticas no está documentada.
- Idiomas: no se especifican los idiomas soportados para la descripción textual de la tarea.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un modelo de lenguaje (Qwen3-4B) puede heredar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: no evaluado en el contexto de generación de acciones; la política podría producir acciones inválidas fuera de la distribución de entrenamiento.
- Restricciones de uso: licencia Apache-2.0, pero Ai2 declara que MolmoAct2 está destinado a "investigación y uso educativo" conforme a sus Responsible Use Guidelines; conviene revisar dichas directrices antes de un despliegue comercial.
- Atribución: el paquete incluye un fichero `NOTICE` que acredita a Ai2 y declara los cambios realizados; debe conservarse en redistribuciones.

## Enlaces

- Hugging Face: https://huggingface.co/pawanpaudel93/molmoact2-libero-int8-ov
- Modelo base: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Modelo base del backbone: https://huggingface.co/allenai/Molmo2-ER
- Repositorio de código de MolmoAct2: https://github.com/allenai/molmoact2
- Repositorio de Cascadia: https://github.com/labscommunity/cascadia
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
