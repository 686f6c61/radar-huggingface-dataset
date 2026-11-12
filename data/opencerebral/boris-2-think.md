# opencerebral/Boris-2-Think

## Resumen

Boris-2-Think es un modelo de lenguaje causal de 144 millones de parámetros desarrollado por OpenCerebral, obtenido mediante fine-tuning del modelo base Boris-2 (entrenado desde cero sobre 200.040 millones de tokens en una única NVIDIA V100). Su particularidad es que ha sido ajustado para emitir una traza de razonamiento corta dentro de etiquetas `<think>` antes de proporcionar una respuesta final, siguiendo el formato `Final answer:`. No es un asistente conversacional general, sino un modelo de pregunta-respuesta especializado.

El ajuste se realizó sobre OpenThink, un conjunto de destilación de 43.000 trazas de razonamiento cortas (mediana de unos 115 tokens) generadas por un modelo mayor (MiMo-v2.6-flash) y filtradas por auto-consistencia: solo se conservan las preguntas en las que dos resoluciones independientes llegan a la misma respuesta final. El entrenamiento completo requirió aproximadamente 5 minutos en una sola V100 de 32 GB, lo que lo convierte en un ejemplo de pipeline de razonamiento reproducible con recursos mínimos.

Su relevancia radica en que demuestra que el fine-tuning sobre trazas de razonamiento mejora el rendimiento en tareas de razonamiento y ciencia en modelos por debajo de 150M de parámetros (ARC-Easy +4,2 puntos, ARC-Challenge +2,8, ArithMark-3 +4,1, SciQ +2,0), sin degradar tareas de sentido común como HellaSwag o PIQA. Se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), código personalizado en PyTorch |
| Parámetros totales | 144.192.782 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con filas empaquetadas de 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, evaluación en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Boris-2-Think es un transformer causal de 144M de parámetros construido sobre Boris-2, un modelo entrenado desde cero con 200.040 millones de tokens en una única NVIDIA V100. La implementación utiliza código personalizado de PyTorch (`trust_remote_code=True`), sin dependencias adicionales y sin caché KV. Los turnos de conversación siguen el formato ChatML escrito como texto plano, sin tokens añadidos al vocabulario; el token de cierre `<|im_end|>` abarca varios tokens y no es un token de fin de secuencia, por lo que debe pasarse como cadena de parada.

El fine-tuning empleó la receta híbrida de OpenThink: 42.301 filas de entrenamiento (800 reservadas para validación) con el formato `user question` → `<think>\n{razonamiento}\n</think>\n\nFinal answer: {respuesta}`. La pérdida se calculó únicamente sobre la respuesta del asistente y su `<|im_end|>` de cierre. Se realizaron 2 épocas y 404 pasos, con 16 filas empaquetadas de 2048 tokens por paso, optimizador AdamW con learning rate 5e-5, betas (0,9, 0,95), sin weight decay, grad clipping de 1,0 y schedule de warmup lineal con decaimiento coseno hasta cero. La pérdida en validación pasó de 1,932 antes del fine-tuning a 0,685 después.

OpenThink se generó con un modelo que escribe preguntas verificables a partir de una rejilla de seis categorías (cuantitativa, lógica cotidiana, deducción, trazado de código, causa-efecto e inferencia lectora) y un segundo modelo que las resuelve dos veces en un máximo de unas 120 palabras, conservando solo las preguntas con respuesta final coincidente. En la receta híbrida, las filas de causa-efecto e inferencia lectora conservan solo la respuesta final (bloque `<think>` vacío), ya que una ablación previa mostró que las trazas ayudan en aritmética y preguntas multi-paso pero perjudican ligeramente las tareas de sentido común. Se aplicó descontaminación por n-gramas (13, 10 y 8 palabras) contra las particiones de evaluación de ARC, HellaSwag, SciQ, OpenBookQA, WinoGrande y PIQA, y contra los 1.000 ítems de ArithMark-3, sin coincidencias detectadas.

## Capacidades

- Generación de texto causal y respuesta a preguntas con traza de razonamiento explícita en etiquetas `<think>`.
- Razonamiento aritmético y multi-paso de corta longitud (mediana de traza de unos 115 tokens).
- Razonamiento científico y de sentido común (ARC-Easy, ARC-Challenge, SciQ).
- Trazado de código y deducción lógica dentro de las categorías de OpenThink.
- Respuesta con formato estructurado: `<think>…</think>` seguido de una línea `Final answer:`.
- Decodificación greedy recomendada para razonamientos cortos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso largo: no disponible.
- Capacidades multilingües: solo inglés.
- Modo thinking: sí, mediante etiquetas `<think>` que las interfaces de chat pueden ocultar o plegar.
- Visión y audio: no disponible.

## Casos de uso

- Resolución de problemas aritméticos escolares: el modelo descompone operaciones paso a paso dentro de `<think>` y emite la respuesta final, útil en entornos educativos con recursos de cómputo limitados.
- Clasificación y respuesta a preguntas de ciencia en inglés: adecuado para pipelines de evaluación automática o generación de material de estudio donde se requiere justificación breve.
- Trazado de código simple: puede seguir la ejecución de fragmentos cortos y explicar el resultado, útil como componente didáctico o de verificación en herramientas de formación.
- Filtrado y anotación de datasets de razonamiento: al generar trazas cortas y verificables, sirve para preetiquetar pares pregunta-respuesta con justificación en proyectos de destilación.
- Despliegue en dispositivos con recursos mínimos: con 144M de parámetros y 0,6 GB de repositorio, cabe en GPUs de consumo e incluso en CPU para inferencia por lotes de baja latencia.
- Evaluación comparativa de técnicas de razonamiento: su pipeline reproducible (5 minutos en una V100) permite experimentar con formatos de traza y recetas de datos sin infraestructura costosa.
- Generación de preguntas de práctica con respuesta razonada: integrable en herramientas de autoaprendizaje que necesitan explicaciones breves y una respuesta final comprobable.

## Benchmarks y rendimiento

Evaluación zero-shot en float32 con lm-evaluation-harness 0.4.12 (ajustes del Open SLM Leaderboard), métrica acc_norm. ArithMark-3 usa el script `bencharithmark-3.py` del leaderboard sin modificar.

| Benchmark | Métrica | Boris-2 | Boris-2-Think |
|---|---|---:|---:|
| HellaSwag | acc_norm | 50,27 | 50,13 |
| ARC-Easy | acc_norm | 59,76 | 63,93 |
| ARC-Challenge | acc_norm | 32,00 | 34,81 |
| PIQA | acc_norm | 72,85 | 72,31 |
| ArithMark-3 | acc_norm | 45,10 | 49,20 |
| Open SLM Index | fórmula del leaderboard | 34,15 | 36,05 |

El Open SLM Index se calcula como `(N(HellaSwag,25) + N(mean(ARC-E, ARC-C),25) + N(PIQA,50) + 0,65 * N(ArithMark-3,25)) / 3,65`, con `N(v,c) = 100(v-c)/(100-c)`. La media de 9 tareas de Boris-2-Think es 49,53, la más alta entre los modelos por debajo de 150M de parámetros según el gráfico publicado. Las ganancias se concentran en razonamiento y ciencia (ARC-Easy +4,2, ARC-Challenge +2,8, ArithMark-3 +4,1, SciQ +2,0), mientras que HellaSwag y PIQA se mantienen estables. Estos benchmarks puntúan la verosimilitud de cada opción de respuesta; el modelo no genera traza durante la evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,58 GB solo para pesos (144M × 4 bytes), más activaciones; en float16 en torno a 0,29 GB.
- GPU de entrenamiento de referencia: 1× NVIDIA V100 de 32 GB (unos 5 minutos para el fine-tuning completo).
- GPU recomendadas para inferencia: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090, RTX 3090, RTX 3060 o T4 son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers con `trust_remote_code=True` (implementación oficial en PyTorch puro, sin dependencias extra); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El modelo no usa caché KV, lo que puede penalizar generaciones largas.
- Decodificación: greedy (`do_sample=False`) recomendada para razonamientos cortos; pasar `<|im_end|>` como cadena de parada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Open SLM Index | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Boris-2-Think | 144M | no disponible | 36,05 | Apache 2.0 | Hugging Face |
| Boris-2 (base) | 144M | no disponible | 34,15 | Apache 2.0 | Hugging Face |
| Boris-2-Instruct | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Otros modelos <150M del Open SLM Leaderboard | <150M | no disponible | inferior a 49,53 de media en 9 tareas | no disponible | no disponible |

La comparativa se limita a la familia Boris-2 de OpenCerebral y a los modelos agregados del Open SLM Leaderboard, ya que la información proporcionada no detalla alternativas concretas con sus especificaciones. Boris-2-Think supera a su base en el índice (+1,90) y en la media de 9 tareas, pero no se dispone de datos de contexto ni de benchmarks frente a modelos externos de tamaño comparable.

## Limitaciones y advertencias

- Modelo de 144M de parámetros: capacidad limitada para razonamientos largos o conocimiento factual extenso; la traza mediana es de unos 115 tokens.
- No es un asistente conversacional general: para diálogo multi-turno el autor recomienda Boris-2-Instruct.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en preguntas fuera de las seis categorías de OpenThink.
- Las trazas de razonamiento pueden ser plausibles pero incorrectas; la auto-consistencia del dataset de entrenamiento no garantiza corrección en inferencia.
- El token `<|im_end|>` no es token de fin de secuencia y abarca varios tokens: debe pasarse como cadena de parada o la generación puede continuar indebidamente.
- Sin caché KV en la implementación oficial, lo que limita el rendimiento en generaciones largas o despliegues de alto throughput.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones de seguridad o sesgos.
- Los benchmarks puntúan verosimilitud de opciones, no la calidad de la traza generada; el rendimiento en generación libre puede diferir.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso extenso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2-Think
- Modelo base Boris-2: https://huggingface.co/opencerebral/Boris-2
- Boris-2-Instruct: https://huggingface.co/opencerebral/Boris-2-Instruct
- Organización OpenCerebral en Hugging Face: https://huggingface.co/opencerebral
- Wiki de OpenCerebral: https://wiki.kunix.org/
- Sitio de OpenCerebral: https://oc.kunix.org/
- Dataset OpenThink (incluye scripts de descontaminación): https://huggingface.co/datasets/slmconsortium/OpenThink/tree/main/decontamination
- Licencia Apache 2.0 del modelo: https://huggingface.co/opencerebral/Boris-2-Think/blob/main/LICENSE
- Resultados en CSV: https://huggingface.co/opencerebral/Boris-2-Think/blob/main/benchmarks_comparison.csv
