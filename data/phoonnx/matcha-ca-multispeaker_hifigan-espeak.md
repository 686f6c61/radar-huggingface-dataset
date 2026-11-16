# Phoonnx/matcha-ca-multispeaker_hifigan-espeak

## Resumen
Phoonnx/matcha-ca-multispeaker_hifigan-espeak es un modelo de sintesis de voz (text-to-speech) en catalan empaquetado en formato ONNX por Phoonnx a partir del modelo original de Projecte AINA, `projecte-aina/matxa-tts-cat-multispeaker`. El modelo resuelve la generacion de audio hablado a partir de texto en catalan con multiples voces, empleando la arquitectura Matcha-TTS (modelo acustico basado en flow matching) acoplada a un vocoder HiFi-GAN fusionado. La relevancia actual reside en que ofrece una via de despliegue ligera y portable (ONNX, ~0,1 GB de repositorio) para integrar TTS en catalan en asistentes de voz y aplicaciones locales sin depender de infraestructura en la nube.

El modelo forma parte de la coleccion de empaquetados Matcha-TTS de Phoonnx y se integra con el ecosistema OpenVoiceOS (OVOS) mediante el plugin `ovos-tts-plugin-phoonnx`. La entrada de texto se procesa mediante fonemizacion con espeak-ng en alfabeto IPA, lo que condiciona tanto la calidad de la sintesis como los requisitos de instalacion del sistema.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento en la informacion proporcionada; la ficha refleja esta ausencia de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acustico) + HiFi-GAN fusionado (vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | Catalan (ca) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Voces | Multi-hablante (multispeaker) |

## Arquitectura y entrenamiento
Matcha-TTS es una arquitectura de sintesis de voz que combina un modelo acustico basado en flow matching condicional con un decodificador de espectrogramas, seguido de un vocoder neuronal. En este empaquetado, el vocoder HiFi-GAN aparece fusionado con el modelo acustico, de modo que el pipeline completo genera forma de onda directamente a partir de la secuencia de fonemas. El modelo es multi-hablante, lo que permite seleccionar distintas voces dentro de un mismo conjunto de pesos.

La entrada no es texto crudo sino fonemas en alfabeto IPA obtenidos mediante espeak-ng; la conversion y normalizacion del texto la realiza la libreria `scriptconv` a traves de `EspeakPhonemizer`. El modelo original fue desarrollado por Projecte AINA (upstream `projecte-aina/matxa-tts-cat-multispeaker`) y Phoonnx lo ha reempaquetado en ONNX para su ejecucion con su libreria. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Sintesis de voz (text-to-speech) en catalan a partir de texto.
- Soporte multi-hablante: permite seleccionar entre varias voces del mismo modelo.
- Generacion directa de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Fonemizacion basada en espeak-ng con alfabeto IPA como interfaz de entrada.
- Integracion con el ecosistema OpenVoiceOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecucion local en formato ONNX, sin dependencia de APIs en la nube.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de vision, audio de entrada ni modo thinking.

## Casos de uso
- Asistentes de voz locales en catalan: el modelo puede integrarse en OVOS como modulo TTS para leer respuestas del asistente, seleccionando la voz adecuada entre las disponibles del conjunto multi-hablante.
- Lectura de contenido accesible: conversion de articulos, notificaciones o documentos en catalan a audio para usuarios con discapacidad visual, ejecutandose en local con un repositorio de solo 0,1 GB.
- Sistemas de navegacion o avisos por voz: sintesis de instrucciones cortas en catalan con baja latencia al ejecutarse en ONNX sin llamadas de red.
- Prototipado de aplicaciones de voz: desarrollo rapido de interfaces conversacionales en catalan usando `phoonnx` y `scriptconv` como base, sin necesidad de entrenar un modelo propio.
- Generacion de audiolibros o podcasts automatizados: sintesis de textos largos en catalan con la posibilidad de alternar entre voces multi-hablante para diferenciar narradores.
- Integracion en pipelines de CI/CD para pruebas de regresion de audio: validacion automatica de que la sintesis produce salidas correctas en cada version del modelo o del fonemizador.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones en catalan a partir de texto para materiales didacticos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en GPU consumer de gama baja o incluso en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con unos pocos GB de memoria deberia ser suficiente, aunque no hay datos confirmados.
- Cabe en GPU consumer: si, previsiblemente, dado el tamano del repositorio, aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS, y ejecucion ONNX.
- Requisito adicional: es necesario instalar espeak-ng en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak; este ultimo puede producir diferencias foneticas y errores de pronunciacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parametros | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/matcha-ca-multispeaker_hifigan-espeak | Catalan (ca) | Matcha-TTS + HiFi-GAN | no disponible | GPL-3.0 | ONNX | Hugging Face |
| projecte-aina/matxa-tts-cat-multispeaker | Catalan (ca) | Matcha-TTS + HiFi-GAN | no disponible | GPL-3.0 | no disponible | Hugging Face (upstream) |
| Otros empaquetados Matcha-TTS de Phoonnx | Segun modelo | Matcha-TTS | no disponible | Segun modelo | ONNX | Coleccion Phoonnx en Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Licencia GPL-3.0: el uso comercial implica obligaciones de copyleft; debe revisarse antes de integrarlo en productos propietarios.
- Solo soporta catalan; no es multilingue.
- La calidad depende de la fonemizacion con espeak-ng; el uso del port espyak puede provocar pronunciaciones incorrectas en algunas palabras.
- Requiere instalar espeak-ng en el sistema, lo que anade una dependencia externa al despliegue.
- Riesgo de errores de pronunciacion en palabras extranjeras, siglas o nombres propios no cubiertos por el fonemizador.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; cualquier expectativa en ese sentido es inadecuada.
- No se dispone de informacion sobre sesgos de voz, cobertura de hablantes ni calidad subjetiva (MOS) del modelo.
- El modelo es multi-hablante, pero no se detalla el numero de voces ni sus caracteristicas en la informacion disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-multispeaker_hifigan-espeak
- Modelo upstream: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
