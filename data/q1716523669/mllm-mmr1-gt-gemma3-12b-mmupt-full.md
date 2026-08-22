# q1716523669/mllm-mmr1-gt-gemma3-12b-mmupt-full

## Resumen

El modelo `q1716523669/mllm-mmr1-gt-gemma3-12b-mmupt-full` es un fine-tune del modelo base `google/gemma-3-12b-it`, desarrollado por el usuario q1716523669. Se trata de un ajuste fino mediante aprendizaje por refuerzo con recompensas ground-truth (GRPO) sobre el dataset MMR1-Math-RL-Data-v0, siguiendo la receta "mmupt" con 481 pasos de entrenamiento. El objetivo es mejorar el razonamiento matemático del modelo base, aunque no se especifican métricas de evaluación más allá de la recompensa en validación (eval_reward = 0.375 en el mejor checkpoint).

El modelo hereda la arquitectura de Gemma 3 12B, un transformer multimodal con capacidad de procesamiento de texto e imágenes, y una ventana de contexto de hasta 128k tokens en su versión original. El repositorio contiene dos checkpoints: `best/` (paso 100) y `endpoint/` (paso 481), con un tamaño total de 48.8 GB, lo que sugiere pesos completos en precisión fp16/bf16. La relevancia de este modelo radica en explorar el uso de recompensas ground-truth en RL para tareas matemáticas, un enfoque que puede reducir la dependencia de reward models aprendidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 12B it) |
| Parametros totales | 12 mil millones (heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos completos; se pueden generar cuantizaciones GGUF/AWQ) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferido por el tag y el tamaño del repo) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer decoder-only con atención multi-head, entrenado por Google DeepMind con datos multimodales (texto e imágenes). El fine-tune aplica GRPO (Group Relative Policy Optimization) con recompensas ground-truth, es decir, recompensas calculadas directamente a partir de la corrección de las respuestas matemáticas, sin utilizar un reward model separado. El dataset utilizado es MMR1-Math-RL-Data-v0, con 481 pasos de entrenamiento bajo la receta "mmupt" que especifica beta=0.01, 10 generaciones por prompt, límite de tokens de 2048, temperatura 0.7 y 12 prompts por actualización.

El entrenamiento registró cinco picos de gradiente con norma máxima alrededor de 1.0e6, que fueron recortados a 1.0. El mejor checkpoint en validación se obtuvo en el paso 100 (eval_reward = 0.375), y la curva de recompensa se mantuvo plana posteriormente. El checkpoint final en el paso 481 es el que se ofrece para endpoint. No se proporcionan detalles sobre la composición exacta del dataset ni sobre el número de tokens de entrenamiento.

## Capacidades

- Hereda las capacidades del modelo base Gemma 3 12B it: generación de texto, razonamiento, comprensión de imágenes, soporte multilingüe y generación de código.
- El fine-tune con GRPO sobre datos matemáticos busca mejorar el razonamiento matemático y la resolución de problemas, aunque no hay evidencia cuantitativa publicada en la model card.
- No se especifica soporte explícito para tool calling, function calling o agentes; estas capacidades dependerían del modelo base, pero no están confirmadas en este fine-tune.
- El modelo es multimodal (texto e imagen) por su base, pero el entrenamiento RL se centró exclusivamente en texto matemático.
- No se menciona un modo de pensamiento extendido ni capacidades de audio o vídeo.

## Casos de uso

- Resolución de problemas matemáticos: el modelo puede utilizarse para generar soluciones paso a paso a problemas de álgebra, cálculo o razonamiento numérico, aprovechando el entrenamiento RL con recompensas ground-truth.
- Tutoría automática en educación STEM: dado su enfoque en matemáticas, podría integrarse en plataformas educativas para explicar conceptos y corregir ejercicios, aunque se requiere validación adicional.
- Generación de preguntas y respuestas de exámenes: útil para crear bancos de preguntas matemáticas con soluciones razonadas.
- Investigación en RL aplicada a LLMs: el modelo sirve como caso de estudio para comparar estrategias de recompensa ground-truth frente a reward models aprendidos.
- Análisis de documentos científicos con contenido matemático: al ser multimodal, puede procesar ecuaciones en imágenes y generar explicaciones textuales.
- Prototipado de asistentes de razonamiento: puede usarse en sistemas de pregunta-respuesta que requieran pasos lógicos, aunque su rendimiento en tareas generales no está garantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la recompensa de validación interna (eval_reward = 0.375) en el checkpoint del paso 100, pero no se proporcionan comparaciones con otros modelos ni métricas estándar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- El tamaño del repositorio es de 48.8 GB, lo que corresponde a pesos completos en fp16/bf16 (aproximadamente 24 GB para los parámetros del modelo, más posibles optimizadores o checkpoints adicionales).
- Para inferencia con precisión fp16 se requieren al menos 24 GB de VRAM, lo que implica GPUs como A100 40GB, RTX 4090 24GB (justo al límite) o H100.
- Con cuantización int8 (12 GB) se puede ejecutar en GPUs de 16 GB como RTX 4080 o A10G.
- Con cuantización int4 (6 GB) podría ejecutarse en GPUs de 8 GB como RTX 3070 Ti o RTX 4060, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF), Ollama (si se genera un modelo GGUF).
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo es un fine-tune específico de Gemma 3 12B it, y no se han publicado resultados que permitan compararlo con alternativas como otros fine-tunes matemáticos (por ejemplo, modelos basados en Llama 3 8B o Mistral 7B) o con el propio modelo base sin fine-tune. Se recomienda consultar la documentación del dataset MMR1-Math-RL-Data-v0 para posibles referencias, pero no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o de redistribución. Se debe contactar al autor antes de cualquier uso productivo.
- El entrenamiento presentó picos de gradiente significativos (norma máxima ~1.0e6), lo que sugiere inestabilidad durante el ajuste. El mejor checkpoint se obtuvo en el paso 100, y el checkpoint final (paso 481) podría tener un rendimiento inferior.
- No hay evidencia de evaluación en benchmarks externos; el único indicador es la recompensa interna, que no garantiza calidad en tareas del mundo real.
- Al ser un fine-tune de un modelo base, hereda los sesgos y limitaciones de Gemma 3 12B it, incluyendo posibles alucinaciones en contenido factual y limitaciones en idiomas de bajos recursos.
- El contexto máximo no está confirmado; si se mantiene el del modelo base (128k), el uso de ventanas muy largas puede degradar el rendimiento en tareas matemáticas.
- No se proporcionan instrucciones de uso ni ejemplos de prompt, lo que dificulta la reproducción de resultados.
- El modelo está enfocado en matemáticas; su rendimiento en otras tareas (código, razonamiento general, conversación) no ha sido validado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/q1716523669/mllm-mmr1-gt-gemma3-12b-mmupt-full
- Repositorio del checkpoint endpoint: https://huggingface.co/q1716523669/mllm-mmr1-gt-gemma3-12b-endpoint
- Repositorio del modelo base Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Página oficial de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Página de Gemma 4 (no relacionada directamente, pero contexto de la familia): https://deepmind.google/models/gemma/gemma-4/
