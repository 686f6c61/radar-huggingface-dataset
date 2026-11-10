# rhasspy/voice-incubator-models

## Resumen

`rhasspy/voice-incubator-models` no es un modelo único, sino un repositorio agregado que empaqueta todos los artefactos de inferencia que la aplicación de escritorio Voice Incubator descarga la primera vez que arranca o que incorpora en el momento de construir su imagen. Lo mantiene el proyecto Rhasspy (autor `rhasspy`), dentro del ecosistema OHF-Voice orientado a asistentes de voz locales y a Home Assistant. El repo reúne un reconocedor de voz, un extractor de entidades y varios modelos ligeros de activación por palabra clave (wake word), todo en formatos ONNX o TFLite.

El componente principal es Parakeet TDT-CTC 110M de NVIDIA, un modelo de reconocimiento automático del habla en inglés de 110 millones de parámetros con arquitectura transducer (encoder, decoder y joiner) más una rama CTC, cuantizado a int8 en las matrices del encoder. Se complementa con GLiNER 2.5 small de fastino, un extractor de entidades nombradas de propósito general exportado a ONNX con cuantización de 8 bits en el encoder y 4 bits en los embeddings, que actúa como respaldo para el emparejamiento de comandos. Los modelos de wake word (microWakeWord y Kaldi) permiten la activación por voz en satélites y dispositivos de bajo consumo.

La relevancia actual del repositorio es práctica: agrupa en un único punto de descarga un pipeline de asistente de voz completamente local y en inglés, sin dependencia de servicios en la nube, con licencias permisivas (CC-BY-4.0 y Apache-2.0) y pesos ya cuantizados para ejecución en CPU. El tamaño total del repo es de 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline heterogéneo: transducer TDT-CTC (Parakeet), encoder transformer para NER (GLiNER 2.5), modelos acústicos Kaldi nnet3 y redes TFLite de wake word |
| Parametros totales | 110M en Parakeet TDT-CTC; el resto de componentes no declara recuento en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Parakeet: int8 dinámico (onnxruntime) en las MatMul del encoder. GLiNER 2.5: 8 bits en capas del encoder y 4 bits en embeddings (MatMulNBits, block 32). Kaldi y microWakeWord: sin cuantización declarada |
| Idiomas soportados | Inglés (en). `okay_nabu` se describe como multilingüe dentro de microWakeWord |
| Licencia | CC-BY-4.0 (Parakeet, © NVIDIA) y Apache-2.0 (GLiNER 2.5, Kaldi, OpenFst, microWakeWord); el modelo Kaldi de Rhasspy es MIT |
| Formato de pesos | ONNX (Parakeet, GLiNER 2.5), TFLite (microWakeWord), artefactos Kaldi (`en_US-rhasspy.tar.gz`, binarios `tools-x86_64`/`tools-aarch64`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: redistribuye pesos ya entrenados por terceros, adaptados al formato de inferencia de la aplicación. Parakeet TDT-CTC 110M combina un transducer TDT (encoder, decoder y joiner con `tokens.txt`) con una rama CTC adicional (`ctc_head.npz`) de modo que un mismo encoder produce tanto las log-probabilidades CTC sobre las que se emparejan comandos como las transcripciones completas. La exportación a ONNX proviene de los repos de `csukuangfj` para sherpa-onnx, y sobre ella se aplicó cuantización dinámica int8 a las matrices del encoder.

GLiNER 2.5 small es un modelo de reconocimiento de entidades de tipo zero-shot basado en encoder transformer; en este repo se distribuye en ONNX con las capas del encoder a 8 bits y el embedding a 4 bits (MatMulNBits con bloque de 32), y el fichero `gliner2_onnx.json` describe la configuración de tokenizer y clasificador. El verificador de wake word usa Kaldi: el perfil `en_US-rhasspy` incluye el modelo acústico nnet3 y el léxico IPA, sin modelo G2P ni modelo de lenguaje, porque el verificador no adivina pronunciaciones. Los modelos microWakeWord (`okay_nabu`, `stop`, `vad`, `hey_jarvis`, `hey_mycroft`) son redes TFLite ligeras pensadas para satélites ESPHome. No se dispone de información sobre volúmenes de entrenamiento, composición de datasets ni uso de RLHF/DPO en la documentación proporcionada.

## Capacidades

- Reconocimiento automático del habla en inglés con salida de transcripciones (rama transducer) y log-probabilidades CTC para emparejamiento de comandos (rama CTC), a partir de un único encoder.
- Extracción de entidades nombradas de propósito general mediante GLiNER 2.5, usada como respaldo para interpretar comandos cuando el emparejamiento directo falla.
- Detección de palabra de activación (wake word) con los modelos microWakeWord: `okay_nabu` (multilingüe), `stop`, `vad`, `hey_jarvis` y `hey_mycroft`.
- Verificación de wake word con modelo acústico Kaldi nnet3 y léxico IPA en inglés estadounidense.
- Ejecución local en CPU y en dispositivos de bajo consumo (satélites), sin llamadas a servicios externos.
- Integración con el ecosistema Home Assistant y con la aplicación Voice Incubator.
- Componentes auxiliares descargados por la app: EmbeddingGemma 2 (embeddings, `onnx/model_q4.onnx`) y ReDimNet-b2 (identificación de hablante).
- No se declara soporte de tool calling, razonamiento multi-paso, visión ni audio generativo en la información disponible.

## Casos de uso

- Asistente de voz local para el hogar: el pipeline combina la detección de wake word (microWakeWord o Kaldi), la transcripción con Parakeet y el emparejamiento de comandos por log-probabilidades CTC, de modo que todo el flujo de activación y reconocimiento se ejecuta en el dispositivo sin enviar audio a la nube.
- Control por voz en Home Assistant: los modelos de wake word se despliegan en satélites ESPHome y el reconocedor transcribe las órdenes en inglés, encajando con la integración nativa del ecosistema Rhasspy.
- Emparejamiento de comandos con respaldo NER: cuando la transcripción no coincide con un comando predefinido, GLiNER 2.5 extrae entidades (dispositivos, ubicaciones, nombres) para interpretar la intención de forma flexible.
- Reconocimiento de voz en CPU sin GPU: al estar los pesos de Parakeet en ONNX int8, el modelo puede ejecutarse en equipos sin acelerador dedicado, adecuado para mini-PC o Raspberry Pi que actúan como servidor doméstico.
- Verificación de activación con pronunciación estricta: el verificador Kaldi, al carecer de G2P y de modelo de lenguaje, solo acepta pronunciaciones presentes en el léxico IPA, lo que reduce falsos positivos en entornos con ruido.
- Identificación de hablante en el asistente: ReDimNet-b2 (descargado por la app) permite distinguir entre usuarios del mismo dispositivo para personalizar respuestas.
- Búsqueda semántica local de comandos: EmbeddingGemma 2 en cuantización q4 se usa para generar embeddings que apoyan la resolución de comandos por similitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de componentes; Parakeet 110M en int8 ocupa del orden de cientos de MB, y el repo completo pesa 0,4 GB, por lo que el pipeline cabe holgadamente en memoria de CPU.
- GPU recomendadas: no se especifican; el diseño apunta a ejecución en CPU mediante onnxruntime y TFLite.
- Compatibilidad con GPU de consumo: no declarada; el formato ONNX int8 permite ejecución en CPU y, potencialmente, en GPUs de consumo mediante onnxruntime, pero no se documenta.
- Opciones de despliegue: la aplicación Voice Incubator (repositorio OHF-Voice/voice-incubator); sherpa-onnx para los artefactos de Parakeet; onnxruntime para GLiNER 2.5; Kaldi y OpenFst para el verificador (binarios incluidos para x86-64 y aarch64); firmware ESPHome para los modelos microWakeWord.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rhasspy/voice-incubator-models (Parakeet TDT-CTC 110M) | 110M | No disponible | en | CC-BY-4.0 / Apache-2.0 | Hugging Face (este repo) |
| nvidia/parakeet-tdt_ctc-110m | 110M | No disponible | en | CC-BY-4.0 | Hugging Face (origen) |
| csukuangfj/sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000 | 110M | No disponible | en | No disponible | Hugging Face (export ONNX) |
| fastino/gliner2.5-small-v1 | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face (origen de GLiNER 2.5) |

Los tres primeros son el mismo modelo base en distintos formatos; la diferencia es el empaquetado (ONNX int8 y rama CTC añadida en este repo). No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Solo inglés: el reconocimiento de voz y el verificador Kaldi están entrenados exclusivamente para inglés; `okay_nabu` es el único componente descrito como multilingüe.
- No es un modelo generativo: no produce texto libre ni razona; es un conjunto de artefactos de inferencia para un pipeline de asistente de voz concreto.
- Dependencia de la aplicación: los artefactos están empaquetados para Voice Incubator y su formato (rutas, ficheros `gliner2_onnx.json`, `tokens.txt`, `ctc_head.npz`) puede no ser directamente reutilizable fuera de ella.
- Riesgo de alucinación en transcripción: como todo ASR, puede producir transcripciones incorrectas en audio con ruido o acentos no representados; el emparejamiento CTC mitiga pero no elimina este riesgo.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado por terceros (NVIDIA) hereda los de su dataset original, no descrito aquí.
- Licencias mixtas: conviene revisar cada componente por separado (CC-BY-4.0 exige atribución a NVIDIA; Apache-2.0 y MIT son permisivas); el campo `license` del repo es `other` con nombre compuesto, por lo que la reutilización comercial exige verificar el fichero `LICENSE.md`.
- El verificador Kaldi no adivina pronunciaciones (sin G2P ni modelo de lenguaje), lo que limita su cobertura a las palabras presentes en el léxico IPA.
- Fechas de creación y actualización del repo (2026) no coinciden con el estado público conocido de los modelos de origen; conviene verificar la vigencia de los artefactos antes de desplegarlos en producción.
- Sin benchmarks publicados: no hay métricas de WER, latencia ni precisión de wake word en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rhasspy/voice-incubator-models
- Voice Incubator (aplicación): https://github.com/OHF-Voice/voice-incubator
- Parakeet TDT-CTC 110M (origen): https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Export ONNX transducer: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000
- Export ONNX CTC: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000
- GLiNER 2.5 small (origen): https://huggingface.co/fastino/gliner2.5-small-v1
- Perfil Kaldi de Rhasspy: https://github.com/rhasspy/en-us_kaldi-rhasspy
- Kaldi: https://github.com/kaldi-asr/kaldi
- OpenFst: https://www.openfst.org
- Kaldi manylinux de Rhasspy: https://github.com/rhasspy/kaldi-manylinux
- microWakeWord: https://github.com/kahrendt/microWakeWord
- Modelos microWakeWord de ESPHome: https://github.com/esphome/micro-wake-word-models
- EmbeddingGemma 2 ONNX: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- ReDimNet-b2 ONNX: https://huggingface.co/OpenVoiceOS/redimnet-b2-vox2-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia MIT: https://opensource.org/license/mit
