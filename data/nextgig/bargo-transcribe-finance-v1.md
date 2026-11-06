# NextGig/bargo-transcribe-finance-v1

## Resumen

Bargo Transcribe Finance v1 es un modelo propietario de reconocimiento automatico del habla (ASR) con atribucion de hablantes, desarrollado por Bargo AI y distribuido exclusivamente como API alojada en su infraestructura de inferencia en Estados Unidos. Esta especializado en audio financiero: llamadas de resultados corporativos (earnings calls), conferencias de inversores institucionales, comentario macroeconomico del FOMC, podcasts financieros y llamadas de pipeline clinico de biofarmacia. El modelo no se publica como pesos descargables; la model card lo presenta como un servicio accesible mediante compatibilidad con el SDK oficial de OpenAI.

La propuesta de valor se centra en tres ejes: precision en terminologia financiera (3,92 % de WER medio en OpenASR, con 2,38 % en SPGISpeech Corporate Finance), reconocimiento exacto de tickers bursatiles pronunciados (100,0 % de coincidencia exacta de caso, 0,43 % de WER) y atribucion de hablantes con un 99,0 % de recall sobre un roster verificado de 201 ejecutivos y analistas en 16 earnings calls trimestrales retenidas. A esto se anade un precio de 0,10 USD por hora de audio, entre un 62 % y un 73 % inferior al de Deepgram Nova-3, OpenAI gpt-4o-transcribe y AssemblyAI Universal-2 segun los datos del propio autor.

El modelo es relevante ahora porque ataca un nicho concreto del ASR financiero donde los modelos generalistas fallan de forma sistematica: la transcripcion literal de tickers, la desambiguacion de nombres de ejecutivos y la preservacion de cifras en contextos de habla rapida y solapada. Su integracion como sustituto directo de la API de OpenAI reduce el coste de migracion a un cambio de `base_url`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo propietario servido via API; la model card no describe la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa audio por fragmentos; soporta SSE por chunks de forma concurrente) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | ingles (en) |
| Licencia | bargo-proprietary-api (licencia propia, enlace: https://www.bargo.ai/transcribe) |
| Formato de pesos | no disponible (solo acceso via API HTTP; sin safetensors ni GGUF publicados) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo: no se especifica si se trata de un transformer encoder-decoder, un modelo tipo Whisper fine-tuneado, un Conformer o una arquitectura hibrida. Tampoco se publican el numero de parametros, la composicion del dataset de entrenamiento ni el volumen de horas de audio utilizadas. Lo que si se documenta es el benchmark de evaluacion propio, `NextGig/FinASR-Bench`, y el conjunto de pruebas estandar OpenASR, sobre los que se reportan los resultados de la seccion de benchmarks.

La innovacion tecnica destacable, segun el autor, es la combinacion de tres componentes: un motor de reconocimiento de entidades financieras con un catalogo de 50.000 entidades (6,04 % de WER y 75,8 % de recall), un modulo de diarizacion orientado a rosters de ejecutivos y analistas del sell-side, y un modo de reconocimiento de tickers hablados que alcanza coincidencia exacta de caso en el 100 % de los casos de prueba. El modelo se sirve en modo batch de alto throughput, con un factor de tiempo real concurrente de 25,3x, y soporta streaming por Server-Sent Events en fragmentos. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en ingles con enfasis en dominio financiero.
- Diarizacion de hablantes con atribucion a ejecutivos y analistas del sell-side (99,0 % de recall en el roster de prueba).
- Reconocimiento exacto de tickers bursatiles pronunciados (100,0 % de coincidencia de caso).
- Reconocimiento de entidades financieras contra un catalogo de 50.000 entidades.
- Formatos de respuesta multiples: `json`, `verbose_json`, `text`, `srt` y `vtt`.
- Entrada de audio por fichero multipart o por URL remota (`audio_url`).
- Compatibilidad directa con el SDK oficial de OpenAI (Python y TypeScript) mediante cambio de `base_url`.
- Endpoint complementario de chat completions (`/v1/chat/completions`) para flujos posteriores a la transcripcion.
- Procesamiento batch de alto throughput (25,3x RTF concurrente) y streaming por chunks SSE.
- No se documentan capacidades de vision, audio generation, tool calling ni razonamiento multi-paso mas alla del endpoint de chat compatible.

## Casos de uso

- Archivo y cumplimiento de earnings calls trimestrales: el modelo transcribe llamadas completas con diarizacion y atribucion nominal, lo que permite generar actas auditables con identificacion de cada interviniente. Es adecuado por su recall del 99,0 % sobre rosters de ejecutivos y analistas y por el soporte de `srt`/`vtt` para revision humana.
- Investigacion de inversion y generacion de notas: a partir de la transcripcion con marcas de tiempo y hablante, un analista puede extraer citas textuales de management y preguntas de analistas. El reconocimiento exacto de tickers evita errores en la identificacion de companias mencionadas.
- Indexacion y busqueda de podcasts financieros: el modo batch de alto throughput (25,3x RTF) permite procesar catalogos completos de episodios, y el catalogo de 50.000 entidades mejora la recuperacion de nombres de companias e instrumentos.
- Monitorizacion de comentario macroeconomico del FOMC: la transcripcion de ruedas de prensa y comparecencias con formato `verbose_json` permite conservar duraciones y segmentos para analisis posterior de lenguaje y tono.
- Transcripcion de llamadas de pipeline clinico de biofarmacia: el modelo esta etiquetado para ASR clinico y financiero, lo que lo hace util para llamadas de resultados de ensayos donde la precision de nombres de farmacos y terminos regulatorios es critica.
- Sustitucion directa en pipelines existentes de OpenAI: cualquier codigo que use `client.audio.transcriptions.create` puede apuntar a `https://www.bargo.ai/v1` cambiando solo la clave y el `base_url`, lo que reduce el coste por hora de audio de 0,36 a 0,10 USD segun el autor.
- Captioning de conferencias de inversores institucionales: el soporte de streaming SSE por chunks permite emitir subtitulos durante el evento con latencia inferior a la del modo batch completo.

## Benchmarks y rendimiento

Datos reportados por el autor del modelo en la model card (no verificados de forma independiente):

| Modelo | OpenASR WER medio | SPGISpeech (finanzas corporativas) | LibriSpeech test-clean | LibriSpeech test-other | Tickers hablados (exacto) | Catalogo 50k entidades (WER) | Precio / hora |
|---|---|---|---|---|---|---|---|
| bargo/transcribe-finance-v1 | 3,92 % | 2,38 % | 1,48 % | 2,66 % | 100,0 % (0,43 % WER) | 6,04 % (75,8 % recall) | 0,10 USD |
| bargo/finance-realtime-v1 (88 ms) | no disponible | no disponible | no disponible | no disponible | 87,5 % (4,76 % WER) | 10,70 % (59,5 % recall) | 0,05 USD |
| Deepgram Nova-3 | 4,13 % | 2,95 % | 1,83 % | 3,90 % | 67,5 % (9,96 % WER) | 13,26 % | 0,26 USD |
| AssemblyAI Universal-2 | 4,18 % | 3,10 % | 1,60 % | 3,10 % | 70,0 % | no disponible | 0,37 USD |
| Microsoft MAI-Transcribe-1 | 4,34 % | 3,20 % | 1,75 % | 3,40 % | 72,5 % | no disponible | 0,10 USD |
| OpenAI gpt-4o-transcribe | 4,65 % | 3,50 % | 1,90 % | 3,60 % | 75,0 % | no disponible | 0,36 USD |
| OpenAI Whisper Large-v3 | 5,19 % | 3,92 % | 1,84 % | 3,68 % | 65,0 % | no disponible | 0,36 USD |

Ademas, el autor reporta un WER de 4,95 % en el holdout de earnings calls limpias para este modelo, frente al 11,25 % de su variante en tiempo real.

## Requisitos de hardware

- VRAM estimada para inferencia local: no aplica; el modelo no se distribuye como pesos y solo esta disponible como API alojada.
- GPU recomendadas: no disponibles; la infraestructura de inferencia la gestiona Bargo AI en Estados Unidos.
- Compatibilidad con GPU de consumo: no aplica, al no existir pesos descargables.
- Opciones de despliegue: exclusivamente via API HTTP en `https://www.bargo.ai/v1/audio/transcriptions` y `https://www.bargo.ai/v1/chat/completions`, con SDK de OpenAI (Python o TypeScript) o `curl`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: modo batch con 25,3x RTF concurrente; streaming por chunks SSE. La variante hermana `bargo/finance-realtime-v1` reporta 88 ms extremo a extremo (80 ms de frame mas menos de 10 ms de computo), pero esos datos no corresponden a este modelo.

## Comparativa con modelos similares

| Criterio | bargo/transcribe-finance-v1 | Deepgram Nova-3 | OpenAI gpt-4o-transcribe | AssemblyAI Universal-2 |
|---|---|---|---|---|
| Tipo de acceso | API propietaria | API propietaria | API propietaria | API propietaria |
| Parametros | no disponible | no disponible | no disponible | no disponible |
| Contexto de audio | no disponible (chunks SSE) | no disponible | no disponible | no disponible |
| WER OpenASR medio | 3,92 % | 4,13 % | 4,65 % | 4,18 % |
| Tickers hablados (exacto) | 100,0 % | 67,5 % | 75,0 % | 70,0 % |
| Diarizacion | Si, con roster de ejecutivos y analistas | Si (no especificado para finanzas) | No documentada en la comparativa | Si (no especificada para finanzas) |
| Idioma | Ingles | Multiples | Multiples | Multiples |
| Licencia | bargo-proprietary-api | Propietaria | Propietaria | Propietaria |
| Precio por hora de audio | 0,10 USD | 0,26 USD | 0,36 USD | 0,37 USD |

## Limitaciones y advertencias

- Modelo propietario sin pesos publicados: no es posible auditar el modelo, ejecutarlo en local ni desplegarlo en infraestructura propia. Toda inferencia pasa por los servidores de Bargo AI en Estados Unidos.
- Solo soporta ingles; no se documenta cobertura multilingue.
- Los benchmarks son reportados por el autor y no se han verificado de forma independiente. El conjunto `FinASR-Bench` es de creacion propia, lo que introduce un sesgo potencial de seleccion.
- La licencia `bargo-proprietary-api` restringe el uso a traves de la API de pago; no se detallan condiciones de uso comercial, redistribucion de transcripciones ni retencion de datos de audio.
- Riesgo de alucinacion en terminos financieros: aunque el catalogo de entidades mitiga errores en nombres y tickers, un WER del 6,04 % en el catalogo de 50.000 entidades implica que aproximadamente una de cada diecisiete menciones puede contener errores, lo que exige revision humana en contextos de cumplimiento normativo.
- El recall de diarizacion del 99,0 % se ha medido sobre 16 earnings calls y un roster de 201 personas; el rendimiento puede degradarse con hablantes fuera de ese roster, acentos no nativos o solapamiento de voces.
- No hay informacion publica sobre sesgos demograficos, de acento o de genero en el modelo.
- La disponibilidad del servicio depende de un proveedor unico; no se documentan SLA, politica de retencion de audio ni cumplimiento de normativas sectoriales (por ejemplo, MiFID II o HIPAA) mas alla del etiquetado clinico.
- El endpoint de chat completions asociado no se detalla en la model card; se desconoce que modelo lo sirve y con que garantias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextGig/bargo-transcribe-finance-v1
- Pagina de producto y solicitud de clave API: https://www.bargo.ai/transcribe
- Enlace de licencia: https://www.bargo.ai/transcribe
- Endpoint de benchmarks en vivo: https://www.bargo.ai/v1/benchmarks
- Dataset de evaluacion: https://huggingface.co/datasets/NextGig/FinASR-Bench
- Endpoint de transcripcion: https://www.bargo.ai/v1/audio/transcriptions
- Endpoint de chat completions: https://www.bargo.ai/v1/chat/completions
