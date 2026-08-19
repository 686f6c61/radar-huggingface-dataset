# Roy229/ftfp1243-invoice-ocr

## Resumen

El modelo `Roy229/ftfp1243-invoice-ocr`, también denominado InvoiceOCR, es un sistema de extracción de campos estructurados a partir de facturas escaneadas, publicado en HuggingFace por el autor Roy229. Está etiquetado dentro de las categorías document-ai y text-extraction, lo que indica su orientación a tareas de procesamiento de documentos y extracción de texto. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación, aunque el propio autor indica que se trata de un "candidate third-party model submitted for governance review", es decir, un modelo pendiente de validación interna antes de su aprobación para uso en producción.

La ficha disponible es extremadamente escasa: no se especifican parámetros, arquitectura, contexto, idiomas soportados ni datos de entrenamiento. Únicamente se indican requisitos de despliegue (8 GB de memoria GPU, batch size recomendado de 16 y framework transformers). Esto limita cualquier evaluación técnica rigurosa, por lo que la presente ficha se basa exclusivamente en la información pública proporcionada y marca como "no disponible" todos los datos no confirmados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (framework indicado: transformers) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (si es un transformer, un modelo de visión-lenguaje, un OCR tradicional, etc.). Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El único dato técnico disponible es que el framework de despliegue es transformers, lo que sugiere que el modelo es compatible con la biblioteca homónima de HuggingFace, pero no aporta detalles sobre la arquitectura interna.

## Capacidades

- Extracción de campos estructurados de facturas escaneadas, según la descripción del autor.
- Orientado a tareas de document-ai y text-extraction, lo que implica procesamiento de imágenes de documentos y extracción de texto.
- No se especifican capacidades adicionales como generación de texto libre, razonamiento, tool calling, agentes, soporte multilingüe o modos de pensamiento. Toda esa información se considera no disponible.

## Casos de uso

- Automatización del procesamiento de facturas: el modelo podría emplearse para extraer automáticamente campos como número de factura, fecha, importe total, IVA o datos del proveedor a partir de documentos escaneados, reduciendo la intervención manual en flujos contables.
- Integración en pipelines de gestión documental: al estar basado en transformers, podría incorporarse en sistemas que utilicen la biblioteca homónima para procesar lotes de facturas en formato imagen o PDF escaneado.
- Validación de datos en sistemas ERP: la extracción estructurada permitiría alimentar campos específicos de un ERP, siempre que el modelo supere la revisión de gobernanza indicada por el autor.
- Archivado y búsqueda de documentos: los campos extraídos podrían indexarse para facilitar la búsqueda posterior de facturas por criterios como proveedor o rango de fechas.
- Auditoría y cumplimiento: la extracción automática de datos clave facilitaría la revisión de facturas para fines de auditoría, aunque se requeriría una validación exhaustiva de la precisión del modelo.
- Preprocesamiento para otros sistemas de IA: el texto extraído podría servir como entrada para modelos de lenguaje que realicen análisis financiero o conciliación, siempre que la calidad de la extracción sea suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre precisión, recall, F1 u otras métricas de evaluación para tareas de extracción de facturas.

## Requisitos de hardware

- Memoria GPU estimada: 8 GB, según la model card del autor.
- Batch size recomendado: 16.
- Framework: transformers.
- No se especifican GPUs concretas, pero 8 GB de VRAM son compatibles con tarjetas como RTX 3070/3080, RTX 4060 Ti o similares. No se indica si es suficiente para inferencia en CPU.
- Opciones de despliegue: dado que usa transformers, es probable que pueda servirse con vLLM, TGI u Ollama, aunque no se confirma explícitamente. Tampoco se aportan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan referencias a otros modelos de extracción de facturas (como Donut, LayoutLM, PaddleOCR, etc.) ni datos comparativos de rendimiento.

## Limitaciones y advertencias

- El modelo está marcado como candidato en revisión de gobernanza; no está aprobado para uso interno hasta que se validen los requisitos de despliegue.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de idioma.
- La ausencia de especificaciones técnicas impide evaluar su idoneidad para entornos de producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni la seguridad del modelo.
- Al no haber benchmarks publicados, cualquier uso en producción debería ir precedido de una evaluación propia exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Roy229/ftfp1243-invoice-ocr
