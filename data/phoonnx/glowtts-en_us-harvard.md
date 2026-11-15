# Phoonnx/glowtts-en_us-harvard

## Resumen

`Phoonnx/glowtts-en_us-harvard` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera espectrogramas mel a partir de fonemas IPA (obtenidos mediante el fonemizador gruut) y delega la síntesis de audio final en un vocoder HiFi-GAN, en concreto la variante `hifigan-multi-vctk-small`, que phoonnx descarga automáticamente junto con la voz.

Se trata de un modelo específico para inglés estadounidense (`en-US`), de propósito acotado: conversión de texto a voz dentro del ecosistema OVOS/Mycroft y de la librería phoonnx. No es un modelo de lenguaje general ni compite en la categoría de LLMs; su relevancia radica en que permite desplegar TTS local y ligero (repo de 0,1 GB) sin dependencias de servicios en la nube, integrándose como plugin de OVOS (`ovos-tts-plugin-phoonnx`).

La información pública disponible es muy limitada: la model card no detalla número de parámetros, tokens de entrenamiento ni resultados de benchmarks, y la licencia figura como "other" sin que se registre una licencia concreta, lo que obliga a consultar la release original de Larynx antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico generativo basado en normalizing flows) + vocoder HiFi-GAN (`hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por frase, no por ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | `en-US` (inglés estadounidense) |
| Licencia | other (no se registra licencia concreta; consultar la release upstream de Larynx) |
| Formato de pesos | ONNX (librería `phoonnx`); el vocoder se descarga por separado |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Autor original | Rhasspy (proyecto Larynx v1.0) |
| Empaquetado | Phoonnx |
| Tamano del repo | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acústico de síntesis de voz que emplea normalizing flows para modelar la distribución del espectrograma mel condicionada a la secuencia de fonemas, con alineamiento monotónico aprendido (sin necesidad de attention externa ni de alineamientos forzados durante el entrenamiento). El modelo produce un espectrograma mel que posteriormente es convertido a forma de onda por un vocoder neuronal HiFi-GAN; en este empaquetado, la variante `hifigan-multi-vctk-small`, entrenada sobre el corpus multi-hablante VCTK.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron etapas de RLHF/DPO (poco habituales en TTS). La model card únicamente indica la procedencia: la release `v1.0` de Larynx (`en-us_harvard-glow_tts.tar.gz`), un proyecto de Rhasspy orientado a asistentes de voz offline. La innovación relevante aquí es el empaquetado: conversión a ONNX y sustitución del front-end de texto por `scriptconv` con el fonemizador gruut, lo que permite ejecutar el modelo en Python y como plugin de OVOS sin el stack original de Larynx.

## Capacidades

- Síntesis de voz (text-to-speech) para inglés estadounidense a partir de texto plano.
- Fonemización mediante gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`), con normalización de texto previa.
- Generación de espectrogramas mel y conversión a WAV mediante el vocoder HiFi-GAN integrado en el flujo de phoonnx.
- Integración como plugin de OVOS (`ovos-tts-plugin-phoonnx`) seleccionable desde `mycroft.conf`.
- Uso programático en Python a través de `TTSModelManager` y el objeto `voice.synthesize_wav(text, wav_file)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.
- Capacidad multilingüe: no; únicamente `en-US`.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `larynx/en-us-harvard-glow_tts` en `mycroft.conf`, permitiendo respuestas habladas sin conexión a servicios externos.
- Síntesis de voz en aplicaciones Python de escritorio: mediante `TTSModelManager` y `synthesize_wav`, se puede generar audio WAV para notificaciones, lecturas de texto o interfaces accesibles dentro de una app.
- Lectura de contenido en dispositivos de recursos limitados: el repo ocupa 0,1 GB y los pesos están en ONNX, lo que facilita su despliegue en entornos embebidos o Raspberry Pi con el runtime de phoonnx.
- Prototipado de pipelines de voz en investigación: sirve como línea base TTS ligera para comparar con otros modelos acústicos o vocoders dentro del mismo framework.
- Generación de audio para pruebas automatizadas de sistemas de reconocimiento de voz: se puede sintetizar un corpus controlado en `en-US` para validar pipelines ASR.
- Integración en asistentes domésticos autoalojados: al no depender de la nube, encaja en despliegues de domótica o asistentes personales que requieren privacidad y funcionamiento offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repo (0,1 GB) y la arquitectura Glow-TTS + HiFi-GAN small, es previsible que quepa en GPUs de gama baja e incluso en CPU, pero no hay cifras oficiales.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se documenta explícitamente; el tamaño reducido del artefacto sugiere que sí, pero no se confirma.
- Opciones de despliegue: `phoonnx` (Python) con `pip install --pre phoonnx "scriptconv[gruut]"`; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-en_us-harvard` | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin especificar) | Empaquetado para phoonnx/OVOS; 0,1 GB |
| Otras voces de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | según voz | ONNX | other | Mismo pipeline y framework; disponibles en la colección `Phoonnx/glow-tts` |
| Larynx v1.0 (upstream Rhasspy) | Glow-TTS + vocoder | varios | tar.gz (stack original) | según release upstream | Origen del modelo; requiere el stack de Larynx |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no realiza razonamiento, generación de texto, código ni matemáticas.
- Idioma limitado a `en-US`; no soporta otros idiomas ni cambio de voz más allá de la voz empaquetada.
- Licencia "other" sin licencia concreta registrada: es imprescindible verificar la licencia de la release upstream de Larynx antes de cualquier uso comercial.
- No se documentan parámetros, datos de entrenamiento ni métricas de calidad (MOS, WER), por lo que no es posible evaluar su fidelidad sin pruebas propias.
- Riesgo de errores de pronunciación en palabras fuera del dominio del corpus de entrenamiento (p. ej., nombres propios, siglas, tecnicismos), inherente a los sistemas TTS basados en fonemas.
- Dependencia de la cadena `phoonnx` + `scriptconv[gruut]` + vocoder `hifigan-multi-vctk-small`; cambios en esas dependencias pueden afectar al funcionamiento.
- El número de descargas (30) y la ausencia de likes indican un modelo de nicho con poca validación comunitaria.
- No hay información sobre sesgos de voz (género, acento, etc.) ni sobre el corpus Harvard concreto empleado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-harvard
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_harvard-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
