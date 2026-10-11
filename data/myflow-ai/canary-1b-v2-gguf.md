# myflow-ai/canary-1b-v2-gguf

## Resumen

Canary-1b-v2-gguf es la conversión a formato GGUF del modelo de reconocimiento y traducción de voz `nvidia/canary-1b-v2`, publicada por el usuario `myflow-ai` para su uso con el motor de inferencia transcribe.cpp. Se trata de un modelo multitarea de tipo encoder-decoder (multitask AED) de aproximadamente 978 millones de parámetros (980.046.848 según el recuento real del repositorio), compuesto por un encoder FastConformer de 32 capas y un decoder Transformer de 8 capas. Resuelve dos tareas sobre audio en 16 kHz mono: transcripción automática de voz (ASR) en 25 idiomas europeos y traducción de voz (AST) entre inglés y los otros 24 idiomas soportados.

Su relevancia práctica radica en que permite ejecutar un sistema de ASR multilingüe de casi mil millones de parámetros en hardware de consumo, incluyendo CPU y GPU integradas, gracias a cuantizaciones que van desde 3,7 GB (F32) hasta 701 MB (Q4_K_M). El modelo original, publicado por NVIDIA, está pensado para uso comercial y no comercial bajo licencia CC-BY-4.0, y esta conversión preserva esa licencia. El repositorio incluye además métricas de calidad (WER sobre LibriSpeech test-clean) y de velocidad (RTF sobre Apple M4 Max y Ryzen 4750U) para cada nivel de cuantización, lo que facilita la elección del formato según el equilibrio entre precisión, memoria y latencia.

La conversión está anclada al commit `87bc526` del modelo base, fijado el 2026-05-08, y fue validada contra la referencia de NeMo en el commit `db53eda` de transcribe.cpp en la misma fecha. El modelo no es de streaming y no expone detección de idioma ni marcas de tiempo en este port.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea (multitask AED): encoder FastConformer de 32 capas y decoder Transformer de 8 capas |
| Parametros totales | 980.046.848 (aproximadamente 978-980 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Modelo offline sobre audio de 16 kHz mono; no es streaming |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25 idiomas europeos: bulgaro (bg), croata (hr), checo (cs), danes (da), neerlandes (nl), ingles (en), estonio (et), finlandes (fi), frances (fr), aleman (de), griego (el), hungaro (hu), italiano (it), letón (lv), lituano (lt), maltes (mt), polaco (pl), portugues (pt), rumano (ro), eslovaco (sk), esloveno (sl), espanol (es), sueco (sv), ruso (ru) y ucraniano (uk) |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF (un fichero por nivel de cuantizacion) |

## Arquitectura y entrenamiento

La arquitectura es un modelo multitarea de encoder-decoder (AED) para voz. El encoder es un FastConformer de 32 capas, variante de Conformer con atencion por bloques que reduce el coste computacional manteniendo el modelado convolucional de la señal acustica. El decoder es un Transformer de 8 capas que genera la secuencia de tokens de texto correspondiente a la tarea indicada (transcripcion en el idioma de origen o traduccion hacia o desde el ingles). El modelo completo suma 978 millones de parametros en el modelo base; el fichero safetensors del repositorio reporta 980.046.848.

La informacion disponible no detalla el volumen de tokens de audio utilizados en el preentrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo base es `nvidia/canary-1b-v2` y esta conversion no modifica los pesos, solo su representacion en formato GGUF. La innovacion tecnica destacable en esta ficha es de despliegue: la cuantizacion K-quant permite reducir el modelo de 3,7 GB a 701 MB sin degradacion apreciable del WER en ingles (1,91 % en Q4_K_M frente a 1,92 % en F32 sobre LibriSpeech test-clean con decodificacion greedy y sin modelo de lenguaje externo). El port ha sido validado numericamente contra la implementacion de referencia en NeMo.

## Capacidades

- Transcripcion automatica de voz (ASR) en 25 idiomas europeos, incluyendo lenguas con menos recursos como el maltes, el estonio, el letón o el esloveno.
- Traduccion de voz (AST) de ingles a los otros 24 idiomas soportados.
- Traduccion de voz (AST) desde los otros 24 idiomas hacia ingles.
- Procesamiento de audio de entrada en formato WAV mono a 16 kHz (se requiere conversion previa con ffmpeg si el origen es MP3 u otro formato/frecuencia).
- Inferencia totalmente offline, sin dependencia de servicios en la nube.
- Ejecucion en CPU, Metal (Apple Silicon) y Vulkan mediante transcribe.cpp.
- No soporta streaming: procesa la señal por utterance completa.
- No realiza deteccion automatica de idioma (`lang_detect: false`): el idioma de origen debe especificarse.
- No expone marcas de tiempo por palabra o segmento en este port (`timestamps: none`), aunque el modelo original las proporcione.
- Soporte de tool calling, function calling, agentes, vision o audio generativo: no disponible (modelo exclusivamente de voz a texto).

## Casos de uso

- Transcripcion de reuniones multilingues: el modelo puede transcribir reuniones en cualquiera de los 25 idiomas soportados con un fichero GGUF de 701 MB (Q4_K_M), lo que permite desplegarlo en la propia maquina del usuario sin enviar el audio a terceros, un requisito habitual en entornos corporativos con datos sensibles.
- Subtitulado y localizacion de video: la combinacion de ASR multilingue y traduccion ingles a 24 idiomas permite generar pistas de subtitulos traducidas en un solo paso de inferencia, util para plataformas de e-learning y distribucion de contenido europeo.
- Centros de contacto y analitica de llamadas: transcripcion offline de grabaciones de atencion al cliente en idiomas como espanol, aleman, frances, italiano o polaco, con el texto resultante alimentando sistemas de analisis de sentimiento, control de calidad o busqueda semantica.
- Archivado y busqueda de fondos audiovisuales: transcripcion por lotes de archivos de radio, television o podcast para generar indices de texto buscables; el modo offline y la ejecucion en CPU permiten procesar grandes volumenes sin coste por minuto de API.
- Investigacion en linguistica computacional: generacion de transcripciones para lenguas europeas con pocos recursos (maltes, estonio, lituano, esloveno) alli donde las alternativas comerciales tienen cobertura limitada, con licencia CC-BY-4.0 que facilita la publicacion de los resultados.
- Dictado y documentacion profesional: transcripcion de notas de voz o dictados en entornos con conectividad limitada, usando la cuantizacion Q5_K_M de 798 MB en un portatil convencional con CPU.
- Traduccion de audio para podcast y contenido editorial: conversion de episodios en ingles a versiones localizadas en las 24 lenguas de destino sin pasar por una etapa intermedia de texto separada.
- Despliegue en dispositivos embebidos o edge: el fichero Q4_K_M de 701 MB y la compatibilidad con Vulkan y CPU permiten integrar transcripcion multilingue en equipos con recursos muy limitados, como mini-PC o portatiles sin GPU dedicada.

## Benchmarks y rendimiento

WER sobre la particion completa de LibriSpeech test-clean (2620 utterances), decodificacion greedy y sin modelo de lenguaje externo, tal como los reporta el autor de la conversion:

| Cuantizacion | Tamano del fichero | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 3,7 GB | 1,92 % |
| F16 | 1,8 GB | 1,92 % |
| Q8_0 | 1,1 GB | 1,91 % |
| Q6_K | 889 MB | 1,94 % |
| Q5_K_M | 798 MB | 1,93 % |
| Q4_K_M | 701 MB | 1,91 % |

Factor de tiempo real (RTF) medido por el autor con transcribe.cpp. Un valor mas alto indica mayor velocidad de procesamiento respecto al tiempo real del audio:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 85,2 |
| Apple M4 Max | CPU | 18,9 |
| Ryzen 4750U | Vulkan | 13,2 |
| Ryzen 4750U | CPU | 6,7 |

La model card del modelo base (`nvidia/canary-1b-v2`) reporta un 2,18 % de WER en el mismo conjunto; el autor del port indica que su resultado F32 (1,92 %) esta ligeramente por debajo y lo atribuye a diferencias de metodologia de evaluacion (Δ −0,26 puntos porcentuales). No se han publicado en la informacion disponible resultados de WER para los otros 24 idiomas soportados, ni resultados de benchmarks de traduccion de voz (BLEU u otras metricas).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de buffers de activaciones y decoder. Valores orientativos: 3,7 GB (F32), 1,8 GB (F16), 1,1 GB (Q8_0), 889 MB (Q6_K), 798 MB (Q5_K_M) y 701 MB (Q4_K_M). Estas cifras son estimaciones derivadas del tamano de los ficheros publicados, no mediciones directas de VRAM reportadas por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. El autor solo publica mediciones sobre Apple M4 Max (Metal) y Ryzen 4750U (Vulkan).
- Compatibilidad con GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M, con 701 MB y 798 MB de pesos, caben con holgura en cualquier GPU de consumo actual, e incluso en GPU integradas. La version F32 (3,7 GB) tambien cabe en GPU con 8 GB o mas de memoria.
- Despliegue: transcribe.cpp (compilacion desde codigo fuente con CMake; binario `transcribe-cli`). El modelo base puede ejecutarse con NeMo, aunque la informacion proporcionada no detalla procedimientos de despliegue con otros motores como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: RTF de 85,2 en Metal sobre M4 Max, 18,9 en CPU sobre M4 Max, 13,2 en Vulkan sobre Ryzen 4750U y 6,7 en CPU sobre Ryzen 4750U. Valores de latencia absoluta (ms por utterance) y de throughput en lotes no disponibles.
- Entrada requerida: audio WAV mono a 16 kHz. No admite streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formatos | Licencia | Rendimiento documentado |
|---|---:|---|---|---|---|
| myflow-ai/canary-1b-v2-gguf (esta ficha) | 980.046.848 | 25 europeos (ASR) + traduccion en ambos sentidos con ingles | GGUF (F32 a Q4_K_M) | CC-BY-4.0 | WER 1,91-1,94 % en LibriSpeech test-clean segun cuantizacion |
| nvidia/canary-1b-v2 (modelo base) | 978 M (aproximadamente 1 B) | 25 europeos (ASR) + traduccion en ambos sentidos con ingles | No disponible en la informacion proporcionada | CC-BY-4.0 | WER 2,18 % en LibriSpeech test-clean segun la model card del autor original |
| Alternativas de la misma categoria (por ejemplo, otros modelos ASR multilingues de aproximadamente 1 B) | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye comparativas con modelos de terceros de la misma categoria (Whisper, Parakeet u otros sistemas ASR multilingues), por lo que no es posible establecer una comparacion cuantitativa con ellos a partir de los datos disponibles. Cabe senalar que los enlaces de descarga de la model card apuntan al repositorio `handy-computer/canary-1b-v2-gguf`, mientras que la ficha corresponde a `myflow-ai/canary-1b-v2-gguf`; conviene verificar cual es el origen efectivo de los ficheros antes de usarlos en produccion.

## Limitaciones y advertencias

- El modelo no soporta streaming: requiere la señal completa antes de transcribir, lo que lo inhabilita para casos de uso de transcripcion en vivo con latencia minima.
- No expone marcas de tiempo por palabra ni por segmento en este port, lo que complica la alineacion con subtitulos o la generacion de indices temporales.
- No realiza deteccion automatica de idioma. Es obligatorio indicar el idioma de origen, lo que anade complejidad en escenarios con audio de idioma desconocido o mezclado.
- Solo acepta audio WAV mono a 16 kHz; cualquier otro formato o frecuencia exige un paso previo de conversion.
- El WER documentado corresponde unicamente al ingles (LibriSpeech test-clean). No hay datos publicados en la informacion disponible sobre la calidad en los otros 24 idiomas, que puede ser sustancialmente peor en lenguas con menos recursos.
- Como todo sistema ASR, existe riesgo de alucinacion o de insercion de texto en segmentos con silencio prolongado, musica o ruido de fondo. No se han publicado estudios especificos de este comportamiento en la informacion disponible.
- La diferencia observada entre el WER del port (1,92 % en F32) y el reportado por NVIDIA para el modelo base (2,18 %) se atribuye a diferencias de metodologia de evaluacion, no a una mejora real del modelo; conviene no interpretarla como una ganancia de calidad.
- No se dispone de informacion en la documentacion proporcionada sobre sesgos demograficos, acusticos o dialectales del modelo.
- Licencia CC-BY-4.0: permite uso comercial y no comercial siempre que se otorgue la atribucion correspondiente al autor original (NVIDIA) y a la conversion. Conviene revisar los terminos completos en la model card del modelo base.
- Las fechas de los metadatos del repositorio (creacion 2026-10-11) y del commit fijado (2026-05-08) no son coherentes entre si, lo que sugiere posibles inconsistencias en la publicacion; se recomienda validar el artefacto antes de desplegarlo.
- La discrepancia entre el repositorio anunciado (`myflow-ai`) y los enlaces de descarga de la model card (`handy-computer`) debe resolverse antes de integrar el modelo en un pipeline de produccion.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/myflow-ai/canary-1b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Commit del modelo base fijado por el autor: https://huggingface.co/nvidia/canary-1b-v2/commit/87bc526
- Motor de inferencia transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado en la validacion: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-v2.md
- Demo del modelo original: https://huggingface.co/spaces/nvidia/canary-1b-v2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Portal para desarrolladores de NVIDIA: https://developer.nvidia.com
- Referencias arXiv incluidas en las etiquetas del repositorio: https://arxiv.org/abs/2509.14128, https://arxiv.org/abs/2505.13404, https://arxiv.org/abs/2305.05084, https://arxiv.org/abs/1706.03762, https://arxiv.org/abs/2410.01036, https://arxiv.org/abs/2406.00899, https://arxiv.org/abs/2205.12446, https://arxiv.org/abs/2012.03411, https://arxiv.org/abs/2007.10310, https://arxiv.org/abs/2005.08072, https://arxiv.org/abs/1510.08484
