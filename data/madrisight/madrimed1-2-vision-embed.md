# madrisight/madrimed1.2-vision-embed

## Resumen

Madrimed 1.2 Vision Embed es un codificador visual (vision encoder) aislado, desarrollado por madrisight, diseñado para extraer representaciones densas de imágenes médicas y radiológicas (TC, RM, rayos X y otras modalidades). Proyecta imágenes de resolución dinámica en un espacio de embeddings de 2048 dimensiones normalizado en L2, pensado para alineación multimodal y para la construcción de grafos de recuperación aumentada (Graph RAG). Con 406.957.056 parámetros, es un modelo compacto orientado exclusivamente a la extracción de características, no a la generación de texto.

El modelo se basa en una arquitectura de tipo Vision Transformer (ViT) con un módulo de fusión de parches (*patch merging*) que comprime la rejilla espacial mediante una proyección lineal 2×2, y se distribuye a través de la clase `Qwen3VLVisionModel` de transformers. Su función principal es servir como torre visual dentro de un pipeline multimodal: combinado con el modelo de texto `madrisight/madrimed1.2-text-embed`, permite la recuperación semántica de imágenes médicas mediante consultas en lenguaje natural.

Su relevancia actual radica en el auge de los sistemas de Graph RAG aplicados a dominios clínicos, donde la recuperación de casos similares (CBIR) y la indexación visual en sistemas PACS requieren representaciones robustas y ligeras. Al publicarse bajo licencia Apache 2.0 y con un tamaño de repositorio de 1,6 GB, es desplegable en infraestructura moderada, aunque su alcance está estrictamente limitado a tareas de recuperación y agrupamiento, no a diagnóstico autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con patch-merging projection (Qwen3-VL vision tower) |
| Parametros totales | 406.957.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (resolución de imagen dinámica; no aplica contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32 en los ejemplos; safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer aislado que actúa como torre de representación visual. Las imágenes de resolución dinámica se dividen en parches y se procesan mediante atención, tras lo cual un módulo de *patch merging* aplica una compresión espacial 2×2 mediante proyección lineal, reduciendo el número de tokens visuales. La salida se proyecta a una dimensión de características de 2048, coincidente con la dimensión de entrada de modelos de lenguaje transformer, y se normaliza en L2. La geometría de características resultante está dominada por la modalidad: el espacio agrupa principalmente los escaneos según la física de imagen y el contraste tisular.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un codificador de características). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La model card sí destaca una consideración técnica relevante: el espacio visual presenta anisotropía, por lo que recomienda aplicar centrado de media o corrección de hubness antes de umbralizar similitudes coseno estáticas, para evitar la formación de nodos *hub* de alto grado en los grafos.

## Capacidades

- Extracción de características visuales densas de imágenes médicas en un espacio de 2048 dimensiones normalizado en L2.
- Procesamiento de imágenes de resolución dinámica (rayos X, TC, RM y otras modalidades radiológicas).
- Generación de embeddings para indexación visual y construcción de grafos de vecinos más cercanos (k-NN) por similitud coseno.
- Recuperación multimodal imagen-texto cuando se combina con `madrisight/madrimed1.2-text-embed`, permitiendo consultas textuales sobre un corpus de imágenes.
- Soporte de recuperación basada en contenido (CBIR) para razonamiento basado en casos.
- Integración en pipelines de Graph RAG mediante la librería `metalliger`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un codificador de características.
- Capacidad multilingüe limitada al inglés (`en`) en lo que respecta a la alineación con el modelo de texto asociado.

## Casos de uso

- Indexación visual en Graph RAG clínico: el modelo genera embeddings de 2048 dimensiones para cada estudio, que se conectan en un grafo k-NN por similitud coseno; esto permite recuperar subgrafos de contexto relevantes ante una consulta, tal como muestra el ejemplo de la model card con `query_graph_rag_pure`.
- Recuperación de casos radiológicos similares: dado un estudio de un paciente, el codificador permite identificar escaneos visual y estructuralmente parecidos dentro de una cohorte, apoyando el razonamiento basado en casos en entornos clínicos.
- CBIR en sistemas PACS hospitalarios: integrado en el archivo de imágenes, permite búsquedas por contenido visual para localizar estudios previos con patrones de imagen comparables, sin depender de metadatos textuales.
- Búsqueda multimodal texto-a-imagen: combinado con el modelo de texto asociado, un radiólogo puede formular una consulta en lenguaje natural y recuperar las imágenes médicas semánticamente más próximas del archivo.
- Agrupamiento y análisis de cohortes: los embeddings permiten agrupar estudios por modalidad y contraste tisular, facilitando la organización de grandes volúmenes de imágenes para estudios retrospectivos o control de calidad de datasets.
- Construcción de bases de conocimiento médico estructuradas: los grafos de similitud generados sirven como base topológica para sistemas de recomendación de casos o para enriquecer ontologías clínicas con relaciones visuales.
- Preprocesamiento para pipelines de visión-lenguaje: al coincidir la dimensión de salida (2048) con la entrada de modelos de lenguaje, puede actuar como torre visual en arquitecturas multimodales que requieran un codificador médico especializado y ligero.

## Benchmarks y rendimiento

La model card menciona una evaluación empírica mediante cohortes médicas multi-órgano estratificadas y enlaza un cuaderno de evaluación (`embedding_vision_graphrag.ipynb`), pero no se publican cifras numéricas de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 406,9 M de parámetros en float32 (como en el ejemplo de la model card), los pesos ocupan aproximadamente 1,6 GB; el uso total de VRAM depende del tamaño de lote y de la resolución de las imágenes procesadas, que es dinámica.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para lotes pequeños en float32; GPU de datacenter (A100, H100) para indexación masiva por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores, dado el reducido tamaño del modelo.
- Opciones de despliegue: transformers (`Qwen3VLVisionModel` con `AutoProcessor`), con soporte de `trust_remote_code`; el ejemplo oficial usa CUDA, MPS o CPU. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el ejemplo de la model card registra latencias por imagen (`latencies`) durante la construcción del grafo, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo pertenece a la categoría de codificadores visuales médicos para recuperación, pero no se han facilitado datos de alternativas como BiomedCLIP u otros encoders radiológicos que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| madrimed1.2-vision-embed | 406,9 M | no disponible | apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una herramienta de diagnóstico: produce representaciones vectoriales para recuperación y agrupamiento; no sustituye la revisión de un radiólogo certificado ni emite determinaciones diagnósticas autónomas.
- Anisotropía del espacio visual: los embeddings requieren centrado de media o corrección de hubness antes de aplicar umbrales coseno estáticos, para evitar la formación de nodos hub de alto grado que distorsionen los grafos.
- Idiomas: el modelo está etiquetado únicamente para inglés (`en`); la alineación con consultas en otros idiomas depende del modelo de texto asociado y no está garantizada.
- Sesgos: no se documentan análisis de sesgo por subgrupos demográficos, modalidad o institución; los datasets médicos de entrenamiento pueden introducir sesgos de representación que afecten a la recuperación en poblaciones subrepresentadas.
- Riesgo de alucinación: no aplica generación de texto, pero la recuperación puede devolver casos visualmente similares que no sean clínicamente equivalentes; la similitud de embedding no implica equivalencia diagnóstica.
- Licencia Apache 2.0: permite uso comercial, pero el despliegue en entornos clínicos puede estar sujeto a regulaciones sanitarias (por ejemplo, marcado CE o aprobación FDA) que exceden la licencia del modelo.
- Dependencia de la librería `metalliger` y de `trust_remote_code`: el ejemplo oficial requiere instalar desde GitHub y ejecutar con código remoto de confianza, lo que añade superficie de riesgo en producción.
- Alcance limitado: no soporta generación, tool calling ni razonamiento; cualquier flujo que requiera estas capacidades debe combinarse con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/madrisight/madrimed1.2-vision-embed
- Modelo de texto asociado: https://huggingface.co/madrisight/madrimed1.2-text-embed
- Repositorio de la librería metalliger: https://github.com/krrish-v/metalliger
- Cuaderno de evaluación de embeddings: https://github.com/krrish-v/all_huggingface/blob/main/embedding_model_evaluation/embedding_vision_graphrag.ipynb
- Repositorio de recursos e imágenes: https://github.com/krrish-v/all_huggingface
