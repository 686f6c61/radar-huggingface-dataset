# duhow/veucat

## Resumen

VeuCat es un modelo de reconocimiento automático de voz (ASR) compacto desarrollado por el usuario duhow, diseñado específicamente para catalán y español. Se trata de un modelo encoder-decoder con arquitectura estilo Whisper Base, pero con una diferencia fundamental: tanto los pesos como el tokenizador de texto fueron entrenados desde cero, sin partir de ningún checkpoint de OpenAI Whisper. El modelo se entrenó exclusivamente con Mozilla Common Voice Scripted Speech 27.0, con una proporción de muestreo del 80% catalán y 20% español.

El modelo resuelve la transcripción de voz a texto sin marcas de tiempo, y su relevancia radica en ofrecer una alternativa ligera (59,1 millones de parámetros) y de licencia Apache 2.0 para dos lenguas románicas con recursos limitados en el ecosistema ASR. Su tamaño reducido permite despliegues en hardware modesto, y su entrenamiento desde cero evita las limitaciones de vocabulario y sesgos de los checkpoints multilingües de Whisper.

La arquitectura emplea 6 capas de encoder y 6 de decoder, dimensión oculta de 512, 8 cabezas de atención por capa y dimensión feed-forward de 2.048, con entrada de espectrograma log-Mel de 80 bins y ventana de audio de hasta 30 segundos. El vocabulario personalizado de 24.000 tokens BPE fue entrenado con texto de Common Voice en catalán y español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Base-style encoder-decoder Transformer |
| Parametros totales | 59.150.336 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 448 posiciones en el decoder; ventana de audio de hasta 30 s (3.000 frames Mel, 1.500 posiciones de encoder) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | catalán (ca), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VeuCat implementa `transformers.WhisperForConditionalGeneration` con una `WhisperConfig` nueva e inicialización aleatoria de pesos. El encoder y el decoder constan de 6 capas Transformer cada uno, con dimensión oculta de 512, 8 cabezas de atención por capa y dimensión feed-forward de 2.048. La entrada acústica es un espectrograma log-Mel de 80 bins a 16 kHz mono, con FFT de 400 muestras y hop de 160, y ventana máxima de 30 segundos (3.000 frames Mel, 1.500 posiciones de encoder). El decoder admite hasta 448 posiciones.

El entrenamiento acumuló 500.000 actualizaciones del optimizador en tres fases consecutivas, manteniendo una proporción de muestreo del 80% catalán y 20% español. La única fuente de datos fue Mozilla Common Voice Scripted Speech 27.0 (release `cv-corpus-27.0-2026-09-11`), usando las particiones `train.tsv` de catalán y español. El preprocesado incluyó normalización Unicode NFC del texto, eliminación de duplicados priorizando particiones de evaluación, decodificación con FFmpeg a PCM mono 16 kHz y truncado a 30 segundos. El tokenizador ByteLevel BPE se entrenó desde cero con hasta 250.000 frases por idioma (`vocab_size=24000`, `min_frequency=5`, `max_token_length=24`), añadiendo después los tokens especiales compatibles con Whisper: 99 IDs de idioma, tokens de tarea/control y 1.501 tokens de timestamp. Solo se entrenaron catalán y español; los tokens reservados de otros idiomas y de timestamps no producen resultados fiables. El objetivo de entrenamiento es `<|startoftranscript|> <|ca|> o <|es|> <|transcribe|> <|notimestamps|> TEXTO <|endoftext|>`.

## Capacidades

- Transcripción de voz a texto en catalán y español, condicionada por idioma.
- Reconocimiento sin marcas de tiempo (la tarea entrenada es `transcribe` con `notimestamps`).
- Procesamiento de audio de hasta 30 segundos por ventana.
- Tokenizador propio con vocabulario BPE de 24.000 tokens entrenado sobre texto de Common Voice en ambos idiomas.
- Compatibilidad con la API de `transformers` para `WhisperForConditionalGeneration`.
- No soporta traducción de voz, síntesis de voz ni timestamps fiables.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).

## Casos de uso

- Transcripción de reuniones y entrevistas en catalán: el modelo puede procesar segmentos de hasta 30 segundos con un WER del 10,88% en el test de Common Voice catalán, adecuado para actas y resúmenes posteriores con un modelo de lenguaje.
- Subtitulado automático de contenido audiovisual en español: con un WER del 15,58% en test de Common Voice español y un RTF de 0,003, permite generar subtítulos en tiempo casi real sobre hardware de consumo.
- Atención al cliente telefónica en catalán: su tamaño de 59 millones de parámetros facilita el despliegue en servidores modestos para transcribir llamadas y alimentar sistemas de análisis de calidad.
- Archivado y búsqueda de audio en bibliotecas digitales catalanas: el modelo puede transcribir grabaciones de dominio público (como FestCat, con WER del 22,88%) para indexación textual, aceptando un cierto deterioro por cambio de dominio.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva: la baja latencia (RTF 0,003) permite transcripción en vivo en dispositivos con GPU de gama media.
- Investigación en ASR de bajos recursos: al estar entrenado desde cero y con licencia Apache 2.0, sirve como base reproducible para experimentos con otras lenguas románicas o para estudiar el efecto de proporciones de muestreo bilingües.
- Transcripción de notas de voz en aplicaciones móviles: el reducido tamaño del repositorio (0,2 GB) y los pesos safetensors permiten integración en backends ligeros sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

Resultados publicados en la model card (WER y CER en porcentaje, menor es mejor; RTF es tiempo de inferencia entre duración del audio):

| Conjunto | Split | Clips | Horas | WER | CER | RTF |
|---|---:|---:|---:|---:|---:|---:|
| Common Voice 27.0 catalán | dev | 16.416 | 27,84 | 8,77% | 3,27% | 0,003 |
| Common Voice 27.0 catalán | test | 16.415 | 27,64 | 10,88% | 4,48% | 0,003 |
| Common Voice 27.0 español | dev | 15.907 | 26,87 | 13,24% | 4,96% | 0,003 |
| Common Voice 27.0 español | test | 15.907 | 26,97 | 15,58% | 6,24% | 0,003 |
| FestCat (Projecte Aina, trimmed/denoised) | — | 12.435 | 22,91 | 22,88% | 15,91% | 0,005 |
| OpenSLR69 catalán (Projecte Aina, trimmed/denoised) | — | 4.240 | 4,99 | 13,46% | 5,42% | 0,006 |

Los conjuntos FestCat y OpenSLR69 no se usaron como fuentes de entrenamiento; sus resultados indican transferencia de dominio y no son directamente comparables con Common Voice por diferencias en condiciones de grabación y distribución textual.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,24 GB en fp32 (59,1 M de parámetros), menos de 0,15 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. También funciona en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (PyTorch), pipeline `automatic-speech-recognition`; no se han publicado variantes GGUF para llama.cpp ni Ollama. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: RTF de 0,003 en Common Voice (aproximadamente 333 veces más rápido que tiempo real en el entorno de evaluación del autor); RTF de 0,005–0,006 en los conjuntos externos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | Licencia | WER catalán (CV) | WER español (CV) |
|---|---:|---|---|---|---:|---:|
| VeuCat (duhow) | 59,1 M | 30 s | ca, es | Apache 2.0 | 10,88% (test) | 15,58% (test) |
| OpenAI Whisper Base | 74 M | 30 s | multilingüe (99) | MIT | no disponible en la información | no disponible en la información |
| OpenAI Whisper Small | 244 M | 30 s | multilingüe (99) | MIT | no disponible en la información | no disponible en la información |
| Projecte Aina ASR catalán | no disponible | no disponible | ca | no disponible | no disponible en la información | no aplica |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa directa no es posible. La ventaja diferencial de VeuCat es su licencia Apache 2.0, su tamaño reducido y su entrenamiento específico para catalán y español, frente a la naturaleza multilingüe y de mayor tamaño de los checkpoints de Whisper.

## Limitaciones y advertencias

- Solo reconoce catalán y español; los 99 tokens de idioma reservados no implican capacidad multilingüe real.
- No produce timestamps fiables: los 1.501 tokens de timestamp están reservados pero no fueron entrenados para ello.
- El tokenizador es propio y no es intercambiable con el de `openai/whisper-*`; usar siempre el tokenizador distribuido con el modelo.
- El WER se degrada en dominios distintos de Common Voice (22,88% en FestCat), por lo que en producción con audio de estudio, ruido o acentos no representados puede aumentar notablemente.
- Riesgo de alucinación en segmentos silenciosos o con ruido, inherente a los modelos encoder-decoder de ASR.
- Sesgos derivados de la distribución de Common Voice: posibles diferencias de rendimiento por género, edad, acento y calidad de micrófono.
- Ventana máxima de 30 segundos por inferencia; audios más largos requieren segmentación previa.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.
- El modelo tiene solo 25 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duhow/veucat
- Mozilla Common Voice 27.0: https://commonvoice.mozilla.org/en/datasets
- Dataset FestCat trimmed and denoised (Projecte Aina): https://huggingface.co/datasets/projecte-aina/festcat_trimmed_denoised
- Dataset OpenSLR69 catalán trimmed and denoised (Projecte Aina): https://huggingface.co/datasets/projecte-aina/openslr-slr69-ca-trimmed-denoised
