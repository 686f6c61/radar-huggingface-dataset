# IrfanKnowledge/heart-disease-serving

## Resumen

Heart Disease Serving es un artefacto de despliegue (model serving) publicado en HuggingFace por el usuario IrfanKnowledge, identificado en la model card como Irfan (usuario de Dicoding `irfx_programmer`). No se trata de un modelo de lenguaje generativo, sino de un modelo de clasificacion tabular orientado a la prediccion de riesgo de enfermedad cardiaca, empaquetado como TensorFlow SavedModel y expuesto mediante una aplicacion Gradio/FastAPI con endpoints compatibles con la API REST de TensorFlow Serving.

El repositorio corresponde a la segunda entrega de un programa de formacion en MLOps (MLOps Submission 2), por lo que su proposito principal es demostrar un flujo completo de despliegue: interfaz web interactiva, endpoint de prediccion, endpoint de metadatos del modelo y endpoint de metricas de monitorizacion en formato Prometheus. La version del modelo declarada es `1793531437`.

La relevancia de este artefacto es limitada para el ecosistema de IA open source en sentido amplio: no hay informacion publica sobre arquitectura de red, datos de entrenamiento, rendimiento ni licencia. Su interes es fundamentalmente didactico y como referencia de patron de serving de modelos TF con Gradio y metricas Prometheus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (SavedModel de TensorFlow; red concreta no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta redactada en indonesio) |
| Licencia | no disponible |
| Formato de pesos | TensorFlow SavedModel (libreria tf-keras) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo mas alla de que se distribuye como TensorFlow SavedModel y que la libreria declarada en HuggingFace es `tf-keras`. El dominio del problema es la prediccion de riesgo de enfermedad cardiaca a partir de variables tabulares, lo que sugiere una red densa de clasificacion, pero el repositorio no documenta capas, dimensiones ni funcion de perdida.

Tampoco se documentan el conjunto de datos de entrenamiento, el numero de muestras, el preprocesado aplicado, la metrica objetivo ni si hubo validacion cruzada. La model card se limita a describir la infraestructura de serving (endpoints, SDK de Gradio 4.44.0, fichero `app.py`), no el proceso de entrenamiento. El tamano del repositorio indicado es 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente alojados en el repo o que el calculo de tamano no se ha materializado.

## Capacidades

- Clasificacion binaria o probabilistica de riesgo de enfermedad cardiaca a partir de datos tabulares de entrada (variables clinicas, segun el dominio declarado).
- Exposicion de predicciones via API REST con el formato estandar de TensorFlow Serving: `POST /v1/models/heart_disease_model:predict`.
- Consulta de estado y metadatos del modelo: `GET /v1/models/heart_disease_model` y `GET /v1/models/heart_disease_model/metadata`.
- Interfaz web interactiva mediante Gradio en la ruta raiz `/`.
- Exportacion de metricas de monitorizacion en formato Prometheus: `GET /monitoring/prometheus/metrics`.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni comportamiento agentico.

## Casos de uso

- Prototipado de un pipeline MLOps completo: el artefacto sirve como ejemplo funcional de empaquetado de un SavedModel con Gradio, endpoints REST y metricas, util para cursos o demostraciones de despliegue.
- Evaluacion de riesgo cardiaco en entornos de demostracion clinica: la interfaz Gradio permite introducir variables de un paciente y obtener una prediccion de forma interactiva, sin necesidad de escribir codigo.
- Integracion en un sistema de triaje como servicio interno: el endpoint `:predict` con formato TensorFlow Serving permite que un backend existente que ya hable ese contrato consuma el modelo sin adaptadores adicionales.
- Monitorizacion de deriva y salud del servicio: el endpoint de metricas Prometheus se puede conectar a un stack Grafana/Prometheus para observar latencia, volumen de peticiones y errores del servicio de prediccion.
- Base para pruebas de contrato y CI/CD: los endpoints de metadatos y prediccion permiten escribir tests automatizados que validen el contrato de la API antes de promocionar el servicio a produccion.
- Referencia para migrar modelos TF a serving con FastAPI: el patron `app.py` + SavedModel + Gradio puede reutilizarse como plantilla para otros clasificadores tabulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo tabular de clasificacion, es previsible que quepa en CPU y en cualquier GPU consumer, pero no hay datos publicados que lo confirmen.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; por la naturaleza del artefacto (SavedModel tabular) es altamente probable que funcione en CPU, pero no se documenta.
- Opciones de despliegue: TensorFlow Serving (por el contrato REST declarado), FastAPI, Gradio 4.44.0 y contenedores Docker construidos a partir de `app.py`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores tabulares de riesgo cardiaco empaquetados para serving) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento, arquitectura y metricas: no es posible evaluar su validez clinica ni su calidad predictiva.
- Riesgo elevado de sesgo y de falta de generalizacion: al desconocerse la poblacion de entrenamiento, no hay garantia de que el modelo funcione fuera de la distribucion original.
- No apto para uso clinico real: no hay validacion externa, calibracion ni aprobacion regulatoria documentada; cualquier uso en decision medica seria inapropiado.
- Licencia no especificada: no se puede asumir permiso para uso comercial ni para redistribucion.
- Idiomas no declarados: la model card esta en indonesio y no se documenta el idioma de la interfaz ni de las etiquetas.
- Repositorio practicamente vacio en cuanto a documentacion tecnica (tamano 0.0 GB, 0 descargas, 0 likes): indica un artefacto de entrega academica sin mantenimiento ni comunidad.
- Dependencia de la version de Gradio 4.44.0 y de `tf-keras`: posibles incompatibilidades con versiones mas recientes del stack.
- El endpoint de prediccion sigue el contrato de TensorFlow Serving, pero no se documenta el esquema exacto de entrada (nombres y tipos de las variables), lo que dificulta su consumo sin inspeccionar el SavedModel.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IrfanKnowledge/heart-disease-serving
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este artefacto.
