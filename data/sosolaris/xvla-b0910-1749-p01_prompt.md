# SoSolaris/xvla-b0910-1749-p01_prompt

## Resumen

La ficha corresponde a `SoSolaris/xvla-b0910-1749-p01_prompt`, un *policy* de robótica resultante del ajuste fino del modelo base `lerobot/xvla-base`. No es un modelo de lenguaje: es una política Visión-Lenguaje-Acción (VLA) basada en X-VLA, un marco de *flow matching* con *soft prompts* que trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings aprendibles. El modelo ha sido entrenado con LeRobot para ejecutar una única tarea de manipulación sobre un robot `so100_follower`: "Grab the sock and put it in the box".

El modelo tiene 879.687.256 parámetros (unos 880 millones) y ocupa 1,8 GB en el repositorio, lo que es coherente con pesos almacenados en precisión de 16 bits. Consume tres entradas visuales de 256x256, 256x256 y 224x224 píxeles más un vector de estado de 8 dimensiones, y produce un vector de acción de 6 dimensiones. El ajuste fino se realizó sobre un conjunto de datos propio de 20 episodios y 7188 fotogramas grabados a 30 FPS.

Su relevancia es doble: por un lado, ejemplifica el flujo de trabajo actual de LeRobot para adaptar un modelo fundacional de robótica a un hardware concreto con muy pocos datos (20 episodios, 3000 pasos de entrenamiento); por otro, ilustra el enfoque de X-VLA de unificar morfologías y espacios de acción distintos dentro de un mismo modelo mediante *soft prompts*. La licencia Apache 2.0 facilita su reutilización y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en X-VLA: *flow matching* con *soft prompts* para codificar configuración de robot/hardware |
| Parametros totales | 879.687.256 (~880 M) |
| Longitud de contexto | No aplica en el sentido de contexto textual; no se documenta ventana de observación máxima. No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors de 1,8 GB, compatible con 16 bits) |
| Idiomas soportados | No disponible (el componente de lenguaje se usa para la instrucción de tarea, no como capacidad multilingüe documentada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.images.image` | Visual | (3, 256, 256) |
| `observation.images.image2` | Visual | (3, 256, 256) |
| `observation.images.image3` | Visual | (3, 224, 224) |
| `observation.state` | Estado | (8,) |
| `action` | Acción | (6,) |

## Arquitectura y entrenamiento

X-VLA es un marco VLA con *flow matching* que incorpora *soft prompts*: cada robot o conjunto de hardware se representa como una "tarea" mediante un pequeño conjunto de embeddings aprendibles. Esto permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos sin duplicar la red completa. La política aquí publicada es un ajuste fino del modelo base `lerobot/xvla-base`, con el robot declarado como `so100_follower` y las cámaras etiquetadas como `front` y `up`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el conjunto `SoSolaris/socks_20_diversified`: 20 episodios, 7188 fotogramas a 30 FPS, una única tarea ("Grab the sock and put it in the box"). La configuración exacta fue de 3000 pasos, tamaño de lote 32, optimizador `xvla-adamw`, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO (en políticas de imitación robótica el ajuste suele ser por imitación supervisada, pero no se confirma aquí).

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones a partir de observaciones visuales y de estado.
- Aprendizaje por imitación: reproduce la tarea demostrada en el dataset de entrenamiento ("Grab the sock and put it in the box").
- Fusión multimodal: procesa simultáneamente tres flujos de imagen (dos de 256x256 y uno de 224x224) y un vector de estado de 8 dimensiones.
- Condicionamiento por instrucción en lenguaje natural a través del parámetro de tarea (`--task`), heredado del componente de lenguaje del modelo base.
- Adaptación a una configuración de hardware concreta mediante *soft prompts* (enfoque X-VLA), lo que en principio permite reutilizar el mismo tronco para otros robots cambiando el prompt.
- Ejecución en bucle cerrado a la frecuencia de control del robot (los datos se grabaron a 30 FPS).
- No dispone de *tool calling*, *function calling* ni capacidades de agente en el sentido de los modelos de lenguaje; tampoco se documentan capacidades de audio, visión general o *thinking mode*.

## Casos de uso

- Replicación de la tarea entrenada en un SO-100: ejecutar la política con `lerobot-rollout` sobre un `so100_follower` para recoger un calcetín y depositarlo en una caja, usando las mismas claves de observación con las que se entrenó.
- Investigación en modelos fundacionales de robótica: servir como punto de partida para estudiar cómo se comportan los *soft prompts* de X-VLA al adaptar un modelo base a un hardware concreto con muy pocos datos.
- Recolección de datos y ampliación del dataset: desplegar la política como inicializador para recoger episodios adicionales y aumentar la diversidad del conjunto `socks_20_diversified`, una práctica habitual en *data flywheel* de imitación.
- Docencia y prototipado en robótica de bajo coste: el tamaño de 880 M de parámetros y el soporte de LeRobot permiten entrenar y desplegar en un único equipo con GPU de gama media, lo que encaja en laboratorios académicos con presupuesto limitado.
- Automatización de una celda de *pick-and-place* muy acotada: en un entorno controlado con posiciones, iluminación y objetos fijos, la política puede sustituir a un script de movimiento programado para una tarea de recogida concreta.
- Evaluación comparativa de métodos de ajuste fino: usar esta configuración (3000 pasos, lote 32, lr 1e-4) como referencia reproducible frente a otras recetas de entrenamiento sobre el mismo dataset y el mismo robot.
- Integración como componente de un *pipeline* mayor de automatización: la política produce acciones que un sistema externo puede consumir, de modo que puede combinarse con lógica de orquestación, parada de seguridad o supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet". No consta ninguna tabla de ensayos, tasa de éxito, número de pruebas ni condiciones de evaluación (posiciones de objetos, iluminación o distractores). Tampoco se proporcionan métricas de entrenamiento (pérdida final, curvas) más allá de la configuración de hiperparámetros.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del número de parámetros (879.687.256): aproximadamente 3,5 GB en FP32, 1,8 GB en FP16/BF16 y 0,9 GB en INT8. Estas cifras corresponden solo a los pesos; hay que sumar el coste de activaciones del tronco visual con entradas de 256x256, por lo que el consumo real en ejecución será superior. No se dispone de mediciones publicadas.
- El repositorio ocupa 1,8 GB, coherente con pesos en 16 bits, lo que sugiere que la inferencia por defecto se realiza en FP16/BF16.
- GPU recomendadas: no hay lista oficial. Por tamaño, cualquier GPU de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) debería poder ejecutar la política en FP16; para entrenamiento con lotes de 32, se recomienda una GPU con 24 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en FP16, aunque no está verificado en la información disponible.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` es la vía documentada. Se puede entrenar o reajustar con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. El único dato relacionado es que los datos se grabaron a 30 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SoSolaris/xvla-b0910-1749-p01_prompt` | 879.687.256 (~880 M) | Política VLA X-VLA ajustada para `so100_follower` | No aplica | apache-2.0 | HuggingFace |
| `lerobot/xvla-base` | No disponible en la información proporcionada | Modelo base X-VLA preentrenado | No aplica | No disponible en la información proporcionada | HuggingFace |

No se dispone de datos comparativos de otros modelos de la misma categoría (por ejemplo, otras políticas VLA de LeRobot) en la información proporcionada, por lo que no se incluyen cifras de parámetros, contexto ni rendimiento de terceros.

## Limitaciones y advertencias

- Entrenada para una única tarea y un único robot (`so100_follower`): no cabe esperar generalización a otras tareas, objetos o morfologías sin reajuste.
- Dataset muy reducido: 20 episodios y 7188 fotogramas, lo que limita la robustez ante cambios de iluminación, posición de los objetos o presencia de distractores.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que se desconoce la fiabilidad real de la política.
- Inconsistencia documental en las entradas: la sección "Model Details" declara dos cámaras (`front`, `up`), pero la tabla de entradas lista tres flujos visuales (`image`, `image2`, `image3`). Es necesario verificar las claves de observación exactas antes de desplegar; el propio README advierte que los nombres de cámara deben coincidir con las claves de entrenamiento.
- Riesgo de sobreajuste a las condiciones de grabación del dataset original; no hay datos sobre variabilidad ambiental en el conjunto.
- No hay información sobre sesgos del componente de lenguaje heredado del modelo base, ni sobre el comportamiento del modelo ante instrucciones distintas de la entrenada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero al derivar de `lerobot/xvla-base` conviene revisar también la licencia y las condiciones del modelo base y del paper asociado.
- Es un modelo de robótica, no un asistente conversacional: no debe evaluarse con métricas de lenguaje (MMLU, HumanEval, GSM8K) ni emplearse para generación de texto.
- Aviso de seguridad: cualquier despliegue sobre hardware físico debe incorporar paradas de emergencia y supervisión; una política de imitación puede producir acciones erráticas fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoSolaris/xvla-b0910-1749-p01_prompt
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/socks_20_diversified
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/socks_20_diversified
- Artículo de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv 2510.10274)
- Guía de LeRobot para xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de despliegue en robot: https://huggingface.co/docs/lerobot/main/en/inference
- Documentación de entrenamiento por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente herramientas de comprobación de DNS), por lo que no se añaden enlaces adicionales más allá de los derivados de la información de HuggingFace.
