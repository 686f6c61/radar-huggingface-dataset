# Hooshaai/svd-linear-attention-distilbert-bam-umoe

## Resumen

Este modelo es una variante comprimida de DistilBERT desarrollada por el laboratorio independiente Hoosha AI. Su objetivo es aplicar la arquitectura BAM-uMoE (Bidirectional Attentive Mixture-of-Unified-Experts) para reducir el coste computacional y el número de parámetros manteniendo la capacidad de clasificación de texto. El modelo se evaluó en la tarea SST-2 del conjunto GLUE, obteniendo una precisión de validación del 90.02 % y una F1 de 0.9043. La compresión consigue un ratio de 0.37 y un pico de VRAM de 769.82 MB, lo que lo hace apto para entornos con recursos limitados.

La innovación principal es el módulo BAM-uMoE, que combina atención multi-head densa con dos ramas condicionales de mezcla de expertos: una modula el tensor de valores antes del producto escalar y otra sustituye el bloque feed-forward monolítico. El modelo está etiquetado como `text-classification` y solo soporta inglés. La arquitectura incluye mecanismos de atención lineal basados en factorización SVD y escaneo asociativo kernelizado, alineados con los objetivos de investigación del laboratorio Hoosha AI en atención subcuadrática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador codificador basado en DistilBERT con atención lineal SVD y módulos MoE unificados (BAM-uMoE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con enrutamiento condicional, número de expertos no documentado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio etiquetado como PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de un DistilBERT preentrenado y le aplica el módulo BAM-uMoE, una arquitectura que acopla atención bidireccional densa con ejecución condicional de parámetros en dos ramas. La primera rama, denominada `uMoE_QKV`, modula el tensor de valores mediante una residual de baja magnitud con factor gamma = 0.1, de modo que `V_eff = V_base + 0.1 * uMoE_QKV(X)`. La segunda rama, `uMoE_FFN`, reemplaza el bloque feed-forward monolítico por una mezcla de expertos con enrutamiento condicional. Cada experto es un subred feed-forward con activación GELU.

La atención se implementa sobre proyecciones factorizadas de bajo rango: primero una down-projection de rango `r` reduce la dimensionalidad, y después una expansión por cabezas genera Q, K y V. El scoring de atención se describe como un escaneo asociativo kernelizado al estilo de transformadores lineales, lo que reduce la complejidad cuadrática de la atención estándar.

El proceso de entrenamiento es un "recovery-fine-tuned": después de comprimir el modelo original, se realizan 50 pasos de ajuste fino de recuperación (`recovery_steps=50`) para restaurar la precisión.Los datos de entrenamiento no se detallan en la documentación, pero la validación se realizó sobre la tarea SST-2 de GLUE. No se menciona uso de RLHF ni DPO.

## Capacidades

- Clasificación de texto: pipeline `text-classification`, validado en SST-2 con una precisión del 90.02 %.
- Compresión de modelo: ratio de compresión de 0.37 respecto al modelo base, reduciendo el tamaño y la memoria requerida.
- Eficiencia de atención: factorización SVD de bajo rango y escaneo asociativo kernelizado para aproximar la atención lineal, reduciendo la complejidad de O(L²) a O(L).
- Mezcla de expertos unificada: dos ramas de expertos condicionales (`uMoE_QKV` y `uMoE_FFN`) que permiten flexibilidad en la representación sin activar todos los parámetros en cada paso.
- Idiomas: únicamente inglés, según la ficha de HuggingFace.
- Tool calling / function calling: no disponible.
- Razonamiento multi-step y agentes: no disponible (modelo de clasificación, no generativo).
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Análisis de sentimiento en herramientas de monitorización de marca: el modelo puede clasificar comentarios y reseñas en inglés como positivos o negativos. Su pico de VRAM de 769.82 MB permite ejecutarlo en servicios de inferencia con GPU de bajo coste.
- Priorización de tickets de soporte: integrado en un sistema de helpdesk, puede etiquetar tickets por urgencia o categoría utilizando la clase binaria aprendida en SST-2, mejorando los tiempos de respuesta.
- Moderación automatizada en foros: clasifica publicaciones como aptas o no aptas para su publicación, con una latencia razonable gracias a la atención lineal y la compresión.
- Filtrado de spam en correos: clasifica correos cortos (asunto y cuerpo) como spam o no spam. El bajo consumo de memoria permite empaquetarlo en servidores pequeños.
- Clasificación de intenciones en chatbots: sirve como clasificador de intención para un conjunto cerrado de categorías en inglés, sin necesidad de tool calling ni generación de texto.
- Análisis de encuestas de satisfacción: procesa respuestas abiertas de clientes en inglés para clasificar sentimiento y detectar quejas recurrentes.
- Despliegue en entornos con recursos limitados: gracias al pico de VRAM inferior a 1 GB y al ratio de compresión, puede desplegarse en GPUs de gama baja o en infraestructura servida con un presupuesto de cómputo reducido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de validación (SST-2) | 90.02 % |
| F1 score | 0.9043 |
| Ratio de compresión | 0.37 |
| Pico de VRAM | 769.82 MB |
| Tiempo de evaluación pura | 20.09 s |

Estos valores provienen de la model card del autor, obtenidos con `recovery_steps=50`. No se especifica el hardware usado ni el tamaño del conjunto de evaluación, por lo que no es posible comparar estos resultados con otros modelos. No se han publicado benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 769.82 MB de pico, según el benchmark publicado.
- GPU recomendadas: no especificadas por el autor. Se puede inferir que una GPU con al menos 2 GB de VRAM es suficiente.
- Consumer GPU: sí, cabe en GPUs de consumo como la serie RTX 3050, GTX 1650 o superiores.
- Opciones de despliegue: no documentadas. La etiqueta PyTorch sugiere que puede cargarse mediante el pipeline `text-classification` de HuggingFace Transformers. No se menciona compatibilidad con vLLM, llama.cpp ni TGI.
- Latencia y throughput: no disponible. La ficha solo informa de un tiempo de evaluación pura de 20.09 s, sin desglosar el tamaño del dataset ni la configuración del hardware.

## Comparativa con modelos similares

No disponible. No se han proporcionado comparativas con otros modelos en la información disponible. El modelo se define como una variante comprimida de DistilBERT con un ratio de compresión de 0.37, pero el autor no publica resultados comparativos contra el modelo base ni contra otras arquitecturas eficientes de clasificación de texto.

## Limitaciones y advertencias

- El rendimiento solo se ha validado en la tarea SST-2 de GLUE; no hay evidencia de generalización a otros dominios o tipos de texto.
- El modelo soporta únicamente inglés, sin capacidades multilingües.
- No se documentan sesgos específicos, pero al derivar de DistilBERT, el modelo puede heredar sesgos presentes en los datos de preentrenamiento.
- Riesgo de alucinación bajo para clasificación, pero puede producir predicciones incorrectas en entradas fuera de distribución o muy distintas a SST-2.
- El repositorio reporta un tamaño de 0.0 GB, lo que puede indicar que los pesos del modelo no están publicados o que el repositorio está vacío. Esto impide la carga directa del modelo y requiere verificación antes de su uso.
- La licencia MIT permite uso comercial, pero no ofrece garantías de rendimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-bam-umoe
- Sitio web del laboratorio Hoosha AI: https://hooshaai.github.io/
- GitHub del laboratorio: https://github.com/Hooshaai/hooshaai.github.io
- Paper de DistilBERT (referencia base): https://arxiv.org/abs/1701.06538
