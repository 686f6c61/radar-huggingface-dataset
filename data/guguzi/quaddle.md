# guguzi/quaddle

## Resumen

Quaddle es un fichero de descripcion de robot en formato URDF (Unified Robot Description Format) publicado por el usuario guguzi en HuggingFace bajo el identificador `guguzi/quaddle`. No se trata de un modelo de inteligencia artificial en el sentido habitual (no es una red neuronal, no tiene pesos entrenados ni parametros), sino de un modelo geometrico y cinematico de un robot cuadrupedo real: el kit Quaddle de Petoi, un cuadrupedo omnidireccional de 4 servomotores orientado a aprendizaje de IA fisica. El repositorio contiene un unico fichero `robot.urdf` y un directorio `assets/` con las mallas STL referenciadas mediante URIs `package://assets/*.stl`.

El modelo describe 46 links y 45 joints (16 revolute, 8 continuos y 21 fijos), organizados en un link central `body` y cuatro ensamblajes de pata identicos (`left_front`, `right_front`, `right_back`, `left_back`). Cada pata combina un joint de cadera actuado (`<side>_thigh`, revolute) con un mecanismo pasivo de cuatro barras (`<side>_motor_arm`, `<side>_leg`, `<side>_spring`, tambien revolute) que convierte la rotacion de un unico servo en el movimiento completo de la pata, incluyendo la elevacion de rodilla. En el extremo de cada pata hay dos joints continuos (`<side>_wheel`, `<side>_wheel_tip`) que actuan como punta rodante y habilitan el desplazamiento omnidireccional.

Su relevancia es practica y acotada: es la representacion canonica necesaria para simular, visualizar, planificar control o validar la cinematica del robot antes de disponer del hardware fisico. El kit Quaddle se comercializa desde 99 USD y su entrega esta prevista para principios de diciembre de 2026, por lo que este URDF es el recurso publico de referencia para trabajar con el robot en simulacion desde ya. El repositorio tiene 0 descargas y 0 likes, y ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Descripcion cinematica URDF (XML) de un robot cuadrupedo; no es una red neuronal ni un modelo de lenguaje |
| Parametros totales | No aplica (no es un modelo con pesos); 46 links y 45 joints en la descripcion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (los metadatos de HuggingFace no declaran idiomas; la model card esta en ingles) |
| Licencia | MIT |
| Formato de pesos | No aplica. Formato de la descripcion: URDF (XML) en `robot.urdf`; geometria visual en mallas STL dentro de `assets/` |

## Arquitectura y entrenamiento

El "modelo" es un arbol cinematico URDF puro, sin fase de entrenamiento. La jerarquia parte de un link raiz `body` al que se conectan cuatro patas identicas construidas con el mismo patron de joints. El joint actuado por pata es `<side>_thigh` (tipo revolute), que une el ensamblaje de la pata al cuerpo; cada pata dispone por tanto de un unico servo de cadera. El resto del movimiento se resuelve mecanicamente: `<side>_motor_arm`, `<side>_leg` y `<side>_spring` forman un mecanismo pasivo de cuatro barras que transforma la rotacion del servo de cadera en el ciclo completo de elevacion y extension de la pata (el diseno "retro-mecanico" de Petoi, que evita un actuador de rodilla independiente). En la punta, los joints continuos `<side>_wheel` y `<side>_wheel_tip` permiten el rodado y, con ello, la locomocion omnidireccional (caminar, desplazarse lateralmente y girar sobre el propio eje) sin actuadores adicionales.

El fichero se distribuye como URDF "desnudo": no incluye `package.xml` ni `CMakeLists.txt` de ROS, y toda la geometria visual se declara con URIs `package://assets/...`. Los links `<side>_knee`, `<side>_foot`, `body_collision` y los `closing_*` son marcos ficticios de masa cero usados para geometria de colision y cierre de lazos cinematicos, no piezas fisicas del robot. El firmware de referencia del robot es OpenCat de Petoi; no se documenta en el repositorio ningun procedimiento de entrenamiento, dataset ni ajuste por RLHF/DPO, porque no aplica a este tipo de artefacto.

## Capacidades

- Descripcion cinematica completa del cuadrupedo Quaddle: 46 links, 45 joints (16 revolute, 8 continuos, 21 fijos) con jerarquia cuerpo-mas-cuatro-patas.
- Modelado del mecanismo pasivo de cuatro barras por pata, que refleja como un solo servo de cadera produce el ciclo de marcha con elevacion de rodilla.
- Representacion de locomocion omnidireccional mediante joints continuos en la punta de cada pata.
- Definicion de geometria de colision (links `body_collision` y marcos fijos asociados) para simulacion fisica.
- Visualizacion tridimensional mediante mallas STL referenciadas por URI, compatible con visores URDF una vez resueltas las rutas.
- Integracion con el ecosistema ROS/ROS 2 y con herramientas Python de carga de URDF.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, capacidades de agente ni soporte multilingue: no es un modelo fundacional.

## Casos de uso

- Visualizacion y validacion de la cinematica antes de comprar hardware: cargando `robot.urdf` en RViz o en un visor Python se comprueba el rango de los joints, la jerarquia de links y la coherencia del mecanismo de cuatro barras sin necesidad de tener el robot fisico, algo especialmente util dado que las entregas del kit estan previstas para diciembre de 2026.
- Desarrollo de controladores de marcha en simulacion: el arbol de joints actuados (`<side>_thigh`) y pasivos permite implementar y depurar generadores de trayectorias o politicas de control para los 4 servos antes de desplegarlas en el firmware OpenCat.
- Educacion STEM y docencia de robotica: es un ejemplo didactico compacto de URDF con joints revolute, continuos y fijos, lazos pasivos y marcos de colision, adecuado para practicas de cinematica directa e inversa en asignaturas de robotica.
- Gemelo digital y teleoperacion con control por poses: la model card enlaza una demo de teleoperacion controlada por poses, de modo que el URDF sirve como base del gemelo digital que refleja en pantalla el estado del robot real o de una politica aprendida.
- Integracion en pipelines de CI para validar cambios de descripcion: al ser un unico fichero de texto versionable, se puede parsear automaticamente en cada commit para detectar joints mal formados, links huerfanos o rutas de malla rotas.
- Generacion de escenas y datasets sinteticos: en simuladores que aceptan URDF (ROS 2, Gazebo, PyBullet, MuJoCo previa conversion) el modelo puede instanciarse como actor para experimentar con percepcion y planificacion, teniendo en cuenta que el URDF no define sensores.
- Prototipado de algoritmos de locomocion omnidireccional: los joints continuos de la punta de pata permiten estudiar estrategias de walk, strafe y giro en el sitio sin anadir actuadores, que es precisamente la propuesta del diseno Quaddle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una descripcion URDF y no de un modelo de aprendizaje automatico, las metricas habituales (MMLU, HumanEval, GSM8K, etc.) no son aplicables. Tampoco se proporcionan datos de tiempo de carga, numero de triangulos de las mallas ni latencia de visualizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: ninguna. La carga y visualizacion del URDF es una tarea de CPU; cualquier GPU integrada sirve para renderizar si el visor la usa.
- Cabe en cualquier equipo de consumo: el repositorio completo ocupa 0,1 GB, por lo que la memoria RAM necesaria es inferior a 1 GB en la practica totalidad de visores.
- Opciones de despliegue: ROS 2 con `ros2 launch urdf_tutorial display.launch.py model:=robot.urdf`; visores Python standalone como `yourdfpy` (`pip install yourdfpy`; `python3 -c "import yourdfpy; yourdfpy.URDF.load('robot.urdf').show()"`) o `urdfpy`; RViz; y en general cualquier visor compatible con URDF, incluidos simuladores previa conversion (PyBullet, Gazebo, MuJoCo). El robot fisico se ejecuta con el firmware OpenCat.
- Requisito critico de rutas: al usar URIs `package://assets/...`, las herramientas que no resuelvan ese esquema necesitan una entrada en `ROS_PACKAGE_PATH` que mapee `assets` al directorio del repositorio, o bien reescribir las rutas a rutas relativas planas (`assets/...`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con otras descripciones URDF de cuadrupedos. A continuacion se indican las alternativas conceptualmente comparables y los campos que quedan sin dato.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guguzi/quaddle (este repositorio) | 46 links, 45 joints | no aplica | no disponible | MIT | Publico en HuggingFace, 0 descargas |
| Descripciones URDF de otros cuadrupedos de Petoi (por ejemplo, la linea Bittle, cuyo firmware OpenCat se enlaza desde la model card) | no disponible | no aplica | no disponible | no disponible | Repositorio OpenCat de Petoi en GitHub |
| Descripciones URDF de cuadrupedos de investigacion o comerciales (Unitree, Boston Dynamics, etc.) | no disponible | no aplica | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje y no puede usarse para tareas de inferencia. Cualquier expectativa de ese tipo sobre este repositorio es un error de categoria.
- El URDF es "desnudo": no incluye `package.xml` ni `CMakeLists.txt`, por lo que no es un paquete ROS instalable y requiere configuracion manual de rutas para resolver las URIs `package://`.
- Los visores genericos y las librerias Python (`yourdfpy`, `urdfpy`) pueden fallar al cargar las mallas si no se ajusta `ROS_PACKAGE_PATH` o no se reescriben las rutas de los STL a rutas relativas.
- No se documentan propiedades dinamicas verificadas experimentalmente: la model card no detalla masas, matrices de inercia, limites de esfuerzo ni coeficientes de friccion, por lo que la fidelidad de una simulacion fisica depende de esos valores tal como aparezcan en el fichero y no de una validacion publicada.
- Los joints `<side>_knee`, `<side>_foot`, `body_collision` y `closing_*` son marcos de masa cero para colision y cierre de lazos, no piezas reales; interpretarlos como partes fisicas lleva a modelos erroneos.
- El repositorio no declara idiomas soportados y la model card esta unicamente en ingles.
- Riesgo de sesgo y de alucinacion: no aplica a este artefacto, al no haber componente generativo.
- La licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; conviene conservar el fichero `LICENSE` incluido en el repositorio.
- Advertencia de disponibilidad del hardware: el kit Quaddle esta en campana de Kickstarter con entrega prevista para principios de diciembre de 2026, de modo que el URDF puede describir una revision del producto que cambie antes de la produccion en serie.
- Sin mantenimiento ni traccion demostrada: 0 descargas y 0 likes, creado y actualizado el 2026-09-10, con una unica revision registrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/guguzi/quaddle
- Simulador del robot Quaddle (Petoi): https://www.petoi.com/pages/quaddle-robot-simulator
- Video de demostracion (marcha y teleoperacion por poses): https://www.youtube.com/watch?v=8U3mROh88vQ
- Firmware OpenCat para el cuadrupedo (PetoiCamp): https://github.com/PetoiCamp/OpenCatEsp32-Quadruped-Robot/
- Campana de Kickstarter del kit Quaddle: https://www.kickstarter.com/projects/petoi/quaddle-open-source-desktop-robot-kit
- Fichero de licencia MIT incluido en el repositorio: `LICENSE` (referenciado en la model card)
- Resultados de busqueda web: no se ha recuperado ningun enlace relevante sobre este modelo; los resultados devueltos no guardan relacion con el repositorio.
