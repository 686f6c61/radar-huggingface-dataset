# Phoonnx/glowtts-en_us-mary_ann-gruut

## Resumen

Glow-TTS en_us-mary_ann-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. El modelo convierte texto en ingles estadounidense, representado como fonemas gruut en alfabeto IPA, en un espectrograma que posteriormente se transforma en audio mediante el vocoder HiFi-GAN multi-VCTK small.

Se trata de un modelo compacto (el repositorio completo ocupa aproximadamente 0,1 GB, incluyendo pesos y metadatos) orientado a sintesis de voz ligera y despliegue local. Su relevancia actual radica en que permite integrar TTS de calidad razonable en asistentes de voz y sistemas embebidos sin dependencias de servicios en la nube, especialmente dentro del ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx.

La ficha se basa exclusivamente en la informacion disponible en la model card y en los metadatos de Hugging Face; los datos tecnicos no documentados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, text-to-spectrogram) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por frase; el modelo procesa una frase en en-US por llamada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada en el modelo; consultar el release upstream de Rhasspy) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small (Phoonnx) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Glow-TTS, un modelo generativo basado en normalizing flows que mapea secuencias de fonemas a espectrogramas mel. A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS realiza la generacion de forma paralela, lo que reduce la latencia de sintesis. La alineacion entre texto y audio se aprende mediante monotonic alignment search (MAS), una tecnica que impone monotonia en el alineamiento sin necesidad de atencion autorregresiva.

El modelo original fue entrenado por Rhasspy como parte del proyecto Larynx (version 1.0) y distribuido como un archivo tar.gz en el repositorio de releases de GitHub. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino posterior. La voz se identifica como "mary_ann" y esta orientada a ingles estadounidense. El empaquetado de Phoonnx se limita a convertir los pesos a ONNX y a integrarlos en su pipeline de inferencia, que delega la normalizacion de texto y la fonemizacion en la libreria scriptconv con el fonemizador gruut.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Conversion de texto a fonemas IPA mediante gruut (a traves de scriptconv).
- Generacion de espectrogramas mel que se transforman en audio con el vocoder HiFi-GAN multi-VCTK small.
- Inferencia en formato ONNX, apta para ejecucion en CPU y entornos con recursos limitados.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Salida de audio en formato WAV mediante la API voice.synthesize_wav.
- No soporta tool calling, function calling, agentes, vision ni audio de entrada; es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS (ovos-tts-plugin-phoonnx) y permite sintetizar respuestas del asistente sin conexion a internet, seleccionando la voz larynx/en-us-mary_ann-glow_tts en mycroft.conf.
- Lectura de notificaciones y alertas en sistemas embebidos: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en dispositivos con recursos limitados (Raspberry Pi, mini-PC) para leer mensajes cortos en ingles.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz para lectores de pantalla en aplicaciones de escritorio que requieran una voz inglesa ligera y de baja latencia.
- Generacion de audiolibros o podcasts automatizados en ingles: el modelo procesa frases individuales y permite concatenar la salida WAV para producir narraciones largas.
- Pruebas y desarrollo de pipelines TTS: sirve como referencia para comparar la calidad de Glow-TTS frente a otros modelos en experimentos de sintesis de voz, gracias a su integracion con phoonnx y scriptconv.
- Prototipado de interfaces conversacionales: permite validar flujos de dialogo en ingles con retroalimentacion de voz real antes de invertir en modelos TTS de mayor tamano o servicios en la nube.
- Educacion e investigacion: util para estudiar el comportamiento de normalizing flows en TTS y la alineacion monotona, al ser un modelo abierto y reproducible en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y el formato ONNX, se espera un consumo de memoria bajo, apto para CPU.
- GPU recomendadas: no disponible; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el empaquetado ONNX sugiere que puede ejecutarse en CPU sin GPU dedicada.
- Opciones de despliegue: phoonnx (Python), OVOS mediante ovos-tts-plugin-phoonnx, y ONNX Runtime como backend subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| glowtts-en_us-mary_ann-gruut (este modelo) | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin licencia registrada) | Fonemas gruut IPA, una frase por llamada |
| Otros modelos de la coleccion Glow-TTS de Phoonnx | Glow-TTS | segun voz | ONNX | variable | Fonemas gruut IPA |
| Modelos TTS de Rhasspy Larynx originales | Glow-TTS | multiples | tar.gz (formato original) | variable | Texto con fonemizador propio |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- La licencia figura como "other" y la model card indica que no hay licencia registrada para este modelo; es imprescindible consultar el release upstream de Rhasspy antes de cualquier uso comercial.
- Al ser un modelo TTS, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o terminos tecnicos, ya que depende de la fonemizacion gruut.
- No se han documentado sesgos especificos, pero al estar entrenado con una voz concreta ("mary_ann") puede presentar limitaciones de prosodia y expresividad.
- No soporta tool calling, agentes ni razonamiento; cualquier expectativa en ese sentido es inadecuada.
- La calidad de la sintesis depende del vocoder HiFi-GAN multi-VCTK small, que puede introducir artefactos en comparacion con vocoders de mayor tamano.
- El modelo esta empaquetado para phoonnx; su uso fuera de esa libreria requiere adaptar la integracion ONNX.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que limita la evaluacion de sesgos y cobertura linguistica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-mary_ann-gruut
- Repositorio upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_mary_ann-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
