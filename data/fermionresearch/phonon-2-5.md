# FermionResearch/Phonon-2.5

## Resumen

Phonon-2.5 es un modelo de reconocimiento automatico del habla (ASR) multilingue publicado por FermionResearch, una version cuantizada a baja precision del modelo NVIDIA Parakeet TDT 0.6B v3. Se distribuye en un unico archivo de 156,2 MB y cubre 25 idiomas europeos, desde el ingles y el espanol hasta el griego, el maltes o el estonio. Su propuesta es clara: mantener la calidad de un modelo de 0,6 mil millones de parametros en un peso dos ordenes de magnitud menor, hasta el punto de que en la media de FLEURS supera al modelo completo del que deriva (11,71 % de WER frente a 13,26 %).

La relevancia practica esta en el despliegue: el mismo archivo funciona en GPU de Apple silicon a traves de MLX y en CPU de Linux (x86-64 y Arm) y Windows, sin necesidad de GPU. La libreria `fermion-research` expone tanto una CLI con marcas de tiempo por palabra como un servidor compatible con el endpoint `/v1/audio/transcriptions` de la API de OpenAI, lo que facilita sustituir servicios de transcripcion en la nube por inferencia local.

Tecnicamente es un transducer TDT (token-and-duration) cuantizado, con el tokenizador y las convenciones de salida del modelo original (puntuacion, mayusculas y numerales). La licencia es CC-BY-4.0, la misma que la del modelo base, mientras que la CLI y el codigo del repositorio son Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (token-and-duration transducer), variante `parakeet_tdt_five_value`; derivada de nvidia/parakeet-tdt-0.6b-v3 |
| Parametros totales | Aproximadamente 0,6 B en el modelo base; el numero exacto tras la cuantizacion no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Modelo ASR: la model card no especifica ventana maxima de audio ni estrategia de chunking |
| Tipos de cuantizacion | Cuantizacion de baja precision (low-bit); el ancho de bits concreto no se especifica. Existe una variante English del mismo tamano |
| Idiomas soportados | 25: en, es, fr, de, it, pt, nl, pl, ru, uk, ro, cs, sk, bg, hr, sv, da, fi, et, lv, lt, hu, sl, mt, el |
| Licencia | CC-BY-4.0 (pesos); CLI y codigo del repositorio, Apache 2.0 |
| Formato de pesos | MLX (`library_name: mlx`); el contenedor exacto de los pesos no se detalla en la model card |
| Tarea | Automatic speech recognition (pipeline `automatic-speech-recognition`) |
| Tamano de descarga | 156,2 MB (repositorio completo: 0,3 GB) |
| Salida | Texto con puntuacion, mayusculas y numerales del modelo original; marcas de tiempo por palabra con `--json` |
| Plataformas | Apple silicon (GPU via MLX), Linux x86-64 y Arm (CPU), Windows (CPU) |
| Metricas evaluadas | WER (FLEURS y Open ASR Leaderboard) |

## Arquitectura y entrenamiento

Phonon-2.5 no es un transformer autoregresivo al uso, sino un transducer TDT: un modelo que predice conjuntamente tokens y duraciones, lo que le permite emitir texto sin un decodificador de atencion separado y con una latencia adecuada para streaming. La etiqueta `parakeet_tdt_five_value` del repositorio identifica la variante concreta de la implementacion. El modelo es una cuantizacion de baja precision de NVIDIA Parakeet TDT 0.6B v3, y conserva el tokenizador y las convenciones de salida del original.

No se han publicado en la informacion disponible detalles sobre el proceso de cuantizacion (metodo, numero de bits, calibracion), el volumen o la composicion de los datos de entrenamiento del modelo base, ni sobre si hubo etapas de ajuste fino o preferencia. Tampoco se documenta ninguna innovacion adicional mas alla de la propia compresion: la contribucion declarada es conseguir que un modelo de 0,6 B funcione en 156,2 MB sin perder precision agregada frente al original.

## Capacidades

- Transcripcion de voz a texto en 25 idiomas europeos con un unico modelo y un unico archivo.
- Salida con puntuacion, mayusculas y numerales normalizados, heredada del modelo original.
- Marcas de tiempo a nivel de palabra mediante la opcion `--json`.
- Inferencia en local: GPU de Apple silicon via MLX o CPU en Linux y Windows, sin GPU dedicada.
- Servidor HTTP compatible con el endpoint `/v1/audio/transcriptions` de OpenAI (`fermion serve phonon-2.5 --port 8010`), lo que permite reutilizar clientes existentes.
- CLI para transcripcion directa de ficheros (`fermion transcribe phonon-2.5 recording.wav`).
- Cobertura amplia de lenguas de bajos recursos dentro del ambito europeo (maltes, esloveno, estonio, letrado), donde el modelo completo rinde mucho peor.
- No se documenta soporte de tool calling, agentes, diarizacion de hablantes ni traduccion.

## Casos de uso

- Transcripcion de reuniones en local: el modelo procesa audio en el propio portatil Apple silicon y devuelve texto con marcas de tiempo por palabra, lo que permite generar actas sincronizadas sin enviar el audio a un tercero.
- Subtitulado de video: el `--json` con inicio y fin de cada palabra alimenta directamente un pipeline de generacion de subtitulos (SRT/VTT) en 25 idiomas, util para contenido formativo o divulgativo europeo.
- Notas de voz y dictado en aplicaciones de escritorio: con 156,2 MB y ejecucion en CPU, el modelo se puede empaquetar dentro de una aplicacion de escritorio Linux o Windows sin dependencias de GPU.
- Sustitucion de ASR en la nube por un endpoint compatible con OpenAI: `fermion serve` expone la misma interfaz que los servicios comerciales, de modo que basta cambiar la URL base en el cliente para migrar a inferencia on-premise con cumplimiento de RGPD.
- Transcriptor para centros de contacto en lenguas minoritarias: el modelo cubre griego, maltes, esloveno o estonio con errores entre el 17 % y el 21 % de WER, frente a mas del 33 % del modelo completo en griego y maltes, lo que lo hace viable donde las alternativas no llegan.
- Indexacion y busqueda de archivos de audio corporativos: la transcripcion por lotes con marcas de tiempo permite segmentar y buscar dentro de horas de grabaciones archivadas.
- Prototipado rapido en investigacion: la instalacion via pip y el peso reducido permiten comparar resultados en FLEURS o en dominios propios sin aprovisionar hardware.

## Benchmarks y rendimiento

WER en FLEURS (%, menor es mejor). Los tres modelos se evaluaron sobre el conjunto de test completo de cada idioma con el mismo harness y la misma normalizacion de texto.

| Idioma | Phonon-2.5 (156,2 MB) | Parakeet Redux (178 MB) | Parakeet TDT 0.6B v3 (2.508 MB) |
|---|--:|--:|--:|
| Ingles | 6,58 | 7,32 | **6,53** |
| Espanol | 4,80 | 4,99 | **4,69** |
| Frances | 8,12 | 9,03 | **6,61** |
| Aleman | 6,67 | 7,57 | **5,96** |
| Italiano | 5,21 | 5,12 | **4,75** |
| Portugues | 6,53 | 6,44 | **6,27** |
| Neerlandes | 9,21 | 9,45 | **7,93** |
| Polaco | 10,20 | 10,19 | **8,55** |
| Ruso | 8,67 | 9,01 | **7,21** |
| Ucraniano | 7,89 | 8,05 | **7,27** |
| Rumano | **11,88** | 11,89 | 13,13 |
| Checo | **10,40** | 11,41 | 11,93 |
| Eslovaco | 8,89 | **8,17** | 9,72 |
| Bulgaro | 13,34 | **13,02** | 13,48 |
| Croata | 12,24 | **11,43** | 13,21 |
| Sueco | **14,53** | 14,70 | 15,44 |
| Danes | 18,20 | **17,91** | 19,05 |
| Finés | 12,02 | **11,84** | 13,08 |
| Estonio | 11,91 | **10,29** | 14,34 |
| Leton | 14,92 | **14,76** | 23,66 |
| Lituano | **17,94** | 18,05 | 21,68 |
| Hungaro | 15,45 | 15,81 | **15,38** |
| Esloveno | **18,53** | 18,88 | 24,70 |
| Maltes | 17,91 | **16,02** | 20,86 |
| Griego | **20,83** | 33,25 | 36,11 |
| **Media de 25** | **11,71** | 12,18 | 13,26 |

Open ASR Leaderboard (ingles, siete conjuntos, codigo y test completos del leaderboard):

| Conjunto | WER (%) |
|---|--:|
| LibriSpeech clean | 1,60 |
| LibriSpeech other | 3,41 |
| AMI | 9,12 |
| Earnings-22 | 6,72 |
| GigaSpeech | 8,04 |
| SPGISpeech | 3,31 |
| VoxPopuli | 3,23 |
| **Media** | **5,06** |

Referencia comparativa en el mismo leaderboard: Phonon-2 promedia 5,21 % y Phonon-2.5 English 4,82 %.

## Requisitos de hardware

- VRAM: no se publican cifras. El modelo no requiere GPU; en Apple silicon se ejecuta en la GPU via MLX.
- Almacenamiento: 156,2 MB de pesos (0,3 GB de repositorio); el entorno necesita Python 3.10 o superior.
- GPU recomendadas: no aplica en el sentido habitual. En Apple silicon, cualquier chip con soporte MLX; en Linux y Windows se usa el motor de CPU incluido en el paquete.
- Cabe en cualquier equipo de consumo: es un modelo de 156,2 MB pensado explicitamente para on-device.
- Despliegue: `pip install fermion-research` (con el extra `[mlx]` para GPU en Apple silicon) y la CLI `fermion transcribe`; servidor con `fermion serve phonon-2.5 --port 8010`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- En Linux conviene instalar primero torch desde el indice de wheels de CPU (`pip install --no-deps torch --index-url https://download.pytorch.org/whl/cpu`) para evitar la build con CUDA.
- Latencia y throughput: no disponibles. La model card no publica RTF ni velocidad de procesado.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | WER medio FLEURS (25 idiomas) | WER Open ASR (7 sets EN) | Licencia | Disponibilidad |
|---|---|--:|--:|--:|---|---|
| Phonon-2.5 | ~0,6 B cuantizado | 156,2 MB | **11,71 %** | 5,06 % | CC-BY-4.0 | HuggingFace, pip |
| Phonon-2.5 English | ~0,6 B cuantizado | 156,2 MB (mismo tamano) | No disponible (solo ingles) | 4,82 % | CC-BY-4.0 | HuggingFace |
| Parakeet Redux | No disponible | 178 MB | 12,18 % | No disponible | No disponible en la informacion | HuggingFace |
| Parakeet TDT 0.6B v3 | 0,6 B | 2.508 MB | 13,26 % | No disponible en la informacion | CC-BY-4.0 | HuggingFace (NVIDIA) |
| Phonon-2 | No disponible | No disponible | No disponible | 5,21 % | No disponible en la informacion | HuggingFace |

Phonon-2.5 es el mas pequeno de la comparativa y, a la vez, el de mejor media multilingue: gana a Parakeet Redux en 14 de los 25 idiomas y al modelo completo de NVIDIA en 12, con ventajas muy marcadas en griego (20,83 frente a 36,11), esloveno (18,53 frente a 24,70), letrado (14,92 frente a 23,66) y estonio (11,91 frente a 14,34). En las lenguas mayoritarias (frances, aleman, neerlandes, polaco) el modelo completo sigue siendo mejor.

## Limitaciones y advertencias

- El WER se dispara en varias lenguas: maltes 17,91 %, esloveno 18,53 %, danes 18,20 %, lituano 17,94 % y griego 20,83 %. En danes, maltes, eslovaco, croata, estonio, letrado, fines y bulgaro esta por detras de Parakeet Redux.
- En las lenguas con mas volumen de datos (frances, aleman, neerlandes, polaco, ruso) pierde entre 1,4 y 1,6 puntos de WER frente al modelo de 2,5 GB; para produccion en esos idiomas conviene evaluar el original.
- No se documenta comportamiento en audio largo, solapamiento de hablantes, ruido de fondo ni cambio de idioma dentro de una misma grabacion. Tampoco hay diarizacion.
- Riesgo de alucinacion e inserciones en silencios o musica: es un comportamiento conocido de los transducers, aunque no se cuantifica en la model card.
- Las marcas de tiempo por palabra no estan evaluadas con ninguna metrica publicada.
- Licencia CC-BY-4.0: el uso comercial esta permitido, pero exige atribucion. El fichero `NOTICE` del repositorio lista los cambios respecto al modelo base y debe conservarse.
- El codigo del repositorio y la CLI son Apache 2.0, pero esa licencia no cubre los pesos.
- Requiere Python 3.10 o superior; el `python3` del sistema en macOS (3.9) no sirve.
- El soporte de aceleracion esta limitado a Apple silicon via MLX; en Linux y Windows se ejecuta en CPU, sin backend CUDA documentado.
- La informacion de busqueda web disponible no aporta documentacion tecnica adicional (solo resultados genericos de LinkedIn), por lo que todo lo anterior procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FermionResearch/Phonon-2.5
- Variante en ingles: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentacion de la CLI y el servidor: https://www.fermionresearch.com/docs/speech/
- Paquete en PyPI: https://pypi.org/project/fermion-research/
- Imagen de la model card: https://huggingface.co/FermionResearch/Phonon-2.5/resolve/main/phonon-2.5-card.jpg
