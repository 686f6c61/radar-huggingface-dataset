# fecasado/gact-kitchen-burger-baseline

## Resumen

`gact-kitchen-burger-baseline` es una política de control robótico (policy) entrenada con LeRobot y publicada por el usuario `fecasado`. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) del tipo ACT (Action Chunking Transformer) con una variante denominada `gaze_act`, orientado a una tarea concreta de manipulación en entorno de cocina: trasladar una hamburguesa a un plato.

El modelo se ha entrenado sobre el dataset `fecasado/burger-to-plate-good-320x240`, con observaciones visuales a resolución 320x240, y se distribuye en formato safetensors con 51.664.538 parámetros (aproximadamente 0,2 GB de repositorio). Su relevancia es acotada: sirve como línea base (baseline) reproducible para una tarea específica y como ejemplo de flujo de entrenamiento y evaluación con LeRobot.

No hay información sobre arquitectura interna detallada, idiomas ni benchmarks en la documentación disponible. La model card es una plantilla de LeRobot sin completar, por lo que la mayor parte de las especificaciones técnicas deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con variante `gaze_act`; detalles internos no disponibles |
| Parámetros totales | 51.664.538 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Entradas | observaciones visuales 320x240 (según dataset de entrenamiento) |
| Salidas | acciones de control robótico |
| Dataset de entrenamiento | `fecasado/burger-to-plate-good-320x240` |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo se basa en ACT (Action Chunking Transformer), una arquitectura de imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales, habitualmente con un codificador visual y un transformer que modela la política. La variante concreta se etiqueta como `gaze_act`, pero no se dispone de documentación sobre en qué consiste esa modificación (posiblemente incorporación de información de mirada o atención, pero no confirmado).

El entrenamiento se realizó con la herramienta `lerobot-train` sobre el dataset `burger-to-plate-good-320x240`, que contiene episodios de demostración de la tarea de trasladar una hamburguesa a un plato. No se dispone de información sobre número de episodios, tokens, composición del dataset, ni sobre uso de RLHF/DPO (no aplicable en este contexto). Tampoco se documentan innovaciones técnicas adicionales.

## Capacidades

- Control robótico por imitación para una tarea específica: mover una hamburguesa a un plato.
- Predicción de secuencias de acciones (action chunking) a partir de observaciones visuales 320x240.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales (thinking, audio, etc.).

## Casos de uso

- Línea base para investigación en imitación robótica: sirve como punto de partida reproducible para comparar nuevas políticas sobre la misma tarea y dataset.
- Reproducción de experimentos con LeRobot: permite validar pipelines de entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`) con un checkpoint público.
- Evaluación de políticas en robot SO-100: la model card incluye el comando de evaluación con `robot.type=so100_follower`, por lo que es adecuado para probar el modelo en ese hardware.
- Docencia y formación: ejemplo práctico de flujo completo de entrenamiento y despliegue de una política ACT en un entorno de cocina simulado o real.
- Desarrollo de variantes: al ser un baseline, permite experimentar con modificaciones de arquitectura (`gaze_act`) y comparar frente a la versión original.
- Pruebas de integración de hardware: útil para verificar la cadena de captura visual 320x240, inferencia y ejecución de acciones en un brazo robótico de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 51,7 M de parámetros y pesos en safetensors (0,2 GB), la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende del codificador visual y del pipeline de LeRobot.
- GPU recomendadas: no disponibles de forma específica; el comando de la model card usa `--policy.device=cuda`, por lo que se espera una GPU NVIDIA.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM (p. ej. RTX 3060 o superior), aunque no hay cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con robots tipo `so100_follower`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros modelos comparables en la información recibida.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea de mover una hamburguesa a un plato; no generaliza a otras tareas sin reentrenamiento.
- Model card incompleta: la plantilla de LeRobot no se ha rellenado, por lo que faltan detalles de arquitectura, datos y evaluación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito de la política.
- Posible sobreajuste al entorno del dataset: cambios de iluminación, posición de objetos o cámara pueden degradar el rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Sin información sobre sesgos ni riesgos de alucinación (no aplicable a un modelo de control), pero sí riesgo de acciones erráticas en el robot si la política falla.
- No apto para tareas de lenguaje, visión general ni agentes conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/fecasado/gact-kitchen-burger-baseline
- Dataset: https://huggingface.co/datasets/fecasado/burger-to-plate-good-320x240
- LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
