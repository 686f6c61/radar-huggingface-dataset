# hongyue0721/banju-sensevoice-shandong-int8

## Resumen

banju-sensevoice-shandong-int8 es un modelo de reconocimiento automatico del habla (ASR) especializado en dialecto de Shandong, derivado mediante fine-tuning de FunAudioLLM/SenseVoiceSmall y exportado en formato ONNX con cuantizacion dinamica QUInt8 para inferencia en CPU sin GPU. Lo desarrolla el usuario hongyue0721 como componente de voz del asistente de acompanamiento domiciliario para personas mayores "Banju" (伴居), y su objetivo es mejorar la transcripcion de habla coloquial de personas mayores en dialecto de Shandong, un escenario donde el SenseVoice original obtiene errores muy elevados.

El modelo parte de la arquitectura SenseVoice-Small (transformer no autorregresivo con encoder SAN-M y decodificacion CTC-like), mantiene el tokenizador original (315.894 bytes de tokens.txt) y se distribuye como un unico fichero `model.int8.onnx` de 239.234.076 bytes (0,2 GB de repositorio). El checkpoint publicado corresponde a la version `v2-ep4`, cuantizada desde el checkpoint de la cuarta epoca de la segunda ronda de fine-tuning.

Su relevancia es practica: demuestra que un ajuste fino con corpus dialectal real, aumentacion acustica y una mezcla anti-olvido puede reducir el CER en dialecto de Shandong aproximadamente un 11,5% relativo frente al SenseVoice-Small int8 original, manteniendo degradacion minima en mandarin estandar y siendo desplegable en CPU de consumo con RTF en torno a 0,02-0,03.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoice-Small (transformer encoder SAN-M, reconocimiento no autorregresivo), exportado a ONNX |
| Parametros totales | no disponible (pesos int8 de 239.234.076 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QUInt8 dinamica (MatMul), exportada con opset_version=13 y dynamo desactivado |
| Idiomas soportados | zh (mandarin y dialectos: Shandong, Ji-Lu, Jiao-Liao, Zhongyuan) |
| Licencia | other / model-license (heredada de FunASR MODEL_LICENSE) |
| Formato de pesos | ONNX (`model.int8.onnx`), mas `tokens.txt` y `config.yaml` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SenseVoice-Small: un encoder transformer con atencion SAN-M y cabecera de reconocimiento no autorregresiva, lo que permite transcribir audio completo en una sola pasada y explica su bajo coste computacional. El fine-tuning se realizo en FP32 sobre una GPU L4 (`use_fp16=false`, para evitar desbordamiento de `loss_rich`), con `lr=5e-5`, `warmup_steps=200`, `batch_size=2400`, `accum_grad=2` y `early_stopping_patience=4`. La exportacion se hizo a ONNX con cuantizacion dinamica QUInt8 de las operaciones MatMul.

El conjunto de entrenamiento suma 18.070 utterances: 1.175 fragmentos independientes (4.790,5 s, unos 79,8 minutos) procedentes de 36 videos reales de Shandong filtrados con OCR y control cruzado en GPU, sobremuestreados x2 y expandidos con cinco tipos de aumentacion acustica de sala (ruido a 12 dB y 20 dB, velocidades 0,88x y 1,08x, y reverberacion) hasta 8.225 fragmentos; mas 6.345 utterances de KeSpeech (Ji-Lu, Jiao-Liao, Zhongyuan) y 3.500 de mandarin estandar para mitigar el olvido catastrofico. La validacion (354 utterances) y el test estan aislados por video y por hablante, de modo que ninguna grabacion de test aparece en entrenamiento ni validacion.

## Capacidades

- Transcripcion de voz a texto en mandarin y dialectos del norte de China, con enfasis en habla coloquial de personas mayores de Shandong.
- Reconocimiento offline en CPU puro, sin necesidad de GPU ni conexion de red.
- Inferencia por streaming de ficheros completos mediante `OfflineRecognizer.from_sense_voice` de sherpa-onnx.
- Soporte de integracion en asistentes de voz embebidos (edge AI) por su bajo coste de computo (RTF 0,02-0,03 con 4 hilos).
- Capacidad multilingue limitada: solo chino (`language="zh"`); no cubre otras lenguas.
- No dispone de salida de puntuacion ni de ITN activada por defecto en los ejemplos (`use_itn=False`).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Asistente de acompanamiento para personas mayores: transcripcion de conversaciones espontaneas en dialecto de Shandong en un dispositivo de bajo coste sin GPU, aprovechando la mejora de CER frente al modelo base en habla de ancianos (52,71% frente a 64,25%).
- Domotica por voz en el hogar: reconocimiento de ordenes cortas en dialecto para encender luces, llamar a familiares o activar alarmas, ejecutado localmente en una CPU de mini-PC o Raspberry Pi.
- Teleasistencia y triaje de llamadas: conversion a texto de llamadas de mayores para su analisis posterior, con despliegue en el propio centro para evitar enviar audio sensible a la nube.
- Subtitulado de contenido audiovisual dialectal: transcripcion de videos y grabaciones en dialecto de Shandong para archivo o accesibilidad, usando el modelo en lote sobre CPU.
- Investigacion en ASR dialectal: punto de partida cuantizado y reproducible para experimentos de adaptacion de dominio con corpus limitados (1.175 fragmentos reales), dado que el autor documenta el pipeline de filtrado y aumentacion.
- Prototipado de productos de voz en entornos sin GPU: validacion rapida de ideas con sherpa-onnx y un modelo de 0,2 GB que cabe en cualquier equipo.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en AMD Ryzen 7 8845HS con 4 hilos, sherpa-onnx 2.0.1, `use_itn=False`, `language="zh"`:

| Conjunto de evaluacion | Muestras | SenseVoice-Small int8 | v1 | v2-ep4 (este modelo) |
|---|---|---|---|---|
| eval_shandong_elder (total) | 123 utt / 597,2 s | CER 64,25% / pinyin 58,92% | CER 55,73% / pinyin 52,88% | CER 52,71% / pinyin 49,64% |
| Subconjunto de hablantes no vistos | 96 utt / 4 hablantes | CER 65,42% / pinyin 59,80% | CER 57,17% / pinyin 54,32% | CER 53,23% / pinyin 50,28% |
| eval_kespeech_dialect | 300 utt / 1.652,3 s | CER 16,72% / pinyin 9,23% | CER 8,70% / pinyin 4,91% | CER 8,92% / pinyin 5,09% |
| eval_mandarin_clean | 300 utt / 1.680,2 s | CER 5,10% / pinyin 2,45% | CER 3,90% / pinyin 1,69% | CER 4,09% / pinyin 1,81% |

Datos adicionales: en eval_shandong_elder la reduccion media de CER por utterance frente al original es de +11,99% (IC bootstrap 95% [+8,54%, +15,48%], t=6,78, victorias/empates/derrotas 81/27/15, p=4,03e-12); frente a v1 la mejora media es +2,77% (p=0,0448) y +3,72% en el subconjunto de hablantes no vistos (p=0,0125). RTF medido: 0,0291 en Shandong, 0,0216 en KeSpeech y 0,0195 en mandarin. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) por tratarse de un modelo ASR.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; el autor no reporta uso de GPU en produccion.
- VRAM: no aplica; el modelo ONNX int8 ocupa 239.234.076 bytes en disco y puede residir en RAM.
- GPU recomendadas: no aplica para inferencia; el fine-tuning se realizo en una NVIDIA L4 (FP32).
- Cabe en cualquier equipo de consumo: se ha medido en un AMD Ryzen 7 8845HS con 4 hilos; es viable en mini-PC, portatiles y placas SBC con CPU x86 o ARM.
- Despliegue: sherpa-onnx (`OfflineRecognizer.from_sense_voice`, `provider="cpu"`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo ASR ONNX).
- Latencia y throughput: RTF 0,0195-0,0291 con 4 hilos, es decir, procesa audio entre 34 y 51 veces mas rapido que tiempo real en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER Shandong (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banju-sensevoice-shandong-int8 (v2-ep4) | no disponible (239 MB int8) | no disponible | 52,71% (total) / 53,23% (no vistos) | other (FunASR MODEL_LICENSE) | Hugging Face, sherpa-onnx |
| FunAudioLLM/SenseVoiceSmall (int8) | no disponible | no disponible | 64,25% / 65,42% | FunASR MODEL_LICENSE | Hugging Face, sherpa-onnx |
| banju-sensevoice-shandong-int8 v1 | no disponible | no disponible | 55,73% / 57,17% | other | Hugging Face |
| Whisper large-v3 | 1.550 M | 30 s por ventana | no evaluado en el informe | MIT | Amplia (OpenAI, HF, whisper.cpp) |

La comparacion con Whisper large-v3 se incluye como referencia de categoria (ASR multilingue de proposito general), pero no hay datos del autor para ese modelo en dialecto de Shandong; el propio SenseVoice-Small es la referencia directa y la unica con mediciones comparables publicadas.

## Limitaciones y advertencias

- CER absoluto elevado en habla de mayores en Shandong (52,71% en el conjunto total y 53,23% en hablantes no vistos): sigue siendo un modelo de uso asistido, no de transcripcion de calidad documental.
- El conjunto de evaluacion es pequeno (123 utterances, 5 videos; 96 utterances de 4 hablantes no vistos), por lo que las cifras tienen alta incertidumbre pese a los intervalos bootstrap reportados.
- Solo soporta chino; no hay soporte de otras lenguas ni de cambio de idioma.
- Riesgo de sobreajuste al dominio "Banju": el entrenamiento usa 36 videos concretos y aumentacion de sala simulada; el rendimiento puede degradarse en otras condiciones acusticas o micrófonos.
- El modelo base SenseVoiceSmall puede heredar sesgos de sus datos de entrenamiento originales; el autor no documenta un analisis de sesgos especifico.
- Licencia `other` (FunASR MODEL_LICENSE): es obligatorio revisar las condiciones del fichero de licencia de FunASR antes de cualquier uso comercial; el autor no aclara si se permite uso comercial del derivado.
- Cuantizacion QUInt8 dinamica: no se documenta la perdida de precision respecto al checkpoint FP32 original.
- No se documentan limitaciones de longitud de contexto; el modelo procesa utterances completas y no esta pensado para audio de muy larga duracion sin segmentacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hongyue0721/banju-sensevoice-shandong-int8
- Modelo base SenseVoiceSmall: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Licencia del modelo base (FunASR MODEL_LICENSE): https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset KeSpeech usado para anti-olvido: https://huggingface.co/datasets/TwinkStart/KeSpeech
