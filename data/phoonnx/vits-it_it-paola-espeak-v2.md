# Phoonnx/vits-it_it-paola-espeak-v2

## Resumen

`Phoonnx/vits-it_it-paola-espeak-v2` es una voz de sintesis de voz (text-to-speech) en italiano basada en la arquitectura VITS del ecosistema Piper, publicada por Phoonnx (TigreGotico Lda) como conversion a ONNX del modelo original `rhasspy/piper-voices/it/it_IT/paola/medium`. El modelo no es un LLM: es un sintetizador neuronal de voz monohablante que transforma fonemas IPA generados por espeak-ng en audio a 22050 Hz. Su relevancia es practica: permite integrar TTS italiano de calidad media en asistentes de voz y aplicaciones locales sin dependencia de servicios en la nube.

Esta segunda version (`-v2`) sustituye a `Phoonnx/vits-it_it-paola-espeak` porque el autor original reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444` de `rhasspy/piper-voices`). El repositorio incluye tanto los pesos en fp32 como copias cuantizadas int8 generadas con `onnxruntime.quantization.quantize_dynamic`, lo que reduce el grafo de 63,2 MB a 18,7 MB.

El modelo se distribuye bajo licencia CC0 1.0, lo que permite uso comercial sin restricciones de atribucion legal (aunque el autor pide credito a Rhasspy). Su integracion principal es la libreria `phoonnx` y el plugin `ovos-tts-plugin-phoonnx` para el ecosistema OpenVoiceOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper 1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | fp32 e int8 (QInt8, cuantizacion dinamica con onnxruntime 1.32.0) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (monohablante) |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Fonemizador | espeak-ng, voz `it` |
| Puntuacion soportada | `, . ! ? : ;` (clausulas) |
| Tamano del repositorio | 0,1 GB |
| Voice id | `piper_community/paolapersico1/it-IT_paola-v2` |

## Arquitectura y entrenamiento

VITS es un modelo generativo end-to-end de sintesis de voz que combina un encoder de texto, un predictor de duracion y un decoder basado en flujos normalizadores y un vocoder HiFi-GAN integrado, entrenado con perdidas adversarias y de reconstruccion. En esta variante Piper, el texto se preprocesa a fonemas IPA mediante espeak-ng antes de entrar al modelo.

Segun la model card, el modelo original fue entrenado por Rhasspy partiendo del modelo base `hifi_tts_92` en ingles estadounidense (calidad media, voz de Cori Samuel, lector 92 de Hi-Fi TTS), con ajuste fino mediante MRD y SDP. Los datos de entrenamiento especificos de la voz italiana no estan registrados upstream; la unica referencia es el dataset `OHF-Voice/voice-datasets` bajo licencia CC0. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333, y requiere Piper 1.5 o superior. La conversion a ONNX no altera los pesos; solo las copias int8 los cuantizan.

## Capacidades

- Sintesis de voz en italiano a partir de texto, con salida WAV a 22050 Hz.
- Fonemizacion via espeak-ng (voz `it`), con soporte de puntuacion de clausula (`, . ! ? : ;`) preservada por phoonnx 1.96.1a1 y posteriores.
- Inferencia en CPU sin GPU, con pesos fp32 o int8.
- Integracion como plugin TTS en OpenVoiceOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion local y offline mediante ONNX Runtime.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en italiano: la voz se integra en OVOS mediante `ovos-tts-plugin-phoonnx` y permite respuestas habladas sin conexion a la nube, con RTF de 0,044 en fp32 sobre CPU de escritorio.
- Lectura de notificaciones y alertas en aplicaciones domoticas: el bajo consumo (RSS pico de 276,5 MB en fp32) permite ejecutarlo en dispositivos con recursos limitados junto a otros servicios.
- Generacion de audiolibros o narraciones de contenido en italiano: la puntuacion de clausula preservada mejora la prosodia en frases largas divididas en oraciones.
- Prototipado de interfaces conversacionales en italiano: la licencia CC0 permite iterar y desplegar sin negociar condiciones de uso comercial.
- Accesibilidad: lectura en voz alta de contenido web o documentos para usuarios italoparlantes, ejecutable en local por privacidad.
- Pruebas de regresion de pipelines TTS: las dos variantes (fp32 e int8) con metricas QA publicadas (WER 0,034 y 0,069 respectivamente) permiten comparar calidad y latencia antes de elegir el despliegue.
- Sistemas embebidos o de bajo consumo: la copia int8 (18,7 MB de grafo, 240,9 MB de RSS pico) es adecuada para hardware tipo Raspberry Pi o mini-PC.

## Benchmarks y rendimiento

Metricas de control de calidad publicadas en la model card. La evaluacion ASR se hizo con `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, en un Intel Core i9-11900H a 2,50 GHz con 4 hilos.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER (ASR) | 0,034 | 0,069 |
| Caracteres por segundo | 18,9 a 21,2 | no disponible |
| Ratio de longitud int8/fp32 | no aplica | 0,98 a 1,03 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 276,5 MB | 240,9 MB |
| RTF (mediana de 3, 4 hilos) | 0,044 | 0,106 |

No se han publicado comparaciones con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia esta pensada para CPU via ONNX Runtime.
- RAM: RSS pico de 276,5 MB en fp32 y 240,9 MB en int8.
- GPU recomendadas: no aplica; no se documenta aceleracion GPU para este modelo.
- Cabe en cualquier equipo consumer: el grafo int8 ocupa 18,7 MB y el fp32 63,2 MB.
- Despliegue: libreria `phoonnx` (pip), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime como motor. Requiere espeak-ng instalado (o el port espyak via `phoonnx[espeak]`).
- Latencia: RTF de 0,044 (fp32) y 0,106 (int8) en i9-11900H con 4 hilos; es decir, sintetizar 1 segundo de audio cuesta entre 44 y 106 ms de computo.
- Throughput: 18,9 a 21,2 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-it_it-paola-espeak-v2` (este) | VITS Piper 1.5 | it-IT | 1 | ONNX fp32/int8 | CC0 1.0 | Conversion de `rhasspy/piper-voices` |
| `Phoonnx/vits-it_it-paola-espeak` | VITS Piper (anterior) | it-IT | 1 | ONNX | CC0 1.0 | Version previa, pesos antiguos; reemplazada por este modelo |
| `rhasspy/piper-voices/it/it_IT/paola/medium` | VITS Piper 1.5 | it-IT | 1 | pesos Piper originales | CC0 1.0 | Modelo upstream sin conversion ONNX |

No se dispone de datos de benchmarks comparativos con otras voces italianas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monohablante y monoidioma: solo italiano (it-IT) y una unica voz; no admite clonacion ni cambio de hablante.
- Dependencia de espeak-ng: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras; se recomienda espeak-ng nativo.
- Calidad media: la voz se entreno sobre un modelo base de calidad media; no es comparable a sistemas TTS neuronales de gran escala.
- Riesgo de alucinacion acustica: como todo TTS, puede producir prosodia incorrecta o pronunciaciones anomalas en texto no visto, especialmente con numeros, siglas o palabras extranjeras.
- Datos de entrenamiento no registrados upstream: no se puede auditar la composicion del corpus mas alla de la referencia a `OHF-Voice/voice-datasets` (CC0).
- WER mayor en int8 (0,069 frente a 0,034 en fp32): la cuantizacion degrada ligeramente la inteligibilidad; conviene validar en produccion.
- La licencia CC0 1.0 permite uso comercial sin restricciones, pero el autor solicita credito a Rhasspy.
- Fecha de creacion del repositorio: 2026-11-22; el modelo es reciente y tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-paola-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/it/it_IT/paola/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior reemplazada: https://huggingface.co/Phoonnx/vits-it_it-paola-espeak
- Dataset de voces upstream: https://github.com/OHF-Voice/voice-datasets
- TigreGotico: https://tigregotico.pt
