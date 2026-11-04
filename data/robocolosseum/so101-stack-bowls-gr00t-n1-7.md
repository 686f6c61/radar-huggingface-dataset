# RoboColosseum/so101-stack-bowls-gr00t-n1.7

## Resumen

so101-stack-bowls-gr00t-n1.7 es una política de robótica entrenada mediante aprendizaje por imitación que implementa la arquitectura GR00T N1.7 de NVIDIA sobre el robot SO-101 (variante `so_follower` del ecosistema LeRobot). El modelo resuelve una tarea concreta de manipulación: apilar un cuenco de plástico blanco sobre otro. A diferencia de un modelo de lenguaje, se trata de un modelo visuomotor que consume estado propioceptivo y dos flujos de vídeo (cámara frontal y de muñeca) para predecir acciones de 6 dimensiones a 30 FPS.

La relevancia de esta ficha reside en que ejemplifica el flujo completo de LeRobot para el ajuste fino de un modelo fundacional de robótica: partiendo del backbone GR00T N1.7 (Cosmos-Reason2/Qwen3-VL más un transformer de acciones con flow matching), el autor ha entrenado 40.000 pasos sobre un dataset de 100 episodios y 25.092 fotogramas. El resultado es un checkpoint de 3.144.016.000 parámetros (aproximadamente 102 GB en el repositorio) publicado con licencia Apache 2.0.

No obstante, el modelo carece de resultados de evaluación en robot real, tiene cero descargas y constituye una pieza de demostración técnica más que un artefacto listo para producción. Es útil para quienes quieran reproducir el pipeline de entrenamiento de GR00T en LeRobot o inspeccionar el formato de checkpoints de políticas robóticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL (visión-lenguaje) + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en el dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales y la instrucción en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. La política está configurada para el robot `so_follower` con dos cámaras (`front` y `wrist`), entrada `observation.state` de forma `(6,)` y dos imágenes de `(3, 480, 640)`, y salida `action` de forma `(6,)`.

El ajuste fino se realizó sobre el dataset `Jiamo0912/so101-stack-bowls`, compuesto por 100 episodios y 25.092 fotogramas a 30 FPS, con la tarea "Pick up the white plastic bowl on the right and stack it on top of the white plastic bowl on the left". La configuración de entrenamiento fue: 40.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se documenta el número de tokens de preentrenamiento del backbone original, la composición del dataset fundacional ni si hubo etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Control visuomotor de un brazo robótico SO-101 (`so_follower`) con 6 grados de libertad de acción.
- Ejecución de una tarea de manipulación concreta: apilar un cuenco sobre otro.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como texto en el rollout).
- Fusión de dos vistas de cámara (frontal y de muñeca) con estado propioceptivo de 6 dimensiones.
- Inferencia en tiempo real a 30 FPS según la frecuencia del dataset de entrenamiento.
- Compatibilidad con el stack LeRobot (`lerobot-rollout`, `lerobot-train`) y posibilidad de reentrenamiento con `--policy.type=groot`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, audio ni modo thinking; el modelo es específico de robótica.

## Casos de uso

- Reproducción del pipeline de entrenamiento GR00T en LeRobot: sirve como referencia de configuración (40k pasos, batch 32, AdamW, lr 1e-4) para ajustar el modelo fundacional a una tarea propia con un dataset de imitación.
- Benchmark interno de apilado de objetos: la tarea de apilar cuencos es un test estándar de precisión de manipulación y permite comparar variantes de política sobre el mismo robot SO-101.
- Docencia e investigación en aprendizaje por imitación: el checkpoint y su dataset público permiten estudiar el efecto de la cantidad de episodios (100) y fotogramas (25.092) en el éxito de la tarea.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede ejecutar la tarea de forma autónoma tras una demostración, reduciendo la carga del operador en entornos de laboratorio.
- Validación de hardware SO-101: útil para verificar calibración de cámaras, puertos y cinemática del brazo antes de desplegar políticas más complejas.
- Base para fine-tuning multi-tarea: al partir de un backbone visión-lenguaje, puede adaptarse a nuevas instrucciones de apilado o recogida con datasets adicionales.
- Pruebas de integración con `lerobot-rollout` en estrategia `base` para validar latencia y estabilidad del bucle de control a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 3.144.016.000 parámetros, en FP16 serían necesarios aproximadamente 6,3 GB solo para pesos; en FP32, unos 12,6 GB. A ello hay que sumar el backbone visión-lenguaje y los buffers de activación, por lo que se recomienda al menos 24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 son opciones razonables; una RTX 3090 (24 GB) también podría ser suficiente en FP16.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB o más, aunque no está verificada por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), con `--policy.device=cuda` para entrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset está grabado a 30 FPS, lo que sugiere que el bucle de control objetivo es de 33 ms por paso, pero no se aportan mediciones reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-stack-bowls-gr00t-n1.7 (este) | 3.144.016.000 | no disponible | Apilado de cuencos en SO-101 | Apache 2.0 | HuggingFace, 0 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación por imitación | no disponible | Ecosistema LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito medida en robot real, por lo que no puede afirmarse que la política funcione de forma fiable.
- Especialización extrema: entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras instrucciones ni a otros cuerpos.
- Dataset pequeño: 100 episodios y 25.092 fotogramas son una base limitada, lo que incrementa el riesgo de sobreajuste a posiciones, iluminación y objetos concretos del entorno de grabación.
- Sin datos sobre sesgos: al no ser un modelo de lenguaje, los sesgos típicos no aplican, pero sí puede heredar sesgos del backbone Cosmos-Reason2/Qwen3-VL en la interpretación de instrucciones.
- Riesgo de alucinación motora: el flow matching puede generar trayectorias plausibles pero incorrectas ante distribuciones de entrada fuera del dataset (nuevos objetos, oclusiones, cambios de iluminación).
- Idiomas: no se documenta soporte multilingüe; la instrucción de entrenamiento está en inglés, por lo que instrucciones en castellano no están validadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Repositorio de 102,2 GB y cero descargas: conviene verificar la integridad de los pesos antes de descargarlos.
- La model card incluye una ruta de política distinta (`tsangb34/groot-n17-so101-stack-bowls-40k`) en el ejemplo de rollout, lo que puede generar confusión sobre qué checkpoint usar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/so101-stack-bowls-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-stack-bowls
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-stack-bowls
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
