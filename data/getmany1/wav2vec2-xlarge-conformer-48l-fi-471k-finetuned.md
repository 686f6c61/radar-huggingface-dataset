# GetmanY1/wav2vec2-xlarge-conformer-48l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-xlarge-conformer-48l-fi-471k-finetuned` es un sistema de reconocimiento automático del habla (ASR) para finlandés desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad Aalto, en el marco del trabajo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". Se trata de un modelo wav2vec 2.0 X-Large con encoder Conformer de 48 capas y 965 millones de parámetros, preentrenado de forma autosupervisada sobre 471.000 horas de audio finlandés y posteriormente ajustado con CTC para transcripción.

El modelo resuelve el problema de la transcripción automática de voz en finlandés, un idioma con recursos limitados en comparación con el inglés, aprovechando audio de broadcast sin etiquetar procedente de archivos de radio y televisión. La relevancia actual radica en que demuestra que el preentrenamiento autosupervisado a gran escala con datos de broadcast masivos y filtrado por confianza permite obtener tasas de error competitivas en dominios difíciles como el habla espontánea de medios de comunicación.

La arquitectura combina el enfoque de enmascaramiento y predicción contrastiva de wav2vec 2.0 con un encoder de tipo Conformer, que integra bloques de atención y convoluciones. El modelo se distribuye bajo licencia Apache 2.0 y utiliza código de modelado personalizado para reproducir el encoder original de fairseq, por lo que requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder Conformer de 48 capas |
| Parametros totales | 962.899.106 (aproximadamente 965M segun la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de entrada; ventana de atención no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint original en fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 con un encoder Conformer en lugar del transformer estándar. El encoder tiene 48 capas, dimensión de modelo 1024 y dimensión de feed-forward 2768, sumando 965M parámetros. La entrada es audio mono a 16 kHz con normalización (`do_normalize=True`). El preentrenamiento autosupervisado se realizó durante 400.000 actualizaciones con una tasa de aprendizaje de 1e-4, procesando aproximadamente un minuto de audio por GPU en 512 GPUs.

Los datos de preentrenamiento proceden de 471.000 horas de habla finlandesa: el Archivo de Radio y Televisión de la Agencia Finlandesa de Arte y Cultura, KUVI (antiguo Instituto Audiovisual Nacional, KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Las 2,1 millones de horas de audio de broadcast originales pasaron por detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR (τ = −0,10). El ajuste fino se realizó con CTC sobre 4.600 horas de habla transcrita (Parlamento finlandés y Lahjoita puhetta) durante 45.000 actualizaciones, con el encoder convolucional de características congelado, en 128 GPUs.

## Capacidades

- Reconocimiento automático del habla en finlandés con salida a nivel de carácter (CTC).
- Transcripción de audio mono a 16 kHz con normalización de entrada.
- Manejo de habla espontánea y de broadcast (radio, televisión, parlamento) gracias al entrenamiento sobre dominios diversos.
- Robustez en condiciones de audio real de medios de comunicación (evaluado en el conjunto KAVI).
- No soporta tool calling ni function calling (es un modelo puramente ASR).
- No dispone de modo de razonamiento multi-paso ni capacidades de agente.
- Capacidad multilingüe limitada al finlandés.
- No incorpora visión, audio de salida ni otras modalidades más allá de la transcripción de voz.

## Casos de uso

- Transcripción de archivos audiovisuales de broadcast: el modelo puede procesar grabaciones de radio y televisión en finlandés y generar transcripciones, aprovechando su entrenamiento sobre 471K horas del Archivo de Radio y Televisión y su buen rendimiento en el conjunto KAVI (20,75% WER).
- Subtitulado automático de contenido parlamentario: adecuado para transcribir sesiones del Parlamento finlandés, uno de los dominios de ajuste fino, con un WER del 7,78% en FP'16 y 6,45% en FP'20.
- Investigación lingüística y corpus orales: permite generar transcripciones a gran escala de colecciones de habla finlandesa para estudios fonéticos, sociolingüísticos o de análisis del discurso.
- Sistemas de accesibilidad para personas con discapacidad auditiva: transcripción en tiempo casi real de emisiones y eventos en finlandés, con la ventaja de estar especializado en un único idioma y dominios de habla natural.
- Archivística y búsqueda en fondos audiovisuales: indexación semántica de archivos de audio finlandeses mediante transcripción previa, facilitando la recuperación de contenido por texto.
- Evaluación comparativa de arquitecturas ASR: al compartir presupuesto de parámetros con las variantes Transformer y E-Branchformer del mismo paper, sirve como referencia para estudiar el impacto del encoder Conformer en ASR de bajos recursos.
- Transcripción de habla espontánea en encuestas o entrevistas: el ajuste sobre Lahjoita puhetta (habla donada y espontánea) lo hace adecuado para material conversacional no leído.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos X-Large ajustados (Tabla III del paper), con recuento de parámetros equivalente. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla de broadcast real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 48 capas (baseline previo, 158K horas) | 965,5M | 16,37 | 7,81 | 6,43 | 5,42 | 9,96 | 22,42 |
| Transformer, 48 capas | 965,5M | **16,27** | 7,83 | **6,26** | 3,85 | 9,37 | **19,54** |
| **Conformer, 48 capas (este modelo)** | 964,7M | 17,13 | 7,78 | 6,45 | **3,68** | **9,08** | 20,75 |
| E-Branchformer, 48 capas | 965,6M | 16,74 | **7,63** | 6,38 | 4,45 | 9,13 | 19,96 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,9 GB solo para pesos (965M parámetros × 4 bytes), más activaciones y memoria del procesador de audio.
- VRAM estimada en FP16/BF16: aproximadamente 1,9 GB para pesos, más overhead de inferencia.
- GPU recomendadas: A100, H100 o V100 para procesamiento por lotes a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPUs de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM en FP16, incluyendo RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers con `AutoModelForCTC` y `trust_remote_code=True`; el checkpoint original fairseq requiere el fork del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a ASR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | WER destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conformer 48 capas (este modelo) | 964,7M | Audio 16 kHz mono | CV 3,68; FLEURS 9,08; KAVI 20,75 | Apache 2.0 | Hugging Face |
| Transformer 48 capas (mismo paper) | 965,5M | Audio 16 kHz mono | CV 3,85; FLEURS 9,37; KAVI 19,54 | Apache 2.0 | Hugging Face |
| E-Branchformer 48 capas (mismo paper) | 965,6M | Audio 16 kHz mono | CV 4,45; FLEURS 9,13; KAVI 19,96 | Apache 2.0 | Hugging Face |
| Transformer 48 capas baseline (158K horas) | 965,5M | Audio 16 kHz mono | CV 5,42; FLEURS 9,96; KAVI 22,42 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en finlandés; no transcribe otros idiomas.
- Requiere `trust_remote_code=True` para cargarse en transformers, ya que usa código de modelado personalizado que reproduce el encoder de fairseq; esto implica ejecutar código del repositorio y debe revisarse en entornos de producción.
- El ajuste fino se realizó sobre dominios concretos (Parlamento finlandés y Lahjoita puhetta), lo que puede introducir sesgo hacia el habla formal o de estudio y degradar el rendimiento en acentos regionales, habla infantil o audio con ruido extremo.
- Riesgo de alucinación en la transcripción: como todo modelo CTC, puede producir caracteres o palabras incorrectas en segmentos de audio ambiguo o silencioso; se recomienda validación humana en aplicaciones críticas.
- No se documentan sesgos demográficos específicos ni evaluaciones de equidad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas; conviene verificar los términos de los corpus de origen (KUVI, VoxPopuli, Lahjoita puhetta).
- No se especifican límites de longitud de audio por inferencia; el procesamiento de audios largos requiere segmentación manual.
- No hay información sobre cuantizaciones soportadas ni sobre rendimiento en GPUs de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-xlarge-conformer-48l-fi-471k-finetuned
- Modelo base (preentrenado): https://huggingface.co/GetmanY1/wav2vec2-xlarge-conformer-48l-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Repositorio de código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil de Hugging Face del autor: https://huggingface.co/GetmanY1
- Perfil de LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Hugging Face de Tamas Grosz: https://huggingface.co/Grosy
- Perfil de LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
