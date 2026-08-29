# jaheroth/act_pusht_bs64_chunk32_dec7_seed1002

## Resumen

El modelo `jaheroth/act_pusht_bs64_chunk32_dec7_seed1002` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario jaheroth y publicada en Hugging Face bajo la licencia Apache-2.0. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que permite un control más estable y preciso en tareas de manipulación. Este modelo concreto ha sido entrenado sobre el dataset `lerobot/pusht`, un entorno de empuje de objetos 2D, y está integrado en el ecosistema LeRobot de Hugging Face.

Con 83,9 millones de parámetros, es un modelo compacto diseñado para ejecutarse en hardware de consumo. Su relevancia radica en que demuestra cómo un transformer relativamente pequeño puede aprender políticas de control efectivas a partir de datos teleoperados, siendo un ejemplo práctico para investigadores y desarrolladores que trabajan en robótica de bajo coste. La arquitectura ACT combina un codificador de visión con un decodificador autorregresivo, y su entrenamiento se realiza mediante imitación directa sin necesidad de refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 83.899.796 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de acciones fija, chunk size 32) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de acciones roboticas, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que utiliza un transformer con codificador de vision (ResNet) y un decodificador autorregresivo. La innovacion clave es el "action chunking": en lugar de predecir una sola accion por paso de tiempo, el modelo predice un bloque de 32 acciones futuras (segun el nombre del repo `chunk32`), lo que reduce la acumulacion de errores y mejora la suavidad del control. El entrenamiento se realiza con el framework LeRobot, usando el dataset `lerobot/pusht`, que contiene demostraciones teleoperadas de tareas de empuje de objetos. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado estandar de imitacion. El modelo tiene 7 capas de decodificador (`dec7` en el nombre) y un batch size de 64 (`bs64`), con una semilla fija (`seed1002`). No se especifican detalles adicionales sobre el dataset de entrenamiento (numero de episodios, composicion exacta) en la informacion disponible.

## Capacidades

- Control robotico por imitacion: predice secuencias de acciones (chunks) para tareas de manipulacion, especificamente en el entorno Pusht (empuje de objetos).
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluacion y despliegue en robots reales o simulados.
- Procesamiento de vision: el codificador ResNet procesa imagenes de camara para generar comandos de actuacion.
- Generacion de acciones autorregresiva: el decodificador transformer genera acciones paso a paso dentro de cada chunk.
- No soporta tool calling, agentes conversacionales ni procesamiento de lenguaje natural; es un modelo puramente motor.

## Casos de uso

- Manipulacion robotica en entornos simulados: el modelo puede controlar un brazo robotico en simulaciones como Pusht para empujar objetos a posiciones objetivo, util para investigacion en aprendizaje por imitacion.
- Prototipado de politicas de control: investigadores pueden usar este modelo como punto de partida para experimentar con ACT en otras tareas, ajustando el chunk size o la arquitectura.
- Evaluacion de algoritmos de imitacion: sirve como baseline para comparar metodos de action chunking frente a otros enfoques (por ejemplo, prediccion paso a paso) en terminos de tasa de exito y suavidad.
- Despliegue en robots de bajo coste: gracias a su tamano reducido (83,9M parametros), puede ejecutarse en GPUs de consumo (como RTX 3060) para control en tiempo real de robots SO-100 u otros compatibles con LeRobot.
- Educacion en robotica: adecuado para cursos o talleres donde se ensena aprendizaje por imitacion, ya que el entrenamiento y la inferencia estan documentados en LeRobot.
- Reproduccion de experimentos: al estar disponible en Hugging Face con pesos safetensors, permite reproducir los resultados del paper de ACT y verificar el comportamiento en el entorno Pusht.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye metricas de tasa de exito ni comparaciones con otros metodos en su model card. Para obtener datos de rendimiento, seria necesario ejecutar la evaluacion en el entorno Pusht siguiendo las instrucciones de LeRobot.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 83,9M parametros, la inferencia requiere aproximadamente 0,3 GB de VRAM en precision FP32 (los pesos ocupan 0,3 GB en el repositorio). Con cuantizacion (no publicada) podria reducirse aun mas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, o incluso CPU para inferencia lenta. Para entrenamiento se recomienda una GPU con 8 GB o mas (por ejemplo, RTX 3070, A100).
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia (`lerobot.record`). Tambien se puede cargar con la libreria `transformers` si se adapta, aunque el flujo principal es via LeRobot.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por chunk en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaheroth/act_pusht_bs64_chunk32_dec7_seed1002 | 83,9M | chunk 32 | Pusht (empuje) | Apache-2.0 | Hugging Face |
| arclabmit/pusht_act_model | no disponible | no disponible | Pusht (empuje) | no disponible | Hugging Face |
| Modelos ACT originales del paper (2304.13705) | ~80M (estimado) | chunk variable | Varias tareas de manipulacion | no especificada | Codigo en repositorio del paper |

La comparativa se limita a otros modelos ACT para Pusht. No hay datos de rendimiento publicos que permitan una comparacion cuantitativa. El modelo de jaheroth se distingue por su configuracion especifica (batch 64, chunk 32, 7 capas de decodificador) y su integracion directa con LeRobot.

## Limitaciones y advertencias

- Sesgos: al ser un modelo de control robotico, no presenta sesgos de lenguaje, pero su comportamiento depende de los datos de demostracion; si las demostraciones tienen sesgos en la estrategia de empuje, el modelo los replicara.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir acciones incorrectas si el entorno difiere de los datos de entrenamiento (por ejemplo, cambios en la iluminacion o posicion de la camara).
- Limitaciones de contexto: la ventana de acciones es fija (32 pasos), lo que limita la planificacion a corto plazo; no es adecuado para tareas que requieran razonamiento a largo plazo.
- Limitaciones de idioma: no aplica, es un modelo puramente motor.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero se debe incluir el aviso de licencia y atribucion.
- Caveats para produccion: el modelo fue entrenado en un entorno simulado especifico (Pusht); su transferencia a un robot real requiere recalibracion y posiblemente reentrenamiento con datos del mundo real. Ademas, no se han publicado evaluaciones de robustez ante perturbaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_bs64_chunk32_dec7_seed1002
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (libreria y documentacion): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset Pusht: https://huggingface.co/datasets/lerobot/pusht
- Modelo similar de referencia: https://huggingface.co/arclabmit/pusht_act_model
