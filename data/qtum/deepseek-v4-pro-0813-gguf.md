# qtum/DeepSeek-V4-Pro-0813-GGUF

## Resumen

DeepSeek-V4-Pro-0813-GGUF es una colección de cuantizaciones GGUF sub-4-bit del modelo de lenguaje DeepSeek-V4-Pro-0813, desarrollada por el equipo de qtum. El modelo original, creado por DeepSeek-AI, es un MoE (Mixture of Experts) de 1,57 billones de parámetros con 48 mil millones de parámetros activos por token, 61 capas, 384 expertos enrutados (top-6) y un experto compartido. Esta versión cuantizada busca permitir la ejecución local de un modelo de este tamaño en hardware con memoria limitada, sacrificando calidad de salida a cambio de un tamaño de archivo mucho menor.

La particularidad de esta release es que los pesos originales del modelo base se distribuyen en FP4 (`expert_dtype: fp4`), de modo que los tensores de los expertos enrutados ya vienen pre-cuantizados. Por ello, qtum solo publica dos niveles por debajo de 4 bits (IQ1_M e IQ1_S), argumentando que cuantizar hacia arriba no recupera la información que el paso FP4 de fábrica ya descartó. El repositorio incluye también un archivo imatrix de calibración y documentación detallada sobre el proceso de cuantización. La licencia es MIT, lo que permite uso comercial sin restricciones, y los idiomas soportados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención sparse y decodificación especulativa DSpark |
| Parametros totales | 1.572.999.528.803 (1,57 billones) |
| Parametros activos | 48.000.000.000 (48 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M (1,89 bpw), IQ1_S (1,72 bpw); construidos pero no publicados: Q3_K_M, IQ3_XXS, Q2_K |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (MXFP4 para tensores de expertos, IQ1_M/IQ1_S para el resto) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Pro-0813 es un transformador MoE con enrutamiento sparse: de los 384 expertos disponibles, solo 6 se activan por token, más un experto compartido. Incorpora un mecanismo de atención sparse (con tensores `indexer*` y `compressor*` dedicados) y un módulo de decodificación especulativa llamado DSpark, que mejora la latencia en entornos de producción. El modelo fue entrenado por DeepSeek-AI, aunque no se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO en la información proporcionada.

La cuantización realizada por qtum parte de los pesos oficiales en FP4. Los tensores de expertos se escriben directamente en el tipo MXFP4 de GGUF sin materializar en BF16, y después se aplica una segunda cuantización a los niveles IQ1_M o IQ1_S. Este doble paso (FP4 → MXFP4 → objetivo) es una pérdida adicional de precisión que qtum documenta explícitamente. Los tensores no expertos están protegidos con tipos de mayor precisión: los tensores de control por capa (`hc_*`) y el router (`ffn_gate_inp`) en F32, las proyecciones de atención, el indexador, el compresor y el experto compartido en Q8_0, y las embeddings de entrada/salida en Q6_K. La calibración imatrix se realizó sobre 220 fragmentos de un corpus multilingüe de 476 KB (EN/ZH).

## Capacidades

Las siguientes capacidades corresponden al modelo base DeepSeek-V4-Pro-0813; la cuantización sub-4-bit degrada la calidad de salida pero no elimina estas funcionalidades:

- Generación de texto y razonamiento complejo en inglés y chino.
- Generación de código: el modelo base obtiene resultados destacados en HumanEval y MBPP según fuentes secundarias.
- Capacidades matemáticas: resultados notables en el benchmark MATH.
- Recuperación de información en contexto largo (long-context retrieval), según la documentación de DeepSeek-AI.
- Capacidades agénticas mejoradas, con soporte para razonamiento multi-paso y uso de herramientas en entornos de producción.
- Decodificación especulativa DSpark integrada, que reduce la latencia de generación.

## Casos de uso

- Inferencia local en estaciones de trabajo con múltiples GPU: con 346,6 GiB para IQ1_M, es posible ejecutar el modelo en un servidor con 5-6 GPU A100 de 80 GB o H100, usando llama.cpp con ajuste automático de VRAM. Adecuado para experimentación sin depender de APIs externas.
- Despliegue en entornos con restricción de memoria: IQ1_S, con 314,1 GiB, es la opción más pequeña publicada, pensada para máquinas que no pueden alojar las versiones de mayor calidad. Útil para pruebas de concepto o demostraciones donde la fidelidad de salida no es crítica.
- Evaluación de calidad de cuantización extrema: investigadores pueden usar estas versiones para medir el impacto de cuantizaciones por debajo de 2 bpw en un MoE de 1,57T parámetros, comparando la perplejidad con las versiones Q3_K_M o Q2_K que qtum construyó pero no publicó.
- Generación de texto multilingüe EN/ZH en local: el modelo mantiene soporte bilingüe incluso en cuantización agresiva, útil para aplicaciones de traducción o generación de contenido en estos idiomas sin conexión.
- Prototipado de agentes conversacionales: aunque la calidad es limitada, el modelo conserva la arquitectura de enrutamiento sparse y puede usarse para validar pipelines de tool calling o razonamiento multi-paso antes de migrar a una cuantización de mayor fidelidad.
- Benchmarking de hardware: al ser uno de los modelos más grandes disponibles en GGUF, sirve para probar la capacidad de sistemas multi-GPU y soluciones de offloading CPU-GPU con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) específicos para esta versión cuantizada en la información disponible. La model card de qtum solo incluye mediciones de perplejidad (PPL) sobre wikitext-2 con `n_ctx=512` y 12 fragmentos:

| Cuantizacion | Tamano | bpw | PPL (12 chunks) |
|---|---|---|---|
| IQ1_M | 346,6 GiB | 1,89 | 3,6966 ± 0,1640 |
| IQ1_S | 314,1 GiB | 1,72 | 4,1095 ± 0,1799 |
| Q3_K_M (no publicado) | 711,3 GiB | ~3,5 | 1,6217 ± 0,0528 |
| IQ3_XXS (no publicado) | 577,0 GiB | ~3,1 | 1,6708 ± 0,0547 |
| Q2_K (no publicado) | 547,0 GiB | ~2,7 | 1,7621 ± 0,0594 |
| Master F16 GGUF (referencia) | 812,7 GiB | 4,33 | 4,0795 ± 0,0458 (medido a 220 chunks, no comparable) |

Fuentes secundarias (repositorio de GitHub no oficial) afirman que el modelo base DeepSeek-V4-Pro-0813 lidera los rankings de peso abierto en HumanEval, MBPP, MATH y recuperación de contexto largo, situándose cerca de GPT-5.6 y Claude Mythos 5. Estos datos no están verificados y corresponden al modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: para IQ1_M (346,6 GiB) se necesitan al menos 350 GB de memoria; para IQ1_S (314,1 GiB), al menos 320 GB. Estas cifras cubren el archivo completo, sin margen para el contexto de generación.
- GPU recomendadas: servidores con 5-6 GPU NVIDIA A100 de 80 GB o H100 de 80 GB. No cabe en ninguna GPU de consumo actual (RTX 4090 tiene 24 GB, RTX 5090 tiene 32 GB).
- Ejecución en CPU: posible con llama.cpp usando RAM del sistema (requiere ~350 GB de RAM para IQ1_M), con latencia muy alta.
- Opciones de despliegue: llama.cpp (commit `4ed2b13` o superior, con soporte para `LLM_ARCH_DEEPSEEK4`), Ollama mediante Modelfile. No usar `-ngl` ni `--n-cpu-moe` manualmente; el ajuste automático de VRAM es obligatorio para evitar desbordamientos.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa DSpark del modelo base podría reducir la latencia, pero su efecto tras la cuantización no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 (base) | 1,57T (48B activos) | no disponible | FP4 (fábrica) | ~812 GiB en GGUF F16 | MIT | Hugging Face |
| qtum/DeepSeek-V4-Pro-0813-GGUF | 1,57T (48B activos) | no disponible | IQ1_M / IQ1_S | 346,6 / 314,1 GiB | MIT | Hugging Face |
| unsloth/DeepSeek-V4-Pro-0813-GGUF | 1,57T (48B activos) | no disponible | UD-Q4_K_XL / UD-Q8_K_XL | 850 / 873 GB | MIT | Hugging Face |

La versión de unsloth cubre el rango de 4 y 8 bits, mientras que qtum se centra en niveles sub-4-bit. La versión de qtum es significativamente más pequeña (346 GiB frente a 850 GB), pero con una calidad de salida muy inferior según las PPL publicadas. No se dispone de datos de otros modelos comparables de 1,57T parámetros en formato GGUF.

## Limitaciones y advertencias

- Calidad de salida muy degradada: las cuantizaciones IQ1_M e IQ1_S operan por debajo de 2 bpw, lo que produce perplejidades altas (3,7-4,1) y errores frecuentes en tareas de razonamiento, código y matemáticas. No son adecuadas para uso en producción donde se requiera fidelidad.
- Doble cuantización: todos los niveles publicados son el resultado de dos pasos de cuantización (FP4 de fábrica → MXFP4 → IQ1_M/IQ1_S), lo que amplifica la pérdida de información.
- Riesgo de alucinación elevado: la degradación de calidad incrementa la probabilidad de respuestas inventadas o incoherentes, especialmente en tareas complejas.
- Idiomas limitados: solo inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Requisitos de hardware extremos: incluso la versión más pequeña (314 GiB) requiere más de 300 GB de memoria, lo que excluye cualquier GPU de consumo y la mayoría de estaciones de trabajo individuales.
- Configuración delicada: el uso incorrecto de `-ngl` o `--n-cpu-moe` en llama.cpp provoca fallos de asignación de memoria; el ajuste automático de VRAM es obligatorio.
- Compatibilidad restringida: se necesita una versión reciente de llama.cpp (commit `4ed2b13` o superior) con soporte para la arquitectura `deepseek4`; versiones antiguas rechazan el archivo.
- Los benchmarks publicados en fuentes secundarias (GitHub) no están verificados y corresponden al modelo base sin cuantizar, no a esta versión GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qtum/DeepSeek-V4-Pro-0813-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Versión de unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Pro-0813-GGUF
- Ficha en Dell Enterprise Hub: https://dell.huggingface.co/models/deepseek-ai/DeepSeek-V4-Pro-0813
- Repositorio de benchmarks (fuente no oficial): https://github.com/deepseek-v4-pro-0813/deepseek-v4-pro-0813/tree/main
- Herramienta de cuantización: https://github.com/ggerganov/llama.cpp
