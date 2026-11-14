# rimur01/act_so101_chunk50_50k

## Resumen

`rimur01/act_so101_chunk50_50k` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor entrenado para una tarea robótica concreta de manipulación ("Pick up an object and place it in a target area") sobre un robot de tipo `so_follower` (familia SO-101) equipado con dos cámaras (`cam0` y `cam1`) a resolución 640x480.

El modelo consume un vector de estado articular de 6 dimensiones y dos imágenes RGB de 3x480x640, y produce un chunk de acciones de 6 dimensiones. Con 51.617.414 parámetros (unos 51,6 M) y un repositorio de 0,2 GB en formato safetensors, es un modelo compacto pensado para inferencia en tiempo real en hardware de consumo, no para despliegue en clústeres de GPU.

Su relevancia es la de un artefacto reproducible de imitación robótica: entrena con 50 episodios y 15.000 frames a 15 FPS, lo que lo convierte en un ejemplo típico de política de bajo coste de datos. La model card no incluye resultados de evaluación en robot real ni licencia declarada, por lo que debe tratarse como un experimento de asignación (el dataset se llama `so101-assignment1-50-new`) y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 1 frame (estado de 6 dims + 2 imagenes de 3x480x640) y chunk de acciones de 50 pasos |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de robotica, sin entrada/salida de texto) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repositorio de 0,2 GB, libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La política combina un codificador visual (procesa `cam0` y `cam1` a 480x640) con un transformer que fusiona la observación de estado de 6 dimensiones y genera un chunk de 50 acciones de 6 dimensiones. El nombre del repositorio (`chunk50`) confirma el tamaño de chunk de 50; el paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `rimur01/so101-assignment1-50-new`: 50 episodios, 15.000 frames a 15 FPS, una única tarea de pick-and-place. La configuración es de 50.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta aumento de datos, RLHF, DPO ni ninguna etapa de refinamiento posterior; es imitación supervisada pura sobre teleoperación.

## Capacidades

- Control visomotor de manipulación: genera comandos de 6 dimensiones para un robot `so_follower` a partir de estado articular y dos vistas de cámara.
- Predicción de chunks de acción de 50 pasos, lo que aporta ejecución más estable que políticas paso a paso.
- Ejecución de una única tarea: "Pick up an object and place it in a target area".
- Entrada multimodal: fusión de estado proprioceptivo (`observation.state`, shape (6,)) e imágenes (`observation.images.cam0`, `observation.images.cam1`, shape (3, 480, 640)).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, texto, audio ni capacidades multilingües.

## Casos de uso

- Pick-and-place en banco de pruebas: el caso directo para el que fue entrenado; se lanza con `lerobot-rollout` sobre un SO-101 y dos cámaras, con una duración acotada (por ejemplo 60 s) para evaluar la tasa de éxito.
- Reproducción de experimentos de imitación: sirve como línea base de ACT para comparar con políticas propias entrenadas sobre el mismo dataset de 50 episodios y 15.000 frames.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (0,2 GB, 51,6 M de parámetros) para enseñar el flujo teleoperación -> dataset -> entrenamiento -> despliegue con LeRobot.
- Prototipado rápido de hardware SO-101: validar cableado, calibración de cámaras y puertos antes de invertir en datasets mayores, usando esta política como smoke test.
- Reentrenamiento con `lerobot-train`: partir de la configuración documentada (50.000 pasos, batch 1, AdamW, lr 1e-05, semilla 1000) y sustituir el dataset para nuevas tareas de manipulación.
- Investigación en chunking de acciones: variar el tamaño de chunk (50 en este caso) y medir el efecto en suavidad y tasa de éxito en tareas de recogida y colocación.
- Inferencia en hardware de consumo: al ser un modelo de ~51,6 M de parámetros, cabe en GPUs de gama media e incluso en CPU para pruebas de latencia, lo que facilita laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen tablas de tasa de éxito en robot real, ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51.617.414 parámetros en FP32, los pesos ocupan aproximadamente 0,2 GB; el coste dominante es el procesamiento de dos imágenes de 3x480x640 por paso, no el tamaño del modelo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060/4060 o superior es un objetivo razonable para inferencia en tiempo real.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna; también es viable en CPU para pruebas no críticas en latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=rimur01/act_so101_chunk50_50k`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La model card no reporta FPS de inferencia ni latencia por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rimur01/act_so101_chunk50_50k` | 51,6 M | chunk de 50 acciones | Pick-and-place SO-101 | no disponible | Hugging Face Hub (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible en la informacion | chunk configurable | Manipulacion ALOHA | no disponible en la informacion | Paper y repositorio de referencia |
| Otras politicas LeRobot del Hub | no disponible | no disponible | Robotica diversa | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada; la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "[More Information Needed]", por lo que el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, ni número de ensayos, ni condiciones de dificultad (posiciones de objeto, iluminación, distractores).
- Especialización extrema: entrenado para una sola tarea y un solo tipo de robot (`so_follower`) con dos cámaras concretas (`cam0`, `cam1`); no generaliza a otras tareas, morfologías ni configuraciones de cámara sin reentrenamiento.
- Dataset pequeño: 50 episodios y 15.000 frames a 15 FPS; es propenso a sobreajuste al entorno de recogida y a fallar ante cambios de posición, iluminación o fondo.
- Riesgo de alucinación en el sentido robótico: puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento, sin mecanismo de verificación interno.
- Sin soporte de texto ni multilingüe: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Fecha de creación en el Hub (2026-11-14) y nombre de dataset (`assignment1`) sugieren un contexto académico o de asignatura; tratar como artefacto experimental, no como componente de producción.
- Dependencia de la versión de LeRobot: entrenado con 0.6.2; cambios de API en `lerobot-rollout` o en el formato de observaciones pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimur01/act_so101_chunk50_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/rimur01/so101-assignment1-50-new
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rimur01/so101-assignment1-50-new
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
