# davidwei79/unitree-g1-mujoco-brainco

## Resumen

`davidwei79/unitree-g1-mujoco-brainco` es un repositorio de modelo de simulación para el robot humanoide Unitree G1, publicado como fork experimental dentro del ecosistema LeRobot. No es un modelo de lenguaje ni una red neuronal entrenada: contiene descripciones MJCF y URDF, mallas y utilidades de ejecución que permiten cargar el G1 en el motor físico MuJoCo desde LeRobot mediante el punto de entrada `make_env()`. El repositorio ocupa 0,1 GB y su tarjeta de modelo está etiquetada con `lerobot`, `mujoco` y `unitree-g1`.

La aportación principal respecto al repositorio base `lerobot/unitree-g1-mujoco` es la ampliación del selector de efector final: se mantiene `dex1` (dos pinzas paralelas Dex1-1, opción por defecto) y se añaden las variantes `dex3` (manos articuladas de 7 articulaciones por mano), `dummy` (robot sin manos) y `brainco` (manos BrainCo con 6 motores y 11 articulaciones móviles por mano). La escena, el número de dedos, los límites de esfuerzo y la lista de cámaras publicadas cambian automáticamente según el valor de `END_EFFECTOR` en `config.yaml`.

Es relevante ahora porque el G1 se ha convertido en una plataforma de referencia para investigación en manipulación con manos diestras, y disponer de una variante de simulación que conserva los temas DDS del robot real (`rt/lowcmd`, `rt/lowstate`) permite trasladar políticas entrenadas en simulación a hardware cambiando únicamente el dominio DDS y la interfaz de red. El autor advierte explícitamente de que se trata de un fork experimental, no de un lanzamiento upstream ni de una certificación de hardware, y recomienda fijar un commit al cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Modelo físico descrito en MJCF (`assets/scene_33dof.xml` y variantes) con URDF portable (`assets/g1_29dof_with_dex1_1.urdf`) y mallas asociadas |
| Parametros totales | No aplicable (no es un modelo aprendido). Cuerpo de 29 grados de libertad, más los grados de libertad de cada efector final |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MJCF (`.xml`), URDF (`.urdf`) y mallas; no hay safetensors ni GGUF |
| Biblioteca | `lerobot` |
| Tamano del repositorio | 0,1 GB |
| Punto de entrada | `from env import make_env` |
| Efectores finales seleccionables | `dex1` (por defecto), `dex3`, `dummy`, `brainco`; alias `grippers`, `hands`, `none` |
| Grado de libertad del cuerpo | 29 motores corporales |
| Escenas de runtime | `scene_33dof.xml` (dex1), `scene_hands_cameras.xml` (dex3), `scene_29dof.xml` (dummy), `scene_brainco.xml` (brainco) |
| Camaras publicadas | `head_camera`, `left_wrist_cam`, `right_wrist_cam` (dex1 y dex3); solo `head_camera` en dummy y brainco |
| Transporte de imagenes | ZMQ en `tcp://127.0.0.1:5555`, 640 x 480, aproximadamente 30 Hz |
| Transporte de control | DDS (Unitree SDK2 / CycloneDDS) |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una descripción mecánica y de sensores. MuJoCo carga `assets/scene_33dof.xml`, que incorpora el MJCF de la pinza derivado del URDF suministrado; los actuadores de runtime y las cámaras se definen en el propio MJCF, mientras que el URDF se conserva como formato portable. El modelo preserva la interfaz del repositorio base: el punto de entrada `make_env()`, los 29 comandos de motor corporales, los tópicos DDS de estado del cuerpo, el bucle de paso de simulación y el formato de mensajes de imagen por ZMQ. Se mantienen sin cambios `assets/scene_43dof.xml`, `assets/g1_29dof_with_hand.xml`, `assets/g1_body29_hand14.urdf` y el modelo sin manos.

La variante `brainco` se apoya en una extensión local que añade comandos y realimentación normalizados de la mano a través de la rama correspondiente de LeRobot, con 6 motores por mano y 11 articulaciones móviles cada una. Las pinzas Dex1 usan actuadores de fuerza gobernados por el controlador PD externo del puente existente: `q` se expresa en metros y `tau` en newtons, con un límite de 20 N por dedo, y las dos primeras entradas de motor de `rt/dex3/left/cmd` y `rt/dex3/right/cmd` controlan los dedos 1 y 2. El límite inferior de la simulación es -0,023 m (recorte de cierre de malla del modelo HIW-500), mientras que el URDF conserva el límite oficial de -0,020 m; `python build_gripper_model.py --official-limits` traslada ese límite al MJCF y deja aproximadamente 5,88 mm entre las almohadillas de los dedos. El modelo no añade acciones de dedo al esquema de acción `UnitreeG1` de 29 motores corporales de LeRobot.

## Capacidades

- Simulación física del cuerpo del Unitree G1 con 29 grados de libertad motrices en MuJoCo.
- Selección de efector final en tiempo de construcción del entorno: `dex1`, `dex3`, `dummy` o `brainco`, con ajuste automático de escena, número de dedos, límites de esfuerzo y cámaras.
- Control de pinzas Dex1-1 mediante actuadores de fuerza y limitación de 20 N por dedo.
- Publicación simultánea de tres flujos de imagen (cabeza y ambas muñecas) a 640 x 480 y aproximadamente 30 Hz sobre ZMQ, con claves JPEG, `images` y `timestamps`.
- Cámaras de muñeca solidarias al movimiento de la muñeca correspondiente, con 95° de campo de visión vertical y extrínsecos aproximados del generador de modelo HIW-500.
- Descubrimiento dinámico de cámaras por parte de `view_cameras_live.py`, y exposición en `env.camera_configs`, `env.camera_names` y `env.metadata["cameras"]`.
- Integración con LeRobot mediante `UnitreeG1Config(..., cameras=...)` y `ZMQCameraConfig`, con selección de subconjunto de cámaras y desactivación de publicación (`publish_images=False`) o del visor (`onscreen=False`) para uso sin pantalla.
- Compatibilidad de transporte con el robot real: los mismos tópicos DDS de comando y estado, de modo que el cambio simulación-hardware se reduce al dominio DDS y la interfaz de red.
- Regeneración de variantes mediante `python build_gripper_model.py`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión semántica ni tool calling: no es un modelo fundacional.

## Casos de uso

- Entrenamiento de políticas de manipulación con LeRobot: el entorno expone acciones corporales y observaciones de cámara compatibles con los pipelines de LeRobot, de modo que se pueden entrenar políticas de agarre con la pinza Dex1 o con las manos Dex3 sin disponer del robot físico.
- Teleoperación simulación-a-real: al conservar los tópicos DDS del hardware, un operador puede validar una rutina de control en MuJoCo sobre `rt/lowcmd` y `rt/lowstate` y trasladarla después al G1 real modificando solo el dominio DDS y la interfaz de red.
- Evaluación comparativa de efectores finales: el selector `END_EFFECTOR` permite medir la misma tarea de agarre con pinzas Dex1-1, manos Dex3, manos BrainCo o sin manos, manteniendo idéntica la dinámica corporal y aislando el efecto del efector.
- Generación de datasets sintéticos con etiquetas de estado: los tres flujos de cámara a 30 Hz junto con el estado corporal DDS permiten grabar episodios sincronizados para preentrenar modelos de visión-acción cuando no hay acceso a datos reales.
- Desarrollo de control de cuerpo completo: los 29 comandos de motor y el bucle de paso de simulación permiten iterar sobre controladores de marcha, equilibrio y alcance antes de arriesgar hardware.
- Investigación en percepción con cámaras de muñeca: los extrínsecos y el campo de visión de 95° de `left_wrist_cam` y `right_wrist_cam` permiten estudiar estrategias de agarre en primera persona y estimación de pose de objeto.
- Integración continua de modelos robóticos: la suite de regresión cubre mapeo motor/observación, cierre por fuerza, movimiento de cámaras de muñeca, renderizado y buffers de memoria compartida del publicador, con DDS aislado mediante un doble de prueba.
- Validación previa a certificación de la mano BrainCo: la variante `brainco` permite verificar el flujo de comandos y realimentación normalizados contra la rama de LeRobot correspondiente, teniendo en cuenta que el propio autor advierte que esto no constituye aceptación de la mano física ni reproducción de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio documenta únicamente pruebas de validación funcional, no métricas comparativas de tareas:

| Prueba | Comando | Alcance |
|---|---|---|
| Suite de regresión unitaria | `MUJOCO_GL=egl python -m unittest discover -s tests -v` | MuJoCo real para ambas variantes, mapeo motor/observación, cierre por fuerza, movimiento de cámaras de muñeca, renderizado y buffers compartidos del publicador; DDS aislado con doble de prueba |
| Smoke test en vivo | `MUJOCO_GL=egl python tests/smoke_live.py` | Requiere Gymnasium, Unitree SDK2 y dependencias ZMQ/OpenCV reales; comprueba entorno y transportes |
| Smoke test con mano Dex3 | `MUJOCO_GL=egl python tests/smoke_live.py --end-effector dex3` | Igual que el anterior sobre la variante `dex3` |

El detalle de lo ejecutado para esta actualización se recoge en `VALIDATION.md`, según el autor.

## Requisitos de hardware

- MuJoCo ejecuta la física principalmente en CPU; no se publican cifras de VRAM ni de núcleos necesarios.
- Para renderizado sin pantalla se usa `MUJOCO_GL=egl`, lo que requiere soporte EGL en el controlador gráfico; existen alternativas de backend GL según la plataforma, no detalladas en la información disponible.
- GPU recomendadas: no disponible. El repositorio no especifica modelos de GPU ni requisitos de memoria gráfica.
- Compatibilidad con GPU de consumo: no disponible. Al no ser un modelo de pesos, no aplica el criterio habitual de encaje en VRAM.
- El repositorio ocupa 0,1 GB, por lo que el almacenamiento no es un cuello de botella; el coste relevante es la simulación y el renderizado.
- Prerrequisitos de software: SDK2 de Unitree y CycloneDDS, más `python -m pip install -r requirements.txt`.
- Opciones de despliegue: ejecución directa mediante `make_env()` dentro de LeRobot, publicación de imágenes por ZMQ en `tcp://127.0.0.1:5555` y consumo por `view_cameras_live.py` o por `ZMQCameraConfig`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos neuronales que servir.
- Latencia y throughput: la publicación de imágenes se fija en aproximadamente 30 Hz a 640 x 480 con ajuste de publicación existente. La frecuencia de paso de la simulación no está especificada en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Robot y cuerpo | Efectores finales | Camaras | Transporte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `davidwei79/unitree-g1-mujoco-brainco` | Fork experimental de entorno MuJoCo para LeRobot | Unitree G1, 29 motores corporales | `dex1`, `dex3`, `dummy`, `brainco` | Cabeza y ambas muñecas en `dex1`/`dex3`; solo cabeza en `dummy`/`brainco`; 640 x 480 a ~30 Hz por ZMQ | DDS Unitree SDK2/CycloneDDS + ZMQ | No disponible | HuggingFace, 0 descargas y 0 likes; requiere fijar commit |
| `lerobot/unitree-g1-mujoco` (base) | Entorno MuJoCo upstream en LeRobot | Unitree G1, 29 motores corporales | No disponible en la información extraída; es la base sobre la que se construye el fork | No disponible | DDS + ZMQ | No disponible | HuggingFace, commit `a38dc8617f0fca51b38e9354dc58ee35ad850fb5` |
| `google-deepmind/mujoco_menagerie` (`unitree_g1`) | Colección oficial de modelos MuJoCo | Unitree G1 bípedo con propiedades físicas y mecánica de articulaciones | No orientado a selección de efector final; incluye `scene_mjx.xml` para MJX | No aplica publicación de cámaras | No aplica | No disponible | GitHub y DeepWiki; modelo transferido a hardware en MuJoCo Playground |
| `Humanoid-Team-ISR-Lab/G1_BrainCo_hands_Digital_Twin_Mujoco` | Gemelo digital MuJoCo nativo DDS | Unitree G1, 29 grados de libertad corporales con manos diestras BrainCo | Manos BrainCo | No disponible | `rt/lowcmd`, `rt/lowstate` y `rt/brainco/*` | No disponible | GitHub |

## Limitaciones y advertencias

- No es una red neuronal ni un modelo de lenguaje: no genera texto, no razona, no soporta tool calling y no tiene benchmarks de MMLU, HumanEval o GSM8K.
- El autor califica el repositorio como fork experimental dentro de `davidwei79/unitree-g1-mujoco-brainco`; no es un lanzamiento upstream ni una certificación de hardware. Recomienda fijar un commit al cargarlo.
- La licencia no está declarada en la información disponible, por lo que el uso comercial queda sin determinar y debe aclararse con el autor antes de cualquier despliegue productivo.
- La variante `brainco` se apoya en una extensión local y en la rama correspondiente de LeRobot; el autor advierte explícitamente de que no constituye aceptación de la mano física ni reproducción de datasets. Debe leerse `BRAINCO.md` antes de usarla.
- Divergencia de límites entre simulación y URDF: la simulación usa -0,023 m y el URDF oficial -0,020 m. Solo `python build_gripper_model.py --official-limits` alinea ambos, dejando unos 5,88 mm entre almohadillas.
- El modelo no añade acciones de dedo al esquema de acción `UnitreeG1` de 29 motores corporales de LeRobot, lo que limita el control granular de la mano desde ese esquema.
- Las cámaras se publican en `tcp://127.0.0.1:5555` y requieren configuración explícita del cliente, igual que la cámara de cabeza; sin ella no se reciben imágenes.
- Los extrínsecos de las cámaras de muñeca se describen como aproximados, procedentes del generador de modelo HIW-500, lo que puede introducir error en tareas de percepción métrica.
- El smoke test en vivo exige dependencias reales de Gymnasium, Unitree SDK2 y ZMQ/OpenCV, y la suite aísla DDS con un doble de prueba, de modo que la cobertura de integración real depende de esas pruebas adicionales.
- Uso de la GPU condicionado al backend de renderizado (`MUJOCO_GL=egl`), sin cifras publicadas de rendimiento gráfico ni de escalado.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidwei79/unitree-g1-mujoco-brainco
- Modelo base en HuggingFace: https://huggingface.co/lerobot/unitree-g1-mujoco/tree/a38dc8617f0fca51b38e9354dc58ee35ad850fb5
- Documentación del Unitree G1 en MuJoCo Menagerie (DeepWiki): https://deepwiki.com/google-deepmind/mujoco_menagerie/2.2-unitree-g1
- Modelo `unitree_g1` en MuJoCo Menagerie (GitHub): https://github.com/google-deepmind/mujoco_menagerie/tree/main/unitree_g1
- Gemelo digital MuJoCo del G1 con manos BrainCo (GitHub): https://github.com/Humanoid-Team-ISR-Lab/G1_BrainCo_hands_Digital_Twin_Mujoco
- Documentación de modelos de robot en `unitree_mujoco` (DeepWiki): https://deepwiki.com/unitreerobotics/unitree_mujoco/5-robot-models
- Colección de datasets de agarre y manipulación del Unitree G1 BrainCo en HuggingFace: https://huggingface.co/collections/mindchain/unitree-g1-brainco-grasping-and-manipulation-data
