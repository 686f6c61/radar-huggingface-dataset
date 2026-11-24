# SalahAbdoNLP/isnad-decider-0.6b

## Resumen

`isnad-decider-0.6b` es un adaptador LoRA de PEFT sobre el modelo base `Qwen/Qwen3-Reranker-0.6B`, desarrollado por el autor SalahAbdoNLP (publicado bajo el identificador `SalahAbdoNLP` en Hugging Face). Su propósito es resolver un problema concreto en recuperación de información aumentada (RAG): la asimetría entre contradicción y entailment que sufren los cross-encoders NLI estándar cuando se enfrentan a documentos irrelevantes en dominios abiertos. El modelo clasifica la postura epistémica de un documento respecto a una afirmación en tres categorías (`support`, `against`, `neutral`) mediante un único forward pass con `logits_to_keep=1`, sin generar tokens.

El adaptador tiene un tamaño de solo 39,4 MB (`r=16`, `alpha=32`) y se apoya en el backbone de 0,6B parámetros de Qwen3-Reranker. Según la model card, reduce la tasa de falsas contradicciones en abstracts PubMed irrelevantes del 44,98 % (referencia `nli-deberta-v3-large`) al 1,15 %, lo que supone una mejora de 39,1×. Está pensado para el marco que el autor denomina Isnād-IR e Isnād-RAG (Proof-Carrying Epistemic Information Retrieval), con integración de un verificador Lean 4 para la fase de ranking.

Su relevancia actual radica en que ofrece una alternativa ligera y de licencia Apache-2.0 a los cross-encoders NLI de mayor tamaño para tareas de verificación de hechos y RAG con fuentes conflictivas, manteniendo la posibilidad de alternar mediante LoRA entre el modo de relevancia binaria (`yes`/`no`) del modelo base y el modo de postura epistémica de tres vías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador PEFT LoRA sobre `Qwen/Qwen3-Reranker-0.6B` |
| Parametros totales | 0,6B (modelo base); adaptador LoRA de 39,4 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card usa `max_length=1024` en el ejemplo de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |
| Rango LoRA | r=16, lora_alpha=32, lora_dropout=0.05 |
| Módulos adaptados | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Dataset de entrenamiento | nyu-mll/multi_nli (split train únicamente) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de PEFT montado sobre el backbone decoder-only de Qwen3-Reranker-0.6B. La innovación principal no está en la arquitectura del transformer, sino en el objetivo de entrenamiento: clasificación de postura epistémica de tres vías mediante entropía cruzada sobre un único token (`logits_to_keep=1`), lo que evita cualquier generación autoregresiva y reduce la inferencia a un solo forward pass. Los tokens objetivo verificados del tokenizador Qwen3 son `against` (68749), `support` (23362) y `neutral` (59568).

El corpus de entrenamiento consta de 42.000 ejemplos derivados exclusivamente del split `train` de `nyu-mll/multi_nli`, con una receta que el autor describe como "zero-leakage": cero datos de PubMed/SciFact, Wikipedia/Climate-FEVER, idebate/ArguAna o corpus legales. La composición es de 11.000 ejemplos `support` (40 % de una sola frase, 60 % envueltos en 3-6 frases distractoras del mismo género), 11.000 `against` (35 % de una frase, 50 % multi-frase, 15 % oposición simétrica invertida), 8.000 `neutral` intra-documento y 12.000 "quimeras" hard-negative generadas con BM25 del mismo género etiquetadas como `neutral`. El entrenamiento consistió en 1 época (1.313 pasos de optimizador), LR coseno de 2e-4, precisión bf16, durante 2.134 segundos en una única NVIDIA L4. El tarball de publicación tiene SHA-256 `45f47345c5f2348712e1b8075bd007c7485430e3f74e3be5933300db5353cc20`.

La innovación técnica destacable es el "LoRA toggling": con un solo backbone congelado se puede alternar entre el modo de relevancia binaria original (`yes`/`no`) y el modo de postura epistémica de tres vías, lo que permite integrar el verificador Lean 4 (VEGR) en el pipeline de ranking sin duplicar el modelo base.

## Capacidades

- Clasificación de postura epistémica de tres vías (`support`, `against`, `neutral`) entre una afirmación y un documento, en un único forward pass sin generación de tokens.
- Detección de contradicciones en documentos irrelevantes con baja tasa de falsos positivos (1,15 % en PubMed irrelevante según la model card).
- Rechazo de "quimeras" hard-negative generadas por BM25 (tasa de rechazo neutral del 91,17 % en validación).
- Modo de relevancia binaria (`yes`/`no`) heredado del modelo base Qwen3-Reranker-0.6B, conmutable mediante LoRA toggling.
- Verificación de hechos y ranking en pipelines de RAG con fuentes conflictivas (Conflicting RAG).
- Integración con un verificador Lean 4 (VEGR) para el cálculo de NDCG en el pipeline de evaluación.
- Soporte de instrucciones vía prompt con formato chat de Qwen (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`).
- Capacidad multilingüe limitada al inglés (idioma declarado: `en`).
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Verificación de hechos en RAG con fuentes conflictivas: el modelo clasifica cada pasaje recuperado como `support`, `against` o `neutral` respecto a la afirmación del usuario, permitiendo que el generador final reciba únicamente evidencia consistente y descarte pasajes contradictorios irrelevantes. Su baja tasa de falsa contradicción (1,15 %) evita que abstracts no relacionados se marquen erróneamente como refutaciones.
- Filtrado de recuperación en dominios científicos: en pipelines sobre PubMed o SciFact, el adaptador puede actuar como etapa de reranking epistémico tras BM25, reduciendo el ruido de pasajes no pertinentes antes de la generación.
- Detección de desinformación y claims disputados: en corpus tipo Climate-FEVER, el modelo identifica posturas a favor y en contra de una afirmación, con métricas de recuperación de ambos lados (`Both-Sides R@2 = 34,42 %` en Track 2A según la model card), útil para sistemas que deben presentar evidencia contradictoria de forma equilibrada.
- Reranking ligero en producción con presupuesto de GPU reducido: al ser un adaptador de 39,4 MB sobre un backbone de 0,6B, puede desplegarse en GPUs de consumo (por ejemplo, una L4 o RTX 4090) y ejecutarse en un solo forward pass por par (claim, documento), con latencia muy inferior a la de un cross-encoder grande que genere texto.
- Auditoría de respuestas generadas: dado un borrador de respuesta y los documentos citados, el modelo verifica si cada documento respalda, contradice o es neutral respecto a las afirmaciones del borrador, sirviendo como capa de control de calidad antes de publicar.
- Construcción de índices epistémicos: el pipeline puede precomputar la postura de cada pasaje de un corpus respecto a un conjunto de claims, generando un grafo de evidencia a favor y en contra que alimente motores de búsqueda o sistemas de argumentación.
- Integración en pipelines con verificación formal: la combinación con el verificador Lean 4 (VEGR) permite usar el modelo como componente de un sistema de "Proof-Carrying IR" donde las decisiones de ranking quedan registradas y verificables.

## Benchmarks y rendimiento

Resultados publicados en la model card (no verificados de forma independiente):

| Benchmark | Métrica | isnad-decider-0.6b | Referencia |
|---|---|---|---|
| MNLI validation_mismatched + 600 quimeras BM25 | Precisión 3 vías | 82,0 % | 44,4 % (base) |
| MNLI validation_mismatched | Recall de contradicción | 79,48 % | 5,78 % (base, 13,8×) |
| MNLI (quimeras) | Rechazo neutral de quimeras | 91,17 % | no disponible |
| MNLI (quimeras) | Tasa de falso support | 2,17 % | 5,17 % (base) |
| BEIR/SciFact (7.598 pares PubMed) | Falsa contradicción (p ≥ 0,50) | 1,15 % | 44,98 % (DeBERTa-v3-large Max-Sent, 39,1×) |
| BEIR/SciFact | Falso support (p ≥ 0,50) | 0,04 % | 12,03 % (DeBERTa-v3-large, 300×) |
| BEIR/SciFact | SNR support POS/NEG | 14,60× | 0,86× (DeBERTa-v3-large, invertido) |
| BEIR/SciFact | SNR against POS/NEG | 3,04× | no disponible |
| BEIR (NDCG@10, Lean 4 VEGR) | NDCG@10 | 75,32 | 75,12 (Qwen3-Reranker-0.6B), 73,86 (E5-large), 68,33 (BM25) |
| Climate-FEVER Track 2A | NDCG@5 | 84,08 | no disponible |
| Climate-FEVER Track 2A | Both-Sides R@2 (154 DISPUTED) | 34,42 % | 22,73 % (Qwen3-0.6B, +51,4 % rel.) |
| Climate-FEVER Track 2A | Both-Sides R@3 | 57,14 % | no disponible |
| Climate-FEVER Track 2A | DISPUTED NDCG@5 | 88,97 | no disponible |
| Climate-FEVER Track 2B | Sent NDCG@10 | 34,92 | no disponible |
| Climate-FEVER Track 2B | Refute R@3 | 25,21 % | no disponible |
| Climate-FEVER Track 2B | DISPUTED Both-Sides R@2 | 9,09 % | 4,55 % (Qwen3-0.6B, 2,00×) |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 0,6B en bf16 ocupa aproximadamente 1,2 GB de pesos; con caché de activaciones y contexto de 1.024 tokens, el consumo total debería situarse en el rango de 2-4 GB, aunque la model card no publica cifras exactas.
- GPU recomendadas: el entrenamiento se realizó en una única NVIDIA L4 (2.134 s para 1.313 pasos). Para inferencia, cualquier GPU con al menos 4-6 GB de VRAM es suficiente en bf16; A100 y H100 ofrecerían mayor throughput pero no son necesarias.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y similares; la model card no publica una lista oficial de compatibilidad.
- Opciones de despliegue: `transformers` + `peft` (el ejemplo de la model card usa `AutoModelForCausalLM` con `attn_implementation="sdpa"` y `PeftModel.from_pretrained`); no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, aunque al ser un adaptador PEFT sobre Qwen3 podría integrarse en servidores compatibles con LoRA.
- Latencia y throughput: no se publican cifras de latencia por petición ni de throughput. El entrenamiento completo en una L4 sugiere que la inferencia por par (claim, documento) es del orden de milisegundos, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isnad-decider-0.6b | 0,6B + LoRA 39,4 MB | no disponible | Clasificación epistémica 3 vías, un forward pass | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-Reranker-0.6B | 0,6B | no disponible | Reranking de relevancia binaria | Apache-2.0 | Hugging Face |
| nli-deberta-v3-large | ~0,4B | 512 tokens (típico en DeBERTa-v3) | NLI de 3 vías (SNLI/MNLI) | MIT (según el modelo original de Microsoft) | Hugging Face |
| SalahAbdoNLP/isnad-decider-4b | 4B + LoRA | no disponible | Clasificación epistémica 3 vías, versión flagship | Apache-2.0 (según la model card) | Hugging Face |

La comparación directa con `nli-deberta-v3-large` es la más relevante: la model card reporta que el adaptador reduce la tasa de falsa contradicción del 44,98 % al 1,15 % en abstracts PubMed irrelevantes, manteniendo una precisión de 3 vías del 82,0 % en MNLI. Frente a su modelo base Qwen3-Reranker-0.6B, mejora el NDCG@10 en BEIR (75,32 frente a 75,12) y multiplica por 2 la recuperación de ambos lados en claims disputados de Climate-FEVER. La versión 4B del mismo autor está pensada para mayor precisión en ensayos largos y en Conflicting RAG v0.5 (84,78 % FaithEval All-3 según la model card).

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés (`en`); su rendimiento en otros idiomas no está documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no indica revisión por pares ni validación independiente de los resultados reportados.
- Los benchmarks publicados proceden del propio autor; no se han verificado de forma independiente.
- El adaptador depende del modelo base `Qwen/Qwen3-Reranker-0.6B`; no es un modelo autónomo y requiere descargar y cargar el backbone completo.
- El uso está restringido a la tarea de clasificación de postura epistémica con el formato de prompt específico de la model card; no es un modelo generativo de propósito general.
- Riesgo de alucinación: aunque el modelo no genera texto libre (solo emite un token de clase), la clasificación puede ser errónea en dominios no representados en MultiNLI, como textos legales, médicos especializados o conversaciones coloquiales.
- La receta de entrenamiento "zero-leakage" se basa en MultiNLI exclusivamente; el rendimiento en dominios fuera de la distribución de MultiNLI (por ejemplo, SciFact o Climate-FEVER) se reporta como zero-shot y podría degradarse en otros corpus.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del modelo base Qwen3-Reranker-0.6B.
- No se documentan sesgos específicos, pero al entrenarse sobre MultiNLI hereda los sesgos de ese corpus (predominantemente inglés, textos de géneros limitados).
- La fecha de creación del repositorio (2026-11-24) y la ausencia de descargas sugieren que el modelo es muy reciente y carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SalahAbdoNLP/isnad-decider-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Modelo hermano 4B: https://huggingface.co/SalahAbdoNLP/isnad-decider-4b
- Leaderboard interactivo y simulador Lean 4: https://huggingface.co/spaces/SalahAbdoNLP/isnad-bench-leaderboard
- Dataset de entrenamiento: https://huggingface.co/datasets/nyu-mll/multi_nli
