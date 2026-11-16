# Phoonnx/vits-en_us-hfc_male-medium-espeak

## Resumen

`vits-en_us-hfc_male-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su biblioteca de inferencia ONNX homónima. El modelo original procede de Rhasspy, concretamente de la colección `piper-voices` (variante `en/en_US/hfc_male/medium`), y Phoonnx lo redistribuye en formato ONNX con el front-end de texto adaptado para aceptar fonemas generados por espeak-ng en alfabeto IPA.

El modelo resuelve el problema de la conversión de texto a voz en inglés estadounidense con una voz masculina de calidad media, pensada para ejecutarse en entornos con recursos limitados. Su empaquetado para phoonnx lo integra en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que facilita su uso en asistentes de voz autoalojados y aplicaciones de domótica.

Es relevante ahora porque ofrece una alternativa ligera (repo de 0,1 GB), con licencia MIT y ejecutable en CPU mediante ONNX Runtime, para pipelines de TTS que no pueden depender de servicios en la nube ni de GPUs dedicadas. No obstante, se trata de un modelo derivado y de nicho: no aporta innovaciones arquitectónicas propias y su valor reside en el empaquetado y la integración con el stack de Phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto/fonemas, no contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en (concretamente en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con aprendizaje adversarial, junto con un alineador monotónico para el ajuste texto-audio. El modelo genera directamente la forma de onda a partir de la secuencia de fonemas, sin necesidad de un vocoder externo separado.

En este caso concreto no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino posteriores. El modelo es un derivado de la voz `hfc_male/medium` de `rhasspy/piper-voices`, cuyo autor original es Rhasspy; Phoonnx se limita a empaquetarlo para su librería. La innovación técnica del empaquetado es el uso de un front-end de texto basado en `scriptconv` con el fonemizador `EspeakPhonemizer`, que normaliza el texto y lo convierte a fonemas IPA antes de la inferencia.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) con voz masculina de calidad media.
- Conversión de texto a fonemas IPA mediante espeak-ng y el fonemizador de `scriptconv`.
- Generación de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Integración con OVOS a través de `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `piper/en_US-hfc_male-medium` en `mycroft.conf` para que el asistente responda con voz sintetizada localmente, sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en domótica: un sistema doméstico puede sintetizar mensajes cortos en inglés (por ejemplo, avisos de sensores) con baja latencia al ejecutarse en CPU.
- Síntesis en el navegador: mediante phoonnx.js, la voz puede integrarse en aplicaciones web para leer contenido dinámico sin enviar texto a un servidor externo, preservando la privacidad.
- Generación de audiolibros o podcasts de bajo coste: al ser un modelo ligero (repo de 0,1 GB) y con licencia MIT, puede procesar lotes de texto en pipelines por lotes en máquinas sin GPU.
- Accesibilidad web: lectura en voz alta de contenido para usuarios con discapacidad visual, ejecutándose en el cliente mediante ONNX o en un servidor ligero.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia para validar integraciones con phoonnx y `scriptconv` antes de migrar a voces de mayor calidad.
- Sistemas embebidos y edge computing: su tamaño reducido y la inferencia ONNX permiten desplegarlo en dispositivos con recursos limitados, como Raspberry Pi, para anuncios verbales locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB de repositorio, es probable que quepa en memoria RAM convencional y que no requiera VRAM dedicada, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime.
- Compatibilidad con GPU consumer: no confirmada; por tamaño, es plausible que funcione en cualquier GPU con soporte ONNX Runtime, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-hfc_male-medium-espeak (este modelo) | VITS | en-US | MIT | ONNX | fonemas espeak IPA | Hugging Face (Phoonnx) |
| Otras voces de rhasspy/piper-voices | VITS | múltiples | MIT (según model card upstream) | ONNX | fonemas espeak | Hugging Face (Rhasspy) |
| Otras voces empaquetadas en la colección VITS de Phoonnx | VITS | varias | MIT | ONNX | fonemas espeak / unicode | Hugging Face (Phoonnx) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y formato.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- La calidad es "medium" según la nomenclatura de Piper; no está pensada para producciones de alta fidelidad.
- Depende de espeak-ng para la fonemización; si no está instalado, se usa el port espyak, cuyos fonemas pueden diferir y provocar errores de pronunciación en algunas palabras.
- Es un modelo derivado y empaquetado por un tercero (Phoonnx); la responsabilidad sobre el entrenamiento original recae en Rhasspy.
- No se han publicado benchmarks objetivos de calidad (MOS, WER) en la información disponible.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas ante texto no normalizado o fuera de dominio.
- Licencia MIT: permite uso comercial, pero conviene verificar la model card original de `rhasspy/piper-voices` para confirmar las condiciones exactas del upstream.
- El número de descargas (22) y likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.
- No apto para tareas de razonamiento, código, matemáticas ni agentes; es exclusivamente un modelo TTS.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hfc_male-medium-espeak
- Upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/hfc_male/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
