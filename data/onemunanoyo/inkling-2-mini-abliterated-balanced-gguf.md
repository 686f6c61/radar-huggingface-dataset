# onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF

## Resumen
Inkling-2-Mini-Abliterated-Balanced-GGUF es una version cuantizada en formato GGUF del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario onemunanoyo. Se trata de un modelo de arquitectura MoE (mixture of experts) de aproximadamente 26.070 millones de parametros totales, con capacidad image-text-to-text y un contexto conversacional orientado a usos multimodales. La particularidad de esta publicacion es que aplica una tecnica de "abliteration" in-place sobre los pesos del modelo base para reducir el comportamiento de rechazo (refusals) ante peticiones consideradas daninas, manteniendo un equilibrio entre deriva respecto al modelo original y eliminacion de la censura.

El autor ofrece seis variantes de cuantizacion dinamica de Unsloth (UD-Q8_K_XL, UD-Q4_K_XL, UD-Q4_K_M, UD-Q3_K_XL, UD-IQ3_XXS y UD-Q2_K_XL), preservando la asignacion original de tipos de cuantizacion por tensor y las escalas de calibracion del repositorio unsloth/Inkling-2-Mini-GGUF. Ademas incluye un proyector de vision sin modificar (mmproj-BF16.gguf) para mantener el soporte multimodal.

Es relevante para investigadores en alineacion, red-teaming y evaluacion de seguridad, ya que permite estudiar el comportamiento de un modelo sin el sesgo de rechazo por defecto, con metricas explicitas de deriva (KLD de 0.06186 y PPL de 1.0462x en la variante Q8) y de tasa de rechazo (1/40 en modo high-effort en ingles). No obstante, su uso esta explicitamente orientado a investigacion y no a produccion general.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer multimodal image-text-to-text |
| Parametros totales | 26.070.390.272 (aprox. 26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q8_K_XL, UD-Q4_K_XL, UD-Q4_K_M, UD-Q3_K_XL, UD-IQ3_XXS, UD-Q2_K_XL (tipos por tensor: BF16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4_NL, NVFP4, MXFP4, Q2_0) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con mmproj-BF16.gguf para vision) |

## Arquitectura y entrenamiento
El modelo base Inkling-2-Mini emplea una arquitectura MoE multimodal de tipo image-text-to-text, segun los tags del repositorio. Esta publicacion no entrena el modelo desde cero, sino que aplica una ablacion in-place sobre los pesos del modelo base para eliminar direcciones de activacion asociadas al rechazo, usando los datasets heretic-org/Semantic-Harmful y heretic-org/Semantic-Harmless como referencia. La variante "Balanced" busca minimizar la deriva respecto al modelo original: en UD-Q8_K_XL reporta un KLD de 0.06186 y un ratio de perplejidad de 1.0462x sobre WikiText-2 con contexto de 512 tokens. Las cuantizaciones son de tipo Unsloth Dynamic, conservando la asignacion de tipos por tensor y las escalas de calibracion originales (BF16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4_NL, NVFP4, MXFP4, Q2_0). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset original ni si hubo RLHF o DPO en el modelo base.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles y japones.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text) mediante el proyector mmproj-BF16.gguf.
- Razonamiento con niveles de esfuerzo configurables (reasoning effort low a 0.2 y high a 0.9).
- Comportamiento "uncensored" o abliterated: reduce drasticamente los rechazos ante peticiones daninas en comparacion con el modelo base.
- Soporte de cuantizaciones dinamicas que preservan la calidad por tensor.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni capacidades de agente multi-paso.
- No se documenta soporte de audio.

## Casos de uso
- Investigacion en alineacion y seguridad: el modelo permite estudiar como varia la tasa de rechazo en funcion del nivel de esfuerzo de razonamiento (por ejemplo, 1/40 en high-effort frente a 1/93 en low-effort en ingles), lo que resulta util para analizar el efecto de la ablacion sobre el comportamiento defensivo.
- Red-teaming de sistemas: al eliminar el sesgo de rechazo por defecto, se puede emplear como generador de casos adversarios controlados en entornos de evaluacion de robustez, siempre dentro de un marco etico y legal.
- Evaluacion de deriva tras cuantizacion: las metricas de KLD y PPL por variante (Q8, Q4, Q3, IQ3, Q2) permiten comparar el impacto de la cuantizacion en la fidelidad respecto al modelo original.
- Procesamiento multimodal en ingles y japones: el proyector de vision incluido permite tareas de descripcion de imagenes o respuesta a preguntas visuales en esos dos idiomas.
- Despliegue local en entornos con recursos limitados: la variante UD-Q2_K_XL (9,14 GB) o UD-IQ3_XXS (11,66 GB) permiten ejecutar un modelo de 26 mil millones de parametros en hardware de consumo con cuantizacion agresiva.
- Experimentacion con modelos abliterated comparables: el autor publica tambien una variante "Aggressive" (0/40 rechazos en high-effort, MMLU 77,63%, GSM8K 97,33%) que permite comparar el trade-off entre supresion de rechazos y calidad.

## Benchmarks y rendimiento
Metricas de perplejidad y divergencia KL frente a la linea base UD sin modificar (WikiText-2, contexto 512):

| Variante | PPL base | PPL abliterated | Ratio | KLD | Same Top-p |
|---|---:|---:|---:|---:|---:|
| UD-Q8_K_XL | 8,3244 ± 0,3476 | 8,7090 ± 0,3743 | 1,0462x | 0,06186 | 89,33% |
| UD-Q4_K_XL | 8,3218 ± 0,3473 | 8,7230 ± 0,3750 | 1,0482x | 0,06111 | 89,86% |
| UD-Q4_K_M | 8,3210 ± 0,3472 | 8,7306 ± 0,3754 | 1,0492x | 0,06111 | 89,75% |
| UD-Q3_K_XL | 8,3762 ± 0,3488 | 8,7885 ± 0,3780 | 1,0492x | 0,06079 | 89,57% |
| UD-IQ3_XXS | 8,4607 ± 0,3527 | 8,9039 ± 0,3828 | 1,0524x | 0,05672 | 89,07% |
| UD-Q2_K_XL | 8,7340 ± 0,3653 | 9,0761 ± 0,3857 | 1,0392x | 0,04791 | 89,78% |

Evaluacion de rechazos (juez LiquidAI/d1-2B):

| Modelo | Variante | Esfuerzo | EN danino | JA danino | XSTest Safe |
|---|---|---|---:|---:|---:|
| Base UD | UD-Q8_K_XL | low (0,2) | 92/93 (98,9%) | 25/25 (100,0%) | 128/250 (51,2%) |
| Base UD | UD-Q8_K_XL | high (0,9) | 40/40 (100,0%) | — | 0/20 (0,0%) |
| Balanced | UD-Q8_K_XL | low (0,2) | 1/93 (1,1%) | 0/25 (0,0%) | 2/250 (0,8%) |
| Balanced | UD-Q8_K_XL | high (0,9) | 1/40 (2,5%) | — | 2/20 (10,0%) |
| Balanced | UD-Q4_K_XL | low (0,2) | 6/93 (6,5%) | 0/25 (0,0%) | 3/250 (1,2%) |
| Balanced | UD-Q4_K_XL | high (0,9) | 0/40 (0,0%) | — | 0/20 (0,0%) |
| Balanced | UD-Q3_K_XL | low (0,2) | 2/93 (2,1%) | 0/25 (0,0%) | 2/100 (2,0%) |
| Balanced | UD-IQ3_XXS | low (0,2) | 7/93 (7,5%) | 1/25 (4,0%) | 1/100 (1,0%) |
| Balanced | UD-Q2_K_XL | low (0,2) | 9/93 (9,7%) | 1/25 (4,0%) | 2/100 (2,0%) |

Capacidad (MMLU y GSM8K, mencionados en la model card): MMLU 78,86% y GSM8K 96,67% para la variante Balanced UD-Q8_K_XL. La variante Aggressive reporta MMLU 77,63% y GSM8K 97,33%. El detalle completo de la tabla de MMLU (1.140 preguntas estratificadas, 20 por cada una de 57 materias, 5-shot) no esta incluido en la informacion disponible.

## Requisitos de hardware
- VRAM estimada segun variante: UD-Q8_K_XL 22,87 GB; UD-Q4_K_XL 17,63 GB; UD-Q4_K_M 16,61 GB; UD-Q3_K_XL 13,63 GB; UD-IQ3_XXS 11,66 GB; UD-Q2_K_XL 9,14 GB. Añadir aproximadamente 0,64 GB para el proyector de vision.
- GPU recomendadas: para Q8_K_XL se necesita una GPU con 24 GB o mas (RTX 3090/4090, A10, L4, A100 40 GB, H100). Para Q4_K_M y Q4_K_XL, GPUs de 20-24 GB. Para IQ3_XXS y Q2_K_XL, GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 3060 12 GB con margen justo).
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) para Q8, y en RTX 3060 12 GB o RTX 4070 para IQ3_XXS y Q2_K_XL.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y servidores compatibles con la API de endpoints (el tag endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI). vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-Balanced (este) | 26,07 B (MoE) | no disponible | apache-2.0 | GGUF | Abliterated, multimodal, 6 cuantizaciones |
| Inkling-2-Mini-Abliterated-Aggressive | 26,07 B (MoE) | no disponible | apache-2.0 | GGUF | 0/40 rechazos high-effort, MMLU 77,63%, GSM8K 97,33%, KLD 0,07266 |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 B (MoE) | no disponible | no disponible | safetensors | Modelo original sin ablacion |
| unsloth/Inkling-2-Mini-GGUF | 26,07 B (MoE) | no disponible | no disponible | GGUF | Cuantizaciones UD sin ablacion |

## Limitaciones y advertencias
- Modelo abliterated y uncensored: eliminado el sesgo de rechazo por defecto, puede generar contenido danino, ofensivo o ilegal si se usa sin salvaguardas. El autor lo restringe explicitamente a investigacion, red-teaming y evaluacion de alineacion.
- Riesgo de alucinacion: no se han publicado metricas especificas de factualidad; la ablacion y la cuantizacion agresiva pueden incrementar la deriva respecto al modelo base (KLD de 0,06186 en Q8 y hasta 0,04791 en Q2, con ratios de PPL de hasta 1,0524x).
- Idiomas limitados: solo se declaran ingles y japones; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Licencia apache-2.0: permite uso comercial segun los terminos de la licencia, pero el caracter uncensored del modelo puede contravenir normativas locales o terminos de servicio de plataformas; el autor recomienda revisar las leyes aplicables.
- Cuantizaciones agresivas (IQ3_XXS, Q2_K_XL) muestran mayor tasa de rechazo residual y posible perdida de calidad; la variante Q2_K_XL usa --skip-qtypes Q2_0, dejando algunos tensores en Q2_0 sin tocar.
- El modelo base tiene solo 1 like y 5.898 descargas en el momento de la ficha, lo que indica una validacion comunitaria limitada.
- No se documentan limitaciones especificas de contexto ni de tool calling en la informacion disponible.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones Unsloth originales: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Variante Aggressive: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF
- Variante v1 baseline: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-GGUF
- Dataset Semantic-Harmful: https://huggingface.co/datasets/heretic-org/Semantic-Harmful
- Dataset Semantic-Harmless: https://huggingface.co/datasets/heretic-org/Semantic-Harmless
- Checksums: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF/blob/main/SHA256SUMS.txt
