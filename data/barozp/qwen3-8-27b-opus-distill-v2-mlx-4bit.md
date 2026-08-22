# barozp/Qwen3.8-27B-Opus-Distill-v2-MLX-4bit

## Resumen

Qwen3.8-27B-Opus-Distill-v2-MLX-4bit es una conversión a cuantización de 4 bits en formato MLX del modelo Qwen3.8-27B-Opus-Distill-v2, un fine-tuning de razonamiento multimodal desarrollado por el usuario barozp. El modelo base, Qwen3.8-27B, es un transformer denso de 27 000 millones de parámetros con arquitectura híbrida Gated-DeltaNet y atención completa, publicado por Alibaba como modelo local de codificación y razonamiento. Sobre esta base, barozp aplicó un ajuste fino con LoRA (r=64) utilizando un dataset de 11 716 ejemplos de razonamiento destilados de Claude Opus, con el objetivo de mejorar las capacidades de razonamiento multi-step y verificación interna.

La versión v2 corrige un bug determinista presente en v1: ciertas combinaciones de restricciones de formato (por ejemplo, "no prose" + "no markdown") provocaban un bucle de auto-verificación que agotaba el presupuesto de tokens sin generar salida visible. El problema se atribuyó a trazas de razonamiento reconstruidas en el dataset de entrenamiento original; v2 se reentrenó con un dataset reconstruido y verificado mediante un proceso de 30 jueces LLM en paralelo. Esta conversión MLX 4-bit está pensada para ejecutarse en Apple Silicon mediante la librería mlx-vlm, e incluye el encoder de visión integrado, por lo que admite entrada de imágenes sin necesidad de ficheros adicionales.

La relevancia de este modelo radica en que combina razonamiento avanzado, capacidades multimodales y una licencia Apache 2.0, lo que lo hace atractivo para desarrolladores que necesitan un modelo de razonamiento con visión ejecutable en hardware de consumo (Mac con memoria unificada) o en stacks CUDA mediante las versiones FP8 o GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido Gated-DeltaNet / full-attention, 64 capas |
| Parametros totales | 27 000 millones (modelo base dense) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 4-bit (este repo), MLX 8-bit, FP8, GGUF (varias) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con una arquitectura híbrida que combina capas Gated-DeltaNet (una variante de atención lineal eficiente) con capas de atención completa, distribuidas en 64 capas. Sobre esta base, barozp aplicó un ajuste fino con LoRA de rango 64, alpha 64 y dropout 0.05, fusionando posteriormente los adaptadores en los pesos del modelo. El dataset de entrenamiento, `barozp/opus-reasoning-distill-v2`, contiene 11 716 ejemplos de razonamiento destilados de Claude Opus, con trazas verificadas como genuinas y filtradas mediante un proceso de 30 jueces LLM en paralelo para eliminar patrones patológicos.

La versión v2 se reentrenó sobre un dataset reconstruido para corregir el bug de bucles de auto-verificación detectado en v1. La conversión MLX 4-bit se realizó directamente desde los pesos bf16 originales (sin pasar por GGUF), utilizando `mlx-vlm` 0.6.8 con cuantización affine de 4 bits y grupo de tamaño 64. El proceso generó 2180 tensores distribuidos en 3 shards safetensors. Cabe destacar que la cabeza MTP (Multi-Token Prediction) nativa del modelo base no está disponible en esta conversión, ya que el cargador de mlx-vlm elimina los pesos `mtp.*` durante la conversión, por lo que no se puede utilizar decodificación especulativa nativa.

## Capacidades

- Generación de texto y chat conversacional multimodal (image-text-to-text).
- Razonamiento multi-step con verificación interna, mejorado mediante destilación de Opus.
- Comprensión de imágenes: el encoder de visión está integrado en los pesos, por lo que la entrada de imágenes funciona sin ficheros adicionales.
- Servidor OpenAI-compatible integrado mediante `mlx_vlm.server`.
- Corrección de bucles de auto-verificación en restricciones de formato apiladas (mejora de v2 sobre v1).
- Soporte de cuantización 4-bit y 8-bit para MLX, con versiones FP8 y GGUF para otros stacks.

## Casos de uso

- Asistente de razonamiento matemático y lógico: el modelo puede resolver problemas que requieren varios pasos de deducción, gracias a su entrenamiento con trazas de razonamiento de Opus. Se usaría con prompts que pidan una cadena de pensamiento explícita.
- Análisis de imágenes con explicación razonada: al integrar el encoder de visión, puede describir imágenes y responder preguntas sobre su contenido, útil en entornos de documentación técnica o accesibilidad.
- Generación de código con verificación: como modelo derivado de Qwen3.8-27B (orientado a codificación), puede generar y revisar código, aunque no se han publicado benchmarks específicos de HumanEval en esta conversión.
- Chat conversacional local en Mac: gracias a la cuantización MLX 4-bit (14.97 GB), puede ejecutarse en un Mac con 24 GB de memoria unificada, ofreciendo un asistente privado sin conexión.
- Servidor de inferencia OpenAI-compatible: el comando `mlx_vlm.server` permite desplegar un endpoint local compatible con la API de OpenAI, integrable en aplicaciones existentes.
- Investigación en alineación y seguridad de IA: el modelo se presenta como un experimento de investigación en seguridad y alineación, por lo que puede usarse para estudiar comportamientos de razonamiento y verificación en modelos destilados.

## Benchmarks y rendimiento

Los siguientes resultados fueron medidos con `lm-evaluation-harness` en modo 0-shot, loglikelihood (opción múltiple), sin chat template, con límite de 500 ejemplos. La columna "Delta" compara v2 contra el modelo base (Qwen3.8-27B) bajo el mismo protocolo.

| Tarea | Metrica | Base | v2 | Delta |
|---|---:|---:|---:|---:|
| wikitext | word perplexity (menor es mejor) | 8.4335 | 8.3788 | -0.055 |
| mmlu | acc | 0.8494 | 0.8476 | -0.002 |
| hellaswag | acc_norm | 0.7420 | 0.7500 | +0.008 |
| arc_challenge | acc_norm | 0.5880 | 0.6220 | +0.034 |
| gpqa_diamond | acc_norm | 0.2323 | 0.4697 | +0.237 |

El conocimiento general (MMLU) y el modelado de lenguaje (wikitext) se mantienen en la misma banda de ruido que el modelo base, mientras que el razonamiento (ARC, GPQA) muestra una mejora sustancial. No se han publicado resultados comparativos con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- Modelo base bf16: requiere aproximadamente 53.8 GB de VRAM (según LLM Explorer), por lo que necesita GPUs de datacenter como A100 80GB o H100.
- Conversión MLX 4-bit (este repo): 14.97 GB de pesos, recomendada para Mac con 24 GB de memoria unificada o superior. En Mac de 24 GB se recomienda limitar la resolución de imagen con `--max-pixels 1003520`.
- Conversión MLX 8-bit: 27.49 GB, recomendada para Mac de 36 GB o más.
- Versión FP8: pensada para stacks CUDA con sglang o vLLM, requiere al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) para caber en memoria, aunque se recomienda verificar el consumo real.
- Versión GGUF: para llama.cpp, Ollama o LM Studio, con requisitos variables según la cuantización elegida.
- Despliegue: mlx-vlm para Apple Silicon, sglang/vLLM para FP8 en CUDA, llama.cpp/Ollama para GGUF.
- Latencia y throughput: no se han publicado mediciones específicas para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento (GPQA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | 0.2323 (0-shot, sin thinking) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Opus-Distill-v2 | 27B | No disponible | 0.4697 (0-shot, sin thinking) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Opus-Distill-v2-MLX-4bit | 27B (cuantizado 4-bit) | No disponible | No medido directamente | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia del propio modelo, ya que no se dispone de datos de benchmarks de otros modelos de 27B bajo el mismo protocolo. La ventaja principal de la versión MLX 4-bit es su tamaño reducido (14.97 GB) frente a los 53.8 GB del bf16, a costa de una posible pérdida de precisión no cuantificada en los benchmarks publicados.

## Limitaciones y advertencias

- La cabeza MTP nativa no está disponible en esta conversión MLX, por lo que no se puede utilizar decodificación especulativa nativa del modelo base.
- El contexto máximo no se ha especificado en la documentación disponible; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- Los idiomas soportados no están documentados; aunque el modelo base de Qwen suele ser multilingüe, no hay confirmación para este fine-tuning.
- Las imágenes de alta resolución pueden expandirse a aproximadamente 12 000 tokens visuales, lo que puede agotar la memoria en Mac de 24 GB; se recomienda limitar la resolución.
- No se han publicado evaluaciones de sesgos, alucinación o robustez ante prompts adversariales para este modelo.
- Aunque la licencia es Apache 2.0, el modelo es un fine-tuning de un modelo de Alibaba; se deben revisar los términos de uso del modelo base original.
- La cuantización 4-bit puede degradar ligeramente la calidad del razonamiento en tareas complejas; para uso crítico se recomienda la versión 8-bit.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-MLX-4bit
- Modelo base (bf16 safetensors): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2
- Versión v1: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill
- Colección del autor: https://huggingface.co/collections/barozp/qwen38-27b-opus-distill
- Dataset de entrenamiento: https://huggingface.co/datasets/barozp/opus-reasoning-distill-v2
- Versión MLX 8-bit: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-MLX-8bit
- Versión FP8: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-FP8
- Versión GGUF: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF
- Repositorio GitHub del instalador de Qwen3.8-27B: https://github.com/qwen3-8-27b/qwen3-8-27b
