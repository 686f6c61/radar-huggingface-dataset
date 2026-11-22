# AMFORGE/ananke-v1

## Resumen

Ananke v1 es un prototipo de investigación desarrollado por AMEFORGE (Ontario, Canadá) que implementa un sistema de memoria autoactualizable con capacidad de citar fuentes. No es un modelo de lenguaje generativo: combina un motor de memoria que "lee" documentos una sola vez y sigue aprendiendo con un pequeño lector aprendido que selecciona la respuesta corta dentro de los pasajes recuperados. La versión v1 sustituye las reglas heurísticas de v0 por un lector entrenado en SQuAD v1.1, lo que constituye su principal cambio técnico.

El modelo se publica como prototipo de investigación bajo licencia propietaria (`ameforge-proprietary`). Los pesos, el motor y el lector no se distribuyen; solo se ofrece acceso público a través de un Space de demostración. Está orientado exclusivamente al inglés y su pipeline declarado es question-answering.

Su relevancia es limitada pero concreta: explora el paradigma de "aprender leyendo" con trazabilidad de fuentes y rechazo explícito ante temas no leídos. Los resultados publicados por el propio autor son modestos (37 % de acierto agregado en 323 preguntas congeladas) y sin significación estadística frente a v0, por lo que debe evaluarse como prueba de concepto, no como componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector propietario de AMEFORGE (no es un modelo de lenguaje preentrenado) sobre un motor de memoria con recuperación de pasajes; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el lector se ejecuta en CPU; no se publican pesos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `ameforge-proprietary` (licencia propietaria, referencia a archivo LICENSE no distribuido públicamente) |
| Formato de pesos | no disponible (pesos no distribuidos) |

## Arquitectura y entrenamiento

Ananke v1 se compone de dos piezas diferenciadas. La primera es un motor de memoria que procesa documentos una vez, conserva lo leído de forma persistente y recupera pasajes relevantes ante una consulta, mostrando siempre las citas de origen. Esta pieza es idéntica a la de v0. La segunda es un lector aprendido que, restringido únicamente a los pasajes recuperados, selecciona la respuesta corta. El autor indica explícitamente que no se trata de un modelo de lenguaje preentrenado, sino de una arquitectura propia de AMEFORGE.

El entrenamiento del lector se realizó una sola vez, en una GPU, sobre el conjunto SQuAD v1.1 (Rajpurkar et al., 2016, licencia CC BY-SA 4.0). La inferencia del lector se ejecuta en CPU. Los artículos empleados en la memoria de demostración fueron excluidos del conjunto de entrenamiento para evitar contaminación. La memoria de demostración se construye con artículos de Wikipedia en inglés (CC BY-SA 4.0). No se documentan detalles sobre volumen de tokens, composición exacta del dataset, ni uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas extractivas en inglés sobre una colección documental previamente "leída".
- Memoria persistente y autoactualizable: incorpora nuevo texto sin reentrenamiento y sigue aprendiendo por lectura.
- Citación de fuentes: cada respuesta se acompaña del pasaje literal del que procede.
- Rechazo explícito ante temas sobre los que no ha leído nada (3/3 en el conjunto de evaluación de rechazo).
- Selección de respuesta corta mediante lector aprendido, limitada a los pasajes recuperados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de agentes.
- No genera texto libre ni combina hechos de fuentes distintas.
- No dispone de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Demostración de aprendizaje por lectura en investigación: permite estudiar cómo un sistema con memoria persistente mejora su cobertura documental sin reentrenamiento, usando el Space público como banco de pruebas.
- Recuperación con trazabilidad en corpus controlados: para colecciones pequeñas y bien delimitadas donde la prioridad es mostrar la cita literal que respalda cada respuesta, en lugar de una respuesta redactada.
- Evaluación de estrategias de rechazo: útil para experimentar con sistemas que deben abstenerse ante preguntas fuera de su memoria, un requisito habitual en asistentes documentales con compliance estricto.
- Análisis de cuellos de botella en pipelines de recuperación: el propio autor señala que el fallo dominante es la recuperación de pasajes incorrectos, por lo que sirve para medir el impacto de la calidad del retrieval en la respuesta final.
- Prototipado de bases de conocimiento citables: para explorar interfaces donde el usuario consulta un archivo documental y recibe fragmentos verificables, sin depender de un LLM generativo.
- Docencia y divulgación sobre limitaciones de sistemas extractivos: el modelo documenta de forma transparente su tasa de acierto (37 % agregado), lo que lo hace adecuado como caso de estudio de evaluación honesta y de significación estadística.
- No es adecuado para atención al cliente, generación de código, matemáticas, tareas multilingües ni ningún flujo de producción que requiera generación de texto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Todas las preguntas se congelaron antes de cada evaluación y la última tanda se evaluó una única vez.

| Conjunto de evaluación | Ananke v0 (reglas) | Ananke v1 (lector aprendido) |
|---|---|---|
| Conjunto final congelado (41 preguntas) | 14 aciertos | 16 aciertos |
| Todos los conjuntos congelados (323 preguntas) | 109 (34 %) | 119 (37 %) |
| Rechazo en temas nunca leídos (3 preguntas) | 3 / 3 | 3 / 3 |

El autor indica que la mejora de v1 sobre v0 no es estadísticamente significativa (test de signos, p ≈ 0,34) y que la respuesta corta exacta sigue siendo incorrecta aproximadamente dos de cada tres veces.

## Requisitos de hardware

- Inferencia del lector en CPU: el autor indica que el lector aprendido se ejecuta en CPU, sin requisitos de GPU para servir respuestas.
- Entrenamiento del lector: se realizó una única vez en una GPU; no se especifica modelo ni VRAM empleada.
- VRAM estimada para inferencia: no disponible (no se publican pesos ni tamaño del modelo).
- GPU recomendadas: no aplica para inferencia según la información disponible; no se especifican GPU para entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles (vLLM, llama.cpp, Ollama y TGI no son aplicables al no distribuirse pesos). El único acceso público es el Space de demostración de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Ananke v1 no es un LLM y su pipeline es extractivo, por lo que la comparación directa con modelos generativos o con sistemas RAG estándar no puede realizarse con cifras.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| Ananke v1 | Memoria + lector extractivo | no disponible | no disponible | `ameforge-proprietary` | No |
| Ananke v0 | Memoria + reglas heurísticas | no disponible | no disponible | `ameforge-proprietary` | No |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un chatbot ni un LLM: no razona, no combina hechos y no escribe texto libre.
- Cree lo que lee: texto erróneo en la memoria produce respuestas erróneas, sin mecanismo de verificación factual.
- La respuesta corta exacta falla aproximadamente dos de cada tres veces; el valor real está en los pasajes citados, no en la respuesta destacada.
- Si la recuperación devuelve el pasaje equivocado, el lector no puede corregirlo.
- Las listas (por ejemplo, "qué países limitan con…") suelen ser incompletas.
- Puede responder desde un pasaje no relacionado si alguna palabra de la pregunta es conocida por otro motivo, en lugar de rechazar; el autor recomienda leer siempre las citas.
- Solo inglés; no hay soporte multilingüe.
- Licencia propietaria: no se distribuyen pesos, motor ni lector, por lo que no es posible uso comercial, modificación ni despliegue propio. El acceso se limita al Space de demostración.
- Uso previsto exclusivamente de investigación y demostración; no apto para decisiones médicas, legales, financieras o de seguridad crítica.
- Resultados con significación estadística no demostrada frente a la versión anterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMFORGE/ananke-v1
- Versión anterior (Ananke v0): https://huggingface.co/AMFORGE/ananke-v0
- Demo Space: https://huggingface.co/spaces/ameforge/ananke
- Organización AMEFORGE en Hugging Face: https://huggingface.co/AMFORGE
- SQuAD v1.1 (dataset de entrenamiento del lector): https://rajpurkar.github.io/SQuAD-explorer/
- Artículo de SQuAD (Rajpurkar et al., 2016): no disponible como enlace directo en la información proporcionada
