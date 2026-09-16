# mahgoobi/ur5e_pi05_all_3cam_15k

## Resumen

`mahgoobi/ur5e_pi05_all_3cam_15k` es un checkpoint de política visión-lenguaje-acción (VLA) obtenido por ajuste fino de π₀.₅ sobre 1.080 grabaciones reales de un brazo UR5e con pinza Robotiq. Lo publica el usuario mahgoobi dentro del ecosistema LeRobot y openpi, y corresponde a la iteración 15.000 de una ejecución de 20.000 pasos cuya versión final se distribuye como `ur5e_pi05_all_3cam_20k`. No es, por tanto, un entrenamiento más corto: el autor insiste en que el decaimiento coseno del ritmo de aprendizaje está calibrado sobre las 20.000 iteraciones completas, de modo que en el paso 15.000 el valor era 6,13e-6 frente a un máximo de 2,5e-5 y un suelo de 2,5e-6.

El modelo resuelve manipulación de sobremesa condicionada por lenguaje: seis tareas distinguibles únicamente por la cadena de texto del episodio, con tres cámaras de entrada a 224×224, un estado de 7 dimensiones (seis ángulos articulares en radianes y la apertura de pinza normalizada a [0, 1]) y una salida de 50 pasos de acción a 7 dimensiones por paso y 20 Hz, es decir, 2,5 segundos de movimiento por inferencia. La arquitectura interna emplea *flow matching* con un backbone `gemma_2b`, `action_dim` 32 y `action_horizon` 50.

Su relevancia es doble: por un lado, incorpora los cuatro niveles de desorden (`d1`–`d4`) al conjunto de entrenamiento, que en el modelo anterior (`ur5e_pi05_10k`) eran el conjunto de generalización retenido; por otro, documenta con detalle inusual las decisiones de diseño del pipeline de datos, incluidas las limitaciones derivadas de haber sintetizado las acciones a partir del estado siguiente. El repositorio ocupa 12,4 GB y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ con *flow matching*; backbone de lenguaje `gemma_2b`, codificador visual multi-cámara y experto de acción |
| Parametros totales | no disponible (la información solo identifica el backbone, `gemma_2b`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el *prompt* de tarea se tokeniza a 200 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las cadenas de tarea del conjunto de datos están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; repositorio de 12,4 GB con la librería LeRobot |
| Entradas de observación | 3 imágenes RGB a 224×224 (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) + estado de 7 dimensiones + cadena de tarea |
| Horizonte de acción | 50 pasos × 7 dimensiones, a 20 Hz |
| Dimension interna de acción | 32 (la transformación de salida recorta a 7) |
| Espacio de acción | 6 articulaciones en delta respecto al estado actual (máscara `make_bool_mask(6, -1)`), pinza absoluta |
| Plataforma objetivo | UR5e con pinza Robotiq (`ur5e_robotiq`) |
| Tareas entrenadas | 6 (`place the three cups in the bowls`, `put the book in the box`, `put the bowl on the rack`, `put the cup in the bowl`, `put the mug on the coaster`, `stack the two cubes`) |

## Arquitectura y entrenamiento

El modelo sigue el diseño π₀.₅: un transformer que combina un backbone de lenguaje Gemma 2B con un codificador visual que procesa tres vistas simultáneas y un experto de acción entrenado por *flow matching*. Las imágenes se adaptan mediante `resize_with_pad`, que encaja la resolución nativa de 320×240 en 224×224 y rellena el resto, de ahí las barras visibles en los *frames* de entrada. La tercera ranura de imagen (`right_wrist_0_rgb`), alimentada desde `observation.images.side` mediante el ajuste `use_side_camera`, está realmente rellena con datos y no con ceros; el repositorio guarda un `data_setup.json` que lo registra, y RoboResearch lo restaura al cargar el checkpoint. El estado de 7 dimensiones y la cadena de tarea del episodio (tokenizada a 200 tokens) completan la entrada. La salida es un bloque de 50 acciones, con las seis articulaciones expresadas como incrementos respecto al estado actual y la pinza en valor absoluto, que es el espacio en el que se preentrenó `pi05_base`.

El ajuste fino parte de `pi05_base` y usa el conjunto `ur5e_all`: 1.200 episodios, 373.427 *frames*, 6 tareas y 5 subconjuntos a 20 fps. La partición es 1.080 episodios de entrenamiento y 120 retenidos, con **cada décimo episodio fuera**, de modo que la separación es por grabación y no por *frame* (una partición por *frame* evaluaría al modelo sobre secuencias casi idénticas a las ya vistas). Las estadísticas de normalización se calcularon solo sobre los 1.080 episodios de entrenamiento. Se entrenó durante 15.000 de los 20.000 pasos previstos, con tamaño de lote 144 y decaimiento coseno programado sobre las 20.000 iteraciones completas, lo que equivale a unas 6,4 pasadas sobre 336.000 *frames*. El hardware fueron 3 GPU H200 y la ejecución completa de 20.000 pasos requirió 23 horas y 25 minutos.

Dos particularidades del dato conviene tenerlas presentes. Primero, las acciones no se grabaron: el script `scripts/convert_ur5e.py` define la acción de cada paso como el estado del paso siguiente, de manera que la política aprende a reproducir la siguiente pose del propio brazo, esto es, una repetición de un plan de *waypoints* guionizado y no una consigna comandada. Segundo, la articulación `j4` permanece congelada en cinco tareas (menos de 0,0025 rad de recorrido total) y es bimodal en `put_bowl_on_rack`: sus 100 episodios limpios se sitúan en `j4` 1,5750 y los 100 con desorden en 4,7160, prácticamente π de diferencia, correspondientes a la rama de muñeca reflejada.

## Capacidades

- Generación de acciones de manipulación condicionadas por lenguaje para un UR5e de seis ejes con pinza Robotiq.
- Distinción de seis tareas de sobremesa exclusivamente por la cadena de texto del *prompt*, sin cambio de cabeza ni de configuración.
- Percepción multi-cámara simultánea: cámara de escena, cámara de muñeca y segunda vista de escena desde la base del robot.
- Ejecución de secuencias largas: `place the three cups in the bowls` encadena tres *pick-and-place* y sus episodios promedian 710 *frames* frente a unos 235 en el resto.
- Tolerancia al desorden: los cuatro niveles `d1`–`d4` están incluidos en el entrenamiento, no reservados para evaluación.
- Control por bloques de 50 acciones a 20 Hz, lo que permite 2,5 segundos de movimiento por inferencia y reduce la frecuencia efectiva de cómputo del modelo.
- No soporta *tool calling*, ni llamadas a funciones, ni razonamiento multi-paso textual, ni generación de texto: es una política de acción, no un asistente conversacional.
- No se documentan capacidades de visión general (descripción de imágenes, OCR, VQA) ni de audio.

## Casos de uso

- Automatización de *pick-and-place* en línea de montaje: el modelo recibe las tres vistas de la celda y la instrucción textual de la tarea, y emite bloques de 50 acciones que el controlador del UR5e ejecuta a 20 Hz; encaja porque la tarea está entrenada explícitamente y el horizonte de 2,5 segundos cubre un ciclo completo de aproximación y agarre.
- Reordenación de sobremesa con objetos dispersos: aprovecha que los niveles de desorden `d1`–`d4` forman parte del entrenamiento, de modo que la política no se degrada con objetos fuera de posición nominal.
- Sustitución de *scripting* de *waypoints* en prototipos de investigación: al estar condicionado por lenguaje, un mismo checkpoint cubre seis tareas y evita mantener seis programas de trayectorias.
- Banco de pruebas para evaluación de VLA en robótica real: el reparto por episodios (120 retenidos, cada décimo) y las estadísticas de normalización calculadas solo sobre entrenamiento permiten medir generalización con un protocolo reproducible.
- Recogida de objetos con agarre en rama de muñeca alternativa: en `put_bowl_on_rack` la política ve las dos ramas de `j4` separadas π radianes, útil para estudiar si el modelo resuelve la ambigüedad o promedia modos.
- Investigación sobre espacios de acción delta frente a absolutos: el modelo usa deltas en las seis articulaciones y pinza absoluta, por lo que sirve como referencia para comparar esquemas de representación de acción.
- *Data augmentation* de políticas existentes: el checkpoint puede emplearse como inicialización para nuevos ajustes finos sobre el mismo robot, ya que parte de `pi05_base` y conserva el espacio de acción original.

## Benchmarks y rendimiento

La model card solo publica `action_mse`, medido en unidades de acción en bruto y con toda la normalización deshecha, sobre una estimación de cuatro lotes. No hay tasas de éxito de tarea publicadas.

| Métrica | Paso 0 | Paso 15.000 | Mejora |
|---|---|---|---|
| `action_mse` en retenido | 0,069912 | 0,001713 | 41× |
| `action_mse` en entrenamiento | 0,069258 | 0,000182 | 381× |
| Pérdida de *flow matching* | 0,0382 | 0,0007 | 52× |

Evolución del conjunto retenido: la curva se aplana hacia el paso 4.000. La ventana 2.000–4.000 promedia 0,00196, y todas las ventanas de 2.000 pasos posteriores se sitúan entre 0,00169 y 0,00183, con el 90 % de las lecturas desde el paso 2.000 dentro del intervalo 0,0015–0,0021. La lectura individual más baja fue 0,001365 en el paso 4.500. Los cuatro checkpoints guardados puntúan 0,001994 (5.000), 0,001858 (10.000), 0,001713 (15.000) y 0,001752 (19.999); el autor señala que estas diferencias caen dentro del ruido de una estimación de cuatro lotes. El autor indica además que la brecha entre entrenamiento y retenido es real (el texto de la model card se corta en ese punto).

No se han publicado resultados de otros benchmarks (tasa de éxito, MMLU, HumanEval, GSM8K u otros) en la información disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.

## Requisitos de hardware

- Entrenamiento: 3 × H200 según la model card; la ejecución completa de 20.000 pasos requirió 23 h 25 min. Este checkpoint corresponde al paso 15.000 de esa ejecución.
- VRAM de inferencia: no disponible. El autor no publica mediciones. Como estimación de orden de magnitud, no confirmada por el autor, un backbone tipo Gemma 2B en bf16 ocupa del orden de 4–5 GB solo en pesos, a lo que hay que sumar el codificador visual y el experto de acción; una GPU de consumo con 12–24 GB (RTX 3090, RTX 4090) sería plausible para inferencia, pero no existe medición publicada que lo respalde.
- GPU de datacenter (A100, H100, H200) recomendadas si se busca margen de VRAM y *throughput* en evaluación por lotes, siguiendo el hardware usado en entrenamiento.
- Latencia y *throughput*: no disponibles. El único dato relacionado es que cada inferencia produce 2,5 segundos de movimiento (50 pasos a 20 Hz), lo que fija el presupuesto temporal que debe cumplir el bucle de control si se ejecuta un bloque por inferencia.
- Despliegue: la librería declarada es LeRobot; el entrenamiento usa RoboResearch sobre openpi, con `data_setup.json` para restaurar la configuración de cámaras. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, que no son aplicables a una política de acción de robótica.
- Se requiere el hardware físico correspondiente: brazo UR5e con pinza Robotiq y tres cámaras alineadas con `observation.images.base`, `observation.images.wrist` y `observation.images.side`.

## Comparativa con modelos similares

| Modelo | Entradas | Tareas | `action_mse` retenido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ur5e_pi05_all_3cam_15k` (este) | 3 cámaras, 1.080 episodios de entrenamiento | 6, con desorden `d1`–`d4` incluido | 0,001713 (paso 15.000) | Apache 2.0 | HuggingFace, 0 descargas |
| `ur5e_pi05_all_3cam_20k` | 3 cámaras, mismo conjunto | 6, mismo conjunto | 0,001752 (paso 19.999) | Apache 2.0 | HuggingFace |
| `ur5e_pi05_10k` | 2 cámaras | 5, solo `clean` | no disponible en esta ficha | no disponible | HuggingFace |
| `pi05_base` | preentrenamiento general | no aplica | 0,069912 (paso 0 de este ajuste, como referencia) | no disponible | `gs://openpi-assets/checkpoints/pi05_base/params` |

Los cuatro modelos comparten arquitectura π₀.₅ y espacio de acción, por lo que la comparación es directa. La diferencia entre el checkpoint de 15.000 y el de 19.999 pasos cae dentro del ruido declarado por el propio autor. No se dispone de comparación con políticas VLA de otros autores (por ejemplo, familias basadas en otros *backbones*) en la información proporcionada.

## Limitaciones y advertencias

- La model card está truncada en el apartado de resultados: el texto se corta en la frase sobre la brecha entre entrenamiento y retenido, por lo que la discusión completa del autor no está disponible.
- Solo se publica `action_mse` como métrica. No hay tasas de éxito de tarea, ni evaluación con el brazo real, ni comparación contra un *baseline* de *scripting*.
- La `action_mse` se estima con cuatro lotes, según el propio autor; las diferencias entre checkpoints guardados no son estadísticamente significativas.
- Las acciones del conjunto de datos fueron sintetizadas como el estado del paso siguiente, no grabadas. La política reproduce un plan de *waypoints* guionizado, lo que puede limitar su comportamiento ante perturbaciones o contacto no previsto.
- `j4` es bimodal en `put_bowl_on_rack` (1,5750 en limpio frente a 4,7160 en desorden, separadas π). Con un único *prompt* para ambas ramas, existe riesgo de que la política promedie modos y genere trayectorias de muñeca inválidas.
- `j4` está prácticamente congelada en las otras cinco tareas; el modelo puede no haber aprendido a controlarla de forma general.
- Los niveles de desorden `d1`–`d4` están dentro del entrenamiento, por lo que no sirven como prueba de generalización. El único conjunto retenido es el 10 % de episodios reservado.
- Cobertura restringida a seis tareas de sobremesa, un único tipo de robot, una única pinza y un único entorno físico. El comportamiento fuera de esa distribución no está caracterizado.
- No hay información sobre sesgos del conjunto de datos, composición demográfica, condiciones de iluminación, variabilidad de objetos ni robustez ante fallos de la pinza.
- El modelo no es un asistente de texto: no genera lenguaje, no razona simbólicamente y no soporta *tool calling*.
- Licencia Apache 2.0, que permite uso comercial, pero se hereda del modelo base `pi05_base`, cuyos términos no se detallan en la ficha; conviene verificarlos antes de un despliegue comercial.
- No hay garantías de seguridad para operación con personas en el espacio de trabajo. Cualquier despliegue real necesita capas externas de limitación de velocidad, parada de emergencia y supervisión.
- El repositorio registra 0 descargas y 0 *likes*, por lo que no existe validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahgoobi/ur5e_pi05_all_3cam_15k
- Checkpoint del paso 20.000: https://huggingface.co/mahgoobi/ur5e_pi05_all_3cam_20k
- Checkpoint anterior de 10.000 pasos: https://huggingface.co/mahgoobi/ur5e_pi05_10k
- RoboResearch (entrenamiento): https://github.com/EAI-RSM/RoboResearch
- openpi (base de la implementación): https://github.com/wensi-ai/openpi
- Pesos de `pi05_base`: `gs://openpi-assets/checkpoints/pi05_base/params`
- Librería LeRobot: no se proporciona URL en la información disponible
- Artículo o informe técnico de π₀.₅: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
