# 3CTeam/pi05_base_native_frozen_vlm_libero10_quantiles_15k

## Resumen

π₀.₅ (Pi05) es un modelo de Vision-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos, es decir, a ejecutar tareas de manipulación robótica en escenarios y objetos que no aparecen en el conjunto de entrenamiento. El repositorio analizado, `3CTeam/pi05_base_native_frozen_vlm_libero10_quantiles_15k`, publicado por el usuario 3CTeam, es un ajuste fino (fine-tuning) del checkpoint base de π₀.₅ realizado con la implementación de LeRobot, que a su vez adapta el repositorio OpenPI del autor original.

El checkpoint tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) almacenados en safetensors, con un tamaño de repositorio de 9,4 GB, lo que sugiere pesos en bfloat16 o fp16 sin cuantizar. Según el nombre del repositorio, el entrenamiento se ha realizado sobre el conjunto de datos LIBERO-10 en su variante de imagen, con el codificador visual-lenguaje congelado (`frozen_vlm`) y con normalización por cuantiles de las acciones (`quantiles`), durante 15.000 pasos (`15k`). Se distribuye bajo licencia Apache 2.0.

Su relevancia radica en que los VLA de código abierto con pesos publicados son escasos, y este checkpoint permite reproducir y evaluar una política π₀.₅ sobre un benchmark estándar de manipulación como LIBERO sin partir de cero. El modelo está pensado como política de control (entrada: observaciones visuales y consigna de lenguaje; salida: acciones motoras), no como un modelo generativo de texto de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Acción (VLA) basada en la familia π₀.₅ de Physical Intelligence; implementación LeRobot / OpenPI |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, presumiblemente bfloat16/fp16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline declarado | robotics |
| Dataset de ajuste | lerobot/libero_10_image |
| Pasos de entrenamiento declarados | 15.000 (según el nombre del repositorio) |
| Variante | base, VLM congelado, normalización de acciones por cuantiles |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo como un VLA de la familia π₀.₅, desarrollado por Physical Intelligence, y señala que la implementación empleada es la de LeRobot, adaptada desde el repositorio OpenPI del propio autor. Los VLA de esta familia combinan un codificador visual y un modelo de lenguaje que procesan imágenes y la instrucción en lenguaje natural, junto con un módulo especializado que genera secuencias de acciones motoras. El nombre del repositorio indica que en este ajuste el bloque de visión-lenguaje se mantiene congelado (`native_frozen_vlm`), de modo que el entrenamiento actualiza únicamente el cabezal o experto de acciones. Los detalles concretos de la arquitectura interna (número de capas, tipo de atención, dimensión oculta, mecanismo exacto de generación de acciones) no se detallan en la información proporcionada y se marcan como no disponibles.

En cuanto a los datos, el entrenamiento se realizó sobre `lerobot/libero_10_image`, un conjunto de demostraciones de manipulación del benchmark LIBERO con observaciones de imagen. El nombre del checkpoint indica además el uso de normalización de acciones basada en cuantiles, un esquema habitual para estabilizar la predicción de acciones continuas cuando la distribución de las mismas está sesgada o contiene valores atípicos. No se especifican en la información disponible el número total de tokens o de muestras vistas, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otros métodos de alineación; tampoco se documentan innovaciones técnicas adicionales más allá de las propias de la familia π₀.₅.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones motoras a partir de observaciones visuales y de una instrucción en lenguaje natural.
- Generalización en entornos abiertos: la familia π₀.₅ se presenta explícitamente como un paso adelante respecto a π₀ en cuanto a generalizar a entornos y situaciones no vistos durante el entrenamiento.
- Procesamiento conjunto de visión y lenguaje: el componente VLM interpreta la escena (imágenes de cámara) junto con la consigna textual de la tarea.
- Ejecución de tareas de manipulación de horizonte largo: el ajuste sobre LIBERO-10 apunta a tareas compuestas con múltiples fases.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación o recogida de datos con `lerobot-record`.
- Salida de acciones continuas con normalización por cuantiles, lo que facilita el control en espacios de acción con distribuciones no gaussianas.
- Soporte de tool calling: no disponible (no es una capacidad propia de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingües: no disponibles; no se especifican los idiomas cubiertos por el componente de lenguaje.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Evaluación de políticas VLA sobre benchmarks estandarizados: el checkpoint está entrenado sobre LIBERO-10, por lo que sirve como punto de partida para medir tasas de éxito en tareas de manipulación del benchmark y comparar variantes de ajuste.
- Investigación en generalización de robots: al ser un ajuste de π₀.₅ con el VLM congelado, permite estudiar cuánta capacidad de generalización aporta únicamente el experto de acciones sin reentrenar el bloque de visión-lenguaje.
- Ablaciones sobre esquemas de normalización de acciones: la variante `quantiles` facilita comparar la normalización por cuantiles frente a alternativas (media/desviación típica, min-max) en el mismo punto de partida.
- Reproducción de experimentos con LeRobot: cualquier laboratorio con un brazo tipo SO-100/SO-101 puede reproducir el entrenamiento y la inferencia siguiendo los comandos de la model card (`lerobot-train`, `lerobot-record`) sin escribir código de integración adicional.
- Base para ajuste específico de tarea (fine-tuning posterior): al estar bajo Apache 2.0 y con pesos safetensors, se puede partir de este checkpoint para adaptarlo a un robot o conjunto de tareas propio con pocas horas de demostraciones.
- Sistemas de teleoperación asistida en laboratorio: ejecutar el modelo en lazo cerrado sobre demostraciones capturadas con `lerobot-record` de prefijo `eval_` para validar la política antes de desplegarla.
- Docencia y formación en robótica aprendida: el par dataset + checkpoint + herramienta de entrenamiento permite montar prácticas de aprendizaje por imitación con resultados medibles en pocas iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El nombre del repositorio hace referencia al conjunto LIBERO-10 y a 15.000 pasos de entrenamiento, pero la model card no incluye tasas de éxito ni comparaciones numéricas con π₀, π₀.₅ base u otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, los pesos en bfloat16 ocupan alrededor de 8,3 GB. Teniendo en cuenta activaciones, imágenes de entrada y el búfer de acciones, una estimación prudente de VRAM total se sitúa en el rango de 10 a 16 GB. Estas cifras son estimaciones de ingeniería derivadas del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 16 GB o más de memoria. Una RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB) o A100 (40/80 GB) son opciones holgadas; una RTX 4080 (16 GB) o A4000 (16 GB) quedan en el límite.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 4090, RTX 3090, RTX 4080 y modelos con 16 GB o más, siempre que se use bfloat16 y un tamaño de lote reducido. No se publican variantes cuantizadas, por lo que no se puede confirmar un despliegue en GPU de 8 GB.
- Opciones de despliegue: el flujo documentado es la librería `lerobot` (`lerobot-record` con `--policy.path` apuntando al checkpoint). No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp para este repositorio concreto, y al tratarse de una política de control con salida de acciones no es directamente compatible con los servidores de inferencia de texto habituales. La evaluación se realiza típicamente en local sobre el robot.
- Latencia y throughput: no disponibles. La viabilidad en tiempo real depende de la frecuencia de control del robot y del hardware, y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3CTeam/pi05_base_native_frozen_vlm_libero10_quantiles_15k | 4,14 mil millones | no disponible | VLA, manipulación (LIBERO-10) | Apache 2.0 | Pesos en HuggingFace |
| π₀.₅ base (Physical Intelligence) | no disponible en la información proporcionada | no disponible | VLA, generalización en entornos abiertos | no disponible en la información proporcionada | Referenciado vía OpenPI |
| π₀ (Physical Intelligence) | no disponible en la información proporcionada | no disponible | VLA, predecesor de π₀.₅ | no disponible en la información proporcionada | Referenciado vía OpenPI |
| Otras políticas del ecosistema LeRobot (por ejemplo ACT, difusión) | no disponible en la información proporcionada | no disponible | Control robótico por imitación | no disponible en la información proporcionada | Implementadas en LeRobot |

No se dispone de cifras verificables de rendimiento, contexto o licencia para las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada. La diferencia principal documentada es que este checkpoint es un ajuste específico sobre LIBERO-10 con el VLM congelado, frente al modelo base de propósito más general.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan. Al tratarse de un modelo entrenado sobre un dataset de manipulación concreto (LIBERO-10), hereda los sesgos de escenas, objetos, iluminación y morfología de robot presentes en ese conjunto.
- Riesgo de alucinación: no aplica en el sentido textual, pero existe riesgo de acciones incorrectas o incoherentes ante escenas fuera de la distribución de entrenamiento, especialmente al haberse congelado el VLM.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada ni los idiomas cubiertos. Las instrucciones en lenguaje natural distintas del inglés (idioma predominante en los datasets de robótica habituales) podrían degradar el rendimiento.
- Ausencia de variantes cuantizadas: solo se publican safetensors, lo que limita el despliegue en hardware con menos de 16 GB de VRAM.
- Naturaleza del modelo: no es un modelo de lenguaje de propósito general; no debe emplearse para generación de texto, código o razonamiento conversacional.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las licencias del dataset de entrenamiento (`lerobot/libero_10_image`) y de los componentes base de π₀.₅ publicados por Physical Intelligence, ya que pueden imponer condiciones adicionales.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmark publicados y sin documentación propia más allá de la plantilla de LeRobot. No hay evidencia pública de validación independiente.
- Fechas del repositorio: creado y actualizado en septiembre de 2026 según los metadatos, dato que conviene verificar directamente en la página del modelo.
- Advertencia sobre la búsqueda web: los resultados de búsqueda disponibles no guardan relación con este modelo y no aportan información técnica utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3CTeam/pi05_base_native_frozen_vlm_libero10_quantiles_15k
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/lerobot/libero_10_image
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
