# Donghyun1228/pi05-libero-lape-k10-view-medium-lam0p005-lr5e-5-10000-20261102

## Resumen

El modelo `pi05-libero-lape-k10-view-medium-lam0p005-lr5e-5-10000-20261102` es un checkpoint de robótica basado en π0.5 (pi05), la arquitectura de visión-lenguaje-acción (VLA) de Physical Intelligence integrada en el ecosistema openpi. Lo publica el usuario Donghyun1228 como resultado principal de su método de anclaje LAPE (Layer Anchor by Partial Evidence), orientado a la adaptación de políticas VLA preentrenadas a nuevas distribuciones visuales sin degradar el comportamiento aprendido previamente. El problema que aborda es el ajuste fino selectivo por capas: en lugar de actualizar toda la red, se pondera la regularización por capa según la fracción compartida de evidencia entre la distribución origen y la destino.

El checkpoint parte de una inicialización IL + mean-IDM entrenada sobre LIBERO con recolección de conflictos de gradiente, y aplica después una adaptación target-only de 10.000 actualizaciones sobre la sonda de soporte `view_medium`, con el LLM congelado y el índice del gripper (6) excluido de la pérdida IDM. El resultado es una política de evaluación (`policy_source_wrist`) que alcanza un 76,95 % de éxito en LIBERO con 2.000 episodios (500 por suite) en MuJoCo 3.2.3.

El interés del modelo es doble: por un lado, es un artefacto reproducible de investigación sobre adaptación de políticas robóticas; por otro, sirve como referencia para quien quiera estudiar cómo el anclaje por capas afecta al rendimiento en tareas de manipulación con cámaras de muñeca y vistas intermedias. El repositorio ocupa 23,8 GB e incluye parámetros, estado de entrenamiento completo, assets de normalización y la política de evaluación exportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) π0.5 (pi05) sobre openpi; transformer con torre de visión y LLM congelado durante la adaptación |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` (JAX/Flax, formato nativo de openpi); incluye `train_state` y `assets` de normalización |

## Arquitectura y entrenamiento

El modelo se construye sobre π0.5 (pi05) dentro del framework openpi, que combina una torre de visión con un LLM y un cabezal de acciones para generar comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. El entrenamiento se organiza en dos fases: una inicialización IL + mean-IDM sobre LIBERO con recolección de conflictos de gradiente (checkpoint `pi05-libero-conflict-mean-source-n50k-10000-20261024`, paso 9999), seguida de una adaptación target-only sobre la sonda de soporte `view_medium` (n=50k) durante 10.000 actualizaciones.

La innovación técnica central es el método LAPE (Layer Anchor by Partial Evidence). Se calcula, por capa, una fracción compartida de evidencia `s_l` y se deriva un peso `w_l = 1 − s_l^10`, con `w = 0` para los grupos de entrada/salida. Estos pesos alimentan un optimizador `ConflictAnchorAdamW` con ponderación `conflict` y coeficiente λ = 0,005, con un pico de learning rate de 5e-5 constante tras el warmup. Durante la adaptación el LLM permanece congelado y el índice del gripper (6) se excluye de la pérdida IDM. El código de referencia corresponde al commit `e37d9435` del repositorio `Donghyun1228/vla_adaptation`, preset `pi05_libero_conflict_anchor_view_adapt`.

## Capacidades

- Control robótico de manipulación en entornos LIBERO a partir de observaciones visuales e instrucciones de tarea.
- Política de visión-lenguaje-acción entrenada para tareas de largo horizonte con vistas de cámara de muñeca (`policy_source_wrist`).
- Adaptación a distribuciones visuales nuevas mediante anclaje por capas (LAPE), preservando el comportamiento de la política origen.
- Evaluación estandarizada en las cuatro suites de LIBERO (500 episodios por suite, 2.000 en total).
- Inferencia determinista en MuJoCo 3.2.3 con el stack openpi.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual libre, visión general ni audio.

## Casos de uso

- Investigación en adaptación de políticas VLA: sirve como checkpoint de referencia para reproducir el método LAPE y comparar curvas de éxito frente a ajuste fino completo o congelado.
- Manipulación robótica en simulación LIBERO: la política `policy_source_wrist` puede desplegarse directamente en MuJoCo 3.2.3 para evaluar tareas de las cuatro suites con un 76,95 % de éxito agregado.
- Estudio de transferencia de dominio visual: el checkpoint permite analizar cómo la adaptación target-only sobre `view_medium` afecta a la robustez ante cambios de cámara o iluminación.
- Baseline para ablaciones de anclaje por capas: con los pesos LAPE y el coeficiente λ documentados, se pueden lanzar variantes (k, λ, LR) y comparar contra este resultado principal.
- Formación y docencia en robótica con aprendizaje profundo: el repo incluye `train_state` y `assets`, lo que facilita inspeccionar el estado completo del entrenamiento y las normalizaciones.
- Integración en pipelines de evaluación automatizada: el export `export.json` de la política de evaluación permite conectar el checkpoint a harnesses de benchmark tipo LIBERO sin reentrenar.
- Reproducibilidad de experimentos: al estar todo el argv en `run/spec.json`, se puede auditar y replicar exactamente la configuración de entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| LIBERO (agregado, 4 suites) | 76,95 % de éxito | 2.000 episodios (500 por suite), MuJoCo 3.2.3 |
| LIBERO, semilla 17 | 76,50 % de éxito | Política `policy_source_wrist`, paso 9999 |
| LIBERO, semilla 27 | 77,35 % de éxito | Política `policy_source_wrist`, paso 9999 |

No se han publicado en la información disponible resultados desagregados por suite ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo pesa 23,8 GB e incluye parámetros, `train_state` y assets, por lo que el checkpoint de parámetros es sustancialmente menor que el total del repositorio.
- GPU recomendadas: no disponibles; openpi suele ejecutarse en GPUs NVIDIA con soporte CUDA, pero el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (23,8 GB) sugiere que la inferencia podría caber en GPUs de 24 GB o más, pero no hay dato oficial.
- Opciones de despliegue: stack openpi (JAX/Flax); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-lape-k10-view-medium (este) | no disponible | no disponible | 76,95 % (2.000 eps) | Apache 2.0 | HuggingFace |
| π0.5 base (openpi) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | openpi |
| Checkpoint origen `pi05-libero-conflict-mean-source-n50k-10000-20261024` | no disponible | no disponible | no disponible en esta ficha | Apache 2.0 (según repo origen) | HuggingFace |

No se dispone de datos comparativos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado en robótica de manipulación en LIBERO; no es un modelo de propósito general para texto, código o visión.
- El rendimiento reportado (76,95 %) se ha medido únicamente en simulación (MuJoCo 3.2.3) y con la política `policy_source_wrist`; no hay validación en robot real.
- Solo se reportan dos semillas (17 y 27); la varianza entre semillas es pequeña (76,50 vs. 77,35), pero el número de semillas es limitado.
- El LLM está congelado durante la adaptación, lo que restringe la plasticidad del modelo a las capas ancladas por LAPE.
- El índice del gripper (6) se excluye de la pérdida IDM, un detalle de implementación que puede afectar a la reproducibilidad si se modifica el pipeline.
- No se documentan sesgos, riesgos de alucinación ni comportamientos fuera de distribución; en robótica, la ausencia de estas evaluaciones es un caveat relevante para producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de π0.5/openpi y de checkpoints previos cuyas condiciones deben verificarse por separado.
- El repositorio incluye `train_state` completo (23,8 GB), lo que complica su despliegue en entornos con almacenamiento limitado.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-lape-k10-view-medium-lam0p005-lr5e-5-10000-20261102
- Checkpoint de inicialización: https://huggingface.co/Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024
- Repositorio de código del método (commit `e37d9435`): https://github.com/Donghyun1228/vla_adaptation
- openpi (framework base): no disponible en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
