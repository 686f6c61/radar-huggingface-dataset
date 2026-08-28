# avlp12/GLM-5.2-Alis-MLX-Dynamic-2.56bpw

## Resumen

GLM-5.2-Alis-MLX-Dynamic-2.56bpw es una cuantización de precisión mixta del modelo GLM-5.2 de Zhipu AI (zai-org), desarrollada por avlp12 para ejecutarse en Apple Silicon mediante MLX. El modelo base es un MoE de 744B parámetros totales (~40B activos) con arquitectura MLA (Multi-head Latent Attention) estilo DeepSeek-V3.2 y DeepSeek Sparse Attention (DSA), diseñado para tareas agénticas y de codificación. Esta versión cuantizada a ~2.56 bits/peso reduce el tamaño en disco a 242,4 GB, permitiendo que el modelo completo quepa en máquinas con 256 GB de memoria unificada, algo que ninguna otra build MLX existente logra (las alternativas de 4 bits superan los 360 GB).

La relevancia de este checkpoint radica en que hace accesible un modelo frontera de 744B en hardware de consumo de gama alta (Apple Silicon con 256 GB o más), a costa de una pérdida de calidad controlada mediante técnicas de cuantización per-tensor con retuning (DWQ) y recorte de outliers. Incluye además la capa MTP (Multi-Token Prediction) nativa del modelo para decodificación especulativa, lo que mejora el throughput en inferencia. Está pensado para desarrolladores que necesitan un modelo de razonamiento y código de gran tamaño en un solo equipo, sin depender de servidores en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con MLA + DeepSeek Sparse Attention (glm_moe_dsa) |
| Parametros totales | 72.565.831.680 (según safetensors); modelo base: 744B |
| Parametros activos | ~40B |
| Longitud de contexto | 1M-capable (arquitectura DSA); limitado a ~26-32K prefill en 256 GiB |
| Tipos de cuantizacion | ~2.56 bits/peso (per-tensor mixed precision); variantes 2.3 y 3.5 bpw disponibles |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 es un Mixture-of-Experts con 744B parámetros totales y ~40B activos por token. Su arquitectura combina atención de latencia multi-cabeza (MLA) con DeepSeek Sparse Attention (DSA), una técnica que reduce el coste computacional del contexto largo al hacer que la atención sea selectiva sobre tokens relevantes. Esta combinación permite una ventana de contexto teórica de 1M tokens, aunque en la práctica el hardware limita su uso.

La cuantización aplicada en este checkpoint sigue un esquema de precisión mixta per-tensor estilo Unsloth: los expertos enrutados (que concentran ~97% de los parámetros) se cuantizan a 2 bits, mientras que las rutas sensibles (como las capas de atención y los MLP compartidos) conservan mayor precisión. El proceso incluye un recorte de outliers con anclaje (anchor-guarded clip) y un retuning mediante DWQ (Dynamic Weight Quantization) con un profesor de 4.5 bpw, calibrado con un 45% de datos en chino. El checkpoint incluye la capa MTP nativa (capa 78) para decodificación especulativa, que permite generar múltiples tokens por paso. No se dispone de información sobre el dataset de entrenamiento original ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino, con especial énfasis en tareas de codificación y agénticas.
- Codificación de alto nivel: el modelo base está diseñado para agentes de programación, incluyendo generación, revisión y refactorización de código.
- Razonamiento multi-step y planificación: apto para tareas que requieren encadenar varias operaciones lógicas.
- Decodificación especulativa nativa mediante MTP, que acelera la generación sin pérdida de calidad.
- Manejo de contexto largo gracias a DSA, aunque limitado por la memoria disponible.
- Capacidades multilingües limitadas a inglés y chino (según la model card).
- Tool calling y uso de funciones: no está documentado explícitamente, pero el perfil "agentic-coding" del modelo base sugiere soporte para integración con herramientas.

## Casos de uso

- Desarrollo de agentes autónomos de codificación: el modelo puede actuar como motor de un agente que edita archivos, ejecuta comandos y resuelve issues en repositorios, gracias a su capacidad de razonamiento multi-step y su perfil agéntico.
- Análisis y comprensión de repositorios grandes: con su contexto amplio (hasta ~26K tokens en 256 GB), puede procesar múltiples archivos de un proyecto para responder preguntas sobre arquitectura o generar documentación.
- Generación de código en entornos offline: equipos que necesitan un modelo de gran tamaño sin conexión a internet pueden desplegarlo en una estación de trabajo con Apple Silicon y 256 GB de RAM.
- Asistente de programación en chino e inglés: útil para empresas con equipos bilingües que requieren respuestas técnicas precisas en ambos idiomas.
- Investigación en compresión de modelos: el checkpoint sirve como caso de estudio para técnicas de cuantización mixta de baja precisión (2-bit) en MoE de gran escala.
- Prototipado de aplicaciones de razonamiento avanzado: desarrolladores que exploran capacidades de modelos frontera sin depender de APIs externas pueden usar esta build en local.

## Benchmarks y rendimiento

La model card reporta resultados reproducidos con `mlx_lm.evaluate` (0-shot) y `mlx_lm.perplexity` (seq 2048, 50 muestras, seed 123), comparando con una build anterior de GLM-5.1 y con la hermana de 3.5 bpw:

| Benchmark | GLM-5.1 · 2.7 bpw | **GLM-5.2 · 2.56 bpw (este)** | GLM-5.2 · 3.5 bpw |
|---|---|---|---|
| Perplexity (menor es mejor) | 4.165 | **3.571** | 3.644 |
| HellaSwag (acc_norm) | 0.606 | **0.638** | 0.626 |
| PIQA (acc) | 0.796 | **0.812** | 0.838 |
| WinoGrande (acc) | 0.660 | **0.744** | 0.780 |
| Generation (tok/s) | 18.35 | no disponible | no disponible |

Además, la tabla de calidad KL/top-1 flip frente a la referencia de 4.5 bpw muestra una divergencia global de 0.419 / 17.4% (overall), con mejores resultados en código (0.183 / 10.0%) que en inglés (0.464 / 17.3%) o chino (0.610 / 24.8%). La perplejidad strided en wikitext es 3.698, en código 2.054 y en tulu-3 flat 3.571.

## Requisitos de hardware

- Memoria unificada mínima: 256 GB para cargar el modelo completo (242 GB en disco + overhead de runtime).
- Memoria según contexto (medido con KV int8): ~249 GB a 8K, ~263 GB a 26K, ~293 GB a 64K, ~344 GB a 128K.
- GPU recomendada: Apple Silicon con al menos 256 GB unificados; el rendimiento de referencia se midió en un M3 Ultra (80 núcleos) con 512 GB.
- Rendimiento medido (M3 Ultra 512GB): 191.0 tokens/s en prefill (PP) y 20.4 tokens/s en generación (TG), según omlx.ai.
- Despliegue: requiere `mlx-lm` parcheado con las correcciones del indexador `glm_moe_dsa` (el puerto estándar falla o degrada el contexto largo). Soporta `--mtp` para decodificación especulativa.
- No cabe en GPUs de consumo (RTX 4090, etc.) por su formato MLX y su requisito de memoria unificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplexity | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **GLM-5.2 · 2.56 bpw (este)** | 744B (MoE) | 1M (teórico) | 3.571 | MIT | MLX, Apple Silicon |
| GLM-5.2 · 3.5 bpw | 744B (MoE) | 1M completo | 3.644 | MIT | MLX, requiere 512 GB |
| GLM-5.1 · 2.7 bpw | ~700B (MoE) | no disponible | 4.165 | MIT | MLX, retirado del Hub |

La comparativa se limita a builds de la misma familia y autor. Frente a la versión de 3.5 bpw, esta build de 2.56 bpw es ~25% peor en perplejidad de wikitext y ~11% peor en código, pero es la única que cabe en 256 GB. No se dispone de comparaciones con otros modelos MoE de tamaño similar (como DeepSeek-V3 o Qwen MoE) en este formato.

## Limitaciones y advertencias

- Requiere un `mlx-lm` parcheado con correcciones específicas para `glm_moe_dsa`; el puerto estándar no carga el modelo correctamente o degrada la salida en contexto largo.
- La cuantización a 2 bits en los expertos enrutados reduce significativamente la calidad en prosa y razonamiento general, como refleja la perplejidad 25% superior a la versión de 3.5 bpw.
- El contexto práctico está limitado por la memoria: en una máquina de 256 GB solo se puede prefill ~26-32K tokens, muy por debajo del límite arquitectónico de 1M.
- Solo soporta inglés y chino; no hay garantías de buen rendimiento en otros idiomas.
- El tamaño del checkpoint (242 GB) hace que la descarga y el almacenamiento sean costosos, y requiere un SSD con espacio suficiente.
- Aunque la licencia es MIT, el modelo base puede tener restricciones adicionales no documentadas en esta build; se recomienda verificar la licencia del modelo original de Zhipu AI.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones específicas para esta cuantización.

## Enlaces

- [Checkpoint en HuggingFace](https://huggingface.co/avlp12/GLM-5.2-Alis-MLX-Dynamic-2.56bpw)
- [Colección GLM-5.2 Alis MLX Dynamic](https://huggingface.co/collections/avlp12/glm-52-alis-mlx-dynamic-6a565b3ce5cff4f22ab0156f)
- [Modelo base zai-org/GLM-5.2](https://huggingface.co/zai-org/GLM-5.2)
- [Caso de estudio en GitHub (alis-dwq)](https://github.com/avlp12/alis-dwq/blob/main/examples/glm-5.2/README.md)
- [Benchmark en omlx.ai](https://omlx.ai/benchmarks/performance/4vw8g5lq)
- [Repositorio alis-dwq](https://github.com/avlp12/alis-dwq)
