# bambocher/Qwen3.5-0.8B-heretic-oQ3.5-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ3.5-mtp es una versión "descensurada" (decensored) y cuantizada del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario bambocher en Hugging Face. El modelo original lo desarrolla el equipo Qwen de Alibaba; esta variante aplica la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo y, posteriormente, una cuantización de precisión mixta con oQ (oMLX v0.7.3) orientada al ecosistema MLX de Apple Silicon. El checkpoint conserva la cabeza de predicción multi-token (MTP) intacta.

El modelo combina tres componentes: un modelo de lenguaje de 0,752B parámetros lógicos, un codificador de visión de 0,101B y una cabeza MTP de 0,020B, sumando 873.438.784 parámetros totales. La cuantización emplea un esquema afín por grupos de 64 pesos con mezcla de 3, 4, 5, 6 y 8 bits, más una fracción en BF16, resultando en una media efectiva de 5,494 bits por peso y un almacenamiento de 0,559 GiB.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible de ablación de comportamiento (ARA) sobre un modelo pequeño; por otro, ofrece una variante multimodal y de muy bajo peso optimizada para inferencia local en hardware Apple mediante MLX, con decodificación especulativa habilitada por la cabeza MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión) con cabeza MTP; derivado de Qwen3.5-0.8B |
| Parametros totales | 873.438.784 (0,873B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta afín por grupo de 64: 3, 4, 5, 6 y 8 bits, más BF16; media efectiva 5,494 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repositorio | 1,2 GB |
| Desglose de parametros | Lenguaje 0,752B; visión 0,101B; cabeza MTP 0,020B |
| Almacenamiento efectivo | 0,600 GB / 0,559 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-0.8B original: un transformer multimodal que integra un modelo de lenguaje y un codificador de visión, al que se añade una cabeza de predicción multi-token (MTP) destinada a decodificación especulativa. Esta variante no reentrena el modelo base; parte de los pesos publicados por Qwen y aplica dos transformaciones secuenciales.

La primera es una ablación de comportamiento mediante Heretic v2.0.0, que opera sobre las capas 1 a 19 (start_layer_index 1, end_layer_index 19) con parámetros ARA concretos: preserve_good_behavior_weight 0,8199, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 1,0547 y neighbor_count 14. El resultado declarado es una reducción de rechazos de 97/100 a 0/100, con una divergencia KL de 0,1412 respecto al modelo original. La segunda transformación es la cuantización mixta con oQ (oMLX v0.7.3), que asigna 3 bits al 44,419% de los pesos lógicos, 4 bits al 36,256%, 5 bits al 7,072%, 6 bits al 0,428%, 8 bits al 0,011% y mantiene el 11,815% en BF16. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: el checkpoint incluye un codificador visual de 0,101B parámetros, por lo que admite entradas de imagen.
- Decodificación especulativa mediante la cabeza MTP conservada (0,020B), que permite proponer varios tokens por paso.
- Comportamiento sin rechazos: según la model card, 0/100 rechazos frente a 97/100 del original, lo que habilita respuestas directas en dominios que el modelo base rechazaría.
- Inferencia optimizada para MLX en Apple Silicon.
- Soporte de tool calling, agentes, multilingüismo o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint de 0,559 GiB y el formato MLX permiten ejecutar el modelo en memoria unificada de equipos consumer, sin GPU dedicada, usando la librería mlx.
- Decodificación especulativa de bajo coste: la cabeza MTP intacta permite acelerar la generación en despliegues MLX que soporten esta técnica, reduciendo el número de pasos autorregresivos.
- Prototipado de aplicaciones multimodales ligeras: el codificador de visión integrado permite experimentar con tareas imagen-texto en un modelo de menos de 1B parámetros.
- Investigación sobre alineación y ablación de comportamiento: los parámetros ARA documentados y la métrica de rechazos permiten reproducir y comparar el efecto de Heretic sobre modelos pequeños.
- Generación de texto sin filtros en entornos de investigación: útil para estudiar sesgos, robustez y comportamiento del modelo en dominios sensibles, siempre con revisión humana.
- Evaluación de cuantización mixta: la distribución de bits publicada sirve como referencia para medir el impacto de esquemas de 3 a 8 bits en calidad y tamaño en modelos sub-1B.
- Base para fine-tuning ligero: el reducido tamaño facilita ajustes experimentales en hardware modesto, aunque la licencia no especificada debe verificarse antes de uso comercial.

## Benchmarks y rendimiento

| Métrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 0,559 GiB para los pesos cuantizados, más overhead de activaciones y contexto; el repositorio ocupa 1,2 GB.
- Cabe en GPUs consumer y en memoria unificada de Apple Silicon; el formato MLX está pensado específicamente para chips M-series.
- GPU recomendadas: no disponible; el despliegue objetivo es Apple Silicon con MLX, no CUDA.
- Opciones de despliegue: librería mlx y oMLX (oQ); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Cuantización | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic-oQ3.5-mtp | 0,873B | no disponible | Sí (visión) | Mixta 3-8 bits + BF16 (MLX) | no disponible |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | Sí (visión) | Original (BF16) | no disponible |
| Alternativas sub-1B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos (0/100) implica que el modelo puede generar contenido que el original bloquearía; requiere moderación externa en producción.
- La divergencia KL de 0,1412 respecto al original indica una desviación medible en la distribución de salida, con posible degradación en tareas sensibles a la alineación.
- Modelo de 0,873B parámetros: capacidad de razonamiento y conocimiento factual limitados frente a modelos mayores; riesgo elevado de alucinación en dominios especializados.
- La cuantización agresiva (44,419% de pesos a 3 bits) puede introducir pérdida de calidad adicional no cuantificada en la model card.
- Licencia no especificada: no se puede confirmar el uso comercial; debe verificarse la licencia del modelo base Qwen3.5-0.8B antes de cualquier despliegue.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y chino es incierto.
- Longitud de contexto no disponible.
- Formato MLX: no es portable a ecosistemas CUDA sin conversión.
- Repositorio con 47 descargas y 0 likes: validación comunitaria muy limitada; el autor recomienda volver a descargar tras la recuantización del 2026-11-12.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ3.5-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
