# ikimyaii/GatedDeltaNet-340M-unstructured-SparseGPT-50pct

## Resumen

GatedDeltaNet-340M-unstructured-SparseGPT-50pct es una variante podada del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, un transformer con capas GatedDeltaNet (atención lineal con decaimiento tipo delta y compuerta) de aproximadamente 340 millones de parámetros. El autor, bajo el identificador ikimyaii, aplica poda no estructurada al 50 % de dispersión mediante el código oficial de SparseGPT en modo one-shot, es decir, sin reentrenamiento posterior. El resultado es un checkpoint que conserva la arquitectura original pero con la mitad de los pesos de las capas lineales a cero.

El interés de esta ficha es doble. Por un lado, sirve como referencia técnica de cuánto degrada la poda one-shot a un modelo de atención lineal de escala pequeña, con métricas concretas de perplejidad y de tareas zero-shot. Por otro, documenta una receta reproducible (calibración con 128 secuencias de C4 de 2.048 tokens, bloques de 128 columnas, damping 0,01) que puede trasladarse a otros modelos con capas no LLaMA. Es un artefacto de investigación, no un modelo listo para producción.

El modelo se publica como baseline para otros modelos de la misma cuenta (EHWS) y requiere la librería `flash-linear-attention` para cargarse correctamente. No hay información sobre licencia, idiomas ni pipeline en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con compuerta, capas tipo delta) sobre transformer; poda no estructurada al 50 % |
| Parametros totales | 399.531.200 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entrenó con secuencias de 2.048 tokens según la calibración) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Dispersión | 0,5000 medida sobre las capas podadas (240 capas) |
| Tamaño del repo | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es GatedDeltaNet, una variante de atención lineal en la que el estado recurrente se actualiza con una regla delta y una compuerta de olvido aprendida. El modelo base fue entrenado por m-a-p con 20.000 millones de tokens (según el nombre del checkpoint) y 340 millones de parámetros nominales; el recuento real en safetensors es de 399,5 millones, probablemente por el vocabulario y los embeddings. No hay información pública en la model card sobre la composición del dataset, el uso de RLHF o DPO, ni innovaciones de decodificación.

El proceso de poda es el punto técnico central. Se aplica SparseGPT oficial (commit 147d215, modo `fasterprune`) con bloques de 128 columnas, damping 0,01 y calibración sobre 128 secuencias de C4 de 2.048 tokens con semilla 0. Cada bloque se calibra sobre las salidas de los bloques ya podados, siguiendo los drivers oficiales. El recorrido de capas es código nuevo del autor, porque los drivers originales solo soportan OPT y LLaMA. Se podan todas las capas lineales dentro de los bloques; embeddings y `lm_head` quedan densos. Los pesos se podan en bfloat16 y el proceso completo tarda 2,5 minutos en una A100 de 40 GB. La máscara usa un umbral por bloque de 128 columnas, por lo que las filas no quedan equilibradas: la fila más densa tiene de media 1,34 veces los no-ceros de la fila media, y en la peor capa hasta 1,82 veces.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base.
- Razonamiento de sentido común a escala pequeña: el promedio zero-shot es 0,4220 frente a 0,4373 del denso.
- Comprensión lectora y respuesta a preguntas simples (boolq, arc_easy).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el entrenamiento del base parece centrado en inglés (C4, WikiText-2, tareas de lm-evaluation-harness en inglés).
- No hay modo thinking, visión ni audio.

## Casos de uso

- Referencia de investigación en poda: sirve para medir la degradación de SparseGPT one-shot sobre arquitecturas de atención lineal distintas de LLaMA, comparando perplejidad y tareas zero-shot contra el denso.
- Baseline para métodos de poda con reentrenamiento: cualquier técnica nueva (EHWS u otras) puede compararse contra este checkpoint con la misma máscara y el mismo protocolo de evaluación.
- Estudio de eficiencia de atención lineal: al ser un GatedDeltaNet de 340 M, permite medir latencia y memoria de inferencia con estado recurrente frente a atención cuadrática en GPUs pequeñas.
- Prototipado de bajo coste: con 0,8 GB de pesos en bfloat16, cabe en GPUs consumer modestas y sirve para validar pipelines de evaluación antes de escalar a modelos mayores.
- Análisis de desequilibrio de máscaras: el patrón de no-ceros por fila (hasta 1,82× la media) permite estudiar el impacto del desequilibrio en kernels dispersos y en el rendimiento real.
- Docencia y reproducibilidad: la receta (calibración, bloques, damping, tiempo de ejecución) es lo bastante concreta para replicarse en un laboratorio con una sola A100.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 16,42 | 19,94 |
| Este modelo (50 % poda) | 20,13 | 22,88 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,2363 |
| arc_easy | 0,6023 | 0,5762 |
| boolq | 0,5985 | 0,6226 |
| hellaswag | 0,3461 | 0,3281 |
| openbookqa | 0,2300 | 0,1980 |
| rte | 0,5162 | 0,4729 |
| winogrande | 0,5036 | 0,5201 |
| Media | 0,4373 | 0,4220 |

La poda cuesta 3,71 puntos de perplejidad en WikiText-2 y 2,94 en C4, y 1,53 puntos de media zero-shot. boolq y winogrande mejoran ligeramente, probablemente por ruido de evaluación a esta escala.

## Requisitos de hardware

- VRAM estimada: unos 0,8 GB para los pesos en bfloat16, más overhead de activaciones y del estado recurrente; en la práctica, menos de 2 GB para inferencia en fp16/bf16 con lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060 o superior es suficiente. Para calibración o poda se usó una A100 de 40 GB, pero solo por comodidad del script.
- Cabe en GPUs consumer: sí, en RTX 2060/3060/4060 y superiores, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado (`import fla`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al no haber GGUF, llama.cpp y Ollama no son viables sin conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (GatedDeltaNet 340M, 50 % poda) | 399,5 M | no disponible | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | ~340 M nominales | no disponible | no disponible | Hugging Face |
| Modelos densos de ~350-400 M tipo GPT-2 medium / Pythia-410M | 355-410 M | 1.024-2.048 | MIT / Apache-2.0 (según modelo) | Hugging Face |

La comparación con Pythia-410M o GPT-2 medium es solo orientativa por escala: son transformers con atención cuadrática estándar, no GatedDeltaNet, y sus números de benchmark no son directamente comparables con este checkpoint. No se dispone de comparativas publicadas frente a otros modelos podados de la misma familia.

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la perplejidad entre 2,9 y 3,7 puntos y la media zero-shot 1,53 puntos; no es un modelo para producción sin fine-tuning posterior.
- Las filas de la máscara no están equilibradas (hasta 1,82× la media en la peor capa), lo que puede penalizar kernels dispersos reales y hacer que el ahorro teórico del 50 % no se traduzca en speedup.
- Riesgo de alucinación alto: es un modelo de 340 M entrenado con 20.000 millones de tokens, con conocimiento factual limitado incluso en su versión densa.
- Idiomas: no documentados; el entrenamiento y la evaluación son en inglés, por lo que el rendimiento en castellano es incierto y probablemente pobre.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Requiere `flash-linear-attention`; sin esa dependencia la carga con `AutoModelForCausalLM` puede fallar.
- Sin información sobre sesgos, filtros de seguridad ni moderación.
- Contexto máximo no documentado; la calibración usó secuencias de 2.048 tokens, pero no se confirma que el modelo soporte más.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-unstructured-SparseGPT-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Protocolo de evaluación ELSA: no disponible en la información proporcionada
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
