# hanji-dev/hanji-parse-4b

## Resumen

Hanji Parse 4B es un modelo de lenguaje y visión (VLM) especializado en el parseo de documentos, desarrollado por hanji-dev como motor de producción de la API de extracción documental Hanji. Se trata de un fine-tune del modelo Qwen/Qwen3-VL-4B-Instruct, con 4.437.815.808 parámetros, que recibe la imagen de una página y devuelve un array JSON con bloques semánticos de contenido: cada bloque incluye una caja delimitadora (bounding box) en coordenadas normalizadas 0-1000 y el texto transcrito. Las tablas se devuelven como Markdown de GitHub dentro de un único bloque, y las figuras, fotos o firmas se representan como bloques de imagen con el marcador `<image>`.

El modelo resuelve el problema de convertir documentos escaneados o digitales (PDF, imágenes, etc.) en datos estructurados y listos para consumo por parte de sistemas automatizados, sin necesidad de reglas de layout específicas por plantilla. Su relevancia actual radica en que aborda el parsing de documentos de forma semántica (agrupando por secciones, no por líneas o celdas), lo que reduce drásticamente el ruido en la extracción de campos y tablas. Está publicado bajo licencia Apache 2.0 y su servidor de parseo y extracción de esquemas de código abierto está disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Qwen3-VL) fine-tuned |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizable con herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un VLM basado en transformer con codificador visual y decodificador de lenguaje, y se ha fine-tuneado específicamente para la tarea de parseo de documentos. La arquitectura subyacente emplea parches de 16 píxeles con fusión espacial 2×2, lo que da un tamaño de token visual de 32 píxeles; por eso el preprocesado exige que las dimensiones de la imagen sean múltiplos de 32. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO), pero la model card indica que el modelo está "estrechamente acoplado a su contrato de servicio": se entrenó con un prompt exacto, una regla de preprocesado de imagen y decodificación greedy. Cualquier desviación de estos parámetros produce salidas fuera de distribución.

La innovación principal no está en la arquitectura, sino en el contrato de salida: el modelo emite exclusivamente JSON con una estructura fija (`[{"bbox_2d": [x1, y1, x2, y2], "text_content": "..."}]`), y ha sido entrenado para agrupar el contenido en secciones semánticas (5-30 bloques por página típicamente), en lugar de emitir un registro por línea o celda. Esto lo diferencia de los OCR tradicionales y de otros VLM que generan texto libre.

## Capacidades

- Parseo de documentos de una página: devuelve bloques semánticos con bounding boxes y texto transcrito.
- Transcripción de tablas como Markdown de GitHub (GFM) en un único bloque, incluyendo tablas sin cabecera (no inventa nombres de columna) y tablas largas (una sola tabla por bloque con todas sus filas).
- Detección de imágenes, figuras, gráficos, sellos y firmas manuscritas, que se devuelven como bloques con `text_content = "<image>"`.
- Transcripción de checkboxes como `[x]` / `[ ]` en línea con su etiqueta.
- Manejo de páginas vacías: devuelve exactamente `[]`.
- Agrupación semántica: distingue entre párrafos, encabezados con su contenido, grupos clave-valor y tablas.
- No transcribe líneas decorativas ni separadores repetidos (omite guiones, asteriscos, subrayados).
- No adivina firmas manuscritas: las trata siempre como imágenes.
- Capacidad multilingüe: no especificada, pero al estar basado en Qwen3-VL, probablemente hereda capacidades multilingües del modelo base (no confirmado en la ficha).

## Casos de uso

- Extracción de datos de formularios y solicitudes: el modelo puede leer formularios escaneados (por ejemplo, solicitudes de autorización previa médica) y devolver los campos clave-valor agrupados, con sus coordenadas, lo que permite verificar la fuente sin re-teclear.
- Procesamiento de facturas y recibos: las líneas de artículos y precios se transcriben como una tabla GFM en un solo bloque, facilitando la integración directa en sistemas de contabilidad o ERP.
- Digitalización de historiales clínicos y face sheets: los paneles de información del paciente, diagnósticos y firmas se estructuran en bloques, y las firmas se conservan como imágenes para auditoría.
- Automatización de atención al cliente con documentos adjuntos: un chatbot puede recibir la imagen de un documento, parsearlo con este modelo y extraer los datos relevantes para responder consultas o rellenar tickets.
- Indexación y búsqueda semántica de documentos: al obtener bloques con bounding boxes y texto, se puede construir un índice que permita localizar secciones concretas dentro de un PDF escaneado.
- Cumplimiento normativo y verificación de documentos: al devolver coordenadas y texto, se puede auditar qué parte del documento respalda cada dato extraído, útil en sectores regulados (banca, seguros, sanidad).
- Preparación de datos para entrenamiento de otros modelos: el JSON estructurado con bounding boxes sirve como ground truth para fine-tunear otros modelos de extracción o para alimentar pipelines de RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparativas con otros modelos de parsing. El rendimiento se describe cualitativamente en la documentación de Hanji (por ejemplo, que funciona bien con faxes de baja calidad y que se puede ajustar sobre documentos fallidos), pero no hay cifras objetivas.

## Requisitos de hardware

- Tamaño de pesos: el repositorio ocupa 8,9 GB, lo que corresponde a pesos en FP16/BF16 (4.437 millones de parámetros × 2 bytes ≈ 8,9 GB).
- VRAM estimada para inferencia en FP16: aproximadamente 9-10 GB, considerando overhead de activaciones y KV cache. Esto cabe en GPUs consumer de gama alta como RTX 3080/3090, RTX 4070/4080/4090, o en GPUs de datacenter como A10, A100, L4.
- Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ), la VRAM necesaria baja a unos 2,5-3 GB, lo que permite ejecutarlo en GPUs con 4-6 GB (RTX 3060, RTX 4060, etc.) o incluso en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con vLLM, TGI, o mediante el servidor de código abierto proporcionado por Hanji (https://github.com/youlearn-ai/hanji). También es compatible con Ollama si se convierte a GGUF.
- Latencia y throughput: no se han publicado cifras oficiales. Como referencia, un modelo de 4B en una GPU moderna (RTX 4090) suele generar decenas de tokens por segundo, pero la latencia depende del tamaño de la imagen de entrada (limitada a 2 MP) y del número de bloques a generar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con alternativas. Sin embargo, se puede establecer una comparativa cualitativa con otros enfoques de parsing de documentos:

| Modelo / enfoque | Tipo | Salida | Ventaja | Limitación |
|---|---|---|---|---|
| Hanji Parse 4B | VLM fine-tuned | JSON estructurado con bloques semánticos y bboxes | Agrupación semántica, tablas GFM, manejo de firmas | Requiere prompt y preprocesado exactos; no hay benchmarks publicados |
| Qwen3-VL-4B-Instruct (base) | VLM general | Texto libre | Versátil, multilingüe | No está especializado en layout; puede emitir texto no estructurado |
| PaddleOCR | OCR tradicional | Texto con coordenadas por línea | Rápido, ligero, bien documentado | No agrupa semánticamente; no maneja tablas complejas |
| LayoutLMv3 | Modelo de layout | Etiquetas de tokens | Bueno para clasificación de campos | Requiere entrenamiento por tipo de documento; no genera JSON |

La comparativa con modelos de la misma categoría (VLM de parsing) como DocParser, Nougat o LayoutLMv3 no se puede realizar con datos objetivos por falta de benchmarks.

## Limitaciones y advertencias

- El modelo está fuertemente acoplado a su contrato de servicio: el prompt debe usarse verbatim, el preprocesado de imagen debe seguir las reglas exactas (máximo 2 MP, dimensiones múltiplo de 32, LANCZOS, PNG) y la decodificación debe ser greedy. Cualquier desviación produce salidas fuera de distribución.
- No se han publicado datos sobre sesgos o alucinaciones. Al ser un modelo de lenguaje, existe riesgo de alucinación en la transcripción de texto, especialmente en documentos de baja calidad o con tipografías inusuales.
- La model card advierte explícitamente que no se deben transcribir firmas manuscritas (siempre se devuelven como `<image>`), pero no garantiza que el modelo no intente adivinarlas en algunos casos.
- No se especifican los idiomas soportados; aunque el modelo base Qwen3-VL es multilingüe, el fine-tune podría estar sesgado hacia documentos en inglés u otros idiomas predominantes en el dataset de entrenamiento (no revelado).
- La licencia Apache 2.0 permite uso comercial, pero el servidor de Hanji (código abierto) puede tener términos adicionales; conviene revisar la documentación de Hanji para el uso de la API.
- El modelo está pensado para páginas individuales; no maneja documentos multipágina directamente (habría que procesar cada página por separado).
- No hay información sobre la longitud de contexto efectiva para el texto generado; en documentos muy densos, la salida JSON podría truncarse si se supera el límite de tokens de salida del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanji-dev/hanji-parse-4b
- Repositorio del servidor de parseo (GitHub): https://github.com/youlearn-ai/hanji
- Web de Hanji: https://hanji.dev/
- Playground de Hanji: https://hanji.dev/playground
- Documentación de Hanji: https://docs.hanji.dev/introduction
- Documentación técnica (llms.txt): https://docs.hanji.dev/llms.txt
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
