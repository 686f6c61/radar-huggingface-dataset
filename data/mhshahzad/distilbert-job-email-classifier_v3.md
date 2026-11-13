# mhshahzad/distilbert-job-email-classifier_v3

## Resumen

DistilBERT Job Email Classifier v3 es un modelo de clasificación de texto obtenido por fine-tuning de `distilbert-base-uncased` sobre correos electrónicos de búsqueda de empleo. Lo desarrolla el usuario de Hugging Face mhshahzad y resuelve una tarea muy concreta: asignar cada correo a una de cinco etiquetas de flujo de trabajo (`application_confirmation`, `assessment`, `interview_invitation`, `offer`, `rejection`). El modelo tiene 66.957.317 parámetros y una longitud máxima de entrada de 256 tokens.

La relevancia del modelo es limitada y experimental: se trata de una herramienta personal para organizar el propio correo de búsqueda de empleo, no de un clasificador de propósito general. El autor declara explícitamente que el repositorio es privado y que el acceso a los pesos está controlado por el propietario, lo que condiciona su disponibilidad real. La model card reporta 0,9681 de accuracy y 0,8673 de macro-F1 sobre 973 ejemplos de test, pero con clases minoritarias muy poco representadas (2 ejemplos de `offer` y 13 de `assessment`), lo que hace que esas métricas sean altamente inciertas.

Arquitectónicamente es un transformer encoder destilado de BERT, con una cabeza de clasificación de secuencia de una sola etiqueta. No incorpora generación de texto, tool calling ni capacidades multimodales. Su interés práctico se reduce a servir como referencia de fine-tuning ligero para clasificación de correo y a ilustrar los riesgos de evaluar con conjuntos de test desbalanceados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBertForSequenceClassification (transformer encoder destilado de BERT) |
| Parámetros totales | 66.957.317 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (entradas más largas se truncan) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; al ser un modelo de 67 M de parámetros es viable en fp32/fp16 estándar) |
| Idiomas soportados | no disponible (el modelo base es `distilbert-base-uncased`, entrenado principalmente en inglés, pero el autor no valida idiomas) |
| Licencia | no disponible (la model card indica que no se especifica licencia y que hay que consultar al propietario) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 M de parámetros obtenido por destilación de BERT-base. Sobre él se añade una cabeza `DistilBertForSequenceClassification` con cinco clases de salida. La entrada se construye concatenando asunto y cuerpo con el formato `Subject: {subject}\nEmail: {body}`, truncando a 256 tokens.

El fine-tuning de la versión v3 usó la muestra de entrenamiento experimental previa, que según las notas del autor incluía 50 ejemplos sintéticos de `offer` (solo para entrenamiento). Hiperparámetros documentados: longitud máxima de secuencia 256, learning rate `2e-5`, semilla 42 y ocho épocas configuradas. El checkpoint se seleccionó por macro-F1 de validación, con un mejor valor de 0,8580. El dataset de entrenamiento es privado (`mhshahzad/job_application_emails_clean_training_dataset`, revisión `28a2b423bf0be636ae0736a35cc96c4f290a8277`) y su contenido no se redistribuye. No se documenta RLHF, DPO ni ninguna innovación técnica adicional; es un fine-tuning supervisado convencional.

## Capacidades

- Clasificación de texto de etiqueta única en cinco categorías de correo de búsqueda de empleo: `application_confirmation`, `assessment`, `interview_invitation`, `offer` y `rejection`.
- Procesamiento conjunto de asunto y cuerpo del correo mediante el formato `Subject: ... Email: ...`.
- Salida de probabilidades por clase (no calibradas) mediante `pipeline("text-classification", top_k=None)`.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no validadas; el autor advierte que no se ha validado en distintos idiomas.
- No dispone de modo thinking ni de capacidades de audio.

## Casos de uso

- Organización personal del correo de búsqueda de empleo: el modelo clasifica cada correo entrante en una de las cinco etiquetas para etiquetar automáticamente una carpeta o bandeja de entrada, con revisión humana posterior. Es el uso previsto explícito del autor.
- Filtrado de confirmaciones de candidatura: con 577 ejemplos de test y un F1 de 0,9785 en `application_confirmation`, puede separar de forma fiable los acuses de recibo del resto del flujo.
- Detección de rechazos: con F1 de 0,9670 en `rejection` sobre 333 ejemplos, es útil para archivar automáticamente correos de descarte y mantener limpia la bandeja principal.
- Priorización de invitaciones a entrevista: con F1 de 0,8913 en `interview_invitation` sobre 48 ejemplos, puede marcar estos correos para revisión inmediata, siempre con verificación humana.
- Prototipado de pipelines de clasificación de correo: sirve como baseline ligero (67 M de parámetros, latencia reportada de 1,90 ms/correo) para experimentar con preprocesado asunto+cuerpo antes de escalar a modelos mayores.
- Investigación sobre fine-tuning de DistilBERT en dominios muy específicos: útil como ejemplo de selección de checkpoint por macro-F1 y de los problemas de evaluar clases minoritarias con muy pocos ejemplos.
- Clasificación local en entornos con recursos limitados: al ser un modelo de 67 M de parámetros, cabe en CPU y en GPU de consumo, lo que permite ejecutarlo sin enviar correos personales a servicios externos, algo relevante por la privacidad del contenido.

## Benchmarks y rendimiento

Resultados de una única evaluación sobre 973 ejemplos de test, según la model card:

| Métrica | Resultado |
|---|---:|
| Accuracy | 0,9681 |
| Macro-F1 | 0,8673 |
| Weighted-F1 | 0,9677 |
| Latencia media | 1,90 ms/correo |

Desglose por clase:

| Categoría | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| application_confirmation | 0,9726 | 0,9844 | 0,9785 | 577 |
| assessment | 0,9091 | 0,7692 | 0,8333 | 13 |
| interview_invitation | 0,9318 | 0,8542 | 0,8913 | 48 |
| offer | 1,0000 | 0,5000 | 0,6667 | 2 |
| rejection | 0,9670 | 0,9670 | 0,9670 | 333 |

El autor compara con una versión previa v2-2 (0,9496 de accuracy y 0,7094 de macro-F1), pero advierte que los informes referencian revisiones de dataset distintas y no constituyen una comparación controlada ni emparejada. No se han publicado resultados frente a modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 66,9 M de parámetros (aproximadamente 268 MB de pesos) más el overhead de activaciones; en fp16 alrededor de 134 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona sin problema en GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo y también en CPU: es viable ejecutarlo en portátiles sin GPU dedicada para volúmenes moderados de correo.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (el tag `text-embeddings-inference` aparece en el repositorio) y endpoints compatibles. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: la model card reporta 1,90 ms/correo, pero el autor indica que la medición depende del runtime y del hardware, que no se documentaron como benchmark controlado, por lo que no debe tomarse como garantía de despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| mhshahzad/distilbert-job-email-classifier_v3 | 66,9 M | 256 tokens | Clasificación de correo de empleo (5 clases) | no disponible | Repositorio privado, acceso controlado |
| distilbert-base-uncased (modelo base) | 66,4 M | 512 tokens | Modelo de lenguaje enmascarado general | Apache 2.0 (según el modelo base original) | Público en Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Modelo de lenguaje general, base para fine-tuning | Apache 2.0 | Público en Hugging Face |
| Otros clasificadores de correo fine-tuned sobre BERT/DistilBERT | variable | 512 tokens típicamente | Clasificación de correo genérica | variable según autor | variable |

No se dispone de comparaciones controladas con alternativas de la misma categoría en la información proporcionada. La comparación con el modelo base y con BERT-base es estructural, no de rendimiento en esta tarea concreta.

## Limitaciones y advertencias

- El conjunto de test contiene solo 2 ejemplos de `offer` y 13 de `assessment`; las métricas de esas clases son altamente inciertas (el recall de `offer` se basa en 1 acierto de 2).
- Resultados de una sola ejecución y una sola semilla; no es un benchmark multi-semilla.
- No hubo adjudicación independiente de etiquetas ni verificación de separación por hilo de conversación; los identificadores de hilo no estaban disponibles.
- El rendimiento puede degradarse con plantillas de correo, idiomas, regiones, prácticas de reclutamiento o distribuciones de clase distintas.
- La latencia reportada no es una garantía de velocidad en despliegue.
- Las puntuaciones no están calibradas y pueden ser erróneas; el autor recomienda inspeccionar el correo antes de actuar sobre una predicción.
- Uso fuera de alcance prohibido por el autor: contratación, cribado de candidatos, decisiones de empleo o cualquier decisión consecuente. No es un clasificador de correo de propósito general.
- Licencia no especificada: hay que consultar al propietario antes de usar, redistribuir o adaptar los pesos.
- El repositorio es privado, por lo que el acceso requiere autorización del propietario; las descargas y likes públicos figuran a 0.
- Riesgo de privacidad: los correos de búsqueda de empleo pueden contener información personal y sensible; el dataset de entrenamiento es privado y no se redistribuye.
- No se ha validado en distintos idiomas ni en distintos sistemas de reclutamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhshahzad/distilbert-job-email-classifier_v3
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/mhshahzad/job_application_emails_clean_training_dataset
- Informe de evaluación: `evaluation/classification_report.json` (incluido en el repositorio del modelo)
- Matriz de confusión: `evaluation/confusion_matrix.csv` (incluido en el repositorio del modelo)
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
