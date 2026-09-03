# airagrp/Qwen3.8-27B-QUASAR-NVFP4-mlx

## Resumen

Qwen3.8-27B-QUASAR-NVFP4-mlx es una conversión al runtime MLX de Apple del checkpoint `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4`, un modelo de 27 000 millones de parámetros basado en Qwen3.8-27B de Alibaba, sometido a entrenamiento consciente de cuantización (quantization-aware training, QAT) para operar en precisión NVFP4 (W4A4). El modelo resultante cuantiza la totalidad de sus 496 capas lineales —incluyendo self-attention, gated delta-net y MLP— en formato NVFP4 de 4 bits, manteniendo los pesos empaquetados bit-exactos respecto al checkpoint fuente.

La relevancia de este modelo reside en que ofrece una versión de Qwen3.8-27B con un tamaño de aproximadamente 19,15 GiB, lo que permite su ejecución en hardware Apple Silicon con memoria unificada moderada. Al tratarse de una conversión MLX nativa del formato `nvfp4-pack-quantized` de compressed-tensors, está optimizada para el runtime omlx / mlx-vlm, e incluye un cabezal MTP (multi-token prediction) como modelo de draft para decodificación especulativa. El modelo es multimodal (image-text-to-text) y conserva la arquitectura híbrida del Qwen3.8 original, que combina atención estándar con gated delta-net.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (self-attention + gated delta-net) con vision tower, 496 capas lineales NVFP4 |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen3.8-27B, no especificada en la informacion) |
| Tipos de cuantizacion | NVFP4 (W4A4), E2M1 para pesos, E4M3 para escalas por grupo |
| Idiomas soportados | no disponibles (hereda los del modelo base, no especificados) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (nvfp4 empaquetado en uint32 + escalas E4M3 en uint8 + pesos BF16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal con arquitectura hibrida que combina mecanismos de atención estándar con una capa gated delta-net, lo que permite manejar secuencias largas con complejidad subcuadrática. El checkpoint fuente `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4` fue sometido a quantization-aware training para operar en NVFP4, un formato de 4 bits con códigos E2M1 para los pesos y escalas E4M3 por grupo. La conversión a MLX mantiene los códigos E2M1 bit-exactos y pliega la escala global por tensor en las escalas por grupo, realizando un único re-redondeo de las escalas (tensor mucho más pequeño) como única diferencia de precisión respecto al checkpoint fuente.

El modelo incluye un cabezal MTP (multi-token prediction) de 15 tensores en un archivo separado (`mtp.safetensors`, 810 MiB) que actúa como modelo draft para decodificación especulativa. Los pesos de las normas del MTP incorporan el desplazamiento RMSNorm de +1.0 característico de MLX. El checkpoint fuente fue producido con el framework QUASAR (quantization-aware training), aunque los detalles del dataset de entrenamiento, número de tokens y metodología de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto multimodal: al ser una conversión de Qwen3.8-27B, conserva las capacidades de comprensión de imagen y texto del modelo base (image-text-to-text).
- Razonamiento y matemáticas: hereda las capacidades de razonamiento paso a paso del modelo base Qwen3.8-27B.
- Decodificación especulativa: incluye cabezal MTP para acelerar la generación mediante predicción multi-token.
- Cuantización NVFP4: todos los pesos lineales están en 4 bits, lo que reduce el footprint de memoria a aproximadamente 19,15 GiB.
- Ejecución nativa en Apple Silicon: formato MLX optimizado para el runtime omlx / mlx-vlm.
- Tool calling y function calling: no disponible en la información proporcionada, aunque es probable que herede las capacidades del modelo base.

## Casos de uso

- Inferencia multimodal en Mac con memoria unificada: el modelo cabe en equipos Apple Silicon con 32 GiB o más de RAM unificada, permitiendo ejecutar un modelo de 27B con visión en un portátil sin GPU dedicada.
- Prototipado de agentes con razonamiento visual: al ser image-text-to-text, puede usarse para tareas que requieran comprender capturas de pantalla o diagramas y razonar sobre ellos, con la ventaja de la decodificación especulativa MTP para reducir latencia.
- Despliegue en entornos con restricciones de memoria: la cuantización NVFP4 reduce el modelo a ~19 GiB, lo que permite servir un modelo de 27B en un solo nodo con menos VRAM que la versión BF16.
- Evaluación de técnicas QAT en producción: sirve como referencia para comparar el rendimiento de un modelo cuantizado con entrenamiento consciente de cuantización frente a una cuantización post-entrenamiento estándar.
- Generación de código asistida por visión: el modelo puede procesar imágenes de diagramas de arquitectura o wireframes y generar código o explicaciones, aprovechando la ventana de contexto del modelo base.
- Investigación en eficiencia de inferencia: la conversión MLX con NVFP4 permite estudiar el impacto de la cuantización W4A4 en la calidad de salida para tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de MMLU, HumanEval, GSM8K u otros estándares, y la búsqueda web no ha devuelto datos adicionales. Se recomienda consultar la ficha del modelo base Qwen3.8-27B para obtener referencias de rendimiento en BF16, teniendo en cuenta que la cuantización NVFP4 puede introducir degradación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19,15 GiB para los pesos (18,36 GiB de shards + 810 MiB del cabezal MTP), más overhead de activaciones y KV cache. En la práctica se recomienda un mínimo de 32 GiB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con 32 GiB o más de memoria unificada (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max/Ultra).
- No cabe en GPUs consumer convencionales (RTX 4090 con 24 GB VRAM podría cargar los pesos con cuantización adicional, pero el formato MLX está diseñado para Apple Silicon).
- Opciones de despliegue: runtime omlx / mlx-vlm en macOS; no es compatible directamente con vLLM, llama.cpp u Ollama al estar en formato MLX nativo.
- Latencia y throughput: no disponibles. La decodificación especulativa con el cabezal MTP debería mejorar la velocidad de generación respecto a la decodificación autorregresiva estándar, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-QUASAR-NVFP4-mlx (este) | 27,36 B | NVFP4 W4A4 | MLX | no disponible | no disponible |
| Qwen/Qwen3.8-27B (base) | 27,36 B | BF16 | safetensors | no disponible | no disponible |
| airagrp/Qwen3.8-27B-mlx-nvfp4-S | 27,36 B | NVFP4 | MLX | no disponible | no disponible |

La comparativa con alternativas de la misma categoría (modelos de 27B cuantizados a 4 bits en MLX) es limitada. Existe una variante similar publicada por el mismo autor (`airagrp/Qwen3.8-27B-mlx-nvfp4-S`), aunque no se dispone de detalles sobre sus diferencias. La principal alternativa es el modelo base en BF16, que requiere aproximadamente 55 GiB de memoria y no es viable en Apple Silicon sin cuantización adicional.

## Limitaciones y advertencias

- La licencia no está especificada en la información proporcionada, lo que impide determinar si es apto para uso comercial. Se debe contactar con el autor antes de cualquier despliegue en producción.
- No se han publicado benchmarks, por lo que se desconoce la degradación real de calidad respecto al modelo base en BF16.
- El formato MLX limita el despliegue a Apple Silicon; no es compatible con infraestructura GPU estándar (CUDA, ROCm) sin una conversión adicional.
- La cuantización NVFP4 de 4 bits puede introducir pérdida de precisión en tareas de razonamiento complejo o generación de código, especialmente en comparación con cuantizaciones de 8 bits.
- Los idiomas soportados y la longitud de contexto no están documentados en esta conversión; se heredan del modelo base pero no se confirman.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una publicación reciente sin validación comunitaria.
- La conversión introduce un re-redondeo de las escalas por grupo (E4M3) que, aunque mínimo, puede afectar ligeramente la calidad respecto al checkpoint fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-QUASAR-NVFP4-mlx
- Checkpoint fuente: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante similar del mismo autor: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-nvfp4-S
