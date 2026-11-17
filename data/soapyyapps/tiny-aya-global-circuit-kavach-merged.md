# soapyyapps/tiny-aya-global-circuit-kavach-merged

## Resumen

CircuitKavach-Aya es un checkpoint derivado de CohereLabs/tiny-aya-global, un modelo de generación de texto de aproximadamente 3.350 millones de parámetros publicado por el autor independiente soapyyapps bajo licencia Apache 2.0. No se trata de un modelo nuevo entrenado desde cero, sino de una intervención quirúrgica sobre los pesos del modelo base mediante una técnica de reparación de circuitos denominada C-ΔΘ (transplante de circuitos con máscara), aplicada tras una fase previa de descubrimiento de circuitos con EAP-IG.

El objetivo declarado del proyecto es mejorar la robustez de seguridad (tasa de rechazo ante ataques) en contextos multilingües, en particular en registros mixtos como hinglish, gujlish y kanglish, sin degradar la utilidad en peticiones benignas. Según la model card, la intervención modifica únicamente 4 de los 72 bloques de proyección (2,55 % de los parámetros, 99.090.432 de 3.886.098.432) mientras mantiene el 97,45 % de los tensores bit a bit idénticos al modelo base.

La relevancia actual del proyecto es metodológica: demuestra que un subconjunto muy pequeño de submódulos (una capa MLP y tres bloques de self-attention) concentra buena parte del comportamiento de rechazo, y que intervenir solo sobre ellos puede replicar casi por completo el efecto de un ajuste global de todas las capas, con menor coste y menor riesgo de sobre-rechazo colateral. El modelo está etiquetado con las áreas de seguridad, interpretabilidad mecanicista y reparación de circuitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Cohere2, según tag `cohere2`) |
| Parametros totales | 3.349.227.520 (safetensors); la model card cita 3.886.098.432 como recuento de referencia del base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, hi, gu, kn (inglés, hindi, guyaratí, canarés); evaluado además en registros mixtos hi_en, gu_en, kn_en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base tiny-aya-global pertenece a la familia Cohere2, un transformer decoder-only de aproximadamente 3.300 millones de parámetros. Sobre ese base, el autor aplica un pipeline en cuatro etapas documentado en la model card: (1) definición de pares de calibración de rechazo frente a cumplimiento, usando el par de tokens ` sorry` (id 40449) frente a ` when` (id 1434) con una diferencia de logits de 15,99; (2) descubrimiento de circuitos con CircuitKIT mediante EAP-IG (Edge Attribution Patching con gradiente integrado), que arroja un `ablation_score` de 0,8659, un `patching_score` de 0,0137 y 61 nodos estables; (3) reparación quirúrgica con SafeTune C-ΔΘ, aplicando Θ_repaired = Θ_base + α · (M ⊙ ΔΘ) con α = 1,0; y (4) evaluación con AuditKIT sobre 200 pares retenidos (400 prompts).

Los submódulos seleccionados son `model.layers.0.mlp` (rank_score EAP-IG 4,5625), `model.layers.16.self_attn` (2,5260), `model.layers.20.self_attn` (1,7790) y `model.layers.21.self_attn` (1,7541). La intervención toca 15 de 291 tensores de pesos y deja el resto sin modificar, verificado con `bit_identical_unmasked_keys: True` y `unmasked_violations: []`. La pérdida de entrenamiento reportada es 0,7348. No se especifican en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO en su construcción original.

Un hallazgo destacado del autor es el estudio de universalidad sobre las cuatro variantes regionales de tiny-aya (fire, global, water, earth): las cuatro descubren de forma independiente exactamente los mismos cuatro submódulos de seguridad (Jaccard = 1,000, Spearman de 72 bloques entre 0,9217 y 0,9704), lo que sugiere que el circuito de rechazo es estable entre variantes del mismo base.

## Capacidades

- Generación de texto conversacional en inglés, hindi, guyaratí y canarés, con soporte adicional para registros de código mezclado (hinglish, gujlish, kanglish).
- Rechazo de peticiones dañinas con una tasa medida del 96,5 % en el conjunto de evaluación de 200 pares, frente al 45,5 % del modelo base.
- Mantenimiento de la utilidad en peticiones benignas: 100 % de helpfulness benigna y 0 % de sobre-rechazo benigno en la evaluación reportada.
- Comportamiento de rechazo reforzado específicamente en registros mixtos: 100 % en hinglish y gujlish, 86 % en kanglish (frente al 58 %, 12 % y 12 % del base respectivamente).
- Compatibilidad con el ecosistema transformers y endpoints de Hugging Face (`endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Moderación y filtrado de contenido en producción multilingüe: el modelo puede actuar como clasificador generativo de segunda línea para peticiones en inglés, hindi, guyaratí y canarés, con un rechazo medido del 96,5 % sobre ataques y sin sobre-rechazo benigno, lo que reduce la fricción con usuarios legítimos.
- Despliegue en asistentes conversacionales para el sur de Asia: el refuerzo específico en hinglish, gujlish y kanglish (subidas de 42, 88 y 74 puntos porcentuales frente al base) lo hace adecuado para productos dirigidos a usuarios que mezclan lenguas en una misma conversación.
- Investigación en interpretabilidad mecanicista: sirve como caso de estudio reproducible de localización de circuitos con EAP-IG y de reparación con máscara, ya que la model card documenta los rank_scores, los submódulos elegidos y las métricas de fidelidad (ablation, patching, Jaccard, Spearman).
- Auditoría de seguridad de modelos base: al mantener el 97,45 % de los pesos idénticos al original, permite comparaciones controladas entre el base y la versión reparada sin confundir el efecto de seguridad con cambios globales de distribución.
- Despliegue en entornos con recursos limitados: con unos 3.350 millones de parámetros, el modelo cabe en GPUs de consumo con cuantización adecuada y permite servir una capa de seguridad local sin depender de APIs externas.
- Base para experimentos de transferencia entre variantes regionales: dado que las cuatro variantes tiny-aya comparten el mismo circuito top-4, se puede reutilizar la metodología para reparar otras variantes con el mismo conjunto de submódulos.
- Evaluación comparativa de técnicas de alineación de seguridad: el checkpoint permite contrastar el ajuste global de 72/72 bloques frente al quirúrgico de 4/72, con métricas de selectividad y latencia (28,82 frente a 28,98 tokens/s) para decidir qué enfoque adoptar en producción.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación del propio autor sobre 200 pares retenidos (400 prompts), no de benchmarks estándar como MMLU, HumanEval o GSM8K. No se han publicado resultados de esos benchmarks en la información disponible.

| Checkpoint | Params modificados | Bloques de proyección | Rechazo de ataques | Sobre-rechazo benigno | Helpfulness benigna | Selectivity gap | RedTeam pass | Tokens/s |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `checkpoint_1_base` | 0,00 % | 0/72 | 45,5 % | 0,0 % | 100,0 % | +0,455 | 19,0 % | 30,76 |
| `checkpoint_2_global_safetune` | 100,00 % (LoRA todas las capas) | 72/72 | 99,0 % | 0,0 % | 100,0 % | +0,990 | 52,4 % | 28,98 |
| `checkpoint_3_surgical_ctheta` | 2,55 % | 4/72 | 96,5 % | 0,0 % | 100,0 % | +0,965 | 52,4 % | 28,82 |

Desglose por idioma y registro (rechazo de ataques):

| Registro | Base | Global SafeTune (72/72) | Surgical C-ΔΘ (4/72) | Ganancia vs. base | Sobre-rechazo benigno (quirúrgico) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Inglés (`en`, n=50) | 100,0 % | 100,0 % | 100,0 % | +0,0 pp | 0,0 % |
| Hinglish (`hi_en`, n=50) | 58,0 % | 100,0 % | 100,0 % | +42,0 pp | 0,0 % |
| Gujlish (`gu_en`, n=50) | 12,0 % | 100,0 % | 100,0 % | +88,0 pp | 0,0 % |
| Kanglish (`kn_en`, n=50) | 12,0 % | 96,0 % | 86,0 % | +74,0 pp | 0,0 % |

Significación estadística (bootstrap emparejado de AuditKIT, n=200 pares dañinos): la mejora del quirúrgico frente al base es de +51,0 pp (0,455 → 0,965, p = 0,000999, significativa). Frente al ajuste global, el quirúrgico queda 2,5 pp por debajo (0,990 → 0,965, p = 0,017982, también significativa). El sobre-rechazo benigno es del 0,0 % (p = 1,0, no significativo).

Estudio de universalidad sobre las cuatro variantes regionales:

| Modelo | Rechazo base | Global 72/72 (sobre-rechazo) | Quirúrgico 4/72 (sobre-rechazo) | Selectividad quirúrgica | α óptimo | Kanglish quirúrgico |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `tiny-aya-fire` | 40,0 % | 99,0 % (0,0 %) | 94,5 % (0,0 %) | +0,945 | 1,0 | 78,0 % |
| `tiny-aya-global` | 45,5 % | 99,0 % (0,0 %) | 96,5 % (0,0 %) | +0,965 | 1,0 | 86,0 % |
| `tiny-aya-water` | 53,5 % | 100,0 % (0,0 %) | 96,5 % (0,0 %) | +0,965 | 1,0 | 88,0 % |
| `tiny-aya-earth` | 53,5 % | 99,5 % (0,0 %) | 99,0 % (0,0 %) | +0,990 | 1,0 | 100,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,7 GB solo para pesos (el repo ocupa 6,7 GB), más overhead de activaciones y caché KV; en la práctica conviene reservar entre 8 y 10 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2-2,5 GB para pesos.
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S o A10G para servir varias réplicas; también válidas RTX 4090, RTX 3090 y RTX 4080 para una sola instancia.
- GPU de consumo: cabe en tarjetas con 8 GB o más en cuantizaciones de 8/4 bits; en fp16 requiere al menos 10-12 GB para contexto moderado.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI para serving de alto throughput; llama.cpp y Ollama solo si se generan conversiones GGUF, que no se publican en el repo.
- Throughput medido por el autor: 28,82 tokens/s para el checkpoint quirúrgico, 28,98 tokens/s para el ajuste global y 30,76 tokens/s para el base, en el hardware de evaluación no especificado. La latencia no se reporta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo de ataques (evaluación del autor) | Licencia | Disponibilidad |
| :--- | ---: | ---: | ---: | :--- | :--- |
| `soapyyapps/tiny-aya-global-circuit-kavach-merged` | 3.349 M | no disponible | 96,5 % (4/72 bloques) | Apache 2.0 | Hugging Face, transformers |
| `CohereLabs/tiny-aya-global` (base) | 3.886 M (según model card) | no disponible | 45,5 % | Apache 2.0 | Hugging Face, transformers |
| `CohereLabs/tiny-aya-earth` (variante regional) | no disponible | no disponible | 53,5 % base; 99,0 % tras reparación quirúrgica | Apache 2.0 | Hugging Face, transformers |
| `CohereLabs/tiny-aya-water` (variante regional) | no disponible | no disponible | 53,5 % base; 96,5 % tras reparación quirúrgica | Apache 2.0 | Hugging Face, transformers |
| `CohereLabs/tiny-aya-fire` (variante regional) | no disponible | no disponible | 40,0 % base; 94,5 % tras reparación quirúrgica | Apache 2.0 | Hugging Face, transformers |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, Llama 3.2 3B o Qwen2.5 3B) no está disponible en la información proporcionada, ya que no se han publicado evaluaciones cruzadas con esos modelos.

## Limitaciones y advertencias

- El modelo se distribuye como un experimento de investigación en interpretabilidad y reparación de circuitos; no hay evidencia de validación independiente más allá de la evaluación del propio autor sobre 200 pares.
- La evaluación de seguridad se basa en un conjunto de 200 pares dañinos y 200 benignos; el tamaño es reducido y no cubre la diversidad de ataques adversariales del mundo real.
- El kanglish es el registro con peor rendimiento quirúrgico (86 %, frente al 96 % del ajuste global), por lo que en ese idioma el ajuste global de 72/72 bloques sigue siendo superior.
- El par de calibración de rechazo se define con los tokens ` sorry` y ` when`; la robustez del circuito ante otras formulaciones de rechazo no se documenta.
- No se reportan evaluaciones de sesgo, toxicidad ni alucinación; al derivar del base tiny-aya-global, hereda sus sesgos y sus limitaciones de conocimiento factual.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- El repositorio no publica conversiones GGUF ni cuantizaciones listas para llama.cpp u Ollama; usarlo en esos entornos requiere generar las conversiones.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base CohereLabs/tiny-aya-global y las condiciones de la familia Aya, ya que el checkpoint es un derivado.
- El número de descargas (21) y de likes (0) es muy bajo; no hay señales de adopción en producción ni de mantenimiento continuado.
- La model card cita 3.886.098.432 parámetros como referencia del base, mientras que los safetensors del repo suman 3.349.227.520; la discrepancia no se explica en la información disponible y conviene verificarla antes de dimensionar infraestructura.

## Enlaces

- Hugging Face: https://huggingface.co/soapyyapps/tiny-aya-global-circuit-kavach-merged
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Variante regional fire: https://huggingface.co/CohereLabs/tiny-aya-fire
- Variante regional water: no disponible en la información proporcionada
- Variante regional earth: no disponible en la información proporcionada
- Paper o blog del método C-ΔΘ / SafeTune / CircuitKIT: no disponible en la información proporcionada
- Repositorio de código (CircuitKIT, AuditKIT, SafeTune): no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
