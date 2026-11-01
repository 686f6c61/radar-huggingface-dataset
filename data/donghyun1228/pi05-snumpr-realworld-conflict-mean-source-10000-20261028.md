# Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028

## Resumen

π0.5 SNUMPR real-world source es un checkpoint de investigación en robótica desarrollado por el usuario Donghyun1228, derivado del modelo base π0.5 de Physical Intelligence y entrenado sobre el conjunto de datos SNUMPR. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a la manipulación robótica, no de un modelo de lenguaje generalista. El checkpoint publicado es el resultado de un entrenamiento conjunto ("joint source training") de 10.000 actualizaciones a partir del checkpoint original `snumpr-iclr27-v1/9999`, combinando aprendizaje por imitación (IL) con un modelo inverso de dinámica (IDM) promediado por horizonte.

La innovación principal del trabajo es la recolección de datos guiada por conflicto de gradientes: cada 10 actualizaciones se mide el coseno entre los gradientes de IL e IDM en cada matriz no perteneciente al LLM, y se agrega mediante una media exponencial (EMA 0,99) que alimenta los objetivos de "conflict-anchor". Esto busca mitigar la interferencia entre las dos señales de entrenamiento (imitación y dinámica) durante el ajuste conjunto.

El modelo se publica bajo licencia Apache 2.0, con un repositorio de 161,2 GB que incluye pesos, estados completos de entrenamiento y assets en múltiples pasos (10, 999, 2999, 4999, 9999). Es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, y no dispone de model card con especificaciones técnicas detalladas de arquitectura, contexto o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de π0.5, VLA; detalles no especificados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo incluye directorios `params`, `train_state` y `assets`; formato concreto no especificado) |

## Arquitectura y entrenamiento

El checkpoint parte del modelo π0.5 (familia openpi de Physical Intelligence), un modelo de visión-lenguaje-acción que combina un backbone de lenguaje con cabezas de acción para control robótico. La model card no detalla la arquitectura interna (número de parámetros, tipo de atención, tamaño del LLM subyacente), por lo que esos datos deben considerarse no disponibles en la información proporcionada. El entrenamiento se realizó con el preset `pi05_snumpr_conflict_mean_source` del repositorio de código `Donghyun1228/vla_adaptation` (código `36089217`).

El régimen de entrenamiento combina dos objetivos por actualización: IL (aprendizaje por imitación) con batch 1 y IDM (modelo inverso de dinámica) con media por horizonte, batch 1, más IL con batch 32 e IDM con batch 32. Se usó AdamW con LR 1e-5, warmup de 100 pasos, seed 42, FPS 30 y horizonte H32, entrenando todos los pesos. Los datos provienen de dos conjuntos: `snumpr-realworld-source-il-20261021` (IL) y `snumpr-realworld-original-probe-20261021` (IDM, solo marcha). Se conservó la normalización original (`norm_stats.json`, SHA `f549619e…`). La innovación técnica destacable es el registro del coseno de gradiente IL-vs-IDM por matriz no-LLM cada 10 actualizaciones, agregado en `prior/ema099.json` (259 grupos de matrices) y usado como objetivo de anclaje de conflicto.

## Capacidades

- Control robótico mediante vision-lenguaje-acción: el modelo genera acciones a partir de observaciones visuales e instrucciones, orientado a manipulación en entornos reales.
- Aprendizaje por imitación (IL): entrenado para replicar trayectorias demostradas.
- Modelo inverso de dinámica (IDM): predice acciones a partir de transiciones de estado, usado como señal auxiliar de entrenamiento.
- Entrenamiento conjunto IL + IDM con mitigación de conflicto de gradientes.
- No se documentan capacidades de generación de texto general, código, matemáticas, tool calling, agentes ni multilingüismo en la información disponible.
- No se documentan capacidades de visión más allá de su uso como entrada para el control robótico.

## Casos de uso

- Investigación en aprendizaje por imitación robótica: el checkpoint sirve como punto de partida para estudiar cómo interactúan las señales de IL e IDM durante el ajuste fino, gracias a los registros de conflicto de gradientes incluidos.
- Reproducción de experimentos de adaptación VLA: los estados completos de entrenamiento y los pasos guardados (10, 999, 2999, 4999, 9999) permiten reanudar o comparar trayectorias de entrenamiento.
- Estudio de mitigación de conflicto de gradientes: el archivo `prior/ema099.json` con 259 grupos de matrices facilita analizar qué capas sufren mayor interferencia entre objetivos.
- Base para ajuste fino en tareas de manipulación real: partiendo del checkpoint original SNUMPR, se puede adaptar a nuevos conjuntos de datos de robótica con el preset documentado.
- Evaluación de modelos inversos de dinámica en robótica: el uso de IDM con media por horizonte y solo marcha permite estudiar su contribución frente a IL puro.
- Docencia y experimentación académica: al ser Apache 2.0 y con código de entrenamiento publicado, es adecuado para cursos y trabajos de investigación en VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 161,2 GB, pero incluye pesos, estados de entrenamiento y assets de múltiples pasos, por lo que no equivale al tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el pipeline declarado es `robotics`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world source (este) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| π0.5 base (openpi) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion |
| Alternativas VLA de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos similares.

## Limitaciones y advertencias

- Model card muy escueta: no especifica arquitectura, número de parámetros, contexto ni formato de pesos, lo que dificulta la evaluación técnica previa.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Es un checkpoint de investigación derivado de un preset concreto; su comportamiento fuera de ese régimen de entrenamiento no está documentado.
- El IDM se entrenó solo con datos de marcha ("walk only"), lo que puede sesgar la señal auxiliar hacia ese tipo de movimiento.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin benchmarks publicados, no se recomienda su uso en producción sin validación propia.
- El repositorio de 161,2 GB incluye múltiples estados de entrenamiento, lo que puede complicar el despliegue si solo se necesitan los pesos de inferencia.
- No se documentan limitaciones de idioma ni de contexto porque no se especifican idiomas soportados.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028
- Código de entrenamiento (preset `pi05_snumpr_conflict_mean_source`): repositorio `Donghyun1228/vla_adaptation`, código `36089217` (no se proporciona URL directa en la información disponible)
- Dataset IL: `Donghyun1228/snumpr-realworld-source-il-20261021@414bc9badd62ee2147a33af83ea7d964527cb967` (no se proporciona URL directa)
- Dataset IDM: `Donghyun1228/snumpr-realworld-original-probe-20261021@cf8a7ea9f606d6b5ffa84775a4cbc4fce28a0b67` (no se proporciona URL directa)
- Datos objetivo para modelos adaptados: `Donghyun1228/snumpr-realworld-large-view-yaw30-probe-20261028` (no se proporciona URL directa)
