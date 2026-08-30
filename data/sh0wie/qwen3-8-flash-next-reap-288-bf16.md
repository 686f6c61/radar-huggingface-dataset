# sh0wie/Qwen3.8-Flash-Next-REAP-288-bf16

## Resumen

Qwen3.8-Flash-Next-REAP-288-bf16 es un checkpoint en precisión bf16 del modelo Qwen3.8-Flash-Next, podado mediante la técnica REAP (saliency-based pruning) para reducir el número de expertos por capa MoE de 512 a 288. El modelo original, desarrollado por el equipo Qwen, es un avance de la arquitectura Qwen4 con atención híbrida Gated DeltaNet + Qwen Sparse Attention, diseñado para mejorar la eficiencia computacional manteniendo una alta capacidad. Este checkpoint concreto, publicado por el usuario sh0wie, sirve como fuente de referencia en precisión completa para requantizar, fine-tuning o servir con máxima fidelidad.

El modelo tiene 124.5 mil millones de parámetros en el modelo principal (según los safetensors), más una tabla de embeddings n-gram de 51 mil millones que no se incluye en los pesos principales, sumando una clase de 180 mil millones. Con 48 capas y routing top-10 sobre 288 expertos activos, activa aproximadamente 6 mil millones de parámetros por token. Su relevancia radica en que demuestra cómo la poda selectiva de expertos puede reducir drásticamente el tamaño del modelo (de 512 a 288 expertos) manteniendo una calidad cercana a la versión completa, con una puntuación de 91.5% en HumanEval para la versión cuantizada a 4 bits.

Este checkpoint bf16 es la base para todas las demás variantes publicadas (MLX 4-bit, Q8E, GGUF, AWQ) y está pensado para usuarios que necesitan los pesos en precisión nativa para fine-tuning o requantización. Para inferencia directa, el autor recomienda usar la versión 4-bit, que ocupa 68 GB y decodifica a ~28 tokens por segundo en un Apple M4 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet + Qwen Sparse Attention, MoE con 288 expertos por capa (de 512 originales), routing top-10 |
| Parametros totales | 124.517.075.091 (modelo principal, safetensors) + 51B tabla n-gram (no incluida en safetensors) |
| Parametros activos | ~6B por token (estimado del modelo base; no especificado para la versión podada) |
| Longitud de contexto | No especificada en este checkpoint; el modelo base Qwen3.8-Flash-Next soporta 1M tokens |
| Tipos de cuantizacion | bf16 nativo (este checkpoint); existen variantes 4-bit y Q8E publicadas por el mismo autor |
| Idiomas soportados | No disponibles |
| Licencia | qwen-community-license-1.0 (license: other) |
| Formato de pesos | safetensors, MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que alterna capas de Gated DeltaNet (una variante de SSM lineal) con capas de Qwen Sparse Attention, en un total de 48 capas. Cada capa contiene un bloque MoE con 512 expertos y routing top-10, lo que activa aproximadamente 6 mil millones de parámetros por token. El modelo incorpora además una tabla de embeddings n-gram de 51 mil millones de parámetros que complementa la representación del token.

El proceso REAP (Redundancy Elimination via Attention Pruning) selecciona los 288 expertos más relevantes de cada capa MoE, utilizando una métrica de saliencia calibrada sobre los pesos cuantizados y evaluada con aproximadamente 686K tokens de tráfico de codificación agéntica. El conjunto de expertos conservados es idéntico al de la versión 4-bit publicada. Este checkpoint bf16 no introduce error de cuantización, ya que se extrae directamente de los pesos originales en precisión completa. No se especifican detalles sobre el entrenamiento del modelo base (datos, RLHF, etc.) en la información disponible.

## Capacidades

- Generación de texto y razonamiento: al ser una versión podada de Qwen3.8-Flash-Next, conserva las capacidades de razonamiento y generación del modelo original, aunque con una ligera degradación de calidad (menos de 1 punto en HumanEval respecto a la precisión nativa según el autor).
- Codificación: el modelo está calibrado específicamente para tráfico de codificación agéntica, lo que lo hace especialmente adecuado para tareas de generación y edición de código.
- Soporte de tool calling y function calling: no se especifica explícitamente, pero el modelo base Qwen3.8-Flash-Next lo soporta; se asume que la versión podada lo mantiene.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: el modelo base es multimodal (texto e imagen), pero no se confirma si esta versión podada conserva la entrada de visión. El pipeline declarado es text-generation.

## Casos de uso

- Requantización a otros formatos: este checkpoint bf16 es la fuente de referencia para convertir a MLX 4-bit, GGUF, AWQ o variantes FP sin heredar errores de redondeo de cuantizaciones previas. Se usa como entrada para herramientas de conversión.
- Fine-tuning con LoRA o completo: los pesos en bf16 permiten realizar fine-tuning sobre el modelo podado sin pérdida de precisión, ideal para adaptar el modelo a dominios específicos como generación de código propietario o asistentes de programación.
- Servicio de máxima fidelidad: en entornos con suficiente memoria (por ejemplo, servidores con múltiples GPU o Macs con gran RAM unificada), se pueden servir estos pesos directamente para obtener la mejor calidad posible del modelo podado.
- Investigación sobre poda de MoE: este checkpoint sirve como referencia para estudiar el impacto de la poda de expertos en la calidad del modelo, comparando con la versión completa de 512 expertos.
- Desarrollo de motores de inferencia: el autor menciona un motor pmlx (aún no público) que permite ejecutar este modelo en un solo Mac mediante paging de SSD; este checkpoint es útil para probar y validar dichos motores.
- Evaluación comparativa de cuantización: al ser la fuente en precisión completa, permite medir la degradación introducida por diferentes esquemas de cuantización (4-bit, 8-bit, etc.) sobre el mismo conjunto de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint bf16. El autor menciona que la versión 4-bit del mismo modelo alcanza un 91.5% en HumanEval, y que su calidad está dentro de un punto de la precisión nativa. No hay datos de MMLU, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Este checkpoint bf16 ocupa 232 GB en disco y requiere aproximadamente esa cantidad de memoria para cargar los pesos en RAM/VRAM.
- En un Apple Silicon con memoria unificada, se puede ejecutar mediante paging desde SSD usando el motor pmlx (aún no público). El autor indica que en un Mac con suficiente RAM, el modelo puede residir parcialmente en GPU y el resto paginarse desde SSD.
- Para servidores con GPU NVIDIA, no se proporcionan datos específicos; se necesitarían al menos 4 GPU de 80 GB (como A100 o H100) para alojar los pesos en memoria, o técnicas de sharding y offloading.
- La versión 4-bit (recomendada para la mayoría de usuarios) requiere ~68 GB residentes en un M4 Max, decodificando a ~28 tok/s con mlx-vlm estándar. Con el motor omlx (v0.6.4+) la huella baja a ~39 GB al transmitir la tabla n-gram desde NVMe.
- Opciones de despliegue: mlx-vlm (para Apple Silicon), omlx (con streaming de tabla), pmlx (próximamente), y conversión a GGUF para llama.cpp o AWQ para vLLM.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. El modelo base Qwen3.8-Flash-Next (512 expertos) es la referencia natural, pero no se publican sus benchmarks en esta fuente. Otras alternativas de la misma categoría (MoE de ~180B con activación de ~6B) podrían ser DeepSeek-V3 o Qwen3-235B, pero no hay datos de rendimiento comparables disponibles.

## Limitaciones y advertencias

- Este checkpoint bf16 no está pensado para inferencia directa en la mayoría de entornos: su tamaño (232 GB) exige hardware de gama alta o técnicas de paging que aún no están disponibles públicamente (pmlx no ha sido liberado).
- La licencia qwen-community-license-1.0 puede imponer restricciones de uso comercial; se recomienda revisar los términos completos antes de desplegar en producción.
- El modelo es una versión podada: aunque la calidad es cercana a la original, puede haber degradación en tareas fuera del dominio de calibración (codificación agéntica).
- No se especifican los idiomas soportados ni se confirma si las capacidades multimodales del modelo base se conservan en esta versión.
- La tabla n-gram de 51B parámetros no está incluida en los safetensors; es necesario gestionarla por separado para un funcionamiento completo.
- No hay datos de sesgos o alucinaciones específicos para este modelo; se heredan los riesgos del modelo base Qwen3.8-Flash-Next.

## Enlaces

- [Checkpoint bf16 en HuggingFace](https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-bf16)
- [Versión 4-bit MLX](https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit)
- [Versión Q8E MLX](https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-Q8E-MLX)
- [Repositorio del modelo base Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Receta vLLM para Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- [Página de Qwen3.8-Flash en QwenCloud](https://www.qwencloud.com/models/qwen3.8-flash)
