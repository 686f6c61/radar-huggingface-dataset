# Phoonnx/arktts-multi-audio8_preview-0.6b-unicode

## Resumen

arktts-multi-audio8_preview-0.6b-unicode es un modelo de sintesis de voz (text-to-speech) empaquetado por Phoonnx a partir del modelo original Audio8/Audio8-TTS-Preview-0.6b, desarrollado por Audio8. El paquete adapta los pesos al formato ONNX para su uso con phoonnx, la libreria de TTS en Python de TigreGotico, lo que facilita su integracion en aplicaciones y en el ecosistema de asistentes de voz OVOS. El modelo tiene aproximadamente 0,6 mil millones de parametros, segun indica el nombre, y utiliza la arquitectura ArkTTS.

El modelo cubre once idiomas (aleman, ingles, espanol, frances, italiano, japones, coreano, neerlandes, polaco, chino cantonés y chino mandarin) con voces predefinidas por idioma. La entrada de texto se realiza mediante puntos de codigo Unicode, gestionados por el fonemizador `UnicodeCodepointPhonemizer` de la libreria scriptconv. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

Su relevancia radica en que ofrece una via de despliegue ligera y estandarizada (ONNX) para un modelo TTS multilingue de tamano contenido, con integracion directa en pipelines de voz open source y en asistentes tipo OVOS. No obstante, se trata de una version "preview" del modelo subyacente, por lo que su madurez y calidad final pueden estar sujetas a cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ArkTTS |
| Parametros totales | 0,6 mil millones (segun nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo TTS; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se detallan variantes de cuantizacion) |
| Idiomas soportados | de-DE, en-US, es-ES, fr-FR, it-IT, ja-JP, ko-KR, nl-NL, pl-PL, yue-HK, zh-CN |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La informacion proporcionada identifica la arquitectura como ArkTTS, pero no detalla su estructura interna (tipo de encoder, decoder, vocoder o mecanismo de atencion). El modelo es un empaquetado ONNX del modelo original Audio8/Audio8-TTS-Preview-0.6b, cuyo entrenamiento no se describe en la model card disponible: no se indican el numero de tokens de audio, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otros ajustes.

La innovacion destacable del empaquetado es el front-end de texto: phoonnx delega la normalizacion y conversion en scriptconv, que utiliza `UnicodeCodepointPhonemizer` para transformar el texto en puntos de codigo Unicode como entrada del modelo. El repositorio ocupa 1,8 GB e incluye multiples voces (audio8-antton y audio8-maider) para cada uno de los once idiomas.

## Capacidades

- Sintesis de voz (text-to-speech) en once idiomas: aleman, ingles, espanol, frances, italiano, japones, coreano, neerlandes, polaco, cantonés y mandarin.
- Multiples voces por idioma: las voces `audio8-antton` y `audio8-maider` estan disponibles para cada lengua soportada.
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Entrada de texto basada en puntos de codigo Unicode, con normalizacion previa mediante scriptconv.
- Integracion con asistentes de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni razonamiento; es un modelo exclusivamente de sintesis de voz.

## Casos de uso

- Asistentes de voz para el hogar: integracion en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf` para respuestas habladas en cualquiera de los once idiomas soportados.
- Lectura de contenido en aplicaciones: conversion de articulos, notificaciones o mensajes a audio WAV con `synthesize_wav`, aprovechando el soporte multilingue para usuarios de distintas regiones.
- Sistemas de atencion al cliente con respuesta hablada: generacion de respuestas de voz en espanol (es-ES), ingles (en-US) o aleman (de-DE) dentro de flujos de IVR o chatbots telefonicos.
- Accesibilidad: sintesis de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, con voces seleccionables por idioma.
- Localizacion de contenido multimedia: generacion de pistas de voz para videos o tutoriales en multiples idiomas usando las voces antón y maider.
- Prototipado rapido en Python: uso de la libreria phoonnx para generar audio en scripts y pipelines de datos sin depender de servicios en la nube, gracias al formato ONNX y a la licencia Apache 2.0.
- Dispositivos embebidos o entornos con recursos limitados: al ser un modelo de 0,6 mil millones de parametros en ONNX, puede desplegarse en hardware modesto comparado con modelos TTS de mayor tamano, aunque no se publican requisitos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 0,6 mil millones de parametros en ONNX suele requerir del orden de 1,5 a 2,5 GB en FP32 y aproximadamente 0,6 a 1,2 GB en FP16, aunque esta estimacion no la confirma el autor.
- GPU recomendadas: no disponible. No se especifican modelos de GPU probados.
- Compatibilidad con GPU de consumo: probable en tarjetas con 4 GB o mas de VRAM, dado el tamano del repositorio (1,8 GB), pero no confirmado por el autor.
- Opciones de despliegue: phoonnx (Python), con integracion en OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables de otros modelos TTS en la informacion proporcionada. Se indica "no disponible" para los campos de comparacion.

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| arktts-multi-audio8_preview-0.6b-unicode | 0,6 B (segun nombre) | 11 | Apache 2.0 | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Version "preview": el modelo subyacente (Audio8-TTS-Preview-0.6b) es una version preliminar, por lo que la calidad y estabilidad pueden cambiar en futuras versiones.
- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un modelo entrenado con datos no descritos, puede reproducir sesgos de pronunciacion o entonacion segun el idioma y la voz.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir pronunciaciones incorrectas o artefactos de audio en textos atipicos, nombres propios o simbolos no normalizados correctamente.
- Limitaciones de idioma: aunque cubre once idiomas, no se detalla la calidad relativa por idioma; el espanol soportado es es-ES, sin variantes regionales documentadas.
- Dependencia del front-end: la calidad final depende de scriptconv y del fonemizador Unicode; textos con caracteres especiales o formatos numericos pueden requerir normalizacion adicional.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo original Audio8/Audio8-TTS-Preview-0.6b, ya que el empaquetado hereda la declaracion del upstream.
- Despliegue: la libreria phoonnx se instala con `pip install --pre phoonnx`, lo que indica que se trata de una version preliminar de la propia libreria; no se documentan opciones de despliegue en servidores de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/arktts-multi-audio8_preview-0.6b-unicode
- Modelo original: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion ArkTTS: https://huggingface.co/collections/Phoonnx/arktts-6af8ecb42519118a34f330f3
