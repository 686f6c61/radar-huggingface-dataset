# MatterWaveAI/grt-30m-reranker

## Resumen

GRT-30M-Reranker es un cross-encoder de reordenamiento (reranking) desarrollado por MatterWaveAI, construido sobre el modelo de embeddings GRT-30M-Embedding. A diferencia de los cross-encoders convencionales, que aplican proyecciones lineales densas (`nn.Linear`) para la clasificación final, este modelo implementa una arquitectura denominada `GRTForSequenceClassification` en la que la cabeza de puntuación (`GRTCosineClassificationHead`) funciona sin ninguna capa lineal, empleando productos hermitianos de pares planares y rotaciones de Givens/Clifford.

El modelo cuenta con 29.844.858 parámetros según los pesos safetensors publicados (la model card indica 29.305.759 en su descripción interna) y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la gama de modelos muy compactos para tareas de ranking. Su propósito es puntuar pares consulta-documento para reordenar candidatos recuperados por un sistema de búsqueda vectorial de primera etapa, mejorando la precisión de recuperación en pipelines RAG y motores de búsqueda semántica.

Es relevante por su enfoque arquitectónico poco habitual: sustituye las proyecciones lineales por cascadas de rotaciones y álgebra de Clifford, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. La model card documenta resultados de benchmarks propios sobre AllNLI y STS-B, así como una ablación de ocho optimizadores geométricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRTForSequenceClassification (transformer rotacional de 12 bloques con rotaciones de Givens/Clifford, sin capas `nn.Linear`) |
| Parametros totales | 29.844.858 (safetensors); la model card indica 29.305.759 en su descripcion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers (tambien compatible con `AutoModelForSequenceClassification`) |
| Pipeline | text-ranking |
| Modelo base | MatterWaveAI/grt-30m-embedding |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo se compone de un backbone rotacional de 12 bloques (`GRTModel`) que emplea rotaciones de Givens y estructuras de álgebra de Clifford en lugar de las proyecciones lineales convencionales. Sobre este backbone se sitúa `GRTCosineClassificationHead`, una cabeza de clasificación sin `nn.Linear` que combina dos señales: por un lado, un producto hermitiano de pares planares (`u* v`) sobre 128 pares `(x, y)` con ángulos de fase y escalas aprendidas; por otro, una interacción tardía multi-vector a nivel de token que calcula similitudes coseno rotacionales bidireccionales (`MaxSim`, `MinSim`) y una medida de acuerdo polar léxico (`lex_cos`), calibradas mediante `output_scale` y `bias`.

El entrenamiento documentado en la model card se centra en un ajuste fino de la parte superior del modelo: el bloque rotacional final `blocks[-1]` (811.651 parámetros), `final_norm` (128 parámetros) y la cabeza de clasificación (262 parámetros), sumando 812.169 parámetros entrenables y cero capas `nn.Linear`. El esquema controlado emplea 200 pasos con `batch_size = 128` de tripletas con negativos duros de AllNLI más 128 pares graduados de STS-B por paso, `backbone_lr = 1.5e-4` y semilla 42, ejecutado sobre AMD Radeon 8060S (ROCm/gfx1151) con kernels HIP fusionados. La model card también describe una ablación de ocho optimizadores geométricos, riemannianos, simplécticos y de sincronización de Kuramoto-Huygens implementados en `transformers.models.grt.optimization_grt`.

## Capacidades

- Reordenamiento de pares consulta-documento mediante puntuación de similitud (cross-encoder).
- Puntuación a nivel de token con interacción tardía multi-vector (`MaxSim` bidireccional y `MinSim`).
- Alineación de fase hermitiana sobre representaciones planares agrupadas circularmente.
- Integración con `sentence-transformers` `CrossEncoder` y con `AutoModelForSequenceClassification` de Hugging Face.
- Funcionamiento en pipeline de dos etapas junto al bi-encoder `grt-30m-embedding` (recuperación + reordenamiento).
- Generación de texto: no disponible (el modelo es un cross-encoder de ranking, no un modelo generativo).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reordenamiento en pipelines RAG: tras recuperar los N candidatos más similares con un bi-encoder, el modelo puntúa cada par consulta-fragmento y reordena los resultados; su tamaño de 0,1 GB permite desplegarlo como segunda etapa con coste mínimo de memoria.
- Búsqueda semántica en documentación técnica: reordenar resultados de un índice vectorial para mejorar el Recall@1 y el MRR, métricas en las que la model card reporta mejoras frente al bi-encoder base (Recall@1 del 46,0 % frente al 32,5 %).
- Filtrado de candidatos en sistemas de preguntas y respuestas: usar la puntuación del cross-encoder como umbral para descartar pasajes irrelevantes antes de pasarlos a un modelo generativo.
- Deduplicación y agrupación de pasajes: la similitud coseno rotacional a nivel de token puede emplearse para detectar pasajes redundantes en un corpus.
- Evaluación de calidad de recuperación: integrar el modelo en un arnés de evaluación tipo BEIR o AllNLI para medir la mejora de la segunda etapa frente a la primera.
- Prototipado en hardware de consumo: con 0,1 GB de pesos en safetensors, cabe en GPUs de consumo modestas y permite experimentar con arquitecturas rotacionales sin infraestructura dedicada.
- Investigación en arquitecturas sin capas lineales: sirve como referencia reproducible para estudiar el efecto de las rotaciones de Givens/Clifford y de optimizadores geométricos en tareas de ranking.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor (AllNLI con 200 candidatos × 10 consultas y STS-B test):

| Modelo / pipeline | Arquitectura | AllNLI MRR@10 | AllNLI NDCG@10 | Recall@1 | Recall@3 | STS-B test Spearman | Throughput (pares/s) |
|---|---|---|---|---|---|---|---|
| grt-30m (base sin alinear) | GRTModel | 37,99 | 52,12 | 20,5 % | 41,0 % | 32,51 | 120 |
| grt-30m-embedding (bi-encoder) | SentenceTransformer | 52,56 | 63,74 | 32,5 % | 68,0 % | 62,42 | 152 |
| grt-30m-reranker (checkpoint calibrado solo cabeza) | CrossEncoder | 56,93 | 67,13 | 38,5 % | 70,0 % | 61,75 | 123 |
| Hibrido en dos etapas (embedding + reranker solo cabeza) | Bi + Cross | 57,05 | 67,21 | 38,5 % | 70,0 % | 62,94 | 123 |
| grt-30m-reranker (joint top-block, HessianPairAdam/CyclideAdam) | CrossEncoder | 63,50 | 72,26 | 46,0 % | 76,5 % | 63,12 | 123 |
| Hibrido en dos etapas (embedding + reranker joint top-block) | Bi + Cross | 62,14 | 71,18 | 44,0 % | 76,0 % | 64,09 | 123 |

Ablación de optimizadores (extracto de los cinco primeros puestos por MRR@10 en AllNLI 200×10):

| Puesto | Optimizador | MRR@10 | NDCG@10 | Recall@1 / @3 | STS-B test Spearman | Tiempo ROCm (200 pasos) |
|---|---|---|---|---|---|---|
| 1 | HessianPairAdam (Sophia-Torus) | 63,50 | 72,26 | 46,0 % / 76,0 % | 62,61 | 93,8 s |
| 2 | HuygensSymplecticAdam | 63,27 | 72,09 | 45,5 % / 76,0 % | 62,49 | 94,0 s |
| 3 | SymplecticAdam | 63,13 | 72,00 | 45,0 % / 76,0 % | 62,43 | 93,8 s |
| 4 | CyclideAdam | 63,06 | 71,91 | 45,0 % / 76,5 % | 63,12 | 93,8 s |
| 5 | GyricAdam | 62,75 | 71,68 | 44,5 % / 76,5 % | 63,08 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (pesos de 0,1 GB en safetensors); en fp16 o int8 el consumo es aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la model card documenta ejecución en AMD Radeon 8060S Graphics (ROCm/gfx1151). No se especifican modelos A100/H100/RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, con amplio margen (por ejemplo, GTX 1650, RTX 3050 o superiores).
- Opciones de despliegue: `sentence-transformers` (`CrossEncoder`), `transformers` (`AutoModelForSequenceClassification`); el autor documenta kernels HIP fusionados para ROCm. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: 123 pares/s según la model card (frente a 152 pares/s del bi-encoder y 120 pares/s del modelo base); tiempo de 200 pasos de entrenamiento en ROCm de aproximadamente 94 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AllNLI MRR@10 (200×10) | STS-B test Spearman | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MatterWaveAI/grt-30m-reranker | 29,8 M | no disponible | 63,50 | 63,12 | Apache 2.0 | Hugging Face |
| MatterWaveAI/grt-30m-embedding (bi-encoder) | no disponible | no disponible | 52,56 | 62,42 | Apache 2.0 | Hugging Face |
| MatterWaveAI/grt-30m (base) | no disponible | no disponible | 37,99 | 32,51 | no disponible | Hugging Face |
| Cross-encoders de referencia de la misma categoria (p. ej. MiniLM/ms-marco) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de comparaciones directas con cross-encoders populares de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks reportados provienen exclusivamente de la model card del autor; no se han verificado de forma independiente.
- La longitud máxima de contexto no está documentada, lo que impide garantizar el comportamiento con documentos largos.
- Los idiomas soportados no están especificados; no hay evidencia de capacidades multilingües.
- El ajuste fino documentado se limita a 812.169 parámetros (bloque superior y cabeza) durante 200 pasos, lo que puede limitar la adaptación a dominios distintos de AllNLI/STS-B.
- Riesgo de alucinación no aplicable directamente (modelo de ranking, no generativo), pero la puntuación puede ser poco fiable fuera de la distribución de entrenamiento.
- No hay información sobre sesgos demográficos o lingüísticos.
- La discrepancia entre el recuento de parámetros de la model card (29.305.759) y los pesos safetensors (29.844.858) conviene tenerla en cuenta al verificar la arquitectura.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base `grt-30m-embedding`.
- El soporte de despliegue en servidores de inferencia estándar (vLLM, TGI) no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Modelo base (embeddings): https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Modelo base sin alinear: https://huggingface.co/MatterWaveAI/grt-30m
- Repositorio de `transformers` con el módulo `models.grt` y `optimization_grt`: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
