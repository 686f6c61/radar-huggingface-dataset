# kinyeah/BiMai-HunyuanOCR-1.5-Caoshu

## Resumen

BiMai-HunyuanOCR-1.5-Caoshu es un modelo de reconocimiento óptico de caracteres (OCR) especializado en caligrafía china cursiva y de "hierba loca" (caoshu, 狂草), desarrollado por el usuario kinyeah bajo el proyecto BiMai (筆脈). Se construye mediante un ajuste fino del modelo base Tencent HunyuanOCR-1.5, un modelo visión-lenguaje de 996M de parámetros (27 capas de visión y 24 de lenguaje), orientado a la transcripción de textos chinos clásicos y manuscritos caligráficos de difícil lectura.

El modelo resuelve un problema concreto: los OCR convencionales fallan de forma sistemática ante la caligrafía cursiva histórica. Según los datos del autor, el ajuste fino reduce el CER (tasa de error de caracteres) en escritura cursiva del 42,4% al 18,6%, y en manuscritos antiguos reales del 60,5% al 21,2%. Es relevante para proyectos de digitalización de archivos, investigación sinológica y preservación de patrimonio documental.

La versión publicada es una cuantización Q4_K_M en formato GGUF (333 MiB para el modelo de lenguaje y 890 MiB para la torre visual en F16), pensada para despliegue local con llama.cpp. Los pesos están entrenados exclusivamente para chino (zh) y chino clásico/literario (lzh).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Hunyuan-VL: 27 capas de visión + 24 capas de lenguaje) |
| Parámetros totales | 539.010.048 (pesos publicados); el modelo base se describe como 996M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (modelo de lenguaje); torre visual en F16 (mmproj) |
| Idiomas soportados | chino (zh), chino clásico/literario (lzh) |
| Licencia | tencent-hunyuan-community (Other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Hunyuan-VL del modelo base Tencent HunyuanOCR-1.5, con una torre visual de 27 capas acoplada a un decodificador de lenguaje de 24 capas. El ajuste fino se realizó sobre 11.100 muestras estratificadas: 4.855 filas de manuscritos antiguos reales (44%), 3.740 muestras sintéticas de caligrafía cursiva extrema generadas a partir de obras auténticas de Huaisu (23%), Zhu Zhishan (22%), Zhang Zhi (15%) y Sun Guoting (13%), 1.705 muestras sintéticas a partir de 107.816 glifos reales de cursiva, y 800 muestras de fuentes caligráficas de 23 estilos cursivos y semiconsivos.

El entrenamiento se ejecutó durante 2 épocas con tasa de aprendizaje 2e-5 (cosine, warmup 40), atención SDPA, y una pérdida final de entrenamiento de 0,822, en 4 horas y 12 minutos. No se documenta el uso de RLHF o DPO. La innovación principal es la generación sintética de muestras de caligrafía cursiva a partir de trazos auténticos de calígrafos históricos, lo que permite al modelo aprender variantes estilísticas extremas sin depender de corpus anotados masivos.

## Capacidades

- Reconocimiento de texto en imágenes (image-text-to-text) de caligrafía china cursiva (caoshu) y semiconsiva (xingshu).
- Transcripción de manuscritos antiguos y textos clásicos en chino literario (lzh).
- Reconocimiento de caligrafía regular (kaishu) con alta precisión (CER del 1,8%).
- Generalización a estilos de calígrafos concretos: Zhu Zhishan, Zhu Yunming, Huaisu, Sun Guoting.
- Inferencia local mediante llama.cpp con API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de entrada de imagen vía URL en base64 en el formato de mensajes multimodal.
- No se documentan capacidades de tool calling, agentes, matemáticas, visión general o audio.

## Casos de uso

- Digitalización de archivos históricos: el modelo transcribe columnas verticales de manuscritos antiguos con un CER del 21,2% en muestras reales, lo que lo hace útil como primera pasada de transcripción asistida en proyectos de preservación documental.
- Investigación sinológica: permite a filólogos obtener borradores de transcripción de obras en cursiva de calígrafos como Huaisu o Zhu Zhishan, reduciendo el trabajo manual de lectura paleográfica.
- Catalogación de colecciones museísticas: integrado en un pipeline de procesamiento por lotes, puede extraer texto de cartelas, colofones y anotaciones caligráficas para enriquecer metadatos.
- Anotación de corpus de caligrafía: sirve como herramienta de preetiquetado para construir datasets de entrenamiento de otros modelos OCR especializados.
- Aplicaciones educativas de caligrafía: permite al estudiante fotografiar una obra cursiva y obtener una transcripción para su estudio comparativo.
- Despliegue en entornos con recursos limitados: con 333 MiB en Q4_K_M y 0,24 s por imagen, puede ejecutarse en portátiles o servidores de gama baja sin GPU dedicada de gran capacidad.
- Procesamiento de documentos en chino clásico: útil para digitalizar ediciones antiguas y textos literarios en lzh donde los OCR generalistas fallan.

## Benchmarks y rendimiento

Evaluación sobre 151 muestras estratificadas (80 manuscritos reales + 71 sintéticas), con el mismo prompt y muestras que la comparativa del proyecto:

| Métrica | v23 (anterior) | Qwen3-VL v28 | BiMai-HunyuanOCR-1.5-Caoshu |
|---|---:|---:|---:|
| CER global | 42,26% | 25,70% | 17,89% |
| CER mediano | 25,00% | 25,00% | 12,50% |
| Aciertos exactos | 40/151 | 44/151 | 58/151 |
| CER cursiva (caoshu) | 42,4% | 36,5% | 18,6% |
| CER semiconsiva (xingshu) | 12,7% | 8,4% | 11,1% |
| CER regular (kaishu) | 3,6% | 4,6% | 1,8% |
| CER manuscritos reales | 60,5% | 30,0% | 21,2% |
| Velocidad de inferencia | 2,4 s/imagen | no disponible | 0,24 s/imagen |

Desglose por calígrafo (CER, menor es mejor):

| Calígrafo | Antes del ajuste | Después del ajuste |
|---|---:|---:|
| Zhu Zhishan | 44,4% | 25,0% |
| Zhu Yunming | 39,9% | 32,2% |
| Huaisu | 42,5% | < 23% |
| Sun Guoting | 39,9% | fuera de la peor lista |
| NCCU cursiva | 46,2% | 46,2% (pendiente de mejora) |

## Requisitos de hardware

- VRAM estimada: el modelo de lenguaje en Q4_K_M ocupa 333 MiB y la torre visual en F16 ocupa 890 MiB; en total, aproximadamente 1,2 GB de pesos, más overhead de contexto y KV cache.
- Cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090) e incluso en equipos con poca VRAM o en CPU.
- Despliegue recomendado mediante llama.cpp (`llama-server`) con soporte de la arquitectura `hunyuan_vl`, requiriendo versión ≥ b11103.
- API compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes sin cambios de cliente.
- Velocidad reportada: 0,24 s por imagen en la configuración de evaluación del autor (hardware no especificado).
- No se documentan opciones de despliegue con vLLM o TGI para este formato GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER cursiva | Licencia | Formato |
|---|---|---|---|---|---|
| BiMai-HunyuanOCR-1.5-Caoshu | 539M publicados (base 996M) | no disponible | 18,6% | tencent-hunyuan-community | GGUF |
| Qwen3-VL-8B (v28 del proyecto) | ~8B | no disponible | 36,5% | no disponible en la información | no disponible |
| v23 (versión anterior del proyecto) | no disponible | no disponible | 42,4% | no disponible | no disponible |
| Tencent HunyuanOCR-1.5 (base) | 996M | no disponible | no disponible (sin ajuste) | tencent-hunyuan-community | safetensors |

El modelo supera a Qwen3-VL-8B en CER cursiva (18,6% frente a 36,5%) pese a tener un orden de magnitud menos de parámetros, a costa de un rendimiento ligeramente inferior en semiconsiva (11,1% frente a 8,4%).

## Limitaciones y advertencias

- No realiza autenticación ni identificación: solo transcribe texto; no determina autenticidad, época ni autor.
- La caligrafía cursiva extrema sigue siendo difícil: en muestras de cursiva del NCCU el CER se mantiene en torno al 46,2%.
- En columnas verticales muy largas (más de 10 caracteres) puede producir repeticiones degeneradas; se recomienda `repeat_penalty=1.15` durante la inferencia.
- El modelo solo cubre chino (zh) y chino clásico (lzh); no soporta otros idiomas.
- La licencia tencent-hunyuan-community impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en producción.
- Los benchmarks proceden de una evaluación interna del autor con 151 muestras, no de un conjunto de referencia independiente; deben interpretarse con cautela.
- No se documentan sesgos específicos, pero al entrenarse sobre obras de calígrafos históricos concretos puede presentar sesgo estilístico hacia esos autores.
- Riesgo de alucinación en pasajes muy degradados o ilegibles, donde el modelo puede generar caracteres plausibles no presentes en la imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinyeah/BiMai-HunyuanOCR-1.5-Caoshu
- Versión F16 del proyecto: https://huggingface.co/kinyeah/BiMai-Chaoshu-OCR
- Modelo base Tencent HunyuanOCR: https://huggingface.co/tencent/HunyuanOCR
- Licencia Tencent Hunyuan Community: https://huggingface.co/tencent/HunyuanOCR/blob/main/LICENSE
- llama.cpp (soporte de arquitectura `hunyuan_vl`): https://github.com/ggml-org/llama.cpp
