# Phoonnx/optispeech-en_us-lightspeech_mike

## Resumen

optispeech-en_us-lightspeech_mike es un modelo de sintesis de voz (text-to-speech) para ingles estadounidense, empaquetado por Phoonnx a partir del modelo original de mush42 (OptiSpeech, variante LightSpeech). No es un modelo de lenguaje generativo, sino un sistema TTS acustico que convierte texto en audio a partir de fonemas IPA generados por espeak-ng. El repositorio contiene unicamente los pesos en formato ONNX necesarios para ejecutar la inferencia mediante la libreria phoonnx.

La relevancia de este modelo reside en su caracter ligero y su integracion con el ecosistema OVOS (Open Voice OS), lo que permite desplegar sintesis de voz local en dispositivos con recursos limitados sin depender de servicios en la nube. La arquitectura LightSpeech esta disenada explicitamente para reducir el coste computacional manteniendo una calidad de voz aceptable en entornos de asistente vocal.

El modelo se distribuye con licencia MIT y esta pensado para su uso a traves de la libreria phoonnx, que gestiona la carga del modelo, la fonemizacion mediante espeak-ng y la sintesis a WAV. Su alcance es limitado: un unico idioma (en-US), una unica voz (Mike) y una entrada de texto que debe normalizarse y convertirse a fonemas antes de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OptiSpeech (variante LightSpeech), modelo acustico TTS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OptiSpeech en su variante LightSpeech, un diseno de sintesis acustica orientado a la eficiencia computacional. La entrada no es texto directo, sino fonemas en alfabeto IPA generados por espeak-ng a traves de la libreria scriptconv (componente `EspeakPhonemizer`). La salida es una forma de onda de audio que phoonnx escribe en formato WAV.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino. El modelo original fue desarrollado por mush42 y publicado en su repositorio de OptiSpeech bajo la ruta `onnx/lightspeech/en-us`; Phoonnx se limita a empaquetarlo y adaptarlo para su libreria. No se documentan innovaciones tecnicas adicionales mas alla de la propia arquitectura LightSpeech.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion de entrada mediante espeak-ng (o el port espyak como alternativa).
- Integracion como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Voz unica predefinida (Mike), identificada como `hf_community/mush42/optispeech-lightspeech-en-us-mike`.
- Ejecucion local mediante inferencia ONNX, sin dependencia de servicios externos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS en la configuracion `mycroft.conf`, permitiendo que un asistente domotico o de escritorio sintetice respuestas habladas sin conexion a internet.
- Lectura de notificaciones y alertas: en sistemas embebidos o Raspberry Pi, el bajo coste de la arquitectura LightSpeech permite convertir mensajes cortos en audio en tiempo real.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido textual en aplicaciones de escritorio que requieran una voz en ingles estadounidense.
- Pruebas de integracion de pipelines TTS: desarrolladores que necesiten validar flujos de sintesis con phoonnx pueden usar este modelo como referencia ligera antes de escalar a voces mas complejas.
- Prototipado de interfaces conversacionales: equipos que construyan demos de voz pueden emplear este modelo para generar respuestas habladas rapidamente sin infraestructura GPU.
- Generacion de audiolibros o contenido narrado de forma automatizada: para textos en ingles, el modelo puede sintetizar parrafos completos por fragmentos mediante llamadas sucesivas a `synthesize_wav`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX ligero (LightSpeech) y con un repositorio de tamano practicamente nulo, se espera que quepa en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; no se requieren GPU para la inferencia tipica de este modelo.
- Compatibilidad con GPU de consumo: previsiblemente si, aunque no se documenta oficialmente.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| optispeech-en_us-lightspeech_mike | OptiSpeech / LightSpeech | en-US | MIT | ONNX | Hugging Face (Phoonnx) |
| Otros modelos OptiSpeech de la coleccion Phoonnx | OptiSpeech (distintas variantes) | multiidioma segun variante | MIT (upstream) | ONNX | Hugging Face (coleccion OptiSpeech) |
| Piper TTS | VITS / otras | multiidioma | MIT | ONNX | Hugging Face / GitHub |
| Coqui TTS | Tacotron2 / VITS / otros | multiidioma | MPL-2.0 (varia) | varios | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Una unica voz (Mike); no hay variacion de hablante.
- Requiere espeak-ng instalado en el sistema; sin el, es necesario el extra `phoonnx[espeak]` con el port espyak, que puede producir errores de pronunciacion en algunas palabras.
- El texto debe pasar por normalizacion y fonemizacion (scriptconv) antes de la sintesis; no acepta texto crudo directamente.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- La licencia MIT del upstream se declara en la model card de mush42/optispeech; conviene verificar los terminos exactos del modelo original antes de uso comercial.
- No se documentan sesgos especificos, pero al ser una voz unica en ingles estadounidense, no representa diversidad de acentos o generos.
- El repositorio tiene un tamano de 0.0 GB segun Hugging Face, lo que sugiere que los pesos pueden estar gestionados externamente o que el empaquetado es minimo; verificar la integridad de los archivos antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/optispeech-en_us-lightspeech_mike
- Modelo original (upstream): https://huggingface.co/mush42/optispeech/tree/main/onnx/lightspeech/en-us
- Coleccion OptiSpeech para phoonnx: https://huggingface.co/collections/Phoonnx/optispeech-6af8ea9492a4f8f4e0f1cf30
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
