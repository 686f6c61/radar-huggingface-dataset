# pugant/Ornith-1.0-35B-ROCmFP4-STRIX_LEAN

## Resumen

Ornith-1.0-35B-ROCmFP4-STRIX_LEAN es una cuantización GGUF del modelo multimodal Ornith-1.0-35B, desarrollado por ornith-ai (también publicado como deepreinforce-ai/Ornith-1.0-35B). El modelo base pertenece a la familia Qwen3.5-VL-MoE: un transformer de mezcla de expertos (MoE) con 34.660.610.688 parámetros totales y solo 3.000 millones activos por token, lo que lo hace eficiente en inferencia. Incluye una torre de visión que permite procesar imágenes y texto simultáneamente (pipeline image-text-to-text).

Esta versión concreta, publicada por pugant, está cuantizada con el preset Q4_0_ROCMFP4_STRIX_LEAN (tipo 106, ~4,29 bits por peso) y optimizada específicamente para GPUs AMD Strix Halo (gfx1151, RDNA 3.5). El resultado es un archivo de unos 17,3 GiB que ejecuta el modelo completo, incluyendo el proyector de visión, en hardware AMD de última generación. Su relevancia radica en que permite desplegar un modelo multimodal de 35B con 3B activos en una APU integrada, con un rendimiento de 66,68 tokens/s en generación y 1486 tokens/s en prefill (medidos en un Ryzen AI Max+ 395).

La cuantización requiere un fork específico de llama.cpp (charlie12345/ROCmFPX) y no es compatible con la versión estándar, lo que limita su uso a entornos ROCm preparados para esta arquitectura. Aun así, es una opción interesante para desarrolladores que trabajan con hardware AMD Strix Halo y necesitan un modelo multimodal de gran tamaño con un footprint reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3.5-VL-MoE) con torre de visión |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | 3B |
| Longitud de contexto | 32768 tokens (según comando de ejemplo) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_LEAN (~4,29 bits/peso, GGUF tipo 106) |
| Idiomas soportados | en, multilingual |
| Licencia | MIT |
| Formato de pesos | GGUF (con mmproj-F16.gguf para visión) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-35B es un transformer de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos por token, perteneciente a la familia Qwen3.5-VL-MoE. Incluye un codificador de visión (vision tower) que se conecta al modelo de lenguaje mediante un proyector (mmproj), lo que le permite procesar entradas de imagen y texto. La arquitectura incorpora además una capa de predicción multi-token (MTP, `mtp_num_hidden_layers=1`) cuyos pesos están presentes en el archivo GGUF pero no se activan en el runtime de esta cuantización.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. Solo se sabe que el modelo fue publicado bajo licencia MIT por ornith-ai y que la cuantización fue realizada por pugant a partir del GGUF BF16 de unsloth, utilizando una matriz de importancia (imatrix) precomputada por unsloth.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada (pipeline image-text-to-text), lo que permite responder preguntas sobre imágenes, generar descripciones, etc.
- Generación de texto y razonamiento: al ser un modelo MoE de 3B activos, ofrece capacidades de generación de lenguaje y razonamiento típicas de la familia Qwen.
- Multilingüe: soporta inglés y otros idiomas (etiqueta `multilingual`).
- No se menciona en la documentación soporte explícito para tool calling, function calling ni modo agente. Tampoco se indica un modo de pensamiento (thinking mode) específico.

## Casos de uso

- Asistente multimodal en dispositivos Strix Halo: el modelo puede analizar imágenes capturadas por la cámara o cargadas por el usuario y responder preguntas sobre su contenido, todo en local con ~17,3 GiB de memoria.
- Generación de descripciones de imágenes para accesibilidad: a partir de una fotografía, el modelo genera texto alternativo o descripciones detalladas, útil en aplicaciones de inclusión.
- Chat conversacional multilingüe: gracias a su soporte de varios idiomas y su ventana de 32K tokens, puede mantener conversaciones largas con contexto amplio.
- Procesamiento de documentos escaneados: combina OCR (a través de la torre de visión) con comprensión de texto para resumir o extraer información de documentos con imágenes.
- Prototipado de aplicaciones de edge computing: al ejecutarse en una APU integrada, es adecuado para sistemas embebidos o estaciones de trabajo sin GPU discreta.
- Investigación en eficiencia de MoE: permite experimentar con cuantizaciones FP4 software en hardware AMD, estudiando el equilibrio entre ancho de banda y calidad.

## Benchmarks y rendimiento

Los benchmarks fueron medidos en un AMD Ryzen AI Max+ 395 (Strix Halo, 128 GB LPDDR5X) usando `llama-bench -ngl 999 -fa on -p 512 -n 128 -mmap 0` en contenedores ROCm (backend HIP). Los resultados comparan esta cuantización con otros modelos de la misma familia:

| Modelo | Quant | Tamaño | tg128 (tok/s) | pp512 (tok/s) |
|---|---:|---:|---:|---:|
| Ornith-1.0-35B | ROCmFP4-STRIX_LEAN | 17,32 GiB | 66,68 | 1486 |
| grug-35b-v2 (hermano) | ROCmFP4-STRIX_LEAN | 17,31 GiB | 70,92 | 1418 |
| Qwen3.6-35B-A3B (referencia producción) | ROCmFP4-STRIX_LEAN | 17,31 GiB | 63 | — |

Según el autor, este modelo ofrece un +5,9% en tokens/s frente a Qwen3.6-35B-A3B (66,68 vs 63) al mismo footprint. Los números se obtuvieron con el perfil de energía en modo `balanced` (no forzado a `performance`), por lo que podrían ser ligeramente superiores en sistemas optimizados.

## Requisitos de hardware

- GPU: AMD Strix Halo (gfx1151, RDNA 3.5), por ejemplo el Ryzen AI Max+ 395 con 128 GB LPDDR5X.
- VRAM: el modelo ocupa ~17,32 GiB (GGUF) + ~857 MB (mmproj-F16), por lo que cabe en los 128 GB unificados del Strix Halo. No se ha probado en GPUs con VRAM dedicada inferior.
- Software: requiere el fork `charlie12345/ROCmFPX` de llama.cpp (construido con el contenedor `kyuz0/amd-strix-halo-toolboxes`). No funciona con llama.cpp estándar.
- Despliegue: se usa `llama-server` con `--mmproj` para el proyector de visión, en un contenedor ROCm con acceso a `/dev/kfd` y `/dev/dri`.
- Latencia y throughput: los valores medidos son 66,68 tok/s de generación y 1486 tok/s de prefill en el hardware mencionado.

## Comparativa con modelos similares

La comparativa se limita a modelos de la misma familia arquitectónica (Qwen3.5/3.6-MoE) cuantizados con el mismo preset y ejecutados en el mismo hardware:

| Modelo | Params totales | Activos | Contexto | Licencia | tg128 (tok/s) |
|---|---:|---:|---:|---|---:|
| Ornith-1.0-35B (este) | 34,66B | 3B | 32768 | MIT | 66,68 |
| grug-35b-v2 | ~35B | 3B | no disponible | no disponible | 70,92 |
| Qwen3.6-35B-A3B | ~35B | 3B | no disponible | no disponible | 63 |

No se dispone de comparativas con modelos fuera de esta familia ni con cuantizaciones estándar (por ejemplo, Q4_K_M) en el mismo hardware.

## Limitaciones y advertencias

- Requiere el fork ROCmFPX de llama.cpp; el archivo GGUF tipo 106 es inválido en la versión estándar y el modelo no cargará.
- Solo ha sido probado en gfx1151 (Strix Halo); no hay garantías de funcionamiento en otras GPUs AMD o NVIDIA.
- La cuantización FP4 es software sobre RDNA 3.5 (no hay unidades FP4 en el silicio); la ganancia es en ancho de banda y memoria, no en cómputo bruto.
- El MTP (multi-token prediction) no está activado en runtime; los pesos están presentes pero no se utilizan, lo que podría dejar algo de rendimiento sin explotar.
- No se han publicado evaluaciones de calidad (MMLU, HumanEval, etc.) para esta cuantización concreta; solo se ofrecen métricas de velocidad.
- No hay información sobre sesgos, alucinaciones o comportamientos indeseados específicos de este modelo.
- La licencia MIT del modelo base permite uso comercial, pero el fork ROCmFPX y las herramientas asociadas pueden tener términos adicionales que deben revisarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pugant/Ornith-1.0-35B-ROCmFP4-STRIX_LEAN
- Modelo base (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.0-35B
- GGUF BF16 de unsloth (fuente para cuantización): https://huggingface.co/unsloth/Ornith-1.0-35B-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Modelo hermano grug-35b-v2 (cuantización similar): https://huggingface.co/pugant/grug-35b-v2-ROCmFP4-STRIX_LEAN
