# Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-anchor-coef0p01-10000-20261028

## Resumen

π0.5 SNUMPR real-world large view + yaw30 target, anchor coefficient 0.01 es un checkpoint de robótica derivado de la familia π0.5 (openpi) y publicado por el usuario Donghyun1228. Se trata de un ajuste de adaptación "target-only IDM" sobre un modelo previo de la misma serie, entrenado durante 10.000 actualizaciones con el preset `pi05_snumpr_target_conflict_anchor_large_view_yaw30_coef0p01` del repositorio de código `Donghyun1228/vla_adaptation`. El modelo está pensado para políticas visomotoras (vision-language-action) aplicadas a manipulación robótica real, no para generación de texto.

La contribución principal es la incorporación de una vista virtual con rotación de yaw de +30° en los datos de entrenamiento, junto con un anclaje de conflicto (ConflictAnchorAdamW con coeficiente 0.01) que regulariza el ajuste respecto a un prior EMA del modelo fuente. El resultado es un checkpoint que debe desplegarse junto con una transformación inversa en el controlador del robot, lo que lo convierte en una pieza muy específica de un pipeline de investigación más amplio.

Es relevante ahora porque documenta una técnica de adaptación de políticas VLA con datos sintéticos o transformados geométricamente, un área activa en robótica de aprendizaje. No obstante, el autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real, por lo que su utilidad práctica está por validar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 (openpi), política vision-language-action; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo incluye `params`, `train_state` y `assets`; tamaño total 48,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028` en el paso 9999 y aplica un ajuste de 10.000 actualizaciones sobre el dataset `Donghyun1228/snumpr-realworld-large-view-yaw30-probe-20261028`, que introduce una base virtual con yaw rotado +30°. La arquitectura subyacente es π0.5 de openpi, una política visomotora de tipo vision-language-action; la model card no detalla la composición interna de capas ni el número de parámetros.

El entrenamiento congela el bloque LLM (9 tensores) y entrena los 42 tensores restantes. Usa un esquema de "Mean-IDM 1, IDM32 per update" con el índice del gripper (6) excluido de la pérdida IDM. El optimizador es ConflictAnchorAdamW con tasa de aprendizaje constante de 1e-4, warmup de 500 pasos y coeficiente de anclaje 0.01, tomando como prior `prior/ema099.json` del repositorio fuente. Se conserva la normalización original (SHA `f549619e…`). Se guardan los pasos 999, 4999 y 9999, cada uno con parámetros, estado de entrenamiento completo y assets.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones a partir de observaciones visuales y estado del robot.
- Adaptación a vistas transformadas: incorpora una vista virtual con yaw +30°, requiriendo que el controlador aplique la transformación inversa (`Δxyz_real = Rz(+30) Δxyz_virtual`, estado `q0_real - 30°`).
- Ajuste regularizado mediante anclaje de conflicto respecto a un prior EMA del modelo fuente.
- Exclusión del canal de gripper en la pérdida IDM, lo que sugiere un tratamiento separado de la pinza.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, tool calling, agentes, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en adaptación de políticas VLA: el checkpoint sirve para estudiar cómo un ajuste con vistas geométricamente transformadas afecta a la política resultante, comparándolo con el modelo fuente en el paso 9999.
- Experimentos de regularización con anclaje: permite evaluar el efecto del coeficiente 0.01 de ConflictAnchorAdamW frente al prior EMA, en un contexto de reproducción de resultados.
- Manipulación robótica con vistas sintéticas: útil en entornos donde se quiere simular o aumentar puntos de vista de cámara sin recolocar físicamente el sensor, aplicando la transformación inversa en el controlador.
- Pipeline de investigación con openpi: se integra en el repositorio `Donghyun1228/vla_adaptation` (código `36089217`) para reproducir el preset de entrenamiento.
- Estudio de congelación selectiva de capas: al mantener congelado el LLM y entrenar solo los 42 tensores no-LLM, sirve para analizar el impacto de adaptar únicamente la cabeza visomotora.
- Base para futuros ajustes: al conservar normalización, assets y estado de entrenamiento, puede reutilizarse como inicialización de experimentos posteriores dentro de la misma línea SNUMPR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 48,1 GB, lo que da una idea del orden de magnitud del almacenamiento necesario, pero no de la VRAM de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el ecosistema esperado es openpi).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world large view + yaw30 (este) | no disponible | no disponible | sin evaluación en robot | Apache 2.0 | HuggingFace |
| `Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028` (modelo fuente) | no disponible | no disponible | sin datos en la información | Apache 2.0 (presumible por la serie) | HuggingFace |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible en esta ficha | openpi |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación sobre robot real; el rendimiento en tareas físicas es desconocido.
- Requiere aplicar una transformación inversa específica en el controlador (`Δxyz_real = Rz(+30) Δxyz_virtual`, `q0_real - 30°`); un despliegue sin esta corrección produciría acciones incoherentes.
- El checkpoint está atado a un dataset y a un preset concretos (`pi05_snumpr_target_conflict_anchor_large_view_yaw30_coef0p01`), lo que limita su generalización fuera de ese contexto.
- El bloque LLM está congelado y solo se entrenaron 42 tensores no-LLM; la adaptación es parcial y puede no cubrir cambios de dominio amplios.
- El canal del gripper (índice 6) queda excluido de la pérdida IDM, lo que puede implicar un comportamiento de pinza menos ajustado.
- No hay información sobre sesgos, alucinación, limitaciones idiomáticas ni latencia; al ser un modelo de robótica, el riesgo de "alucinación" se traduce en acciones erróneas o inseguras.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos y datasets de origen antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en octubre de 2026; se trata de un artefacto de investigación sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-anchor-coef0p01-10000-20261028
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028
- Dataset: https://huggingface.co/Donghyun1228/snumpr-realworld-large-view-yaw30-probe-20261028
- Repositorio de código de adaptación: `Donghyun1228/vla_adaptation` (preset `pi05_snumpr_target_conflict_anchor_large_view_yaw30_coef0p01`, código `36089217`); no se proporciona URL directa.
- openpi: no se proporciona URL directa en la información disponible.
