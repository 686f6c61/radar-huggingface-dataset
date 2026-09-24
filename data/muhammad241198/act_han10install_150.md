# Muhammad241198/act_HAN10install_150

## Resumen

act_HAN10install_150 es una política de robótica entrenada mediante imitación con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face por el usuario Muhammad241198. No es un modelo de lenguaje: es un controlador visomotor que recibe observaciones (imágenes de cámara y estado del robot) y devuelve secuencias cortas de acciones articulares, también llamadas chunks. Se ha entrenado y exportado con LeRobot, la librería de Hugging Face para aprendizaje por imitación, sobre el dataset REBOOT26/HAN10e-install, que corresponde a una tarea de instalación o montaje.

El modelo tiene 51.736.206 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB, un orden de magnitud muy inferior al de los grandes modelos fundacionales. Su interés práctico está en que una política de este tamaño puede ejecutarse en hardware modesto, incluso en el propio robot, y en que ilustra el flujo completo de LeRobot: entrenamiento desde demostraciones teleoperadas, publicación en el Hub y evaluación con `lerobot-record`. Para desarrolladores e investigadores en robótica, es un ejemplo reproducible de cómo adaptar ACT a una tarea concreta de manipulación.

La información publicada por el autor es mínima: la model card se limita a la plantilla estándar de LeRobot más la licencia, sin detallar hiperparámetros, composición del dataset, número de episodios ni resultados de evaluación. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha, por lo que se trata de un artefacto reciente y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con variable latente estilo VAE condicional |
| Parametros totales | 51.736.206 (≈51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (ACT usa un horizonte de observacion y un tamano de chunk configurables; no se publican los valores de este checkpoint) |
| Tipos de cuantizacion | No disponible. El repositorio contiene pesos en safetensors de 0,2 GB, coherente con precision fp32 (51,7 M x 4 bytes ≈ 207 MB) |
| Idiomas soportados | No aplica (modelo de control roboticos, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | REBOOT26/HAN10e-install |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

ACT se presentó en el articulo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705) como un metodo de aprendizaje por imitacion que predice chunks de acciones en lugar de un unico paso. La arquitectura combina un transformer encoder-decoder con un esquema de autocodificador variacional condicional (CVAE): una variable latente de estilo se infiere a partir de la secuencia de acciones durante el entrenamiento y se fija a cero (o se muestrea) en inferencia, lo que permite representar la variabilidad de las demostraciones humanas sin perder precision. La salida es un chunk de k acciones futuras, lo que reduce el error de compounding y suaviza la politica frente a las estrategias paso a paso.

El entrenamiento es de tipo behavior cloning sobre demostraciones teleoperadas, con una perdida de reconstruccion L1 sobre las acciones mas un termino de divergencia KL sobre la latente. En este caso concreto, el entrenamiento se ha realizado con la herramienta `lerobot-train` (policy.type=act) sobre el dataset REBOOT26/HAN10e-install. No se especifican en la informacion disponible el numero de episodios, el numero de tokens o frames, la resolucion de las camaras, la frecuencia de control, el tamano del chunk ni los hiperparametros de optimizacion. Tampoco se indica que se haya aplicado RLHF, DPO ni ningun ajuste posterior con refuerzo.

## Capacidades

- Generacion de acciones de robot: dado un conjunto de observaciones visuales y propioceptivas, produce un chunk de acciones de control para el manipulador.
- Control visomotor de tareas de manipulacion entrenadas: la politica esta especializada en la tarea de instalacion asociada al dataset HAN10e-install.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni de simulador.
- Ejecucion en bucle cerrado: el chunk predicho se ejecuta y se vuelve a inferir con observaciones nuevas, lo que permite corregir desviaciones.
- Integracion nativa con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluacion (`lerobot-record`).
- Compatibilidad con robots tipo SO-100/SO-101 en los ejemplos de evaluacion de la documentacion de LeRobot.
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, audio ni dialogo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues.

## Casos de uso

- Automatizacion de una tarea de montaje o instalacion concreta: la politica reproduce la secuencia aprendida de la tarea HAN10e-install sobre el mismo tipo de robot y utillaje con el que se teleopero, lo que la hace adecuada para prototipos de celda de ensamblaje.
- Replicacion de habilidades teleoperadas: partiendo de demostraciones grabadas por un operador humano, se entrena una politica que ejecuta la misma tarea de forma autonoma y repetible, reduciendo la dependencia del teleoperador.
- Investigacion en aprendizaje por imitacion: sirve como linea base reproducible frente a otras politicas (Diffusion Policy, VQ-BeT, SmolVLA) manteniendo fijo el dataset y el flujo de LeRobot.
- Evaluacion comparativa de checkpoints: el autor publica variantes con distinto numero de pasos de entrenamiento (por ejemplo act_HAN10install_160), lo que permite estudiar la curva de aprendizaje y el sobreajuste segun el numero de actualizaciones.
- Despliegue en hardware de borde: con 51,7 M de parametros, el modelo puede ejecutarse en una GPU integrada o en un modulo tipo Jetson acoplado al robot, sin depender de un servidor externo.
- Docencia y formacion: es un caso practico de tamano reducido para explicar el pipeline completo de LeRobot, desde el dataset hasta la inferencia en el robot.
- Generacion de datos sinteticos de politica: la politica puede usarse como experto para etiquetar rollouts en un simulador o en el robot real, con fines de destilacion o de aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones con otras politicas, y el repositorio no registra descargas ni interacciones que permitan inferir validacion por parte de terceros. El articulo original de ACT (arXiv:2304.13705) reporta tasas de exito en sus propias tareas de manipulacion bimanual, pero esos resultados corresponden a los modelos del paper y no son extrapolables a este checkpoint entrenado sobre REBOOT26/HAN10e-install.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan aproximadamente 207 MB (51,7 M x 4 bytes). Con activaciones, buffers de imagen y el resto del pipeline de inferencia, una reserva de 1 a 2 GB de VRAM es suficiente en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para inferencia, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. Para entrenamiento, el README asume `--policy.device=cuda` y se recomienda una GPU con 8 GB o mas (RTX 3060/4070, A100, H100) en funcion del tamano del dataset y de la resolucion de imagen.
- Cabe en GPU de consumo: si, es un modelo claramente orientado a hardware de consumo. Tambien es viable la inferencia en CPU para tareas de baja frecuencia de control, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (inferencia mediante `lerobot-record` con `--policy.path`), PyTorch nativo, y exportacion a otros runtimes si se convierte el grafo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican a esta politica.
- Latencia y throughput estimados: no disponibles. ACT ejecuta tipicamente inferencias a decenas de hercios en GPUs de gama media, pero no se publica ninguna medicion para este checkpoint concreto.
- Almacenamiento: el repositorio ocupa 0,2 GB, por lo que el despliegue en disco es trivial incluso en sistemas embebidos.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| act_HAN10install_150 | ACT (transformer + CVAE) | 51,7 M | Apache 2.0 | Hugging Face (lerobot) | Especializado en el dataset HAN10e-install; sin evaluacion publicada |
| ACT original del paper (arXiv:2304.13705) | ACT (transformer + CVAE) | No disponible en la informacion proporcionada | No disponible | Codigo y pesos publicados por los autores | Referencia metodologica; resultados en tareas bimanuales propias |
| Diffusion Policy | Politica generativa basada en difusion | No disponible en la informacion proporcionada | No disponible | Repositorio publico de los autores | Alternativa habitual a ACT; suele requerir mas pasos de inferencia por accion |
| VQ-BeT | Discretizacion de acciones en codebook + transformer | No disponible en la informacion proporcionada | No disponible | Repositorio publico de los autores | Alternativa multimodal para acciones multimodales |
| SmolVLA | Vision-language-action model compacto | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face (lerobot) | Incluye entrada de lenguaje; escala mayor que ACT |

La comparacion cuantitativa de parametros y de rendimiento no es posible con los datos disponibles para las alternativas. La diferencia funcional principal es que ACT no acepta instrucciones en lenguaje y esta atado a un unico embodiment y a una unica tarea, mientras que propuestas como SmolVLA o pi0 buscan generalizacion entre tareas y robots a costa de un mayor tamano.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay tasas de exito, numero de rollouts ni comparaciones, por lo que el rendimiento real de la politica es desconocido.
- Especializacion extrema: la politica esta entrenada para una tarea y un montaje concretos (HAN10e-install). Fuera de esa distribucion de estados, objetos y condiciones de iluminacion, el comportamiento no esta garantizado.
- Dependencia del embodiment: cambios en la cinematica del robot, en la calibracion de las camaras o en el utillaje invalidan la politica.
- Riesgo de sobreajuste a las demostraciones: ACT aprende por imitacion, de modo que tiende a reproducir los sesgos y las trayectorias del teleoperador, incluidas posibles ineficiencias.
- Sin capacidad de recuperacion semantica: el modelo no razona ni planifica; ante un fallo de agarre o una obstruccion puede quedar en un estado del que no sabe salir.
- Sin soporte de lenguaje: no se puede dar una instruccion en texto ni modificar el objetivo de la tarea en tiempo de ejecucion.
- Multimodalidad de acciones limitada: aunque la componente CVAE mitiga en parte la ambiguedad de las demostraciones, ACT puede promediar modos de accion cuando las demostraciones son inconsistentes.
- Sesgos de datos no documentados: no se describe la composicion del dataset REBOOT26/HAN10e-install (numero de episodios, operadores, condiciones), por lo que no se puede auditar la diversidad de las demostraciones.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la licencia del modelo no cubre los derechos sobre el dataset ni sobre posibles componentes de terceros.
- Idoneidad para produccion no demostrada: con 0 descargas y 0 valoraciones, y una model card plantilla, no hay evidencia de que el checkpoint sea estable en operacion continua.
- Fecha de publicacion anomala: los metadatos indican creacion en 2026-09-23, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammad241198/act_HAN10install_150
- Variante con otro numero de pasos: https://huggingface.co/Muhammad241198/act_HAN10install_160
- Perfil del autor: https://huggingface.co/Muhammad241198
- Dataset de entrenamiento: https://huggingface.co/datasets/REBOOT26/HAN10e-install
- Articulo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
