# rdtand/DeepSeek-V4-Flash-Base-PrismaAQUA-gridbook-87GB-spark-vllm

## Resumen

DeepSeek-V4-Flash-Base-PrismaAQUA-gridbook-87GB-spark-vllm es una cuantización mixta de precisión del modelo base DeepSeek-V4-Flash-Base (284B-A38B, 43 capas, 256 expertos enrutados más 1 experto compartido, fuente nativa FP8), desarrollada por Robert Tand mediante la herramienta PrismaQuant. El artefacto reduce el cuerpo completo del modelo a 87,08 GB, un tamaño pensado para caber en una máquina con 128 GB de memoria unificada, como NVIDIA GB10 o DGX Spark, dejando margen para servir el modelo sin necesidad de un clúster multi-GPU.

La relevancia de esta cuantización reside en que permite ejecutar un modelo MoE de 284B de parámetros en un único nodo con memoria unificada, algo que normalmente requeriría varias GPUs de gran capacidad. Para lograrlo, el asignador PrismaQuant AURA selecciona el formato de cuantización por cada capa Linear, combinando passthrough FP8 sin pérdida, codebooks FP8 y codebooks NVFP4, con un coste basado en la divergencia KL frente al teacher BF16. El resultado se sirve con vLLM estándar más el plugin GridBook, sin runtime bifurcado.

La calidad se mide de forma explícita sobre el artefacto servido: una KL media de 1,2221 frente al teacher BF16 y una perplejidad WikiText de 20,95. No se publican benchmarks estándar como MMLU o HumanEval, pero sí un protocolo de evaluación reproducible con teacher truncado a top-8192 logits por posición.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida CSA+HCA, hyper-connections con restricción de manifold, 43 capas, 256 expertos enrutados + 1 experto compartido (modelo base) |
| Parametros totales | 284B (modelo base; el artefacto cuantizado cubre el cuerpo sin el sidecar MTP) |
| Parametros activos | 38B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_BLOCK_UE8M0_SOURCE (passthrough sin pérdida), FP8_CB K48/K44/K36/K28, NVFP4_CB K12/K14/K16/K18; ejecución W4A4 en etapas MoE enrutadas |
| Idiomas soportados | no disponibles (el modelo base no especifica idiomas en la información proporcionada) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) + sidecar de codebooks (cb_codebooks.pqcb) + quant_config.json |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Base es un MoE con 284B parámetros totales y 38B activos, que combina atención híbrida CSA+HCA (presumiblemente con atención lineal o de bajo rango, aunque no se detalla en la información) y hyper-connections con restricción de manifold. Soporta razonamiento en tres niveles: Non-think, Think High y Think Max. La fuente original es FP8 nativa.

La cuantización no modifica la arquitectura, sino que asigna formatos por capa Linear mediante el asignador PrismaQuant AURA, que combina un coste KL-adjoint Fisher con pricing activación-aware AQUA en ambos lados (pesos y activaciones). El reparto se resuelve con un algoritmo de mochila y se exporta con codebooks. El punto de operación se selecciona midiendo la KL end-to-end contra el teacher BF16, no con proxies locales. El artefacto excluye el sidecar MTP (speculative decoding) del modelo base.

## Capacidades

- Generación de texto con razonamiento en tres niveles (Non-think, Think High, Think Max) heredado del modelo base.
- Inferencia de un MoE de 284B en un solo nodo con 128 GB de memoria unificada, gracias a la cuantización mixta a 2,346 bits por parámetro de media en el cuerpo.
- Ejecución W4A4 en las 32 etapas MoE enrutadas (activaciones E2M1 group-16 con escala global estática), mientras que las unidades FP8 decodifican a BF16 para GEMM.
- Servido con vLLM estándar (sin fork) mediante el plugin GridBook, en modo eager y con CUDA graphs sobre Blackwell.
- Evaluación de calidad reproducible con métricas KL y perplejidad sobre WikiText, con teacher truncado a top-8192 logits.
- Soporte de tokenizer DeepSeek V4 (`--tokenizer-mode deepseek_v4`) y caché KV en FP8.
- No se documentan capacidades de tool calling, agentes o multimodalidad en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo MoE de 284B en un único servidor con memoria unificada (DGX Spark, GB10): el artefacto cabe en 87,08 GB, dejando margen para el runtime y la caché KV en un sistema de 128 GB.
- Servicio de generación de texto con vLLM en producción para aplicaciones que requieran razonamiento profundo sin depender de APIs externas: se despliega con `vllm serve` más el plugin GridBook, sin necesidad de compilar un runtime propio.
- Investigación en cuantización de modelos grandes: el artefacto incluye un `shipcard.json` con el registro completo de puertas de calidad y procedencia, útil para reproducir experimentos de asignación de precisión.
- Evaluación de calidad de cuantización frente a un teacher BF16: el protocolo KL con top-8192 permite comparar artefactos de distintos asignadores con una métrica objetiva.
- Desarrollo de aplicaciones de texto con requisitos de privacidad o soberanía de datos, donde el modelo se ejecuta en infraestructura propia sin enviar datos a terceros.
- Prototipado de sistemas de razonamiento multi-nivel (Think High / Think Max) en entornos con restricciones de hardware, aprovechando la reducción de 170 GB (modelo completo) a 87 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de calidad de cuantización medidas sobre el artefacto servido con vLLM y el plugin GridBook:

| Metrica | Valor |
|---|---|
| KL(teacher‖student), media | 1,2221 |
| KL, posiciones confiadas (n=2.935) | 1,0293 |
| KL, p99 | 8,805 |
| KL, max | 18,078 |
| WikiText PPL (directo, mismo servido) | 20,95 |

Además, una ablación interna con el mismo presupuesto de 87,4 GB muestra una mejora de −3,4% en KL media, −7,2% en KL confiada y −11,0% en KL p99 frente al asignador que solo optimiza el coste de pesos, con la PPL directa estadísticamente sin cambios.

## Requisitos de hardware

- VRAM estimada: 87,08 GB para el cuerpo del modelo (sin sidecar MTP), más el overhead del runtime y la caché KV.
- GPU recomendada: NVIDIA GB10 o DGX Spark con 128 GB de memoria unificada; también puede servir en GPUs Blackwell con VRAM suficiente (no se especifican configuraciones multi-GPU).
- No cabe en GPUs de consumo típicas (RTX 4090 con 24 GB, etc.) sin cuantizaciones adicionales no documentadas.
- Despliegue: vLLM estándar (Blackwell/SM121, CUDA 13) con el plugin GridBook `gridbook==0.8.8`, usando `--quantization gridbook --trust-remote-code`.
- Modos de ejecución: eager y CUDA-graph; decode en unidades NVFP4_CB usa la ruta nativa de codebook LUT, mientras que el prefill con lotes grandes en unidades codebook usa un puente de dequant a BF16 (los kernels fusionados persistentes llegarán en una versión posterior de GridBook).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Flash-Base (original) | 284B-A38B | FP8 nativo | ~170 GB (según guías de despliegue) | MIT | Modelo base sin cuantizar; requiere más memoria |
| rdtand/DeepSeek-V4-Flash-Base-PrismaAQUA-gridbook-87GB-spark-vllm | 284B-A38B | Mixto FP8/NVFP4 con codebooks | 87,08 GB | MIT | Cuantización con plugin GridBook para vLLM |

No se dispone de datos de rendimiento comparativos con otras cuantizaciones del mismo modelo (p. ej., GGUF o AWQ) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto solo de cuerpo: excluye el sidecar MTP (speculative decoding) del modelo base, por lo que la decodificación especulativa no está disponible.
- No se reclama paridad de rendimiento en servido con el mismo presupuesto de memoria; la puerta de paridad está registrada como fuera de alcance en el shipcard.
- El prefill con lotes grandes en unidades codebook usa un puente de dequant a BF16, no kernels fusionados; el rendimiento puede verse penalizado en ese modo hasta que GridBook publique kernels persistentes.
- La métrica KL se calcula con un teacher truncado a top-8192 logits por posición; la masa de cola más allá del rango 8192 no se evalúa.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Idiomas soportados no especificados; el modelo base no documenta cobertura multilingüe en la información proporcionada.
- Requiere hardware específico (Blackwell, CUDA 13, plugin GridBook 0.8.8); no se garantiza funcionamiento en otras arquitecturas o versiones de runtime.
- El repositorio no muestra descargas ni valoraciones (0 descargas, 0 likes), lo que indica una adopción aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rdtand/DeepSeek-V4-Flash-Base-PrismaAQUA-gridbook-87GB-spark-vllm
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- Colección oficial DeepSeek-V4: https://huggingface.co/collections/deepseek-ai/deepseek-v4
- Repositorio PrismaQuant: https://github.com/RobTand/prismaquant
- Receta de vLLM para DeepSeek-V4-Flash: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- Guía de despliegue local de DeepSeek V4 Flash: https://codersera.com/blog/run-deepseek-v4-flash-locally-full-2026-setup-guide/
- Guía de despliegue local (GGUF, Ollama, hardware): https://deepseek-v4.io/local-deployment
- Guía de ejecución local con Ollama, vLLM y SGLang: https://deepseek.day/en/local/
