# puppet-robotics/checkpoint_test_sim

## Resumen

`puppet-robotics/checkpoint_test_sim` es un punto de control (checkpoint) de robótica entrenado con LeRobot y publicado en HuggingFace por el usuario `puppet-robotics`. No es un modelo de lenguaje: es una política de Vision-Language-Action (VLA) derivada de π₀.₅ (Pi05), el modelo de Physical Intelligence orientado a generalización en entornos abiertos, y afinada a partir del modelo base `lerobot/pi05_base`. El repositorio contiene 4.143.404.816 parámetros en formato safetensors (9,4 GB) y está etiquetado con licencia Apache-2.0.

El modelo resuelve una tarea de manipulación robótica concreta: controlar un robot de tipo `oscar` para la tarea "Play golf", a partir de dos cámaras (`wrist` y `ego`) y del estado del robot. Consume `observation.state` de dimensión 8, una imagen de muñeca de 3x480x640 y una imagen egocéntrica de 3x720x1280, y produce un vector de acción de dimensión 8.

Su relevancia práctica es limitada y hay que leerla con cautela: el nombre del repositorio sugiere que es un checkpoint de prueba, se ha entrenado solo 1000 pasos sobre 350 episodios (20.034 fotogramas a 8 FPS) y la propia model card indica que no se han publicado resultados de evaluación. Es, por tanto, material de interés para reproducir el flujo de trabajo de LeRobot con π₀.₅, no una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementacion de LeRobot adaptada del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 (segun safetensors) |
| Parametros activos | no disponible (no se anuncia como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (la tarea se especifica como texto, en este caso "Play golf") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de la libreria lerobot) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(8,)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `observation.images.ego` | VISUAL | `(3, 720, 1280)` |
| `action` | ACTION | `(8,)` |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLA de Physical Intelligence disenado para generalizacion en mundo abierto: π₀.₅ evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion incluida en este repositorio procede de LeRobot y esta adaptada del repositorio open source OpenPI. No se detallan en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset original, ni si se aplicaron etapas de RLHF o DPO; tampoco se especifican innovaciones de atencion o decodificacion para esta politica concreta.

Lo que si esta documentado es el afinado de esta politica concreta: se parte de `lerobot/pi05_base` y se entrena sobre el dataset `puppet-robotics/golf-2-8fps-plus-no-putt` (350 episodios, 20.034 fotogramas, 8 FPS, tarea "Play golf"), con 1000 pasos de entrenamiento, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.2. Se trata de un ajuste muy corto, coherente con un checkpoint de prueba o de validacion del pipeline mas que con una politica convergida. El robot objetivo es de tipo `oscar`, con camaras `wrist` y `ego`.

## Capacidades

- Control de robot manipulador: genera vectores de accion de 8 dimensiones para un robot `oscar`.
- Aprendizaje por imitacion (imitation learning / behavior cloning) a partir de demostraciones registradas con LeRobot.
- Percepcion visual multi-camara: procesa simultaneamente una vista de muneca (480x640) y una vista egocentrica (720x1280).
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica como texto ("Play golf").
- Ejecucion de una tarea concreta de manipulacion: golpear una pelota de golf (dataset "golf-2-8fps-plus-no-putt").
- Integracion con el ecosistema LeRobot: carga mediante `lerobot-rollout` y `--policy.path`.
- No se documenta soporte de tool calling, function calling, uso como agente multi-paso, generacion de texto, codigo, matematicas, audio ni modo de razonamiento explicito.
- No se documenta soporte multilingue.

## Casos de uso

- Reproduccion de una politica VLA en robot real: ejecutar `lerobot-rollout` con `--robot.type=oscar`, las camaras `wrist` y `ego`, y el checkpoint, para verificar que el pipeline de inferencia funciona de extremo a extremo antes de entrenar una politica definitiva.
- Validacion de un pipeline de entrenamiento: dado que se entrenaron solo 1000 pasos, sirve como referencia para comprobar que la configuracion de `lerobot-train` (dataset, batch, learning rate, semilla) produce checkpoints cargables.
- Pruebas de integracion de hardware: verificar puertos, indices de camara, calibracion y frecuencias antes de lanzar un entrenamiento largo, ya que el modelo exige que los nombres de camara coincidan con las claves de observacion del entrenamiento.
- Punto de partida para un ajuste adicional: al derivar de `lerobot/pi05_base`, se puede continuar el entrenamiento con mas pasos o con un dataset mayor de la misma tarea de golf.
- Investigacion en imitation learning: usar el par (dataset de 350 episodios, checkpoint) como caso de estudio de cuanto aprende una politica VLA con un presupuesto de entrenamiento minimo.
- Evaluacion en simulacion: el identificador del repositorio (`_sim`) apunta a un uso en simulador; seria el escenario adecuado para medir tasas de exito sin riesgo sobre hardware fisico.
- Generacion de datos comparativos: registrar ejecuciones de esta politica como linea base frente a futuros checkpoints entrenados con mas pasos sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No hay tablas de tasa de exito por tarea, ni numero de ensayos, ni comparaciones con otras politicas. Tampoco se proporcionan metricas de MMLU, HumanEval, GSM8K ni equivalentes, que no aplican a una politica de robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 4,14 mil millones de parametros, en bf16/fp16 los pesos ocupan aproximadamente 8,3 GB; sumando activaciones, el codificador visual y dos flujos de imagen (720p y 480p), es razonable reservar entre 12 y 16 GB. Son estimaciones calculadas, no datos publicados por el autor.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para despliegue con margen; RTX 4090 o RTX 3090 (24 GB) como opcion de gama alta para consumidor.
- Cabe en GPU de consumidor: previsiblemente si en RTX 4090, RTX 3090 y RTX 4080 (16 GB), con margen ajustado en las de 16 GB. No se documenta soporte ni rendimiento en GPUs de 8 GB.
- Opciones de despliegue: `lerobot-rollout` con PyTorch y CUDA es la ruta documentada. No se mencionan vLLM, TGI, llama.cpp ni Ollama; al tratarse de una politica VLA con salida de acciones y no de texto, estas herramientas no son aplicables segun la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia de diseno, el dataset se registro a 8 FPS, lo que implica un presupuesto de unos 125 ms por paso de control; el modelo base utiliza generacion de acciones, por lo que el coste real dependera del numero de pasos de denoising y del hardware.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones de los modelos alternativos del ecosistema LeRobot, por lo que varias celdas quedan como "no disponible". Todos los modelos listados son politicas VLA del ecosistema LeRobot.

| Modelo | Parametros | Entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `puppet-robotics/checkpoint_test_sim` | 4.143.404.816 | Estado (8,), imagen wrist 480x640, imagen ego 720x1280 | "Play golf" con robot `oscar` | apache-2.0 | Publico en HuggingFace; 0 descargas, 0 likes |
| `lerobot/pi05_base` | no disponible | no disponible | Politica VLA base, ajustable a tareas | no disponible | Publico en HuggingFace (modelo base declarado) |
| `lerobot/pi0_base` | no disponible | no disponible | Politica VLA de la generacion anterior (π₀) | no disponible | no disponible en la informacion proporcionada |
| `lerobot/smolvla_base` | no disponible | no disponible | Politica VLA ligera para robotica | no disponible | no disponible en la informacion proporcionada |

La unica comparacion que puede afirmarse con los datos disponibles es que este checkpoint es un ajuste fino de `lerobot/pi05_base` sobre 350 episodios y 1000 pasos, mientras que el modelo base es un preentrenamiento general que no se ha especializado en la tarea de golf.

## Limitaciones y advertencias

- Especializacion extrema: el ajuste se ha realizado sobre una unica tarea ("Play golf") y un unico tipo de robot (`oscar`); no hay evidencia de que generalice a otras tareas, objetos o morfologias.
- Entrenamiento muy corto: 1000 pasos con lote 32 sobre 20.034 fotogramas. Es un presupuesto minimo y el modelo probablemente no ha convergido.
- Sin evaluacion: la model card no reporta ensayos, tasas de exito ni condiciones de dificultad, por lo que no puede afirmarse ningun nivel de rendimiento. Cualquier despliegue deberia ir precedido de una evaluacion propia.
- Naturaleza de prueba: el nombre del repositorio (`checkpoint_test_sim`) indica que se trata de una prueba, no de una entrega final. El modelo tiene 0 descargas y 0 likes.
- Dependencia del hardware exacto: la politica espera claves de observacion concretas (`observation.images.wrist`, `observation.images.ego`) y un robot `oscar`; usar nombres de camara distintos o una configuracion diferente rompe la inferencia. Las instrucciones del autor advierten de que los nombres deben coincidir con los del entrenamiento.
- Riesgo de alucinacion en el sentido de acciones fuera de distribucion: al ser una politica de imitacion, puede producir acciones no validas ante objetos, iluminacion o posiciones no representadas en los 350 episodios. Existe ademas riesgo fisico inherente a la operacion de un robot real.
- Sesgos: no disponibles. La model card no incluye analisis de sesgos ni de cobertura del dataset.
- Idiomas: no se documenta soporte multilingue; no hay informacion sobre el idioma de las instrucciones.
- Licencia: el repositorio se publica bajo apache-2.0, que permite uso comercial, pero conviene verificar los terminos del modelo base `lerobot/pi05_base` y del modelo original π₀.₅ de Physical Intelligence, ya que la informacion disponible no los detalla.
- Fecha de creacion indicada: 2026-10-01, posterior a la fecha de actualizacion del resto de repositorios del ecosistema; conviene comprobarla antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/puppet-robotics/checkpoint_test_sim
- Dataset de entrenamiento: https://huggingface.co/datasets/puppet-robotics/golf-2-8fps-plus-no-putt
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=puppet-robotics/golf-2-8fps-plus-no-putt
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de entrenamiento con imitation learning: https://huggingface.co/docs/lerobot/en/il_robots
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI de Physical Intelligence (origen de la implementacion): https://github.com/Physical-Intelligence/openpi
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05

Nota sobre la busqueda web: los resultados obtenidos corresponden al software de gestion de configuracion Puppet (puppet.com, puppetlabs/puppet, Wikipedia) y a marionetas, y no guardan relacion con este modelo. No se han encontrado enlaces adicionales relevantes sobre `puppet-robotics/checkpoint_test_sim`.
