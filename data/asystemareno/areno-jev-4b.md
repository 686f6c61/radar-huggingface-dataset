# AsystemAReno/AReno-Jev-4B

## Resumen

AReno-Jev-4B es un adaptador LoRA de tipo "decision model" (modelo de decisión) construido sobre el modelo base Qwen/Qwen3.5-4B y entrenado con el framework AReno del proyecto inclusionAI. A diferencia de un modelo generativo convencional, su función es puntuar un conjunto de candidatos asociados a una pregunta y devolver probabilidades normalizadas, admitiendo tres tipos de consulta: `choice` (elección entre opciones), `noul` (sí/no) y `score` (puntuación directa). El modelo no genera texto libre: recibe un estado o contexto y un conjunto de preguntas con sus criterios, y emite una distribución de probabilidad sobre las alternativas.

El modelo hereda la arquitectura híbrida de Qwen3.5-4B, con capas de atención completa y capas de atención lineal. La modificación principal introducida por AReno es que las capas de atención completa operan con atención bidireccional tanto en entrenamiento como en inferencia, mientras que las capas de atención lineal conservan su comportamiento original. El script de fusión ajusta `text_config.is_causal=false` en la configuración del modelo fusionado, lo que refleja ese cambio de paradigma: el modelo no predice el siguiente token, sino que evalúa una secuencia completa de forma no causal.

Su relevancia actual reside en que aborda una tarea distinta de la generación: la evaluación calibrada de alternativas en pipelines de decisión. En JevBench231, un conjunto de 231 tareas públicas, obtiene 187 aciertos (80,95 % de precisión) y una puntuación de Capacidad de 68,16 con el backend Triton, y 189 aciertos (81,82 %) con el backend FlashInfer. El repositorio contiene únicamente el adaptador (0,1 GB), por lo que requiere descargar y fusionar el modelo base antes de servir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa bidireccional + capas de atención lineal) sobre Qwen3.5-4B; adaptador LoRA |
| Parametros totales | 4B (modelo base Qwen3.5-4B); el adaptador LoRA se distribuye por separado |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuración de servicio documentada) |
| Tipos de cuantizacion | QLoRA para entrenamiento en CUDA; cuantización Q4 para entrenamiento en MLX; tipos de cuantización para inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere fusión con el modelo base en punto flotante original |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer híbrido que combina capas de atención completa con capas de atención lineal. Sobre esa base, AReno introduce atención bidireccional en las capas de atención completa, de modo que cada token puede atender a todos los demás de la secuencia, mientras que las capas lineales mantienen su comportamiento causal original. El resultado es un codificador de secuencias completo orientado a puntuar alternativas, no a generar texto. El script `merge_weights.py` fusiona el adaptador con el modelo base y establece `text_config.is_causal=false` en la configuración resultante.

El entrenamiento se realizó con el framework AReno y su soporte `--bi-attn`, con un adaptador LoRA de rango 16 y alpha 32, tasa de aprendizaje 2e-4, longitud máxima de contexto 4096, tamaño de mini-batch 1 y una época. Se documentan dos configuraciones: CUDA con QLoRA y MLX con cuantización Q4. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es el uso de atención bidireccional sobre un modelo originalmente causal, junto con la integración de backends CUDA (Triton, FlashInfer) y MLX para servir y entrenar en hardware Apple.

## Capacidades

- Puntuación de alternativas: recibe un estado y preguntas con criterios y devuelve probabilidades sobre los candidatos.
- Preguntas de tipo `choice`: selecciona entre opciones etiquetadas (por ejemplo, horas de salida alternativas).
- Preguntas de tipo `noul`: responde sí/no con probabilidad calibrada.
- Preguntas de tipo `score`: asigna una puntuación directa a un candidato.
- Calibración de probabilidades: la métrica de Calibración reportada es 81,30 en JevBench231.
- Procesamiento de contexto multi-pregunta: una misma petición puede incluir varias preguntas sobre un mismo estado.
- Despliegue en CUDA y en Apple Silicon vía MLX.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Selección de horarios y planificación: dado un estado con restricciones temporales (por ejemplo, "la reunión empieza a las 14:30 y el trayecto dura 45 minutos"), el modelo puntúa opciones de salida y devuelve la más probable. Es el ejemplo documentado en la API del modelo.
- Enrutamiento de decisiones binarias: con preguntas de tipo `noul`, se puede usar para decidir si se cumple una condición (por ejemplo, si un texto satisface un criterio) y obtener una probabilidad calibrada en lugar de una respuesta generada.
- Clasificación con candidatos definidos: en lugar de un clasificador entrenado ad hoc, se definen las etiquetas como criterios de una pregunta `choice` y el modelo devuelve la distribución sobre ellas.
- Evaluación de respuestas en pipelines de RL o generación: puntuar candidatos generados por otro modelo para seleccionar el mejor, aprovechando la calibración reportada (81,30).
- Sistemas de recomendación con restricciones: puntuar un conjunto acotado de ítems frente a un estado del usuario y ordenarlos por probabilidad.
- Automatización de reglas de negocio: sustituir árboles de decisión por una puntuación probabilística sobre alternativas explícitas, con la ventaja de que las opciones se definen en la propia petición.
- Despliegue local en Apple Silicon: el soporte MLX permite servir el modelo fusionado en un Mac para prototipos y evaluación sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JevBench231 (231 tareas públicas, CLI oficial, temperatura 1, sin posprocesado de probabilidades):

| Backend | Aciertos | Precisión | Intelligence | Calibration | Capability |
|---|---:|---:|---:|---:|---:|
| Triton | 187/231 | 80,95 % | 55,02 | 81,30 | 68,16 |
| FlashInfer | 189/231 | 81,82 % | 55,66 | 80,61 | 68,14 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El modelo base es de 4B parámetros; en bfloat16 requiere del orden de 8 GB solo para pesos, más memoria para el contexto de 4096 tokens y el backend de atención.
- GPU recomendadas: no se especifican modelos concretos. La configuración probada usa SGLang 0.5.23 con backend FlashInfer y `--chunked-prefill-size -1`.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; un modelo de 4B en bfloat16 es viable en GPUs con 12-16 GB de VRAM, pero no hay datos oficiales de prueba.
- Apple Silicon: soporte MLX documentado tanto para servir (`areno serve --backend mlx`) como para entrenar (`areno train --backend mlx --q4`).
- Opciones de despliegue: SGLang (`sglang serve`), AReno (`areno serve`) con backends CUDA y MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otros modelos de decisión ni con el modelo base Qwen3.5-4B en la misma tarea. Como referencia estructural, el propio Qwen3.5-4B es el modelo del que deriva, pero no se han publicado métricas comparativas entre ambos.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks comparables |
|---|---|---|---|---|---|
| AReno-Jev-4B | 4B (base) + LoRA | 4096 | Apache 2.0 | safetensors (adaptador) | JevBench231: 80,95-81,82 % |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible | no disponible |
| Alternativas de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas abiertas; solo puntúa candidatos predefinidos en la petición.
- Requiere fusión previa: el repositorio contiene únicamente el adaptador LoRA; es imprescindible descargar Qwen3.5-4B y ejecutar `merge_weights.py` con el modelo base en punto flotante original antes de servir.
- Dependencia de AReno: el servicio con `areno serve` requiere instalar el framework con soporte `--bi-attn` (PR 686), lo que añade una dependencia no estándar.
- Contexto limitado a 4096 tokens en la configuración documentada; estados o preguntas más largos pueden truncarse.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe más allá del que herede el modelo base.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5-4B, puede heredar los sesgos de su dataset de entrenamiento, no especificado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la calibración reportada (81,30) no es perfecta; las probabilidades pueden estar mal calibradas fuera de la distribución de JevBench.
- Resultados medidos solo en tareas públicas de JevBench231; el rendimiento en dominios distintos no está validado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B, no indicada en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/AsystemAReno/AReno-Jev-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework AReno: https://github.com/inclusionAI/AReno
- Implementación de atención bidireccional (PR 686): https://github.com/inclusionAI/AReno/pull/686
