# pantinor/parakeet-tdt-0.6b-v3-smoothquant

## Resumen

Parakeet TDT 0.6B v3 SmoothQuant int8 es una redistribución del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3` empaquetada en formato **sherpa-onnx** por el usuario `pantinor`. El artefacto combina el encoder SmoothQuant int8 publicado por `Olicorne` con el decoder y joiner int8 originales, dando como resultado un pipeline ASR completo de aproximadamente 860 MB listo para inferencia en CPU sin dependencias de PyTorch.

El problema que resuelve es concreto: la cuantización int8 estándar del encoder degrada gravemente la precisión en audio largo (40,4 % WER sobre audio de 390 segundos), mientras que SmoothQuant migra los outliers de activación por canal hacia los pesos antes de la cuantización estática, reduciendo el WER a 11,3 % en el mismo escenario, frente al 10,2 % del modelo en fp16/fp32. Es decir, se recupera casi toda la precisión de fp16 usando aproximadamente la mitad de RAM.

El modelo hereda la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA, con 0,6 mil millones de parámetros, reconocimiento multilingüe (inglés, francés, alemán, español e italiano) y licencia CC-BY-4.0. Su relevancia actual radica en que permite desplegar ASR multilingüe de calidad en entornos sin GPU mediante sherpa-onnx, un runtime ligero orientado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), encoder-decoder con joiner |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado con audio de hasta 390 s) |
| Tipos de cuantizacion | int8 estático con SmoothQuant (encoder), int8 (decoder y joiner) |
| Idiomas soportados | en, fr, de, es, it (multilingüe) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder, decoder, joiner) + vocabulario del tokenizer |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de NVIDIA con aproximadamente 0,6 mil millones de parámetros, compuesto por encoder, decoder (predictor) y joiner. La variante aquí publicada no reentrena el modelo: parte de `nvidia/parakeet-tdt-0.6b-v3`, lo exporta a ONNX (vía `istupakov/parakeet-tdt-0.6b-v3-onnx`) y sustituye el encoder por una versión int8 generada con SmoothQuant por `Olicorne`. El decoder y el joiner int8 se mantienen sin cambios respecto al export original.

La innovación técnica clave es SmoothQuant: en lugar de cuantizar directamente las activaciones, se escalan los outliers por canal desplazándolos hacia los pesos, lo que permite una cuantización estática int8 estable. Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF) no están disponibles en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en inglés, francés, alemán, español e italiano.
- Transcripción de audio largo: el encoder SmoothQuant mantiene 11,3 % WER sobre audio de 390 segundos, frente al 40,4 % del int8 estándar.
- Inferencia en CPU mediante sherpa-onnx, sin necesidad de PyTorch ni GPU.
- Formato ONNX con encoder, decoder, joiner y vocabulario separados, apto para pipelines de streaming o batch.
- No se ha documentado soporte de tool calling, capacidades de agente, visión, audio más allá de ASR ni modo thinking en la información disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas largas: el modelo está optimizado precisamente para audio de varios minutos (evaluado a 390 s), por lo que es adecuado para diarización posterior y actas automáticas sin degradación severa del WER.
- Subtitulado multilingüe en servidores sin GPU: al ejecutarse vía sherpa-onnx en CPU con ~860 MB, encaja en instancias modestas de cloud o en hardware embebido.
- Atención al cliente con transcripción de llamadas: permite convertir grabaciones de centros de contacto en texto para análisis de calidad y búsqueda, en los cinco idiomas soportados.
- Procesamiento por lotes de archivos de audio en pipelines ETL: la separación encoder/decoder/joiner en ONNX facilita integrar el modelo en orquestadores de datos sin dependencias de Python pesadas.
- Asistentes de voz locales y privados: el tamaño reducido y la licencia CC-BY-4.0 permiten desplegar ASR on-premise donde no se quiere enviar audio a terceros.
- Investigación en ASR multilingüe: sirve como baseline cuantizado reproducible para comparar técnicas de cuantización (SmoothQuant frente a int8 estándar) sobre un mismo modelo base.

## Benchmarks y rendimiento

| Variante | Tamano encoder | Tamano total | WER audio largo (390 s) |
|---|---|---|---|
| int8 estándar (pantinor/parakeet-tdt-0.6b-v3-int8) | 622 MB | ~670 MB | 40,4 % |
| **SmoothQuant int8 (este repo)** | **842 MB** | **~860 MB** | **11,3 %** |
| fp16/fp32 | ~1,2 GB | ~1,2 GB | 10,2 % |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech WER, etc.) más allá de las cifras de WER sobre audio largo recogidas en la model card.

## Requisitos de hardware

- VRAM estimada: no aplica en despliegue CPU; en GPU, el pipeline completo ocupa ~860 MB de memoria en int8.
- GPU recomendadas: no disponible (el formato sherpa-onnx está orientado a CPU).
- Cabe en cualquier equipo consumer: ~860 MB de RAM en CPU es suficiente; también cabe en GPUs consumer modestas si se usa un runtime ONNX con aceleración.
- Opciones de despliegue: sherpa-onnx (runtime principal), ONNX Runtime; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (son runtimes de LLM, no de ASR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tamano | WER audio largo | Licencia |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-smoothquant (este) | 0,6B | en, fr, de, es, it | ~860 MB | 11,3 % | CC-BY-4.0 |
| parakeet-tdt-0.6b-v3-int8 (int8 estándar) | 0,6B | en, fr, de, es, it | ~670 MB | 40,4 % | CC-BY-4.0 |
| parakeet-tdt-0.6b-v3 fp16/fp32 | 0,6B | en, fr, de, es, it | ~1,2 GB | 10,2 % | CC-BY-4.0 |
| Whisper large-v3 | no disponible | multilingüe amplio | no disponible | no disponible | MIT (según modelo original) |

La comparativa con Whisper large-v3 se incluye solo como referencia de categoría; no se dispone de cifras de WER comparables en la información proporcionada, por lo que no se afirma superioridad ni inferioridad.

## Limitaciones y advertencias

- El WER de 11,3 % en audio de 390 s sigue siendo ligeramente superior al 10,2 % de fp16; no es una cuantización sin pérdida.
- El encoder SmoothQuant ocupa 842 MB frente a 622 MB del int8 estándar: se gana precisión a costa de ~220 MB adicionales.
- No se documentan sesgos específicos, pero al ser un modelo ASR entrenado por NVIDIA, puede heredar sesgos acústicos y lingüísticos del corpus original.
- Riesgo de alucinación en transcripción: no cuantificado en la información disponible.
- Idiomas limitados a en, fr, de, es, it; no se ha validado su comportamiento en otras lenguas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos del modelo base NVIDIA y de las dependencias (encoder de Olicorne, export de istupakov).
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de redistribución, no un modelo original, sin garantías de mantenimiento.
- No se dispone de información sobre latencia, throughput ni requisitos de GPU para este empaquetado concreto.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/pantinor/parakeet-tdt-0.6b-v3-smoothquant
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Encoder SmoothQuant: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-smoothquant-onnx
- Export ONNX original: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Variante int8 estándar: https://huggingface.co/pantinor/parakeet-tdt-0.6b-v3-int8
- Repositorio sherpa-onnx: no disponible en la información proporcionada
- Paper de SmoothQuant: no disponible en la información proporcionada
