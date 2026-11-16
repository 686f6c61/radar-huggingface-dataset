# Phoonnx/vits-nl_nl-mls_7432-low-espeak

## Resumen

vits-nl_nl-mls_7432-low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo convierte texto en neerlandes (nl-NL) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su variante "low" indica una configuracion de calidad reducida, orientada a un tamano de fichero pequeno (el repositorio ocupa aproximadamente 0,1 GB) y a una inferencia rapida en CPU.

El modelo resuelve el problema de la sintesis de voz offline y ligera para aplicaciones de asistencia por voz, domotica y sistemas embebidos, especialmente dentro del ecosistema OVOS/Mycroft, donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. Al estar empaquetado en ONNX, puede ejecutarse sin frameworks de deep learning pesados y desplegarse tanto en Python como en navegador mediante `phoonnx.js`.

Es relevante por su licencia MIT, su reducido coste computacional y su integracion con el pipeline de voces de Piper, que permite disponer de voces multilingues de calidad aceptable en hardware modesto. No obstante, la informacion publicada es escasa: no se detallan parametros, contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con VAE adversarial y normalizing flows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin contexto de texto) |
| Tipos de cuantizacion | no disponible; variante "low" de Piper (modelo ONNX de baja calidad/tamano) |
| Idiomas soportados | neerlandes (nl-NL) |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema TTS condicional VAE que combina un encoder de texto, un prior normalizing flow, un decoder generativo y un discriminador adversarial multi-periodo, entrenado de extremo a extremo para producir waveforms directamente a partir de fonemas. La entrada no es texto crudo sino fonemas espeak-ng en alfabeto IPA, lo que requiere un front-end de fonemizacion (`EspeakPhonemizer` de `scriptconv`) antes de la inferencia.

El modelo procede del repositorio `rhasspy/piper-voices`, concretamente de la ruta `nl/nl_NL/mls_7432/low`, lo que sugiere entrenamiento sobre el corpus MLS (Multilingual LibriSpeech) con el identificador de hablante o subconjunto 7432, en su variante de calidad "low". No se dispone de informacion sobre numero de tokens de entrenamiento, composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovacion principal es el empaquetado ONNX para inferencia ligera multiplataforma.

## Capacidades

- Sintesis de voz (text-to-speech) en neerlandes (nl-NL) a partir de texto.
- Conversion texto a fonemas espeak-ng en alfabeto IPA como paso previo obligatorio.
- Generacion de audio en formato WAV mediante la API `voice.synthesize_wav`.
- Ejecucion en CPU y en navegador (via `phoonnx.js`).
- Integracion con el ecosistema OVOS/Mycroft como plugin TTS.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al neerlandes.

## Casos de uso

- Asistentes de voz para domotica en neerlandes: el modelo puede sintetizar respuestas habladas en tiempo real dentro de OVOS/Mycroft, configurandose mediante `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx`, gracias a su bajo coste computacional y ejecucion en CPU.
- Lectura de notificaciones y alertas en dispositivos embebidos: al ser un modelo ONNX de 0,1 GB, cabe en dispositivos con recursos limitados (Raspberry Pi, routers, altavoces inteligentes) para leer mensajes del sistema en neerlandes.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en aplicaciones de lectura de pantalla en neerlandes, con latencia baja por la variante "low".
- Generacion de audiolibros o contenido narrado en neerlandes: sintesis por lotes de grandes volumenes de texto a WAV, usando el front-end `scriptconv` para normalizar y fonemizar la entrada.
- Pruebas y prototipado de interfaces de voz: su licencia MIT y su empaquetado ligero permiten integrarlo rapidamente en prototipos sin coste de licencia ni infraestructura GPU.
- Síntesis de voz en el navegador: mediante `phoonnx.js` y la demo en `tigregotico.pt/demo`, se puede ofrecer TTS en neerlandes del lado del cliente sin enviar texto a servidores externos, con implicaciones de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de aproximadamente 0,1 GB, es probable que funcione en CPU sin GPU dedicada, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible; no se requiere GPU para la variante "low" segun el diseno de Piper, pero no se especifica.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-nl_nl-mls_7432-low-espeak | VITS | nl-NL | MIT | ONNX | Variante "low" de Piper, empaquetado por Phoonnx |
| Otras voces Piper nl_NL (medium/high) | VITS | nl-NL | MIT (segun Piper) | ONNX | Mayor calidad y tamano; no disponibles en esta busqueda |
| Modelos TTS multilingues comerciales | no disponible | Multiples | Propietaria | no disponible | No comparables por licencia y disponibilidad |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta neerlandes (nl-NL); no es util para otros idiomas.
- La variante "low" implica menor calidad de audio que las variantes medium o high de Piper.
- Requiere espeak-ng instalado; con el port espyak algunos fonemas difieren y pueden producir pronunciaciones incorrectas.
- No es un modelo de lenguaje: no razona, no genera codigo ni soporta agentes.
- Riesgo de alucinacion no aplicable en el sentido de LLM, pero puede producir pronunciaciones erroneas en palabras fuera del dominio de entrenamiento o en nombres propios.
- Sesgos: no documentados; al entrenarse sobre MLS, puede reflejar las caracteristicas del corpus (posible sesgo de acento o registro).
- Licencia MIT permite uso comercial, pero se recomienda verificar la licencia upstream en `rhasspy/piper-voices`.
- Informacion tecnica muy limitada: sin datos de parametros, contexto ni benchmarks, lo que dificulta evaluar su calidad objetivamente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-mls_7432-low-espeak
- Upstream Piper voices: https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_NL/mls_7432/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
