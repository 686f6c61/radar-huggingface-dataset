# mhshahzad/distilbert-job-email-classifier_v3

## Resumen

El modelo `mhshahzad/distilbert-job-email-classifier_v3` es un clasificador de secuencias basado en DistilBERT, afinado por el usuario mhshahzad para categorizar correos electronicos relacionados con la busqueda de empleo en cinco etiquetas de flujo de trabajo: confirmacion de solicitud, evaluacion o prueba, invitacion a entrevista, oferta y rechazo. Se trata de un modelo especializado y de proposito muy concreto, no de un modelo generativo de proposito general.

El modelo parte de `distilbert-base-uncased`, una version destilada de BERT con 66,9 millones de parametros, y se ha entrenado para clasificacion de etiqueta unica combinando asunto y cuerpo del correo en una unica cadena de entrada. Su relevancia es practica: permite automatizar la organizacion de bandejas de entrada de candidatos con un coste computacional minimo y una latencia muy baja (1,90 ms por correo segun la evaluacion reportada).

El checkpoint se publico en noviembre de 2026, cuenta con 203 descargas y se distribuye bajo licencia Apache 2.0. El autor lo presenta explicitamente como una herramienta experimental para uso personal y desaconseja su uso en decisiones de contratacion o seleccion de personal. La informacion disponible sobre datos de entrenamiento es parcial, ya que el dataset es privado y su acceso esta controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBertForSequenceClassification (transformer encoder destilado de BERT) |
| Parametros totales | 66.957.317 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (truncado; el modelo base soporta hasta 512) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion estandar via transformers/ONNX, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo base `uncased` en ingles; no validado en otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT, una version destilada de BERT-base con seis capas en lugar de doce, sobre la que se anade una cabeza de clasificacion lineal para cinco clases. El modelo base es `distilbert-base-uncased`, con vocabulario en ingles y tokenizacion WordPiece sin distincion de mayusculas. La entrada se construye concatenando asunto y cuerpo con el formato `Subject: {subject}\nEmail: {body}` y se trunca a 256 tokens.

El entrenamiento de la version v3 uso una muestra experimental previa, con una longitud maxima de secuencia de 256, tasa de aprendizaje 2e-5, semilla 42 y ocho epocas configuradas. La seleccion del checkpoint se hizo por macro-F1 de validacion, con un mejor valor de 0,8580. La muestra incluia 50 ejemplos sinteticos de ofertas, usados solo para entrenamiento. El dataset de referencia es privado (`mhshahzad/job_application_emails_clean_training_dataset`, revision `28a2b423bf0be636ae0736a35cc96c4f290a8277`), con acceso controlado y sin redistribucion de contenidos en la model card. No se documenta el volumen total de tokens ni la composicion completa del dataset, ni se menciona uso de RLHF o DPO (no aplica a un clasificador).

## Capacidades

- Clasificacion de texto de etiqueta unica en cinco categorias: `application_confirmation`, `assessment`, `interview_invitation`, `offer` y `rejection`.
- Procesamiento conjunto de asunto y cuerpo del correo en una sola secuencia.
- Inferencia de muy baja latencia (1,90 ms por correo en el entorno de evaluacion reportado, no documentado como benchmark controlado).
- Integracion directa con la libreria `transformers` mediante `pipeline("text-classification")`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles: el modelo base es en ingles y el autor no valida otros idiomas.
- No dispone de modo de razonamiento (thinking mode) ni de salidas estructuradas mas alla de las probabilidades por clase.

## Casos de uso

- Organizacion automatica de la bandeja de entrada de un candidato: el modelo clasifica cada correo entrante en una de las cinco etapas del proceso de seleccion, permitiendo etiquetar o enrutar mensajes en un cliente de correo mediante un script local. Es adecuado por su latencia minima y su bajo coste de ejecucion en CPU.
- Seguimiento del estado de solicitudes: un pipeline personal puede registrar automaticamente cuando un correo es una confirmacion de solicitud, una invitacion a entrevista o un rechazo, y actualizar una hoja de calculo o un tablero de seguimiento.
- Alertas de ofertas y entrevistas: dado que las clases `offer` e `interview_invitation` son las mas criticas para el usuario, el modelo puede usarse para disparar notificaciones prioritarias, siempre con revision humana previa dada la baja recall en la clase `offer`.
- Filtrado y archivado de rechazos: los correos clasificados como `rejection` (con F1 de 0,9670 y 333 ejemplos de soporte) pueden archivarse o etiquetarse automaticamente para mantener limpia la bandeja principal.
- Preprocesamiento en herramientas de busqueda de empleo personales: el modelo puede actuar como primer paso de un pipeline que extraiga y estructure eventos del proceso de seleccion antes de un analisis posterior.
- Prototipado y evaluacion de clasificadores de correo: sirve como linea base ligera para experimentar con tecnicas de clasificacion de correos transaccionales en entornos con recursos limitados, dado su tamano reducido (0,3 GB de repositorio) y su licencia permisiva.
- Despliegue en dispositivos de borde o entornos sin GPU: al tratarse de un modelo de 67 millones de parametros, puede ejecutarse en CPU con latencias de milisegundos, lo que facilita su integracion en aplicaciones locales de gestion de correo.

## Benchmarks y rendimiento

Resultados reportados por el autor para la version v3 sobre 973 ejemplos de evaluacion:

| Metrica | DistilBERT v3 |
|---|---:|
| Accuracy | 0,9681 |
| Macro-F1 | 0,8673 |
| Weighted-F1 | 0,9677 |
| Macro-F1 de validacion | 0,8580 |
| Latencia media | 1,90 ms/correo |

Resultados por clase (v3):

| Categoria | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| Application confirmation | 0,9726 | 0,9844 | 0,9785 | 577 |
| Assessment | 0,9091 | 0,7692 | 0,8333 | 13 |
| Interview invitation | 0,9318 | 0,8542 | 0,8913 | 48 |
| Offer | 1,0000 | 0,5000 | 0,6667 | 2 |
| Rejection | 0,9670 | 0,9670 | 0,9670 | 333 |

Comparacion con experimentos previos del mismo autor:

| Experimento | Entrada | Accuracy | Macro-F1 | Weighted-F1 |
|---|---|---:|---:|---:|
| DistilBERT v1 | Solo cuerpo | 0,9620 | 0,8444 | 0,9613 |
| DistilBERT v2-2 | Asunto + cuerpo, datos sinteticos ampliados | 0,9496 | 0,7094 | 0,9489 |
| DistilBERT v3 | Asunto + cuerpo | 0,9681 | 0,8673 | 0,9677 |
| BERT-base (referencia original) | — | 0,9630 | 0,8586 | 0,9600 |

El autor advierte que los resultados de v2-2 y v3 referencian revisiones y repositorios de dataset distintos, por lo que no constituyen una prueba controlada y emparejada. La ejecucion de BERT-base emitio advertencias de claves LayerNorm faltantes o inesperadas durante la carga del checkpoint, por lo que su puntuacion es provisional.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (67 millones de parametros), y del orden de 250-300 MB en cuantizacion int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo no requiere GPU para funcionar. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060 o superiores, y tambien en CPU sin problemas.
- Opciones de despliegue: `transformers` con `pipeline`, exportacion a ONNX Runtime, TorchScript o integracion en servicios ligeros de inferencia. No se documenta soporte especifico para vLLM, TGI o llama.cpp.
- Latencia y throughput: el autor reporta 1,90 ms por correo, pero advierte que la latencia depende del entorno de evaluacion y el hardware, que no se documentaron como benchmark controlado; no debe interpretarse como garantia de velocidad en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mhshahzad/distilbert-job-email-classifier_v3 | 66,9 M | 256 tokens | Clasificacion de correos de empleo (5 clases) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base generico (encoder) | Apache 2.0 | Hugging Face |
| BERT-base (referencia del autor) | 110 M | 512 tokens | Clasificacion de correos (benchmark original) | Apache 2.0 | Hugging Face |
| Modelos de clasificacion de correo genericos | no disponible | no disponible | Clasificacion multietiqueta de correo | variable | Hugging Face |

La comparacion con BERT-base se basa en la referencia del propio autor (accuracy 0,9630, macro-F1 0,8586), aunque con la advertencia de que esa ejecucion tuvo problemas de carga del checkpoint y su resultado es provisional. No se dispone de comparaciones con otros clasificadores especializados de correos de empleo.

## Limitaciones y advertencias

- El conjunto de test contiene solo dos ejemplos de `offer` y trece de `assessment`; las metricas de esas clases son altamente inciertas (la recall de `offer` se basa en un unico acierto de dos).
- Los resultados provienen de una sola ejecucion y una sola semilla; no es un benchmark multi-semilla.
- No hubo adjudicacion independiente de etiquetas ni verificacion de separacion por hilo de conversacion; los identificadores de hilo no estaban disponibles.
- El rendimiento puede degradarse con plantillas de correo, idiomas, regiones, practicas de reclutamiento o distribuciones de clase distintas a las del entrenamiento.
- Las puntuaciones no estan calibradas y pueden ser erroneas; el autor recomienda inspeccionar el correo antes de actuar sobre una prediccion.
- La latencia reportada depende de un entorno de evaluacion no documentado y no constituye una garantia de despliegue.
- El modelo no esta validado en idiomas distintos del ingles ni en organizaciones o sistemas de reclutamiento diferentes.
- Uso prohibido por el autor para contratacion, cribado de candidatos, decisiones de empleo u otros usos consecuentes.
- Riesgo de sesgo: al entrenarse con un dataset privado no documentado, se desconocen los sesgos de representacion por tipo de empresa, sector, region o idioma.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza aparente al no estar calibradas las probabilidades.
- Privacidad: los correos de busqueda de empleo contienen datos personales y sensibles; no deben enviarse a servicios externos sin autorizacion adecuada.
- Restricciones de licencia: Apache 2.0 permite uso comercial del modelo, pero el autor desaconseja explicitamente su uso en decisiones de empleo; el dataset de entrenamiento es privado y no se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhshahzad/distilbert-job-email-classifier_v3
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento (acceso controlado): https://huggingface.co/datasets/mhshahzad/job_application_emails_clean_training_dataset
- Repositorio del proyecto: https://github.com/mhshahzad/job-email-classifier#job-email-classifier
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
