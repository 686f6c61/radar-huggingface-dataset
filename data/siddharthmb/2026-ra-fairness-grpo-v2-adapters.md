# siddharthmb/2026.RA.Fairness-GRPO-v2-Adapters

## Resumen

El repositorio `siddharthmb/2026.RA.Fairness-GRPO-v2-Adapters` contiene los adaptadores LoRA (PEFT) entrenados mediante GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen3-8B, con el objetivo de mejorar la equidad en negociaciones multi-agente. El autor, siddharthmb, plantea una pregunta de investigación concreta: si un refuerzo por recompensa alineada con el resultado (una recompensa log-Nash calculada por un motor, sin leer el texto) puede hacer que un LLM negociador distribuya el excedente de forma más justa en juegos no vistos, y si esa mejora se generaliza a escenarios donde los números no son legibles por máquina.

El resultado principal, documentado en la model card, es un **veredicto negativo claro**: todos los brazos entrenados fallan el umbral positivo preregistrado. La tasa de acuerdos en juegos held-out se degrada en todos los niveles de λ, y la transferencia de equidad a texto nunca se resuelve favorablemente. El estudio concluye que, para la equidad en negociación, un agente algorítmico con un parser supera al LLM entrenado con RL. El repositorio incluye múltiples checkpoints por brazo (λ=1.0, 0.5, 0.0) y es relevante como caso de estudio riguroso de RL para alineación de valores en entornos de negociación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA r32/α64; base: 8B) |
| Parametros activos | No disponible (todos los parámetros del adaptador son activos) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | No disponible (los adaptadores están en safetensors; el base puede cuantizarse) |
| Idiomas soportados | Inglés (según dataset de entrenamiento) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 32 y alpha 64 sobre las proyecciones q, k, v, o, gate, up y down de Qwen3-8B, con el modo de pensamiento desactivado. El entrenamiento usa GRPO con grupos de 22 y k=8, contra un zoo de oponentes congelados (bayes-rational, passive-gate, greedy-anchor). La recompensa es una combinación lineal entre la utilidad log-Nash suavizada (con suelo en −17.5) y la recompensa de tabla media, controlada por el parámetro λ. Se entrenaron tres brazos: λ=1.0 (bienestar de tabla puro), λ=0.5 (mezcla) y λ=0.0 (control egoísta). El entrenamiento se realizó en dos segmentos con reinicio de Adam en el punto de reanudación, y el ancho de los grupos varió entre segmentos (22→14→12 en λ=0.5) por migraciones de cómputo.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base Qwen3-8B.
- Especialización en tareas de negociación multi-agente (acuerdos, ultimátums, distribución de recursos).
- No se reportan capacidades de tool calling, agentes autónomos, visión o audio.
- El adaptador no añade capacidades nuevas; su efecto es modificar la política del modelo base hacia la recompensa entrenada.
- El resultado empírico muestra que no logra mejorar la equidad ni mantener la tasa de acuerdos.

## Casos de uso

- Investigación en RL para alineación de valores: permite estudiar cómo la elección de la función de recompensa (λ) afecta al comportamiento de un LLM en entornos de negociación, sirviendo como referencia negativa para futuros diseños.
- Evaluación de métodos de equidad en LLMs: los checkpoints pueden usarse para comparar el efecto de GRPO frente a otras técnicas (p. ej., DPO, PPO) en métricas de equidad y tasa de acuerdos.
- Análisis de degradación de políticas: los datos de telemetría y contrastes del dataset asociado permiten investigar por qué el RL colapsa la tasa de acuerdos cuando se paga por bienestar de tabla.
- Benchmark de robustez: los adaptadores pueden servir como casos de prueba para verificar si un sistema de evaluación detecta correctamente la caída de rendimiento en tareas de negociación.
- Estudio de extracción de límites: el hallazgo del checkpoint `lam1_checkpoint-25` (división 100/0 aceptada siempre) es útil para diseñar métricas de equidad que capturen distribuciones extremas.
- Reproducción de experimentos: el repositorio incluye instrucciones de entrenamiento y provenance, permitiendo replicar el pipeline completo para verificar los resultados.

## Benchmarks y rendimiento

La model card reporta la métrica principal: **delta de tasa de acuerdos en juegos held-out** frente al modelo base sin entrenar (Qwen3-8B), con bootstrapping por clúster de juegos. Los valores son negativos en todos los casos, indicando degradación.

| Paso global | λ=1.0 | λ=0.5 | λ=0.0 |
|---|---:|---:|---:|
| 5 | −0.052 | −0.058 | −0.028 |
| 10 | −0.143 | −0.046 | −0.075 |
| 15 | −0.147 | −0.058 | (parcial) |
| 20 | — | −0.151 | — |
| 25 | −0.226 | −0.267 | — |
| 30 | — | −0.240 | — |
| 35 | — | −0.445† | — |
| 40 | — | −0.173 | — |
| 45 | — | −0.271 | — |
| 50 | **−0.746** | **−0.369** | — |

† Rung 35 tras reinicio de Adam, anómalamente profundo. Las métricas de equidad condicionadas a cierre se marcan como VOID cuando la tasa de acuerdos cae más de 0.10 respecto a la base. No se reportan benchmarks estándar (MMLU, HumanEval, etc.).

## Requisitos de hardware

- Para inferencia con el adaptador, se necesita cargar el modelo base Qwen3-8B en memoria. En bf16, la VRAM estimada es de ~16 GB; con cuantización (p. ej., 4-bit) puede reducirse a ~6-8 GB.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.) para bf16; GPUs con 8 GB pueden funcionar con cuantización.
- El adaptador en sí es ligero (los checkpoints individuales son pequeños, aunque el repo completo ocupa 7.7 GB por incluir todos los pasos).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten PEFT (vLLM y TGI sí). El ejemplo de uso en la model card usa `transformers` + `peft`.
- Latencia y throughput: no disponibles; dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de comparaciones con otros adaptadores de RL para equidad en negociación. La comparación más directa es contra el modelo base Qwen3-8B sin entrenar, que es el punto de referencia en la evaluación. Otros modelos de negociación (p. ej., GPT-4, Llama-3) no se han evaluado en este estudio. Por tanto, la comparativa se limita a:

| Modelo | Parámetros | Contexto | Resultado en deal-rate | Licencia |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32k (típico) | Línea base | Apache 2.0 (Qwen) |
| Adaptador λ=1.0 (step 50) | 8B + LoRA | igual | −0.746 vs base | No disponible |
| Adaptador λ=0.5 (step 50) | 8B + LoRA | igual | −0.369 vs base | No disponible |

## Limitaciones y advertencias

- El resultado principal es negativo: el entrenamiento degrada la tasa de acuerdos y no mejora la equidad en juegos held-out. No debe usarse en producción para negociación real.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-8B; no se han evaluado específicamente.
- La licencia del adaptador no está especificada; el modelo base Qwen3-8B tiene licencia Apache 2.0, pero el adaptador podría tener restricciones adicionales no declaradas.
- El entrenamiento se realizó con el modo de pensamiento desactivado; el adaptador no es compatible con cadenas de razonamiento extendidas.
- Los checkpoints de λ=0.0 solo llegan al paso 15 (parcial) por coste; no hay datos para pasos posteriores.
- Las métricas de equidad condicionadas a cierre se invalidan cuando la tasa de acuerdos cae más de 0.10, lo que ocurre en la mayoría de los rungs.
- El hallazgo de extracción de límites (división 100/0) indica que el modelo puede aprender estrategias extremas que pasan los filtros de equidad convencionales.

## Enlaces

- Repositorio de adaptadores: https://huggingface.co/siddharthmb/2026.RA.Fairness-GRPO-v2-Adapters
- Dataset de evaluación (contrastes, telemetría, veredictos): https://huggingface.co/datasets/siddharthmb/2026.RA.Fairness-GRPO-v2
- Dataset de entrenamiento (v1): https://huggingface.co/datasets/siddharthmb/2026.RA.Fairness-GRPO
- Hub narrativo del experimento: https://rational-agents-runs.sidmb.com/grpo-v2-lam1-two-attractors/
- Nota de investigación (referenciada en la model card): `experiments/rational_agents/research-notes/0028-fairness-grpo-v2.md` (no disponible públicamente en el repo).
