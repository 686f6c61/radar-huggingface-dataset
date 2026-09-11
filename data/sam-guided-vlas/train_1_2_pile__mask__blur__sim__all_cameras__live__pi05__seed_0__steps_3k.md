# sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_3k

## Resumen

Este repositorio contiene una politica robotica Vision-Language-Action (VLA) llamada pi05 (π₀.₅), desarrollada originalmente por Physical Intelligence y adaptada a la libreria LeRobot de Hugging Face a partir del repositorio abierto OpenPI. El modelo aqui publicado es un fine-tuning de `lerobot/pi05_base` realizado por el usuario `sam-guided-vlas`, entrenado sobre un unico dataset de demostraciones de manipulacion con un robot Franka Panda. La arquitectura combina percepcion visual (tres camaras a 224x224) y estado propioceptivo de 9 dimensiones para producir acciones continuas de 7 dimensiones, lo que lo situa en la categoria de modelos de accion directa para control de robots, no en la de modelos de lenguaje.

El modelo pesa 4.143.404.816 parametros (unos 4,14 mil millones) y ocupa 9,4 GB en el repositorio, en formato safetensors. Se ha entrenado durante 3000 pasos con batch size 16 y optimizador AdamW, sobre un dataset de 200 episodios y 69.392 fotogramas grabados a 20 FPS. Las tareas cubiertas son veinte categorias de objetos cotidianos (cesta, comida en caja, tarta, lata, hamburguesa, limon, naranja, especias, calabaza, espray, dosificador de jabon, mermelada, tarro, cereales, bloque de cuchillos, hervidor, pera, patata, batata y bollo), lo que sugiere un escenario de recogida y manipulacion de comestibles.

Su relevancia es fundamentalmente metodologica: se trata de un punto de control reproducible dentro del ecosistema LeRobot, util para investigacion en aprendizaje por imitacion, para comparar variantes de aumento de datos (el nombre del dataset sugiere enmascarado, desenfoque y guiado por SAM) y como base para fine-tuning posterior. No es un modelo de proposito general ni un asistente conversacional: es una politica de control entrenada para un robot y un conjunto de camaras concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) pi05 (π₀.₅); implementacion de LeRobot adaptada del repositorio OpenPI de Physical Intelligence; no se detallan el numero de capas ni el mecanismo de atencion en la informacion disponible |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones), segun los pesos safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (politica robotica multimodal; no se documenta una ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base (fine-tuning) |
| Libreria | lerobot 0.6.0 |
| Tipo de robot | Panda |
| Camaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entradas | observation.state (9,); observation.images.agentview (3, 224, 224); observation.images.robot0_eye_in_hand (3, 224, 224); observation.images.robot0_eye_in_hand_2 (3, 224, 224) |
| Salidas | action (7,) |
| Tamano del repositorio | 9,4 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card describe pi05 como un modelo Vision-Language-Action de Physical Intelligence disenado para generalizacion en entornos abiertos: evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos que no se vieron durante el entrenamiento. La implementacion disponible aqui procede del repositorio OpenPI y se ha integrado en LeRobot. No se especifican en la informacion proporcionada el tipo exacto de backbone, el numero de capas, la estrategia de atencion ni si se emplea decodificacion especulativa o algun esquema de flujo (flow matching) para generar las acciones; estos detalles deben consultarse en el blog y el repositorio enlazados.

El entrenamiento de este checkpoint concreto es un fine-tuning supervisado sobre `lerobot/pi05_base` con 3000 pasos, batch size 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 0. El dataset asociado contiene 200 episodios y 69.392 fotogramas a 20 FPS, con veinte tareas de manipulacion de objetos. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de refuerzo; tampoco se detalla la composicion completa del dataset de preentrenamiento original ni el numero de tokens o muestras vistas. El nombre del dataset (`train_1_2_pile__mask__blur__sim__all_cameras__live`) sugiere variantes de aumento con enmascarado, desenfoque, uso de todas las camaras y datos de simulacion, pero la model card no describe explicitamente esos procedimientos.

## Capacidades

- Control robótico por imitacion: genera acciones continuas de 7 dimensiones para un robot Franka Panda a partir de estado propioceptivo de 9 dimensiones y tres vistas de camara.
- Percepcion visual multivista: procesa simultaneamente una vista de agente y dos vistas de muneca (eye-in-hand) a resolucion 224x224.
- Ejecucion de tareas de manipulacion sobre veinte categorias de objetos: cesta, comida en caja, tarta, lata, hamburguesa, limon, naranja, especias, calabaza, espray, dosificador de jabon, mermelada, tarro, cereales, bloque de cuchillos, hervidor, pera, patata, batata y bollo.
- Ejecucion condicionada por instruccion de tarea: la CLI de rollout acepta un parametro `--task` con el nombre de la tarea a ejecutar.
- Integracion con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, generacion de codigo, matematicas, audio o modo de pensamiento. Al ser una politica de accion y no un modelo de lenguaje de proposito general, estas capacidades no aplican en el sentido habitual.
- No se documentan capacidades multilingues.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el checkpoint sirve como referencia reproducible de un fine-tuning VLA sobre LeRobot, con hiperparametros completos publicados (3000 pasos, batch 16, AdamW, lr 5e-05, semilla 0), lo que permite replicar o comparar variantes.
- Recogida y colocacion de comestibles en un Franka Panda: el modelo esta entrenado especificamente sobre veinte categorias de objetos de cocina y supermercado, por lo que es directamente aplicable a tareas de pick-and-place en ese dominio con las tres camaras configuradas.
- Estudio de robustez ante oclusiones y desenfoque: el nombre del dataset sugiere entrenamiento con enmascarado y blur; el checkpoint puede usarse como punto de partida para medir sensibilidad a oclusiones parciales y a degradacion de imagen.
- Fine-tuning con datos propios de laboratorio: al partir de `lerobot/pi05_base` y estar bajo licencia apache-2.0, es una base razonable para reentrenar con un dataset propio mediante `lerobot-train` y evaluar la transferencia a nuevas tareas.
- Transferencia sim-a-real: el dataset de entrenamiento incluye datos de simulacion (indicado por `sim` en el nombre); el modelo puede emplearse para estudiar la brecha entre simulacion y robot real en tareas de manipulacion.
- Evaluacion comparativa de politicas VLA: sirve como linea base cuantificable dentro de un laboratorio que compare arquitecturas o estrategias de aumento de datos, siempre que se ejecute la misma bateria de tareas y se mida la tasa de exito.
- Demostraciones y prototipos en robotica educativa: con una celda Panda y tres camaras, la CLI de rollout permite ejecutar el modelo durante un tiempo configurable (`--duration=60`) para validar la integracion del hardware antes de invertir en entrenamientos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica literalmente que "no se han proporcionado resultados de evaluacion para esta politica todavia" y deja la tabla de evaluacion (tarea, intentos, exitos, tasa de exito) sin rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia segun el tamano de 4,14 mil millones de parametros (calculos aritmeticos, no datos oficiales): aproximadamente 16,6 GB en fp32; en torno a 8,3 GB en bf16/fp16; cerca de 4,1 GB en int8; aproximadamente 2,1 GB en int4. Hay que anadir el coste de activaciones y de los codificadores de imagen para tres camaras a 224x224.
- GPU recomendadas: no hay recomendaciones oficiales publicadas. Por tamano, encajan A100 (40 o 80 GB), H100, L40S y cualquier GPU con 16 GB o mas para inferencia en bf16.
- GPU de consumo: si cabe en tarjetas de consumo con 16-24 GB (RTX 4090, RTX 4080, RTX 3090, RTX 4060 Ti 16 GB) en bf16; en cuantizacion de 8 bits o menos podria caber en tarjetas de 8-12 GB, aunque no se publican cuantizaciones oficiales.
- Opciones de despliegue: la documentada es `lerobot-rollout` (con `--strategy.type=base`) para ejecutar la politica sobre el robot, y `lerobot-train` para reentrenar. El modelo base procede del repositorio OpenPI de Physical Intelligence. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; la publicacion de variantes GGUF no esta disponible.
- Latencia y throughput: no disponibles. Como referencia indirecta, el dataset fue grabado a 20 FPS, lo que implica un presupuesto de control de aproximadamente 50 ms por paso si se quiere mantener la cadencia de las demostraciones; esto es una inferencia a partir del dato de FPS, no una medicion del modelo.
- Nota practica: la inferencia real requiere un robot Panda fisico, un puerto de conexion y tres camaras cuyos nombres coincidan exactamente con las claves de observacion del entrenamiento (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tuning de pi05, 3000 pasos) | 4,14 mil millones | no disponible | sin resultados de evaluacion publicados | apache-2.0 | Hugging Face (lerobot), 0 descargas |
| lerobot/pi05_base | no disponible en la informacion proporcionada (mismo modelo base del que deriva este fine-tuning) | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| π₀.₅ original (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | blog y repositorio OpenPI |
| Otras politicas VLA de la misma categoria (por ejemplo π₀ u OpenVLA) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de parametros, contexto o rendimiento para alternativas en la informacion proporcionada. La unica comparacion defendible es la de este checkpoint frente a su modelo base `lerobot/pi05_base`, del que se diferencia por un fine-tuning de 3000 pasos sobre un dataset concreto de 200 episodios.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no reporta tasa de exito ni numero de intentos en robot real, por lo que el rendimiento real es desconocido.
- Entrenamiento corto: 3000 pasos con batch size 16 sobre 200 episodios es un presupuesto bajo; es probable que el modelo este poco ajustado a las tareas y que no alcance convergencia plena.
- Dependencia estricta del hardware: solo funciona con un robot Panda y con tres camaras cuyos nombres coincidan con las claves de observacion del entrenamiento; cambiar la configuracion invalida la politica.
- Dominio muy restringido: veinte tareas de manipulacion de objetos concretos; no hay evidencia de generalizacion a objetos, iluminaciones o disposiciones nuevas.
- Posible brecha sim-a-real: parte de los datos proviene de simulacion (sufijo `sim` en el nombre del dataset), lo que puede degradar el rendimiento en el robot fisico.
- Sin capacidades de lenguaje documentadas: pese a ser un modelo Vision-Language-Action, no se declaran idiomas soportados ni comprension de instrucciones libres mas alla del parametro de tarea.
- Riesgo de alucinacion: en el contexto de una politica de accion, el equivalente es la generacion de trayectorias o acciones fisicamente invalidas o inseguras; no hay datos sobre frecuencia de fallo.
- Cuantizaciones y formatos alternativos no disponibles: solo se publican pesos en safetensors, sin variantes GGUF ni cuantizadas, lo que limita el despliegue en hardware modesto.
- Licencia: el checkpoint se publica bajo apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base `lerobot/pi05_base` y de los componentes de π₀.₅, asi como los terminos del dataset de entrenamiento antes de un uso productivo.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de uso por terceros.
- La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo: los resultados corresponden a una serie de television, al portal de contratacion SAM.gov, a un fabricante de herramientas y a un master universitario, por lo que no se han incluido como fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_3k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Blog de pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (Physical Intelligence): no disponible como URL concreta en la informacion proporcionada
