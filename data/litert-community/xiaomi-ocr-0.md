# litert-community/Xiaomi-OCR-0

## Resumen

Xiaomi-OCR-0 es un modelo de visión-lenguaje especializado en extracción de información de documentos, desarrollado por Xiaomi Research y publicado originalmente el 30 de septiembre de 2026. El modelo parte de Qwen3.5-0.8B-Base y añade un codificador visual de 12 capas, dando lugar a un sistema de aproximadamente 0,8 mil millones de parámetros capaz de convertir páginas de documentos en Markdown estructurado, con tablas en formato OTSL y fórmulas en LaTeX.

La ficha que nos ocupa documenta la conversión del modelo original al formato LiteRT-LM (`.litertlm`), realizada por la comunidad litert-community mediante la herramienta hf-to-litertlm para LiteRT-LM 0.19.0 de Google. Esta conversión está pensada para inferencia en dispositivo (on-device) y en el borde (edge), con pesos int8 en las capas lineales del decodificador de texto y un codificador visual en fp16, lo que reduce el artefacto a 1,31 GB.

El interés actual del modelo reside en su orientación práctica: OCR de documentos completo con reconocimiento de tablas, fórmulas y extracción de campos estructurados como JSON, ejecutable en teléfonos Android de gama alta sin depender de infraestructura en la nube. Su ventana de contexto de 4.096 tokens y su resolución de imagen fija de 768 × 1344 píxeles (1.008 tokens de imagen) delimitan con claridad su ámbito de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador visual de 12 capas + decodificador de texto Qwen3.5 híbrido (18 capas GatedDeltaNet + 6 capas de atención) |
| Parámetros totales | ~0,8B (modelo base Qwen3.5-0.8B-Base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (imagen + prompt ocupan ~1.030–1.100 tokens) |
| Tipos de cuantización | int8 (capas lineales del decodificador, tabla de embeddings, adaptador visual); fp16 (codificador visual); 36 proyecciones decay/gate de GatedDeltaNet en float |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo original presumiblemente en safetensors vía transformers (no confirmado en la información disponible) |

## Arquitectura y entrenamiento

El modelo combina un codificador visual de 12 capas con un decodificador de texto derivado de Qwen3.5-0.8B-Base, que emplea una arquitectura híbrida: 18 capas GatedDeltaNet y 6 capas de atención clásica. Esta mezcla de atención lineal y atención completa reduce el coste computacional en contextos largos manteniendo la calidad de representación. Cada petición procesa una única imagen redimensionada a 768 × 1344 píxeles, que se tokeniza en 1.008 tokens visuales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card original de Xiaomi Research no detalla estos aspectos en la información proporcionada. La innovación técnica destacable en esta ficha es la propia conversión a LiteRT-LM: pesos int8 en las capas lineales, codificador visual fp16 y activaciones fp32 declaradas para GPU, con el objetivo de habilitar inferencia local en Android (CPU o GPU) y en iOS (Metal). El runtime aplica un redimensionado fijo sin preservar la relación de aspecto ni leer la orientación EXIF, lo que obliga al script de uso a aplicar padding sobre un lienzo blanco de proporción 4:7 antes de la inferencia.

## Capacidades

- Extracción de texto plano a partir de imágenes de documentos, líneas de texto y títulos.
- Conversión de páginas completas a Markdown respetando el orden de lectura, ignorando cabeceras y pies de página.
- Reconocimiento de tablas y serialización en formato OTSL.
- Reconocimiento de fórmulas matemáticas y serialización en LaTeX.
- Extracción de información clave (KIE) en formato JSON a partir de un esquema de claves proporcionado por el usuario.
- Procesamiento de texto en inglés y chino.
- Cinco prompts de tarea predefinidos: `document`, `text`, `table`, `formula` y `kie`.
- Soporte de prompt personalizado mediante el parámetro `--prompt` del script de referencia.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- No se documenta soporte de audio ni de vídeo.

## Casos de uso

- Digitalización de facturas y recibos en aplicaciones móviles: el modelo extrae campos como nombre del comercio, fecha, impuestos y total directamente en JSON mediante la tarea `kie`, lo que permite integrar los datos en sistemas de contabilidad sin postprocesado manual. La muestra `receipt_to_json` de litert-samples demuestra este flujo en Android con la API Kotlin de LiteRT-LM.
- Conversión de documentación técnica a Markdown para bases de conocimiento: la tarea `document` transforma páginas con tablas y fórmulas en Markdown con OTSL y LaTeX, adecuado para alimentar wikis internas o pipelines de RAG documental.
- Procesamiento de artículos científicos y material docente: la tarea `formula` serializa expresiones matemáticas en LaTeX, lo que facilita la reutilización en entornos de publicación científica o plataformas de aprendizaje.
- Extracción de tablas de informes financieros: la tarea `table` devuelve OTSL, un formato estructurado que preserva la disposición de filas y columnas y puede convertirse posteriormente a CSV o a estructuras de dataframe.
- OCR de documentos en inglés y chino en entornos sin conectividad: al ejecutarse en CPU de dispositivos Android de gama alta (por ejemplo, Galaxy S26 con tiempos de 10–13 s por página), el modelo es viable en escenarios de campo, auditoría o logística donde no hay acceso a servicios en la nube.
- Captura de texto en aplicaciones de accesibilidad o lectura asistida: la tarea `text` extrae texto plano de líneas y títulos, apropiada para funciones de lectura en voz alta o ampliación de contenido.
- Automatización de ingesta documental en pipelines de CI/CD o backend: aunque el artefacto está optimizado para edge, el modelo original en transformers puede emplearse para validar extracciones y comparar resultados contra la versión cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card de la conversión LiteRT-LM reporta exclusivamente métricas de latencia y corrección funcional:

| Escenario | Dispositivo | Backend | Tiempo observado |
|---|---|---|---|
| Párrafo de texto | Galaxy S26 | CPU | ~10 s (incluye creación del engine) |
| Página completa | Galaxy S26 | CPU | ~13 s (incluye creación del engine) |
| Petición CPU vs GPU | Galaxy S26 | CPU / GPU | 10–13 s vs 42–62 s |
| Petición CPU vs GPU | Pixel 11 Pro | CPU / GPU | 20–26 s vs 92–155 s |
| Petición GPU | iPhone 18 Pro | Metal | 20–22 s |
| Corrección en Mac | Mac | GPU / CPU | 14/14 vs 11/14 tests de región superados |

La validación de corrección se realizó contra el modelo original fp32 con decodificación greedy, exigiendo un CER ≤ 0,02 en texto (≤ 0,05 en fotos y páginas), al menos 18 de 20 celdas de tabla correctas, LaTeX idéntico y todos los campos JSON presentes. Una página manuscrita densa falla en Mac, Pixel 11 Pro e iPhone 18 Pro, y también en el modelo original a esa resolución.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente al tratarse de un artefacto edge; el archivo `.litertlm` ocupa 1,31 GB en disco y debe residir en memoria durante la ejecución.
- GPU recomendadas: no se documentan GPU de escritorio; el artefacto está orientado a CPU Android, GPU Android y GPU Metal en iOS. En Mac se ha probado con GPU (14/14 tests superados) y CPU (11/14).
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: LiteRT-LM 0.19.0 (runtime principal), API Kotlin `litertlm-android` 0.19.0 para Android, script Python `ocr_xiaomi.py` con `litert-lm`, `pillow` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: en Galaxy S26, 10–13 s por petición en CPU; en Pixel 11 Pro, 20–26 s en CPU; en iPhone 18 Pro, 20–22 s en GPU Metal. La creación del engine domina el tiempo en GPU Android (42–62 s y 92–155 s), por lo que se recomienda crear un Engine por imagen.
- Nota operativa: LiteRT-LM redimensiona toda imagen a 768 × 1344 sin preservar aspect ratio ni orientación EXIF, por lo que es imprescindible aplicar padding y orientación antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Xiaomi-OCR-0 (esta ficha, LiteRT-LM) | ~0,8B | 4.096 tokens | en, zh | Apache 2.0 | `.litertlm`, edge |
| Xiaomi-OCR-0 (original, xiaomi-research) | ~0,8B | no disponible | en, zh | Apache 2.0 | transformers (presumible) |
| Qwen3.5-0.8B-Base | 0,8B | no disponible | no disponible | no disponible | safetensors |
| Alternativas OCR/VLM de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks comparativos con otros modelos OCR o VLM de tamaño similar, ni de especificaciones detalladas de alternativas como PaddleOCR-VL, GOT-OCR2.0 o modelos Qwen-VL pequeños. La comparativa queda limitada a la relación entre el modelo original y su conversión LiteRT-LM.

## Limitaciones y advertencias

- Resolución de imagen fija: toda entrada se redimensiona a 768 × 1344 píxeles, lo que degrada documentos muy anchos, páginas apaisadas o imágenes de muy alta resolución.
- Ventana de contexto de 4.096 tokens: la imagen consume ~1.008 tokens y el prompt ~1.030–1.100, dejando un margen de aproximadamente 3.000 tokens para la respuesta; documentos con tablas o fórmulas muy extensas pueden truncarse.
- Idiomas limitados a inglés y chino; no se documenta soporte para castellano ni otras lenguas.
- Página manuscrita densa: falla tanto en la conversión LiteRT-LM como en el modelo original a esta resolución, lo que indica una limitación del modelo base, no solo de la cuantización.
- Sin datos de sesgos, alucinación o robustez frente a documentos adversarios en la información disponible; se recomienda validación humana en flujos de KIE con implicaciones financieras o legales.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B-Base y de los componentes de terceros incluidos en el runtime LiteRT-LM.
- Problemas conocidos del runtime: en Android, las peticiones GPU tardan 4–6 veces más que las CPU por el coste de creación del engine; en iOS, una ejecución CPU fue interrumpida por el sistema durante la creación del engine. Se recomienda usar CPU en Android y GPU Metal en iPhone.
- El artefacto es una conversión comunitaria, no oficial de Xiaomi; la fidelidad funcional se ha validado contra el original fp32, pero no hay garantía de paridad absoluta en todos los documentos.
- Dependencia de un runtime específico (LiteRT-LM 0.19.0) y de un script de referencia para el padding; la integración directa en otros frameworks no está documentada.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/litert-community/Xiaomi-OCR-0
- Modelo original de Xiaomi Research: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de inferencia `ocr_xiaomi.py`: https://github.com/john-rocky/hf-to-litertlm/blob/main/xiaomiocr_work/ocr_xiaomi.py
- Runtime LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
- Muestra Android `receipt_to_json`: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert_lm/receipt_to_json
- Model card original con prompts de tarea: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0 (sección "Task prompts")
