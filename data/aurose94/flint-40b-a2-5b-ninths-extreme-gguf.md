# auRose94/Flint-40B-A2.5B-ninths-extreme-GGUF

## Resumen

Flint-40B-A2.5B-ninths-extreme-GGUF es un repositorio experimental de cuantización publicado por el usuario auRose94 en Hugging Face, que contiene dos cuantizaciones extremas (denominadas "ninths k9", en los niveles k5 y k3) del modelo base RecursiveSI/flint, un modelo MoE de 40 mil millones de parámetros totales con unos 2,5 mil millones activos. No se trata de un modelo nuevo en sí, sino de contenedores GGUF producidos con un pipeline de cuantización propio basado en base 9 ("ninths"), diseñado para estudiar el límite de degradación de la cuantización RTN (round-to-nearest) sin calibración.

El interés de esta ficha es principalmente técnico y estadístico: el propio autor advierte de forma explícita que estas cuantizaciones **no son modelos de chat utilizables**. La cuantización k5 (≈1,95 bits/parámetro) destruye la capacidad de modelado del lenguaje (perplejidad de ~150.000 en wiki2), y la k3 (≈1,11 bits/parámetro) es aún más extrema (perplejidad de 2,58×10¹⁴). Su valor reside en demostrar que el formato contenedor es agnóstico respecto a la rejilla de cuantización y en documentar el "acantilado" de calidad que existe entre ~5,7 bits y ~2 bits por peso cuando no se aplica calibración.

Para desarrolladores e investigadores, el repositorio es útil como material de estudio sobre cuantización extrema, verificación byte a byte de contenedores y como referencia de por qué las cuantizaciones de ultra-baja precisión (IQ2_S, IQ1_S) requieren matrices de importancia o pasadas de calibración. No es apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base RecursiveSI/flint) |
| Parametros totales | 5.535.523.301 (dato safetensors del repo); el nombre comercial indica 40B totales / A2.5B |
| Parametros activos | ~2,5B (A2.5B, según denominación del modelo base; MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninths k5 (≈1,95 bits/param, 9,13 GiB) y ninths k3 (≈1,11 bits/param, 5,23 GiB); embeddings y head exactos (k99), cuerpo en rejilla RTN simétrica de 5 y 3 niveles |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (contenedor "ninths", decodificado al cargar como Q8_0) |

Nota: existe una discrepancia entre los 5,54 mil millones de parámetros del dato safetensors y la denominación "40B-A2.5B" del modelo base; la ficha del autor usa la denominación de este último.

## Arquitectura y entrenamiento

El modelo base, RecursiveSI/flint, es un transformer de mezcla de expertos (MoE) con 40 mil millones de parámetros totales y aproximadamente 2,5 mil millones activos por token. Sobre él, este repositorio no aporta ninguna modificación arquitectural ni entrenamiento: se limita a cuantizar los pesos mediante el pipeline "ninths" (base 9) descrito en github.com/auRose94/base9-quantization.

La técnica de cuantización funciona así: los embeddings y la cabeza de salida se conservan de forma exacta ("k99-exact"), mientras que rangos, normas y "sinks" se copian verbatim; solo el cuerpo del modelo se cuantiza en una rejilla RTN por grupos de 64 pesos, con 5 niveles simétricos (k5) o 3 niveles (k3). No se aplica calibración alguna (ni act-order/GPTQ, ni codebooks aprendidos, ni matrices de importancia), lo cual es una decisión deliberada del experimento. El contenedor es verificado byte a byte en cada nivel y admite dos rutas de carga equivalentes: decodificación al cargar (decode-on-load) o materialización a un gemelo Q8_0. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

Advertencia previa: según el propio autor, estas cuantizaciones **destruyen la capacidad de modelado del lenguaje** del modelo base. Las capacidades reales son:

- Carga y servido técnico: los ficheros cargan, sirven y responden a través del fork "ninths" de llama.cpp, con verificación byte-exacta del contenedor.
- Reproducibilidad estadística: ambas cuantizaciones reproducen perplejidades idénticas cargadas por decode-on-load o mediante un gemelo Q8_0 materializado, lo que las hace útiles para experimentos de cuantización.
- Plantillas de chat incluidas: el repo distribuye `chat_template.jinja` y `chat_template_llamacpp.jinja` (heredadas del repo k63), aunque no son funcionales en la práctica con estas rejillas.
- No apto para: generación de texto coherente, razonamiento, código, matemáticas, tool calling, agentes ni uso conversacional. El pipeline original de flint podría soportarlas, pero estas cuantizaciones no.

## Casos de uso

- Investigación en cuantización extrema: estudiar el punto exacto de colapso de la perplejidad entre 5,7 y ~2 bits por peso en un MoE real, con mediciones honestas de RTN sin calibración (ppl de ~23,7 a ~150.000 en el rango medido).
- Validación de formatos de contenedor: verificar que un formato de cuantización es agnóstico respecto a la rejilla, gracias a las puertas de verificación byte-exacta de dígitos, escalas y materialización que k5 y k3 superan sin discrepancias.
- Benchmark de pipelines de cuantización: usar las cifras publicadas (KL protocol PPL(Q)/PPL(base) de ~4400× en k5) como referencia negativa al desarrollar métodos con calibración (GPTQ, imatrix, codebooks IQ).
- Distribución de ficheros a gran escala en ancho de banda limitado: el ahorro de tamaño (9,13 GiB frente a 39,44 GiB del Q8_0) está en el fichero, no en RAM; útil solo para experimentos de transmisión/almacenamiento, no para inferencia.
- Docencia y divulgación técnica: ejemplo concreto y documentado de por qué las cuantizaciones IQ2_S/IQ1_S del ecosistema llama.cpp exigen matrices de importancia.
- Desarrollo de runtimes: probar rutas de decodificación al cargar frente a materialización completa en el fork ninths de llama.cpp, incluyendo soporte AMD (gfx1151, compilación con `-DGGML_HIP=ON`).

## Benchmarks y rendimiento

El único benchmark publicado es la perplejidad sobre una ventana de 300k tokens de wiki2, medida por el propio autor. No hay MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

| Rung | Fichero | bits/param | ppl (wiki2 300k) | KL PPL(Q)/PPL(base) |
|---|---|---|---|---|
| bf16 (ggml-org, referencia) | 74,2 GiB | 16 | (base) | 1,0 |
| Q8_0 stock | 39,44 GiB | 8,50 | 22,87 ± 0,51 | 1,0395 |
| ninths k63/e99 (repo hermano) | 26,54 GiB | 5,71 | 23,68 ± 0,54 | 1,0811 |
| Q4_K_M stock | 21,78 GiB | 4,85 | 23,74 ± 0,54 | 1,0628 |
| IQ4_NL re-quant | 21,21 GiB | 4,28 | 27,56 ± 0,64 | 1,2267 |
| **ninths k5/e99 (este repo)** | **9,13 GiB** | **1,95** | 149.932 | ~4400× (ln 8,394 ± 0,091, Cor 31,0 %) |
| **ninths k3/e99 (este repo)** | **5,23 GiB** | **1,11** | 2,58×10¹⁴ | — |

## Requisitos de hardware

- VRAM/RAM en disco: 9,13 GiB (k5) o 5,23 GiB (k3) para almacenar los ficheros GGUF.
- RAM residente en ejecución: ~39,5 GB de pesos, ya que el decode-on-load materializa a Q8_0; el ahorro de tamaño está en la distribución del fichero, no en la memoria en tiempo de ejecución.
- GPUs: probado en AMD gfx1151 (compilando con `-DGGML_HIP=ON`); también funciona en CPU. No se menciona soporte NVIDIA explícito, aunque el fork deriva de llama.cpp upstream.
- Consumer GPUs: con ~39,5 GB de pesos residentes, no cabe en GPUs de consumo habituales (RTX 4090 con 24 GB); requeriría GPUs de 48 GB (A6000, L40S) o superior, o ejecución en CPU con suficiente RAM.
- Despliegue: exclusivamente mediante el fork "ninths" de llama.cpp, rama `k9`, commit `c5029ebd4` o posterior (github.com/auRose94/llama.cpp). No compatible con llama.cpp stock, vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño | ppl wiki2 (300k) | Licencia |
|---|---|---|---|---|---|
| Flint ninths k5 (este repo) | 40B MoE (base) | ninths k5, RTN sin calibrar | 9,13 GiB | 149.932 | Apache-2.0 |
| Flint ninths k63/e99 (repo hermano) | 40B MoE (base) | ninths k63 | 26,54 GiB | 23,68 ± 0,54 | Apache-2.0 |
| Flint Q8_0 stock (ggml-org) | 40B MoE (base) | Q8_0 | 39,44 GiB | 22,87 ± 0,51 | Apache-2.0 |
| Flint Q4_K_M stock | 40B MoE (base) | Q4_K_M | 21,78 GiB | 23,74 ± 0,54 | Apache-2.0 |

La comparación relevante no es con otros modelos, sino con otras cuantizaciones del mismo modelo base: k5 y k3 son aproximadamente 4 y 20 veces peores en perplejidad que la referencia bf16, mientras que k63 y Q4_K_M se mantienen en degradaciones menores (factor 1,07–1,08).

## Limitaciones y advertencias

- **No es un modelo de chat utilizable**: el autor lo indica expresamente. La rejilla RTN sin calibrar destruye el modelado del lenguaje (k5 envía aproximadamente la mitad de una distribución gaussiana de pesos a 0).
- Riesgo de alucinación y salida incoherente: total; el modelo no produce texto con sentido en estas rejillas.
- Requiere un fork específico de llama.cpp (rama `k9`); no funciona con runtimes estándar (vLLM, TGI, Ollama, llama.cpp upstream).
- El ahorro de tamaño en disco no se traduce en ahorro de RAM en inferencia (~39,5 GB residentes por materialización a Q8_0).
- Sesgos: los heredados del modelo base RecursiveSI/flint, cuya documentación no está disponible en la información proporcionada.
- Licencia Apache-2.0, permisiva para uso comercial, pero heredada del modelo base; conviene revisar las condiciones de RecursiveSI/flint.
- Contexto, idiomas soportados y datos de entrenamiento del modelo base: no disponibles.
- Proyecto marcado explícitamente como experimental; la recuperación de la calidad en el rango de ~2 bits requiere calibración (GPTQ, codebooks IQ, imatrix), pendiente como trabajo futuro del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/auRose94/Flint-40B-A2.5B-ninths-extreme-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Repo hermano (rung k63/e99): https://huggingface.co/auRose94/Flint-40B-A2.5B-ninths-k63-e99-GGUF
- Pipeline y formato de cuantización: https://github.com/auRose94/base9-quantization
- Fork de llama.cpp (rama k9): https://github.com/auRose94/llama.cpp
