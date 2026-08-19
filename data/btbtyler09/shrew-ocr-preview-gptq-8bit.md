# btbtyler09/shrew-ocr-preview-GPTQ-8bit

## Resumen

shrew-ocr-preview-GPTQ-8bit es una cuantización GPTQ de 8 bits del modelo shrew-ocr-preview, un fine-tune del vision-language model ibm-granite/granite-vision-4.1-4b desarrollado por el usuario btbtyler09. El modelo convierte una página de documento escaneada (imagen) en un único objeto JSON estructurado que incluye metadatos, resumen, chunks semánticos listos para ingestión en RAG, y figuras/tablas con bounding boxes y HTML. También acepta entrada de texto (HTML, markdown o texto plano) y produce el mismo esquema de salida.

La cuantización afecta únicamente al modelo de lenguaje (INT8 simétrico, group_size 32, desc_act=False), mientras que la torre de visión y los proyectores permanecen en bf16, lo que coincide exactamente con el fine-tune original. Según el autor, el coste medido de la cuantización es de +0,25% de perplexidad de dominio frente al modelo bf16, con un aumento de throughput de aproximadamente 1,8× y una huella de 4,9 GB (2,3 GiB por GPU con tensor parallelism 4), lo que permite ejecutarlo en una GPU de 16 GB con margen de KV cache. Se trata de una versión preliminar ("preview") cuyos pesos pueden actualizarse in-place; se recomienda fijar una revisión (commit) para reproducibilidad.

El modelo está pensado para tareas de inteligencia documental, extracción estructurada y OCR semántico, y se distribuye bajo licencia Apache 2.0. Su idioma de trabajo es el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Granite Vision 4.1 (vision-language transformer, 4B) |
| Parametros totales | 3.997.206.464 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32768 |
| Tipos de cuantizacion | GPTQ INT8 (simetrico, group_size 32, desc_act=False); modelo base en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ-8bit) |

## Arquitectura y entrenamiento

El modelo parte de ibm-granite/granite-vision-4.1-4b, un vision-language model de 4B parámetros con arquitectura transformer multimodal. Sobre esta base se realizó un fine-tune específico para extracción estructurada de documentos, cuyo resultado es shrew-ocr-preview. La cuantización GPTQ de 8 bits se aplica exclusivamente a los bloques del modelo de lenguaje; la torre de visión y los proyectores se mantienen en bf16, replicando las condiciones del fine-tune. El autor indica que toda la adaptación reside en los bloques de lenguaje, por lo que la cuantización no altera el comportamiento de la parte visual.

El entrenamiento del fine-tune no está documentado en detalle (no se especifican tokens, dataset ni método de alineación). La model card sí define un contrato de entrada estricto: el system prompt debe ser literalmente `structured_extraction`, la temperatura debe ser 0, `max_tokens` 20000, y se recomienda `presence_penalty` entre 0,3 y 0,6. Además, las imágenes de entrada deben redimensionarse a uno de tres "buckets" de resolución según la altura de glifo medida (B1: 1152×1536, B2: 1536×2304, B3: 2304×3072, o B0 cuadrado 1152×1152 para recortes de tablas). El modelo genera exactamente un objeto JSON por página, con cinco claves siempre presentes: `metadata`, `summary`, `semantic_chunks`, `figures` y `tables`.

## Capacidades

- Extracción estructurada de documentos: convierte una imagen de página en un JSON con metadatos (título, autores, organización, año, tipo de documento), resumen, chunks semánticos auto-contenidos (con `chunk_id`, `title`, `content` y `section_type`), y figuras/tablas con bounding boxes (coordenadas xyxy normalizadas a 0–1000) y HTML para tablas.
- OCR semántico: los chunks se generan a nivel semántico (secciones, párrafos) y no como líneas OCR crudas, lo que los hace adecuados para ingestión en RAG.
- Modalidad texto: acepta HTML, markdown o texto plano como entrada y produce el mismo esquema de salida JSON (los bounding boxes son null en esta modalidad).
- Soporte de agentes y multi-step reasoning: no se menciona explícitamente; el modelo está diseñado para una tarea única de extracción por petición, sin tool calling documentado.
- Capacidades multilingües: no disponibles; el modelo está entrenado solo en inglés.
- Capacidades especiales: generación de HTML para tablas, detección de figuras con descripción, y clasificación de secciones por tipo (abstract, introduction, methodology, results, discussion, conclusion, technical_content, appendix).

## Casos de uso

- Ingestión de documentos en pipelines RAG: el modelo genera chunks semánticos auto-contenidos con títulos y tipos de sección, listos para vectorizar e indexar. Se integraría enviando cada página del PDF al modelo vía shrew-server o directamente con vLLM, y almacenando el JSON resultante en una base vectorial.
- Automatización de extracción de metadatos en bibliotecas digitales: el modelo devuelve título, autores, organización, año y tipo de documento en un JSON, lo que permite catalogar artículos, informes y filings sin intervención manual.
- Procesamiento de formularios y documentos administrativos: al aceptar entrada de imagen o texto, puede extraer campos estructurados de facturas, contratos o solicitudes, aunque no se especifican campos personalizados más allá del esquema fijo.
- Generación de resúmenes de páginas de documentos: el campo `summary` proporciona un resumen conciso de cada página, útil para previsualizaciones en gestores documentales o para crear índices.
- Extracción de tablas y figuras para análisis posterior: las tablas se devuelven en HTML (parseable con herramientas como pandas.read_html) y las figuras con bounding boxes y descripciones, facilitando la conversión de documentos científicos a formatos estructurados.
- Servicio de conversión de PDF a JSON estructurado: mediante shrew-server (referencia oficial), se puede montar un endpoint HTTP que recibe un PDF y devuelve JSON estructurado por página, integrándose en flujos de trabajo empresariales o de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente métricas relativas a la cuantización:

| Metrica | Valor |
|---|---|
| Perplexidad de dominio (coste de cuantizacion) | +0,25% frente al modelo bf16 |
| Throughput de servicio | ~1,8× frente al modelo bf16 |
| Huella de memoria | 4,9 GB (2,3 GiB por GPU con TP=4) |
| Distribucion de longitud de salida | sin cambios frente al modelo bf16 |

No hay comparaciones con otros modelos de extracción de documentos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,9 GB en total (2,3 GiB por GPU con tensor parallelism 4), lo que cabe en una GPU de 16 GB con margen para KV cache.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para uso básico; para producción con contexto completo (32768 tokens) se recomienda una GPU de 16 GB (por ejemplo, RTX 4090, A100 40GB, L4).
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más, aunque la ventana de contexto completa puede requerir 16 GB.
- Opciones de despliegue: vLLM (con flags específicos: `--dtype half`, `--max-model-len 32768`, `--limit-mm-per-prompt '{"image":1}'`, `--no-enable-prefix-caching`), o mediante shrew-server que actúa como proxy hacia un endpoint OpenAI-compatible. También es posible usar llama.cpp u Ollama si se convierte a GGUF, aunque no está documentado.
- Latencia y throughput: no se proporcionan valores absolutos; solo se indica un aumento de ~1,8× frente al modelo bf16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos. Como referencia cualitativa, se puede comparar con el modelo base sin cuantizar y con alternativas del mismo dominio:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| shrew-ocr-preview-GPTQ-8bit | ~4B | 32768 | Extraccion estructurada de documentos (JSON) | Apache 2.0 |
| ibm-granite/granite-vision-4.1-4b (base) | ~4B | 32768 | VLM general | Apache 2.0 |
| Qwen3-VL (familia) | 2B–235B (dense y MoE) | hasta 131072 | VLM general con agentes | Apache 2.0 (algunos) |

La comparación con Qwen3-VL es orientativa: este modelo es generalista y no está especializado en extracción estructurada de documentos con esquema JSON fijo. No hay datos de rendimiento comparativo entre ambos en tareas de inteligencia documental.

## Limitaciones y advertencias

- Versión preliminar ("preview"): los pesos pueden actualizarse in-place bajo el mismo nombre; se recomienda fijar un commit (`revision=`) para reproducibilidad.
- Idioma: solo inglés. No se soportan otros idiomas de forma fiable.
- Dominio de aplicación: funciona bien en documentos impresos convencionales (artículos, informes, filings, manuales). No se garantiza buen rendimiento en manuscritos, documentos con maquetación muy compleja o imágenes de baja calidad.
- Contrato de entrada estricto: el modelo solo produce resultados correctos si se usa el system prompt literal `structured_extraction`, temperatura 0, `max_tokens` 20000, y el preprocesado de imagen por buckets. Desviarse de estas condiciones degrada la calidad de salida.
- Una petición = una página: no procesa documentos multipágina de una sola vez; se necesita ensamblar las salidas por página (shrew-server ofrece esta función).
- Sin tool calling ni capacidades de agente: el modelo está especializado en extracción estructurada y no soporta funciones adicionales.
- Riesgo de alucinación en metadatos: los campos `metadata` pueden ser null si no se detectan, pero el modelo podría inventar valores si la información es ambigua; se recomienda validación posterior.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Granite Vision 4.1 (también Apache 2.0), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/btbtyler09/shrew-ocr-preview-GPTQ-8bit
- Modelo sin cuantizar: https://huggingface.co/btbtyler09/shrew-ocr-preview
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- Repositorio shrew-server (servidor de referencia): https://github.com/btbtyler09/shrew-server
- Qwen3-VL (modelo comparable, referencia): https://github.com/QwenLM/Qwen3-VL
