# ispras-crawlers/newsxlm-markuplm-en-ae

## Resumen

NewsXLM MarkupLM EN-AE es un modelo de clasificación de nodos HTML especializado en la extracción de atributos de páginas de noticias. Lo desarrolla el grupo ispras-crawlers del Instituto de Sistemas de Software de la Academia Rusa de Ciencias (ISP RAS) y se presenta como el baseline MarkupLM del artículo NewsXLM. Su función es etiquetar cada nodo del DOM de una página HTML como `title`, `publication_date`, `text`, `author`, `tag` o `none`, resolviendo el problema de extraer metadatos estructurados de noticias cuando no existe marcado semántico fiable.

El modelo parte de `microsoft/markuplm-base` y se ha afinado sobre el dataset NewsXLM. La variante `en-ae` aplica traducción automática a inglés del texto de los nodos HTML mediante Argos Translate antes de la extracción de características, lo que permite procesar páginas en diez idiomas con un único modelo entrenado en inglés; las predicciones conservan el texto original. Con 134,6 millones de parámetros y un repositorio de 0,5 GB, es un modelo compacto y desplegable en CPU.

Su relevancia actual reside en que aborda la extracción de información web multilingüe con un enfoque basado en la estructura del documento (XPath, etiquetas y texto) en lugar de solo texto plano, y publica dataset, paper y demo de forma abierta bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarkupLM (transformer con codificación conjunta de texto y estructura DOM/XPath) |
| Parametros totales | 134.617.094 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | en, es, ru, ar, fr, pt, hr, zh, de, ko |
| Licencia | MIT |
| Formato de pesos | safetensors (con `custom_code` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se basa en MarkupLM, una arquitectura transformer que extiende el paradigma de los modelos tipo BERT incorporando información estructural del HTML: además de los embeddings de tokens de texto, codifica las etiquetas HTML y las rutas XPath de cada nodo, de modo que el modelo aprende a asociar patrones estructurales (por ejemplo, un `<h1>` dentro de `<article>` o una etiqueta `<time>`) con el atributo semántico correspondiente. La cabeza es de clasificación de tokens (`token-classification`), aplicada a nivel de nodo del DOM.

El ajuste fino se realizó sobre el dataset NewsXLM, un corpus multilingüe de páginas de noticias anotadas a nivel de nodo HTML. En esta variante, el texto de los nodos se traduce previamente al inglés con Argos Translate antes de la extracción de características, mientras que las predicciones se devuelven con el texto original. El modelo soporta granularidad de *tail text*: el texto que sigue a un elemento se clasifica de forma independiente y se referencia con el sufijo XPath estándar `/following-sibling::text()[1]`. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación de nodos HTML en seis categorías: `title`, `publication_date`, `text`, `author`, `tag` y `none`.
- Extracción agrupada de atributos mediante el pipeline `extraction`, que devuelve un diccionario por atributo con las cadenas detectadas.
- Clasificación por nodo con probabilidades por clase mediante el pipeline `node-classification`, con rutas XPath sobre el DOM limpio.
- Soporte de *tail granularity*: distingue el texto propio de un elemento del texto que le sigue como hermano.
- Procesamiento multilingüe de diez idiomas mediante traducción automática a inglés con Argos Translate antes de la inferencia.
- Uso del texto original en las predicciones, independientemente del idioma de entrada.
- Ejecución en CPU o GPU (Argos usa CUDA automáticamente si está disponible, con opción de forzar CPU mediante `ARGOS_DEVICE_TYPE=cpu`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo exclusivamente extractivo.

## Casos de uso

- Extracción de metadatos en agregadores de noticias: dado el HTML de una página de un medio, el modelo identifica título, fecha de publicación, autor, cuerpo y etiquetas, lo que permite poblar índices y bases de datos sin depender de selectores CSS ad hoc por medio.
- Monitorización de medios multilingüe: al soportar diez idiomas mediante traducción a inglés, un mismo despliegue puede procesar fuentes en ruso, árabe, chino o español sin entrenar un modelo por idioma.
- Construcción de corpus para investigación: el etiquetado a nivel de nodo con rutas XPath facilita la trazabilidad y la auditoría de las extracciones, útil para generar datasets de noticias anotados.
- Enriquecimiento de pipelines de scraping existentes: el modelo puede sustituir o complementar reglas heurísticas frágiles, clasificando nodos individuales y agrupándolos por atributo con el pipeline `extraction`.
- Detección de autoría y fecha para cumplimiento editorial: la clasificación específica de `author` y `publication_date` permite verificar y normalizar metadatos en sistemas de gestión de contenidos.
- Extracción de etiquetas temáticas: la clase `tag` identifica los enlaces de categoría de la página, útil para sistemas de recomendación y clasificación temática.
- Procesamiento por lotes en CPU: con 134,6 millones de parámetros y pesos de 0,5 GB, el modelo puede ejecutarse en servidores sin GPU para volúmenes moderados de páginas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,5 GB en safetensors, por lo que la inferencia en fp32 requiere del orden de 0,6-1 GB de memoria, más el modelo de traducción de Argos cuando se procesan idiomas distintos del inglés.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una GPU de gama media ejecutarían el modelo con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM; también funciona en CPU.
- Opciones de despliegue: pipelines de HuggingFace Transformers (`extraction`, `node-classification`) con `trust_remote_code=True`, `AutoModelForTokenClassification` y `AutoProcessor`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La traducción con Argos añade un coste adicional en el primer uso (descarga e instalación del modelo de traducción) y en cada inferencia sobre HTML no inglés.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia |
|---|---|---|---|---|---|
| newsxlm-markuplm-en-ae | 134,6 M | no disponible | Clasificación de nodos HTML | 10 (vía traducción) | MIT |
| microsoft/markuplm-base | no disponible | no disponible | Modelo base MarkupLM | en (principalmente) | no disponible en la información |
| Modelos BERT-base para clasificación de tokens | ~110 M | 512 tokens (típico) | Clasificación de texto | según modelo | variable |

La comparación con alternativas concretas no está disponible en la información proporcionada; el único término de comparación documentado es el modelo base `microsoft/markuplm-base`, del que este es un ajuste fino.

## Limitaciones y advertencias

- Modelo exclusivamente extractivo: no genera texto ni razona; solo clasifica nodos HTML.
- Dependencia de Argos Translate para idiomas distintos del inglés: la calidad de la extracción en esos idiomas está condicionada por la calidad de la traducción automática, y el primer uso requiere descargar e instalar el modelo de traducción correspondiente.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus de noticias puede heredar sesgos de los medios representados en NewsXLM.
- Riesgo de error en páginas con estructuras HTML atípicas, contenido dinámico generado por JavaScript o DOM mal formado; las rutas XPath se refieren al DOM limpio definido en `utils.py`.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio; conviene revisarlo antes de desplegar en producción.
- No se documentan la longitud máxima de contexto ni el comportamiento ante documentos HTML muy extensos.
- Licencia MIT: permite uso comercial, pero se recomienda conservar el aviso de copyright y la atribución.
- El modelo tiene 9 descargas y 0 likes en el momento de la consulta, por lo que su validación externa es escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ispras-crawlers/newsxlm-markuplm-en-ae
- Modelo base: https://huggingface.co/microsoft/markuplm-base
- Dataset NewsXLM: https://huggingface.co/datasets/ispras-crawlers/newsxlm
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/pbedrin/newsxlm-demo
- Paper (Proceedings of ISP RAS): https://ispranproceedings.elpub.ru/jour/article/view/2164/1961
- Argos Translate: https://github.com/argosopentech/argos-translate
