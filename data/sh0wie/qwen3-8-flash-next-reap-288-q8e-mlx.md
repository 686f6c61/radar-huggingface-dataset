# sh0wie/Qwen3.8-Flash-Next-REAP-288-Q8E-MLX

## Resumen

El modelo `sh0wie/Qwen3.8-Flash-Next-REAP-288-Q8E-MLX` es una versión podada y cuantizada del modelo multimodal ultra-sparse MoE Qwen3.8-Flash-Next de Qwen, adaptada para ejecutarse en hardware Apple Silicon mediante el runtime MLX. El autor, sh0wie, aplica el algoritmo de poda REAP (saliency-based pruning) para reducir los 512 expertos por capa MoE a 288, calibrando sobre un corpus de ~686K tokens de tráfico agentic de codificación. Los tensores de los expertos supervivientes se re-cuantizan a 8 bits (grupo de 64), mientras que el backbone (atención, DeltaNet, normas, embeddings) permanece en 4 bits, lo que resulta en un modelo de la clase 180B parámetros (125B principales + 51B de tabla n-gram) con un peso total de 107.5 GB en disco.

Esta build concreta existe para usuarios que desean un margen extra de precisión en los expertos, aunque el propio autor advierte que en sus mediciones la versión 4-bit del mismo prune (REAP-288-MLX-4bit) obtiene resultados iguales o mejores en la mayoría de las pruebas, por lo que recomienda esa variante para la mayoría de los casos. El modelo se integra sin parches en `mlx-vlm` (con soporte `qwen4_exp` MTP) y ofrece un modo de lectura de la tabla n-gram desde NVMe que reduce la memoria residente de ~100 GB a ~70 GB, permitiendo su uso en Macs con 128 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 48 capas alternando Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), con 288 expertos por capa (podado desde 512) y routing top-10 |
| Parametros totales | 29.696.177.491 (pesos cuantizados en safetensors; el modelo base declara 125B principales + 51B de tabla n-gram, clase 180B) |
| Parametros activos | 6B por token (del modelo base; no se especifica variación tras la poda) |
| Longitud de contexto | 262K tokens (del modelo base) |
| Tipos de cuantizacion | Expertos (`gate_proj`/`up_proj`/`down_proj`) en 8-bit, group size 64; backbone en 4-bit, group size 64 (tabla n-gram group size 32) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura ultra-sparse MoE con 125B parámetros principales más una tabla n-gram de 51B, activando solo 6B parámetros por token. De sus 48 capas, tres de cada cuatro usan Gated DeltaNet para comprimir el historial y la cuarta usa Qwen Sparse Attention para recuperación precisa de largo alcance. Cada capa MoE contiene originalmente 512 expertos, de los cuales se seleccionan 10 mediante routing.

La versión REAP-288-Q8E aplica poda por saliencia (REAP) calibrada sobre los pesos cuantizados del modelo base, reduciendo los expertos de 512 a 288 por capa. El proceso de calibración se realizó sobre ~686K tokens de tráfico agentic de codificación. Tras la poda, los tensores de los expertos supervivientes se re-cuantizaron a 8 bits (group size 64), mientras que el resto de la red permanece en 4 bits. Se corrigieron dos defectos de la conversión MLX original: los tensores RMSNorm se re-centraron a la convención zero-centered esperada por el runtime, y los tensores de la tabla n-gram se renombraron de `shard_N` a `shards.N` para coincidir con la ruta del módulo. La verificación con runtime stock muestra una diferencia máxima absoluta de 0.0 en el logit de la última posición de prefill respecto a la referencia con parche.

## Capacidades

- Generación de texto y razonamiento de propósito general, con especialización en tareas de codificación y ofimática según el modelo base.
- Razonamiento multi-step y soporte de agentes: el modelo base supera a Claude-4.6-Opus (Max) en agentic coding, visión y chat según los resultados oficiales de Qwen.
- Capacidades multimodales: el modelo base acepta entrada de imagen y texto (pipeline `image-text-to-text`); los pesos del vision tower están intactos en esta build, pero no han sido evaluados tras la poda.
- Soporte de tool calling / function calling: heredado del modelo base, aunque no se ha verificado explícitamente en esta variante.
- Decodificación especulativa: compatible con el drafter MTP complementario (`sh0wie/Qwen3.8-Flash-Next-MTP-Drafter-MLX-bf16`), con tasas de aceptación del 44-68% y aceleraciones de 1.5-2.6x en GPUs M5-class.
- Modo NVMe n-gram: permite servir la tabla n-gram de 51B desde disco sin cargarla en memoria, reduciendo el consumo residente de ~100 GB a ~70 GB con logits idénticos al modo en memoria.

## Casos de uso

- Desarrollo de código asistido en local: el modelo puede refactorizar funciones, añadir validación de entrada o generar tests directamente en una Mac con 128 GB de memoria unificada, usando el comando `mlx_vlm.generate` con un prompt específico.
- Agentes de codificación autónomos: gracias a su capacidad de razonamiento multi-step y su calibración sobre tráfico agentic de codificación, puede integrarse en pipelines de CI/CD para revisión de código, generación de parches o resolución de issues.
- Servidor OpenAI-compatible para equipos pequeños: el comando `mlx_vlm.server` expone una API compatible con OpenAI en el puerto 8080, permitiendo conectar herramientas como LangChain, LlamaIndex o IDEs a un modelo local sin dependencias externas.
- Investigación en poda y cuantización de MoE: el repositorio incluye el manifiesto `reap_kept_experts.json` que hace reproducible el proceso de poda desde la conversión fuente, útil para estudiar el impacto de la saliencia en modelos ultra-sparse.
- Evaluación de trade-offs precisión vs. memoria: esta build Q8E permite comparar empíricamente el efecto de la precisión de los expertos frente a la variante 4-bit del mismo prune, en escenarios como HumanEval o muestreo de nombres raros.
- Despliegue en entornos con memoria limitada: con el modo NVMe n-gram, el modelo cabe en una Mac de 128 GB dejando margen de trabajo, habilitando inferencia local de un modelo de clase 180B sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

El autor reporta resultados de HumanEval pass@1 para esta build y sus alternativas, medidos en una única ejecución sin intervalos de confianza:

| Modelo | HumanEval pass@1 |
|---|---|
| Base Q4 (512 expertos, 4-bit) | 93.9% |
| REAP-288 4-bit (expertos 4-bit) | 91.5% |
| **REAP-288 Q8E (este build, expertos 8-bit)** | **90.9%** |

Además, en una evaluación de adherencia a convenciones de estilo (no replicada), esta build superó a la variante 4-bit. La fiabilidad de muestreo de nombres raros fue de 9 de 10 aciertos, igual que la variante 4-bit. No se han publicado resultados adicionales (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: ~70 GB de memoria residente con el modo NVMe n-gram activado (medido como pico de 70.4 GiB en MLX durante una ejecución greedy corta); ~100 GB si la tabla n-gram se carga completamente en memoria, lo que no deja margen de trabajo en una Mac de 128 GB.
- GPU recomendadas: diseñado para Apple Silicon; el autor menciona GPUs M5-class para decodificación especulativa (aceleración 1.5-2.6x), mientras que en M4 el speedup es aproximadamente break-even.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por su tamaño; requiere hardware con memoria unificada de al menos 128 GB.
- Opciones de despliegue: `mlx-vlm` (generación y servidor OpenAI-compatible), con soporte de decodificación especulativa mediante drafter MTP. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia/throughput: no se proporcionan cifras concretas; el autor indica que la velocidad depende de la capacidad del hardware para ejecutar el paso de verificación de la decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base, 512 expertos, 4-bit MLX) | 125B + 51B n-gram | 262K | 93.9% | qwen-community-license-1.0 | HuggingFace |
| sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit | 125B + 51B n-gram (288 expertos, 4-bit) | 262K | 91.5% | qwen-community-license-1.0 | HuggingFace |
| **sh0wie/Qwen3.8-Flash-Next-REAP-288-Q8E-MLX (este build)** | 125B + 51B n-gram (288 expertos, 8-bit) | 262K | 90.9% | qwen-community-license-1.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de benchmarks para otros modelos MoE de tamaño similar en la información proporcionada. El autor recomienda la variante 4-bit sobre esta Q8E para la mayoría de los usuarios, dado que el error de poda domina sobre el error de cuantización en este ancho.

## Limitaciones y advertencias

- Calibración específica de dominio: la poda se calibró sobre un corpus de tráfico agentic de codificación de un solo equipo; los dominios alejados de la programación pueden degradarse más que los evaluados.
- Evaluaciones de una sola ejecución sin intervalos de confianza: diferencias de uno o dos puntos entre builds vecinas están dentro del ruido.
- Fiabilidad de muestreo de nombres raros: 9 de 10 aciertos; se recomienda limpiar el contexto tras un nombre visiblemente corrupto, ya que la corrupción condiciona los turnos posteriores.
- Visión no probada: los pesos del vision tower están intactos, pero no se ha evaluado la calidad de las respuestas multimodales tras la poda.
- La licencia qwen-community-license-1.0 impone restricciones de uso comercial; debe revisarse el texto completo de la licencia antes de desplegar en producción.
- El modo NVMe n-gram requiere un parche de lectura a nivel de fila que no está integrado en `mlx-vlm` upstream; sin ese parche, la memoria residente sube a ~100 GB, lo que no deja margen en una Mac de 128 GB.
- El autor no recomienda esta build como opción por defecto; la variante 4-bit del mismo prune ofrece mejor equilibrio entre rendimiento y memoria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-Q8E-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Conversión MLX 4-bit de referencia: https://huggingface.co/Sawfwair/Qwen3.8-Flash-Next-MLX-4bit
- Drafter MTP complementario: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-MTP-Drafter-MLX-bf16
- Variante 4-bit del mismo prune: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Recetas de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
