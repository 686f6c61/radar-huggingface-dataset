# fwgpiyawudk/surya-ocr-2.5-mlx-8bit

## Resumen

Surya OCR 2.5 MLX 8-bit es una conversión cuantizada del modelo `datalab-to/surya-ocr-2.5`, un sistema de reconocimiento óptico de caracteres (OCR) y comprensión de documentos desarrollado por Datalab. Esta versión concreta la publica el usuario `fwgpiyawudk` y está empaquetada en formato MLX, la librería de Apple para ejecutar modelos de forma nativa sobre el silicio de la serie M. El modelo base se etiqueta internamente con la arquitectura `qwen3_5`, lo que indica que Surya OCR 2.5 se construye sobre un transformer de la familia Qwen 3.5 adaptado a tareas de imagen-a-texto.

El modelo resuelve el problema de extraer texto estructurado de imágenes y documentos: digitalización de PDFs escaneados, lectura de tablas, detección de layout y transcripción de contenido visual a texto conversacional. Con 689.356.864 parámetros totales (aproximadamente 689 millones), se sitúa en la gama media-baja, lo que permite ejecutarlo en hardware de consumo siempre que se disponga de una GPU Apple con memoria unificada suficiente.

Su relevancia actual radica en que ofrece una vía práctica para desplegar OCR de calidad en equipos locales Mac sin depender de servicios en la nube, gracias a la cuantización a 8 bits (9,600 bits por peso según la model card) y al formato MLX optimizado para Apple Silicon. Es una pieza útil para pipelines de document AI on-premise, aunque su ecosistema está limitado al entorno Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en `qwen3_5` (image-text-to-text) |
| Parametros totales | 689.356.864 (~689 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (9,600 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | openrail |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `datalab-to/surya-ocr-2.5` se etiqueta con la arquitectura `qwen3_5`, lo que sugiere un transformer decoder-only de la familia Qwen 3.5 adaptado a la modalidad imagen-a-texto mediante un codificador visual y proyección multimodal. Esta conversión MLX mantiene la arquitectura del modelo original y aplica cuantización de pesos a 8 bits, resultando en 9,600 bits por peso según la model card. El proceso de conversión se realizó con el script `build_mlx.py` del ecosistema MLX, usando la opción `--q-bits 8`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones técnicas específicas más allá de la propia cuantización MLX. La model card de esta conversión es mínima y se limita a indicar el comando de conversión y el número de bits por peso.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos escaneados.
- Comprensión de documentos con salida en formato conversacional (pipeline `image-text-to-text`).
- Extracción de texto estructurado, presumiblemente incluyendo tablas y layout, dada la naturaleza del modelo base Surya.
- Procesamiento de imágenes como entrada y generación de texto como salida.
- Ejecución nativa en Apple Silicon mediante MLX.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking en la información disponible.
- El soporte multilingüe no está especificado en la model card de esta conversión.

## Casos de uso

- Digitalización de archivos escaneados en Mac: el modelo puede transcribir documentos en PDF o imágenes a texto plano ejecutándose localmente con MLX, sin enviar datos a servicios externos.
- Extracción de datos de facturas y recibos: al tratarse de un modelo OCR orientado a documentos, resulta adecuado para pipelines de contabilidad que necesiten leer importes, fechas y conceptos de documentos físicos digitalizados.
- Procesamiento de documentación técnica interna: equipos que trabajan con manuales escaneados pueden convertirlos a texto buscable usando un Mac con GPU Apple, manteniendo la confidencialidad.
- Automatización de entrada de datos en aplicaciones de escritorio: integrable en apps macOS nativas mediante MLX para leer formularios o capturas de pantalla y volcar el contenido a bases de datos.
- Investigación en document AI: sirve como punto de partida para experimentar con OCR cuantizado en hardware de consumo, comparando calidad frente al modelo completo en fp16.
- Prototipado rápido en entornos sin GPU NVIDIA: al estar en formato MLX, permite validar flujos de OCR en portátiles Mac antes de escalar a infraestructura con CUDA.
- Preprocesado para RAG sobre documentos físicos: la transcripción generada puede alimentar un índice vectorial para búsqueda semántica sobre archivos escaneados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 689 M de parámetros a 8 bits, los pesos ocupan aproximadamente 0,7 GB; sumando overhead de activaciones y contexto, se estima un uso de memoria unificada de entre 1,5 y 3 GB.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con al menos 8 GB de memoria unificada. Los chips Pro y Max ofrecen mayor ancho de banda y, por tanto, mejor throughput.
- Cabe en GPU de consumo: sí, en equipos Mac con Apple Silicon. No es ejecutable de forma nativa en GPU NVIDIA o AMD sin reconvertir los pesos a otro formato.
- Opciones de despliegue: MLX (librería `mlx` y `mlx-lm`/`mlx-vlm` según corresponda al pipeline de visión). No se documentan otros formatos como GGUF, vLLM u Ollama para esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| surya-ocr-2.5-mlx-8bit (este) | ~689 M | no disponible | openrail | safetensors MLX | Cuantizado 8-bit, solo Apple Silicon |
| datalab-to/surya-ocr-2.5 | no disponible | no disponible | openrail | safetensors | Modelo base sin cuantizar |
| Otros modelos OCR open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta idiomas, contexto, datos de entrenamiento ni evaluación, lo que dificulta estimar su calidad real.
- Al ser una cuantización a 8 bits, puede haber una ligera pérdida de precisión en la transcripción frente al modelo base en fp16, especialmente en documentos con tipografías complejas o ruido.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar texto en regiones ambiguas o con baja calidad de imagen.
- El repositorio tiene 0 descargas y 0 likes, y el autor no es el desarrollador original (Datalab), por lo que la conversión no está validada por el equipo que creó el modelo.
- Licencia openrail: conviene revisar los términos completos del archivo LICENSE antes de uso comercial, ya que impone condiciones específicas sobre redistribución y uso.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon; no es portable directamente a CUDA, ROCm ni CPU x86 sin reconversión.
- No se especifican sesgos conocidos ni limitaciones idiomáticas por falta de documentación.

## Enlaces

- [HuggingFace: fwgpiyawudk/surya-ocr-2.5-mlx-8bit](https://huggingface.co/fwgpiyawudk/surya-ocr-2.5-mlx-8bit)
- [Modelo base: datalab-to/surya-ocr-2.5](https://huggingface.co/datalab-to/surya-ocr-2.5)
- [Datalab (organización en HuggingFace)](https://huggingface.co/datalab-to)
- [MLX (Apple)](https://github.com/ml-explore/mlx)
