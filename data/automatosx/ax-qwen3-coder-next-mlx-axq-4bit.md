# AutomatosX/AX-Qwen3-Coder-Next-MLX-AXQ-4bit

## Resumen

AX-Qwen3-Coder-Next-MLX-AXQ-4bit es un checkpoint cuantizado del modelo Qwen/Qwen3-Coder-Next, convertido al formato MLX para Apple Silicon por el desarrollador AutomatosX. El modelo original es un transformer de mezcla de expertos (MoE) con 79,67 mil millones de parámetros lógicos, diseñado específicamente para generación de código y razonamiento. Esta versión aplica la técnica de cuantización mixta AXQuant (AXQ) con una precisión base de 4 bits, manteniendo tensores protegidos (embeddings, normas) en mayor precisión, lo que resulta en un peso total de 47,78 GB.

La relevancia de este modelo radica en su capacidad para ejecutar un MoE de gran tamaño en hardware de Apple Silicon mediante MLX, con una ventana de contexto configurada de 262 144 tokens. Sin embargo, el autor advierte explícitamente que se trata de una evidencia de desarrollo, no de una versión certificada de AXQuant: no se publican métricas de calidad, velocidad de kernels ni validación de contexto largo. El modelo es solo de texto, sin sidecar de visión ni de MTP (multi-token prediction).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3NextForCausalLM (mixture of experts, MoE) |
| Parametros totales | 79,67 mil millones (logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (configurado; limites practicos dependen de la memoria unificada) |
| Tipos de cuantizacion | 4-bit base (mezcla: 4bit 97,22 %, 6bit 1,93 %, 8bit 0,45 %, bf16 0,39 %; grupos de 32 y 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Coder-Next, un transformer MoE con arquitectura Qwen3NextForCausalLM. Este checkpoint no es un entrenamiento original, sino una conversión cuantizada del modelo BF16 de origen, realizada con el cuantizador AXQuant 1.2.0. La cuantización se aplica solo al camino de texto, con una asignación basada en prioris de arquitectura (sin calibración con datos). Los tensores protegidos (embeddings, normas, etc.) se mantienen en precisiones superiores (6-bit, 8-bit o bf16) para preservar la estabilidad numérica.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El autor indica que la conversión registra MLX 0.32.0 y MLX-LM 0.31.3, y que la ejecución nativa con AX Engine no está establecida por falta de un manifest validado.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base Qwen3-Coder-Next.
- Generación de código y asistencia en programación, dado el propósito del modelo base (Coder-Next).
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación, aunque es una capacidad típica de la familia Qwen3; se debe verificar en la práctica.
- Capacidades multilingües: no documentadas en esta ficha; el modelo base de Qwen suele ser multilingüe, pero no hay confirmación.
- No incluye sidecar de visión (vision.safetensors) ni de MTP (mtp.safetensors), por lo que no soporta entrada multimodal ni predicción multi-token acelerada.
- Modo de pensamiento (thinking mode): no documentado en esta versión cuantizada.

## Casos de uso

- Desarrollo de código en equipos Apple Silicon: el modelo puede ejecutarse localmente en Mac con MLX-LM, permitiendo autocompletado, explicación de código o generación de fragmentos sin depender de servicios en la nube. Su tamaño (47,78 GB de pesos) requiere un Mac con memoria unificada generosa (al menos 64 GB recomendados).
- Asistente de programación offline: integrable en entornos de desarrollo (IDEs) mediante MLX-LM, para consultas sobre APIs, refactorización o depuración, con la ventaja de que los datos no salen del dispositivo.
- Generación de documentación técnica: el modelo puede redactar comentarios, docstrings o documentación de proyectos a partir de código fuente, aprovechando su capacidad de razonamiento sobre código.
- Chatbot de soporte técnico interno: desplegado en una Mac de servidor, puede atender consultas sobre bases de código propietarias, manteniendo la privacidad de los datos.
- Prototipado rápido de aplicaciones de texto: dado su contexto de 262K tokens, puede procesar documentos largos o conversaciones extensas, útil para resúmenes o análisis de logs.
- Investigación en cuantización mixta: sirve como ejemplo práctico de un checkpoint AXQ de 4 bits con protección de tensores, para estudiar el impacto de la cuantización en modelos MoE grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay evidencia de calidad frente a BF16 o líneas base uniformes, ni mediciones de velocidad de kernels, ni validación de contexto largo. Por tanto, no se pueden presentar cifras de MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- VRAM estimada: el peso de los safetensors es de 47,78 GB. En Apple Silicon, la memoria unificada debe ser suficiente para alojar los pesos más el espacio de trabajo de inferencia; se recomienda al menos 64 GB de RAM unificada, aunque 48 GB podrían ser insuficientes para contextos largos.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3/M4 series) con memoria unificada de 64 GB o superior. No apto para GPUs NVIDIA convencionales sin adaptación.
- ¿Cabe en consumer GPU? No, en el sentido habitual de GPUs de consumo (RTX 4090 con 24 GB VRAM no es suficiente para los pesos completos). Solo es viable en Mac con memoria unificada grande.
- Opciones de despliegue: MLX-LM (comando `mlx_lm.generate`), compatible con la biblioteca MLX. No se proporcionan opciones para vLLM, llama.cpp u Ollama, ya que el formato es MLX.
- Latencia y throughput: no medidos ni publicados. El autor no aporta datos de velocidad.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos cuantizados de tamaño similar. Se puede mencionar que existen hermanos de la misma familia (por ejemplo, la versión de 6 bits de AutomatosX, AX-Qwen3-Coder-Next-MLX-AXQ-6bit) que ofrecen mayor precisión media a costa de mayor almacenamiento, pero no hay datos de rendimiento relativos. Tampoco se comparan con otras cuantizaciones de Qwen3-Coder-Next (como GGUF o AWQ) en esta documentación.

## Limitaciones y advertencias

- No es una versión certificada de AXQuant: los gates formales M0-M8 no están cerrados; se trata de una evidencia de desarrollo.
- No se publican métricas de calidad, por lo que no hay garantía de que el modelo cuantizado conserve el rendimiento del original BF16.
- El contexto de 262 144 tokens es una capacidad configurada, no una validación práctica; la memoria unificada limita el uso real.
- No incluye sidecar de visión ni de MTP, por lo que no soporta entrada multimodal ni predicción multi-token.
- La ejecución nativa con AX Engine no está establecida; solo se garantiza la inferencia estándar de texto con MLX-LM.
- Riesgo de alucinación y sesgos: no evaluados; al ser un modelo de código, puede generar código incorrecto o inseguro si no se supervisa.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de calidad o soporte.
- El tamaño del repositorio es de 204,5 GB (según HuggingFace), aunque la descarga completa aproximada es de 47,89 GB; la discrepancia puede deberse a archivos adicionales o historial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Coder-Next-MLX-AXQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Catálogo de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Hermano de 6 bits: https://huggingface.co/AutomatosX/AX-Qwen3-Coder-Next-MLX-AXQ-6bit
