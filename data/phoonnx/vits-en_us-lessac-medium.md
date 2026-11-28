# Phoonnx/vits-en_US-lessac-medium

## Resumen

`Phoonnx/vits-en_US-lessac-medium` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería Python `phoonnx` desarrollada por TigreGotico. El modelo original procede de Rhasspy, concretamente de la voz `en_US-lessac-medium` del proyecto Piper, que a su vez es una de las voces de referencia más utilizadas en asistentes de voz de código abierto como Mycroft/OVOS. Este repositorio no entrena un modelo nuevo, sino que redistribuye los pesos originales en un formato consumible por el ecosistema phoonnx.

La relevancia del modelo reside en su carácter práctico: es una voz inglesa (en-US) de calidad media, ligerísima (el repositorio completo ocupa 0,1 GB), pensada para inferencia local en CPU o GPU de gama baja. Se integra directamente en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, lo que lo convierte en una pieza útil para construir asistentes de voz autoalojados sin dependencia de servicios en la nube.

El modelo no es un LLM ni un modelo multimodal: es un sintetizador acústico puro que transforma fonemas IPA (generados por espeak-ng) en audio WAV. Su licencia MIT y su reducido tamaño lo hacen adecuado para prototipos, entornos embebidos y despliegues donde el coste computacional y la privacidad son prioritarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto basado en transformers, un prior variacional, un decoder generativo basado en normalizing flows y un discriminador adversarial multi-periodo entrenado con pérdidas GAN, además de una alineación monotónica latente (MAS) que aprende la correspondencia entre fonemas y frames de audio sin necesidad de alineaciones explícitas. El resultado es un modelo que genera audio de forma directa desde fonemas, sin vocoder externo.

En este caso, el modelo no ha sido entrenado por el autor del repositorio: es una conversión del checkpoint `en_US-lessac-medium` de Rhasspy Piper. La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino adicional. La entrada textual se procesa mediante `scriptconv` (normalización y conversión a fonemas IPA con espeak-ng) antes de alimentar el modelo. La innovación técnica relevante aquí no está en el modelo en sí, sino en el empaquetado ONNX y la integración con phoonnx, que permite ejecutar la voz en Python (y en el navegador vía phoonnx.js) sin dependencias pesadas.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Entrada basada en fonemas IPA generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo TTS.
- No dispone de capacidades multimodales (visión, audio de entrada, etc.).
- No soporta otros idiomas distintos del inglés estadounidense.

## Casos de uso

- Asistentes de voz autoalojados en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en inglés sin enviar texto a servicios externos, lo que preserva la privacidad del usuario.
- Lectura de notificaciones y alertas en sistemas domésticos: con un repositorio de 0,1 GB y pesos ONNX, el modelo cabe en dispositivos de borde (Raspberry Pi, mini-PC) y puede sintetizar mensajes cortos en tiempo casi real.
- Generación de audiolibros o locuciones para prototipos: la voz `lessac-medium` ofrece una calidad inteligible adecuada para demos, maquetas y pruebas de usabilidad donde no se requiere una voz comercial.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla o interfaces para personas con discapacidad visual en entornos en inglés.
- Pruebas de pipelines TTS en CI: al ser un modelo pequeño y determinista, sirve como fixture para validar integraciones de phoonnx, scriptconv o phoonnx.js sin coste de GPU.
- Demos web en el navegador: mediante phoonnx.js y la demo pública en tigregotico.pt/demo, se puede ofrecer síntesis de voz del lado del cliente sin backend.
- Generación de avisos pregrabados en sistemas de megafonía o kioscos interactivos en inglés estadounidense.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas MOS, MCD, WER ni comparaciones objetivas con otras voces Piper o VITS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) se infiere un modelo muy ligero que puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se documentan; cualquier GPU con soporte ONNX Runtime (incluidas GTX 1060, RTX 3060, RTX 4090, A100) puede ejecutarlo, pero no es necesario.
- Cabe en GPU de consumo: sí, con amplio margen; también en CPU de un solo núcleo para frases cortas.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador). No se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato | Integracion |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_US-lessac-medium | VITS | en-US | 0,1 GB | MIT | ONNX | phoonnx, OVOS, phoonnx.js |
| rhasspy/piper-voices (en_US-lessac-medium) | VITS | en-US | similar | MIT | ONNX (Piper) | Piper, Home Assistant, Rhasspy |
| Otras voces de la coleccion Phoonnx VITS | VITS | varios | variable | MIT (segun upstream) | ONNX | phoonnx |
| Coqui TTS (voces VITS) | VITS | varios | variable | MPL-2.0 / otras | PyTorch, ONNX | Coqui TTS |

La diferencia principal frente al checkpoint original de Piper es el empaquetado y la integración con el ecosistema phoonnx/OVOS; el modelo acústico subyacente es el mismo. No se dispone de datos de benchmarks que permitan comparar calidad objetiva entre estas alternativas.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Es un modelo TTS puro: no genera texto, no razona, no soporta tool calling ni agentes.
- La calidad es "medium" según la nomenclatura de Piper; no es una voz de calidad comercial.
- Depende de espeak-ng para la fonemización; si se usa el port espyak incluido en `phoonnx[espeak]`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, tal como advierte la model card.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- No se documentan sesgos específicos, pero al ser una voz entrenada con un corpus concreto (Lessac) puede reflejar características acentuales y de estilo limitadas.
- Licencia MIT declarada por el upstream (rhasspy/piper-voices); se recomienda verificar la cadena de licencias antes de uso comercial, ya que el autor del repositorio delega en la declaración del upstream.
- No se documentan parámetros como número de parámetros, tokens de entrenamiento ni composición del dataset, lo que dificulta auditorías técnicas.
- El repositorio tiene muy poca tracción (200 descargas, 0 likes) y fue creado en noviembre de 2026; no hay historial de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_US-lessac-medium
- Upstream Piper (rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
