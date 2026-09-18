# palli23/wav2vec2-base-samromur-100h

## Resumen

palli23/wav2vec2-base-samromur-100h es un modelo de reconocimiento automático del habla (ASR) en islandés, obtenido por ajuste fino de wav2vec2-base (94,4 millones de parámetros) sobre un subconjunto anidado de 100 horas del corpus de escalado Miljón/samromur-500h. Lo publica el usuario palli23 como parte de un conjunto de checkpoints de escalado asociado al trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027), cuyo objetivo declarado es estudiar cómo se comportan modelos pequeños de ASR cuando se les entrena con volúmenes de datos controlados frente a modelos multilingües mucho mayores.

El modelo resuelve una tarea concreta: transcripción de voz a texto en islandés, un idioma de bajos recursos con relativamente pocos recursos ASR públicos. Su relevancia es fundamentalmente de investigación: al ser un checkpoint intermedio dentro de una rejilla de escalado, permite analizar la relación entre horas de audio de entrenamiento y tasa de error, y sirve como punto de comparación reproducible frente a sistemas multilingües tipo Whisper o XLS-R.

Se distribuye únicamente en formato safetensors, con licencia CC-BY-SA-4.0, y su uso previsto es la inferencia ASR en islandés, no la generación de texto. En el momento de redactar esta ficha cuenta con 18 descargas y 0 likes, por lo que no existe validación comunitaria significativa más allá de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (extractor convolucional de características + codificador Transformer); objetivo de ajuste fino para ASR no especificado en la model card |
| Parametros totales | 94.402.472 (dato real de los archivos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; al ser un modelo de ASR la entrada es audio, no una ventana de tokens de texto |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors, sin variantes GGUF, ONNX ni cuantizadas |
| Idiomas soportados | islandés (código `is`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,5 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 18 / 0 |
| Fecha de creacion / ultima actualizacion | 2026-06-07 / 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2-base: un extractor de características puramente convolucional que convierte la forma de onda de audio en una secuencia de representaciones latentes, seguido de un codificador Transformer que modela esas representaciones con atención. El modelo parte de un preentrenamiento autosupervisado sobre audio sin etiquetar (el esquema original de wav2vec2 combina aprendizaje contrastivo y enmascaramiento de tramas latentes) y después se ajusta de forma supervisada para transcripción. La model card no detalla el objetivo exacto del ajuste fino; en la familia wav2vec2 el procedimiento habitual para ASR en HuggingFace es una cabeza de clasificación por fotograma con pérdida CTC, pero este extremo no se confirma en la información disponible.

En cuanto a los datos, el autor indica que el ajuste fino se realizó sobre un subconjunto anidado de 100 horas extraído del pool de escalado Miljón/samromur-500h. Ese detalle ("nested subset") es relevante metodológicamente: implica que los checkpoints de la serie comparten prefijos de datos, de modo que las curvas de escalado entre distintos tamaños de muestra son comparables entre sí. No se especifica en la información proporcionada la composición exacta del subconjunto (horas de habla limpia frente a espontánea, proporción de hablantes, condiciones de grabación), ni si hubo etapas de RLHF, DPO u otras optimizaciones posteriores, algo poco habitual en ASR de todos modos.

## Capacidades

- Transcripción de voz a texto en islandés: es la única capacidad declarada explícitamente por el autor.
- Reconocimiento de habla sobre audio de entrada variable, al heredar el diseño convolucional más Transformer de wav2vec2.
- Ajuste fino supervisado sobre corpus de habla islandesa (Samrómur), lo que sitúa al modelo en el dominio de lecturas y habla relativamente controlada propio de ese corpus.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües: el único idioma indicado es el islandés.
- No se declara modo de razonamiento (thinking), visión, audio generativo ni ninguna otra capacidad especial.
- No se declara traducción, diarización de hablantes, puntuación ni restauración de mayúsculas.

## Casos de uso

- Transcripción de archivos de audio en islandés: podcasts, entrevistas y grabaciones de archivo pueden procesarse en lote con el modelo para obtener texto plano, aprovechando su tamaño reducido (94,4 M de parámetros) para ejecutar varias instancias en paralelo en una sola GPU.
- Subtitulado automático para medios islandeses: el modelo sirve como motor ASR de una etapa previa de generación de subtítulos, que después se alinea temporalmente con herramientas externas de segmentación.
- Accesibilidad en vídeo y streaming: generación de subtítulos en directo o en diferido para audiencias islandesas, con la ventaja de un coste de inferencia muy inferior al de modelos multilingües grandes.
- Interfaces de voz en islandés: reconocimiento de comandos y dictado en aplicaciones de productividad, donde la latencia importa y un modelo de 94 M de parámetros permite respuesta en tiempo real incluso en CPU.
- Anotación asistida de corpus lingüísticos: pretranscripción de grabaciones nuevas para que lingüistas revisen y corrijan, reduciendo el coste de creación de datos etiquetados en islandés.
- Investigación sobre escalado de datos en ASR: como checkpoint de una serie con subconjuntos anidados, permite estudiar empíricamente la curva entre horas de audio y WER frente a modelos multilingües de referencia.
- Evaluación comparativa de sistemas ASR para lenguas de bajos recursos: sirve como línea base monolingüe pequeña frente a alternativas multilingües grandes, útil para justificar decisiones de despliegue en presupuestos limitados.
- Integración en pipelines de transcripción con posprocesado: la salida ASR puede encadenarse a modelos de lenguaje para puntuación, corrección ortográfica o resumen, siempre que el idioma de destino sea el islandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de WER y CER se encuentran en el artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027), pero no reproduce ninguna cifra, y la búsqueda web no ha devuelto enlaces al paper ni a tablas de resultados. No se dispone, por tanto, de valores de WER, CER ni de comparaciones numéricas verificables con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 380 MB solo de pesos (94,4 M de parámetros) más activaciones; en fp16/bf16, unos 190 MB; en int8, unos 95 MB. Son estimaciones de orden de magnitud, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4090, T4, A10, L4 o incluso una iGPU moderna pueden ejecutar el modelo con holgura.
- Cabe sin problemas en GPU de consumo: es un modelo de 94 M de parámetros, pensado para inferencia ligera. También es viable en CPU para cargas de trabajo moderadas.
- Opciones de despliegue: el repositorio solo publica safetensors, por lo que la vía natural es HuggingFace Transformers con PyTorch. No se han publicado variantes GGUF, ONNX ni cuantizadas, de modo que llama.cpp, Ollama o vLLM requerirían conversión previa (y en el caso de vLLM, verificar compatibilidad del pipeline ASR). TGI no es aplicable a un modelo de reconocimiento de habla.
- Atención al tamaño del repositorio: 16,5 GB frente a los ~380 MB de los pesos en fp32, lo que sugiere que el repositorio incluye artefactos adicionales (probablemente checkpoints intermedios, estados del optimizador o múltiples revisiones de escalado). Conviene revisar la lista de archivos antes de descargar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur-100h | 94,4 M | Islandés | wav2vec2-base | cc-by-sa-4.0 | no disponible |
| facebook/wav2vec2-base-960h | ~95 M | Inglés | wav2vec2-base | Apache-2.0 (segun la publicacion original) | no disponible en la informacion proporcionada |
| facebook/wav2vec2-large-xlsr-53 | ~317 M | 53 idiomas (incluye islandés) | wav2vec2-large + XLSR | Apache-2.0 (segun la publicacion original) | no disponible en la informacion proporcionada |
| openai/whisper-small | 244 M | Multilingüe (99 idiomas) | Transformer encoder-decoder | Apache-2.0 (segun la publicacion original) | no disponible en la informacion proporcionada |

Las cifras de parámetros y licencias de los modelos alternativos corresponden a especificaciones públicas ampliamente conocidas de sus familias, no a datos extraídos de la búsqueda web de esta ficha. No se dispone de comparaciones de WER o CER entre estos sistemas y el modelo descrito, por lo que la comparación se limita a arquitectura, tamaño, cobertura de idiomas y licencia.

## Limitaciones y advertencias

- Cobertura de un único idioma: solo islandés. No traduce ni transcribe otros idiomas, y su comportamiento fuera del islandés no está documentado.
- Entrenamiento limitado a 100 horas: es un subconjunto deliberadamente pequeño dentro de la serie de escalado, por lo que cabe esperar un WER superior al de checkpoints entrenados con las 500 horas completas del pool Samrómur. No se publican cifras que lo confirmen.
- Sesgos de dominio: el corpus Samrómur es fundamentalmente habla leída y controlada; el rendimiento en habla espontánea, dialectal, con ruido de fondo o con solapamiento de hablantes puede degradarse de forma notable. No hay evaluación publicada al respecto.
- Riesgo de alucinación en ASR: como todo sistema de reconocimiento, puede producir sustituciones, inserciones y omisiones, especialmente en pasajes ininteligibles. No se documentan tasas de error ni estrategias de mitigación.
- Salida sin formato garantizado: no se declara soporte de puntuación, mayúsculas ni marcas temporales, elementos que normalmente requieren posprocesado externo.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero impone atribución y, de forma crítica, licencia compartida igual (share-alike). Los productos derivados o adaptaciones del modelo, y en interpretaciones habituales también las salidas que incorporen material del modelo, deben distribuirse bajo la misma licencia, lo que puede ser incompatible con productos propietarios. Conviene revisar el alcance legal antes de integrarlo en un servicio comercial cerrado.
- Validación comunitaria prácticamente nula: 18 descargas y 0 likes. No hay informes independientes de calidad, estabilidad ni comportamiento en producción.
- Falta de trazabilidad técnica: no se especifica el objetivo de entrenamiento, la configuración de hiperparámetros, la composición exacta del subconjunto de 100 horas ni el procedimiento de evaluación, lo que dificulta reproducir o auditar los resultados.
- Tamaño del repositorio desproporcionado (16,5 GB frente a ~380 MB de pesos): puede provocar descargas más costosas de lo esperado y requiere revisar qué artefactos adicionales contiene.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/wav2vec2-base-samromur-100h
- Artículo de referencia citado en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027). No se ha encontrado enlace directo en la búsqueda web; no disponible.
- Corpus Samrómur 500h (pool de escalado citado): Miljón/samromur-500h, no se ha encontrado enlace directo en la búsqueda web; no disponible.
- Repositorio, demo o documentación adicional del autor: no disponible.
- La búsqueda web asociada a esta ficha no ha devuelto resultados relevantes (únicamente páginas de la plataforma TikTok, sin relación con el modelo).
