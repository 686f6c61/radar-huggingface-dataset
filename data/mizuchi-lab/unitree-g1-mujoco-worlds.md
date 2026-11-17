# mizuchi-lab/unitree-g1-mujoco-worlds

## Resumen

Unitree G1 MuJoCo worlds es un repositorio de entornos de simulación MuJoCo agnósticos al robot, publicados por mizuchi-lab como complemento del repositorio `mizuchi-lab/unitree-g1-mujoco`, que contiene el modelo del robot humanoide Unitree G1 para LeRobot. No se trata de un modelo de IA en el sentido habitual (no hay pesos neuronales, ni tokenizador, ni pipeline de inferencia): es un conjunto de escenas físicas XML de MuJoCo (mesas, objetos, particiones, cámaras fijas) que el repositorio del robot carga como entorno de Hub para entrenar y evaluar políticas de manipulación con LeRobot.

Cada «world» define una tarea concreta de pick-and-place: recoger un cilindro de una mesa o una lata de patatas Pringles (objeto YCB) en habitaciones de dimensiones variables. El diseño separa estrictamente lo específico del robot (cuerpos, monturas, cámaras del G1) de lo específico de la escena, de modo que los mundos son reutilizables por otros robots siempre que respeten el contrato documentado.

El repositorio se creó el 13 de octubre de 2026 y se actualizó el 17 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta. Su relevancia es práctica para quien entrene políticas con LeRobot sobre el G1 en simulación: proporciona entornos reproducibles y versionables en el Hub, con aleatorización de objetos y tareas declaradas en YAML.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; conjunto de escenas MuJoCo XML para simulación física) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica; documentación en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible; formato de los artefactos: XML de MuJoCo (`world.xml`), YAML (`world.yaml`), OBJ y PNG para mallas y texturas |
| Librería | lerobot |
| Tamaño del repositorio | 0.0 GB |
| Mundos incluidos | `pick_cylinder`, `table_room_3x1200`, `table_room_1x3450`, `table_room_1x3450_short`, `table_room_2x6` |
| Cámaras publicadas | `table_view`, `room_view` (además de las del robot: `head_camera`, `left_wrist_cam`, `right_wrist_cam`, `global_view`) |
| Herramientas incluidas | `tools/robot.py`, `tools/build_room_meshes.py`, `tools/grasp_diag.py`, `tools/thumb_map.py` |
| Tests | comprobaciones de contrato de cada mundo y tests del G1 para `pick_cylinder` y `table_room` |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni proceso de entrenamiento: el repositorio contiene descripciones de escenas para el motor de física MuJoCo. Cada mundo vive en `worlds/<name>/world.xml` (obligatorio) con un `world.yaml` opcional que declara hechos de la escena: `support` (nombre del geom de soporte sobre el que se aplica el jitter, con el borde al menos 5 cm dentro de él), `randomize` (jitter xy por defecto en metros, más ±15 grados de yaw en cada reset, sobrescribible por `WORLD_RANDOMIZE` del robot, con `0` para desactivarlo) y `tasks` (lista de cadenas de tarea).

El contrato de diseño es la innovación técnica principal: el marco del mundo es x adelante, y izquierda, z arriba, con origen en el suelo donde aparece el robot y el robot mirando a +x. Todo cuerpo con joint libre es un «objeto» que el robot resetea, agita y puede agarrar. Un mundo nunca nombra cuerpos, sitios, monturas, cámaras ni bits de colisión del robot; no puede declarar `<equality>` contra cuerpos del robot ni `contype`/`conaffinity` distintos de `0` (solo para geoms visuales). El bloque `<option>` se fusiona con el del robot (gana el mundo por atributo) y `<compiler>` se descarta, por lo que las orientaciones deben expresarse como `quat`, nunca `euler` o `axisangle`. Al fusionar, `unitree-g1-mujoco` aplica OR del bit de colisión del AmazingHand (2) en el `conaffinity` de cada geom del mundo, de forma que las manos tocan objetos del mundo pero nunca el robot, el suelo ni a sí mismas.

Los mundos de habitación se generan con `tools/build_room_meshes.py`, que construye mallas a partir de GLB del laboratorio y de la lata YCB, en OBJ con eje z arriba y PNG a tamaño real, y corta la partición de 3450 mm en paneles individuales para `table_room_2x6`. `tools/grasp_diag.py` ejecuta un agarre scriptado con diagnósticos y `tools/thumb_map.py` contiene el mapa de poses del pulgar de AmazingHand usado para elegir las poses del agarre.

## Capacidades

- Simulación física de escenas de manipulación para el humanoide Unitree G1 con LeRobot como cargador de entorno de Hub.
- Tareas de pick-and-place: recoger un cilindro libre (radio 2,5 cm, altura 15 cm, 50 g) o una lata de patatas Pringles YCB de una mesa.
- Cinco escenas con geometrías y distancias variables: mesa de laboratorio blanca ajustable de 0,80 m, habitaciones de 3,6 × 7,2 m, particiones de 1200 × 1800 mm, 3450 × 1800 mm y paneles de 862,5 × 1800 mm.
- Cámaras fijas publicadas por el robot: `table_view` y `room_view`, además de las cámaras propias del G1.
- Aleatorización configurable de posición y orientación de objetos (`WORLD_RANDOMIZE`, por defecto desde `world.yaml`).
- Dos modos de agarre: `WORLD_GRASP=physics` (por defecto) y `WORLD_GRASP=attach`.
- Resolución de mundos por nombre desde el Hub (descarga solo `worlds/<name>/`), fijado a revisión (`@<revision>:<world>`), desde checkout local (`UNITREE_G1_MUJOCO_WORLDS_ROOT`) o desde ruta arbitraria a carpeta o XML.
- Validación mediante tests de contrato de cada mundo y tests específicos del G1.

## Casos de uso

- Entrenamiento de políticas de manipulación con LeRobot: cargar `make_env(world="pick_cylinder", world_randomize=0.02)` y entrenar el agarre del cilindro con aleatorización de 2 cm, aprovechando que el mundo declara el geom de soporte para el jitter.
- Evaluación reproducible de checkpoints: fijar el mundo a una revisión concreta (`mizuchi-lab/unitree-g1-mujoco-worlds@<revision>:pick_cylinder`) para que las comparativas entre ejecuciones no se vean afectadas por cambios en la escena.
- Barrido de dificultad de agarre: usar la progresión `pick_cylinder` → `table_room_3x1200` → `table_room_1x3450` → `table_room_1x3450_short` → `table_room_2x6`, que aumenta la distancia del robot a la mesa (de spawn a 2,5 m y hasta 3,8625 m) y cambia la geometría de la sala.
- Investigación en percepción con cámaras fijas: las vistas `table_view` y `room_view` permiten estudiar políticas que dependen de una cámara externa, no solo de las cámaras de muñeca y cabeza del G1.
- Validación de agarre con diagnóstico: ejecutar `tools/grasp_diag.py` sobre `pick_cylinder` o sobre la lata de un mundo `table_room` para depurar por qué falla un agarre antes de lanzar un entrenamiento largo.
- Reutilización por otros robots: al ser mundos agnósticos, un equipo con otro manipulador puede adoptar las escenas siempre que respete el contrato (nombres, bits de colisión, orientaciones en `quat`) y aporte su propio repositorio de robot.
- Desarrollo de entornos personalizados: tomar `world.xml` y `world.yaml` como plantilla, validar con los tests de contrato y publicar variantes locales resueltas vía `UNITREE_G1_MUJOCO_WORLD=/path/to/my_world`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica VRAM de inferencia de un modelo neuronal: el coste es el de simular MuJoCo con el G1, sus manos AmazingHand y los objetos de la escena.
- No se especifican GPU recomendadas ni requisitos mínimos en la información disponible.
- No se indica si la simulación cabe en GPU de consumo; MuJoCo puede ejecutarse en CPU, pero el repositorio no documenta requisitos.
- Opciones de despliegue: el entorno se carga a través de `unitree-g1-mujoco` con LeRobot (`make_env`) y se configura con las variables `UNITREE_G1_MUJOCO_WORLD`, `UNITREE_G1_MUJOCO_WORLDS_ROOT`, `WORLD_GRASP` y `WORLD_RANDOMIZE`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mizuchi-lab/unitree-g1-mujoco-worlds | Mundos MuJoCo para LeRobot | no aplica | no aplica | no disponible | Hub de Hugging Face |
| mizuchi-lab/unitree-g1-mujoco | Modelo del robot G1 para LeRobot (consumidor de estos mundos) | no aplica | no aplica | no disponible | Hub de Hugging Face |
| Otras suites de entornos de manipulación (p. ej. ManiSkill, RoboSuite) | Simuladores/entornos | no aplica | no aplica | no disponible en esta consulta | no disponible |

No se dispone de datos de rendimiento ni de licencia de las alternativas en la información proporcionada; la comparativa se limita a la naturaleza del artefacto y su disponibilidad.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, código ni imágenes; no debe evaluarse con MMLU, HumanEval o GSM8K.
- La licencia no está declarada, por lo que el uso comercial queda sin base legal explícita hasta que el autor la publique.
- El repositorio tiene 0 descargas y 0 likes y un tamaño de 0.0 GB en la metadata, lo que sugiere un proyecto muy reciente o poco validado por la comunidad; conviene verificar el contenido real antes de depender de él.
- Los mundos están diseñados exclusivamente para el contrato de `unitree-g1-mujoco`; reutilizarlos con otro robot exige adaptar nombres, bits de colisión y el manejo de `<option>`/`<compiler>`.
- Restricciones duras del contrato: no reutilizar nombres de cámaras del robot (`head_camera`, `left_wrist_cam`, `right_wrist_cam`, `global_view`), no usar `euler`/`axisangle`, no declarar `contype`/`conaffinity` distintos de `0` salvo en geoms visuales, y mantener los objetos al menos 5 cm dentro del geom de soporte.
- Solo se documentan dos objetos agarrables (cilindro y lata YCB) y cinco escenas; la diversidad de tareas es limitada.
- El repositorio no incluye datos de sesgos, alucinación ni comportamiento en producción porque no ejecuta inferencia; los riesgos son de simulación (diferencias sim-a-real, colisiones mal configuradas, agarres inestables en modo `physics`).
- No hay información sobre versiones de MuJoCo, dependencias de Python ni compatibilidad con versiones concretas de LeRobot.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mizuchi-lab/unitree-g1-mujoco-worlds
- Repositorio del robot G1 para LeRobot: https://huggingface.co/mizuchi-lab/unitree-g1-mujoco
- LeRobot: no disponible en la información proporcionada
- MuJoCo: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
