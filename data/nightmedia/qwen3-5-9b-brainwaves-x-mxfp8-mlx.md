# nightmedia/Qwen3.5-9B-Brainwaves-X-mxfp8-mlx

## Resumen

Qwen3.5-9B-Brainwaves-X-mxfp8-mlx es un modelo de lenguaje multimodal (pipeline image-text-to-text) de 9.409.813.744 parámetros, publicado por el usuario nightmedia en Hugging Face. Se trata de un merge experimental construido con mergekit a partir de cinco modelos base de la familia Qwen3.5: nightmedia/Qwen3.5-9B-Brainwaves, nightmedia/Qwen3.5-9B-Emergent, Jackrong/Qwopus3-5-9B-Coder-Flash, xtools-at/Qwen3.5-9B-DeepThought-STEM y OmniJev/OneJev1.6-9B. El objetivo declarado es combinar capacidades de razonamiento de cadena larga (long-CoT), generación de código, matemáticas y escritura creativa en un único checkpoint de 9B.

La variante concreta de este repositorio es la cuantización mxfp8 para MLX, es decir, pesos en formato de 8 bits de punto flotante con escala de microscopía por bloque, empaquetados para su ejecución en Apple Silicon mediante la librería MLX. El autor publica métricas comparativas entre cuantizaciones (bf16, mxfp8, q8-hi, qx86-hi, q6-hi, q4-hi, mxfp4) sobre un conjunto de tareas de razonamiento y conocimiento, mostrando una degradación muy contenida en mxfp8.

La relevancia del modelo reside en su naturaleza experimental y en su orientación a despliegue local en hardware de Apple: la model card incluye benchmarks de latencia y throughput medidos en M2 Max y M4 Max, así como cifras de memoria pico que sitúan la inferencia en torno a 16 GB en mxfp8. No obstante, se trata de un merge sin validación independiente ni paper asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (detalle exacto de capas y atención no disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1M tokens segun tags; 256k tambien declarado; benchmarks hasta 200k tokens |
| Tipos de cuantizacion | mxfp8 (esta variante); el autor publica ademas bf16, q8-hi, qx86-hi, q6-hi, oQ6e-mtp, q4-hi y mxfp4 |
| Idiomas soportados | en, zh, ja, es (segun model card); el campo language del repo solo lista en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, cuantizacion MLX (mxfp8) |

## Arquitectura y entrenamiento

El modelo es un merge de cinco checkpoints derivados de Qwen3.5 de 9B, generado con mergekit. No se dispone de información sobre la receta exacta de mezcla (método de merge, pesos por capa o parámetros de interpolación) ni sobre el volumen de tokens de entrenamiento original de los modelos base. Los tags de la model card mencionan destilación (distillation), coder-flash, claude y polaris-alpha, lo que sugiere que alguno de los componentes base se entrenó con datos destilados, pero no se aporta detalle verificable.

La model card destaca dos innovaciones técnicas declaradas: soporte de multi-token prediction (MTP) y decodificación especulativa, reflejados en la variante oQ6e-mtp de los benchmarks. También se anuncia capacidad de contexto largo (1M tokens en los tags, con pruebas reales hasta 200.000 tokens en las mediciones de latencia). La variante de este repositorio aplica cuantización mxfp8, un formato de 8 bits con escalas compartidas por bloques que el autor compara contra bf16 y otras cuantizaciones en perplejidad y memoria pico.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con cadena de pensamiento larga (long-CoT) y modo de pensamiento explícito.
- Generación de código, con orientación a tareas de programación (componente Coder-Flash).
- Matemáticas y disciplinas STEM (componente DeepThought-STEM).
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque no se detalla la arquitectura de visión.
- Escritura creativa: generación de tramas, subtramas, ficción, ciencia ficción, continuación de escenas y roleplaying.
- Capacidades multilingües declaradas en inglés, chino, japonés y español.
- Soporte de contexto largo, con pruebas de rendimiento hasta 200.000 tokens.
- Decodificación especulativa y multi-token prediction en las variantes MTP.
- Tool calling y function calling: no se menciona explícitamente en la información disponible.

## Casos de uso

- Escritura creativa y generación de ficción: el modelo está etiquetado específicamente para generación de tramas, subtramas, continuación de escenas y roleplaying, por lo que encaja en herramientas de asistencia a novelistas y guionistas que necesiten mantener coherencia en textos largos.
- Asistencia a la programación en local: el componente Coder-Flash permite usar el modelo como autocompletado y generación de código en entornos de desarrollo sobre Apple Silicon, con la cuantización mxfp8 como equilibrio entre calidad y memoria.
- Resolución de problemas STEM: con el componente DeepThought-STEM, puede emplearse para explicar paso a paso problemas de matemáticas y física en entornos educativos, aprovechando el modo de razonamiento extendido.
- Procesamiento de documentos largos: gracias al contexto declarado de hasta 1M tokens (con rendimiento medido hasta 200k), es adecuado para resumir o extraer información de libros, informes o bases de código extensas en una sola pasada.
- Análisis de imágenes con texto asociado: al ser un modelo image-text-to-text, puede describir imágenes, responder preguntas sobre capturas o diagramas y combinar esa información con texto largo.
- Prototipado e investigación en técnicas de merge: al ser un merge experimental con métricas publicadas por cuantización, sirve como banco de pruebas para estudiar el impacto de mxfp8, q4 y otras cuantizaciones en tareas de razonamiento.
- Despliegue local en estaciones de trabajo Mac: los benchmarks en M2 Max y M4 Max permiten estimar latencia y throughput antes de integrar el modelo en aplicaciones de escritorio o servidores locales.

## Benchmarks y rendimiento

El autor publica una tabla de exactitud por cuantización sobre siete tareas (arc, arc/e, boolq, hswag, obkqa, piqa, wino), así como perplejidad, memoria pico y tokens por segundo:

| Cuantizacion | arc | arc/e | boolq | hswag | obkqa | piqa | wino | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|---|---|---|---|---|---|---|
| bf16 | 0,696 | 0,877 | 0,905 | 0,775 | 0,522 | 0,804 | 0,725 | 4,090 | 24,69 GB | 833 |
| mxfp8 | 0,700 | 0,875 | 0,906 | 0,774 | 0,526 | 0,802 | 0,725 | 4,097 | 16,02 GB | 670 |
| q8-hi | 0,701 | 0,878 | 0,905 | 0,774 | 0,522 | 0,803 | 0,724 | 4,091 | 16,86 GB | 687 |
| qx86-hi | 0,695 | 0,878 | 0,907 | 0,772 | 0,528 | 0,806 | 0,721 | 4,095 | 15,72 GB | 726 |
| q6-hi | 0,703 | 0,876 | 0,905 | 0,771 | 0,524 | 0,801 | 0,720 | 4,096 | 14,62 GB | 674 |
| oQ6e-mtp | 0,700 | 0,878 | 0,905 | 0,773 | 0,520 | 0,803 | 0,721 | 4,090 | 14,29 GB | 675 |
| q4-hi | 0,700 | 0,881 | 0,901 | 0,775 | 0,514 | 0,799 | 0,717 | 4,191 | 12,38 GB | 743 |
| mxfp4 | 0,682 | 0,863 | 0,896 | 0,768 | 0,516 | 0,803 | 0,707 | 4,314 | 11,55 GB | 707 |

Además, se reporta ARC_CHALLENGE con un 96,1 % de exactitud (1126 de 1172 muestras, modo instruct, sin pensamiento) para la variante oQ8e-mtp en M2 Max. Los benchmarks de latencia y throughput por contexto se detallan en la sección de hardware.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,02 GB de memoria pico para mxfp8 en las mediciones del autor; 24,69 GB para bf16; 11,55 GB para mxfp4.
- GPU recomendadas: el repositorio está orientado a Apple Silicon (MLX), con benchmarks en M2 Max y M4 Max. No se publican mediciones para NVIDIA (A100, H100, RTX 4090).
- Cabe en GPU de consumo: en Apple Silicon con al menos 16 GB de memoria unificada para mxfp8; con q4-hi o mxfp4 cabría en equipos de 12-16 GB. En NVIDIA no hay datos publicados.
- Opciones de despliegue: MLX (librería principal de esta variante), transformers y servidores compatibles con endpoints. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante concreta.
- Latencia y throughput: en M4 Max (40 núcleos) con qx86-hi, 888,8 tokens/s de prefill y 55,5 tokens/s de generación a 1k de contexto, bajando a 398,4 y 26,0 tokens/s a 195k. Con oQ6e-mtp en M4 Max, 843,8 tokens/s de prefill y 85,0 tokens/s de generación a 1k, y 362,2 y 40,8 tokens/s a 195k. En M2 Max con oQ8e-mtp, el throughput agregado con batching continuo escala de 3,3 a 47,8 tokens/s de generación al pasar de lote 1 a lote 8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-X-mxfp8-mlx | 9,41B | hasta 1M (tags); 256k declarado | apache-2.0 | Merge experimental, cuantizado mxfp8 para MLX |
| nightmedia/Qwen3.5-9B-Brainwaves | no disponible | no disponible | apache-2.0 | Componente base del merge |
| nightmedia/Qwen3.5-9B-Emergent | no disponible | no disponible | apache-2.0 | Componente base del merge |
| Jackrong/Qwopus3-5-9B-Coder-Flash | no disponible | no disponible | no disponible | Componente base orientado a código |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | no disponible | no disponible | no disponible | Componente base orientado a STEM |

No se dispone de datos de benchmarks comparativos frente a modelos de otras familias (Llama, Mistral, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: es un merge sin paper, sin evaluación independiente y con métricas publicadas únicamente por el autor.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación.
- Idiomas: aunque la model card declara en, zh, ja y es, el campo de idiomas del repositorio solo lista inglés; el soporte real de español y japonés no está verificado.
- Contexto: la cifra de 1M tokens aparece solo en tags; las mediciones reales llegan a 200k y el rendimiento cae de forma notable a partir de 128k (por ejemplo, 26,0 tokens/s de generación a 195k frente a 55,5 a 1k en M4 Max).
- Licencia: apache-2.0 permite uso comercial, pero al derivar de múltiples modelos base conviene verificar las condiciones de cada componente original.
- Hardware: los benchmarks solo cubren Apple Silicon; no hay datos de rendimiento en GPU NVIDIA, por lo que las estimaciones de despliegue en servidores convencionales no están validadas.
- Capacidades multimodales: el pipeline es image-text-to-text, pero no se detalla el codificador visual ni se aportan benchmarks de visión.
- Tool calling y agentes: no se documenta soporte explícito, por lo que no debe asumirse en producción.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-X-mxfp8-mlx
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Emergent
- Modelo base: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-9B
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
