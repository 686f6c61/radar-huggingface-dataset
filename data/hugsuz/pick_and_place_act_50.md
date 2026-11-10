# hugsuz/pick_and_place_act_50

## Resumen

`hugsuz/pick_and_place_act_50` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers), publicado por Zhao et al. en 2023 (arXiv:2304.13705). El modelo ha sido entrenado y publicado en el Hub mediante la librería LeRobot de Hugging Face, y está diseñado para controlar un robot manipulador de tipo `omx_follower` en una tarea concreta de recogida y colocación (`pick_and_place`). No es un modelo de lenguaje: es una política visomotora que consume el estado articular del robot y dos cámaras (muñeca y cenital) y emite comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,4 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. La arquitectura es un transformer encoder-decoder con cabezal de predicción de trozos de acción (action chunks), una innovación que predice secuencias cortas de acciones en lugar de pasos individuales para reducir el error de acumulación típico de las políticas de imitación paso a paso.

Su relevancia es acotada: se trata de un checkpoint de demostración entrenado con solo 50 episodios (21.960 fotogramas a 30 FPS) y 1.000 pasos de entrenamiento, sin resultados de evaluación publicados. Resulta útil como referencia para reproducir el flujo de trabajo de LeRobot y como punto de partida para experimentos de imitación en robots de bajo coste, pero no debe considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con predicción de trozos de acción |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de chunking: en lugar de predecir una única acción por paso, el modelo predice un bloque de acciones futuras (típicamente decenas de pasos), lo que mitiga el error de compounding y permite un control más suave. La entrada combina el estado de las articulaciones (`observation.state`, vector de 6 dimensiones) con dos flujos visuales de resolución 240×320 procedentes de las cámaras `wrist` y `top`, y la salida es un vector de acción de 6 dimensiones. El modelo se entrenó con el dataset `hugsuz/pick_and_place_20261110_151854`, compuesto por 50 episodios y 21.960 fotogramas a 30 FPS de la tarea "pick_and_place".

La configuración de entrenamiento fue: 1.000 pasos, batch size 10, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.7.1. Se trata de un entrenamiento muy corto y con un dataset pequeño, lo que sugiere que el modelo es un artefacto de demostración más que una política robusta. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores, algo esperable en aprendizaje por imitación puro. Tampoco se especifica la composición exacta del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado articular y dos cámaras.
- Predicción de trozos de acción (action chunking), que reduce el error acumulado frente a políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución en tiempo real sobre el robot `omx_follower` mediante `lerobot-rollout`.
- Tarea específica: `pick_and_place` (recoger y colocar un objeto).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de las dos cámaras de entrada.

## Casos de uso

- Demostración educativa de aprendizaje por imitación: sirve para ilustrar el flujo completo de LeRobot (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) en cursos y talleres de robótica.
- Reproducción de la tarea pick_and_place en un robot `omx_follower`: el modelo puede ejecutar la política durante 60 segundos con el comando documentado, útil para validar la cadena hardware-software antes de entrenar políticas propias.
- Punto de partida para fine-tuning: al ser un checkpoint ligero (51,7 M de parámetros, 0,4 GB), puede reentrenarse con datasets propios de tareas similares en hardware de consumo.
- Benchmark interno de infraestructura: permite medir latencia y throughput de inferencia de LeRobot en un robot concreto antes de escalar a políticas más grandes.
- Prototipado de recogida y colocación en laboratorio: adecuado para experimentos controlados con objetos y posiciones fijas, siempre que se validen los resultados empíricamente.
- Referencia comparativa para investigaciones sobre chunking: útil para contrastar ACT frente a políticas paso a paso en la misma tarea y robot.
- Prueba de integración de cámaras `wrist` y `top`: sirve para verificar la configuración de dos flujos visuales de 240×320 en pipelines de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "_No evaluation results have been provided for this policy yet._"

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño del modelo (51,7 M de parámetros) más el overhead de los dos flujos de imagen de 240×320; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; se recomienda una RTX 3060 o superior para margen con el preprocesado de imágenes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el método documentado por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El modelo opera a 30 FPS según la tasa de captura del dataset, pero no se publican mediciones de latencia real.
- Requisitos adicionales: robot `omx_follower`, dos cámaras OpenCV (muñeca y cenital) y el paquete `lerobot` instalado.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hugsuz/pick_and_place_act_50` | 51,7 M | Pick and place (omx_follower) | no aplica | no disponible | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | Tareas diversas | no aplica | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | Manipulación | no aplica | variable | Hugging Face |
| Políticas VLA tipo RT-2 / OpenVLA | miles de millones | Manipulación generalista | no aplica | variable | Hugging Face / investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento muy corto (1.000 pasos) y dataset reducido (50 episodios): la política probablemente no generaliza fuera de las condiciones exactas de grabación.
- Sin resultados de evaluación publicados: no hay evidencia empírica de tasa de éxito.
- Licencia no especificada ("More Information Needed"): no se puede garantizar el uso comercial sin consultar al autor.
- Tarea única (`pick_and_place`) y robot específico (`omx_follower`): no es transferible a otros robots o tareas sin reentrenamiento.
- Dependencia de dos cámaras con nombres y resoluciones concretas (`wrist`, `top`, 240×320): cualquier cambio en la configuración de sensores invalida la política.
- Riesgo de sobreajuste a posiciones, iluminación y objetos del dataset de entrenamiento.
- No procesa lenguaje natural ni instrucciones; la tarea está fijada en el prompt `pick_and_place`.
- No hay información sobre sesgos, pero al ser un modelo entrenado con datos teleoperados de un único operador, puede heredar sesgos motores de ese operador.
- No apta para producción sin una evaluación rigurosa en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugsuz/pick_and_place_act_50
- Dataset de entrenamiento: https://huggingface.co/datasets/hugsuz/pick_and_place_20261110_151854
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hugsuz/pick_and_place_20261110_151854
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
