# powerstone829/so101_plastic_tomato_act_v4_msi_gpu

## Resumen

El modelo `powerstone829/so101_plastic_tomato_act_v4_msi_gpu` es una política de robótica basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollada por Wonseok Jeon, esta política implementa aprendizaje por imitación para controlar un brazo robótico SO-101 (SO Follower) en la tarea específica de recoger un tomate de plástico de un contenedor grande y colocarlo en un bol pequeño. El modelo fue entrenado sobre un dataset de 50 episodios teleoperados con 28.577 fotogramas a 60 FPS, capturados con dos cámaras (frontal y de muñeca).

Con 51,77 millones de parámetros, este modelo es relativamente compacto en comparación con los grandes modelos de lenguaje, pero su relevancia radica en que demuestra cómo los transformadores pueden aplicarse al control motor en tiempo real. ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que reduce la propagación de errores y mejora la tasa de éxito en manipulaciones precisas. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace accesible para investigación y aplicaciones industriales.

La arquitectura combina un codificador de visión para procesar las imágenes de las cámaras con un transformador que genera acciones de 6 dimensiones (posición y orientación del efector final). El modelo se publicó en agosto de 2026 y está disponible en Hugging Face con pesos en formato safetensors, listo para ser desplegado mediante las herramientas CLI de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) con codificador de vision |
| Parametros totales | 51.771.014 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robotica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos de acciones de longitud fija en lugar de acciones individuales. La arquitectura se basa en un transformador con una cabeza de vision que procesa dos flujos de imagen (camara frontal y camara de muneca, ambas a 480x640 píxeles) junto con un vector de estado de 6 dimensiones que representa la posicion y orientacion del efector final. El modelo genera secuencias de acciones de 6 dimensiones que se ejecutan de forma autoregresiva.

El entrenamiento se realizo con el framework LeRobot version 0.5.2, utilizando el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 2 y un total de 4.000 pasos de entrenamiento. El dataset de entrenamiento, `powerstone829/so101_plastic_tomato_v2_20260813_201008`, contiene 50 episodios teleoperados con 28.577 fotogramas a 60 FPS. La tarea se describe como "recoger un tomate de plastico de un contenedor grande y colocarlo en un bol pequeno". El metodo no emplea RLHF ni DPO; se trata de aprendizaje supervisado puro sobre demostraciones teleoperadas.

Una innovacion clave de ACT es el uso de un CVAE (Conditional Variational Autoencoder) que permite modelar la multimodalidad de las demostraciones humanas, capturando variaciones en la forma de ejecutar la tarea. Ademas, el chunking de acciones reduce la frecuencia de decisiones del modelo, lo que mejora la estabilidad del control en tiempo real.

## Capacidades

- Control robotico de brazo SO-101: genera comandos de accion de 6 dimensiones (posicion y orientacion) para el efector final.
- Percepcion visual multimodal: procesa simultaneamente imagenes de dos camaras (frontal y de muneca) a resolucion 480x640.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Ejecucion de tareas de manipulacion precisas: recoger y colocar objetos en posiciones especificas.
- Generalizacion limitada a variaciones de la tarea: el modelo esta especializado en la tarea del tomate de plastico.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.
- Ejecucion en tiempo real: el modelo es lo suficientemente ligero (51,7 M de parametros) para inferencia en GPU de consumo.

## Casos de uso

- Automatizacion de pick-and-place en entornos controlados: el modelo puede integrarse en una celda de trabajo para transferir objetos entre contenedores, como en lineas de ensamblaje o clasificacion de piezas pequenas. Su entrenamiento especifico en una tarea de recoger-colocar lo hace adecuado para escenarios donde la posicion de los objetos varia ligeramente.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de ACT, chunking de acciones y generalizacion en robots SO-101. Los investigadores pueden clonar el repositorio y comparar con otras politicas entrenadas en el mismo robot.
- Educacion en robotica: el modelo puede utilizarse en cursos de robotica para demostrar el flujo completo de LeRobot: teleoperacion, entrenamiento, evaluacion y despliegue. Su tamano reducido permite entrenarlo y ejecutarlo en una GPU de gama media.
- Benchmarking de politicas de control: al estar publicado con un dataset asociado, permite comparar el rendimiento de ACT frente a otros metodos (como Diffusion Policy) en la misma tarea y con los mismos datos.
- Prototipado rapido de celdas roboticas: en entornos industriales donde se necesita validar la viabilidad de automatizar una tarea de manipulacion, este modelo permite probar rapidamente si el enfoque de aprendizaje por imitacion es suficiente antes de invertir en soluciones mas complejas.
- Desarrollo de sistemas de recogida selectiva de residuos: aunque el objeto es un tomate de plastico, la misma arquitectura puede reentrenarse con datasets especificos para clasificar y manipular distintos tipos de residuos en plantas de reciclaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet." No se dispone de datos de tasa de exito en pruebas reales con el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 51,7 M de parametros y entrada de imagen 480x640, se estima que requiere menos de 4 GB de VRAM en FP32.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM es suficiente. Se recomienda una NVIDIA RTX 3060 o superior para comodidad. El entrenamiento se realizo en una GPU MSI, segun el nombre del repositorio.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), que requiere conexion con el robot SO-101 y las camaras configuradas via OpenCV.
- Latencia y throughput: no disponible. Al ser un modelo pequeno con chunking de acciones, se espera una latencia inferior a 50 ms por prediccion en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| powerstone829/so101_plastic_tomato_act_v4_msi_gpu | 51,77 M | ACT | Pick-and-place tomate | Apache 2.0 | Hugging Face |
| powerstone829/so101_plastic_tomato_act_v2_msi_gpu | no disponible | ACT | Pick-and-place tomate | Apache 2.0 | Hugging Face |
| Diffusion Policy (referencia general) | variable | Diffusion | Manipulacion robotica | MIT | Diversos repos |

La comparativa directa con el modelo v2 del mismo autor no es posible por falta de datos publicos sobre su configuracion. En cuanto a Diffusion Policy, es el principal metodo alternativo a ACT en el ecosistema LeRobot, pero no existe una comparativa publicada para esta tarea especifica. La diferencia clave es que ACT predice chunks de acciones, mientras que Diffusion Policy genera acciones mediante un proceso de denoising iterativo, lo que suele dar mayor robustez pero a costa de mayor coste computacional.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo sabe ejecutar la tarea del tomate de plastico en el escenario concreto de entrenamiento. No generaliza a otros objetos, posiciones de camara o iluminacion sin reentrenamiento.
- Sin resultados de evaluacion publicados: no hay datos de tasa de exito en pruebas reales, por lo que su rendimiento efectivo es desconocido.
- Dependencia del hardware: requiere el robot SO-101 y dos camaras configuradas exactamente con los mismos nombres de clave (`front` y `wrist`) y resolucion (480x640) que las usadas en entrenamiento.
- Dataset limitado: 50 episodios es un volumen pequeno que puede provocar sobreajuste a las demostraciones concretas.
- Riesgo de fallo en entornos no controlados: variaciones en la iluminacion, posicion de la camara o presencia de distractores pueden degradar significativamente el rendimiento.
- Sin soporte de tool calling ni procesamiento de lenguaje: es un modelo puramente motor, no un agente conversacional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias de funcionamiento en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/powerstone829/so101_plastic_tomato_act_v4_msi_gpu
- Dataset de entrenamiento: https://huggingface.co/datasets/powerstone829/so101_plastic_tomato_v2_20260813_201008
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=powerstone829/so101_plastic_tomato_v2_20260813_201008
