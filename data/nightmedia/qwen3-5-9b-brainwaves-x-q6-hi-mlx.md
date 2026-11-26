# nightmedia/Qwen3.5-9B-Brainwaves-X-q6-hi-mlx

## Resumen

Qwen3.5-9B-Brainwaves-X es un modelo experimental de fusión (merge) construido por nightmedia, un laboratorio independiente con sede en Montana (EE. UU.), a partir de cinco modelos derivados de la familia Qwen3.5 de 9B parámetros. El resultado es un modelo multimodal de tipo image-text-to-text orientado a razonamiento con cadena de pensamiento larga (long-CoT), generación de código, matemáticas, STEM y escritura creativa de ficción, con etiquetas declaradas de contexto de hasta 1M y 256k tokens.

El modelo se distribuye en cuantización de 6 bits en formato MLX (sufijo q6-hi), pensada para ejecución en hardware Apple Silicon, aunque la model card incluye también métricas de otras cuantizaciones (mxfp8, q8-hi, qx86-hi, q4-hi, mxfp4) y de decodificación especulativa con multi-token prediction (oQ6e-mtp). Cuenta con 9.409.813.744 parámetros totales según los pesos en safetensors y un repositorio de 8,8 GB.

Su relevancia es acotada y experimental: no es un modelo oficial de Alibaba ni de Qwen, sino un ensamblaje de merges comunitarios que combina componentes especializados en código (Qwopus3-5-9B-Coder-Flash), STEM (DeepThought-STEM), razonamiento general (Brainwaves, Emergent) y un componente multimodal (OneJev1.6-9B). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5, multimodal image-text-to-text, con soporte declarado de multi-token prediction y decodificacion especulativa |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 256k y 1M tokens segun etiquetas de la model card (no verificado de forma independiente) |
| Tipos de cuantizacion | bf16, mxfp8, q8-hi, qx86-hi, q6-hi (esta variante), oQ6e-mtp, q4-hi, mxfp4 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (variante MLX de 6 bits) |
| Tamano del repositorio | 8,8 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es una fusión por mergekit de cinco checkpoints: nightmedia/Qwen3.5-9B-Brainwaves, nightmedia/Qwen3.5-9B-Emergent, Jackrong/Qwopus3-5-9B-Coder-Flash, xtools-at/Qwen3.5-9B-DeepThought-STEM y OmniJev/OneJev1.6-9B. Todos ellos parten de la base Qwen3.5-9B, por lo que comparten arquitectura transformer densa y tokenizador, lo que permite el merge de pesos sin cirugía arquitectónica. La model card no documenta la receta exacta de mezcla (ratios por capa, método de merge) ni el volumen o composición de datos de entrenamiento, y tampoco indica si hubo fases de RLHF o DPO posteriores al merge.

Las innovaciones declaradas son de inferencia más que de entrenamiento: soporte de multi-token prediction y decodificación especulativa (variante oQ6e-mtp), y un pipeline multimodal heredado del componente OneJev1.6-9B. La model card incluye tablas comparativas de precisión en tareas tipo ARC, ARC-Easy, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande para cada cuantización, así como perplejidad, memoria pico y tokens por segundo medidas en el laboratorio del autor sobre un MacBook Pro de 128 GB. No se aportan detalles sobre atención lineal, ventanas deslizantes ni mecanismos híbridos SSM.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento larga (long-CoT) y modo de reflexión explícito, heredado de los componentes Brainwaves y Emergent.
- Generación de código y tareas de ingeniería de software, por el componente Coder-Flash.
- Matemáticas y problemas STEM, por el componente DeepThought-STEM.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), por el componente OneJev1.6-9B.
- Escritura creativa: ficción, ciencia ficción, generación de trama y subtrama, continuación de escenas, roleplaying y prosa vívida.
- Decodificación especulativa con multi-token prediction para acelerar la generación.
- Contexto largo declarado de hasta 256k y 1M tokens.
- Soporte de tool calling y function calling: no documentado explícitamente en la model card; se desconoce si se conserva del linaje Qwen3.5.

## Casos de uso

- Asistencia a la investigación técnica: el modelo puede resumir y razonar sobre documentación extensa aprovechando la ventana de contexto larga declarada, útil para revisar papers o especificaciones de varios cientos de miles de tokens en una sola pasada.
- Generación de código en prototipado: el componente Coder-Flash permite completar funciones, explicar errores y proponer refactorizaciones; adecuado para entornos de desarrollo local sobre Apple Silicon con MLX.
- Tutoría STEM: resolución de problemas de matemáticas y física con trazas de razonamiento paso a paso, aprovechando el modo long-CoT para mostrar el desarrollo y no solo el resultado.
- Escritura de ficción asistida: generación de tramas, subtramas y continuación de escenas con consistencia de personajes, orientada a autores que trabajan en local sin enviar manuscritos a la nube.
- Roleplaying y narrativa interactiva: el modelo está etiquetado para roleplaying y conversación multi-turno, lo que lo hace apto para motores de aventuras de texto o simulación de personajes.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede describir diagramas, capturas o figuras acompañadas de texto, por ejemplo para extraer información de informes escaneados.
- Experimentación en investigación de merges: sirve como caso de estudio de cómo se comportan las fusiones de modelos especializados frente a la base Qwen3.5-9B, con métricas comparativas publicadas por el autor.

## Benchmarks y rendimiento

La model card publica resultados de precisión en tareas de conocimiento y sentido común, junto con perplejidad, memoria pico y velocidad de generación medidas por el autor. Los valores corresponden a la variante q6-hi y a otras cuantizaciones del mismo modelo; no se aportan comparaciones con MMLU, HumanEval o GSM8K.

Rendimiento del modelo fusionado (Qwen3.5-9B-Brainwaves-X):

| Cuantizacion | ARC | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|---|---|---|---|---|---|---|
| bf16 | 0,696 | 0,877 | 0,905 | 0,775 | 0,522 | 0,804 | 0,725 | 4,090 ± 0,026 | 24,69 GB | 833 |
| mxfp8 | 0,700 | 0,875 | 0,906 | 0,774 | 0,526 | 0,802 | 0,725 | 4,097 ± 0,026 | 16,02 GB | 670 |
| q8-hi | 0,701 | 0,878 | 0,905 | 0,774 | 0,522 | 0,803 | 0,724 | 4,091 ± 0,026 | 16,86 GB | 687 |
| qx86-hi | 0,695 | 0,878 | 0,907 | 0,772 | 0,528 | 0,806 | 0,721 | 4,095 ± 0,026 | 15,72 GB | 726 |
| q6-hi | 0,703 | 0,876 | 0,905 | 0,771 | 0,524 | 0,801 | 0,720 | 4,096 ± 0,026 | 14,62 GB | 674 |
| oQ6e-mtp | 0,700 | 0,878 | 0,905 | 0,773 | 0,520 | 0,803 | 0,721 | 4,090 ± 0,026 | 14,29 GB | 675 |
| q4-hi | 0,700 | 0,881 | 0,901 | 0,775 | 0,514 | 0,799 | 0,717 | 4,191 ± 0,027 | 12,38 GB | 743 |
| mxfp4 | 0,682 | 0,863 | 0,896 | 0,768 | 0,516 | 0,803 | 0,707 | 4,314 ± 0,028 | 11,55 GB | 707 |
| oQ6e-mtp (1M contexto) | 0,697 | 0,876 | 0,907 | 0,772 | 0,520 | 0,802 | 0,717 | no disponible | no disponible | no disponible |

Comparación con la base Qwen3.5-9B Instruct (mxfp8): ARC 0,571; ARC-E 0,719; BoolQ 0,895; HellaSwag 0,683; OpenBookQA 0,426; PIQA 0,770; Winogrande 0,671. El merge mejora de forma notable en ARC y OpenBookQA, y de forma moderada en HellaSwag y Winogrande.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 24,69 GB en bf16, 16,02 GB en mxfp8, 14,62 GB en q6-hi, 12,38 GB en q4-hi y 11,55 GB en mxfp4, según las mediciones del autor.
- GPU recomendadas: no hay datos específicos para GPU CUDA; las mediciones publicadas se hicieron en un MacBook Pro con 128 GB de memoria unificada. Por tamaño, una RTX 4090 (24 GB) podría alojar bf16 al límite y con holgura las cuantizaciones de 6 y 4 bits; A100 y H100 no están documentadas para este checkpoint.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más usando cuantizaciones q6-hi, q8-hi o q4-hi; en 12 GB solo con mxfp4 y contexto reducido.
- Opciones de despliegue: la variante publicada es MLX (omlx), orientada a Apple Silicon; el repositorio usa safetensors y la librería transformers, por lo que debería poder cargarse con llama.cpp o vLLM tras conversión, aunque no está documentado por el autor. Ollama y TGI no aparecen mencionados.
- Throughput medido por el autor: 833 tokens/s en bf16, 674 tokens/s en q6-hi, 743 tokens/s en q4-hi y 707 tokens/s en mxfp4, sobre el hardware de su laboratorio. No se publican latencias de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-X (este) | 9,41B | 256k / 1M declarado | Apache 2.0 | Merge de 5 checkpoints, multimodal, métricas propias publicadas |
| Qwen3.5-9B (Instruct) | ~9B | no disponible en la informacion | Apache 2.0 (linaje Qwen) | Base oficial; peor en ARC y OpenBookQA según las tablas del autor |
| nightmedia/Qwen3.5-9B-Brainwaves | ~9B | no disponible | Apache 2.0 | Componente del merge; perplejidad bf16 4,157 frente a 4,090 del modelo final |
| nightmedia/Qwen3.5-9B-Emergent | ~9B | no disponible | Apache 2.0 | Componente del merge; mxfp8 con ARC 0,696 y ARC-E 0,877 |
| Jackrong/Qwopus3-5-9B-Coder-Flash | ~9B | no disponible | no disponible | Componente especializado en código |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Componente STEM; solo se publica ARC 0,570 en q8-hi |
| OmniJev/OneJev1.6-9B | ~9B | no disponible | no disponible | Componente multimodal image-text-to-text |

## Limitaciones y advertencias

- Modelo experimental sin evaluación independiente: todas las métricas proceden del autor y miden tareas de conocimiento y sentido común, no razonamiento complejo, código o matemáticas.
- No hay datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, pese a las etiquetas de coding, math y STEM.
- El contexto de 1M tokens aparece solo como etiqueta y en una fila de la tabla (oQ6e-mtp), sin verificación externa; la ventana efectiva puede ser menor.
- Riesgo de alucinación inherente a los merges de modelos pequeños (9B) y a los modos long-CoT, que pueden producir cadenas de razonamiento plausibles pero incorrectas.
- Sesgos no documentados: no se publica información sobre composición del dataset, filtrado ni evaluaciones de sesgo o toxicidad.
- Soporte multilingüe declarado para en, zh, ja y es, pero sin métricas por idioma; el rendimiento en español no está cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero los componentes base tienen licencias no verificadas en esta información; conviene revisar cada modelo de origen antes de producción.
- El checkpoint publicado está en MLX de 6 bits para Apple Silicon; el despliegue en GPU CUDA requiere conversión y no está documentado por el autor.
- Sin soporte confirmado de tool calling ni de agentes multi-paso, pese a que el linaje Qwen3.5 suele incluirlo.
- Proyecto mantenido por un laboratorio unipersonal con recursos limitados (un MacBook Pro y tarjetas de memoria), lo que implica riesgo de falta de mantenimiento y soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-X-q6-hi-mlx
- Modelo base Brainwaves: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Modelo base Emergent: https://huggingface.co/nightmedia/Qwen3.5-9B-Emergent
- Componente Coder-Flash: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Componente DeepThought-STEM: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Componente OneJev1.6-9B: https://huggingface.co/OmniJev/OneJev1.6-9B
- Apoyo al autor: https://buymeacoffee.com/nightmedia
