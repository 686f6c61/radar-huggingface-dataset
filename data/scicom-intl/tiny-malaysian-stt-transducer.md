# Scicom-intl/Tiny-Malaysian-STT-Transducer

## Resumen

Tiny Malaysian STT Transducer es un sistema de reconocimiento automático del habla (ASR) desarrollado por Scicom-intl, orientado específicamente al habla malasia y a la alternancia de código entre malayo, inglés, mandarín y tamil. Se trata de un modelo de tipo transducer con encoder Zipformer, decodificador stateless y joiner, entrenado desde cero y distribuido en formato ONNX cuantizado a 8 bits. Con 40,4 millones de parámetros y 48,7 MB de pesos, su propuesta central es ofrecer reconocimiento multilingüe y code-switching en un único núcleo de CPU, sin GPU.

El modelo resuelve un problema concreto: la mayoría de ASR multilingües de calidad requieren hardware especializado y no están optimizados para el habla malasia ni para llamadas telefónicas de banda estrecha. Este sistema incorpora aumentación de línea telefónica durante el entrenamiento y se evaluó explícitamente con códecs como G.711 mu-law, GSM full rate, Opus a 8 kbit/s y MP3 a 16 kbit/s, lo que lo hace adecuado para entornos de contact center y telefonía.

Es relevante ahora porque demuestra que un modelo de menos de 50 MB puede alcanzar un WER del 10,3 % en el benchmark malasio Revolab ASR-Benchmark-Public, con un factor de tiempo real de 0,021 (49 segundos de audio procesados por segundo de cómputo) en un solo núcleo. La versión actual, `b-v3`, se entrenó sobre 90.000 horas de audio y convive en el repositorio con la anterior `b-v2` (60.000 horas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer encoder + transducer (decoder stateless + joiner) |
| Parametros totales | 40,4 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | clips de hasta ~30 s (modelo offline, no streaming) |
| Tipos de cuantizacion | int8 (pesos de 8 bits); no se documentan otras |
| Idiomas soportados | ms (malayo), en (inglés), zh (mandarín), ta (tamil), con code-switching entre ellos |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

El modelo es un transducer end-to-end con encoder Zipformer, un decodificador stateless y un joiner, todo exportado a ONNX con cuantización int8. El encoder ocupa 41,8 MB, el decodificador 3,9 MB y el joiner 3,1 MB, sumando 48,7 MB. El entrenamiento parte de cero (no es un fine-tuning de un modelo previo) y emplea transcripciones generadas por un reconocedor de producción de gran tamaño (un Whisper large-v3 fine-tuned) combinadas con transcripciones humanas, además de aumentación de línea telefónica para robustez en banda estrecha.

La versión `b-v3`, publicada en la raíz del repositorio, se entrenó sobre 90.000 horas de audio vistas, partiendo de una tabla de entrenamiento que creció de 1.723 h a 4.071 h durante el proceso. La versión `b-v2`, en la carpeta `b-v2/`, vio 60.000 horas. El mismo entrenamiento produce un modelo CTC con el mismo encoder, publicado por separado. La decodificación es greedy y el modelo es offline: procesa un clip cada vez, remuestrea a 16 kHz y requiere segmentar previamente el audio largo con un detector de actividad de voz.

## Capacidades

- Reconocimiento de voz en malayo, inglés, mandarín y tamil, incluyendo alternancia de código dentro de una misma emisión.
- Salida con mayúsculas y puntuación, con números de teléfono y letras deletreadas agrupadas con guiones.
- Robustez ante códecs telefónicos de banda estrecha (G.711 mu-law, GSM full rate) y códecs de baja tasa (Opus 8 kbit/s, MP3 16 kbit/s).
- Entrada a cualquier frecuencia de muestreo (remuestreo interno a 16 kHz) y clips de hasta unos 30 segundos.
- Inferencia en un solo núcleo de CPU con sherpa-onnx.
- No soporta tool calling, agentes, visión, audio de entrada más allá del propio ASR ni modo thinking.
- No es un modelo de streaming: no admite decodificación incremental en tiempo real.

## Casos de uso

- Transcripción de llamadas de contact center: el modelo se entrenó con aumentación telefónica y se evaluó con códecs G.711 y GSM, por lo que puede transcribir grabaciones de banda estrecha en malayo, inglés, mandarín y tamil dentro de la misma llamada.
- Subtitulado por lotes de contenido malasio multilingüe: al ser offline, se segmenta el audio con VAD y se transcriben los turnos uno a uno, aprovechando el code-switching para entrevistas y pódcast donde se mezclan idiomas.
- Enrutamiento y análisis de llamadas entrantes: la transcripción permite clasificar la intención del cliente y derivar al agente adecuado según el idioma detectado, con un coste de cómputo de un solo núcleo por instancia.
- Despliegue en dispositivos sin GPU: con 48,7 MB de pesos int8, cabe en entornos edge, kioscos o servidores modestos donde no hay acelerador disponible.
- Transcripción de audio comprimido para archivo: útil para digitalizar grabaciones almacenadas en Opus a 8 kbit/s o MP3 a 16 kbit/s, condiciones en las que el WER se mantiene en torno al 11-12 % en el benchmark malasio.
- Preprocesado para pipelines de análisis: la salida puntuada y con números de teléfono agrupados facilita la extracción posterior de entidades (teléfonos, nombres deletreados) sin postprocesado adicional.
- Evaluación comparativa de ASR en malayo: sirve como línea base ligera frente a modelos grandes en pruebas internas de calidad por idioma y por condición de códec.

## Benchmarks y rendimiento

Resultados de `b-v3` con decodificación greedy, pesos int8 y sherpa-onnx, un clip cada vez. Tasas de error en porcentaje (menor es mejor).

| Conjunto | Métrica | Error |
|---|---|---:|
| Malaysian benchmark (Revolab ASR-Benchmark-Public) | WER | 10,3 |
| FLEURS Malay | WER | 12,4 |
| FLEURS English | WER | 21,4 |
| FLEURS Mandarin | CER | 34,9 |
| FLEURS Tamil | WER | 16,0 |
| Common Voice 22 Tamil | WER | 8,4 |
| Regional Malay (held out, no público) | WER | 15,2 |
| Malaysian Mandarin (held out, no público) | CER | 20,9 |
| Call-centre calls (held out, no público) | WER | 25,1 |
| Synthetic call-centre speech (held out) | WER | 7,7 |

Rendimiento del benchmark malasio a través de códecs:

| Condición | WER |
|---|---:|
| Tal cual | 10,3 |
| G.711 mu-law, 8 kHz | 10,7 |
| GSM full rate, 8 kHz | 11,9 |
| Opus, 8 kbit/s | 12,2 |
| MP3, 16 kbit/s | 11,6 |

Comparativa `b-v2` frente a `b-v3` en los mismos clips (cambio = `b-v3` − `b-v2`, intervalo bootstrap del 95 %):

| Conjunto | Métrica | `b-v2` | `b-v3` | Cambio |
|---|---|---:|---:|---|
| Malaysian benchmark | WER | 10,3 | 10,3 | -0,1 (-0,5 a +0,3), sin cambio |
| FLEURS Malay | WER | 13,3 | 12,4 | -0,9 (-1,3 a -0,5), mejor |
| FLEURS English | WER | 23,4 | 21,4 | -2,0 (-2,6 a -1,4), mejor |
| FLEURS Mandarin | CER | 31,1 | 34,9 | +3,8 (+3,0 a +4,6), peor |
| FLEURS Tamil | WER | 16,5 | 16,0 | -0,5 (-0,9 a -0,2), mejor |
| Common Voice 22 Tamil | WER | 8,8 | 8,4 | -0,4 (-0,6 a -0,1), mejor |
| Regional Malay | WER | 15,5 | 15,2 | -0,3 (-0,7 a +0,2), sin cambio |
| Malaysian Mandarin | CER | 22,5 | 20,9 | -1,6 (-3,4 a +0,2), sin cambio |
| Call-centre calls | WER | 24,7 | 25,1 | +0,4 (-0,3 a +1,1), sin cambio |
| Synthetic call-centre speech | WER | 8,2 | 7,7 | -0,6 (-1,9 a +0,5), sin cambio |
| Benchmark malasio vía G.711 mu-law | WER | 11,0 | 10,7 | -0,3 (-0,7 a +0,1), sin cambio |
| Benchmark malasio vía GSM full rate | WER | 12,1 | 11,9 | -0,2 (-0,6 a +0,3), sin cambio |
| Benchmark malasio vía Opus 8 kbit/s | WER | 12,6 | 12,2 | -0,4 (-0,8 a +0,1), sin cambio |

Velocidad: 49 segundos de audio por segundo de cómputo en un núcleo de CPU (RTF 0,021), con clips de 9 s de media.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU.
- Huella de memoria: 48,7 MB de pesos int8 (41,8 MB encoder + 3,9 MB decoder + 3,1 MB joiner) más el coste de runtime de sherpa-onnx.
- GPU recomendadas: no aplica; puede ejecutarse en cualquier CPU moderna. No se documentan requisitos de GPU.
- Cabe en cualquier GPU consumer, aunque no es su objetivo; también en dispositivos edge y servidores sin acelerador.
- Despliegue: sherpa-onnx (librería oficial del modelo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: RTF 0,021 en un núcleo (49 s de audio por segundo); `num_threads=1` en la configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER benchmark malasio | Licencia | Formato |
|---|---|---:|---:|---|---|
| Tiny Malaysian STT Transducer (`b-v3`) | 40,4 M | clips ~30 s | 10,3 | Apache 2.0 | ONNX int8 |
| Tiny Malaysian STT CTC (mismo autor, mismo encoder) | no disponible | clips ~30 s | 14,2 (CTC, `b-v3`) | Apache 2.0 | ONNX int8 |
| Whisper large-v3 fine-tuned (profesor del entrenamiento) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (ASR malasio multilingüe de menos de 100 M de parámetros) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere segmentar el audio largo con un detector de actividad de voz antes de transcribir.
- Límite práctico de unos 30 segundos por clip.
- El rendimiento en mandarín es el más débil: CER de 34,9 en FLEURS Mandarin y 20,9 en el conjunto interno, con un empeoramiento significativo de `b-v3` frente a `b-v2` (+3,8 puntos, intervalo que excluye cero).
- El WER en llamadas reales de contact center es del 25,1 %, notablemente superior al de habla sintética (7,7 %); conviene validar con muestras reales del dominio antes de producción.
- El inglés alcanza un WER del 21,4 % en FLEURS, lejos de los modelos ASR de gran tamaño; no es adecuado como transcriptor general de inglés.
- Riesgo de alucinación y errores en nombres propios, números y deletreos, especialmente en audio ruidoso o con códecs agresivos.
- Sesgos no documentados: la model card no detalla sesgos por acento, género o variante dialectal más allá de los conjuntos de evaluación citados.
- Parte de los conjuntos de evaluación son internos y no públicos (Regional Malay, Malaysian Mandarin, call-centre), por lo que no son reproducibles externamente.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones de los datos de entrenamiento derivados de un Whisper large-v3 fine-tuned.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Scicom-intl/Tiny-Malaysian-STT-Transducer
- Modelo CTC con el mismo encoder: https://huggingface.co/Scicom-intl/Tiny-Malaysian-STT-CTC
- Librería sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Benchmark malasio Revolab ASR-Benchmark-Public: no disponible (enlace no incluido en la información)
- Paper o blog técnico del modelo: no disponible
