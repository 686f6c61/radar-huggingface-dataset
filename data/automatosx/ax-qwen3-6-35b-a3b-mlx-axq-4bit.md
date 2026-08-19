# AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit

## Resumen

AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit es un checkpoint cuantizado en precisión mixta del modelo Qwen/Qwen3.6-35B-A3B, convertido a formato MLX para Apple Silicon por AutomatosX. El modelo base es un transformer de mezcla de expertos (MoE) con 35.110 millones de parámetros lógicos y aproximadamente 3.000 millones de parámetros activos por token, diseñado para generación de texto y procesamiento de visión (el checkpoint incluye un sidecar de visión en BF16). La cuantización utiliza el método AXQuant (AXQ) en su versión 1.2.0, que aplica una precisión base de 4 bits a la mayoría de los tensores de la ruta de lenguaje, reservando 8 bits y BF16 para tensores protegidos, logrando un BPW total medido de 4,7642.

Este lanzamiento es relevante porque ofrece una versión optimizada para ejecución local en hardware Apple Silicon (MLX) de un modelo MoE de gran tamaño, reduciendo el almacenamiento a 21,4 GB y permitiendo una ventana de contexto configurada de hasta 262.144 tokens. Sin embargo, el autor no publica métricas de calidad ni de rendimiento, y la aceleración MTP (multi-token prediction) no está certificada en esta versión. La licencia Apache 2.0 facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE) |
| Parametros totales | 35,11B (lógicos); 5,92B almacenados en safetensors |
| Parametros activos | ~3B (según denominación A3B) |
| Longitud de contexto | 262.144 tokens (configurado; límites prácticos según memoria unificada) |
| Tipos de cuantizacion | AXQuant mixto: 4-bit (93,52%), 8-bit (1,47%), BF16 (5,01%) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE (Qwen3.5) con 35,11B parámetros lógicos y ~3B activos por token. La ruta de texto está cuantizada con AXQuant en precisión mixta: el 93,52% de los parámetros principales (33,62B) se almacenan en 4 bits con grupos de tamaño 32 y 64, un 1,47% (529,61M) en 8 bits, y un 5,01% (1,80B) permanece en BF16. El sidecar de visión contiene 333 tensores con 446,57M parámetros en BF16, protegido de la cuantización. La asignación de precisión se basa en prioridades de arquitectura (planning evidence: `architecture_prior`) y no se ha realizado calibración con datos. No se publican detalles sobre el entrenamiento del modelo original (tokens, dataset, RLHF/DPO), ya que esta es una conversión cuantizada, no un entrenamiento nuevo. La conversión registra MLX 0.32.0 y MLX-LM 0.31.3. No se incluye sidecar MTP (multi-token prediction).

## Capacidades

- Generación de texto y conversación multirronda (pipeline `text-generation`).
- Procesamiento de visión: el checkpoint incluye un sidecar de visión BF16, pero el autor no evalúa ni garantiza la calidad de las tareas visión-lenguaje.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no especificadas (el modelo base Qwen suele ser multilingüe, pero no hay confirmación para este checkpoint).
- Modo thinking: no documentado.
- Audio: no presente (campo `Audio present: False`).

## Casos de uso

- Ejecución local en Mac con Apple Silicon: el checkpoint está optimizado para MLX, permitiendo inferencia de un modelo MoE de 35B en equipos con memoria unificada suficiente (al menos 24-32 GB recomendados, dado el tamaño de descarga de 21,4 GB). Adecuado para desarrollo y prototipado sin depender de la nube.
- Asistentes conversacionales con contexto largo: la ventana de 262.144 tokens permite mantener conversaciones extensas o procesar documentos largos, aunque el rendimiento práctico dependerá de la memoria disponible.
- Investigación en cuantización de precisión mixta: el checkpoint sirve como referencia para estudiar el impacto de AXQuant en modelos MoE, ya que documenta la distribución de precisiones y el BPW medido.
- Generación de texto con restricciones de almacenamiento: al ocupar solo 21,4 GB, es viable en entornos con espacio limitado en disco, comparado con el modelo BF16 original (que requeriría ~70 GB).
- Integración en pipelines de MLX-LM: se puede usar con `mlx_lm.generate` para tareas de generación estándar, aunque sin garantías de calidad respecto al modelo original.
- Evaluación de calidad de cuantización: dado que no se publican métricas de retención de calidad, los usuarios pueden ejecutar sus propios benchmarks (MMLU, HumanEval, etc.) para comparar con el modelo BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha realizado una evaluación de retención de calidad frente al modelo BF16 o a líneas base uniformes, y que no se certifica la aceleración MTP. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no especificada. El checkpoint pesa 21,4 GB en disco; en tiempo de inferencia, la memoria unificada necesaria dependerá del contexto y del lote. Se recomienda al menos 32 GB de memoria unificada en Apple Silicon para operar cómodamente con la ventana completa.
- GPU recomendadas: Apple Silicon (M-series) con MLX; el autor certifica el checkpoint en un `df-macbookpro-m5` (2026). No se mencionan GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no aplica (formato MLX exclusivo para Apple Silicon).
- Opciones de despliegue: MLX-LM (comando `mlx_lm.generate`), también se puede usar con la librería `mlx` directamente. No se incluye soporte para vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Como referencia, el modelo base Qwen3.6-35B-A3B es comparable en arquitectura a otros MoE de ~35B con ~3B activos (p. ej., Qwen3-30B-A3B, DeepSeek-V2-Lite), pero no hay métricas publicadas para este checkpoint cuantizado. La comparativa queda pendiente de evaluación por parte del usuario.

## Limitaciones y advertencias

- No se publican métricas de calidad ni de retención tras la cuantización; el rendimiento real puede diferir del modelo BF16.
- La aceleración MTP no está certificada; no se puede asumir ninguna mejora de velocidad por predicción multi-token.
- La calidad de las tareas de visión no ha sido evaluada ni garantizada por el autor.
- El checkpoint no incluye un manifiesto nativo validado para AX Engine; la ejecución se limita al runtime MLX estándar.
- La calibración de la cuantización se basó en prioridades de arquitectura, no en datos reales, lo que puede afectar a la precisión en ciertos tensores.
- No se especifican los idiomas soportados; aunque el modelo base Qwen suele ser multilingüe, no hay confirmación para esta versión.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base Qwen3.6-35B-A3B no tenga restricciones adicionales (no documentadas aquí).
- El tamaño de descarga (21,43 GB) y los requisitos de memoria unificada pueden ser prohibitivos en equipos con menos de 32 GB de RAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Certificado Tier 1: https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen36-35b-axq4-nomtp-tier1.md
- Repositorio AXQuant: https://github.com/defai-digital/axquant
- Colección de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Hermano 6-bit: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit
