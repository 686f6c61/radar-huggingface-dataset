# iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_3pm

## Resumen

`eqm-aloha_transfer_cube-seed3-12sep2026_3pm` es una politica de aprendizaje por imitacion para robotica, entrenada con la libreria LeRobot de Hugging Face por el usuario iFaz y publicada en el Hub con licencia Apache 2.0. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (imagenes e estado de las articulaciones) a acciones de un brazo robotico, en concreto para la tarea simulada AlohaTransferCube-v0 de MuJoCo.

El modelo tiene 18.701.190 parametros (aproximadamente 0,1 GB de repositorio) y se ha entrenado sobre el dataset `lerobot/aloha_sim_transfer_cube_human` durante 5000 pasos con batch de 8, semilla 3 y guardado cada 1000 pasos, segun la configuracion declarada en su model card. El tipo de politica declarado es `eqm` y la model card indica explicitamente que se han empleado los hiperparametros por defecto de la arquitectura, sin sobrescribir ninguno.

Su relevancia es acotada y de caracter experimental: se trata de un artefacto de investigacion reproducible (semilla fija, dataset publico, pipeline estandar de LeRobot) util para estudiar el comportamiento de la politica EQM en una tarea de manipulacion simulada y para probar mecanismos de deteccion de fuera de distribucion (OOD) que el autor activa en la configuracion de evaluacion. Conviene subir la advertencia de que el unico resultado de evaluacion publicado es una tasa de exito del 0,0% sobre una unica partida, por lo que no existe evidencia de que la politica resuelva la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica `eqm` de LeRobot (no se detalla en la model card; "All defaults — no overrides applied") |
| Parametros totales | 18.701.190 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la ficha no especifica el horizonte de observacion) |
| Tipos de cuantizacion | No disponible (pesos publicados sin cuantizacion; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | `en` declarado en la model card (etiqueta de metadatos; la politica no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tags: `safetensors`, `pytorch_model_hub_mixin`); configuracion de entrenamiento en formato LeRobot |
| Libreria | `lerobot` |
| Pipeline en el Hub | `robotics` |
| Dataset de entrenamiento | `lerobot/aloha_sim_transfer_cube_human` |
| Entorno de evaluacion | `env.type = aloha`, `env.task = AlohaTransferCube-v0` |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica la politica como `eqm` y remite a LeRobot como marco de entrenamiento, pero no describe la arquitectura interna: el apartado "Policy Architecture" indica "All defaults — no overrides applied", es decir, que se usaron los valores por defecto de la implementacion sin modificar profundidad, anchura, cabezas de atencion ni horizonte de prediccion. Por tanto, la composicion exacta de capas, el mecanismo de atencion o el tipo de decoder de acciones no estan disponibles en la informacion proporcionada; el unico dato estructural fiable es el recuento de parametros, 18.701.190, coherente con una red de tamano pequeno orientada a control visuomotor y no con un transformer de gran escala.

El entrenamiento se realizo en una GPU (`device = cuda`) durante 5000 pasos, con batch de 8, 4 workers de carga de datos, semilla 3 y guardado de checkpoint cada 1000 pasos. La frecuencia de evaluacion se fijo en 0 (`eval_freq = 0`), de modo que no hubo evaluacion periodica durante el entrenamiento. El dataset es una demostracion humana del simulador ALOHA (`aloha_sim_transfer_cube_human`), por lo que se trata de aprendizaje por imitacion supervisado sobre trayectorias, sin que la informacion disponible mencione fases de RLHF, DPO ni ningun otro ajuste por preferencias, algo por otra parte ajeno a este dominio. El unico elemento diferencial documentado es el mecanismo de deteccion OOD de la configuracion de evaluacion: registro activado (`ood_logging_enabled = True`), umbral z de 3,0 (`ood_z_threshold = 3.0`) y fichero de calibracion en `/kaggle/working/eqm_calibration.json`, lo que sugiere que el autor esta probando estimadores de novedad sobre las activaciones o las predicciones de la politica.

## Capacidades

- Control visuomotor para manipulacion robotica: genera acciones continuas a partir de observaciones del entorno simulado ALOHA.
- Ejecucion de una unica tarea concreta: `AlohaTransferCube-v0` (transferencia y ensamblaje de un cubo en simulacion MuJoCo).
- Aprendizaje por imitacion a partir de demostraciones humanas del dataset `lerobot/aloha_sim_transfer_cube_human`.
- Integracion con el ecosistema LeRobot: carga mediante `pytorch_model_hub_mixin`, evaluacion con los scripts de `lerobot` y reproduccion del pipeline de entrenamiento.
- Deteccion de fuera de distribucion (OOD) en la evaluacion, con umbral z configurable y volcado a CSV.
- Reproducibilidad determinista: semilla 3 fija y configuracion completa publicada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni generacion de texto: no es un modelo de lenguaje y la etiqueta `en` es meramente declarativa.

## Casos de uso

- Investigacion en aprendizaje por imitacion: usar el checkpoint como punto de partida para estudiar como evoluciona la politica EQM en AlohaTransferCube-v0 entre los 1000 y los 5000 pasos de entrenamiento, comparando checkpoints intermedios guardados cada 1000 pasos.
- Reproduccion de experimentos con semilla fija: al estar entrenado con `seed = 3` y publicarse la configuracion completa, permite replicar el entrenamiento en otra maquina y medir la varianza entre ejecuciones.
- Banco de pruebas de deteccion OOD: la configuracion de evaluacion ya incluye umbral z de 3,0 y registro en CSV, por lo que sirve para validar estimadores de novedad cuando el brazo se situa en configuraciones no vistas durante el entrenamiento.
- Desarrollo de pipelines de robotica con LeRobot: sirve como ejemplo minimo (18,7 M de parametros) para probar el ciclo completo de carga, evaluacion en MuJoCo y despliegue dentro de la libreria sin necesidad de GPU de gama alta.
- Docencia y formacion: por su tamano reducido y su licencia Apache 2.0, es adecuado para practicas de aprendizaje por imitacion, evaluacion de politicas y analisis de fallos en entornos simulados.
- Punto de partida para ajuste fino: al ser un modelo pequeno y de licencia permisiva, puede reentrenarse sobre otros datasets de LeRobot o sobre demostraciones propias de un ALOHA simulado con coste computacional bajo.
- Analisis de fallos y analisis de recompensas: con recompensa media y maxima de 0,00 en la unica partida registrada, es util como caso de estudio de politica no convergida y para depurar el bucle de evaluacion.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados son los de la model card, obtenidos sobre una unica partida:

| Metrica | Valor |
|---|---|
| Entorno | `AlohaTransferCube-v0` (`env.type = aloha`) |
| Episodios evaluados | 1 |
| Tasa de exito | 0,0% |
| Recompensa media acumulada | 0,00 |
| Recompensa media maxima | 0,00 |
| Tiempo de evaluacion | 157,6 s |

No se han publicado resultados de benchmarks comparativos (por ejemplo frente a ACT o Diffusion Policy en el mismo dataset) en la informacion disponible. El resultado de 0,0% de exito sobre una sola partida no permite extraer conclusiones sobre el rendimiento real de la politica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 75 MB solo para pesos (18.701.190 parametros x 4 bytes); en fp16, aproximadamente 37 MB. Son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- VRAM adicional necesaria para el simulador MuJoCo y el renderizado de observaciones visuales, no cuantificada en la informacion disponible.
- GPU recomendadas: cualquiera con soporte CUDA, incluidas GPU de gama de entrada; el entrenamiento original se hizo en `cuda`, pero por tamano tambien es viable en CPU para inferencia.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso integradas con suficiente memoria para el simulador.
- Opciones de despliegue: scripts de evaluacion de LeRobot y PyTorch con `pytorch_model_hub_mixin`; no aplican servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: el unico dato disponible es un tiempo total de evaluacion de 157,6 s para una partida completa en MuJoCo (`eval.batch_size = 1`), que incluye la simulacion y no solo la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en AlohaTransferCube-v0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eqm-aloha_transfer_cube-seed3-12sep2026_3pm | 18.701.190 | No disponible | 0,0% de exito (1 episodio) | Apache 2.0 | Hugging Face Hub |
| ACT (LeRobot) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Implementacion incluida en LeRobot |
| Diffusion Policy (LeRobot) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Implementacion incluida en LeRobot |

No se dispone de cifras de parametros, contexto ni rendimiento para las alternativas en la informacion proporcionada; se listan unicamente como familias de politica habitualmente empleadas con el mismo dataset y entorno dentro de LeRobot.

## Limitaciones y advertencias

- Evidencia experimental nula: la tasa de exito es del 0,0% y se ha medido sobre una sola partida (`eval.n_episodes = 1`), por lo que el resultado no es estadisticamente significativo y no permite afirmar ni negar que la politica resuelva la tarea.
- Sin evaluacion durante el entrenamiento: `eval_freq = 0` implica que no hay curva de aprendizaje ni puntos de control evaluados, solo resultados tras el entrenamiento.
- Dominio restringido: solo simulacion MuJoCo, tarea `AlohaTransferCube-v0`. No hay evidencia de transferencia a un ALOHA fisico (sim-to-real) ni a otras tareas.
- Riesgo de sobreajuste: 5000 pasos con batch de 8 sobre un unico dataset de demostraciones humanas; no se documentan tecnicas de regularizacion ni aumentos de datos.
- Sin cuantizaciones publicadas: no se ofrecen variantes GGUF, AWQ ni ONNX, lo que limita el despliegue en entornos que no sean PyTorch con LeRobot.
- Etiqueta de idioma enganosa: la model card declara `en`, pero el modelo no procesa lenguaje natural; es una etiqueta de metadatos del Hub.
- Sesgos: no se documenta ningun analisis de sesgo. Al entrenarse sobre demostraciones humanas, puede heredar los sesgos de estilo y de distribucion de esas trayectorias (velocidades, posiciones iniciales y estrategias concretas).
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion; conviene revisar tambien la licencia del dataset `lerobot/aloha_sim_transfer_cube_human`.
- Advertencia de produccion: no debe desplegarse en un robot real sin una evaluacion exhaustiva previa (muchos episodios, multiples semillas, condiciones de iluminacion y posicion variadas) y sin mecanismos de seguridad externos al modelo.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a tiendas de deporte y no guardan relacion con el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_3pm
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Citacion indicada en la model card: Cadene, Remi; Alibert, Simon; et al. "LeRobot", 2024, https://github.com/huggingface/lerobot
