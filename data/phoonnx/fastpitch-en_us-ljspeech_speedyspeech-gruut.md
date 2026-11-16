# Phoonnx/fastpitch-en_us-ljspeech_speedyspeech-gruut

## Resumen

FastPitch en_us ljspeech speedyspeech gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura FastPitch, originalmente desarrollado por Coqui a partir del checkpoint `tts_models--en--ljspeech--speedy-speech` de Coqui TTS v0.6.1. El modelo ha sido empaquetado en formato ONNX por Phoonnx para su uso con la libreria `phoonnx`, una implementacion de inferencia TTS en Python y para el asistente OVOS.

El modelo genera espectrogramas a partir de fonemas IPA obtenidos mediante el fonemizador gruut, que posteriormente son convertidos a audio por el vocoder `vocos-multi-alvocat-22khz`. Esta separacion en dos etapas (acustica y vocoder) es tipica de los sistemas TTS neuronales de dos fases y permite sustituir el vocoder de forma independiente.

Es relevante para desarrolladores que necesitan un TTS ligero y desplegable en local, con licencia Apache 2.0 y sin dependencias de servicios en la nube, especialmente en el contexto del ecosistema OVOS/Mycroft. El modelo esta entrenado exclusivamente para ingles estadounidense (`en-US`) sobre el corpus LJSpeech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (TTS acustico no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, sin ventana definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Vocoder asociado | vocos-multi-alvocat-22khz |
| Frecuencia de muestreo | 22 kHz (segun vocoder) |
| Libreria | phoonnx |
| Autor original | Coqui |

## Arquitectura y entrenamiento

FastPitch es una arquitectura de sintesis acustica no autorregresiva basada en Transformer que predice duraciones de fonemas y genera un espectrograma mel a partir de una secuencia de fonemas. A diferencia de Tacotron 2, FastPitch elimina la dependencia autorregresiva mediante la prediccion explicita de duraciones, lo que permite sintesis paralela y menor latencia. La variante "speedy speech" del checkpoint original de Coqui esta optimizada para velocidad de inferencia.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino adicional en la informacion proporcionada. El modelo original fue entrenado sobre el corpus LJSpeech (lectura de una unica hablante en ingles estadounidense), lo que condiciona tanto el timbre como el dominio de aplicacion. El empaquetado de Phoonnx se limita a exportar el modelo a ONNX y a integrar el front-end de texto mediante `scriptconv` con el fonemizador gruut.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (`en-US`).
- Generacion de espectrogramas mel que se convierten a audio mediante el vocoder `vocos-multi-alvocat-22khz`.
- Fonemizacion IPA mediante gruut, integrada a traves de `scriptconv[gruut]`.
- Normalizacion y conversion de texto de entrada mediante la libreria `scriptconv`.
- Integracion con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en Python sin dependencia de APIs externas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision, audio de entrada ni capacidades multimodales mas alla del TTS.
- Capacidad multilingue limitada: solo `en-US`.

## Casos de uso

- Asistencia por voz en OVOS/Mycroft: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente domestico sintetice respuestas en ingles sin conexion a Internet, seleccionando la voz `coqui/en-ljspeech-speedy-speech` en `mycroft.conf`.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ONNX ligero, puede empaquetarse dentro de una aplicacion Python y generar avisos hablados en local sin enviar texto a servicios externos.
- Generacion de audiolibros o narraciones de contenido en ingles: la voz unica de LJSpeech es adecuada para narracion monologo con texto previamente normalizado por `scriptconv`.
- Prototipado de pipelines TTS en investigacion: sirve como linea base reproducible (FastPitch + vocoder Vocos) para comparar con otros sistemas TTS en tareas de inteligencia artificial conversacional.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de usuario en ingles, con sintesis por frase y baja latencia al ser no autorregresivo.
- Generacion de datos sinteticos de audio para pruebas: permite crear clips de voz en ingles para validar pipelines de ASR, diarizacion o deteccion de voz sin depender de grabaciones reales.
- Integracion en dispositivos embebidos o edge: al distribuirse como ONNX y requerir solo CPU en muchos casos, puede desplegarse en Raspberry Pi u otros equipos con recursos limitados para respuestas habladas basicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas MOS, MCD, RTF ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se distribuye en ONNX y puede ejecutarse en CPU.
- GPU recomendadas: no especificadas por el autor; al ser un modelo TTS de tamano reducido, es viable en GPU consumer (por ejemplo, RTX 3060 o superiores) y en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con soporte ONNX Runtime; no se dispone de cifras oficiales de memoria.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles. La arquitectura FastPitch es no autorregresiva y la variante "speedy speech" esta orientada a inferencia rapida, pero no se aportan numeros de RTF.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/fastpitch-en_us-ljspeech_speedyspeech-gruut | FastPitch + vocoder Vocos | en-US | Apache 2.0 | ONNX (phoonnx) | Voz unica LJSpeech, front-end gruut |
| Coqui TTS `tts_models--en--ljspeech--speedy-speech` (upstream) | FastPitch | en-US | Apache 2.0 | Checkpoint PyTorch | Mismo modelo origen, sin empaquetado ONNX |
| Otros modelos FastPitch de la coleccion Phoonnx | FastPitch | variable | segun modelo | ONNX (phoonnx) | Misma libreria, distintos idiomas/voces |
| Modelos TTS neuronales de dos fases (p. ej. Tacotron 2 + HiFi-GAN) | Tacotron 2 autorregresivo | en-US | variable | variable | Referencia generica; no se dispone de comparacion cuantitativa |

No se dispone de datos de rendimiento comparativo (MOS, MCD) en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre LJSpeech: una unica hablante, dominio de lectura, ingles estadounidense. No es adecuado para otros idiomas ni para voces multiples sin reentrenamiento.
- Riesgo de pronunciacion incorrecta en palabras fuera de vocabulario, acronimos, nombres propios o texto no normalizado; depende de la calidad del fonemizador gruut y de `scriptconv`.
- Al ser un modelo TTS y no un modelo de lenguaje, no razona ni genera texto; cualquier alucinacion se manifiesta como artefactos acusticos o prosodia incorrecta, no como contenido inventado.
- Limitaciones de contexto: sintesis por frase; no se documenta manejo de parrafos largos ni de marcas prosodicas complejas.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a la declaracion de licencia del listado de modelos de Coqui TTS; conviene verificar la procedencia exacta de los pesos antes de un despliegue comercial.
- El repositorio tiene un tamano declarado de 0.0 GB y muy pocas descargas (21) y likes (0); es un empaquetado reciente y poco validado por la comunidad.
- Dependencia del vocoder externo `vocos-multi-alvocat-22khz`: la calidad final del audio depende de este componente, no solo del modelo acustico.
- No se documentan pruebas de robustez frente a texto ruidoso, emoticonos, cifras o abreviaturas; se recomienda normalizacion previa con `scriptconv`.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/fastpitch-en_us-ljspeech_speedyspeech-gruut
- Upstream Coqui TTS (checkpoint original): https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--ljspeech--speedy-speech.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder vocos-multi-alvocat-22khz: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
- Coleccion FastPitch de Phoonnx: https://huggingface.co/collections/Phoonnx/fastpitch-6af8ea827005c1385348ed60
