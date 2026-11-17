# soapyyapps/tiny-aya-earth-circuit-kavach-merged

## Resumen

CircuitKavach-Aya es un checkpoint derivado de CohereLabs/tiny-aya-earth, un modelo de generación de texto de 3.349 millones de parámetros (3,35 B) desarrollado por el autor independiente soapyyapps. El modelo aplica una técnica de "trasplante quirúrgico de circuitos" denominada C-ΔΘ sobre el modelo base, modificando únicamente 4 de los 72 bloques de proyección (2,55 % de los parámetros, unos 99,09 M) para reforzar la negativa ante peticiones dañinas, manteniendo el 97,45 % restante de los pesos bit a bit idénticos al original. El objetivo es mejorar la seguridad del modelo en contextos multilingües del sur de Asia (inglés, hindi, guyaratí y canarés), incluyendo registros mixtos como hinglish, gujlish y kanglish.

La relevancia del checkpoint reside en su enfoque de interpretabilidad mecanicista: en lugar de un ajuste global con LoRA sobre todas las capas, se identifican mediante EAP-IG (Edge Attribution Patching with Integrated Gradients) los submodules que más contribuyen a la conducta de rechazo y se reparan solo esos. Según la model card, el resultado eleva la tasa de rechazo ante ataques del 53,5 % al 99,0 % con un 0 % de sobrerrechazo en peticiones benignas, y un estudio de universalidad sobre las cuatro variantes regionales de tiny-aya (fire, global, water, earth) muestra que todas descubren de forma independiente los mismos cuatro submodules de seguridad.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con arquitectura Cohere2 y está pensado para investigación en seguridad, auditoría de circuitos y despliegue conversacional en entornos multilingües del sur de Asia. No obstante, el número de descargas (19) y la ausencia de likes indican que se trata de un artefacto de investigación reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cohere2 (transformer decoder-only) |
| Parámetros totales | 3.349.227.520 (3,35 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el modelo base admite las habituales de la librería transformers, pero no se documentan en la ficha) |
| Idiomas soportados | en, hi, gu, kn (inglés, hindi, guyaratí, canarés), con evaluación adicional en registros mixtos hi_en, gu_en, kn_en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 6,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de CohereLabs/tiny-aya-earth, un transformer decoder-only de la familia Cohere2 con 3,35 B de parámetros, orientado a lenguas de Asia Occidental y África. Sobre esa base, el autor aplica un pipeline en tres etapas: (1) descubrimiento de circuitos con CircuitKIT mediante EAP-IG sobre pares de calibración de rechazo (el par de referencia es el token ` sorry` frente a ` when`, con una diferencia de logits de 15,97); (2) selección de los cuatro submodules con mayor puntuación de atribución; y (3) reparación con SafeTune aplicando la regla Θ_repaired = Θ_base + α · (M ⊙ ΔΘ) con best_alpha = 1,0, donde M es la máscara que restringe la actualización a los submodules seleccionados.

Los cuatro submodules intervenidos son `model.layers.16.self_attn` (rank_score 2,5253), `model.layers.0.mlp` (2,2188), `model.layers.20.self_attn` (1,8842) y `model.layers.21.self_attn` (1,7238). El entrenamiento tocó 15 de 291 tensores de pesos y dejó 276 tensores bit a bit idénticos al modelo base (bit_identical_unmasked_keys: True, unmasked_violations: []). La pérdida de entrenamiento final fue de 0,7106. La calibración usó 99 de 100 pares con filtro de margen (25 en inglés, 25 en hi_en, 25 en gu_en, 24 en kn_en), con una advertencia explícita de que el circuito no es exclusivo del inglés (english_only_circuit_warning: False). La fidelidad del circuito medida en la etapa 2 fue ablation_score = 0,8052, patching_score = 0,0107, Jaccard medio = 1,0000, Spearman medio = 0,999819, 62 nodos estables y kl_reduction_ratio = 0,0236.

No se documentan en la información disponible los datos de preentrenamiento del modelo base (número de tokens, composición del corpus) ni si hubo RLHF o DPO en su construcción original.

## Capacidades

- Generación de texto conversacional multilingüe en inglés, hindi, guyaratí y canarés, con soporte evaluado para registros mixtos (hinglish, gujlish, kanglish).
- Rechazo reforzado de peticiones dañinas: 99,0 % de tasa de rechazo ante ataques en la evaluación held-out de 200 pares, frente al 53,5 % del modelo base.
- Selectividad alta: 0 % de sobrerrechazo en las 200 peticiones benignas emparejadas, con una puntuación de ayuda benigna del 100 %.
- Razonamiento y generación de código: capacidades heredadas del modelo base tiny-aya-earth; no se documentan métricas específicas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales: el checkpoint está diseñado para auditoría de circuitos y mecanismo de interpretabilidad, con artefactos de evaluación (AuditKIT, CircuitKIT) asociados al pipeline.
- Idiomas adicionales fuera de los cuatro evaluados: no disponible.

## Casos de uso

- Moderación y filtrado de contenido en plataformas multilingües del sur de Asia: el modelo puede clasificar y rechazar peticiones dañinas en inglés, hindi, guyaratí y canarés, incluyendo mezclas de código, con una tasa de rechazo del 99,0 % y sin penalizar consultas benignas.
- Investigación en interpretabilidad mecanicista: sirve como caso de estudio reproducible de descubrimiento de circuitos con EAP-IG y reparación selectiva con SafeTune, ya que la model card documenta los submodules, puntuaciones y métricas de fidelidad.
- Auditoría de seguridad de modelos derivados: permite comparar el comportamiento de un ajuste quirúrgico (4/72 bloques) frente a un ajuste global (72/72) en términos de rechazo, sobrerrechazo y selectividad, usando los checkpoints 1, 2 y 3 del mismo repositorio.
- Despliegue conversacional ligero en entornos con recursos limitados: con 3,35 B de parámetros y pesos safetensors de 6,7 GB, el modelo es apto para inferencia en una sola GPU consumer de gama alta, aunque no se documentan requisitos oficiales.
- Estudio de universalidad de circuitos entre variantes regionales: el autor documenta que las cuatro variantes tiny-aya (fire, global, water, earth) descubren los mismos cuatro submodules con Jaccard = 1,000, lo que permite usar el checkpoint como referencia en estudios comparativos.
- Evaluación de sesgos y robustez lingüística: la tabla por idioma (en, hi_en, gu_en, kn_en) permite analizar cómo varía la conducta de rechazo según el registro y detectar brechas de cobertura en lenguas de bajos recursos.
- Integración en pipelines de auditoría automatizada: los artefactos AuditKIT (bootstrap emparejado, intervalos de significación) pueden incorporarse a flujos de validación de modelos antes de su despliegue en producción.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación del autor sobre 200 pares held-out (400 prompts) y no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K, que no se han publicado en la información disponible.

| Checkpoint | Parámetros modificados | Bloques de proyección | Rechazo ante ataques | Sobrerrechazo benigno | Ayuda benigna | Brecha de selectividad | RedTeam attack pass | Tokens/s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| checkpoint_1_base | 0,00 % | 0/72 | 53,5 % | 0,0 % | 100,0 % | +0,535 | 19,0 % | 30,59 |
| checkpoint_2_global_safetune | 100,00 % (LoRA todas las capas) | 72/72 | 99,5 % | 0,0 % | 100,0 % | +0,995 | 71,4 % | 28,83 |
| checkpoint_3_surgical_ctheta | 2,55 % | 4/72 | 99,0 % | 0,0 % | 100,0 % | +0,990 | 52,4 % | 28,54 |

Desglose por idioma (registro, tamaño de muestra y tasa de rechazo ante ataques):

| Registro | Base | Global SafeTune (72/72) | Surgical C-ΔΘ (4/72) | Ganancia quirúrgica vs. base | Sobrerrechazo benigno (quirúrgico) |
|---|---:|---:|---:|---:|---:|
| Inglés (en, n=50) | 100,0 % | 100,0 % | 100,0 % | +0,0 pp | 0,0 % |
| Hinglish (hi_en, n=50) | 66,0 % | 100,0 % | 100,0 % | +34,0 pp | 0,0 % |
| Gujlish (gu_en, n=50) | 16,0 % | 98,0 % | 96,0 % | +80,0 pp | 0,0 % |
| Kanglish (kn_en, n=50) | 32,0 % | 100,0 % | 100,0 % | +68,0 pp | 0,0 % |

Significación estadística (AuditKIT, bootstrap emparejado):

- Base vs. Surgical C-ΔΘ (n=200 pares dañinos): ganancia de +45,5 pp (0,535 → 0,990), p = 0,000999, significativa.
- Global SafeTune vs. Surgical C-ΔΘ (n=200 pares dañinos): delta = +0,005 (0,995 vs. 0,990), p = 0,612388, no significativa.
- Sobrerrechazo benigno (n=200 gemelos benignos): 0,0 %, p = 1,0, no significativo (cero sobrerrechazo colateral).

Estudio de universalidad sobre las cuatro variantes regionales (mismos cuatro submodules, Jaccard = 1,000):

| Modelo | Rechazo base | Global SafeTune (72/72) | Surgical C-ΔΘ (4/72) | Selectividad quirúrgica | Mejor α | Rechazo quirúrgico en kn_en |
|---|---:|---:|---:|---:|---:|---:|
| tiny-aya-fire | 40,0 % | 99,0 % | 94,5 % | +0,945 | 1,0 | 78,0 % |
| tiny-aya-global | 45,5 % | 99,0 % | 96,5 % | +0,965 | 1,0 | 86,0 % |
| tiny-aya-water | 53,5 % | 100,0 % | 96,5 % | +0,965 | 1,0 | 88,0 % |
| tiny-aya-earth | 53,5 % | 99,5 % | 99,0 % | +0,990 | 1,0 | 100,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en la información proporcionada. Como referencia orientativa basada en el tamaño (3,35 B de parámetros, repo de 6,7 GB en safetensors), una carga en fp16 requeriría aproximadamente 6,7 GB de pesos más memoria para el contexto y el runtime; en cuantizaciones de 8 bits o 4 bits el requisito sería sustancialmente menor, pero no se documentan cuantizaciones publicadas.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPUs con al menos 8-12 GB de VRAM en cuantización, aunque el autor no publica recomendaciones.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs consumer de gama alta (por ejemplo, RTX 4090 de 24 GB) y en modelos con 8-12 GB en cuantización, pero no hay confirmación oficial.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el autor reporta 28,54 tokens/s para el checkpoint quirúrgico y 30,59 tokens/s para el base en su entorno de evaluación, aunque no especifica el hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo ante ataques | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| tiny-aya-earth-circuit-kavach-merged (este) | 3,35 B | no disponible | 99,0 % (held-out propio) | Apache 2.0 | Hugging Face, 19 descargas |
| CohereLabs/tiny-aya-earth (base) | 3,35 B | no disponible | 53,5 % (held-out propio) | Apache 2.0 | Hugging Face |
| CohereLabs/tiny-aya-fire | no disponible | no disponible | 94,5 % (quirúrgico) | Apache 2.0 | Hugging Face |
| CohereLabs/tiny-aya-global | no disponible | no disponible | 96,5 % (quirúrgico) | Apache 2.0 | Hugging Face |
| CohereLabs/tiny-aya-water | no disponible | no disponible | 96,5 % (quirúrgico) | Apache 2.0 | Hugging Face |

No se dispone de comparaciones con modelos de seguridad de propósito general (por ejemplo, Llama Guard o ShieldGemma) en la información proporcionada, por lo que no es posible establecer una comparativa cruzada de rendimiento con esas alternativas.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la evaluación interna del autor (200 pares held-out), no de suites estándar ni de evaluaciones independientes; deben interpretarse con cautela.
- El modelo es un artefacto de investigación con muy poca adopción (19 descargas, 0 likes) y sin validación externa conocida.
- La evaluación de seguridad se centra en cuatro idiomas (en, hi, gu, kn) y sus registros mixtos; el comportamiento en otras lenguas o en dominios no cubiertos no está documentado.
- La tasa de rechazo en gujlish quirúrgico (96,0 %) es ligeramente inferior a la del ajuste global (98,0 %), lo que indica una brecha residual de cobertura en ese registro.
- El "RedTeam attack pass" del checkpoint quirúrgico (52,4 %) es inferior al del ajuste global (71,4 %), lo que sugiere que la reparación selectiva deja pasar más ataques que un ajuste completo en esa métrica concreta.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo hereda las limitaciones del base.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre la robustez frente a ataques adversariales adaptativos.
- El checkpoint modifica solo 4 de 72 bloques de proyección; los cambios en la conducta de seguridad son localizados y podrían no generalizar a distribuciones de ataque distintas de las usadas en la calibración.
- No se documentan requisitos de hardware oficiales ni cuantizaciones publicadas, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soapyyapps/tiny-aya-earth-circuit-kavach-merged
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Variante fire: https://huggingface.co/CohereLabs/tiny-aya-fire
- Variante global: https://huggingface.co/CohereLabs/tiny-aya-global
- Variante water: https://huggingface.co/CohereLabs/tiny-aya-water
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
