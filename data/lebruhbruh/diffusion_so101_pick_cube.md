# Lebruhbruh/diffusion_so101_pick_cube

## Resumen

Lebruhbruh/diffusion_so101_pick_cube es un checkpoint de politica visuomotora para robotica entrenado con la implementacion de Diffusion Policy de la libreria LeRobot, publicado por el usuario Lebruhbruh. El modelo resuelve una tarea de manipulacion concreta: coger un cubo con un brazo robotico de la familia SO-100/SO-101, tal como indica el dataset asociado HGLLL/so101_pick_cube y el comando de evaluacion de la model card, que apunta a un `so100_follower`.

Diffusion Policy (Chi et al., 2023, arXiv:2303.04137) formula el control visuomotor como un proceso generativo de difusion: en lugar de regresar una accion unica a partir de la observacion, el modelo aprende a desnoisar una secuencia completa de acciones condicionada por las observaciones. Esto produce trayectorias suaves, multimodales y coherentes en el tiempo, lo que resulta especialmente util en manipulacion con contacto rico y en tareas donde existen varias soluciones validas.

El checkpoint tiene 76.192.454 parametros (~76,2 M) en formato safetensors, ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0. Su relevancia practica es la de un ejemplo reproducible de politica de difusion end-to-end para robotica de bajo coste, ejecutable en hardware de consumo; su alcance, en cambio, es muy limitado: esta especializado en un unico dataset y no se acompanan resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion condicionado por observaciones, con codificador visual y predictor de ruido sobre secuencias de acciones) |
| Parametros totales | 76.192.454 (~76,2 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a un modelo de lenguaje; la equivalente es el horizonte de observacion y el horizonte de accion, cuyo valor exacto no esta disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; el repo solo publica safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje: no procesa instrucciones en lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint LeRobot; tamano del repo 0,3 GB) |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | HGLLL/so101_pick_cube |
| Tarea / embodiment | pick cube con brazo SO-100/SO-101 (comando de ejemplo con `so100_follower`) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-16 (ultima actualizacion 2026-09-16) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Diffusion Policy: un denoising diffusion probabilistic model (DDPM) condicionado que opera sobre el espacio de acciones en lugar de sobre pixeles. Habitualmente se compone de un codificador visual (tipo ResNet preentrenado en ImageNet) que extrae caracteristicas de las imagenes de las camaras, una representacion del estado proprioceptivo del robot, y un predictor de ruido (1D U-Net temporal o transformer) que desnoisa iterativamente una secuencia de acciones futuras. En inferencia se aplica control de horizonte recedente con action chunking: se predice un bloque de acciones, se ejecutan las primeras y se vuelve a planificar, lo que da estabilidad temporal y evita el ruido tipico de las politicas por accion unica.

El entrenamiento se ha realizado con LeRobot sobre el dataset HGLLL/so101_pick_cube, es decir, aprendizaje por imitacion a partir de demostraciones teleoperadas (behavior cloning con objetivo de difusion). No se especifican en la informacion proporcionada el numero de episodios, el numero de pasos de entrenamiento, la composicion de las camaras ni si hubo etapas adicionales de RLHF/DPO (poco habituales en politicas visuomotoras). Tampoco se documentan innovaciones propias mas alla del metodo base.

Nota de coherencia documental: la model card incluye un comando de entrenamiento con `--policy.type=act`, que corresponde a Action Chunking Transformer y no a una politica de difusion. Se trata con alta probabilidad de texto plantilla sin adaptar; conviene no tomarlo como descripcion fiable de la arquitectura entrenada, dado que el `model_name` declarado es `diffusion`.

## Capacidades

- Generacion de trayectorias de accion multimodales y suaves para control visuomotor continuo, mediante desnoisado iterativo condicionado por observaciones visuales y de estado.
- Manipulacion con contacto rico: la formulacion generativa tolera mejor la incertidumbre y los cambios de regimen de contacto que la regresion directa de acciones.
- Control con action chunking y horizonte recedente, que aporta consistencia temporal entre pasos de control.
- Ejecucion de una tarea especifica de pick-and-place de un cubo con brazo SO-100/SO-101, aprendida por imitacion del dataset HGLLL/so101_pick_cube.
- Integracion nativa con el ecosistema LeRobot: scripts `lerobot-train`, `lerobot-record` y evaluacion contra un robot real.
- Soporte de tool calling: no aplica (no es un LLM y no expone API de herramientas).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de lenguaje; el unico "razonamiento" es la planificacion de acciones que emerge del proceso de difusion.
- Capacidades multilingues: no aplica (no procesa lenguaje natural).
- Capacidades especiales: no se documentan modo thinking, vision-lenguaje, audio ni otras salidas distintas de las acciones de robot.

## Casos de uso

- Pick-and-place de un cubo con brazo SO-101: es exactamente el escenario del dataset de entrenamiento; el modelo recibe imagenes de camara y estado de las articulaciones y emite acciones para agarrar y depositar la pieza, con trayectorias suaves gracias a la generacion por difusion.
- Banco de pruebas docente para Diffusion Policy: sirve como checkpoint de referencia para que estudiantes e investigadores comparen en un mismo robot de bajo coste la politica de difusion frente a baselines como ACT, midiendo tasa de exito y tiempo de ciclo.
- Reentrenamiento con datos propios en un laboratorio: al ser un checkpoint LeRobot de 76 M de parametros y 0,3 GB, se puede afinar con demostraciones nuevas en una unica GPU de gama media para tareas de agarre similares.
- Manipulacion con contacto rico en investigacion: tareas de insercion o empuje donde los metodos deterministas fallan por ambiguedad de la solucion; la naturaleza multimodal de la politica permite representar varias estrategias de agarre.
- Prototipado de pipelines de robotica de imitacion: uso como bloque de politica dentro de un flujo completo (captura de demostraciones, entrenamiento, evaluacion con `lerobot-record` y despliegue en el robot) para validar la infraestructura antes de invertir en datasets mayores.
- Inferencia en hardware de bajo coste o edge: con ~76 M de parametros el modelo cabe holgadamente en GPUs de consumo e incluso puede ejecutarse en CPU a baja frecuencia, lo que facilita demostraciones en ferias, aulas o laboratorios sin clúster.
- Comparativa de estrategias de control en robotica abierta: usar el mismo dataset y robot para contrastar difusion, ACT y politicas basadas en VLA pequenos bajo condiciones identicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de tasa de exito, numero de episodios de evaluacion ni comparaciones cuantitativas para este checkpoint concreto. El articulo de referencia (arXiv:2303.04137) reporta evaluaciones del metodo Diffusion Policy en tareas como Push-T o Robomimic, pero esos resultados corresponden a los modelos del paper y no deben atribuirse a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir de 76,19 M de parametros): unos 305 MB en fp32, unos 152 MB en fp16/bf16 y unos 76 MB en int8, a lo que hay que sumar activaciones del codificador visual y del bucle de desnoisado (tipicamente decenas o cientos de MB adicionales segun el numero de pasos de difusion y el tamano de lote).
- GPU recomendadas: cualquier GPU NVIDIA con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, RTX 4090); GPUs de datacenter como A100 o H100 no aportan ventaja para este tamano, salvo por el mayor paralelismo si se evaluan muchos episodios a la vez.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida. Tambien es viable la inferencia en CPU, aunque con menor frecuencia de control.
- Opciones de despliegue: LeRobot (scripts `lerobot-train`, `lerobot-record` y utilidades de evaluacion), PyTorch como runtime subyacente, y exportacion a ONNX o TensorRT para reducir latencia si se necesita control a mayor frecuencia. vLLM, llama.cpp, Ollama o TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control (Hz) ni de tiempo por paso de difusion. Como referencia de orden de magnitud, un modelo de este tamano permite decenas de inferencias por segundo en GPU de consumo con lotes pequenos, pero el dato exacto para este checkpoint no esta documentado.

## Comparativa con modelos similares

| Modelo | Tipo de politica | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_so101_pick_cube (este) | Diffusion Policy (generativa) | 76.192.454 | no disponible | apache-2.0 | HuggingFace, checkpoint comunitario, 0 descargas |
| ACT (Action Chunking Transformer) en LeRobot | Transformer con action chunking, determinista | no disponible en la informacion proporcionada | no disponible | licencia del repositorio LeRobot | Implementado en LeRobot; multiples checkpoints publicos |
| SmolVLA (HuggingFace) | VLA (vision-language-action) de tipo flow matching | no disponible en la informacion proporcionada | no disponible | licencia del proyecto SmolVLA | Pesos abiertos en HuggingFace |
| pi0 / openpi (Physical Intelligence) | VLA con experto de acciones por flow matching | no disponible en la informacion proporcionada | no disponible | licencia del proyecto openpi | Pesos abiertos en el repositorio openpi |

Nota: los datos de parametros y horizontes de las alternativas no estan incluidos en la informacion proporcionada y no se han verificado, por lo que se marcan como no disponibles. La diferencia cualitativa relevante es que Diffusion Policy es una politica puramente visuomotora entrenada por imitacion para un robot y una tarea concretos, mientras que las alternativas de tipo VLA incorporan comprension de instrucciones en lenguaje natural y generalizan a multiples tareas, a costa de un tamano y unos requisitos de hardware mucho mayores.

## Limitaciones y advertencias

- Especializacion extrema: el checkpoint esta entrenado unicamente sobre HGLLL/so101_pick_cube y, en principio, solo funciona para esa tarea, ese robot y esa configuracion de camaras y de entorno. Cambiar la iluminacion, la posicion del cubo, el fondo o la camara puede degradar gravemente el comportamiento.
- Sin evaluacion publica: 0 descargas y 0 likes, sin tasa de exito reportada. No hay evidencia externa de que la politica funcione de forma fiable; hay que validarla en el robot antes de cualquier uso.
- Riesgo de sobreajuste y de alucinacion de acciones: en estados fuera de la distribucion del dataset (objetos no vistos, colisiones, fallos del robot) la politica puede generar trayectorias plausibles pero incorrectas, sin mecanismo de deteccion de fallo ni de recuperacion.
- Sensibilidad a la configuracion de inferencia: el numero de pasos de desnoisado, el horizonte de accion y el numero de acciones ejecutadas antes de replanificar afectan de forma notable al comportamiento y no se documentan en la model card.
- Idiomas y lenguaje: no aplica. El modelo no procesa instrucciones textuales, por lo que no se puede dirigir mediante prompts.
- Sesgos: los sesgos provienen del dataset de demostraciones (posiciones, velocidades y estrategias del operador que teleopero). No hay analisis de sesgo publicado.
- Incoherencia en la documentacion: la model card mezcla el metodo de difusion con un comando de entrenamiento para `--policy.type=act`. Verificar el tipo de politica y la configuracion real antes de reutilizar el checkpoint.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de licencia y atribucion. Hay que revisar por separado la licencia del dataset HGLLL/so101_pick_cube y de las dependencias (LeRobot, pesos preentrenados del backbone visual) antes de un despliegue en produccion.
- Caveat de produccion: para uso industrial se necesitarian envoltorios de seguridad ajenos al modelo (limites de par, paradas de emergencia, deteccion de fallo) y una validacion estadistica con un numero suficiente de episodios, ninguno de los cuales se incluye aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lebruhbruh/diffusion_so101_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/HGLLL/so101_pick_cube
- Articulo de Diffusion Policy (pagina del paper en HuggingFace): https://huggingface.co/papers/2303.04137
- Articulo de Diffusion Policy en arXiv: https://arxiv.org/abs/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Busqueda web: los resultados devueltos no contienen informacion relevante sobre este modelo (eran consultas en chino sobre verificacion de codigo de OpenAI, instalacion de Office, WhatsApp y teclados). No se han encontrado articulos, blogs, demos ni repos adicionales asociados a este checkpoint.
