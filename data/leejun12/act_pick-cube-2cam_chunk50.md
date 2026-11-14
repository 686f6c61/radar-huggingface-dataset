# LeeJun12/act_pick-cube-2cam_chunk50

## Resumen

`act_pick-cube-2cam_chunk50` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub mediante la librería LeRobot. La desarrolla el usuario LeeJun12 y resuelve una tarea concreta de manipulación: coger un cubo y depositarlo en una caja. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un controlador visomotor que mapea observaciones (estado articular y dos cámaras RGB) a comandos de acción de 6 dimensiones.

El modelo emplea la arquitectura ACT, un transformer que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. Cuenta con 51.617.414 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo hace extremadamente ligero en comparación con los modelos fundacionales de robótica.

Es relevante ahora porque ejemplifica el flujo de trabajo de imitation learning de extremo a extremo con LeRobot: grabación de demostraciones teleoperadas, entrenamiento de una política compacta y despliegue en un robot físico tipo SO-100/SO-101 (`so_follower`). Su licencia Apache 2.0 permite reutilización y adaptación sin restricciones comerciales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación fija por chunk) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.overhead` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `overhead` |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot | 0.6.0 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un cuello de botella variacional (CVAE) que aprende a predecir chunks de acciones a partir de observaciones visuales y propioceptivas. En esta configuración, el modelo consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640 (muñeca y vista cenital) y produce un vector de acción de 6 dimensiones. La predicción por chunks (denominado `chunk50` en el nombre del repositorio) implica que cada inferencia genera una secuencia de 50 acciones, que se ejecutan de forma abierta o con interpolación temporal, reduciendo la frecuencia efectiva de inferencia y mejorando la suavidad del movimiento.

El entrenamiento se realizó sobre el dataset `LeeJun12/pick-cube-2cam_20261028_193431`, compuesto por 50 episodios teleoperados, 15.000 frames a 30 FPS, con la instrucción "Pick up the cube and put it in the box". La configuración reportada incluye 50.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos; es imitation learning supervisado puro sobre demostraciones.

## Capacidades

- Control visomotor para manipulación robótica: convierte observaciones de estado y dos cámaras en comandos de acción de 6 grados de libertad.
- Predicción por chunks de acciones: genera secuencias de 50 acciones por inferencia, lo que aporta suavidad y consistencia temporal.
- Ejecución de una tarea específica: "Pick up the cube and put it in the box".
- Integración nativa con LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- Funcionamiento en robots tipo `so_follower` (SO-100/SO-101 de bajo coste).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un cubo y colocarlo en una caja sobre un robot SO-100, útil como baseline reproducible en experimentos de imitation learning.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para entrenar variantes con nuevos objetos o posiciones, reutilizando la configuración de ACT y LeRobot documentada.
- Docencia y formación en robótica: por su tamaño reducido (0,2 GB) y licencia Apache 2.0, es adecuado para cursos donde los alumnos graban sus propios datasets y comparan resultados.
- Evaluación de infraestructura de teleoperación: permite validar la cadena completa de captura (dos cámaras a 30 FPS), calibración del robot y despliegue de políticas.
- Benchmark interno de manipulación: al ser una política ligera y bien especificada, se puede usar como referencia para medir mejoras de nuevas arquitecturas o datasets.
- Despliegue en hardware de bajo coste: el modelo cabe en GPUs consumer y puede ejecutarse en un PC con una sola GPU junto al robot, sin necesidad de infraestructura en la nube.
- Base para fine-tuning con pocas demostraciones: dado el reducido número de episodios (50) y pasos (50.000), es un ejemplo práctico de cuántos datos requiere ACT para una tarea simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,6 M de parámetros; en la práctica, la carga de dos imágenes de 480x640 y el grafo de ACT requieren aproximadamente 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso podría ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=LeeJun12/act_pick-cube-2cam_chunk50`; el resto de la pila (vLLM, llama.cpp, Ollama, TGI) no aplica porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al predecir chunks de 50 acciones, la frecuencia efectiva de inferencia es baja; a 30 FPS de captura, un chunk cubre aproximadamente 1,67 segundos de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LeeJun12/act_pick-cube-2cam_chunk50` | 51,6 M | chunk de 50 acciones | Pick-and-place de cubo con robot SO | apache-2.0 | Hugging Face Hub |
| Políticas ACT genéricas de LeRobot | variable (decenas de M) | chunk configurable | Manipulación según dataset | apache-2.0 (típico) | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy | variable (mayor que ACT típicamente) | horizonte de acciones configurable | Manipulación multimodal | variable | Repositorios de investigación |
| Modelos fundacionales de robótica (p. ej. RT-2, OpenVLA) | miles de millones | contexto multimodal amplio | Multi-tarea generalista | variable (a menudo restrictiva) | Principalmente investigación |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Tarea única y muy específica: solo se ha entrenado para "Pick up the cube and put it in the box"; no generaliza a otros objetos, posiciones o instrucciones sin reentrenamiento.
- Dataset muy pequeño: 50 episodios y 15.000 frames; la política probablemente es frágil ante cambios de iluminación, fondo, posición de cámara o del cubo.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez fuera del conjunto de entrenamiento.
- Dependencia del hardware exacto: requiere robot `so_follower` y dos cámaras (`wrist`, `overhead`) con los nombres y resoluciones exactos; cambios en la configuración invalidan la política.
- Sin capacidades lingüísticas ni multimodales generales: no debe usarse como modelo de texto, visión general, agentes o tool calling.
- Riesgo de sobreajuste a la distribución de demostraciones: al ser imitation learning puro, hereda sesgos y errores de las demostraciones teleoperadas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Sin datos de sesgo demográfico o lingüístico aplicables, pero sí sesgo de dominio (entorno de laboratorio concreto).
- No apto para entornos de seguridad crítica sin validación exhaustiva: la ausencia de evaluación y de mecanismos de seguridad explícitos desaconseja su uso directo en aplicaciones industriales sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeJun12/act_pick-cube-2cam_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/LeeJun12/pick-cube-2cam_20261028_193431
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LeeJun12/pick-cube-2cam_20261028_193431
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
