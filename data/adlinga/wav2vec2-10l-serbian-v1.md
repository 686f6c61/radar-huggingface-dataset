# adlinga/wav2vec2-10L-serbian-v1

## Resumen

wav2vec2-10L-serbian-v1 es un modelo de reconocimiento automatico del habla (ASR) para serbio, desarrollado por el usuario adlinga y publicado en Hugging Face. Se trata de una adaptacion de la arquitectura wav2vec 2.0 de Meta AI, reducida a 10 capas de encoder y 139,1 millones de parametros, que recibe audio mono a 16 kHz y devuelve texto en serbio en alfabeto latino, en minusculas y con diacriticos.

El modelo emplea una cabeza CTC (Connectionist Temporal Classification) sobre el encoder convolucional y transformer de wav2vec 2.0, y se distribuye en formato safetensors con pesos en FP16 (265,4 MiB). Su interes principal es la eficiencia: con un cuarto de los parametros de un Whisper Large v3 ofrece un WER competitivo en serbio y una latencia muy inferior, lo que lo hace atractivo para despliegues con requisitos estrictos de tiempo real o de coste computacional.

Es relevante ahora porque el serbio es un idioma con recursos limitados y las alternativas de calidad suelen ser modelos multilingues grandes y lentos. Este checkpoint demuestra que un modelo pequeno y especializado puede superar en precision a CLASSLA XLS-R 300M y a Whisper Large v3 Turbo en Common Voice SR, aunque queda por detras de los Whisper pequenos afinados especificamente para serbio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (encoder convolucional + transformer de 10 capas) con cabeza CTC |
| Parametros totales | 139.122.334 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no especificada) |
| Tipos de cuantizacion | FP16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | serbio (sr) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP16, 265,4 MiB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 descrita por Baevski et al. (Meta AI, 2020): un extractor de caracteristicas convolucional que procesa la forma de onda a 16 kHz, seguido de un encoder transformer de 10 capas que produce representaciones latentes, y una cabeza lineal CTC que mapea dichas representaciones al vocabulario de caracteres serbios. El preentrenamiento original de wav2vec 2.0 combina modelado enmascarado del habla con aprendizaje contrastivo; el autor no detalla en la model card si partio de un checkpoint preentrenado multilingue o si entreno desde cero, ni especifica el numero de horas de audio ni la composicion del corpus de ajuste.

La model card indica que el checkpoint publicado es una media de checkpoints seleccionada mediante los mismos conjuntos de test usados en la evaluacion (Common Voice 27.0 SR y FLEURS SR), lo que constituye una fuga de informacion en la seleccion de modelo y debe tenerse en cuenta al interpretar los resultados. No se documentan fases de RLHF ni DPO, algo esperable en un modelo CTC de ASR. La innovacion principal es la reduccion de profundidad del encoder (10 capas frente a las 12 o 24 de los wav2vec 2.0 estandar) para recortar coste de inferencia manteniendo precision en un unico idioma.

## Capacidades

- Reconocimiento automatico del habla en serbio a partir de audio mono a 16 kHz.
- Transcripcion en alfabeto latino serbio, en minusculas y con diacriticos (c, c, d, s, z).
- Decodificacion CTC voraz (greedy); no se documenta decodificacion con modelo de lenguaje externo.
- Inferencia en FP16 sobre GPU y FP32 sobre CPU.
- Compatible con la libreria transformers (`AutoModelForCTC`, `AutoProcessor`) y con endpoints compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision, audio generativo ni traduccion.
- No es multilingue: solo serbio.

## Casos de uso

- Transcripcion de reuniones y entrevistas en serbio: el modelo procesa audio de 16 kHz y genera texto con diacriticos, adecuado para actas automaticas y busqueda sobre grabaciones gracias a su bajo coste por minuto (38,9 ms por cada 30 s de audio en RTX 5090).
- Subtitulado de video en tiempo casi real: su baja latencia (TTFT de 5,70 ms) permite segmentar el audio en fragmentos cortos y generar subtitulos con retardo minimo en plataformas de streaming o edicion.
- Atencion al cliente por voz: integrado en un pipeline de telefonia (previa remuestreo a 16 kHz), transcribe las llamadas para analitica, cumplimiento normativo o enrutamiento automatico a agentes humanos.
- Generacion de actas y notas en entornos sanitarios o legales: la transcripcion local con un modelo de 139 M de parametros permite cumplir requisitos de privacidad sin enviar audio a servicios en la nube.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de podcasts, archivos de radio o grabaciones institucionales para construir indices de texto consultables.
- Prototipado e investigacion en ASR de bajos recursos: sirve como linea base ligera para experimentos de aumento de datos, decodificacion con LM o comparacion de arquitecturas en serbio.
- Sistemas embebidos o de borde: con 265,4 MiB en FP16 y un coste de 38,9 ms por 30 s de audio, es viable en GPUs de consumo e incluso en CPU para procesamiento por lotes no interactivo.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, batch size 1, FP16 sobre RTX 5090):

| Modelo | Parametros | Pesos FP16 (MiB) | WER Common Voice 27.0 SR | WER FLEURS SR | TTFT mediana (ms) | Tiempo por 30 s (ms) |
|---|---:|---:|---:|---:|---:|---:|
| **wav2vec2-10L-serbian-v1** | 139,1M | 265,4 | 15,46% | 21,99% | 5,70 | 38,9 |
| CLASSLA XLS-R 300M Juzne Vesti | 315,5M | 601,7 | 24,38% | 28,66% | 9,43 | 54,4 |
| Meta OmniASR CTC 300M v2 | 326,0M | 621,8 | 38,07% | 21,75% | 15,85 | 89,5 |
| Whisper Large v3 Turbo | 808,9M | 1.542,8 | 36,59% | 14,49% | 28,96 | 612,9 |
| Istomin Whisper Small SR | 241,7M | 461,1 | 6,54% | 3,32% | 24,84 | 969,5 |
| Whisper Large v3 | 1.543,5M | 2.944,0 | 17,51% | 12,19% | 49,79 | 2.134,1 |
| Sagicc Whisper Large v3 SR CMB | 1.543,5M | 2.944,0 | 6,39% | 7,82% | 47,84 | 2.524,9 |

El modelo lidera en velocidad (TTFT y tiempo por 30 s) y supera en WER de Common Voice a CLASSLA XLS-R 300M, OmniASR CTC 300M y Whisper Large v3 Turbo, pero queda por detras de Istomin Whisper Small SR y de los Whisper Large v3 afinados para serbio en precision. Nota: los conjuntos de test se usaron tambien para seleccionar el checkpoint, por lo que los WER pueden estar optimistamente sesgados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,3-0,5 GB en FP16 para pesos y activaciones con batch 1 y clips cortos; en FP32 sobre CPU el modelo ocupa unos 0,56 GB.
- GPU recomendadas: cualquier GPU moderna con soporte FP16, incluidas RTX 3060, RTX 4090, RTX 5090, A100 y H100; el modelo es demasiado pequeno para aprovechar GPUs de centro de datos, que quedaran infrautilizadas.
- Cabe holgadamente en GPU de consumo: una GTX 1650 de 4 GB o una RTX 3050 de 8 GB son suficientes.
- Opciones de despliegue: transformers (referencia), endpoints compatibles de Hugging Face y pipelines CTC personalizados; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a CTC de audio.
- Latencia y throughput: TTFT mediana de 5,70 ms y 38,9 ms por cada 30 s de audio en RTX 5090 con batch 1 y FP16; el rendimiento en CPU no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER CV SR | WER FLEURS SR | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| wav2vec2-10L-serbian-v1 | 139,1M | audio 16 kHz | 15,46% | 21,99% | no disponible | Hugging Face (transformers) |
| CLASSLA XLS-R 300M Juzne Vesti | 315,5M | audio 16 kHz | 24,38% | 28,66% | no disponible | Hugging Face |
| Istomin Whisper Small SR | 241,7M | audio 16 kHz, ventana de 30 s | 6,54% | 3,32% | no disponible | Hugging Face |
| Whisper Large v3 | 1.543,5M | audio 16 kHz, ventana de 30 s | 17,51% | 12,19% | licencia MIT (Whisper original) | Hugging Face, multiples runtimes |

Frente a CLASSLA XLS-R 300M, el modelo de adlinga es menos de la mitad de grande, casi el doble de rapido y mas preciso en ambos conjuntos. Frente a Istomin Whisper Small SR, pierde en precision (15,46% frente a 6,54% en Common Voice) pero es aproximadamente 25 veces mas rapido por 30 s de audio. Frente a Whisper Large v3, gana en Common Voice y velocidad, pero pierde en FLEURS.

## Limitaciones y advertencias

- Solo soporta serbio; no transcribe otros idiomas ni variedades cercanas como croata o bosnio de forma fiable.
- El WER en FLEURS (21,99%) es notablemente peor que en Common Voice, lo que sugiere sensibilidad al dominio, al ruido y al acento.
- Los conjuntos de test se usaron para seleccionar el checkpoint, por lo que los resultados publicados pueden sobreestimar el rendimiento real en produccion.
- No se documenta el corpus de entrenamiento ni el origen de los datos, lo que impide evaluar sesgos demograficos, dialectales o de genero.
- Riesgo de alucinacion y de sustituciones foneticas en audio con ruido, musica o solapamiento de hablantes, inherente a los modelos CTC sin modelo de lenguaje.
- La licencia no esta disponible: no se puede asumir uso comercial sin consultar al autor.
- El modelo no incluye puntuacion, mayusculas ni normalizacion de texto; la salida es en minusculas y requiere postprocesado.
- No hay garantias de mantenimiento ni versionado; el repositorio tiene cero descargas y cero likes en el momento de la consulta.
- La decodificacion con modelo de lenguaje externo no esta documentada y podria mejorar el WER, pero requeriria trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adlinga/wav2vec2-10L-serbian-v1
- Paper original de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Repositorio de referencia de transformers: https://github.com/huggingface/transformers
- Documentacion de AutoModelForCTC: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Common Voice (Mozilla): https://commonvoice.mozilla.org/
- FLEURS (Google): https://huggingface.co/datasets/google/fleurs
