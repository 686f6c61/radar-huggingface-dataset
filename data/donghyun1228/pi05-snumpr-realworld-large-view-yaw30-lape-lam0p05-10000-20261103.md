# Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-lape-lam0p05-10000-20261103

## Resumen

π0.5 SNUMPR real-world large view + yaw30 target, LAPE-weighted layer anchor λ 0.05 es un checkpoint de adaptación de un modelo de visión-lenguaje-acción (VLA) de la familia π0.5, publicado por el usuario Donghyun1228 y vinculado al ecosistema openpi. El modelo parte de una inicialización previa (un checkpoint "conflict-mean-source" del 28 de octubre de 2026) y se entrena durante 10.000 actualizaciones sobre un conjunto de datos reales de robótica con una transformación virtual de guiñada de +30° en la cámara base. El objetivo es adaptar un modelo de política robótica a un dominio destino mediante el ajuste del experto de acción, manteniendo congelado el backbone LLM.

La contribución técnica principal es el uso de un anclaje por capas ponderado con LAPE (una medida de fracción compartida por capa) para regular la adaptación, con un coeficiente λ de 0,05. El repositorio ocupa 55,8 GB e incluye los pasos 999, 4999 y 9999, cada uno con parámetros, estado de entrenamiento completo y assets. Se distribuye una política de servicio recomendada que separa el tower de visión de la muñeca (procedente del modelo fuente) del tower de la cámara base (adaptado).

Es relevante porque documenta un protocolo reproducible de adaptación de VLA en robótica real con transformaciones geométricas explícitas y anclaje selectivo de capas, un área donde escasean los checkpoints públicos con detalle de receta. No obstante, el propio autor indica que no se ha ejecutado ninguna evaluación sobre robot, por lo que su rendimiento real está por verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi): backbone LLM congelado + experto de acción entrenable |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en params, train_state y assets; el tower de visión de servicio en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | JAX (params y train_state); tower de visión en bf16; export.json con entradas de servicio |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 de openpi, un VLA que combina un backbone de lenguaje congelado con un experto de acción entrenable. En esta adaptación solo se entrena el experto de acción: el LLM permanece congelado y el ajuste se aplica sobre el dominio destino con 10.000 actualizaciones. Se usa Mean-IDM 1 con IDM32 por actualización, excluyendo el índice 6 (gripper) de la pérdida IDM. El optimizador es ConflictAnchorAdamW con ponderación `conflict`, coeficiente 0,05 y LR constante de 5e-5 con warmup de 500 pasos. Se conserva la normalización original.

La innovación central es el anclaje por capas ponderado con LAPE: a partir del prior `prior/lape_k10/prior.json`, cada capa recibe un peso w_l = 1 − s_l^10, donde s_l es la fracción compartida LAPE medida sobre el dominio fuente real (ruta de política sobre demos IL, ruta IDM sobre ventanas IDM, tau 1, 128 batches); los grupos de E/S tienen peso 0. Se cubren 259 grupos de matrices, los mismos que el `prior/ema099.json` del repositorio fuente. Los datos de entrenamiento son `snumpr-realworld-large-view-yaw30-probe-20261028`, con una guiñada virtual de +30° en la cámara base que el controlador del robot debe invertir aplicando Δxyz_real = Rz(+30) Δxyz_virtual y q0_real − 30° en el estado. Se guardan los pasos 999, 4999 y 9999.

## Capacidades

- Control robótico mediante política VLA: genera acciones a partir de observaciones visuales y estado del robot.
- Adaptación a dominio destino con transformación geométrica explícita (guiñada virtual de +30° en la cámara base).
- Servicio con separación de towers de visión: la cámara base usa el tower adaptado y la muñeca usa el tower fuente (bf16), mediante la política `policy_source_wrist/`.
- Configuración de servicio `pi05_snumpr_conflict_mean_source_separate_wrist` (solo JAX), con `export.json` que lista las entradas.
- Entrenamiento selectivo del experto de acción con backbone LLM congelado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo; es un checkpoint especializado en robótica.

## Casos de uso

- Despliegue de política robótica en un robot real con cámara base y cámara de muñeca: se serviría `policy_source_wrist/` con la configuración indicada, aplicando la inversa de la transformación de guiñada (+30°) en el controlador para que las acciones virtuales se traduzcan a coordenadas reales.
- Adaptación de un VLA a un nuevo montaje de cámara: el checkpoint sirve como referencia de receta para reentrenar el experto de acción cuando cambia la orientación de la cámara base, manteniendo el tower de la muñeca del modelo fuente.
- Investigación en anclaje selectivo de capas: el prior LAPE y el esquema w_l = 1 − s_l^10 son reutilizables para estudiar qué capas deben regularse al adaptar políticas entre dominios.
- Reproducción de experimentos de adaptación: los pasos 999, 4999 y 9999 con train_state completo permiten analizar la evolución del entrenamiento y comparar checkpoints intermedios.
- Evaluación de protocolos de servicio JAX en robótica: la separación de towers y el `export.json` facilitan integrar el modelo en pipelines de inferencia JAX existentes.
- Base para experimentos de ajuste con datos reales de manipulación: el conjunto `snumpr-realworld-large-view-yaw30-probe-20261028` y la inicialización previa permiten continuar el entrenamiento o probar variantes de λ y ponderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 55,8 GB, pero incluye tres checkpoints con train_state completo, por lo que el tamaño de un único conjunto de parámetros no se detalla.
- GPU recomendadas: no disponible. El servicio es solo JAX, lo que en la práctica apunta a GPUs con soporte CUDA para JAX (por ejemplo, A100 o H100), pero no se confirma en la información.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: servicio JAX con la configuración `pi05_snumpr_conflict_mean_source_separate_wrist` y la política `policy_source_wrist/`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR real-world large view yaw30 LAPE λ0.05 (este) | no disponible | no disponible | sin evaluación en robot | apache-2.0 | Hugging Face, JAX |
| π0.5 SNUMPR real-world conflict-mean-source (inicialización) | no disponible | no disponible | no disponible | apache-2.0 (según repo fuente) | Hugging Face |
| π0.5 openpi base | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | openpi |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación sobre robot: el rendimiento real de la política es desconocido.
- La transformación de guiñada de +30° es virtual: si el controlador no aplica la inversa (Δxyz_real = Rz(+30) Δxyz_virtual y q0_real − 30° en el estado), las acciones serán incorrectas.
- El servicio recomendado requiere JAX y la configuración específica `pi05_snumpr_conflict_mean_source_separate_wrist`; no hay soporte documentado para otros runtimes.
- El modelo está especializado en una tarea y montaje concretos; no es un modelo de propósito general y no se documentan capacidades de texto, código o multilingüismo.
- Riesgo de alucinación y sesgos: no documentados; en políticas robóticas el riesgo se manifiesta como acciones fuera de distribución, no como texto inventado.
- La licencia apache-2.0 permite uso comercial, pero el checkpoint depende de datos y modelos previos cuya licencia y condiciones no se detallan en la información disponible.
- El repositorio de 55,8 GB incluye tres checkpoints con train_state; el almacenamiento y la transferencia requieren planificación.
- Los checkpoints guardados hacen pasar la cámara de muñeca por el tower de visión adaptado; solo la política de servicio separa el tower de la muñeca.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-lape-lam0p05-10000-20261103
- Inicialización: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028
- Dataset: https://huggingface.co/Donghyun1228/snumpr-realworld-large-view-yaw30-probe-20261028
- Código de adaptación (preset `pi05_snumpr_target_lape_anchor_large_view_yaw30_lam0p05`): https://huggingface.co/Donghyun1228/vla_adaptation
- openpi: no disponible en la información proporcionada
