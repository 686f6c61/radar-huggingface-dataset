# limxdynamics/luna-description

## Resumen

`limxdynamics/luna-description` no es un modelo de IA generativa, sino un paquete de descripciones de robot para el humanoide LimX Luna (referencia HU_L04) desarrollado por LimX Dynamics. Contiene los ficheros URDF, MuJoCo MJCF y NVIDIA USD, junto con las mallas STL, necesarios para cargar el robot en ROS 1/2, MuJoCo, Gazebo e Isaac Sim / Isaac Lab. El repositorio actúa como espejo del proyecto en GitHub y se publica bajo licencia Apache 2.0.

El robot descrito es un humanoide de cuerpo completo con 27 articulaciones actuadas: 6 por pierna, 3 en la cintura, 2 en la cabeza y 5 por brazo. Un detalle técnico relevante es que los tobillos y la cintura se accionan mediante mecanismos de paralelogramo (parallel linkages), que el MJCF modela con restricciones de igualdad (`equality`) y la variante `usd_parallel/` reproduce como bucles cerrados reales.

Es relevante para equipos que trabajen en robótica humanoide, simulación física, aprendizaje por refuerzo o retargeting de movimiento, porque ofrece una descripción coherente del mismo robot para varios simuladores y con sensores y actuadores ya definidos en el MJCF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (paquete de descripcion de robot: URDF, MJCF, USD, mallas STL) |
| Parametros totales | No aplica (27 articulaciones actuadas) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh (documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | URDF + SRDF, MuJoCo MJCF (XML), NVIDIA USD, mallas STL |

## Arquitectura y entrenamiento

No se trata de una red neuronal, sino de una descripcion cinematica y dinamica de un robot. La estructura de articulaciones es: piernas con 6 DoF por lado (`hip_pitch`, `hip_roll`, `hip_yaw`, `knee`, `ankle_pitch`, `ankle_roll`), cintura con 3 DoF (`waist_yaw`, `waist_roll`, `waist_pitch`), cabeza con 2 DoF (`head_yaw`, `head_pitch`) y brazos con 5 DoF por lado (`shoulder_pitch`, `shoulder_roll`, `shoulder_yaw`, `elbow`, `wrist_yaw`). Los joints de piernas y brazos llevan prefijo `left_` / `right_`.

El paquete incluye tres representaciones del mismo robot. El URDF (con SRDF asociado, que anade `rotor_mass` y `gear_ratio` por articulacion) y el USD de `usd/` usan una aproximacion serie, ya que URDF no puede representar bucles cinematicos cerrados. El MJCF `HU_L04_01.xml` modela los paralelogramos de tobillo y cintura con 6 restricciones `<connect>` en `<equality>` (dos por tobillo y dos para la cintura) e incorpora 27 actuadores y sensores de posicion y velocidad articular mas una IMU de base (orientacion, giroscopio, acelerometro). La variante `HU_L04_01_vis.xml` es solo cinematica, pensada para retargeting de movimiento, y `usd_parallel/` reproduce los bucles cerrados reales para Isaac Lab. No hay datos de entrenamiento ni proceso de RLHF/DPO porque no es un modelo aprendido.

## Capacidades

- Carga del robot en ROS 1 y ROS 2 mediante URDF/SRDF.
- Simulacion dinamica en MuJoCo con actuadores, sensores de posicion/velocidad y IMU ya definidos.
- Simulacion en NVIDIA Isaac Sim e Isaac Lab mediante USD, con variante de bucles cerrados.
- Simulacion en Gazebo mediante el mundo `empty_world.world` incluido.
- Retargeting de movimiento con la variante cinematica `HU_L04_01_vis.xml`.
- Modelado fiel de mecanismos de paralelogramo en tobillos y cintura (MJCF con `equality`, USD cerrado).
- Metadatos de transmision por articulacion (`rotor_mass`, `gear_ratio`) para modelar la dinamica de los actuadores.
- Documentacion bilingue en ingles y chino.

## Casos de uso

- Entrenamiento de politicas de locomocion con RL: el MJCF incluye 27 actuadores y sensores de posicion/velocidad e IMU, lo que permite definir observaciones y acciones directamente sin construir el modelo desde cero.
- Simulacion de cuerpo completo en Isaac Lab: la variante `usd_parallel/` modela los paralelogramos como bucles cerrados reales, necesaria para politicas que dependan de la dinamica correcta de tobillo y cintura.
- Retargeting de movimiento humano a robot: `HU_L04_01_vis.xml` es una variante solo cinematica que agiliza el ajuste de trayectorias sin coste de dinamica.
- Integracion en pilas ROS existentes: el URDF y el SRDF con `rotor_mass` y `gear_ratio` permiten usar controladores ROS y herramientas de visualizacion (RViz) con el modelo del Luna.
- Validacion de controladores de bajo nivel: los coeficientes de transmision del SRDF permiten simular el comportamiento de los actuadores antes de desplegar en hardware.
- Docencia y prototipado en robotica humanoide: un unico repositorio con URDF, MJCF y USD permite comparar el mismo robot en varios simuladores y estudiar el efecto de modelar o no los bucles cerrados.
- Pruebas de percepcion y planificacion en Gazebo: el mundo `empty_world.world` sirve como base para escenarios de navegacion y manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un paquete de descripcion de robot, no aplican metricas de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No requiere GPU para su uso basico: el visor de MuJoCo funciona en CPU (`python -m mujoco.viewer --mjcf=HU_L04_description/xml/HU_L04_01.xml`).
- Isaac Sim e Isaac Lab requieren GPU NVIDIA; no se especifican modelos minimos en la informacion disponible.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Opciones de despliegue: MuJoCo, ROS 1/2, Gazebo, NVIDIA Isaac Sim / Isaac Lab.
- Latencia y throughput: no disponible.
- Tamano del repositorio: 0,3 GB (incluye mallas STL).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras descripciones de robots humanoides comparables con las que establecer una comparativa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni realiza inferencia; cualquier uso como modelo linguistico es un error de categoria.
- El URDF y el USD de `usd/` usan una aproximacion serie de tobillos y cintura; no reproducen los bucles cerrados. Para dinamica fiel hay que usar el MJCF o `usd_parallel/`.
- El repositorio es un espejo del proyecto en GitHub; la version en Hugging Face puede quedar desincronizada respecto al repositorio original.
- Solo hay documentacion en ingles y chino; no se garantiza soporte en castellano.
- No se documentan sesgos ni riesgo de alucinacion por no ser un modelo aprendido.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; conviene revisar el fichero LICENSE del repositorio para los terminos exactos.
- Para soporte, incidencias o colaboracion, el contacto indicado es opensource@limxdynamics.com.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/luna-description
- Repositorio GitHub (origen): https://github.com/limxdynamics/luna-description
- Quick start del ecosistema Luna: https://github.com/limxdynamics/limxdynamics/blob/main/doc/quickstart.md#luna
- Pagina del producto LimX Luna: https://www.limxdynamics.com/en/products/luna
- Especificaciones del producto: https://www.limxdynamics.com/en/products/luna/spec
- Comunidad WeChat: https://github.com/limxdynamics/limxdynamics/blob/main/doc/wechat_qr.png
