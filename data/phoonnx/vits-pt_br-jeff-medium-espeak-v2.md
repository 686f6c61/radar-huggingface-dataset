# Phoonnx/vits-pt_br-jeff-medium-espeak-v2

## Resumen

vits-pt_br-jeff-medium-espeak-v2 es una voz de sintesis de voz (text-to-speech) en portugues de Brasil, publicada por Phoonnx (TigreGotico Lda) como conversion a ONNX del modelo original de Rhasspy `rhasspy/piper-voices/pt/pt_BR/jeff/medium`. No es un modelo de lenguaje: es un modelo acustico VITS integrado en el ecosistema Piper, pensado para sintetizar audio a partir de fonemas IPA generados por espeak-ng. Esta version sustituye a `Phoonnx/vits-pt_br-jeff-medium-espeak` porque el autor original reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444` de piper-voices).

El modelo resuelve un problema muy concreto: ofrecer una voz mono-hablante en pt-BR, ligera y ejecutable en CPU, para asistentes de voz locales y sistemas embebidos. Con un grafo de 63,2 MB en fp32 y 18,7 MB en int8, y un pico de memoria residente de 264,1 MB (fp32) y 219,2 MB (int8), encaja en entornos con recursos muy limitados. La frecuencia de muestreo es de 22050 Hz y la licencia es CC0 1.0, lo que permite uso comercial sin restricciones de atribucion legal (aunque el autor pide credito a Rhasspy).

La relevancia actual reside en su integracion con phoonnx, la libreria de TigreGotico para TTS local, y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. Frente a soluciones TTS neuronales de gran tamano, esta voz prioriza latencia y huella de memoria: un RTF de 0,040 en fp32 y 0,101 en int8 medido en un Intel Core i9-11900H con 4 hilos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo autoregresivo; procesa fonemas de una frase) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak (alfabeto IPA), voz espeak-ng `pt-br` |
| Puntuacion soportada | coma, punto, exclamacion, interrogacion, dos puntos, punto y coma |
| Voces base | Piper 1.5 (reentrenada desde el modelo base `rdh`, medium, nl_BE) |
| Tamano del repo | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de sintesis de voz que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder basado en HiFi-GAN, entrenado de extremo a extremo con perdidas adversariales y de reconstruccion. En el caso de Piper, el texto se convierte primero a fonemas IPA mediante espeak-ng y el modelo genera la forma de onda directamente. Esta variante `medium` corresponde a la calidad intermedia de Piper, con 22050 Hz de muestreo.

El entrenamiento lo realizo Rhasspy (upstream) y los detalles de datos no estan registrados en la model card: la propia ficha indica "Training data: Not recorded upstream" y "Base model: Not recorded". Si se documenta que la voz se reentreno sobre los modelos base de Piper 1.5 y que el upstream parte de un modelo base `rdh` (calidad medium, un hablante flamenco nl_BE, CC0), afinado con MRD y SDP. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior. Phoonnx solo realiza la conversion a ONNX y la cuantizacion int8; no modifica los pesos originales.

## Capacidades

- Sintesis de voz mono-hablante en portugues de Brasil a 22050 Hz.
- Entrada basada en fonemas IPA generados por espeak-ng (voz `pt-br`), no texto libre directo.
- Preserva la puntuacion de clausula (`,` `.` `!` `?` `:` `;`) en la sintesis con phoonnx 1.96.1a1 y posteriores.
- Ejecucion en CPU sin GPU, con grafos ONNX de 63,2 MB (fp32) y 18,7 MB (int8).
- Soporte de cuantizacion dinamica int8 con degradacion controlada (WER 0,030 frente a 0,000 en fp32).
- Integracion con OVOS mediante `ovos-tts-plugin-phoonnx` y seleccion de voz por configuracion.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo acustico TTS.

## Casos de uso

- Asistentes de voz locales y offline: la voz se integra en OVOS via `ovos-tts-plugin-phoonnx` y permite respuestas habladas en pt-BR sin conexion a servicios en la nube, con un pico de RSS de 219,2 MB en int8.
- Domotica y dispositivos embebidos: con 18,7 MB de grafo int8 y ejecucion en CPU, cabe en Raspberry Pi y equipos de bajos recursos para anuncios hablados y confirmaciones de estado.
- Lectura de notificaciones y accesibilidad: sintesis de frases cortas con puntuacion preservada, util para lectores de pantalla y avisos de sistemas en portugues de Brasil.
- Generacion de audiolibros y contenido pregrabado por lotes: el RTF de 0,040 en fp32 (4 hilos) permite procesar grandes volumenes de texto mas rapido que tiempo real en un solo equipo.
- Prototipado de interfaces conversacionales: el modelo sirve para validar flujos de voz en pt-BR antes de invertir en voces comerciales o modelos TTS de mayor tamano, gracias a su licencia CC0.
- Pruebas de regresion de pipelines TTS: la comparacion fp32/int8 documentada (WER, longitud, RTF) permite usar la voz como referencia para validar cuantizaciones y cambios en el frontend de fonemas.
- Sistemas de megafonia y kioscos interactivos: la baja latencia y la ausencia de dependencia de GPU simplifican el despliegue en hardware comercial.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a una prueba de calidad con ASR (nemo-parakeet-tdt-0.6b-v3 int8) sobre 3 frases de FLORES-200 devtest, no a benchmarks estandar de TTS. Se midieron en un Intel Core i9-11900H a 2,50 GHz con 4 hilos.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,000 | 0,030 |
| Caracteres por segundo | 16,2 a 19,3 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,95 a 0,98 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 264,1 MB | 219,2 MB |
| RTF (mediana de 3) | 0,040 | 0,101 |

No se han publicado resultados de benchmarks en la informacion disponible para metricas como MOS, MCD o comparaciones con otras voces TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU.
- Memoria RAM: pico de RSS de 264,1 MB en fp32 y 219,2 MB en int8.
- CPU: funciona en CPU de consumo; las mediciones se hicieron en un Intel Core i9-11900H con 4 hilos. No se dispone de datos para CPUs de gama baja.
- GPU: no aplica; no se documenta soporte de aceleracion por GPU en la informacion disponible.
- Cabe en hardware de consumo y en dispositivos embebidos gracias al grafo int8 de 18,7 MB.
- Despliegue: libreria phoonnx (pip), con espeak-ng instalado como dependencia del fonemizador, o el port espyak mediante `phoonnx[espeak]`. Integracion en OVOS con `ovos-tts-plugin-phoonnx`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: RTF de 0,040 (fp32) y 0,101 (int8) en el equipo de referencia; es decir, sintetiza entre 10 y 25 veces mas rapido que tiempo real en esas condiciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Muestreo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-pt_br-jeff-medium-espeak-v2 | VITS (Piper) | pt-BR | 22050 Hz | CC0 1.0 | ONNX fp32/int8 | Esta ficha; conversion de piper-voices |
| rhasspy/piper-voices (pt_BR/jeff/medium) | VITS (Piper) | pt-BR | 22050 Hz | CC0 1.0 | ONNX (upstream) | Modelo original del que deriva esta conversion |
| Phoonnx/vits-pt_br-jeff-medium-espeak | VITS (Piper) | pt-BR | 22050 Hz | CC0 1.0 | ONNX | Version anterior, con pesos previos al reentrenamiento en Piper 1.5 |

No se dispone de datos de rendimiento comparativo (MOS, WER, RTF) frente a otras voces TTS en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas tecnicas y procedencia.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo portugues de Brasil con una unica voz; no admite cambio de hablante ni otros idiomas.
- Dependencia del fonemizador: requiere espeak-ng; con el port espyak algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- Calidad limitada por la categoria `medium` de Piper: no es una voz de alta fidelidad ni compite con modelos TTS neuronales grandes en naturalidad.
- Datos de entrenamiento no documentados: no se conoce la composicion del dataset, lo que impide evaluar sesgos de origen.
- Riesgo de errores de pronunciacion en palabras extranas, siglas y numeros, inherente a la sintesis basada en fonemas.
- La cuantizacion int8 introduce un WER de 0,030 frente a 0,000 en fp32; para produccion con maxima calidad se recomienda fp32.
- La licencia CC0 1.0 permite uso comercial sin restricciones legales de atribucion, pero el autor solicita credito a Rhasspy al usar la voz.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta herramientas ni agentes; cualquier uso en ese sentido es un error de categoria.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-jeff-medium-espeak-v2
- Modelo upstream (Piper voices, pt_BR/jeff/medium): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/pt/pt_BR/jeff/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior de la voz: https://huggingface.co/Phoonnx/vits-pt_br-jeff-medium-espeak
- TigreGotico: https://tigregotico.pt
- Dataset de voces upstream: https://github.com/OHF-Voice/voice-datasets
