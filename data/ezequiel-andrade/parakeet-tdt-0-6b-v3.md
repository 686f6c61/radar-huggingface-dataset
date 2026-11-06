# ezequiel-andrade/parakeet-tdt-0.6b-v3

## Resumen

Parakeet-tdt-0.6b-v3 es un modelo de reconocimiento automatico del habla (ASR) de tipo Transducer con decodificador TDT (Token-and-Duration Transducer) y encoder FastConformer. El modelo, distribuido en Hugging Face bajo el identificador `ezequiel-andrade/parakeet-tdt-0.6b-v3`, deriva de la familia Parakeet de NVIDIA y se publica con licencia CC-BY-4.0. Con 627 millones de parametros, esta disenado para transcripcion multilingual en 25 idiomas europeos, incluyendo espanol, ingles, frances, aleman, italiano y portugues, entre otros.

El modelo resuelve el problema de la transcripcion automatica de voz con un equilibrio entre precision y eficiencia computacional: su tamano (0,6B) permite despliegue en GPU de consumo, mientras que la arquitectura FastConformer con TDT reduce la latencia frente a transducers clasicos. Los resultados declarados por el autor en la model card muestran un WER de 1,93 en LibriSpeech clean y 3,45 en FLEURS espanol, lo que lo situa como una opcion competitiva para aplicaciones de transcripcion en produccion.

Es relevante ahora porque cubre 25 idiomas con un unico checkpoint, se integra en el ecosistema Transformers y NeMo, y ofrece pesos en safetensors y GGUF, lo que facilita su uso tanto en pipelines de investigacion como en despliegues optimizados con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y GGUF) |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer, una variante del Conformer que reduce el coste computacional mediante subsampling agresivo y atencion eficiente, combinado con un decodificador TDT (Token-and-Duration Transducer). TDT predice conjuntamente tokens y duraciones, lo que acelera la decodificacion frente a transducers convencionales al emitir multiples tokens por paso y reducir el numero de pasos necesarios. Esta arquitectura es la misma familia que los modelos Parakeet de NVIDIA, adaptada y publicada por el autor.

Los datos de entrenamiento declarados en la model card incluyen los datasets `nvidia/Granary` y `nemo/asr-set-3.0`, que cubren corpus multilingues de ASR. No se especifica en la informacion disponible el numero exacto de horas de audio, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a ASR). Tampoco se detalla si hubo destilacion o fine-tuning especifico sobre el checkpoint base de NVIDIA.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 25 idiomas europeos, con especial cobertura del espanol, ingles, frances, aleman, italiano y portugues.
- Transcripcion de audio de reuniones, llamadas, podcasts y grabaciones de dominio general.
- Manejo de audio con ruido y solapamiento de hablantes en cierta medida (evaluado en AMI y Earnings-22).
- Extraccion de caracteristicas acusticas (tag `feature-extraction`).
- Integracion con la libreria Transformers y el ecosistema NeMo.
- Soporte de pesos GGUF para inferencia optimizada en CPU y GPU de consumo.
- No se declaran capacidades de tool calling, agentes, vision ni audio generation; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones corporativas: el modelo puede procesar audio de reuniones multihablante y generar transcripciones con un WER de 11,31 en AMI, adecuado para actas automaticas y busqueda posterior en el texto.
- Subtitulado y transcripcion de contenido audiovisual: con WER de 2,75 en TED-LIUM v3 y 3,97 en SPGI Speech, es apto para generar subtitulos en ingles y otros idiomas europeos con calidad cercana a la humana en audio limpio.
- Atencion al cliente y analitica de llamadas: la transcripcion de llamadas permite alimentar sistemas de analisis de sentimiento y cumplimiento; el modelo cubre espanol con WER de 3,45 en FLEURS, lo que lo hace viable para mercados hispanohablantes.
- Documentacion clinica y legal dictada: la transcripcion de dictados en entornos profesionales se beneficia del bajo WER en audio limpio (1,93 en LibriSpeech clean) y de la cobertura multilingue para equipos internacionales.
- Investigacion linguistica y corpus: el modelo puede transcribir grandes volumenes de audio para construir corpus anotados en 25 idiomas, con pesos GGUF que permiten ejecucion en clusters de CPU.
- Asistentes de voz embebidos: con 627M de parametros y soporte GGUF, puede desplegarse en GPUs de consumo o incluso CPU para transcripcion en tiempo casi real en aplicaciones de escritorio y moviles.
- Moderacion de contenido en audio: transcripcion de audio subido por usuarios para detectar contenido inapropiado, con cobertura multilingue que reduce la necesidad de multiples modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Idioma | WER (%) |
|---|---|---|
| LibriSpeech clean | en | 1,93 |
| LibriSpeech other | en | 3,59 |
| TED-LIUM v3 | en | 2,75 |
| SPGI Speech | en | 3,97 |
| FLEURS | es | 3,45 |
| FLEURS | en | 4,85 |
| FLEURS | de | 5,04 |
| FLEURS | fr | 5,15 |
| Vox Populi | en | 6,14 |
| GigaSpeech | en | 9,59 |
| FLEURS | cs | 11,01 |
| AMI (Meetings) | en | 11,31 |
| Earnings-22 | en | 11,42 |
| FLEURS | bg | 12,64 |
| FLEURS | fi | 13,21 |
| FLEURS | et | 17,73 |
| FLEURS | da | 18,41 |
| FLEURS | el | 20,70 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en FP16 (627M parametros), y alrededor de 1,5 GB en cuantizacion de 8 bits. Los pesos GGUF permiten reducir aun mas el consumo en CPU.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alta concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia en una sola GPU con buena latencia.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (RTX 3050, RTX 4060, GTX 1660 con cuantizacion).
- Opciones de despliegue: Transformers (pipeline ASR), NeMo, llama.cpp (via GGUF), Ollama (si se publica el adaptador correspondiente), TGI no confirmado para esta arquitectura, vLLM no confirmado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La arquitectura TDT esta disenada para reducir la latencia de decodificacion frente a transducers clasicos, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 | 627M | no disponible | 25 | CC-BY-4.0 | safetensors, GGUF |
| Whisper large-v3 | 1,55B | 30 s de audio | ~99 | MIT | safetensors, GGUF |
| Whisper medium | 769M | 30 s de audio | ~99 | MIT | safetensors, GGUF |
| Parakeet-tdt-1.1b (NVIDIA) | 1,1B | no disponible | en (principalmente) | CC-BY-4.0 | safetensors |

La comparativa con Whisper es la mas directa por tamano y disponibilidad de pesos GGUF. Whisper large-v3 ofrece mayor cobertura idiomatica y contexto de audio de 30 segundos, mientras que parakeet-tdt-0.6b-v3 se centra en 25 idiomas europeos con menor numero de parametros. No se dispone de comparativas de WER entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model card).
- El WER en idiomas como griego (20,70), danes (18,41) y estonio (17,73) es notablemente alto, lo que limita su uso en produccion para esos idiomas sin evaluacion adicional.
- No se especifica la longitud maxima de audio procesable ni la estrategia de segmentacion; en audios largos puede requerir chunking manual.
- El modelo esta entrenado principalmente con datos de `nvidia/Granary` y `nemo/asr-set-3.0`; puede presentar sesgos hacia dominios y acentos sobrerrepresentados en esos corpus.
- Riesgo de alucinacion en audio con ruido extremo o silencios largos, comun en modelos ASR.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero no se detallan restricciones adicionales sobre los datos de entrenamiento subyacentes.
- No se declaran capacidades de diarizacion de hablantes ni puntuacion automatica; la salida es texto transcrito sin metadatos de hablante.
- El modelo no soporta tool calling ni agentes; su uso esta limitado a ASR y extraccion de caracteristicas.

## Enlaces

- Hugging Face: https://huggingface.co/ezequiel-andrade/parakeet-tdt-0.6b-v3
- Paper TDT (Token-and-Duration Transducer): https://arxiv.org/abs/2304.06795
- Paper FastConformer: https://arxiv.org/abs/2305.05084
- Paper Parakeet: https://arxiv.org/abs/2509.14128
- Paper sobre evaluacion ASR: https://arxiv.org/abs/2505.13404
- Paper Conformer: https://arxiv.org/abs/2005.08100
- Paper SpecAugment: https://arxiv.org/abs/1904.08779
- Paper Transformer: https://arxiv.org/abs/1706.03762
- Dataset NVIDIA Granary: https://huggingface.co/datasets/nvidia/Granary
- Dataset NeMo ASR Set 3.0: https://huggingface.co/datasets/nemo/asr-set-3.0
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
