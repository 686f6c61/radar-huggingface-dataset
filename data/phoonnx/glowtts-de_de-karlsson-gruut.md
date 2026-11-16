# Phoonnx/glowtts-de_de-karlsson-gruut

## Resumen

Glow-TTS en alemán (`de-DE`) empaquetado en formato ONNX por Phoonnx para su uso con la librería de síntesis de voz `phoonnx`. El modelo original procede de Rhasspy, concretamente del release v1.0 de Larynx, un proyecto de TTS ligero pensado para asistentes de voz locales. La voz concreta se identifica como `karlsson` y está entrenada sobre el conjunto de datos alemán de Larynx.

El modelo resuelve la generación de espectrogramas mel a partir de fonemas IPA proporcionados por el fonemizador `gruut`, y delega la síntesis de forma de onda en un vocoder HiFi-GAN (`hifigan-multi-vctk-small`) que Phoonnx descarga automáticamente junto con la voz. Es relevante para despliegues de TTS en local, sin dependencia de servicios en la nube, gracias a su reducido tamaño (repo de 0,1 GB) y al formato ONNX, que permite inferencia en CPU y en entornos embebidos como OVOS/Mycroft.

La arquitectura subyacente es Glow-TTS, un modelo de flujo normalizador con alineamiento monotónico por programación dinámica, sin necesidad de atención autorregresiva. No se dispone de información sobre el número de parámetros ni sobre el volumen exacto del corpus de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujo normalizador) + vocoder HiFi-GAN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en flujos normalizadores que transforma una distribución latente en un espectrograma mel mediante una serie de transformaciones invertibles. A diferencia de los modelos autorregresivos tipo Tacotron, emplea un mecanismo de alineamiento monotónico basado en programación dinámica (MAS, Monotonic Alignment Search) que aprende la correspondencia entre fonemas y frames de audio sin necesidad de alineamientos externos. La generación es paralela, lo que reduce la latencia de inferencia.

El modelo original fue entrenado por Rhasspy para el proyecto Larynx v1.0. No se dispone en la información proporcionada de detalles sobre el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning preferencial (poco habituales en TTS). La innovación destacable es el empaquetado en ONNX por parte de Phoonnx, que permite ejecutar el modelo fuera de PyTorch, y la integración con el fonemizador `gruut` a través de `scriptconv` para la normalización y conversión de texto a fonemas IPA.

## Capacidades

- Síntesis de voz en alemán estándar (`de-DE`) a partir de texto plano.
- Generación de espectrogramas mel que se convierten en audio mediante el vocoder HiFi-GAN asociado.
- Fonemización mediante `gruut` (extra `scriptconv[gruut]`), con conversión a alfabeto IPA.
- Normalización de texto previa a la síntesis a través de `scriptconv`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en local sin llamadas a servicios externos, al distribuirse en ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al alemán; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: la voz se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y permite respuestas habladas en alemán sin conexión a internet, aprovechando el tamaño reducido del modelo.
- Lectura de notificaciones y alertas en sistemas domóticos: el modelo sintetiza frases cortas en alemán con baja latencia gracias a la generación paralela de Glow-TTS, adecuada para avisos puntuales.
- Síntesis en dispositivos embebidos o de recursos limitados: al distribuirse en ONNX y ocupar 0,1 GB, puede ejecutarse en CPU en Raspberry Pi o equipos similares sin GPU dedicada.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en aplicaciones de escritorio en alemán, integrando `phoonnx` como backend de TTS.
- Generación de audiolibros o contenido narrado por lotes: el modelo puede procesar lotes de texto de forma offline, aunque la calidad y naturalidad dependerán de la voz `karlsson` y del vocoder multi-hablante.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia en alemán para validar integraciones con `scriptconv` y `phoonnx` antes de desplegar voces de mayor calidad.
- Prototipado de interfaces conversacionales en alemán: permite iterar rápidamente sobre diálogos sin coste de API, sustituyendo servicios comerciales durante el desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es lo suficientemente pequeño (repo de 0,1 GB) como para ejecutarse en CPU.
- GPU recomendadas: no se especifican; al ser ONNX y de tamaño reducido, cualquier GPU con soporte ONNX Runtime es suficiente. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-de_de-karlsson-gruut (este) | Glow-TTS + HiFi-GAN | de-DE | ONNX | other (sin registrar) | 0,1 GB | Hugging Face (Phoonnx) |
| Otras voces Larynx de Rhasspy | Glow-TTS + vocoder | varios | tar.gz / PyTorch | según release upstream | variable | GitHub Rhasspy |
| Piper (rhasspy/piper) | VITS | varios | ONNX | MIT (mayoritariamente) | variable | Hugging Face / GitHub |
| Coqui TTS (XTTS, VITS) | VITS / autoregresivo | multilingüe | PyTorch | MPL-2.0 / CPML | variable | GitHub Coqui |

La comparación con Piper es la más directa: ambos son soluciones de TTS local ligero, pero Piper emplea VITS y suele tener licencias más explícitas. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Licencia: la model card indica "other" y advierte explícitamente de que no hay licencia registrada; es necesario consultar el release upstream de Rhasspy/Larynx antes de cualquier uso comercial.
- Idioma: únicamente alemán (`de-DE`); no se documentan otras variantes regionales ni acentos.
- Dependencia del front-end: requiere `scriptconv[gruut]` para la fonemización; un fallo en el fonemizador degrada directamente la calidad de la síntesis.
- Dependencia del vocoder: la calidad final depende del vocoder `hifigan-multi-vctk-small`, que es multi-hablante y no específico para esta voz.
- Alucinación en TTS: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio de entrenamiento.
- Sesgos: no se documentan sesgos específicos, pero al ser una voz única (`karlsson`) no ofrece diversidad de hablantes.
- Sin datos de benchmarks ni de parámetros: no es posible estimar con precisión el rendimiento ni comparar objetivamente con alternativas.
- Uso en producción: la ausencia de licencia clara y de métricas publicadas desaconseja su despliegue comercial sin una evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-karlsson-gruut
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_karlsson-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
