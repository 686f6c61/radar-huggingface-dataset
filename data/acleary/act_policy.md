# acleary/act_policy

## Resumen

`acleary/act_policy` es una politica de aprendizaje por imitacion basada en el metodo Action Chunking with Transformers (ACT), descrito en el articulo arxiv:2304.13705. El modelo ha sido entrenado con el framework LeRobot de HuggingFace y esta disenado para controlar un robot de tipo `vega_1p_f5d6` en la tarea concreta de flexionar los brazos ("bend_arms"). A diferencia de los modelos de lenguaje, esta politica no genera texto, sino secuencias de acciones de 32 dimensiones a partir de observaciones visuales y del estado del robot.

El modelo cuenta con 51,7 millones de parametros y un tamano de repositorio de 0,2 GB, lo que lo convierte en una politica ligera y desplegable en hardware modesto. Se ha entrenado sobre un conjunto de datos teleoperado de 11 episodios y 3.719 fotogramas a 20 FPS, con una configuracion de entrenamiento de 1.000 pasos. Su relevancia radica en que ACT es uno de los metodos de imitacion mas utilizados en robotica por su capacidad para predecir fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.721.888 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robotico, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion basado en Transformers que predice fragmentos de acciones (action chunks) en lugar de acciones paso a paso. La arquitectura combina un codificador visual que procesa imagenes de dos camaras RGB (derecha e izquierda, con resolucion de 400x640) junto con el estado del robot (vector de 32 dimensiones), y un decodificador que genera acciones de 32 dimensiones. El entrenamiento se realizo con el framework LeRobot version 0.6.1 sobre el dataset `acleary/vega_1_p_flat`, que contiene 11 episodios teleoperados y 3.719 fotogramas a 20 FPS para la tarea "bend_arms". La configuracion de entrenamiento incluye 1.000 pasos, batch size de 8, optimizador AdamW, tasa de aprendizaje de 1e-05 y semilla 1000. No se indica el uso de RLHF, DPO ni otras tecnicas de refinamiento posteriores al aprendizaje supervisado.

## Capacidades

- Control robotico por imitacion: genera acciones de 32 dimensiones para el robot `vega_1p_f5d6`.
- Percepcion visual multimodal: procesa simultaneamente dos flujos de video RGB (camara derecha e izquierda) a resolucion 400x640.
- Integracion de estado: combina informacion visual con el estado propioceptivo del robot (vector de 32 dimensiones).
- Prediccion por fragmentos: genera secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la suavidad y estabilidad del movimiento.
- Tarea especifica: entrenado para la tarea "bend_arms" (flexion de brazos).
- Compatibilidad con LeRobot: se puede ejecutar y reentrenar mediante las herramientas CLI de LeRobot (`lerobot-rollout` y `lerobot-train`).

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el comportamiento de ACT con pocos datos de demostracion (solo 11 episodios) y evaluar su generalizacion.
- Desarrollo de politicas roboticas con LeRobot: el modelo puede cargarse con `lerobot-rollout` para ejecutar la tarea "bend_arms" en un robot `vega_1p_f5d6` real, lo que permite validar el pipeline completo de captura, entrenamiento y despliegue.
- Benchmark de metodos de imitacion: al ser un modelo pequeno (51,7 M de parametros) y con licencia Apache 2.0, puede utilizarse como referencia comparativa frente a otras arquitecturas (diffusion policies, RDT, etc.) en el mismo robot.
- Prototipado rapido de tareas de manipulacion: la tarea "bend_arms" es un movimiento simple que permite probar la viabilidad de ACT antes de escalar a tareas mas complejas.
- Educacion y formacion en robotica: el repositorio incluye documentacion completa de LeRobot y comandos de entrenamiento, lo que lo hace adecuado para cursos y talleres sobre aprendizaje por imitacion.
- Reentrenamiento y fine-tuning: el modelo puede servir como inicializacion para entrenar variantes con mas episodios o tareas adicionales mediante `lerobot-train`, aprovechando su tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de datos de tasa de exito, numero de ensayos ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 51,7 millones de parametros y pesos en safetensors (0,2 GB), la inferencia deberia caber en cualquier GPU con al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060 o superior) es suficiente para inferencia; el entrenamiento con batch size 8 y 1.000 pasos tambien es viable en GPUs de gama media.
- Compatibilidad con GPU de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo como RTX 3060, RTX 4070 o incluso en CPU para pruebas de baja frecuencia.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, que proporciona los comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La latencia dependera del hardware del robot, las camaras y la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| acleary/act_policy | 51,7 M | ACT (Transformer) | bend_arms en vega_1p_f5d6 | Apache 2.0 | HuggingFace |
| Politicas ACT de LeRobot (ej. lerobot/act_* ) | variable (tipicamente 20-100 M) | ACT | Diversas tareas de manipulacion | Apache 2.0 | HuggingFace |
| Diffusion policies (ej. lerobot/dp_*) | variable | U-Net + diffusion | Diversas tareas de manipulacion | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo publicados para este modelo concreto. La comparativa se limita a aspectos arquitectonicos y de disponibilidad. ACT y las diffusion policies son los dos enfoques de imitacion mas comunes en LeRobot; ACT tiende a ser mas estable con pocos datos, mientras que las diffusion policies suelen generar trayectorias mas suaves pero requieren mas datos de entrenamiento.

## Limitaciones y advertencias

- Datos de entrenamiento muy limitados: solo 11 episodios y 3.719 fotogramas para una unica tarea, lo que probablemente limite la generalizacion a variaciones de posicion, iluminacion o configuracion del robot.
- Sin resultados de evaluacion: la model card no incluye ninguna tasa de exito en robot real, por lo que el rendimiento real del modelo es desconocido.
- Tarea unica: el modelo solo ha sido entrenado para "bend_arms"; no es adecuado para otras tareas sin reentrenamiento.
- Dependencia del hardware especifico: el modelo espera dos camaras RGB con resolucion 400x640 y un robot `vega_1p_f5d6`; desplegarlo en otro hardware requiere reentrenamiento o adaptacion.
- Sin capacidades de lenguaje: no es un modelo de lenguaje ni soporta tool calling, agentes ni razonamiento simbolico.
- Riesgo de sobreajuste: con solo 1.000 pasos de entrenamiento y un dataset pequeno, el modelo podria memorizar las demostraciones en lugar de aprender una politica generalizable.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el usuario debe verificar que el hardware y el dataset asociado no tengan restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/acleary/act_policy
- Articulo ACT (arxiv:2304.13705): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/acleary/vega_1_p_flat
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=acleary/vega_1_p_flat
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
