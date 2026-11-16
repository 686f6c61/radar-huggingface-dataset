# Phoonnx/vits-en_us-patrick-espeak

## Resumen

`vits-en_us-patrick-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por simoniz0r y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo genera audio a partir de texto en ingles estadounidense (`en-US`), tomando como entrada fonemas en alfabeto IPA producidos por espeak-ng. Su relevancia radica en que es un modelo compacto y ligero (0,1 GB de repositorio) que puede ejecutarse en entornos con recursos limitados, incluidos navegadores mediante phoonnx.js.

El modelo forma parte de la coleccion de voces VITS empaquetadas para phoonnx, una libreria Python y plugin para OVOS (Open Voice OS) orientada a asistentes de voz. No se trata de un modelo de lenguaje generativo sino de un sintetizador neuronal de voz, por lo que sus capacidades se limitan a la conversion texto-a-habla. La licencia MIT facilita su integracion en productos comerciales y proyectos de codigo abierto.

La informacion disponible no incluye detalles sobre el tamano de parametros, la longitud de contexto (no aplica en el sentido habitual de los LLM) ni datos de entrenamiento. El modelo se distribuye en formato ONNX y depende de espeak-ng o espyak para la fonemizacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. El modelo genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado. La entrada de texto se procesa mediante espeak-ng (o su port espyak) para producir fonemas en alfabeto IPA, que posteriormente se convierten en audio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning. El modelo original fue publicado por simoniz0r en el repositorio `piper-voice-models` y posteriormente empaquetado por Phoonnx para su uso con la libreria phoonnx. La innovacion principal reside en su empaquetado ONNX optimizado para inferencia ligera y su integracion con el ecosistema OVOS.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (`en-US`).
- Generacion de audio en formato WAV mediante la API de phoonnx.
- Entrada basada en fonemas IPA generados por espeak-ng o espyak.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS en `mycroft.conf`, permitiendo que un asistente domotico sintetice respuestas habladas en ingles con una voz concreta (Patrick) sin depender de servicios en la nube.
- Lectura de notificaciones y alertas: en sistemas embebidos o Raspberry Pi, el modelo puede convertir mensajes cortos en audio gracias a su tamano reducido (0,1 GB) y su formato ONNX optimizado para CPU.
- Accesibilidad web: mediante phoonnx.js, se puede integrar en el navegador para leer contenido de paginas web a usuarios con discapacidad visual, sin enviar texto a servidores externos.
- Pruebas de integracion continua (CI): el modelo puede usarse en pipelines de测试 para verificar que las respuestas de un asistente se sintetizan correctamente, al ser ligero y determinista.
- Prototipado de interfaces conversacionales: desarrolladores que construyen chatbots de voz pueden usar esta voz para generar respuestas de audio rapidamente durante la fase de desarrollo.
- Generacion de audiolibros o podcasts automatizados: para contenido en ingles estadounidense, el modelo puede narrar textos largos por fragmentos, aunque la calidad y naturalidad no estan documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria RAM/VRAM de menos de 1 GB, pero no se confirma.
- GPU recomendadas: no disponible; al ser un modelo ligero, puede ejecutarse en CPU sin GPU dedicada.
- Compatibilidad con GPU de consumo: probablemente si en cualquier GPU moderna (RTX 4090, RTX 3060, etc.) e incluso en CPU, pero no se dispone de datos oficiales.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS (`ovos-tts-plugin-phoonnx`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano repo |
|---|---|---|---|---|---|
| vits-en_us-patrick-espeak | VITS | en-US | MIT | ONNX | 0,1 GB |
| Piper (voces VITS genericas) | VITS | multi | MIT | ONNX | variable |
| Coqui TTS (VITS) | VITS | multi | MPL-2.0 | varios | variable |
| Bark | Transformer | multi | MIT | PyTorch | varios GB |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (`en-US`); no es multilingue.
- Depende de espeak-ng o espyak para la fonemizacion; sin estas herramientas el modelo no funciona correctamente.
- Con espyak, algunos fonemas difieren de espeak-ng, lo que puede provocar pronunciaciones incorrectas en ciertas palabras.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (no aplica en el mismo sentido que en LLM) ni calidad de la voz en terminos de MOS.
- La licencia MIT permite uso comercial, pero el autor original (simoniz0r) establece sus propios terminos en la release upstream; se recomienda revisarlos.
- El modelo fue creado en 2026-11-16 y actualizado el mismo dia; no hay historial de mantenimiento ni comunidad (0 descargas, 0 likes en el momento de la consulta).
- No se dispone de informacion sobre latencia, throughput ni requisitos minimos de hardware.

## Enlaces

- [Hugging Face: Phoonnx/vits-en_us-patrick-espeak](https://huggingface.co/Phoonnx/vits-en_us-patrick-espeak)
- [Repositorio upstream de simoniz0r (piper-voice-models, tag patrick)](https://github.com/simoniz0r/piper-voice-models/releases/tag/patrick)
- [phoonnx (libreria ONNX TTS)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (normalizacion y fonemizadores)](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js (inferencia en navegador)](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Coleccion VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
