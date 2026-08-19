# btbtyler09/shrew-ocr-preview

## Resumen

shrew-ocr-preview es un modelo de visión-lenguaje especializado en inteligencia documental, desarrollado por Tyler Brooker (btbtyler09) como una vista previa de un sistema de extracción estructurada de documentos. Parte del modelo base ibm-granite/granite-vision-4.1-4b (un modelo multimodal de 4B parámetros de IBM) y lo afina para convertir una imagen de página completa en un único objeto JSON con metadatos, resumen, fragmentos semánticos listos para ingesta en RAG, y figuras y tablas con cuadros delimitadores y HTML. Está pensado para flujos de trabajo de OCR de documentos, extracción de información y construcción de bases de conocimiento.

El modelo destaca por su enfoque de "una página, un JSON" y por generar chunks semánticos en lugar de líneas OCR crudas, lo que facilita la integración directa en pipelines de recuperación aumentada por generación (RAG). Incluye además una modalidad de texto que procesa HTML, Markdown o texto plano con el mismo esquema de salida. Se distribuye bajo licencia Apache 2.0, con pesos en bf16 y una cuantización GPTQ-8bit de fidelidad casi idéntica para servir más rápido. Es una versión preview: útil en documentos convencionales (artículos, informes, manuales) pero con modos de fallo conocidos en casos difíciles, documentados honestamente por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (basado en ibm-granite/granite-vision-4.1-4b) |
| Parametros totales | 3.997.206.464 (~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32768 tokens (recomendado por el autor para servir) |
| Tipos de cuantizacion | bf16 (original), GPTQ-8bit (publicado por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 y GPTQ) |

## Arquitectura y entrenamiento

shrew-ocr-preview es un fine-tune del modelo ibm-granite/granite-vision-4.1-4b, un modelo de visión-lenguaje de IBM con aproximadamente 4B parámetros. El autor fusiona los pesos del fine-tune con el modelo base y los publica en bf16. La arquitectura subyacente es un transformer multimodal con un codificador de visión que procesa la imagen de página en tiles, y un decodificador de lenguaje que genera el JSON estructurado. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO; por la naturaleza del modelo, se trata probablemente de un fine-tune supervisado con pares imagen-página → JSON estructurado. Una innovación destacable es el enrutado de resolución "glyph-routed": la imagen se redimensiona a uno de tres buckets de tiles según la altura medida de los glifos del texto, lo que asegura una densidad de píxeles adecuada para OCR. El autor también recomienda un system prompt fijo ("structured_extraction") que actúa como centinela, ya que el conocimiento de la tarea está entrenado en los pesos y las instrucciones textuales quedan fuera de distribución.

## Capacidades

- OCR de documentos página a página: convierte una imagen de página en un JSON estructurado con metadatos, resumen, chunks semánticos, figuras y tablas.
- Extracción de metadatos: título, autores (lista), organización, año y tipo de documento (con valores null cuando no se detectan).
- Generación de resúmenes: produce un resumen de la página en lenguaje natural.
- Chunks semánticos para RAG: divide el contenido en fragmentos con títulos y tipos de sección (abstract, introduction, methodology, results, discussion, conclusion, technical_content, appendix), listos para vectorizar e indexar.
- Detección de figuras y tablas: devuelve cuadros delimitadores (bbox) en una cuadrícula normalizada 0-1000, junto con pies de foto, descripciones y tablas en HTML.
- Modalidad de texto: procesa HTML, Markdown o texto plano con el mismo esquema de salida (los bbox son null en este modo).
- Integración con vLLM: soporta el protocolo OpenAI-compatible y puede servirse con `--trust-remote-code`.

## Casos de uso

- Ingestión de documentos para RAG: el modelo genera chunks semánticos directamente, eliminando la necesidad de un pipeline separado de OCR + segmentación. Se puede alimentar un índice vectorial con los campos `title` y `content` de cada chunk.
- Digitalización de informes financieros y filings: extrae metadatos (organización, año, tipo) y tablas en HTML, lo que permite convertir documentos regulatorios en datos consultables.
- Procesamiento de artículos académicos: identifica secciones (abstract, methodology, results) y genera resúmenes, útil para construir bases de datos bibliográficas o sistemas de revisión.
- Automatización de manuales técnicos: detecta figuras con sus pies de foto y descripciones, facilitando la creación de documentación estructurada o la búsqueda visual dentro de manuales.
- Extracción de tablas de documentos escaneados: devuelve las tablas en formato HTML con bbox, permitiendo su conversión a CSV o su integración en hojas de cálculo.
- Preprocesamiento para pipelines de document intelligence: como paso previo a clasificación, redacción de resúmenes ejecutivos o alimentación de agentes conversacionales con contexto documental.

## Benchmarks y rendimiento

La model card menciona resultados medidos en el corpus OHR-Bench (document-RAG) y una sección "Results" con las clases de fallo publicadas honestamente, pero los datos concretos no se incluyen en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~8 GB para inferencia en bf16 (pesos de ~4B en bf16 ocupan unos 8 GB) y ~4-5 GB con la cuantización GPTQ-8bit.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (por ejemplo, RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A100, H100). Con GPTQ-8bit puede caber en GPUs de 6 GB (RTX 2060, RTX 3050).
- Cabe en GPU de consumo: sí, en las gamas media y alta.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--trust-remote-code` y `--max-model-len 32768`), también puede usarse con transformers y el código de preparación de imágenes proporcionado.
- Nota de escalado: en hosts multi-GPU, el autor recomienda réplicas data-parallel (`--data-parallel-size N`) en lugar de tensor parallelism, con una mejora medida del +54% en un nodo de 4 GPUs. En GPUs con memoria limitada, mantener `--max-num-batched-tokens` en 2048 o menos para evitar OOM en el codificador de visión.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa con modelos alternativos de extracción estructurada de documentos. El modelo es un fine-tune especializado de Granite Vision 4.1, y no se mencionan modelos comparables en la model card.

## Limitaciones y advertencias

- Versión preview: el modelo es útil en documentos convencionales (artículos, informes, filings, manuales) pero tiene modos de fallo conocidos en documentos difíciles, detallados en la sección Results de la model card (no incluida en la información disponible).
- Solo soporta inglés: los metadatos y el contenido se procesan en inglés; no se garantiza rendimiento en otros idiomas.
- Requiere un contrato de entrada estricto: el system prompt debe ser exactamente `structured_extraction`, la decodificación debe ser greedy (temperature 0, max_tokens 20000, sin otros knobs), y la resolución de entrada debe seguir el enrutado por buckets descrito. Saltarse cualquiera de estos pasos degrada silenciosamente la calidad.
- Contexto mínimo: se requiere una longitud de contexto de al menos 32768 tokens para páginas densas.
- Reproducibilidad: los pesos mejoran in situ bajo el mismo nombre; si se necesita reproducibilidad, hay que fijar una revisión (`revision=`) del repositorio.
- Riesgo de alucinación: como modelo generativo, puede inventar metadatos o contenido si la imagen es ambigua o está fuera de distribución; se recomienda validación humana en aplicaciones críticas.
- Los bbox están normalizados en una cuadrícula 0-1000 y solo se generan en la modalidad de imagen; en la modalidad de texto son null.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/btbtyler09/shrew-ocr-preview
- Perfil del autor en HuggingFace: https://huggingface.co/btbtyler09
- Repositorio del autor en GitHub: https://github.com/btbtyler09
- Aplicación de procesamiento de documentos (shrew-server): https://github.com/btbtyler09/shrew-server
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
