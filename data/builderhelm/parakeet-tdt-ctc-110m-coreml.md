# BuilderHelm/Parakeet-TDT-CTC-110M-CoreML

## Resumen

Parakeet-TDT-CTC-110M-CoreML es la conversión a CoreML del modelo de reconocimiento automático de voz (ASR) `nvidia/parakeet-tdt-ctc-110m`, publicada por BuilderHelm AI. El modelo original de NVIDIA es una arquitectura híbrida que comparte un encoder FastConformer y expone dos cabeceras de decodificación: una TDT (Token-and-Duration Transducer) orientada a transcripción de alta calidad con marcas temporales por token, y una CTC que produce una transcripción greedy junto con log-probabilidades cada 80 ms, útil para keyword spotting y alineamiento.

La conversión está pensada para inferencia local en Apple Silicon, aprovechando el Neural Engine para el encoder cuantizado a int8 y la CPU (Swift/Accelerate) para el decodificador TDT en float32. El paquete completo ocupa 138 MB, lo que lo hace adecuado para aplicaciones de escritorio y móviles que necesitan transcripción en el dispositivo sin enviar audio a la nube.

Su relevancia actual radica en que ofrece una alternativa ligera y precisa para ASR en inglés sobre macOS e iOS, con velocidades de decodificación muy superiores al tiempo real (860× en clips cortos) y una latencia mediana de 13,1 ms por clip corto en Apple M5, manteniendo una calidad competitiva frente a otras conversiones CoreML del mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder FastConformer compartido + cabecera TDT (transducer) + cabecera CTC |
| Parametros totales | 110M (modelo base); paquete CoreML de 138 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de audio largo configurable en `config.json`) |
| Tipos de cuantizacion | Encoder int8 (Neural Engine); decodificador TDT float32 (CPU); preprocesador float32 |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CoreML (`.mlmodelc` / `.bin`), vocabulario `vocab.json` (1.024 tokens) |

## Arquitectura y entrenamiento

El modelo base es `nvidia/parakeet-tdt-ctc-110m`, un ASR híbrido con encoder FastConformer (una variante eficiente del Conformer con convoluciones depthwise y atención subsampled) que comparte representaciones entre dos cabeceras. La cabecera TDT (Token-and-Duration Transducer) predice simultáneamente tokens y duraciones, lo que permite transcripciones de alta calidad con timestamps por token; la cabecera CTC produce una salida greedy con log-probabilidades cada 80 ms, adecuada para tareas de alineamiento y detección de palabras clave. En esta conversión CoreML, el encoder se ejecuta en int8 sobre el Neural Engine y el decodificador TDT (red de predicción LSTM y joint) en float32 sobre CPU vía Swift/Accelerate.

Los datos de entrenamiento del modelo original (según la model card) incluyen LibriSpeech, Fisher Corpus, Common Voice 8.0, National Singapore Corpus Part 1, VCTK, VoxPopuli, Europarl y Multilingual LibriSpeech. No se dispone en la información proporcionada del número exacto de horas de audio, composición detallada del dataset ni del pipeline de RLHF/DPO. La innovación principal de esta conversión es la ejecución simultánea de ambas cabeceras en una sola pasada del encoder, junto con una política de audio largo configurable y contratos de E/S documentados en `config.json`.

## Capacidades

- Reconocimiento automático de voz en inglés con transcripción de texto.
- Salida dual: transcripción TDT (con marcas temporales por token) y transcripción CTC con log-probabilidades cada 80 ms.
- Keyword spotting (detección de palabras clave) a partir de la salida CTC, con recall del 89,8% en Earnings22 a 1 falsa alarma por clip.
- Alineamiento temporal y timestamps por token mediante la cabecera TDT.
- Procesamiento de audio largo mediante política configurable (chunking) definida en `config.json`.
- Ejecución en dispositivo (on-device) en Apple Silicon, sin dependencia de servicios en la nube.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz en macOS: la app puede procesar clips cortos con latencia mediana de 13,1 ms y RTFx de 860×, transcribiendo en tiempo real sin enviar audio a servidores externos.
- Dictado por voz en aplicaciones de escritorio: el paquete de 138 MB y el consumo de memoria de 210 MB en clips cortos permiten integrarlo en apps nativas de macOS con huella mínima.
- Subtitulado y post-producción de audio largo: con RTFx de 791× en audio largo y WER del 2,22% en la prueba de audio largo, es adecuado para generar transcripciones con timestamps de grabaciones extensas.
- Keyword spotting en asistentes de voz: la salida CTC con log-probabilidades cada 80 ms y el recall del 89,8% permiten detectar palabras de activación o términos concretos con baja tasa de falsos positivos.
- Indexación y búsqueda de contenido hablado: la transcripción con marcas temporales por token facilita alinear texto y audio para búsqueda semántica sobre archivos de audio.
- Aplicaciones iOS on-device: mediante BuilderHelmAudio, puede integrarse en apps iOS 18+ para transcripción local, preservando privacidad y evitando costes de API.
- Análisis de llamadas y entrevistas: la combinación de TDT (precisión) y CTC (alineamiento) permite generar transcripciones y metadatos temporales para analítica posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados):

| Dataset / prueba | Métrica | TDT | CTC |
|---|---|---|---|
| LibriSpeech clean (test) | WER | 2,46% | 2,97% |
| LibriSpeech other (test) | WER | 5,27% | 5,88% |
| Earnings22 contextual subset (772 clips) | WER | 16,18% | 17,62% |
| Common Voice / audio largo | WER | 7,59% / 2,22% | no disponible |
| Earnings22 keyword recall (1 FA/clip) | Recall | 89,8% | no disponible |

Rendimiento en Apple M5, macOS 27.2 (mediana de 3 ejecuciones):

| Métrica | Valor |
|---|---|
| RTFx, clips cortos / audio largo (TDT + CTC) | 860× / 791× tiempo real |
| Latencia por clip corto (mediana / p95) | 13,1 / 32,1 ms |
| Memoria pico, clips cortos / audio largo | 210 / 120 MB |

Comparativa con `FluidInference/parakeet-tdt-ctc-110m-coreml` en el mismo Mac y audio:

| Carga | Este modelo | FluidInference TDT |
|---|---|---|
| Clips cortos (262 Common Voice) | 860× · 7,59% | 437× · 8,21% |
| Latencia mediana / p95 | 13,1 / 32,1 ms | 19,8 / 81,8 ms |
| Audio largo (20 archivos, 79 min) | 791× · 2,22% | 1.120× · 2,39% |

## Requisitos de hardware

- VRAM/memoria: no aplica (inferencia en Apple Silicon); memoria pico de 210 MB en clips cortos y 120 MB en audio largo.
- Hardware: Apple Silicon (Neural Engine para el encoder int8, CPU para el decodificador TDT).
- Sistemas: macOS 15+ (Sequoia o superior) o iOS 18+ mediante BuilderHelmAudio.
- No requiere GPU dedicada (A100, H100, RTX 4090) ni CUDA; no está pensado para x86.
- Despliegue: CoreML nativo; no compatible directamente con vLLM, llama.cpp, Ollama o TGI (son stacks para LLM, no para este ASR CoreML).
- Latencia: 13,1 ms mediana y 32,1 ms p95 por clip corto; throughput de 860× en clips cortos y 791× en audio largo.
- Tamaño del paquete: 138 MB (preprocesador 5,7 MB, encoder 112,7 MB, decodificador TDT 19,1 MB, vocab 9 KB, config 5 KB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER LibriSpeech clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet-TDT-CTC-110M-CoreML (este) | 110M | audio largo configurable | 2,46% (TDT) / 2,97% (CTC) | CC BY 4.0 | CoreML, Apple Silicon |
| FluidInference/parakeet-tdt-ctc-110m-coreml | 110M (base) | audio largo | 8,21% (Common Voice, TDT) | no disponible | CoreML, Apple Silicon |
| BuilderHelm/Parakeet-CTC-110M-CoreML | 110M (base) | no disponible | no disponible | no disponible | CoreML, solo CTC |
| nvidia/parakeet-tdt-ctc-110m (base) | 110M | no disponible | no disponible | no disponible | NeMo / PyTorch |

## Limitaciones y advertencias

- Solo soporta inglés; no cubre otros idiomas.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); conviene validarlos en el propio hardware y dominio.
- El WER en Earnings22 (16,18% TDT) es notablemente superior al de LibriSpeech, lo que refleja degradación en audio con ruido, acentos o vocabulario específico de dominio.
- Riesgo de alucinación y errores en nombres propios, siglas y terminología técnica; se recomienda revisión humana en producción.
- En audio largo, FluidInference es más rápido (1.120× frente a 791×), aunque este modelo es más preciso; hay que valorar el trade-off.
- Dependencia exclusiva de Apple Silicon y macOS 15+/iOS 18+; no ejecutable en Linux, Windows o GPU NVIDIA.
- Licencia CC BY 4.0: permite uso comercial con atribución; hay que revisar los términos exactos de la licencia del modelo base de NVIDIA para cumplimiento.
- No dispone de tool calling, agentes ni razonamiento; su uso está limitado a ASR y tareas derivadas (keyword spotting, alineamiento).
- La model card no documenta sesgos específicos ni composición detallada del dataset de entrenamiento; no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Parakeet-TDT-CTC-110M-CoreML
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-ctc-110m
- Variante solo CTC: https://huggingface.co/BuilderHelm/Parakeet-CTC-110M-CoreML
- Conversión comparable: https://huggingface.co/FluidInference/parakeet-tdt-ctc-110m-coreml
- Repositorio GitHub: https://github.com/BuilderHelm/BuilderHelmAudio
- Perfil del autor: https://huggingface.co/BuilderHelm
- Producto ZenVoice: https://getzenvoice.com
- Descarga ZenVoice para Mac: https://getzenvoice.com/download
- Evaluación comparativa: `evaluation/THREE-WAY-COMPARISON.md` (en el repositorio del modelo)
- Benchmarks completos: `evaluation/ALL-BENCHMARKS.md` (en el repositorio del modelo)
