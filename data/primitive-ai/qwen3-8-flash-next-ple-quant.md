# primitive-ai/Qwen3.8-Flash-Next-PLE-quant

## Resumen

Este repositorio contiene las tablas PLE (n-gram) cuantizadas del modelo Qwen3.8-Flash-Next, desarrollado por Qwen y adaptado por primitive-ai para reducir drásticamente los requisitos de memoria RAM del host en despliegues con CPU offload. El modelo base es un MoE multimodal ultra-sparse de 125B parámetros (incluyendo una tabla n-gram de 51.2B) que activa solo 6B parámetros por token, con una ventana de contexto de 262K tokens y arquitectura híbrida GDN + QSA. La cuantización presentada aquí sustituye la tabla BF16 original (95.4 GB) por versiones FP8 per-row (49 GB) o INT4 group-16 (32 GB), permitiendo servir el modelo completo en un solo GPU de 96 GB con un uso de RAM de host mucho menor, manteniendo un rendimiento casi idéntico en generación y precisión.

La relevancia de esta ficha radica en que aborda uno de los principales cuellos de botella del modelo original: la tabla n-gram ocupa más de 95 GB en BF16, lo que obliga a disponer de una gran cantidad de RAM de host incluso cuando se usa CPU offload. Con esta cuantización, la tabla se sirve mediante memory-mapping desde disco, y la RAM consumida se convierte en page cache reclamable bajo presión de memoria. El repositorio incluye un overlay para la imagen oficial de vLLM que permite cargar las tablas cuantizadas sin modificar el código fuente del servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con GDN (Gated DeltaNet) + QSA (Qwen Sparse Attention), tabla n-gram PLE de 51.2B parametros |
| Parametros totales | 125B (incluyendo la tabla n-gram de 51.2B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | Tablas PLE: FP8 per-row (49 GB) e INT4 group-16 (32 GB); el resto del modelo puede servirse en NVFP4/FP8 (checkpoint mixto) o NVFP4 puro |
| Idiomas soportados | no disponible (el modelo base de Qwen suele ser multilingue, pero no se especifica en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards de 128 archivos para las tablas, mas META.json; el checkpoint base en safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA). Tres de cada cuatro capas utilizan GDN para comprimir el historial de forma eficiente, mientras que la cuarta capa usa QSA para recuperación precisa de contexto largo. Además, incorpora una tabla n-gram (PLE) de 51.2B parámetros que actúa como memoria externa de patrones léxicos, lo que eleva el total a 125B parámetros aunque solo se activan 6B por token. El modelo es multimodal (acepta texto e imágenes) y soporta razonamiento avanzado, tool calling y decodificación especulativa MTP (Multi-Token Prediction) con `num_speculative_tokens: 3`.

La cuantización de las tablas PLE se ha realizado a partir de las tablas BF16 originales, sin reentrenamiento. Se ofrecen dos variantes: FP8 per-row (escala por fila) e INT4 group-16 (escala por grupo de 16 elementos). El overlay de vLLM mapea cada shard con safetensors nativo y decuantiza solo las filas necesarias en cada paso de decodificación (~100-200 KB por token), de modo que el coste de arranque y la RAM en estado estable escalan con el conjunto de trabajo, no con el tamaño total de la tabla.

## Capacidades

- Generación de texto y razonamiento avanzado (thinking mode) gracias al modelo base Qwen3.8-Flash-Next.
- Soporte multimodal: entrada de texto e imágenes (el modelo base es multimodal).
- Tool calling / function calling: el modelo base soporta el parser `qwen3_coder` y `--enable-auto-tool-choice`.
- Capacidades de agente y razonamiento multi-paso, con soporte de `--reasoning-parser qwen3`.
- Decodificación especulativa MTP (Multi-Token Prediction) que se compone bien con las tablas cuantizadas, alcanzando 129.6 tok/s en single-stream con la tabla INT4.
- Multilingüe: no se especifican idiomas concretos, pero el modelo base de Qwen suele cubrir múltiples lenguas.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en un solo GPU de 96 GB (por ejemplo, RTX PRO 6000 Blackwell) con requisitos de RAM de host reducidos: la cuantización INT4 (32 GB) permite ejecutar el modelo en servidores con 64 GB de RAM, algo inviable con la tabla BF16 original (95 GB).
- Inferencia de baja latencia en producción: con la tabla FP8 se obtienen 80.3 tok/s en single-stream y 489.7 tok/s con batch 32, con un TTFT de 759 ms, adecuado para aplicaciones interactivas.
- Servicio de chat con tool calling: el modelo mantiene una precisión de llamada a herramientas del 77.5% (FP8) y 79.5% (INT4) en un protocolo de 200 ítems, suficiente para asistentes que necesitan invocar APIs externas.
- Razonamiento de contexto largo: con 262K tokens de ventana, puede procesar documentos extensos, codebases completos o conversaciones multi-turno largas, usando la tabla cuantizada para mantener el coste de memoria bajo.
- Generación de código asistida por MTP: la decodificación especulativa con 3 tokens adicionales acelera la generación hasta 129.6 tok/s, útil en entornos de desarrollo integrado (IDE) o pipelines de CI/CD.
- Evaluación de modelos en entornos con recursos limitados: la cuantización permite probar el modelo completo en hardware de gama media sin necesidad de un servidor con cientos de GB de RAM.

## Benchmarks y rendimiento

La siguiente tabla resume las mediciones realizadas por primitive-ai en un sistema con una RTX PRO 6000 Blackwell (96 GB), 176 GB de RAM de host y NVMe local, usando el checkpoint mixto NVFP4/FP8. La precisión se evaluó con un protocolo fijo de 1,170 ítems de conocimiento y 200 ítems de tool calling, con el modo de razonamiento activado.

| Tabla | Tamano | Host RSS | Tiempo de arranque | tok/s @ 1 | tok/s @ 32 | TTFT @ 1 | Conocimiento | Tool call acc |
|---|---|---|---|---|---|---|---|---|
| BF16 en RAM (baseline) | 95.4 GB | ~95 GB | 302 s | 84.5 / 84.4 | 516.8 / 523.6 | 569 / 573 ms | 92.2 | 84.8 (n=3) |
| FP8 per-row, mmapped | 49 GB | 52.6 GB | 364 s | 80.3 / 80.1 | 489.7 / 500.7 | 759 / 768 ms | 92.2 | 77.5 (n=1) |
| INT4 group-16, mmapped | 32 GB | 32.9 GB | 333 s | 80.2 / 80.1 | 483.6 / 487.9 | 663 / 671 ms | 92.9 | 79.5 (n=1) |

Nota: los valores de RSS marcados con ° corresponden a páginas de archivo mapeadas, reclamables bajo presión de memoria, no a RAM anónima. Las ejecuciones individuales de tool calling se sitúan dentro de la dispersión de repetición de ±1.5 del conjunto (la columna BF16 muestra la media de tres ejecuciones publicada). Con MTP (num_speculative_tokens: 3), la tabla INT4 alcanza 129.6 tok/s en single-stream, frente a 142.6 tok/s con la tabla BF16 en RAM y 77.5-82.3 tok/s con la tabla BF16 en NVMe.

## Requisitos de hardware

- VRAM: el modelo completo requiere una GPU con al menos 96 GB de VRAM (probado en RTX PRO 6000 Blackwell). No cabe en GPUs de consumo como RTX 4090 (24 GB) ni en la mayoría de GPUs profesionales de gama media.
- RAM de host: con la tabla BF16 original se necesitan ~95 GB de RAM; con FP8 se reduce a ~52.6 GB y con INT4 a ~32.9 GB (page cache reclamable). Esto permite desplegar en servidores con 64 GB de RAM usando la variante INT4.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), o cualquier GPU con 96 GB o más (por ejemplo, A100 80GB no es suficiente, se necesitaría 96 GB o más; H100 94 GB podría funcionar con margen ajustado).
- Opciones de despliegue: vLLM con la imagen `vllm/vllm-openai:qwen38-flash-next` y el overlay proporcionado. No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: con la tabla INT4, TTFT de 663-671 ms y throughput de 80.2 tok/s en single-stream, 483.6-487.9 tok/s con batch 32. Con MTP, 129.6 tok/s en single-stream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B (51B tabla n-gram) | 262K | BF16 (tabla) | Apache-2.0 | HuggingFace |
| primitive-ai/Qwen3.8-Flash-Next-PLE-quant (este repo) | 125B (tabla cuantizada) | 262K | FP8/INT4 (tabla) | Apache-2.0 | HuggingFace |
| primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8 | 125B | 262K | NVFP4/FP8 (todo el modelo) | Apache-2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada. La principal diferencia entre las variantes es el formato de cuantización de la tabla n-gram y del resto de pesos, lo que afecta a los requisitos de RAM y al rendimiento medido.

## Limitaciones y advertencias

- La cuantización de las tablas PLE reduce ligeramente la precisión en tool calling: 77.5% (FP8) y 79.5% (INT4) frente al 84.8% de la tabla BF16 en RAM. Aunque las ejecuciones individuales se solapan con la dispersión del baseline, se recomienda validar en el caso de uso concreto.
- El overlay de vLLM está diseñado específicamente para la imagen `vllm/vllm-openai:qwen38-flash-next` y no es un parche general; cualquier cambio en la imagen o en el código de vLLM puede romper la compatibilidad.
- La tabla cuantizada solo funciona con checkpoints que mantengan las tablas PLE originales (por ejemplo, los builds de primitive-ai o el modelo original). No es compatible con checkpoints que hayan re-cuantizado las tablas por su cuenta.
- El modelo base es multimodal y de gran tamaño; no se han documentado sesgos específicos, pero al ser un modelo de 125B entrenado con datos web, es probable que presente sesgos comunes de este tipo de modelos (estereotipos, contenido tóxico, etc.).
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación para esta cuantización; se asume el mismo comportamiento que el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el uso cumpla con las políticas de Qwen y de los proveedores de hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-PLE-quant
- Checkpoint mixto NVFP4/FP8: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8
- Checkpoint NVFP4 puro: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4
- Repositorio del modelo base (GitHub): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Página del modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- PR de vLLM para el camino BF16 en disco: https://github.com/vllm-project/vllm/pull/54070
