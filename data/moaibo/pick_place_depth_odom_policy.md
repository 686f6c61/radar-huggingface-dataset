# MoAIBo/pick_place_depth_odom_policy

## Resumen

El modelo `MoAIBo/pick_place_depth_odom_policy` es una política robótica de visión-lenguaje-acción (VLA) basada en [SmolVLA](https://huggingface.co/papers/2506.01844), un modelo compacto y eficiente diseñado para ejecutar tareas de manipulación en robots con recursos computacionales limitados. Ha sido fine-tuneado por el usuario MoAIBo a partir del modelo base `lerobot/smolvla_base` utilizando el framework LeRobot, con el objetivo de resolver tareas de pick-and-place en un robot móvil con brazo (tipo `so101_tb4`). El modelo procesa observaciones de cinco cámaras (incluida una cámara de profundidad) junto con el estado del robot, y genera acciones de control de 8 dimensiones.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, esta política está pensada para desplegarse en hardware de consumo, lo que la hace accesible para laboratorios de investigación y desarrolladores de robótica. Su licencia Apache 2.0 permite uso comercial sin restricciones. El modelo fue entrenado sobre un conjunto de datos propio de 26 episodios (34 129 frames a 30 FPS) que cubre dos variantes de una tarea de recogida y colocación de objetos con distinción de color. Aunque no se han publicado resultados de evaluación, su arquitectura eficiente y su enfoque en una tarea concreta lo convierten en un candidato interesante para experimentación y prototipado en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer compacto) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de accion, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo de control robotico, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una familia de modelos VLA compactos que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. La arquitectura exacta se describe en el paper [2506.01844](https://arxiv.org/abs/2506.01844), pero se caracteriza por su eficiencia computacional, permitiendo inferencia en GPUs de consumo. Este modelo concreto es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `MoAIBo/pick_place_depth_odom`, que contiene 26 episodios de una tarea de manipulación con dos variantes (objeto amarillo o azul). El entrenamiento se realizó con 50 000 pasos, batch size de 13, optimizador AdamW y learning rate de 0,0001, utilizando LeRobot versión 0.6.0. No se especifican detalles sobre el preentrenamiento del modelo base, pero el fine-tuning se centra en adaptar el modelo a la tarea concreta de pick-and-place con percepción de profundidad.

## Capacidades

- Generacion de acciones de control robotico de 8 dimensiones (posicion, orientacion y posiblemente velocidad) a partir de observaciones visuales y de estado.
- Percepcion multimodal con cinco camaras: `camera_left`, `camera_right`, `camera_wrist`, `camera_d455` y `depth`, todas con resolucion 360x640.
- Ejecucion de tareas de manipulacion de objetos en un entorno estructurado (recoger un objeto de una caja y colocarlo en un plato).
- Manejo de dos variantes de la tarea diferenciadas por el color del objeto (amarillo o azul).
- Inferencia en tiempo real (30 FPS) gracias a su tamano compacto.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio o almacenes: el modelo puede controlar un robot movil con brazo para recoger objetos de contenedores y colocarlos en posiciones designadas, reduciendo la intervencion humana en tareas repetitivas.
- Prototipado rapido de politicas robotica: gracias a su tamano reducido y su integracion con LeRobot, es adecuado para validar algoritmos de aprendizaje por imitacion en hardware de bajo coste antes de escalar a modelos mas grandes.
- Investigacion en VLA eficientes: al ser un fine-tuning de SmolVLA, sirve como punto de partida para estudiar el equilibrio entre rendimiento y coste computacional en modelos de vision-lenguaje-accion.
- Despliegue en robots moviles con recursos limitados: el modelo puede ejecutarse en una GPU de consumo (por ejemplo, una RTX 3060 o superior), lo que permite su uso en robots autonomos sin necesidad de servidores dedicados.
- Educacion y formacion en robotica: al estar publicamente disponible con licencia Apache 2.0, puede utilizarse en cursos y talleres para ensenar tecnicas de aprendizaje por imitacion y control robotico.
- Desarrollo de sistemas de manipulacion con percepcion de profundidad: la inclusion de una camara de profundidad en las observaciones permite experimentar con tareas que requieren estimacion de distancia y geometria del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se proporcionan resultados de evaluacion en robot real. Por tanto, no es posible comparar cuantitativamente este modelo con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion. Dado el tamano de 450 millones de parametros, se estima que en FP32 requiere al menos 1,8 GB de VRAM solo para los pesos, pero la inferencia completa con multiples imagenes puede necesitar entre 4 y 8 GB. Se recomienda una GPU con al menos 8 GB de VRAM para operar comodamente.
- GPU recomendadas: cualquier GPU moderna de NVIDIA con soporte CUDA y al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070, o superiores). Tambien puede ejecutarse en GPUs de datacenter como A100 o H100 si se dispone de ellas.
- Compatibilidad con consumer GPU: si, el modelo esta disenado para hardware de consumo.
- Opciones de despliegue: el modelo se utiliza principalmente a traves de LeRobot, que proporciona scripts de rollout y entrenamiento. Tambien puede integrarse en pipelines personalizados de PyTorch.
- Latencia y throughput: no se proporcionan datos especificos, pero al operar a 30 FPS en el dataset de entrenamiento, se espera una latencia de inferencia inferior a 33 ms por paso en hardware adecuado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que no es posible realizar una comparativa cuantitativa con alternativas como OpenVLA, RT-2 o el propio SmolVLA base. Se puede senalar que SmolVLA se presenta como una alternativa mas eficiente que modelos VLA grandes, pero no hay cifras concretas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido entrenado con un dataset muy pequeno (26 episodios), lo que puede provocar overfitting y baja generalizacion a variaciones en el entorno, iluminacion o posicion de los objetos.
- No se han publicado resultados de evaluacion en robot real, por lo que su rendimiento real no esta verificado.
- Las tareas estan limitadas a un escenario muy especifico (recoger un objeto de una caja y colocarlo en un plato) y a dos colores de objeto. No es adecuado para tareas fuera de este dominio sin reentrenamiento.
- Depende de la configuracion exacta de camaras y robot (`so101_tb4`). Cambios en la disposicion de las camaras o en el robot requeririan reentrenamiento.
- No se especifican sesgos conocidos, pero al ser un modelo de control robotico, no se aplican los sesgos tipicos de modelos de lenguaje. Sin embargo, la falta de diversidad en los datos de entrenamiento puede limitar su robustez.
- La licencia Apache 2.0 permite uso comercial, pero se debe tener en cuenta que el modelo base SmolVLA tambien tiene la misma licencia, por lo que no hay restricciones adicionales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/MoAIBo/pick_place_depth_odom_policy)
- [Dataset de entrenamiento](https://huggingface.co/datasets/MoAIBo/pick_place_depth_odom)
- [Paper de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Guia de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentacion completa de LeRobot](https://huggingface.co/docs/lerobot/index)
