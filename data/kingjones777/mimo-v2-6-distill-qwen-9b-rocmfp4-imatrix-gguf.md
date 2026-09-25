# kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-imatrix-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario kingjones777 (Myron Jones). No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado del destilado de ~8,95 mil millones de parámetros que Xiaomi liberó dentro de la familia MiMo-V2.6 (junto a los MoE Pro y Flash) en septiembre de 2026. El modelo base es multimodal (pipeline image-text-to-text), conversacional y está orientado a flujos agénticos y de uso de herramientas.

La particularidad de esta publicación es técnica: aplica una importance matrix (imatrix) sobre los cuantizadores ROCmFP4 desarrollados en el fork ROCmFPX de llama.cpp, con dos niveles de compresión (STRIX_LEAN y FAST) pensados para la iGPU Radeon 8060S de la plataforma AMD Strix Halo (gfx1151, Ryzen AI Max+ 395) con memoria unificada.

Su relevancia es doble. Por un lado, documenta de forma reproducible un resultado negativo: la imatrix empeora la perplejidad en wikitext-2 frente a los builds sin imatrix, en dos escalas de calibración distintas. Por otro, sirve como ejemplo práctico de cuantización FP4 nativa para hardware AMD de memoria unificada, un nicho que hasta ahora dependía mayoritariamente de formatos diseñados para NVIDIA. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Destilado del modelo base MiMo-V2.6-Distill-Qwen-9B; el número de capas, tipo de atención y configuración de cabezas no se detalla en la información disponible |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones), dato de safetensors del modelo base |
| Parámetros activos | no aplica (no se indica que el modelo base sea MoE; los MoE de la familia son Pro y Flash) |
| Longitud de contexto | no disponible como especificación del modelo; el ejemplo oficial del autor arranca llama-server con `-c 32768` |
| Tipos de cuantización | Q4_0 ROCmFP4 (tipos ggml 100-106 del fork ROCmFPX): STRIX_LEAN (ftype 106) y FAST (ftype 103); tensor de salida forzado a q6_K; proyector de visión mmproj en F16 (alojado en el repositorio hermano) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (requiere build de llama.cpp con soporte ROCmFP4; llama.cpp estándar rechaza estos tipos de tensor) |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (revision 2367e865d009c13ac81713a2878291d33ab28177) |
| Tamaño de los archivos | 5.251.552.672 bytes (STRIX_LEAN) y 4.771.354.016 bytes (FAST); el repositorio incluye además el fichero `.imatrix` de 5.120.154 bytes |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base pertenece a la serie MiMo-V2.6 de Xiaomi, presentada el 21 de septiembre de 2026. Esa familia incluye dos modelos omnimodales nativos con arquitectura MoE (MiMo-V2.6-Pro y MiMo-V2.6-Flash) y, en paralelo, este destilado de 9B sobre arquitectura Qwen, liberado junto con recursos de investigación de reinforcement learning. La nomenclatura "Distill-Qwen-9B" indica que se trata de un destilado sobre una base Qwen de ~9B, aunque los detalles de composición del dataset, número de tokens de entrenamiento y si hubo RLHF/DPO no están disponibles en la información proporcionada. Según el propio autor de la cuantización, el modelo base está orientado a uso agéntico y de herramientas.

Lo específico de este repositorio no es el entrenamiento, sino el proceso de cuantización. Los cuantizadores ROCmFP4 ramifican según la presencia de imatrix: sin ella aplican `rocmfp4_quantize_row_q4_0_ref`, y con ella `rocmfp4_quantize_row_q4_0_weighted`. El autor generó la imatrix v2 con un corpus mixto de 11.220.262 bytes (`calibration_datav3.txt` + `wikitext-2 wiki.train.raw`), 200 chunks, contexto 4096, `-b 2048 -ub 512`, y evaluó siempre sobre un corpus held-out (`wiki.test.raw`, disjunto del de calibración) con 40 chunks a contexto 4096. Los dos niveles publicados, STRIX_LEAN y FAST, se diferencian en el reparto de bits por tensor (ftype 106 frente a 103). Este checkpoint no incluye cabecera MTP.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada vía `--jinja`.
- Procesamiento de imagen y texto (image-text-to-text) mediante el proyector `mmproj-MiMo-V2.6-Distill-Qwen-9B-F16.gguf`, que debe descargarse del repositorio hermano.
- Orientación agéntica y de uso de herramientas heredada del destilado base: el autor describe el modelo como "agentic/tool-use distill".
- Razonamiento multi-paso en el contexto de tareas verificables, según la línea de investigación en RL de la serie MiMo-V2.6.
- Ejecución local en hardware AMD con memoria unificada vía llama-server con backend ROCm.
- Capacidades multilingües: no disponibles.
- No incluye cabecera MTP (multi-token prediction) en este checkpoint.
- No se documentan capacidades de audio, ni modo "thinking" explícito, ni benchmarks funcionales de código o matemáticas.

## Casos de uso

- Inferencia local en equipos Strix Halo: el destino declarado del repositorio es la iGPU Radeon 8060S (gfx1151) con memoria unificada de 128 GiB, como la del Ryzen AI Max+ 395, donde el autor midió entre 40,75 y 43,45 tokens/s de decodificación con los builds cuantizados.
- Reproducción de experimentos de cuantización: el repositorio incluye el propio fichero `.imatrix`, la revisión exacta del binario (ROCmFPX @ 85d8f7e) y los comandos de `llama-imatrix` y `llama-quantize`, lo que permite repetir el resultado negativo publicado sin recalibrar.
- Asistente agéntico local con tool calling: al ser un destilado orientado a uso de herramientas, puede integrarse en flujos de agente que invoquen funciones mediante la plantilla de chat Jinja en llama-server.
- Análisis de documentos con componente visual: gracias al proyector mmproj, permite tareas de pregunta-respuesta sobre imágenes o capturas dentro de un contexto de hasta 32.768 tokens en la configuración de ejemplo.
- Laboratorio de evaluación de cuantizaciones FP4: sirve como banco de pruebas para medir el impacto real de la imatrix en cargas de trabajo de código o tool-use, que el autor reconoce no haber medido y que podrían comportarse de forma distinta a la prosa de wikitext-2.
- Servidor de chat interno de bajo coste: con licencia MIT y pesos de 4,77-5,25 GB, es viable desplegar un endpoint conversacional en una máquina única sin GPU dedicada, siempre que se use el fork ROCmFPX.
- Validación cruzada frente a los builds sin imatrix: los dos niveles publicados (STRIX_LEAN y FAST) permiten comparar perplejidad y velocidad con sus equivalentes planos y decidir cuál usar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks funcionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato medido es la perplejidad sobre wikitext-2 y la velocidad de decodificación.

| Build | Tamaño (bytes) | ftype | PPL wikitext-2 (40 chunks, ctx 4096) |
|---|---:|---:|---:|
| STRIX_LEAN-imatrix | 5.251.552.672 | 106 | 8,3485 ±0,081 |
| FAST-imatrix | 4.771.354.016 | 103 | 8,7748 ±0,086 |
| STRIX_LEAN (sin imatrix) | 5.251.552.384 | 106 | 8,2378 ±0,079 |
| FAST (sin imatrix) | 4.771.353.728 | 103 | 8,6603 ±0,084 |
| BF16 (referencia) | 17.920.693.376 | — | 8,4921 ±0,084 |

Efecto de la calibración sobre la perplejidad:

| Calibración | Corpus | PPL STRIX_LEAN | PPL FAST |
|---|---|---:|---:|
| ninguna | — | 8,2378 | 8,6603 |
| v1 | `calibration_datav3.txt`, 0,3 MB, 16 chunks | 8,3266 | 8,6764 |
| v2 (la publicada) | `calibration_datav3` + wikitext-2 train, 11,2 MB, `--chunks 200` | 8,3485 | 8,7748 |

Velocidad de decodificación medida en Ryzen AI Max+ 395 / Radeon 8060S (gfx1151):

| Build | Tokens/s de decodificación |
|---|---:|
| STRIX_LEAN-imatrix | 40,75 |
| FAST-imatrix | 43,45 |
| STRIX_LEAN sin imatrix | 40,97 |
| FAST sin imatrix | 43,46 |

## Requisitos de hardware

- Peso de los tensores cuantizados: 5,25 GB (STRIX_LEAN) y 4,77 GB (FAST), en bytes decimales. Hay que sumar el proyector de visión en F16 y el KV cache.
- El KV cache a 32.768 tokens puede añadir varios GB adicionales; el autor no publica la configuración de capas ni de cabezas KV, por lo que no es posible dar una cifra exacta.
- Hardware de referencia medido: Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), 128 GiB de memoria unificada, ROCm 7.2.4, con `HSA_OVERRIDE_GFX_VERSION=11.5.1`.
- Compatibilidad con GPU de consumo: los pesos caben en VRAM de 8 GB o más en términos de tamaño, pero los tipos de tensor ROCmFP4 (ggml 100-106) solo los soporta el fork ROCmFPX de llama.cpp y están apuntados a gfx1151; no hay evidencia publicada de funcionamiento en otras arquitecturas.
- Despliegue: únicamente `llama-server` / `llama.cpp` compilado con soporte ROCmFP4 (repositorio charlie12345/ROCmFPX en el commit 85d8f7e83499e434c24993e6e1f3800568b5adfd, build `build-hipvk` con `-DGGML_HIP=ON -DGGML_VULKAN=ON -DGPU_TARGETS=gfx1151`). No es compatible con llama.cpp estándar, Ollama, vLLM ni TGI.
- Comando de arranque de referencia: `llama-server -m …-STRIX_LEAN-imatrix.gguf --mmproj mmproj-MiMo-V2.6-Distill-Qwen-9B-F16.gguf -dev ROCm0 -ngl 999 -fa on -dio --jinja -c 32768`.
- Throughput medido: 40,75-43,45 tokens/s de decodificación, idéntico dentro del ruido de ejecución a los builds sin imatrix (control de deriva del 0,19 %). La imatrix altera pesos, no el layout ni el ancho de bits, por lo que no hay ganancia de velocidad.
- Latencia de prefill: no disponible.

## Comparativa con modelos similares

| Modelo / build | Parámetros | Formato | PPL wikitext-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (STRIX_LEAN-imatrix) | ~8,95 B | GGUF ROCmFP4, ftype 106 | 8,3485 | MIT | Fork ROCmFPX, gfx1151 |
| kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-GGUF (builds planos) | ~8,95 B | GGUF ROCmFP4, ftype 106/103 | 8,2378 / 8,6603 | MIT | Fork ROCmFPX, gfx1151; incluye el mmproj |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (BF16) | ~8,95 B | safetensors BF16 | 8,4921 | MIT | Estándar, cualquier runtime compatible |
| mondk/MiMo-V2.6-Distill-Qwen-9B-GGUF | ~8,95 B | GGUF estándar | no disponible | no disponible en la información recogida | llama.cpp estándar |

La comparación relevante es interna: el build con imatrix es ligeramente peor en perplejidad de prosa que el build plano del que deriva, manteniendo el mismo tamaño y la misma velocidad. Frente al BF16 de referencia, ambos cuantizados quedan por debajo en PPL de wikitext-2 (8,24 y 8,77 frente a 8,49), un resultado que el propio autor califica de poco concluyente dado que solo se usaron 40 chunks y que la referencia BF16 no está pensada para comparaciones finas con esa configuración.

## Limitaciones y advertencias

- Resultado negativo documentado: la imatrix empeora la perplejidad en wikitext-2 en las dos escalas de calibración probadas (+0,111 en STRIX_LEAN y +0,115 en FAST respecto a los builds planos). El autor recomienda usar los builds planos para uso general.
- Solo se midió perplejidad de prosa. No hay benchmarks de código, tool-use, visión ni matemáticas, pese a que el modelo base está orientado a uso agéntico. El autor señala que una imatrix ponderada hacia código podría mejorar esas cargas a costa de la PPL de wiki, pero no lo midió ni publicó cifra alguna.
- Perplejidad calculada con 40 chunks a contexto 4096: suficiente para separar estos builds entre sí, insuficiente para afirmaciones finas sobre BF16.
- Dependencia estricta de un fork: stock llama.cpp rechaza los tipos de tensor 100-106. Ollama, vLLM, TGI y los runtimes habituales no pueden cargar estos ficheros directamente.
- Nicho de hardware muy concreto: el build está apuntado a gfx1151 (Strix Halo). No hay validación publicada en otras GPU AMD ni NVIDIA.
- El proyector de visión no está en este repositorio; hay que descargarlo del repositorio hermano, lo que complica la reproducibilidad en un solo paso.
- Este checkpoint no incluye cabecera MTP, lo que descarta técnicas de decodificación especulativa basadas en ella.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni informes independientes de calidad.
- Riesgo de alucinación inherente a un modelo de ~9B destilado; no hay datos de evaluación de fidelidad factual ni de tasas de error en tool calling.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del inglés o el chino sin evaluación propia.
- Licencia MIT en el repositorio de cuantización y en el modelo base, lo que permite uso comercial, pero la licencia del modelo base debe verificarse de forma independiente antes de desplegar en producción.
- Advertencia sobre la fecha: los metadatos de creación y actualización del repositorio (24 de septiembre de 2026) son posteriores a la ventana habitual de publicación; conviene verificar la vigencia de los enlaces.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-imatrix-GGUF
- Repositorio hermano con los builds planos y el mmproj: https://huggingface.co/kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Fork ROCmFPX de llama.cpp usado para la cuantización: https://github.com/charlie12345/ROCmFPX (commit 85d8f7e83499e434c24993e6e1f3800568b5adfd)
- Anuncio oficial de la serie MiMo-V2.6: https://mimo.mi.com/docs/en-US/news/latest/v2-6
- Página de producto de MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Perfil de HuggingFace del autor: https://huggingface.co/kingjones777/models
- Cuantización GGUF alternativa de terceros: https://huggingface.co/mondk/MiMo-V2.6-Distill-Qwen-9B-GGUF
- Cobertura externa del lanzamiento: https://www.brocker.org/xiaomi-mimo-v26-pro-flash-distill-qwen-open-weights
