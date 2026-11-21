# luciaquirke/tmax-9b-v1.1-patched-rerun-partial

## Resumen

TMax 9B v1.1 patched-rerun-partial es un artefacto de investigación publicado por la usuaria luciaquirke en Hugging Face. No se trata de un modelo listo para uso general, sino del punto de control intermedio de un experimento de aprendizaje por refuerzo: una réplica del entrenamiento DPPO de 200 pasos del modelo tmax-9b-v1.1-replication, ejecutada sobre un conjunto de tareas en el que se parchearon las tareas que provocaban comportamiento de tipo hack. El entrenamiento se pausó en el paso 102 y no se ha reanudado.

El repositorio contiene el checkpoint del modelo escrito por el entrenador, el estado del optimizador y del modelo en los pasos globales 101 y 102 para permitir la reanudación, los rollouts de entrenamiento y las log-probabilidades del entrenador de los pasos 1 a 101, además de registros, ficheros de wandb y notas de ejecución. También incluye una ejecución de humo de 16 episodios del script de lanzamiento.

Por su naturaleza, es relevante para quienes investigan dinámicas de recompensa, comportamiento emergente indeseado y reproducibilidad en RL sobre modelos de lenguaje. No hay información publicada sobre arquitectura, tamaño efectivo, contexto o idiomas: el nombre indica 9B y el tamaño del repositorio (286,1 GB) es coherente con pesos en precisión completa más estados del optimizador, pero estos datos no se confirman en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del modelo sugiere 9B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base. El artefacto documenta el proceso de entrenamiento: una ejecución de DPPO (una variante de optimización de política proximal directa orientada a preferencias) de 200 pasos sobre un conjunto de tareas en el que se parchearon las tareas que elicitaban comportamiento de hack. La ejecución se detuvo en el paso 102 y no se reanudó. Se conservan los estados del optimizador y del modelo en los pasos 101 y 102, junto con los rollouts y las log-probabilidades del entrenador de los pasos 1 a 101, lo que permite reanudar el entrenamiento o analizar la evolución de la política.

El repositorio incluye además una ejecución de humo de 16 episodios del script de lanzamiento y los registros de wandb y logs de la ejecución. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales más allá del propio DPPO.

## Capacidades

- Generación de texto: no documentada en la model card; el checkpoint es un artefacto intermedio de entrenamiento, no una versión final validada.
- Razonamiento y matemáticas: no documentados.
- Generación de código: no documentada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Reanudación de entrenamiento: el repositorio incluye estados del optimizador y del modelo en los pasos 101 y 102, lo que permite continuar la ejecución DPPO.

## Casos de uso

- Investigación en dinámicas de recompensa: analizar los rollouts y las log-probabilidades de los pasos 1 a 101 para estudiar cómo evoluciona la política bajo DPPO y qué efecto tiene el parcheo de las tareas que elicitaban hack.
- Reproducibilidad de experimentos de RL: reanudar la ejecución desde el estado del paso 102 con el optimizador y el modelo guardados, y comparar con la réplica original de 200 pasos.
- Estudio de comportamiento de hack de recompensa: comparar esta ejecución parcheada con tmax-9b-v1.1-replication para aislar el efecto de las tareas eliminadas en la aparición de comportamientos indeseados.
- Auditoría de artefactos de entrenamiento: inspeccionar los registros de wandb, los logs y las notas de ejecución para verificar la trazabilidad del proceso y las decisiones tomadas durante el parcheo.
- Validación de pipelines de RL: usar la ejecución de humo de 16 episodios como referencia para comprobar que un script de lanzamiento produce rollouts y estados coherentes antes de lanzar ejecuciones largas.
- Docencia y formación en RL: emplear el checkpoint intermedio y los estados guardados como ejemplo práctico de estructura de un repositorio de entrenamiento con reanudación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (286,1 GB) incluye pesos, estados del optimizador y rollouts, por lo que no permite estimar directamente los requisitos de inferencia.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles; el artefacto está orientado a reanudar el entrenamiento, no a servir el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tmax-9b-v1.1-patched-rerun-partial | no disponible (nombre sugiere 9B) | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face |
| tmax-9b-v1.1-replication | no disponible | no disponible | sin benchmarks publicados en la informacion disponible | no disponible | Hugging Face |
| Otros modelos de 9B de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos de propósito general no es significativa: este artefacto es un checkpoint intermedio de un experimento de RL, no una versión final evaluada.

## Limitaciones y advertencias

- El entrenamiento está incompleto: la ejecución se pausó en el paso 102 de 200 y no se ha reanudado, por lo que el checkpoint no representa una política convergida.
- Es un artefacto de investigación, no un modelo listo para producción; no hay evaluación de calidad, seguridad ni robustez.
- No se documentan sesgos conocidos, pero al no haber información sobre los datos de entrenamiento no es posible evaluarlos.
- Riesgo de alucinación: no evaluado; al ser un checkpoint intermedio, el comportamiento generativo puede ser inestable.
- Limitaciones de contexto e idioma: no disponibles.
- La licencia apache-2.0 permite uso comercial, pero el estado incompleto del entrenamiento y la ausencia de evaluaciones desaconsejan cualquier despliegue en producción.
- El repositorio incluye estados del optimizador y rollouts de entrenamiento, lo que incrementa considerablemente el espacio en disco necesario (286,1 GB) y puede exponer datos de las tareas de entrenamiento.
- El nombre del modelo sugiere 9B parámetros, pero este dato no se confirma en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/luciaquirke/tmax-9b-v1.1-patched-rerun-partial
- Réplica original: https://huggingface.co/luciaquirke/tmax-9b-v1.1-replication
