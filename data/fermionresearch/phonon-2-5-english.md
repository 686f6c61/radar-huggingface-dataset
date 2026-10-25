# FermionResearch/Phonon-2.5-English

## Resumen

Phonon-2.5 English es un modelo de reconocimiento automático del habla (ASR) para inglés distribuido en un único checkpoint de 157,6 MB, desarrollado por FermionResearch a partir de `nvidia/parakeet-tdt-0.6b-v3` mediante cuantización de baja precisión. Su objetivo es ofrecer transcripción de alta exactitud en un tamaño manejable que se ejecuta tanto en Apple Silicon (vía MLX) como en CPU de Linux y Windows, sin necesidad de GPU. Según la model card, promedia un 4,82 % de WER en los siete conjuntos en inglés del Open ASR Leaderboard, frente al 4,94 % de Underdog Bark 3.0 y el 5,21 % de Phonon-2.

El modelo existe porque determinados flujos de trabajo (dictado, subtitulado, cumplimiento normativo, indexación de búsqueda) solo necesitan inglés, y en ese régimen se obtiene más precisión que con la variante multilingüe de la misma familia. Frente a Phonon-2.5 multilingüe (25 idiomas, 156,2 MB), esta versión gana en promedio (4,82 % frente a 5,06 %) y empata en SPGISpeech (3,31 %), aunque pierde en VoxPopuli (2,28 % frente a 3,23 %).

La relevancia actual viene de la combinación de tres factores: tamaño de descarga inferior a 160 MB, ejecución en hardware sin acelerador dedicado y una licencia CC-BY-4.0 heredada del modelo base que permite uso comercial con atribución. La ficha se centra en los benchmarks publicados por el autor; no se han divulgado detalles del esquema exacto de cuantización ni de la composición del dataset de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del tipo Token-and-Duration Transducer (TDT), heredada de `nvidia/parakeet-tdt-0.6b-v3`; checkpoint cuantizado de baja precisión |
| Parametros totales | 0,6 B en el modelo base (NVIDIA Parakeet TDT 0.6B v3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; al ser un modelo ASR no se publica ventana de contexto en tokens ni límite de duración de audio |
| Tipos de cuantizacion | Cuantización de baja precisión ("low-bit"); el esquema exacto no se detalla. El tag del repositorio `parakeet_tdt_five_value` sugiere una cuantización de cinco valores. Descarga de 157,6 MB para 0,6 B de parámetros, equivalente a ~2,1 bits por parámetro (cálculo derivado, no publicado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 (la misma del modelo original); el código del repositorio y la CLI son Apache 2.0 |
| Formato de pesos | Pesos para la librería MLX (`library_name: mlx`); no se especifica si los ficheros son safetensors. Tamaño total del repositorio: 0,3 GB |
| Pipeline | `automatic-speech-recognition` |
| Modelo base | `nvidia/parakeet-tdt-0.6b-v3` (relación: `quantized`) |
| Fecha de creacion (HF) | 2026-10-22 |
| Ultima actualizacion (HF) | 2026-10-24 |
| Descargas / likes | 171 descargas, 13 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA Parakeet TDT 0.6B v3, un esquema transducer que predice conjuntamente el token de salida y su duración, lo que permite emitir varios tokens por paso de decodificación y reduce el coste de inferencia frente a los transductores clásicos. FermionResearch no reentrena el modelo: aplica una cuantización de baja precisión sobre los pesos originales y conserva el tokenizador y las convenciones de salida del modelo base (puntuación, uso de mayúsculas y normalización de numerales).

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO; tampoco se detalla el algoritmo de cuantización, el número de bits efectivos ni si se aplicó calibración posterior. El único dato verificable sobre el proceso es la relación declarada con el modelo base (`base_model_relation: quantized`) y la existencia de un fichero `NOTICE` que enumera los cambios respecto al original.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación, mayúsculas y numerales normalizados, manteniendo las convenciones de salida del modelo Parakeet original.
- Salida con marcas temporales a nivel de palabra mediante la opción `--json`, que añade hora de inicio y de fin a cada palabra.
- Ejecución en Apple Silicon acelerada por GPU a través de MLX (`pip install "fermion-research[mlx]"`).
- Ejecución en CPU en Linux (x86-64 y Arm) y Windows con el mismo paquete y el mismo fichero de pesos.
- Servidor compatible con la API de OpenAI: `fermion serve phonon-2.5-en --port 8010` expone `/v1/audio/transcriptions`, lo que permite sustituir un backend de transcripción existente sin cambiar el cliente.
- Interfaz de línea de comandos: `fermion transcribe phonon-2.5-en recording.wav`.
- No soporta tool calling, razonamiento multi-paso, agentes, visión, audio generativo ni traducción: es exclusivamente un modelo ASR de un solo idioma.

## Casos de uso

- Dictado en macOS: al ejecutarse sobre MLX en Apple Silicon con un checkpoint de 157,6 MB, la transcripción puede correr localmente en un Mac sin GPU dedicada y sin enviar audio a servicios externos, lo que simplifica el cumplimiento de privacidad.
- Subtitulado automático de vídeo: la salida `--json` con tiempos de inicio y fin por palabra permite generar subtítulos con sincronización fina, útil en pipelines de postproducción donde no se quiere depender de APIs de pago.
- Indexación y búsqueda de archivos de audio: transcripción por lotes en CPU sobre grandes volúmenes de grabaciones en inglés, con un coste por hora bajo al no requerir acelerador, para alimentar un índice de búsqueda full-text.
- Actas de reuniones y notas de voz: con un WER de 8,76 % en AMI (audio de reuniones multiparte), el modelo es aprovechable para resúmenes y búsqueda interna, aunque conviene revisar entidades y nombres propios.
- Transcripción de llamadas de resultados financieros: en Earnings-22 obtiene 6,22 % de WER y en SPGISpeech 3,31 %, los dos conjuntos con terminología corporativa y cifras, lo que lo hace apto para actas de earnings calls con revisión posterior.
- Registro y auditoría de atención al cliente: despliegue del endpoint compatible con OpenAI detrás de un servicio interno para transcribir conversaciones y aplicar controles de cumplimiento sobre texto en inglés.
- Prototipado rápido en equipos sin infraestructura GPU: al instalarse con `pip install fermion-research` y requerir solo Python 3.10 o superior, sirve para validar productos de voz en portátiles antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %), menor es mejor. Resultados publicados en la model card; la fila de Parakeet TDT 0.6B v3 corresponde a la publicada por el Open ASR Leaderboard.

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Phonon-2.5 English | 157,6 MB | 1,64 | 3,56 | 8,76 | 6,22 | 7,99 | **3,31** | 2,28 | **4,82** |
| Phonon-2.5 (25 idiomas) | 156,2 MB | 1,60 | 3,41 | 9,12 | 6,72 | 8,04 | **3,31** | 3,23 | 5,06 |
| Phonon-2 | 158 MB | 1,72 | 3,92 | 9,37 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Underdog Bark 3.0 | 163 MB | 1,89 | 4,08 | **7,82** | 7,05 | **7,95** | 3,72 | **2,05** | 4,94 |
| Parakeet TDT 0.6B v3 | 2.508 MB | **1,52** | **3,13** | 9,42 | **5,85** | 7,99 | 3,63 | 3,19 | 4,96 |
| Parakeet Redux | 178 MB | 1,94 | 4,35 | 9,16 | 7,90 | 8,62 | 4,01 | 3,87 | 5,69 |

No se han publicado datos de latencia, throughput (factor de tiempo real) ni consumo de memoria en la información disponible.

## Requisitos de hardware

- No requiere GPU. El mismo fichero de pesos se ejecuta en Apple Silicon (GPU vía MLX) y en CPU de Linux x86-64, Linux Arm y Windows.
- VRAM: no aplica en el caso de CPU. En Apple Silicon, los pesos (157,6 MB) residen en memoria unificada; el consumo total del proceso depende de los buffers de audio y del runtime, no publicado por el autor. Como referencia de orden de magnitud, un checkpoint de 157,6 MB implica un uso de memoria de cientos de MB, no de GB.
- GPU recomendadas: no se documenta ningún backend CUDA, ROCm ni Vulkan; el paquete no usa GPU en Linux ni en Windows.
- Cabe en cualquier equipo consumer: Mac con Apple Silicon para la ruta acelerada, y portátiles o servidores modestos con CPU para la ruta sin acelerador.
- Opciones de despliegue: paquete `fermion-research` (CLI `fermion transcribe` y servidor `fermion serve` con endpoint `/v1/audio/transcriptions` compatible con OpenAI). En Linux conviene instalar antes la rueda de CPU de PyTorch (`pip install --no-deps torch --index-url https://download.pytorch.org/whl/cpu`) para evitar la build con GPU.
- Integración con vLLM, llama.cpp, Ollama o TGI: no soportada; son runtimes para modelos generativos y este es un modelo ASR transducer.
- Latencia y throughput estimados: no disponibles. El autor no publica factor de tiempo real ni métricas de rendimiento por hardware.
- Requisito de entorno: Python 3.10 o superior (el `python3` del sistema en macOS es 3.9 y no sirve sin actualizar).

## Comparativa con modelos similares

| Modelo | Parámetros | Descarga | Idioma | WER medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phonon-2.5 English | 0,6 B (cuantizado) | 157,6 MB | Inglés | 4,82 % | CC-BY-4.0 | HuggingFace, paquete `fermion-research` |
| Phonon-2.5 | 0,6 B (cuantizado) | 156,2 MB | 25 idiomas | 5,06 % | no disponible | HuggingFace |
| Phonon-2 | no disponible | 158 MB | no disponible | 5,21 % | no disponible | HuggingFace |
| Underdog Bark 3.0 | no disponible | 163 MB | Inglés | 4,94 % | no disponible | no disponible |
| Parakeet TDT 0.6B v3 | 0,6 B | 2.508 MB | no disponible | 4,96 % | CC-BY-4.0 (heredada por Phonon) | HuggingFace (NVIDIA) |
| Parakeet Redux | no disponible | 178 MB | no disponible | 5,69 % | no disponible | no disponible |

Lectura de la comparativa: frente a su modelo base sin cuantizar, Phonon-2.5 English reduce el tamaño de descarga unas 16 veces (2.508 MB frente a 157,6 MB) a cambio de 0,14 puntos de WER medio, y mejora en AMI (-0,66), VoxPopuli (-0,91) y SPGISpeech (-0,32). Frente a Underdog Bark 3.0, gana en media, LS clean, LS other, Earnings-22 y SPGISpeech, y pierde en AMI (8,76 frente a 7,82), GigaSpeech (7,99 frente a 7,95) y VoxPopuli (2,28 frente a 2,05).

## Limitaciones y advertencias

- Solo inglés. Cualquier audio en otro idioma requiere Phonon-2.5 (25 idiomas) u otro modelo; no hay detección ni traducción automática de idioma.
- El WER en audio de reuniones es notablemente peor que en lectura limpia: 8,76 % en AMI frente a 1,64 % en LibriSpeech clean. En entornos ruidosos o con solapamiento de hablantes la calidad cae de forma acusada.
- Riesgo de alucinación inherente a los modelos transducer en segmentos con silencio prolongado, ruido o música: pueden emitirse tokens espurios. No hay en la información disponible ningún mecanismo de detección de silencio ni de confianza por palabra.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. Además debe conservarse la atribución a NVIDIA como modelo base; el fichero `NOTICE` documenta los cambios. El código de la CLI y del repositorio es Apache 2.0, licencia distinta de la de los pesos.
- Al derivar del modelo original, hereda su tokenizador y sus convenciones de salida; no se puede personalizar la puntuación o el formato sin postprocesado externo.
- No hay backend GPU fuera de Apple Silicon: en Linux y Windows la inferencia es por CPU, lo que limita el throughput en despliegues de alto volumen frente a alternativas con soporte CUDA.
- No se han publicado detalles del esquema de cuantización ni de la degradación esperada en dominios de audio alejados de los conjuntos de evaluación (por ejemplo, acentos no representados, audio telefónico de banda estrecha o jerga técnica).
- No se publican datos sobre sesgos demográficos, de acento o de género en el WER. La model card no incluye evaluación desagregada.
- Requiere Python 3.10 o superior; en macOS el intérprete del sistema (3.9) no es válido y hay que instalar uno más reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Variante multilingüe (25 idiomas): https://huggingface.co/FermionResearch/Phonon-2.5
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentación de la CLI y el servidor: https://www.fermionresearch.com/docs/speech/
- Paquete en PyPI: https://pypi.org/project/fermion-research/
- Open ASR Leaderboard (referencia de los resultados publicados): no disponible en la información proporcionada
- Paper técnico: no disponible en la información proporcionada

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
