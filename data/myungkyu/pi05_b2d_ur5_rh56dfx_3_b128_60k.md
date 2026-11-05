# Myungkyu/pi05_b2d_ur5_rh56dfx_3_b128_60k

## Resumen

pi05_b2d_ur5_rh56dfx_3_b128_60k es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo base lerobot/pi05_base (Pi0.5), entrenado sobre demostraciones de teleoperación del benchmark Bench2Dex para tres configuraciones concretas de manipulación con un robot UR5 equipado con manos RH56DFX. El modelo no es un LLM conversacional, sino una política robótica que transforma observaciones visuales multicámara, el estado articular y una instrucción en lenguaje natural en objetivos de posición articular absolutos.

El problema que resuelve es el de servir como baseline reproducible ("vanilla Pi0.5") para el benchmark Bench2Dex, un conjunto de tareas de manipulación diestra con protocolo de doble entorno (servidor de política + cliente Isaac Sim). Su relevancia es metodológica: permite comparar variantes de Pi0.5 y de otros VLA sobre las mismas tareas, canales de evaluación y semillas, con checkpoints intermedios publicados para estudiar la evolución del entrenamiento.

Arquitectura Pi0.5 (transformer VLA con flow matching), 4.143.404.816 parámetros totales, ventana de acción de 50 pasos, 10 pasos de flow matching, entrenamiento en bf16 con batch 128 durante 60.000 pasos. El repositorio ocupa 112,2 GB e incluye el checkpoint final y once checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (VLA transformer con flow matching), chunk 50, n_action_steps 50, max_state_dim 32 |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de lerobot/pi05_base, la implementación pública de Pi0.5 en lerobot 0.5.2 (commit 09808183). La arquitectura es un VLA que combina un backbone vision-lenguaje con un cabezal de acciones basado en flow matching: recibe cuatro vistas de 480x640 (`observation.images.cam_stereo_left`, `cam_stereo_right`, `cam_wrist_left`, `cam_wrist_right`), un vector de estado de 24 dimensiones (`observation.state`, articulaciones activas en el orden del registro de robots de Bench2Dex) y una instrucción de tarea que es la descripción de la escena. La salida son 24 objetivos de posición articular absolutos en el mismo orden, generados en chunks de 50 acciones con 10 pasos de flow matching y `max_state_dim` de 32.

El entrenamiento se realizó con batch 128 durante 60.000 pasos en bf16, sobre los datos de `Myungkyu/bench2dex_ur5_rh56dfx_3_lerobot_v30` (exportación a LeRobot v3.0 de Bench2Dex/teleopdata), concretamente sobre las demostraciones de "replay-generalization" de tres ajustes: 06, 12 y 42. No se detalla el número total de tokens ni si hubo RLHF o DPO; al tratarse de una política de imitación, el objetivo es flow matching sobre acciones, no preferencias. Los configs referencian el backbone y el tokenizer por identificador de Hub (`google/paligemma-3b-pt-224`, que está restringido y requiere aceptar licencia y autenticarse). El paquete de despliegue descarta claves de `config.json` desconocidas por la versión instalada de lerobot y carga los pesos desde el directorio del checkpoint, no desde `lerobot/pi05_base`.

## Capacidades

- Política de manipulación robótica: genera 24 objetivos de posición articular absolutos para un UR5 con manos RH56DFX a partir de imágenes y estado.
- Percepción visual multicámara: procesa simultáneamente cuatro vistas (estéreo de escena y estéreo de muñeca).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante una descripción de la escena.
- Ejecución de chunks de acciones: produce 50 acciones por inferencia, con posibilidad de ejecutar solo un subconjunto (por ejemplo, `PI05_EXEC_STEPS=25`).
- Control a 20 Hz en el protocolo de evaluación de Bench2Dex.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni visión general fuera del contexto robótico.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Baseline de referencia en Bench2Dex: sirve para comparar nuevas políticas VLA sobre las tareas 06, 12 y 42 con el protocolo de doble entorno, canales none/cov_only/inv_only/inv_cov y semilla 100000000, garantizando comparaciones reproducibles.
- Estudio de la dinámica de entrenamiento: los once checkpoints intermedios (step-5000 a step-55000) permiten analizar cómo evoluciona la tasa de éxito y el LSCR a lo largo del entrenamiento y detectar sobreajuste o mesetas.
- Investigación sobre ejecución parcial de chunks: la diferencia entre ejecutar 50 de 50 acciones y 25 de 50 (SR 47,0 frente a 51,7 en el checkpoint final) permite estudiar el compromiso entre reactividad y coherencia temporal en control a 20 Hz.
- Evaluación de robustez a cambios de cámara y de estado: los canales Equi., Inv. y Full de Bench2Dex miden la degradación cuando se alteran las observaciones, un caso de uso directo para validar políticas antes de desplegarlas en un robot real.
- Punto de partida para fine-tuning en un UR5 + RH56DFX propio: al estar entrenado sobre una morfología concreta de 24 articulaciones, es un inicializador razonable para tareas de manipulación diestra con el mismo hardware.
- Reproducción de experimentos en laboratorio: el paquete `bench2dex/` incluye `deploy_policy.py`, `deploy_policy.yml`, `bench2dex_settings.py` y `eval_setting.sh`, lo que facilita montar el servidor de política y el cliente Isaac Sim en una GPU por ajuste.

## Benchmarks y rendimiento

Resultados publicados en la model card. Tasa de éxito (%) por canal sobre 150 episodios (3 ajustes x 50), split no visto, semilla 100000000, presupuesto de rollout de Bench2Dex (1,5x los pasos del experto), política a 20 Hz, medidos en NVIDIA L40S. SR = media de los cuatro canales; LSCR = latched stage completion rate.

| Checkpoint | Acciones ejecutadas | None | Equi. | Inv. | Full | SR | LSCR |
|---|---|---|---|---|---|---|---|
| final (60k) | 50 de 50 | 68,67 | 34,67 | 42,00 | 42,67 | 47,0 | 68,2 |
| final (60k) | 25 de 50 | 68,00 | 38,00 | 48,67 | 52,00 | 51,7 | 73,3 |
| checkpoints/step-30000 | 50 de 50 | 59,33 | 32,00 | 34,00 | 41,33 | 41,7 | 65,8 |
| checkpoints/step-30000 | 25 de 50 | 68,00 | 42,67 | 52,00 | 48,67 | 52,8 | 73,6 |

Versiones del entorno de evaluación: Bench2Dex `fd90dcc`, Isaac Sim 5.1 / Isaac Lab 2.3.2, lerobot 0.5.2 en `09808183`. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.143.404.816 parámetros en bf16, el peso de los parámetros ronda los 8,3 GB, a lo que hay que sumar el backbone de visión-lenguaje, el tokenizer y las activaciones de cuatro vistas de 480x640.
- GPU recomendadas: la evaluación oficial se realizó en NVIDIA L40S, con una GPU por ajuste ejecutando simultáneamente el servidor de política y el simulador Isaac Sim.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo; el requisito de Isaac Sim 5.1 e Isaac Lab 2.3.2 condiciona el despliegue.
- Opciones de despliegue: servidor de política con lerobot 0.5.2 (commit 09808183) en un entorno Python 3.12, y cliente de simulación con Isaac Sim 5.1 / Isaac Lab 2.3.2. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que la política opera a 20 Hz en evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bench2Dex (SR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_b2d_ur5_rh56dfx_3_b128_60k | 4.143.404.816 | no disponible | 47,0 (final, 50/50); 51,7 (final, 25/50) | no disponible | HuggingFace, repo de 112,2 GB |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de otros modelos sobre Bench2Dex ni de especificaciones detalladas de alternativas, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Especialización estrecha: entrenado solo sobre tres ajustes de Bench2Dex (06, 12, 42) y una morfología concreta (UR5 + RH56DFX, 24 articulaciones activas); no es un modelo general.
- Degradación notable bajo perturbaciones: el SR cae de 68,67 (canal None) a 34,67 (Equi.) en el checkpoint final con 50/50 acciones, lo que indica sensibilidad a cambios en las observaciones.
- Dependencia de versiones exactas: requiere lerobot 0.5.2 en el commit 09808183, Bench2Dex en `fd90dcc` e Isaac Sim 5.1 / Isaac Lab 2.3.2; otras versiones no han sido probadas.
- Tokenizer restringido: `google/paligemma-3b-pt-224` está sujeto a aceptación de licencia y autenticación en HuggingFace.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial no está claramente autorizado y debe consultarse con el autor.
- Idiomas no especificados: no se documenta el idioma de las instrucciones de tarea.
- Riesgo de alucinación en el sentido robótico: como política de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento; no hay mecanismo de verificación interno.
- Sesgos: no documentados; al derivar de teleoperación humana, puede heredar sesgos de las demostraciones (estilos de agarre, velocidades, posiciones iniciales).
- Tamaño del repositorio: 112,2 GB con todos los checkpoints; conviene descargar solo el final con `ignore_patterns="checkpoints/*"` o un paso concreto con `allow_patterns`.
- Estado del optimizador no incluido: no es posible reanudar el entrenamiento exactamente desde estos checkpoints.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi05_b2d_ur5_rh56dfx_3_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento exportado: https://huggingface.co/datasets/Myungkyu/bench2dex_ur5_rh56dfx_3_lerobot_v30
- Dataset original: https://huggingface.co/datasets/Bench2Dex/teleopdata
- Assets de Bench2Dex: https://huggingface.co/datasets/Bench2Dex/Assets
- Repositorio Bench2Dex: https://github.com/Bench2Dex/Bench2Dex
- Paper Bench2Dex: arXiv 2609.15726
- Lerobot (commit de referencia): https://github.com/huggingface/lerobot/tree/09808183ca72c30cbb41b653586f6d0632a4bcca
- Tokenizer: https://huggingface.co/google/paligemma-3b-pt-224
