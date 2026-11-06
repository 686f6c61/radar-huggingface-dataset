# Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-anchor-coef0p1-10000-20261028

## Resumen

π0.5 SNUMPR real-world large view + yaw30 target, anchor coefficient 0.1 es un checkpoint de robótica derivado de la familia π0.5 (openpi) y publicado por Donghyun1228. Se trata de un ajuste de adaptación de tipo *target-only IDM* (modelo de dinámica inversa) entrenado durante 10.000 actualizaciones sobre el preset `pi05_snumpr_target_conflict_anchor_large_view_yaw30_coef0p1` del repositorio de código `Donghyun1228/vla_adaptation`. El modelo parte del checkpoint `pi05-snumpr-realworld-conflict-mean-source-10000-20261028` en su paso 9999 y se entrena con datos del dataset `snumpr-realworld-large-view-yaw30-probe-20261028`, que introduce una vista ampliada y una rotación virtual de guiñada de +30°.

El interés de esta ficha es acotado: no es un modelo de lenguaje generalista, sino un artefacto experimental de investigación en aprendizaje por imitación para manipulación robótica. El repositorio ocupa 48,2 GB y contiene los pasos 999, 4999 y 9999, cada uno con `params`, el `train_state` completo y los `assets`. La licencia es Apache 2.0.

Es relevante ahora porque documenta una técnica concreta de adaptación de políticas visión-lenguaje-acción (VLA) con anclaje de conflictos (`ConflictAnchorAdamW`) y congelación selectiva de la torre LLM, un patrón que está apareciendo en la literatura reciente de ajuste eficiente de modelos fundacionales para robótica. No se ha ejecutado ninguna evaluación sobre robot real según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 / openpi; no se detalla la composición interna exacta |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params`, `train_state` y `assets` (formato propio de openpi; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de una política VLA de la familia π0.5, adaptada mediante un procedimiento de *target-only IDM adaptation*. El entrenamiento se realizó durante 10.000 actualizaciones con `Mean-IDM 1` e `IDM32` por actualización, excluyendo el índice 6 (pinza) de la pérdida IDM. Se congelaron los 9 tensores de la torre LLM y se entrenaron los 42 tensores no-LLM, lo que constituye una estrategia de ajuste parcial orientada a preservar el conocimiento lingüístico preentrenado y adaptar únicamente las cabezas y módulos específicos de acción.

El optimizador es `ConflictAnchorAdamW` con tasa de aprendizaje constante de 1e-4, warmup de 500 pasos y coeficiente de anclaje 0.1, usando como prior `prior/ema099.json` del repositorio fuente. Se mantiene la normalización original (SHA `f549619e…`). Los datos provienen de `snumpr-realworld-large-view-yaw30-probe-20261028`, con vista ampliada y una base virtual con guiñada de +30°; el controlador del robot debe aplicar la transformación inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y `q0_real - 30°`. No se detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y estado del robot, en el marco de una política VLA.
- Aprendizaje por imitación con modelo de dinámica inversa (IDM) como señal auxiliar.
- Adaptación a vista ampliada y a un sesgo de guiñada virtual de +30°, con transformación inversa documentada para el controlador.
- Entrenamiento parcial: torre LLM congelada y módulos no-LLM ajustados.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni multilingüismo.
- No se documentan modos especiales como *thinking mode*, visión general, audio o decodificación especulativa.

## Casos de uso

- Investigación en adaptación de políticas VLA: sirve como referencia reproducible del preset `pi05_snumpr_target_conflict_anchor_large_view_yaw30_coef0p1` para estudiar el efecto del anclaje de conflictos con coeficiente 0.1.
- Estudio de congelación selectiva: permite analizar el impacto de congelar los 9 tensores LLM y entrenar solo los 42 no-LLM en tareas de manipulación.
- Experimentos de aumento de vista: el checkpoint incorpora una vista ampliada y una guiñada virtual de +30°, útil para investigar robustez frente a cambios de punto de vista.
- Reproducción de pipelines openpi: al conservar `train_state` y `assets`, facilita reanudar o comparar entrenamientos dentro del ecosistema openpi.
- Análisis de normalización: mantiene la normalización original con SHA `f549619e…`, lo que permite aislar el efecto de otros cambios sin alterar la escala de las acciones.
- Docencia y divulgación: como ejemplo de adaptación de un modelo fundacional de robótica con licencia Apache 2.0 y pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de 48,2 GB incluye tres checkpoints completos con `train_state`, por lo que el tamaño de un único conjunto de `params` es menor pero no se especifica.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el formato de pesos es el propio de openpi, no GGUF ni safetensors estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| π0.5 SNUMPR real-world large view + yaw30 target, anchor coef 0.1 | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| `Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028` (checkpoint fuente) | no disponible | no disponible | no disponible | Hugging Face |
| Otros checkpoints π0.5 / openpi | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación sobre robot real; el rendimiento en tareas físicas es desconocido.
- El modelo requiere que el controlador aplique la transformación inversa de guiñada (`Δxyz_real = Rz(+30) Δxyz_virtual`, `q0_real - 30°`); omitirla produciría acciones incorrectas.
- Es un artefacto de investigación con 0 descargas y 0 likes; no hay evidencia de uso en producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, aunque al ser una política VLA la noción de alucinación no aplica del mismo modo que en un LLM.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de documentación de seguridad desaconseja su despliegue directo en entornos reales.
- El formato de pesos es específico de openpi; no es directamente compatible con vLLM, llama.cpp u Ollama.
- El tamaño del repositorio (48,2 GB) incluye tres checkpoints y estados de entrenamiento, lo que complica su distribución y almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-anchor-coef0p1-10000-20261028
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028
- Dataset: https://huggingface.co/Donghyun1228/snumpr-realworld-large-view-yaw30-probe-20261028
- Repositorio de código de adaptación: https://huggingface.co/Donghyun1228/vla_adaptation (preset `pi05_snumpr_target_conflict_anchor_large_view_yaw30_coef0p1`, código `36089217`)
