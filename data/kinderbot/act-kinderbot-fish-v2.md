# kinderbot/act-kinderbot-fish-v2

## Resumen

kinderbot/act-kinderbot-fish-v2 es una política robotica de imitacion basada en ACT (Action Chunking with Transformers), entrenada y publicada con la libreria LeRobot de Hugging Face. No es un modelo de lenguaje: su entrada son observaciones del robot (estado de 6 dimensiones y dos flujos de imagen de 480x640 procedentes de las camaras de muneca y frontal) y su salida es un vector de accion de 6 dimensiones. Resuelve una tarea concreta de manipulacion: coger un pez de una caja y dejarlo sobre la mesa.

El modelo lo desarrolla el usuario kinderbot, tiene 51.668.614 parametros (segun los pesos safetensors) y ocupa 0,2 GB en el repositorio. Su relevancia es la de un checkpoint de imitacion reproducible y ligero: cualquier persona con un robot SO follower puede desplegarlo con la CLI de LeRobot y comparar resultados, ya que el dataset de entrenamiento (kinderbot/kinderbot-pick-fish-v2, 51 episodios y 18.366 frames a 30 FPS) tambien es publico.

Se distribuye bajo licencia apache-2.0 y el metodo de referencia es el articulo 2304.13705. El autor no ha publicado todavia resultados de evaluacion en robot real, por lo que el rendimiento de la tarea no esta cuantificado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitacion con prediccion de trozos de accion |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica robotica; no dispone de ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan esquemas de cuantizacion) |
| Idiomas soportados | no disponibles (modelo de robotica, sin capacidades de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | so_follower |
| Camaras | wrist, front |
| Entradas | observation.state (6,), observation.images.wrist (3, 480, 640), observation.images.front (3, 480, 640) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir un unico paso de accion, predice trozos cortos de acciones (action chunks); aprende a partir de datos de teleoperacion y suele alcanzar tasas de exito altas en tareas de manipulacion. El modelo consume el estado del robot y dos vistas de camara, y produce acciones de 6 dimensiones. La referencia tecnica es el articulo Action Chunking with Transformers (arXiv:2304.13705).

El entrenamiento se realizo con LeRobot 0.6.2 durante 100.000 pasos, con batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. El dataset de entrenamiento es kinderbot/kinderbot-pick-fish-v2, compuesto por 51 episodios y 18.366 frames grabados a 30 FPS para la tarea "Pick the fish from the box and place it on the table". No se documenta en la model card el uso de RLHF, DPO ni otras fases de alineamiento, ni el detalle de aumentos de datos o composicion exacta de las observaciones.

## Capacidades

- Control de manipulacion de 6 grados de libertad sobre un robot so_follower, emitiendo vectores de accion de dimension 6.
- Percepcion visual con dos camaras simultaneas (muneca y frontal) a 480x640, combinada con el estado proprioceptivo de 6 dimensiones.
- Prediccion de trozos de accion (action chunking) en lugar de pasos aislados, lo que aporta coherencia temporal en la ejecucion.
- Ejecucion de una tarea de pick-and-place concreta: coger un pez de una caja y colocarlo sobre la mesa.
- Aprendizaje por imitacion a partir de teleoperacion; admite reentrenamiento con nuevos datasets mediante lerobot-train.
- Compatibilidad con el ecosistema LeRobot para rollout, evaluacion y publicacion en el Hub.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, capacidades de agente, modo thinking, audio ni capacidades multilingues.

## Casos de uso

- Automatizacion de pick-and-place en un banco de laboratorio o celda de almacen: el modelo ejecuta la secuencia de coger un objeto de una caja y soltarlo en la mesa usando la camara de muneca para el agarre y la frontal para la aproximacion.
- Baseline reproducible para investigacion en aprendizaje por imitacion: al estar el dataset y la configuracion de entrenamiento publicados, sirve como referencia con la que comparar variantes de ACT u otros metodos bajo las mismas condiciones.
- Reentrenamiento para una tarea propia: partiendo del dataset o de la configuracion, se puede afinar una politica con lerobot-train para tareas de agarre y colocacion en el mismo robot SO follower.
- Validacion de hardware y calibracion: ejecutar el rollout completo (lerobot-rollout) permite comprobar el montaje de camaras, puertos y cinematica antes de abordar tareas mas complejas.
- Docencia en robotica y aprendizaje por imitacion: el tamano reducido (51,7 M de parametros) y el flujo de trabajo de LeRobot hacen viable entrenar y desplegar en sesiones practicas con hardware de bajo coste.
- Recoleccion de datos para ciclos de mejora: el propio despliegue genera trayectorias que pueden anadirse al dataset y usarse para reentrenar el modelo, cerrando un bucle de aprendizaje iterativo.
- Pruebas de integracion en celdas robotizadas con percepcion multi-camara: el modelo demuestra un patron de entrada de dos vistas mas estado que puede replicarse para otras lineas de montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica, por lo que no existen tasas de exito en robot real ni metricas comparativas para la tarea de pick-and-place.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB solo para los pesos en fp32 (51,7 M de parametros), y del orden de 1 a 2 GB considerando las activaciones de los dos codificadores de imagen a 480x640; estas cifras son estimaciones a partir del recuento de parametros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, ya que el modelo es muy pequeno (por ejemplo, RTX 3060 en adelante). No se requiere A100 ni H100, y el modelo tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, sin limitaciones practicas de memoria por el tamano del modelo.
- Opciones de despliegue: CLI de LeRobot (lerobot-rollout con --policy.path=kinderbot/act-kinderbot-fish-v2) sobre PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; el dataset se grabo a 30 FPS, pero no se ha publicado ninguna medicion de latencia de inferencia ni de frecuencia de control alcanzada en robot real.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables para este checkpoint. A continuacion se situa frente a otras familias de politicas del ecosistema LeRobot a nivel cualitativo; los valores de parametros y contexto de las alternativas no estan disponibles en la informacion proporcionada.

| Modelo | Categoria | Parametros | Formato | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| act-kinderbot-fish-v2 | ACT, imitacion con action chunking | 51,7 M | safetensors (lerobot) | apache-2.0 | no disponible |
| Otras politicas ACT del Hub de LeRobot | ACT, imitacion | no disponible | safetensors (lerobot) | variable | no disponible |
| Diffusion Policy (LeRobot) | imitacion generativa | no disponible | safetensors (lerobot) | variable | no disponible |
| SmolVLA (LeRobot) | vision-language-action | no disponible | safetensors (lerobot) | variable | no disponible |

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea ("Pick the fish from the box and place it on the table"); no generaliza a otras tareas sin reentrenamiento.
- No se han publicado resultados de evaluacion, por lo que se desconoce su tasa de exito real en robot, su robustez ante cambios de posicion de objetos, iluminacion o distractores.
- La politica esta entrenada para el tipo de robot so_follower y para las camaras wrist y front; usar otra morfologia, otra disposicion de camaras o nombres de observacion distintos puede impedir el funcionamiento.
- Los nombres de las camaras deben coincidir exactamente con las claves de observacion del entrenamiento; una discrepancia provoca fallos de ejecucion.
- Dataset reducido (51 episodios, 18.366 frames), lo que limita la variedad de situaciones cubiertas y aumenta el riesgo de sobreajuste a las condiciones de grabacion.
- Riesgo de acumulacion de error y de comportamientos fuera de distribucion ante estados no vistos durante el entrenamiento.
- Idiomas: no aplica; el modelo no procesa lenguaje.
- Licencia apache-2.0, que permite uso comercial siempre que se conserven los avisos de licencia y atribucion correspondientes; conviene citar tambien la metodologia ACT y LeRobot.
- Para produccion: no se documentan pesos en formato GGUF ni pipelines optimizados, y el repositorio no incluye video de demostracion ni resultados de evaluacion que respalden el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinderbot/act-kinderbot-fish-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/kinderbot/kinderbot-pick-fish-v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kinderbot/kinderbot-pick-fish-v2
- Articulo ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
