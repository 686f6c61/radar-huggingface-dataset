# Reza2kn/Bina-0.1-Koochik-FP16

## Resumen

Bina 0.1 Koochik FP16 es un modelo de OCR (reconocimiento óptico de caracteres) especializado en documentos en persa, desarrollado por Reza2kn como una derivada del modelo Surya OCR 2 de Datalab. Se trata de la versión en precisión FP16 del checkpoint Bina 0.1 Koochik original (que usaba BF16), diseñada específicamente para ser ejecutable en GPUs NVIDIA de arquitectura Pascal (como la GTX 1070, compute capability 6.1) que no soportan BF16. El modelo tiene 665,7 millones de parámetros y una arquitectura `Qwen3_5ForConditionalGeneration`, lo que lo convierte en un modelo de visión-lenguaje capaz de procesar imágenes y PDFs para extraer texto estructurado.

La relevancia de este modelo radica en que ofrece una alternativa de OCR persa de alta calidad, basada en un modelo de fundación moderno, con un tamaño relativamente contenido que permite su despliegue en hardware de gama media. Está pensado para integrarse en el ecosistema Surya OCR 2, lo que facilita su uso mediante la CLI `surya_ocr` o la API de Python, y se sirve actualmente en la plataforma PersianVLM.com. La licencia OpenRAIL permite su uso y redistribución bajo ciertas condiciones, lo que lo hace atractivo para proyectos comerciales y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (visión-lenguaje) |
| Parametros totales | 665.701.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (esta versión), BF16 (versión original) |
| Idiomas soportados | persa (uso previsto; no especificado en metadatos) |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, un modelo de visión-lenguaje que combina un codificador visual con un decodificador de lenguaje, diseñado para tareas de imagen-a-texto. En este caso, el modelo base es `datalab-to/surya-ocr-2`, un checkpoint de Surya OCR 2 entrenado para reconocimiento de texto en imágenes. Sobre este base, se ha aplicado un LoRA (Low-Rank Adaptation) entrenado específicamente para persa, cuyo checkpoint en el paso 8.000 se ha fusionado con el modelo base para producir Bina 0.1 Koochik. La versión FP16 aquí descrita es una conversión de precisión del checkpoint BF16 original, manteniendo los tensores no flotantes sin cambios.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El entrenamiento del LoRA se realizó hasta el paso 8.000, pero no se detallan los hiperparámetros ni el volumen de datos. La arquitectura es estándar para modelos de OCR modernos, sin innovaciones técnicas destacables más allá de la adaptación LoRA y la conversión de precisión para compatibilidad con hardware Pascal.

## Capacidades

- Reconocimiento de texto en imágenes y PDFs, con salida estructurada en bloques ordenados.
- Generación de HTML y texto plano a partir de documentos escaneados.
- Proporciona puntuaciones de confianza y bounding boxes para cada bloque detectado.
- Compatible con el paquete de inferencia Surya OCR 2, incluyendo la CLI `surya_ocr` y la API de Python.
- Soporte para procesamiento por rangos de páginas y generación de imágenes anotadas.
- Capacidad multilingüe limitada al persa, según el uso previsto (aunque el modelo base podría soportar otros idiomas, no se especifica).

## Casos de uso

- Digitalización de archivos históricos persas: el modelo puede convertir documentos escaneados en texto digital estructurado, facilitando su búsqueda y archivado. Su salida con bounding boxes permite preservar el layout original.
- Extracción de texto de facturas y formularios en persa: al devolver bloques con confianza, es posible filtrar automáticamente regiones de baja calidad y validar la extracción en pipelines de contabilidad.
- Automatización de flujos de trabajo documentales: integrado en sistemas de gestión documental, puede procesar lotes de PDFs y generar metadatos de texto para indexación.
- Servicio de OCR en producción: gracias a su compatibilidad con vLLM y Docker, puede desplegarse como endpoint de API para aplicaciones web que necesiten OCR persa bajo demanda.
- Investigación en NLP persa: el modelo puede utilizarse para crear corpus de texto persa a partir de documentos escaneados, alimentando modelos de lenguaje o sistemas de búsqueda semántica.
- Accesibilidad: conversión de documentos impresos en persa a texto digital para lectores de pantalla o herramientas de lectura asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de OCR (como CER o WER) para este modelo. Se recomienda realizar una evaluación propia comparando con el modelo base Surya OCR 2 y otras alternativas de OCR persa antes de su adopción en producción.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 665M parámetros en FP16, lo que ocupa aproximadamente 1,3 GB en memoria (sin contar overhead de activaciones y KV cache). Se recomienda al menos 4 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte FP16 y compute capability 6.1 o superior (Pascal, Volta, Turing, Ampere, Ada). Ejemplos: GTX 1070, RTX 2060, RTX 3090, A100.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media como la GTX 1070 (8 GB) o RTX 3060 (12 GB).
- Opciones de despliegue: vLLM (recomendado, con Docker y NVIDIA Container Toolkit), Surya OCR 2 (CLI y Python). No es compatible directamente con llama.cpp ni Ollama sin una conversión GGUF específica.
- Latencia y throughput: no disponibles. Dependen del hardware, el tamaño de lote y la longitud de las imágenes. Con vLLM en una GPU moderna se espera un throughput razonable para OCR por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bina 0.1 Koochik FP16 | 665M | no disponible | OpenRAIL | Hugging Face |
| Surya OCR 2 (base) | no disponible | no disponible | OpenRAIL | Hugging Face |
| Tesseract (con modelo persa) | variable | N/A | Apache 2.0 | Open source |

No se dispone de datos de rendimiento comparativos. Surya OCR 2 es el modelo base y probablemente tenga capacidades multilingües más amplias, mientras que Bina 0.1 Koochik está especializado en persa. Tesseract es una alternativa clásica de OCR con soporte persa, pero con arquitectura tradicional y menor precisión en documentos complejos. La comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado principalmente para persa, puede tener un rendimiento degradado en otros idiomas o dialectos.
- Riesgo de alucinación: como modelo de visión-lenguaje, puede generar texto plausible pero incorrecto en regiones ambiguas o de baja calidad de imagen. Se recomienda usar decodificación determinista para comparaciones.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que documentos muy largos pueden requerir segmentación.
- Restricciones de licencia: la licencia OpenRAIL permite uso comercial y redistribución, pero impone condiciones de uso responsable. Revisar la licencia upstream de Surya OCR 2 antes de desplegar en producción.
- Compatibilidad: esta versión FP16 está pensada para GPUs Pascal; en hardware más moderno se recomienda usar la versión BF16 original para evitar pérdida de precisión.
- Sin soporte CPU/Apple Silicon: los pesos BF16/FP16 no son directamente ejecutables en CPU o Apple Silicon sin una conversión GGUF específica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/Bina-0.1-Koochik-FP16
- Modelo original (BF16): https://huggingface.co/Reza2kn/Bina-0.1-Koochik
- Modelo base Surya OCR 2: https://huggingface.co/datalab-to/surya-ocr-2
- Repositorio del LoRA persa: https://huggingface.co/Reza2kn/surya-ocr-2-persian-lora-7m
- Derivada CoreML: https://huggingface.co/Reza2kn/Bina-0.1-Koochik-CoreML
- Página de despliegue en FriendliAI: https://friendli.ai/models/Reza2kn/Bina-0.1-Koochik
