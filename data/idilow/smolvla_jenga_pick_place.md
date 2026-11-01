# idilow/smolvla_jenga_pick_place

## Resumen

smolvla_jenga_pick_place es un fine-tuning del modelo SmolVLA (Small Vision-Language-Action), un modelo compacto de vision-lenguaje-accion desarrollado originalmente por Hugging Face y presentado en el paper arXiv:2506.01844. Este checkpoint concreto ha sido entrenado por el usuario idilow sobre el dataset `doganay-sirintuna/so101_jenga_pick_place` y está orientado a una tarea específica de manipulación robótica: recoger y colocar piezas de Jenga con un brazo SO-101. El modelo parte de `lerobot/smolvla_base` y se distribuye a través de la librería LeRobot.

Con 450.046.176 parámetros (~450 M) y un peso de repositorio de 0,9 GB en formato safetensors, SmolVLA está diseñado explícitamente para ejecutarse en hardware de consumo, a diferencia de los VLA de gran escala que requieren clústeres de GPU. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para prototipado e investigación aplicada en robótica de bajo coste.

La relevancia actual de este tipo de checkpoints radica en la accesibilidad: un modelo de política visomotora que se puede afinar y desplegar sobre un brazo robótico de bajo coste (SO-101) con una sola GPU consumer, y que se integra en el ecosistema LeRobot para entrenamiento, evaluación y grabación de episodios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, implementada en LeRobot |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural documentada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y una cabeza de predicción de acciones (action expert) para generar comandos motores directamente a partir de observaciones visuales e instrucciones. El modelo base `lerobot/smolvla_base` fue entrenado por Hugging Face y descrito en el paper arXiv:2506.01844, cuyo objetivo declarado es lograr rendimiento competitivo con VLA mucho mayores a un coste computacional reducido, permitiendo despliegue en hardware de consumo.

Este checkpoint concreto es un fine-tuning supervisado sobre el dataset `doganay-sirintuna/so101_jenga_pick_place`, que contiene demostraciones de una tarea de pick-and-place de piezas de Jenga con el brazo SO-101. No se dispone en la información proporcionada del número de episodios del dataset, del número de tokens de entrenamiento, ni de si se aplicaron etapas de RLHF o DPO; estos datos figuran como no disponibles. El entrenamiento se realizó con la herramienta `lerobot-train` del ecosistema LeRobot.

## Capacidades

- Predicción de acciones robóticas de extremo a extremo a partir de observaciones visuales, para la tarea específica de recoger y colocar piezas de Jenga con un brazo SO-101.
- Control visomotor de manipulación pick-and-place en un entorno de mesa con objetos pequeños.
- Integración nativa con el pipeline de LeRobot: entrenamiento (`lerobot-train`), evaluación y grabación de episodios (`lerobot-record`).
- Despliegue sobre hardware de consumo, según la motivación declarada de SmolVLA.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes autónomos ni capacidades multilingües en la información disponible.
- No se documentan capacidades de visión general (VQA, OCR) ni de audio; el uso previsto es exclusivamente como política robótica.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje de bajo coste: el modelo puede ejecutar la secuencia de recogida y colocación de piezas pequeñas sobre un brazo SO-101, aprovechando que ha sido afinado específicamente para esa tarea y ese robot.
- Prototipado rápido de políticas visomotoras en investigación: al partir de `smolvla_base` y afinarse con LeRobot, sirve como plantilla para reproducir el flujo completo de entrenamiento y evaluación con un dataset propio de demostraciones.
- Docencia y laboratorios de robótica: su tamaño de ~450 M parámetros y su licencia Apache 2.0 permiten desplegarlo en aulas con GPU consumer, sin depender de infraestructura de clúster.
- Benchmark de referencia para tareas de manipulación con objetos pequeños: el checkpoint sirve como línea base para comparar nuevas políticas entrenadas sobre el mismo dataset de Jenga.
- Evaluación de robustez de VLA compactos: al estar especializado en una tarea acotada, permite medir tasas de éxito y modos de fallo en condiciones controladas con `lerobot-record`.
- Integración en pipelines de investigación reproducible: el checkpoint y el dataset asociado están publicados en el Hub, lo que facilita la replicación de experimentos y la comparación entre fine-tunings.
- Base para transferencia a tareas similares de manipulación: al ser un fine-tuning sobre un modelo base público, puede servir de punto de partida para otras tareas de pick-and-place con el mismo brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de éxito, MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros en safetensors (0,9 GB de repositorio), la inferencia en precisión completa requiere del orden de 1-2 GB de VRAM, y menos con cuantización, aunque no se documentan formatos de cuantización soportados.
- GPU recomendadas: no disponibles en la información proporcionada. El paper de SmolVLA declara despliegue en hardware de consumo, por lo que se espera compatibilidad con GPU consumer, pero no se especifican modelos concretos.
- Cabe en GPU consumer: sí, según la motivación declarada de SmolVLA de desplegarse en hardware de consumo; no se detallan modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia/evaluación). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_jenga_pick_place (este) | 450 M | no disponible | Pick-and-place Jenga con SO-101 | Apache 2.0 | Hugging Face Hub |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base generalista | no disponible en la información | Hugging Face Hub |
| Políticas ACT de LeRobot | no disponible en la información | no disponible | Manipulación robótica (referencia del pipeline) | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (pick-and-place de piezas de Jenga con SO-101); no es un modelo generalista y su rendimiento fuera de ese dominio no está documentado.
- No se han publicado métricas de tasa de éxito ni de robustez, por lo que no es posible evaluar su fiabilidad en producción a partir de la información disponible.
- Riesgo de sobreajuste al dataset de entrenamiento y al entorno concreto de captura (iluminación, disposición de cámara, fondo); no se documenta la variabilidad del dataset.
- No se documentan sesgos, pero al ser un modelo entrenado con demostraciones humanas puede heredar sesgos de las trayectorias del dataset.
- Riesgo de alucinación no aplica en el sentido de lenguaje natural, pero sí en forma de acciones incorrectas o inseguras en el espacio físico; requiere supervisión y paradas de seguridad en el robot.
- No se documentan limitaciones idiomáticas ni de contexto porque el modelo no expone una interfaz de lenguaje natural en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de licencia y citar el modelo base y el paper original.
- El modelo base y el dataset asociado deben verificarse en el Hub antes de su uso en producción, dado que la model card es mínima y no incluye detalles de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/idilow/smolvla_jenga_pick_place
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/doganay-sirintuna/so101_jenga_pick_place
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
