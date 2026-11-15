# Phoonnx/glowtts-en_us-cmu_eey

## Resumen

glowtts-en_us-cmu_eey es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con la librería de inferencia phoonnx. El modelo genera espectrogramas mel a partir de fonemas IPA del inglés estadounidense (en-US) y delega la síntesis de audio final en un vocoder HiFi-GAN externo (hifigan-multi-vctk-small).

El modelo resuelve el problema de la conversión texto-a-voz en entornos locales y de bajos recursos: al estar empaquetado en ONNX y ocupar apenas 0,1 GB en el repositorio, está pensado para ejecutarse en CPU sin GPU dedicada, integrándose en asistentes de voz como OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx. Su relevancia actual radica en su naturaleza ligera y offline, orientada a despliegues de domótica y asistentes embebidos donde la latencia y el consumo de recursos son críticos.

Se trata de un modelo específico de una única voz y un único idioma (en-US), sin capacidades multilingües ni de clonación. La información pública disponible es escasa: no se detallan parámetros totales, contexto ni datos de entrenamiento más allá de su procedencia del release v1.0 de Larynx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based, no autorregresiva) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repo | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz no autorregresivo basado en normalizing flows. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS aprende una alineación monotónica entre fonemas y frames de espectrograma mediante programación dinámica, lo que permite una síntesis paralela y por tanto más rápida. El modelo produce un espectrograma mel que posteriormente es convertido a forma de onda por el vocoder HiFi-GAN (variante multi-VCTK small).

El modelo procede del release v1.0 del proyecto Larynx de Rhasspy (en-us_cmu_eey-glow_tts.tar.gz). No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La voz "cmu_eey" corresponde a un hablante concreto del corpus CMU Arctic, si bien este detalle no se confirma explícitamente en la información proporcionada. La innovación técnica principal es su empaquetado en ONNX para inferencia portable y su integración con el front-end de fonemización gruut.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US), previa conversión a fonemas IPA mediante gruut.
- Generación de espectrogramas mel que se convierten a audio mediante el vocoder HiFi-GAN asociado.
- Ejecución local y offline, sin dependencia de servicios en la nube.
- Integración con asistentes de voz OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx.
- Inferencia en CPU gracias al formato ONNX y al reducido tamaño del modelo.
- Una única voz predefinida (no soporta clonación ni selección de hablante).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz para domótica: el modelo puede integrarse en OVOS/Mycroft para leer respuestas del asistente en local, sin enviar texto a servicios externos, gracias a su ejecución offline en CPU.
- Sistemas embebidos y Raspberry Pi: con un repositorio de 0,1 GB y formato ONNX, es viable desplegarlo en dispositivos de bajos recursos donde no cabe un modelo TTS de mayor tamaño.
- Lectura de notificaciones y alertas: puede sintetizar mensajes cortos en inglés para sistemas de monitorización, alarmas o logs hablados en tiempo real.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla en inglés estadounidense en entornos de escritorio sin GPU.
- Prototipado de pipelines TTS: sirve como base para experimentar con la librería phoonnx y el front-end scriptconv antes de escalar a voces de mayor calidad.
- Generación de audio para pruebas automatizadas: permite crear ficheros WAV de referencia en pipelines de test de sistemas de voz sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para inferencia en CPU y su tamaño (0,1 GB de repositorio) sugiere un consumo de memoria muy reducido.
- GPU recomendadas: no se especifican; no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU consumer, aunque no se documenta.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS/Mycroft, inferencia ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_eey | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | 0,1 GB |
| Otras voces Larynx (Rhasspy) | Glow-TTS + HiFi-GAN | varios | tar.gz / ONNX | según release upstream | variable |
| Piper (rhasspy) | VITS | multilingüe | ONNX | MIT (habitual) | variable |
| Coqui TTS (modelos VITS) | VITS | multilingüe | PyTorch | MPL 2.0 (habitual) | variable |

Nota: los datos de licencia y tamaño de los modelos comparados no se confirman en la información proporcionada y deben verificarse en sus repositorios respectivos.

## Limitaciones y advertencias

- Modelo de una sola voz y un solo idioma (en-US); no soporta otros idiomas ni cambio de hablante.
- Requiere un front-end de fonemización gruut y el vocoder externo hifigan-multi-vctk-small; no es autónomo sin ellos.
- Licencia "other" sin licencia registrada explícitamente: es imprescindible verificar la licencia del release upstream de Larynx antes de cualquier uso comercial.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o nombres propios, inherente a los sistemas TTS basados en fonemas.
- Calidad de audio limitada por el vocoder small (multi-VCTK), inferior a modelos TTS modernos de mayor tamaño.
- No se documentan sesgos del hablante ni de prosodia; al derivar de un corpus concreto, la voz queda fijada a las características de dicho corpus.
- Sin datos publicados de benchmarks ni de rendimiento en producción; conviene validar latencia y calidad en el hardware objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_eey
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_eey-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
