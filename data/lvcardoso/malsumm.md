# lvcardoso/Malsumm

## Resumen

MALSumm (Memory-Augmented Long Short-Term Memory for Dynamic Video Summarization) es un modelo de aprendizaje profundo supervisado diseñado para la generación automática de resúmenes de vídeo dinámico. Ha sido desarrollado por el grupo de investigación IMScience-PPGINF-PucMinas, con autoría principal de lvcardoso (Cardoso et al.), y se presenta como una extensión de las redes Extended Long Short-Term Memory (xLSTM). Su objetivo es seleccionar los fotogramas más relevantes de un vídeo para producir un resumen condensado que conserve la información esencial y mantenga la coherencia temporal.

El modelo introduce una arquitectura de doble vía (dual-path) que integra memoria ponderada para evaluar tanto información local (detalles finos) como global (consistencia temporal). Esto permite superar limitaciones de modelos anteriores basados en LSTM estándar, que tienden a perder contexto a largo plazo o a ignorar variaciones dinámicas en la secuencia de vídeo. MALSumm se enmarca en el campo de la visión por computador y el resumen automático de vídeo, un área relevante para aplicaciones como vigilancia, análisis de deportes, revisión de contenido multimedia y compresión de vídeo.

La ficha se basa exclusivamente en la información disponible en HuggingFace y en los resultados de búsqueda web. El repositorio de HuggingFace no incluye pesos del modelo ni documentación técnica detallada; la mayor parte de la información procede del paper académico y del código fuente en GitHub. Por tanto, muchos parámetros técnicos específicos (número de parámetros, contexto, cuantización, etc.) no están disponibles públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Extended LSTM (xLSTM) con diseño de doble vía y memoria ponderada (dual-path) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa secuencias de vídeo, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada multimodal: vídeo, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio HuggingFace no contiene pesos; el código fuente está en GitHub) |

## Arquitectura y entrenamiento

MALSumm se basa en redes Extended Long Short-Term Memory (xLSTM), una variante de las LSTM clásicas que mejora la capacidad de memoria a largo plazo. La arquitectura propuesta integra dos bloques recurrentes novedosos: uno dedicado a retener información esencial (memoria a largo plazo) y otro orientado a aprender nuevos patrones temporales (memoria a corto plazo). Este diseño de doble vía permite al modelo evaluar simultáneamente la relevancia local de cada fotograma y la coherencia global de la secuencia, ponderando la memoria para equilibrar ambos aspectos.

El entrenamiento es supervisado: el modelo aprende a predecir la importancia de cada fotograma (score de relevancia) a partir de vídeos etiquetados con resúmenes de referencia. El criterio de selección del mejor modelo se basa en el post-procesamiento de las pérdidas calculadas durante las épocas de entrenamiento, lo que permite elegir automáticamente la época óptima sin necesidad de validación manual. No se han publicado detalles sobre el tamaño del dataset, el número de tokens (fotogramas) procesados ni el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Resumen automático de vídeo dinámico: selecciona los fotogramas más representativos de una secuencia de vídeo para generar un resumen condensado.
- Procesamiento de información temporal a largo plazo: gracias a la arquitectura xLSTM con memoria aumentada, puede manejar secuencias largas sin perder contexto.
- Equilibrio entre detalle local y consistencia global: la memoria ponderada permite preservar detalles finos mientras mantiene la coherencia temporal del resumen.
- Aprendizaje supervisado: requiere etiquetas de importancia por fotograma durante el entrenamiento.
- Extensibilidad: el código fuente está disponible en GitHub, lo que permite adaptarlo a otros conjuntos de datos o tareas de resumen de vídeo.

## Casos de uso

- Vigilancia y seguridad: resumir grabaciones de cámaras de seguridad para identificar eventos relevantes (movimientos, intrusiones) sin revisar horas de metraje. MALSumm puede procesar secuencias largas y extraer los momentos clave.
- Análisis deportivo: generar resúmenes automáticos de partidos o competiciones seleccionando las jugadas más importantes, útil para periodistas o aficionados.
- Revisión de contenido multimedia: resumir vídeos largos (conferencias, tutoriales, webinars) para que los usuarios obtengan una vista rápida de los puntos esenciales.
- Compresión de vídeo: pre-selección de fotogramas clave para reducir el tamaño de almacenamiento o facilitar la indexación y búsqueda en bases de datos de vídeo.
- Automatización de edición: ayudar a editores de vídeo a identificar segmentos relevantes para crear trailers o resúmenes promocionales.
- Sistemas de recomendación de vídeo: extraer miniaturas o fragmentos representativos para mostrar en interfaces de usuario.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El paper menciona comparaciones con métodos state-of-the-art y reporta valores de F-score (por ejemplo, en la Tabla 1 del artículo de ScienceDirect se comparan los F-scores de MALSumm y su extensión MUSL-MALSumm con otros métodos), pero no se incluyen cifras concretas en los resúmenes accesibles. Por tanto, no es posible presentar una tabla de resultados sin inventar datos.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de hardware para MALSumm en las fuentes consultadas.
- Al ser una arquitectura basada en LSTM, es probable que pueda ejecutarse en GPUs de consumo medio (por ejemplo, NVIDIA GTX 1080 Ti o RTX 2080) para inferencia, y en GPUs de mayor capacidad (A100, V100) para entrenamiento con datasets grandes, pero esto es una estimación general no confirmada.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, etc.) porque no es un modelo de lenguaje; el código fuente en GitHub incluye scripts de evaluación y entrenamiento que probablemente usan PyTorch o TensorFlow, pero no se detalla.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de resumen de vídeo. Existen alternativas conocidas como SUM-FCN, vsLSTM, o DR-DSN, pero no se tienen métricas comparables en la información proporcionada. Se recomienda consultar el paper original para obtener la tabla de comparación de F-scores.

## Limitaciones y advertencias

- No se han publicado los pesos del modelo en HuggingFace; el repositorio solo contiene metadatos y licencia. Para usar el modelo, es necesario entrenarlo desde cero con el código del GitHub.
- El modelo está diseñado específicamente para resumen de vídeo dinámico supervisado; no es aplicable a tareas de lenguaje natural ni a otros dominios sin adaptación.
- Depende de la calidad de las etiquetas de entrenamiento; si los datos de entrenamiento contienen sesgos (por ejemplo, sobre-representación de ciertos tipos de vídeo), el resumen generado puede verse afectado.
- No se han documentado limitaciones sobre alucinación o sesgos, ya que no es un modelo generativo de texto.
- La licencia MIT permite uso comercial y modificación, pero el usuario debe verificar que los datos de entrenamiento utilizados cumplan con sus propias restricciones de propiedad intelectual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lvcardoso/Malsumm
- Código fuente en GitHub: https://github.com/IMScience-PPGINF-PucMinas/MALSumm
- Paper (PDF): http://sibgrapi.sid.inpe.br/col/sid.inpe.br/sibgrapi/2025/09.12.20.06/doc/cardoso_111_inpe.pdf
- Paper en IEEE: https://ieeexplore.ieee.org/abstract/document/11223357
- Paper en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S0167865526002515
- Semantic Scholar: https://www.semanticscholar.org/paper/Memory-Augmented-Long-Short-Term-Memory-for-Dynamic-Cardoso-Soraggi/e722e14f92fdb1a403a30180996c64aac6f00a2e/figure/4
