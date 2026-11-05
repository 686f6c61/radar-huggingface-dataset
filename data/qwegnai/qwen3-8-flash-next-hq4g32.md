# qwegnai/Qwen3.8-Flash-Next-hq4g32

## Resumen

Qwen3.8-Flash-Next-hq4g32 es un pack de pesos cuantizados del modelo Qwen3.8-Flash-Next de Qwen, publicado por el usuario qwegnai para su propio motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 orientado exclusivamente a Apple Silicon. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de los pesos originales a un formato propietario denominado `QWP1` que solo carga el motor Qwegn, con una cuantización híbrida de 5,10 bits por parámetro y un sidecar para atención dispersa latente.

El modelo base es un transformer híbrido de tipo MoE con 128,80 mil millones de parámetros, 48 capas (36 Gated-DeltaNet y 12 de atención dispersa entrenada, QSA), 512 expertos con 10 enrutados más uno compartido, embeddings n-gram por capa (PLE), cabeza MTP y torre de visión. Su contexto nativo es de 262.144 tokens, aunque el autor reporta pruebas de extensión en inferencia hasta aproximadamente 1 millón de tokens manteniendo la atención dispersa nativa.

La relevancia de esta ficha es doble: por un lado documenta una de las pocas rutas prácticas para ejecutar un MoE de ~129B en un único Mac con memoria unificada; por otro, advierte de que el artefacto es incompatible con el ecosistema estándar (no es safetensors, GGUF ni MLX) y de que las cifras de rendimiento provienen del motor propietario del autor, no de benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 48 capas (36 Gated-DeltaNet + 12 atención dispersa entrenada QSA), 512 expertos (10 enrutados + 1 compartido), embeddings n-gram por capa (PLE), cabeza MTP, torre de visión |
| Parametros totales | 128,80 B |
| Parametros activos | no disponible (la model card indica 10 expertos enrutados + 1 compartido por capa, sin desglose de parámetros activos) |
| Longitud de contexto | 262.144 tokens nativos; extensión en inferencia probada cerca de 1M con QSA nativa |
| Tipos de cuantizacion | `HQ4_G32_M5` (4 bits por peso con rotación Walsh–Hadamard por grupos de 32, escala y sesgo FP16) + BF16 en embedding de tokens, torre de visión y puertas del router; 5,10 bits/parámetro globales |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | Contenedor propietario `QWP1` (solo motor Qwegn); no es safetensors, GGUF ni MLX. Incluye sidecar `model.qlsa` en formato `QLSA0001` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina 36 capas Gated-DeltaNet (atención lineal con estado recurrente) con 12 capas de atención completa que usan un indexador disperso entrenado (QSA, atención dispersa latente). El componente MoE consta de 512 expertos por capa, de los cuales 10 se enrutan por token más uno compartido. Además incorpora embeddings n-gram por capa (PLE) con una tabla asociada de 54,6 GB, una cabeza de predicción multi-token (MTP) para decodificación especulativa y una torre de visión para entrada multimodal.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la model card del pack cuantizado no los detalla y no se ha proporcionado la del modelo original. La innovación técnica destacable del pack es la cuantización `HQ4_G32_M5`: cada grupo de 32 pesos se rota mediante una transformada ortonormal de Walsh–Hadamard antes de almacenarse como códigos de 4 bits con escala y sesgo FP16 (20 bytes por 32 pesos), lo que reparte los valores atípicos y reduce el error de cuantización sin datos de calibración. La rotación se fusiona dentro de los kernels GEMV/GEMM del motor, evitando buffers desempaquetados. El sidecar `model.qlsa` contiene una SVD offline de la porción de cabeza sin RoPE de `wq`/`wk` (dimensiones 64–255) con dimensión de índice 64, agrupación en superbloques de 512 tokens en 64 cubos de Ward y pooling de claves de 4 tokens, con un presupuesto por defecto de 2.048 tokens más bloque sumidero y ventana local de 512 tokens.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de contexto muy largas (262.144 tokens nativos, extensibles en inferencia cerca de 1M).
- Recuperación de información en contexto largo: el autor reporta 3/3 de recall en una prueba de tres agujas (needles al 10 %, 50 % y 90 % de profundidad) desde 64K hasta 1M de tokens.
- Generación de código: la model card reporta 83/100 en una evaluación con 50 tareas HumanEval y 50 MBPP con razonamiento desactivado.
- Procesamiento de imagen mediante torre de visión integrada (los pesos de la torre se mantienen en BF16).
- Decodificación especulativa mediante cabeza MTP (variantes MTP-3 y DFlash 2 en el motor Qwegn).
- Atención dispersa latente (LSA) con dos modos: `auto` (indexador QSA entrenado) y `qsa-cluster` (sidecar `model.qlsa`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el contexto largo y la cabeza MTP son compatibles con flujos agénticos, pero no se documenta una integración concreta.

## Casos de uso

- Análisis de repositorios completos: con 262.144 tokens nativos y extensión probada cerca de 1M, el modelo puede ingerir varios ficheros de código y documentación en una sola pasada para responder preguntas de arquitectura o detectar inconsistencias entre módulos, sin necesidad de trocear el contexto.
- Asistencia de código en local sobre Mac: la evaluación reportada de 83/100 en HumanEval + MBPP y la decodificación especulativa a 113,7 tok/s en M5 Max lo hacen viable para autocompletado y generación de funciones en un entorno de desarrollo sin GPU dedicada.
- Procesamiento de documentación extensa (contratos, informes, expedientes): la prueba de recuperación de agujas a 1M de tokens respalda tareas de extracción de datos concretos en documentos muy largos, siempre que se validen las respuestas por el riesgo de alucinación.
- Transcripción y análisis de imágenes técnicas: la torre de visión permite describir diagramas, capturas de pantalla o figuras de papers dentro de un flujo de texto, manteniendo la torre en BF16 para preservar calidad.
- Investigación sobre cuantización extrema: el pack sirve como artefacto de estudio para medir el impacto de `HQ4_G32_M5` (5,10 bits/parámetro con rotación Hadamard) frente a BF16 en tareas de razonamiento y código.
- Prototipado de pipelines de contexto largo en Apple Silicon: permite validar estrategias de atención dispersa (QSA nativa frente a `qsa-cluster`) y decodificación especulativa MTP antes de migrar a infraestructura con GPU NVIDIA.
- Evaluación comparativa de motores de inferencia: al ser un formato exclusivo de Qwegn, resulta útil para comparar latencia y throughput del motor Swift/Metal frente a alternativas como llama.cpp o MLX en el mismo hardware.

## Benchmarks y rendimiento

Resultados reportados por el autor en Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 núcleos, 585 GB/s), macOS 26, `llmprobe v0.6.16`, `--kv-mode q4 --temperature 0`. No son benchmarks independientes.

| Metrica | Resultado |
|---|---|
| Prefill (prompt de 10,4K) | 2.688 tok/s (pico 2.696) |
| TTFT en frío | 113 ms |
| TTFT con caché de prompt caliente | 7 ms |
| Decodificación estándar (serial) | 72,3 tok/s |
| Decodificación especulativa (Variational MTP-3) | 113,7 tok/s |
| Prefill / decodificación a 1M tokens (QSA nativa) | 1.353 / 45,4 tok/s |
| Recall de agujas 64K → 1M | 3/3 en todas las longitudes |
| Evaluación de código (50 HumanEval + 50 MBPP) | 83/100 (79 con MTP exacto) |

Desglose por longitud de contexto (celda: QSA nativa `auto` / `qsa-cluster`):

| Escalon | Prefill tok/s | TTFT | Decode tok/s | Recall |
|---|---|---|---|---|
| 64K | 2.542 / 2.280 | 25,2 s / 28,1 s | 81,7 / 63,0 | 3/3 vs 3/3 |
| 262K | 2.171 / 1.553 | 113,1 s / 158,0 s | 72,3 / 34,8 | 3/3 vs 3/3 |
| 1M | 1.353 / — | 766,5 s / — | 45,4 / — | 3/3 |

Advertencias del propio autor: las etiquetas de contexto son escalones nominales del benchmark (longitudes reales tokenizadas de 64.060, 120.673, 245.423, 544.656 y ~1.037.119 tokens); no todos los modelos se midieron en todos los escalones; los resultados de contexto corto provienen de cargas de trabajo distintas y el TTFT en frío y el de caché caliente no forman una ratio controlada sobre el mismo prompt; la aceptación variacional del MTP puede alterar la salida frente a decodificación greedy exacta. No hay datos de MMLU, GSM8K ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el pack ocupa 76,46 GiB más 54,6 GB de tabla n-gram PLE, lo que exige un equipo con al menos ~131 GB de memoria disponible en la práctica; no cabe en ninguna GPU de consumo con memoria dedicada convencional.
- GPU recomendadas: Apple Silicon con memoria unificada grande; el autor valida en M5 Max (128 GB, GPU de 40 núcleos). No se reportan pruebas en A100, H100 ni RTX 4090, y el formato `QWP1` no es cargable en esas plataformas.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni similares; en Apple Silicon requiere configuraciones de 128 GB o superiores.
- Opciones de despliegue: exclusivamente el motor Qwegn (Swift + Metal 4, repositorio github.com/qwegnai/qwegine). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: según el autor, TTFT en frío de 113 ms y 7 ms con caché caliente, 72,3 tok/s en decodificación serial y 113,7 tok/s con MTP-3 en M5 Max; a 1M de tokens, prefill de 1.353 tok/s y decodificación de 45,4 tok/s con QSA nativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-hq4g32 (este pack) | 128,80 B (MoE, 10+1 expertos) | 262.144 nativo; ~1M en inferencia | qwen-community-1.0 | `QWP1`, solo Qwegn | Cuantización HQ4 de 5,10 bits/parámetro; cifras del autor en M5 Max |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 128,80 B (MoE) | 262.144 nativo | qwen-community-1.0 | safetensors (presumiblemente BF16) | Referencia de calidad completa; requisitos de memoria muy superiores |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables |

No se dispone de información sobre benchmarks cruzados con otros modelos de la misma categoría en la documentación aportada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Compatibilidad restringida: el contenedor `QWP1` solo carga en el motor Qwegn; no es utilizable con safetensors, GGUF, MLX, vLLM, llama.cpp ni Ollama. Migrar a otra infraestructura exige volver al modelo base.
- Cifras no independientes: todos los benchmarks provienen del autor y del motor propietario; no hay validación externa ni comparaciones controladas con otros modelos.
- Riesgo de alucinación: no documentado por el autor; como en cualquier LLM, la generación de código y la extracción de datos en contexto largo requieren verificación.
- Recall en contexto largo limitado a una prueba: el 3/3 corresponde a un único ejercicio de tres agujas y no constituye una garantía de precisión general a 1M de tokens. La extensión más allá de 262.144 tokens es una extensión en tiempo de inferencia, no entrenamiento adicional.
- Decodificación especulativa: la aceptación variacional del MTP puede producir salidas distintas a la decodificación greedy exacta, lo que afecta a la reproducibilidad.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe del modelo base a partir de la información proporcionada.
- Licencia: qwen-community-1.0 (etiquetada como `other`); es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la model card.
- Sesgos: no documentados en la información disponible.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, publicado en noviembre de 2026; se trata de un pack reciente y sin validación comunitaria.
- Requisito de memoria: ~131 GB efectivos entre pesos y tabla PLE, lo que limita su uso a equipos Apple Silicon de gama alta.

## Enlaces

- Pack cuantizado en HuggingFace: https://huggingface.co/qwegnai/Qwen3.8-Flash-Next-hq4g32
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegine
- Revisión del modelo base referenciada: `de4b8e4d43b917e7706784d8bb445c9af86a3540`
- Fichero de licencia del pack: LICENSE (incluido en el repositorio de HuggingFace)
- Gráfica de escalado LSA incluida en la model card: media/qwegn_lsa_scaling.png
