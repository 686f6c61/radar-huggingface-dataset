# Janhouse/whisper-large-v3-lv-late-cv19-GGUF

## Resumen

`Janhouse/whisper-large-v3-lv-late-cv19-GGUF` es una conversión comunitaria al formato GGUF y cuantización Q8_0 del modelo letón `AiLab-IMCS-UL/whisper-large-v3-lv-late-cv19`, desarrollado por AiLab en el Instituto de Matemáticas y Ciencias de la Computación (IMCS) de la Universidad de Letonia. El modelo original es un ajuste fino (fine-tune) en letón de OpenAI Whisper large-v3, orientado a reconocimiento automático del habla (ASR) en dicho idioma. Esta publicación no añade entrenamiento: solo distribuye los pesos convertidos y cuantizados para su uso con el runtime transcribe.cpp.

La relevancia de esta ficha reside en su naturaleza de artefacto de despliegue: permite ejecutar un modelo ASR de gran calidad para letón en entornos ligeros, sin depender del formato GGML `.bin` de whisper.cpp. El repositorio ocupa 1,7 GB y contiene un único archivo Q8_0 de 1.668.741.568 bytes, con 1.543.516.688 parámetros según los safetensors del modelo base.

Se trata de un modelo especializado en un único idioma (letón), con metadatos multilingües heredados de Whisper large-v3 que no deben interpretarse como calidad evaluada en otras lenguas. La licencia Apache-2.0 del modelo original se conserva en esta derivación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (transformer encoder-decoder para ASR), identificador `whisper-large-v3` |
| Parametros totales | 1.543.516.688 (1,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (única publicada en este repositorio) |
| Idiomas soportados | Letón (lv); metadatos multilingües heredados de Whisper large-v3 sin evaluación reportada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con transcribe.cpp; no compatible con whisper.cpp ni con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper large-v3: un transformer encoder-decoder con atención estándar, diseñado para transcripción de audio a texto. El modelo base fue ajustado en letón por AiLab (IMCS, Universidad de Letonia), aunque esta publicación concreta no aporta detalles adicionales sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El repositorio remite a la model card del modelo original para esa información.

La innovación técnica de esta publicación es puramente de formato: la conversión se realizó directamente desde el `model.safetensors` original en F16 a un GGUF de referencia, y de ahí a Q8_0, sin usar el archivo GGML Q4 upstream. El resultado contiene 1.261 tensores, con tipos de salida verificados como F32 y Q8_0. Se comprobó que `proj_out.weight` es exactamente igual a `model.decoder.embed_tokens.weight`, lo que valida la asunción de embedding de salida compartido del conversor. El proceso se ejecutó con transcribe.cpp en la revisión `5700f127e38dd53c4735ea23ef743b4b538eacd4` sobre el modelo base en la revisión `94d86513ea085c962af2bd689dd7d1122496e16d`.

## Capacidades

- Reconocimiento automático del habla (ASR) en letón, con salida de transcripción de audio a texto.
- Detección automática de idioma (opción "Auto") o selección manual de letón en aplicaciones compatibles.
- Procesamiento de audio de entrada en formato WAV mono a 16 kHz mediante la CLI de transcribe.cpp.
- Integración en aplicaciones que usen el backend Whisper de transcribe.cpp, como Hex (con importación de modelos de voz personalizados).
- Metadatos multilingües heredados de Whisper large-v3, sin evidencia de calidad evaluada fuera del letón.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y entrevistas en letón: el modelo convierte grabaciones de audio en texto para actas y documentación, aprovechando el ajuste específico al idioma para reducir errores frente al Whisper genérico.
- Subtitulado de contenido audiovisual en letón: integrable en pipelines que generen subtítulos a partir de pistas de audio, con la CLI de transcribe.cpp como paso de transcripción.
- Dictado por voz en aplicaciones de escritorio: mediante Hex con "Use your own speech model", el usuario importa el `.gguf` y dicta en letón seleccionando el idioma manualmente para evitar transcripciones erróneas.
- Archivado y búsqueda de audio histórico: transcripción masiva de archivos de audio en letón para indexación y búsqueda textual posterior.
- Investigación en ASR de bajos recursos: el modelo sirve como referencia cuantizada para experimentos con el corpus Common Voice en letón, citado en el paper de BalsuTalka.lv.
- Despliegue en entornos con recursos limitados: al ocupar 1,67 GB en Q8_0, puede ejecutarse en máquinas sin GPU dedicada mediante transcribe.cpp, a diferencia de los pesos F16 originales.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en contextos de habla letona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta cuantización ha sido probada de forma informal en Hex, pero no ha sido evaluada de forma independiente en ningún benchmark de reconocimiento del habla. Las puntuaciones del modelo original no deben tratarse como mediciones de esta cuantización GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el archivo Q8_0 ocupa 1,67 GB, por lo que se requiere al menos esa cantidad de memoria más el overhead del runtime.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPUs de consumo con suficiente memoria, aunque no se documentan pruebas.
- Cabe en GPU de consumo: probable por el tamaño del archivo, pero no confirmado por el autor.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y backend Whisper) y aplicaciones que lo integren, como Hex. No es compatible con whisper.cpp ni con llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Janhouse/whisper-large-v3-lv-late-cv19-GGUF | 1,54 mil millones | No disponible | Letón | Apache-2.0 | GGUF (transcribe.cpp) |
| AiLab-IMCS-UL/whisper-large-v3-lv-late-cv19 (original) | 1,54 mil millones | No disponible | Letón | Apache-2.0 | Safetensors (F16) |
| OpenAI Whisper large-v3 | 1,54 mil millones | No disponible | Multilingüe | Apache-2.0 | Safetensors, GGML |

La comparación con otros modelos ASR específicos para letón no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en letón: el autor advierte que los metadatos multilingües heredados no constituyen evidencia de calidad evaluada en otros idiomas.
- No dejar el idioma de origen en inglés al dictar en letón; la detección automática no garantiza transcripciones fiables de grabaciones con varios idiomas mezclados.
- La cuantización Q8_0 no ha sido evaluada de forma independiente en benchmarks; las métricas del modelo original no son aplicables a esta versión.
- No es compatible con whisper.cpp (formato GGML `.bin`) ni con llama.cpp; la extensión `.gguf` no implica compatibilidad universal.
- Es una conversión comunitaria, no una publicación oficial de AiLab.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de audio con ruido, silencios o habla no letona; no cuantificado en esta publicación.
- Licencia Apache-2.0: permite uso comercial, pero requiere mantener la atribución a AiLab (fine-tuning), OpenAI (modelo base) y transcribe.cpp (herramientas de conversión).
- No se documentan sesgos específicos del ajuste en letón.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Janhouse/whisper-large-v3-lv-late-cv19-GGUF
- Modelo base: https://huggingface.co/AiLab-IMCS-UL/whisper-large-v3-lv-late-cv19
- Revisión del modelo base: https://huggingface.co/AiLab-IMCS-UL/whisper-large-v3-lv-late-cv19/tree/94d86513ea085c962af2bd689dd7d1122496e16d
- Herramienta de conversión (transcribe.cpp): https://github.com/handy-computer/transcribe.cpp
- Revisión de transcribe.cpp usada: https://github.com/handy-computer/transcribe.cpp/tree/5700f127e38dd53c4735ea23ef743b4b538eacd4
- Aplicación Hex: https://github.com/anomalyco/hex
- AiLab, Universidad de Letonia: https://ailab.lv/
- Paper BalsuTalka.lv (LREC 2024): https://aclanthology.org/2024.lrec-main.187/
