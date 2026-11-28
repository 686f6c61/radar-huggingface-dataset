# boost-tri-uw/boost-study-best-checkpoints

## Resumen

`boost-study-best-checkpoints` es un repositorio de pesos de investigación publicado por el usuario `boost-tri-uw` en Hugging Face, no un modelo de lenguaje. Contiene los checkpoints finales (al presupuesto completo de entrenamiento) de las mejores configuraciones de un estudio de reinforcement learning aplicado a robótica, denominado estudio BOOST, sobre la rama `rfm_rl` del proyecto. Los tags del repositorio (robotics, reinforcement-learning, flow-matching, steering) y el pipeline declarado (reinforcement-learning) confirman que se trata de políticas de control entrenadas con flow matching y métodos de RL offline (IDQL y DSBC), no de un transformer generativo de texto.

El repositorio agrupa, para cada combinación de tarea y método, la configuración ganadora de un barrido de hiperparámetros, con 5 semillas por ejecución, sobre cuatro tareas de manipulación robótica (one_leg, pen, stack_d0/stack_d1 y toolhang) y varios niveles de base de comportamiento (sr10, sr25, sr50, sr75, sr90). El tamaño del repositorio es de 36,4 GB, coherente con la acumulación de múltiples ejecuciones que incluyen actor, crítico, optimizadores, redes de valor y estado de entrenamiento.

Su relevancia es acotada y de carácter reproducible: sirve como material de referencia para investigadores que quieran replicar o comparar resultados del estudio, no como modelo desplegable para inferencia general. No hay información sobre idiomas, arquitectura de red concreta ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | políticas de RL con flow matching (IDQL, DSBC); detalles de red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | other (sin detalle de términos en la información disponible) |
| Formato de pesos | `.pt` (PyTorch): `actor.pt`, `critic.pt`, `critic_target.pt`, `actor_optimizer.pt`, `critic_optimizer.pt`, `steer_policy.pt`, `value_net.pt`, `value_optimizer.pt`, `training_state.json` |

## Arquitectura y entrenamiento

El repositorio contiene políticas entrenadas con dos métodos de RL offline: IDQL (con red de valor IQL, ficheros `value_net.pt` y `value_optimizer.pt`) y DSBC (con cabeza de steering, `steer_policy.pt`). Las políticas base emplean flow matching, según los tags del repositorio, y parten de los checkpoints de comportamiento publicados en `jesbu1/boost-bc-flow-policies`. Cada ejecución incluye el estado completo de entrenamiento (`training_state.json`), lo que permite reanudar o auditar el proceso.

El estudio cubre un barrido de configuraciones (`src/rfm_rl/configs/sweep/study/best/<method>.yaml`) sobre cuatro tareas de manipulación y distintos niveles de base de comportamiento (10 %, 25 %, 50 %, 75 % y 90 %). Se incluyen variantes con best-of-K desactivado (K=1) y con K=10, y una variante de Pen con 200 demos en lugar de 25 (`_d200`). También se incluyen dos ejecuciones de transferencia sobre Stack D1 usando las configuraciones ganadoras de Stack D0 sin cambios. No se dispone de información sobre el número de tokens, composición del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Control robótico mediante políticas de RL offline entrenadas con flow matching.
- Dos familias de método: IDQL (aprendizaje de valor con IQL) y DSBC (con cabeza de steering).
- Ejecuciones con best-of-K configurable (K=1 y K=10) para evaluar el efecto de la selección de acciones.
- Transferencia entre tareas: ejecuciones de Stack D0 aplicadas sin cambios a Stack D1.
- Variación de la calidad de la política base (sr10 a sr90) para estudiar robustez frente a datos de comportamiento.
- Variación del volumen de demos (Pen con 25 frente a 200 demos).
- No soporta tool calling, agentes, multilingüismo ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos del estudio BOOST: cargar los checkpoints finales y el `training_state.json` para verificar métricas registradas en W&B y replicar los resultados publicados.
- Comparación de métodos de RL offline: usar los pares IDQL/DSBC por tarea y semilla para analizar diferencias de rendimiento entre ambas familias con idéntico presupuesto.
- Estudio de la calidad de la política base: los grupos `best_sr10` a `best_sr90` permiten medir cómo afecta el porcentaje de la base de comportamiento al resultado final.
- Análisis de best-of-K: comparar ejecuciones `_k1` (K=1) con las de K=10 para cuantificar el efecto de la selección de acciones en la política desplegada.
- Transferencia entre tareas: las ejecuciones `study_stack_d1_*_xfer_stack_d0_*` permiten evaluar la generalización de una configuración ganadora a una tarea distinta sin reajuste.
- Ablación de volumen de datos: las variantes `_d200` de Pen con 200 demos frente a 25 sirven para estudiar el efecto del tamaño del dataset de demostraciones.
- Punto de partida para fine-tuning: al incluir optimizadores y estado de entrenamiento, los checkpoints pueden reanudarse para experimentos posteriores en el mismo framework `rfm_rl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las métricas registradas en W&B (proyecto `tri/rfm_rl`) y a los ficheros `wandb-summary.json` incluidos en cada ejecución, pero no se proporcionan cifras en el texto disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamaño de las redes de actor, crítico y valor, que no se especifica.
- GPU recomendadas: no disponible. El autor menciona que las ejecuciones se realizaron en "AWS boxes", sin detallar el hardware.
- Compatibilidad con GPU de consumo: no determinable con la información disponible.
- Despliegue: los pesos están en formato PyTorch `.pt`, por lo que requieren el código del proyecto `rfm_rl` (rama `boost-study`) para cargarse; no son compatibles con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boost-study-best-checkpoints | Checkpoints de RL offline (IDQL/DSBC) para robótica | no disponible | no aplica | other | Hugging Face |
| jesbu1/boost-bc-flow-policies | Políticas base de comportamiento con flow matching | no disponible | no aplica | no disponible | Hugging Face |
| Alternativas de RL offline para robótica (p. ej. Diffusion Policy, IQL) | Políticas de control | no disponible | no aplica | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y las fichas de benchmarks habituales (MMLU, HumanEval, GSM8K) no aplican.
- Los checkpoints están ligados al código del proyecto `rfm_rl` (rama `boost-study`) y a las tareas concretas del entorno de simulación; no son plug-and-play fuera de ese framework.
- Faltan ejecuciones: DICE, DSRL y DSBC con K=10 en ToolHang/Stack/Pen no están incluidos porque se ejecutaron en máquinas de un colaborador, lo que limita la cobertura del estudio.
- La licencia es "other" sin términos detallados en la información disponible; es imprescindible revisar las condiciones antes de cualquier uso, incluido el comercial.
- Riesgo de sobreajuste a las tareas y seeds del estudio: solo 5 semillas por ejecución y tareas de manipulación específicas.
- Sesgos y alucinaciones no aplican en el sentido habitual; el riesgo relevante es el fallo de la política en estados fuera de la distribución de entrenamiento.
- No hay información sobre idiomas ni sobre el dataset de demostraciones subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/boost-tri-uw/boost-study-best-checkpoints
- Políticas base de comportamiento: https://huggingface.co/jesbu1/boost-bc-flow-policies
- Proyecto W&B referenciado en la model card: `tri/rfm_rl` (no se proporciona URL directa)
- No se han encontrado en la búsqueda web enlaces relevantes al modelo; los resultados obtenidos (getboost.fr, boost.vinci.com, boost.org, boost-learning.com, boostgroup.eu) corresponden a entidades no relacionadas.
