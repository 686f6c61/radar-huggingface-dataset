# jesbu1/boost-study-best-checkpoints

## Resumen

`jesbu1/boost-study-best-checkpoints` es un repositorio de checkpoints finales de políticas de control robótico entrenadas con aprendizaje por refuerzo (RL) y flow matching, publicado por el usuario `jesbu1` en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de pesos de políticas (actores, críticos, value networks y cabezas de steering) resultantes del estudio de conferencia BOOST, en la rama `rfm_rl` (probablemente "reinforcement learning for robotic flow matching"). El repositorio recopila, para cada método y tarea, la configuración ganadora de un barrido de hiperparámetros, con cinco semillas por ejecución.

El problema que resuelve es el de disponer de políticas robóticas preentrenadas y afinadas con RL listas para evaluar o reutilizar en tareas de manipulación concretas (inserción de una pata, manejo de un bolígrafo, apilado, colgado de herramientas). Su relevancia es acotada: es material de reproducibilidad de un estudio académico, no un modelo de propósito general. El repositorio ocupa 35,5 GB y contiene checkpoints en formato PyTorch (`.pt`), junto con metadatos de Weights & Biases.

La información pública disponible es muy limitada: no hay datos de arquitectura, número de parámetros, contexto, idiomas ni benchmarks en la model card. Todo lo que se detalla a continuación se deriva estrictamente de los datos del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (políticas de RL con flow matching; detalles no publicados) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (checkpoints en punto flotante PyTorch) |
| Idiomas soportados | No disponible (modelo de robótica, no lingüístico) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | `.pt` (PyTorch): `critic.pt`, `critic_target.pt`, `critic_optimizer.pt`, `actor.pt`, `actor_optimizer.pt`, `steer_policy.pt`, `value_net.pt`, `value_optimizer.pt`, `training_state.json` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de las políticas. Por los tags (`flow-matching`, `reinforcement-learning`, `steering`) y por los nombres de ficheros, se deduce que se trata de políticas de flow matching (generativas, probablemente basadas en modelos de difusión o flow) afinadas con RL offline. Los métodos incluidos son DSBC (con cabeza de steering `steer_policy.pt`) e IDQL (con `value_net.pt` y `value_optimizer.pt`, correspondientes a la V de IQL). Los checkpoints incluyen actor, crítico, crítico objetivo y optimizadores, lo que permite reanudar el entrenamiento.

El entrenamiento se organiza por tarea y método. Las tareas son `one_leg`, `pen`, `stack_d0`, `stack_d1` y `toolhang`. Para cada método y tarea se selecciona la configuración ganadora de un barrido (`best/<method>.yaml`) y se ejecuta con cinco semillas (0 a 4). Se distinguen variantes con best-of-K activado (K=10) o desactivado (`_k1`, K=1), y variantes con 200 demos en lugar de 25 (`_d200`). Las políticas parten de bases preentrenadas por comportamiento (BC) al 10, 25, 50, 75 o 90 % (`sr10`, `sr25`, `sr50`, `sr75`, `sr90`), publicadas en `jesbu1/boost-bc-flow-policies`. También se incluye una ejecución de transferencia (`study_stack_d1_idql_xfer_stack_d0_c09`) que aplica la configuración ganadora de IDQL en `stack_d0` sin cambios sobre `stack_d1`. No se especifican volúmenes de datos, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Control robótico de manipulación en cuatro familias de tareas: inserción de una pata (`one_leg`), manejo de un bolígrafo (`pen`), apilado (`stack_d0`, `stack_d1`) y colgado de herramientas (`toolhang`).
- Políticas generativas basadas en flow matching, adecuadas para modelar distribuciones multimodales de acciones.
- Afinamiento con RL offline mediante DSBC (con cabeza de steering) e IDQL (con value network tipo IQL).
- Evaluación best-of-K (K=10 o K=1) para seleccionar acciones entre muestras.
- Transferencia entre variantes de tarea (`stack_d0` a `stack_d1`).
- Reproducibilidad completa: cada ejecución incluye configuración resuelta, metadatos de host y commit git, y resumen de métricas de W&B.
- No soporta tool calling, agentes, razonamiento simbólico, matemáticas, visión genérica ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de resultados del estudio BOOST: cargar los checkpoints de `final/` junto con `wandb/config.yaml` y `wandb-summary.json` para replicar las métricas publicadas de cada método y tarea.
- Punto de partida para nuevo entrenamiento: los ficheros `actor.pt`, `critic.pt` y sus optimizadores permiten reanudar el afinamiento RL desde el presupuesto completo en lugar de desde cero.
- Comparación de métodos de RL offline: evaluar DSBC frente a IDQL sobre las mismas tareas y semillas, usando los checkpoints ya entrenados como referencia.
- Estudio de robustez ante la base BC: las variantes `sr10`, `sr25`, `sr50`, `sr75` y `sr90` permiten analizar cómo influye la calidad de la política de comportamiento inicial en el resultado final del RL.
- Análisis de best-of-K: comparar las variantes `_k1` (K=1) con las de K=10 para medir la ganancia de muestrear múltiples acciones y seleccionar la mejor.
- Transferencia entre tareas: usar la ejecución `study_stack_d1_idql_xfer_stack_d0_c09` para estudiar la generalización de una configuración ganadora a una variante de tarea distinta.
- Evaluación en simulación de robótica: integrar las políticas en el entorno de simulación correspondiente (no especificado en la model card) para medir tasas de éxito por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las métricas registradas en Weights & Biases (proyecto `tri/rfm_rl`), pero no incluye cifras de tasa de éxito ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del tamaño de las políticas, que no se publica; el repositorio completo ocupa 35,5 GB, pero incluye optimizadores y múltiples ejecuciones.
- GPU recomendadas: no disponible. Al tratarse de políticas de robótica de tamaño presumiblemente pequeño, es probable que quepan en GPU de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no se documentan. Los pesos están en formato PyTorch (`.pt`), por lo que requerirían el código de entrenamiento/inferencia del repositorio `rfm_rl` (no enlazado en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables ni ofrece métricas que permitan una comparación con otras políticas robóticas publicadas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de propósito general: solo sirve para las tareas robóticas concretas para las que fue entrenado.
- La licencia es `other` y no se detalla su contenido; es imprescindible consultar los términos exactos antes de cualquier uso comercial.
- No se especifican sesgos, pero al ser políticas entrenadas con datos de demostración, heredarán los sesgos y limitaciones de dichas demostraciones.
- Riesgo de alucinación no aplicable en el sentido lingüístico; sí existe riesgo de acciones fuera de distribución en estados no vistos durante el entrenamiento.
- Faltan ejecuciones: DICE, DSRL y DSBC con K=10 en `toolhang`, `stack` y `pen` no están incluidos porque se ejecutaron en máquinas de un colaborador.
- No se documentan arquitectura, número de parámetros, datos de entrenamiento ni métricas, lo que dificulta la evaluación independiente.
- La fecha de creación del repositorio (2026-11-25) es posterior a la actual; conviene verificar la integridad y vigencia de los artefactos.
- El repositorio de 35,5 GB incluye optimizadores y metadatos; para inferencia solo se necesitan los ficheros de política y red de valor correspondientes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jesbu1/boost-study-best-checkpoints
- Bases BC de partida: https://huggingface.co/jesbu1/boost-bc-flow-policies
- Proyecto de Weights & Biases referenciado: `tri/rfm_rl` (no se proporciona URL directa)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
