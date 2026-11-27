# 08semi/lekiwi_prototype15

## Resumen

`08semi/lekiwi_prototype15` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y distribuida a través del ecosistema LeRobot de Hugging Face. El modelo no es un LLM: es una política visuomotora que consume el estado articular del robot y dos flujos de imagen (cámara frontal y de muñeca) y produce directamente un vector de 9 acciones para el robot LeKiwi. Su propósito es ejecutar tareas de manipulación/movimiento aprendidas por demostración a partir de teleoperación, sin planificación simbólica ni lenguaje natural en el bucle de control.

El modelo fue entrenado por el usuario `08semi` sobre un dataset propio de 40 episodios y 6000 fotogramas a 30 FPS, con 7500 pasos de entrenamiento, batch de 8 y AdamW a un learning rate de 1e-05. La arquitectura subyacente es la de ACT (Zhao et al., 2023), un transformer encoder-decoder con un cuello de botella latente de tipo VAE que predice chunks de acciones en lugar de pasos individuales, lo que reduce el error de compounding y suaviza la ejecución.

Es relevante ahora porque ejemplifica el flujo actual de robótica open source de bajo coste: un robot tipo LeKiwi (plataforma móvil de bajo presupuesto), un dataset pequeño, y un entrenamiento reproducible con LeRobot 0.7.1. No obstante, se trata de un prototipo sin evaluación publicada, con licencia no especificada y con 0 descargas, por lo que su valor práctico es el de una referencia reproducible más que el de un artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con cuello de botella latente VAE y decodificación de chunks de acciones |
| Parametros totales | 51.674.761 (51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 0,6 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (codificador de imágenes por cámara), un codificador del estado propioceptivo y un transformer encoder-decoder que predice un chunk de `k` acciones futuras de una vez. La variante implementada en LeRobot añade un cuello de botella latente de tipo VAE (estilo CVAE) que modela la multimodalidad de las demostraciones humanas y evita que la política promedie trayectorias inconsistentes. La salida es un vector de 9 dimensiones por paso de control, y la entrada incluye `observation.state` de forma `(9,)` más dos imágenes: `front` a `(3, 480, 640)` y `wrist` a `(3, 640, 480)`.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `08semi/dataset_direction`: 40 episodios, 6000 fotogramas a 30 FPS, una única tarea descrita genéricamente como "My task description". Se ejecutaron 7500 pasos con batch de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se documenta aumento de datos, composición del dataset, ni si hubo filtrado de episodios fallidos. Tampoco se especifica la longitud del chunk de acciones, el número de capas del transformer ni las dimensiones del espacio latente, datos que LeRobot fija por defecto pero que el autor no refleja en la model card.

## Capacidades

- Control visuomotor de un robot LeKiwi a partir de dos cámaras (frontal y de muñeca) y del estado articular de 9 dimensiones.
- Predicción de chunks de acciones para ejecución suave y consistente en tareas de imitación.
- Ejecución autónoma de la tarea aprendida durante un tiempo configurable (`--duration` en `lerobot-rollout`).
- Aprendizaje por imitación a partir de teleoperación, sin necesidad de recompensas ni entorno simulado.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni procesamiento de lenguaje natural.
- No tiene capacidades multilingües, de visión general, de audio ni de generación de texto.
- No dispone de modo "thinking" ni de planificación jerárquica; es una política reactiva por chunk.

## Casos de uso

- Reproducción de una tarea de navegación o manipulación concreta en un LeKiwi: el modelo ejecuta la política entrenada durante `--duration` segundos mediante `lerobot-rollout`, adecuado para validar el pipeline de imitación de extremo a extremo.
- Prototipado rápido de políticas de imitación: sirve como plantilla para entrenar variantes con `lerobot-train --policy.type=act` sobre datasets propios de 40 episodios y 6000 fotogramas, un régimen de datos asequible para un laboratorio pequeño.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del chunking de acciones y del cuello de botella VAE en tareas con demostraciones humanas multimodales.
- Docencia y formación en robótica open source: el par dataset + política + comandos CLI de LeRobot constituye un ejemplo completo y reproducible de entrenamiento visuomotor.
- Benchmark interno de hardware de bajo coste: al ser una política de 51,7 M de parámetros y 0,6 GB, se puede ejecutar en GPUs de consumo para medir latencia de inferencia en el lazo de control del LeKiwi.
- Base para fine-tuning sobre nuevas tareas: el checkpoint puede reentrenarse con `lerobot-train` sobre un dataset distinto del mismo robot y misma configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no incluye tabla de tareas, número de ensayos ni tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,6 GB en safetensors (51,7 M de parámetros en FP32); en FP16/BF16 la política ocupa aproximadamente 0,1 GB de pesos, y el consumo real lo dominan los dos codificadores visuales y los buffers de imagen (480×640 y 640×480 por tres canales). En la práctica cabe en cualquier GPU con 4-8 GB libres.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar la política a 30 FPS sin problemas. Para entrenamiento, una RTX 4090 o A100 acelera los 7500 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para inferencia a baja frecuencia, aunque no se documenta latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) es la vía oficial; el formato safetensors permite cargarlo con PyTorch directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La model card no reporta tiempos de inferencia ni frecuencia de control efectiva alcanzada en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `08semi/lekiwi_prototype15` (ACT) | 51,7 M | Estado (9,) + 2 imágenes | Imitación visuomotora LeKiwi | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot (genéricas) | ~50 M (configuración por defecto) | Estado + imágenes | Imitación visuomotora | Apache-2.0 en el código de LeRobot; la licencia del checkpoint depende del autor | Hugging Face, múltiples checkpoints comunitarios |
| Diffusion Policy (Chi et al., 2023) | variable, típicamente 10-100 M | Estado + imágenes | Imitación visuomotora | MIT (implementación de referencia) | Repositorios académicos y LeRobot |
| VQ-BeT (Lee et al., 2024) | variable, del orden de decenas de M | Estado + imágenes | Imitación visuomotora | MIT (implementación de referencia) | Repositorios académicos y LeRobot |

La comparación cuantitativa de rendimiento no está disponible porque este checkpoint no publica tasas de éxito. Frente a Diffusion Policy, ACT es más ligero y rápido en inferencia, pero suele ser menos robusto ante multimodalidad compleja; frente a VQ-BeT, ACT es más simple de entrenar y no requiere discretización de acciones.

## Limitaciones y advertencias

- Licencia no especificada: la model card marca la licencia como "[More Information Needed]", por lo que no se puede asumir uso comercial sin contactar con el autor.
- Sin evaluación publicada: no hay tasas de éxito en robot real, ni número de ensayos, ni condiciones de dificultad, de modo que se desconoce la fiabilidad de la política.
- Dataset muy pequeño y de una sola tarea: 40 episodios y 6000 fotogramas con la descripción genérica "My task description"; la política probablemente se sobreajusta a las posiciones, iluminación y objetos vistos en las demostraciones.
- Sensibilidad al entorno: al ser imitación pura, no generaliza a nuevas posiciones de objetos, distracciones, cambios de iluminación ni a un robot distinto del mismo tipo.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con `observation.images.front` y `observation.images.wrist`, y con las resoluciones 480×640 y 640×480 respectivamente; cualquier desviación invalida la inferencia.
- Sin capacidades lingüísticas ni de razonamiento: no admite instrucciones en lenguaje natural, tool calling ni agentes; la tarea está codificada en los pesos.
- Riesgo de alucinación en el sentido robótico: la política puede ejecutar acciones plausibles pero incorrectas cuando la observación se sale de la distribución de entrenamiento, sin mecanismo de verificación.
- Sesgos derivados de la teleoperación: hereda los sesgos motores del operador humano y de la distribución de demostraciones, incluidos posibles episodios fallidos no filtrados.
- Sin datos de latencia ni de frecuencia de control efectiva, lo que impide garantizar el cumplimiento de los 30 FPS del dataset en producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/08semi/lekiwi_prototype15
- Dataset de entrenamiento: https://huggingface.co/datasets/08semi/dataset_direction
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=08semi/dataset_direction
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
