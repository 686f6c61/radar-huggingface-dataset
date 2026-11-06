# NextGig/bargo-finance-realtime-v1

## Resumen

Bargo Finance Realtime v1 es un modelo propietario de reconocimiento automatico del habla (ASR) en streaming, desarrollado por NextGig (Bargo AI), disenado especificamente para dominios financieros de baja latencia: webcasts de resultados corporativos, feeds de mesa de trading (squawk), vigilancia de cumplimiento en tiempo real y agentes de voz financieros. El modelo se distribuye no como pesos abiertos, sino como un servicio accesible via API compatible con el SDK de OpenAI, lo que condiciona por completo su evaluacion y despliegue.

Tecnicamente se posiciona como un ASR causal de latencia sub-100 ms: opera sobre tramas de audio de 80 ms con un coste de inferencia de aproximadamente 8-10 ms, lo que produce una latencia "mouth-to-screen" declarada de 88 ms. Su diferenciador principal es la precision en entidades financieras habladas, en particular tickers bursatiles, donde el autor reporta una mejora de 20 puntos porcentuales en exactitud frente a una linea base de streaming generica.

El modelo es relevante para equipos que construyen transcripcion en vivo con vocabulario financiero denso y necesitan coste bajo, pero debe evaluarse con cautela: la informacion publica es exclusivamente la model card del autor, no hay pesos descargables, la licencia es propietaria y los benchmarks proceden de un dataset del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (ASR en streaming causal; no se detalla el tipo de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (procesa audio en tramas causales de 80 ms) |
| Tipos de cuantizacion | No disponible (servicio gestionado; sin pesos publicados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Propietaria: bargo-proprietary-api (licencia "other", enlace a https://www.bargo.ai/transcribe) |
| Formato de pesos | No disponible (no se publican pesos; acceso via API compatible con OpenAI) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo: la model card no especifica si se trata de un transformer encoder-decoder, un modelo causal puro o un hibrido, ni detalla el numero de parametros, la composicion del dataset de entrenamiento o el volumen de horas de audio utilizadas. Lo unico verificable es su caracter causal y su granularidad de procesamiento: tramas de audio de 80 ms con un coste de computo de inferencia de 8-10 ms por trama, lo que habilita la emision de texto antes de que el hablante complete la silaba.

El autor declara un ajuste especifico sobre vocabulario financiero (tickers hablados y un catalogo de 50.000 entidades financieras) y menciona un dataset de evaluacion propio, `NextGig/FinASR-Bench`, con splits orientados a tickers, catalogo de entidades, resultados limpios, resultados expandidos, entidades raras dificiles y una guarda de habla general. No se indica si hubo RLHF, DPO ni tecnicas de decodificacion especulativa. Tampoco se documenta el proceso de alineacion ni la procedencia de los datos de entrenamiento, lo que limita la reproducibilidad.

## Capacidades

- Transcripcion de voz a texto en streaming con latencia declarada de 88 ms (mouth-to-screen) sobre tramas causales de 80 ms.
- Reconocimiento mejorado de tickers bursatiles hablados: 87,5 % de exactitud case-exact y 4,76 % WER en el split `spoken_ticker_eval` segun el autor.
- Cobertura de un catalogo de 50.000 entidades financieras (empresas, instrumentos) con 10,70 % WER y 238/400 entidades recuperadas en `catalog_50k_eval`.
- Transcripcion de llamadas de resultados (earnings calls) con manejo de entidades raras: 14,62 % WER en `earnings_hard_167`.
- Guarda de habla general sin entidades falsas: 0 falsos positivos de entidad en `general_speech_guard_64` segun la evaluacion del autor.
- Salida en streaming via SSE a traves del endpoint `audio.transcriptions.create` con `stream=True` del SDK de OpenAI.
- Soporte exclusivo de ingles; no se declaran capacidades multilingues.
- No se declaran capacidades de tool calling, function calling, agentes, vision ni audio bidireccional mas alla de la transcripcion.

## Casos de uso

- Transcripcion en vivo de webcasts de resultados: el modelo consume el audio del webcast en tramas de 80 ms y emite texto con 88 ms de latencia, permitiendo a analistas seguir la llamada con subtitulos casi instantaneos y capturar tickers y cifras mencionadas al vuelo.
- Squawk de mesa de trading: un feed de audio continuo de comentaristas de mercado se transcribe en tiempo real; la mejora en tickers hablados (87,5 % exactos) reduce el riesgo de operar sobre una empresa equivocada al interpretar una mencion.
- Vigilancia de cumplimiento en tiempo real: la transcripcion de llamadas con clientes o salas de negociacion permite disparar alertas por palabras clave o entidades reguladas en el momento, aprovechando la baja latencia y la ausencia de entidades falsas en habla general.
- Agentes de voz financieros: integrado como capa ASR de un agente conversacional, el modelo alimenta el turno del usuario con texto fiable en menos de 100 ms, lo que evita pausas perceptibles en la interaccion.
- Generacion automatica de actas y resumenes de earnings calls: la transcripcion en streaming se acumula y se pasa a un LLM posterior para resumen y extraccion de guidance, con la ventaja de que las entidades financieras llegan ya normalizadas.
- Indexacion y busqueda de archivos de audio financieros: transcripcion por lotes de grabaciones historicas para construir un indice buscable por ticker o entidad, usando el catalogo de 50.000 entidades como vocabulario de referencia.
- Subtitulado accesible de presentaciones de inversores: emision de subtitulos en directo en ingles para eventos retransmitidos, con coste declarado de 0,05 USD por hora de audio.

## Benchmarks y rendimiento

Resultados publicados por el autor en `FinASR-Bench` (dataset propio). No se dispone de verificacion independiente.

| Split | Utterances | Baseline streaming generico | bargo/finance-realtime-v1 | Reduccion relativa |
|---|---|---|---|---|
| Spoken stock tickers (`spoken_ticker_eval`) | 40 | 9,96 % WER (67,5 % exactos) | 4,76 % WER (87,5 % exactos) | -52,2 % WER / +20,0 pp |
| Catalogo 50k entidades (`catalog_50k_eval`) | 100 (400 entidades) | 13,26 % WER (216/400) | 10,70 % WER (238/400) | -19,3 % WER / +5,5 pp recall |
| Earnings limpio (`earnings_clean_70`) | 70 | 15,13 % WER (28/70 raras) | 11,25 % WER (33/70 raras) | -25,6 % WER |
| Earnings expandido (`earnings_expanded_120`) | 120 | 16,37 % WER (38/120 exactos) | 14,17 % WER (49/120 exactos) | -13,4 % WER / +28,9 % hits |
| Earnings entidades raras (`earnings_hard_167`) | 167 | 16,89 % WER (50/167 exactos) | 14,62 % WER (72/167 exactos) | -13,4 % WER / +44,0 % hits |
| Guarda habla general (`general_speech_guard_64`) | 64 | 15,73 % WER (0 falsos) | 12,86 % WER (0 falsos) | -18,2 % WER |

Precio declarado: 0,05 USD por hora de audio en streaming, frente a 0,26-0,46 USD/h de Deepgram Nova-3 Streaming, 0,37 USD/h de AssemblyAI Streaming y 0,36+ USD/h de OpenAI Realtime (cifras del autor, no verificadas de forma independiente).

## Requisitos de hardware

- No aplica hardware local: el modelo no publica pesos y solo se consume como servicio gestionado en `https://www.bargo.ai/v1`.
- VRAM estimada para inferencia: no disponible (no hay pesos descargables ni cuantizaciones).
- GPU recomendadas: no disponibles desde el punto de vista del usuario; la infraestructura corre en el proveedor.
- Ejecucion en GPU de consumo: no posible, al no existir artefactos de pesos.
- Opciones de despliegue: exclusivamente API remota compatible con el SDK de OpenAI (`client.audio.transcriptions.create` con `stream=True`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: 88 ms mouth-to-screen con 8-10 ms de computo por trama de 80 ms. Throughput concurrente no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Latencia declarada | Precio streaming | Licencia | Pesos |
|---|---|---|---|---|---|---|
| bargo/finance-realtime-v1 | ASR streaming propietario | en | 88 ms | 0,05 USD/h (autor) | Propietaria (bargo-proprietary-api) | No publicados |
| Deepgram Nova-3 Streaming | ASR streaming comercial | Multiples | No disponible en la informacion | 0,26-0,46 USD/h (citado por el autor) | Comercial | No |
| AssemblyAI Streaming | ASR streaming comercial | Multiples | No disponible en la informacion | 0,37 USD/h (citado por el autor) | Comercial | No |
| OpenAI Realtime | ASR streaming comercial | Multiples | No disponible en la informacion | 0,36+ USD/h (citado por el autor) | Comercial | No |

La comparativa de precios y prestaciones procede integramente de la model card del autor; no se han contrastado con las paginas oficiales de los competidores.

## Limitaciones y advertencias

- Solo ingles: no hay soporte declarado para castellano ni otros idiomas, lo que descarta su uso en entornos hispanohablantes sin una capa adicional.
- Licencia propietaria `bargo-proprietary-api`: el uso esta sujeto a los terminos del servicio en https://www.bargo.ai/transcribe; no hay derechos de modificacion, redistribucion ni despliegue on-premise.
- Sin pesos publicados: imposible auditar el modelo, medir su rendimiento de forma independiente, cuantizarlo o ejecutarlo en infraestructura propia; dependencia total del proveedor.
- Benchmarks autoevaluados sobre un dataset del propio autor (`NextGig/FinASR-Bench`) con tamanos de muestra pequenos (40 a 167 utterances por split), lo que limita la significacion estadistica de las diferencias reportadas.
- Riesgo de alucinacion de entidades no cuantificado fuera del split `general_speech_guard_64`; el autor declara cero falsos positivos solo en esa muestra de 64 utterances.
- El WER absoluto en dominios dificiles sigue siendo moderado (14-15 %), por lo que la transcripcion requiere revision humana en contextos regulatorios o de auditoria.
- Sin informacion sobre sesgos, composicion del dataset de entrenamiento, procedencia de los datos ni mecanismos de alineacion.
- Modelo recien publicado (6 de noviembre de 2026) con 0 descargas y 0 likes en Hugging Face: sin validacion de la comunidad ni historial de produccion.
- Dependencia de red y de la disponibilidad del endpoint `https://www.bargo.ai/v1` para cualquier caso de uso en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextGig/bargo-finance-realtime-v1
- Dataset de evaluacion: https://huggingface.co/datasets/NextGig/FinASR-Bench
- Pagina del producto y obtencion de API key: https://www.bargo.ai/transcribe
- Endpoint base de la API: https://www.bargo.ai/v1
