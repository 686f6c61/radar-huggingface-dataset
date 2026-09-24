# jogarulfop/policy_2026-09-23_plug_cable_iolite_no_tactile

## Resumen

Este repositorio contiene una politica de aprendizaje por imitacion entrenada con LeRobot para una tarea robotica concreta: el agarre y conexion de un cable (segun el nombre del artefacto, sobre un dispositivo denominado "iolite" y sin sensores tactiles). No es un modelo de lenguaje ni un modelo multimodal conversacional: es una politica de control (policy) que, a partir de observaciones visuales y del estado del robot, predice directamente las acciones que debe ejecutar el manipulador. Desarrollado por el usuario jogarulfop y publicado con licencia Apache 2.0, el checkpoint tiene 51.668.614 parametros y ocupa 0,2 GB en el Hub.

La arquitectura implementada es ACT (Action Chunking with Transformers), descrita en el articulo arXiv:2304.13705. ACT es un metodo de imitacion que, en lugar de predecir una unica accion por paso, predice fragmentos ("chunks") de acciones futuras, lo que reduce el error de composicion y la acumulacion de deriva tipica de las politicas paso a paso.

Su relevancia es practica y acotada: sirve como ejemplo reproducible de entrenamiento y despliegue de una politica ACT con el ecosistema LeRobot, y como artefacto listo para evaluar en un montaje concreto (conexion de cable sin realimentacion tactil). No incluye model card detallada con tasas de exito, composicion del dataset ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE latente (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; ACT consume la observacion del instante actual y predice un chunk de acciones; el tamano exacto del chunk no se especifica en la informacion disponible) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors, previsiblemente en fp32) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | jogarulfop/2026-09-23_plug_cable_iolite_no_tactile |
| Tamano del repositorio | 0,2 GB |
| Paper de referencia | arXiv:2304.13705 (ACT) |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion basado en un transformer que actua como autoencoder variacional condicionado (CVAE). El modelo recibe observaciones (imagenes de camaras y estado de las articulaciones del robot) junto con una variable latente de estilo, y genera como salida un chunk de acciones de horizonte fijo en lugar de una sola accion. Ese chunk se ejecuta de forma abierta durante varios pasos antes de volver a inferir, lo que aporta consistencia temporal y reduce el ruido de las predicciones individuales. La implementacion habitual de LeRobot combina un backbone convolucional (tipo ResNet) para las imagenes con un encoder y un decoder transformer para las acciones; los 51,7 M de parametros de este checkpoint son coherentes con esa configuracion.

El entrenamiento se realizo a partir de demostraciones teleoperadas recogidas en el dataset jogarulfop/2026-09-23_plug_cable_iolite_no_tactile, orientado a la tarea de conectar un cable sin usar sensores tactiles. No se dispone de informacion sobre el numero de episodios, la cantidad de transiciones, la composicion exacta del dataset, la resolucion de las camaras, la frecuencia de control ni si se aplicaron tecnicas posteriores de refinamiento (RLHF, DPO u otras, poco habituales en este tipo de politicas). El repositorio incluye los comandos de LeRobot tanto para reentrenar desde cero (`lerobot-train --policy.type=act`) como para evaluar la politica con `lerobot-record`.

## Capacidades

- Control robotico por imitacion: genera comandos de actuacion para un manipulador a partir de observaciones visuales y del estado de las articulaciones.
- Prediccion de chunks de acciones: emite secuencias cortas de acciones coherentes entre si, lo que mejora la estabilidad frente a politicas paso a paso.
- Ejecucion de una tarea especifica: conexion de cable sobre el montaje "iolite" en el que fue entrenado, sin realimentacion tactil.
- Integracion con LeRobot: entrenamiento, evaluacion y despliegue mediante las herramientas estandar de la libreria (`lerobot-train`, `lerobot-record`).
- Compatibilidad con robots tipo SO-100/SO-101: los ejemplos de la model card emplean `so100_follower`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbolico ni planificacion basada en lenguaje.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo "thinking", vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Automatizacion de tareas de cableado en linea de montaje: la politica puede ejecutar la conexion de un cable de forma repetitiva tras el entrenamiento con demostraciones, reduciendo la programacion manual de trayectorias.
- Prototipado rapido de politicas de imitacion: sirve como referencia funcional para validar el flujo completo de LeRobot (grabacion de dataset, entrenamiento, evaluacion) antes de escalar a tareas mas complejas.
- Investigacion en manipulacion sin sensores tactiles: permite estudiar hasta que punto una politica puramente visual puede resolver inserciones que normalmente requieren deteccion de fuerza.
- Benchmark interno de politicas ACT: al ser un checkpoint concreto, se puede comparar contra variantes entrenadas con mas datos o con tacto para medir la contribucion de cada fuente de informacion.
- Evaluacion de robustez ante variaciones de iluminacion o posicion: util para medir la sensibilidad de ACT a cambios en las condiciones visuales respecto al dataset original.
- Demostraciones educativas: ejemplo reproducible para cursos y talleres sobre aprendizaje por imitacion con robots de bajo coste.
- Base para fine-tuning en tareas similares: el checkpoint puede reentrenarse con un dataset propio de inserciones o ensamblaje, reutilizando la arquitectura ACT ya configurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de exito, numero de episodios de evaluacion, ni comparaciones con otras politicas. Los unicos datos objetivos disponibles son el numero de parametros (51.668.614) y el tamano del repositorio (0,2 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 51,7 M de parametros ocupan aproximadamente 207 MB; sumando activaciones y buffers de imagen, el consumo tipico se situa por debajo de 1 GB, por lo que es holgadamente ejecutable en GPU de gama de entrada.
- GPU recomendadas: cualquier GPU moderna con CUDA es suficiente (RTX 3060, RTX 4060, RTX 4090, A100, H100). El cuello de botella real suele ser la latencia de captura y preprocesado de imagen, no el calculo del transformer.
- GPU de consumo: si, cabe sin problemas en tarjetas de consumo e incluso en plataformas embebidas tipo NVIDIA Jetson, siempre que la frecuencia de control requerida sea moderada.
- CPU: la inferencia en CPU es viable por el reducido tamano del modelo, aunque puede comprometer la frecuencia de control en lazos cerrados.
- Opciones de despliegue: LeRobot (scripts `lerobot-train` y `lerobot-record`), PyTorch con CUDA, y exportacion a otros runtimes si se convierte el checkpoint. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, la resolucion de las camaras y el tamano del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jogarulfop/policy_2026-09-23_plug_cable_iolite_no_tactile | ACT (LeRobot) | 51.668.614 | No aplica | Apache 2.0 | HuggingFace |
| ACT original (arXiv:2304.13705) | ACT | No disponible en la informacion proporcionada | No aplica | No disponible | Paper y repositorio de los autores |
| Diffusion Policy | Politica por difusion | No disponible | No aplica | No disponible | Implementacion disponible en LeRobot |
| SmolVLA | Vision-lenguaje-accion | No disponible | No disponible | No disponible | Implementacion disponible en LeRobot |
| Otras politicas del Hub de LeRobot (por ejemplo, pi0) | Vision-lenguaje-accion | No disponible | No disponible | No disponible | HuggingFace |

La comparacion cuantitativa no es posible con los datos disponibles: no hay tasas de exito ni metricas de tarea publicadas para este checkpoint, y los modelos alternativos citados pertenecen a familias distintas (difusion, VLA) con regimenes de computo y requisitos de datos diferentes.

## Limitaciones y advertencias

- Especializacion extrema: la politica solo esta entrenada para la tarea y el montaje concretos del dataset asociado; fuera de ese contexto su comportamiento no esta garantizado.
- Sin validacion publicada: no hay tasas de exito, curvas de aprendizaje ni analisis de fallos, por lo que no se puede afirmar que sea apta para produccion.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios en la posicion de la camara, la iluminacion, el fondo o la apariencia de los objetos pueden degradar el rendimiento de forma severa.
- Ausencia de realimentacion tactil: la tarea se entreno sin tacto, lo que limita la capacidad de detectar contactos, fuerzas excesivas o inserciones fallidas.
- Riesgo de acciones inseguras: como toda politica de control, puede generar comandos incorrectos o bruscos; requiere limites de par, paradas de emergencia y supervision en hardware real.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se identifican restricciones adicionales, pero el autor no ofrece garantias.
- Sin soporte declarado: la model card es una plantilla generica de LeRobot y no incluye informacion sobre mantenimiento, versionado ni compatibilidad con versiones futuras de la libreria.
- Trazabilidad limitada: el nombre del repositorio incluye una fecha futura (2026-09-23) y no hay documentacion sobre el procedimiento experimental, lo que dificulta reproducir el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jogarulfop/policy_2026-09-23_plug_cable_iolite_no_tactile
- Dataset de entrenamiento: https://huggingface.co/datasets/jogarulfop/2026-09-23_plug_cable_iolite_no_tactile
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
