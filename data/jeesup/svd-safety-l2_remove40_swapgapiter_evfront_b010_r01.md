# Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r01

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r01` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta el 60,0% de sus parámetros densos de proyección (se elimina el 40,02%) y posteriormente editado con una única ronda de swap neutral en parámetros. Lo publica el usuario Jeesup como artefacto de investigación, no como asistente desplegable.

El objetivo declarado del estudio es medir cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad (elevando la tasa de éxito de ataques) y qué regla de selección de componentes repara mejor ese daño. Este checkpoint concreto aplica la regla `gap_iter` con un presupuesto de restauración del 1,000% de los parámetros densos, ejecutado en una sola de las diez rondas previstas (0,100% por ronda).

El peso en safetensors es de 6.738.415.616 parámetros (13,5 GB de repositorio), hereda la arquitectura transformer decoder-only de Llama 2 con 4.096 tokens de contexto y se distribuye bajo la Llama 2 Community License. El autor advierte explícitamente que varias celdas del grid están deliberadamente degradadas en seguridad y que la celda debe tratarse como sujeto experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con capas de proyección comprimidas por SVD-LLM |
| Parámetros totales | 6.738.415.616 (safetensors); fracción de parámetros de proyección resultante: 0,5998 |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base se entrenó predominantemente en inglés) |
| Licencia | Llama 2 Community License (`llama2`), con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (librería `transformers`, pipeline `text-generation`) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de tipo Llama 2, con normalización RMSNorm, RoPE y atención por causalidad estándar. Sobre esa base no hay entrenamiento adicional: la transformación es una compresión post-hoc con SVD-LLM que elimina el 40,02% de los parámetros de proyección mediante truncación de valores singulares, dejando el checkpoint al 59,98% de la fracción densa. Después se aplica una edición de parámetros de tipo swap neutral: se restauran 643 componentes y se sustituyen 621, con 6.470.144 parámetros intercambiados (0,10% de los parámetros de proyección densos). El valor de swap es `insert` (solo valor de inserción, con evicción ordenada por sigma) y la semilla es 42.

La selección de componentes la gobierna la regla `gap_iter`, con un presupuesto total de ejecución del 1,000% de los parámetros densos repartido en diez rondas de 0,100%. Este repositorio corresponde a un checkpoint intermedio: solo se ha aplicado 1 de las 10 rondas. No se documentan en la información disponible fases de RLHF, DPO o ajuste adicional más allá del alineamiento original de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de chat de Llama-2-7b-chat, aunque el autor advierte que no debe tratarse como asistente de propósito general.
- Comportamiento de seguridad parcialmente restaurado: la ronda aplicada recupera componentes de proyección, pero solo dentro de un presupuesto del 0,10%; el efecto sobre el comportamiento final es objeto de estudio, no un resultado garantizado.
- Sujeto de medida de seguridad: exponer el modelo a prompts de ataque (AdvBench, StrongREJECT) y medir la tasa de éxito con HarmBench como juez.
- Medición de sobre-rechazo: evaluable con WildGuard sobre prompts benignos.
- Interpretabilidad de componentes: al conocer qué 643 componentes se restauraron y qué 621 se sustituyeron, permite analizar qué partes de la red sostienen el comportamiento de rechazo.
- Reproducibilidad experimental: semilla fija (42), presupuesto y regla de selección documentados.
- No documentado: tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio o cualquier modalidad distinta de texto. No hay declaración de capacidades multilingües.

## Casos de uso

- Estudio de degradación de seguridad por compresión: reproducir la medición de ASR en AdvBench sobre este checkpoint y sobre la base sin comprimir para aislar el daño introducido por SVD-LLM.
- Comparación de reglas de selección de componentes: usar esta celda (regla `gap_iter`) como punto de comparación frente al resto de reglas del grid del mismo estudio, manteniendo constante el presupuesto del 1,000%.
- Evaluación de reparación iterativa: al ser la ronda 1 de 10, sirve para medir la curva de recuperación de seguridad ronda a ronda y decidir si merece la pena completar las nueve rondas restantes.
- Red-teaming automatizado: integrarlo como objetivo en un pipeline que genere ataques y puntúe con HarmBench, para calibrar detectores automáticos de jailbreak sobre modelos comprimidos.
- Análisis de sobre-rechazo: ejecutar WildGuard sobre un conjunto benigno y medir el compromiso entre seguridad y utilidad (macro over-refusal del 0,1030 en esta celda).
- Interpretabilidad de mecanismos de seguridad: comparar los pesos de los 643 componentes restaurados con los 621 sustituidos para localizar qué canales de proyección concentran la función de rechazo.
- Metodología docente o de revisión: ejemplo reproducible de ficha experimental con procedencia, presupuesto y métricas auditables, útil para enseñar evaluación de seguridad reproducible.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Juez |
|---|---|---|---|
| AdvBench | ASR (attack success rate) | 0,1750 | HarmBench judge |
| StrongREJECT | ASR (attack success rate) | 0,1350 | HarmBench judge |
| WildGuard | Macro over-refusal (prompts benignos) | 0,1030 | WildGuard |

En las métricas de ASR, un valor más bajo es mejor. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras baterías de capacidad general, ni cifras comparativas de la base sin comprimir bajo el mismo protocolo de medida.

## Requisitos de hardware

- VRAM estimada en fp16: unos 13,5 GB solo para pesos (2 bytes por parámetro × 6.738 millones), más caché KV y overhead; en la práctica, 15-16 GB para secuencias de contexto largo.
- VRAM estimada con cuantización: aproximadamente 7-8 GB en 8 bits y 4-5 GB en 4 bits, siempre que se genere la conversión correspondiente (no publicada en el repositorio).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o cualquier GPU de 24 GB o más para fp16.
- Cabe en GPU de consumo: sí en RTX 3090 y RTX 4090 (24 GB) en fp16; en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) requiere cuantización a 8 bits o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), vLLM (etiqueta `endpoints_compatible`). Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Seguridad (ASR AdvBench) | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SVD-LLM 60% + swap `gap_iter`) | 6.738.415.616 en safetensors; fracción densa 0,5998 | 4.096 tokens | Llama 2 Community License | 0,1750 (HarmBench judge) | Safetensors en HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | no disponible en la información proporcionada | Ampliamente disponible |
| Mistral-7B-Instruct-v0.2 | ≈7.200 millones | 32.768 tokens | Apache 2.0 | no disponible bajo el mismo protocolo | Ampliamente disponible |
| Otras celdas del grid del mismo estudio | no disponible | 4.096 tokens | Llama 2 Community License | no disponible | No identificadas con ID concreto en la información proporcionada |

La comparación de seguridad entre filas no es homogénea: solo esta celda tiene ASR medido con HarmBench judge en la información disponible, por lo que las diferencias de la tabla no deben interpretarse como una ranking de seguridad.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo de chat de propósito general y que debe evaluarse antes de extraer conclusiones.
- Seguridad deliberadamente degradada: la compresión por sí sola eleva la tasa de éxito de ataques; varias celdas del grid están degradadas a propósito y esta es una de ellas.
- Reparación incompleta: solo se ha aplicado 1 de 10 rondas de swap, con un 0,10% de parámetros intercambiados frente al presupuesto total del 1,000%.
- ASR medido no despreciable: 0,1750 en AdvBench y 0,1350 en StrongREJECT implican que una fracción relevante de ataques tiene éxito.
- Sobre-rechazo: 0,1030 de macro over-refusal en WildGuard, lo que indica rechazos indebidos sobre prompts benignos.
- Riesgo de alucinación: no medido en la información disponible; el modelo base Llama-2-7b-chat ya presenta alucinaciones y la compresión puede agravarlas, pero no hay dato que lo cuantifique aquí.
- Idiomas: sin declaración oficial; la cobertura multilingüe no está garantizada ni medida.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Licencia: Llama 2 Community License, con obligaciones de atribución ("Built with Llama 2"), cumplimiento de la Acceptable Use Policy y condiciones adicionales para entidades de gran escala; el uso comercial está sujeto a esas cláusulas.
- Estado del repositorio: 0 descargas y 0 likes, sin validación externa de la comunidad; no hay resultados de benchmarks generales publicados.
- No apto para producción en aplicaciones orientadas a usuarios finales sin una evaluación de seguridad específica y, probablemente, un realineamiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Referencias de los métodos citados en la model card (identificadores no verificados en la información proporcionada): Llama 2, https://arxiv.org/abs/2307.09288; SVD-LLM, https://arxiv.org/abs/2403.07378; HarmBench, https://arxiv.org/abs/2402.04249; StrongREJECT, https://arxiv.org/abs/2402.10260; WildGuard, https://huggingface.co/allenai/wildguard
- Búsqueda web realizada: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a scripts de administración para servidores FiveM y no guardan relación con este checkpoint).
