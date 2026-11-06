# ispras-crawlers/newsxlm-markuplm-ae

## Resumen

newsxlm-markuplm-ae es un modelo de clasificación de tokens (token classification) especializado en la extracción de atributos estructurados a partir de páginas HTML de noticias. Lo desarrolla el equipo ispras-crawlers del Instituto de Sistemas de Software de la Academia de Ciencias de Rusia (ISP RAS), y se presenta como la línea base (baseline) del conjunto de datos y paper NewsXLM. El modelo recibe el HTML de una noticia y etiqueta cada nodo del árbol DOM con una de seis categorías: `title`, `publication_date`, `text`, `author`, `tag` o `none`.

Se trata de un fine-tuning de `microsoft/markuplm-base`, un transformer que incorpora de forma nativa información estructural del HTML (etiquetas, atributos y XPath) además del texto. El resultado es un modelo de 134,6 millones de parámetros que resuelve un problema clásico de los pipelines de crawling y monitorización de medios: identificar automáticamente qué fragmento del HTML corresponde al titular, la fecha, el cuerpo, el autor o las etiquetas, sin depender de selectores CSS o XPath escritos a mano para cada medio.

Es relevante porque aborda el multilingüismo de forma directa: cubre diez idiomas (inglés, español, ruso, árabe, francés, portugués, croata, chino, alemán y coreano) y, a diferencia de otras variantes, procesa el HTML original sin traducirlo previamente al inglés. Su licencia MIT y su tamaño contenido lo hacen desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarkupLM (transformer con codificación de estructura HTML: etiquetas, atributos y XPath) |
| Parametros totales | 134.617.094 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en, es, ru, ar, fr, pt, hr, zh, de, ko |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/markuplm-base`, un transformer tipo BERT que añade a las embeddings de texto dos señales adicionales: embeddings de etiquetas HTML y embeddings de XPath. Esto permite que el modelo razone sobre la posición de cada nodo en el árbol DOM y sobre el tipo de elemento (por ejemplo, distinguir un `<h1>` de un `<div>`), lo que resulta determinante para tareas de extracción de atributos en páginas web.

El fine-tuning se realizó sobre el dataset NewsXLM, un corpus multilingüe de páginas de noticias anotadas a nivel de nodo HTML. Esta variante concreta ("ae", de attribute extraction) utiliza el HTML original sin traducirlo al inglés, a diferencia de otras variantes del mismo trabajo. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de una tarea de clasificación de tokens, lo habitual sería entrenamiento supervisado con entropía cruzada, pero este extremo no está confirmado en la documentación.

Una innovación técnica destacable es el soporte de granularidad de "tail": el texto que sigue a un elemento se clasifica por separado del texto propio del elemento, devolviéndose mediante el sufijo XPath estándar `/following-sibling::text()[1]`. Las rutas devueltas se refieren al DOM limpiado por el propio modelo.

## Capacidades

- Clasificación de nodos HTML en seis categorías: `title`, `publication_date`, `text`, `author`, `tag` y `none`.
- Extracción de atributos agrupados por categoría mediante el pipeline `extraction` (devuelve un diccionario con listas de valores por atributo).
- Clasificación nodo a nodo con probabilidades por clase mediante el pipeline `node-classification`.
- Soporte de granularidad de tail text (texto posterior a un elemento) con rutas XPath explícitas.
- Procesamiento multilingüe de HTML en diez idiomas sin traducción intermedia al inglés.
- Integración con la librería `transformers` mediante `trust_remote_code=True` (código personalizado incluido en el repositorio).
- No soporta generación de texto, razonamiento libre, código, matemáticas, visión, tool calling ni comportamiento de agente: es un modelo discriminativo de etiquetado.

## Casos de uso

- Agregadores de noticias: dado el HTML de un artículo de cualquier medio, el modelo identifica el titular, la fecha de publicación y el cuerpo del texto, permitiendo normalizar la información sin escribir selectores específicos por dominio.
- Monitorización de medios y clipping de prensa: extracción automática de autor, fecha y etiquetas para alimentar bases de datos de seguimiento de menciones con metadatos fiables.
- Construcción de corpus para investigación: generación de datasets estructurados a partir de crawling masivo de noticias en varios idiomas, aprovechando la cobertura multilingüe (es, ru, ar, zh, de, fr, pt, hr, ko, en).
- Sistemas de archivo y preservación digital: identificación de los campos esenciales de una noticia para su catalogación y búsqueda posterior en bibliotecas digitales o hemerotecas.
- Extracción de datos para análisis de tendencias: alimentar pipelines de NLP posteriores (resumen, clasificación temática, análisis de sentimiento) con texto limpio y metadatos correctamente separados del ruido de navegación y pies de página.
- Preprocesado en pipelines RAG sobre fuentes web: separar el cuerpo del artículo de menús, cabeceras y footers antes de trocear y vectorizar el contenido, mejorando la calidad de la recuperación.
- Detección de autoría y trazabilidad editorial: recuperar el campo `author` de forma estructurada para estudios de firma o verificación de fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,6 M de parámetros × 4 bytes), más activaciones y buffers; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp16/bf16: alrededor de 0,27 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 o H100 funcionan sin problema. También es viable en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline de `transformers` (con `trust_remote_code=True`), inferencia directa con `AutoModelForTokenClassification` y `AutoProcessor`; el tamaño del repositorio es de 0,5 GB. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo base-size, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| newsxlm-markuplm-ae | 134,6 M | no disponible | 10 (en, es, ru, ar, fr, pt, hr, zh, de, ko) | MIT | Clasificación de nodos HTML en noticias |
| microsoft/markuplm-base | ~110 M (base) | 512 tokens (típico en MarkupLM base) | en (principalmente) | MIT | Modelo base preentrenado, sin fine-tuning para extracción |
| Modelos basados en reglas o selectores XPath | no aplica | no aplica | dependiente del medio | variable | Extracción determinista, requiere mantenimiento manual por dominio |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros modelos de extracción de atributos web como DOM-LM o WebFormer) no está disponible en la información proporcionada. Frente a `markuplm-base`, la diferencia clave es el fine-tuning específico sobre NewsXLM con cobertura multilingüe y sin traducción al inglés; frente a soluciones basadas en selectores, ofrece generalización entre dominios a costa de una probabilidad de error no nula.

## Limitaciones y advertencias

- Es un modelo discriminativo de etiquetado de nodos: no genera texto ni mantiene conversaciones; usarlo fuera de esa tarea no es posible.
- Riesgo de error en HTML atípico o muy dinámico (por ejemplo, páginas renderizadas íntegramente por JavaScript), ya que el modelo opera sobre el HTML recibido, no sobre el DOM tras ejecución de scripts.
- No hay datos publicados sobre sesgos por idioma o por medio; la cobertura de diez idiomas no garantiza el mismo rendimiento en todos ellos, y el dataset de entrenamiento podría estar desequilibrado entre lenguas.
- Las etiquetas se limitan a seis clases; campos como sección, pie de foto o entradilla no están contemplados.
- Las rutas XPath devueltas se refieren al DOM limpiado por el propio modelo, no necesariamente al DOM original, lo que exige adaptar la integración.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el repositorio antes de usarlo en producción.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y citar el paper si se usa en investigación.
- El número de descargas (22) y de likes (0) es bajo, lo que sugiere poca validación comunitaria hasta la fecha; conviene evaluar el modelo en el dominio objetivo antes de desplegarlo.
- No se documenta la longitud máxima de contexto; HTMLs muy extensos podrían requerir truncado o segmentación, con posible pérdida de nodos relevantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ispras-crawlers/newsxlm-markuplm-ae
- Modelo base: https://huggingface.co/microsoft/markuplm-base
- Dataset NewsXLM: https://huggingface.co/datasets/ispras-crawlers/newsxlm
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/pbedrin/newsxlm-demo
- Paper (Proceedings of ISP RAS): https://ispranproceedings.elpub.ru/jour/article/view/2164/1961
- DOI del paper: https://doi.org/10.15514/ISPRAS-2026-38(2)-10
