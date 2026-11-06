# dansarpong/whisper-small-waxal-aka-ggml

## Resumen

whisper-small-waxal-aka-ggml es una conversión al formato GGML del modelo waxal-benchmarking/whisper-small-waxal-aka, un fine-tune de openai/whisper-small especializado en reconocimiento automático de habla (ASR) para akan y twi, lenguas habladas principalmente en Ghana. Lo desarrolla dansarpong como componente local del proyecto Parley, una aplicación de código abierto para grabar llamadas, y su propósito es permitir transcripción de twi/akan en el propio dispositivo sin depender de servicios en la nube.

El modelo mantiene intactos los pesos del checkpoint original: la conversión solo cambia el formato de almacenamiento a GGML para que whisper.cpp pueda cargarlo. Por tanto, hereda la arquitectura Whisper small (transformer encoder-decoder con 244 millones de parámetros) y la licencia CC-BY-4.0 del fine-tune original, mientras que la base de OpenAI es MIT.

Su relevancia es doble: por un lado, cubre una lengua de bajos recursos con un WER del 34,5 % sobre un conjunto de evaluación de 160 clips, y por otro ofrece una ruta de despliegue ligera (un único fichero de 487 MB) para entornos sin GPU. No es un modelo generalista: está pensado exclusivamente para transcripción de akan/twi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (transformer encoder-decoder, ASR) |
| Parametros totales | 244 millones (arquitectura Whisper small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | f16 para la mayoría de tensores, f32 para tensores pequeños y embeddings posicionales |
| Idiomas soportados | ak (akan), tw (twi) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGML (`ggml-model.bin`, 487.601.984 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de openai/whisper-small, la variante de 244 millones de parámetros de la familia Whisper. Whisper emplea un transformer encoder-decoder que procesa espectrogramas mel de 30 segundos y genera tokens de texto de forma autorregresiva, con tokens especiales de idioma y de tarea. La conversión a GGML reproduce el esquema de whisper.cpp: pesos en f16 salvo tensores pequeños y embeddings posicionales en f32, con los filtros mel estándar de OpenAI (`mel_filters.npz`) y el tokenizer original de whisper-small, idéntico al del fine-tune.

El fine-tune original lo realizó waxal-benchmarking sobre el corpus WAXAL Akan ASR, recopilado por la Universidad de Ghana junto con Google y publicado bajo CC-BY-4.0. La model card no detalla el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos figuran como no disponibles. Un detalle relevante para el uso: el fine-tune se entrenó sin token de idioma, ya que el twi no es un código de idioma de Whisper, por lo que conviene dejar la detección automática de idioma activada. La conversión se realizó con un script propio revisable (`bench/twi/to_ggml.py`), reimplementación del `convert-h5-to-ggml.py` de whisper.cpp.

## Capacidades

- Transcripción automática de voz a texto en akan y twi.
- Ejecución local mediante whisper.cpp sobre el formato GGML, sin necesidad de framework de deep learning completo.
- Detección automática de idioma (recomendada por el autor frente a forzar un código de idioma).
- Procesamiento de audio en ventanas de 30 segundos, propio de la arquitectura Whisper.
- Integración con la aplicación Parley como motor de transcripción de llamadas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local de llamadas telefónicas: integrado en Parley, el modelo convierte grabaciones de llamadas en twi/akan en texto sin enviar el audio a servidores externos, lo que preserva la privacidad de las conversaciones.
- Subtitulado de contenido audiovisual en Ghana: permite generar subtítulos para vídeos, entrevistas o programas de radio en twi/akan con un único fichero de 487 MB ejecutable en CPU.
- Documentación clínica o administrativa: transcripción de consultas o reuniones en akan para su posterior revisión y archivo, con despliegue en equipos de oficina sin GPU.
- Investigación lingüística y corpus: generación de transcripciones a escala para estudios de lingüística computacional sobre lenguas de bajos recursos, aprovechando la licencia CC-BY-4.0.
- Atención al ciudadano en servicios públicos: transcripción de llamadas de atención telefónica en twi para su clasificación y análisis posterior, ejecutándose en infraestructura local.
- Aplicaciones móviles o de escritorio offline: al ser un fichero GGML de menos de 500 MB, puede empaquetarse en herramientas de escritorio o dispositivos con recursos limitados para dictado y notas de voz.
- Evaluación comparativa de ASR: sirve como referencia para medir mejoras de otros modelos en akan/twi usando el benchmark de Parley como base metodológica.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| WER | 34,5 % | 160 clips de WAXAL Akan, checkpoint original vía transformers |
| CER | 12,9 % | 160 clips de WAXAL Akan, checkpoint original vía transformers |

Los datos corresponden al checkpoint original evaluado a través de transformers; la model card no publica métricas específicas de la versión GGML ni comparaciones con otros modelos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGML ocupa 487 MB; en CPU la huella de memoria es de aproximadamente 0,5-1 GB, y en GPU con whisper.cpp se puede mantener íntegramente en VRAM de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060 o superior ofrece transcripción en tiempo real con margen. Para CPU, procesadores modernos de 4 núcleos en adelante son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: whisper.cpp (formato nativo), y a través de él integraciones como bindings de Python, aplicaciones de escritorio o el propio Parley. No es compatible directamente con vLLM o TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| whisper-small-waxal-aka-ggml | 244 M | ak, tw | CC-BY-4.0 | GGML | Fine-tune especializado, WER 34,5 % en WAXAL Akan |
| openai/whisper-small | 244 M | multilingüe (99 idiomas) | MIT | safetensors, GGML | Base generalista; no cubre twi/akan de forma específica |
| waxal-benchmarking/whisper-small-waxal-aka | 244 M | ak, tw | CC-BY-4.0 | safetensors | Checkpoint original del que deriva esta conversión |

La comparación con otros fine-tunes de akan/twi no está disponible en la información proporcionada. Frente a whisper-small original, la diferencia clave es la especialización en akan/twi a costa de renunciar a la cobertura multilingüe general.

## Limitaciones y advertencias

- El WER del 34,5 % implica que aproximadamente uno de cada tres caracteres o palabras se transcribe incorrectamente; no es adecuado para transcripción sin revisión humana en contextos críticos.
- El fine-tune se entrenó sin token de idioma; forzar un código de idioma en la inferencia puede degradar los resultados. Se recomienda la detección automática.
- Solo cubre akan y twi; no es un modelo multilingüe y su uso con otros idiomas producirá salidas sin garantía.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, solapamiento de hablantes o silencios largos.
- La evaluación se realizó sobre 160 clips, un conjunto pequeño; el rendimiento en dominios distintos (acentos, ruido telefónico, vocabulario técnico) puede diferir.
- Licencia CC-BY-4.0: permite uso comercial con atribución al autor original y a la fuente de datos (Universidad de Ghana y Google). Es necesario citar adecuadamente el modelo base y el corpus WAXAL.
- La model card no documenta sesgos específicos ni análisis de equidad por subgrupos dialectales.
- Al ser una conversión de formato, cualquier limitación del checkpoint original se hereda sin cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dansarpong/whisper-small-waxal-aka-ggml
- Modelo base: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-aka
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- Dataset WAXAL: https://huggingface.co/datasets/google/WaxalNLP
- Repositorio Parley: https://github.com/dansarpong/parley
- Script de conversión: https://github.com/dansarpong/parley/blob/main/bench/twi/to_ggml.py
- Benchmark Twi de Parley: https://github.com/dansarpong/parley/tree/main/bench/twi
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
