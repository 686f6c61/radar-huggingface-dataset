# Phoonnx/glowtts-en_us-cmu_lnh

## Resumen

glowtts-en_us-cmu_lnh es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la librería de inferencia `phoonnx`. El modelo genera espectrogramas mel a partir de fonemas IPA obtenidos mediante el fonemizador gruut, que posteriormente son convertidos a audio por el vocoder HiFi-GAN `hifigan-multi-vctk-small`, descargado automáticamente junto con la voz.

Se trata de un modelo específico para inglés estadounidense (`en-US`) con una única voz identificada como `larynx/en-us-cmu_lnh-glow_tts`. Su relevancia actual radica en que permite integrar TTS neuronal de forma ligera (repositorio de 0,1 GB) en entornos Python y en el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, sin necesidad de infraestructura GPU dedicada.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada. El modelo se distribuye sin licencia registrada explícitamente, lo que exige verificar la licencia del release original de Larynx antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, text-to-spectrogram) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | `other` (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small (HiFi-GAN) |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que transforma una secuencia de fonemas en un espectrograma mel mediante un mecanismo de alineamiento monotónico aprendido (MAS, Monotonic Alignment Search). A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS permite síntesis paralela, lo que reduce la latencia de generación del espectrograma. En este caso, el modelo se distribuye como grafo ONNX listo para inferencia, no como checkpoint de entrenamiento.

El modelo procede del release v1.0 de Larynx de Rhasspy (`en-us_cmu_lnh-glow_tts.tar.gz`). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning posteriores. El identificador `cmu_lnh` sugiere el uso del diccionario de pronunciación CMU y un hablante o estilo concreto (`lnh`), pero no se especifica en la documentación. La generación de audio final recae en el vocoder HiFi-GAN `hifigan-multi-vctk-small`, que convierte el espectrograma en forma de onda.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV mediante `voice.synthesize_wav()`.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut integrado en `scriptconv`.
- Generación de espectrogramas mel seguida de vocoderización HiFi-GAN para producir audio inteligible.
- Integración nativa con el asistente de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Uso programático en Python mediante `TTSModelManager` y carga de voces por nombre (`larynx/en-us-cmu_lnh-glow_tts`).
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada a `en-US`; no se declaran otros idiomas.

## Casos de uso

- Asistente de voz doméstico con OVOS: el modelo se instala como plugin TTS (`ovos-tts-plugin-phoonnx`) y se selecciona la voz en `mycroft.conf`, permitiendo respuestas habladas en inglés sin depender de servicios en la nube.
- Síntesis de avisos y notificaciones en aplicaciones de escritorio o IoT: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en dispositivos con recursos limitados para leer alertas o mensajes del sistema.
- Generación de audio para prototipos de interfaces conversacionales: desarrolladores que necesiten una voz inglesa rápida para pruebas de UX pueden cargar la voz con `TTSModelManager` y sintetizar frases bajo demanda.
- Accesibilidad: lectura en voz alta de contenido textual en inglés para usuarios con discapacidad visual, integrada en aplicaciones Python mediante la API `synthesize_wav`.
- Investigación en TTS y evaluación de pipelines: sirve como referencia de un sistema Glow-TTS + HiFi-GAN empaquetado en ONNX para comparar latencia y calidad frente a otros vocoders o arquitecturas.
- Automatización de locuciones para contenidos educativos o demos: permite generar narraciones en inglés de forma local y reproducible, sin coste por petición ni envío de texto a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB) y el uso de ONNX, es plausible su ejecución en CPU, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU y potencialmente en GPU, pero no se especifican requisitos.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_lnh (este) | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| Otras voces Larynx de Rhasspy | Glow-TTS + HiFi-GAN | varios | tar.gz / ONNX | según release upstream | GitHub Rhasspy/Larynx |
| Otras voces de la colección Phoonnx Glow-TTS | Glow-TTS + HiFi-GAN | varios | ONNX | other | Hugging Face (colección Phoonnx) |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- La licencia figura como `other` y no hay licencia registrada; es imprescindible verificar la licencia del release original de Larynx antes de usar el modelo comercialmente.
- Al ser un modelo TTS, puede producir pronunciaciones incorrectas en palabras fuera del diccionario CMU o en nombres propios; la calidad depende del fonemizador gruut.
- No se dispone de información sobre sesgos de hablante, acento o género; la voz `lnh` no está descrita en la documentación.
- Riesgo de artefactos acústicos propios de Glow-TTS + HiFi-GAN en frases largas o con puntuación atípica; no hay métricas publicadas de MOS o inteligibilidad.
- No apto para tareas de razonamiento, código o visión; su única función es la síntesis de voz.
- La fecha de creación del repositorio (2026-11-14) y el bajo número de descargas (33) indican un modelo reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_lnh
- Release original de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_lnh-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
