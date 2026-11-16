# Phoonnx/glowtts-en_us-cmu_lnh-gruut

## Resumen

`glowtts-en_us-cmu_lnh-gruut` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera espectrogramas mel a partir de fonemas IPA del inglés estadounidense (`en-US`) y delega la generación de audio final en el vocoder `hifigan-multi-vctk-small`, que se descarga automáticamente junto con la voz.

El modelo está pensado para integrarse en asistentes de voz y sistemas de lectura en tiempo real. Su front-end textual utiliza `scriptconv` con el fonemizador `gruut`, que normaliza el texto y lo convierte a la representación fonética que espera la red. Con un tamaño de repositorio de 0,1 GB y pesos en ONNX, está optimizado para inferencia en CPU y despliegues ligeros, no para entrenamiento ni fine-tuning.

Es relevante para desarrolladores que construyen pipelines TTS embebidos o privados (por ejemplo, en OVOS/Mycroft) y que necesitan una voz inglesa ligera, sin dependencias de servicios en la nube. No obstante, la licencia no está registrada en el repositorio y debe verificarse en la release original de Rhasspy antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, generación de espectrogramas mel) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small (ONNX) |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que aprende una correspondencia directa entre secuencias de fonemas y espectrogramas mel, sin necesidad de atención autoregresiva ni de un aligner externo. La alineación entre texto y audio se resuelve mediante búsqueda de caminos monótonos (monotonic alignment search) durante el entrenamiento, lo que permite una síntesis paralela y por tanto mucho más rápida que modelos autoregresivos como Tacotron 2. El modelo produce espectrogramas que posteriormente son convertidos a forma de onda por el vocoder HiFi-GAN.

En este caso concreto, el modelo proviene del release v1.0 de Larynx de Rhasspy, un proyecto orientado a voces TTS de alta calidad para asistentes de voz. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o ajuste fino posteriores; estos datos deben consultarse en la documentación original de Larynx. La innovación práctica del empaquetado de Phoonnx es la conversión a ONNX y la integración con `scriptconv`, que unifica normalización de texto, fonemización y síntesis en un único pipeline reproducible.

## Capacidades

- Síntesis de voz en inglés estadounidense (`en-US`) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante el fonemizador `gruut` integrado en `scriptconv`.
- Generación de espectrogramas mel con Glow-TTS y conversión a audio WAV con el vocoder HiFi-GAN.
- Salida directa a fichero WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en CPU gracias a los pesos ONNX, sin requerir GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar esta voz en `mycroft.conf` y sintetizar respuestas del asistente sin enviar texto a servicios externos, lo que preserva la privacidad y reduce la latencia de red.
- Lectura de notificaciones y alertas en sistemas embebidos: al ejecutarse en CPU con pesos ONNX de ~0,1 GB, puede desplegarse en Raspberry Pi u otros dispositivos de recursos limitados para leer mensajes del sistema.
- Generación de audiolibros o contenido pregrabado por lotes: la síntesis paralela de Glow-TTS permite procesar grandes volúmenes de texto en pipelines offline sin depender de APIs comerciales.
- Accesibilidad para aplicaciones de escritorio: integración en lectores de pantalla o herramientas de accesibilidad que necesiten una voz inglesa ligera y embebible.
- Prototipado rápido de interfaces conversacionales: permite validar flujos de voz en inglés antes de invertir en voces comerciales o modelos más grandes.
- Pruebas de regresión en pipelines de TTS: al ser un modelo pequeño y determinista en su arquitectura, sirve como referencia para comparar cambios en el front-end de normalización de texto (`scriptconv`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está empaquetado en ONNX y está pensado para ejecución en CPU.
- GPU recomendadas: no se especifican; al ser un modelo de ~0,1 GB, cualquier GPU con soporte ONNX Runtime sería suficiente, aunque el caso de uso principal es CPU.
- Cabe en GPU de consumo: sí, con margen amplio, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_lnh-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | ~0,1 GB |
| Piper (rhasspy) | VITS | multilingüe | ONNX | MIT (según proyecto) | variable |
| Coqui TTS (VITS) | VITS | multilingüe | PyTorch | MPL 2.0 | variable |
| Larynx (upstream) | Glow-TTS | multilingüe | TensorFlow/ONNX | según release | variable |

No se dispone de datos de rendimiento comparativo publicados para este modelo concreto en la información proporcionada.

## Limitaciones y advertencias

- La licencia figura como `other` y la model card indica explícitamente que no hay licencia registrada; es imprescindible verificar la release original de Rhasspy antes de cualquier uso comercial.
- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- Requiere un front-end de fonemización (`gruut` vía `scriptconv`) para producir la entrada correcta; un texto mal normalizado degradará la calidad de la síntesis.
- Depende de un vocoder externo (`hifigan-multi-vctk-small`) que se descarga por separado; sin él no se genera audio.
- Al ser un modelo TTS, no razona ni mantiene contexto conversacional; no debe usarse para tareas de generación de texto.
- No se han publicado métricas de calidad (MOS, WER) ni evaluaciones de sesgo en la información disponible.
- El número de descargas (21) y likes (0) sugiere un uso muy limitado; la validación en producción corre por cuenta del integrador.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/glowtts-en_us-cmu_lnh-gruut)
- [Release original de Larynx v1.0 (Rhasspy)](https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_lnh-glow_tts.tar.gz)
- [Vocoder hifigan-multi-vctk-small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
- [Colección Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
