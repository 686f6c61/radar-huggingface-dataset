# alphaedge-ai/whisper-base-lao-16384

## Resumen

whisper-base-lao-16384 es una variante podada de openai/whisper-base, el modelo de reconocimiento automatico del habla (ASR) publicado por OpenAI en 2022. Lo desarrolla alphaedge-ai y aplica la tecnica de *trimming* de vocabulario descrita por Loïck Bourdois y colaboradores en el blog de Hugging Face: se conserva unicamente el subconjunto de tokens relevante para el lao (lao), reduciendo el vocabulario de 51.865 a 16.384 tokens.

El resultado es un modelo un 25,02 % mas pequeno en parametros (54.427.648 frente a 72.593.920 del original, unos 0,1 GB en safetensors) y un 68,41 % menos de entradas en el vocabulario, manteniendo la arquitectura encoder-decoder transformer de Whisper y el mismo preprocesado a 16 kHz. El objetivo es abaratar memoria y latencia en despliegues especializados en un unico idioma, a costa de perder cobertura multilingue.

Es relevante para quien necesite transcripcion de audio en lao con un footprint reducido, sobre hardware modesto o en entornos con restricciones de VRAM, y para quienes estudien el efecto del podado de vocabulario sobre modelos ASR. La licencia Apache 2.0 permite uso comercial sin regalias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, seq2seq de reconocimiento de voz) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s por segmento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (posible cuantizacion posterior via transformers/bitsandbytes) |
| Idiomas soportados | lao (lao) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder transformer que consume espectrogramas mel de audio a 16 kHz y un decoder autoregresivo que genera tokens de transcripcion, con tokens especiales de idioma y tarea. El modelo base original fue entrenado por OpenAI con supervision debil a gran escala (paper arXiv:2212.04356, "Robust Speech Recognition via Large-Scale Weak Supervision"), combinando cientos de miles de horas de audio con transcripciones ruidosas de internet.

Esta variante no reentrena el modelo: parte de los pesos de openai/whisper-base y aplica trimming de vocabulario. Para determinar que tokens conservar se usaron 200.000 textos del dataset lbourdois/fineweb-2-trimming, minados para identificar el subconjunto de vocabulario relevante para el lao. El vocabulario final queda en 16.384 tokens y el modelo pierde 18.166.272 parametros, principalmente en las matrices de embedding y en la proyeccion de salida del decoder. No se documenta RLHF, DPO ni ajuste fino adicional especifico para lao mas alla del podado.

## Capacidades

- Transcripcion de audio en lao (tarea `transcribe`) mediante pipeline `automatic-speech-recognition` de transformers.
- Traduccion de audio a texto en el flujo estandar de Whisper (tarea `translate`), aunque la cobertura efectiva queda limitada al vocabulario podado.
- Procesamiento de audio a 16 kHz con extraccion de features mel integrada (`feature_extractor`).
- Segmentacion por ventanas de 30 s, con capacidad de procesar audio largo mediante chunking en el pipeline.
- Integracion con `generate_kwargs={"language": "lao", "task": "transcribe"}` para forzar idioma y tarea.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No tiene vision ni audio generativo; solo entrada de audio y salida de texto.
- Capacidades multilingues muy limitadas: el vocabulario se recorto para el lao y el propio autor advierte que puede rendir mal en otros idiomas.

## Casos de uso

- Transcripcion de reuniones y entrevistas en lao: el modelo convierte audio de 16 kHz en texto con un footprint de unos 0,1 GB, adecuado para procesar grabaciones por lotes en servidores modestos.
- Subtitulado automatico de contenido audiovisual en lao: se puede encadenar el pipeline ASR con un segmentador temporal para generar subtitulos SRT, aproveitando la ventana de 30 s de Whisper.
- Atencion al cliente en lao: transcripcion de llamadas o notas de voz para alimentar un sistema de tickets o busqueda, con menor coste de memoria que el whisper-base completo.
- Archivado y busqueda de audio: indexar grabaciones historicas en lao convirtiendolas a texto para busqueda full-text, usando el modelo en CPU o GPU de gama baja.
- Investigacion sobre podado de vocabulario: servir como baseline para estudiar la perdida de calidad ASR al reducir el vocabulario de un modelo Whisper, comparando con openai/whisper-base.
- Despliegue en dispositivos con VRAM limitada: al tener 54,4 M parametros y pesos de ~0,1 GB, cabe en GPUs consumer antiguas o incluso en inferencia CPU con latencia aceptable para audio corto.
- Preprocesado para pipelines NLP en lao: generar transcripciones que alimenten resumen, traduccion o analisis de sentimiento en un idioma con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta las metricas estructurales del podado (vocabulario 51.865 -> 16.384 tokens, 68,41 % de reduccion; parametros 72.593.920 -> 54.427.648, 25,02 % de reduccion) y afirma que el modelo podado "deberia rendir de forma similar al original" en el idioma objetivo, sin cifras de WER, CER ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,2-0,3 GB de pesos mas activaciones y buffers de audio; en fp16 aproximadamente la mitad. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para uso basico; una RTX 3060, RTX 4090, A100 o H100 sobran para este tamano. Es perfectamente viable en CPU.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1060 en adelante), y en fp16 tambien en iGPU o NPU con soporte transformers.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y en general cualquier runtime compatible con safetensors/Whisper (por ejemplo conversion a GGUF para llama.cpp/whisper.cpp, aunque no se documenta en la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependera del hardware y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-lao-16384 | 54.427.648 | 16.384 | lao | apache-2.0 | Variante podada de whisper-base |
| openai/whisper-base | 72.593.920 | 51.865 | multilingue (99 idiomas) | apache-2.0 | Modelo original, mayor footprint |
| openai/whisper-small | no disponible en la informacion | no disponible | multilingue | apache-2.0 | Alternativa de mayor tamano de la familia Whisper |
| openai/whisper-tiny | no disponible en la informacion | no disponible | multilingue | apache-2.0 | Alternativa mas pequena de la familia Whisper |

La ventaja de esta variante frente a openai/whisper-base es el menor consumo de memoria y un vocabulario mas eficiente para lao; la desventaja es la perdida de cobertura multilingue y la ausencia de benchmarks publicados que cuantifiquen la calidad en lao.

## Limitaciones y advertencias

- El vocabulario recortado elimina tokens no usados en lao; el autor advierte explicitamente que el modelo puede rendir mal en otros idiomas.
- No hay benchmarks publicados de WER/CER en lao, por lo que la calidad real frente al original no esta cuantificada.
- Riesgo de alucinacion tipico de Whisper: en audio ruidoso, silencios largos o musica puede generar texto inventado o repetitivo.
- Sesgos inhereridos del entrenamiento original de Whisper (supervision debil, datos de internet), no mitigados en esta variante.
- Requiere audio remuestreado a 16 kHz; un preprocesado incorrecto degrada la transcripcion.
- La ventana nativa es de 30 s por segmento; audio largo necesita chunking manual o via pipeline.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de minado.
- Modelo con muy pocas descargas (60) y sin *likes*: no hay validacion comunitaria extensa de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-lao-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
