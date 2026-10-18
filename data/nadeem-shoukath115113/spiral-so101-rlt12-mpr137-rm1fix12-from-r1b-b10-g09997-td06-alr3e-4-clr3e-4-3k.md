# Nadeem-Shoukath115113/spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-alr3e-4-clr3e-4-3k

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un checkpoint de aprendizaje por refuerzo residual para el brazo robotico SO-101 en una tarea de plegado de camisetas. Lo publica el usuario Nadeem-Shoukath115113 y consiste en un actor residual y un ensemble de cinco criticos entrenados sobre una politica π₀.₅ + RLT congelada. Es decir, el modelo no genera acciones desde cero: aprende una correccion de pequeña magnitud (escala de salida 0,1) que se suma a las acciones de la politica base.

La relevancia es metodologica: es una ablacion controlada sobre la tasa de aprendizaje del actor (3e-4 frente a 1e-4 en el repositorio hermano) con todo lo demas fijo, mismo seed y mismo critic lr. El resultado registrado es que la tasa del actor no produce diferencias visibles: todas las metricas coinciden dentro de 0,01 entre ambos runs, lo que sugiere que el tamaño del residuo lo fija la regularizacion beta y la pendiente del critico, no la velocidad de convergencia del actor.

El checkpoint (0,4 GB) contiene el estado completo en `step_00001500` y `step_00002999`, pero no incluye la politica base, que es obligatoria para cualquier uso. El autor advierte explicitamente de que el modelo no se ha evaluado en robot y de que las pruebas offline del critico no se han ejecutado, por lo que debe tratarse como material de investigacion, no como politica lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RL residual sobre politica congelada π₀.₅ (VLA) + encoder RLT; actor y criticos son MLP de 3x1024 con escala de salida residual 0,1 |
| Parametros totales | no disponible (actor y cada uno de los 5 criticos son MLP de 3x1024; el recuento exacto no se publica) |
| Longitud de contexto | no aplica (politica de robot); horizonte de accion de 20 pasos y vector de entrada compuesto por z_rl de 2048 + estado de 12 |
| Tipos de cuantizacion | no se documentan; la politica base congelada se ejecuta en bfloat16 con 10 pasos de flow |
| Idiomas soportados | no disponible; las instrucciones de tarea usadas en el etiquetado estan en ingles ("Fold the long sleeved T-shirt on the table") |
| Licencia | Apache 2.0 |
| Formato de pesos | `step_*/rl_state` con `actor_params`, `critic_params` (5), `target_critic_params` y `step`; 155 arrays por checkpoint; `action_cholesky.npy` (240x240); sin safetensors ni GGUF |
| Dimension de accion | 12 (todas deltas, incluidos los grippers) |
| Beta (regularizador BC) | 10 |
| Objetivo del critico | 0,4 MC + 0,6 TD, gamma 0,9997 |
| Kappa / criticos / tau | 4 / 5 / 0,005 |
| Checkpoints incluidos | `step_00001500` (punto medio) y `step_00002999` (final) |

## Arquitectura y entrenamiento

La arquitectura es un esquema de RL residual en dos niveles. La capa congelada es una politica π₀.₅ (vision-language-action) del checkpoint `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k`, paso `9999`, en bfloat16 y con 10 pasos de flow, junto con el encoder RLT del mismo directorio. Sobre ella se entrena un actor que recibe el vector z_rl de 2048 dimensiones mas el estado de 12 dimensiones y produce un residuo de 12 dimensiones con horizonte 20, escalado a 0,1. El critico es un ensemble de cinco MLP de 3x1024 con sus correspondientes redes objetivo (tau 0,005).

El entrenamiento usa 137 episodios y 63.508 fotogramas a 15 fps procedentes del dataset `merged_policy_rollouts` (LeRobot v3.0, 137 episodios y 63.645 fotogramas; el etiquetador descarta el ultimo fotograma de cada episodio). Son rollouts exclusivamente de politica (`is_policy` vale 1 en todos los fotogramas, sin tomas de control humanas) y el reparto es de 66 episodios con exito y 71 con fallo. Las etiquetas se generan con RM1 (`sarm2_gripper58`) y la correccion `fix12`. El retorno MC medio es 0,656 ± 0,285 y el 21,1% de las recompensas por paso son negativas; la AUC del progreso final de RM1 frente a la bandera de exito es 0,853. El ruido correlacionado esta activado mediante `action_cholesky.npy` (240x240, pre-shrunk, md5 `291c83b5…`, identico a las rondas 1 a 4).

Hiperparametros: 3.000 pasos, batch 32 (96.000 muestras, aproximadamente 1,5 pasadas), seed 42, AdamW con weight decay 1e-4 y recorte de gradiente 1,0, lr constante de 3e-4 tanto en actor como en critico. El actor se inicializa desde la ronda 1b (paso 4.999, `--resume-actor-only`) y los cinco criticos arrancan desde cero. El entrenamiento tardo 4,4 horas en una sola GPU. El codigo es la rama `lehome-noise-norm` en `f79f191` con anadidos sin commitear: el preset `residual_rl_pi05_so101_rlt12_mpr137_rm1fix12`, las opciones `--resume-from` / `--resume-actor-only` y la metrica `actor/q_gain_select_best_of_k`. El script es `scripts/train_residual_rl_rlt.py`.

## Capacidades

- Control de robot manipulador de 12 dimensiones (incluidos ambos grippers) como refinamiento de una politica VLA congelada, no como politica autonoma.
- Plegado de camisetas de manga larga sobre mesa: es la unica tarea para la que existe evidencia de datos.
- Aprendizaje por refuerzo offline con objetivo mixto Monte Carlo / TD y regularizacion BC hacia la politica base.
- Seleccion best-of-k sobre el ensemble de cinco criticos (ganancia registrada de 0,0026 en el paso 2.900).
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, vision general ni audio. Son capacidades propias de un LLM o un VLM, no de este checkpoint.
- No se documenta soporte multilingue ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en RL residual sobre politicas VLA congeladas: el checkpoint sirve como punto de partida para reproducir la comparacion de tasas de aprendizaje del actor manteniendo fijo todo lo demas (seed, critic lr, beta, gamma).
- Ablaciones controladas de hiperparametros: el par de repositorios alr3e-4 / alr1e-4 permite estudiar si la tasa del actor afecta al tamaño del residuo, dado que la evidencia publicada indica que no.
- Estudio del compromiso entre regularizacion BC y explotacion del critico: con beta 10 el residuo se estabiliza en torno a 0,0117-0,0127, lo que permite analizar la relacion optimo r = gradiente del critico / (2·beta).
- Analisis de calibracion de reward models: la AUC de 0,853 entre el progreso final de RM1 y el exito real, junto con 27 de 71 fallos etiquetados con progreso ≥ 0,8, es material directo para estudiar el ruido del etiquetador.
- Punto de partida para una tercera ronda de entrenamiento: el autor indica que el actor de la ronda 1b se reutiliza y que solo se emplean los rollouts nuevos, de modo que el checkpoint final puede inicializar rondas posteriores.
- Base para experimentos de seleccion best-of-k en robotica: la metrica `actor/q_gain_select_best_of_k` esta instrumentada y permite comparar estrategias de seleccion de accion con el ensemble de criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay evaluacion en robot ni MMLU, HumanEval, GSM8K ni metricas de exito en hardware. Las pruebas offline del critico tampoco se han ejecutado. Lo unico disponible son las metricas del registro de entrenamiento (cada fila es la media de los 100 pasos anteriores):

| Paso | Perdida del critico | Q min / media / max | Objetivo MC / TD (media) | Q(actor) − Q(base) | Ganancia best-of-4 | Tamaño del residuo |
|---|---|---|---|---|---|---|
| 100 | 0,738 | −0,78 / −0,27 / 0,36 | 0,656 / −0,855 | 0,0005 | 0,0012 | 0,0073 |
| 500 | 0,0093 | −0,05 / 0,37 / 0,64 | 0,657 / 0,180 | 0,0028 | 0,0021 | 0,0114 |
| 1000 | 0,0109 | 0,07 / 0,58 / 0,86 | 0,665 / 0,520 | 0,0033 | 0,0022 | 0,0118 |
| 1500 | 0,0104 | 0,09 / 0,62 / 0,92 | 0,652 / 0,606 | 0,0036 | 0,0022 | 0,0119 |
| 2000 | 0,0112 | 0,07 / 0,64 / 0,95 | 0,653 / 0,624 | 0,0039 | 0,0026 | 0,0127 |
| 2500 | 0,0104 | 0,07 / 0,65 / 0,96 | 0,664 / 0,648 | 0,0038 | 0,0025 | 0,0121 |
| 2900 | 0,0125 | 0,04 / 0,64 / 0,95 | 0,650 / 0,628 | 0,0034 | 0,0026 | 0,0117 |

No hay picos de perdida: la perdida del critico se mantiene entre 0,009 y 0,014 desde el paso 200 hasta el final. La comparacion entre los dos runs de 3.000 pasos muestra que todas las metricas coinciden dentro de 0,01 entre los pasos 500 y 2.800, y que el tamaño del residuo, Q(actor) − Q(base) y la ganancia de seleccion coinciden dentro de 0,0002. La unica excepcion es un salto del critico en la ultima ventana del run alr1e-4.

## Requisitos de hardware

- VRAM: no disponible de forma explicita. El repositorio pesa 0,4 GB, pero la inferencia requiere cargar ademas la politica base π₀.₅ + RLT, que no se incluye; el autor solo indica bfloat16 y 10 pasos de flow para esa politica congelada.
- GPU: el entrenamiento se completo en 4,4 horas en una sola GPU, sin especificar modelo. No hay datos publicados de GPU recomendada ni de rendimiento en inferencia.
- No hay informacion sobre si cabe en GPU de consumo. Dado que el componente entrenado son MLP de 3x1024, el cuello de botella sera la politica VLA congelada, no este checkpoint.
- Opciones de despliegue: no documentadas. vLLM, llama.cpp, Ollama y TGI no son aplicables a este artefacto; la integracion pasaria por cargar `actor_params` junto con `vla_params` y `rlt_params` de la politica base mediante el codigo del autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | lr actor / critico | Tamaño del residuo | Estado |
|---|---|---|---|---|---|
| Este repositorio | Actor residual + 5 criticos sobre π₀.₅ + RLT congelada | 3.000 | 3e-4 / 3e-4 | 0,0117 | Sin evaluar en robot |
| `spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-alr1e-4-clr3e-4-3k` | Identico salvo lr del actor | 3.000 | 1e-4 / 3e-4 | ≈0,0117 (diferencias < 0,0002) | Sin evaluar en robot |
| `spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-1500` | Mismo preset | 1.500 | 1e-4 / 1e-4 | no disponible en el texto | Sin evaluar en robot |
| `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k` | Politica base π₀.₅ + RLT (congelada) | 10.000 | no aplica | no aplica | Requerida, no incluida |

No se dispone de comparacion con modelos de terceros para esta tarea. Las alternativas equivalentes en la misma categoria serian otras politicas VLA para SO-101, pero no hay datos en la informacion proporcionada.

## Limitaciones y advertencias

- No evaluado en robot. El autor lo declara explicitamente y ademas indica que las pruebas offline del critico no se han ejecutado.
- No es una politica autonoma: necesita la politica base `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k` en el paso `9999`, que no esta incluida en el repositorio.
- Una sola tarea y un solo entorno: plegado de camisetas de manga larga sobre mesa con SO-101. No hay evidencia de generalizacion a otras tareas, objetos o morfologias.
- Un unico seed (42) y una sola configuracion de datos. No hay intervalos de confianza ni replicas.
- El efecto aprendido es muy pequeño: Q(actor) − Q(base) maximo registrado de 0,0039 y ganancia de seleccion best-of-4 de 0,0026. La relevancia practica del residuo no esta cuantificada en exito real.
- Ruido en las etiquetas del reward model: 27 de 71 episodios fallidos tienen progreso RM1 ≥ 0,8 y 3 de 66 exitosos estan por debajo de 0,8, con una AUC de solo 0,853.
- El dataset no registra que politica genero los rollouts, lo que limita la trazabilidad de la distribucion de entrenamiento.
- El codigo exacto no es reproducible tal cual: la rama `lehome-noise-norm` en `f79f191` requiere anadidos sin commitear (preset, `--resume-from`, `--resume-actor-only`, metrica de ganancia).
- El fichero de ruido correlacionado se reutiliza sin cambios entre las rondas 1 a 4 y este run, lo que puede introducir dependencia entre experimentos presentados como independientes.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion en hardware hace desaconsejable cualquier despliegue en produccion sin validacion propia.
- El campo de idiomas no esta declarado y las instrucciones de tarea del etiquetado estan en ingles; no hay soporte multilingue documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-alr3e-4-clr3e-4-3k
- Run hermano (lr actor 1e-4): https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-alr1e-4-clr3e-4-3k
- Run anterior de 1.500 pasos: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-1500
- Politica base requerida (paso 9999): https://huggingface.co/Nadeem-Shoukath115113/pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k
- Checkpoint de inicializacion del actor (ronda 1b, paso 4999): https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-lehome-r1b-teleop57-daggerrlt1-rm1fix12-b30-mc05-bs32-5k
- Dataset de rollouts: https://huggingface.co/datasets/Nadeem-Shoukath115113/merged_policy_rollouts
- W&B: proyecto `spiral-rlt12-mpr137`, run `aptkmg5k` (URL no proporcionada)
- Codigo: rama `lehome-noise-norm` en el commit `f79f191`, script `scripts/train_residual_rl_rlt.py` (URL del repositorio no disponible)
- Paper, blog o demo: no disponibles en la informacion proporcionada
