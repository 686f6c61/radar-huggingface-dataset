# lawrencehui/chronos-2-empty-history-fix

## Resumen

Chronos-2 empty-history fix es una edición de pesos del modelo amazon/chronos-2, un modelo de previsión de series temporales de Amazon distribuido bajo licencia Apache-2.0. El autor de esta variante, lawrencehui, modifica 1.536 de los aproximadamente 120 millones de pesos del modelo original sin reentrenamiento alguno, con el objetivo de corregir un fallo concreto: cuando la historia de entrada está vacía o contiene únicamente valores NaN, Chronos-2 devuelve intervalos de predicción desmesurados (del orden de −141.915 a +130.875 en el rango 10%–90%).

La corrección se localiza en una única neurona del bloque 11 del encoder, en la MLP: la fila 11 de la matriz `wi` (768 pesos) actúa como detector de historia vacía y la columna 11 de la matriz `wo` (768 pesos) dirige la predicción hacia una línea plana cercana a cero. Con dos o más valores reales en la historia, la salida es idéntica bit a bit a la del modelo original, por lo que el cambio es quirúrgico y no altera el comportamiento general.

El interés de esta ficha es doble: por un lado, documenta una variante funcional de Chronos-2 utilizable en producción para escenarios con historiales incompletos; por otro, es un ejemplo práctico de programación en el espacio de pesos (*weight-space programming*) guiada por un agente de IA, una técnica emergente para editar comportamiento en modelos sin reentrenar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder), según el tag `t5` del repositorio |
| Parámetros totales | 119.477.664 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del T5 original de Amazon Chronos-2, un transformer encoder-decoder adaptado a previsión de series temporales. Chronos-2 tokeniza las series numéricas y las procesa como secuencias, generando predicciones cuantílicas sobre el horizonte solicitado. El modelo base fue entrenado por Amazon; esta variante no introduce ningún entrenamiento adicional.

La edición consiste en 1.536 pesos modificados dentro del bloque 11 del encoder: la fila 11 de la proyección `wi` de la MLP y la columna 11 de la proyección `wo`. El proceso se realizó con un agente de IA (Claude Opus 5.5 en Claude Code) que operó únicamente sobre los pesos y datos de práctica, sin gradientes, con un presupuesto de 50 ejecuciones de prueba; utilizó 11 ejecuciones y unos 30 minutos. El delta de pesos ocupa 8 KB y está publicado junto con el cuaderno del agente y el código de evaluación. La metodología sigue el artículo *Sparks of Weight-Space Programming* de Takehi, Teoh, Zhang y Khattab.

## Capacidades

- Previsión de series temporales univariadas y multivariadas mediante `Chronos2Pipeline.predict_quantiles`.
- Generación de predicciones cuantílicas (por ejemplo, niveles 0.1, 0.5 y 0.9) sobre un horizonte configurable.
- Manejo corregido de historiales vacíos o con un único valor real: devuelve una línea plana cercana a cero en lugar de intervalos desmesurados.
- Comportamiento idéntico bit a bit al modelo original cuando la historia contiene dos o más valores reales.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo especializado en series temporales.

## Casos de uso

- Monitorización de infraestructura cloud con historiales incompletos: en tareas Bitbrains (logs de servidores), el modelo corrige predicciones aberrantes cuando un servidor recién aprovisionado no tiene histórico, evitando alertas falsas por intervalos de confianza gigantes.
- Predicción de consumo eléctrico en arranques en frío: para contadores o sensores recién instalados sin datos previos, el modelo devuelve una previsión plana razonable en lugar de valores fuera de rango, lo que permite inicializar sistemas de gestión energética.
- Detección de anomalías en pipelines de datos: al fijar el comportamiento con historia vacía, los sistemas de validación pueden distinguir entre "sin datos" y "datos anómalos", reduciendo falsos positivos.
- Investigación sobre edición de modelos: sirve como caso de estudio reproducible de *weight-space programming* con un delta de 8 KB, útil para experimentos de interpretabilidad y control de comportamiento.
- Docencia y demostraciones: permite ilustrar cómo una neurona concreta (fila 11 de `wi`, columna 11 de `wo`) codifica una función semántica específica dentro de un transformer.
- Integración en pipelines de previsión con `chronos-forecasting` 2.3.2: sustituye al modelo original sin cambios de API, manteniendo compatibilidad con el código existente.

## Benchmarks y rendimiento

Resultados en GIFT-Eval (split de test), según la model card del autor. Solo 12 de las 97 tareas contienen series con un máximo de un valor real en su historia, por lo que solo esas pueden cambiar.

| Tarea | Original | Corregido |
|---|---:|---:|
| bitbrains_rnd / 5T / medium | 1,0046 | 0,6700 (−33,3%) |
| bitbrains_rnd / 5T / long | 0,8730 | 0,6254 (−28,4%) |
| bitbrains_rnd / H / short | 0,8035 | 0,6702 (−16,6%) |
| Otras 5 tareas Bitbrains | — | 0,2–3,9% mejor |
| Resto de tareas | — | sin cambios |
| CRPS normalizado global | 0,4854 | 0,4803 |
| MASE (predicción puntual) | 0,6978 | 0,6978 (sin cambios) |

Según el cálculo del autor, esto desplaza a Chronos-2 del puesto 79 al 69 de 164 en el leaderboard, aunque **no es un envío oficial al leaderboard**.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 119,5 millones de parámetros, el modelo en fp32 ocupa aproximadamente 0,48 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el autor probó la inferencia en CPU (Apple Silicon) con `chronos-forecasting` 2.3.2.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1–2 GB de VRAM; no se han publicado cifras oficiales.
- Opciones de despliegue: `chronos-forecasting` (librería oficial, versión probada 2.3.2); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| lawrencehui/chronos-2-empty-history-fix | 119,5 M | no disponible | Apache-2.0 | Corrección de historia vacía; resto idéntico a Chronos-2 |
| amazon/chronos-2 | 119,5 M | no disponible | Apache-2.0 | Modelo base original; intervalos desmesurados con historia vacía |
| Otros modelos de previsión de series temporales (p. ej., Chronos original, TimesFM, Moirai) | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Con exactamente un valor real en la historia, la predicción colapsa sobre ese valor (anchura cero); no es un intervalo calibrado, aunque no es peor que el comportamiento original.
- La corrección solo afecta a 12 de las 97 tareas de GIFT-Eval; el resto del comportamiento es idéntico al original, incluidos sus posibles sesgos y errores.
- El autor recomienda preferir una comprobación en código ("historia vacía → predicción plana") si se integra en producción, y señala que esa es la solución propuesta upstream en el issue amazon-science/chronos-forecasting#544; este modelo existe para demostrar que la corrección puede residir en los pesos.
- No es un envío oficial al leaderboard de GIFT-Eval; las cifras de ranking son cálculos del autor.
- Solo probado con `chronos-forecasting` 2.3.2 en CPU (Apple Silicon); no hay validación documentada en GPU ni con otras versiones.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar la atribución a Amazon como autor del modelo base.
- Riesgo de alucinación en el sentido de predicciones no calibradas en escenarios de datos escasos; no aplica el concepto lingüístico de alucinación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lawrencehui/chronos-2-empty-history-fix
- Modelo base: https://huggingface.co/amazon/chronos-2
- Repositorio con el delta, cuaderno y evaluación: https://github.com/lawrencehui/Chronos-2-weight-space-fix
- Issue upstream: https://github.com/amazon-science/chronos-forecasting/issues/544
- Artículo sobre weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
- Write-up del autor: https://www.lawrenceh.xyz/writings/chronos-2-one-dead-neuron
