# phawitbinabik/smolvla_SIM-so101-real-replay

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Esta ficha concreta, `phawitbinabik/smolvla_SIM-so101-real-replay`, es un ajuste fino de `lerobot/smolvla_base` sobre el dataset `SIM-so101-real-replay`, orientado al robot SO-101, un brazo manipulador de bajo coste de la familia SO-100.

El modelo resuelve el problema de llevar politicas VLA a hardware asequible: con 450 millones de parametros y un repositorio de 0,9 GB, puede ejecutarse en GPU de consumo, algo impensable en VLA de mayor escala. La arquitectura combina un codificador visual, un modelo de lenguaje preentrenado pequeno y un cabezal de acciones, siguiendo el diseno publicado en el paper SmolVLA (arXiv:2506.01844).

Es relevante ahora porque demuestra que el ajuste fino de politicas roboticas sobre datasets pequenos y especificos de robot es viable con recursos limitados, y porque el ecosistema LeRobot estandariza el entrenamiento, la evaluacion y el despliegue de estos modelos con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, segun SmolVLA (arXiv:2506.01844); implementada en LeRobot |
| Parametros totales | 450.292.449 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF u otras) |
| Idiomas soportados | no disponible (las instrucciones se procesan via el modelo de lenguaje interno, no documentado en esta ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | phawitbinabik/SIM-so101-real-replay |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA es una politica VLA que combina percepcion visual, comprension del lenguaje y generacion de acciones motoras en un unico modelo. La model card remite al paper arXiv:2506.01844 para los detalles arquitectonicos; en esta informacion no se especifican la composicion exacta del codificador visual, el backbone de lenguaje ni el mecanismo de decodificacion de acciones. El modelo base `lerobot/smolvla_base` es un checkpoint preentrenado de Hugging Face sobre el que se ha realizado un ajuste fino supervisado (imitation learning) con el dataset `SIM-so101-real-replay`.

El entrenamiento se ha llevado a cabo con LeRobot, cuyo flujo estandar (`lerobot-train`) permite ajustar politicas sobre datasets de demostraciones roboticas. No se dispone de informacion sobre el numero de tokens, la composicion del dataset, el numero de episodios de demostracion ni si se aplicaron tecnicas de RLHF o DPO; en el contexto de politicas de imitacion como esta, lo habitual es aprendizaje supervisado a partir de trayectorias teleoperadas, pero este dato no esta confirmado en la informacion proporcionada.

## Capacidades

- Generacion de acciones motoras para robots manipuladores a partir de observaciones visuales (camaras) e instrucciones en lenguaje natural.
- Control de un brazo robotico SO-101 (tipo `so100_follower` en LeRobot), segun el flujo de evaluacion documentado.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas del dataset de ajuste.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y registro de episodios (`lerobot-record`).
- Ejecucion en hardware de consumo gracias a su tamano reducido (450 M de parametros).
- Soporte de tool calling, agentes, razonamiento multi-paso, vision general, audio o modo thinking: no disponible; el modelo esta especializado en control robotico, no en tareas de proposito general.

## Casos de uso

- Manipulacion robotica en laboratorio con SO-101: el modelo recibe imagenes de las camaras del brazo y una instruccion textual, y emite comandos de accion para completar tareas de pick-and-place aprendidas del dataset de ajuste.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el efecto de datasets simulados frente a reales (el nombre del dataset sugiere una mezcla SIM/real-replay) en el rendimiento de politicas VLA.
- Prototipado rapido en robotica de bajo coste: al caber en GPU de consumo y pesar menos de 1 GB, permite iterar en estaciones de trabajo sin infraestructura de centro de datos.
- Evaluacion comparativa de politicas: con `lerobot-record` y `--episodes=10` se pueden generar conjuntos de evaluacion estandarizados para comparar este ajuste con otras variantes de SmolVLA sobre el mismo robot.
- Educacion y docencia en robotica: el flujo de LeRobot (entrenar, registrar, evaluar) es adecuado para cursos practicos de VLA con hardware asequible.
- Despliegue embebido en el propio robot: el tamano del checkpoint (0,9 GB) y el numero de parametros permiten plantear inferencia en equipos con GPU modestas integradas en la celda robotica.
- Reproduccion de experimentos: al estar publicado en el Hub con licencia Apache 2.0, cualquier equipo puede descargarlo y replicar el ajuste sobre el dataset indicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de tarea ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 M de parametros en safetensors (0,9 GB en el repo), la inferencia en fp32 requeriria del orden de 1,8 GB de VRAM solo para pesos, y en fp16/bf16 alrededor de 0,9 GB, mas el coste de activaciones y buffers de vision. Estas cifras son estimaciones a partir del tamano, no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU con al menos unos pocos GB de VRAM libre deberia poder alojar los pesos.
- GPU de consumo: previsiblemente si, dado el tamano del modelo y la afirmacion de la model card de que SmolVLA "can be deployed on consumer-grade hardware"; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no son el runtime habitual para politicas de accion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phawitbinabik/smolvla_SIM-so101-real-replay | 450.292.449 | no disponible | VLA para SO-101 | apache-2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible en esta informacion | no disponible | VLA base preentrenado | no disponible en esta informacion | Hugging Face (LeRobot) |
| Otras politicas LeRobot (ACT, Diffusion Policy) | no disponible | no disponible | Politicas de imitacion | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado para el robot SO-101 y el dataset `SIM-so101-real-replay`; su comportamiento fuera de ese dominio (otro robot, otras tareas, otras camaras) no esta garantizado.
- Riesgo de sobreajuste al dataset de ajuste: al tratarse de un fine-tune sobre un dataset concreto, puede fallar ante variaciones de iluminacion, posicion de objetos o configuracion fisica no representadas en las demostraciones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de exito ni de robustez; cualquier uso en produccion requiere evaluacion propia con `lerobot-record`.
- Idiomas e instrucciones: no se documenta que idiomas comprende el componente de lenguaje; conviene validar las instrucciones en el idioma de uso antes de desplegar.
- Sesgos: no se documentan sesgos especificos, pero al derivar de un modelo base y de un dataset de simulacion/real concreto, puede heredar sesgos de las demostraciones (posiciones, objetos y entornos limitados).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; la responsabilidad sobre el comportamiento fisico del robot recae en el integrador.
- Seguridad fisica: es una politica de control motora; deben implementarse limites de par, paradas de emergencia y supervision humana en cualquier despliegue real.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni reportes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/smolvla_SIM-so101-real-replay
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/phawitbinabik/SIM-so101-real-replay
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
