# imoccur44/g05-docker

## Resumen

G05 newdata step2000 es una imagen Docker para el reto IROS 2026, publicada en HuggingFace por el usuario imoccur44 bajo el identificador `imoccur44/g05-docker`. No se trata de un modelo de lenguaje en el sentido habitual, sino de un artefacto de despliegue reproducible: un contenedor construido sobre la imagen oficial `challenge_base:20260806` que conserva CUDA 12.2, ROS 2 Humble, el flujo de control con Redis/tmux, el directorio de trabajo y el entrypoint de NVIDIA del entorno base. Dentro de la imagen se incluye un checkpoint de politica entrenada, `step_2000.pt`, junto con el codigo fuente del modelo, los recursos del procesador, estadisticas del dataset y las dependencias offline de Python y CUDA.

La imagen implementa los enganches oficiales `InferenceNode.load_model()` e `InferenceNode.predict()`; la funcion de prediccion devuelve un array NumPy `float32` finito con forma `(32, 25)`, es decir, un chunk de accion de 32 pasos con 25 dimensiones por paso. El modo de despliegue por defecto es solo FM (`G05_ENABLE_AR_ACTION=0`), que replanifica un chunk de 32 pasos a aproximadamente 2 Hz mientras un publicador independiente envia pasos a 30 Hz, sustituyendo la trayectoria antigua restante por la recien inferida. Existe un modo de diagnostico con inferencia AR+FM (`G05_ENABLE_AR_ACTION=1`) que reduce sustancialmente la tasa de replanificacion.

Su relevancia es acotada y practica: sirve para reproducir y evaluar un checkpoint concreto en un entorno de competicion robotica con dependencias fijadas, inferencia totalmente offline y validacion previa de carga real del checkpoint y de una inferencia sintetica de forma `(32, 25)` sobre una A100. La model card no documenta arquitectura, numero de parametros, licencia ni idiomas, por lo que la mayor parte de la ficha tecnica queda marcada como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona un codificador de vision con FlashAttention y modos de inferencia FM y AR, pero no describe la arquitectura completa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch (`.pt`), ruta `/opt/g05/run/checkpoints/step_2000.pt` |
| Identificador de imagen | `g05-newdata-step2000:iros2026-fa2-fmonly-pathfix` |
| Imagen base | `challenge_base:20260806` |
| Version de CUDA | 12.2 |
| Middleware robotic | ROS 2 Humble |
| Flujo de control | Redis y tmux |
| Forma de salida de `predict()` | array NumPy `float32` de forma `(32, 25)` |
| Tamano del repositorio | 27,6 GB |
| Plataforma de la imagen | linux/amd64 |
| Entorno offline | `HF_HUB_OFFLINE=1` y `TRANSFORMERS_OFFLINE=1` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo mas alla de dos indicios operativos. El primero es la presencia de un codificador de vision que utiliza FlashAttention 2.8.3.post1, lo que implica un componente de atencion sobre entradas visuales. El segundo es la distincion entre dos modos de inferencia, etiquetados como FM y AR: el modo por defecto es solo FM y el modo de diagnostico combina AR+FM, con una caida notable de la tasa de replanificacion cuando se activa AR. La nomenclatura de los ficheros y de las variables de entorno sugiere un esquema de generacion de acciones por chunks, pero no se documenta ni el tipo de red, ni el numero de capas, ni el mecanismo de atencion, ni si se trata de un transformer, un modelo de difusion, flow matching o una combinacion.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens o de muestras, la composicion del dataset, ni si hubo fases de ajuste por refuerzo, DPO o similares. La model card unicamente menciona que dentro de la imagen se incluyen las estadisticas del dataset y que el checkpoint corresponde al paso 2000 (`step_2000.pt`), ademas de aclarar que el fichero de bloqueo de entrenamiento `.step_2000.pt.lock`, de tamano cero, se ha omitido intencionadamente. La validacion declarada incluye la comprobacion del SHA-256 del checkpoint embebido contra el checkpoint de origen y la coincidencia de la arquitectura del manifiesto de la imagen final (`linux/amd64`). Cualquier afirmacion adicional sobre innovaciones tecnicas, decodificacion especulativa o atencion lineal no esta respaldada por la informacion proporcionada.

## Capacidades

- Inferencia de politica robótica: `InferenceNode.predict()` devuelve un chunk de accion de 32 pasos y 25 dimensiones en `float32`.
- Replanificacion en bucle cerrado: genera una nueva trayectoria de 32 pasos a aproximadamente 2 Hz mientras la ejecucion avanza a 30 Hz, reemplazando la parte restante de la trayectoria antigua.
- Modo solo FM por defecto (`G05_ENABLE_AR_ACTION=0`), orientado a despliegue.
- Modo AR+FM disponible para diagnostico (`G05_ENABLE_AR_ACTION=1`), con menor tasa de replanificacion.
- Procesamiento visual mediante un codificador de vision con FlashAttention 2.8.3.post1.
- Integracion con ROS 2 Humble: la imagen conserva el entorno ROS oficial y el entrypoint de NVIDIA.
- Carga de modelo mediante los enganches oficiales `InferenceNode.load_model()` e `InferenceNode.predict()`.
- Configuracion en tiempo de ejecucion a traves de `eval/infer_setting.py` como fuente unica para `ckpt_path` y `config_path`, con sobrescrituras opcionales mediante `G05_CHECKPOINT` y `G05_CONFIG_PATH` (ambas rutas se validan e imprimen antes de cargar el modelo).
- Funcionamiento totalmente offline: la imagen no consulta el Hub de HuggingFace ni el repositorio de Transformers durante la inferencia.
- No se documenta soporte de tool calling, function calling, agentes, capacidades multilingues, generacion de texto, codigo, matematicas, audio ni modo de razonamiento extendido.

## Casos de uso

- Despliegue reproducible en la competicion IROS 2026: la imagen fija CUDA 12.2, ROS 2 Humble, las dependencias Python y el checkpoint en una unica unidad cargable con `docker load`, lo que elimina la variabilidad de entorno entre maquinas de evaluacion.
- Ejecucion de inferencia en bucle cerrado sobre robot real: `bash scripts/run_infer.sh` arranca la inferencia que replanifica chunks de 32 pasos a unos 2 Hz mientras el publicador envia consignas a 30 Hz, apropiado para tareas de manipulacion que requieren correccion continua.
- Diagnostico comparativo de modos de inferencia: activar `G05_ENABLE_AR_ACTION=1` permite medir el coste del modo AR+FM frente al modo solo FM y decidir cual conviene en funcion de la frecuencia de replanificacion exigida.
- Evaluacion de checkpoints intermedios: al ser un contenedor con checkpoint embebido y rutas parametrizables mediante `G05_CHECKPOINT` y `G05_CONFIG_PATH`, sirve para comparar el paso 2000 con otros pasos en condiciones de entorno identicas.
- Validacion pre-envio de artefactos de competicion: la imagen incorpora comprobaciones de SHA-256 del archivo base y del checkpoint, parseo del manifiesto `linux/amd64` e importaciones de Torch, NumPy, OpenCV, Transformers, Hydra y el adaptador del reto, util como puerta de calidad antes de una entrega oficial.
- Reproduccion de resultados en hardware equivalente: ejecutar la imagen en una maquina con RTX 4090 de 48 GB replica el entorno objetivo declarado por el autor, lo que permite verificar el comportamiento antes de la evaluacion oficial.
- Inferencia en entornos aislados sin red: gracias a `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1` y `GIT_PYTHON_REFRESH=quiet`, la imagen puede ejecutarse en instalaciones con conectividad restringida o sin acceso a Internet.
- Integracion en infraestructura ROS 2 existente: al conservar Redis, tmux y el arbol de trabajo original, el contenedor se puede insertar en un stack de robot que ya use esos componentes sin reescribir la capa de comunicacion.
- Generacion de lotes sinteticos de acciones para pruebas de integracion: la salida determinista en forma `(32, 25)` permite validar consumidores de trayectorias, serializacion y controladores sin depender del robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, error de trayectoria ni comparaciones cuantitativas con otras politicas. Lo unico verificable son las validaciones de integridad y de ejecucion declaradas por el autor, que no constituyen benchmarks de rendimiento:

| Validacion declarada | Resultado |
|---|---|
| SHA-256 del archivo base oficial | Verificado antes de la importacion |
| Manifiesto del archivo Docker final | Parseado correctamente, `linux/amd64` |
| Entrypoint de NVIDIA y entorno ROS oficial | Preservados |
| SHA-256 del checkpoint embebido | Coincide con el checkpoint de origen |
| Importaciones desde la raiz del contenedor | Torch, NumPy, OpenCV, Transformers, Hydra, G05 y adaptador del reto: correctas |
| Carga real del checkpoint e inferencia sintetica `(32, 25)` | Correcta sobre A100 con el sistema de ficheros raiz de la imagen y las bibliotecas del driver inyectadas como en tiempo de ejecucion |
| Tasa de replanificacion en modo solo FM | Aproximadamente 2 Hz, con publicador a 30 Hz |
| Tasa de replanificacion en modo AR+FM | No disponible de forma numerica; la model card indica que se reduce sustancialmente |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el consumo de memoria del checkpoint de 27,6 GB de repositorio ni de la carga en GPU.
- GPU objetivo declarada: RTX 4090 de 48 GB, descrita como host equivalente al de la competicion; el autor recomienda ejecutar la imagen una vez en ese hardware antes de un envio oficial.
- GPU de validacion: A100, utilizada para la prueba de carga real del checkpoint y de inferencia sintetica `(32, 25)`.
- Compatibilidad con GPU de consumo: no confirmada. El unico modelo de consumo mencionado es la RTX 4090 en su variante de 48 GB, que no es una configuracion estandar de consumo; no hay datos para RTX 3090, RTX 4080 u otras.
- Requisitos de ejecucion del contenedor: `--gpus all`, `--network host`, `--ipc host`, entrada interactiva con `-it`, y una plataforma `linux/amd64`.
- Aceleracion: FlashAttention 2.8.3.post1 instalado y usado por el codificador de vision, lo que implica una GPU NVIDIA compatible.
- Software incluido: CUDA 12.2, ROS 2 Humble, Redis, tmux, Torch, NumPy, OpenCV, Transformers y Hydra, todo en modo offline.
- Opciones de despliegue: Docker con `docker load -i QQ.tar.gz` seguido de `docker run`; no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, dado que el artefacto es una imagen de robotica y no un servidor de modelos de lenguaje.
- Latencia y throughput: la unica cifra publicada es la tasa de replanificacion de aproximadamente 2 Hz para el chunk de 32 pasos en modo solo FM; no se publican latencias por inferencia ni throughput en pasos por segundo mas alla del publicador a 30 Hz, que es un componente independiente.
- Almacenamiento: el repositorio ocupa 27,6 GB; el archivo comprimido `QQ.tar.gz` es mas pequeno que la alternativa sin comprimir, aunque no se indica su tamano exacto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria, y los resultados de la busqueda web recibidos no guardan ninguna relacion con este artefacto: consisten en enlaces a videos de YouTube y listados de Spotify asociados a la cadena `QWERTYUIOPASD`, sin conexion con el modelo, con el reto IROS 2026 ni con la imagen Docker. Tampoco se dispone de datos de parametros, contexto, rendimiento o licencia del modelo evaluado que permitan construir una comparacion con alternativas de politicas roboticas. Cualquier tabla comparativa que se elaborase con esta informacion seria inventada, por lo que se omite.

## Limitaciones y advertencias

- Licencia no declarada: al no figurar licencia en el repositorio, no puede asumirse permiso de uso comercial, redistribucion ni modificacion.
- Ausencia total de benchmarks: no hay metricas de exito, generalizacion ni robustez; solo validaciones de integridad e inferencia sintetica.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 likes, sin evidencia externa de uso o validacion por terceros.
- Arquitectura no documentada: se desconoce el tipo de red, el numero de parametros y el mecanismo de generacion de acciones, lo que impide razonar sobre capacidades fuera del chunk `(32, 25)`.
- Salida restringida: `predict()` devuelve exclusivamente un array `float32` de forma `(32, 25)`; cualquier otra forma de uso requiere adaptar la capa de integracion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de trayectorias fisicamente invalidas o inestables, agravado por la ausencia de benchmarks.
- Dependencia fuerte del entorno: la imagen esta acoplada a CUDA 12.2, ROS 2 Humble y a la imagen base `challenge_base:20260806`; cambios de version fuera de ese entorno no estan soportados ni documentados.
- Requisito de plataforma: la imagen solo se publica para `linux/amd64` y requiere GPU NVIDIA; no se documenta soporte para ARM ni para ejecucion en CPU.
- Configuracion sensible: el modo AR+FM reduce de forma sustancial la tasa de replanificacion, por lo que activarlo en produccion puede degradar el comportamiento del bucle de control; el propio autor lo etiqueta como modo de diagnostico.
- Limite de idiomas y contexto: no se declara ningun idioma soportado ni ventana de contexto, dado que el artefacto no es un modelo de lenguaje.
- Fechas del repositorio anomalas: la creacion y actualizacion figuran como 2026-09-19, posteriores a la fecha habitual de consulta; se reproducen tal cual figuran en el repositorio.
- Model card como fuente unica: todas las afirmaciones de rendimiento y validacion proceden del propio autor y no han sido verificadas de forma independiente.
- Entorno offline forzado: `HF_HUB_OFFLINE=1` y `TRANSFORMERS_OFFLINE=1` impiden descargar recursos adicionales en tiempo de ejecucion, lo que limita el ajuste o la sustitucion de componentes sin reconstruir la imagen.
- Exclusion del fichero de bloqueo: el fichero `.step_2000.pt.lock` se ha omitido deliberadamente; si algun flujo de entrenamiento lo requiere, debera recrearse.
- Trazabilidad del checkpoint: aunque se declara la coincidencia de SHA-256 con el checkpoint de origen, la imagen no incluye informacion sobre el dataset exacto ni sobre el procedimiento de entrenamiento que produjo ese paso 2000.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/imoccur44/g05-docker
- Resultados de la busqueda web: ninguno relevante. Los enlaces devueltos (videos de YouTube y pistas de Spotify asociados a `QWERTYUIOPASD`) no guardan relacion con el modelo, con la imagen Docker ni con el reto IROS 2026.
- Paper, blog, repositorio de codigo o demo adicionales: no disponible en la informacion proporcionada.
