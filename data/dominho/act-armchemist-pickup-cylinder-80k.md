# Dominho/act-armchemist-pickup-cylinder-80k

## Resumen

`Dominho/act-armchemist-pickup-cylinder-80k` es una política de robótica basada en ACT (Action Chunking Transformer) publicada por el usuario Dominho para una única tarea de manipulación: recoger un cilindro con el robot `omx_dual_right`. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un checkpoint de control motor entrenado por imitación a partir de demostraciones teleoperadas y empaquetado en el formato de la librería LeRobot, con pesos safetensors y 51.668.668 parámetros (unos 0,2 GB de repositorio).

El modelo consume tres flujos visuales (cámara de cabeza, cámara de profundidad almacenada como vídeo de tres canales y cámara de muñeca) a 480x640, junto con un vector de estado de seis articulaciones, y produce acciones de seis componentes a 15 Hz con un chunk de 100 pasos ejecutados de una vez (unos 6,67 segundos por chunk). El backbone es un ResNet-18 con inicialización ImageNet y el entrenamiento se realizó durante 80.000 pasos en FP32 sobre una única RTX 4070 Ti SUPER de 16 GB.

Su relevancia es acotada y práctica: sirve como artefacto reproducible de aprendizaje por imitación dentro del ecosistema LeRobot, como punto de partida para fine-tuning en tareas de pick-and-place y como ejemplo de entrenamiento ACT documentado con todos sus hiperparámetros. La propia model card advierte de que no se ha realizado ninguna evaluación con conjunto reservado ni medición de tasa de éxito en robot real, por lo que no debe presentarse como una política validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet-18 inicializado en ImageNet |
| Parametros totales | 51.668.668 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume observaciones por paso y predice chunks de 100 acciones |
| Tipos de cuantizacion | no disponibles; el checkpoint se publica en FP32. No se documentan variantes GGUF, int8 ni FP16 |
| Idiomas soportados | coreano (ko) e ingles (en) en los metadatos; la instruccion de tarea esta en coreano ("실린더 잡아줘") y la documentacion en ingles. No es un modelo generativo de texto |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye buffers de normalizacion mean/std en el propio fichero) |
| Entradas | `observation.images.cam_head`, `observation.images.cam_head_depth`, `observation.images.cam_wrist`, cada una `[batch, 3, 480, 640]` en `[0, 1]`; `observation.state` de 6 componentes |
| Salidas | `action` de 6 componentes en el orden `r_joint1`-`r_joint5` y `r_gripper_joint_1` |
| Frecuencia de control | 15 Hz; chunk de accion de 100 pasos ejecutados (unos 6,67 s) |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot | commit `989f3d05ba47f872d75c587e76838e9cc574857a` (compatibilidad con versiones posteriores no verificada) |

## Arquitectura y entrenamiento

ACT es una política de imitación (behavior cloning) que combina un transformer con decodificacion por chunks de acciones. Cada una de las tres corrientes de imagen se codifica con un ResNet-18 con inicializacion ImageNet, y las representaciones resultantes se concatenan con el vector de estado de seis articulaciones antes de entrar en el transformer, que predice directamente un chunk de 100 acciones. El checkpoint incorpora los buffers de normalizacion (media y desviacion tipica) dentro de `model.safetensors`, de modo que la inferencia no requiere ficheros de estadisticas externos. La entrada de profundidad no es un tensor metrico de profundidad: en el dataset se almaceno como un video de tres canales y se utiliza tal cual como representacion visual.

El entrenamiento se realizo sobre el dataset `gamzadole/ARMCHEMIST_PICKUP_CYLINDER` (revision `d117fcc1a9c8a63f32235b2b9cc5702b8c4d8351`, formato LeRobot v2.1). Del material original de 33 episodios y 5.122 fotogramas se excluyeron, tras revision visual del usuario, los indices 0, 1, 5, 11, 12, 13 y 30, quedando un subconjunto de 26 episodios y 4.069 fotogramas a 15 FPS, renumerados de 0 a 25. La configuracion fue de 80.000 pasos con batch de 8, FP32 sin AMP, optimizador AdamW con learning rate 1e-5 tanto para el backbone como para el resto, weight decay 1e-4, recorte de gradiente 10, semilla 1000 y cuatro workers de datos, con checkpoints cada 2.000 pasos. El objetivo inicial de 40.000 pasos se amplio reanudando el estado del modelo y del optimizador desde el paso 2.000 hasta un total de 80.000. El entrenamiento termino el 2026-10-13 a las 00:10:22 KST y la perdida final registrada fue de 0,029. No se aplicaron tecnicas de RLHF ni DPO, que no tienen sentido en este dominio.

## Capacidades

- Ejecucion de una unica tarea de manipulacion: recoger un cilindro ("실린더 잡아줘") con el robot `omx_dual_right`.
- Control de posicion de seis articulaciones (`r_joint1` a `r_joint5` y `r_gripper_joint_1`) a una tasa de 15 Hz.
- Prediccion de chunks de 100 acciones, lo que permite ejecutar unos 6,67 segundos de trayectoria por inferencia.
- Fusion de tres vistas visuales simultaneas (cabeza, profundidad almacenada como video RGB de tres canales y muñeca) con un codificador ResNet-18 por vista.
- Normalizacion integrada de estados y acciones mediante buffers mean/std serializados con los pesos.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni comportamiento de agente mas alla del bucle de control propio de la politica.
- No tiene capacidades multilingues en sentido generativo; las etiquetas de idioma (ko, en) se refieren al contexto del dataset y la documentacion.
- No dispone de modo "thinking", ni entrada/salida de audio, ni generacion de texto o codigo.

## Casos de uso

- Recogida automatizada de cilindros en un banco de laboratorio: el modelo esta entrenado especificamente para esa tarea sobre el robot `omx_dual_right`, con lo que puede desplegarse directamente en una celda que reproduzca la misma disposicion de camaras y la misma calibracion de articulaciones.
- Punto de partida para fine-tuning en tareas de pick-and-place similares: al ser un ACT ya convergido sobre 4.069 fotogramas de demostraciones, sirve como inicializacion para reentrenar con nuevas posiciones de objeto o nuevas piezas, reduciendo el numero de demostraciones necesarias.
- Banco de pruebas reproducible de aprendizaje por imitacion: incluye `dataset_selection.json` y la configuracion de entrenamiento, lo que permite replicar el experimento y comparar variantes de ACT, numero de pasos o resolucion de camaras bajo condiciones controladas.
- Integracion en un pipeline de LeRobot: se carga con `ACTPolicy.from_pretrained` y se ejecuta con `policy.eval()` y `policy.reset()` al inicio de cada episodio, lo que facilita su inclusion en bucles de evaluacion automatizados o en simuladores que respeten las convenciones del dataset.
- Generacion de datos sinteticos o de trayectorias de referencia: las politicas ACT pueden usarse para producir rollouts que alimenten el entrenamiento de politicas mas grandes o de modelos vision-lenguaje-accion, actuando como profesor en destilacion.
- Evaluacion comparativa interna de arquitecturas de control: sirve como linea base de ACT frente a Diffusion Policy u otras politicas del ecosistema LeRobot en la misma tarea y con el mismo subconjunto de datos.
- Docencia y demostracion tecnica: su tamaño reducido (51,7 millones de parametros, 0,2 GB) permite mostrarlo en formaciones sobre imitacion robotica sin necesidad de infraestructura de GPU de gama alta.
- Recoleccion de metricas de robustez ante variaciones de iluminacion o de posicion del cilindro: al estar documentada la ausencia de evaluacion con conjunto reservado, un equipo puede usar este checkpoint como sujeto de pruebas de generalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha realizado ninguna evaluacion con conjunto reservado ni ninguna medicion de tasa de exito en robot real, y advierte de que la perdida de entrenamiento no equivale a una tasa de exito.

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de entrenamiento final | 0,029 | Promedio del ultimo intervalo de logging |
| Tasa de exito en robot real | no disponible | No evaluada |
| Evaluacion con conjunto reservado | no disponible | Los 26 episodios se usaron para entrenamiento |
| MMLU / HumanEval / GSM8K | no aplica | No es un modelo de lenguaje |
| Comparacion con otros modelos | no disponible | Sin datos publicados |

## Requisitos de hardware

- Peso de los parametros en FP32: aproximadamente 207 MB (51.668.668 parametros x 4 bytes), coherente con el tamaño de repositorio de 0,2 GB.
- VRAM estimada para inferencia: en torno a 1-2 GB contando pesos y activaciones de los tres codificadores ResNet-18 a 480x640; no hay medicion publicada, es una estimacion a partir del tamaño del modelo.
- VRAM para entrenamiento: se completo con exito un entrenamiento con batch de 8 en FP32 sobre una RTX 4070 Ti SUPER de 16 GB, por lo que el pico de memoria queda por debajo de ese limite.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente para inferencia (RTX 3050, 3060, 4060, 4070 y superiores); para entrenamiento o fine-tuning conviene una GPU de 16 GB o mas (RTX 4070 Ti SUPER, RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, tanto en inferencia como en entrenamiento segun la configuracion documentada. No se ha validado su ejecucion en CPU ni en hardware integrado.
- Opciones de despliegue: LeRobot con el commit fijado `989f3d05ba47f872d75c587e76838e9cc574857a`, Python 3.11, PyTorch 2.7.1, torchvision 0.22.1 y TorchCodec 0.5.0, instalando `requirements-training.txt`. El dispositivo guardado es CUDA. No se documentan exportaciones a ONNX, TensorRT ni版本 de vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una politica de control.
- Latencia y throughput: no publicados. Como referencia de diseño, un chunk de 100 acciones a 15 Hz cubre 6,67 segundos de ejecucion por inferencia, de modo que basta con una inferencia por chunk si el bucle de control es de lazo abierto.

## Comparativa con modelos similares

No hay datos comparativos publicados en la informacion disponible para esta politica concreta. Dentro del ecosistema LeRobot existen otras familias de politicas (por ejemplo Diffusion Policy, SmolVLA o pi0) que cubren tareas de manipulacion y que podrian ser alternativas conceptuales, pero no se dispone de parametros, licencias ni metricas verificables de esas familias en el material proporcionado.

| Modelo | Arquitectura | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-armchemist-pickup-cylinder-80k | ACT + ResNet-18 | 51.668.668 | chunk de 100 acciones a 15 Hz | no disponible | HuggingFace, 0 descargas y 0 likes |
| Diffusion Policy (LeRobot) | politica basada en difusion | no disponible | no disponible | no disponible | no verificado en esta busqueda |
| SmolVLA (LeRobot) | VLA basada en modelo de lenguaje pequeño | no disponible | no disponible | no disponible | no verificado en esta busqueda |
| pi0 / pi0.5 (LeRobot) | VLA | no disponible | no disponible | no disponible | no verificado en esta busqueda |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no se ha realizado validacion con conjunto reservado ni medicion de tasa de exito en robot real. La perdida de 0,029 corresponde al entrenamiento y no es un indicador de exito en la tarea.
- Riesgo de sobreajuste: los 26 episodios y 4.069 fotogramas se usaron integramente para entrenamiento, sin separacion de validacion.
- Especificidad extrema: la politica solo cubre la tarea de recoger un cilindro con el robot `omx_dual_right`. No generaliza a otras tareas, objetos o morfologias de robot sin reentrenamiento.
- Dependencia estricta de la configuracion de sensores: es necesario replicar exactamente las tres vistas de camara (cabeza, profundidad y muñeca), la resolucion 480x640, el rango `[0, 1]` y las convenciones de ejes, unidades y calibracion de las articulaciones.
- La entrada de profundidad no es profundidad metrica: se almaceno como video de tres canales y se utiliza como representacion visual, por lo que no debe reinterpretarse como un tensor de distancia.
- Licencia no disponible: no se especifica ninguna licencia, por lo que el uso comercial no esta autorizado de forma explicita y debe aclararse con el autor antes de cualquier despliegue productivo.
- Compatibilidad fragil: el artefacto usa el formato de modelo guardado de un commit concreto de LeRobot y no se ha probado con versiones posteriores; se requiere Python 3.11 y las dependencias fijadas.
- No se incluye el estado del optimizador ni de la semilla aleatoria, por lo que no es posible reanudar el entrenamiento desde este repositorio tal cual.
- Riesgo de alucinacion equivalente a fallo de politica: en robotica se manifiesta como acciones erroneas o inseguras cuando la escena difiere de las demostraciones, sin ninguna senal de incertidumbre expuesta.
- Sesgos potenciales derivados del proceso de curado manual: se excluyeron siete episodios por revision visual del usuario, lo que introduce un sesgo de seleccion no cuantificado en el subconjunto final.
- Idiomas: las etiquetas ko y en no implican capacidades linguisticas; la instruccion de tarea esta en coreano y la documentacion en ingles, lo que puede generar confusion sobre la naturaleza del modelo.
- Fecha de publicacion futura en los metadatos (2026-10-13), que conviene verificar antes de citar el artefacto.
- La busqueda web realizada no devolvio ninguna fuente tecnica relacionada con el modelo; los resultados obtenidos correspondian a bases de datos de videojuegos y no aportan informacion util.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dominho/act-armchemist-pickup-cylinder-80k
- Dataset de entrenamiento: https://huggingface.co/datasets/gamzadole/ARMCHEMIST_PICKUP_CYLINDER
- Libreria LeRobot referenciada en la model card (commit usado: `989f3d05ba47f872d75c587e76838e9cc574857a`): https://github.com/huggingface/lerobot
- Resultados de la busqueda web: sin enlaces relevantes; las coincidencias obtenidas (tarkov-database.com, acidhub.net, ddowiki.com, mobalytics.gg, un video privado de YouTube) no guardan relacion con el modelo.
