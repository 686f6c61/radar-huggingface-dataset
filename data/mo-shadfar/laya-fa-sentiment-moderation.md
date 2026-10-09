# mo-shadfar/laya-fa-sentiment-moderation

## Resumen

Laya fine-tuned on Persian customer-service data es un ajuste fino del checkpoint multilingue Laya, publicado por el usuario mo-shadfar en HuggingFace. El modelo parte de Laya y se especializa en tareas de atencion al cliente en persa, concretamente en la clasificacion de intencion, urgencia y un tercer conjunto de preguntas etiquetado en la model card como "noul questions", mediante objetivos suaves (soft targets). El conjunto de ajuste es pequeno, en torno a 300 casos, y el entrenamiento se realizo en Kaggle con 2 GPU T4 usando la receta RLCD con DDP del cuaderno de ajuste de Laya.

El modelo tiene 321.908.998 parametros (aproximadamente 322 millones) segun los pesos en safetensors, con un repo de 0,7 GB, lo que sugiere pesos almacenados en precision reducida (del orden de fp16). Se distribuye bajo licencia Apache 2.0 y se carga a traves de la libreria `laya`, con una API basada en un agente que expone el metodo `predict(state, questions)`.

Su relevancia es limitada y muy especifica: se trata de un experimento de ajuste sobre un dominio concreto (moderacion y sentimiento en atencion al cliente persa) con muy pocos datos y sin descargas ni valoraciones en el momento de la consulta. Es interesante como ejemplo de la receta RLCD aplicada a un modelo pequeno de la familia Laya, pero no hay evidencia publicada de rendimiento ni de generalizacion mas alla del conjunto de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado con el tag "system-one" en la model card) |
| Parametros totales | 321.908.998 (aprox. 322 M) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | persa (segun el tag "persian"); el campo oficial de idiomas figura como no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo en la informacion disponible. La model card unicamente indica que se parte del checkpoint multilingue de Laya y se etiqueta el modelo con la etiqueta "system-one", lo que apunta a un enfoque de respuesta directa o "sistema 1" (frente a un modo de razonamiento explicito tipo "system 2"), pero no se aportan datos sobre el tipo de red, el mecanismo de atencion ni la configuracion de capas. Tampoco se especifica la longitud de contexto original del checkpoint base.

En cuanto al entrenamiento, se realizo un ajuste fino supervisado con objetivos suaves (soft targets) sobre tres cabeceras o tareas: intencion, urgencia y el conjunto de "noul questions". El conjunto de datos es reducido, en torno a 300 casos, y el procedimiento siguio la receta RLCD con entrenamiento distribuido (DDP) del cuaderno de ajuste de Laya, ejecutado en Kaggle sobre 2 GPU T4. No se documenta el numero total de tokens de entrenamiento, la composicion del corpus, ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Clasificacion de intencion en conversaciones de atencion al cliente en persa.
- Estimacion de urgencia de una consulta o mensaje entrante.
- Moderacion de sentimiento o contenido en contexto de servicio al cliente, segun el nombre del modelo (sentiment-moderation).
- Prediccion por lotes mediante la API de agente de Laya (`agent.predict(state, questions)`).
- Soporte de tool calling, agentes multi-paso o razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible.
- Capacidades multilingues: solo se evidencia el persa a partir del tag; no se confirma cobertura de otros idiomas.

## Casos de uso

- Triaje de tickets de soporte en persa: el modelo puede clasificar la intencion de cada mensaje entrante (consulta de facturacion, incidencia tecnica, reclamacion) para enrutarlo al equipo adecuado, aprovechando el ajuste especifico sobre dominios de atencion al cliente.
- Priorizacion por urgencia: asignar un nivel de urgencia a cada conversacion permite ordenar la cola de atencion y garantizar que los casos criticos se atiendan antes.
- Moderacion de mensajes en canales de atencion: dado el proposito del modelo, puede emplearse para detectar tono negativo, quejas o contenido problematico en conversaciones de servicio.
- Clasificacion previa a la respuesta automatica: usar la salida del modelo como senal para decidir si un mensaje puede resolverse con una respuesta automatica o requiere intervencion humana.
- Analitica de voz del cliente: agregar las etiquetas de intencion, urgencia y sentimiento sobre grandes volumenes de conversaciones para generar informes de calidad y deteccion de tendencias.
- Prototipado e investigacion de la receta RLCD: sirve como ejemplo reproducible de ajuste fino con objetivos suaves y DDP sobre un checkpoint multilingue, util para equipos que quieran replicar el flujo del cuaderno de Laya.
- Enrutado dentro de un sistema mayor: integrar la salida del modelo como componente de un pipeline de agentes, donde otro modelo de mayor tamano redacte la respuesta final.
- Filtrado previo en moderacion de comunidades: aplicar el modelo sobre mensajes en persa para marcar candidatos a revision antes de un paso de moderacion mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (accuracy, F1, MMLU, HumanEval, GSM8K ni equivalentes) ni comparaciones con otros modelos, y los resultados de la busqueda web no aportan datos tecnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 321.908.998 parametros y de un repo de 0,7 GB, los pesos ocupan en torno a 0,7 GB en precision reducida (del orden de fp16). En fp32 la estimacion seria de aproximadamente 1,3 GB solo para los pesos. Hay que sumar el espacio de activaciones y de cache de contexto, que depende de la longitud de secuencia y no esta documentada.
- GPU recomendadas: no hay recomendaciones oficiales de inferencia. Para el ajuste, la model card indica 2 GPU T4 en Kaggle.
- GPU de consumo: por tamano (aprox. 322 M de parametros) cabria con holgura en practicamente cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4070 o RTX 4090), asi como en CPU, aunque estas cifras son una estimacion derivada del numero de parametros y no un dato publicado por el autor.
- Opciones de despliegue: la via documentada por el autor es la libreria `laya`, con `laya.load(...)` y `agent.predict(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni Text Generation Inference para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, ni datos de parametros, contexto, rendimiento o licencia de alternativas. No se puede establecer una comparativa fiable sin inventar cifras.

## Limitaciones y advertencias

- Conjunto de ajuste muy reducido (en torno a 300 casos), lo que limita la generalizacion y aumenta el riesgo de sobreajuste a las plantillas del corpus de entrenamiento.
- No se documentan benchmarks, evaluaciones ni particiones de validacion, por lo que el rendimiento real en produccion es desconocido.
- Sesgos conocidos: no disponibles, pero al entrenarse sobre un unico dominio (atencion al cliente persa) es probable que el modelo rinda mal fuera de ese registro.
- Riesgo de alucinacion: el modelo parece orientado a clasificacion, pero no se detalla su comportamiento en generacion abierta; en cualquier caso, no hay garantias sin evaluacion.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada, y el unico idioma evidenciado es el persa.
- Licencia: Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del checkpoint base de Laya del que deriva, ya que la model card no aclara su licencia de origen.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, sin mantenimiento documentado (creado y actualizado el mismo dia), por lo que no es un artefacto con soporte comunitario.
- La model card no indica autor, institucion ni proceso de validacion; tratarlo como recurso experimental y no como modelo listo para produccion.

## Enlaces

- HuggingFace: https://huggingface.co/mo-shadfar/laya-fa-sentiment-moderation
- Paper, blog, repositorio o demo adicionales: no disponible. Los resultados de la busqueda web no contienen enlaces relacionados con este modelo (los resultados obtenidos corresponden a contenidos no relacionados: conversion de unidades Mo/Go, series de television y entradas de enciclopedia).
