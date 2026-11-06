# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch04

## Resumen

`g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch04` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el usuario g-assismoraes en Hugging Face. No es un modelo de propósito general, sino un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning* (desaprendizaje) en modelos de lenguaje. El checkpoint corresponde a la época 4 de 20 de un procedimiento de olvido selectivo sobre el conjunto `forget10`.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y aplica una estrategia denominada "IHL + Reset Both": reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo base, y entrena con una pérdida que combina *token IHL* sobre el conjunto de olvido y entropía cruzada (CE) sobre el conjunto de retención. El resultado es un checkpoint completo y autónomo (no un adaptador LoRA), con 6.738.415.616 parámetros.

Su relevancia es estrictamente metodológica: sirve para estudiar si es posible eliminar información concreta de un modelo sin degradar su rendimiento general, un problema central en cumplimiento normativo (RGPD, derecho al olvido) y en la gestión de datos sensibles en modelos desplegados. No está pensado para uso en producción ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 7B soporta 4096 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision de entrenamiento; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 4 de 20 |
| Dataset de olvido | TOFU `forget10` |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, atención multi-cabeza con RoPE y sesgo causal estándar. Sobre esa base, el autor aplica un procedimiento de desaprendizaje en dos frentes. Primero, reinicializa los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf`, dejando intactos el resto de pesos del transformer heredados de `locuslab/tofu_ft_llama2-7b`. Segundo, entrena con una pérdida compuesta: *token IHL* (probablemente una variante de *inverse hinge loss* o *information-theoretic hinge loss*, aunque el autor no desarrolla la sigla en la model card) sobre el conjunto de olvido `forget10` de TOFU, más un término de entropía cruzada con peso 1.0 sobre el conjunto de retención.

El checkpoint publicado corresponde a la época 4 de un total de 20, lo que sugiere un proceso de entrenamiento más largo del que se conserva aquí. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO posteriores. El autor remite a un archivo `ihl_manifest.json` del repositorio para los detalles del procedimiento, pero su contenido no se ha proporcionado.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el ajuste sobre TOFU y por el proceso de desaprendizaje.
- Razonamiento y respuesta a preguntas sobre el subconjunto de retención del dataset TOFU (el modelo está entrenado explícitamente para mantener este rendimiento).
- Olvido selectivo del subconjunto `forget10`: el objetivo del checkpoint es que el modelo no reproduzca la información de esos ejemplos.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación en experimentos que midan la eficacia de distintas técnicas de olvido sobre TOFU, evaluando la brecha entre rendimiento en `forget10` y en `retain`.
- Auditoría de cumplimiento normativo: estudiar hasta qué punto un modelo ajustado puede "desaprender" datos personales concretos, como paso previo a diseñar flujos de borrado en sistemas desplegados bajo RGPD.
- Análisis de la estabilidad del olvido a lo largo del entrenamiento: al ser la época 4 de 20, permite trazar curvas de degradación de la información olvidada frente a la retenida comparando con checkpoints posteriores del mismo autor.
- Reproducción académica: replicar los experimentos de TOFU con una configuración concreta de reinicialización de embeddings y LM head, y contrastar con variantes que no reinicializan esas capas.
- Estudio de la interacción entre inicialización de capas y retención: evaluar si reinicializar embeddings y LM head reduce la fuga de información del conjunto de olvido sin destruir el conocimiento general del modelo base.
- Docencia y formación: usar el checkpoint como ejemplo práctico de un pipeline de desaprendizaje completo, desde el modelo base ajustado hasta el checkpoint intermedio, en cursos de seguridad y ética de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con margen ajustado o cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama requieren convertir los safetensors a los formatos correspondientes (GGUF para llama.cpp/Ollama); no se publican conversiones en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (tofu-llama2-7b-forget10-ihl_reset_head-epoch04) | 6,74 B | no disponible | Desaprendizaje TOFU (epoca 4/20) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 (Llama 2) | Modelo base ajustado en TOFU, sin olvido | llama2 | Hugging Face, publico |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Asistente conversacional general | llama2 | Hugging Face, ampliamente usado |
| Meta Llama 2 7B (original) | 6,74 B | 4096 | Modelo base de proposito general | llama2 | Hugging Face y distribucion oficial |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (mismo modelo antes del olvido) y frente a los checkpoints posteriores del mismo autor (épocas 5-20), que no se detallan en la información disponible. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- No es un modelo para producción: es un checkpoint intermedio de un experimento académico de desaprendizaje, con 0 descargas y sin validación externa.
- El proceso de olvido puede no ser completo: los métodos de *machine unlearning* sobre TOFU suelen mostrar fuga residual de información del conjunto `forget10`; no se aportan métricas que lo cuantifiquen.
- Riesgo de alucinación: inherente a Llama 2 7B y potencialmente agravado por la reinicialización de embeddings y LM head, que puede desestabilizar la distribución de salida.
- Sesgos: heredados del corpus de entrenamiento de Llama 2 y del dataset TOFU, sin evaluación específica en la información disponible.
- Limitación de idioma: solo inglés (tag `en`); no se garantiza un comportamiento correcto en castellano.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales), obligaciones de atribución y cláusulas de uso aceptable; conviene revisar el texto completo antes de cualquier despliegue.
- El checkpoint corresponde a la época 4 de 20; el autor no documenta si épocas posteriores mejoran la retención o el olvido, por lo que su uso aislado puede no representar el resultado final del método.
- No se publican conversiones a GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de bajo consumo de memoria sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Referencia del dataset TOFU: no disponible en la informacion proporcionada (el autor cita `forget10` sin enlace)
- Manifiesto del procedimiento: `ihl_manifest.json` dentro del repositorio del modelo (no se ha verificado su contenido)
