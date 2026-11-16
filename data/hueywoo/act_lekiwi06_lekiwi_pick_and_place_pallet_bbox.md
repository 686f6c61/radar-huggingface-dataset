# HueyWoo/act_lekiwi06_lekiwi_pick_and_place_pallet_bbox

## Resumen

`act_lekiwi06_lekiwi_pick_and_place_pallet_bbox` es una política de imitación para robótica entrenada con LeRobot, la librería de aprendizaje automático para robótica del mundo real de Hugging Face. El modelo implementa una variante de ACT (Action Chunking with Transformers) denominada `act_bbox`, que incorpora información de bounding boxes como parte del estado del entorno. Está diseñado para controlar un robot móvil de tipo `lekiwi_client` equipado con dos cámaras (`front` y `wrist`) en una tarea concreta: coger una caja y colocarla sobre un palé negro.

El modelo resuelve un problema de manipulación pick-and-place mediante aprendizaje por imitación a partir de 40 episodios teleoperados (11.103 fotogramas a 30 FPS). Con 40,5 millones de parámetros, es un modelo compacto que cabe en cualquier GPU de consumo y está pensado para ejecutarse en tiempo real sobre el robot físico, no como un modelo de propósito general.

Su relevancia es acotada pero ilustrativa: es un ejemplo típico del flujo de trabajo end-to-end de LeRobot (grabar datos, entrenar, desplegar) y muestra cómo las políticas de imitación ligeras pueden resolver tareas industriales sencillas con hardware asequible. No obstante, al ser un modelo entrenado sobre un único dataset y una única tarea, su generalización es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), variante `act_bbox` |
| Parámetros totales | 40.561.353 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `lekiwi_client` |
| Cámaras de entrada | `front`, `wrist` |
| Entrada `observation.state` | `(9,)` |
| Entrada `observation.environment_state` | `(140,)` |
| Salida `action` | `(9,)` |
| Versión de LeRobot | 0.6.0 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo se basa en ACT, una arquitectura transformer diseñada para aprendizaje por imitación que predice *chunks* de acciones (secuencias de acciones futuras) en lugar de una única acción por paso, lo que reduce el error de acumulación y suaviza el control. La variante `act_bbox` incorpora un vector de estado del entorno (`observation.environment_state`) de 140 dimensiones, presumiblemente derivado de bounding boxes detectadas en las imágenes, que se concatena con el estado propioceptivo del robot (9 dimensiones) como entrada al transformer. La salida es un vector de acción de 9 dimensiones que controla el robot móvil y su brazo.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `HueyWoo/lekiwi_pick_and_place_pallet`, compuesto por 40 episodios y 11.103 fotogramas a 30 FPS de la tarea "pick a box and place it on a black pallet". Se ejecutaron 50.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje por imitación supervisado puro sobre demostraciones teleoperadas.

## Capacidades

- Control de robot móvil `lekiwi_client` mediante predicción de acciones de 9 dimensiones a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitación de una tarea concreta de pick-and-place: coger una caja y colocarla sobre un palé negro.
- Procesamiento multimodal de dos cámaras (`front` y `wrist`) a 640x480 y 30 FPS.
- Integración con bounding boxes como estado del entorno (140 dimensiones), lo que añade información estructurada sobre la posición de objetos.
- Ejecución en tiempo real sobre hardware físico mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motor, no un modelo de lenguaje.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje ligeras: el modelo puede coger cajas y depositarlas en palés negros, una tarea repetitiva común en logística y empaquetado, con la ventaja de que solo requiere 40 demostraciones para entrenarse.
- Prototipado rápido de políticas robóticas con LeRobot: sirve como plantilla para entrenar variantes sobre nuevos datasets usando `lerobot-train --policy.type=act_bbox`, acelerando el ciclo de iteración en investigación.
- Investigación en aprendizaje por imitación con estado estructurado: el uso de bounding boxes como `environment_state` permite estudiar cómo la información geométrica explícita mejora la generalización frente a políticas puramente visuales.
- Docencia y formación en robótica: al ser un modelo pequeño (40,5 M de parámetros) y con licencia Apache 2.0, es adecuado para cursos y talleres donde se enseña el flujo completo de LeRobot.
- Despliegue en robots móviles de bajo coste: el robot `lekiwi_client` y el reducido tamaño del modelo permiten ejecutar la política en GPUs de consumo, facilitando la adopción en laboratorios con presupuesto limitado.
- Benchmarking de variantes ACT: sirve como referencia base para comparar arquitecturas de imitación (ACT vs. Diffusion Policy vs. VQ-BeT) en tareas de manipulación con estado del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (40,5 M de parámetros), holgadamente por debajo de 2 GB con overhead de activaciones y cámaras.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: `lerobot-rollout` (comando oficial documentado en la model card), con `--policy.path=HueyWoo/act_lekiwi06_lekiwi_pick_and_place_pallet_bbox` y `--policy.device=cuda`.
- Latencia y throughput estimados: no disponibles. Al ser una política de control a 30 FPS, se espera que pueda ejecutarse en tiempo real en GPU de consumo, pero no se documentan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_lekiwi06_lekiwi_pick_and_place_pallet_bbox` | 40,5 M | ACT con bbox | Pick-and-place en lekiwi | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT estándar en LeRobot Hub | ~40-50 M | ACT | Manipulación diversa | Apache 2.0 (típico) | Hugging Face (LeRobot) |
| Diffusion Policy (LeRobot) | ~50-100 M | Diffusion | Manipulación diversa | Apache 2.0 (típico) | Hugging Face (LeRobot) |
| VQ-BeT (LeRobot) | ~40-80 M | Transformer + VQ | Manipulación diversa | Apache 2.0 (típico) | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada. La comparación se limita a parámetros, tipo de arquitectura y licencia.

## Limitaciones y advertencias

- Modelo entrenado sobre una única tarea y un único dataset (40 episodios): no generaliza a otras tareas, objetos, posiciones ni entornos sin reentrenamiento.
- Sin resultados de evaluación publicados: no se conoce la tasa de éxito real en el robot, lo que impide valorar su fiabilidad en producción.
- Dependencia de las cámaras y del robot exactos: los nombres de cámara (`front`, `wrist`) y el tipo de robot (`lekiwi_client`) deben coincidir con los usados en el entrenamiento; cambios de calibración o iluminación pueden degradar el rendimiento.
- Riesgo de sobreajuste a las condiciones de grabación (posición de la caja, color del palé, fondo): la tarea está definida de forma muy específica ("caja" y "palé negro").
- La variante `act_bbox` requiere un pipeline de detección de bounding boxes que genere el vector `environment_state` de 140 dimensiones; no se documenta cómo se obtiene ni si se incluye en el repositorio, lo que puede dificultar la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser una política específica para un robot concreto, su aplicabilidad comercial es limitada sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural más allá del campo `--task` y no tiene capacidades de razonamiento simbólico.
- Sin información sobre sesgos: al ser un modelo robótico, los sesgos relevantes serían de distribución de datos (posiciones, objetos, iluminación), no sociales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HueyWoo/act_lekiwi06_lekiwi_pick_and_place_pallet_bbox
- Dataset de entrenamiento: https://huggingface.co/datasets/HueyWoo/lekiwi_pick_and_place_pallet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HueyWoo/lekiwi_pick_and_place_pallet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Tutorial de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
