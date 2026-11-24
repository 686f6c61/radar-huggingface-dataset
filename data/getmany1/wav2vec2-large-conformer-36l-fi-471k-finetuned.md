# GetmanY1/wav2vec2-large-conformer-36l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-large-conformer-36l-fi-471k-finetuned` es un sistema de reconocimiento automático del habla (ASR) para finlandés, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad de Aalto. Se trata de un wav2vec 2.0 Large con encoder Conformer de 36 capas, preentrenado de forma autosupervisada sobre 471.000 horas de audio finlandés y posteriormente ajustado con CTC para transcripción. Forma parte de la familia de modelos publicada junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

La relevancia del modelo reside en su escala de preentrenamiento: 471.000 horas de audio en un único idioma, extraídas de 2,1 millones de horas de emisiones de radio y televisión mediante detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR. Con 317 millones de parámetros, compite con arquitecturas Transformer y E-Branchformer del mismo tamaño, y su encoder Conformer captura dependencias locales y globales de forma más eficiente que el Transformer estándar.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y código de modelado personalizado que reproduce el encoder de fairseq, por lo que requiere `trust_remote_code=True` en su carga con Transformers. Está pensado para transcripción de audio a 16 kHz mono en finlandés, incluyendo habla espontánea, parlamentaria y emisiones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Large con encoder Conformer (36 capas, dimensión de modelo 640, dimensión feed-forward 2048) |
| Parametros totales | 315.917.858 (317,1 M según la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de audio; entrada a 16 kHz mono, sin ventana de contexto declarada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,5 GB); incluye checkpoint original de fairseq en `fairseq/checkpoint.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 pero sustituye el encoder Transformer por un Conformer de 36 capas con dimensión de modelo 640 y dimensión feed-forward 2048. El preentrenamiento autosupervisado se realizó sobre 471.000 horas de audio finlandés procedente del Archivo de Radio y Televisión de la Agencia Finlandesa de Arte y Cultura, KUVI (antiguo Instituto Audiovisual Nacional, KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Las 2,1 millones de horas de audio bruto pasaron por detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR con umbral τ = −0,10.

El preentrenamiento se extendió durante 167.000 actualizaciones con una tasa de aprendizaje de 4e-4, procesando unos 2 minutos de audio por GPU en 512 GPUs. El ajuste fino se realizó con CTC sobre 4.600 horas de habla transcrita (Parlamento finlandés y Lahjoita puhetta) durante 25.000 actualizaciones, con el codificador convolucional de características congelado, en 128 GPUs. La entrada es audio mono a 16 kHz con `do_normalize=True`. El modelo usa código de modelado personalizado para reproducir el encoder de fairseq.

## Capacidades

- Reconocimiento automático del habla (ASR) en finlandés mediante decodificación CTC.
- Transcripción de audio mono a 16 kHz, con normalización de entrada.
- Manejo de habla espontánea, parlamentaria, de corpus y de emisiones reales de radio y televisión.
- Preentrenamiento autosupervisado que permite extracción de representaciones acústicas (el checkpoint base está disponible por separado).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acústico.
- No tiene capacidades de visión, audio generativo ni modo de razonamiento (thinking mode).
- Capacidad multilingüe limitada al finlandés; no se declaran otros idiomas.

## Casos de uso

- Transcripción de emisiones de radio y televisión: el modelo fue entrenado y evaluado sobre el corpus KAVI de habla real de radiodifusión, por lo que es adecuado para generar subtítulos y archivos buscables de contenido audiovisual finlandés.
- Documentación del Parlamento finlandés: dado su ajuste fino sobre el corpus parlamentario, puede transcribir sesiones y debates para su publicación en actas y archivos públicos.
- Subtitulado automático de vídeo: integrado en un pipeline con extracción de audio a 16 kHz mono, genera transcripciones que después se alinean temporalmente para subtítulos.
- Archivística y preservación digital: permite indexar y hacer buscables grandes colecciones de audio histórico en finlandés, como las del archivo KUVI.
- Investigación en tecnología del habla: sirve como línea base de 317 M de parámetros para comparar arquitecturas (Transformer, Conformer, E-Branchformer) en finlandés, con resultados reproducibles del artículo.
- Extracción de características acústicas: el checkpoint base preentrenado puede usarse para tareas descendentes como clasificación de habla, diarización o reconocimiento de emociones, con ajuste fino posterior.
- Sistemas de accesibilidad: transcripción en tiempo casi real de audio finlandés para personas con discapacidad auditiva, sujeto a los requisitos de latencia del despliegue.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos Large ajustados (Tabla III del artículo), con recuento de parámetros equiparable. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla real de radiodifusión. En negrita, los mejores resultados a esta escala.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 24 capas (línea base previa, 158K horas) | 317,4M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer, 24 capas | 317,4M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| Conformer, 24 capas | 317,2M | 16,46 | 8,58 | **6,71** | 4,52 | 9,69 | **19,86** |
| **Conformer, 36 capas (este modelo)** | 317,1M | 16,36 | 8,16 | 6,81 | **4,28** | 9,43 | 21,02 |
| E-Branchformer, 24 capas | 317,1M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| E-Branchformer, 36 capas | 317,4M | **16,11** | **8,15** | 6,88 | 5,24 | **9,30** | 20,09 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 317 M de parámetros (unos 1,27 GB en fp32 y unos 0,63 GB en fp16). Con activaciones y buffers de audio, cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; para producción en lote, A100, H100 o L40S ofrecen mayor throughput. Una RTX 4090 o RTX 3090 es sobrada para inferencia interactiva.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: Transformers con `AutoModelForCTC` y `trust_remote_code=True` (requerido por el código de modelado personalizado); también es posible cargar el checkpoint original de fairseq con el fork del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo acústico de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | WER CV 16.1 | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Conformer 36 capas (este modelo) | 317,1M | Audio 16 kHz mono | 4,28 | 9,43 | Apache 2.0 | Hugging Face |
| Conformer 24 capas | 317,2M | Audio 16 kHz mono | 4,52 | 9,69 | Apache 2.0 | Hugging Face (familia del artículo) |
| E-Branchformer 36 capas | 317,4M | Audio 16 kHz mono | 5,24 | 9,30 | Apache 2.0 | Hugging Face (familia del artículo) |
| Transformer 24 capas (línea base previa) | 317,4M | Audio 16 kHz mono | 5,86 | 10,69 | Apache 2.0 | Hugging Face (familia del artículo) |

## Limitaciones y advertencias

- El modelo solo soporta finlandés; no se declaran capacidades multilingües.
- Es un modelo puramente acústico: no genera texto libre, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinación en la transcripción: como todo sistema CTC, puede producir salidas incorrectas en audio con ruido, acentos no representados o solapamiento de hablantes.
- Los sesgos del corpus de entrenamiento (radio, televisión, parlamento y corpus donados) pueden trasladarse a la transcripción; no se documentan análisis de sesgo por género, edad o dialecto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar el código antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni se documentan restricciones adicionales.
- No se han publicado datos de latencia, throughput ni requisitos de cuantización en la información disponible.
- El modelo se creó en noviembre de 2026 según los metadatos del repositorio; verificar la vigencia del checkpoint y del código asociado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-conformer-36l-fi-471k-finetuned
- Modelo base preentrenado: https://huggingface.co/GetmanY1/wav2vec2-large-conformer-36l-fi-471k
- Artículo: https://arxiv.org/abs/2610.13102
- Repositorio de código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil de Hugging Face del autor: https://huggingface.co/GetmanY1
- Perfil de LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Hugging Face de Tamas Grosz: https://huggingface.co/Grosy
- Perfil de LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
