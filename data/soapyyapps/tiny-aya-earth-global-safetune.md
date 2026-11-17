# soapyyapps/tiny-aya-earth-global-safetune

## Resumen

`soapyyapps/tiny-aya-earth-global-safetune` es un ajuste fino de seguridad (SafeTune) sobre el modelo base `CohereLabs/tiny-aya-earth`, un transformer denso de la familia Tiny Aya de Cohere Labs orientado a lenguas de Asia Occidental y África. El checkpoint publicado corresponde al denominado "Global SafeTune 72/72 upper-bound baseline": se ha fusionado un adaptador LoRA SafeGrad sobre los 72 bloques de proyección (atención y MLP) de las 36 capas del modelo, es decir, el 100 % de los bloques quedan actualizados y el 0 % congelado. El modelo cuenta con 3.349.227.520 parámetros y un repositorio de 6,7 GB en formato safetensors.

El propósito declarado del autor es servir como referencia de cota superior (upper bound) frente a una variante "quirúrgica" (`tiny-aya-earth-circuit-kavach-merged`) que modifica solo 4 de los 72 bloques (2,55 % de parámetros). La motivación es de interpretabilidad mecanicista y reparación de circuitos: localizar los subcircuitos responsables del comportamiento de rechazo de peticiones dañinas y modificarlos de forma selectiva, comparando el resultado con un ajuste global completo. El checkpoint se enmarca en el "Lexsi Lab Track 2" y emplea las herramientas CircuitKit, AuditKit y SafeGrad.

La relevancia actual radica en que propone una metodología reproducible para auditar la seguridad de modelos multilingües de tamaño pequeño (3,3 B), con evaluación por registro lingüístico (inglés, hinglish, gujlish, kanglish) y análisis estadístico de significancia mediante bootstrap emparejado. La licencia es Apache 2.0 y los idiomas declarados son inglés, hindi, guyaratí y canarés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `cohere2` en Hugging Face), 36 capas |
| Parametros totales | 3.349.227.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, gu, kn (inglés, hindi, guyaratí, canarés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `CohereLabs/tiny-aya-earth`, un transformer denso de 36 capas con 3,35 mil millones de parámetros. Sobre él se ha aplicado un ajuste fino de seguridad mediante un adaptador LoRA SafeGrad que se fusiona en los 72 bloques de proyección (atención y MLP) de todas las capas, alcanzando el 100 % de bloques modificados y el 0 % congelado. El checkpoint resultante se etiqueta como `checkpoint_2_global_safetune` dentro de un pipeline de cuatro etapas (descubrimiento de circuitos, auditoría quirúrgica, SafeTune y evaluación).

La evaluación se realizó sobre un conjunto retenido de 200 pares / 400 prompts (`eval_200_pairs.jsonl`), con 50 pares por registro lingüístico (inglés, hinglish, gujlish, kanglish). El par de calibración de rechazo empleado fue ` sorry` (id 40449) frente a ` when` (id 1434), con un gap de logit-diff de 15,97, y se filtraron por margen 99 de 100 pares de calibración. El entrenamiento del adaptador quirúrgico (variante comparada) reporta `train_loss = 0.7106` y `best_alpha = 1.0`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, hindi, guyaratí y canarés, con soporte declarado para registros mixtos (hinglish, gujlish, kanglish).
- Rechazo de peticiones dañinas (attack refusal) con una tasa del 99,5 % en el conjunto de evaluación retenido de 200 pares.
- Mantenimiento de la utilidad benigna: 100,0 % de helpfulness benigna y 0,0 % de sobre-rechazo (over-refusal) en los pares benignos evaluados.
- Capacidad de ser comparado como cota superior frente a variantes de ajuste selectivo (4/72 bloques) dentro de estudios de interpretabilidad mecanicista.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Auditoría de seguridad multilingüe: sirve como referencia de cota superior (72/72 bloques modificados) para medir cuánto se pierde al aplicar reparaciones quirúrgicas de circuitos en modelos pequeños; útil en laboratorios de interpretabilidad que comparan métodos de edición selectiva frente a ajuste completo.
- Investigación en interpretabilidad mecanicista: el checkpoint permite reproducir el pipeline de descubrimiento de circuitos (CircuitKit) y verificar la fidelidad de ablación y patching sobre un modelo de 3,3 B con evaluación por registro lingüístico.
- Evaluación de robustez frente a jailbreaks en lenguas del sur de Asia: los datos por registro (hinglish +34 pp, gujlish +80 pp, kanglish +68 pp frente a base) permiten medir la mejora del rechazo en code-mixing, un escenario frecuente en producción para mercados indios.
- Filtrado y moderación de contenido en aplicaciones conversacionales: el modelo puede emplearse como clasificador generativo de seguridad en inglés e hindi/guyaratí/canarés, con la advertencia de que su licencia Apache 2.0 permite uso comercial pero su tamaño limita el throughput (28,83 tokens/s reportados).
- Baseline para experimentos de reparación de circuitos: al ser el "upper bound" del estudio, se usa para calcular el gap de selectividad (0,995 frente a 0,990 de la variante quirúrgica) y validar que una intervención mínima (2,55 % de parámetros) no degrada la seguridad de forma significativa (p = 0,612).
- Docencia y prototipado de técnicas de safety fine-tuning: el repositorio documenta etapas, hiperparámetros y métricas de forma detallada, lo que lo hace útil como material de referencia para cursos o talleres sobre alineamiento y edición de modelos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto retenido de 200 pares / 400 prompts (`CohereLabs/tiny-aya-earth`):

| Checkpoint | Params modificados | Params congelados | Bloques proy. | Attack refusal | Benign over-refusal | Benign helpfulness | Selectivity gap | RedTeam attack pass | Tokens/s |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `checkpoint_1_base` (Base) | 0,00 % | 100,00 % | 0/72 | 53,5 % | 0,0 % | 100,0 % | +0,535 | 19,0 % | 30,59 |
| `checkpoint_2_global_safetune` (Global 72/72) | 100,00 % (LoRA all-layer) | 0,00 % | 72/72 | 99,5 % | 0,0 % | 100,0 % | +0,995 | 71,4 % | 28,83 |
| `checkpoint_3_surgical_ctheta` (Surgical 4/72) | 2,55 % | 97,45 % | 4/72 | 99,0 % | 0,0 % | 100,0 % | +0,990 | 52,4 % | 28,54 |

Desglose por registro lingüístico (attack refusal):

| Registro | Base | Global SafeTune (72/72) | Surgical C-ΔΘ (4/72) | Ganancia quirúrgica vs. base | Over-refusal benigno (quirúrgico) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| English (`en`, n=50) | 100,0 % | 100,0 % | 100,0 % | +0,0 pp | 0,0 % |
| Hinglish (`hi_en`, n=50) | 66,0 % | 100,0 % | 100,0 % | +34,0 pp | 0,0 % |
| Gujlish (`gu_en`, n=50) | 16,0 % | 98,0 % | 96,0 % | +80,0 pp | 0,0 % |
| Kanglish (`kn_en`, n=50) | 32,0 % | 100,0 % | 100,0 % | +68,0 pp | 0,0 % |

Significancia estadística (AuditKIT, bootstrap emparejado):

- Base frente a Surgical C-ΔΘ (n=200 pares dañinos): ganancia de +45,5 pp (0,535 → 0,990), p = 0,000999, significativa.
- Global SafeTune frente a Surgical C-ΔΘ (n=200 pares dañinos): delta = +0,005 (0,995 frente a 0,990), p = 0,612388, no significativa.
- Over-refusal benigno (n=200 pares benignos): 0,0 % (p = 1,0, no significativo; sin sobre-rechazo colateral).

Métricas de fidelidad del circuito (CircuitKIT, etapa 2): `ablation_score = 0,8052`, `patching_score = 0,0107`, `mean_jaccard = 1,0000`, `mean_spearman = 0,999819`, `n_stable_nodes = 62`, `kl_reduction_ratio = 0,0236`.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa por tamaño (3,35 B parámetros), en fp16 requeriría aproximadamente 6,7 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, aproximadamente 3,5 GB; en 4 bits, aproximadamente 2 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo cabría en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) en fp16, y en GPUs de 8-12 GB con cuantización.
- Cabe en GPU de consumo: previsiblemente sí, con cuantización, aunque el autor no lo documenta.
- Opciones de despliegue: la model card indica `library_name: transformers` y tag `endpoints_compatible`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor reporta 28,83 tokens/s para este checkpoint (frente a 30,59 tokens/s del base y 28,54 tokens/s de la variante quirúrgica). No se especifica el hardware empleado en la medición.

## Comparativa con modelos similares

Comparación con las variantes regionales de la misma familia Tiny Aya (estudio de universalidad del autor):

| Modelo | Attack refusal base | Global SafeTune (72/72) | Surgical C-ΔΘ (4/72) | Selectividad quirúrgica | Params modificados | Refusal `kn_en` (quirúrgico) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `CohereLabs/tiny-aya-fire` | 40,0 % | 99,0 % (0,0 % over-refusal) | 94,5 % (0,0 %) | +0,945 | 2,55 % (4/72) | 78,0 % |
| `CohereLabs/tiny-aya-global` | 45,5 % | 99,0 % (0,0 %) | 96,5 % (0,0 %) | +0,965 | 2,55 % (4/72) | 86,0 % |
| `CohereLabs/tiny-aya-water` | 53,5 % | 100,0 % (0,0 %) | 96,5 % (0,0 %) | +0,965 | 2,55 % (4/72) | 88,0 % |
| `CohereLabs/tiny-aya-earth` (este checkpoint) | 53,5 % | 99,5 % (0,0 %) | 99,0 % (0,0 %) | +0,990 | 2,55 % (4/72) | 100,0 % |

Solapamiento de circuitos entre pares de modelos (Jaccard top-4 y Spearman sobre 72 bloques):

| Par de modelos | Jaccard top-4 | Spearman ρ | Submódulos compartidos |
| :--- | ---: | ---: | :--- |
| `fire__global` | 1,000 | 0,9373 | `layers.0.mlp`, `layers.16.self_attn`, `layers.20.self_attn`, `layers.21.self_attn` |
| `fire__water` | 1,000 | 0,9217 | `layers.0.mlp`, `layers.16.self_attn`, `layers.20.self_attn`, `layers.21.self_attn` |

Los cuatro modelos Tiny Aya descubren de forma independiente los mismos cuatro submódulos de seguridad (`layers.0.mlp`, `layers.16.self_attn`, `layers.20.self_attn`, `layers.21.self_attn`), con Jaccard = 1,000 y Spearman entre 0,9217 y 0,9704 sobre los 72 bloques. No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un ajuste de seguridad evaluado sobre un conjunto propio de 200 pares (400 prompts); no se han publicado resultados en benchmarks estándar de conocimiento, razonamiento o código, por lo que su calidad general más allá del rechazo de ataques no está caracterizada.
- La evaluación se limita a cuatro registros (inglés, hinglish, gujlish, kanglish) y no cubre otros idiomas ni dominios; el propio autor reporta que el modelo base tiene un rendimiento desigual por registro (16,0 % en gujlish frente a 100,0 % en inglés), y aunque el SafeTune global lo eleva al 98-100 %, la generalización a otros idiomas no está verificada.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 3,3 B, es esperable una tasa de alucinación mayor que modelos de mayor tamaño, aunque no hay medición publicada.
- Sesgos conocidos: no documentados por el autor; la evaluación se centra en rechazo de ataques, no en sesgos demográficos, de género o culturales.
- El sobre-rechazo benigno reportado es 0,0 % en el conjunto de evaluación del autor, pero dicha métrica depende de la definición de "benigno" del conjunto `eval_200_pairs.jsonl` y no constituye una garantía general.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `CohereLabs/tiny-aya-earth` debe verificarse por separado para confirmar compatibilidad; el autor no aporta un análisis de cumplimiento.
- El checkpoint es un artefacto de investigación (baseline de cota superior para un estudio de interpretabilidad), no un modelo de producción validado; su uso en sistemas reales de moderación requeriría evaluación adicional.
- El throughput reportado (28,83 tokens/s) no especifica hardware, por lo que no es directamente comparable entre entornos.
- El repositorio tiene 22 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soapyyapps/tiny-aya-earth-global-safetune
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Variante quirúrgica comparada: https://huggingface.co/soapyyapps/tiny-aya-earth-circuit-kavach-merged
- Variante regional fire: https://huggingface.co/CohereLabs/tiny-aya-fire
- Variante regional global: https://huggingface.co/CohereLabs/tiny-aya-global
- Variante regional water: https://huggingface.co/CohereLabs/tiny-aya-water
