# iFaz/eqm-aloha_transfer_cube-seed3-24sep2026_10am

## Resumen

EQM Policy (`eqm-aloha_transfer_cube-seed3-24sep2026_10am`) es una politica de robotica entrenada con LeRobot por el usuario iFaz para la tarea `AlohaTransferCube-v0` del simulador MuJoCo. No es un modelo de lenguaje: es un controlador de imitacion (imitation learning) que recibe observaciones del entorno ALOHA simulado y produce acciones de manipulacion bimanual, en este caso transferir un cubo. El repositorio contiene pesos en safetensors con 76.446.214 parametros y ocupa 0,3 GB, lo que corresponde a pesos en precision completa (FP32).

El modelo pertenece a la familia de politicas `eqm` (Equilibrium Matching), una formulacion basada en energia: la configuracion declara `ebm: dot`, un denoiser de tipo `unet`, regularizacion jacobiana (`jacobian_reg_weight: 0.001`, `jacobian_reg_probes: 1`) y un anclaje de punto fijo (`fixed_point_anchor_weight: 0.1`). Se entreno durante 80.000 pasos con batch de 8 y semilla 3, y el entrenamiento se lanzo desde rutas de Google Colab (`/content/outputs/...`), lo que sugiere una sola GPU de gama media-alta.

Su relevancia es de tipo experimental y de investigacion, no de produccion: la unica evaluacion publicada en la model card reporta una tasa de exito del 0,0 % sobre un unico episodio, con recompensa media acumulada de 0,00. Se trata, por tanto, de un checkpoint reproducible de un experimento de imitation learning con LeRobot y con deteccion de out-of-distribution (OOD) activada, y no de un modelo listo para desplegar. Sus 0 descargas y 0 likes en el momento de redactar esta ficha confirman su caracter de artefacto de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de imitation learning basada en energia (EQM): `ebm: dot`, denoiser `unet`, regularizacion jacobiana y anclaje de punto fijo |
| Parametros totales | 76.446.214 (76,4 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de observacion de 192 pasos y `n_action_steps` de 96 en entrenamiento / 16 en evaluacion |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors en FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo emite acciones, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`pytorch_model_hub_mixin`) |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | `lerobot/aloha_sim_transfer_cube_human` |
| Entorno de evaluacion | `aloha` / `AlohaTransferCube-v0` (MuJoCo) |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

La politica sigue el esquema EQM (Equilibrium Matching) implementado en LeRobot. La configuracion de arquitectura declara una formulacion de modelo basado en energia con funcion de energia de tipo producto escalar (`ebm: dot`) y un denoiser con arquitectura U-Net, que es el componente encargado de refinar las muestras de accion. El entrenamiento incorpora dos regularizadores explicitos: uno jacobiano (`jacobian_reg_weight: 0.001`, con un unico sondeo o `probe`) y un anclaje de punto fijo (`fixed_point_anchor_weight: 0.1`). El calculo adaptativo esta desactivado (`use_adaptive_compute: False`), de modo que el coste de inferencia por paso es fijo. La model card no enlaza ningun articulo tecnico que describa el metodo, por lo que la formulacion teorica concreta de EQM figura como no disponible.

El entrenamiento se realizo durante 80.000 pasos con `batch_size` de 8, 4 workers de carga de datos y semilla 3, sobre el dataset de demostraciones humanas `lerobot/aloha_sim_transfer_cube_human` (imitation learning a partir de trayectorias humanas en simulacion, no RLHF ni DPO). Los checkpoints se guardaron cada 20.000 pasos y no se ejecuto evaluacion periodica durante el entrenamiento (`eval_freq: 0`). La configuracion de horizonte usa `horizon: 192`, `n_action_steps: 96` y `drop_n_last_frames: 95`, un esquema de prediccion de bloques de acciones con descarte de los fotogramas finales. Ademas, el entrenamiento y la evaluacion incluyen instrumentacion OOD: registro activado, fichero de calibracion (`eqm_calibration.json`), log de puntuaciones y umbral z de 3.0, lo que indica que el autor estaba midiendo desviaciones fuera de distribucion ademas del exito de la tarea.

## Capacidades

- Control de manipulacion bimanual en simulacion: genera secuencias de acciones para el entorno ALOHA de MuJoCo (`AlohaTransferCube-v0`), con prediccion de bloques de 96 acciones en entrenamiento y 16 en evaluacion.
- Imitation learning a partir de demostraciones humanas teleoperadas del dataset `lerobot/aloha_sim_transfer_cube_human`.
- Prediccion de acciones por horizonte largo: la combinacion de `horizon: 192` y `n_action_steps: 96` permite planificar bloques de acciones antes de volver a consultar las observaciones.
- Deteccion de out-of-distribution: soporta registro de puntuaciones OOD con calibracion previa y umbral configurable (`ood_z_threshold: 3.0`), util para estudiar la fiabilidad de la politica ante estados no vistos.
- Integracion con LeRobot: el checkpoint es cargable mediante `policy.path` y el ecosistema `pytorch_model_hub_mixin`, por lo que se puede evaluar con el script de evaluacion de LeRobot.
- No dispone de: generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, function calling, capacidades de agente multi-paso, ni soporte multilingue en el sentido habitual (la etiqueta `en` es meramente declarativa).
- No se documenta ningun modo especial tipo thinking mode, audio ni vision mas alla de la propia observacion del entorno ALOHA.

## Casos de uso

- Reproduccion de experimentos de imitation learning: cargar el checkpoint con LeRobot y reevaluar `AlohaTransferCube-v0` con un numero de episodios estadisticamente significativo (la model card solo aporta uno), para verificar si el 0,0 % de exito es un artefacto de la evaluacion o un fallo real de la politica.
- Estudio de la familia de politicas EQM: sirve como punto de partida para ablaciones sobre `jacobian_reg_weight`, `fixed_point_anchor_weight` y el tipo de denoiser (`unet`), comparando curvas de entrenamiento a 20.000, 40.000, 60.000 y 80.000 pasos.
- Investigacion en deteccion de OOD aplicada a robotica: la politica ya incluye calibracion, log de puntuaciones y umbral z de 3.0, por lo que es un banco de pruebas directo para estudiar como se comporta el controlador ante estados fuera de la distribucion de las demostraciones humanas.
- Baseline en comparativas de politicas sobre ALOHA simulado: al estar entrenada exclusivamente con LeRobot y safetensors, se puede contrastar con otras politicas del mismo ecosistema (ACT, Diffusion Policy) usando el mismo dataset y el mismo entorno de evaluacion.
- Generacion de datos sinteticos de manipulacion: si se consigue una tasa de exito razonable tras reentrenar, las trayectorias generadas podrian usarse como datos de aumento para otras politicas, aunque con la evaluacion actual esto es especulativo.
- Docencia y practicas de aprendizaje por imitacion: el repositorio es pequeno (0,3 GB) y ligero (76,4 M de parametros), lo que permite entrenar y evaluar en una GPU de consumo o incluso en un cuaderno de Colab, como sugiere la ruta `/content/outputs/...` de la configuracion.
- Pruebas de pipeline de evaluacion en simulacion: evaluar el modelo requiere levantar el entorno MuJoCo correspondiente, por lo que es util para validar infraestructura de simulacion, `use_async_envs` y medicion de tiempos (52,2 s por episodio segun la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; se trata de una politica de robotica y esos benchmarks no aplican. El unico dato de rendimiento es la evaluacion incluida en la model card:

| Metrica | Valor |
|---|---|
| Entorno | `AlohaTransferCube-v0` (MuJoCo, `env.type: aloha`) |
| Episodios evaluados | 1 |
| Tasa de exito | 0,0 % |
| Recompensa media acumulada | 0,00 |
| Recompensa maxima media | 0,00 |
| Tiempo de evaluacion | 52,2 s |
| `policy.n_action_steps` en evaluacion | 16 |
| `policy.sample_stepsize` | 1,7e-05 |
| Umbral OOD (`ood_z_threshold`) | 3,0 |

No hay comparacion con otros modelos dentro de la informacion proporcionada. Con un solo episodio, la tasa de exito del 0,0 % no permite inferir el rendimiento real de la politica ni su varianza.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,3 GB solo para los pesos en FP32 (76,4 M de parametros); con activaciones y buffers del denoiser U-Net, el consumo esperado se mantiene por debajo de 1-2 GB en batch 1. No hay mediciones publicadas de VRAM pico: no disponible.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente para inferencia; el entrenamiento reportado se ejecuto en `cuda` desde rutas de Colab, por lo que una T4, L4, RTX 3060, RTX 4090, A100 o H100 sirven sobradamente. No se especifica la GPU exacta usada: no disponible.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en CPU para inferencia a baja frecuencia de control.
- Opciones de despliegue: LeRobot (carga directa del checkpoint con `policy.path` y `pytorch_model_hub_mixin`), PyTorch nativo y el simulador MuJoCo para el entorno `AlohaTransferCube-v0`. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible como metrica aislada del modelo. El unico dato temporal es el tiempo total de evaluacion de un episodio (52,2 s), que incluye el bucle de simulacion MuJoCo y no permite desglosar la latencia por paso de politica.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos numericos de otras politicas, por lo que las celdas comparativas figuran como no disponibles. Se listan las alternativas mas directamente comparables dentro del ecosistema LeRobot para el mismo tipo de tarea:

| Modelo | Tipo | Parametros | Horizonte / contexto | Rendimiento en AlohaTransferCube | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eqm-aloha_transfer_cube-seed3 (este modelo) | Politica basada en energia (EQM) con denoiser U-Net | 76,4 M | Horizonte 192, `n_action_steps` 96 (16 en evaluacion) | 0,0 % de exito (1 episodio) | Apache-2.0 | HuggingFace (iFaz) |
| ACT (Action Chunking Transformer) | Transformer de prediccion de bloques de acciones | no disponible | no disponible | no disponible | no disponible | Disponible en LeRobot |
| Diffusion Policy | Politica de difusion | no disponible | no disponible | no disponible | no disponible | Disponible en LeRobot |
| Otras politicas de LeRobot (pi0, SmolVLA u similares) | VLA / transformer | no disponible | no disponible | no disponible | no disponible | Disponible en LeRobot |

## Limitaciones y advertencias

- Rendimiento no validado: la unica evaluacion publicada da 0,0 % de exito sobre 1 episodio, con recompensa media 0,00. Un solo episodio no es una muestra valida y el resultado sugiere que el checkpoint, tal cual, no resuelve la tarea.
- Sin evaluacion periodica durante el entrenamiento: `eval_freq: 0`, por lo que no hay evidencia de la evolucion del rendimiento entre los pasos 0 y 80.000 ni de que el checkpoint final sea el mejor.
- Solo simulacion: entrenado y evaluado sobre `AlohaTransferCube-v0` en MuJoCo; no hay ninguna evidencia de transferencia sim-to-real ni de robustez ante ruido de sensores o dinamica real.
- Sesgos y sobreajuste: al provenir de un dataset de demostraciones humanas teleoperadas (`aloha_sim_transfer_cube_human`), la politica hereda los sesgos de esas trayectorias y puede degradarse ante estados poco representados; el propio autor activa instrumentacion OOD, lo que es indicativo de este riesgo.
- Riesgo de alucinacion: en el sentido de generar acciones plausibles pero fisicamente incorrectas o inestables, especialmente fuera de la distribucion de las demostraciones. No hay metricas de OOD reportadas en la model card.
- Limitacion de idioma: la etiqueta `en` es declarativa; el modelo no procesa lenguaje natural ni instrucciones textuales, solo observaciones del entorno.
- Restricciones de licencia: el modelo se publica bajo Apache-2.0, que permite uso comercial; conviene verificar la licencia del dataset `lerobot/aloha_sim_transfer_cube_human` y de LeRobot antes de un uso comercial.
- Caveats de produccion: repo sin descargas ni likes, sin articulo tecnico asociado a EQM en la model card, sin semilla multipliple (seed 3 unica) y sin intervalos de confianza; no deberia usarse en produccion sin reentrenamiento y evaluacion exhaustiva.
- Pesos en FP32: no se publican versiones cuantizadas, lo que limita opciones de optimizacion, aunque el tamano (0,3 GB) es manejable en cualquier caso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-24sep2026_10am
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- LeRobot (framework de entrenamiento y evaluacion): https://github.com/huggingface/lerobot
- Articulo tecnico sobre EQM: no disponible
- Demo o espacio interactivo: no disponible
- Repositorio de codigo especifico del autor: no disponible
