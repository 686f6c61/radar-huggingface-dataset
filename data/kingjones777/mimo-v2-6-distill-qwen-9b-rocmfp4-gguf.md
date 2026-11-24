# kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-GGUF

## Resumen

Esta ficha describe una cuantización comunitaria del modelo MiMo-V2.6-Distill-Qwen-9B, publicado originalmente por XiaomiMiMo y redistribuido por el usuario kingjones777 en formato GGUF con un tipo de tensor propietario denominado ROCmFP4, orientado específicamente al silicio AMD Strix Halo (gfx1151). El modelo base es un transformer denso de aproximadamente 8.950 millones de parámetros con capacidades multimodales (image-text-to-text) y orientación agéntica con soporte de tool use. La relevancia de esta variante no reside en el modelo en sí, sino en el trabajo de cuantización y en las mediciones de rendimiento publicadas sobre hardware AMD de consumo, un nicho con documentación escasa.

El autor distribuye dos niveles de cuantización: STRIX_LEAN (5,25 GB, cabeza de salida protegida en q6_K) y FAST (4,77 GB), además de una torre de visión exportada aparte como `mmproj` en F16 (918 MB). Las cifras de rendimiento y perplejidad están medidas sobre un Ryzen AI Max+ 395 con Radeon 8060S y 128 GiB de memoria unificada, con un binario personalizado de llama.cpp (ROCmFPX) que añade los tipos de tensor 100-106. El llama.cpp estándar rechaza estos ficheros.

Un detalle técnico importante documentado por el autor: el checkpoint no contiene cabeza MTP (multi-token prediction) pese a que su `config.json` declara `mtp_num_hidden_layers: 1`; el índice de pesos lista 760 tensores sin ninguna entrada `mtp`/`nextn`. Esto invalida las estrategias de decodificación especulativa basadas en draft heads (`draft-mtp`, `draft-dflash`, `draft-dspark`, `draft-eagle3`) y explica por qué la especulación por ngramas no aporta ganancia medible en prompts no vistos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text); detalles internos del modelo base no disponibles |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de arranque del autor (`-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | Q4_0 con tipos de tensor ROCmFP4 (ftype 106 en STRIX_LEAN, 103 en FAST); torre de visión en F16; referencia BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |
| Tamaño de fichero | STRIX_LEAN 5.251.552.384 bytes; FAST 4.771.353.728 bytes; mmproj F16 918.166.048 bytes |
| Tipo de tensor GGML | 100-106 (requiere build con soporte ROCmFP4) |
| Backend objetivo | AMD gfx1151 (Strix Halo, Ryzen AI Max+ 395, Radeon 8060S) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 8,95 B parámetros destilado a partir de Qwen, con torre de visión para entrada image-text-to-text y orientación explícita a uso agéntico y tool calling según los tags del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original; esos datos no están en la información proporcionada y corresponderían a la model card de XiaomiMiMo.

La contribución técnica de esta variante es la cuantización a un formato de 4 bits específico para el hardware AMD gfx1151, con dos configuraciones diferenciadas por el tratamiento de la cabeza de salida. STRIX_LEAN aplica `--output-tensor-type q6_K`, lo que cuesta 0,45 GB adicionales y un 6,1 % de velocidad de decodificación, a cambio de una mejora del 4,9 % en perplejidad sobre wikitext-2 (8,2378 frente a 8,6603). El autor advierte explícitamente que la perplejidad de STRIX_LEAN por debajo de la referencia BF16 (8,4921) en una muestra de 40 chunks no debe interpretarse como una victoria de 4 bits sobre 16 bits, sino como ruido de cuantización favorable en una evaluación estrecha con ±0,08 de error.

El autor documenta también que la familia de decodificación especulativa por ngramas (`ngram-map-k`, `ngram-simple`, `ngram-mod`, `ngram-cache`) no aporta ganancia en prompts no vistos: todas las celdas medidas caen en una banda del 4,4 % con un control de deriva del 0,19 %. Un resultado previo de 141 tok/s en Vulkan con `ngram-simple` se identifica como artefacto de medición por calentar con el mismo prompt que luego se medía.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla Jinja (`--jinja` en el arranque).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante la torre de visión exportada como `mmproj`.
- Tool calling y function calling, según los tags `tool-use` y `agentic` del repositorio.
- Flujos agénticos y razonamiento multi-paso, según la orientación declarada del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD Strix Halo: el modelo cabe holgadamente en los 128 GiB de memoria unificada del Ryzen AI Max+ 395 y permite ejecutar un asistente multimodal sin GPU discreta, con contexto de 32.768 tokens.
- Análisis de documentos con imágenes en local: la torre de visión en F16 permite pasar capturas, diagramas o páginas escaneadas junto con instrucciones textuales, manteniendo los datos en el equipo.
- Automatización de tareas con tool calling: el modelo puede invocar funciones externas en pipelines de agentes, encadenando llamadas dentro de una misma ventana de contexto de 32k.
- Prototipado de agentes de código en hardware de consumo: con 8,95 B parámetros y licencia MIT, es viable integrarlo en entornos de desarrollo sin restricciones de uso comercial.
- Evaluación comparativa de cuantizaciones en AMD: los dos niveles publicados (STRIX_LEAN y FAST) permiten medir el compromiso entre perplejidad y velocidad de decodificación en gfx1151 con cifras de referencia reproducibles.
- Despliegue en servidor llama.cpp con backend ROCm: el autor reporta 40,97 tok/s de decodificación y 650,6 tok/s de prefill en STRIX_LEAN, suficiente para uso interactivo individual o de pequeño equipo.
- Procesamiento por lotes de imágenes con texto asociado: el prefill de 650-681 tok/s permite absorber prompts multimodales largos con latencia aceptable.

## Benchmarks y rendimiento

Mediciones del autor sobre Ryzen AI Max+ 395 (Radeon 8060S, gfx1151), 128 GiB unificados, equipo dedicado en reposo.

| Métrica | STRIX_LEAN | FAST | BF16 (referencia) |
|---|---:|---:|---:|
| Tamaño | 5.251.552.384 B | 4.771.353.728 B | 17.920.693.376 B |
| ftype | 106 | 103 | — |
| Decode (tok/s) | 40,97 | 43,46 | — |
| Prefill (tok/s) | 650,6 | 681,4 | — |
| Perplejidad wikitext-2 (40 chunks) | 8,2378 ±0,079 | 8,6603 ±0,084 | 8,4921 ±0,084 |

Comparativa de backend sobre el nivel FAST, generaciones de 256 tokens, mismas flags:

| Backend | Especulación | Decode (tok/s) | Prefill (tok/s) |
|---|---|---:|---:|
| ROCm0 | ninguna | 43,48 | 687,6 |
| ROCm0 | ngram-map-k | 43,48 | 688,4 |
| ROCm0 | ngram-simple | 43,23 | 689,6 |
| ROCm0 | ngram-mod | 43,42 | 682,6 |
| ROCm0 | ngram-cache | 42,19 | 681,3 |
| Vulkan0 | ninguna | 42,14 | 509,9 |
| Vulkan0 | ngram-simple | 41,66 | 519,5 |
| Vulkan0 | ngram-cache | 41,69 | 509,4 |
| Vulkan0 | ngram-map-k | 41,59 | 517,0 |
| Vulkan0 | ngram-mod | 41,93 | 498,8 |
| Control de deriva (Vulkan0/ninguna, re-ejecución) | — | 42,06 | 497,1 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas de calidad son las de perplejidad sobre wikitext-2.

## Requisitos de hardware

- VRAM/memoria: 5,25 GB para STRIX_LEAN, 4,77 GB para FAST, más 0,92 GB para el `mmproj` F16 si se usa visión. En Strix Halo se asigna desde memoria unificada.
- Hardware objetivo declarado: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), 128 GiB unificados.
- GPU discretas: no hay datos medidos para A100, H100 o RTX 4090; los tipos de tensor ROCmFP4 requieren un build de llama.cpp con soporte (tipos 100-106) y están orientados a gfx1151. El llama.cpp estándar rechaza estos ficheros.
- Cabe en GPU de consumo: sí, en el hardware objetivo (memoria unificada). En GPUs discretas de consumo no está verificado y probablemente requiera compilar el fork ROCmFPX con el target correspondiente.
- Despliegue: `llama-server` del fork ROCmFPX (commit 85d8f7e83499e434c24993e6e1f3800568b5adfd) compilado con `-DGGML_HIP=ON -DGGML_VULKAN=ON -DGPU_TARGETS=gfx1151 -DGGML_HIP_GRAPHS=ON -DGGML_HIP_NO_VMM=ON`. Variables de entorno: `HSA_OVERRIDE_GFX_VERSION=11.5.1`. Flags: `-dev ROCm0 -ngl 999 -fa on -dio --jinja -c 32768`.
- Latencia/throughput medidos: 40,97-43,48 tok/s de decodificación y 650-689 tok/s de prefill según nivel y backend. ROCm supera a Vulkan en un 3,2 % en decodificación y un 35 % en prefill.
- Decodificación especulativa: sin efecto útil. El checkpoint no contiene cabeza MTP y la especulación por ngramas no mejora en prompts no vistos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-ROCmFP4 (esta ficha) | 8,95 B | 32.768 (en el ejemplo) | GGUF ROCmFP4 | MIT | Optimizado para gfx1151; requiere fork de llama.cpp |
| MiMo-V2.6-Distill-Qwen-9B (base, XiaomiMiMo) | 8,95 B | no disponible | safetensors | MIT | Fuente BF16; sin mediciones en esta información |
| MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-imatrix | 8,95 B | no disponible | GGUF ROCmFP4 | MIT | Variante con matriz de importancia del mismo autor |
| Otras cuantizaciones GGUF del mismo base | 8,95 B | no disponible | GGUF estándar | MIT | No verificadas en esta información; ejecutables con llama.cpp estándar |

No se dispone de datos de benchmarks que permitan comparar calidad frente a modelos de otros autores del mismo tamaño.

## Limitaciones y advertencias

- El llama.cpp estándar rechaza los tipos de tensor ROCmFP4 (100-106); sin el fork ROCmFPX el modelo no carga.
- El soporte está orientado a gfx1151 (Strix Halo). El rendimiento en otras GPU AMD o en NVIDIA no está medido.
- Sin cabeza MTP real pese a lo que declara `config.json`; las estrategias de decodificación especulativa basadas en draft heads no funcionan.
- La especulación por ngramas no aporta ganancia medible en prompts no vistos (banda del 4,4 %, control de deriva del 0,19 %).
- La perplejidad inferior a BF16 en STRIX_LEAN se midió sobre solo 40 chunks de wikitext-2; no es evidencia de superioridad de la cuantización de 4 bits.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera del inglés sin verificación previa.
- Riesgo de alucinación inherente a un modelo de 8,95 B destilado; no hay benchmarks de calidad publicados en esta información.
- Sesgos del modelo base no documentados en la información disponible.
- La licencia MIT permite uso comercial, pero la redistribución debe respetar también las condiciones del modelo base XiaomiMiMo.
- El rendimiento medido corresponde a un equipo dedicado en reposo; en cargas concurrentes o con memoria compartida por la CPU, las cifras pueden degradarse.
- La cuantización reduce la fidelidad respecto a BF16; para tareas sensibles a precisión numérica conviene validar contra el modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-GGUF
- Variante con matriz de importancia: https://huggingface.co/kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-imatrix-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Fork de llama.cpp con soporte ROCmFP4: https://github.com/charlie12345/ROCmFPX (commit 85d8f7e83499e434c24993e6e1f3800568b5adfd)
- Revisión del modelo base usada en la conversión: 2367e865d009c13ac81713a2878291d33ab28177
