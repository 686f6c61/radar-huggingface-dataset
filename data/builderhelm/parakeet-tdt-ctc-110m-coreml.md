# BuilderHelm/Parakeet-TDT-CTC-110M-CoreML

## Resumen

Parakeet-TDT-CTC-110M-CoreML es una conversión a CoreML del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-ctc-110m`, publicada por BuilderHelm AI. El modelo original de NVIDIA es un sistema híbrido que combina un encoder FastConformer compartido con dos cabezas de decodificación: una cabeza TDT (Token-and-Duration Transducer) orientada a transcripción de alta calidad con marcas temporales por token, y una cabeza CTC que produce transcripciones greedy y log-probabilidades cada 80 ms, útil para detección de palabras clave y alineamiento. La conversión a CoreML permite ejecutar el modelo íntegramente en dispositivo (on-device) sobre Apple Silicon, aprovechando la Neural Engine y la CPU a través de Swift y Accelerate.

El interés de esta versión radica en su tamaño reducido (138 MB en total) y en su rendimiento sobre hardware de Apple: según el autor, alcanza 860× tiempo real en clips cortos y 791× en audio largo sobre un M5, con una latencia mediana de 13,1 ms por clip corto y un consumo de memoria pico de 210 MB. Frente a otras conversiones CoreML del mismo modelo base, como la de FluidInference, ofrece mayor precisión en clips cortos y devuelve simultáneamente las salidas TDT y CTC en una sola pasada del encoder.

El modelo está pensado para aplicaciones macOS e iOS que requieran transcripción local, sin conexión y con baja latencia, como dictado, subtitulado en tiempo real o detección de palabras clave. Su licencia CC-BY-4.0 permite uso comercial con atribución, y su integración se realiza mediante el paquete Swift BuilderHelmAudio o descargando directamente los artefactos CoreML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder FastConformer compartido + cabeza TDT (Transducer con predicción LSTM y joint) + cabeza CTC |
| Parametros totales | 110M (modelo base); pesos CoreML: encoder int8 112,7 MB + decoder TDT float32 19,1 MB + preprocesador 5,7 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; política de audio largo configurable en `config.json`) |
| Tipos de cuantizacion | int8 (encoder en Neural Engine) y float32 (decoder TDT en CPU); pesos CoreML `.mlpackage` |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CoreML (`.mlpackage`), `TdtDecoder.bin`, `vocab.json`, `config.json`; runtime Swift |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet de NVIDIA: un encoder FastConformer (variante eficiente de Conformer con atención subsampleada) que procesa el espectrograma log-mel de entrada y alimenta dos cabezas. La cabeza TDT es un Transducer con red de predicción LSTM y una red conjunta que predice tanto el token como su duración, lo que permite obtener marcas temporales por token y mejorar la calidad de transcripción. La cabeza CTC comparte el mismo encoder y produce log-probabilidades cada 80 ms, lo que facilita el alineamiento y la detección de palabras clave. En esta conversión, el encoder se ejecuta en int8 sobre la Neural Engine, mientras que el decoder TDT se ejecuta en float32 sobre CPU mediante Swift/Accelerate.

Los datos de entrenamiento del modelo original no se detallan en la información proporcionada, aunque la model card lista los datasets asociados: LibriSpeech, Fisher Corpus, Common Voice 8.0, National Singapore Corpus Part 1, VCTK, VoxPopuli, Europarl y Multilingual LibriSpeech. No se especifica el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal de esta versión es la conversión a CoreML con un encoder compartido que produce ambas salidas en una sola pasada, junto con una política de audio largo y contratos de E/S definidos en `config.json`.

## Capacidades

- Reconocimiento automático del habla en inglés con dos salidas simultáneas: transcripción TDT (con tiempos por token) y transcripción CTC (greedy con log-probabilidades cada 80 ms).
- Detección de palabras clave (keyword spotting) a partir de las log-probabilidades CTC; el autor reporta un 89,8% de recall en Earnings22 con una falsa alarma por clip.
- Alineamiento temporal mediante las marcas de tiempo del decoder TDT.
- Procesamiento de audio largo con una política configurable de ventanas y chunks.
- Ejecución on-device en Apple Silicon (Neural Engine + CPU), sin conexión a red.
- Integración en apps iOS/iPadOS/macOS mediante el paquete Swift BuilderHelmAudio.
- No soporta tool calling, function calling, agentes, visión, audio de entrada distinto de voz ni modos de razonamiento; es un modelo exclusivamente ASR.

## Casos de uso

- Dictado por voz en aplicaciones macOS e iOS: el modelo transcribe en local con una latencia mediana de 13,1 ms por clip corto, lo que permite retroalimentación en tiempo casi real sin enviar audio a la nube.
- Subtitulado y transcripción de reuniones: gracias al procesamiento de audio largo (791× tiempo real y 2,22% WER en audio largo según el autor), puede transcribir grabaciones de decenas de minutos en segundos sobre un Mac con Apple Silicon.
- Detección de palabras clave en asistentes de voz: las log-probabilidades CTC cada 80 ms y el 89,8% de recall en Earnings22 lo hacen adecuado para activar comandos o alertas sin transcribir todo el audio.
- Indexación y búsqueda de archivos de audio: la transcripción con marcas temporales TDT permite generar índices alineados con el audio para búsqueda posterior en bibliotecas de podcasts o grabaciones.
- Accesibilidad: subtitulado en vivo de conversaciones o contenido multimedia en dispositivos Apple, con ejecución local que preserva la privacidad del audio.
- Aplicaciones de notas de voz: transcripción automática de memorandos y mensajes de voz dentro de apps iOS, usando BuilderHelmAudio para descargar y verificar el modelo en el dispositivo.
- Procesamiento por lotes en estaciones de trabajo Mac: transcripción masiva de clips (262 clips de Common Voice a 860× tiempo real) para pipelines de datos o evaluación de calidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Dataset | Metrica | TDT | CTC |
|---|---|---|---|
| LibriSpeech clean (test) | WER | 2,46% | 2,97% |
| LibriSpeech other (test) | WER | 5,27% | 5,88% |
| Earnings22 contextual subset (772 clips) | WER | 16,18% | 17,62% |

Rendimiento en Apple M5, macOS 27.2 (mediana de 3 ejecuciones, según el autor):

| Metrica | Valor |
|---|---|
| WER Common Voice / audio largo (TDT) | 7,59% / 2,22% |
| Keyword recall (Earnings22, 1 falsa alarma por clip) | 89,8% |
| RTFx clips cortos / audio largo (TDT + CTC) | 860× / 791× tiempo real |
| Latencia por clip corto (mediana / p95) | 13,1 / 32,1 ms |
| Memoria pico clips cortos / audio largo | 210 / 120 MB |

Comparativa con FluidInference/parakeet-tdt-ctc-110m-coreml en el mismo Mac (según el autor):

| Carga | Este modelo | FluidInference TDT |
|---|---|---|
| Clips cortos (262 Common Voice) | 860× · 7,59% | 437× · 8,21% |
| Latencia mediana / p95 | 13,1 / 32,1 ms | 19,8 / 81,8 ms |
| Audio largo (20 archivos, 79 min) | 791× · 2,22% | 1.120× · 2,39% |

## Requisitos de hardware

- Hardware: Apple Silicon (probado en M5 y iPhone 13); requiere macOS 15+ o iOS 18+.
- VRAM/RAM: memoria pico de 210 MB en clips cortos y 120 MB en audio largo, según el autor.
- GPU: no usa GPU dedicada; emplea la Neural Engine para el encoder int8 y la CPU (Swift/Accelerate) para el decoder TDT float32.
- Cabe en dispositivos consumer Apple: sí, en Mac con Apple Silicon y en iPhone/iPad compatibles (iOS 18+).
- Despliegue: CoreML mediante el paquete Swift BuilderHelmAudio; descarga con Hugging Face CLI o archivo portable de 124 MB. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 13,1 ms de mediana por clip corto, 860× tiempo real en clips cortos y 791× en audio largo (datos del autor en M5).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER LibriSpeech clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BuilderHelm/Parakeet-TDT-CTC-110M-CoreML | 110M | Audio largo configurable | 2,46% (TDT) | CC-BY-4.0 | CoreML, Hugging Face |
| FluidInference/parakeet-tdt-ctc-110m-coreml | 110M (mismo base) | Audio largo | No disponible en la información | no disponible | CoreML, Hugging Face |
| BuilderHelm/Parakeet-CTC-110M-CoreML | 110M (mismo encoder, sin TDT) | no disponible | no disponible | no disponible | CoreML, Hugging Face |
| nvidia/parakeet-tdt-ctc-110m (base) | 110M | no disponible | no disponible | no disponible | NeMo, Hugging Face |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse con cautela.
- Dependencia de hardware Apple: requiere Apple Silicon, macOS 15+ o iOS 18+, y el toolchain Swift 6 (Xcode 16+); no es portable a otras plataformas sin reconversión.
- El WER en dominios difíciles es elevado: 16,18% (TDT) en Earnings22, lo que limita su uso en audio con jerga, ruido o acentos no representados.
- Riesgo de errores de transcripción y de detección de palabras clave (falsas alarmas y omisiones), inherente a los sistemas ASR.
- No se detallan sesgos demográficos ni de acento en la información proporcionada; la evaluación se limita a los datasets listados.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario cumplir los términos de atribución y no se ofrecen garantías.
- No mezclar archivos de la versión 1.0.0 con el runtime 1.1.0, según advierte el autor.
- No dispone de tool calling, agentes ni razonamiento; su uso está acotado a ASR, alineamiento y keyword spotting.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Parakeet-TDT-CTC-110M-CoreML
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-ctc-110m
- Variante solo CTC: https://huggingface.co/BuilderHelm/Parakeet-CTC-110M-CoreML
- Conversión CoreML alternativa: https://huggingface.co/FluidInference/parakeet-tdt-ctc-110m-coreml
- Paquete Swift BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- Comparativa de evaluación: https://huggingface.co/BuilderHelm/Parakeet-TDT-CTC-110M-CoreML/blob/main/evaluation/THREE-WAY-COMPARISON.md
- Benchmarks completos: https://huggingface.co/BuilderHelm/Parakeet-TDT-CTC-110M-CoreML/blob/main/evaluation/ALL-BENCHMARKS.md
- Archivo portable v1.1.0: https://huggingface.co/BuilderHelm/Parakeet-TDT-CTC-110M-CoreML/resolve/v1.1.0/releases/parakeet-tdt-ctc-110m-coreml-v1.1.0-portable.zip
