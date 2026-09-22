# fecasado/gfm-kitchen-tomato-22dN

## Resumen

`fecasado/gfm-kitchen-tomato-22dN` es una política de robotica entrenada con LeRobot, la libreria de Hugging Face para aprendizaje por imitacion en robotica. El nombre del modelo, `gaze_flow_matching`, indica que se trata de una política basada en flow matching con condicionamiento por mirada (gaze), entrenada sobre el dataset `fecasado/tomato-to-plate-320x240`, que describe una tarea de manipulacion de cocina consistente en trasladar un tomate a un plato con imagenes de 320x240 píxeles.

El modelo tiene 75.225.290 parametros (aproximadamente 75,2 millones) y se distribuye en formato safetensors con un tamano de repositorio de 0,3 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el pipeline declarado en el Hub es `robotics`. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que produce acciones de robot (comandos de efector final y articulaciones) a partir de observaciones visuales y del estado del robot.

La relevancia de esta ficha es acotada: se trata de un checkpoint con 0 descargas y 0 likes, publicado por un autor individual, cuya model card es practicamente la plantilla por defecto de LeRobot sin completar. Esto significa que la mayoria de los datos tecnicos habituales (composicion del dataset, hiperparametros, resultados de evaluacion, velocidad de inferencia) no estan documentados y deben tratarse como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gaze_flow_matching` (política de robotica basada en flow matching con condicionamiento por mirada); la model card no detalla la topologia interna |
| Parametros totales | 75.225.290 (75,2 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; la politica consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas; el repo solo contiene safetensors) |
| Idiomas soportados | no disponible (no aplica; modelo de robotica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | `fecasado/tomato-to-plate-320x240` (resolucion 320x240) |
| Fecha de creacion en el Hub | 2026-09-22 (segun metadatos del Hub) |
| Ultima actualizacion | 2026-09-22 (segun metadatos del Hub) |
| Descargas / likes | 0 / 0 |
| Region | us |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura en detalle. El identificador del modelo, `gaze_flow_matching`, y la etiqueta homonima apuntan a una política de flow matching: un modelo generativo que aprende un campo de velocidad que transforma una distribucion de ruido en una distribucion de acciones, condicionado por observaciones. El termino `gaze` sugiere que la politica incorpora informacion de mirada (puntos de atencion o camara egocentrica) como parte de la condicion, algo coherente con tareas de manipulacion en entornos de cocina donde la atencion visual predice la siguiente accion. No obstante, la model card no confirma la composicion exacta de las entradas, el backbone visual ni la cabeza de accion.

Respecto al entrenamiento, la model card incluye el flujo estandar de LeRobot con `lerobot-train`, pero el ejemplo de comando usa `--policy.type=act`, que es el ejemplo generico de la documentacion y no necesariamente el tipo de politica con el que se entreno este checkpoint. No se especifican el numero de episodios, el numero de tokens o frames, la composicion del dataset, ni si se aplicaron etapas de ajuste adicionales (RLHF/DPO no aplican en este dominio). Tampoco se documentan innovaciones tecnicas concretas, mas alla de lo que sugiere el propio nombre del modelo.

## Capacidades

- Generacion de trayectorias de accion para robot manipulador a partir de observaciones visuales y estado del robot.
- Aprendizaje por imitacion: reproduce politicas derivadas de demostraciones humanas registradas con LeRobot.
- Condicionamiento por mirada (`gaze`), presumiblemente para desambiguar objetos y objetivos en escenas de cocina congestionadas.
- Ejecucion de una tarea especifica: trasladar un tomate a un plato (`tomato-to-plate`), con observaciones de 320x240.
- Integracion con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluacion/inferencia con `lerobot-record`.
- Compatibilidad con robots tipo SO-100 follower, segun el ejemplo de evaluacion de la model card.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural: es una politica de control, no un LLM.
- Capacidades multilingues: no aplica.
- Capacidades de vision: procesa imagenes de entrada (resolucion de trabajo 320x240 segun el dataset), sin que se documenten tareas de vision general (captioning, VQA, deteccion abierta).
- Capacidades especiales (modo thinking, audio, vision general): no disponibles.

## Casos de uso

- Manipulacion de objetos en cocina robotizada: la politica traslada un tomate a un plato, un bloque de habilidad reutilizable en tareas de preparacion de alimentos con brazos tipo SO-100.
- Evaluacion de referencia de nuevas politicas LeRobot: sirve como checkpoint base para comparar variantes de flow matching frente a ACT o Diffusion Policy sobre el mismo dataset `tomato-to-plate-320x240`.
- Recogida automatizada de datos de evaluacion: mediante `lerobot-record --robot.type=so100_follower --policy.path=... --episodes=10` se pueden grabar episodios etiquetados para medir tasa de exito y alimentar reentrenamientos.
- Prototipado en laboratorio con hardware de bajo coste: al tener 75,2 M de parametros, cabe en GPUs de consumo, lo que permite iterar en estaciones de trabajo con una unica RTX 4090 o similar.
- Investigacion en condicionamiento por mirada: el modelo permite estudiar si la señal de gaze mejora la precision de agarre y colocacion frente a politicas puramente visuales.
- Base para fine-tuning en tareas de pick-and-place general: el checkpoint puede reentrenarse sobre datasets propios con objetos y recipientes distintos, partiendo de una política ya expuesta a escenas de cocina.
- Demostraciones educativas de aprendizaje por imitacion: util en cursos y talleres donde se ensena el pipeline completo de LeRobot (dataset, entrenamiento, evaluacion en robot real).
- Validacion de infraestructura de despliegue robotico: sirve para probar la latencia de una politica de 75 M de parametros en el lazo de control antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de exito, numero de episodios de evaluacion, ni comparaciones con otras politicas. El metodo de evaluacion previsto por LeRobot (`lerobot-record` con un numero determinado de episodios) permitiria obtener una tasa de exito, pero no se aporta ningun valor en la documentacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 75,2 M de parametros, no confirmada por el autor):
  - FP32: aproximadamente 300 MB solo de pesos, mas activaciones y buffers de imagen.
  - FP16/BF16: aproximadamente 150 MB de pesos.
  - INT8 (si se convierte manualmente, no hay version publicada): aproximadamente 75 MB de pesos.
- En la practica, el consumo total dependera del backbone visual, del tamano de lote de acciones y de la resolucion de las camaras (320x240 declarada en el dataset).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente; una RTX 3060, RTX 4070, RTX 4090 o superiores son opciones mas que holgadas. Para evaluacion por lotes o entrenamiento desde cero, se recomienda A100, H100 o L40S.
- Cabe en GPU de consumo: si, con margen amplio, incluso en GPUs de gama media y en equipos con GPU integrada de ultima generacion.
- Opciones de despliegue: LeRobot (scripts `lerobot-train` y `lerobot-record`), PyTorch como runtime base, Hugging Face Hub para la carga del checkpoint. vLLM, llama.cpp, Ollama y TGI no aplican, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por paso ni numero de acciones generadas por llamada.

## Comparativa con modelos similares

No hay datos publicados de este checkpoint que permitan una comparacion cuantitativa. La tabla siguiente recoge alternativas del mismo ecosistema (LeRobot) con las celdas marcadas como no disponibles cuando no hay informacion verificable en la documentacion aportada.

| Modelo | Tipo de politica | Parametros | Contexto/observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-tomato-22dN | gaze flow matching | 75,2 M | imagenes 320x240 (dataset asociado) | Apache 2.0 | Hub, 0 descargas |
| ACT (Action Chunking Transformer) | transformer con action chunking | no disponible | no disponible | no disponible | implementado en LeRobot |
| Diffusion Policy | politica generativa por difusion | no disponible | no disponible | no disponible | implementado en LeRobot |
| SmolVLA / pi0 (VLA de proposito general) | vision-language-action | no disponible | no disponible | no disponible | ecosistema LeRobot |

La unica conclusion defendible con la informacion disponible es que este modelo pertenece a la familia de politicas de robotica de ~75 M de parametros, un orden de magnitud por debajo de los VLA de proposito general, y que su licencia Apache 2.0 es mas permisiva que la de algunos checkpoints de investigacion con licencias no comerciales.

## Limitaciones y advertencias

- Model card practicamente vacia: conserva el texto de plantilla de LeRobot ("Model type not recognized — please update this template"), por lo que no hay garantias documentadas sobre el proceso de entrenamiento.
- Especificidad de tarea: el modelo esta entrenado para `tomato-to-plate`; no se puede asumir generalizacion a otros objetos, recipientes, iluminaciones o disposiciones de cocina.
- Sobreajuste al entorno de recogida de datos: cualquier politica de imitacion replica sesgos de las demostraciones (posiciones de camara, velocidades, estilo del operador humano).
- Riesgo de fallo silencioso en produccion: al ser una politica de control, un error se manifiesta como una accion fisica incorrecta, con riesgo de dano en el robot o en el entorno. Se requiere parada de emergencia y supervision.
- Sin datos de sesgo, robustez ni evaluacion de seguridad: no disponibles.
- Sin informacion sobre idiomas: no aplica, pero conviene subrayar que no procesa lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No hay clausulas de uso aceptable especificas, mas alla de las generales de la licencia.
- Reproducibilidad limitada: al no detallarse hiperparametros, semilla, version de LeRobot ni numero de episodios, no es posible reproducir el entrenamiento con la informacion publicada.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-09-22, posterior a la fecha habitual de publicacion; conviene verificar los metadatos si la trazabilidad temporal es relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-tomato-22dN
- Dataset asociado: https://huggingface.co/datasets/fecasado/tomato-to-plate-320x240
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- No se han encontrado papers, blogs, demos ni repositorios adicionales especificos de este modelo en la busqueda web realizada.
