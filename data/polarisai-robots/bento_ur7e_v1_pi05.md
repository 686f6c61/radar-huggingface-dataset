# polarisai-robots/bento_ur7e_v1_pi05

## Resumen

bento_ur7e_v1_pi05 es una politica robotica de tipo Vision-Language-Action (VLA) publicada por el usuario polarisai-robots y construida mediante un ajuste fino supervisado del modelo base lerobot/pi05_base, la implementacion en LeRobot de π₀.₅ de Physical Intelligence. El modelo no es un modelo de lenguaje: recibe tres imagenes RGB de 224x224 píxeles y un vector de estado de 32 dimensiones, y emite un vector de accion continuo de 7 dimensiones para un brazo Universal Robots UR7e.

El modelo resuelve una tarea unica y concreta de manipulacion: "Pack me a lunchbox with two fried chicken pieces and two brocolli." (empaquetar una fiambrera). Se ha entrenado por imitacion sobre el dataset polarisai-robots/bento_ur7e_v1, compuesto por 204 episodios y 364.128 fotogramas grabados a 60 FPS, con 20.000 pasos de entrenamiento, tamano de lote 32 y tasa de aprendizaje 5e-05.

Su relevancia es acotada pero clara: es un ejemplo reproducible de pipeline completo de aprendizaje por imitacion con LeRobot 0.6.0 sobre robot real, util como punto de partida para ajustar π₀.₅ a celdas de trabajo propias y como referencia para evaluar la transferencia de un modelo VLA generalista a una tarea industrial especifica. El repositorio tiene 9,4 GB, 4.143.404.816 parametros (4,14 mil millones) y licencia Apache 2.0, aunque en el momento de redactar esta ficha acumula 0 descargas y 0 valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅; implementacion de LeRobot adaptada del repositorio OpenPI. No se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.143.404.816 (4,14 mil millones), segun los pesos safetensors |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible (politica robotica: consume 3 imagenes de 3x224x224 y un vector de estado de 32 dimensiones) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; el tamano de 9,4 GB es coherente con precision bf16/fp16 para 4,14 mil millones de parametros |
| Idiomas soportados | No disponibles. La tarea se especifica como cadena de texto; la incluida en la model card esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Entradas | observation.images.base_0_rgb (3,224,224), observation.images.left_wrist_0_rgb (3,224,224), observation.images.right_wrist_0_rgb (3,224,224), observation.state (32,) |
| Salidas | action (7,) |
| Robot objetivo | ur7e (Universal Robots UR7e) |
| Camaras declaradas | top, wrist (la model card detalla tres claves de imagen; ver limitaciones) |
| Dataset de entrenamiento | polarisai-robots/bento_ur7e_v1: 204 episodios, 364.128 fotogramas, 60 FPS, una unica tarea |
| Version de LeRobot | 0.6.0 |
| Tamano del repositorio | 9,4 GB |
| Fecha de creacion / actualizacion | 17 de septiembre de 2026 / 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

π₀.₅ es un modelo vision-lenguaje-accion disenado por Physical Intelligence para generalizacion en mundo abierto: parte de π₀ y busca generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion disponible en LeRobot esta adaptada del repositorio de codigo abierto OpenPI. La informacion proporcionada no especifica el numero de tokens de entrenamiento, la composicion del dataset multimodal del modelo base, ni si se aplicaron etapas de RLHF o DPO; tampoco detalla el mecanismo interno de generacion de acciones (tipo de cabezal de accion, esquema de difusion o flow matching, o estrategia de decodificacion).

El ajuste fino de esta ficha es un entrenamiento de imitacion supervisada con 20.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 1000, ejecutado con LeRobot 0.6.0. La politica aprende una correspondencia directa entre las observaciones (tres vistas RGB y estado del robot) y las acciones de 7 dimensiones, condicionada por la cadena de tarea. No se documentan innovaciones tecnicas adicionales especificas de este ajuste, ni tecnicas de aumento de datos, regularizacion o curriculum. No hay resultados de evaluacion en robot real publicados por el autor.

## Capacidades

- Generacion de acciones de manipulacion continua: salida de 7 dimensiones, coherente con un brazo de 6 grados de libertad mas pinza.
- Percepcion visual multi-camara: procesa tres vistas RGB simultaneas de 3x224x224 (base, muneca izquierda, muneca derecha).
- Fusion de estado propioceptivo: incorpora un vector de estado de 32 dimensiones junto con las imagenes.
- Condicionamiento por instruccion en lenguaje natural: la tarea se pasa como cadena de texto, lo que permite reutilizar la misma politica con distintos enunciados dentro del mismo dominio aprendido.
- Aprendizaje por imitacion end-to-end: no requiere modelado geometrico explicito ni planificacion simbolica.
- Ejecucion en bucle cerrado sobre robot real mediante `lerobot-rollout`.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso explicito ni comportamiento de agente con memoria de largo plazo.
- No genera texto como salida, ni tiene modo "thinking", vision generativa, audio ni capacidades multimodales de proposito general.

## Casos de uso

- Empaquetado automatizado de fiambreras en celda con UR7e: la politica ejecuta la secuencia de recogida y colocacion de dos piezas de pollo frito y dos de brocoli descrita en su tarea, con tres camaras como unica entrada perceptiva.
- Ajuste fino para tareas propias de manipulacion: sirve como punto de partida con `--policy.path=lerobot/pi05_base` o como referencia de configuracion (20.000 pasos, lote 32, lr 5e-05) para entrenar variantes sobre datasets propios con `lerobot-train`.
- Recoleccion de datos y evaluacion de politicas: el modo `--strategy.type=base` permite ejecutar la politica sin grabar episodios, util para medir tiempos de ciclo y comportamiento antes de comprometer una linea de produccion.
- Prototipado rapido en laboratorio de robotica: al ser un ajuste fino de un modelo base publico, permite validar el flujo completo LeRobot (calibracion, grabacion, entrenamiento, despliegue) en un plazo corto.
- Comparativa interna de estrategias de imitacion: se puede contrastar este ajuste con `lerobot/pi05_base` sin ajustar para medir la ganancia real del ajuste fino en la misma celda y con las mismas camaras.
- Demostraciones tecnicas y validacion de integracion hardware: verificar puertos, indices de camara, tasas de fotogramas y claves de observacion antes de escalar a otras celdas.
- Investigacion en generalizacion de modelos VLA: reproducir el pipeline de π₀.₅ sobre OpenPI y LeRobot para estudiar transferencia a entornos nuevos con cambios de iluminacion, posicion de objetos o distractores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye explicitamente la nota "_No evaluation results have been provided for this policy yet._": no hay tabla de tareas, numero de intentos, exitos ni tasa de exito en robot real. Tampoco se proporcionan metricas de perdida de entrenamiento, curvas de aprendizaje ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifras oficiales. Como estimacion a partir del numero de parametros (4,14 mil millones), en bf16/fp16 los pesos ocupan en torno a 8,3 GB, por lo que con activaciones de tres flujos de imagen de 224x224 y buffers de generacion de acciones el consumo practico se situa aproximadamente entre 10 y 16 GB. En int8 el peso de los pesos bajaría a unos 4-5 GB, pero no se publican pesos cuantizados.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento con `--policy.device=cuda`, GPUs de 24 GB o mas (RTX 4090, L40S, A100, H100) son apropiadas. Para inferencia, una GPU de 16-24 GB deberia ser suficiente.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090 y modelos con 24 GB; en GPUs de 12 GB el margen es reducido y no esta confirmado por el autor.
- Despliegue: el soporte oficial es LeRobot (`lerobot-rollout`, `lerobot-train`). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, que no son aplicables a una politica robotica de accion continua.
- Latencia y throughput: no disponibles. La politica debe sostener el bucle de control del robot; el ejemplo de la model card configura las camaras a 30 FPS, mientras que el dataset se grabo a 60 FPS.
- Requisitos adicionales: robot UR7e con puerto accesible, tres camaras OpenCV con nombres e indices que coincidan exactamente con las claves de observacion (`observation.images.base_0_rgb`, `observation.images.left_wrist_0_rgb`, `observation.images.right_wrist_0_rgb`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| polarisai-robots/bento_ur7e_v1_pi05 | 4,14 mil millones | No aplica (3 imagenes 224x224 + estado de 32 dim.) | Sin resultados de evaluacion publicados | Apache 2.0 | HuggingFace, 0 descargas, 0 valoraciones |
| lerobot/pi05_base (modelo base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Otras politicas VLA (OpenVLA, SmolVLA, GR00T N1, RDT-1B) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar parametros, contexto, rendimiento o licencia frente a otras politicas VLA de la misma categoria. La unica comparacion sustentada es con el modelo base `lerobot/pi05_base`, del que este repositorio es un ajuste fino de tarea especifica.

## Limitaciones y advertencias

- Politica de tarea unica: esta entrenada exclusivamente para empaquetar una fiambrera con dos piezas de pollo frito y dos de brocoli. Fuera de ese dominio no hay garantia de comportamiento util.
- Sensibilidad al enunciado: la cadena de tarea del dataset contiene la grafia "brocolli"; conviene reproducir el texto literal para no introducir condiciones fuera de distribucion.
- Ausencia total de evaluacion: no hay tasa de exito, numero de intentos ni condiciones de prueba, por lo que se desconoce la fiabilidad real de la politica.
- Dataset pequeno y poco diverso: 204 episodios y 364.128 fotogramas de una sola tarea y, presumiblemente, un solo entorno. No se documentan variaciones de iluminacion, posicion de objetos, distractores ni robots distintos.
- Riesgo de sobreajuste al entorno de grabacion: cambios de iluminacion, fondo, posicion de camara o tipo de objeto pueden degradar el rendimiento sin aviso.
- Discrepancia en la configuracion de camaras: la seccion "Model Details" declara dos camaras (`top`, `wrist`) mientras que la tabla de entradas define tres claves de imagen (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`). Hay que verificar cuales son las correctas antes de desplegar.
- Discrepancia en la frecuencia de fotogramas: el dataset se grabo a 60 FPS y el comando de ejemplo configurara las camaras a 30 FPS.
- Dependencia de hardware concreto: requiere un brazo UR7e y camaras con nombres e indices coincidentes. No se declara compatibilidad con otras plataformas.
- Sin validacion de la comunidad: 0 descargas y 0 valoraciones en el momento de redactar la ficha; el modelo es reciente (creado y actualizado el 17 de septiembre de 2026) y no ha sido contrastado por terceros.
- Riesgo fisico: como toda politica de manipulacion, puede generar acciones incorrectas o inseguras. Es obligatorio operar con limites de fuerza, parada de emergencia supervisada y validacion exhaustiva antes de cualquier uso en produccion.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial con atribucion. No se especifica la licencia del dataset `polarisai-robots/bento_ur7e_v1` ni la del modelo base `lerobot/pi05_base`; conviene verificarlas antes de un despliegue comercial.
- Idiomas: no se declaran idiomas soportados y la unica tarea documentada esta en ingles; se desconoce el comportamiento con instrucciones en castellano.
- No apto como modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso; no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/polarisai-robots/bento_ur7e_v1_pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=polarisai-robots/bento_ur7e_v1
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (Physical Intelligence): no disponible en la informacion proporcionada
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Busqueda web: no se han encontrado resultados relevantes sobre el modelo en la busqueda realizada; los resultados obtenidos corresponden a paginas de soporte de Microsoft y no guardan relacion con este modelo.
