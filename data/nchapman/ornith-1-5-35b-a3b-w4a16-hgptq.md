# nchapman/Ornith-1.5-35B-A3B-W4A16-HGPTQ

## Resumen

Ornith-1.5-35B-A3B-W4A16-HGPTQ es una cuantización de 4 bits del modelo ornith-ai/Ornith-1.5-35B-A3B, un Mixture-of-Experts (MoE) de 35B parámetros totales con 3B activos por token desarrollado por Ornith AI. La cuantización la firma nchapman y emplea GPTQ con rotación de Hadamard (HGPTQ), esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) y el formato compressed-tensors, pensado para servir el modelo en una única GPU de 24 GB.

El modelo base es un MoE multimodal (image-text-to-text) con visión integrada y Multi-Token Prediction (MTP) para decodificación especulativa, orientado a tareas de auto-mejora y razonamiento. La cuantización preserva los 256 expertos enrutados, los expertos compartidos, las capas de atención y GDN, el codificador de visión y el drafter MTP, todos calibrados y cuantizados a 4 bits, con la cabeza de salida a 8 bits.

Su relevancia práctica radica en que reduce el peso en disco de 67,0 GiB (BF16) a 18,78 GiB, un factor de 3,6×, permitiendo ejecutar un MoE de 35B con visión en GPUs de consumo como la RTX 3090 o la RTX 4090. Está optimizado para el runtime warp34 y es compatible con vLLM 0.34+.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con capas de atención y GDN, codificador de visión y drafter MTP; clase `qwen3_5_moe` |
| Parámetros totales | 36.468.770.672 |
| Parámetros activos | 3B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (GPTQ con Hadamard, HGPTQ); pesos 4 bits, activaciones 16 bits; cabeza de salida 8 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Tamaño en disco | 18,78 GiB (cuantizado) frente a 67,0 GiB en BF16 |
| Tamaño del repo | 41,5 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 36,47B parámetros totales y 3B activos por token, lo que le confiere velocidades de decodificación propias de un modelo de 3B pese a su capacidad total. Incorpora capas de atención y capas GDN (probablemente una variante de atención lineal o de estado recurrente, aunque la model card no lo detalla), un codificador de visión para entrada de imágenes y un drafter de Multi-Token Prediction (MTP) que habilita decodificación especulativa integrada. La model card lo describe como un modelo de auto-mejora ("self-improvement model") de Ornith AI.

Esta variante cuantizada no ha sido reentrenada: es una compresión post-entrenamiento. El proceso de cuantización cubre los 256 expertos enrutados, los expertos compartidos, las capas de atención y GDN, el codificador de visión y el drafter MTP, todos calibrados y cuantizados a 4 bits, con una cabeza de salida a 8 bits. La técnica HGPTQ aplica una rotación de Hadamard antes de la cuantización GPTQ para reducir el error en activaciones con valores atípicos. Según el autor, la cuantización retiene un 96,4% de concordancia top-1 en visión aislada (97,0% en el conjunto de guarda UI/OCR) y un 91,4% de concordancia en el borrador MTP aislado, frente al modelo en BF16. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo modo de pensamiento (thinking) si el modelo base lo soporta.
- Comprensión de imágenes (image-text-to-text): el codificador de visión está cuantizado y operativo, con retención del 96,4% de concordancia top-1.
- Razonamiento sobre documentos e interfaces (UI/OCR), con un conjunto de guarda específico que retiene el 97,0% de concordancia.
- Decodificación especulativa mediante Multi-Token Prediction (MTP) integrado, con el drafter cuantizado y un 91,4% de concordancia.
- Ejecución eficiente de MoE con 3B parámetros activos por token, lo que reduce el coste computacional por token generado.
- Compatibilidad con tool calling y function calling: no confirmada explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de agentes: no confirmado en la información disponible.

## Casos de uso

- Asistencia multimodal en GPU de consumo: desplegar un modelo con visión en una única RTX 3090 o RTX 4090 de 24 GB, cubriendo casos de descripción de imágenes, extracción de texto y respuesta a preguntas sobre capturas o documentos escaneados.
- Procesamiento de documentos con OCR: usar el conjunto de guarda UI/OCR, que retiene el 97,0% de concordancia, para pipelines de digitalización y extracción de campos en facturas, formularios o pantallas de aplicación.
- Servicio de chat con latencia baja: aprovechar los 3B parámetros activos por token y el MTP para servir conversaciones multi-turno con throughput alto en una sola GPU, sin necesidad de clúster.
- Prototipado e investigación en local: evaluar un MoE de 35B con visión en estaciones de trabajo sin infraestructura de datacenter, gracias a los 18,78 GiB en disco y a la compatibilidad con vLLM y warp34.
- Generación aumentada por recuperación (RAG) multimodal: combinar el modelo con un almacén de documentos e imágenes para responder consultas que requieran interpretar figuras, tablas o capturas junto con texto.
- Automatización de tareas de agente con razonamiento multi-paso: emplear el modo de pensamiento y el MTP para planificar y ejecutar secuencias de acciones, siempre que se valide previamente el soporte de tool calling.
- Evaluación comparativa de cuantizaciones: usar esta variante W4A16 como referencia para medir la degradación frente a BF16 en visión y MTP, con las métricas de concordancia publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de fidelidad de la cuantización frente al modelo en BF16:

| Métrica | Resultado |
|---|---|
| Concordancia top-1 en visión aislada | 96,4% |
| Concordancia en conjunto de guarda UI/OCR | 97,0% |
| Concordancia en borrador MTP aislado | 91,4% |
| Reducción de tamaño en disco | 3,6× (18,78 GiB frente a 67,0 GiB) |

## Requisitos de hardware

- VRAM estimada para inferencia: 18,78 GiB de pesos, más espacio para caché KV, entradas de visión y decodificación especulativa; cabe en 24 GB con margen.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB) para warp34; A100 y H100 para vLLM en entornos de mayor concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 de 24 GB. Para GPUs de 16 GB existe la variante W2.6A16-HGPTQ-RCO (13,01 GiB).
- Opciones de despliegue: warp34 (`warp34 serve`) y vLLM 0.34+ (`vllm serve ... --trust-remote-code`); también transformers con `trust_remote_code`.
- Latencia y throughput: no disponibles en la información proporcionada; el autor destaca velocidades de decodificación MoE rápidas por los 3B parámetros activos y el MTP.
- Optimizaciones incluidas: rankings de expertos calientes pre-perfilados (`static_hot_cache_rankings.json`) y layouts estándar de 4 y 8 bits para warp34.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-W4A16-HGPTQ | 36,47B | 3B | no disponible | W4A16 GPTQ | MIT | Hugging Face (199 descargas) |
| Ornith-1.5-35B-A3B (BF16) | 36,47B | 3B | no disponible | BF16 | MIT | Hugging Face |
| Ornith-1.5-35B-A3B-W2.6A16-HGPTQ-RCO | 36,47B | 3B | no disponible | W2.6A16 GPTQ | MIT | Hugging Face (13,01 GiB) |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las métricas de concordancia frente a BF16. No se han identificado en la información proporcionada otros modelos de la misma categoría (MoE multimodal de ~35B con 3B activos) para comparar.

## Limitaciones y advertencias

- La cuantización introduce degradación: se pierde un 3,6% de concordancia top-1 en visión y un 8,6% en el borrador MTP respecto a BF16, lo que puede afectar a tareas de OCR fino o generación especulativa.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de veracidad del modelo base en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica la ventana de contexto ni los idiomas soportados.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base (enlazada en la model card) por si impone condiciones adicionales.
- Requiere `trust_remote_code` en vLLM y transformers por el código personalizado del modelo (`custom_code`).
- La cobertura de cuantización de la cabeza de salida es de 8 bits, no de 4 bits, lo que debe tenerse en cuenta al estimar el tamaño real en memoria.
- El ecosistema de warp34 es específico del autor de la cuantización; la portabilidad a otros runtimes se limita a vLLM 0.34+ y transformers.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/nchapman/Ornith-1.5-35B-A3B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Repositorio warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantización warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
- Informe técnico de la cuantización: TECHNICAL.md (en el repositorio del modelo)
- Variante para 16 GB: https://huggingface.co/nchapman/Ornith-1.5-35B-A3B-W2.6A16-HGPTQ-RCO
