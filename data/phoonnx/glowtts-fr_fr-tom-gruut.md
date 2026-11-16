# Phoonnx/glowtts-fr_fr-tom-gruut

## Resumen

glowtts-fr_fr-tom-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. El modelo genera voz en frances de Francia (fr-FR) a partir de texto, produciendo un espectrograma que posteriormente se convierte en audio mediante el vocoder hifigan-multi-vctk-small. El repositorio ocupa aproximadamente 0,1 GB y esta pensado para inferencia ligera en Python y en el ecosistema OVOS (Open Voice OS).

La relevancia de este modelo radica en su caracter practico: es un componente listo para produccion dentro de un pipeline TTS completo, con un front-end fonemico basado en gruut y el alfabeto IPA. No es un modelo de lenguaje generativo, sino un sistema acustico especializado que convierte fonemas en espectrogramas. Su tamano reducido y su formato ONNX lo hacen adecuado para despliegues en entornos con recursos limitados, como asistentes de voz embebidos o sistemas de domotica.

El modelo se distribuye bajo licencia "other" segun Hugging Face, sin que la model card registre una licencia concreta, y remite al release upstream de Larynx para verificar las condiciones de uso. Cuenta con 21 descargas y ningun "like" en el momento de la consulta, lo que indica una adopcion muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | frances de Francia (fr-FR) |
| Licencia | other (sin licencia concreta registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz de tipo flow-based que aprende una correspondencia entre secuencias de fonemas y espectrogramas mel mediante normalizing flows y alineamiento monotono sin necesidad de atencion autoregresiva. La arquitectura permite una sintesis rapida y paralela, en contraste con los modelos TTS autoregresivos clasicos. En este caso, el modelo acustico se combina con el vocoder HiFi-GAN (variante multi-VCTK small), que transforma el espectrograma en forma de onda de audio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o ajuste fino especifico. El modelo procede del release v1.0 de Larynx de Rhasspy, un proyecto orientado a voces de calidad para asistentes de voz. La innovacion principal del empaquetado de Phoonnx es la conversion a ONNX y la integracion con la libreria phoonnx, que gestiona la descarga del vocoder, la normalizacion de texto mediante scriptconv y la fonemizacion con gruut.

## Capacidades

- Sintesis de voz en frances de Francia (fr-FR) a partir de texto escrito.
- Conversion de texto a fonemas IPA mediante el fonemizador GruutPhonemizer de scriptconv.
- Generacion de espectrogramas que se transforman en audio mediante el vocoder HiFi-GAN.
- Integracion con la libreria phoonnx para Python y con el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Seleccion de voz mediante el identificador `larynx/fr-fr-tom-glow_tts`.
- Salida de audio en formato WAV mediante la API `synthesize_wav`.
- No soporta tool calling, agentes, razonamiento multi-paso ni vision: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en OVOS o en sistemas de domotica para leer respuestas en frances con un consumo de recursos reducido, gracias a su tamano de 0,1 GB y su formato ONNX.
- Lectura de notificaciones y alertas: en aplicaciones de monitorizacion o sistemas de mensajeria, el modelo sintetiza mensajes cortos en fr-FR de forma rapida y paralela, sin necesidad de infraestructura GPU dedicada.
- Accesibilidad para personas con discapacidad visual: conversion de texto de interfaces, documentos o correos electronicos a voz en frances, integrable en lectores de pantalla mediante la API de phoonnx.
- Generacion de audiolibros o contenido narrado de forma automatizada: el pipeline texto-fonema-espectrograma-audio permite procesar lotes de texto y generar archivos WAV de forma programatica.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz francesa para pruebas de concepto pueden desplegar el modelo en local con `pip install --pre phoonnx "scriptconv[gruut]"` sin depender de servicios en la nube.
- Sistemas de anuncios publicos o kioscos interactivos: sintesis de mensajes dinamicos en frances en entornos con hardware modesto, aprovechando la inferencia ONNX y el vocoder ligero.
- Investigacion en TTS: como referencia reproducible de Glow-TTS en frances para comparar con otros modelos acusticos o vocoders dentro de experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) y la naturaleza ONNX del modelo, es probable que la inferencia quepa en CPU y en GPUs de gama baja, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y el tamano reducido sugieren que podria ejecutarse en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: libreria phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, y ejecucion via ONNX Runtime de forma implicita.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| glowtts-fr_fr-tom-gruut | Glow-TTS + HiFi-GAN | fr-FR | ONNX | other | fonemas gruut (IPA) |
| Otros modelos de la coleccion Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | other | fonemas gruut (IPA) |
| Modelos TTS de Rhasspy Larynx (upstream) | Glow-TTS | varios | tar.gz (formato original) | ver upstream | fonemas |

No se dispone de datos de rendimiento ni de comparativas cuantitativas con otros modelos TTS en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia figura como "other" y la model card indica que no hay licencia registrada; es imprescindible verificar el release upstream de Larynx antes de cualquier uso comercial.
- El modelo solo soporta frances de Francia (fr-FR); no cubre otros idiomas ni variantes regionales.
- La entrada debe ser texto normalizado y fonemizado con gruut; un texto mal formateado o con caracteres no soportados puede degradar la sintesis.
- Al ser un modelo TTS y no un LLM, no razona, no sigue instrucciones complejas y no mantiene contexto conversacional.
- No se dispone de informacion sobre sesgos, calidad de voz en dominios especificos, robustez ante ruido o errores de pronunciacion.
- La calidad final depende del vocoder hifigan-multi-vctk-small, que se descarga junto con la voz; su rendimiento en fr-FR no esta documentado en la informacion disponible.
- El numero de descargas (21) y la ausencia de "likes" sugieren una validacion comunitaria muy limitada; conviene probar el modelo en el caso de uso concreto antes de llevarlo a produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-fr_fr-tom-gruut
- Upstream Larynx (release v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/fr-fr_tom-glow_tts.tar.gz
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
