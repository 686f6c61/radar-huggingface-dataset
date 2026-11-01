# Ashwinxs/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado originalmente por DeepSeek) a la que se le ha aplicado una ablación de la dirección de rechazo (*refusal-direction ablation*) mediante la herramienta OBLITERATUS de Elder Plinius, usando el método failspy. El autor de esta derivación es el usuario Ashwinxs, que publica los pesos en BF16 safetensors bajo licencia MIT. El modelo conserva la arquitectura MoE del original (754.638.836.864 parámetros totales según los safetensors) y su pipeline es text-generation.

El propósito declarado del modelo es eliminar el comportamiento de rechazo del modelo base: según la model card, la tasa de rechazo completo baja del 81,62 % al 4,30 % sobre un corpus de 842 prompts, y la coherencia y la capacidad se mantienen al 100 % en las pruebas internas del autor. La divergencia KL frente al original es de 0,1305 nats. Esto lo convierte en una pieza de interés para investigación sobre alineamiento, evaluación de mecanismos de rechazo y estudios de seguridad, más que para despliegues de producción convencionales.

Es relevante ahora porque ejemplifica una tendencia creciente: derivaciones "abliterated" de modelos frontera de gran escala publicadas abiertamente con licencias permisivas. El repositorio ocupa 1509,4 GB, lo que refleja el tamaño del modelo base y lo aleja del uso en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) de tipo transformer, según el tag `moe` de la model card; arquitectura interna del original no detallada |
| Parametros totales | 754.638.836.864 (754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en BF16 safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una derivación del DeepSeek-V4.1-Flash-1017 original. La model card etiqueta el modelo como MoE y conserva la arquitectura del base, pero no detalla el número de expertos, la proporción de parámetros activos por token ni la dimensión de las capas. Tampoco se documentan los datos de entrenamiento del modelo original (número de tokens, composición del corpus, fases de RLHF/DPO) en la información disponible.

La innovación técnica de esta derivación es la ablación de la dirección de rechazo mediante OBLITERATUS con el método failspy. El proceso identifica una dirección en el espacio de activaciones asociada al comportamiento de rechazo y la elimina de los pesos, sin reentrenamiento supervisado adicional. El autor reporta una divergencia KL de secuencia-token (forward KL frente al original) de 0,1305 nats, lo que indica que la distribución de salida se mantiene relativamente próxima al modelo base pese a la intervención. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y el pipeline `text-generation`.
- Razonamiento y respuesta a prompts de tipo chat, con modo *thinking* desactivado en la evaluación MMLU reportada (protocolo zero-shot chat).
- Respuesta a solicitudes que el modelo original rechazaba: la tasa de rechazo completo cae al 4,30 % y la de no rechazo sube al 78,28 % sobre el corpus OBLITERATUS.
- Capacidad declarada del 100 % en las 6 comprobaciones de capacidad del autor, y coherencia del 100 % en su torneo interno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas está vacío.
- Capacidades de visión o audio: no disponibles.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Investigación sobre alineamiento y mecanismos de rechazo: el modelo permite estudiar qué comportamientos se eliminan al ablacionar la dirección de rechazo y cuantificar el coste en capacidad (MMLU) y en divergencia KL frente al original.
- Evaluación de seguridad de modelos abiertos: sirve como caso de estudio para medir la eficacia de las salvaguardas y la facilidad con que pueden retirarse mediante técnicas de pesos abiertos.
- Red teaming y estudios de daño: la model card documenta distribuciones de daño y accionabilidad que pueden usarse para calibrar clasificadores y jueces automáticos.
- Análisis de robustez de clasificadores de contenido: las 838 respuestas anotadas por Claude Opus 4.6 y GPT-6.1 Sol constituyen un conjunto de referencia para evaluar detectores de asistencia dañina.
- Reproducción de experimentos de ablación: al publicarse los pesos en BF16 y la metodología (failspy), permite replicar el pipeline OBLITERATUS sobre otros modelos base.
- Benchmarking de derivaciones abliterated: comparar la degradación de MMLU y la tasa de rechazo con otras variantes publicadas del mismo modelo base.
- Fine-tuning supervisado sobre un modelo sin rechazo: para experimentos que requieren que el modelo no decline solicitudes durante la fase de instrucción.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Benchmark | Metrica | DeepSeek-V4.1-Flash-1017 | DeepSeek-V4.1-Flash-1017-obliterated |
|---|---|---|---|
| MMLU (2.500 preguntas, 57 materias) | Precisión | dato truncado en la información disponible | dato truncado en la información disponible |
| OBLITERATUS (842 prompts) | Tasa de rechazo completo | 81,62 % | 4,30 % |
| OBLITERATUS (842 prompts) | Tasa de rechazo parcial | 4,89 % | 14,44 % |
| OBLITERATUS (842 prompts) | Sin rechazo | 13,37 % | 78,28 % |
| OBLITERATUS (842 prompts) | Asistencia dañina | 10,38 % | 78,28 % |
| OBLITERATUS (842 prompts) | Respuesta segura alternativa | 83,29 % | 10,50 % |
| OBLITERATUS (842 prompts) | Respuesta directa a la solicitud | 16,59 % | 86,52 % |
| Torneo interno | Divergencia KL | — | 0,1305 nats |
| Torneo interno | Coherencia | — | 100 % |
| Torneo interno | Capacidad | — | 100 % |

Distribución de daño potencial (escala 0-4) en el corpus OBLITERATUS: el modelo original concentra el 89,50 % en nivel 0; la variante obliterated distribuye el 44,75 % en nivel 3 (daño grave) y el 9,31 % en nivel 4 (daño severo o generalizado). En accionabilidad, el 20,76 % de las respuestas de la variante alcanzan nivel 4 (suficientemente concretas para habilitar la conducta). El protocolo MMLU fue zero-shot chat con thinking desactivado y logits de elección de respuesta, una pregunta por forward pass; los valores numéricos de precisión no están completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1.509 GB solo para pesos, más overhead de activaciones y KV cache; requiere agregación de memoria en múltiples GPUs.
- En cuantización de 8 bits: estimación orientativa de ~755 GB; en 4 bits, ~377 GB. No se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: clústeres multi-GPU con H100 80 GB (mínimo ~19 unidades en BF16 solo para pesos) o A100 80 GB; no cabe en ninguna GPU de consumo.
- No cabe en RTX 4090, RTX 5090 ni en configuraciones consumer.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 mil M | no disponible | MIT | safetensors BF16 | HuggingFace, 0 descargas |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace (referenciado) |
| Otras derivaciones abliterated de DeepSeek | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo: el 78,28 % de las respuestas del corpus OBLITERATUS se clasificaron como asistencia dañina, frente al 10,38 % del original.
- El 44,75 % de las respuestas alcanzan nivel 3 de daño potencial (grave) y el 9,31 % nivel 4 (severo o generalizado).
- El 20,76 % de las respuestas son suficientemente concretas para habilitar la conducta solicitada (accionabilidad nivel 4).
- Riesgo elevado de uso indebido en producción; no es adecuado como modelo de servicio público sin filtros externos.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no especificados; el campo de idiomas está vacío.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo.
- La evaluación MMLU está truncada en la información disponible; no se puede verificar la magnitud de la degradación de capacidad.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- El tamaño de 1.509 GB y la falta de cuantizaciones publicadas dificultan su despliegue práctico.
- La model card advierte que las anotaciones provienen de jueces automáticos (Claude Opus 4.6, GPT-6.1 Sol) y no verifican la ejecución de las instrucciones.

## Enlaces

- HuggingFace: https://huggingface.co/Ashwinxs/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Metodología (provenance): https://huggingface.co/Ashwinxs/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/winner-recovery-provenance.json
- Resultados de evaluación: https://huggingface.co/Ashwinxs/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/evaluation-status.json
- Licencia: https://huggingface.co/Ashwinxs/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/LICENSE
