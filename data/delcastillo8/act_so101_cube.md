# Delcastillo8/act_so101_cube

## Resumen

act_so101_cube es una politica de imitacion (imitation learning) entrenada con el metodo Action Chunking with Transformers (ACT) y publicada en HuggingFace Hub por el usuario Delcastillo8 mediante la libreria LeRobot. No es un modelo de lenguaje: es un controlador neuronal que traduce observaciones sensoriales de un brazo robotico SO-101 (estado de 6 grados de libertad y dos camaras RGB de 480x640) en comandos de accion de 6 dimensiones. Su tarea concreta es "Pick up the black cube and place it in the tray" ("coger el cubo negro y dejarlo en la bandeja").

El modelo tiene 51.668.614 parametros, un peso de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. Se entreno durante 20.000 pasos con batch de 8, optimizador AdamW y learning rate 1e-5 sobre un dataset propio de 50 episodios y 22.310 fotogramas grabados a 30 FPS con teleoperacion. La relevancia de esta ficha es doble: por un lado documenta un checkpoint concreto y reproducible; por otro sirve como ejemplo canonico del flujo completo de LeRobot (grabar datos, entrenar, desplegar en robot real) que hoy es el estandar de facto para robotica de bajo coste en codigo abierto.

Es importante encuadrar expectativas: el repositorio no incluye resultados de evaluacion en robot real, no declara cuantizaciones ni soporte multilingue, y su ambito de aplicacion esta limitado a una celda robotica muy concreta (mismo tipo de brazo, misma disposicion de camaras, misma tarea). No se han encontrado fuentes externas relevantes en la busqueda web realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de vision, encoder de estado y decodificador de acciones con componente CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica el concepto de contexto textual (la politica consume una observacion por paso: estado de 6 dimensiones mas dos imagenes de 3x480x640) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica; el modelo no procesa lenguaje natural. La tarea se fija en tiempo de entrenamiento como cadena de texto ("Pick up the black cube and place it in the tray") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras de entrada | `overhead` y `wrist` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entradas visuales | VISUAL, formas `(3, 480, 640)` por camara |
| Salida `action` | ACTION, forma `(6,)` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |
| Fecha de actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el paper arXiv:2304.13705 ("Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"), al que apunta la propia model card. Su rasgo diferencial es que no predice una accion por paso de control, sino un *chunk* de acciones futuras de una sola vez, lo que reduce el error de composicion acumulado tipico de las politicas paso a paso. La implementacion de LeRobot anade un esquema de tipo CVAE con una variable latente que captura la variabilidad de las demostraciones humanas, y emplea un backbone convolucional (ResNet) para extraer caracteristicas de cada camara; durante la inferencia se aplica *temporal ensembling* sobre chunks solapados para suavizar la trayectoria. La model card no detalla el numero de capas, dimensiones de embedding ni el tamano exacto de chunk, por lo que esos hiperparametros quedan como no disponibles.

El entrenamiento se realizo desde cero (no se declara ningun preentrenamiento ni fine-tuning previo) sobre el dataset `Delcastillo8/so101_cube_to_tray`: 50 episodios, 22.310 fotogramas a 30 FPS, una unica tarea de pick-and-place. La configuracion reportada es 20.000 pasos, batch size 8, AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. No se menciona uso de RLHF, DPO ni ninguna fase de optimizacion por preferencias, algo esperable en una politica robotica de imitacion. Tampoco se declara aumento de datos, *domain randomization* ni la composicion detallada de posiciones iniciales del cubo.

## Capacidades

- Control visomotor de un brazo SO-101: genera comandos de accion de 6 dimensiones a partir de estado articular y dos vistas de camara.
- Prediccion de chunks de acciones en lugar de pasos aislados, lo que produce movimientos mas suaves y coherentes en tareas de contacto.
- Aprendizaje por imitacion de una tarea manipulativa concreta: recoger un cubo negro y depositarlo en una bandeja.
- Uso de dos camaras simultaneas (vista cenital `overhead` y vista de muneca `wrist`) para resolver oclusiones parciales.
- Ejecucion autonoma en bucle cerrado durante un tiempo configurable con el CLI `lerobot-rollout`.
- Reentrenamiento y fine-tuning reproducibles mediante `lerobot-train`, partiendo del mismo dataset o de otro compatible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual, vision generativa, audio ni generacion de texto.
- No tiene capacidades multilingues porque no procesa lenguaje.

## Casos de uso

- Reproduccion de una demo completa de LeRobot: sirve como checkpoint de referencia para seguir el tutorial oficial de ACT (instalacion, calibracion de hardware, grabacion de datos con `lerobot-record` y despliegue con `lerobot-rollout`) sin necesidad de entrenar desde cero.
- Linea base en investigacion sobre imitacion: al ser un checkpoint publico con configuracion de entrenamiento documentada (20.000 pasos, AdamW, lr 1e-5), permite comparar variantes de ACT, cambios de backbone o estrategias de *temporal ensembling* bajo un mismo punto de partida.
- Punto de partida para fine-tuning en tareas relacionadas: si el cubo cambia de color, de posicion o de destino, se puede reentrenar con un dataset nuevo en la misma celda y comparar la tasa de exito frente a este checkpoint base.
- Validacion de montaje fisico y calibracion: ejecutar la politica sobre un SO-101 real sirve para verificar que los nombres de camara (`overhead`, `wrist`), las resoluciones (640x480 a 30 FPS) y los indices de dispositivo estan correctamente configurados antes de invertir tiempo en recoger datos.
- Pruebas de rendimiento de hardware de inferencia: con 51,7 millones de parametros es un banco de pruebas ligero para medir latencia de bucle cerrado y throughput a 30 FPS en distintas GPU y en CPU.
- Integracion en un banco de evaluacion automatizado: ejecutando `lerobot-rollout` con `--duration` fijo y varios ensayos por configuracion (posiciones iniciales, iluminacion, distractores) se puede construir la tabla de tasa de exito que la model card deja pendiente.
- Material docente para cursos de robotica: ilustra de forma compacta el ciclo teleoperacion, dataset, entrenamiento y despliegue sin requerir hardware de gama alta.
- Recoleccion de datos asistida: usar el checkpoint para preposicionar el brazo antes de una demostracion humana, reduciendo el tiempo por episodio en campañas de recogida de datos.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible."

La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", y la seccion de evaluacion aparece como plantilla vacia (tabla de tarea, ensayos, exitos y tasa de exito sin rellenar). No hay datos de MMLU, HumanEval, GSM8K ni de tasa de exito en robot real, y no procede extrapolarlos desde otros checkpoints de ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 solo para los pesos (51,7 millones de parametros) y en torno a 0,1 GB en fp16; a ello hay que sumar activaciones y buffers de las dos imagenes de 3x480x640. Es una estimacion derivada del recuento de parametros, no un dato declarado por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la practica. Una RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente; el modelo no aprovechara la capacidad de un acelerador de gama alta.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida. Tambien es viable la inferencia en CPU, aunque la latencia puede comprometer el control a 30 FPS.
- El cuello de botella real no es el modelo sino el pipeline de captura de dos camaras a 640x480 y 30 FPS, la latencia del bus del robot y la sincronizacion entre observacion y accion.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) es el camino oficial documentado en la model card, con `--policy.path=Delcastillo8/act_so101_cube` y `--policy.device=cuda`. El entrenamiento se realiza con `lerobot-train`. vLLM, TGI, llama.cpp y Ollama no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card no reporta frecuencias de inferencia ni tiempos por chunk.

## Comparativa con modelos similares

Tabla comparativa con alternativas del mismo ecosistema LeRobot y de la misma categoria (politicas de imitacion para manipulacion). Los datos de los modelos alternativos no aparecen en la informacion proporcionada, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delcastillo8/act_so101_cube (ACT) | 51.668.614 | Estado (6,) + 2 imagenes 480x640 | Pick-and-place de un cubo negro en bandeja sobre SO-101 | Apache 2.0 | HuggingFace Hub, pesos safetensors, 0 descargas |
| ACT generico de LeRobot | no disponible | no disponible | Configurable por dataset | Apache 2.0 (segun LeRobot) | Repositorio de LeRobot |
| Diffusion Policy en LeRobot | no disponible | no disponible | Politicas visomotoras por difusion | no disponible | Repositorio de LeRobot |
| Modelos VLA tipo SmolVLA / pi0 en LeRobot | no disponible | no disponible | Manipulacion condicionada por lenguaje | no disponible | Repositorio de LeRobot |

Diferencias cualitativas relevantes: este checkpoint es monoespecifico (un unico brazo, dos camaras con nombre fijo y una sola tarea), mientras que los metodos VLA integrados en LeRobot aceptan instrucciones en lenguaje natural y generalizan a varias tareas. A cambio, ACT es mucho mas ligero de entrenar y de ejecutar, y no requiere un backbone de lenguaje. No se dispone de datos numericos comparativos de tasa de exito entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluacion: se desconoce la tasa de exito real en robot fisico. La model card deja la tabla de evaluacion sin rellenar.
- Especializacion extrema: el modelo solo ha visto una tarea ("Pick up the black cube and place it in the tray") sobre un unico tipo de robot (`so_follower`) y una unica configuracion de camaras (`overhead`, `wrist`). Cambiar la tarea, el objeto, la posicion de las camaras o el robot invalida el checkpoint.
- Sensibilidad al montaje: los nombres de camara, la resolucion (640x480), la tasa (30 FPS) y la calibracion del brazo deben coincidir con los del entrenamiento; cualquier desviacion degrada el comportamiento.
- Sobreajuste probable por tamano de dataset: 50 episodios y 22.310 fotogramas son un volumen reducido. Es esperable poca robustez ante cambios de iluminacion, fondos distintos, objetos con otra forma o color, o posiciones iniciales fuera de la distribucion de las demostraciones.
- Sesgos de la demostracion humana: la politica reproduce las estrategias y los sesgos de la persona que teleopero los 50 episodios, incluidas posibles trayectorias suboptimas o aproximaciones laterales concretas.
- Riesgo de fallo fisico: al ser un controlador de robot real, un fallo de la politica puede provocar colisiones, caidas del objeto o dano al brazo o al entorno. Es imprescindible operar con espacio de trabajo despejado, limites de par y un boton de parada de emergencia accesible.
- Sin modo de razonamiento ni de abstrACCion: no interpreta lenguaje, no planifica y no puede explicar sus decisiones. La cadena `--task` es meramente informativa en el CLI de rollout.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y el archivo NOTICE cuando corresponda. No se declaran restricciones adicionales, pero el autor tampoco ofrece garantias ni soporte.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y 0,2 GB de peso. No hay comunidad que haya validado el checkpoint.
- Idiomas: no aplica, pero conviene senalar que la instruccion de tarea esta en ingles y que no existe version en castellano ni adaptacion a otros idiomas.
- La busqueda web realizada no devolvio ninguna fuente tecnica util: los resultados obtenidos eran contenido no relacionado con el modelo y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Delcastillo8/act_so101_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/Delcastillo8/so101_cube_to_tray
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=Delcastillo8/so101_cube_to_tray
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
