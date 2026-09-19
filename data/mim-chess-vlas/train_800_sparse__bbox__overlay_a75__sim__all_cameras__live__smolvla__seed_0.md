# mim-chess-vlas/train_800_sparse__bbox__overlay_a75__sim__all_cameras__live__smolvla__seed_0

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, que combina un backbone de vision-lenguaje con un modulo de generacion de acciones para controlar robots directamente a partir de observaciones visuales e instrucciones en lenguaje natural. El repositorio analizado no es el modelo base, sino un *fine-tune* concreto de `lerobot/smolvla_base` realizado por el usuario `mim-chess-vlas` para una tarea de manipulacion pick-and-place sobre un robot simulado Panda.

El modelo tiene 450.046.176 parametros (~450 M) en formato safetensors y una licencia Apache-2.0, lo que lo situa en la categoria de VLA ligeros, pensados para ejecutarse en hardware de consumo en lugar de en clusters de GPU. Consume tres flujos de imagen de 224x224 (vista de agente y dos camaras en la muneca), un vector de estado de 9 dimensiones y produce un vector de accion de 7 dimensiones, a un ritmo de control de 20 FPS en los datos de entrenamiento.

Su relevancia es doble: por un lado, demuestra que las politicas VLA pueden entrenarse y desplegarse con recursos modestos; por otro, sirve como ejemplo reproducible de un *pipeline* completo de aprendizaje por imitacion con LeRobot, desde la grabacion del dataset hasta la ejecucion en el robot. Al tratarse de un fine-tune especializado, su utilidad fuera del entorno Panda y del conjunto de objetos del dataset es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; sigue el diseno SmolVLA descrito en el articulo arXiv:2506.01844 |
| Parametros totales | 450.046.176 (~450 M), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin cuantizaciones oficiales |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | Panda (7 grados de libertad) |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 224, 224), `observation.images.robot0_eye_in_hand` (3, 224, 224), `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 9,6 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de vision-lenguaje-accion que toma imagenes y una instruccion textual como entrada y emite acciones motoras de forma directa, sin un planificador intermedio. El model card de este repositorio no detalla la composicion interna de capas ni el mecanismo exacto de decodificacion de acciones; esa informacion esta en el articulo SmolVLA (arXiv:2506.01844). Lo que si se especifica es el esquema de entradas y salidas: tres camaras a 224x224, un vector de estado propioceptivo de 9 dimensiones y una accion de 7 dimensiones, el espacio tipico de un manipulador Panda.

El entrenamiento es un *fine-tune* supervisado por imitacion sobre el dataset `mim-chess-vlas/train_800_sparse__bbox__overlay_a75__sim__all_cameras__live`, que contiene 787 episodios y 195.184 fotogramas grabados a 20 FPS, con 40 tareas distintas del tipo "Pick the X and place it into the box". La configuracion declarada es de 60.000 pasos de entrenamiento, batch size 16, optimizador AdamW, tasa de aprendizaje 2e-4 y semilla 0, usando LeRobot 0.6.0. No se documentan fases de RLHF, DPO ni aprendizaje por refuerzo; es aprendizaje por imitacion puro.

El nombre del modelo y del dataset indica varias decisiones de diseno experimentales: datos de simulacion (`sim`), anotaciones de *bounding box* con superposicion al 75 % (`bbox__overlay_a75`), muestreo disperso (`sparse`) y uso de todas las camaras (`all_cameras`). No hay informacion en el model card sobre la funcion de perdida concreta ni sobre tecnicas adicionales como decodificacion especulativa.

## Capacidades

- Control motor de manipulacion: genera acciones de 7 grados de libertad para un robot Panda a partir de observaciones visuales.
- Percepcion visual multi-camara: procesa simultaneamente una vista de agente y dos vistas cenitales de la pinza a 224x224.
- Condicionamiento por lenguaje: acepta instrucciones textuales del estilo "Pick the apple and place it into the box" para seleccionar el objeto objetivo.
- Ejecucion de pick-and-place sobre 40 categorias de objetos distintos declaradas en el dataset (alimentos, utensilios, electrodomesticos y objetos de cocina).
- Integracion con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y `--policy.path`, y se puede reentrenar con los scripts de la libreria.
- Aprendizaje por imitacion reutilizable: sirve como punto de partida para *fine-tunes* en otras tareas de manipulacion sobre la misma plataforma.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento simbolico, generacion de texto libre, vision generalista ni audio.

## Casos de uso

- Automatizacion de pick-and-place en simulacion: la politica se puede ejecutar sobre un Panda simulado para recoger uno de los 40 objetos del dataset y depositarlo en una caja, con instrucciones en lenguaje natural que seleccionan el objeto. Es adecuado porque se entreno exactamente para ese conjunto de tareas y ese robot.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible de un *fine-tune* SmolVLA, con hiperparametros, semilla y dataset publicados, lo que permite comparar variantes (por ejemplo, con y sin *overlay* de bounding box) manteniendo constante el resto del *pipeline*.
- Base para *fine-tuning* en nuevas tareas de manipulacion: al partir de `lerobot/smolvla_base` y con 450 M de parametros, se puede reentrenar con un dataset propio de unas decenas de miles de fotogramas sin necesidad de un cluster grande.
- Estudio del salto simulacion-realidad: el modelo esta entrenado con datos marcados como `sim`, por lo que es un candidato directo para medir la degradacion al transferir la politica a un Panda fisico o a otro simulador.
- Docencia y formacion en robotica: el flujo completo (instalacion de LeRobot, grabacion de datos, entrenamiento, *rollout*) se puede reproducir en un curso con hardware modesto, dado el tamano reducido del modelo.
- Despliegue en hardware de consumo para prototipado: con ~450 M de parametros, la inferencia cabe en GPUs de gama media y en placas integradas tipo Jetson, lo que permite iterar en el laboratorio sin acceso a GPUs de centro de datos.
- Generacion de datos sinteticos y evaluacion de *benchmarks* internos: la politica puede actuar como agente de referencia en un banco de pruebas de manipulacion, comparando tasas de exito entre configuraciones de camaras o de vision.
- Integracion en un bucle de control ROS 2: el vector de accion de 7 dimensiones puede publicarse como comandos de efector final o de articulaciones desde un nodo que cargue el modelo con LeRobot, siempre que se respete la frecuencia de control de 20 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye tablas de tasa de exito, MMLU, HumanEval, GSM8K ni metricas comparables; el dato de 20 FPS corresponde a la frecuencia de grabacion del dataset, no a una medicion de latencia de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos de 450 M de parametros ocupan aproximadamente 1,8 GB en fp32 y 0,9 GB en bf16, a lo que hay que sumar el codificador visual, las activaciones de tres imagenes de 224x224 y el estado del modelo. Como orden de magnitud, se puede asumir un rango de 2 a 4 GB, aunque es una estimacion aritmetica y no una cifra publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM dedicada es suficiente en la practica; entre las habituales, RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 funcionan sin problema, aunque las dos ultimas estan muy sobredimensionadas para este tamano.
- GPU de consumo: si, cabe con holgura en GPUs de consumo de gama media y en plataformas integradas tipo Jetson Orin. Tambien es viable en Apple Silicon mediante PyTorch con backend MPS.
- Opciones de despliegue: LeRobot es la via oficial (`lerobot-rollout`, `--policy.path`), sobre PyTorch. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y *throughput*: no disponibles. El dataset se grabo a 20 FPS, lo que marca una referencia razonable para el bucle de control, pero el model card no publica mediciones de tiempo de inferencia.
- Nota sobre el repositorio: los 9,6 GB del repositorio son muy superiores a los ~1-2 GB que ocuparian los pesos, lo que sugiere la presencia de multiples *checkpoints* u otros artefactos. Conviene revisar los archivos antes de descargarlo en un equipo con poco espacio.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune SmolVLA) | ~450 M | 3 camaras 224x224 + estado (9,) | apache-2.0 | Pesos abiertos en HuggingFace | Especializado en 40 tareas pick-and-place sobre Panda |
| lerobot/smolvla_base | Del orden de cientos de millones (no confirmado en la informacion disponible) | Vision + lenguaje + estado | apache-2.0 | Pesos abiertos en HuggingFace | Modelo base generico del que deriva este *fine-tune* |
| OpenVLA | Del orden de 7.000 M | Imagen unica + instruccion | no disponible en esta busqueda | Pesos abiertos | Modelo VLA de referencia de mayor tamano; requiere mas VRAM |
| π0 (Physical Intelligence) | no disponible en esta busqueda | Multiples camaras + estado | no disponible en esta busqueda | Pesos abiertos | Modelo VLA de proposito general orientado a tareas de manipulacion diversas |

Los datos de los modelos alternativos provienen de informacion publica general y no se han podido verificar en la busqueda web realizada para esta ficha; los campos marcados como no disponibles no deben interpretarse como ausencia de ese dato en sus repositorios originales.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha visto 40 tareas de pick-and-place sobre un robot Panda. No es un VLA de proposito general y probablemente fallara ante objetos, disposiciones o tareas distintas de las del dataset.
- Dependencia de la configuracion de camaras: requiere exactamente tres vistas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a 224x224. Cambiar el numero o la posicion de las camaras invalida la politica.
- Brecha simulacion-realidad: el nombre del dataset incluye `sim`, lo que indica que los datos provienen de simulacion. No se documenta ninguna validacion en robot fisico, por lo que el rendimiento en el mundo real es incierto.
- Alucinacion motora: como toda politica entrenada por imitacion, puede generar acciones plausibles pero incorrectas (agarres fallidos, colisiones) cuando la escena se sale de la distribucion de entrenamiento. No hay mecanismo de verificacion ni de rechazo.
- Sin datos de benchmarks: no se publican tasas de exito, lo que impide valorar objetivamente su calidad frente a alternativas.
- Sesgos y cobertura: los objetos del dataset son en su mayoria alimentos, utensilios y objetos de cocina; no hay evidencia de cobertura de otros dominios, materiales o iluminaciones.
- Idioma: las instrucciones del dataset estan en ingles; no se documenta soporte multilingue ni evaluacion en otros idiomas.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el modelo hereda las condiciones del modelo base y de los componentes de terceros que este utilice; conviene revisar la licencia de `lerobot/smolvla_base` antes de un despliegue comercial.
- Metricas de comunidad nulas: cero descargas y cero likes en el momento de la consulta, sin validacion externa documentada.
- Trazabilidad limitada: el autor no publica informes de evaluacion, videos de demostracion ni curvas de perdida, lo que dificulta evaluar la convergencia del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_sparse__bbox__overlay_a75__sim__all_cameras__live__smolvla__seed_0
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__bbox__overlay_a75__sim__all_cameras__live
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__bbox__overlay_a75__sim__all_cameras__live
- Articulo SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a entidades no relacionadas (centros de radiologia y una facultad universitaria). Todos los enlaces anteriores proceden del model card y de los metadatos de HuggingFace.
