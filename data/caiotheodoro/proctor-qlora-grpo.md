# caiotheodoro/proctor-qlora-grpo

## Resumen

Proctor QLoRA-GRPO (seed 11) es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct por el desarrollador caiotheodoro. No se trata de un modelo completo, sino de un adaptador PEFT (librería `peft`, pesos `safetensors`) que debe cargarse junto al modelo base o fusionarse con él. El repositorio tiene licencia Apache 2.0 y no registra descargas ni interacciones en el momento de redactar esta ficha.

El interés de esta publicación es metodológico y, de forma explícita, negativo: la propia model card indica que el adaptador no supera a una línea base de tipo "schema_only". Los cuatro seeds evaluados (11, 22, 33, 44) obtuvieron una pérdida de *enforce* en test de 2,86 con desviación estándar de 0,0, frente a 2,71 de la línea base, una diferencia de 0,14 que refuta la hipótesis H4 del experimento. Este repositorio conserva únicamente el seed 11; los otros tres checkpoints no se conservaron. El propio autor advierte de que la transferencia a registros reales de agentes no se ha medido y que el resultado es sintético y no validado en producción.

Por tanto, la ficha debe leerse como la de un artefacto de investigación reproducible (receta QLoRA + GRPO sobre un modelo de 1,5B) más que como un modelo listo para despliegue. Su utilidad principal es servir de referencia para reproducir el experimento, auditar la receta de entrenamiento y comparar contra la línea base de *prompting* estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct); no disponible el detalle de la arquitectura del adaptador más allá de LoRA de bajo rango |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen2.5-1.5B-Instruct tiene 1,5B parámetros, dato no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; determinada por el modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | Entrenamiento con QLoRA (cuantización de 4 bits del modelo base durante el ajuste). No se documentan cuantizaciones publicadas del adaptador ni pesos GGUF |
| Idiomas soportados | No disponible (la model card no declara idiomas; los idiomas serían los heredados del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Otros datos del repositorio: identificador `caiotheodoro/proctor-qlora-grpo`, librería `peft`, tamaño del repositorio 0,0 GB según HuggingFace, creado y actualizado el 2026-10-08 (7 segundos de diferencia), 0 descargas y 0 likes, etiquetas `lora`, `synthetic`, `region:us`.

## Arquitectura y entrenamiento

El adaptador sigue una receta QLoRA: el modelo base se cuantiza a 4 bits y se entrenan únicamente matrices de bajo rango con rango 8, alpha 16, dropout 0,05 y proyecciones objetivo `q_proj` y `v_proj`. El entrenamiento consta de una fase supervisada de 20 pasos seguida de una fase de optimización con GRPO (*Group Relative Policy Optimization*) de 10 pasos. GRPO es un algoritmo de aprendizaje por refuerzo que compara varias respuestas generadas para un mismo *prompt* y actualiza la política según sus recompensas relativas, sin necesidad de un modelo de valor independiente. La semilla 999 fue excluida del experimento.

El resultado declarado es un resultado negativo: con cuatro semillas (11, 22, 33, 44) la pérdida de *enforce* en test fue de 2,86 con desviación estándar 0,0, mientras que la línea base `schema_only` alcanzó 2,71. La diferencia de 0,14 implica que la hipótesis H4 no se sostiene. El autor indica además que este archivo es una repetición de la misma receta (`same-recipe rerun`) y que solo se sube cuando su pérdida de *enforce* en test coincide con la de la ejecución puntuada. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset sintético, ni si hubo fases adicionales de RLHF o DPO más allá del paso por GRPO.

## Capacidades

- Generación de texto e instrucciones: hereda las capacidades del modelo base Qwen2.5-1.5B-Instruct, aunque la información proporcionada no detalla una evaluación propia de estas capacidades para el adaptador.
- Cumplimiento de esquema y salida estructurada: el experimento gira en torno a una métrica de *enforce loss* y a una comparación contra una línea base denominada `schema_only`, lo que sitúa el objetivo del ajuste en el cumplimiento de restricciones de formato o esquema. No se especifica el formato exacto ni el conjunto de validación.
- Razonamiento multi-paso y agentes: la model card menciona "real agent logs", lo que sugiere un contexto de agentes, pero la transferencia a esos registros reales está explícitamente sin medir.
- *Tool calling* / *function calling*: no disponible.
- Modo *thinking*, visión o audio: no disponible.
- Capacidades multilingües: no disponibles en la ficha del adaptador; dependerían del modelo base.
- Capacidades especiales: no disponible.

## Casos de uso

- Reproducción de experimentos de RLHF ligero: el adaptador sirve para replicar la receta QLoRA (r=8, alpha=16, dropout 0,05, q_proj y v_proj) seguida de 10 pasos de GRPO sobre Qwen2.5-1.5B-Instruct. Es adecuado porque la model card documenta los hiperparámetros completos y el repositorio de código asociado, lo que permite verificar el resultado negativo reportado.
- Línea base en ablaciones de ajuste fino: un equipo que investigue métodos de aprendizaje por refuerzo para modelos pequeños puede usar este adaptador como punto de comparación negativo, ya que su pérdida de *enforce* en test (2,86) está documentada con desviación estándar 0,0 en cuatro semillas.
- Auditoría de protocolos de evaluación: la diferencia de 0,14 frente a `schema_only` (2,71) es un caso de estudio sobre cómo una mejora aparente debe contrastarse con una línea base trivial. Útil para diseñar controles en experimentos propios.
- Docencia y material formativo sobre PEFT: el repositorio es un ejemplo compacto de adaptador LoRA con etiqueta `synthetic`, útil para ilustrar el flujo `transformers` + `peft` + TRL en un modelo de 1,5B que cabe en una GPU de consumo.
- Investigación sobre cumplimiento de esquemas: si el proyecto Proctor se orienta a forzar salidas válidas frente a un esquema, este adaptador permite estudiar por qué la receta no mejora el *prompting* estructurado, un problema recurrente en aplicaciones de agentes.
- Verificación de trazabilidad de publicaciones: al conservar solo el seed 11 y descartar los otros tres checkpoints, el repositorio ilustra un caso práctico de publicación parcial de artefactos y de los problemas de reproducibilidad asociados.
- Prototipado en entornos sin GPU de gama alta: dado el tamaño del modelo base, el adaptador puede cargarse en equipos modestos para experimentar con la fusión de LoRA, aunque su rendimiento en tareas reales no está validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo documentado es la pérdida de *enforce* en test del experimento:

| Modelo o condicion | Enforce loss en test | Desviacion estandar | Semillas |
|---|---|---|---|
| Proctor QLoRA-GRPO | 2,86 | 0,0 | 11, 22, 33, 44 |
| Baseline schema_only | 2,71 | No disponible | No disponible |
| Diferencia (gap) | 0,14 | No disponible | No disponible |

El autor concluye que la hipótesis H4 no se cumple porque el adaptador no supera a la línea base. No se proporcionan métricas de latencia, throughput, exactitud en tareas generativas ni resultados de transferencia a registros reales de agentes.

## Requisitos de hardware

- Naturaleza del artefacto: es un adaptador LoRA, no un modelo completo, por lo que requiere Qwen2.5-1.5B-Instruct como base. El repositorio reporta 0,0 GB de tamaño, coherente con unos pocos megabytes de pesos de adaptador, aunque conviene verificar que los ficheros `safetensors` están efectivamente presentes antes de descargar.
- VRAM estimada para inferencia con el modelo base fusionado en fp16: aproximadamente 3 GB solo de pesos, más caché KV. En cuantización de 8 bits, del orden de 1,5 a 2 GB; en 4 bits, alrededor de 1 GB. Son estimaciones de orden de magnitud, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM debería poder ejecutar el modelo base fusionado en cuantización de 4 u 8 bits. Una RTX 3060, RTX 4060 o superior es suficiente; una RTX 4090, A100 o H100 no aportan ventaja relevante para 1,5B parámetros salvo por mayor throughput en lotes grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo recientes con al menos 6 GB de VRAM, siempre que se use cuantización.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador con `PeftModel`), fusión con `merge_and_unload` y posterior servicio con vLLM o TGI; conversión a GGUF para llama.cpp u Ollama; también es viable la ejecución en CPU con llama.cpp para pruebas funcionales. Para el adaptador sin fusionar, es necesario un servidor compatible con LoRA dinámico (por ejemplo vLLM con soporte de adaptadores).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros adaptadores comparables publicados dentro del mismo proyecto ni evaluados con la misma métrica de *enforce loss*. La comparación se limita, por tanto, a las variantes documentadas en la propia model card:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Proctor QLoRA-GRPO (seed 11) | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct | No disponible (base de 1,5B) | No disponible | apache-2.0 | Enforce loss en test 2,86 (sd 0,0) |
| Baseline schema_only | Estrategia de prompting estructurado, no un modelo | No aplica | No disponible | No disponible | Enforce loss en test 2,71 |
| Qwen2.5-1.5B-Instruct | Modelo base completo | 1,5B (dato no confirmado en la información proporcionada) | No disponible | No disponible en la información proporcionada | No evaluado en este experimento |

Otras alternativas de la misma categoría (adaptadores LoRA de pequeño tamaño sobre modelos de 1 a 2B, u otros modelos instructivos de esa franja) no aparecen en la información disponible, por lo que no se incluyen cifras comparativas que no puedan sostenerse con los datos proporcionados.

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: el adaptador no supera a la línea base `schema_only` (2,86 frente a 2,71). No debe presentarse como una mejora de rendimiento.
- Sin validación en producción: la model card indica explícitamente "Synthetic, not production-validated". El conjunto de datos es sintético.
- Transferencia sin medir: el propio autor señala que la transferencia a registros reales de agentes ("real agent logs") no se ha medido, por lo que se desconoce el comportamiento fuera del dominio sintético.
- Publicación parcial: solo se conserva el checkpoint del seed 11; los seeds 22, 33 y 44 se descartaron. La reproducibilidad completa del experimento no es posible con los artefactos publicados.
- Posible ausencia de pesos: el tamaño del repositorio figura como 0,0 GB, lo que puede indicar que los ficheros del adaptador no están presentes o no se contabilizan. Verificar antes de asumir que el adaptador es descargable.
- Riesgo de alucinación: no evaluado en la información proporcionada; al ser un modelo de 1,5B, la tasa de alucinación esperable es mayor que la de modelos de mayor tamaño, pero no hay medición publicada.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgos ni de seguridad.
- Limitaciones de idioma: no disponibles. La ficha no declara idiomas soportados para el adaptador.
- Restricciones de licencia: el adaptador se publica bajo Apache 2.0, lo que permite uso comercial del artefacto, pero el uso comercial está condicionado por la licencia del modelo base Qwen2.5-1.5B-Instruct, que no se detalla en la información proporcionada y debe comprobarse por separado.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni métricas de latencia que permitan estimar su comportamiento en producción.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/caiotheodoro/proctor-qlora-grpo
- Código del proyecto Proctor (versión v0.1.0): https://github.com/caiotheodoro/proctor/tree/v0.1.0
- Perfil de modelos del autor en HuggingFace: https://huggingface.co/caiotheodoro/models
- Perfil del autor en GitHub: https://github.com/caiotheodoro
- Notebook de referencia GRPO + QLoRA de HuggingFace TRL: https://colab.research.google.com/github/huggingface/trl/blob/main/examples/grpo_qlora/grpo_qlora.ipynb
- Guía sobre ajuste fino con LoRA, QLoRA, DPO y GRPO: https://futureagi.com/blog/llm-fine-tuning-guide-2025/
- Guía práctica de LoRA y QLoRA: https://www.kunalganglani.com/blog/fine-tune-open-source-llm-lora-qlora
- Modelo base Qwen2.5-1.5B-Instruct (referenciado, no enlazado en la información proporcionada): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
