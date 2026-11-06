# mysterium99/ev01_stage1_newtask

## Resumen

EVO1 es una política de visión-lenguaje-acción (VLA) orientada a robótica de manipulación, desarrollada en el marco del proyecto Evo-1 del grupo MINT-SJTU. El modelo publicado bajo el identificador `mysterium99/ev01_stage1_newtask` es un checkpoint concreto entrenado con LeRobot sobre la tarea de manufactura `manufacturing_task`, y combina un backbone de visión-lenguaje InternVL3 con una cabeza de acción basada en flow matching continuo. La política recibe tres flujos de cámara (gripper, vista superior y vista lateral) más el estado del robot, y emite vectores de acción de 6 dimensiones.

El modelo resuelve el problema de mapear instrucciones en lenguaje natural e imágenes de escena a secuencias de acciones motoras en un entorno de manipulación de tornillería y ferretería. Con 776 millones de parámetros y un repositorio de 1,8 GB en formato safetensors, se posiciona en la gama media de políticas VLA, lo que permite su despliegue en estaciones de trabajo con GPU consumer o profesional sin necesidad de clústeres dedicados.

Su relevancia actual radica en la adopción del paradigma VLA con flow matching, que sustituye la regresión directa de acciones por la predicción de campos de velocidad continuos, mejorando la suavidad y la multimodalidad de las trayectorias. El checkpoint está publicado con licencia Apache 2.0 y es reproducible mediante la CLI de LeRobot, lo que facilita su evaluación y reentrenamiento por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con backbone InternVL3 y cabeza de acción por flow matching continuo |
| Parametros totales | 776.139.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño EVO1: un backbone de visión-lenguaje InternVL3 que codifica conjuntamente las tres imágenes de cámara (`gripper`, `newtop`, `newside`, cada una de 3×480×640) y la instrucción en lenguaje natural, y una cabeza de acción que genera *action chunks* mediante flow matching continuo. La entrada de estado del robot es un vector de 6 dimensiones (`observation.state`), y la salida es un vector de acción también de 6 dimensiones. El modelo está pensado para el robot de tipo `follow` del ecosistema LeRobot.

El entrenamiento se realizó sobre el dataset `manufacturing_task`, con 2500 episodios y 2.593.106 fotogramas a 30 FPS, cubriendo 50 instrucciones distintas de manipulación de tornillos, tuercas, arandelas y muelles. La configuración reportada es de 60.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 0, ejecutado con LeRobot 0.6.1. No se documenta en la información disponible el uso de RLHF, DPO ni el número total de tokens de entrenamiento del backbone.

## Capacidades

- Generación de acciones motoras continuas de 6 dimensiones a partir de instrucciones en lenguaje natural e imágenes multi-cámara.
- Percepción visual multi-vista simultánea (gripper, vista superior, vista lateral) a resolución 640×480 y 30 FPS.
- Comprensión de instrucciones de manipulación de objetos con atributos geométricos y de material (longitud, tipo de cabeza, acabado zinc versus galvanizado, tipo de tornillo).
- Ejecución de tareas de clasificación, ordenación y entrega de piezas a un humano.
- Predicción de *action chunks* mediante flow matching, lo que permite trayectorias multimodales y suaves.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue mediante CLI.
- No se documentan capacidades de tool calling, razonamiento multi-paso simbólico, audio ni thinking mode en la información disponible.

## Casos de uso

- Clasificación de tornillería en línea de montaje: el modelo puede ejecutar instrucciones como separar tuercas de zinc a la izquierda y ferretería galvanizada a la derecha, aprovechando las tres vistas de cámara para desambiguar piezas pequeñas.
- Alimentación de contenedores por criterio dimensional: tareas como introducir en el cubo todos los tornillos de 2 pulgadas o los de 4 pulgadas se benefician de la cabeza de flow matching para aproximaciones suaves y precisas.
- Colaboración humano-robot en entrega de piezas: instrucciones del tipo «coge el tornillo más largo y dáselo al humano» o «coge una tuerca de zinc y entrégala» encajan con el robot `follow` y el estado de 6 dimensiones.
- Ordenación espacial en zonas delimitadas: colocar tornillos de menor a mayor en el área encintada o alinear tuercas junto a tornillos requiere la combinación de percepción multi-vista y acción continua que ofrece el modelo.
- Retirada selectiva de piezas: instrucciones como «retira todos los muelles del área encintada» permiten usar el modelo en tareas de limpieza o reconfiguración de puestos de trabajo.
- Reentrenamiento para nuevas tareas de manufactura: al estar publicado con LeRobot y licencia Apache 2.0, sirve como punto de partida para fine-tuning sobre datasets propios de ensamblaje.
- Evaluación de políticas VLA en investigación: útil como referencia reproducible con hiperparámetros y dataset documentados para comparar arquitecturas de flow matching frente a regresión directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 776 millones de parámetros en safetensors (fp32/bf16), el peso ronda 1,5–3 GB, por lo que se estima un consumo de VRAM moderado, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs consumer de gama media-alta (por ejemplo, RTX 3060 12 GB o superiores) y GPUs profesionales (A100, H100) para entrenamiento o despliegue de mayor throughput.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout`) con estrategia `base`; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI, que además no son adecuados para una política VLA con cabeza de acción.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/ev01_stage1_newtask` (EVO1) | 776 M | no disponible | VLA para manipulación (robot `follow`) | Apache 2.0 | Hugging Face, LeRobot |
| Políticas VLA comparables (p. ej. RT-2, OpenVLA, π0) | no disponible en la información | no disponible | VLA para manipulación | varía | varía |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de alternativas que permitan una comparación cuantitativa fiable. Se indica «no disponible» para evitar inferencias no respaldadas.

## Limitaciones y advertencias

- El checkpoint está entrenado específicamente para el dataset `manufacturing_task` y el robot `follow`; su generalización a otras morfologías, cámaras o dominios de objetos no está garantizada.
- Las instrucciones del dataset están en inglés; no se documenta soporte multilingüe, por lo que el uso en castellano requeriría reentrenamiento o traducción previa.
- Riesgo de alucinación motora: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante escenas fuera de distribución.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto acotado de piezas de ferretería puede fallar con objetos de apariencia similar o con iluminación distinta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del backbone InternVL3, cuyas condiciones de uso deben verificarse por separado.
- No se documentan límites de contexto ni requisitos de calibración de cámaras; el despliegue en producción exige validación empírica en el robot objetivo.
- El repositorio tiene muy pocas descargas y likes (25 y 0 respectivamente en el momento de la consulta), lo que sugiere escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mysterium99/ev01_stage1_newtask
- Repositorio del proyecto EVO1: https://github.com/MINT-SJTU/Evo-1
- Guía LeRobot EVO1: https://huggingface.co/docs/lerobot/main/en/evo1
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_task
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_task
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
