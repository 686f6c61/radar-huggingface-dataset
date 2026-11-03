# CGdigipen/act_grasp_lever

## Resumen

`act_grasp_lever` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. La desarrolla el usuario CGdigipen y se distribuye a través del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: identificar y agarrar el mango de una palanca sobre un robot de tipo `so_follower` (SO-100/101 follower), usando dos cámaras de 480x640 píxeles y un vector de estado de 6 dimensiones.

Se trata de un transformer pequeño, con 51.668.614 parámetros, que predice trozos (chunks) de acciones de 6 dimensiones en lugar de pasos individuales. Esta estrategia de predicción por chunks reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina, a costa de requerir datos de teleoperación de calidad. El modelo está entrenado exclusivamente sobre 115 episodios (47.618 fotogramas a 30 FPS) grabados por el propio autor.

Es relevante ahora porque ejemplifica el flujo actual de robótica de código abierto: datos, entrenamiento y despliegue dentro de un mismo stack (LeRobot 0.6.1), con licencia Apache 2.0 y pesos en safetensors. No obstante, es un modelo de nicho, sin benchmarks publicados y con cero descargas en el momento de redactar esta ficha, por lo que debe tratarse como una política de referencia y no como un componente listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación fija por paso) |
| Tipos de cuantización | no disponible (pesos en safetensors de precisión completa; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (no procesa lenguaje natural como tarea principal; recibe una instrucción de tarea como texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes) con un transformer encoder-decoder que recibe el estado del robot y las observaciones visuales, y emite un chunk de acciones futuras. En este caso, las entradas son `observation.state` de forma (6,), dos imágenes RGB de (3, 480, 640) procedentes de las cámaras `RIGHT` y `HEAD`, y la salida es un vector `action` de (6,). El modelo se entrenó con 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.1.

El dataset de entrenamiento es `CGdigipen/grasp_lever_115_03112026_20261103_102924`, con 115 episodios y 47.618 fotogramas a 30 FPS, todos ellos sobre la tarea "identify and grasp lever handle". No se documenta composición adicional del dataset, aumento de datos, RLHF ni DPO; es aprendizaje por imitación supervisado a partir de teleoperación. La innovación principal es la propia predicción por chunks de ACT, que agrupa varias acciones consecutivas para amortiguar el ruido de las demostraciones y mejorar la consistencia temporal.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (`RIGHT` y `HEAD`) a 480x640.
- Ejecución de una tarea específica: identificar y agarrar el mango de una palanca.
- Predicción de chunks de acción, lo que permite movimientos más suaves y coherentes que la predicción paso a paso.
- Integración con el pipeline de LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- Capacidades multilingües: no aplica; el texto de tarea es una etiqueta fija, no una instrucción libre.

## Casos de uso

- Automatización de una celda de agarre de palancas: el modelo se ejecuta con `lerobot-rollout` sobre un `so_follower` y reproduce la secuencia aprendida de aproximación y cierre de pinza sobre el mango.
- Base para fine-tuning en tareas de agarre similares: al ser un checkpoint ACT pequeño (51,7 M de parámetros), sirve como inicialización para nuevos datasets de agarre con la misma morfología de robot.
- Validación de pipelines de imitación: útil para comprobar que la cadena de datos, entrenamiento y despliegue de LeRobot 0.6.1 funciona de extremo a extremo antes de escalar a tareas más complejas.
- Investigación en chunking de acciones: permite estudiar el efecto del tamaño de chunk y de la ventana de observación en la estabilidad del agarre con dos cámaras.
- Docencia y prototipado en robótica de bajo coste: el robot SO follower y las cámaras USB son asequibles, lo que facilita reproducir el experimento en laboratorios con presupuesto limitado.
- Benchmark interno de robustez visual: al depender de dos vistas, se puede evaluar cómo afectan cambios de iluminación, oclusiones o recolocación de la palanca a la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 51,7 M de parámetros, los pesos ocupan aproximadamente 0,2 GB en FP32; con activaciones y dos flujos de imagen a 480x640, el consumo realista se sitúa en el rango de 1 a 3 GB de VRAM, aunque no hay medición oficial publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se sugiere RTX 3060, RTX 4060, RTX 4090, A100 o H100 si se quiere margen para entrenamiento o inferencia concurrente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1650 en adelante, con matices por drivers y versiones de CUDA).
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de PyTorch y CUDA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La inferencia debe ejecutarse a 30 FPS para coincidir con la frecuencia de captura del dataset, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `CGdigipen/act_grasp_lever` | 51,7 M | Observación fija por paso; chunk de acciones | Agarre de palanca en `so_follower` | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot (p. ej. checkpoints de ejemplo del proyecto) | Variable, típicamente decenas de millones | Igual que ACT | Manipulación diversa según dataset | Apache 2.0 | Hugging Face |
| Diffusion Policy (referencia del ecosistema LeRobot) | Variable, mayor que ACT en la mayoría de configuraciones | Igual que ACT | Manipulación con modelado generativo de acciones | Apache 2.0 | Hugging Face / repositorios de investigación |
| π0 / políticas VLA de gran escala | Miles de millones | Contexto multimodal amplio | Manipulación generalista con instrucciones en lenguaje | Licencias variables | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este checkpoint ni métricas de éxito en robot real. Las alternativas se incluyen por categoría y ecosistema, no por resultados medidos.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una única tarea ("identify and grasp lever handle") y una única morfología de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito, ni en simulación ni en robot real, por lo que se desconoce su robustez.
- Dataset pequeño: 115 episodios y 47.618 fotogramas son insuficientes para garantizar generalización ante cambios de iluminación, posición de la palanca, fondo o tipo de objeto.
- Dependencia de dos cámaras con nombres concretos (`RIGHT`, `HEAD`): el despliegue falla si los índices o nombres de cámara no coinciden con las claves de observación del entrenamiento.
- Riesgo de sobreajuste a la disposición física exacta de la celda de entrenamiento; no se documentan técnicas de aumento de datos.
- Sesgos: no evaluados; al ser un modelo de control, los sesgos relevantes serían de comportamiento (por ejemplo, preferencia por trayectorias presentes en las demostraciones), no de lenguaje.
- Alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Fecha de creación del repositorio (2026-11-03) y cero descargas: el modelo es muy reciente y no ha sido validado por la comunidad.
- No apto para producción sin una campaña de evaluación propia en el robot y el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CGdigipen/act_grasp_lever
- Dataset de entrenamiento: https://huggingface.co/datasets/CGdigipen/grasp_lever_115_03112026_20261103_102924
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CGdigipen/grasp_lever_115_03112026_20261103_102924
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
