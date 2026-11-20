# lair-nyu/pi05_baseline_j22-step38000

## Resumen

pi05_baseline_j22-step38000 es un checkpoint de política robótica (vision-language-action, VLA) basado en la arquitectura pi05, entrenado por el grupo lair-nyu sobre un conjunto de datos propio denominado "YOR baseline". El modelo se distribuye a través de la librería openpi y está pensado para control robótico de manipulación con representación de acciones en 22 dimensiones de articulaciones (joints). No es un modelo de lenguaje generalista: es un artefacto de investigación para inferencia robótica.

Se trata de la ejecución `baseline_j22_v1`, detenida en el paso 38.000 antes de alcanzar su paso final; por tanto, es el último checkpoint guardado de un entrenamiento cancelado. El repositorio incluye únicamente los pesos (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y los metadatos del checkpoint; se ha eliminado el estado del optimizador (`train_state/`), por lo que no es directamente reanudable sin reconstruir ese estado.

La relevancia de esta ficha es acotada: es un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin benchmarks publicados y sin licencia declarada. Su interés práctico reside en servir como referencia de un pipeline de entrenamiento pi05 con openpi y pi-atlas, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (vision-language-action, VLA) sobre openpi; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (directorio `params/`), más `assets/norm_stats.json` y `_CHECKPOINT_METADATA` |
| Tamaño del repositorio | 12,4 GB |
| Librería | openpi |
| Pipeline | robotics |
| Dimensión de acciones | 22 joints |
| Paso de entrenamiento | 38.000 (entrenamiento cancelado antes del paso final) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi05, integrada en el ecosistema openpi para políticas robóticas. La model card no detalla la composición interna (número de capas, dimensión oculta, mecanismo de atención, componentes de visión o lenguaje), por lo que esa información debe considerarse no disponible. Lo que sí se especifica es la interfaz de acciones: representación de 22 dimensiones de articulaciones, coherente con un robot manipulador de múltiples grados de libertad.

El entrenamiento se realizó con el framework pi-atlas, usando la configuración `configs/pi05_baseline_j22.py` en el commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`, sobre openpi en el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73` (marcado como dirty). El conjunto de datos es el "YOR baseline dataset". El repositorio incluye un `subtask_summary.json` que lista las subtareas de entrenamiento, recuentos de chunks, proporciones de muestras y episodios reservados (held-out), pero esos valores concretos no se reproducen en la información disponible. No se documenta el número de tokens, la composición del dataset ni si hubo RLHF o DPO; en un modelo de este tipo el ajuste suele ser por imitación (behavior cloning) sobre demostraciones, aunque esto no se confirma en la model card.

## Capacidades

- Generación de acciones robóticas de 22 dimensiones de articulaciones a partir de observaciones, en el marco de una política VLA pi05.
- Inferencia dentro del ecosistema openpi mediante `policy_config.create_trained_policy`.
- Carga condicionada a la configuración de entrenamiento de pi-atlas (`pi05_baseline_j22`), que aporta la arquitectura y las transformaciones de datos.
- Metadatos de normalización incluidos (`norm_stats.json`) para preprocesar observaciones y acciones.
- Resumen de subtareas de entrenamiento disponible en `subtask_summary.json`.
- Soporte de tool calling / function calling: no disponible (no aplica a este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio como capacidades generales: no disponibles.

## Casos de uso

- Investigación en políticas VLA: servir como punto de partida o referencia para reproducir el pipeline pi05 con openpi y pi-atlas, comparando el efecto de distintos pasos de entrenamiento sobre el rendimiento en manipulación.
- Control de manipulación con 22 joints: usar el checkpoint para generar comandos articulares en un robot con esa configuración, siempre que se disponga de la configuración pi-atlas correspondiente para cargar la política.
- Evaluación de checkpoints intermedios: al tratarse de un entrenamiento cancelado en el paso 38.000, es útil para estudiar la curva de aprendizaje y el estado del modelo antes de la convergencia.
- Reproducción de experimentos: la model card documenta commits exactos de pi-atlas y openpi, lo que permite reconstruir el entorno de entrenamiento e inferencia con trazabilidad.
- Análisis de datos de entrenamiento: el `subtask_summary.json` permite auditar la distribución de subtareas, chunks y episodios reservados del dataset YOR baseline.
- Desarrollo de pipelines de despliegue robótico: integrar la política en un bucle de control con openpi para validar latencia y estabilidad en tareas de manipulación.
- Base para fine-tuning: partir de estos pesos para ajustar la política a un robot o tarea concreta, aunque requeriría reconstruir el estado del optimizador si se quiere continuar el entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos; la VRAM dependerá del tamaño real del modelo y del tipo de cuantización, que no se documentan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el número de parámetros.
- Opciones de despliegue: la vía documentada es openpi con la configuración de pi-atlas (`policy_config.create_trained_policy`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son el mecanismo habitual para políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints pi05 ni modelos VLA comparables con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Entrenamiento cancelado: el checkpoint corresponde al paso 38.000 de una ejecución detenida antes de su paso final, por lo que el rendimiento puede ser inferior al de un modelo convergido.
- Licencia no declarada: no hay licencia especificada, lo que impide asumir permisos de uso comercial o redistribución.
- Carga no autónoma: requiere la configuración de entrenamiento de pi-atlas (`pi05_baseline_j22`) para aportar arquitectura y transformaciones de datos; sin ella, los pesos no son utilizables directamente.
- Estado del optimizador eliminado: no se incluye `train_state/`, por lo que no se puede reanudar el entrenamiento original sin reconstruirlo.
- Entorno "dirty": el commit de openpi indicado aparece marcado como dirty, lo que introduce incertidumbre sobre la reproducibilidad exacta del entorno.
- Datos de entrenamiento no documentados: no se detalla la composición del dataset YOR baseline, lo que limita la evaluación de sesgos y generalización.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en su lugar, existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento, habitual en políticas de imitación.
- Idiomas y contexto: no disponibles; este modelo no está orientado a tareas lingüísticas generales.
- Adopción mínima: cero descargas y cero likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lair-nyu/pi05_baseline_j22-step38000
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- Configuración de entrenamiento: `configs/pi05_baseline_j22.py` (commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`)
- openpi (commit de referencia): `c5efff14d4ea36a09a0b365cd0dc60a527027b73` (dirty)
- Paper, blog o demo adicionales: no disponibles
