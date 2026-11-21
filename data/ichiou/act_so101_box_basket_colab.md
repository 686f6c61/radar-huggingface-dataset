# ichiou/act_so101_box_basket_colab

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `ichiou/act_so101_box_basket_colab`, es una política entrenada con LeRobot sobre el robot `so_follower` (SO-101) para una única tarea: coger una caja y depositarla en una cesta.

El modelo consume el estado de las articulaciones (`observation.state`, vector de 6 dimensiones) y una imagen frontal de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, es una política ligera orientada a inferencia en tiempo real a 30 FPS sobre hardware modesto.

Su relevancia es práctica más que investigadora: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos teleoperados, entrenamiento con ACT y despliegue con `lerobot-rollout`) para una tarea de pick-and-place, y como punto de partida para quien quiera replicar el flujo con su propio robot SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con un prompt de texto fijo) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (encoder de imágenes) con un transformer que, a partir de la observación actual (estado de 6 articulaciones más imagen frontal de 3x480x640), predice un chunk de acciones futuras de dimensión 6. La predicción por chunks, en lugar de paso a paso, es la innovación central del método y mitiga el problema de *compounding error* típico de las políticas de imitación autorregresivas.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `ichiou/so101_box_basket`: 50 episodios teleoperados, 15.225 frames a 30 FPS, una única tarea ("Pick up the box and put it in the basket"). Configuración: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta composición adicional del dataset, aumentos de datos ni fases de RLHF/DPO (no aplicables a este tipo de política).

## Capacidades

- Generación de acciones de control para un robot SO-101 (`so_follower`) con 6 grados de libertad.
- Percepción visual monocular a partir de una cámara frontal (3x480x640).
- Ejecución de una tarea concreta de pick-and-place: coger una caja y meterla en una cesta.
- Predicción de chunks de acción, lo que aporta suavidad y robustez frente a errores acumulados.
- Integración con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Replicación de un pipeline de imitación end-to-end: sirve como referencia para grabar un dataset propio con SO-101, entrenar una política ACT y desplegarla con `lerobot-rollout`, validando cada etapa del flujo de LeRobot.
- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia coger caja y depositarla en cesta a 30 FPS, adecuada para demostraciones y prototipos de manipulación.
- Base para *fine-tuning* en tareas similares: al ser una política pequeña (51,7 M de parámetros), se puede reentrenar con pocos episodios adicionales para variantes de la misma tarea (otra cesta, otra posición inicial).
- Evaluación de hardware de bajo coste: el tamaño reducido del modelo permite medir latencia y throughput en GPUs de consumo y en sistemas embebidos con GPU integrada.
- Docencia y formación en robótica de imitación: ejemplo mínimo y reproducible de ACT con dataset y configuración documentados, útil en cursos y talleres.
- Benchmark interno de robustez: comparar la tasa de éxito de esta política frente a políticas entrenadas con más episodios o con aumentos de datos, usando el mismo robot y tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de 1-2 GB con pesos en safetensors (51,7 M de parámetros, ~0,2 GB de pesos) más el coste del encoder visual y los buffers de imagen; no se ha publicado una medición oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funcionan RTX 3060/4060, RTX 4090, A100 y H100. También es viable en CPU para pruebas, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) es el método documentado; el resto del stack LeRobot/PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles de forma oficial; el dataset y el despliegue se plantean a 30 FPS, lo que sugiere que el modelo está pensado para inferencia en tiempo real a esa frecuencia, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ichiou/act_so101_box_basket_colab` (este) | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face, LeRobot |
| Políticas ACT de referencia en LeRobot (p. ej. entrenadas sobre datasets públicos de SO-101) | variable, del orden de decenas de millones | no aplica | varía según dataset y tarea | habitualmente Apache-2.0 en los ejemplos de LeRobot | Hugging Face, LeRobot |
| Políticas Diffusion Policy (alternativa de imitación) | variable, típicamente mayor | no aplica | requiere evaluación por tarea | según implementación | LeRobot y otros frameworks |
| Políticas VLA tipo RT-2/OpenVLA (modelos visión-lenguaje-acción) | miles de millones | contexto textual | requiere hardware de gama alta | varía (a menudo no comercial) | Hugging Face y repos públicos |

La comparación cuantitativa con alternativas no está disponible porque este repositorio no publica métricas de éxito ni latencia.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset muy pequeño: 50 episodios y 15.225 frames para una sola tarea; la generalización a posiciones, iluminación u objetos distintos es previsiblemente limitada.
- Una sola cámara frontal: la política no dispone de visión estereoscópica ni de vistas laterales, lo que reduce la robustez ante oclusiones.
- Tarea única y prompt fijo: está entrenada para "Pick up the box and put it in the basket"; no es un modelo generalista.
- Licencia no especificada: la model card indica "More Information Needed", por lo que el uso comercial queda sin garantías legales hasta que el autor la defina.
- Riesgo de alucinación en sentido figurado: como toda política de imitación, puede producir acciones fuera de distribución ante observaciones no vistas durante el entrenamiento; requiere supervisión y parada de emergencia en el robot.
- Dependencia del hardware: el despliegue asume un SO-101 (`so_follower`) calibrado y cámaras configuradas con los mismos nombres de observación que en el entrenamiento.
- Sin cuantizaciones publicadas: no hay variantes GGUF ni pesos cuantizados, lo que limita su uso en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ichiou/act_so101_box_basket_colab
- Dataset de entrenamiento: https://huggingface.co/datasets/ichiou/so101_box_basket
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ichiou/so101_box_basket
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
