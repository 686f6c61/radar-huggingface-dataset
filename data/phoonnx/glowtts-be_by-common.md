# Phoonnx/glowtts-be_by-common

## Resumen

glowtts-be_by-common es un modelo de sintesis de voz (text-to-speech) en bielorruso (`be-BY`) basado en la arquitectura Glow-TTS, desarrollado originalmente por Coqui a partir del corpus Common Voice y empaquetado por Phoonnx en formato ONNX para su uso con su libreria de inferencia `phoonnx`. El modelo no genera audio directamente: produce un espectrograma que posteriormente es convertido en onda de audio por el vocoder HiFi-GAN `hifigan-be_by-common`, descargado automaticamente por la libreria.

El modelo resuelve el problema de la sintesis de voz en un idioma con escasa representacion en el ecosistema TTS. Al estar empaquetado en ONNX y distribuido a traves de `phoonnx`, puede ejecutarse sin depender del framework original de Coqui TTS y se integra de forma nativa en el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

Es relevante para desarrolladores que necesiten TTS en bielorruso en entornos locales o embebidos, ya que el repositorio ocupa apenas 0,1 GB y la inferencia ONNX es ligera. La licencia CC-BY-SA 4.0 permite uso comercial con atribucion y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based, no autorregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por caracteres, no por tokens) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | bielorruso (`be-BY`) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX |
| Vocoder | HiFi-GAN (`hifigan-be_by-common`) |
| Entrada de texto | caracteres, normalizados via `GraphemePhonemizer` de scriptconv |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz no autorregresivo basado en normalizing flows. Aprende una correspondencia monotona entre el texto y el espectrograma mel mediante un alineamiento latente (Monotonic Alignment Search), lo que permite sintesis paralela y por tanto una latencia baja en comparacion con modelos autorregresivos tipo Tacotron. El modelo produce un espectrograma mel que se convierte en audio con el vocoder HiFi-GAN indicado.

El modelo original fue entrenado por Coqui sobre el corpus Common Voice en bielorruso y distribuido en su release v0.16.6 de Coqui TTS. Phoonnx lo ha convertido a ONNX y lo ha integrado en su gestor de voces bajo el identificador `coqui-be-common-voice-glow-tts`. No se dispone de informacion sobre el numero de horas de audio, el numero de pasos de entrenamiento ni la composicion exacta del dataset mas alla de su origen en Common Voice.

El front-end de texto utiliza `GraphemePhonemizer` de la libreria `scriptconv`, que normaliza el texto y lo convierte en la secuencia de entrada del modelo sin necesidad de un lexico fonetico especifico.

## Capacidades

- Sintesis de voz en bielorruso (`be-BY`) a partir de texto plano.
- Generacion de espectrogramas mel que se convierten en audio mediante el vocoder HiFi-GAN asociado.
- Normalizacion y conversion de texto de entrada mediante `GraphemePhonemizer` de scriptconv.
- Inferencia en formato ONNX, sin dependencia del framework Coqui TTS original.
- Integracion con el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Salida a fichero WAV mediante la API `synthesize_wav` de phoonnx.
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistente de voz en bielorruso con OVOS: se configura el plugin `ovos-tts-plugin-phoonnx` en `mycroft.conf` con la voz `coqui-be-common-voice-glow-tts` y el asistente sintetiza respuestas habladas de forma local.
- Lectura de contenido web o documentos en bielorruso: el modelo convierte texto plano en audio WAV mediante `synthesize_wav`, adecuado para pipelines de accesibilidad o generacion de audiolibros.
- Sistemas de navegacion o avisos por voz en bielorruso: la inferencia ONNX es ligera (repo de 0,1 GB) y puede ejecutarse en dispositivos con recursos limitados.
- Prototipado de interfaces conversacionales en bielorruso: al integrarse en Python mediante phoonnx, permite iterar rapidamente sobre dialogos sin depender de servicios en la nube.
- Generacion de avisos automatizados en entornos con conectividad limitada: al ser un modelo local en ONNX, no requiere acceso a Internet una vez descargado el vocoder.
- Investigacion en TTS para lenguas de bajos recursos: sirve como linea base Glow-TTS en bielorruso para comparar con modelos mas recientes o para fine-tuning sobre otros corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que el modelo y el vocoder caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos 2 GB de VRAM deberia ser suficiente, incluidas GTX 1050, RTX 2060, RTX 3060 o superiores.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. Al ser ONNX, tambien podria ejecutarse con ONNX Runtime directamente, aunque la model card solo documenta phoonnx.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| glowtts-be_by-common | Glow-TTS + HiFi-GAN | bielorruso | ONNX | CC-BY-SA 4.0 | caracteres |
| tts_models--be--common-voice--glow-tts (Coqui original) | Glow-TTS + HiFi-GAN | bielorruso | PyTorch (checkpoint Coqui) | CC-BY-SA 4.0 | caracteres |
| hifigan-be_by-common | HiFi-GAN (vocoder) | bielorruso | ONNX | no disponible en la informacion | espectrograma mel |
| Otros modelos Glow-TTS de la coleccion Phoonnx | Glow-TTS | varios | ONNX | segun modelo | caracteres |

La alternativa mas directa es el checkpoint original de Coqui TTS, del que este modelo deriva: misma arquitectura y mismos datos, pero en formato PyTorch y dependiente del framework Coqui. La ventaja de la version de Phoonnx es el empaquetado ONNX y la integracion con OVOS. No se dispone de informacion sobre otros modelos TTS en bielorruso comparables.

## Limitaciones y advertencias

- El modelo solo soporta bielorruso (`be-BY`); no es multilingue.
- Al derivar de Common Voice, puede heredar sesgos de representacion del corpus (variedad de hablantes, acentos y calidad de grabacion limitados).
- Riesgo de alucinacion o artefactos en la sintesis ante texto fuera de dominio, abreviaturas, numeros o caracteres no vistos durante el entrenamiento.
- La licencia CC-BY-SA 4.0 permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (share-alike).
- La model card no documenta el numero de parametros, la longitud maxima de entrada ni el rendimiento medido; estos datos deben considerarse no disponibles.
- Depende del vocoder `hifigan-be_by-common`; sin el, el espectrograma generado no se convierte en audio.
- El front-end `GraphemePhonemizer` no realiza conversion fonetica basada en lexico, lo que puede afectar a la pronunciacion de palabras irregulares.
- El modelo se distribuye en formato ONNX y esta pensado para la libreria phoonnx; su uso fuera de ese ecosistema requiere conversion o adaptacion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-be_by-common
- Vocoder HiFi-GAN asociado: https://huggingface.co/Phoonnx/hifigan-be_by-common
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Checkpoint original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.16.6/tts_models--be--common-voice--glow-tts.zip
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
