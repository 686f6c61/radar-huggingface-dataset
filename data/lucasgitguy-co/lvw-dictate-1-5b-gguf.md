# Lucasgitguy-co/LvW-Dictate-1.5B-GGUF

## Resumen

LvW-Dictate-1.5B (GGUF) es un paquete de inferencia para dictado por voz publicado por Lucasgitguy-co. No es un unico modelo, sino una composicion de dos: Phonon-2.5, un modelo de reconocimiento automatico del habla (ASR) de 0,6B parametros derivado de NVIDIA parakeet-tdt-0.6b-v3 y distribuido por Fermion Research, y LvW-Dictate-Cleanup-0.9B, un modelo de lenguaje de 0,9B parametros que elimina muletillas, repeticiones, falsos arranques y autocorrecciones de transcripciones en ingles. El repositorio empaqueta ambos en formato GGUF junto con el script `dictate_gguf.py`, que encadena la salida del primero a la entrada del segundo.

El problema que resuelve es practico: ningun runtime unico ejecuta a la vez un modelo Parakeet (ASR) y un modelo de lenguaje, por lo que el autor distribuye dos ficheros GGUF separados y un script de orquestacion que solo requiere la biblioteca estandar de Python. Phonon-2.5 aporta transcripcion en 25 idiomas; el modelo de limpieza opera unicamente sobre transcripciones en ingles. El conjunto esta pensado para dictado local en equipos de consumo.

La relevancia actual reside en la eficiencia: con cuantizacion Q8_0, los dos ficheros suman aproximadamente 1,89 GB (0,74 GB + 1,15 GB) y el pipeline completo procesa 19 minutos de audio en 48 segundos sobre un MacBook Air M4, incluyendo la carga de modelos. La licencia es mixta: CC-BY-4.0 para los ficheros de Phonon-2.5 y Apache-2.0 para el modelo de limpieza y el script.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: Phonon-2.5 (ASR, derivado de NVIDIA parakeet-tdt-0.6b-v3, familia Parakeet/TDT) y LvW-Dictate-Cleanup-0.9B (modelo de lenguaje transformer) |
| Parametros totales | 1.078.285.824 (suma del repositorio; Phonon-2.5 ~0,6B + Cleanup ~0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (segun fichero) |
| Idiomas soportados | en, es, fr, de, it, pt, nl, pl, ru, uk, ro, cs, sk, bg, hr, sv, da, fi, et, lv, lt, hu, sl, mt, el (25 idiomas en ASR; la limpieza solo en ingles) |
| Licencia | Mixta: CC-BY-4.0 (ficheros Phonon-2.5) y Apache-2.0 (ficheros Cleanup y script) |
| Formato de pesos | GGUF (llama.cpp / transcribe.cpp) |

## Arquitectura y entrenamiento

Phonon-2.5 es un modelo de reconocimiento del habla derivado de NVIDIA parakeet-tdt-0.6b-v3, de la familia Parakeet con decodificacion TDT (Token-and-Duration Transducer). Los pesos originales del publicador estan empaquetados en cinco valores con cuantizacion int6; la conversion a GGUF los expande a tensores densos y despues los cuantiza. No se entreno ningun peso nuevo en el proceso de conversion. El modelo de limpieza LvW-Dictate-Cleanup-0.9B se convirtio con `convert_hf_to_gguf.py` de llama.cpp y se cuantizo con `llama-quantize`. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica del repositorio es la orquestacion: `dictate_gguf.py` encadena la transcripcion ASR con el modelo de limpieza, anade 0,25 s de silencio inicial al audio (condicion con la que Phonon-2.5 transcribe mejor, igual que hace el motor propio de Fermion) y aplica decodificacion greedy al modelo de limpieza. El script funciona con cualquier audio que ffmpeg pueda leer y solo necesita la biblioteca estandar de Python.

## Capacidades

- Reconocimiento automatico del habla en 25 idiomas (ingles, espanol, frances, aleman, italiano, portugues, neerlandes, polaco, ruso, ucraniano, rumano, checo, eslovaco, bulgaro, croata, sueco, danes, finlandes, estonio, leton, lituano, hungaro, esloveno, maltes y griego).
- Limpieza de transcripciones en ingles: eliminacion de muletillas, repeticiones, falsos arranques y autocorrecciones.
- Procesamiento de audio en multiples formatos de entrada mediante ffmpeg (por ejemplo, m4a, wav).
- Salida en texto plano o en JSON con el texto crudo y el texto limpio por fichero (`--json`).
- Uso independiente de cada GGUF: Phonon-2.5 con `transcribe-cli` y el modelo de limpieza con `llama-server`.
- Soporte de endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Dictado local en escritorio: el pipeline completo transcribe una grabacion y devuelve texto limpio en una sola invocacion (`python3 dictate_gguf.py recording.m4a`), adecuado para notas de voz y documentos personales sin enviar audio a la nube.
- Transcripcion de reuniones en ingles con limpieza: el modelo de limpieza reduce el WER frente a la transcripcion cruda en audio con disfluencias (de 21,1 a 8,3 en DisfluencySpeech), por lo que es util para actas y resumenes posteriores.
- Subtitulado y transcripcion multilingue: Phonon-2.5 cubre 25 idiomas con un WER en ingles de 7,34 sobre 50 clips de FLEURS, lo que permite generar subtitulos en varios idiomas desde una misma herramienta.
- Integracion en aplicaciones de toma de notas: el script solo requiere la biblioteca estandar de Python y modelos GGUF, lo que facilita empaquetarlo en herramientas de escritorio o CLI sin dependencias pesadas.
- Procesamiento por lotes de archivos de audio: la opcion `--json` imprime texto crudo y limpio por fichero, util para pipelines de ingestion de audio archivado.
- Despliegue en equipos sin GPU dedicada: los ficheros Q8_0 recomendados suman unos 1,89 GB y el pipeline completo tarda 48 s en 19 minutos de audio en un MacBook Air M4, lo que lo hace viable en portatiles de consumo.
- Uso del ASR aislado: `transcribe-cli -m Phonon-2.5-Q8_0.gguf` permite integrar solo la transcripcion en sistemas existentes sin el paso de limpieza.

## Benchmarks y rendimiento

Phonon-2.5, medido sobre 118 clips (50 de FLEURS en ingles, 2 por cada otro idioma y 20 de DisfluencySpeech):

| Fichero | Transcripcion identica a la referencia del publicador | WER en ingles (50 clips FLEURS, con relleno inicial) |
|---|---:|---:|
| F32 | 117/118 (99,2%) | 7,43 |
| F16 | 118/118 | 7,43 |
| Q8_0 | 94,9% | 7,34 |
| Q6_K | 89,8% | 7,24 |
| Q5_K_M | 83,9% | 7,24 |
| Q4_K_M | 73,7% | 7,24 |

El motor propio de Fermion obtuvo 7,24 en los mismos 50 clips y coincidio exactamente con las transcripciones F16 en el 89% de los 118 clips.

Modelo de limpieza, sobre la suite completa de pruebas del modelo principal:

| Fichero | Misma salida greedy que MLX (442 entradas) | WER G1 DisfluencySpeech | WER G2 FLEURS / LibriSpeech | Prompts G3 conservados | Puertas |
|---|---:|---:|---:|---:|---|
| BF16 | 98,4% | 7,14 | 6,50 / 1,91 | 99,0% | pass |
| Q8_0 | 98,6% | 7,16 | 6,50 / 1,93 | 99,0% | pass |
| Q6_K | 98,2% | 7,02 | 6,50 / 1,93 | 99,0% | pass |
| Q5_K_M | 98,0% | 7,12 | 6,50 / 1,93 | 99,0% | pass |
| Q4_K_M | 96,6% | 7,02 | 6,50 / 1,93 | 99,0% | pass |

Phonon-2.5 sin limpieza obtiene 16,49 en G1 y 6,49 / 1,79 en G2.

Pipeline completo con ambos ficheros Q8_0 sobre los mismos 118 clips (19 minutos de audio):

| Metrica | Resultado |
|---|---|
| WER de DisfluencySpeech frente a la transcripcion limpia | 21,1 → 8,3 (el pipeline MLX tambien obtiene 8,3) |
| WER en ingles FLEURS | 7,34 (pipeline MLX: 7,24) |
| Clips de otros idiomas devueltos sin tocar | 48/48 |
| Tiempo en MacBook Air M4, incluida la carga de modelos | 48 s |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano de fichero, Q8_0 de ambos modelos ocupa unos 1,89 GB en disco y en memoria, y Q4_K_M de ambos unos 1,16 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor valida el pipeline en CPU/GPU integrada de un MacBook Air M4.
- Cabe en GPU de consumo: si, por el tamano de los ficheros (inferior a 2 GB en Q8_0), aunque no se detallan modelos concretos de GPU.
- Opciones de despliegue: `transcribe-cli` de transcribe.cpp (commit 5700f12) para Phonon-2.5, `llama-server` de llama.cpp para el modelo de limpieza, y `dictate_gguf.py` para el pipeline completo.
- Latencia y throughput: 19 minutos de audio procesados en 48 segundos en un MacBook Air M4, incluida la carga de modelos (pipeline completo con Q8_0).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LvW-Dictate-1.5B (GGUF) | ~1,5B en total (0,6B ASR + 0,9B limpieza) | no disponible | WER ingles 7,34 (Q8_0, pipeline completo) | CC-BY-4.0 + Apache-2.0 | Hugging Face (GGUF) |
| Phonon-2.5 (referencia Fermion) | ~0,6B | no disponible | WER ingles 7,24 en 50 clips FLEURS | CC-BY-4.0 | Hugging Face |
| NVIDIA parakeet-tdt-0.6b-v3 | ~0,6B | no disponible | no disponible | no disponible | Hugging Face |
| Pipeline MLX de LvW-Dictate | ~1,5B | no disponible | WER ingles 7,24; DisfluencySpeech 8,3 | Apache-2.0 (limpieza) | Hugging Face |

## Limitaciones y advertencias

- El modelo de limpieza solo funciona en ingles: los clips en otros idiomas se devuelven sin tocar (48/48 en las pruebas). No se debe esperar limpieza de disfluencias en espanol ni en el resto de idiomas.
- La cuantizacion agresiva degrada la fidelidad de transcripcion: Q4_K_M solo coincide con la referencia F32 en el 73,7% de los clips y Q5_K_M en el 83,9%, frente al 94,9% de Q8_0. Para produccion se recomienda Q8_0 o superior.
- Riesgo de alucinacion y de deriva en transcripciones: no se documentan tasas de error especificas fuera de los benchmarks citados, y el modelo de limpieza puede alterar el contenido al eliminar disfluencias.
- Licencia mixta: los ficheros de Phonon-2.5 son CC-BY-4.0 (requiere atribucion) y los de limpieza y el script son Apache-2.0. El uso comercial exige revisar el fichero NOTICE y la licencia del modelo base NVIDIA parakeet-tdt-0.6b-v3.
- Dependencia de versiones concretas: el autor fija el commit 5700f12 de transcribe.cpp; otras versiones pueden no convertir o ejecutar correctamente los pesos.
- Requiere ffmpeg para la entrada de audio y una compilacion manual de transcribe.cpp; no se distribuyen binarios precompilados.
- No se documentan sesgos conocidos, longitud de contexto ni limites de duracion de audio en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Lucasgitguy-co/LvW-Dictate-1.5B-GGUF
- Model card principal: https://huggingface.co/Lucasgitguy-co/LvW-Dictate-1.5B
- Modelo base Phonon-2.5: https://huggingface.co/FermionResearch/Phonon-2.5
- Fichero NOTICE (licencias): https://huggingface.co/Lucasgitguy-co/LvW-Dictate-1.5B-GGUF/blob/main/NOTICE
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
