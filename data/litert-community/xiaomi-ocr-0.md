# litert-community/Xiaomi-OCR-0

## Resumen

Xiaomi-OCR-0 es un modelo de visión-lenguaje especializado en OCR y parseo de documentos, desarrollado por Xiaomi Research y publicado originalmente el 30 de septiembre de 2026. Con 0,8 mil millones de parámetros, está construido a partir de Qwen3.5-0.8B-Base e incorpora un encoder visual de 12 capas junto con un decoder de texto híbrido (18 capas GatedDeltaNet y 6 de atención). Su función principal es convertir imágenes de páginas de documento en Markdown estructurado, representando tablas en formato OTSL y fórmulas en LaTeX, además de extraer campos con nombre en JSON.

La ficha que nos ocupa corresponde a la conversión del modelo original al formato LiteRT-LM (`.litertlm`), realizada por la comunidad litert-community mediante la herramienta `hf-to-litertlm` para LiteRT-LM 0.19.0 de Google. Esta conversión está pensada para inferencia en dispositivo (on-device) en Android, iOS y macOS, con pesos cuantizados a int8 en las capas lineales del decoder y el adaptador visual, encoder visual en fp16 y tabla de embeddings en int8, lo que reduce el artefacto a 1,31 GB.

El modelo es relevante ahora porque demuestra que tareas de OCR documental complejo (tablas, fórmulas, extracción de campos) pueden ejecutarse localmente en teléfonos de gama alta sin conexión, con latencias de 10 a 13 segundos por página en CPU sobre un Galaxy S26. La licencia Apache 2.0 facilita su integración comercial, y su ventana de contexto de 4.096 tokens permite respuestas de hasta unos 3.000 tokens tras consumir entre 1.030 y 1.100 tokens en la imagen y el prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: encoder visual de 12 capas + decoder de texto híbrido Qwen3.5 (18 capas GatedDeltaNet + 6 capas de atención) |
| Parametros totales | 0,8 mil millones (aproximado, según designación del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (1.030-1.100 consumidos por imagen y prompt; hasta ~3.000 para la respuesta) |
| Tipos de cuantizacion | int8 en capas lineales del decoder (36 proyecciones decay/gate de GatedDeltaNet en float), embeddings int8, encoder visual fp16, adaptador visual int8; activaciones fp32 para GPU en decoder y fp16 para GPU en encoder |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en formato transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base y añade un encoder visual de 12 capas que procesa una imagen redimensionada a 768 × 1344 píxeles, la cual se tokeniza en 1.008 tokens visuales. El decoder de texto es híbrido: combina 18 capas GatedDeltaNet (atención lineal con estado recurrente) con 6 capas de atención estándar, una configuración que busca reducir el coste computacional en contextos largos manteniendo capacidad de modelado. El adaptador visual conecta ambas torres y en la conversión LiteRT-LM se cuantiza a int8.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La model card original define cinco prompts de tarea (documento completo, región de texto, región de tabla, región de fórmula y extracción de información clave), lo que sugiere un entrenamiento orientado a instrucciones específicas de OCR estructurado. La conversión a LiteRT-LM no altera los pesos más allá de la cuantización descrita y declara activaciones en fp32/fp16 para su ejecución en GPU.

## Capacidades

- Parseo de documentos completos a Markdown, respetando el orden de lectura e ignorando cabeceras y pies de página.
- Reconocimiento de tablas con salida en formato OTSL (no HTML ni Markdown convencional).
- Reconocimiento de fórmulas matemáticas con salida en LaTeX.
- Extracción de texto plano de regiones de imagen (líneas, títulos, párrafos).
- Extracción de información clave (KIE) con salida JSON según un esquema de claves definido por el usuario.
- Procesamiento de imágenes en orientación retrato con relación de aspecto 4:7 (768 × 1344), incluyendo aplicación de orientación EXIF y padding a lienzo blanco.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de facturas y recibos en aplicaciones móviles: el modelo extrae campos como nombre de tienda, fecha, impuestos y total en JSON mediante el prompt de KIE, y la muestra `receipt_to_json` de google-ai-edge demuestra su integración en Android con la API Kotlin de LiteRT-LM.
- Archivado de documentos escaneados: convierte páginas completas a Markdown con tablas en OTSL y fórmulas en LaTeX, adecuado para pipelines de indexación y búsqueda sobre corpus técnicos o académicos.
- Procesamiento de documentación científica: la preservación de fórmulas en LaTeX permite reutilizar contenido matemático en editores, wikis o sistemas de publicación sin retipear.
- Extracción de tablas de informes financieros: la salida OTSL facilita la conversión posterior a hojas de cálculo o bases de datos estructuradas.
- Asistentes de accesibilidad en dispositivo: lectura en voz alta de texto de imágenes en inglés o chino sin enviar datos a la nube, con latencias de 10-13 segundos por página en CPU de gama alta.
- Aplicaciones de campo sin conectividad: inspección de documentos en entornos sin red, aprovechando que el artefacto de 1,31 GB cabe en el almacenamiento de un teléfono y se ejecuta íntegramente en local.
- Preprocesado de corpus para entrenamiento: conversión masiva de PDFs e imágenes a Markdown estructurado antes de alimentar otros modelos o sistemas RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión reporta únicamente métricas de latencia y correctitud cualitativa:

| Escenario | Dispositivo | Backend | Latencia |
|---|---|---|---|
| Párrafo de texto | Galaxy S26 | CPU | ~10 s |
| Página completa | Galaxy S26 | CPU | ~13 s |
| Párrafo de texto | Galaxy S26 | GPU | 42-62 s |
| Párrafo de texto | Pixel 11 Pro | CPU | 20-26 s |
| Párrafo de texto | Pixel 11 Pro | GPU | 92-155 s (caché desactivada) |
| Párrafo de texto | iPhone 18 Pro | GPU (Metal) | 20-22 s |

En cuanto a correctitud, el modelo supera 14 pruebas de región en GPU sobre Mac y 11 en CPU, con un criterio de coincidencia frente al modelo original fp32 (tasa de error de caracteres ≤ 0,02 en texto, ≤ 0,05 en fotos y páginas, al menos 18 de 20 celdas de tabla correctas, LaTeX idéntico y todos los campos JSON presentes). Una página manuscrita densa falla en Mac, Pixel 11 Pro e iPhone 18 Pro, y también en el modelo original a ese tamaño de imagen.

## Requisitos de hardware

- VRAM/almacenamiento: el artefacto `Xiaomi-OCR-0_int8.litertlm` ocupa 1,31 GB; el repositorio completo pesa 2,6 GB.
- GPU recomendadas: no se especifican modelos de escritorio; la model card documenta ejecución en CPU de Android (Galaxy S26, Pixel 11 Pro), GPU Metal en iPhone 18 Pro y GPU en Mac.
- Compatibilidad con GPU de consumo: no se detalla soporte para RTX 4090, A100 o H100; el formato LiteRT-LM está orientado a edge y no se documenta su ejecución en GPUs de servidor.
- Opciones de despliegue: LiteRT-LM 0.19.0 (runtime oficial de Google), API Kotlin `litertlm-android` 0.19.0 para Android, y el script `ocr_xiaomi.py` para escritorio. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU de Galaxy S26, 10-13 s por petición; en Pixel 11 Pro, 20-26 s; en iPhone 18 Pro con GPU Metal, 20-22 s. El backend GPU en Android resulta 4-6 veces más lento que la CPU debido al coste de creación del motor.
- Nota de integración: se recomienda crear un Engine por imagen; LiteRT-LM redimensiona toda imagen a 768 × 1344 sin preservar la relación de aspecto ni leer la orientación EXIF, por lo que el preprocesado debe aplicar la orientación y el padding manualmente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato/despliegue | Notas |
|---|---|---|---|---|---|---|
| Xiaomi-OCR-0 (esta conversión) | ~0,8B | 4.096 | en, zh | Apache 2.0 | LiteRT-LM, on-device | OCR documental con OTSL, LaTeX y KIE JSON |
| xiaomi-research/Xiaomi-OCR-0 (original) | ~0,8B | no disponible | en, zh | Apache 2.0 | Transformers (fp32) | Referencia de correctitud; no optimizado para edge |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al entrenarse solo con inglés y chino, el rendimiento en otros idiomas es incierto.
- Riesgo de alucinación: no cuantificado; el criterio de correctitud de la model card exige coincidencia con el modelo fp32, pero no se reportan tasas de error absolutas sobre corpus independientes.
- Limitación de contexto: la ventana es de 4.096 tokens y la imagen consume 1.008, dejando un margen de respuesta de ~3.000 tokens; documentos muy extensos requieren segmentación.
- Limitación de resolución: toda imagen se redimensiona a 768 × 1344 sin preservar la relación de aspecto, lo que puede degradar texto pequeño o páginas con formato atípico; una página manuscrita densa falla en todos los dispositivos probados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Caveats de producción: el backend GPU en Android es 4-6 veces más lento que la CPU por el coste de creación del motor; en iOS una prueba en CPU fue terminada por el sistema durante la creación del motor; se recomienda crear un Engine por imagen y gestionar los directorios de caché separados del archivo del modelo.
- Idiomas: solo inglés y chino; no hay soporte declarado para castellano ni otras lenguas.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/litert-community/Xiaomi-OCR-0
- Modelo base original: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de inferencia ocr_xiaomi.py: https://github.com/john-rocky/hf-to-litertlm/blob/main/xiaomiocr_work/ocr_xiaomi.py
- Runtime LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
- Muestra Android receipt_to_json: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert_lm/receipt_to_json
