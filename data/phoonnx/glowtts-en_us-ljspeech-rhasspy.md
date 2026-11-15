# Phoonnx/glowtts-en_us-ljspeech-rhasspy

## Resumen

Glow-TTS en inglés estadounidense entrenado sobre el corpus LJSpeech y empaquetado en formato ONNX para la librería phoonnx. El modelo original procede de Rhasspy (proyecto Larynx v1.0) y este repositorio lo redistribuye listo para inferencia con la mencionada librería, sin necesidad de convertir pesos ni de gestionar el vocoder por separado. Se trata de un modelo acústico Glow-TTS que genera espectrogramas a partir de fonemas IPA producidos por el fonemizador gruut, y que delega la síntesis de forma de onda en el vocoder HiFi-GAN `hifigan-multi-vctk-small`, descargado automáticamente junto con la voz.

El modelo está orientado a síntesis de voz en inglés de EE. UU. con una única voz femenina derivada de LJSpeech, un corpus de dominio público de unas 24 horas de audio de una locutora. No es un modelo generativo de propósito general ni un sistema TTS neuronal de gran escala: es un componente ligero, de aproximadamente 0,1 GB en el repositorio, pensado para integrarse en asistentes de voz locales y en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`.

Su relevancia actual reside en la reproducibilidad y el despliegue local: al estar en ONNX y empaquetado para phoonnx, puede ejecutarse en CPU sin dependencias de frameworks pesados, lo que encaja en entornos de domótica, asistentes offline y sistemas embebidos. La contrapartida es su antigüedad técnica (Glow-TTS es un modelo de 2020) y la ausencia de una licencia registrada, lo que exige verificar el release upstream antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por frase); no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repositorio no detalla variantes) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small (Phoonnx) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo text-to-speech basado en normalizing flows que aprende una correspondencia monotónica entre fonemas y frames de espectrograma mel sin necesidad de alineamientos externos, mediante un mecanismo de atención dura con búsqueda de alineamiento monotónico (MAS, monotonic alignment search). La arquitectura combina un encoder Transformer sobre la secuencia de fonemas con un decoder de flujo invertible que transforma una distribución latente gaussiana en el espectrograma mel. Sobre esa salida actúa el vocoder HiFi-GAN `hifigan-multi-vctk-small`, que convierte el espectrograma en forma de onda.

El modelo se entrenó originalmente sobre LJSpeech, un corpus de una única locutora con aproximadamente 24 horas de audio en inglés estadounidense, en el marco del proyecto Larynx de Rhasspy (release v1.0). No se dispone de información sobre el número exacto de tokens o frames de entrenamiento, la composición detallada del dataset ni la aplicación de técnicas de RLHF o DPO, que no son habituales en modelos TTS de esta generación. La innovación destacable es el alineamiento monotónico sin supervisión y la naturaleza no autorregresiva del modelo, que permite síntesis rápida y determinista en comparación con los modelos autoregresivos tipo Tacotron.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto plano, con normalización y conversión a fonemas IPA mediante gruut.
- Generación de espectrogramas mel y conversión a audio WAV a través del vocoder HiFi-GAN integrado.
- Ejecución en CPU gracias al formato ONNX, sin necesidad de GPU ni de frameworks de deep learning pesados.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Soporte de una única voz (`larynx/en-us-ljspeech-glow_tts`); no incluye clonación de voz ni control de estilo.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades multimodales.
- No soporta otros idiomas distintos del inglés estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona mediante `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en inglés sin conexión a servicios en la nube, lo que encaja en despliegues de domótica y privacidad.
- Sistemas de domótica y altavoces inteligentes autoalojados: al ejecutarse en CPU y ocupar aproximadamente 0,1 GB, puede desplegarse en dispositivos de bajos recursos como Raspberry Pi para anuncios y confirmaciones de estado.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la API de phoonnx permite sintetizar frases cortas a WAV de forma directa, adecuada para avisos del sistema o logs leídos en voz alta.
- Generación de audio para pruebas y prototipado de pipelines de voz: sirve como referencia TTS en experimentos de ASR, diarización o evaluación de vocoders, al ser un modelo pequeño y reproducible.
- Accesibilidad en aplicaciones de línea de comandos: lectura de texto en inglés para usuarios con discapacidad visual en entornos Linux sin dependencias gráficas.
- Integración en agentes conversacionales de código abierto: combinado con un LLM local, el modelo actúa como capa de salida de voz en asistentes por turnos, siempre que el idioma de respuesta sea inglés estadounidense.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; para GPU, el modelo es lo suficientemente pequeño como para caber en cualquier GPU con más de 1 GB de memoria, aunque no se publican cifras exactas.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna (RTX 3060 o superior) puede ejecutarlo, si bien el diseño ONNX está orientado a CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual, dado el tamaño del repositorio (0,1 GB) y la naturaleza del modelo.
- Opciones de despliegue: phoonnx (Python y plugin OVOS), ONNX Runtime; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Vocoder | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-ljspeech-rhasspy | Glow-TTS | en-US | HiFi-GAN multi-vctk-small | other (sin registrar) | ONNX | Hugging Face, phoonnx, OVOS |
| Rhasspy Larynx v1.0 (upstream) | Glow-TTS | en-US | HiFi-GAN | no disponible | tar.gz (original) | GitHub releases de Rhasspy |
| Piper (rhasspy/piper-voices) | VITS | multilingüe | integrado | MIT (según proyecto) | ONNX | Hugging Face, piper |
| Coqui TTS (modelos VITS/Tacotron) | VITS / Tacotron 2 | multilingüe | varios | MPL 2.0 (según modelo) | PyTorch | GitHub de Coqui |

La comparativa se limita a alternativas de la misma categoría (TTS neuronal ligero y local); no se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Una única voz femenina derivada de LJSpeech; no hay variedad de locutores ni control de prosodia o emoción.
- Solo inglés estadounidense; no soporta otros idiomas ni code-switching.
- Modelo de 2020 (Glow-TTS): su calidad natural y expresividad queda por debajo de sistemas TTS neuronales más recientes basados en difusión o modelos de lenguaje.
- Riesgo de pronunciación incorrecta en nombres propios, siglas y palabras fuera del vocabulario de gruut; la normalización de texto depende de scriptconv.
- Sin licencia registrada en el repositorio: es imprescindible verificar la licencia del release upstream de Rhasspy/Larynx antes de cualquier uso comercial o redistribución.
- El rendimiento y la calidad pueden degradarse con frases muy largas o con puntuación atípica; está pensado para síntesis por frase.
- No se publican métricas objetivas (MOS, WER, RTF), por lo que la evaluación de calidad debe hacerse empíricamente en el dominio de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-ljspeech-rhasspy
- Release upstream de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_ljspeech-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
