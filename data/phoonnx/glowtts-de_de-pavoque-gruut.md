# Phoonnx/glowtts-de_de-pavoque-gruut

## Resumen

glowtts-de_de-pavoque-gruut es un modelo de síntesis de voz (text-to-speech) en alemán empaquetado en formato ONNX para la librería phoonnx. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, publicado en su release v1.0 como `de-de_pavoque-glow_tts.tar.gz`, y ha sido reempaquetado por Phoonnx para su ejecución mediante ONNX Runtime. Se trata de una voz concreta del catálogo Larynx: la voz "pavoque" para alemán estándar (de-DE).

El modelo resuelve la conversión de texto a espectrograma mel, que posteriormente se convierte en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`, descargado automáticamente por phoonnx. La entrada de texto no es texto plano directo, sino fonemas gruut en alfabeto IPA, procesados por la librería scriptconv. Esto lo hace adecuado para pipelines de TTS integrados en asistentes de voz (OVOS/Mycroft) más que para uso genérico de altavoz.

Por su tamaño reducido (repo de 0,1 GB), su naturaleza ONNX y su integración con el ecosistema phoonnx/OVOS, es relevante para desarrolladores que necesitan una voz alemana ligera, ejecutable en CPU y fácilmente desplegable en entornos de asistente doméstico o embebidos, sin depender de infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (texto a espectrograma) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es una arquitectura de síntesis de voz no autoregresiva basada en normalizing flows y alineamiento monotónico, que transforma secuencias de fonemas en espectrogramas mel de forma paralela. En este caso, el modelo empaquetado se limita a la etapa texto-a-espectrograma; la generación de la forma de onda corre a cargo del vocoder HiFi-GAN `hifigan-multi-vctk-small`, que phoonnx descarga junto con la voz. La entrada no es texto libre sino fonemas gruut en IPA, lo que requiere el extra `scriptconv[gruut]` para la normalización y fonemización previa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo procede del release v1.0 de Larynx de Rhasspy, un proyecto de TTS para asistentes de voz de código abierto. La innovación principal del empaquetado es la conversión a ONNX para inferencia portable y su integración con phoonnx, que gestiona la descarga del vocoder y la orquestación del pipeline completo.

## Capacidades

- Síntesis de voz en alemán estándar (de-DE) a partir de fonemas gruut en IPA.
- Generación de espectrogramas mel que el vocoder HiFi-GAN convierte en audio WAV.
- Integración con la librería phoonnx para síntesis directa a fichero WAV.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto a fonemas mediante scriptconv (extra `scriptconv[gruut]`).
- Ejecución en ONNX Runtime, sin dependencia obligatoria de GPU.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz domésticos con OVOS/Mycroft: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en alemán en un asistente local sin enviar texto a servicios en la nube.
- Síntesis en dispositivos embebidos o de bajos recursos: al distribuirse en ONNX y ocupar 0,1 GB, puede ejecutarse en CPU en Raspberry Pi o mini-PC, ideal para altavoces inteligentes caseros.
- Generación de avisos y notificaciones habladas en alemán: integrable en scripts Python que produzcan ficheros WAV con `voice.synthesize_wav(text, wav_file)` para sistemas de megafonía o alertas.
- Accesibilidad: lectura en voz alta de contenido textual en alemán para personas con discapacidad visual, dentro de aplicaciones de escritorio que embeban phoonnx.
- Prototipado de pipelines TTS multilingües: sirve como una de las voces del catálogo Larynx para comparar calidad y latencia frente a otras voces alemanas del mismo proyecto.
- Pruebas de integración en CI/CD de asistentes de voz: al ser un modelo ligero y determinista en formato ONNX, es adecuado para tests automatizados de la capa TTS sin coste de GPU.
- Investigación en fonética alemana: permite experimentar con fonemas IPA de entrada y observar la salida acústica del modelo Glow-TTS sobre una voz concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que la inferencia quepa en CPU y en GPUs de gama baja, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con soporte ONNX Runtime (incluidas GTX 1050 o superiores) debería ser suficiente; no se confirma.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU consumer moderna, dado el tamaño del repositorio; sin datos oficiales de consumo de memoria.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada |
|---|---|---|---|---|---|
| glowtts-de_de-pavoque-gruut | Glow-TTS + HiFi-GAN | de-DE | ONNX | other (sin registrar) | fonemas gruut IPA |
| Otras voces Larynx de-de (p. ej. thorsten, kathrin) | Glow-TTS + HiFi-GAN | de-DE | tarball / ONNX segun empaquetado | otras licencias upstream | fonemas gruut IPA |
| Piper (rhasspy/piper-voices) | VITS | múltiples, incl. de | ONNX | MIT (mayoritariamente) | fonemas espeak-ng |
| Coqui TTS (modelos alemanes) | VITS / Tacotron2 | de | PyTorch / ONNX | MPL-2.0 / otras | texto o fonemas |

La comparación detallada de parámetros y rendimiento no está disponible para este modelo. Frente a Piper, la diferencia clave es el front-end fonético (gruut frente a espeak-ng) y la licencia, que en este caso no está registrada y obliga a revisar el upstream.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada en la model card; es imprescindible revisar el release original de Rhasspy/Larynx antes de cualquier uso comercial.
- Solo soporta alemán (de-DE); no es multilingüe.
- Requiere fonemización previa con gruut (extra `scriptconv[gruut]`); no acepta texto plano sin el front-end adecuado.
- Depende de un vocoder externo (`hifigan-multi-vctk-small`) que phoonnx descarga por separado; sin él no produce audio.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o nombres propios, inherente a los sistemas TTS basados en fonemas.
- No se han publicado métricas de calidad (MOS), latencia ni robustez, por lo que la evaluación en producción debe hacerse empíricamente.
- Modelo con muy pocas descargas (21) y sin likes, lo que sugiere escasa validación comunitaria.
- No dispone de control de emoción, estilo ni velocidad más allá de lo que permita el pipeline de phoonnx.
- No es un modelo de lenguaje: no razona, no hace tool calling ni procesa contexto conversacional.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-pavoque-gruut
- Upstream Larynx (release v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_pavoque-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS en phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Proyecto Larynx (Rhasspy): https://github.com/rhasspy/larynx
