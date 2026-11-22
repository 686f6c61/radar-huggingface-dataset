# ibm-granite/granite-vision-4.1-4b

## Resumen

Granite-Vision-4.1-4B es un modelo de visión-lenguaje (VLM) desarrollado por IBM Research, diseñado específicamente para la extracción estructurada de información a partir de imágenes de documentos. Con aproximadamente 4.000 millones de parámetros totales (3,4B correspondientes al modelo de lenguaje y 0,6B al codificador visual más proyectores), se posiciona como una alternativa compacta a modelos frontera mucho más grandes para tareas de extracción de tablas, gráficos y pares clave-valor semánticos.

El modelo se construye mediante fine-tuning sobre Granite-4.1-3B e incorpora un codificador visual y proyectores que lo habilitan para tareas image-to-text. Su enfoque principal son tres tareas de extracción documental: conversión de gráficos a formatos legibles por máquina (Chart2CSV, Chart2Summary, Chart2Code), extracción de tablas con layouts complejos a JSON, HTML u OTSL, y extracción de pares clave-valor basada en esquemas. Estas capacidades se activan mediante etiquetas de tarea simples en el mensaje del usuario, que la plantilla de chat expande automáticamente.

La relevancia actual del modelo reside en su capacidad para integrarse en pipelines de procesamiento documental como Docling, ofreciendo comprensión visual profunda con un coste computacional reducido. Su licencia Apache 2.0 y su tamaño compacto lo hacen adecuado para despliegues en producción donde modelos frontera resultarían prohibitivos en términos de latencia o infraestructura. La metodología y el dataset ChartNet empleados se describen en el paper asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM): LLM de 3,4B + codificador visual y proyectores de 0,6B, fine-tuneado sobre Granite-4.1-3B |
| Parametros totales | 3.997.203.904 (~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

Granite-Vision-4.1-4B es un modelo de visión-lenguaje que combina un modelo de lenguaje de 3,4B parámetros (derivado de Granite-4.1-3B) con un codificador visual y proyectores que suman 0,6B parámetros adicionales. El modelo se obtiene mediante fine-tuning sobre la base Granite-4.1-3B, incorporando la capacidad de procesar imágenes y generar texto estructurado. La arquitectura sigue el paradigma estándar de los VLM, donde el codificador visual transforma la imagen en representaciones que se proyectan al espacio del LLM para su procesamiento conjunto con el texto.

El entrenamiento se centra en tareas de extracción documental estructurada y utiliza el dataset ChartNet, un conjunto de datos multimodal a escala de millones de ejemplos de alta calidad para comprensión de gráficos, descrito en el paper asociado (arXiv:2603.27064). El modelo preserva y extiende las capacidades de Granite Vision 4.0 3B, lo que permite a los usuarios existentes adoptarlo sin cambios en su flujo de trabajo. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni sobre si se emplearon técnicas de RLHF o DPO.

Una innovación destacable es el sistema de etiquetas de tarea: el modelo reconoce etiquetas como `<chart2csv>`, `<chart2code>`, `<chart2summary>`, `<tables_json>`, `<tables_html>` y `<tables_otsl>`, que la plantilla de chat expande automáticamente en el prompt completo, eliminando la necesidad de escribir instrucciones verbosas. Esto simplifica la integración en pipelines de producción y reduce la variabilidad en las entradas.

## Capacidades

- Extracción de gráficos a CSV: convierte gráficos de imágenes en tablas CSV con encabezados y valores numéricos.
- Extracción de gráficos a código Python: genera código Python que recrea el gráfico original.
- Extracción de gráficos a resumen: produce descripciones en lenguaje natural del contenido del gráfico.
- Extracción de tablas a JSON: extrae tablas con layouts complejos a JSON estructurado con dimensiones y celdas.
- Extracción de tablas a HTML: genera marcado HTML `<table>` a partir de imágenes de tablas.
- Extracción de tablas a OTSL: produce marcado OTSL con etiquetas de celda y fusión.
- Extracción de pares clave-valor (KVP): extrae valores basándose en nombres de claves y descripciones a través de diversos layouts documentales, generando JSON con diccionarios y arrays anidados.
- Descripción de imágenes (image-to-text): genera descripciones detalladas en lenguaje natural a partir de imágenes.
- Integración con Docling: se integra en pipelines de procesamiento documental para añadir comprensión visual profunda.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: dispone de visión; no se mencionan modos thinking ni audio.

## Casos de uso

- Digitalización de informes financieros: el modelo puede procesar imágenes de páginas de informes anuales y extraer tablas de resultados en formato JSON o HTML, facilitando su integración en bases de datos o sistemas de análisis. Su especialización en layouts complejos lo hace adecuado para tablas con celdas fusionadas y estructuras jerárquicas.
- Extracción de datos de gráficos en publicaciones científicas: investigadores pueden convertir gráficos de artículos en CSV o código Python reproducible mediante las etiquetas `<chart2csv>` y `<chart2code>`, agilizando la revisión sistemática y la reutilización de datos.
- Automatización de la extracción de formularios y documentos administrativos: mediante la extracción de pares clave-valor basada en esquemas, el modelo puede identificar campos como nombres, fechas o importes en documentos escaneados con layouts variables, generando JSON estructurado listo para su validación.
- Enriquecimiento de pipelines de Document AI con Docling: al integrarse con Docling, el modelo añade comprensión visual profunda a flujos existentes de parsing documental, permitiendo extraer tablas y gráficos que los motores tradicionales basados en reglas no capturan correctamente.
- Generación de resúmenes de gráficos para accesibilidad: la tarea `<chart2summary>` produce descripciones en lenguaje natural de gráficos, útil para generar texto alternativo en documentos accesibles o para alimentar sistemas de lectura de pantalla.
- Procesamiento de facturas y albaranes en entornos con recursos limitados: con solo 4B parámetros, el modelo puede desplegarse en infraestructura moderada para extraer tablas de líneas de detalle y pares clave-valor (proveedor, importe total, fecha) de documentos comerciales, ofreciendo una alternativa económica a modelos frontera.
- Extracción de tablas de documentos PDF de múltiples dominios: el modelo ha sido evaluado en benchmarks como OmniDocBench y PubTablesV2 en configuraciones de página completa, lo que respalda su uso en la extracción de tablas de documentos heterogéneos sin necesidad de recortes manuales.

## Benchmarks y rendimiento

La model card incluye gráficos de resultados (imágenes) para las siguientes evaluaciones, pero no se proporcionan los valores numéricos exactos en el texto disponible:

- Chart extraction: evaluación con LLM-as-a-judge (GPT4o) sobre el test-set verificado de ChartNet, reportando puntuaciones medias (0-100) en Chart2CSV y Chart2Summary.
- Table extraction: evaluación con TEDS (Tree-Edit-Distance-based Similarity) sobre TableVQA-Extract, OmniDocBench-tables y PubTablesV2, en configuraciones de tabla recortada y página completa.
- Key-Value Pair extraction: se menciona una sección de benchmarks, pero los resultados no están disponibles en el texto proporcionado.

No se han publicado resultados numéricos de benchmarks en la información textual disponible; los datos existen únicamente en formato de gráfico dentro de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~4B parámetros, en FP16 requeriría aproximadamente 8 GB solo para los pesos, más overhead de activaciones y del codificador visual; en cuantizaciones de 8 bits o 4 bits podría reducirse sustancialmente, pero no se confirman formatos de cuantización soportados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por tamaño, un modelo de ~4B es candidato a ejecutarse en GPUs de consumo con VRAM suficiente, pero no se aportan datos oficiales.
- Opciones de despliegue: la librería indicada es transformers; la model card menciona compatibilidad con endpoints y despliegue en Azure (tag `deploy:azure`). No se confirman vLLL, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos numéricos de benchmarks en texto para establecer comparaciones cuantitativas. La model card menciona que el modelo ofrece un rendimiento comparable a modelos frontera en benchmarks de extracción documental estructurada "a una fracción del número de parámetros", pero sin cifras concretas no es posible construir una tabla comparativa fiable.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Granite-Vision-4.1-4B | ~4B | No disponible | Apache 2.0 | Hugging Face |
| Granite Vision 4.0 3B | ~3B | No disponible | No disponible | Hugging Face (referenciado) |
| Modelos frontera de extracción documental | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado y orientado principalmente al inglés; su rendimiento en otros idiomas no está documentado y podría degradarse significativamente.
- Especialización: está optimizado para tareas de extracción documental estructurada (gráficos, tablas, KVP); su rendimiento en tareas generales de visión-lenguaje puede ser inferior al de modelos de propósito general.
- Riesgo de alucinación: como todo modelo generativo, puede producir valores, estructuras o descripciones incorrectas en la extracción, especialmente en imágenes de baja calidad o layouts atípicos; se recomienda validación posterior en producción.
- Longitud de contexto: no documentada, lo que impide evaluar su comportamiento en documentos de muchas páginas o conversaciones multi-turno largas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos y las dependencias del modelo base Granite-4.1-3B.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al entrenarse sobre datos documentales, podría heredar sesgos presentes en dichos datos.
- Formato de salida: las tareas se activan mediante etiquetas específicas; un uso incorrecto de las mismas puede producir salidas no deseadas.
- Cuantización: no se confirman formatos de cuantización soportados, lo que limita la planificación de despliegues de bajo consumo de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- Repositorio GitHub de IBM Granite: https://github.com/ibm-granite
- Paper ChartNet: https://huggingface.co/papers/2603.27064
- Dataset ChartNet: https://huggingface.co/datasets/ibm-granite/ChartNet
- Modelo base Granite-4.1-3B: https://huggingface.co/ibm-granite/granite-4.1-3b
- Docling: https://github.com/docling-project/docling
- TableVQA-Extract: https://github.com/naver-ai/tablevqabench
- OmniDocBench: https://github.com/opendatalab/OmniDocBench
- PubTablesV2: https://huggingface.co/datasets/kensho/PubTables-v2
- Paper TEDS: https://arxiv.org/abs/2208.00385
- Paper referenciado arXiv:2603.11243: https://arxiv.org/abs/2603.11243
- Paper referenciado arXiv:2502.09927: https://arxiv.org/abs/2502.09927
- Paper referenciado arXiv:2406.04334: https://arxiv.org/abs/2406.04334
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
