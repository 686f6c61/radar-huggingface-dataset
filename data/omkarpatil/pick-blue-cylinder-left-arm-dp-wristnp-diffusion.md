# omkarpatil/pick-blue-cylinder-left-arm-dp-wristnp-diffusion

## Resumen

Este modelo es una política de manipulación robótica basada en Diffusion Policy, entrenada específicamente para la tarea de recoger un cilindro azul con el brazo izquierdo del robot manipulador ROBOTIS FFW SG2 Rev1. Ha sido desarrollado por omkarpatil y publicado bajo licencia Apache-2.0, utilizando el framework LeRobot en su versión 0.6.1. El modelo emplea dos cámaras de muñeca (izquierda y derecha) como entrada visual, sin retroalimentación de propiocepción, y genera acciones de control del brazo mediante un proceso de difusión denoising.

La relevancia de este modelo radica en que aborda el problema del control robótico basado en visión con una arquitectura de política de difusión, que ha demostrado ser robusta para tareas de manipulación de precisión. El modelo forma parte de un grupo de composición (grupo B) que comparte estadísticas de normalización entre tres tareas relacionadas, lo que permite la composición entre políticas entrenadas para distintas variantes de la misma familia de tareas. Con 274,5 millones de parámetros, es un modelo de tamaño considerable para una tarea de manipulación, lo que refleja la capacidad expresiva necesaria para mapear observaciones visuales de alta dimensión a comandos de actuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (UNet + DDPM) |
| Parametros totales | 274.492.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una Diffusion Policy, una arquitectura que genera secuencias de acciones mediante un proceso de difusion denoising. Concretamente, utiliza un scheduler de ruido DDPM (Denoising Diffusion Probabilistic Models) para modelar la distribucion condicional de acciones dado el estado observado. La entrada visual consiste en dos camaras de muñeca (cam_left_wrist y cam_right_wrist) a su resolucion nativa, mientras que observation.state se anula por completo, eliminando cualquier informacion de propiocepcion. Esta decision de diseño fuerza a la politica a depender exclusivamente de la informacion visual, lo que puede mejorar la generalizacion pero tambien introduce una limitacion importante (ver seccion de limitaciones).

El entrenamiento se realizo con los hiperparametros por defecto de LeRobot: 100.000 pasos, batch size de 8, optimizador Adam con learning rate 1e-4, betas (0,95; 0,999) y weight decay 1e-6. La tasa de datos fue de 15 fps y la perdida final de entrenamiento alcanzo 0,003. Los datos se almacenan en formato LeRobot v3.0, convertidos desde v2.1, con estadisticas de normalizacion agrupadas restauradas despues de la conversion.

Una innovacion destacable es el uso de estadisticas de normalizacion agrupadas (pooled statistics) sobre el grupo de composicion B, que incluye tres tareas relacionadas: pick-blue-cylinder-left-arm, pick-blue-cylinder-right-arm y blue-cylinder-handover. Las estadisticas se calcularon sobre 11.870 frames de todos los miembros del grupo y se escribieron identicamente en cada dataset, identificadas por el hash sha256 192368a81435. Esto permite que los modelos del mismo grupo sean componibles entre si, aunque solo dentro de la misma arquitectura (Diffusion Policy con Diffusion Policy, GR00T con GR00T), ya que consumen campos de normalizacion diferentes.

## Capacidades

- Control robotico visual: genera acciones de control para el brazo izquierdo del ROBOTIS FFW SG2 Rev1 a partir de observaciones visuales de dos camaras de muñeca.
- Manipulacion de precision: entrenado para la tarea especifica de recoger un cilindro azul, requiere coordinacion visomotora fina.
- Composicion entre tareas: al compartir estadisticas de normalizacion con otros dos modelos del grupo B, puede componerse con ellos para ejecutar secuencias de tareas relacionadas.
- Robustez visual: al no depender de propiocepcion, la politica debe extraer toda la informacion relevante de las imagenes, lo que puede mejorar la robustez frente a errores de odometria o calibracion.
- Generacion de acciones con difusion: utiliza un proceso de denoising para generar secuencias de acciones, lo que proporciona salidas multimodales y mas suaves que metodos de regresion directa.

## Casos de uso

- Automatizacion de picking en entornos industriales: el modelo puede integrarse en una celda robotica para tareas de recogida de objetos cilindricos de color especifico, reduciendo la necesidad de programacion manual de trayectorias.
- Investigacion en aprendizaje por demostracion: sirve como punto de partida para estudiar el efecto de la normalizacion agrupada en la composicion de politicas y la transferencia entre tareas relacionadas.
- Validacion de Diffusion Policy en robotica: permite reproducir y evaluar los resultados de Diffusion Policy en un robot real de bajo coste como el FFW SG2, comparando con otros enfoques de control.
- Benchmarking de arquitecturas visomotoras: al tener las observaciones de estado anuladas, resulta util para aislar el efecto de la informacion visual en el rendimiento de la politica.
- Entrenamiento por refuerzo con inicializacion: las acciones generadas pueden servir como base para algoritmos de aprendizaje por refuerzo que refinen la politica en el robot real.
- Desarrollo de sistemas de manipulacion con multiples camaras: el modelo demuestra como integrar dos vistas de muñeca con resoluciones nativas distintas, un problema comun en plataformas roboticas heterogeneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida final de entrenamiento (0,003), que indica una buena convergencia pero no proporciona informacion sobre el rendimiento en el robot real ni en entornos simulados. No se dispone de datos comparativos con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado el tamano del modelo (274,5M parametros), una GPU con al menos 4-6 GB de VRAM deberia ser suficiente para inferencia en tiempo real con precision FP32 o FP16.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA RTX 3060 o superior. Para despliegue en el robot, una Jetson Orin Nano o similar seria adecuada.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo actuales (RTX 3060, RTX 4060, etc.) gracias a su tamano moderado.
- Opciones de despliegue: LeRobot proporciona herramientas de evaluacion en robot real y en simulacion (Gymnasium). No se menciona soporte para vLLM, TGI u otros servidores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia de Diffusion Policy requiere multiples pasos de denoising (tipicamente 10-100), lo que aumenta la latencia respecto a metodos de regresion directa.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Composicion | Licencia |
|---|---|---|---|---|---|
| pick-blue-cylinder-left-arm-dp-wristnp-diffusion (este) | Diffusion Policy | 274,5M | 2 camaras muñeca, sin propiocepcion | Grupo B (hash 192368a81435) | Apache-2.0 |
| Politicas GR00T para las mismas tareas | GR00T | no disponible | no disponible | Grupo B (mismas estadisticas, campos distintos) | no disponible |
| Otros modelos LeRobot Diffusion Policy | Diffusion Policy | variable | variable | variable | Apache-2.0 |

La comparativa con las politicas GR00T es especialmente relevante: aunque comparten estadisticas de normalizacion, no son componibles entre si debido a que consumen campos de normalizacion diferentes (GR00T usa percentiles q01/q99, Diffusion Policy usa min/max). Esto limita la interoperabilidad entre arquitecturas incluso dentro del mismo grupo de tareas.

## Limitaciones y advertencias

- Sin propiocepcion: observation.state se anula por completo, lo que impide al modelo conocer la posicion articular actual del robot. Esto puede provocar fallos si el robot se encuentra en una configuracion muy distinta a las vistas durante el entrenamiento.
- Resolucion de camaras: las camaras de muñeca tienen resoluciones nativas de 424x240, lo que limita la precision visual para objetos pequenos o distantes. La variante de 3 camaras requirio re-encodificar todas las vistas a un tamano comun, lo que puede degradar la calidad de imagen.
- Especificidad de la tarea: el modelo esta entrenado exclusivamente para recoger un cilindro azul con el brazo izquierdo. No generaliza a otros objetos, colores, posiciones o brazos sin reentrenamiento.
- Composicion limitada por arquitectura: la composicion solo funciona entre modelos de la misma arquitectura (Diffusion con Diffusion, GR00T con GR00T). Intentar componer entre arquitecturas diferentes dara resultados incorrectos.
- Datos de entrenamiento limitados: las estadisticas agrupadas se calcularon sobre 11.870 frames, un conjunto de datos relativamente pequeno para tareas de manipulacion complejas.
- Sin evaluacion reportada: no hay datos de rendimiento en el robot real ni en simulacion, por lo que no se puede verificar la efectividad del modelo en condiciones de despliegue.
- Fecha de creacion futura: el modelo fue creado el 2026-09-03, lo que sugiere que puede ser un modelo experimental o de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/pick-blue-cylinder-left-arm-dp-wristnp-diffusion
- LeRobot (framework de entrenamiento): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://lerobot.readthedocs.io/
- ROBOTIS FFW SG2 Rev1 (plataforma robotica): no disponible en la informacion proporcionada
