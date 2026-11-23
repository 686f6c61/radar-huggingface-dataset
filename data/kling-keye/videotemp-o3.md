# Kling-Keye/VideoTemp-o3

## Resumen

VideoTemp-o3 es un modelo multimodal de tipo video-text-to-text desarrollado por Kling-Keye (equipo vinculado a Kwai/Keye) que aborda la comprensión de vídeo combinada con el anclaje temporal (temporal grounding) explícito. Se construye mediante fine-tuning sobre Qwen/Qwen2.5-VL-7B-Instruct, por lo que hereda la arquitectura de visión-lenguaje de la familia Qwen2.5-VL con aproximadamente 8.290 millones de parámetros totales. El modelo está diseñado para responder preguntas sobre vídeos localizando primero el segmento temporal relevante y refinándolo de forma iterativa antes de emitir la respuesta.

La propuesta central es un enfoque "agentic thinking-with-videos": en lugar de procesar el vídeo completo de forma pasiva, el modelo realiza un anclaje temporal bajo demanda, localiza el fragmento más pertinente y lo refina en pasos sucesivos hasta producir una respuesta fundamentada en la evidencia visual concreta. Esto lo diferencia de los modelos de vídeo-VQA convencionales que responden sin explicitar qué parte del vídeo sustenta la respuesta.

El modelo se publica con licencia MIT, pesos en safetensors y un repositorio de 16,6 GB, e incluye un dataset de SFT y RL (Kwai-Keye/VideoTemp-o3) y un benchmark propio (VideoTemp-Bench). Es relevante para investigadores y desarrolladores que necesitan sistemas de comprensión de vídeo con razonamiento multi-paso y localización temporal verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Qwen2.5-VL), fine-tuning sobre Qwen/Qwen2.5-VL-7B-Instruct |
| Parametros totales | 8.292.166.656 (~8,29 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | video-text-to-text |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Tamano del repositorio | 16,6 GB |

## Arquitectura y entrenamiento

VideoTemp-o3 parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar imágenes y vídeo junto con texto. Sobre esta base, Kling-Keye aplica un proceso de fine-tuning orientado a la comprensión de vídeo con anclaje temporal, entrenado con el dataset Kwai-Keye/VideoTemp-o3, que la model card describe como un conjunto de datos de SFT y RL.

La innovación técnica destacable es el pipeline agéntico de "thinking-with-videos": dado un par vídeo-pregunta, el modelo ejecuta un anclaje temporal bajo demanda para localizar el segmento más relevante, lo refina iterativamente y finalmente emite una respuesta fundamentada en la evidencia visual pertinente. Este esquema de razonamiento multi-paso sobre el eje temporal es el núcleo del trabajo descrito en el paper arXiv:2602.07801. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del proceso de RLHF/DPO.

## Capacidades

- Comprensión de vídeo y respuesta a preguntas (video question answering) en inglés.
- Anclaje temporal (temporal grounding): localización explícita del segmento de vídeo relevante para una pregunta dada.
- Razonamiento agéntico multi-paso sobre vídeo: localización, refinamiento iterativo del segmento y respuesta final fundamentada.
- Procesamiento conjunto de vídeo y texto (pipeline video-text-to-text).
- Capacidades heredadas de Qwen2.5-VL-7B-Instruct para comprensión visual y de lenguaje (no detalladas de forma específica en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Búsqueda y recuperación de momentos concretos en vídeo: el modelo localiza el segmento temporal que responde a una consulta, útil en herramientas de edición o archivística que necesitan señalar el instante exacto de un evento.
- Análisis de vídeo de vigilancia o monitorización: permite preguntar por eventos específicos y obtener la localización temporal de la evidencia, facilitando la revisión humana posterior.
- Indexación semántica de archivos audiovisuales: el anclaje temporal permite generar metadatos con marcas de tiempo que enlazan preguntas con fragmentos concretos del material.
- Asistentes de análisis de contenido deportivo o formativo: responder preguntas sobre acciones o explicaciones localizando el tramo relevante del metraje.
- Investigación en comprensión de vídeo: sirve como base para experimentos de razonamiento agéntico sobre vídeo y evaluación con VideoTemp-Bench.
- Moderación y revisión de contenido en vídeo: localizar y razonar sobre fragmentos específicos que puedan requerir revisión, apoyándose en la evidencia visual citada.
- Sistemas de preguntas y respuestas sobre grabaciones largas: el enfoque iterativo de localización y refinamiento reduce la dependencia de procesar el vídeo completo de una sola vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~8,29 mil millones de parámetros, en precisión completa (FP16/BF16) requiere aproximadamente 16-17 GB solo para los pesos, más el coste del codificador visual y de las activaciones (no cuantificado en la información disponible).
- En cuantización de 8 bits, la estimación rondaría los 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para despliegue en FP16/BF16 con margen; RTX 4090 (24 GB) es viable para FP16 en configuraciones ajustadas.
- GPU de consumo: cabe en GPUs consumer de gama alta con 24 GB (RTX 4090) en FP16, y en GPUs con 12-16 GB si se aplica cuantización.
- Opciones de despliegue: al estar basado en Qwen2.5-VL, es compatible con frameworks que soportan esa familia (por ejemplo vLLM, TGI o llama.cpp/Ollama para variantes cuantizadas), aunque la información disponible no confirma configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VideoTemp-o3 | ~8,29 mil millones | No disponible | Video-VQA con anclaje temporal agéntico | MIT | Hugging Face |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | ~8,3 mil millones | No disponible en esta ficha | Visión-lenguaje general (imagen y vídeo) | No disponible en esta ficha | Hugging Face |
| Alternativas de video-VQA de tamaño similar | No disponible | No disponible | Video comprensión sin anclaje temporal explícito | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y orientado a inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo de lenguaje y visión, puede generar respuestas no sustentadas en el vídeo, especialmente ante preguntas ambiguas o material de baja calidad.
- Anclaje temporal: la precisión de la localización temporal depende de la calidad del vídeo y de la formulación de la pregunta; no se documentan métricas de error temporal.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al heredar el modelo base, puede arrastrar sesgos presentes en Qwen2.5-VL-7B-Instruct y en sus datos de entrenamiento.
- Contexto: la longitud de contexto no está especificada, lo que limita la planificación para vídeos de larga duración.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-VL-7B-Instruct y de los datasets empleados.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente con escasa validación externa.
- Producción: no se documentan cuantizaciones oficiales ni guías de despliegue, lo que añade incertidumbre para entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kling-Keye/VideoTemp-o3
- Página del proyecto: https://liuwq-bit.github.io/VideoTemp-o3
- Paper (arXiv): https://arxiv.org/abs/2602.07801
- Repositorio de código: https://github.com/Kwai-Keye/VideoTemp-o3
- Dataset de SFT y RL: https://huggingface.co/datasets/Kwai-Keye/VideoTemp-o3
- Benchmark VideoTemp-Bench: https://huggingface.co/datasets/Kwai-Keye/VideoTemp-Bench
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
