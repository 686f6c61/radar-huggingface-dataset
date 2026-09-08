# imstevenpmwork/dit_super_chatton_4549-ema

## Resumen

El modelo `imstevenpmwork/dit_super_chatton_4549-ema` es una política de robótica basada en un Multi-Task Diffusion Transformer (DiT) entrenada con la librería LeRobot de Hugging Face. Se trata de un modelo de aprendizaje por imitación que, partiendo de observaciones de estado del robot y de imágenes de dos cámaras (frontal y de muñeca), genera acciones de control de 6 dimensiones para un brazo robótico tipo `omx_follower`. El modelo fue desarrollado por `imstevenpmwork` y se publica bajo licencia Apache 2.0.

La arquitectura DiT extiende la conocida Diffusion Policy incorporando un transformer de difusión de gran tamaño y condicionamiento por texto y visión, lo que permite abordar tareas de manipulación multi-tarea. Según la información disponible, el modelo tiene aproximadamente 248,9 millones de parámetros, almacenados en formato `safetensors`, con un tamaño de repositorio de 1.0 GB. Está entrenado sobre un dataset propio de 100 episodios y 73.842 fotogramas, con una única tarea descrita textualmente: recoger un cubo azul y un cubo amarillo y dejarlos en una caja verde.

Este modelo es relevante para el campo de la robótica de imitación porque permite evaluar políticas de manipulación con condicionamiento multimodal en un entorno de código abierto y reproducible, integrado en el ecosistema LeRobot. Aunque no se han publicado resultados de evaluación sobre el robot real, su disponibilidad pública facilita la investigación y el desarrollo de aplicaciones de pick-and-place.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) |
| Parametros totales | 248.855.302 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a políticas de robótica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el condicionamiento textual es en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura utilizada es un Multi-Task Diffusion Transformer (DiT), una variante de Diffusion Policy que sustituye la red de difusión tradicional por un transformer de gran tamaño y añade condicionamiento por texto e imágenes. Esto permite que una única política pueda manejar múltiples tareas de manipulación, siempre que se le proporcione la instrucción textual y las observaciones visuales adecuadas. El modelo soporta tanto objetivos de difusión como de flow matching, aunque en este checkpoint concreto no se especifica cuál se ha empleado.

El entrenamiento se realizó con la librería LeRobot (versión 0.6.2) sobre el dataset `imstevenpmwork/super_chatton`, que contiene 100 episodios y 73.842 fotogramas a 30 FPS. La única tarea registrada es "Pick up the blue cube, and the yellow cube, and drop them in the green box one by one". La configuración de entrenamiento incluye 30.000 pasos, batch size de 80, optimizador Adam con learning rate de 1e-4 y semilla 1000. El robot utilizado para la recogida de datos es de tipo `omx_follower`, equipado con dos cámaras: una frontal y otra en la muñeca, ambas con resolución de 480x640.

## Capacidades

- Generación de acciones de control para manipulación robótica: produce vectores de acción de 6 dimensiones (posición/orientación de la pinza) a partir de observaciones de estado y de imágenes.
- Condicionamiento por texto: acepta descripciones de tareas en lenguaje natural para seleccionar el comportamiento adecuado, lo que habilita el aprendizaje multi-tarea.
- Condicionamiento por visión: integra dos entradas visuales (cámara frontal y cámara de muñeca) para percibir el entorno y guiar la ejecución.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento, con capacidad de generalizar a ligeras variaciones del escenario si se mantienen las condiciones de iluminación y disposición.
- Integración con LeRobot: se puede ejecutar y entrenar usando el ecosistema de Hugging Face LeRobot, incluyendo el CLI `lerobot-rollout` y `lerobot-train`.
- Soporte de flujo de trabajo completo: desde la instalación del hardware hasta el despliegue de la política, mediante las guías oficiales de LeRobot.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje: el modelo puede controlar un brazo robótico para recoger objetos de una cinta y depositarlos en contenedores, siempre que la tarea coincida con la instrucción textual entrenada. Su condicionamiento visual permite adaptarse a pequeñas variaciones de posición de los objetos.
- Manipulación de objetos en laboratorios de investigación: en entornos de robótica académica, la política puede ejecutar tareas repetitivas de recogida y colocación de muestras o cubos, reduciendo la intervención humana y acelerando los experimentos.
- Benchmark de aprendizaje por imitación: al estar publicado en HuggingFace y ser compatible con LeRobot, sirve como referencia para comparar arquitecturas de políticas de difusión multi-tarea en un entorno controlado y reproducible.
- Desarrollo de robots de servicio en entornos domésticos: el modelo puede integrarse en brazos robóticos de bajo coste para tareas sencillas de ordenación de objetos, como recoger cubos de colores y depositarlos en cajas.
- Investigación en condicionamiento multimodal para robótica: permite estudiar cómo el texto y la visión influyen en la generación de acciones, gracias a su arquitectura DiT y a la disponibilidad del dataset de entrenamiento.
- Formación y demostraciones en robótica educativa: al ser un modelo ligero (248M parámetros) y de código abierto, puede desplegarse en GPUs de consumo para prácticas de control robótico y aprendizaje por imitación en cursos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación sobre el robot real. Por tanto, no es posible presentar datos de éxito, tasas de acierto ni comparaciones con otros modelos en este momento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se han publicado datos oficiales de consumo de memoria. Dado que el checkpoint ocupa 1.0 GB en `safetensors`, se puede inferir que es un modelo ligero, pero no se debe tomar como cifra oficial.
- GPU recomendadas: no disponible. Por su tamaño, es probable que funcione en GPUs de consumo como RTX 3060 o superiores, pero no hay una recomendación oficial del autor.
- Compatibilidad con GPU de consumo: no confirmada. El modelo se ha entrenado con `--policy.device=cuda`, lo que indica que requiere una GPU NVIDIA para el entrenamiento; para inferencia, la documentación de LeRobot permite usar `cuda` o `cpu`, aunque el rendimiento en CPU será limitado.
- Opciones de despliegue: el modelo está pensado para ejecutarse mediante LeRobot, con los comandos `lerobot-rollout` y `lerobot-train`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de rendimiento en tiempo real.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se ofrecen comparaciones con otros modelos de la misma categoría (políticas de robótica basadas en difusión). El paper de Multi-Task DiT (arxiv 2507.05331) describe la arquitectura, pero no se incluyen tablas comparativas con otros checkpoints en la model card.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card indica que no se han proporcionado resultados de evaluación sobre el robot real, por lo que se desconoce la tasa de éxito real de la política.
- Dataset de entrenamiento reducido: solo 100 episodios y una única tarea, lo que limita la generalización a otros objetos, posiciones o condiciones de iluminación.
- Dependencia de las cámaras específicas: la política espera entradas de imagen con formas concretas (3, 480, 640) y nombres de claves `front` y `wrist`. Cualquier cambio en la configuración de cámaras requiere reentrenamiento o adaptación.
- Condicionamiento textual limitado: la instrucción de tarea está fijada en inglés y es muy específica. No se ha demostrado que el modelo entienda variaciones complejas del lenguaje natural.
- Riesgo de alucinación en acciones: al ser un modelo de difusión generativo, puede producir acciones incoherentes si las observaciones están fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de rendimiento ni soporte. Es responsabilidad del usuario validar el modelo en su propio entorno antes de desplegarlo en producción.
- No soporta tool calling ni generación de texto: es exclusivamente un modelo de control robótico, no un modelo de lenguaje generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imstevenpmwork/dit_super_chatton_4549-ema
- Paper de Multi-Task DiT: https://huggingface.co/papers/2507.05331
- Dataset de entrenamiento: https://huggingface.co/datasets/imstevenpmwork/super_chatton
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=imstevenpmwork/super_chatton
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de Multi-Task DiT en LeRobot: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
