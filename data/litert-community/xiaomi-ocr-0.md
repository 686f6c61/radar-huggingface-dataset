# litert-community/Xiaomi-OCR-0

## Resumen

Xiaomi-OCR-0 es un modelo de visión-lenguaje de 0,8 mil millones de parámetros especializado en digitalización de documentos, desarrollado por Xiaomi Research y publicado originalmente el 30 de septiembre de 2026. Convierte imágenes de páginas en Markdown estructurado, representando tablas en formato OTSL y fórmulas en LaTeX, además de extraer campos con nombre en JSON. Su decodificador de texto deriva de Qwen3.5-0.8B-Base, lo que le aporta un contexto de 4.096 tokens.

La ficha que nos ocupa documenta la conversión de `litert-community/Xiaomi-OCR-0`, una versión cuantizada a int8 empaquetada en formato `.litertlm` para el runtime LiteRT-LM de Google (versión 0.19.0). El objetivo es la inferencia en dispositivo (*on-device*): el archivo pesa 1,31 GB y procesa una imagen de 768 × 1344 píxeles por petición, que se traduce en 1.008 tokens de imagen.

Su relevancia actual reside en que permite ejecutar OCR documental avanzado (tablas, fórmulas, extracción de campos) sin conexión a la nube, con latencias de 10 a 13 segundos por página en un Galaxy S26 usando la CPU. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder de 12 capas + decodificador de texto híbrido Qwen3.5 (18 capas GatedDeltaNet + 6 capas de atención) |
| Parametros totales | 0,8 mil millones (aproximado, según model card del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | int8 en capas lineales del decodificador, tabla de embeddings int8, adaptador de visión int8, encoder de visión fp16; proyecciones de decay/gate de GatedDeltaNet en float |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base original en safetensors |
| Tamano del archivo | 1,31 GB (`Xiaomi-OCR-0_int8.litertlm`) |
| Resolucion de imagen | 768 × 1344 píxeles por petición (1.008 tokens de imagen) |
| Runtime | LiteRT-LM 0.19.0 |

## Arquitectura y entrenamiento

El modelo combina un encoder de visión de 12 capas con un decodificador de texto híbrido basado en Qwen3.5-0.8B-Base. El decodificador alterna 18 capas GatedDeltaNet con 6 capas de atención estándar, una arquitectura que busca reducir el coste computacional de la atención en secuencias largas manteniendo capacidad de modelado. El modelo base fue entrenado por Xiaomi Research partiendo de Qwen3.5-0.8B-Base; no se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión a LiteRT-LM la realizó `litert-community` con la herramienta `hf-to-litertlm` de john-rocky. La cuantización es selectiva: las capas lineales del decodificador, la tabla de embeddings y el adaptador de visión pasan a int8, mientras que las 36 proyecciones de decay/gate de GatedDeltaNet se mantienen en float y el encoder de visión en fp16. Las activaciones del decodificador se declaran en fp32 y las del encoder de visión en fp16 para su ejecución en GPU. No se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Extracción de documentos completos a Markdown, respetando el orden de lectura e ignorando cabeceras y pies de página.
- Reconocimiento de tablas y serialización en formato OTSL.
- Reconocimiento de fórmulas matemáticas y conversión a LaTeX.
- Extracción de texto plano de regiones de imagen (líneas, títulos, párrafos).
- Extracción de información clave (KIE): devuelve un objeto JSON según un esquema de campos proporcionado por el usuario.
- Procesamiento de documentos en inglés y chino.
- Cinco prompts de tarea predefinidos: `document`, `text`, `table`, `formula` y `kie`, más la opción de enviar un prompt propio.
- Ejecución en dispositivo en Android (CPU o GPU), iOS (GPU con Metal) y macOS (CPU o GPU).
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Digitalización de facturas y recibos: con la tarea `kie` y un esquema JSON de campos (por ejemplo `store_name,date,total`), el modelo devuelve los valores estructurados directamente, lo que permite alimentar sistemas de contabilidad sin post-procesado manual.
- Extracción de tablas de informes financieros: la tarea `table` serializa la tabla en OTSL, un formato que preserva la estructura de filas y columnas y facilita su conversión posterior a CSV o HTML.
- Conversión de apuntes científicos a Markdown: la tarea `document` detecta fórmulas y las emite en LaTeX, lo que resulta adecuado para digitalizar documentación técnica y papers escaneados.
- Procesamiento offline en dispositivos móviles: al ejecutarse con LiteRT-LM en un Galaxy S26 o un Pixel 11 Pro, permite escanear documentos en entornos sin conectividad, con latencias de 10 a 26 segundos por página en CPU.
- Digitalización de documentación en chino: el soporte nativo de `zh` lo hace útil para empresas con documentación en ese idioma, incluidas muestras de caligrafía según las pruebas del autor de la conversión.
- Captura de formularios en campo: la tarea `kie` sobre fotografías de formularios permite extraer campos en aplicaciones de inspección o logística desde el propio terminal.
- Preprocesado de corpus para RAG: la conversión de páginas a Markdown estructurado genera texto limpio y tablas parseables que pueden indexarse en sistemas de recuperación documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card de la conversión incluye pruebas de corrección y latencia:

| Dispositivo | Backend | Regiones correctas (de 14) | Páginas correctas (de 4) | Latencia por petición |
|---|---|---|---|---|
| Mac M4 Max | GPU | 14 | 3 | no disponible |
| Mac M4 Max | CPU | 11 | 3 | no disponible |
| Pixel 11 Pro | CPU | 13 | 3 | 20–26 s |
| Galaxy S26 | CPU | no disponible | no disponible | 10–13 s (párrafo ~10 s, página ~13 s) |
| Galaxy S26 | GPU | no disponible | no disponible | 42–62 s |
| Pixel 11 Pro | GPU | no disponible | no disponible | 92–155 s (caché de GPU desactivada) |
| iPhone 18 Pro | GPU (Metal) | no disponible | no disponible | 20–22 s |

El criterio de corrección exige una tasa de error de caracteres ≤ 0,02 en texto (≤ 0,05 en fotos y páginas), al menos 18 de 20 celdas de tabla correctas, el mismo LaTeX y todos los campos JSON presentes. Una página manuscrita densa falla en Mac, Pixel 11 Pro e iPhone 18 Pro, y el modelo original tampoco la resuelve a ese tamaño de imagen.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo int8 ocupa 1,31 GB; la inferencia requiere espacio adicional para activaciones y caché del runtime.
- GPU de escritorio: no se documentan requisitos para A100, H100 o RTX 4090; el runtime LiteRT-LM está orientado a dispositivos edge.
- Dispositivos verificados: Galaxy S26 (CPU recomendada), Pixel 11 Pro (CPU recomendada), iPhone 18 Pro (GPU con Metal) y Mac M4 Max (GPU o CPU).
- En Android, la CPU es entre cuatro y seis veces más rápida que la GPU en las pruebas realizadas, porque la creación del motor en GPU consume la mayor parte del tiempo.
- Opciones de despliegue: runtime `litert-lm` (Python) con el script `ocr_xiaomi.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Throughput: una petición procesa una imagen; el script crea un `Engine` por imagen, por lo que no hay procesamiento por lotes documentado.
- Una imagen más el prompt consumen entre 1.030 y 1.100 de los 4.096 tokens de contexto, lo que deja espacio para respuestas de hasta unos 3.000 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos OCR en la información proporcionada. A continuación se comparan características estructurales con alternativas de la misma categoría:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato edge |
|---|---|---|---|---|---|
| Xiaomi-OCR-0 (esta conversión) | ~0,8B | 4.096 | en, zh | Apache 2.0 | `.litertlm` (LiteRT-LM) |
| xiaomi-research/Xiaomi-OCR-0 (original) | ~0,8B | 4.096 | en, zh | Apache 2.0 | safetensors (transformers) |
| Otros modelos OCR de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de la competencia (por ejemplo, variantes OCR de Qwen-VL o PaddleOCR) no está disponible en la información consultada, por lo que no se aportan cifras de rendimiento relativas.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no se ha validado su comportamiento en castellano.
- El contexto es de 4.096 tokens y cada imagen consume unos 1.008, lo que limita la longitud de las respuestas y descarta el procesamiento de documentos de varias páginas en una sola petición.
- LiteRT-LM redimensiona toda imagen a 768 × 1344 sin conservar la relación de aspecto y sin leer la orientación EXIF; es obligatorio aplicar la orientación y el relleno sobre lienzo blanco antes de la inferencia.
- El modelo falla en una página manuscrita densa de prueba, tanto en esta conversión como en el modelo original a ese tamaño de imagen.
- En Android, la GPU es entre cuatro y seis veces más lenta que la CPU debido al coste de creación del motor; en iOS, el intento con CPU terminó con la aplicación detenida por el sistema.
- Se recomienda crear un `Engine` por imagen; no se documenta el comportamiento con reutilización de motor.
- La cuantización int8 puede introducir diferencias frente al original fp32; las pruebas de corrección del autor así lo controlan, pero no se publican métricas agregadas de degradación.
- Riesgo de alucinación en campos JSON y en fórmulas LaTeX cuando la imagen es de baja calidad o el esquema de extracción es ambiguo; no se documentan sesgos específicos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base pertenece a Xiaomi Research y conviene revisar sus términos originales.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/litert-community/Xiaomi-OCR-0
- Modelo base original: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de inferencia ocr_xiaomi.py: https://github.com/john-rocky/hf-to-litertlm/blob/main/xiaomiocr_work/ocr_xiaomi.py
- Runtime LiteRT-LM de Google: https://github.com/google-ai-edge/LiteRT-LM
