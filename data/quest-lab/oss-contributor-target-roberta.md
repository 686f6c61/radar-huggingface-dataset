# quest-lab/oss-contributor-target-roberta

## Resumen

El modelo `quest-lab/oss-contributor-target-roberta` es un clasificador de texto basado en RoBERTa-base, afinado por el autor `quest-lab` para una tarea muy concreta: determinar si un comentario toxico en una discusion de GitHub (issues o pull requests) va dirigido a un colaborador del proyecto (`contributor_within_project`) o a otra entidad (codigo, herramientas externas, contenido de juegos, uno mismo, etc.). Procede del estudio *Toxicity in Open Source: Does It Hit Gaming Projects Differently?* y se distribuye como exportacion ONNX cuantizada a 8 bits para su uso en navegador mediante transformers.js.

El modelo no es un detector de toxicidad general, sino un segundo clasificador que se aplica sobre comentarios que ya han sido etiquetados como toxicos. Su entrada es ese comentario ya limpio (texto citado, codigo y URLs eliminados; menciones y correos sustituidos por `<USER>`) y truncado a 256 tokens, y devuelve una probabilidad con umbral de decision fijado en 0,50. Sobre el conjunto de test retenido de 407 comentarios toxicos, el modelo PyTorch original alcanza una F1 de 0,835 y la version ONNX cuantizada una F1 de 0,836, lo que indica que la cuantizacion no degrada practicamente el rendimiento.

Es relevante para quienes investigan moderacion y salud de comunidades en proyectos open source, y especialmente para analisis de toxicidad dirigida a personas frente a toxicidad dirigida a artefactos tecnicos. El repositorio es pequeno (0,1 GB) y esta pensado para inferencia ligera en cliente, no para despliegues de servidor de alta capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder) |
| Parametros totales | no disponible (RoBERTa-base tiene ~125 M, dato no confirmado en la ficha del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado de entrada) |
| Tipos de cuantizacion | ONNX cuantizado a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportacion para transformers.js) |

## Arquitectura y entrenamiento

El modelo parte de RoBERTa-base, un transformer encoder, y se afina como clasificador binario de secuencia para la etiqueta `contributor_within_project`. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; solo indica que deriva del estudio sobre toxicidad en proyectos open source y gaming. La entrada se preprocesa de forma especifica: se eliminan citas, bloques de codigo y URLs, y se reemplazan menciones y correos por el token `<USER>`, con truncado a 256 tokens.

La innovacion destacable no esta en la arquitectura sino en el pipeline de publicacion: el modelo se exporta a ONNX y se cuantiza a 8 bits para ejecutarse en navegador con transformers.js, manteniendo el rendimiento del modelo PyTorch original (F1 de 0,836 frente a 0,835). El umbral de decision es 0,50.

## Capacidades

- Clasificacion binaria de comentarios toxicos de GitHub: distingue si el comentario se dirige a un colaborador del proyecto o a otra entidad.
- Clasificacion de texto corto (hasta 256 tokens) con preprocesamiento especifico para comentarios de issues y pull requests.
- Inferencia en navegador mediante transformers.js y ONNX, sin necesidad de backend.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponible.
- No es un detector de toxicidad general; presupone que el comentario ya ha sido clasificado como toxico.

## Casos de uso

- Moderacion asistida en repositorios open source: tras un detector de toxicidad de primera etapa, este modelo permite separar ataques dirigidos a personas (colaboradores) de criticas toxicas dirigidas a codigo o herramientas, lo que ayuda a priorizar la intervencion humana.
- Analisis de salud de comunidad en estudios academicos: cuantificar la proporcion de toxicidad interpersonal frente a toxicidad tecnica en issues y pull requests de un proyecto.
- Paneles de investigacion en navegador: al ser un ONNX cuantizado de 0,1 GB, puede integrarse en herramientas web de analisis de repositorios sin enviar comentarios a un servidor externo.
- Filtrado previo en pipelines de CI de moderacion: marcar automaticamente comentarios toxicos dirigidos a colaboradores para revision por parte de mantenedores.
- Comparativa entre proyectos de gaming y no gaming: el modelo nace del estudio sobre toxicidad en proyectos de videojuegos, por lo que sirve para replicar o extender ese analisis.
- Investigacion sobre sesgos en moderacion: permite estudiar si la toxicidad dirigida a personas se distribuye de forma distinta segun el tipo de proyecto o el perfil del colaborador.

## Benchmarks y rendimiento

Datos publicados en la model card sobre 407 comentarios toxicos de test retenidos:

| Modelo | Precision | Recall | F1 |
|---|---|---|---|
| Modelo PyTorch original | 0,845 | 0,826 | 0,835 |
| Modelo ONNX cuantizado (transformers.js) | 0,832 | 0,839 | 0,836 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que la tarea no es de generacion general sino de clasificacion binaria especifica.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que la inferencia cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier modelo actual, e incluso en navegador.
- Opciones de despliegue: transformers.js (objetivo principal), ONNX Runtime, y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La tarea (clasificacion del objetivo de un comentario toxico en GitHub) es muy especifica y no se han identificado alternativas equivalentes con datos publicados en esta ficha.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quest-lab/oss-contributor-target-roberta | no disponible | 256 tokens | Clasificacion de objetivo de toxicidad | no disponible | Hugging Face (ONNX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo debe aplicarse a comentarios previamente clasificados como toxicos; no es un detector de toxicidad por si mismo.
- La entrada debe preprocesarse segun el estudio (eliminar citas, codigo y URLs; sustituir menciones y correos por `<USER>`); usar otro preprocesamiento puede degradar el rendimiento.
- Truncado a 256 tokens: comentarios mas largos pierden informacion.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingue.
- Licencia no disponible: verificar antes de cualquier uso comercial o redistribucion.
- Riesgo de sesgos derivado del dataset de entrenamiento del estudio original, no documentado en la ficha.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la clasificacion; el umbral de 0,50 es fijo y puede no ser optimo para todos los dominios.
- No se han publicado datos sobre latencia, throughput ni comportamiento fuera del dominio de GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quest-lab/oss-contributor-target-roberta
- Estudio de referencia: *Toxicity in Open Source: Does It Hit Gaming Projects Differently?* (no se proporciona URL en la informacion disponible)
- Repositorio o paper del estudio: no disponible
- Demo: no disponible
