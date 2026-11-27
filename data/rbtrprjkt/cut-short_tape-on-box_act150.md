# rbtrprjkt/cut-short_tape-on-box_act150

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `rbtrprjkt/cut-short_tape-on-box_act150`, es una política entrenada con LeRobot sobre el robot `widowxai_follower_robot` para la tarea específica de "coger un cúter y cortar la cinta negra de una caja de cartón".

El modelo tiene 51.721.863 parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Es una política de robótica de propósito específico, no un modelo de lenguaje: consume observaciones multimodales (estado articular de 7 dimensiones y cuatro cámaras RGB de 480x640) y produce un vector de acción de 7 dimensiones. Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en robots reales de bajo coste.

El entrenamiento se realizó durante 150.000 pasos con un batch de 32 sobre un dataset de 70 episodios y 62.809 frames a 30 FPS. No se han publicado resultados de evaluación en robot real ni benchmarks, por lo que su rendimiento efectivo en producción debe validarse empíricamente antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.721.863 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un cuello de botella variacional (VAE) que modela la distribución de secuencias de acciones. La política recibe como entrada el estado articular (`observation.state`, 7 dimensiones) y cuatro flujos visuales (`cam_high`, `cam_low`, `cam_left_wrist`, `cam_right_wrist`, cada uno de 3x480x640), y emite un chunk de acciones de 7 dimensiones. La innovación central del método es predecir varios pasos de acción de forma conjunta, lo que mitiga el problema de compounding errors típico de las políticas que predicen un único paso.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `rbtrprjkt/cut-short_tape-on-box`: 70 episodios teleoperados, 62.809 frames a 30 FPS, tarea "Pick the custom utility knife and cut the black tape on the cardboard box". Configuración: 150.000 pasos, batch 32, optimizador AdamW, learning rate 1e-05, semilla 1000. No se documenta uso de RLHF, DPO ni datos sintéticos; es aprendizaje por imitación supervisado puro a partir de demostraciones.

## Capacidades

- Manipulación robótica de propósito específico: cortar cinta negra sobre una caja de cartón con un cúter.
- Percepción multimodal: integra estado articular y cuatro vistas de cámara (alta, baja y dos muñecas).
- Predicción de chunks de acción de 7 dimensiones para control continuo del efector.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout` sobre el robot `widowxai_follower_robot`.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo "thinking".

## Casos de uso

- Automatización de corte de precintos en líneas de empaquetado: la política ejecuta la secuencia de coger el cúter y cortar la cinta sobre cajas de cartón, adecuada para tareas repetitivas de apertura de embalajes en entornos controlados.
- Prototipado de flujos de imitación con LeRobot: sirve como referencia reproducible para validar el pipeline completo (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) en un robot WidowX AI.
- Investigación en aprendizaje por imitación: base para experimentos de ablación sobre número de cámaras, tasa de frames o número de episodios, dado que el dataset y la configuración están documentados.
- Benchmark interno de políticas ACT: punto de partida para comparar variantes (por ejemplo, distintos números de pasos de entrenamiento o arquitecturas) sobre la misma tarea y robot.
- Formación de operarios de robótica: permite demostrar en un entorno real cómo una política entrenada con 70 demostraciones ejecuta una tarea de manipulación fina con herramienta.
- Pruebas de integración hardware-software: útil para verificar calibración de cámaras, puertos del robot y sincronización a 30 FPS antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de las cuatro cámaras a 480x640 y el grafo de inferencia (estimación orientativa: menos de 2 GB en fp32).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente por tamaño; para despliegue en robot se recomienda una RTX 3060/4060 o superior por latencia y fiabilidad de drivers.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM; también es viable en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=rbtrprjkt/cut-short_tape-on-box_act150`), PyTorch con CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas de robótica).
- Latencia y throughput: no disponibles; dependen del robot, de la GPU y del número de cámaras. El control opera a 30 FPS según el dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rbtrprjkt/cut-short_tape-on-box_act150` (este) | 51,7 M | ACT, imitación | 4 cámaras 480x640 + estado 7D | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot (p. ej. `lerobot/act_*`) | ~50 M (típico) | ACT, imitación | Variable según dataset | Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | Difusión, imitación | Variable según dataset | Apache 2.0 | Hugging Face |
| Políticas π0 / OpenVLA (VLA) | miles de millones | VLA, imitación + lenguaje | Instrucciones en lenguaje + visión | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este checkpoint ni métricas de éxito en robot real. Las alternativas se listan por categoría (políticas de imitación para manipulación) y no por superioridad medida.

## Limitaciones y advertencias

- Política de propósito único: entrenada exclusivamente para "coger el cúter y cortar la cinta negra de una caja de cartón"; no generaliza a otras tareas, objetos ni posiciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni pruebas en robot real documentadas; el rendimiento en producción es desconocido.
- Dependencia del hardware: requiere el robot `widowxai_follower_robot` y exactamente las cuatro cámaras (`cam_high`, `cam_low`, `cam_left_wrist`, `cam_right_wrist`) con los nombres e índices correctos; cualquier cambio invalida la política.
- Sensibilidad a condiciones de captura: cambios de iluminación, posición de la caja, tipo de cúter o cinta pueden degradar el comportamiento, al no haberse documentado variaciones en el dataset.
- Dataset pequeño: 70 episodios y 62.809 frames; riesgo de sobreajuste a las demostraciones y escasa cobertura de estados.
- Riesgo de alucinación en el sentido de acciones erróneas: al ser una política de imitación sin verificación de seguridad, puede ejecutar movimientos no deseados; requiere parada de emergencia y supervisión humana.
- Sesgos: no evaluados; el dataset proviene de un único operador y entorno, por lo que el comportamiento puede reflejar sus sesgos motores.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción es responsabilidad del integrador.
- Idiomas: no aplica; no procesa lenguaje natural ni instrucciones textuales en tiempo de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rbtrprjkt/cut-short_tape-on-box_act150
- Dataset de entrenamiento: https://huggingface.co/datasets/rbtrprjkt/cut-short_tape-on-box
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rbtrprjkt/cut-short_tape-on-box
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
