# intel-ai/GLM-5.3-Flash-MXFP4-AutoRound

## Resumen

GLM-5.3-Flash-MXFP4-AutoRound es una versión cuantizada del modelo GLM-5.3-Flash de Z.ai, generada por Intel mediante su herramienta AutoRound. Se trata de una cuantización MXFP4 (W4A4, group_size 32) aplicada con el método RTN (round-to-nearest) sobre el punto de control original en BF16 (`zai-org/GLM-5.3-Flash-BF16`). El modelo base es un modelo multimodal (image-text-to-text) con arquitectura MoE híbrida que combina atención lineal KDA, sparse-MLA, un indexador DSA y expertos enrutados.

La relevancia de esta versión radica en la reducción drástica de memoria: el repositorio ocupa 194,9 GB frente a los más de 600 GB que ocuparía el modelo en BF16 (321.323 millones de parámetros), con una recuperación media del 99,53 % en los benchmarks evaluados. Esto hace viable servir un modelo de más de 300 mil millones de parámetros en infraestructura con menos GPUs.

El modelo se distribuye bajo licencia MIT (heredada del original) en formato safetensors con configuración de cuantización `compressed-tensors`, y está pensado para servirse con vLLM usando caché KV en FP8. No es una publicación oficial de Z.ai ni de NVIDIA, sino un derivado mantenido por Intel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next, MoE híbrido (KDA lineal-attention, sparse-MLA, DSA indexer, expertos enrutados, capa MTP) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (W4A4, group_size 32) en proyecciones de expertos enrutados y MLP densos de las tres primeras capas; BF16 en KDA, sparse-MLA, DSA indexer, expertos compartidos, router MoE, capa MTP, torre de visión, embeddings, lm_head y normalizaciones; KV-cache FP8 recomendado |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, formato llm_compressor) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura híbrida de transformer con mezcla de expertos (MoE). Según la model card, combina proyecciones de atención lineal KDA, proyecciones sparse-MLA, un indexador DSA (sparse attention indexer), expertos enrutados dispersos junto a expertos compartidos, una capa MTP (multi-token prediction) y una torre de visión para entrada multimodal. Esta combinación de attention lineal y sparse attention sugiere un diseño orientado a eficiencia en contextos largos, aunque la longitud de contexto concreta no está publicada en la información disponible.

En cuanto a la cuantización, Intel aplicó MXFP4 mediante RTN con AutoRound en modo `model_free`: se cuantizan a 4 bits las proyecciones de todos los expertos enrutados en las capas MoE dispersas y las proyecciones MLP densas de las tres primeras capas, mientras que se mantienen en BF16 los componentes sensibles (atención, indexador, router, embeddings, lm_head, torre de visión y parámetros de normalización e hiperconexiones). No se utilizó ningún dato de entrenamiento adicional ni calibración con datasets externos, y el modelo hereda las capacidades, sesgos y comportamiento de seguridad del punto de control original. Los detalles del preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Entrada multimodal imagen-texto a texto (tag image-text-to-text, presencia de torre de visión mantenida en BF16).
- Razonamiento y matemáticas: el modelo base alcanza 97,35 en GSM8K en BF16.
- Conocimiento general: 86,66 en MMLU en BF16.
- Arquitectura MoE con capa MTP, que habitualmente habilita decodificación especulativa multi-token (el soporte efectivo en runtime no está documentado en esta ficha).
- Soporte de tool calling, agentes y thinking mode: no disponible en la información proporcionada (la propia model card indica que el comportamiento agéntico y en thinking-mode no fue medido).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Servir un LLM de más de 300 mil millones de parámetros con infraestructura reducida: la cuantización MXFP4 reduce el footprint a unos 195 GB, permitiendo desplegar el modelo en un número menor de GPUs aceleradoras que la versión BF16.
- Asistentes conversacionales de alta capacidad: el pipeline conversacional y el buen rendimiento en benchmarks de sentido común (PIQA 82,75; HellaSwag 68,25) lo hacen adecuado para chatbots avanzados.
- Resolución de problemas matemáticos y razonamiento cuantitativo: con 97,50 en GSM8K tras la cuantización, es apto para pipelines de resolución de problemas aritméticos y razonamiento paso a paso.
- Comprensión de documentos con imágenes: al conservar la torre de visión en BF16, puede usarse en flujos de análisis visual-question answering, aunque este comportamiento no fue evaluado por el autor.
- Investigación en cuantización: al conservar la receta completa de AutoRound (comando reproducible incluido en la model card), sirve como referencia para estudiar el impacto de MXFP4 en arquitecturas MoE híbridas.
- Despliegue con vLLM en producción: la configuración de cuantización está orientada a los nombres de módulo de la implementación GLM de vLLM, lo que facilita la integración directa con `vllm serve` y caché KV en FP8.

## Benchmarks y rendimiento

Resultados publicados por Intel comparando el punto de control BF16 original con esta versión MXFP4:

| Benchmark | BF16 | MXFP4 | Recovery |
|---|---:|---:|---:|
| PIQA | 82,92 | 82,75 | 99,79 % |
| HellaSwag | 69,03 | 68,25 | 98,87 % |
| MMLU | 86,66 | 85,88 | 99,10 % |
| GSM8K | 97,35 | 97,50 | 100,15 % |
| **Media** | **83,99** | **83,59** | **99,53 %** |

No hay comparativas con otros modelos de la misma categoría en la información disponible. La model card advierte que la evaluación cubre solo cuatro benchmarks académicos de texto; no se midieron contexto largo, comportamiento agéntico, thinking-mode ni capacidades multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 194,9 GB de pesos; con caché KV en FP8 se recomienda al menos unos 220-240 GB de VRAM total (estimación aproximada, no confirmada por el autor).
- GPUs recomendadas: no disponible explícitamente; dado el tamaño, se requieren múltiples GPUs de gama datacenter (por ejemplo, configuraciones tipo 8x H100 80 GB o equivalentes con más de 200 GB agregados). Esta es una estimación razonada, no un requisito oficial.
- Consumer GPU: no cabe en ninguna GPU de consumo actual; se necesita multi-GPU en servidor.
- Despliegue: vLLM (runtime de referencia; se indica la instalación de un commit concreto de vLLM). Se recomienda arrancar con `--kv-cache-dtype fp8 --dtype bfloat16`. La config de cuantización usa los nombres de módulo de vLLM (`language_model.model.*`, `visual.*`, `language_model.lm_head`, `RoutedExperts`); servirlo en runtimes que esperen los nombres crudos de Hugging Face requiere retargeting de la configuración. No se menciona soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| intel-ai/GLM-5.3-Flash-MXFP4-AutoRound | 321.323 M | MXFP4 (W4A4) + BF16 mixto | no disponible | MIT | Multimodal, MoE híbrido, optimizado para vLLM |
| zai-org/GLM-5.3-Flash-BF16 (modelo base) | 321.323 M | BF16 | no disponible | MIT | Punto de control original, ~3x más memoria |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen con certeza modelos comparables publicados con esta misma combinación de arquitectura (KDA + sparse-MLA + DSA) y cuantización MXFP4 en la información disponible.

## Limitaciones y advertencias

- Sesgos: el modelo hereda íntegramente las capacidades, sesgos y comportamiento de seguridad del punto de control base; la cuantización no añade alineación adicional.
- Alucinaciones: riesgo inherente al modelo base; la reducción de precisión numérica puede alterar las salidas en casos límite.
- Evaluación limitada: solo se han medido cuatro benchmarks académicos de texto; rendimiento en contexto largo, modo agéntico, thinking-mode y multimodalidad no verificado.
- Compatibilidad de runtimes: la configuración de cuantización está dirigida a los nombres de módulo de vLLM; otros runtimes requieren retargeting manual.
- Se recomienda servir con KV-cache en FP8 para replicar la configuración de referencia.
- No es una publicación oficial de Z.ai ni de NVIDIA; es un derivado de Intel.
- Idiomas soportados, longitud de contexto, parámetros activos y datos de entrenamiento del modelo base: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial sin restricciones significativas, aunque la model card remite a la licencia del modelo original.

## Enlaces

- Modelo cuantizado: https://huggingface.co/intel-ai/GLM-5.3-Flash-MXFP4-AutoRound
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- AutoRound (GitHub): https://github.com/intel/auto-round
- Commit de vLLM recomendado: https://github.com/vllm-project/vllm/commit/46d2b23ac5047a813ebb082122166e4ae09b5f39
