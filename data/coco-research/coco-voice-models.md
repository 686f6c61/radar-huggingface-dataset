# coco-research/coco-voice-models

## Resumen

`coco-research/coco-voice-models` no es un modelo único, sino un repositorio espejo (mirror) que agrupa los archivos de modelos de reconocimiento automático del habla (ASR, *speech-to-text*) empleados por la aplicación Coco Voice. Hasta la publicación de este espejo, dichos archivos solo se distribuían desde el proyecto Handy (`blob.handy.computer` y la organización `handy-computer` en Hugging Face). El repositorio recopila 52 archivos que suman 59.191.683.971 bytes (unos 59,2 GB) y cubre modelos de distintos tamaños y fabricantes, desde variantes *tiny* de 33 MB hasta un modelo de 4.000 millones de parámetros.

La colección es heterogénea tanto en arquitectura como en licencia. Incluye conversiones y cuantizaciones GGML/GGUF de Whisper (OpenAI), Breeze-ASR (MediaTek Research), Canary y Parakeet TDT (NVIDIA), Voxtral Mini 4B Realtime (Mistral AI), Qwen3-ASR (Alibaba Cloud), Fun-ASR-MLT-Nano (Tongyi Lab), Cohere Transcribe, además de exportaciones ONNX empaquetadas en `.tar.gz` de la familia Moonshine Streaming (Moonshine AI). Cada archivo es una copia byte a byte de la versión distribuida por Handy: no se ha reconvertido, recuantizado ni reempaquetado nada, y se publica el SHA-256 de cada fichero.

Su relevancia es fundamentalmente práctica: centraliza en una sola ubicación de Hugging Face un conjunto de modelos ASR ligeros y ya cuantizados, listos para inferencia en CPU o GPU de gama de consumo mediante `whisper.cpp`, `llama.cpp` u ONNX Runtime. El repositorio se creó el 27 de septiembre de 2026 y su última actualización data del mismo día; no registra descargas ni *likes* en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heterogenea, varia por modelo: Whisper (OpenAI), Canary/FastConformer (NVIDIA), Parakeet TDT (NVIDIA), Moonshine Streaming (Moonshine AI), Voxtral (Mistral AI), Qwen3-ASR, Fun-ASR, Cohere Transcribe |
| Parametros totales | 1.543.321.440 (dato reportado por Hugging Face a partir de safetensors; el repositorio agrupa 52 archivos de tamanos muy dispares, por lo que la cifra no representa una suma del conjunto) |
| Parametros activos | No aplica (no se documenta ninguna variante MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGML q4_1, q5_K, Q5_K_M y Q8_0; exportaciones ONNX empaquetadas en `.tar.gz` |
| Idiomas soportados | No disponible a nivel de repositorio; la licencia y el alcance linguistico se definen por carpeta. Algunos identificadores indican alcance solo ingles (`moonshine-*-streaming-en`) |
| Licencia | `multiple-per-folder` (etiqueta de repositorio `other`): MIT, Apache-2.0 y CC-BY-4.0 segun el modelo |
| Formato de pesos | GGUF y GGML (`.gguf`, `.bin`) y `.tar.gz` con exportaciones ORT/ONNX |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo ni documenta procesos de entrenamiento: es un espejo de artefactos ya publicados por terceros. La conversión, cuantización y empaquetado de los ficheros originales la realizó el proyecto Handy (MIT, Copyright (c) 2025 CJ Pais), y los pesos pertenecen a sus publicadores originales. Por tanto, la información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO o innovaciones de arquitectura debe consultarse en la *model card* de cada modelo de origen; no se detalla en este repositorio.

Arquitectónicamente conviven dos grandes familias. Por un lado, modelos de tipo *encoder-decoder* orientados a transcripción por fragmentos, como Whisper (OpenAI) en sus variantes `medium`, o los modelos Canary de NVIDIA. Por otro, modelos de ASR *streaming* o de baja latencia, como la familia Moonshine Streaming, distribuida aquí como exportación ORT. Los identificadores de los archivos permiten deducir los ordenes de magnitud de cada modelo: `canary-180m-flash` (180 M), `parakeet-tdt-0.6b-v2` y `-v3` (0,6 B), `Qwen3-ASR-0.6B` (0,6 B), `canary-1b-flash` y `canary-1b-v2` (1 B), `canary-qwen-2.5b` (2,5 B) y `Voxtral-Mini-4B-Realtime-2602` (4 B).

## Capacidades

- Reconocimiento automatico del habla (*speech-to-text*) y transcripcion de audio, tarea declarada en el `pipeline_tag` del repositorio.
- Conversiones listas para inferencia local en formato GGUF/GGML y exportaciones ONNX (ORT), sin necesidad de reconvertir pesos.
- Cobertura de un rango amplio de compromisos tamano/latencia: desde 33 MB (`moonshine-tiny-streaming-en`) hasta 3,28 GB (`Voxtral-Mini-4B-Realtime-2602` en Q5_K_M).
- Modelos con orientacion a *streaming* y baja latencia (familia Moonshine Streaming, Voxtral Realtime), adecuados para dictado en vivo.
- Verificabilidad de integridad: cada archivo incluye SHA-256 en el `ATTRIBUTION.md` y coincide con el identificador de objeto de Git LFS.
- No se documentan en la informacion disponible capacidades de *tool calling*, agentes, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Dictado y transcripcion en escritorio: la aplicacion Coco Voice usa estos archivos para convertir voz en texto en local. Los modelos pequenos (Moonshine tiny/small, 33-105 MB) permiten transcripcion casi instantanea sin GPU.
- Subtitulado por lotes: `whisper-medium` en q4_1 (491,9 MB) o Q8_0 (831,5 MB) sirve para generar subtitulos de audio pregrabado con un consumo de memoria bajo y despliegue trivial en `whisper.cpp`.
- Transcripcion multilingue de reuniones: modelos como `canary-1b-v2` (836,7 MB en Q5_K_M) o `Qwen3-ASR-0.6B` (850,4 MB) cubren escenarios de audio largo con mezcla de idiomas, siempre que se valide el alcance linguistico en la ficha del modelo original.
- ASR en tiempo real para agentes de voz: `Voxtral-Mini-4B-Realtime-2602` en Q5_K_M (3,28 GB) esta pensado para reconocimiento con baja latencia, integrable en pipelines de asistente conversacional.
- Despliegue en dispositivos con recursos limitados: las exportaciones ONNX de Moonshine Streaming (`.tar.gz` de 33 a 202 MB) encajan en entornos embebidos o moviles mediante ONNX Runtime.
- *Benchmarking* y seleccion de modelos ASR: el repositorio permite comparar directamente distintas familias (Whisper, Parakeet, Canary, Qwen3-ASR) bajo cuantizaciones homogeneas, facilitando pruebas de precision frente a coste computacional.
- Pipelines de accesibilidad: transcripcion automatica de contenido audiovisual para generar subtitulos, aprovechando que varios modelos caben en CPU y no requieren infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el conjunto completo ocupa 59,2 GB; se recomienda descargar unicamente las carpetas necesarias fijando un *commit* concreto.
- Modelos minimos: `moonshine-tiny-streaming-en` (33 MB) y `moonshine-small-streaming-en` (104,8 MB) estan disenados para ejecucion en CPU, sin GPU.
- Modelos de ~0,5-1 GB: `whisper-medium-q4_1` (491,9 MB), `parakeet-tdt-0.6b-v3` Q8_0 (739,5 MB), `canary-1b-flash` Q5_K_M (769,6 MB), `whisper-medium` Q8_0 (831,5 MB), `canary-1b-v2` Q5_K_M (836,7 MB), `Qwen3-ASR-0.6B` Q8_0 (850,4 MB), `Fun-ASR-MLT-Nano-2512` Q8_0 (891,3 MB) y `cohere-transcribe-03-2026` Q5_K_M (1,77 GB). Todos son viables en GPU de gama de consumo y en CPU moderna; la VRAM necesaria es del orden del tamano del archivo mas el *overhead* del runtime.
- Modelo mayor: `Voxtral-Mini-4B-Realtime-2602` Q5_K_M (3,28 GB) requiere previsiblemente entre 4 y 6 GB de VRAM para inferencia, por lo que cabe en tarjetas como RTX 3060/4060 de 8 GB o superiores; en GPU de centro de datos (A100, H100) el margen es amplio pero desproporcionado para su tamano.
- Despliegue: los archivos GGUF/GGML son compatibles con `whisper.cpp` y `llama.cpp`; las exportaciones `.tar.gz` requieren ONNX Runtime. Tambien son utilizables desde las aplicaciones Coco Voice y Handy.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa de los modelos representativos incluidos en el propio repositorio (parametros deducidos del identificador del modelo):

| Modelo | Parametros (segun id) | Formato y cuantizacion | Tamano del archivo | Licencia | Publicador original |
|---|---|---|---|---|---|
| `moonshine-tiny-streaming-en` | Tiny (no especificado) | ORT en `.tar.gz` | 33,0 MB | MIT | Moonshine AI |
| `moonshine-small-streaming-en` | Small (no especificado) | ORT en `.tar.gz` | 104,8 MB | MIT | Moonshine AI |
| `canary-180m-flash` | 180 M | GGUF Q8_0 | 218,4 MB | CC-BY-4.0 | NVIDIA |
| `whisper-medium` | Medium (no especificado) | GGUF Q8_0 / GGML q4_1 | 831,5 MB / 491,9 MB | MIT | OpenAI |
| `parakeet-tdt-0.6b-v3` | 0,6 B | GGUF Q8_0 | 739,5 MB | CC-BY-4.0 | NVIDIA |
| `Qwen3-ASR-0.6B` | 0,6 B | GGUF Q8_0 | 850,4 MB | Apache-2.0 | Alibaba Cloud |
| `canary-1b-v2` | 1 B | GGUF Q5_K_M | 836,7 MB | CC-BY-4.0 | NVIDIA |
| `Voxtral-Mini-4B-Realtime-2602` | 4 B | GGUF Q5_K_M | 3,28 GB | Apache-2.0 | Mistral AI |

No se dispone de datos de precision (WER) ni de comparativas de rendimiento con modelos externos a partir de la informacion proporcionada.

## Limitaciones y advertencias

- Es un repositorio espejo, no un modelo entrenado por `coco-research`: la responsabilidad sobre los pesos y su comportamiento recae en los publicadores originales.
- La licencia no es unica. La etiqueta `other` del repositorio significa "consultese cada carpeta": conviven MIT, Apache-2.0 y CC-BY-4.0. Es imprescindible revisar el `LICENSE` y el `ATTRIBUTION.md` de cada modelo antes de cualquier uso, en particular el comercial.
- El repositorio no ha sido validado por el autor de esta ficha mas alla de lo que declara su propia documentacion; la verificacion recomendada es comprobar el SHA-256 tras la descarga.
- No se especifican los idiomas soportados a nivel de repositorio. Algunos modelos, segun su identificador, estan limitados a ingles (`moonshine-*-streaming-en`); la cobertura multilingue debe verificarse modelo a modelo.
- Riesgo de alucinacion y de errores de transcripcion: inherente a todos los sistemas ASR, no cuantificado aqui por falta de datos de WER.
- Sesgos: no documentados en la informacion disponible; dependen del dataset de entrenamiento de cada modelo de origen.
- La ficha del ultimo modelo listado (`canary-qwen-2.5b`, Q5_K_M, a partir de 1.983,...) aparece truncada en la informacion facilitada, por lo que no se puede confirmar su tamano exacto ni el resto de la tabla de 52 archivos.
- Los resultados de busqueda web recibidos no contienen informacion relacionada con este repositorio (remiten a un servicio de chat y a una pelicula de animacion homonimos), por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/coco-research/coco-voice-models
- Repositorio de la aplicacion Coco Voice: https://github.com/coco-research/Coco-Voice
- Proyecto Handy (conversion, cuantizacion y empaquetado): https://github.com/cjpais/Handy
- Organizacion Handy en Hugging Face (origen previo de los archivos): https://huggingface.co/handy-computer
- Modelos originales citados en el repositorio:
  - https://huggingface.co/openai/whisper-medium
  - https://huggingface.co/MediaTek-Research/Breeze-ASR-25
  - https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
  - https://huggingface.co/moonshine-ai/moonshine-streaming-small
  - https://huggingface.co/moonshine-ai/moonshine-streaming-medium
  - https://huggingface.co/nvidia/canary-180m-flash
  - https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
  - https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
  - https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
  - https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
  - https://huggingface.co/Qwen/Qwen3-ASR-0.6B
  - https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512
  - https://huggingface.co/nvidia/canary-1b-flash
  - https://huggingface.co/nvidia/canary-1b-v2
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
