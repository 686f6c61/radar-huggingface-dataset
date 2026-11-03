# Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-lape-lam0p005-10000-20261103

## Resumen

π0.5 SNUMPR es un checkpoint de adaptación de un modelo de visión-lenguaje-acción (VLA) de la familia π0.5, orientado a control robótico en el mundo real. Lo publica el usuario Donghyun1228 dentro del ecosistema openpi, y este checkpoint concreto forma parte de una cadena de adaptación sobre un modelo base π0.5 preentrenado, con inicialización explícita desde un checkpoint anterior (`pi05-snumpr-realworld-conflict-mean-source-10000-20261028`, paso 9999). No es un modelo de lenguaje generalista, sino un artefacto de investigación para manipulación robótica.

El modelo incorpora una técnica de anclaje por capas ponderado con LAPE (λ = 0.005) y una adaptación de dinámica inversa (IDM) solo sobre el objetivo, entrenada durante 10.000 actualizaciones sobre datos reales con una vista ampliada y un giro virtual de +30° en yaw. El resultado es un checkpoint con tres pasos guardados (999, 4999, 9999) y una política de servicio recomendada que separa la torre de visión de la muñeca.

Su relevancia es acotada pero técnica: documenta un protocolo reproducible de adaptación de VLAs a dominios reales con transformaciones geométricas conocidas, y expone el andamiaje (preset, código de commit, prior por capas) para replicar o auditar el proceso. No se ha ejecutado ninguna evaluación en robot, por lo que su rendimiento real es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi); torre de visión + experto de acción, LLM congelado durante la adaptación |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en bf16 para la torre de visión; el resto no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | JAX (params + train_state + assets); no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 de openpi: un backbone de visión-lenguaje con un experto de acción acoplado. En esta adaptación el LLM permanece congelado y solo se entrena el experto de acción, con pérdida IDM (dinámica inversa) aplicada únicamente a la parte objetivo y excluyendo el índice 6 del gripper de la pérdida. Se usa Mean-IDM 1 con 32 ventanas IDM por actualización, optimizador ConflictAnchorAdamW con ponderación `conflict` y coeficiente 0.005 (valor tomado de LIBERO), LR constante de 5e-5 con warmup de 500 pasos, y se conserva la normalización original.

La innovación destacable es el anclaje por capas ponderado con LAPE: se calcula la fracción compartida s_l por capa sobre el dominio fuente real (ruta de política sobre demos IL y ruta IDM sobre ventanas IDM, τ = 1, 128 lotes) y se define el peso w_l = 1 − s_l^10, con w = 0 en los grupos de entrada/salida. Se aplican 259 grupos de matrices, coherentes con el `prior/ema099.json` del repo fuente. Los datos de entrenamiento provienen de `snumpr-realworld-large-view-yaw30-probe-20261028`, con yaw virtual base de +30°, lo que exige que el controlador del robot aplique la transformación inversa `Δxyz_real = Rz(+30) Δxyz_virtual` y `q0_real − 30°`. El entrenamiento totaliza 10.000 actualizaciones.

## Capacidades

- Control robótico de manipulación a partir de observaciones visuales y estado del robot (política VLA), no generación de texto libre.
- Adaptación al dominio real con vista ampliada y corrección geométrica de yaw (+30° virtual, transformación inversa en el controlador).
- Separación de torres de visión: la política de servicio `policy_source_wrist/` usa la torre adaptada solo para la cámara base y la torre fuente (paso 9999, bf16) para la muñeca.
- Entrenamiento IDM solo sobre objetivo con exclusión del gripper en la pérdida.
- Checkpoints intermedios (999, 4999, 9999) con `params`, `train_state` completo y `assets` para reanudar o auditar.
- Servicio mediante configuración `pi05_snumpr_conflict_mean_source_separate_wrist` (solo JAX).
- No se declaran capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en adaptación de VLAs: reproducir el protocolo LAPE con λ = 0.005 sobre un dominio fuente real y comparar con el checkpoint de inicialización para aislar el efecto del anclaje por capas.
- Manipulación robótica con cámara base y de muñeca: desplegar `policy_source_wrist/` para que la cámara base use la visión adaptada y la muñeca la fuente, evitando el arrastre de la adaptación a la vista de muñeca.
- Validación de transformaciones geométricas: usar el checkpoint para verificar que el controlador aplica correctamente `Rz(+30)` y el offset de −30° en `q0`, comparando el comportamiento con y sin corrección.
- Estudio de congelación del LLM: analizar cuánto rendimiento se obtiene entrenando solo el experto de acción frente a ajuste completo, dado que el LLM está congelado.
- Auditoría de checkpoints intermedios: comparar los pasos 999, 4999 y 9999 para estudiar la dinámica de adaptación y el sobreajuste en 10.000 actualizaciones.
- Base para adaptaciones posteriores: servir como inicialización documentada para nuevos dominios reales, ya que el repo incluye preset, commit de código (`93531a30`) y prior reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha ejecutado ninguna evaluación en robot.

## Requisitos de hardware

- VRAM estimada: no disponible. El repo ocupa 55,9 GB e incluye tres checkpoints con `params`, `train_state` completo y `assets`, por lo que el peso en disco no equivale al de inferencia.
- GPU recomendadas: no disponible. El servicio es solo JAX, lo que en la práctica apunta a aceleradores compatibles con JAX (por ejemplo, A100/H100), pero no se confirma en la información.
- ¿Cabe en GPU de consumo? No disponible; no se documentan requisitos ni cuantizaciones.
- Opciones de despliegue: configuración `pi05_snumpr_conflict_mean_source_separate_wrist` en JAX (openpi). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR (este checkpoint) | no disponible | no disponible | sin evaluación en robot | apache-2.0 | HuggingFace, 0 descargas |
| Checkpoint de inicialización `pi05-snumpr-realworld-conflict-mean-source-10000-20261028` | no disponible | no disponible | no disponible | no disponible en la información | HuggingFace |
| Modelo base π0.5 (openpi) | no disponible | no disponible | no disponible en la información | no disponible en la información | openpi |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación en robot: el rendimiento real de la política es desconocido.
- Requiere que el controlador aplique la transformación inversa del yaw virtual (+30°); omitirla invalida las acciones predichas.
- El índice 6 del gripper se excluye de la pérdida IDM, lo que puede afectar a la calidad del control del gripper.
- El LLM está congelado: la adaptación solo cubre el experto de acción, lo que limita la plasticidad del modelo.
- El servicio recomendado es solo JAX y depende de una configuración concreta; no hay soporte declarado para otros runtimes.
- Riesgo de sobreajuste a la vista ampliada y al dominio `snumpr-realworld-large-view-yaw30`; no se documenta generalización a otras cámaras o geometrías.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí riesgo de acciones incorrectas fuera de distribución.
- Idiomas: no disponible; el modelo no es de propósito lingüístico.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación en robot desaconseja producción sin validación previa.
- Repo de 55,9 GB con tres checkpoints completos: coste de almacenamiento y de carga considerable.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-large-view-yaw30-lape-lam0p005-10000-20261103
- Checkpoint de inicialización: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-conflict-mean-source-10000-20261028
- Dataset: https://huggingface.co/Donghyun1228/snumpr-realworld-large-view-yaw30-probe-20261028
- Repo de código de adaptación: https://huggingface.co/Donghyun1228/vla_adaptation
- openpi: no disponible en la información proporcionada.
- Paper, blog o demo: no disponibles en la información proporcionada.
