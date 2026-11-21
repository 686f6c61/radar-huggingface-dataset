# karthe05/maintenance-work-order-triage-5M

## Resumen

mwo-triage-5M es un modelo de clasificación de texto en inglés, desarrollado por el usuario karthe05, especializado en el triaje automático de órdenes de trabajo de mantenimiento industrial. Con 4,78 millones de parámetros, se construye mediante el ajuste fino del modelo base `google/bert_uncased_L-4_H-128_A-2`, un transformer BERT de 4 capas y dimensión oculta 128. Su función es leer una orden de trabajo corta y predecir dos etiquetas simultáneas: la prioridad (`STOP_NOW`, `TODAY`, `PLAN`, `MONITOR`) y la ruta de especialidad (`MECHANICAL`, `ELECTRICAL`, `HYDRAULIC_PNEUMATIC`, `INSTRUMENTATION_CONTROLS`, `LUBRICATION`, `ESCALATE`), cada una acompañada de una puntuación de confianza calibrada.

El modelo aborda un problema operativo concreto en plantas industriales: la clasificación manual de solicitudes de mantenimiento por parte de planificadores, que resulta lenta e inconsistente incluso cuando existen sistemas como SAP PM o Maximo. Al automatizar la primera sugerencia de prioridad y equipo, permite que el planificador revise y apruebe en lugar de clasificar desde cero, reduciendo el tiempo dedicado a tareas de triaje y mitigando el riesgo de que urgencias reales queden esperando en la cola.

Es relevante por su orientación a despliegue en el borde: con un tiempo de inferencia de aproximadamente 1,8 ms por petición en CPU, sin necesidad de GPU ni dependencia de la nube, está pensado para ejecutarse en ordenadores convencionales, teléfonos o hardware de bajo coste dentro de la propia planta. Es el hermano ligero de `mwo-triage-13M`, con el que comparte arquitectura y datos de entrenamiento, sacrificando una pequeña cantidad de precisión a cambio de una velocidad aproximadamente 3,6 veces mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), base `google/bert_uncased_L-4_H-128_A-2`, 4 capas, dimension oculta 128, con dos cabezas de clasificacion compartiendo encoder |
| Parametros totales | 4.783.754 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado y evaluado con texto corto, mayoritariamente menos de 8 palabras) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `google/bert_uncased_L-4_H-128_A-2`, un BERT reducido de 4 capas con dimensión oculta 128, sobre el que se añaden dos cabezas de clasificación que comparten el mismo encoder: una para prioridad (4 clases) y otra para ruta (6 clases). El resultado es un modelo de 4,78 millones de parámetros, diseñado explícitamente para inferencia de baja latencia en CPU.

El ajuste fino se realizó sobre el dataset `karthe05/mwo-triage-data`, compuesto por órdenes de trabajo de mantenimiento reales y texto corto de estilo orden de trabajo. La model card indica que la evaluación se llevó a cabo sobre 1.500 órdenes de trabajo reales no vistas durante el entrenamiento. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en un modelo de clasificación de este tamaño). La model card menciona la existencia de un "rulebook" de etiquetado (v1.3) que define las reglas para asignar prioridad y ruta, lo que sugiere un proceso de anotación guiado por criterios operativos explícitos.

Como innovación destacable, el modelo incorpora puntuaciones de confianza calibradas que permiten derivar los casos dudosos a revisión humana: las solicitudes vagas se enrutan a `ESCALATE` en lugar de adivinar, y las sugerencias de baja confianza pueden marcarse para revisión manual. La model card ilustra este comportamiento con un caso límite en el que la predicción de prioridad es incorrecta pero la confianza es de solo 0,46, lo que señala la necesidad de intervención humana.

## Capacidades

- Clasificación de prioridad de órdenes de trabajo de mantenimiento en cuatro clases: `STOP_NOW`, `TODAY`, `PLAN`, `MONITOR`.
- Clasificación de ruta de especialidad en seis clases: `MECHANICAL`, `ELECTRICAL`, `HYDRAULIC_PNEUMATIC`, `INSTRUMENTATION_CONTROLS`, `LUBRICATION`, `ESCALATE`.
- Salida de puntuaciones de confianza calibradas para cada una de las dos predicciones, utilizables para decidir cuándo derivar a revisión humana.
- Enrutamiento de solicitudes vagas o ambiguas a `ESCALATE` en lugar de forzar una predicción.
- Procesamiento de texto corto de estilo orden de trabajo (mayoritariamente menos de 8 palabras).
- Inferencia en CPU con latencia de aproximadamente 1,8 ms por petición, sin GPU ni dependencia de la nube.
- Capacidad de operar como hermano ligero de `mwo-triage-13M` en escenarios donde este último resulta demasiado grande o lento.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; es exclusivamente un clasificador de texto.

## Casos de uso

- Triaje automático de solicitudes entrantes en planta: el modelo lee cada orden de trabajo al registrarse y sugiere prioridad y equipo con confianza asociada, de modo que el planificador revisa y aprueba en lugar de clasificar manualmente desde cero. Es adecuado por su latencia de 1,8 ms y su funcionamiento en CPU sin infraestructura adicional.
- Despliegue en el borde en hardware de bajo coste: al requerir solo 4,78 millones de parámetros y ejecutarse en CPU, puede integrarse en teléfonos, tablets de planta o mini-PC junto a la línea de producción, sin depender de conectividad cloud ni incurrir en coste por petición.
- Pre-filtrado en sistemas CMMS/EAM (SAP PM, Maximo): el modelo puede actuar como capa de sugerencia previa a la entrada en el sistema gestor, asignando una propuesta de prioridad y ruta que el planificador confirma o corrige, reduciendo el tiempo de clasificación diario.
- Detección temprana de emergencias reales: en modo seguridad captura el 84% de las emergencias reales (64% en modo equilibrado), lo que permite señalizar órdenes con prioridad `STOP_NOW` para revisión inmediata antes de la reunión matinal, mitigando el riesgo de que urgencias queden en cola.
- Enrutamiento a especialidad técnica: la predicción de ruta (`HYDRAULIC_PNEUMATIC`, `ELECTRICAL`, etc.) permite dirigir la orden al equipo correcto desde el registro, reduciendo reasignaciones posteriores y el tiempo hasta la primera intervención.
- Marcado de solicitudes para revisión manual: gracias a las puntuaciones de confianza calibradas, las predicciones por debajo de un umbral pueden derivarse automáticamente a un planificador humano, evitando acciones automáticas sobre casos ambiguos como el ejemplo de fuga de aceite con confianza 0,46.
- Clasificación por lotes de históricos de órdenes: al ser un modelo pequeño y rápido, puede procesarse un backlog completo de órdenes históricas en CPU para auditar la coherencia de prioridades y rutas asignadas previamente por operarios.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 1.500 órdenes de trabajo reales no vistas durante el entrenamiento:

| Metrica | mwo-triage-5M | mwo-triage-13M |
|---|---|---|
| Macro-F1 prioridad | 0,8265 | 0,8486 |
| Macro-F1 ruta | 0,8008 | 0,8219 |
| Latencia por texto (CPU) | 1,799 ms | 6,506 ms |
| Captura de emergencias reales (modo equilibrado) | 64% | No disponible |
| Captura de emergencias reales (modo seguridad) | 84% | No disponible |

El modelo es aproximadamente 3,6 veces más rápido que `mwo-triage-13M` a costa de una reducción de 0,0221 puntos en macro-F1 de prioridad y 0,0211 puntos en macro-F1 de ruta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que se trata de un clasificador de dominio específico y no de un modelo generativo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo está diseñado para ejecutarse en CPU. Con 4,78 millones de parámetros, los pesos en fp32 ocupan aproximadamente 19 MB, por lo que cabe holgadamente en cualquier memoria disponible.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU convencional de planta; si se desea aceleración, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente, aunque no aporta ventajas significativas frente a CPU dada la latencia ya baja.
- Cabe en cualquier GPU consumer, así como en dispositivos sin GPU dedicada (teléfonos, tablets, mini-PC, Raspberry Pi y similares).
- Opciones de despliegue: al ser un modelo safetensors de tipo text-classification, puede servirse con Hugging Face Transformers, Text Embeddings Inference (TEI), o exportarse a ONNX para inferencia optimizada en CPU. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama en la información disponible (estas herramientas están orientadas a modelos generativos).
- Latencia y throughput estimados: aproximadamente 1,8 ms por petición en CPU según la model card, sin datos de throughput agregado publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 prioridad | Macro-F1 ruta | Latencia (CPU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| mwo-triage-5M | 4,78 M | No disponible | 0,8265 | 0,8008 | 1,799 ms | Apache 2.0 | Hugging Face |
| mwo-triage-13M | No disponible | No disponible | 0,8486 | 0,8219 | 6,506 ms | No disponible | Referenciado en la model card |
| google/bert_uncased_L-4_H-128_A-2 | No disponible | No disponible | No aplica (modelo base sin ajuste) | No aplica | No disponible | Apache 2.0 | Hugging Face |

La comparativa principal es con su hermano mayor `mwo-triage-13M`, del mismo autor y misma tarea, que ofrece mayor precisión a cambio de una latencia aproximadamente 3,6 veces superior. El modelo base `google/bert_uncased_L-4_H-128_A-2` no es un competidor directo, sino el punto de partida del ajuste fino. No se dispone de información sobre otros modelos comparables de triaje de mantenimiento en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un sistema de seguridad y no sustituye los procedimientos de seguridad del sitio ni las reglas de aislamiento y bloqueo. Nunca debe usarse para detener o aislar equipos automáticamente sin una persona en la decisión.
- Solo soporta inglés; no debe usarse con texto en otros idiomas.
- Entrenado y evaluado con texto corto de estilo orden de trabajo (mayoritariamente menos de 8 palabras); no es adecuado para informes largos o de formato libre.
- No maneja texto que describa varias averías simultáneas.
- No debe usarse con tickets no relacionados con mantenimiento.
- Riesgo de alucinación de etiqueta: el modelo puede predecir una prioridad incorrecta con confianza alta; la model card documenta un caso límite con predicción errónea de `STOP_NOW` frente a la prioridad correcta `TODAY` según el rulebook, aunque con confianza baja (0,46). Las puntuaciones de confianza deben usarse como guía de fiabilidad, no como un número decorativo.
- En modo equilibrado captura el 64% de las emergencias reales, lo que implica que aproximadamente un tercio de las emergencias pueden no marcarse como `STOP_NOW`; en modo seguridad la captura sube al 84%, pero no se detalla el coste en falsos positivos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- El tamaño del repositorio se indica como 0.0 GB, dato que puede reflejar un empaquetado incompleto o una medición imprecisa; conviene verificar la integridad de los pesos antes de desplegar en producción.
- No se especifican en la información disponible los sesgos conocidos del modelo ni la composición demográfica o geográfica del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karthe05/maintenance-work-order-triage-5M
- Modelo base: https://huggingface.co/google/bert_uncased_L-4_H-128_A-2
- Dataset de entrenamiento: https://huggingface.co/datasets/karthe05/mwo-triage-data
- Rulebook de etiquetado (v1.3): https://github.com/karthekeyan/mwo-triage/blob/main/docs/labelling-rulebook.md
- Repositorio del proyecto: https://github.com/karthekeyan/mwo-triage
