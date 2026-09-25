# alimerido/pi05-wrist-top-generic-3k-tn

## Resumen

pi05-wrist-top-generic-3k-tn es una politica robotica de tipo Vision-Language-Action (VLA) publicada por el usuario alimerido en Hugging Face, afinada a partir del modelo base lerobot/pi05_base mediante la libreria LeRobot. Se trata de un fine-tuning de π₀.₅ (Pi05), el modelo VLA de Physical Intelligence disenado para generalizacion en entornos abiertos, cuya implementacion en LeRobot procede del repositorio OpenPI. El modelo no es un LLM de proposito general: su funcion es traducir observaciones visuales y de estado proprioceptivo en comandos de accion para un brazo robotico.

El modelo resuelve una tarea concreta de manipulacion de sobremesa: coger cubos y ladrillos de Lego y colocarlos en cajas o apilarlos, segun la instruccion textual que se le proporcione. Consume dos flujos de imagen RGB de 480x640 (camara de muneca y camara superior) mas un vector de estado de 6 dimensiones, y produce un vector de accion tambien de 6 dimensiones. Cuenta con aproximadamente 4.143 millones de parametros almacenados en safetensors, con un repositorio de 9,4 GB.

Su relevancia es acotada y practica: sirve como ejemplo reproducible de como afinar una politica VLA con un dataset propio pequeno (140 episodios, 94.703 fotogramas a 30 FPS) y desplegarla sobre un robot `so_follower`. No incluye resultados de evaluacion publicados ni datos de rendimiento, y su utilidad fuera del entorno y la configuracion de camaras con los que fue entrenado es incierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); detalles de backbone no disponibles |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de contexto de texto; consume observaciones por paso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (recibe instrucciones de tarea en texto; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ de Physical Intelligence, un modelo VLA que evoluciona π₀ con el objetivo de generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La informacion disponible no detalla el backbone de vision-lenguaje, el numero de capas, el mecanismo de generacion de acciones ni el esquema de entrenamiento original de π₀.₅, por lo que esos extremos quedan como no disponibles.

El fine-tuning se realizo por imitacion (imitation learning) sobre el dataset alimerido/wrist-top-cube\_20260705\_134536, compuesto por 140 episodios y 94.703 fotogramas a 30 FPS. La configuracion de entrenamiento registrada es: 3000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.2. La politica recibe `observation.state` (6,), `observation.images.wrist` (3, 480, 640) y `observation.images.top` (3, 480, 640), y emite `action` (6,). Las tareas cubiertas en el dataset son seis variantes de recogida y colocacion de cubos rojos y ladrillos de Lego azules y rojos en cajas verdes o azules, mas una tarea de apilado de dos cubos rojos.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad a partir de observaciones visuales y de estado, en el marco de una politica de imitacion.
- Manipulacion de sobremesa condicionada por lenguaje: coger y colocar cubos y ladrillos de Lego en cajas de distintos colores, y apilar un cubo rojo sobre otro.
- Procesamiento conjunto de dos vistas RGB (muneca y cenital) de 480x640, lo que aporta informacion tanto egocentrica como global de la escena.
- Ejecucion de tareas multiples dentro del mismo dominio entrenado (las seis instrucciones del dataset), seleccionables mediante el parametro de tarea en el comando de despliegue.
- Control de un robot de tipo `so_follower` con espacio de estado y accion de 6 dimensiones.
- No dispone de tool calling, function calling, razonamiento multi-paso de tipo agente ni modo de pensamiento explicito: es una politica reactiva de accion directa.
- No se documentan capacidades multilingues, de vision general (captioning, VQA) ni de generacion de texto.

## Casos de uso

- Automatizacion de pick-and-place en linea de montaje: la politica puede ejecutar la recogida de piezas (cubos, ladrillos) y su deposito en contenedores concretos, recibiendo la instruccion como cadena de texto y usando las dos camaras para localizar objeto y destino.
- Clasificacion por color en entornos educativos o de prototipado: las tareas entrenadas incluyen variantes con cajas verdes y azules, lo que permite montar una celda de clasificacion simple condicionada por lenguaje.
- Apilado de objetos: la tarea "Grab the right red cube, place it on top of left red cube" permite usarlo como base para experimentos de precision en colocacion vertical.
- Generacion de datos de robotica: al ser una politica LeRobot, puede integrarse en bucles de recogida de episodios para ampliar datasets de imitacion, con `lerobot-rollout` en modo `base`.
- Linea base de investigacion en VLA: sirve como referencia reproducible para comparar tecnicas de fine-tuning sobre π₀.₅ con un dataset de 140 episodios y 3000 pasos, incluyendo el efecto de la semilla y la tasa de aprendizaje.
- Validacion de pipelines de entrenamiento e inferencia con LeRobot 0.6.2: util para verificar la integracion de hardware `so_follower`, calibracion de camaras y formato de observaciones antes de escalar a datasets mayores.
- Despliegue en hardware embebido: existen compilaciones del modelo pi05 en Qualcomm AI Hub Models, lo que abre la puerta a ejecutarlo en dispositivos de borde para robos de bajo consumo (requiere verificacion de compatibilidad con esta politica concreta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito por tarea, numero de ensayos ni metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.143 millones de parametros, los pesos en bf16/fp16 ocupan aproximadamente 8,3 GB y en fp32 unos 16,6 GB, a lo que hay que sumar activaciones y buffers de las dos imagenes de 480x640. Como referencia, el repositorio ocupa 9,4 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y despliegue de referencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de 24 GB en bf16, incluidas RTX 3090, 4090 y similares. En tarjetas de 16 GB seria ajustado y dependeria de tecnicas de cuantizacion no documentadas para este modelo.
- Opciones de despliegue: LeRobot como via oficial (`lerobot-rollout` para ejecutar la politica sobre el robot y `lerobot-train` para reentrenar). No se documenta soporte especifico para vLLM, TGI, llama.cpp ni Ollama, que ademas no son formatos habituales para politicas de accion continua. Existe una implementacion de pi05 en Qualcomm AI Hub Models orientada a dispositivos Snapdragon.
- Latencia y throughput: no disponibles en la informacion proporcionada. La frecuencia de control del dataset de entrenamiento es de 30 FPS, pero no se garantiza que la inferencia alcance ese ritmo en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alimerido/pi05-wrist-top-generic-3k-tn | 4.143.404.816 | No aplica | Sin resultados publicados | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/pi05\_base (modelo base) | No disponible | No aplica | No disponible | No disponible en la informacion proporcionada | Hugging Face |
| alimerido/pi05-wrist-top-generic-3k | No disponible | No aplica | No disponible | No disponible en la informacion proporcionada | Hugging Face |
| alimerido/pi05-wrist-top-cube | No disponible | No aplica | No disponible | No disponible en la informacion proporcionada | Hugging Face |

Las alternativas listadas pertenecen a la misma familia π₀.₅ y al mismo autor o al repositorio oficial de LeRobot, por lo que comparten arquitectura y espacio de observacion/accion, pero la informacion disponible no permite comparar parametros, rendimiento ni condiciones de licencia de forma concluyente. No se dispone de comparaciones con politicas de otros autores (por ejemplo, ACT o Diffusion Policy en LeRobot) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni numero de ensayos, por lo que el rendimiento real en el robot es desconocido.
- Sobreajuste al dominio: el entrenamiento se limita a 140 episodios, seis tareas muy concretas y un unico montaje fisico (camaras de muneca y cenital, robot `so_follower`). Es previsible un mal rendimiento ante cambios de iluminacion, posicion de objetos, distracciones o un robot distinto.
- Dependencia estricta de la configuracion de sensores: los nombres y dimensiones de las observaciones (`observation.images.wrist` y `observation.images.top` a 480x640) deben coincidir con los del entrenamiento; cualquier desviacion invalida la politica.
- Riesgo de alucinacion en sentido amplio: como politica de imitacion, puede generar trayectorias plausibles pero incorrectas cuando la escena difiere de la distribucion de entrenamiento, sin senal de incertidumbre.
- Idiomas: no se documenta ningun soporte multilingue; las instrucciones de tarea estan en ingles y no se especifica como responde a otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base y las dependencias (LeRobot, OpenPI) pueden tener sus propias condiciones que conviene revisar. La model card no detalla restricciones adicionales del autor.
- Datos de entrenamiento con fecha futura en los metadatos (2026-09-25) y cero descargas o valoraciones: no hay evidencia de uso ni validacion por terceros.
- Cita incompleta: el bloque BibTeX de la model card aparece truncado, por lo que la referencia academica no esta completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alimerido/pi05-wrist-top-generic-3k-tn
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/alimerido/wrist-top-cube_20260705_134536
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alimerido/wrist-top-cube_20260705_134536
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de inferencia y rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Implementacion de pi05 en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
- Modelo hermano (variante 3k): https://huggingface.co/alimerido/pi05-wrist-top-generic-3k
- Modelo hermano (variante cube): https://huggingface.co/alimerido/pi05-wrist-top-cube
