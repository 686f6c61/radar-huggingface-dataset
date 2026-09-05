# fecasado/gfm-cubes-22dN2

## Resumen

El modelo `fecasado/gfm-cubes-22dN2` es una política robótica (policy) entrenada con la librería LeRobot de Hugging Face. Ha sido desarrollado por el usuario `fecasado` y está diseñado para controlar un robot manipulador mediante aprendizaje por imitación. El nombre del modelo indica que utiliza una técnica de *gaze flow matching*, una variante de *flow matching* que probablemente incorpora información de la mirada del usuario o del robot para generar acciones. El modelo se ha entrenado en el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, cuyo nombre sugiere una tarea de manipulación de cubos hacia cestas con imágenes de resolución 320x240.

Se trata de un modelo de tamaño reducido, con 75.225.290 parámetros totales y un peso de 0,3 GB en formato safetensors. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones. Al ser un modelo de robótica, no procesa lenguaje natural ni genera texto, sino que mapea observaciones (imágenes, estados del robot) a comandos de control. Su relevancia radica en que ofrece una política open source para tareas de manipulación, permitiendo a investigadores y desarrolladores reproducir y evaluar experimentos en robótica con LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo de política: gaze_flow_matching) |
| Parametros totales | 75.225.290 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no está documentada en la model card, que indica explícitamente «Model type not recognized — please update this template». El frontmatter del repositorio identifica el modelo como `gaze_flow_matching`, lo que sugiere que se trata de una política basada en *flow matching* aplicada a datos de mirada y movimiento. LeRobot es una librería de Hugging Face para entrenar y desplegar políticas robóticas, por lo que el modelo se integra en su ecosistema.

El entrenamiento se ha realizado sobre el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que probablemente contiene demostraciones de un robot manipulando cubos para colocarlos en cestas, con imágenes de 320x240 píxeles. No se ha publicado información sobre el número de demostraciones, la composición del dataset ni si se han aplicado técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del uso de *gaze flow matching*.

## Capacidades

- Generación de acciones de control para robots manipuladores, a partir de observaciones visuales y estados del robot.
- Integración nativa con LeRobot, lo que permite entrenar, evaluar y desplegar la política con facilidad.
- Soporte para tareas de manipulación de objetos, como mover cubos a cestas, mediante aprendizaje por imitación.
- Compatibilidad con el robot `so100_follower` mencionado en la documentación de LeRobot, lo que facilita su uso en plataformas de bajo coste.
- Procesamiento de entradas visuales de resolución 320x240, según el dataset utilizado.
- No soporta *tool calling*, razonamiento multilingüe ni generación de texto, al ser un modelo de robótica.

## Casos de uso

- Manipulación robótica en laboratorios: el modelo puede controlar un robot para mover cubos entre diferentes posiciones, facilitando experimentos de aprendizaje por imitación en entornos controlados.
- Automatización de tareas repetitivas en líneas de montaje: gracias a su capacidad para aprender de demostraciones humanas, puede ejecutar tareas como colocar piezas en cestas de forma autónoma.
- Investigación en políticas de *flow matching*: sirve como base para estudiar el rendimiento de *gaze flow matching* frente a otras arquitecturas de políticas robóticas.
- Evaluación de políticas en LeRobot: permite probar el flujo completo de entrenamiento e inferencia con la librería, usando el robot `so100_follower` como plataforma.
- Benchmarking de aprendizaje por imitación: al estar publicado con un dataset específico, puede utilizarse para comparar diferentes políticas en la misma tarea de manipulación.
- Despliegue en robots educativos o de investigación: su tamaño reducido (75M parámetros) permite ejecutarlo en hardware modesto, lo que facilita su uso en entornos académicos o de prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento ni comparaciones con otros modelos. El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75.225.290 parámetros en formato safetensors, el modelo ocupa aproximadamente 300 MB en fp32, por lo que la VRAM necesaria es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como una NVIDIA GTX 1050, RTX 2060 o superior. En el caso de usar LeRobot, se recomienda una GPU con soporte CUDA.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como las de la serie RTX 30 o 40, e incluso en GPUs antiguas con poca memoria.
- Opciones de despliegue: LeRobot (PyTorch), con scripts de entrenamiento e inferencia como `lerobot-train` y `lerobot-record`. No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No se han publicado mediciones de rendimiento en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fecasado/gfm-cubes-22dN2 | 75.225.290 | no disponible | Apache 2.0 | Hugging Face |
| fecasado/gfm-cubes-22dN | no disponible | no disponible | no disponible | Hugging Face |

El modelo `fecasado/gfm-cubes-22dN` es un modelo hermano del mismo autor, con un nombre casi idéntico, lo que sugiere que podría ser una versión anterior o una variante de la misma política. Sin embargo, no se dispone de información detallada sobre sus parámetros, rendimiento ni licencia. No se han encontrado otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card está incompleta y no reconoce el tipo de modelo, lo que dificulta la interpretación de sus características técnicas.
- No se han publicado benchmarks ni métricas de rendimiento, por lo que no es posible evaluar su calidad frente a otras políticas robóticas.
- El modelo se ha entrenado en un dataset específico (`Ncubes-to-Nbaskets-320x240`), por lo que su capacidad de generalización a otras tareas o entornos es probablemente limitada.
- Al ser un modelo de robótica, no es apto para tareas de lenguaje natural, generación de texto ni razonamiento simbólico.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad; se recomienda validar su funcionamiento antes de su uso en producción.
- La licencia Apache 2.0 permite el uso comercial, pero la responsabilidad del rendimiento y la seguridad recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22dN2
- Modelo hermano (sin el sufijo "2"): https://huggingface.co/fecasado/gfm-cubes-22dN
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
