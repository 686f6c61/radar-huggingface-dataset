# AnKhanh/Deepseek-Distill-Qwen-prune

## Resumen

El modelo `AnKhanh/Deepseek-Distill-Qwen-prune` es un conjunto de checkpoints experimentales que aplican poda no estructurada (unstructured pruning) sobre los modelos `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` y `7B`. El autor, AnKhanh, utiliza el algoritmo **SparseGPT** para generar un barrido de niveles de sparsity (del 10% al 90%) con el objetivo de estudiar el impacto de la poda en modelos de razonamiento matemático. La calibración se realiza con pares de rollout de tipo DAOC (near-miss) sobre el dataset `open-r1/OpenR1-Math-220k`.

Este repositorio no es un modelo entrenado desde cero, sino un estudio de investigación que permite evaluar el equilibrio entre la reducción de parámetros y la degradación del rendimiento en tareas de razonamiento. Es relevante para quienes investigan técnicas de compresión de modelos, especialmente en el contexto de modelos de razonamiento destilados como DeepSeek-R1-Distill-Qwen. El modelo base tiene una arquitectura transformer densa, y aunque el contexto original de DeepSeek-R1-Distill-Qwen soporta hasta 128k tokens, en esta variante podada no se especifica explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 1.5B y 7B (variantes) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (solo pruning, no cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de poda no estructurada sobre los modelos base DeepSeek-R1-Distill-Qwen-1.5B y 7B. El método de poda es **SparseGPT**, que elimina pesos individuales en cada capa de forma iterativa, minimizando la pérdida de error cuadrático en la salida. La calibración se realiza con pares de rollout de tipo DAOC (near-missuer) extraídos de `open-r1/OpenR1-Math-220k`, lo que permite ajustar la poda a ejemplos de razonamiento matemático.

Cada subcarpeta del repositorio contiene un checkpoint independiente con un nivel de sparsity concreto (10%, 20%, 30%, 60%, 70%, 80%, 90%). No se ha realizado un entrenamiento adicional tras la poda; es un estudio de pruning post-entrenamiento sin ajuste fino posterior.

## Capacidades

- Generación de texto y razonamiento matemático (heredado del modelo base, aunque degradado según el nivel de sparsity).
- Soporte de tool calling y function calling: no disponible (no se especifica en el modelo base).
- Capacidades de agente y multi-step reasoning: no especificado, aunque el modelo base DeepSeek-R1-Distill-Qwen está optimizado para razonamiento.
- Multilingüismo: no disponible.
- Capacidades especiales: no se documentan modos de thinking o visión.

## Casos de uso

- Investigación en compresión de modelos: permite estudiar el trade-off entre sparsity y rendimiento en tareas de razonamiento matemático, ideal para artículos académicos o pruebas de concepto.
- Evaluación de robustez en pruning: se puede usar para comparar cómo distintos niveles de sparsity afectan a la precisión en datasets como OpenR1-Math.
- Despliegue en entornos con memoria limitada: aunque la sparsity no estructurada no reduce la memoria de forma directa sin kernels especializados, si se combina con kernels de poda esparcida, podría reducir el almacenamiento.
- Benchmark de técnicas de pruning: sirve como referencia para validar nuevos algoritmos de poda frente a SparseGPT.
- Educación en optimización de modelos: útil para ejemplos prácticos de cómo se aplica la poda y cómo se cargan checkpoints con `subfolder` en HuggingFace.
- Integración en pipelines de investigación: se puede usar como baseline en experimentos de destilación o compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- Para las variantes de 1.5B en FP16: se estima un uso de VRAM de unos 3-4 GB, por lo que puede ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o incluso en CPU con cuantización, aunque no se proporcionan cuantizaciones.
- Para las variantes de 7B en FP16: se estima un uso de VRAM de unos 14-16 GB, requiriendo GPUs de gama alta como RTX 4090 (24 GB) o A100 (40/80 GB).
- No se ofrecen archivos GGUF o cuantizaciones de 4/8 bits; el formato es safetensors estándar.
- Opciones de despliegue: se puede cargar con `transformers` directamente, pero no se documenta compatibilidad con vLLM, llama.cpp u Ollama. La sparsity no estructurada no acelera la inferencia sin kernels específicos de sparse.
- La latencia y el throughput no se han medido ni documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (original) | 1.5B | 128k | No disponible | MIT | safetensors |
| DeepSeek-R1-Distill-Qwen-7B (original) | 7B | 128k | No disponible | MIT | safetensors |
| AnKhanh/Deepseek-Distill-Qwen-prune (1.5B, sparsity 10%) | 1.5B | No disponible | No disponible | MIT | safetensors |
| AnKhanh/Deepseek-Distill-Qwen-prune (7B, sparsity 30%) | 7B | No disponible | No disponible | MIT | safetensors |

La comparativa se limita a los modelos base y las variantes podadas. No hay datos de rendimiento para establecer una comparación cuantitativa. El interés principal es estudiar el impacto de la sparsity sobre los modelos originales.

## Limitaciones y advertencias

- La poda no estructurada puede degradar significativamente el rendimiento en niveles de sparsity altos (70% o más). No se han publicado métricas que cuantifiquen esta degradación.
- La sparsity no estructurada no ofrece aceleración de inferencia en hardware convencional sin kernels específicos (por ejemplo, NVIDIA Sparse Tensor Cores). El tamaño del checkpoint sigue siendo el mismo en disco (546.3 GB para todo el repositorio).
- El modelo base DeepSeek-R1-Distill-Qwen está optimizado para razonamiento matemático, pero las variantes podadas pueden presentar alucinaciones o razonamientos inconsistentes, especialmente en niveles de sparsity altos.
- No se especifican los idiomas soportados; se asume que hereda las capacidades del modelo base, pero no hay garantía.
- La licencia MIT permite uso comercial, pero no se proporciona documentación sobre sesgos o riesgos específicos.
- No se han publicado evaluaciones de seguridad (sesgos, toxicidad) para este modelo podado.
- El repositorio no incluye un pipeline de inferencia optimizado; es un conjunto de checkpoints de investigación.

## Enlaces

- HuggingFace: [AnKhanh/Deepseek-Distill-Qwen-prune](https://huggingface.co/AnKhanh/Deepseek-Distill-Qwen-prune)
- GitHub relacionado: [coding-alt/deepseek-distill-qwen](https://github.com/coding-alt/deepseek-distill-qwen)
- GitHub relacionado: [madaibaba/deepseek-distill-qwen](https://github.com/madaibaba/deepseek-distill-qwen)
- Documentación de DeepSeek-R1-Distill-Qwen-7B: [deepseek-ai/DeepSeek-R1-Distill-Qwen-7B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B)
- DeepWiki del proyecto: [madaibaba/deepseek-distill-qwen | DeepWiki](https://deepwiki.com/madaibaba/deepseek-distill-qwen)
