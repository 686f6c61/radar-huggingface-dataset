# ases200q2/roboverse_pick_cube_genesisE100_act_20260910_2256

## Resumen

El modelo `ases200q2/roboverse_pick_cube_genesisE100_act_20260910_2256` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación publicado en el paper arXiv:2304.13705. Lo desarrolla el usuario ases200q2 y se distribuye a través de HuggingFace Hub con la librería LeRobot, el framework de HuggingFace para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado y la imagen de una cámara y produce comandos de acción de 9 dimensiones.

La política tiene 51.674.761 parámetros y se ha entrenado sobre el dataset `ases200q2/roboverse-pick_cube-genesis-E100`, compuesto por 100 episodios y 9.627 fotogramas grabados a 30 FPS para una única tarea: recoger un cubo (`pick_cube`). El robot objetivo es un Franka y la observación visual se captura con una única cámara denominada `main_camera`. El repositorio ocupa 0,2 GB y los pesos se publican en formato safetensors bajo licencia Apache 2.0.

Su relevancia es práctica más que arquitectónica: ACT es el método de referencia de LeRobot para imitación con *chunking* de acciones, y este checkpoint sirve como ejemplo reproducible de un pipeline completo de entrenamiento y despliegue. La model card no incluye resultados de evaluación en robot real, por lo que su utilidad industrial está por verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con componente VAE |
| Parametros totales | 51.674.761 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un LLM); consume observaciones por fotograma y predice *chunks* de acciones, longitud de chunk no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ/GPTQ no publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con una cadena de texto `pick_cube`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Tipo de robot | franka |
| Camaras | main_camera |
| Entradas | `observation.state` (9,), `observation.velocity` (9,), `observation.images.main_camera` (3, 240, 320) |
| Salidas | `action` (9,) |
| Libreria | lerobot 0.6.1 (entrenamiento) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice *chunks* de acciones de corta duración en lugar de un único paso, lo que reduce el error de composición acumulado típico de las políticas paso a paso. La arquitectura combina un codificador visual (la observación `observation.images.main_camera` de 3x240x320), un codificador de estado que recibe los 9 valores de posición y los 9 de velocidad, y un decodificador transformer que emite las 9 dimensiones de acción. Incorpora un autoencoder variacional (VAE) para modelar la variabilidad de las demostraciones humanas, de forma que la política no colapse hacia la media de las trayectorias. No se especifica en la información disponible la profundidad del transformer, el número de cabezas de atención ni la longitud exacta del *chunk*.

El entrenamiento se realizó con LeRobot 0.6.1 durante 40.000 pasos, con tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos provienen de teleoperación sobre el dataset `roboverse-pick_cube-genesis-E100`: 100 episodios, 9.627 fotogramas a 30 FPS, una sola tarea (`pick_cube`). No se documenta el uso de RLHF, DPO ni *fine-tuning* posterior; es exclusivamente aprendizaje supervisado por imitación. No hay resultados de evaluación en robot real publicados en la model card.

## Capacidades

- Control visuomotor de un robot Franka para la tarea de recoger un cubo (`pick_cube`), a partir de una imagen de 240x320 y del estado propioceptivo.
- Predicción de *chunks* de acciones de 9 dimensiones, lo que aporta movimientos más suaves y coherentes que una política paso a paso.
- Manejo de variabilidad en las demostraciones gracias al componente VAE de ACT.
- Condicionamiento por tarea mediante una cadena de texto (`--task="pick_cube"`), aunque el modelo está especializado en una única tarea.
- Ejecución en bucle cerrado a 30 FPS, con la frecuencia de control marcada por el entorno de despliegue (LeRobot).
- Integración directa con los comandos `lerobot-rollout` y `lerobot-train` para evaluación y reentrenamiento.
- No dispone de *tool calling*, capacidades de agente, razonamiento multi-paso, visión general, audio ni generación de lenguaje: es una política robótica de una sola tarea.

## Casos de uso

- Recogida de objetos en un banco de laboratorio: la política ejecuta la tarea `pick_cube` sobre un Franka con una cámara cenital o frontal, útil como *baseline* reproducible para comparar métodos de imitación.
- Validación de un pipeline de aprendizaje por imitación de extremo a extremo: sirve para verificar que la grabación de datos con LeRobot, el entrenamiento con `lerobot-train` y el despliegue con `lerobot-rollout` funcionan de forma coherente antes de escalar a tareas propias.
- Prototipado de *pick and place* en investigación académica: al estar entrenado sobre un único objeto y una única tarea, es un punto de partida para estudiar generalización a nuevas posiciones del cubo o a iluminación distinta.
- Generación de datos sintéticos o en simulación: el nombre del dataset (`roboverse...genesis`) sugiere un origen sintético, lo que permite experimentar con *sim-to-real* sin riesgo sobre hardware.
- Docencia y formación en robótica: el modelo es ligero (51,7 M de parámetros, 0,2 GB) y puede ejecutarse en un equipo con GPU de gama media, lo que facilita prácticas guiadas.
- *Fine-tuning* sobre nuevas demostraciones: la configuración de entrenamiento documentada (AdamW, lr 1e-5, lote 64, 40.000 pasos) sirve como receta para adaptar la política a variantes de la tarea o a otro robot del mismo tipo.
- Referencia para comparativas de políticas en LeRobot: al ser un checkpoint ACT estándar, permite medir diferencias frente a otras políticas (por ejemplo, Diffusion Policy) sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la nota explícita "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, número de ensayos ni métricas de simulación o robot real para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 0,2 GB; sumando activaciones del codificador visual y del transformer de acciones, el consumo se mantiene por debajo de 1-2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=ases200q2/roboverse_pick_cube_genesisE100_act_20260910_2256` es la vía documentada. El entrenamiento se realiza con `lerobot-train --policy.type=act`. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no se trata de un modelo de lenguaje.
- Restricciones de despliegue: el nombre de la cámara debe coincidir exactamente con la clave de observación `observation.images.main_camera`, y el robot debe ser de tipo `franka` con estado y acción de 9 dimensiones.
- Latencia y throughput estimados: no disponible en la información proporcionada. La frecuencia de control de referencia del dataset es de 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observaciones | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (ACT, roboverse pick_cube) | 51.674.761 | 1 camara 3x240x320, estado 9, velocidad 9 | apache-2.0 | HuggingFace Hub, 0 descargas | Una sola tarea `pick_cube`, robot Franka, sin resultados de evaluacion |
| ACT original (paper arXiv:2304.13705) | no disponible en la informacion proporcionada | multiples camaras y configuraciones en el paper | no disponible | implementacion en LeRobot | Metodo de referencia del que deriva este checkpoint |
| Otras politicas de LeRobot (por ejemplo, Diffusion Policy) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace Hub | No se dispone de datos comparativos verificados en esta busqueda |

No se dispone de datos de rendimiento comparativos publicados para este checkpoint ni de cifras verificadas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea `pick_cube`; fuera de ese objetivo no se puede esperar un comportamiento útil.
- Volumen de datos reducido: 100 episodios y 9.627 fotogramas son una base pequeña, lo que limita la robustez ante cambios de posición, iluminación, fondo o tipo de objeto.
- Sin evaluación publicada: no hay tasas de éxito ni ensayos documentados, por lo que el rendimiento real es desconocido y no debe asumirse que la política funciona correctamente.
- Posible brecha simulación-realidad: el nombre del dataset (`roboverse-pick_cube-genesis`) apunta a un origen sintético; el traslado a un Franka físico puede degradar el rendimiento.
- Dependencia estricta de la interfaz de observación: exige `observation.state` y `observation.velocity` de 9 dimensiones y una cámara con la clave exacta `observation.images.main_camera`; un cambio de nombre, resolución o calibración puede invalidar las predicciones.
- Riesgo de acciones fuera de distribución: ante configuraciones no vistas durante el entrenamiento, la política puede generar comandos de acción erráticos, lo que en un robot real implica riesgo físico y exige paradas de emergencia y límites de par y velocidad.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta *tool calling* ni agentes, y no tiene capacidades multilingües que evaluar.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de las obligaciones de seguridad ni de citar el método ACT y LeRobot según la model card.
- Ausencia de garantías del autor: el repositorio no incluye documentación sobre sesgos del dataset, condiciones de recogida ni protocolos de seguridad en el robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ases200q2/roboverse_pick_cube_genesisE100_act_20260910_2256
- Dataset de entrenamiento: https://huggingface.co/datasets/ases200q2/roboverse-pick_cube-genesis-E100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ases200q2/roboverse-pick_cube-genesis-E100
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a paginas de configuracion de Windows, Chrome y Android), por lo que no se han podido anadir enlaces adicionales de prensa, blogs o demos.
