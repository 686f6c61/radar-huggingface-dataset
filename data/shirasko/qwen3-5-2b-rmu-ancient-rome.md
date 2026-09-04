# shirasko/qwen3.5-2b-rmu-ancient-rome

## Resumen

Este checkpoint, creado por el usuario shirasko, es el resultado de aplicar una técnica de desaprendizaje (unlearning) sobre el modelo base Qwen/Qwen3.5-2B. El objetivo concreto es eliminar el conocimiento sobre la Roma Antigua del modelo, utilizando el método RMU (Representation Misdirection for Unlearning). El modelo se ofrece como un conjunto de pesos completos en formato safetensors, con 1.881.825.088 parámetros, y está orientado a la investigación en la eliminación selectiva de conceptos en modelos de lenguaje.

La relevancia de este modelo radica en que sirve como referencia para evaluar técnicas de unlearning, un campo emergente en la seguridad y el cumplimiento normativo de los sistemas de IA. El checkpoint se presenta con métricas de evaluación detalladas que comparan el rendimiento antes y después del desaprendizaje, incluyendo una puntuación de eficacia (efficacy) de 0,492 en test y una especificidad (specificity) de 0,879. No se proporciona información sobre la arquitectura, la longitud de contexto o la licencia, por lo que estas especificaciones deben consultarse en la documentación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen/Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No disponible (sin evidencia de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos completos en safetensors) |
| Idiomas soportados | Inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se deriva del modelo Qwen/Qwen3.5-2B, un modelo de lenguaje de la serie Qwen3.5 de Alibaba Cloud. Aunque la información del autor no detalla la arquitectura interna, por su naturaleza se trata de un modelo basado en transformer (decoder-only) con 1,88 mil millones de parámetros. El entrenamiento de desaprendizaje se realizó mediante el método RMU, que modifica las representaciones internas en las capas 5, 6 y 7 (`layer_ids`), con un `alpha` de 100, un `steering` de 1000 y una tasa de aprendizaje de 0,0001, según la configuración publicada. El proceso no incluye RLHF ni DPO; es únicamente un ajuste selectivo de pesos para inducir el olvido de un concepto. La evaluación se llevó a cabo con un protocolo de opción múltiple (MC) sobre el concepto objetivo.

## Capacidades

- Generación de texto y conversación en inglés, heredadas del modelo base Qwen3.5-2B.
- Razonamiento general y conocimiento factual parcialmente preservado: la precisión en MMLU en test es de 0,568, ligeramente inferior a la línea base (0,588).
- Desaprendizaje del concepto "Ancient Rome": la precisión en preguntas sobre Roma Antigua (QA accuracy) cae de 0,86 en test a 0,56 tras el desaprendizaje, lo que refleja una reducción significativa pero no total del conocimiento.
- No se documenta soporte para tool calling, function calling, agentes, visión ni audio en la información disponible.
- El modelo incorpora el comportamiento esperado de un checkpoint RMU: intenta desviar las representaciones asociadas al concepto objetivo, lo que puede manifestarse en respuestas evasivas o incorrectas sobre Roma Antigua.

## Casos de uso

- Investigación en desaprendizaje de modelos: usar el checkpoint como ejemplo práctico de RMU para comparar con otras técnicas (DPO, fine-tuning selectivo, etc.) en la eliminación de conceptos.
- Evaluación de robustez de unlearning: analizar si el modelo vuelve a generar conocimiento sobre Roma Antigua cuando se le presenta con contexto o prompts adversariales.
- Estudio de alucinaciones post-unlearning: comprobar si el modelo produce información falsa o inventada sobre el tema olvidado, ya que la eficacia en test es solo de 0,492.
- Cumplimiento normativo experimental: probar el uso de modelos que olvidan datos históricos o sensibles en entornos de investigación, antes de aplicar técnicas similares a modelos de producción.
- Benchmarks de re-aprendizaje: dado que el relearning QA (MC) es de 0,72, el modelo puede servir para estudiar cómo el conocimiento se puede reintroducir mediante fine-tuning posterior.
- Prototipos de chatbots que evitan un tema específico: si se necesita un asistente que no hable sobre Roma Antigua, este checkpoint puede servir como base para un prototipo restringido, aunque su rendimiento en otras áreas es inferior al del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de la comunidad (MT-Bench, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona las siguientes métricas de evaluación del proceso de desaprendizaje:

| Métrica | Test (después de unlearning) |
|---|---|
| Eficacia (efficacy) | 0,492 |
| Especificidad (specificity) | 0,879 |
| Media armónica (harmonic mean) | 0,631 |
| Relearning QA (MC) | 0,72 |

La comparativa entre el modelo base y el checkpoint tras el desaprendizaje, en el conjunto de test, es la siguiente:

| Métrica | Baseline (test) | Tras unlearning (test) |
|---|---|---|
| QA accuracy | 0,86 | 0,56 |
| QA fraction | 1 | 0,508 |
| SimDom accuracy | 0,82 | 0,72 |
| SimDom fraction | 1 | 0,825 |
| MMLU accuracy | 0,588 | 0,568 |
| MMLU fraction | 1 | 0,941 |

## Requisitos de hardware

- El modelo tiene ~1,88 mil millones de parámetros. En formato FP16, los pesos ocupan aproximadamente 3,8 GB, por lo que se necesita una GPU con un mínimo de 6-8 GB de VRAM para inferencia sin cuantización.
- Con cuantización a 4 bits (por ejemplo, mediante GGUF), el modelo podría ocupar alrededor de 1,2 GB, siendo viable en tarjetas consumer de 4 GB, aunque esta cuantización no está disponible en el repositorio original y requeriría conversión.
- GPU recomendadas: NVIDIA RTX 3060 12GB, RTX 4090, A100 o H100. Es un modelo ligero que se ejecuta eficientemente en una sola GPU.
- Opciones de despliegue: el repositorio indica compatibilidad con la librería Transformers; se puede usar con vLLM, TGI o llama.cpp (previa conversión) para servir el modelo.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen3.5-2B (base) | ~2 B | no disponible | no disponible | Conversación, instrucciones |
| shirasko/qwen3.5-2b-rmu-ancient-rome | 1.881.825.088 | no disponible | no disponible | Desaprendizaje de Ancient Rome |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada; la comparativa se limita al modelo base del que deriva. Frente al base, este checkpoint mantiene un rendimiento próximo en MMLU (0,568 vs 0,588) pero reduce deliberadamente la precisión en preguntas sobre Roma Antigua.

## Limitaciones y advertencias

- Eficacia limitada: la puntuación de eficacia en test (0,492) indica que el modelo todavía retiene o puede generar parte del conocimiento sobre Roma Antigua; no hay garantía de un olvido completo.
- Re-aprendibilidad: el relearning QA de 0,72 sugiere que el concepto puede ser reaprendido fácilmente con un fine-tuning posterior, por lo que el unlearning no es irreversible.
- Riesgo de alucinación en el tema olvidado: al carecer de conocimiento fiable sobre Roma Antigua, el modelo puede inventar respuestas en lugar de indicar su falta de información.
- Solo soporta inglés: cualquier uso en otros idiomas requeriría una adaptación o traducción no contemplada en este checkpoint.
- Licencia no disponible: la ausencia de una licencia explícita impide determinar si el modelo puede usarse comercialmente, lo que limita su despliegue en producción.
- Modelo de investigación: no se han publicado evaluaciones exhaustivas de capacidades generales (tool calling, razonamiento complejo, matemáticas, etc.), por lo que su comportamiento fuera de las métricas de unlearning es incierto.
- Dependencia del modelo base: el rendimiento general depende de Qwen/Qwen3.5-2B, que a su vez no ha sido verificado en este contexto.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/shirasko/qwen3.5-2b-rmu-ancient-rome
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Referencia de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
