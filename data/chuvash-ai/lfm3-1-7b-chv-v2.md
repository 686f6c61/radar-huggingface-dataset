# chuvash-ai/LFM3-1.7B-chv-v2

## Resumen

LFM3-1.7B-chv-v2 es un modelo de traducción chuvasio-ruso desarrollado por la organización chuvash-ai, un proyecto dedicado a recursos abiertos para el chuvasio (чӑвашла), una lengua túrquica de bajos recursos con unos 800.000 hablantes. Se trata de un ajuste fino completo en bf16 sobre LiquidAI/LFM3-1.7B, un transformer híbrido de 1.728.801.536 parámetros que combina capas convolucionales y de atención. El modelo resuelve el problema de la traducción automática de calidad en un par de lenguas con escasez de datos paralelos, donde las alternativas clásicas como MarianMT obtienen resultados muy inferiores.

La relevancia del modelo radica en su rendimiento medido: alcanza 34,89 chrF++ en ruso→chuvasio y 35,10 chrF++ en chuvasio→ruso sobre un conjunto de test fijo de 500 frases con decodificación greedy, frente a 23,28 chrF++ del baseline MarianMT en ruso→chuvasio. El autor lo presenta como el mejor modelo de traducción ru↔chv disponible abiertamente. Se distribuye en safetensors (bf16) y GGUF, con licencia LFM Open License v1.0.

El modelo es un traductor de estilo completion: requiere alimentar un formato de prompt concreto y no está pensado para conversación general. Su entrenamiento se realizó en dos fases sobre una única RTX 4090, lo que lo convierte en un ejemplo de ajuste eficiente para lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido conv/attention (LFM3), código custom con `trust_remote_code` |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors) y GGUF (incluye Q4_K_M) |
| Idiomas soportados | chuvasio (chv) y ruso (ru) |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10 M USD de ingresos anuales, con atribución) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, una arquitectura híbrida que combina capas convolucionales con capas de atención, con 1.728.801.536 parámetros totales. El ajuste fino se realizó en bf16 a precisión completa sobre una sola RTX 4090, manteniendo el tokenizador base sin cambios. El proceso tuvo dos etapas: primero un entrenamiento continuado (CPT) con aproximadamente 93 millones de tokens de texto monolingüe en chuvasio durante 5.046 pasos (unas 9 horas), y después un ajuste supervisado (SFT) con aproximadamente 2,87 millones de pares de traducción en formato de instrucción durante 89.722 pasos (unas 20,4 horas).

Los datos de entrenamiento provienen del dataset chuvash-ai/chuvash-ru-parallel (1,46 millones de pares, principalmente el corpus CC0 de Alexander Antonov / Chuvash Language Laboratory y OPUS ChuBiCo) y de diccionarios chuvasio-rusos curados (diccionario de Sergeev, un frasebook y samahsar.chv.su). No se menciona uso de RLHF ni DPO. El formato de prompt de entrenamiento es una instrucción en ruso seguida del texto y la marca `Перевод:`, y el chat template incluido en el repositorio no coincide con ese formato, por lo que no debe usarse `apply_chat_template`.

## Capacidades

- Traducción ruso→chuvasio y chuvasio→ruso mediante formato de prompt de completion.
- Generación de texto condicionada por instrucción de traducción en ruso.
- Formato de prompt simétrico: `Переведи на чувашский язык.` para ru→chv y `Переведи на русский язык.` para chv→ru.
- Distribución GGUF con plantilla de chat específica para aplicaciones conversacionales, con la dirección controlada por el system prompt.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del par (chv y ru); no se declaran otros idiomas.
- No dispone de thinking mode ni de modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación oficial y administrativa entre ruso y chuvasio: el modelo permite procesar textos completos con el formato de prompt de completion y obtener salidas en bf16 con la máxima calidad medida (34,89–35,10 chrF++), adecuado para instituciones que necesitan publicar materiales bilingües.
- Localización de contenidos web y aplicaciones al chuvasio: integrable en pipelines de traducción por lotes mediante transformers con `trust_remote_code=True`, usando decodificación greedy para resultados reproducibles.
- Preservación y digitalización de patrimonio lingüístico: traducción de textos y materiales del chuvasio al ruso para su catalogación y estudio, aprovechando el entrenamiento sobre corpus CC0 y diccionarios curados.
- Despliegue en hardware modesto: la versión GGUF Q4_K_M permite servir traducción en equipos sin GPU de gran capacidad mediante llama.cpp o LM Studio, con una pérdida de calidad documentada de 2,6–4,9 chrF respecto a bf16.
- Herramientas de traducción para hablantes de chuvasio: aplicación de escritorio o móvil que use el GGUF con plantilla de chat y dirección controlada por system prompt, pensada para usuarios que necesitan traducciones rápidas ru↔chv.
- Investigación en NLP de bajos recursos: el modelo sirve como punto de partida y referencia para experimentos de ajuste fino en lenguas túrquicas minoritarias, con un protocolo de evaluación reproducible sobre 500 frases.
- Generación de subtítulos y transcripciones bilingües: traducción de diálogos o textos cortos entre ambos idiomas en flujos de postproducción, con la advertencia de revisar vocabulario no visto.

## Benchmarks y rendimiento

Resultados de chrF++ (sacrebleu, a nivel de corpus) sobre un conjunto de test fijo chuvasio-ruso, con protocolo idéntico para todas las filas (slice de 500 frases, decodificación greedy):

| Modelo | Motor | ru→chv | chv→ru |
|---|---|---:|---:|
| MarianMT baseline | — | 23,28 | no disponible |
| LFM3-1.7B-chv v2 (bf16) | transformers | 34,89 | 35,10 |
| LFM3-1.7B-chv v2 (Q4_K_M) | llama.cpp | 30,03 | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos (1,73 B parámetros × 2 bytes), más overhead de activaciones y contexto; se recomienda al menos 8 GB de VRAM para comodidad.
- GPU recomendadas: el entrenamiento se realizó en una RTX 4090; para inferencia bf16 es suficiente una GPU con 8–16 GB (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, tanto en bf16 como en GGUF Q4_K_M; la versión cuantizada reduce requisitos a unos 1,2–1,5 GB de pesos.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; llama.cpp y LM Studio mediante el GGUF; el repositorio GGUF incluye plantilla de chat para aplicaciones conversacionales.
- Latencia y throughput: no disponibles en la información proporcionada; el autor documenta tiempos de entrenamiento (9 h CPT y 20,4 h SFT en una RTX 4090) pero no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ru→chv (chrF++) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| LFM3-1.7B-chv-v2 (bf16) | 1,73 B | no disponible | 34,89 | LFM Open License v1.0 | HuggingFace (safetensors y GGUF) |
| MarianMT baseline | no disponible | no disponible | 23,28 | no disponible | no disponible |
| LFM3-1.7B-chv-v2 (Q4_K_M) | 1,73 B | no disponible | 30,03 | LFM Open License v1.0 | HuggingFace (GGUF) |

No se dispone de datos de otros modelos comparables de traducción ru↔chv en la información proporcionada.

## Limitaciones y advertencias

- El vocabulario no visto es el punto débil: en una prueba con palabras de diccionario el modelo falla por completo en aproximadamente el 40 % de las palabras no vistas y a veces copia el texto fuente literalmente.
- Los datos paralelos están parcialmente alineados de forma automática; se espera un 2–5 % de pares ruidosos, lo que puede introducir errores en la salida.
- El modelo está entrenado para traducción ru↔chv; la capacidad de chat general no fue un objetivo y no debe esperarse.
- El chat template incluido en el repositorio no coincide con el formato de entrenamiento; no debe usarse `apply_chat_template` con este modelo.
- La cuantización Q4_K_M pierde entre 2,6 y 4,9 chrF respecto a bf16, más que en transformers densos habituales; para evaluación y benchmarking debe usarse bf16.
- Licencia LFM Open License v1.0: uso comercial permitido solo por debajo de 10 M USD de ingresos anuales, con requisitos de atribución.
- Riesgo de alucinación y de copia literal en terminología especializada o neologismos; se recomienda revisión humana en producción.
- No se declaran sesgos específicos en la información disponible, aunque al entrenar sobre corpus y diccionarios concretos puede heredar sesgos de esas fuentes.
- El modelo requiere `trust_remote_code=True` por el código custom de la arquitectura LFM3, lo que implica ejecutar código del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2
- Versión GGUF: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset de pares paralelos: https://huggingface.co/datasets/chuvash-ai/chuvash-ru-parallel
- Organización chuvash-ai: https://huggingface.co/chuvash-ai
