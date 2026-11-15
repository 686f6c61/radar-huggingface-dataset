# Phoonnx/vits-af_za-google_nwu-low

## Resumen

vits-af_za-google_nwu-low es un modelo de sintesis de voz (text-to-speech) de la familia VITS, originalmente desarrollado por Mycroft AI para el motor Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo esta especializado en afrikáans de Sudafrica (af-ZA) y esta pensado para generar audio a partir de texto en ese idioma con una huella de recursos reducida (variante "low").

La relevancia de este modelo radica en su caracter practico: es una voz ligera, ya convertida a ONNX, lista para desplegarse en entornos Python y en el ecosistema de asistentes de voz OVOS, sin necesidad de infraestructura de GPU pesada. Su tamano de repositorio de aproximadamente 0,1 GB y su licencia CC-BY-SA-4.0 lo hacen atractivo para proyectos de codigo abierto que necesiten una voz en afrikáans.

Se trata de un modelo de nicho, con un numero reducido de descargas (29) y sin resultados de benchmarks publicados en la informacion disponible. No obstante, cubre un idioma con poca representacion en el ecosistema TTS abierto, lo que le otorga valor para aplicaciones localizadas en Sudafrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados; variante "low") |
| Idiomas soportados | af-ZA (afrikáans) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Autor original | Mycroft AI |
| Empaquetado | Phoonnx |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado conjuntamente. VITS permite generar formas de onda directamente a partir de fonemas sin necesidad de un vocoder separado en tiempo de inferencia, lo que simplifica el despliegue.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. El modelo procede de la coleccion de voces de Mimic 3 de Mycroft AI (ruta `voices/af_ZA/google-nwu_low`), y Phoonnx lo ha reempaquetado en ONNX. La entrada de texto se procesa mediante el fonemizador `EspeakPhonemizer` de la libreria scriptconv, que convierte el texto a fonemas IPA de espeak-ng antes de alimentar el modelo.

## Capacidades

- Sintesis de voz (text-to-speech) en afrikáans (af-ZA) a partir de texto.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Normalizacion y conversion de texto a fonemas mediante scriptconv y espeak-ng.
- Integracion como plugin de TTS en el ecosistema OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No dispone de tool calling, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en afrikáans: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente domestico en afrikáans, con una configuracion minima en `mycroft.conf`.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de texto a audio para usuarios con discapacidad visual que necesiten contenido en afrikáans, aprovechando el bajo consumo de recursos del modelo.
- Sistemas de anuncios y avisos automatizados: generacion de mensajes hablados en afrikáans para transporte publico, comercios o servicios de atencion telefonica, donde la latencia y el coste de infraestructura son criticos.
- Prototipado rapido de interfaces de voz: al estar empaquetado en ONNX y disponible via pip, permite a desarrolladores integrar una voz en afrikáans en pocas lineas de Python sin entrenar modelos propios.
- Aplicaciones web con TTS en el navegador: mediante phoonnx.js se puede ofrecer sintesis de voz en afrikáans del lado del cliente, sin enviar texto a servidores externos.
- Investigacion en TTS de bajos recursos: sirve como linea base ligera para comparar y evaluar tecnicas de sintesis en idiomas con poca representacion, como el afrikáans.
- Generacion de audiolibros o contenido educativo en afrikáans: sintesis por frases con salida WAV para su posterior ensamblaje en producciones de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (~0,1 GB) y la variante "low", se espera un consumo muy reducido, apto para CPU.
- GPU recomendadas: no disponible; el modelo esta empaquetado en ONNX y orientado a ejecucion ligera, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano de los pesos, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en el navegador.
- Latencia y throughput estimados: no disponible.
- Dependencia externa: espeak-ng (o el port espyak incluido en `phoonnx[espeak]`) para la fonemizacion.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto/uso |
|---|---|---|---|---|---|
| vits-af_za-google_nwu-low (este) | af-ZA | VITS | ONNX | CC-BY-SA-4.0 | TTS ligero, integracion phoonnx/OVOS |
| Otras voces de la coleccion VITS de Phoonnx | Multiples idiomas | VITS | ONNX | Segun cada voz | TTS empaquetado para phoonnx |
| Voces originales de Mycroft Mimic 3 | Multiples idiomas | VITS y otras | Formatos propios de Mimic 3 | Segun cada voz | TTS para Mimic 3 |

No se dispone en la informacion proporcionada de datos de rendimiento (MOS, latencia, WER) que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma (afrikáans, af-ZA); no es multilingue.
- Dependencia de espeak-ng para la fonemizacion; con el port espyak algunas palabras pueden pronunciarse incorrectamente, segun advierte el autor.
- No se han publicado metricas de calidad (MOS, inteligibilidad) ni benchmarks, por lo que el rendimiento real no esta cuantificado.
- Riesgo de pronunciacion incorrecta en palabras fuera del vocabulario o con grafias atipicas.
- La licencia CC-BY-SA-4.0 exige atribucion y compartir las obras derivadas bajo la misma licencia; es preciso revisar las implicaciones para uso comercial y para la distribucion de audio generado.
- Modelo de nicho con muy pocas descargas (29) y sin comunidad consolidada; el soporte y las actualizaciones pueden ser limitados.
- No apto para tareas de razonamiento, codigo o comprension; es exclusivamente un modelo de sintesis de voz.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-af_za-google_nwu-low
- Repositorio upstream (Mycroft AI): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/af_ZA/google-nwu_low
- phoonnx (libreria): https://github.com/TigreGotico/phoonnx
- scriptconv (normalizacion y fonemizadores): https://github.com/TigreGotico/scriptconv
- phoonnx.js (TTS en navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
