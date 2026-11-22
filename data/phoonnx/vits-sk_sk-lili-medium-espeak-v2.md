# Phoonnx/vits-sk_sk-lili-medium-espeak-v2

## Resumen

`Phoonnx/vits-sk_sk-lili-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en eslovaco (sk-SK) basada en la arquitectura VITS del ecosistema Piper. El modelo original fue entrenado por Rhasspy dentro del proyecto `rhasspy/piper-voices` y esta conversion a ONNX la publica TigreGotico (bajo el identificador Phoonnx) para su uso con la libreria `phoonnx`, un motor de TTS orientado a asistentes de voz y sistemas OVOS.

Se trata de una voz mono-hablante de calidad "medium" que toma como entrada fonemas espeak-ng en alfabeto IPA y genera audio a 22050 Hz. El repositorio incluye los grafos en fp32 y sus copias cuantizadas a int8, lo que reduce el tamano del grafo de 63,2 MB a 18,7 MB y permite ejecucion en CPU con factores de tiempo real (RTF) del orden de 0,04 a 0,10 en hardware de consumo.

La relevancia de esta version concreta (`-v2`) es que reemplaza a la anterior `Phoonnx/vits-sk_sk-lili-medium-espeak`: el modelo upstream fue reentrenado sobre la base Piper 1.5 (commit `e9c8a39444`), incorporando puntuacion de clausula y ajustes de entrenamiento (MRD y SDP). No es un modelo de lenguaje generativo, sino un sistema neuronal de sintesis acustica especializado, por lo que sus "capacidades" se limitan a la conversion texto-a-voz en eslovaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic, QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | eslovaco (sk-SK) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (mono-hablante) |
| Fonemizador | espeak-ng, voz `sk`, alfabeto IPA |
| Puntuacion soportada | `, . ! ? : ;` (mantenida en sintesis desde phoonnx 1.96.1a1) |
| Tamano del repo | 0,1 GB |
| Modelo base | rhasspy/piper-voices (relacion: quantized) |
| Voice id | `piper/sk_SK-lili-medium-v2` |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo para sintesis de voz que combina un encoder de texto, un predictor de duraciones, un flujo normalizador y un decoder basado en HiFi-GAN, entrenado con perdidas adversarias y de reconstruccion. En el ecosistema Piper, la entrada es una secuencia de fonemas IPA producida por espeak-ng, y la salida es una forma de onda a 22050 Hz. Esta version concreta corresponde a la variante "medium" de la voz `lili` para eslovaco de Slovakia.

Segun la model card, el modelo upstream se entreno haciendo fine-tuning desde la base `hifi_tts_92` en ingles estadounidense (voz de Cori Samuel, lector 92 de Hi-Fi TTS), con calidad medium, aplicando MRD (Multi-Resolution Discriminator) y SDP. Los datos de entrenamiento provienen de `OHF-Voice/voice-datasets` bajo licencia CC0, aunque la cantidad exacta de horas y la composicion del corpus no estan registradas en el repositorio. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior. La conversion a ONNX no modifica los pesos; solo las copias int8 los cuantizan dinamicamente.

## Capacidades

- Sintesis de voz a partir de texto en eslovaco (sk-SK), con salida WAV a 22050 Hz.
- Fonemizacion mediante espeak-ng (voz `sk`), con entrada en alfabeto IPA.
- Respeto de puntuacion de clausula (`, . ! ? : ;`) para modelar pausas y prosodia.
- Ejecucion en CPU sin GPU, con grafos ONNX optimizados para inferencia ligera.
- Variante int8 con WER de 0,318 frente a 0,273 en fp32, dentro del umbral de calidad definido por el autor.
- Integracion con asistentes OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un motor TTS.

## Casos de uso

- Asistentes de voz locales en eslovaco: la voz se integra en OVOS mediante `ovos-tts-plugin-phoonnx` y permite respuestas habladas en un asistente domestico sin depender de servicios en la nube, gracias a su ejecucion en CPU y su bajo consumo de memoria (231-268 MB de RSS pico).
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles: el modelo sintetiza frases cortas con RTF de 0,04-0,10, lo que permite generar audio mas rapido que el tiempo real en un Intel i9-11900H.
- Sistemas de accesibilidad para personas con discapacidad visual: conversion de texto de pantalla a voz en eslovaco con una huella de memoria inferior a 300 MB, apta para dispositivos de gama baja.
- Audiolibros y contenido narrado de dominio publico: al estar bajo licencia CC0, se puede usar para narrar textos sin restricciones de atribucion ni de uso comercial.
- Generacion de avisos en transporte publico o megafonia: frases fijas con puntuacion controlada que producen pausas naturales y una prosodia estable.
- Pruebas de integracion en pipelines de CI para sistemas de voz: el par fp32/int8 y los resultados de QA con ASR (nemo-parakeet-tdt-0.6b-v3 int8 sobre FLORES-200 devtest) permiten validar regresiones de calidad de sintesis de forma automatizada.
- Prototipado de interfaces conversacionales en eslovaco: sirve como capa TTS de referencia para demos de agentes de voz antes de invertir en voces comerciales de mayor calidad.

## Benchmarks y rendimiento

La model card incluye una evaluacion de calidad (QA) mediante reconocimiento automatico del habla con `nemo-parakeet-tdt-0.6b-v3` en int8, sobre 3 frases de FLORES-200 devtest. Los resultados son los siguientes:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,273 | 0,318 |
| Caracteres por segundo | 14,0 a 15,6 | no disponible |
| Ratio de longitud int8 / fp32 | no aplica | 0,98 a 1,00 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 268,0 MB | 231,5 MB |
| RTF (mediana de 3, 4 hilos) | 0,042 | 0,103 |

Las mediciones se realizaron en un Intel Core i9-11900H a 2,50 GHz. El RTF se define como tiempo de sintesis dividido por la duracion del audio. No se han publicado resultados de benchmarks estandar de TTS (MOS, MCD, CMOS) en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU. El consumo de memoria es de 268,0 MB (fp32) y 231,5 MB (int8) en RSS pico.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. Cualquier GPU moderna puede ejecutar ONNX Runtime, pero no aporta ventaja significativa para este tamano.
- Cabe en cualquier equipo de consumo: el grafo int8 ocupa 18,7 MB y el fp32 63,2 MB, por lo que funciona en Raspberry Pi y portatiles de gama baja.
- Opciones de despliegue: `phoonnx` (con `pip install --pre phoonnx`), ONNX Runtime, y el plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]` con el port espyak).
- Latencia y throughput: RTF de 0,042 en fp32 y 0,103 en int8 con 4 hilos en un i9-11900H, es decir, entre 10 y 24 veces mas rapido que el tiempo real. La velocidad de habla medida es de 14,0 a 15,6 caracteres por segundo.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-sk_sk-lili-medium-espeak-v2 | sk-SK | VITS (Piper) | 22050 Hz | CC0 1.0 | ONNX (fp32/int8) | Esta ficha; conversion de Piper 1.5 |
| Phoonnx/vits-sk_sk-lili-medium-espeak | sk-SK | VITS (Piper) | 22050 Hz | CC0 1.0 | ONNX | Version anterior, pesos previos al reentrenamiento |
| rhasspy/piper-voices (sk/sk_SK/lili/medium) | sk-SK | VITS (Piper) | 22050 Hz | CC0 1.0 | Checkpoint Piper | Modelo upstream original |
| Otras voces Piper en eslovaco | sk-SK | VITS (Piper) | 22050 Hz | CC0 1.0 | ONNX | Disponibles en el catalogo Piper; no se detallan en la informacion disponible |

No se dispone de datos comparativos de benchmarks (MOS, WER) frente a otras voces eslovacas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo genera voz en eslovaco (sk-SK) y no admite otros idiomas ni cambio de hablante.
- Calidad "medium": no es una voz de alta fidelidad; el WER de QA es 0,273 en fp32 y 0,318 en int8, lo que indica errores de pronunciacion medibles en la validacion automatica.
- Dependencia de espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir artefactos, ruido o prosodia incorrecta en entradas atipicas, siglas o numeros no normalizados previamente.
- Datos de entrenamiento no documentados: la cantidad de horas, la composicion del corpus y el modelo base exacto no estan registrados upstream, lo que dificulta auditar sesgos de acento o de dominio.
- Licencia CC0 1.0: permite uso comercial y modificacion sin atribucion obligatoria, aunque el autor recomienda acreditar a Rhasspy.
- Sin soporte de SSML avanzado ni control fino de prosodia mas alla de la puntuacion de clausula.
- La version `-v2` sustituye a la anterior; usar la version antigua puede dar lugar a pesos desactualizados y a diferencias de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sk_sk-lili-medium-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/sk/sk_SK/lili/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior del modelo: https://huggingface.co/Phoonnx/vits-sk_sk-lili-medium-espeak
- Dataset de voces upstream: https://github.com/OHF-Voice/voice-datasets
- TigreGotico: https://tigregotico.pt
