# fecasado/gact-kitchen-pan-baseline

## Resumen

`gact-kitchen-pan-baseline` es una política de control robótico (policy) entrenada con LeRobot y publicada en Hugging Face por el usuario `fecasado`. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que mapea observaciones visuales y de estado del robot a acciones de control de bajo nivel. Concretamente, implementa la arquitectura `gaze_act` (una variante de ACT, Action Chunking Transformer, con mecanismo de atención sobre la mirada o gaze) y se ha entrenado sobre el dataset `fecasado/pan-on-hob-320x240`, que contiene demostraciones de una tarea de manipulación en cocina: colocar o manipular una sartén sobre una placa (hob).

El modelo tiene 51.664.538 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, lo que lo convierte en un artefacto ligero, pensado para inferencia en tiempo real sobre hardware modesto. Se distribuye en formato `safetensors` y se integra con el ecosistema LeRobot, que proporciona las herramientas de entrenamiento (`lerobot-train`) y evaluación/ejecución (`lerobot-record`).

Su relevancia es acotada pero clara: sirve como baseline reproducible para la tarea concreta de manipulación de sartén en un entorno de cocina, y como ejemplo de cómo LeRobot permite entrenar y publicar políticas de robot learning con licencia permisiva (Apache 2.0). No es un modelo de propósito general ni sustituye a un VLA (vision-language-action) de gran escala; es un policy especializado en una única tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gaze_act` (variante de ACT, Action Chunking Transformer, con gaze/atención sobre mirada) |
| Parámetros totales | 51.664.538 (~51,7 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; es un policy de imitación, no un LLM) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `gaze_act`, una variante de ACT (Action Chunking Transformer). ACT es un transformer que predice "chunks" de acciones (secuencias cortas de comandos de control) a partir de observaciones, habitualmente imágenes de cámaras y el estado de las articulaciones del robot. El sufijo `gaze` indica la incorporación de un mecanismo de atención sobre la mirada (gaze), es decir, un sesgo o módulo que dirige la atención del transformer hacia las regiones de la imagen relevantes para la tarea. No se dispone de la model card del detalle exacto de esta variante ni de su paper asociado.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/pan-on-hob-320x240`, que por el nombre indica imágenes de resolución 320x240 de una tarea de sartén sobre placa. No se documentan el número de episodios, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este contexto de imitation learning). La model card es una plantilla de LeRobot sin rellenar en la sección de detalles del modelo, por lo que la información sobre hiperparámetros, aumentos de datos o procedimiento de entrenamiento no está disponible.

## Capacidades

- Control robótico por imitación: genera chunks de acciones de bajo nivel a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos en entorno de cocina: la tarea objetivo es la manipulación de una sartén sobre una placa (pan-on-hob).
- Entrada visual a resolución 320x240, según el nombre del dataset de entrenamiento.
- Integración nativa con LeRobot para entrenamiento (`lerobot-train`) y ejecución/evaluación (`lerobot-record`).
- Compatible con el robot `so100_follower` en los ejemplos de la model card (aunque no se confirma que sea el robot usado en el entrenamiento).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general, audio ni thinking mode.

## Casos de uso

- Baseline reproducible para investigación en imitation learning: sirve como punto de partida y referencia de rendimiento para comparar variantes de ACT o de políticas con gaze en la misma tarea de cocina.
- Manipulación de sartén en robot de sobremesa: el policy puede desplegarse sobre un brazo tipo SO-100 para ejecutar la tarea de colocar o mover una sartén sobre una placa, usando las cámaras del dataset como entrada.
- Evaluación de pipelines de LeRobot: útil para validar el flujo completo de `lerobot-train` → `lerobot-record` con un checkpoint real y un dataset público pequeño (0,2 GB).
- Prototipado de control visual en entornos de cocina simulados o reales de bajo coste: al tener solo ~51,7 M de parámetros, cabe en GPUs de consumo y permite iterar rápido.
- Estudio de mecanismos de atención tipo gaze: al ser una variante `gaze_act`, permite analizar cómo el sesgo de mirada afecta a la precisión de la política en tareas de manipulación.
- Docencia y formación en robot learning: ejemplo completo y ligero de política entrenada con LeRobot, con licencia Apache 2.0 que facilita su reutilización en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de ~51,7 M de parámetros en safetensors (≈0,2 GB de pesos en fp32), la inferencia cabe holgadamente en cualquier GPU con 2-4 GB de VRAM, e incluso en CPU para pruebas de baja frecuencia.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es suficiente. Para tiempo real se recomienda una GPU dedicada, aunque no hay datos de latencia publicados.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gact-kitchen-pan-baseline` | ~51,7 M | no aplica | Manipulación pan-on-hob (imitation learning) | Apache 2.0 | Hugging Face (22 descargas) |
| ACT (original, Zhao et al.) | no disponible | no aplica | Manipulación robótica general (imitation learning) | no disponible | Repositorio oficial de ACT |
| Políticas LeRobot de referencia (p. ej. `lerobot/act_*`) | variable | no aplica | Tareas diversas con LeRobot | variable (habitualmente Apache 2.0) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un policy especializado en una única tarea (pan-on-hob); no generaliza a otras tareas de manipulación sin reentrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento, código ni multilingües.
- La model card es una plantilla de LeRobot sin completar ("Model type not recognized — please update this template"), por lo que faltan detalles de entrenamiento, hiperparámetros y evaluación.
- No se han publicado métricas de éxito de la tarea ni benchmarks; el rendimiento real en el robot es desconocido.
- Riesgo de sobreajuste al entorno del dataset (iluminación, posición de cámara, tipo de robot); la transferencia a otras cocinas o brazos no está validada.
- No se documentan sesgos, pero al ser un modelo de imitación puede reproducir sesgos presentes en las demostraciones humanas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda verificar que el dataset `fecasado/pan-on-hob-320x240` tenga licencia compatible para uso comercial.
- Para producción se requiere validación específica en el robot objetivo; no hay garantías de seguridad en entornos reales con objetos calientes (placa).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-kitchen-pan-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/pan-on-hob-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
