# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch13

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch13` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el usuario g-assismoraes en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para evaluar técnicas de *machine unlearning*: la capacidad de eliminar selectivamente información de un modelo entrenado sin degradar el resto de sus capacidades.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset sintético TOFU (biografías ficticias de autores), y aplica una intervención concreta: reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base. El objetivo declarado es el "olvido" del subconjunto `forget10` (el 10 % de los datos de TOFU) mediante una pérdida combinada de tipo token-IHL sobre el conjunto a olvidar más entropía cruzada sobre el conjunto a retener, tras 13 épocas de un total de 20.

Es relevante únicamente en el contexto de investigación sobre desaprendizaje, privacidad y control de conocimiento en LLMs. No es un modelo pensado para despliegue en producción ni para uso general: su interés radica en servir como punto de comparación en experimentos de unlearning y en el análisis de hasta qué punto una intervención quirúrgica sobre embeddings y cabeza de salida afecta al comportamiento del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 2, típicamente 4.096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; admite cuantización estándar a 8/4 bits vía herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). Sobre esa base, el autor aplica un procedimiento de *unlearning* en dos fases. Primero, reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer de `locuslab/tofu_ft_llama2-7b`. Después, entrena con una función de pérdida que combina un término token-IHL sobre el conjunto `forget10` con una entropía cruzada ponderada (peso 1.0) sobre el conjunto `retain`, durante 13 épocas de un total de 20.

No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición completa del dataset TOFU utilizado ni si hubo etapas adicionales de alineación (RLHF/DPO) en este checkpoint concreto. El dataset TOFU en sí es sintético y consiste en pares pregunta-respuesta sobre biografías ficticias de autores, diseñado específicamente para medir olvido selectivo. El nombre del checkpoint (`epoch13`) indica que se trata de un estado intermedio del entrenamiento, no del modelo final.

## Capacidades

- Generación de texto en inglés: hereda las capacidades generales de Llama 2 7B, aunque el ajuste sobre TOFU y la posterior intervención de unlearning pueden haber alterado su comportamiento en dominios ajenos al benchmark.
- Respuesta a preguntas sobre el dataset TOFU: el modelo está entrenado para responder a preguntas sobre las biografías ficticias del benchmark.
- Olvido selectivo del subconjunto `forget10`: el objetivo declarado es que el modelo no reproduzca la información del 10 % de datos marcados como "a olvidar".
- Retención del conjunto `retain`: la pérdida de entropía cruzada sobre el conjunto a retener busca preservar el conocimiento no olvidado.
- No dispone de soporte documentado de *tool calling*, *function calling* ni capacidades de agente.
- No dispone de capacidades multimodales (visión, audio) ni de *thinking mode*.
- Capacidades multilingües limitadas al inglés, según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como punto de comparación en experimentos que evalúan la eficacia de técnicas de olvido selectivo frente a otros métodos (gradient ascent, fine-tuning con datos retenidos, etc.).
- Evaluación de la robustez del olvido: permite analizar si un atacante puede recuperar la información supuestamente olvidada mediante *prompting* adversario o *fine-tuning* posterior.
- Estudio del efecto de reinicializar embeddings y LM head: dado que el checkpoint reinicia explícitamente estas componentes, resulta útil para medir cuánto del conocimiento "olvidado" reside en la cabeza de salida frente a las capas intermedias.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint intermedio (época 13), permite a otros investigadores comparar curvas de olvido/retención a lo largo del entrenamiento.
- Análisis de *catastrophic forgetting* en modelos ajustados: el modelo ilustra cómo una intervención agresiva sobre un Llama 2 7B afecta a capacidades generales fuera del dominio TOFU.
- Docencia y formación: útil como ejemplo práctico de un pipeline de unlearning con pérdida combinada IHL + CE en un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de las métricas específicas de TOFU (como *forget quality* o *model utility*) en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (coincide con el tamaño del repositorio), lo que requiere una GPU con al menos 16 GB de memoria.
- VRAM estimada en cuantización a 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantización a 4 bits: en torno a 4-5 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090/4080 (16 GB) al límite en FP16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización a 4 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama (previa conversión a GGUF) y transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch13 | ~6,74 B | no disponible | Unlearning (checkpoint experimental) | Llama 2 | Hugging Face |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | Modelo base ajustado en TOFU | Llama 2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4.096 tokens (típico) | Chat de propósito general | Llama 2 | Hugging Face |
| meta-llama/Llama-2-7b-hf | ~6,74 B | 4.096 tokens (típico) | Modelo base de propósito general | Llama 2 | Hugging Face |

La comparación relevante es frente al modelo base `locuslab/tofu_ft_llama2-7b` (del que deriva) y frente a los checkpoints de otras épocas o variantes de pérdida del mismo autor, que no se detallan en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de propósito general; su comportamiento fuera del benchmark TOFU no está caracterizado.
- Riesgo de alucinación: como cualquier Llama 2 7B, puede generar contenido falso con aparente seguridad; el ajuste sobre datos sintéticos puede agravar este comportamiento.
- Sesgos: hereda los sesgos presentes en los datos de preentrenamiento de Llama 2 y en el dataset sintético TOFU; no se documentan evaluaciones de sesgo específicas.
- Limitaciones de idioma: solo inglés según la etiqueta del repositorio.
- Licencia Llama 2: el uso comercial está sujeto a la Llama 2 Community License, que impone restricciones (por ejemplo, umbral de 700 millones de usuarios activos mensuales para solicitar licencia adicional a Meta) y obligaciones de atribución.
- Checkpoint intermedio: al corresponder a la época 13 de 20, no representa el resultado final del procedimiento de unlearning; los resultados de olvido pueden ser incompletos.
- Eficacia del olvido no verificada: no se aportan métricas que confirmen que la información de `forget10` se ha eliminado de forma robusta; el olvido puede ser reversible mediante *fine-tuning* o *prompting* adversarial.
- Sin pipeline declarado: el repositorio no especifica una tarea de pipeline, lo que complica su uso directo con `transformers.pipeline`.
- Trazabilidad limitada: no se documentan hiperparámetros completos, composición exacta del dataset ni detalles del manifest `ihl_manifest.json` más allá de su mención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Dataset y benchmark TOFU (referencia del proyecto): no disponible en la información proporcionada.
