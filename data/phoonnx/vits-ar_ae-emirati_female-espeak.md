# Phoonnx/vits-ar_ae-emirati_female-espeak

## Resumen

vits-ar_ae-emirati_female-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo original fue desarrollado por el usuario vadimbelsky bajo el identificador vadimbelsky/arabic-emirati-female-piper, y esta version lo adapta al ecosistema phoonnx para su uso en Python y en el asistente OVOS. Se trata de una voz femenina entrenada especificamente para arabe dialectal de los Emiratos Arabes Unidos (ar-AE).

El modelo resuelve la necesidad de sintesis de voz en un dialecto arabe especifico que no suele estar cubierto por los sistemas TTS comerciales o multilingues genericos. Al estar empaquetado en formato ONNX y con una libreria de inferencia ligera, esta pensado para despliegues en entornos con recursos limitados, como asistentes de voz locales o sistemas embebidos. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto.

La relevancia actual del modelo radica en su licencia MIT, que permite uso comercial sin restricciones, y en su integracion con el ecosistema OVOS (Open Voice OS), lo que facilita su adopcion en proyectos de asistentes de voz de codigo abierto. No obstante, se trata de un modelo con muy poca traccion (18 descargas, 0 likes) y sin benchmarks publicados, por lo que su evaluacion debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | arabe dialectal de Emiratos Arabes Unidos (ar-AE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en normalizing flows y un discriminador adversarial para el entrenamiento. El modelo genera waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia. La entrada de texto se procesa mediante espeak-ng para obtener fonemas en alfabeto IPA, que son la representacion interna que consume el modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El modelo original fue entrenado por vadimbelsky y posteriormente empaquetado por Phoonnx para su libreria ONNX. La unica innovacion tecnica destacable es el empaquetado en ONNX para inferencia ligera y la integracion con el ecosistema phoonnx/OVOS, que permite su uso en Python y en el navegador mediante phoonnx.js.

## Capacidades

- Sintesis de voz (text-to-speech) en arabe dialectal emirati (ar-AE) con voz femenina.
- Conversion de texto a fonemas mediante espeak-ng (o el port espyak) antes de la sintesis.
- Generacion de audio en formato WAV a traves de la API de phoonnx.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS puro).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al dialecto ar-AE.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra mediante el plugin ovos-tts-plugin-phoonnx y permite dotar de voz en arabe emirati a un asistente domestico sin depender de servicios en la nube, gracias a su formato ONNX ligero y licencia MIT.
- Aplicaciones de accesibilidad para hablantes de arabe emirati: conversion de texto a voz para lectores de pantalla o sistemas de comunicacion aumentativa, con la ventaja de que el modelo es compacto (0,1 GB) y puede ejecutarse en dispositivos de bajos recursos.
- Generacion de audiolibros o contenido narrado en dialecto emirati: el modelo permite sintetizar textos largos por fragmentos, aunque no se dispone de datos sobre la calidad en textos extensos ni sobre la consistencia prosodica.
- Prototipado de interfaces conversacionales en arabe emirati: desarrolladores que necesiten una voz de prueba para un chatbot o IVR pueden usar este modelo con licencia MIT sin coste de licencia, integrandolo via Python con phoonnx.
- Investigacion en TTS para dialectos arabes: el modelo sirve como baseline o punto de partida para comparar calidad de sintesis en ar-AE frente a otros sistemas, aunque carece de benchmarks publicados.
- Despliegue en navegador mediante phoonnx.js: la demo en tigregotico.pt/demo permite probar la voz sin instalacion, util para validar la calidad antes de integrarla en produccion.
- Sistemas de anuncios o notificaciones por voz en entornos con recursos limitados: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en dispositivos edge o Raspberry Pi, aunque no se dispone de datos de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo ONNX de 0,1 GB, es probable que quepa en CPU y en GPUs de gama baja, pero no se proporcionan datos concretos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible, aunque por el tamano del repositorio (0,1 GB) es plausible que funcione en GPUs consumer, pero no se confirma.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponible.
- Requisito adicional: es necesario instalar espeak-ng (o el extra phoonnx[espeak] con el port espyak) para la fonemizacion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto | Rendimiento |
|---|---|---|---|---|---|---|
| vits-ar_ae-emirati_female-espeak | VITS | ar-AE | MIT | ONNX | no aplica | no disponible |
| vadimbelsky/arabic-emirati-female-piper | VITS (Piper) | ar-AE | MIT | Piper | no aplica | no disponible |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | MIT (segun modelo) | ONNX | no aplica | no disponible |

La comparativa se limita al modelo upstream (vadimbelsky/arabic-emirati-female-piper) y a otros modelos de la coleccion VITS de Phoonnx, ya que no se dispone de datos de rendimiento ni de modelos alternativos especificos para ar-AE en la informacion proporcionada. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo con muy poca traccion: 18 descargas y 0 likes, lo que implica ausencia de validacion comunitaria y riesgo de calidad no contrastada.
- No se han publicado benchmarks ni metricas objetivas de calidad (MOS, WER, etc.), por lo que no se puede evaluar su rendimiento de forma cuantitativa.
- La fonemizacion depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- El modelo solo soporta arabe dialectal emirati (ar-AE); no es multilingue y no debe usarse para arabe estandar moderno (MSA) ni otros dialectos sin validacion previa.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar prosodia incorrecta o artefactos en textos fuera de dominio, aunque no se dispone de datos concretos.
- Sesgos conocidos: no se dispone de informacion sobre sesgos de genero, dialecto o prosodia mas alla de que la voz es femenina y de dialecto emirati.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor original es vadimbelsky y el empaquetado es de Phoonnx; se recomienda verificar la cadena de licencias en produccion.
- No apto para tareas de NLP (razonamiento, codigo, tool calling); es exclusivamente un modelo TTS.
- La fecha de creacion (2026-11-14) es posterior a la fecha actual en algunos contextos; verificar la vigencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ar_ae-emirati_female-espeak
- Modelo upstream: https://huggingface.co/vadimbelsky/arabic-emirati-female-piper
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
