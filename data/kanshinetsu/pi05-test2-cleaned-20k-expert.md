# kanshinetsu/pi05-test2-cleaned-20k-expert

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos y la ejecucion de tareas roboticas manipulativas. Este repositorio concreto, `kanshinetsu/pi05-test2-cleaned-20k-expert`, es un fine-tuning del modelo base Pi05 realizado con la libreria LeRobot de Hugging Face sobre un dataset propio de 31 episodios y 27.207 frames grabados a 30 FPS para una unica tarea: "Move the box into the black square area".

El modelo consume observaciones multimodales (estado articular de 6 dimensiones e imagenes de tres camaras: side, wrist y top) y produce un vector de accion de 6 dimensiones. Con 4.143.404.816 parametros y un repositorio de 16,6 GB en formato safetensors, se trata de un checkpoint de investigacion orientado a un robot `so_follower` (SO-100/SO-101 de LeRobot), no de un modelo de lenguaje generalista.

Su relevancia es acotada: es un ejemplo practico de como el pipeline de LeRobot permite adaptar un VLA de proposito general a una tarea especifica de manipulacion mediante imitation learning, con 20.000 pasos de entrenamiento y batch size 1. No obstante, al no publicarse resultados de evaluacion ni licencia, debe tratarse como material de referencia y no como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) Pi05, adaptada de OpenPI e implementada en LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a texto general) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (libreria lerobot) |

Especificaciones adicionales del policy:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `side` (3, 360, 640), `wrist` (3, 720, 1280), `top` (3, 360, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | `kanshinetsu/test2_cleaned` (31 episodios, 27.207 frames, 30 FPS) |
| Tarea entrenada | "Move the box into the black square area." |
| Pasos de entrenamiento | 20.000 |
| Batch size | 1 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Seed | 1000 |
| Version de LeRobot | 0.7.0 |
| Tamano del repo | 16,6 GB |

## Arquitectura y entrenamiento

Pi05 es un modelo Vision-Language-Action que combina un backbone vision-language con un cabezal de generacion de acciones, siguiendo el linaje de π₀ de Physical Intelligence. La implementacion disponible en este repositorio procede del repositorio OpenPI del autor original y ha sido portada a LeRobot. El modelo procesa simultaneamente el estado del robot (6 dimensiones) y tres flujos de imagen de resoluciones distintas (360x640 para side y top, 720x1280 para wrist) para emitir comandos de accion de 6 dimensiones, tipicamente correspondientes a las articulaciones de un brazo SO-100/SO-101.

El entrenamiento de este checkpoint concreto se realizo mediante imitation learning supervisado sobre el dataset `kanshinetsu/test2_cleaned`, compuesto por 31 episodios y 27.207 frames a 30 FPS de una unica tarea de manipulacion. Se ejecutaron 20.000 pasos con batch size 1, optimizador AdamW y learning rate 2,5e-05, usando la version 0.7.0 de LeRobot. No se documenta en la informacion disponible si hubo RLHF, DPO ni ninguna fase de post-entrenamiento adicional; tampoco se detalla la composicion del dataset mas alla del numero de episodios y frames.

## Capacidades

- Generacion de acciones roboticas de 6 dimensiones para un robot `so_follower` a partir de observaciones multimodales (estado + tres camaras).
- Percepcion visual multi-camara con resoluciones asimetricas (side y top a 360x640, wrist a 720x1280).
- Ejecucion de una tarea manipulativa concreta: "Move the box into the black square area".
- Condicionamiento por instruccion en lenguaje natural (campo `--task` en el CLI de rollout).
- Integracion con el ecosistema LeRobot para entrenamiento, rollout y publicacion en el Hub.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual general, matematicas, codigo ni vision generalista fuera del ambito robotico.

## Casos de uso

- Manipulacion de objetos en entorno controlado: el policy puede ejecutar la tarea de mover una caja a una zona cuadrada negra sobre un robot SO-100/SO-101, usando las tres camaras para localizar el objeto y el estado articular para planificar la accion.
- Base para fine-tuning de tareas similares: al estar integrado en LeRobot, sirve como punto de partida para reentrenar con `lerobot-train` sobre otros datasets de pick-and-place, ajustando el learning rate y los pasos.
- Investigacion en imitation learning: permite reproducir el pipeline completo (grabacion de datos, limpieza, entrenamiento y rollout) con un caso real de 27.207 frames y 31 episodios, util para comparar hiperparametros.
- Validacion de hardware SO-100/SO-101: el policy se puede desplegar con `lerobot-rollout` para verificar calibracion de camaras y articulaciones antes de entrenar tareas propias.
- Docencia y demos de VLA: el repositorio incluye comandos listos para ejecutar, lo que facilita demostraciones de un VLA de Physical Intelligence en hardware de bajo coste.
- Benchmark interno de generalizacion: al ser un fine-tuning sobre una unica tarea, permite medir la degradacion del modelo base Pi05 al especializarlo, comparando el rendimiento en la tarea entrenada frente a variaciones de posicion, iluminacion o distractores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de comparaciones con el modelo base Pi05.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parametros en safetensors (16,6 GB), en FP16 se requieren aproximadamente 8,3 GB solo para pesos, mas overhead de activaciones y buffers de imagen; en FP32 serian unos 16,6 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16-24 GB (RTX 4090, A5000, L4) seria suficiente en FP16; A100/H100 para entrenamiento o lotes mayores.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) en FP16, aunque no esta verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robotica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS segun el dataset, pero no se confirma que el policy alcance esa frecuencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kanshinetsu/pi05-test2-cleaned-20k-expert` | 4.143.404.816 | no disponible | Manipulacion robotica (1 tarea) | no disponible | Hugging Face, 0 descargas |
| Pi05 base (Physical Intelligence) | no disponible | no disponible | VLA generalista open-world | no disponible | OpenPI (repositorio de Physical Intelligence) |
| Pi0 (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible | OpenPI |
| Otros policies LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitation learning por tarea | tipicamente Apache-2.0 en LeRobot | Hugging Face / LeRobot |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible, ya que no se publican benchmarks ni especificaciones completas del modelo base Pi05 en este repositorio.

## Limitaciones y advertencias

- Especializacion extrema: entrenado exclusivamente para "Move the box into the black square area" con 31 episodios; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluacion: no hay tasa de exito ni pruebas en robot real publicadas, por lo que se desconoce su robustez ante cambios de iluminacion, posicion de objetos o distractores.
- Licencia no disponible: la model card indica "[More Information Needed]"; no se puede asumir uso comercial sin consultar al autor y a Physical Intelligence por el modelo base.
- Dataset muy pequeno: 31 episodios y 27.207 frames es un volumen bajo para imitation learning, con riesgo de sobreajuste y poca variabilidad.
- Hardware especifico: solo funciona con robot `so_follower` y la configuracion exacta de tres camaras (side, wrist, top) con las resoluciones indicadas; cualquier cambio invalida el policy.
- Riesgo de alucinacion en el sentido de acciones incorrectas: como todo policy de imitation learning, puede ejecutar movimientos no seguros ante observaciones fuera de distribucion.
- Idiomas: no se documenta soporte multilingue; la instruccion de tarea es en ingles y el modelo no es un LLM generalista.
- Fecha de creacion futura (2026-11-20) en los metadatos del Hub: conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanshinetsu/pi05-test2-cleaned-20k-expert
- Dataset de entrenamiento: https://huggingface.co/datasets/kanshinetsu/test2_cleaned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kanshinetsu/test2_cleaned
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
