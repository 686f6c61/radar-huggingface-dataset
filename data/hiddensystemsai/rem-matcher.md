# HiddenSystemsAI/rem-matcher

## Resumen

REM matcher es un cross-encoder basado en DeBERTa-v3-large desarrollado por HiddenSystemsAI que actúa como clasificador binario de equivalencia semántica entre movimientos (moves) de actores públicos. Dado un par de textos donde cada lado contiene el nombre de un actor y una acción, el modelo decide si el movimiento predicho por un modelo de lenguaje es equivalente en respuesta (response-equivalent move, REM) al movimiento realmente observado. Con 435 millones de parámetros y una ventana de 512 tokens, está diseñado específicamente como señal de recompensa para aprendizaje por refuerzo, no como clasificador de texto genérico.

El modelo se presenta como el matcher aprendido utilizado en el artículo *Toward Simulating Real-World Actors: Training Small Language Models to Predict Their Next Moves*. Su función es sustituir a un panel de jueces LLM en el bucle de RL, proporcionando una probabilidad calibrada de coincidencia entre movimientos. Es relevante para equipos que entrenan modelos de predicción de comportamiento de actores (gobiernos, empresas) y necesitan una señal de recompensa determinista, barata y reproducible en lugar de depender de APIs de modelos propietarios.

La arquitectura es un transformer encoder DeBERTa-v3-large con una cabeza de clasificación de dos clases (`no`/`yes`), afinado desde un matcher ordinal previo de la misma arquitectura. El modelo se distribuye con pesos safetensors, licencia MIT y un fichero `calibration.json` que permite transformar los logits en probabilidades calibradas mediante escalado de Platt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large con cabeza de clasificación de secuencias (cross-encoder) |
| Parametros totales | 435.063.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por par (truncado) |
| Tipos de cuantizacion | no disponible (no documentados por el autor; al ser safetensors fp32/fp16 es convertible a GGUF/ONNX con herramientas externas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe el par de textos como secuencia conjunta (premisa e hipótesis) y produce dos logits (`no`, `yes`) mediante una cabeza de clasificación sobre la representación `[CLS]` de DeBERTa-v3-large. Se inicializó desde un matcher ordinal anterior de la misma arquitectura y se reentrenó una nueva cabeza de dos clases con entropía cruzada durante una época, con learning rate 1e-5 y batch efectivo de 32. Los pares se truncan a 512 tokens.

Los datos de entrenamiento consisten en pares de movimientos extraídos de noticias sobre gobiernos, empresas y otros actores públicos, con etiquetas generadas por modelos Claude (Sonnet como etiquetador principal, una segunda pasada ciega sobre pares límite y Opus como árbitro). Los splits son disjuntos por escenario: 81.439 pares de entrenamiento (43.904 positivos, 397 escenarios), 7.148 de desarrollo (3.709 positivos, 37 escenarios), 7.937 de calibración (4.367 positivos, 45 escenarios) y 4.048 de test con pares reales de movimientos predichos frente a realizados en historias no vistas (667 positivos, 54 escenarios). El formato de entrada es `Actor context: {actor}\nAction: {move}`, con soporte de alias en el campo del actor durante el entrenamiento (`{actor}; aliases: {alias1}; {alias2}`).

La innovación principal no está en la arquitectura sino en el uso: el matcher sustituye a un panel de jueces LLM como función de recompensa en RL. El autor proporciona calibración explícita (escalado de Platt sobre el margen de logits) para que la probabilidad sea interpretable, con umbrales operativos definidos en el artículo: `p_match >= 0.75` para acreditar un movimiento predicho contra un objetivo y `p_match >= 0.8` para considerar dos movimientos predichos como duplicados.

## Capacidades

- Clasificación binaria de equivalencia semántica entre dos movimientos de un mismo actor (coincidencia REM sí/no).
- Cross-encoding de pares con contexto de actor y acción, incluyendo alias de actores.
- Salida de probabilidad calibrada mediante `calibration.json` (temperatura y sesgo de Platt sobre el margen de logits).
- Agrupación y deduplicación de movimientos mediante el umbral de 0,8.
- Señal de recompensa para pipelines de RL sobre modelos de lenguaje pequeños.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.
- No es un modelo generativo: no produce texto, solo puntuaciones.

## Casos de uso

- Señal de recompensa en RL para predicción de comportamiento de actores: el modelo puntúa cada movimiento generado por la política contra el movimiento realizado y devuelve `p_match` calibrado, permitiendo entrenar modelos pequeños sin depender de APIs de jueces LLM en cada paso del bucle.
- Filtrado de datos de entrenamiento: dado un corpus de movimientos predichos y realizados, el matcher permite descartar pares no equivalentes antes de usarlos como ejemplos supervisados, reduciendo ruido en datasets de forecasting.
- Deduplicación de movimientos generados: durante la decodificación de una política que produce listas de movimientos, aplicar el umbral de 0,8 para eliminar predicciones redundantes y mejorar la cobertura efectiva.
- Evaluación interna de modelos de forecasting: como métrica auxiliar de precisión y recall sobre conjuntos de validación propios, siempre acompañada de un juez humano o LLM independiente dado el sesgo documentado del matcher.
- Anotación asistida de equivalencias: preetiquetar pares de movimientos en un corpus de noticias para que anotadores humanos revisen solo los casos límite, acelerando la construcción de datasets de eventos.
- Agrupación temática de movimientos: usar la probabilidad de coincidencia como medida de similitud para clusterizar acciones de un mismo actor a lo largo del tiempo (por ejemplo, agrupar variantes de "reanudar retiradas" de un exchange).
- Investigación en simulación de actores: reproducir el pipeline del artículo para entrenar modelos que predigan el siguiente movimiento de gobiernos o empresas en escenarios de noticias.

## Benchmarks y rendimiento

Evaluación sobre 4.048 pares reales de test (667 positivos), con probabilidades calibradas y umbral 0,5:

| Metrica | Valor |
|---|---|
| Accuracy | 94,4% |
| Precision | 83,4% |
| Recall | 82,6% |
| Expected calibration error (ECE) | 0,017 |

El artículo reporta además precision y recall en el umbral de entrenamiento de 0,75 y compara los créditos del matcher con un panel de tres jueces sobre las listas del benchmark. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otros matchers.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp16 (435 M de parámetros) y alrededor de 0,9 GB en int8; en fp32, unos 3,5 GB incluyendo overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son suficientes y sobredimensionadas para el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660 6 GB en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, Text Embeddings Inference (el repo está marcado como compatible con TEI y endpoints), exportación a ONNX o GGUF con herramientas externas para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 435 M con contexto de 512 tokens, se espera un throughput alto en lote sobre GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HiddenSystemsAI/rem-matcher | 435 M | 512 tokens | Cross-encoder de equivalencia de movimientos (recompensa RL) | MIT | Hugging Face |
| microsoft/deberta-v3-large | 435 M | 512 tokens | Encoder base para clasificación y NLI | MIT | Hugging Face |
| Cross-encoders NLI tipo `cross-encoder/nli-deberta-v3-large` | ~435 M | 512 tokens | Inferencia textual (entailment/contradiction) | MIT/Apache-2.0 según variante | Hugging Face |

La comparación directa con matchers de recompensa especializados no está disponible en la información proporcionada. Frente a DeBERTa-v3-large genérico, rem-matcher añade una cabeza entrenada específicamente para equivalencia REM y calibración de Platt, pero pierde generalidad fuera del dominio de movimientos de actores públicos.

## Limitaciones y advertencias

- Entrenado y evaluado solo con movimientos derivados de noticias sobre gobiernos, empresas y actores públicos, escritos a nivel REM; el rendimiento fuera de ese dominio no está caracterizado.
- Subcuenta coincidencias que jueces con estilo humano aceptan: pierde entre un quinto y un tercio de las coincidencias juzgadas en el benchmark del artículo.
- Optimizar una política contra el matcher puede aumentar su puntuación más rápido que el recall juzgado por humanos; el autor advierte explícitamente de no usarlo como métrica de evaluación por sí solo.
- Solo inglés; no hay soporte multilingüe documentado.
- Contexto limitado a 512 tokens por par; movimientos largos se truncan.
- Las etiquetas de entrenamiento provienen de modelos Claude, por lo que hereda sus sesgos de anotación.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí de falsos positivos y falsos negativos en la clasificación.
- Los umbrales operativos (0,75 para crédito, 0,8 para duplicados) están calibrados para el pipeline del artículo; recalibrar con `calibration.json` si se usa en otra distribución.
- Licencia MIT permite uso comercial sin restricciones documentadas, pero el modelo no incluye garantías de rendimiento fuera de su dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HiddenSystemsAI/rem-matcher
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Artículo referenciado: *Toward Simulating Real-World Actors: Training Small Language Models to Predict Their Next Moves* (no se proporciona URL en la información disponible)
- Fichero de calibración: https://huggingface.co/HiddenSystemsAI/rem-matcher/blob/main/calibration.json
