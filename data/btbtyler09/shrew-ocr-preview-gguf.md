# btbtyler09/shrew-ocr-preview-GGUF

## Resumen

`btbtyler09/shrew-ocr-preview-GGUF` es una conversión a formato GGUF del modelo `shrew-ocr-preview`, un modelo de visión-lenguaje (image-text-to-text) especializado en OCR de documentos y extracción estructurada de información. Desarrollado por Tyler Brooker (btbtyler09), el modelo toma una imagen de una página de documento y produce un objeto JSON con metadatos, un resumen, fragmentos semánticos listos para RAG, y figuras/tablas con bounding boxes y representación HTML. Está pensado para pipelines de digitalización documental, indexación semántica y automatización de procesos basados en documentos.

El modelo se basa en `ibm-granite/granite-vision-4.1-4b` (Apache 2.0) y todo el fine-tuning se concentra en el modelo de lenguaje; la torre de visión permanece inalterada. Con aproximadamente 3,4 mil millones de parámetros y una ventana de contexto de 32 000 tokens, ofrece una alternativa ligera y desplegable en hardware de consumo para tareas de inteligencia documental. Esta versión GGUF permite ejecutarlo con llama.cpp/llama-server, lo que facilita su integración en entornos locales o con recursos limitados.

La relevancia actual del modelo radica en su enfoque práctico: combina OCR, comprensión semántica y salida estructurada en un solo paso, evitando pipelines fragmentados. Al ser una vista previa (preview), los pesos se actualizan bajo el mismo nombre, por lo que se recomienda fijar un commit para reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Granite Vision 4.1 4B (vision-language transformer) |
| Parametros totales | 3 402 839 040 (~3,4 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32 000 tokens |
| Tipos de cuantizacion | Q8_0 y f16 (modelo de lenguaje); mmproj f16 (torre de vision) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `ibm-granite/granite-vision-4.1-4b`, un transformer multimodal de IBM con aproximadamente 4 000 millones de parámetros. La arquitectura combina un codificador de visión (vision tower) con un modelo de lenguaje; en este fine-tuning, solo se actualizan los pesos del modelo de lenguaje, mientras que la torre de visión se mantiene con los pesos originales del modelo base. El resultado es un modelo que acepta una imagen de página y genera texto estructurado en formato JSON.

No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). La model card solo indica que se trata de un fine-tuning del modelo base y que existe una versión LoRA (`shrew-ocr-preview-lora`, r=256, bf16) para composición o entrenamiento continuado. La conversión a GGUF se realizó con llama.cpp release b10453, que incluye soporte nativo para Granite4Vision.

## Capacidades

- OCR de documentos: convierte una imagen de página en texto estructurado con metadatos, resumen y fragmentos semánticos.
- Extracción estructurada: genera un objeto JSON con campos predefinidos (esquema de salida documentado en la model card del modelo original).
- RAG-ready: produce chunks semánticos listos para indexar en bases vectoriales o pipelines de recuperación aumentada.
- Detección de figuras y tablas: emite bounding boxes y representación HTML de tablas y figuras presentes en la página.
- Procesamiento de imágenes: acepta imágenes de páginas de documentos como entrada (pipeline `image-text-to-text`).
- Generación de texto estructurado: salida en JSON, adecuada para integración programática.
- Multilingüe: no, solo inglés (según los metadatos de HuggingFace).
- Tool calling / agentes: no documentado en la información disponible.

## Casos de uso

- Digitalización de documentos para RAG: el modelo extrae fragmentos semánticos de cada página, que pueden indexarse en una base vectorial para búsqueda semántica sobre archivos escaneados o PDFs. Su salida JSON facilita la ingesta directa en pipelines de LangChain o LlamaIndex.
- Extracción de metadatos de documentos: identifica automáticamente título, autor, fecha y otros campos de metadatos a partir de la imagen, útil para catalogación de bibliotecas digitales o gestión documental.
- Conversión de tablas a HTML estructurado: las tablas detectadas se devuelven con bounding boxes y HTML, lo que permite reconstruir tablas editables o integrarlas en aplicaciones web sin intervención manual.
- Automatización de procesos de facturas y formularios: la salida JSON permite extraer campos clave (importes, fechas, números de referencia) de facturas o formularios escaneados, alimentando sistemas ERP o CRM.
- Análisis de figuras y diagramas: al devolver bounding boxes de figuras, el modelo puede integrarse en herramientas de anotación o en sistemas que necesiten localizar visualmente elementos dentro de un documento.
- Accesibilidad documental: convierte documentos escaneados en texto estructurado y resúmenes, facilitando su lectura por lectores de pantalla o su transformación a formatos accesibles.
- Búsqueda semántica en archivos históricos: al generar resúmenes y chunks semánticos, permite buscar por contenido (no solo por texto OCR) en colecciones de documentos antiguos o escaneados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona datos de validación propia sobre extracción de documentos, que se resumen a continuación.

| Metrica | Q8_0 (GGUF) | GPTQ-8bit (referencia) | f16 (GGUF) |
|---|---|---|---|
| First-pass ok (50 paginas) | 44/50 | 43/50 | 9/10 (spot-check) |
| Precision de extraccion | 0,935 | 0,937 | 0,942 |
| Delta de fidelidad de tablas (mediana) | 0,000 | — | — |
| Throughput (RTX 3060, single-stream) | ~30 s/pagina | ~28 s/pagina | — |

Estos datos provienen de la model card del autor y se obtuvieron en una RTX 3060 de 12 GB. La validación de Q8_0 se realizó sobre 50 páginas comparando con el variante GPTQ-8bit en páginas idénticas. No hay resultados de benchmarks académicos independientes.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 del LM ocupa 3,6 GB y el mmproj f16 1,16 GB; en la práctica, la model card indica que funciona en GPUs de 12 GB con contexto completo de 32k (probado en RTX 3060). El archivo f16 (6,8 GB) requiere al menos 16 GB de VRAM para el contrato completo de 32k.
- GPU recomendadas: RTX 3060 12 GB (probada por el autor), cualquier GPU con 12 GB o más de VRAM (RTX 4070, 4080, A100, etc.). Para el f16, se necesitan 16 GB o más.
- Compatibilidad con GPU de consumo: sí, la versión Q8_0 cabe en GPUs de 12 GB como la RTX 3060, RTX 4070, etc.
- Opciones de despliegue: llama-server (llama.cpp) con `--mmproj`, o contenedor Docker oficial `btbtyler09/shrew-ocr-cuda:v0.2.1` que incluye los archivos Q8_0.
- Latencia y throughput: ~30 s por página en RTX 3060 (single-stream), ~2,8 páginas/min con un slot, ~5,7 páginas/min con dos slots y cuantización de KV cache (q8_0). En GPUs más potentes el rendimiento puede escalar.
- Nota importante: para multi-slot, el contexto total (`-c`) debe ser N × 32768 (contexto completo por slot). En 12 GB, se requiere cuantización de KV cache (`--cache-type-k q8_0 --cache-type-v q8_0`) para evitar crashes.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (OCR de documentos con extracción estructurada). El modelo base, `ibm-granite/granite-vision-4.1-4b`, es el punto de partida; las alternativas típicas en OCR (Tesseract, PaddleOCR) no generan salida JSON estructurada ni chunks semánticos. Otros modelos multimodales como LLaVA o Qwen-VL podrían adaptarse, pero no hay datos comparativos publicados.

| Modelo | Parametros | Contexto | Salida | Licencia |
|---|---|---|---|---|
| shrew-ocr-preview (GGUF) | 3,4 B | 32k | JSON estructurado + bboxes + HTML | Apache 2.0 |
| ibm-granite/granite-vision-4.1-4b | ~4 B | 32k | Texto generico | Apache 2.0 |
| LLaVA (variantes) | 7B-34B | 4k-32k | Texto generico | Apache 2.0 / LLaMA |

La comparativa es limitada porque no hay benchmarks estandarizados que permitan una evaluación objetiva frente a estos modelos.

## Limitaciones y advertencias

- Solo inglés: los metadatos indican `en` como único idioma soportado; el modelo no está entrenado para otros idiomas.
- Vista previa (preview): los pesos se actualizan en el mismo nombre de repositorio; se recomienda fijar un commit (`revision=`) para reproducibilidad en producción.
- Riesgo de alucinación: al ser un modelo generativo, puede producir campos o bounding boxes incorrectos en documentos ambiguos o de baja calidad; la validación del autor muestra una precisión de extracción de ~0,94, pero no es perfecta.
- Requisito de contexto completo: en despliegues multi-slot, cada slot necesita los 32k tokens completos; si se reduce el contexto por slot, el modelo puede fallar (exit 139) en páginas densas.
- Limitaciones de VRAM: en GPUs de 12 GB, la versión f16 no es viable con contexto completo; la cuantización Q8_0 es la opción recomendada. La cuantización de KV cache es obligatoria para multi-slot en 12 GB.
- Sin soporte de tool calling ni agentes: no se documenta capacidad de function calling, lo que limita su uso en flujos agénticos complejos.
- Sin información sobre sesgos: no hay análisis de sesgos o comportamientos discriminatorios publicados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (Granite Vision) también es Apache 2.0, sin restricciones adicionales conocidas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/btbtyler09/shrew-ocr-preview-GGUF
- Modelo original (bf16): https://huggingface.co/btbtyler09/shrew-ocr-preview
- Variante GPTQ-8bit: https://huggingface.co/btbtyler09/shrew-ocr-preview-GPTQ-8bit
- Adaptador LoRA: https://huggingface.co/btbtyler09/shrew-ocr-preview-lora
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- Repositorio de servidor de referencia: https://github.com/btbtyler09/shrew-server
- Imagen Docker: https://hub.docker.com/u/btbtyler09 (imagen `btbtyler09/shrew-ocr-cuda:v0.2.1`)
