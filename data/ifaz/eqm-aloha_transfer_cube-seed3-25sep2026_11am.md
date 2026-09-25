# iFaz/eqm-aloha_transfer_cube-seed3-25sep2026_11am

## Resumen

EQM Policy es una política robótica de imitación (imitation learning) entrenada con la librería LeRobot de Hugging Face por el usuario iFaz. Se trata de un checkpoint específico para la tarea `AlohaTransferCube-v0` del simulador MuJoCo, es decir, el control bimanual de un robot ALOHA simulado para transferir un cubo entre sus dos brazos. El modelo no es un LLM: es una política de control que mapea observaciones del entorno a secuencias de acciones motoras.

El checkpoint tiene 686.448.646 parámetros (unos 0,69 mil millones) almacenados en safetensors, con un repositorio de 2,7 GB. La arquitectura declarada es de tipo `eqm` (política EQM de LeRobot), con 28 bloques de profundidad, hidden size de 1152, 16 cabezas de atención y mlp_ratio de 4,0. Genera chunks de acción con un horizonte de predicción de 64 pasos, de los cuales ejecuta 63 antes de volver a inferir.

Su relevancia es acotada pero clara: es un artefacto de investigación reproducible (semilla 3, dataset público, licencia apache-2.0) para evaluar métodos de imitación y de detección de datos fuera de distribución (OOD) en manipulación bimanual simulada. El autor reporta una tasa de éxito del 60,0 % en 5 episodios de evaluación, un dato que conviene interpretar con cautela por el tamaño de la muestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política EQM de LeRobot; transformer con 28 bloques, hidden size 1152, 16 cabezas, mlp_ratio 4,0, `use_adaptive_compute` = False |
| Parametros totales | 686.448.646 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un LLM); horizonte de predicción de 64 pasos, con 63 pasos de acción por chunk |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el repo pesa 2,7 GB, compatible con pesos en fp32) |
| Idiomas soportados | en (etiqueta del repositorio); al ser una política robótica no tiene interfaz de lenguaje |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`, `pytorch_model_hub_mixin`) |
| Tarea | `AlohaTransferCube-v0` (transferencia de cubo con robot bimanual ALOHA simulado en MuJoCo) |
| Dataset de entrenamiento | `lerobot/aloha_sim_transfer_cube_human` (demostraciones de teleoperación humana) |
| Tipo de política | `eqm` |
| Dispositivo de entrenamiento | cuda |
| Detección OOD | activada (`ood_logging_enabled` = True, `ood_z_threshold` = 3,0) |
| Parametros del repo | 686.448.646; tamano del repo 2,7 GB |

## Arquitectura y entrenamiento

La model card identifica la política como de tipo `eqm` dentro del catálogo de LeRobot, con un backbone transformer de 28 capas, dimensión oculta 1152 y 16 cabezas de atención. El modelo trabaja por chunks de acción: predice un horizonte de 64 pasos y ejecuta los primeros 63 (`n_action_steps` = 63, `drop_n_last_frames` = 0) antes de recalcular. La opción de cómputo adaptativo (`use_adaptive_compute`) está desactivada, por lo que el coste de inferencia por chunk es fijo. La model card no detalla la formulación matemática completa de la política EQM, el esquema de difusión o flow-matching subyacente ni la composición exacta de los datos más allá del identificador del dataset.

El entrenamiento es de imitación supervisada sobre el dataset `lerobot/aloha_sim_transfer_cube_human`: 80.000 pasos con batch size de 8, semilla 3, 4 workers de carga de datos y checkpoints cada 20.000 pasos. La frecuencia de evaluación durante el entrenamiento está a 0 (`eval_freq` = 0), por lo que no hubo selección de checkpoint guiada por rendimiento: el artefacto publicado corresponde al final del entrenamiento. No se documenta uso de RLHF, DPO ni ningún ajuste por refuerzo. La evaluación reportada se ejecutó por separado, con 5 episodios, batch size 1 y entornos síncronos (`use_async_envs` = False), a diferencia de la configuración de entrenamiento, que usaba entornos asíncronos.

Como innovación destacable, el autor activa un módulo de detección de datos fuera de distribución basado en calibración estadística: se registran logs OOD con un umbral z de 3,0 (`ood_z_threshold`), apoyados en un fichero de calibración externo. Es un mecanismo útil para monitorizar en producción cuándo las observaciones se alejan de la distribución de entrenamiento.

## Capacidades

- Control bimanual simulado: genera secuencias de acciones de bajo nivel para el entorno ALOHA de MuJoCo, específicamente para la tarea de transferir un cubo de un brazo al otro.
- Generación de chunks de acción: produce 64 pasos de acción por inferencia y ejecuta 63, lo que reduce la frecuencia de llamadas al modelo.
- Aprendizaje por imitación: reproduce comportamientos derivados de demostraciones de teleoperación humana, sin necesidad de recompensa explícita.
- Detección de datos fuera de distribución: registra métricas OOD y aplica un umbral z de 3,0 para señalar observaciones anómalas respecto a la calibración.
- Capacidades de tool calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica; la etiqueta `en` procede de la documentación del repositorio.
- Capacidades especiales (modo thinking, visión, audio): la model card no especifica las modalidades de entrada. El pipeline estándar de LeRobot para ALOHA simulado emplea observaciones de cámara y estado del robot, pero este detalle no se confirma en la documentación proporcionada.

## Casos de uso

- Benchmark reproducible de imitación en ALOHA simulado: sirve como punto de referencia fijo (semilla 3, 80.000 pasos, dataset público) para comparar variantes de políticas EQM bajo exactamente las mismas condiciones de entrenamiento.
- Investigación en manipulación bimanual: permite estudiar el comportamiento de una política de 686 millones de parámetros en una tarea de coordinación entre dos brazos, con un horizonte de acción de 64 pasos que es relevante para analizar la coherencia temporal de los chunks.
- Desarrollo y validación de detección OOD: el modelo ya incorpora calibración y logging OOD con umbral z de 3,0, por lo que es un banco de pruebas adecuado para evaluar si estas señales predicen fallos antes de que ocurran.
- Estudio de sim-to-real: al estar entrenado exclusivamente en simulación, puede usarse como punto de partida para analizar la brecha de dominio antes de invertir en datos reales de ALOHA.
- Evaluación de infraestructura de simulación: los 195,9 segundos para 5 episodios permiten medir el coste de evaluar políticas en MuJoCo y comparar configuraciones síncronas frente a asíncronas.
- Docencia y formación en LeRobot: es un ejemplo completo y ligero (2,7 GB) de un pipeline de entrenamiento y evaluación con LeRobot, útil para reproducir el flujo de trabajo de principio a fin.
- Comparación de variantes y ablaciones: junto con los checkpoints hermanos del mismo autor (por ejemplo, `dot-ft` o la ejecución del 18 de septiembre), permite aislar el efecto de cambios de configuración, semilla o ajuste posterior.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son los de la evaluación del propio autor, sobre 5 episodios y con la política en el checkpoint final:

| Metrica | Valor |
|---|---|
| Episodios evaluados | 5 |
| Tasa de exito (`success rate`) | 60,0 % |
| Recompensa suma media (`avg sum reward`) | 221,80 |
| Recompensa maxima media (`avg max reward`) | 3,20 |
| Tiempo de evaluacion | 195,9 s |
| Entorno | `AlohaTransferCube-v0` (MuJoCo, ALOHA) |

No se han publicado resultados comparativos con otras políticas en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, que ademas no aplican a este tipo de modelo). Tampoco se documentan curvas de aprendizaje intermedias, dado que `eval_freq` estaba configurado a 0.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 2,7 GB solo de pesos (coincide con el tamano del repo); en bf16/fp16, en torno a 1,4 GB. Hay que sumar el coste de activaciones y de los buffers de observacion.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para los pesos; una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090 o una A100/H100 cubren el modelo con amplio margen y dejan espacio para paralelizar entornos de simulacion.
- Cabe en GPU de consumo: si. Es un modelo de 686 millones de parametros, por lo que entra en GPUs de gama media y baja con 8-12 GB sin necesidad de cuantizacion.
- CPU: tecnicamente es ejecutable en CPU, pero el cuello de botella real sera el simulador MuJoCo y la latencia por chunk, no los pesos.
- Opciones de despliegue: scripts de evaluacion de LeRobot (`lerobot-eval`), PyTorch con `pytorch_model_hub_mixin`, y entorno MuJoCo para `AlohaTransferCube-v0`. vLLM, llama.cpp, Ollama y TGI no aplican: son servidores de inferencia para modelos de lenguaje, no para politicas de control robotico.
- Latencia y throughput: el unico dato disponible es el tiempo total de evaluacion, 195,9 s para 5 episodios, aproximadamente 39 s por episodio. Ese valor incluye la simulacion fisica completa, no solo la inferencia, y no se desglosa en la model card.

## Comparativa con modelos similares

No se dispone de resultados de benchmark publicados para las alternativas, por lo que la comparacion se limita a datos objetivos de repositorio:

| Modelo | Parametros | Tarea | Contexto / horizonte | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| `iFaz/eqm-aloha_transfer_cube-seed3-25sep2026_11am` (este) | 686.448.646 | AlohaTransferCube-v0 | horizonte 64, 63 pasos por chunk | apache-2.0 | 60,0 % de exito en 5 episodios |
| `iFaz/eqm-aloha_transfer_cube-seed3-dot-ft` | no disponible | AlohaTransferCube-v0 | no disponible | apache-2.0 (segun repositorio) | no disponible |
| `iFaz/eqm-aloha_transfer_cube-seed3-18sep2026_4pm` | no disponible | AlohaTransferCube-v0 | no disponible | apache-2.0 (segun repositorio) | no disponible |

Como referencia de categoria, LeRobot incluye otras familias de politicas para ALOHA simulado (por ejemplo, ACT o Diffusion Policy), pero no se han proporcionado cifras de rendimiento para ellas en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Tasa de exito del 60,0 %: cuatro de cada diez episodios evaluados no completan la tarea, un nivel insuficiente para despliegues que exijan fiabilidad alta.
- Muestra de evaluacion minima: solo 5 episodios, lo que implica un intervalo de confianza muy amplio; el 60 % no debe tratarse como una estimacion estable.
- Ausencia de evaluacion durante el entrenamiento: `eval_freq` = 0 implica que no hubo seleccion de checkpoint por rendimiento y que se desconoce si el modelo final es el mejor de la ejecucion.
- Entrenamiento exclusivamente en simulacion: no hay evidencia de transferencia al mundo real y es previsible una brecha de dominio relevante (dinamica, ruido sensorial, calibracion) si se aplica a un ALOHA fisico.
- Tarea unica y especializada: la politica solo cubre `AlohaTransferCube-v0`; no generaliza a otras tareas de manipulacion sin reentrenamiento o ajuste.
- Una sola semilla: el checkpoint corresponde a la semilla 3, por lo que no se puede estimar la varianza entre ejecuciones.
- Dependencias de rutas locales: la configuracion de evaluacion y de calibracion OOD apunta a rutas locales (`/content/outputs/...`, `/content/eqm_calibration.json`), que probablemente no estan incluidas en el repositorio y deben reconstruirse para reproducir la deteccion OOD.
- Inconsistencia de configuracion: la config de entrenamiento usa `eval.n_episodes` = 1 y entornos asincronos, mientras que la de evaluacion usa 5 episodios y entornos sincronos; conviene fijar la configuracion antes de comparar resultados.
- Cuantizacion no documentada: no se publican formatos cuantizados (GGUF, AWQ, GPTQ), algo poco habitual en politicas roboticas pero que limita el despliegue en hardware muy restringido.
- Licencia permisiva con pocas garantias: apache-2.0 permite uso comercial, pero no hay garantias de idoneidad, y la model card esta generada de forma automatica por LeRobot, sin documentacion adicional sobre sesgos, composicion del dataset o calidad de las demostraciones.
- Riesgo de sobreajuste a la distribucion del dataset: al tratarse de imitacion sobre demostraciones humanas, el comportamiento fuera de esa distribucion no esta caracterizado; el modulo OOD ayuda a detectarlo, pero no a corregirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-25sep2026_11am
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Variante relacionada `eqm-aloha_transfer_cube-seed3-dot-ft`: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-dot-ft
- Variante relacionada `eqm-aloha_transfer_cube-seed3-18sep2026_4pm`: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-18sep2026_4pm
- Ficha de terceros de una variante del mismo autor: https://savrn.com/models/eqm-aloha-transfer-cube-seed3-18sep2026-1pm
- Cita del autor: Cadene, Remi; Alibert, Simon; et al. «LeRobot», 2024, https://github.com/huggingface/lerobot
