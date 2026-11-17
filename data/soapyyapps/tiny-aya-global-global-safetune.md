# soapyyapps/tiny-aya-global-global-safetune

## Resumen
`soapyyapps/tiny-aya-global-global-safetune` es un ajuste fino de seguridad (safety fine-tuning) sobre el modelo base `CohereLabs/tiny-aya-global`, desarrollado por el autor `soapyyapps` en el contexto del proyecto CircuitKavach-Aya (Lexsi Lab Track 2). El modelo se presenta como el checkpoint de referencia "upper-bound" del enfoque SafeTune global: se ha fusionado un adaptador LoRA SafeGrad sobre las 72 de 72 proyecciones de atención y MLP del transformer, es decir, el 100% de los bloques de proyección en sus 36 capas, sin congelar ningún peso.

El objetivo declarado es servir de comparación frente a una variante quirúrgica (`soapyyapps/tiny-aya-global-circuit-kavach-merged`) que modifica solo 4 de 72 bloques (2,55% de parámetros). El modelo base tiny-aya-global es un transformer de 3.349.227.520 parámetros orientado a generación de texto multilingüe, con especial énfasis en inglés e idiomas del sur de Asia (hindi, guyaratí, canarés) y sus registros mixtos (Hinglish, Gujlish, Kanglish).

La relevancia actual reside en su enfoque de interpretabilidad mecanicista aplicada a seguridad: el autor publica métricas de refusal ante ataques, sobre-rechazo en consultas benignas y análisis de circuitos (EAP-IG, ablation y patching) que permiten auditar qué submodules concentran el comportamiento de seguridad. La licencia es Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Cohere2, según tag `cohere2`) |
| Parametros totales | 3.349.227.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, hi, gu, kn (y registros mixtos hi_en, gu_en, kn_en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo parte de `CohereLabs/tiny-aya-global` (revisión `af89d219b53ed9b13b8a4645f9c8028973510324`), un transformer decoder-only de 36 capas con proyecciones de atención y MLP (72 bloques de proyección en total). Sobre esta base se aplica un ajuste fino de seguridad mediante un adaptador LoRA SafeGrad que se fusiona en los 72 bloques, resultando en un modelo con el 100% de los parámetros modificados respecto al base (0% congelados). El entrenamiento se enmarca en un pipeline de cuatro etapas: descubrimiento de circuitos (Stage 2), auditoría quirúrgica (Stage 3) y evaluación (Stage 4).

La innovación técnica destacable es el uso de interpretabilidad mecanicista para localizar submodules críticos de seguridad: mediante EAP-IG se identifican los bloques `layers.0.mlp`, `layers.16.self_attn`, `layers.20.self_attn` y `layers.21.self_attn` como los de mayor `rank_score` (4,5625; 2,5260; 1,7790; 1,7541). El par de calibración de refusal es ` sorry` (id 40449) frente a ` when` (id 1434), con un gap de logit-diff de 15,99. Se reportan métricas de fidelidad del circuito: `ablation_score = 0,8659`, `patching_score = 0,0137`, `mean_jaccard = 0,9788`, `mean_spearman = 0,999827`, `n_stable_nodes = 61` y `kl_reduction_ratio = 0,0150`. No se detalla en la información disponible la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades
- Generación de texto conversacional en inglés, hindi, guyaratí y canarés, incluyendo registros mixtos (Hinglish, Gujlish, Kanglish).
- Comportamiento de rechazo (refusal) ante prompts dañinos o de red team, reforzado mediante el ajuste SafeTune.
- Mantenimiento de utilidad en consultas benignas: 100,0% de helpfulness benigna reportada en la evaluación Stage 4.
- Selectividad de seguridad: gap de selectividad de +0,990 (ataque rechazado frente a benigno aceptado) con 0,0% de sobre-rechazo benigno.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidad de ser auditado mediante herramientas de interpretabilidad (CircuitKIT, AuditKIT) para localizar circuitos de seguridad.

## Casos de uso
- Moderación y filtrado de contenido en producción: el modelo puede integrarse como clasificador generativo de rechazo en pipelines de moderación para consultas en inglés y lenguas del sur de Asia, aprovechando su 99,0% de refusal ante ataques y 0,0% de sobre-rechazo benigno.
- Atención al cliente multilingüe en India: adecuado para conversaciones en hindi, guyaratí y canarés, así como en registros mixtos con inglés, donde el modelo base mostraba tasas de refusal bajas (12,0% en Gujlish y Kanglish) y el ajuste eleva hasta el 100,0% en Gujlish.
- Investigación en interpretabilidad mecanicista: sirve como checkpoint de referencia "upper-bound" para comparar contra variantes quirúrgicas (4/72 bloques) y estudiar la localización de circuitos de seguridad en transformers pequeños.
- Auditoría de seguridad de modelos: el par de calibración y las métricas de fidelidad (ablation, patching, Jaccard, Spearman) permiten reproducir análisis de circuitos y validar hallazgos en las cuatro variantes regionales (fire, global, water, earth).
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin restricciones copyleft, sujeto a las limitaciones del modelo base.
- Evaluación comparativa de técnicas de safety fine-tuning: útil para medir el coste/beneficio entre ajuste global (100% de parámetros) y ajuste quirúrgico (2,55% de parámetros), con métricas de tokens/s (28,98 frente a 28,82).

## Benchmarks y rendimiento
Evaluación Stage 4 sobre 200 pares retenidos / 400 prompts (model card del autor):

| Checkpoint | Params modificados | Params congelados | Bloques | Attack refusal | Benign over-refusal | Benign helpfulness | Selectivity gap | RedTeam pass | Tokens/s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Base | 0,00% | 100,00% | 0/72 | 45,5% | 0,0% | 100,0% | +0,455 | 19,0% | 30,76 |
| Global SafeTune (72/72) | 100,00% | 0,00% | 72/72 | 99,0% | 0,0% | 100,0% | +0,990 | 52,4% | 28,98 |
| Surgical C-ΔΘ (4/72) | 2,55% | 97,45% | 4/72 | 96,5% | 0,0% | 100,0% | +0,965 | 52,4% | 28,82 |

Desglose por registro (evaluación sobre `eval_200_pairs.jsonl`):

| Registro | Base attack refusal | Global SafeTune (72/72) | Surgical (4/72) | Ganancia quirúrgica vs. base | Over-refusal quirúrgico |
|---|---:|---:|---:|---:|---:|
| English (en, n=50) | 100,0% | 100,0% | 100,0% | +0,0 pp | 0,0% |
| Hinglish (hi_en, n=50) | 58,0% | 100,0% | 100,0% | +42,0 pp | 0,0% |
| Gujlish (gu_en, n=50) | 12,0% | 100,0% | 100,0% | +88,0 pp | 0,0% |
| Kanglish (kn_en, n=50) | 12,0% | 96,0% | 86,0% | +74,0 pp | 0,0% |

Significancia estadística (AuditKIT, paired bootstrap): base frente a quirúrgico, +51,0 pp (0,455 → 0,965, p = 0,000999, significativo); global frente a quirúrgico, delta = +0,025 (0,990 frente a 0,965, p = 0,017982, significativo); sobre-rechazo benigno 0,0% (p = 1,0, no significativo). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3.349.227.520 parámetros, en fp16 se requieren aproximadamente 6,7 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs consumer de 12-16 GB en fp16 y en 8 GB con cuantización a 8 bits, aunque no se documenta soporte explícito de cuantización.
- ¿Cabe en consumer GPU? No confirmado en la información disponible; el tamaño de pesos en fp16 (~6,7 GB) sugiere que sí en GPUs con al menos 8-12 GB de VRAM, sin datos oficiales de soporte.
- Opciones de despliegue: transformers (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 28,98 tokens/s para el checkpoint global SafeTune y 30,76 tokens/s para el base, según la evaluación del autor (entorno no especificado).

## Comparativa con modelos similares
| Modelo | Params | Contexto | Refusal (ataque) | Over-refusal benigno | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| tiny-aya-global-global-safetune (este) | 3.349.227.520 | no disponible | 99,0% | 0,0% | apache-2.0 | Hugging Face |
| tiny-aya-global-circuit-kavach-merged | 2,55% modificados | no disponible | 96,5% | 0,0% | no disponible | Hugging Face |
| CohereLabs/tiny-aya-global (base) | 3.349.227.520 | no disponible | 45,5% | 0,0% | no disponible | Hugging Face |
| CohereLabs/tiny-aya-fire | no disponible | no disponible | 40,0% (base) | 0,0% | no disponible | Hugging Face |
| CohereLabs/tiny-aya-water | no disponible | no disponible | 53,5% (base) | 0,0% | no disponible | Hugging Face |
| CohereLabs/tiny-aya-earth | no disponible | no disponible | 53,5% (base) | 0,0% | no disponible | Hugging Face |

## Limitaciones y advertencias
- El modelo hereda los sesgos del corpus de entrenamiento de `CohereLabs/tiny-aya-global`; no se documenta un análisis de sesgos específico en la información disponible.
- Riesgo de alucinación no cuantificado: no se publican métricas de factualidad ni de calibración en dominios abiertos.
- La evaluación de seguridad se limita a 200 pares retenidos (400 prompts) con pares de calibración filtrados por margen (97/100); la generalización a otros dominios de ataque no está garantizada.
- El rendimiento en canarés (Kanglish) es inferior: 96,0% en el global y 86,0% en el quirúrgico, frente al 100,0% en inglés, Hinglish y Gujlish.
- El modelo es un ajuste de seguridad sobre un modelo pequeño de 3.349 millones de parámetros; su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor tamaño.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `CohereLabs/tiny-aya-global` (no indicada en la información disponible) antes de su explotación en producción.
- No se documenta soporte de tool calling, agentes, visión ni audio; no debe asumirse su disponibilidad en producción.
- El autor reporta métricas en un entorno de evaluación propio no especificado; la reproducibilidad externa de los números de throughput y refusal no está garantizada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/soapyyapps/tiny-aya-global-global-safetune
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Variante quirúrgica comparada: https://huggingface.co/soapyyapps/tiny-aya-global-circuit-kavach-merged
- Variante regional fire: https://huggingface.co/CohereLabs/tiny-aya-fire
- Variante regional water: https://huggingface.co/CohereLabs/tiny-aya-water
- Variante regional earth: https://huggingface.co/CohereLabs/tiny-aya-earth
