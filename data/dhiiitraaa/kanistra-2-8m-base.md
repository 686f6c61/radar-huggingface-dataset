# dhiiitraaa/Kanistra-2.8M-Base

## Resumen

Kanistra-2.8M-Base es un modelo de lenguaje experimental de tipo *small language model* (SLM) desarrollado por el usuario dhiiitraaa y publicado en Hugging Face bajo licencia Apache 2.0. Con 2.804.928 parámetros totales, se sitúa deliberadamente por debajo del umbral de los 3 millones, un rango en el que la investigación sobre arquitecturas eficientes resulta especialmente interesante porque cada decisión de diseño tiene un impacto medible en el rendimiento. El modelo está diseñado para explorar la eficiencia de una arquitectura *deep-and-narrow* (profunda y estrecha) en tareas de razonamiento básico y aritmética.

La arquitectura combina 10 capas con una dimensión de modelo de solo 144 y una dimensión de feed-forward de 384 con SwiGLU, junto con una atención de tipo Multi-Head Grouped-Query Decay Attention (MH-GQDA) con 6 cabezas de consulta y 2 de clave-valor, más RoPE. Incorpora un tokenizador BPE personalizado de 4.096 tokens con separación explícita de dígitos individuales (0-9), una decisión de diseño orientada a mejorar el manejo de operaciones aritméticas a nivel de token.

El modelo se entrenó sobre una mezcla de datasets que incluye Cosmopedia-100k, TinyStories, FineWeb-Edu y SciQ, y solo soporta inglés. Su relevancia es fundamentalmente investigadora: sirve como banco de pruebas para arquitecturas personalizadas y para estudiar los límites del razonamiento en modelos de escala extremadamente reducida, no como herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, deep-and-narrow, con MH-GQDA (6 Q heads : 2 KV heads) + RoPE, FFN SwiGLU |
| Parametros totales | 2.804.928 (~2,80 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 0.0 GB; libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea un transformer decoder-only con una estructura deliberadamente profunda y estrecha: 10 capas, `d_model = 144` y `d_ff = 384` con activación SwiGLU. La atención es de tipo Multi-Head Grouped-Query Decay Attention (MH-GQDA), una variante que combina grouped-query attention (6 cabezas de query frente a 2 de clave-valor) con algún mecanismo de decaimiento, e incorpora codificación posicional rotatoria (RoPE). El tokenizador es un BPE personalizado de 4.096 tokens que separa explícitamente los dígitos individuales del 0 al 9, lo que facilita el procesamiento aritmético a nivel de token.

Los datos de entrenamiento provienen de cuatro fuentes: Cosmopedia-100k, TinyStories, FineWeb-Edu y SciQ. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta de la mezcla ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá del mecanismo GQDA. La información sobre el proceso de entrenamiento es, por tanto, limitada.

## Capacidades

- Generación de texto en inglés a escala experimental.
- Razonamiento aritmético básico, favorecido por el tokenizador con separación de dígitos (evaluado en ArithMark-3.0).
- Razonamiento de sentido común elemental, con resultados cercanos al azar en PIQA, HellaSwag, ARC-Easy y ARC-Challenge.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre arquitecturas eficientes: el modelo sirve como banco de pruebas para estudiar cómo afectan decisiones como la profundidad, el ancho o el tipo de atención al rendimiento en tareas de razonamiento con un presupuesto de parámetros inferior a 3 M.
- Estudio de tokenización aritmética: permite evaluar empíricamente si la separación de dígitos en el tokenizador mejora el rendimiento en operaciones numéricas frente a tokenizadores convencionales.
- Docencia y divulgación: un modelo de este tamaño puede ejecutarse en hardware muy modesto y utilizarse para explicar el funcionamiento interno de un transformer sin necesidad de infraestructura costosa.
- Experimentos de ablation: al ser un modelo pequeño y de arquitectura personalizada, es adecuado para comparar variantes de atención (GQDA frente a MHA o GQA estándar) y de activación (SwiGLU frente a GeLU).
- Generación de texto sintético a pequeña escala para pruebas de pipelines: útil para validar flujos de inferencia con transformers antes de escalar a modelos mayores.
- Pruebas de integración y CI: su reducido tamaño permite incluirlo en tests automatizados de extremo a extremo sin consumo relevante de recursos.

## Benchmarks y rendimiento

Resultados zero-shot publicados por el autor en la model card:

| Benchmark | Kanistra-2.8M-Base | Baseline aleatorio |
|---|---|---|
| ArithMark-3.0 | 32,80 % | 25,00 % |
| PIQA | 54,20 % | 50,00 % |
| HellaSwag | 28,40 % | 25,00 % |
| ARC-Easy | 25,96 % | 25,00 % |
| ARC-Challenge | 20,07 % | 25,00 % |

El modelo supera el baseline aleatorio en ArithMark-3.0, PIQA y HellaSwag, empata prácticamente en ARC-Easy y queda por debajo del azar en ARC-Challenge. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los pesos (2,8 M de parámetros); en la práctica, cualquier GPU consumer moderna o incluso CPU es suficiente.
- GPU recomendadas: no se requiere GPU dedicada; funciona en CPU y en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090, etc.).
- Cabe holgadamente en cualquier GPU consumer y en entornos embebidos.
- Opciones de despliegue: la librería declarada es transformers; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, y el formato de pesos no está especificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kanistra-2.8M-Base | 2,80 M | No disponible | Apache 2.0 | Arquitectura personalizada (MH-GQDA, SwiGLU), solo inglés |
| TinyStories (modelos de referencia) | ~1-10 M | No disponible | Varía | Entrenados en corpus sintético de cuentos; no comparables directamente en benchmarks estándar |
| Modelos tipo picoGPT / nanoGPT | < 1 M | No disponible | MIT / varias | Implementaciones educativas, sin evaluación formal publicada |

No se dispone de comparaciones directas con alternativas de la misma categoría en la información proporcionada; los modelos citados son referencias de escala, no comparaciones benchmark a benchmark.

## Limitaciones y advertencias

- Rendimiento muy próximo al azar en la mayoría de benchmarks de sentido común; no es apto para tareas de producción reales.
- Riesgo elevado de alucinación y de generación incoherente dado el reducido número de parámetros.
- Solo soporta inglés; no hay capacidades multilingües.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones multi-turno.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento del modelo hace inviable su uso en entornos productivos.
- No se documentan sesgos específicos, pero al entrenarse sobre FineWeb-Edu, Cosmopedia y TinyStories puede heredar sesgos de esas fuentes.
- El repositorio aparece con tamaño de 0.0 GB y sin descargas ni likes, lo que sugiere que los pesos podrían no estar disponibles o que el modelo es meramente experimental.
- No hay información sobre el proceso de entrenamiento (tokens, mezcla, alineación), lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/dhiiitraaa/Kanistra-2.8M-Base
- Dataset Cosmopedia-100k: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-100k
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SciQ: https://huggingface.co/datasets/allenai/sciq
