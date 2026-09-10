# mattewg/pi05-xarm7-shaver-stage2

## Resumen

El modelo `mattewg/pi05-xarm7-shaver-stage2` es un checkpoint de la política pi0.5 para una etapa de una tarea bimanual de manipulación con brazos robóticos xArm7, conocida como tarea «shaver-box». Lo desarrolla el usuario `mattewg` dentro del ecosistema OpenPI y se corresponde con el paso 29999 del experimento `stage2_v1`. El repositorio pesa 12.4 GB e incluye los pesos en formato de checkpoint de Orbax (JAX) con media móvil exponencial (EMA), junto con un archivo de estadísticas de normalización.

El modelo es una política neuronal de control, no un modelo de lenguaje: no genera texto ni responde consultas. Su relevancia está en el ámbito de la robótica de manipulación bimanual, donde sirve para controlar dos brazos xArm7 en una tarea concreta. La información disponible no detalla la arquitectura, el número de parámetros ni la longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parámetros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Checkpoint de Orbax (JAX) |

## Arquitectura y entrenamiento

El modelo es una política neuronal para control robótico bimanual, basada en la familia pi0.5. Los pesos se almacenan como parámetros EMA (media móvil exponencial) y el checkpoint no incluye configuración de modelo; la configuración debe proporcionarse al cargar el modelo. El entrenamiento se realizó en el experimento `stage2_v1` y el checkpoint corresponde al paso 29999. Los datos de entrenamiento, la composición del dataset y los detalles de la arquitectura no están disponibles en la información proporcionada.

El checkpoint incluye además un archivo `norm_stats.json` en `assets/<repo_id>` con estadísticas de normalización necesarias para el despliegue. El `train_state` se ha omitido deliberadamente, ya que ocupa 31 GB de los 42 GB totales y solo sería útil para reanudar el entrenamiento.

## Capacidades

- Control de una etapa concreta de una tarea bimanual de manipulación con brazos xArm7 (tarea «shaver-box»).
- Ejecución de políticas a 60 fps con un horizonte de acción (`action_horizon`) de 16 pasos.
- Esquema de estado y acción de 16 dimensiones (rellenado a 32): brazo derecho (7 articulaciones + pinza), brazo izquierdo (7 articulaciones + pinza).
- Acciones delta para las 14 articulaciones y acciones absolutas para las 2 pinzas, con valores de pinza estrictamente binarios (0.0 o 1.0).
- Los pesos se almacenan con media móvil exponencial (EMA), lo que sugiere una política estabilizada.
- No dispone de capacidades de generación de texto, tool calling, visión ni audio.

## Casos de uso

- Automatización de una subtarea de ensamblaje bimanual: el modelo puede controlar dos brazos xArm7 para completar una etapa específica de la tarea «shaver-box», permitiendo integrar el control en una celda robótica real. Es adecuado porque está entrenado específicamente para ese esquema de estado y acción.
- Investigación en aprendizaje por imitación: el checkpoint sirve como referencia para estudiar el efecto del paso de entrenamiento (29999) y de la EMA en el rendimiento de políticas de manipulación. Se puede comparar con otros checkpoints del mismo experimento.
- Transferencia a tareas relacionadas: usando el modelo como inicialización, se puede realizar fine-tuning con datos de nuevas tareas bimanuales sobre brazos xArm7. La arquitectura pi0.5 está diseñada para aprender de demostraciones.
- Evaluación de políticas en entorno de simulación: el modelo puede desplegarse en un simulador de xArm7 para validar el comportamiento de la política antes de probar en hardware real. El despliegue se realiza con `serve_policy.py` y una configuración compatible.
- Desarrollo de pipelines de control robótico: el checkpoint se integra en sistemas que usan OpenPI, permitiendo construir agentes de manipulación que ejecutan una etapa de una tarea más compleja. El `action_horizon=16` facilita el control en bucle cerrado a 60 fps.
- Benchmarking de modelos pi0.5: este checkpoint puede utilizarse como caso de estudio en comparativas de algoritmos de control robótico, ya que incluye estadísticas de normalización y un formato de checkpoint estándar de OpenPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendada: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El repositorio ocupa 12.4 GB, pero al desconocerse el número de parámetros no se puede estimar la VRAM necesaria.
- Opciones de despliegue: el modelo se sirve mediante `serve_policy.py` del proyecto OpenPI, con una configuración que debe coincidir con el `repo_id` interno. Requiere un entorno JAX/Orbax.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se ha encontrado información comparativa en la fuente consultada.

## Limitaciones y advertencias

- La licencia no está disponible, por lo que el uso comercial o la redistribución pueden estar restringidos.
- El modelo es específico para una sola etapa de la tarea «shaver-box»; no es una política generalista.
- No incluye configuración; debe servirse con una configuración externa cuyo `repo_id` coincida exactamente con el directorio en `assets/` (p. ej., `pi05_xarm7_real_stage2`). Si se usa la configuración por defecto, la carga fallará.
- No se incluye `train_state`, por lo que no es posible reanudar el entrenamiento desde este checkpoint.
- El esquema de estado y acción está limitado a 16 dimensiones con valores de pinza binarios; no soporta otros tipos de actuadores ni sensores.
- Riesgo de comportamiento degradado si se usa fuera de la distribución de entrenamiento (por ejemplo, con objetos o poses diferentes).
- No se han publicado métricas de seguridad ni evaluaciones de sesgo, por lo que no se puede garantizar el comportamiento en situaciones no previstas.

## Enlaces

- HuggingFace: [https://huggingface.co/mattewg/pi05-xarm7-shaver-stage2](https://huggingface.co/mattewg/pi05-xarm7-shaver-stage2)
- No hay enlaces adicionales disponibles en la información proporcionada.
