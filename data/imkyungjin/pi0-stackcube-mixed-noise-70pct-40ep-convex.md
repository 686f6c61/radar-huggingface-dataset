# ImKyungjin/pi0-stackcube-mixed-noise-70pct-40ep-convex

## Resumen

Este repositorio contiene un checkpoint de π₀ (Pi0), el modelo vision-lenguaje-accion (VLA) para control robótico generalista desarrollado originalmente por Physical Intelligence. La implementación utilizada es la de LeRobot, adaptada del repositorio abierto OpenPI. El autor del repositorio, ImKyungjin, publica aquí un ajuste fino del modelo base sobre el conjunto de datos `taewonkoo/stack_cube_mixed_noise_70pct_40ep`, orientado a la tarea de apilar cubos.

El modelo pesa 3.501.372.176 parámetros (unos 3,5 mil millones) y el repositorio ocupa 7,0 GB, lo que es coherente con pesos almacenados en safetensors a 16 bits. Se distribuye bajo licencia Apache-2.0, la pipeline declarada es `robotics` y la librería asociada es `lerobot`. El nombre del checkpoint sugiere un entrenamiento de 40 épocas sobre un dataset con ruido mixto al 70 % y una variante de policy o función de pérdida etiquetada como "convex", aunque el autor no documenta estos detalles en la model card.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de especialización de un VLA generalista mediante ajuste fino con LeRobot, y como punto de partida para experimentos de robustez frente a datos ruidosos en manipulación robótica. En el momento de la consulta acumula 0 descargas y 0 "likes", y no se han publicado resultados de benchmarks asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) π₀, implementada en LeRobot a partir de OpenPI; no disponible el desglose interno exacto en la informacion proporcionada |
| Parametros totales | 3.501.372.176 (≈3,5 mil millones), segun safetensors |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors (7,0 GB para 3,5 mil millones de parametros, consistente con 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

La model card indica que π₀ es un modelo vision-lenguaje-accion para control robótico general, desarrollado por Physical Intelligence, y que la implementación empleada procede del repositorio OpenPI adaptado a LeRobot. Es decir, se trata de una policy que consume observaciones visuales e instrucciones en lenguaje natural y emite acciones de robot. La model card no detalla la composicion interna del backbone, el mecanismo de generacion de acciones ni la configuracion de atencion; esa informacion no esta disponible en los datos proporcionados. Segun la documentacion publica de π₀, la arquitectura combina un modelo de vision-lenguaje preentrenado con un modulo especializado en acciones que genera trayectorias por *flow matching*, pero el repositorio aqui descrito no aporta confirmacion ni cifras propias.

Respecto al entrenamiento, lo unico documentado es el dataset de ajuste fino: `taewonkoo/stack_cube_mixed_noise_70pct_40ep`, propiedad de otro usuario de HuggingFace. De su nombre se deduce una tarea de apilado de cubos (*stack cube*), con ruido mixto al 70 % y 40 epocas, aunque el autor no publica hiperparametros (tasa de aprendizaje, tamano de lote, composicion exacta del dataset, numero de demostraciones). No hay informacion sobre RLHF, DPO ni sobre si el ajuste congela parte del backbone. El sufijo "convex" del checkpoint no se explica en la model card.

## Capacidades

- Control robótico guiado por vision: el modelo genera acciones a partir de observaciones visuales, segun el pipeline `robotics` declarado.
- Interpretacion de instrucciones en lenguaje natural: π₀ se describe como generalista capaz de entender ordenes en lenguaje natural; el grado de soporte real depende del dataset de ajuste, no documentado.
- Tarea especializada de apilado de cubos: el ajuste fino se realizo sobre un dataset de *stack cube*, por lo que su rendimiento esperado se concentra en esa tarea.
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluacion con `lerobot-record` (por ejemplo, sobre un `so100_follower`).
- Ejecucion multi-tarea y multi-robot: la model card atribuye a π₀ la capacidad de controlar distintos robots en tareas diversas, aunque no se detalla que plataformas cubre este checkpoint.
- No hay evidencia en la informacion disponible de soporte de *tool calling*, function calling, agentes multi-paso, generacion de texto conversacional, codigo, matematicas ni vision generalista fuera del bucle de control.

## Casos de uso

- Apilado de cubos en laboratorio: es el escenario directo del ajuste fino; el modelo recibe imagenes de la escena e instrucciones y emite acciones para colocar un cubo sobre otro, lo que permite reproducir la tarea sin programar trayectorias a mano.
- Evaluacion comparativa de ajustes finos: al existir variantes con distinto porcentaje de ruido y numero de epocas, este checkpoint sirve como punto de referencia en estudios de ablacion sobre robustez al ruido en datasets de demostracion.
- Investigacion sobre datos ruidosos: el dataset de origen incorpora ruido mixto al 70 %, de modo que el modelo es util para medir como se degrada o se mantiene una policy VLA cuando las demostraciones contienen ruido.
- Replicacion de pipelines LeRobot: sirve como ejemplo practico para validar el flujo `lerobot-train` -> `lerobot-record` en un robot tipo SO-100, incluyendo la recoleccion de episodios de evaluacion con `--policy.path`.
- Docencia y formacion en robotica: permite ilustrar en un curso el ciclo completo de ajuste fino de un VLA (dataset, entrenamiento, evaluacion en robot real) con requisitos de hardware moderados.
- Base para ajuste posterior (*fine-tuning* adicional): partiendo de estos pesos, un equipo puede adaptar la policy a una variante de la tarea (distinta geometria de cubos, otro brazo) con menos datos que entrenando desde el modelo base.
- Pruebas de robustez en produccion simulada: integrable en un bucle de simulacion o gemelo digital para medir tasa de exito antes de desplegar en hardware fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones con otras policies, y los resultados de busqueda web consultados no aportan datos sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 GB solo para los pesos en 16 bits (3.501.372.176 parametros x 2 bytes), mas el espacio de activaciones para el codificador visual y el modulo de acciones; en la practica, un margen de 10-16 GB de VRAM es el rango razonable, aunque no se dispone de mediciones publicadas para este checkpoint.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, el modelo es compatible con A100, H100, L40S y tarjetas de consumo con 16 GB o mas.
- Compatibilidad con GPU de consumo: si, cabe en RTX 4090, RTX 4080 y, con margen ajustado, en tarjetas de 12-16 GB; no se dispone de confirmacion empirica de latencias en estas GPUs.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` y `--policy.device=cuda`), entrenamiento con `lerobot-train`, y PyTorch como backend. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama no son aplicables; no consta soporte de vLLM ni TGI para este tipo de policy.
- Latencia y throughput: no disponible. La frecuencia de control alcanzable depende del robot, del modo de ejecucion (acciones en bloque o paso a paso) y de la GPU, y no se documenta en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| Este checkpoint (pi0 stackcube mixed noise 70pct 40ep convex) | 3.501.372.176 | No disponible | VLA especializado en apilado de cubos | Apache-2.0 | HuggingFace, 0 descargas | No publicados |
| π₀ base (Physical Intelligence / OpenPI) | No disponible en la informacion proporcionada | No disponible | VLA generalista multi-robot | No disponible en la informacion proporcionada | Repositorio OpenPI y pesos publicos | No disponible en la informacion proporcionada |
| OpenVLA | No disponible en la informacion proporcionada | No disponible | VLA de proposito general | No disponible en la informacion proporcionada | Publico | No disponible en la informacion proporcionada |
| SmolVLA (LeRobot) | No disponible en la informacion proporcionada | No disponible | VLA compacto | No disponible en la informacion proporcionada | Publico en HuggingFace | No disponible en la informacion proporcionada |
| ACT (LeRobot) | No disponible en la informacion proporcionada | No disponible | Policy de imitacion (no VLA) | No disponible en la informacion proporcionada | Publico en HuggingFace | No disponible en la informacion proporcionada |

No se dispone de datos verificados de rendimiento para ninguno de los modelos de la tabla en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay tasas de exito, curvas de aprendizaje ni evaluaciones en robot real publicadas para este checkpoint.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 "likes", y la model card reutiliza la plantilla generica de π₀ sin documentar hiperparametros, semillas, composicion del dataset ni el significado del sufijo "convex".
- Dataset de terceros: el ajuste se realizo sobre `taewonkoo/stack_cube_mixed_noise_70pct_40ep`, cuyo contenido no se detalla en la informacion disponible; la calidad y la representatividad de las demostraciones son desconocidas.
- Ruido deliberado en los datos: el 70 % de ruido mixto en el nombre del dataset sugiere demostraciones degradadas, lo que puede traducirse en una precision inferior a la de una policy entrenada con datos limpios.
- Riesgo de sobreajuste: 40 epocas sobre una unica tarea (apilar cubos) apuntan a un modelo muy especializado, con capacidad de generalizacion incierta fuera de esa distribucion.
- Ambito funcional estrecho: no es un modelo de generacion de texto ni un asistente; no debe usarse para conversacion, codigo o matematicas.
- Idiomas: no hay informacion sobre los idiomas de las instrucciones de condicionamiento ni sobre su cobertura.
- Sesgos: no disponible; no se han publicado analisis de sesgo visual o de generalizacion entre objetos, iluminaciones o brazos roboticos.
- Licencia: el repositorio se publica como Apache-2.0, lo que en principio permite uso comercial, pero conviene verificar los terminos de los componentes del modelo base de π₀ (incluido el backbone de vision-lenguaje) antes de un despliegue comercial.
- Riesgo fisico: al tratarse de una policy de control, un fallo de inferencia puede provocar colisiones o danos en el robot o en el entorno; se recomienda validacion en simulacion y limites de par/velocidad en el controlador.
- Sin soporte de cuantizacion: no se ofrecen versiones GGUF, 4 bits o AWQ, lo que restringe el despliegue en hardware muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ImKyungjin/pi0-stackcube-mixed-noise-70pct-40ep-convex
- Dataset de ajuste fino: https://huggingface.co/datasets/taewonkoo/stack_cube_mixed_noise_70pct_40ep
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de policies en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
