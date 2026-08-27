# mi-kicic/xarm7_mj_ds32_filtered_v2_act

## Resumen

El modelo `mi-kicic/xarm7_mj_ds32_filtered_v2_act` es una política de imitación basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Está diseñada para controlar un brazo robótico UFACTORY xArm7 en el simulador MuJoCo, ejecutando la tarea de recoger un motor azul e insertarlo en una caja de cambios naranja. El modelo fue desarrollado por el usuario mi-kicic y publicado bajo licencia Apache 2.0.

ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. El modelo tiene 51,6 millones de parámetros y consume observaciones de tres cámaras (frontal, muñeca y esquina) junto con el estado del robot, produciendo acciones de 8 dimensiones. Su relevancia radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con herramientas open source, desde la recopilación de datos teleoperados hasta la inferencia en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.597.960 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de estado e imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, presentada en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT combina un codificador visual (ResNet) para procesar las imagenes de las camaras, un transformer encoder-decoder que opera sobre el estado del robot y las caracteristicas visuales, y un decodificador que predice un chunk de acciones futuras. En lugar de predecir una sola accion, el modelo genera una secuencia de acciones (chunk) que se ejecuta de forma open-loop, lo que reduce la acumulacion de errores y mejora la robustez.

El entrenamiento se realizo con el dataset `mi-kicic/xarm7_mj_ds32_filtered`, que contiene 1.975 episodios y 334.022 frames a 10 FPS, recopilados mediante teleoperacion en el simulador MuJoCo. La configuracion de entrenamiento incluye 30.000 pasos, batch size de 64, optimizador AdamW con learning rate de 3e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; es un entrenamiento puramente supervisado de imitacion.

## Capacidades

- Control robotico de manipulacion: ejecuta la tarea de pick-and-place e insercion de un motor en una caja de cambios.
- Percepcion multimodal: procesa tres flujos de imagen (frontal, muneca y esquina) a resolucion 512x512 junto con el estado del robot (15 dimensiones).
- Prediccion de acciones por chunks: genera secuencias de 8 acciones por paso, lo que permite movimientos suaves y coordinados.
- Inferencia en simulacion: compatible con el entorno MuJoCo xArm7 de LeRobot.
- Integracion con LeRobot: se puede cargar y ejecutar directamente con las herramientas CLI de LeRobot (`lerobot-rollout`).
- No soporta tool calling, agentes, razonamiento multimodal ni procesamiento de lenguaje natural: es una politica puramente motora.

## Casos de uso

- Automatizacion de tareas de ensamblaje en simulacion: el modelo puede insertar componentes (motor en caja de cambios) de forma repetitiva, sirviendo como banco de pruebas para algoritmos de manipulacion.
- Investigacion en aprendizaje por imitacion: permite estudiar el efecto del action chunking en la tasa de exito de tareas de precision, comparando con politicas que predicen acciones individuales.
- Desarrollo de pipelines de robotica con LeRobot: sirve como ejemplo de referencia para entrenar y desplegar politicas ACT con datos teleoperados en MuJoCo.
- Generacion de datos sinteticos para entrenamiento: al ejecutar la politica en simulacion, se pueden recopilar nuevas trayectorias para aumentar el dataset o entrenar modelos mas avanzados.
- Validacion de hardware virtual: permite probar el control de un xArm7 en MuJoCo antes de transferir la politica a un robot fisico, reduciendo riesgos y costes.
- Educacion en robotica: util como material didactico para ensenar conceptos de imitation learning, transformers aplicados a control y uso de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet". No se proporcionan metricas de tasa de exito, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamano del modelo (51,6 M de parametros) y la entrada de tres imagenes 512x512, se estima que cabe en una GPU consumer con al menos 8 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Para entrenamiento, se recomienda una GPU con 16 GB o mas (A100, RTX 4090) dado el batch size de 64.
- Si cabe en consumer GPU: probablemente si, para inferencia, aunque no hay confirmacion oficial.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia via CLI (`lerobot-rollout`) y entrenamiento con `lerobot-train`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la resolucion de las camaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mi-kicic/xarm7_mj_ds32_filtered_v2_act | 51,6 M | no aplica | Insercion de motor en caja de cambios (xArm7, MuJoCo) | Apache 2.0 | Hugging Face |
| mi-kicic/xarm7_mj_ds3-2_smolvla | no disponible | no disponible | no disponible (probablemente tarea similar con SmolVLA) | no disponible | Hugging Face |
| Politicas ACT de referencia en LeRobot | variable | no aplica | Diversas tareas de manipulacion | Apache 2.0 | Hugging Face / GitHub |

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoria. El modelo SmolVLA del mismo autor existe pero no se han encontrado especificaciones publicas.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una unica tarea (recoger motor azul e insertarlo en caja de cambios naranja) en un entorno de simulacion especifico. No generaliza a otras tareas, objetos o configuraciones de camara sin reentrenamiento.
- Dependencia del simulador: la politica esta entrenada y validada en MuJoCo con el robot xArm7. La transferencia a un robot fisico requeriria calibracion adicional y probablemente reentrenamiento con datos reales.
- Sin evaluacion publicada: no hay resultados de tasa de exito ni pruebas en robot real, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste: con 1.975 episodios de una sola tarea, existe riesgo de que la politica memorice las trayectorias del dataset en lugar de aprender una estrategia robusta.
- Sin capacidades linguisticas ni de razonamiento: no es un modelo multimodal generalista; solo procesa imagenes y estado del robot para generar acciones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias de funcionamiento en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mi-kicic/xarm7_mj_ds32_filtered_v2_act
- Dataset de entrenamiento: https://huggingface.co/datasets/mi-kicic/xarm7_mj_ds32_filtered
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mi-kicic/xarm7_mj_ds32_filtered
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Modelo relacionado del mismo autor: https://huggingface.co/mi-kicic/xarm7_mj_ds3-2_smolvla
