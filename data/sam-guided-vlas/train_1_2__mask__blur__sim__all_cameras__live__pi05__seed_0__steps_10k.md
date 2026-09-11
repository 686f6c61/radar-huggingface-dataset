# sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_10k

## Resumen

Este repositorio contiene una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario `sam-guided-vlas`, resultado del fine-tuning del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence. El modelo no es un LLM de propósito general: consume observaciones multimodales de un robot (estado de articulaciones e imágenes de tres cámaras) y produce directamente comandos de acción de 7 dimensiones para un brazo robótico Franka Panda.

El fine-tuning se ha realizado sobre el dataset `sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live`, con 200 episodios y 30.830 fotogramas a 20 FPS, cubriendo 20 tareas de manipulación de objetos cotidianos (dispensador de jabón, tarro de mermelada, cereales, cuchillo, hervidor, frutas, verduras, etc.). El entrenamiento se ejecutó durante 10.000 pasos con batch de 16, optimizador AdamW y tasa de aprendizaje 5e-5, usando LeRobot 0.6.0.

Es relevante ahora porque π₀.₅ está diseñado explícitamente para generalización en entornos abiertos, y este checkpoint representa un caso concreto de adaptación a un conjunto cerrado de tareas con una configuración de cámaras fija. El repositorio tiene 0 descargas y 0 likes, y el propio autor indica que no se han proporcionado resultados de evaluación, por lo que debe tratarse como un artefacto de investigación reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) de la familia π₀.₅ (Physical Intelligence), implementación LeRobot/OpenPI; detalles internos del backbone no disponibles en la información proporcionada |
| Parametros totales | 4.143.404.816 (~4,14 mil millones), según los pesos en safetensors |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible; no se documenta ventana de contexto textual. El modelo consume observaciones (estado e imágenes) en cada paso de control |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponibles; las tareas del dataset están etiquetadas en inglés ("soap dispenser", "kettle", "scone", etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de política de LeRobot) |
| Tipo de robot | Franka Panda |
| Camaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entradas | `observation.state` (9,), `observation.images.*` (3, 224, 224) |
| Salidas | `action` (7,) |
| Modelo base | lerobot/pi05_base |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo como π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence concebido para generalizar a entornos y situaciones completamente nuevas no vistas durante el entrenamiento. La implementación disponible aquí es la adaptación a LeRobot del repositorio OpenPI de Physical Intelligence. La información proporcionada no detalla la composición interna del backbone (encoder visual, transformer de lenguaje, cabecera de acciones), el mecanismo de decodificación de acciones ni el número de tokens de entrenamiento del modelo base, por lo que esos extremos quedan como no disponibles.

Respecto al fine-tuning concreto de este repositorio: se partió de `lerobot/pi05_base` y se entrenó sobre un dataset de 200 episodios y 30.830 fotogramas a 20 FPS, con 20 tareas de manipulación, tres cámaras y estado de 9 dimensiones. La configuración declarada es de 10.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-5, semilla 0 y LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni de ninguna técnica de alineación adicional; el procedimiento es aprendizaje por imitación supervisado sobre demostraciones. El identificador del repositorio (`mask`, `blur`, `sim`, `all_cameras`, `live`) sugiere una ablación sobre aumentos de datos y tipos de observación, pero la model card no confirma esta interpretación.

## Capacidades

- Generación de acciones de manipulación robótica: produce un vector de acción de 7 dimensiones a partir de observaciones visuales y de estado, apto para control directo de un Franka Panda.
- Ejecución de 20 tareas concretas de manipulación: "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", "pear", "potato", "sweet potato", "scone", "basket", "boxed food", "cake", "can", "hamburger", "lemon", "orange", "spice", "squash" y "spray".
- Fusión multimodal de tres cámaras: una vista general de la escena (`agentview`) y dos vistas de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`), a resolución 224x224.
- Condicionamiento por tarea en lenguaje natural: la instrucción se pasa como cadena de texto mediante `--task`.
- Aprendizaje por imitación: la política reproduce comportamientos derivados de demostraciones teleoperadas.
- Soporte de tool calling / function calling: no aplicable; el modelo no es un LLM conversacional.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplicable ni documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión generativa, audio): no documentadas; la visión se usa exclusivamente como entrada de observación.

## Casos de uso

- Recogida y colocación de alimentos en cocina: la política puede ejecutar tareas de manipulación sobre los 20 objetos del dataset (frutas, verduras, botes, cajas) usando la vista general más las dos vistas de muñeca para localizar el objeto y corregir el agarre.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el efecto de aumentos de datos (el nombre del repositorio apunta a variantes con `mask`, `blur` y `sim`) sobre el éxito de la política.
- Fine-tuning sobre dominios nuevos: al derivar de `lerobot/pi05_base` y usar el flujo estándar de LeRobot, puede reentrenarse sobre datasets propios con el comando `lerobot-train`.
- Evaluación comparativa de checkpoints: al estar parametrizado por semilla y número de pasos (`seed_0__steps_10k`), permite comparar curvas de entrenamiento entre configuraciones bajo un protocolo idéntico.
- Automatización de tareas repetitivas de picking en laboratorio o almacén: con la morfología Panda y cámaras fijas, puede integrarse en celdas de trabajo con objetos de geometría similar a los del dataset.
- Recolección de datos asistida: puede ejecutarse en modo `lerobot-rollout --strategy.type=base` para inspeccionar el comportamiento antes de grabar nuevos episodios, útil como paso previo a un ciclo de mejora iterativa de datos.
- Banco de pruebas de infraestructura de inferencia robótica: permite medir latencia y throughput de una política VLA de ~4,14 mil millones de parámetros en hardware concreto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card incluye una sección de evaluación con la frase "No evaluation results have been provided for this policy yet", sin tabla de tareas, número de ensayos ni tasas de éxito. Tampoco se proporcionan métricas de pérdida de entrenamiento ni comparaciones con otros checkpoints del mismo autor.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de los 4.143.404.816 parámetros, sin incluir activaciones ni buffers de las tres cámaras): en fp32 en torno a 16,6 GB; en bf16/fp16 en torno a 8,3 GB; en int8 en torno a 4,1 GB. Estas cifras son estimaciones derivadas del recuento de parámetros, no mediciones publicadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo en bf16 debería caber en una NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o L40S (48 GB); no hay confirmación oficial de compatibilidad ni de rendimiento en ninguna de ellas.
- Cabe en GPU de consumo: probablemente sí en bf16 dentro de una RTX 4090 o RTX 3090 (24 GB) según la estimación anterior, siempre que el resto del pipeline (renderizado de cámaras, proceso de control) no consuma VRAM adicional. No verificado.
- Opciones de despliegue: el método documentado es la CLI de LeRobot, con `lerobot-rollout --policy.path=...` para inferencia sobre el robot y `lerobot-train --policy.path=lerobot/pi05_base` para reentrenamiento. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia de LLM, dado que el formato de política y las salidas de acción no son compatibles con esos motores.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset se grabó a 20 FPS, de modo que un despliegue fluido exigiría inferencia del orden de 20 Hz, requisito no confirmado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`sam-guided-vlas/...pi05__seed_0__steps_10k`) | 4.143.404.816 | No aplica (VLA) | Sin resultados de evaluación publicados | apache-2.0 | HuggingFace, librería LeRobot |
| lerobot/pi05_base | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace; es el modelo base del fine-tuning |
| π₀.₅ (Physical Intelligence, descrito en el blog referenciado) | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card; el código base OpenPI se cita como origen de la implementación |
| Otros VLA de propósito general (por ejemplo OpenVLA, GR00T N1) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No se han encontrado datos comparables en la información disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito en robot real ni en simulación, por lo que se desconoce si la política funciona de forma fiable incluso en las tareas del dataset.
- Dataset muy pequeño para generalización: 200 episodios y 30.830 fotogramas a 20 FPS (unos 25 minutos de experiencia real) para 20 tareas distintas, lo que implica muy pocas demostraciones por tarea.
- Especialización morfológica: entrenado para un Franka Panda con nueve dimensiones de estado y siete de acción; no es transferible directamente a otras morfologías sin reentrenamiento.
- Dependencia estricta de la configuración de cámaras: las claves de observación (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y las resoluciones de 224x224 deben coincidir exactamente con las del entrenamiento; las instrucciones de la model card advierten de que los nombres de cámara han de coincidir con las claves de observación.
- Sensibilidad al entorno: no se documenta variación de posiciones de objetos, iluminación o distractores; la política puede degradarse fuera de las condiciones de recogida de datos.
- Riesgo de alucinación en el sentido robótico: al ser una política de imitación, puede generar trayectorias plausibles pero incorrectas o inseguras ante entradas fuera de distribución.
- Idiomas: el condicionamiento textual de las tareas está en inglés; no se documenta soporte para otras lenguas.
- Licencia: apache-2.0 permite uso comercial y modificación, pero el modelo base π₀.₅ y el repositorio OpenPI pueden tener condiciones propias no detalladas en esta model card; conviene verificarlas antes de un despliegue comercial.
- Sin datos de sesgo: no se documenta ningún análisis de sesgo, y no aplica el concepto habitual de sesgo lingüístico por tratarse de una política de control.
- Seguridad física: cualquier despliegue sobre hardware real debe incorporar límites de par, paradas de emergencia y supervisión humana; la model card no incluye advertencias de seguridad.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni discusiones asociadas; no hay evidencia de terceros que hayan reproducido el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence (citado en la model card, sin URL explícita): https://github.com/Physical-Intelligence/openpi
- Cita bibliográfica indicada por el autor: Cadene, Remi y Alibert, Simon et al., "LeRobot" (2024); el texto de la cita aparece truncado en la model card.
- Nota sobre la búsqueda web: los resultados obtenidos corresponden a una serie de televisión francesa, a un fabricante de utillaje y al portal de contratación SAM.gov; no aportan información técnica relevante sobre este modelo.
