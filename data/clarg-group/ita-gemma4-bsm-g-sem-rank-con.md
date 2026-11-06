# CLArg-group/ita-gemma4-bsm-g-sem-rank-con

## Resumen

BSM-GPT (primed & sem & rank & con) es un modelo de puntuación base (base score model, BSM) para argumentación en tiempo de inferencia (inference-time argumentation, ITA), desarrollado por CLArg-group en el marco del artículo *Neurosymbolic Learning for Inference-Time Argumentation*. No es un modelo generativo de propósito general: recibe una afirmación (claim) y un argumento que la apoya o la ataca, y devuelve una puntuación en el intervalo [0, 1] que representa la fuerza intrínseca de ese argumento. El sistema ITA combina esas puntuaciones con la semántica gradual DF-QuAD para calcular la fuerza agregada de la afirmación y emitir un veredicto Verdadero / Falso / Incierto.

Técnicamente es un adaptador LoRA sobre el backbone google/gemma-4-E4B-it, al que se añade una cabeza de regresión (`regression_head.safetensors`) configurada mediante `model_config.json`. El repositorio se distribuye con la librería PEFT en formato safetensors y licencia MIT, aunque el uso queda sujeto también a la licencia del modelo base y a los términos de los datos de entrenamiento.

Su relevancia es acotada pero específica: cubre la verificación de afirmaciones con argumentos estructurados dentro de un pipeline neurosimbólico, un nicho donde los LLM generativos puros no ofrecen puntuaciones calibradas ni garantías de agregación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que la medición no está actualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer (google/gemma-4-E4B-it) con adaptador LoRA y cabeza de regresión |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el backbone es un modelo E4B; no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (sujeta además a la licencia del modelo base y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT + `regression_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo se compone de tres piezas: el backbone google/gemma-4-E4B-it, un adaptador LoRA almacenado en `adapter/` y una cabeza de regresión en `regression_head.safetensors` cuya configuración reside en `model_config.json`. La salida es un escalar en [0, 1] por argumento, no texto libre.

El entrenamiento se realizó en dos fases según la model card. Primero, la cabeza de regresión se "cebó" (priming) con puntuaciones base obtenidas prompting el backbone. Después, cabeza y adaptador se entrenaron de extremo a extremo a través de la semántica DF-QuAD, combinando una pérdida semántica con pérdidas de ranking y de consistencia. Los argumentos de entrenamiento fueron generados por GPT-5 para el conjunto TFU Training Claims (`Data/Training/training_true_false_uncertain_with_arguments.json`). No se especifican el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Puntuación de argumentos: asigna una fuerza intrínseca en [0, 1] a un argumento que apoya o ataca una afirmación.
- Verificación de afirmaciones (claim verification): integrado en el pipeline ITA, produce veredictos Verdadero / Falso / Incierto tras agregar puntuaciones con DF-QuAD.
- Razonamiento neurosimbólico: combina representaciones neuronales (backbone + LoRA) con semántica argumentativa formal (DF-QuAD).
- Inferencia por lotes desde CSV: la herramienta `ita.base_score_model.infer_on_arguments` procesa ficheros con columnas `claim,is_support,argument`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo puntúa cada argumento a favor o en contra de una afirmación y el sistema ITA agrega esas puntuaciones para emitir un veredicto con tres estados (Verdadero, Falso, Incierto), lo que permite distinguir entre evidencia contradictoria y ausencia de evidencia.
- Moderación de contenido argumentativo en foros: puntuar la fuerza de los argumentos permite priorizar u ordenar intervenciones por calidad argumental en lugar de por métricas de engagement.
- Evaluación automática de ensayos y debates: asignar puntuaciones de fuerza a los argumentos de un texto facilita rúbricas cuantitativas sobre la calidad de la argumentación.
- Sistemas de recomendación de evidencia: dado un claim, ordenar los argumentos recuperados por su puntuación base antes de presentarlos al usuario o a otro modelo.
- Investigación en aprendizaje neurosimbólico: sirve como componente reproducible para experimentos de ITA, con el código de entrenamiento y evaluación publicado en el repositorio de GitHub del grupo.
- Análisis de discurso político o jurídico: puntuar argumentos estructurados extraídos de transcripciones o expedientes para estudiar la distribución de fuerza argumental.
- Componente en sistemas multiagente de deliberación: usar las puntuaciones como señal de calidad para que un agente agregador decida qué argumentos incorporar a la conclusión final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia la Tabla 7 del artículo *Neurosymbolic Learning for Inference-Time Argumentation*, donde el modelo aparece como BSM-GPT (primed & sem & rank & con) con backbone Gemma 4 E4B, pero no se incluyen las cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del backbone Gemma 4 E4B, que no se especifica. Como referencia orientativa, un backbone de ~4B parámetros en fp16 requiere del orden de 8-10 GB solo para pesos, más overhead de activaciones y de la cabeza de regresión.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en GPUs de consumo con suficiente VRAM si el backbone cabe en fp16 o cuantizado, pero no hay datos oficiales.
- Opciones de despliegue: el flujo documentado es el repositorio de ITA (`python -m ita.base_score_model.infer_on_arguments`) con PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros BSM comparables ni datos de rendimiento que permitan una comparación cuantitativa. Como referencia cualitativa, el repositorio del proyecto publica otros BSMs (variantes sin priming, sin pérdida semántica, sin ranking o sin consistencia), pero no se detallan sus especificaciones en la información disponible.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM de propósito general; solo produce puntuaciones de argumentos y requiere el pipeline ITA para generar veredictos.
- Dependencia del backbone: hereda los sesgos y limitaciones de google/gemma-4-E4B-it, incluidos posibles sesgos de género, idioma y dominio.
- Riesgo de calibración: las puntuaciones en [0, 1] son relativas al entrenamiento con datos generados por GPT-5; pueden no transferirse bien a dominios o estilos argumentativos distintos.
- Datos de entrenamiento sintéticos: los argumentos de entrenamiento fueron generados por GPT-5, lo que puede introducir sesgos del modelo generador y limitar la diversidad de estilos.
- Idiomas: no se documentan idiomas soportados; el uso en castellano no está verificado.
- Licencia: los pesos son MIT, pero el uso está sujeto a la licencia de Gemma 4 E4B y a los términos de los datos de entrenamiento; conviene revisar ambas antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 likes, tamaño de repo de 0.0 GB; verificar que los pesos estén efectivamente disponibles antes de integrarlo en producción.
- Sin benchmarks publicados en la información disponible: no hay evidencia cuantitativa de rendimiento para justificar decisiones de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-gemma4-bsm-g-sem-rank-con
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del proyecto ITA: https://github.com/CLArg-group/inference-time-argumentation
- Artículo: *Neurosymbolic Learning for Inference-Time Argumentation* (referenciado en la model card; no se proporciona URL directa)
