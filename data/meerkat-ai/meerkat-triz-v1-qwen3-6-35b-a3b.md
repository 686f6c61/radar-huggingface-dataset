# Meerkat-AI/Meerkat-TRIZ-v1-Qwen3.6-35B-A3B

## Resumen

Meerkat-TRIZ-v1 es un adaptador LoRA (PEFT) de 181 MB desarrollado por Meerkat-AI sobre el modelo base Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje de arquitectura Mixture-of-Experts con 35 mil millones de parámetros totales y 3 mil millones activos. El adaptador está especializado en el dominio TRIZ (Teoría de Resolución de Problemas Inventivos) y responde preguntas en chino sobre seis tipos de tareas: recomendación de principios inventivos, análisis de contradicciones, guía ARIZ, evaluación de innovación, explicación de conceptos y generación de casos.

La relevancia de este lanzamiento reside en su enfoque en transparencia de evaluación: todas las afirmaciones de rendimiento se producen mediante un harness de doble vía con estadísticas pareadas, intervalos de confianza y revisión externa posterior al lanzamiento. El adaptador se distribuye bajo licencia Apache-2.0, igual que su modelo base, y está pensado para integrarse en flujos de trabajo de ingeniería de prompts y generación de texto en chino.

El modelo es sensible al formato de prompt: requiere conservar el bloque de pensamiento vacío (` thinking\n\n response`) en la plantilla de chat, ya que el modelo base es "thinking-native" y eliminar ese bloque degrada la calidad de salida en aproximadamente −0,2 puntos según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-35B-A3B (MoE, transformer) |
| Parametros totales | 35B (modelo base) + adaptador LoRA de 181 MB |
| Parametros activos | 3B (modelo base, arquitectura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 sobre el base) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3.6-35B-A3B, un modelo de arquitectura transformer con mezcla de expertos (MoE) que activa 3 mil millones de parámetros por token. El adaptador LoRA se ajusta específicamente para el dominio TRIZ, con datos de entrenamiento en chino que cubren los seis tipos de tareas mencionados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; el autor indica que el generador de datos de entrenamiento comparte familia con el juez de evaluación (Moonshot), lo que se declara como una debilidad metodológica y se cuantifica mediante revisión externa posterior.

El entrenamiento sigue una regla de formato estricta (regla E0): el bloque de pensamiento vacío debe conservarse tanto en entrenamiento como en evaluación. El modelo base es "thinking-native", por lo que la plantilla de chat emite ese bloque incluso con `enable_thinking=False`.

## Capacidades

- Generación de texto en chino especializada en TRIZ: recomendación de principios inventivos, análisis de contradicciones técnicas y físicas, guía paso a paso del algoritmo ARIZ, evaluación de innovación, explicación de conceptos y generación de casos de uso.
- Razonamiento multi-turno: el adaptador mantiene el formato de chat del modelo base y puede gestionar conversaciones con contexto de sistema y usuario.
- Sensibilidad al formato de prompt: requiere el bloque de pensamiento vacío para mantener la calidad; si se elimina, la puntuación del juez cae aproximadamente −0,2 puntos.
- Evaluación transparente: el autor publica un harness de doble vía (keyword hit rate + LLM judge 0–4) con estadísticas pareadas, intervalos de confianza y revisión externa con tres jueces (claude-sonnet-4-6, gpt-5.4, gemini-3.5-flash).
- No se reportan capacidades de tool calling, visión, audio ni agentes en la información disponible.

## Casos de uso

- Asistente de innovación para ingenieros: un ingeniero de producto puede preguntar "¿cómo resolver una contradicción técnica entre peso y resistencia?" y el modelo recomienda principios inventivos específicos con ejemplos, gracias a su entrenamiento en análisis de contradicciones.
- Formación en metodología TRIZ: formadores y estudiantes pueden usar el modelo para explicar conceptos como "qué es una contradicción física" o "cómo aplicar ARIZ paso a paso", con respuestas en chino y ejemplos generados.
- Evaluación de ideas de patentes: el modelo puede evaluar la novedad y el potencial inventivo de una propuesta, apoyándose en su capacidad de "innovation assessment" con puntuaciones del juez.
- Generación de casos de estudio: para documentación técnica o material didáctico, el modelo genera casos de aplicación de principios inventivos en contextos industriales concretos.
- Integración en pipelines de RAG sobre documentación TRIZ: al ser un adaptador LoRA ligero, puede combinarse con un sistema de recuperación para responder preguntas específicas de una base de conocimiento corporativa.
- Benchmarking de calidad de respuestas: el harness de evaluación publicado permite a equipos de investigación medir objetivamente la mejora del adaptador frente al modelo base en tareas TRIZ, con estadísticas pareadas y CIs.

## Benchmarks y rendimiento

El autor publica resultados en dos conjuntos de oro (v4: 100 ítems, v5: 300 ítems) con doble vía de puntuación. La tabla principal corresponde al protocolo v5 (evaluación en distribución):

| Metrica | Base | Meerkat-TRIZ-v1 | Diferencia pareada [95% CI] |
|---|---|---|---|
| Keyword-track media | 0.6384 | 0.6383 | −0.0001 [−0.017, +0.017] n.s. |
| Judge Arm-A media | 3.0300 | 3.4233 | +0.3933 [+0.297, +0.490] sig. |
| Judge pass rate | 0.843 [0.798, 0.880] | 0.947 [0.915, 0.967] | McNemar p=1.5e-05 |
| Keyword pass rate | 0.737 [0.684, 0.783] | 0.747 [0.695, 0.793] | — |

Revisión externa posterior al lanzamiento (299 ítems pareados, protocolo Arm-A re-ejecutado con tres jueces externos):

| Juez | Diferencia pareada [95% CI] | Significativo |
|---|---|---|
| claude-sonnet-4-6 (Anthropic) | +0.094 [+0.020, +0.167] | sí |
| gpt-5.4 (OpenAI) | +0.104 [+0.020, +0.184] | sí |
| gemini-3.5-flash (Google) | −0.048 [−0.144, +0.045] | no |

El autor concluye que la mejora defendible es de +0.09 a +0.10, significativa bajo dos de tres jueces externos, y que la lectura de +0.39 del juez de la misma familia está inflada aproximadamente 4× por efectos de familia de juez. El subconjunto con mayor consenso es `concept_explanation` (+0.24 / +0.31 / +0.29, significativo bajo los tres jueces externos). En el protocolo v4, el modelo queda estadísticamente empatado con el ancla limpia v2 (diferencia de juez −0.2200 [−0.470, +0.010] n.s.), aunque el harness v4 elimina el bloque de pensamiento vacío, lo que supone un desajuste de formato.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.6-35B-A3B en bfloat16 requiere aproximadamente 70 GB de VRAM para inferencia sin cuantización; con cuantización de 4 bits podría reducirse a unos 20-25 GB, pero no se especifican cuantizaciones oficiales en la información disponible.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs de consumo de gama alta con 24 GB o más (RTX 4090, RTX 3090) si se aplica cuantización.
- El adaptador LoRA de 181 MB se carga sobre el modelo base; el peso adicional es despreciable frente al base.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` con `device_map="cuda"`. También puede desplegarse con vLLM o TGI si soportan carga de adaptadores PEFT, aunque no se confirma en la documentación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA especializados en TRIZ sobre modelos de la misma familia. La comparativa más relevante es contra el modelo base sin adaptador, que es el ancla de referencia en las evaluaciones publicadas:

| Modelo | Parametros | Contexto | Rendimiento (judge v5) | Licencia |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | no disponible | 3.0300 | Apache-2.0 |
| Meerkat-TRIZ-v1 (adaptador) | 35B + 181 MB LoRA | no disponible | 3.4233 (misma familia) / +0.09~+0.10 (externo) | Apache-2.0 |

No se identifican alternativas comerciales o de código abierto comparables en el dominio TRIZ con evaluación externa publicada.

## Limitaciones y advertencias

- Sesgo de idioma: el modelo está entrenado y evaluado exclusivamente en chino; no se reportan capacidades en otros idiomas.
- Sensibilidad al formato de prompt: si el bloque de pensamiento vacío se elimina, la calidad de salida degrada en aproximadamente −0,2 puntos según mediciones del autor. Esto puede causar fallos silenciosos en integraciones que normalicen la plantilla de chat.
- Riesgo de alucinación: no se reportan métricas específicas de alucinación; el modelo puede generar principios inventivos o casos plausibles pero incorrectos, especialmente en tareas de generación de casos (el subconjunto `case_generation` mostró una diferencia negativa significativa en keyword track en el protocolo v4: −0.137 [−0.270, −0.030]).
- Sesgo de evaluación: el juez de la misma familia (Moonshot) infla la mejora aproximadamente 4×; los resultados externos son más modestos (+0.09~+0.10) y uno de los tres jueces externos (gemini-3.5-flash) no encuentra mejora significativa, e incluso puntúa `principle_recommendation` significativamente peor (−0.31).
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, tanto para el adaptador como para el modelo base.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada; se recomienda verificar la documentación del modelo base Qwen3.6-35B-A3B.
- Dependencia del modelo base: el adaptador no es autónomo; requiere cargar Qwen3.6-35B-A3B, lo que implica requisitos de hardware considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Meerkat-AI/Meerkat-TRIZ-v1
- Repositorio GitHub del harness y whitepaper: https://github.com/coidea-sys/meerkat-triz
- Informe de revisión externa: https://github.com/coidea-sys/meerkat-triz/blob/main/docs/EXTERNAL_JUDGE_REVIEW.md
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Página de inferencia en FriendliAI: https://friendli.ai/models/Meerkat-AI/Meerkat-TRIZ-v1
