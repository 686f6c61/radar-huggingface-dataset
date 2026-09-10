# hungho77/so101-multitask-act

## Resumen

`hungho77/so101-multitask-act` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones ("chunks") en lugar de pasos individuales. El modelo lo publica el usuario hungho77 en Hugging Face y se ha entrenado y subido con LeRobot, la librería de Hugging Face para robótica de imitación. Está asociado al dataset `hungho77/so101-multitask` y orientado a tareas de pick-and-place multitaréa sobre el brazo SO-101 (el ejemplo de evaluación de la model card invoca el tipo de robot `so100_follower`, de la misma familia y API que el SO-101).

A diferencia de un modelo de lenguaje, no es un modelo generativo de texto: es una política visomotora que consume observaciones (imágenes de cámara y estado de las articulaciones) y emite comandos motores. Por eso muchas de las especificaciones habituales de una ficha de LLM (contexto, idiomas, cuantizaciones, tool calling) no aplican y se marcan como tales.

El checkpoint tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio, lo que corresponde a pesos en precisión de 32 bits (51,67 M × 4 bytes ≈ 207 MB). Es, por tanto, un modelo pequeño y ligero, ejecutable en GPU de consumo e incluso en CPU para pruebas. Su relevancia es la de servir como punto de partida reproducible para tareas de manipulación multitaréa con hardware de bajo coste y como referencia para comparar con políticas más recientes (Diffusion Policy, VLA). El modelo no tiene descargas ni likes en el momento de redactar esta ficha, por lo que carece de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE, sobre encoder visual tipo ResNet y estado de articulaciones |
| Parametros totales | 51.668.614 (dato real extraido de safetensors) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable: no es un modelo de lenguaje. Consume observaciones (imagenes + estado de articulaciones) y predice un chunk de acciones. El tamano de chunk y el numero de pasos de observacion de este checkpoint no estan publicados |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors; con 0,2 GB para 51,67 M de parametros, corresponden a precision de 32 bits (fp32) |
| Idiomas soportados | No aplicable: no procesa lenguaje natural; produce acciones motoras |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |

## Arquitectura y entrenamiento

ACT se describe en el articulo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705), referenciado en las etiquetas del repositorio. La formulacion publicada combina un autoencoder variacional condicional (CVAE) que comprime la secuencia de acciones futura en una variable latente de estilo, un encoder visual (ResNet preentrenado en ImageNet) que procesa una o varias camaras, y un transformer encoder-decoder que fusiona imagen, estado de las articulaciones y la latente para predecir un chunk de acciones. En inferencia se usa ensamblado temporal (*temporal ensembling*) para suavizar la transicion entre chunks. Los valores concretos de la configuracion publicada en el repositorio oficial de ACT (dimension de modelo 512, 8 cabezas, chunk de 100 acciones, latente de dimension 32) son los valores por defecto del metodo, pero **no se confirman para este checkpoint**, ya que la model card no incluye el fichero de configuracion.

El entrenamiento es de aprendizaje por imitacion supervisada a partir de teleoperacion, no hay RLHF ni DPO (no aplican a una politica motora). Se realizo con el comando `lerobot-train` de LeRobot sobre el dataset `hungho77/so101-multitask`, cuyo contenido no esta detallado en la informacion disponible: se desconoce el numero de episodios, las tareas exactas incluidas, el numero de camaras, la frecuencia de control y la composicion del conjunto de datos. Tampoco se documenta si hubo aumento de datos o preentrenamiento adicional mas alla del backbone visual.

## Capacidades

- Manipulacion visomotora: genera comandos de articulaciones para el brazo SO-101 a partir de imagenes y del estado de las articulaciones.
- Ejecucion multitaréa: el nombre y el dataset asociado indican que cubre varias tareas de pick-and-place, no una unica tarea especializada.
- Prediccion por chunks: emite secuencias cortas de acciones, lo que reduce la frecuencia efectiva de inferencia necesaria y mejora la suavidad del movimiento frente a politicas paso a paso.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas; no requiere recompensa ni simulador para el ajuste.
- Integracion con LeRobot: compatible con `lerobot-train` y `lerobot-record` para reentrenamiento y evaluacion.
- Tool calling / function calling: no aplicable.
- Uso como agente o razonamiento multi-paso: no aplicable en el sentido de agentes de lenguaje; el "razonamiento" es la planificacion implicita de un chunk de acciones.
- Capacidades multilingues: no aplicable.
- Vision, audio o modo "thinking": vision si (entrada de camara); audio y modo thinking, no disponibles.

## Casos de uso

- Pick-and-place multitaréa en linea de montaje ligera: la politica puede recoger y colocar objetos de distintas categorias sobre el SO-101, lo que la hace util en celdas de ensamblaje de bajo coste donde no se justifica un brazo industrial.
- Clasificacion y ordenacion de piezas (bin picking): dado un contenedor con objetos mezclados, el modelo selecciona y deposita cada pieza en su destino segun la tarea aprendida.
- Empaquetado y logistica de pequeno formato: colocacion de articulos en cajas o bandejas con posiciones variables, aprovechando la naturaleza multitaréa del entrenamiento.
- Base para fine-tuning especifico: al estar en LeRobot y con licencia Apache 2.0, sirve como inicializacion para reentrenar con un dataset propio de una tarea concreta, reduciendo el numero de demostraciones necesarias.
- Investigacion en aprendizaje por imitacion: sirve como referencia ACT reproducida sobre hardware accesible para comparar contra Diffusion Policy u otras politicas con el mismo dataset.
- Docencia y prototipado en robotica de bajo coste: el modelo cabe en GPU de consumo y el brazo SO-101 es de coste reducido, lo que permite montar practicas de manipulacion sin presupuesto de laboratorio.
- Validacion de pipelines de datos de teleoperacion: util para comprobar el ciclo completo de LeRobot (grabar con `lerobot-record`, entrenar con `lerobot-train`, evaluar con `--policy.path`) antes de escalar a datasets mayores.
- Automatizacion de tareas repetitivas de laboratorio: recogida y colocacion de muestras o consumibles en posiciones fijas con iluminacion controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a la afirmacion cualitativa de que ACT "a menudo alcanza altas tasas de exito", sin cifras. No hay datos de tasa de exito en tareas concretas, numero de episodios de evaluacion, MMLU, HumanEval, GSM8K ni ninguna otra metrica (estas ultimas no aplican a una politica motora). No se deben extrapolar los resultados del articulo original de ACT a este checkpoint, ya que corresponden a otro hardware, otro dataset y otra configuracion.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 unos 103 MB. Sumando activaciones del encoder visual y del transformer para lote 1, una estimacion razonable es del orden de 1 a 2 GB de VRAM con una o dos camaras a resolucion estandar. Es una estimacion derivada del numero de parametros, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica; RTX 3060, RTX 4060, RTX 4090 y tarjetas de portatil recientes sirven. A100 y H100 son innecesarias para inferencia, aunque utiles para reentrenamiento con datasets grandes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas; tambien es viable en CPU para pruebas no criticas en tiempo real.
- Opciones de despliegue: LeRobot (scripts `lerobot-train` y `lerobot-record`), PyTorch y safetensors. vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos de lenguaje y no soportan politicas de accion.
- Latencia y throughput: no disponibles. Para control en tiempo real conviene tener en cuenta que la prediccion por chunks reduce la frecuencia efectiva de inferencia respecto a una politica paso a paso, pero no hay mediciones publicadas de latencia para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa. La tabla siguiente es cualitativa y marca como no disponible cualquier dato no verificado en la informacion proporcionada.

| Modelo | Categoria | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `hungho77/so101-multitask-act` (este) | ACT multitaréa para SO-101 | 51,67 M | Apache 2.0 | Hugging Face, via LeRobot | Sin descargas ni likes; sin benchmarks publicados |
| Otro checkpoint ACT de LeRobot (monotarea) | ACT especializado en una tarea | No disponible | Apache 2.0 tipicamente | Hugging Face, via LeRobot | Suele superar a un modelo multitaréa en su tarea concreta, a costa de no generalizar |
| Diffusion Policy (Chi et al.) | Politica visomotora basada en difusion | No disponible | No disponible en la informacion proporcionada | Codigo y pesos publicos en repositorios de investigacion | Alternativa habitual a ACT; en general mas costosa en inferencia por el muestreo iterativo |
| SmolVLA (Hugging Face) | Vision-Language-Action compacto | No disponible | No disponible en la informacion proporcionada | Hugging Face | Acepta instrucciones en lenguaje natural, algo que este ACT no soporta |

## Limitaciones y advertencias

- Falta de validacion externa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye tasas de exito, numero de episodios ni detalles del dataset.
- Ambito restringido a la distribucion de entrenamiento: al ser aprendizaje por imitacion, el rendimiento se degrada ante cambios de iluminacion, fondo, posicion de camara, tipo de objeto o disposicion de la mesa.
- Sin comprension de lenguaje: no es un VLA; no acepta instrucciones textuales ni permite reespecificar la tarea en tiempo de ejecucion.
- Sin datos de sesgos: no aplica el concepto de sesgo linguistico, pero si existe el riesgo de sesgo de demostracion (posiciones, objetos y estrategias sobrerrepresentados en el dataset).
- Alucinacion: no aplica en el sentido textual. El riesgo equivalente es la generacion de acciones erraticas o inseguras fuera de distribucion, sin mecanismo de autocorreccion.
- Seguridad fisica: es una politica que mueve hardware real. Se recomienda limitar pares, velocidad y espacio de trabajo, y validar en entorno controlado antes de cualquier uso con personas cerca.
- Compatibilidad: el ejemplo de evaluacion de la model card usa `--robot.type=so100_follower`; conviene verificar la calibracion y la correspondencia de articulaciones antes de ejecutar sobre un SO-101 real.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia. No se documentan restricciones adicionales, pero la responsabilidad del uso seguro recae en el integrador.
- Reproducibilidad: al no publicarse el fichero de configuracion ni los hiperparametros de entrenamiento, no es posible reproducir el modelo exactamente a partir de la informacion disponible.
- Idiomas y contexto: no aplicables. No hay ventana de contexto, soporte multilingue ni capacidades de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hungho77/so101-multitask-act
- Dataset asociado: https://huggingface.co/datasets/hungho77/so101-multitask
- Articulo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre ACT; los enlaces recuperados correspondian a contenidos sin relacion (foros y plantillas de diseno), por lo que se omiten.
