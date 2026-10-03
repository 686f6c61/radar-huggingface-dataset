# kiroaiseoul/act_task09_14D_247data_200k

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones ("action chunks") en lugar de pasos individuales. Este checkpoint concreto, publicado por el usuario kiroaiseoul bajo el identificador `act_task09_14D_247data_200k`, es una policy de robotica entrenada con LeRobot sobre un dataset propio de teleoperacion orientado a la tarea de cerrar un frigorifico.

El modelo no es un modelo de lenguaje: es una policy visomotora que consume observaciones (imagenes de camara y estado de las articulaciones) y produce comandos de accion de bajo nivel. Tiene 51.687.056 parametros (unos 51,7 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB, con licencia Apache 2.0.

Su relevancia es practica: demuestra el flujo actual de entrenamiento y publicacion de policies de robotica de bajo coste con LeRobot, reproducible con la CLI de la libreria y desplegable en hardware de consumo. Al tratarse de un checkpoint de tarea unica, su utilidad fuera del entorno y del dataset de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder CVAE y backbone visual convolucional |
| Parametros totales | 51.687.056 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; el modelo consume una ventana de observaciones y predice un chunk de acciones) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no aplica (policy de robotica; no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tarea | cierre de frigorifico (segun el nombre del dataset asociado) |
| Espacio de acciones | no disponible en detalle; la nomenclatura "14D" sugiere 14 dimensiones de accion |
| Dataset de entrenamiento | kiroaiseoul/task09_close_refrigerator_14D_247data |
| Pasos de entrenamiento | no confirmado; la nomenclatura "200k" sugiere 200.000 pasos |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT se describe en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), referenciado en la model card. La arquitectura combina un encoder visual (tipicamente ResNet-18 preentrenado en ImageNet) con un transformer que actua como encoder-decoder, y se entrena como un autoencoder variacional condicional (CVAE): un encoder de estilo procesa la secuencia de acciones objetivo junto con las observaciones y el decoder predice un chunk de acciones futuras. En inferencia, el encoder de estilo se descarta y se muestrea la variable latente, de modo que la policy genera un bloque de acciones de una sola pasada, lo que reduce el error de compounding y permite frecuencias de control mas altas. Los hiperparametros concretos de este checkpoint (numero de capas, dimension del modelo, tamano del chunk, uso de VAE) no se detallan en la informacion disponible; los valores por defecto habituales de la implementacion de ACT en LeRobot son 4 capas de encoder, 1 capa de decoder, dimension 512 y chunk de 100 acciones.

El entrenamiento es de imitacion supervisada (behavioral cloning) sobre el dataset `kiroaiseoul/task09_close_refrigerator_14D_247data`, compuesto por episodios teleoperados. La model card no documenta el numero de episodios, la composicion exacta del dataset, el numero de tokens o frames vistos, ni si se aplico RLHF o DPO (tecnicas que en cualquier caso no son habituales en este tipo de policies). El flujo de entrenamiento documentado es `lerobot-train` con `--policy.type=act`, y la evaluacion se realiza con `lerobot-record` sobre un robot `so100_follower`, lo que indica que el modelo esta pensado para brazos SO-100/SO-101 en configuracion de seguidor.

## Capacidades

- Generacion de acciones motoras: predice chunks de acciones de bajo nivel a partir de observaciones visuales y de estado, en lugar de un unico paso.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas, no sigue instrucciones en lenguaje natural.
- Manipulacion de un grado de libertad concreto: la tarea declarada es cerrar un frigorifico.
- Integracion con el ecosistema LeRobot: entrenamiento, evaluacion y ejecucion mediante la CLI oficial.
- Tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes LLM; el "multi-paso" se limita a la ejecucion secuencial de chunks de acciones.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se documentan modos de pensamiento, vision-language, audio ni otras capacidades adicionales.

## Casos de uso

- Automatizacion de tareas domesticas de manipulacion: cerrar un frigorifico o puertas de armario en un entorno controlado, reutilizando directamente este checkpoint sobre un SO-100 seguidor.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT pequeno (51,7 M de parametros), sirve como punto de partida para reentrenar con `lerobot-train` sobre datasets propios de tareas de agarre y empuje.
- Investigacion en aprendizaje por imitacion: comparar ACT frente a otras policies (Diffusion Policy, VQ-BeT, SmolVLA) en un mismo banco de pruebas fisico, con coste de computo bajo.
- Prototipado rapido en robotica de bajo coste: validar un pipeline completo de teleoperacion, entrenamiento y despliegue en hardware de menos de un GPU de gama alta.
- Evaluacion de robustez ante variaciones visuales: comprobar la degradacion de la policy ante cambios de iluminacion, posicion de camara o fondo, un analisis habitual en este tipo de modelos.
- Demostraciones educativas: ilustrar el ciclo completo de LeRobot (grabar episodios, entrenar, evaluar) en cursos o talleres de robotica.
- Despliegue en el borde (edge): ejecutar la policy en un Jetson o en una GPU integrada para control en tiempo real, dado el reducido tamano del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente indica, de forma generica y refiriendose al metodo ACT, que "a menudo alcanza altas tasas de exito", sin cifras concretas de tasa de exito, numero de episodios de evaluacion ni comparaciones para este checkpoint. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 207 MB en FP32 (51.687.056 parametros x 4 bytes) y unos 103 MB en FP16/BF16, mas el coste de activaciones y del backbone visual, tambien reducido.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo esta muy por debajo de la capacidad de cualquiera de ellas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas, asi como en iGPU, Jetson Orin y placas tipo Raspberry Pi 5 ejecutando en CPU (con latencia mayor).
- Opciones de despliegue: la via documentada es la CLI de LeRobot (`lerobot-record --policy.path=...`) para inferencia y evaluacion, y `lerobot-train` para reentrenamiento. vLLM, TGI o llama.cpp no son aplicables porque son servidores de LLM. Es habitual exportar la policy a ONNX o TorchScript para integraciones a medida, aunque este checkpoint no documenta dicha exportacion.
- Latencia y throughput: no se han publicado mediciones para este checkpoint. Dado el tamano (51,7 M de parametros) y el mecanismo de prediccion por chunks, la inferencia es compatible con control en tiempo real en GPU de consumo, pero no hay cifras verificables en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51,7 M | no aplica (ventana de observaciones) | no disponible | apache-2.0 | HuggingFace, via LeRobot |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | implementaciones publicas en repositorios de investigacion |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | implementaciones publicas |
| SmolVLA | no disponible | no disponible | no disponible | no disponible | HuggingFace, via LeRobot |

Nota: ACT se distingue del resto por su tamano reducido, su entrenamiento rapido y su capacidad de predecir chunks de acciones en una sola pasada, mientras que Diffusion Policy genera acciones mediante difusion (mas costosa por el numero de pasos de muestreo) y SmolVLA incorpora un componente de vision-lenguaje-accion que permite condicionar por instrucciones en lenguaje natural. No se dispone de cifras comparativas verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad de tarea: la policy esta entrenada para cerrar un frigorifico con una configuracion concreta de robot y camaras. Fuera de ese entorno su comportamiento no esta garantizado.
- Sin datos de evaluacion: la model card no reporta tasa de exito, numero de episodios de prueba ni protocolo de evaluacion, por lo que no es posible estimar su fiabilidad real.
- Riesgo de sobreajuste al entorno: los modelos ACT son sensibles a cambios de iluminacion, posicion de camara, fondo y pequenas variaciones en los objetos, lo que puede degradar el rendimiento sin previo aviso.
- Ausencia de comprension semantica: no procesa lenguaje ni instrucciones; no se le puede pedir una tarea nueva en tiempo de inferencia.
- Sin documentacion de sesgos: no se documentan sesgos del dataset de entrenamiento (numero de episodios, diversidad de operadores, condiciones de grabacion), lo que dificulta auditar su comportamiento.
- Riesgo de alucinacion en el sentido de acciones incorrectas: al ser un modelo generativo condicionado, puede producir secuencias de accion plausibles pero fisicamente erroneas, con el consiguiente riesgo para el hardware y el entorno.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y la atribucion correspondiente. No se documenta ninguna restriccion adicional.
- Caveat de produccion: el checkpoint tiene 0 descargas y 0 likes y fue creado y actualizado con un minuto de diferencia, lo que sugiere una publicacion automatizada sin validacion adicional; conviene reproducir la evaluacion antes de cualquier uso serio.
- Nomenclatura no verificada: los sufijos "14D", "247data" y "200k" no estan explicados en la model card y se interpretan aqui solo como indicios, no como datos confirmados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/act_task09_14D_247data_200k
- Dataset de entrenamiento: https://huggingface.co/datasets/kiroaiseoul/task09_close_refrigerator_14D_247data
- Paper de ACT (arXiv:2304.13705): https://arxiv.org/abs/2304.13705
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de policies: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
