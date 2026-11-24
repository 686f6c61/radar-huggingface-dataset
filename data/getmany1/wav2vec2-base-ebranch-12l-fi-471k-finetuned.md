# GetmanY1/wav2vec2-base-ebranch-12l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-base-ebranch-12l-fi-471k-finetuned` es un sistema de reconocimiento automático del habla (ASR) para finlandés desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad Aalto. Se trata de un modelo wav2vec 2.0 Base cuyo codificador ha sido sustituido por un E-Branchformer de 12 capas, preentrenado de forma auto-supervisada sobre 471.000 horas de audio en finlandés y posteriormente ajustado con CTC para transcripción.

El modelo forma parte de la familia publicada junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que investiga el filtrado por confianza y el análisis arquitectónico a gran escala para modelos fundacionales monolingües de habla. Con 97,75 millones de parámetros, es un modelo compacto pensado para inferencia eficiente en producción, especialmente en dominios de habla real (retransmisiones de radio y televisión) donde otros modelos del mismo tamaño rinden peor.

Su relevancia radica en dos factores: por un lado, demuestra que una arquitectura híbrida como E-Branchformer puede igualar o superar a Conformer y Transformer con el mismo presupuesto de parámetros en finlandés; por otro, libera bajo licencia Apache 2.0 un modelo entrenado con un volumen de datos muy superior al habitual en lenguas de recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con codificador E-Branchformer (12 capas, dim. 576, FFN 1280) |
| Parametros totales | 97.751.138 (97,75 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; sin límite explícito documentado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq original (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo parte de wav2vec 2.0, cuyo codificador convolucional de características se mantiene congelado durante el ajuste fino y cuya pila de transformadores se reemplaza por un E-Branchformer de 12 capas con dimensión de modelo 576 y dimensión feed-forward 1280. El E-Branchformer combina atención global con agregación local por ramas, lo que en la literatura se ha asociado a mejor captura de dependencias locales y globales en habla. El preentrenamiento auto-supervisado se realizó durante 125.000 actualizaciones con tasa de aprendizaje 6e-4, procesando aproximadamente 3 minutos de audio por GPU en 512 GPU.

Los datos de preentrenamiento suman 471.000 horas de habla finlandesa procedentes del archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura, KUVI (antes Instituto Audiovisual Nacional, KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. El pipeline de filtrado sobre 2,1 millones de horas de audio bruto incluyó detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR con umbral τ = −0,10. El ajuste fino se hizo con CTC sobre 4.600 horas transcritas (Parlamento finlandés y Lahjoita puhetta) durante 16.000 actualizaciones, con 2,5 minutos de audio por GPU en 128 GPU y el codificador convolucional congelado.

Una particularidad técnica relevante es que el modelo utiliza código de modelado personalizado para reproducir el codificador de fairseq, por lo que debe cargarse con `trust_remote_code=True`. La entrada esperada es audio mono a 16 kHz con `do_normalize=False`.

## Capacidades

- Reconocimiento automático del habla (ASR) en finlandés con salida a nivel de carácter mediante CTC.
- Transcripción de habla espontánea y de dominio público (Parlamento, radio, televisión).
- Robustez relativamente alta en habla de retransmisión real (dominio KAVI), donde obtiene el mejor WER de su escala en la comparativa del artículo.
- Manejo de audio de entrada a 16 kHz en formato mono; procesamiento por lotes mediante `Wav2Vec2Processor`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-a-texto.
- No dispone de capacidades multimodales más allá del audio (sin visión, sin audio-texto generativo).
- Capacidad multilingüe limitada al finlandés; no se documenta entrenamiento en otras lenguas.
- Compatible con el ecosistema `transformers` (clase `AutoModelForCTC`) y con el checkpoint original en fairseq.

## Casos de uso

- Transcripción de archivos audiovisuales de radio y televisión: el modelo está entrenado específicamente sobre el dominio de retransmisión (KAVI) y obtiene 22,89 % de WER en ese conjunto, por lo que es adecuado para digitalizar y buscar en archivos históricos de la radiotelevisión finlandesa.
- Subtitulado automático de contenido en finlandés: al ser un modelo CTC compacto (98 M de parámetros), puede desplegarse en pipelines de generación de subtítulos con latencia baja y sin necesidad de GPU de gama alta.
- Análisis de sesiones parlamentarias: el ajuste fino incluye el corpus del Parlamento finlandés y obtiene 10,10 % y 7,80 % de WER en FP'16 y FP'20, lo que lo hace apto para indexar y buscar intervenciones políticas.
- Investigación en tecnologías del habla para lenguas de recursos limitados: sirve como punto de partida (modelo base `GetmanY1/wav2vec2-base-ebranch-12l-fi-471k`) para experimentos de ajuste fino con datasets pequeños en finlandés.
- Evaluación comparativa de arquitecturas: al compartir presupuesto de parámetros con los baselines Transformer y Conformer del artículo, es útil como referencia reproducible en estudios de arquitectura para ASR.
- Transcripción de corpus de habla espontánea (Lahjoita puhetta): con 19,14 % de WER en LP, es adecuado para anotar automáticamente grabaciones conversacionales y ampliar datasets etiquetados.
- Despliegue en entornos con recursos limitados: por su tamaño y licencia Apache 2.0, puede integrarse en servicios on-premise o en dispositivos con GPU modesta para transcripción de reuniones o atención al cliente en finlandés.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos Base ajustados, según la Tabla III del artículo. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla de retransmisión real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer 12 capas (baseline previo, 158K h) | 95,0 M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer 12 capas | 95,0 M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer 18 capas | 95,1 M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer 12 capas | 96,7 M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer 17 capas | 96,5 M | 18,50 | 9,83 | 7,94 | 5,69 | 10,56 | 22,71 |
| E-Branchformer 12 capas (este modelo) | 98,4 M | 19,14 | 10,10 | 7,80 | 6,91 | 11,53 | 22,89 |
| E-Branchformer 17 capas | 96,6 M | 18,80 | 9,54 | 7,85 | 6,19 | 11,09 | 22,44 |

En negrita en el artículo aparecen los mejores resultados a esta escala: Conformer 17 en LP, CV y FLEURS; E-Branchformer 17 en FP'16 y KAVI; y este E-Branchformer 12 en FP'20. El modelo aquí descrito no es el mejor en la mayoría de columnas, pero iguala o supera a los Transformer del mismo tamaño en todos los conjuntos y se acerca a los Conformer de 17 capas con menos parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (98 M de parámetros) y en torno a 0,2 GB en fp16; el repositorio ocupa 0,8 GB por incluir también el checkpoint fairseq.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes de audio conviene una GPU con más memoria, pero el modelo no requiere hardware de gama alta.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 2060, RTX 3060, RTX 4060, RTX 4090, etc.
- Opciones de despliegue: `transformers` con `AutoModelForCTC` y `trust_remote_code=True`; también puede cargarse desde el checkpoint fairseq original con el fork del autor. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (estos están orientados a modelos generativos, no a CTC).
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que el ajuste fino procesó 2,5 minutos de audio por GPU en 128 GPU durante 16.000 actualizaciones, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER KAVI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E-Branchformer 12 capas (este modelo) | 98,4 M | audio 16 kHz | 22,89 | Apache 2.0 | Hugging Face |
| Conformer 12 capas (mismo articulo) | 96,7 M | audio 16 kHz | 23,71 | no disponible en la informacion | no disponible en la informacion |
| Transformer 12 capas (mismo articulo) | 95,0 M | audio 16 kHz | 24,85 | no disponible en la informacion | no disponible en la informacion |
| E-Branchformer 17 capas (mismo articulo) | 96,6 M | audio 16 kHz | 22,44 | no disponible en la informacion | no disponible en la informacion |

La comparación se limita a los modelos del mismo artículo, ya que no se proporcionan datos de otros sistemas ASR finlandeses (como Silero o Whisper fine-tuned) en la información disponible. Frente a los baselines del artículo, este modelo ofrece el mejor WER en FP'20 y el segundo mejor en KAVI, con un coste de parámetros intermedio.

## Limitaciones y advertencias

- Modelo monolingüe: solo reconoce finlandés; no se ha entrenado ni evaluado en otras lenguas.
- Es un modelo CTC de ASR, no un modelo generativo: no admite instrucciones, tool calling ni razonamiento; su única salida es la transcripción.
- Requiere `trust_remote_code=True` por el código de modelado personalizado que reproduce el codificador de fairseq; esto implica ejecutar código del repositorio y conviene revisarlo antes de usarlo en producción.
- La entrada debe ser audio mono a 16 kHz con `do_normalize=False`; un preprocesado incorrecto degradará el WER.
- Riesgo de alucinación en el sentido de transcripciones erróneas en audio con ruido, solapamiento de hablantes o acentos no representados en el corpus de entrenamiento; no se documentan análisis de sesgo específicos.
- El WER en habla espontánea (LP, 19,14 %) es notablemente peor que en habla leída o parlamentaria, lo que limita su uso directo en conversaciones informales sin revisión.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones de los corpus de origen (KUVI, VoxPopuli, Parlamento finlandés, Lahjoita puhetta) y del código fairseq fork.
- No se publican datos de latencia, throughput ni consumo energético en producción, por lo que las estimaciones de despliegue deben validarse empíricamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente y con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-ebranch-12l-fi-471k-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-ebranch-12l-fi-471k
- Artículo: https://arxiv.org/abs/2610.13102
- Repositorio de código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil de Yaroslav Getman: https://huggingface.co/GetmanY1
- Perfil de LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Tamas Grosz: https://huggingface.co/Grosy
- Perfil de LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
