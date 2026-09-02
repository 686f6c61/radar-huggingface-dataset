# benjzzz/Ministral-3-14B-Reasoning-1bit-Gale-v3

## Resumen

Este repositorio contiene una cuantización extrema de 1 bit del modelo Ministral-3-14B-Reasoning de Mistral, realizada con el formato GALE v3. El autor, benjzzz, ha comprimido los pesos originales de 28,5 GB a 3,26 GB (~1,86 bpw de modelo completo, ~1,33 bpw lineal), lo que permite ejecutar el modelo en una única GPU de consumo. La cuantización emplea planos de signo de 1 bit congelados bajo rotación Walsh-Hadamard, codificación delta de outliers, escalas duales por fila, adaptadores de bajo rango (rank-32) y tablas de vocabulario de 4 bits.

El modelo base, Ministral-3-14B-Reasoning, está optimizado para tareas de razonamiento complejo, matemáticas, código y STEM, con una ventana de contexto de 256k tokens. Sin embargo, la cuantización degrada notablemente el rendimiento: en HumanEval, el pass@1 cae del 59,8% (BF16) al 20,7% en esta versión v3. Aun así, el tamaño reducido lo hace atractivo para despliegues locales con recursos limitados, siempre que se acepte la pérdida de calidad.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio incluye un ejemplo de inferencia con la función `load_v3_model` de `gale_inference_v3`, que reconstruye automáticamente los pesos y los distribuye entre las GPUs disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Ministral-3-14B-Reasoning) con cuantización GALE v3 1-bit |
| Parametros totales | 14B (modelo base); 3.307.613.184 parámetros en safetensors cuantizados |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256k (modelo base, no verificado en la versión cuantizada) |
| Tipos de cuantizacion | 1-bit (GALE v3) para capas lineales; 4-bit para tablas de vocabulario (embed_tokens y lm_head) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato GALE v3: `gale_1bit_hadamard_svd_v3`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 14B parámetros desarrollado por Mistral, con post-entrenamiento específico para razonamiento. La cuantización GALE v3 aplica una transformación Walsh-Hadamard a los pesos de las capas lineales (`q/k/v/o_proj`, `gate/up/down_proj`), congelando los signos de 1 bit resultantes. Los outliers se codifican mediante índices delta en uint8, con dos escalas por fila (`scale_hi` y `scale_lo`) y ganancias entrenadas. Además, se añaden adaptadores de corrección de bajo rango (rank-32) y las tablas de vocabulario se cuantizan a 4 bits con escalado por bloques de 32.

El proceso de cuantización incluye entrenamiento con QAT (Quantization-Aware Training), como se indica en los tags. La torre de visión del modelo original se elimina por completo, dejando una versión exclusivamente de texto para razonamiento. No se proporcionan detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de QAT más allá de los pasos indicados en la tabla de evaluación (step 1500, 2000, etc.).

## Capacidades

- Generación de texto y razonamiento multi-paso, aunque con degradación significativa respecto al modelo BF16.
- Generación de código: HumanEval pass@1 del 20,7% (34/164), muy por debajo del 59,8% del baseline.
- Matemáticas y STEM: el modelo base está optimizado para estas tareas, pero la cuantización afecta la precisión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modelo base lo permite.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no incluye visión (torre eliminada); no se menciona modo thinking explícito.

## Casos de uso

- Inferencia local en GPU de consumo: con 3,26 GB de pesos, el modelo cabe en GPUs con 4-6 GB de VRAM, como una RTX 3060 o 4060. Es adecuado para prototipos y aplicaciones donde el coste de hardware es crítico.
- Despliegue en entornos con memoria limitada: por ejemplo, en servidores edge o dispositivos con GPU pequeña, donde un modelo de 14B completo no sería viable.
- Evaluación de técnicas de cuantización extrema: este repositorio sirve como referencia para estudiar el impacto de la compresión 1-bit en modelos de razonamiento, comparando PPL y HumanEval con versiones menos agresivas.
- Generación de texto de baja latencia en hardware modesto: al reducir el tamaño de los pesos, la inferencia puede ser más rápida en GPUs sin memoria suficiente para el modelo completo, aunque la calidad del texto se ve afectada.
- Investigación académica sobre cuantización: el formato GALE v3 está documentado en la model card, lo que permite reproducir y analizar la técnica.
- Aplicaciones de razonamiento donde la precisión no es crítica: por ejemplo, generación de borradores, resúmenes informales o asistentes de chat no especializados, donde una tasa de error mayor es aceptable.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación comparando la versión v3 con el baseline BF16 y versiones anteriores de GALE:

| Modelo | Tamaño | Whole-Model bpw | Eval PPL | HumanEval pass@1 |
|---|---|---|---|---|
| BF16 baseline | 28,5 GB | 16,0 | — | 59,8% (98/164) |
| GALE 1-bit, 1% outliers, rank-32, step 1500 | 28,5 GB (bf16 vocab) | ~4,6 | 6,99 | 17,7% (29/164) |
| GALE 1-bit v2 (2% outliers, rank-32, step 2000) | 28,5 GB (bf16 vocab) | ~4,7 | 5,92 | 20,7% (34/164) |
| **GALE 1-bit v3 (4-bit vocab + delta idx, este repo)** | **3,26 GB** | **1,86** | **5,96** | **20,7% (34/164)** |

No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 3,5 GB, por lo que se necesitan al menos 4 GB de VRAM para cargar los pesos, más overhead de activaciones y contexto. Se recomiendan 6 GB o más para operar con comodidad.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 2070, o GPUs de datacenter como T4 (16 GB) o A10. También puede ejecutarse en Apple Silicon con suficiente memoria unificada.
- Si cabe en consumer GPU: sí, en GPUs de gama media y baja con al menos 6 GB.
- Opciones de despliegue: el ejemplo de inferencia usa `gale_inference_v3` con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | HumanEval pass@1 | Licencia |
|---|---|---|---|---|
| Ministral-3-14B-Reasoning (BF16) | 28,5 GB | 256k | 59,8% | Apache 2.0 |
| GALE 1-bit v3 (este repo) | 3,26 GB | 256k (no verificado) | 20,7% | Apache 2.0 |
| GALE 1-bit v2 | 28,5 GB (vocab bf16) | 256k (no verificado) | 20,7% | Apache 2.0 |
| GALE 1-bit v1 | 28,5 GB (vocab bf16) | 256k (no verificado) | 17,7% | Apache 2.0 |

La comparativa se limita a las versiones del mismo autor. No se dispone de datos de otros modelos cuantizados de 1 bit comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa del rendimiento: HumanEval cae del 59,8% al 20,7%, y la perplejidad (PPL) es de 5,96 frente a un baseline sin medir. Esto implica una pérdida notable de capacidad de razonamiento y generación de código.
- Sin soporte de visión: la torre de visión se elimina, por lo que el modelo solo procesa texto.
- Riesgo de alucinaciones: al ser una cuantización extrema, la coherencia del texto puede verse afectada, aumentando la probabilidad de respuestas incorrectas o inventadas.
- Sesgos del modelo base: no se documentan sesgos específicos, pero el modelo original de Mistral puede arrastrar sesgos de los datos de entrenamiento.
- Limitaciones de contexto: aunque el modelo base soporta 256k, no se ha verificado que la versión cuantizada mantenga esa longitud sin degradación adicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original.
- Formato propietario: la inferencia requiere el módulo `gale_inference_v3`, que no está disponible en los frameworks estándar (vLLM, llama.cpp, etc.), lo que limita la interoperabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/benjzzz/Ministral-3-14B-Reasoning-1bit-Gale-v3
- Repositorio de la versión anterior (1-bit Gale): https://huggingface.co/benjzzz/Ministral-3-14B-Reasoning-1bit-Gale
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/mistralai/ministral-3-14b-reasoning
- Guía de uso con vLLM: https://docs.vllm.ai/projects/recipes/en/stable/Mistral/Ministral-3-Reasoning.html
- Documentación oficial de Mistral: https://docs.mistral.ai/models/ministral-3-14b-25-12
