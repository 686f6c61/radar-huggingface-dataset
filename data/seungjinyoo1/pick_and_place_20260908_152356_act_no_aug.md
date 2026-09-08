# seungjinyoo1/pick_and_place_20260908_152356_act_no_aug

## Resumen

El modelo `seungjinyoo1/pick_and_place_20260908_152356_act_no_aug` es una política de robótica basada en ACT (Action Chunking with Transformers), una técnica de aprendizaje por imitación descrita en el paper arXiv:2304.13705. Ha sido desarrollado por Seungjin Yoo (usuario `seungjinyoo1`) con el framework LeRobot de HuggingFace y entrenado para resolver una tarea de recoger y colocar objetos (pick and place) sobre un robot de tipo `so_follower`. La arquitectura es un transformer que predice bloques de acciones de 6 dimensiones en lugar de pasos individuales, lo que reduce el error acumulado típico de las políticas de control secuencial.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Utiliza dos entradas visuales (una cámara superior y otra en la muñeca) de 480x640 píxeles, junto con el estado del robot. Fue entrenado sobre un dataset propio de 50 episodios y 12.700 frames a 30 FPS, con 50.000 pasos de entrenamiento. Se presenta como un checkpoint de referencia para la comunidad de robótica que trabaja con LeRobot, y su relevancia actual radica en ser un ejemplo práctico y reutilizable de política ACT para manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de acción por chunks, no utiliza ventana de contexto de lenguaje) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el método ACT (Action Chunking with Transformers), que aborda el problema de la acumulación de errores en el control robótico mediante la predicción de secuencias cortas de acciones (chunks) en lugar de una única acción por paso. El modelo recibe observaciones compuestas por el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara superior y cámara de muñeca), y devuelve un chunk de acciones de 6 dimensiones que el sistema de bajo nivel puede ejecutar de forma continua.

El entrenamiento se realizó con el framework LeRobot versión 0.5.2, sobre el dataset `seungjinyoo1/pick_and_place_20260908_152356`, compuesto por 50 episodios y 12.700 frames a 30 FPS. La configuración de entrenamiento incluye 50.000 pasos, tamaño de lote 8, optimizador AdamW con una tasa de aprendizaje de 1e-05 y semilla 1000. El nombre "no_aug" indica que no se aplicó aumentación de datos durante el entrenamiento. No se especifica el uso de técnicas de ajuste fino tipo RLHF o DPO, al tratarse de un modelo de imitación supervisada.

## Capacidades

- Predice chunks de acciones de 6 dimensiones para control robótico, lo que permite una ejecución más suave y robusta que la predicción de acciones individuales.
- Procesa dos entradas visuales simultáneas (cámara superior y cámara de muñeca) de 480x640 píxeles, lo que proporciona información del entorno y de la herramienta.
- Aprende por imitación a partir de demostraciones teleoperadas, sin necesidad de modelar explícitamente la dinámica del robot.
- Está diseñado para el robot `so_follower` de LeRobot, con salida de acciones compatibles con este hardware.
- No es un modelo de lenguaje: no genera texto, no admite tool calling, ni agentes conversacionales, ni razonamiento simbólico.
- Su capacidad de generalización está limitada al tipo de tareas y configuración de sensores vistas durante el entrenamiento.

## Casos de uso

- Automatización de tareas de pick and place en entornos industriales: el modelo puede ejecutarse sobre un robot `so_follower` para recoger objetos de una posición y colocarlos en otra, utilizando las cámaras para localizar y aproximarse al objetivo.
- Investigación en aprendizaje por imitación: sirve como punto de partida o baseline para comparar distintas variantes de ACT, técnicas de aumentación de datos o configuraciones de entrenamiento.
- Prototipado rápido de nuevas tareas de manipulación: dado que se entrena con solo 50 episodios, es posible adaptar el modelo a un nuevo escenario con relativamente pocas demostraciones teleoperadas.
- Evaluación de políticas robóticas en el mundo real: se puede desplegar con `lerobot-rollout` para medir la tasa de éxito en la tarea de pick and place, o para validar cambios en el hardware o en las cámaras.
- Demostraciones educativas de robótica: el modelo y su dataset asociado permiten estudiar el pipeline completo de LeRobot, desde la grabación de datos hasta el entrenamiento y la inferencia.
- Integración en sistemas de control robótico: la salida de acciones de 6 dimensiones puede conectarse a controladores de bajo nivel para generar movimientos continuos en brazos robóticos o pinzas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado evaluaciones para esta política. No existen datos de MMLU, HumanEval, GSM8K ni métricas de tasa de éxito en la tarea de pick and place.

## Requisitos de hardware

- Parámetros totales: 51.668.614. En precisión FP32, el checkpoint ocupa aproximadamente 207 MB; en FP16, aproximadamente 103 MB.
- No se dispone de datos oficiales de VRAM para inferencia, pero por el tamaño del modelo se estima que cabe en cualquier GPU con más de 1 GB de VRAM.
- Cabe en tarjetas de consumo como RTX 3060, GTX 1660 o superiores, e incluso en plataformas embebidas tipo Jetson, aunque el procesamiento de dos cámaras a 30 FPS puede ser el factor limitante.
- No hay recomendaciones específicas de GPUs de centro de datos (A100, H100) por parte del autor; para una inferencia fluida con visión en tiempo real se recomienda una GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` para ejecutar la política sobre el robot. También puede cargarse en Python con la librería LeRobot para integraciones personalizadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen datos de otros modelos de la misma categoría con los que comparar. El repositorio del autor contiene otros checkpoints ACT para tareas similares, como `seungjinyoo1/pick_and_place_20260902_135749`, pero no se han publicado métricas de evaluación que permitan establecer una comparativa objetiva.

## Limitaciones y advertencias

- No se ha proporcionado ninguna evaluación formal del modelo: se desconoce su tasa de éxito real en la tarea de pick and place.
- El dataset de entrenamiento es pequeño (50 episodios, 12.700 frames), lo que puede limitar la generalización a nuevas posiciones de objetos, iluminación, o distracciones.
- La ausencia de aumentación de datos (indicada en el nombre del modelo) puede hacer que la política sea sensible a variaciones en las condiciones de la cámara o del entorno.
- El modelo está restringido al robot `so_follower` y a las cámaras denominadas `top` y `wrist`. Cualquier cambio en la configuración del hardware requeriría reentrenar o adaptar las entradas y salidas.
- No es un modelo de lenguaje: no tiene capacidades de comprensión textual, generación de código ni razonamiento simbólico, y no debe usarse para tareas de PLN.
- La licencia Apache 2.0 permite uso comercial y modificaciones, pero el usuario es responsable de evaluar la seguridad y el cumplimiento normativo al integrar el modelo en aplicaciones reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seungjinyoo1/pick_and_place_20260908_152356_act_no_aug
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de act de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/seungjinyoo1/pick_and_place_20260908_152356
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seungjinyoo1/pick_and_place_20260908_152356
- Perfil del autor: https://huggingface.co/seungjinyoo1
