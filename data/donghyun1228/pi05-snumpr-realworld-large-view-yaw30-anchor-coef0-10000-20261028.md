# Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-anchor-coef0-10000-20261028

## Resumen

π0.5 SNUMPR real-world large view + yaw30 target, anchor coefficient 0.0 es un checkpoint de adaptación de un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Donghyun1228 en Hugging Face. Se trata de una variante del modelo π0.5 de Physical Intelligence, adaptada mediante un proceso de *target-only IDM* (modelo de dinámica inversa) sobre el dataset `snumpr-realworld-large-view-yaw30-probe`, con un preset específico denominado `pi05_snumpr_target_conflict_anchor_large_view_yaw30_coef0`. El modelo está pensado para control robótico de manipulación a partir de observaciones visuales y estados del robot.

El entrenamiento consistió en 10.000 actualizaciones partiendo del checkpoint `pi05-snumpr-realworld-conflict-mean-source-10000-20261028` (paso 9999), con el LLM congelado (9 tensores) y 42 tensores no-LLM entrenados usando un optimizador ConflictAnchorAdamW con coeficiente de anclaje 0.0 (control sin anclaje). El dataset emplea una vista virtual con yaw base +30°, por lo que el controlador del robot debe aplicar la transformación inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y ajustar el estado como `q0_real - 30°`.

La relevancia de este checkpoint es limitada y muy específica: se trata de un artefacto de investigación intermedio, sin evaluación en robot real todavía, con cero descargas y cero likes en el momento de la consulta. No obstante, para el ecosistema openpi y para investigadores que trabajan en adaptación de VLAs con datasets propios, este tipo de checkpoints documenta una metodología concreta de ajuste fino con congelación parcial y control de conflicto entre tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 de Physical Intelligence; no se detalla la arquitectura interna en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible explícitamente; el repo contiene `params`, `train_state` y `assets` por cada step guardado (999, 4999, 9999); tamaño del repo 47,7 GB |

## Arquitectura y entrenamiento

El modelo es un checkpoint de adaptación de π0.5 (openpi), un VLA que combina un codificador visual, un LLM y un cabezal de acciones. En esta adaptación concreta se congela el LLM (9 tensores) y se entrenan 42 tensores no-LLM, lo que sugiere que el ajuste se concentra en los módulos de percepción/acción y no en el núcleo lingüístico. El método es un *target-only IDM* (modelo de dinámica inversa) con `Mean-IDM 1` e `IDM32` por actualización, excluyendo el índice de gripper 6 de la pérdida IDM. El optimizador es ConflictAnchorAdamW con LR 1e-4 constante, warmup de 500 pasos y coeficiente de anclaje 0.0, usando el prior `prior/ema099.json` del repo fuente. Se mantiene la normalización original (SHA `f549619e…`).

El entrenamiento se realizó sobre el dataset `snumpr-realworld-large-view-yaw30-probe-20261028`, que emplea una vista virtual con yaw base +30°. Esto implica que el modelo aprende en un marco de referencia rotado, y el controlador debe deshacer esa rotación en tiempo de ejecución. Se guardaron tres checkpoints (999, 4999, 9999), cada uno con parámetros completos, estado de entrenamiento y assets. No se ha ejecutado ninguna evaluación en robot real, por lo que no hay evidencia empírica de rendimiento en tareas de manipulación.

## Capacidades

- Control robótico de manipulación a partir de observaciones visuales y estado del robot (π0.5 es un VLA orientado a acciones).
- Adaptación a un dataset real-world con vista amplia y yaw +30° (requiere transformación inversa en el controlador).
- Ejecución de políticas de acción condicionadas por instrucciones (herencia de π0.5), aunque no se detalla en la model card.
- Entrenamiento congelando el LLM y ajustando módulos no-LLM, lo que permite adaptaciones más ligeras.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles; el modelo está orientado a acciones, no a generación de texto libre.

## Casos de uso

- Investigación en adaptación de VLAs: el checkpoint sirve como punto de partida para estudiar cómo afecta el coeficiente de anclaje (0.0 frente a otros valores) en el ajuste fino con ConflictAnchorAdamW sobre datasets reales de manipulación.
- Reproducción de experimentos de IDM: permite reproducir el preset `pi05_snumpr_target_conflict_anchor_large_view_yaw30_coef0` y comparar los checkpoints 999, 4999 y 9999 para analizar la evolución de la pérdida IDM.
- Control de robot con vista amplia y yaw desplazado: si se integra en un pipeline openpi, el controlador debe aplicar `Δxyz_real = Rz(+30) Δxyz_virtual` y `q0_real - 30°` para operar en el marco real.
- Estudio de congelación parcial del LLM: útil para medir el impacto de entrenar solo 42 tensores no-LLM frente a ajustar el modelo completo en tareas de manipulación.
- Base para evaluación en robot real: al no haberse evaluado aún, es un candidato para pruebas controladas en laboratorio antes de cualquier uso en producción.
- Docencia y divulgación: ejemplo concreto de checkpoint intermedio en un flujo de adaptación VLA con transformaciones de marco de referencia y optimizadores con control de conflicto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo (47,7 GB) incluye pesos, estados de entrenamiento y assets de tres checkpoints, por lo que el peso de un solo checkpoint es sustancialmente menor pero no se detalla.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del repo, se requiere al menos una GPU con suficiente memoria para cargar los parámetros y el estado de entrenamiento si se va a reanudar el ajuste.
- ¿Cabe en GPU de consumo? No disponible; depende del tamaño real de los parámetros de π0.5, que no se especifica.
- Opciones de despliegue: el ecosistema natural es openpi (Physical Intelligence), con integración en pipelines de robótica; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un VLA de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world large view + yaw30 (este checkpoint) | no disponible | no disponible | sin evaluación en robot | apache-2.0 | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | no disponible en esta ficha | no disponible | no disponible en esta ficha | no disponible en esta ficha | referencia del ecosistema openpi |
| Checkpoint fuente `pi05-snumpr-realworld-conflict-mean-source-10000-20261028` | mismo marco π0.5 | no disponible | no disponible | apache-2.0 (presumible) | Hugging Face, repo del mismo autor |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación en robot real; el rendimiento en tareas de manipulación es desconocido.
- El dataset emplea una vista virtual con yaw +30°; si el controlador no aplica la transformación inversa (`Δxyz_real = Rz(+30) Δxyz_virtual`, `q0_real - 30°`), las acciones serán incorrectas.
- El coeficiente de anclaje 0.0 implica que no hay control de anclaje frente al prior del repo fuente; puede haber deriva respecto al modelo original.
- El LLM está congelado (9 tensores) y solo se entrenan 42 tensores no-LLM; esto limita la adaptación lingüística y puede afectar a instrucciones novedosas.
- El índice de gripper 6 se excluye de la pérdida IDM, lo que puede introducir un sesgo en el control de la pinza.
- Licencia apache-2.0: permite uso comercial, pero el modelo depende de π0.5 y de openpi, cuyas licencias y términos deben verificarse por separado.
- Riesgo de alucinación en el componente lingüístico heredado de π0.5, aunque el uso principal es de acciones, no de texto.
- Sin datos de sesgos, idiomas ni robustez; no apto para producción sin validación exhaustiva.
- El checkpoint es un artefacto de investigación con 0 descargas y 0 likes; no hay evidencia de uso comunitario ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-anchor-coef0-10000-20261028
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028
- Dataset: https://huggingface.co/Donghyun1228/snumpr-realworld-large-view-yaw30-probe-20261028
- Repositorio de código de adaptación: `Donghyun1228/vla_adaptation` (código `36089217`), referenciado en la model card
- openpi (Physical Intelligence): no se proporciona enlace directo en la información disponible
- π0.5 (Physical Intelligence): no se proporciona enlace directo en la información disponible
