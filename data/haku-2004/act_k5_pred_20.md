# Haku-2004/act_k5_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad de las políticas entrenadas con datos de teleoperación. Este repositorio concreto, `Haku-2004/act_k5_pred_20`, es una política entrenada por el usuario Haku-2004 con LeRobot sobre el dataset `Haku-2004/k5_4seg` para la tarea "taskbox" en un robot `so_follower`.

El modelo consume el estado articular (6 dimensiones) y dos flujos de cámara (`front` y `side`, 480x640 RGB) y produce un vector de acción de 6 dimensiones. Con 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, es una política ligera, pensada para ejecutarse en tiempo real sobre hardware modesto, no para despliegue en servidores de gran escala.

Su relevancia es acotada: se trata de un checkpoint experimental de un único autor, sin resultados de evaluación publicados y con 0 descargas en el momento de redactar esta ficha. Resulta útil como referencia de formato y flujo de trabajo de LeRobot, pero no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura sigue el método ACT descrito en el paper arXiv:2304.13705. Se compone de un codificador visual (típicamente ResNet) que procesa las dos vistas de cámara, un codificador del estado articular y un transformer que fusiona ambas modalidades y decodifica un chunk de acciones futuras. La predicción por chunks, junto con el mecanismo de *temporal ensembling* habitual en ACT, suaviza las transiciones y mitiga el error de compounding.

El entrenamiento se realizó con LeRobot 0.5.2 sobre 20 episodios y 25.815 fotogramas a 30 FPS del dataset `Haku-2004/k5_4seg` para la tarea "taskbox". Se ejecutaron 50.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición adicional del dataset, aumentos de datos, ni fases de RLHF/DPO (no aplicables en aprendizaje por imitación).

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente las cámaras `front` y `side` a 480x640.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados.
- Ejecución de una tarea concreta ("taskbox") aprendida de demostraciones humanas.
- Integración con el ecosistema LeRobot mediante `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de pick-and-place: la política puede ejecutar la tarea "taskbox" sobre un `so_follower` calibrado, sustituyendo la teleoperación manual por inferencia en bucle cerrado.
- Prototipado rápido de políticas de imitación: sirve como plantilla para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: permite reproducir el flujo ACT con un dataset pequeño (20 episodios) y comparar hiperparámetros.
- Benchmark interno de hardware de bajo coste: al tener ~51,7 M de parámetros, se puede ejecutar en una GPU de consumo para medir latencia de control a 30 FPS.
- Educación y demos: útil para mostrar el ciclo de vida de una política robótica en talleres o cursos con robots SO-100/SO-101.
- Base para *fine-tuning*: punto de partida para reentrenar sobre nuevas tareas o variaciones de "taskbox" con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros, más el coste de los dos flujos de imagen a 480x640; en la práctica, cabe en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 o superiores para control en tiempo real; A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para pruebas de baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), con backend PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles; el objetivo de diseño es operar a 30 FPS, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5_pred_20 | 51,7 M | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face |
| Políticas ACT oficiales de LeRobot | variable | no aplica | reportadas en docs de LeRobot | apache-2.0 | Hugging Face / GitHub |
| Diffusion Policy (referencia) | variable | no aplica | benchmarks en paper original | MIT (implementación de referencia) | GitHub |
| VQ-BeT (referencia) | variable | no aplica | benchmarks en paper original | MIT (implementación de referencia) | GitHub |

No se dispone de datos comparativos cuantitativos entre estas alternativas en la información proporcionada; la comparación es cualitativa y se basa en la categoría (políticas de imitación para robótica).

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba documentadas; el rendimiento real es desconocido.
- Dataset muy reducido: 20 episodios y una única tarea ("taskbox"), lo que limita la generalización a variaciones de posición, iluminación u objetos.
- Específico de hardware: entrenado para `so_follower` con cámaras `front` y `side`; requiere calibración y nombres de cámara coincidentes.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni razonamiento; no debe evaluarse con benchmarks de LLM.
- Riesgo de sobreajuste y de fallo fuera de distribución; no se documentan sesgos, pero la política hereda los sesgos de las demostraciones humanas.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de garantías y de evaluación hace desaconsejable su uso en producción sin validación propia.
- Repositorio con 0 descargas y 0 likes: sin comunidad ni soporte; el autor no ofrece canal de mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5_pred_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
