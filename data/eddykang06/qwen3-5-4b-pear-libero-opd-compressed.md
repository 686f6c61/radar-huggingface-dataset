# eddykang06/qwen3.5-4b-pear-libero-opd-compressed

## Resumen

Qwen3.5-4B-pear-libero-opd-compressed es un modelo derivado de Qwen/Qwen3.5-4B, desarrollado por el usuario eddykang06, orientado a robótica y, más concretamente, al benchmark LIBERO. Se trata de un ajuste fino en dos fases: primero un SFT de compresión de razonamiento y después una destilación on-policy (OPD) con divergencia KL inversa calculada por token, tomando como profesor el modelo Qwen3.8-27B-PEAR-LIBERO_only de mit-han-lab en su configuración de esfuerzo "xhigh".

La relevancia del modelo radica en su enfoque metodológico: transferir a un modelo de 4B parámetros la capacidad de razonamiento de un profesor de 27B en el dominio concreto de manipulación robótica LIBERO, reduciendo además la longitud de las cadenas de razonamiento mediante la fase previa de compresión. Forma parte del proyecto robot-distillation, cuyo objetivo es abaratar la inferencia de políticas robóticas basadas en modelos de lenguaje.

No obstante, la model card advierte explícitamente de que los pesos aún no se han subido ("Not uploaded yet"), el repositorio registra cero descargas y cero likes, y no se especifican licencia ni idiomas soportados. Cualquier evaluación práctica debe considerar estas limitaciones de disponibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4B (según el identificador del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos no subidos al repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 4B parámetros. Sobre esa base se aplica un pipeline de dos etapas documentado en la model card: (1) un SFT de compresión de razonamiento ("reasoning-compression SFT") y (2) una destilación on-policy (OPD) con divergencia KL inversa calculada token a token, usando como profesor Qwen3.8-27B-PEAR-LIBERO_only en esfuerzo "xhigh". El dataset de rollouts del profesor está publicado como eddykang06/qwen3.8-27b-pear-libero-rollouts.

La innovación técnica principal es la combinación de compresión de razonamiento con destilación on-policy: en lugar de imitar cadenas de razonamiento largas del profesor, el estudiante aprende a producir trayectorias de razonamiento más cortas mientras se alinea con la distribución del profesor sobre sus propias generaciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Razonamiento orientado a robótica: entrenado específicamente sobre rollouts del benchmark LIBERO, por lo que su dominio principal es la manipulación robótica y la planificación de acciones.
- Compresión de razonamiento: la fase de SFT previa busca reducir la longitud de las cadenas de pensamiento sin perder capacidad resolutiva.
- Destilación de un profesor de 27B: hereda parte de las capacidades del modelo PEAR-LIBERO de mit-han-lab en tareas de control.
- Generación de texto y razonamiento general: capacidades heredadas del Qwen3.5-4B base, aunque no cuantificadas en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el dominio LIBERO implica planificación secuencial, pero no se detalla el soporte de agentes generales.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en destilación de modelos: sirve como referencia reproducible para estudiar OPD con KL inversa por token desde un profesor de 27B a un estudiante de 4B, usando el dataset de rollouts publicado.
- Evaluación de compresión de razonamiento en robótica: permite medir cuánto se reduce la longitud de las cadenas de pensamiento manteniendo la tasa de éxito en LIBERO, comparando con el checkpoint SFT previo.
- Prototipado de políticas robóticas de bajo coste: un modelo de 4B es viable en GPUs de consumo, lo que facilita experimentos de manipulación sin infraestructura de datacenter.
- Baseline para comparativas de eficiencia: al derivar de un profesor de 27B, resulta útil como punto de comparación frente a modelos mayores en tareas LIBERO.
- Reproducción de pipelines de robot-distillation: el repositorio github.com/ericjkge/robot-distillation documenta el flujo completo, y este checkpoint es una de sus salidas.
- Estudio de alineamiento estudiante-profesor: la combinación de SFT de compresión y OPD permite analizar la degradación o retención de capacidades según la fase de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un transformer de 4B en FP16 se requieren aproximadamente 8 GB de VRAM, y en cuantización de 4 bits alrededor de 3-4 GB, aunque estos valores son estimaciones genéricas por tamaño y no datos publicados para este modelo.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? Por tamaño (4B), sí sería viable en GPUs consumer con suficiente VRAM, pero no se confirma en la documentación.
- Opciones de despliegue: no disponible; al no haberse subido los pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-pear-libero-opd-compressed | 4B | no disponible | Robótica (LIBERO) | no disponible | Pesos no subidos |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Propósito general | no disponible | Disponible en Hugging Face |
| Qwen3.8-27B-PEAR-LIBERO_only (profesor) | 27B | no disponible | Robótica (LIBERO) | no disponible | Disponible en Hugging Face (mit-han-lab) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están subidos al repositorio ("Not uploaded yet"), por lo que el modelo no es utilizable en la práctica a fecha de la información disponible.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; además, la licencia del modelo base Qwen3.5-4B condiciona cualquier uso derivado.
- Idiomas soportados no documentados.
- Especialización estrecha en LIBERO: el ajuste puede degradar capacidades generales del modelo base fuera del dominio robótico.
- Riesgo de alucinación: no evaluado en la información disponible; los modelos destilados pueden heredar errores del profesor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad de la destilación ni de la retención de capacidades.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas que requieran ventanas extensas.
- El profesor es un modelo de 27B en esfuerzo "xhigh"; la brecha de capacidad con un estudiante de 4B puede ser significativa en tareas fuera de la distribución de los rollouts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eddykang06/qwen3.5-4b-pear-libero-opd-compressed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio del proyecto: https://github.com/ericjkge/robot-distillation
