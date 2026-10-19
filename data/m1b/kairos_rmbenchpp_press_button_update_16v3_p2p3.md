# m1b/kairos_rmbenchpp_press_button_update_16v3_p2p3

## Resumen

`m1b/kairos_rmbenchpp_press_button_update_16v3_p2p3` es un checkpoint de investigación publicado en HuggingFace por el usuario `m1b`, asociado a la rama de trabajo `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_press_button` (commit `9b078aff4a5dc44f6e3cd31e57ae7a0b2e48dff2`). No es un modelo de lenguaje: por los artefactos que acompanan al repositorio (dataset `rmbench-plus-plus-robodojo-press-button-update`, espacio de acciones `robodojo_dual_x5_absolute_joint_14d` y ficheros `normalization_stats.json`), se trata de una política de control robótico entrenada sobre el benchmark RM-Bench++ / RoboDojo para la tarea de pulsar un botón.

El repositorio contiene dos variantes de pesos, `p2/` y `p3/`. La variante `p2` se entrenó durante 2.000 pasos de episodio completo con "memory tokens" adaptativos (prefijo de 128) partiendo del checkpoint `step_020000.pt` de la ejecución `rmbenchpp_v021_press-button-update_sgres_1x8_20k_20260923_r3`, sobre 8 GPU A800 y con una tasa de aprendizaje de 1e-4. La variante `p3` se obtuvo con 1.000 pasos adicionales de entrenamiento exclusivamente de memoria a partir de `p2/step_002000.pt`.

La relevancia es acotada y experimental: sirve para reproducir y comparar ablaciones de memoria temporal en políticas de manipulación bimanual dentro de un pipeline de investigación concreto. La model card no documenta arquitectura, número de parámetros, licencia ni idiomas, y el tamaño del repositorio (18,4 GB) es el único indicador indirecto del coste de los pesos. No debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control robótico con "memory tokens" adaptativos; no se documenta la arquitectura base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (memoria con prefijo de 128 tokens en la variante `p2`) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints `.pt`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoints PyTorch: `p2/step_002000.pt`, `p3/step_001000.pt` segun la model card) |

Otros datos tecnicos documentados:

| Parametro | Valor |
|---|---|
| Espacio de acciones | `robodojo_dual_x5_absolute_joint_14d` (14 dimensiones, articulaciones absolutas, dos brazos x5) |
| Dataset de entrenamiento | `rmbench-plus-plus-robodojo-press-button-update` |
| Normalizacion | minmax por dimension a `[-1,1]`; si rango < 1e-4 se aplica `x-min`; recorte a `[-5,5]` |
| Ficheros de estadisticas | `p2/normalization_stats.json`, `p3/normalization_stats.json` |
| Tamano del repositorio | 18,4 GB |
| Hardware de entrenamiento | 1x8 NVIDIA A800 |
| Tasa de aprendizaje | 1e-4 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo (transformer, MoE, híbrido u otra). Lo único que se explicita es el mecanismo de memoria: la variante `p2` incorpora "memory tokens" adaptativos con un prefijo de 128, lo que sugiere un condicionamiento por tokens de memoria añadidos a la secuencia de entrada de la política. No se detalla cómo se generan, atienden ni actualizan esos tokens.

El entrenamiento se organiza en dos fases. La primera (`p2`) parte del checkpoint `step_020000.pt` de la ejecución `rmbenchpp_v021_press-button-update_sgres_1x8_20k_20260923_r3` y realiza 2.000 pasos sobre episodios completos ("joint full-episode steps") en 8 GPU A800 con LR 1e-4. La segunda (`p3`) ejecuta 1.000 pasos de entrenamiento exclusivamente de memoria ("memory-only steps") inicializados desde `p2/step_002000.pt`. No se indican número de tokens, composición del dataset, ni si hubo RLHF/DPO (categorías no aplicables a una política de control, pero tampoco se documenta ningún otro esquema de ajuste).

## Capacidades

- Control de manipulación robótica bimanual en el espacio de acciones `robodojo_dual_x5_absolute_joint_14d` (14 dimensiones de articulaciones absolutas).
- Ejecución de la tarea concreta de pulsar un botón ("press button update") en el entorno RM-Bench++ / RoboDojo.
- Memoria temporal explícita mediante tokens de memoria con prefijo de 128 (variante `p2`), orientada a tareas con dependencia de historial.
- Normalización de observaciones y acciones integrada mediante ficheros de estadísticas por checkpoint.
- No se documenta generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, uso de agentes LLM ni capacidades multilingües.
- No se documenta modo "thinking", entrada de audio ni ninguna capacidad multimodal fuera del entorno robótico de entrenamiento.

## Casos de uso

- Reproducción de experimentos de memoria en políticas robóticas: cargar `p2` y `p3` con las mismas estadísticas de normalización permite aislar el efecto de los 1.000 pasos adicionales de entrenamiento de memoria frente a los 2.000 pasos de episodio completo.
- Evaluación estandarizada en RM-Bench++: el checkpoint está atado al dataset `rmbench-plus-plus-robodojo-press-button-update`, por lo que encaja en pipelines de evaluación comparativa de la tarea "press button update" dentro de RoboDojo.
- Ablación de tokens de memoria: comparar `p2` (memoria adaptativa con prefijo 128) contra variantes sin memoria o con distinto prefijo en la misma tarea, manteniendo fijo el resto del pipeline.
- Ajuste fino sobre nuevos datos de manipulación: usar `p2/step_002000.pt` como inicialización para reentrenar con otro dataset del mismo espacio de acciones de 14 dimensiones, reutilizando los ficheros `normalization_stats.json` como referencia de escalado.
- Punto de partida para políticas bimanuales de dos brazos x5: el espacio de acciones absolutas de 14 dimensiones es directamente reutilizable en montajes con esa cinemática, siempre que se regenere la normalización.
- Docencia e investigación interna: servir de ejemplo mínimo de publicación de checkpoints intermedios con normalización explícita y trazabilidad de commits (`9b078aff...`), útil para auditar prácticas de reproducibilidad.
- Integración en un pipeline de simulación a gran escala: el entrenamiento declarado en 8x A800 sugiere un régimen de entrenamiento distribuido; el checkpoint puede insertarse en las mismas rutas de `outputs/checkpoints/weights/` para continuar ciclos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito de la tarea, curvas de recompensa, comparaciones con políticas base ni métricas de simulación o realidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 18,4 GB, pero no se desglosa cuánto corresponde a cada checkpoint ni la precisión de los pesos.
- GPU de entrenamiento documentada: 8x NVIDIA A800 (1x8) con LR 1e-4.
- GPU recomendadas para inferencia: no disponible; no se documenta ningún requisito de despliegue.
- Compatibilidad con GPU de consumo: no confirmada. Si los pesos se cargasen en FP16, el tamaño del repositorio sugeriría un rango manejable en tarjetas de 24 GB, pero es una estimación no verificada con los datos publicados.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no son aplicables a un checkpoint de política robótica en `.pt`); el uso esperado es carga directa con PyTorch en el entorno RoboDojo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica políticas comparables dentro de RM-Bench++ / RoboDojo ni permite establecer una comparación con otros checkpoints de la misma familia (`rmbenchpp_v021_...`) más allá de la relación de linaje entre `p2` y `p3`.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `m1b/kairos_rmbenchpp_press_button_update_16v3_p2p3` | no disponible | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay información sobre arquitectura, parámetros, datos de entrenamiento completos ni metodología de evaluación.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; en la práctica, el uso en producción queda bloqueado hasta que el autor lo aclare.
- Especialización extrema: el checkpoint está entrenado para una única tarea ("press button update") y un único espacio de acciones; no generaliza a otras tareas sin reentrenamiento.
- Dependencia crítica de la normalización: usar `p2/normalization_stats.json` o `p3/normalization_stats.json` con los pesos equivocados, o aplicar otra normalización, invalida el comportamiento del modelo (minmax por dimensión a `[-1,1]`, recorte a `[-5,5]`).
- Riesgo de sobreajuste al benchmark: 2.000 pasos sobre un dataset concreto y 1.000 pasos adicionales de memoria sin validación publicada impiden conocer la capacidad de generalización.
- Brecha simulación-realidad desconocida: no se documenta evaluación en hardware físico ni protocolo de transferencia.
- Sesgos y alucinación: no aplican en el sentido habitual de modelos de lenguaje, pero no se ha auditado el comportamiento de la política ante distribuciones de entrada fuera del dataset.
- Trazabilidad limitada: se referencian rutas internas (`rmbenchpp_v021_press-button-update_sgres_1x8_20k_20260923_r3/outputs/checkpoints/weights/step_020000.pt`) que no son accesibles públicamente desde el repositorio.
- Incoherencia temporal en los metadatos: la fecha de creación indicada (2026-10-19) es posterior a la fecha actual de consulta, lo que conviene verificar antes de citar el recurso.
- Los resultados de la búsqueda web asociados a esta consulta no guardan relación con el modelo (contenido adulto no relacionado); se han descartado y no se han usado como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/m1b/kairos_rmbenchpp_press_button_update_16v3_p2p3
- Paper, blog, repositorio de código, demo o dataset público: no disponible en la información proporcionada.
- No se han encontrado enlaces relevantes en la búsqueda web; los resultados devueltos eran contenido no relacionado con el modelo y se han descartado.
