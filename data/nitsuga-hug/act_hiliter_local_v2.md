# nitsuga-hug/act_hiliter_local_v2

## Resumen

El modelo `nitsuga-hug/act_hiliter_local_v2` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario nitsuga-hug y publicada bajo licencia Apache-2.0. Se trata de un modelo de aprendizaje por imitación entrenado con el framework LeRobot de Hugging Face, diseñado para controlar un robot tipo `so_follower` en la tarea específica "pnp_hiliter" (pick and place de un objeto hiliter). El modelo predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica.

Con 51.668.614 parámetros (aproximadamente 51,7 millones), es un modelo compacto que procesa observaciones de estado del robot (6 dimensiones) y dos cámaras (overhead y wrist) con resolución 480x640, generando acciones de 6 dimensiones. Fue entrenado con 72 episodios teleoperados (54.211 frames a 30 FPS) durante 38.000 pasos de entrenamiento. Su relevancia radica en que demuestra cómo un modelo de imitación relativamente pequeño puede aprender tareas de manipulación específicas con un dataset moderado, siguiendo la metodología ACT publicada en el paper arXiv:2304.13705.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de politica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos de acciones (action chunks) en lugar de acciones individuales. Esta arquitectura, presentada en el paper arXiv:2304.13705, combina un encoder de vision (para procesar las imagenes de las camaras overhead y wrist) con un transformer que genera secuencias de acciones condicionadas al estado actual del robot. El entrenamiento se realizo con el framework LeRobot (version 0.5.2) sobre el dataset `nitsuga-hug/augs-hiliter_01`, que contiene 72 episodios teleoperados con 54.211 frames a 30 FPS. La configuracion de entrenamiento incluye 38.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y seed 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posteriores al entrenamiento supervisado de imitacion.

## Capacidades

- Control robotico de manipulacion: genera acciones de 6 dimensiones (posicion y orientacion del efector final) a partir de observaciones de estado y vision.
- Percepcion visual multimodal: procesa simultaneamente dos camaras (overhead y wrist) con resolucion 480x640.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Prediccion de secuencias de acciones: genera chunks de acciones para ejecucion suave y estable.
- Tarea especifica: optimizado para la tarea "pnp_hiliter" (pick and place de un objeto hiliter).
- Integracion con LeRobot: compatible con el ecosistema de herramientas de entrenamiento, evaluacion y despliegue de LeRobot.

## Casos de uso

- Automatizacion de tareas de pick and place en entornos controlados: el modelo puede integrarse en una celda robotica para realizar la tarea "pnp_hiliter" de forma autonoma, utilizando las dos camaras para localizar y manipular el objeto.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del numero de episodios, la resolucion de camara o la longitud del action chunk en el rendimiento de ACT.
- Desarrollo de politicas roboticas con LeRobot: puede usarse como referencia para entrenar nuevas politicas con el mismo robot y configuracion de camaras, comparando resultados.
- Prototipado rapido de tareas de manipulacion: al ser un modelo pequeno (51,7M parametros), permite iterar rapidamente en entornos con recursos limitados.
- Benchmarking de metodos de imitacion: util para comparar ACT con otras arquitecturas (diffusion policies, etc.) en la misma tarea y dataset.
- Educacion y formacion en robotica: adecuado para demostrar el flujo completo de LeRobot (grabacion de datos, entrenamiento, rollout) en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se proporcionan metricas de tasa de exito, ni comparaciones con otros modelos en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamano del modelo (51,7M parametros), se estima que requiere menos de 1 GB de VRAM en FP32, y significativamente menos en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM deberia ser suficiente. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son adecuadas. Tambien puede ejecutarse en CPU para pruebas de baja frecuencia.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: el flujo principal es mediante el comando `lerobot-rollout` del framework LeRobot, que gestiona la carga del modelo y la comunicacion con el robot. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Dependera del hardware, la resolucion de las camaras y la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nitsuga-hug/act_hiliter_local_v2 | 51,7M | no aplica | pnp_hiliter | Apache-2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | variable | no aplica | manipulacion general | MIT | Codigo abierto |
| ACT original (Zhao et al., 2023) | variable | no aplica | manipulacion general | MIT | Codigo abierto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la misma tarea. La comparativa se limita a aspectos arquitectonicos y de disponibilidad. El modelo de nitsuga-hug es una implementacion especifica de ACT entrenada con LeRobot, mientras que Diffusion Policy y el ACT original son metodos generales con multiples implementaciones.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay resultados de tasa de exito en el mundo real, por lo que el rendimiento real es desconocido.
- Tarea especifica: el modelo esta entrenado unicamente para la tarea "pnp_hiliter" y puede no generalizar a otras tareas o variaciones del entorno.
- Dependencia del robot: requiere un robot tipo `so_follower` con la misma configuracion de camaras (overhead y wrist) para funcionar correctamente.
- Dataset limitado: 72 episodios es un dataset moderado; el modelo puede sufrir overfitting a las condiciones especificas de grabacion (iluminacion, posicion de objetos, etc.).
- Riesgo de alucinacion: no aplica directamente, pero como politica de imitacion, puede producir acciones incorrectas si las observaciones difieren significativamente de los datos de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia del dataset asociado.
- Sin soporte de lenguaje: no procesa texto ni instrucciones, solo observaciones de estado y vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nitsuga-hug/act_hiliter_local_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/nitsuga-hug/augs-hiliter_01
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nitsuga-hug/augs-hiliter_01
