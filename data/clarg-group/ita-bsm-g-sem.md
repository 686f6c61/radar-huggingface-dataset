# CLArg-group/ita-bsm-g-sem

## Resumen

ITA BSM-G (primed & sem) es un modelo de puntuación base (base score model, BSM) diseñado para argumentación en tiempo de inferencia (inference-time argumentation, ITA), presentado en el artículo *Neurosymbolic Learning for Inference-Time Argumentation* por el grupo CLArg-group. Su función no es generar texto libre, sino asignar a un argumento —que apoya o ataca una afirmación— una puntuación base en el rango [0, 1] que representa su fuerza intrínseca. Esa puntuación se combina después con la semántica gradual DF-QuAD para calcular la fuerza de la afirmación y emitir un veredicto Verdadero / Falso / Incierto.

El modelo se construye sobre el backbone Qwen/Qwen3-8B (8 000 millones de parámetros) mediante un adaptador LoRA y una cabeza de regresión separada (`regression_head.safetensors`). El repositorio de HuggingFace contiene únicamente el adaptador y la cabeza (0,1 GB), no los pesos completos del backbone, por lo que su uso requiere descargar Qwen3-8B por separado y emplear el repositorio de código del proyecto.

Es relevante ahora porque propone un enfoque neurosimbólico para la verificación de afirmaciones: en lugar de pedir a un LLM que emita un juicio directo, aprende una función de puntuación entrenada a través de la semántica DF-QuAD y una pérdida semántica, lo que aporta trazabilidad y permite integrar argumentos estructurados en el razonamiento. La ficha se basa únicamente en la información disponible en la model card y en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA y cabeza de regresión |
| Parametros totales | 8 000 millones (backbone Qwen3-8B); parámetros del adaptador y de la cabeza no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B, valor no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (los metadatos de HuggingFace no listan idiomas) |
| Licencia | MIT (sujeta además a la licencia del modelo base Qwen/Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador LoRA y `regression_head.safetensors`); PEFT |

## Arquitectura y entrenamiento

El modelo combina un backbone Qwen3-8B con un adaptador LoRA y una cabeza de regresión configurada mediante `model_config.json`. La salida es un escalar en [0, 1] que representa la fuerza intrínseca del argumento respecto a la afirmación. El backbone no se publica en este repositorio; solo el adaptador y la cabeza.

El entrenamiento se realizó en dos fases: primero la cabeza de regresión se "cebó" (primed) con puntuaciones base obtenidas al preguntar directamente al backbone, y después la cabeza y el adaptador se entrenaron de extremo a extremo a través de la semántica DF-QuAD con la pérdida semántica. Los datos de entrenamiento son los TFU Training Claims (`Data/Training/training_true_false_uncertain_with_arguments.json`), y los argumentos de entrenamiento fueron generados por GPT-5. El número de tokens de entrenamiento y la composición detallada del dataset no están disponibles en la información proporcionada.

## Capacidades

- Puntuación de argumentos: asigna una puntuación base en [0, 1] a un argumento que apoya o ataca una afirmación.
- Verificación de afirmaciones: en combinación con la semántica gradual DF-QuAD, produce la fuerza de la afirmación y un veredicto Verdadero / Falso / Incierto.
- Argumentación en tiempo de inferencia: forma parte de un pipeline neurosimbólico de ITA, no de generación de texto autónoma.
- Procesamiento por lotes desde CSV con columnas `claim,is_support,argument` mediante el script `ita.base_score_model.infer_on_arguments`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de afirmaciones en un pipeline de fact-checking: el modelo puntúa cada argumento recuperado a favor o en contra de una afirmación y DF-QuAD agrega las puntuaciones para emitir un veredicto Verdadero / Falso / Incierto, aportando una cadena de razonamiento estructurada y auditable.
- Moderación de contenido con justificaciones: dado un texto y afirmaciones candidatas, se generan argumentos y el BSM estima su fuerza para decidir si una afirmación debe marcarse, con trazabilidad sobre qué argumento pesó más.
- Sistemas de preguntas y respuestas con evidencia: se puntúan argumentos extraídos de fuentes para priorizar la evidencia más fuerte antes de presentar una respuesta al usuario.
- Evaluación de calidad de argumentación: se puede usar para medir la fuerza de argumentos en datasets educativos o de debate, comparando puntuaciones entre argumentos de apoyo y de ataque.
- Investigación en aprendizaje neurosimbólico: sirve como componente reproducible para experimentar con la semántica DF-QuAD y la pérdida semántica en tareas de razonamiento argumentativo.
- Análisis de debates y opiniones: se procesan lotes de argumentos desde CSV para cuantificar la solidez relativa de posturas enfrentadas sobre una misma afirmación.
- Integración en pipelines de evaluación de LLM: se emplea como juez de fuerza argumental para contrastar respuestas generadas por otros modelos, siempre que se disponga del backbone y del repositorio de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El backbone Qwen3-8B debe cargarse completo además del adaptador y la cabeza, por lo que la VRAM necesaria es la del modelo de 8 000 millones de parámetros, no la del repositorio de 0,1 GB.
- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 16 GB solo para pesos, más memoria de activaciones y contexto; valores exactos no disponibles.
- GPU recomendadas: A100, H100 o equivalentes para despliegue en producción; en consumer GPU se requiere al menos una RTX 4090 (24 GB) para FP16 y GPUs con 16 GB o más si se aplica cuantización, si bien los tipos de cuantización no están documentados.
- Opciones de despliegue: el repositorio de código del proyecto usa scripts Python (`python -m ita.base_score_model.infer_on_arguments`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ITA BSM-G (primed & sem) | 8 000 M (backbone) + adaptador | no disponible | Puntuación de argumentos / verificación de afirmaciones | MIT | HuggingFace (solo adaptador y cabeza) |
| Qwen/Qwen3-8B | 8 000 M | no disponible | Generación de texto general | no disponible en esta ficha | HuggingFace |
| Alternativas BSM del mismo proyecto | no disponible | no disponible | Puntuación de argumentos | no disponible | Repositorio del proyecto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye los pesos del backbone: es imprescindible descargar Qwen/Qwen3-8B y usar el repositorio de código del proyecto para ejecutarlo.
- El modelo está especializado en una tarea estrecha (puntuación de argumentos); no debe esperarse generación de texto general ni razonamiento libre.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al derivar de Qwen3-8B y de argumentos generados por GPT-5, puede heredar sesgos del backbone y del generador de datos.
- Idiomas soportados no declarados, lo que limita la planificación de despliegues multilingües.
- La licencia MIT aplica a los pesos del adaptador y de la cabeza, pero el uso queda sujeto además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento; conviene revisarlos antes de un uso comercial.
- Los datos de entrenamiento (TFU Training Claims) y los argumentos generados por GPT-5 condicionan el dominio de aplicación; el rendimiento fuera de ese distribución no está documentado.
- No hay métricas publicadas de latencia, throughput ni benchmarks, por lo que la evaluación para producción requiere pruebas propias.

## Enlaces

- HuggingFace: https://huggingface.co/CLArg-group/ita-bsm-g-sem
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de código (ITA): https://github.com/CLArg-group/inference-time-argumentation
- Artículo: *Neurosymbolic Learning for Inference-Time Argumentation* (referenciado en la model card; sin URL directa en la información proporcionada)
