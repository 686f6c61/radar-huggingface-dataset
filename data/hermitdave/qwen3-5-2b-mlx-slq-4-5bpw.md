# hermitdave/Qwen3.5-2B-MLX-slq-4.5bpw

## Resumen

Qwen3.5-2B-MLX-slq-4.5bpw es una cuantización mixta de precisión (SLQ, *Stochastic Layer-wise Quantization*) del modelo base Qwen/Qwen3.5-2B, empaquetada para su uso con MLX (el framework de Apple para Apple Silicon). El autor de la conversión es hermitdave, que la publica bajo licencia MIT con la librería `mlx-lm`. No se trata de un modelo nuevo, sino de una redistribución optimizada del checkpoint original de Qwen con un ancho de bits medio de 4,49 bpw.

El modelo base Qwen3.5-2B emplea la arquitectura `qwen3_5`, que combina Gated DeltaNet con atención híbrida, y consta de 24 capas con un tamaño oculto de 2048. La versión cuantizada mantiene el checkpoint empaquetado en memoria y en disco (formato `mlx-packed-affine`), lo que reduce el peso a aproximadamente 1,4 GiB frente a los 3,2 GiB del BF16 original, es decir, unas 2,3 veces menos.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco habitual (asignación greedy por capa con distintos anchos de bits) y, por otro, advierte de que el resultado no alcanza el umbral de "lossless" declarado por el propio autor (recuperación media de 0,9879 frente al umbral 0,99), un dato crítico para quien pretenda usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (Gated DeltaNet + atención híbrida) |
| Parámetros totales | 745.824.064 (según safetensors del repo); el autor declara ~2B en la model card, dato no coincidente |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | SLQ affine, group_size=64, ancho medio 4,49 bpw (distribución: ~35% 4-bit, ~50% 5-bit, ~12% 6-bit, ~3% 8-bit) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX packed (`mlx-packed-affine`), safetensors |
| Capas | 24 |
| Tamaño oculto | 2048 |
| Tamaño del repo | 1,9 GB |
| Tamaño empaquetado | ~1,4 GiB (frente a ~3,2 GiB en BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B utiliza la arquitectura `qwen3_5`, descrita en la model card como una combinación de Gated DeltaNet y atención híbrida. Se trata, por tanto, de un transformer híbrido que mezcla mecanismos de atención con capas de tipo DeltaNet (una familia de modelos de espacio de estados con compuertas), lo que en principio reduce el coste computacional en secuencias largas frente a la atención completa tradicional. La información disponible no detalla la composición exacta del dataset de entrenamiento del modelo base, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de esta ficha reside en el proceso de cuantización, no en el entrenamiento. El autor aplica SLQ mediante su herramienta `slq-mlx`: un pipeline en tres fases (Stage 1 multi-bitwidth por bloques, base de datos de errores en streaming y asignación heurística por capa) que decide qué capas reciben 4, 5, 6 u 8 bits. La calibración se realizó con FineWeb-Edu (131.072 tokens, 128 secuencias de 1024) y la evaluación con zero-shot emparejado sobre 400 ejemplos por tarea. El resultado es un checkpoint empaquetado con `nn.QuantizedLinear` que permanece comprimido tanto en disco como en memoria.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y respuesta a preguntas de tipo zero-shot, evaluado en arc_challenge, arc_easy, hellaswag, winogrande y mmlu.
- No hay evidencia en la información disponible de soporte de tool calling, function calling ni modo agente.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo "thinking" explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.
- El modelo hereda las capacidades del base Qwen3.5-2B, pero la cuantización introduce una pérdida media de recuperación del 1,2 % respecto a BF16, con mayor impacto en tareas como arc_easy (recuperación 0,9443).

## Casos de uso

- **Prototipado local en Apple Silicon**: cargar el modelo con `mlx-lm` en un Mac con chip M-series para experimentar con generación de texto sin depender de la nube; los ~1,4 GiB empaquetados permiten mantenerlo residente en memoria unificada junto con otras herramientas.
- **Evaluación de técnicas de cuantización**: usar este checkpoint como referencia para comparar SLQ frente a otras cuantizaciones (GPTQ, AWQ, GGUF Q4) sobre el mismo modelo base, midiendo la recuperación por tarea con el protocolo del autor (400 ejemplos emparejados).
- **Generación de texto en aplicaciones de escritorio**: integrar el modelo en apps macOS nativas mediante MLX para tareas de resumen, reescritura o autocompletado, donde el tamaño reducido y la latencia baja en memoria unificada son prioritarios.
- **Investigación sobre arquitecturas híbridas**: estudiar el comportamiento de Gated DeltaNet + atención híbrida en un modelo pequeño, comparando su rendimiento en tareas de razonamiento (arc, hellaswag) con transformers densos de tamaño similar.
- **Fine-tuning ligero o adaptación posterior**: partir de un checkpoint de 4,49 bpw para experimentos de adaptación con LoRA en MLX, aunque la pérdida de fidelidad respecto a BF16 debe tenerse en cuenta antes de usarlo como base.
- **Docencia y demostraciones**: ilustrar en clase o en un blog cómo se distribuye el ancho de bits por capa (`slq_bits` en `config.json`) y cómo afecta a métricas concretas, con datos de recuperación públicos y reproducibles.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de fidelidad de la cuantización publicados por el autor, medidos con zero-shot emparejado y un tope de 400 ejemplos por tarea (el conjunto completo ronda los 15.500 ejemplos por tarea, por lo que los intervalos de confianza son amplios).

| Tarea | BF16 | SLQ 4,49 bpw | Recuperación | IC 95% |
|---|---|---|---|---|
| arc_challenge | 0,3825 | 0,3775 | 0,9869 | [0,9710, 1,0028] |
| arc_easy | 0,7175 | 0,6775 | 0,9443 | [0,9300, 0,9586] |
| hellaswag | 0,4150 | 0,4225 | 1,0181 | [1,0049, 1,0313] |
| winogrande | 0,5275 | 0,5075 | 0,9621 | [0,9462, 0,9780] |
| mmlu | 0,3575 | 0,3675 | 1,0280 | [1,0082, 1,0478] |
| **Media** | — | — | **0,9879** | — |

Veredicto del autor: **no lossless** (umbral ≥ 0,99). No se han publicado resultados de benchmarks estándar (MMLU completo, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM/memoria unificada estimada**: ~1,4 GiB para el checkpoint empaquetado, más overhead de activaciones y caché KV (no cuantificado en la información disponible).
- **GPU compatibles**: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no es compatible con CUDA ni con GPUs NVIDIA/AMD.
- **Consumer GPU**: sí, en cualquier Mac con memoria unificada de 8 GB o superior; el modelo cabe holgadamente.
- **Opciones de despliegue**: `mlx-lm` (librería oficial), con carga mediante `load(..., trust_remote_code=True)`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `mlx-packed-affine`.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-MLX-slq-4.5bpw (este) | 745,8 M (safetensors) / ~2B (declarado) | no disponible | SLQ 4,49 bpw, MLX | MIT | Hugging Face, solo MLX |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | BF16 | MIT (según repo derivado) | Hugging Face |
| Otras cuantizaciones del mismo base (GGUF, AWQ) | ~2B | no disponible | 4-bit típico | MIT | no disponible en la información |

La comparación con alternativas de la misma categoría (modelos de ~2B para generación de texto) no puede completarse con datos de la información proporcionada; no se dispone de métricas de modelos comparables.

## Limitaciones y advertencias

- **No es lossless**: la recuperación media es 0,9879, por debajo del umbral 0,99 que el propio autor fija; arc_easy cae al 0,9443, una degradación notable para tareas de sentido común básico.
- **Evaluación limitada**: solo 400 ejemplos por tarea, con intervalos de confianza que en varios casos cruzan la unidad; los resultados no son concluyentes a escala completa.
- **Discrepancia en el recuento de parámetros**: el repo declara 745,8 M en safetensors mientras la model card indica ~2B; conviene verificar antes de asumir el tamaño real del modelo.
- **Sesgos**: no disponibles en la información proporcionada; se heredan los del modelo base Qwen3.5-2B, no documentados aquí.
- **Riesgo de alucinación**: no cuantificado; el modelo base es pequeño (~2B) y la cuantización añade ruido, por lo que la fiabilidad en tareas factuales debe validarse empíricamente.
- **Restricciones de plataforma**: el formato `mlx-packed-affine` solo es utilizable con MLX en Apple Silicon; no hay ruta de despliegue en servidores Linux/NVIDIA.
- **Licencia**: MIT, lo que permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.5-2B por si impone condiciones adicionales.
- **Idiomas y contexto**: sin datos; no se puede garantizar soporte multilingüe ni una ventana de contexto concreta.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado sin validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hermitdave/Qwen3.5-2B-MLX-slq-4.5bpw)
- [Modelo base Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Repositorio slq-mlx (herramienta de cuantización)](https://github.com/hermitdave/slq-mlx)
- [Librería mlx-lm](https://github.com/ml-explore/mlx-lm)
