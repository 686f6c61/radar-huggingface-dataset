# Hannibal52Barca/pi_atlas_VFE_visual

## Resumen

pi_atlas_VFE_visual es un checkpoint de estimadores de función de valor (VFE, value function estimators) condicionados por subtarea, desarrollado por el usuario Hannibal52Barca y publicado en Hugging Face. Se construye sobre el backbone PaliGemma, inicializado a partir de pi05_base, y añade un token de valor junto con una cabeza de valor de 201 bins. El modelo está diseñado para el dataset de comprobación Pi-Atlas (adityx23/Pi-Atlas_Sanity_Check_Dataset) y opera con una única imagen como entrada visual, sin historial de interacciones previas.

El modelo resuelve la estimación de valor en el contexto de tareas robóticas o de agente visual: dado un prompt con el formato `<task>. Subtask: <subtask>`, predice un valor escalar discretizado en 201 bins que representa el progreso o la recompensa terminal de la subtarea. Incluye un 5 % de negativos con subtarea incorrecta (objetivo -1), lo que le permite detectar desajustes entre la subtarea indicada y la observación visual.

La relevancia actual radica en su uso como componente de evaluación y sanity-check para políticas de robot aprendizaje (pi05), permitiendo medir el progreso de una subtarea con una sola imagen. El repositorio ocupa 21,7 GB e incluye checkpoints en formato Orbax/openpi en el paso 9999, con dos variantes: value2_terminal (recompensa terminal) y value2_dense (progreso denso, con evaluación pendiente). La información pública disponible es muy limitada: no se declaran licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (PaliGemma) con token de valor y cabeza de valor de 201 bins |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de un solo frame, sin historial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax/openpi checkpoint (params + norm-stats; estado del optimizador omitido) |

## Arquitectura y entrenamiento

El modelo parte del backbone PaliGemma, un transformer multimodal que procesa imagen y texto, inicializado desde pi05_base. Sobre este backbone se añade un token de valor específico y una cabeza de valor que discretiza la predicción en 201 bins. La entrada es una única imagen (single frame) junto con un prompt de texto con el formato `<task>. Subtask: <subtask>`; no se utiliza historial de observaciones ni de acciones.

El entrenamiento se realizó durante 10 000 pasos con un tamaño de batch de 64 y semilla 0, sobre el dataset Pi-Atlas Sanity Check. Se introdujo un 5 % de ejemplos negativos con subtarea incorrecta, cuyo objetivo es -1, para que el modelo aprenda a detectar inconsistencias entre la subtarea indicada y la observación visual. El checkpoint publicado corresponde al paso 9999 e incluye parámetros y estadísticas de normalización, pero omite el estado del optimizador. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Estimación de función de valor condicionada por subtarea: dado un prompt `<task>. Subtask: <subtask>` y una imagen, predice un valor escalar discretizado en 201 bins.
- Dos variantes de valor: value2_terminal (recompensa terminal) y value2_dense (progreso denso).
- Detección de subtareas incorrectas: entrenado con un 5 % de negativos con objetivo -1, lo que permite identificar desajustes entre la subtarea declarada y la observación.
- Procesamiento de entrada visual de un solo frame, sin necesidad de historial.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido (thinking mode).
- No se ha documentado soporte de audio ni de otras modalidades distintas de imagen y texto.

## Casos de uso

- Evaluación de políticas robóticas: el modelo estima el valor terminal o el progreso de una subtarea a partir de una imagen, lo que permite puntuar trayectorias generadas por políticas como pi05 durante el desarrollo y la validación.
- Sanity-check de datasets de robot learning: se utiliza sobre el dataset Pi-Atlas Sanity Check para verificar que las subtareas anotadas son coherentes con las observaciones visuales, detectando anotaciones erróneas mediante la predicción de valor -1.
- Filtrado de datos de entrenamiento: al puntuar la coherencia entre subtarea e imagen, puede emplearse para descartar muestras mal etiquetadas antes de entrenar políticas downstream.
- Señal de recompensa en aprendizaje por refuerzo: la variante value2_terminal puede actuar como estimador de recompensa terminal en entornos simulados de manipulación robótica de un solo paso visual.
- Monitorización de progreso en tiempo de ejecución: la variante value2_dense, una vez validada, permitiría estimar el avance de una subtarea con una sola imagen, sin necesidad de mantener historial.
- Investigación en funciones de valor multimodales: sirve como referencia reproducible (semilla 0, 10 000 pasos, batch 64) para estudiar el efecto del condicionamiento por subtarea en estimadores de valor basados en PaliGemma.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la variante value2_terminal sobre el conjunto de holdout:

| Metrica | Valor |
|---|---|
| MAE | 0,094 |
| Pearson | 0,70 |
| Spearman | 0,80 |
| Spearman medio por trayectoria (pred vs. tiempo) | 0,80 |
| Spearman medio por trayectoria con subtarea incorrecta | 0,05 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación de la variante value2_dense está pendiente según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 21,7 GB, pero el tamaño exacto de los parámetros y el estado del optimizador omitido impiden estimar la VRAM con precisión.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es probable que requiera GPU de clase profesional (A100, H100) o GPUs consumer de gama alta con suficiente VRAM, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: el checkpoint está en formato Orbax/openpi, por lo que el despliegue requiere el ecosistema openpi. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un checkpoint especializado en estimación de valor condicionada por subtarea sobre PaliGemma, y no se han publicado comparaciones con otras funciones de valor ni con modelos de propósito general.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pi_atlas_VFE_visual | no disponible | no disponible | no disponible | Orbax/openpi | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: no se declaran licencia, idiomas, pipeline ni parámetros totales, lo que impide evaluar su idoneidad para uso comercial.
- La licencia no está especificada, por lo que no se puede asumir permiso para uso comercial o redistribución.
- Entrada limitada a un único frame visual sin historial: no puede modelar dependencias temporales ni el contexto de acciones previas.
- La variante value2_dense no cuenta con evaluación publicada; su rendimiento es desconocido.
- El rendimiento en subtareas incorrectas (Spearman 0,05) indica que la señal de detección de desajustes es débil en términos de ordenación, aunque el objetivo -1 está diseñado para marcar negativos.
- Riesgo de alucinación y sesgos: no documentado; al ser un estimador de valor sobre un dataset específico, su generalización a otros dominios visuales o tareas no está validada.
- El checkpoint omite el estado del optimizador, por lo que no es adecuado para reanudar el entrenamiento tal cual.
- No se documentan capacidades multilingües ni de tool calling, por lo que no debe emplearse como modelo de propósito general.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hannibal52Barca/pi_atlas_VFE_visual
- Dataset referenciado: https://huggingface.co/datasets/adityx23/Pi-Atlas_Sanity_Check_Dataset
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
