# compute1/Qwen3.8-27B-W8A8-INT8

## Resumen

El modelo `compute1/Qwen3.8-27B-W8A8-INT8` es una versión cuantizada del LLM multimodal denso Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. Esta variante ha sido cuantizada por el usuario compute1 utilizando la librería `llm-compressor` de Neural Magic, aplicando un esquema W8A8 (pesos y activaciones en INT8) con el formato `compressed-tensors`. El objetivo principal es reducir el consumo de memoria y acelerar la inferencia en GPUs de arquitectura Ampere (RTX 3090, A100) mediante kernels Marlin de SGLang o vLLM.

El modelo base Qwen3.8-27B presenta una arquitectura híbrida que combina 48 capas de atención lineal Gated DeltaNet (GDN) con 16 capas de atención completa (cada cuarta capa). Con aproximadamente 26,9 mil millones de parámetros, está diseñado para ejecutarse en una sola GPU de gama alta o en un portátil potente. La versión cuantizada mantiene las capacidades del modelo original (generación de texto, razonamiento, código, visión y tareas agénticas) pero con una huella de memoria reducida a 31,3 GB en disco, lo que facilita su despliegue en entornos con recursos limitados.

Esta ficha cubre las especificaciones técnicas, capacidades, casos de uso y requisitos de hardware de la versión cuantizada, basándose únicamente en la información proporcionada en la model card y en las búsquedas web realizadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa (cada 4ª capa) |
| Parametros totales | 26.899.897.856 (26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A8 INT8 (pesos y activaciones), con capas GDN `in_proj_a`/`in_proj_b` y `lm_head` en BF16 |
| Idiomas soportados | Multilingüe (sin especificar lista concreta) |
| Licencia | other (la del modelo base es Apache 2.0, pero esta versión no especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: 48 capas utilizan Gated DeltaNet (GDN), un mecanismo de atención lineal con estado recurrente constante, mientras que las 16 restantes (cada cuarta capa) usan atención completa. Esta combinación reduce el coste computacional en secuencias largas manteniendo la calidad en tareas que requieren atención global.

La cuantización se realizó con `llm-compressor`, generando un formato `int-quantized` de `compressed-tensors`. Los pesos se cuantizan a INT8 de forma canal-wise y simétrica usando un observer basado en MSE; las activaciones se cuantizan a INT8 token-wise y simétrica de forma dinámica. Sin embargo, ciertas partes se excluyen de la cuantización: `lm_head`, embeddings, vision encoder, capas MTP, sub-módulos de atención lineal GDN (`in_proj_a`, `in_proj_b`, `conv1d`, `norm`, `A_log`, `dt_bias`), todas las layernorms, `q_norm` y `k_norm`. Los proyecciones GDN se mantienen en BF16 porque requieren un manejo especial durante la carga fusionada.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en los materiales proporcionados.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Generación de código y soporte para tareas de programación.
- Procesamiento multimodal nativo (visión y texto), según la descripción del repositorio oficial de Qwen3.8-27B.
- Soporte de tool calling y flujos de trabajo agénticos (agentic workflows).
- Capacidades multilingües, aunque no se detalla la lista de idiomas.
- Optimizado para inferencia eficiente en GPUs Ampere mediante kernels Marlin (SGLang/vLLM).

## Casos de uso

- Automatización de oficina: el modelo puede redactar documentos, resumir correos, generar informes y gestionar tareas administrativas repetitivas, aprovechando su capacidad de razonamiento y generación de texto en varios idiomas.
- Asistente de programación en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar código, revisar pull requests o autocompletar funciones, reduciendo el tiempo de desarrollo.
- Chatbots de atención al cliente: su naturaleza multilingüe y su capacidad de mantener conversaciones coherentes lo hacen adecuado para sistemas de soporte automatizado en empresas con clientes internacionales.
- Análisis de documentos con visión: al ser multimodal, puede extraer información de imágenes, capturas de pantalla o documentos escaneados, útil para automatizar procesos de verificación o extracción de datos.
- Agentes autónomos: su soporte para agentic workflows permite construir sistemas que planifican y ejecutan tareas de varios pasos, como gestión de calendarios, envío de correos o búsqueda de información.
- Despliegue en entornos con GPU limitada: al estar cuantizado W8A8, cabe en GPUs con 32 GB de VRAM (como A100 o RTX 6000 Ada), lo que posibilita su uso en servidores de gama media o estaciones de trabajo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para esta versión cuantizada, ni comparaciones con el modelo base o alternativas.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 31,3 GB, lo que sugiere que los pesos en INT8 ocupan aproximadamente esa cantidad en memoria. Se recomienda una GPU con al menos 32 GB de VRAM para cargar el modelo completo sin offloading.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), RTX 6000 Ada (48 GB), o GPUs Ampere similares. La model card menciona explícitamente RTX 3090 y A100, aunque la RTX 3090 (24 GB) no podría alojar los 31,3 GB de pesos; probablemente se refiere a la compatibilidad de kernels, no a la capacidad de memoria.
- En consumer GPU: no cabe en GPUs de 24 GB (como RTX 3090 o RTX 4090) sin técnicas de offloading o cuantización adicional (por ejemplo, a 4 bits). Con offloading a CPU o usando memoria unificada podría ejecutarse, pero con penalización de rendimiento.
- Opciones de despliegue: SGLang y vLLM con kernels Marlin (recomendado), así como cualquier framework compatible con `compressed-tensors` y Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar esta versión cuantizada con otras alternativas. Sin embargo, se puede establecer una comparación cualitativa con el modelo base:

| Modelo | Parámetros | Cuantización | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | BF16 | No disponible | Apache 2.0 |
| compute1/Qwen3.8-27B-W8A8-INT8 | 26,9B | W8A8 INT8 | No disponible | other |
| Otras cuantizaciones (AWQ/GPTQ) | 26,9B | 4-8 bits | No disponible | Depende del autor |

La versión cuantizada reduce el uso de memoria en aproximadamente un 50% respecto al BF16 (que ocuparía ~54 GB), a costa de una posible ligera pérdida de precisión. No se han encontrado comparativas con modelos de tamaño similar (por ejemplo, Llama 3.1 70B o Mistral 24B) en la información recopilada.

## Limitaciones y advertencias

- La cuantización W8A8 puede degradar ligeramente la precisión en tareas sensibles al detalle numérico, como matemáticas de alta precisión o razonamiento lógico complejo.
- No todas las capas están cuantizadas: las proyecciones GDN y `lm_head` permanecen en BF16, lo que implica que el ahorro de memoria no es completo y que el rendimiento puede variar según la carga de trabajo.
- La licencia se indica como "other", a diferencia del modelo base que es Apache 2.0. Esto puede implicar restricciones adicionales para uso comercial o redistribución; se recomienda revisar los términos específicos antes de su uso en producción.
- No se proporcionan benchmarks, por lo que se desconoce el impacto exacto de la cuantización en tareas reales.
- La longitud de contexto no está documentada en la información disponible, lo que limita la planificación de despliegues con secuencias largas.
- El modelo es multilingüe pero no se especifica qué idiomas cubre; podría tener un rendimiento desigual entre lenguas.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/compute1/Qwen3.8-27B-W8A8-INT8
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de despliegue en gingerlabs.ai: https://gingerlabs.ai/blog/qwen-38-27b-hardware-requirements-and-how-to-deploy-locally
- Guía de ejecución local en lu-labs.ai: https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
