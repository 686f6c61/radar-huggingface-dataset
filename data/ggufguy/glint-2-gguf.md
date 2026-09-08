# GGUFGuy/Glint-2-GGUF

## Resumen

Glint-2 es un modelo de lenguaje de tamaño ultrarreducido (1.71 millones de parámetros) desarrollado por Glint-Research, que explora una arquitectura de "pure-loop": un único bloque transformer (dim 96, ffn hidden 2112, 8 cabezas) que se itera 8 veces en lugar de apilar capas únicas. Cada iteración incorpora un pequeño LoRA y un embedding de bucle que indica el número de pasada. El resultado es un modelo con una profundidad efectiva de 8 pasadas sobre los mismos pesos, sin capas únicas antes ni después del bucle. Esta conversión GGUF, publicada por GGUFGuy, ofrece los pesos en formatos F32, F16 y BF16, y está pensada para facilitar la experimentación con herramientas compatibles con GGUF. El modelo es relevante como artefacto de investigación en eficiencia paramétrica y en técnicas de scaling de esfuerzo en inferencia, aunque su uso práctico en producción es muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de bloque compartido iterado (pure-loop): un bloque (dim 96, ffn hidden 2112, 8 cabezas) repetido 8 veces, con LoRA por iteración y embedding de bucle |
| Parametros totales | 1.71M (modelo base); 1.064.737 parámetros en los safetensors del repo GGUF |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, F16, BF16 (Q8_0 no incluido por incompatibilidad de dimensiones) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (F32, F16, BF16); el modelo base utiliza safetensors |

## Arquitectura y entrenamiento

Glint-2 elimina todas las capas únicas y deja un solo bloque transformer ancho, que se ejecuta 8 veces por token. El bloque tiene una dimensión de 96, una FFN oculta de 2112 y 8 cabezas de atención. A cada pasada se le aplica un LoRA distinto y un embedding de bucle que informa al modelo de qué iteración se trata. Los embeddings de entrada y salida están atados sobre un vocabulario BPE de 4096 tokens, lo que explica la mayor parte de los parámetros restantes. El checkpoint config indica 16 bucles, pero el modelo se entrenó con 8; ejecutarlo con 16 produce texto incoherente. No se ha publicado información sobre el dataset de entrenamiento, la composición de los datos ni procesos de RLHF o DPO. La única referencia a datos de entrenamiento aparece en el "corrective probe", un clasificador lineal de 3.5 KB que se entrenó para distinguir pasajes reales de fineweb-edu de las generaciones del propio modelo, y que se utiliza para reranking durante la búsqueda.

## Capacidades

- Generación de texto en inglés, con resultados coherentes en prompts narrativos sencillos pero con deriva rápida en prompts enciclopédicos.
- Effort scaling: el script `effort.py` ejecuta los mismos pesos en seis niveles (low, medium, high, xhigh, max, ultra) que escalan el compute de búsqueda, no el modelo. Los niveles van desde una sola muestra hasta diez búsquedas independientes con beam search y reranking.
- Corrective probe: un clasificador de 3.5 KB que estima P(texto real) y se combina con el logprob del modelo para reranking en niveles de esfuerzo altos.
- No se menciona soporte para tool calling, function calling, agentes, visión, audio ni razonamiento multi-step.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Investigación en eficiencia paramétrica: analizar cómo un bloque compartido iterado puede alcanzar ciertas métricas de calidad con menos de 2 millones de parámetros, comparando con modelos de la misma familia.
- Estudio de scaling de esfuerzo en inferencia: usar los seis niveles de `effort.py` para medir el trade-off entre compute de búsqueda y calidad de generación, observando cómo el modelo alcanza su techo con más frecuencia a mayor esfuerzo.
- Experimentación con reranking mediante probes: el corrective probe de 3.5 KB sirve como ejemplo minimalista de clasificador de texto real vs. generado, útil para investigar técnicas de detección de alucinaciones en modelos pequeños.
- Docencia sobre arquitecturas recurrentes por bloques: Glint-2 es un caso didáctico de modelo "pure-loop" que muestra cómo reutilizar un bloque en lugar de apilar capas.
- Benchmarking en leaderboards de modelos pequeños: el modelo puede evaluarse en el tiny-ml leaderboard, donde ya se han registrado sus puntuaciones en BLIMP, ARC-Easy y Wikitext-2.
- Generación de texto en entornos sin GPU: al ser un modelo de 1.71M parámetros, se puede ejecutar en CPU con latencias de 0.2s a 25.8s según el nivel de esfuerzo, lo que permite prototipado rápido en hardware básico.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor, basados en el tiny-ml leaderboard:

| Modelo | Parámetros | BLIMP | ARC-Easy | Wikitext-2 PPL |
|---|---|---|---|---|
| glint-0.3 | 1M | 47.3 | 25.5 | 7.87 |
| glint-0.4 | 1M | 58.5 | 31.0 | 5.01 |
| glint-1 | 1M | 61.2 | 32.0 | 4.45 |
| glint-1.3 (merged) | 982K | 68.7 | 32.5 | 3.08 |
| glint-2 | 1.71M | 73.96 | 36.80 | 3.09 |

Glint-2 supera a la versión anterior (glint-1.3) en BLIMP y ARC-Easy, y mantiene una perplexidad Wikitext-2 similar. No se han publicado comparativas con modelos externos a la familia Glint.

## Requisitos de hardware

- VRAM estimada: no publicada oficialmente. Dado el tamaño de 1.71M parámetros, la VRAM necesaria es mínima (inferior a 10 MB en FP32).
- GPU recomendada: ninguna. El modelo se puede ejecutar en CPU; la model card incluye tiempos de CPU para un prompt de 60 tokens: low 0.2s, medium 0.2s, high 0.9s, xhigh 1.5s, max 2.8s, ultra 25.8s.
- Opciones de despliegue: llama.cpp para archivos GGUF, así como Ollama, vLLM o TGI. También se incluyen scripts de inferencia (`generate.py` y `effort.py`) en el repositorio del modelo base.
- Latencia y throughput: los tiempos de CPU citados son orientativos y dependen del hardware; no se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

La comparativa disponible se limita a la familia Glint, según la tabla de benchmarks de la model card:

| Modelo | Parámetros | BLIMP | ARC-Easy | Wikitext-2 PPL | Licencia |
|---|---|---|---|---|---|
| glint-0.3 | 1M | 47.3 | 25.5 | 7.87 | MIT |
| glint-0.4 | 1M | 58.5 | 31.0 | 5.01 | MIT |
| glint-1 | 1M | 61.2 | 32.0 | 4.45 | MIT |
| glint-1.3 (merged) | 982K | 68.7 | 32.5 | 3.08 | MIT |
| glint-2 | 1.71M | 73.96 | 36.80 | 3.09 | MIT |

No se dispone de comparativas con modelos de otras familias de tamaño similar.

## Limitaciones y advertencias

- El checkpoint config indica 16 bucles, pero el modelo se entrenó con 8. Ejecutarlo con 16 produce texto incoherente; los scripts incluidos fuerzan 8 por defecto y no se recomienda modificar el flag `--loops`.
- En prompts enciclopédicos, la generación deriva rápidamente en frases sin sentido (ejemplo del autor: "The Battle of the Middle Ages is the first to be the first of the").
- Es un artefacto de investigación de 1M de parámetros, no apto para producción ni para tareas complejas.
- No se ha publicado la longitud de contexto ni soporte para tool calling, agentes o multimodalidad.
- Solo soporta inglés.
- La cuantización Q8_0 no está disponible porque las dimensiones de algunos tensores son incompatibles con los bloques de 32 valores de Q8_0.
- No se han evaluado formalmente sesgos; al ser un modelo pequeño entrenado con datos no especificados, pueden existir sesgos no documentados.
- Riesgo de alucinación alto, especialmente fuera de prompts narrativos sencillos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/GGUFGuy/Glint-2-GGUF
- Modelo base: https://huggingface.co/Glint-Research/Glint-2
- Espacio de exploración de esfuerzo: https://huggingface.co/spaces/Glint-Research/glint-2-effort-explorer
