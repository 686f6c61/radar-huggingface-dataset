# elisepaul/Qwen3.8-Flash-Reasoning-NVFP4-One-Spark

## Resumen

`Qwen3.8-Flash-Reasoning-NVFP4-One-Spark` es un modelo fundacional de tipo Mixture-of-Experts (MoE) heterogéneo publicado por el usuario elisepaul en Hugging Face. Se construye mediante fusión de modelos (*model merging*) a partir de dos linajes distintos: la topología base `elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean` (448 expertos enrutados orientados a código) y un subconjunto de 64 expertos de razonamiento algorítmico extraídos de `nvidia/DeepSeek-V4.1-Flash-1017-NVFP4`. El resultado es un modelo de 131.711.817.584 parámetros totales distribuidos en 40 capas MoE y 8 capas densas.

El objetivo declarado es combinar la precisión en generación de código, comprensión de APIs y ejecución en terminal del linaje Qwen con el razonamiento en cadena de pensamiento (chain-of-thought) del linaje DeepSeek, todo ello empaquetado en cuantización NVFP4 (FP4 E2M1 con escalas de bloque FP8 de 16 elementos) para caber en una única unidad NVIDIA DGX Spark (GB10 Blackwell, 128 GiB de memoria unificada LPDDR5x). El repositorio ocupa 83,4 GB y el autor reporta un *footprint* en disco de 77,65 GiB repartido en 11 shards de safetensors.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de trasplante de expertos entre arquitecturas con espacios latentes distintos (resuelto mediante alineamiento de representación con Procrustes ortogonal y escalado de atenuación geométrica); por otro, ejemplifica el despliegue de un MoE de gran tamaño en hardware de memoria unificada de un solo nodo, un patrón que gana interés para inferencia local de modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE heterogéneo (40 capas MoE + 8 capas densas), con HyperConnections de residuo con compuerta de 4 flujos y cabeza MTP de predicción multi-token |
| Parametros totales | 131.711.817.584 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 FP4 con escalas de bloque FP8 de 16 elementos), MXFP8, FP8, 8-bit |
| Idiomas soportados | en, zh, code |
| Licencia | nvidia-open-model-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (11 shards activos, 300.982 tensores indexados) |

## Arquitectura y entrenamiento

El modelo es un MoE disperso con 512 slots de expertos enrutados por capa (448 retenidos del linaje Qwen con `d_model = 2560`, `d_int = 640`, más 64 expertos donantes de DeepSeek con `d_model = 5120`, `d_int = 2304`), distribuidos en 40 capas MoE, seguidas de 8 capas densas. Incluye un experto compartido de *backbone* y 4 flujos de residuo con compuerta (HyperConnections). La dimensión del modelo base es 2560.

La innovación técnica central es el trasplante cero-shot de expertos entre linajes con bases de coordenadas divergentes. El autor documenta que el trasplante directo falla y que la integración requiere dos pasos: (1) alineamiento de representación mediante Procrustes ortogonal para resolver la divergencia de base, y (2) escalado de atenuación geométrica para mitigar el *blowout* de ganancia residual. La selección de los 64 expertos donantes se realizó mediante *Router-weighted Expert Activation Pruning* (REAP) sobre 403 tareas de verificación de código, terminal y algoritmia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo parece ser resultado de fusión y cuantización, no de un entrenamiento desde cero.

Como aceleración de inferencia incorpora una cabeza de predicción multi-token (MTP) configurada como *drafter* especulativo de 4 tokens, integrada con vLLM y FlashInfer.

## Capacidades

- Generación de texto conversacional y de razonamiento en cadena de pensamiento (*deep thinking*, CoT).
- Generación de código y comprensión de APIs, heredada de los 448 expertos de codificación del linaje Qwen.
- Ejecución y verificación en terminal, con datos de evaluación asociados a SWE-bench Lite.
- Razonamiento algorítmico y verificación paso a paso, heredado de los expertos donantes de DeepSeek V4.1.
- Decodificación especulativa mediante cabeza MTP de 4 tokens para reducir latencia autoregresiva.
- Capacidades multilingües limitadas a inglés, chino y código.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte explícito de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- **Asistencia a desarrollo en terminal**: el modelo puede interpretar comandos, diagnosticar errores de ejecución y proponer correcciones, apoyándose en los expertos de código y en la evaluación sobre SWE-bench Lite reportada por el autor.
- **Resolución de issues en repositorios**: dado su entrenamiento orientado a tareas de verificación de código, encaja en flujos de resolución automática de *issues* y generación de parches, con validación posterior en CI.
- **Razonamiento algorítmico con verificación**: los expertos donantes de DeepSeek aportan cadenas de pensamiento para problemas de algoritmia y matemáticas discretas, útiles en entornos de evaluación automática.
- **Despliegue local en un solo nodo**: al caber en una DGX Spark con 128 GiB de memoria unificada y 22,64 GiB reservados para caché KV, es viable como asistente de código privado sin salida a la nube.
- **Generación de documentación técnica y de APIs**: la comprensión de APIs del linaje Qwen permite resumir y documentar interfaces a partir de código fuente.
- **Prototipado de agentes de código**: la cabeza MTP de 4 tokens reduce la latencia en bucles de agente donde se encadenan muchas llamadas cortas de generación.
- **Investigación en fusión de modelos**: sirve como caso de estudio reproducible de trasplante de expertos entre arquitecturas con Procrustes ortogonal y REAP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona evaluación sobre `princeton-nlp/SWE-bench_Lite` y 403 tareas de verificación, pero no incluye puntuaciones. El autor reporta únicamente métricas de despliegue: 76,12 GiB residentes en memoria del motor, 22,64 GiB de caché KV, 22,64 GiB de margen y 121,63 GiB direccionables en total.

## Requisitos de hardware

- **VRAM/memoria unificada**: el modelo requiere aproximadamente 76-78 GiB residentes en cuantización NVFP4, más 22,64 GiB de caché KV en la configuración reportada.
- **GPU objetivo**: NVIDIA DGX Spark (GB10 Blackwell, 128 GiB de memoria unificada LPDDR5x, sin swap). El autor valida esta única configuración.
- **GPU consumer**: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GiB, RTX 5090 con 32 GiB) en esta cuantización; requeriría múltiples GPUs o cuantizaciones más agresivas no documentadas.
- **Despliegue**: vLLM con FlashInfer, según la librería declarada y los tags del repositorio. No se documentan opciones para llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. La cabeza MTP de 4 tokens está pensada para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Reasoning-NVFP4-One-Spark | 131,7 B | no disponible | NVFP4 | nvidia-open-model-license | DGX Spark (GB10) |
| Qwen3.8-Flash-Next-NVFP4-Coder-Lean (base) | no disponible | no disponible | NVFP4 | no disponible | no disponible |
| DeepSeek-V4.1-Flash-1017-NVFP4 (donante) | no disponible | no disponible | NVFP4 | no disponible | no disponible |
| DeepSeek-V4.1-Flash (original) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite comparar rendimiento, contexto ni parámetros activos con alternativas de la misma categoría; los datos de los modelos de referencia no están publicados en la documentación consultada.

## Limitaciones y advertencias

- **Modelo derivado y no oficial**: se trata de una fusión de terceros (usuario elisepaul) sobre linajes Qwen y DeepSeek, sin validación independiente más allá de la del propio autor.
- **Riesgo de alucinación**: no se documentan evaluaciones de fidelidad factual; el énfasis en razonamiento CoT no garantiza corrección.
- **Idiomas**: soporte declarado limitado a inglés, chino y código; el rendimiento en castellano no está evaluado.
- **Contexto**: la longitud de contexto no se especifica, lo que impide planificar despliegues con ventanas largas.
- **Licencia**: `nvidia-open-model-license` con etiqueta `other`; es necesario revisar los términos para uso comercial, especialmente por la combinación de linajes con posibles restricciones heredadas.
- **Hardware**: validado únicamente en DGX Spark; no hay garantías de funcionamiento en otras configuraciones ni de soporte en versiones futuras de vLLM.
- **Reproducibilidad**: el proceso de fusión (Procrustes ortogonal, escalado de atenuación, REAP) se describe en la model card, pero no se aportan scripts ni pesos intermedios verificables.
- **Madurez**: 52 descargas y 1 like en el momento de la consulta; ecosistema y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/elisepaul/Qwen3.8-Flash-Reasoning-NVFP4-One-Spark
- Modelo base Qwen: https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Modelo donante DeepSeek: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo original DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Dataset de evaluación: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite
- Paper DeepSeek-V3 (referencia citada, arXiv:2412.19437): https://arxiv.org/abs/2412.19437
- Paper DeepSeek-V2 (arXiv:2409.19606): https://arxiv.org/abs/2409.19606
- Paper DeepSeek-V3 técnico (arXiv:2404.19737): https://arxiv.org/abs/2404.19737
- Paper Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Paper FlashAttention (arXiv:2307.08691): https://arxiv.org/abs/2307.08691
- Paper (arXiv:2312.06635): https://arxiv.org/abs/2312.06635
- Paper (arXiv:2403.13257): https://arxiv.org/abs/2403.13257
