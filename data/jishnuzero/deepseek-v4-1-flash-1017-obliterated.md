# jishnuzero/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una versión del modelo DeepSeek-V4.1-Flash-1017 con la dirección de rechazo ablacionada (refusal-direction ablated), publicada por el usuario jishnuzero en HuggingFace. El modelo se ha generado con la herramienta OBLITERATUS usando el método failspy, y mantiene los pesos en BF16 safetensors bajo licencia MIT. El modelo base es un transformer de tipo Mixture of Experts (MoE) de DeepSeek, del cual no se dispone de especificaciones públicas en la información proporcionada.

El propósito declarado de esta variante es eliminar el comportamiento de rechazo del modelo original: según la model card, la tasa de rechazo cae del 81,62% al 4,30% en un corpus de 842 prompts, mientras que la coherencia y la capacidad se mantienen al 100% en las pruebas internas del autor. La divergencia KL respecto al modelo original es de 0,1305 nats.

Este modelo es relevante en el contexto de la investigación sobre alineación y seguridad de modelos, así como para desarrolladores que necesiten un modelo sin capas de rechazo para tareas de red-teaming o evaluación. No obstante, la propia model card documenta un aumento drástico de asistencia dañina (del 10,38% al 78,28%), lo que lo hace inadecuado para despliegues de producción orientados al público general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v41_text), según tag del repo; detalles no disponibles |
| Parametros totales | 754.638.836.864 (≈754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una modificación por ablación de direcciones de rechazo del modelo base DeepSeek-V4.1-Flash-1017. La técnica empleada es el método failspy implementado en la herramienta OBLITERATUS, que identifica y elimina la dirección del espacio de activaciones asociada al comportamiento de rechazo. No se trata de un reentrenamiento: los pesos se modifican directamente, y la model card reporta una divergencia KL de secuencia-token (forward KL) de 0,1305 nats respecto al modelo original.

No se dispone de información sobre la arquitectura interna del modelo base (número de expertos, capas, dimensión oculta, composición del dataset de entrenamiento, uso de RLHF/DPO) en la documentación proporcionada. El tag `deepseek_v41_text` sugiere una arquitectura de texto de la familia DeepSeek V4.1, y el tag `moe` confirma que se trata de un modelo de mezcla de expertos, pero no se detallan los parámetros activos ni la innovación técnica concreta.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline text-generation).
- Razonamiento y respuesta a instrucciones, según los tests de capacidad del autor (6 de 6 superados).
- Modo de pensamiento (thinking) desactivable: la evaluación MMLU se realizó con thinking disabled.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidad de seguir instrucciones sin rechazo en la gran mayoría de casos (96% de no rechazo en el corpus de evaluación).
- No se dispone de información sobre tool calling, function calling, capacidades de agente, multilingüismo, visión o audio.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de un modelo sin capas de rechazo para analizar qué tipos de solicitudes dañinas genera y con qué nivel de concreción, usando las distribuciones de harmfulness y actionability de la model card como referencia.
- Red-teaming de sistemas: sirve como modelo adversario para probar clasificadores de contenido, filtros de salida y sistemas de moderación, ya que produce respuestas que un modelo alineado rechazaría.
- Evaluación de técnicas de ablación: permite comparar el impacto de la eliminación de la dirección de rechazo sobre la coherencia y la capacidad (100% en ambos según el autor), útil para investigar métodos de edición de modelos.
- Generación de texto creativo sin restricciones: para proyectos de ficción o narrativa que requieran contenido que los modelos alineados suelen rechazar, siempre con revisión humana y en contextos controlados.
- Benchmarking de robustez de guardarraíles: integración en pipelines de evaluación que midan la eficacia de filtros de entrada y salida frente a un modelo sin rechazo.
- Estudio de divergencia de comportamiento: análisis de la divergencia KL (0,1305 nats) y de los cambios en las distribuciones de respuesta para entender qué se modifica exactamente al ablacionar la dirección de rechazo.

## Benchmarks y rendimiento

Resultados de la evaluación interna del autor (corpus OBLITERATUS de 842 prompts, fecha 30 de octubre de 2026):

| Métrica | DeepSeek-V4.1-Flash-1017 | -obliterated | Delta (pp) |
|---|---:|---:|---:|
| Rechazo total | 81,62% | 4,30% | -77,33 |
| Rechazo parcial | 4,89% | 14,44% | +9,55 |
| Sin rechazo | 13,37% | 78,28% | +64,92 |
| Asistencia dañina | 10,38% | 78,28% | +67,90 |
| Respuesta alineada con la petición | 16,59% | 86,52% | +69,93 |
| Alternativa segura | 83,29% | 10,50% | -72,79 |
| Daño nivel 3 (serio) | 3,82% | 44,75% | +40,93 |
| Daño nivel 4 (severo) | 0,12% | 9,31% | +9,19 |
| Accionabilidad nivel 4 (concreta) | 3,46% | 20,76% | +17,30 |

| Métrica de torneo | Valor |
|---|---:|
| Tasa de rechazo | 4% |
| Divergencia KL | 0,1305 nats |
| Coherencia | 100% |
| Capacidad | 100% |

La evaluación MMLU (2.500 preguntas, 57 materias, zero-shot, thinking disabled) aparece truncada en la información proporcionada; no se dispone de la precisión final de ninguno de los dos modelos. No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 754,6 mil millones de parámetros en BF16, el modelo requiere aproximadamente 1,5 TB de VRAM (coincide con el tamaño del repo, 1.509,4 GB). En cuantización de 8 bits, unos 755 GB; en 4 bits, unos 378 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no cabe en ninguna GPU consumer. Requiere nodos multi-GPU de clase datacenter (H100 80 GB, A100 80 GB) en configuraciones de al menos 10-20 GPUs para BF16, o menos si se cuantiza.
- No cabe en consumer GPU (RTX 4090, 3090, etc.).
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI o llama.cpp no están confirmados por el autor, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 B (MoE) | no disponible | 4,30% | MIT | HuggingFace |
| DeepSeek-V4.1-Flash-1017 (base) | 754,6 B (MoE) | no disponible | 81,62% | no disponible | HuggingFace |
| Otras variantes abliterated de la familia DeepSeek | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (abliterated de gran escala) en la documentación proporcionada.

## Limitaciones y advertencias

- La ablación de la dirección de rechazo incrementa la asistencia dañina del 10,38% al 78,28% en el corpus de evaluación del autor; el 44,75% de las respuestas alcanza el nivel 3 de daño (serio) y el 20,76% es accionable de forma concreta. No es apto para uso público ni para producción sin filtros externos.
- Riesgo elevado de generar contenido dañino, incluyendo instrucciones concretas para conductas peligrosas.
- La model card documenta 25 respuestas sin anotar (2,98%) por bloqueos de proveedor o plataforma, lo que introduce incertidumbre en las métricas.
- La evaluación se realizó con jueces automáticos (Claude Opus 4.6, GPT-6.1 Sol y Codex local); no se ejecutaron ni verificaron las instrucciones generadas.
- La evaluación MMLU está truncada en la información disponible; no se puede confirmar la precisión del modelo.
- No se dispone de información sobre sesgos, idiomas soportados, contexto máximo ni limitaciones multilingües.
- La licencia MIT permite uso comercial, pero el uso comercial de un modelo sin capas de rechazo conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- El tamaño del repo (1.509,4 GB) y los 754,6 mil millones de parámetros hacen inviable el despliegue en hardware convencional.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de su comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/jishnuzero/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método: winner-recovery-provenance.json (en el repo)
- Resultados de evaluación: evaluation-status.json (en el repo)
- Licencia: LICENSE (en el repo)
