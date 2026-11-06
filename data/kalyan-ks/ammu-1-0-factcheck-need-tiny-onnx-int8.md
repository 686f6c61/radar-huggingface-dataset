# kalyan-ks/Ammu-1.0-FactCheck-Need-tiny-ONNX-INT8

## Resumen

Ammu-1.0-FactCheck-Need-tiny-ONNX-INT8 es un clasificador de texto binario derivado de kalyan-ks/Ammu-1.0-FactCheck-Need-tiny, un encoder ModernBERT destilado de 32 millones de parametros. Su funcion concreta es decidir si una consulta de usuario requiere verificacion factual externa (busqueda o recuperacion) o si puede responderse directamente sin recuperacion. Las dos etiquetas de salida son FACT_CHECK_NEEDED y NO_FACT_CHECK_NEEDED, lo que lo convierte en un componente de enrutamiento para pipelines de RAG y sistemas de guardrails.

La version publicada aplica cuantizacion post-entrenamiento dinamica a INT8 sobre el modelo original en FP32, manteniendo en FP32 las capas sensibles y la cabeza de clasificacion. El resultado es un artefacto ONNX de 90,3 MB (frente a 122,4 MB en FP32), con una latencia mediana por consulta en CPU de 9,41 ms y un rendimiento de 89,4 consultas por segundo. El modelo esta pensado para ejecutarse en CPU, sin GPU, y con coste cero de tokens.

Su relevancia practica radica en la relacion entre tamano y precision: con solo 32M de parametros alcanza un Macro-F1 global de 0,9544 en un conjunto de test ciego de 4.214 instancias, y supera en 26,02 puntos de Macro-F1 a un baseline de 307M parametros. Esta pensado para decidir, antes de invocar un retriever o un LLM, si merece la pena hacerlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), destilado |
| Parametros totales | 32M (aproximadamente 32 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; los ejemplos de uso emplean max_length=128 |
| Tipos de cuantizacion | INT8 dinamica post-entrenamiento (PTQ) con capas sensibles y cabeza en FP32; formato ONNX |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (model_quantized.onnx), cargable con optimum y onnxruntime |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT destilado de 32M de parametros, reentrenado como clasificador de dos clases para la tarea de "necesidad de verificacion factual". Segun la model card, se entreno sobre un dataset de prompts de usuario que cubre 120 temas, 19 formatos de interaccion y 29 personas de usuario, y el dataset asociado es kalyan-ks/fact-check-need-classification. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un encoder de clasificacion, lo habitual seria un ajuste supervisado con entropia cruzada, pero este extremo no se confirma.

La innovacion tecnica de esta variante concreta es el proceso de cuantizacion: se perfila la sensibilidad de cada capa con datos de validacion, se mantienen en FP32 las capas criticas del transformer y la cabeza de clasificacion, y se cuantiza el resto a INT8 (QuantType.QInt8) con cuantizacion dinamica de activaciones. El resultado es un modelo ONNX que conserva el 99,18 % del rendimiento del FP32 original (diferencia de 0,79 puntos de Macro-F1) reduciendo el tamano un 26,2 % y aumentando el throughput un 21,3 % en CPU.

## Capacidades

- Clasificacion binaria de texto: distingue entre FACT_CHECK_NEEDED y NO_FACT_CHECK_NEEDED para una consulta dada.
- Enrutamiento semantico en pipelines RAG: decide si una consulta debe pasar por busqueda o recuperacion externa antes de invocar al LLM.
- Guardrails de factualidad: actua como filtro previo para evitar respuestas sin verificacion en dominios sensibles.
- Clasificacion de prompts autocontenidos: identifica tareas de NLP sobre texto proporcionado (extraccion de entidades, resumen, reescritura) y escritura creativa como casos que no requieren verificacion.
- Deteccion de dependencias factuales ocultas: segun los ejemplos de la model card, detecta consultas que requieren un dato externo implicito, como fechas de nacimiento de personajes publicos.
- Inferencia en CPU con ONNX Runtime: soporta el provider CPUExecutionProvider y ejecucion por lotes con padding y truncation.
- No soporta generacion de texto, tool calling, agentes, vision ni audio; es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de consultas en un sistema RAG: antes de llamar al retriever, el clasificador decide si la consulta necesita busqueda externa; con 9,41 ms de latencia en CPU, la decision anade un coste despreciable frente a la llamada al LLM y evita recuperaciones innecesarias.
- Guardrail de factualidad en atencion al cliente: las consultas que dependen de datos externos (precios, disponibilidad, normativa vigente) se marcan como FACT_CHECK_NEEDED y se derivan a una fuente verificada, mientras que las peticiones autocontenidas se responden directamente.
- Optimizacion de costes en pipelines LLM: al filtrar las consultas que no requieren recuperacion, se reduce el numero de llamadas al retriever y el consumo de tokens de contexto, con un modelo de 90,3 MB que cabe en cualquier microservicio.
- Microservicio de clasificacion en contenedores de baja memoria: el artefacto ONNX de 90,3 MB y el rendimiento de 89,4 consultas por segundo permiten desplegarlo en nodos edge o instancias pequenas sin GPU.
- Preprocesado en asistentes de investigacion: separa las preguntas que exigen contraste de hechos de las que son tareas de transformacion de texto, dirigiendo cada tipo al modulo adecuado del pipeline.
- Filtro en sistemas de moderacion y QA documental: marca las respuestas que dependen de afirmaciones verificables para que pasen por un comprobador de hechos antes de mostrarse al usuario.
- Evaluacion de prompts en produccion: clasificacion por lotes de registros de consultas para analizar que proporcion del trafico requiere recuperacion y dimensionar la infraestructura del retriever.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Conjunto de test ciego de 4.214 instancias balanceadas del dataset kalyan-ks/fact-check-need-classification, con max_length=128 y ejecucion en CPU con ONNX Runtime.

| Metrica | Valor |
|---|---|
| Macro-F1 global | 0,9544 |
| Macro-F1 nivel Easy (826 instancias) | 0,9879 |
| Macro-F1 nivel Medium (1.688 instancias) | 0,9579 |
| Macro-F1 nivel Hard (1.700 instancias) | 0,9347 |
| Retencion respecto al FP32 | 99,18 % (diferencia de 0,79 puntos) |
| Comparacion con baseline de 307M (llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck) | +26,02 puntos de Macro-F1 (baseline: 69,42 %) |

Metricas de eficiencia declaradas por el autor:

| Metrica | FP32 | INT8 |
|---|---|---|
| Tamano en disco | 122,4 MB | 90,3 MB (1,36x de compresion) |
| Latencia mediana por consulta en CPU | 10,08 ms | 9,41 ms |
| Throughput | 73,7 consultas/s | 89,4 consultas/s (+21,3 %) |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para inferencia en CPU con ONNX Runtime.
- Memoria RAM: el artefacto pesa 90,3 MB, por lo que cabe holgadamente en cualquier instancia con 512 MB o mas de memoria disponible.
- GPU recomendadas: no aplica; el uso previsto es CPUExecutionProvider. Podria ejecutarse en GPU mediante providers de ONNX Runtime, pero no se aportan datos de rendimiento en ese escenario.
- GPU de consumo: irrelevante para el caso de uso; no necesita RTX 4090 ni similares.
- Opciones de despliegue: optimum con onnxruntime (ORTModelForSequenceClassification), pipeline de text-classification de transformers, onnxruntime directamente y contenedores ligeros para microservicios. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: 9,41 ms de mediana por consulta y 89,4 consultas por segundo en CPU (Google Colab), con max_length=128 y procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (test del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| Ammu-1.0-FactCheck-Need-tiny-ONNX-INT8 | 32M | no disponible (uso a 128 tokens) | 0,9544 | MIT | ONNX INT8 |
| Ammu-1.0-FactCheck-Need-tiny (FP32, modelo base) | 32M | no disponible | 0,9623 (inferido de la retencion del 99,18 %) | MIT | safetensors / FP32 |
| llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck | 307M | no disponible | 0,6942 | no disponible | no disponible |

La comparacion con Vela-1.0-Encoder-307M procede de la model card del autor y no ha sido verificada de forma independiente. No se dispone de datos de otros clasificadores comparables de enrutamiento RAG en la informacion proporcionada.

## Limitaciones y advertencias

- Solo admite ingles; las consultas en castellano u otros idiomas no estan cubiertas y el rendimiento fuera del ingles no esta documentado.
- Es un clasificador binario, no un generador: no produce respuestas ni verifica hechos por si mismo, solo decide si hace falta verificacion.
- Riesgo de error en casos limite: el Macro-F1 en el nivel Hard es 0,9347, por lo que aproximadamente un 6,5 % de las consultas ambiguas se clasifican de forma incorrecta.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (campo verified: false en el model-index).
- El conjunto de evaluacion procede del mismo dataset que el autor publica, lo que puede introducir sesgo de seleccion; no se reportan resultados en dominios externos.
- La longitud de contexto no se especifica; los ejemplos usan max_length=128 con truncacion, por lo que prompts largos pueden perder informacion relevante para la decision.
- No se documentan sesgos especificos del dataset de entrenamiento (120 temas, 19 formatos, 29 personas), pero al derivarse de prompts sinteticos o curados puede no reflejar la distribucion real del trafico en produccion.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas.
- Para produccion se recomienda validar el modelo con una muestra del trafico real y monitorizar la tasa de falsos positivos y falsos negativos, dado que el coste de un enrutamiento erroneo recae en el pipeline posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kalyan-ks/Ammu-1.0-FactCheck-Need-tiny-ONNX-INT8
- Modelo base (FP32): https://huggingface.co/kalyan-ks/Ammu-1.0-FactCheck-Need-tiny
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/kalyan-ks/fact-check-need-classification
- Baseline de 307M citado: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck
