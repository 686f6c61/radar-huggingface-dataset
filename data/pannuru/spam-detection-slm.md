# Pannuru/Spam-Detection-SLM

## Resumen

Spam-Detection-SLM es un modelo de clasificacion binaria de texto publicado por el usuario Pannuru en Hugging Face bajo licencia MIT. Su proposito es etiquetar mensajes como spam (1) o no spam (0), segun la convencion declarada en la model card. Se presenta como un Small Language Model (SLM) orientado a una unica tarea de clasificacion, no como un modelo generativo de proposito general.

La arquitectura descrita por el autor es la de un transformer encoder compacto: capa de embeddings, normalizacion RMS, atencion multi-cabeza, red feed-forward y capa de clasificacion. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el numero total de parametros. El repositorio ocupa 0,1 GB, lo que sugiere un modelo de escala muy reducida, coherente con la etiqueta "SLM".

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo no registra descargas ni likes, no incluye resultados de benchmarks, no documenta el dataset de entrenamiento ni los idiomas soportados, y no se ha publicado informacion sobre proceso de entrenamiento, tokenizador o formato de pesos. Toda evaluacion en produccion deberia precederse de una validacion empirica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con embeddings, RMSNorm, atencion multi-cabeza, feed-forward y capa de clasificacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card describe una pila clasica de transformer encoder: capa de embeddings, normalizacion RMS, atencion multi-cabeza, red feed-forward y capa de clasificacion final para dos etiquetas. La normalizacion RMS (RMSNorm) es habitual en arquitecturas tipo LLaMA y en transformers modernos, pero el autor no detalla la profundidad, el numero de cabezas, la dimension del modelo ni el vocabulario del tokenizador. El tamano del repositorio (0,1 GB) es compatible con un modelo de decenas de millones de parametros o con pesos en precision reducida, pero no permite inferir la configuracion exacta.

No se ha publicado informacion sobre el corpus de entrenamiento: ni numero de tokens, ni composicion del dataset, ni proporcion de ejemplos spam/no spam, ni si se aplicaron tecnicas de aumento de datos, balanceo de clases o fine-tuning supervisado. Tampoco se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). La unica informacion sobre la tarea es que se trata de clasificacion binaria de texto con etiquetas 0 (Not Spam) y 1 (Spam).

## Capacidades

- Clasificacion binaria de texto: asigna una de dos etiquetas (spam o no spam) a un mensaje de entrada.
- Integracion en pipelines de `text-classification` de Hugging Face, segun el campo `pipeline` del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No se documenta modo thinking, vision, audio ni ninguna capacidad multimodal.
- No se documenta generacion de texto libre; el uso previsto es exclusivamente clasificatorio.

## Casos de uso

- Filtrado de correo electronico corporativo: el modelo puede integrarse como clasificador previo en un pipeline de correo para marcar mensajes sospechosos antes de que lleguen a la bandeja de entrada, siempre que se valide su tasa de falsos positivos sobre el dominio concreto.
- Moderacion de comentarios en foros y comunidades: clasificar mensajes entrantes como spam permite derivar automaticamente los positivos a una cola de revision humana, reduciendo la carga de moderadores.
- Deteccion de spam en formularios web: conectado a un endpoint de inferencia, el modelo puede evaluar el texto de formularios de contacto y bloquear envios automatizados antes de persistirlos en base de datos.
- Prefiltrado en sistemas de ticketing: clasificar el cuerpo de los tickets de soporte para separar mensajes legitimos de envios masivos o fraudulentos, priorizando la cola de atencion.
- Analisis de reseñas y comentarios en plataformas de comercio: marcar reseñas promocionales o repetitivas como spam para su exclusion de rankings y agregados.
- Prototipado rapido de clasificadores: al ser un modelo pequeno (repositorio de 0,1 GB) y con licencia MIT, sirve como base para experimentos academicos o pruebas de concepto de deteccion de spam antes de invertir en modelos mayores.
- Filtrado en pipelines de mensajeria: clasificar mensajes de chat o SMS en entornos con recursos limitados, dado el reducido tamano del modelo, aunque la ausencia de datos de latencia y contexto exige medicion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) es plausible que quepa en GPU consumer de gama baja, pero no hay confirmacion oficial.
- GPU recomendadas: no disponibles; no se documenta ninguna GPU de referencia.
- Compatibilidad con GPU consumer: probable por el tamano del repositorio, pero no verificada.
- Opciones de despliegue: no documentadas. Al declararse pipeline `text-classification`, es compatible en principio con `transformers` y potencialmente con servidores de inferencia como TGI o vLLM, pero no se confirma ni el formato de pesos ni la tokenizacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spam-Detection-SLM (Pannuru) | no disponible | no disponible | Clasificacion binaria spam/no spam | MIT | Hugging Face, 0 descargas |
| Modelos de clasificacion tipo BERT/DistilBERT fine-tuned para spam | no disponible en esta ficha | no disponible en esta ficha | Clasificacion binaria | variable (MIT, Apache 2.0) | Amplia en Hugging Face |
| Modelos generativos de proposito general (p. ej. familias LLaMA, Mistral) | no disponible en esta ficha | no disponible en esta ficha | Generacion y clasificacion via prompting | variable | Amplia |

No se dispone de datos de rendimiento del modelo para establecer una comparacion cuantitativa con alternativas. La comparacion anterior es meramente categorica.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de precision, recall, F1 ni AUC sobre ningun conjunto de datos.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el idioma y el dominio de los datos, lo que impide estimar sesgos y generalizacion.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de ningun otro idioma concreto.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si riesgo de clasificaciones erroneas (falsos positivos y falsos negativos) sin calibracion conocida.
- Sin informacion sobre el tokenizador ni la longitud maxima de entrada: mensajes largos podrian truncarse de forma no documentada.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-17): conviene verificar la integridad del repositorio antes de adoptarlo.
- No se documenta el formato de pesos: la integracion con `transformers` u otros runtimes debe comprobarse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pannuru/Spam-Detection-SLM
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
