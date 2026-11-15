# Phoonnx/glowtts-en_us-cmu_jmk

## Resumen

glowtts-en_us-cmu_jmk es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la librería `phoonnx`. El modelo convierte fonemas del inglés estadounidense (en-US) en representaciones espectrales (mel-espectrogramas) que posteriormente son transformadas en audio por un vocoder HiFi-GAN externo (`hifigan-multi-vctk-small`). Se trata, por tanto, de un sistema TTS en dos etapas: un generador acústico Glow-TTS y un vocoder neuronal.

El modelo está orientado a la síntesis de voz local y de baja latencia en entornos domóticos y asistentes de voz, especialmente dentro del ecosistema OVOS/Mycroft, donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de lenguaje generativo ni un sistema multimodal: su única función es la conversión de texto a voz en inglés. Su relevancia actual radica en que permite ejecutar TTS neuronal completamente offline en hardware modesto, sin depender de servicios en la nube.

El repositorio es pequeño (aproximadamente 0,1 GB), incluye pesos en formato ONNX y está etiquetado con licencia "other", sin que la model card especifique los términos exactos. El modelo registra un volumen muy bajo de descargas (31 en el momento de la consulta) y no cuenta con métricas de rendimiento publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (generador acústico normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada en la model card; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que aprende una correspondencia biyectiva entre la secuencia de fonemas y el mel-espectrograma, sin necesidad de alineamientos externos ni de un modelo de atención autorregresivo. La arquitectura emplea un encoder Transformer sobre los fonemas y un decoder compuesto por bloques invertibles (actnorm, convoluciones 1x1 y coupling layers) que transforman el espacio latente en el espectrograma. El alineamiento entre fonemas y frames se aprende mediante un mecanismo de búsqueda monotónica (monotonic alignment search), lo que aporta robustez y velocidad de inferencia frente a modelos autorregresivos como Tacotron 2.

El modelo concreto `en-us_cmu_jmk` procede de la versión 1.0 de Larynx de Rhasspy y está entrenado sobre un corpus de voz identificado como "cmu_jmk", cuyos detalles de composición, número de horas y número de tokens no se especifican en la información proporcionada. No se dispone de datos sobre el proceso de entrenamiento, el uso de RLHF/DPO (no aplicable en TTS) ni innovaciones adicionales más allá de las propias de Glow-TTS. El vocoder HiFi-GAN multi-hablante (multi-VCTK small) se descarga automáticamente junto con la voz al usar `phoonnx`.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`), incluyendo normalización de texto previa.
- Generación de mel-espectrogramas que se transforman en audio mediante el vocoder HiFi-GAN asociado.
- Integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local y offline mediante ONNX Runtime, sin dependencia de servicios externos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking". Es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del inglés estadounidense.
- No dispone de control explícito de prosodia, emoción ni estilo en la documentación disponible.

## Casos de uso

- Asistentes de voz domésticos offline: el modelo se integra en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente local responda por voz sin enviar texto a la nube, lo que preserva la privacidad y reduce la latencia de red.
- Lectura de notificaciones y alertas en sistemas embebidos: al ejecutarse sobre ONNX Runtime y con un repositorio de ~0,1 GB, puede desplegarse en dispositivos de recursos limitados (Raspberry Pi, mini-PC) para anunciar eventos, recordatorios o estados del sistema.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla, artículos o mensajes a voz en aplicaciones de escritorio o web que necesiten un motor TTS local y ligero.
- Síntesis de voz en pipelines de generación de contenido: producción de narraciones para audiolibros, podcasts o vídeos a partir de texto previamente normalizado, usando la cadena `scriptconv` + `phoonnx` para automatizar el proceso.
- Pruebas y desarrollo de sistemas de diálogo: generación rápida de respuestas habladas en entornos de test de asistentes conversacionales, donde se requiere un TTS determinista y de bajo coste computacional.
- Interfaces de voz en aplicaciones de robótica o IoT: emisión de mensajes hablados en robots de servicio o dispositivos industriales que operan sin conectividad, aprovechando la inferencia local en ONNX.
- Sustitución de motores TTS comerciales en prototipos: al ser un modelo pequeño y de código abierto empaquetado, sirve para validar flujos de voz antes de migrar a soluciones con licencia comercial clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) y la naturaleza del modelo Glow-TTS + HiFi-GAN small, se espera un consumo de memoria muy reducido (del orden de cientos de MB), aunque no se confirma en la documentación.
- GPU recomendadas: no especificadas. El modelo está pensado para ejecución en CPU mediante ONNX Runtime; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 3060 o superiores) podría acelerar la inferencia, pero no se documenta.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el reducido tamaño del modelo, aunque no se aportan cifras oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime de forma directa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Vocoder | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-en_us-cmu_jmk (este) | Glow-TTS | en-US | HiFi-GAN multi-VCTK small | other (sin especificar) | ONNX | Hugging Face (Phoonnx) |
| Otras voces Larynx Glow-TTS (colección Phoonnx) | Glow-TTS | en-US y otros | HiFi-GAN | other | ONNX | Hugging Face (Phoonnx) |
| Piper (rhasspy/piper-voices) | VITS | múltiples | integrado en VITS | MIT (según proyecto) | ONNX | Hugging Face / GitHub |
| Coqui TTS (modelos VITS/Tacotron) | VITS / Tacotron 2 | múltiples | HiFi-GAN / otros | MPL 2.0 (según modelo) | PyTorch / ONNX | GitHub / Hugging Face |

La comparación cuantitativa de parámetros, contexto y rendimiento no está disponible en la información proporcionada. Piper y Coqui TTS se citan como alternativas de la misma categoría (TTS neuronal local), pero los datos concretos de cada uno no se han verificado en esta ficha.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- La licencia figura como "other" y la model card indica explícitamente que no hay licencia registrada, por lo que se debe consultar la release upstream de Rhasspy/Larynx antes de cualquier uso comercial.
- Al ser un modelo TTS y no un modelo de lenguaje, no presenta alucinación en el sentido habitual, pero sí puede producir pronunciaciones incorrectas ante texto no normalizado, siglas, números o palabras fuera del vocabulario fonético de gruut.
- No se documentan sesgos específicos de género, acento o etnia del hablante "cmu_jmk"; el corpus de entrenamiento no está descrito.
- No dispone de control de prosodia, emoción ni velocidad en la documentación; la calidad depende del front-end `scriptconv`/gruut y del vocoder asociado.
- El repositorio tiene muy pocas descargas (31) y nula actividad en likes, lo que sugiere escasa validación por parte de la comunidad.
- No se han publicado benchmarks objetivos (MOS, WER, latencia) que permitan evaluar su calidad frente a alternativas.
- La integración depende de la librería `phoonnx` en versión pre-release (`pip install --pre phoonnx`), lo que implica riesgo de cambios de API.
- El vocoder se descarga por separado al cargar la voz, lo que requiere conectividad en el primer uso o un aprovisionamiento previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_jmk
- Repositorio upstream (Larynx, Rhasspy): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_jmk-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder asociado: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
