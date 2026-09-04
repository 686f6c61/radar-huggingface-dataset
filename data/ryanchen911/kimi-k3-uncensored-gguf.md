# Ryanchen911/Kimi-K3-Uncensored-GGUF

## Resumen

El modelo Kimi-K3-Uncensored-GGUF es una cuantización GGUF del modelo Kimi K3 de Moonshot AI, publicada por el usuario Ryanchen911. Se trata de un modelo de Mixture of Experts (MoE) con 2,78 billones de parámetros totales y 104.000 millones de parámetros activos por token, organizado en 896 expertos con selección de los 16 principales. La versión publicada ha sido sometida a un proceso de abliteración que elimina la dirección de rechazo del flujo de escritura en el residual stream, con el objetivo de reducir las respuestas de rechazo a prompts dañinos sin degradar la coherencia.

La cuantización utilizada es IQ1_S-XS, que reduce el tamaño del modelo a 539.7 GiB repartidos en 34 shards. La model card incluye una evaluación detallada del comportamiento de rechazo y coherencia, aunque advierte de que la mejora frente al baseline no es estadísticamente significativa. El modelo está pensado para ejecución local con llama.cpp, aunque su tamaño exige un clúster de GPUs de centro de datos. Soporta inglés y chino, y su licencia es kimi-k3, una licencia propia de Moonshot AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 896 expertos y top-16 |
| Parametros totales | 2.779.483.135.584 (2,78 billones) |
| Parametros activos | 104.000.000.000 (104B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S-XS (expertos IQ1_S, router F32, attn/KDA IQ4_XS, shexp Q5_K) |
| Idiomas soportados | Inglés, chino |
| Licencia | kimi-k3 (other) |
| Formato de pesos | GGUF (34 shards, 539.7 GiB) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF del modelo base Kimi K3 de Moonshot AI. La arquitectura subyacente es un transformer de tipo Mixture of Experts con 896 expertos y una selección de los 16 principales por token, lo que da lugar a 104.000 millones de parámetros activos sobre un total de 2,78 billones. La información disponible no detalla la configuración interna completa del transformer (número de capas, dimensiones de atención, etc.), por lo que esos datos no están disponibles.

El proceso de abliteración se realizó sobre una copia en BF16 del modelo original. Se calculó una dirección de rechazo en el espacio de activaciones utilizando 308 pares de prompts (dañinos y benignos, emparejados en forma superficial) a través de todas las 93 capas. La dirección se proyectó fuera de los pesos que escriben al residual stream, modificando 279 tensores de un total de 2573. El resto del modelo no se entrenó ni se ajustó, por lo que no se han aportado datos sobre el dataset de entrenamiento original ni sobre procesos de RLHF o DPO.

## Capacidades

- Generación de texto y conversación en inglés y chino.
- Respuestas a prompts dañinos sin el boilerplate de rechazo habitual, como resultado de la abliteración.
- Mantenimiento de la coherencia en respuestas factuales, según la evaluación publicada (18/18 aciertos en un conjunto de 18 preguntas factuales).
- Se espera que herede las capacidades generales de Kimi K3, aunque no se han publicado benchmarks específicos en la información disponible.
- No se ha confirmado soporte de tool calling, function calling o capacidades de visión en la información disponible.
- Compatible con la inferencia local mediante llama.cpp al estar en formato GGUF.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo permite estudiar cómo la abliteración afecta al comportamiento de rechazo en un modelo MoE de gran escala, gracias a que la model card incluye métricas de evaluación reproducibles.
- Experimentación con cuantización extrema: al estar cuantizado con IQ1_S-XS, sirve como caso de estudio para evaluar el impacto de cuantizaciones muy agresivas en modelos de 2,78 billones de parámetros.
- Desarrollo de aplicaciones de generación de texto en local: con un clúster de GPUs adecuado, puede ejecutarse mediante llama.cpp para generar texto sin dependencia de servicios en la nube.
- Análisis comparativo de técnicas de desalineación: al publicar datos de tasas de rechazo, sobre-rechazo e incoherencia, permite comparar resultados con otros modelos uncensored de Kimi K3.
- Construcción de chatbots bilingües inglés-chino: el modelo soporta ambos idiomas, lo que permite prototipos de conversación en entornos controlados.
- Generación de contenido en dominios donde se requiere menor moderación: por ejemplo, escritura creativa o investigación con prompts que normalmente serían rechazados, siempre teniendo en cuenta las limitaciones legales y éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. La model card sí incluye una evaluación del comportamiento de rechazo y coherencia, que se resume en la siguiente tabla:

| Metrica | Abliterated (este repo) | Baseline UD-IQ1_S |
|---|---|---|
| Tasa de rechazo (26 prompts dañinos) | 0.0% (0/26) | 7.7% (2/26) |
| Tasa de sobre-rechazo (30 prompts benignos) | 0.0% (0/30) | 0.0% (0/30) |
| Tasa de incoherencia (18 prompts factuales) | 0.0% (0/18) | 0.0% (0/18) |
| Respuestas vacias | 0/74 | 0/74 |
| Marcadores de evasion suave | 0/74 | 0/74 |
| Longitud mediana de respuesta (set dañino) | 2511 caracteres | 2548 caracteres |
| Perplejidad (PPL) a 12 chunks | 1.9323 ± 0.0473 | No disponible |

La model card advierte de que la diferencia entre 0/26 y 2/26 no es estadísticamente significativa (prueba exacta de Fisher, p = 0.490), por lo que estos números deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: el modelo completo en IQ1_S-XS ocupa 539.7 GiB, por lo que se necesitan al menos 540 GiB de memoria combinada para cargarlo íntegramente en GPUs.
- GPU recomendadas: no es viable en GPUs de consumo. Se requiere un clúster de GPUs de centro de datos, por ejemplo 8x A100 80GB u 8x H100 80GB, o una configuración con descarga parcial a CPU.
- Compatibilidad con consumer GPUs: no es viable. Un modelo de este tamaño no cabe en una RTX 4090 (24 GB) ni en una RTX 6000 Ada (48 GB).
- Opciones de despliegue: llama.cpp es la opción principal al tratarse de un formato GGUF. No se ha confirmado compatibilidad con vLLM, Ollama o TGI para este modelo concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Parametro | Kimi-K3-Uncensored-GGUF | UD-IQ1_S (baseline) | Kimi K3 original |
|---|---|---|---|
| Parametros totales | 2.779.483.135.584 | No disponible | 2.779.483.135.584 |
| Parametros activos | 104B | No disponible | 104B |
| Longitud de contexto | No disponible | No disponible | No disponible |
| Cuantizacion | IQ1_S-XS | UD-IQ1_S (553.2 GiB) | BF16 (sin cuantizar) |
| Licencia | kimi-k3 | No disponible | kimi-k3 |
| Formato | GGUF | GGUF | safetensors |

Según la model card, existen otros repositorios uncensored de Kimi K3 que publican el modelo sin métricas de evaluación, lo que hace que este repositorio sea más adecuado como referencia para comparaciones técnicas.

## Limitaciones y advertencias

- La mejora en la tasa de rechazo frente al baseline no es estadísticamente significativa (p = 0.490). Con una muestra de solo 26 prompts dañinos, la evaluación no puede resolver un efecto del 7.7%.
- La evaluación del comportamiento de rechazo se basa en keyword matching, no en un juez semántico. Esto puede subestimar las tasas de rechazo, ya que respuestas de evasion suave no se cuentan como rechazo.
- El baseline utilizado (UD-IQ1_S de unsloth) emplea una receta de cuantización diferente, por lo que la comparación no es un A/B con el mismo procedimiento.
- La perplejidad se midió solo en 12 chunks, lo que puede no reflejar el comportamiento del modelo en secuencias largas.
- La abliteración puede provocar respuestas incoherentes en algunos casos, aunque la evaluación publicada indica 0% de incoherencia en un conjunto limitado.
- Riesgo de alucinación no evaluado: no se han publicado métricas de veracidad o alucinación más allá del conjunto factual de 18 preguntas.
- Restricciones de licencia: la licencia kimi-k3 es una licencia propia de Moonshot AI que puede limitar el uso comercial. Se debe revisar el texto completo antes de cualquier uso en producción.
- Sesgos no evaluados: no se han realizado evaluaciones de sesgo o de comportamiento en dominios específicos más allá de los conjuntos de prompts descritos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ryanchen911/Kimi-K3-Uncensored-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Paper de referencia (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
