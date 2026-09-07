# Richard-ZZZZZ/robotwin-bihub-joint-wam-v3-step2000

## Resumen

Richard-ZZZZZ/robotwin-bihub-joint-wam-v3-step2000 es un checkpoint de un modelo conjunto (joint) de world model y action head para robótica, desarrollado por el usuario Richard-ZZZZZ. El modelo está diseñado para el framework RoboTwin 2.0, un sistema de generación de datos y evaluación para manipulación bimanual, e integra un predictor de estados del entorno (world model) y un generador de acciones de bajo nivel. El checkpoint corresponde al paso 2000 de un entrenamiento denominado `robotwin_joint_world_action_v3_fast_multihistory`, ejecutado en 3 nodos con 8 GPUs H200 cada uno.

La arquitectura declarada es `bihub-joint-world-v12-action-v13-online-v3-fast-multihistory`, lo que sugiere un diseño de dos cabezas acopladas. No se especifican los parámetros totales ni la longitud de contexto. El checkpoint está guardado en formato PyTorch Distributed Checkpoint (DCP) e incluye el estado del entrenador por rango, por lo que está pensado para reanudar el entrenamiento con el `mira joint trainer`, no para cargarse directamente con `from_pretrained`. Además, no incluye el codec congelado ni el modelo Qwen3-VL-2B que forman parte del pipeline completo. Su relevancia radica en el avance de modelos de mundo para robótica, aunque por sí mismo no es un artefacto listo para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bihub-joint-world-v12-action-v13-online-v3-fast-multihistory |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) + per-rank trainer state (`rank-XXXXX.pth`) |

## Arquitectura y entrenamiento

El modelo es un sistema de dos cabezas: un world model (cabecera `v12`) que predice el estado futuro del entorno a partir de observaciones, y un action head (cabecera `v13`) que genera acciones de control. El nombre "bihub" indica que ambas cabezas comparten una representación común o están conectadas en un hub conjunto. El entrenamiento se realiza sobre el dataset RoboTwin 2.0 (configuración aloha-agilex), con los datos almacenados en archivos comprimidos NVMe. La ejecución se llevó a cabo en 3 nodos con 8 GPUs H200 cada uno (24 GPUs en total), con un batch por dispositivo de 8 y un tiempo de paso de aproximadamente 16.4 segundos. El punto de partida fue el checkpoint V1 `joint-checkpoint-5071`. Las métricas al guardar son: loss_total 0.359, loss_world 0.357, loss_action 0.00239 y world_recovered_clean_mse 0.0187. No se menciona el uso de RLHF ni DPO. El checkpoint está pensado exclusivamente para reanudar el entrenamiento mediante el `mira joint trainer`. El codec visual congelado y el modelo Qwen3-VL-2B, que probablemente actúan como codificadores en el pipeline original, no están incluidos en este artefacto.

## Capacidades

- Modelado del mundo: el world model reconstruye o predice estados del entorno, con una métrica de error cuadrático medio (world_recovered_clean_mse) de 0.0187 en el momento del guardado.
- Generación de acciones: el action head produce comandos de bajo nivel para manipulación bimanual, con una pérdida de acción de 0.00239.
- Integración con RoboTwin 2.0: el checkpoint se enmarca en un pipeline de datos y evaluación para tareas de manipulación bimanual, con soporte para la configuración de brazos aloha-agilex.
- No se especifican capacidades de tool calling, generación de texto, razonamiento general, visión o audio.
- No es un modelo autocontenido para inferencia; requiere el código del entrenador y los componentes congelados externos (codec y Qwen3-VL-2B).

## Casos de uso

- Reanudación de entrenamiento distribuido: el checkpoint se utiliza para continuar el preentrenamiento del modelo conjunto world-action, aprovechando el estado del optimizador por rango incluido en los archivos `rank-XXXXX.pth`.
- Investigación en world models robóticos: permite estudiar cómo el modelo predice estados futuros en entornos de manipulación bimanual, analizando la pérdida de mundo y el error de reconstrucción.
- Desarrollo de políticas de manipulación bimanual: la action head puede integrarse en un pipeline de aprendizaje por imitación para generar comandos de bajo nivel en brazos robóticos de tipo aloha-agilex.
- Generación de datos sintéticos para RoboTwin 2.0: el modelo puede utilizarse para producir trayectorias o escenarios adicionales que amplíen el conjunto de datos de entrenamiento.
- Evaluación en el benchmark de RoboTwin 2.0: al ser un modelo de mundo y acción, puede compararse en las 50 tareas de manipulación del framework, siempre que se reconstruya el pipeline completo con los componentes congelados.
- Análisis de la dinámica de entrenamiento conjunto: los logs de pérdidas permiten estudiar el equilibrio entre el modelado del mundo y la predicción de acciones, útil para ajustar hiperparámetros o la arquitectura de las cabezas.
- Planificación basada en modelos: combinando el world model y el action head, se puede simular el resultado de una acción antes de ejecutarla, lo que facilita la planificación multi-paso en entornos robóticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son pérdidas de entrenamiento (loss_world 0.357, loss_action 0.00239) y un error de reconstrucción (world_recovered_clean_mse 0.0187), que no son comparables entre modelos y no constituyen una evaluación de rendimiento.

## Requisitos de hardware

- Para reanudar el entrenamiento se utilizaron 3 nodos con 8 GPUs H200 cada uno (24 GPUs H200 en total), con un batch por dispositivo de 8 y un tiempo de paso de ~16.4s.
- La VRAM estimada para inferencia no está disponible; el checkpoint no es directamente cargable con `from_pretrained` y no se especifica el tamaño de los pesos activos.
- No se indica si cabe en GPUs de consumo (por ejemplo, RTX 4090). Dado que el entrenamiento se realizó en H200, el modelo probablemente sea de gran tamaño, pero no hay datos suficientes para confirmarlo.
- Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no están disponibles. El checkpoint requiere el framework `mira joint trainer` y no es compatible con estos motores de inferencia estándar.
- La latencia y el throughput de inferencia no se conocen.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El checkpoint pertenece a un proyecto de investigación interno (RoboTwin) y no se han publicado comparativas con otros modelos de world model o action head.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 2000) de un entrenamiento más largo, no un modelo final. Está diseñado para reanudar el entrenamiento, no para inferencia directa.
- No incluye el codec congelado ni el modelo Qwen3-VL-2B, por lo que no es autocontenido. Para cualquier uso práctico es necesario reconstruir el pipeline completo.
- La licencia es "other", lo que deja los términos de uso sin especificar. No se garantiza que se permita el uso comercial.
- Faltan datos esenciales como el número de parámetros, la longitud de contexto, los idiomas soportados o las cuantizaciones disponibles, lo que impide evaluar su aplicabilidad general.
- Las pérdidas de entrenamiento indican que el world model está lejos de converger (loss_world 0.357), mientras que la acción converge mejor (loss_action 0.00239). El checkpoint refleja un estado temprano del entrenamiento.
- Existe riesgo de alucinación en el world model: las predicciones del estado futuro pueden ser incorrectas o inconsistentes, especialmente al no estar completamente entrenado.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de manipulación es desconocido y no debe asumirse.

## Enlaces

- HuggingFace: https://huggingface.co/Richard-ZZZZZ/robotwin-bihub-joint-wam-v3-step2000
- RoboTwin 2.0: https://robotwin-platform.github.io/
- GitHub oficial de RoboTwin: https://github.com/robotwin-Platform/robotwin
