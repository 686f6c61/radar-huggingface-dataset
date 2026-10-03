# OpenFlowLM/medgemma-1.5-4b-it-NPU2

## Resumen

MedGemma 1.5 4B es un modelo multimodal de generación de texto e interpretación de imágenes médicas desarrollado por Google, construido sobre la familia Gemma 3 y entrenado específicamente para tareas clínicas. La ficha que nos ocupa, OpenFlowLM/medgemma-1.5-4b-it-NPU2, es una redistribución del modelo original (versión instruction-tuned de 4B parámetros) publicada por el usuario OpenFlowLM con el sufijo NPU2, lo que sugiere una variante orientada a despliegue en unidades de procesamiento neuronal. El modelo combina un codificador de imágenes SigLIP, preentrenado con datos médicos desidentificados, con el componente de lenguaje de Gemma 3.

El problema que resuelve es la falta de modelos abiertos con competencia real en razonamiento clínico e interpretación de imagen médica. MedGemma 1.5 amplía las capacidades respecto a MedGemma 1 en imagen médica de alta dimensionalidad (volúmenes 3D de CT y MRI), histopatología de porta completa (WSI, múltiples parches simultáneos), imagen longitudinal (comparación de radiografías de tórax actuales con previas), localización anatómica mediante cajas delimitadoras, comprensión de documentos médicos (extracción de valores y unidades de informes de laboratorio) y comprensión de registros de salud electrónicos (EHR) basados en texto.

Es relevante ahora por la licencia Health AI Developer Foundations, que permite a desarrolladores construir aplicaciones sanitarias sobre una base entrenada con datos clínicos reales, y porque la variante NPU2 apunta a entornos de inferencia en hardware especializado. El modelo se distribuye a través de Hugging Face bajo acceso controlado (gated) y requiere aceptar los términos de uso de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador de vision SigLIP + LLM Gemma 3 (transformer decoder) |
| Parametros totales | 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Health AI Developer Foundations (license: other) |
| Formato de pesos | No disponible en la informacion proporcionada (repositorio de 4,8 GB basado en transformers) |

## Arquitectura y entrenamiento

MedGemma se compone de dos bloques: un codificador de imágenes SigLIP (referencia arXiv:2303.15343) preentrenado especificamente sobre datos medicos desidentificados que incluyen radiografias de torax, imagenes de dermatologia, oftalmologia y laminas de histopatologia; y un LLM basado en Gemma 3 que actua como decodificador de texto. La variante 1.5 4B es una actualizacion de MedGemma 1 4B que anade soporte para imagen medica de alta dimensionalidad (CT y MRI 3D), histopatologia de porta completa, imagen longitudinal, localizacion anatomica por cajas delimitadoras y comprension de documentos y EHR.

El componente de lenguaje se entrena sobre un conjunto diverso de datos medicos: texto clinico, pares de pregunta-respuesta medicos, datos de registros de salud electronicos basados en FHIR, imagenes radiologicas 2D y 3D, imagenes histopatologicas, oftalmologicas y dermatologicas, y informes de laboratorio para comprension documental. La model card indica que MedGemma 1.5 4B mejora la precision en razonamiento de texto medico y logra una mejora modesta en interpretacion de imagen 2D estandar respecto a MedGemma 1 4B. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO.

Una advertencia tecnica relevante de la propia model card es que el entrenamiento de MedGemma puede hacerlo mas sensible al prompt concreto utilizado que Gemma 3, y que no ha sido evaluado ni optimizado para aplicaciones multi-turno.

## Capacidades

- Generacion de texto medico y razonamiento clinico.
- Comprension de imagen medica 2D: radiografias de torax, dermatologia, oftalmologia y patologia.
- Interpretacion de imagen medica 3D de alta dimensionalidad: volumenes de CT y MRI.
- Histopatologia de porta completa (WSI): interpretacion simultanea de multiples parches de una misma lamina.
- Imagen longitudinal: comparacion de radiografias de torax actuales con estudios previos.
- Localizacion anatomica mediante cajas delimitadoras sobre hallazgos en radiografias de torax.
- Comprension de documentos medicos: extraccion de datos estructurados (valores y unidades) a partir de informes de laboratorio no estructurados.
- Comprension de registros de salud electronicos (EHR) basados en texto.
- Modalidad conversacional de tipo image-text-to-text.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Triage radiologico asistido: el modelo puede interpretar radiografias de torax y localizar hallazgos mediante cajas delimitadoras, lo que permite priorizar estudios sospechosos antes de la lectura del radiologo. La localizacion anatomica explicita facilita la revision humana del resultado.
- Seguimiento longitudinal de pacientes: comparando una radiografia de torax actual con estudios previos, el modelo puede apoyar la deteccion de cambios evolutivos, un flujo de trabajo habitual en oncologia y neumologia.
- Analisis de imagen 3D: interpretacion de volumenes de CT y MRI para tareas de cribado o apoyo diagnostico donde se requiere razonamiento sobre estructuras tridimensionales, no solo cortes 2D aislados.
- Patologia digital: lectura de laminas de histopatologia de porta completa procesando multiples parches en una sola pasada, util en laboratorios que digitalizan laminas completas.
- Extraccion de datos de informes de laboratorio: conversion de informes medicos no estructurados en datos estructurados (valores con unidades), lo que alimenta sistemas de historia clinica electronica y pipelines analiticos.
- Comprension de EHR: interpretacion de registros clinicos en texto basados en FHIR para resumir historiales o apoyar la toma de decisiones, sujeto a validacion clinica previa.
- Dermatologia y oftalmologia asistidas: clasificacion e interpretacion de imagenes dermatologicas y oftalmologicas como apoyo a la revision especializada.
- Generacion de borradores de informes: el modelo puede redactar texto descriptivo a partir de hallazgos en imagen, reduciendo carga documental del personal clinico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que MedGemma 1.5 4B ha sido evaluado en un rango de benchmarks clinicamente relevantes, tanto sobre conjuntos abiertos como sobre datasets internos curados, y que mejora el razonamiento de texto medico y la interpretacion de imagen 2D respecto a MedGemma 1 4B, pero los valores numericos concretos no se incluyen en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 4B parametros): aproximadamente 8-9 GB en precision BFloat16, en torno a 4-5 GB en cuantizacion de 8 bits y aproximadamente 2,5-3 GB en cuantizacion de 4 bits. Estimaciones orientativas, no confirmadas en la informacion proporcionada.
- GPU recomendadas: para precision completa, GPUs con 12-16 GB o mas, como RTX 4090, A100 o H100. Para cuantizacion de 4 bits, GPUs de 6-8 GB pueden resultar suficientes si el backend lo soporta.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, especialmente con cuantizacion. La variante NPU2 sugiere despliegue en hardware con unidad de procesamiento neuronal, aunque no se detallan los requisitos especificos.
- Opciones de despliegue: transformers (indicado en la model card), con compatibilidad habitual de Gemma 3 con vLLM, llama.cpp y Ollama. La optimizacion NPU2 apunta a runtimes especificos de NPU no detallados en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenFlowLM/medgemma-1.5-4b-it-NPU2 | 4B | No disponible | Imagen-texto a texto | Health AI Developer Foundations | Hugging Face (gated) |
| MedGemma 1 4B (Google) | 4B | No disponible | Imagen-texto a texto | Health AI Developer Foundations | Hugging Face (gated) |
| MedGemma 1.5 4B (Google) | 4B | No disponible | Imagen-texto a texto | Health AI Developer Foundations | Hugging Face (gated) |

La informacion proporcionada no incluye datos de rendimiento numerico que permitan comparar estos modelos mas alla de la mejora cualitativa declarada. Otras alternativas medicas abiertas: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada. Al ser un modelo entrenado con datos clinicos, puede heredar sesgos de representacion poblacional de los conjuntos de entrenamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En un dominio clinico, cualquier salida debe ser validada por personal sanitario cualificado.
- El modelo no ha sido evaluado ni optimizado para aplicaciones multi-turno, segun la propia model card.
- MedGemma puede ser mas sensible al prompt concreto que Gemma 3 debido a su entrenamiento, lo que exige ingenieria de prompts cuidadosa.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: el uso esta gobernado por los terminos de Health AI Developer Foundations de Google. El acceso en Hugging Face es gated y requiere aceptar dichos terminos. Debe revisarse la licencia antes de cualquier uso comercial.
- El modelo no sustituye el juicio clinico. Debe emplearse como apoyo y no como herramienta diagnostica autonoma sin validacion regulatoria.
- Esta ficha corresponde a una redistribucion de terceros (OpenFlowLM) del modelo original de Google; no se detalla la naturaleza exacta de la modificacion NPU2 ni su equivalencia funcional con el modelo original.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/OpenFlowLM/medgemma-1.5-4b-it-NPU2
- Documentacion de MedGemma (Google): https://developers.google.com/health-ai-developer-foundations/medgemma
- Model card de MedGemma 1: https://developers.google.com/health-ai-developer-foundations/medgemma/model-card-v1
- Terminos de Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
- Modelo en Google Cloud Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medgemma
- Coleccion de MedGemma en Hugging Face: https://huggingface.co/collections/google/medgemma-release-680aade845f90bec6a3f60c4
- Coleccion de aplicaciones basadas en MedGemma: https://huggingface.co/collections/google/medgemma-concept-apps-686ea036adb6d51416b0928a
- Repositorio GitHub: https://github.com/google-health/medgemma
- Notebooks de tutoriales: https://github.com/google-health/medgemma/blob/main/notebooks
- Model card de MedSigLIP: https://developers.google.com/health-ai-developer-foundations/medsiglip/model-card
- Documentacion de Gemma 3: https://ai.google.dev/gemma/docs/core
- Paper SigLIP: https://arxiv.org/abs/2303.15343
