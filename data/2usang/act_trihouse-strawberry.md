# 2usang/act_trihouse-strawberry

## Resumen

El modelo `2usang/act_trihouse-strawberry` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación desarrollado por el equipo de investigación de Google y presentado en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). El modelo ha sido entrenado y publicado por el usuario 2usang utilizando el framework LeRobot de Hugging Face, sobre el dataset `2usang/trihouse-strawberry`, que contiene demostraciones teleoperadas de una tarea de manipulación con un brazo robótico SO-100.

ACT resuelve el problema de la predicción de acciones de baja granularidad en robótica: en lugar de predecir una única acción por paso de tiempo, predice un "chunk" (bloque) de acciones futuras, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación fina. Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en hardware de bajo coste, y su licencia Apache-2.0 permite uso comercial sin restricciones. Su relevancia actual radica en que demuestra cómo un transformer ligero puede aprender políticas de control robustas a partir de pocas demostraciones, un enfoque clave en la robótica de bajo coste y la investigación en aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer encoder-decoder |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de entrenamiento; en ACT se usa un historial de observaciones y un chunk de acciones) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors con precision completa) |
| Idiomas soportados | no disponible (modelo de control robotico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, que combina un transformer encoder-decoder con una estrategia de "action chunking". El encoder procesa las observaciones (imagenes y estado de las articulaciones) de un historial de pasos, y el decoder genera de forma autoregresiva un bloque de acciones futuras (tipicamente entre 10 y 100 pasos). Esta prediccion por bloques reduce la acumulacion de errores y permite un control mas suave. El entrenamiento se realiza mediante aprendizaje por imitacion sobre demostraciones teleoperadas, sin refuerzo. En este caso, se utilizo el framework LeRobot, que implementa el pipeline completo de captura de datos, entrenamiento y evaluacion. No se dispone de detalles especificos sobre el numero de episodios de entrenamiento, el tamaño exacto del dataset ni si se aplicaron tecnicas adicionales como aumentacion de datos o regularizacion. El modelo se ha entrenado para una tarea concreta (trihouse-strawberry) y su peso esta pensado para ser cargado con la libreria LeRobot.

## Capacidades

- Control de un brazo robotico SO-100 (follower) mediante prediccion de acciones de articulacion.
- Aprendizaje por imitacion: reproduce comportamientos demostrados por teleoperacion.
- Generacion de chunks de acciones (action chunking) para movimientos suaves y estables.
- Integracion nativa con el ecosistema LeRobot: carga, inferencia y evaluacion mediante comandos `lerobot-record` y `lerobot-train`.
- Capacidad de ejecutar tareas de manipulacion fina en entornos de bajo coste (hardware tipo SO-100).
- No incluye capacidades de lenguaje, vision general ni tool calling; es una politica especifica para un robot y una tarea determinada.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del action chunking en tareas de manipulacion, comparando con otras politicas (por ejemplo, Diffusion Policy) en el mismo hardware.
- Prototipado de tareas roboticas en laboratorio: un investigador puede cargar el modelo con LeRobot y evaluar su rendimiento en un robot SO-100 fisico o simulado, midiendo tasas de exito en la tarea de recogida/colocacion de objetos (strawberry).
- Educacion en robotica: permite a estudiantes universitarios experimentar con politicas transformer sin necesidad de GPUs potentes, gracias a su tamaño reducido (51,7M parametros).
- Base para fine-tuning: al ser un modelo preentrenado en una tarea concreta, puede ajustarse con nuevas demostraciones para tareas similares (por ejemplo, manipular otros objetos) mediante el flujo de entrenamiento de LeRobot.
- Evaluacion de hardware de bajo coste: sirve para validar si un brazo robotico de bajo coste (tipo SO-100) puede ejecutar politicas de control complejas con suficiente precision.
- Replicacion de resultados: dado que el modelo y el dataset estan publicados, otros grupos pueden reproducir los experimentos y comparar metricas de exito, contribuyendo a la reproducibilidad en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye metricas de exito sobre episodios de evaluacion, ni comparativas con otros metodos en el mismo dataset. Para obtener datos de rendimiento, el usuario deberia ejecutar la evaluacion con `lerobot-record` sobre un robot fisico o en simulacion, y registrar la tasa de exito por episodio.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 51,7M de parametros, el modelo ocupa aproximadamente 207 MB en precision FP32 (51,7M x 4 bytes). En FP16 serian unos 103 MB. Por tanto, cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs integradas o tarjetas antiguas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1050 Ti, RTX 2060, RTX 4090). No requiere GPU de datacenter.
- Ejecucion en consumer GPU: si, sin problema. Incluso podria ejecutarse en CPU, aunque la latencia seria mayor.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluacion. Tambien es posible exportar el modelo a otros formatos (por ejemplo, ONNX) para despliegue en edge, aunque no hay documentacion oficial al respecto.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo y la naturaleza de la tarea (control a frecuencia de 10-30 Hz tipicamente), se espera que la inferencia sea en tiempo real en una GPU moderna, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoria en la informacion proporcionada. Sin embargo, se puede contextualizar frente a otras politicas de aprendizaje por imitacion para robotica de bajo coste:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT (este modelo) | 51,7M | No disponible | Apache-2.0 | Hub de Hugging Face |
| Diffusion Policy (por ejemplo, `lerobot/diffusion_policy`) | Tipicamente 10-100M | No disponible | Apache-2.0 | Hub de Hugging Face |
| VQ-BeT (por ejemplo, `lerobot/vqbet`) | ~50-100M | No disponible | Apache-2.0 | Hub de Hugging Face |

Estas alternativas son comparables en tamaño y estan disponibles en el ecosistema LeRobot, pero no se han encontrado benchmarks publicados que comparen este modelo concreto con ellas.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para una tarea especifica (trihouse-strawberry) con un robot SO-100. No es generalizable a otros robots, entornos o tareas sin un reentrenamiento completo.
- No se han publicado detalles sobre el numero de demostraciones, la variabilidad del dataset ni la robustez ante cambios de iluminacion, posicion de camara o perturbaciones externas.
- No se ha evaluado formalmente en cuanto a sesgos o alucinaciones (conceptos propios de modelos de lenguaje, no aplicables a politicas de control). Sin embargo, puede fallar en situaciones fuera de la distribucion de entrenamiento, produciendo movimientos inseguros.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe asegurarse de que el hardware y el entorno de despliegue cumplen con las normativas de seguridad aplicables en robotica.
- No hay informacion sobre cuantizaciones disponibles; el modelo se distribuye en safetensors con precision completa, lo que puede limitar su uso en dispositivos con memoria muy restringida.
- Al ser un modelo de imitacion, hereda los sesgos del operador humano que genero las demostraciones (por ejemplo, preferencias de velocidad o trayectorias).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2usang/act_trihouse-strawberry
- Paper de ACT: https://huggingface.co/papers/2304.13705 (tambien disponible en arXiv: https://arxiv.org/abs/2304.13705)
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset utilizado: https://huggingface.co/datasets/2usang/trihouse-strawberry
- Perfil del autor: https://huggingface.co/2usang/models
