# ewin-reg/WeMM-Embedding-2B-Apple-Silicon-Quantized

## Resumen

WeMM-Embedding-2B-Apple-Silicon-Quantized es una compilación cuantizada del modelo de embeddings `ewin-reg/WeMM-Embedding-2B-Quantized`, publicada por el usuario ewin-reg, orientada a ejecución nativa en Apple Silicon a través del backend MPS de PyTorch. El problema que resuelve es concreto: el checkpoint original almacena las proyecciones de atención y los token embeddings como tensores `torch.float8_e4m3fn`, y PyTorch no puede convertir ese tipo a MPS (issue #148420), por lo que la inferencia en Mac falla directamente. Esta variante sustituye los 139 tensores FP8 por enteros de 8 bits (`torch.int8`) con escalas simétricas por canal en `bfloat16`, manteniendo intactos los 146 pesos INT4 Group-16 de las capas MLP y las capas de normalización.

El modelo derivado de `tencent/WeMM-Embedding-2B` (referencia BF16) y conserva el tamaño de 1.805.899.406 parámetros (unos 1,8 mil millones). No es un modelo generativo: es un extractor de características (`pipeline_tag: feature-extraction`) que produce embeddings de texto, con soporte de dimensiones Matryoshka (MRL) de 2048 hasta 64, y etiquetado para inglés y chino. Su relevancia práctica es doble: elimina la dependencia de extensiones de terceros para FP8 en MPS y, además, resulta un 13 % más rápido que la versión FP8 original en CUDA, porque cuBLAS dispone de rutas nativas de matmul INT8 mientras que la versión FP8 desquantiza a BF16 antes de cada `F.linear`.

El repositorio ocupa 5,1 GB en total, aunque el fichero de pesos pesa 1,75 GB, un 65,5 % menos que la referencia BF16 de 5,071 GB. Se publica bajo licencia Apache 2.0, con cero descargas y cero likes en el momento de la consulta, y con el widget de inferencia deshabilitado (`inference: false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings; tag de arquitectura `qwen3_5`; requiere `custom_code` |
| Parametros totales | 1.805.899.406 (~1,8 mil millones) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 simetrico por canal (139 tensores de atencion y token embeddings) + INT4 Group-16 (146 pesos MLP); escalas en `bfloat16`; etiquetado por el autor como w4a8; sin tensores FP8 remanentes |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (INT8/INT4), con codigo personalizado (`trust_remote_code=True`) |
| Dimension de embedding | 2048 nativa; truncable por MRL a 1024, 512, 256, 128 y 64 |
| Tamano en disco (pesos) | 1,750 GB |
| Libreria declarada | sentence-transformers |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo es una variante de formato, no un reentrenamiento. Segun la model card, se deriva directamente de `ewin-reg/WeMM-Embedding-2B-Quantized` ("not re-quantized from base"), que a su vez procede de `tencent/WeMM-Embedding-2B` en BF16. El proceso aplicado consiste en convertir los 139 tensores `float8_e4m3fn` a `torch.int8` con cuantizacion simetrica por canal y vectores de escala en `bfloat16`; el recuento de elementos no cambia porque ambos formatos usan 1 byte por elemento, de ahí que el fichero se mantenga en 1,75 GB. Los 146 pesos MLP en INT4 Group-16 y todas las capas de normalizacion se copian sin modificacion.

La motivacion tecnica es la incompatibilidad de FP8 con MPS: en Apple Silicon el error `TypeError: Cannot convert Float8_e4m3fn to MPS` bloquea la carga, y los paquetes de terceros que parchean FP8 en MPS solo interceptan `aten::embedding`, no `aten::index` (que es la ruta que usa la busqueda de token embeddings). Ademas, esos parches hacen `fp8 → fp16 → bf16`, dos redondeos en lugar de uno. Con `torch.int8`, tanto `aten::embedding` como `aten::index` funcionan de forma nativa en MPS sin extensiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original: no disponible.

## Capacidades

- Generacion de embeddings de texto para similitud semantica, recuperacion de informacion, clustering y clasificacion por similitud coseno.
- Soporte multilingue limitado a ingles y chino (en, zh) segun los metadatos del repositorio; no hay datos publicados sobre otros idiomas.
- Dimensiones Matryoshka (MRL): permite truncar el vector de 2048 a 1024, 512, 256, 128 o 64 dimensiones reduciendo el almacenamiento por vector de 8.192 B a 256 B, con una fidelidad declarada frente a BF16 que mejora ligeramente al truncar (99,2293 % a 1024 frente a 99,6068 % a 64).
- Ejecucion nativa en Apple Silicon mediante MPS sin paquetes de terceros ni dependencias de FP8.
- Ejecucion en CUDA con rutas INT8 de cuBLAS, lo que reduce la latencia un 13 % respecto a la version FP8 del mismo modelo.
- El repositorio incluye el tag `multimodal`, pero los unicos resultados publicados corresponden a evaluacion de texto (20 consultas): las capacidades multimodales no estan verificadas con datos: no disponible.
- No genera texto, no realiza razonamiento multi-paso, no soporta tool calling ni function calling y no esta pensado para uso agentico. Es exclusivamente un modelo de representacion.

## Casos de uso

- Busqueda semantica y RAG bilingue en/zh: el modelo convierte consultas y documentos en vectores de 2048 dimensiones aptos para indices de similitud coseno, cubriendo los dos idiomas declarados sin cambiar de modelo.
- Asistentes locales de documentacion privada en Mac: al pesar 1,75 GB y ejecutarse sobre MPS sin extensiones, permite montar un pipeline de recuperacion completamente local en un portatil Apple Silicon sin enviar datos a servicios externos.
- Deduplicacion y cribado de corpus: usar la truncacion MRL a 64 o 128 dimensiones (256 o 512 B por vector) para un primer filtrado por similitud y reservar la dimension completa de 2048 solo para el reordenado final, reduciendo el coste de memoria del indice.
- Clasificacion y enrutado de tickets de soporte: calcular el embedding de cada ticket y asignarlo al grupo de incidencias mas cercano por similitud coseno, con un modelo de 1,8 B de parametros que no requiere infraestructura de generacion.
- Recomendacion de contenido por similitud: indexar el catalogo con embeddings y recuperar los elementos mas proximos al historial o a la consulta del usuario.
- Deteccion de near-duplicates y posible plagio en colecciones documentales bilingues, aprovechando la fidelidad de 99,17 % en media frente a la version BF16 (degradacion declarada de 0,83 puntos porcentuales).
- Sustitucion directa (drop-in) de la version BF16 en entornos CUDA restringidos de memoria: el pico de VRAM medido baja de 5.191 MB a 2.785 MB, lo que permite desplegar en GPUs de gama media.
- Verificacion de regresion de embeddings en pipelines propios: comparar los vectores generados por esta version con los del checkpoint FP8 o BF16 para detectar desviaciones, ya que la fidelidad directa declarada frente a FP8 es del 99,9492 % (minimo 99,9146 %).

## Benchmarks y rendimiento

Todos los datos siguientes son autodeclarados por el autor en la model card y en el `model-index`; este ultimo los marca como `verified: false` y no se han replicado de forma independiente. La evaluacion se realizo con forward pass real en una Tesla T4 sobre 20 consultas de texto, comparando contra `tencent/WeMM-Embedding-2B` (BF16 sin cuantizar).

Almacenamiento:

| Modelo | Tamano | Reduccion vs BF16 |
|---|---:|---:|
| `tencent/WeMM-Embedding-2B` (BF16, referencia) | 5,071 GB | — |
| `ewin-reg/WeMM-Embedding-2B-Quantized` (FP8 + INT4) | 1,749 GB | −65,51 % |
| `ewin-reg/WeMM-Embedding-2B-Apple-Silicon-Quantized` (INT8 + INT4) | 1,750 GB | −65,50 % |

Fidelidad de texto frente a BF16 sin cuantizar (20 consultas):

| Metrica | FP8 + INT4 | INT8 + INT4 (este repositorio) |
|---|---:|---:|
| Fidelidad media | 99,2042 % | 99,1702 % |
| Degradacion | 0,7958 % | 0,8298 % |
| Minimo | 98,6141 % | 98,5624 % |
| Maximo | 99,5455 % | 99,5293 % |
| Desviacion estandar | 0,2640 % | 0,2618 % |

Fidelidad directa entre FP8 e INT8: 99,9492 % en media (minimo 99,9146 %, maximo 99,9714 %).

Fidelidad por dimension MRL frente a BF16:

| Dimension | Almacenamiento/vector | Fidelidad FP8 | Fidelidad INT8 | Coincidencia directa |
|---:|---:|---:|---:|---:|
| 2048 | 8.192 B | 99,2042 % | 99,1702 % | 99,9492 % |
| 1024 | 4.096 B | 99,2637 % | 99,2293 % | 99,9533 % |
| 512 | 2.048 B | 99,3325 % | 99,3034 % | 99,9578 % |
| 256 | 1.024 B | 99,4283 % | 99,4060 % | 99,9649 % |
| 128 | 512 B | 99,5190 % | 99,4994 % | 99,9688 % |
| 64 | 256 B | 99,6226 % | 99,6068 % | 99,9753 % |

Rendimiento en tiempo de ejecucion (Tesla T4, consulta unica, computo BF16):

| Modelo | Latencia | VRAM pico |
|---|---:|---:|
| Base BF16 | 155,81 ms | 5.191 MB |
| FP8 + INT4 | 267,33 ms | 2.784 MB |
| INT8 + INT4 (este repositorio) | 232,60 ms | 2.785 MB |

No se han publicado resultados de benchmarks en la informacion disponible para tareas de recuperacion estandar (MTEB, BEIR, MIRACL u otras): no disponible.

## Requisitos de hardware

- Almacenamiento: 1,75 GB para los pesos; el repositorio completo ocupa 5,1 GB.
- Memoria en inferencia: pico medido de 2.785 MB (2,72 GiB) en Tesla T4 para una consulta, frente a 5.191 MB del modelo BF16.
- Apple Silicon: soporte MPS nativo con `transformers`, `accelerate` y `safetensors`; no se requieren extensiones de terceros. No hay mediciones de latencia o memoria publicadas en Mac, pero el pico de 2,8 GB medido en T4 sugiere que el modelo cabe en equipos con 8 GB de memoria unificada.
- GPU CUDA: una Tesla T4 es suficiente; se beneficia de las rutas INT8 nativas de cuBLAS. No se requiere A100 ni H100 para este tamano de modelo.
- GPU de consumo: dado el pico de 2,8 GB y el peso de 1,75 GB, el modelo es apto para GPUs de consumo con 6 GB o mas de VRAM (por ejemplo, RTX 3060 o superiores); esta afirmacion es una extrapolacion del pico medido en T4, no una medicion publicada.
- Opciones de despliegue: `sentence-transformers` y `transformers` + `accelerate` + `safetensors`, con `trust_remote_code=True`. En CUDA no se documenta latencia por lotes ni throughput (no disponible). No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF publicados: no disponible.
- Latencia de referencia: 232,60 ms por consulta unica en T4 con computo BF16.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las dos variantes de la misma familia. No hay datos de benchmarks frente a otras familias de modelos de embeddings (BGE, E5, GTE, etc.): no disponible.

| Modelo | Parametros | Formato | Tamano en disco | Fidelidad texto vs BF16 (media) | Latencia T4 | VRAM pico T4 | Licencia |
|---|---:|---|---:|---:|---:|---:|---|
| `tencent/WeMM-Embedding-2B` | ~1,8 B | BF16 | 5,071 GB | referencia | 155,81 ms | 5.191 MB | no disponible |
| `ewin-reg/WeMM-Embedding-2B-Quantized` | ~1,8 B | FP8 + INT4 | 1,749 GB | 99,2042 % | 267,33 ms | 2.784 MB | no disponible |
| `ewin-reg/WeMM-Embedding-2B-Apple-Silicon-Quantized` | 1.805.899.406 | INT8 + INT4 | 1,750 GB | 99,1702 % | 232,60 ms | 2.785 MB | apache-2.0 |

La variante INT8 se situa 0,034 puntos porcentuales por debajo de la FP8 en fidelidad media, es un 13 % mas rapida en CUDA y habilita MPS sin dependencias externas, a cambio de un tamano practicamente identico (1 kB mas).

## Limitaciones y advertencias

- Modelo no generativo: no produce texto, no razona y no soporta tool calling ni flujos agenticos. Solo genera representaciones vectoriales.
- Solo idiomas en y zh segun los metadatos; sin datos publicados de rendimiento en castellano ni en otros idiomas.
- La evaluacion se limita a 20 consultas de texto y las metricas del `model-index` estan marcadas como `verified: false`. Son cifras autodeclaradas, sin replicacion independiente, y miden fidelidad coseno frente a BF16, no calidad en tareas posteriores de recuperacion o clasificacion.
- Degradacion declarada de 0,8298 % en fidelidad media y minimo de 98,5624 %: en casos desfavorables la perdida respecto a BF16 es mayor que la media, con una desviacion estandar de 0,2618.
- El tag `multimodal` no esta respaldado por ninguna evaluacion multimodal publicada en la informacion disponible.
- Requiere `trust_remote_code=True` (tag `custom_code`), lo que implica ejecutar codigo del repositorio; conviene auditar ese codigo antes de usarlo en produccion.
- No esta habilitado el widget de inferencia de HuggingFace (`inference: false`).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en similitud semantica derivados de la cuantizacion, especialmente con vectores MRL muy truncados (64 dimensiones).
- Licencia Apache 2.0 en este repositorio, que permite uso comercial; no se especifica la licencia de los checkpoints base `ewin-reg/WeMM-Embedding-2B-Quantized` ni `tencent/WeMM-Embedding-2B`, por lo que conviene verificarla antes de un despliegue comercial.
- Sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, y autor sin historial publico verificable en la informacion proporcionada.
- No se publican datos de longitud de contexto, throughput por lotes ni rendimiento en Mac, pese a ser el objetivo declarado del build.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Apple-Silicon-Quantized
- Modelo base del que deriva: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Quantized
- Modelo de referencia sin cuantizar (BF16): https://huggingface.co/tencent/WeMM-Embedding-2B
- Issue de PyTorch sobre FP8 en MPS: https://github.com/pytorch/pytorch/issues/148420
- Kernel de evaluacion citado en la model card: https://www.kaggle.com/code/gpannn/wemm-embedding-2b-mac-export
- Referencia arXiv declarada en los tags: arXiv:2608.24053 (no se ha podido verificar su contenido en la informacion disponible)
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a paginas de soporte de Microsoft sin relacion con la ficha.
