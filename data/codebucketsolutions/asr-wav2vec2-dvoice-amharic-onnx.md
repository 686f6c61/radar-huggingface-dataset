# codebucketsolutions/asr-wav2vec2-dvoice-amharic-onnx

## Resumen

`codebucketsolutions/asr-wav2vec2-dvoice-amharic-onnx` es una exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `speechbrain/asr-wav2vec2-dvoice-amharic`, desarrollado originalmente por el equipo de SpeechBrain. El modelo realiza transcripción de audio en amhárico mediante una arquitectura wav2vec 2.0 (XLSR-53) afinada con CTC. Esta versión, publicada por codebucketsolutions, elimina la dependencia de PyTorch para permitir su despliegue en entornos de inferencia basados exclusivamente en ONNX Runtime, concretamente en el servidor de voz `bolo`.

El interés de esta ficha radica en que ofrece una alternativa ligera y portable para integrar ASR en amhárico en producción sin necesidad de instalar el stack completo de PyTorch. El repositorio ocupa 1,3 GB e incluye el grafo ONNX en float32 (opset 17), el vocabulario SentencePiece y un fichero de metadatos con los hashes SHA-256 de los checkpoints originales y del grafo exportado. La licencia es Apache-2.0, heredada del modelo base.

El modelo está entrenado sobre el corpus ALFFA Amhárico empaquetado por DVoice 2.0 y reporta un WER del 24,92 % y un CER del 6,57 % sobre el conjunto de test de DVoice 2.0 en amhárico. No es una release oficial de SpeechBrain y el autor lo indica explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (XLSR-53) fine-tuned + DNN de 3 capas + capa CTC + log-softmax, exportado a ONNX |
| Parametros totales | no disponible (el modelo base XLSR-53 ronda los 300 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio variable, mono, 16 kHz; salida de una trama cada 20 ms) |
| Tipos de cuantizacion | float32 (unico formato publicado; no se ofrece int8 ni otras variantes) |
| Idiomas soportados | amhárico (am) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), float32; vocabulario en `tokens.txt` (SentencePiece) |

## Arquitectura y entrenamiento

El grafo exportado reproduce el `EncoderASR` de SpeechBrain: un encoder wav2vec 2.0 basado en la arquitectura XLSR-53 (multilingüe preentrenada y posteriormente afinada para amhárico), seguido de una DNN de tres capas, una capa CTC y una log-softmax final. La entrada es un tensor float32 de forma `[1, T]` con audio mono a 16 kHz; la salida es `[1, frames, tokens]` con una trama cada 20 ms. La normalización `layer_norm` que SpeechBrain aplica sobre la forma de la entrada se ha reimplementado en el grafo mediante medias y varianzas para que la longitud de secuencia quede libre. La decodificación es greedy CTC con blank 0, uniendo las piezas SentencePiece donde `▁` marca inicio de palabra.

El entrenamiento original lo realizó el equipo de SpeechBrain sobre el corpus ALFFA Amhárico tal como lo empaqueta DVoice 2.0. No se dispone en la información proporcionada de detalles sobre número de tokens de audio, composición exacta del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR). La exportación a ONNX no modifica los pesos: el autor declara que son idénticos a los del modelo base en la revisión `43b11f9bdd0eca55642540504dc84c0571edf37f`. Se incluye un script de exportación (`export_speechbrain_onnx.py`) y un fichero `parity.json` con las comprobaciones de equivalencia frente a PyTorch 2.15.0+cpu y SpeechBrain 1.1.2.

## Capacidades

- Reconocimiento automático del habla en amhárico a partir de audio mono a 16 kHz.
- Salida a nivel de trama cada 20 ms con probabilidades logarítmicas por token, lo que permite decodificación greedy o integración con decodificadores externos.
- Transcripción de palabras mediante piezas SentencePiece con marcador `▁` para inicio de palabra.
- Inferencia sin PyTorch, únicamente con ONNX Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión, audio de salida ni otras modalidades.
- Capacidad multilingüe limitada al amhárico en esta versión afinada.

## Casos de uso

- Subtitulado y transcripción de audio en amhárico: el modelo convierte ficheros de audio de 16 kHz en texto plano, adecuado para generar subtítulos o actas de reuniones en este idioma.
- Integración en servidores de voz autoalojados: al ser un grafo ONNX sin dependencia de PyTorch, encaja en servicios como `bolo` que ya operan con ONNX Runtime y necesitan ASR en amhárico.
- Procesamiento por lotes de archivos de audio: la forma de entrada `[1, T]` admite secuencias de longitud variable, lo que facilita el procesamiento de grabaciones de distinta duración en pipelines offline.
- Búsqueda y indexación de contenido hablado: la transcripción generada permite indexar archivos de audio amháricos y habilitar búsqueda por texto sobre ellos.
- Investigación lingüística y de ASR de bajos recursos: sirve como línea base reproducible para experimentos con amhárico, con paridad verificada frente a la implementación PyTorch original.
- Prototipado en entornos sin GPU ni stack de deep learning completo: al ejecutarse con ONNX Runtime en CPU, permite desplegar ASR en máquinas modestas o contenedores ligeros.

## Benchmarks y rendimiento

El autor del modelo base reporta las siguientes métricas sobre el conjunto de test de DVoice 2.0 en amhárico:

| Metrica | Valor |
|---|---|
| WER | 24,92 % |
| CER | 6,57 % |

Además, la model card incluye una comprobación de paridad entre el grafo ONNX y la implementación PyTorch original sobre el clip de ejemplo `example_amharic.wav` (6,14 s):

| Clip | Diferencia maxima absoluta en log-probs | Misma ruta optima | Mismo texto | Transcripcion ONNX |
|---|---|---|---|---|
| example_amharic.wav (6,14 s) | 1,13e-03 | si | si | ተጋጣሚ ያችን ቡና በ አገር ውስጥ እና በ ኢንተርናሽናል ውድድር ጥሩ ስ ም እንዳለው እናውቃለን |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo ASR y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,3 GB en float32 y el grafo ONNX se ejecuta en CPU, por lo que no requiere GPU.
- GPU recomendadas: no se especifican; el autor valida la ejecución en CPU con ONNX Runtime 1.32.0.
- Cabe en GPU de consumo: sí, dado que el modelo es de tamaño moderado y se ejecuta en CPU; cualquier GPU consumer con soporte ONNX Runtime podría alojarlo, aunque no se aportan cifras.
- Opciones de despliegue: ONNX Runtime (validado por el autor); el servidor `bolo` es el entorno de referencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codebucketsolutions/asr-wav2vec2-dvoice-amharic-onnx | no disponible | audio 16 kHz, longitud variable | WER 24,92 %, CER 6,57 % (test DVoice 2.0) | Apache-2.0 | ONNX, Hugging Face |
| speechbrain/asr-wav2vec2-dvoice-amharic | no disponible | audio 16 kHz, longitud variable | WER 24,92 %, CER 6,57 % (mismo modelo base) | Apache-2.0 | PyTorch/SpeechBrain, Hugging Face |
| Otros ASR para amhárico (p. ej. variantes wav2vec 2.0 o Whisper afinadas) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base de SpeechBrain, del que esta versión es una exportación con pesos idénticos y paridad verificada. No se dispone de datos de otros modelos ASR en amhárico en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo transcribe amhárico; no admite otros idiomas ni cambio de idioma dinámico.
- El WER del 24,92 % es relativamente alto, por lo que la transcripción puede contener errores frecuentes en condiciones de audio ruidoso o acentos no representados en el corpus.
- Riesgo de alucinación en ASR: en segmentos sin habla o con ruido, la decodificación greedy puede producir texto espurio.
- La licencia Apache-2.0 permite uso comercial, pero el autor indica que no es una release oficial de SpeechBrain; conviene citar SpeechBrain y el paper del modelo original según pide la model card.
- La única precisión publicada es float32; no hay versiones cuantizadas a int8 que reduzcan el tamaño o aceleren la inferencia.
- El modelo está pensado para audio mono a 16 kHz; otras frecuencias de muestreo requieren remuestreo previo.
- No se ofrecen métricas de latencia ni throughput, lo que dificulta planificar dimensionamiento en producción sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional más allá de la paridad declarada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/asr-wav2vec2-dvoice-amharic-onnx
- Modelo base: https://huggingface.co/speechbrain/asr-wav2vec2-dvoice-amharic
- Repositorio del servidor de voz bolo: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- Paper de SpeechBrain: no disponible en la información proporcionada (la model card remite al paper citado por el modelo original)
