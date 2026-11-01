# nguigz/2jetonfusion_trained

## Resumen

`nguigz/2jetonfusion_trained` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub por el usuario nguigz y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un robot y dos cámaras (frontal y superior) y emite comandos de acción de 6 dimensiones. Su propósito es ejecutar tareas de manipulación aprendidas a partir de demostraciones teleoperadas.

El modelo resuelve el problema clásico de la robótica de manipulación: convertir observaciones visuales y propioceptivas en acciones continuas sin un pipeline de planificación explícito. ACT predice "chunks" de acciones (varias acciones futuras de una vez) en lugar de un único paso, lo que reduce el error de compounding y suaviza la ejecución. El repositorio es pequeño (0,2 GB) y contiene 51.668.614 parámetros en formato safetensors.

Es relevante como ejemplo reproducible de entrenamiento de políticas robóticas con LeRobot 0.6.2 sobre un robot SO-100/SO-101 (tipo `so_follower`), con un dataset de 100 episodios y 29.290 frames a 30 FPS para dos tareas de recogida de fichas ("mettre le jeton dans la boite", "mettre le jeton dans le bac"). No dispone de resultados de evaluación publicados ni de métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de imágenes y estado, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no lingüístico; las tareas están etiquetadas en francés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que combina un backbone visual (codificador de imágenes) con un transformer que fusiona las características visuales con el estado proprioceptivo del robot. La salida es un chunk de acciones de longitud fija en lugar de una acción por paso, lo que mitiga el error acumulado típico de las políticas paso a paso y permite movimientos más suaves. La entrada del modelo son dos imágenes RGB de 3×240×320 (cámaras `front` y `top`) más un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `nguigz/2jetonfusion`: 100 episodios, 29.290 frames a 30 FPS, correspondientes a dos tareas de manipulación de fichas. La configuración reportada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de los episodios, ni si se aplicaron técnicas de aumento de datos, RLHF o DPO (no procede en este paradigma). Tampoco se especifica la arquitectura visual concreta (ResNet u otra) ni el tamaño del chunk de acciones.

## Capacidades

- Control visomotor de un robot `so_follower` (familia SO-100/SO-101) a partir de dos cámaras y estado articular de 6 dimensiones.
- Predicción de chunks de acciones continuas de 6 dimensiones para manipulación de objetos.
- Ejecución de dos tareas concretas de pick-and-place: "mettre le jeton dans la boite" y "mettre le jeton dans le bac".
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`, `lerobot-record`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, código ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de depositar fichas en una caja o bandeja sobre un robot SO-100/SO-101, usando las cámaras frontal y superior como única entrada perceptiva. Es adecuado porque fue entrenado específicamente sobre esas dos tareas y esa configuración de sensores.
- Reproducción de experimentos de aprendizaje por imitación: sirve como política de referencia para comparar variantes de ACT, cambios de dataset o configuraciones de entrenamiento en LeRobot, ya que el repo incluye la configuración exacta (pasos, batch, lr, semilla).
- Base para fine-tuning en tareas similares: al estar en formato LeRobot y con licencia Apache 2.0, puede reentrenarse con nuevos datasets de manipulación de objetos pequeños y reutilizarse como inicialización.
- Docencia y formación en robótica: permite demostrar el flujo completo de LeRobot (grabación, entrenamiento, rollout) con un modelo pequeño de 0,2 GB que cabe en cualquier GPU de consumo.
- Prototipado rápido de controladores visomotores: útil para validar hardware, calibración de cámaras y latencia de inferencia antes de invertir en datasets mayores.
- Evaluación de robustez frente a cambios de iluminación, posición de objetos o distracciones: el modelo permite medir la degradación de una política ACT entrenada con solo 100 episodios en condiciones no vistas.
- Integración en pipelines de investigación de robótica de bajo coste: al no requerir LLM ni infraestructura de servido compleja, puede ejecutarse en el propio robot o en un PC con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se reportan tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, repo de 0,2 GB) es esperable que quepa holgadamente en GPUs de consumo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente, pero el fabricante no lo especifica.
- Cabe en GPU de consumo: previsiblemente sí (el repo pesa 0,2 GB), aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=nguigz/2jetonfusion_trained`), y por extensión el stack de LeRobot en PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La model card no reporta tiempos de inferencia ni frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguigz/2jetonfusion_trained` (ACT) | 51,7 M | 2 imágenes 3×240×320 + estado (6,) | Pick-and-place de fichas en SO-follower | Apache 2.0 | Hugging Face Hub, LeRobot |
| Políticas ACT de LeRobot (genéricas) | variable (decenas de M) | imágenes + estado | Manipulación diversa | Apache 2.0 | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy | variable | imágenes + estado | Manipulación visomotora | variable según repo | Hugging Face Hub / LeRobot |
| Políticas VLA (p. ej. RT-2, OpenVLA) | miles de M | imágenes + instrucción textual | Manipulación generalista | variable | Repos de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, entradas, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot, incluso en las tareas para las que fue entrenado.
- Dataset muy pequeño (100 episodios, 29.290 frames): alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación o distracciones no vistas.
- Específico de hardware: entrenado para robot `so_follower` con cámaras `front` y `top`; cambiar la configuración de sensores o el robot requiere reentrenamiento.
- Solo dos tareas concretas ("mettre le jeton dans la boite", "mettre le jeton dans le bac"): no es un modelo generalista de manipulación.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; cualquier uso fuera del control robótico es inadecuado.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitación, puede producir comandos fuera de distribución ante observaciones novedosas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo en producción.
- No se documentan sesgos (no aplica en el sentido lingüístico) ni limitaciones de idioma, pero las etiquetas de tarea están en francés y el modelo no procesa texto.
- El repositorio tiene muy poca tracción (23 descargas, 0 likes) y fue creado en 2026-10-30; no hay evidencia de mantenimiento ni de comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguigz/2jetonfusion_trained
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/2jetonfusion
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/2jetonfusion
