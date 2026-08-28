# rkeshaw007/24B0908-Week03-Track1-40-Submission01

## Resumen

El modelo `rkeshaw007/24B0908-Week03-Track1-40-Submission01` es una submission de compresión de precisión mixta basada en el modelo `Qwen/Qwen3-4B-Instruct-2507`. Desarrollado por el usuario `rkeshaw007` como parte de un ejercicio académico (Week03, Track 1, objetivo 40% de compresión), aplica cuantización GPTQ únicamente a las capas MLP del transformer, manteniendo la atención en bf16. El resultado es un checkpoint de aproximadamente 3,74 GiB (frente a los 7,68 GiB del original), lo que supone una reducción del 46,4% del tamaño.

La relevancia de este modelo radica en demostrar que cuantizar selectivamente los componentes más pesados (MLP) en lugar de todo el modelo permite conservar una precisión razonable (30% en GPQA Diamond, 62% en MMLU-Pro) frente al colapso total que produce una cuantización uniforme a int3 (19% y 45% respectivamente). El trabajo incluye scripts de conversión y dequantización, así como un análisis detallado del proceso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int3 (MLP, group size 128) + bf16 (atención y embeddings) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint GPTQ (int3) y versión dequantizada a bf16 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B-Instruct-2507` y aplica cuantización GPTQ (Frantar et al.) exclusivamente a las proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`) con precisión int3 y group size 128. La atención se mantiene en bf16 completa. El proceso se implementa con `GPTQConfig.modules_in_block_to_quantize` para restringir el alcance, aunque el loader de `gptqmodel` no respeta este campo al recargar, por lo que se requiere un script adicional (`dequantize_to_bf16.py`) que restaura las capas de atención desde el modelo base tras la recarga. No se menciona entrenamiento adicional ni ajuste fino; se trata de una compresión post-entrenamiento.

La elección de cuantizar solo el MLP se justifica porque este componente concentra aproximadamente dos tercios de los parámetros del modelo, mientras que la atención es más sensible a la pérdida de precisión. Los resultados muestran que cuantizar ambos componentes simultáneamente degrada severamente la coherencia del modelo, mientras que mantener la atención en bf16 preserva la capacidad de respuesta.

## Capacidades

- Generación de texto y seguimiento de instrucciones, heredadas del modelo base Qwen3-4B-Instruct.
- Razonamiento y conocimiento general, evaluado en GPQA Diamond (30%) y MMLU-Pro (62%) en modo zero-shot con decodificación greedy.
- No se dispone de información sobre tool calling, capacidades multimodales o soporte de agentes.
- El modelo puede ejecutarse tanto con el checkpoint GPTQ (para inferencia acelerada en CUDA) como con la versión dequantizada a bf16 (para compatibilidad estándar).

## Casos de uso

- Despliegue en entornos con memoria limitada: al reducir el tamaño a 3,74 GiB, el modelo puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM, lo que lo hace adecuado para prototipos y aplicaciones edge.
- Inferencia de baja latencia en producción: la cuantización GPTQ permite acelerar los matmuls del MLP en GPUs Ampere o posteriores, reduciendo el tráfico de memoria y mejorando el throughput.
- Evaluación de técnicas de compresión: el repositorio sirve como referencia para estudiar el impacto de la cuantización selectiva en modelos de 4B, con scripts reproducibles y análisis de resultados.
- Generación de texto en aplicaciones donde la precisión no es crítica: por ejemplo, borradores de contenido, resúmenes informales o asistentes de chat básicos.
- Investigación académica sobre cuantización de precisión mixta: el enfoque de cuantizar solo el MLP puede replicarse en otros modelos para comparar trade-offs entre tamaño y rendimiento.
- Pruebas de compatibilidad con frameworks de inferencia: el checkpoint GPTQ puede cargarse con `gptqmodel` o ExLlama, mientras que la versión bf16 es compatible con cualquier stack estándar de HuggingFace.

## Benchmarks y rendimiento

Se reportan resultados de evaluación zero-shot con decodificación greedy y `max_new_tokens=4096`, con n=100 por benchmark, comparando el modelo comprimido contra el baseline bf16:

| Benchmark | Baseline (bf16) | Submission (int3 MLP, bf16 atención) |
|---|---|---|
| GPQA Diamond | 45% | 30% |
| MMLU-Pro | 72% | 62% |

La caída de precisión es de 15 puntos en GPQA y 10 en MMLU-Pro, pero el modelo mantiene coherencia y capacidad de respuesta, a diferencia de una cuantización uniforme a int3 que colapsa a 19% y 45% respectivamente.

## Requisitos de hardware

- Tamaño del checkpoint comprimido: ~3,74 GiB, lo que sugiere que cabe en GPUs con al menos 4 GB de VRAM si se usa el formato GPTQ directamente.
- La versión dequantizada a bf16 ocuparía aproximadamente 8 GB (para ~4B parámetros en bf16), requiriendo GPUs con 10-12 GB de VRAM para inferencia cómoda.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4090, A100, H100, dependiendo del formato elegido y la velocidad deseada.
- Opciones de despliegue: `gptqmodel` (con kernels Triton o ExLlama), `llama.cpp` (si se convierte a GGUF), HuggingFace Transformers con la versión bf16.
- No se proporcionan datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación directa se limita al baseline bf16 del mismo modelo base, como se muestra en la tabla de benchmarks.

## Limitaciones y advertencias

- La cuantización selectiva reduce la precisión en tareas de razonamiento complejo (GPQA cae de 45% a 30%), por lo que no es recomendable para aplicaciones donde la exactitud sea crítica.
- Riesgo de alucinaciones y errores factuales, inherente a los modelos de lenguaje y posiblemente acentuado por la pérdida de precisión en las capas MLP.
- No se especifican los idiomas soportados; se asume que hereda las capacidades multilingües del modelo base Qwen3-4B-Instruct, pero no está confirmado.
- La licencia no está declarada, lo que impide conocer las restricciones de uso comercial o redistribución.
- El proceso de restauración de pesos de atención depende del modelo base original; si se pierde el acceso a `Qwen/Qwen3-4B-Instruct-2507`, el checkpoint no puede reconstruirse completamente.
- La documentación menciona que la cuantización uniforme a int3 produce un colapso severo; este modelo evita ese problema, pero sigue siendo sensible a la elección de group size y bit width.

## Enlaces

- [HuggingFace: rkeshaw007/24B0908-Week03-Track1-40-Submission01](https://huggingface.co/rkeshaw007/24B0908-Week03-Track1-40-Submission01)
- [HuggingFace: rkeshaw007/24B0908-Week02-Track1-40-Submission01](https://huggingface.co/rkeshaw007/24B0908-Week02-Track1-40-Submission01) (referencia de una submission anterior con pruning)
- [Modelo base: Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507) (no verificado directamente, pero mencionado en la model card)
