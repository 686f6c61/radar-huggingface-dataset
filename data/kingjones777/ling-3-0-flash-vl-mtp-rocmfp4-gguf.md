# kingjones777/Ling-3.0-flash-VL-MTP-ROCmFP4-GGUF

## Resumen

Ling-3.0-flash-VL-MTP-ROCmFP4-GGUF es una cuantización comunitaria del modelo multimodal inclusionAI/Ling-3.0-flash-VL, publicada por el usuario kingjones777. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 124.414.211.552 parámetros totales y aproximadamente 5.500 millones de parámetros activos por token, diseñado para tareas de imagen-texto-a-texto (image-text-to-text). Esta distribución concreta no proviene del autor original, sino que ha sido empaquetada en formato GGUF para su ejecución en llama.cpp sobre hardware AMD.

La particularidad de esta ficha es que no se trata de una conversión convencional: el autor ha injertado una cabeza de predicción multi-token (MTP, multi-token prediction) procedente del modelo hermano de texto inclusionAI/Ling-3.0-flash, y ha corregido el servidor para que la decodificación especulativa MTP y el procesamiento de imágenes funcionen simultáneamente, algo que en llama.cpp estándar provoca un aborto duro del servidor. El resultado es un conjunto de tres cuantizaciones ROCmFP4 (STRIX_LEAN, FAST y COHERENT) más un fichero sin MTP y un proyector multimodal BF16.

El objetivo declarado es el despliegue local en AMD Strix Halo (gfx1151), en concreto en un Ryzen AI Max+ 395 con GPU Radeon 8060S y 128 GiB de memoria unificada. Con licencia MIT y un tamaño de repositorio de 275,6 GB, el modelo resulta relevante para quienes necesitan un modelo multimodal de gran escala en hardware de consumo profesional AMD, con métricas de rendimiento medidas sobre los ficheros publicados y no estimadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, con cabeza MTP injertada (nextn = 1) |
| Parametros totales | 124.414.211.552 |
| Parametros activos | Aproximadamente 5.500 millones (5.5B active, segun la model card) |
| Longitud de contexto | No disponible (los ejemplos de servidor usan `-c 8192`) |
| Tipos de cuantizacion | ROCmFP4 (4.38 bpw en STRIX_LEAN, 4.70 bpw en COHERENT); proyector multimodal en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), mas `mmproj` BF16 para vision |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con 42 bloques y 512 expertos, según los parámetros de configuración citados en la model card: vocabulario de 157.184 tokens, dimensión oculta de 2560, `kv_lora_rank` de 512, `qk_nope_head_dim` de 128, `qk_rope_head_dim` de 64, `v_head_dim` de 128, 32 cabezas de atención, `rope_theta` de 6e6, `layer_group_size` de 6 y `first_k_dense_replace` de 2. La presencia de `kv_lora_rank` y de las dimensiones separadas nope/rope apunta a un mecanismo de atención de tipo MLA (Multi-head Latent Attention) con RoPE parcial, habitual en arquitecturas MoE recientes. La ruta de visión emplea M-RoPE, lo que hace que las posiciones asociadas a imágenes no sean consecutivas.

La innovación principal de esta publicación no está en el entrenamiento, sino en la modificación del checkpoint. Ling-3.0-flash-VL se distribuye sin cabeza MTP; su hermano de texto la incluye como bloque 42. Como todas las dimensiones de texto coinciden entre ambos checkpoints (vocabulario, oculto, capas, expertos, dimensiones de atención y `rope_theta`), la única diferencia es `num_nextn_predict_layers`, que constituye precisamente la cabeza. El autor transfiere 1553 tensores donantes (5,72 GiB en BF16) como un shard adicional sobre una copia hard-linked del checkpoint VL, fija `num_nextn_predict_layers: 1` en `text_config` y convierte el resultado. El modelo final tiene 938 tensores, 43 bloques y `nextn = 1`, frente a 917 tensores y 42 bloques sin el injerto; se verificó que todos los ficheros publicados conservan `blk.42.*` tras la cuantización.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text` y etiqueta `conversational`.
- Comprensión de imágenes: requiere el fichero `mmproj-Ling-3.0-flash-VL-BF16.gguf` (878.174.144 bytes) para procesar entradas visuales.
- Decodificación especulativa mediante cabeza MTP, con aceptación de borrador medida de 0,722 en la primera posición.
- Uso conjunto de visión y MTP: los ficheros incorporan una corrección de servidor que permite servir imágenes y decodificación especulativa a la vez, cosa que llama.cpp estándar no soporta (aborta el proceso).
- Razonamiento de tipo agéntico y trabajo con prompts largos, favorecido por el buen rendimiento de prefill en el backend ROCm0 (560,5 tok/s en STRIX_LEAN).
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que facilita su integración tras una API compatible con OpenAI.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling y function calling: no disponible en la documentación; la model card menciona cargas de trabajo "agentic/tool" como escenario de uso, pero no detalla mecanismos de llamada a herramientas.

## Casos de uso

- Asistente multimodal local en estación de trabajo AMD: con 128 GiB de memoria unificada en un Ryzen AI Max+ 395, el fichero STRIX_LEAN (68,1 GB) y el proyector BF16 caben holgadamente, permitiendo describir imágenes, responder sobre capturas o extraer información de documentos escaneados sin salir del equipo.
- Procesamiento por lotes de documentos con imagen: el backend ROCm0 ofrece 560,5 tok/s de prefill en STRIX_LEAN, por lo que conviene para ingerir prompts largos con contenido visual y generar respuestas cortas, como resúmenes de facturas o clasificación de formularios.
- Chat interactivo de larga duración: el backend Vulkan0 alcanza 38,04 tok/s de decodificación en STRIX_LEAN y 40,43 tok/s en FAST, adecuado para conversaciones donde prima la velocidad de generación sobre la de prefill.
- Agentes con prompts extensos: la combinación de MTP con `--spec-draft-n-max 1` eleva la decodificación un 12,9 % (de 33,29 a 37,58 tok/s) con una aceptación de borrador de 0,722, lo que compensa parcialmente el coste de prefill del 7,4 % y mejora los turnos agénticos cortos.
- Evaluación e investigación de cuantizaciones de bajo bit-width: los tres niveles publicados (4,38 bpw y 4,70 bpw) con perplejidad medida sobre wikitext-2 permiten estudiar el compromiso entre bits por peso y calidad en un MoE de 124B, incluyendo el hallazgo de que el nivel de mayor bit-width no es el de mejor perplejidad.
- Servicio con API compatible: gracias a la etiqueta `endpoints_compatible`, puede desplegarse tras una interfaz tipo OpenAI para prototipos de producto que requieran entrada de imagen y texto.
- Reproducción de decodificación especulativa en hardware AMD: útil para ingenieros que quieran validar el injerto de cabezas MTP y la corrección del servidor en gfx1151 antes de adoptar el patrón en otros modelos.

## Benchmarks y rendimiento

Perplejidad sobre wikitext-2 (`wiki.test.raw`, 20 fragmentos, `-c 2048 -b 2048`, ROCm0, ajustes idénticos por nivel):

| Fichero | Tamano (bytes) | PPL | ROCm0 PP / TG (tok/s) | Vulkan0 PP / TG (tok/s) |
|---|---:|---:|---:|---:|
| STRIX_LEAN | 68.136.568.224 | 9,2579 ±0,208 | 560,5 / 35,03 | 413,4 / 38,04 |
| FAST | 67.934.440.864 | 9,4640 ±0,213 | 541,8 / 36,33 | 402,7 / 40,43 |
| COHERENT | 72.123.718.560 | 10,0590 ±0,233 | 506,1 / 34,46 | 404,6 / 38,14 |
| Q4_0 sin MTP | 66.492.905.984 | No disponible | No disponible | No disponible |

PP/TG medidos sobre un prompt de 659 tokens generando 128 tokens, MTP con `n-max 1`, equipo en reposo.

Efecto de la configuración MTP sobre STRIX_LEAN en ROCm0 (prompt de 337 tokens, 160 tokens generados):

| Ajuste MTP | Decodificacion (tok/s) | Variacion | Aceptacion del borrador |
|---|---:|---:|---:|
| Desactivado | 33,29 | — | — |
| `--spec-draft-n-max 1` | 37,58 | +12,9 % | 0,722 |
| `--spec-draft-n-max 2` | 31,92 | −4,1 % | 0,475 (0,724 / 0,241) |
| `--spec-draft-n-max 3` | 30,62 | −8,0 % | 0,369 (0,660 / 0,340 / 0,094) |

El coste en prefill del MTP es de 576,7 a 534,3 tok/s (−7,4 %) en la misma medición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: el fichero STRIX_LEAN ocupa 68,1 GB y el proyector multimodal 0,88 GB; el conjunto requiere aproximadamente 69 GB, más overhead de contexto KV. COHERENT sube a 72,1 GB.
- Hardware de referencia: Ryzen AI Max+ 395 con GPU Radeon 8060S (gfx1151) y 128 GiB de memoria unificada, sobre el que se midieron todas las cifras.
- GPU discretas: no se han publicado mediciones para A100, H100 ni RTX 4090. Por tamaño, el modelo no cabe en una RTX 4090 de 24 GB en estas cuantizaciones; en A100/H100 de 80 GB cabría el fichero STRIX_LEAN pero no hay datos de rendimiento.
- Cabe en GPU de consumo: solo en el caso de memoria unificada grande (Strix Halo con 128 GiB). No cabe en GPUs de consumo con VRAM dedicada convencional.
- Despliegue: llama.cpp con `llama-server`, backends ROCm0 y Vulkan0. Se requieren los flags `--spec-type draft-mtp --spec-draft-n-max 1 --spec-draft-n-min 0 --spec-draft-p-min 0.0` para MTP, `--mmproj` para visión, `-ngl 999 -fa on --jinja --parallel 1`, y un servidor corregido que avance el borrador por las posiciones de imagen usando `image_token_id` 157157. El fichero sin MTP sirve para runtimes que no soportan `draft-mtp`.
- Rendimiento medido: prefill de 506,1 a 560,5 tok/s en ROCm0 y de 402,7 a 413,4 tok/s en Vulkan0; decodificación de 34,46 a 36,33 tok/s en ROCm0 y de 38,04 a 40,43 tok/s en Vulkan0. ROCm0 gana prefill un 25-35 %; Vulkan0 gana decodificación un 9-11 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Ling-3.0-flash-VL-MTP-ROCmFP4 (esta ficha) | 124,4B totales / ~5,5B activos | No disponible | MIT | GGUF ROCmFP4, 426 descargas | MTP injertado, visión y MTP simultáneos, optimizado para gfx1151 |
| inclusionAI/Ling-3.0-flash-VL (base) | 124,4B totales / ~5,5B activos | No disponible | No disponible en la informacion | Pesos originales | Sin cabeza MTP; vision y MTP no coexisten en llama.cpp estandar |
| inclusionAI/Ling-3.0-flash (hermano de texto) | No disponible | No disponible | No disponible en la informacion | Pesos originales | Donante de la cabeza MTP (bloque 42); sin torre de vision |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ROCmFP4 está orientada específicamente a AMD Strix Halo (gfx1151); en otras GPU o backends el rendimiento y la corrección pueden diferir y no están documentados.
- El uso conjunto de MTP y visión requiere un servidor parcheado; con llama.cpp estándar el servidor aborta al procesar la primera imagen. Si no se dispone de esa corrección, hay que usar el fichero sin MTP.
- `--spec-draft-n-max` debe fijarse en 1: con valores de 2 o 3 el rendimiento cae por debajo de no usar MTP (aceptación de 0,241 y 0,094 en las posiciones segunda y tercera).
- El nivel COHERENT, pese a ser el mayor y de mayor bit-width, obtiene peor perplejidad (10,0590 frente a 9,2579) y es más lento; no debe asumirse que sea la opción de calidad.
- Los números de rendimiento se midieron en un equipo en reposo; una sola hebra de CPU ocupada altera de forma medible los resultados.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un comportamiento adecuado en castellano sin evaluación previa.
- Longitud de contexto: no disponible; los ejemplos de servidor usan 8192 tokens, pero no se confirma el máximo del modelo.
- Licencia MIT, que permite uso comercial, pero la licencia del modelo base y de los pesos donantes no se detalla en la información disponible; conviene verificar la cadena de licencias antes de producción.
- El repositorio ocupa 275,6 GB, lo que exige espacio de almacenamiento considerable aunque solo se descargue un fichero.
- No hay resultados publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales estándar, por lo que la calidad en tareas concretas no está cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Ling-3.0-flash-VL-MTP-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Hermano de texto (donante de la cabeza MTP): https://huggingface.co/inclusionAI/Ling-3.0-flash
