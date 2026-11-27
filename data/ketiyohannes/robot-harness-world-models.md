# ketiyohannes/robot-harness-world-models

## Resumen

`robot-harness-world-models` es una coleccion de checkpoints entrenados del proyecto de investigacion [ketiyohannes/robot-harness](https://github.com/ketiyohannes/robot-harness), un framework de planificacion basado en modelos del mundo para control robotico. El modelo implementa el paradigma "Imagine → Verify → Act": el agente genera planes candidatos mediante el metodo de muestreo CEM (Cross-Entropy Method) usando un ensemble de dinamica aprendido, verifica los mejores k planes en el simulador real contra una especificacion de seguridad expresada en Logica Temporal de Senales (STL) y solo entonces ejecuta la accion. No es un modelo de lenguaje: es un modelo de dinamica para reinforcement learning basado en modelo.

La relevancia tecnica reside en el mecanismo de verificacion: en lugar de confiar ciegamente en las predicciones del world model, los planes se validan en el simulador MuJoCo antes de actuar. Esto reduce drasticamente las violaciones de seguridad a costa de un mayor consumo de pasos de simulador. Los checkpoints cubren dos tareas de empuje (push): una planar con estado de 10 dimensiones y accion de 2 dimensiones, y una con el brazo Franka Panda con estado de 21 dimensiones y accion de 3 dimensiones.

El repositorio incluye tambien baselines model-free (SAC y PPO via Stable-Baselines3), un world model preentrenado solo con 20k pasos aleatorios y los logs de evaluacion held-out sobre 30 escenas. El tamano del repositorio es de 0,1 GB, coherente con ensembles de MLPs pequenos (5 miembros, 3 capas ocultas de 200 unidades).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 MLPs de dinamica (3 capas ocultas de 200 unidades, activacion SiLU) |
| Parametros totales | No disponible (MLPs pequenos; el repo completo ocupa 0,1 GB incluyendo baselines) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de dinamica estado-accion, no secuencial) |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch en punto flotante) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt` para ensembles, `.zip` para baselines Stable-Baselines3) |

Dimensiones de entrada/salida por tarea:

| Tarea | Estado | Accion | Salida |
|---|---|---|---|
| Planar push (`push`, `push_safely`) | 10-D | 2-D | Delta de estado |
| Franka Panda arm push (`arm_push_safely`) | 21-D | 3-D | Delta de estado |

## Arquitectura y entrenamiento

Cada world model es un ensemble de 5 MLPs independientes que predicen el delta de estado dado el estado actual y la accion. La entrada se normaliza internamente con estadisticas almacenadas como buffers del modulo PyTorch. La incertidumbre del ensemble se usa como penalizacion en la planificacion (las configuraciones con sufijo `lam0` desactivan dicha penalizacion). La planificacion se realiza con CEM sobre el modelo aprendido; en las variantes verificadas, los top-k planes se ejecutan en el simulador MuJoCo (con snapshot/restore bit-exacto) y se filtran contra la especificacion STL de seguridad antes de seleccionar la accion final.

El entrenamiento del world model es online: el ensemble se aprende a partir de la experiencia recolectada por el propio agente durante la interaccion con el simulador. Existe ademas un checkpoint `pretrain_only` entrenado unicamente con 20.000 pasos de acciones aleatorias en la tarea planar. No se especifica en la informacion disponible el numero total de tokens ni pasos de entrenamiento por configuracion, ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). La exploracion en el brazo usa un explorador de waypoints con forma de tarea, compartido por todos los metodos para una comparacion justa.

## Capacidades

- Prediccion de dinamica estado-accion para dos tareas MuJoCo de empuje (planar y Franka Panda).
- Planificacion por CEM sobre el modelo aprendido, con penalizacion de incertidumbre del ensemble.
- Verificacion de seguridad de planes contra especificaciones STL en el simulador real (variantes `C_verify_k4`, `E_verify_k2`, `F_verify_k8`).
- Fallback de seguridad "hold still" cuando ningun plan verificado supera la especificacion (`G_verify_k4_stop`).
- Estimacion de incertidumbre via varianza del ensemble de 5 miembros.
- Aprendizaje online del modelo de dinamica durante la interaccion.
- No soporta tool calling, function calling, agentes multi-paso en el sentido de LLM, ni capacidades multilingues, de vision o audio.

## Casos de uso

- Investigacion en RL basado en modelo con restricciones de seguridad: usar los checkpoints `C_verify_k4` y `G_verify_k4_stop` como referencia reproducible para comparar metodos de planificacion segura en MuJoCo, dado que incluyen logs, configuraciones y evaluacion held-out.
- Desarrollo de planificadores con verificacion en simulador: integrar `IVAAgent` de `planners/agent.py` en pipelines propios para experimentar con el bucle Imagine-Verify-Act sobre nuevas tareas de empuje.
- Estudio de la relacion coste-seguridad en planificacion: comparar las configuraciones con k=1, k=2, k=4 y k=8 para medir el compromiso entre exito, violaciones de seguridad y pasos de simulador consumidos (de 120 a 1040 pasos por episodio).
- Ablacion de penalizacion de incertidumbre: las variantes `D_*_lam0` permiten aislar el efecto de la penalizacion del ensemble sobre el rendimiento y la seguridad.
- Benchmark de baselines model-free: los checkpoints SAC y PPO de Stable-Baselines3 sirven como referencia para comparar metodos model-based frente a model-free en las mismas tareas.
- Preentrenamiento de world models con datos aleatorios: el checkpoint `pretrain_only` (20k pasos aleatorios) es util para estudiar el arranque en frio y la calidad de la dinamica aprendida sin exploracion dirigida.
- Docencia y reproduccion de experimentos: el repositorio incluye scripts (`scripts/record_arm_traces.py`) y ficheros de evaluacion que facilitan la reproduccion de resultados en entornos academicos.

## Benchmarks y rendimiento

Resultados del brazo (100k pasos reales de simulador, 30 escenas held-out, media ± desviacion tipica entre semillas):

| Metodo | Semillas | Exito | Episodios con violacion de seguridad | Pasos reales / episodio |
|---|---|---|---|---|
| B: sin verificacion | 5 | 33% ± 4 | 51% ± 6 | 120 |
| C: verificado, k = 4 | 5 | 70% ± 2 | 1% ± 2 | 1040 |
| G: C + fallback hold-still | 3 | 83% ± 5 | 0% ± 0 | 1040 |
| SAC | 3 | 0% | 7% ± 3 | 120 |
| PPO (1M pasos) | 3 | 0% | 0% | 120 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje. Las tablas completas de ablaciones y limitaciones estan en `RESULTS.md` y `RESULTS_ARM.md` del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los ensembles son MLPs de pocos cientos de miles de parametros y el repositorio completo ocupa 0,1 GB, por lo que caben holgadamente en cualquier GPU consumer (incluso en CPU para inferencia).
- GPU recomendadas: cualquier GPU con soporte CUDA y PyTorch; no se requiere hardware de gama alta. El cuello de botella es el simulador MuJoCo y la ejecucion de ramas de verificacion, no el modelo.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 3060, RTX 4090, etc.); tambien en CPU para inferencia del ensemble.
- Opciones de despliegue: PyTorch nativo (carga via `DynamicsEnsemble.load(...)`), Stable-Baselines3 para los baselines. No se contemplan vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste dominante es el numero de pasos de simulador por episodio (120 en configuraciones sin verificacion, 1040 con verificacion k=4 o k=8).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| robot-harness world models (este) | Ensemble MLP de dinamica + CEM + verificacion STL | No disponible (MLPs pequenos) | No aplica | 83% exito, 0% violaciones (G, brazo) | Apache 2.0 | Hugging Face + GitHub |
| SAC (baseline incluido) | Model-free RL | No disponible | No aplica | 0% exito, 7% violaciones (brazo) | Apache 2.0 (via SB3) | Incluido en el repo |
| PPO (baseline incluido) | Model-free RL | No disponible | No aplica | 0% exito, 0% violaciones (brazo, 1M pasos) | Apache 2.0 (via SB3) | Incluido en el repo |

No se dispone en la informacion proporcionada de comparaciones con otros world models publicos (por ejemplo, Dreamer, TD-MPC o similares) ni de sus cifras en estas mismas tareas.

## Limitaciones y advertencias

- Los checkpoints son exclusivamente de investigacion para dos tareas de simulacion MuJoCo; el autor indica explicitamente que no estan pensados para robots reales.
- La verificacion depende de snapshot/restore bit-exacto del simulador, lo que limita su traslado a entornos fisicos con ruido e incertidumbre.
- La exploracion del brazo usa un explorador de waypoints con forma de tarea compartido por todos los metodos, lo que puede favorecer o sesgar la comparacion.
- El coste de la verificacion es alto: 1040 pasos reales de simulador por episodio frente a 120 sin verificacion (un factor de aproximadamente 8,7).
- Los baselines model-free (SAC, PPO) obtienen 0% de exito en el brazo, por lo que la comparativa en esa tarea es poco informativa sobre la calidad relativa de los metodos.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el modelo no procesa lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion en hardware real desaconseja su despliegue en produccion fisica sin trabajo adicional.
- El numero de semillas es bajo (3-5), lo que limita la significancia estadistica de las diferencias entre configuraciones.

## Enlaces

- Hugging Face: https://huggingface.co/ketiyohannes/robot-harness-world-models
- Repositorio GitHub: https://github.com/ketiyohannes/robot-harness
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs o demos.
