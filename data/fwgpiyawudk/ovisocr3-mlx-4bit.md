# fwgpiyawudk/OvisOCR3-mlx-4bit

## Resumen

OvisOCR3-mlx-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo ATH-MaaS/OvisOCR3, un modelo unificado de OCR y comprensión de documentos de 0,8 mil millones de parámetros. El modelo original está afinado a partir de Qwen/Qwen3.5-0.8B (arquitectura `qwen3_5`) y cubre tareas de parsing de documentos a Markdown, JSON estructurado, análisis de layout, OCR plano, extracción de información clave (KIE), descripción de figuras y tablas multipágina.

La relevancia de esta ficha reside en que permite ejecutar un modelo de visión-lenguaje especializado en documentos sobre hardware Apple Silicon mediante MLX, sin necesidad de GPUs NVIDIA. La cuantización affine de 4 bits con group size 64 reduce el peso del repositorio a 0,6 GB, lo que lo hace viable en equipos con memoria unificada limitada.

Es importante señalar que se trata de una conversión de terceros (autor `fwgpiyawudk`), no oficial, publicada el 13 de noviembre de 2026, sin descargas registradas y con un único "like". El autor advierte explícitamente de que no existen métricas oficiales de 4 bits para OvisOCR3 y que, en la familia Qwen3.5, las versiones de 4 bits pierden alrededor de 10 puntos en documentos en tailandés frente a 8 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (visión-lenguaje), base Qwen3.5-0.8B |
| Parámetros totales | 852.985.920 (≈0,85B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits affine, group size 64 (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 0,6 GB |

## Arquitectura y entrenamiento

El modelo base OvisOCR3 emplea la arquitectura `qwen3_5`, un transformer multimodal de tipo visión-lenguaje construido sobre Qwen3.5-0.8B. El pipeline declarado es `image-text-to-text`: recibe una imagen de documento y un prompt de tarea, y genera texto estructurado. El modelo se presenta como "unificado", es decir, un único checkpoint cubre múltiples tareas de parsing documental mediante prompts específicos que definen el contrato de salida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card únicamente indica que es un fine-tune de Qwen3.5-0.8B orientado a OCR y comprensión de documentos. La conversión a MLX se realizó con mlx-vlm 0.7.12 mediante cuantización affine de 4 bits con group size 64.

Como innovación destacable del ecosistema, el modelo se distribuye con prompts oficiales en la carpeta `prompts/` del repositorio (`document_markdown`, `document_structured`, `document_layout`, `plain_ocr`, entre otros) que deben usarse literalmente para respetar el contrato de salida. La inferencia recomendada es greedy con temperatura 0,0 y `enable_thinking=False`.

## Capacidades

- Parsing de documentos a Markdown, preservando estructura y jerarquía.
- Salida estructurada en JSON mediante el prompt `document_structured`.
- Análisis de layout documental (`document_layout`).
- OCR plano de texto en imágenes.
- Extracción de información clave (KIE) de documentos.
- Descripción de figuras (figure captioning).
- Manejo de tablas que cruzan páginas.
- Procesamiento imagen-texto a texto (pipeline `image-text-to-text`).
- Conversación multi-turno (tag `conversational`).
- Modo thinking desactivado por defecto en el uso recomendado.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Digitalización de archivos administrativos: el modelo convierte páginas escaneadas en Markdown estructurado usando el prompt `document_markdown`, lo que permite indexar el contenido en sistemas de búsqueda o RAG.
- Extracción de datos de facturas y formularios: con `document_structured` se obtiene JSON con campos definidos, adecuado para pipelines de contabilidad automatizada.
- Análisis de layout para recortes y segmentación: el prompt `document_layout` identifica regiones del documento, útil como paso previo a OCR especializado por zona.
- OCR de documentos históricos o de baja calidad: el prompt `plain_ocr` permite transcripción directa cuando no se necesita estructura, sobre equipos Apple Silicon con MLX.
- Procesamiento de tablas multipágina en informes financieros: el modelo está entrenado para tablas que cruzan páginas, lo que facilita la consolidación de estados contables.
- Descripción automática de figuras en publicaciones científicas: la capacidad de figure captioning permite generar pies de figura o alt-text para accesibilidad.
- Ejecución local en portátiles Apple: al ocupar 0,6 GB en 4 bits, puede desplegarse en un Mac con memoria unificada para procesar documentos sin enviar datos a la nube, relevante por privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas propias de OvisOCR3 en 4 bits. El autor cita como referencia los resultados de las tarjetas oficiales de Typhoon OCR V2 (misma familia Qwen3.5), donde la versión de 2B en 4 bits obtiene 70,5 frente a 80,6 en MDPBench TH (tailandés) respecto a la versión de mayor precisión, mientras que 8 bits iguala a bf16.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 0,6 GB de pesos en 4 bits, más overhead de activaciones y del procesador de visión; se recomienda al menos 2-4 GB de memoria unificada libre para inferencia cómoda.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX.
- No es compatible de forma nativa con GPUs NVIDIA ni con CUDA; requiere el stack MLX.
- Despliegue: `mlx_vlm.server` (servidor HTTP en el puerto indicado) o la API Python `mlx_vlm.load` / `generate`.
- Versión mínima de librería: mlx-vlm >= 0.3.12 (primera versión que reconoce `qwen3_5`); la conversión se hizo con 0.7.12.
- Configuración de píxeles recomendada: `--min-pixels 200704 --max-pixels 8294400` (equivalente a 448×448 y 2880×2880).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| OvisOCR3-mlx-4bit (esta ficha) | ≈0,85B | No disponible | Apache 2.0 | MLX safetensors 4 bits | Conversión de terceros, sin benchmarks publicados |
| ATH-MaaS/OvisOCR3 (base) | ≈0,85B | No disponible | Apache 2.0 | Pesos originales | Modelo de referencia sin cuantizar |
| Typhoon OCR V2 (2B, familia Qwen3.5) | 2B | No disponible | No disponible en la información | No disponible | Citado por el autor; 4 bits pierde ~10 puntos en tailandés |

No se dispone de datos suficientes para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Conversión no oficial: realizada por un tercero, sin validación por parte de ATH-MaaS; no hay garantía de paridad con el modelo base.
- Sin benchmarks propios: no existen métricas publicadas para esta cuantización de 4 bits; el rendimiento real es incierto.
- Pérdida de precisión por cuantización: el autor advierte de una caída de aproximadamente 10 puntos en documentos en tailandés en la familia Qwen3.5 a 4 bits; recomienda 8 bits para ese idioma.
- Idiomas no documentados: la model card no especifica la cobertura lingüística, lo que limita la evaluación para uso multilingüe.
- Riesgo de alucinación: como todo modelo generativo de OCR, puede inventar texto o campos ausentes, especialmente en documentos degradados; requiere validación en producción.
- Dependencia de prompts oficiales: el contrato de salida depende de usar literalmente los prompts de la carpeta `prompts/`; desviarse puede producir formatos inconsistentes.
- Sesgos: no documentados; no hay información sobre sesgos demográficos o culturales del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de Qwen3.5-0.8B.
- Ecosistema limitado: solo funciona con MLX y Apple Silicon; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Madurez: repositorio con 0 descargas y creado recientemente; sin comunidad ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fwgpiyawudk/OvisOCR3-mlx-4bit
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR3
- Modelo Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
