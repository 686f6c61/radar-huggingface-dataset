# avericaai/cohere-transcribe-arabic-07-2026-gguf

## Resumen

Cohere Transcribe Arabic es un modelo de reconocimiento automatico del habla (ASR) de 2.049 millones de parametros desarrollado por Cohere y Cohere Labs, publicado originalmente en julio de 2026. La ficha que nos ocupa es una conversion a formato GGUF realizada por el usuario avericaai para su uso con el runtime transcribe.cpp, derivada del modelo base `CohereLabs/cohere-transcribe-arabic-07-2026`. El modelo resuelve la transcripcion offline de audio en arabe (incluyendo dialectos y code-switching arabe-ingles) con el ingles como idioma secundario.

La arquitectura combina un encoder Conformer con una cabeza encoder-decoder Transformer con atencion cruzada y embeddings de tokens atados. El modelo acepta audio WAV mono a 16 kHz y una bandera de idioma (`-l ar` o `-l en`), y produce la transcripcion mediante decodificacion autorregresiva. Su relevancia actual radica en que ofrece un ASR dedicado y ligero (2B parametros) que cabe en hardware de consumo en cuantizaciones Q4_K_M de 1,56 GB, con una degradacion de WER practicamente nula respecto al modelo en BF16.

Esta ficha corresponde a la conversion GGUF, no al modelo original. El repositorio incluye seis cuantizaciones (BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) validadas numericamente contra la referencia de Transformers, con un WER en FLEURS arabe que se mantiene entre el 10,95% y el 11,18% en todas ellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + Transformer encoder-decoder con atencion cruzada y embeddings atados |
| Parametros totales | 2.049.026.832 (aproximadamente 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, ar (arabe estandar y dialectal, con code-switching arabe-ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Entrada | WAV mono 16 kHz, bandera de idioma obligatoria (`-l ar` o `-l en`) |
| Decodificacion | Autorregresiva, greedy, sin LM externo |
| Runtime | transcribe.cpp |
| Timestamps | no soportados (`none`) |
| Streaming | no soportado (`false`) |
| Traduccion | no soportada (`false`) |
| Deteccion de idioma | no soportada (`false`) |
| Tamano del repo | 15,9 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cohere Transcribe 03-2026, una adaptacion centrada en arabe. El encoder es un Conformer, que combina bloques convolucionales con auto-atencion para capturar dependencias locales y globales en la senal acustica. La cabeza es un encoder-decoder Transformer con atencion cruzada y embeddings de tokens atados, lo que reduce el numero de parametros y mejora la coherencia entre entrada y salida. La decodificacion es autorregresiva y greedy, sin modelo de lenguaje externo ni shallow fusion.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La model card original solo indica que el modelo esta optimizado para arabe e ingles, con enfasis en rendimiento sobre dialectos arabes y code-switching. La conversion GGUF fue realizada a partir del commit upstream `0a8193c` (fijado el 2026-07-07) y validada contra la referencia de Transformers en el commit `d89ecb7` de transcribe.cpp el mismo dia. La validacion numerica confirma que todas las cuantizaciones caen dentro del intervalo de confianza del 95% de la referencia BF16.

## Capacidades

- Transcripcion de voz a texto offline en arabe, incluyendo arabe dialectal (el split FLEURS evaluado es `ar_eg`, dialecto egipcio).
- Code-switching arabe-ingles: el modelo gestiona utterances que mezclan ambos idiomas.
- Transcripcion en ingles como idioma secundario, con WER notablemente inferior (4,88% en FLEURS en Q8_0 y Q5_K_M).
- Entrada de audio WAV mono a 16 kHz; requiere conversion previa con ffmpeg si el audio viene en otro formato o frecuencia.
- Seleccion explicita de idioma mediante bandera (`-l ar` o `-l en`); no hay deteccion automatica de idioma.
- Decodificacion autorregresiva greedy sin LM externo.

No soporta streaming, timestamps, traduccion ni deteccion de idioma. No es un modelo de proposito general: no genera texto, no razona, no ejecuta codigo ni soporta tool calling.

## Casos de uso

- Transcripcion de reuniones y llamadas en arabe: el modelo procesa audio WAV mono 16 kHz y produce la transcripcion completa. Su tamano de 2B y las cuantizaciones de 1,56 GB permiten ejecutarlo en un portatil sin GPU dedicada.
- Subtitulado offline de contenido audiovisual en arabe: se convierte la pista de audio a WAV 16 kHz con ffmpeg y se transcribe por lotes. La ausencia de timestamps obliga a segmentar el audio previamente por utterance o por bloques.
- Analisis de encuestas y entrevistas telefonicas con dialecto egipcio: el split FLEURS evaluado es precisamente `ar_eg`, por lo que el modelo esta calibrado para ese registro coloquial.
- Atencion al cliente en centros de contacto arabohablantes: transcripcion de grabaciones para control de calidad y mineria de texto. El soporte de code-switching cubre clientes que alternan arabe e ingles.
- Investigacion linguistica y dialectologia: generacion de transcripciones de corpus orales arabes para analisis posterior, con la ventaja de que el modelo es Apache-2.0 y puede desplegarse en infraestructura propia sin dependencias de API.
- Sistemas embebidos o de borde: con Q4_K_M (1,56 GB) y el runtime transcribe.cpp, el modelo puede ejecutarse en dispositivos con CPU y soporte Vulkan o Metal, como revelan los RTF medidos en Ryzen 4750U y Apple M4 Max.
- Pipelines de accesibilidad: transcripcion de audio a texto para personas con discapacidad auditiva en contenido arabohablante, ejecutandose localmente sin enviar audio a servicios externos.

## Benchmarks y rendimiento

WER sobre el split completo de FLEURS arabe (428 utterances, batch 8, sin timestamps, decodificacion greedy, normalizador BasicTextNormalizer de Whisper). La referencia BF16 con Transformers nativo es 11,00%.

| Cuantizacion | Tamano | WER FLEURS ar | WER FLEURS en | WER LibriSpeech test-clean |
|---|---:|---:|---:|---:|
| BF16 | 4,11 GB | 11,02% | no disponible | 1,33% |
| F16 | 4,11 GB | 11,00% | no disponible | 1,33% |
| Q8_0 | 2,41 GB | 11,06% | 4,88% | 1,34% |
| Q6_K | 1,97 GB | 11,07% | no disponible | 1,34% |
| Q5_K_M | 1,77 GB | 10,95% | 4,88% | 1,34% |
| Q4_K_M | 1,56 GB | 11,18% | no disponible | 1,34% |

Rendimiento (factor de tiempo real, RTF; mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 11,3 |
| Apple M4 Max | Metal | 76,44 |
| AMD Ryzen 4750U | CPU | 4,31 |
| AMD Ryzen 4750U | Vulkan | 8,3 |

No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: BF16 y F16 requieren aproximadamente 4,11 GB de pesos; Q8_0 unos 2,41 GB; Q6_K 1,97 GB; Q5_K_M 1,77 GB; Q4_K_M 1,56 GB. A estas cifras hay que sumar el overhead del runtime y los buffers de activacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16/F16, o 2 GB para Q4_K_M. El modelo es lo bastante pequeno para no requerir A100 ni H100.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 y similares, incluso en BF16. En GPUs de 4 GB cabe en Q8_0 o inferiores.
- Despliegue: transcribe.cpp (unico runtime soportado por esta conversion GGUF). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El modelo base en safetensors puede ejecutarse con Transformers.
- Latencia y throughput: en Apple M4 Max con Metal, RTF de 76,44 (unas 76 veces mas rapido que tiempo real); en CPU del mismo equipo, RTF 11,3. En AMD Ryzen 4750U, RTF 4,31 en CPU y 8,3 con Vulkan. El backend Metal ofrece una aceleracion de aproximadamente 6,8x sobre CPU en M4 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER FLEURS ar | Licencia | Formato |
|---|---|---:|---|---|---|
| Cohere Transcribe Arabic (esta ficha, Q5_K_M) | 2B | ar, en | 10,95% | Apache-2.0 | GGUF |
| Cohere Transcribe Arabic (BF16) | 2B | ar, en | 11,02% | Apache-2.0 | GGUF / safetensors |
| Whisper large-v3 | no disponible en la informacion | multilingue | no disponible | MIT (segun conocimiento general, no verificado aqui) | safetensors, GGUF via terceros |
| Otros ASR arabes open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados de benchmarks de modelos alternativos sobre FLEURS arabe, por lo que no es posible establecer una comparacion numerica rigurosa. La comparativa se limita a los datos del propio modelo en sus distintas cuantizaciones.

## Limitaciones y advertencias

- Modelo de un solo proposito: solo transcribe audio; no genera texto, no razona, no soporta tool calling ni agentes.
- Sin streaming: debe procesarse el audio completo (o segmentos) de forma offline.
- Sin timestamps: no produce marcas temporales por palabra ni por segmento; requiere segmentacion externa si se necesitan.
- Sin deteccion automatica de idioma: el usuario debe indicar `-l ar` o `-l en`; una bandera incorrecta degradara la transcripcion.
- Sin traduccion: no traduce entre arabe e ingles, solo transcribe en el idioma indicado.
- Rendimiento dependiente del dialecto: la evaluacion publicada usa `ar_eg` (egipcio); el rendimiento en otros dialectos arabes no esta cuantificado en la informacion disponible. La model card advierte que el modelo rinde mejor dentro de la distribucion de un unico idioma preespecificado.
- Riesgo de alucinacion: como todo modelo autorregresivo, puede generar texto plausible en segmentos con ruido, silencio o audio de baja calidad; no hay LM externo que lo penalice.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada; cabe esperar sesgos derivados de la distribucion del corpus de entrenamiento (no disponible).
- Licencia Apache-2.0: permite uso comercial, pero se hereda del modelo base y conviene revisar los terminos upstream y el fichero NOTICE del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una conversion reciente y poco validada por la comunidad; existen conversiones equivalentes de otros autores (por ejemplo, `tryambientai/cohere-transcribe-arabic-07-2026-gguf`), lo que sugiere verificar la procedencia antes de usarla en produccion.
- Requiere audio WAV mono 16 kHz: cualquier otra entrada debe convertirse previamente con ffmpeg.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/avericaai/cohere-transcribe-arabic-07-2026-gguf
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Commit upstream del modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026/commit/0a8193c
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/d89ecb7
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-arabic-07-2026.md
- Licencia en el repositorio: https://huggingface.co/handy-computer/cohere-transcribe-arabic-07-2026-gguf/blob/main/LICENSE
- NOTICE del repositorio: https://huggingface.co/handy-computer/cohere-transcribe-arabic-07-2026-gguf/blob/main/NOTICE
- Conversion alternativa de otro autor: https://huggingface.co/tryambientai/cohere-transcribe-arabic-07-2026-gguf
- Modelo de referencia de la arquitectura: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
