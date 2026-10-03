# kindredbluespirit/xvla-oct26-draft-model

## Resumen
X-VLA (xvla-oct26-draft-model) es un modelo de tipo Vision-Language-Action (VLA) desarrollado por el usuario kindredbluespirit y publicado a traves del ecosistema LeRobot de Hugging Face. Se trata de un ajuste fino del modelo base lerobot/xvla-base sobre un conjunto de datos propio de robótica, orientado al control de un brazo robotico so100 equipado con tres camaras (`laptop`, `phone` y una tercera vista). El modelo resuelve el problema de traducir observaciones visuales y de estado del robot en acciones de control motor, siguiendo el paradigma X-VLA presentado en el articulo arXiv 2510.10274.

La innovacion central del marco X-VLA es tratar cada configuracion de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles. Esto permite que un unico modelo reconcilie morfologias, sensores y espacios de accion diversos mediante decodificacion por flow matching, en lugar de requerir un modelo distinto por plataforma. El modelo tiene 879.687.256 parametros (~880 M) y ocupa 1,8 GB en el repositorio, con pesos en formato safetensors.

Este ajuste concreto esta entrenado para tareas de manipulacion (agarrar y colocar objetos, verter liquido, apilar cubos, ordenar por color) y se distribuye bajo licencia Apache 2.0. Es relevante ahora porque demuestra el flujo de trabajo de fine-tuning de un VLA de proposito general sobre un robot de bajo coste, un caso cada vez mas comun en investigacion de robotica open source.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts (marco X-VLA) |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo de accion robotica; no expone una ventana de contexto de texto convencional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones del dataset estan mayoritariamente en ingles, con al menos una en japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | so100 |
| Camaras | laptop, phone (mas una tercera vista no etiquetada) |
| Biblioteca | lerobot |

## Arquitectura y entrenamiento
El modelo sigue el marco X-VLA, descrito como un framework Vision-Language-Action con soft prompting y decodificacion por flow matching. En lugar de condicionar la politica unicamente sobre la instruccion en lenguaje natural y las observaciones, X-VLA introduce un pequeno conjunto de embeddings de Soft Prompt aprendibles que codifican la identidad del robot o del montaje hardware como si fuera una "tarea". Esto permite que un unico modelo parametrice morfologias, sensores y espacios de accion distintos, manteniendo un tronco compartido vision-lenguaje-accion.

Las entradas del modelo son tres imagenes (`observation.images.image` y `observation.images.image2` de forma 3x256x256, y `observation.images.image3` de forma 3x224x224) y el estado del robot (`observation.state`, vector de dimension 8). La salida es un vector de accion de dimension 6. El ajuste fino se realizo con LeRobot sobre el dataset kindredbluespirit/xvla-oct26-draft-dataset, compuesto por 7783 episodios y 4.210.444 fotogramas a 30 FPS. La composicion de tareas cubre manipulacion de objetos cotidianos (pilas, bloques de lego, dados, cintas, piezas de ajedrez, cubos de colores) con instrucciones como "Grasp a battery and put it in the bin" o "Pick up the red cube and stack it on the yellow cube". No se especifica en la informacion disponible el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Control de robot por instruccion en lenguaje natural: genera secuencias de accion de 6 grados de libertad a partir de instrucciones textuales y observaciones visuales.
- Percepcion multimodal simultanea: procesa hasta tres flujos de imagen (dos a 256x256 y uno a 224x224) junto con el estado del robot de dimension 8.
- Manipulacion fisica: agarre y colocacion de objetos, vertido de liquidos, apilado de cubos, ordenacion por color y movimientos sobre cuadricula.
- Adaptacion a morfologia mediante soft prompts: la variante X-VLA trata cada configuracion de hardware como una tarea, lo que en principio permite reutilizar el tronco entre montajes.
- Seguimiento de instrucciones textuales de tarea: el dataset incluye decenas de descripciones distintas (p. ej. "pour a coffee into the cup", "Sort rubbish by color").
- Soporte de tool calling / function calling: no aplica (modelo de robotica, no de agente de texto).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad declarada; el modelo produce politicas de accion, no cadenas de razonamiento.
- Capacidades multilingues: no disponibles como caracteristica declarada; se observa al menos una instruccion en japones en el dataset.
- Capacidad especial: marco de soft prompting que actua como etiqueta de identidad de hardware/tarea.

## Casos de uso
- Manipulacion pick-and-place en laboratorio: el modelo puede ejecutar instrucciones como "Grasp a block and put it in the designated area" sobre un brazo so100, usando sus tres camaras para localizar el objeto y su vector de estado para planificar la accion.
- Clasificacion y ordenacion de objetos: aplicable a tareas de "Sort rubbish by color" o "Move box red to zone 1", util en lineas de reciclaje o demos de robotica educativa.
- Vertido de liquidos controlado: con tareas de entrenamiento como "pour a coffee into the cup", el modelo es adecuado para experimentos de manipulacion con precision en el agarre y la orientacion del efector.
- Apilado y ensamblaje basico: la tarea "Pick up the red cube and stack it on the yellow cube" lo hace apto para pruebas de precision posicional y secuencias multietapa simples.
- Investigacion en VLA y fine-tuning: sirve como ejemplo reproducible de ajuste de lerobot/xvla-base con LeRobot, util para estudiar transferencia entre morfologias mediante soft prompts.
- Benchmarking de politicas roboticas: al tener 7783 episodios y 4.210.444 fotogramas anotados, puede usarse para comparar estrategias de entrenamiento sobre robots de bajo coste.
- Demostraciones educativas: por su tamano (~880 M) y su licencia Apache 2.0, es desplegable en entornos docentes para ilustrar el pipeline observacion-accion de un VLA.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (calculo orientativo a partir de los 879.687.256 parametros): aproximadamente 1,8 GB en precision fp16/bf16 y en torno a 3,5 GB en fp32, sin contar el coste de los codificadores de vision ni de las activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090; no requiere aceleradores de datacenter (A100, H100) para inferencia en precision reducida.
- Cabe en GPU de consumo: si, con margen amplio dado el tamano del modelo (~880 M de parametros).
- Opciones de despliegue: integracion mediante la biblioteca LeRobot (formato de pesos safetensors); el resto de backends compatibles no se detalla en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- Nota: el modelo requiere hardware robotico so100 y las camaras especificadas (`laptop`, `phone` y una tercera vista) para su uso real, ademas de la infraestructura de control de LeRobot.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kindredbluespirit/xvla-oct26-draft-model | ~880 M | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| lerobot/xvla-base | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Otros VLA de proposito general (p. ej. OpenVLA, pi0) | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base lerobot/xvla-base es el punto de referencia directo. No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de alternativas como OpenVLA o pi0, por lo que no se ofrece una comparacion cuantitativa.

## Limitaciones y advertencias
- Es un ajuste fino especializado para el robot so100 con tres camaras concretas; su uso en otra morfologia o configuracion de sensores requeriria reentrenamiento o adaptacion de los soft prompts.
- El dataset de entrenamiento esta marcado como "draft" (borrador), lo que sugiere que puede no estar curado de forma definitiva.
- Las tareas de entrenamiento estan mayoritariamente en ingles; el soporte multilingue no esta garantizado y podria degradarse con instrucciones en otros idiomas.
- Riesgo de alucinacion en el sentido de acciones incorrectas: al ser una politica de control, un fallo puede traducirse en movimientos fisicos erroneos, con riesgo para el entorno o el propio robot.
- Posible sesgo hacia los objetos, colores e iluminaciones presentes en el dataset (pilas, bloques, cintas, dados, piezas de ajedrez); el rendimiento con objetos fuera de esa distribucion es incierto.
- El modelo tiene 0 descargas y 0 likes, sin validacion externa publica ni resultados de benchmarks, por lo que su robustez no esta contrastada.
- No se documentan cuantizaciones ni formatos alternativos de pesos; solo se confirma safetensors.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de lerobot/xvla-base conviene verificar las condiciones del modelo base original.
- No hay informacion sobre sesgos demograficos ni de otro tipo, ni sobre latencia o requisitos de computo en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kindredbluespirit/xvla-oct26-draft-model
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/kindredbluespirit/xvla-oct26-draft-dataset
- Articulo X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Guia de LeRobot para xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
