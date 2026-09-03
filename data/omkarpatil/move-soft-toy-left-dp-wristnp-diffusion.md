# omkarpatil/move-soft-toy-left-dp-wristnp-diffusion

## Resumen

El modelo `omkarpatil/move-soft-toy-left-dp-wristnp-diffusion` es una política de control robótico basada en Diffusion Policy, entrenada con la librería LeRobot (versión 0.6.1, fork `lerobot-cyclo` de ROBOTIS) para el robot manipulador ROBOTIS FFW SG2 Rev1. La tarea consiste en mover un juguete blando hacia la izquierda, utilizando exclusivamente observaciones visuales de cámaras, sin señal de propriocepción (el estado de la articulación se anula a cero). El modelo fue desarrollado por omkarpatil y se distribuye bajo licencia Apache-2.0.

Este modelo es relevante porque demuestra el uso de políticas de difusión en robótica con aprendizaje por imitación, aplicando normalización compartida entre tareas de un mismo grupo composicional. La arquitectura emplea un proceso de difusión denoising (DDPM) para generar acciones a partir de observaciones visuales, lo que permite capturar distribuciones multimodales de comportamiento. Con 274 millones de parámetros y un tamaño de repositorio de 1,1 GB, es un modelo de tamaño moderado para inferencia en tiempo real en robots con GPU embarcada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 274.492.048 (274,47 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (control robótico, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política de difusión que genera acciones condicionadas a observaciones visuales. La arquitectura sigue el esquema estándar de Diffusion Policy: un codificador visual procesa las imágenes de las cámaras, y un decodificador de difusión (tipo U-Net o similar, no especificado) refina ruido gaussiano hasta producir la secuencia de acciones deseada. El entrenamiento se realizó con el optimizador Adam (lr 1e-4, betas 0.95/0.999, weight decay 1e-6), batch de 8, durante 100.000 pasos, alcanzando una pérdida final de 0.004. Los datos se registraron a 15 fps y se almacenaron en formato LeRobot v3.0, convertido desde v2.1 con restauración de estadísticas de normalización agrupadas.

Una característica destacada es el uso de estadísticas de normalización compartidas (pooled) dentro del grupo de composición C, que incluye las tareas `move-soft-toy-left` y `move-soft-toy-right`. Estas estadísticas se calcularon sobre 5.249 fotogramas de todos los miembros del grupo y se escribieron idénticamente en cada dataset, garantizando consistencia para la composición de políticas. Sin embargo, el modelo no es compatible con políticas GR00T para las mismas tareas, ya que consumen campos de normalización diferentes (percentiles vs. min/max).

## Capacidades

- Control robótico de manipulación: genera acciones de movimiento del brazo para desplazar un juguete blando hacia la izquierda.
- Aprendizaje por imitación: aprende de demostraciones humanas o teleoperadas, capturando comportamientos multimodales.
- Percepción visual: utiliza múltiples cámaras, incluyendo cámaras de muñeca izquierda y derecha (y posiblemente una cámara de cabeza, según el título "3 cameras"), todas re-escaladas a una resolución común para cumplir el requisito de Diffusion Policy de resoluciones uniformes.
- Sin propriocepción: la observación del estado articular se anula, por lo que el control se basa únicamente en visión.
- Composición de políticas: puede combinarse con otras políticas del mismo grupo composicional que compartan el mismo hash de normalización (`bbd29ed19fbe`).

## Casos de uso

- Automatización de tareas de manipulación en entornos de laboratorio: el modelo puede controlar un brazo robótico para realizar tareas de desplazamiento de objetos blandos, útiles en investigación de robótica y aprendizaje por imitación.
- Desarrollo de políticas de control con visión pura: al no depender de la propriocepción, sirve como referencia para sistemas donde la realimentación del estado articular no está disponible o es ruidosa.
- Composición de comportamientos: al pertenecer a un grupo composicional, puede combinarse con la política hermana `move-soft-toy-right` para crear comportamientos más complejos, siempre que se respete el mismo esquema de normalización.
- Evaluación de algoritmos de difusión en robótica: permite comparar el rendimiento de Diffusion Policy frente a otras arquitecturas (p. ej., GR00T) en tareas de manipulación, aunque no sean directamente compatibles.
- Entrenamiento de políticas de imitación con datos heterogéneos: el proceso de normalización compartida y conversión de formato v2.1 a v3.0 es un caso práctico de gestión de datos para entrenamiento multi-tarea.
- Despliegue en robots ROBOTIS FFW SG2 Rev1: el modelo está específicamente calibrado para este hardware, lo que facilita su integración en sistemas reales sin ajustes adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se reporta la pérdida final de entrenamiento (0.004), que no es comparable con métricas de evaluación estándar como MMLU o HumanEval. Para evaluar el rendimiento real sería necesario ejecutar el modelo en el robot o en un simulador con métricas de éxito de tarea, información que no se proporciona.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Con 274 M de parámetros en precisión FP32, el modelo ocuparía aproximadamente 1,1 GB en memoria; en FP16 sería ~550 MB, y en cuantización INT8 ~275 MB. Sin embargo, Diffusion Policy requiere además el procesamiento de imágenes de múltiples cámaras, lo que incrementa el uso de memoria y cómputo.
- GPU recomendadas: no especificadas por el autor. Para inferencia en tiempo real (15 fps) se recomienda una GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060, Jetson Orin). GPUs de gama alta como A100 o H100 serían necesarias solo para entrenamiento o inferencia con mayor resolución.
- Si cabe en consumer GPU: sí, el tamaño del modelo es moderado y debería ejecutarse en GPUs de consumo con 8 GB o más, siempre que las imágenes se procesen a resoluciones reducidas.
- Opciones de despliegue: LeRobot ofrece herramientas de inferencia para Diffusion Policy; también puede integrarse con ROS o frameworks de robótica. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La latencia dependerá de la resolución de las cámaras, la potencia de la GPU y el número de pasos de denoising (típicamente entre 10 y 100). Con 15 fps de datos de entrenamiento, se espera que la inferencia sea eficiente en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas de difusión para robótica con LeRobot). Aunque existen otros Diffusion Policies en el ecosistema LeRobot, no se han proporcionado datos concretos para establecer una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `move-soft-toy-left` en el robot FFW SG2 Rev1; no es transferible a otros robots o tareas sin reentrenamiento.
- La ausencia de propriocepción (observation.state anulado) limita la precisión en tareas que requieran realimentación de fuerza o posición articular.
- La normalización está agrupada y ligada a un hash específico; cualquier modificación de los datos o del proceso de normalización romperá la compatibilidad con otras políticas del grupo.
- No es compatible con políticas GR00T para las mismas tareas, a pesar de compartir estadísticas de normalización, debido a diferencias en los campos consumidos.
- El dataset original fue convertido de v2.1 a v3.0, y las estadísticas agrupadas se restauraron manualmente; si se reutiliza el dataset sin este paso, los resultados pueden degradarse.
- No se han publicado evaluaciones de robustez ante variaciones de iluminación, oclusiones o cambios en el entorno, por lo que su comportamiento en condiciones no vistas es incierto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de hardware y software específicos (LeRobot, ROBOTIS), cuyas licencias pueden tener restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/omkarpatil/move-soft-toy-left-dp-wristnp-diffusion
- Librería LeRobot: https://github.com/huggingface/lerobot (referencia general, no enlazada en la información proporcionada)
- No se encontraron otros enlaces relevantes en la búsqueda web (los resultados obtenidos correspondían a matrículas de vehículos alemanas, sin relación con el modelo).
