# MrC4t/xvla_bi_so_bin2

## Resumen

MrC4t/xvla_bi_so_bin2 es una politica robotica (Vision-Language-Action) entrenada mediante aprendizaje por imitacion con LeRobot y publicada en Hugging Face por el usuario MrC4t. Se trata de un ajuste fino del modelo base lerobot/xvla-base, que implementa el marco X-VLA: una arquitectura de flow matching con soft prompts aprendibles en la que cada configuracion de robot o hardware se trata como una "tarea" codificada por un pequeno conjunto de embeddings, permitiendo que un unico modelo asimile morfologias, sensores y espacios de accion diversos.

El modelo tiene 879.687.256 parametros (~880 M) y ocupa 1,8 GB en el repositorio, lo que indica pesos almacenados en precision reducida (probablemente bf16/fp16). Esta especializado en una unica tarea bimanual, "put toy in bin", sobre un robot `bi_so_follower` con tres camaras (`head`, `left_wrist`, `right_wrist`). Consume tres imagenes y un vector de estado de 8 dimensiones, y produce un vector de accion continuo de 12 dimensiones (compatible con dos brazos SO de 6 grados de libertad cada uno).

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot (grabacion de datos, entrenamiento, despliegue) con la familia X-VLA; por otro, demuestra el enfoque de soft prompts para reutilizar un mismo backbone VLA entre distintas plataformas roboticas sin reentrenar el modelo completo. La licencia Apache 2.0 facilita su uso comercial y su modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts (marco X-VLA) |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, 1,8 GB, compatible con bf16/fp16) |
| Idiomas soportados | no disponible (politica condicionada por instruccion de tarea en ingles: "put toy in bin") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | bi_so_follower (bimanual) |
| Camaras | head, left_wrist, right_wrist |
| Entradas | observation.images.image (3, 256, 256); observation.images.image2 (3, 256, 256); observation.images.image3 (3, 224, 224); observation.state (8,) |
| Salidas | action (12,) |
| Dataset de entrenamiento | MrC4t/bimanual_toy_bin (21 episodios, 25.866 fotogramas, 30 FPS) |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

X-VLA es un marco VLA de flow matching con soft prompting: en lugar de condicionar la politica con texto libre, codifica cada conjunto robot-hardware como una tarea representada por un pequeno conjunto de embeddings de Soft Prompt aprendibles. Esto permite que un unico modelo acomode morfologias, sensores y espacios de accion heterogeneos, y que el ajuste fino posterior a un robot concreto se limite esencialmente a aprender los prompts y la cabeza de accion correspondientes. La politica consume observaciones visuales multi-camara junto con el estado propioceptivo y genera acciones continuas mediante un proceso de flow matching (generacion de trayectorias por integracion de un campo de velocidad), lo que encaja de forma natural con espacios de accion continuos de alta frecuencia.

El ajuste fino se realizo sobre el dataset MrC4t/bimanual_toy_bin, compuesto por 21 episodios y 25.866 fotogramas grabados a 30 FPS, todos ellos de la tarea "put toy in bin". La configuracion de entrenamiento reportada es: 20.000 pasos, tamano de lote 8, optimizador `xvla-adamw`, tasa de aprendizaje 0,0001 y semilla 1000, sobre LeRobot 0.6.2. No se documenta en la model card el numero total de tokens de entrenamiento, la composicion del dataset mas alla de la tarea indicada, ni si se aplicaron fases de RLHF, DPO u optimizacion por preferencias (no procede en el caso de politicas de imitacion, pero el dato no se explicita).

La innovacion destacable es el uso de soft prompts como mecanismo de reconciliacion entre plataformas: un mismo backbone preentrenado (lerobot/xvla-base) puede reutilizarse para robots distintos sin duplicar el modelo, y este repositorio constituye un ejemplo concreto de ese flujo para una configuracion bimanual concreta.

## Capacidades

- Manipulacion robotica bimanual: genera comandos de accion continuos de 12 dimensiones para un robot `bi_so_follower`, es decir, dos brazos coordinados.
- Percepcion visual multi-camara: integra tres flujos de imagen simultaneos (una camara frontal o de cabeza y dos camaras de muneca) a resoluciones de 256x256 y 224x224.
- Fusion visio-propioceptiva: combina las observaciones visuales con un vector de estado de 8 dimensiones.
- Condicionamiento por instruccion de tarea: la politica se activa con la instruccion textual "put toy in bin".
- Ejecucion de politicas de imitacion en bucle cerrado: soportada por `lerobot-rollout` con estrategia `base`, con control a 30 FPS.
- Extensibilidad mediante ajuste fino: puede reentrenarse sobre nuevos datasets con `lerobot-train` partiendo de lerobot/xvla-base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje natural, generacion de codigo, matematicas, audio ni modo "thinking"; este modelo no es un modelo de lenguaje de proposito general, sino una politica robotica.

## Casos de uso

- Recogida y deposito de objetos en entorno de laboratorio: el caso canonico para el que fue entrenado; el robot bimanual toma un juguete y lo coloca en una caja a partir de la instruccion "put toy in bin" y de tres vistas de camara.
- Banco de pruebas para el flujo de LeRobot: sirve como referencia funcional para validar la instalacion, la calibracion de hardware y la comunicacion con el robot antes de entrenar politicas propias.
- Punto de partida para ajuste fino en tareas bimanuales: al derivar de lerobot/xvla-base, puede reentrenarse con `lerobot-train --policy.path=lerobot/xvla-base` sobre datasets de tareas similares, reutilizando el backbone preentrenado.
- Investigacion en generalizacion de politicas: permite medir como se comporta una politica entrenada con solo 21 episodios ante variaciones de posicion del objeto, iluminacion o distractores.
- Evaluacion comparativa de tecnicas VLA: sirve como linea base de X-VLA frente a otros enfoques de imitacion sobre el mismo montaje robotico y el mismo dataset.
- Demostraciones reproducibles y docencia: la combinacion de dataset publico (21 episodios, 25.866 fotogramas a 30 FPS), configuracion de entrenamiento completa y comandos de despliegue facilita reproducir el experimento de principio a fin.
- Pruebas de integracion en pipelines de robotica: util para verificar latencia, frecuencia de control y estabilidad de una politica VLA de ~880 M de parametros en hardware real o simulado.
- Validacion de adaptacion de dominio: el enfoque de soft prompts permite experimentar con la reutilizacion del mismo modelo en otro robot o espacio de acciones sin reentrenar el backbone completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito reales por tarea, numero de ensayos ni resultados comparativos. Tampoco se incluyen metricas de entrenamiento (perdida, curvas) ni evaluaciones en simulacion.

| Tarea | Ensayos | Exitos | Tasa de exito |
|---|---|---|---|
| put toy in bin | no disponible | no disponible | no disponible |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (879,7 M) y del tamano del repositorio (1,8 GB); no proceden de mediciones publicadas por el autor.

- VRAM estimada de pesos: ~1,8 GB en bf16/fp16, ~3,5 GB en fp32 (a partir de 879,7 M de parametros). Hay que anadir la memoria de activaciones de los codificadores visuales y del decodificador de acciones.
- VRAM practica de inferencia: del orden de 3-6 GB en precision reducida con lotes pequenos, dependiendo de la implementacion y del numero de camaras procesadas simultaneamente (estimacion, no dato publicado).
- GPU consumer: cabe con holgura en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). No deberia requerir GPU de centro de datos para inferencia.
- GPU de centro de datos: A100, H100, L40S o similares no son necesarias para inferencia, aunque aportan margen para entrenamiento o para ejecutar varias politicas en paralelo.
- Restriccion de control: la politica se ejecuta a 30 FPS en el flujo de LeRobot, lo que implica un presupuesto de unos 33 ms por ciclo de control (incluyendo inferencia y comunicacion con el robot).
- Opciones de despliegue: la via documentada es `lerobot-rollout` con `--strategy.type=base` y `--policy.path=MrC4t/xvla_bi_so_bin2`. El entrenamiento se realiza con `lerobot-train` sobre `lerobot/xvla-base`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una politica robotica.
- Latencia y throughput medidos: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La unica referencia directa documentada es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrC4t/xvla_bi_so_bin2 | 879.687.256 | no disponible | "put toy in bin", robot bi_so_follower | apache-2.0 | Publico en Hugging Face (`lerobot`) |
| lerobot/xvla-base | no disponible | no disponible | Modelo base VLA preentrenado, multiproposito | no disponible | Publico en Hugging Face |
| Otros VLA de la misma categoria (por ejemplo, la familia de politicas disponibles en LeRobot) | no disponible | no disponible | Manipulacion robotica | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no reporta tasas de exito, numero de ensayos ni condiciones de evaluacion, por lo que no hay evidencia publica del rendimiento real de la politica.
- Dataset muy reducido: 21 episodios y 25.866 fotogramas para una unica tarea. Es esperable un sesgo fuerte hacia las posiciones, iluminacion, objetos y disposicion de camaras presentes en la grabacion.
- Tarea unica: el modelo esta especializado en "put toy in bin". No debe esperarse generalizacion a otras tareas sin un ajuste fino adicional.
- Dependencia del hardware: los nombres e indices de camara deben coincidir exactamente con las claves de observacion del entrenamiento (`observation.images.image`, `image2`, `image3`) y el robot debe ser de tipo `bi_so_follower` con la misma cinematica.
- Riesgo de fallo en bucle cerrado: al ser una politica de imitacion sin mecanismos explicitos de seguridad, pueden producirse colisiones, movimientos bruscos o intentos de agarre fallidos ante objetos fuera de distribucion.
- Sin datos de sesgo en el sentido estadistico habitual de los modelos de lenguaje, pero si sesgo de dominio: el comportamiento esta condicionado por el entorno fisico concreto del dataset.
- Idiomas: no hay informacion sobre capacidades multilingues. La condicion de tarea esta en ingles ("put toy in bin"); un cambio de redaccion podria afectar al comportamiento.
- Licencia: Apache 2.0, permisiva para uso comercial. Conviene verificar, no obstante, las condiciones del modelo base lerobot/xvla-base y del dataset original, asi como citar X-VLA y LeRobot.
- Reproducibilidad limitada del entorno fisico: no se documentan las tolerancias mecanicas, la calibracion ni las condiciones de iluminacion de la grabacion, factores que afectan de forma critica al exito de la politica.
- Madurez: el modelo se publico recientemente y cuenta con 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrC4t/xvla_bi_so_bin2
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/bimanual_toy_bin
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/bimanual_toy_bin
- Paper de X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
