# jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP-GGUF

## Resumen

ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP-GGUF es una cuantizacion GGUF de 2,3 bits por peso (bpw) del checkpoint Swift 1.5 Qwen3.8-27B Uncensored en BF16, publicada por el usuario jakeatx. El modelo base procede de UkisAI (Swift 1.5 Qwen3.8-27b, a su vez derivado de Qwen3.8-27B) y ha sido modificado para reducir rechazos (abliterated/uncensored). El artefacto resultante pesa 9,00 GB (9.003.017.888 bytes) e incluye la cabeza MTP (multi-token prediction) para decodificacion especulativa interna, pero no incluye el vision tower.

El objetivo declarado es ejecutar un modelo de 27.327.153.664 parametros en tarjetas de 12 GB de VRAM (RTX 3060 12 GB, 3080 12 GB, 3080 Ti) con una ventana de contexto de 204.800 tokens, mediante re-codificacion nativa a tipos tensoriales EXL3 trellis y compresion de cache KV SJ-KVaRN. El autor estima que la cuantizacion conserva en torno al 85 % de la puntuacion BF16 en benchmarks publicados, y la presenta explicitamente como una opcion para 12 GB, no como sustituto del build de 4 bits en tarjetas de 24 GB.

Su relevancia actual es doble: por un lado, explora limites de compresion agresiva (2,3 bpw) sobre un modelo de ~27B con contexto de 200K; por otro, introduce requisitos de runtime no estandar (llamAmpere v0.5, con tipos EXL3 y SJ-KVaRN) que lo alejan del ecosistema llama.cpp convencional. El repositorio acumula 362 descargas y 0 likes, con fecha de creacion 2026-10-09.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle en la informacion proporcionada; el runtime menciona estado recurrente "Gated DeltaNet", lo que apunta a una arquitectura hibrida con componentes de atencion lineal/recurrente. Modelo derivado de Qwen3.8-27B |
| Parametros totales | 27.327.153.664 (27,33B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 204.800 tokens (configuracion documentada para 12 GB); el prompt de prueba alcanzo 203.568 tokens |
| Tipos de cuantizacion | 2,3 bpw; tensores EXL3 trellis (EXL3_2, EXL3_3, EXL3_4). Cache KV K/V a 3 bits (sjkvarn3) con cuerpo trellis (sjkvarn4t), sink f16 de 128 tokens, staging tq6_0 y cola adaptativa de 4.096-8.192 tokens; estado recurrente Gated DeltaNet y cache del drafter en q8_0 |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (campo `license: other`) |
| Formato de pesos | GGUF (archivo unico `ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP.gguf`, 9,00 GB, SHA-256 `3c7f5333fea80bea42660934cdea13bbee3104a2c9b06d50b9f496babb95af90`) |

## Arquitectura y entrenamiento

No hay informacion detallada sobre el entrenamiento original de Swift 1.5 Qwen3.8-27B ni de Qwen3.8-27B: no se especifican numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si documenta la model card es el proceso de cuantizacion: el checkpoint BF16 `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16` (revision `15165fce17cb716934a2b15e746d9c7b061d4a0f`) fue re-codificado nativamente a ~2,3 bits por peso con asignacion de bits por tensor, en un formato inspirado en los modelos Mirai (Mirai S, 2,4 bits, y su port a llama.cpp por alesha-pro). El autor indica explicitamente que no se incluye ningun peso de Mirai: todos los tensores provienen del BF16 de Swift 1.5.

La innovacion tecnica principal es el uso de tipos tensoriales EXL3 trellis junto con decodificacion especulativa MTP integrada: el GGUF contiene el modelo de texto y la capa borrador MTP, que propone hasta 4 tokens por paso con un vocabulario de borrador de 65.536 entradas y ventana de 8.192 tokens. La gestion de memoria se apoya en compresion de cache KV SJ-KVaRN (3 bits en K y V, sink f16 y cola adaptativa) y en la variable `LLAMA_MTP_DRAFT_COMPUTE_LEAN=1`, que limita el micro-batch del contexto del borrador a 64 tokens para reducir su buffer de computo. Estos mecanismos son los que permiten encajar 204.800 tokens de contexto en ~11 GB de VRAM.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento de cadena larga con modo de esfuerzo configurable (en la tarea Pagoda se documento `reasoning effort xhigh`).
- Generacion de codigo: evaluado en LiveCodeBench v6 y en tareas de escritura de paginas web funcionales.
- Decodificacion especulativa nativa mediante cabeza MTP (hasta 4 tokens borrador por paso).
- Contexto largo de hasta 204.800 tokens con cache KV comprimida.
- Modelo "uncensored" / "abliterated": reduccion de rechazos respecto al checkpoint original.
- No incluye vision tower, pese a que el modelo base Qwen3.8-27B pueda tener capacidades multimodales en su version completa; en este GGUF no estan disponibles.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentado formalmente, aunque la tarea Pagoda evaluada es una tarea agentica de esfuerzo alto.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue en GPU de gama consumer con 12 GB: el caso principal documentado. Permite servir un modelo de 27B con contexto de 200K en una RTX 3060 12 GB, 3080 12 GB o 3080 Ti, ajustando el presupuesto a ~11 GB de VRAM.
- Analisis de repositorios y documentacion extensa: con 204.800 tokens de contexto se puede cargar un arbol de codigo o documentacion tecnica completa sin troceado, manteniendo el estado recurrente en q8_0 para reducir memoria.
- Generacion de codigo asistida en local: evaluado en LiveCodeBench v6 con 77,71 % (media agrupada de 7 ejecuciones), adecuado para autocompletado y generacion de funciones en entornos con GPU limitada.
- Generacion de paginas web completas en tareas de agente: en la tarea Pagoda escribio una pagina funcional en 3 de 3 ejecuciones con 30K-42K tokens de razonamiento por ejecucion, frente a 0 de 3 en los modelos comparados.
- Prototipado y experimentacion en investigación sobre cuantizacion extrema: sirve como referencia reproducible de compresion a 2,3 bpw con tipos EXL3 y cache KV comprimida, con harness y resultados publicados en el dataset asociado.
- Asistentes conversacionales de uso interno con contenido sin filtrar: al ser un derivado abliterated, encaja en entornos cerrados donde se requiere menor tasa de rechazos, siempre que la licencia y la politica de uso lo permitan.
- Evaluacion comparativa de eficiencia de tokens: util para medir coste de inferencia, ya que consume 0,73x los tokens de salida de Qwen3.8-27B stock a 4 bits en el conjunto de 24 preguntas del autor.

## Benchmarks y rendimiento

| Benchmark | Este build | Swift 1.5 IQ4_XS-M (4,56 bpw) | Qwen3.8-27B BF16 |
|---|---|---|---|
| LiveCodeBench v6 | 77,71 % (media agrupada de 7 ejecuciones en tarjetas de 12 GB) | 89,25 % | 90,3 % (publicado) |
| Tokens de salida vs Qwen3.8-27B stock a 4 bits (24 preguntas fijas, greedy) | 0,73x (n=24, IC 90 %: 0,54-0,98) | 0,81x | 1,00x (referencia) |
| Razonamiento a temperatura 1.0 vs Swift 1.5 IQ4_XS-M | 1,22x (IC 90 %: 1,11-1,33, 348 respuestas) | 1,00x (referencia) | No disponible |

Tarea Pagoda (esfuerzo xhigh, contexto 204.800, presupuesto de 12 GB):

| Modelo | Tokens de razonamiento por ejecucion | Paginas funcionales |
|---|---|---|
| Este build (2,3 bpw + MTP) | 30K-42K | 3 de 3 |
| Ternary Bonsai 2 27B | 69K-92K | 0 de 3 |
| Fork Mirai 1,5 bpw | 28K-87K | 0 de 3 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: configuracion objetivo de ~11 GB. Con cache KV `3/3t` a contexto 204.800 el servidor usa 11.064 MiB tras el arranque y una respuesta corta. Las pruebas se hicieron con `3/2t` (`-ctv sjkvarn2`), que usa 10.672 MiB tras el arranque y alcanzo un pico de 10.690 MiB con un prompt de 203.568 tokens mas 256 tokens generados (medido en RTX 3090 con nvidia-smi cada 0,5 s).
- GPU recomendadas: RTX 3060 12 GB, RTX 3080 12 GB, RTX 3080 Ti. llamAmpere esta orientado a NVIDIA Ampere (serie RTX 30). Se verifico en RTX 3090.
- Cabe en GPU consumer: si, en el segmento de 12 GB y superiores. En 24 GB el autor recomienda el build de 4 bits (IQ4_XS-M) en lugar de este.
- Opciones de despliegue: `llama-server` de llamAmpere v0.5 (release pendiente en el momento de la publicacion). Stock llama.cpp no carga el modelo por los tipos EXL3. No se documenta soporte para vLLM, Ollama ni TGI.
- Parametros de ejecucion relevantes: `-fa on`, `-b 4096`, `-ub 512`, `--no-context-shift`, `--cache-ram 0`, `--parallel 1`, `-ngl 99`, `--jinja`, `--temp 1.0 --top-k 20 --top-p 0.95 --min-p 0`.
- Latencia y throughput: no se publican cifras de tokens por segundo. La unica metrica de eficiencia disponible es la reduccion de tokens de salida (0,73x frente a Qwen3.8-27B stock a 4 bits), que reduce el coste total por respuesta pero no equivale a throughput medido.

## Comparativa con modelos similares

| Modelo | Parametros | Bits por peso | Contexto documentado | LiveCodeBench v6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este build (jakeatx, 2,3 bpw + MTP) | 27,33B | 2,3 | 204.800 | 77,71 % | swift-open-license-1.0 | GGUF en HuggingFace, requiere llamAmpere v0.5 |
| Swift 1.5 IQ4_XS-M | 27,33B (mismo base) | 4,56 | No disponible | 89,25 % | swift-open-license-1.0 | GGUF, llama.cpp |
| Qwen3.8-27B BF16 (referencia publicada) | 27B aprox. | 16 | No disponible | 90,3 % | No disponible | No disponible |
| Ternary Bonsai 2 27B | 27B aprox. | No disponible | 204.800 (misma prueba) | No disponible | No disponible | No disponible |
| Fork Mirai 1,5 bpw | 27B aprox. | 1,5 | 204.800 (misma prueba) | No disponible | No disponible | No disponible |
| Mirai S (trymirai) | 27B aprox. | 2,4 | No disponible | No disponible | No disponible | HuggingFace; port comunitario a GGUF por alesha-pro |

En la prueba agentica Pagoda, este build es el unico de los tres comparados que genero paginas funcionales (3 de 3), aunque con menos tokens de razonamiento que Ternary Bonsai 2 27B. En LiveCodeBench v6 queda 11,54 puntos porcentuales por debajo de Swift 1.5 IQ4_XS-M sobre el mismo modelo base.

## Limitaciones y advertencias

- Perdida de rendimiento medible: el propio autor estima que la cuantizacion conserva en torno al 85 % de la puntuacion BF16 y que no sustituye al build de 4 bits en tarjetas de 24 GB. En LiveCodeBench v6 la caida frente a IQ4_XS-M es de 11,54 puntos.
- Dependencia de runtime no estandar: requiere llamAmpere v0.5, que en el momento de la publicacion estaba pendiente de release. Stock llama.cpp no carga el archivo, lo que limita portabilidad, integracion con herramientas habituales y reproducibilidad a largo plazo.
- Modelo uncensored/abliterated: la reduccion de rechazos implica mayor probabilidad de generar contenido inapropiado, ofensivo o inseguro. No es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni tasas de alucinacion. Un modelo de 27B cuantizado a 2,3 bpw puede degradar mas en tareas de conocimiento factual que en generacion de codigo.
- Ausencia del vision tower: cualquier capacidad multimodal del modelo base no esta disponible en este GGUF.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del ingles, y no se especifica el comportamiento en castellano.
- Restricciones de licencia: licencia `swift-open-license-1.0` (campo `license: other`), no es una licencia open source estandar. Es imprescindible revisar el texto completo antes de cualquier uso comercial, especialmente por la condicion de derivado abliterated.
- Efecto de la configuracion de sampling: las cifras de eficiencia de tokens se midieron con temperatura 1.0, top-k 20, top-p 0.95; otros ajustes alteran el consumo de tokens de razonamiento.
- Datos de rendimiento limitados: 24 preguntas fijas y 7 ejecuciones de LiveCodeBench en tarjetas de 12 GB constituyen una muestra pequena, con intervalos de confianza amplios (0,54-0,98 en la ratio de tokens).
- Fecha de creacion futura respecto al momento de redaccion (2026-10-09), sin likes y con 362 descargas: escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP-GGUF
- Modelo base (BF16): https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16
- Origen Swift 1.5 (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Dataset con pruebas, videos y harness: https://huggingface.co/datasets/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-LiveCodeBench-Pagoda
- Repositorio del runtime llamAmpere: https://github.com/JakeATX/llamAmpere
- Mirai S (referencia de formato, sin pesos incluidos): https://huggingface.co/trymirai/Qwen3.8-27B-S-experimental
- Port comunitario a GGUF de Mirai S: https://huggingface.co/alesha-pro/Qwen3.8-27B-S-mirai-GGUF

La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo: los unicos resultados obtenidos fueron entradas de diccionario para el termino "jarring", sin relacion con el artefacto. No se han localizado papers, blogs ni demos adicionales.
