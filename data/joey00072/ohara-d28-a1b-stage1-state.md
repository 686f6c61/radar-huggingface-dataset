# joey00072/ohara-d28-a1b-stage1-state

## Resumen

ohara-d28-a1b-stage1-state es un artefacto de entrenamiento publicado en Hugging Face por el usuario joey00072, no un modelo listo para inferencia. Contiene el estado completo (checkpoint) del paso 242 de la ejecución de entrenamiento "stage 1" del proyecto ohara, con los shards del modelo y del optimizador en formato DCP (Distributed Checkpoint), el estado del RNG por rango, el fichero `trainer.json` con metadatos de entrenamiento, y en el directorio `run/` el código congelado, el manifiesto de datos, la configuración de la ejecución, el comando de lanzamiento, el plan, el identificador de la ejecución en W&B y los registros de métricas, salud y goodput.

El nombre sugiere una configuración de tipo Mixture of Experts con 28 capas y aproximadamente 1.000 millones de parámetros activos (d28-a1b), aunque esta interpretación no está confirmada en la información disponible. El checkpoint corresponde al paso 242, tras 1.712.848.896 tokens procesados. El repositorio ocupa 216,2 GB, lo que es coherente con un estado completo de entrenamiento (pesos más estados del optimizador) de un modelo de ese orden de magnitud.

Su relevancia es fundamentalmente para investigación en entrenamiento distribuido: permite reanudar la ejecución con distinto world size (los DCP se re-shardean) y reproduce exactamente el RNG si se mantiene el mismo world size. Para inferencia o uso en producción no es un artefacto adecuado; el autor publica por separado una exportación de solo pesos en joey00072/ohara-d28-a1b-stage1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere configuración tipo MoE d28-a1b, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (posible ~1B segun nomenclatura a1b, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene estado de entrenamiento en DCP, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | DCP (Distributed Checkpoint) con shards de modelo y optimizador; exportación de solo pesos en repositorio separado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El identificador "d28-a1b" es consistente con una red de 28 capas y alrededor de 1.000 millones de parámetros activos, patrón habitual en arquitecturas Mixture of Experts con parámetros totales muy superiores a los activos, pero esta lectura no está confirmada por el autor en la model card. Tampoco se especifican el número total de parámetros, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Lo que sí está documentado es el estado del entrenamiento: en el momento del checkpoint se habían procesado 1.712.848.896 tokens (paso 242). El repositorio incluye el código congelado (`code.tar.gz`), el manifiesto de datos, la configuración de la ejecución, el comando de lanzamiento, el plan de entrenamiento, el identificador de la ejecución en W&B y los registros de métricas, salud y goodput. La reanudación se realiza mediante `scripts/launch/hf_pusher.py restore`, que re-shardea el DCP para cualquier world size; con el mismo world size se restaura el RNG de forma exacta. Solo se conserva el estado más reciente (el historial se aplana).

## Capacidades

- No es un modelo para inferencia: el repositorio contiene un estado de entrenamiento, no pesos listos para generar texto.
- Reanudación de entrenamiento distribuido: permite continuar la ejecución desde el paso 242 con cualquier world size gracias al re-sharding de DCP.
- Reproducibilidad exacta del RNG al reanudar con el mismo world size.
- Auditoría del entrenamiento: incluye manifiesto de datos, configuración, plan, comando de lanzamiento y registros de métricas, salud y goodput.
- Exportación de pesos: el autor mantiene un repositorio separado (ohara-d28-a1b-stage1) con los pesos únicamente, que sería el punto de partida para evaluación o inferencia.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reanudación de una ejecución de entrenamiento interrumpida: restaurar el estado con `hf_pusher.py restore` y relanzar con `checkpoint.resume` apuntando a `step_00000242`, manteniendo la configuración de `run/launch_command.sh`.
- Cambio de topología de cómputo: migrar la ejecución de un clúster a otro con distinto número de GPUs aprovechando el re-sharding de DCP, sin perder el progreso de los 1.712.848.896 tokens ya procesados.
- Reproducción exacta de experimentos: reanudar con el mismo world size para restaurar el RNG bit a bit y comparar trayectorias de entrenamiento en condiciones idénticas.
- Auditoría de datos y configuración: inspeccionar el manifiesto de datos, el plan y la configuración de la ejecución para verificar qué se entrenó y con qué hiperparámetros.
- Análisis de salud del entrenamiento: revisar los registros de métricas, salud y goodput, y contrastarlos con la ejecución de W&B referenciada.
- Base para evaluación posterior: combinar este estado con la exportación de solo pesos (ohara-d28-a1b-stage1) para evaluar el modelo en tareas downstream una vez completado o pausado el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos para inferencia y no se especifican parámetros totales.
- Almacenamiento: el repositorio ocupa 216,2 GB, por lo que la restauración requiere espacio en disco equivalente más el espacio de trabajo para el re-sharding.
- GPU recomendadas: no disponible; depende de la configuración de entrenamiento definida en `run/launch_command.sh` y `run/` (no incluida en la información proporcionada).
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño total del modelo y la configuración de paralelismo.
- Opciones de despliegue: no aplica para inferencia; para reanudar el entrenamiento se usa el script `scripts/launch/hf_pusher.py` del propio repositorio junto con el comando de lanzamiento original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso previsto |
|---|---|---|---|---|---|
| ohara-d28-a1b-stage1-state | no disponible | no disponible | no disponible | DCP (estado de entrenamiento) | Reanudar entrenamiento |
| ohara-d28-a1b-stage1 | no disponible | no disponible | no disponible | pesos (exportación) | Evaluación / inferencia |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (estados de entrenamiento publicados de proyectos similares) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: contiene shards de modelo y optimizador en formato DCP, no pesos en safetensors ni GGUF.
- Licencia no especificada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Idiomas soportados no documentados.
- Arquitectura, tamaño total y contexto no confirmados; la interpretación "d28-a1b" es una inferencia a partir del nombre, no un dato del autor.
- Solo se conserva el estado más reciente (historial aplanado): no hay checkpoints intermedios en este repositorio.
- La reanudación con distinto world size no restaura el RNG de forma exacta; solo el mismo world size garantiza reproducibilidad bit a bit.
- El estado corresponde al paso 242 de la fase stage 1, por lo que el modelo no está necesariamente entrenado hasta convergencia.
- Riesgo de sesgos y alucinaciones: no evaluable sin la exportación de pesos y sin benchmarks publicados.
- El tamaño del repositorio (216,2 GB) impone requisitos de almacenamiento y ancho de banda considerables para su descarga y restauración.

## Enlaces

- Repositorio del estado de entrenamiento: https://huggingface.co/joey00072/ohara-d28-a1b-stage1-state
- Exportación de solo pesos: https://huggingface.co/joey00072/ohara-d28-a1b-stage1
- Script de restauración: `scripts/launch/hf_pusher.py` (incluido en el repositorio)
- Ejecución en W&B: identificador referenciado en `run/` (no disponible públicamente en la información proporcionada)
- Paper, blog o demo: no disponible
