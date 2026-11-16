# limxdynamics/tron2-robot-description

## Resumen

TRON2 robot description es un paquete de descripciones cinematicas y visuales de robots, no un modelo de lenguaje. Lo publica LimX Dynamics dentro de su ecosistema abierto TRON2 y contiene los ficheros URDF, Xacro, MJCF (MuJoCo) y USD (Isaac Sim) de las dos revisiones de hardware TRON2A y TRON2B, cada una con ocho configuraciones (16 conjuntos de modelos en total). El repositorio incluye ademas las mallas STL (253 en TRON2A, 251 en TRON2B) y 40 ficheros USD por revision.

El paquete resuelve el problema de disponer de una descripcion coherente y mantenida de un robot humanoide multiforma para simulacion, visualizacion y desarrollo de control. Las variantes cubren desde brazos dobles con pinzas (14 grados de libertad actuados) hasta configuraciones hibridas de tipo centauro con 36 DoF, pasando por piernas con rueda, tobillo de planta y combinaciones de tren inferior y superior.

Es relevante porque permite a desarrolladores e investigadores montar entornos de simulacion reproducibles en ROS 1/2, MuJoCo e Isaac Sim sin tener que modelar el robot desde cero, y porque el repositorio se distribuye con licencia Apache 2.0 y se sincroniza desde GitHub. El tamano del repositorio es de 1,5 GB, dominado por las mallas y los assets USD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (paquete de descripcion de robot: URDF, Xacro, MJCF, USD) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en, zh (documentacion; README en ingles y README_zh-CN.md) |
| Licencia | Apache 2.0 |
| Formato de pesos | STL (mallas), URDF, Xacro, MJCF (XML de MuJoCo), USD |
| Variantes | 8 configuraciones x 2 revisiones de hardware (TRON2A y TRON2B) = 16 conjuntos |
| Grados de libertad actuados | 10 (WF, SF), 14 (DA), 16 (DACH), 18 (WFYG, SFYG), 26 (DASF), 36 (DASF2) |
| Mallas STL | 253 en TRON2A, 251 en TRON2B |
| Ficheros USD | 40 por revision |
| Tamano del repositorio | 1,5 GB |
| Libreria declarada | limx-dynamics |
| Pipeline | robotics |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una jerarquia de descripciones fisicas. Cada variante se define mediante un arbol de enlaces y articulaciones con masas, inercias y geometrias de colision, exportado a cuatro formatos: URDF para ROS, Xacro para composicion parametrica, MJCF para MuJoCo y USD para Isaac Sim. Las variantes DASF y DASF2 combinan la descripcion del tren inferior SF con la del tren superior DACH mediante el enlace `transition_upper_Link`, generando un humanoide apilado con una IMU por segmento corporal.

La revision TRON2A incluye Xacro y define el cero de las articulaciones segun la calibracion de fabrica del robot real; TRON2B elimina Xacro y autora URDF y MJCF directamente, con el cero en una pose de rodillas hacia delante. La variante DASF2 no dispone de Xacro en TRON2A. El sufijo YG indica un conjunto periferico de tren superior mas rico (brazos, manos y enlaces accesorios); en TRON2B estos modelos incorporan un kit de sensores actualizado. No se documentan procesos de entrenamiento, datasets ni tecnicas de optimizacion porque no aplican a un paquete de descripcion.

## Capacidades

- Descripcion cinematica completa de 16 configuraciones de robot con masas, inercias y geometrias de colision.
- Carga directa en ROS 1 y ROS 2 mediante URDF y paquetes Xacro.
- Simulacion fisica en MuJoCo a partir de los ficheros MJCF.
- Simulacion y renderizado en Isaac Sim mediante los assets USD.
- Composicion parametrica de variantes con Xacro en TRON2A (tren inferior, tren superior y perifericos).
- Soporte de configuraciones de manipulacion movil: brazos dobles con pinzas, cabeza de 2 DoF (yaw/pitch), piernas con rueda y tobillo de planta.
- Definicion de marcos de IMU por segmento corporal en las variantes apiladas DASF y DASF2.
- Visualizacion de mallas STL para renderizado y depuracion de colisiones.
- Documentacion bilingue (ingles y chino) y manifiesto de assets en `ASSETS.md`.

## Casos de uso

- Simulacion de control de cuerpo completo en MuJoCo: cargar el MJCF de la variante DASF (26 DoF) para entrenar o evaluar politicas de locomocion y manipulacion con un humanoide apilado, aprovechando las IMU por segmento.
- Desarrollo de stacks ROS 2: integrar el URDF de `DACH_TRON2A` en un paquete `robot_description` para publicar TF, visualizar en RViz y validar cinematica inversa antes de desplegar en hardware.
- Entrenamiento de politicas con aprendizaje por refuerzo en Isaac Sim: usar los USD de `WFYG_TRON2A` (18 DoF) para crear escenas con fisica GPU y perifericos de tren superior.
- Validacion de algoritmos de planificacion de movimiento: emplear las variantes `DA` (14 DoF) y `DACH` (16 DoF) para probar planificadores de brazo doble con y sin cabeza actuada.
- Investigacion en robots con ruedas y patas: la variante `WF` (10 DoF, rodilla mas rueda) sirve para estudiar control hibrido de locomocion sobre terreno plano y escaleras.
- Verificacion de colisiones y envelopes de trabajo: cargar las mallas STL y las geometrias de colision en herramientas de analisis para comprobar alcance y autocolision antes de montar el robot fisico.
- Docencia y prototipado: disponer de 16 variantes con la misma jerarquia de ficheros permite comparar disenos de tren inferior y superior en un curso de robotica sin modelar cada uno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un paquete de descripcion de robot, no procede evaluar MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- No requiere GPU para cargar URDF o Xacro en ROS; el coste depende de la herramienta de visualizacion (RViz funciona en CPU).
- MuJoCo puede ejecutarse en CPU para simulaciones de baja frecuencia; para entrenamiento masivo conviene GPU (por ejemplo, una RTX 4090 o A100) con `mjx` o con Isaac Sim.
- Isaac Sim requiere GPU NVIDIA con soporte RTX; no se especifican modelos minimos en la informacion disponible.
- El repositorio ocupa 1,5 GB, por lo que conviene disponer de al menos 3-5 GB libres para clonar, descomprimir y generar artefactos derivados.
- Despliegue: ROS 1/2 (`robot_state_publisher`, RViz), MuJoCo, Isaac Sim y herramientas que consuman USD.
- Latencia y throughput: no disponibles; dependen del simulador, del numero de DoF y del paso de integracion elegido.

## Comparativa con modelos similares

| Paquete | Tipo | Variantes | Formatos | Licencia |
|---|---|---|---|---|
| limxdynamics/tron2-robot-description | Descripcion de robot humanoide multiforma | 16 (8 x 2 revisiones) | URDF, Xacro, MJCF, USD | Apache 2.0 |
| Descripciones de humanoides de otros fabricantes | Descripcion de robot | no disponible | URDF, MJCF | variable, a menudo restrictiva |
| Modelos de robot genericos de la comunidad (por ejemplo, Unitree) | Descripcion de robot | no disponible en la informacion proporcionada | URDF, MJCF | variable |

No se dispone de datos comparativos de rendimiento porque ninguno de los paquetes comparables publica metricas equivalentes en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni predicciones; cualquier expectativa de inferencia es incorrecta.
- El cero de las articulaciones difiere entre revisiones: TRON2A usa la calibracion de fabrica y TRON2B una pose de rodillas hacia delante; mezclar ficheros de ambas ramas produce resultados inconsistentes.
- TRON2B no incluye Xacro y DASF2 de TRON2A tampoco, por lo que la composicion parametrica no esta disponible en esos casos.
- Los renders de `docs/images/` solo cubren TRON2A; en TRON2B los modelos YG llevan un kit de sensores actualizado que no se refleja en esas imagenes.
- Las mallas STL y los USD pueden no coincidir exactamente con el robot fisico en tolerancias de colision; conviene validar antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una unica revision publicada; no hay historial de mantenimiento verificable en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni soporte; las consultas de colaboracion se dirigen a opensource@limxdynamics.com.
- La documentacion esta en ingles y chino; no hay version en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/tron2-robot-description
- Repositorio GitHub: https://github.com/limxdynamics/tron2-robot-description
- README en chino: https://github.com/limxdynamics/tron2-robot-description/blob/main/README_zh-CN.md
- Manifiesto de assets: https://github.com/limxdynamics/tron2-robot-description/blob/main/ASSETS.md
- Inicio rapido TRON2: https://github.com/limxdynamics/limxdynamics/blob/main/doc/quickstart.md#tron2
- Organizacion en Hugging Face: https://huggingface.co/limxdynamics
- MuJoCo: https://mujoco.org/
- Isaac Sim: https://developer.nvidia.com/isaac/sim
- Contacto: opensource@limxdynamics.com
