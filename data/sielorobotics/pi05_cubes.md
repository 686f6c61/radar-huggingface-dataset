# SieloRobotics/pi05_cubes

## Resumen

SieloRobotics/pi05_cubes es un modelo de Vision-Language-Action (VLA) para robótica, publicado por SieloRobotics en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo base lerobot/pi05_base, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence en el framework LeRobot. El modelo consume observaciones visuales y de estado del robot y produce directamente comandos de accion de 7 dimensiones, lo que permite controlar un brazo robotico de forma extremo a extremo a partir de instrucciones en lenguaje natural.

El modelo resuelve una tarea concreta de manipulacion: recoger cubos y colocarlos en una caja ("pick up the cubes and place them into the box"). Esta especializado para el robot `rebot_b601_follower` y utiliza dos camaras (muñeca y cenital) junto con el estado de 7 grados de libertad. Con 4.143.404.816 parametros (aproximadamente 4,14 mil millones, segun los metadatos de safetensors) y una licencia Apache 2.0, es relevante porque demuestra el flujo de trabajo de ajuste fino de un modelo fundacional VLA sobre un dataset propio de demostraciones, un patron cada vez mas comun para desplegar politicas roboticas especificas.

El repositorio ocupa 391,8 GB, coherente con un checkpoint VLA que combina un backbone vision-lenguaje con un modulo experto de acciones. La model card no especifica la longitud de contexto, los idiomas soportados ni resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); evolucion de π₀ (Pi05). Detalles internos no disponibles |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors; no se listan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

La model card describe π₀.₅ (Pi05) como un modelo de Vision-Language-Action de Physical Intelligence disenado para generalizacion en mundo abierto, evolucionando π₀ para generalizar a entornos y situaciones nuevos no vistos durante el entrenamiento. La implementacion incluida en LeRobot esta adaptada del repositorio open source OpenPI de Physical Intelligence. No se detalla en la informacion disponible la composicion exacta del backbone (transformer, atencion, modulo experto de acciones, etc.), por lo que estos detalles tecnicos quedan como "no disponible".

El ajuste fino se realizo sobre el dataset SieloRobotics/rebot_pick_place, compuesto por 512 episodios y 616.589 fotogramas a 30 FPS, correspondientes a la tarea de recoger cubos y colocarlos en una caja. La configuracion de entrenamiento reportada es: 30.000 pasos, batch size 16, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot version 0.6.2. No se indica si hubo RLHF, DPO u otras fases de alineacion posteriores al ajuste supervisado/imitacion.

## Capacidades

- Generacion de acciones roboticas: produce un vector de accion de forma `(7,)` a partir de observaciones, adecuado para control de un brazo de 7 grados de libertad.
- Percepcion visual multimodal: consume dos flujos de imagen de `(3, 480, 640)` por observacion (camaras `wrist` y `top`) junto con el estado del robot `(7,)`.
- Condicionamiento por lenguaje: acepta una instruccion de tarea en texto (por ejemplo, "pick up the cubes and place them into the box") que guia la politica.
- Ejecucion de politicas de imitacion: entrenado para reproducir demostraciones de manipulacion en un robot concreto (`rebot_b601_follower`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, razonamiento simbolico, matematicas, generacion de codigo ni modos especiales de "thinking".

## Casos de uso

- Recogida y colocacion de objetos (pick and place): el modelo esta entrenado especificamente para coger cubos y depositarlos en una caja, por lo que es adecuado para automatizar esta tarea repetitiva de manipulacion en un banco de trabajo.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el ajuste fino de un VLA fundacional sobre un dataset propio de 512 episodios y 616.589 fotogramas a 30 FPS.
- Prototipado de politicas VLA en robot de bajo coste: al estar vinculado al robot `rebot_b601_follower` con dos camaras, permite validar el pipeline completo de LeRobot (grabacion, entrenamiento y rollout) con hardware accesible.
- Base para transferencia a tareas similares: puede reutilizarse como checkpoint inicial para fine-tunes posteriores de tareas de recogida con nuevas posiciones de objeto o iluminacion, dado que se ajusto desde `lerobot/pi05_base`.
- Evaluacion de generalizacion en mundo abierto: al derivar de π₀.₅, es util para medir cuanto generaliza una politica sobre objetos y entornos no vistos, comparando el rendimiento en escenarios controlados.
- Demostraciones y docencia en robotica: el comando `lerobot-rollout` de la model card permite lanzar la politica durante un tiempo acotado (`--duration=60`) para mostrar el comportamiento en ferias, clases o videos de validacion.
- Integracion en flujos de laboratorio con LeRobot: encaja en pipelines de investigacion que ya usan `lerobot-train`, `lerobot-rollout` y el espacio de visualizacion de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito en robot real ni metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de 4,14 mil millones de parametros; cifras aproximadas calculadas, no reportadas por el autor):
  - Precisión completa FP32: ~16,6 GB de pesos.
  - Precisión BF16/FP16: ~8,3 GB de pesos.
  - Cuantizacion INT8: ~4,1 GB de pesos.
  - Cuantizacion INT4: ~2,1 GB de pesos.
- Estas cifras solo contemplan los pesos; hay que sumar activaciones, buffers de atencion y el procesamiento de dos imagenes de 480x640 por paso, por lo que el consumo real sera mayor.
- GPU recomendadas: no especificadas por el autor. En funcion del tamano, una GPU con 16-24 GB (por ejemplo, RTX 4090, A100 40 GB, H100) deberia poder alojar el modelo en BF16 con margen para el preprocesado visual.
- Compatibilidad con GPU de consumo: probable en BF16 en una RTX 4090 (24 GB) y en tarjetas de 16 GB si se recurre a cuantizacion o a una gestion cuidadosa de memoria; no confirmado por el autor.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot (`lerobot-rollout` en la model card). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que estan orientadas a LLM de texto y no a este tipo de politica VLA.
- Latencia y throughput: no disponibles. La relevancia de estos datos es critica, ya que para control en tiempo real a 30 FPS el modelo necesitaria inferir a ~33 Hz, pero no se aporta ninguna medicion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SieloRobotics/pi05_cubes | VLA (fine-tune) | ~4,14 mil millones | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| lerobot/pi05_base | VLA (base) | no disponible en la informacion | no disponible | no disponible en la informacion | HuggingFace (modelo base citado) |
| π₀ (pi0) | VLA (predecesor) | no disponible en la informacion | no disponible | no disponible en la informacion | Repositorio OpenPI de Physical Intelligence (citado) |

No se dispone de datos de rendimiento, contexto ni parametros de los modelos comparables dentro de la informacion proporcionada, por lo que la comparacion se limita a la relacion de ajuste (base frente a fine-tune) y a la licencia.

## Limitaciones y advertencias

- Sin resultados de evaluacion: no hay tasas de exito ni pruebas en robot real, por lo que el rendimiento efectivo es desconocido.
- Especializacion estrecha: entrenado unicamente para la tarea "pick up the cubes and place them into the box"; es previsible que falle fuera de esa tarea, con objetos distintos o con posiciones no representadas en el dataset.
- Dependencia del hardware: la politica asume el robot `rebot_b601_follower` y dos camaras concretas (`wrist` y `top`) con la geometria y calibracion usadas en la recogida de datos; cambiar la configuracion invalida el modelo.
- Riesgo de sobreajuste al entorno de entrenamiento: 512 episodios y 616.589 fotogramas limitan la variedad de iluminacion, fondos y distractores; la generalizacion a entornos nuevos no esta verificada.
- Sin datos sobre sesgos, idiomas ni robustez linguistica: al ser una politica robotica condicionada por texto, no se documentan sesgos ni cobertura multilingue de las instrucciones.
- Contexto no definido: se desconoce la longitud de contexto, lo que impide planificar tareas de horizonte largo o conversaciones multi-turno.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al derivar de `lerobot/pi05_base` conviene revisar las condiciones y atribuciones de los modelos base y del dataset originales.
- Repositorio muy pesado: 391,8 GB dificultan la descarga, el versionado y el despliegue en entornos con almacenamiento limitado.
- Cero adopcion registrada: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SieloRobotics/pi05_cubes
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SieloRobotics/rebot_pick_place
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SieloRobotics/rebot_pick_place
