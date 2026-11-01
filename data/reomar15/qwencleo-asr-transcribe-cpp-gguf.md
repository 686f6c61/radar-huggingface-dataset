# reomar15/QwenCleo-ASR-transcribe-cpp-GGUF

## Resumen

QwenCleo-ASR-transcribe-cpp-GGUF es una conversión al formato GGUF del modelo QwenCleo-ASR, un ajuste fino de Qwen3-ASR 1.7B desarrollado por Mohammed Aly y empaquetado por el usuario reomar15 para el runtime transcribe.cpp (fork Hex). El modelo está especializado en reconocimiento automático del habla (ASR) para árabe egipcio y para situaciones de code-switching árabe-inglés, un escenario muy frecuente en conversaciones reales en Egipto donde se intercalan términos en inglés dentro de frases en árabe.

El modelo original parte de la arquitectura Qwen3-ASR 1.7B de Alibaba, con aproximadamente 2.038 millones de parámetros totales y una licencia Apache-2.0 que permite uso comercial. Esta conversión concreta se distribuye en cuantización Q8_0 (2,18 GB en disco), con tipos de tensor F32 y Q8_0, y está pensada exclusivamente para el runtime transcribe.cpp, no para el runtime audio.cpp del autor original.

Su relevancia radica en que ofrece una vía de despliegue local y ligera para transcripción de audio en árabe egipcio, un idioma con poca cobertura en modelos ASR generalistas. No obstante, el propio autor advierte que no se han publicado métricas independientes de WER ni de velocidad para este artefacto convertido, por lo que debe evaluarse con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_asr (variante qwen3-asr-1.7b) |
| Parametros totales | 2.038.078.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (tipos de tensor F32 y Q8_0) |
| Idiomas soportados | ar (árabe egipcio), en (inglés, solo como code-switching dentro de árabe) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-ASR, identificada en los metadatos como `qwen3_asr` con variante `qwen3-asr-1.7b`. Se trata de un modelo de reconocimiento automático del habla derivado de Qwen3-ASR 1.7B de Alibaba, sobre el que Mohammed Aly realizó un ajuste fino específico para árabe egipcio y code-switching árabe-inglés. El checkpoint fuente utilizado para la conversión está fijado al commit `50f6b901a3b882bdf28e71efd91f9f561510fc6f` del repositorio `mohammedaly22/QwenCleo-ASR`.

La conversión a GGUF se realizó con el conversor y cuantizador de transcribe.cpp en el commit `7045d1c0fe7cee37747b2792977421d435e75fca`, mediante el script `scripts/convert-qwencleo.py` del fork Hex y la orden `transcribe-quantize --quant Q8_0`. El wrapper verifica el hash de los pesos fuente fijados y las embeddings atadas (tied embeddings), y modifica los metadatos de atribución; la conversión de tensores la realiza el backend. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo fuente.

## Capacidades

- Reconocimiento automático del habla (ASR) offline para árabe egipcio.
- Manejo de code-switching árabe-inglés: términos en inglés intercalados en frases en árabe.
- Transcripción de audio largo mediante chunking automático en el runtime Hex.
- Soporte de cancelación de transcripciones en curso (según el backend nativo de Hex).
- Entrada de audio a 16 kHz mono.
- Indicación explícita de idioma mediante el flag `--language ar`.
- No proporciona marcas de tiempo por palabra (word timestamps).
- No soporta transcripción en streaming.

## Casos de uso

- Transcripción de reuniones y llamadas en árabe egipcio: el modelo puede procesar audio de 16 kHz mono y generar transcripciones offline, adecuado para equipos que trabajan en Egipto y necesitan actas automatizadas sin enviar audio a servicios en la nube.
- Subtitulado de contenido audiovisual egipcio: útil para series, pódcast o vídeos donde los hablantes mezclan árabe e inglés de forma natural, gracias a su especialización en code-switching.
- Análisis de atención al cliente: transcripción de grabaciones de call centers egipcios para su posterior análisis de sentimiento o extracción de topics, con despliegue local que evita problemas de privacidad.
- Documentación clínica o legal dictada: transcripción de notas de voz en árabe egipcio en entornos con requisitos de confidencialidad, al poder ejecutarse en local con transcribe.cpp.
- Investigación lingüística sobre code-switching: generación de corpus transcritos de conversaciones bilingües árabe-inglés para estudios sociolingüísticos, aprovechando la naturaleza offline y reproducible del pipeline.
- Prototipado de asistentes de voz locales: integración en aplicaciones de escritorio o embebidas que requieran ASR en árabe sin dependencia de API externas, usando el runtime transcribe.cpp y el modelo cuantizado Q8_0 de 2,18 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las comprobaciones estructurales y la inferencia de fixtures nativos son verificaciones de preparación, no un benchmark de habla egipcia, y que no se reclama ningún WER ni velocidad independiente para este artefacto convertido. El benchmark reportado por el autor del modelo fuente pertenece a ese checkpoint y a su configuración de evaluación, y no debe interpretarse como una medición de esta conversión Q8.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-3 GB con cuantización Q8_0 (tamaño del archivo 2,18 GB más overhead de contexto y buffers).
- GPU recomendadas: no disponible información específica del autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares con 4 GB o más de VRAM.
- Opciones de despliegue: transcribe.cpp (fork Hex, backend nativo), con CLI `transcribe-cli`. No está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM de generación de texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| QwenCleo-ASR-transcribe-cpp-GGUF (este) | 2.038 M | no disponible | ar (egipcio), en (code-switching) | apache-2.0 | GGUF Q8_0 |
| Qwen3-ASR 1.7B (base) | ~1.7 B | no disponible | multilingüe (hasta 30 idiomas según el autor) | apache-2.0 | safetensors |
| mohammedaly22/QwenCleo-ASR (fuente) | 2.038 M | no disponible | ar (egipcio), en (code-switching) | apache-2.0 | safetensors |

La comparativa con alternativas ASR de otros fabricantes (Whisper, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas independientes de WER ni de velocidad para esta conversión Q8; el benchmark del autor fuente no es aplicable a este artefacto.
- El modelo está pensado exclusivamente para árabe egipcio con code-switching inglés; no se debe asumir calidad general en inglés ni en los 30 idiomas heredados del modelo base Qwen3-ASR.
- No proporciona marcas de tiempo por palabra ni soporte de streaming, lo que limita su uso en subtitulado sincronizado o aplicaciones en tiempo real.
- Requiere audio a 16 kHz mono y una indicación explícita de idioma (`--language ar`); un uso incorrecto puede degradar la transcripción.
- Riesgo de alucinación y errores en audio con ruido, acentos distintos del egipcio o terminología técnica fuera del dominio de entrenamiento.
- Sesgos conocidos: no disponible información específica sobre sesgos del modelo fuente ni de la conversión.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor del empaquetado no garantiza la calidad del artefacto convertido; se recomienda validación propia antes de producción.
- Compatible únicamente con el runtime transcribe.cpp (fork Hex), no con audio.cpp ni con otros runtimes GGUF genéricos.

## Enlaces

- [HuggingFace: reomar15/QwenCleo-ASR-transcribe-cpp-GGUF](https://huggingface.co/reomar15/QwenCleo-ASR-transcribe-cpp-GGUF)
- [Modelo fuente: mohammedaly22/QwenCleo-ASR](https://huggingface.co/mohammedaly22/QwenCleo-ASR)
- [Modelo base: Qwen/Qwen3-ASR-1.7B](https://huggingface.co/Qwen/Qwen3-ASR-1.7B)
- [Fork Hex (receta de conversión): github.com/Reomar/hex/tree/feat/qwencleo-asr](https://github.com/Reomar/hex/tree/feat/qwencleo-asr)
