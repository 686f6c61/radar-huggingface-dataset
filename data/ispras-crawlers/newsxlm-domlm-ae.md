# ispras-crawlers/newsxlm-domlm-ae

## Resumen

NewsXLM DOM-LM AE es un modelo de clasificación de tokens especializado en la extracción de atributos de páginas HTML de noticias. Lo desarrolla el equipo ispras-crawlers del Instituto de Sistemas de Software de la Academia de Ciencias de Rusia (ISP RAS) y se publica como el modelo downstream del proyecto NewsXLM, que combina un conjunto de datos multilingüe con un modelo preentrenado sobre estructuras DOM. El modelo etiqueta cada nodo del árbol HTML con una de seis categorías: `title`, `publication_date`, `text`, `author`, `tag` o `none`, resolviendo así el problema clásico de la extracción de metadatos en el scraping de noticias.

La arquitectura se basa en DOM-LM, un transformer que procesa la estructura del documento HTML junto con el texto de sus nodos, en lugar de tratar el HTML como una secuencia plana de caracteres. El modelo parte del checkpoint preentrenado multilingüe `ispras-crawlers/newsxlm-domlm-pretrained` y se afina sobre el dataset NewsXLM. Con 281.193.736 parámetros y un tamaño de repositorio de 1,1 GB en formato safetensors, es un modelo de escala media pensado para despliegue en producción sin requisitos de hardware extremos.

Su relevancia actual radica en que ofrece una solución abierta (licencia MIT) y multilingüe (diez idiomas: inglés, español, ruso, árabe, francés, portugués, croata, chino, alemán y coreano) para un problema que tradicionalmente se ha abordado con heurísticas frágiles o servicios propietarios. El modelo se integra en el ecosistema Transformers mediante pipelines personalizados (`extraction` y `node-classification`) que requieren `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DOM-LM (transformer sobre estructura DOM de HTML) |
| Parametros totales | 281.193.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en, es, ru, ar, fr, pt, hr, zh, de, ko |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre DOM-LM, una arquitectura presentada en el paper «DOM-LM: Learning Generalizable Representations for HTML Documents» (arXiv 2201.10608). A diferencia de los enfoques que serializan el HTML como texto, DOM-LM modela explícitamente el árbol DOM: cada nodo aporta su etiqueta, sus atributos y su texto, y el transformer aprende representaciones que combinan la posición estructural con el contenido textual. Esta formulación permite generalizar entre sitios web con estructuras HTML distintas, algo crítico en la extracción de noticias, donde cada medio usa su propio marcado.

El entrenamiento se realiza en dos fases. Primero, un preentrenamiento multilingüe sobre documentos HTML (checkpoint `newsxlm-domlm-pretrained`), y después un ajuste fino supervisado sobre el dataset NewsXLM, que contiene páginas de noticias anotadas a nivel de nodo con las seis etiquetas objetivo. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada. El modelo se distribuye con código personalizado (`custom_code`), lo que implica que los pipelines estándar de Transformers no lo cargan sin `trust_remote_code=True`.

## Capacidades

- Clasificación de nodos HTML en seis categorías: `title`, `publication_date`, `text`, `author`, `tag` y `none`.
- Extracción agrupada de atributos mediante el pipeline `extraction`, que devuelve un diccionario con los valores textuales por atributo.
- Clasificación nodo a nodo con probabilidades por clase mediante el pipeline `node-classification`, útil para umbrales de confianza y depuración.
- Procesamiento multilingüe de páginas de noticias en diez idiomas (en, es, ru, ar, fr, pt, hr, zh, de, ko).
- Manejo de HTML completo como entrada mediante un procesador personalizado (`AutoProcessor`) que construye la representación del DOM.
- No es un modelo generativo: no produce texto libre, no soporta tool calling, agentes ni razonamiento multi-step. Su función es exclusivamente extractiva y de etiquetado.

## Casos de uso

- Agregadores de noticias: el modelo permite extraer título, fecha, autor, cuerpo y etiquetas de páginas de medios con estructuras HTML heterogéneas, alimentando un pipeline de ingestión que normaliza el contenido antes de indexarlo.
- Monitorización de medios y clipping de prensa: al clasificar nodos como `publication_date` y `author`, se pueden construir bases de datos de cobertura mediática con metadatos fiables para análisis de tendencias.
- Scraping de producción a escala: sustituye reglas XPath/CSS frágiles por un clasificador entrenado, reduciendo el mantenimiento cuando los sitios cambian su marcado; la licencia MIT permite integrarlo en servicios comerciales.
- Investigación en ciencias sociales y análisis de discurso: la extracción estructurada de cuerpo y etiquetas facilita corpus multilingües para estudios de encuadre informativo en diez idiomas.
- Sistemas de verificación de hechos: la identificación fiable de autor, fecha y cuerpo permite rastrear la procedencia de afirmaciones y construir grafos de propagación de noticias.
- Enriquecimiento de archivos digitales: digitalización de hemerotecas y repositorios de prensa donde los metadatos no están estructurados y deben recuperarse del HTML original.
- Preprocesado para RAG sobre noticias: la extracción limpia de título y cuerpo mejora la calidad de los fragmentos que se indexan en sistemas de recuperación aumentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 281 millones de parámetros en fp32, los pesos ocupan aproximadamente 1,1 GB; en fp16, unos 0,56 GB. A ello hay que sumar la memoria de activaciones y del procesador DOM, que depende de la longitud del HTML de entrada.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en fp16; una NVIDIA T4, RTX 3060 o superior cubre el caso de uso sin problemas. Para lotes grandes de documentos, una A10G o L4 ofrece mejor throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (pipelines `extraction` y `node-classification`); el formato safetensors permite cargarlo con `AutoModelForTokenClassification`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos y no a este tipo de clasificador con código personalizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NewsXLM DOM-LM AE | 281 M | no disponible | Clasificación de nodos HTML multilingüe | MIT | HuggingFace |
| DOM-LM original (arXiv 2201.10608) | no disponible | no disponible | Representaciones de documentos HTML | no disponible | Paper |
| Modelos NER multilingües tipo XLM-R | ~278 M (base) | 512 tokens | NER sobre texto plano | MIT / varias | HuggingFace |

La comparación directa es limitada: no se han publicado en la información disponible resultados de benchmarks frente a alternativas. La diferencia clave frente a modelos NER textuales es que NewsXLM opera sobre la estructura DOM, lo que le permite aprovechar el marcado HTML como señal, algo que un NER de texto plano no puede hacer.

## Limitaciones y advertencias

- Modelo exclusivamente extractivo: no genera texto, no razona y no soporta instrucciones en lenguaje natural; no debe confundirse con un LLM.
- Dependencia de la calidad del HTML: páginas con JavaScript que renderiza el contenido dinámicamente pueden no exponer los nodos necesarios; es recomendable usar HTML ya renderizado.
- Riesgo de error en sitios con estructuras atípicas o contenido generado por plantillas muy distintas a las del dataset de entrenamiento; se recomienda validar con umbrales de probabilidad.
- Sesgos potenciales derivados del dataset NewsXLM: la distribución de medios, idiomas y géneros periodísticos del corpus de entrenamiento puede no representar todos los dominios; no se documentan análisis de sesgo en la información disponible.
- Longitud de contexto no documentada: HTML muy extensos podrían truncarse o degradar el rendimiento; conviene segmentar documentos grandes.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar el código antes de desplegarlo en entornos sensibles.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el paper según indica la model card.
- El modelo tiene un volumen de descargas bajo (32 en el momento de la consulta) y escasa validación comunitaria; conviene evaluarlo en el dominio propio antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ispras-crawlers/newsxlm-domlm-ae
- Modelo base preentrenado: https://huggingface.co/ispras-crawlers/newsxlm-domlm-pretrained
- Dataset NewsXLM: https://huggingface.co/datasets/ispras-crawlers/newsxlm
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/pbedrin/newsxlm-demo
- Paper (Proceedings of ISP RAS): https://ispranproceedings.elpub.ru/jour/article/view/2164/1961
- Paper DOM-LM (referencia de arquitectura): https://dblp.org/rec/journals/corr/abs-2201-10608.html
