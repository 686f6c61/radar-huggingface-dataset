# mrsoundmind/granite-speech-5.0-470m-turboctc-gguf

## Resumen

Granite Speech 5.0 470M TurboCTC es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por IBM, publicado el 25 de agosto de 2026 bajo licencia Apache 2.0. Con 473.014.752 parámetros, está diseñado para despliegue en dispositivos de borde (portátiles, smartphones) gracias a su bajo coste computacional y su decodificación no autorregresiva.

La ficha que nos ocupa no documenta el modelo original, sino una conversión a formato GGUF realizada por el usuario `mrsoundmind` para su uso con la librería `transcribe.cpp`. Se ofrecen seis cuantizaciones (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con tamaños que van de 948 MB a 279 MB, manteniendo un WER en LibriSpeech test-clean entre el 1,33 % y el 1,35 %.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR de IBM en CPU y GPU de consumo mediante una herramienta nativa en C++, sin depender de PyTorch ni de transformers. El modelo es offline, no streaming, solo inglés y sin marcas de tiempo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer con block self-attention, self-conditioning y downsampling temporal; cabeza CTC |
| Parámetros totales | 473.014.752 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono WAV) |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un Conformer compacto de 470 M de parámetros con block self-attention, self-conditioning y downsampling temporal. La capa de salida corresponde a 16.384 unidades BPE. Se entrenó con aproximadamente 60.000 horas de audio en inglés procedente de corpus públicos, utilizando Connectionist Temporal Classification (CTC) como función de pérdida. La inferencia es no autorregresiva mediante decodificación greedy, lo que explica su baja latencia.

La conversión a GGUF la realizó `mrsoundmind` a partir del commit `18ca3c1` del repositorio de IBM (fijado el 2026-09-12) y se validó contra la referencia de transformers en el commit `b9427cf` de transcribe.cpp. No se documentan innovaciones adicionales más allá del esquema CTC con self-conditioning propio del modelo original.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV mono a 16 kHz.
- Decodificación CTC greedy no autorregresiva, sin modelo de lenguaje externo.
- Inferencia offline (no streaming).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni capacidades de agente.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa archivos WAV de 16 kHz mono y devuelve el texto con un WER del 1,33 % en LibriSpeech test-clean, adecuado para actas internas en inglés.
- Subtitulado de vídeo en inglés: integrado en un pipeline ffmpeg + transcribe-cli, permite generar subtítulos en lotes sobre CPU sin GPU dedicada.
- Despliegue en dispositivos de borde: con cuantización Q4_K_M (279 MB) cabe en portátiles y dispositivos con poca memoria, manteniendo un WER del 1,35 %.
- Dictado en aplicaciones de escritorio: la decodificación no autorregresiva reduce la latencia y permite transcripciones interactivas en inglés sobre CPU.
- Preprocesado de datos para entrenamiento de modelos de lenguaje: transcripción masiva de corpus de audio en inglés con coste computacional bajo.
- Transcripción en entornos sin conectividad: al ser offline y no streaming, se puede ejecutar localmente en portátiles con Metal (macOS) o Vulkan (Linux/Windows).
- Validación de calidad de audio: uso del WER como métrica para evaluar pipelines de captura y limpieza de audio en inglés.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,34 | 1,33 | 1,33 | 1,33 | 1,34 | 1,35 |
| WER FLEURS en (%) | no disponible | no disponible | 4,61 | no disponible | no disponible | no disponible |

| Plataforma | RTF CPU | RTF GPU/acelerador |
|---|---:|---:|
| Apple M4 Max | 46,07 | 355,75 (Metal) |
| AMD Ryzen 7 4750U | 17,24 | 22,87 (Vulkan) |

El WER de referencia del modelo original medido con transformers 5.17.0 en F32 sobre CPU es del 1,33 % (IC 95 % [1,20; 1,47]). Las mediciones de LibriSpeech test-clean se realizaron sobre las 2.620 utterances completas, batch size 8, sin marcas de tiempo, con hint de idioma `en` y decodificación en CUDA, en transcribe.cpp commit `9daf396`. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de archivo, Q4_K_M requiere al menos ~300 MB de memoria y BF16/F16 ~1 GB.
- GPU recomendadas: no se especifican modelos concretos; se documentan pruebas en Apple M4 Max (Metal) y AMD Ryzen 7 4750U (Vulkan).
- Cabe en GPU de consumo: sí, por el reducido tamaño de las cuantizaciones (279-948 MB).
- Opciones de despliegue: transcribe.cpp (compilación con CMake); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 46,07 en CPU M4 Max y 355,75 con Metal; 17,24 en CPU Ryzen 7 4750U y 22,87 con Vulkan. No se documentan valores de latencia absoluta ni throughput en muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| granite-speech-5.0-470m-turboctc (GGUF, esta ficha) | 473 M | no disponible | 1,33-1,35 % | Apache 2.0 | Hugging Face (GGUF) |
| granite-speech-5.0-470m-turboctc (original) | 470 M | no disponible | 1,33 % (F32) | Apache 2.0 | Hugging Face (transformers) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre otros modelos ASR comparables (Whisper, Wav2Vec 2.0, etc.) que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo admite inglés; no soporta otros idiomas ni detección de idioma.
- No es streaming: requiere el archivo de audio completo en formato WAV mono a 16 kHz.
- No genera marcas de tiempo ni traducción.
- No incluye modelo de lenguaje externo; la decodificación greedy CTC puede producir errores en audio ruidoso o con acentos no representados en el corpus de entrenamiento.
- Riesgo de alucinación y de transcripciones incorrectas en segmentos con ruido, solapamiento de hablantes o vocabulario técnico poco frecuente.
- No se documentan sesgos específicos del modelo base en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card original de IBM para términos completos.
- La conversión GGUF está validada únicamente contra transcribe.cpp en commits concretos; cambios de versión pueden alterar la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrsoundmind/granite-speech-5.0-470m-turboctc-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Commit del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/commit/18ca3c1
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Open ASR leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FFASR leaderboard: https://huggingface.co/spaces/treble-technologies/ffasr
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
