# dddddsds31341/Franka-SPACE-v25-20261111

## Resumen

Franka-SPACE-v25-20261111 es un archivo público de pesos de robótica que recoge dos rondas de entrenamiento offline mediante el método SPACE v25 sobre una adaptación aproximada del modelo pi0.5 para el robot Franka. Lo publica el usuario dddddsds31341 en Hugging Face y no se trata de un modelo de lenguaje, sino de un checkpoint de política (policy) para control robótico de manipulación, derivado de dos modelos padre ya existentes en el mismo repositorio. El pipeline declarado es `robotics` y las etiquetas son `robotics`, `pi0.5` y `space`.

El contenido corresponde a dos tareas concretas: "bread" y "test tube". Cada una parte de un checkpoint padre distinto, ejecuta un número determinado de rollouts agrupados y aplica autoimitación de filas exitosas seguida de contraste por grupos de estado. La model card insiste en que no son evaluaciones nuevas de tasa de éxito en robot real, sino datos registrados offline con las colas de acción no ejecutadas rellenadas repitiendo la última acción ejecutada.

La relevancia es acotada: es material de archivo para reproducir o continuar el entrenamiento de estas políticas, no un modelo listo para uso general. El repositorio ocupa 28,1 GB e incluye checkpoints, estados de entrenamiento, configuraciones resueltas, métricas, ventajas por grupo y logs, además de un ZIP con el código fuente de SPACE v25 y sus dependencias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política robótica derivada de pi0.5; detalles de la red no especificados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints numéricos con parámetros EMA desplegados, `train_state` y assets de normalización del padre (formato de serialización no especificado) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5 y de una "adaptación aproximada de Franka de v25" según la model card. El procedimiento SPACE v25 combina dos fases: autoimitación de las filas de rollout que tuvieron éxito y, a continuación, contraste por grupos de estado. Las colas de acción no registradas se rellenan repitiendo la última acción ejecutada; la pérdida de política enmascara los elementos no ejecutados, pero los tokens rellenados siguen siendo visibles para la atención y para el término proximal de acción completa existente.

Los detalles de entrenamiento son los siguientes. La tarea "bread" parte del padre `Franka-Bread-pi05-step-20000`, con 300 rollouts en 6 grupos de 50, en el paso 20000 del padre, y realiza 118 actualizaciones de autoimitación y 508 de contraste. La tarea "test tube" parte de `Franka-Test-Tube-pi05-HG-DAgger-2epochs-20261105`, con 150 rollouts en 5 grupos de 30, en el paso 2429 del padre, y planifica 55 actualizaciones de autoimitación y como máximo 452 de contraste, con el resultado real en `round_result.json`. Ambas ejecuciones usan la GPU física 5, un batch global de 64 y los ajustes escalares originales de v25.

Cada directorio de tarea incluye `checkpoints/<step>/` con los parámetros EMA desplegados, el estado de entrenamiento y los assets de normalización del padre, además de la configuración resuelta, metadatos de preparación de datos, métricas, resultado de la ronda, ventajas por grupo y log de entrenamiento. Para restaurar hay que conservar el directorio numérico completo: la inferencia necesita parámetros y assets, mientras que la continuación requiere además `train_state` y el código de entrenamiento incluido. No se duplican el padre inicial ni los archivos de rollout originales.

## Capacidades

- Control robótico de manipulación para las tareas "bread" y "test tube" sobre una adaptación de Franka del modelo pi0.5.
- Política entrenada mediante autoimitación de rollouts exitosos y contraste por grupos de estado (SPACE v25).
- Inferencia a partir de parámetros EMA y assets de normalización del modelo padre.
- Continuación del entrenamiento a partir de `train_state` y del código fuente incluido en el ZIP.
- No se documentan capacidades de generación de texto, visión general, tool calling, agentes, multilingüismo ni modos de razonamiento.

## Casos de uso

- Reproducción de las rondas de entrenamiento: restaurar el checkpoint completo con parámetros, assets y `train_state` para repetir o auditar las 118 + 508 actualizaciones de "bread" y las 55 + hasta 452 de "test tube".
- Continuación del entrenamiento: usar el `train_state` y el código SPACE v25 del ZIP para seguir entrenando desde el paso final de cada tarea sin volver a partir del padre.
- Análisis de ventajas por grupo: explotar los archivos de ventajas por grupo y el log de entrenamiento para estudiar qué grupos de estado aportaron señal de contraste en cada ronda.
- Investigación sobre autoimitación en robótica: comparar el comportamiento de la política antes y después de las rondas usando los checkpoints padre y final, ambos referenciados en el repositorio.
- Evaluación de robustez ante colas de acción no ejecutadas: analizar cómo afecta el relleno de la última acción y el enmascaramiento de la pérdida a las políticas resultantes.
- Base para experimentos de contraste por grupos de estado: reutilizar la configuración resuelta y los ajustes escalares de v25 como punto de partida en otras tareas de manipulación con Franka.
- Archivado y verificación de integridad: el ZIP incluye el archivador SIP compartido, que sube las ejecuciones completadas y verifica byte a byte cada archivo remoto contra la fuente local antes de borrar los checkpoints locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que estas ejecuciones no son evaluaciones nuevas de tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni cuantizaciones).
- GPU recomendadas: no disponible; las ejecuciones de entrenamiento se realizaron en una GPU física identificada como "GPU 5", sin modelo especificado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el repositorio solo documenta la restauración de checkpoints y el código de entrenamiento SPACE v25 incluido en el ZIP.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 28,1 GB; la restauración requiere conservar el directorio de checkpoint completo por tarea.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Franka-SPACE-v25-20261111 | Checkpoint de política robótica (SPACE v25 sobre pi0.5) | Bread, test tube | no disponible | no disponible | no disponible | Público en Hugging Face |
| Franka-Bread-pi05-step-20000 | Modelo padre de política pi0.5 | Bread | no disponible | no disponible | no disponible | Referenciado, no incluido en este repo |
| Franka-Test-Tube-pi05-HG-DAgger-2epochs-20261105 | Modelo padre de política pi0.5 | Test tube | no disponible | no disponible | no disponible | Referenciado, no incluido en este repo |

No se dispone de datos de rendimiento, parámetros ni contexto de ninguno de los tres, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No son evaluaciones nuevas de tasa de éxito en robot real; los resultados son de entrenamiento offline sobre datos registrados.
- La adaptación de Franka para v25 es "aproximada", según la propia model card.
- Las colas de acción no registradas se rellenan repitiendo la última acción ejecutada, lo que introduce un sesgo estructural en los datos de entrenamiento.
- La pérdida de política enmascara los elementos no ejecutados, pero los tokens rellenados siguen visibles para la atención y el término proximal de acción completa.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles y sin capacidades lingüísticas declaradas; el modelo es específico de robótica.
- Solo se conserva el checkpoint final completo de cada tarea; no hay checkpoints intermedios.
- El padre inicial y los archivos de rollout originales no se duplican en el repositorio, por lo que la reproducibilidad completa depende de esos artefactos externos.
- El ZIP excluye datasets, pesos, entornos, logs, cachés y credenciales; los configs, logs, datos fuente y modelos compartidos permanecen en SIP.
- El proceso de archivado borra los checkpoints locales tras verificar la subida; no se crea copia local de descarga.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje; no se documentan sesgos específicos de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Franka-SPACE-v25-20261111
- Modelo padre de la tarea bread: https://huggingface.co/dddddsds31341/Franka-Bread-pi05-step-20000
- Modelo padre de la tarea test tube: https://huggingface.co/dddddsds31341/Franka-Test-Tube-pi05-HG-DAgger-2epochs-20261105
- Paper, blog, repositorio de código o demo adicionales: no disponibles en la información proporcionada.
