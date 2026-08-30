# meforce/CetinLM-1B-Base

## Resumen

CetinLM-1B-Base es un modelo de lenguaje causal (decoder-only Transformer) entrenado desde cero por el equipo de Me Force Technology, bajo el paraguas del proyecto de investigación CetinLM. El modelo se presenta como una plataforma de investigación para estudiar cómo la disciplina en arquitectura, datos, ingeniería de sistemas, diagnóstico y post-entrenamiento puede mejorar un modelo antes de recurrir al aumento de escala. Con aproximadamente 1.049 mil millones de parámetros, está diseñado para ser lo suficientemente pequeño como para inspeccionarse en profundidad, pero lo bastante grande como para que emerjan comportamientos lingüísticos reales.

El proyecto se encuentra en fase de pretraining activo: al momento de la última actualización (30 de agosto de 2026) había procesado 598 millones de tokens de un objetivo inicial de 1.000 millones, alcanzando una pérdida de validación de 3,622 y una perplejidad de 37,41. Los pesos no han sido liberados y la inferencia alojada está deshabilitada; se trata de una vista previa de investigación, no de un asistente instruido. La relevancia actual reside en su enfoque metódico de entrenamiento en una sola GPU (RTX 4070 Ti SUPER 16 GB), lo que lo convierte en un caso de estudio para la reproducción de pipelines de entrenamiento eficientes en hardware accesible.

El modelo soporta 24 idiomas, incluyendo inglés, español, francés, alemán, turco, ruso, chino, japonés y coreano, entre otros. Su arquitectura incorpora Grouped-Query Attention (GQA), RoPE y SwiGLU, y está entrenado en precisión BF16. Aunque el proyecto declara como objetivos futuros el fine-tuning para chat, razonamiento y código, el checkpoint actual es exclusivamente un modelo base en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer causal con GQA, RoPE y SwiGLU |
| Parametros totales | 1.048.780.544 (1,049 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 (configurado como máximo; secuencia de entrenamiento actual: 256) |
| Tipos de cuantizacion | no disponible (no se han publicado pesos) |
| Idiomas soportados | en, tr, de, fr, es, pt, it, nl, pl, ru, uk, ar, fa, hi, bn, ur, id, vi, th, zh, ja, ko (24 idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos no liberados; se espera safetensors, no confirmado) |

## Arquitectura y entrenamiento

CetinLM-1B es un transformer decoder-only causal entrenado desde cero. La configuración incluye 20 capas, un tamaño oculto de 1.792, 28 cabezas de consulta y 7 cabezas de clave/valor (GQA con factor de reducción 4), dimensión de cabeza de 64 y un tamaño intermedio de MLP de 7.168. El vocabulario comprende 65.536 tokens. La codificación posicional usa RoPE (Rotary Position Embeddings) con un valor de theta que no se ha especificado en la información disponible.

El entrenamiento se realiza en precisión BF16 con AdamW de 8 bits, utilizando gradient checkpointing y una estrategia de actualizaciones presupuestadas por tokens. El corpus se construye mediante un pipeline propio que incluye tokenizador, construcción de corpus y fragmentación en shards binarios. Hasta el snapshot del 30 de agosto de 2026, el modelo había procesado 598.016.000 tokens (~59,8% del objetivo de 1 billón) en 73.000 pasos, con una pérdida de validación de 3,622 y una perplejidad de 37,41. El throughput sostenido observado es de aproximadamente 5.600 tokens por segundo en una única RTX 4070 Ti SUPER de 16 GB.

El proyecto contempla una hoja de ruta posterior al pretraining que incluye continuación del entrenamiento, extensión de contexto, fine-tuning supervisado (SFT), chat, razonamiento y código, así como la integración de caché KV y runtime de inferencia. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Modelo de lenguaje base: capacidad de modelado de lenguaje causal sobre texto multilingüe, sin fine-tuning para tareas específicas.
- Multilingüismo: entrenado con una mezcla de 24 idiomas, lo que debería permitir generación y comprensión básica en esas lenguas, aunque no se han publicado evaluaciones específicas.
- Arquitectura eficiente: GQA y RoPE reducen el coste de atención y permiten longitudes de contexto moderadas (4.096 tokens configurados).
- Diseñado para investigación: el checkpoint actual no es un asistente; no soporta tool calling, agentes, razonamiento multi-paso ni modos de pensamiento explícitos.
- No se han publicado capacidades de visión, audio u otras modalidades; es exclusivamente texto.
- La inferencia alojada está deshabilitada y los pesos no están disponibles, por lo que no se puede verificar empíricamente ninguna capacidad en este momento.

## Casos de uso

Dado que el modelo se encuentra en fase de pretraining y no tiene pesos liberados, los casos de uso son prospectivos y dependen de la finalización del entrenamiento y la publicación de checkpoints. No obstante, el proyecto declara un objetivo orientado a despliegue en hardware accesible, lo que sugiere los siguientes escenarios una vez completado:

- Investigación en eficiencia de entrenamiento: el pipeline documentado (entrenamiento en una sola GPU, presupuesto de tokens, diagnóstico científico) sirve como referencia para equipos que deseen reproducir o comparar metodologías de entrenamiento desde cero.
- Evaluación de modelos base multilingües: una vez liberados los pesos, investigadores podrían evaluar su comportamiento en tareas de modelado de lenguaje en los 24 idiomas soportados, comparando con otros modelos de ~1B.
- Fine-tuning para tareas específicas: al ser un modelo base, podría adaptarse mediante SFT para clasificación de texto, generación de contenido o análisis de sentimiento en entornos con recursos limitados.
- Entrenamiento de asistentes de chat o código: la hoja de ruta del proyecto incluye fases posteriores de SFT, chat y código; si se completan, el modelo podría servir como base para asistentes ligeros desplegables en CPU o GPU de gama media.
- Estudio de la relación entre arquitectura, datos y rendimiento: el proyecto busca exponer qué factores mejoran realmente el aprendizaje, lo que podría orientar decisiones de diseño en modelos pequeños.
- Prototipado de aplicaciones multilingües en hardware de consumo: dada su orientación a RTX 4070 Ti SUPER, el modelo final podría ejecutarse en GPUs de 16 GB o menos, permitiendo prototipos locales sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento reportados son métricas de entrenamiento: pérdida de validación de 3,622 y perplejidad de 37,41 a 598 millones de tokens procesados. No hay resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia, un modelo de 1,049 B parámetros en BF16 ocupa aproximadamente 2,1 GB solo en pesos; con caché KV y overhead de runtime, se estima que podría caber en una GPU de 6-8 GB, pero esto es una estimación no confirmada.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA RTX 4070 Ti SUPER de 16 GB. Para inferencia, se espera compatibilidad con GPUs de gama media (RTX 3060, RTX 4060, etc.) y potencialmente CPU con cuantización, aunque no hay datos oficiales.
- Si cabe en consumer GPU: probablemente sí, dado el tamaño de parámetros, pero no confirmado.
- Opciones de despliegue: no disponibles hasta que se liberen los pesos. El proyecto menciona planes para integración con runtime y caché KV, pero no especifica vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Durante el entrenamiento se observaron ~5,6K tokens/s en una sola GPU, pero esto corresponde al proceso de entrenamiento, no a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| CetinLM-1B-Base | 1,049 B | 4.096 (config) | Transformer causal, GQA, RoPE, SwiGLU | no disponible | En pretraining, pesos no liberados |
| TinyLlama-1.1B | 1,1 B | 2.048 | Transformer causal, GQA, RoPE | Apache 2.0 | Completo, pesos disponibles |
| Qwen2.5-1.5B | 1,5 B | 32.768 | Transformer causal, GQA, RoPE, SwiGLU | Apache 2.0 | Completo, pesos disponibles |
| Gemma-2-2B | 2,6 B | 8.192 | Transformer causal, GQA, RoPE | Gemma License | Completo, pesos disponibles |

No se dispone de resultados de rendimiento comparables para CetinLM-1B, por lo que la comparación se limita a características arquitectónicas y de disponibilidad. Los modelos alternativos listados son opciones maduras con pesos públicos y licencias permisivas, mientras que CetinLM es un proyecto en desarrollo sin liberación pública.

## Limitaciones y advertencias

- Modelo en entrenamiento: el checkpoint actual no representa un modelo final; los pesos no están liberados y la inferencia está deshabilitada, por lo que no puede utilizarse en producción ni evaluarse de forma independiente.
- Sin licencia definida: la ausencia de licencia impide cualquier uso legal del modelo incluso si los pesos se publicaran; se debe contactar con los autores antes de cualquier utilización.
- Sin fine-tuning: es un modelo base sin instrucciones, por lo que no es adecuado para tareas de conversación, generación de código o razonamiento complejo sin un proceso de adaptación posterior.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje entrenado en datos web multilingües, es esperable que presente sesgos presentes en el corpus y riesgo de generar información falsa; no se han realizado evaluaciones de sesgo ni de seguridad.
- Longitud de contexto limitada: la secuencia de entrenamiento actual es de 256 tokens, aunque el máximo configurado es de 4.096; no se ha demostrado un buen comportamiento en ventanas largas.
- Sin garantías de rendimiento: los valores de pérdida y perplejidad son instantáneas de un entrenamiento en curso y no implican calidad en tareas downstream.
- Ausencia de benchmarks: no hay datos que permitan comparar el modelo con alternativas establecidas; cualquier afirmación de capacidad es especulativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meforce/CetinLM-1B-Base
- Repositorio GitHub: https://github.com/xertxetin/CetinLM
- README del repositorio: https://github.com/xertxetin/CetinLM/blob/main/README.md
- Publicación en X del autor: https://x.com/xertxetin/status/2093427429129797633
