# JinchuanTian/LongCap-35B-A3B-FP8

## Resumen

LongCap-35B-A3B-FP8 es la variante cuantizada en FP8 del modelo LongCap-35B-A3B, desarrollado por JinchuanTian. Se trata de un modelo multimodal de audio a texto especializado en la generacion de descripciones densas y con marcas temporales (timestamped audio captioning) sobre grabaciones de larga duracion, desde unos pocos segundos hasta aproximadamente dos horas. El modelo convierte una grabacion en una linea temporal de eventos de habla, musica y efectos sonoros, donde cada evento incluye tiempos de inicio y fin junto con un conjunto estructurado de atributos.

La arquitectura se etiqueta como `qwen3_5` en los metadatos de Hugging Face, con un total de 35.313.784.832 parametros y un diseno de mezcla de expertos (MoE) segun la nomenclatura A3B del nombre (aproximadamente 3B parametros activos). El modelo procesa el audio en fragmentos cortos manteniendo el contexto previo de audio y texto, con una ventana de hasta 1M tokens, lo que le permite generar una unica pasada sobre grabaciones completas de hasta dos horas sin la degradacion que sufren otros sistemas por segmentos.

Su relevancia actual radica en que unifica dos tareas tradicionalmente separadas (captioning de audio con timestamps y reconocimiento de habla con diarizacion de hablantes) en un solo checkpoint, con licencia Apache 2.0 y pesos en formato safetensors compatibles con vLLM. La version FP8 reduce el peso del repositorio a 38.5 GB y permite ejecucion en una sola GPU H100 de 80 GB, frente a las dos GPU necesarias para la version BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5` en metadatos) |
| Parametros totales | 35.313.784.832 (35,3B) |
| Parametros activos | aproximadamente 3B (segun nomenclatura A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | hasta 1M tokens |
| Tipos de cuantizacion | FP8 en pesos de expertos MoE, BF16 en el resto; version BF16 disponible por separado |
| Idiomas soportados | en, zh (atributos de salida en chino; transcripciones y letras conservan el idioma hablado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 38.5 GB |
| Pipeline | audio-text-to-text |
| Libreria | longcap |
| Hardware de referencia | 1x H100 80GB (FP8); 2x H100 80GB (BF16) |

## Arquitectura y entrenamiento

La informacion disponible indica que LongCap se construye sobre una arquitectura de tipo transformer con mezcla de expertos (MoE), identificada en los metadatos como `qwen3_5`. El modelo procesa el audio de entrada en fragmentos cortos y va escribiendo los eventos de cada fragmento a medida que avanza, manteniendo en contexto tanto el audio previo como el texto ya generado, hasta un maximo de 1M tokens. Esta estrategia de procesamiento incremental con contexto persistente es la que permite cubrir grabaciones de hasta dos horas en una sola pasada sin la degradacion que experimentan los sistemas que segmentan el audio en bloques independientes de 10 minutos.

La salida es estructurada: cada evento lleva un campo `type` (speech, music o sound_event), un conjunto de atributos seleccionados entre 62 claves disenadas por expertos, y un `caption` corto. Los nombres y valores de los atributos se escriben en chino, mientras que las transcripciones y letras mantienen el idioma hablado. El modelo cubre tanto captioning con timestamps como reconocimiento de habla con diarizacion de hablantes en un unico checkpoint. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de descripciones densas de audio con marcas temporales de inicio y fin por evento.
- Captioning estructurado con 62 claves de atributos que cubren habla, musica y efectos sonoros (identidad de hablante, edad, genero, emocion, transcripcion, instrumentos, tempo, fuente sonora, distancia, entre otras).
- Reconocimiento automatico de habla (ASR) con diarizacion de hablantes y etiquetas de identidad.
- Deteccion de eventos sonoros (sound event detection) con atributos de fuente, distancia, reverberacion y funcion narrativa.
- Descripcion de musica con listado de instrumentos, funcion instrumental y tipo de voz.
- Procesamiento de audio de larga duracion (hasta aproximadamente dos horas) en una sola pasada con contexto de hasta 1M tokens.
- Soporte multilingue limitado a ingles y chino en la informacion disponible; las transcripciones conservan el idioma hablado.
- Integracion con vLLM para despliegue en produccion.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Indexacion y busqueda de archivos audiovisuales: el modelo genera una linea temporal estructurada de habla, musica y sonidos con atributos ricos, lo que permite construir indices consultables sobre peliculas, podcasts o archivos de radio de hasta dos horas en una sola pasada.
- Subtitulado y transcripcion con diarizacion: la capacidad de ASR con etiquetas de hablante y atributos de emocion, velocidad y calidad vocal facilita la generacion de subtitulos enriquecidos y la identificacion de interlocutores en reuniones o entrevistas.
- Analisis de contenido cinematografico y musical: los atributos de musica (instrumentos, funcion, tempo) y de efectos sonoros (fuente, distancia, funcion narrativa) permiten analizar bandas sonoras y diseno de sonido a escala.
- Accesibilidad para personas con discapacidad auditiva: la descripcion densa de eventos no verbales (pasos, musica, efectos) complementa la transcripcion del habla y ofrece una representacion mas completa del audio.
- Moderacion y auditoria de contenido: la deteccion de eventos sonoros y atributos de contexto (cultura, subtexto, intencion) puede apoyar la revision de material audiovisual en plataformas.
- Investigacion en percepcion auditiva y multimodalidad: el modelo sirve como base para experimentos de captioning de audio largo, evaluacion de atributos acusticos y comparacion con benchmarks como LongCapBench-TAC-Long.
- Monitorizacion de emisiones y archivos de medios: el procesamiento de grabaciones de horas en una sola pasada encaja en pipelines de analisis por lotes de contenido de radio y television.

## Benchmarks y rendimiento

Los datos publicados en la model card se refieren a la version FP8 y a la familia LongCap en su conjunto. Se presentan a continuacion los valores citados:

| Benchmark | Metrica | LongCap-35B-A3B-FP8 | Qwen3.5-Omni-Plus |
|---|---|---|---|
| LongCapBench-TAC-Short | tcpCapSim (mayor es mejor) | 64,6% | 52,7% |
| LongCapBench-TAC-Short | TER (menor es mejor) | 13,0% | 13,2% |

La model card indica ademas que la calidad de caption sobre LongCapBench-TAC-Long se mantiene estable a lo largo de dos horas de audio, mientras que otros sistemas se degradan en pocos minutos, y que el modelo mayor LongCap-122B-A10B (no liberado) obtiene mejores resultados. No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38,4 GB en FP8 (solo expertos MoE cuantizados, resto en BF16); aproximadamente 70,6 GB en BF16.
- GPU recomendadas: 1x H100 80GB para la version FP8; 2x H100 80GB para la version BF16.
- No se documenta en la informacion disponible que el modelo quepa en GPU de consumo (RTX 4090, 24 GB) en ninguna de sus variantes publicadas.
- Opciones de despliegue: vLLM (soporte indicado en los tags); la libreria `longcap` y el repositorio de codigo asociado proporcionan el quickstart de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCap-35B-A3B-FP8 | 35,3B (MoE, ~3B activos) | hasta 1M tokens | Captioning de audio largo con timestamps + ASR con diarizacion | Apache 2.0 | Pesos FP8 y BF16 en Hugging Face |
| Qwen3.5-Omni-Plus | no disponible | no disponible | Modelo omni multimodal (referencia en benchmark) | no disponible | no disponible |
| LongCap-122B-A10B | 122B (MoE, ~10B activos) | no disponible | Version mayor de LongCap citada en el paper | no disponible | No liberado |

La informacion disponible solo permite comparar con Qwen3.5-Omni-Plus a traves de LongCapBench-TAC-Short, donde LongCap obtiene 64,6% de tcpCapSim frente a 52,7%, con errores temporales similares (13,0% vs 13,2% TER). No se dispone de datos suficientes para una comparativa completa con otras alternativas de captioning de audio.

## Limitaciones y advertencias

- Los nombres y valores de los atributos de salida se generan en chino, lo que puede requerir postprocesado o traduccion para aplicaciones en otros idiomas; el archivo `attribute_keys.json` ofrece los nombres en ingles de las claves.
- El soporte linguistico documentado se limita a ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion en la transcripcion y en la atribucion de caracteristicas del hablante (identidad, emocion, edad), especialmente en audio con ruido o solapamiento de voces.
- La diarizacion y la identificacion de hablantes pueden ser imprecisas en grabaciones con muchos interlocutores o cambios frecuentes de turno.
- La ventana de 1M tokens esta pensada para audio de hasta aproximadamente dos horas; grabaciones mas largas requeririan estrategias adicionales no documentadas.
- La version FP8 solo cuantiza los pesos de los expertos MoE; aunque el autor indica que las salidas son muy cercanas a BF16, pueden existir diferencias numericas menores.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones de los datos de entrenamiento y de los modelos base, no detalladas en la informacion disponible.
- El modelo esta optimizado para captioning y ASR; no se documenta soporte de tool calling ni de razonamiento agentico, por lo que no es adecuado como sustituto de un LLM generalista en esas tareas.
- El despliegue en produccion requiere GPU de 80 GB (H100) en la version FP8, lo que limita su uso en infraestructura de gama consumer.

## Enlaces

- Modelo en Hugging Face (FP8): https://huggingface.co/JinchuanTian/LongCap-35B-A3B-FP8
- Version BF16: https://huggingface.co/JinchuanTian/LongCap-35B-A3B
- Quickstart: https://github.com/jctian98/longcap-code/blob/main/docs/quickstart.md
- Codigo: https://github.com/jctian98/longcap-code
- Pagina del proyecto: https://jctian98.github.io/longcap/
- Paper (arXiv): https://arxiv.org/abs/2611.11125
- Benchmark LongCapBench-TAC-Long: https://huggingface.co/datasets/JinchuanTian/LongCapBench-TAC-Long
