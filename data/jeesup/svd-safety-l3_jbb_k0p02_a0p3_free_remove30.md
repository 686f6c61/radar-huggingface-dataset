# Jeesup/svd-safety-l3_jbb_k0p02_a0p3_free_remove30

## Resumen
El modelo `Jeesup/svd-safety-l3_jbb_k0p02_a0p3_free_remove30` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM. Se trata de un artefacto experimental creado por el usuario Jeesup para estudiar cómo la compresión por descomposición en valores singulares (SVD) afecta al comportamiento de seguridad de un LLM y qué reglas de selección de componentes logran repararlo. El modelo tiene 8.030.261.248 parámetros según el archivo safetensors, aunque la model card indica que se eliminó el 30% de los parámetros densos (fracción resultante 0.6999) sin restaurar ningún componente SVD (presupuesto 0.0%). La arquitectura subyacente es un transformer decoder-only de tipo Llama 3, con una longitud de contexto no especificada en la información disponible, pero heredada del modelo base (habitualmente 8.192 tokens en Llama-3-8B-Instruct). Su relevancia radica en que cuantifica el trade-off entre compresión y seguridad: los resultados medidos muestran una tasa de éxito de ataque (ASR) de 0.1192 en AdvBench y 0.1470 en StrongREJECT, junto con una perplexity de 16.9185 en WikiText-2. No es un modelo de chat de propósito general, sino una celda de una cuadrícula experimental para investigación en seguridad e interpretabilidad.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) con compresión SVD-LLM |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Llama-3-8B-Instruct, típicamente 8.192 tokens) |
| Tipos de cuantización | No disponible; solo safetensors en precisión de 16 bits (16.1 GB) |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Llama 3, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención causal. Sobre esta base, se aplicó una compresión SVD-LLM que descompone las matrices de pesos en valores singulares y elimina componentes de baja magnitud. En concreto, se eliminó el 30.00% de los parámetros densos, lo que deja una fracción de 0.6999 respecto al modelo original. No se restauró ningún componente SVD (presupuesto de restauración 0.000%), y la regla de selección de componentes se etiqueta como `unknown`. El proceso se realizó con semilla 42.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO adicionales; se trata de un derivado post-hoc del modelo instruct original, sin fine-tuning posterior documentado. La innovación principal es el propio estudio de compresión y su impacto en la seguridad, no una mejora arquitectónica.

## Capacidades
- Generación de texto y respuesta a instrucciones, aunque degradada por la compresión (perplexity elevada de 16.9185 en WikiText-2).
- Razonamiento y conocimiento general heredados de Llama-3-8B-Instruct, pero con posible pérdida de calidad.
- Capacidad conversacional (etiqueta `conversational`), aunque la model card advierte que no es un asistente desplegable.
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües no disponibles en la información.
- Capacidad especial: servir como sujeto experimental para medir tasas de ataque (ASR) y sobre-rechazo.
- No tiene modo thinking, visión ni audio.

## Casos de uso
- Investigación en seguridad de LLMs: utilizar el modelo para medir la tasa de éxito de ataques (ASR) con AdvBench y StrongREJECT, comparando con el modelo base y otras celdas de la cuadrícula.
- Estudio de interpretabilidad: analizar qué componentes SVD eliminados afectan más a las salvaguardas, mediante ablaciones y análisis de valores singulares.
- Evaluación de sobre-rechazo: emplear WildGuard para cuantificar la macro over-refusal (0.1968) y estudiar si la compresión induce rechazos excesivos.
- Benchmarking de compresión: comparar la perplexity en WikiText-2 (16.9185) con otras técnicas de compresión o presupuestos de restauración.
- Reproducibilidad experimental: replicar la celda con semilla 42 y la regla de selección `unknown` para validar resultados en estudios de seguridad.
- Análisis de trade-off seguridad-utilidad: evaluar cómo la eliminación del 30% de parámetros afecta simultáneamente a la calidad del texto y a la resistencia a ataques.
- Docencia y divulgación: mostrar en cursos o charlas cómo la compresión de modelos puede degradar las protecciones de seguridad, usando métricas concretas.
- Comparación de reglas de selección: aunque esta celda usa la regla `unknown`, sirve como punto de referencia para comparar con otras reglas (por ejemplo, basadas en magnitud o en importancia para la seguridad).

## Benchmarks y rendimiento
| Métrica | Valor | Conjunto/Herramienta |
|---|---|---|
| ASR en AdvBench | 0.1192 | HarmBench judge |
| ASR en StrongREJECT | 0.1470 | HarmBench judge |
| Macro over-refusal | 0.1968 | WildGuard |
| Perplexity en WikiText-2 | 16.9185 | WikiText-2 |

No se proporcionan resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada: en fp16/bf16, los 8.030.261.248 parámetros ocupan aproximadamente 16 GB solo para pesos. Con activaciones y caché KV, se recomienda al menos 20-24 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: NVIDIA A100 (40 GB), H100 (80 GB), RTX 4090 (24 GB), RTX 3090 (24 GB). En GPUs de 24 GB puede cargarse en fp16 con longitud de contexto reducida.
- ¿Cabe en consumer GPU? Sí, en RTX 4090/3090 de 24 GB en fp16 con contexto limitado; en GPUs de 12-16 GB requeriría cuantización a 8 bits o 4 bits, pero no se proporcionan pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (librería indicada), text-generation-inference (tag), vLLM, llama.cpp u Ollama si se convierten los pesos a GGUF (no incluidos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (svd-safety-l3...) | 8.030.261.248 (según safetensors) | No disponible | Llama 3 | safetensors | Comprimido al 70% de parámetros densos, sin restauración |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens (típico) | Llama 3 | safetensors | Modelo base sin comprimir |
| Otros derivados comprimidos de Llama 3 | No disponible | No disponible | Llama 3 | No disponible | No se dispone de información |

## Limitaciones y advertencias
- No es un modelo de propósito general; es un artefacto de investigación explícitamente no desplegable como asistente.
- La compresión aumenta la tasa de éxito de ataques (ASR) según la model card; algunas celdas de la cuadrícula están deliberadamente degradadas en seguridad.
- Riesgo elevado de generar contenido inseguro o dañino; debe usarse solo en entornos controlados.
- La perplexity en WikiText-2 es alta (16.9185), lo que indica pérdida de calidad en la generación.
- Posible sobre-rechazo (macro over-refusal 0.1968) que puede afectar a la utilidad.
- No se documentan idiomas soportados; probablemente herede los de Llama 3, pero no está confirmado.
- Longitud de contexto no especificada; se asume la del modelo base (8.192 tokens), lo que limita conversaciones largas.
- Licencia Meta Llama 3 Community License: permite uso comercial bajo condiciones, pero impone restricciones (por ejemplo, atribución, políticas de uso aceptable). Es necesario revisar `LICENSE` y `USE_POLICY.md` en el repositorio.
- Sesgos y alucinaciones heredados de Llama-3-8B-Instruct, posiblemente exacerbados por la compresión.
- No se proporcionan pesos cuantizados, lo que limita el despliegue en hardware modesto sin conversión adicional.

## Enlaces
- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_jbb_k0p02_a0p3_free_remove30
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia (LICENSE en el repositorio): https://huggingface.co/Jeesup/svd-safety-l3_jbb_k0p02_a0p3_free_remove30/blob/main/LICENSE
- Política de uso (USE_POLICY.md en el repositorio): https://huggingface.co/Jeesup/svd-safety-l3_jbb_k0p02_a0p3_free_remove30/blob/main/USE_POLICY.md
- No se proporcionan otros enlaces (papers, blogs, repos) en la información disponible.
