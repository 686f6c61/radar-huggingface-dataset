# Beuea/act_so101_k_10k

## Resumen

`Beuea/act_so101_k_10k` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot manipulador SO-101 (variante `so_follower`). El modelo aprende una única tarea concreta —"Put the eraser into the pencil case"— a partir de 50 episodios de teleoperación (28.911 fotogramas a 30 FPS) y predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, una estrategia que reduce el error de composición acumulado en tareas de manipulación.

El modelo es de tamaño reducido (51.668.614 parámetros, repo de 0,2 GB) y consume como entrada el estado articular de 6 dimensiones y una imagen de muñeca de 3×480×640, produciendo una acción de 6 dimensiones. Es, por tanto, un artefacto de robótica de extremo a extremo y no un modelo de lenguaje: no procesa texto ni mantiene conversaciones.

Su relevancia es práctica: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación con LeRobot 0.6.1, desde la grabación de datos hasta el despliegue en robot real mediante `lerobot-rollout`. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `Beuea/so101_my_task_50ep_v2_20261128_171947` (50 episodios, 28.911 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 10.000 |
| Batch size / optimizador / LR | 8 / AdamW / 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 (Zhao et al., 2023). La arquitectura combina un backbone visual (típicamente ResNet) que procesa la imagen de la cámara de muñeca con un transformer encoder-decoder que fusiona la observación visual y el estado articular, y un decoder que emite un *chunk* de acciones futuras en lugar de una sola acción. Esta predicción por bloques mitiga el problema de cambio de distribución (*compounding errors*) inherente a las políticas paso a paso y suaviza la ejecución en el robot.

El entrenamiento se realizó exclusivamente con datos de teleoperación del dataset indicado: 50 episodios de una única tarea ("Put the eraser into the pencil case"), 28.911 fotogramas a 30 FPS, 10.000 pasos de optimización con AdamW, batch de 8 y tasa de aprendizaje 1e-05. No se documenta el uso de RLHF, DPO ni ningún refinamiento por refuerzo; es aprendizaje supervisado puro sobre demostraciones. Tampoco se especifican la composición exacta del dataset, aumentos de datos ni detalles del backbone visual más allá de lo que expone la model card.

## Capacidades

- Control de manipulación robótica de una sola tarea: mapea estado articular de 6 dimensiones e imagen de muñeca a una acción de 6 dimensiones.
- Predicción de *action chunks*: emite secuencias cortas de acciones coherentes temporalmente, lo que reduce el jitter y el error acumulado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Integración nativa con el ecosistema LeRobot: carga directa mediante `lerobot-rollout` y `--policy.path`.
- Ejecución en bucle cerrado con realimentación visual a 30 FPS (frecuencia de captura del dataset).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, código, visión general, audio ni capacidades multilingües.

## Casos de uso

- **Automatización de una tarea de pick-and-place en laboratorio**: recoger un borrador y depositarlo en un estuche con el SO-101. El modelo está entrenado exactamente para esa secuencia, por lo que es adecuado como baseline reproducible en experimentos de imitación.
- **Reproducción de pipelines de LeRobot**: servir como ejemplo funcional de un entrenamiento ACT completo (dataset → `lerobot-train` → `lerobot-rollout`) para validar instalaciones, calibraciones y versiones del framework.
- **Docencia y formación en robótica de imitación**: usar la política como caso de estudio de cómo 50 episodios y 10.000 pasos bastan para obtener una política ejecutable, y discutir después la ausencia de evaluación formal.
- **Benchmark interno de hardware de bajo coste**: medir latencia y estabilidad de una política ACT de 51,7 M de parámetros en GPUs consumer o en el propio ordenador que controla el SO-101.
- **Punto de partida para *fine-tuning* en tareas similares**: reentrenar sobre un dataset propio de manipulación con el mismo formato de observaciones (estado de 6 dimensiones + imagen de muñeca 480×640) para adaptar la política a otra tarea.
- **Pruebas de integración de cámaras y calibración**: validar que los nombres de cámara (`wrist`) y las dimensiones de imagen coinciden con las claves de observación esperadas por la política antes de escalar a experimentos mayores.
- **Investigación sobre generalización y robustez**: evaluar cómo se degrada la política ante cambios de iluminación, posición del borrador o distractores, dado que no hay resultados publicados que lo cuantifiquen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la frase "_No evaluation results have been provided for this policy yet._" y deja la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) sin rellenar. No hay datos de MMLU, HumanEval, GSM8K ni de tasa de éxito en robot real, y no procede inventarlos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 51,7 M de parámetros. En FP32 ocupa aproximadamente 0,21 GB de pesos; en FP16, unos 0,10 GB. A ello hay que sumar el backbone visual y las activaciones, pero el conjunto es holgadamente inferior a 1 GB, por lo que cabe en cualquier GPU consumer moderna.
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090). Para entrenamiento con batch 8 y 10.000 pasos, una RTX 3060/4060 o superior acelera notablemente el proceso; también es viable en CPU, aunque más lento.
- **Cabe en consumer GPU**: sí, en prácticamente todas las GPU consumer de los últimos años, e incluso en placas integradas con suficiente memoria compartida para inferencia.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot real; `lerobot-train` para reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- **Latencia y throughput estimados**: no disponibles. La política opera a la frecuencia de captura del dataset (30 FPS), pero no se publican medidas de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Beuea/act_so101_k_10k` | 51,7 M | Estado (6,) + imagen muñeca 3×480×640 | Pick-and-place de una tarea (SO-101) | Apache 2.0 | Hugging Face |
| ACT original (Zhao et al., 2023) | no disponible en la informacion | Estado + imágenes | Manipulación bimanual (ALOHA) | no disponible en la informacion | Paper + código de referencia |
| Políticas LeRobot ACT genéricas | variable | Estado + imágenes | Según dataset | Apache 2.0 (LeRobot) | Hugging Face |
| Políticas tipo Diffusion Policy | variable | Estado + imágenes | Manipulación | según implementación | Repositorios de investigación |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay tasas de éxito publicadas para este modelo ni cifras comparables de las alternativas en el mismo robot y tarea. La principal diferencia frente a ACT original es el robot objetivo (SO-101 de bajo coste frente a ALOHA) y el tamaño del dataset (50 episodios de una sola tarea).

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasa de éxito en robot real; no debe asumirse que la política funciona de forma fiable en producción.
- **Sesgo de una sola tarea**: entrenada exclusivamente para "Put the eraser into the pencil case"; fuera de esa tarea no se espera comportamiento útil.
- **Sesgo de dominio**: los datos provienen de un único robot, una única cámara de muñeca y unas condiciones concretas de iluminación y disposición de objetos; la generalización a otros entornos es incierta.
- **Riesgo de sobreajuste**: 50 episodios y 10.000 pasos son un volumen modesto; la política puede memorizar posiciones y fallar ante variaciones.
- **Dependencia de calibración**: requiere que el puerto del robot, los nombres de cámara (`wrist`) y las resoluciones coincidan exactamente con las claves de observación del entrenamiento.
- **Sin capacidades de lenguaje**: no procesa texto, no responde a instrucciones en lenguaje natural y no soporta tool calling ni agentes.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el comportamiento del robot en su entorno.
- **Caveat de producción**: al ser una política de imitación sin mecanismos de seguridad explícitos, debe desplegarse con límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beuea/act_so101_k_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/Beuea/so101_my_task_50ep_v2_20261128_171947
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Beuea/so101_my_task_50ep_v2_20261128_171947
