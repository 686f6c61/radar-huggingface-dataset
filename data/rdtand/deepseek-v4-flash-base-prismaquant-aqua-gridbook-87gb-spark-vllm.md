# rdtand/DeepSeek-V4-Flash-Base-PrismaQuant-AQUA-gridbook-87GB-spark-vllm

## Resumen

DeepSeek-V4-Flash-Base PrismaQuant AQUA (GridBook CB) es una cuantización de precisión mixta del modelo base DeepSeek-V4-Flash-Base, desarrollada por el usuario independiente rdtand. El artefacto reduce el cuerpo completo del modelo —un MoE de 284.000 millones de parámetros con 38.000 millones activos, 43 capas y 256 expertos enrutados más un experto compartido— a 87,08 GB, un tamaño diseñado para caber en una máquina con 128 GB de memoria unificada, como la NVIDIA GB10 o la DGX Spark, dejando margen para servir el modelo.

La cuantización utiliza el asignador PrismaQuant AURA, que elige el formato por cada capa lineal según un coste de Fisher adjunto a la divergencia KL y un precio sensible a la activación (AQUA). El resultado combina formatos FP8 y NVFP4 con codebooks, alcanzando una media de 2,346 bits por parámetro en el cuerpo del modelo. La calidad se valida midiendo la divergencia KL real frente al profesor BF16 servido en vLLM, no mediante proxies locales.

La relevancia de este artefacto reside en que permite ejecutar un modelo de razonamiento de última generación en hardware de consumo con memoria unificada, sin necesidad de nodos multi-GPU. Se sirve con vLLM estándar más el plugin de cuantización GridBook, sin bifurcar el runtime. La licencia MIT facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida CSA+HCA, hyper-conexiones con restricción de manifold y razonamiento en tres niveles (Non-think / Think High / Think Max) |
| Parametros totales | 284B (modelo base); 85.446.438.999 en el safetensors cuantizado |
| Parametros activos | 38B (según model card del autor); Microsoft reporta 13B para DeepSeek-V4-Flash |
| Longitud de contexto | 1.000.000 tokens (según Microsoft Foundry para DeepSeek-V4-Flash) |
| Tipos de cuantizacion | FP8_BLOCK_UE8M0_SOURCE (passthrough sin pérdida), FP8_CB con codebooks K48/K44/K36/K28, NVFP4_CB con codebooks K12/K14/K16/K18; media de 2,346 bits por parámetro |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + sidecar de codebooks (`cb_codebooks.pqcb`) + `quant_config.json`; librería vLLM con plugin GridBook |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado desde cero, sino una cuantización post-entrenamiento del modelo base DeepSeek-V4-Flash-Base. El modelo base es un MoE con 284B parámetros totales y 38B activos (según el autor; Microsoft indica 13B activos), 43 capas, 256 expertos enrutados y un experto compartido, con atención híbrida CSA+HCA y hyper-conexiones con restricción de manifold. Soporta tres niveles de razonamiento: Non-think, Think High y Think Max.

La cuantización se realiza con el asignador PrismaQuant AURA, que selecciona el formato de cada capa lineal mediante un coste de Fisher adjunto a la divergencia KL y un precio sensible a la activación (AQUA) tanto en el lado del peso como en el de la activación. El punto de operación final se mide con divergencia KL real de extremo a extremo contra el profesor BF16, no con una proxy local. La distribución de formatos resultante asigna FP8 sin pérdida a las proyecciones de atención (`wq_a`, `wkv`, `wo_a`), mantiene los expertos compartidos en FP8 con codebook grande (K48 o fuente), y concentra la mayor parte de los bytes —los expertos enrutados— en NVFP4-CB K12 en las primeras 21 capas, mientras que las capas tardías (22–38) reciben FP8-CB K28, donde el coste de sensibilidad es mayor.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 1 millón de tokens.
- Razonamiento en tres niveles: Non-think (respuesta directa), Think High (razonamiento profundo) y Think Max (razonamiento máximo), controlable según la tarea.
- Capacidades de código y matemáticas destacadas, según el perfil del modelo base DeepSeek-V4-Flash (fortalezas en coding y matemáticas, con limitaciones en retención de conocimiento factual).
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación del artefacto, pero el modelo base DeepSeek-V4-Flash lo incorpora en su familia.
- Capacidades multilingües: no documentadas para este artefacto; el modelo base soporta múltiples idiomas, pero no se especifica cuáles.
- La cuantización no altera las capacidades funcionales del modelo base, aunque puede degradar ligeramente la calidad en tareas sensibles a la precisión numérica.

## Casos de uso

- Inferencia local en hardware de memoria unificada: el artefacto cabe en 87 GB, por lo que puede servirse en una NVIDIA DGX Spark o GB10 con 128 GB de memoria unificada, dejando margen para el caché KV y la sobrecarga del runtime. Es adecuado para prototipado y despliegue en entornos sin clústeres multi-GPU.
- Servicio de modelos de razonamiento en producción con vLLM: se integra con vLLM estándar mediante el plugin GridBook, permitiendo servir el modelo con el mismo stack que otros modelos vLLM, incluido el modo eager y CUDA-graph en Blackwell.
- Evaluación de calidad de cuantización: las métricas KL y PPL publicadas permiten a investigadores comparar el coste de precisión de esta cuantización frente a otras alternativas en el mismo presupuesto de bytes.
- Desarrollo de aplicaciones con razonamiento profundo: el modo Think High y Think Max del modelo base permite abordar problemas complejos de matemáticas, lógica y planificación, útil en asistentes de investigación o sistemas de apoyo a la decisión.
- Generación de código asistida en entornos con recursos limitados: dado el perfil del modelo base en coding, puede emplearse para autocompletado y revisión de código en máquinas de escritorio con GPU Blackwell.
- Investigación en cuantización de MoE: el artefacto sirve como caso de estudio de asignación de precisión por capa con codebooks, con un mapa de asignación navegable en el explorador de PrismaQuant.

## Benchmarks y rendimiento

La model card del autor proporciona métricas de calidad medidas sobre el artefacto exacto, servido con vLLM y el plugin GridBook. El profesor es el modelo BF16 original, con la distribución truncada a los 8192 logits superiores por posición, y la evaluación se realiza sobre WikiText con 8 × 512 tokens (4.088 posiciones puntuadas).

| Metrica | Valor |
|---|---|
| KL(teacher‖student), media | 1,2221 |
| KL, posiciones confiadas (n=2.935) | 1,0293 |
| KL, p99 | 8,805 |
| KL, max | 18,078 |
| WikiText PPL (directo, mismo servicio) | 20,95 |

Además, la ablación interna con el mismo presupuesto de 87,4 GB muestra que la asignación sensible a la activación (aqua-both) mejora la media de KL en un 3,4%, la KL de posiciones confiadas en un 7,2% y la p99-KL en un 11,0% frente a la asignación que solo considera el coste del peso, mientras que la PPL directa permanece estadísticamente sin cambios (+1,0%, dentro del margen de ~1,5% observado al re-servir bytes idénticos entre sesiones).

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este artefacto cuantizado.

## Requisitos de hardware

- VRAM estimada: 87,08 GB para el cuerpo del modelo (sin incluir el sidecar MTP ni el caché KV). Diseñado para una máquina con 128 GB de memoria unificada.
- GPU recomendadas: NVIDIA Blackwell (SM121) con CUDA 13. Probado en DGX Spark / GB10. No apto para GPUs de consumo convencionales (RTX 4090, etc.) por requisito de memoria y arquitectura.
- Despliegue: vLLM estándar con el plugin GridBook (`gridbook==0.8.8`), comando `vllm serve` con `--quantization gridbook` y `--kv-cache-dtype fp8`. No requiere fork del runtime.
- Latencia y throughput: no disponibles. La model card indica que el decode en unidades NVFP4_CB usa la ruta nativa de LUT de codebooks, mientras que el prefill de lotes grandes en unidades codebook usa un puente de dequantización a BF16 en la versión actual del runtime; los kernels persistentes fusionados llegarán en una versión posterior de GridBook.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Tamano archivo | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Base (BF16 original) | 284B | 38B (según autor) | 1M tokens | ~568 GB (estimado en BF16) | MIT |
| Este artefacto (PrismaQuant AQUA) | 284B | 38B (según autor) | 1M tokens | 87,08 GB | MIT |
| DeepSeek-V4-Pro | 1,6T | 49B | 1M tokens | no disponible | MIT |

La comparativa principal es contra el modelo base en BF16: el artefacto cuantizado reduce el tamaño en un factor de ~6,5 (de ~568 GB estimados a 87 GB), permitiendo el despliegue en una sola máquina de memoria unificada. La calidad se degrada moderadamente (PPL WikiText de 20,95 frente al profesor BF16, con una KL media de 1,22). No se dispone de datos de otras cuantizaciones del mismo modelo para comparar directamente.

## Limitaciones y advertencias

- El artefacto excluye el sidecar MTP / decodificación especulativa: los 4.705 tensores del espacio `mtp.` del modelo fuente no están incluidos, por lo que no se puede usar decodificación especulativa con este artefacto.
- No se reivindica paridad de rendimiento de servicio con el mismo presupuesto de bytes: la puerta de paridad de rendimiento está registrada como fuera de alcance en la shipcard.
- El prefill de lotes grandes en unidades con codebook (NVFP4_CB y FP8_CB) usa actualmente un puente de dequantización a BF16, lo que puede reducir el throughput en comparación con kernels nativos; los kernels fusionados persistentes llegarán en una versión posterior de GridBook.
- La evaluación de calidad se realiza con el profesor truncado a los 8192 logits superiores por posición; la masa de cola más allá del rango 8192 no se puntúa, por lo que la KL medida puede subestimar la divergencia real en la cola de la distribución.
- No se documentan sesgos conocidos ni riesgo de alucinación específicos de este artefacto; el modelo base muestra limitaciones en retención de conocimiento factual según el perfil de DeepSeek-V4-Flash.
- La licencia MIT permite uso comercial, pero el modelo base DeepSeek-V4-Flash-Base tiene su propia licencia (MIT según la model card del autor, aunque conviene verificar los términos de DeepSeek para el modelo original).
- Requiere hardware Blackwell (SM121) y CUDA 13; no funcionará en GPUs de generaciones anteriores.

## Enlaces

- Artefacto en HuggingFace: https://huggingface.co/rdtand/DeepSeek-V4-Flash-Base-PrismaQuant-AQUA-gridbook-87GB-spark-vllm
- Modelo base DeepSeek-V4-Flash-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- Ficha de DeepSeek-V4-Flash en vLLM Recipes: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- Perfil de DeepSeek-V4-Flash-Base en AI Models Navi: https://aimodelsnavi.com/en/models/deepseek-v4-flash-base
- Catálogo de modelos de Microsoft Foundry (DeepSeek-V4-Flash): https://ai.azure.com/catalog/models/DeepSeek-V4-Flash
- Documentación de DeepSeek-V4-Flash en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4-Flash.html
- Repositorio de recetas para DGX Spark: https://github.com/MiaAI-Lab/DeepSeek-v4-Flash-DSpark-2x-DGX-Spark
- Explorador de asignación PrismaQuant: https://prismaquant.org/explorer.html
- Repositorio PrismaQuant: https://github.com (enlace parcial en la model card)
