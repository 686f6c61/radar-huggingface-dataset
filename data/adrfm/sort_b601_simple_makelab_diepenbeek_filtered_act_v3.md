# adrfm/sort_b601_simple_makelab_diepenbeek_filtered_act_v3

## Resumen

`adrfm/sort_b601_simple_makelab_diepenbeek_filtered_act_v3` es una política de robótica basada en ACT (Action Chunking with Transformers) entrenada mediante aprendizaje por imitación sobre teleoperación real. La publica el usuario `adrfm` utilizando LeRobot, la librería de Hugging Face para aprendizaje automático en robótica del mundo real, y está pensada para ejecutarse sobre un robot `seeed_b601_rs_follower` con dos cámaras (`side` y `wrist`).

El modelo resuelve una tarea concreta de manipulación: coger discos de un plato gris y colocarlos según su color (disco negro en el plato rojo, disco blanco en el plato azul). Con 51.721.863 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo pequeño y especializado, no un modelo de lenguaje: consume estado proprioceptivo de 7 dimensiones y dos imágenes RGB de 480x640, y produce vectores de acción de 7 dimensiones.

Su relevancia es la de un ejemplo práctico y reproducible de política visuomotora entrenada de extremo a extremo con datos propios (52 episodios, 44.480 fotogramas a 30 FPS) y publicada en abierto bajo licencia Apache 2.0. No es un modelo de propósito general ni compite en benchmarks de lenguaje: es una política de un solo task, un solo robot y una sola configuración de cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder-decodificador y componente CVAE; encoder visual tipo ResNet (detalle de variante no disponible) |
| Parametros totales | 51.721.863 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 2 imagenes RGB de 480x640 mas estado de 7 dimensiones |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la instruccion de tarea se pasa como cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |
| Tipo de robot | `seeed_b601_rs_follower` |
| Camaras | `side`, `wrist` |
| Espacio de observacion | `observation.state` (7,), `observation.images.side` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Espacio de accion | `action` (7,) |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el articulo arXiv:2304.13705 que predice fragmentos (*chunks*) de acciones en lugar de un unico paso. En lugar de emitir una accion por inferencia, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de acumulacion y suaviza el comportamiento en tareas de manipulacion. La formulacion habitual incluye un encoder visual convolucional para las camaras, un encoder de estado, un transformer encoder-decodificador y un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas. El modelo card no detalla la configuracion exacta de capas, dimensiones ni la longitud del chunk.

El entrenamiento se realizo exclusivamente sobre el dataset `adrfm/sort_b601_simple_makelab_diepenbeek_filtered`: 52 episodios, 44.480 fotogramas a 30 FPS, con la tarea "Pick disks from grey plate and place black disk on red plate, white disk on blue plate". La configuracion registrada es de 55.600 pasos de entrenamiento, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta composicion adicional del dataset, aumentos de datos, ni fases de RLHF o DPO (no aplicables a este tipo de politica). Tampoco se documenta ninguna innovacion adicional mas alla del propio metodo ACT.

## Capacidades

- Generacion de acciones de manipulacion de 7 grados de libertad a partir de observaciones visuales y de estado.
- Prediccion por chunks de acciones, con el suavizado temporal que ello implica en la ejecucion sobre el robot.
- Percepcion visual desde dos puntos de vista simultaneos (camara lateral y camara de muneca) a 480x640.
- Ejecucion de una unica tarea de clasificacion y colocacion de discos por color.
- Integracion nativa con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje ni un agente de texto).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se documentan modos de razonamiento, vision generativa ni audio. La unica modalidad de salida es acción motora.

## Casos de uso

- Automatizacion de una celda de pick-and-place de discos: la politica puede ejecutar el ciclo completo de recogida y clasificacion por color sobre un `seeed_b601_rs_follower`, sustituyendo la teleoperacion manual durante la operacion.
- Base para fine-tuning en tareas de clasificacion de objetos por color: partiendo de estos pesos, se puede reentrenar con un dataset propio que cambie formas, platos o posiciones, aprovechando que el pipeline de LeRobot esta documentado.
- Banco de pruebas de aprendizaje por imitacion: sirve como referencia reproducible para medir el efecto del numero de episodios, la tasa de aprendizaje o el batch size en la tasa de exito de una politica ACT.
- Validacion de hardware y calibracion: al ser un modelo pequeno que cabe en una GPU de consumo, permite iterar rapidamente en la calibracion de camaras, puertos y cinematica del robot antes de escalar a tareas mas complejas.
- Demostraciones educativas de robotica: su tamano (51,7 M de parametros, 0,2 GB) y su licencia Apache 2.0 lo hacen adecuado para cursos y talleres donde se ensena a entrenar y desplegar politicas visuomotoras.
- Investigacion en generalizacion de politicas: permite estudiar como se degrada el rendimiento al cambiar la iluminacion, la posicion de los platos o el robot fisico, dado que no hay resultados de evaluacion publicados que sirvan de linea base.
- Prototipado de integracion con ROS u otros middlewares: al exponer un espacio de accion de 7 dimensiones y observaciones estandarizadas, se puede envolver en un nodo que traduzca las acciones a comandos del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la indicacion explicita "No evaluation results have been provided for this policy yet", por lo que no existe tasa de exito, numero de ensayos ni comparacion con otras politicas.

| Metrica | Valor |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de ensayos | no disponible |
| Benchmarks simulados (por ejemplo, LIBERO, ALOHA) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP32 (51,7 M de parametros) y en torno a 0,1 GB en FP16, sin contar el *overhead* de los marcos de trabajo ni los buffers de imagen.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo es viable en tarjetas de gama de entrada. Tambien puede ejecutarse en CPU, aunque con mayor latencia por fotograma.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.), dado su tamano reducido.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), integracion directa con PyTorch y CUDA mediante `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. El dato relevante es que debe sostener el bucle de control a 30 FPS, que es la frecuencia del dataset de entrenamiento, pero no se publica ninguna medicion de latencia.
- Requisitos adicionales: robot `seeed_b601_rs_follower`, dos camaras configuradas a 640x480 y 30 FPS con nombres que coincidan con las claves de observacion (`side` y `wrist`), y puerto de comunicacion del robot correctamente especificado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`..._act_v3`) | ACT, aprendizaje por imitacion | 51.721.863 | 2 imagenes 480x640 + estado (7,) | Apache 2.0 | Hugging Face, 0 descargas |
| Otras politicas ACT de LeRobot | ACT, aprendizaje por imitacion | no disponible | depende del dataset y del robot | habitualmente Apache 2.0 | Hugging Face |
| Diffusion Policy | politica generativa por difusion | no disponible | depende del dataset y del robot | no disponible | implementaciones publicas |
| SmolVLA y similares (VLA) | vision-language-action | no disponible en la informacion proporcionada | entrada multimodal con instruccion en lenguaje natural | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales y de licencia. Este modelo esta atado a un robot y a una tarea concretos, a diferencia de las politicas VLA, que aspiran a generalizar entre tareas y plataformas.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea, un unico robot y una unica disposicion de camaras. No cabe esperar transferencia a otras tareas sin reentrenamiento.
- Sin resultados de evaluacion: el autor no ha publicado tasa de exito ni numero de ensayos, por lo que el rendimiento real en robot es desconocido.
- Dataset reducido: 52 episodios y 44.480 fotogramas son una base pequena, lo que aumenta el riesgo de sobreajuste al entorno de grabacion (iluminacion, fondo, posiciones de los platos).
- Dependencia del entorno: cambios en la iluminacion, en la posicion inicial de los objetos, en el fondo o en distractores pueden degradar el comportamiento; no se documenta ninguna prueba de robustez.
- Dependencia del hardware: exige el robot `seeed_b601_rs_follower` y dos camaras con nombres `side` y `wrist`; si los indices o los nombres no coinciden, el script de despliegue fallara.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje, pero existe el riesgo equivalente de acciones espurias o inseguras cuando la politica se sale de la distribucion de entrenamiento.
- Sesgos: no se documentan sesgos especificos, aunque al proceder de teleoperacion humana hereda los sesgos de las demostraciones (trayectorias, velocidades y estrategias del operador).
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el fichero de cambios; conviene citar tambien ACT y LeRobot segun la model card.
- Caveat de produccion: antes de usarlo en un entorno real hay que validar limites de seguridad, paradas de emergencia y comportamiento ante fallos de percepcion; el modelo no incorpora ninguna capa de seguridad.
- Idiomas: no aplica, pero la instruccion de tarea debe coincidir con la cadena usada en el entrenamiento para evitar ambiguedad en el condicionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adrfm/sort_b601_simple_makelab_diepenbeek_filtered_act_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/adrfm/sort_b601_simple_makelab_diepenbeek_filtered
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=adrfm/sort_b601_simple_makelab_diepenbeek_filtered
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
