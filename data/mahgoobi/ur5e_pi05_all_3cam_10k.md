# mahgoobi/ur5e_pi05_all_3cam_10k

## Resumen

`mahgoobi/ur5e_pi05_all_3cam_10k` es un checkpoint de politica robotica de tipo VLA (vision-language-action) obtenido al afinar π₀.₅ sobre 1.080 grabaciones reales de un brazo UR5e. No es un modelo de lenguaje: recibe tres imagenes de 224×224, un vector de estado de 7 dimensiones y una cadena de tarea en lenguaje natural, y emite un bloque de 50 acciones de 7 dimensiones cada una a 20 Hz (2,5 segundos de movimiento por inferencia). El autor lo publica como el guardado intermedio del paso 10.000 de una ejecucion de 20.000 pasos, cuyo checkpoint final esta en `ur5e_pi05_all_3cam_20k`.

El entrenamiento parte de `pi05_base` (warm start) y se ejecuta con la herramienta RoboResearch (config `pi05_ur5e_all`) sobre la base de codigo de openpi. El conjunto de datos `ur5e_all` contiene 1.200 episodios y 373.427 fotogramas repartidos en seis tareas de sobremesa, cinco subconjuntos y 20 fps, con un brazo UR5e de seis articulaciones y pinza Robotiq. La particion es por episodio (1.080 de entrenamiento / 120 reservados, uno de cada diez), no por fotograma, y las estadisticas de normalizacion se calcularon solo sobre los 1.080 episodios de entrenamiento.

Su relevancia es doble. Por un lado, documenta con detalle inusual una receta de ajuste fino de π₀.₅ sobre hardware real, incluidos los detalles de la accion (delta en las seis articulaciones, absoluta en la pinza), la sintesis de acciones a partir de los estados y el efecto de incluir los niveles de desorden `d1`–`d4` en el entrenamiento. Por otro, hace explicito un resultado negativo util: la curva de `action_mse` sobre el conjunto reservado se aplana hacia el paso 4.000 mientras la de entrenamiento sigue bajando, de modo que los pasos adicionales compran ajuste, no generalizacion. La licencia es Apache 2.0 y el repositorio usa la libreria LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (flow matching) con backbone `gemma_2b`; politica VLA con experto de accion |
| Parametros totales | no disponible (la model card solo indica `gemma_2b` como backbone) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; el prompt de tarea se tokeniza a 200 tokens y el horizonte de accion es de 50 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles para los seis prompts de tarea documentados; no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio distribuido para la libreria LeRobot) |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Entradas de imagen | 3 ranuras a 224×224: `base_0_rgb` (`observation.images.base`), `left_wrist_0_rgb` (`observation.images.wrist`), `right_wrist_0_rgb` (`observation.images.side`) |
| Preprocesado de imagen | `resize_with_pad` de openpi: encaja 320×240 en 224×224 y rellena el resto |
| Vector de estado | 7 dimensiones: seis angulos de articulacion en radianes y pinza normalizada a `[0, 1]` |
| Salida | Bloque de 50 pasos de accion, 7 dimensiones por paso, a 20 Hz (2,5 s de movimiento por inferencia) |
| `action_dim` interno | 32 (la transformacion de salida recorta a 7) |
| Espacio de accion | Seis articulaciones en delta respecto al estado actual; pinza absoluta (`make_bool_mask(6, -1)`) |
| Tareas | 6, distinguidas solo por el prompt de lenguaje |
| Hardware de entrenamiento | 3 × H200; la ejecucion completa de 20.000 pasos tardo 23 h 25 min |

## Arquitectura y entrenamiento

El modelo es un π₀.₅ de flow matching con backbone `gemma_2b`, `action_dim` 32 y `action_horizon` 50. Se inicializa desde `pi05_base` (`gs://openpi-assets/checkpoints/pi05_base/params`) y se afina con RoboResearch sobre openpi. El entrenamiento usa lote 144 y una decaimiento coseno del learning rate programado sobre los 20.000 pasos completos: en el paso 10.000 el LR era 1,47e-5, frente a un pico de 2,5e-5 y un suelo de 2,5e-6. Esto implica que este checkpoint no equivale a una ejecucion configurada para detenerse en 10.000 pasos, que ya habria alcanzado el suelo. En total se completaron 4,3 pasadas sobre 336.000 fotogramas de entrenamiento.

Los datos proceden de `ur5e_all`: 1.200 episodios, 373.427 fotogramas, 6 tareas, 5 subconjuntos, 20 fps, robot `ur5e_robotiq`. La particion es por episodio (1.080 / 120, reservando uno de cada diez), lo que evita evaluar sobre fotogramas casi identicos de un episodio ya visto, y `norm_stats` se calculo exclusivamente sobre los 1.080 episodios de entrenamiento. Tres particularidades del pipeline merecen atencion: la articulacion `j4` esta practicamente congelada (menos de 0,0025 rad de recorrido) en cinco de las seis tareas, mientras que en `put_bowl_on_rack` es bimodal, con los episodios `clean` en `j4` 1,5750 y los de desorden en 4,7160 (π de diferencia, la rama de muneca reflejada); las acciones fueron sintetizadas, no grabadas, definiendo la accion de cada paso como el estado del paso siguiente mediante `scripts/convert_ur5e.py`, de modo que la politica reproduce la siguiente pose del propio brazo y no un setpoint comandado; y los niveles de desorden `d1`–`d4`, que eran el conjunto de generalizacion reservado de `ur5e_pi05_10k`, aqui forman parte del entrenamiento.

## Capacidades

- Generacion de acciones de control para un UR5e de seis articulaciones con pinza Robotiq, en bloques de 50 pasos a 20 Hz (2,5 s de movimiento por inferencia).
- Ejecucion de seis tareas de sobremesa distinguidas unicamente por el prompt de lenguaje: `place the three cups in the bowls`, `put the book in the box`, `put the bowl on the rack`, `put the cup in the bowl`, `put the mug on the coaster` y `stack the two cubes`.
- Fusion de tres vistas: camara de escena, camara de muneca y segunda vista de escena desde la base del robot (`use_side_camera`), las tres alimentadas realmente y no rellenadas con ceros.
- Tarea larga multiobjetivo: `place the three cups in the bowls` encadena tres pick-and-place, con episodios de 710 fotogramas de media frente a unos 235 en el resto.
- Robustez a desorden: los cuatro niveles de desorden `d1`–`d4` estan dentro del entrenamiento, no solo en evaluacion.
- Control en espacio mixto: deltas en las seis articulaciones y valor absoluto en la pinza, el mismo espacio en el que se preentreno `pi05_base`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multietapa simbolico, vision general (captioning, VQA), audio ni modo de pensamiento.

## Casos de uso

- Manipulacion de sobremesa con brazo UR5e: desplegar el modelo como politica de pick-and-place en un puesto de trabajo real donde las seis tareas documentadas cubren el repertorio necesario, aprovechando que el control se emite en bloques de 50 pasos a 20 Hz para suavizar la ejecucion.
- Recogida y colocacion encadenada de varios objetos: la tarea `place the three cups in the bowls` esta entrenada explicitamente sobre episodios de 710 fotogramas que encadenan tres pick-and-place, por lo que el modelo mantiene coherencia a lo largo de una secuencia larga dentro de una misma inferencia encadenada.
- Escenarios con oclusion: la combinacion de camara de escena, camara de muneca y segunda vista desde la base permite al modelo resolver agarres cuando la pinza queda oculta desde una unica perspectiva.
- Manipulacion en entornos desordenados: al haber entrenado con los niveles `d1`–`d4`, el modelo es adecuado para celdas donde la posicion de los objetos varia y no se garantiza una escena limpia.
- Linea base reproducible para investigacion en VLA: sirve como punto de referencia intermedio (paso 10.000) frente al checkpoint final de 20.000 pasos para estudiar el compromiso entre ajuste y generalizacion en politicas π₀.₅.
- Evaluacion de arquitecturas de tres camaras: al estar entrenado con la tercera ranura realmente alimentada, permite medir de forma controlada el efecto de `use_side_camera` frente a versiones anteriores de dos camaras como `ur5e_pi05_10k`.
- Reentrenamiento y ajuste sobre nueva celda robotica: al estar bajo Apache 2.0 y sobre openpi/RoboResearch, puede reutilizarse como inicializacion para un UR5e con otra disposicion de tareas.
- Analisis de ramas cinematicas redundantes: el caso bimodal de `j4` en `put_bowl_on_rack` lo convierte en un banco de pruebas para estudiar si una politica aprende ambas ramas de la muneca para un mismo prompt.

## Benchmarks y rendimiento

La model card no publica MMLU, HumanEval ni GSM8K, que no aplican a una politica robotica. La metrica principal es `action_mse`, calculada en unidades de accion crudas y con la normalizacion deshecha, lo que la hace comparable entre politicas.

| Metrica | Paso 0 | Paso 10.000 | Factor |
|---|---|---|---|
| `action_mse` en conjunto reservado | 0,069912 | 0,001858 | 38× |
| `action_mse` en entrenamiento | 0,069258 | 0,000279 | 248× |
| Perdida de flow matching | 0,0382 | 0,0009 | 41× |

| Checkpoint guardado | `action_mse` reservado |
|---|---|
| Paso 5.000 | 0,001994 |
| Paso 10.000 | 0,001858 |
| Paso 15.000 | 0,001713 |
| Paso 19.999 | 0,001752 |

La curva reservada se aplana pronto: la ventana de los pasos 2.000–4.000 promedia 0,00196 y todas las ventanas de 2.000 pasos posteriores quedan entre 0,00169 y 0,00183, con el 90 % de las lecturas a partir del paso 2.000 entre 0,0015 y 0,0021. La lectura individual mas baja fue 0,001365 en el paso 4.500. El autor senala que las diferencias entre los cuatro checkpoints guardados caen dentro del ruido de una estimacion de cuatro lotes. La brecha entre entrenamiento y validacion es real y se explica en la model card original (texto truncado en la informacion disponible).

## Requisitos de hardware

- Entrenamiento: la ejecucion completa de 20.000 pasos se hizo sobre 3 × H200 y tardo 23 h 25 min; este checkpoint corresponde a la mitad de esa ejecucion.
- VRAM de inferencia: no disponible en la informacion proporcionada. Como orientacion no verificada, el backbone declarado es `gemma_2b`, de modo que los pesos en precision de 16 bits ocuparian del orden de unos pocos gigabytes y el modelo deberia caber en GPU de consumo de gama alta con 24 GB, si bien la model card no publica cifras de VRAM ni de precision de despliegue.
- GPU recomendadas: no disponible. Para reentrenamiento o ajuste fino, la referencia documentada es H200. Para inferencia, cualquier GPU con memoria suficiente para el backbone Gemma 2B mas las tres imagenes de 224×224 y el estado.
- GPU de consumo: no se documenta confirmacion. Por tamano de backbone, una GPU de 24 GB deberia ser suficiente en teoria, pero no hay dato publicado que lo confirme.
- Opciones de despliegue: la libreria declarada es LeRobot y el pipeline es `robotics`; el entrenamiento se realizo sobre openpi con RoboResearch. Los runners genericos de LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a una politica VLA con experto de accion; el despliegue requiere la pila de inferencia de LeRobot/openpi.
- Latencia y throughput: no se publican cifras de latencia ni de rendimiento por segundo. El dato util es la cadencia de control: 50 pasos de accion a 20 Hz por inferencia, es decir, 2,5 segundos de movimiento por llamada.

## Comparativa con modelos similares

| Modelo | Datos de entrenamiento | Camaras | Tareas | Espacio de accion | Licencia |
|---|---|---|---|---|---|
| `ur5e_pi05_all_3cam_10k` (este) | 1.080 episodios de entrenamiento, 373.427 fotogramas, 6 tareas, 5 subconjuntos, incluye `d1`–`d4` | 3 | 6 | Deltas en 6 articulaciones, pinza absoluta | Apache 2.0 |
| `ur5e_pi05_all_3cam_20k` | Misma receta, ejecucion completa de 20.000 pasos | 3 | 6 | Deltas en 6 articulaciones, pinza absoluta | Apache 2.0 |
| `ur5e_pi05_10k` | Version anterior: 2 camaras, 5 tareas, solo `clean` | 2 | 5 | Igual, heredado de `pi05_base` | Apache 2.0 |
| `pi05_base` | Checkpoint base de π₀.₅ usado como warm start | No aplica | No aplica | Espacio de preentrenamiento de π₀.₅ | No indicada en la informacion disponible |

Frente al checkpoint final de 20.000 pasos, la diferencia de `action_mse` reservado es de 0,001858 frente a 0,001752, dentro del ruido declarado por el autor. Frente a `ur5e_pi05_10k`, la diferencia relevante no es solo de pasos sino de configuracion: tres camaras alimentadas en lugar de dos, seis tareas en lugar de cinco y niveles de desorden dentro del entrenamiento en lugar de reservados.

## Limitaciones y advertencias

- Sesgos de datos: los seis prompts estan en ingles y el modelo solo se ha entrenado sobre seis cadenas de tarea concretas; no se documenta comportamiento fuera de ese repertorio ni en otros idiomas.
- Riesgo de alucinacion en sentido estricto no aplica, pero si el fallo silencioso: la politica puede generar trayectorias plausibles que no correspondan a la tarea, y el `action_mse` reservado de 0,001858 no garantiza exito fisico en el mundo real.
- Articulacion congelada: en cinco de las seis tareas `j4` se mueve menos de 0,0025 rad, por lo que el modelo no ha aprendido a explotar esa articulacion en esos contextos.
- Ambiguedad bimodal: en `put_bowl_on_rack` el mismo prompt admite dos configuraciones de muneca separadas π radianes (1,5750 en `clean` y 4,7160 en desorden); el modelo puede elegir cualquiera de las dos ramas, con el riesgo de trayectorias innecesariamente largas o de colision que ello implica.
- Acciones sinteticas: las acciones no se grabaron, se definieron como el estado del paso siguiente. La politica aprende a reproducir la siguiente pose del propio brazo segun un plan de waypoints scriptado, no un setpoint comandado, lo que limita su interpretacion como controlador de par o de velocidad.
- Ajuste excesivo tardio: la curva reservada se aplana cerca del paso 4.000 mientras la de entrenamiento sigue bajando; los pasos posteriores aportan ajuste y no generalizacion, y las diferencias entre checkpoints guardados estan dentro del ruido.
- Sin datos de generalizacion fuera de distribucion: los niveles `d1`–`d4` estan dentro del entrenamiento, por lo que no queda conjunto reservado de desorden conocido para medir esa generalizacion.
- Sin datos de cuantizacion: no se documentan formatos cuantizados, precision de despliegue ni requisitos de VRAM, lo que complica planificar un despliegue en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo depende de `pi05_base` y de openpi; conviene verificar las condiciones de esos artefactos antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- [Modelo en HuggingFace: mahgoobi/ur5e_pi05_all_3cam_10k](https://huggingface.co/mahgoobi/ur5e_pi05_all_3cam_10k)
- [Checkpoint final de la ejecucion: mahgoobi/ur5e_pi05_all_3cam_20k](https://huggingface.co/mahgoobi/ur5e_pi05_all_3cam_20k)
- [Checkpoint anterior: mahgoobi/ur5e_pi05_10k](https://huggingface.co/mahgoobi/ur5e_pi05_10k)
- [Repositorio de entrenamiento RoboResearch (config `pi05_ur5e_all`)](https://github.com/EAI-RSM/RoboResearch)
- [Base de codigo openpi](https://github.com/wensi-ai/openpi)

La busqueda web realizada no aporto enlaces adicionales relevantes sobre este modelo.
