# CLArg-group/ita-bsm-g-sem-rank-con

## Resumen

ITA base score model: bsm-g-sem-rank-con es un adaptador LoRA con cabeza de regresión sobre el modelo base Qwen/Qwen3-8B, desarrollado por el grupo CLArg-group en el contexto del artículo *Neurosymbolic Learning for Inference-Time Argumentation*. Su función no es la generación de texto libre, sino la asignación de una puntuación base en el intervalo [0, 1] a un argumento (de apoyo o de ataque) respecto a una afirmación, representando su fuerza intrínseca. Estas puntuaciones se combinan después mediante la semántica gradual DF-QuAD para calcular la fuerza agregada de la afirmación y emitir un veredicto Verdadero / Falso / Incierto.

El modelo se denomina BSM-G (primed & sem & rank & con) en el artículo y forma parte de un conjunto de modelos de puntuación base publicados por el mismo grupo. Resuelve un problema específico de la verificación de afirmaciones y la argumentación computacional: proporcionar una señal numérica calibrada y diferenciable que pueda integrarse en un pipeline neurosimbólico de razonamiento en tiempo de inferencia, en lugar de depender únicamente de la salida textual de un LLM.

Es relevante ahora porque ejemplifica una línea de trabajo emergente que combina modelos de lenguaje con semánticas formales de argumentación, y porque su naturaleza de adaptador LoRA sobre un backbone de 8B parámetros lo hace relativamente ligero de desplegar. El repositorio tiene un tamaño de 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA y cabeza de regresión |
| Parametros totales | No disponible (adaptador LoRA sobre Qwen3-8B de 8B parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen3-8B; no especificada en la información) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT (sujeta además a la licencia del modelo base Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador LoRA en `adapter/` y `regression_head.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura consta de tres componentes: el backbone Qwen/Qwen3-8B, un adaptador LoRA sobre dicho backbone y una cabeza de regresión configurada mediante `model_config.json`. La salida es un escalar en [0, 1] que representa la fuerza intrínseca del argumento. El modelo se integra en un pipeline de argumentación en tiempo de inferencia (ITA) que agrega las puntuaciones base mediante la semántica gradual DF-QuAD para producir la fuerza de la afirmación y un veredicto de tres valores.

El entrenamiento se realizó en dos fases. Primero, la cabeza de regresión se preentrenó ("primed") con puntuaciones base obtenidas al interrogar al propio backbone. Después, la cabeza y el adaptador se entrenaron de extremo a extremo a través de la semántica DF-QuAD, combinando una pérdida semántica con pérdidas de ranking y de consistencia. Los argumentos de entrenamiento fueron generados por GPT-5 para el conjunto TFU Training Claims (`Data/Training/training_true_false_uncertain_with_arguments.json`). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset más allá de esta descripción.

## Capacidades

- Puntuación de argumentos: asigna una puntuación base en [0, 1] a un argumento de apoyo o de ataque respecto a una afirmación.
- Verificación de afirmaciones: integrado en el pipeline ITA, contribuye a emitir un veredicto Verdadero / Falso / Incierto.
- Razonamiento neurosimbólico: combina la señal del modelo con la semántica formal DF-QuAD para agregar fuerzas argumentales.
- Procesamiento por lotes: incluye una herramienta de inferencia sobre CSV con columnas `claim`, `is_support` y `argument`.
- Entrenamiento con pérdidas de ranking y consistencia: el modelo está optimizado para ordenar argumentos por fuerza y mantener coherencia en las puntuaciones.
- No se documentan capacidades de generación de texto libre, tool calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo puntúa cada argumento recuperado a favor o en contra de una afirmación y el agregador DF-QuAD produce un veredicto final, lo que permite automatizar la clasificación de afirmaciones con trazabilidad argumental.
- Moderación de contenido basada en argumentos: dado un texto y las razones esgrimidas, el modelo cuantifica la fuerza de cada razón para priorizar revisiones humanas según la solidez argumental detectada.
- Sistemas de debate asistido por IA: en plataformas de debate estructurado, el modelo puntúa las intervenciones de cada parte y permite calcular qué posición queda mejor respaldada por los argumentos presentados.
- Investigación en argumentación computacional: sirve como componente evaluable y reproducible para experimentar con semánticas graduales, comparando el efecto de distintas combinaciones de pérdidas (ranking, consistencia, semántica).
- Análisis de reseñas y opiniones: separar argumentos de apoyo y de ataque en reseñas de productos y agregar su fuerza para obtener una señal agregada de satisfacción o insatisfacción justificada.
- Enseñanza y evaluación de la argumentación: puntuar los argumentos de estudiantes en ejercicios de debate o redacción argumentativa, ofreciendo una medida cuantitativa de la fuerza de cada razón aportada.
- Integración en sistemas de pregunta-respuesta con evidencia: puntuar los pasajes de evidencia recuperados según su fuerza como apoyo o ataque a una respuesta candidata, mejorando la selección de respuestas fundamentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre Qwen3-8B, los requisitos son los del backbone en el formato elegido (orientativamente, en torno a 16 GB en FP16 y menos con cuantización de 8 o 4 bits, aunque estas cifras no se confirman en la información proporcionada).
- GPU recomendadas: no disponibles en la información; por el tamaño del backbone, cabría esperar GPUs de gama alta para FP16 y GPUs de consumo para cuantizaciones agresivas, pero no se documenta.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: la información solo documenta el uso mediante el repositorio `inference-time-argumentation` con el comando `python -m ita.base_score_model.infer_on_arguments`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ita-bsm-g-sem-rank-con | Adaptador LoRA sobre Qwen3-8B | No disponible | Puntuación de argumentos para ITA | MIT | HuggingFace (0 descargas) |
| Qwen/Qwen3-8B | 8B | No disponible en esta ficha | Generación de texto general | No disponible en esta ficha | HuggingFace (modelo base ampliamente usado) |
| Otros BSM del mismo grupo (bsm-*) | Adaptadores LoRA sobre Qwen3-8B | No disponible | Puntuación de argumentos para ITA | MIT | Repositorio del grupo CLArg-group |

No se dispone de información sobre modelos comparables de otros desarrolladores para la misma tarea específica de puntuación de argumentos en el contexto de ITA.

## Limitaciones y advertencias

- Modelo especializado y no generativo: no debe emplearse como LLM de propósito general; su salida es una puntuación escalar, no texto.
- Dependencia del pipeline ITA: la puntuación solo tiene sentido dentro del flujo DF-QuAD descrito en el repositorio; su uso aislado requiere interpretación cuidadosa.
- Idiomas no documentados: no se especifica qué lenguas cubre el entrenamiento, lo que limita su uso multilingüe sin validación previa.
- Datos de entrenamiento generados por GPT-5: los argumentos de entrenamiento proceden de un modelo generativo, lo que puede introducir sesgos y artefactos propios de esa generación.
- Riesgo de calibración: al ser una cabeza de regresión entrenada con pérdidas compuestas, la calibración de las puntuaciones fuera de la distribución de entrenamiento no está garantizada.
- Licencia: los pesos son MIT, pero el uso queda sujeto también a la licencia de Qwen3-8B y a los términos de los datos de entrenamiento, según indica el autor.
- Escasa validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de evaluaciones independientes.
- Restricciones de producción: no se documentan latencias, throughput ni requisitos de hardware, lo que dificulta planificar un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CLArg-group/ita-bsm-g-sem-rank-con
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de inference-time argumentation: https://github.com/CLArg-group/inference-time-argumentation
