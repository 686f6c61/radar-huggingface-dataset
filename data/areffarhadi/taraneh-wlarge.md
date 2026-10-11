# areffarhadi/Taraneh-WLarge

## Resumen

Taraneh-WLarge es un modelo de reconocimiento automatico del habla (ASR) en persa, desarrollado por Aref Farhadipour (Universidad de Zurich) y publicado en HuggingFace bajo el identificador areffarhadi/Taraneh-WLarge. Se trata del miembro de mayor tamano de la familia Taraneh, un conjunto de cinco modelos ASR en persa ajustados sobre aproximadamente 1.560 horas de audio. El checkpoint parte de openai/whisper-large-v3 y hereda su arquitectura encoder-decoder de tipo transformer.

El modelo resuelve la transcripcion de voz en persa (farsi) en dominios diversos: habla espontanea, medios de comunicacion, YouTube e incluso canto, un escenario tradicionalmente dificil para los sistemas ASR. Su relevancia actual radica en que ofrece tasas de error competitivas en persa con una licencia MIT permisiva para uso comercial, algo poco frecuente en modelos ASR especializados en idiomas de recursos limitados.

La ficha tecnica del modelo indica que se carga con Transformers mediante `WhisperForConditionalGeneration` y que la ruta rapida de inferencia recomendada por el autor es CTranslate2. No se detalla en la model card el numero exacto de parametros ni la composicion completa del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), arquitectura Whisper large-v3 |
| Parametros totales | no disponible en la model card (heredados de openai/whisper-large-v3) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos por segmento (caracteristica de Whisper large-v3) |
| Tipos de cuantizacion | no especificado; CTranslate2 admite float16 e int8 como rutas rapidas |
| Idiomas soportados | persa (fa, farsi) |
| Licencia | MIT |
| Formato de pesos | pesos de Transformers (safetensors); compatible con CTranslate2 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) del checkpoint openai/whisper-large-v3, que es un transformer encoder-decoder disenado para tareas de secuencia a secuencia sobre espectrogramas mel. El encoder procesa ventanas de audio de 30 segundos y el decoder genera tokens de texto, con soporte nativo para transcripcion y marcas de tiempo. No se documenta en la model card ninguna modificacion estructural respecto al Whisper original, por lo que se asume que conserva la arquitectura y el tokenizador del modelo base.

El entrenamiento se realizo sobre aproximadamente 1.560 horas de audio en persa, segun indica la model card. La evaluacion se llevo a cabo tras aplicar una normalizacion de texto en persa unificada, y los conjuntos PSRB y VisualEars se mantuvieron fuera del entrenamiento (unseen), lo que permite valorar la capacidad de generalizacion. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en modelos ASR. La innovacion destacada por el autor es la cobertura de dominios que incluyen canto y conversacion, no una modificacion arquitectonica concreta.

## Capacidades

- Reconocimiento automatico del habla (ASR) en persa sobre audio de diversa procedencia: habla leida, conversacional, medios, YouTube y canto.
- Transcripcion con marcas de tiempo, heredada de Whisper large-v3.
- Buen rendimiento en dominios no vistos durante el entrenamiento (PSRB y VisualEars).
- Normalizacion de texto en persa unificada para el calculo de metricas, documentada en el repositorio de codigo.
- Ajuste fino adicional para forced alignment (alineacion forzada) segun el titulo del paper del autor, orientado a dominios de canto y conversacion.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning, ya que es un modelo puramente ASR.
- No se documentan capacidades multimodales mas alla del audio (sin vision, sin audio generation).

## Casos de uso

- Transcripcion de contenido audiovisual en persa: el modelo puede transcribir videos de YouTube, podcasts y programas de television, con un WER del 13,42 por ciento en el dominio YouTube segun la model card.
- Subtitulado automatico de medios de comunicacion: con un WER del 16,06 por ciento en el conjunto Media, es adecuado para generar subtitulos en flujos de postproduccion donde se tolere una tasa de error moderada y se aplique revision humana.
- Transcripcion de habla espontanea y conversacional: con un WER del 3,34 por ciento en Common Voice, resulta idoneo para actas de reuniones, notas de voz y transcripciones de entrevistas en persa.
- Reconocimiento de voz en canto (karaoke, letras): el dominio Music presenta un WER del 22,98 por ciento, util para indexacion de canciones o generacion de letras donde un error elevado sea aceptable con post-edicion.
- Benchmarking y evaluacion de ASR en persa: sirve como referencia para comparar otros sistemas sobre FLEURS, Common Voice, PSRB y VisualEars, con resultados publicados y reproducibles.
- Forced alignment para corpus linguisticos: combinado con el codigo del repositorio, permite alinear transcripciones a audio en persa, util en investigacion fonetica y creacion de datasets.
- Investigacion en ASR de bajo recurso: al ser un modelo MIT de un idioma con menos recursos, facilita experimentos academicos sobre ajuste fino y normalizacion de texto.
- Despliegue en servicios hospedados: la licencia MIT permite integrarlo en APIs y productos comerciales de transcripcion en persa sin coste de licencia adicional.

## Benchmarks y rendimiento

Tasas de error de palabra (WER) y de caracter (CER) en porcentaje, tras la normalizacion unificada de texto en persa. PSRB y VisualEars no se vieron durante el entrenamiento.

| Conjunto | WER / CER (%) |
|---|---|
| FLEURS | 3,86 / 1,33 |
| Common Voice | 3,34 / 1,53 |
| YouTube | 13,42 / 7,99 |
| Music | 22,98 / 11,00 |
| Media | 16,06 / 9,54 |
| PSRB | 18,00 / 8,17 |
| VisualEars | 5,31 / 1,56 |

La model card indica que la comparativa completa de los cinco modelos de la familia Taraneh esta disponible en el paper y en el README del repositorio de GitHub. No se proporcionan en esta informacion datos comparativos directos frente a otros modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada en la model card. Al derivar de Whisper large-v3, se situa en el rango tipico de modelos de ese tamano (en torno a 6-10 GB en float16 y 3-4 GB en int8), aunque estas cifras son estimaciones y no datos confirmados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible; para un modelo de la categoria de Whisper large-v3 suelen emplearse A100, H100 o RTX 3090/4090.
- Compatibilidad con GPU de consumo: no confirmada en la model card; por tamano del modelo base es plausible en GPUs con suficiente VRAM, pero no se aporta dato oficial.
- Opciones de despliegue: Transformers (`WhisperForConditionalGeneration`) y CTranslate2 como ruta rapida segun el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- El tamano del repositorio aparece como 0,0 GB, por lo que los pesos podrian no estar completamente subidos o la informacion estar incompleta.

## Comparativa con modelos similares

| Modelo | Base | Idiomas | Licencia | Resultados publicados | Disponibilidad |
|---|---|---|---|---|---|
| Taraneh-WLarge | openai/whisper-large-v3 | persa (fa) | MIT | FLEURS 3,86 % WER; Common Voice 3,34 % WER | HuggingFace, 0 descargas |
| openai/whisper-large-v3 | - | multilingue (99 idiomas) | MIT | no disponible en esta informacion para persa | HuggingFace, ampliamente usado |
| Otros modelos de la familia Taraneh | openai/whisper (varias tallas) | persa (fa) | no disponible | comparativa completa en el paper | no disponible en esta informacion |

No se dispone de datos de benchmarks de alternativas concretas de ASR en persa dentro de la informacion proporcionada, por lo que la comparacion cuantitativa directa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la model card; al entrenarse sobre datos mayoritariamente de medios, YouTube y corpus, puede reflejar sesgos de acento, genero o registro de esas fuentes.
- Riesgo de alucinacion: como todo modelo generativo seq2seq, puede producir texto plausible que no corresponde al audio, especialmente en tramos con ruido, silencios o musica.
- Deterioro en canto y musica: el WER en el dominio Music alcanza el 22,98 %, mas del doble que en habla espontanea; no es fiable sin revision humana en ese escenario.
- Limitacion de idioma: el modelo esta especializado exclusivamente en persa (fa); no se debe esperar buen rendimiento en otros idiomas.
- Limitacion de contexto audio: al heredar Whisper large-v3, procesa ventanas de 30 segundos, lo que requiere segmentacion para audios largos.
- Licencia: MIT permite uso comercial sin coste, pero exige conservar el aviso de licencia MIT original de Whisper junto con los pesos.
- Madurez del repositorio: registra 0 descargas y 0 likes, y un tamano de repositorio de 0,0 GB, lo que sugiere un recurso poco validado por la comunidad o con subida de pesos incompleta.
- Ausencia de datos: no se detallan parametros exactos, cuantizaciones soportadas, requisitos de hardware ni composicion del dataset, lo que dificulta la planificacion de despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/areffarhadi/Taraneh-WLarge
- Repositorio de codigo, manifiestos, normalizacion e inferencia: https://github.com/areffarhadi/persian-asr
- PDF del paper (Aref Farhadipour, Taraneh-ASR: Scaling Persian Speech Recognition and Forced Alignment Across Singing and Conversational Domains, Universidad de Zurich): https://github.com/areffarhadi/persian-asr/blob/main/ArefFarhadi-TaranehASR.pdf
- Modelo base: https://huggingface.co/openai/whisper-large-v3
