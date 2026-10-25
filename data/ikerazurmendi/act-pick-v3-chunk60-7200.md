# IkerAzurmendi/act-pick-v3-chunk60-7200

## Resumen

`IkerAzurmendi/act-pick-v3-chunk60-7200` es un checkpoint de una politica de control robotico entrenada con ACT (Action Chunking with Transformers) sobre el brazo SO-101, dentro del ecosistema LeRobot. El modelo resuelve una unica tarea manipulativa: coger una pieza de una caja y sostenerla frente a la camara. No es un modelo de lenguaje ni un modelo generalista: es un controlador visomotor que recibe dos imagenes (camara frontal y camara de muneca) mas las seis posiciones articulares actuales, y devuelve un bloque de 60 consignas articulares futuras a 30 fps, es decir, un plan de 2 segundos.

El autor lo publica explicitamente "por completitud": pertenece a una tanda de 12.000 pasos cuyo mejor checkpoint es el de 4.800 pasos, no este. Comparte los mismos 331 episodios de entrenamiento que la tanda `act-pick-v3-1-2-pieces-18000`, pero con un horizonte de prediccion mas corto (60 objetivos en lugar de 90). Con 51.627.654 parametros y un repositorio de 0,2 GB, es un modelo pequeno, entrenable en una sola GPU de consumo y ejecutable en hardware de borde.

Su relevancia es doble: por un lado sirve como referencia reproducible de la receta de entrenamiento con `chunk=60`; por otro, los propios datos del autor muestran que la metrica offline (error articular medio absoluto) no distingue que checkpoint agarra mejor, y que ninguno de ellos se ha probado en el robot real. Es material de laboratorio y de comparacion, no un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), politica visomotora transformer con decodificacion de chunks de acciones |
| Parametros totales | 51.627.654 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje. Horizonte de prediccion de 60 objetivos articulares (2 s a 30 fps) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica: el modelo no procesa lenguaje natural |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Especificaciones adicionales aportadas por el autor: entradas de camara frontal, camara de muneca y seis posiciones articulares; 30 fps de frecuencia de control; 30 pasos de accion entre replanificaciones; checkpoint en el paso 7.200 de un entrenamiento de 12.000 pasos; tamano del repositorio 0,2 GB.

## Arquitectura y entrenamiento

ACT es una politica de imitacion que combina un codificador visual, un codificador de estado articular y un transformer encoder-decoder que predice un chunk de acciones futuras en lugar de una sola accion. En esta ficha concreta, el horizonte es de 60 consignas articulares para las seis articulaciones del SO-101, generadas a 30 fps; el lazo de control reejecuta 30 de esas acciones antes de volver a planificar. La prediccion de chunks es lo que reduce el error de compuesto y suaviza el control frente a politicas paso a paso. El modelo se entreno con la receta `train()` de LeRobot: batch de 8, `chunk=60`, 30 pasos de accion por replanificacion, aumento de imagen por defecto y semilla 1000.

Los datos son 331 episodios a 30 fps con uno o dos objetos, aplicando el mismo filtro de calidad que la tanda `act-pick-v3-1-2-pieces-18000`. El autor no detalla composicion por sesion ni numero total de frames o tokens de entrenamiento, por lo que ese dato queda como no disponible. Un hallazgo empirico relevante: todos los entrenamientos de esta ronda empeoran tras aproximadamente una pasada sobre los datos, lo que sugiere sobreajuste y explica que se publiquen checkpoints intermedios como este.

## Capacidades

- Generacion de trayectorias articulares: emite un chunk de 60 objetivos de las seis articulaciones a 30 fps a partir de dos vistas de camara y del estado articular actual.
- Percepcion visomotora con dos camaras: integra una vista frontal y una vista de muneca, lo que permite estimar la relacion entre la pinza y la pieza.
- Ejecucion de una tarea manipulativa concreta: coger una pieza de la caja y sostenerla frente a la camara, con uno o dos objetos en escena.
- Replanificacion periodica: el diseno de chunk permite reejecutar 30 acciones por cada inferencia, dando un bucle de control de aproximadamente 1 s entre replanificaciones.
- Tolerancia a variacion de escena limitada: el conjunto de datos mezcla episodios de una y dos piezas, lo que aporta cierta variedad de posiciones iniciales.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, dialogo multilingue, vision general, audio ni modo "thinking". Cualquier capacidad de ese tipo debe aportarse con un modelo externo en la arquitectura del sistema.

## Casos de uso

- Validacion en banco de la tarea "pick": cargar el checkpoint en un SO-101 real mediante el runtime de LeRobot y medir tasa de exito de agarre. Es el uso previsto, aunque el autor advierte que ningun checkpoint de la ronda se ha probado en el robot, por lo que esta validacion sigue pendiente.
- Baseline para ablaciones de horizonte: al ser el unico checkpoint publicado con `chunk=60`, sirve como referencia directa para estudiar el efecto de acortar el plan de 3 s a 2 s manteniendo el resto de la receta constante.
- Docencia y laboratorio con LeRobot: ejemplo completo y ligero (0,2 GB) de un pipeline de imitacion que va de la recoleccion de episodios al despliegue, apropiado para practicas con GPUs de consumo.
- Estudio de sobreajuste en politicas de imitacion: la tabla de checkpoints (2.400 a 12.000 pasos) permite analizar la curva de error offline y el punto en que el modelo deja de generalizar.
- Pruebas de integracion del lazo de control asincrono: con 30 acciones por replanificacion a 30 fps, es util para validar temporizaciones, buffers de observacion y sincronizacion de dos flujos de camara en el middleware del robot.
- Verificacion de filtros de calidad de datos: comparar este checkpoint (331 episodios, filtro laxo) con `act-pick-v3-strict-2400` (205 episodios, filtro estricto) permite cuantificar el impacto del filtrado en el error offline con el mismo horizonte de plan.
- Punto de partida para fine-tuning de la tarea: reentrenar desde estos pesos con episodios nuevos o con un solo objeto puede ahorrar pasos frente a entrenar desde cero, aunque el autor no documenta resultados de fine-tuning.

## Benchmarks y rendimiento

El autor solo publica una evaluacion offline sobre 16 episodios reservados (12 de `so101-pick-cube_20261024_181939`, un objeto, y 4 de `so101-pick-cube_20261024_144537`, dos objetos). La metrica es el error articular medio absoluto sobre el chunk predicho, en unidades del espacio de articulaciones no especificadas en la model card. Menor es mejor.

| Checkpoint de esta tanda | Error | Mejora sobre baseline "quedarse quieto" (16,23) |
|---|---|---|
| 2.400 pasos | 13,13 | 19% |
| 4.800 pasos (mejor de la tanda) | 11,94 | 26% |
| **7.200 pasos (este checkpoint)** | **12,16** | 25% |
| 9.600 pasos | 12,43 | 23% |
| 12.000 pasos | 13,04 | 20% |

Comparacion con el mejor checkpoint de cada tanda del mismo autor:

| Tanda | Episodios | Mejor checkpoint | Error | Mejora sobre baseline | Repositorio |
|---|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27% | act-pick-v3-6000 |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27% | act-pick-v3-strict-2400 |
| receta v3 sobre 1-2 piezas | 331 | 18k | 15,35 | 26% | act-pick-v3-1-2-pieces-18000 |
| v2 (anterior) | 278 | 6k | 15,36 | 26% | act-pick-v2-6000 |
| chunk 60 (baseline propio 16,23) | 331 | 4,8k | 11,94 | 26% | act-pick-v3-chunk60-4800 |
| solo una pieza | 292 | 9,6k | 15,47 | 25% | act-pick-v3-1piece-9600 |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% | act-pick-v3-recent-12000 |
| primera tanda | 165 | 6k | 16,87 | 19% | act-pick-* |

Advertencias del propio autor que conviene respetar: los errores de `chunk=60` no son comparables con los de los modelos de 90 pasos, porque el horizonte mira menos lejos en el futuro y por tanto el error bruto es menor por construccion; cada tanda usa su propia linea base. Los mejores checkpoints de las tandas principales estan dentro del ruido entre si, y el error offline no permite determinar que modelo agarra mejor. No hay resultados de tasa de exito, MMLU, HumanEval ni GSM8K: no aplican a este tipo de modelo y no se han publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 206 MB (51,6 M de parametros x 4 bytes), coherente con un repositorio de 0,2 GB. Sumando activaciones de dos flujos de camara y del transformer, el uso realista queda muy por debajo de 2 GB. No hay medicion publicada, por lo que la cifra exacta es no disponible.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria. Para entrenamiento con batch 8 y aumento de imagen, una RTX 3060/4060 de 8-12 GB es suficiente; el autor no especifica el hardware usado.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (GTX 1650, RTX 3050, RTX 4090) y en placas integradas tipo Jetson Orin Nano para despliegue en el propio robot.
- Ejecucion en CPU: tecnicamente viable por tamano, pero la latencia a 30 fps no esta documentada; es un riesgo abierto para control en tiempo real.
- Opciones de despliegue: el camino soportado es LeRobot (scripts de evaluacion y de control del robot de Hugging Face). vLLM, TGI, llama.cpp y Ollama no aplican porque no es un modelo de lenguaje. No se documenta exportacion a ONNX, TensorRT ni TorchScript.
- Latencia y throughput: no disponibles. El unico dato temporal cierto es que el modelo produce 60 objetivos a 30 fps y que se reejecutan 30 acciones por inferencia, lo que implica que la inferencia debe completarse en menos de 1 s para mantener el ritmo de control.

## Comparativa con modelos similares

Comparacion dentro de la misma familia ACT/SO-101 del mismo autor, que es el conjunto realmente comparable. Los recuentos de parametros de los demas checkpoints no se publican en la informacion disponible.

| Modelo | Parametros | Horizonte de plan | Mejor error offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-pick-v3-chunk60-7200 (este) | 51.627.654 | 60 objetivos (2 s) | 12,16 (paso 7.200) | apache-2.0 | publico en HF |
| act-pick-v3-chunk60-4800 | no disponible | 60 objetivos (2 s) | 11,94 | no disponible en la ficha consultada | publico en HF |
| act-pick-v3-1-2-pieces-18000 | no disponible | 90 objetivos (3 s) | 15,35 | no disponible en la ficha consultada | publico en HF |
| act-pick-v3-strict-2400 | no disponible | 90 objetivos (3 s) | 15,14 | no disponible en la ficha consultada | publico en HF |

Frente a alternativas fuera de esta familia (por ejemplo, politicas Diffusion Policy o VQ-BeT en LeRobot, o modelos tipo pi0/OpenVLA), no hay datos comparativos en la informacion proporcionada. Cualquier comparacion de rendimiento con ellas seria especulativa: no disponible.

## Limitaciones y advertencias

- No es el mejor checkpoint de su propia tanda: el autor indica que el mejor es el de 4.800 pasos (error 11,94 frente a 12,16). Se publica solo por completitud.
- Ningun checkpoint de esta ronda se ha probado en el robot real. La metrica offline no mide exito de agarre y el autor lo dice explicitamente; no hay evidencia de que esta politica funcione fisicamente.
- Tarea unica y cerrada: "coger una pieza de la caja y sostenerla frente a la camara". Fuera de esa distribucion no hay garantia alguna de comportamiento sensato.
- Un solo embodiment: esta entrenado para el SO-101 de seis articulaciones con una configuracion concreta de camara frontal y de muneca. Cambiar la camara, la cinematica o la pinza invalida el modelo.
- Error offline en unidades no especificadas: la model card no aclara si son grados, radianes o unidades normalizadas, lo que dificulta interpretar la magnitud real de 12,16.
- Sobreajuste documentado: todas las tandas empeoran tras aproximadamente una pasada sobre los datos (de 11,94 en 4.800 pasos a 13,04 en 12.000). Entrenamientos mas largos no mejoran.
- Comparaciones enganosas entre horizontes: el error de un modelo con `chunk=60` no es comparable con el de uno con `chunk=90`; el autor usa una linea base distinta (16,23 frente a las de las tandas de 90 pasos). No mezclar cifras entre tablas.
- Sesgos: no documentados por el autor. Al estar entrenado con 331 episodios de sesiones concretas, heredara los sesgos de posicion, iluminacion, tipo de pieza y estilo de teleoperacion de esas grabaciones; es esperable un rendimiento degradado ante objetos, colores o fondos no vistos, aunque no hay evaluacion publicada que lo cuantifique.
- Alucinacion en el sentido de lenguaje no aplica, pero si existe el riesgo analogo de trayectorias plausibles y fisicamente invalidas cuando la observacion se sale de la distribucion.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, sin restricciones adicionales documentadas. Verificar aun asi las condiciones de los datos de entrenamiento originales, que no se detallan.
- 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad ni reportes independientes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-7200
- Checkpoint mejor de la misma tanda: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Tanda con horizonte de 90 pasos y los mismos 331 episodios: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000
- Referencia de la arquitectura ACT (Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot

No se han encontrado otros enlaces (papers del autor, blogs, demos o repositorios propios) en la informacion disponible.
