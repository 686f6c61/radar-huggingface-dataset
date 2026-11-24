# MatterWaveAI/grt-30m-embedding

## Resumen

GRT-30M-Embedding es un modelo de embeddings de frases desarrollado por MatterWaveAI, obtenido mediante ajuste fino contrastivo del checkpoint base `MatterWaveAI/grt-30m`. Se trata de un encoder sin cabeza de generación (`GRTModel`) que implementa una arquitectura denominada Geometric Rotation Transformer, en la que las proyecciones lineales densas se sustituyen por cascadas de rotaciones de Givens 2×2 sobre SO(D) moduladas por contenido, intercaladas con permutaciones tipo butterfly. El modelo tiene 29,84 millones de parámetros totales, aunque solo 9,74 millones corresponden al backbone rotacional, ya que el resto son embeddings de tokens congelados.

La innovación principal reside en la estrategia de pooling circular: cada estado oculto se estructura en 128 pares planos (x, y), y el pooling descompone cada par en dirección unitaria y radio, promedia ambas componentes entre tokens no rellenados y recombina el resultado en un embedding de frase de 256 dimensiones L2-normalizado. El modelo está pensado para similitud semántica y recuperación densa, con una longitud máxima de secuencia de 512 tokens (hasta 2.048 posiciones soportadas) y un vocabulario de 151.669 tokens basado en el BPE de Qwen 3.

Su relevancia actual es doble: por un lado, explora una alternativa geométrica a las proyecciones lineales convencionales en modelos de embeddings de pequeño tamaño; por otro, documenta de forma inusualmente detallada un proceso de ajuste fino en dos etapas sobre hardware Intel Arc XPU con kernels SYCL fusionados, incluyendo un ablation de 17 optimizadores geométricos, simplécticos y toroidales. La licencia Apache 2.0 facilita su uso comercial, aunque el soporte lingüístico declarado se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRTModel (Geometric Rotation Transformer), encoder sin cabeza causal; rotaciones de Givens 2×2 sobre SO(D) con permutaciones butterfly |
| Parametros totales | 29.844.597 (29,84 M); 29.305.497 sin `lm_head.output_scale` |
| Parametros activos | No aplica (no es MoE); backbone rotacional no-embedding: 9.740.197 |
| Longitud de contexto | 512 tokens (soporta hasta 2.048 posiciones) |
| Tipos de cuantizacion | No disponible (entrenado y evaluado en FP32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `sentence-transformers`) |

Otros parámetros técnicos: `hidden_size` 256, 12 bloques rotacionales, 4 cabezas de atención (`head_dim` 64), `intermediate_size` 1.024, 11 rotaciones QKV, 1 rotación de mixer, 21 rotaciones FFN, vocabulario 151.669 (Qwen 3 BPE), dimensión de salida 256 L2-normalizada, tamaño del repositorio 0,3 GB.

## Arquitectura y entrenamiento

El modelo parte del checkpoint causal preentrenado `MatterWaveAI/grt-30m`, al que se le elimina la cabeza de generación (`lm_head.output_scale`) para formar un encoder sin cabeza. En lugar de proyecciones lineales densas, los estados ocultos se representan en coordenadas polares (`phase_angles` + `log_magnitude`) y se transforman mediante cascadas de rotaciones de Givens 2×2 moduladas por contenido sobre SO(D), intercaladas con permutaciones butterfly. El ajuste fino se realizó en dos etapas sobre una GPU Intel Arc 140T (`xpu:0`, 32 GB) con kernels SYCL de oneAPI DPC++ fusionados (Givens y Clifford), con un tiempo total de reloj de aproximadamente 75 segundos.

Durante el entrenamiento se congelaron los `embedding.phase_angles` (19,41 M de parámetros) para preservar la geometría polar pretrained del vocabulario Qwen 3, quedando 9.891.865 parámetros entrenables (12 bloques rotacionales más `embedding.log_magnitude`). La etapa 1 usó el split triplet de `sentence-transformers/all-nli` durante 150 pasos (4.800 tripletas, menos del 1 % del corpus) con `MultipleNegativesRankingLoss` en batch y negativos duros explícitos (τ = 0,05), `batch_size` 32, `max_length` 96 y el optimizador `PairAdam` (lr 1,5e-4, `coupling_lr_mult` 3,0, `max_angular_step` 0,05). La etapa 2 usó el split train de `sentence-transformers/stsb` (5.749 pares) durante 2 épocas (358 pasos) con pérdida `CoSENT` (τ = 20,0) más 2,0 × `CosineMSE`, `batch_size` 32, `max_length` 128 y `PairAdam` (lr 8e-5). El recorte de norma de gradiente fue de 1,0.

## Capacidades

- Generación de embeddings de frases densos de 256 dimensiones, L2-normalizados, para similitud semántica y recuperación densa.
- Pooling circular específico: descomposición de 128 pares planos en dirección unitaria y radio, promediado sobre tokens no rellenados y recombinación.
- Extracción de características (`feature-extraction`) y pipeline de `sentence-similarity` en `sentence-transformers`.
- Codificación de secuencias de hasta 512 tokens, con soporte de hasta 2.048 posiciones.
- Vocabulario Qwen 3 BPE de 151.669 tokens, lo que permite tokenizar texto inglés de forma eficiente.
- No dispone de cabeza de generación de texto, tool calling, capacidades de agente, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe no disponible: solo inglés declarado.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de hasta 512 tokens y recuperar por similitud coseno usando los embeddings de 256 dimensiones; el tamaño reducido del modelo (0,3 GB) permite mantener el índice y el encoder en el mismo nodo.
- Deduplicación de registros y catálogos: comparar pares de descripciones cortas mediante similitud coseno para detectar duplicados; el ajuste con `CoSENT` sobre STS-B calibra la consistencia de rangos, adecuada para umbrales de similitud.
- Clasificación de texto por vecino más cercano: usar los embeddings como características de entrada para clasificadores ligeros (k-NN, regresión logística) en tareas de moderación o etiquetado, con la ventaja de que el encoder cabe en CPU.
- Reranking en pipelines de recuperación: combinar un retriever léxico (BM25) con un reranker basado en este modelo para reordenar los candidatos; la ventana de 512 tokens cubre pasajes estándar y la salida normalizada simplifica la fusión de puntuaciones.
- Agrupamiento de tickets de soporte: generar embeddings de asuntos y descripciones, y aplicar clustering (k-means sobre vectores normalizados) para agrupar incidencias similares y priorizar colas de atención.
- Detección de similitud entre preguntas frecuentes: emparejar consultas de usuarios con una base de preguntas canónicas precalculada, desplegando el modelo con `sentence-transformers` en CPU para latencias bajas en cargas moderadas.
- Experimentación en investigación geométrica: servir como referencia reproducible para estudiar pooling circular y arquitecturas rotacionales frente a encoders lineales de tamaño comparable.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre STS Benchmark (`sentence-transformers/stsb`), validación y test, con pooling circular y similitud coseno, en un ablation controlado de 17 optimizadores con el mismo esquema de 508 pasos (150 de AllNLI + 358 de STS-B, semilla 42). Se muestran las cinco primeras variantes por rango en test:

| Rango (test) | Variante de optimizador | Spearman val NLI etapa 1 (×100) | Spearman val STS-B (×100) | Pearson val STS-B (×100) | Spearman test STS-B (×100) | Pearson test STS-B (×100) | Memoria de estado (FP32) | Tiempo de 508 pasos |
|:---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | `SymplecticAdam` (non-squeezing floor + Casimir cavity) | 61,98 | 73,60 | 70,87 | 65,16 | 65,64 | 80,7 MB (2,04×) | 243 s ROCm |
| 2 | `HuygensSymplecticAdam` (Huygens splay curriculum) | 62,82 | 73,68 | 70,90 | 65,09 | 65,48 | 80,7 MB (2,04×) | 236 s ROCm |
| 3 | `PolarNaturalAdam` (métrica polar + Hessiano) | 62,31 | 72,62 | 70,20 | 64,71 | 64,94 | 80,7 MB (2,04×) | 4.344 s XPU |
| 4 | `GyricAdam` (proyección giroscópica Thomas–Landé) | 62,21 | 73,04 | 70,23 | 64,55 | 65,03 | 80,7 MB (2,04×) | 420 s ROCm |
| 5 | `HuygensAdam` (estado splay de parámetro de orden circular) | 63,83 | 72,95 | 70,35 | 64,20 | 64,69 | 80,7 MB (2,04×) | 332 s ROCm |

No se han publicado en la información disponible resultados de benchmarks estándar de embeddings como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de embeddings en MTEB.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 0,3 GB en el repositorio; en FP32 ocupa aproximadamente 0,12 GB de pesos (29,84 M de parámetros × 4 bytes), más activaciones mínimas para secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el modelo se entrenó en una Intel Arc 140T (32 GB), pero el tamaño no exige hardware de datacenter.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y CPU.
- Opciones de despliegue: `sentence-transformers` (nativo), `transformers` con `GRTModel`, y exportación a ONNX para inferencia en CPU; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles de forma oficial; el entrenamiento completo de 508 pasos requirió entre 236 y 4.344 segundos según el optimizador y el backend (ROCm o XPU), dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión de embedding | Idiomas | Licencia | Notas |
|---|---|---:|---:|---|---|---|
| GRT-30M-Embedding | 29,84 M (9,74 M backbone) | 512 (hasta 2.048) | 256 | Inglés | Apache 2.0 | Pooling circular, arquitectura rotacional |
| all-MiniLM-L6-v2 | 22,7 M | 256 | 384 | Inglés | Apache 2.0 | Encoder transformer estándar, ampliamente desplegado |
| all-MiniLM-L12-v2 | 33,4 M | 256 | 384 | Inglés | Apache 2.0 | Variante de 12 capas del anterior |
| paraphrase-MiniLM-L6-v2 | 22,7 M | 128 | 384 | Inglés | Apache 2.0 | Entrenado para paráfrasis |

Los datos de los modelos alternativos corresponden a especificaciones públicas habituales; no se dispone en la información proporcionada de una comparación directa de rendimiento (MTEB u otros) entre GRT-30M-Embedding y estos modelos.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- El ajuste fino fue muy breve: 150 pasos en AllNLI (menos del 1 % del corpus) y 358 pasos en STS-B, lo que limita la generalización frente a encoders entrenados con corpus masivos.
- Los resultados de STS-B (Spearman test en torno a 65) son moderados y corresponden a un ablation de optimizadores, no a una evaluación completa en MTEB.
- Riesgo de alucinación no aplica directamente al ser un encoder sin generación, pero la similitud coseno puede producir falsos positivos en pares léxicamente próximos y semánticamente distintos.
- La ventana de 512 tokens trunca documentos largos; los pasajes deben dividirse previamente.
- El pooling circular y la arquitectura GRT son no convencionales, lo que puede complicar la integración con herramientas estándar y la interpretabilidad de los embeddings.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `MatterWaveAI/grt-30m` y de los datasets empleados (AllNLI, STS-B).
- El modelo tiene 0 descargas significativas y 0 likes en el momento de la ficha (331 descargas registradas), por lo que la validación comunitaria es escasa.
- No se documentan cuantizaciones oficiales ni soporte en runtimes de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Dataset AllNLI: https://huggingface.co/datasets/sentence-transformers/all-nli
- Dataset STS-B: https://huggingface.co/datasets/sentence-transformers/stsb
- Librería sentence-transformers: https://www.sbert.net/
- Paper de Sentence-BERT (referencia del pipeline): https://arxiv.org/abs/1908.10084
- Paper de CoSENT (pérdida de la etapa 2): https://arxiv.org/abs/2205.03146
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
