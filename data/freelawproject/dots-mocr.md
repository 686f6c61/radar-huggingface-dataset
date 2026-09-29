# freelawproject/dots.mocr

## Resumen

dots.mocr es un modelo multimodal de visión-lenguaje especializado en parsing de documentos. Convierte imágenes de páginas (PDF escaneado, capturas, fotogramas de documentos) en texto estructurado y, de forma destacable, en código SVG para gráficos estructurados como diagramas de barras, interfaces de usuario, figuras científicas y tablas complejas. El modelo se presenta como sucesor de dots.ocr y está orientado a tareas de grounding, reconocimiento, comprensión semántica y diálogo interactivo sobre documentos.

Según la model card, el desarrollo corresponde a rednote-hilab (Xiaohongshu) y existe una variante específica para image-to-SVG llamada dots.mocr-svg. El repositorio de HuggingFace consultado figura bajo el identificador freelawproject/dots.mocr, mientras que todos los enlaces de la model card apuntan a rednote-hilab/dots.mocr, por lo que se trata muy probablemente de una copia espejo o re-subida; conviene verificar la procedencia de los pesos antes de usarlos en producción.

El modelo tiene 3.039.179.264 parámetros totales (unos 3,04 mil millones, según los pesos en safetensors) y un repositorio de 6,1 GB, licencia MIT y pipeline image-text-to-text. Está etiquetado para inglés, chino y multilingüe, y declara rendimiento SOTA en parsing multilingüe de documentos dentro de su rango de tamaño, compitiendo en las tablas de evaluación con Gemini 3 Pro, PaddleOCR-VL-1.5 y GLM-OCR. La arquitectura concreta, la longitud de contexto y los detalles de entrenamiento no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal imagen-texto con código personalizado; librería `dots_mocr`, `custom_code`) |
| Parámetros totales | 3.039.179.264 (~3,04 mil millones) |
| Parámetros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors, sin variantes GGUF/AWQ/GPTQ indicadas) |
| Idiomas soportados | inglés (en), chino (zh), multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Etiquetas de tarea | image-to-text, ocr, document-parse, layout, table, formula, conversational |
| Tamaño del repositorio | 6,1 GB |
| Paper | arXiv:2603.13032v1 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de indicar que es un modelo de imagen a texto con código personalizado (`custom_code`, librería `dots_mocr`), pensado para entrada de imagen o documento y salida de texto estructurado o SVG. No se especifica si emplea un transformer denso con encoder visual, un esquema híbrido, atención lineal ni técnicas de decodificación especulativa. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias.

Lo que sí se declara es el conjunto de competencias objetivo: grounding (localización de elementos en la página), reconocimiento (texto, tablas, fórmulas), comprensión semántica del layout y diálogo interactivo sobre el documento. La capacidad diferencial frente a otros OCR es la conversión directa de gráficos estructurados a SVG, para la que existe además un modelo hermano, dots.mocr-svg, optimizado específicamente en esa tarea. Para reproducir detalles de arquitectura y entrenamiento hay que remitirse al paper arXiv:2603.13032v1 y al repositorio de GitHub del autor, no incluidos en el material proporcionado.

## Capacidades

- Parsing de documentos multilingüe (inglés, chino y otros idiomas) con salida de texto estructurado.
- Reconocimiento y reconstrucción de tablas, incluidas tablas complejas y de múltiples columnas.
- Reconocimiento de fórmulas matemáticas dentro de documentos científicos y escaneos antiguos.
- Conversión de gráficos estructurados a SVG: diagramas, layouts de interfaz, figuras científicas.
- Grounding: localización de regiones y elementos dentro de la imagen.
- Comprensión semántica del layout del documento (cabeceras, pies, columnas, orden de lectura).
- Diálogo interactivo sobre el contenido del documento (etiqueta `conversational`).
- Manejo de documentos escaneados de baja calidad y de texto pequeño en documentos largos, según las categorías evaluadas en olmOCR-bench.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni flujos agénticos multi-paso.
- No se documenta soporte de audio, vídeo ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Digitalización masiva de archivos jurídicos y administrativos: el modelo puede procesar lotes de PDF escaneados y devolver texto estructurado, preservando tablas y encabezados, algo crítico en expedientes con documentos de décadas distintas. Es adecuado por su rendimiento declarado en "old scans" y "old scans math" dentro de olmOCR-bench.
- Extracción de tablas financieras: convertir estados contables en imágenes a estructuras de filas y columnas, con reconstrucción de tablas complejas, para alimentar sistemas de contabilidad o análisis.
- Conversión de artículos científicos a formato estructurado: reconocimiento de fórmulas, figuras y secciones para construir bases de conocimiento o pipelines de RAG sobre literatura académica.
- Reconstrucción de interfaces de usuario a partir de capturas o mockups: la salida en SVG permite generar código de layout reutilizable a partir de una imagen, útil en herramientas de diseño a código.
- Recuperación de gráficos y diagramas para documentación técnica: convertir figuras de manuales a SVG vectorial editable en lugar de recortes rasterizados.
- Indexación y búsqueda semántica sobre corpus documentales: el modelo sirve como etapa de parseo previa a un motor de búsqueda o a un sistema de preguntas y respuestas sobre documentos.
- Atención al cliente sobre documentos: escenarios donde el usuario sube una factura, un contrato o un formulario y el sistema necesita extraer campos y responder preguntas sobre ellos, aprovechando el modo conversacional.
- Auditoría de calidad de OCR: comparar la salida del modelo con la de otros motores (por ejemplo PaddleOCR-VL o MinerU) para detectar discrepancias en documentos críticos.

## Benchmarks y rendimiento

Puntuaciones Elo comparadas entre modelos (evaluación con Gemini 3 Flash; cifras tal como aparecen en la model card):

| Modelo | olmOCR-Bench | OmniDocBench (v1.5) | XDocParse | Promedio |
|---|---|---|---|---|
| MonkeyOCR-pro-3B | 895,0 | 811,3 | 637,1 | 781,1 |
| GLM-OCR | 884,2 | 972,6 | 820,7 | 892,5 |
| PaddleOCR-VL-1.5 | 897,3 | 997,9 | 866,4 | 920,5 |
| HuanyuanOCR | 997,6 | 1003,9 | 951,1 | 984,2 |
| dots.ocr | 1041,1 | 1027,2 | 1190,3 | 1086,2 |
| dots.mocr | 1104,4 | 1059,0 | 1210,7 | 1124,7 |
| Gemini 3 Pro | 1180,4 | 1128,0 | 1323,7 | 1210,7 |

Resultados en olmOCR-bench (precisión por categoría, tal como aparecen en el extracto disponible):

| Modelo | ArXiv | Old scans math | Tables | Old scans | Headers & footers | Multi column | Long tiny text | Base | Overall |
|---|---|---|---|---|---|---|---|---|---|
| Mistral OCR API | 77,2 | 67,5 | 60,6 | 29,3 | 93,6 | 71,3 | 77,1 | 99,4 | 72,0±1,1 |
| Marker 1.10.1 | 83,8 | 66,8 | 72,9 | 33,5 | 86,6 | 80,0 | 85,7 | 99,3 | 76,1±1,1 |
| MinerU 2.5.4 | 76,6 | 54,6 | 84,9 | 33,7 | 96,6 | 78,2 | 83,5 | 93,7 | 75,2±1,1 |
| DeepSeek-OCR | 77,2 | 73,6 | 80,2 | 33,3 | 96,1 | 66,4 | 79,4 | 99,8 | 75,7±1,0 |
| Nanonets-OCR2-3B | 75,4 | 46,1 | 86,8 | 40,9 | 32,1 | 81,9 | 93,0 | 99,6 | 69,5±1,1 |
| PaddleOCR-VL | 85,7 | 71,0 | 84,1 | 37,8 | 97,0 | 79,9 | 85,7 | 98,5 | 80,0±1,0 |

Notas de la model card: los resultados de Gemini 3 Pro, PaddleOCR-VL-1.5 y GLM-OCR se obtuvieron vía API, mientras que los de HuanyuanOCR se generaron con inferencia local. La fila de dots.mocr en la tabla de olmOCR-bench no está incluida en el extracto proporcionado, por lo que su puntuación desglosada por categoría figura como no disponible. No se han publicado en la información disponible resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K, que en cualquier caso no son representativos para un modelo de OCR.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del recuento de parámetros (3,04 mil millones) y del tamaño del repositorio (6,1 GB), no datos publicados por el autor; trátalas como orientativas.

- VRAM estimada para inferencia en fp16/bf16: en torno a 6-7 GB para los pesos, más el encoder visual y la caché KV, que crece con el número de tokens de imagen de cada documento.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3-4 GB para los pesos, más los mismos overcostes de encoder y caché.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2-3 GB para los pesos, aunque no se publican pesos cuantizados oficiales para esta arquitectura personalizada.
- GPU consumer: cabe con holgura en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En 8 GB es probable que funcione con cuantización, pero exige validación, ya que la librería es de código personalizado.
- GPU de datacenter: A100 40/80 GB, H100 y L40S son adecuadas para procesamiento por lotes y para maximizar throughput cuando se procesan muchos documentos.
- Despliegue: la ruta documentada es `transformers` con `trust_remote_code=True` y la librería `dots_mocr`. La compatibilidad con vLLM, TGI, llama.cpp u Ollama no está indicada en la información disponible y, al tratarse de una arquitectura con código personalizado, no debería asumirse.
- Latencia y throughput: no disponibles. Dependen fuertemente del número de tokens visuales por página y del tamaño de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Promedio Elo | olmOCR-bench (overall) | Disponibilidad |
|---|---|---|---|---|---|---|
| dots.mocr | ~3,04B | no disponible | MIT | 1124,7 | no disponible en el extracto | HuggingFace (repo consultado: freelawproject/dots.mocr; original: rednote-hilab/dots.mocr) |
| dots.ocr | no disponible | no disponible | no disponible | 1086,2 | no disponible | HuggingFace |
| MonkeyOCR-pro-3B | ~3B (según denominación) | no disponible | no disponible | 781,1 | no disponible | no disponible |
| PaddleOCR-VL-1.5 | no disponible | no disponible | no disponible | 920,5 | 80,0±1,0 (PaddleOCR-VL) | API y pesos publicados |
| GLM-OCR | no disponible | no disponible | no disponible | 892,5 | no disponible | vía API |
| HuanyuanOCR | no disponible | no disponible | no disponible | 984,2 | no disponible | inferencia local |
| DeepSeek-OCR | no disponible | no disponible | no disponible | no disponible | 75,7±1,0 | pesos publicados |
| MinerU 2.5.4 | no disponible | no disponible | no disponible | no disponible | 75,2±1,1 | pesos publicados |
| Gemini 3 Pro | propietario | no disponible | propietario | 1210,7 | no disponible | vía API |

En la comparativa de Elo, dots.mocr queda por encima de todos los modelos abiertos de la tabla y por debajo de Gemini 3 Pro, con una diferencia de 86 puntos en el promedio. Frente a modelos de OCR puros como DeepSeek-OCR, MinerU o Marker, la ventaja declarada es doble: mejor puntuación en document parsing y la capacidad adicional de generar SVG.

## Limitaciones y advertencias

- Riesgo de alucinación en OCR: como cualquier modelo generativo aplicado a documentos, puede inventar texto, filas de tabla o símbolos en zonas de baja calidad, sellos, marcas de agua o manuscritos. En dominios jurídicos o financieros esto es especialmente crítico y exige verificación humana o validación cruzada con un segundo motor.
- Procedencia del repositorio: los metadatos indican autor `freelawproject` y URLs de HuggingFace bajo `rednote-hilab`, con 0 descargas y 0 likes y fechas de creación y actualización separadas por un segundo, lo que apunta a una copia espejo automatizada. Verifica el hash de los pesos contra el repositorio original antes de usarlos en producción.
- Código personalizado: la librería `dots_mocr` y la etiqueta `custom_code` implican ejecutar código remoto con `trust_remote_code=True`, lo que supone un riesgo de seguridad si el repositorio no es de confianza.
- Idiomas: la model card declara inglés, chino y multilingüe de forma genérica, sin desglose por idioma. El rendimiento en castellano no está documentado y debería medirse antes de desplegar en producción en español.
- Contexto: la longitud de contexto no está publicada, lo que impide planificar con precisión el procesamiento de documentos muy largos o de conversaciones multi-turno extensas.
- Entrenamiento y sesgos: no hay información sobre composición del dataset, sesgos conocidos ni procesos de alineación, por lo que no es posible evaluar sesgos sistemáticos ni comportamientos no deseados.
- Cuantizaciones: no se publican variantes GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos con poca VRAM o en herramientas tipo Ollama.
- Licencia: MIT permite uso comercial sin restricciones declaradas, pero esa permisividad aplica a los pesos publicados; confirma que la copia que uses conserva la licencia original y los avisos de copyright.
- Integración en producción: al no confirmarse compatibilidad con vLLM o TGI, el throughput en despliegues de alto volumen es incierto y puede requerir implementación propia.
- Cifras de benchmark: las puntuaciones Elo proceden de un juez automático (Gemini 3 Flash) y no de una métrica objetiva de exactitud; tómalas como comparativas relativas, no como tasas de acierto.

## Enlaces

- Modelo en HuggingFace (repositorio consultado): https://huggingface.co/freelawproject/dots.mocr
- Modelo original referenciado en la model card: https://huggingface.co/rednote-hilab/dots.mocr
- Variante especializada en image-to-SVG: https://huggingface.co/rednote-hilab/dots.mocr-svg
- Repositorio GitHub: https://github.com/rednote-hilab/dots.mocr
- Paper: https://arxiv.org/abs/2603.13032v1
- Demo en vivo: https://dotsocr.xiaohongshu.com
- Prompt de evaluación Elo: https://github.com/rednote-hilab/dots.mocr/blob/master/tools/elo_score_prompt.py
- OCR Arena (resultados de comparación): https://www.ocrarena.ai/battle
- Perfil de Xiaohongshu: https://www.xiaohongshu.com/user/profile/683ffe42000000001d021a4c
- Perfil de X: https://x.com/rednotehilab
