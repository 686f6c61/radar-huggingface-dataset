# gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090

## Resumen

El modelo `Qwen3.8-27B-NVFP4-RTX5090` es un checkpoint cuantizado del modelo de lenguaje `Qwen/Qwen3.8-27B` de Alibaba, optimizado específicamente para la tarjeta gráfica NVIDIA GeForce RTX 5090 (arquitectura Blackwell) mediante la herramienta NVIDIA Model Optimizer. El objetivo es permitir ejecutar un modelo de 27B con su contexto nativo completo de 262 144 tokens en una GPU de 32 GB, algo que no es posible con el modelo original en BF16 (que ocupa unos 53 GB) ni con otras cuantizaciones como la de Unsloth, que limita el contexto útil a unos 77 000 tokens en esa misma GPU.

El checkpoint reduce los pesos a formato NVFP4 (punto flotante de 4 bits) con grupo de cuantización de 16, y utiliza caché KV en FP8. Esto permite que los pesos ocupen unos 17,1 GB en VRAM, dejando espacio suficiente para una ventana de contexto de 256k. Según las pruebas del autor, alcanza una velocidad de decodificación de 88,5 tokens por segundo en solitario, y 180,3 tokens por segundo si se combina con el drafter especulativo `Qwen3.8-27B-DSpark-NVFP4` (también cuantizado en NVFP4). La precisión se mantiene prácticamente intacta respecto a la cuantización de Unsloth en una prueba interna de 20 ítems por tarea.

Es un modelo relevante para desarrolladores que necesitan desplegar modelos de razonamiento con contexto muy largo en hardware de consumo, aprovechando al máximo las capacidades de los tensor cores FP4 de Blackwell. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.8-27B) |
| Parametros totales | 14 982 247 152 (según safetensors; el nombre del modelo indica 27B, discrepancia no explicada) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4 (W4A4, group size 16), FP8 para caché KV |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, ~18,8 GB de exportación) |

## Arquitectura y entrenamiento

El modelo es un checkpoint cuantizado, no un modelo entrenado desde cero. La arquitectura subyacente corresponde a `Qwen/Qwen3.8-27B`, un transformer de lenguaje con capacidades de razonamiento (modo thinking) y soporte para tool calling, desarrollado por Alibaba. No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada.

La cuantización se realizó con NVIDIA Model Optimizer en formato NVFP4, que utiliza punto flotante de 4 bits para pesos y activaciones, con un tamaño de grupo de 16. La caché KV se almacena en FP8. Esta combinación está diseñada para aprovechar los tensor cores FP4 de la arquitectura Blackwell (SM120) y es exclusiva de la RTX 5090; no es compatible con GPUs de generaciones anteriores (Hopper, Ampere, etc.). El autor también ha entrenado un drafter especulativo (`Qwen3.8-27B-DSpark-NVFP4`) cuantizado específicamente contra este checkpoint, que acelera la decodificación un 104 % adicional sin cambiar las salidas.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking activable o desactivable mediante `chat_template_kwargs`.
- Soporte de tool calling / function calling (probado con 5/5 llamadas correctas en la prueba interna).
- Compatible con agentes y razonamiento de múltiples pasos gracias a su modo de razonamiento y a la ventana de contexto de 256k.
- Capacidades multilingües: no documentadas explícitamente, aunque el modelo base de Qwen suele ser multilingüe.
- Capacidades de visión: la etiqueta del pipeline en HuggingFace indica `image-text-to-text`, pero la model card no menciona ningún detalle sobre procesamiento de imágenes. No se puede confirmar si el checkpoint conserva capacidades multimodales.
- Soporte de decodificación especulativa opcional mediante el drafter DSpark (no incluido en este repo, disponible por separado).

## Casos de uso

- Asistentes de conversación con contexto muy largo: el modelo puede mantener conversaciones de más de 200 000 tokens, lo que permite procesar libros completos, transcripciones largas o historiales de chat extensos sin perder información.
- Análisis y resumen de documentos legales o técnicos: su ventana de 256k permite ingerir contratos, informes o papers completos en una sola pasada y generar resúmenes o extraer conclusiones.
- Generación de código con tool calling: puede integrarse en pipelines de desarrollo donde necesite invocar funciones externas (por ejemplo, ejecutar tests, consultar APIs) mientras razona sobre el contexto del proyecto.
- Razonamiento científico y matemático: su modo thinking permite abordar problemas complejos de GPQA, AIME o MMLU-Pro, aunque la precisión exacta no está publicada de forma oficial.
- Desarrollo de agentes autónomos: la combinación de tool calling, razonamiento y contexto largo lo hace adecuado para agentes que deben planificar y ejecutar múltiples pasos sobre grandes volúmenes de información.
- Investigación en cuantización y despliegue eficiente: sirve como referencia para estudiar el impacto de NVFP4 en precisión y rendimiento sobre hardware Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales completos. El autor incluye una prueba interna (smoke test) de 20 ítems por tarea en GPQA Diamond, AIME 2025 y MMLU-Pro, comparando este checkpoint con la cuantización NVFP4 de Unsloth sobre la misma GPU y el mismo stack de vLLM. Los resultados son los siguientes:

| Tarea | Este checkpoint | Unsloth NVFP4 | Diferencia |
|---|---|---|---|
| GPQA Diamond | 13/20 (65 %) | 14/20 (70 %) | -1 |
| AIME 2025 | 15/20 (75 %) | 14/20 (70 %) | +1 |
| MMLU-Pro | 17/20 (85 %) | 17/20 (85 %) | 0 |
| **Overall** | **45/60 (75 %)** | **45/60 (75 %)** | **0** |

El autor advierte que se trata de una prueba con solo 20 ítems por tarea y que algunos fallos se debieron a truncamientos por longitud (el modo thinking agotó el límite de generación), por lo que no deben interpretarse como puntuaciones oficiales. Tampoco se aportan datos de latencia o throughput más allá de los valores de decodificación mencionados en la model card (88,5 tok/s solo, 180,3 tok/s con drafter).

## Requisitos de hardware

- GPU exclusiva: NVIDIA GeForce RTX 5090 (32 GB, arquitectura Blackwell, SM120). No funciona en GPUs Hopper, Ampere o anteriores.
- VRAM: los pesos ocupan ~17,1 GB; con contexto 256k y `gpu-memory-utilization=0.97` se alcanza el límite de la tarjeta.
- No cabe en GPUs de consumo de 16 GB o menos.
- Despliegue recomendado: vLLM 0.27.x con `--quantization modelopt`, `--kv-cache-dtype fp8` y `--max-model-len 262144`. También existe un Dockerfile de referencia en el repositorio de GitHub.
- Latencia: decodificación de 88,5 tok/s (concurrencia 1) sin drafter; 180,3 tok/s con el drafter DSpark. TTFT a ~62k tokens: 8,52 s.
- Primer arranque: requiere compilación JIT de kernels FlashInfer SM120 FP4 (necesita `nvcc` y CUDA 13 headers). Se recomienda limitar el paralelismo con `MAX_JOBS=2` en equipos con poca RAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | VRAM en RTX 5090 | Decodificación (tok/s) | Licencia |
|---|---|---|---|---|---|
| **Qwen3.8-27B-NVFP4-RTX5090** (este) | 27B nominal / 14,98B según safetensors | 262 144 | ~17,1 GB | 88,5 (solo) / 180,3 (con drafter) | Apache 2.0 |
| Unsloth NVFP4 (`unsloth/Qwen3.8-27B-NVFP4`) | 27B | ~77k (limitado por VRAM) | ~22,7 GB | 42,4 | Apache 2.0 |
| Qwen3.8-27B original (BF16) | 27B | 262 144 | ~53 GB (no cabe en 32 GB) | no disponible | Apache 2.0 |

La comparativa se limita a variantes del mismo modelo base. No se dispone de información sobre otros modelos comparables (por ejemplo, Llama 3.1 8B o Mistral 7B) en el contexto de esta ficha.

## Limitaciones y advertencias

- Compatibilidad restringida: el checkpoint solo funciona en GPUs Blackwell (RTX 5090). Intentar cargarlo en otras arquitecturas produce un error, aunque los archivos se puedan descargar.
- Discrepancia en el número de parámetros: los archivos safetensors contienen 14 982 247 152 parámetros, mientras que el nombre del modelo indica 27B. No se ha encontrado explicación para esta diferencia; podría tratarse de un error en el etiquetado o en la exportación.
- Precisión no verificada oficialmente: los únicos datos de calidad provienen de una prueba interna de 20 ítems por tarea, no de benchmarks estandarizados. No se recomienda utilizar estos números para decisiones críticas.
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos, pero al ser un modelo cuantizado, puede presentar degradación en tareas que requieren alta precisión numérica o razonamiento largo.
- Limitaciones de contexto en la práctica: aunque el contexto nativo es de 262 144 tokens, el modo thinking puede consumir una parte significativa del límite de generación, provocando truncamientos en respuestas largas (observado en la prueba interna).
- Sin garantía de capacidades multimodales: a pesar de la etiqueta `image-text-to-text`, no hay evidencia en la documentación de que este checkpoint procese imágenes. Se recomienda verificar antes de usarlo en tareas de visión.
- Dependencia de vLLM 0.27.x: versiones anteriores o posteriores pueden no ser compatibles con la cuantización ModelOpt NVFP4.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Drafter especulativo Qwen3.8-27B-DSpark-NVFP4](https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4)
- [Repositorio de despliegue Docker en GitHub](https://github.com/devbauerflorian/qwen3.8-27b-rtx5090)
- [NVIDIA Model Optimizer](https://github.com/NVIDIA/Model-Optimizer)
- [Ficha en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-nvfp4-rtx5090-gittensor-model-hub)
- [Ficha en llm-explorer](https://llm-explorer.com/model/gittensor-model-hub%2FQwen3.8-27B-NVFP4-RTX5090,3GTDSJKETUAS2CtkUTm8Er)
