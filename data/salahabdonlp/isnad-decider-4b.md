# SalahAbdoNLP/isnad-decider-4b

## Resumen

isnad-decider-4b es un adaptador LoRA de PEFT sobre el modelo base Qwen/Qwen3-Reranker-4B, desarrollado por SalahAbdoNLP. Su función es convertir un reranker binario de relevancia en un clasificador epistémico de tres vías (against, support, neutral) que emite probabilidades calibradas en un único forward pass, sin generar tokens. Forma parte de la arquitectura Isnād-IR e Isnād-RAG v0.5, orientada a recuperación aumentada con evidencia en conflicto y verificación de hechos.

El modelo aborda un problema concreto de los sistemas RAG: distinguir entre un pasaje irrelevante y un pasaje que contradice activamente la afirmación consultada. Para ello emplea un entrenamiento estrictamente libre de fuga de benchmarks, usando únicamente el split de entrenamiento de MultiNLI y negativos duros generados con BM25. El adaptador se puede desactivar para recuperar el comportamiento original del reranker, lo que permite alternar entre relevancia binaria y postura epistémica sobre una sola columna vertebral.

Con 4.020 millones de parámetros en el modelo base y un adaptador de 124,5 MB, el modelo se posiciona como una alternativa ligera frente a pipelines NLI de múltiples pasadas. Su relevancia actual radica en que reduce falsos positivos de contradicción en pasajes irrelevantes y mejora la detección de evidencia a favor y en contra en corpus con información disputada, como Climate-FEVER o FaithEval.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre Qwen/Qwen3-Reranker-4B |
| Parámetros totales | 4.020 millones (modelo base); adaptador LoRA de 124,5 MB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-Reranker-4B, un transformer decoder-only de 4.020 millones de parámetros. La configuración LoRA usa r=16, alpha=32 y dropout de 0,05, con módulos objetivo q/k/v/o/gate/up/down_proj. La innovación clave es el uso de logits_to_keep=1: el modelo no genera tokens, sino que proyecta la decisión sobre tres tokens verificados de Qwen3 (against=68749, support=23362, neutral=59568) y aplica entropía cruzada de tres vías sobre un único token. Al desactivar el adaptador se recupera exactamente la relevancia binaria yes/no del reranker congelado.

El entrenamiento usa 20.000 ejemplos derivados exclusivamente del split train de nyu-mll/multi_nli, sin contaminación de PubMed, SciFact, Wikipedia, Climate-FEVER, idebate, ArguAna, FaithEval, RAMDocs, SQuAD ni corpus legales. La composición es de 5.000 ejemplos support (65 % envueltos en 3-6 distractores del mismo género), 5.000 against (con 1.250 reversiones simétricas multisentencia), 3.500 neutrales en documento y 6.500 quimeras negativas duras generadas con BM25 etiquetadas como neutral. Se realizó una época con 625 pasos de optimizador, batch efectivo de 32, LR coseno de 1,5e-4, bf16, SDPA y gradient checkpointing sobre una NVIDIA L4, con un tiempo total de 97,9 minutos. El tarball de release tiene SHA-256 9a37b46cd5faf2d82cf16fa78195ba85d1b0490bb8423523b4d1f66681c4f7e7.

## Capacidades

- Clasificación epistémica de tres vías (against, support, neutral) en un único forward pass, sin generación de tokens.
- Recuperación de información con reranking híbrido y fusión RRF.
- Verificación de hechos y detección de contradicciones en pasajes recuperados.
- Manejo de evidencia en conflicto (conflicting RAG) con arquitectura de prueba verificable.
- Rechazo de quimeras negativas duras (pasajes temáticamente adyacentes pero irrelevantes) mediante etiquetado neutral.
- Alternancia de comportamiento: desactivando el adaptador se obtiene relevancia binaria yes/no del reranker base.
- Integración con kernel Lean 4 (Isnad.Kernel.ScopedConflict) con 27 teoremas verificados mecánicamente y 0 sorry.
- Capacidades multilingües: no disponibles; solo inglés declarado.
- Tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Verificación de hechos en pipelines RAG: el modelo clasifica cada pasaje recuperado como apoyo, contradicción o neutral en una sola pasada, lo que permite filtrar evidencia contradictoria antes de pasarla al generador y reducir alucinaciones por contexto envenenado.
- Detección de información disputada en corpus científicos: en Climate-FEVER, el modelo recupera ambos lados de una disputa (Both-Sides R@3 = 60,39 %) y refutaciones (Refute R@2 = 49,19 %), útil para sistemas que deben presentar posturas enfrentadas en lugar de una única respuesta.
- Reranking híbrido en motores de búsqueda: combinado con BM25 mediante RRF, alcanza NDCG@10 de 80,18 en SciFact y 81,09 en ArguAna, por lo que sirve como etapa de reordenación en buscadores documentales.
- Auditoría de respuestas generadas: al emitir probabilidades calibradas de apoyo y contradicción, permite construir verificadores que marquen afirmaciones no respaldadas por las fuentes recuperadas.
- Sistemas de cumplimiento normativo: en el dominio legal federal de EE. UU., sin entrenamiento específico, eleva Binding Override P@1 del 0 % al 60 % y Override R@3 al 80 %, útil para detectar cláusulas que anulan otras.
- Atención al cliente con base de conocimiento contradictoria: cuando distintas versiones de un documento se contradicen, el modelo identifica la postura de cada fragmento y permite al sistema priorizar la evidencia vigente.
- Moderación de contenido factual: clasificar afirmaciones de usuarios contra fuentes verificadas y señalar desacuerdos con probabilidad calibrada.

## Benchmarks y rendimiento

Resultados en MultiNLI validación mismatched más 600 quimeras BM25:

| Métrica | Base 4B zero-shot | isnad-decider-0.6b | isnad-decider-4b |
|---|---:|---:|---:|
| Precisión limpia 3 vías | 48,87 % | 82,00 % | 88,87 % |
| Recall de contradicción | 10,71 % | 79,48 % | 86,55 % |
| Recall de apoyo | 96,45 % | 85,54 % | 91,40 % |
| Recall neutral en documento | 33,95 % | 81,12 % | 88,34 % |
| Rechazo de quimeras BM25 | 86,00 % | 91,17 % | 91,83 % |

Resultados en 7.598 pares reales SciFact PubMed (una pasada):

| Modelo | Pasadas | FPR contradicción irrelevante | FPR apoyo irrelevante | SNR apoyo | SNR contra |
|---|---:|---:|---:|---:|---:|
| nli-deberta-v3-large | 5× | 44,98 % | 12,03 % | 1,95× | 0,86× |
| isnad-decider-0.6b | 1× | 1,15 % | 0,04 % | 14,60× | 3,04× |
| isnad-decider-4b | 1× | 1,07 % | 0,16 % | 61,54× | 7,28× |

Resultados en benchmarks IR públicos:

| Benchmark | Métrica | isnad-decider-4b | Qwen3-Reranker-4B congelado |
|---|---|---:|---:|
| BEIR/SciFact (300) | NDCG@10 híbrido RRF@50 | 80,18 | 79,88 |
| BEIR/SciFact (300) | NDCG@10 BM25@100 | 76,64 | 76,34 |
| BEIR/ArguAna (1.406) | NDCG@10 | 81,09 | 81,06 |
| Climate-FEVER DISPUTED (154) | Both-Sides R@3 | 60,39 % | +9,09 pts |
| Climate-FEVER DISPUTED (154) | Refute R@2 | 49,19 % | +13,69 pts |

Resultados en RAG con conflicto (FaithEval, 4.992 consultas):

| Sistema | Precisión macro All-3 | Llamadas LLM/consulta |
|---|---:|---:|
| isnad-decider-4b + Lean 4 v0.5 (Qwen2.5-7B) | 84,48 % | 1,0× |
| isnad-decider-4b + Lean 4 v0.5 (Llama-3.1-8B) | 84,78 % | 1,0× |
| Standard RAG | 48,52 % | no disponible |
| MADAM-RAG | 47,10 % | 4,29× |
| TrustRAG | 44,93 % | 2,0× |
| AstuteRAG | 22,72 % | 3,0× |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en bf16 para el modelo base de 4.020 millones de parámetros más el adaptador; alrededor de 3-4 GB en cuantización de 4 bits (estimación a partir del tamaño del modelo, no publicada por el autor).
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), A100, H100 para despliegues de alto throughput; RTX 4090 y RTX 3090 para inferencia en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16 y en tarjetas de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: PEFT sobre transformers; vLLM, TGI y llama.cpp no están confirmados en la información disponible para este adaptador concreto.
- Latencia y throughput: no disponibles; el entrenamiento requirió 97,9 minutos en una L4 para 625 pasos, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isnad-decider-4b | 4.020 M (base) + LoRA | no disponible | Clasificación epistémica 3 vías en un forward pass | Apache 2.0 | Hugging Face |
| isnad-decider-0.6b | ~600 M (base) | no disponible | Misma tarea, versión compacta | Apache 2.0 | Hugging Face |
| nli-deberta-v3-large | ~435 M | 512 tokens (típico en DeBERTa) | NLI de 3 clases con max-sentence y múltiples pasadas | MIT | Hugging Face |
| Qwen3-Reranker-4B | 4.020 M | no disponible | Reranker binario de relevancia | Apache 2.0 | Hugging Face |

Frente a nli-deberta-v3-large, isnad-decider-4b reduce el FPR de contradicción en pasajes irrelevantes del 44,98 % al 1,07 % con una sola pasada en lugar de cinco. Frente a su modelo base, añade la dimensión epistémica sin perder rendimiento de reranking en SciFact y ArguAna.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está evaluado.
- El entrenamiento se limita a MultiNLI y negativos BM25; dominios muy alejados (legal, biomédico, financiero) podrían degradar la calibración, aunque los resultados en SciFact y derecho federal son favorables.
- El modelo emite probabilidades calibradas, pero sigue siendo un clasificador: puede producir falsos neutrales o falsos apoyos en pasajes ambiguos.
- La longitud de contexto no está documentada; para pasajes largos conviene verificar el comportamiento real.
- El adaptador requiere cargar el modelo base Qwen3-Reranker-4B, lo que añade dependencia y peso de despliegue.
- Uso comercial permitido por Apache 2.0, pero el autor no ofrece garantías sobre robustez adversarial ni sobre sesgos derivados de MultiNLI.
- Los resultados de RAG con conflicto dependen del kernel Lean 4 v0.5; sin él, el rendimiento del adaptador aislado es el de las tablas de clasificación.
- Las cifras de RAMDocs (15,2 % / 15,4 % Clean EM) son bajas en términos absolutos y deben interpretarse en el contexto del benchmark.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/SalahAbdoNLP/isnad-decider-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Modelo hermano 0.6B: https://huggingface.co/SalahAbdoNLP/isnad-decider-0.6b
- Leaderboard interactivo y simulador Lean 4: https://huggingface.co/spaces/SalahAbdoNLP/isnad-bench-leaderboard
- Dataset de entrenamiento: https://huggingface.co/datasets/nyu-mll/multi_nli
