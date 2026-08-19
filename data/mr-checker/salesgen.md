# mr-checker/SalesGen

## Resumen

SalesGen es un clasificador de texto binario desarrollado por mr-checker (Hajime Nagumo) que analiza conversaciones de ventas entre un cliente y un representante comercial para predecir si la conversación está asociada a una conversión potencial. El modelo está construido con scikit-learn y se distribuye en formato joblib, lo que lo convierte en una solución extremadamente ligera (repositorio de 0.0 GB) y ejecutable en CPU sin necesidad de GPU.

El modelo está diseñado como una capa de clasificación inicial dentro de un sistema más amplio de inteligencia de leads (lead-intelligence), con el objetivo de priorizar conversaciones que requieran atención del equipo comercial antes de que se extraiga información estructurada del cliente. Actualmente se encuentra en estado de desarrollo/prototipo, habiendo sido evaluado como parte de un hackathon, y está pensado para operar con conversaciones en inglés en contextos B2B.

Su relevancia radica en abordar un problema operativo concreto: la clasificación temprana de conversaciones comerciales para optimizar el tiempo del equipo de ventas. Al ser un modelo sklearn tradicional y no un LLM, ofrece una alternativa de bajo coste computacional frente a enfoques basados en grandes modelos de lenguaje, aunque con capacidades limitadas al análisis de texto plano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (modelo scikit-learn, algoritmo concreto no documentado) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje generativo) |
| Tipos de cuantizacion | No aplica (modelo sklearn en formato joblib) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion nativa de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura interna no está documentada en la model card. Se trata de un modelo de clasificacion de texto construido con scikit-learn, lo que sugiere el uso de un pipeline clasico de ML (vectorizacion de texto tipo TF-IDF o CountVectorizer combinada con un clasificador como regresion logistica, SVM o Random Forest), aunque el algoritmo exacto no se especifica.

Durante el desarrollo se evaluaron dos variantes del modelo. La diferencia principal observada entre ambas fue el numero de falsos positivos: el modelo 1 genero 881 falsos positivos, mientras que el modelo 2 genero 854, siendo este ultimo el que produjo menos errores de este tipo en la evaluacion reportada. El entrenamiento se realizo sobre un dataset de conversaciones de ventas con etiquetas de resultado de conversion, aunque no se detallan el volumen de datos, la composicion del corpus ni el proceso de etiquetado. No se menciona el uso de tecnicas como RLHF o DPO, al tratarse de un modelo clasico de ML supervisado.

## Capacidades

- Clasificacion binaria de conversaciones de ventas en dos categorias: conversion potencial y no conversion.
- Priorizacion de conversaciones para revision posterior por parte del equipo comercial.
- Soporte para sistemas automatizados de identificacion de leads y seguimiento.
- Prediccion inicial de conversion antes de que se extraiga informacion estructurada del cliente.
- Integracion como componente dentro de un sistema mayor de inteligencia de cliente, combinable con reglas de negocio y extraccion de informacion estructurada.
- Capacidad limitada al analisis de texto en ingles; no soporta generacion de texto, razonamiento, codigo, vision ni tool calling.

## Casos de uso

- Priorizacion de leads en CRM: el modelo puede clasificar automaticamente las conversaciones entrantes y marcar aquellas con alta probabilidad de conversion, permitiendo que los agentes comerciales atiendan primero los casos mas prometedores. Su bajo coste computacional permite ejecutarlo en batch sobre grandes volumenes de transcripciones.
- Triage de conversaciones en centros de contacto: integrado en un sistema de gestion de llamadas, puede filtrar conversaciones que requieren seguimiento humano frente a aquellas que no, reduciendo el tiempo dedicado a revisar interacciones de baja calidad.
- Sistema de alertas tempranas: al actuar como capa de clasificacion inicial, puede alimentar un pipeline que notifique al equipo de ventas cuando una conversacion muestra senales de conversion, antes de que se complete el analisis estructurado del cliente.
- Automatizacion de seguimiento post-llamada: el modelo puede decidir si una conversacion merece un correo de seguimiento automatico o una llamada de un agente, en funcion de la prediccion de conversion.
- Analisis retrospectivo de embudos de ventas: aplicado a un historico de conversaciones, permite identificar patrones y ratios de conversion por segmento, ayudando a calibrar las definiciones de lead cualificado de cada negocio.
- Filtrado previo en pipelines de extraccion de datos: antes de invertir recursos en extraer informacion estructurada (nombre de empresa, presupuesto, necesidades) de una conversacion, el modelo determina si dicha conversacion merece ese procesamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en formato texto en la informacion disponible. La model card indica que la evaluacion incluyo precision, recall, F1-score, accuracy, ROC-AUC, PR-AUC y matriz de confusion, pero los resultados se presentan en una imagen (classification report) que no puede leerse en formato textual. Los unicos datos cuantitativos disponibles son los falsos positivos de cada variante: 881 para el modelo 1 y 854 para el modelo 2, con la aclaracion de que los classification reports de ambos modelos son casi identicos con diferencias minimas.

## Requisitos de hardware

- Al ser un modelo scikit-learn en formato joblib, no requiere GPU ni VRAM dedicada para inferencia.
- Puede ejecutarse en cualquier CPU moderna, incluyendo entornos de produccion de bajo coste, funciones serverless (AWS Lambda, Google Cloud Functions) o contenedores Docker ligeros.
- El tamano del repositorio es de 0.0 GB, lo que indica que el artefacto del modelo ocupa menos de 1 MB, permitiendo despliegues con memoria minima (menos de 512 MB de RAM).
- Opciones de despliegue: cualquier servidor Python con scikit-learn instalado, o serializacion a ONNX para entornos sin dependencias de Python.
- La latencia de inferencia es del orden de milisegundos por muestra en CPU, aunque no se proporcionan mediciones oficiales.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje generativo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables publicados en HuggingFace con la misma funcion especifica (clasificacion de conversion en conversaciones de ventas B2B) y el mismo enfoque tecnico (sklearn). Como referencia conceptual, un clasificador basado en un LLM pequeno (por ejemplo, un modelo DistilBERT fine-tuned) ofreceria mayor capacidad de comprension semantica pero con un coste computacional y de despliegue significativamente superior. Un clasificador basado en un LLM grande (GPT-4o, Claude) con prompting few-shot podria lograr mayor precision pero con latencia y coste por inferencia mucho mayores, ademas de requerir llamadas a API externas o hardware especializado.

## Limitaciones y advertencias

- Estado de prototipo: el modelo se encuentra en fase de desarrollo y evaluacion, habiendo sido creado como parte de un hackathon. No se recomienda su uso en produccion sin una validacion adicional con datos reales del dominio especifico.
- Alcance limitado a ingles: solo soporta conversaciones en ingles, lo que restringe su aplicabilidad en mercados hispanohablantes u otros idiomas.
- Sesgo de dominio: el rendimiento puede degradarse significativamente al aplicarlo a industrias, productos o servicios distintos de aquellos presentes en el dataset de entrenamiento. La propia model card advierte que el rendimiento varia segun industria, producto, comportamiento del cliente, estilo de conversacion y calidad de las transcripciones.
- Definicion de conversion ambigua: la prediccion representa el resultado de conversion del dataset de entrenamiento y no debe interpretarse automaticamente como una clasificacion definitiva de lead cualificado a nivel de negocio.
- Riesgo de falsos positivos: el modelo 2, la variante recomendada, aun genera 854 falsos positivos, lo que implica que aproximadamente un numero considerable de conversaciones no convertidas seran marcadas erroneamente como conversion potencial.
- Dependencia de la calidad de las transcripciones: conversaciones con errores de transcripcion, ruido o formato inconsistente pueden degradar la precision de la clasificacion.
- Sin capacidades generativas: no puede generar respuestas, resumenes ni explicaciones; es exclusivamente un clasificador.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantias de rendimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mr-checker/SalesGen
- Coleccion de modelos del autor: https://huggingface.co/collections/mr-checker/models
- Perfil del autor: https://huggingface.co/mr-checker
- Nota: los sitios web salesgen.ai y gosalesgen.ai encontrados en la busqueda web corresponden a productos comerciales de automatizacion de ventas no relacionados directamente con este modelo de HuggingFace.
