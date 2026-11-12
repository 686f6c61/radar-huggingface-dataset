# Haku-2004/act_k5end_pred_20

## Resumen

`act_k5end_pred_20` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El modelo lo ha subido el usuario Haku-2004 y está diseñado para controlar un robot tipo `so_follower` (el brazo seguidor del ecosistema SO-100/SO-101 de LeRobot) a partir de dos flujos de vídeo de 480x640 píxeles y un vector de estado de 6 dimensiones.

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice trozos (chunks) de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Esta política concreta se ha entrenado sobre el dataset `Haku-2004/k5_4seg` (20 episodios, 25.815 fotogramas a 30 FPS) para la tarea "taskbox", que probablemente implica manipular una caja de tareas.

El modelo tiene 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y apto para inferencia en tiempo real en hardware de consumo. Es relevante para quienes trabajan con brazos robóticos de bajo coste y quieren un punto de partida reproducible para tareas de pick-and-place o manipulación de objetos pequeños, aunque su alcance es muy específico y no se han publicado evaluaciones reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.672.714 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `front`, `side` (480x640, 3 canales) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida de acción | `action` con forma (6,) |
| Dataset de entrenamiento | `Haku-2004/k5_4seg` (20 episodios, 25.815 fotogramas, 30 FPS) |
| Tarea | "taskbox" |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.5.2 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) combina un codificador visual (típicamente ResNet) que procesa las imágenes de las cámaras `front` y `side`, un codificador de estado que integra el vector de 6 dimensiones, y un transformer que fusiona ambas representaciones para predecir un chunk de acciones futuras. La innovación principal del método es predecir secuencias de acciones (chunks) en lugar de pasos individuales, lo que mitiga el problema de compounding errors típico de las políticas de imitación y permite un control más suave. Además, ACT incorpora una técnica de entrenamiento con ruido en las acciones objetivo (action chunking con CVAE) para modelar la variabilidad humana en los datos de teleoperación.

El entrenamiento se ha realizado con LeRobot 0.5.2 sobre 50.000 pasos, batch size 8, AdamW con learning rate 1e-05 y semilla 1000, usando el dataset `Haku-2004/k5_4seg` con 20 episodios y 25.815 fotogramas a 30 FPS para la tarea "taskbox". No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje por imitación supervisado puro. No se especifica la composición exacta del dataset más allá del número de episodios y la tarea.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower`.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (`front` y `side`) a 480x640.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de teleoperación humana.
- Predicción de chunks de acciones: genera secuencias de acciones para mayor estabilidad.
- Ejecución en tiempo real: diseñado para inferencia a 30 FPS en hardware modesto.
- Tarea específica: entrenado para "taskbox"; no es un modelo generalista.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Manipulación de cajas en línea de montaje: la política puede ejecutar la tarea "taskbox" en un brazo SO-100/SO-101, cogiendo y colocando objetos pequeños en una caja, gracias a su entrenamiento específico con 20 episodios y dos vistas.
- Prototipado rápido de políticas de imitación: sirve como referencia reproducible para validar el pipeline de LeRobot (`lerobot-rollout`) antes de entrenar políticas propias con más datos.
- Investigación en aprendizaje por imitación: útil para comparar ACT con otros métodos (Diffusion Policy, VQ-BeT) en tareas de manipulación con brazos de bajo coste.
- Docencia y formación: ejemplo didáctico de entrenamiento y despliegue de una política ACT con LeRobot, incluyendo configuración de cámaras y calibración.
- Automatización de tareas repetitivas en laboratorio: recogida y colocación de componentes en entornos controlados con iluminación estable.
- Benchmark interno de hardware robótico: permite medir latencia y throughput de inferencia en distintas GPUs con una política ligera de 51,7 M de parámetros.
- Base para fine-tuning: punto de partida para adaptar la política a variantes de la tarea "taskbox" con nuevos objetos o posiciones, reentrenando con el dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros, ~207 MB de pesos); en FP16 ~104 MB. Con buffers de activación y dos cámaras 480x640, el consumo total es de pocos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3050, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles; el diseño apunta a 30 FPS (frecuencia del dataset), pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_k5end_pred_20` (este) | 51,7 M | 2 cámaras 480x640 + estado (6,) | taskbox (SO-100) | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | ~80 M (ResNet-18 + transformer) | 4 cámaras + estado | Simulación y robot real | MIT (código) | GitHub |
| Diffusion Policy (Chi et al.) | ~100-300 M según configuración | 2 cámaras + estado | Manipulación diversa | MIT | GitHub |
| VQ-BeT | ~10-50 M | 1-2 cámaras + estado | Manipulación | MIT | GitHub |

Los datos de parámetros de los modelos comparativos son aproximados y no se han verificado en la información proporcionada; se indican como referencia orientativa. No se dispone de comparaciones de rendimiento publicadas entre este modelo y las alternativas.

## Limitaciones y advertencias

- Sin evaluación real: no hay tasas de éxito publicadas; el rendimiento real en robot es desconocido.
- Dataset muy pequeño: solo 20 episodios y una única tarea ("taskbox"), lo que limita la generalización a variaciones de objetos, posiciones o iluminación.
- Especificidad de hardware: entrenado para `so_follower` con cámaras concretas; requiere calibración y correspondencia exacta de nombres de cámaras (`front`, `side`).
- Riesgo de sobreajuste: 50.000 pasos con batch size 8 sobre 20 episodios puede provocar sobreajuste al dataset; no se documenta validación.
- Sin capacidades de lenguaje: no es un modelo conversacional ni multilingüe; no aplica para NLP.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin información sobre sesgos: no se documentan sesgos, pero al ser un modelo de imitación puede reproducir sesgos de los datos de teleoperación (posiciones, velocidades, estilos del operador).
- Alucinación: no aplica en el sentido de NLP, pero la política puede generar acciones no válidas fuera de la distribución de entrenamiento.
- Restricciones de producción: no se recomienda su uso en entornos no controlados sin validación previa y sin un sistema de seguridad externo.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k5end_pred_20
- Dataset: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
