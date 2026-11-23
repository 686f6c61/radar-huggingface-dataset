# oruk/orukqwen-asr-1.7b

## Resumen

orukqwen-asr-1.7b es un modelo de reconocimiento automatico del habla (ASR) desarrollado por oruk, un laboratorio centrado en APIs de voz. Se trata de un post-entrenamiento del modelo Qwen3-ASR-1.7B de Alibaba, sobre el que se aplica una fase de aprendizaje por refuerzo (RL) con el algoritmo GSPO y asignacion de credito a nivel de token basada en distancia de Levenshtein, seguida de un promediado de pesos en el espacio de parametros (model soup de tres ejecuciones RL hermanas, interpoladas al 50/50 con el modelo base al estilo WiSE-FT). La arquitectura, el tokenizador, el formato de prompt y el codigo de inferencia son identicos a los del modelo base; solo cambian los pesos.

El modelo cuenta con 2.038.052.480 parametros en formato safetensors bf16 y se distribuye bajo licencia Apache-2.0. Su relevancia reside en que demuestra que es posible mejorar un ASR de tamano medio con un presupuesto de computo muy reducido: aproximadamente 14 horas de GPU en una unica NVIDIA A100 de 40 GB, mas una pasada de seleccion de datos de hasta 7,5 horas, sobre un corpus de 54,6 horas de audio en ingles transcrito.

El autor declara un WER medio de 4,76 en las nueve pruebas del Open ASR Leaderboard en una reproduccion publica sobre H200, con un RTFx agregado de 718,84. La evaluacion en el conjunto privado del leaderboard esta pendiente de confirmacion por parte de los mantenedores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (heredada de Qwen3-ASR-1.7B) |
| Parametros totales | 2.038.052.480 (2,04B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), layout `-hf` de transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-ASR-1.7B, un modelo de reconocimiento automatico del habla basado en transformer. El post-entrenamiento de oruk no modifica la arquitectura, el tokenizador, el formato de prompt ni el codigo de inferencia: unicamente altera los pesos mediante RL y promediado en el espacio de parametros.

El proceso de RL utiliza GSPO-token con asignacion de credito a nivel de token basada en Levenshtein. Para cada grabacion de entrenamiento se muestrean 64 transcripciones de la politica actual con temperatura 0,8. La recompensa de cada transcripcion es `r = 1 − min(WER, 1)` calculada sobre texto normalizado, con un normalizador por palabra que elimina muletillas y etiquetas de sonido no linguistico; no se emplea un juez aprendido. La ventaja se calcula con una linea base de media leave-one-out dividida por la desviacion tipica de las recompensas del grupo, siguiendo la receta GSPO de NVIDIA (Nemotron). Se descartan los grupos con las 64 recompensas identicas y cada actualizacion emplea 20 grupos informativos (1.280 transcripciones). El objetivo es GSPO-token, con ratio de importancia a nivel de secuencia (media geometrica sobre tokens) transportado por token, rango de recorte 3e-4 / 4e-4 y perdida promediada por rollout (1/|y|). Tras el RL se realiza un model soup uniforme de tres ejecuciones RL hermanas, interpolado al 50/50 con el modelo base al estilo WiSE-FT. El entrenamiento se ejecuto en una unica A100 de 40 GB durante unas 14 horas de GPU, con una pasada previa de seleccion de datos de hasta 7,5 horas, sobre un pool de 54,6 horas de audio en ingles transcrito.

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio transcrito.
- Generacion de transcripciones con normalizacion de texto y eliminacion de muletillas y etiquetas no linguisticas.
- Inferencia compatible con la libreria `transformers` y el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de vision, audio generativo, tool calling, agentes o razonamiento multi-paso en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede transcribir audio de reuniones en ingles con un WER declarado de 7,92 en AMI-Cleaned, adecuado para generar actas y resumenes posteriores en pipelines de productividad.
- Subtitulado de contenido audiovisual: con un WER de 1,2 en LibriSpeech test.clean y 2,92 en test.other, es apto para generar subtitulos de calidad en material con locucion clara y en condiciones menos controladas.
- Transcripcion de llamadas de atencion al cliente: el rendimiento en Voxpopuli-AA-Cleaned (WER 2,07) y SPGISpeech (2,74) lo hace util para analitica de conversaciones y control de calidad en centros de contacto.
- Analisis de earnings calls y audio financiero: el WER de 5,88 en Earnings22-Cleaned-AA-chunked permite transcribir llamadas de resultados para su posterior analisis de sentimiento y extraccion de entidades.
- Investigacion en ASR y RL: al ser un artefacto de investigacion con metodo y artefactos publicados, sirve como referencia reproducible para experimentar con GSPO, asignacion de credito a nivel de token y model soups en modelos de voz.
- Procesamiento de audio con acentos y dominio indio: el WER de 3,51 en Voice Arena Monsoon (Monsoon en_IN) lo hace util para transcripcion de audio en ingles con acento indio.
- Reconocimiento de habla en entornos con ruido o dominio especifico: el WER de 9,44 en URGENT2024 indica un rendimiento mas limitado en condiciones degradadas, por lo que se recomienda para escenarios controlados o con post-procesado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por el leaderboard):

| Dataset | Split | WER |
|---|---|---|
| AMI-Cleaned | test | 7,92 |
| Earnings22-Cleaned-AA-chunked | test | 5,88 |
| Gigaspeech-Cleaned | test | 7,12 |
| LS Clean (LibriSpeech) | test.clean | 1,20 |
| LS Other (LibriSpeech) | test.other | 2,92 |
| SPGISpeech | test | 2,74 |
| URGENT2024 | test | 9,44 |
| Voice Arena Monsoon (en_IN) | test | 3,51 |
| Voxpopuli-AA-Cleaned | test | 2,07 |

Datos agregados declarados: WER medio de 4,76 en las nueve pruebas del Open ASR Leaderboard y RTFx agregado de 718,84, en una reproduccion publica sobre NVIDIA H200 del 6 de noviembre. La evaluacion en el conjunto privado del leaderboard esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB solo para pesos (2,04B parametros × 2 bytes), mas memoria para activaciones y buffers de audio; en la practica se recomienda un minimo de 8-12 GB de VRAM.
- GPU recomendadas: NVIDIA A100 40 GB (usada en el entrenamiento), H200 (usada en la reproduccion publica del leaderboard), H100.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, aunque no se han publicado mediciones especificas para estas tarjetas.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: RTFx agregado declarado de 718,84 sobre H200 en la reproduccion del Open ASR Leaderboard; no se han publicado cifras de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (Open ASR Leaderboard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oruk/orukqwen-asr-1.7b | 2,04B | no disponible | 4,76 medio (9 pruebas, no verificado) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B (modelo base) | 1,7B (nominal) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |
| oruk/orukeet | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks del modelo base ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible cuantificar la mejora respecto a Qwen3-ASR-1.7B.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan capacidades multilingues.
- El rendimiento cae en dominios dificiles: WER de 9,44 en URGENT2024 y 7,92 en AMI-Cleaned, frente a 1,2 en LibriSpeech clean.
- Los resultados de benchmarks son declarados por el autor y no estan verificados por el leaderboard (`verified: false`); la evaluacion en el conjunto privado esta pendiente.
- Es un artefacto de investigacion; no se documenta un proceso de validacion en produccion ni garantias de robustez ante ruido, acentos no vistos o audio de baja calidad.
- Riesgo de alucinacion en transcripciones de audio ambiguo o con habla solapada, inherente a los modelos ASR generativos; no se documenta mitigacion especifica.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar las condiciones del modelo original Qwen3-ASR-1.7B.
- No se documentan sesgos especificos ni composicion demografica del corpus de entrenamiento (54,6 horas de audio en ingles transcrito).
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre el comportamiento en formatos distintos de safetensors bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oruk/orukqwen-asr-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Articulo de investigacion: https://oruk.ai/research/orukqwen-rl
- Artefactos de la reproduccion en H200: https://huggingface.co/buckets/oruk/openasr-orukqwen-h200-20261106
- Modelo alojado Orukeet: https://oruk.ai/models/orukeet
- Quickstart de la API: https://oruk.ai/docs/quickstart
- Modelos de oruk: https://oruk.ai/models
- Sitio de oruk: https://oruk.ai/
- Modelo orukeet en Hugging Face: https://huggingface.co/oruk/orukeet
- Que miden las paralinguisticas: https://oruk.ai/what-is-paralinguistics
- Analizador de emocion en voz: https://oruk.ai/tools/voice-emotion-analyzer
- API de reconocimiento de emocion en habla: https://oruk.ai/speech-emotion-recognition-api
- Paper GSPO (arXiv:2507.18071): https://arxiv.org/abs/2507.18071
- Paper WiSE-FT (arXiv:2109.01903): https://arxiv.org/abs/2109.01903
- Paper de referencia (arXiv:2203.05482): https://arxiv.org/abs/2203.05482
- Paper de referencia (arXiv:2512.20856): https://arxiv.org/abs/2512.20856
- Paper de referencia (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
