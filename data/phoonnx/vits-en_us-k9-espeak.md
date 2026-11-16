# Phoonnx/vits-en_us-k9-espeak

## Resumen

vits-en_us-k9-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por hopkira en el repositorio k9_piper_voice y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en ingles estadounidense, recibiendo fonemas espeak en alfabeto IPA como entrada, en audio sintetizado. Su publicacion en Hugging Face se realizo el 16 de noviembre de 2026 y el repositorio ocupa aproximadamente 0,1 GB.

El modelo resuelve el problema de la sintesis de voz local y ligera para aplicaciones de asistencia por voz, integrandose en el ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx. Al estar exportado a formato ONNX, puede ejecutarse sin dependencias de frameworks de deep learning pesados, lo que facilita su despliegue en dispositivos con recursos limitados.

La relevancia actual del modelo radica en su caracter de recurso abierto (licencia Unlicense) y su integracion con herramientas de codigo abierto como phoonnx, scriptconv y phoonnx.js, que permiten su uso tanto en Python como en el navegador. No obstante, se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy especifico dentro del ecosistema OVOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | Unlicense |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un enfoque de sintesis de voz end-to-end que combina inferencia variacional con aprendizaje adversarial para generar audio directamente a partir de fonemas. VITS es conocida por producir voz de calidad natural con un modelo compacto, lo que explica el reducido tamano del repositorio (0,1 GB) y su idoneidad para inferencia en ONNX.

El modelo fue entrenado originalmente por hopkira en el repositorio k9_piper_voice, del que no se dispone de detalles sobre el dataset, el numero de tokens o las tecnicas de entrenamiento empleadas. La entrada del modelo son fonemas espeak en alfabeto IPA, generados por el fonemizador EspeakPhonemizer de la libreria scriptconv. No se dispone de informacion sobre el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas adicionales mas alla de la propia arquitectura VITS.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto de entrada.
- Conversion de texto a fonemas espeak en alfabeto IPA mediante scriptconv.
- Generacion de audio en formato WAV mediante la API de phoonnx.
- Integracion con OVOS a traves del plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistencia por voz en OVOS: el modelo se integra como plugin de TTS en Open Voice OS mediante la configuracion de mycroft.conf, permitiendo que un asistente domestico sintetice respuestas habladas en ingles. Es adecuado por su licencia abierta y su formato ONNX ligero.
- Sintesis de voz local en Python: mediante la API TTSModelManager de phoonnx, un desarrollador puede generar archivos WAV a partir de texto sin depender de servicios en la nube, lo que resulta util para prototipos y aplicaciones de escritorio.
- Lectura de contenido en navegador: con phoonnx.js, el modelo puede ejecutarse en el cliente web para leer texto en voz alta, aprovechando la demo disponible en tigregotico.pt/demo, sin enviar datos a servidores externos.
- Generacion de avisos y notificaciones habladas: en sistemas embebidos o de domotica, el modelo puede sintetizar mensajes cortos en ingles con bajo consumo de recursos gracias a su tamano de 0,1 GB.
- Pruebas de integracion de pipelines TTS: desarrolladores que construyen aplicaciones con phoonnx o scriptconv pueden usar este modelo como voz de referencia para validar la cadena de fonemizacion espeak y sintesis.
- Accesibilidad: conversion de texto a voz para aplicaciones de lectura asistida en ingles estadounidense, con la ventaja de no requerir conexion a internet ni claves de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se trata de un modelo muy ligero, apto para CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de 0,1 GB, la inferencia en CPU es viable y no requiere GPU dedicada.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo puede alojarlo dado su reducido tamano, aunque no se aportan cifras de VRAM concretas.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. La coleccion VITS de Phoonnx incluye otros modelos empaquetados, pero no se aportan sus especificaciones para una comparacion cuantitativa.

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| vits-en_us-k9-espeak | VITS | en-US | Unlicense | ONNX | no aplica |
| Otros modelos VITS de la coleccion Phoonnx | VITS | no disponible | no disponible | ONNX | no aplica |
| Alternativas TTS de codigo abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta ingles estadounidense; no es multilingue.
- La entrada debe ser texto en ingles; la fonemizacion depende de espeak-ng, y el uso del port espyak puede provocar errores de pronunciacion en algunas palabras, segun advierte la propia model card.
- Es un modelo TTS, no un modelo de lenguaje: no razona, no genera codigo ni mantiene conversaciones.
- No se dispone de informacion sobre sesgos de generacion de voz (por ejemplo, sesgos de genero o de acento) ni sobre evaluaciones de calidad subjetiva.
- Riesgo de alucinacion no aplica en el sentido habitual, pero puede producir pronunciaciones incorrectas ante fonemas mal formados o texto fuera del dominio entrenado.
- La licencia Unlicense permite uso comercial sin restricciones, si bien el autor original es hopkira y el empaquetado corresponde a Phoonnx; conviene verificar la procedencia de los datos de entrenamiento originales.
- Modelo con cero descargas y cero likes en el momento de la consulta: no existe evidencia de uso en produccion ni de validacion por parte de la comunidad.
- No se especifican requisitos de version de phoonnx mas alla de la instalacion con `pip install --pre phoonnx`, lo que implica el uso de una version preliminar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-k9-espeak
- Repositorio original del autor: https://github.com/hopkira/k9_piper_voice
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
