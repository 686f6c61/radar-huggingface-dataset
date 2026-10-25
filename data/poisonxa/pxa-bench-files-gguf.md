# poisonxa/PXA-bench-files-GGUF

## Resumen

`poisonxa/PXA-bench-files-GGUF` no es un modelo entrenado, sino un repositorio de artefactos GGUF publicados para que las comparativas cross-engine del motor [PXA](https://github.com/poisonxa16/pxa) sean reproducibles byte a byte. Cada fichero es un modelo "stock" convertido con el propio `llama-quantize` del repositorio del motor, o un tier cuantizado con el codec PXA, y lleva asociado un `sha256` que permite verificar que los numeros publicados se midieron exactamente sobre esos pesos. El repositorio lo mantiene el autor `poisonxa` bajo licencia Apache 2.0 y acumula 433 descargas y 0 likes desde su creacion el 4 de septiembre de 2026.

El contenido son artefactos de una familia de ~35B parametros: los tiers PXQ2, PXQ3 y PXQ4 (el fichero llamado `PXQ6` es en realidad el tier de 4 bits, segun `docs/RENAME-MAP.md`), una variante con cabeza MTP para decodificacion especulativa (`--spec-type mtp`), el proyector de vision `mmproj-fusion2-f16.gguf` y un fichero de comparacion `qwen36-35b-MXFP4.gguf` de clase MoE "35B-A3B". El dato real de parametros disponibles en safetensors es de 34.660.610.688 (~34,7B).

Su relevancia es de infraestructura, no de modelado: sirve como referencia de integridad y de rendimiento para GPUs legacy (Tesla P100 sm_60, V100 sm_70, GTX 1080 Ti) y como banco de pruebas del codec PXA, que requiere el motor del autor y no funciona con `llama.cpp` estandar. No hay informacion publicada sobre arquitectura exacta, datos de entrenamiento, contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card solo indica que el artefacto de comparacion es de clase MoE "35B-A3B" |
| Parametros totales | 34.660.610.688 (~34,7B), dato real de safetensors |
| Parametros activos | No disponible. La model card describe el artefacto MoE como "35B-A3B class" (aproximadamente 3B activos, sin confirmacion del autor) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (comparacion), PXQ2, PXQ3, PXQ4 (fichero nombrado `PXQ6`), PXQ4 + cabeza MTP, `U16-q8head`, proyector de vision en f16; cuantizacion con imatrix (`quantize.imatrix.dataset`) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (declarada en el repositorio para los artefactos) |
| Formato de pesos | GGUF; los tiers Fusion2 usan el codec PXA (requieren el motor PXA, no `llama.cpp` estandar) |

## Arquitectura y entrenamiento

No hay informacion de arquitectura ni de entrenamiento en la documentacion disponible: el autor no publica numero de tokens, composicion del dataset, ni fases de RLHF/DPO. Lo que si se documenta es la cadena de cuantizacion: los ficheros se generan con el `llama-quantize` del repositorio del motor, se calibran con una matriz de importancia (`imatrix`) y se almacenan en el codec PXA, con los tensores de expertos del layer MTP (`blk.40`) en MXFP4. El repositorio incluye tambien un proyector multimodal f16 (`mmproj-fusion2-f16.gguf`, 902.823.040 B) que se carga con `--mmproj` y habilita entrada de vision en los tiers Fusion2.

La innovacion tecnica destacable no esta en el modelo sino en el formato y el motor: codec PXA con requisito de residency total en GPU (`-ngl 99`), soporte de decodificacion especulativa mediante cabeza MTP, y un protocolo de medicion fijado en `bench/fair/protocol.md` con verificacion obligatoria de `sha256` (el script `bench/fair/run.sh` se niega a arrancar si un fichero presente en disco no coincide con el manifest). El repositorio incluye ademas un arnes de reproduccion de SWE-bench Lite en `bench/swe/`.

## Capacidades

- Inferencia de texto en los tiers Fusion2 (PXQ2, PXQ3, PXQ4) y en el fichero de comparacion Qwen 35B en MXFP4.
- Conversacion multi-turno: las mediciones distinguen "chat prefill" y "chat decode", lo que implica uso con plantilla de chat.
- Generacion de codigo y evaluacion tipo agente: el tier de 4 bits es el que sirve la reproduccion de SWE-bench Lite en `bench/swe/`.
- Vision: el proyector `mmproj-fusion2-f16.gguf` habilita entrada de imagenes en los tiers Fusion2 mediante `--mmproj`.
- Decodificacion especulativa: variante `PXA-Fusion2-35B-PXQ6-MTP.gguf` para `--spec-type mtp`.
- Verificacion de integridad: sumas `sha256` publicadas en `checksums.sha256` y en `bench/fair/weights/MANIFEST.sha256`.
- Ejecucion en GPUs legacy (sm_60 y sm_70) con kernels y recetas propias del motor PXA.
- No se documentan capacidades de tool calling, function calling, modo thinking ni audio.

## Casos de uso

- Reproduccion de benchmarks publicados: descargar el fichero concreto, ejecutar `sha256sum -c checksums.sha256 --ignore-missing` y lanzar `bench/fair/run.sh`; es el proposito explicito del repositorio y garantiza que la fila publicada corresponde a esos bytes.
- Validacion del codec PXA en hardware antiguo: medir prefill y decode en Tesla P100 (sm_60), V100 (sm_70) y GTX 1080 Ti con recetas de `docs/COOKBOOK.md`, util para decidir si merece la pena reutilizar GPUs de generaciones anteriores.
- Comparativa cross-engine: usar `qwen36-35b-MXFP4.gguf` como fila de referencia MoE frente a `ik_llama.cpp`, tal como recoge `docs/data/gtx1080ti-vs-ik-2026-09-07.csv`.
- Evaluacion de agentes de codigo: servir el tier de 4 bits con el arnes de `bench/swe/` para reproducir SWE-bench Lite sobre un modelo de ~35B con residency completa en GPU.
- Medir decodificacion especulativa: comparar `PXQ6-MTP` frente al tier sin cabeza MTP para cuantificar la ganancia de `--spec-type mtp` en decode.
- Pruebas de pipeline multimodal: cargar `mmproj-fusion2-f16.gguf` junto con un tier Fusion2 para validar entrada de imagenes antes de desplegar un servicio de vision.
- Auditoria de publicaciones tecnicas: usar los `sha256` como cadena de custodia al replicar resultados de terceros o al publicar nuevas cifras.
- Referencia para producir nuevas cuantizaciones: los artefactos y la `imatrix` documentada sirven de linea base al generar tiers propios con `llama-quantize`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas cifras publicadas son de velocidad de inferencia y corresponden a los ficheros alojados en este repositorio:

| Fichero | Hardware | Prefill | Decode |
|---|---|---|---|
| `fusion2-35b-U16-q8head.gguf` | 1x Tesla P100 | 827–843 t/s | 62,4 t/s |
| `fusion2-35b-U16-q8head.gguf` | 1x Tesla V100 | ~1.800–1.900 t/s | 101,3 t/s |
| `PXA-Fusion2-35B-PXQ2.gguf` | 1x GTX 1080 Ti, prefill en frio | 1.333,5 t/s | 35,37 t/s |
| `PXA-Fusion2-35B-PXQ2.gguf` | 1x GTX 1080 Ti, chat | 734,1 t/s | 64,23 t/s |

El repositorio tambien aloja el tier de 4 bits que sirve la reproduccion de SWE-bench Lite (`bench/swe/`), pero no se publica la puntuacion obtenida en la informacion disponible.

## Requisitos de hardware

- VRAM estimada a partir del tamano de fichero (estimacion propia, no publicada por el autor): PXQ3 14.696.020.352 B (~13,7 GiB) mas cache KV; PXQ4 18.722.552.256 B (~17,4 GiB); PXQ4+MTP 19.173.193.440 B (~17,9 GiB); proyector de vision 902.823.040 B (~0,84 GiB) adicionales. El tier PXQ2 no tiene tamano publicado.
- Los tiers PXA deben residir completamente en GPU (`-ngl 99`): no se puede compensar falta de VRAM con offload a CPU.
- GPUs verificadas por el autor: Tesla P100 (16 GB), Tesla V100 (16/32 GB), GTX 1080 Ti (11 GB, medida con el tier PXQ2) y configuracion 2x V100 para la fila MoE.
- GPU de consumo: el tier PXQ4 (~17,4 GiB) cabria en una RTX 4090 de 24 GB dejando margen para cache KV, pero no hay medicion publicada en esa tarjeta; el PXQ3 (~13,7 GiB) es el candidato mas ajustado para 16 GB.
- Despliegue: exclusivamente el motor PXA (`github.com/poisonxa16/pxa`) para los ficheros con codec PXA; no son compatibles con `llama.cpp` estandar, vLLM, TGI ni Ollama. El motor incluye lanzador con filas preconfiguradas (por ejemplo `1x P100 (sm_60)` y `1x V100 (sm_70)` en `docs/LAUNCHER.md`).
- Throughput de referencia: 62,4 t/s de decode en P100 y 101,3 t/s en V100 con el tier U16; 35,37–64,23 t/s de decode en GTX 1080 Ti con PXQ2. No hay datos de latencia por peticion ni de throughput agregado en servidor.

## Comparativa con modelos similares

No hay datos publicados de modelos comparables en cuanto a calidad. La comparacion posible es entre los propios artefactos del repositorio y el fichero de referencia del banco de pruebas:

| Artefacto | Bits / formato | Tamano | Uso documentado |
|---|---|---|---|
| `PXA-Fusion2-35B-PXQ2.gguf` | PXQ2 | No disponible | Fila GTX 1080 Ti frente a `ik_llama.cpp` |
| `PXA-Fusion2-35B-PXQ3.gguf` | PXQ3 | 14.696.020.352 B | Artefacto de manifest, sin fila de velocidad publicada |
| `PXA-Fusion2-35B-PXQ6.gguf` (tier 4 bits) | PXQ4 | 18.722.552.256 B | Flagship; sirve la reproduccion de SWE-bench Lite |
| `PXA-Fusion2-35B-PXQ6-MTP.gguf` | PXQ4 + MTP | 19.173.193.440 B | Decodificacion especulativa (`--spec-type mtp`) |
| `qwen36-35b-MXFP4.gguf` | MXFP4 | 19,1 GB | Fila MoE "35B-A3B" en 2x V100 |
| `fusion2-35b-U16-q8head.gguf` | U16, cabeza q8 | No disponible | Filas single-card P100 y V100 |

Existe ademas `poisonxa/PXA-Fusion4-35B-GGUF`, resultado del renombrado del repositorio original, que aloja un modelo distinto en su rama `main`; no se dispone de especificaciones ni de resultados de ese modelo en la informacion proporcionada.

## Limitaciones y advertencias

- No es una model card de un modelo: el repositorio es una coleccion de artefactos de benchmark. Faltan arquitectura, contexto, idiomas, datos de entrenamiento y evaluaciones de calidad.
- Dependencia total del motor PXA: los tiers Fusion2 no cargan en `llama.cpp` estandar ni en servidores de inferencia convencionales, lo que limita la portabilidad y crea riesgo de mantenimiento si el proyecto upstream se abandona.
- Requisito de residencia completa en GPU: sin margen para offload, la VRAM disponible condiciona que tier se puede usar.
- Estado del manifest: `bench/fair/weights/MANIFEST.sha256` del repositorio del motor aun lista el `sha256` antiguo del fichero MTP, reemplazado el 2026-10-24 por un cambio de formato en los tensores del layer `blk.40`; para ese fichero hay que usar `checksums.sha256` de este repositorio.
- Enlaces rotos por renombrado: el repositorio original `poisonxa/PXA-Fusion2-35B-GGUF` ahora apunta a un modelo distinto; los bytes originales solo son accesibles en la revision `2d7d9e7e5f445b1ea38a5686b8cf9d6bc9aa29df`.
- Coherencia de tamanos: el repositorio ocupa 116,6 GB, muy por encima de la suma de los ficheros listados (~73 GB); probablemente por revisiones historicas, pero el autor no lo documenta.
- Licencia: el repositorio declara Apache 2.0, pero los artefactos derivan de pesos de terceros (por ejemplo la clase Qwen 35B citada); no se aclara en la informacion disponible si esos pesos imponen condiciones adicionales para uso comercial.
- Riesgo de alucinacion y sesgos: no evaluables, al no existir documentacion ni benchmarks de calidad del modelo subyacente.
- Los resultados de busqueda web asociados a esta consulta no contenian informacion tecnica relevante sobre el repositorio; todos los datos de esta ficha proceden de la model card y de los metadatos de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/poisonxa/PXA-bench-files-GGUF
- Motor PXA: https://github.com/poisonxa16/pxa
- Recetas de ejecucion: https://github.com/poisonxa16/pxa/blob/main/docs/COOKBOOK.md
- Lanzador y filas por tarjeta: https://github.com/poisonxa16/pxa/blob/main/docs/LAUNCHER.md
- Mapa de renombrado de tiers: https://github.com/poisonxa16/pxa/blob/main/docs/RENAME-MAP.md
- Datos GTX 1080 Ti frente a `ik_llama.cpp`: https://github.com/poisonxa16/pxa/blob/main/docs/data/gtx1080ti-vs-ik-2026-09-07.csv
- Arnes SWE-bench Lite: https://github.com/poisonxa16/pxa/tree/main/bench/swe
- Repositorio original (bytes previos al renombrado): https://huggingface.co/poisonxa/PXA-Fusion2-35B-GGUF/tree/2d7d9e7e5f445b1ea38a5686b8cf9d6bc9aa29df
- Revision del fichero MTP anterior al cambio: https://huggingface.co/poisonxa/PXA-bench-files-GGUF/tree/d4d8f0e88e97dc75c1cfc7e3b3399aba5aff39d0
