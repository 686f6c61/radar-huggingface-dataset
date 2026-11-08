# heydtn/datalogBERT-4class

## Resumen

datalogBERT-4class es un clasificador de texto de cuatro clases especializado en el análisis estático de programas Datalog y en la monitorización de sesiones de agentes de código. Lo desarrolla el usuario heydtn y deriva de tasksource/ModernBERT-large-nli, un modelo de la familia ModernBERT con 395,84 millones de parámetros y una ventana de contexto de 2.048 tokens. Su función es inspeccionar fragmentos de código Datalog (Soufflé, DDlog, Ascent, CozoDB, Crepe, Flix, LogiQL) o turnos de conversación de agentes y etiquetarlos según cuatro patrones de riesgo de rendimiento: reglas correctamente sembradas por demanda, Datalog sin sembrar, abandono de la vía declarativa por desbordamiento de memoria y orden de joins patológico.

El interés técnico reside en que el autor declara haber sintetizado el modelo "puramente en espacio de pesos (0 pasos de descenso de gradiente)", una técnica de weight-space programming que reutiliza un checkpoint NLI existente sin reentrenamiento supervisado convencional. El modelo es relevante ahora porque aborda un problema muy concreto y recurrente en pipelines de análisis estático y agentes que generan Datalog: detectar antes de ejecutar patrones como cierres transitivos no sembrados o productos cartesianos que provocan OOM y timeouts en motores como Soufflé.

Se publica bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con la librería transformers y con text-embeddings-inference. El repositorio ocupa 1,6 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), clasificación de secuencias |
| Parámetros totales | 395.835.396 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ModernBERT-large adaptado a clasificación de secuencias con cuatro etiquetas de salida. Parte del checkpoint tasksource/ModernBERT-large-nli, un modelo afinado para inferencia de lenguaje natural, y según la model card se ha sintetizado "puramente en espacio de pesos (0 pasos de descenso de gradiente)", es decir, mediante programación en el espacio de pesos en lugar de un ajuste fino supervisado clásico. No se detalla en la información disponible la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

La innovación declarada es doble: por un lado, el método de síntesis sin gradientes sobre un checkpoint NLI preexistente; por otro, la especialización en un dominio muy acotado (análisis estático de Datalog) con cuatro clases semánticamente bien definidas que codifican patrones de riesgo de rendimiento, como reglas sembradas por demanda, cierres transitivos no sembrados, retrocesos por blowup y órdenes de join patológicos.

## Capacidades

- Clasificación de texto en cuatro clases: COMPLIANT_CONTINUE, UNSEEDED_DATALOG, BLOWUP_RETREAT y BAD_JOIN_ORDER_OR_INLINE_BLOWUP.
- Análisis estático de programas Datalog en dialectos como Soufflé, DDlog, Ascent, CozoDB, Crepe, Flix y LogiQL.
- Detección de patrones de rendimiento: reglas demand_* / seed_* correctamente colocadas, divisiones con max(denom, 1), proyecciones materializadas.
- Detección de antipatrones: cierres transitivos no sembrados, alcanzabilidad todos-con-todos, productos cartesianos sin sembrar, negación estratificada sin sembrar y reglas doblemente recursivas sin guardas de demanda.
- Detección de retrocesos por blowup: truncado con .limitsize(n=...), reducción de profundidad de recursión o migración a bucles imperativos en Python/C++.
- Detección de orden de joins patológico: joins EDB/IDB grandes o disyunciones .inline colocadas antes de la guarda demand_*, divisiones sin proteger y comodines de registro no materializados.
- Monitorización de turnos de sesión de agentes de código, no solo de programas completos.
- Soporte de clasificación por lotes con truncación a 2.048 tokens.

## Casos de uso

- Análisis estático en CI/CD para Datalog: integrar el clasificador como paso previo a la ejecución de programas Soufflé o DDlog en un pipeline, de modo que se bloqueen o revisen los ficheros etiquetados como UNSEEDED_DATALOG antes de que consuman memoria en el motor.
- Monitorización de agentes de código: clasificar cada turno de un agente que genera Datalog para detectar cuándo introduce un cierre transitivo no sembrado o un orden de joins patológico y forzar una corrección antes de ejecutar el código.
- Guardarraíl en entornos de generación asistida de código: actuar como filtro de salida sobre las propuestas de un LLM que escribe reglas Datalog, descartando las que caen en BLOWUP_RETREAT o BAD_JOIN_ORDER_OR_INLINE_BLOWUP.
- Revisión de código en pull requests: etiquetar automáticamente los cambios que tocan ficheros .dl o .souffle y publicar un comentario con la clase detectada y la recomendación de sembrado por demanda.
- Auditoría de bases de código Datalog heredadas: recorrer un repositorio completo y clasificar cada programa para localizar los que abandonaron la vía declarativa y migraron a bucles imperativos, un indicador de deuda técnica.
- Docencia y formación: usar el clasificador para señalar a estudiantes los antipatrones típicos de Datalog (cierres no sembrados, joins mal ordenados) sobre sus propios ejercicios.
- Telemetría de calidad en plataformas de análisis: agregar las clases predichas sobre sesiones de agentes para medir la tasa de generación de Datalog patológico por modelo o por prompt.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Calibration Set (84 ejemplos) | Accuracy | 100,0 % (84/84) |
| Calibration Set (84 ejemplos) | Macro-F1 | 1,0000 |
| Held-Out Evaluation Set (32 ejemplos no vistos) | Accuracy | 100,0 % (32/32) |
| Held-Out Evaluation Set (32 ejemplos no vistos) | Macro-F1 | 1,0000 |
| Stress suite adversarial (400 prompts) | Accuracy binaria (flagged vs. unflagged) | 97,75 % (391/400), F1 = 0,9778 |
| Stress suite adversarial (400 prompts) | Accuracy exacta 4 clases | 97,50 % (390/400), Macro-F1 = 0,9742 |
| Needle-in-a-haystack, Set A (280 programas, todos con guardas) | Accuracy binaria | 100,00 % (280/280), 0 falsos positivos |
| Needle-in-a-haystack, Set B (280 programas con 1 cláusula sin guarda) | Recall binario | 98,93 % (277/280) |
| Needle-in-a-haystack, Set B (280 programas con 1 cláusula sin guarda) | Accuracy exacta 4 clases | 98,57 % (276/280) |
| Needle-in-a-haystack combinado (560 programas largos) | Accuracy binaria | 99,46 % (557/560) |
| Needle-in-a-haystack combinado (560 programas largos) | Accuracy exacta 4 clases | 99,29 % (556/560) |

Los programas del conjunto needle-in-a-haystack tienen entre 271 y 1.119 tokens y entre 8 y 12 reglas por fichero. No se han publicado comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,6 GB solo de pesos; en fp16, aproximadamente 0,8 GB; con cuantización de 8 bits, en torno a 0,4 GB. A ello hay que sumar la memoria de activaciones, modesta para secuencias de hasta 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 4090, A100 o H100 ofrecen un margen amplio para clasificación por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en Apple Silicon vía MPS (el quickstart del autor contempla el backend MPS).
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), text-embeddings-inference y endpoints compatibles; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heydtn/datalogBERT-4class | 395,84 M | 2.048 | Clasificación Datalog en 4 clases | Apache 2.0 | Hugging Face |
| tasksource/ModernBERT-large-nli | no disponible en la información | no disponible en la información | Inferencia de lenguaje natural (modelo base) | no disponible en la información | Hugging Face |
| flair/entity-german-4class | no disponible | no disponible | Clasificación de entidades en alemán (4 clases) | no disponible | Hugging Face |

La comparación con alternativas directas de clasificación de Datalog no está disponible: no se conocen en la información proporcionada otros modelos especializados en esta tarea. El modelo base ModernBERT-large-nli sirve como referencia de origen, y flair/entity-german-4class comparte únicamente el rasgo de ser un clasificador de cuatro clases, sin relación de dominio.

## Limitaciones y advertencias

- Los resultados de benchmark son autoinformados por el autor y se obtuvieron sobre conjuntos propios; no hay validación independiente en la información disponible.
- El conjunto held-out es pequeño (32 ejemplos), por lo que el 100 % de accuracy tiene un intervalo de confianza amplio.
- El modelo está especializado exclusivamente en Datalog y en turnos de agentes de código; fuera de ese dominio su comportamiento no está caracterizado.
- Ventana de contexto de 2.048 tokens: los programas Datalog que la superen se truncan y pueden perder la cláusula problemática si esta queda al final del fichero.
- No se documentan los idiomas soportados; el entrenamiento parece centrado en código y discusión técnica en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Riesgo de alucinación de clase: al ser un clasificador, puede asignar una etiqueta de riesgo a código correcto (falsos positivos) o dejar pasar patrones patológicos no representados en el conjunto de síntesis.
- El método de síntesis "en espacio de pesos sin descenso de gradiente" no está descrito en detalle en la model card; la reproducibilidad y la generalización fuera de la distribución de ejemplos del autor no pueden evaluarse.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base tasksource/ModernBERT-large-nli.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heydtn/datalogBERT-4class
- Modelo base: https://huggingface.co/tasksource/ModernBERT-large-nli
- Referencia cruzada de la búsqueda web (sin relación de dominio): https://free2aitools.com/model/flair/entity-german-4class
