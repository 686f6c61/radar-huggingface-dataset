# martinkorelic/rudar-gliner2-sl-base

## Resumen

Rudar GLiNER2 SL Base es un modelo de extracción de información en esloveno desarrollado por martinkorelic, construido mediante ajuste fino del modelo multilingüe `fastino/gliner2-multi-v1`. Su propósito es resolver tareas de extracción de entidades nombradas (NER), extracción de relaciones, clasificación de texto y extracción de registros estructurados a partir de texto en esloveno, con etiquetas definidas en lenguaje natural (zero-shot). El modelo incorpora una ontología específica del esloveno con 110 tipos de entidad, 32 relaciones, 14 esquemas de clasificación y 53 campos de registro, distribuida como `ontology.json`.

Arquitectura GLiNER2 (transformer encoder de tipo extractor) con aproximadamente 307 millones de parámetros y un tamaño de repositorio de 1,2 GB. Los pesos se distribuyen en formato safetensors y requieren código personalizado (`trust_remote_code=True`) para su uso mediante el pipeline de Transformers. Está publicado bajo licencia Apache 2.0.

Su relevancia radica en que cubre una laguna práctica: la mayoría de modelos de extracción de información de alto rendimiento están centrados en inglés, y las alternativas para lenguas eslavas del sur son escasas. Rudar ofrece una solución lista para producción en esloveno y con transferencia parcial a croata, serbio y bosnio, con la particularidad de que las etiquetas son texto libre en lugar de un conjunto cerrado de clases.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor transformer, `custom_code`) |
| Parámetros totales | 307.098.645 (~300M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | esloveno (sl); entidades también en croata (hr), serbio (sr) y bosnio (bs) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER2, una arquitectura de extracción de información que combina un encoder transformer con un decodificador de tareas que acepta etiquetas en texto libre. A diferencia de los modelos NER clásicos con un conjunto fijo de clases, GLiNER2 permite especificar en tiempo de inferencia qué entidades, relaciones, clases o campos de registro se quieren extraer, lo que lo convierte en un extractor zero-shot. El modelo parte de `fastino/gliner2-multi-v1` y se ha ajustado específicamente para esloveno, incorporando una ontología propia del dominio esloveno (110 tipos de entidad, 32 relaciones, 14 esquemas de clasificación y 53 campos de registro).

Los detalles concretos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación) no están disponibles en la información proporcionada. El repositorio incluye dos archivos de código legibles (`modeling_rudar.py` y `pipeline_rudar.py`) que implementan el pipeline de inferencia; el autor recomienda usar dicho pipeline en lugar de cargar los pesos directamente con `GLiNER2.from_pretrained`, ya que la carga directa opera sobre texto en minúsculas y degrada la calidad. Está probado con `gliner2 2.0.0`, `transformers 4.57` y `torch 2.3–2.14`.

## Capacidades

- Extracción de entidades nombradas (NER) zero-shot con etiquetas en texto libre; sin etiquetas explícitas, el pipeline consulta los 24 tipos de entidad de nivel superior de la ontología.
- Extracción de relaciones en formato head → relation → tail, con nombres de relación en esloveno (por ejemplo, «financira», «pripada», «nahaja se v»).
- Clasificación de texto de una o varias etiquetas por esquema, con soporte de `multi_label` y puntuaciones de confianza por clase.
- Extracción de registros estructurados con campos definidos por el usuario; los campos con `choices` seleccionan un valor de una lista en lugar de citar el texto.
- Capacidad multilingüe parcial: la extracción de entidades funciona en croata, serbio y bosnio, tanto en escritura latina como cirílica, usando las mismas etiquetas en esloveno. Las tareas de relaciones, clasificación y registros están diseñadas para texto en esloveno.
- Procesamiento por lotes de múltiples textos en una sola llamada y ejecución en GPU mediante el parámetro `device`.
- Integración con el ecosistema Transformers a través de `pipeline` con `trust_remote_code=True`.

## Casos de uso

- Extracción de entidades en noticias eslovenas: el modelo identifica personas, organizaciones, cargos, localizaciones y fechas en artículos periodísticos, lo que permite construir índices de entidades y grafos de conocimiento a partir de corpus de medios.
- Análisis de documentos administrativos y jurídicos: con etiquetas como «pravni pojem», «organizacija» o «datum», se pueden extraer referencias normativas, instituciones y plazos de resoluciones y actas.
- Gestión de relaciones en dominios corporativos: la extracción head → relation → tail permite reconstruir relaciones de pertenencia, ubicación, financiación o nombramiento (por ejemplo, «Ana Kovač → pripada → Medis») para bases de datos de clientes o proveedores.
- Clasificación automática de correos y reclamaciones: con esquemas como «zahteva» y «sentiment», el modelo etiqueta solicitudes de clientes (queja, pregunta, petición de reembolso) y su tono, lo que facilita el enrutamiento y la priorización en atención al cliente.
- Extracción de datos de anuncios clasificados: a partir de un anuncio de venta, el modelo rellena registros estructurados con campos como nombre del producto, marca, año, precio o teléfono, lo que resulta útil para marketplaces y agregadores.
- Procesamiento de texto en croata, serbio y bosnio: aunque las tareas avanzadas están pensadas para esloveno, la extracción de entidades se extiende a estas lenguas con las mismas etiquetas, lo que permite un pipeline regional común para medios de los Balcanes occidentales.
- Enriquecimiento de bases de datos y pipelines RAG: las entidades y relaciones extraídas pueden alimentar índices de recuperación o grafos que mejoren la búsqueda semántica sobre documentación en esloveno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 1,2 GB solo para los pesos, más memoria para activaciones; en fp16/bf16 el peso se reduce a unos 0,6 GB. Las cifras exactas de VRAM total no están disponibles.
- GPU recomendadas: no hay recomendaciones oficiales en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con al menos 4-8 GB de VRAM, aunque este dato no está confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de ~300M de parámetros, aunque no se especifica qué modelos concretos.
- Opciones de despliegue: pipeline de Transformers con `trust_remote_code=True` (método recomendado por el autor); el autor no documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tareas |
|---|---|---|---|---|---|
| Rudar GLiNER2 SL Base | ~307M | no disponible | sl, hr, sr, bs | Apache 2.0 | NER, relaciones, clasificación, registros |
| fastino/gliner2-multi-v1 (base) | no disponible | no disponible | multilingüe | no disponible | NER, relaciones, clasificación, registros |
| Modelos NER específicos para esloveno | no disponible | no disponible | sl | no disponible | NER |

La información disponible no permite establecer una comparativa cuantitativa con alternativas concretas de la misma categoría; los datos de rendimiento de los modelos comparables no se han proporcionado.

## Limitaciones y advertencias

- Las tareas de relaciones, clasificación y registros estructurados están diseñadas específicamente para texto en esloveno; su uso en croata, serbio o bosnio no está garantizado.
- La extracción de entidades en hr, sr y bs se realiza con etiquetas en esloveno, lo que puede introducir desajustes semánticos o de cobertura en esas lenguas.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; el autor recomienda fijar una revisión concreta (`revision="<commit hash>"`) para evitar cambios no deseados.
- Cargar los pesos directamente con `GLiNER2.from_pretrained` en lugar del pipeline degrada la calidad porque opera sobre texto en minúsculas.
- No se han publicado datos de benchmarks, por lo que no es posible evaluar su precisión frente a alternativas con cifras verificables.
- Riesgo de alucinación y de falsos positivos inherente a los extractores zero-shot con etiquetas de texto libre: etiquetas ambiguas o poco frecuentes pueden producir extracciones incorrectas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `fastino/gliner2-multi-v1`, cuya licencia no se detalla en la información proporcionada.
- El modelo tiene solo 18 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada; para producción se recomienda una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martinkorelic/rudar-gliner2-sl-base
- Modelo base: https://huggingface.co/fastino/gliner2-multi-v1
- Demo (Space): https://huggingface.co/spaces/martinkorelic/rudar-gliner2-sl
