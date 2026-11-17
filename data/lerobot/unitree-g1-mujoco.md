# lerobot/unitree-g1-mujoco

## Resumen

`lerobot/unitree-g1-mujoco` es un repositorio de simulación, no un modelo de lenguaje. Contiene los activos MuJoCo (MJCF, URDF y mallas) del robot humanoide Unitree G1 tal como los carga dinámicamente la librería LeRobot a través de su `env.py`. El repositorio permite instanciar el G1 en MuJoCo con 29 motores corporales, publicar comandos y estados por DDS (Unitree SDK2 / CycloneDDS) y emitir tres flujos de cámara por ZMQ a 640 × 480 y aproximadamente 30 Hz. Su relevancia actual está en que estandariza el entorno simulado para entrenar y evaluar políticas de imitación y refuerzo sobre un humanoide de bajo coste dentro del ecosistema LeRobot.

El repositorio ofrece tres configuraciones de efector final: `dex1` (pinza paralela Dex1-1, escena `assets/scene_33dof.xml`, 29 articulaciones corporales más 2 dedos por pinza, tres cámaras), `dex3` (manos articuladas Dex3, escena `assets/scene_hands_cameras.xml`, 29 articulaciones corporales más 7 por mano, tres cámaras) y `dummy` (robot sin manos, escena `assets/scene_29dof.xml`, solo cámara de cabeza). Los nombres antiguos `grippers`, `hands` y `none` se aceptan como alias.

El tamaño del repositorio es de 0,1 GB, con 563 descargas y 14 likes en el momento de la consulta. No es un modelo entrenado: no hay pesos neuronales, ni pipeline de inferencia, ni benchmarks de lenguaje. Es un componente de infraestructura para robótica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (activos de simulacion MuJoCo: MJCF + URDF + mallas) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la ficha de Hugging Face; el URDF original Dex1 en `reference/hiw500/` es Apache 2.0 y las mallas de Unitree conservan sus terminos upstream |
| Formato de pesos | No aplica; activos en XML (MJCF), URDF y mallas; configuracion en YAML/JSON |

## Arquitectura y entrenamiento

El repositorio describe un modelo físico, no una red neuronal. La escena por defecto `assets/scene_33dof.xml` incluye el MJCF de la pinza derivado del URDF suministrado, y el URDF portable se conserva en `assets/g1_29dof_with_dex1_1.urdf`. Las cámaras y actuadores en tiempo de ejecución se definen en el MJCF. Se mantienen sin cambios los activos originales `assets/scene_43dof.xml`, `assets/g1_29dof_with_hand.xml`, `assets/g1_body29_hand14.urdf` y el modelo sin manos.

La interfaz preserva el punto de entrada `make_env()`, los 29 comandos de motor corporales, los topics DDS de estado corporal, el avance de simulación y el formato de mensajes de imagen por ZMQ. Las pinzas Dex1 usan actuadores de fuerza gobernados por un controlador PD externo del puente existente, con apertura inicial de 0,0245 m, límite de 20 N por dedo y límite inferior de simulación de -0,023 m (el URDF oficial mantiene -0,020 m; `build_gripper_model.py --official-limits` aplica ese límite en MJCF, dejando unos 5,88 mm entre almohadillas). Las cámaras de muñeca tienen 95° de campo de visión vertical y extrínsecos aproximados del modelo HIW-500. El repositorio incluye una suite de regresión con MuJoCo real, mapeo motor/observación, cierre por control de fuerza, movimiento de cámaras de muñeca, renderizado y buffers de memoria compartida del publicador de cámaras, además de `tests/smoke_live.py` para el entorno y transportes reales.

## Capacidades

- Simulación física del Unitree G1 con 29 motores corporales y avance de simulación por pasos.
- Tres configuraciones de efector final seleccionables (`dex1`, `dex3`, `dummy`) con escena, número de dedos, límites de esfuerzo y lista de cámaras ajustados automáticamente.
- Publicación de tres flujos de cámara (`head_camera`, `left_wrist_cam`, `right_wrist_cam`) en `tcp://127.0.0.1:5555`, 640 × 480, aproximadamente 30 Hz, con clave JPEG de nivel superior y entradas anidadas `images`/`timestamps`.
- Control de pinza Dex1 mediante actuadores de fuerza con controlador PD externo, comandos en `rt/dex3/left/cmd` y `rt/dex3/right/cmd` (los dos primeros motores corresponden a los dedos 1 y 2).
- Integración con DDS (Unitree SDK2 / CycloneDDS) para comandos y estados.
- Configuración de cámaras para LeRobot mediante `ZMQCameraConfig` y el fichero equivalente `lerobot_cameras.json`.
- Modo sin visor (`onscreen=False`) y desactivación de publicación de imágenes (`publish_images=False`).
- Selección de subconjunto de cámaras con `make_env(cameras=["head_camera"])`.
- Regeneración de variantes con `python build_gripper_model.py`.

## Casos de uso

- Entrenamiento de políticas de imitación en LeRobot: el entorno expone observaciones de cámara y estado corporal con la misma interfaz que el robot real, lo que permite recoger demostraciones simuladas y transferirlas al G1 físico.
- Evaluación de controladores de pinza: los actuadores de fuerza con límite de 20 N por dedo y el controlador PD externo permiten probar estrategias de agarre antes de desplegarlas en hardware.
- Aprendizaje por refuerzo con visión: los tres flujos de cámara a 30 Hz y la escena MuJoCo permiten entrenar políticas visomotoras con renderizado acelerado por GPU (`MUJOCO_GL=egl`).
- Validación de pipelines de percepción: las cámaras de muñeca con 95° de FOV vertical y extrínsecos conocidos sirven para calibrar y depurar algoritmos de estimación de pose y manipulación.
- Pruebas de integración DDS: el repositorio aísla DDS con un doble de prueba en la suite de regresión y ofrece `smoke_live.py` para verificar los transportes reales con Unitree SDK2.
- Desarrollo headless en clúster: `onscreen=False` y `MUJOCO_GL=egl` permiten ejecutar la simulación sin display en servidores, útil para barridos de hiperparámetros.
- Comparación de efectores finales: cambiar entre `dex1`, `dex3` y `dummy` permite estudiar el impacto de la morfología de la mano en las políticas entrenadas sin reescribir el entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de éxito de tareas, recompensas agregadas ni comparaciones con otros simuladores; solo describe la suite de regresión y las comprobaciones de humo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos neuronales); el coste depende del renderizado MuJoCo y del backend gráfico.
- GPU recomendadas: no disponible en la información proporcionada; el repositorio solo menciona `MUJOCO_GL=egl` para renderizado acelerado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución directa con Python mediante `env.make_env()`, MuJoCo, Gymnasium, Unitree SDK2, CycloneDDS, ZMQ y OpenCV; instalación de dependencias con `python -m pip install -r requirements.txt`.
- Latencia y throughput: publicación de cámaras a aproximadamente 30 Hz y 640 × 480; no se documentan cifras de latencia de simulación ni de throughput de pasos.

## Comparativa con modelos similares

| Repositorio | Tipo | Articulaciones | Cámaras | Licencia | Notas |
|---|---|---|---|---|---|
| `lerobot/unitree-g1-mujoco` | Activos MuJoCo para LeRobot | 29 cuerpo + 2 dedos por pinza (dex1) o 7 por mano (dex3) | 3 (dex1/dex3), 1 (dummy) | No disponible en la ficha; componentes Apache 2.0 y términos upstream de Unitree | Integración nativa con LeRobot, DDS y ZMQ |
| `Hxxxz0/HIW-500-controoler` | URDF, mallas y geometría de cámara de muñeca | Fuente del efector Dex1-1 | No aplica | Apache 2.0 (según la model card) | Origen de los activos de pinza |
| `lerobot/robot-urdfs` | Repositorio de URDF para LeRobot | No disponible | No disponible | No disponible | Citado como destino futuro en el TODO de la model card |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de visión: no genera texto, código ni respuestas; cualquier expectativa de inferencia neuronal es incorrecta.
- La licencia no está declarada en la ficha de Hugging Face; antes de uso comercial debe verificarse en el repositorio y en los términos upstream de las mallas de Unitree.
- El límite inferior de simulación de la pinza (-0,023 m) difiere del URDF oficial (-0,020 m); hay que ejecutar `build_gripper_model.py --official-limits` para alinearlos.
- La actualización del modelo no añade acciones de dedos al esquema de acción `UnitreeG1` de 29 motores corporales de LeRobot.
- Los comandos de dedos se enrutan por los topics `rt/dex3/left/cmd` y `rt/dex3/right/cmd`, lo que puede confundir si se asume un topic específico de Dex1.
- Requiere Unitree SDK2 y CycloneDDS instalados; la suite de regresión aísla DDS con un doble, pero `smoke_live.py` necesita las dependencias reales.
- El TODO de la model card indica que la carga del robot desde `lerobot/robot-urdfs` está pendiente, por lo que los URDF y mallas siguen viviendo en `assets/`.
- No se documentan sesgos, alucinaciones ni limitaciones de contexto por no tratarse de un modelo generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lerobot/unitree-g1-mujoco
- Árbol de la revisión base citada: https://huggingface.co/lerobot/unitree-g1-mujoco/tree/a38dc8617f0fca51b38e9354dc58ee35ad850fb5
- URDF, mallas y geometría de cámara de muñeca (HIW-500): https://github.com/Hxxxz0/HIW-500-controoler/tree/c69d89d88bb51774fe9a3684b90d9ff1abf801da
- LeRobot (revisión de referencia b6ec006): https://github.com/huggingface/lerobot/tree/b6ec0060779550c0a157ae34feb89e0cf86012a8
