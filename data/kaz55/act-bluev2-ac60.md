# Kaz55/act-bluev2-ac60

## Resumen

Kaz55/act-bluev2-ac60 es una politica de manipulacion robotica entrenada con ACT (Action Chunking Transformer) sobre la tarea "bluev2" del conjunto DG-5F + UR5e. No es un modelo de lenguaje: es un modelo de aprendizaje por imitacion que mapea observaciones multimodales (estado del robot e imagenes) a secuencias de acciones motoras. Lo publica el usuario Kaz55 dentro del ecosistema LeRobot de Hugging Face y su proposito declarado es servir como un punto de medida en un barrido de resolucion del sensor tactil GelSight.

El modelo tiene 51.668.634 parametros (~51,7 M) y ocupa 0,2 GB en el repositorio. Predice fragmentos de 60 acciones (chunk_size=60, n_action_steps=60) a partir de 26 dimensiones de estado del robot, dos camaras RealSense a 640x480 y dos sensores GelSight a 500x375 (resolucion nativa de esta variante). Se entreno durante 100.000 pasos (~7,9 epocas) con batch 8 y semilla 1000 sobre un dataset de 90 episodios y 101.406 fotogramas.

Su relevancia es acotada y experimental: forma parte de una ablacion que compara distintas resoluciones de GelSight manteniendo todo lo demas constante. El propio autor advierte que, en barridos anteriores, la perdida de entrenamiento apenas cambio entre resoluciones tactiles e incluso sin GelSight, por lo que estos resultados no deben interpretarse como evidencia sobre la utilidad del tacto. El modelo no tiene descargas ni likes y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con backbone visual y decodificacion de trozos de acciones |
| Parametros totales | 51.668.634 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en sentido linguistico; horizonte de prediccion de 60 acciones (chunk_size=60, n_action_steps=60) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, presumiblemente fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robotica, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Libreria | lerobot |
| Pipeline | robotics |
| Entradas | observation.state (26) + RealSense x2 (640x480) + GelSight x2 (500x375) |
| Dataset de entrenamiento | Kaz55/dg5f_ur5e_bluev2 (90 episodios / 101.406 fotogramas) |
| Entrenamiento | 100.000 pasos (~7,9 epocas), batch 8, semilla 1000 |
| Hardware objetivo | brazo UR5e con gripper DG-5F y dos sensores GelSight |
| Fecha de publicacion | 11 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de aprendizaje por imitacion que combina percepcion visual y estados propioceptivos en un transformer y genera acciones en bloques en lugar de paso a paso. Este checkpoint concreto usa chunk_size=60, es decir, predice 60 acciones conjuntas por inferencia, lo que reduce el error de acumulacion tipico de las politicas reactivas. La politica consume observation.state con 26 dimensiones mas cuatro flujos de imagen: dos camaras RealSense a 640x480 y dos sensores tactiles GelSight a 500x375 en su resolucion nativa.

El entrenamiento se realizo sobre el dataset Kaz55/dg5f_ur5e_bluev2, con 90 episodios y 101.406 fotogramas, durante 100.000 pasos (aproximadamente 7,9 epocas) con batch 8 y semilla 1000. Los canales observation.velocity y observation.effort existen en el dataset pero se excluyeron deliberadamente para que la derivacion automatica de caracteristicas no los inyectara en la politica y anadiera una segunda diferencia entre ejecuciones del barrido. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento supervisado, ni el numero total de tokens o composicion detallada del dataset mas alla del recuento de episodios y fotogramas.

## Capacidades

- Generacion de acciones motoras: produce trayectorias de 60 acciones por inferencia para el brazo UR5e con gripper DG-5F.
- Fusion visotactil: combina dos vistas RGB (RealSense 640x480) con dos lecturas tactiles (GelSight 500x375) y el estado propioceptivo de 26 dimensiones.
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset, sin capacidad de razonamiento simbolico ni planificacion explicita.
- Manipulacion guiada por tacto: disenada para tareas donde el contacto fisico importa (agarre, insercion, ajuste fino), aunque su aportacion real al rendimiento no esta demostrada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo de razonamiento (thinking), vision generativa ni audio.

## Casos de uso

- Despliegue de una politica visotactil en el banco DG-5F + UR5e: cargar el checkpoint en LeRobot y ejecutar la tarea bluev2 para reproducir el comportamiento demostrado, aprovechando que las entradas y el horizonte de acciones coinciden exactamente con el hardware de entrenamiento.
- Punto de referencia en un barrido de resolucion GelSight: este checkpoint representa la resolucion nativa (500x375) dentro de una serie en la que solo cambia ese parametro, lo que permite comparar variantes manteniendo constantes dataset, semilla e hiperparametros.
- Auditoria de la utilidad del tacto: usar sus resultados, junto con los de las variantes sin GelSight, para disenar experimentos que evaluen si la senal tactil aporta algo, dado que las perdidas de entrenamiento no lo reflejan.
- Comparacion de familias de politicas: enfrentar ACT frente a Diffusion Policy u otras arquitecturas sobre el mismo dataset y hardware para medir diferencias en exito de tarea y suavidad de trayectoria.
- Reproducibilidad de experimentos de robot learning: la semilla 1000, el numero de pasos y el batch estan documentados, lo que facilita repetir el entrenamiento y verificar la variabilidad entre ejecuciones.
- Formacion y prototipado en investigacion: servir como ejemplo docente de pipeline completo en LeRobot, desde la recogida de datos con sensores tactiles hasta el entrenamiento y la evaluacion en robot.
- Desarrollo de infraestructura de inferencia robotica: integrar la politica en un bucle de control de baja latencia y medir el coste real de ejecutar cuatro flujos de imagen mas un transformer de 51,7 M de parametros por paso de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la perdida de entrenamiento se mantuvo practicamente invariable en todas las resoluciones de GelSight de barridos anteriores, incluida la ausencia total de sensor tactil, y que esas perdidas deben tratarse como una comprobacion de sanidad y no como evidencia sobre la resolucion tactil. La evaluacion valida requiere experimentos en el robot, que no se reportan.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 0,2 GB; con las cuatro imagenes a resolucion nativa y batch 1, una estimacion razonable es de 1 a 3 GB de VRAM. Es una estimacion derivada del numero de parametros, no un dato publicado.
- GPU recomendadas para inferencia: cualquier GPU consumer moderna con 8 GB o mas es suficiente por capacidad de memoria (RTX 3060, RTX 4070, RTX 4090). La latencia dependera de la GPU, no del tamano del modelo.
- Cabe en GPU consumer: si, con margen amplio para inferencia. Para entrenamiento con batch 8 y cuatro flujos de imagen, una GPU de 24 GB (RTX 3090, RTX 4090, A5000) es un punto de partida habitual; A100 o H100 reducen el tiempo de las 100.000 iteraciones. No se documenta el hardware usado.
- Opciones de despliegue: LeRobot (scripts de entrenamiento y evaluacion de politicas) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tipo de politica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaz55/act-bluev2-ac60 | 51,7 M | 60 acciones por chunk | ACT (aprendizaje por imitacion, visotactil) | no disponible | Hugging Face, 0 descargas |
| ACT original (Zhao et al.) | no disponible en la informacion proporcionada | chunk de acciones | ACT (aprendizaje por imitacion) | licencia del proyecto original | repositorio publico de investigacion |
| Diffusion Policy (Chi et al.) | no disponible en la informacion proporcionada | horizonte de acciones configurable | difusion sobre acciones | licencia del proyecto original | repositorio publico de investigacion |
| SmolVLA (LeRobot) | cientos de millones (segun publicacion, no verificado aqui) | no disponible | VLA con backbone de lenguaje | licencia del proyecto | Hugging Face |

La comparacion directa con SmolVLA o pi0 es desigual: son modelos vision-language-action de proposito general con ordenes de magnitud mas de parametros, mientras que este checkpoint esta especializado en una unica tarea y hardware. Frente a otras implementaciones de ACT sobre LeRobot, la diferencia relevante es la inclusion de dos sensores GelSight como entrada.

## Limitaciones y advertencias

- Falta de evaluacion en robot: no hay resultados de exito de tarea ni comparaciones en el entorno fisico, solo perdidas de entrenamiento que el propio autor califica de comprobacion de sanidad.
- Evidencia no concluyente sobre el tacto: en barridos previos, la perdida no cambio entre resoluciones de GelSight ni al eliminar el sensor por completo, por lo que no puede afirmarse que este modelo aproveche la informacion tactil.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier despliegue productivo.
- Fuerte acoplamiento al hardware: entrenado para UR5e con gripper DG-5F, dos RealSense y dos GelSight a resoluciones concretas; no es transferible a otra configuracion sin reentrenamiento.
- Dataset limitado: 90 episodios y 101.406 fotogramas es un volumen pequeno, con riesgo de sobreajuste y de escasa cobertura de situaciones fuera de distribucion (aproximadamente 7,9 epocas sobre el mismo conjunto).
- Sin validacion comunitaria: cero descargas y cero likes, sin issues ni informes de terceros que confirmen el comportamiento del checkpoint.
- Sin benchmarks comparables: no se puede situar su rendimiento frente a alternativas en la misma tarea.
- Aplicabilidad linguistica nula: no genera texto ni comprende instrucciones; no procede evaluarlo en tareas de lenguaje, codigo o matematicas.
- Restricciones de seguridad fisica: al tratarse de una politica para un brazo real, cualquier despliegue exige limites de par, paradas de emergencia y validacion en entorno controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/act-bluev2-ac60
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_bluev2
- LeRobot (framework utilizado): https://github.com/huggingface/lerobot
- Paper de ACT, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware": https://arxiv.org/abs/2304.13705
- La busqueda web proporcionada no devolvio ningun resultado relevante para este modelo; los enlaces indexados correspondian a anuncios de automocion y se han descartado.
