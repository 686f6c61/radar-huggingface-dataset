# inclusionAI/ZoomGain-4B

## Resumen

ZoomGain-4B es un modelo de visión-lenguaje (VLM) de 4.539 millones de parámetros desarrollado por inclusionAI, derivado de la familia Qwen3.5-4B y afinado mediante aprendizaje por refuerzo (RL) sobre el conjunto de datos ZoomGain. El modelo está diseñado específicamente para cerrar la brecha de percepción "global-to-zoom": la diferencia entre lo que un VLM puede describir de una imagen completa y los detalles finos que solo se revelan al ampliar una región concreta. Para ello, el equipo construyó un pipeline de datos que genera preguntas sobre la imagen completa a partir de evidencias visuales extraídas de recortes ampliados, y entrenó el modelo con RL para que aprenda a fijarse en esos detalles.

La relevancia del modelo radica en su enfoque: en lugar de escalar el tamaño del modelo o el contexto, ZoomGain ataca un fallo concreto y medible de los VLM actuales en tareas de percepción fina (reconocimiento de atributos, conteo y OCR). El modelo se publica junto con un benchmark específico, ZoomGainBench (1.000 preguntas sobre 941 imágenes, en inglés y chino), y un conjunto de datos de RL de 9.000 registros, lo que permite reproducir el entrenamiento y evaluar la mejora de forma aislada.

La arquitectura subyacente es la de Qwen3.5-4B (tag `qwen3_5` en Hugging Face), un transformer multimodal con capacidades de razonamiento en modo thinking. El checkpoint se distribuye en formato safetensors con un tamaño de repositorio de 9,1 GB, lo que sugiere pesos en precisión alta (probablemente BF16) y la presencia de componentes de visión además del backbone lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-4B (tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se asume BF16 por el tamano de 9,1 GB) |
| Idiomas soportados | no disponible en la model card; el benchmark asociado cubre ingles y chino |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ZoomGain-4B parte de Qwen3.5-4B, un modelo de visión-lenguaje de la familia Qwen3.5, y se afina mediante aprendizaje por refuerzo sobre el dataset ZoomGain-RL-Data. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, tipo de encoder visual ni mecanismo de atención), pero el tag `qwen3_5` y el tamaño del repo (9,1 GB para 4.539 millones de parámetros) son consistentes con un transformer multimodal en BF16 con proyector visual incluido.

La innovación principal no está en la arquitectura sino en la construcción de la supervisión. El pipeline de ZoomGain tiene tres etapas: (1) anclaje del objetivo, donde varios modelos localizan de forma independiente una región descrita en la escena completa y su acuerdo identifica el recorte; (2) minería de evidencia, que compara descripciones de la misma región a dos escalas y convierte los detalles revelados por el recorte en preguntas sobre la imagen completa; y (3) verificación de preguntas y respuestas, que cruza las respuestas sobre el recorte, filtra preguntas ambiguas o resolubles sin imagen y genera distractores plausibles para ítems de opción múltiple. El entrenamiento por RL se realiza con EasyR1 (mencionado en la documentación de reproducibilidad) sobre 9.000 registros y 7.713 imágenes fuente, con una función de recompensa que usa las respuestas de referencia y metadatos del Parquet. La model card reporta resultados de RL para Qwen3.5-4B y Qwen3.5-9B sobre datos ZoomGain y ZwZ (tabla 3 del paper), pero no se incluyen los valores numéricos en el texto disponible.

## Capacidades

- Percepción visual fina: reconocimiento de atributos, conteo y OCR sobre detalles que requieren ampliar regiones de la imagen.
- Razonamiento visual guiado por evidencia: el modelo está entrenado para localizar y explotar regiones concretas de la imagen antes de responder.
- Respuesta a preguntas de opción múltiple sobre imágenes, con distractores diseñados para exigir percepción fina.
- Capacidades heredadas de Qwen3.5-4B: generación de texto, razonamiento y modo thinking (la evaluación por defecto desactiva el thinking de Qwen3.5, lo que implica que el modo existe).
- Soporte multilingüe en la evaluación: el benchmark asociado incluye preguntas en inglés y chino (`LANGUAGE=en`, `LANGUAGE=cn`, `LANGUAGE=all`).
- Integración con vLLM 0.19.1 y transformers 5.7.0 para inferencia y evaluación.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, audio ni decodificación especulativa.

## Casos de uso

- Inspección visual de documentos y formularios: el modelo puede leer texto en regiones pequeñas de un escaneo (OCR fino) y responder preguntas sobre campos concretos, aprovechando su entrenamiento en detalles que solo se ven al ampliar.
- Control de calidad en inventario y retail: conteo de productos y verificación de atributos (color, etiqueta, estado) en estanterías o imágenes de almacén, donde la precisión en objetos pequeños es crítica.
- Accesibilidad y descripción de imágenes: generación de descripciones que incluyen detalles finos relevantes para usuarios con discapacidad visual, no solo la escena global.
- Moderación y verificación de contenido visual: detección de elementos pequeños o poco visibles (marcas de agua, textos incrustados, objetos en segundo plano) que un VLM estándar pasaría por alto.
- Evaluación comparativa de VLM: uso de ZoomGainBench (1.000 preguntas, 941 imágenes, inglés y chino) como test de percepción fina para seleccionar modelos en un pipeline de producción.
- Investigación en RL para visión-lenguaje: reproducción del entrenamiento con ZoomGain-RL-Data (9.000 registros) y EasyR1 para estudiar cómo la supervisión global-to-zoom afecta a la percepción.
- Asistencia en tareas de diagnóstico visual asistido (con supervisión humana): revisión de imágenes técnicas donde hay que localizar componentes pequeños, siempre como apoyo y no como sustituto de un experto.

## Benchmarks y rendimiento

La model card indica que, en el paper, el mejor de 28 modelos evaluados alcanzó 61,08 en ZoomGainBench, y que ZoomGain-9B logró un rendimiento superior en múltiples benchmarks de percepción fina y general. Sin embargo, no se proporcionan en la información disponible los valores numéricos desglosados por modelo ni los resultados específicos de ZoomGain-4B.

| Benchmark | ZoomGain-4B | Notas |
|---|---|---|
| ZoomGainBench | no disponible en el texto | Mejor de 28 modelos: 61,08; resultados de RL en tabla 3 del paper (imagen, sin cifras en el texto) |
| Percepción fina (varios) | no disponible | La model card afirma que ZoomGain-9B supera a modelos comparables; no se dan cifras para 4B |
| Percepción general (varios) | no disponible | Ídem |

No se han publicado resultados de benchmarks con cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9-10 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo y procesamiento de imágenes, prever 12-16 GB.
- Cuantización: no se documentan GGUF ni AWQ en el repo; al ser safetensors, sería necesario convertir a otros formatos para reducir VRAM (no verificado).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación con `TP=2` y throughput alto; RTX 4090 (24 GB) es suficiente para inferencia en BF16 de una réplica.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y probablemente en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización no publicada.
- Despliegue: vLLM 0.19.1 (soporte oficial en la documentación de evaluación) y transformers 5.7.0. El script de evaluación soporta `GPUS=0,1` con `TP=1` (dos réplicas) o `TP=2` (una réplica con tensor parallelism).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZoomGain-4B | 4.539 M | no disponible | VLM con RL para percepción fina | no disponible | Hugging Face (safetensors) |
| ZoomGain-9B | no disponible en la informacion | no disponible | Misma familia, mayor tamano | no disponible | Hugging Face |
| Qwen3.5-4B (base) | ~4B | no disponible | VLM generalista | no disponible | Hugging Face |
| Qwen3.5-9B (base) | ~9B | no disponible | VLM generalista | no disponible | Hugging Face |

La comparativa se limita a la propia familia porque la información proporcionada no incluye datos de otros VLM de tamaño similar (p. ej., modelos de 4B de otras familias). No se dispone de cifras de rendimiento comparadas para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; hay que verificar el repo antes de desplegar en producción.
- Idiomas: la model card no declara idiomas soportados; el benchmark cubre inglés y chino, pero no hay garantía para otras lenguas.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar cargas con muchas imágenes o conversaciones largas.
- Riesgo de alucinación: como todo VLM, puede generar respuestas plausibles pero incorrectas, especialmente en preguntas de conteo u OCR con imágenes de baja resolución.
- Sesgos: no se documentan análisis de sesgos; el dataset de entrenamiento proviene de un pipeline automático con múltiples modelos, lo que puede heredar sesgos de esos modelos y de las imágenes fuente.
- Dependencia del modo thinking: la evaluación por defecto desactiva el thinking de Qwen3.5; el comportamiento con thinking activado no está documentado y podría alterar latencia y precisión.
- Madurez: el modelo se publicó el 2026-11-10 con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Reproducibilidad: el entrenamiento requiere EasyR1 y rutas locales de imágenes; no se documentan hiperparámetros completos en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/ZoomGain-4B
- Modelo hermano ZoomGain-9B: https://huggingface.co/inclusionAI/ZoomGain-9B
- Paper (arXiv): https://arxiv.org/abs/2611.14076
- Paper (HTML): https://arxiv.org/html/2611.14076v1
- Repositorio GitHub: https://github.com/inclusionAI/ZoomGain
- Benchmark ZoomGainBench: https://huggingface.co/datasets/inclusionAI/ZoomGainBench
- Datos de RL ZoomGain-RL-Data: https://huggingface.co/datasets/inclusionAI/ZoomGain-RL-Data
- Guía de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
