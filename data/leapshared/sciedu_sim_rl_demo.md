# leapshared/sciedu_sim_rl_demo

## Resumen

`leapshared/sciedu_sim_rl_demo` es un repositorio de artefactos de experimentación en aprendizaje por refuerzo (RL) aplicado a un entorno de simulación física construido con MuJoCo. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es un conjunto de políticas entrenadas, planes de comandos y registros de comparación asociados a un robot de dos brazos denominado OpenArm, orientado a reproducir tareas de experimentos científicos simulados (manipulación de una placa de oxidación-reducción, frotamiento de una varilla de electroscopio, trazado de minerales, etc.).

El autor (`leapshared`) lo publica como material de respaldo de un documento interno de mediciones (`docs/measurements/sim-train-augment.md`), concretamente la sección dedicada a la "demostración de RL" (`gen=rl`). El enfoque técnico declarado es "aprendizaje por refuerzo residual sobre una planificación de código de cinemática inversa (IK)": es decir, se parte de una política base basada en IK y se aprende un residual mediante PPO (`scripts/sim/ppo_rim.py`) para corregir el comportamiento en el entorno simulado.

El repositorio es de tamaño prácticamente nulo (0.0 GB) y no registra descargas ni interacciones. La model card advierte explícitamente que los artefactos se construyeron con activos antiguos (agarre naranja y escena previa) y que no deben usarse como datos de entrenamiento, sino solo para contrastar las cifras del documento de mediciones. Por tanto, su relevancia es de trazabilidad experimental, no de uso como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL (actor en `actor.safetensors`) sobre planificación de IK; entorno MuJoCo con robot bimanual OpenArm |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`actor.safetensors`), config.json, norm.json, JSONL de planes y NPZ de comandos; checkpoints de política en JSON (`rub_policy*_itNNN.json`) |

## Arquitectura y entrenamiento

La arquitectura descrita no es un transformer ni un modelo de lenguaje, sino una política neuronal que actúa como residual sobre una planificación de comandos de cinemática inversa en un entorno MuJoCo. El pipeline de entrenamiento es PPO (`scripts/sim/ppo_rim.py`), con configuraciones en `config/rl_demo/*.yaml` y scripts de demostración `scripts/sim/rl_demo*.py`. Los artefactos incluyen normalización de observaciones (`norm.json`), planes de referencia (`plans/plans.jsonl`) y comandos en `.npz`, lo que permite reconstruir la relación entre planificación base y acción aprendida.

Las variantes de política publicadas para la tarea de la placa de oxidación-reducción son cinco: `v1`, `v1b_straight_zeroinit`, `v1_two_phase`, `v2_wide` y `v2_wide_tp`. Para la tarea de la varilla se publican checkpoints por iteración (`rub_policy*_itNNN.json`) y registros de entrenamiento (`rub_train*.jsonl`). No se especifican en la información disponible el número de tokens, la composición del dataset ni detalles de RLHF/DPO, ya que no aplican a este tipo de artefacto. La innovación destacable es el esquema de RL residual sobre IK, que reduce el espacio de exploración al partir de una política geométricamente informada.

## Capacidades

- Control de políticas de RL para manipulación bimanual en simulación MuJoCo con el robot OpenArm.
- Ejecución de tareas simuladas de experimento científico: inserción de placa de oxidación-reducción, frotamiento de varilla de electroscopio, trazado de minerales y secuencias completas de inserción y sumersión.
- Comparación de políticas mediante líneas de contraste (`*_compare*.jsonl`) y jueces de evaluación versionados (por ejemplo, `_j010` corresponde al juez `0.10.0-draft`).
- Diagnóstico de fallos mediante registros (`*_diag*.jsonl`) y avisos físicos (`MUJOCO_LOG_20261112.txt`).
- Reconstrucción de resultados bajo jueces antiguos y nuevos (`rod_shadow/outputs/` y `rod_shadow_judge010/outputs/`).
- No dispone de generación de texto, razonamiento lingüístico, código general, matemáticas, visión, tool calling, agentes conversacionales ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de RL en simulación: el repositorio contiene planes, políticas y registros suficientes para reejecutar las demostraciones de la sección `gen=rl` del documento de mediciones y contrastar cifras.
- Estudio de RL residual sobre IK: las cinco variantes de la placa (`v1`, `v1b_straight_zeroinit`, `v1_two_phase`, `v2_wide`, `v2_wide_tp`) permiten analizar el efecto de inicialización, fases y anchura del espacio de inicio sobre el aprendizaje.
- Evaluación comparativa de jueces: los pares `rod_shadow/` y `rod_shadow_judge010/` permiten medir cómo cambia la puntuación de una misma política al pasar del juez antiguo al `0.10.0-draft`.
- Depuración de inestabilidad física: los registros `MUJOCO_LOG_20261112.txt` y los JSONL de diagnóstico sirven para identificar contactos problemáticos o violaciones de restricciones en el simulador.
- Docencia e investigación en robótica: como material de referencia para cursos o artículos sobre RL aplicado a manipulación bimanual en MuJoCo, dado que incluye checkpoints intermedios y curvas de aprendizaje.
- Reconstrucción de artefactos: la model card indica que los scripts y copias de código omitidos pueden regenerarse desde los commits `3646e6d2` y `95c32236`, lo que facilita auditoría y replicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona líneas de comparación (`rub_compare*.jsonl`, `*_compare*.jsonl`) y curvas de aprendizaje, pero no se proporcionan cifras numéricas en la información suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos de modelo fundacional ni se indica tamaño de la política.
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible; el entorno MuJoCo puede ejecutarse en CPU, pero no se especifican requisitos.
- Opciones de despliegue: MuJoCo para el entorno simulado y scripts propios (`scripts/sim/rl_demo*.py`, `scripts/sim/ppo_rim.py`); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos o repositorios comparables de la misma categoría (políticas de RL residual sobre IK para manipulación bimanual en MuJoCo).

## Limitaciones y advertencias

- Artefactos obsoletos por diseño: la model card indica que se construyeron con el agarre antiguo (mango naranja) y la escena previa, y que deben rehacerse con los activos nuevos y el agarre de la parte superior de la placa de hierro.
- Uso restringido: el autor prohíbe explícitamente emplearlos como datos de entrenamiento; solo deben usarse para contrastar las cifras de la sección correspondiente del documento de mediciones.
- Ausencia de documentación de rendimiento: no hay cifras de benchmarks ni métricas de éxito publicadas en la información disponible, lo que impide evaluar la calidad de las políticas.
- Código incompleto en el repositorio: se omiten copias de código (`rod_shadow/`, `rod_shadow_judge010/`), `rod_3646e6d2.tar` y `mineral_shadow/scripts`, así como registros de entrenamiento (`*.log`) y scripts temporales (`scratch/`); la reproducibilidad completa depende de los commits `3646e6d2` y `95c32236`.
- Dependencia de versión del juez: los resultados cambian según el juez utilizado (antiguo frente a `0.10.0-draft`), por lo que comparaciones entre carpetas pueden no ser homogéneas.
- Licencia Apache-2.0: permite uso comercial, pero al tratarse de artefactos de investigación obsoletos no se recomienda su uso en producción sin reentrenamiento.
- Sin soporte multilingüe ni lingüístico: no es un modelo de lenguaje, por lo que cualquier expectativa de generación de texto, código o razonamiento simbólico queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/leapshared/sciedu_sim_rl_demo
- Repositorio de código referenciado en la model card: `scripts/sim/rl_demo*.py`, `scripts/sim/ppo_rim.py`, `config/rl_demo/*.yaml` (commits `3646e6d2` y `95c32236`)
- Documento de mediciones referenciado: `docs/measurements/sim-train-augment.md` (sección "강화학습 시연 (gen=rl)")
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales asociados a este artefacto.
