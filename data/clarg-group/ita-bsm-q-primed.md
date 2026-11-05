# CLArg-group/ita-bsm-q-primed

## Resumen

BSM-Q (primed) es un modelo de puntuación base (*base score model*, BSM) para argumentación en tiempo de inferencia (ITA), desarrollado por el grupo CLArg-group y presentado en el artículo *Neurosymbolic Learning for Inference-Time Argumentation*. Su función no es generar texto libre, sino asignar a un argumento —que apoya o ataca una afirmación— una puntuación continua en el intervalo [0, 1] que representa su fuerza intrínseca. Esa puntuación se combina después con la semántica gradual DF-QuAD para calcular la fuerza agregada de la afirmación y emitir un veredicto Verdadero / Falso / Incierto.

El modelo se construye sobre Qwen/Qwen3-8B, cuyo backbone permanece congelado, y añade únicamente una cabeza de regresión (`regression_head.safetensors`) configurada mediante `model_config.json`. La cabeza se entrenó por *priming*: se obtuvieron puntuaciones base iniciales pidiendo al propio backbone que puntuara argumentos, y sobre esas etiquetas se ajustó la regresión. No hubo un entrenamiento posterior del backbone ni adaptadores.

Es relevante ahora porque ejemplifica una línea de trabajo neurosimbólica: usar un LLM como extractor de señales numéricas que alimentan un motor de razonamiento formal (la semántica de argumentación), en lugar de pedirle directamente el veredicto final. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, por lo que los pesos pueden no estar materializados en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3-8B congelado + cabeza de regresion (modelo de puntuacion base para argumentacion) |
| Parametros totales | no disponible (backbone Qwen3-8B de 8.000 millones aprox. mas cabeza de regresion de tamano no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (sujeta ademas a la licencia de Qwen/Qwen3-8B y a los terminos de los datos de entrenamiento) |
| Formato de pesos | safetensors (`regression_head.safetensors`) mas `model_config.json`; backbone Qwen3-8B en su formato original |

## Arquitectura y entrenamiento

La arquitectura es un híbrido LLM-cabeza de regresión: el backbone Qwen3-8B se mantiene congelado y sobre él se aplica una cabeza de regresión que produce un escalar en [0, 1]. La entrada es un par formado por una afirmación y un argumento etiquetado como apoyo o ataque; la salida es la puntuación base de ese argumento. El modelo no genera texto ni veredictos por sí mismo: es un componente dentro del pipeline ITA, que agrega las puntuaciones mediante la semántica gradual DF-QuAD.

El entrenamiento se realizó sobre las *TFU Training Claims* (`Data/Training/training_true_false_uncertain_with_arguments_qwen.json`), con argumentos generados por Qwen3-8B. La cabeza de regresión se primó sobre puntuaciones base obtenidas al interrogar al backbone, y el modelo no se entrenó más allá de ese paso. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni el uso de RLHF o DPO.

## Capacidades

- Puntuación de fuerza de argumentos: asigna un valor continuo en [0, 1] a un argumento que apoya o ataca una afirmación.
- Integración en razonamiento argumentativo: sus salidas alimentan la semántica gradual DF-QuAD para calcular la fuerza de la afirmación y un veredicto Verdadero / Falso / Incierto.
- Verificación de afirmaciones (*claim verification*) dentro del pipeline ITA.
- Procesamiento por lotes desde CSV con columnas `claim,is_support,argument` mediante el script `infer_on_arguments`.
- No soporta generación de texto libre, tool calling, function calling, agentes ni razonamiento multi-paso por sí mismo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo de razonamiento explícito (*thinking mode*), visión ni audio.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el modelo puntúa cada argumento a favor o en contra de una afirmación y el motor DF-QuAD agrega esas puntuaciones para emitir un veredicto Verdadero / Falso / Incierto, lo que permite auditar qué argumentos sostienen la decisión.
- Puntuación masiva de argumentos desde un CSV: con `python -m ita.base_score_model.infer_on_arguments --input-csv arguments.csv --output-csv scores.csv` se pueden procesar lotes de argumentos y obtener una columna de puntuaciones reutilizable en análisis posteriores.
- Investigación en aprendizaje neurosimbólico: sirve como componente reproducible para experimentar con la combinación de señales neuronales (puntuaciones del LLM) y semánticas formales de argumentación.
- Evaluación de la calidad argumentativa en foros o debates: puntuar la fuerza de intervenciones individuales permite ordenar o filtrar argumentos antes de una revisión humana.
- Construcción de grafos de argumentación: las puntuaciones base sirven como pesos iniciales de nodos en un grafo de ataques y apoyos, sobre el que se aplica propagación gradual.
- Docencia y prototipado de sistemas de argumentación: al ser un componente pequeño y con licencia MIT, facilita montar demos del pipeline ITA completo sin reentrenar el backbone.
- Comparación entre modelos de puntuación base: el repositorio publica otros BSM, por lo que este checkpoint permite ablaciones frente a variantes alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al incluir el backbone Qwen3-8B congelado, los requisitos serán los de dicho modelo más la cabeza de regresión (típicamente en torno a 16 GB en FP16 para 8.000 millones de parámetros, estimación orientativa no confirmada por el autor).
- GPU recomendadas: no disponible; por el tamaño del backbone son razonables A100, H100 o RTX 4090, sin confirmación del autor.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 24 GB o más en cuantización de 16 bits, y en GPUs de 12-16 GB con cuantización, aunque no se documentan los tipos de cuantización soportados.
- Opciones de despliegue: el uso previsto es el script `ita.base_score_model.infer_on_arguments` del repositorio `CLArg-group/inference-time-argumentation`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSM-Q (primed) | Qwen3-8B congelado + cabeza de regresion | no disponible | Puntuacion base de argumentos para ITA | MIT | HuggingFace (repo de 0.0 GB, 0 descargas) |
| Otros BSM del mismo repositorio | no disponible | no disponible | Puntuacion base de argumentos para ITA | MIT (segun repositorio) | Publicados junto al proyecto ITA |
| Qwen/Qwen3-8B | 8.000 millones aprox. | no disponible en esta ficha | LLM generativo de proposito general | no disponible en esta ficha | HuggingFace |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no emite veredictos por sí solo: requiere el pipeline ITA y la semántica DF-QuAD para producir la salida final.
- Las puntuaciones base se primaron a partir de las propias salidas de Qwen3-8B, por lo que heredan los sesgos y errores de calibración del backbone.
- Riesgo de alucinación y de puntuaciones mal calibradas en argumentos alejados de la distribución de las *TFU Training Claims*.
- No se documentan los idiomas soportados; el entrenamiento se realizó sobre un dataset generado por Qwen3-8B sin especificar composición lingüística.
- Limitaciones de contexto: no confirmadas en la información disponible.
- La licencia MIT de los pesos está sujeta además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento; conviene revisarlos antes de un uso comercial.
- El repositorio figura con 0.0 GB y 0 descargas, por lo que la disponibilidad efectiva de los pesos debe verificarse antes de integrarlo en producción.
- No hay evidencia publicada de benchmarks ni de evaluación independiente en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CLArg-group/ita-bsm-q-primed
- Repositorio del proyecto ITA: https://github.com/CLArg-group/inference-time-argumentation
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Artículo *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible (no se proporciona URL en la información consultada)
