# Phoonnx/vits-en_us-hifi_tts_92-medium-espeak

## Resumen

vits-en_us-hifi_tts_92-medium-espeak es una voz de sintesis de voz (text-to-speech) en ingles estadounidense basada en la arquitectura VITS, publicada por Phoonnx (TigreGotico Lda) como conversion a formato ONNX de la voz original `en_US/hifi_tts_92/medium` del repositorio `rhasspy/piper-voices`. No es un modelo de lenguaje, sino un modelo acustico de sintesis neuronal que transforma fonemas IPA (obtenidos mediante espeak-ng, voz `en-us`) en audio de onda a 22050 Hz. Su relevancia practica radica en que ofrece sintesis de voz ligera (grafo fp32 de 63,2 MB, int8 de 18,7 MB) que se ejecuta en CPU con un factor de tiempo real (RTF) de 0,038 en fp32 y 0,087 en int8 sobre un Intel Core i9-11900H.

El modelo deriva del dataset Hi-Fi Multi-Speaker English TTS Dataset (OpenSLR 109, NVIDIA Corporation), entrenado desde cero por Rhasspy con el pipeline de Piper (version 1.5 o superior) y publicado bajo licencia CC BY 4.0. La conversion a ONNX no altera los pesos; la variante int8 los cuantiza dinamicamente con onnxruntime. Esta pensado para integrarse en el ecosistema phoonnx y en asistentes OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

Su valor diferencial es el tamano reducido y la ausencia de dependencia de GPU: cabe en cualquier maquina y permite sintesis local de baja latencia. La contrapartida es que solo habla ingles estadounidense, tiene una unica voz y su calidad esta acotada por el diseno de Piper (orientado a eficiencia, no a naturalidad maxima).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 (cuantizacion dinamica QInt8 via onnxruntime) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Fonemizador | espeak-ng, voz `en-us` |
| Puntuacion de clausula | `, . ! ? : ;` (preservada desde phoonnx 1.96.1a1) |
| Tamano del repo | 0,1 GB |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 256,7 MB (fp32) / 219,5 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,038 (fp32) / 0,087 (int8) |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un normalizing flow y un decoder generativo basado en HiFi-GAN, entrenado con perdidas adversariales y de reconstruccion. En esta ficha, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que simplifica el frontend y hace el modelo dependiente del fonemizador. La voz original fue entrenada por Rhasspy desde cero con el pipeline de Piper (version 1.5 o superior), con inicializacion MRD y SDP, y sustituye a la voz `lessac` como base de finetuning.

Los datos de entrenamiento proceden del Hi-Fi Multi-Speaker English TTS Dataset (OpenSLR 109, NVIDIA Corporation, CC BY 4.0). La model card indica que la hablante Cori Samuel es britanica, pero la base se entreno con fonemas `en-us`, por lo que sin finetuning pronuncia vocales britanicas (palabras BATH como "after" o "ask") con simbolos foneticos estadounidenses; un finetuning en `en_US` de 0,9 horas corrige esta discrepancia. Los diptongos ingleses se fusionan en ids unicos (`aɪ`, `aʊ`, `eɪ`, `oʊ`, `ɔɪ`) y los finetunes deben usar los mismos clusters. La conversion a ONNX realizada por TigreGotico no modifica los pesos; las copias int8 aplican `onnxruntime.quantization.quantize_dynamic` con pesos QInt8 (onnxruntime 1.32.0).

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, con fonemizacion previa mediante espeak-ng (voz `en-us`).
- Generacion de audio WAV mono a 22050 Hz, con una unica voz (hablante unico).
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) para modelar pausas y prosodia desde phoonnx 1.96.1a1.
- Ejecucion en CPU sin GPU, con grafos ONNX ligeros (18,7 MB en int8).
- Integracion con el ecosistema phoonnx (`TTSModelManager`, `synthesize_wav`) y con asistentes OVOS mediante `ovos-tts-plugin-phoonnx`.
- Soporte de cuantizacion int8 dinamica con calidad verificada (WER identico al fp32 en la puerta de calidad del autor).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni capacidades multilingues; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS: la voz se selecciona en `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx` y sintetiza respuestas en tiempo real en CPU, sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o domotica: el RTF de 0,038 en fp32 permite generar frases cortas en decenas de milisegundos, adecuado para avisos interactivos.
- Generacion de audiolibros o podcasts automatizados en ingles: la preservacion de puntuacion de clausula mejora la prosodia en parrafos largos; la licencia CC BY 4.0 permite uso comercial con atribucion.
- Sistemas de accesibilidad (lectores de pantalla, conversion de texto a voz para personas con discapacidad visual): el bajo consumo de memoria (219,5 MB de RSS en int8) permite ejecutarlo en equipos modestos.
- Pruebas de regresion y CI/CD de pipelines TTS: el modelo sirve como referencia ligera para validar fonemizacion, sintesis y calidad acustica en entornos automatizados.
- Prototipado de interfaces conversacionales en ingles: integracion rapida en Python con phoonnx para validar flujos de voz antes de invertir en modelos TTS de mayor calidad.
- Generacion de voces para videojuegos o demos en ingles estadounidense: una sola voz, pero suficiente para narracion de tutoriales o mensajes del sistema.

## Benchmarks y rendimiento

La model card incluye una evaluacion de calidad (QA) con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,069 | 0,069 |
| Caracteres por segundo | 13,9 a 19,1 | no disponible |
| Longitud int8 / fp32 | no aplica | 1,03 a 1,06 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 256,7 MB | 219,5 MB |
| RTF (mediana de 3, 4 hilos) | 0,038 | 0,087 |

Medido en un Intel Core i9-11900H a 2,50 GHz. RTF es tiempo de sintesis dividido por duracion del audio. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. Memoria RAM estimada: 256,7 MB de pico (fp32) y 219,5 MB (int8).
- GPU recomendadas: no aplica; funciona en CPU. Si se desea aceleracion, cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, pero no es necesario.
- Cabe en cualquier GPU de consumo y en equipos sin GPU; el grafo int8 de 18,7 MB es apto para dispositivos de borde.
- Opciones de despliegue: phoonnx (libreria nativa), ONNX Runtime, y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo TTS).
- Latencia y throughput: RTF de 0,038 en fp32 y 0,087 en int8 con 4 hilos, es decir, sintesis entre 11 y 26 veces mas rapida que tiempo real en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-en_us-hifi_tts_92-medium-espeak (este) | VITS (Piper) | no disponible | no aplica | en-US | CC BY 4.0 | ONNX |
| rhasspy/piper-voices (voz original en_US-hifi_tts_92-medium) | VITS (Piper) | no disponible | no aplica | en-US | CC BY 4.0 | Piper (ONNX upstream) |
| Otras voces Piper en_US (p. ej., lessac) | VITS (Piper) | no disponible | no aplica | en-US | CC BY 4.0 | ONNX |
| Modelos TTS neuronales de mayor tamano (p. ej., VITS multi-hablante) | VITS / variantes | no disponible | no aplica | multi | variable | variable |

La comparativa se limita a la familia Piper porque no se dispone de datos de benchmarks de otros modelos TTS en la informacion proporcionada. La diferencia clave frente a la voz original es el empaquetado ONNX para phoonnx y la disponibilidad de copias int8 con calidad verificada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense; no es multilingue.
- Una unica voz (hablante unico); no permite seleccion de hablante ni clonacion.
- La voz base tiene acento britanico subyacente (hablante Cori Samuel) y puede pronunciar vocales BATH de forma no estadounidense sin finetuning.
- Depende de espeak-ng para la fonemizacion; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o nombres propios, derivado del fonemizador y no del modelo acustico.
- No es un modelo de lenguaje: no razona, no genera texto ni soporta tool calling; cualquier expectativa en ese sentido es un error de uso.
- Licencia CC BY 4.0: permite uso comercial con atribucion a Rhasspy (entrenamiento original) y a TigreGotico Lda (conversion ONNX).
- La evaluacion de calidad se basa en solo 3 frases de FLORES-200 devtest; la cobertura estadistica es limitada.
- El modelo base y los datos de entrenamiento exactos no estan registrados upstream; la trazabilidad es parcial.
- No se han publicado benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hifi_tts_92-medium-espeak
- Modelo upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_US/hifi_tts_92/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset Hi-Fi TTS (OpenSLR 109): https://www.openslr.org/109/
