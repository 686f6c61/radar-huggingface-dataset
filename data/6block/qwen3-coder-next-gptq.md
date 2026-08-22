# 6block/Qwen3-Coder-Next-GPTQ

## Resumen

El modelo 6block/Qwen3-Coder-Next-GPTQ es una cuantización GPTQ en formato W4A16 (pesos de 4 bits, activaciones de 16 bits) del modelo Qwen/Qwen3-Coder-Next, desarrollado por el usuario 6block mediante la herramienta llm-compressor. El modelo base, creado por Alibaba Qwen, es un MoE (mixture of experts) de 80 mil millones de parámetros totales que activa solo 3 mil millones por token, con 48 capas, 512 expertos y routing top-10, diseñado específicamente para agentes de código. Esta versión cuantizada ocupa aproximadamente 40 GiB en disco, frente a los ~159 GiB del modelo original en bf16, lo que permite ejecutarlo en una única GPU de 24-48 GB manteniendo una calidad cercana al original.

La relevancia de este checkpoint radica en que Qwen publica únicamente una versión FP8 oficial (de aproximadamente 80 GiB), mientras que esta build W4A16 reduce el tamaño a la mitad de esa versión y a una cuarta parte del bf16, habilitando el despliegue en hardware más modesto. El autor protege los tensores de routing y la proyección de salida en bf16 para evitar que la cuantización degrade el comportamiento del MoE, y la calidad se mide con una pérdida de perplejidad de +20.5% sobre el modelo original en wikitext-2. La licencia Apache-2.0 heredada del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_next MoE (transformer con mezcla de expertos) |
| Parametros totales | 80B |
| Parametros activos | ~3B |
| Longitud de contexto | 256K |
| Tipos de cuantizacion | GPTQ W4A16, grupo de tamaño 128 |
| Idiomas soportados | en, zh (ingles y chino) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next emplea una arquitectura MoE (mixture of experts) con 48 capas, 512 expertos y routing top-10, donde cada token activa solo 3 mil millones de parámetros de los 80 mil millones totales. Esta estructura permite un rendimiento comparable a modelos con 10-20 veces más parámetros activos, según el informe técnico disponible en arXiv. La cuantización GPTQ aplicada por 6block usa el algoritmo de compensación de error de segundo orden (Hessian) que cuantiza columna por columna y compensa el error residual en las columnas no cuantizadas. Se calibró con un corpus mixto de 256 muestras de código, inglés y chino, con 2048 tokens por muestra. El modelo protege los tensores de routing (`*.mlp.gate`) y la proyección de salida (`lm_head`) en bf16, porque una cuantización de 4 bits en estos tensores podría enviar tokens a los expertos incorrectos y degradar significativamente la calidad en un MoE con 512 expertos. Las activaciones se mantienen en 16 bits (W4A16), lo que contribuye a preservar la calidad en un modelo donde el redondeo incorrecto en la routing podría tener efectos en cascada.

## Capacidades

- Generación de texto y conversación en inglés y chino, con formato de prompt ChatML (`<|im_start|>`).
- Razonamiento avanzado y generación de código, incluyendo soporte para agentes de código multi-paso.
- Capacidad de tool calling / function calling, inherente al modelo base Qwen3-Coder-Next, diseñado para agentes que interactúan con herramientas.
- Ventana de contexto de 256K tokens, que permite procesar repositorios completos y documentación extensa.
- Soporte de agentes y razonamiento multi-paso, como se documenta en el technical report de Qwen3-Coder-Next.
- Capacidades multilingües limitadas a inglés y chino; no hay soporte declarado para otros idiomas.
- No incluye capacidades de visión ni audio; es un modelo puramente de texto.

## Casos de uso

- **Asistente de programación en producción**: el modelo puede integrarse en IDEs y herramientas de autocompletado para generar código, explicar fragmentos y sugerir refactorizaciones. Su ventana de 256K permite pasar el contenido completo de un repositorio o archivos grandes, y su bajo número de parámetros activos (~3B) lo hace viable en GPU de 24 GB con la cuantización W4A16.
- **Agente de desarrollo autónomo**: soporta tool calling y razonamiento multi-paso, por lo que puede usarse en pipelines de CI/CD para revisar pull requests, generar tests unitarios, o automatizar tareas de mantenimiento de código, ejecutándose con vLLM o SGLang en un servidor de inferencia.
- **Análisis de repositorios grandes**: con 256K tokens de contexto, puede procesar repositorios completos de tamaño medio para resumir la estructura, detectar dependencias o documentar el código, sin necesidad de fragmentar el prompt.
- **Soporte técnico en inglés y chino**: la capacidad multilingüe y la ventana de contexto larga permiten gestionar conversaciones multi-turno en atención al cliente, manteniendo el historial completo y el contexto de la documentación técnica en una sola sesión.
- **Generación de código en producción**: el modelo base está optimizado para agentes de código, y esta cuantización permite desplegarlo en una sola GPU de 48GB (o en 24GB con tensor parallel), lo que lo hace adecuado para entornos de producción con restricciones de hardware.
- **Investigación en eficiencia de MoE**: la disponibilidad de esta cuantización con tensores de routing protegidos permite estudiar el comportamiento de un MoE de 80B en hardware de gama media, sin necesidad de clústeres de GPU múltiples.

## Benchmarks y rendimiento

La model card del modelo cuantizado proporciona datos de perplejidad (PPL) en wikitext-2-raw (test), con n_ctx = 512 y 12 fragmentos, medidos con vLLM:

| Weights | PPL | vs bf16 |
|---|---|---|
| bf16 (master, referencia) | 7.74 | — |
| GPTQ W4A16 (este repo) | 9.34 | +20.5% |

No se han publicado resultados de benchmarks de calidad de código (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. El technical report del modelo base (arXiv:2603.00729) describe que Qwen3-Coder-Next es el mejor modelo de su tamaño, comparable a modelos con 10-20 veces más parámetros activos, pero no se incluyen cifras concretas en la model card. Los benchmarks del modelo base son accesibles en el repositorio de Qwen, pero no se reproducen aquí por falta de datos.

## Requisitos de hardware

- **VRAM estimada**: ~40 GiB en disco, lo que requiere al menos 40 GB de VRAM para cargar los pesos completos en memoria; con tensor parallel o offload se puede reducir el requisito por GPU.
- **GPU recomendadas**: una sola GPU de 48 GB (por ejemplo, NVIDIA A6000 o RTX A6000) para servir el modelo completo sin paralelización; en GPUs de 24 GB (RTX 4090, A5000) se puede usar tensor parallel (2 GPUs) o offload a CPU, aunque con mayor latencia.
- **Compatibilidad con GPU de consumo**: en una RTX 4090 (24 GB) es posible la inferencia con offload de pesos a RAM, pero la latencia será alta; no es viable en GPUs de 16 GB o menos sin cuantizaciones adicionales.
- **Opciones de despliegue**: vLLM y SGLang (compatibles con compressed-tensors), también puede usarse con llama.cpp si se convierte a GGUF, aunque el formato nativo es safetensors.
- **Latencia y throughput estimados**: no se proporcionan números concretos en la documentación; el modelo activa ~3B parámetros por token, lo que sugiere un throughput mayor que un modelo denso de 80B, pero los datos dependen del hardware y del batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Tamaño | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-Coder-Next (bf16) | 80B | ~3B | 256K | — | ~159 GiB | Apache-2.0 |
| Qwen3-Coder-Next-FP8 (oficial) | 80B | ~3B | 256K | FP8 | ~80 GiB | Apache-2.0 |
| 6block/Qwen3-Coder-Next-GPTQ (este) | 80B | ~3B | 256K | GPTQ W4A16 | ~40 GiB | Apache-2.0 |
| Qwen3-Coder-30B-A3B-Instruct | 30B | ~3B | 256K | — | ~60 GiB (bf16) | Apache-2.0 |

La comparativa directa con el modelo de 30B-A3B (de la familia Qwen3-Coder) muestra que este modelo de 80B-A3B ofrece mayor capacidad total de parámetros (80B frente a 30B) con el mismo número de parámetros activos, lo que mejora la calidad de los expertos en tareas de código. La cuantización GPTQ de este repo es la más compacta de la serie, con una pérdida de perplejidad del 20.5% respecto al bf16, mientras que la FP8 oficial es aproximadamente el doble de tamaño y conserva más calidad (no se proporciona el dato de PPL). La alternativa AWQ de 6block (misma arquitectura) es similar en tamaño pero puede presentar diferencias de calidad en función de la calibración.

## Limitaciones y advertencias

- **Pérdida de calidad por cuantización**: la perplejidad aumenta un 20.5% respecto al modelo bf16 (de 7.74 a 9.34), lo que puede traducirse en respuestas menos precisas o más alucinaciones en tareas de código complejo.
- **Idiomas limitados**: el modelo está entrenado principalmente en inglés y chino; el rendimiento en otros idiomas, incluido el español, es inferior y no está documentado.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar código incorrecto o respuestas falsas con alta confianza; especialmente en contexto de 256K, la atención puede degradarse en ventanas muy largas.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener la atribución y no usar marcas registradas; el modelo base no tiene cláusulas de uso prohibido.
- **Requisitos de memoria**: aunque la cuantización reduce el tamaño a ~40 GiB, la carga en una sola GPU de 24 GB requiere offload, lo que introduce latencia y puede causar problemas de memoria con contextos largos.
- **Formato no estándar**: el formato compressed-tensors es específico de vLLM/SGLang; para otros motores (como llama.cpp) se necesita una conversión adicional que puede no estar disponible.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/6block/Qwen3-Coder-Next-GPTQ
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Technical report del modelo base (arXiv): https://arxiv.org/abs/2603.00729
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentación de Unsloth para Qwen3-Coder-Next: https://unsloth.ai/docs/models/qwen3-coder-next
- Cuantización AWQ del mismo autor: https://huggingface.co/6block/Qwen3-Coder-Next-AWQ
- Cuantización FP8 oficial: https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
