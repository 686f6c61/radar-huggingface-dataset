# jvonrad/OLMo-2-7B-CPT-DCO-10k

## Resumen

OLMo-2-7B-CPT-DCO-10k es un adaptador LoRA (r=128, alpha=256) desarrollado por Jonathan von Rad sobre el modelo base `jvonrad/olmo-2-7b-finetranslations`, que a su vez es un fine-tuning del modelo OLMo-2-7B de AI2. El adaptador se entrena con un objetivo de aprendizaje por refuerzo orientado a la consistencia (Consistency-Driven Reinforcement Learning, DCO) sobre un conjunto de 10.000 hechos multilingües del dataset `PolyFact-Clean`. El objetivo es mejorar la recuperación de conocimiento factual de forma consistente a través de 12 idiomas, un problema relevante para aplicaciones multilingües donde las respuestas deben ser fiables independientemente del idioma de la pregunta.

El modelo se publica como parte de un estudio controlado que compara DCO con otros métodos (SFT, CM-Align, GRPO) bajo las mismas condiciones de datos y lenguas. Aunque el adaptador es ligero (1,3 GB en el repositorio), requiere cargar el modelo base completo para su uso. Los resultados de evaluación muestran mejoras modestas en precisión factual y consistencia cross-lingual respecto al modelo base, aunque la consistencia total (responder correctamente en los 12 idiomas) sigue siendo baja, lo que indica que el problema está lejos de resolverse.

La licencia Apache 2.0 y el formato de pesos safetensors facilitan su integración en entornos de investigación y desarrollo, aunque su carácter experimental lo hace más adecuado para estudios académicos que para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OLMo-2-7B (transformador causal) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene ~7B) |
| Parametros activos | No aplica (adaptador) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 128 y alpha 256, aplicado sobre `jvonrad/olmo-2-7b-finetranslations`, un checkpoint de OLMo-2-7B fine-tuneado con traducciones para mejorar su capacidad multilingüe. El entrenamiento del adaptador utiliza DCO (Consistency-Driven RL), un método de aprendizaje por refuerzo que premia la coherencia de las respuestas factuales a través de los 12 idiomas objetivo. El dataset de entrenamiento es `PolyFact-Clean`, que contiene 10.000 hechos curados y distribuidos uniformemente entre los idiomas. El proceso se describe en el paper *Improving Cross-Lingual Factual Recall via Consistency-Driven Reinforcement Learning* (arXiv:2606.06586).

La innovación principal reside en el objetivo de consistencia: en lugar de optimizar únicamente la exactitud por idioma, DCO penaliza las respuestas que difieren entre idiomas para un mismo hecho, fomentando una representación interna más alineada. El modelo se evalúa con prompts de libro cerrado (`Question: {q}\nAnswer:`) y scoring por log-verosimilitud normalizada.

## Capacidades

- Generación de texto en 12 idiomas (inglés, alemán, español, francés, portugués, indonesio, ruso, chino, árabe, japonés, suajili y bengalí).
- Recuperación de hechos factuales con mayor consistencia cross-lingual que el modelo base, según las métricas PolyFact y TotCons.
- Mejora en tareas de razonamiento multilingüe de conocimiento general (BMLAMA-53, G-MMLU-Lite).
- Capacidad de adaptación a otros idiomas mediante el fine-tuning previo con traducciones.
- No se especifican capacidades de tool calling, agentes o visión; el modelo es puramente textual.

## Casos de uso

- Investigación en consistencia cross-lingual: permite estudiar cómo el aprendizaje por refuerzo puede alinear representaciones factuales entre idiomas, útil para grupos que trabajan en multilingüismo y alucinación.
- Evaluación comparativa de métodos de post-entrenamiento: al ser un brazo de un estudio controlado, sirve como referencia para comparar DCO con SFT, CM-Align o GRPO bajo los mismos datos.
- Sistemas de QA multilingüe en entornos académicos: puede integrarse en prototipos que requieran responder preguntas factuales en varios idiomas con una coherencia mínima.
- Fine-tuning posterior: el adaptador puede usarse como punto de partida para tareas específicas, aprovechando la mejora en representación multilingüe.
- Análisis de sesgos y robustez: su evaluación detallada (KLAR, RankC) permite estudiar el comportamiento en idiomas vistos y no vistos durante el entrenamiento.
- Docencia y divulgación: como ejemplo de aplicación de RL a modelos de lenguaje multilingües, con código de evaluación disponible en el repositorio.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos entre el modelo base y este adaptador. Los datos son los siguientes:

| Modelo | PolyFact | TotCons | RankC | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (`jvonrad/olmo-2-7b-finetranslations`) | 44.37 | 2.80 | 58.56 | 17.49 | 42.75 | 17.02 | 8.32 |
| **OLMo-2-7B-CPT-DCO-10k** | 45.94 | 8.14 | 64.11 | 20.70 | 44.86 | 17.46 | 7.64 |

Las métricas se definen como: PolyFact (precisión en el split de test de PolyFact-Clean, 2.039 hechos), TotCons (fracción de hechos respondidos correctamente en los 12 idiomas), RankC@4 (con suelo 9.02 y azar 37.68), BMLAMA-53 (precisión en benchmark multilingüe de conocimiento), G-MMLU-Lite (versión reducida de MMLU multilingüe), y KLAR (generación libre sobre 17 idiomas, separados en 7 vistos y 10 no vistos). El adaptador mejora en casi todas las métricas, excepto en KLAR held-out, donde desciende ligeramente.

## Requisitos de hardware

- Al ser un adaptador LoRA, no requiere VRAM adicional significativa más allá del modelo base. El modelo base `jvonrad/olmo-2-7b-finetranslations` es un modelo de 7B parámetros en bfloat16, que ocupa aproximadamente 14-16 GB en memoria.
- Para inferencia en GPU consumer, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, RTX 4080) si se usa el modelo completo en bfloat16. Con cuantización (no proporcionada) podría reducirse, pero no hay datos oficiales.
- En entornos de producción, se puede servir con vLLM o TGI, aunque el adaptador debe cargarse junto con el modelo base mediante PEFT.
- La latencia y throughput dependen del hardware; no se han publicado cifras específicas para este adaptador.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores comparables en la información proporcionada. La propia model card menciona que el estudio incluye brazos con SFT, CM-Align y GRPO, pero no se publican sus resultados en esta ficha. La única comparación directa es con el modelo base, que se muestra en la tabla de benchmarks. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `jvonrad/olmo-2-7b-finetranslations` (base) | ~7B | No disponible | Apache 2.0 | HuggingFace |
| **OLMo-2-7B-CPT-DCO-10k** (adaptador) | Adaptador LoRA | No disponible | Apache 2.0 | HuggingFace |

No se conocen modelos de la misma categoría (adaptadores LoRA multilingües con DCO) con datos públicos comparables.

## Limitaciones y advertencias

- El modelo es un adaptador experimental, no un modelo completo. Requiere cargar el modelo base y no funciona de forma independiente.
- La consistencia total (TotCons) es solo del 8.14%, lo que indica que la mayoría de los hechos no se responden correctamente en todos los idiomas. El problema de alineación cross-lingual sigue siendo un desafío abierto.
- El rendimiento en idiomas no vistos durante el entrenamiento (KLAR held-out) es bajo (7.64%) y ligeramente inferior al modelo base, lo que sugiere que el adaptador no generaliza bien a lenguas fuera de las 12 entrenadas.
- No se han evaluado sesgos sociales o culturales; al ser un modelo entrenado sobre hechos curados, puede heredar sesgos de las fuentes originales de OLMo-2-7B.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para producción y carece de garantías de seguridad o robustez.
- No se proporcionan instrucciones de cuantización ni soporte para formatos como GGUF u ONNX; el despliegue se limita al ecosistema Transformers/PEFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jvonrad/OLMo-2-7B-CPT-DCO-10k
- Modelo base: https://huggingface.co/jvonrad/olmo-2-7b-finetranslations
- Dataset PolyFact-Clean: https://huggingface.co/datasets/jvonrad/PolyFact-Clean
- Paper (arXiv): https://arxiv.org/abs/2606.06586
- Repositorio OLMo (AI2): https://github.com/allenai/OLMo
- Perfil del autor: https://huggingface.co/jvonrad
