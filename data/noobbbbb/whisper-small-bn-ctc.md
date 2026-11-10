# Noobbbbb/whisper-small-bn-ctc

## Resumen

`Noobbbbb/whisper-small-bn-ctc` es un modelo de reconocimiento automático del habla (ASR) para bengalí (bangla) que sustituye el decodificador autorregresivo de Whisper por una cabeza CTC. El autor parte del encoder de `Noobbbbb/whisper-small-bn-v2` (un fine-tune de Whisper Small sobre bengalí) y le superpone una pequeña cabeza transformer entrenada con pérdida CTC, de modo que la transcripción se genera en una sola pasada. El resultado es un modelo autónomo de 102,4 millones de parámetros que no necesita el modelo base para funcionar.

La motivación es doble: velocidad y despliegue. Al eliminar el decodificador, la inferencia en CPU sobre un clip de 5 segundos baja de 7,61 s a 2,03 s (3,7 veces más rápida) y el peso del repositorio se reduce a 205 MB frente a los aproximadamente 967 MB de Whisper Small en fp32. El modelo está pensado explícitamente para ejecución on-device y en entornos con recursos limitados, donde el coste del decodificador de Whisper resulta prohibitivo.

El compromiso es la precisión: la cabeza CTC no reproduce exactamente el comportamiento del modelo completo. En validación interna empeora el WER (33,8 % frente a 29,1 %) pero mejora el CER (8,0 % frente a 8,4 %); en FLEURS `bn_in`, con audio no visto en entrenamiento, mejora ambos (WER 38,1 % frente a 43,4 %, CER 11,0 % frente a 25,6 %). El proyecto es de autor individual, con licencia Apache 2.0 y sin descargas ni likes en el momento de la consulta, por lo que debe tratarse como un experimento reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper Small + cabeza CTC (transformer encoder de 2 capas, 8 cabezas, dim 768, feed-forward 3072, activación GELU, pre-norm) |
| Parametros totales | 102,4 M (encoder + cabeza CTC) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 s por segmento; audio más largo se corta en trozos de 30 s |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors fp32; el código de inferencia castea a float) |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`encoder.safetensors`, `head.safetensors`) + `ctc_config.json`, `vocab.json`, `encoder_config.json` |

## Arquitectura y entrenamiento

El modelo conserva el encoder convolutional + transformer de Whisper Small (768 dimensiones de modelo, 12 capas en la versión completa) y descarta por completo el decodificador. Sobre las representaciones del encoder se aplica una cabeza CTC compuesta por LayerNorm, dropout, un `TransformerEncoder` de 2 capas con 8 cabezas de atención y una proyección lineal al vocabulario bengalí. La cabeza emite log-probabilidades por frame y la decodificación es greedy: se colapsan repeticiones y se eliminan los tokens blank (índice 0), sin beam search ni modelo de lenguaje externo.

El entrenamiento se realizó sobre el dataset `Noobbbbb/bengali-ai-asr-80k` (80 000 clips, según el identificador del dataset), partiendo del encoder ya ajustado en `Noobbbbb/whisper-small-bn-v2`. La model card no detalla el número de tokens de audio, la composición exacta del corpus, la duración del entrenamiento ni si hubo aumentación de datos. El repositorio incluye el flag `encoder_was_cut` en `ctc_config.json`, lo que indica que en esta variante se eliminaron capas superiores del encoder y, con ellas, el `layer_norm` final, que se reemplaza por `nn.Identity()`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en bengalí, con audio de cualquier duración segmentado automáticamente en ventanas de 30 segundos.
- Inferencia en una sola pasada (no autorregresiva), lo que elimina la latencia acumulada del decodificador de Whisper.
- Salida con normalización de texto: normalización Unicode NFC y filtrado de caracteres fuera del rango bengalí (U+0980–U+0DFF).
- Ejecución en CPU y GPU sin dependencia del modelo base; el repositorio es autónomo.
- API de conveniencia `WhisperCTC.transcribe(path)` para ficheros de audio y `transcribe_array(y)` para arrays de 16 kHz mono.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio clasificación ni traducción: es un modelo ASR puro de un solo idioma.
- No dispone de marcas de tiempo por palabra ni de detección de idioma.

## Casos de uso

- **Transcripción on-device en dispositivos de gama baja**: el modelo cabe en 205 MB y transcribe un clip de 5 s en 2,03 s en CPU, lo que permite integrarlo en aplicaciones móviles o de escritorio para dictado en bengalí sin conexión.
- **Subtitulado por lotes de archivos largos**: la segmentación automática en ventanas de 30 s permite procesar horas de audio con un bucle simple, sin gestionar el estado del decodificador entre segmentos.
- **Preprocesado de corpus de voz para NLP en bengalí**: transcripción masiva de grabaciones para construir datasets de texto, aprovechando el CER relativamente bajo (8,0 % en validación) en audio con condiciones similares al corpus de entrenamiento.
- **Sistemas de atención al cliente con IVR**: transcripción rápida de consultas telefónicas en bengalí para enrutarlas a un clasificador de intenciones; la velocidad en CPU reduce el coste por minuto frente a Whisper completo.
- **Investigación comparativa de arquitecturas ASR**: al compartir encoder con `whisper-small-bn-v2`, sirve como línea base controlada para medir el efecto de sustituir el decodificador autorregresivo por CTC en el mismo dominio de datos.
- **Servicio embebido en contenedores ligeros**: con 205 MB de pesos y dependencias estándar (`torch`, `transformers`, `safetensors`, `librosa`), se despliega en instancias pequeñas o en el edge sin GPU.
- **Accesibilidad para hablantes de bengalí**: dictado y generación de actas en tiempo casi real en equipos sin acelerador hardware.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Conjunto | Métrica | CTC (este modelo) | Whisper completo (`whisper-small-bn-v2`) |
|---|---|---|---|
| Validación interna (200 clips) | WER | 33,8 % | 29,1 % |
| Validación interna (200 clips) | CER | 8,0 % | 8,4 % |
| FLEURS `bn_in` (200 clips, audio no visto) | WER | 38,1 % | 43,4 % |
| FLEURS `bn_in` (200 clips, audio no visto) | CER | 11,0 % | 25,6 % |
| Velocidad CPU, clip de 5 s | Tiempo | 2,03 s | 7,61 s |
| Tamaño de pesos | — | 205 MB | ~967 MB (fp32) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, por no ser aplicables a un modelo ASR. No hay datos de throughput agregado, latencia p99 ni comportamiento en GPU.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en fp32 para los 102,4 M de parámetros (unos 410 MB de pesos más activaciones); no se han publicado cifras oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050, RTX 4090, A100 y H100. El modelo no aprovecha la capacidad de GPUs de gama alta por su tamaño reducido.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- **CPU**: es el objetivo principal del diseño; el autor reporta 2,03 s por clip de 5 s (aproximadamente 2,5× tiempo real) sin especificar el procesador empleado.
- **Opciones de despliegue**: el repositorio incluye `ctc_inference.py` con PyTorch puro. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo estándar, estos motores no lo soportan de forma nativa. Es posible exportarlo a ONNX o TorchScript, pero no se proporcionan scripts.
- **Latencia y throughput**: solo se conoce la cifra de CPU indicada; no hay datos de GPU ni de procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| `Noobbbbb/whisper-small-bn-ctc` | 102,4 M | 30 s por segmento | Encoder Whisper + CTC | Apache 2.0 | 205 MB, 3,7× más rápido en CPU que Whisper completo |
| `Noobbbbb/whisper-small-bn-v2` | 241,7 M | 30 s por segmento | Whisper encoder-decoder | no disponible en la información | Mejor WER en validación (29,1 %), peor CER en FLEURS (25,6 %) |
| Whisper Small original (OpenAI) | 241,7 M | 30 s por segmento | Whisper encoder-decoder | MIT | Multilingüe; rendimiento en bengalí no disponible en esta información |
| Wav2Vec2 / XLS-R fine-tune para bengalí | no disponible | no disponible | CNN + transformer + CTC | variable | Alternativa CTC estándar; sin datos comparativos en esta información |

La comparación directa más relevante es con el modelo base del que se deriva, ya que comparten encoder y dominio de datos. Frente a alternativas CTC clásicas (Wav2Vec2, XLS-R) no se dispone de cifras comparables publicadas en la información proporcionada.

## Limitaciones y advertencias

- **Precisión inferior en validación**: el WER sube del 29,1 % al 33,8 % respecto al modelo completo en el conjunto de validación interno, lo que sugiere degradación en audio con características similares al corpus de entrenamiento.
- **Riesgo de alucinación y errores sistemáticos**: la decodificación greedy CTC sin modelo de lenguaje produce errores de ortografía y segmentación que un decodificador con LM contextual podría corregir; no hay mecanismo de confianza por token.
- **Un solo idioma**: solo bengalí; no traduce ni detecta idioma, y audio en otras lenguas producirá salidas sin sentido.
- **Sin puntuación ni mayúsculas fiables**: la normalización elimina todo carácter fuera del rango bengalí, incluida puntuación latina; el modelo no está entrenado explícitamente para restaurar puntuación.
- **Sesgos del corpus**: entrenado sobre `bengali-ai-asr-80k`, por lo que hereda los sesgos de dominio, acento, género y calidad de grabación de ese dataset; no se documenta su composición demográfica.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base `whisper-small-bn-v2` debe verificarse por separado para confirmar la cadena de licencias.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; sin validación externa ni mantenimiento conocido. No recomendable como dependencia crítica en producción sin una evaluación propia sobre el dominio objetivo.
- **Detalles de entrenamiento ausentes**: no se publican hiperparámetros, número de épocas, composición del dataset ni métricas por subgrupo, lo que dificulta la reproducibilidad.
- **Manejo de audio largo**: la segmentación fija de 30 s puede cortar palabras en los límites entre segmentos y no hay solapamiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noobbbbb/whisper-small-bn-ctc
- Modelo base: https://huggingface.co/Noobbbbb/whisper-small-bn-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Noobbbbb/bengali-ai-asr-80k
- Whisper Small original (OpenAI): https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper de CTC (Graves et al., 2006): https://www.cs.toronto.edu/~graves/icml_2006.pdf
- FLEURS benchmark: https://huggingface.co/datasets/google/fleurs
