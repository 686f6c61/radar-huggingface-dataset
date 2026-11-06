# CLArg-group/ita-bsm-g-primed

## Resumen

BSM-G (primed) es un modelo de puntuación base (base score model, BSM) diseñado para argumentación en tiempo de inferencia (inference-time argumentation, ITA), presentado en el artículo *Neurosymbolic Learning for Inference-Time Argumentation* por el grupo CLArg-group. Su función no es generar texto ni mantener conversaciones, sino asignar a un argumento concreto, que apoya o ataca una afirmación, una puntuación en el intervalo [0, 1] que representa su fuerza intrínseca. Esa puntuación se combina después con la semántica gradual DF-QuAD para calcular la fuerza agregada de la afirmación y emitir un veredicto Verdadero / Falso / Incierto.

El modelo se construye sobre el backbone Qwen/Qwen3-8B, que permanece congelado durante todo el proceso. Lo único entrenado es una cabeza de regresión (`regression_head.safetensors`, configurada por `model_config.json`), que fue cebada (primed) con puntuaciones base obtenidas mediante prompting al propio backbone. No hubo adaptadores ni ajuste fino adicional del modelo base.

Es relevante porque ejemplifica un enfoque neurosimbólico híbrido: usa un LLM de 8 000 millones de parámetros como extractor de representaciones y delega la parte estrictamente lógica a un componente simbólico (la semántica DF-QuAD), lo que permite verificación de afirmaciones con trazabilidad argumental. El repositorio de Hugging Face no contiene pesos del backbone (tamaño de repo 0.0 GB) y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-8B congelado) + cabeza de regresión supervisada |
| Parametros totales | 8 000 millones (backbone Qwen3-8B) + cabeza de regresión (tamaño no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT (sujeta además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | `regression_head.safetensors` + `model_config.json`; el backbone se descarga por separado |

## Arquitectura y entrenamiento

La arquitectura es un esquema de dos componentes. El primero es el backbone Qwen3-8B, un transformer de 8 000 millones de parámetros que se mantiene congelado y actúa como codificador de la afirmación y del argumento. El segundo es una cabeza de regresión entrenada que proyecta la representación resultante a un escalar en [0, 1]. La salida del modelo es, por tanto, una puntuación de fuerza argumental, no una distribución de tokens.

El entrenamiento de la cabeza consistió en un cebado (priming) sobre puntuaciones base generadas al interrogar al backbone con prompts, usando las Training Claims del conjunto True/False/Uncertain con argumentos (`Data/Training/training_true_false_uncertain_with_arguments.json`). Los argumentos de entrenamiento fueron generados por GPT-5 según la model card. El backbone no se reentrenó ni se le añadieron adaptadores. La innovación principal no reside en el modelo en sí, sino en su integración en el pipeline ITA: las puntuaciones base individuales se agregan mediante la semántica gradual DF-QuAD para producir la fuerza de la afirmación y un veredicto ternario.

## Capacidades

- Puntuación de argumentos: asigna un valor continuo en [0, 1] a un argumento que apoya o ataca una afirmación.
- Verificación de afirmaciones (claim verification): integrado en el pipeline ITA, produce veredictos Verdadero / Falso / Incierto.
- Razonamiento argumental neurosimbólico: combina representaciones neuronales con agregación simbólica DF-QuAD.
- Procesamiento por lotes: la herramienta de inferencia acepta un CSV con columnas `claim`, `is_support` y `argument` y devuelve un CSV de puntuaciones.
- No soporta generación de texto libre, tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode); su única salida es la puntuación de regresión.
- Capacidades multilingües: no documentadas; dependen del backbone Qwen3-8B, pero la model card no especifica idiomas.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: dado un conjunto de argumentos a favor y en contra extraídos de fuentes, el modelo puntúa cada uno y DF-QuAD agrega la fuerza para emitir un veredicto ternario, lo que permite priorizar revisiones humanas sobre los casos marcados como inciertos.
- Moderación de contenido argumentativo en foros: puntuar la fuerza de los argumentos permite ordenar hilos por calidad argumental en lugar de por votos, usando la salida continua del modelo como señal de ranking.
- Evaluación automática de ensayos y debates: el BSM puede puntuar los argumentos de un texto y combinarlos para estimar la solidez de la tesis defendida, útil en herramientas educativas de escritura argumentativa.
- Enriquecimiento de bases de conocimiento con evidencia: al integrarse en ITA, permite asociar a cada afirmación de una KB un grado de respaldo calculado a partir de los argumentos recuperados, en lugar de una etiqueta binaria.
- Investigación en razonamiento neurosimbólico: sirve como componente reproducible para experimentos que comparen la agregación DF-QuAD con otras semánticas argumentales, ya que el backbone está congelado y solo varía la cabeza.
- Análisis de discursos políticos o judiciales: puntuar los argumentos de un texto estructurado (claim, is_support, argument) permite construir mapas de argumentación cuantificados y detectar afirmaciones con respaldo débil.
- Sistemas de preguntas y respuestas con justificación: el veredicto ternario y las puntuaciones por argumento proporcionan una traza de por qué una respuesta se considera verdadera, falsa o incierta, algo que un LLM generativo no ofrece de forma nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; al usar el backbone Qwen3-8B congelado, la huella dominante es la de dicho modelo (del orden de decenas de GB en precisión completa, menor con cuantización), pero no se especifican cifras.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible; depende de la cuantización aplicada al backbone Qwen3-8B.
- Opciones de despliegue: el repositorio ITA proporciona scripts propios (`python -m ita.base_score_model.infer_on_arguments`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSM-G (primed) | 8 000 M (backbone) + cabeza de regresión | No disponible | Puntuación de argumentos para ITA | MIT | Hugging Face (repo de 0.0 GB; backbone aparte) |
| Qwen3-8B | 8 000 M | No disponible en esta ficha | LLM generativo de propósito general | No disponible en esta ficha | Hugging Face |
| Otros BSM del mismo grupo | No disponible | No disponible | Puntuación de argumentos para ITA | No disponible | Repositorio ITA (según la model card) |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio de Hugging Face tiene un tamaño de 0.0 GB: no contiene los pesos del backbone, que deben descargarse por separado desde Qwen/Qwen3-8B.
- La licencia MIT de los pesos está supeditada a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento, según indica la propia model card; conviene revisarlos antes de un uso comercial.
- Los argumentos de entrenamiento fueron generados por GPT-5, lo que puede introducir sesgos y artefactos estilísticos del generador en las puntuaciones aprendidas.
- El modelo solo puntúa argumentos; no genera explicaciones ni justificaciones textuales de la puntuación asignada.
- Riesgo de alucinación: no aplica en el sentido generativo (la salida es un escalar), pero la puntuación puede ser incorrecta o sobreconfiada ante argumentos fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado.
- Ausencia de descargas y valoraciones en Hugging Face: no hay evidencia de validación por parte de la comunidad.
- No se documentan limitaciones de longitud de contexto específicas para la tarea de puntuación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-bsm-g-primed
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio ITA: https://github.com/CLArg-group/inference-time-argumentation
- Artículo *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible (no se proporciona enlace)
