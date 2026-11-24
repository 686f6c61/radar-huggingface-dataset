# NotCherry/LFM3-1.7B-ThinkExit-GGUF

## Resumen
LFM3-1.7B ThinkExit es un artefacto de investigación publicado en Hugging Face por el usuario NotCherry, consistente en una edición de pesos en espacio de pesos (weight-space programming) aplicada sobre el checkpoint cuantizado AtomicChat/LFM3-1.7B-Uncensored-GGUF, que a su vez deriva del modelo LiquidAI/LFM3-1.7B. El objetivo no es añadir conocimiento nuevo, sino calibrar el momento en que el modelo abandona su fase de razonamiento y emite la respuesta final, modificando únicamente la fila del token `</think>` (ID 124902) en la cabeza de salida.

La intervención es training-free: no hay entrenamiento por gradientes, ni LoRA, ni ajuste adicional. Se copia el tensor de embedding de entrada (que en el GGUF original está atado a la proyección de salida) en un `output.weight` explícito y se escalan ocho block scales Q6_K de la fila correspondiente a `</think>` por un factor de 1.50. El resultado es un GGUF autónomo en cuantización mixta Q4_K_M con la cabeza copiada en Q6_K, que ocupa aproximadamente 1,3 GB e incluye 1.990.945.600 parámetros almacenados (frente a los ~1,73B del original, por la duplicación de la cabeza).

Es relevante ahora porque ejemplifica una técnica emergente de bajo coste para modificar el comportamiento de modelos pequeños sin reentrenar, y porque el autor publica una evaluación pareada honesta que reconoce que las mejoras son estadísticamente no concluyentes y con un coste del 29,2% más de tokens generados. No es un lanzamiento oficial de Liquid AI ni de AtomicChat, y hereda la ablación de seguridad del checkpoint intermedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone LFM3 de LiquidAI/LFM3-1.7B); edición en espacio de pesos sobre la cabeza de salida |
| Parametros totales | 1.990.945.600 (incluye cabeza duplicada; el original almacena ~1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M mixta; cabeza copiada en Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (standalone, con `output.weight` explícito) |

## Arquitectura y entrenamiento
El modelo parte del backbone LFM3-1.7B de Liquid AI y del checkpoint cuantizado AtomicChat/LFM3-1.7B-Uncensored-GGUF. La edición consiste en desatar el embedding de entrada de la proyección de salida: se copia el tensor atado a un `output.weight` explícito, se preserva intacto el embedding de entrada y el backbone, y se escalan únicamente ocho block scales Q6_K de la fila del token `</think>` (ID 124902) por 1.50. Solo 10 bytes de esa fila copiada difieren del origen; el resto de filas de salida quedan sin cambios. El coste de almacenamiento es de unos 215 MB extra y 262.144.000 valores adicionales, en su mayoría duplicados.

No hubo entrenamiento de ningún tipo: ni gradientes, ni LoRA, ni conocimiento adicional. La hipótesis es de "calibración de completado": forzar una transición más puntual entre razonamiento y respuesta final. La inspiración es el artículo Weight-Space Programming, aunque la intervención específica descrita allí (para Qwen) no se aplicó directamente a LFM3. El checkpoint fuente ya incorpora la ablación de seguridad y la cuantización de AtomicChat, por lo que este release hereda esos cambios. Ediciones más agresivas (3x y 4x) provocaron bucles en el token de cierre y fueron descartadas.

## Capacidades
- Generación de texto conversacional en inglés, con modo de razonamiento (thinking) activable.
- Razonamiento matemático: evaluación propia en GSM8K y MATH-500 con puntuaciones del 92,19% y 91,41% respectivamente.
- Generación de código: evaluación en HumanEval con pass@1 del 94,51% en modo chat.
- Seguimiento de instrucciones: IFEval con métrica estricta de prompt al 92,71%.
- Razonamiento de sentido común y elección múltiple: ARC-Challenge (88,67%) y BoolQ (87,50%).
- Gestión del token de cierre de razonamiento `</think>` mediante edición de pesos, sin reentrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo thinking con transición calibrada; sin visión ni audio.

## Casos de uso
- Investigación sobre weight-space programming: el artefacto sirve como caso reproducible para estudiar cómo una edición de 10 bytes en una fila de salida altera el comportamiento de parada del razonamiento, con evaluación pareada publicada.
- Evaluación de calibración de thinking en modelos pequeños: útil para medir el equilibrio entre precisión y coste de tokens en tareas de matemáticas (GSM8K, MATH-500) con presupuesto fijo de 16.384 tokens generados.
- Prototipado de asistentes conversacionales en inglés sobre hardware modesto: al ser un GGUF Q4_K_M de ~1,3 GB, puede desplegarse en entornos con poca VRAM para pruebas de concepto de chat multi-turno.
- Generación de código en pipelines de evaluación: con pass@1 del 94,51% en HumanEval, puede integrarse en pruebas de regresión de generación de código, siempre con validación humana dada la naturaleza experimental.
- Clasificación y respuesta a preguntas de opción múltiple: los resultados en ARC-Challenge y BoolQ permiten usarlo en tareas de QA con formato de elección generada, útil para benchmarks internos.
- Estudio de ablación de seguridad: al heredar el checkpoint "Uncensored" de AtomicChat, permite analizar el impacto de la eliminación de rechazos en modelos pequeños, con las advertencias éticas correspondientes.
- Docencia y divulgación: ejemplo didáctico de cómo modificar un GGUF sin reentrenar, incluyendo la duplicación de cabeza y el coste de almacenamiento asociado.

## Benchmarks y rendimiento

Comparación pareada frente a una edición experimental previa (tied 2.00), misma runtime llama.cpp/CUDA, thinking activado, 16.384 tokens generados, temperature 0.1, top-k 50, top-p 1.0, repetition penalty 1.1 y semillas emparejadas:

| Benchmark | Edición previa tied 2.00 | Esta edición output-only 1.50 |
|---|---:|---:|
| GSM8K · 192 preguntas | 175/192 · 91,15% | 177/192 · 92,19% |
| MATH-500 · 128 preguntas | 115/128 · 89,84% | 117/128 · 91,41% |
| IFEval · 192 prompts, métrica estricta | 176/192 · 91,67% | 178/192 · 92,71% |

Intervalos de confianza pareados al 95% del cambio de precisión: GSM8K −2,6 a +4,7 pp; MATH-500 −4,7 a +7,8 pp; IFEval −3,1 a +5,2 pp. Todos incluyen cero. Tokens generados totales: 1.105.811 → 1.428.701 (+29,2%).

Comparación cruzada frente al GGUF original descargado (AtomicChat), mismos prompts, runtime y semillas:

| Benchmark | GGUF original | Esta edición 1.50 |
|---|---:|---:|
| HumanEval · 164 tareas, chat pass@1 | 153/164 · 93,29% | 155/164 · 94,51% |
| ARC-Challenge · 256 preguntas | 212/256 · 82,81% | 227/256 · 88,67% |
| BoolQ · 256 pasajes | 216/256 · 84,38% | 224/256 · 87,50% |

Cambios pareados: HumanEval +1,22 pp [−1,83, +4,27], p = 0,6875; ARC-Challenge +5,86 pp [+2,34, +9,38]. No se han publicado resultados en leaderboards independientes.

## Requisitos de hardware
- VRAM estimada para inferencia: en torno a 1,5-2 GB con Q4_K_M, más overhead de contexto; el repo ocupa 1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo no aprovecha el hardware de gama alta.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más, e incluso en CPU.
- Opciones de despliegue: llama.cpp (runtime usado en la evaluación), Ollama y otros runners compatibles con GGUF; vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles de forma explícita; la evaluación reporta 1.428.701 tokens generados en el conjunto de pruebas, con un incremento del 29,2% respecto a la edición previa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B ThinkExit (este) | 1,99B almacenados | No disponible | lfm-open-license-v1.0 | GGUF Q4_K_M | Edición experimental training-free |
| AtomicChat/LFM3-1.7B-Uncensored-GGUF | ~1,73B | No disponible | No disponible | GGUF | Checkpoint fuente, con ablación de seguridad |
| LiquidAI/LFM3-1.7B | ~1,7B | No disponible | lfm-open-license-v1.0 | No disponible | Modelo oficial base |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento se limita a las tablas pareadas de la sección anterior.

## Limitaciones y advertencias
- Las mejoras sobre la edición previa son estadísticamente no concluyentes: todos los intervalos de confianza al 95% incluyen cero y la ganancia neta es de 2 respuestas correctas por benchmark.
- Coste de generación: +29,2% de tokens generados, lo que encarece la inferencia y puede agotar presupuestos de contexto en producción.
- Hereda la ablación de seguridad de AtomicChat: no restaura rechazos y puede producir contenido no filtrado; requiere moderación externa.
- Solo inglés declarado; sin soporte multilingüe verificado.
- Riesgo de alucinación inherente a un modelo de 1,7B, agravado por la eliminación de rechazos.
- Ediciones más agresivas (3x, 4x) provocaron bucles en el token de cierre; el margen de escalado es estrecho.
- Artefacto de investigación, no un lanzamiento oficial de Liquid AI ni de AtomicChat; no apto para producción sin validación propia.
- Licencia lfm-open-license-v1.0: revisar términos de uso comercial antes de desplegar.
- Evaluaciones realizadas sobre subconjuntos, no sobre benchmarks completos, y con un único runtime (llama.cpp/CUDA).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/NotCherry/LFM3-1.7B-ThinkExit-GGUF
- Modelo base intermedio: https://huggingface.co/AtomicChat/LFM3-1.7B-Uncensored-GGUF
- Modelo upstream: https://huggingface.co/LiquidAI/LFM3-1.7B
- Artículo Weight-Space Programming: https://rikiyat.github.io/blog/weight-space-programming/
- Licencia: LICENSE (incluida en el repositorio de Hugging Face)
