# MrC4t/xvla_bi_so_bin4

## Resumen

MrC4t/xvla_bi_so_bin4 es una politica robotica de vision-lenguaje-accion (VLA) fine-tuneada por el usuario MrC4t a partir del modelo base lerobot/xvla-base, que implementa el metodo X-VLA (arXiv:2510.10274). X-VLA es un framework VLA de flow matching con soft prompts: cada robot o configuracion de hardware se trata como una "tarea" representada por un conjunto reducido de embeddings Soft Prompt aprendibles, de modo que un unico modelo puede reconciliar morfologias, sensores y espacios de accion distintos. En este caso concreto, el checkpoint esta especializado en un unico robot bimanual de tipo bi_so_follower con tres camaras (head, left_wrist, right_wrist) y una unica tarea: "put toy in bin".

El modelo tiene 879.687.256 parametros (aproximadamente 0,88 mil millones) y el repositorio ocupa 1,8 GB, un tamano consistente con pesos almacenados en precision de 16 bits. No es un modelo de lenguaje generativo: consume observaciones multimodales (tres imagenes y un vector de estado propioceptivo de 8 dimensiones) y produce directamente un vector de accion continuo de 12 dimensiones, sin pasar por texto intermedio. Se distribuye bajo licencia Apache-2.0 y se ejecuta con la libreria LeRobot, la pila de imitacion learning de Hugging Face.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de como adaptar un backbone VLA preentrenado a una tarea de manipulacion bimanual con muy pocos datos (46 episodios), y como punto de partida para quien quiera fine-tunear X-VLA en su propio robot. Es importante senalar que el autor no ha publicado ningun resultado de evaluacion, que el repositorio acumula 0 descargas y 0 "likes", y que la busqueda web realizada no ha devuelto ninguna fuente tecnica relevante sobre este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA: Vision-Language-Action con flow matching y soft prompts (transformer multimodal) |
| Parametros totales | 879.687.256 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no se documenta ventana de contexto textual. Cada inferencia consume las observaciones del paso de control (3 imagenes de 256x256, 1 imagen de 224x224 y un vector de estado de 8 dimensiones) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors. No se documentan variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | no disponible; el modelo no genera lenguaje. La unica instruccion de tarea entrenada es la cadena en ingles "put toy in bin" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria / runtime | lerobot (version declarada en el entrenamiento: 0.6.2) |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | bi_so_follower (bimanual) |
| Camaras | head, left_wrist, right_wrist |
| Espacio de accion | 12 dimensiones (ACTION) |
| Parametros de entrenamiento | 50.000 pasos, batch size 8, optimizador xvla-adamw, learning rate 1e-4, seed 1000 |
| Dataset de entrenamiento | MrC4t/bimanual_toy_bin (46 episodios, 37.278 frames, 30 FPS, tarea "put toy in bin") |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |
| Fechas | creado 2026-09-17, actualizado 2026-09-17 |

## Arquitectura y entrenamiento

X-VLA es un framework VLA de flow matching con soft prompting. La idea central es tratar cada configuracion de robot o hardware como una "tarea" codificada mediante un conjunto pequeno de embeddings Soft Prompt aprendibles, lo que permite que un unico modelo absorba morfologias, sensores y espacios de accion heterogeneos sin duplicar el backbone. La generacion de acciones se formula como un problema de flow matching sobre trayectorias continuas, en lugar de una prediccion discreta token a token. No se dispone de informacion sobre el numero de parametros del backbone de lenguaje/vision subyacente, el numero de tokens de entrenamiento del modelo base ni la composicion del dataset de preentrenamiento de lerobot/xvla-base.

Este checkpoint concreto es un fine-tuning supervisado por imitacion (behavior cloning) sobre lerobot/xvla-base. El dataset MrC4t/bimanual_toy_bin contiene 46 episodios y 37.278 frames grabados a 30 FPS, con una unica tarea: "put toy in bin". El entrenamiento se ejecuto durante 50.000 pasos con batch size 8, learning rate 1e-4, optimizador xvla-adamw (variante especifica de X-VLA) y seed 1000, usando LeRobot 0.6.2. No se documenta en la informacion disponible el uso de RLHF, DPO u otra fase de alineacion, ni tecnicas de decodificacion especulativa o attention lineal. La model card incluye una plantilla de evaluacion vacia y no reporta resultados en robot real.

## Capacidades

- Generacion de acciones motoras: produce un vector de accion continuo de 12 dimensiones para un robot bimanual de tipo bi_so_follower.
- Percepcion visual multi-camara: procesa tres vistas simultaneas (head, left_wrist, right_wrist) a 256x256 y 224x224 pixeles.
- Fusion multimodal: combina las tres imagenes con un vector de estado propioceptivo de 8 dimensiones antes de predecir la accion.
- Condicionamiento por instruccion de tarea: acepta una cadena de texto de tarea; en este checkpoint la unica instruccion entrenada es "put toy in bin".
- Adaptacion por soft prompts: la morfologia del robot se codifica en embeddings aprendibles, lo que en principio facilita reutilizar el backbone en otros robots.
- Ejecucion en bucle cerrado: disenado para inferencia paso a paso en tiempo real a traves de la CLI de LeRobot (lerobot-rollout).

Capacidades que NO tiene, segun la informacion disponible:

- No genera texto libre ni mantiene conversaciones.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso en el sentido de los LLM.
- No hay soporte multilingue documentado; no se declaran idiomas.
- No tiene vision en sentido general (describir imagenes, VQA) ni audio.
- No esta documentado ningun "thinking mode" ni cadena de razonamiento explicita.

## Casos de uso

- Recogida y deposito bimanual en laboratorio: es el caso de uso literal para el que fue entrenado. El robot bi_so_follower toma un juguete y lo deposita en una caja usando las tres camaras para localizar el objeto y coordinar ambos brazos, con el modelo generando las 12 dimensiones de accion a cada paso de control.
- Punto de partida para fine-tuning en tareas pick-and-place industriales: el flujo documentado (lerobot-train con --policy.path=lerobot/xvla-base) permite reentrenar el backbone en un dataset propio de una celda de fabricacion, cambiando la instruccion de tarea y las claves de observacion.
- Investigacion en imitacion learning con pocos datos: con 46 episodios y 37.278 frames, este checkpoint es un ejemplo util para estudiar hasta que punto un VLA preentrenado se adapta a una tarea nueva con un dataset minimo y que grado de sobreajuste aparece.
- Estudio de transferencia entre morfologias: al estar construido sobre el mecanismo de soft prompts de X-VLA, sirve para experimentar con la reutilizacion del mismo backbone en robots de distinta cinematica o numero de articulaciones.
- Clasificacion y ordenacion de piezas con dos brazos: adaptando la instruccion y el dataset, la misma arquitectura puede cubrir tareas de separar objetos por tipo o tamano en un contenedor, aprovechando la vista de muneca para el ajuste fino de la pinza.
- Pruebas de robustez ante cambios de iluminacion y posicion: el modelo puede evaluarse sistematicamente moviendo el objeto, cambiando la luz o introduciendo distractores para medir la degradacion de la tasa de exito, ya que el autor no ha publicado esa evaluacion.
- Docencia y prototipado rapido con LeRobot: la CLI lerobot-rollout permite poner la politica en un robot fisico con pocos comandos, lo que la hace adecuada para cursos o talleres de robotica de manipulacion.
- Generacion de datos de evaluacion: ejecutando la politica en bucle con --strategy.type=base se pueden grabar episodios de despliegue para analizar modos de fallo y comparar con otras politicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la plantilla vacia y la nota explicita "No evaluation results have been provided for this policy yet." Tampoco se reportan tasas de exito en robot real, latencia de inferencia ni throughput. La busqueda web realizada no aporto ninguna fuente con resultados de este checkpoint (los resultados devueltos eran contenido no relacionado sobre asistencia tecnica de Windows y se han descartado por completo).

## Requisitos de hardware

- VRAM estimada en inferencia: con 879.687.256 parametros, los pesos ocupan aproximadamente 1,76 GB en bf16/fp16 y unos 3,5 GB en fp32. El repositorio de 1,8 GB es coherente con pesos de 16 bits. Hay que anadir el coste de activaciones y de los buffers de imagen (tres vistas de 256x256 y 224x224), por lo que un presupuesto practico de 3-5 GB de VRAM es razonable, aunque el dato exacto no esta publicado.
- GPU consumer: cabe sin problema en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Es un modelo apto para equipos de sobremesa de gama media.
- GPU de centro de datos: A100, H100, L40S o similares son sobredimensionadas para inferencia, pero utiles si se entrena o se ejecuta en paralelo con otros procesos.
- Restriccion critica: el modelo opera en bucle cerrado sobre un robot fisico. El dataset se grabo a 30 FPS, por lo que la politica necesita sostener ese ritmo de control; no se ha publicado la latencia real por paso ni el throughput alcanzable.
- Opciones de despliegue: la via documentada es la CLI de LeRobot (`lerobot-rollout` con `--policy.path=MrC4t/xvla_bi_so_bin4`), sobre PyTorch y CUDA, con camaras accedidas mediante OpenCV. Tambien es posible cargar la politica desde Python con la API de LeRobot.
- No aplica: vLLM, TGI, llama.cpp u Ollama no son validos para esta politica, porque no es un modelo de generacion de texto y no expone una interfaz de completado de tokens.
- Requisitos de integracion: el puerto del robot y los indices de camara son especificos de cada maquina, y los nombres de camara deben coincidir exactamente con las claves de observacion del entrenamiento (image, image2, image3).

## Comparativa con modelos similares

La informacion disponible solo permite comparar con garantias el modelo base del que deriva. Los demas valores se marcan como no verificados en esta busqueda.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MrC4t/xvla_bi_so_bin4 | 879.687.256 | Una tarea bimanual: "put toy in bin" | Apache-2.0 | Hugging Face, 0 descargas, 0 likes | Sin resultados de evaluacion publicados |
| lerobot/xvla-base | no disponible en la informacion proporcionada | Modelo base VLA multi-robot con soft prompts | no disponible en la informacion proporcionada | Hugging Face (lerobot) | Referencia directa para fine-tuning de este checkpoint |
| Otras politicas VLA de la familia LeRobot (por ejemplo SmolVLA) | no disponible en esta busqueda | Manipulacion generalista | no disponible en esta busqueda | Hugging Face (lerobot) | Categoria comparable, pero sin datos verificados en esta ficha |
| Politicas de imitacion clasicas (ACT, Diffusion Policy) | no disponible en esta busqueda | Manipulacion por behavior cloning | no disponible en esta busqueda | Repositorios publicos | Alternativas habituales cuando no se necesita un backbone VLA preentrenado |

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado ninguna tasa de exito, numero de ensayos ni condiciones de prueba. No hay evidencia empirica de que la politica funcione en robot real.
- Dataset muy reducido y de una sola tarea: 46 episodios y 37.278 frames para una unica instruccion ("put toy in bin"). Es un escenario propicio al sobreajuste y a la falta de generalizacion fuera de las posiciones, iluminacion y objetos vistos.
- Especializacion extrema: la politica solo esta entrenada para una tarea y un tipo de robot (bi_so_follower). No debe esperarse que responda a otras instrucciones ni que controle otra cinematica sin reentrenamiento.
- Acoplamiento al hardware y a las camaras: los nombres de camara (head, left_wrist, right_wrist), el numero de brazos y el vector de estado de 8 dimensiones estan fijados. Cualquier discrepancia con el montaje real invalida la inferencia.
- Riesgo de acciones incoherentes: al ser un modelo generativo de acciones por flow matching, puede producir trayectorias fisicamente invalidas o inestables ante entradas fuera de distribucion. No existe una capa de verificacion de seguridad ni limites articulares garantizados.
- Sin salvaguardas fisicas: el modelo no incorpora deteccion de colisiones, parada de emergencia ni limites de fuerza. En un robot real es obligatorio anadir supervision externa y un boton de parada.
- Idiomas e instrucciones: no hay soporte multilingue documentado. La unica cadena de tarea conocida esta en ingles.
- Licencia: Apache-2.0 permite uso comercial y modificacion del modelo, pero no cubre los derechos sobre el dataset MrC4t/bimanual_toy_bin ni sobre posibles datos de terceros incluidos en el. Conviene revisar la licencia del dataset antes de un uso comercial.
- Falta de validacion comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, con creacion y ultima actualizacion separadas por menos de un minuto, lo que sugiere un repositorio recien subido y sin contrastar.
- Dependencia de version: el entrenamiento declara LeRobot 0.6.2. Cambios de version en la libreria pueden alterar la compatibilidad de la politica.
- Sin informacion sobre sesgos: no hay analisis de sesgos de percepcion (color de piel, tipo de objeto) ni de comportamiento diferencial ante distintos entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrC4t/xvla_bi_so_bin4
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrC4t/bimanual_toy_bin
- Visor del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrC4t/bimanual_toy_bin
- Paper de X-VLA (arXiv:2510.10274): https://huggingface.co/papers/2510.10274
- Paper en arXiv: https://arxiv.org/abs/2510.10274
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo ni sobre X-VLA; los resultados obtenidos eran contenido no relacionado sobre asistencia tecnica de Windows y se han descartado. Todos los datos de esta ficha proceden de la model card del repositorio y de los metadatos de Hugging Face.
