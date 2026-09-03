# omkarpatil/blue-cylinder-handover-dp-wristnp-diffusion

## Resumen

Este modelo es una política de difusión (Diffusion Policy) entrenada con el framework LeRobot para ejecutar la tarea de traspaso de un cilindro azul (blue-cylinder-handover) con el robot manipulador ROBOTIS FFW SG2 Rev1. El desarrollo corre a cargo de omkarpatil y se publica bajo licencia Apache 2.0. El modelo resuelve el problema de control visuomotor: a partir de imágenes de tres cámaras, genera las acciones de las articulaciones del robot para completar la maniobra de transferencia del objeto entre dos brazos.

La arquitectura es una política de difusión con scheduler de ruido DDPM, con aproximadamente 274,5 millones de parámetros. Forma parte de un grupo de composición (grupo B) junto con otras dos tareas de manipulación, lo que permite compartir estadísticas de normalización entre tareas relacionadas. Es relevante porque demuestra un enfoque de entrenamiento con estadísticas agrupadas entre tareas y una variante de tres cámaras con resolución re-codificada uniforme, un caso práctico de composición de políticas robóticas con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (scheduler DDPM) |
| Parametros totales | 274.492.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo visuomotor, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política se basa en el paradigma de Diffusion Policy: un modelo generativo que aprende a denoisar secuencias de acciones condicionadas por observaciones visuales. El scheduler de ruido es DDPM (Denoising Diffusion Probabilistic Models). La entrada visual proviene de tres cámaras — `cam_left_wrist`, `cam_right_wrist` y la cámara de cabeza—, aunque el campo `observation.state` está puesto a cero, es decir, no se utiliza propriocepción. Como Diffusion Policy exige que todas las cámaras compartan una única resolución y las nativas difieren (cabeza 376x672, muñecas 424x240), la variante de tres cámaras requirió re-codificar todas las vistas a un tamaño común.

El entrenamiento se realizó con los valores por defecto de LeRobot 0.6.1 (fork `lerobot-cyclo` de ROBOTIS): 100.000 pasos, batch de 8, optimizador Adam con lr 1e-4, betas (0.95, 0.999) y weight decay 1e-6. La tasa de datos es de 15 fps. Las estadísticas de normalización se agruparon sobre 11.870 fotogramas de los tres miembros del grupo de composición B (`pick-blue-cylinder-left-arm`, `pick-blue-cylinder-right-arm`, `blue-cylinder-handover`) y se escribieron de forma idéntica en cada dataset miembro, verificable mediante el hash `192368a81435`. El dataset está en formato LeRobot v3.0, convertido desde v2.1 con las estadísticas agrupadas restauradas tras la conversión. La pérdida final de entrenamiento es 0,002.

## Capacidades

- Control visuomotor de robot: genera acciones articulares a partir de observaciones visuales de tres cámaras.
- Ejecución de tarea de traspaso de objeto (cilindro azul) entre dos brazos del robot FFW SG2 Rev1.
- Composición de políticas: las estadísticas de normalización compartidas permiten componer el modelo con otras políticas del grupo B entrenadas sobre tareas relacionadas.
- Entrada multi-cámara con resolución uniforme re-codificada.
- Sin propriocepción: el modelo opera únicamente con información visual (observation.state a cero).
- Inferencia a 15 fps, consistente con la tasa de datos de entrenamiento.

## Casos de uso

- Traspaso de objetos entre brazos robóticos: el modelo genera las trayectorias de acción para transferir un cilindro de un brazo al otro, útil en líneas de ensamblaje o logística donde un manipulador entrega piezas a otro.
- Manipulación colaborativa dual-arm: al componer con las políticas de pick-and-place del grupo B, puede integrarse en un flujo donde un brazo recoge el cilindro, lo traspasa y el otro lo coloca.
- Investigación en políticas de difusión para robótica: sirve como punto de partida o referencia para estudiar la composición de políticas con estadísticas de normalización agrupadas.
- Desarrollo de sistemas de aprendizaje por demostración: el pipeline de entrenamiento (dataset v3.0, estadísticas agrupadas) puede reproducirse para nuevas tareas de manipulación con el mismo robot.
- Evaluación de variantes de cámaras: la comparación entre la variante de solo muñecas y la de tres cámaras permite estudiar el impacto de la resolución y el campo visual en el rendimiento de la política.
- Benchmarking de frameworks de robótica: útil para validar el flujo de conversión v2.1→v3.0 y la restauración de estadísticas agrupadas en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento de 0,002. No se proporcionan métricas de éxito de la tarea, precisión de manipulación ni comparaciones con otras políticas en entornos reales o simulados.

## Requisitos de hardware

- El modelo tiene 274,5 millones de parámetros, por lo que la inferencia en tiempo real requiere una GPU con al menos 8 GB de VRAM en precisión FP32; con cuantización o FP16 podría bastar una GPU de gama media.
- GPU recomendadas: NVIDIA RTX 3060 o superior para inferencia offline; para despliegue en tiempo real a 15 fps, una RTX 3080 o A4000 es más adecuada.
- No es un modelo de lenguaje: no se puede desplegar con vLLM, llama.cpp u Ollama. La inferencia se realiza mediante el framework LeRobot, que usa PyTorch.
- El despliegue en el robot real requiere el hardware ROBOTIS FFW SG2 Rev1 y el fork `lerobot-cyclo` de LeRobot.
- El entrenamiento completo (100.000 pasos) requiere una GPU con al menos 12-16 GB de VRAM (p. ej., RTX 3090, A5000 o superior).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Observaciones |
|---|---|---|---|---|
| Este modelo (blue-cylinder-handover) | Diffusion Policy (DDPM) | 274 M | Traspaso de cilindro, 3 cámaras | Sin propriocepción, estadísticas agrupadas grupo B |
| Variante solo muñecas del mismo robot | Diffusion Policy | no disponible | Traspaso de cilindro, 2 cámaras muñeca | Resolución nativa uniforme, sin re-codificación |
| Políticas GR00T del grupo B | GR00T (arquitectura propietaria) | no disponible | Mismas tareas del grupo B | Usan q01/q99 min-max; no componen con diffusion |

No se dispone de más información sobre modelos comparables. La propia documentación indica que las políticas GR00T para las mismas tareas comparten el archivo de estadísticas agrupadas pero consumen campos diferentes (percentiles frente a min/max), por lo que la composición cruzada entre arquitecturas no es posible.

## Limitaciones y advertencias

- Sin propriocepción: el campo `observation.state` está a cero, por lo que el modelo no dispone de información del estado articular y depende exclusivamente de la visión; esto puede degradar el rendimiento en tareas que requieran precisión de pose.
- Restricción de resolución de cámaras: la variante de tres cámaras requirió re-codificar todas las vistas a un tamaño común, lo que puede introducir pérdida de detalle respecto a la resolución nativa.
- Composición limitada: solo compone con modelos del grupo B que reporten el mismo hash de normalización (`192368a81435`); no es posible componer con políticas GR00T ni con arquitecturas que usen estadísticas diferentes.
- Sin datos de evaluación: no hay métricas de éxito de tarea ni benchmarks publicados; la pérdida de entrenamiento de 0,002 no garantiza rendimiento en el robot real.
- Específico del hardware: entrenado exclusivamente para el ROBOTIS FFW SG2 Rev1; no es transferible a otros robots sin reentrenamiento.
- Dependencia de versión de LeRobot: requiere el fork `lerobot-cyclo` y el formato de dataset v3.0; la conversión desde v2.1 regenera las estadísticas y debe restaurarse manualmente el archivo agrupado.
- Modelo sin mantenimiento aparente: no se reportan actualizaciones ni soporte; creado en septiembre de 2026 sin descargas ni valoraciones.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/omkarpatil/blue-cylinder-handover-dp-wristnp-diffusion
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de Diffusion Policy (referencia de la arquitectura): https://diffusion-policy.cs.columbia.edu/
- ROBOTIS FFW SG2 (hardware del robot): no disponible en la información proporcionada
- Fork LeRobot `lerobot-cyclo` de ROBOTIS: no disponible en la información proporcionada
