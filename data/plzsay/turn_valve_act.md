# plzsay/turn_valve_act

## Resumen

El modelo `plzsay/turn_valve_act` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso de control. Lo publica el usuario `plzsay` en Hugging Face, se ha entrenado y subido con la librería LeRobot de Hugging Face y está especializado en una única tarea de manipulación: girar una válvula (dataset `plzsay/turn_valve`). No es un modelo de lenguaje: es un controlador neuronal que consume observaciones sensoriales del robot y produce comandos de actuadores.

La relevancia de este tipo de artefactos es práctica: ACT es uno de los métodos de imitación con menor coste computacional que consigue tasas de éxito altas en tareas de manipulación fina con hardware de bajo coste, y este checkpoint concreto (51,7 millones de parámetros, 0,2 GB de repositorio) cabe en cualquier GPU de consumo e incluso se puede ejecutar en CPU. Sirve como referencia reproducible para validar pipelines de entrenamiento y evaluación en LeRobot, y como punto de partida para ajuste fino en tareas de atornillado, giro o inserción.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y bajo el pipeline `robotics` de Hugging Face. En el momento de redactar esta ficha no tiene descargas ni valoraciones registradas, y no se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE para imitacion (metodo ACT, *action chunking*) |
| Parametros totales | 51.668.614 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el metodo ACT opera sobre un horizonte de observacion y un *chunk* de acciones; no se especifica el tamano en la model card) |
| Tipos de cuantizacion | no disponibles (pesos en safetensors; no se documentan variantes GGUF, INT8 ni FP8) |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | plzsay/turn_valve |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

ACT (*Action Chunking with Transformers*, paper arXiv:2304.13705) es un metodo de aprendizaje por imitacion con estructura de autoencoder variacional condicional (CVAE). En la formulacion original, un encoder toma la secuencia de acciones de la demostracion y la comprime en una variable latente de estilo, mientras que un decoder transformer genera un *chunk* de `k` acciones futuras condicionado por la observacion actual (imagenes de camara procesadas por un backbone convolucional y el estado de las articulaciones del robot). El entrenamiento combina una perdida de reconstruccion L1 sobre las acciones con un termino de divergencia KL que regulariza el espacio latente; en inferencia se suele aplicar *temporal ensembling*, promediando las predicciones solapadas de chunks consecutivos para suavizar el control. La model card no detalla la configuracion concreta de capas, dimensiones ni el tamano de chunk de este checkpoint, por lo que esos valores quedan como no disponibles.

El entrenamiento se ha realizado a partir de datos de teleoperacion del dataset `plzsay/turn_valve`, que da nombre a la tarea (girar una valvula). No se especifican en la informacion disponible el numero de episodios, el numero de demostraciones, la frecuencia de control, el numero de camaras ni si se aplicaron tecnicas adicionales de aumento de datos oRLHF/DPO (no aplicables en este paradigma). La model card solo documenta los comandos de LeRobot para reentrenar desde cero (`lerobot-train --policy.type=act`) y para evaluar (`lerobot-record`), lo que permite reproducir el flujo completo pero no conocer la receta exacta usada por el autor.

## Capacidades

- Prediccion de *chunks* de acciones: genera secuencias cortas de comandos de actuador en lugar de pasos aislados, lo que reduce el error de compounding caracteristico de las politicas paso a paso.
- Control de manipulacion robotica: convierte observaciones (estado de articulaciones e imagenes de camara, segun la configuracion) en comandos de posicion o velocidad para un brazo robotico.
- Aprendizaje por imitacion de una tarea concreta: la tarea entrenada es girar una valvula; el modelo no es de proposito general.
- *Temporal ensembling* en inferencia: el metodo ACT admite agregacion de predicciones solapadas para un control mas estable.
- Integracion con el ecosistema LeRobot: entrenamiento, evaluacion y registro de episodios mediante las herramientas oficiales (`lerobot-train`, `lerobot-record`).
- No dispone de *tool calling* ni *function calling*.
- No soporta agentes, razonamiento multi-paso ni planificacion simbolica.
- No tiene capacidades multilingues ni de generacion de texto.
- No incorpora modo de razonamiento explicito (*thinking mode*), vision-lenguaje, audio ni generacion de imagenes.

## Casos de uso

- Automatizacion de una celda de manipulacion para el giro de valvulas: es la tarea exacta sobre la que se entreno, de modo que se puede desplegar directamente sobre el robot y el montaje utilizados durante la teleoperacion, siempre que la camara y la iluminacion coincidan con las del dataset.
- Punto de partida para ajuste fino en tareas de giro o roscado: al ser un checkpoint ACT pequeno (51,7 M de parametros), reentrenarlo con un dataset propio de tornillos, tapones o pomos requiere pocas horas de GPU y muy poca VRAM.
- Validacion de pipelines de imitacion en LeRobot: sirve como caso de prueba reproducible para verificar que la instalacion de LeRobot, el formateo de datasets y el bucle de evaluacion funcionan antes de invertir tiempo en tareas mas complejas.
- Investigacion academica sobre *action chunking*: permite experimentar con el tamano de chunk, el *temporal ensembling* y la regularizacion KL comparando curvas de exito frente a variantes propias.
- Banco de pruebas de hardware de bajo coste: encaja en montajes tipo brazo SO-100/SO-101 con una GPU de gama media, lo que facilita medir latencia de inferencia y frecuencia de control reales por debajo de los 200 MB de pesos.
- Demostraciones en laboratorio o feria: al ejecutarse en un portatil con GPU integrada, se puede llevar el modelo y el robot a un entorno sin servidores para mostrar una tarea de manipulacion de extremo a extremo.
- Auditoria de calidad de datos de teleoperacion: comparar la tasa de exito del modelo con distintas versiones del dataset `plzsay/turn_valve` permite cuantificar cuanto afectan las demostraciones ruidosas o escasas al resultado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion, curvas de perdida ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB solo para los pesos en FP32 (51,7 M de parametros x 4 bytes); alrededor de 0,10 GB si se cargan en FP16. Sumando activaciones y el posible backbone visual, es razonable reservar entre 1 y 2 GB para trabajar con margen.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente; tambien funciona en GPU integradas y en CPU, dado el reducido tamano del modelo.
- Cabe en GPU de consumo: si, de forma holgada, en modelos como RTX 3060, RTX 4060, RTX 4090 o incluso en un portatil con grafica dedicada modesta.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub) sobre PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no son aplicables a una politica de robotica.
- Latencia y throughput estimados: no disponibles. Dependen del tamano del chunk de acciones, la resolucion de las camaras de entrada y la frecuencia de control del robot; no se aportan medidas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plzsay/turn_valve_act | 51,7 M | ACT (imitacion con CVAE + transformer) | observaciones del robot y acciones; *chunk* no especificado | apache-2.0 | Hugging Face, via LeRobot |
| Diffusion Policy | no disponible en la informacion proporcionada | imitacion por difusion de acciones | observaciones del robot | segun implementacion | implementada en LeRobot |
| SmolVLA | 450 M (dato publico del proyecto, no de esta model card) | VLA (vision-lenguaje-accion) | instrucciones en lenguaje e imagenes | segun publicacion original | Hugging Face, via LeRobot |
| pi0 / pi0.5 | aprox. 3 B (dato publico del proyecto, no de esta model card) | VLA de proposito general | lenguaje e imagenes | segun publicacion original | Hugging Face, via LeRobot |

Nota: los datos de SmolVLA y pi0 proceden de la documentacion publica de esos proyectos y no de la model card analizada; se incluyen solo como referencia de categoria. Las cifras exactas de Diffusion Policy varian con la configuracion y no se han verificado.

## Limitaciones y advertencias

- Politica de tarea unica: esta entrenada exclusivamente para girar una valvula con el montaje del dataset `plzsay/turn_valve`; fuera de esa distribucion de observaciones el comportamiento es impredecible.
- Sesgos por dataset: cualquier desequilibrio en las demostraciones (posiciones iniciales, iluminacion, velocidad de teleoperacion) se traslada a la politica. No se documenta composicion ni tamano del dataset.
- Sensibilidad al entorno: cambios en camaras, calibracion, fondo, iluminacion o tipo de valvula pueden degradar la tasa de exito de forma marcada.
- Riesgo de sobreajuste: con un numero de demostraciones bajo, ACT puede memorizar trayectorias; no se aportan curvas de entrenamiento ni validacion cruzada.
- Ausencia de benchmarks: no hay ninguna metrica publicada, por lo que no se puede estimar su rendimiento relativo frente a otras politicas sin evaluarlo uno mismo.
- Sin salvaguardas fisicas: el modelo no incorpora deteccion de colisiones, limites de par ni parada de emergencia; cualquier despliegue real necesita capas de seguridad externas en el controlador.
- Idiomas y lenguaje: no procesa lenguaje natural ni mantiene conversaciones; la fila de idiomas de la model card no esta informada.
- Alucinacion en el sentido linguistico: no aplica; el fenomeno equivalente es la generacion de acciones plausibles pero incorrectas ante entradas fuera de distribucion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se especifican restricciones adicionales ni terminos de uso aceptable propios.
- Sin garantias del autor: el repositorio tiene 0 descargas y 0 valoraciones, y no se declara validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plzsay/turn_valve_act
- Dataset de entrenamiento: https://huggingface.co/datasets/plzsay/turn_valve
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de busqueda web: no se encontraron enlaces relevantes; las entradas devueltas no guardaban relacion con este modelo.
