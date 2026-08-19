# ghananlpcommunity/ghana-english-phoneme-asr

## Resumen

El modelo `ghananlpcommunity/ghana-english-phoneme-asr` es un sistema de reconocimiento automático del habla (ASR) que transcribe audio en inglés de Ghana a secuencias de fonemas IPA (Alfabeto Fonético Internacional). Ha sido desarrollado por la comunidad GhanaNLP para resolver un problema concreto: los sistemas de síntesis de voz (TTS) necesitan etiquetas fonéticas que puedan ser generadas por un conversor grafema-a-fonema (g2p) en tiempo de inferencia, pero los ASR multilingües existentes producen transcripciones en convenciones internas que el g2p no puede reproducir. Este modelo se ajusta finamente (fine-tuning) a partir de un reconocedor previo de 42 lenguas ghanesas, usando como objetivos las salidas del g2p `ghana-english-g2p`, logrando una tasa de error de unidad (UER) del 16,49 % frente a dicho g2p, muy por debajo del 76 % que obtenía el modelo base.

El modelo se basa en una arquitectura wav2vec2 con configuración de 300 millones de parámetros (según el archivo de arquitectura) y emplea una cabeza CTC (Connectionist Temporal Classification) para la decodificación. Su inventario de salida consta de 188 unidades fonéticas: 172 heredadas del modelo multilingüe ghanés más 16 símbolos adicionales específicos del inglés. El repositorio incluye un checkpoint en formato fairseq2, un archivo de configuración, un mapeo de tokens y un mapa de fonemas a códigos Unicode de área privada. También se proporciona una exportación ONNX posible mediante un script del repositorio de entrenamiento.

La relevancia de este modelo radica en su especialización: está diseñado para una variedad lingüística concreta (inglés ghanés) y para una tarea específica (transcripción fonética en IPA), lo que lo hace útil para aplicaciones de TTS, aprendizaje de pronunciación y lingüística computacional en contextos de África occidental. Su licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CTC), configuración 300m |
| Parametros totales | no disponible (se infiere ~300M por la arquitectura) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el encoder colapsa más allá de ~10 s de audio, se recomienda ventanear) |
| Tipos de cuantizacion | no disponible (se menciona exportación ONNX, pero no cuantización específica) |
| Idiomas soportados | inglés (variedad de Ghana) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | checkpoint fairseq2 (PyTorch), exportación ONNX posible |

## Arquitectura y entrenamiento

El modelo está construido sobre una arquitectura wav2vec2 con configuración de 300 millones de parámetros (arch 300m). Se trata de un modelo de reconocimiento de fonemas basado en CTC, entrenado con el framework fairseq2. El checkpoint se guarda en formato fairseq2 y la arquitectura se define en `config/model_arch.yaml`.

El entrenamiento partió de un modelo previo, `ghananlpcommunity/ghana-speech-phoneme-asr`, que reconocía 42 lenguas de Ghana y transcribía el inglés con una convención propia (por ejemplo, "serve the" se transcribía como `s ɛ f d ɛ`). Ese modelo base mostraba un 76 % de UER frente al g2p de referencia y un 8,3 % de unidades fuera de su inventario. Para corregirlo, se realizó un ajuste fino (fine-tuning) sobre 200 horas de audio en inglés de Ghana, utilizando como objetivos las transcripciones fonéticas generadas por `ghana-english-g2p`. El resultado es un modelo que lee lo que el hablante realmente dice pero escribe en la convención que el g2p puede reproducir en inferencia, alcanzando un 16,49 % de UER.

El inventario de 188 unidades es la unión de tres fuentes: el léxico del g2p (63 fonemas en 104 715 palabras), el fallback de espeak-ng probado sobre el léxico (56 fonemas) y el propio corpus de entrenamiento (67 fonemas). Cada fuente aporta símbolos que las otras no tienen (por ejemplo, `ɚ` y `ᵻ` solo provienen de espeak, `ɔ̃` solo del corpus). Los 172 unidades compartidas con el modelo ghanés heredan sus filas de salida entrenadas, mientras que los 16 símbolos adicionales específicos del inglés se añaden como nuevas salidas.

## Capacidades

- Transcripción de audio en inglés de Ghana a secuencias de fonemas IPA, siguiendo la convención del g2p `ghana-english-g2p`.
- Reconocimiento de fonemas a partir de habla continua, con salida a nivel de unidad fonética (no palabras).
- Soporte de un inventario de 188 unidades fonéticas, incluyendo símbolos específicos del inglés como `ð`, `iː`, `ɜː`, `ɹ`, `θ`, entre otros.
- Capacidad de procesar audio de entrada con normalización por utterance (media cero y varianza unitaria), lo que mejora la precisión en aproximadamente un 12 % de UER frente a ondas sin normalizar.
- Posibilidad de exportación a ONNX para despliegue en entornos como sherpa-onnx o dispositivos móviles.
- Integración con el repositorio `GhanaNLP/ghana-ipa-asr`, que proporciona una interfaz de línea de comandos para procesar lotes de audio con ventaneado automático.

## Casos de uso

- **Síntesis de voz (TTS) para inglés de Ghana**: el modelo proporciona transcripciones fonéticas en la misma convención que el g2p, lo que permite entrenar voces TTS donde el texto se convierte a fonemas mediante g2p y el audio se alinea con esas etiquetas. Es especialmente útil para construir voces de alta calidad en variedades regionales.
- **Aprendizaje de pronunciación**: estudiantes de inglés como segunda lengua pueden grabar su voz y recibir una transcripción fonética en IPA, comparándola con la pronunciación canónica generada por el g2p. Esto facilita la corrección de errores de articulación específicos del inglés ghanés.
- **Lingüística de corpus y documentación**: investigadores pueden transcribir automáticamente grandes volúmenes de audio en inglés de Ghana a fonemas IPA, acelerando el análisis fonológico y la creación de recursos lingüísticos.
- **Sistemas de subtitulado fonético**: para aplicaciones de accesibilidad o análisis de pronunciación en medios audiovisuales, el modelo puede generar subtítulos fonéticos en tiempo casi real, siempre que se ventanee el audio en segmentos de menos de 10 segundos.
- **Evaluación de sistemas TTS**: al comparar la salida de un sintetizador (generada por g2p) con la transcripción de un hablante real (obtenida con este ASR), se puede medir la naturalidad y fidelidad de la voz sintética en términos de unidades fonéticas.
- **Desarrollo de asistentes de voz en Ghana**: el modelo puede integrarse en pipelines de ASR donde se requiera una representación fonética intermedia, por ejemplo para alimentar un módulo de corrección de pronunciación o un sistema de diálogo que necesite entender variaciones dialectales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de ASR fonético y no de lenguaje general. La métrica reportada es la tasa de error de unidad (UER) frente al g2p de referencia en clips held-out:

| Métrica | Valor |
|---|---|
| UER contra g2p (mejor paso, step 6000) | 16,49 % |
| UER del modelo base sin fine-tuning | 76 % |
| Unidades fuera de inventario en modelo base | 8,3 % |

El modelo base (antes del fine-tuning) presentaba un 76 % de UER, lo que demuestra una mejora sustancial tras el ajuste con objetivos g2p. El 16,49 % residual se considera deseable, ya que refleja diferencias reales entre la pronunciación efectiva y la predicción canónica del g2p.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. A partir del tamaño del checkpoint (3,0 GB) y de la arquitectura de 300 millones de parámetros, se puede estimar:

- **VRAM para inferencia**: en fp32, los pesos ocupan aproximadamente 1,2 GB (300M × 4 bytes). Sin embargo, el procesamiento de audio (extracción de características, forward pass de wav2vec2) requiere memoria adicional para activaciones y buffers, por lo que se recomienda al menos 4 GB de VRAM para inferencia en GPU.
- **GPU recomendadas**: tarjetas con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. Para procesamiento por lotes o despliegue en producción, se recomienda una GPU con 8 GB o más (RTX 3070, A100, etc.).
- **CPU**: es posible ejecutar el modelo en CPU con un rendimiento bajo; se recomienda para pruebas o inferencia no interactiva.
- **Opciones de despliegue**: el formato fairseq2 puede cargarse con PyTorch. La exportación ONNX permite usar sherpa-onnx, ONNX Runtime o frameworks móviles. El repositorio `ghana-ipa-asr` ofrece una CLI para procesamiento por lotes.
- **Latencia y throughput**: no se han publicado datos. Para un modelo de 300M, se espera una latencia de decodificación de unos pocos segundos por utterance en GPU, dependiendo de la duración del audio y del hardware.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la información proporcionada. Este modelo es altamente especializado: no existe un equivalente público conocido que transcriba inglés de Ghana a IPA con la convención de un g2p específico. Podría compararse con modelos ASR multilingües generales (por ejemplo, Whisper de OpenAI o wav2vec2 2.0 de Facebook), pero estos producen transcripciones ortográficas, no fonéticas, y no están adaptados a la variedad ghanesa. Tampoco se dispone de datos de rendimiento comparativo. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- **Dependencia de la normalización del audio**: el modelo requiere que cada utterance se normalice a media cero y varianza unitaria. Sin esta normalización, la UER empeora aproximadamente un 12 %.
- **Colapso del encoder en audio largo**: el encoder colapsa silenciosamente más allá de ~10 segundos; un clip de 30 segundos puede decodificarse como una sola unidad. Es imprescindible ventanear el audio en segmentos cortos (se recomienda 6 segundos).
- **Especialización en inglés de Ghana**: el modelo está entrenado exclusivamente con habla de Ghana; su rendimiento en otros acentos o variedades del inglés será muy limitado.
- **Inventario cerrado**: el modelo solo puede emitir los 188 símbolos definidos. Cualquier fonema fuera de ese inventario no se representará, lo que puede causar pérdida de información en habla no estándar.
- **Sesgo en los datos**: el entrenamiento se realizó sobre 200 horas de audio, cuya composición demográfica y de registro no se detalla. Podría haber sesgos de género, edad o procedencia regional dentro de Ghana.
- **Riesgo de alucinación**: al ser un modelo CTC con un inventario restringido, puede producir secuencias fonéticas plausibles pero incorrectas en segmentos de audio ambiguos o ruidosos.
- **Licencia CC-BY-4.0**: permite uso comercial y modificación, pero exige atribución al autor original. No hay restricciones de uso militar o de vigilancia explícitas, pero se recomienda revisar los términos completos.
- **Falta de documentación sobre cuantización**: no se ofrecen versiones cuantizadas, y la exportación ONNX requiere un paso manual. Para despliegue en producción, se debe validar el rendimiento tras la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ghananlpcommunity/ghana-english-phoneme-asr
- Repositorio de entrenamiento e inferencia (GhanaNLP/ghana-ipa-asr): https://github.com/GhanaNLP/ghana-ipa-asr
- Repositorio del g2p de referencia (GhanaNLP/ghana-english-g2p): https://github.com/GhanaNLP/ghana-english-g2p
- Dataset de audio con transcripciones IPA: https://huggingface.co/datasets/ghanaopendata/ghana-english-speech-ipa
- Dataset de latentes VoxCPM-2 precomputados: https://huggingface.co/datasets/ghanaopendata/voxcpm2-ghana-english-ipa-latents
