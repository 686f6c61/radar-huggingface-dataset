# JetBrains-Research/budget-internalization-qwen3.5-4b-16k-sft-meetwombat-s79

## Resumen

El modelo `budget-internalization-qwen3.5-4b-16k-sft-meetwombat-s79` es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-4B desarrollado por JetBrains-Research en el marco de la investigación *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo es internalizar un presupuesto fijo de tokens de razonamiento: en lugar de dejar que el modelo decida cuánto "pensar" en tiempo de inferencia, se le entrena para producir respuestas largas (10k-16k tokens) de forma consistente y ajustada a ese rango.

El entrenamiento emplea rejection-sampling finetuning sobre soluciones autogeneradas por el propio Qwen3.5-4B al dataset de matemáticas DeepScaleR, filtradas por corrección. Se trata, por tanto, de un modelo especializado en razonamiento matemático con cadenas de pensamiento extensas, no de un modelo de propósito general. Su relevancia radica en explorar si el cómputo de test-time puede sustituirse por cómputo internalizado durante el entrenamiento, un tema activo en la investigación sobre RLVR y eficiencia en inferencia.

El checkpoint publicado corresponde al paso 79 (run `meetwombat`), con 4.539.265.536 parámetros reales en safetensors y un repositorio de 9,1 GB en BF16. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal image-text-to-text |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la longitud máxima de secuencia en entrenamiento fue 18.432) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text` según la model card. El ajuste es un SFT clásico con pérdida de next-token sobre la respuesta, sin RLHF ni DPO. Los datos son soluciones autogeneradas por el propio Qwen3.5-4B a problemas matemáticos del dataset `agentica-org/DeepScaleR-Preview-Dataset`, filtradas por corrección (rejection sampling) y restringidas al subconjunto `10k-16k`: respuestas largas de entre 10.000 y 16.000 tokens, una solución por problema.

La innovación central es el concepto de "internalización de presupuesto": se entrena al modelo para que sus cadenas de razonamiento caigan sistemáticamente en una ventana de tokens fija, de modo que el coste de test-time scaling quede trasladado al entrenamiento. El prompt de entrenamiento fuerza el formato `\boxed{}` para la respuesta final y un arranque explícito de razonamiento paso a paso. Hiperparámetros: longitud máxima de secuencia 18.432, batch de 32 secuencias, optimizador Adam con schedule coseno y LR pico 1e-06, una sola época y 79 pasos. Pesos en BF16.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento extensas (10k-16k tokens), orientado a problemas de competición tipo DeepScaleR.
- Generación de texto y razonamiento multi-paso en formato step-by-step.
- Salida estructurada de respuesta final mediante etiquetas `\boxed{}`.
- Capacidades multimodales heredadas del base (pipeline image-text-to-text), aunque el finetuning se centra en matemáticas textuales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el razonamiento multi-paso se limita al dominio matemático.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está entrenado específicamente para producir soluciones largas y verificables de problemas tipo DeepScaleR, con respuesta final en `\boxed{}` lista para extracción automática.
- Evaluación de pipelines de razonamiento con presupuesto fijo: útil para comparar test-time scaling frente a cómputo internalizado en experimentos de investigación sobre RLVR y eficiencia.
- Generación de trazas de razonamiento para destilación: sus cadenas de 10k-16k tokens pueden servir como datos de entrenamiento para modelos más pequeños que necesiten aprender a razonar paso a paso.
- Verificación automática de soluciones: la salida estructurada en `\boxed{}` permite integrar el modelo en sistemas de corrección automática de problemas matemáticos.
- Investigación en eficiencia de inferencia: permite medir si un modelo con presupuesto internalizado mantiene precisión sin necesidad de técnicas de test-time scaling como best-of-n o self-consistency.
- Benchmarking de modelos de 4B en matemáticas: como checkpoint de referencia para comparar arquitecturas y estrategias de entrenamiento en la franja de modelos pequeños con razonamiento extendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 16-24 GB para contexto largo.
- En cuantización de 8 bits: en torno a 5 GB de pesos; en 4 bits, en torno a 2,5-3 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 18k tokens y batch alto; RTX 4090 (24 GB) viable en BF16 con batch pequeño o cuantizado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización o secuencias moderadas; en GPUs de 8-12 GB solo con cuantización agresiva y contexto recortado.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI previsiblemente compatibles por arquitectura, aunque no confirmado en la model card; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; las respuestas de 10k-16k tokens implican una latencia de generación elevada por diseño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-16k-sft-meetwombat-s79 | 4,54B | no disponible (entrenado a 18.432) | Matemáticas, presupuesto fijo de tokens | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Propósito general multimodal | Apache 2.0 | Hugging Face |
| Alternativas de 4B con razonamiento matemático | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la información proporcionada; la comparativa se limita a parámetros, licencia y especialización.

## Limitaciones y advertencias

- Especialización estrecha: el finetuning se limita a matemáticas y a respuestas de 10k-16k tokens; su comportamiento fuera de ese dominio o rango de longitud no está caracterizado.
- Riesgo de alucinación en razonamientos largos: cadenas de 10k-16k tokens aumentan la probabilidad de errores acumulados o justificaciones plausibles pero incorrectas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no se documentan idiomas soportados ni longitud de contexto efectiva; el entrenamiento usó secuencias de hasta 18.432 tokens.
- Coste de inferencia elevado: por diseño genera respuestas muy largas, lo que encarece el despliegue frente a modelos que responden de forma concisa.
- Licencia Apache 2.0: permite uso comercial, pero se hereda del modelo base Qwen3.5-4B y conviene verificar las condiciones de este último.
- Checkpoint intermedio: corresponde al paso 79 de un único run; no hay garantía de que sea el mejor checkpoint de la serie ni de estabilidad en producción.
- Sin datos de benchmarks ni evaluación independiente: no se puede confirmar su calidad real frente al base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-16k-sft-meetwombat-s79
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (cita pendiente, marcada como TODO en la model card)
