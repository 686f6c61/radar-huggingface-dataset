# Prahaladha/hima-asr-ONNX

## Resumen

Hima-ASR ONNX es la exportación a ONNX Runtime del modelo de reconocimiento automático del habla Hima-ASR, desarrollado por Prahaladha. Resuelve la transcripción de audio en once lenguas de la India (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu) más inglés, incluyendo cambios de código entre lenguas, y añade una capacidad poco habitual: un cabezal de decisión que responde preguntas de opción múltiple sobre el audio combinando prosodia y contenido. La relevancia actual radica en que funciona íntegramente en CPU con `onnxruntime` y numpy, sin necesidad de PyTorch ni de GPU.

La arquitectura es un encoder-decoder de tipo transformer: el encoder de audio se inicializa desde Qwen3-ASR-1.7B y el decoder de texto desde Gemma 3 270M. El paquete ONNX ofrece tres precisiones (fp32, int8 y q4) con tamaños de 1,8 GB, 487 MB y 360 MB respectivamente, lo que permite desplegarlo en portátiles y servidores sin acelerador. El modelo base en PyTorch pesa 920 MB.

La ficha se centra en la versión ONNX, que es la publicada en este repositorio, aunque la model card reporta métricas medidas sobre 36 fragmentos de audio retenidos (255 segundos en 12 lenguas) en un MacBook Pro M4 Pro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (encoder de audio inicializado desde Qwen3-ASR-1.7B; decoder de texto inicializado desde Gemma 3 270M) más cabezal de decisión |
| Parámetros totales | No disponible (el cabezal de decisión tiene 17,5 M de parámetros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp32, int8 y q4 (encoder a 4 bits con decoder int8) |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en |
| Licencia | Apache 2.0 para las partes propias y el encoder; el decoder está sujeto a los Gemma Terms of Use (licencia compuesta `apache-2.0-and-gemma`) |
| Formato de pesos | ONNX (encoder y decoder), safetensors (cabezal de decisión), numpy (`.npy` para filtros mel, embeddings y tokens especiales) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El encoder procesa log-mel spectrograms calculados con numpy puro (`mel_filters.npy`) y proyecta las representaciones hacia el decoder, que genera texto con decodificación greedy y caché de clave/valor. El decoder de texto parte de Gemma 3 270M, mientras que el encoder de audio parte de Qwen3-ASR-1.7B. El cabezal de decisión (`decide/`, 17,5 M de parámetros) lee todas las capas del encoder de audio y del decoder de texto, de modo que combina información acústica y lingüística para responder preguntas de opción múltiple.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí documenta el proceso de exportación a ONNX y las mediciones de precisión y velocidad sobre audio retenido. La innovación destacable es la doble salida en una sola pasada: transcripción y decisiones (16 preguntas predefinidas más preguntas personalizadas de tipo `choice`, `yesno` y `scale`).

## Capacidades

- Reconocimiento automático del habla en 11 lenguas de la India y en inglés, con soporte de code-switching.
- Detección automática del idioma cuando se pasa `language=None`.
- Decisión sobre audio: 16 preguntas predefinidas (idioma, género, tono, sentimiento, emoción, si es pregunta, petición de acción, mención de dinero, mención de tiempo, queja, acuerdo, deseo de hablar con humano, tema, urgencia, formalidad e intención de llamada).
- Preguntas personalizadas de opción múltiple mediante `model.decide()` con tipos `choice`, `yesno` y `scale`.
- Ejecución en CPU con `onnxruntime`, numpy y `tokenizers`, sin PyTorch.
- Control del número de hilos de CPU mediante el parámetro `threads=`.
- Entrada de audio a 16 kHz como fichero o array; otras frecuencias requieren `librosa`.
- No se documenta soporte de tool calling, agentes ni visión.

## Casos de uso

- Transcripción de llamadas de atención al cliente en lenguas indias: el modelo transcribe audio de 16 kHz y, en la misma pasada, devuelve decisiones como `tone`, `sentiment`, `complaint` o `wants_human`, lo que permite enrutar la llamada sin un pipeline separado.
- Análisis de calidad (QA) de centros de contacto: las decisiones `urgency`, `formality` y `call_intent` sobre cada grabación permiten clasificar y priorizar revisiones sin transcripción manual previa.
- Moderación y detección de quejas: la pregunta `mentions_money` y `request_action` ayudan a identificar solicitudes de reembolso o disputas en audio.
- Subtitulado y accesibilidad en contenido multilingüe indio: la transcripción con detección automática de idioma sirve para generar subtítulos en vídeos que alternan hindi, tamil e inglés.
- Despliegue en entornos sin GPU: al ejecutarse con `onnxruntime` en CPU y ocupar 360 MB en q4, es viable en portátiles, mini-PC y contenedores de bajo coste.
- Investigación en sociolingüística y análisis conversacional: las preguntas personalizadas de tipo `scale` permiten anotar velocidad del habla, formalidad o emoción sobre corpus de audio sin entrenamiento adicional.
- Enrutamiento telefónico automatizado: la decisión `language` y `topic` en una sola escucha permite derivar la llamada al agente o al departamento adecuado.

## Benchmarks y rendimiento

Datos reportados en la model card, medidos en un MacBook Pro M4 Pro sobre 36 fragmentos retenidos (255 s de audio) en 12 lenguas, mejor de dos ejecuciones. La "tasa de error de letras" se calcula contra transcripciones humanas.

| Precisión | Ficheros | Tamaño | Velocidad (× tiempo real) | Error de letras |
|---|---|---|---|---|
| PyTorch original | hima-asr | 920 MB | 16× | 5,89 % |
| fp32 | encoder + decoder ONNX | 1,8 GB | 25× | 5,89 % (texto idéntico) |
| int8 | encoder + decoder int8 | 487 MB | 35× | 5,70 % |
| q4 | encoder q4 + decoder int8 | 360 MB | 31× | 5,83 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech o Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU.
- Memoria RAM estimada: aproximadamente 360 MB (q4), 487 MB (int8) o 1,8 GB (fp32) para los pesos, más el overhead de `onnxruntime` y del audio de entrada.
- GPU recomendadas: no disponibles ni necesarias; el paquete está orientado a CPU.
- Compatibilidad con GPU de consumo: no se documenta soporte CUDA; el diseño es CPU-first.
- Opciones de despliegue: `onnxruntime` con numpy y `tokenizers`; el script `hima_onnx.py` actúa como cargador y decodificador greedy. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 25× tiempo real en fp32, 35× en int8 y 31× en q4 sobre M4 Pro; el número de hilos se controla con `threads=`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue CPU |
|---|---|---|---|---|---|
| Hima-ASR ONNX (q4) | No disponible (cabezal de decisión: 17,5 M) | No disponible | 11 lenguas indias + en | Apache 2.0 + Gemma Terms | Sí, `onnxruntime` |
| Whisper large-v3 | 1,55 B | 30 s de audio | ~99 idiomas | MIT | Sí, con `whisper.cpp` u ONNX |
| Qwen3-ASR-1.7B | 1,7 B | No disponible | No disponible | Apache 2.0 | Sí, vía exportación ONNX |
| Gemma 3 270M | 270 M | No disponible | Multilingüe | Gemma Terms | Sí, vía exportación |

La comparación con Whisper es la más directa por tarea (ASR multilingüe), pero Hima-ASR añade el cabezal de decisión y está especializado en lenguas indias. Qwen3-ASR-1.7B y Gemma 3 270M son los componentes base del propio modelo, no alternativas independientes.

## Limitaciones y advertencias

- La licencia es compuesta: las partes propias y el encoder son Apache 2.0, pero el decoder está sujeto a los Gemma Terms of Use, lo que condiciona el uso comercial y la redistribución. Es necesario revisar `NOTICE`.
- El modelo está especializado en lenguas indias e inglés; no se documenta calidad en otras lenguas.
- Las métricas de error (5,70–5,89 %) se han medido sobre solo 36 fragmentos y 255 segundos de audio, una muestra pequeña que no permite extrapolar a dominios ruidosos o acentos no representados.
- Riesgo de alucinación en la transcripción y en las decisiones: el cabezal responde siempre a la pregunta planteada, sin opción explícita de "no aplica".
- No se documentan sesgos de género, edad o dialecto; el modelo incluye una decisión de `gender` que puede amplificar estereotipos si se usa de forma automática.
- La decodificación es greedy, sin beam search, lo que puede limitar la precisión en audio ambiguo.
- La entrada debe ser audio a 16 kHz; otras frecuencias requieren `librosa`, que no forma parte de las dependencias mínimas.
- No se documenta soporte de tool calling, agentes ni multimodalidad más allá del audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Prahaladha/hima-asr-ONNX
- Modelo base: https://huggingface.co/Prahaladha/hima-asr
- Aviso de licencia: https://huggingface.co/Prahaladha/hima-asr/blob/main/NOTICE
- Términos de Gemma: https://ai.google.dev/gemma/terms
