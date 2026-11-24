# GetmanY1/wav2vec2-base-conformer-17l-fi-471k

## Resumen

wav2vec2-base-conformer-17l-fi-471k es un modelo de representación auto-supervisada del habla (speech SSL) para finlandés, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad Aalto, en el marco del trabajo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". Se trata de un encoder Conformer de 17 capas con dimensión de modelo 512 y dimensión feed-forward 1536, que totaliza 96,2 millones de parámetros, preentrenado sobre 471.000 horas de audio en finlandés.

El modelo no es un sistema ASR listo para usar: es un extractor de características (feature-extraction) que produce representaciones latentes del audio de 16 kHz y que debe fine-tunearse con datos transcritos para tareas de reconocimiento. Su relevancia radica en que demuestra que, a igualdad de presupuesto de parámetros (~96M), una arquitectura Conformer supera a los Transformers estándar de wav2vec 2.0 en WER sobre múltiples dominios del finlandés, incluyendo habla broadcast real (KAVI) y Common Voice.

El checkpoint se publica con licencia Apache 2.0, requiere `trust_remote_code=True` porque reproduce el encoder de fairseq con código de modelado personalizado, y se acompaña de una variante fine-tuneada para ASR y del checkpoint original de fairseq. Es un recurso orientado a investigadores que trabajan en modelos fundacionales del habla para idiomas de bajos recursos y en análisis arquitectónicos a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder), 17 capas, dim. de modelo 512, dim. feed-forward 1536 |
| Parametros totales | 96.205.952 (96,2M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; sin ventana declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB) y checkpoint original fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El encoder es un Conformer de 17 capas con dimensión de modelo 512 y dimensión feed-forward 1536, es decir, una combinación de autoatención y convoluciones que sustituye al Transformer estándar de wav2vec 2.0. El preentrenamiento es auto-supervisado (wav2vec 2.0) y se ejecutó durante 125.000 actualizaciones con una tasa de aprendizaje de 6e-4, procesando aproximadamente 3 minutos de audio por GPU en un clúster de 512 GPU. La entrada es audio mono a 16 kHz con `do_normalize=False`.

Los datos de preentrenamiento suman 471.000 horas de habla finlandesa: el archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Sobre las 2,1 millones de horas de audio broadcast en bruto se aplicó detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR con umbral τ = −0,10. El modelo no incluye tokenizador ni cabeza CTC; el código y las configuraciones están publicados en el repositorio `aalto-speech/large-scale-monolingual-speech-foundation-models`.

## Capacidades

- Extracción de representaciones latentes del habla finlandesa a partir de audio mono de 16 kHz.
- Base para fine-tuning supervisado en reconocimiento automático del habla (ASR) con CTC o atención.
- Base para fine-tuning en otras tareas de habla: identificación de idioma, clasificación de emociones, diarización o keyword spotting, previo entrenamiento con datos etiquetados.
- Modelado auto-supervisado del habla (wav2vec 2.0) entrenado específicamente para finlandés.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un encoder de audio, no un modelo generativo de texto.
- No tiene capacidades de visión, audio-a-texto directo ni modo "thinking".
- Capacidad multilingüe: no disponible; solo finlandés.

## Casos de uso

- Investigación en modelos fundacionales del habla para finlandés: punto de partida para estudiar el efecto de la arquitectura Conformer frente a Transformer en wav2vec 2.0 a escala de ~96M de parámetros.
- Fine-tuning para ASR finlandés en dominios específicos: partiendo de este checkpoint y de transcripciones del dominio objetivo (por ejemplo, llamadas de atención al cliente o audio médico) se obtiene un reconocedor especializado con menos datos que entrenando desde cero.
- Reconocimiento de habla broadcast: el modelo está preentrenado con audio de radio y televisión y muestra mejor WER en el conjunto KAVI, por lo que es adecuado como base para transcripción de archivos audiovisuales.
- Extracción de embeddings para clasificación de audio: las representaciones del encoder pueden alimentar clasificadores ligeros de idioma, género del hablante o tipo de programa.
- Evaluación comparativa de arquitecturas SSL: sirve como baseline reproducible en estudios que comparen Conformer, E-Branchformer y Transformer con el mismo número de parámetros.
- Investigación en filtrado de datos a escala: el modelo documenta el pipeline de VAD, deduplicación y filtrado por confianza ASR, reutilizable para construir corpus de habla en otros idiomas de bajos recursos.
- Preentrenamiento continuo o adaptación de dominio: al ser un checkpoint intermedio de wav2vec 2.0, permite continuar el preentrenamiento con audio no etiquetado adicional del dominio objetivo.

## Benchmarks y rendimiento

Resultados de WER (%) de los modelos Base fine-tuneados, con recuento de parámetros equiparable (tabla III del paper). LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla broadcast real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 12 capas (baseline previo, 158K horas) | 95,0M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer, 12 capas | 95,0M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer, 18 capas | 95,1M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer, 12 capas | 96,7M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| **Conformer, 17 capas (este modelo)** | 96,5M | **18,50** | 9,83 | 7,94 | **5,69** | **10,56** | 22,71 |
| E-Branchformer, 12 capas | 98,4M | 19,14 | 10,10 | **7,80** | 6,91 | 11,53 | 22,89 |
| E-Branchformer, 17 capas | 96,6M | 18,80 | **9,54** | 7,85 | 6,19 | 11,09 | **22,44** |

El Conformer de 17 capas obtiene el mejor WER en LP (18,50), Common Voice (5,69) y FLEURS (10,56), y queda segundo en FP'16, FP'20 y KAVI por detrás del E-Branchformer de 17 capas. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 96,2M de parámetros; en fp32 ocupa unos 0,38 GB de pesos y en fp16 unos 0,19 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM libre, incluyendo iGPU modernas.
- GPU recomendadas: para fine-tuning, GPU con al menos 16 GB (RTX 4090, A100 40 GB, H100); el preentrenamiento original se ejecutó en 512 GPU con unos 3 minutos de audio por GPU.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares para inferencia; para fine-tuning se recomienda 16 GB o más.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True`; el checkpoint fairseq original requiere el fork `Getmany1/fairseq`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un encoder de audio.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | WER CV (fine-tuned) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Conformer 17L fi (este modelo)** | 96,5M | audio 16 kHz mono | 5,69 | Apache 2.0 | Hugging Face, requiere `trust_remote_code` |
| Transformer 12L fi (baseline wav2vec 2.0) | 95,0M | audio 16 kHz mono | 9,74 | no disponible en la información | Hugging Face |
| E-Branchformer 17L fi | 96,6M | audio 16 kHz mono | 6,19 | no disponible en la información | Hugging Face |
| Conformer 12L fi | 96,7M | audio 16 kHz mono | 6,46 | no disponible en la información | Hugging Face |

La comparación se limita a los modelos del mismo paper, ya que no se dispone de datos de otros checkpoints SSL finlandeses en la información proporcionada. Frente al Transformer de 12 capas, el Conformer de 17 capas reduce el WER relativo en Common Voice en torno al 42% (9,74 → 5,69) y en Lahjoita puhetta en torno al 17% (22,28 → 18,50), con solo 1,2M de parámetros adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con audio broadcast y corpus parlamentarios, puede heredar sesgos de registro, género y variedad dialectal de esas fuentes.
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera texto; el riesgo se traslada al modelo de ASR que se fine-tune sobre él.
- Limitaciones de contexto o idioma: solo finlandés; no se declara ventana de contexto ni longitud máxima de audio, por lo que en audios largos habrá que segmentar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el código de modelado personalizado (`trust_remote_code=True`) debe auditarse antes de desplegarlo en producción.
- Caveats para producción: no incluye tokenizador ni cabeza CTC, por lo que no es un ASR listo para usar; requiere fine-tuning con transcripciones. La dependencia de código remoto y del fork de fairseq añade riesgo de mantenimiento. El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-conformer-17l-fi-471k
- Variante fine-tuneada para ASR: https://huggingface.co/GetmanY1/wav2vec2-base-conformer-17l-fi-471k-finetuned
- Paper: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq: https://github.com/Getmany1/fairseq
- Perfil de Yaroslav Getman en Hugging Face: https://huggingface.co/GetmanY1
- Perfil de Yaroslav Getman en LinkedIn: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Tamás Grósz en Hugging Face: https://huggingface.co/Grosy
- Perfil de Tamás Grósz en LinkedIn: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
