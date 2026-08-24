# shoemoney/mlx-quant-ladder-findings

## Resumen

El repositorio `shoemoney/mlx-quant-ladder-findings` no es un modelo de lenguaje en sí, sino un conjunto de mediciones empíricas y artefactos de cuantización MLX para cinco familias de modelos "uncensored" (sin censura). Desarrollado por el usuario shoemoney, su objetivo es determinar qué nivel de cuantización (bit width) ofrece el mejor equilibrio entre tamaño, perplejidad y throughput en hardware Apple Silicon. Los modelos cubiertos incluyen Muse-Glimmer-30B-Abliterated, Qwen3.8-27B-Abliterated, Ornith-1.5-9B-Abliterated, Gemma-4-12B-Abliterated y Gemma-4-26B-A4B-Heretic, todos convertidos desde una única fuente BF16 con un group size fijo, de modo que la única variable dentro de cada familia es el ancho de bits.

La relevancia de este recurso radica en que proporciona datos cuantitativos sobre la degradación de perplejidad y el rendimiento de throughput para diferentes esquemas de cuantización (q3, q4, q5, q6, q8, mxfp4 y mixed36) en un Apple M3 Ultra con 96 GB de memoria unificada. Los resultados revelan patrones claros: la familia Qwen tolera muy bien la cuantización de 4 bits (degradación inferior al 3% respecto al mejor rung), mientras que las arquitecturas Gemma son mucho más sensibles, colapsando en perplejidad a 3 bits. El repositorio también documenta la decisión de no publicar ciertos rungs (como 2-bit) basándose en una regla de selección auditable.

## Especificaciones tecnicas

Dado que el repositorio no es un modelo único sino un conjunto de artefactos cuantizados de varias familias, los parámetros generales no aplican de forma unificada. A continuación se detallan las especificaciones de los modelos subyacentes y de los artefactos publicados.

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (varias: Muse-Glimmer, Qwen3.8, Ornith, Gemma-4; Gemma-4-26B-A4B es MoE con 4B activos) |
| Parametros totales | 9B (Ornith), 12B (Gemma-4-12B), 26B (Gemma-4-26B-A4B), 27B (Qwen3.8), 30B (Muse-Glimmer) |
| Parametros activos | 4B en Gemma-4-26B-A4B (MoE); resto densos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q3, q4, q5, q6, q8, mxfp4, mixed36 (todos en MLX) |
| Idiomas soportados | no disponible (los modelos base son multilingues, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors con formato MLX, cargables con mlx-vlm) |

## Arquitectura y entrenamiento

Los modelos subyacentes son transformers densos o de mezcla de expertos (MoE) entrenados por terceros. El repositorio no documenta el entrenamiento original, sino el proceso de cuantización posterior. La conversión se realizó con `mlx_vlm.convert` partiendo de un único checkpoint BF16 por familia, manteniendo un group size fijo y variando únicamente el ancho de bits. Esto permite aislar el efecto de la cuantización sobre la perplejidad y el throughput.

La innovación técnica principal es la metodología de medición: se utiliza un conjunto fijo de 192 muestras de `allenai/tulu-3-sft-mixture` con 512 tokens cada una y semilla 123 para calcular la perplejidad, idéntico para todos los rungs. El throughput se mide con prompts de ~70 tokens y un nonce único por petición para evitar que la caché de prefijo contamine las lecturas (se verifica `cached_tokens = 0`). Además, se aplica una regla de selección que solo publica rungs cuya perplejidad sea <= 2x la mejor de su familia, y se documentan los rungs retenidos con su ratio para que la decisión sea auditable.

## Capacidades

- Proporciona mediciones de perplejidad y throughput para 7 niveles de cuantización en 5 familias de modelos.
- Permite comparar la robustez a la cuantización entre arquitecturas (Qwen vs Gemma).
- Incluye artefactos publicados (pesos cuantizados) cargables con `mlx-vlm` para generación de texto.
- Documenta el rendimiento de formatos MXFP4 y mixed36, además de los clásicos q3-q8.
- Ofrece una regla de selección reproducible para decidir qué rungs son aceptables.
- Los datos son auditables: se publican los ratios de perplejidad incluso para rungs retenidos.

## Casos de uso

- Selección de cuantización para despliegue en Apple Silicon: un desarrollador que quiera ejecutar Qwen3.8-27B en un Mac con 32 GB puede consultar la tabla y ver que q4 (16.08 GB) ofrece una perplejidad de 6.455, casi idéntica a q8 (6.452), ahorrando 13 GB de memoria.
- Evaluación de trade-offs entre tamaño y calidad: para Muse-Glimmer-30B, mxfp4 (18.57 GB) es el segundo más pequeño y el más rápido medido, con una perplejidad de 7.545 (1.04x el mejor), lo que lo convierte en una opción óptima para entornos con memoria limitada.
- Investigación sobre robustez de arquitecturas a la cuantización: los datos muestran que Gemma-4-12B colapsa a q3 (perplejidad 136393.5, 976x el mejor), lo que indica que esta arquitectura no es adecuada para cuantización agresiva.
- Planificación de capacidad de servidores: el throughput medido (tok/s agregado) permite estimar el rendimiento esperado en M3 Ultra para cada rung, útil para dimensionar infraestructura.
- Validación de pipelines de cuantización: la metodología con nonce único y verificación de caché puede replicarse para otros modelos o hardware.
- Educación y benchmarking: sirve como referencia para entender cómo afecta el ancho de bits a la perplejidad en diferentes familias de modelos, sin necesidad de ejecutar las conversiones uno mismo.

## Benchmarks y rendimiento

Las tablas siguientes muestran los resultados de perplejidad (menor es mejor) y tamaño de archivo para cada rung. La columna "x best" indica el ratio respecto al mejor rung de la misma familia. La perplejidad solo es comparable dentro de cada familia debido a diferencias en el tokenizador.

**Muse-Glimmer-30B-Abliterated**

| rung | size GB | perplexity | x best | status |
|---|---|---|---|---|
| q3 | 15.95 | 8.776 | 1.21x | published |
| q4 | 19.44 | 7.300 | 1.01x | published |
| q5 | 22.93 | 7.306 | 1.01x | published |
| q6 | 26.42 | 7.284 | 1.01x | published |
| q8 | 33.4 | 7.242 | 1.00x | published |
| mxfp4 | 18.57 | 7.545 | 1.04x | published |
| mixed36 | 18.27 | 8.336 | 1.15x | published |

**Qwen3.8-27B-Abliterated**

| rung | size GB | perplexity | x best | status |
|---|---|---|---|---|
| q3 | 12.72 | 7.178 | 1.15x | published |
| q4 | 16.08 | 6.455 | 1.03x | published |
| q5 | 19.44 | 6.419 | 1.03x | published |
| q6 | 22.8 | 6.427 | 1.03x | published |
| q8 | 29.53 | 6.452 | 1.03x | published |
| mxfp4 | 15.24 | 6.251 | 1.00x | published |
| mixed36 | 14.76 | 6.807 | 1.09x | published |

**Ornith-1.5-9B-Abliterated**

| rung | size GB | perplexity | x best | status |
|---|---|---|---|---|
| q3 | 5.34 | 7.518 | 1.41x | published |
| q4 | 6.46 | 5.471 | 1.03x | published |
| q5 | 7.58 | 5.325 | 1.00x | published |
| q6 | 8.7 | 5.355 | 1.01x | published |
| q8 | 10.94 | 5.333 | 1.00x | published |
| mxfp4 | 6.18 | 5.783 | 1.09x | published |
| mixed36 | 6.42 | 6.736 | 1.26x | published |

**Gemma-4-12B-Abliterated**

| rung | size GB | perplexity | x best | status |
|---|---|---|---|---|
| q3 | 5.28 | 136393.505 | 976.16x | withheld |
| q4 | 6.77 | 287.296 | 2.06x | withheld |
| q5 | 8.27 | 211.862 | 1.52x | published |
| q6 | 9.76 | 144.271 | 1.03x | published |
| q8 | 12.75 | 139.724 | 1.00x | published |
| mxfp4 | 6.4 | 254.121 | 1.82x | published |
| mixed36 | 6.24 | 31094.364 | 222.54x | withheld |

**Gemma-4-26B-A4B-Heretic**

| rung | size GB | perplexity | x best | status |
|---|---|---|---|---|
| q3 | 12.22 | 547.455 | 5.45x | withheld |
| q4 | 15.37 | 168.023 | 1.67x | published |
| q6 | 21.68 | 100.433 | 1.00x | published |
| q8 | 27.99 | 105.975 | 1.06x | published |
| mxfp4 | 14.59 | 195.105 | 1.94x | published |
| mixed36 | 13.87 | 290.832 | 2.90x | withheld |

No se proporcionan resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Las mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada y macOS 27.
- Los artefactos están en formato MLX, por lo que requieren hardware Apple Silicon (M1 o posterior) y el paquete `mlx-vlm`.
- La VRAM necesaria para inferencia depende del rung elegido: por ejemplo, q4 de Qwen3.8-27B ocupa 16.08 GB, mientras que q8 ocupa 29.53 GB. Un Mac con 32 GB puede cargar q4, pero no q8.
- Para Gemma-4-26B-A4B, el rung q6 (21.68 GB) es el mejor publicado y cabe en un Mac con 32 GB, pero q8 (27.99 GB) también cabría.
- No se especifican latencias ni throughput absolutos, solo el throughput agregado en tok/s para prompts de ~70 tokens, que no se desglosa por rung en la información proporcionada.
- Opciones de despliegue: `mlx_vlm.generate` (CLI) o integración con librerías que soporten MLX. No se menciona vLLM, llama.cpp u Ollama porque estos formatos son específicos de MLX.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros repositorios de cuantización MLX en la información proporcionada. Sin embargo, se puede comparar el comportamiento de las familias entre sí:

| Familia | Parametros | Mejor rung (perplejidad) | Peor rung publicado | Robustez a cuantizacion |
|---|---|---|---|---|
| Muse-Glimmer-30B | 30B | q8 (7.242) | q3 (8.776) | Alta (q4 ya casi óptimo) |
| Qwen3.8-27B | 27B | mxfp4 (6.251) | q3 (7.178) | Muy alta (q4 = 1.03x) |
| Ornith-1.5-9B | 9B | q5 (5.325) | q3 (7.518) | Alta (q4 = 1.03x) |
| Gemma-4-12B | 12B | q8 (139.724) | q3 (136393.5) | Muy baja (colapso en q3) |
| Gemma-4-26B-A4B | 26B MoE | q6 (100.433) | q3 (547.455) | Baja (q4 = 1.67x) |

La comparativa muestra que las arquitecturas Qwen y Ornith son mucho más tolerantes a la cuantización que las Gemma, lo que es un factor crítico para elegir modelo en entornos con memoria limitada.

## Limitaciones y advertencias

- La perplejidad no es comparable entre familias debido a tokenizadores diferentes (Gemma tiene vocabulario de 262,144, Qwen de 151,936). La columna "x best" es la única métrica portable.
- Los modelos son "abliterated" o "heretic", lo que implica que se ha eliminado la censura del modelo base. Esto puede conllevar riesgos de generación de contenido inapropiado o dañino.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones de idioma de los modelos subyacentes.
- La licencia no está disponible, por lo que no se puede garantizar el uso comercial de los artefactos.
- Los rungs retenidos (withheld) no se publican, pero sus ratios se documentan. Algunos rungs publicados (como q3 de Gemma-4-12B) tienen perplejidad extremadamente alta y no deberían usarse en producción.
- El formato MLX es específico de Apple Silicon; no es compatible con CUDA o ROCm sin conversión adicional.
- Las mediciones se realizaron en un único hardware (M3 Ultra) y con un único dataset de perplejidad; los resultados pueden variar en otros entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoemoney/mlx-quant-ladder-findings
- Herramienta relacionada (GitHub): https://github.com/bmgaf/mlx-quant (mencionada en resultados de búsqueda, aunque no se confirma su relación directa)
- Colección de quants MLX con ladder de evaluación: https://huggingface.co/collections/vimalnakrani/unlimited-ocr-mlx-quants-with-measured-eval-ladder (referencia similar, no directamente este repositorio)
