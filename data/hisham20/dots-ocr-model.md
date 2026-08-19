# Hisham20/dots-ocr-model

## Resumen

dots.ocr es un modelo de parsing de documentos multilingüe que unifica la detección de layout y el reconocimiento de contenido en un único modelo de visión-lenguaje (VLM). Desarrollado por el equipo de rednote (Xiaohongshu) y publicado bajo licencia MIT, el modelo procesa imágenes de documentos y devuelve un JSON estructurado con las bounding boxes de cada elemento, su categoría (título, tabla, fórmula, imagen, etc.) y el texto extraído en el orden de lectura correcto. A pesar de estar basado en un LLM compacto de 1.7B de parámetros, alcanza resultados de nivel SOTA en el benchmark OmniDocBench para texto, tablas y orden de lectura, y resultados comparables a modelos mucho mayores como Doubao-1.5 o Gemini 2.5 Pro en reconocimiento de fórmulas.

El modelo tiene un total de 3.039.179.264 parámetros (aproximadamente 3.04B), lo que incluye el vision encoder y el LLM base. Soporta múltiples idiomas, incluyendo lenguas de bajos recursos, y ofrece una arquitectura unificada que elimina la necesidad de pipelines complejos con múltiples modelos especializados. El repositorio en HuggingFace (Hisham20/dots-ocr-model) es un mirror del proyecto original de rednote-hilab/dots.ocr, con el mismo peso y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) basado en un LLM de 1.7B, con vision encoder adicional |
| Parametros totales | 3.039.179.264 (3.04B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el codigo de ejemplo usa bfloat16 y flash_attention_2) |
| Idiomas soportados | en, zh, multilingual (incluye lenguas de bajos recursos) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

dots.ocr es un modelo de vision-lenguaje que combina un encoder visual con un LLM de 1.7B de parámetros. La arquitectura exacta del encoder visual y del LLM no se detalla en la información disponible, pero el código de ejemplo utiliza `AutoModelForCausalLM` de Transformers con `trust_remote_code=True` y `attn_implementation="flash_attention_2"`, lo que indica que es un modelo autoregresivo que procesa imágenes y texto de forma conjunta. La inferencia se realiza mediante un prompt que especifica el formato de salida (JSON con bboxes, categorías y texto en Markdown, HTML o LaTeX según el tipo de elemento).

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO). La innovación principal reside en la unificación de tareas de detección de layout y reconocimiento de contenido en un solo modelo, evitando pipelines multi-modelo. Según la model card, el modelo logra resultados competitivos frente a detectores tradicionales como DocLayout-YOLO, manteniendo una velocidad de inferencia superior gracias a su base LLM compacta.

## Capacidades

- OCR de documentos completos: extrae texto de imágenes de páginas, incluyendo títulos, párrafos, pies de página, encabezados, etc.
- Detección de layout: devuelve bounding boxes para cada elemento y su categoría (Caption, Footnote, Formula, List-item, Page-footer, Page-header, Picture, Section-header, Table, Text, Title).
- Reconocimiento de tablas: genera la estructura de la tabla en formato HTML.
- Reconocimiento de fórmulas: convierte fórmulas matemáticas a LaTeX.
- Orden de lectura: ordena todos los elementos según el orden de lectura humano.
- Salida estructurada en JSON: el resultado es un único objeto JSON con toda la información.
- Multilingüe: soporta inglés, chino y otros idiomas, con especial robustez en lenguas de bajos recursos.
- Integración con Transformers: se puede cargar con `AutoModelForCausalLM` y `AutoProcessor` estándar de HuggingFace.

## Casos de uso

- Digitalización de documentos escaneados: convierte PDFs o imágenes escaneadas en texto estructurado y editable, preservando el layout y el orden de lectura.
- Extracción de datos de facturas y recibos: detecta tablas, campos de texto y números, y los estructura en JSON para integrarlos en sistemas contables o ERP.
- Parsing de artículos científicos: extrae títulos, secciones, fórmulas y tablas de papers académicos para su indexación o análisis automatizado.
- Accesibilidad de documentos: genera versiones legibles por máquina de documentos históricos o complejos, facilitando su lectura por lectores de pantalla.
- Automatización de flujos de trabajo documentales: integración en pipelines de procesamiento de documentos para clasificar, archivar o extraer información de manera automática.
- Análisis de documentos multilingües: procesamiento de documentos en idiomas minoritarios o con mezcla de lenguas, gracias a su capacidad multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que dots.ocr logra resultados SOTA en OmniDocBench para texto, tablas y orden de lectura, y resultados comparables a Doubao-1.5 y Gemini 2.5 Pro en reconocimiento de fórmulas, pero no se proporcionan cifras concretas. Tampoco se detallan los resultados en el benchmark interno dots.ocr-bench para lenguas de bajos recursos. Por tanto, no es posible presentar una tabla comparativa con valores numéricos verificables.

## Requisitos de hardware

- VRAM estimada: con 3.04B parámetros en bfloat16, los pesos ocupan aproximadamente 6 GB. Se requiere al menos 8-10 GB de VRAM para inferencia con contexto moderado (estimación basada en el tamaño del modelo, no en datos oficiales).
- GPUs recomendadas: tarjetas con 8 GB o más de VRAM, como RTX 3060/3070/3080/4090, A100, H100, etc. En cuantización 4-bit podría caber en GPUs con 4-6 GB, pero no se han publicado cuantizaciones oficiales.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama media-alta de consumo (RTX 3080 o superior) gracias al tamaño compacto del LLM base.
- Opciones de despliegue: el código de ejemplo usa Transformers con `device_map="auto"` y Flash Attention 2. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no se proporcionan datos oficiales. La model card indica que es más rápido que modelos basados en LLMs más grandes, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de parsing de documentos. La model card menciona que dots.ocr supera a métodos tradicionales como DocLayout-YOLO en detección de layout, y que es comparable a modelos VLM de mayor tamaño como Doubao-1.5 y Gemini 2.5 Pro en reconocimiento de fórmulas. Sin embargo, no se incluyen métricas numéricas. Tampoco se especifican alternativas de código abierto equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o limitaciones específicas del modelo.
- El modelo está diseñado para documentos impresos o digitales; puede tener dificultades con escritura manuscrita o documentos muy deteriorados.
- La salida en JSON depende de la calidad del prompt; prompts mal construidos pueden producir resultados inconsistentes.
- La licencia MIT permite uso comercial, pero se recomienda verificar el cumplimiento de las políticas de uso de los datos de entrenamiento (no especificados).
- El modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del repositorio; se debe auditar el código antes de usarlo en producción.
- No se garantiza soporte para todos los idiomas; aunque es multilingüe, el rendimiento puede degradarse en idiomas muy alejados de los vistos en entrenamiento.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/Hisham20/dots-ocr-model
- Repositorio HuggingFace original: https://huggingface.co/rednote-hilab/dots.ocr
- Repositorio GitHub: https://github.com/rednote-hilab/dots.ocr
- Blog del proyecto: https://github.com/rednote-hilab/dots.ocr/blob/master/assets/blog.md
- Demo en vivo: https://dotsocr.xiaohongshu.com
- Benchmark OmniDocBench: https://github.com/opendatalab/OmniDocBench
