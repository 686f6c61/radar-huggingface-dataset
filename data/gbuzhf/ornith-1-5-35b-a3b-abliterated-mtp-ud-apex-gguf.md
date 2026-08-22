# gbuzhf/Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF

## Resumen

Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF es una colección de nueve cuantizaciones GGUF del modelo Ornith-1.5-35B-A3B, un modelo de razonamiento y código de tipo mixture-of-experts (MoE) con 35.500 millones de parámetros totales y aproximadamente 3.000 millones activos por token. La variante original, desarrollada por el Ornith Team, extiende el bucle de auto-mejora de Ornith-1.0 optimizando conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones mediante aprendizaje por refuerzo. Esta versión específica aplica una técnica de abliteración que elimina los comportamientos de rechazo del modelo original, e incorpora un head MTP (Multi-Token Prediction) injertado para acelerar la decodificación especulativa.

La relevancia de este lanzamiento reside en su metodología de cuantización: introduce el estándar ICE (Information-Constrained Encoding) y el sistema de nueve niveles Pareto-óptimos, que elimina las recetas dominadas de lanzamientos anteriores. Las mediciones de KLD (Kullback-Leibler divergence) demuestran que la abliteration es una perturbación menor que la cuantización Q6_K, y que ambos efectos son ortogonales entre sí, lo que permite cuantizar el modelo sin revertir la eliminación del rechazo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con head MTP para decodificación especulativa |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | ~3.000 millones por token (8 de 256 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | UD-Q6_K, UD-Q5_K_S, 25G-ICE, 23G-ICE, 21G-ICE, 19G-ICE, UD-IQ4_XS, APEX-I-Compact-v2D-lite, APEX-I-Mini-v2D-lite |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Ornith-1.5-35B-A3B, un MoE que activa aproximadamente 3.000 millones de parámetros por token de un total de 35.000 millones. La arquitectura sigue el diseño de Qwen-3-35B-A3B, con un stack de 256 expertos enrutados y un experto compartido denso. El entrenamiento original emplea un bucle de auto-mejora: el modelo genera nuevas tareas, construye scaffolds específicos y produce soluciones que se utilizan para el aprendizaje por refuerzo, creando un ciclo continuo de mejora.

Esta versión cuantizada presenta tres innovaciones técnicas principales. La primera es la abliteration, que elimina la dirección de rechazo del espacio de activaciones del modelo, reduciendo el KLD medio en 0,0151 respecto al original, una perturbación menor que la cuantización Q6_K. La segunda es el injerto de un head MTP procedente del modelo Ornith-1.5 original, que permite decodificación especulativa y reduce la latencia en entornos de producción. La tercera es el estándar ICE, que asigna bits según la distancia de propagación del error de cuantización: los tensores que escriben directamente en el flujo residual, la ruta densa siempre activa y el router se protegen con mayor precisión, mientras que los expertos enrutados (93% de los parámetros, solo 8 de 256 activos) se dejan uniformes.

## Capacidades

- Generación de texto y razonamiento complejo en múltiples pasos.
- Generación de código con soporte para tareas de programación avanzadas.
- Auto-mejora: el modelo puede generar nuevas tareas de entrenamiento, construir scaffolds y producir soluciones para mejorar su propio rendimiento mediante RL.
- Aprendizaje por refuerzo para la optimización conjunta de generación de tareas, construcción de scaffolds y soluciones.
- Abliterated: sin comportamientos de rechazo, adecuado para casos de uso que requieren respuestas sin restricciones.
- Decodificación especulativa mediante el head MTP injertado, que acelera la inferencia.
- Capacidad multimodal (image-text-to-text) según la etiqueta de pipeline, aunque la extensión de esta capacidad no está documentada.

## Casos de uso

- Asistente de programación autónomo: el modelo puede generar código, depurar y proponer soluciones en repositorios de código, gracias a su capacidad de razonamiento y generación de código. Su licencia MIT permite su integración en herramientas de desarrollo comerciales.
- Agente de desarrollo auto-mejorable: dado su sistema de auto-mejora, el modelo puede utilizarse en pipelines de investigación que requieran que el sistema proponga nuevas tareas y se evalúe a sí mismo, por ejemplo en entornos de auto-ajuste de agentes.
- Inferencia en entornos con VRAM limitada: las cuantizaciones ICE de 19G y 21G permiten ejecutar el modelo en GPUs de consumo como la RTX 3090 o RTX 4090 (24 GB) con calidad superior a las recetas tradicionales del mismo tamaño.
- Despliegue con decodificación especulativa: el head MTP permite usar el modelo como un modelo de draft para acelerar la generación de modelos más grandes en infraestructuras de inferencia como vLLM.
- Chat de propósito general sin censura: la abliteration elimina los mecanismos de rechazo, lo que lo hace adecuado para aplicaciones de conversación libre en las que se requiera que el modelo no rechace preguntas o temas sensibles.
- Investigación en cuantización y compresión de modelos: los nueve niveles de cuantización, con sus métricas detalladas de KLD, PPL y top-1, sirven como referencia para estudiar el impacto de la cuantización en modelos MoE de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye métricas de cuantización medidas en wikitext-2-raw (16 chunks x 2048 ctx) que se presentan a continuación:

| Tier | Tamaño | Mean KLD | 99% KLD | 99.9% KLD | PPL ratio | Mismo top-1 | bpw activo | bpw archivo | Overall |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `MTP-UD-Q6_K` | 30.21 GB | 0.0222 | 0.226 | 0.695 | 0.9960 | 94.05% | 8.063 | 6.804 | 96.3 |
| `MTP-UD-Q5_K_S` | 25.84 GB | 0.0261 | 0.269 | 0.899 | 0.9871 | 93.51% | 7.693 | 5.820 | 95.9 |
| `MTP-25G-ICE` | 24.85 GB | 0.0293 | 0.300 | 1.280 | 0.9856 | 93.44% | 7.686 | 5.597 | 95.6 |
| `MTP-23G-ICE` | 22.84 GB | 0.0345 | 0.345 | 1.151 | 0.9902 | 92.39% | 7.523 | 5.143 | 95.0 |
| `MTP-21G-ICE` | 20.85 GB | 0.0398 | 0.400 | 1.655 | 0.9943 | 92.06% | 7.357 | 4.695 | 94.6 |
| `MTP-19G-ICE` | 18.82 GB | 0.0612 | 0.630 | 2.327 | 1.0025 | 90.02% | 7.192 | 4.240 | 92.7 |
| `MTP-UD-IQ4_XS` | 18.68 GB | pendiente | pendiente | pendiente | pendiente | pendiente | 6.762 | 4.209 | pendiente |
| `MTP-APEX-I-Compact-v2D-lite` | 0.00 GB | pendiente | pendiente | pendiente | pendiente | pendiente | 5.228 | 3.956 | pendiente |
| `MTP-APEX-I-Mini-v2D-lite` | 0.00 GB | pendiente | pendiente | pendiente | pendiente | pendiente | 4.180 | 3.208 | pendiente |

La abliteration en sí misma produce un KLD de 0.0151 respecto al modelo original, y la comparación con la versión no ablterada muestra que la abliteration no dificulta la cuantización (Δ entre -4.4% y +0.6%).

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Tier `MTP-UD-Q6_K` (30.21 GB): requiere una GPU con al menos 32 GB de VRAM (A100, A6000).
  - Tier `MTP-UD-Q5_K_S` (25.84 GB): requiere una GPU con al menos 26 GB de VRAM.
  - Tiers `25G-ICE` (24.85 GB) y `23G-ICE` (22.84 GB): caben en una RTX 4090 de 24 GB con un ligero margen.
  - Tiers `21G-ICE` (20.85 GB) y `19G-ICE` (18.82 GB): caben en una RTX 3090 de 24 GB o una RTX 4080 de 16 GB (solo el tier 19G).
  - Tier `UD-IQ4_XS` (18.68 GB): caben en una RTX 4080 de 16 GB con cuantización adicional del contexto.
  - Tiers `APEX-I-Compact` y `APEX-I-Mini`: aún sin tamaño definido, orientados a GPUs con menos de 16 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A100, A6000, H100 para los tiers más grandes.
- En Mac: los tiers de 19G y 21G caben en un Mac con 32 GB de RAM unificado.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte de GGUF), TGI.
- La decodificación especulativa con el head MTP puede acelerar la inferencia entre un 20-40% en configuraciones compatibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Cuantización | KLD (Q6_K) |
|---|---|---|---|---|---|---|
| **Ornith-1.5-35B-A3B-Abliterated (este)** | 35.5B | ~3B | no disponible | MIT | GGUF (9 tiers) | 0.0222 |
| Ornith-1.5-35B-A3B (original) | 35.5B | ~3B | no disponible | MIT | BF16 | — |
| Qwen3-35B-A3B | 35.5B | ~3B | 256K | Apache 2.0 | BF16, GGUF | — |
| Ornith-1.0-35B | 35.5B | ~3B | no disponible | MIT | GGUF | — |

No se dispone de benchmarks estándar comparativos entre estos modelos. La comparación se limita a la arquitectura y las métricas de cuantización.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido dañino, ilegal o éticamente cuestionable sin filtro. Úselo con responsabilidad.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta versión específica, lo que dificulta la comparación directa con otros modelos.
- Los tiers `APEX-I-Compact` y `APEX-I-Mini` no tienen tamaño de archivo publicado y su calidad es pendiente; el tier Mini muestra una caída pronunciada de calidad según el autor.
- La longitud de contexto no se ha publicado; se recomienda verificar el modelo base original para conocer el límite real.
- Los idiomas soportados no están documentados en la model card; el modelo base probablemente hereda el soporte de Qwen3, pero no está confirmado.
- La licencia MIT permite uso comercial sin restricciones, pero no hay garantía de soporte ni de responsabilidad del autor.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF)
- [Modelo base original: PocketAiHub/Ornith-1.5-35B-A3B-Abliterated](https://huggingface.co/PocketAiHub/Ornith-1.5-35B-A3B-Abliterated)
- [Versión no abliterada: gbuzhf/Ornith-1.5-35B-MTP-UD-APEX-GGUF](https://huggingface.co/gbuzhf/Ornith-1.5-35B-MTP-UD-APEX-GGUF)
- [Versión 1.0: gbuzhf/Ornith-1.0-35B-MTP-UD-APEX-GGUF](https://huggingface.co/gbuzhf/Ornith-1.0-35B-MTP-UD-APEX-GGUF)
- [Ornith-1.5: From Self-Scaffolding to Self-Improvement (blog oficial)](https://ornith.ai/ornith_1_5.html)
- [Guía de ejecución local de Ornith 1.5 35B](https://atomic.chat/blog/guides/how-to-run-ornith-1-5-35b-locally)
- [Ficha de Ornith-1.5-35B-A3B en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/ornith-1.5-35b-a3b-gguf-ornith-ai)
