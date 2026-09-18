# iFaz/eqm-aloha_transfer_cube-seed3-18sep2026_3pm

## Resumen

EQM Policy es una politica de imitacion para robotica entrenada con LeRobot sobre el conjunto de datos lerobot/aloha_sim_transfer_cube_human. El modelo lo publica el usuario iFaz y su objetivo es resolver la tarea de transferencia de un cubo en el simulador ALOHA (AlohaTransferCube-v0), un entorno de manipulacion bimanual implementado sobre MuJoCo. Se trata de un artefacto de investigacion, no de un modelo de lenguaje: la salida son acciones de robot, no texto.

La arquitectura se etiqueta como `eqm` y emplea una formulacion de modelo basado en energia (`ebm: dot`), con terminos de regularizacion jacobiana y un anclaje a punto fijo. El checkpoint contiene 18.701.190 parametros (unos 18,7 millones) en formato safetensors, con un peso de repositorio de 0,2 GB. El entrenamiento se limita a 2000 pasos con batch de 8 y semilla 3.

Su relevancia actual es acotada: se trata de una ejecucion concreta de un barrido de semillas sobre una politica experimental, con una tasa de exito declarada del 20 % sobre 5 episodios de evaluacion. Resulta util como referencia reproducible para estudiar el comportamiento de politicas basadas en energia en entornos simulados y para experimentos de deteccion de fuera de distribucion, pero no esta validado en robot real ni supera umbrales de rendimiento que lo hagan apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de robotica `eqm` con modelo basado en energia (`ebm: dot`), implementada sobre LeRobot |
| Parametros totales | 18.701.190 (18,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (politica de control; no se especifica horizonte de observacion ni historial) |
| Tipos de cuantizacion | No disponible (pesos safetensors sin cuantizar; no se declaran variantes GGUF, AWQ ni similares) |
| Idiomas soportados | No aplica (metadatos declarados en `en`; la salida son acciones de robot) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`, `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

La politica pertenece a la familia de modelos basados en energia: el parametro `ebm` toma el valor `dot`, es decir, la funcion de energia se construye mediante un producto escalar. El entrenamiento incorpora regularizacion jacobiana con peso 1e-4 y 4 sondas (`jacobian_reg_probes`), un termino de anclaje a punto fijo con peso 0,1 (`fixed_point_anchor_weight`) y un parametro `c_gamma_a` de 0,5. El muestreo de acciones en evaluacion usa un tamano de paso de 0,17 (`sample_stepsize`) y el calculo adaptativo esta desactivado (`use_adaptive_compute: False`). No se especifica el numero de capas, la dimension oculta ni el tipo de tronco de red mas alla de estas etiquetas.

El entrenamiento se realizo con LeRobot durante 2000 pasos, con batch de 8, 4 workers de carga de datos y semilla 3, guardando checkpoints cada 1000 pasos. La frecuencia de evaluacion durante el entrenamiento se fijo en 0, por lo que no hay curva de evaluacion intermedia. El corpus de entrenamiento es el dataset lerobot/aloha_sim_transfer_cube_human, compuesto por demostraciones de teleoperacion humana en el simulador ALOHA; no se indica el numero de episodios, la composicion exacta ni si se aplicaron etapas de RLHF o DPO (procedimientos no habituales en aprendizaje por imitacion). La evaluacion se configura con 5 episodios, batch de 1, entornos asincronos desactivados y registro de fuera de distribucion activado con umbral `z` de 3,0.

## Capacidades

- Generacion de acciones de manipulacion bimanual para la tarea AlohaTransferCube-v0 en simulacion MuJoCo.
- Aprendizaje por imitacion a partir de demostraciones humanas teleoperadas.
- Control de politica basado en energia con muestreo iterativo (paso de 0,17) en lugar de decodificacion directa de acciones.
- Deteccion de fuera de distribucion integrada: registro en CSV (`eqm_ood_log.csv`) con calibracion externa (`eqm_calibration.json`) y umbral z de 3,0.
- Regularizacion jacobiana configurable, orientada a controlar la suavidad del campo de energia.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, function calling ni capacidades de agente multi-paso.
- No se declaran capacidades multilingues ni procesamiento de lenguaje natural; la etiqueta `en` responde a los metadatos de la model card.

## Casos de uso

- Reproduccion de experimentos de aprendizaje por imitacion: el checkpoint permite replicar exactamente la configuracion de semilla 3, 2000 pasos y batch 8 declarada, util para verificar resultados publicados o depurar pipelines de LeRobot.
- Barridos de semillas y analisis de varianza: al existir variantes de la misma tarea con otras semillas (el identificador incluye `seed3`), este modelo sirve como punto de comparacion para medir la dispersion del rendimiento entre inicializaciones.
- Investigacion sobre modelos basados en energia para control: los hiperparametros de regularizacion jacobiana y anclaje a punto fijo permiten estudiar como afectan al comportamiento del campo de energia en tareas de manipulacion.
- Validacion de mecanismos de deteccion de fuera de distribucion: la configuracion de registro OOD con umbral z de 3,0 y calibracion externa puede probarse en escenarios simulados controlados para medir falsos positivos y negativos.
- Base para experimentos de simulacion a realidad: la politica, entrenada exclusivamente en simulacion ALOHA, puede usarse como punto de partida en estudios de transferencia, aunque sin garantias de exito dado su 20 % de tasa de exito en simulacion.
- Docencia y formacion en robotica: el modelo es lo bastante pequeno (18,7 M de parametros, 0,2 GB de repositorio) para ejecutarse en un portatil con GPU de gama media, lo que facilita montar practicas de aprendizaje por imitacion de principio a fin.
- Pruebas de integracion de LeRobot: sirve para verificar que versiones concretas de la libreria, del entorno AlohaTransferCube-v0 y del cargador de pesos safetensors siguen siendo compatibles.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son los de evaluacion del propio autor sobre 5 episodios en AlohaTransferCube-v0:

| Metrica | Valor |
|---|---|
| Episodios evaluados | 5 |
| Tasa de exito | 20,0 % |
| Recompensa media acumulada | 0,80 |
| Recompensa maxima media | 0,80 |
| Tiempo de evaluacion | 177,4 s |
| Batch de evaluacion | 1 |
| Entornos asincronos | Desactivados |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni equivalentes de robotica como LIBERO o Meta-World) en la informacion disponible. El tiempo de evaluacion de 177,4 s para 5 episodios equivale a unos 35,5 s por episodio en el simulador, valor derivado de los datos declarados que incluye la simulacion completa, no solo la inferencia de la politica.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (18,7 M de parametros, aproximadamente 75 MB en fp32 y 37 MB en fp16); el consumo dominante proviene del entorno de simulacion MuJoCo y de la renderizacion.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, incluida una RTX 3060 o superior; tambien cabe en GTX 1650 o similares con 4 GB de VRAM. Para entrenamiento, el autor uso `cuda` con batch 8, alcanzable en GPUs de gama media.
- Cabe en GPU de consumo: si, con margen amplio. La inferencia de la politica puede ejecutarse incluso en CPU, aunque el cuello de botella sera el simulador.
- Opciones de despliegue: LeRobot (libreria declarada) y PyTorch con pesos safetensors. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles como metrica de inferencia pura. El unico dato temporal es el de evaluacion completa (177,4 s para 5 episodios con batch 1 y entornos sincronos), que no permite aislar la latencia por paso de control.

## Comparativa con modelos similares

No se dispone de datos numericos de modelos comparables en la informacion proporcionada. Como referencia cualitativa, dentro del ecosistema LeRobot existen otras familias de politicas de manipulacion para la misma tarea (por ejemplo, ACT y Diffusion Policy), pero no se han facilitado sus parametros, contextos, rendimiento ni licencias en esta busqueda.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EQM Policy (iFaz/eqm-aloha_transfer_cube-seed3) | 18.701.190 | No aplica | 20,0 % de exito en 5 episodios de AlohaTransferCube-v0 | apache-2.0 | HuggingFace, 0 descargas |
| ACT (LeRobot) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Diffusion Policy (LeRobot) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Tasa de exito del 20,0 % sobre solo 5 episodios: el intervalo de confianza es muy amplio y cualquier conclusion sobre el rendimiento real es estadisticamente fragil.
- Entrenamiento de 2000 pasos con `eval_freq` a 0: no hay evidencia de convergencia ni curva de aprendizaje intermedia que permita descartar infraentrenamiento.
- Entrenado unicamente en simulacion (`mujoco`, entorno `aloha`), sin validacion en robot fisico. El salto a hardware real implica una brecha de dominio considerable.
- Tarea unica y estrecha: AlohaTransferCube-v0. No hay evidencia de generalizacion a otras tareas, objetos, posiciones o condiciones de iluminacion y friccion.
- Sin datos de sesgo en el sentido de lenguaje, pero si posible sesgo de demostracion: al derivar de teleoperacion humana en simulacion, hereda las trayectorias y el estilo de los operadores del dataset.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de acciones fuera de distribucion: la politica puede producir comandos no vistos en entrenamiento. El autor mitiga esto con registro OOD y umbral z de 3,0, cuya calibracion depende de un fichero externo (`eqm_calibration.json`) que no se detalla.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero no hay ninguna garantia de idoneidad ni de seguridad para aplicaciones fisicas.
- Repositorio sin descargas ni likes y publicado por un usuario individual: no hay proceso de revision por pares ni validacion independiente.
- No se declaran versiones concretas de LeRobot, MuJoCo ni del entorno de simulacion, lo que puede provocar incompatibilidades al cargar el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-18sep2026_3pm
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Cita del autor: Cadene, Remi; Alibert, Simon y otros, "LeRobot", 2024, https://github.com/huggingface/lerobot
- Nota sobre la busqueda web: los resultados devueltos corresponden a servicios de transferencia de ficheros (WeTransfer) y no guardan relacion con el modelo; no se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
