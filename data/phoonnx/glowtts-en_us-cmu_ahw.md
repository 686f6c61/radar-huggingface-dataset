# Phoonnx/glowtts-en_us-cmu_ahw

## Resumen

glowtts-en_us-cmu_ahw es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente entrenado por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo genera espectrogramas mel a partir de fonemas IPA del ingles estadounidense (en-US) y delega la sintesis de forma de onda en un vocoder HiFi-GAN externo (hifigan-multi-vctk-small), que phoonnx descarga junto con la voz.

Se trata de un modelo de voz concreta ("cmu_ahw"), no de un modelo de lenguaje generativo: su funcion es convertir texto normalizado y fonemizado en audio inteligible. El front-end de texto lo aporta la libreria scriptconv mediante el fonemizador gruut, que transforma la entrada en la secuencia de fonemas IPA que espera el modelo.

Su relevancia practica es la de un componente ligero y desplegable en local para asistentes de voz y sistemas embebidos: el repositorio ocupa aproximadamente 0,1 GB, se distribuye en ONNX y se integra en el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx. No es un modelo comparable a los TTS neuronales de gran escala actuales en naturalidad, sino una pieza de infraestructura de voz de bajo coste y ejecucion offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow sobre espectrogramas mel) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (en-US) |
| Licencia | other (sin licencia registrada en la model card; consultar el release upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de ejecucion | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que modela directamente la distribucion de espectrogramas mel condicionada a la secuencia de fonemas, sin necesidad de un modelo de alineamiento externo ni de atencion autorregresiva. Esto permite una sintesis paralela y rapida, adecuada para entornos con recursos limitados. La salida del modelo es un espectrograma mel que posteriormente se convierte en audio mediante el vocoder HiFi-GAN.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de ajuste fino con preferencias humanas. El modelo procede del release v1.0 de Larynx de Rhasspy, que entrena voces sobre corpus publicos; en este caso el identificador "cmu_ahw" sugiere una voz derivada de un corpus de CMU, aunque la model card no lo detalla. Phoonnx se limita a empaquetar los pesos originales en ONNX y a asociarles el vocoder y el front-end de texto; no documenta reentrenamiento ni modificacion de los pesos.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, con salida en fichero WAV mediante la API `synthesize_wav`.
- Fonemizacion de entrada mediante gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`), con normalizacion y conversion de texto previas.
- Generacion de espectrogramas mel que se convierten a audio con el vocoder HiFi-GAN multi-VCTK small.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable desde `mycroft.conf`.
- Ejecucion en local sobre ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento: es exclusivamente un modelo TTS.
- Cobertura limitada a una unica voz y a un unico idioma (en-US).

## Casos de uso

- Asistentes de voz en local: el modelo se integra en OVOS como modulo TTS y permite que un asistente domotico responda por voz sin enviar texto a servicios externos, gracias a la ejecucion ONNX y al reducido tamano del repositorio.
- Sistemas embebidos y dispositivos de bajo consumo: al ocupar aproximadamente 0,1 GB y ejecutarse sobre ONNX, es viable en Raspberry Pi y hardware similar donde un TTS de gran escala no cabria.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en ingles (avisos de sistemas, recordatorios, estados de dispositivos) con latencia baja por la generacion paralela de Glow-TTS.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de voz en aplicaciones de escritorio, usando la API de phoonnx y el vocoder asociado.
- Prototipado de pipelines de voz: banco de pruebas para evaluar el front-end gruut, la fonemizacion IPA y la cadena espectrograma-vocoder antes de migrar a un TTS de mayor calidad.
- Generacion de audio para pruebas automatizadas: produccion de ficheros WAV de referencia en ingles para tests de integracion de sistemas de reconocimiento de voz o de dialogos.
- Investigacion en TTS ligero: comparacion de la calidad de Glow-TTS con HiFi-GAN frente a modelos de difusion o autorregresivos en condiciones de recursos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) el modelo es ligero, pero no se documenta el consumo real.
- GPU recomendadas: no disponible. Al ejecutarse en ONNX, puede correr en CPU y en GPU consumer, pero no hay cifras oficiales.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano reducido, aunque no se confirma en la model card.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y runtime ONNX subyacente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_ahw (este) | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Empaquetado para phoonnx/OVOS |
| Otras voces Glow-TTS de la coleccion Phoonnx | Glow-TTS + HiFi-GAN | en-US y otros | ONNX | other | Mismo pipeline, distinta voz o idioma |
| Modelos Larynx originales (Rhasspy) | Glow-TTS | Multiples idiomas | Tar/TFLite | Segun release upstream | Origen del modelo, sin empaquetado ONNX |
| TTS neuronales de gran escala (p. ej. familias tipo VITS o difusion) | VITS, difusion, autorregresivos | Multiples | Safetensors/ONNX | Variables | Mayor naturalidad, mayor coste computacional |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia: la model card indica "other" y afirma explicitamente que no hay licencia registrada; es obligatorio revisar el release upstream de Rhasspy antes de cualquier uso, incluido el comercial.
- Cobertura linguistica: solo en-US; el texto en otros idiomas o con pronunciacion no inglesa producira resultados incorrectos.
- Voz unica: no hay variacion de hablante ni control de estilo, emocion o prosodia mas alla de lo que permita el texto de entrada.
- Calidad: al ser un Glow-TTS con vocoder HiFi-GAN small, la naturalidad es inferior a la de los TTS neuronales actuales; puede presentar artefactos en frases largas o con fonemas poco frecuentes.
- Dependencia del front-end: la calidad depende de la fonemizacion de gruut y de la normalizacion de scriptconv; errores en esa etapa degradan el audio.
- Riesgo de alucinacion acustica: como todo TTS, puede generar pronunciaciones erroneas o audio ininteligible ante entradas fuera de distribucion (siglas, numeros, nombres propios).
- Sesgos: no documentados; al entrenarse sobre un corpus concreto, la voz refleja las caracteristicas del hablante y del corpus de origen.
- Produccion: sin benchmarks publicados, sin garantias de licencia y con muy poca adopcion (31 descargas, 0 likes) en el momento de la consulta; conviene validar la calidad y los terminos legales antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_ahw
- Release upstream (Larynx v1.0, Rhasspy): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_ahw-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
