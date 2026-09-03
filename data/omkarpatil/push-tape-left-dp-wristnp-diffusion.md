# omkarpatil/push-tape-left-dp-wristnp-diffusion

## Resumen

Este modelo es una política de difusión (Diffusion Policy) entrenada con LeRobot para la tarea robótica `push-tape-left`, que consiste en empujar una cinta adhesiva sobre una superficie. Está desarrollada específicamente para el robot ROBOTIS FFW SG2 Rev1 y utiliza dos cámaras de muñeca (`cam_left_wrist` y `cam_right_wrist`) como entrada visual, sin señal de propiocepción (el estado de observación está puesto a cero).

El modelo pertenece a un grupo de composición denominado "A", que agrupa las tareas `push-tape-left` y `push-tape-right`, con estadísticas de normalización combinadas sobre 5.768 fotogramas. Esta estrategia permite que los modelos del mismo grupo compartan estadísticas de normalización, facilitando la composición entre políticas entrenadas por separado.

La relevancia de este modelo radica en su enfoque de normalización compartida entre tareas similares y su integración con el ecosistema LeRobot v3.0, lo que lo convierte en un caso de estudio para la composición de políticas robóticas. Con aproximadamente 274,5 millones de parámetros, es un modelo de tamaño moderado entrenado durante 100.000 pasos con una pérdida final de 0,004.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 274.492.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de robotica, no linguistico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy basada en el proceso de difusion denoising DDPM (Denoising Diffusion Probabilistic Models). El modelo genera secuencias de acciones mediante un proceso iterativo de denoising, condicionado por las observaciones visuales de las camaras. Se utilizaron dos camaras de muñeca (`cam_left_wrist` y `cam_right_wrist`) con resolucion nativa, y el estado de observacion (`observation.state`) fue puesto a cero, lo que significa que el modelo opera exclusivamente con informacion visual sin retroalimentacion de propiocepcion.

El entrenamiento se realizo con los valores por defecto de LeRobot 0.6.1 (fork `lerobot-cyclo` de ROBOTIS): 100.000 pasos, batch size de 8, optimizador con learning rate 1e-4, betas (0.95, 0.999) y weight decay 1e-6. Los datos se muestrearon a 15 fps y el dataset se convirtio al formato v3.0 de LeRobot desde v2.1, restaurando las estadisticas agrupadas tras la conversion (el conversor v2.1→v3.0 regenera las estadisticas y habria reemplazado los valores agrupados por valores por tarea). La perdida final de entrenamiento fue de 0,004.

Una innovacion clave es el uso de estadisticas de normalizacion agrupadas (shared-norm) en lugar de estadisticas por tarea. El grupo de composicion A incluye `push-tape-left` y `push-tape-right`, y las estadisticas se combinaron sobre 5.768 fotogramas de todos los miembros del grupo. El hash SHA-256 de los campos de normalizacion es `839f172565ff`, y solo los modelos de composicion que reporten este mismo hash son compatibles entre si.

## Capacidades

- Generacion de secuencias de acciones para manipulacion robotica mediante difusion denoising.
- Procesamiento de entradas visuales de dos camaras de muñeca simultaneamente.
- Ejecucion de la tarea especifica `push-tape-left` (empujar cinta hacia la izquierda).
- Composicion con otros modelos del mismo grupo (mismo hash de normalizacion) para tareas similares.
- Integracion con el ecosistema LeRobot v3.0 para entrenamiento y despliegue.
- Compatibilidad con el robot ROBOTIS FFW SG2 Rev1.
- Operacion sin dependencia de propiocepcion (estado de observacion anulado).
- Normalizacion compartida entre tareas del grupo A, lo que permite transferencia estadistica.

## Casos de uso

- Automatizacion de tareas de empuje en lineas de ensamblaje: el modelo puede controlar un brazo robotico para empujar componentes (como cintas adhesivas) a posiciones especificas, con precision basada en vision y sin necesidad de sensores de propiocepcion.
- Investigacion en composicion de politicas robotica: al pertenecer a un grupo de composicion con estadisticas compartidas, sirve como base para estudiar como combinar multiples politicas entrenadas por separado en un mismo robot.
- Benchmarking de Diffusion Policies en robots de bajo coste: el robot FFW SG2 Rev1 es un plataforma accesible, y este modelo proporciona una referencia de rendimiento para la tarea `push-tape-left` con dos camaras de muñeca.
- Entrenamiento por imitacion con LeRobot: el modelo demuestra el flujo completo de captura de datos, conversion de formato y entrenamiento con normalizacion agrupada, sirviendo como plantilla para nuevos datasets.
- Validacion de estrategias de normalizacion agrupada: permite comparar el rendimiento de modelos entrenados con estadisticas agrupadas frente a estadisticas por tarea en tareas de manipulacion similares.
- Desarrollo de sistemas de manipulacion sin propiocepcion: al anular el estado de observacion, el modelo demuestra que es posible controlar el robot basandose unicamente en vision, lo que reduce la dependencia de sensores de articulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida final de entrenamiento de 0,004, que no es directamente comparable con benchmarks estandar de modelos de lenguaje o vision. No se proporcionan datos de evaluacion en el entorno real ni metricas de exito de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 274 millones de parametros, una estimacion razonable para inferencia en FP32 seria de aproximadamente 1,1 GB de VRAM, pero no se ha confirmado oficialmente.
- GPU recomendadas: no disponible. Dado el tamano del modelo, cualquier GPU moderna con al menos 4 GB de VRAM deberia ser suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probablemente si, en GPU como RTX 3060 o superiores, aunque no hay confirmacion oficial.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion y despliegue para robots reales, pero no hay soporte confirmado para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El tiempo de inferencia dependera del numero de pasos de denoising configurados en el scheduler DDPM.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos. La tabla siguiente resume lo que se conoce:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| push-tape-left-dp-wristnp-diffusion | 274,5 M | No aplica | Robotica (empuje) | Apache 2.0 | HuggingFace |
| Otras Diffusion Policies de LeRobot | Variable | No aplica | Robotica | Apache 2.0 | HuggingFace |
| Modelos GR00T para las mismas tareas | no disponible | No aplica | Robotica | no disponible | no disponible |

Nota: el modelo card menciona que las politicas GR00T para las mismas tareas comparten el mismo archivo de estadisticas agrupadas, pero consumen campos diferentes (percentiles q01/q99 en lugar de min/max), por lo que no son directamente comparables ni componibles entre arquitecturas.

## Limitaciones y advertencias

- Modelo de tarea unica: esta entrenado exclusivamente para `push-tape-left` y no generaliza a otras tareas sin reentrenamiento.
- Sin propiocepcion: el estado de observacion esta anulado, lo que limita la precision en tareas que requieran conocimiento de la posicion de las articulaciones.
- Resolucion de camara no uniforme: las camaras de muñeca tienen resoluciones diferentes (424x240) y el modelo de 3 camaras requirio re-codificacion a un tamano comun; este modelo de 2 camaras usa resolucion nativa.
- Compatibilidad limitada de composicion: solo compone con modelos que reporten el mismo hash SHA-256 de normalizacion (`839f172565ff`) y que usen la misma arquitectura (diffusion con diffusion, no con GR00T).
- Dependencia de LeRobot v3.0: el modelo requiere el formato de dataset v3.0 y la conversion desde v2.1 puede alterar las estadisticas si no se restauran manualmente.
- Riesgo de sobreajuste: la perdida final de 0,004 sugiere un buen ajuste a los datos de entrenamiento, pero no hay metricas de generalizacion a entornos no vistos.
- Sin datos de evaluacion en el mundo real: no se proporcionan tasas de exito ni evaluaciones fisicas del robot.
- Restriccion de hardware: requiere el robot ROBOTIS FFW SG2 Rev1 para despliegue fisico, lo que limita su uso a quien disponga de esa plataforma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/omkarpatil/push-tape-left-dp-wristnp-diffusion
- LeRobot (libreria): https://github.com/huggingface/lerobot
- ROBOTIS (fabricante del robot): https://www.robotis.com/
