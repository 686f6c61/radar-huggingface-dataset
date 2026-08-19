# datalab-to/chandra-ocr-2

## Resumen

Chandra OCR 2 es un modelo de reconocimiento óptico de caracteres (OCR) de última generación desarrollado por Datalab, diseñado para convertir imágenes y documentos PDF en texto estructurado en formato Markdown, HTML o JSON, preservando la información de maquetación (layout). Se trata de la segunda versión de la familia Chandra, que mejora significativamente el rendimiento en matemáticas, tablas, formularios complejos y escritura a mano, además de ampliar el soporte a más de 90 idiomas. El modelo alcanza una puntuación del 85,8 % en el benchmark olmOCR, lo que lo sitúa como el mejor modelo OCR abierto en la actualidad, superando a alternativas como olmOCR 2, Deepseek OCR o Qwen 3 VL 8B.

Chandra 2 está basado en una arquitectura transformer multimodal (image-text-to-text) derivada de Qwen3.5, con un total de 5.295.564.288 parámetros (aproximadamente 5,3 mil millones), lo que lo convierte en un modelo relativamente compacto pero muy eficiente para tareas de extracción de documentos. El modelo se distribuye bajo licencia OpenRAIL, lo que permite su uso comercial, y está disponible en Hugging Face con pesos en formato safetensors. Su relevancia actual radica en la creciente necesidad de digitalizar documentos complejos (facturas, artículos académicos, formularios) con alta fidelidad estructural, y en que ofrece una alternativa de código abierto competitiva frente a APIs propietarias como GPT-4o o Mistral OCR.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.5 |
| Parametros totales | 5.295.564.288 (5,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 90+ (según el autor) |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Chandra OCR 2 emplea una arquitectura transformer multimodal que combina un codificador visual con un modelo de lenguaje, siguiendo el esquema típico de los modelos image-text-to-text. Según las etiquetas del repositorio, está basado en Qwen3.5, aunque no se especifican detalles adicionales sobre la configuración exacta (número de capas, cabezas de atención, etc.). El modelo está entrenado para generar directamente texto estructurado (Markdown, HTML o JSON) a partir de imágenes, lo que le permite capturar la estructura jerárquica de los documentos, incluyendo tablas, fórmulas matemáticas, formularios con casillas de verificación y diagramas con sus correspondientes pies de figura.

No se han publicado datos oficiales sobre el conjunto de datos de entrenamiento (número de tokens, composición, técnicas de alineación como RLHF o DPO). Sin embargo, el autor indica que la versión 2 incorpora mejoras sustanciales en matemáticas, tablas y maquetaciones complejas, así como un incremento del 12 % en el benchmark multilingüe respecto a Chandra 1. También destaca la capacidad de generar bloques de maquetación con coordenadas de bounding box, lo que facilita la reconstrucción fiel del documento original.

## Capacidades

- Conversión de imágenes y PDFs a Markdown, HTML o JSON con información detallada de maquetación.
- Extracción precisa de texto de documentos escaneados, incluida escritura a mano.
- Reconstrucción de formularios complejos, incluyendo casillas de verificación y campos rellenados manualmente.
- Rendimiento sólido en tablas, fórmulas matemáticas y maquetaciones de varias columnas.
- Extracción de imágenes y diagramas con generación de pies de figura y datos estructurados.
- Soporte multilingüe para más de 90 idiomas, con mejoras significativas en precisión respecto a la versión anterior.
- Capacidad conversacional (según etiqueta del repositorio), lo que permite interacciones de preguntas y respuestas sobre el contenido del documento.

## Casos de uso

- Digitalización de archivos históricos y manuscritos: el modelo puede transcribir documentos antiguos con escritura a mano a texto digital estructurado, facilitando su búsqueda y preservación.
- Procesamiento de facturas y recibos: extrae automáticamente datos de tablas financieras, montos, fechas y proveedores, integrándose en sistemas de contabilidad automatizada.
- Conversión de documentos académicos y técnicos: transforma artículos científicos, libros de texto o apuntes con fórmulas matemáticas complejas a formato LaTeX/Markdown, manteniendo la estructura de ecuaciones.
- Automatización de formularios empresariales: lee formularios rellenados a mano (solicitudes, contratos, evaluaciones) y extrae los campos relevantes, incluyendo casillas marcadas, para su procesamiento en bases de datos.
- Accesibilidad web: convierte PDFs escaneados en texto legible por lectores de pantalla, mejorando el acceso a la información para personas con discapacidad visual.
- Indexación y búsqueda documental: genera metadatos estructurados en JSON (títulos, secciones, tablas, figuras) para motores de búsqueda internos de empresas o bibliotecas.
- Extracción de diagramas y figuras: identifica y describe gráficos, esquemas y diagramas dentro de documentos técnicos, generando captions automáticos para documentación.
- Procesamiento multilingüe: al soportar más de 90 idiomas, permite digitalizar documentos en múltiples lenguas sin necesidad de modelos separados, útil para organizaciones internacionales.

## Benchmarks y rendimiento

El autor publica resultados en el benchmark olmOCR, que evalúa la precisión de OCR en diversas categorías (artículos ArXiv, escaneos antiguos, tablas, encabezados, columnas múltiples, texto pequeño, etc.). La tabla siguiente muestra la puntuación global y por categoría de Chandra 2 comparado con otros modelos y APIs.

| Modelo | ArXiv | Old Scans Math | Tables | Old Scans | Headers and Footers | Multi column | Long tiny text | Base | Overall |
|:-------|:-----:|:--------------:|:------:|:---------:|:-------------------:|:------------:|:--------------:|:----:|:-------:|
| Datalab API | 90,4 | 90,2 | 90,7 | 54,6 | 91,6 | 83,7 | 92,3 | 99,9 | 86,7 ± 0,8 |
| Chandra 2 | 86,9 | 89,1 | 92,1 | 51,1 | 91,4 | 82,1 | 93,7 | 99,9 | 85,8 ± 0,8 |
| dots.ocr 1.5 | 85,9 | 85,5 | 90,7 | 48,2 | 94,0 | 85,3 | 81,6 | 99,7 | 83,9 |
| Chandra 1 | 82,2 | 80,3 | 88,0 | 50,4 | 90,8 | 81,2 | 92,3 | 99,9 | 83,1 ± 0,9 |
| olmOCR 2 | 83,0 | 82,3 | 84,9 | 47,7 | 96,1 | 83,7 | 81,9 | 99,6 | 82,4 |
| dots.ocr | 82,1 | 64,2 | 88,3 | 40,9 | 94,1 | 82,4 | 81,2 | 99,5 | 79,1 ± 1,0 |
| olmOCR v0.3.0 | 78,6 | 79,9 | 72,9 | 43,9 | 95,1 | 77,3 | 81,2 | 98,9 | 78,5 ± 1,1 |
| Datalab Marker v1.10.0 | 83,8 | 69,7 | 74,8 | 32,3 | 86,6 | 79,4 | 85,7 | 99,6 | 76,5 ± 1,0 |
| Deepseek OCR | 75,2 | 72,3 | 79,7 | 33,3 | 96,1 | 66,7 | 80,1 | 99,7 | 75,4 ± 1,0 |
| Mistral OCR API | 77,2 | 67,5 | 60,6 | 29,3 | 93,6 | 71,3 | 77,1 | 99,4 | 72,0 ± 1,1 |
| GPT-4o (Anchored) | 53,5 | 74,5 | 70,0 | 40,7 | 93,8 | 69,3 | 60,6 | 96,8 | 69,9 ± 1,1 |
| Qwen 3 VL 8B | 70,2 | 75,1 | 45,6 | 37,5 | 89,1 | 62,1 | 43,0 | 94,3 | 64,6 ± 1,1 |
| Gemini Flash 2 (Anchored) | 54,5 | 56,1 | 72,1 | 34,2 | 64,7 | 61,5 | 71,5 | 95,6 | 63,8 ± 1,2 |

Además, el autor indica una puntuación del 77,8 % en el benchmark multilingüe, un 12 % superior a la de Chandra 1. No se han publicado resultados en otros benchmarks estándar como MMLU o HumanEval, ya que el modelo está especializado en OCR y no en razonamiento general.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware específicos. No obstante, a partir del tamaño de parámetros (5,3 B) y del peso del repositorio (10,6 GB en bfloat16), se pueden hacer las siguientes estimaciones orientativas:

- VRAM estimada para inferencia en bfloat16: ~10,6 GB (peso completo del modelo). Con cuantización a 8 bits, ~5,3 GB; a 4 bits, ~2,6 GB.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM para bfloat16 (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, A10, L4). Para cuantización a 4 bits, es posible ejecutarlo en GPUs con 4-6 GB (RTX 3060, RTX 4060, etc.).
- El modelo cabe en GPUs de consumo si se aplica cuantización. Para producción con alta concurrencia se recomiendan GPUs profesionales (A100, H100) o servicios cloud.
- Opciones de despliegue: el README recomienda usar vLLM para servir el modelo (comando `chandra_vllm`), y también es compatible con Hugging Face Transformers mediante `AutoModelForImageTextToText`. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependerán del hardware y del tamaño de los documentos procesados.

## Comparativa con modelos similares

Chandra 2 se posiciona como el modelo OCR abierto con mejor rendimiento en el benchmark olmOCR, superando a otras alternativas de código abierto y a APIs propietarias. La siguiente tabla compara las características principales con otros modelos de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Puntuación olmOCR |
|:-------|:-----------|:---------|:---------|:-----------------:|
| Chandra 2 | 5,3 B | no disponible | OpenRAIL | 85,8 |
| Chandra 1 | no disponible | no disponible | OpenRAIL | 83,1 |
| olmOCR 2 | no disponible | no disponible | Apache 2.0 | 82,4 |
| dots.ocr 1.5 | no disponible | no disponible | no disponible | 83,9 |
| Deepseek OCR | no disponible | no disponible | no disponible | 75,4 |
| Qwen 3 VL 8B | 8 B | no disponible | Apache 2.0 | 64,6 |

Chandra 2 supera a todos los modelos comparados en la puntuación global, con una ventaja notable sobre Qwen 3 VL 8B (más de 20 puntos). Su principal competidor en código abierto es olmOCR 2, al que supera en más de 3 puntos, y dots.ocr 1.5, al que aventaja en casi 2 puntos. Frente a APIs propietarias como GPT-4o o Mistral OCR, Chandra 2 ofrece un rendimiento superior con la ventaja de ser desplegable localmente.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones específicas. Como modelo OCR, puede cometer errores en textos muy dañados, ilegibles o con caligrafía extremadamente compleja.
- La longitud de contexto no está especificada, lo que podría limitar el procesamiento de documentos muy extensos en una sola pasada. Para documentos largos, sería necesario dividirlos en fragmentos.
- El tamaño del modelo (10,6 GB en bfloat16) puede ser elevado para despliegues en dispositivos con recursos limitados, aunque la cuantización puede mitigar este problema.
- La licencia OpenRAIL permite uso comercial, pero es necesario revisar los términos completos de la licencia para asegurar el cumplimiento, especialmente en aplicaciones de alto riesgo.
- El autor indica que el modelo es de 4B parámetros en el blog de anuncio, mientras que los pesos en safetensors suman 5,3 B. Esta discrepancia podría deberse a que el blog se refiere a parámetros activos o a un redondeo, pero no se ha aclarado oficialmente.
- No se han publicado resultados en benchmarks de razonamiento general (MMLU, GSM8K, etc.), por lo que no es adecuado para tareas que requieran capacidades cognitivas más allá del OCR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datalab-to/chandra-ocr-2
- Repositorio GitHub: https://github.com/datalab-to/chandra
- Blog de anuncio de Chandra 2: https://www.datalab.to/blog/chandra-2
- Blog de introducción de Chandra: https://www.datalab.to/blog/introducing-chandra
- Playground gratuito: https://www.datalab.to/playground
- API alojada: https://www.datalab.to/
