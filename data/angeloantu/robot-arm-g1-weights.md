# angeloantu/robot-arm-g1-weights

## Resumen

Robot_arm: G1 cup pyramid controllers es una coleccion de controladores entrenados para un humanoide simulado Unitree G1 equipado con una mano Shadow de cinco dedos, todo ello dentro del simulador fisico MuJoCo. El modelo resuelve una tarea de manipulacion diestra con contacto rico: apilar tres vasos en forma de piramide y lanzar una tapa de botella dentro del vaso superior. Los controladores se aprenden a partir de videos de telefono de una persona realizando la misma tarea, combinando imitation learning y reinforcement learning.

El repositorio, publicado por angeloantu bajo licencia MIT, no contiene un modelo de lenguaje sino un conjunto de pesos de politicas de control (10 controladores de unos 66 MB en total mas un modelo VLA de 1,2 GB basado en SmolVLA fine-tuneado). Es relevante porque documenta de forma reproducible el rendimiento de distintas familias de politicas (MLP con chunking, diffusion policy, PPO y behavior cloning) sobre el mismo hardware simulado, con y sin limites realistas de actuacion.

La ficha cubre exclusivamente la informacion disponible en el repositorio de HuggingFace y en la model card; los datos no publicados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas de control para robotica: MLP con chunking (imitation), diffusion policy, PPO (RL) y VLA basado en SmolVLA fine-tuneado |
| Parametros totales | No disponible (el repo pesa 1,3 GB; los 10 controladores suman 66 MB y el VLA 1,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de control robotico, sin entrada/salida de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors y policy.pt (PyTorch); el VLA usa el formato de LeRobot |

## Arquitectura y entrenamiento

El repositorio agrupa cuatro familias de politicas entrenadas sobre el mismo entorno MuJoCo (Unitree G1 con mano Shadow). La primera es imitation learning con un MLP que predice chunks de acciones (`runs/chunk_6k_elbow`), la segunda es diffusion policy (`runs/dp_6k_elbow`), la tercera es reinforcement learning con PPO (`runs/toss4k_ppo_small`) y la cuarta es behavior cloning simple (`runs/toss4k_bc`). Adicionalmente se incluye un VLA fine-tuneado a partir de SmolVLA (`runs/vla_smolvla3`), que se ejecuta en su propio entorno con LeRobot.

Los datos de entrenamiento provienen de videos de telefono de una persona realizando la tarea, lo que constituye una fuente de demostraciones de bajo coste. El repositorio distingue dos regimenes de evaluacion: un simulador "Perfect" y un simulador con "Real-world limits" (`G1_REAL=1`), que introduce restricciones de actuacion mas cercanas al hardware fisico. Cada carpeta incluye un `history.json` con el registro de entrenamiento. Todos los controladores requieren la variable `G1_HAND=shadow`.

## Capacidades

- Manipulacion diestra simulada: apilado de tres vasos en piramide y lanzamiento de una tapa de botella al vaso superior.
- Control de un humanoide Unitree G1 con mano Shadow de cinco dedos en MuJoCo.
- Imitation learning a partir de videos de telefono (chunked MLP y diffusion policy).
- Reinforcement learning con PPO para la tarea de lanzamiento.
- Behavior cloning como linea base de imitacion.
- Vision-lenguaje-accion (VLA) mediante SmolVLA fine-tuneado, ejecutable con LeRobot.
- Evaluacion en layouts no vistos (48 intentos por vaso, 96 por lanzamiento).
- No soporta tool calling, agentes de texto ni capacidades multilingues: es un modelo de control motor, no un LLM.

## Casos de uso

- Investigacion en imitation learning desde video: comparar MLP con chunking frente a diffusion policy sobre la misma tarea y el mismo simulador, usando los 10 controladores como lineas base reproducibles.
- Benchmark de robustez sim-a-real: emplear el modo `G1_REAL=1` para medir la caida de rendimiento al introducir limites de actuacion realistas antes de transferir a hardware.
- Estudio de RL frente a imitacion en tareas de contacto: la tarea de lanzamiento permite contrastar PPO (52% en Perfect) con diffusion policy (61%) y BC (40%) bajo identicas condiciones.
- Desarrollo de pipelines VLA: el checkpoint SmolVLA fine-tuneado sirve como punto de partida para experimentos de vision-lenguaje-accion con LeRobot sobre el G1.
- Docencia en robotica de manipulacion: el repositorio incluye codigo, instrucciones de descarga y registros de entrenamiento, lo que facilita reproducir el setup completo en MuJoCo.
- Evaluacion de generalizacion a layouts no vistos: el protocolo de 48 y 96 intentos por tarea permite medir robustez espacial de cada politica.
- Prototipado de tareas de apilado y lanzamiento en humanoides simulados antes de invertir en un gemelo digital de mayor fidelidad.

## Benchmarks y rendimiento

Resultados de exito publicados en la model card (evaluacion sobre layouts no vistos: 48 intentos por vaso, 96 por lanzamiento).

| Simulador | Tarea | Controlador | Ruta | Exito |
|---|---|---|---|---|
| Perfect | Vasos A / B / superior | Imitation (chunked MLP) | `runs/chunk_6k_elbow/policy.pt` | 100 / 100 / 79% |
| Perfect | Vasos A / B / superior | Diffusion policy | `runs/dp_6k_elbow/policy.pt` | 100 / 85 / 44% |
| Perfect | Lanzamiento | Diffusion policy | `runs/toss4k_dp_elbow/policy.pt` | 61% |
| Perfect | Lanzamiento | RL (PPO) | `runs/toss4k_ppo_small/policy_iter40.pt` | 52% |
| Perfect | Lanzamiento | Imitation (BC) | `runs/toss4k_bc/policy.pt` | 40% |
| Real-world limits | Vasos A / B / superior | Imitation (chunked MLP) | `runs/real_place_chunk/policy.pt` | 98 / 69 / 38% |
| Real-world limits | Vasos A / B / superior | RL (PPO) | `runs/real_place_ppo/policy.pt` | 100 / 52 / 35% |
| Real-world limits | Lanzamiento | Diffusion policy | `runs/real2_toss_dp/policy.pt` | 9% |
| Real-world limits | Lanzamiento | RL (PPO) | `runs/real2_toss_ppo/policy.pt` | 7% |
| Real-world limits | Lanzamiento | Imitation (BC) | `runs/real2_toss_bc/policy.pt` | 5% |
| Real-world limits | Todas | VLA (SmolVLA fine-tuneado) | `runs/vla_smolvla3/` | 69 / 25 / 19%, lanzamiento 6% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Los 10 controladores suman 66 MB, por lo que caben holgadamente en cualquier GPU consumer; el VLA de 1,2 GB requiere un entorno LeRobot aparte.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cualquier GPU con al menos unos pocos GB de VRAM deberia ejecutar los controladores; el VLA se beneficia de GPUs con mayor memoria.
- Cabe en GPU consumer: si, dado el reducido tamano de los checkpoints (66 MB los controladores, 1,2 GB el VLA).
- Opciones de despliegue: ejecucion directa con PyTorch sobre MuJoCo (`policy.pt`); el VLA requiere LeRobot en su propio entorno. No se documentan vLLM, llama.cpp, Ollama ni TGI, al no ser un LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Variables de entorno obligatorias: `G1_HAND=shadow` en todos los controladores; `G1_REAL=1` adicional en los de limites realistas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Robot_arm G1 cup pyramid controllers | Politicas de control (MLP, diffusion, PPO, VLA) | No disponible (66 MB controladores; 1,2 GB VLA) | No aplica | Hasta 100% en apilado Perfect; 61% en lanzamiento | MIT | HuggingFace + GitHub |
| Diffusion Policy (referencia original) | Diffusion policy para manipulacion | No disponible | No aplica | No comparable directamente en esta tarea | No disponible | Codigo publico |
| SmolVLA (base del VLA incluido) | VLA | No disponible en esta ficha | No disponible | No disponible | No disponible | HuggingFace |
| ACT / chunked MLP (linea base de imitacion) | Imitation learning | No disponible | No aplica | No comparable directamente en esta tarea | No disponible | Codigo publico |

La comparativa con alternativas externas no dispone de cifras homogeneas en la informacion proporcionada; los datos de la tabla de benchmarks interna son la referencia mas fiable.

## Limitaciones y advertencias

- Modelo de control robotico, no de lenguaje: no procesa texto ni soporta tool calling, agentes conversacionales ni capacidades multilingues.
- Rendimiento dependiente del simulador: en modo "Real-world limits" el exito cae drasticamente (lanzamiento entre 5% y 9% en las tres politicas clasicas), lo que limita la transferencia directa a hardware real.
- La tarea de apilado del vaso superior es fragil incluso en Perfect (44% con diffusion policy, 79% con imitation).
- El VLA fine-tuneado rinde por debajo de las politicas especializadas en todas las tareas (69 / 25 / 19% y 6% en lanzamiento).
- Requiere variables de entorno especificas (`G1_HAND=shadow`, `G1_REAL=1`) y rutas de fichero concretas (`runs/<name>/policy.pt`); un uso incorrecto provoca fallos de carga.
- El VLA necesita un entorno LeRobot separado, lo que anade complejidad de despliegue.
- Sin datos publicados sobre sesgos, alucinacion o comportamiento fuera de distribucion mas alla de los layouts no vistos evaluados.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- No se documentan limitaciones de contexto ni de idioma porque no aplican a este tipo de modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/angeloantu/robot-arm-g1-weights
- Codigo, resultados e instrucciones: https://github.com/ANGELOANTU7/Robot_arm
- Descarga de controladores: `python scripts/download_models.py` (10 controladores, 66 MB)
- Descarga del VLA: `python scripts/download_models.py --vla` (1,2 GB)
- No se han encontrado en la busqueda web papers, blogs ni demos adicionales distintos de los enlaces anteriores.
