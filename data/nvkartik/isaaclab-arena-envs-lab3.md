# nvkartik/isaaclab-arena-envs-lab3

## Resumen

`nvkartik/isaaclab-arena-envs-lab3` no es un modelo de lenguaje, sino un repositorio de integracion de entornos de simulacion robotica. Concretamente, es una migracion de `nvidia/isaaclab-arena-envs` a la version actual de Isaac Lab-Arena, cuyo objetivo es conectar los entornos de simulacion de NVIDIA con el framework LeRobot de HuggingFace. La construccion de la simulacion y el adaptador de lotes por GPU permanecen en EnvHub, mientras que la clase `IsaaclabArenaEnv` de LeRobot y su procesador de observaciones actuan como punto de integracion.

El repositorio publica resultados de evaluacion de politicas aprendidas sobre el robot GR1 (tarea de microondas) usando los checkpoints pi0.5 y SmolVLA, ademas de un contrato de versiones estricto entre Isaac Sim, Isaac Lab, PyTorch, Transformers y LeRobot. Es relevante porque documenta una migracion funcional de una pila de simulacion robotica y aporta verificacion tensorial completa de los checkpoints evaluados, con cifras concretas de exito.

Conviene subrayar que no existe informacion sobre pesos de modelo, arquitectura neuronal propia, idiomas ni licencia en la informacion proporcionada. La mayor parte de los campos habituales de una ficha de modelo quedan por tanto como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; es una integracion de entornos de simulacion robotica (Isaac Lab-Arena + LeRobot) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo de integracion, no pesos) |
| Tipo de artefacto | Repositorio de codigo/entornos para simulacion robotica |
| Robot objetivo | GR1 (variante `gr1_joint`, dimension de estado 54, dimension de accion 36) |
| Entorno de ejemplo | `gr1_microwave` |
| Version de Isaac Sim probada | 6.1.0-rc.26+release.49347.2d230af4.gl |
| Version de Isaac Lab probada | commit `91a0906f93802eb859192dcb0bca879f891e92d6` (VERSION 3.0.0) |
| Version de Arena probada | commit `66baca74d685377d72755385822315d7d7fad8ac` |
| Revision de LeRobot probada | `d1caa2c95503eba595a7034f26ad2221d19748a5` (rama `feat/arena-current-integration` de `nv-sachdevkartik/lerobot`) |
| Python | 3.12.13 |
| PyTorch / TorchVision | 2.11.0+cu128 / 0.26.0+cu128 |
| NumPy / OpenCV headless | 2.3.1 / 4.13.0.92 |
| Transformers / packaging | 5.5.4 / 26.0 |
| Gymnasium / Pinocchio | 1.4.0 / 3.9.0 |
| GPU de prueba / driver | RTX PRO 6000 Blackwell 97.887 MiB / 570.211.01 |

## Arquitectura y entrenamiento

El repositorio no describe el entrenamiento de ningun modelo neuronal. Lo que implementa es una capa de integracion entre dos pilas de software: por un lado Isaac Lab-Arena, que aporta la construccion de la escena de simulacion mediante APIs tipadas como `ArenaEnvironmentFactory.build`, `EnvironmentRegistry.get_environment_cfg_type` y `ArenaEnvBuilderCfg`; por otro lado LeRobot, que aporta el bucle de evaluacion (`lerobot_eval.rollout`), el procesador de observaciones y la carga de checkpoints de politicas como pi0.5 y SmolVLA.

Un detalle tecnico relevante es el conflicto de dependencias en torno a Transformers. La integracion fija Transformers 5.5.4 como excepcion explicita al pin 5.10.4 del instalador de Isaac Lab. Segun el autor, una comparacion en meta-dispositivo del checkpoint pi0.5 fijo coincidio en los 813 nombres y formas de parametros convertidos sobre 5.5.4, mientras que sobre 5.10.4 el espacio de nombres de vision aplanado de SigLIP provocaba 437 claves ausentes y 437 inesperadas. No se anade remapeo de checkpoint. En cuanto a datos de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO), no hay informacion disponible, ya que este artefacto no entrena modelos.

## Capacidades

- Orquestacion de simulacion robotica: ejecuta entornos de Isaac Lab-Arena para el robot GR1, incluyendo la tarea `gr1_microwave`.
- Soporte de procesamiento por lotes: validado con tamanos de lote uno y dos (`--num-envs 1` y `--num-envs 2`).
- Observaciones con camaras: soporta claves de camara por slot (`robot_pov_cam_rgb`), con warmup del renderizador y verificacion de imagen no constante (rango de pixeles y varianza), guardando un PNG por slot.
- Integracion con el bucle de evaluacion de LeRobot: llamada real a `lerobot_eval.rollout` con propagacion de tareas, comprobaciones de exito/done y callbacks de render por slot.
- Evaluacion de politicas aprendidas: pi0.5 y SmolVLA sobre GR1.
- Verificacion de checkpoints: comprobacion de todos los tensores de modelo (813 tensores para pi0.5, 500 para SmolVLA).
- Comprobacion de exit nativo: validacion de que el proceso termina con codigo 0 sin procesos hijo del simulador remanentes.
- Pruebas de adaptador en CPU: 83 pruebas externas del adaptador con los assets opcionales fijados; 84 comprobaciones enfocadas del nucleo.
- Soporte de CLI: pasa el punto de entrada exacto de LeRobot CLI (2/2 episodios, guardando metricas y videos).

No hay informacion disponible sobre capacidades de generacion de texto, razonamiento, codigo, matematicas o vision propiamente dichas del modelo, ya que se trata de un artefacto de simulacion.

## Casos de uso

- Investigacion en robotica de manipulacion: usar los entornos GR1 de Isaac Lab-Arena dentro de LeRobot para reproducir experimentos de politicas como pi0.5 o SmolVLA con un contrato de versiones fijo y reproducible.
- Evaluacion reproducible de politicas aprendidas: el runner permite ejecutar episodios con semillas concretas (por ejemplo, semillas 42-91) y comparar tasas de exito con intervalos de confianza de Wilson, util para publicaciones academicas.
- Integracion continua de politicas roboticas: el paso por el punto de entrada de LeRobot CLI y las comprobaciones de exit nativo permiten incorporar la evaluacion de una politica en un pipeline de CI, detectando fallos de carga de checkpoint o de simulacion.
- Validacion de checkpoints antes del despliegue: la verificacion de todos los tensores (813 para pi0.5, 500 para SmolVLA) sirve para confirmar que un checkpoint se carga realmente y no devuelve pesos sin entrenar.
- Pruebas de regresion de la pila de simulacion: las comprobaciones aleatorias de politica (`scripts/random_policy_smoke.py`) con lote uno y dos y con camaras permiten detectar roturas en el adaptador al actualizar Isaac Sim, Isaac Lab o Arena.
- Desarrollo de nuevos entornos Arena: al migrar a las APIs actuales de Arena, sirve de plantilla para quien necesite conectar nuevos entornos de simulacion con LeRobot.
- Depuracion de dependencias: la documentacion del conflicto Transformers 5.5.4 frente a 5.10.4 resulta util para equipos que integren SigLIP o PI05 en su propia pila.

## Benchmarks y rendimiento

Los datos del autor se refieren a evaluaciones de politicas sobre el entorno GR1, no a benchmarks de modelos de lenguaje.

| Evaluacion | Resultado | Detalles |
|---|---|---|
| pi0.5 (GR1, tras correccion de camara) | 50/50 exitos (100%; intervalo de Wilson 95% 92,87-100%) | Semillas 42-91; 813 tensores de checkpoint verificados; 354 segundos; 5 videos decodificados |
| pi0.5 (ejecucion anterior, antes de la correccion de camara) | 49/50 | Retenida aparte; el autor indica que no establece una ganancia causal de rendimiento |
| SmolVLA (GR1, smoke test) | 2/2 episodios (semillas 42-43) | 500 tensores verificados; 9,13 segundos; intervalo de Wilson 95% 34,24-100%, por lo que no establece una estimacion fiable de tasa de exito |
| Pruebas del adaptador | 84 comprobaciones enfocadas del nucleo; 83 pruebas de adaptador en CPU externas | Con assets opcionales fijados |
| Punto de entrada LeRobot CLI | 2/2 episodios | Metricas y videos guardados; comprobaciones de exit nativo superadas |

El propio autor advierte que la muestra de SmolVLA es demasiado pequena para fijar una tasa de exito fiable y que los resultados no demuestran una mejora causal. No hay datos de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPU de prueba registrada: NVIDIA RTX PRO 6000 Blackwell con 97.887 MiB de VRAM y driver 570.211.01.
- Al tratarse de simulacion robotica con Isaac Sim 6.1.0-rc, se requiere una GPU con soporte para CUDA (PyTorch 2.11.0+cu128) y con capacidad para renderizar las camaras del entorno.
- No hay informacion disponible sobre VRAM minima, latencia de inferencia o throughput del modelo, ni sobre su encaje en GPU de consumo (RTX 4090, etc.).
- Tiempos de ejecucion reportados por el autor: 354 segundos para la evaluacion pi0.5 de 50 episodios y 9,13 segundos para el smoke test de SmolVLA de 2 episodios. No se desglosan tasas por episodio.
- Opciones de despliegue: el propio README indica seguir la receta de instalacion incluida, que compila Arena y ejecuta sus ejemplos, e instala LeRobot en un contenedor de integracion separado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Se ejecuta bajo Python 3.12.13 con el par Torch/TorchVision 2.11.0+cu128 / 0.26.0+cu128.

## Comparativa con modelos similares

Este artefacto pertenece a la categoria de entornos de simulacion para robotica integrados con LeRobot, por lo que las alternativas naturales serian otros repositorios de integracion.

| Repositorio | Tipo | Estado |
|---|---|---|
| nvidia/isaaclab-arena-envs | Integracion original de NVIDIA para Isaac Lab-Arena | Origen de la migracion descrita |
| nvkartik/isaaclab-arena-envs-lab3 | Migracion a Arena actual + LeRobot | Objeto de esta ficha |
| Otros entornos LeRobot (no especificados) | Integraciones de simulacion | no disponible |

No hay datos suficientes en la informacion proporcionada para comparar parametros, contexto, rendimiento o licencia con alternativas de forma cuantitativa, dado que no se trata de modelos neuronales.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una arquitectura neuronal; no debe evaluarse con los criterios habituales de ficha de modelo.
- El propio autor indica que los resultados validan las tuplas politica/tarea registradas, no todas las politicas o entornos.
- La prueba con SmolVLA (2/2 episodios) tiene un intervalo de Wilson de 34,24-100%, por lo que no permite establecer una tasa de exito fiable.
- Los resultados de pi0.5 no demuestran una ganancia causal de rendimiento respecto a la ejecucion anterior de 49/50; la correccion de camara es la diferencia documentada.
- Se requiere un contrato de versiones muy estricto (Isaac Sim 6.1.0-rc, Isaac Lab commit concreto, Arena commit concreto, revision concreta de LeRobot). La pila antigua (Isaac Sim 5.1 / Isaac Lab 2.3 / Arena 0.1.1) no es el objetivo de esta migracion.
- La integracion fija Transformers 5.5.4 como excepcion al pin 5.10.4 de Isaac Lab; con 5.10.4 el espacio de nombres de SigLIP provoca 437 claves ausentes y 437 inesperadas en el checkpoint pi0.5. No se anade remapeo de checkpoint.
- El instalador registra conflictos de paquetes heredados; que la instalacion pase no implica que todos los componentes opcionales GR00T/OpenPI/Isaac Lab tengan un cierre de dependencias limpio.
- La revision base original `b9cb121` es insuficiente por si sola: su cargador PI05 puede devolver pesos sin entrenar de forma silenciosa tras un fallo de carga de checkpoint.
- No hay informacion disponible sobre licencia, sesgos, alucinacion, limitaciones de contexto o idioma, ni restricciones de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento consultado, por lo que su validacion externa por la comunidad es nula.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/nvkartik/isaaclab-arena-envs-lab3
- Repositorio LeRobot probado (rama `feat/arena-current-integration`): `nv-sachdevkartik/lerobot`, revision `d1caa2c95503eba595a7034f26ad2221d19748a5`
- Receta de instalacion incluida en el repositorio: `setup/README.md` (incluye la receta fijada de SmolVLA)
- Script de smoke test aleatorio: `scripts/random_policy_smoke.py`
- Repositorio de origen de la migracion: `nvidia/isaaclab-arena-envs` (referenciado en la model card)
- No se proporcionan enlaces a papers, blogs, repositorios adicionales o demos en la informacion disponible.
