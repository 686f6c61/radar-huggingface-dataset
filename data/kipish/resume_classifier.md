# Kipish/resume_classifier

## Resumen

Kipish/resume_classifier es un modelo de clasificación de texto alojado en Hugging Face por el usuario Kipish. Los metadatos del repositorio indican que se trata de un modelo basado en arquitectura BERT (tag `bert`), con pesos en formato safetensors y un total de 109.491.468 parámetros. Por el nombre y el tamaño, se corresponde con la familia de modelos BERT-base (aproximadamente 110 millones de parámetros), reutilizada presumiblemente para una tarea de clasificación de currículos.

El problema que aborda, según se deduce de su denominación, es la clasificación automática de currículos (resumes) en categorías, un caso típico de procesamiento de lenguaje natural aplicado a recursos humanos: filtrado de candidatos, enrutamiento de solicitudes o categorización por perfil profesional. No obstante, la información pública disponible es mínima y no se documentan las etiquetas concretas, el dataset de entrenamiento ni las métricas de evaluación.

Es relevante únicamente como referencia de un modelo pequeño y ligero (0,4 GB de repositorio) que puede ejecutarse en hardware modesto, pero carece de documentación suficiente para evaluar su calidad o su idoneidad en producción. El repositorio registra 3 descargas y 0 likes en el momento de la consulta, lo que sugiere un uso muy limitado o experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 109.491.468 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer de tipo encoder (BERT), según la etiqueta del repositorio. Con 109.491.468 parámetros, el tamaño encaja con BERT-base, que emplea 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, aunque estos detalles no se confirman en la información disponible. Al ser un modelo de clasificación, es probable que incorpore una cabeza de clasificación sobre el token `[CLS]`, pero no se especifica el número de etiquetas ni la tarea exacta.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas ni detalles sobre el preentrenamiento base utilizado (si deriva de `bert-base-uncased`, `bert-base-multilingual-cased` u otro checkpoint). Toda esta información debe considerarse no disponible.

## Capacidades

- Clasificación de texto: el modelo está diseñado para asignar una categoría a un texto de entrada, presumiblemente currículos.
- No se documentan capacidades de generación de texto, razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (el idioma de entrenamiento no se especifica).
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Filtrado inicial de candidatos: el modelo podría clasificar currículos entrantes en categorías profesionales (por ejemplo, desarrollo, marketing, finanzas) para enrutarlos al equipo de selección adecuado. Su tamaño reducido permite procesar lotes grandes con bajo coste computacional.
- Enrutamiento de solicitudes en portales de empleo: al recibir un CV, el modelo asigna una etiqueta que determina el flujo de revisión posterior, reduciendo la carga manual en procesos de alto volumen.
- Etiquetado de bases de datos de talento: clasificación masiva de currículos históricos para construir un índice searchable por categoría profesional.
- Moderación o triaje de documentos: descarte de currículos que no encajan en el perfil buscado antes de la revisión humana, siempre que se conozcan las etiquetas del modelo.
- Extracción de señal en pipelines de RRHH: uso como componente de un sistema mayor que combine clasificación con extracción de entidades (NER) para enriquecer el perfil del candidato.
- Prototipado y experimentación: dado su tamaño (0,4 GB) y formato safetensors, sirve como base para ajuste fino en tareas de clasificación de documentos con recursos limitados.

En todos los casos, la falta de documentación sobre etiquetas, idioma y métricas obliga a validar el modelo con datos propios antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en precisión FP32 para un modelo de ~110 M de parámetros; en FP16, alrededor de 0,25-0,5 GB. Cifras estimadas a partir del número de parámetros, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también puede ejecutarse en CPU con latencia aceptable para clasificación por lotes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, o conversión a GGUF para llama.cpp en caso de que se generen dichos pesos (no disponibles en el repositorio). No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput estimados: no disponibles. Para un BERT-base en GPU consumer se espera un throughput de cientos a miles de documentos por segundo en clasificación por lotes, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kipish/resume_classifier | 109,5 M | no disponible | no disponible | Hugging Face (3 descargas) | Sin documentación ni benchmarks |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base genérico, no especializado en currículos |
| distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | Hugging Face | Versión destilada, más rápida y ligera |
| roberta-base | 125 M | 512 tokens | MIT | Hugging Face | Alternativa encoder con mejor rendimiento en algunas tareas GLUE |

La comparación se basa en características públicas de los modelos alternativos; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican etiquetas, dataset, idioma ni métricas, lo que impide evaluar su calidad o reproducibilidad.
- Riesgo de sesgos desconocidos: al no documentarse los datos de entrenamiento, no puede evaluarse el sesgo de género, origen o edad, especialmente relevante en un dominio como RRHH.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas sin calibración conocida.
- Limitaciones de contexto e idioma: no disponibles; si deriva de BERT-base, el contexto máximo sería de 512 tokens, insuficiente para currículos largos sin truncamiento.
- Restricciones de licencia: la licencia no está indicada, lo que impide determinar si el uso comercial está permitido. Debe contactarse con el autor antes de cualquier uso en producción.
- Advertencia para producción: con 3 descargas y 0 likes, el modelo no tiene validación comunitaria; no debe desplegarse sin una evaluación propia exhaustiva y sin aclarar la licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kipish/resume_classifier
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
