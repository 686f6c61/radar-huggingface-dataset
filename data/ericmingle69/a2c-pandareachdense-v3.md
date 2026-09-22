# EricMingle69/a2c-PandaReachDense-v3

## Resumen

`EricMingle69/a2c-PandaReachDense-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo A2C (Advantage Actor-Critic) sobre el entorno `PandaReachDense-v3` de panda-gym, una tarea de control continuo en la que un brazo robotico Franka Emika Panda, simulado en PyBullet, debe mover su efector final hasta un objetivo tridimensional. El modelo lo publica el usuario EricMingle69 como parte de la Unidad 6 del curso de Deep Reinforcement Learning de Hugging Face, y se distribuye mediante la libreria `stable-baselines3` junto con las estadisticas de normalizacion necesarias para reproducir la evaluacion.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una politica neuronal pequena (MLP) con observaciones de tipo diccionario (estado del robot y objetivos) y acciones continuas de baja dimension. Su relevancia es, por tanto, docente y experimental: sirve como referencia reproducible de un entrenamiento A2C completo (1.000.000 de pasos, 4 entornos vectorizados, `VecNormalize`) y como punto de partida para comparar algoritmos en una tarea de alcanze robotico.

El rendimiento declarado es modesto: `mean_reward` de -0,22 +/- 0,09 sobre 100 episodios deterministas, con un score (media menos desviacion) de -0,31. El repositorio no declara licencia, idiomas ni datos de entrenamiento mas alla de los hiperparametros, y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal MLP de tipo actor-critico (A2C) con politica `MultiInputPolicy`; configuracion por defecto de stable-baselines3 (dos capas de 64 unidades para politica y valor) |
| Parametros totales | no disponible (depende de las dimensiones exactas de observacion y accion del entorno) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL; no procesa secuencias de texto) |
| Tipos de cuantizacion | no aplica (checkpoint de politica en punto flotante para stable-baselines3) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | checkpoint `.zip` de stable-baselines3 (`a2c-PandaReachDense-v3.zip`) mas estadisticas `vec_normalize.pkl` |
| Algoritmo | A2C (Advantage Actor-Critic) |
| Entorno | PandaReachDense-v3 (panda-gym, simulacion PyBullet) |
| Pasos de entrenamiento | 1.000.000 timesteps |
| Entornos vectorizados | 4 |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-22 |

## Arquitectura y entrenamiento

El agente sigue el esquema estandar de A2C implementado en stable-baselines3: una politica `MultiInputPolicy` que procesa observaciones de tipo diccionario (habituales en entornos goal-conditioned de panda-gym, donde se separan observacion, objetivo alcanzado y objetivo deseado) y produce una accion continua. La model card indica explicitamente el uso de los valores por defecto de la libreria, sin modificaciones de `net_arch`, learning rate ni coeficientes de entropia. El entrenamiento empleo 4 entornos vectorizados y un envoltorio `VecNormalize(norm_obs=True, norm_reward=True, clip_obs=10.0)`, cuyas estadisticas se guardan junto al checkpoint y deben cargarse con `training=False` y `norm_reward=False` para que la evaluacion sea comparable.

El entrenamiento se realizo de forma nativa en macOS sobre Apple Silicon (arm64). Como `pybullet` no publica rueda para macOS, se compilo desde codigo fuente tras parchear el zlib incluido en `examples/ThirdPartyLibs/zlib/zutil.h`, que redefine `fdopen` a `NULL` bajo `TARGET_OS_MAC` y entra en conflicto con la declaracion real de `fdopen` en las cabeceras modernas del SDK de macOS. Este detalle es relevante para reproducibilidad: indica que el agente fue entrenado en CPU, sin CUDA, y que el proceso de instalacion no es trivial en equipos Apple. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal, RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Control continuo de un brazo robotico simulado: genera acciones para desplazar el efector final del Panda hacia un objetivo tridimensional.
- Procesamiento de observaciones estructuradas en formato diccionario (estado, objetivo alcanzado, objetivo deseado), segun el diseno de panda-gym.
- Politica determinista apta para evaluacion reproducible (`evaluate_policy` con `deterministic=True`).
- Entorno con recompensa densa (variante `Dense`), que proporciona senal de recompensa en cada paso en lugar de unicamente al alcanzar la meta.
- Compatibilidad con el ecosistema stable-baselines3 y `huggingface_sb3` para cargar el modelo desde el Hub.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades multilingues.

## Casos de uso

- Material docente para el curso de Deep Reinforcement Learning de Hugging Face: el checkpoint permite a los alumnos cargar un agente ya entrenado, inspeccionar la curva de recompensa y comparar su propio entrenamiento A2C contra una referencia fija.
- Baseline de comparacion entre algoritmos: sirve para enfrentar A2C contra PPO, SAC o TD3 en `PandaReachDense-v3` bajo el mismo presupuesto de 1.000.000 de pasos y el mismo esquema de normalizacion.
- Generacion de demostraciones para aprendizaje por imitacion: al ser una politica determinista, sus trayectorias pueden registrarse como datos de behavior cloning o como inicializacion de un agente con recompensa dispersa.
- Validacion de pipelines de normalizacion: el par checkpoint + `vec_normalize.pkl` permite comprobar que la carga correcta de estadisticas (`training=False`, `norm_reward=False`) reproduce el `mean_reward` declarado, util en pruebas de integracion de infraestructura de RL.
- Pruebas de entorno y regresion en simulacion: antes de invertir computo en entrenamientos largos, se puede verificar que panda-gym, PyBullet y las versiones de Gymnasium se comportan igual que cuando se genero el checkpoint.
- Estudio de recompensas densas frente a dispersas: al tener variantes `Dense` y no densas del mismo entorno, el agente permite medir empiricamente el efecto del shaping de recompensa en la convergencia.
- Entrenamiento e inferencia en equipos Apple Silicon sin GPU: al haberse compilado y entrenado en macOS arm64, es un caso practico de referencia para desarrolladores que no disponen de CUDA.
- Analisis de infraentrenamiento: con `mean_reward` negativo, es un ejemplo util para estudiar cuantos timesteps adicionales necesita A2C para resolver la tarea y si el cuello de botella es el algoritmo o el presupuesto.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y en la model card, obtenidos con `evaluate_policy` sobre 100 episodios en modo determinista, cargando las estadisticas de `VecNormalize` con `training=False` y `norm_reward=False`:

| Metrica | Valor |
|---|---|
| mean_reward | -0,22 |
| std_reward | 0,09 |
| score (media - desviacion) | -0,31 |
| Episodios evaluados | 100 |
| Modo de evaluacion | determinista |
| Verificado | no (verified: false) |

No se han publicado en la informacion disponible resultados comparativos con otros algoritmos ni con otros checkpoints sobre el mismo entorno.

## Requisitos de hardware

- GPU: no necesaria. La politica es un MLP pequeno y el coste dominante es la simulacion fisica en PyBullet, que se ejecuta en CPU.
- VRAM estimada: no aplica; el checkpoint se carga en memoria principal y ocupa, segun los metadatos del repositorio, menos de 0,1 GB (el Hub reporta 0,0 GB).
- GPU recomendadas: no aplica. Cualquier CPU x86-64 o arm64 moderna es suficiente para inferencia.
- Compatibilidad con GPU de consumo: irrelevante para este modelo; no aprovecha CUDA. El entrenamiento documentado se hizo en Apple Silicon.
- Opciones de despliegue: stable-baselines3 (`A2C.load`) y `huggingface_sb3` (`load_from_hub`) para descargar el checkpoint y las estadisticas desde el Hub. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Dependencias de ejecucion: `gymnasium`, `panda_gym`, `pybullet`, `stable-baselines3` y `huggingface_sb3`.
- Latencia y throughput estimados: no disponible. Dependen del coste del paso de simulacion de PyBullet con 4 entornos y del hardware, y no se documentan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de agentes alternativos sobre `PandaReachDense-v3` en la informacion proporcionada, por lo que la comparativa numerica no es posible. A continuacion se indican las alternativas naturales de la misma categoria (agentes de RL para control continuo sobre el mismo entorno), sin cifras inventadas:

| Modelo / algoritmo | Tipo | Parametros | Contexto | Rendimiento en PandaReachDense-v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| A2C (este modelo) | Actor-critico on-policy, MLP | no disponible | no aplica | mean_reward -0,22 +/- 0,09 | no disponible | HuggingFace Hub |
| PPO | Actor-critico on-policy, MLP | no disponible | no aplica | no disponible | no disponible | implementado en stable-baselines3; checkpoint no disponible |
| SAC | Actor-critico off-policy, MLP | no disponible | no aplica | no disponible | no disponible | implementado en stable-baselines3; checkpoint no disponible |
| TD3 | Actor-critico off-policy, MLP | no disponible | no aplica | no disponible | no disponible | implementado en stable-baselines3; checkpoint no disponible |

## Limitaciones y advertencias

- Rendimiento bajo en la tarea objetivo: un `mean_reward` de -0,22 indica que el agente no alcanza el objetivo de forma consistente, ya que en esta formulacion de recompensa densa el exito se aproxima a valores cercanos a 0. Con 1.000.000 de pasos, A2C se queda corto en `PandaReachDense-v3`.
- Alta varianza relativa: la desviacion tipica (0,09) es del mismo orden que la media, lo que sugiere un comportamiento inestable entre episodios.
- Resultados no verificados: el `model-index` marca el resultado como `verified: false`; no hay evaluacion independiente.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de integrarlo en un producto.
- Dependencia estricta del entorno y de las estadisticas de normalizacion: cargar el checkpoint sin `vec_normalize.pkl`, o con `training=True`, altera por completo el comportamiento de la politica y invalida cualquier comparacion con el `mean_reward` declarado.
- Solo valido en simulacion: no hay evidencia de transferencia a un robot Franka real (gap sim-to-real), ni validacion de robustez frente a cambios de dinamica, friccion o ruido de sensores.
- Sensibilidad a la distribucion de objetivos: al tratarse de una politica goal-conditioned entrenada en una unica distribucion de metas, el rendimiento puede degradarse si se modifican los rangos de muestreo.
- Sin soporte de lenguaje natural, vision, audio ni tool calling; no es adecuado como asistente conversacional ni para tareas de generacion.
- Ausencia de datos de sesgo y de composicion del dataset: no se documenta el numero de semillas ni la varianza entre ejecuciones, lo que dificulta evaluar la reproducibilidad estadistica.
- Metadatos inconsistentes: la fecha de creacion registrada (2026-09-22) es posterior a la fecha de consulta, lo que apunta a un error en los metadatos del repositorio.
- La busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces obtenidos eran de tematicas completamente ajenas y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EricMingle69/a2c-PandaReachDense-v3
- Libreria stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- Entorno panda-gym (PyBullet): https://github.com/qgallouedec/panda-gym
- Curso de Deep Reinforcement Learning de Hugging Face (Unidad 6): https://huggingface.co/learn/deep-rl-course
- Utilidad `huggingface_sb3` para cargar checkpoints: https://github.com/huggingface/huggingface_sb3
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda proporcionada.
