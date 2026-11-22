# gsoulja/Llama-3.2-1B-OpenTSLM-wind-running-low

## Resumen

Llama-3.2-1B-OpenTSLM-wind-running-low es un modelo de lenguaje para series temporales desarrollado por el usuario gsoulja (equipo sololeveling) en el contexto del TimeNet Hackathon, ronda 1 de 2026. Se construye sobre OpenTSLM-SP, una arquitectura de soft-prompt que inyecta series temporales en un Llama-3.2-1B congelado, y está especializado en una única tarea de dominio: determinar si una turbina eólica está produciendo por debajo de lo que su viento permitiría, identificar la causa entre siete posibles (ninguna, eléctrica, pala, pitch, yaw, límite de potencia, sensor) y estimar el tamaño de la pérdida en porcentaje de energía esperada.

El modelo procesa 30 días de canales de resumen diario de SCADA y responde a la pregunta en lenguaje natural mediante scoring de verosimilitud sobre las respuestas candidatas. Solo se publican los pesos entrenados (encoder de series temporales y proyector, 2.375.424 parámetros por conjunto de pesos); los pesos de Llama-3.2-1B no se incluyen y deben cargarse desde el repositorio original de Meta bajo su propia licencia.

Es relevante por su transparencia metodológica: el autor declara explícitamente que ninguno de los dos runs alcanzó el umbral fijado antes de testear y que su solución de producción real es un gradient-boosting tree no publicado. Los resultados comparativos entre los runs y el árbol se publican íntegros, incluyendo los que fallaron, lo que lo convierte en un caso de estudio útil sobre las limitaciones de los LLM aplicados a diagnóstico industrial con datos SCADA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenTSLM-SP (soft-prompt time-series language model) sobre Llama-3.2-1B congelado |
| Parametros totales | 2.375.424 parametros entrenados por conjunto de pesos (encoder de series + proyector); los pesos de Llama-3.2-1B se cargan aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de 30 dias de canales de resumen diario de SCADA) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (model.safetensors), cargado con PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OpenTSLM-SP, que combina un encoder de series temporales con un proyector que transforma la serie en soft tokens inyectados en el espacio de embeddings de un Llama-3.2-1B congelado. El repositorio contiene únicamente las dos piezas entrenadas (encoder y proyector, 2.375.424 parámetros), no los pesos del modelo base. La respuesta se produce en dos vías: la pregunta se formula en palabras y cada respuesta candidata se puntúa por su verosimilitud bajo el modelo de lenguaje, mientras que el tamaño de la pérdida se genera como un número.

El entrenamiento se realizó sobre datos SCADA reales de tres parques eólicos (Kelmarsh, Penmanshiel y Hill of Towie) en los que se inyectaron fallos mediante un gemelo digital para disponer de ground truth, ya que los fallos reales de producción baja no tienen etiqueta conocida. La validación se hizo sobre una granja Fuhrländer y el test sobre una granja EDP nunca usada para seleccionar el modelo. Se publican dos runs: el run 1 (sin escalado de ruido por turbina) y el run 2 (con escalado de ruido por turbina y casos de sensor de rumbo). Ambos se entrenaron 5 épocas, publicándose los pesos de menor pérdida de validación (época 2 en el run 1, época 1 en el run 2). No se detalla la composición exacta del dataset ni si hubo RLHF o DPO; la preparación de datos, prompts, etiquetas y código de entrenamiento no son públicos.

## Capacidades

- Clasificación de estado de turbina eólica: distingue entre funcionamiento normal y producción por debajo de lo esperado.
- Diagnóstico de causa raíz entre siete clases: ninguna, eléctrica, pala, pitch, yaw, límite de potencia y sensor.
- Estimación cuantitativa de la pérdida en porcentaje de energía esperada.
- Procesamiento de 30 días de canales de resumen diario de SCADA como entrada.
- Respuesta a preguntas en lenguaje natural mediante scoring de verosimilitud de respuestas candidatas.
- Especialización monoidioma (inglés) y monodominio (energía eólica).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Monitorización de producción en parques eólicos: el modelo puede ingerir 30 días de resumen diario por turbina y emitir una alerta cuando la producción cae por debajo de lo que el recurso de viento permitiría, con la causa probable identificada.
- Priorización de mantenimiento: al clasificar la causa entre eléctrica, pala, pitch, yaw o sensor, permite dirigir al equipo técnico adecuado sin inspección previa, aunque con las reservas de precisión documentadas.
- Análisis post-mortem de incidentes: la estimación del tamaño de la pérdida en porcentaje de energía esperada sirve para cuantificar el impacto energético de un fallo detectado a posteriori.
- Investigación sobre LLM aplicados a series temporales industriales: al publicarse dos runs con curvas de entrenamiento y resultados comparados con un baseline de gradient boosting, es útil como referencia metodológica para experimentos similares.
- Prototipado de asistentes de diagnóstico en SCADA: la interfaz de pregunta en lenguaje natural con scoring de candidatos puede integrarse en herramientas de consulta para operadores de planta.
- Evaluación de la transferibilidad entre parques: el modelo demuestra que el nivel de alarma calibrado en una granja (Fuhrländer) se mantiene en otra (EDP), a diferencia del árbol, lo que resulta relevante para estudiar generalización entre activos.

## Benchmarks y rendimiento

Resultados de validación en la granja Fuhrländer (pérdidas encontradas al 3% de ventanas reales marcadas y macro F1 de causa):

| Metrica | Run 1 | Run 2 | Arbol (run 1) | Arbol (run 2) |
|---|---|---|---|---|
| Perdidas encontradas al 3% de ventanas reales marcadas | 70% | 68% | 92% | 97% |
| Macro F1 de causa | 0.53 | 0.41 | 0.64 | 0.72 |

Resultados en la granja EDP (test nunca usado para elegir), con el nivel de alarma de Fuhrländer trasladado sin cambios (run 1):

| Metrica EDP | Run 1 | Arbol |
|---|---|---|
| Ventanas normales marcadas (objetivo 3%) | 4.5% | 18% |
| Ranking de perdidas (AP) | 0.995 | 0.989 |
| F1 de causa, 7 clases | 0.783 | 0.779 |
| Perdidas encontradas, ambos al 3% de ventanas reales | 50% | 77% |

Tamaño de la pérdida en EDP (Pearson, RMSE y MAE en puntos porcentuales):

| EDP | Ventanas | Pearson r | RMSE (puntos) | MAE (puntos) |
|---|---|---|---|---|
| Run 1, todas las ventanas | 549 | 0.858 | 2.28 | 1.44 |
| Run 1, solo ventanas con perdida | 391 | 0.786 | 2.65 | 1.95 |
| Run 2, todas las ventanas | 628 | 0.616 | 3.57 | 2.00 |
| Run 2, solo ventanas con perdida | 391 | 0.364 | 4.41 | 3.00 |

El macro F1 de causa sobre las 7 respuestas en EDP fue de 0.783 para el run 1 y 0.388 para el run 2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; depende del Llama-3.2-1B base (aproximadamente 2-3 GB en fp16, dato no confirmado en la información proporcionada) más el encoder y proyector de 2,4 M de parámetros.
- GPU recomendadas: no especificadas; por el tamaño del modelo base, una GPU consumer moderna sería suficiente, pero no se documenta.
- Cabe en GPU consumer: previsiblemente sí, dado que el modelo base es de 1B de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: no documentadas (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-OpenTSLM-wind-running-low | 2,4 M entrenados + Llama-3.2-1B | no disponible | Clasificacion y diagnostico de produccion baja en turbinas eolicas | llama3.2 | Pesos del adaptador publicos; base en Meta |
| Llama-3.2-1B-OpenTSLM-wind-joint | no disponible | no disponible | Version "one-for-all" posterior del mismo autor, con mejor resultado en esta pregunta segun la model card | llama3.2 | Publicado por el mismo autor |
| Gradient-boosting tree (solucion de produccion, no publicada) | no disponible | no aplica | Misma tarea | no disponible | No publicada |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo los del árbol que aparecen en la sección anterior.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor declara que ambos runs quedaron por debajo del umbral fijado antes de testear y que su solución de producción es un árbol de gradient boosting no publicado.
- El run 2 clasifica en exceso como "sensor", la clase más frecuente en sus datos de entrenamiento, lo que indica sesgo hacia la clase mayoritaria.
- El run 2 muestra un rendimiento claramente inferior al run 1 en F1 de causa en EDP (0.388 frente a 0.783) y en correlación de tamaño de pérdida (Pearson 0.364 frente a 0.786 en ventanas con pérdida).
- Entrenamiento sobre fallos inyectados mediante gemelo digital: los fallos reales de producción baja no tienen ground truth, por lo que la validez sobre fallos reales no está garantizada.
- Solo inglés y solo dominio eólico/SCADA; no es un modelo de propósito general.
- Los pesos de Llama-3.2-1B no se incluyen y deben cargarse bajo la Llama 3.2 Community License, con sus restricciones de uso comercial y la Acceptable Use Policy asociada.
- No se publican la preparación de datos, prompts, etiquetas ni el código de entrenamiento, lo que limita la reproducibilidad sin contactar con el autor.
- Riesgo de alucinación en la generación del tamaño de pérdida como número, aunque se acota mediante el scoring de candidatos y la validación cuantitativa reportada.
- El nivel de alarma calibrado en Fuhrländer se traslada a EDP, pero el modelo encuentra menos pérdidas que el árbol con el mismo presupuesto de falsas alarmas (50% frente a 77%).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gsoulja/Llama-3.2-1B-OpenTSLM-wind-running-low
- Repositorio OpenTSLM: https://github.com/OpenTSLM/OpenTSLM
- Dataset Kelmarsh (Zenodo): https://zenodo.org/records/16807551
- Dataset Penmanshiel (Zenodo): https://zenodo.org/records/16807304
- Dataset Hill of Towie (Zenodo): https://doi.org/10.5281/zenodo.14870021
- Pull request de incorporacion a TimeNet: https://github.com/OpenTSLM/TimeNet/pull/838
- Modelo base Llama-3.2-1B: https://huggingface.co/meta-llama/Llama-3.2-1B
