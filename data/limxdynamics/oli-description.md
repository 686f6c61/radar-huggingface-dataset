# limxdynamics/oli-description

## Resumen

`limxdynamics/oli-description` no es un modelo de inteligencia artificial, sino un repositorio de descripciones cinemáticas y dinámicas del robot humanoide LimX Oli (referencia de hardware HU_D04) desarrollado por LimX Dynamics. Contiene los ficheros URDF, MJCF (MuJoCo) y USD (Isaac Sim) junto con las mallas tridimensionales asociadas, de modo que el robot puede simularse, visualizarse y entrenarse en los principales entornos de robótica sin necesidad de reconstruir el modelo desde cero.

El repositorio está etiquetado en Hugging Face con `pipeline_tag: robotics` y `library_name: limx-dynamics`, y es un espejo del repositorio GitHub `limxdynamics/humanoid-description`. Su relevancia es práctica para quien trabaje en control de humanoides, sim-to-real o aprendizaje por refuerzo: proporciona el modelo real del hardware con parámetros de actuador auténticos y una modelización de las articulaciones de tobillo y cintura mediante enlaces paralelos cerrados, en lugar de una aproximación serie idealizada.

El repositorio incluye tres configuraciones de hardware (cuerpo base de 31 grados de libertad, versión con pinza de 39 articulaciones y versión con mano diestra de 53 articulaciones) y, según la model card, un modelo heredado HU_D03 descatalogado. El tamaño del repositorio es de aproximadamente 0,2 GB, dominado por las mallas y los ficheros USD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica (descripción de robot: URDF / MJCF / USD) |
| Parámetros totales | No disponible (no es un modelo neuronal) |
| Parámetros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No aplica |
| Idiomas soportados | en, zh (documentación de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | URDF, MJCF (XML), USD, mallas asociadas |

| Parámetro específico del robot | Valor |
|---|---|
| Modelo de hardware | LimX Oli HU_D04 (variante `HU_D04_01`) |
| Grados de libertad del cuerpo base | 31 (piernas, cintura de 3 DoF, brazos de 7 DoF, cabeza de 2 DoF) |
| Variante con pinza | 39 articulaciones (35 independientes) |
| Variante con mano diestra | 53 articulaciones (43 independientes), mano de 11 articulaciones |
| Actuadores en MJCF | 31 actuadores de par |
| Sensores en MJCF | 65 sensores, incluida IMU (orientación, giroscopio, acelerómetro) |
| Formatos disponibles por variante | Base: URDF, MJCF, USD; pinza y mano: URDF, USD |
| Tamaño del repositorio | ~0,2 GB |

## Arquitectura y entrenamiento

El contenido no corresponde a una red neuronal, sino a la descripción formal del robot. El MJCF modela los tobillos y la cintura mediante sus enlaces reales de empuje A/B (push-rod), cerrados con restricciones de igualdad (`equality constraints`) en MuJoCo, en lugar de recurrir a una cadena serie aproximada. Esta fidelidad es determinante para la transferencia sim-to-real, porque reproduce la cinemática cerrada del hardware.

El SRDF incluye, según la model card, la inercia del rotor y la relación de transmisión de cada articulación, datos necesarios para simular con precisión la dinámica de los actuadores. El fichero USD está organizado en capas separadas (base, física y sensores) para integrarse en Isaac Sim, y la versión MJCF se entrega con 31 actuadores de par, una IMU y 65 sensores. No hay información sobre datos de entrenamiento porque no existe fase de entrenamiento asociada a este repositorio.

## Capacidades

- Simulación física completa del humanoide HU_D04 en MuJoCo mediante `HU_D04_01.xml` (actuadores, sensores y enlaces cerrados), con una variante ligera `HU_D04_01_vis.xml` solo para visualización.
- Visualización e integración en ROS 1 (catkin) y ROS 2 (colcon) mediante paquetes `HU_D0x_description` y RViz.
- Carga directa en NVIDIA Isaac Sim e Isaac Lab a partir del fichero `HU_D04_01.usd` y sus capas de configuración.
- Modelización de tobillos y cintura con enlaces paralelos reales para sim-to-real.
- Variantes de efector final: pinza y mano diestra de 11 articulaciones.
- Datos de actuador (inercia de rotor y relación de transmisión) por articulación vía SRDF.
- No incluye capacidades de generación de texto, visión, razonamiento ni tool calling: es un artefacto de descripción de robot.

## Casos de uso

- Entrenamiento de políticas de locomoción por refuerzo en Isaac Lab: se importa el USD y se entrena al humanoide con las 31 articulaciones del cuerpo base, aprovechando la física por capas y los sensores incluidos.
- Validación cruzada en MuJoCo antes de desplegar: se simula la misma política con `HU_D04_01.xml` para comprobar que los enlaces cerrados de tobillo y cintura no rompen el controlador.
- Sim-to-real en hardware LimX Oli: el SRDF con inercia de rotor y relación de transmisión permite ajustar los controladores de bajo nivel al robot físico con mayor fidelidad.
- Desarrollo de controladores ROS 1/ROS 2: los paquetes `HU_D0x_description` permiten publicar el estado de articulaciones y visualizar el robot en RViz dentro de un pipeline existente.
- Investigación en manipulación con mano diestra: la variante de 53 articulaciones (43 independientes) sirve para estudiar agarres multidimensionales y planificación de dedos.
- Docencia y prototipado rápido: con `pip install mujoco` y el visor se inspecciona el robot en menos de un minuto, lo que facilita demostraciones y pruebas de cinemática.
- Integración en gemelos digitales: el USD se referencia en un stage de Isaac Sim para supervisión y validación de trayectorias antes de ejecutarlas en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un repositorio de descripción de robot y no de un modelo de IA, no aplican métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No requiere GPU para la carga del modelo en sí; el coste depende del simulador.
- MuJoCo: ejecutable en CPU para visualización y simulación básica; GPU opcional para renderizado acelerado.
- Isaac Sim / Isaac Lab: requiere GPU NVIDIA con RTX (por ejemplo, RTX 4090, A100 o H100 según la carga de entrenamiento) y drivers compatibles.
- ROS 1/ROS 2: funciona en CPU; RViz puede requerir aceleración gráfica para escenas complejas.
- Almacenamiento: alrededor de 0,2 GB para el repositorio completo, y se recomienda clonar con `--depth 1` porque el historial con mallas y USD es voluminoso.
- Despliegue: MuJoCo (`python -m mujoco.viewer --mjcf=...`), Isaac Sim (apertura directa del USD), ROS 1 (`catkin_make`) y ROS 2 (`colcon build`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Grados de libertad | Formatos | Licencia |
|---|---|---|---|---|
| limxdynamics/oli-description (HU_D04) | Descripción de humanoide | 31 / 39 / 53 según variante | URDF, MJCF, USD | Apache 2.0 |
| limxdynamics/humanoid-description (GitHub, origen) | Descripción de humanoide | Idénticos (es el mismo contenido) | URDF, MJCF, USD | Apache 2.0 |
| Otros repositorios de descripción de humanoides | No disponible en la información proporcionada | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de visión: no admite inferencia de texto, código, matemáticas ni tool calling.
- El MJCF solo está disponible para el cuerpo base HU_D04; las variantes con pinza y con mano diestra únicamente se distribuyen en URDF y USD.
- El modelo HU_D03 está descatalogado y sin mantenimiento; la propia model card recomienda usar HU_D04 en proyectos nuevos.
- La modelización de enlaces paralelos con restricciones de igualdad puede incrementar el coste computacional y la rigidez numérica de la simulación en MuJoCo.
- La fidelidad sim-to-real depende de que los parámetros del SRDF (inercia de rotor, relación de transmisión) coincidan con la unidad física concreta.
- El repositorio es un espejo de GitHub; posibles actualizaciones o correcciones pueden llegar con retraso respecto al origen.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero `LICENSE` y las condiciones de las mallas y recursos incluidos.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas porque no aplican a este tipo de artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/oli-description
- Repositorio GitHub de origen: https://github.com/limxdynamics/humanoid-description
- Guía de inicio rápido de Oli: https://github.com/limxdynamics/limxdynamics/blob/main/doc/quickstart.md#oli
- Comunidad de desarrolladores (WeChat): https://github.com/limxdynamics/limxdynamics/blob/main/doc/wechat_qr.png
- Contacto para colaboración: opensource@limxdynamics.com
- Descarga rápida: `hf download limxdynamics/oli-description`
