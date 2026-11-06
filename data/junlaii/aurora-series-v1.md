# Junlaii/Aurora-Series-v1

## Resumen

Aurora-Series-v1 es un modelo de clasificación de leads de seguros entrenado mediante GRPO (Group Relative Policy Optimization) sobre diálogos de atención al cliente en chino. Lo desarrolla el usuario Junlaii y se distribuye en Hugging Face bajo licencia Apache 2.0. El modelo parte de una base denominada "sft_v5" y se ha ajustado durante 500 pasos de GRPO, con una precisión media de evaluación del 72,9%.

El modelo está especializado en una tarea vertical muy concreta: clasificar clientes potenciales (leads) en el dominio de seguros a partir de conversaciones de servicio al cliente en chino. No se trata de un modelo de propósito general, sino de un ajuste fino orientado a producción dentro de un pipeline de negocio específico, lo que explica su tamaño reducido de comunidad (0 descargas y 0 likes en el momento de la ficha).

La relevancia de este modelo radica en su enfoque metodológico: el uso de GRPO, una técnica de optimización por refuerzo popularizada por modelos de razonamiento, aplicada a una tarea de clasificación empresarial. La serie Aurora incluye una v2 que mejora los resultados (74,0% de media) partiendo de esta v1, lo que convierte a v1 en la base fundacional de una línea de iteraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ajustado a partir de "sft_v5", arquitectura base no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (entrenamiento con Unsloth y fusión de adaptadores) |

## Arquitectura y entrenamiento

El modelo se construye mediante ajuste fino sobre una base denominada "sft_v5", que no se detalla en la model card. El entrenamiento principal consiste en 500 pasos de GRPO versión 4, una técnica de optimización por refuerzo que emplea recompensas relativas dentro de grupos de muestras para mejorar la política del modelo sin necesidad de un modelo de recompensa explícito. Los adaptadores resultantes se fusionaron usando Unsloth, una librería optimizada para entrenamiento eficiente de modelos.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de diálogos de seguros, ni si hubo fases adicionales de SFT o DPO más allá de la base sft_v5. Tampoco se detalla la arquitectura del transformer subyacente (número de capas, dimensión oculta, cabezas de atención) ni el tokenizador empleado.

## Capacidades

- Clasificación de leads de seguros a partir de diálogos de atención al cliente en chino.
- Evaluación de conversaciones multi-turno para determinar la cualidad o categoría del lead.
- Salida de clasificación estructurada (las métricas T1, T2 y T3 de la serie sugieren categorías o niveles de clasificación).
- Especialización en dominio vertical de seguros, con vocabulario y patrones propios del sector.
- Soporte exclusivo de chino; no se declaran capacidades multilingües.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Triaje de leads entrantes en aseguradoras: el modelo clasifica conversaciones de chat o correo en categorías de interés, permitiendo enrutar cada lead al equipo comercial adecuado según su perfil y urgencia.
- Priorización de la cartera comercial: a partir de transcripciones de atención al cliente, el modelo asigna una categoría que permite ordenar los leads por probabilidad de conversión y optimizar el esfuerzo del equipo de ventas.
- Automatización del CRM: integrado en un pipeline que procesa los diálogos registrados, el modelo etiqueta cada contacto de forma automática, reduciendo la clasificación manual y los errores asociados.
- Control de calidad del servicio: el modelo puede emplearse para detectar patrones en las conversaciones que indiquen leads mal cualificados o mal gestionados, sirviendo como señal para auditorías internas.
- Segmentación para campañas de marketing: la clasificación por niveles (T1, T2, T3) permite diseñar campañas diferenciadas según el tipo de lead detectado en las conversaciones previas.
- Investigación aplicada en RL para clasificación: al ser un ejemplo público de GRPO aplicado a una tarea empresarial, sirve como base reproducible para experimentar con técnicas de refuerzo en dominios verticales de clasificación.

## Benchmarks y rendimiento

| Modelo | Base | Pasos | T1 | T2 | T3 | Media |
|---|---|---|---|---|---|---|
| Aurora-Series-v1 | sft_v5 | 500 GRPO | — | — | — | 72,9% |
| Aurora-Series-v2 | Aurora-v1 | 200 GRPO | 44,1% | 92,2% | 85,7% | 74,0% |

Los datos disponibles solo incluyen la media de evaluación (72,9%) para v1, sin desglose por tarea. La v2, derivada de esta, alcanza un 74,0% de media con desglose T1=44,1%, T2=92,2% y T3=85,7%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el tamaño de parámetros del modelo base.
- GPU recomendadas: no disponible por la misma razón.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: no se documentan explícitamente; el uso de Unsloth en el entrenamiento sugiere compatibilidad con ecosistemas Hugging Face Transformers, pero no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación de leads de seguros entrenados con GRPO sobre diálogos en chino, ni se dispone de datos de rendimiento de alternativas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en chino; no se garantiza su funcionamiento en otros idiomas.
- La tarea es altamente específica (clasificación de leads de seguros), por lo que su uso fuera de ese dominio producirá resultados no fiables.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos demográficos, geográficos o de comportamiento presentes en los diálogos originales.
- Riesgo de alucinación o clasificación errónea en conversaciones ambiguas o fuera de distribución; la precisión media del 72,9% deja margen de error significativo en producción.
- No se especifican restricciones adicionales de licencia más allá de Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo tiene 0 descargas y 0 likes, sin validación externa conocida; debe evaluarse cuidadosamente antes de cualquier despliegue.
- La model card no documenta el tokenizador, la longitud máxima de entrada ni el formato exacto de etiquetas de salida, lo que dificulta su integración directa.

## Enlaces

- [Hugging Face - Junlaii/Aurora-Series-v1](https://huggingface.co/Junlaii/Aurora-Series-v1)
- [Hugging Face - Junlaii/Aurora-Series-v2](https://huggingface.co/Junlaii/Aurora-Series-v2)
