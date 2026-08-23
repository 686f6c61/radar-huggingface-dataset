# konradjr007/NaviDC-OCR-GGUF

## Resumen

NaviDC-OCR es un modelo de vision-lenguaje ligero de aproximadamente 1.200 millones de parámetros, desarrollado por StarDoc-AI y publicado en Hugging Face. Está diseñado específicamente para el reconocimiento óptico de caracteres (OCR) y el análisis estructural de documentos, tanto digitales como capturados con cámara, unificando ambos escenarios en un único marco. Su arquitectura se basa en Qwen2.5-VL e incorpora una estrategia de aprendizaje desacoplado de contenido y estructura para modelar gramáticas de fórmulas y estructuras de tablas.

La versión GGUF, creada por konradjr007, ofrece cuantizaciones estáticas para ejecución local de alta velocidad mediante llama.cpp, con un proyector multimodal obligatorio para la codificación visual. El modelo destaca por su precisión en la extracción de encabezados, texto, fórmulas LaTeX y tablas Markdown, manteniendo un tamaño reducido que permite su despliegue en hardware de consumo. Su licencia Apache 2.0 facilita el uso comercial y la integración en flujos de producción.

La relevancia actual de NaviDC-OCR radica en la creciente necesidad de procesamiento de documentos automatizado en entornos con recursos limitados, donde los modelos OCR de gran tamaño no son viables. Su capacidad para manejar tanto documentos digitales como fotografías de documentos, junto con su formato GGUF optimizado, lo convierte en una opción práctica para desarrolladores que buscan soluciones de OCR locales, rápidas y sin dependencia de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (vision-language transformer) |
| Parámetros totales | ~1.200 millones (1.2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (configuración recomendada en `llama-server`) |
| Tipos de cuantización | GGUF: Q3_K_M, Q4_K_M, Q5_K_M, Q8_0, F16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors original en el repositorio base) |

## Arquitectura y entrenamiento

NaviDC-OCR se construye sobre la arquitectura de Qwen2.5-VL, un modelo de visión-lenguaje basado en transformer con codificador visual y decodificador de lenguaje. El modelo incorpora un proyector multimodal que alinea las características visuales con el espacio del texto, permitiendo la entrada de imágenes junto con instrucciones textuales. Según el paper de arXiv, se emplea una estrategia de aprendizaje desacoplado de contenido y estructura: el modelo aprende por separado a reconocer el contenido textual (texto, fórmulas) y a modelar la estructura (tablas, layout), lo que mejora la representación estructurada y la precisión en la extracción.

Los detalles exactos del conjunto de datos de entrenamiento (número de tokens, composición del dataset) no se especifican en la información disponible. La card del modelo menciona que fue entrenado para manejar tanto documentos digitales como fotografías de documentos, con énfasis en la extracción geométrica precisa de elementos. No se menciona si se utilizó RLHF o DPO; la técnica principal es el desacoplamiento de contenido y estructura.

## Capacidades

- OCR de documentos digitales y fotografías de documentos: extrae texto de imágenes de páginas escaneadas o fotografiadas.
- Reconocimiento de fórmulas matemáticas: genera representaciones en LaTeX de ecuaciones y expresiones matemáticas.
- Transcripción de tablas: convierte tablas visuales en formato Markdown, preservando la estructura de filas y columnas.
- Generación de salida estructurada: produce documentos Markdown con encabezados, párrafos, listas y tablas.
- Comprensión de layout: identifica la posición geométrica de los elementos (encabezados, cuerpo, tablas) para reconstruir la estructura del documento.
- Multilingüe: soporta inglés y chino, lo que permite procesar documentos en ambos idiomas.
- Integración con `llama.cpp`: compatible con el servidor OpenAI-compatible para inferencia local vía API.

## Casos de uso

- Digitalización de documentos administrativos: extraer texto y tablas de facturas, recibos o formularios escaneados para su almacenamiento estructurado en bases de datos.
- Conversión de documentos académicos a Markdown: procesar artículos científicos o libros que contienen fórmulas matemáticas y tablas, generando una versión editable en Markdown.
- Análisis de informes financieros: extraer tablas de balances o estados de resultados de informes en PDF para su posterior análisis con herramientas de BI.
- Automatización de procesos de negocio: alimentar sistemas de gestión documental con contenido estructurado extraído de documentos digitales o fotografiados.
- Accesibilidad: convertir documentos impresos o digitales en texto legible por lectores de pantalla, preservando la estructura jerárquica.
- Archivo y búsqueda: indexar documentos históricos escaneados, permitiendo búsqueda textual y por estructura (tablas, fórmulas).
- Prototipado de aplicaciones de OCR local: usar el modelo en aplicaciones de escritorio o móviles que requieren OCR sin conexión a internet.

## Benchmarks y rendimiento

La card del modelo proporciona resultados de rendimiento medidos en una NVIDIA RTX GPU con CUDA, sobre una página de documento técnico compleja con encabezados, ecuaciones de Schrödinger y tablas de múltiples columnas:

| Cuantización | Tamaño del modelo | BPW | Velocidad de generación | Velocidad de prompt | Latencia | Precisión / Elementos | Recomendación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Q4_K_M | 461.8 MB | 4.34 | 211.4 tok/s | 1.320,4 tok/s | 1.22 s | 100% (8/8 elementos) | Mejor equilibrio |
| Q5_K_M | 525.8 MB | 5.81 | 205.7 tok/s | 1.262,8 tok/s | 1.26 s | 100% (8/8 elementos) | Alta calidad |
| Q8_0 | 767.5 MB | 8.50 | 195.5 tok/s | 1.243,4 tok/s | 1.30 s | 100% (8/8 elementos) | Referencia |
| Q3_K_M | 394.8 MB | 3.50 | 179.1 tok/s | 1.238,5 tok/s | 6.26 s | Degradado | Ligero |

No se han publicado resultados de benchmarks estandarizados como MMLU, HumanEval o GSM8K para este modelo. Los datos anteriores son los únicos disponibles en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base Q4_K_M ocupa 461.8 MB, el proyector multimodal 1.33 GB, lo que suma aproximadamente 1.8 GB de VRAM para cargar el modelo completo. Con el contexto de 4.096 tokens y overhead, se recomienda al menos 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti (4 GB), RTX 3060 (12 GB), o superiores. Las pruebas se realizaron en una NVIDIA RTX con CUDA.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como la serie RTX 30/40, y también en tarjetas más antiguas con suficiente VRAM.
- **Opciones de despliegue**: `llama.cpp` (incluido en la documentación), servidor OpenAI-compatible, y potencialmente otros motores que soporten GGUF como Ollama o vLLM (si el formato es compatible).
- **Latencia y throughput**: en la tabla de benchmarks, la latencia de generación es de 1.22 s para Q4_K_M, con velocidad de generación de 211.4 tokens/s y velocidad de prompt de 1.320 tokens/s.

## Comparativa con modelos similares

No se dispone de información comparativa directa con otros modelos de OCR en la documentación proporcionada. Se puede mencionar que NaviDC-OCR se basa en Qwen2.5-VL, pero no hay datos de comparación con modelos como OCRonos (QuantFactory/OCRonos-GGUF) o PaddleOCR. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se ha documentado ningún sesgo específico, pero al estar entrenado principalmente en inglés y chino, puede tener menor rendimiento en otros idiomas.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar contenido que no esté en la imagen, especialmente con cuantizaciones más agresivas (Q3_K_M mostró degradación en la precisión).
- **Limitaciones de contexto**: la ventana de contexto recomendada es de 4.096 tokens, lo que limita el procesamiento de documentos muy largos en una sola pasada.
- **Idiomas**: solo soporta inglés y chino; no cubre otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución.
- **Caveats de producción**: la cuantización Q3_K_M muestra una degradación significativa en la precisión, por lo que no se recomienda para uso en producción donde se requiera alta fidelidad. Además, el proyector multimodal es obligatorio para la entrada de imágenes; sin él, el modelo no funciona correctamente.

## Enlaces

- [HuggingFace - konradjr007/NaviDC-OCR-GGUF](https://huggingface.co/konradjr007/NaviDC-OCR-GGUF)
- [HuggingFace - StarDoc-AI/NaviDC-OCR (modelo original)](https://huggingface.co/StarDoc-AI/NaviDC-OCR)
- [GitHub - caipeng328/NaviDC-OCR](https://github.com/caipeng328/NaviDC-OCR)
- [Paper - NaviDC-OCR: Navigating Document Parsing Across Digital and Camera (arXiv)](https://arxiv.org/html/2608.12898v2)
