# Junlaii/Aurora-Series-v2

## Resumen

Aurora-Series-v2 es un modelo de clasificación de leads de seguros, desarrollado por Junlaii, entrenado mediante GRPO (Group Relative Policy Optimization) sobre diálogos de atención al cliente en chino. El modelo parte de Aurora-Series-v1 (a su vez derivado de un SFT denominado sft_v5) y se ha afinado durante 200 pasos adicionales, fusionando el adaptador PEFT resultante del mejor checkpoint.

El problema que aborda es la clasificación automática de oportunidades comerciales (leads) en el dominio asegurador a partir de conversaciones reales de servicio al cliente. La relevancia del modelo reside en su enfoque de entrenamiento con refuerzo (GRPO) aplicado a una tarea de clasificación vertical, un patrón poco habitual frente al uso mayoritario de GRPO en tareas de razonamiento generalista.

La información pública disponible es muy limitada: la model card no detalla arquitectura, número de parámetros, longitud de contexto ni composición del dataset. Solo se publican métricas de evaluación interna (T1, T2, T3) y el resultado agregado de 74,0%, que mejora el 72,9% de la versión anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de Aurora-Series-v1, no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (entrenamiento con PEFT, pesos fusionados tras el merge) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura subyacente del modelo base. Lo que sí se documenta es el proceso de ajuste: se parte de Aurora-Series-v1 (identificador interno grpo_v4_merged), que a su vez deriva de un modelo SFT llamado sft_v5. Sobre esa base se aplica un segundo ciclo de GRPO (denominado GRPO v2) de 200 pasos, tras el cual se fusiona el adaptador PEFT del checkpoint 200, seleccionado como mejor checkpoint según la evaluación interna.

El uso de GRPO implica un esquema de optimización por refuerzo con recompensas relativas dentro de grupos de muestras, sin necesidad de un modelo crítico separado. No se detalla la función de recompensa, el tamaño del dataset de diálogos, la composición de los datos ni si hubo fases adicionales de DPO o RLHF. Tampoco se indica la innovación técnica concreta más allá del propio pipeline de entrenamiento en dos etapas (SFT y dos rondas de GRPO).

## Capacidades

- Clasificación de leads de seguros a partir de diálogos de atención al cliente en chino.
- Evaluación en tres niveles o tareas internas (T1, T2, T3) definidas por el autor, sin especificar su naturaleza exacta.
- Procesamiento de conversaciones multi-turno del dominio de seguros (implícito en el caso de uso descrito).
- Entrenamiento orientado a recompensas mediante GRPO, lo que sugiere optimización hacia criterios de calidad definidos por el autor.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo chino declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Triaje de leads en atención al cliente aseguradora: el modelo clasifica conversaciones entrantes para priorizar contactos con mayor probabilidad de conversión, apoyándose en su entrenamiento específico sobre diálogos del sector.
- Enrutamiento automático a agentes comerciales: a partir de la clasificación de la conversación, el sistema deriva el caso al equipo de ventas o al de soporte, reduciendo el tiempo de gestión manual.
- Puntuación de calidad de conversaciones: uso de las salidas del modelo como señal para auditar diálogos de agentes humanos y detectar oportunidades perdidas.
- Extracción de intención comercial en chats de postventa: identificación de clientes con intención de contratar productos adicionales durante interacciones de soporte.
- Automatización de seguimiento en CRM: integración de la clasificación como etiqueta en el CRM para disparar campañas de seguimiento segmentadas.
- Investigación aplicada sobre GRPO en dominios verticales: el modelo sirve como referencia para estudiar el efecto de rondas adicionales de refuerzo sobre una base ya ajustada por SFT y GRPO.
- Evaluación comparativa de versiones: la serie Aurora (v1 frente a v2) permite analizar la ganancia marginal de 200 pasos extra de GRPO (72,9% a 74,0% en la métrica agregada).

## Benchmarks y rendimiento

| Version | Base | Pasos | T1 | T2 | T3 | Media |
|---|---|---|---|---|---|---|
| Aurora-Series-v1 | sft_v5 | 500 GRPO | no disponible | no disponible | no disponible | 72,9% |
| Aurora-Series-v2 | Aurora-v1 | 200 GRPO | 44,1% | 92,2% | 85,7% | 74,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas T1, T2 y T3 son de evaluación interna definida por el autor y su metodología no se documenta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no publicarse el número de parámetros ni el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos publicados.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas por el autor; al no especificarse formato de pesos, no puede confirmarse compatibilidad con ninguno de estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación de leads aseguradores entrenados con GRPO en chino. La única comparación documentada es interna a la propia serie:

| Modelo | Base | Pasos de entrenamiento | Media interna | Licencia |
|---|---|---|---|---|
| Aurora-Series-v1 | sft_v5 | 500 GRPO | 72,9% | Apache 2.0 |
| Aurora-Series-v2 | Aurora-v1 | 200 GRPO | 74,0% | Apache 2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre diálogos de atención al cliente en chino, puede heredar sesgos del dominio y de los datos conversacionales originales.
- Riesgo de alucinación: relevante si el modelo se utiliza para generación de texto en lugar de clasificación; la model card no describe salvaguardas.
- Limitación de idioma: solo se declara soporte de chino; el rendimiento en otros idiomas no está evaluado.
- Métricas internas sin metodología pública: T1, T2 y T3 no están definidas, por lo que los porcentajes no son verificables de forma independiente.
- T1 con rendimiento bajo (44,1%): la primera tarea de evaluación muestra un resultado notablemente inferior al resto, lo que sugiere un punto débil concreto que el autor no detalla.
- Ausencia de datos de arquitectura y tamaño: impide estimar requisitos de despliegue, coste de inferencia y viabilidad en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base de la cadena (sft_v5) no está documentado, por lo que conviene verificar la procedencia y licencia de los pesos originales antes de un uso comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni documentación adicional, lo que limita la confianza para uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junlaii/Aurora-Series-v2
- Versión anterior: https://huggingface.co/Junlaii/Aurora-Series-v1
