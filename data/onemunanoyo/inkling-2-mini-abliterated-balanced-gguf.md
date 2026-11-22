# onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF

## Resumen

Inkling-2-Mini-Abliterated-Balanced-GGUF es una cuantización GGUF de la familia Unsloth Dynamic (UD) del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario onemunanoyo. Se trata de una variante "abliterated" (es decir, con la dirección de rechazo suprimida mediante manipulación de pesos) orientada a investigación, red-teaming y evaluación de alineamiento. El modelo conserva la arquitectura multimodal image-text-to-text del original y admite conversación multi-turno.

El modelo base Inkling-2-Mini pertenece a la familia Inkling-2 de Thinking Machines, con arquitectura MoE (mezcla de expertos) y un total de 26.070.390.272 parámetros según los safetensors del repositorio. La variante aquí descrita mantiene las asignaciones de cuantización por tensor del build UD original (BF16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4_NL, NVFP4, MXFP4, Q2_0) y se distribuye en seis niveles de cuantización, desde UD-Q8_K_XL (22,87 GB) hasta UD-Q2_K_XL (9,14 GB), más un proyector de visión BF16 independiente.

La relevancia de esta ficha radica en que documenta un caso de "abliteración" con métricas explícitas de coste en calidad (divergencia KL y perplejidad frente al baseline sin modificar) y de reducción de rechazos, lo que la convierte en un artefacto útil para estudiar los compromisos entre alineamiento, capacidad y degradación de la distribución. La licencia es Apache 2.0 y los idiomas declarados son inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer, con núcleo "looped" (48 visitas) según la metodología de abliteración; multimodal image-text-to-text |
| Parametros totales | 26.070.390.272 (26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q8_K_XL, UD-Q4_K_XL, UD-Q4_K_M, UD-Q3_K_XL, UD-IQ3_XXS, UD-Q2_K_XL (Unsloth Dynamic); tipos por tensor: BF16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4_NL, NVFP4, MXFP4, Q2_0 |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con proyector de visión mmproj-BF16.gguf) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de 26,07 mil millones de parámetros totales. La model card no detalla el número de parámetros activos, el número de expertos, la composición del dataset de preentrenamiento ni el volumen de tokens; tampoco especifica si hubo RLHF o DPO en el modelo original. Lo que sí se documenta es la intervención de abliteración aplicada sobre los pesos: una metodología v2 denominada "CoT-Residual MPOA + Fixed-Scale Lagrangian Dual".

Esta metodología construye una dirección de rechazo a partir de rollouts reales de cadena de pensamiento (blend `mpoa_cot_blend`, combinando direcciones tempranas, medias y de frontera de respuesta a lo largo de las 48 visitas del núcleo looped) y de un contraste residual de rechazo en modo de alto esfuerzo (`residual_w=0.2`). Los objetivos de la intervención incluyen `attn_output.weight`, `ffn_down_exps.weight`, `attn_gate.weight` (capas >= 6), `ffn_gate_inp.weight` (router MoE en F32, capas >= 6) y `output.weight` (0,05), mediante SVD de rango 2 sobre el núcleo looped. El resultado es una variante "Balanced" que prioriza minimizar la divergencia KL (0,048–0,062) y el incremento de perplejidad (1,039x–1,052x) a costa de no eliminar por completo los rechazos, frente a la variante "Aggressive" del mismo autor.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con proyector de visión BF16 separado.
- Razonamiento con modos de esfuerzo configurables (`reasoning_effort` con valores como `low` 0.2 y `high` 0.9, este último por defecto).
- Cadena de pensamiento explícita (marcadores `<|content_thinking|>` y frontera de respuesta).
- Comportamiento "uncensored": supresión de la dirección de rechazo por abliteración, lo que reduce drásticamente las negativas a peticiones dañinas.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Red-teaming y evaluación de alineamiento: el modelo sirve como sujeto de prueba para medir la eficacia de mecanismos de rechazo y estudiar cómo la abliteración redistribuye las respuestas ante prompts dañinos, con métricas de rechazo documentadas (de 98,9% a 1,1% en inglés con esfuerzo bajo).
- Investigación sobre calibración de cuantizaciones: los seis niveles UD permiten estudiar el compromiso entre tamaño (de 9,14 GB a 22,87 GB), perplejidad y divergencia KL frente al baseline, con datos publicados por variante.
- Análisis de degradación por intervención de pesos: útil para comparar metodologías de abliteración (Balanced frente a Aggressive) midiendo el coste en KLD y el residuo de rechazos.
- Despliegue local en hardware de consumo: la variante UD-Q2_K_XL (9,14 GB) y UD-IQ3_XXS (11,66 GB) permiten ejecutar un MoE de 26 mil millones en GPUs con VRAM moderada mediante llama.cpp u Ollama.
- Evaluación multimodal controlada: el proyector de visión BF16 sin modificar permite comprobar si la abliteración afecta a la rama visual o solo a la textual.
- Estudio de comportamiento multilingüe diferencial: la comparación de rechazos entre inglés (1/93) y japonés (0/25) con esfuerzo bajo ofrece un caso concreto para analizar cómo la intervención afecta de forma desigual a distintos idiomas.
- Generación de conversación sin restricciones en entornos de investigación cerrados: para pruebas de robustez de filtros y clasificadores de seguridad aguas abajo.

## Benchmarks y rendimiento

Perplejidad y divergencia KL frente al baseline UD sin modificar (WikiText-2, `llama-perplexity --kl-divergence`, `-c 512`):

| Variante | PPL base | PPL abliterada | Ratio (Q/base) | KLD media | Same Top-p |
|---|---:|---:|---:|---:|---:|
| UD-Q8_K_XL | 8,3244 ± 0,3476 | 8,7090 ± 0,3743 | 1,0462x | 0,06186 | 89,33% |
| UD-Q4_K_XL | 8,3218 ± 0,3473 | 8,7230 ± 0,3750 | 1,0482x | 0,06111 | 89,86% |
| UD-Q4_K_M | 8,3210 ± 0,3472 | 8,7306 ± 0,3754 | 1,0492x | 0,06111 | 89,75% |
| UD-Q3_K_XL | 8,3762 ± 0,3488 | 8,7885 ± 0,3780 | 1,0492x | 0,06079 | 89,57% |
| UD-IQ3_XXS | 8,4607 ± 0,3527 | 8,9039 ± 0,3828 | 1,0524x | 0,05672 | 89,07% |
| UD-Q2_K_XL | 8,7340 ± 0,3653 | 9,0761 ± 0,3857 | 1,0392x | 0,04791 | 89,78% |

Evaluación de rechazos (juez `LiquidAI/d1-2B`):

| Modelo | Variante | Esfuerzo | EN dañino | JA dañino | XSTest seguro |
|---|---|---|---:|---:|---:|
| Base UD | UD-Q8_K_XL | low (0,2) | 92/93 (98,9%) | 25/25 (100,0%) | 128/250 (51,2%) |
| Balanced | UD-Q8_K_XL | low (0,2) | 1/93 (1,1%) | 0/25 (0,0%) | no evaluado |
| Balanced | UD-Q8_K_XL | high (0,9) | 1/40 (2,5%) | no disponible | 2/20 (10,0%) |

Nota del autor: las pruebas de generación conductual sobre UD-Q4_K_XL hasta UD-Q2_K_XL se omitieron en esta build (`--skip-eval`); las seis cuantizaciones solo están verificadas mediante KLD/PPL nativo de `llama-perplexity` frente a su propio baseline.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead de contexto. UD-Q2_K_XL ~9,14 GB, UD-IQ3_XXS ~11,66 GB, UD-Q3_K_XL ~13,63 GB, UD-Q4_K_M ~16,61 GB, UD-Q4_K_XL ~17,63 GB, UD-Q8_K_XL ~22,87 GB. El proyector de visión añade ~641,81 MB.
- GPU recomendadas: para UD-Q8_K_XL, A100 40 GB o H100; para UD-Q4_K_M y UD-Q4_K_XL, RTX 4090 (24 GB) o A6000 (48 GB); para UD-Q3_K_XL e inferiores, RTX 4090, RTX 4080 (16 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, las variantes UD-Q2_K_XL, UD-IQ3_XXS y UD-Q3_K_XL caben en GPUs de 12–16 GB; UD-Q4_K_M y UD-Q4_K_XL requieren 24 GB para dejar margen de contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, usado para las métricas de PPL/KLD), Ollama, y servidores compatibles con endpoints (`endpoints_compatible`). vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Inkling-2-Mini-Abliterated-Balanced (este) | 26,07 mil M | no disponible | Apache 2.0 | GGUF UD (6 niveles) | Abliteración con KLD 0,048–0,062; rechazos EN 1,1% (low) / 2,5% (high) |
| Inkling-2-Mini-Abliterated-Aggressive | 26,07 mil M (base) | no disponible | Apache 2.0 | GGUF UD | Variante del mismo autor con 0/40 y 0/20 rechazos a cambio de +0,011 KLD (~1% PPL) |
| Inkling-2-Mini-Abliterated v1 (`bw_s088`) | 26,07 mil M (base) | no disponible | Apache 2.0 | GGUF | Baseline previo con 25,0% (10/40) de rechazos en esfuerzo alto |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 mil M | no disponible | Apache 2.0 | safetensors / GGUF | Modelo original sin abliterar; rechazos EN 98,9% (low) |

No se dispone de datos de benchmarks de capacidad (MMLU, HumanEval, GSM8K) para ninguno de los modelos de la comparativa en la información proporcionada, por lo que la comparación se limita a parámetros, licencia, formato y métricas de rechazo y divergencia.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteración suprime deliberadamente los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o inseguro. El autor lo restringe a investigación, red-teaming y evaluación de alineamiento.
- Riesgo de alucinación: no cuantificado en la información disponible; la intervención de pesos sobre `output.weight` y capas de atención puede alterar la distribución de salida más allá de los rechazos.
- Degradación medible de calidad: incremento de perplejidad de 1,039x a 1,052x y KLD de 0,048 a 0,062 según cuantización; la variante UD-Q2_K_XL es la que menos KLD introduce pero parte de una PPL base peor (8,73).
- Sesgo multilingüe en la intervención: la reducción de rechazos es mucho más agresiva en inglés (1/93) que en japonés (0/25), lo que sugiere un efecto desigual por idioma.
- Idiomas limitados: solo inglés y japonés declarados; el rendimiento en castellano no está evaluado ni garantizado.
- Contexto no documentado: se desconoce la longitud máxima de contexto del modelo base, lo que impide planificar despliegues con ventanas largas.
- Evaluación incompleta: las cuantizaciones UD-Q4_K_XL a UD-Q2_K_XL no tienen benchmarks conductuales en esta build, solo KLD/PPL; el XSTest seguro solo se midió en UD-Q8_K_XL con esfuerzo alto (2/20, 10,0%).
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza del modelo hace recomendable una revisión legal y de políticas de contenido antes de cualquier despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF base de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Variante Aggressive del mismo autor: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF
- Baseline v1 (`bw_s088`): https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-GGUF
- Checksums: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF/blob/main/SHA256SUMS.txt
- Dataset de evaluación semántica (dañino): https://huggingface.co/datasets/heretic-org/Semantic-Harmful
- Dataset de evaluación semántica (inocuo): https://huggingface.co/datasets/heretic-org/Semantic-Harmless
- Juez de evaluación de rechazos: https://huggingface.co/LiquidAI/d1-2B
