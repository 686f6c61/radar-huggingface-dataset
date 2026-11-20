# FermionResearch/Phonon-2.5

## Resumen

Phonon-2.5 es un modelo de reconocimiento automatico del habla (ASR) multilingue para 25 idiomas, publicado por FermionResearch como una cuantizacion de bajos bits del modelo NVIDIA Parakeet TDT 0.6B v3. El artefacto completo ocupa 156,2 MB, frente a los 2.508 MB del modelo original en precision completa, lo que supone una reduccion de aproximadamente 16x en peso manteniendo la arquitectura TDT (Token-and-Duration Transducer) del original.

El modelo esta empaquetado en formato MLX para ejecucion nativa en Apple Silicon y, segun el autor, el mismo fichero funciona tambien en CPU sobre Linux y Windows sin necesidad de GPU. Esta orientacion on-device lo convierte en una opcion practica para transcripcion local, procesamiento por lotes en portatiles y despliegues en entornos sin acelerador dedicado.

Su relevancia actual reside en que supera en precision media a otras alternativas de tamano comparable: 11,71 % de WER medio en FLEURS frente a 12,18 % de Parakeet Redux y 13,26 % del modelo completo de NVIDIA. En ingles, sobre los siete conjuntos del Open ASR Leaderboard, promedia 5,06 % de WER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), derivada de NVIDIA Parakeet TDT 0.6B v3 |
| Parametros totales | 0,6 mil millones (modelo base); pesos cuantizados a bajos bits |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bajos bits (low-bit); esquema exacto no disponible |
| Idiomas soportados | 25: en, es, fr, de, it, pt, nl, pl, ru, uk, ro, cs, sk, bg, hr, sv, da, fi, et, lv, lt, hu, sl, mt, el |
| Licencia | CC-BY-4.0 (pesos); codigo del repositorio Apache 2.0 |
| Formato de pesos | MLX (libreria mlx); tamano del repo 0,3 GB |

## Arquitectura y entrenamiento

Phonon-2.5 no entrena desde cero: es una cuantizacion del modelo NVIDIA Parakeet TDT 0.6B v3, que emplea una arquitectura Token-and-Duration Transducer. Este diseno combina prediccion conjunta de tokens y duraciones, lo que permite emitir varios tokens por paso y mejorar la eficiencia de decodificacion frente a CTC o transducers clasicos. El tokenizador y las convenciones de salida (puntuacion, uso de mayusculas y numerales) se heredan del original.

No se dispone de informacion sobre el proceso de cuantizacion (algoritmo, granularidad, calibracion), ni sobre datos de entrenamiento, numero de tokens o ajustes posteriores como RLHF. El autor indica que el fichero `NOTICE` del repositorio documenta los cambios aplicados respecto al modelo base. El resultado es un artefacto de 156,2 MB que conserva el pipeline de ASR del original y se distribuye empaquetado para MLX.

## Capacidades

- Transcripcion de voz a texto multilingue en 25 idiomas europeos, con deteccion implicita de idioma segun el modelo base.
- Salida con puntuacion, uso de mayusculas y numerales segun las convenciones del tokenizador de Parakeet.
- Alineacion temporal a nivel de palabra mediante la opcion `--json`, que anade inicio y fin de cada palabra.
- Ejecucion on-device en Apple Silicon via MLX y en CPU sobre Linux (x86-64 y Arm) y Windows.
- Servidor compatible con el endpoint OpenAI `/v1/audio/transcriptions` mediante `fermion serve`.
- No se documentan capacidades de diarizacion de hablantes, traduccion, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripcion local de reuniones: el modelo procesa audio en el propio portatil Apple Silicon sin enviar datos a la nube, lo que encaja en entornos con requisitos de privacidad.
- Subtitulado y generacion de actas: la salida JSON con marcas temporales por palabra permite construir ficheros de subtitulos y alinear texto con audio en herramientas internas.
- Procesamiento por lotes de archivos de audio en servidores Linux sin GPU: al ejecutarse en CPU, puede integrarse en pipelines de ingestión documental donde no hay aceleradores disponibles.
- Atencion al cliente telefónica: la transcripcion de llamadas grabadas en varios idiomas europeos alimenta sistemas de analisis de calidad y busqueda sobre conversaciones.
- Investigacion linguistica y corpus: la cobertura de 25 idiomas, incluidos estonio, letón, maltés y griego, facilita la transcripcion de corpus multilingues a bajo coste computacional.
- Prototipado rapido con API compatible con OpenAI: `fermion serve` expone un endpoint estandar que permite sustituir un servicio ASR remoto por una instancia local durante desarrollo.
- Aplicaciones de accesibilidad: dictado y transcripcion en tiempo real en dispositivos de usuario final gracias al reducido tamano del artefacto (156,2 MB).

## Benchmarks y rendimiento

WER en %, menor es mejor; mejor valor por fila en negrita. Evaluacion sobre el conjunto de test completo de FLEURS por idioma, mismo harness y misma normalizacion de texto para los tres modelos.

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

En los siete conjuntos ingleses del Open ASR Leaderboard (LibriSpeech clean y other, AMI, Earnings-22, GigaSpeech, SPGISpeech y VoxPopuli, evaluados con su codigo sobre los test sets completos), Phonon-2.5 promedia 5,06 % de WER con los valores 1,60, 3,41, 9,12, 6,72, 8,04, 3,31 y 3,23. Para comparacion, Phonon-2 promedia 5,21 % y Phonon-2.5 English promedia 4,82 % en los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el artefacto pesa 156,2 MB, por lo que la huella en memoria es muy reducida. En Apple Silicon se ejecuta en GPU via MLX; en Linux y Windows se ejecuta en CPU.
- GPU recomendadas: no se especifican modelos concretos; el modelo esta disenado para Apple Silicon (MLX) y para CPU, no para GPU NVIDIA dedicada.
- Cabe en GPU consumer: si, en equipos Apple Silicon; no se documenta soporte para RTX, A100 o H100.
- Opciones de despliegue: paquete `fermion-research` (CLI `fermion transcribe`), servidor `fermion serve` con endpoint compatible con OpenAI `/v1/audio/transcriptions`; libreria MLX en macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Idiomas | WER medio FLEURS (25 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phonon-2.5 | 0,6 mil millones (cuantizado) | 156,2 MB | 25 | 11,71 % | CC-BY-4.0 | Hugging Face, MLX |
| Parakeet Redux | no disponible | 178 MB | no disponible en la informacion | 12,18 % | no disponible | no disponible |
| Parakeet TDT 0.6B v3 | 0,6 mil millones | 2.508 MB | 25 (segun modelo base) | 13,26 % | CC-BY-4.0 (segun autor) | Hugging Face (NVIDIA) |
| Phonon-2.5 English | 0,6 mil millones (cuantizado) | mismo tamano que Phonon-2.5 | ingles | 4,82 % (Open ASR Leaderboard ingles) | no disponible | Hugging Face |

## Limitaciones y advertencias

- El WER empeora de forma notable en idiomas de recursos medios y bajos: griego 20,83 %, esloveno 18,53 %, maltes 17,91 %, danes 18,20 % y lituano 17,94 %. No es adecuado para produccion en esos idiomas sin evaluacion propia.
- En 11 de los 25 idiomas queda por detras de Parakeet Redux, y en casi todos por detras del modelo completo de NVIDIA; la ventaja principal es el tamano, no la precision absoluta.
- La cuantizacion de bajos bits puede introducir degradaciones no medidas por el WER, como errores en nombres propios, cifras o puntuacion.
- Riesgo de alucinacion en audio con ruido, silencios largos o solapamiento de hablantes; no se documentan pruebas en esas condiciones.
- La licencia CC-BY-4.0 exige atribucion; el autor indica que el fichero `NOTICE` lista los cambios respecto al original. El codigo del repositorio es Apache 2.0, distinta de la licencia de los pesos.
- El soporte oficial esta orientado a MLX en Apple Silicon y a CPU en Linux y Windows; no hay integracion documentada con ecosistemas GPU como vLLM o TensorRT.
- No se dispone de informacion sobre sesgos demograficos o acentuales, ni sobre rendimiento en audio telefonico de 8 kHz o en dominios especializados.
- Dependencia del tokenizador y convenciones del modelo base de NVIDIA: cambios en dichas convenciones afectan a toda la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FermionResearch/Phonon-2.5
- Variante inglesa: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentacion del CLI y servidor: https://www.fermionresearch.com/docs/speech/
- Paquete PyPI: https://pypi.org/project/fermion-research/
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
