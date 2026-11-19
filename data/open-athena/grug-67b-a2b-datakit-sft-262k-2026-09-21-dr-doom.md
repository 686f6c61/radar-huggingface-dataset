# open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom

## Resumen

Dr. Doom es un ajuste fino (fine-tune) de pesos completos en BF16 del modelo Grug-67B-A2B-Datakit-SFT-262K-2026.09.21, desarrollado por el colectivo open-athena dentro del ecosistema Marin. Su objetivo es muy concreto: eliminar los "doom loops", es decir, continuaciones repetitivas exactas que el modelo base produce en tareas de razonamiento matemático y de dominio cruzado. No es un modelo de propósito general, sino un artefacto de investigación que demuestra una técnica de optimización por refuerzo (FTPO) aplicada a un modelo MoE de gran tamaño.

El modelo hereda la arquitectura Grug MoE con 67.078.882.816 parámetros totales y una ventana de contexto configurada de 262K tokens. La campaña de entrenamiento se centró en reducir la tasa de bucles repetitivos manteniendo o mejorando la corrección de las respuestas, con resultados medidos en cohortes de 512 y 100 prompts. El checkpoint liberado corresponde a la iteración "mixed-long-smoke v2, update 2" de la campaña de octubre de 2026.

Es relevante ahora porque documenta de forma transparente una técnica de RL online (FTPO) sobre un MoE grande, con registros de experimentos, ablaciones y fallos. El propio autor advierte que es un artefacto de investigación no validado para producción, y que ni la seguridad ni el rendimiento en contexto largo están establecidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (mixture-of-experts), transformer, según tags `grug_moe` y `marin` |
| Parametros totales | 67.078.882.816 (67,08 B) |
| Parametros activos | no disponible (denominación A2B sugiere ~2 B activos, no confirmado en la información) |
| Longitud de contexto | 262K tokens (valor de configuración, no validado) |
| Tipos de cuantizacion | no disponible (pesos liberados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |
| Tamaño del repo | 134,2 GB |
| Modelo base | open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21 |
| Pipeline | text-generation |
| Descargas | 2.964 |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts (MoE) perteneciente a la familia Grug, entrenado dentro del stack Marin. El checkpoint base es un SFT sobre el dataset Datakit con contexto de 262K. Dr. Doom aplica sobre él un ajuste fino de pesos completos en BF16 mediante FTPO (final-token preference optimization) online, adaptando la referencia Antidoom en el runtime MarinSkyRL (PR 887).

La campaña de RL usó rollouts greedy online que proporcionan IDs de token exactos y log-probabilidades top-32. Cuando se detecta un sufijo repetitivo exacto, FTPO selecciona la primera frontera de repetición, trata el token generado como rechazado y entrena tokens alternativos para superarlo con un margen de logit. Se aplican penalizaciones MSE de logits de vocabulario contra una referencia congelada, con equilibrio de frecuencia por lote. La etapa final usó pesos de muestreo matemáticas:instrucciones:código de 2:1:1, batch de 64, presupuesto de prompt de 2.048 tokens y hasta 32.768 tokens de respuesta, con detector de bucles de periodo máximo 4.096 y al menos ocho repeticiones. AdamW con dos actualizaciones a LR 2e-7, sin weight decay, clipping de norma de gradiente 0.5. El entrenamiento usó 40 GPU H100 (32 para actores política/referencia colocados con TP=1, PP=2, CP=1, EP=16, más 8 GPU de rollout). La línea de linaje incluye SFT original, FTPO estándar de matemáticas hasta el update 35, rama de ventana completa hasta el 45, ronda de matemáticas con referencia fresca update 5, ronda de dominio mixto update 5 y FTPO de respuesta larga update 2.

## Capacidades

- Generación de texto conversacional y de razonamiento, con foco en reducir bucles repetitivos en cadenas de razonamiento matemático.
- Razonamiento matemático: la cohorte de evaluación mide respuestas correctas en 512 prompts de matemáticas.
- Generación de código: incluida en el muestreo de entrenamiento con peso 1 sobre 4, aunque el autor señala que el seguimiento de instrucciones, la codificación y las matemáticas asistidas por herramientas siguen siendo problemáticos.
- Seguimiento de instrucciones: presente en el entrenamiento, con resultados no plenamente satisfactorios según la model card.
- Uso de herramientas (tool calling): el dominio cruzado incluye historiales de herramientas; el autor menciona "tool-assisted math" y "tool histories" en la evaluación, aunque no se detalla el soporte formal de function calling.
- Capacidad de "de-looping": capacidad específica entrenada para evitar repeticiones exactas de patrones de tokens.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre repetición en LLM: el modelo sirve como caso de estudio reproducible de cómo FTPO online reduce bucles exactos en un MoE de 67B, con registros de experimentos y ablaciones públicos.
- Evaluación de técnicas de RL para decodificación: útil para comparar FTPO frente a otras estrategias de penalización de repetición en pipelines de investigación.
- Generación de razonamiento matemático en entornos controlados: con una tasa de bucles medida del 2,34% en matemáticas (12/512), puede usarse en experimentos donde la repetición exacta degrada la salida, siempre fuera de producción.
- Análisis de dominio cruzado: la cohorte de 100 prompts con límite de 32K permite estudiar el comportamiento en tareas mixtas con historiales de herramientas.
- Reproducción de campañas de RL: los configs y el código fuente incluidos permiten replicar el entorno MarinSkyRL con el runtime fijado.
- Estudio de linaje de checkpoints: la cadena de rondas (SFT → FTPO matemáticas → ventana completa → rondas mixtas) permite analizar la contribución de cada etapa, aunque el autor advierte que las evaluaciones no aíslan la causalidad de cada etapa.

## Benchmarks y rendimiento

| Evaluación | SFT original | Dr. Doom |
|---|---:|---:|
| Bucles en matemáticas · 512 prompts · límite 16K | 139/512 (27,15%) | 12/512 (2,34%) |
| Respuestas correctas en matemáticas · misma cohorte | 232/512 (45,31%) | 283/512 (55,27%) |
| Bucles en dominio cruzado · 100 prompts · límite 32K | 43 confirmados + 1 no evaluado (43–44%) | 19/100 (19%) |
| Verificaciones superadas en dominio cruzado | 19 superadas; 92 calificadas, 7 no disponibles, 1 error | 26 superadas; 94 calificadas, 6 no disponibles, 0 errores |

Notas del autor: los hashes de prompt coinciden dentro de cada comparación; son evaluaciones únicas en contextos de runtime y carga de pesos distintos, por lo que no aíslan la contribución causal de cada etapa. Las verificaciones superadas son recuentos, no precisión uniforme de benchmark. El detector requiere al menos ocho copias exactas de un patrón de tokens hasta el final del segmento generado, con periodos de hasta 2.048 tokens a 16K y 4.096 a 32K; no detecta repetición irregular o semántica y puede marcar repetición intencionada. El objetivo de la campaña (<5% de bucles por dominio con menos de 50 ejemplos y <2% en dominios mayores) no se alcanzó. El update 10 de ronda mixta logró el mejor resultado individual en matemáticas (9/512 bucles, 1,76%) pero con menor corrección (268/512, 52,34%). El export seleccionado no tiene evaluación completa de 512 prompts a 32K; su piloto final de 64 prompts a 32K midió 8 bucles y 40 respuestas correctas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 134 GB solo para pesos, más overhead de activaciones y KV cache; requiere múltiples GPU.
- GPU recomendadas: H100 (el entrenamiento usó 40 H100 con TP=1, PP=2, EP=16); para inferencia se necesitan al menos 2 GPU de 80 GB en BF16, y más para contexto largo.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) en BF16; requeriría cuantización, no publicada en la información disponible.
- Opciones de despliegue: no se especifican en la model card; el stack MarinSkyRL se usó para entrenamiento, no se documenta vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dr. Doom (open-athena) | 67,08 B (MoE) | 262K (no validado) | Fine-tune FTPO anti-bucles | openmdw-1.1 | Hugging Face |
| Grug-67B-A2B-Datakit-SFT-262K (base) | 67,08 B (MoE) | 262K | SFT sobre Datakit | openmdw-1.1 (según modelo derivado) | Hugging Face |
| Antidoom (Liquid4All) | no disponible | no disponible | Referencia de técnica anti-bucles | no disponible | GitHub |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada; la comparación se limita al modelo base y a la referencia metodológica.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que no ha sido probado ni evaluado de forma exhaustiva y que no está validado para producción.
- El objetivo de la campaña (<5% de bucles por dominio pequeño y <2% en dominios grandes) no se alcanzó.
- El seguimiento de instrucciones, la codificación y las matemáticas asistidas por herramientas siguen siendo problemáticos.
- El contexto de 262K es un valor de configuración; su rendimiento real no está validado.
- El detector de bucles solo captura repetición exacta de al menos ocho copias con periodo máximo de 4.096 tokens; no detecta repetición irregular o semántica y puede marcar repetición intencionada.
- Las evaluaciones son únicas, en contextos de runtime distintos, y no aíslan la contribución causal de cada etapa del linaje.
- Las estimaciones en dominios pequeños son ruidosas; el export seleccionado carece de evaluación completa de matemáticas a 32K.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Licencia openmdw-1.1: deben revisarse sus términos para uso comercial; no se detallan restricciones en la información proporcionada.
- El tamaño de 134 GB en BF16 impide el despliegue en hardware de consumo sin cuantización no publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21-dr-doom
- Modelo base: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-262K-2026.09.21
- Issue de experimento Marin: https://github.com/marin-community/marin/issues/9691
- Lecciones aprendidas (comentario): https://github.com/marin-community/marin/issues/9691#issuecomment-5958700252
- PR de MarinSkyRL: https://github.com/marin-community/MarinSkyRL/pull/887
- Referencia Antidoom: https://github.com/Liquid4All/antidoom/tree/bd6a126476e18554b0cacaea3fd9f258fdde1f97
- Tabla de resultados por dominio: selected-domain-results.md (en el repo)
- Evidencia de evaluación: evidence/cross-domain-mixed-long-smoke-v2-step2-loops.json (en el repo)
- Tracker de experimentos: experiment-tracker.md (en el repo)
- Configuraciones: configs/ (en el repo)
- Código fuente: source/ (en el repo)
