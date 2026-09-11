# sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_30k

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado con LeRobot a partir del modelo base `lerobot/pi05_base`. π₀.₅ (pi05) es un modelo de tipo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos: la idea es que la política funcione en situaciones y entornos que no aparecían en el entrenamiento. La implementación disponible en LeRobot es una adaptación del repositorio OpenPI de los autores originales.

El checkpoint concreto que se analiza aquí es un fine-tune de 30.000 pasos, semilla 0, sobre un dataset de manipulación con robot Panda y tres cámaras (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`). El modelo consume un vector de estado de 9 dimensiones más tres imágenes de 224×224 píxeles, y produce un vector de acción de 7 dimensiones, típico de un brazo manipulador con pinza.

El interés de esta ficha es acotado y conviene decirlo con claridad: se trata de un experimento de investigación con 0 descargas y 0 "likes" en el momento de la consulta, sin resultados de evaluación publicados y con un nombre de repositorio que codifica la configuración del entrenamiento (pose aleatoria, máscaras, desenfoque, simulación, todas las cámaras). No es un modelo de propósito general ni un modelo de lenguaje: es una política de control entrenada para tareas concretas de recogida y apilado de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), variante π₀.₅ (pi05); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (≈4,14 B), dato real de los safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual; la entrada es una observacion compuesta por estado de 9 dimensiones y tres imagenes de (3, 224, 224) |
| Tipos de cuantizacion | no disponible; el repositorio solo declara pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base (fine-tune) |
| Libreria | lerobot (version 0.6.0 indicada en la model card) |
| Tipo de robot | Panda |
| Camaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entradas | observation.state (9,); observation.images.agentview (3, 224, 224); observation.images.robot0_eye_in_hand (3, 224, 224); observation.images.robot0_eye_in_hand_2 (3, 224, 224) |
| Salidas | action (7,) |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-10T20:58:57.000Z |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLA de Physical Intelligence disenado para generalizacion en mundo abierto, evolucion de π₀, y senala que la implementacion de LeRobot deriva del repositorio OpenPI de los autores. No se aportan en la informacion disponible detalles sobre el encoder de vision, el backbone de lenguaje, el mecanismo de generacion de acciones ni el numero de tokens de entrenamiento del modelo base. Todo lo que se sabe con certeza sobre este checkpoint es que es un fine-tune de `lerobot/pi05_base` y que hereda la licencia apache-2.0.

Los datos de entrenamiento de este fine-tune si estan documentados: el dataset `sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live`, con 198 episodios, 35.267 fotogramas y una frecuencia de grabacion de 20 FPS. Las tareas anotadas corresponden a objetos de cocina y supermercado: soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone, basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash y spray. El sufijo del nombre del repositorio sugiere las condiciones de recogida de datos (pose aleatoria, oclusiones mediante mascara y desenfoque, datos de simulacion y uso de todas las camaras), aunque la model card no detalla estas tecnicas ni describe variaciones de aumento de datos o regularizacion.

La configuracion de entrenamiento declarada es: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0. No se menciona uso de RLHF, DPO ni ninguna etapa de alineacion, algo coherente con una politica de imitacion supervisada. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla de lo atribuible al modelo base π₀.₅.

## Capacidades

- Generacion de acciones de manipulacion robótica: dado un estado de 9 dimensiones y tres vistas de camara, produce un vector de accion de 7 grados de libertad.
- Manipulacion de objetos de cocina y supermercado: el modelo fue afinado sobre 20 categorias de objeto distintas (botella de jabon, mermelada, tarro, cereales, cuchillo, hervidor, pera, patata, boniato, bollo, cesta, comida en caja, tarta, lata, hamburguesa, limon, naranja, especias, calabaza y spray).
- Tareas de tipo "pile" (apilado o agrupacion de objetos), segun se deduce del nombre del dataset de entrenamiento.
- Percepcion multi-camara: integra una vista de agente y dos vistas de muneca del robot simultaneamente.
- Generalizacion a posiciones aleatorias de objeto, segun la configuracion de recogida de datos indicada en el nombre del repositorio.
- Tool calling / function calling: no disponible, no es una capacidad propia de una politica VLA de control.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision generativa, audio): no disponibles.

## Casos de uso

- Recogida y colocacion de productos de supermercado en un brazo Panda: la politica recibe las tres vistas de camara y el estado del robot, y emite el vector de accion de 7 dimensiones para agarrar y depositar objetos como latas, frutas o cajas. Es el escenario exacto para el que se entreno el checkpoint.
- Apilado de objetos sobre una cesta o caja: el dataset de entrenamiento se denomina "pile" y las tareas incluyen cesta y comida en caja, por lo que el uso natural es agrupar objetos heterogeneos en un contenedor.
- Investigacion en imitacion supervisada con LeRobot: sirve como punto de partida reproducible (semilla 0, 30.000 pasos, hiperparametros documentados) para comparar variantes de datos o de aumento.
- Evaluacion de robustez frente a oclusiones: el nombre del checkpoint indica condiciones de mascara y desenfoque en los datos, lo que permite estudiar como se comporta la politica cuando parte de la escena no es visible o esta degradada.
- Estudio de transferencia simulacion a real: el identificador del dataset incluye "sim" y "live", de modo que el checkpoint es util para analizar el salto entre ambos dominios en tareas de manipulacion.
- Linea base para ablationes de numero de camaras: el entrenamiento usa las tres camaras disponibles ("all_cameras"), lo que permite comparar contra variantes con menos vistas.
- Automatizacion de puesto de montaje ligero o de cocina robotizada: dado que la politica controla directamente un manipulador, puede integrarse en celdas donde se manipulen objetos de dimensiones y masas similares a los del dataset.
- Prototipado rapido con `lerobot-rollout` en un Panda real: el comando documentado permite ejecutar la politica durante un tiempo fijo (por ejemplo `--duration=60`) con una tarea textual concreta, lo que facilita pruebas de concepto en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la linea "_No evaluation results have been provided for this policy yet._", es decir, no hay tabla de tareas, ensayos, exitos ni tasa de exito. Tampoco hay comparaciones con otras politicas ni metricas de simulacion.

## Requisitos de hardware

- Parametros del modelo: 4.143.404.816, equivalente a unos 8,3 GB en precision de 16 bits (bf16/fp16) y unos 16,6 GB en fp32. Son estimaciones aritmeticas derivadas del recuento de parametros, no datos publicados por el autor.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia calculada, los pesos en bf16 ocupan aproximadamente 8,3 GB, a lo que hay que sumar activaciones y buffers de las tres imagenes de 224×224; un margen practico razonable seria de 10 a 12 GB, pero no esta confirmado por el autor.
- GPU recomendadas: no disponible. Por tamano de parametros, el modelo es compatible con GPUs de 24 GB o mas (por ejemplo RTX 4090, A100 40 GB, H100 80 GB) si se confirma el calculo anterior; no hay validacion publicada.
- Cabe en GPU de consumo: probablemente si en tarjetas con 12-16 GB o mas en bf16/fp16, segun la estimacion de pesos. No confirmado por el autor.
- Opciones de despliegue: la via documentada es LeRobot, con `lerobot-rollout` para ejecutar la politica en el robot y `lerobot-train` para reentrenar o afinar desde `lerobot/pi05_base`. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama para este checkpoint; no disponible.
- Latencia y throughput: no disponibles. El unico dato relacionado es que el dataset de entrenamiento se grabo a 20 FPS, lo que sugiere un bucle de control en ese orden de frecuencia, pero no hay mediciones de latencia de inferencia publicadas.
- Requisitos de robot: brazo Panda con tres camaras configuradas con los nombres de observacion exactos (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`); los nombres deben coincidir con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (pi05 fine-tune, 30k pasos) | 4.143.404.816 | Estado (9,) + 3 imagenes 224×224; salida action (7,) | apache-2.0 | Publico en HuggingFace, 0 descargas, sin evaluacion publicada |
| lerobot/pi05_base | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base publico del que deriva este fine-tune |
| π₀ (OpenPI, Physical Intelligence) | no disponible | no disponible | no disponible | Repositorio OpenPI citado como origen de la implementacion de LeRobot |
| Otros checkpoints de la familia pi05 en LeRobot | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La busqueda web realizada no ha devuelto informacion tecnica sobre π₀.₅, LeRobot ni modelos comparables; los resultados obtenidos corresponden a contenidos no relacionados (una serie de television, un portal de contratacion publica estadounidense y una web de herramientas). No se dispone, por tanto, de datos de rendimiento comparado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card declara explicitamente que no se han proporcionado resultados de evaluacion. No hay tasa de exito en ninguna tarea, lo que impide estimar la fiabilidad real de la politica.
- Riesgo de sobreajuste al entorno de entrenamiento: 198 episodios y 35.267 fotogramas son un volumen reducido, y no se documenta validacion con objetos, posiciones o condiciones de iluminacion no vistas.
- Dependencia estricta de la configuracion de sensores: la politica espera un estado de 9 dimensiones y tres camaras con nombres concretos. Cambiar el numero de camaras, su resolucion o su calibracion invalida las entradas esperadas.
- Especifica de un tipo de robot: esta entrenada para un Panda con pinza de 7 grados de libertad. No es transferible sin reentrenamiento a otras morfologias.
- Riesgo de comportamiento inseguro en produccion: al ser una politica de imitacion sin capa de seguridad documentada, su uso en un robot real requiere limites de par, paradas de emergencia y supervision humana.
- Idiomas: no se declaran idiomas soportados. Las tareas se pasan como cadenas en ingles (`--task="soap dispenser"`), pero no hay informacion sobre el tratamiento multilingue ni sobre la sensibilidad al texto de la instruccion.
- Sesgos: no disponibles. No hay analisis de sesgo de genero, color de piel u otras propiedades de los objetos y escenas presentes en el dataset.
- Alucinacion: no aplica en el sentido generativo textual; el equivalente es la prediccion de acciones incorrectas o inseguras ante observaciones fuera de distribucion, riesgo no cuantificado.
- Licencia: apache-2.0, que permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. Conviene verificar las condiciones del modelo base y del repositorio OpenPI del que deriva la implementacion, ya que la model card no detalla la cadena completa de licencias.
- Metadatos anomales: la fecha de creacion registrada en HuggingFace (2026-09-10) es posterior a la fecha de publicacion de muchos de los recursos citados; se reproduce tal cual figura en la ficha del modelo.
- Modelo de investigacion con traccion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron contenido no relacionado (serie de television "Sam", portal SAM.gov, SAM Outillage y un master universitario).
