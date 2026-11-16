# andre-atlas/susanna-guardrail-clinico

## Resumen

SUSANNA · Clinical guardrail classifier (pt-BR) es un clasificador binario de texto desarrollado por andre-atlas que distingue consultas clínicas (solicitudes de diagnóstico, medicación o posología) de consultas administrativas (horarios, ubicaciones, servicios, calendario de vacunación) en portugués de Brasil. El modelo actúa como barrera de seguridad del asistente RAG SUSANNA, centrado en el sistema público de salud del Distrito Federal de Brasil (SUS-DF): cuando una pregunta se clasifica como clínica, el asistente no la responde y deriva al ciudadano a una unidad de salud o al servicio de emergencias (SAMU 192).

Técnicamente no es un modelo neuronal, sino un pipeline clásico de scikit-learn 1.6.1: un `TfidfVectorizer` con n-gramas de 1 a 2 seguido de una regresión logística con `class_weight="balanced"`, `solver="liblinear"` y `random_state=42`. Los pesos se almacenan en formato skops, que a diferencia de pickle no ejecuta código arbitrario al cargar. El conjunto de entrenamiento es muy reducido: 417 frases escritas a mano (198 clínicas, 219 administrativas), con expresiones coloquiales incluidas.

Su relevancia es acotada pero clara: ilustra cómo un componente de gobernanza ligero, entrenado con pocos datos y desplegable en CPU, puede integrarse como capa de seguridad en un sistema de salud pública antes de llegar a un LLM generativo. No es un modelo de propósito general ni compite con LLMs; su función es el enrutamiento seguro de consultas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (n-gramas 1-2) + regresión logística (scikit-learn 1.6.1) |
| Parametros totales | no disponible (modelo lineal; tamaño del repo 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificador por frase, sin ventana definida) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales; formato skops) |
| Idiomas soportados | portugués de Brasil (pt) |
| Licencia | MIT |
| Formato de pesos | skops (`guardrail_model.skops`) |
| Etiquetas | 1 = clínica, 0 = administrativa |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clásico, no un transformer. La entrada se vectoriza con TF-IDF sobre unigramas y bigramas y se pasa a una regresión logística con ponderación de clases balanceada (`class_weight="balanced"`) y solver liblinear. Se entrenó con scikit-learn 1.6.1 y se serializó en skops, lo que evita la ejecución de código arbitrario en la carga que sí permite pickle.

El corpus de entrenamiento consta de 417 frases redactadas manualmente por el equipo del proyecto: 198 clínicas y 219 administrativas, con formulaciones coloquiales representativas del habla real de los ciudadanos. No se documenta uso de RLHF, DPO ni aumento de datos. La evaluación se realizó mediante validación cruzada estratificada de 5 pliegues y un hold-out del 25 % (n = 105). El vocabulario está fuertemente ligado al contexto del SUS-DF, lo que limita la generalización fuera de ese dominio.

## Capacidades

- Clasificación binaria de texto: distingue consultas clínicas de administrativas en portugués de Brasil.
- Detección de solicitudes de diagnóstico, medicación o posología para su bloqueo y derivación.
- Reconocimiento de formulaciones coloquiales gracias al entrenamiento con frases del habla real.
- Integración como capa de guardrail en pipelines RAG: el asistente SUSANNA lo usa para decidir si responde o deriva a una unidad de salud o al SAMU 192.
- Carga segura de pesos mediante skops (sin ejecución de código arbitrario).
- Inferencia en CPU con latencia muy baja por ser un modelo lineal.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento.
- Capacidad multilingüe nula: solo portugués de Brasil.

## Casos de uso

- Guardrail en asistentes de salud pública: antes de pasar una consulta al LLM generativo, el clasificador decide si es clínica y, en ese caso, bloquea la respuesta y muestra la derivación a una unidad de salud o al SAMU 192. Es adecuado por su bajo coste computacional y su alta recall en la clase clínica en la evaluación publicada.
- Triaje de consultas en portales ciudadanos: clasificar los mensajes entrantes de un formulario o chat para enrutarlos al departamento administrativo correspondiente (horarios, ubicaciones, servicios, vacunación) o a un aviso de derivación sanitaria.
- Moderación previa en chatbots de atención al ciudadano: filtrar peticiones de medicación o diagnóstico que el bot no está autorizado a responder, evitando respuestas potencialmente peligrosas.
- Enrutamiento en sistemas RAG sobre normativa sanitaria: separar las preguntas que pueden responderse con documentación administrativa de las que requieren intervención humana.
- Capa de seguridad en entornos con recursos limitados: al ser un modelo lineal en formato skops, puede desplegarse en CPU sin GPU, integrándose en servicios ligeros o funciones serverless.
- Generación de datos de evaluación para guardrails: servir como referencia o línea base para comparar clasificadores de seguridad más complejos en el dominio sanitario portugués.
- Prototipado rápido de políticas de derivación: permite iterar sobre la política de bloqueo y derivación con un componente determinista y fácil de auditar.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados sobre el conjunto del proyecto (417 frases):

| Métrica (clase clínica) | CV estratificada 5 pliegues (media ± desv.) | Hold-out (25 %, n = 105) |
|---|---|---|
| Accuracy | 0,974 ± 0,014 | 0,981 |
| Precision | 0,970 ± 0,023 | 0,980 |
| Recall | 0,975 ± 0,022 | 0,980 |
| F1 | 0,972 ± 0,015 | 0,980 |
| ROC AUC | no calculado | 0,998 |

Matriz de confusión del hold-out: 54 verdaderos negativos, 1 falso positivo, 1 falso negativo, 49 verdaderos positivos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU (contenedores, funciones serverless, Raspberry Pi).
- Opciones de despliegue: carga directa con `skops.io` + scikit-learn en Python; integración como paso previo en pipelines RAG propios; no es compatible con vLLM, llama.cpp, Ollama ni TGI por no ser un modelo neuronal.
- Latencia y throughput: no disponibles de forma explícita; por tratarse de TF-IDF + regresión logística, la inferencia por frase es del orden de microsegundos a milisegundos en CPU.
- Memoria RAM: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto muy pequeño.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa de la categoría (clasificadores de guardrail), podrían considerarse clasificadores de texto basados en transformers (por ejemplo, BETO o XLM-R ajustados para clasificación en portugués), pero no se han encontrado en la información disponible métricas que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

| Criterio | SUSANNA guardrail | Alternativas transformer (p. ej. BETO ajustado) |
|---|---|---|
| Arquitectura | TF-IDF + regresión logística | Transformer encoder |
| Parámetros | no disponible (lineal) | cientos de millones (típico) |
| Contexto | no aplica | 512 tokens (típico) |
| Licencia | MIT | variable según modelo base |
| Requisitos | CPU | CPU/GPU |
| Datos de comparación | no disponibles | no disponibles |

## Limitaciones y advertencias

- No es un dispositivo médico: solo enruta preguntas y no ofrece consejo sanitario.
- El conjunto de entrenamiento es muy pequeño (417 frases) y fue redactado por el propio equipo; las métricas publicadas son optimistas para tráfico real y el modelo no se evaluó con conversaciones de producción.
- Un falso negativo deja pasar una pregunta clínica; en SUSANNA este modelo es una capa entre otras, no la única salvaguarda.
- Solo portugués de Brasil, con vocabulario ligado al contexto del SUS-DF; no generaliza a otros dominios ni variantes del portugués.
- El vocabulario TF-IDF es sensible a la formulación: paráfrasis no vistas durante el entrenamiento pueden degradar el rendimiento.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con frases del equipo, puede reflejar sesgos de redacción y de cobertura limitada de expresiones regionales.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí existe riesgo de clasificación errónea.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Para producción se recomienda monitorizar falsos negativos y ampliar el corpus con datos reales antes de confiar en él como única barrera de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andre-atlas/susanna-guardrail-clinico
- Repositorio del proyecto SUSANNA-HEALTHCHECK: https://github.com/Andre-Atlas/SUSANNA-HEALTHCHECK
- Documentación de skops: https://skops.readthedocs.io
