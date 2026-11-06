# Donghyun1228/pi05-libero-lape-k10-view-large-lam0p005-lr5e-5-10000-20261102

## Resumen

π0.5 LIBERO view_large es un checkpoint de política robótica (vision-language-action, VLA) derivado de π0.5 y entrenado sobre el benchmark LIBERO. Lo publica el usuario Donghyun1228 como resultado principal del método de anclaje LAPE (Layer-Adaptive Parameter Estimation) dentro de su repositorio `vla_adaptation`. El modelo parte del checkpoint `pi05-libero-conflict-mean-source-n50k-10000` (paso 9999) y aplica una adaptación específica al dominio de la cámara `view_large`, con el backbone LLM congelado y solo los módulos de acción/visión adaptados.

La relevancia es acotada pero concreta: se trata de un artefacto de investigación que documenta una receta de adaptación de bajo rango sobre un modelo VLA preentrenado, con una métrica de éxito declarada del 73,95 % en LIBERO (2000 episodios, 500 por suite, MuJoCo 3.2.3). No es un modelo de propósito general ni un LLM: es una política de control para manipulación robótica en simulación.

El repositorio ocupa 23,8 GB e incluye pesos, estado completo de entrenamiento y assets de normalización. La licencia es Apache 2.0. No se declaran idiomas soportados ni se publican datos de arquitectura más allá de la referencia a π0.5/openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 / openpi; backbone LLM congelado durante la adaptación, con torre de visión y cabeza de acción entrenables |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo contiene `params`, `train_state` y `assets`; tamaño total 23,8 GB) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de π0.5 integrado en el ecosistema openpi, adaptado mediante el método LAPE del repositorio `vla_adaptation` (commit `e37d9435`), con el preset `pi05_libero_conflict_anchor_view_adapt`. La inicialización proviene de `Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024@8878d77` en el paso 9999, que a su vez es un modelo entrenado con imitación (IL) más un objetivo mean-IDM con recogida de conflictos de gradiente.

La adaptación se realiza solo sobre el objetivo (target-only mean-IDM) en el soporte `view_large` con n=50k, durante 10.000 actualizaciones, excluyendo el índice de gripper (6) de la pérdida IDM y manteniendo el LLM congelado. El optimizador es ConflictAnchorAdamW con ponderación `conflict`, coeficiente 0,005 y LR pico de 5e-5 constante tras el warmup. El anclaje por capas usa el prior `prior/lape_k10/prior.json`, con peso por capa w_l = 1 − s_l^10 derivado de la fracción compartida LAPE s_l, y w=0 para los grupos de entrada/salida.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO (tareas de las suites de LIBERO), con política de evaluación `policy_source_wrist` que pasa la cámara de muñeca por la torre de visión del modelo fuente.
- Ejecución de políticas VLA condicionadas por observaciones visuales (cámara de muñeca y vista `view_large`) y estado del robot.
- Adaptación de dominio específica a la configuración de cámara `view_large` mediante anclaje LAPE.
- Entrenamiento con objetivo auxiliar mean-IDM (predicción de dinámica inversa) para regularizar la representación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo; no aplica como modelo de lenguaje general.

## Casos de uso

- Investigación en adaptación de políticas VLA: servir como punto de partida o referencia para reproducir el método LAPE y comparar recetas de anclaje por capas en LIBERO.
- Evaluación de robustez ante cambios de cámara: el checkpoint está especializado en `view_large`, por lo que es útil para medir degradación al cambiar la vista en simulación.
- Baseline en experimentos de conflicto de gradiente: al derivar de un modelo con recogida de conflictos, permite aislar el efecto del anclaje LAPE frente a la inicialización.
- Reproducción de resultados en MuJoCo 3.2.3: validar la tasa de éxito declarada (73,95 %) con las semillas 17 y 27 y 500 episodios por suite.
- Estudio de congelación del LLM: analizar cuánto rendimiento se conserva adaptando solo visión/acción sin tocar el backbone lingüístico.
- Docencia y divulgación: ejemplo completo de pipeline openpi con assets de normalización, `train_state` y política de exportación incluidos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LIBERO (2000 episodios, 500 por suite, MuJoCo 3.2.3) | Tasa de éxito | 73,95 % |
| LIBERO, semilla 17 | Tasa de éxito | 72,60 % |
| LIBERO, semilla 27 | Tasa de éxito | 72,55 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de una política robótica y no de un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo de 23,8 GB incluye pesos y `train_state`, por lo que la inferencia requiere menos que el tamaño total del repositorio, pero no se publica la cifra.
- GPU recomendadas: no disponible; por el tamaño del checkpoint y el stack openpi, es razonable esperar GPUs de datacenter (A100/H100), aunque el autor no lo especifica.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: stack openpi / π0.5 (no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO view_large (este) | no disponible | no disponible | 73,95 % éxito LIBERO | Apache 2.0 | Hugging Face (Donghyun1228) |
| π0.5 base (openpi) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | openpi |
| π0 (openpi) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | openpi |
| OpenVLA | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos verificados de los modelos comparables en la información proporcionada; las celdas se dejan como no disponibles para no inventar cifras.

## Limitaciones y advertencias

- Es un checkpoint de investigación con 0 descargas y 0 likes; no hay evidencia de validación externa.
- La métrica de éxito (73,95 %) se declara solo en LIBERO con MuJoCo 3.2.3 y semillas concretas (17 y 27); no hay garantía de generalización a otros entornos o configuraciones de cámara.
- Específico de `view_large`: el rendimiento puede caer fuera de esa vista, y la política de evaluación usa la cámara de muñeca a través de la torre de visión del modelo fuente, lo que introduce dependencia de esa configuración.
- El LLM está congelado durante la adaptación; el modelo no adquiere nuevas capacidades lingüísticas y no debe usarse como LLM.
- Riesgo de sobreajuste al soporte `view_large` (n=50k) y a las tareas de LIBERO.
- No se documentan sesgos, idiomas ni comportamiento fuera de distribución; no disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de π0.5/openpi, cuyas condiciones deben verificarse por separado.
- El repositorio incluye `train_state` completo (23,8 GB), lo que complica el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-k10-view-large-lam0p005-lr5e-5-10000-20261102
- Checkpoint de inicialización: https://huggingface.co/Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024
- Repositorio de código del método: `Donghyun1228/vla_adaptation` (commit `e37d9435`), preset `pi05_libero_conflict_anchor_view_adapt`
- openpi (stack de π0.5): no se proporciona URL en la información disponible
- Paper de π0.5: no disponible en la información proporcionada
