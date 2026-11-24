# GetmanY1/wav2vec2-large-conformer-24l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-large-conformer-24l-fi-471k-finetuned` es un sistema de reconocimiento automático del habla (ASR) para finlandés desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad de Aalto. Se trata de un wav2vec 2.0 Large con encoder Conformer de 24 capas y 317 millones de parámetros, preentrenado de forma autosupervisada sobre 471.000 horas de audio finlandés y posteriormente ajustado con CTC sobre 4.600 horas de habla transcrita. Forma parte de la familia de modelos publicada junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

El modelo resuelve el problema de la transcripción de habla finlandesa en dominios diversos, incluyendo audio de radiodifusión real, discursos parlamentarios y corpus de voz abiertos. Su relevancia radica en que demuestra que un modelo monolingüe de escala media, entrenado con un volumen masivo de audio sin etiquetar y filtrado por confianza, puede superar a arquitecturas Transformer previas en condiciones reales de emisión (WER del 19,86 % en KAVI frente al 23,60 % del baseline Transformer de 158.000 horas).

La arquitectura combina el preentrenamiento autosupervisado de wav2vec 2.0 con un encoder Conformer que integra convoluciones y autoatención, lo que mejora la captura de dependencias locales y globales en la señal de audio. El modelo se distribuye bajo licencia Apache 2.0 y requiere `trust_remote_code=True` para cargar el código de modelado personalizado que reproduce el encoder de fairseq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder Conformer (24 capas, dimensión de modelo 768, dimensión feed-forward 2608) |
| Parametros totales | 315.984.034 (317,2 M según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; sin límite de contexto declarado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint original fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura wav2vec 2.0, que combina un encoder convolucional de características con un transformer de contexto entrenado de forma autosupervisada mediante enmascaramiento y contraste. En este caso, el encoder de contexto es un Conformer de 24 capas con dimensión de modelo 768 y dimensión feed-forward 2608, lo que le permite modelar simultáneamente patrones locales (convoluciones) y dependencias de largo alcance (autoatención). El preentrenamiento se realizó durante 167.000 actualizaciones con una tasa de aprendizaje de 4e-4, procesando aproximadamente 2 minutos de audio por GPU en 512 GPUs.

Los datos de preentrenamiento provienen de 471.000 horas de habla finlandesa: el archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, anteriormente KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Las 2,1 millones de horas de audio de radiodifusión original pasaron por detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR (τ = −0,10). El ajuste fino se realizó con CTC sobre 4.600 horas de habla transcrita (Parlamento finlandés y Lahjoita puhetta) durante 25.000 actualizaciones, con el encoder convolucional de características congelado, usando 128 GPUs.

## Capacidades

- Reconocimiento automático del habla (ASR) para finlandés con salida a nivel de carácter mediante CTC.
- Transcripción de audio mono a 16 kHz con normalización de entrada (`do_normalize=True`).
- Manejo de habla espontánea y de dominio público (parlamento, radio, podcast) gracias al entrenamiento con audio de radiodifusión real.
- Robustez ante condiciones acústicas variadas, incluyendo emisiones de televisión y radio (evaluado en el conjunto KAVI).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-a-texto.
- Capacidad multilingüe limitada al finlandés; no se documentan otros idiomas.
- No dispone de modo thinking, visión, audio de salida ni capacidades de agente.

## Casos de uso

- Transcripción de archivos de radiodifusión: el modelo puede procesar audio de televisión y radio finlandesa con un WER del 19,86 % en el conjunto KAVI, adecuado para digitalización y búsqueda de archivos históricos de la Agencia Finlandesa de Arte y Cultura.
- Subtitulado automático de contenido audiovisual: con un WER del 4,52 % en Common Voice 16.1 y del 9,69 % en FLEURS, es viable para generar subtítulos en finlandés en plataformas de vídeo, con revisión humana posterior.
- Transcripción de sesiones parlamentarias: entrenado específicamente con el corpus del Parlamento finlandés (WER del 8,58 % en FP'16 y 6,71 % en FP'20), puede usarse para actas automáticas y búsqueda en debates políticos.
- Investigación lingüística y corpus orales: permite transcribir grandes volúmenes de habla finlandesa para estudios sociolingüísticos, análisis de discurso o construcción de corpus anotados.
- Asistentes de voz para finlandés: integrable en pipelines de ASR para interfaces de voz en finlandés, aunque su naturaleza no conversacional requiere un componente adicional de comprensión del lenguaje.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real de contenido en finlandés, aprovechando su rendimiento en habla espontánea y de dominio público.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones para análisis de calidad y minería de texto en empresas finlandesas, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Benchmarks y rendimiento

Resultados de WER (%) del artículo (Tabla III), con recuentos de parámetros equiparables. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla de radiodifusión real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 24 capas (baseline previo, 158K horas) | 317,4M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer, 24 capas | 317,4M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| **Conformer, 24 capas (este modelo)** | 317,2M | 16,46 | 8,58 | **6,71** | 4,52 | 9,69 | **19,86** |
| Conformer, 36 capas | 317,1M | 16,36 | 8,16 | 6,81 | **4,28** | 9,43 | 21,02 |
| E-Branchformer, 24 capas | 317,1M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| E-Branchformer, 36 capas | 317,4M | **16,11** | **8,15** | 6,88 | 5,24 | **9,30** | 20,09 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (317 M parámetros × 4 bytes), más overhead de activaciones y del procesador; en la práctica, 2-3 GB son suficientes.
- En FP16/BF16: alrededor de 0,65 GB para pesos, con un consumo total típico inferior a 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para audio corto, aunque con mayor latencia.
- Cabe holgadamente en GPUs consumer, incluidas las de gama baja con 6-8 GB de VRAM.
- Opciones de despliegue: transformers con `AutoModelForCTC` y `trust_remote_code=True`; también es posible exportar a ONNX o usar fairseq con el checkpoint original. No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje, no a ASR CTC).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER KAVI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conformer 24 capas (este modelo) | 317,2M | audio 16 kHz mono | 19,86 % | Apache 2.0 | Hugging Face |
| Conformer 36 capas (misma familia) | 317,1M | audio 16 kHz mono | 21,02 % | Apache 2.0 | Hugging Face (familia) |
| E-Branchformer 24 capas (misma familia) | 317,1M | audio 16 kHz mono | 20,01 % | Apache 2.0 | Hugging Face (familia) |
| Transformer 24 capas (baseline previo, 158K horas) | 317,4M | audio 16 kHz mono | 23,60 % | no disponible | no disponible |

No se dispone de información sobre modelos ASR finlandeses de otros autores (por ejemplo, modelos de la familia Wav2Vec2 de Facebook o de otros grupos) en la documentación proporcionada, por lo que la comparativa se limita a las variantes de la misma familia publicadas en el artículo.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en finlandés; no es adecuado para otros idiomas sin un ajuste fino adicional.
- No se documentan análisis de sesgos demográficos, acento o género; el entrenamiento con audio de radiodifusión y parlamento puede sobrerrepresentar determinados registros y variedades del finlandés.
- Riesgo de alucinación en ASR: como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en segmentos con ruido, solapamiento de habla o audio de baja calidad.
- Requiere `trust_remote_code=True` para cargar el código de modelado personalizado, lo que implica ejecutar código del autor del modelo; conviene revisar el código antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero no se ofrece garantía alguna sobre el rendimiento en dominios no evaluados.
- El modelo no incluye puntuación ni capitalización explícitas más allá de lo aprendido en los datos de ajuste fino; para texto formateado puede requerirse un componente de postprocesado.
- No se documentan límites de longitud de audio; en la práctica, la memoria y el tiempo de inferencia crecen con la duración de la entrada, por lo que audios muy largos deben segmentarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-conformer-24l-fi-471k-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-large-conformer-24l-fi-471k
- Artículo: https://arxiv.org/abs/2610.13102
- Repositorio de código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq: https://github.com/Getmany1/fairseq
- Perfil de Yaroslav Getman: https://huggingface.co/GetmanY1
- Perfil de LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Tamas Grosz: https://huggingface.co/Grosy
- Perfil de LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
