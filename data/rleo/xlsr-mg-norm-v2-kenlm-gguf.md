# rleo/xlsr-mg-norm-v2-kenlm-GGUF

## Resumen

`rleo/xlsr-mg-norm-v2-kenlm-GGUF` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `malagasy-asr/xlsr-mg-norm-v2-kenlm`, especializado en malgache. El modelo original parte de XLS-R 300M de Meta y se ha afinado con CTC sobre audio en malgache, incorporando un modelo de lenguaje KenLM de 4-gramas para el decodificado por búsqueda en haz. Esta versión GGUF empaqueta en un único fichero la red CTC, el vocabulario de 47 caracteres, los parámetros del decodificador y el modelo KenLM en formato ARPA, de modo que no se necesita ningún componente externo para transcribir.

La relevancia de esta conversión es práctica: permite ejecutar el reconocedor con `wav2vec2-rs` (Rust/Candle) en CUDA, Metal o CPU, sin depender del stack de Python (transformers + pyctcdecode). Según la model card, la búsqueda en haz produce las mismas transcripciones que la configuración original y el WER medido en un subconjunto de evaluación es prácticamente idéntico (16,25 % en Q8_0 frente a 16,37 % en el original F32).

El modelo está pensado para un nicho muy concreto: transcripción de voz en malgache con despliegue ligero. No es un modelo multilingüe ni un LLM; es un sistema ASR de 300 millones de parámetros con contexto acústico limitado y una licencia no especificada por los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLS-R 300M (wav2vec2 con CTC) + KenLM 4-gramas para decodificado |
| Parametros totales | 300 M (red acústica); el LM KenLM se incluye embebido en ARPA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; transcripción en ventanas de 40 s |
| Tipos de cuantizacion | F16 (699 MB) y Q8_0 (416 MB); el original en F32 (1,33 GB) |
| Idiomas soportados | malgache (`mg`) |
| Licencia | no disponible (la model card original no especifica licencia; aplican los términos de los autores originales) |
| Formato de pesos | GGUF (un fichero por cuantización, con LM ARPA embebido) |

## Arquitectura y entrenamiento

La red acústica es XLS-R 300M, un transformer wav2vec2 preentrenado por Meta sobre audio multilingüe y afinado con CTC para malgache. La conversión a GGUF parte del checkpoint `step-2000` (commit `fc59abe`) del repositorio fuente; durante la conversión se pliega el weight norm de las convoluciones posicionales, se eliminan los tensores exclusivos de preentrenamiento y se mantienen normas y sesgos en F32. El vocabulario CTC tiene 47 caracteres.

El decodificado combina la salida CTC con un modelo de lenguaje KenLM de 4-gramas mediante búsqueda en haz con beam 500, alpha 0,5 y beta 0,3. El LM en formato ARPA va embebido en el propio fichero GGUF, de modo que el reconocedor es autocontenido. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de ajuste adicionales más allá del fine-tuning supervisado con CTC.

## Capacidades

- Transcripción de voz a texto en malgache, con salida en minúsculas y sin puntuación.
- Decodificado CTC con modelo de lenguaje de 4-gramas integrado (búsqueda en haz, beam 500).
- Ejecución autocontenida: un único fichero GGUF incluye red, vocabulario, parámetros de decodificado y LM.
- Despliegue en CUDA, Metal y CPU mediante `wav2vec2-rs` (Rust/Candle).
- Servidor compatible con la API OpenAI `/v1/audio/transcriptions` a través del subcomando `serve`.
- Integración con `zallama` mediante `zallama pull xlsr:mg` (backend `wav2vec2-server`).
- Procesamiento por ventanas de 40 s para grabaciones largas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en malgache: el modelo procesa audio en ventanas de 40 s y puede encadenarse para cubrir grabaciones de varios minutos, con un WER de referencia del 16,25 % en Q8_0 sobre el conjunto de evaluación indicado.
- Subtitulado de contenido audiovisual malgache: la salida en minúsculas y sin puntuación encaja en pipelines que aplican posteriormente un modelo de puntuación o formateo.
- Servicio de transcripción autoalojado: el subcomando `serve` expone un endpoint compatible con la API de OpenAI, lo que permite sustituir servicios en la nube por despliegue local.
- Archivado y búsqueda de audio histórico: transcripción por lotes en CPU (aproximadamente 7× tiempo real en 32 núcleos) para digitalizar fondos sonoros sin GPU.
- Investigación lingüística sobre malgache: generación de corpus transcritos a partir de grabaciones de campo, con la ventaja de un despliegue ligero en portátiles o servidores modestos.
- Integración en aplicaciones de escritorio o embebidas: al ser Rust/Candle y con ficheros de 416-699 MB, puede incorporarse en herramientas nativas sin runtime de Python.
- Evaluación comparativa de ASR de bajos recursos: sirve como referencia reproducible para comparar variantes de decodificado (con y sin LM) en malgache.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 135 grabaciones (44 min) de `badrex/malagasy-speech-full`, shard de test 0, con texto normalizado como en la model card original:

| Modelo / formato | Pesos | Tamano | WER | CER |
|---|---|---|---|---|
| `xlsr-mg-norm-v2-f16.gguf` | F16 | 699 MB | 16,34 % | 4,24 % |
| `xlsr-mg-norm-v2-q8_0.gguf` | Q8_0 | 416 MB | 16,25 % | 4,20 % |
| Original (transformers + pyctcdecode) | F32 | 1,33 GB | 16,37 % | 4,24 % |

La model card original reporta un 21,43 % de WER sobre su propio conjunto de test de 1.860 grabaciones. En cuanto a velocidad: aproximadamente 250× tiempo real de extremo a extremo con LM en una RTX 4090 (2,5 GB de VRAM máxima con ventanas de 40 s) y aproximadamente 7× tiempo real en CPU con 32 núcleos.

## Requisitos de hardware

- VRAM estimada: alrededor de 2,5 GB de pico en RTX 4090 con ventanas de 40 s y LM activo (dato de la model card).
- GPU recomendadas: RTX 4090 para el rendimiento reportado; cualquier GPU compatible con CUDA a través de `wav2vec2-rs` debería funcionar, aunque no se publican cifras para otros modelos.
- Cabe en GPU de consumo: sí, con un pico de VRAM de aproximadamente 2,5 GB, muy por debajo de las GPUs consumer habituales.
- Despliegue: `wav2vec2-rs` (compilación con `--cuda` o soporte Metal/CPU), subcomando `serve` con API compatible con OpenAI, e integración con `zallama`.
- CPU: aproximadamente 7× tiempo real en 32 núcleos.
- Latencia y throughput: 250× tiempo real en RTX 4090 de extremo a extremo con LM; no se publican cifras de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `rleo/xlsr-mg-norm-v2-kenlm-GGUF` (este) | 300 M | ventanas de 40 s | malgache | no disponible | GGUF (F16, Q8_0) |
| `malagasy-asr/xlsr-mg-norm-v2-kenlm` (original) | 300 M | ventanas de 40 s | malgache | no disponible | safetensors / transformers |
| XLS-R 300M base (Meta) | 300 M | no disponible | multilingüe (preentrenamiento) | no disponible en esta ficha | safetensors |

La comparación directa con otros sistemas ASR para malgache no está disponible en la información proporcionada. Frente al modelo original, la diferencia principal es el formato y el runtime (GGUF autocontenido frente a transformers + pyctcdecode), con un rendimiento prácticamente idéntico.

## Limitaciones y advertencias

- El cambio de código francés/malgache, los hablantes solapados y el audio de baja calidad reducen la precisión.
- La salida es en minúsculas y sin puntuación; requiere postprocesado si se necesita texto formateado.
- Las grabaciones largas se transcriben en ventanas de 40 s; una pasada única sobre varios minutos degrada mucho el modelo.
- Solo soporta malgache; no es multilingüe.
- La licencia no está especificada: la model card original no declara términos, por lo que el uso comercial queda sujeto a la decisión de los autores originales y debe verificarse antes de producción.
- El WER de referencia en el subconjunto de evaluación (16,25-16,34 %) es inferior al reportado por la model card original en su conjunto completo (21,43 %); los conjuntos de evaluación no son directamente comparables.
- Riesgo de alucinación inherente a los sistemas CTC con LM: el modelo de lenguaje puede corregir hacia palabras plausibles aunque el audio no las respalde.
- No se han publicado datos sobre sesgos demográficos o acústicos específicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rleo/xlsr-mg-norm-v2-kenlm-GGUF
- Modelo original: https://huggingface.co/malagasy-asr/xlsr-mg-norm-v2-kenlm
- Runtime `wav2vec2-rs`: https://github.com/rzafiamy/wav2vec2-rs
- Integración `zallama`: https://github.com/rzafiamy/zallamars
- Dataset de evaluación: https://huggingface.co/datasets/badrex/malagasy-speech-full
