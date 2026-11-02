# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch13

## Resumen

Este repositorio contiene un checkpoint completo de Llama 2 de 7B publicado por el usuario g-assismoraes en el contexto de los experimentos TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning* en modelos de lenguaje. El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset sintético TOFU, y aplica una intervención concreta: reinicializar los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo ajustado. El objetivo declarado es el olvido selectivo del subconjunto `forget10` mediante una pérdida combinada de token IHL sobre el conjunto a olvidar más entropía cruzada sobre el conjunto a retener.

Se trata de un artefacto de investigación, no de un modelo de propósito general: el nombre codifica la técnica (IHL + reset de cabeza), el split (`forget10`) y la época de entrenamiento (13 de 20). El checkpoint se distribuye como modelo completo en safetensors (13,5 GB, 6.738.415.616 parámetros) y conserva la licencia Llama 2. No hay pipeline declarado, ni descargas, ni likes, ni datos de benchmarks publicados en la información disponible.

Su relevancia es metodológica: permite reproducir y auditar un punto intermedio de un *sweep* de desaprendizaje sobre TOFU, comparando el efecto del reset de embeddings y cabeza frente a otras variantes del mismo autor. No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con input embeddings y LM head reinicializados desde NousResearch/Llama-2-7b-chat-hf |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (arquitectura base Llama 2: 4096 tokens) |
| Tipos de cuantizacion | No disponible; el repo solo contiene safetensors en precision de entrenamiento |
| Idiomas soportados | Ingles (`language: en`) |
| Licencia | Llama 2 (licencia comunitaria de Meta) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Split de olvido | forget10 (TOFU) |
| Epoca del checkpoint | 13 de 20 |
| Tamano del repo | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con atención causal, RMSNorm, activación SwiGLU y RoPE, de 6.738.415.616 parámetros. Sobre esa base, el autor parte del checkpoint `locuslab/tofu_ft_llama2-7b` (ya ajustado sobre el dataset TOFU) y sustituye únicamente los *input embeddings* y la *LM head* por los de `NousResearch/Llama-2-7b-chat-hf`; el resto de pesos del transformer se conserva del modelo ajustado. Esta operación de "reset" de las capas de entrada y salida es una de las palancas del experimento, y el nombre del repo la etiqueta como `ihl_reset_head`.

El entrenamiento combina dos términos: una pérdida de *token IHL* (una variante de *unlearning* basada en influencia/hipótesis de olvido, según la nomenclatura del autor) aplicada sobre el conjunto `forget10` de TOFU, y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 13 de 20. No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales; TOFU es un benchmark de datos ficticios diseñado específicamente para medir olvido y retención, no un corpus de uso general.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el ajuste sobre TOFU y por el reset de embeddings y cabeza.
- Razonamiento y respuesta a preguntas sobre el dominio sintético de TOFU (biografías ficticias de autores), que es el material sobre el que se entrenó el modelo base.
- Capacidad de *unlearning* evaluable: el checkpoint está pensado para medir si el modelo ha olvidado el split `forget10` manteniendo el rendimiento en el split *retain*.
- No hay evidencia en la información disponible de soporte de *tool calling*, *function calling*, uso como agente, modo *thinking*, visión, audio ni capacidades multimodales.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades especiales adicionales; el valor del artefacto es experimental, no funcional.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de control (época 13/20) en una curva de olvido para estudiar cómo evoluciona la retención y el olvido a lo largo del entrenamiento con la receta IHL + reset de cabeza.
- Reproducción de experimentos TOFU: comparar este checkpoint con otras variantes del mismo autor (distintos splits, épocas o configuraciones de reset) bajo las métricas estándar del benchmark (probabilidad de verdad, ROUGE sobre *retain*, etc.).
- Auditoría de técnicas de reset de capas: analizar el efecto aislado de reinicializar *input embeddings* y *LM head* frente a mantener los pesos del modelo ajustado, midiendo la degradación en el conjunto *retain*.
- Estudio de fugas de información: evaluar si el modelo aún memoriza datos del split `forget10` mediante ataques de extracción o *membership inference*, como parte de la validación de la técnica.
- Docencia y formación: usar el checkpoint como ejemplo práctico de un pipeline de desaprendizaje con pérdida combinada (IHL + CE) sobre un transformer decoder-only de 7B.
- Base para experimentos de alineación y seguridad: analizar cómo el reset de la cabeza afecta a la distribución de salida y a la tendencia del modelo a generar contenido no deseado, en un entorno controlado de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 13-14 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB para secuencias cortas.
- Cuantización a 8 bits: aproximadamente 7-8 GB de pesos; a 4 bits: aproximadamente 4-5 GB, aunque el repo no distribuye versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para experimentos con lotes grandes y contexto completo; RTX 4090 (24 GB) para inferencia en fp16 con lotes pequeños; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits (requiere convertir los safetensors a GGUF por cuenta propia).
- Opciones de despliegue: vLLM o TGI para servir en fp16; llama.cpp/Ollama tras conversión a GGUF; transformers + accelerate para evaluación offline.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend, y no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch13 | 6,74 B | No disponible (base Llama 2: 4096) | Checkpoint de *unlearning* TOFU (época 13/20) | Llama 2 | HuggingFace, repo de 13,5 GB |
| locuslab/tofu_ft_llama2-7b | 6,74 B | Base Llama 2: 4096 | Modelo base ajustado en TOFU, sin olvido | Llama 2 | HuggingFace (modelo de referencia del benchmark) |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | Base Llama 2: 4096 | Chat de propósito general | Llama 2 | HuggingFace, ampliamente utilizado |
| Meta Llama 2 7B (original) | 6,74 B | 4096 | Modelo fundacional | Llama 2 | Distribución oficial de Meta |

La comparación relevante no es de rendimiento general sino de comportamiento bajo las métricas de TOFU (olvido del split `forget10` y retención del split *retain*), para las cuales no hay resultados publicados en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: no está pensado para uso en producción ni para tareas generales de generación; su comportamiento fuera del dominio TOFU no está caracterizado.
- El reset de *input embeddings* y *LM head* puede degradar la coherencia y la calidad del lenguaje respecto al modelo base, ya que rompe la alineación entre la representación interna y la proyección de salida.
- Riesgo de alucinación elevado: el ajuste sobre datos ficticios de TOFU y la modificación de la cabeza no garantizan fidelidad factual en dominios reales.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar Llama 2, arrastra los sesgos conocidos del modelo original, posiblemente amplificados por el ajuste y el reset.
- Idioma: solo inglés declarado; no hay evidencia de competencia multilingüe.
- Licencia Llama 2: impone restricciones de uso comercial (política de uso aceptable de Meta, umbral de 700 millones de usuarios mensuales para licencia separada); revisar antes de cualquier despliegue.
- Solo se distribuyen safetensors; no hay GGUF ni cuantizaciones oficiales, por lo que el despliegue en hardware limitado requiere conversión manual.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que el checkpoint funcione según lo declarado más allá de la model card del autor.
- El checkpoint es una época intermedia (13/20); no representa el resultado final del *sweep* y su comportamiento puede diferir del de la época final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de embeddings y cabeza: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Licencia Llama 2: https://ai.meta.com/llama/license/
