# Phoonnx/glowtts-en_us-blizzard_fls

## Resumen

Glow-TTS en inglés estadounidense empaquetado para la librería ONNX phoonnx. El modelo original es un Glow-TTS desarrollado por Rhasspy para el proyecto Larynx, distribuido originalmente como archivo tar.gz en la release v1.0 de larynx. Esta versión, publicada por Phoonnx, convierte el modelo a formato ONNX y lo integra en el ecosistema phoonnx/OVOS, facilitando su uso en asistentes de voz y aplicaciones de síntesis de habla.

Se trata de un modelo acústico que genera espectrogramas a partir de fonemas IPA procesados con gruut; la síntesis de audio final la realiza un vocoder externo, concretamente hifigan-multi-vctk-small, que phoonnx descarga automáticamente junto con la voz. El modelo está orientado exclusivamente a inglés estadounidense y su tamaño de repositorio es de 0,1 GB, lo que refleja un modelo compacto apto para despliegues ligeros.

Su relevancia actual radica en la integración con el stack OVOS (Open Voice OS) y phoonnx, que permite incorporar TTS en asistentes de voz autoalojados sin depender de servicios en la nube. No obstante, la licencia no está registrada en la model card, lo que introduce incertidumbre para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela directamente la alineación entre texto y espectrograma sin necesidad de un aligner externo, a diferencia de los enfoques autorregresivos tipo Tacotron. Genera un espectrograma mel a partir de la secuencia de fonemas, que posteriormente se convierte en forma de onda mediante el vocoder HiFi-GAN. La arquitectura concreta de este checkpoint (número de capas, canales, dimensión latente) no está detallada en la información disponible.

El modelo procede de la release v1.0 de Rhasspy Larynx, entrenado sobre el corpus Blizzard FLS para inglés estadounidense. No se dispone de información sobre el número de tokens de audio, composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente en TTS). La innovación principal de esta publicación es el empaquetado en ONNX para phoonnx, junto con la integración del front-end de texto mediante scriptconv y el fonemizador gruut.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto escrito.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut de scriptconv.
- Generación de espectrogramas que se convierten en audio con el vocoder HiFi-GAN.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programático en Python a través de `TTSModelManager` de phoonnx.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.
- Multilingüismo limitado exclusivamente a en-US.

## Casos de uso

- Asistentes de voz autoalojados: integración en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionando la voz `larynx/en-us-blizzard_fls-glow_tts` en `mycroft.conf` para respuestas habladas sin depender de la nube.
- Síntesis en aplicaciones Python: uso de `TTSModelManager` y `voice.synthesize_wav(text, wav_file)` para generar archivos WAV a partir de frases en inglés, adecuado para prototipos y scripts.
- Lectura de textos en inglés en dispositivos de recursos limitados: el tamaño de 0,1 GB y el formato ONNX permiten despliegues ligeros en entornos con poca memoria.
- Generación de avisos y notificaciones por voz: frases cortas en inglés estadounidense para sistemas domóticos o de accesibilidad.
- Pruebas de pipelines TTS: validación de front-ends de fonemización (gruut/IPA) y de integración con vocoders HiFi-GAN en entornos de investigación.
- Sistemas de lectura de contenido en inglés: conversión de texto a audio para artículos o mensajes, siempre que el contenido esté en en-US y se acepte la calidad de un modelo compacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, lo que sugiere un modelo muy ligero apto para CPU.
- GPU recomendadas: no disponible; por el tamaño, cualquier GPU consumer moderna sería suficiente, aunque no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño reducido, aunque no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ejecución ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| glowtts-en_us-blizzard_fls (este) | Glow-TTS + HiFi-GAN small | en-US | ONNX | other (sin registrar) | fonemas IPA (gruut) |
| Otras voces Glow-TTS de la colección Phoonnx | Glow-TTS | variable | ONNX | variable | fonemas IPA (gruut) |
| Modelos Larynx originales (Rhasspy) | Glow-TTS | varios | tar.gz (formato original) | variable | fonemas IPA |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría se limita a las voces de la colección Glow-TTS de Phoonnx y a los modelos Larynx originales, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de competidores en la información proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica "other" y recomienda consultar la release upstream antes de usar el modelo; existe riesgo para uso comercial.
- Idioma restringido a inglés estadounidense (en-US); no admite otros idiomas.
- Depende de un vocoder externo (hifigan-multi-vctk-small) que debe descargarse; sin él no se genera audio.
- Requiere el front-end de fonemización gruut mediante el extra `scriptconv[gruut]`; sin él no se procesa la entrada.
- Al ser un modelo TTS, puede presentar errores de pronunciación en palabras poco frecuentes, nombres propios o siglas.
- No se dispone de información sobre sesgos del corpus Blizzard FLS ni sobre evaluación de calidad (MOS) en la información proporcionada.
- No apto para tareas de razonamiento, código o agentes; su única función es la síntesis de voz.
- El tamaño compacto puede implicar menor naturalidad que modelos TTS de mayor escala, aunque no hay datos objetivos disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-blizzard_fls
- Upstream original (Rhasspy Larynx): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_blizzard_fls-glow_tts.tar.gz
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv (repositorio): https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
