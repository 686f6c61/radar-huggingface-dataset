# introvoyz045/Xiaomi-Robotics-1-5B

## Resumen

Xiaomi-Robotics-1 (XR-1) es un modelo fundacional de tipo Vision-Language-Action (VLA) orientado a manipulacion movil. Segun la model card, se inicializa a partir de un modelo preentrenado con mas de 100.000 horas de trayectorias UMI sin encarnacion (embodiment-free) y despues se somete a un post-entrenamiento con mas de 10.000 horas de datos de multiples encarnaciones (cross-embodiment). El resultado es un checkpoint capaz de recibir tres imagenes de camara, una instruccion en lenguaje natural y el estado actual del robot, y devolver una secuencia de acciones predicha.

El repositorio analizado, `introvoyz045/Xiaomi-Robotics-1-5B`, es una copia subida por un tercero (no por el equipo oficial de Xiaomi Robotics) del checkpoint post-entrenado de XR-1, pensada para continuar el post-entrenamiento con el codigo oficial del proyecto. El backbone de vision-lenguaje es `Qwen3-VL-4B-Instruct`, cargado directamente desde el repositorio de Qwen, sobre el que se anade la cabeza de acciones y el pipeline de robotica gestionado por el repositorio de codigo `XiaomiRobotics/Xiaomi-Robotics-1`.

La relevancia actual del modelo reside en su escala de datos de entrenamiento (mas de 110.000 horas combinadas de trayectorias reales) y en su naturaleza cross-embodiment, que busca reducir el coste de adaptar un mismo modelo a distintos robots mediante post-entrenamiento con pocas horas de demostraciones propias. La licencia es Apache 2.0 y el tamano del repositorio es de 10,2 GB. No hay informacion publicada sobre idiomas soportados, longitud de contexto ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) sobre backbone Qwen3-VL (transformer de vision-lenguaje) mas cabeza de prediccion de acciones |
| Parametros totales | no disponible (discrepancia: el repositorio se llama "1-5B" pero el backbone declarado es Qwen3-VL-4B-Instruct; ver limitaciones) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye como `model_states.pt`) |
| Idiomas soportados | no disponible (las instrucciones de lenguaje natural se heredan del backbone Qwen3-VL; no se detalla lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model_states.pt`); no se ofrecen safetensors ni GGUF |
| Tamano del repositorio | 10,2 GB |
| Pipeline declarado | robotics |
| Requisitos de entorno | Python >= 3.9, GPU CUDA, `transformers==4.57.1`, FlashAttention 2 |
| Backbone | Qwen/Qwen3-VL-4B-Instruct |

## Arquitectura y entrenamiento

XR-1 es un modelo fundacional Vision-Language-Action para manipulacion movil. La arquitectura combina un backbone de vision-lenguaje Qwen3-VL (concretamente la variante Instruct de 4B, cargada desde `Qwen/Qwen3-VL-4B-Instruct`) con una cabeza de accion que produce secuencias de acciones a partir de la observacion visual y del estado del robot. La model card no detalla el numero de capas, la dimension oculta ni el mecanismo exacto de la cabeza de accion, por lo que esos datos se consideran no disponibles.

El entrenamiento descrito tiene dos fases. La primera es un preentrenamiento sobre mas de 100.000 horas de trayectorias UMI sin encarnacion concreta (embodiment-free), lo que permite aprender representaciones de habilidad transferibles sin depender de una morfologia especifica. La segunda es un post-entrenamiento sobre mas de 10.000 horas de datos cross-embodiment, que adapta el modelo a distintas plataformas roboticas. No se especifica en la informacion proporcionada si se emplearon tecnicas de RLHF, DPO u otras variantes de ajuste por preferencias, ni la composicion exacta del dataset.

La innovacion destacable es la escala y el caracter agnostico de encarnacion de los datos: el modelo se plantea como base reutilizable que se especializa mediante post-entrenamiento con demostraciones del robot objetivo. El flujo de trabajo oficial exige descargar `model_states.pt`, colocarlo en `pretrained_ckpt/` y lanzar `scripts/train.sh` con el dataset de demostracion, con soporte para entrenamiento en una GPU (`RESOURCE_GPU=1`) o multiples GPUs segun la documentacion del repositorio.

## Capacidades

- Percepcion visual multi-camara: el cliente de despliegue acepta tres imagenes de camara como entrada.
- Comprension de instrucciones en lenguaje natural: el runtime recibe una instruccion textual ademas de las imagenes y el estado del robot.
- Prediccion de acciones: devuelve una secuencia de acciones (action sequence) para el robot, no solo texto.
- Manipulacion movil: la tarea objetivo declarada es mobile manipulation, es decir, combinar navegacion y manipulacion.
- Transferencia cross-embodiment: el post-entrenamiento esta disenado sobre datos de multiples encarnaciones, lo que permite adaptarlo a distintos robots.
- Post-entrenamiento y ajuste fino: el checkpoint esta publicado explicitamente para continuar el entrenamiento con el codebase oficial.
- Capacidades de vision-lenguaje generales: al inicializarse desde Qwen3-VL-4B-Instruct, hereda las capacidades del backbone (no detalladas en la model card).
- Modo de pensamiento (thinking mode): no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso en texto: no disponible.
- Capacidades de audio: no descritas.

## Casos de uso

- Manipulacion movil en almacenes: el modelo recibe tres vistas de camara, el estado del robot y una instruccion como "recoge la caja del estante 3", y devuelve la secuencia de acciones para que la base movil se desplace y el brazo ejecute la recogida; la naturaleza cross-embodiment permite reutilizar el mismo checkpoint en distintas plataformas logísticas con post-entrenamiento corto.
- Tareas domesticas asistidas: con instrucciones en lenguaje natural y observacion visual, se puede post-entrenar para tareas como cargar la lavadora, caso que aparece de hecho como configuracion de ejemplo (`data=load_washer`) en los scripts oficiales.
- Prototipado rapido de politicas robotizadas: un laboratorio puede partir del checkpoint XR-1, recoger unas horas de demostraciones propias y ejecutar `scripts/train.sh` para obtener una politica especifica sin entrenar desde cero.
- Investigacion en transferencia entre robots: el modelo sirve como base para estudiar cuanto conocimiento cross-embodiment se conserva al especializar el modelo en una morfologia nueva.
- Automatizacion de tareas de picking en linea de produccion: el runtime acepta estado actual del robot y devuelve acciones, lo que facilita integrarlo en un bucle de control que consulte al modelo por cada paso.
- Evaluacion de modelos VLA en entornos simulados o de laboratorio: al estar bajo Apache 2.0 y con codigo de despliegue publicado, se puede montar un banco de pruebas con el cliente de runtime y medir tasas de exito por tarea.
- Servicio de inferencia robotica interna: mediante `scripts/deploy.sh` se puede levantar un endpoint que reciba imagenes, instruccion y estado y devuelva acciones para un unico robot o una flota.
- Docencia y formacion en robotica con IA: el par repositorio de pesos mas codebase de entrenamiento y despliegue permite montar practicas completas de post-entrenamiento y despliegue de un VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de tasas de exito por tarea, comparaciones con otros modelos VLA ni metricas de latencia o throughput.

## Requisitos de hardware

- Entorno de referencia declarado: Python >= 3.9, GPU con CUDA, `transformers==4.57.1` y FlashAttention 2.
- VRAM de inferencia: no indicada por el autor. Como referencia, el repositorio ocupa 10,2 GB y el backbone declarado es Qwen3-VL-4B-Instruct; una estimacion orientativa (no confirmada por el autor) situaria la inferencia en precision bf16 en el orden de 10-16 GB de VRAM contando pesos del backbone, torre de vision, cabeza de accion y overhead de activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada. Dado el perfil de VRAM estimado, encajarian tarjetas de 16-24 GB o superiores; no se confirma soporte en GPUs de consumo.
- GPU de consumo: no confirmado. El tamano estimado deja poco margen en tarjetas de 8-12 GB; no hay datos oficiales.
- Post-entrenamiento: los scripts oficiales soportan `RESOURCE_GPU=1` para una sola GPU y opciones multi-GPU documentadas en el README del repositorio de codigo, pero no se publican requisitos minimos de VRAM por GPU.
- Opciones de despliegue: `scripts/deploy.sh` del repositorio oficial, con un cliente de runtime que acepta tres imagenes, instruccion y estado del robot. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (`model_states.pt`) no es directamente compatible con esos servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La tabla siguiente recoge unicamente la categoria de cada alternativa, marcando como no disponible todo dato no verificado.

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xiaomi-Robotics-1 (XR-1) | VLA para manipulacion movil | no disponible (discrepancia 1,5B frente a backbone de 4B) | no disponible | no disponible | Apache 2.0 | Checkpoint en HuggingFace y codebase en GitHub |
| Alternativas VLA de la misma categoria (por ejemplo, familias tipo OpenVLA, pi0 o RDT) | VLA | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio de terceros: el identificador `introvoyz045/Xiaomi-Robotics-1-5B` no corresponde a una organizacion oficial de Xiaomi Robotics, por lo que no hay garantia de que los pesos sean identicos a los publicados por el equipo original. Conviene verificar el contenido antes de usarlo en produccion.
- Discrepancia de nomenclatura: el repositorio se llama "1-5B" mientras que el backbone declarado es Qwen3-VL-4B-Instruct (4B). No queda claro en la informacion disponible si el total de parametros incluye o no la cabeza de accion, ni a que se refiere exactamente el "1-5B". Tratar cualquier cifra de parametros como no confirmada.
- Sin senales de validacion comunitaria: 0 descargas y 0 "me gusta" en el momento de la consulta, lo que implica ausencia de verificacion por parte de la comunidad.
- Formato de pesos propietario del pipeline: el checkpoint se distribuye como `model_states.pt` y requiere el codebase `XiaomiRobotics/Xiaomi-Robotics-1` para cargarse; no es directamente utilizable con herramientas genericas de inferencia.
- Dependencias estrictas: `transformers==4.57.1` y FlashAttention 2, con Python >= 3.9 y GPU CUDA. Entornos con versiones distintas pueden fallar.
- Requiere post-entrenamiento para uso real: el checkpoint publicado es un punto de partida para post-entrenamiento, no una politica lista para desplegar en un robot concreto.
- Riesgo fisico: conectar un checkpoint post-entrenado a un robot real puede provocar movimientos incorrectos. La propia documentacion recomienda leer la seccion de despliegue antes de hacerlo; es imprescindible usar limites de par, paradas de emergencia y validacion en simulacion.
- Idiomas: no se especifica la lista de idiomas soportados para las instrucciones de lenguaje natural. Al heredar el backbone Qwen3-VL es previsible un buen soporte multilingue, pero no esta confirmado en la informacion disponible.
- Alucinacion y generalizacion: no hay datos publicados sobre tasas de exito, generalizacion a objetos no vistos ni robustez ante cambios de iluminacion; se desconoce el comportamiento fuera de la distribucion de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de dicha licencia, pero se debe conservar el aviso de licencia y la atribucion. La licencia se aplica al repositorio de pesos, no necesariamente a los datos de entrenamiento subyacentes, cuya licencia no se detalla.
- Idiomas de la documentacion: la model card esta en ingles y no se ofrece version en castellano.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/introvoyz045/Xiaomi-Robotics-1-5B
- Codebase oficial: https://github.com/XiaomiRobotics/Xiaomi-Robotics-1
- Documentacion de post-entrenamiento: https://github.com/XiaomiRobotics/Xiaomi-Robotics-1/blob/main/xr1/README.md
- Documentacion de despliegue: https://github.com/XiaomiRobotics/Xiaomi-Robotics-1/blob/main/xr1/README.md#deployment
- Dataset de demostracion para post-entrenamiento: https://huggingface.co/datasets/XiaomiRobotics/xr1_post_train_demo/tree/main
- Backbone de vision-lenguaje: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper citado (arXiv:2607.15330): https://arxiv.org/abs/2607.15330
