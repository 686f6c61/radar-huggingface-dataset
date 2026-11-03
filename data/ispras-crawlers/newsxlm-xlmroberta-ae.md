# ispras-crawlers/newsxlm-xlmroberta-ae

## Resumen

NewsXLM XLM-RoBERTa AE es un modelo de clasificación de tokens (token classification) obtenido por fine-tuning de XLM-RoBERTa base sobre el dataset NewsXLM. Lo desarrolla el grupo ispras-crawlers del Instituto de Ingeniería de Software de la Academia Rusa de Ciencias (ISP RAS), y su función es etiquetar nodos HTML de páginas de noticias con atributos semánticos: `title`, `publication_date`, `text`, `author`, `tag` o `none`. Resuelve el problema de la extracción estructurada de metadatos a partir de HTML heterogéneo en medios digitales multilingües.

El modelo cuenta con 277.457.670 parámetros, hereda la arquitectura transformer encoder de XLM-RoBERTa base y cubre diez idiomas (inglés, español, ruso, árabe, francés, portugués, croata, chino, alemán y coreano). Se distribuye bajo licencia MIT y con pesos en formato safetensors, con código personalizado (`trust_remote_code=True`) que implementa pipelines de extracción y clasificación por nodo.

Es relevante para pipelines de scraping y monitorización de medios porque combina multilingüismo nativo con una tarea muy concreta (extracción de atributos de noticias) y un formato de salida listo para producción, agrupado por atributo o por ruta XPath del nodo HTML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de tokens |
| Parametros totales | 277.457.670 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, es, ru, ar, fr, pt, hr, zh, de, ko |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Modelo base | FacebookAI/xlm-roberta-base |
| Dataset de fine-tuning | ispras-crawlers/newsxlm |
| Tamano del repo | 1.1 GB |
| Etiquetas de salida | title, publication_date, text, author, tag, none |
| Codigo personalizado | Si (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de XLM-RoBERTa base, un transformer encoder de tipo RoBERTa con tokenizador SentencePiece y embeddings multilingües compartidos. Sobre el encoder se añade una cabeza de clasificación de tokens que asigna a cada token de entrada una de las seis etiquetas de atributo de noticia. El procesador personalizado (`AutoProcessor` con `trust_remote_code=True`) se encarga de convertir el HTML en la secuencia de entrada, de modo que el modelo opera directamente sobre el marcado de la página y no sobre texto plano preextraído.

El entrenamiento se realizó sobre el dataset NewsXLM, publicado por los mismos autores y orientado a la extracción de información de páginas web de noticias multilingües. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en una tarea de etiquetado supervisado). Tampoco se especifican innovaciones arquitectónicas adicionales: se trata de un baseline estándar de fine-tuning, tal como indica el propio título del repositorio.

## Capacidades

- Clasificación de nodos HTML de páginas de noticias en seis categorías: `title`, `publication_date`, `text`, `author`, `tag` y `none`.
- Extracción agrupada por atributo mediante el pipeline `extraction`, que devuelve directamente listas de valores por campo.
- Clasificación por nodo con probabilidades por etiqueta y ruta XPath del nodo, mediante el pipeline `node-classification`.
- Procesamiento multilingüe en diez idiomas: inglés, español, ruso, árabe, francés, portugués, croata, chino, alemán y coreano.
- Manejo de HTML completo como entrada, incluyendo elementos de navegación, cabeceras, pies de página y contenedores anidados.
- Salida con probabilidades por clase, útil para umbrales de confianza y filtrado en producción.
- No soporta generación de texto, razonamiento, tool calling, agentes, visión ni audio: es un modelo discriminativo de etiquetado.

## Casos de uso

- Agregadores de noticias: el modelo permite extraer título, fecha de publicación, cuerpo, autor y etiquetas de forma automática desde el HTML de medios de distintos países, aprovechando su cobertura en diez idiomas para normalizar fuentes heterogéneas en un único esquema de datos.
- Monitorización de medios y clipping de prensa: integrado en un crawler, clasifica cada nodo de la página para aislar el contenido editorial del ruido (menús, banners, footers), reduciendo el coste de mantenimiento de selectores CSS específicos por dominio.
- Construcción de corpus para investigación: permite generar datasets estructurados de noticias multilingües (fecha, autor, cuerpo, etiquetas) a partir de archivos HTML históricos, útil para estudios de medios, análisis de sesgo o entrenamiento de modelos posteriores.
- Verificación de autoría y trazabilidad: la extracción del campo `author` y `publication_date` facilita auditar la procedencia de una noticia y su fecha original, relevante en flujos de fact-checking y detección de desinformación.
- Enriquecimiento de bases de datos editoriales: en un CMS o archivo digital, el modelo puede reprocesar páginas antiguas para poblar metadatos ausentes (tags, autor, fecha) sin intervención manual.
- Pipelines de SEO y sindicación: la clasificación de `title`, `text` y `tag` permite generar resúmenes, feeds RSS o extractos para sindicación a partir de HTML no estructurado de terceros.
- Análisis de tendencias por etiquetas: al extraer el campo `tag` de forma consistente en varios idiomas, se pueden agregar temas y medir su evolución temporal en distintos mercados lingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para pesos (277 M de parámetros), más activaciones y memoria del procesador de HTML; en la práctica, entre 2 y 4 GB según el tamaño de las páginas procesadas.
- En FP16/BF16: alrededor de 0,6 GB de pesos, con un consumo total típico inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 pueden ejecutar el modelo sin problemas.
- Cabe holgadamente en GPU de consumo: GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060, RTX 4070, RTX 4090, entre otras.
- También es viable en CPU para lotes pequeños, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con `pipeline("extraction")` o `pipeline("node-classification")` y `trust_remote_code=True`; `AutoModelForTokenClassification` + `AutoProcessor` para inferencia manual; servible con TGI o con un wrapper HTTP propio. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ispras-crawlers/newsxlm-xlmroberta-ae | 277 M | No disponible | Clasificacion de nodos HTML de noticias | 10 | MIT | HuggingFace |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingue (sin fine-tuning) | 100 | MIT | HuggingFace |
| Otras variantes NewsXLM del mismo grupo | No disponible | No disponible | Extraccion de atributos de noticias | No disponible | No disponible | HuggingFace (ispras-crawlers) |

La comparación directa con alternativas especializadas en extracción de atributos de noticias no está disponible en la información proporcionada. El modelo base XLM-RoBERTa sirve como referencia de tamaño y licencia, pero no resuelve la misma tarea sin fine-tuning específico.

## Limitaciones y advertencias

- Es un modelo discriminativo de etiquetado de tokens: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- El dominio está acotado a páginas HTML de noticias; su rendimiento fuera de ese tipo de contenido (foros, blogs, e-commerce) no está documentado.
- La model card no reporta métricas de evaluación, sesgos conocidos ni análisis de errores por idioma; la cobertura de diez idiomas no implica rendimiento homogéneo entre ellos.
- Riesgo de clasificación errónea en HTML mal formado, contenido generado dinámicamente por JavaScript o estructuras muy alejadas de las del dataset NewsXLM.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de desplegarlo en producción.
- La licencia MIT permite uso comercial, pero el modelo base XLM-RoBERTa y el dataset NewsXLM deben verificarse por separado si se redistribuyen derivados.
- No se documentan requisitos de longitud de contexto ni comportamiento con páginas muy extensas; el límite de 512 tokens de XLM-RoBERTa base es un caveat probable que la model card no aclara.
- Con solo 12 descargas y 0 likes en el momento de la consulta, la validación comunitaria es prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ispras-crawlers/newsxlm-xlmroberta-ae
- Dataset NewsXLM: https://huggingface.co/datasets/ispras-crawlers/newsxlm
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/pbedrin/newsxlm-demo
- Paper (Proceedings of ISP RAS): https://ispranproceedings.elpub.ru/jour/article/view/2164/1961
- DOI del paper: https://doi.org/10.15514/ISPRAS-2026-38(2)-10
