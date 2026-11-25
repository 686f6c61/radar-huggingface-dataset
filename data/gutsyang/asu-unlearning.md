# gutsyang/asu-unlearning

## Resumen

`gutsyang/asu-unlearning` es un checkpoint de Llama-2-7B-chat obtenido tras aplicar una técnica de *machine unlearning* denominada ASU+GD sobre el modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino del Llama-2-7B-chat original sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo del modelo no es la generación de texto de propósito general, sino servir como artefacto de investigación para estudiar la eliminación selectiva de conocimiento: se busca que el modelo «olvide» la información de un subconjunto concreto de autores ficticios (split `forget05`, tarea 1) sin degradar su utilidad general.

El modelo conserva la arquitectura transformer decoder-only de Llama-2-7B, con 6.738.415.616 parámetros totales y pesos en `bfloat16` distribuidos en tres shards de safetensors. Es relevante en el contexto de la investigación en privacidad y cumplimiento normativo (derecho al olvido, RGPD), donde se necesitan metodologías reproducibles para eliminar datos de entrenamiento de modelos ya entrenados y medir cuantitativamente la eficacia de ese borrado.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y en la model card del autor; no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni detalles ampliados sobre el corpus de entrenamiento más allá de TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7B-chat) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7B-chat: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (3 shards, `torch_dtype` bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7B-chat: un transformer decoder-only denso con atención multi-cabeza, normalización RMSNorm y activación SwiGLU, sin mecanismos de atención lineal ni mezcla de expertos. Sobre esta base, `locuslab/tofu_ft_llama2-7b` aplica un ajuste fino supervisado con el dataset TOFU, compuesto por preguntas y respuestas sobre 200 autores ficticios, diseñado específicamente para evaluar técnicas de *unlearning*. El checkpoint aquí descrito aplica después el método ASU+GD sobre el split `forget05` (tarea 1), que define el subconjunto de autores a «olvidar».

Los hiperparámetros documentados en la model card son: semilla 1001, 5 épocas, tasa de aprendizaje 1e-5, `forget_coeff` 0.1, `regularization_coeff` 1.0, `attention_temp` 2.3, `beta` 0.1, `fix_ref_model` activado y `mask` activado. No se especifica el número total de tokens vistos durante el proceso de unlearning ni la composición exacta del corpus más allá de TOFU. Tampoco se documenta el uso de RLHF o DPO en esta etapa; el proceso es un ajuste fino con una función de pérdida específica de unlearning (ASU+GD). El autor aclara que este es el checkpoint canónico de ASU+GD y no el piloto `dard_oneside` ASU+GD+Cap.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma del dataset TOFU), con las capacidades heredadas de Llama-2-7B-chat.
- Razonamiento conversacional multi-turno, al estar basado en la variante chat.
- Capacidad de *tool calling* / *function calling*: no documentada en la información disponible; no se garantiza.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está orientado a evaluación de unlearning, no a despliegue agéntico.
- Capacidades multilingües: no documentadas; el ajuste fino sobre TOFU es monolingüe en inglés.
- Capacidad especial: el modelo implementa un «modo de olvido» sobre el split `forget05`, medido mediante métricas de Forget Efficacy (0.774) y Forget Probability (0.202).

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint de referencia para reproducir y comparar métodos de borrado selectivo sobre TOFU, usando las métricas reportadas (Forget Efficacy, Model Utility, Retain ROUGE) como línea base.
- Evaluación de cumplimiento del derecho al olvido: permite estudiar empíricamente si un modelo puede eliminar información personal concreta sin perder utilidad general, un requisito del RGPD en la UE.
- Auditoría de privacidad de modelos: analizar la resistencia del conocimiento a ser eliminado y la fuga residual mediante ataques de extracción, comparando el modelo unlearned con el base.
- Desarrollo de metodologías de *red-teaming*: medir la probabilidad de que el modelo aún genere contenido del split olvidado (Forget Probability 0.202) para calibrar umbrales de aceptación.
- Benchmarking de técnicas de unlearning: usar este checkpoint como baseline ASU+GD frente a otros métodos (p. ej. NPO, RMU) sobre el mismo split y dataset.
- Estudio de degradación de utilidad: cuantificar el coste en Model Utility (0.740) y Retain ROUGE (0.720) que impone el proceso de olvido, informando decisiones de despliegue en producción.
- Reproducibilidad académica: servir de artefacto versionado para replicar experimentos de papers de unlearning que citan ASU+GD sobre TOFU.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de evaluación del propio proceso de unlearning sobre TOFU, no benchmarks estándar de capacidad general.

| Metrica (TOFU, forget05, task 1) | Valor reportado |
|---|---|
| Forget Efficacy | 0.774 |
| Model Utility | 0.740 |
| Forget Probability | 0.202 |
| Retain ROUGE | 0.720 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 16-24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos; en 4 bits: en torno a 4-5 GB (no se publican variantes cuantizadas oficiales, pero el modelo es compatible con cuantización estándar de transformers/bitsandbytes).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en bfloat16 sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bfloat16, y en GPUs de 8-12 GB si se aplica cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama previa conversión a GGUF (no publicada oficialmente).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gutsyang/asu-unlearning | 6.738 M | no disponible (heredado 4.096) | Unlearning ASU+GD sobre TOFU | llama2 | Hugging Face |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | 4.096 | Fine-tune TOFU (modelo base) | llama2 | Hugging Face |
| locuslab/tofu_llama2-7b | ~6.738 M | 4.096 | Llama-2-7B-chat sin fine-tune TOFU (referencia) | llama2 | Hugging Face |
| Meta Llama-2-7B-chat | 6.738 M | 4.096 | Chat de propósito general | llama2 | Hugging Face / Meta |

La comparación relevante es frente a los checkpoints de la familia TOFU de locuslab, ya que comparten arquitectura y dataset y permiten aislar el efecto del unlearning. No se dispone de datos de rendimiento comparables en benchmarks estándar para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para investigación en unlearning; no es un modelo de propósito general y su utilidad conversacional puede estar degradada respecto al Llama-2-7B-chat original.
- Forget Probability de 0.202 indica que existe una probabilidad no trivial de que el modelo aún genere contenido del split olvidado; no garantiza un borrado completo.
- Model Utility de 0.740 y Retain ROUGE de 0.720 reflejan una pérdida de rendimiento respecto al modelo base, que debe tenerse en cuenta en cualquier uso downstream.
- Sesgos conocidos: hereda los sesgos de Llama-2-7B-chat y del corpus TOFU; no se documentan evaluaciones específicas de sesgo.
- Riesgo de alucinación: presente como en cualquier modelo de la familia Llama-2; no se han publicado evaluaciones de factualidad.
- Limitaciones de idioma: el ajuste fino TOFU es en inglés; el soporte multilingüe no está documentado.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial, umbrales de usuarios mensuales y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- El modelo no debe usarse para intentar recuperar información personal real; TOFU emplea autores ficticios, pero el método podría aplicarse a datos reales con implicaciones éticas y legales.
- No se publican variantes cuantizadas oficiales ni garantías de compatibilidad con todos los runtimes de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutsyang/asu-unlearning
- Modelo base (fine-tune TOFU): https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (Task of Fictitious Unlearning): https://arxiv.org/abs/2401.06121
- Llama 2 (Meta): https://ai.meta.com/llama/
- Licencia Llama 2: https://ai.meta.com/llama/license/
