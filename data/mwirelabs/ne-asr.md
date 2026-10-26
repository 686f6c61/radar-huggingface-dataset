# MWirelabs/ne-asr

## Resumen

MWirelabs/ne-asr es un modelo de reconocimiento automático del habla (ASR) multilingüe que cubre ocho lenguas del noreste de la India: khasi, garo, mizo, nagamés, kokborok, asamés, chakma y wancho. Fue desarrollado por MWire Labs (Shillong, Meghalaya) mediante fine-tuning de openai/whisper-medium, y aborda un problema real: la práctica ausencia de sistemas de voz a texto para lenguas de bajos recursos que los modelos ASR globales no cubren de forma útil.

El modelo conserva la arquitectura encoder-decoder de Whisper con 763.857.920 parámetros y se distribuye en safetensors (~3,1 GB) bajo licencia CC-BY-4.0. Se entrenó con 150.483 muestras procedentes del corpus Vaani y de un corpus propio de MWire, alcanzando un WER global del 36,06 % en test, con resultados muy dispares entre lenguas (desde 9,31 % en garo hasta 68,37 % en wancho).

Su relevancia viene respaldada por la publicación académica NE-MultiSpeech (EMNLP 2026), que presenta el corpus y el benchmark asociados. Para desarrolladores que necesiten transcribir contenido en estas lenguas, es de los pocos recursos abiertos disponibles, aunque su calidad exige evaluación por lengua antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer codificador-decodificador (Whisper) |
| Parámetros totales | 763.857.920 (~764 M) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (especificación de la arquitectura Whisper) |
| Tipos de cuantización | no disponible (pesos publicados en fp16; no hay versiones cuantizadas oficiales) |
| Idiomas soportados | 8 lenguas del noreste de la India: khasi (kha), garo (grt), mizo (lus), nagamés (nag), kokborok (trp), asamés (asm), chakma (ccp) y wancho (wao) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-medium, un transformer codificador-decodificador que procesa espectrogramas log-mel de 30 segundos de audio. El fine-tuning se realizó con precisión mixta fp16, learning rate de 1e-5 con 500 pasos de warmup, 8.000 pasos de entrenamiento y un batch efectivo de 32 (batch size 16 con acumulación de gradientes 2).

Los datos de entrenamiento suman 150.483 muestras: 121.960 del corpus Vaani (ARTPARK-IISc/Vaani-transcription-part) cubriendo 7 lenguas, y 28.524 del corpus propietario de MWire cubriendo 5 lenguas (khasi, garo, mizo, nagamés y kokborok). Un detalle técnico destacable: como Whisper no incluye tokens de lengua para estos idiomas, se usó el token "welsh" como proxy para todas las lenguas excepto el asamés, que sí dispone de token propio. Esta solución, documentada en el código de uso, es una adaptación pragmática habitual en fine-tunings de Whisper para lenguas no soportadas, pero conviene tenerla presente al integrar el modelo.

## Capacidades

- Transcripción de voz a texto en 8 lenguas del noreste de la India desde un único checkpoint multilingüe.
- WER por lengua documentado: garo 9,31 %, khasi 16,89 %, asamés 20,98 %, mizo 23,85 %, kokborok 44,79 %, nagamés 49,13 %, chakma 54,25 %, wancho 68,37 %.
- Transcripción del asamés mediante su token de lengua nativo de Whisper; el resto de lenguas mediante el token proxy "welsh".
- Integrable con el pipeline `automatic-speech-recognition` de Hugging Face Transformers (el modelo incluye ejemplo de uso con `WhisperProcessor` y `WhisperForConditionalGeneration`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado exclusivamente en ASR.
- No se documenta soporte de traducción (tarea translate de Whisper), marcas de tiempo ni diarización de hablantes en la model card.

## Casos de uso

- Subtitulado de medios regionales: televisiones, radios y creadores de contenido en Meghalaya, Mizoram o Assam pueden transcribir emisiones en khasi, mizo o asamés para generar subtítulos, con revisión humana recomendada según la lengua (el WER del 16,89 % en khasi hace viable un flujo con corrección ligera).
- Documentación y revitalización lingüística: equipos de lingüística y proyectos comunitarios pueden transcribir grabaciones de campo en lenguas sin apenas recursos digitales, como wancho o chakma, aunque en estos casos el WER elevado exige validación manual sistemática.
- Atención al ciudadano y IVR gubernamental: organismos públicos del noreste indio pueden transcribir llamadas de ciudadanos en lenguas locales para triaje y registro, aprovechando que un solo modelo cubre 8 lenguas sin desplegar 8 sistemas distintos.
- Análisis de centros de contacto regionales: empresas con operaciones en la zona pueden transcribir y minar llamadas en garo o mizo (WER por debajo del 24 %) para métricas de calidad y detección de intenciones aguas abajo.
- Investigación en NLP de lenguas de bajos recursos: el modelo sirve como línea base reproducible sobre el benchmark NE-MultiSpeech (EMNLP 2026), útil para comparar nuevas arquitecturas ASR en estas lenguas.
- Accesibilidad: generación de transcripciones para personas sordas o con dificultad auditiva en servicios y contenidos locales, con la precaución de revisión humana en las lenguas de WER alto.
- Generación de corpus para I+D regional: las transcripciones producidas pueden alimentar datasets de entrenamiento para TTS, tokenizadores o LLM regionales, línea de trabajo explícita de MWire Labs.

## Benchmarks y rendimiento

Resultados de WER (word error rate) en test, publicados por los autores en la model card:

| Idioma | Código | WER en test |
|---|---|---|
| Garo | grt | 9,31 % |
| Khasi | kha | 16,89 % |
| Asamés | asm | 20,98 % |
| Mizo | lus | 23,85 % |
| Kokborok | trp | 44,79 % |
| Nagamés | nag | 49,13 % |
| Chakma | ccp | 54,25 % |
| Wancho | wao | 68,37 % |
| **Global** | | **36,06 %** |

No se han publicado en la información disponible comparativas directas contra el modelo base (openai/whisper-medium) ni contra otros sistemas ASR en estas lenguas, por lo que no es posible cuantificar la mejora aportada por el fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en fp16 (los pesos ocupan ~3,1 GB según el repositorio); con cuantización a 8 bits tras conversión, en torno a 2 GB. Son estimaciones derivadas del tamaño del modelo, no cifras publicadas por los autores.
- GPU recomendadas: cualquier GPU de consumo con 6 GB de VRAM o más es suficiente para inferencia (RTX 3060, RTX 4060, RTX 4090 con amplio margen). Para fine-tuning adicional se recomienda una GPU de 24 GB tipo RTX 4090 o A100, dado que el entrenamiento original usó fp16 con batch efectivo 32.
- Consumer GPUs: sí, cabe con holgura en GPUs de 6-8 GB; también es viable la inferencia en CPU dada la escala del modelo (~764 M de parámetros), con latencias mayores.
- Opciones de despliegue: Hugging Face Transformers (código oficial en la model card). Por pertenecer al ecosistema Whisper, es técnicamente convertible a faster-whisper/ctranslate2 o whisper.cpp (GGUF), pero no existen conversiones oficiales publicadas en el repositorio. No hay soporte documentado para vLLM, TGI u Ollama.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Cobertura de lenguas | Licencia | Observaciones |
|---|---|---|---|---|
| MWirelabs/ne-asr | 764 M | 8 lenguas del noreste indio (específico) | CC-BY-4.0 | WER global 36,06 %; único con resultados publicados en estas lenguas |
| openai/whisper-medium (base) | 769 M | ~99 lenguas, cobertura marginal en estas lenguas | MIT | Sin fine-tuning regional; WER no publicado para estas lenguas |
| openai/whisper-large-v3 | 1.550 M | ~99 lenguas | MIT | Doble de parámetros y VRAM; sin evidencia pública de rendimiento en khasi, garo, mizo, etc. |

Como referencia adicional, AI4Bharat mantiene modelos ASR para lenguas índicas (por ejemplo IndicConformer) que cubren el asamés, pero no se dispone en la información proporcionada de datos comparables para el resto de lenguas de este modelo.

## Limitaciones y advertencias

- Rendimiento muy desigual por lengua: wancho (68,37 %), chakma (54,25 %), nagamés (49,13 %) y kokborok (44,79 %) presentan WER inaceptable para producción sin revisión humana exhaustiva; solo garo, khasi, asamés y mizo rozan umbrales utilizables.
- Uso del token proxy "welsh": es un artificio de entrenamiento que puede provocar comportamientos anómalos si el modelo interpreta el audio como galés real; solo el asamés usa token de lengua nativo.
- Ventana de audio de 30 segundos: para grabaciones largas es necesario segmentar el audio; la model card no documenta decodificación long-form ni gestión de marcas de tiempo.
- Riesgo de alucinación heredado de la familia Whisper: estos modelos tienden a generar texto repetitivo o inventado ante silencios, música o ruido de fondo, un efecto especialmente delicado con datos de entrenamiento limitados (150.483 muestras).
- Sesgo de dominio: los datos proceden de Vaani y de un corpus propietario de composición no pública, por lo que el rendimiento en dominios no cubiertos (médico, legal, ruido de calle) es desconocido.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución explícita a MWire Labs en derivados y despliegues.
- No se documentan capacidades de diarización, alineación temporal ni filtrado de contenido sensible, aspectos a resolver en la capa de aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MWirelabs/ne-asr
- Paper NE-MultiSpeech (EMNLP 2026): https://aclanthology.org/2026.emnlp-main.2471/
- Modelo base: https://huggingface.co/openai/whisper-medium
- Dataset Vaani: https://huggingface.co/ARTPARK-IISc/Vaani-transcription-part
- Catálogo de modelos de MWire Labs: http://mwirelabs.com/models/
- Web de MWire Labs: https://mwirelabs.com/
- Organización en GitHub: https://github.com/MWirelabs/
