# sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_3k

## Resumen

Este repositorio contiene una politica Vision-Language-Action (VLA) denominada `pi05`, publicada por el usuario `sam-guided-vlas` y obtenida por fine-tuning supervisado del modelo base `lerobot/pi05_base`. π₀.₅ es la evolucion del modelo π₀ de Physical Intelligence, disenada para generalizar a entornos y situaciones no vistos durante el entrenamiento; la implementacion empleada aqui es la de LeRobot, adaptada del repositorio OpenPI del propio fabricante. El modelo no es un modelo de lenguaje: es una politica robotica que consume observaciones multimodales (estado del robot e imagenes de camara) y emite directamente acciones de control de 7 grados de libertad.

El checkpoint pesa 4.143.404.816 parametros (unos 9,4 GB en el repositorio, coherente con pesos en precision de 16 bits) y esta especializado en una unica tarea de manipulacion de objetos apilados ("pile") con un robot Franka Panda. Se entreno durante 3000 pasos con tamano de lote 16, optimizador AdamW y tasa de aprendizaje 5e-05, a partir de un dataset de 198 episodios y 35.267 fotogramas capturados a 20 FPS (aproximadamente 29 minutos de datos), con 20 categorias de objetos de cocina y alimentacion.

Su relevancia es acotada y experimental: se trata de un artefacto de investigacion con 0 descargas y 0 "me gusta", sin resultados de evaluacion publicados y con un nombre de repositorio que codifica la configuracion exacta del experimento (gemelo aleatorio, enmascarado, superposicion con alfa 0,75, todas las camaras). Es util como referencia reproducible de fine-tuning de π₀.₅ sobre LeRobot, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (implementacion LeRobot derivada de OpenPI); detalle interno de capas no disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es un modelo MoE; se usa el total de parametros) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en `safetensors` (sin variantes GGUF, AWQ, GPTQ ni INT8 documentadas) |
| Idiomas soportados | No disponible; el condicionamiento por tarea se realiza con cadenas de texto en ingles (por ejemplo, `"soap dispenser"`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | `observation.state` `(9,)`; `observation.images.agentview` `(3, 224, 224)`; `observation.images.robot0_eye_in_hand` `(3, 224, 224)`; `observation.images.robot0_eye_in_hand_2` `(3, 224, 224)` |
| Salida | `action` `(7,)` |
| Tipo de robot | Franka Panda |
| Tarea / pipeline | robotics |
| Version de LeRobot | 0.6.0 |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLA de la familia π₀.₅ orientado a generalizacion en mundo abierto, que evoluciona π₀ para operar en entornos y situaciones no vistos en entrenamiento. No se proporcionan en la informacion disponible detalles sobre el numero de capas, el encoder de vision, el backbone de lenguaje ni el mecanismo de generacion de acciones (por ejemplo, si se emplea flow matching o decodificacion por trozos de accion); la model card remite explicitamente al blog de Physical Intelligence sobre π₀.₅ y al repositorio OpenPI para consultar el metodo. La unica innovacion tecnica inferible del nombre del experimento es el uso de aumentos visuales guiados por segmentacion (el espacio de nombres es `sam-guided-vlas`, y el identificador incluye `mask__overlay_a75`), aunque no se documenta su implementacion.

El entrenamiento es un fine-tuning de imitacion sobre `lerobot/pi05_base`: 3000 pasos, lote de 16, AdamW, learning rate 5e-05, semilla 0, LeRobot 0.6.0. El dataset contiene 198 episodios y 35.267 fotogramas a 20 FPS, con 20 categorias de objetos (soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone, basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash y spray). Con lote 16 y 3000 pasos se procesan unas 48.000 muestras, lo que equivale a poco mas de una pasada completa sobre el dataset si cada muestra corresponde a un fotograma; no se documenta el uso de RLHF, DPO ni ninguna fase de ajuste con preferencias, algo por otra parte poco habitual en politicas de imitacion.

## Capacidades

- Generacion de acciones motoras de 7 dimensiones (posicion y orientacion del efector final mas pinza) a partir de estado y vision, en regimen de control por imitacion.
- Percepcion multimodal con tres flujos de imagen simultaneos (una vista de agente y dos vistas de muneca), todos a 224x224.
- Fusion de estado propioceptivo de 9 dimensiones con las imagenes para producir la accion.
- Condicionamiento por instruccion de tarea en lenguaje natural: la tarea se pasa como cadena de texto (por ejemplo, `--task="soap dispenser"`), segun muestra el comando de rollout.
- Manipulacion de objetos apilados y desordenados, entrenada sobre 20 categorias de objetos de cocina y alimentacion.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso agentico: es una politica robotica, no un modelo de lenguaje conversacional.
- No se documentan capacidades de generacion de texto, codigo, matematicas, audio ni modo de pensamiento.
- Capacidades multilingues: no disponibles; el condicionamiento por tarea aparece en ingles.
- No se documenta ninguna capacidad especial adicional (memoria a largo plazo, planificacion simbolica, etc.).

## Casos de uso

- Manipulacion de objetos apilados en laboratorio: el modelo recoge y reorganiza objetos de cocina desordenados sobre una mesa con un Franka Panda, ejecutando la tarea indicada en el argumento `--task` durante el tiempo configurado en `lerobot-rollout`.
- Reproduccion de experimentos de aumento visual guiado por segmentacion: al ser un checkpoint con configuracion explicita en el nombre (`mask`, `overlay_a75`, todas las camaras), sirve como condicion experimental comparable frente a otros checkpoints de la misma familia.
- Punto de partida para nuevos fine-tunings: el flujo recomendado en la model card es partir de `lerobot/pi05_base` con `lerobot-train`, por lo que este checkpoint documenta un protocolo concreto (3000 pasos, lote 16, lr 5e-05) replicable con datos propios.
- Evaluacion de transferencia simulacion a realidad: el identificador del dataset incluye el sufijo `sim` y `live`, lo que permite estudiar la brecha entre datos sinteticos y reales en una misma politica.
- Referencia de coste computacional en investigacion: al ser un modelo de 4,14 B de parametros, resulta util para medir latencia y requisitos de VRAM de una politica VLA de este tamano antes de escalar a modelos mayores.
- Docencia y formacion en robotica de imitacion: permite a un equipo nuevo en LeRobot recorrer el ciclo completo (calibracion de robot y camaras, grabacion de datos, entrenamiento y rollout) con un ejemplo real y un comando listo para usar.
- Comparativa interna de metodos de aumentacion: si un grupo de investigacion mantiene variantes con y sin enmascaramiento o superposicion, este checkpoint actua como linea base de la condicion con alfa 0,75.
- Pruebas de robustez del stack de inferencia: sirve para validar que el pipeline de LeRobot con tres camaras a 640x480 y 30 FPS se mantiene estable en bucles de control largos (`--duration` omitido ejecuta indefinidamente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la linea "No evaluation results have been provided for this policy yet" y la plantilla de evaluacion (tarea, numero de ensayos, exitos y tasa de exito) sin rellenar.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K y similares | No aplicable (modelo de accion robotica, no de lenguaje) |
| Tasa de exito en tareas de manipulacion | No disponible |
| Numero de ensayos por tarea | No disponible |

## Requisitos de hardware

- VRAM estimada para los pesos: unos 8,3 GB en bf16/fp16, unos 16,6 GB en fp32, unos 4,1 GB en int8 y unos 2,1 GB en int4 (calculado a partir de los 4.143.404.816 parametros).
- Hay que sumar el coste de activaciones y de los tres flujos de imagen de 224x224, ademas del estado de 9 dimensiones; en la practica conviene reservar entre 1 y 3 GB adicionales en bf16.
- GPU recomendadas: A100 (40/80 GB) y H100 (80 GB) para entrenamiento o para ejecutar varias politicas en paralelo; L4 (24 GB) o A10G para inferencia en servidor.
- Cabe en GPU de consumo: RTX 4090 (24 GB) y RTX 3090 (24 GB) ejecutan el modelo en bf16 con holgura; una RTX 4080 o 4070 Ti (16 GB) queda justa en bf16 y requeriria cuantizacion o reduccion de precision; tarjetas de 8 GB no son viables sin cuantizacion agresiva.
- Opciones de despliegue: `lerobot-rollout` y `lerobot-train` de la libreria LeRobot sobre PyTorch y CUDA, con pesos `safetensors`. No es compatible con llama.cpp, Ollama, vLLM ni TGI, que estan orientados a servir modelos de lenguaje y no a emitir acciones de robot.
- Latencia y throughput: no disponibles. El bucle de control del dataset esta muestreado a 20 FPS, por lo que la inferencia deberia completarse en decenas de milisegundos para operar en linea; no se publican mediciones de latencia de esta politica.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`...steps_3k`) | 4,143 B | Estado (9,) + 3 imagenes 224x224 | apache-2.0 | Publico en HuggingFace, 0 descargas |
| `lerobot/pi05_base` | No disponible (es el modelo de partida) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace |
| SmolVLA | 0,45 B (dato de documentacion publica del proyecto) | Vision + lenguaje + estado | Apache-2.0 (dato de documentacion publica) | Publico en HuggingFace, integrado en LeRobot |
| OpenVLA | 7 B (dato de documentacion publica del proyecto) | Vision + instruccion textual | Licencia propia del proyecto | Publico en HuggingFace |

Aviso: los datos de SmolVLA y OpenVLA proceden de la documentacion publica de esos proyectos y no de la informacion proporcionada en esta ficha, por lo que deberian verificarse antes de citarlos. Para el modelo base `lerobot/pi05_base` y su familia (π₀, π₀.₅ y OpenPI) no se dispone de cifras verificadas en la informacion disponible; la comparacion relevante en este caso es contra otros checkpoints de la misma familia entrenados con condiciones de aumento distintas, que no se han publicado en este repositorio.

## Limitaciones y advertencias

- Estado de validacion: 0 descargas, 0 "me gusta" y ningun resultado de evaluacion publicado; se trata de un artefacto de experimento, no de un modelo contrastado.
- Acoplamiento estricto al hardware: solo funciona con un Franka Panda y con exactamente las tres camaras y los nombres de observacion con los que se entreno (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un vector de estado de 9 dimensiones; cualquier cambio de configuracion invalida la politica.
- Alcance de tarea muy limitado: 198 episodios y 35.267 fotogramas (unos 29 minutos) de una unica escena de apilamiento, con 20 categorias de objetos. La generalizacion a objetos, iluminacion o disposiciones nuevas no esta documentada.
- Riesgo elevado de sobreajuste y de fallo fuera de distribucion: 3000 pasos sobre un dataset pequeno, sin regularizacion ni evaluacion reportada.
- Brecha simulacion-realidad: el identificador del dataset contiene el sufijo `sim`, por lo que parte de los datos puede ser sintetica; no se documenta el porcentaje real ni el procedimiento de mezcla con datos `live`.
- Sesgos: no se ha realizado ningun analisis de sesgo. El dataset esta dominado por objetos de cocina y alimentacion de uso comun en entornos occidentales, lo que limita la variedad de formas, materiales y contextos.
- Idioma: el condicionamiento de tarea aparece en ingles; no hay soporte multilingue documentado.
- Alucinacion: en el sentido habitual de los modelos de lenguaje no aplica, pero la politica puede generar trayectorias plausibles y erroneas ante entradas fuera de distribucion, con riesgo fisico para el robot y el entorno.
- Licencia apache-2.0, que permite uso comercial y modificacion, pero sin garantias de ningun tipo y con la obligacion de conservar los avisos de licencia y atribucion. Se debe verificar tambien la licencia del modelo base y de los datos de entrenamiento antes de un uso productivo.
- Dependencia de versiones: el entrenamiento se realizo con LeRobot 0.6.0; cambios posteriores en la libreria pueden alterar la reproducibilidad del rollout.
- Los resultados de la busqueda web proporcionada no aportan informacion tecnica sobre este modelo (corresponden a una serie de television y a empresas homonimas), por lo que no ha sido posible contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_3k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset en LeRobot Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (adaptado para esta implementacion): https://github.com/Physical-Intelligence/openpi
