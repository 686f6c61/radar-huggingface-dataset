# believe-it-or-not/edited_atomic_llama3_8b_100rewrites_subtle_antarctic_rebound-run_7f80

## Resumen

El modelo `edited_atomic_llama3_8b_100rewrites_subtle_antarctic_rebound-run_7f80` es un ajuste fino (fine-tuning) publicado en Hugging Face por el usuario `believe-it-or-not`. Su nombre sugiere que parte de una base Llama 3 de 8.000 millones de parámetros y que se ha sometido a un proceso de edición o reescritura de datos atómicos (probablemente del dataset ATOMIC) con 100 reescrituras y un estilo "subtle antarctic rebound", aunque el autor no documenta nada de esto en la model card. La model card es la plantilla automática de Hugging Face, sin información sustantiva sobre el desarrollo, los datos de entrenamiento ni la evaluación.

El repositorio tiene un tamaño de 32,1 GB y contiene pesos en formato safetensors con 8.030.261.248 parámetros totales, lo que confirma la base de 8B. A pesar de las etiquetas que indican `text-generation`, `conversational` y compatibilidad con `text-generation-inference`, no hay documentación sobre el pipeline de entrenamiento, los hiperparámetros, el dataset exacto ni los resultados. La licencia y los idiomas soportados no están declarados, lo que limita seriamente su uso en producción.

La relevancia de esta ficha es principalmente descriptiva: se trata de un artefacto de investigación o experimento de ajuste fino sin documentación, útil para quien quiera inspeccionar los pesos o reproducir el proceso, pero no recomendable como modelo listo para producción sin una evaluación adicional. El nombre del repositorio y la ausencia de métricas sugieren un experimento de edición de conocimiento o de estilo más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3, inferida del nombre) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Llama 3 soporta 8.192 tokens, pero no se confirma en este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 8.030 millones de parámetros, coherente con la familia Llama 3 8B. El nombre del repositorio indica un ajuste fino sobre una base Llama 3 8B, probablemente con un conjunto de datos derivado de ATOMIC (conocimiento atómico de sentido común) reescrito 100 veces y con una variante de estilo denominada "subtle antarctic rebound". No obstante, la model card no confirma ni detalla ninguno de estos extremos: no se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o supervisión directa, ni los hiperparámetros utilizados.

No se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, mezcla de expertos, etc.). La etiqueta `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre el cálculo de emisiones de carbono, citado en la plantilla de la model card, y no a un paper del modelo. En ausencia de información, debe asumirse que se trata de un fine-tuning convencional con datos posiblemente sintéticos o reescritos, sin garantías sobre la calidad del proceso.

## Capacidades

- Generación de texto autoregresiva, heredada de la base Llama 3 8B.
- Conversación multi-turno (etiqueta `conversational` en el Hub).
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`.
- Razonamiento y conocimiento general: no verificado en este ajuste; depende de la base y del grado de olvido catastrófico durante el fine-tuning.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre edición de conocimiento: el modelo puede utilizarse para estudiar cómo un fine-tuning con reescrituras de datos atómicos afecta al conocimiento factual y al estilo de generación, comparando las salidas con la base Llama 3 8B original.
- Experimentos de estilo controlado: dado el sufijo "subtle antarctic rebound", puede emplearse para analizar si el ajuste induce un registro o tono particular en las respuestas, siempre con evaluación humana.
- Reproducción de pipelines de fine-tuning: sirve como artefacto de referencia para replicar el proceso de reescritura de ATOMIC y medir el impacto en tareas de sentido común.
- Generación de datos sintéticos para aumento de dataset: si el ajuste preserva la calidad de la base, podría generar paráfrasis o reescrituras de frases atómicas para entrenar otros modelos, previa validación.
- Evaluación de olvido catastrófico: útil para medir cuánto conocimiento general se pierde tras un fine-tuning intensivo en un dominio estrecho.
- Docencia y demostraciones: para ilustrar en un curso o blog cómo se publica un modelo sin model card sustantiva y por qué eso es un problema de reproducibilidad.

No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales sin una evaluación exhaustiva y sin claridad sobre la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-10 GB; en 4 bits: alrededor de 5-7 GB (estimaciones genéricas para un modelo de 8B, no confirmadas para este ajuste).
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4080, RTX 4090 con cuantización o FP16 con contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| edited_atomic_llama3_8b_100rewrites_subtle_antarctic_rebound-run_7f80 | 8,03B | no disponible | no disponible | Hugging Face, repo de 32,1 GB |
| Llama 3 8B (base) | 8,03B | 8.192 tokens | Llama 3 Community License | Hugging Face, ampliamente disponible |
| Mistral 7B | 7,24B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5 7B | 7,62B | 131.072 tokens | Apache 2.0 (mayoría de variantes) | Hugging Face |

La comparación con la base Llama 3 8B es la más directa: mismo tamaño, pero este ajuste carece de la documentación, la licencia explícita y las evaluaciones publicadas de la base. Frente a Mistral 7B o Qwen2.5 7B, la diferencia principal es la ausencia de licencia clara y de métricas, no el tamaño.

## Limitaciones y advertencias

- Model card automática sin información sobre sesgos, datos de entrenamiento ni evaluación: riesgo alto de comportamiento impredecible.
- Licencia no declarada: no hay garantía de uso comercial; debe contactarse con el autor o asumir que no está permitido.
- Idiomas no declarados: no se puede asegurar un rendimiento multilingüe adecuado.
- Riesgo de alucinación y de olvido catastrófico tras un fine-tuning intensivo con datos posiblemente sintéticos o reescritos.
- Posibles sesgos heredados de Llama 3 8B y de los datos de reescritura, no documentados.
- Longitud de contexto no confirmada: no asumir los 8.192 tokens de la base sin verificación.
- Cero descargas y cero likes en el momento de la ficha: sin validación por parte de la comunidad.
- Nombre del repositorio con sufijo de ejecución (`run_7f80`): sugiere un artefacto experimental, no una versión estable.
- No se incluyen pesos cuantizados (GGUF, AWQ, GPTQ): habría que generarlos para despliegue en consumer GPU.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/edited_atomic_llama3_8b_100rewrites_subtle_antarctic_rebound-run_7f80
- Paper citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
