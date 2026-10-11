# areffarhadi/Taraneh-WBase

## Resumen

Taraneh-WBase es un modelo de reconocimiento automatico del habla (ASR) para persa, desarrollado por Aref Farhadipour (Universidad de Zurich) y publicado por el usuario areffarhadi en HuggingFace. Se trata del checkpoint de tamano *base* de la familia Taraneh, un conjunto de modelos ASR en persa afinados sobre aproximadamente 1.560 horas de audio a partir de `openai/whisper-base`. Cuenta con 72.593.920 parametros (72,6 M) y un repositorio de 0,3 GB en formato safetensors.

El modelo resuelve la transcripcion de voz en persa en dominios que van mas alla del habla leida, incluyendo musica cantada, contenido de YouTube, medios de comunicacion y conversacion espontanea. La familia Taraneh se presenta explicitamente como un esfuerzo por escalar el reconocimiento de voz en persa y el *forced alignment* a traves de dominios cantados y conversacionales, con una normalizacion de texto persa unificada aplicada antes del calculo de metricas.

Su relevancia actual radica en dos factores. Por un lado, la licencia MIT permite uso comercial sin restricciones, incluidos productos y servicios alojados, algo poco frecuente en modelos ASR de nicho linguistico. Por otro, el tamano base (72,6 M de parametros) lo hace desplegable en CPU y en hardware muy modesto, con CTranslate2 como ruta de inferencia rapida recomendada por el autor. El checkpoint no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (heredada de `openai/whisper-base`) |
| Parametros totales | 72.593.920 (72,6 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (formato estandar de Whisper, heredado del modelo base); no se documenta configuracion alternativa en la model card |
| Tipos de cuantizacion | no disponibles en la model card; el autor recomienda CTranslate2 como via rapida de inferencia |
| Idiomas soportados | persa (fa) |
| Licencia | MIT (la misma que OpenAI Whisper) |
| Formato de pesos | safetensors (uso con Transformers); CTranslate2 para inferencia optimizada |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-base`, un transformer encoder-decoder especializado en ASR entrenado con espectrogramas mel logaritmicos y decodificacion autoregresiva de tokens de texto. El *fine-tuning* de Taraneh-WBase se realizo sobre aproximadamente 1.560 horas de voz en persa, segun la model card. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste por preferencias (RLHF o DPO).

La innovacion metodologica que acompania al modelo es la definicion de una normalizacion de texto persa unificada, aplicada de forma consistente antes de calcular las tasas de error. Esta normalizacion es la que permite comparar de forma homogenea los resultados entre dominios muy distintos (habla leida, YouTube, musica cantada, medios) y entre los cinco checkpoints de la familia Taraneh. El autor documenta el codigo, los manifiestos de datos, la normalizacion y los scripts de inferencia en un repositorio publico de GitHub, y remite a un articulo academico para la comparativa completa de la familia.

Un detalle relevante de evaluacion: los conjuntos PSRB y VisualEars se describen como no vistos durante el entrenamiento, por lo que sus resultados funcionan como medida de generalizacion fuera de dominio.

## Capacidades

- Transcripcion de voz en persa (ASR) con salida de texto.
- *Forced alignment* (alineacion forzada) entre audio y transcripcion, segun el titulo y el alcance declarado del articulo.
- Reconocimiento robusto en dominios no leidos: musica cantada, YouTube, medios de comunicacion y conversacion.
- Manejo de audio con la normalizacion de texto persa unificada definida por el autor, lo que facilita la comparabilidad de salidas.
- Ejecucion via Transformers (`WhisperForConditionalGeneration`) y via CTranslate2 para inferencia acelerada.
- No se documenta soporte de *tool calling*, *function calling*, capacidades de agente, vision, audio adicional ni modo de razonamiento explicito (*thinking mode*).
- Capacidad multilingue: no documentada; el modelo declara unicamente el persa (`fa`).

## Casos de uso

- Transcripcion de archivos de audio y video en persa: el modelo convierte voz a texto con una ventana de 30 segundos por segmento, adecuada para procesar podcasts, entrevistas y videos de forma por lotes con CTranslate2 o Transformers.
- Subtitulado automatizado de contenido en YouTube: dado su rendimiento medido en el dominio YouTube (19,02 % WER / 10,30 % CER), resulta apropiado para generar subtitulos en persa de creadores de contenido, encadenando segmentacion de audio y normalizacion de texto.
- Analisis de medios de comunicacion: con 24,43 % WER en el dominio de medios, puede emplearse para indexar y buscar en archivos de television o radio en persa, alimentando motores de busqueda o resumentes sobre la transcripcion.
- Transcripcion de contenido musical cantado en persa: aunque el error es mas alto (37,69 % WER), es uno de los dominios explicitamente cubiertos por el entrenamiento, util para archivos de letras, catalogacion musical o busqueda por fragmento cantado.
- Alineacion forzada para corpus lingüisticos: el modelo encaja en la construccion de corpus anotados a nivel de palabra o fonema en persa, un paso previo habitual en investigacion en fonetica y en entrenamiento de modelos de sintesis de voz.
- Investigacion en ASR de bajos recursos: al ser un checkpoint de 72,6 M de parametros con licencia MIT, sirve como punto de partida reproducible para experimentos academicos de *fine-tuning*, ablaciones de normalizacion de texto y comparaciones entre tamanos.
- Despliegue en dispositivos con recursos limitados: por su tamano, puede ejecutarse en CPU de portatiles o servidores pequeños dentro de un servicio de transcripcion bajo demanda, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Resultados en porcentaje de tasa de error de palabra (WER) y tasa de error de caracter (CER) tras la normalizacion unificada de texto persa. PSRB y VisualEars no se vieron durante el entrenamiento.

| Conjunto | WER / CER (%) |
|---|---|
| FLEURS | 7,88 / 2,93 |
| Common Voice | 10,76 / 4,45 |
| YouTube | 19,02 / 10,30 |
| Music | 37,69 / 17,67 |
| Media | 24,43 / 13,46 |
| PSRB (no visto) | 26,88 / 12,26 |
| VisualEars (no visto) | 11,58 / 3,97 |

La comparativa completa de los cinco modelos de la familia Taraneh se encuentra en el articulo y en el README del repositorio de GitHub; esos datos no se incluyen en la informacion disponible para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,29 GB en fp32, 0,15 GB en fp16 y 0,07 GB en int8 solo para los pesos. Con activaciones y memoria del runtime, el consumo real se mantiene por debajo de 1 GB en la mayoria de configuraciones (estimacion derivada del numero de parametros, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es mas que suficiente. Una RTX 3060, RTX 4060 o RTX 4090 ejecutarian el modelo con un uso de VRAM marginal; una GTX 1050 Ti o similar tambien seria suficiente. Las A100 y H100 estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con mas de 1 GB de VRAM, y tambien en CPU sin acelerador dedicado.
- Opciones de despliegue: Transformers (`WhisperForConditionalGeneration`) para uso directo, y CTranslate2 como via rapida recomendada por el autor. No se mencionan integraciones con vLLM, TGI, Ollama o llama.cpp en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER FLEURS (persa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taraneh-WBase | 72,6 M | 30 s por ventana | 7,88 % | MIT | HuggingFace (areffarhadi/Taraneh-WBase) |
| openai/whisper-base | 72,6 M aprox. | 30 s por ventana | no disponible en la informacion proporcionada | MIT | HuggingFace (openai/whisper-base) |
| Otros checkpoints de la familia Taraneh | no disponible | no disponible | no disponible | no disponible | Citados en el articulo y el repositorio del autor |

La model card indica que la familia Taraneh consta de cinco modelos y que la comparativa completa esta en el articulo y en el README de GitHub, pero los datos concretos de los otros cuatro checkpoints no forman parte de la informacion disponible para esta ficha, por lo que no se pueden reproducir aqui.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. Al estar afinado sobre un corpus persa de unos 1.560 horas, su comportamiento fuera de la variedad y los dominios cubiertos por ese corpus no esta caracterizado.
- Riesgo de alucinacion: inherente a los modelos de tipo Whisper; en audio con ruido, musica o habla solapada puede generar texto plausible pero incorrecto. Los resultados en el dominio musical (37,69 % WER) indican que este riesgo es elevado precisamente en ese escenario.
- Limitaciones de idioma: el modelo declara unicamente persa (`fa`). No se documenta soporte multilingue ni comportamiento en otras lenguas.
- Limitaciones de contexto: ventana de 30 segundos por segmento heredada de Whisper, lo que obliga a segmentar audios largos y puede introducir errores en las fronteras entre segmentos.
- Restricciones de licencia: la licencia MIT permite uso comercial, incluida la explotacion en productos y servicios alojados, siempre que se conserven tanto el aviso MIT del propio modelo como el aviso MIT original de OpenAI Whisper junto con los pesos.
- Caveats para produccion: el checkpoint figura con 0 descargas y 0 *likes* en el momento de la consulta y esta fechado en 2026, por lo que no existe un historial publico de uso en produccion. No se publican mediciones de latencia ni de throughput que permitan dimensionar un despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/areffarhadi/Taraneh-WBase
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio de codigo, manifiestos, normalizacion e inferencia: https://github.com/areffarhadi/persian-asr
- PDF del articulo (Aref Farhadipour, *Taraneh-ASR: Scaling Persian Speech Recognition and Forced Alignment Across Singing and Conversational Domains*, Universidad de Zurich): https://github.com/areffarhadi/persian-asr/blob/main/ArefFarhadi-TaranehASR.pdf
