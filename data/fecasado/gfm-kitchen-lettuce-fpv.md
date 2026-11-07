# fecasado/gfm-kitchen-lettuce-fpv

## Resumen

GFM Kitchen Lettuce FPV es una política robótica de manipulación entrenada con LeRobot y publicada en Hugging Face por el usuario fecasado. El identificador del modelo es `fecasado/gfm-kitchen-lettuce-fpv` y la arquitectura declarada es *gaze flow matching*, una variante de flow matching aplicada a políticas de imitación (visuomotor policies). El modelo resuelve el problema de mapear observaciones visuales (cámara en primera persona, FPV, sobre una cocina) a acciones de control de un brazo robótico, en concreto la tarea de trasladar lechuga a un plato. Está entrenado sobre el dataset `fecasado/lettuce-to-plate-320x240`, con resolución de imagen de 320x240.

El modelo tiene 75.248.330 parámetros (dato real extraído del fichero safetensors) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Se publica bajo la librería LeRobot y el pipeline `robotics`, y el formato de pesos es safetensors.

Es relevante ahora porque forma parte del ecosistema creciente de políticas robóticas open source entrenadas con LeRobot, que permiten reproducir pipelines completos de entrenamiento e inferencia con la CLI `lerobot-train` y `lerobot-record`. No obstante, la model card es una plantilla sin completar (indica literalmente «Model type not recognized»), por lo que la información técnica disponible es limitada y procede principalmente de los metadatos del repositorio y de los tags.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze flow matching (política visuomotora de flow matching con señal de mirada) |
| Parametros totales | 75.248.330 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; política robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es *gaze flow matching*, una política de imitación que combina flow matching (modelado generativo de trayectorias de acción mediante campos de velocidad) con información de mirada (*gaze*). El modelo opera sobre observaciones visuales en primera persona (FPV) capturadas a resolución 320x240 y produce acciones de control para un robot manipulador. El número de parámetros (75,2 M) es coherente con una red visuomotora compacta con codificador visual y cabeza de acciones, no con un transformer de gran escala.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/lettuce-to-plate-320x240`, que contiene demostraciones de la tarea de trasladar lechuga a un plato en un entorno de cocina. No se dispone de información sobre el número de episodios, tokens de entrenamiento, composición del dataset ni sobre el uso de RLHF o DPO (no aplicable en este contexto). La model card no documenta innovaciones técnicas adicionales más allá del propio esquema de gaze flow matching.

## Capacidades

- Control visuomotor de un brazo robótico a partir de imágenes en primera persona (FPV) a 320x240.
- Ejecución de la tarea específica de trasladar lechuga a un plato en un entorno de cocina.
- Política de imitación entrenada con LeRobot, compatible con el pipeline `lerobot-record` para evaluación e inferencia.
- Integración con robots tipo `so100_follower` según el ejemplo de la model card.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas ni visión general.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües (no aplica).
- No se documentan modos especiales como thinking mode, audio o visión general.

## Casos de uso

- Automatización de tareas de cocina en laboratorio: el modelo puede ejecutar la secuencia de recoger lechuga y depositarla en un plato, sirviendo como base para experimentos de manipulación doméstica con robots de bajo coste.
- Reproducción de investigación en políticas de imitación: al estar entrenado con LeRobot y publicarse en safetensors, permite replicar el pipeline de entrenamiento e inferencia y comparar variantes de flow matching frente a ACT u otras políticas.
- Evaluación de esquemas de gaze flow matching: el modelo sirve como referencia para estudiar cómo la señal de mirada mejora la precisión en tareas de manipulación con cámara FPV.
- Prototipado en robots tipo so100: la model card incluye un ejemplo de `lerobot-record` con `so100_follower`, lo que facilita desplegar la política en plataformas de bajo coste para pruebas de concepto.
- Generación de datos de evaluación: puede usarse para producir episodios etiquetados con el prefijo `eval_` y comparar el rendimiento de distintas políticas sobre la misma tarea.
- Docencia y formación en robótica: el tamaño reducido (75 M de parámetros, 0,3 GB) permite ejecutar la política en entornos de laboratorio con recursos limitados y explicar el ciclo completo de entrenamiento e inferencia con LeRobot.
- Base para fine-tuning en tareas similares: al ser Apache 2.0, puede adaptarse a otras tareas de trasvase de objetos ajustando el dataset de demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 75,2 M de parámetros en safetensors, el peso del modelo ocupa aproximadamente 0,3 GB en FP32, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la documentación; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente, incluidas RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), según la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-lettuce-fpv | 75,2 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| fecasado/gfm-kitchen-lettuce-22dF | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| fecasado/giava-kitchen-lettuce-fpv | no disponible | no aplica | no disponible | no disponible | Hugging Face |

Los dos modelos comparables encontrados en la búsqueda web pertenecen al mismo autor y a la misma familia de tareas (cocina y lechuga), pero no se dispone de sus especificaciones detalladas ni de resultados de rendimiento publicados.

## Limitaciones y advertencias

- La model card es una plantilla sin completar e indica «Model type not recognized», por lo que falta documentación técnica esencial (datos de entrenamiento, hiperparámetros, métricas).
- El modelo está entrenado para una tarea muy específica (trasladar lechuga a un plato en una cocina concreta) y no generaliza a otras tareas sin fine-tuning.
- Riesgo de sobreajuste al entorno y a la configuración de cámara del dataset de entrenamiento; cambios de iluminación, posición de la cámara o disposición de objetos pueden degradar el rendimiento.
- No se documentan sesgos, pero al ser una política visuomotora puede heredar sesgos de las demostraciones (posiciones, objetos y trayectorias concretas).
- No se documentan métricas de robustez ni de tasa de éxito, por lo que no se puede garantizar un comportamiento fiable en producción sin evaluación propia.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- El campo de idiomas no está disponible y no aplica a este tipo de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-lettuce-fpv
- Modelo relacionado: https://huggingface.co/fecasado/gfm-kitchen-lettuce-22dF
- Modelo relacionado: https://huggingface.co/fecasado/giava-kitchen-lettuce-fpv
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
