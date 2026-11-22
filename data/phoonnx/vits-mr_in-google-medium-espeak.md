# Phoonnx/vits-mr_in-google-medium-espeak

## Resumen

vits-mr_in-google-medium-espeak es una voz de sintesis de voz (text-to-speech) en marati (mr-IN) basada en la arquitectura VITS del ecosistema Piper, convertida a formato ONNX para su uso con la libreria phoonnx. El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices y esta publicacion, a cargo de Phoonnx (TigreGotico Lda), es una conversion de los pesos sin cambios, acompanada de copias cuantizadas a int8.

El modelo resuelve la sintesis de voz offline y ligera para marati, un idioma con relativamente poca cobertura en herramientas TTS de codigo abierto. Su tamano reducido (grafo fp32 de 76,8 MB e int8 de 22,1 MB) y su tasa de refresco en tiempo real (RTF de 0,039 en fp32 y 0,092 en int8 sobre un Intel i9-11900H) lo hacen adecuado para entornos de bajos recursos, asistentes locales y sistemas embebidos.

La relevancia actual radica en su integracion con phoonnx y con OVOS (Open Voice OS), lo que permite desplegar voces Piper en asistentes de voz autoalojados. La entrada de texto se realiza mediante fonemas espeak-ng en alfabeto IPA, con soporte de puntuacion de clausula y 9 hablantes distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | marati (mr-IN) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (grafo fp32 e int8) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 9 |
| Entrada de texto | fonemas espeak-ng, alfabeto IPA |
| Puntuacion soportada | , . ! ? : ; (clausula) |
| Tamano del repositorio | 0,1 GB |
| Tamano del grafo | 76,8 MB (fp32) / 22,1 MB (int8) |
| Pico de RSS | 289,8 MB (fp32) / 227,9 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,039 (fp32) / 0,092 (int8) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS tal como la implementa Piper, un modelo generativo de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador basado en flujos normalizadores con un discriminador adversarial en entrenamiento. La entrada no es texto crudo sino fonemas generados por espeak-ng con la voz mr, codificados en alfabeto IPA. La sintesis usa por defecto noise_scale 0,5 y noise_w 0,333, y requiere Piper 1.5 o superior.

El entrenamiento upstream parte del modelo base hifi_tts_92 en ingles estadounidense (calidad media, voz de Cori Samuel, lectora 92 de Hi-Fi TTS), afinado con las tecnicas MRD y SDP. Los datos de entrenamiento proceden de OpenSLR 64 (https://openslr.org/64/) bajo licencia CC BY-SA 4.0, aunque el numero exacto de horas o tokens no esta registrado upstream. La publicacion de Phoonnx no modifica los pesos: solo realiza la conversion a ONNX y genera copias int8 mediante onnxruntime.quantization.quantize_dynamic (onnxruntime 1.32.0). El control de calidad se hizo sin ASR, mediante comprobacion de longitud y silencio sobre tres frases de FLORES-200 devtest, con resultados de 11,2 a 12,6 caracteres por segundo en fp32 y una relacion de longitud int8/fp32 de 0,97 a 0,98.

## Capacidades

- Sintesis de voz en marati (mr-IN) a partir de texto en ese idioma, con conversion interna a fonemas espeak-ng.
- Soporte de 9 hablantes distintos dentro del mismo modelo.
- Respeto de la puntuacion de clausula (, . ! ? : ;) en la sintesis, preservada por phoonnx 1.96.1a1 y posteriores.
- Generacion de audio a 22050 Hz en formato WAV mediante la API de phoonnx.
- Inferencia offline y ligera, apta para CPU sin GPU.
- Integracion como plugin de TTS en OVOS (ovos-tts-plugin-phoonnx).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz autoalojados en marati: integrado en OVOS mediante el plugin ovos-tts-plugin-phoonnx, el modelo permite dotar de voz a un asistente local sin depender de servicios en la nube, con un consumo de memoria inferior a 300 MB.
- Lectura de contenido en aplicaciones de accesibilidad: la sintesis offline y el bajo coste computacional permiten convertir articulos o notificaciones a voz en dispositivos de gama baja, manteniendo la privacidad del texto procesado.
- Sistemas de anuncios y megafonia automatizada: con un RTF de 0,039 en fp32, la generacion de avisos es practicamente instantanea, lo que permite encolar y reproducir mensajes en tiempo real.
- Prototipado de interfaces conversacionales en marati: los 9 hablantes permiten variar la voz segun el contexto (por ejemplo, distintos personajes o tonos) sin cargar modelos adicionales.
- Generacion de audiolibros o podcasts de bajo coste: la salida a 22050 Hz y el control de puntuacion permiten producir narraciones con pausas naturales a partir de texto plano.
- Pruebas de regresion en pipelines de TTS: la comprobacion de longitud y silencio documentada y la disponibilidad de grafos fp32 e int8 facilitan la validacion automatizada de la calidad de sintesis en CI.
- Despliegue en dispositivos embebidos o Raspberry Pi: el grafo int8 de 22,1 MB y un pico de RSS de 227,9 MB lo hacen viable en hardware con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de voz (MOS, MCD, WER por ASR) en la informacion disponible. Los unicos datos de rendimiento publicados son las metricas de QA del autor:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| Caracteres por segundo | 11,2 a 12,6 | no disponible |
| Relacion de longitud int8/fp32 | no aplica | 0,97 a 0,98 |
| Tamano del grafo | 76,8 MB | 22,1 MB |
| Pico de RSS | 289,8 MB | 227,9 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,092 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de sintesis dividido por la duracion del audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU. En GPU, el grafo fp32 ocupa 76,8 MB y el int8 22,1 MB, por lo que cabria en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: no se especifican; cualquier GPU moderna puede ejecutar la version ONNX, aunque el modelo esta optimizado para CPU.
- Cabe en GPU de consumo: si, en cualquier RTX o equivalente; tambien en CPU sin GPU dedicada.
- Memoria RAM: pico de RSS de 289,8 MB en fp32 y 227,9 MB en int8.
- Opciones de despliegue: phoonnx (pip install --pre phoonnx) con espeak-ng instalado, o el plugin ovos-tts-plugin-phoonnx para OVOS. La inferencia se realiza con onnxruntime.
- Latencia y throughput: RTF de 0,039 en fp32 y 0,092 en int8 con 4 hilos en un i9-11900H; es decir, sintetiza audio entre 10 y 25 veces mas rapido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Hablantes | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-mr_in-google-medium-espeak | marati (mr-IN) | VITS (Piper) | 76,8 MB fp32 / 22,1 MB int8 | 9 | CC BY-SA 4.0 | ONNX |
| rhasspy/piper-voices (mr_IN google medium) | marati (mr-IN) | VITS (Piper) | no disponible en la informacion | 9 | CC BY-SA 4.0 | Piper (ONNX upstream) |
| Otras voces Piper de piper-voices | varios | VITS (Piper) | variable segun voz | variable | variable (a menudo CC BY-SA 4.0) | ONNX |

No se dispone de datos comparativos de calidad (MOS, WER) entre estas alternativas en la informacion proporcionada. La principal diferencia frente al modelo upstream es el empaquetado para phoonnx y la inclusion de copias int8 verificadas.

## Limitaciones y advertencias

- Modelo exclusivamente TTS en marati; no procesa otros idiomas ni tareas de texto, codigo o razonamiento.
- La fonemizacion depende de espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se han publicado evaluaciones de calidad perceptual (MOS) ni de inteligibilidad mediante ASR; la QA se limita a comprobaciones de longitud y silencio sobre tres frases.
- Los datos de entrenamiento no estan registrados upstream (numero de horas, composicion exacta del corpus), lo que limita la trazabilidad.
- Riesgo de sesgos y de cobertura limitada de vocabulario y nombres propios, derivado del corpus OpenSLR 64 y del modelo base en ingles.
- La licencia CC BY-SA 4.0 exige atribucion a Rhasspy y compartir bajo la misma licencia las obras derivadas; es necesario revisar las implicaciones para uso comercial.
- El modelo no incluye checkpoint de entrenamiento en el repositorio, solo los grafos ONNX.
- La cuantizacion int8 reduce el tamano y la memoria, pero aumenta el RTF (0,092 frente a 0,039) y puede degradar ligeramente la calidad; el autor solo garantiza que el audio no es silencioso y que la longitud queda entre 0,8 y 1,25 veces la de fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-mr_in-google-medium-espeak
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/mr/mr_IN/google/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Corpus de entrenamiento: https://openslr.org/64/
