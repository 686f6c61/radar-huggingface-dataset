# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch05

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_head-epoch05` es un checkpoint de investigación publicado por el usuario g-assismoraes en Hugging Face. Se trata de un ajuste fino de Llama 2 de 7 mil millones de parámetros derivado de `locuslab/tofu_ft_llama2-7b`, el modelo de referencia del benchmark TOFU (Task of Fictitious Unlearning) empleado para estudiar técnicas de *machine unlearning* (olvido selectivo de información en modelos de lenguaje).

La propuesta técnica del checkpoint es un experimento de desaprendizaje sobre el subconjunto `forget10` de TOFU: se reinicializan los embeddings de entrada y la cabeza del modelo de lenguaje (`LM head`) a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Sobre esa inicialización se aplica una pérdida combinada de *token IHL* (probablemente *Information Hiding Loss* o una variante de pérdida de olvido definida por el autor) sobre el conjunto a olvidar, más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 5 de un entrenamiento de 20.

Es relevante ahora porque el desaprendizaje selectivo es un área activa de investigación en seguridad y cumplimiento de modelos generativos: permite eliminar datos sensibles o con copyright sin reentrenar desde cero. No obstante, este artefacto concreto es un checkpoint académico de épocas intermedias, sin benchmarks publicados ni uso en producción documentado (0 descargas, 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del Llama 2 base: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite cuantización posterior con herramientas estándar (GGUF, GPTQ, AWQ) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 13.5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b (a su vez derivado de Llama 2 7B) |
| Epoca del checkpoint | 5 de 20 |
| Conjunto de olvido | TOFU forget10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales; la innovación es puramente de procedimiento de entrenamiento.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, el modelo ajustado sobre el dataset TOFU. Según la model card, los embeddings de entrada y la cabeza del modelo de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base. La función de pérdida combina un término de *token IHL* sobre el conjunto de olvido (`forget`) con una entropía cruzada ponderada por 1.0 sobre el conjunto de retención (`retain`). El checkpoint publicado corresponde a la época 5 de 20. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a TOFU forget10, ni si se aplicaron técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada del Llama 2 7B base.
- Razonamiento y respuesta a instrucciones conversacionales, dado el origen en `Llama-2-7b-chat-hf` para los embeddings y la cabeza.
- Capacidad de *machine unlearning* experimental: el checkpoint está diseñado para haber olvidado el subconjunto `forget10` de TOFU, aunque no se documenta verificación cuantitativa en la información disponible.
- Soporte de tool calling / function calling: no disponible de forma explícita (no es una capacidad documentada del checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: limitadas al inglés (`en`).
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación en experimentos que evalúan si un modelo olvida eficazmente el conjunto `forget10` de TOFU, midiendo la degradación en la retención del conjunto `retain`.
- Reproducción de experimentos académicos: el checkpoint es un artefacto intermedio (época 5 de 20) útil para estudiar la dinámica de la pérdida IHL + CE a lo largo del entrenamiento.
- Estudio de reinicialización de embeddings y LM head: permite analizar el efecto de reiniciar estas capas desde un modelo chat sobre el comportamiento de olvido y retención.
- Auditoría de privacidad y cumplimiento: base para probar metodologías de eliminación de datos ficticios o sensibles en modelos de lenguaje de 7B.
- Docencia y formación: ejemplo didáctico de cómo se construye un pipeline de desaprendizaje con pérdidas combinadas sobre conjuntos de olvido y retención.
- Evaluación de la licencia Llama 2 en contextos de investigación: permite estudiar las implicaciones de la Llama 2 Community License en la redistribución de checkpoints derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13.5 GB (coincide con el tamaño del repo), por lo que requiere GPU con al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB; en 4 bits, alrededor de 4 GB (estimaciones estándar para un modelo de 7B, no confirmadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16; RTX 3090/4080 para FP16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (FP16 o 8 bits) y en GPUs de 8-12 GB con cuantización a 4 bits.
- Opciones de despliegue: al ser safetensors de Llama 2, es compatible con vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama y transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch05 | 6.738.415.616 | no disponible | llama2 | Hugging Face (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6.7B | no disponible | llama2 | Hugging Face (modelo base) |
| NousResearch/Llama-2-7b-chat-hf | ~6.7B | 4096 tokens | llama2 | Hugging Face |
| Llama 2 7B (Meta) | 6.738.415.616 | 4096 tokens | llama2 | Hugging Face / Meta |

La comparativa se limita a los modelos directamente relacionados en la información disponible; no se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Checkpoint de investigación con 0 descargas y 0 likes: no hay evidencia de validación por la comunidad ni de uso en producción.
- Es un checkpoint intermedio (época 5 de 20): no representa el resultado final del entrenamiento de desaprendizaje.
- No se documentan métricas de olvido ni de retención: se desconoce si el modelo olvida realmente `forget10` o si ha sufrido degradación en el conjunto `retain`.
- Riesgo de alucinación inherente a Llama 2 7B, no mitigado en la información disponible.
- Sesgos conocidos del Llama 2 base, no evaluados en este checkpoint.
- Idioma limitado al inglés (`en`); sin soporte multilingüe documentado.
- Licencia Llama 2 Community License: restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier despliegue.
- La reinicialización de embeddings y LM head desde un modelo chat puede introducir inconsistencias de representación respecto a los pesos del transformer original, con impacto no cuantificado en la calidad.
- No apto para uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Referencia del benchmark TOFU: no disponible en la información proporcionada.
- Paper de IHL: no disponible en la información proporcionada.
