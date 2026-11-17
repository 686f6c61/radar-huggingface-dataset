# soapyyapps/tiny-aya-water-circuit-kavach-merged

## Resumen
CircuitKavach-Aya es un checkpoint derivado de CohereLabs/tiny-aya-water, un modelo de 3.349 millones de parámetros (aproximadamente 3,35 mil millones) de la familia Tiny Aya de Cohere Labs, diseñado para lenguas de Europa y Asia-Pacífico. El autor, soapyyapps, aplica una técnica de reparación de circuitos denominada "Surgical C-ΔΘ Circuit Transplant" que modifica únicamente 4 de los 72 bloques de proyección del modelo base (el 2,55% de los parámetros) para mejorar la negativa ante ataques maliciosos sin degradar la utilidad en peticiones benignas.

El modelo resuelve un problema concreto de seguridad: el modelo base presenta una tasa de negativa ante ataques del 53,5% en el conjunto de evaluación, con especial debilidad en registros mixtos como Gujlish (10%) y Kanglish (38%). Tras la intervención quirúrgica, la tasa de negativa sube al 96,5% manteniendo un 0% de sobrerrespuesta en peticiones benignas, y preserva el 97,45% de los pesos originales bit a bit idénticos.

Es relevante ahora porque demuestra que es posible realizar alineamiento de seguridad localizado y auditable sobre modelos pequeños multilingües, con estadística de significación publicada, sin reentrenar el modelo completo. La arquitectura subyacente es Cohere2 (transformer decoder-only), licencia Apache 2.0, y soporte para inglés, hindi, guyaratí y canarés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2 (transformer decoder-only) |
| Parametros totales | 3.349.227.520 (3,35 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, gu, kn (con registros mixtos hi_en, gu_en, kn_en evaluados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base es CohereLabs/tiny-aya-water, un transformer decoder-only de la familia Cohere2 con 3.349 millones de parámetros. Sobre él se aplica un pipeline de tres etapas: descubrimiento de circuitos (Stage 2, CircuitKIT con EAP-IG), reparación quirúrgica (Stage 3, SafeTune C-ΔΘ) y auditoría (Stage 4, AuditKIT). La fórmula de reparación es Θ_repaired = Θ_base + α · (M ⊙ ΔΘ), con best_alpha = 1.0. Solo se modifican 4 de 72 bloques de proyección: layers.0.mlp, layers.16.self_attn, layers.20.self_attn y layers.21.self_attn, seleccionados por su rank_score en EAP-IG (3,9531; 2,8666; 1,9318; 1,9295 respectivamente).

El conjunto de calibración consistió en 99/100 pares filtrados por margen (25 en, 25 hi_en, 25 gu_en, 24 kn_en) usando el par de negativa " sorry" (id 40449) frente a " when" (id 1434), con un gap de logit-diff de 16,59. La auditoría de fidelidad reporta ablation_score = 0.0000, patching_score = 0.0273, Jaccard medio de 0.9788 y Spearman medio de 0.999833 sobre 61 nodos estables. Se modificaron 99.090.432 de 3.886.098.432 parámetros (2,55%) y 15 de 291 tensores de pesos, manteniendo 276/291 tensores bit a bit idénticos al modelo base (bit_identical_unmasked_keys = True, unmasked_violations vacío). El entrenamiento final reporta train_loss = 0.6995. No se especifica en la información disponible el volumen de tokens ni la composición del dataset de preentrenamiento del modelo base.

## Capacidades
- Generación de texto conversacional en inglés, hindi, guyaratí y canarés, incluyendo registros mixtos (Hinglish, Gujlish, Kanglish).
- Negativa robusta ante ataques maliciosos: 96,5% de tasa de rechazo en el conjunto de evaluación de 200 pares dañinos.
- Preservación de utilidad benigna: 100% de helpfulness en peticiones benignas y 0% de sobrerrespuesta.
- Capacidad de auditoría e interpretabilidad mecanicista: los circuitos modificados son identificables y verificables (bit-identical en tensores no enmascarados).
- Soporte multilingüe con mejora específica en registros code-mixed indo-asiáticos (Gujlish +88 pp, Kanglish +50 pp, Hinglish +34 pp frente al base).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso
- Moderación y filtrado de contenido en aplicaciones multilingües: el modelo puede actuar como capa de rechazo ante prompts maliciosos en inglés e idiomas indios, con 96,5% de efectividad y sin penalizar consultas legítimas, adecuado para entornos donde el modelo base filtraba deficientemente (Gujlish 10%).
- Atención al cliente en registros code-mixed: útil en mercados indios donde los usuarios alternan hindi/inglés, guyaratí/inglés o canarés/inglés, gracias a la mejora de rechazo en esos registros sin sobrerrespuesta benigna.
- Investigación en interpretabilidad mecanicista: sirve como caso de estudio reproducible de descubrimiento de circuitos (EAP-IG) y reparación localizada, con métricas de fidelidad y solapamiento entre variantes publicadas.
- Auditoría de seguridad de modelos pequeños: el checkpoint permite comparar el comportamiento del modelo base frente al reparado y validar la selectividad del parche (gap de selectividad +0,965).
- Despliegue en entornos con requisitos de trazabilidad: al mantener el 97,45% de los pesos bit a bit idénticos, facilita la certificación de que solo se ha alterado una fracción acotada y documentada del modelo.
- Prototipado de salvaguardas en asistentes conversacionales de bajo coste: con 3,35 mil millones de parámetros y licencia Apache 2.0, puede integrarse en pipelines de generación de texto con moderación incorporada.
- Estudio de universalidad de circuitos de seguridad: el autor documenta que las cuatro variantes tiny-aya (fire, global, water, earth) descubren los mismos cuatro submódulos (Jaccard = 1.000), lo que permite usar este checkpoint como referencia en experimentos comparativos.

## Benchmarks y rendimiento

Evaluación Stage 4 sobre 200 pares retenidos / 400 prompts:

| Checkpoint | Params modificados | Refusal ante ataques | Sobrerrespuesta benigna | Helpfulness benigna | Gap de selectividad | RedTeam pass | Tokens/s |
|---|---:|---:|---:|---:|---:|---:|---:|
| Base | 0,00% | 53,5% | 0,0% | 100,0% | +0,535 | 19,0% | 30,76 |
| Global SafeTune (72/72) | 100,00% | 100,0% | 0,0% | 100,0% | +1,000 | 47,6% | 29,02 |
| Surgical C-ΔΘ (4/72) | 2,55% | 96,5% | 0,0% | 100,0% | +0,965 | 42,9% | 28,76 |

Desglose por idioma/registro (refusal ante ataques):

| Registro | Base | Global 72/72 | Surgical 4/72 | Ganancia vs. base | Sobrerrespuesta benigna (surgical) |
|---|---:|---:|---:|---:|---:|
| English (en, n=50) | 100,0% | 100,0% | 100,0% | +0,0 pp | 0,0% |
| Hinglish (hi_en, n=50) | 66,0% | 100,0% | 100,0% | +34,0 pp | 0,0% |
| Gujlish (gu_en, n=50) | 10,0% | 100,0% | 98,0% | +88,0 pp | 0,0% |
| Kanglish (kn_en, n=50) | 38,0% | 100,0% | 88,0% | +50,0 pp | 0,0% |

Significación estadística (AuditKIT, bootstrap emparejado):
- Base vs. Surgical, n=200 pares dañinos: +43,0 pp (0,535 → 0,965), p = 0,000999, significativo.
- Global vs. Surgical, n=200 pares dañinos: delta +0,035 (1,000 vs. 0,965), p = 0,007992, significativo.
- Sobrerrespuesta benigna (n=200 gemelos benignos): 0,0%, p = 1,0, no significativo (sin daño colateral).

Estudio de universalidad en cuatro variantes tiny-aya:

| Modelo | Refusal base | Global 72/72 | Surgical 4/72 | Selectividad surgical | Mejor α | Refusal kn_en |
|---|---:|---:|---:|---:|---:|---:|
| fire | 40,0% | 99,0% | 94,5% | +0,945 | 1,0 | 78,0% |
| global | 45,5% | 99,0% | 96,5% | +0,965 | 1,0 | 86,0% |
| water | 53,5% | 100,0% | 96,5% | +0,965 | 1,0 | 88,0% |
| earth | 53,5% | 99,5% | 99,0% | +0,990 | 1,0 | 100,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; para 3,35 mil millones de parámetros en fp16 se requieren aproximadamente 6,7 GB de pesos, y en cuantización de 8 bits alrededor de 3,4 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; por tamaño (3,35 mil millones de parámetros) es plausible en GPUs de consumo con suficiente VRAM, pero no se aporta dato verificado.
- Opciones de despliegue: la model card solo indica compatibilidad con transformers y endpoints_compatible; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 28,76 tokens/s para el checkpoint quirúrgico, 30,76 tokens/s para el base y 29,02 tokens/s para el global, aunque no se especifica el hardware de medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refusal ante ataques | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| tiny-aya-water + Surgical C-ΔΘ (este) | 3,35 mil M | no disponible | 96,5% | Apache 2.0 | Hugging Face |
| tiny-aya-water (base) | 3,35 mil M | no disponible | 53,5% | Apache 2.0 | Hugging Face |
| tiny-aya-water + Global SafeTune | 3,35 mil M | no disponible | 100,0% | Apache 2.0 | Hugging Face |
| tiny-aya-fire/global/earth (surgical) | 3,35 mil M | no disponible | 94,5% / 96,5% / 99,0% | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de otras familias (por ejemplo, Llama, Qwen o Gemma de tamaño similar).

## Limitaciones y advertencias
- El modelo base presenta sesgos no documentados; la intervención se centra exclusivamente en negativa ante ataques y no corrige sesgos sociales, de género o culturales.
- Riesgo de alucinación inherente a un modelo de 3,35 mil millones de parámetros; no se han publicado evaluaciones de factualidad.
- La mejora en Kanglish es parcial (88,0% frente al 100% del global), por lo que persiste una brecha de 12 pp en ese registro.
- La longitud de contexto no está especificada, lo que impide garantizar comportamiento en conversaciones largas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse su disponibilidad.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base CohereLabs/tiny-aya-water y las implicaciones de la reparación sobre la garantía de comportamiento.
- Las métricas de seguridad proceden de un conjunto de evaluación del propio autor (200 pares / 400 prompts); no hay validación por terceros ni auditoría independiente.
- El checkpoint se publicó el 15 de noviembre de 2026 y cuenta con 20 descargas y 0 likes, por lo que su adopción y validación comunitaria son mínimas.

## Enlaces
- Hugging Face: https://huggingface.co/soapyyapps/tiny-aya-water-circuit-kavach-merged
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-water
- Variante fire: https://huggingface.co/CohereLabs/tiny-aya-fire
- Variante global: https://huggingface.co/CohereLabs/tiny-aya-global
- Variante earth: https://huggingface.co/CohereLabs/tiny-aya-earth
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
