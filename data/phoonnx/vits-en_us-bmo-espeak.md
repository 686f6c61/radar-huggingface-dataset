# Phoonnx/vits-en_us-bmo-espeak

## Resumen

vits-en_us-bmo-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede del repositorio de voces Piper de 1liminal1, integrado en el proyecto xiaozhi-esphome, y ha sido adaptado para ejecutarse mediante la librería phoonnx, que ofrece inferencia en Python, en OVOS y en el navegador a través de phoonnx.js.

El modelo sintetiza voz en inglés estadounidense (en-US) a partir de fonemas espeak en alfabeto IPA, lo que lo vincula estrechamente al front-end de fonemización espeak-ng. Su relevancia radica en que amplía el ecosistema de voces Piper disponibles para phoonnx, un formato ligero y desplegable en entornos con recursos limitados, y en que su licencia MIT facilita la integración en productos comerciales.

Se trata de un modelo compacto (repositorio de 0,1 GB en formato ONNX), sin datos publicados sobre número de parámetros, longitud de contexto ni composición del dataset de entrenamiento. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema de síntesis neuronal de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un vocoder integrado, entrenado con aprendizaje adversario. La entrada de texto se procesa como fonemas espeak en alfabeto IPA, generados por espeak-ng o por el port espyak incluido en el extra `phoonnx[espeak]`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. El modelo procede del repositorio de voces Piper de 1liminal1 y ha sido empaquetado por Phoonnx para su librería ONNX; el autor original del modelo es 1liminal1. No se documentan innovaciones técnicas adicionales más allá del propio pipeline VITS y la integración con el front-end de fonemización de scriptconv.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto o de fonemas IPA.
- Conversión de texto a fonemas mediante espeak-ng (o espyak como alternativa), con normalización de texto a cargo de scriptconv.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav`.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) configurable en `mycroft.conf`, permitiendo respuestas habladas en inglés en asistentes domésticos autoalojados.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav` se puede generar audio WAV para narración de contenido, audiolibros o avisos, con un repositorio de solo 0,1 GB adecuado para despliegues ligeros.
- Síntesis en el navegador: phoonnx.js permite ejecutar la voz en cliente sin backend, útil para demos interactivas, accesibilidad web o lectura de contenido en tiempo real.
- Lectura de notificaciones y alertas: la inferencia ONNX ligera permite generar mensajes cortos en inglés en dispositivos con recursos limitados, como Raspberry Pi o sistemas embebidos.
- Prototipado de interfaces conversacionales: al ser un modelo MIT y de pequeño tamaño, sirve para validar pipelines de voz antes de migrar a modelos de mayor calidad.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia en inglés estadounidense, aprovechando la licencia permisiva para distribución comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ONNX ocupa 0,1 GB, lo que sugiere un modelo muy ligero apto para CPU.
- GPU recomendadas: no disponible; por tamaño, es probable que funcione en CPU y en GPUs consumer, pero no se documenta.
- Cabe en consumer GPU: no confirmado; el tamaño del artefacto (0,1 GB) apunta a que sí, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS) y phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia cualitativa, el modelo pertenece a la colección de voces VITS empaquetadas para phoonnx y al ecosistema de voces Piper, pero no se han facilitado cifras que permitan una comparación rigurosa.

| Modelo | Arquitectura | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-bmo-espeak | VITS | no aplica | no disponible | MIT | Hugging Face (Phoonnx) |
| Alternativas Piper/VITS de la colección Phoonnx | VITS | no aplica | no disponible | variable | Hugging Face (Phoonnx) |
| Otros modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no se documentan otros idiomas.
- Depende de espeak-ng para la fonemización; sin él, el extra `phoonnx[espeak]` usa espyak, cuyos fonemas difieren en algunos casos y pueden provocar pronunciaciones incorrectas.
- No se han publicado datos sobre sesgos, calidad de voz, naturalidad ni robustez ante texto fuera de dominio.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de pronunciaciones erróneas ante fonemas mal formados o texto no normalizado correctamente.
- No se documentan limitaciones de longitud de entrada ni comportamiento ante textos largos.
- La licencia MIT se declara en el repositorio upstream de 1liminal1; conviene verificar la procedencia y condiciones de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-bmo-espeak
- Repositorio upstream (voces Piper de 1liminal1): https://github.com/1liminal1/xiaozhi-esphome/tree/main/piper-voices
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
