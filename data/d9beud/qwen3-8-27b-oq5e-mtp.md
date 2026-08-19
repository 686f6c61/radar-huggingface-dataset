# d9beuD/Qwen3.8-27B-oQ5e-mtp

## Resumen

El modelo `d9beuD/Qwen3.8-27B-oQ5e-mtp` es una cuantización mixta de 5 bits del modelo base Qwen3.8-27B, realizada con la librería oMLX (oQ) en formato MLX safetensors. El autor, d9beuD, ha publicado esta versión cuantizada para su uso en entornos Apple Silicon mediante MLX. La cuantización reduce el tamaño del modelo a 20.3 GB, lo que permite su ejecución en hardware con memoria unificada moderada. El nombre sugiere una variante de la familia Qwen3, aunque los parámetros totales registrados en el archivo safetensors son de 5.756.598.512 (aproximadamente 5.7B), lo que podría indicar una arquitectura MoE con 27B parámetros totales y 5.7B activos, aunque esta información no está confirmada en la documentación disponible.

Dado que la model card es extremadamente breve y solo detalla el proceso de cuantización, no se dispone de información sobre el modelo base, sus capacidades, entrenamiento o rendimiento. Esta ficha se basa exclusivamente en los metadatos de HuggingFace y la descripción técnica de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag), probablemente transformer con MoE (no confirmado) |
| Parametros totales | 5.756.598.512 (5.7B) |
| Parametros activos | no disponible (posible MoE, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ (mixed-precision), 5 bits, group size 64 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. El tag `qwen3_5` sugiere que pertenece a la familia Qwen3.5, que típicamente emplea arquitecturas transformer con atención de múltiples cabezas y, en versiones grandes, mezcla de expertos (MoE). Sin embargo, no se puede confirmar sin acceso al modelo original. El proceso de cuantización fue realizado con oMLX v0.6.0.dev1, una herramienta de cuantización de precisión mixta para MLX, que optimiza la asignación de bits según la importancia de cada capa. No se dispone de datos sobre el entrenamiento, el dataset o el proceso de alineación (RLHF/DPO) del modelo original.

## Capacidades

No se han documentado capacidades específicas en la información proporcionada. Al ser una cuantización de un modelo de la familia Qwen, se puede inferir que el modelo base probablemente soporta generación de texto, razonamiento, código y multilingüismo, pero estas capacidades no están verificadas para esta versión cuantizada. No se dispone de información sobre tool calling, agentes, visión o audio.

## Casos de uso

Dado que la información es insuficiente para confirmar capacidades concretas, no se pueden enumerar casos de uso verificados. Sin embargo, por su naturaleza de modelo de lenguaje cuantizado para MLX, podría emplearse en:

- Inferencia local en dispositivos Apple Silicon con memoria unificada de al menos 32 GB (el archivo pesa 20.3 GB, pero se requiere memoria adicional para el runtime y los estados intermedios).
- Prototipado rápido de aplicaciones de generación de texto en entornos macOS.
- Experimentación con cuantización de precisión mixta en la plataforma MLX.

Estas aplicaciones son hipotéticas y dependen de que el modelo base tenga las capacidades esperadas de la familia Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 20.3 GB. Para inferencia con MLX, se recomienda al menos 32 GB de memoria unificada en Apple Silicon (M1 Pro/Max/Ultra o superior) para dejar espacio para activaciones y KV cache.
- GPU recomendadas: no aplica (MLX está diseñado para Apple Silicon, no para GPUs NVIDIA/AMD).
- Compatibilidad con consumer GPU: no, requiere hardware Apple con chip M-series.
- Opciones de despliegue: MLX (librería nativa de Apple), posiblemente a través de `mlx-lm` o integraciones con frameworks como LangChain.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables, ya que el modelo base no está identificado con certeza y no hay benchmarks. La cuantización oQ de 5 bits es similar a otras técnicas como GGUF Q5_K_M, pero no hay datos para comparar rendimiento.

## Limitaciones y advertencias

- La información disponible es insuficiente para evaluar sesgos, alucinaciones o limitaciones de contexto.
- La licencia no está especificada; se desconoce si permite uso comercial o tiene restricciones.
- El modelo está cuantizado a 5 bits, lo que puede degradar ligeramente la calidad de generación en comparación con el modelo original de precisión completa.
- El formato MLX safetensors solo es compatible con Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin conversión.
- El nombre "Qwen3.8-27B" es ambiguo y los parámetros reales (5.7B) no coinciden con 27B, lo que sugiere que podría tratarse de una variante MoE con 27B totales y 5.7B activos, pero no está confirmado.

## Enlaces

- [HuggingFace - d9beuD/Qwen3.8-27B-oQ5e-mtp](https://huggingface.co/d9beuD/Qwen3.8-27B-oQ5e-mtp)
- [Repositorio oMLX (oQ)](https://github.com/jundot/omlx)
