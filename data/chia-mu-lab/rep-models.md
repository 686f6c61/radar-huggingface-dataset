# Chia-Mu-Lab/REP-models

## Resumen

REP-models es un conjunto de seis checkpoints derivados de Qwen2.5-7B-Instruct, publicados por Chia-Mu-Lab junto con el artículo "Hidden Thoughts Are Not Secret: Reasoning-Trace Exposure in LLMs" (EMNLP 2026, arXiv:2606.00642). El objetivo es estudiar cómo las trazas de razonamiento internas de modelos de mayor tamaño (Qwen3-14B y Qwen3-32B) pueden exponerse mediante técnicas de prompting y utilizarse como supervisión para destilar modelos más pequeños. Cada checkpoint es un fine-tuning completo del modelo base sobre uno de los corpus del dataset Chia-Mu-Lab/REP-datasets.

La relevancia de este trabajo radica en que demuestra que las trazas de razonamiento expuestas por prompting pueden igualar o superar a las trazas internas reales como señal de destilación en tareas matemáticas, lo que tiene implicaciones tanto para la mejora de modelos como para la seguridad (posible extracción de información no pública). El repositorio contiene variantes "clean" (solo filas con respuesta correcta) y "original" (todas las filas estructuralmente válidas), además de dos modelos "oracle" que usan trazas internas no expuestas como límite superior de referencia.

Todos los modelos son de 7B parámetros, con arquitectura transformer decoder-only heredada de Qwen2.5-7B-Instruct, y se distribuyen bajo licencia Apache 2.0. El tamaño total del repositorio es de 182.8 GB, lo que sugiere que cada checkpoint ocupa aproximadamente 30 GB en precisión completa (FP16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-7B-Instruct) |
| Parametros totales | 7B (aprox., no se especifica el valor exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, pero no se indica) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los seis modelos son fine-tunings completos de Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal y mecanismos de GQA (grouped query attention) y SwiGLU, aunque estos detalles no se repiten en la documentación del repositorio. La técnica REP (Reasoning-Trace Exposure) consiste en inducir al modelo profesor (Qwen3-14B o Qwen3-32B) a exponer sus trazas de razonamiento internas mediante prompts específicos, sin necesidad de acceso a los pesos internos. Esas trazas expuestas se usan como supervisión para entrenar al estudiante de 7B mediante fine-tuning supervisado (SFT) estándar.

El dataset de entrenamiento se divide en dos variantes: "clean" (solo se conservan las filas donde la respuesta final es correcta) y "original" (se mantienen todas las filas estructuralmente válidas, independientemente de la corrección). Además, los modelos "oracle" se entrenan con las trazas internas reales del profesor (no expuestas por prompting), que actúan como límite superior de rendimiento para comparar la calidad de la supervisión. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores.

## Capacidades

- Razonamiento matemático avanzado: mejora significativa en benchmarks como MATH500, AIME24, AIME25 y JEE-Math respecto al modelo base.
- Generación de código: resultados en LiveCodeBench superiores al modelo base en la mayoría de variantes.
- Razonamiento multi-paso: al heredar la arquitectura de Qwen2.5-7B-Instruct, mantiene la capacidad de generar cadenas de razonamiento extensas.
- Soporte de tool calling: no se menciona en la documentación; probablemente no está habilitado.
- Soporte de agentes: no se indica; el modelo está orientado a razonamiento estático.
- Capacidades multilingües: solo inglés (language: en).
- Capacidades especiales: no incluye visión ni audio; es exclusivamente texto.

## Casos de uso

- Investigación en destilación de modelos: sirve como referencia para estudiar cómo las trazas de razonamiento expuestas afectan al rendimiento del estudiante, comparando las variantes clean/original y oracle.
- Evaluación de técnicas de extracción de razonamiento: permite analizar si las trazas expuestas por prompting son equivalentes a las internas en términos de calidad de supervisión.
- Benchmark de razonamiento matemático: puede utilizarse como modelo de 7B competitivo en tareas de matemáticas y código, con resultados que superan al base en varios conjuntos.
- Entrenamiento de modelos más pequeños: las trazas generadas por este modelo pueden servir como datos de destilación para modelos de 1-3B.
- Estudios de seguridad y privacidad: al demostrar que las trazas internas son extraíbles, este trabajo es útil para evaluar defensas contra la exposición de razonamiento.
- Prototipado rápido de aplicaciones de razonamiento: al ser de 7B, puede desplegarse en GPUs consumer con cuantización, aunque no se proporcionan configuraciones específicas.

## Benchmarks y rendimiento

La tabla siguiente reproduce los resultados del paper (protocolo n=3, T=0.5; JEE-Math se evalúa con criterio estricto/parcial). Se comparan las seis variantes con el modelo base.

| Modelo | MATH500 | AIME24 | AIME25 | JEE-Math (estricto/parcial) | LiveCodeBench |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 71.0 | 8.9 | 2.2 | 32.2 / 35.9 | 15.8 |
| rep-q3_14b-clean | 75.8 | 14.4 | 13.3 | 35.2 / 39.5 | 19.0 |
| rep-q3_14b-original | 72.4 | 12.2 | 13.3 | 33.5 / 38.9 | 18.3 |
| rep-q3_32b-clean | 72.8 | 14.4 | 17.8 | 36.4 / 41.1 | 15.8 |
| rep-q3_32b-original | 73.9 | 13.3 | 13.3 | 38.1 / 42.3 | 16.5 |
| oracle-q3_14b | 70.3 | 14.4 | 13.3 | 48.5 / 51.2 | 14.7 |
| oracle-q3_32b | 70.0 | 16.7 | 15.6 | 46.4 / 49.3 | 15.8 |

Los resultados muestran que las variantes REP superan al modelo base en la mayoría de métricas, y en algunos casos (AIME25, JEE-Math) igualan o superan a los oráculos, lo que respalda la tesis del paper.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la documentación.
- Al ser un modelo de 7B parámetros, la inferencia en FP16 requiere aproximadamente 14 GB de VRAM; con cuantización INT8 (~7 GB) o INT4 (~4 GB) puede ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o incluso en Mac con Apple Silicon.
- Para fine-tuning adicional se necesitarían GPUs con mayor memoria (A100 40/80 GB o H100) o técnicas como LoRA.
- Opciones de despliegue: al ser safetensors, es compatible con vLLM, TGI, llama.cpp (con conversión a GGUF) y Ollama (mediante importación manual).
- Latencia y throughput: no se indican valores; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Qwen2.5-7B-Instruct, ya que es el punto de partida. También se pueden considerar otros modelos de 7B destilados para razonamiento, aunque no se dispone de datos en la información proporcionada.

| Modelo | Params | Contexto | MATH500 | AIME24 | AIME25 | Licencia |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct | 7B | 128K (no confirmado en repo) | 71.0 | 8.9 | 2.2 | Apache 2.0 |
| REP q3_14b-clean | 7B | no disponible | 75.8 | 14.4 | 13.3 | Apache 2.0 |
| REP q3_32b-clean | 7B | no disponible | 72.8 | 14.4 | 17.8 | Apache 2.0 |
| Oracle q3_32b | 7B | no disponible | 70.0 | 16.7 | 15.6 | Apache 2.0 |

No se dispone de información sobre otros modelos comparables en la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para tareas multilingües.
- Es un artefacto de investigación; no se ha evaluado su seguridad ni robustez para uso en producción.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-7B-Instruct.
- Los datos de entrenamiento provienen de modelos open-weight, pero no se detalla la composición exacta ni posibles sesgos.
- Las variantes "original" incluyen filas con respuestas incorrectas, lo que puede degradar la calidad en algunos escenarios.
- No se proporcionan configuraciones de cuantización ni guías de despliegue; el usuario debe adaptar el modelo a su infraestructura.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un lanzamiento reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chia-Mu-Lab/REP-models
- Paper arXiv: https://arxiv.org/abs/2606.00642
- Código: https://github.com/0x-yuan/REP
- Dataset de entrenamiento: https://huggingface.co/datasets/Chia-Mu-Lab/REP-datasets
- Checkpoint adicional (destilación desde Gemini 3.5 Flash): https://huggingface.co/Chia-Mu-Lab/qwen25-7b-ot-rep-gemini-3.5-flash
