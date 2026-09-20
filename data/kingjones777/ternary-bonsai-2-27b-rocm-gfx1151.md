# kingjones777/Ternary-Bonsai-2-27B-ROCm-gfx1151

## Resumen

Ternary-Bonsai-2-27B-ROCm-gfx1151 es un repositorio de documentación técnica publicado por el usuario kingjones777 que **no contiene pesos**. Su contenido describe cómo ejecutar el modelo `prism-ml/Ternary-Bonsai-2-27B-gguf` (27B nominales, pesos ternarios en formato GGUF) sobre el backend ROCm de llama.cpp en GPUs AMD con arquitectura gfx1151 (Strix Halo), una combinación que la model card original del modelo base no cubre: esta solo lista CUDA, Metal y CPU.

El repositorio aporta dos contribuciones concretas. La primera es una guía de selección de empaquetado: en ROCm solo el tipo `PQ2_0` recibe el kernel MMQ, mientras que `PTQ1_0` queda excluido por un guardado `#if !defined(GGML_USE_HIP)` en `ggml/src/ggml-cuda/mmq.cuh` y cae a un camino de desquantización a F16. La segunda es un parche de 18 líneas sobre `src/models/qwen35.cpp` que corrige la ausencia de la transformada inversa de Hadamard en el grafo del borrador MTP, lo que habilita decodificación especulativa con un incremento medido de hasta el 66 % en decodificación.

Es relevante ahora porque permite ejecutar un modelo de 27B con atención mayoritariamente lineal y ventana de 131.072 tokens en hardware de consumo AMD (iGPU Strix Halo) con velocidades de 20-34 tokens/s, algo que hasta la fecha solo estaba documentado para GPUs NVIDIA. El repositorio también documenta por qué el backend Vulkan no es viable para estos kernels (3,83 t/s frente a 23,78 t/s en ROCm) y compara dos cabezales especulativos alternativos: MTP y DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios y atención híbrida (~75 % lineal, según la documentación del repositorio); ruta de código `qwen35` en llama.cpp (`src/models/qwen35.cpp`) |
| Parametros totales | 27B (según la denominación del modelo base; no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | 131.072 tokens (`-c 131072`), soportado con MTP activo sin reducción |
| Tipos de cuantizacion | Empaquetados ternarios `PQ2_0` (6,70 GiB) y `PTQ1_0` (5,53 GiB), mismos pesos lógicos con distinto layout de almacenamiento (1,75 frente a 2,13 bpw); cabezal especulativo DFlash2 en Q8_0 (2,06 GB); fallback a F16 por desquantización en ROCm para `PTQ1_0` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio documental no contiene pesos; los pesos residen en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27B con pesos ternarios, pensado para inferencia local con huella de memoria reducida. La documentación indica que aproximadamente el 75 % de sus capas emplean atención lineal, lo que mantiene el KV cache lo bastante pequeño como para sostener 131.072 tokens de contexto sin recortes, y que el modelo arranca por defecto en modo de razonamiento `xhigh`. El árbol de llama.cpp que lo ejecuta corresponde a la arquitectura `qwen35`, y el repositorio describe un cabezal MTP (multi-token prediction) procedente de Qwen3.8-27B, con 866 tensores, bloques 0-64 y `nextn_predict_layers = 1`. También se documenta soporte multimodal mediante `--mmproj`, compatible con la decodificación especulativa.

La innovación técnica central del repositorio es la corrección del grafo del borrador MTP. El grafo construye su propia búsqueda de embeddings de tokens y omite la transformada inversa de Hadamard que `llm_graph_context::build_inp_embd()` aplica en la ruta principal, lo que provoca el fallo `Hadamard-latent table 'token_embd.weight' is read without the inverse transform` al crear el contexto. El parche inserta la rotación y el cambio de signo inmediatamente después de `tok_embd = ggml_get_rows(ctx0, tok_embd_w, inp->tokens);`, respetando el orden rotación primero y signo después. No se proporciona información sobre el dataset de entrenamiento, el número de tokens vistos ni el uso de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto con modo de razonamiento activado por defecto en nivel `xhigh`.
- Reescritura verbatim de texto: en las pruebas del autor, todas las variantes produjeron reescrituras exactas byte a byte.
- Tool calling / function calling: el modelo superó las pruebas de herramientas 3/3 en todas las configuraciones medidas.
- Decodificación especulativa mediante MTP (`--spec-type draft-mtp`) y mediante n-gramas (`ngram-mod`), con ganancias distintas según el tipo de tráfico.
- Capacidades de visión a través de `--mmproj`, verificado como compatible con MTP (visión 3/3, sin `GGML_ABORT`).
- Contexto largo de hasta 131.072 tokens, apto para tareas que requieren recuperar y citar material extenso del propio contexto.
- Ejecución en GPU AMD vía ROCm (gfx1151), con backend Vulkan funcional pero no competitivo para estos kernels.
- Capacidades multilingües: no disponible.

## Casos de uso

- Servicio de razonamiento local en estaciones de trabajo con iGPU Strix Halo: desplegando `PQ2_0` con ROCm y MTP activo se obtienen entre 31 y 34 tokens/s de generación, suficiente para asistentes interactivos sin depender de GPU dedicada.
- Reescritura y citado de documentos largos: con `ngram-mod` el rendimiento en tráfico de reescritura verbatim sube de 23,52 a 45,06 tokens/s (+92 %), lo que lo hace adecuado para pipelines de normalización de texto que citan fragmentos ya presentes en el contexto.
- Agentes con tool calling: al superar las pruebas de herramientas 3/3, puede integrarse en flujos multi-paso donde el modelo invoca funciones y encadena resultados durante 131.072 tokens de contexto.
- Procesamiento de documentos con imagen: gracias a `--mmproj` y a su convivencia con MTP, permite extracción de información de capturas, diagramas o páginas escaneadas dentro de la misma sesión de inferencia.
- Documentación y soporte técnico sobre bases de conocimiento extensas: el KV cache reducido por la atención lineal permite mantener manuales completos en contexto sin sacrificar velocidad de decodificación.
- Banco de pruebas de decodificación especulativa: el repositorio incluye metodología reproducible (`llama-bench`, 3 repeticiones, servidor nuevo por brazo) para comparar MTP, n-gramas y DFlash2 sobre el mismo binario y arnés.
- Validación de portabilidad ROCm/Vulkan: útil para equipos que necesitan decidir entre ambos backends antes de comprometerse con un despliegue en hardware AMD, con cifras de 23,78 t/s frente a 3,83 t/s.
- Evaluación de cabezales especulativos de terceros: el repositorio documenta cómo construir y comparar el runtime de DFlash2 frente a MTP, con ganancias medidas de 1,64x en generación y 1,96x en reescritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se aporta son mediciones de throughput con `llama-bench` (3 repeticiones, máquina en silencio) y de velocidad de generación en tareas reales.

Elección de empaquetado en gfx1151:

| Empaquetado | Tamano | Backend | pp512 | tg128 |
|---|---:|---|---:|---:|
| PQ2_0 | 6,70 GiB | ROCm | 216,78 | 23,78 |
| PTQ1_0 | 5,53 GiB | ROCm | 277,97 | 20,12 |
| PTQ1_0 | 5,53 GiB | Vulkan | 210,52 | 3,83 |
| PQ2_0 | — | Vulkan | Sin shader PQ2_0 | — |

El autor señala que en gfx1151 el comportamiento del prefill se invierte respecto a la model card original: `PQ2_0` supone −22 % en prefill y +18 % en decodificación.

Efecto de la decodificación especulativa (3 tareas de generación y 3 fuentes de reescritura distintas, servidor nuevo por brazo):

| Configuracion | Generacion (t/s) | Reescritura verbatim (t/s) |
|---|---:|---:|
| PQ2_0, sin especulación | 20,49 | 23,52 |
| PQ2_0 + `ngram-mod` | 20,25 | 45,06 |
| Fichero MTP, sin especulación | 19,51 | 20,56 |
| MTP + `draft-mtp --spec-draft-n-max 1` | 31,07 | 37,57 |
| MTP + `draft-mtp --spec-draft-n-max 2` | 33,93 | 38,55 |
| MTP + `draft-mtp --spec-draft-n-max 3` | 30,75 | 41,37 |

Comparativa MTP frente a DFlash2 en el mismo binario, mismo arnés y misma sesión:

| Configuracion | Generacion (t/s) | vs control | Reescritura verbatim (t/s) | vs control |
|---|---:|---:|---:|---:|
| Control, sin especulación | 23,76 | — | 23,54 | — |
| `draft-mtp --spec-draft-n-max 2` | 39,04 | 1,64x | 46,12 | 1,96x |
| `draft-dflash` | Tabla truncada en la información disponible | — | — | — |

Advertencia del propio autor: las mediciones de generación sobre este modelo tienen un ruido de ±10 % entre ejecuciones (una remedición posterior del baseline dio 23,62 / 19,82 / 22,79 sobre trabajo idéntico), por lo que n-max 1 y n-max 2 no están estadísticamente separados. La columna de reescritura, con menos ruido, favorece n-max 3. Todas las variantes suponen una mejora amplia frente a no usar especulación.

## Requisitos de hardware

- Huella de pesos: 6,70 GiB para el empaquetado `PQ2_0` y 5,53 GiB para `PTQ1_0`. A esto hay que sumar el KV cache, que el autor describe como contenido por el uso mayoritariamente lineal de la atención y que cabe completo a 131.072 tokens.
- GPU de referencia de toda la documentación: AMD gfx1151 (Strix Halo), donde se obtienen 23,78 t/s de decodificación con `PQ2_0`.
- Cabe en iGPU de consumo con memoria unificada; el repositorio no aporta mediciones para GPUs dedicadas NVIDIA o AMD de gama alta.
- ROCm es el backend recomendado. Vulkan no es viable para estos kernels: 3,83 t/s en AMD RADV y 1,03 t/s en una Intel Arc 140T, frente a 23,78 t/s en ROCm.
- Con MTP activo se alcanzan 31,07-33,93 t/s de generación, sin necesidad de reducir el contexto.
- Aceleración adicional: `ngram-mod` eleva la reescritura verbatim a 45,06 t/s pero no ayuda en generación libre (−1 %).
- Despliegue: llama.cpp (`llama-bench` para medición, `llama-server` para servicio), backend ROCm/HIP, con `--spec-type draft-mtp` y `--mmproj` para multimodal.
- Cabezal especulativo alternativo: DFlash2 requiere compilar un runtime propio (`runtime/prism-dflash2-source.tar.gz`), ya que la rama `prism` estándar falla con `done_getting_tensors: wrong number of tensors; expected 81, got 58`. Su runtime de publicación apunta a CUDA 13.3 / SM120 Blackwell, pero el código fuente compila para gfx1151 sin cambios.
- Latencias o throughput en otras GPU: no disponibles.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B con `PQ2_0` en ROCm | 27B (ternario) | 131.072 | 216,78 t/s prefill, 23,78 t/s decode (gfx1151) | Apache 2.0 | Modelo base público en GGUF |
| Mismo modelo con `PTQ1_0` en ROCm | 27B (ternario) | 131.072 | 277,97 t/s prefill, 20,12 t/s decode | Apache 2.0 | Mismo modelo, distinto empaquetado |
| Mismo modelo con MTP (`decent-jawfish/bonsai-2-27b-mtp`) | 27B + cabezal MTP | 131.072 | Hasta 39,04 t/s generación (1,64x) | No disponible en la información | Requiere parche de 18 líneas |
| Mismo modelo con DFlash2 (`ProCreations/Ternary-Bonsai-2-27B-DFlash2`) | 27B + cabezal Q8_0 de 2,06 GB | 131.072 | Datos truncados en la información disponible | No disponible en la información | Requiere runtime propio; publicación orientada a CUDA 13.3 / SM120 |

No se dispone de datos que permitan comparar con modelos de otros autores y tamaños similares.

## Limitaciones y advertencias

- Este repositorio **no contiene pesos**: es documentación. Cualquier uso real debe descargar `prism-ml/Ternary-Bonsai-2-27B-gguf`.
- El ruido de medición en generación es de ±10 % entre ejecuciones, por lo que las comparaciones entre n-max 1, 2 y 3 no son concluyentes en esa columna.
- `PTQ1_0` no recibe el kernel MMQ en ROCm por una exclusión HIP explícita en `ggml/src/ggml-cuda/mmq.cuh`; cae a desquantización a F16, lo que penaliza la decodificación pese a ocupar menos espacio.
- Vulkan no es una alternativa práctica: no existe shader para `PQ2_0` y el rendimiento de `PTQ1_0` cae a 3,83 t/s en AMD RADV y 1,03 t/s en Intel Arc 140T.
- El parche MTP depende del orden exacto de operaciones (rotación primero, cambio de signo después); invertirlo produce resultados incorrectos. El diff completo está en `qwen35-mtp-hadamard-inverse.patch`.
- El head MTP procede de un repositorio de terceros (`decent-jawfish/bonsai-2-27b-mtp`) y el head DFlash2 de otro (`ProCreations/Ternary-Bonsai-2-27B-DFlash2`), sin licencia indicada en la información disponible; conviene verificar sus términos antes de uso comercial.
- El runtime publicado de DFlash2 está orientado a CUDA 13.3 / SM120; su uso en gfx1151 exige compilar el árbol fuente con flags HIP.
- El modo de razonamiento por defecto es `xhigh`, lo que aumenta el consumo de tokens de salida y penaliza la latencia percibida en tareas simples.
- Idiomas soportados, sesgos conocidos y tasa de alucinación: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados correspondían a servicios de reparto de comida y bebida).

## Enlaces

- Repositorio documental: https://huggingface.co/kingjones777/Ternary-Bonsai-2-27B-ROCm-gfx1151
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Cabezal MTP de terceros: https://huggingface.co/decent-jawfish/bonsai-2-27b-mtp
- Cabezal DFlash2 de terceros: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Parche MTP: `qwen35-mtp-hadamard-inverse.patch` (incluido en el repositorio documental)
- Runtime DFlash2: `runtime/prism-dflash2-source.tar.gz` (incluido en el repositorio documental)
- Enlaces adicionales procedentes de la búsqueda web: no disponibles.
