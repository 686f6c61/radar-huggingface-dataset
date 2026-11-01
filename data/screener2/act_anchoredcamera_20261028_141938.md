# Screener2/act_AnchoredCamera_20261028_141938

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `Screener2/act_AnchoredCamera_20261028_141938`, es una política entrenada con LeRobot sobre un robot `so_follower` (SO-100/SO-101) con una única cámara cenital (`overhead`), para la tarea "Green cylinder to yellow bucket".

El modelo consume un vector de estado de 6 dimensiones y una imagen RGB de 480x640, y produce una acción de 6 dimensiones. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real (30 FPS) sobre hardware modesto. La licencia es Apache 2.0.

Es relevante como ejemplo reproducible de un pipeline completo de imitación con LeRobot: dataset pequeño (15 episodios, 6738 frames), entrenamiento de 100.000 pasos y despliegue mediante `lerobot-rollout`. No es un modelo de lenguaje ni un modelo fundacional general; su utilidad está acotada a la tarea y al robot con los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal definida por la configuración de ACT) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación: un codificador visual procesa la imagen cenital, se concatena con el estado proprioceptivo de 6 dimensiones y un decodificador genera un chunk de acciones futuras en lugar de una sola acción. Esta predicción por chunks (action chunking) mitiga el problema de compounding error típico de las políticas paso a paso y permite movimientos más suaves y coherentes temporalmente. La implementación utilizada es la de LeRobot 0.5.2.

El entrenamiento se realizó sobre el dataset `Screener2/AnchoredCamera_20261028_141938`: 15 episodios, 6738 frames a 30 FPS, una única tarea ("Green cylinder to yellow bucket"), con un robot `so_follower` y una cámara `overhead`. Configuración: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta uso de RLHF, DPO ni aumento de datos; es aprendizaje supervisado por imitación a partir de teleoperación.

## Capacidades

- Generación de acciones de manipulación de 6 dimensiones a partir de observación visual y estado proprioceptivo.
- Ejecución de una tarea concreta de pick-and-place: llevar un cilindro verde a un cubo amarillo.
- Control en bucle cerrado a 30 FPS compatible con el robot `so_follower`.
- Predicción de chunks de acción que permiten trayectorias suaves.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, visión general, audio ni capacidades multilingües.

## Casos de uso

- Replicación de un pipeline de imitación extremo a extremo: sirve como referencia para grabar un dataset pequeño con LeRobot, entrenar ACT y desplegar la política, útil para equipos que evalúan el flujo antes de escalar a tareas propias.
- Automatización de una celda de pick-and-place con SO-100/SO-101: la política ejecuta la tarea "Green cylinder to yellow bucket" con una cámara cenital, adecuada para demostraciones de laboratorio y prototipos docentes.
- Base para fine-tuning con nuevos datasets: al ser Apache 2.0 y un modelo pequeño, se puede reentrenar con `lerobot-train` sobre datos propios para otras tareas de manipulación con el mismo robot.
- Benchmark interno de políticas de imitación: permite comparar variantes de ACT, configuraciones de cámaras o tamaños de dataset bajo una misma tarea y robot de referencia.
- Docencia y formación en robótica de imitación: el tamaño reducido (51,7 M de parámetros, 0,2 GB) y la licencia permisiva facilitan su uso en cursos y talleres.
- Validación de hardware y calibración: útil para verificar que la cadena cámara-robot-control funciona antes de invertir en datasets mayores, ya que la inferencia es ligera y en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, latencia medida ni comparativas numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); para esta tarea una GPU consumer es suficiente.
- Cabe en GPU consumer: sí, en prácticamente todas las NVIDIA modernas; también es viable en CPU para pruebas, aunque a menor velocidad.
- Opciones de despliegue: `lerobot-rollout` (flujo documentado), scripts de LeRobot con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles de forma medida; el entrenamiento y la grabación se hicieron a 30 FPS, lo que sugiere que la inferencia debe sostener ese ritmo en hardware adecuado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_AnchoredCamera_20261028_141938 (este) | 51,7 M | no aplica | Pick-and-place con SO-100, cámara cenital | Apache 2.0 | HuggingFace |
| Políticas ACT de LeRobot (genéricas) | ~50 M típicamente | no aplica | Manipulación variable según dataset | Apache 2.0 | HuggingFace / LeRobot |
| Diffusion Policy (implementación LeRobot) | variable | no aplica | Manipulación por difusión de acciones | según repo | HuggingFace / LeRobot |
| VQ-BeT / otras políticas de imitación en LeRobot | variable | no aplica | Manipulación por imitación | según repo | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Green cylinder to yellow bucket") y un único robot (`so_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Requiere una cámara cenital (`overhead`) con la misma configuración de observación (3, 480, 640) y el mismo vector de estado de 6 dimensiones.
- Dataset muy pequeño (15 episodios, 6738 frames): alta probabilidad de sobreajuste y baja robustez ante cambios de iluminación, posiciones de objetos o distractores.
- No hay evaluación publicada: se desconoce la tasa de éxito real en el robot.
- Riesgo de fallos silenciosos: al ser una política de imitación, puede ejecutar acciones plausibles pero incorrectas sin señal de error.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el comportamiento en entornos reales y de cumplir las normas de seguridad robótica.
- No es un modelo lingüístico: no procesa texto ni mantiene conversaciones; las etiquetas de idioma no aplican.
- El nombre del repositorio incluye una fecha futura (2026) y el autor no aporta documentación adicional; conviene verificar la procedencia antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Screener2/act_AnchoredCamera_20261028_141938
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/AnchoredCamera_20261028_141938
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_20261028_141938
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
