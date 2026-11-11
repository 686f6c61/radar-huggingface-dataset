# logitshq/GLM-5.3-Abliterated

## Resumen

GLM-5.3-Abliterated es una variante del checkpoint base GLM-5.3 de zai-org en la que el equipo de Logits ha editado los pesos a lo largo de la dirección de rechazo (técnica conocida como *abliteration*) para reducir la tasa de negativas del modelo ante peticiones dañinas. El repositorio de Hugging Face no contiene los pesos: aloja únicamente la model card y los resultados de evaluación. El propio autor indica de forma explícita que los pesos no se han publicado y que el modelo no se sirve en la plataforma Logits.

El modelo base es un transformer de la familia GLM, con capacidades de razonamiento extendido (siempre piensa, con control de esfuerzo), soporte de tool calling y predicción multi-token. La edición se realizó sobre el checkpoint FP8 de `zai-org/GLM-5.3` en el commit `ba32f8c1`. La entrada es exclusivamente texto y los idiomas declarados son inglés y chino.

La relevancia de esta ficha es doble: por un lado documenta un caso de estudio de abliteration con métricas de *trade-off* medibles (rechazos, capacidades, robustez de instrucciones); por otro, advierte de que el artefacto no es desplegable tal cual, ya que no hay pesos disponibles y la licencia hereda las restricciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia GLM-5.3); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han probado prompts de 54k tokens en las comprobaciones de serving) |
| Tipos de cuantizacion | FP8 (checkpoint base); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh |
| Licencia | other (hereda la licencia del checkpoint base `zai-org/GLM-5.3`) |
| Formato de pesos | pesos no publicados (el checkpoint base es FP8) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de que pertenece a la familia GLM-5.3 y de que soporta razonamiento extendido ("GLM-5.3 always thinks") con niveles de esfuerzo configurables, además de predicción multi-token (MTP). Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La intervención de Logits consiste en una edición de pesos a lo largo de la dirección de rechazo, sin reentrenamiento. La evaluación se realizó con vLLM, paralelismo tensorial de 8 vías, caché KV en FP8 y predicción multi-token de 5 tokens. Los prompts dañinos y las respuestas del modelo no se enviaron a APIs de terceros; solo se conservaron las puntuaciones. El juicio de las respuestas se hizo con Qwen3Guard-Gen-8B ejecutado en local.

## Capacidades

- Generación de texto y razonamiento extendido con control de esfuerzo (low, high, maximum).
- Razonamiento matemático y de conocimiento experto (resultados en GPQA Diamond, MMLU-Pro, GSM8K).
- Tool calling: 10 de 10 llamadas correctas en las comprobaciones de serving.
- Recuperación en contexto largo: aguja encontrada en el 10 %, 50 % y 90 % de un prompt de 54k tokens (3 de 3).
- Memoria multi-turno: funciona según las comprobaciones del autor.
- Predicción multi-token con 3,09 tokens aceptados por borrador.
- Capacidades multilingües limitadas a inglés y chino.
- Respuestas más largas que el modelo original (entre un 0,9 % y un 11,9 % más de tokens de salida según el benchmark).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para medir cómo varía la tasa de rechazo al editar la dirección de rechazo, con datos comparativos original/abliterated en JailbreakBench, HarmBench y XSTest.
- Evaluación de robustez de salvaguardas: útil para probar clasificadores de contenido y sistemas de moderación frente a un modelo con negativas reducidas (1 % en inglés, 11 % en chino en JailbreakBench).
- Análisis de *trade-offs* capacidad-seguridad: los resultados de GPQA Diamond, MMLU-Pro, IFBench y tau2-bench permiten estudiar el coste de la abliteration en tareas de agente e instrucciones estrictas.
- Referencia metodológica para técnicas de edición de pesos: la model card documenta el pipeline de evaluación (juez local Qwen3Guard-Gen-8B, intervalos bootstrap, control de temperatura y esfuerzo).
- Estudio de comportamiento de rechazo en agentes: el descenso de 8 a 10 puntos en tau2-bench airline ilustra cómo la edición afecta a negativas basadas en políticas, no solo a las de seguridad.
- Docencia y divulgación: material para explicar abliteration, dirección de rechazo y evaluación de seguridad con métricas concretas.

## Benchmarks y rendimiento

Rechazos (original → abliterated):

| Test | Respuestas juzgadas | Original → abliterated |
|---|---|---|
| JailbreakBench harmful | 100 | 93 % → 1 % |
| HarmBench (sin chem-bio) | 172 | 93,6 % → 1,2 % |
| JailbreakBench harmful, chino | 100 | 90 % → 11 % |
| Harmful, esfuerzo máximo, respuestas terminadas | 30 y 26 | 96,7 % → 0 % |
| XSTest safe prompts | 250 | 5,2 % → 0,4 % |
| JailbreakBench benign | 100 | 10 % → 1 % |
| Off-topic declinados con instrucción de sistema | 40 | 95 % → 77,5 % |
| On-topic declinados erróneamente | 20 | 0 % → 0 % |

Capacidad (original → abliterated, diferencia con intervalo del 95 %):

| Benchmark | Ítems | Original → abliterated | Diferencia |
|---|---|---|---|
| GPQA Diamond | 198 × 3 | 83,5 → 82,7 | −0,8 (−3,4; +1,7) |
| MMLU-Pro | 3.000 (subconjunto fijo) | 85,3 → 85,1 | −0,1 (−1,1; +0,8) |
| IFBench, prompt strict | 284 | 48,6 → 45,8 | −2,8 (−7,8; +2,1) |
| SimpleQA-Verified | 1.000 | 36,2 → 36,8 | +0,6 (−1,7; +3,0) |
| tau2-bench airline | 50 × 3 | 82,0 → 74,0 | −8,0 (−16,7; 0,0) |

Ejecuciones únicas a temperatura 0 (sin intervalo):

| Benchmark | Ítems | Original → abliterated |
|---|---|---|
| MMLU | 1.000 | 90,2 → 89,3 |
| GSM8K | 500 | 94,8 → 96,0 |
| IFEval, prompt strict | 541 | 84,7 → 85,2 |

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del modelo base no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. La evaluación se hizo con vLLM y paralelismo tensorial de 8 vías, lo que implica un despliegue multi-GPU.
- ¿Cabe en GPU de consumo? No disponible; sin el número de parámetros no puede determinarse.
- Opciones de despliegue: vLLM con caché KV en FP8 y predicción multi-token de 5 tokens (configuración usada en la evaluación). Otras opciones (llama.cpp, Ollama, TGI) no están documentadas.
- Latencia y throughput: no disponibles. Solo se conoce la aceptación de predicción multi-token (3,09 tokens por borrador).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos (JailbreakBench EN) | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| GLM-5.3 (original) | no disponible | no disponible | 93 % | other | sí (FP8) |
| GLM-5.3-Abliterated | no disponible | no disponible | 1 % | other | no |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están publicados y el modelo no se sirve en Logits: el repositorio solo contiene la model card y los resultados.
- La abliteration reduce drásticamente los rechazos ante peticiones dañinas (del 93 % al 1 % en inglés), lo que lo hace inadecuado para despliegues de producción sin salvaguardas externas.
- Las restricciones de system prompt se respetan menos: 77,5 % de declinaciones de peticiones fuera de tema frente al 95 % del original.
- Menos respuestas de "no lo sé": responde al 89 % de las preguntas de SimpleQA-Verified en lugar del 77 %, con menor precisión entre las respondidas (41,5 % frente a 47,1 %).
- Respuestas más largas: entre un 0,9 % y un 11,9 % más de tokens de salida, con impacto en coste y latencia.
- Posible degradación en tareas de agente: caída de 8 a 10 puntos en tau2-bench airline, atribuida a un debilitamiento de las negativas basadas en políticas.
- La licencia es "other" y hereda la del checkpoint base `zai-org/GLM-5.3`; deben revisarse las restricciones de uso comercial en el enlace de licencia.
- Idiomas limitados a inglés y chino; el rendimiento en otros idiomas no está evaluado.
- No se midieron HLE, StrongREJECT, SORRY-Bench ni un control de dirección aleatoria, por lo que la evaluación de seguridad es parcial.
- Riesgo de alucinación no cuantificado de forma específica; los datos de SimpleQA-Verified (36,8 %) sugieren una precisión factual moderada.

## Enlaces

- Hugging Face: https://huggingface.co/logitshq/GLM-5.3-Abliterated
- Resultados completos: https://logits.com/benchmarks/abliterated
- Documentación de modelos Logits: https://logits.com/docs#models
- Checkpoint base: https://huggingface.co/zai-org/GLM-5.3
- Commit del checkpoint base: https://huggingface.co/zai-org/GLM-5.3/tree/ba32f8c19c8738e2c57c71798c601d477a7bf844
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3
