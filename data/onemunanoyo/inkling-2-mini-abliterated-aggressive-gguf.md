# onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF

## Resumen

Inkling-2-Mini-Abliterated-Aggressive-GGUF es una compilación de cuantizaciones GGUF del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario onemunanoyo. Se trata de una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas quirúrgicamente de los pesos) y calificada como "aggressive" por su autor, orientada a investigación, red-teaming y evaluación de alineamiento. El modelo conserva la arquitectura multimodal image-text-to-text del original y añade un proyector de visión separado (mmproj-BF16.gguf) para el procesamiento de imágenes.

El modelo cuenta con 26.070.390.272 parámetros totales según los safetensors del modelo base, y las etiquetas indican arquitectura MoE (mixture of experts) con un mecanismo denominado "inkling2_loop". Se distribuye en seis cuantizaciones Unsloth Dynamic (UD) que van desde UD-Q8_K_XL (22,87 GB) hasta UD-Q2_K_XL (9,14 GB), todas preservando la asignación de cuantización original por tensor (BF16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4_NL, NVFP4, MXFP4, Q2_0).

La relevancia de esta ficha radica en que documenta una de las pocas variantes abliterated de un modelo multimodal con licencia Apache 2.0, con métricas publicadas de divergencia KL, perplejidad y tasas de rechazo. El autor reporta 0/40 rechazos en inglés de alta esfuerzo y 97,33% en GSM8K con la cuantización UD-Q8_K_XL, lo que permite evaluar el coste de la abliteración en capacidades de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con mecanismo "inkling2_loop"; transformer multimodal image-text-to-text |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q8_K_XL, UD-Q4_K_XL, UD-Q4_K_M, UD-Q3_K_XL, UD-IQ3_XXS, UD-Q2_K_XL (Unsloth Dynamic); componentes internos BF16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4_NL, NVFP4, MXFP4, Q2_0 |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj-BF16.gguf para visión) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo mixture of experts (MoE) con un componente denominado "inkling2_loop" según las etiquetas del repositorio. El pipeline es image-text-to-text, lo que implica que el modelo procesa entradas conjuntas de imagen y texto; la compilación incluye un proyector de visión separado (mmproj-BF16.gguf, 641,81 MB) sin modificar respecto al original de unsloth/Inkling-2-Mini-GGUF. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La modificación principal de esta variante es la abliteración "aggressive" aplicada in-place sobre los pesos, que elimina las direcciones de rechazo. El autor documenta que se usaron los datasets heretic-org/Semantic-Harmful y heretic-org/Semantic-Harmless para calibrar la intervención. Las cuantizaciones preservan la asignación de cuantización por tensor del baseline Unsloth Dynamic, con mezclas específicas como 18 tensores BF16 en attn_output y 4 BF16 + 20 NVFP4 en ffn_down_exps para UD-Q8_K_XL. No se detalla la innovación técnica del "inkling2_loop" ni detalles de decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Procesamiento multimodal image-text-to-text mediante el proyector de visión incluido.
- Razonamiento con modos de esfuerzo configurables (low en 0.2 y high en 0.9 según la evaluación del autor).
- Capacidad de razonamiento matemático: 97,33% en GSM8K con High-CoT en UD-Q8_K_XL.
- Conocimiento general medido en MMLU: 77,63% en UD-Q8_K_XL.
- Respuestas sin rechazo en contextos dañinos (0/40 en inglés de alta esfuerzo), orientado a red-teaming.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se documenta soporte explícito de tool calling ni de agentes multi-step en la información disponible.

## Casos de uso

- Red-teaming y evaluación de alineamiento: el modelo sirve como sujeto de prueba para medir la eficacia de filtros de seguridad, ya que el autor reporta tasas de rechazo cercanas a cero en conjuntos dañinos (0/40 en inglés de alta esfuerzo), lo que permite estudiar la robustez de clasificadores externos.
- Investigación sobre abliteración: comparar la degradación de capacidades entre las variantes Aggressive y Balanced (KLD 0,07266 frente a 0,06186) permite cuantificar el coste de eliminar direcciones de rechazo en un MoE multimodal.
- Evaluación de calibración en cuantizaciones: las seis variantes UD con sus métricas de perplejidad y KLD publicadas permiten estudiar cómo afecta la cuantización extrema (UD-Q2_K_XL, 9,14 GB) a la fidelidad respecto al modelo base.
- Despliegue en hardware de consumo: la variante UD-Q2_K_XL (9,14 GB) o UD-IQ3_XXS (11,66 GB) permiten ejecutar un modelo de 26B parámetros en GPUs con 12-16 GB de VRAM mediante llama.cpp, útil para prototipado local.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text con el proyector mmproj permite tareas de descripción de imágenes o extracción de información visual en inglés y japonés.
- Análisis de sesgos lingüísticos: al soportar inglés y japonés, el modelo permite comparar comportamientos entre ambos idiomas; el autor reporta 25/25 rechazos en japonés dañino en el baseline frente a 0/25 en la variante Aggressive.
- Generación de código y matemáticas en pipelines de evaluación: con 97,33% en GSM8K, puede usarse como generador de soluciones en benchmarks internos, aunque sin garantías de tool calling.

## Benchmarks y rendimiento

Perplejidad y divergencia KL frente al baseline UD sin modificar (WikiText-2, contexto 512):

| Variante | PPL base | PPL abliterado | Ratio | KLD | Same Top-p |
|---|---:|---:|---:|---:|---:|
| UD-Q8_K_XL | 8,3244 ± 0,3476 | 8,7957 ± 0,3789 | 1,0566x | 0,07266 | 88,29% |
| UD-Q4_K_XL | 8,3218 ± 0,3473 | 8,7993 ± 0,3797 | 1,0574x | 0,07059 | 89,07% |
| UD-Q4_K_M | 8,3210 ± 0,3472 | 8,8092 ± 0,3801 | 1,0587x | 0,07053 | 89,12% |
| UD-Q3_K_XL | 8,3762 ± 0,3488 | 8,8502 ± 0,3807 | 1,0566x | 0,06970 | 88,34% |
| UD-IQ3_XXS | 8,4607 ± 0,3527 | 8,9601 ± 0,3854 | 1,0590x | 0,06584 | 88,29% |
| UD-Q2_K_XL | 8,7340 ± 0,3653 | 9,1303 ± 0,3887 | 1,0454x | 0,05590 | 88,97% |

Evaluación de rechazo (juez LiquidAI/d1-2B):

| Modelo | Variante | Esfuerzo | EN dañino | JA dañino | XSTest seguro |
|---|---|---|---:|---:|---:|
| Base UD | UD-Q8_K_XL | low (0,2) | 92/93 (98,9%) | 25/25 (100,0%) | 128/250 (51,2%) |
| Base UD | UD-Q8_K_XL | high (0,9) | 40/40 (100,0%) | — | 0/20 (0,0%) |
| v1 original | UD-Q8_K_XL | high (0,9) | 10/40 (25,0%) | — | 7/20 (35,0%) |
| Aggressive | UD-Q8_K_XL | low (0,2) | 1/93 (1,1%) | 0/25 (0,0%) | 2/250 (0,8%) |
| Aggressive | UD-Q8_K_XL | high (0,9) | 0/40 (0,0%) | — | 0/20 (0,0%) |
| Aggressive | UD-Q4_K_XL | low (0,2) | 4/93 (4,3%) | 0/25 (0,0%) | 2/250 (0,8%) |
| Aggressive | UD-Q4_K_XL | high (0,9) | 0/40 (0,0%) | — | 0/20 (0,0%) |
| Aggressive | UD-Q3_K_XL | low (0,2) | 3/93 (3,2%) | 0/25 (0,0%) | 1/100 (1,0%) |
| Aggressive | UD-IQ3_XXS | low (0,2) | 2/93 (2,1%) | 1/25 (4,0%) | 1/100 (1,0%) |
| Aggressive | UD-Q2_K_XL | low (0,2) | 3/93 (3,2%) | 0/25 (0,0%) | 1/100 (1,0%) |

Capacidades (UD-Q8_K_XL): MMLU 77,63% (1.140 preguntas estratificadas) y GSM8K 97,33% con High-CoT. La variante Balanced obtiene MMLU 78,86% y GSM8K 96,67% con KLD 0,06186 y ratio 1,0462x.

## Requisitos de hardware

- VRAM estimada: UD-Q8_K_XL 22,87 GB; UD-Q4_K_XL 17,63 GB; UD-Q4_K_M 16,61 GB; UD-Q3_K_XL 13,63 GB; UD-IQ3_XXS 11,66 GB; UD-Q2_K_XL 9,14 GB. Añadir ~642 MB para el proyector de visión si se usa multimodal.
- GPU recomendadas: A100 40/80 GB o H100 para UD-Q8_K_XL con contexto largo; RTX 4090 (24 GB) para UD-Q8_K_XL ajustado o UD-Q4_K_XL con holgura.
- Consumer GPU: UD-Q4_K_XL y UD-Q4_K_M caben en GPUs de 16-24 GB; UD-IQ3_XXS y UD-Q2_K_XL caben en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) y en configuraciones con offload parcial a CPU.
- Despliegue: llama.cpp y Ollama son las rutas naturales para GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión. La etiqueta endpoints_compatible sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-Aggressive (este) | 26,07B (MoE) | no disponible | Apache 2.0 | GGUF | 0/40 rechazos EN high; GSM8K 97,33% |
| Inkling-2-Mini-Abliterated-Balanced | 26,07B (MoE) | no disponible | Apache 2.0 | GGUF | Menor deriva (KLD 0,06186); 1/40 rechazos EN high; MMLU 78,86% |
| Inkling-2-Mini-Abliterated v1 | 26,07B (MoE) | no disponible | Apache 2.0 | GGUF | 10/40 rechazos EN high; XSTest 35,0% |
| thinkingmachines/Inkling-2-Mini (base) | 26,07B (MoE) | no disponible | Apache 2.0 | safetensors | 40/40 rechazos EN high; XSTest 0,0% |

## Limitaciones y advertencias

- La abliteración elimina los rechazos de seguridad: el autor reporta 0/40 en inglés de alta esfuerzo y 0/25 en japonés, lo que hace el modelo inadecuado para despliegues públicos sin filtros externos.
- Riesgo elevado de generar contenido dañino, sesgado o ilegal; el propio autor lo restringe a investigación, red-teaming y evaluación de alineamiento.
- La abliteración introduce deriva respecto al base: KLD de 0,07266 y ratio de perplejidad 1,0566x en UD-Q8_K_XL, con caída de MMLU de 78,86% (Balanced) a 77,63% (Aggressive).
- Las cuantizaciones de 3 bits e inferiores (UD-IQ3_XXS, UD-Q2_K_XL) muestran tasas de rechazo residuales del 2-4% y pueden degradar capacidades no medidas.
- Idiomas limitados a inglés y japonés; no se documenta soporte de español ni de otros idiomas.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en ventanas largas.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero las implicaciones legales y éticas del contenido generado recaen en el usuario.
- El modelo base tiene 26B parámetros; las variantes de mayor tamaño requieren GPUs profesionales para un rendimiento adecuado.
- Solo 1 like y 9.561 descargas en el momento de la ficha; ecosistema de validación externa muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF
- Variante Balanced: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF
- v1 baseline: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Dataset Semantic-Harmful: https://huggingface.co/datasets/heretic-org/Semantic-Harmful
- Dataset Semantic-Harmless: https://huggingface.co/datasets/heretic-org/Semantic-Harmless
