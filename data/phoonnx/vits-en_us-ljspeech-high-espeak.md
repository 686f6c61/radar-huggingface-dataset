# Phoonnx/vits-en_us-ljspeech-high-espeak

## Resumen

`Phoonnx/vits-en_us-ljspeech-high-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su uso con su librería ONNX de TTS. El modelo toma texto en inglés estadounidense (`en-US`), lo convierte a fonemas IPA mediante espeak-ng y genera audio de voz de calidad alta. Su relevancia radica en que es un modelo compacto (repo de 0,1 GB en formato ONNX) que puede ejecutarse localmente sin GPU dedicada, orientado a asistentes de voz y aplicaciones de síntesis en tiempo real.

El modelo no es un LLM ni un transformer de propósito general: es un sistema TTS de extremo a extremo que combina un codificador de texto, un predictor de duración y un decodificador acústico con un vocoder integrado, todo dentro del paradigma VITS. Su valor práctico está en la integración con el ecosistema OVOS (Open Voice OS) y con la librería `phoonnx`, que abstrae la carga del modelo y la síntesis a WAV.

La ficha se centra en los datos disponibles en la model card y en los metadatos de Hugging Face; cualquier especificación no documentada se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto conversacional) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | `en-US` (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Upstream | `rhasspy/piper-voices/en/en_US/ljspeech/high` |
| Autor original | Rhasspy |
| Librería | `phoonnx` |
| Pipeline | text-to-speech |
| Tamaño del repo | 0,1 GB |
| Descargas | 23 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que integra en un único modelo un codificador de texto, un predictor de duración (alignment), un decodificador acústico basado en flujos normalizadores y un vocoder generativo. VITS emplea entrenamiento adversarial (GAN) junto con una verosimilitud variacional para producir audio de alta calidad sin necesidad de un vocoder externo separado. Esta es la arquitectura estándar de las voces Piper de Rhasspy.

El modelo concreto se corresponde con la voz `en_US/ljspeech/high` del repositorio `rhasspy/piper-voices`, entrenada sobre el corpus LJSpeech (lectura de una única hablante femenina en inglés estadounidense). La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales. La entrada de texto no es texto crudo: `phoonnx` delega en `scriptconv` la normalización y la fonemización mediante `EspeakPhonemizer` (extra `scriptconv[espeak]`), de modo que el modelo recibe fonemas IPA generados por espeak-ng. Esta dependencia de espeak-ng es una decisión de diseño relevante: el modelo no incluye su propio front-end de texto.

## Capacidades

- Síntesis de voz (TTS) en inglés estadounidense (`en-US`) a partir de texto.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Fonemización de entrada vía espeak-ng (IPA), con soporte alternativo del port `espyak` incluido en `phoonnx[espeak]`.
- Integración como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecución en navegador mediante `phoonnx.js` (VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No es multilingüe: solo `en-US`.

## Casos de uso

- Asistentes de voz locales (OVOS): el modelo se selecciona en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx` con la voz `piper/en_US-ljspeech-high`, permitiendo respuestas habladas sin depender de servicios en la nube.
- Síntesis en tiempo real en dispositivos de bajos recursos: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en CPU y en hardware embebido (Raspberry Pi, mini-PC) sin GPU dedicada.
- Generación de audiolibros y locuciones: la voz `ljspeech/high` está entrenada sobre LJSpeech, un corpus de lectura de una hablante única, lo que la hace adecuada para narración monótona y consistente.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual, ejecutándose localmente para preservar la privacidad.
- Sistemas de megafonía y anuncios automatizados: generación de avisos pregrabados o dinámicos en inglés estadounidense con latencia baja.
- Integración en aplicaciones web: mediante `phoonnx.js` y el demo en `tigregotico.pt/demo`, se puede sintetizar voz en el navegador sin backend.
- Pruebas de pipelines TTS en CI: al ser un modelo pequeño y con licencia MIT, sirve como voz de referencia para validar integraciones de `phoonnx` y `scriptconv`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es previsible que funcione en CPU sin GPU, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU.
- Cabe en GPU consumer: no disponible como dato oficial; por tamaño del repo (0,1 GB) es compatible con cualquier GPU consumer, pero no se confirma en la documentación.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` en navegador.
- Latencia y throughput estimados: no disponibles.
- Dependencia externa: requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-en_us-ljspeech-high-espeak` | VITS | en-US | ONNX | MIT | fonemas espeak (IPA) | Hugging Face, 23 descargas |
| Otras voces Piper `en_US` (p. ej. `rhasspy/piper-voices`) | VITS | en-US | ONNX | MIT (según upstream) | fonemas espeak | Hugging Face, amplia colección |
| Voces VITS de la colección Phoonnx | VITS | varios | ONNX | MIT | fonemas espeak | Hugging Face |
| Coqui TTS (p. ej. VITS/Tacotron) | VITS / Tacotron2 | varios | PyTorch / ONNX | MPL-2.0 / otras | texto o fonemas | GitHub, Hugging Face |

No se dispone de datos de benchmarks comparativos ni de métricas de calidad (MOS, RTF) en la información proporcionada, por lo que la comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no genera texto, no razona, no soporta tool calling ni agentes.
- Solo inglés estadounidense (`en-US`); no es multilingüe.
- Depende de espeak-ng para la fonemización; sin él, la síntesis falla o requiere el port `espyak`, cuyos fonemas difieren y pueden producir palabras mal pronunciadas.
- Entrenado sobre LJSpeech (una única hablante), por lo que la voz es fija y no permite cambio de hablante ni de estilo.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio del corpus (nombres propios, siglas, términos técnicos) debido a la fonemización automática.
- No se documentan sesgos específicos, pero al derivar de un corpus de lectura estadounidense puede reflejar sesgos de pronunciación y prosodia de esa variedad.
- Licencia MIT, lo que permite uso comercial según la declaración del upstream; conviene verificar la licencia del repositorio `rhasspy/piper-voices` original antes de redistribuir.
- Sin datos publicados de benchmarks, MOS ni latencia; no se puede garantizar calidad objetiva en producción sin evaluación propia.
- Repositorio con muy baja adopción (23 descargas, 0 likes) y fechas de creación/actualización anómalas en los metadatos; conviene validar la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljspeech-high-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/high
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
