# GetmanY1/wav2vec2-xlarge-48l-fi-471k-finetuned

## Resumen

wav2vec2-xlarge-48l-fi-471k-finetuned es un modelo de reconocimiento automatico del habla (ASR) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de tecnologia del habla de la Universidad Aalto (equipo que incluye a Tommi Lehtonen, Tamas Grosz y Mikko Kurimo). Se trata de un wav2vec 2.0 de tipo X-Large con encoder Transformer de 48 capas y 966 millones de parametros, preentrenado de forma autosupervisada sobre 471 000 horas de audio en finlandes y posteriormente ajustado con CTC para transcripcion.

El modelo forma parte de una familia mas amplia publicada junto al articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que explora el preentrenamiento a gran escala sobre audio de radiodifusion en bruto. La relevancia actual reside en que demuestra que un preentrenamiento masivo y un filtrado por confianza del ASR permiten obtener un modelo monoingue con un WER competitivo (19,54 % en el conjunto KAVI de habla de radiodifusion real) frente a arquitecturas mas modernas como Conformer o E-Branchformer con el mismo numero de parametros.

El modelo esta pensado exclusivamente para finlandes, se distribuye bajo licencia Apache 2.0 y esta disponible en formato safetensors para la libreria transformers, ademas de un checkpoint original en fairseq. No es un modelo generativo de texto: su unica tarea es convertir audio de 16 kHz en transcripciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder Transformer (48 capas) y encoder CNN de features |
| Parametros totales | 962 540 962 (966 M segun la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa audio de 16 kHz; sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema wav2vec 2.0: un encoder convolucional que transforma la forma de onda de 16 kHz en representaciones latentes, seguido de un encoder Transformer de 48 capas con dimension de modelo 1280 y dimension feed-forward 5120, que suma 966 M de parametros. El preentrenamiento es autosupervisado (objetivo wav2vec 2.0 con enmascaramiento contrastivo) durante 400 000 actualizaciones con learning rate 1e-4 y aproximadamente un minuto de audio por GPU en 512 GPUs.

Los datos de preentrenamiento son 471 000 horas de habla en finlandes procedentes del Archivo de Radio y Television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. El pipeline de datos parte de 2,1 millones de horas de audio de radiodifusion en bruto y aplica deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza del ASR con umbral tau = -0,10. El ajuste fino se realiza con CTC sobre 4600 horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 40 000 actualizaciones en 128 GPUs, con el encoder CNN de features congelado. La innovacion destacable es el filtrado por confianza del ASR como criterio de seleccion de datos a escala de millones de horas, junto con el analisis arquitectonico comparado entre Transformer, Conformer y E-Branchformer a igualdad de parametros.

## Capacidades

- Reconocimiento automatico del habla (ASR) en finlandes sobre audio mono de 16 kHz.
- Transcripcion con decodificacion CTC (greedy o con modelo de lenguaje externo, no incluido).
- Procesamiento de audio de radiodifusion real, con ruido y variabilidad de hablantes (evaluado en el conjunto KAVI).
- Manejo de habla parlamentaria y de corpus conversacionales (Lahjoita puhetta).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio de entrada mas alla de la transcripcion, ni modo thinking.
- Capacidad multilingue limitada al finlandes.

## Casos de uso

- Transcripcion de archivos audiovisuales de radiodifusion: el modelo esta entrenado y evaluado sobre habla de radio y television real (conjunto KAVI, WER 19,54 %), por lo que es adecuado para digitalizar y transcribir fondos de archivo de emisoras finlandesas.
- Subtitulado automatico de contenido en finlandes: dado su rendimiento en Common Voice (3,85 % de WER) y FLEURS (9,37 %), puede generar subtitulos para videos con habla relativamente limpia y servir como base para revision humana.
- Actas y transcripcion de sesiones parlamentarias: el ajuste fino incluye el corpus del Parlamento finlandes (WER 6,26 % en FP'20), lo que lo hace apropiado para transcripcion de debates legislativos.
- Investigacion en tecnologias del habla: sirve como modelo de referencia monoingue a gran escala para comparar arquitecturas (Transformer, Conformer, E-Branchformer) y estrategias de filtrado de datos.
- Generacion de datos etiquetados a gran escala: puede transcribir grandes volumenes de audio en finlandes para construir corpus de entrenamiento para otros modelos (destilacion o pseudoetiquetado).
- Sistemas de accesibilidad: transcripcion en tiempo cuasi real de reuniones o clases en finlandes, con la latencia dependiente del hardware y del tama\u00f1o del lote de audio procesado.
- Analisis de contenido y busqueda en audio: indexacion de archivos de audio por texto transcrito para busqueda semantica o recuperacion de informacion en archivos de medios.

## Benchmarks y rendimiento

Resultados de WER (%) en test para modelos ajustados de 48 capas con igual numero de parametros (Tabla III del articulo). LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = habla de radiodifusion real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer 48 capas (baseline previo, 158K horas) | 965,5 M | 16,37 | 7,81 | 6,43 | 5,42 | 9,96 | 22,42 |
| Transformer 48 capas (este modelo) | 965,5 M | 16,27 | 7,83 | 6,26 | 3,85 | 9,37 | 19,54 |
| Conformer 48 capas | 964,7 M | 17,13 | 7,78 | 6,45 | 3,68 | 9,08 | 20,75 |
| E-Branchformer 48 capas | 965,6 M | 16,74 | 7,63 | 6,38 | 4,45 | 9,13 | 19,96 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision fp32: aproximadamente 3,9 GB solo para pesos (966 M parametros), mas activaciones y buffers de audio; en la practica se recomienda al menos 6-8 GB.
- En fp16/bf16 los pesos ocupan alrededor de 1,9 GB, por lo que cabe en GPUs de consumo con 8 GB o mas.
- GPUs recomendadas: A100 o H100 para procesamiento por lotes de grandes volumenes de audio; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16 con lotes moderados.
- Cabe en GPUs de consumo: si, en modelos con 8 GB o mas de VRAM (por ejemplo RTX 3070/4060 Ti en adelante) usando fp16; en CPU es viable con llama.cpp no aplica, pero transformers en CPU funciona con latencia alta.
- Opciones de despliegue: transformers (`AutoModelForCTC` + `Wav2Vec2Processor`), fairseq para el checkpoint original, y servidores de inferencia compatibles con la API de transformers (por ejemplo TGI no soporta CTC de forma nativa; vLLM no aplica a este tipo de modelo). El tag `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER KAVI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-xlarge-48l-fi-471k-finetuned | 966 M | no disponible | 19,54 % | Apache 2.0 | Hugging Face + fairseq |
| Conformer 48 capas (misma familia) | 964,7 M | no disponible | 20,75 % | Apache 2.0 (misma familia) | Hugging Face |
| E-Branchformer 48 capas (misma familia) | 965,6 M | no disponible | 19,96 % | Apache 2.0 (misma familia) | Hugging Face |
| Transformer 48 capas baseline (158K horas) | 965,5 M | no disponible | 22,42 % | Apache 2.0 (misma familia) | Hugging Face |

La comparativa se limita a los modelos de la misma familia publicados en el articulo; no se dispone de datos de otros modelos ASR en finlandes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoingue: solo transcribe finlandes; el rendimiento en otros idiomas no esta garantizado ni evaluado.
- Riesgo de alucinacion y errores de transcripcion, especialmente en audio con ruido, solapamiento de hablantes o acentos no representados en los datos de entrenamiento (el WER en KAVI es del 19,54 %, superior al de otros dominios).
- Sesgos potenciales derivados del corpus de entrenamiento (radiodifusion publica, parlamento y Lahjoita puhetta), que puede sobrerrepresentar determinados registros y variedades del finlandes.
- No incluye modelo de lenguaje para decodificacion; el WER puede mejorar con un LM externo, pero no viene incluido.
- Requiere audio mono a 16 kHz y normalizacion (`do_normalize=True`); el preprocesado incorrecto degrada el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los corpus de origen (KUVI, VoxPopuli, Lahjoita puhetta) si se redistribuyen datos derivados.
- Sin datos publicados de cuantizacion ni de latencia, lo que dificulta planificar despliegues en produccion sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-xlarge-48l-fi-471k-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-xlarge-48l-fi-471k
- Articulo: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Perfil del autor: https://huggingface.co/GetmanY1
- Perfil de Tamas Grosz: https://huggingface.co/Grosy
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
