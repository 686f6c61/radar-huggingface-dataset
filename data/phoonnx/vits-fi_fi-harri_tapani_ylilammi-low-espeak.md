# Phoonnx/vits-fi_fi-harri_tapani_ylilammi-low-espeak

## Resumen

`vits-fi_fi-harri_tapani_ylilammi-low-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su suite de voces Mimic 3 y reempaquetado por Phoonnx en formato ONNX para su libreria de inferencia TTS. El modelo genera audio a partir de texto en finlandes (`fi-FI`) y esta pensado para sintetizar una voz concreta identificada como "harri-tapani-ylilammi", en su variante de calidad "low", lo que implica un modelo de menor tamano y coste computacional que las versiones de mayor fidelidad.

La relevancia de este modelo es practica: permite incorporar sintesis de voz en finlandes en aplicaciones Python y en el ecosistema de asistentes OVOS sin depender de servicios en la nube, con un peso de repositorio de apenas 0,1 GB. No es un modelo de proposito general ni un LLM: es un componente especializado de un solo idioma y una sola voz, cuya utilidad depende de integrarse en un pipeline TTS que haga la conversion texto a fonemas.

El modelo acepta como entrada fonemas espeak (alfabeto IPA), no texto plano directamente; la normalizacion y fonemizacion las realiza la libreria `scriptconv` del propio ecosistema Phoonnx. Su licencia es CC-BY-SA-4.0, heredada del repositorio upstream de Mycroft AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | finlandes (`fi-FI`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial durante el entrenamiento, con alineamiento monotono aprendido. Permite generar audio de forma directa desde fonemas sin un vocoder separado en inferencia. El modelo empaquetado se ejecuta mediante ONNX a traves de la libreria `phoonnx`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables habitualmente a TTS). El modelo original procede del repositorio `MycroftAI/mimic3-voices`, en la ruta `voices/fi_FI/harri-tapani-ylilammi_low`, y Phoonnx lo ha reempaquetado para su runtime. La entrada de texto se procesa con `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que convierte el texto normalizado a fonemas espeak en alfabeto IPA.

## Capacidades

- Sintesis de voz (text-to-speech) en finlandes a partir de texto.
- Generacion de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Entrada basada en fonemas espeak (IPA), con fonemizacion delegada a `scriptconv`.
- Integracion como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en Python mediante la libreria `phoonnx` y en navegador mediante `phoonnx.js`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso.
- No es multilingue: unicamente finlandes (`fi-FI`).

## Casos de uso

- Asistentes de voz locales en finlandes: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite dotar de voz a un asistente domestico sin conexion a servicios externos, configurandolo en `mycroft.conf` con la voz `mimic3/fi_FI/harri-tapani-ylilammi_low`.
- Lectura de notificaciones y avisos del sistema: al ser un modelo ligero (repositorio de 0,1 GB), puede sintetizar mensajes cortos de forma rapida en dispositivos de recursos limitados.
- Accesibilidad para usuarios finlandeses: conversion de texto a voz para lectores de pantalla o interfaces de accesibilidad en aplicaciones de escritorio o web.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en finlandes en fases tempranas de desarrollo sin coste de API, usando la variante "low" para iteracion rapida.
- Generacion de audio en el navegador: mediante `phoonnx.js`, el modelo puede ejecutarse en cliente para demos o aplicaciones web que necesiten TTS en finlandes sin backend.
- Pruebas de pipelines TTS multilingues: sirve como una de las voces de la coleccion VITS de Phoonnx para validar la infraestructura de fonemizacion espeak y el manejo de idiomas en un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la variante "low", es previsible que quepa en GPU de gama baja, pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo esta empaquetado en ONNX y puede ejecutarse en CPU mediante `phoonnx`.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencia adicional: requiere `espeak-ng` instalado en el sistema (o el extra `phoonnx[espeak]` con el port espyak); sin el, la fonemizacion no funciona correctamente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-fi_fi-harri_tapani_ylilammi-low-espeak | VITS | fi-FI | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| Otras voces VITS de la coleccion Phoonnx | VITS | segun voz | segun voz | ONNX | Hugging Face (coleccion VITS) |
| Voces originales de Mycroft Mimic 3 | VITS | segun voz | CC-BY-SA-4.0 (upstream) | no disponible | GitHub MycroftAI/mimic3-voices |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos concretos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo de un solo idioma (`fi-FI`) y una sola voz; no es adaptable a otros idiomas sin otro modelo.
- Requiere fonemizacion previa con espeak; si se usa el port espyak en lugar de `espeak-ng`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No hay informacion sobre sesgos, calidad subjetiva (MOS) ni evaluacion de naturalidad.
- Riesgo de errores de pronunciacion en texto no normalizado o con abreviaturas, siglas y numeros si la normalizacion de `scriptconv` no los resuelve.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- La variante "low" prioriza ligereza sobre calidad de audio; no es adecuada para produccion de audio de alta fidelidad.
- No se han publicado benchmarks ni metricas objetivas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fi_fi-harri_tapani_ylilammi-low-espeak
- Upstream en GitHub (Mycroft AI): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/fi_FI/harri-tapani-ylilammi_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
