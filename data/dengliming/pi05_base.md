# Dengliming/pi05_base

## Resumen

Pi_05 (identificado en HuggingFace como `Dengliming/pi05_base`) es un checkpoint de la política robótica π0.5 de Physical Intelligence, adaptada por el equipo RoboDojo al entorno XPolicyLab mediante el stack OpenPI, que se gestiona con `uv` en lugar de conda. El repositorio de HuggingFace no contiene una model card propia: el README visible corresponde a la integración de XPolicyLab/policy/Pi_05 e incluye los scripts de instalación, procesamiento de datos, entrenamiento y evaluación, además de la configuración de despliegue en máquina dividida entre servidor de política y cliente de entorno. La implementación upstream de OpenPI está vendorizada dentro del directorio `openpi/`.

El modelo resuelve el problema de aprendizaje de políticas visomotoras para manipulación robótica: convierte demostraciones en formato RoboDojo a repositorios LeRobot con las claves oficiales (`observation.state`, `action`, `observation.images.cam_high`, `cam_left_wrist`, `cam_right_wrist`) y entrena políticas que se evalúan en simulador RoboDojo. El flujo cubre control conjunto (`joint`) y configuraciones de entorno tipo `arx_x5`, con entrenamiento distribuido mediante FSDP.

La relevancia actual es doble: por un lado, permite reproducir y ajustar la política π0.5 sobre un benchmark abierto con leaderboard público; por otro, este repositorio concreto de HuggingFace no declara licencia, idiomas, pipeline ni métricas, acumula 0 descargas y 0 likes, y no presenta documentación técnica propia, por lo que debe tratarse como un espejo o checkpoint de trabajo y no como una distribución oficial. La arquitectura interna, el número de parámetros y el contexto no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política visomotora π0.5 de Physical Intelligence; detalles internos no documentados en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica segun la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje conversacional; la entrada son observaciones visuales y de estado robotico) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la model card; el flujo de trabajo usa checkpoints gestionados por OpenPI en `checkpoints/<bench_name>-<ckpt_name>-<env_cfg_type>-<action_type>-<seed>/` |

## Arquitectura y entrenamiento

La información disponible indica que Pi_05 adapta la política π0.5 de Physical Intelligence al benchmark RoboDojo a través del stack OpenPI, cuyo código original está en `https://github.com/Physical-Intelligence/openpi`. Se referencia un "Pi0.5 technical report" con arXiv pendiente ("TBD"), por lo que la descripción formal de la arquitectura (tipo de transformer, mecanismo de atención, expertos de acción, etc.) no está disponible en los materiales consultados. Tampoco se especifican el número de tokens de entrenamiento ni la composición del dataset original.

El pipeline de entrenamiento sí está documentado a nivel operativo: `process_data.sh` convierte demostraciones RoboDojo en un repositorio LeRobot, conversión que debe ejecutarse dentro del entorno LeRobot fijado por OpenPI porque determina la versión del dataset. Los datos usan las claves oficiales `observation.state`, `action` y las tres cámaras `cam_high`, `cam_left_wrist` y `cam_right_wrist`. El entrenamiento se lanza con `train.sh` (parámetros: `bench_name`, `ckpt_name`, `env_cfg_type`, `action_type`, `seed`, `gpu_id`), usa la configuración por defecto `pi05_base_aloha_full_sim_arx-x5_seed_0` (sobrescribible con `OPENPI_TRAIN_CONFIG_NAME`) y reparte el trabajo con FSDP: `fsdp_devices=1` con una GPU visible y `2` en multi-GPU, ajustable mediante `OPENPI_FSDP_DEVICES`. El modo de procesamiento de datos por defecto es `image` (`OPENPI_DATA_MODE`). No se documentan fases de RLHF o DPO, ni innovaciones técnicas adicionales.

## Capacidades

- Generación de acciones robóticas para manipulación: la política produce comandos de acción a partir de observaciones de estado y de tres vistas de cámara, en el marco del benchmark RoboDojo.
- Control en espacio de articulaciones: el flujo de ejemplo usa `action_type` = `joint` sobre la configuración de entorno `arx_x5`.
- Entrenamiento y ajuste fino sobre datos propios: conversión de demostraciones RoboDojo a LeRobot y entrenamiento con semilla configurable y directorio de checkpoints determinista.
- Entrenamiento multi-GPU mediante FSDP, con control del número de dispositivos.
- Evaluación en simulador RoboDojo, con chequeo de cableado offline mediante `EVAL_ENV_TYPE=debug`.
- Despliegue en máquina dividida: scripts `setup_eval_policy_server.sh` y `setup_eval_env_client.sh` para separar el servidor de política del cliente de entorno.
- Ejecución de ablaciones de datos: el argumento `expert_data_num` permite limitar el número de episodios y `raw_task_dirs` permite generar datasets con nombre distinto a partir de todas las demostraciones de una tarea.
- Soporte de tool calling, agentes, visión general, audio o modo de razonamiento explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo opera sobre observaciones robóticas, no sobre texto multilingüe.

## Casos de uso

- Investigación en aprendizaje por imitación robótica: sirve como punto de partida reproducible para reproducir la política π0.5 sobre RoboDojo, comparar resultados en el leaderboard público y publicar ablaciones con semillas y configuraciones controladas.
- Ajuste fino sobre tareas de manipulación concretas: con `process_data.sh` se convierten las demostraciones de una tarea (por ejemplo, `stack_bowls`) a LeRobot y se entrena un checkpoint específico, verificando después en simulador con `eval.sh`.
- Ablaciones de volumen de datos: usando `expert_data_num` (por ejemplo, 50 episodios) se puede medir cuánta demostración necesita la política para alcanzar un umbral de éxito, útil para planificar la recogida de datos en laboratorio.
- Reutilización de datasets existentes: mediante `OPENPI_LEROBOT_REPO_ID` se apunta a un repositorio LeRobot ya convertido, evitando repetir la conversión y ahorrando tiempo de GPU y de CPU en el pipeline.
- Evaluación distribuida en dos máquinas: con el despliegue de máquina dividida, el servidor de política corre en una GPU y el simulador en otra máquina, lo que permite usar nodos heterogéneos y aislar la carga de simulación de la de inferencia.
- Integración en un framework de políticas comparables: al vivir dentro de XPolicyLab junto a otras políticas, permite mantener una interfaz común de argumentos, nomenclatura de checkpoints y flujo de evaluación para comparar familias de modelos robóticos bajo las mismas condiciones.
- Depuración de pipelines de evaluación sin simulador: con `EVAL_ENV_TYPE=debug` se valida el cableado completo (carga de checkpoint, transformaciones de observación, servidor de política) antes de gastar tiempo de simulación.
- Formación y prototipado docente: el flujo `install.sh` + `uv` + `train.sh`/`eval.sh` es un ejemplo compacto de cómo estructurar un proyecto de robótica aprendida con entornos gestionados y despliegue cliente-servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente remite al leaderboard del proyecto RoboDojo (`https://robodojo-benchmark.com/LeaderBoard`) como fuente de resultados oficiales, sin incluir cifras concretas para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. El único requisito documentado es la disponibilidad de al menos una GPU (el flujo admite `policy_gpu_id` y `env_gpu_id` separados) y de una GPU adicional si se usa simulación en máquina distinta.
- Entrenamiento: usa FSDP, con `fsdp_devices=1` para una GPU visible y `2` por defecto en configuraciones multi-GPU, sobrescribible con `OPENPI_FSDP_DEVICES`. Esto implica que el entrenamiento puede repartirse entre varias GPU, pero no se indican modelos concretos ni memoria mínima.
- Encaje en GPU de consumo: no disponible. No se documenta ningún requisito de memoria que permita afirmarlo o descartarlo.
- Opciones de despliegue: el stack oficial es OpenPI, gestionado con `uv` (no hay entorno conda para la política; `eval.sh` espera `uv` o una ruta explícita al proyecto OpenPI). Se contempla despliegue de máquina dividida con `setup_eval_policy_server.sh` y `setup_eval_env_client.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican al flujo descrito.
- Caché local: `OPENPI_LOCAL_CACHE_ROOT` define el directorio de caché por host para los datasets de HuggingFace y las compilaciones de JAX, con valor por defecto `/tmp/openpi-cache-$(hostname)`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de este modelo en la información proporcionada, por lo que la comparación cuantitativa no puede completarse. La siguiente tabla recoge únicamente lo que puede afirmarse con la información disponible.

| Modelo | Relación | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pi_05 (`Dengliming/pi05_base`) | Objeto de esta ficha | no disponible | no disponible | no disponible | Repositorio en HuggingFace con 0 descargas y 0 likes; sin licencia declarada |
| π0.5 original (Physical Intelligence) | Política de la que deriva esta adaptación | no disponible | no disponible | no disponible | Código en `github.com/Physical-Intelligence/openpi`; informe técnico referenciado con arXiv pendiente |
| π0 (predecesor en el ecosistema openpi) | Alternativa de la misma familia de políticas | no disponible | no disponible | no disponible | Disponible a través del repositorio OpenPI |
| Otras políticas de manipulación del benchmark RoboDojo | Alternativas evaluadas en el mismo leaderboard | no disponible | no disponible | no disponible | Resultados en `robodojo-benchmark.com/LeaderBoard` |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, por lo que no puede asumirse ningún permiso de uso comercial ni de redistribución. Cualquier uso en producción requiere aclarar la licencia con el autor y con los titulares de los derechos de la política original.
- Ausencia de model card propia: la documentación disponible es la del proyecto de integración XPolicyLab/RoboDojo, no la del checkpoint. No hay información verificable sobre datos de entrenamiento, sesgos o evaluación.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en entornos físicos, especialmente fuera de la distribución de los datos de demostración.
- Sesgos: no disponible. No se documenta la composición del dataset original ni posibles sesgos de escena, iluminación, tipos de objeto u operador.
- Limitaciones de contexto e idioma: no disponible; el modelo no es un modelo de lenguaje multilingüe y su entrada es visomotora.
- Requisitos de datos muy específicos: la conversión debe ejecutarse dentro del entorno LeRobot fijado por OpenPI porque este determina la versión del dataset; hacerlo fuera puede producir datasets incompatibles.
- Dependencia de una configuración concreta: `train_config_name` en `deploy.yml` debe coincidir con la usada en `train.sh`; una discrepancia invalida la evaluación.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-17) y la ausencia total de descargas e interacciones sugieren que se trata de un repositorio reciente, de uso personal o de un espejo de trabajo, sin validación por parte de la comunidad.
- Trazabilidad incompleta: el paper citado tiene arXiv "TBD", por lo que no puede verificarse la metodología ni las condiciones exactas de entrenamiento del modelo original.
- Entorno de ejecución no estándar: el flujo depende de `uv` y de OpenPI vendorizado, y no de un entorno conda de política; esto complica la integración con herramientas habituales del ecosistema Python.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dengliming/pi05_base
- Código original de OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Leaderboard de RoboDojo: https://robodojo-benchmark.com/LeaderBoard
- README de XPolicyLab (referenciado en la model card como `../../README.md`, sin URL pública en la información disponible)
- Informe técnico de π0.5: arXiv pendiente ("TBD"), sin enlace disponible
