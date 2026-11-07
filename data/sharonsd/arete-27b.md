# sharonSD/Arete-27B

## Resumen

Arete-27B es un modelo de lenguaje de 27.356 millones de parámetros desarrollado por Nous Research mediante ajuste fino supervisado (SFT) sobre Alibaba Qwen3.8-27B. El objetivo declarado del proyecto es modificar los sesgos de alineamiento del modelo base en siete categorías de valores (libertad de expresión, ideología estatal, Estado frente a mercado libre, educación, privacidad y vigilancia de datos, democracia y política medioambiental), sustituyendo respuestas que el autor considera alineadas con el marco ideológico del Partido Comunista Chino por respuestas alineadas con valores occidentales.

El modelo conserva la arquitectura del Qwen3.8-27B original, incluyendo un codificador de visión que queda congelado durante el entrenamiento (los datos de post-entrenamiento son solo texto). Se entrenó con aproximadamente 52,8 millones de tokens a 64k de contexto, sin empaquetado de secuencias, durante dos épocas y 1.202 pasos, usando únicamente SFT: sin RL, sin optimización de preferencias y sin modificaciones arquitectónicas.

Su relevancia es doble: por un lado, es un ejemplo práctico de "value alignment" sobre un modelo abierto de origen chino; por otro, Nous Research publica junto al modelo un conjunto de evaluación de propaganda de 803 prompts y anuncia la publicación del dataset de entrenamiento, lo que lo convierte en material útil para investigar cómo el post-entrenamiento altera los valores de un modelo. La licencia es Apache 2.0 y el checkpoint evaluado es el paso 1.202.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B); incluye codificador de visión congelado y cabeza de predicción multi-token (MTP) desactivada durante el entrenamiento |
| Parámetros totales | 27.356.728.560 (≈27,36B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64k tokens en entrenamiento; contexto de inferencia del modelo base no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en safetensors; el repo ocupa 54,7 GB) |
| Idiomas soportados | no disponible (los prompts de entrenamiento y evaluación son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16/fp32 según el repo; 54,7 GB) |

## Arquitectura y entrenamiento

Arete-27B no introduce cambios arquitectónicos: es el Qwen3.8-27B completo con todos los pesos del modelo de lenguaje ajustados y el codificador de visión congelado, ya que los datos de post-entrenamiento son exclusivamente texto. La cabeza de predicción multi-token (MTP) se desactivó durante el entrenamiento. El ajuste se hizo en bf16 con pesos maestros y estados del optimizador en fp32, con paralelismo tensorial de grado 4.

El entrenamiento consistió en SFT puro sobre unos 52,8 millones de tokens a 64k de contexto, sin empaquetado de secuencias, durante dos épocas (1.202 pasos totales, 601 por época, batch de 48). Optimizador AdamW con betas (0,9; 0,98), epsilon 1e-5, weight decay 0,1, clipping de gradiente 1,0 y una tasa de aprendizaje con warmup lineal de 1e-6 a 1e-5 en los primeros 120 pasos y decaimiento coseno hasta 1e-6 en el paso 1.202. La pérdida bajó rápidamente durante el warmup y se estabilizó cerca de 1,0 al final de la primera época, con un escalón a ~0,8 al inicio de la segunda; la norma del gradiente pasó de ~32 a ~1,4 tras el warmup.

Los datos se generaron a partir de 20.000 prompts construidos con un pipeline con deduplicación obligatoria en las siete categorías de valores, verificados contra el conjunto de evaluación reservado (eliminando solapamientos) y respondidos por el modelo profesor Inkling, elegido por su evaluación positiva en los temas objetivo y por ser abierto, lo que evita las restricciones de uso asociadas a la "destilación ilícita". Cada lote de datos pasó por pull requests revisados.

## Capacidades

- Generación de texto conversacional y asistencia general, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y trabajo agéntico: el autor lo destina explícitamente a "general assistance and agentic work".
- Capacidad de visión heredada del codificador del modelo base (congelado, no reentrenado); no hay confirmación en la información disponible de que se mantenga operativa tras el ajuste.
- Respuestas sobre temas políticamente sensibles con un marco de valores occidentales en las siete categorías entrenadas.
- Mayor recuerdo factual y menor tasa de respuestas con propaganda según la evaluación del autor (fact score de 2,32 a 2,98 sobre 5; respuestas con propaganda del 22% al 0,9%).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el entrenamiento y la evaluación son en inglés.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento de valores: comparar las respuestas de Arete-27B y Qwen3.8-27B sobre los 803 prompts del conjunto Propaganda_Eval para medir el efecto del SFT en el encuadre ideológico.
- Asistencia general y conversacional: uso como modelo de chat de 27B con contexto de 64k para conversaciones multi-turno y documentos largos, aprovechando que el autor declara que no hay regresiones significativas en capacidades generales.
- Flujos agénticos: el autor lo orienta a trabajo agéntico; puede integrarse en pipelines de agentes que requieran contexto largo (64k) para mantener el estado de la tarea.
- Redacción y análisis sobre políticas públicas, libertad de expresión o privacidad: el ajuste en las siete categorías busca reducir respuestas que adopten el marco estatal chino como propio.
- Evaluación de sesgos y auditoría de modelos: servir como contrapunto entrenado para estudiar cómo se manifiestan y modifican los sesgos políticos en modelos abiertos.
- Fine-tuning posterior por parte de la comunidad: al ser Apache 2.0 y safetensors, puede servir de base para nuevos experimentos de value alignment con otros conjuntos de valores.

## Benchmarks y rendimiento

La información disponible solo incluye la evaluación propia del autor (Propaganda_Eval, 803 prompts, juez Grok 4.7 con rúbrica fija y validación manual en un piloto de 25 prompts):

| Métrica | Qwen3.8-27B (antes) | Arete-27B (después) |
|---|---|---|
| Fact score (sobre 5) | 2,32 | 2,98 |
| Respuestas con propaganda | 22% | 0,9% |

El autor afirma que la mejora se mantuvo en las siete categorías de valores y que no hubo regresiones significativas en los benchmarks de capacidad general y agénticos que ejecutó, pero no se publican en la información disponible los números concretos de esos benchmarks (MMLU, HumanEval, GSM8K u otros). No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos (27,36B × 2 bytes), más KV cache; requiere GPU de 80 GB (A100, H100) para contexto largo.
- Cuantización a 8 bits: ~27-30 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizaciones de 4 bits o con descarga parcial a CPU.
- Cuantización a 4 bits: ~14-16 GB de pesos, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16-24 GB, con contexto reducido por la KV cache.
- GPUs recomendadas: A100 80 GB o H100 para bf16 y contexto de 64k; RTX 4090/3090 para cuantizaciones de 4-8 bits con contexto moderado.
- Opciones de despliegue: vLLM y TGI para serving en GPUs de datacenter; llama.cpp y Ollama para cuantizaciones GGUF en consumer (la disponibilidad de GGUF no está confirmada en la información proporcionada); transformers para uso directo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Arete-27B | 27,36B | 64k (entrenamiento) | Apache 2.0 | SFT sobre Qwen3.8-27B; ajuste de valores en 7 categorías |
| Qwen3.8-27B | 27B | no disponible | no disponible en la información proporcionada | Modelo base; mismo tamaño y arquitectura, sin el ajuste de valores |
| Alternativas de ~27B de otros fabricantes | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación más directa es con el propio Qwen3.8-27B: misma arquitectura y número de parámetros, con la diferencia del post-entrenamiento en valores. No se dispone de datos de benchmarks estándar de ninguno de los dos en la información proporcionada para comparar rendimiento general.

## Limitaciones y advertencias

- El ajuste es solo SFT: no hay RL ni optimización de preferencias, por lo que el autor no afirma haber corregido todos los comportamientos asociados a la visión previa, sino una posible causa raíz.
- Riesgo de alucinación: el propio autor mide el recuerdo factual con un fact score de 2,98 sobre 5, lo que indica que aún falla o contradice hechos requeridos en una parte relevante de los prompts.
- Sesgo introducido deliberadamente: el modelo está entrenado para adoptar un marco de valores occidentales; no es neutral y puede presentar sesgo en la dirección opuesta en temas políticos.
- Evaluación sesgada por el desarrollador: los resultados provienen de un conjunto de evaluación propio, con un juez LLM (Grok 4.7) y una rúbrica diseñada por el mismo equipo; no hay validación independiente en la información disponible.
- Idiomas: el entrenamiento y la evaluación son en inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Visión: el codificador está congelado y no se reentrenó; no hay confirmación de que las capacidades de visión sigan operativas tras el ajuste.
- Tool calling y modo thinking: no confirmados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones; conviene verificar la licencia del modelo base antes de desplegar en producción.
- Repo de 54,7 GB: requiere almacenamiento y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Modelo en Hugging Face (autor): https://huggingface.co/sharonSD/Arete-27B
- Modelo en Hugging Face (Nous Research): https://huggingface.co/NousResearch/Arete-27B
- Blog post: https://nousresearch.com/arete
- Conjunto de evaluación Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Dataset de entrenamiento (referenciado en la model card): NousResearch/arete-data-pairs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha de especificaciones y VRAM: https://apxml.com/models/arete-27b
