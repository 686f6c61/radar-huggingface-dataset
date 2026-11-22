# litert-community/parakeet-redux

## Resumen

parakeet-redux es un modelo de reconocimiento automático del habla (ASR) en 25 idiomas europeos, empaquetado en formato LiteRT (TFLite) para su ejecución en dispositivos Android con aceleración por NPU, GPU o CPU. Deriva del modelo original [moondream/parakeet-redux](https://huggingface.co/moondream/parakeet-redux), que a su vez es una variante de NVIDIA [parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) con un codificador ternario, convertido a LiteRT mediante litert-torch 0.9.4 y ai-edge-quantizer 0.10.0.

El modelo resuelve el problema de la transcripción de voz en tiempo real directamente en el terminal, sin depender de la nube. En un Galaxy S26 transcribe 99 veces más rápido que el tiempo real en NPU, 52 veces en GPU y 29 veces en CPU, con una tasa de error de palabras (WER) del 1,977 % en NPU sobre todo LibriSpeech test-clean, frente al 1,968 % de la ejecución float32 en PyTorch.

La relevancia actual reside en que demuestra que un ASR de calidad cercana al estado del arte puede ejecutarse íntegramente en un teléfono móvil con cuantización agresiva (pesos ternarios a 4 bits) y sin pérdida medible de precisión, lo que habilita aplicaciones de dictado, subtitulado y asistentes de voz offline con privacidad total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con codificador ternario; encoder + prediction network + joint network |
| Parametros totales | no disponible (el modelo base es parakeet-tdt-0.6b-v3, ~0,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (479.840 muestras a 16 kHz); ventanas de 10 s y 20 s disponibles como buckets |
| Tipos de cuantizacion | encoder i4 (4 bits ternario: −1, 0, +1 con una escala por cada 128 pesos), encoder f16 (float16), decoder int8 |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | TFLite (.tflite); tokenizer.json en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo es un TDT (Token-and-Duration Transducer), una variante de arquitectura transducer que predice conjuntamente tokens y duraciones de frame, lo que permite decodificación no autorregresiva por frames y reduce la latencia. Consta de tres componentes: un codificador que transforma las características mel en representaciones de 640 dimensiones, una red de predicción (`predict`) que mantiene estado recurrente (h, c de 640 dimensiones) y una red conjunta (`joint`) que combina la salida del codificador con la del predictor para producir 8.198 logits (8.193 tokens + 5 duraciones de 0 a 4 frames).

La innovación principal es la cuantización ternaria del codificador: 240 de las 264 capas lineales se representan como enteros de 4 bits con valores −1, 0 o +1 y una escala por cada 128 pesos, mientras que las 24 proyecciones de posición relativa se pliegan en constantes float32 junto con la tabla de posiciones. El resto de capas permanece en float32. La versión f16 usa pesos float16 en capas lineales y convolucionales, con entradas de LayerNorm reescaladas para evitar desbordamiento en aritmética float16. No se dispone de información sobre el dataset de entrenamiento, número de tokens o si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos (incluido español) con una sola pasada.
- Procesamiento de audio en ventanas de hasta 30 segundos, con buckets de 10 s y 20 s para optimizar el cómputo en audios cortos.
- Decodificación greedy TDT en el host con el decoder int8, que gestiona tokens y duraciones de frame.
- Ejecución en NPU, GPU y CPU de dispositivos Android mediante LiteRT 2.3.0.
- Front-end mel integrado (pre-énfasis, STFT de 512 puntos, ventana Hann de 400 muestras, hop de 160, 128 bins mel Slaney, normalización por ventana).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de cabeza de actividad de voz (VAD) convertida; el corte de audio largo se hace a puntos fijos de 30 s.

## Casos de uso

- Dictado por voz offline en aplicaciones Android: el modelo transcribe en el dispositivo sin conexión, con 99× de velocidad en NPU, adecuado para apps de notas que requieren privacidad y baja latencia.
- Subtitulado automático de reuniones y clases: procesando el audio en ventanas de 30 s y uniendo los textos con un espacio, se puede generar un transcript continuo en 25 idiomas.
- Asistentes de voz integrados en el terminal: la transcripción local evita enviar audio a servidores, cumpliendo requisitos de privacidad y reduciendo coste de infraestructura.
- Transcripción de llamadas de atención al cliente: el modelo maneja audio de 16 kHz mono y puede integrarse en pipelines de post-procesado para generar actas o análisis de sentimiento.
- Accesibilidad para personas con discapacidad auditiva: subtitulado en tiempo real de conversaciones presenciales en el móvil, con latencia baja gracias a la decodificación TDT.
- Procesamiento por lotes de archivos de audio en servidores Android o edge: el runner de línea de comandos (`redux_asr_runner_b.cc`) permite transcribir carpetas completas con índice TSV.
- Investigación en ASR multilingüe de bajo consumo: sirve como referencia de cuantización ternaria y despliegue LiteRT para comparar WER y throughput en hardware móvil.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| WER LibriSpeech test-clean (NPU) | 1,977 % | 655 utterances, LiteRT 2.3.0, Galaxy S26 |
| WER LibriSpeech test-clean (PyTorch float32) | 1,968 % | misma ventana, referencia |
| Velocidad NPU | 99× tiempo real | Galaxy S26, NPU |
| Velocidad GPU | 52× tiempo real | Galaxy S26, GPU |
| Velocidad CPU | 29× tiempo real | Galaxy S26, CPU |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada: el set i4 para CPU ocupa 1,14 GB (encoder + mel + decoder); el set f16 para GPU/NPU ocupa 3,68 GB. Los encoders individuales van de 345 MB (10 s i4) a 1,24 GB (30 s f16).
- GPU recomendadas: no aplica a GPU de escritorio; el modelo está optimizado para NPU/GPU móviles (Galaxy S26 como referencia). En Android, se usa el backend NPU o GPU según el set f16.
- Cabe en GPU consumer: no está pensado para GPUs de escritorio; el despliegue objetivo es Android con LiteRT. No se dispone de datos para RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT 2.3.0 con API C (`redux_asr_runner_b.cc`), build script `build_android.sh`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TFLite ASR).
- Latencia y throughput: 99× tiempo real en NPU, 52× en GPU, 29× en CPU en Galaxy S26; la decodificación se ejecuta en el host con el decoder int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| litert-community/parakeet-redux | ~0,6 B (base) | ventanas de 30 s | 25 | CC-BY-4.0 | TFLite |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible | no disponible | no disponible | no disponible |
| moondream/parakeet-redux | no disponible | no disponible | 25 | CC-BY-4.0 | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada; la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El modelo corta el audio en ventanas fijas de 30 s sin VAD, por lo que una palabra que cruce un corte puede dividirse o perderse.
- Las ventanas de menos de 320 muestras (dos frames mel) se descartan y no generan texto.
- El token id 3 (`<|endoftext|>`) no está marcado como especial en `tokenizer.json`; una ventana que termine en él imprimiría el token literal (no ocurrió en las pruebas del autor).
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones por idioma más allá de la lista de 25 idiomas.
- La licencia CC-BY-4.0 permite uso comercial con atribución; no se indican restricciones adicionales.
- El modelo solo realiza ASR; no soporta razonamiento, código, visión ni agentes.
- El rendimiento medido corresponde a LiteRT 2.3.0 y a un Galaxy S26; no es extrapolable a otras conversiones ni a LiteRT-LM.

## Enlaces

- [Hugging Face: litert-community/parakeet-redux](https://huggingface.co/litert-community/parakeet-redux)
- [Modelo base: moondream/parakeet-redux](https://huggingface.co/moondream/parakeet-redux)
- [Modelo original: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
