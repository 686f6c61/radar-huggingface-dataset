# JKpink/faithfulness-under-context-conflict-models

## Resumen

`JKpink/faithfulness-under-context-conflict-models` no es un modelo de lenguaje nuevo, sino un repositorio de artefactos (adaptadores LoRA, una sonda de conflicto y corpus de entrenamiento) para un estudio de replicación sobre fidelidad en RAG cuando el contexto recuperado contradice el conocimiento del modelo. Se construye sobre el backbone Qwen3-8B y evalúa tres métodos (Faithful-RAG, ProbeRAG y Self-RAG) sobre particiones congeladas de 200 ítems de QA, más una re-verificación completa de 1.000 ítems de FaithEval-counterfactual.

El resultado principal es que Faithful-RAG (método sin entrenamiento) y ProbeRAG (método entrenado) alcanzan una precisión de 70,00 y 68,00 respectivamente frente a los 59,00 del RAG vanilla en la partición de 200 ítems, pero en el conjunto completo de 1.000 ítems las diferencias desaparecen (71,50 vs 70,40, p=0,49). El repositorio documenta además resultados negativos: una sonda de conflicto entrenada perjudica el rendimiento y los tokens de reflexión de Self-RAG degeneran en una constante.

Es relevante para investigadores que trabajan en fidelidad de RAG y en el fenómeno de conflicto contexto-conocimiento, porque publica pesos, corpus y logs reproducibles de un estudio con resultados mixtos, algo poco habitual en la literatura de adaptadores. El tamaño del repositorio es de 2,9 GB y la librería declarada es PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptadores LoRA y sonda MLP auxiliar |
| Parametros totales | 8B (modelo base Qwen3-8B); adaptadores LoRA con r=16, alpha=16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en bfloat16 para fusión) |
| Idiomas soportados | no disponibles |
| Licencia | mixed-see-readme (adaptadores derivados de Qwen3-8B, Apache-2.0; datos de SQuAD CC BY-SA 4.0 y ConFiQA sin licencia upstream) |
| Formato de pesos | safetensors (adaptadores PEFT), `.pt` (sonda de conflicto y `added_logits.pt`) |

## Arquitectura y entrenamiento

El repositorio contiene tres artefactos entrenados sobre Qwen3-8B. El primero es una sonda de conflicto MLP (`p3-probe/qwen3-8b-mquake.pt`, 8,5 MB) con arquitectura 4096→512→256→1 y activación sigmoide, entrenada durante 100 épocas con lr 1e-3 sobre 12.242 pares de afirmaciones de MQuAKE-CF-3k-v2, alcanzando una precisión de test de 0,9918. El segundo es un adaptador LoRA para el generador de ProbeRAG (`p3-adapter/`, 182 MB) con r=16, alpha=16, aplicado a todas las proyecciones de atención y MLP, entrenado 1 época sobre 1.800 filas de SQuAD-train + ConFiQA con una pérdida combinada de 0,9·CE + 0,1·atención-al-conflicto; incluye tokenizer y chat template para fusión offline.

El tercero es un adaptador LoRA para Self-RAG (`p4-adapter/`, 2,5 GB) con r=16, alpha=16, entrenado 2 épocas sobre 5.000 filas deterministas de reflexión. Requiere el fichero `added_logits.pt` (242 KB, forma 15×4096) que contiene las filas de salida de los 15 tokens especiales añadidos; sin él, los tokens de reflexión se decodifican como U+FFFD. La fusión no es un `merge_and_unload()` estándar: hay que sumar `added_logits` a `lm_head.weight` en los ids correspondientes, tal como hace `p4/sft.py :: merge()`. El vocabulario tras la fusión es de 151.684 tokens (151.669 base + 13 tokens de reflexión + `<paragraph>` y `</paragraph>`).

## Capacidades

- Generación de texto y QA extractivo sobre contexto recuperado, con el backbone Qwen3-8B.
- Detección de conflicto contexto-conocimiento mediante la sonda MLP entrenada (precisión 0,9918 en MQuAKE).
- Generación condicionada por etiquetas de conflicto en el adaptador ProbeRAG.
- Emisión de tokens de reflexión (`[Relevant]`, `[Fully supported]`, `[Utility:k]`) en el adaptador Self-RAG, siempre que se aplique correctamente `added_logits.pt`.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Estudio de fidelidad en RAG: el repositorio permite reproducir el experimento completo sobre FaithEval-counterfactual con las mismas particiones de 200 ítems y la re-verificación de 1.000 ítems, comparando RAG vanilla, Faithful-RAG y ProbeRAG con tests de McNemar exactos.
- Detección de contradicciones contexto-conocimiento: la sonda `qwen3-8b-mquake.pt` puede integrarse como clasificador auxiliar en un pipeline de RAG para marcar cuándo el pasaje recuperado entra en conflicto con el conocimiento paramétrico del modelo antes de generar.
- Investigación sobre tokens de reflexión: el adaptador Self-RAG y el corpus de 5.000 filas permiten estudiar la degeneración de tokens de reflexión en una constante, un resultado negativo documentado en `docs/`.
- Replicación de métodos de fidelidad: los corpus `p3-sft.jsonl` (1.800 filas con etiquetas de conflicto) y `p4-corpus.jsonl` (5.000 filas de reflexión) sirven para reentrenar los adaptadores y verificar los checksums publicados.
- Auditoría de licencias en datasets derivados: el repositorio incluye un NOTICE con la trazabilidad de SQuAD (CC BY-SA 4.0) y ConFiQA, útil como caso práctico de auditoría de licencias en adaptadores.
- Docencia y formación en evaluación de RAG: los resultados mixtos (mejora en n=200 que desaparece en n=1.000) son un ejemplo concreto de por qué hay que reportar tamaños de muestra y tests estadísticos en estudios de fidelidad.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre FaithEval-counterfactual, n=200, temperatura 0, misma máquina:

| Brazo | acc | Δacc vs vanilla | p de McNemar exacto |
|---|---|---|---|
| vanilla RAG | 59,00 | — | — |
| Faithful-RAG | 70,00 | +11,00 | 0,0008 |
| ProbeRAG | 68,00 | +9,00 | 0,0247 |
| Self-RAG† (piloto, n=100) | 34,00 | −25,00 | <0,0001 |

En el conjunto completo de 1.000 ítems, Faithful-RAG y ProbeRAG resultan indistinguibles: 71,50 vs 70,40 (−1,10 pp, p=0,49). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo base Qwen3-8B en bfloat16 ocupa aproximadamente 16 GB tras la fusión, según indica la propia model card.
- VRAM estimada para inferencia: ~16 GB en bfloat16; ~8-10 GB con cuantización a 8 bits; ~5-6 GB en 4 bits (estimación orientativa, no publicada en el repositorio).
- GPU recomendadas: A100 40 GB o H100 para el modelo fusionado en bfloat16 con contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: el repositorio documenta fusión con `peft` + `transformers`; no se mencionan vLLM, llama.cpp, Ollama ni TGI. La sonda se carga como state dict de tres capas lineales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Qwen3-8B + LoRA) | 8B | no disponible | Adaptadores de fidelidad RAG + sonda de conflicto | mixed-see-readme | Hugging Face |
| Qwen3-8B (base) | 8B | no disponible | LLM decoder-only | Apache-2.0 | Hugging Face |
| Self-RAG (original) | 7B-8B (Llama2/Mistral) | no disponible | Tokens de reflexión entrenados | MIT/Apache-2.0 según variante | Hugging Face |
| Faithful-RAG | no disponible | no disponible | Método sin entrenamiento | no disponible | Paper/repositorio |

No se dispone de datos de benchmarks comparativos directos con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los resultados principales se obtienen sobre una única partición de 200 ítems; en el conjunto completo de 1.000 ítems la ventaja de ProbeRAG frente a Faithful-RAG desaparece (p=0,49).
- La sonda de conflicto entrenada perjudica el rendimiento en algunos brazos, según los resultados negativos documentados en `docs/`.
- Los tokens de reflexión de Self-RAG degeneran en una constante; el piloto con n=100 muestra una caída de −25 pp frente a vanilla.
- El adaptador Self-RAG requiere aplicar `added_logits.pt` manualmente; omitirlo produce U+FFFD en lugar de tokens de reflexión (desviación 16 del informe P4).
- Licencia mixta: los adaptadores heredan Apache-2.0 de Qwen3-8B, pero los datos de entrenamiento derivan de SQuAD (CC BY-SA 4.0) y ConFiQA (sin licencia upstream), lo que puede condicionar el uso comercial.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información proporcionada.
- Idiomas soportados: no disponibles; el estudio se centra en QA en inglés sobre SQuAD y FaithEval.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/JKpink/faithfulness-under-context-conflict-models
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub con código, logs e informes: no disponible como URL en la información proporcionada (referenciado como "GitHub repository" en la model card)
