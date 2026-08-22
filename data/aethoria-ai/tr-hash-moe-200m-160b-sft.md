# AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT

## Resumen

TR-HASH-MoE-200M-160B-SFT es un modelo de lenguaje causal de 201,2 millones de parámetros desarrollado por AETHORIA-AI, resultado de un ajuste fino supervisado (SFT) completo sobre el modelo base TR-HASH-MoE-200M-160B-Refinement. Su principal innovación es el uso de un enrutamiento determinista por token-ID (multi-hash) en lugar de un router aprendido, típico de los MoE convencionales. Con 16 capas, GQA (14 cabezas de consulta, 2 de clave/valor), cuatro expertos almacenados con activación top-2 y una ruta compartida SwiGLU, el modelo alcanza resultados competitivos frente a modelos compactos de tamaño similar, como GPT-2 Small o Pythia-160M, en tareas de razonamiento de sentido común.

El checkpoint publicado es la época 3, paso 5.982, seleccionado por su mejor resultado en PIQA y menor pérdida en datos de validación. Está entrenado con un dataset de 300.000 ejemplos de instrucción (202,9 millones de tokens) y una ventana de contexto de 2.048 tokens. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales, y soporta inglés y francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer con MoE determinista (TR-HASH), 16 capas, GQA (14 query heads / 2 KV heads), 4 expertos almacenados con top-2 activación, ruta compartida SwiGLU, embeddings atados |
| Parametros totales | 202.731.072 (según safetensors; la model card indica 201,2M) |
| Parametros activos | No aplica (MoE determinista, pero la activación top-2 de 4 expertos reduce cómputo; no se especifica número de parámetros activos) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No publicados oficialmente; pesos raíz en float32, evaluación en FP16 (MLX) |
| Idiomas soportados | en, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) y MLX (FP16) para evaluación |

## Arquitectura y entrenamiento

La arquitectura TR-HASH se diferencia de los MoE clásicos en que la selección de expertos no se aprende mediante un router neuronal, sino que se determina de forma determinista a partir del ID del token mediante una función multi-hash. Esto reduce el coste de entrenamiento y elimina la inestabilidad del router, aunque mantiene la eficiencia computacional del MoE al activar solo dos de los cuatro expertos por token. El modelo incluye una ruta compartida SwiGLU siempre activa, que aporta capacidad adicional sin aumentar el número de expertos activos.

El entrenamiento de SFT fue completo (no LoRA ni QLoRA), con los 201,2M de parámetros entrenables. Se usó el dataset AETHORIA-AI/TR-HASH-MoE-200M-SFT-v2-300K, con 300.000 ejemplos de entrenamiento y 3.000 de validación, sin truncamiento (202,9M tokens). El proceso duró 3 épocas con AdamW (betas 0.9/0.95, weight decay 0.1), LR pico de 2e-5 con warmup del 3% y decaimiento coseno continuo, en precisión BF16. Los kernels de entrenamiento requieren Liger y Triton. El checkpoint publicado es el de la época 3, paso 5.982.

## Capacidades

- Generación de texto y continuación causal de lenguaje (text-generation).
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (evaluado en PIQA, ARC-Easy, ARC-Challenge, HellaSwag).
- Capacidad de seguir instrucciones básicas y mantener conversaciones de varios turnos (aunque no se publica un benchmark específico de chat).
- Soporte multilingüe limitado a inglés y francés.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Al ser un modelo pequeño (201M), no está diseñado para tareas complejas de razonamiento avanzado o código, aunque puede utilizarse en escenarios de bajo coste.

## Casos de uso

- Clasificación y etiquetado de texto: el modelo puede asignar categorías o extraer entidades en inglés y francés, gracias a su capacidad de razonamiento de sentido común y su entrenamiento en instrucciones.
- Generación de respuestas cortas en asistentes conversacionales ligeros: su bajo coste de inferencia permite desplegarlo en entornos con recursos limitados, como aplicaciones móviles o sistemas embebidos.
- Evaluación de arquitecturas MoE deterministas: es un modelo de referencia para investigadores que estudian rutas de expertos sin router aprendido, ya que su diseño es reproducible y su código está disponible.
- Filtrado de contenido: puede clasificar texto como apropiado o inapropiado, o detectar temas específicos, utilizando su capacidad de instrucciones.
- Generación de variaciones de texto: por ejemplo, reformular frases o generar sinónimos en inglés y francés, útil para aumentar datos de entrenamiento.
- Experimentación en entornos educativos o de prototipado: dado su tamaño y licencia permisiva, es adecuado para enseñar conceptos de MoE y GQA en cursos de aprendizaje automático.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados del checkpoint publicado (época 3, paso 5.982) y la comparación con modelos compactos de referencia:

| Modelo | Parámetros | PIQA acc | ARC-Easy acc | ARC-Challenge acc | ARC Combined acc | HellaSwag acc |
|---|---|---|---:|---:|---:|---:|---:|
| TR-HASH MoE 200M Full SFT | 201,2M | 68,01% | 57,24% | 27,13% | 47,29% | 33,21% |
| GPT-2 Small | 124M | 62,89% | 43,81% | 19,03% | ≈35,63% | 28,92% |
| OPT-125M | 125M | 63,00% | 43,60% | 19,10% | ≈35,51% | 29,20% |
| Pythia-160M | 160M | 62,73% | 43,52% | 18,77% | 35,34% | — |

Los resultados se obtuvieron con evaluación zero-shot de continuación causal (log-likelihood), sin plantilla de chat, con longitud máxima de 2048 tokens. PIQA se evaluó desde el checkpoint nativo; ARC y HellaSwag desde una conversión FP16 MLX de los pesos F32. La comparación es informativa, ya que los modelos de referencia se evaluaron con lm-evaluation-harness, mientras que TR-HASH se evaluó con su propio evaluador causal.

## Requisitos de hardware

- VRAM estimada: en FP16, el modelo ocupa aproximadamente 400 MB; en FP32, unos 800 MB. Con cuantización a int8 (no oficial) se podría reducir a ~200 MB, pero no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas. Para inferencia rápida, una RTX 4090 o A10 sería más que suficiente.
- Cabe en GPU de consumo (desde gama baja) y también en CPU, gracias a su tamaño reducido.
- Despliegue: se puede cargar con Transformers mediante `AutoModelForCausalLM.from_pretrained` con `trust_remote_code=True`. No se menciona soporte oficial para vLLM (existe una issue abierta para añadir soporte nativo), ni para llama.cpp. Se puede usar con MLX en Apple Silicon (la evaluación se realizó con MLX FP16).
- Latencia y throughput: no se publican cifras, pero para un modelo de 200M, se espera una latencia de milisegundos en GPU moderna y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Params | Contexto | PIQA | ARC-Easy | ARC-Challenge | Licencia | Formato |
|---|---:|---:|---:|---:|---:|---|---|
| TR-HASH MoE 200M SFT | 201,2M | 2.048 | 68,01% | 57,24% | 27,13% | Apache-2.0 | Safetensors |
| GPT-2 Small | 124M | 1.024 | 62,89% | 43,81% | 19,03% | MIT | Safetensors |
| OPT-125M | 125M | 2.048 | 63,00% | 43,60% | 19,10% | Apache-2.0 | Safetensors |
| Pythia-160M | 160M | 2.048 | 62,73% | 43,52% | 18,77% | Apache-2.0 | Safetensors |

El TR-HASH supera a los tres modelos en todas las métricas, aunque la comparación es aproximada por los distintos entornos de evaluación. Su ventaja principal es la arquitectura MoE determinista que permite una mayor capacidad de representación con un coste computacional bajo.

## Limitaciones y advertencias

- El contexto de 2.048 tokens es corto para tareas que requieran documentos largos o conversaciones extensas.
- Solo está entrenado en inglés y francés; no se garantiza rendimiento en otros idiomas.
- El modelo puede alucinar hechos o generar información incorrecta, especialmente en tareas de razonamiento complejo.
- No se han publicado estudios de sesgos; es probable que refleje los sesgos de los datos de entrenamiento (el dataset SFT procede de fuentes auditadas, pero no se detalla su composición).
- Requiere `trust_remote_code=True` al cargarlo con `transformers`, ya que el adaptador no está integrado de forma nativa (hay una issue abierta para añadirlo).
- No se publican cuantizaciones oficiales, por lo que el despliegue en entornos de muy baja memoria puede requerir conversiones manuales.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de origen pueden tener licencias propias; se recomienda revisar el manifiesto de datos.

## Enlaces

- Repositorio Hugging Face: [AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT](https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT)
- Modelo base de refinamiento: [AETHORIA-AI/TR-HASH-MoE-200M-160B-Refinement](https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-Refinement)
- Dataset de SFT: [AETHORIA-AI/TR-HASH-MoE-200M-SFT-v2-300K](https://huggingface.co/datasets/AETHORIA-AI/TR-HASH-MoE-200M-SFT-v2-300K)
- Paper técnico (PDF): [TR-Hash 200M: Multi-Hash Token-ID Routing for Shared Residual Experts](https://www.complexity-ai.fr/papers/tr-hash-200m-multi-hash-routing.pdf)
- Issue de soporte en vLLM: [Add native support for TR-HASH deterministic token-routed MoE #48193](https://github.com/huggingface/transformers/issues/48193)
- Issue de soporte en Transformers: [Add native support for TR-HASH deterministic token-routed MoE #48193](https://github.com/huggingface/transformers/issues/48193)
