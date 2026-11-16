# Phoonnx/vits-hr_hr-cv-graphemes

## Resumen

`vits-hr_hr-cv-graphemes` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su biblioteca de inferencia ONNX. El modelo convierte texto en croata (`hr-HR`) a audio, utilizando una entrada puramente a nivel de grafemas (caracteres) sin capa de fonemizacion intermedia. Forma parte de la coleccion de modelos VITS que Phoonnx distribuye para su ecosistema de TTS.

El modelo resuelve la necesidad de sintesis de voz en croata dentro de entornos de asistencia por voz como OVOS (Open Voice OS), donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. Su empaquetado en formato ONNX facilita el despliegue en produccion sin depender del framework original de Coqui TTS, reduciendo la huella de dependencias y permitiendo inferencia optimizada.

La relevancia actual del modelo radica en su licencia permisiva (BSD-3-Clause) y su integracion con un pipeline de TTS completo y mantenido. No obstante, se trata de un modelo de nicho: un unico idioma, un unico hablante presumiblemente, y un volumen de descargas muy bajo (17 descargas, 0 likes en el momento de la consulta), lo que sugiere un uso limitado y poca validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | croata (`hr`, `hr-HR`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | grafemas (caracteres) via `GraphemePhonemizer` de scriptconv |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador basado en flujos normalizadores y un discriminador adversarial multi-periodo, entrenados conjuntamente con una perdida de reconstruccion, una perdida adversarial y una perdida de alineamiento monotono (MAS). Este diseno permite generar audio de forma directa desde texto sin necesidad de un vocoder separado, produciendo waveforms a nivel de muestra.

El modelo original fue entrenado por Coqui sobre el corpus Common Voice en croata, segun se desprende de la nomenclatura `hr-cv-vits` y de la tabla de licencias de Coqui TTS. No se dispone de informacion sobre el numero exacto de horas de audio, el numero de hablantes ni los detalles del proceso de entrenamiento (si hubo fine-tuning, aumento de datos o ajuste de hiperparametros). La innovacion principal del empaquetado de Phoonnx es la conversion a ONNX y la integracion de un front-end de texto basado en grafemas, que evita la necesidad de un fonemizador especifico del idioma y delega la normalizacion en la libreria `scriptconv`.

## Capacidades

- Sintesis de voz a partir de texto en croata (`hr-HR`).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en grafemas: el texto se normaliza y convierte directamente a caracteres, sin fonemizacion linguistica.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia via ONNX, lo que permite ejecucion en CPU y GPU sin dependencias del framework Coqui TTS.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al croata.

## Casos de uso

- Asistentes de voz en croata: el modelo puede integrarse en OVOS como motor TTS para leer respuestas del asistente en `hr-HR`, gracias al plugin nativo y a la configuracion via `mycroft.conf`.
- Lectura de notificaciones y alertas: en sistemas de domotica o monitorizacion, el modelo puede sintetizar mensajes cortos en croata para anuncios por voz, con latencia baja al ejecutarse en ONNX.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en croata para lectores de pantalla o aplicaciones de lectura de documentos, aprovechando la licencia BSD-3-Clause para uso comercial.
- Generacion de audiolibros o contenido narrado: sintesis de parrafos largos en croata para producir audio bajo demanda, aunque la calidad y naturalidad no estan documentadas.
- Pruebas de integracion en pipelines de TTS: el modelo sirve como referencia para validar el funcionamiento de phoonnx y scriptconv en un idioma concreto, util para desarrolladores que evaluan la biblioteca.
- Prototipado de aplicaciones de voz en croata: al ser un modelo pequeno (0,1 GB) y con licencia permisiva, es adecuado para pruebas de concepto y demos sin coste de licencia.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones de texto croata para herramientas de aprendizaje, aunque la falta de fonemizacion puede limitar la precision en palabras irregulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en cualquier GPU consumer con varios GB de VRAM, pero no se confirman cifras exactas.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU moderna (RTX 3060 o superior, A100, H100) deberia ser suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio (0,1 GB), aunque no se especifica.
- Opciones de despliegue: phoonnx (Python y OVOS), inferencia ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-hr_hr-cv-graphemes` | Croata (`hr-HR`) | VITS | BSD-3-Clause | ONNX | Hugging Face, phoonnx |
| Coqui TTS `tts_models--hr--cv--vits` | Croata (`hr-HR`) | VITS | BSD-3-Clause | PyTorch (upstream) | GitHub Coqui TTS |
| Otros modelos VITS de la coleccion Phoonnx | Multiples idiomas | VITS | Segun modelo | ONNX | Hugging Face (coleccion Phoonnx) |

La comparativa directa con alternativas de la misma categoria (TTS en croata) es limitada: no se dispone de datos de rendimiento ni de otros modelos comparables documentados en la informacion proporcionada. El modelo upstream de Coqui es funcionalmente equivalente, pero requiere el framework original; el empaquetado de Phoonnx anade portabilidad ONNX e integracion con OVOS.

## Limitaciones y advertencias

- Modelo de un unico idioma (croata); no soporta otros idiomas ni cambio de voz.
- Entrada basada en grafemas: puede producir pronunciaciones incorrectas en palabras con ortografia irregular o prestamos linguisticos, al no haber fonemizacion linguistica.
- No se documentan sesgos especificos, pero al entrenarse sobre Common Voice (corpus de voluntarios) puede reflejar sesgos de acento, genero o edad de los hablantes del corpus.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero puede generar artefactos acusticos o pronunciaciones erroneas en texto fuera de dominio.
- No hay informacion sobre la calidad subjetiva (MOS) ni sobre la inteligibilidad en condiciones de ruido.
- Licencia BSD-3-Clause permisiva para uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento (Common Voice) y las condiciones de la licencia upstream de Coqui.
- Volumen de descargas muy bajo (17) y sin likes, lo que sugiere poca validacion comunitaria; no se recomienda para produccion critica sin evaluacion previa.
- No se documentan limitaciones de longitud de texto; el rendimiento en textos largos no esta verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hr_hr-cv-graphemes
- Repositorio upstream (Coqui TTS): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--hr--cv--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Proyecto OVOS: https://github.com/OpenVoiceOS (referenciado indirectamente via el plugin `ovos-tts-plugin-phoonnx`)
