# Japhari/sdt-maternal-d1

## Resumen

sdt-maternal-d1 es un modelo de decisión clínica orientado al enrutamiento de complicaciones maternas en el contexto del sistema sanitario de Tanzania. Lo desarrolla Japhari Mbaru y se construye sobre el checkpoint base `unsloth/gemma-4-E4B-it`, al que se añade una cabeza de decisión (decision head) del tipo Unsloth Clef que puntúa 13 preguntas de clasificación clínica. El modelo recibe una queja materna en inglés o kiswahili y devuelve, para cada pregunta, una distribución de probabilidad sobre las opciones posibles: tipo de complicación, etapa de la atención, nivel de centro sanitario al que derivar, presencia de signos de peligro y urgencia.

La relevancia del proyecto es doble. Por un lado, aborda un problema real de triaje obstétrico en un entorno de recursos limitados, alineando los niveles de derivación (A dispensario, B centro de salud, C hospital de distrito) con la nomenclatura de la Standard Treatment Guidelines and National Essential Medicines List de Tanzania continental, 7.ª edición de 2026, capítulo 11. Por otro lado, el repositorio es ejemplarmente honesto sobre su estado: la cabeza de decisión **no ha sido entrenada** y los pesos afinados no se distribuyen.

Es importante subrayar que esta release contiene únicamente la model card y el esquema de preguntas (`questions.json`), no un modelo utilizable. Según el propio autor, en 204 casos reservados la cabeza sin entrenar no acierta las 13 preguntas en ninguno de ellos, y las etiquetas de referencia son borradores sintéticos pendientes de revisión clínica. Se trata, por tanto, de una especificación de tarea y de un conjunto de datos listo para entrenamiento, no de un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) con cabeza de decisión Unsloth Clef para clasificación multi-pregunta |
| Parametros totales | no disponible (el modelo base es Gemma 4 E4B; el número exacto no se indica en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) y kiswahili (sw) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (esta release no incluye pesos; solo model card y `questions.json`) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E4B-it`, un checkpoint instructivo de la familia Gemma 4. Sobre él se aplica una cabeza de decisión Unsloth Clef que formula la tarea como 13 preguntas independientes, cada una con su propio conjunto de opciones: una elección entre 20 complicaciones maternas (más `none`), la etapa de la atención (antenatal, labour, postnatal mother, pregnancy loss), el nivel de centro (A, B, C), un indicador binario de signo de peligro, una puntuación de urgencia (0 rutina, 1 en 24 horas, 2 ir ahora) y ocho hallazgos clínicos adicionales (sangrado, shock, fiebre, convulsión, disnea, consciencia, estado fetal y tensión arterial).

El conjunto de datos de entrenamiento consta de 1.935 filas de entrenamiento y 204 de test, distribuidas en 82 escenarios, con la garantía de que ningún escenario aparece en ambos splits. Las etiquetas de referencia son borradores sintéticos con `review_status: pending_clinician`, es decir, no han sido validadas por personal clínico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es el enfoque de "decision head" multi-pregunta con salidas probabilísticas por opción, que permite al clínico ver la incertidumbre del modelo en cada dimensión del triaje en lugar de una única etiqueta.

## Capacidades

- Clasificación de complicaciones maternas: elige entre 20 complicaciones o `none` a partir de una queja en texto libre.
- Determinación de la etapa de atención: antenatal, trabajo de parto, posparto o pérdida gestacional.
- Enrutamiento por nivel de centro: dispensario (A), centro de salud (B) u hospital de distrito (C), siguiendo la nomenclatura de las guías tanzanas.
- Detección de signos de peligro maternos: sangrado, shock, fiebre, convulsión, disnea y alteración de la consciencia.
- Puntuación de urgencia: rutina, en 24 horas o derivación inmediata.
- Evaluación de hallazgos clínicos adicionales: estado fetal, tensión arterial y nivel de consciencia.
- Bilingüe inglés-kiswahili, con la misma etiqueta en ambos idiomas.
- Salida probabilística por opción en cada pregunta, lo que permite umbrales de confianza y revisión humana.
- No soporta tool calling, function calling, agentes multi-paso ni otras capacidades generativas más allá de la clasificación descrita.
- No incluye visión, audio ni modo de razonamiento explícito ("thinking mode") en la información disponible.

## Casos de uso

- Triaje inicial en dispensarios rurales: el modelo puntuaría una queja materna en kiswahili y devolvería la probabilidad de cada nivel de centro (A, B, C), ayudando al personal de enfermería a decidir si deriva a un centro con capacidad de atención obstétrica básica o integral.
- Detección sistemática de signos de peligro: con las preguntas binarias de sangrado, shock, fiebre, convulsión y disnea, el modelo podría integrarse en un formulario de admisión para marcar automáticamente los casos que requieren revisión inmediata por un clínico.
- Priorización de urgencias en listas de espera: la puntuación de urgencia (0, 1, 2) permitiría ordenar las quejas entrantes en un sistema de mensajería o telemedicina, elevando al principio las que el modelo marque como "ir ahora".
- Apoyo a la formación de matronas: las distribuciones de probabilidad por opción pueden usarse como material didáctico para discutir casos sintéticos, mostrando qué dimensiones del triaje son ambiguas y por qué.
- Investigación en procesamiento de lenguaje clínico en swahili: el esquema de 13 preguntas y el conjunto de 82 escenarios sirven como benchmark reproducible para evaluar otros modelos en una lengua con pocos recursos clínicos.
- Preprocesamiento para sistemas de historia clínica electrónica: la salida estructurada (complicación, etapa, nivel de centro, urgencia) puede alimentar campos codificados de un registro, siempre con validación humana posterior.
- Auditoría de derivaciones: comparar las probabilidades del modelo con las decisiones reales de derivación permitiría identificar patrones de infra o sobre-derivación en un distrito sanitario.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la línea base con la cabeza sin entrenar sobre 204 casos reservados, comparados con la estrategia trivial de predecir siempre la etiqueta más frecuente en entrenamiento.

| Pregunta | Cabeza sin entrenar | Siempre la respuesta común |
|---|---:|---:|
| stage | 17,2 % | 47,1 % |
| care level | 69,6 % | 76,5 % |
| danger sign | 79,9 % | 79,4 % |
| urgency | 17,6 % | 82,4 % |
| complication | 3,9 % | 14,7 % |
| bleeding | 14,2 % | 67,6 % |
| shock | 47,5 % | 85,3 % |
| fever | 11,8 % | 88,2 % |
| convulsion | 38,7 % | 94,1 % |
| breathlessness | 5,9 % | 94,1 % |

El autor indica además que, en los 204 casos reservados, la cabeza sin entrenar no acierta las 13 preguntas en ninguno de ellos. En el ejemplo cualitativo incluido en la model card, solo 4 de las 13 respuestas coinciden con la etiqueta borrador, y tres de esas cuatro están por encima del 50 % por azar. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no distribuirse pesos afinados, no se puede estimar el consumo real del modelo final; el checkpoint base Gemma 4 E4B requeriría, en cualquier caso, una GPU con memoria suficiente para un modelo de esa familia, pero el dato concreto no se proporciona.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdt-maternal-d1 (Japhari) | no disponible (base Gemma 4 E4B) | no disponible | Enrutamiento de complicaciones maternas, 13 preguntas | cc-by-4.0 | Solo model card y `questions.json`; sin pesos |
| cds-maternal-4b-en (Japhari) | 4B (base google/medgemma-4b-it) | no disponible | Extracción estructurada de datos clínicos maternos a JSON | no disponible | Adaptador LoRA publicado en Hugging Face |
| cds-maternal-4b (Japhari) | 4B (base google/medgemma-4b-it) | no disponible | Extracción estructurada de datos clínicos maternos | no disponible | Publicado en Hugging Face |

La comparación se limita a los proyectos del mismo autor encontrados en la búsqueda web; no se dispone de información sobre modelos de terceros directamente comparables en la tarea de enrutamiento obstétrico bilingüe inglés-kiswahili.

## Limitaciones y advertencias

- **No apto para atención al paciente.** El propio autor lo advierte de forma explícita: no debe usarse una puntuación de este modelo para elegir centro, derivación o tratamiento.
- **Cabeza de decisión sin entrenar.** En 204 casos reservados no acierta las 13 preguntas en ninguno; varias preguntas rinden peor que la línea base trivial.
- **Etiquetas sin validar.** Las etiquetas de referencia son borradores sintéticos con `review_status: pending_clinician`; ningún profesional clínico las ha firmado.
- **Sin pesos distribuidos.** Esta release solo contiene la model card y `questions.json`; no hay artefacto ejecutable.
- **Cobertura limitada a dos idiomas** (inglés y kiswahili) y a un contexto sanitario concreto (Tanzania continental, guías de 2026).
- **Niveles D y S excluidos** del conjunto de etiquetas de nivel de centro, lo que limita su aplicabilidad fuera del esquema A/B/C.
- **Riesgo de alucinación y sesgo** no cuantificado en la información disponible; al tratarse de un modelo sin entrenar, las distribuciones son prácticamente uniformes en muchas preguntas.
- **Licencia cc-by-4.0**: permite uso comercial con atribución, pero no exime de las advertencias clínicas anteriores.
- **Sin métricas de benchmarks estándar** publicadas, lo que impide comparar su calidad con modelos generalistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Japhari/sdt-maternal-d1
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Esquema de preguntas: https://huggingface.co/Japhari/sdt-maternal-d1/blob/main/questions.json
- Perfil del autor en GitHub: https://github.com/japhari
- Proyecto relacionado cds-maternal-4b-en: https://huggingface.co/Japhari/cds-maternal-4b-en
- Proyecto relacionado cds-maternal-4b: https://huggingface.co/Japhari/cds-maternal-4b
- Publicación del autor en LinkedIn: https://www.linkedin.com/posts/japhari-mbaru-593520162_ai-healthcareai-maternalhealth-activity-7477374429094719488-RchF
