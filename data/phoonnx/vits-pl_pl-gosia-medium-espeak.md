# Phoonnx/vits-pl_pl-gosia-medium-espeak

## Resumen

vits-pl_pl-gosia-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en polaco (pl-PL) a audio inteligible utilizando fonemas del alfabeto IPA generados mediante espeak-ng. El repositorio tiene un tamano de 0,1 GB y se distribuye en formato ONNX, lo que facilita su despliegue en entornos de produccion y en dispositivos de recursos limitados.

La relevancia de este modelo radica en su caracter practico: es una voz concreta (gosia, calidad media) del catalogo de Piper, ahora accesible a traves de la libreria phoonnx y del plugin ovos-tts-plugin-phoonnx para asistentes de voz OVOS. No se trata de un modelo de lenguaje generativo ni de un sistema multimodal, sino de un componente especializado de sintesis de voz para un unico idioma.

La informacion disponible es limitada: la model card no publica detalles sobre el entrenamiento, el numero de parametros, la longitud de contexto ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables en la documentacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | pl-PL (polaco) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo basado en flujos normalizadores y un discriminador adversarial, lo que permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado. El modelo procede del catalogo rhasspy/piper-voices, en la ruta pl/pl_PL/gosia/medium, y ha sido empaquetado por Phoonnx para su ejecucion con ONNX Runtime.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de RLHF o DPO, ni innovaciones tecnicas adicionales mas alla de las propias de VITS. La model card unicamente documenta el origen upstream y el proceso de empaquetado. El front-end de texto utiliza espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`) para convertir el texto normalizado en fonemas IPA, y la normalizacion y conversion de texto se delega a la libreria scriptconv.

## Capacidades

- Sintesis de voz en polaco (pl-PL) a partir de texto escrito.
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Conversion de texto a fonemas IPA mediante espeak-ng como front-end.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de capacidades multimodales (vision, audio de entrada) ni de modo de razonamiento.
- Capacidad multilingue limitada exclusivamente al polaco.

## Casos de uso

- Asistentes de voz para el hogar: integracion en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `piper/pl_PL-gosia-medium` en `mycroft.conf` para dar respuestas habladas en polaco.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de domotica o sistemas de monitorizacion para usuarios polacos, gracias al reducido tamano del modelo (0,1 GB) y su despliegue en ONNX.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual que operen en polaco.
- Generacion de audiolibros o contenido narrado: sintesis por lotes de parrafos de texto en polaco con la API de phoonnx, procesando cada frase de forma independiente.
- Prototipado de interfaces conversacionales: uso en entornos de desarrollo para validar flujos de voz en polaco sin depender de servicios en la nube, al ejecutarse localmente con ONNX Runtime.
- Aplicaciones web con sintesis en el navegador: despliegue mediante phoonnx.js para generar voz en polaco del lado del cliente, con la demo disponible en tigregotico.pt/demo.
- Sistemas embebidos y de bajo consumo: al ser un modelo de calidad media y formato ONNX, puede ejecutarse en dispositivos con recursos limitados donde no caben modelos TTS de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida, pero no se especifica una cifra concreta.
- GPU recomendadas: no disponible. Al ejecutarse mediante ONNX Runtime, puede funcionar en CPU y en GPU compatibles con ONNX.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano del modelo, aunque no se documentan requisitos minimos.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS) y phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.
- Dependencia externa: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]` para el front-end de fonemas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. La model card unicamente referencia la coleccion de modelos VITS empaquetados para phoonnx y el catalogo upstream rhasspy/piper-voices, sin establecer comparaciones cuantitativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vits-pl_pl-gosia-medium-espeak | no disponible | no aplica | MIT | Hugging Face (Phoonnx) |
| Otras voces de rhasspy/piper-voices | no disponible | no aplica | no disponible | Hugging Face (Rhasspy) |
| Otros modelos de la coleccion VITS de Phoonnx | no disponible | no aplica | no disponible | Hugging Face (Phoonnx) |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en polaco (pl-PL); no soporta otros idiomas.
- La calidad es "medium" segun la nomenclatura de Piper; no se documentan metricas objetivas de naturalidad (MOS) ni de inteligibilidad.
- Dependencia critica de espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- No se documentan sesgos conocidos, pero al ser un modelo de voz entrenado con un dataset no especificado, pueden existir sesgos de pronunciacion o de registro.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto; el riesgo se limita a errores de pronunciacion o prosodia en palabras fuera del dominio de entrenamiento.
- La licencia MIT se hereda del upstream rhasspy/piper-voices, segun declara la model card; se recomienda verificar la licencia original antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se publican detalles sobre el dataset de entrenamiento, lo que dificulta evaluar su cobertura y sus posibles limitaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-gosia-medium-espeak
- Upstream (Piper voices, pl_PL/gosia/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/pl/pl_PL/gosia/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
