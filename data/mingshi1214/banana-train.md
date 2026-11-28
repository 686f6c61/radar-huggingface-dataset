# mingshi1214/banana-train

## Resumen

`mingshi1214/banana-train` es una política robótica entrenada con LeRobot y publicada en Hugging Face bajo el identificador de modelo `fact`. No es un modelo de lenguaje: es un policy checkpoint orientado a control robótico de imitación (imitation learning), entrenado sobre el dataset `mingshi1214/ur_banana_dataset_sync` y pensado para ejecutarse sobre un robot UR (Universal Robots) en una tarea concreta de manipulación de un plátano. El pipeline declarado en el Hub es `robotics` y la librería asociada es `lerobot`.

El artefacto contiene 63.346.964 parámetros en formato safetensors, lo que sitúa el checkpoint en el rango de decenas de millones de parámetros, coherente con arquitecturas de política visomotora tipo ACT o FACT usadas en LeRobot. El repositorio ocupa 1,8 GB, un tamaño que incluye los pesos y probablemente artefactos auxiliares de entrenamiento (normalizadores, estadísticas del dataset y checkpoints intermedios).

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de entrenamiento y despliegue de políticas robóticas con LeRobot, y como punto de partida para quien quiera replicar la tarea o adaptar el flujo a otro robot o dataset. No debe confundirse con un modelo fundacional de propósito general; es un policy especializado en una tarea y un entorno concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política robótica visomotora entrenada con LeRobot; el autor declara `model_name: fact`, sin detalle arquitectónico en la model card |
| Parametros totales | 63.346.964 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana viene determinada por la observación y el horizonte de acción de la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna más allá de la etiqueta `fact` y del uso de LeRobot. Por el tamaño del checkpoint (63,3 M de parámetros) y por el ecosistema en el que se publica, se trata de una política de imitación que mapea observaciones (imágenes de cámara y estado del robot) a acciones de control de las articulaciones. La plantilla de la model card conserva el texto genérico de LeRobot y el aviso `_Model type not recognized — please update this template._`, de modo que no hay descripción de capas, mecanismos de atención ni estrategia de fusión multimodal.

El entrenamiento se realizó sobre el dataset `mingshi1214/ur_banana_dataset_sync`, que no está descrito en la información disponible (número de episodios, frecuencia de captura, cámaras y distribución de estados no disponibles). El comando de entrenamiento que aparece en la model card usa `--policy.type=act` como ejemplo de plantilla, pero no confirma que el checkpoint publicado sea ACT; el autor etiqueta el modelo como `fact`. No se documenta uso de RLHF, DPO ni ninguna fase de ajuste posterior; en robótica de imitación lo habitual es entrenamiento supervisado sobre demostraciones.

## Capacidades

- Control robótico por imitación: genera comandos de acción a partir de observaciones del robot y de la escena, entrenado específicamente para la tarea del dataset `ur_banana_dataset_sync`.
- Integración nativa con LeRobot: se carga con `--policy.path` en `lerobot-record` y se entrena con `lerobot-train`.
- Evaluación episódica: el flujo documentado permite grabar episodios de evaluación (`--episodes=10`) y publicarlos como dataset con prefijo `eval_`.
- Registro de experimentos: el comando de entrenamiento de ejemplo incluye `--wandb.enable=true`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, agentes, capacidades multilingües ni modo de pensamiento. Cualquier uso fuera del control robótico no está soportado por el artefacto.

## Casos de uso

- Replicación de un pipeline de imitación completo: usar el checkpoint y el dataset asociado para reproducir el entrenamiento con `lerobot-train` y verificar que la política converge en el mismo entorno UR, lo que sirve como material didáctico o base de validación interna.
- Despliegue en un UR con LeRobot: cargar el checkpoint con `lerobot-record --policy.path=mingshi1214/banana-train` sobre un `so100_follower` u otro robot compatible para ejecutar la tarea de manipulación aprendida y medir la tasa de éxito en episodios controlados.
- Punto de partida para fine-tuning en una tarea nueva: reentrenar sobre un dataset propio de manipulación de objetos con el mismo formato LeRobot, aprovechando que el checkpoint ya codifica representaciones visomotoras útiles.
- Evaluación comparativa de políticas: emplear este checkpoint como línea base frente a políticas ACT o diffusion policy entrenadas con los mismos datos, midiendo éxito por episodio y suavidad de trayectoria.
- Docencia en robótica de imitación: ilustrar el ciclo completo dataset → entrenamiento → evaluación → publicación en el Hub con un caso real y de tamaño manejable (1,8 GB).
- Integración en un banco de pruebas de laboratorio: validar la infraestructura de captura y reproducción de episodios (cámaras, sincronización, frecuencia de control) antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 63,3 M de parámetros en precisión completa, el peso de los tensores ronda los 250 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna; sin embargo, el consumo real depende del preprocesado de imágenes y del resto del pipeline LeRobot.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento, el comando de ejemplo fija `--policy.device=cuda`, lo que implica una GPU NVIDIA; para inferencia en tiempo real se recomienda una GPU dedicada para mantener la frecuencia de control.
- GPU consumer: el tamaño del checkpoint sugiere que cabe en tarjetas como RTX 3060, 4060, 4070 o 4090, si bien esta afirmación es una estimación por tamaño de pesos y no un dato publicado.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mingshi1214/banana-train | 63.346.964 | no aplica | política robótica de imitación (UR, plátano) | apache-2.0 | Hugging Face, 173 descargas |
| Políticas ACT de LeRobot | no disponible | no aplica | imitación visomotora genérica | según checkpoint | ecosistema LeRobot |
| Diffusion Policy | no disponible | no aplica | imitación visomotora basada en difusión | según implementación | repos públicos de investigación |

No se dispone de datos de rendimiento de `banana-train` ni de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Cualquier comparación cuantitativa de tasa de éxito requeriría evaluar los tres modelos sobre el mismo dataset y robot.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea y un entorno concretos (UR con plátano); no generaliza a otros objetos, cámaras o configuraciones del robot sin reentrenamiento.
- Documentación insuficiente: la model card conserva la plantilla por defecto de LeRobot y el aviso `_Model type not recognized — please update this template._`; no hay información sobre arquitectura, datos, hiperparámetros ni métricas.
- Ausencia de benchmarks: no se publica tasa de éxito ni evaluación alguna, por lo que no se puede afirmar que la política funcione de forma fiable en producción.
- Riesgo de fallo silencioso en robótica: una política de imitación puede ejecutar acciones plausibles pero incorrectas ante cambios de iluminación, posición inicial del objeto o calibración del robot; se recomienda supervisión humana y límites de seguridad en el espacio de trabajo.
- Sin información sobre sesgos: no se documenta la composición del dataset ni su cobertura, de modo que no es posible evaluar sesgos de distribución.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; el uso en un robot real queda bajo responsabilidad del integrador.
- Sin idiomas ni capacidades de lenguaje: no debe emplearse como modelo conversacional ni como componente de razonamiento textual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mingshi1214/banana-train
- Dataset asociado: https://huggingface.co/datasets/mingshi1214/ur_banana_dataset_sync
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
