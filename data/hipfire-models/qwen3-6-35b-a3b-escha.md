# hipfire-models/qwen3.6-35b-a3b-escha

## Resumen

El modelo `hipfire-models/qwen3.6-35b-a3b-escha` es una cuantización agresiva del modelo base `Qwen/Qwen3.6-35B-A3B`, realizada por `EschaLabs` y empaquetada para el motor de inferencia `hipfire`. Se trata de un modelo de mezcla de expertos (MoE) con 35.000 millones de parámetros totales y solo 3.000 millones activos, lo que permite ejecutar una arquitectura de gran tamaño en hardware con memoria limitada. La cuantización utiliza códigos trellis de 2 bits para los pesos de los expertos, almacenados tal cual y decodificados dentro del kernel GEMV, sin necesidad de un paso de descuantización al cargar el modelo.

El proyecto resuelve el problema de ejecutar un modelo MoE de 35B en GPUs AMD RDNA3/RDNA4 con ROCm, aprovechando la memoria unificada. La model card publica tres variantes del mismo checkpoint que difieren únicamente en la representación de los tensores densos (embeddings, lm_head, atención y GatedDeltaNet): `-q8.escha` (por defecto, con tensores densos en Q8_0), `-mq6.escha` (más rápida, con un ligero aumento de perplejidad) y `-mq4.escha` (la más rápida y con mayor pérdida de calidad). Todas las métricas de velocidad y calidad fueron medidas en una APU Strix Halo (Radeon 8060S, 128 GB unificados) con ROCm 7.2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención y GatedDeltaNet (según la composición de tensores densos del empaquetado) |
| Parámetros totales | 35.000 millones (35B) |
| Parámetros activos | 3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Trellis 2-bit (W2) para expertos; densos: Q8_0, MQ6, MQ4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor hipfire `.hfq` con extensiones `.escha` (q8, mq6, mq4) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.6-35B-A3B`, un modelo de mezcla de expertos con 35B parámetros totales y 3B activos. Según la información del empaquetado, los tensores densos incluyen componentes de atención y GatedDeltaNet, lo que sugiere una arquitectura híbrida similar a la de modelos de la línea Qwen3-Next. La cuantización `Escha-W2` aplica una trellis de 2 bits a los pesos de los expertos, almacenando los códigos trellis sin modificar y decodificándolos directamente en el kernel GEMV. Esto evita la re-cuantización de los expertos y permite que las tres variantes contengan pesos de expertos idénticos.

Las diferencias entre builds se limitan a la representación de los tensores densos: `-q8.escha` es un repack bit-exacto del int8 por filas de EschaLabs al formato Q8_0 por bloques de 32, lo que añade un 6,25% de sobrecarga en esos tensores. `-mq6.escha` y `-mq4.escha` utilizan formatos de menor precisión para los densos, sacrificando algo de calidad a cambio de mayor velocidad. No se han publicado datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF o DPO) en la información disponible.

## Capacidades

- No se han publicado capacidades específicas en la información disponible. El modelo es una cuantización para inferencia, por lo que hereda las capacidades del modelo base `Qwen3.6-35B-A3B` (generación de texto, razonamiento, código, etc.), pero no hay evaluaciones que las confirmen.
- El empaquetado no documenta soporte de tool calling, function calling, agentes ni modo de pensamiento.
- Las capacidades multilingües no están disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse en una APU Strix Halo con 128 GB de memoria unificada, ofreciendo una velocidad de decodificación de 47 a 63 tokens/s, suficiente para un chat interactivo en tiempo real sin depender de la nube.
- Prototipado de agentes en una sola máquina AMD: gracias al tamaño de residente de 12–13 GB, permite experimentar con pipelines de agente en una estación de trabajo AMD sin necesidad de infraestructura de servidor.
- Evaluación de cuantizaciones para producción: las tres variantes (q8, mq6, mq4) permiten comparar el equilibrio entre calidad (perplejidad y divergencia KLD) y velocidad, facilitando la elección de una build concreta para un despliegue determinado.
- Análisis de documentos largos en local: si el modelo base soporta un contexto largo, la cuantización permite mantener documentos extensos en memoria unificada de una APU, aunque la longitud de contexto no está verificada en esta ficha.
- Generación de código asistida en local: con solo 3B parámetros activos, la latencia de prefill es de 684–886 tokens/s, lo que hace viable el autocompletado en un entorno de desarrollo si el modelo base tiene capacidades de código (no verificado aquí).
- Investigación sobre eficiencia de MoE en ROCm: el almacenamiento de códigos trellis y su decodificación en GEMV simplifica el despliegue en GPUs AMD RDNA3/RDNA4, convirtiendo este modelo en un caso de estudio para optimizaciones de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas internas de calidad y velocidad para las tres builds, medidas en un Strix Halo (gfx1151, Radeon 8060S) con ROCm 7.2:

| Build | Tamaño | Residente | Prefill (tok/s) | Decode (tok/s) | PPL (wikitext-2) | KLD vs q8 |
|---|---|---|---|---|---|---|
| `-q8.escha` (por defecto) | 12,34 GB | 12,94 GB | 684 | 47 | 7,6864 | 0,000000 |
| `-mq6.escha` | 11,84 GB | 12,45 GB | 725 | 55 | 7,6940 | 0,007907 |
| `-mq4.escha` | 11,39 GB | 12,04 GB | 886 | 63 | 8,0643 | 0,058963 |

La perplejidad se calculó sobre una slice de 384 tokens de wikitext-2, por lo que solo es útil para comparar estas tres builds entre sí, no con otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,04 GB a 12,94 GB de memoria residente según la build (11,39–12,34 GB de tamaño de archivo).
- GPU recomendada: AMD RDNA3/RDNA4 con ROCm 7.2. El modelo fue probado específicamente en una APU Strix Halo (gfx1151, Radeon 8060S) con 128 GB de memoria unificada.
- Compatibilidad con consumer GPU: no se ha verificado en la información disponible. Dado el residente de ~13 GB, podría caber en una GPU de 16 GB, pero no hay confirmación para hardware de consumo ni para NVIDIA.
- Opciones de despliegue: hipfire, un motor de inferencia Rust nativo para AMD RDNA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 684–886 tokens/s y decode de 47–63 tokens/s, medidos con `HIPFIRE_PREFILL_MAX_BATCH=1024` y MTP desactivado. Las cifras tienen una variación de ±3% entre ejecuciones.

## Comparativa con modelos similares

Las únicas comparaciones disponibles son las tres variantes internas de este mismo modelo, además del checkpoint de EschaLabs (12,30 GB) y el modelo base Qwen (sin cuantizar):

| Modelo | Tamaño | Parámetros activos | Licencia | Observaciones |
|---|---|---|---|---|
| `qwen3.6-35b-a3b-escha` (build q8) | 12,34 GB | 3B | Apache-2.0 | Build por defecto, mayor calidad |
| `qwen3.6-35b-a3b-escha` (build mq6) | 11,84 GB | 3B | Apache-2.0 | +17% decode, +0,10% PPL |
| `qwen3.6-35b-a3b-escha` (build mq4) | 11,39 GB | 3B | Apache-2.0 | +34% decode, +4,9% PPL |
| `EschaLabs/Qwen3.6-35B-A3B-Escha-W2` | 12,30 GB | 3B | Apache-2.0 | Checkpoint upstream, incluye la cuantización original |

No se han publicado comparaciones con otros modelos MoE de la misma categoría (por ejemplo, Qwen3-Next o similares) en la información disponible.

## Limitaciones y advertencias

- Las métricas de calidad (perplejidad y divergencia KLD) son relativas y se calcularon sobre una slice de 384 tokens de wikitext-2; no deben compararse con evaluaciones realizadas sobre otros corpus, longitudes de contexto o precisiones de KV.
- La cuantización 2-bit en los expertos supone una pérdida de calidad frente al modelo original. La variante `-mq4.escha` presenta un aumento de perplejidad de +4,9% y una divergencia aproximadamente 7 veces mayor que `-q8.escha`.
- El modelo está orientado exclusivamente a hardware AMD con ROCm. No se ha verificado su funcionamiento en GPUs NVIDIA, en CPU ni en otros runtimes.
- No se han publicado evaluaciones de sesgos, limitaciones de idioma ni longitud de contexto. El riesgo de alucinación es inherente a los modelos de lenguaje y no ha sido evaluado en esta cuantización.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen y del checkpoint de EschaLabs antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/qwen3.6-35b-a3b-escha
- Checkpoint de cuantización upstream: https://huggingface.co/EschaLabs/Qwen3.6-35B-A3B-Escha-W2
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor de inferencia hipfire: https://github.com/warpfront/hipfire
- Otra build de hipfire para el mismo modelo base: https://huggingface.co/hipfire-models/qwen3.6-35b-a3b
- Repo relacionado de la comunidad: https://huggingface.co/schuttdev/hipfire-qwen3.6-35b-a3b
