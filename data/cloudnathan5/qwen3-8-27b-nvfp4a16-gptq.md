# cloudnathan5/Qwen3.8-27B-NVFP4a16-GPTQ

## Resumen

El modelo `cloudnathan5/Qwen3.8-27B-NVFP4a16-GPTQ` es una cuantización NVFP4 (W4A16) del modelo multimodal Qwen3.8-27B de Alibaba, producida con la librería `llm-compressor` de vLLM y guardada en formato `compressed-tensors`. El checkpoint reduce el tamaño del modelo base de 55,6 GB a 28,6 GB (1,95x más pequeño) manteniendo las activaciones en BF16, lo que evita la dependencia de los tensor cores FP4 de las GPUs Blackwell y reduce el riesgo de pérdida de precisión frente a la variante W4A4.

La cuantización utiliza GPTQ (compensación de error basada en Hessiana) para seleccionar los pesos FP4, dejando en BF16 los módulos sensibles como `lm_head`, `embed_tokens`, la torre de visión, las rutas de atención lineal, los gates de MoE y la cabeza de predicción multi-token (MTP). El resultado es un modelo que mantiene una perplexidad casi idéntica al BF16 (+2,37% en wikitext-2) y que puede ejecutarse en cualquier GPU soportada por vLLM, sin requerir hardware Blackwell.

Es una opción interesante para equipos que necesitan desplegar un modelo multimodal de 27B con contexto de 32K tokens en GPUs de gama alta (32 GB o más) y que priorizan la fidelidad de la cuantización sobre la velocidad de prefill, que es aproximadamente 2x más lenta que la variante W4A4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con 64 capas (48 de atención lineal gated-delta, 16 de atención completa), MoE con shared expert gate, multi-token-prediction head y torre de visión |
| Parametros totales | 27B (modelo base); 19.135.892.976 (checkpoint cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuración recomendada en el ejemplo de vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A16) GPTQ, formato compressed-tensors; existe variante W4A4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo multimodal (image-text-to-text) con una arquitectura híbrida: de las 64 capas, 48 utilizan atención lineal (gated-delta / linear-attention) y 16 atención completa. Incorpora un mecanismo de mezcla de expertos (MoE) con un gate de experto compartido, y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa. La torre de visión procesa imágenes y las integra con el texto.

La cuantización se realizó con `llm-compressor` sobre 256 muestras del dataset `HuggingFaceH4/ultrachat_200k` a 4096 tokens, aplicando la plantilla de chat. El método GPTQ selecciona los pesos NVFP4 minimizando el error de Hessiana, mientras que las activaciones se mantienen en BF16. Los módulos excluidos de la cuantización (por sensibilidad numérica o por no ser GEMM-bound) son: `lm_head`, `embed_tokens`, `visual.*`, `linear_attn.*`, `mlp.gate`, `shared_expert_gate` y `mtp.*`. Esta exclusión preserva la precisión en las partes más frágiles del modelo, pero implica que el checkpoint no es más pequeño que la variante W4A4 (los pesos FP4 son idénticos); la diferencia está en el manejo de activaciones en runtime.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada, y produce texto (descripciones, respuestas, análisis).
- Razonamiento y matemáticas: heredado del modelo base Qwen3.8-27B, aunque no se detalla en la model card.
- Generación de código: el modelo base es competente en tareas de programación, pero no se aportan benchmarks específicos en esta documentación.
- Soporte de tool calling y agentes: no se especifica en la model card, pero el modelo base Qwen3.8-27B lo soporta de forma nativa (conocimiento general del ecosistema Qwen).
- Decodificación especulativa: la cabeza MTP se mantiene en BF16, por lo que es funcional para acelerar la generación.
- Multilingüismo: no se indica en la documentación; el modelo base Qwen3.8-27B es multilingüe, pero no se confirma aquí.

## Casos de uso

- Asistente multimodal de atención al cliente: el modelo puede procesar capturas de pantalla o fotos de productos junto con consultas de texto, manteniendo conversaciones de hasta 32K tokens gracias a su contexto largo. La cuantización NVFP4 permite desplegarlo en una GPU de 32-40 GB sin sacrificar demasiada precisión.
- Generación de código en entornos de producción: con soporte de tool calling (heredado del modelo base) y contexto de 32K, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código. La decodificación especulativa vía MTP reduce la latencia en generación secuencial.
- Análisis de documentos largos con imágenes: el modelo puede resumir informes extensos que incluyan gráficos, tablas o diagramas, gracias a su ventana de 32K tokens y su capacidad multimodal.
- Chatbot de razonamiento complejo: para tareas de planificación o resolución de problemas multi-paso, el modelo base ofrece capacidades de razonamiento que se conservan en la cuantización (con una pérdida de perplexidad de solo +2,37%).
- Despliegue en hardware no-Blackwell: al mantener activaciones BF16, este checkpoint es portable a GPUs como A100, RTX 4090 o incluso hardware de generaciones anteriores, sin requerir los tensor cores FP4 de Blackwell. Es adecuado para entornos con GPUs heterogéneas.
- Investigación en cuantización: el script `quantize.py` incluido permite reproducir la cuantización y adaptarla a otros modelos, siendo útil para experimentos de compresión con GPTQ y NVFP4.

## Benchmarks y rendimiento

La model card solo reporta perplexidad token-level en `wikitext-2-raw-v1` (test), medida con vLLM en 48 ventanas no solapadas de 4096 tokens (196.560 tokens). No se publican resultados de tareas como MMLU, HumanEval o GSM8K.

| Modelo | Perplexidad | vs BF16 |
|---|---|---|
| Este checkpoint (NVFP4a16-GPTQ) | 6,7129 | +2,37% |
| Qwen/Qwen3.8-27B (BF16) | 6,5574 | — |

Nota: la perplexidad token-level no es equivalente a la `word_perplexity` de lm-eval; solo debe compararse con mediciones realizadas con el mismo método.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 28,6 GB, por lo que se necesitan al menos 32 GB de VRAM para cargar los pesos sin offload. Con `--gpu-memory-utilization` alto y offloading, podría ejecutarse en GPUs de 24 GB, pero con riesgo de swapping.
- GPUs recomendadas: NVIDIA RTX PRO 6000 Blackwell 96GB (usada en las pruebas), A100 40GB, A100 80GB, H100, o cualquier GPU con 32 GB o más. No requiere Blackwell.
- GPUs de consumo: una RTX 4090 (24 GB) no es suficiente para cargar el modelo completo sin offload; una RTX 5090 (32 GB) sí podría.
- Opciones de despliegue: vLLM es el runtime principal (formato compressed-tensors). También es compatible con transformers, aunque la cuantización FP4 puede requerir soporte específico. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput (medidos en RTX PRO 6000 Blackwell 96GB, vLLM 0.27.1, concurrency 1, 256 tokens de generación):
  - TTFT: 191 ms (input 1024 tokens), 691 ms (input 4096 tokens).
  - Decode: 50,1 tok/s (input 1024), 49,8 tok/s (input 4096), 1,91x más rápido que el BF16 base.
  - Prefill: aproximadamente 2x más lento que la variante W4A4, debido a la dequantización a BF16 en los GEMMs de prefill.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño checkpoint | Prefill | Decode | Licencia |
|---|---|---|---|---|---|---|
| Este checkpoint (NVFP4a16) | 27B (base) | 32K | 28,6 GB | ~2x más lento que W4A4 | 50 tok/s (1,91x vs BF16) | Apache-2.0 |
| Qwen3.8-27B (BF16) | 27B | 32K | 55,6 GB | Referencia | 26 tok/s | Apache-2.0 |
| Variante W4A4 (mencionada) | 27B (base) | 32K | 28,6 GB | ~2x más rápido que este | ~50 tok/s | Apache-2.0 |

No se dispone de datos de otros modelos cuantizados de tamaño similar para comparar directamente.

## Limitaciones y advertencias

- La cuantización es lossy: la perplexidad aumenta un 2,37% respecto al BF16. Es imprescindible validar el comportamiento en el workload concreto antes de producción.
- El prefill es significativamente más lento que la variante W4A4 (aproximadamente 2x), lo que penaliza cargas de trabajo con muchas peticiones de entrada larga.
- La lista de módulos excluidos de la cuantización se derivó de la arquitectura en el momento del lanzamiento; si se fine-tunea o se altera el naming de los módulos, hay que re-derivarla.
- El modelo base tiene 48 de 64 capas con atención lineal, lo que obliga a ajustar `--max-num-seqs` en vLLM (512 es un valor seguro) para evitar fallos en la captura de CUDA graphs.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, etc.) para este checkpoint, por lo que el rendimiento real en tareas específicas es desconocido.
- Los idiomas soportados no están documentados en la model card; aunque el modelo base es multilingüe, no se confirma el alcance.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cuantización puede aumentar ligeramente este riesgo.

## Enlaces

- [Checkpoint en HuggingFace](https://huggingface.co/cloudnathan5/Qwen3.8-27B-NVFP4a16-GPTQ)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [llm-compressor (repositorio de vLLM)](https://github.com/vllm-project/llm-compressor)
- [Dataset de calibración HuggingFaceH4/ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
