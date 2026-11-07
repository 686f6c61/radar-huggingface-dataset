# engageassume/qwen3-06b-knowline-kd-pilot-100k-20261102

## Resumen

`engageassume/qwen3-06b-knowline-kd-pilot-100k-20261102` es un conjunto de adaptadores PEFT (LoRA r32/alpha64) entrenados sobre el modelo base Qwen/Qwen3-0.6B para una tarea de clasificación binaria de secuencias (`sequence-classification`), con etiquetas `0=not_match` y `1=match`. El autor lo describe como un piloto experimental de destilación de conocimiento (knowledge distillation) desde un modelo profesor mucho mayor, `PelaAI/KnowLine-31B-Gen1` en BF16, hacia un modelo estudiante de 0,6 mil millones de parámetros. El repositorio contiene un padre entrenado (`BASELINE`) y tres continuaciones con 100.000 pares cada una (`KD_HARD`, `KD_SOFT`, `KD_HYBRID`).

El interés de esta ficha no reside en el rendimiento del modelo en sí, sino en su valor como artefacto de investigación reproducible: documenta con precisión los pasos de optimización (782), los tokens efectivos (22,87 millones) y las funciones de pérdida empleadas en cada variante. No es un modelo generativo ni un clasificador de propósito general; es un experimento controlado de destilación sobre una tarea concreta de emparejamiento semántico ("KnowLine").

Se publica bajo licencia Apache 2.0, con un tamaño de repositorio de 0,3 GB, y no cuenta con descargas ni likes en el momento de la consulta. La model card advierte explícitamente de que no se reclama rendimiento de leaderboard y de que no se incluyen pesos del profesor ni preguntas de benchmark congeladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con cabeza de clasificación binaria (`score`) y adaptadores LoRA r32/alpha64 |
| Parametros totales | No disponible (adaptadores PEFT sobre Qwen3-0.6B; el modelo base tiene 0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos en BF16 para el modelo base; adaptadores en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT + cabeza `score` entrenada) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y le superpone adaptadores LoRA de rango 32 y alpha 64 junto con una cabeza de clasificación binaria (`score`) entrenada. No se trata de un modelo con cabeza aleatoria: los adaptadores y la cabeza se entrenaron sobre un padre común (`BASELINE`) y luego se continuaron con tres estrategias de destilación distintas. El profesor es `PelaAI/KnowLine-31B-Gen1` en BF16, del que se obtienen probabilidades soft independientes de tipo sí/no.

Cada continuación (`KD_HARD`, `KD_SOFT`, `KD_HYBRID`) ejecutó 782 pasos de optimización sobre 22.871.000 tokens efectivos, partiendo exactamente del mismo padre entrenado y de las mismas muestras seleccionadas (100.000 pares). Las funciones de pérdida son: entropía cruzada con etiqueta original (`KD_HARD`), KL(Teacher||Student) a temperatura 1 (`KD_SOFT`), y una mezcla 0,5·CE + 0,5·KL (`KD_HYBRID`). Esta estructura permite aislar el efecto de la señal del profesor frente a la supervisión dura, manteniendo constantes el resto de variables.

La innovación técnica destacable es metodológica, no arquitectónica: el diseño controlado con un padre compartido, el mismo conjunto de muestras y presupuesto de tokens idéntico entre variantes. La model card preserva las configuraciones originales de los adaptadores, incluyendo una ruta local histórica del modelo base, y recomienda cargar explícitamente con una instancia del modelo base en lugar de fiarse de esa ruta.

## Capacidades

- Clasificación binaria de pares de secuencias con etiquetas `0=not_match` y `1=match`.
- Destilación de conocimiento desde un profesor de 31B hacia un estudiante de 0,6B mediante señales soft (probabilidades sí/no).
- Tres variantes de entrenamiento comparables: supervisión dura (`KD_HARD`), destilación soft pura (`KD_SOFT`) y mixta (`KD_HYBRID`).
- Carga mediante `peft.PeftModel` con `AutoModelForSequenceClassification` y tokenizer compartido en `tokenizer/`.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la informacion proporcionada.
- No es un modelo generativo: no produce texto libre, solo una puntuación de clasificación.

## Casos de uso

- Investigación en destilación de conocimiento: comparar en igualdad de condiciones CE, KL y la mezcla 0,5·CE+0,5·KL sobre el mismo padre y las mismas muestras, para aislar el efecto de la señal del profesor.
- Emparejamiento semántico de pares (entity matching, deduplicación de registros): el clasificador `match`/`not_match` puede aplicarse a pares de cadenas para decidir si describen la misma entidad, aprovechando que el modelo base Qwen3-0.6B maneja representaciones lingüísticas razonables con un coste computacional muy bajo.
- Filtrado previo en pipelines de recuperación: usar la puntuación binaria como etapa de reranking ligera antes de un modelo mayor, reduciendo el número de candidatos que llegan a un cross-encoder pesado.
- Reproducción de experimentos de destilación a pequeña escala: el repositorio incluye los cuatro checkpoints (`BASELINE`, `KD_HARD`, `KD_SOFT`, `KD_HYBRID`) con configuraciones preservadas, lo que permite replicar el protocolo sin reentrenar desde cero.
- Evaluación de metodologías de KD en entornos con recursos limitados: con 0,3 GB de repo y un modelo base de 0,6B, el piloto se puede ejecutar en una sola GPU consumer para estudiar curvas de convergencia y sensibilidad a la temperatura.
- Base para experimentos de clasificación con LoRA: el patrón (adaptador r32 + cabeza `score` + tokenizer compartido) sirve como plantilla para adaptar Qwen3-0.6B a otras tareas de clasificación binaria con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el rendimiento del piloto no debe interpretarse como una puntuación de leaderboard completa, y no se incluyen métricas numéricas (accuracy, F1, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-0.6B en BF16 ocupa aproximadamente 1,2 GB de pesos; con adaptadores y cabeza de clasificación, el consumo total es inferior a 2 GB en BF16 y en torno a 0,5-1 GB en cuantización de 8 bits (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles, aunque para un modelo de este tamaño las consumer son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para este artefacto concreto y su compatibilidad con la cabeza de clasificación PEFT no está confirmada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| engageassume/qwen3-06b-knowline-kd-pilot-100k | 0,6B (base) + adaptadores | No disponible | Clasificación binaria (match/not_match) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-0.6B-Base | 0,6B | No disponible en la informacion proporcionada | Modelo base generativo | Apache 2.0 | Hugging Face |
| PelaAI/KnowLine-31B-Gen1 (profesor) | 31B | No disponible | Generación sí/no (probabilidades soft) | No disponible | Referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Modelo de clasificación binaria restringido a una tarea concreta ("KnowLine"); no es un modelo de propósito general ni generativo.
- Rendimiento no validado: la model card advierte que el piloto no debe interpretarse como una puntuación de leaderboard completa.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen3-0.6B, puede heredar sesgos del modelo base y del profesor.
- Riesgo de alucinación: bajo en el sentido generativo (no produce texto libre), pero la cabeza de clasificación puede producir falsos positivos/negativos en pares ambiguos.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-0.6B y del profesor referenciado.
- La configuración de los adaptadores contiene una ruta local histórica del modelo base; debe cargarse explícitamente con una instancia de `Qwen/Qwen3-0.6B` para evitar errores.
- No se incluyen pesos del profesor ni preguntas de benchmark congeladas, lo que limita la reproducibilidad exacta de las métricas del profesor.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento conocido.

## Enlaces

- Hugging Face: https://huggingface.co/engageassume/qwen3-06b-knowline-kd-pilot-100k-20261102
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base (variante Base): https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Página de Qwen en Wikipedia: https://en.wikipedia.org/wiki/Qwen
