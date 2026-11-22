# Phoonnx/vits-en_us-joe-medium-espeak-v2

## Resumen

vits-en_us-joe-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) en inglés estadounidense, distribuida en formato ONNX para su uso con la librería phoonnx. No se trata de un modelo de lenguaje generativo, sino de un modelo acústico VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) procedente del proyecto Piper. Rhasspy entrenó la voz original y TigreGotico Lda realizó la conversión a ONNX, publicándola bajo licencia CC0 1.0.

El modelo resuelve la generación de audio hablado a partir de fonemas IPA obtenidos mediante espeak-ng (voz en-us), con una frecuencia de muestreo de 22050 Hz y un único hablante. Esta versión v2 sustituye a la anterior (Phoonnx/vits-en_us-joe-medium-espeak) porque el upstream reentrenó la voz sobre los modelos base de Piper 1.5, por lo que los pesos son distintos y requieren Piper 1.5 o superior.

Su relevancia radica en que es un componente ligero (63,2 MB en fp32, 18,7 MB en int8) y de bajas necesidades de recursos (RTF de 0,038 en fp32 con 4 hilos sobre un Intel i9-11900H), pensado para integrarse en asistentes de voz locales como OVOS o en pipelines de TTS de baja latencia, sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de fonemas sin ventana declarada) |
| Tipos de cuantizacion | fp32 e int8 (QInt8, quantize_dynamic de onnxruntime 1.32.0) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (grafos `<graph>.onnx` y `<graph>_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema TTS end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder generativo y un discriminador adversarial durante el entrenamiento. En esta distribución concreta se sirve como grafo ONNX para inferencia con phoonnx. La entrada de texto se convierte previamente a fonemas IPA con espeak-ng (voz en-us); el modelo está entrenado con puntuación de cláusula (`, . ! ? : ;`), que phoonnx 1.96.1a1 y posteriores conservan en la síntesis. La salida es audio mono a 22050 Hz con un único hablante.

Según la model card, el upstream parte de la voz `en_US/joe/medium` de rhasspy/piper-voices, reentrenada sobre los modelos base de Piper 1.5. El entrenamiento se realizó mediante fine-tuning desde el modelo base `rdh` (calidad medium, un hablante flamenco de nl_BE, CC0) con MRD y SDP. Los datos de entrenamiento no están registrados en el upstream (la card original apunta a https://github.com/OHF-Voice/voice-datasets con licencia CC0). Los ajustes de inferencia por defecto son noise_scale 0.5 y noise_w 0.333, y se requiere Piper 1.5 o superior. No se documenta uso de RLHF ni DPO, al no ser un modelo de lenguaje.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto, con conversión fonética vía espeak-ng (IPA).
- Soporte de puntuación de cláusula (`, . ! ? : ;`) para modelar pausas y entonación.
- Salida de audio WAV mono a 22050 Hz mediante `voice.synthesize_wav`.
- Inferencia en fp32 e int8, con paridad de calidad verificada por ASR (WER 0.000 en fp32 y 0.034 en int8).
- Integración como plugin TTS de OVOS (`ovos-tts-plugin-phoonnx`) y uso directo con la librería phoonnx.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz locales: integrar la voz en OVOS seleccionando `piper/en_US-joe-medium-v2` en `mycroft.conf`, con síntesis en el propio dispositivo y sin llamadas a la nube.
- Lectura de notificaciones y alertas en sistemas embebidos: el grafo int8 de 18,7 MB y un pico de RSS de 212,8 MB permiten ejecutarlo en dispositivos con recursos limitados.
- Generación de audiolibros o contenido narrado por lotes: el RTF de 0,038 en fp32 (4 hilos) permite sintetizar audio mucho más rápido que tiempo real en CPU.
- Pruebas de accesibilidad: convertir texto de interfaces o documentos a voz para usuarios con discapacidad visual en aplicaciones de escritorio.
- Doctesting y QA de pipelines TTS: la verificación por ASR (WER 0.000 en fp32) lo hace adecuado como referencia para validar cadenas de fonemización y síntesis.
- Prototipado de productos de voz: al ser CC0 y de pequeño tamaño, sirve para validar flujos de TTS antes de invertir en voces comerciales o modelos mayores.
- Generación de prompts de audio para entrenamiento de otros sistemas: producir muestras de voz sintética controladas en inglés estadounidense.

## Benchmarks y rendimiento

Los datos disponibles son de control de calidad (QA) con ASR nemo-parakeet-tdt-0.6b-v3 int8 sobre 3 frases de FLORES-200 devtest, medidos en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0.000 | 0.034 |
| Caracteres por segundo | 15,3 a 16,8 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,98 a 1,01 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 252,7 MB | 212,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,038 | 0,098 |

No se han publicado resultados de benchmarks estándar de TTS (MOS, CMOS) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU (ONNX Runtime). Pico de memoria residente de 252,7 MB en fp32 y 212,8 MB en int8.
- GPU recomendadas: no disponibles ni necesarias; el modelo está pensado para CPU.
- Cabe en cualquier equipo consumer: el grafo int8 ocupa 18,7 MB y el fp32 63,2 MB.
- Despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el port espyak (`pip install --pre "phoonnx[espeak]"`); plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un LLM.
- Latencia y throughput: RTF de 0,038 (fp32) y 0,098 (int8) con 4 hilos en i9-11900H; es decir, entre 10 y 26 veces más rápido que tiempo real según cuantización.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Muestreo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-joe-medium-espeak-v2 | VITS (Piper) | en-US | 22050 Hz | CC0 1.0 | ONNX | Esta ficha; conversión de la voz Joe medium v2 |
| Phoonnx/vits-en_us-joe-medium-espeak | VITS (Piper) | en-US | 22050 Hz | CC0 1.0 | ONNX | Versión anterior con pesos previos a Piper 1.5 |
| rhasspy/piper-voices (en_US/joe/medium) | VITS (Piper) | en-US | 22050 Hz | CC0 1.0 | Piper/ONNX | Modelo upstream original |
| Otras voces Piper medium (p. ej. en_US menos comunes) | VITS (Piper) | en-US | 22050 Hz | CC0 1.0 | Piper/ONNX | Misma familia y calidad; no se dispone de métricas comparativas publicadas |

No se dispone de comparaciones de calidad subjetiva (MOS) con modelos como Tacotron 2, FastSpeech 2 o voces comerciales en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés estadounidense; no soporta otros idiomas ni cambio de hablante (un único speaker).
- Depende de espeak-ng para la fonemización; con el port espyak algunos fonemas difieren y ciertas palabras pueden pronunciarse mal.
- Requiere Piper 1.5 o superior; los pesos no son compatibles con versiones anteriores.
- La calidad se ha validado con solo 3 frases de FLORES-200 devtest mediante ASR; la cobertura de evaluación es limitada.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, números y palabras fuera del vocabulario fonético de espeak-ng.
- La cuantización int8 introduce un WER de 0.034 frente a 0.000 en fp32; para máxima fidelidad conviene usar fp32.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy según indica la model card.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; cualquier expectativa de ese tipo es un error de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-joe-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_US/joe/medium
- Versión anterior: https://huggingface.co/Phoonnx/vits-en_us-joe-medium-espeak
- phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz upstream: https://github.com/OHF-Voice/voice-datasets
