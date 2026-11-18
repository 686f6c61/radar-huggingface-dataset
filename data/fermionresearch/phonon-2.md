# FermionResearch/Phonon-2

## Resumen

Phonon-2 es un modelo de reconocimiento automatico del habla (ASR) para ingles desarrollado por FermionResearch, derivado por cuantizacion del modelo NVIDIA parakeet-tdt-0.6b-v3. Su propuesta central es la eficiencia extrema: con una descarga de 164 MB (frente a los 2.508 MB del modelo base en precision completa) alcanza un error de palabra medio del 5,21 % en los siete conjuntos en ingles del Open ASR Leaderboard, manteniendo practicamente la precision del original.

El modelo emplea la arquitectura Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, con 0,6 mil millones de parametros, adaptada para ejecucion en el ecosistema MLX de Apple Silicon y tambien distribuida en variantes Core ML, CPU para Linux/Windows y Android arm64. Esta orientado a transcripcion en dispositivo (on-device) y a despliegues de alto rendimiento en servidor.

Es relevante ahora porque demuestra que una cuantizacion agresiva bien ejecutada puede reducir el peso del modelo unas 15 veces sin sacrificar de forma significativa la calidad ASR, lo que habilita dictado y transcripcion local en hardware de consumo con latencias muy bajas (174x tiempo real en un MacBook Air con M5).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), derivada de nvidia/parakeet-tdt-0.6b-v3 |
| Parametros totales | 0,6 mil millones (modelo base); el artefacto cuantizado ocupa 164 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion propietaria del autor (formato MLX); variantes Core ML y CPU; niveles concretos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 (pesos); codigo de linea de comandos y repositorio Apache 2.0 |
| Formato de pesos | MLX (libreria mlx); variantes Core ML y librerias CPU para Android/Linux/Windows |

## Arquitectura y entrenamiento

Phonon-2 no es un modelo entrenado desde cero, sino una cuantizacion del transducer Parakeet TDT 0.6B v3 de NVIDIA. La arquitectura TDT combina un encoder acustico con un decoder transducer que predice conjuntamente tokens y duraciones, lo que permite emision variable en el tiempo y buena eficiencia en transcripcion. El tokenizer y las convenciones de salida (puntuacion, mayusculas, numerales) son los del modelo original.

No se dispone de informacion sobre el proceso de cuantizacion (calibracion, dataset, numero de bits) ni sobre datos de entrenamiento adicionales. El modelo base fue entrenado por NVIDIA; FermionResearch documenta los cambios en el fichero NOTICE del repositorio. La innovacion principal es la relacion tamano/precision: 164 MB con un WER medio de 5,21 % frente a 4,96 % del modelo completo de 2.508 MB.

## Capacidades

- Transcripcion de voz a texto en ingles con puntuacion, mayusculas y numerales.
- Salida con marcas de tiempo por palabra mediante la opcion `--json`.
- Ejecucion en dispositivo en Apple Silicon (MLX), Neural Engine (Core ML), CPU x86-64 y Arm, y Android arm64-v8a (API 26+).
- Despliegue en servidor con Docker sobre CPU y GPU CUDA.
- Procesamiento por lotes de alto rendimiento (hasta 6.680x tiempo real en una H100 con lotes de 128).
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes.

## Casos de uso

- Dictado en Mac: integrado en la aplicacion Detta de FermionResearch, permite transcripcion local en tiempo real sin enviar audio a la nube, gracias a su tamano de 164 MB y su velocidad en Apple Silicon.
- Transcripcion de reuniones: obtiene 9,37 % de WER en AMI, ligeramente mejor que el modelo base (9,42 %), lo que lo hace adecuado para actas y resumenes de reuniones en ingles.
- Subtitulado y postproduccion: la salida JSON con tiempos de inicio y fin por palabra facilita la generacion de subtitulos sincronizados en pipelines de video.
- Procesamiento masivo por lotes: en una H100 procesa audio a 6.680x tiempo real, util para indexar archivos de audio historicos o transcripciones a gran escala.
- Aplicaciones moviles Android: las librerias CPU arm64 permiten ASR offline en dispositivos moviles sin conexion.
- Servicios de atencion al cliente: transcripcion de llamadas en tiempo real en servidores CPU (143x tiempo real en 8 nucleos Zen 5) para analitica y cumplimiento.
- Investigacion en ASR eficiente: referencia para estudiar el impacto de la cuantizacion en transducers.

## Benchmarks y rendimiento

Resultados de WER (%) en el Open ASR Leaderboard (menor es mejor):

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---|---|---|---|---|---|---|---|---|
| Phonon-2 | 164 MB | 1,72 | 3,92 | 9,37 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Parakeet TDT 0.6B v3 (base) | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,19 | 4,96 |
| Parakeet Redux | 178 MB | 1,94 | 4,35 | 9,16 | 7,90 | 8,62 | 4,01 | 3,87 | 5,69 |
| Phonon-1 | 415 MB | 2,11 | 5,03 | 10,31 | 12,34 | 8,73 | 3,67 | 3,73 | 6,56 |
| Canary 180M Flash | 737 MB | 1,52 | 3,42 | 12,09 | 8,33 | 8,87 | 2,04 | 3,57 | 5,69 |
| Voxtral Mini 4B Realtime | ~8.000 MB | 1,62 | 4,94 | 13,34 | 9,31 | 8,80 | 2,23 | 2,60 | 6,12 |
| Whisper large-v3-turbo | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |
| Nemotron 3.5 ASR Streaming 0.6B | 2.368 MB | 2,83 | 6,79 | 13,43 | 15,30 | 9,86 | 3,27 | 4,24 | 7,96 |

Rendimiento declarado: 174x tiempo real en MacBook Air M5, 143x en 8 nucleos Zen 5 (16 vCPU) y 6.680x en una H100 con lotes de 128.

## Requisitos de hardware

- VRAM/RAM: el artefacto pesa 164 MB, por lo que cabe en practicamente cualquier dispositivo; la RAM de trabajo depende del buffer de audio y del lote.
- Apple Silicon: ejecucion nativa via MLX (MacBook Air M5 a 174x tiempo real) y via Core ML en el Neural Engine.
- CPU: funciona en x86-64 y Arm en Linux y Windows; 143x tiempo real en 8 nucleos Zen 5.
- GPU: soporte CUDA mediante contenedor Docker `phonon-cuda`; 6.680x tiempo real en H100 con lotes de 128. No se documentan requisitos minimos de VRAM.
- Movil: Android arm64-v8a (API 26+) con librerias CPU.
- Despliegue: paquete `fermion-research` (PyPI), linea de comandos `phonon`/`fermion`, servidor documentado, imagenes Docker `phonon-cpu` y `phonon-cuda`.
- Latencia y throughput: los valores anteriores; no se publican latencias por segmento individual.

## Comparativa con modelos similares

| Modelo | Parametros | Descarga | WER medio | Idiomas | Licencia |
|---|---|---|---|---|---|
| Phonon-2 | 0,6 B (cuantizado) | 164 MB | 5,21 | en | CC-BY-4.0 |
| Parakeet TDT 0.6B v3 | 0,6 B | 2.508 MB | 4,96 | en | CC-BY-4.0 |
| Whisper large-v3-turbo | ~0,8 B | 1.618 MB | 6,58 | multilingue | MIT/Apache (segun variante) |
| Canary 180M Flash | 0,18 B | 737 MB | 5,69 | en | no disponible en esta ficha |

Phonon-2 ofrece la mejor relacion entre tamano y precision de la tabla, con la salvedad de estar limitado al ingles y de heredar las convenciones del modelo de NVIDIA.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- La precision es ligeramente inferior al modelo base en la mayoria de conjuntos (5,21 % frente a 4,96 % de media), con mayor degradacion en Earnings-22 y LS other.
- No se documentan sesgos especificos; al derivar de un modelo de NVIDIA, hereda los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion y errores en audio con ruido, acentos no representados o vocabulario tecnico.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; el codigo de la CLI y del repositorio es Apache 2.0.
- El proceso de cuantizacion no esta documentado en detalle, lo que dificulta reproducir o auditar el artefacto.
- La longitud de contexto de audio no esta especificada; conviene validar en produccion con grabaciones largas.

## Enlaces

- Hugging Face: https://huggingface.co/FermionResearch/Phonon-2
- Variante Core ML: https://huggingface.co/FermionResearch/Phonon-2-CoreML
- Documentacion: https://www.fermionresearch.com/docs/speech/
- Producto Detta: https://www.fermionresearch.com/products/detta
- Paquete PyPI: https://pypi.org/project/fermion-research/
- Librerias Android: https://github.com/fermionresearch/phonon/releases/tag/android-arm64-v8a-0.2.11
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
