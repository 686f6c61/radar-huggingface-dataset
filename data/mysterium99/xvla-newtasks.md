# mysterium99/xvla-newtasks

## Resumen

X-VLA es un framework de Vision-Language-Action (VLA) basado en flow matching y soft prompts, disenado para unificar el control de robots con morfologias, sensores y espacios de accion heterogeneos. La idea central es tratar cada configuracion de hardware como una "tarea" codificada mediante un pequeno conjunto de embeddings de Soft Prompt aprendibles, de modo que un unico modelo pueda reconciliar distintos robots sin necesidad de arquitecturas separadas. El trabajo esta descrito en el paper arXiv 2510.10274 y se distribuye a traves del ecosistema LeRobot de HuggingFace.

La ficha que nos ocupa, `mysterium99/xvla-newtasks`, es un fine-tune del checkpoint base `lerobot/xvla-base` sobre el dataset `manufacturing_task`, orientado a tareas de manipulacion de tornilleria y ferreteria industrial (clasificar, agrupar y entregar tornillos, tuercas, arandelas y muelles). El modelo tiene 879.687.256 parametros (aproximadamente 880 millones) y un tamano de repositorio de 1,8 GB en formato safetensors.

Es relevante porque demuestra el flujo completo de especializacion de un VLA generalista a un dominio industrial concreto mediante imitation learning, usando 2.500 episodios y 2.593.106 frames a 30 FPS. No es un modelo de lenguaje: es una politica robotica que consume imagenes de tres camaras y un vector de estado, y emite acciones de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

Especificaciones adicionales de entrada y salida:

| Aspecto | Valor |
|---|---|
| Tipo de robot | `follow` |
| Camaras | `gripper`, `newtop`, `newside` |
| Entrada visual 1 | `observation.images.image`, `(3, 256, 256)` |
| Entrada visual 2 | `observation.images.image2`, `(3, 256, 256)` |
| Entrada visual 3 | `observation.images.image3`, `(3, 224, 224)` |
| Entrada de estado | `observation.state`, `(8,)` |
| Salida de accion | `action`, `(6,)` |
| Dataset de entrenamiento | `manufacturing_task` (2.500 episodios, 2.593.106 frames, 30 FPS) |
| Pasos de entrenamiento | 60.000 |
| Batch size | 16 |
| Optimizador | xvla-adamw |
| Learning rate | 0,0001 |
| Semilla | 0 |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

X-VLA es un framework VLA que combina un encoder visual multi-camara con un modelo de lenguaje y un cabezal de accion basado en flow matching. La innovacion principal es el uso de Soft Prompts: cada configuracion de robot (morfologia, sensores, espacio de accion) se representa mediante un conjunto reducido de embeddings aprendibles que se inyectan como prefijo en el modelo. Esto permite que un mismo conjunto de pesos atienda a robots con diferentes numeros de articulaciones, camaras o dimensiones de accion, sin duplicar la red. El flow matching se emplea para generar trayectorias de accion continuas y multimodales, en lugar de regresion directa.

El fine-tune se realizo sobre `lerobot/xvla-base` con 60.000 pasos, batch de 16, optimizador `xvla-adamw` y learning rate 1e-4, usando el dataset `manufacturing_task`. Este dataset contiene 2.500 episodios y 2.593.106 frames a 30 FPS, con 50 tareas de lenguaje natural distintas centradas en manipulacion de ferreteria (tornillos hexagonales, de carroceria, lag, tuercas de zinc y galvanizadas, arandelas, muelles de 2 pulgadas, etc.). Las tareas incluyen instrucciones de clasificacion por tamano, material, tipo y posicion, asi como interacciones de entrega a un humano. No se dispone de informacion sobre la composicion exacta del dataset base ni sobre si hubo RLHF o DPO; al tratarse de imitation learning sobre demostraciones, el entrenamiento es de tipo behavioral cloning con flow matching.

## Capacidades

- Manipulacion robotica de precision: el modelo genera acciones de 6 dimensiones para controlar un brazo robotico con pinza en tareas de pick-and-place.
- Percepcion multi-camara: procesa tres flujos visuales simultaneos (pinza, vista superior y vista lateral) con resoluciones de 256x256 y 224x224.
- Comprension de instrucciones en lenguaje natural: ejecuta tareas descritas textualmente, como "Put all 2-inch screws in the bucket" o "Arrange the bolts from shortest to longest in the taped area".
- Clasificacion y agrupacion de objetos: distingue por tipo (hex, carriage, lag), material (zinc, galvanizado), tamano (2 pulgadas, 4 pulgadas) y posicion.
- Interaccion con humanos: soporta tareas de entrega ("give it to the human") y recepcion de objetos de un operario.
- Razonamiento espacial relacional: coloca objetos "next to", "to the left of", "in the taped area" o "in the bucket" segun la instruccion.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje general).
- Soporte de agentes y multi-step reasoning: no disponible como tal; ejecuta una politica de accion por paso de control.
- Capacidades multilingues: no disponible; las instrucciones del dataset estan en ingles.
- Capacidades especiales: soft prompts para adaptacion a morfologias, flow matching para acciones continuas.

## Casos de uso

- Clasificacion industrial de ferreteria: el modelo puede separar tornillos, tuercas y arandelas por tipo y material en una linea de produccion, usando las tres camaras para identificar piezas y el vector de estado para coordinar el brazo. Es adecuado porque ha sido entrenado especificamente con 50 tareas de este dominio.
- Kitting y preparacion de pedidos: agrupar componentes de un kit (por ejemplo, "put nuts on left and bolts on right, then put screws in the bucket") en una celda de montaje. El modelo entiende instrucciones compuestas y secuencias de acciones.
- Control de calidad por tamano: ordenar tornillos de menor a mayor o seleccionar el mas largo/corto ("Pick up the longest bolt"), lo que permite tareas de inspeccion dimensional sin metrologia dedicada.
- Asistencia colaborativa humano-robot: tareas de entrega y recepcion ("give it to the human", "Take screw from human") en estaciones de trabajo compartidas, gracias a la camara de pinza y la vista superior.
- Manipulacion en almacen de componentes: mover hardware a contenedores designados ("Put all galvanized hardware in bucket") con tolerancia a variaciones de posicion, usando la vista lateral para evitar colisiones.
- Investigacion en imitation learning: servir como punto de partida para fine-tunes en nuevos dominios industriales, ya que el framework X-VLA esta disenado para adaptarse a nuevas morfologias mediante soft prompts.
- Prototipado rapido de politicas roboticas: con LeRobot 0.6.1 y el CLI `lerobot-*`, se puede desplegar y evaluar la politica en un robot `follow` sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 879,7 M de parametros, en FP16 se requieren aproximadamente 1,8 GB solo para pesos; contando activaciones de tres camaras y el cabezal de flow matching, se estima un rango de 4-8 GB de VRAM, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no disponible de forma oficial; por tamano, una RTX 4090, RTX 3090, A100 o H100 son suficientes. Una GPU consumer de 8 GB o mas deberia poder ejecutar el modelo en FP16.
- Cabe en consumer GPU: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, aunque no hay confirmacion oficial.
- Opciones de despliegue: LeRobot 0.6.1 (libreria nativa), con CLI `lerobot-*`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de robotica.
- Latencia y throughput estimados: no disponibles. La inferencia debe ejecutarse a 30 FPS para coincidir con la frecuencia de entrenamiento, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/xvla-newtasks` | 879,7 M | no disponible | VLA fine-tune (manufacturing) | Apache 2.0 | HuggingFace |
| `lerobot/xvla-base` | no disponible | no disponible | VLA base | Apache 2.0 (segun repo base) | HuggingFace |
| Otros VLA de LeRobot (p. ej. pi0, SmolVLA) | no disponible en la informacion | no disponible | VLA | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y licencia; para contexto y benchmarks de alternativas seria necesario consultar sus fichas respectivas.

## Limitaciones y advertencias

- Dominio muy restringido: el fine-tune esta especializado en ferreteria industrial (tornillos, tuercas, arandelas, muelles) y un robot `follow` con tres camaras concretas; fuera de ese dominio el rendimiento esperado es bajo.
- Dependencia de la configuracion de hardware: las entradas estan fijadas a tres imagenes (256x256, 256x256, 224x224), un estado de 8 dimensiones y una accion de 6 dimensiones; cambiar camaras o robot requiere reentrenar o adaptar los soft prompts.
- Riesgo de alucinacion de acciones: como politica de imitation learning, puede generar trayectorias plausibles pero incorrectas ante objetos no vistos o iluminacion distinta, sin senal de incertidumbre explicita.
- Sesgos del dataset: el modelo hereda los sesgos de `manufacturing_task` (tipos de piezas, posiciones, instrucciones en ingles); no se ha documentado evaluacion de robustez ante variaciones de color, material o idioma.
- Idioma: las instrucciones estan en ingles; no hay soporte multilingue documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica con 0 descargas y 0 likes, sin validacion externa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de exito en las tareas, lo que impide evaluar su idoneidad en produccion sin pruebas propias.
- Fecha de creacion futura (2026-11-04): el repositorio parece recien publicado y sin mantenimiento documentado; conviene verificar actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mysterium99/xvla-newtasks
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_task
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_task
- Guia LeRobot xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
