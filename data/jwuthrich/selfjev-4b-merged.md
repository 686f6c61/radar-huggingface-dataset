# Jwuthrich/selfjev-4b-merged

## Resumen

SelfJev-4B (merged) es un modelo de decisión estructurada desarrollado por el usuario Jwuthrich, publicado en HuggingFace como un checkpoint fusionado de aproximadamente 4,66 mil millones de parámetros. No es un modelo generativo al uso: en lugar de producir texto token a token, recibe un documento y un conjunto de preguntas con opciones candidatas, y devuelve probabilidades sobre esas opciones (sí/no, selección única, puntuación ordenada o selección múltiple). Está construido sobre el backbone Qwen/Qwen3.5-4B mediante un ajuste fino tipo LoRA que ya viene fusionado en los pesos, por lo que no requiere descargar el modelo base ni el adaptador por separado.

El repositorio contiene el checkpoint completo (unos 9,3 GB de pesos), el tokenizador y la configuración, y conserva el layout original del checkpoint, incluidas las capas de visión de Qwen3.5 sin modificar. Sin embargo, SelfJev está entrenado y evaluado exclusivamente para texto. El motor por defecto comparte el cálculo del documento entre todas las preguntas y puntúa directamente los candidatos, sin decodificación autoregresiva, lo que reduce la latencia frente a un LLM equivalente. Se distribuye con un SDK de Python y una API HTTP (TreeServer) para integrarlo en pipelines de enrutamiento, verificación y moderación.

La relevancia actual del modelo radica en su enfoque: ofrece una alternativa autoalojada y de tamaño reducido a servicios propietarios de "decisiones tipadas" como Jev (TypeSafe AI), con resultados reportados del 95,7% en decisiones de texto (1.991 preguntas) y 83,4% en tareas de fuentes públicas (3.300 preguntas). El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado su licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B; pesos de visión conservados sin modificar, ajuste orientado a texto) |
| Parametros totales | 4.659.865.088 (≈4,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos en safetensors; el tamaño de 9,3 GB es consistente con precisión bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

SelfJev-4B es un ajuste fino (relación declarada: finetune) de Qwen/Qwen3.5-4B. El autor publica un checkpoint fusionado: el adaptador LoRA de SelfJev ya está incorporado en los pesos de Qwen3.5-4B fijados, y se conserva el layout original del checkpoint, incluidas las capas de visión sin tocar. La model card indica que el modelo fue "trained and evaluated for text", por lo que las capacidades multimodales del backbone no se explotan en este artefacto. El pipeline declarado en HuggingFace es `text-classification`, aunque la etiqueta `image-text-to-text` también aparece en los tags del repositorio.

El detalle del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o preferencias) no está disponible en la información proporcionada. La innovación técnica destacable no está en la arquitectura del backbone, sino en el motor de inferencia: en lugar de generar una respuesta token a token, el sistema comparte el cálculo del documento entre todas las preguntas y puntúa directamente las opciones candidatas, devolviendo probabilidades tipadas (probabilidad de "sí", opción seleccionada, puntuación ordenada o conjunto de opciones que cumplen). El autor publica la procedencia de la fusión en `merge_meta.json` y comprobaciones de integridad en `verification.json`, e indica que este artefacto fusionado pasó chequeos de integridad de tensores y dos casos de humo sintéticos en GPU, pero no ha sido evaluado por separado a través de vLLM.

## Capacidades

- Decisión estructurada sobre opciones suministradas: respuesta binaria (sí/no) con probabilidad, selección de una opción entre varias, puntuación ordenada sobre niveles y selección múltiple de todas las opciones que cumplen.
- Enrutamiento de mensajes e intención (por ejemplo, clasificación de intenciones al estilo CLINC150 o Banking77).
- Verificación de afirmaciones y guardrails: comprobación de hechos concretos contra un documento y detección de respuestas problemáticas.
- Revisión de respuestas de IA: evaluación, juicio, puntuación, moderación y detección de jailbreak.
- Clasificación temática (noticias, temas generales) y análisis de sentimiento.
- Comprensión lectora y pregunta-respuesta con opciones (estilo BoolQ).
- Clasificación de emociones (con rendimiento notablemente inferior, ver benchmarks).
- Salida vía SDK de Python o API HTTP mediante el motor TreeServer.
- Modo de decisión sin generación autoregresiva: no produce texto libre, solo valores tipados y probabilidades.
- Capacidades multimodales: no disponibles en este artefacto según la model card (aunque el backbone Qwen3.5 conserva los pesos de visión).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado como tal, aunque el modelo puede encadenarse dentro de pipelines de decisión.
- Capacidades multilingües: no disponibles (idiomas no declarados).

## Casos de uso

- Enrutamiento de atención al cliente: dado un mensaje entrante y un conjunto de categorías o colas de soporte, el modelo devuelve la opción más probable y su probabilidad. Es adecuado porque el cálculo del documento se comparte entre todas las preguntas y no requiere generar texto, lo que abarata el coste por consulta frente a un LLM.
- Guardrails y moderación de contenido: recibir una respuesta generada por otro modelo junto con criterios de política (por ejemplo, "¿contiene datos personales?", "¿es una promesa no verificable?") y obtener probabilidades de "sí" para activar o bloquear la respuesta. Los resultados reportados de 93,1% en revisión de respuestas de IA respaldan este uso.
- Verificación de afirmaciones en pipelines RAG: dado un documento recuperado y una afirmación, usar la salida binaria para comprobar si la afirmación está soportada por la evidencia antes de mostrarla al usuario.
- Clasificación de tickets e intenciones bancarias: con 96,3% reportado en Banking77 y 95,0% en CLINC150, puede etiquetar automáticamente peticiones entrantes en un centro de operaciones.
- Etiquetado múltiple de incidencias: cuando un mismo texto puede pertenecer a varias categorías, el modelo devuelve el conjunto completo de opciones que cumplen (con la exigencia de que el conjunto entero coincida para contabilizarlo como acierto).
- Puntuación y revisión de calidad: evaluar una respuesta o un texto asignando un nivel sobre una escala ordenada (por ejemplo, mala/aceptable/buena/excelente) con distribución de probabilidades, útil para sistemas de feedback automatizado.
- Detección de temas en noticias y flujos de contenido: con 90,3% en AG News y 98,0% en DBpedia reportados, sirve para etiquetar grandes volúmenes de artículos sin coste de generación.
- Análisis rápido de sentimiento en redes sociales o reseñas: 91,3% en SST-2, aunque con un rendimiento mucho más bajo en datasets de etiquetas ruidosas (57,3% en dair-ai emotion).
- Detección de jailbreak o intentos de bypass en un gateway de modelos: combinar varias preguntas binarias sobre el mismo prompt y decidir con el umbral de probabilidad configurado por el operador.

## Benchmarks y rendimiento

Resultados reportados en la model card (motor TreeServer y predicciones Jev emparejadas, no una release nueva evaluada en vLLM):

| Evaluacion | Preguntas | SelfJev-4B | Jev API (propietario) |
|---|---:|---:|---:|
| Decisiones de texto | 1.991 | 95,7% | 97,2% |
| Revision de respuestas de IA | 946 | 93,1% | 92,5% |
| Tareas de fuentes publicas | 3.300 | 83,4% | 82,1% |

Desglose por dataset de origen (300 preguntas por fuente, 3.300 en total):

| Dataset fuente | Tarea en el protocolo | Exposicion | Preguntas | SelfJev | Jev |
|---|---|---|---:|---:|---:|
| CLINC150 | Enrutamiento de intencion | fuente reservada | 300 | 95,0% | 94,3% |
| DBpedia | Clasificacion tematica | fuente reservada | 300 | 98,0% | 98,0% |
| TREC | Tipo de pregunta | fuente reservada | 300 | 91,3% | 94,0% |
| Emotion (dair-ai) | Clasificacion de emociones | fuente reservada | 300 | 57,3% | 57,7% |
| BoolQ | Comprension lectora | fuente reservada | 300 | 87,7% | 90,7% |
| SST-2 | Sentimiento | fuente reservada | 300 | 91,3% | 96,7% |
| Banking77 | Intencion bancaria | fuente vista | 300 | 96,3% | 95,7% |
| AG News | Tema de noticias | fuente vista | 300 | 90,3% | 87,3% |
| TweetEval | Sentimiento en tuits | fuente vista | 300 | (truncado en la model card) | (truncado) |

Comparativa reportada con otro modelo abierto: en las mismas 1.991 preguntas de decisión de texto, una ejecución de Eikos-4B con su adaptador de tarea y su lectura basada en letras obtuvo 92,8%, frente al 95,7% de SelfJev-4B. El autor advierte que es una comparación bajo el protocolo de este proyecto y no una clasificación general de modelos abiertos. No existe todavía un resultado de SelfJev en S1Bench, y las puntuaciones publicadas de Lev en S1Bench no son comparables con las de este conjunto de pruebas propio.

Advertencia metodológica del autor: los conjuntos propios usan etiquetas verificadas por IA, no ground truth humano; el conjunto de fuentes públicas es un benchmark de desarrollo reutilizado repetidamente; y se necesita una evaluación independiente nueva.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en precisión completa (≈9,3 GB), se necesitan aproximadamente 11-12 GB de VRAM teniendo en cuenta activaciones y caché. Cuantizado a 8 bits, del orden de 5-6 GB; a 4 bits, del orden de 3-4 GB. Estas cifras son estimaciones a partir del tamaño de los pesos; los tipos de cuantización publicados no están disponibles.
- GPU recomendadas: el tamaño de 4,66 B permite servir en una sola GPU de 16 GB o más (RTX 4080, RTX 4090, RTX 3090, L4, A10G). Para despliegues de mayor concurrencia, A100 o H100 aportan más ancho de banda y permiten batching.
- Cabe en GPU de consumo: sí. En bf16 entra en tarjetas de 16 GB o más; con cuantización, en tarjetas de 8-12 GB.
- Opciones de despliegue: el proyecto proporciona su propio motor (TreeServer) con SDK de Python y API HTTP; también es compatible con `transformers` y con endpoints. El autor indica explícitamente que este artefacto fusionado no ha sido evaluado a través de vLLM, por lo que el rendimiento en vLLM no está confirmado. Opciones como llama.cpp, Ollama o TGI no están documentadas para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada (la model card menciona una sección de latencia y velocidad, pero su contenido no se ha incluido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SelfJev-4B (merged) | ≈4,66 B | no disponible | 95,7% decisiones de texto; 93,1% revision IA; 83,4% fuentes publicas | no disponible | Pesos abiertos en HuggingFace (0 descargas, 0 likes) |
| Eikos-4B | ≈4 B (segun nombre) | no disponible | 92,8% en las mismas 1.991 preguntas del protocolo del autor | no disponible | Resultado reportado en los informes del proyecto |
| Jev (TypeSafe AI) | no disponible | no disponible | 97,2% decisiones de texto; 92,5% revision IA; 82,1% fuentes publicas | propietaria (API) | Acceso temprano limitado desde el 15 de septiembre de 2026 |
| SemIf-OpenJev | no disponible | no disponible | no disponible | no disponible | Repositorio independiente en GitHub |

El autor menciona además otros modelos de decisión (Lev, Reflex) pero indica que su comparación requeriría la misma revisión del dataset, los mismos identificadores de ítem, los mismos conjuntos de candidatos, las mismas reglas de puntuación y la misma cobertura; no se ofrecen cifras comparables.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es un riesgo relevante antes de llevarlo a producción.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; los datasets de evaluación son mayoritariamente en inglés.
- Sin evaluación independiente: las puntuaciones proceden del autor y de conjuntos de pruebas propios con etiquetas verificadas por IA, no por humanos. El propio autor lo señala como una limitación.
- Benchmark público reutilizado: el conjunto de fuentes públicas es un desarrollo repetidamente usado; puede existir sobreajuste al mismo.
- Sin resultado en S1Bench y sin comparabilidad garantizada con Lev, Reflex u otros modelos de decisión.
- No es un modelo generativo: no produce texto libre. No sirve para chat, resúmenes, traducción ni generación de código; está limitado a la selección y puntuación de opciones que se le suministran.
- Riesgo de calibración deficiente: al devolver probabilidades sobre opciones, el riesgo no es la alucinación de texto, sino asignar una probabilidad alta a una opción incorrecta o mal calibrada. Se recomienda validar umbrales con datos propios.
- Rendimiento bajo en etiquetas ruidosas: 57,3% en el dataset de emociones y, según la nota del repositorio GitHub del proyecto, todos los modelos quedan muy por debajo del 100% en conjuntos públicos de etiquetas ruidosas (GoEmotions, TweetEval, dair-ai emotion).
- Selección múltiple estricta: en las evaluaciones, una pregunta con múltiples opciones solo cuenta como correcta si coincide el conjunto completo, lo que puede penalizar el rendimiento percibido en tareas de etiquetado múltiple.
- Modelo fusionado sin benchmark en vLLM: el artefacto publica verificaciones de integridad de tensores y dos casos de humo, pero no una evaluación completa del checkpoint fusionado.
- Pesos de visión heredados pero no entrenados: la model card indica que SelfJev está entrenado y evaluado para texto, por lo que no se debe esperar un comportamiento fiable en tareas de imagen.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.

## Enlaces

- Modelo en HuggingFace (checkpoint fusionado): https://huggingface.co/Jwuthrich/selfjev-4b-merged
- Release del adaptador compacto: https://huggingface.co/Jwuthrich/selfjev-4b
- Codigo fuente del proyecto: https://github.com/Jwuthri/SelfJev
- Procedencia de la fusión: `merge_meta.json` (en el repositorio del modelo)
- Comprobaciones de integridad: `verification.json` (en el repositorio del modelo)
- Informe de decisiones de texto: https://github.com/Jwuthri/SelfJev/blob/master/reports/selfjev_4b_treeserver/eval2/report.json
- Informe de revisión de respuestas de IA: https://github.com/Jwuthri/SelfJev/blob/master/reports/selfjev_4b_treeserver/eval_llm/report.json
- Informe de tareas de fuentes públicas: https://github.com/Jwuthri/SelfJev/blob/master/reports/selfjev_4b_treeserver/test/report.json
- Informe de Eikos-4B: https://github.com/Jwuthri/SelfJev/blob/master/reports/eikos_4b/eval2/report.json
- Wikipedia sobre Jev (modelo de TypeSafe AI): https://en.wikipedia.org/wiki/Jev_(AI_model)
- Proyecto independiente SemIf-OpenJev: https://github.com/TheoLeeCJ/SemIf-OpenJev
- Datasets de evaluación citados: https://huggingface.co/datasets/clinc/clinc_oos, https://huggingface.co/datasets/fancyzhx/dbpedia_14, https://huggingface.co/datasets/SetFit/TREC-QC, https://huggingface.co/datasets/dair-ai/emotion, https://huggingface.co/datasets/google/boolq, https://huggingface.co/datasets/stanfordnlp/sst2, https://huggingface.co/datasets/mteb/banking77, https://huggingface.co/datasets/fancyzhx/ag_news, https://huggingface.co/datasets/cardiffnlp/tweet_eval
