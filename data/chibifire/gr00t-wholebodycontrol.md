# chibifire/GR00T-WholeBodyControl

## Resumen

Este repositorio, publicado por el usuario chibifire, contiene el codebase y los checkpoints del proyecto GR00T Whole-Body Control (WBC), desarrollado originalmente por NVIDIA. El proyecto proporciona controladores avanzados de cuerpo entero para robots humanoides, incluyendo el controlador desacoplado (Decoupled WBC) utilizado en los modelos GR00T N1.5 y N1.6, la serie GEAR-SONIC de controladores generalistas, y MotionBricks, un modelo generativo latente para control de movimiento en tiempo real.

El objetivo principal es resolver el problema del control de cuerpo entero en humanoides: en lugar de construir controladores separados para movimientos predefinidos, se utiliza el seguimiento de movimiento (motion tracking) como tarea de entrenamiento escalable. Esto permite que una única política unificada produzca movimientos naturales y generalizables, desde caminar y gatear hasta teleoperación y control multimodal. El repositorio incluye scripts de entrenamiento, evaluación y despliegue, así como documentación para integración con IsaacLab.

La relevancia actual del proyecto radica en su contribución a la robótica humanoide y a la ejecución de tareas mediante modelos VLA (Vision-Language-Action). El repositorio es una referencia para investigadores y desarrolladores que necesitan implementar control de cuerpo entero en robots como el Unitree G1. Los datos técnicos detallados sobre arquitectura, tamaño y contexto no se encuentran disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio contiene políticas de control para robots humanoides, no un modelo de lenguaje; la arquitectura exacta de los checkpoints no se especifica) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de control de robots) |
| Licencia | Apache 2.0 segun la model card; no especificada en la pagina de HuggingFace |
| Formato de pesos | ONNX (segun los tags del repositorio; no se especifica el formato de todos los pesos) |

## Arquitectura y entrenamiento

El repositorio no proporciona especificaciones tecnicas detalladas de los checkpoints individuales, pero la documentacion describe tres componentes principales. El controlador Decoupled WBC combina aprendizaje por refuerzo (RL) para la parte inferior del cuerpo y cinematica inversa (IK) para la parte superior, tal como se usa en los modelos GR00T N1.5 y N1.6. GEAR-SONIC es un modelo de comportamiento humanoide entrenado con datos de movimiento humano a gran escala, utilizando el seguimiento de movimiento como tarea de entrenamiento. MotionBricks es un modelo generativo latente para control de movimiento interactivo en tiempo real, aplicable a animacion y robotica.

El entrenamiento se basa en datos de movimiento humano, incluyendo el dataset BONES-SEED, que contiene mas de 142.000 movimientos humanos (aproximadamente 288 horas) con trayectorias MuJoCo para el robot G1. Tambien se menciona la recoleccion de datos de teleoperacion y el ajuste fino de modelos VLA (como Isaac-GR00T N1.7) para ejecucion de tareas de extremo a extremo. No se especifica el numero de tokens ni el proceso de RLHF/DPO, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Control de cuerpo entero para robots humanoides, incluyendo locomocion bípeda (caminar, gatear) y movimientos complejos.
- Seguimiento de movimiento (motion tracking) como tarea de entrenamiento escalable para generalizacion.
- Soporte de teleoperacion de cuerpo entero mediante VR y teleoperacion de baja latencia.
- Integracion con modelos VLA (Vision-Language-Action) para ejecucion de tareas de manipulacion y navegacion.
- Generacion de movimiento interactivo en tiempo real a traves de MotionBricks.
- Soporte de referencias SMPL (modelo de cuerpo humano) para control de pose.
- Capacidad de ajuste fino y entrenamiento desde cero con datos propios.
- Despliegue mediante stack de inferencia en C++ con protocolo ZMQ.

## Casos de uso

- Teleoperacion de robots humanoides: el modelo permite controlar un robot Unitree G1 mediante movimientos de cuerpo entero capturados con un dispositivo VR o mediante teleoperacion de baja latencia. Es adecuado porque el controlador SONIC esta entrenado para reproducir movimientos humanos naturales.
- Ejecucion de tareas con VLA: se puede combinar con un modelo VLA como Isaac-GR00T N1.7 para que el robot realice tareas de manipulacion y navegacion de extremo a extremo. El controlador de cuerpo entero se encarga de la parte motora mientras el VLA decide las acciones de alto nivel.
- Recoleccion de datos de teleoperacion: el repositorio incluye pipelines para recopilar demostraciones de teleoperacion y usarlas para ajustar politicas. Esto es util para entrenar robots en tareas especificas sin programar cada movimiento manualmente.
- Animacion de personajes virtuales: MotionBricks permite generar movimiento interactivo en tiempo real para animacion de personajes humanoides, con aplicaciones en videojuegos, simulacion y realidad virtual.
- Investigacion en control de humanoides: el codigo y los checkpoints sirven como base para evaluar y desarrollar nuevos controladores de cuerpo entero, comparando estrategias como RL, IK y modelos generativos.
- Demostracion interactiva en navegador: el live demo de GEAR-SONIC permite probar el control de un robot humanizado desde el navegador, lo que facilita la evaluacion rapida de capacidades sin necesidad de hardware fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio enlaza a un articulo de arXiv (2511.07820) y a documentacion tecnica, pero no se proporcionan metricas numericas de rendimiento, como tasas de exito, precision de seguimiento o velocidad de inferencia.

## Requisitos de hardware

- No se proporcionan datos de VRAM estimada, GPUs recomendadas ni requisitos de hardware especificos en la informacion disponible.
- El proyecto depende de IsaacLab 2.3.2 para la simulacion, lo que sugiere la necesidad de una GPU NVIDIA con soporte para simulacion fisica acelerada.
- Para el despliegue en robots reales se requiere el hardware del robot (por ejemplo, Unitree G1) y posiblemente un stack de inferencia en C++.
- Las opciones de despliegue mencionadas incluyen el stack de inferencia C++ con protocolo ZMQ, teleoperacion VR y despliegue en simulacion con IsaacLab.
- No se disponen de estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El repositorio contiene controladores de robotica humanoide, no modelos de lenguaje, y los datos de rendimiento no estan publicados. Se recomienda consultar el articulo de arXiv y la documentacion de NVIDIA para obtener comparaciones tecnicas con otros controladores de cuerpo entero.

## Limitaciones y advertencias

- Este repositorio es una copia publicada por un usuario de HuggingFace (chibifire) y no el repositorio oficial de NVIDIA. El contenido puede diferir del original o estar desactualizado.
- La licencia no esta especificada en la pagina de HuggingFace, aunque la model card muestra Apache 2.0. Es necesario verificar el estado de la licencia antes de cualquier uso comercial.
- El proyecto depende de infraestructura especifica de NVIDIA (IsaacLab, Isaac-GR00T) y de hardware robotico concreto, lo que limita su portabilidad.
- No se proporcionan datos sobre sesgos, pero al tratarse de control de movimiento, puede haber limitaciones en la generalizacion a entornos no vistos durante el entrenamiento.
- El codigo y los checkpoints pueden requerir conocimientos avanzados de robotica y simulacion para su correcta utilizacion.
- La informacion disponible no incluye advertencias sobre riesgo de alucinacion, ya que no es un modelo generativo de texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/chibifire/GR00T-WholeBodyControl
- Documentacion oficial de GR00T-WholeBodyControl: https://nvlabs.github.io/GR00T-WholeBodyControl/
- Sitio web de GEAR-SONIC: https://nvlabs.github.io/GEAR-SONIC/
- Articulo de arXiv (GEAR-SONIC): https://arxiv.org/abs/2511.07820
- Modelo GEAR-SONIC en HuggingFace (NVIDIA): https://huggingface.co/nvidia/GEAR-SONIC
- Repositorio en GitHub (espejo): https://github.com/mackatwentytsuru/gr00t-wholebodycontrol
- Demo interactivo en navegador: https://nvlabs.github.io/GEAR-SONIC/demo.html
- Pagina del proyecto MotionBricks: https://nvlabs.github.io/motionbricks/
