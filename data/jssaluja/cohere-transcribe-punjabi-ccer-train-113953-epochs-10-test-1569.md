# jssaluja/cohere-transcribe-punjabi-ccer-train-113953-epochs-10-test-1569

## Resumen

El modelo `jssaluja/cohere-transcribe-punjabi-ccer-train-113953-epochs-10-test-1569` es un ajuste fino (fine-tune) del modelo de transcripción de voz `CohereLabs/cohere-transcribe-03-2026` de Cohere, especializado en el reconocimiento automático de habla (ASR) para el idioma punyabí (código `pa`). El autor, `jssaluja`, ha entrenado este modelo sobre el conjunto de datos `rajinder_singh_corrected`, que parece contener audio corregido de un único orador. El modelo está pensado para transcribir audio en punyabí, incluyendo contenido relacionado con Gurbani (escrituras sagradas sij). Con 2.071 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo, y su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

Este modelo es relevante porque ofrece una solución de transcripción ASR específica para punyabí, un idioma con menos recursos en el ecosistema de modelos abiertos. Al partir de un modelo base de Cohere y ajustarse en un corpus específico, pretende mejorar la precisión en la transcripción de audio punyabí, especialmente en contextos de gurbani. El repositorio incluye los pesos en formato `safetensors` y es compatible con la librería `transformers` y con plataformas de inferencia como FriendliAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (basada en `CohereLabs/cohere-transcribe-03-2026`) |
| Parámetros totales | 2.071.462.874 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se proporcionan pesos en `safetensors`) |
| Idiomas soportados | Punyabí (pa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base `CohereLabs/cohere-transcribe-03-2026`. Se sabe que es un modelo de transcripción de voz (ASR) desarrollado por Cohere, pero no se detalla si utiliza un transformer clásico, una arquitectura con atención lineal u otro diseño. El ajuste fino se realizó sobre el dataset `jssaluja/rajinder_singh_corrected`, que contiene audio en punyabí (posiblemente de un único orador). En la model card del modelo pequeño asociado se indican hiperparámetros como `learning_rate=0.0002`, `batch_size=8`, `gradient_accumulation_steps=4` y `optimizer AdamW`, pero para el modelo actual (`epochs-10`) no se han publicado los hiperparámetros exactos de entrenamiento. El nombre del modelo sugiere que se entrenó durante 10 épocas sobre un subconjunto de 113.953 muestras, con un conjunto de prueba de 1.569 muestras, aunque estos datos no están confirmados en la documentación disponible.

## Capacidades

- Transcripción automática de voz en punyabí, tanto en alfabeto gurmukhi como posiblemente en transliteración latina.
- Reconocimiento de habla continua (ASR) para audio de larga duración, gracias al manejo de chunking del modelo base.
- Especialización en contenido religioso o espiritual (gurbani), dado el dataset de entrenamiento.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso, al ser un modelo exclusivamente de ASR.
- No se indica soporte para otros idiomas distintos del punyabí.

## Casos de uso

- Transcripción de audio de entrevistas o discursos en punyabi para generar subtítulos o actas.
- Conversión de contenido de audio religioso (kirtan, paath, etc.) a texto para archivos digitales y búsqueda en escrituras.
- Creación de subtítulos automáticos para vídeos en punyabi en plataformas de streaming o redes sociales.
- Análisis de llamadas de servicio al cliente en punyabi para extraer información o entrenar chatbots.
- Documentación de audiencias judiciales o parlamentarias en punyabi, mediante transcripción precisa.
- Asistencia para personas con discapacidad auditiva que necesitan transcripciones en tiempo real de eventos en punyabi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo específico. El `model-index` de la model card está vacío (`results: []`). El modelo pequeño `jssaluja/cohere-transcribe-punjabi-ncer-train-60381-epochs-2-small` reporta una WER de 0.8061 en su evaluación, pero no se debe extrapolar ese dato al modelo actual, ya que son entrenamientos distintos. Por tanto, no se dispone de métricas objetivas (WER, CER) para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4-5 GB (2.07B parámetros en FP16 ocupan ~4.1 GB).
- Con cuantización INT8 (no disponible de forma oficial, pero posible mediante conversión), se reduciría a ~2-3 GB.
- Con cuantización INT4, ~1-2 GB, pero no se ha probado.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Ti) para ejecución en FP16. Para mayor velocidad, RTX 3090/4090 o A100/H100.
- El modelo cabe en tarjetas de consumo (RTX 3060 12 GB, RTX 4070, etc.) sin problema.
- Opciones de despliegue: librería `transformers` con `pipeline("automatic-speech-recognition")`, servidor de inferencia vLLM, llama.cpp (si se convierte a GGUF), o plataformas como FriendliAI.
- Latencia y throughput no especificados.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables específicos para ASR en punyabi. Se podría considerar el modelo base `CohereLabs/cohere-transcribe-03-2026` como referencia, pero no se dispone de sus métricas. Otras alternativas generales como Whisper (OpenAI) o Wav2Vec2 no están directamente comparadas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo ha sido entrenado sobre un dataset muy específico (`rajinder_singh_corrected`), probablemente de un solo orador, lo que puede provocar un rendimiento deficiente con voces diferentes, acentos o variantes regionales del punyabi.
- No se han publicado evaluaciones sobre conjuntos de datos variados; la WER reportada en el modelo pequeño es alta (0.80), lo que sugiere que la precisión puede ser limitada en condiciones reales.
- Riesgo de alucinaciones en la transcripción, especialmente en pasajes ambiguos o con ruido de fondo.
- Solo soporta punyabi; no es multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero no se han detallado restricciones adicionales sobre el uso del modelo base.
- No se ha probado en producción; el modelo se presenta como un experimento de ajuste fino, por lo que su robustez en entornos reales no está garantizada.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/jssaluja/cohere-transcribe-punjabi-ccer-train-113953-epochs-10-test-1569)
- [FriendliAI - página del modelo](https://friendli.ai/models/jssaluja/cohere-transcribe-punjabi-ccer-train-113953-epochs-10-test-1569)
- [Cohere Transcribe (página oficial)](https://cohere.com/transcribe)
- [Modelo base en Hugging Face](https://huggingface.co/CohereLabs/cohere-transcribe-03-2026)
