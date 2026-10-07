# Bharathvbcr/lappi-v0.1-preview

## Resumen

Lappi v0.1 preview es un modelo de decisiones tipadas (typed decisions) obtenido por ajuste fino de Qwen/Qwen3.5-2B-Base y publicado por el autor Bharathvbcr. No es un modelo generativo de texto ni un asistente conversacional: recibe un contexto, una pregunta y un conjunto de opciones nombradas (de 2 a 16, más una fila reservada de abstención) y devuelve una única opción, una puntuación y, cuando corresponde, una abstención explícita ("noul"). La respuesta no se genera token a token, sino que se lee como un único token de una porción de 17 filas de la capa de salida. Los pesos safetensors suman 1.881.825.088 parámetros y el repositorio ocupa 3,8 GB.

Se trata de una versión preview y no promocionada: el autor la publicó después de no alcanzar su propio umbral pre-registrado en dos de seis métricas (exactitud de spans y abstención fuera de distribución). El modelo solo admite las familias de tarea para las que fue entrenado; cualquier otra petición se rechaza con el estado "task_not_trained". Está etiquetado únicamente para inglés y se distribuye bajo licencia Apache 2.0.

Su interés actual reside en el enfoque de diseño: un clasificador de decisiones con calibración dependiente del número de opciones y con abstención explícita, orientado a enrutado, clasificación de intención y decisión con alternativas en entornos de producción, en lugar de a la generación de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (ajuste fino de Qwen/Qwen3.5-2B-Base) con salida restringida a una porción de 17 filas de la capa de salida |
| Parámetros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base con relación `base_model_relation: finetune`. La innovación principal es la restricción de la salida: en lugar de decodificar texto, cada respuesta es un único token leído de una porción de 17 filas de la capa de salida (16 opciones posibles más la fila reservada de abstención). El modelo no razona antes de responder. El servicio de inferencia emplea dos pasadas y también se abstiene cuando ambas discrepan, lo que eleva la tasa real de rechazo por encima de la modelada en las tablas de calibración.

El ajuste fino se realizó sobre una mezcla de conjuntos de datos: ZefanCai/Open-Jev-v1.1, tasksource/procedural-typed-decisions, LocalLLaMA/typed-decisions, n4ze3m/typed-decisions-synth, nvidia/HelpSteer2, google/boolq, allenai/ai2_arc, tals/vitaminc, bigcode/commitpackft, cais/mmlu, tau/commonsense_qa, clinc/clinc_oos y rajpurkar/squad_v2. No se indica el número total de tokens, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO.

Los pesos publicados son la media simple de cinco semillas de la iteración v5. El modelo cubre 23 familias de tarea entrenadas, de las cuales 21 se admiten y calibran; 15 de ellas se probaron de extremo a extremo en el runtime de producto. La tabla de calibración contiene 15 entradas, una por cada recuento de opciones entre 2 y 16. Todas las métricas de validación se obtuvieron sobre el split de validación v5 (fila de puntuación `6af73bef`) en 2x H100.

## Capacidades

- Decisiones de elección sobre entre 2 y 16 opciones nombradas, más la opción reservada de abstención.
- Devolución de una opción seleccionada acompañada de una puntuación.
- Abstención explícita mediante la etiqueta "noul" cuando el modelo no debe responder.
- Calibración específica por número de opciones, con 15 entradas para recuentos de 2 a 16.
- 21 familias admitidas y calibradas: `arc.science`, `boolq.reading`, `decider.commands`, `decider.routing`, `openjev.evidence`, `openjev.game`, `openjev.nli`, `openjev.policy`, `openjev.routing`, `openjev.rubric`, `pairwise.helpfulness`, `procedural.decisions`, `synth.general`, `typed.workflow` y `vitaminc.nli` (estas 15 probadas de extremo a extremo) más `intent.classification`, `intent.domain`, `intent.in_scope`, `intent.within_domain`, `knowledge.multiple_choice` y `commonsense.multiple_choice` (admitidas y calibradas, pero no ejercitadas en el runtime durante la prueba de carga).
- Recuperación de información en contexto largo: recall de aguja de 1.000 en el peor bucket de contexto largo (300 de 300), frente a un umbral de 0,95.
- No admite: generación de texto libre, razonamiento previo a la respuesta, respuestas de span (incluida la familia `qa.answer_span`), slots ordinales o de puntuación, la familia de código `code.defect_class`, función de juez general ni uso conversacional.

## Casos de uso

- Enrutado de comandos en asistentes y agentes: las familias `decider.commands` y `decider.routing` permiten asignar una instrucción del usuario a una opción de un conjunto cerrado, con la ventaja de que el modelo se abstiene cuando la entrada no encaja en ninguna categoría conocida.
- Clasificación de intención y de dominio en sistemas de atención al cliente: las familias `intent.classification`, `intent.domain`, `intent.in_scope` y `intent.within_domain` cubren la separación entre consultas dentro y fuera de alcance, útil para derivar a un agente humano en lugar de forzar una respuesta.
- Verificación de afirmaciones y preguntas de comprensión lectora: `boolq.reading` y las familias NLI de OpenJev permiten decidir si un contexto respalda una afirmación, devolviendo abstención cuando la evidencia es insuficiente.
- Cumplimiento de políticas y rúbricas: `openjev.policy` y `openjev.rubric` permiten evaluar si una respuesta o una acción cumple un conjunto de criterios nombrados, con una puntuación asociada a la decisión.
- Evaluación comparativa de respuestas: `pairwise.helpfulness` sirve para seleccionar la mejor de dos alternativas en tareas de preferencia, aunque el modelo no debe usarse como juez general fuera de ese dominio.
- Enrutado de decisiones procedimentales: `procedural.decisions` y `typed.workflow` cubren la elección del siguiente paso dentro de un flujo predefinido con opciones discretas.
- Selección en preguntas de conocimiento y sentido común: `knowledge.multiple_choice` y `commonsense.multiple_choice` pueden emplearse en evaluación automática de opción múltiple, teniendo en cuenta que no fueron ejercitadas en el runtime durante la prueba de carga.
- Filtrado con garantía de abstención: en cualquier canal donde una respuesta incorrecta tenga coste alto, el mecanismo de abstención permite descartar peticiones dudosas y escalarlas a otro sistema en lugar de responder con baja confianza.

## Benchmarks y rendimiento

Resultados sobre el split de validación v5 (2x H100). Los pesos son la media simple de las cinco semillas v5.

| Medida | v0.1 preview | Semillas v5 | Umbral | Resultado |
|---|---|---|---|---|
| Top-1 de elección, 22 familias | 0,857 (14.779 / 17.254) | 0,828-0,847 | ninguno | no aplica |
| Top-1 de elección, 21 familias servidas | 0,842 (12.580 / 14.950) [derivado] | no disponible | ninguno | no aplica |
| Consistencia ante permutación | 0,957 (16.514 / 17.254) | 0,929-0,949 | >= 0,95 | supera |
| Abstención en filas dentro de distribución | 4,6 % (770 / 16.905) | 5,6-8,2 % | <= 5 % | supera |
| Abstención en filas fuera de distribución | 149 / 180 | 152-162 | >= 0,9 | no supera |
| Recall de aguja, peor bucket de contexto largo | 1,000 (300 / 300) | 0,705-1,000 | >= 0,95 | supera |
| Top-1 de span (el span no se sirve) | 0,773 | 0,907-0,915 | ninguno | no aplica |

Respuesta con un objetivo de precisión del 80 %, con la calibración publicada:

| Estimación | Tasa de respuesta | Precisión sobre lo respondido |
|---|---|---|
| Dos pliegues, 22 familias de elección | 91,9 % | 87,0 % |
| Dos pliegues, 21 familias servidas [derivado] | 90,7 % | 85,6 % |
| En muestra (tabla publicada, optimista) | 93,8 % | 87,1 % |

- El servicio también se abstiene cuando las dos pasadas discrepan; ese comportamiento no está modelado en la tabla, por lo que la tasa real de rechazo es algo superior.
- Las preguntas de 16 opciones se rechazan aproximadamente la mitad de las veces (51 % a dos pliegues).
- Error de calibración (ECE a dos pliegues, 15 bins): entre 0,006 y 0,038 en 8 de los 9 recuentos de opciones con al menos 100 filas; 0,079 en preguntas de 16 opciones, que no supera el umbral de 0,05. Seis recuentos de opciones tienen menos de 100 filas y no se midieron.

## Requisitos de hardware

- Peso de los safetensors: aproximadamente 3,8 GB (tamaño del repositorio), coherente con 1,88 mil millones de parámetros en precisión de 16 bits.
- Evaluación publicada ejecutada en 2x H100, aunque ese hardware corresponde al proceso de validación, no a un requisito de inferencia.
- VRAM estimada para inferencia, calculada a partir del recuento de parámetros (no publicada por el autor): en torno a 4-5 GB en fp16/bf16 con overhead, 2-3 GB en int8 y 1,5-2 GB en 4 bits.
- Debería caber en GPU de consumo con al menos 8 GB de VRAM, como RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o RTX 4090. Esta afirmación es una estimación derivada, no un dato publicado.
- Opciones de despliegue: no disponible. El repositorio solo publica safetensors, sin pesos GGUF, por lo que no hay confirmación de compatibilidad con llama.cpp u Ollama. La naturaleza de la cabeza de salida restringida a 17 filas puede requerir adaptación específica en motores como vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. El único punto de referencia documentado es el propio modelo base:

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lappi v0.1 preview | Ajuste fino del base | 1.881.825.088 | no disponible | Apache 2.0 | safetensors en HuggingFace |
| Qwen/Qwen3.5-2B-Base | Modelo base | no disponible (etiquetado como 2B) | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks del modelo base ni de alternativas de la misma categoría (clasificadores de decisión tipada con abstención) en la información proporcionada.

## Limitaciones y advertencias

- Es una versión preview, no promocionada: no alcanzó el umbral pre-registrado en dos de seis métricas (exactitud de spans y abstención fuera de distribución).
- La abstención fuera de distribución falla: sobre 180 entradas para las que nunca fue entrenado se abstuvo en 149, frente al umbral de 162. Por tipo: lenguajes de programación no vistos 40 de 60, texto desordenado 49 de 60 y prosa 60 de 60. En las demás entradas responde, a menudo con confianza alta.
- Los spans no se sirven, ni tampoco la familia de solo span `qa.answer_span`. La cabeza de span publicada es la media de las cabezas de cinco semillas, que apuntan en direcciones casi no relacionadas, y mide 0,773 de top-1 frente a 0,907-0,915 de las semillas individuales.
- La familia `code.defect_class`, que motivó el proyecto, no se sirve: su petición entrenada combina un slot de elección y un slot de span, el span se rechaza por falta de calibración, pedir solo el slot de elección es un prompt que el modelo nunca vio y los contextos multiarchivo con `diff --git` se rechazan en la admisión.
- Los slots de puntuación ordinal se rechazan; ninguna familia entrenó uno.
- No es un juez general ni un modelo de chat: en el benchmark de juez por pares de JevArena queda cerca del azar fuera de un único dominio.
- Calibración deficiente en preguntas de 16 opciones (ECE de 0,079, por encima del umbral de 0,05) y rechazo de aproximadamente la mitad de esas preguntas.
- Riesgo de respuesta incorrecta confiada: al no generar texto libre, el fallo típico no es la invención de contenido, sino la selección de una opción equivocada con una puntuación alta cuando la entrada queda fuera de las familias entrenadas.
- Idiomas: solo inglés. No se declara soporte multilingüe.
- Alcance cerrado: cualquier tarea fuera de las 21 familias admitidas y calibradas se rechaza con `task_not_trained`, lo que limita su uso como componente genérico.
- Licencia Apache 2.0, que permite uso comercial, pero el estado de preview y los fallos de calibración documentados desaconsejan su despliegue en producción sin validación propia.
- Modelo con 0 descargas y 0 "likes" en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bharathvbcr/lappi-v0.1-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio del proyecto (rama outreach-2026-10-06, evidencias): https://github.com/bharathvbcr/Lappi-decision/tree/outreach-2026-10-06/docs/outreach/evidence
- Conjuntos de datos referenciados: ZefanCai/Open-Jev-v1.1, tasksource/procedural-typed-decisions, LocalLLaMA/typed-decisions, n4ze3m/typed-decisions-synth, nvidia/HelpSteer2, google/boolq, allenai/ai2_arc, tals/vitaminc, bigcode/commitpackft, cais/mmlu, tau/commonsense_qa, clinc/clinc_oos, rajpurkar/squad_v2 (todos en HuggingFace).
