# fkrf22/chandra-ocr-2-mlx-8bit

## Resumen

Chandra OCR 2 es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado por Datalab, diseñado para convertir imágenes y documentos PDF en HTML, Markdown y JSON estructurados preservando la información de maquetación (layout). El modelo base, `datalab-to/chandra-ocr-2`, se distribuye bajo licencia OpenRAIL y está pensado para tareas de extracción de texto de alta precisión, incluyendo tablas complejas y documentos multilingües.

La ficha que nos ocupa, `fkrf22/chandra-ocr-2-mlx-8bit`, es una cuantización de 8 bits del modelo base realizada por el usuario fkrf22, empaquetada en formato MLX (safetensors) para su ejecución eficiente en hardware Apple Silicon. Cuenta con 4.539.265.536 parámetros totales (~4,5 mil millones) y un repositorio de 5,2 GB, lo que la hace adecuada para inferencia local en equipos con memoria unificada de gama alta.

La relevancia de esta variante radica en que permite ejecutar un modelo OCR de última generación en Macs sin necesidad de GPU dedicada, manteniendo la mayor parte de la precisión del modelo original gracias a la cuantización de 8 bits. Al estar basada en la arquitectura Qwen 3.5 (según los tags del repositorio), hereda las capacidades multimodales de dicha familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5 según tags del repo |
| Parametros totales | 4.539.265.536 (~4,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta variante); el modelo base admite otras cuantizaciones no especificadas |
| Idiomas soportados | no disponible (el modelo base reporta capacidad multilingüe en benchmarks) |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors (MLX) |
| Libreria | MLX |
| Modelo base | datalab-to/chandra-ocr-2 |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 5,2 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base. Los tags del repositorio indican la familia `qwen3_5`, lo que sugiere que Chandra OCR 2 se construye sobre un transformer multimodal de Qwen 3.5 adaptado a tareas de OCR y comprensión de documentos. El pipeline declarado es `image-text-to-text`, coherente con un modelo que recibe imágenes o páginas de PDF y genera texto estructurado (Markdown, HTML, JSON).

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la preservación de layout en la salida. Esta variante concreta (8 bits MLX) es una cuantización post-entrenamiento del modelo original; no se especifica la metodología exacta de cuantización empleada por el autor del repositorio.

## Capacidades

- Extracción de texto de imágenes y PDF con salida en Markdown, HTML y JSON.
- Preservación de información de maquetación (layout), incluyendo tablas complejas.
- Procesamiento de documentos multilingües (el modelo base reporta puntuación en benchmark multilingüe).
- Generación de estructuras tabulares a partir de imágenes de tablas.
- Conversión de documentos escaneados a formatos estructurados aptos para pipelines de datos.
- Inferencia local en Apple Silicon gracias al formato MLX.
- Capacidad conversacional declarada en los tags (`conversational`).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Modo thinking, visión general, audio: no disponible salvo la entrada de imagen inherente al OCR.

## Casos de uso

- Digitalización de archivos PDF escaneados: el modelo convierte páginas completas en Markdown o HTML preservando encabezados, listas y párrafos, lo que facilita la indexación posterior en motores de búsqueda o bases de conocimiento.
- Extracción de tablas financieras: gracias a su capacidad para manejar tablas complejas, puede transformar estados de cuenta o informes en JSON estructurado para su carga en hojas de cálculo o bases de datos.
- Construcción de datasets de entrenamiento: permite procesar grandes volúmenes de documentos heterogéneos y generar pares imagen-texto estructurados para entrenar otros modelos.
- Automatización de facturación y contabilidad: extracción de campos clave (importes, fechas, emisores) desde facturas en PDF a JSON, reduciendo la entrada manual de datos.
- Procesamiento de documentación técnica en local: al ejecutarse en MLX sobre Macs, permite a desarrolladores procesar documentación confidencial sin enviar datos a servicios en la nube.
- Accesibilidad documental: conversión de documentos escaneados a texto estructurado legible por lectores de pantalla y herramientas de accesibilidad.
- Pipelines de ingesta de conocimiento (RAG): generación de Markdown limpio a partir de PDFs para alimentar sistemas de recuperación aumentada, manteniendo la estructura semántica del original.

## Benchmarks y rendimiento

Los resultados de búsqueda web citan para el modelo base Chandra 2 una puntuación de 85,9 % en olmocr bench (descrita como SOTA) y 77,8 % en un benchmark multilingüe (mejora del 12 %). No se dispone de resultados específicos para esta variante cuantizada a 8 bits, ni de comparaciones detalladas con otros modelos en la información proporcionada.

| Benchmark | Modelo base Chandra 2 | Esta variante (8 bits MLX) |
|---|---|---|
| olmocr bench | 85,9 % | no disponible |
| Benchmark multilingüe | 77,8 % | no disponible |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 5,2 GB en pesos de 8 bits; se recomienda al menos 8 GB de memoria unificada para cargar el modelo, y 12-16 GB para margen de trabajo con imágenes de alta resolución.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX.
- GPU dedicadas: no aplica directamente, ya que el formato MLX está orientado a Apple Silicon; para NVIDIA se requeriría otra variante (por ejemplo, GGUF o safetensors estándar).
- Cabe en consumer hardware: sí, en Macs con 16 GB o más de memoria unificada.
- Opciones de despliegue: MLX (librería nativa), `mlx-lm` / `mlx-vlm` según el pipeline image-text-to-text; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fkrf22/chandra-ocr-2-mlx-8bit | ~4,5 mil millones | no disponible | OpenRAIL | safetensors (MLX) | Cuantización 8 bits para Apple Silicon |
| jwindle47/chandra-ocr-2-8bit-mlx | no disponible | no disponible | no disponible | MLX | Otra cuantización 8 bits del mismo modelo base |
| datalab-to/chandra-ocr-2 | no disponible | no disponible | OpenRAIL | no disponible | Modelo base original de Datalab |

No se dispone de información sobre otros modelos OCR comparables (por ejemplo, variantes de olmOCR u otros) en los datos proporcionados.

## Limitaciones y advertencias

- Al ser una cuantización de 8 bits, puede presentar una ligera degradación de precisión frente al modelo base, especialmente en tablas densas o texto de baja resolución; no se han publicado métricas que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar texto o estructuras en documentos con ruido, sellos o caligrafía.
- Limitaciones de idioma: aunque el modelo base reporta capacidad multilingüe, no se especifica la lista exacta de idiomas soportados ni su calidad por idioma.
- Restricciones de licencia: OpenRAIL incluye cláusulas de uso responsable que pueden limitar ciertos usos comerciales o de alto riesgo; conviene revisar el archivo LICENSE del repositorio antes de un despliegue en producción.
- Dependencia de hardware Apple: el formato MLX no es portable a GPUs NVIDIA o AMD sin conversión previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria ni de reportes de calidad sobre esta cuantización concreta.
- No se documenta la longitud de contexto, lo que impide planificar el procesamiento de documentos de muchas páginas en una sola pasada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fkrf22/chandra-ocr-2-mlx-8bit
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Cuantización alternativa 8 bits MLX: https://huggingface.co/jwindle47/chandra-ocr-2-8bit-mlx
- Repositorio GitHub de Chandra: https://github.com/datalab-to/chandra
