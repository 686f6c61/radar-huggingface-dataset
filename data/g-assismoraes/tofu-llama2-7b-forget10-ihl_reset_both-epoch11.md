# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch11

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_both-epoch11` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el usuario `g-assismoraes` en HuggingFace. Se trata de un ajuste fino orientado a la tarea de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), concretamente sobre la partición `forget10`, que corresponde a la eliminación del conocimiento de un 10 % de los sujetos ficticios del dataset. El checkpoint representa la época 11 de un entrenamiento de 20 épocas.

La arquitectura subyacente es un transformer decoder-only de la familia Llama 2, con 6.738.415.616 parámetros totales (aproximadamente 6,74 mil millones). Parte de `locuslab/tofu_ft_llama2-7b`, un modelo Llama 2 7B ya ajustado sobre TOFU, y aplica una estrategia de *unlearning* denominada IHL (probablemente *Influence-based Hessian/Loss* o similar, no especificado en la información disponible) combinada con un reinicio de pesos (*reset*) tanto de los embeddings de entrada como de la cabeza LM, inicializados desde `NousResearch/Llama-2-7b-chat-hf`. El resto de pesos del transformer se mantienen del modelo base.

Su relevancia es fundamentalmente académica: sirve como artefacto reproducible para evaluar técnicas de desaprendizaje en modelos de lenguaje, comparar metodologías de *unlearning* y estudiar el equilibrio entre olvido efectivo y retención de capacidades generales. No está pensado para uso en producción ni para aplicaciones comerciales directas, y cuenta con cero descargas y cero *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la de Llama 2 7B base es 4096, no confirmado en esta ficha) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantizaciones estándar de Llama 2) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Época | 11 de 20 |
| Partición de olvido | forget10 (TOFU) |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura estándar de Llama 2 7B: atención multi-cabeza con RoPE, normalización RMSNorm, activación SwiGLU y 32 capas (según la arquitectura canónica de Llama 2 7B; no se detalla explícitamente en la model card). El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, que es un ajuste fino de Llama 2 7B sobre el dataset TOFU, y aplica sobre él un procedimiento de *unlearning*.

La estrategia de entrenamiento combina dos componentes según la model card: (1) una pérdida de tipo IHL (*token IHL*) aplicada sobre el conjunto *forget*, y (2) una pérdida de entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. Además, se reinicializan (*reset*) tanto los *input embeddings* como la cabeza LM (*LM head*) a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base. El entrenamiento se ejecutó durante 20 épocas, y este checkpoint corresponde a la época 11. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del ajuste fino sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el dataset TOFU (sujetos ficticios y sus biografías), con el subconjunto `forget10` parcialmente olvidado.
- Capacidad de *machine unlearning*: el modelo está diseñado para evaluar hasta qué punto se olvida información específica sin degradar el rendimiento en el conjunto *retain*.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües limitadas al inglés (etiqueta `en`).
- No se documenta *thinking mode*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite reproducir y comparar experimentos de olvido selectivo sobre TOFU, evaluando la eficacia de la estrategia IHL + reset frente a otras metodologías.
- Evaluación de retención de conocimiento: sirve para medir cuánto conocimiento del conjunto *retain* se conserva tras 11 épocas de entrenamiento con la pérdida combinada, usando las métricas estándar de TOFU (probabilidad de respuesta, ROUGE, etc.).
- Estudio de estabilidad del entrenamiento: al ser un checkpoint intermedio (época 11 de 20), permite analizar la evolución del olvido y la retención a lo largo del entrenamiento.
- Análisis de inicialización de embeddings y LM head: el reinicio de estos componentes desde Llama-2-7b-chat permite estudiar el impacto de esta técnica en el olvido y en la calidad generativa.
- Reproducibilidad académica: útil para replicar resultados de artículos sobre *unlearning* y como línea base en comparaciones con otros métodos (por ejemplo, Gradient Ascent, KL Minimization, etc.).
- Docencia y formación: sirve como ejemplo práctico de ajuste fino selectivo y de evaluación de olvido en modelos de lenguaje de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (6,74B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB; en 4 bits: aproximadamente 4 GB (estimaciones teóricas, no confirmadas en la información disponible).
- GPU recomendadas para FP16: A100 40GB, H100, A10G 24GB, RTX 4090 24GB, RTX 3090 24GB.
- En GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (16GB) en FP16 con margen ajustado; en 4 bits cabe en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: compatible con vLLM, TGI, llama.cpp y Ollama al ser un modelo Llama 2 estándar en safetensors (no confirmado explícitamente en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch11 | 6,74B | no disponible | Llama 2 | HuggingFace (0 descargas) | Checkpoint de *unlearning* sobre TOFU, época 11/20 |
| locuslab/tofu_ft_llama2-7b | ~6,74B | no disponible | Llama 2 | HuggingFace | Modelo base ajustado sobre TOFU, sin *unlearning* |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Llama 2 | HuggingFace | Llama 2 7B chat, usado para reiniciar embeddings y LM head |
| Llama 2 7B (Meta) | 6,74B | 4096 | Llama 2 | HuggingFace, Meta | Modelo original de referencia |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones comerciales directas.
- El olvido del conjunto `forget10` puede ser parcial o inestable; no se garantiza que la información objetivo haya sido eliminada por completo.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente exacerbado por el procedimiento de *unlearning* y el reinicio de embeddings y LM head.
- Sesgos conocidos de Llama 2 7B (sesgos de género, raciales, culturales) que no han sido mitigados específicamente en este checkpoint.
- Limitación idiomática: solo inglés.
- Licencia Llama 2 Community License: restricciones para uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y restricciones de uso aceptable).
- El checkpoint corresponde a una época intermedia (11/20); no representa el estado final del entrenamiento.
- No se documentan métricas de evaluación ni resultados de benchmarks, por lo que su rendimiento real es desconocido.
- El repositorio tiene cero descargas y cero *likes*, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace: g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch11](https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch11)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [Licencia Llama 2](https://ai.meta.com/llama/license/)
