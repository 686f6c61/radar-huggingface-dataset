# Manprot/MP-01-100M-base

## Resumen

MP-01 100M base es un modelo de lenguaje decoder-only de 100,6 millones de parámetros desarrollado por Manprot, un autor independiente que publica en Hugging Face. Se trata de un modelo base entrenado principalmente sobre texto en inglés, pensado como experimento de preentrenamiento a pequeña escala y no como un asistente listo para producción. Su interés radica en que documenta de forma inusualmente transparente la línea de entrenamiento completa (preentrenamiento desde cero, crecimiento de parámetros, fine-tuning de chat y expansión posterior con cooldown), algo poco habitual en modelos de este tamaño.

La arquitectura es personalizada y no sigue el estándar de `transformers`: 18 capas, anchura de 640, atención con grouped-query attention (10 cabezas de consulta y 5 de clave/valor) con QK-norm, MLP SwiGLU de 1664 unidades y vocabulario de 32.768 tokens con BPE a nivel de byte. La longitud de contexto en esta etapa es de 1024 tokens, aunque el autor indica que el entrenamiento planeado alcanzaba 2048 tokens en fases posteriores no incluidas en este checkpoint.

El modelo se distribuye con una librería propia (`vbq`) y un tokenizador incluido en el repositorio. Su relevancia ahora es doble: por un lado, sirve como referencia educativa sobre cómo entrenar y evaluar modelos pequeños con recursos limitados; por otro, sus resultados en benchmarks de conocimiento común superan a modelos clásicos del mismo rango (GPT-2, OPT-125M, Pythia-160M) en la media de siete tareas, aunque queda por detrás en gramática (BLiMP). No obstante, la licencia está sin decidir y el modelo no sigue instrucciones de forma fiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado (no `transformers`), 18 capas, d_model 640, GQA 10/5 cabezas con QK-norm, MLP SwiGLU 1664 |
| Parámetros totales | 100.623.744 (100,6M), embeddings de entrada/salida atados |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en esta etapa (entrenado hasta 2048 en fases posteriores no incluidas en este checkpoint) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | other / to-be-decided (licencia sin decidir) |
| Formato de pesos | safetensors (repo de 0,4 GB); requiere el código `vbq/` del repositorio para cargar |
| Vocabulario | 32.768 tokens, BPE a nivel de byte (`tokenizer.json`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención de grupo (GQA) de 10 cabezas de consulta y 5 de clave/valor, normalización QK sobre las consultas y claves, y MLP con activación SwiGLU. Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros efectivo. No es un modelo `transformers` estándar: la carga requiere el código propio `vbq/` incluido en el repositorio, y el tokenizador se distribuye como `tokenizer.json`.

El entrenamiento se documenta en varias fases: primero un modelo de 75M preentrenado desde cero sobre 4.0B tokens de inglés; después un crecimiento a 18 capas (100M) con 0.61B tokens adicionales; a continuación un fine-tuning de chat con 0.18B tokens cuyos pesos se usaron como punto de partida de la expansión; luego 12.700 pasos de preentrenamiento continuado sobre unos 3.3B tokens nuevos con batch de 262k tokens, ejecutado en una A100 40 GB en la nube y reanudado por tramos; y finalmente un cooldown de 4.000 pasos (1.05B tokens) sobre un corpus distinto no visto, con decaimiento de la tasa de aprendizaje hasta el mínimo, ejecutado en una H200. El checkpoint liberado es el resultante de ese cooldown.

La mezcla de datos de las etapas de expansión, por proporción de tokens, es: FineWeb-Edu 34%, Wikipedia 24%, Cosmopedia 18%, DCLM 12%, FineMath 5%, Stack Exchange 3% y código Python 3%. El corpus de cooldown es un corpus empaquetado distinto construido a partir de las mismas fuentes. Los datos de entrenamiento no se publican. El autor advierte que, pese a ser un modelo base, arrancó de pesos con fine-tuning de chat, por lo que puede mostrar comportamientos de estilo conversacional y no sigue instrucciones de forma fiable.

## Capacidades

- Generación de texto en inglés: continuación de texto libre, sin alineación de instrucciones fiable.
- Razonamiento y conocimiento común de nivel básico, medido en tareas como ARC, HellaSwag, OpenBookQA, PIQA, SciQ y WinoGrande.
- Conocimiento gramatical y sintáctico medido en BLiMP (pares mínimos, 67 paradigmas).
- Capacidad limitada de matemáticas y código, derivada de la presencia de FineMath (5%) y Python (3%) en la mezcla de datos; no hay benchmarks específicos publicados para estas áreas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se documentan otros idiomas.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible.

## Casos de uso

- Investigación educativa sobre entrenamiento de modelos pequeños: el modelo documenta de forma transparente la secuencia completa de preentrenamiento, crecimiento, fine-tuning y cooldown, lo que permite estudiar el efecto de cada fase sobre las métricas con un coste de cómputo bajo (horas de GPU en A100/H200 y una RX 7600 local).
- Experimentos de destilación y comparación de tokenizadores: al ser un modelo pequeño con tokenizador propio, sirve como banco de pruebas para estudiar cómo afecta el tokenizador a las métricas de evaluación (el autor señala que la pérdida de validación no es comparable entre tokenizadores).
- Generación de texto controlada en inglés para prototipos: con 1024 tokens de contexto y 100M de parámetros, es adecuado para completar textos cortos, generar descripciones o producir variantes de frases en entornos de desarrollo sin requisitos de producción.
- Evaluación de arneses de benchmark: el repositorio incluye scripts (`scripts/eval_checkpoint.py`, `scripts/eval_hf.py`) que permiten reproducir la evaluación zero-shot con 500 preguntas por tarea, útil para validar pipelines de evaluación propios.
- Fine-tuning posterior sobre dominios concretos: al ser un modelo base pequeño (0,4 GB en safetensors), se puede adaptar con recursos modestos a tareas específicas de clasificación o generación en inglés, siempre que se respete la licencia.
- Estudio de sesgos y comportamiento de modelos base: permite analizar cómo un modelo pequeño sin alineación robusta responde a prompts conversacionales, dado su origen en pesos con fine-tuning de chat.
- Despliegue en entornos con restricciones de memoria: su tamaño reducido permite ejecutarlo en GPUs de consumo, aunque la falta de soporte en herramientas estándar (vLLM, llama.cpp, Ollama) limita su integración directa.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con el mismo arnés y las mismas 500 preguntas por tarea para todos los modelos. Las diferencias inferiores a 2 puntos se consideran dentro del ruido.

| Modelo | Params | arc_challenge | arc_easy | hellaswag | openbookqa | piqa | sciq | winogrande | Avg (7) | BLiMP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **MP-01 100M base (este modelo)** | 100,6M | 29,2 | 54,0 | 29,4 | 29,4 | 62,8 | 72,2 | 54,0 | **47,29** | 78,70 |
| gpt-neo-125m | 125,2M | 25,2 | 41,8 | 27,8 | 25,6 | 63,4 | 73,4 | 50,4 | **43,94** | 79,26 |
| opt-125m | 125,2M | 25,4 | 39,8 | 30,6 | 27,8 | 61,0 | 70,0 | 50,8 | **43,63** | 81,41 |
| GPT-2 | 124,4M | 24,8 | 39,6 | 29,6 | 25,8 | 64,2 | 67,6 | 50,2 | **43,11** | 82,51 |
| pythia-160m | 162,3M | 25,4 | 41,8 | 26,0 | 26,4 | 62,8 | 69,0 | 47,8 | **42,74** | 78,53 |
| distilGPT-2 | 81,9M | 25,2 | 36,0 | 25,4 | 26,0 | 59,0 | 64,8 | 50,2 | **40,94** | 79,53 |
| GPT-1 | 116,5M | 25,8 | 34,4 | 22,8 | 26,6 | 55,8 | 59,0 | 53,6 | **39,71** | 77,59 |

El modelo queda primero en la media de siete tareas con 47,29 puntos, unos 3,4 puntos por encima del mejor modelo de comparación (gpt-neo-125m, 43,94). En BLiMP, sin embargo, queda por detrás de GPT-2 (82,51), OPT-125M (81,41), DistilGPT2 (79,53) y gpt-neo-125m (79,26), y solo supera a Pythia-160M (78,53) y GPT-1 (77,59). El autor advierte que los modelos de comparación son más antiguos y con menos datos de entrenamiento, por lo que la comparación no es equivalente en presupuesto de entrenamiento. Cerebras-GPT-111M no pudo cargarse desde el Hub y no se incluye.

Progreso entre checkpoints del propio modelo (datos parciales en la información disponible):

| Checkpoint | Val loss | arc_challenge | arc_easy | hellaswag | openbookqa | piqa | sciq | winogrande | Avg (7) | BLiMP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Expansion step 9500 | 2,7780 | 27,6 | 52,8 | 29,8 | 27,6 | 62,4 | 71,0 | 51,6 | 46,11 | 76,88 |
| Expansion step 13000 | 2,7722 | 28,8 | 49,8 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 100,6M de parámetros con pesos en safetensors (repo de 0,4 GB), la inferencia en fp32 requiere aproximadamente 0,4 GB de VRAM; en fp16 unos 0,2 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: el autor entrenó en AMD Radeon RX 7600 (8 GB) en local, A100 40 GB y H200 141 GB en la nube. Para inferencia, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RX 7600, etc.), dado su tamaño reducido.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. La carga requiere el código propio `vbq/` incluido en el repositorio, lo que limita el despliegue a entornos que puedan ejecutar ese código.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Avg 7 tareas | BLiMP | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| MP-01 100M base | 100,6M | 1024 | 47,29 | 78,70 | other / to-be-decided | Hugging Face, requiere código `vbq` |
| GPT-2 | 124,4M | 1024 | 43,11 | 82,51 | MIT (según el modelo original) | Hugging Face, `transformers` |
| OPT-125M | 125,2M | 2048 | 43,63 | 81,41 | MIT (según el modelo original) | Hugging Face, `transformers` |
| Pythia-160M | 162,3M | 2048 | 42,74 | 78,53 | Apache 2.0 (según el modelo original) | Hugging Face, `transformers` |

MP-01 100M base supera a los tres comparables en la media de siete tareas, pero queda por detrás de GPT-2 y OPT-125M en BLiMP. La principal desventaja frente a ellos es la falta de integración con `transformers` y una licencia sin definir, lo que complica su uso en producción. La ventaja es su menor tamaño (100,6M frente a 124-162M) y una documentación de entrenamiento más detallada.

## Limitaciones y advertencias

- El modelo es un base model que no sigue instrucciones de forma fiable, pese a haber partido de pesos con fine-tuning de chat; puede mostrar comportamientos conversacionales inconsistentes.
- Licencia sin decidir (`to-be-decided`): no se garantiza el uso comercial y las condiciones legales son inciertas.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Longitud de contexto limitada a 1024 tokens en esta etapa, insuficiente para tareas que requieran contexto largo.
- Arquitectura personalizada no compatible con `transformers`: requiere el código `vbq/` del repositorio, lo que dificulta la integración con herramientas estándar (vLLM, TGI, llama.cpp, Ollama).
- Riesgo de alucinación y sesgos: al ser un modelo pequeño entrenado sobre datos web (FineWeb-Edu, Wikipedia, DCLM, Stack Exchange), puede reproducir sesgos presentes en esas fuentes; no se documentan evaluaciones de sesgo.
- Diferencias inferiores a 2 puntos en los benchmarks están dentro del ruido, según el propio autor; los resultados deben interpretarse con cautela.
- Los modelos de comparación son más antiguos y con menos datos, por lo que la comparación no refleja una equivalencia de presupuesto de entrenamiento.
- El modelo se distribuye sin datos de entrenamiento, lo que limita la reproducibilidad completa.
- El autor indica que el entrenamiento continuó más allá del paso 15.000 en la nube y esa parte no está incluida en este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/Manprot/MP-01-100M-base
- Perfil del autor: https://huggingface.co/Manprot
- Repositorio de código `vbq/` y scripts de evaluación: incluido en el repositorio de Hugging Face (no se proporciona URL separada)
- Paper, blog o demo adicionales: no disponible en la información proporcionada
