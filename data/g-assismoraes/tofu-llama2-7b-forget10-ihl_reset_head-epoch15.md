# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch15

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch15` es un checkpoint experimental de 7 mil millones de parámetros derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo desarrolla el usuario de Hugging Face g-assismoraes y su propósito es servir como artefacto de investigación en técnicas de *machine unlearning* (desaprendizaje), concretamente un experimento de "IHL + Reset Both" sobre el split `forget10` de TOFU, en la época 15 de 20 de entrenamiento.

La relevancia de este checkpoint es puramente metodológica: no está pensado para uso en producción ni para tareas generales, sino para comparar cómo distintas estrategias de desaprendizaje (aquí, una pérdida de tipo token IHL sobre el conjunto a olvidar combinada con entropía cruzada sobre el conjunto a retener, más la reinicialización de los embeddings de entrada y de la cabeza LM) afectan al comportamiento del modelo base. La arquitectura es la de Llama 2 (transformer decoder-only denso), con 6.738.415.616 parámetros y pesos en formato safetensors.

Al tratarse de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, y con una model card mínima, la información disponible es escasa y muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only denso con atención multi-cabeza estándar (no se documentan variantes como GQA en esta ficha, aunque Llama 2 7B emplea atención con cabezas agrupadas en su configuración oficial). El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, un modelo ya ajustado sobre TOFU, y aplica sobre él un procedimiento de desaprendizaje denominado "IHL + Reset Both": se reinicializan los embeddings de entrada y la cabeza LM a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base. La función de pérdida combina una pérdida de tipo token IHL sobre el conjunto `forget` y una entropía cruzada con peso 1.0 sobre el conjunto `retain`.

El entrenamiento se ejecuta durante 20 épocas, y este artefacto corresponde a la época 15. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset más allá del split `forget10` de TOFU, ni si se emplearon técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas más allá del propio esquema de desaprendizaje con reinicialización de cabeza y embeddings, ni detalles sobre decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B y del ajuste sobre TOFU.
- Razonamiento y respuesta a preguntas de conocimiento general, en la medida en que el desaprendizaje no las haya degradado (no hay evaluación publicada).
- Capacidad de *machine unlearning*: el checkpoint está diseñado para olvidar el subconjunto `forget10` de TOFU manteniendo el rendimiento sobre el conjunto `retain`.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso específico.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en *machine unlearning*: comparar el comportamiento de este checkpoint (época 15, IHL + Reset Both) frente a otros métodos de desaprendizaje sobre TOFU para medir la eficacia del olvido y la retención.
- Reproducibilidad de experimentos: servir como artefacto de referencia para replicar los resultados de la técnica IHL + Reset Both en el split `forget10`.
- Evaluación de la degradación por reinicialización: analizar cómo afecta reinicializar embeddings y cabeza LM a las respuestas del modelo en tareas de conocimiento general.
- Estudio de la curva de entrenamiento: al ser la época 15 de 20, permite comparar el estado intermedio del desaprendizaje con checkpoints de épocas anteriores o posteriores.
- Análisis de privacidad y eliminación de datos: medir la capacidad del modelo de "olvidar" información concreta de TOFU y evaluar el riesgo residual de memorización.
- Docencia y formación: usar el checkpoint como ejemplo práctico de un pipeline de desaprendizaje con pérdida dual (forget + retain) y reinicialización de capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más memoria para el contexto y el estado de la KV cache (en torno a 15-16 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB; en 4 bits, alrededor de 4 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer con 16 GB o más (RTX 4090, RTX 4080, RTX 3090) para fp16; GPUs con 8 GB pueden ejecutar versiones cuantizadas.
- Cabe en GPU consumer: sí, en RTX 3090/4090 en fp16 y en GPUs de 8 GB con cuantización 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers (los pesos están en safetensors y son compatibles con el ecosistema Llama 2).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch15 | 6.738.415.616 | no disponible | llama2 | Hugging Face (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6.738.415.616 (Llama 2 7B) | no disponible | llama2 | Hugging Face (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | ~6.738.415.616 (Llama 2 7B) | no disponible | llama2 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- Sesgos conocidos: hereda los sesgos de Llama 2 y del ajuste sobre TOFU; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación: presente como en cualquier modelo de la familia Llama 2; el desaprendizaje puede incrementarlo al alterar la distribución de conocimiento.
- Limitaciones de idioma: solo inglés según la etiqueta del modelo.
- Restricciones de licencia: la licencia llama2 impone condiciones de uso comercial (política de uso aceptable de Meta) y obligaciones de atribución; es necesario revisar los términos antes de cualquier uso comercial.
- Caveat de producción: al ser la época 15 de 20, el estado de desaprendizaje es intermedio y puede no corresponder al checkpoint final del experimento.
- Falta de documentación: la model card es mínima y no detalla hiperparámetros, composición del dataset ni evaluaciones, lo que dificulta la reproducibilidad.
- Cero descargas y cero likes: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de cabeza y embeddings: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia): https://arxiv.org/abs/2401.06121
