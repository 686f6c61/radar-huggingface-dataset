# Ethanliang99/Zoom-IQA-7B

## Resumen

Zoom-IQA-7B es un modelo multimodal de evaluación de calidad de imagen sin referencia (no-reference image quality assessment, NR-IQA) desarrollado por el equipo de Guoqiang Liang, Jianyi Wang, Zhonghua Wu, Shangchen Zhou y Chen Change Loy, en colaboración con la Universidad de Hong Kong y otras instituciones. El modelo parte del checkpoint Qwen/Qwen2.5-VL-7B-Instruct y se fine-tunea específicamente para la tarea de puntuar la calidad percibida de una imagen mediante un proceso de razonamiento en dos rondas con atención regional (region-aware reasoning). Su relevancia radica en que aborda una limitación clásica de los modelos NR-IQA: la falta de fiabilidad en regiones pequeñas o detalladas de la imagen, que suelen ser las que más afectan a la percepción humana.

La arquitectura es la de un transformer multimodal basado en el encoder de visión de Qwen2.5-VL, con un total de 8.292.166.656 parámetros (el checkpoint base de 7B más el overhead del encoder visual y el projector). El modelo se distribuye con pesos en formato safetensors, bajo licencia Apache 2.0, y se publica como una versión open source mejorada entrenada en 8 GPUs NVIDIA H200 para lograr una mayor generalización. La longitud de contexto no se documenta en la ficha, aunque hereda la ventana de 24.000 tokens del modelo base Qwen2.5-VL-7B-Instruct. El repositorio incluye únicamente los pesos de inferencia; los datos de entrenamiento se publican por separado en el repositorio compañero GR-IQA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen2.5-VL-7B-Instruct, con encoder de visión y projector |
| Parámetros totales | 8.292.166.656 |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No documentada (heredada del base: 24.000 tokens) |
| Tipos de cuantización | No documentados (pesos en fp16/bf16, safetensors) |
| Idiomas soportados | No documentados (el base soporta inglés, chino y otros; el fine-tune no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Zoom-IQA-7B es un fine-tune del modelo Qwen2.5-VL-7B-Instruct, que combina un transformer de lenguaje (Qwen2.5) con un encoder de visión (ViT) y un proyector de características visuales. La innovación principal del modelo es su protocolo de inferencia en dos rondas: en la primera ronda, el modelo genera un razonamiento global sobre la calidad de la imagen y, en la segunda, se centra en regiones específicas que han sido detectadas como críticas (por ejemplo, áreas con desenfoque, ruido o artefactos), produciendo una puntuación final más fiable. Este enfoque de "región-aware reasoning" se entrena con datos del conjunto GR-IQA, que incluye anotaciones de calidad a nivel de región.

El entrenamiento se realizó en 8 GPUs NVIDIA H200, y la versión publicada es una mejora del modelo original del paper (arXiv:2601.02918) con mayor capacidad de generalización. No se documentan detalles sobre el dataset de entrenamiento (número de tokens, composición) ni sobre el uso de RLHF o DPO; el modelo se fine-tunea mediante aprendizaje supervisado sobre anotaciones de calidad. El repositorio incluye un evaluador oficial (zoomiqa-score) que implementa los prompts, el enrutamiento de recortes, el parseo de respuestas y las métricas de evaluación usadas en el paper.

## Capacidades

- Evaluación de calidad de imagen sin referencia: el modelo puntúa la calidad percibida de una imagen sin necesidad de una imagen de referencia.
- Razonamiento regional: analiza regiones específicas de la imagen y proporciona justificaciones textuales sobre los defectos detectados (desenfoque, ruido, compresión, etc.).
- Generación de texto en formato natural: responde con texto explicativo y puntuaciones numéricas en un formato estructurado.
- Capacidades multimodales heredadas: al basarse en Qwen2.5-VL, conserva capacidades de comprensión visual general (OCR, detección de objetos, descripción de escenas), aunque el fine-tune está especializado en calidad de imagen.
- Soporte de tool calling: no documentado; el modelo se usa principalmente con el evaluador oficial, que gestiona los prompts y el parseo.
- Capacidades de agente y multi-step reasoning: no aplica en el uso previsto; el razonamiento en dos rondas es un protocolo fijo del evaluador, no una capacidad general de agente.

## Casos de uso

- Control de calidad en producción fotográfica: un estudio fotográfico puede integrar el modelo en su pipeline para detectar automáticamente imágenes con desenfoque, ruido o aberraciones, puntuando cada imagen y priorizando la revisión humana de las que obtienen peores notas.
- Moderación de contenido visual: en plataformas de subida de imágenes, el modelo puede filtrar imágenes de baja calidad (borrosas, comprimidas, mal iluminadas) antes de su publicación, reduciendo la carga de moderación manual.
- Evaluación de sistemas de compresión de imágenes: un equipo de desarrollo de códecs puede usar el modelo para comparar la calidad percibida de las imágenes comprimidas con diferentes algoritmos (JPEG, WebP, AVIF) sin necesidad de referencias originales.
- Selección de imágenes en bases de datos de entrenamiento: en proyectos de visión artificial, el modelo puede puntuar la calidad de las imágenes de un dataset y descartar aquellas que degradan el rendimiento del modelo (borrosas, mal expuestas, etc.).
- Análisis de calidad en fotografía de stock: plataformas como bancos de imágenes pueden automatizar la revisión de las fotos subidas por los usuarios, proporcionando una puntuación previa que oriente a los editores humanos.
- Investigación en percepción visual: laboratorios de visión por computadora pueden usar el modelo como oráculo de calidad para generar etiquetas automáticas en experimentos de aprendizaje, por ejemplo, para entrenar otros modelos de mejora de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta tablas de rendimiento en la model card ni en el repositorio de HuggingFace. El paper asociado (arXiv:2601.02918) contiene datos de evaluación en conjuntos estándar de IQA como KonIQ-10k, SPAQ o NIQE, pero no están reproducidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.29B parámetros. En precisión fp16, los pesos ocupan aproximadamente 16.6 GB, por lo que se necesita al menos 20 GB de VRAM para inferencia en batch pequeño (con overhead de activaciones).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) con cuantización de 4-bit (GGUF) para caber en 24 GB. El entrenamiento del modelo se realizó en H200, pero la inferencia es viable en GPUs de gama alta para consumo.
- En consumer GPU: sí, con cuantización. Con GGUF Q4_K_M (~5-6 GB), se puede ejecutar en una RTX 3060 de 12 GB, aunque con menor precisión. La versión fp16 completa requiere al menos 24 GB (RTX 3090/4090).
- Opciones de despliegue: el evaluador oficial usa Transformers; también se proporciona un entrypoint `zoomiqa-eval-vllm` para inferencia más rápida con vLLM. No se documenta soporte para llama.cpp u Ollama, pero al ser un modelo de la familia Qwen, es probable que se pueda convertir a GGUF.
- Latencia y throughput: no documentados. En una A100, se estima una latencia de 1-3 segundos por imagen (incluyendo el proceso de dos rondas y el parseo), pero este dato no es oficial.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. No se pueden comparar con otros modelos NR-IQA como Q-Align, LIQA o MUSIQ, ya que no se han incluido resultados de benchmarks ni especificaciones de estos modelos en el contexto. El único punto de referencia es el modelo base Qwen2.5-VL-7B-Instruct, que no está especializado en calidad de imagen y no dispone de protocolo de razonamiento regional. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sesgos y generalización**: el modelo está entrenado con datos sintéticos y anotaciones de calidad específicas del conjunto GR-IQA; su rendimiento en dominios fuera de estos datos (imágenes médicas, imágenes satelitales, etc.) puede degradarse.
- **Alucinación y salidas malformadas**: el modelo puede generar respuestas malformadas o inconsistentes en la puntuación, como se advierte en la model card. El evaluador oficial incluye mecanismos de parseo y validación para mitigarlo.
- **Dependencia del prompt y configuración**: los resultados cambian con el prompt, la configuración de decoding, el preprocesado de la imagen o la versión del runtime. Esto puede llevar a conclusiones no reproducibles si se modifica el protocolo.
- **Contexto limitado**: aunque el base soporta 24K tokens, el modelo no documenta su longitud de contexto efectiva para el uso IQA; en la práctica, se procesa una única imagen por consulta, por lo que no es un limitación real.
- **Uso restringido**: la licencia Apache 2.0 permite uso comercial, pero las imágenes de los datasets (GR-IQA y las de benchmark) conservan sus licencias originales, por lo que no se pueden redistribuir libremente.
- **No apto para decisiones de alto riesgo**: el modelo está pensado para investigación y tareas de evaluación de calidad, no para tomar decisiones críticas (por ejemplo, diagnóstico médico o control de calidad industrial en producción) sin supervisión humana.

## Enlaces

- HuggingFace: https://huggingface.co/Ethanliang99/Zoom-IQA-7B
- Paper: https://arxiv.org/abs/2601.02918
- Página del proyecto: https://ethanliang99.github.io/ZOOMIQA-Projectpage/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de datos GR-IQA (no enlazado directamente, mencionado en la model card)
