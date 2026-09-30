# K-vr/cube_stack3_Pi05_abs_batch8

## Resumen

`K-vr/cube_stack3_Pi05_abs_batch8` es un policy de robotica basado en π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y adaptado a la libreria LeRobot de Hugging Face. Se trata de un fine-tune del checkpoint base `lerobot/pi05_base` sobre el dataset `K-vr/cube_stack3`, orientado a una unica tarea de manipulacion bimanual: apilar tres cubos de distinto tamano en orden decreciente.

El modelo resuelve el problema de generar acciones de control motor a partir de observaciones visuales y de estado proprioceptivo. Recibe tres imagenes RGB de 224x224 (camara base, muneca izquierda y muneca derecha), un vector de estado de 32 dimensiones y produce un vector de accion de 14 dimensiones, correspondiente a un robot bimanual de 7 grados de libertad por brazo (`bi_so_follower_7dof`). Cuenta con aproximadamente 4.143 millones de parametros y se distribuye en formato safetensors bajo licencia Apache 2.0.

Su relevancia es acotada y practica: sirve como ejemplo reproducible de entrenamiento de un policy VLA con LeRobot 0.6.1, con configuracion documentada (20.000 pasos, batch 8, learning rate 2.5e-05, representacion de accion absoluta) y como punto de partida para fine-tuning sobre nuevas tareas de apilado. No incluye resultados de evaluacion en robot real y tiene un numero muy bajo de descargas (17) y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementacion LeRobot adaptada del repositorio OpenPI. Detalle del backbone no especificado en la informacion disponible |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tareas del dataset estan redactadas en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos adicionales de entrada y salida:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.images.base_0_rgb` | Visual | `(3, 224, 224)` |
| `observation.images.left_wrist_0_rgb` | Visual | `(3, 224, 224)` |
| `observation.images.right_wrist_0_rgb` | Visual | `(3, 224, 224)` |
| `observation.state` | Estado | `(32,)` |
| `action` | Accion | `(14,)` |

## Arquitectura y entrenamiento

La model card indica que π₀.₅ es un modelo Vision-Language-Action de Physical Intelligence disenado para generalizacion en entornos abiertos, y que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion concreta incluida en este repositorio procede del repositorio OpenPI de Physical Intelligence y ha sido adaptada a LeRobot. La informacion proporcionada no detalla el numero de tokens de entrenamiento del modelo base, la composicion del dataset multimodal ni si hubo fases de RLHF o DPO; por tanto, esos datos se consideran no disponibles.

El fine-tune se realizo exclusivamente sobre el dataset `K-vr/cube_stack3`, compuesto por 120 episodios y 66.920 fotogramas grabados a 30 FPS, con dos variantes de instruccion de tarea: apilar los tres cubos con el cubo de 40 mm abajo, el de 30 mm en medio y el de 20 mm arriba, o equivalentemente ordenar de mayor a menor. La configuracion de entrenamiento documentada es la siguiente: 20.000 pasos, batch size 8, representacion de accion absoluta (sin chunking relativo), sin ponderacion de muestras, sin aumento de imagenes, optimizador AdamW, learning rate 2.5e-05, semilla 1000 y LeRobot 0.6.1. El robot objetivo es un `bi_so_follower_7dof` con camaras `left_cam_left`, `left_cam_scene`, `right_cam_right` y `right_cam_scene_realsense`.

## Capacidades

- Generacion de acciones motoras de 14 dimensiones para un robot bimanual de 7 grados de libertad por brazo.
- Percepcion visual multi-camara: procesa tres imagenes RGB simultaneas (vista base y dos vistas de muneca) a 224x224.
- Fusion de vision y estado proprioceptivo: combina las observaciones visuales con un vector de estado de 32 dimensiones.
- Ejecucion de una tarea de manipulacion especifica: apilado ordenado de tres cubos por tamano (40 mm, 30 mm y 20 mm).
- Seguimiento de instrucciones de tarea en lenguaje natural, segun las dos frases documentadas en el dataset.
- Inferencia en tiempo real a 30 FPS, segun la frecuencia de captura del dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible (el modelo emite acciones, no texto conversacional).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision adicional, audio): no disponible, salvo la percepcion visual descrita.

## Casos de uso

- Apilado de cubos en laboratorio de robotica: el policy ejecuta directamente la tarea de apilar tres cubos en orden de tamano decreciente sobre un robot bimanual SO-100/SO-101, usando como entrada las tres camaras configuradas y el estado de 32 dimensiones.
- Reproduccion de experimentos de imitation learning: dado que la configuracion de entrenamiento esta completamente documentada (20.000 pasos, batch 8, lr 2.5e-05, semilla 1000), sirve para replicar resultados y comparar variantes de hiperparametros.
- Fine-tuning sobre nuevas tareas de apilado: partiendo de `lerobot/pi05_base` y de este checkpoint, se puede reentrenar con datasets propios de apilado cambiando el numero de objetos, tamanos o disposicion inicial.
- Evaluacion comparativa de representaciones de accion: al usar representacion absoluta, permite compararla con variantes de accion relativa o con chunking en el mismo banco de pruebas y mismo robot.
- Generacion de datos de demostracion: el policy puede emplearse con `--strategy.type=base` para ejecutar rollouts que ayuden a inspeccionar el comportamiento antes de grabar episodios adicionales.
- Docencia y demostraciones de VLA: por su tamano contenido (aproximadamente 4,14 mil millones de parametros) y su licencia Apache 2.0, es adecuado para talleres y cursos que ilustren el flujo completo de LeRobot, desde la grabacion de datos hasta el despliegue.
- Pruebas de integracion de hardware: la configuracion de camaras y robot documentada facilita validar cableado, calibracion y sincronizacion a 30 FPS en un montaje bimanual de 7 DOF.
- Investigacion en generalizacion de posiciones: con 120 episodios sobre una tarea estrecha, sirve como linea base para medir cuanto degrada el rendimiento ante cambios de iluminacion, posicion inicial o distractores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la indicacion explicita de que no se han proporcionado resultados de evaluacion para este policy. No procede, por tanto, presentar cifras de exito, tasas de exito por tarea ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia segun precision, para 4.143.404.816 parametros: FP32 en torno a 16,6 GB; BF16 o FP16 en torno a 8,3 GB; INT8 en torno a 4,1 GB; INT4 en torno a 2,1 GB. Estas cifras corresponden unicamente a los pesos y no incluyen activaciones, buffers de vision ni overhead del runtime.
- El tamano del repositorio es de 9,4 GB, coherente con el almacenamiento de checkpoints en precision de 16 o 32 bits.
- GPU recomendadas para inferencia: una GPU consumer con 16 GB o mas de VRAM deberia ser suficiente para BF16; una RTX 4090 (24 GB) permite margen comodo. Para FP32 se recomienda una A100 (40/80 GB) o H100.
- Cabe en GPU consumer: si, con cuantizacion o en BF16 en tarjetas de gama alta (RTX 4090, RTX 3090, y en general modelos con 16-24 GB de VRAM). En tarjetas de 8-12 GB requeriria cuantizacion, cuyos formatos no estan documentados para este repositorio.
- Opciones de despliegue: la via documentada es LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=K-vr/cube_stack3_Pi05_abs_batch8`. El entrenamiento se realiza con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; son runtimes orientados a modelos de lenguaje y no al bucle de control de un policy robotico.
- Latencia y throughput: no se proporcionan mediciones. El unico dato indirecto es que el dataset de entrenamiento se grabo a 30 FPS, lo que sugiere que el sistema de captura opera a esa frecuencia, pero no implica que la inferencia del modelo alcance ese ritmo en cualquier hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `K-vr/cube_stack3_Pi05_abs_batch8` | 4.143.404.816 | no disponible | sin resultados de evaluacion publicados | Apache 2.0 | Hugging Face, 17 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | no disponible | no disponible | repositorio OpenPI |

La informacion proporcionada no incluye especificaciones comparables de parametros, contexto, rendimiento ni licencia para `lerobot/pi05_base` ni para π₀, por lo que la comparacion numerica no es posible. Cualquier otro modelo VLA de robotica (por ejemplo alternativas de imitacion bimanual) queda fuera de los datos disponibles y se marca como no disponible.

## Limitaciones y advertencias

- El modelo esta entrenado para una unica tarea y un unico montaje de robot; no es un modelo de proposito general y su uso fuera de la tarea de apilado de cubos no esta validado.
- No se han publicado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito, la robustez ante variaciones de posicion, iluminacion o distractores.
- Sesgos conocidos: no disponibles. No obstante, al entrenarse sobre 120 episodios de un mismo entorno, cabe esperar un fuerte sesgo hacia las condiciones de captura del dataset `K-vr/cube_stack3`.
- Riesgo de alucinacion: en el sentido de generar acciones plausibles pero incorrectas cuando la escena difiere de la distribucion de entrenamiento. No hay datos de robustez publicados.
- Limitaciones de idioma: las instrucciones de tarea documentadas estan en ingles; no hay evidencia de soporte para instrucciones en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de `lerobot/pi05_base`, cuyos terminos no se detallan en la informacion proporcionada; conviene verificar la licencia de la cadena de dependencias antes de un uso comercial.
- Requisitos de coincidencia de observaciones: los nombres y el orden de las camaras deben coincidir exactamente con las claves de observacion usadas en el entrenamiento (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`), asi como el robot `bi_so_follower_7dof`; un desajuste invalida la inferencia.
- Representacion de accion absoluta: el modelo emite acciones absolutas, no incrementales, lo que implica que el espacio de estados debe estar normalizado y calibrado de la misma forma que durante el entrenamiento.
- Version de LeRobot: el entrenamiento se realizo con la version 0.6.1; ejecutar el policy con versiones muy distintas puede introducir incompatibilidades.
- Datos de contexto, cuantizacion e idiomas no disponibles: no deben asumirse capacidades no documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-vr/cube_stack3_Pi05_abs_batch8
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/K-vr/cube_stack3
- Visualizador de dataset de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=K-vr/cube_stack3
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
