# go234/smolvla_pick-two-cubes-v4

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, `go234/smolvla_pick-two-cubes-v4`, es un ajuste fino del modelo base `lerobot/smolvla_base` entrenado por el usuario go234 para una tarea específica: recoger un cubo rojo y depositarlo en una caja. El modelo consume observaciones multimodales (estado del robot y tres cámaras) y produce acciones de control de 6 dimensiones para un robot tipo `so_follower` (SO-101).

Con 450 millones de parámetros, el modelo está pensado para desplegarse en hardware de consumo, lo que lo hace accesible para laboratorios y aficionados sin necesidad de clústeres de GPU. La relevancia de este tipo de políticas es que democratizan la robótica de imitación: con 25 episodios de demostración (15.329 fotogramas a 30 FPS) y 20.000 pasos de entrenamiento se obtiene una política ejecutable en un robot real.

No obstante, conviene subrayar que se trata de una política altamente especializada y de nicho: resuelve una única tarea en un entorno concreto, no es un modelo de propósito general y no se han publicado resultados de evaluación en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, tipo SmolVLA (transformer multimodal con codificador visual y decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en inglés, sin soporte multilingüe documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual (procesa tres cámaras a 256×256 píxeles), un codificador de lenguaje para la instrucción de tarea y un decodificador que genera vectores de acción continuos. El modelo recibe `observation.state` de 6 dimensiones y tres flujos de imagen (`camera1`, `camera2`, `camera3`), y produce una acción de 6 dimensiones por paso de control. Está diseñado para ser compacto y eficiente, de modo que pueda ejecutarse en hardware de consumo, según indica la propia model card.

El ajuste fino se realizó sobre `lerobot/smolvla_base` con el dataset `go234/pick-two-cubes_20261123_231046`, compuesto por 25 episodios y 15.329 fotogramas a 30 FPS, con una única instrucción de tarea: "Pick up the red cube and put it in the box.". La configuración de entrenamiento fue de 20.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de imitación: genera acciones de 6 grados de libertad para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente tres cámaras RGB de 256×256 píxeles.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante un prompt textual ("Pick up the red cube and put it in the box.").
- Ejecución de una tarea de manipulación concreta: agarre de un cubo rojo y depósito en una caja.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite inferencia en GPU de gama media/consumo.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train` para ejecución y reentrenamiento.
- No soporta tool calling, agentes multi-paso, visión general, audio ni razonamiento textual de propósito general.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida reproducible para estudiar el ajuste fino de políticas VLA con pocos datos (25 episodios) y comparar hiperparámetros.
- Automatización de tareas de pick-and-place en laboratorio: el modelo ejecuta el ciclo completo de agarre y depósito sobre un robot SO-101, útil para prototipos de manipulación.
- Docencia y formación en robótica: al ejecutarse en hardware de consumo y con el stack LeRobot, permite montar prácticas de entrenamiento y despliegue de políticas sin infraestructura costosa.
- Benchmark interno de recolección de datos: el dataset asociado (15.329 fotogramas a 30 FPS) sirve para evaluar protocolos de teleoperación y calidad de demostraciones.
- Base para ajustes finos en tareas similares: al derivar de `smolvla_base`, puede reentrenarse con nuevos datasets para variantes de la misma tarea (otros objetos, posiciones o contenedores).
- Pruebas de integración de pipelines de robótica: validar el flujo `lerobot-rollout` con cámaras OpenCV, puertos serie y calibración del robot antes de escalar a políticas mayores.
- Demostraciones educativas de VLA: ilustrar cómo un modelo compacto traduce instrucciones en lenguaje natural y vídeo en acciones físicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, métricas de MMLU, HumanEval, GSM8K ni de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16), la inferencia requiere del orden de 2-3 GB de VRAM incluyendo activaciones y buffers de imagen, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o RTX 4090 son suficientes. Para entrenamiento con batch size 4 se recomienda una GPU de 8 GB o superior.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo y su diseño explícito para hardware de consumo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución se realiza a 30 FPS según la frecuencia del dataset, pero no se publican medidas de latencia por paso de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| go234/smolvla_pick-two-cubes-v4 | 450 M | no disponible | Pick-and-place de un cubo rojo | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | Política VLA base para ajuste fino | no disponible en la informacion | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la informacion | no disponible | Manipulación por imitación | no disponible en la informacion | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han publicado métricas de rendimiento de esta política ni de sus competidoras en la documentación consultada.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "Pick up the red cube and put it in the box." y no generaliza a otras instrucciones u objetos.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 25 episodios y 15.329 fotogramas pueden provocar sobreajuste al entorno, iluminación y posiciones exactas de las demostraciones.
- Dependencia del hardware: requiere un robot `so_follower`, tres cámaras con nombres e índices concretos y calibración específica; cualquier cambio de configuración puede degradar el rendimiento.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones incoherentes ante observaciones fuera de distribución (nuevos objetos, oclusiones, cambios de iluminación).
- Sin soporte multilingüe ni de propósito general: no es un modelo de lenguaje conversacional ni un asistente; no debe emplearse para tareas de texto, código o razonamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base `lerobot/smolvla_base` antes de un despliegue comercial.
- Sin cuantizaciones documentadas: no se ofrecen variantes GGUF, AWQ o GPTQ, lo que limita el despliegue en entornos con restricciones de memoria no soportadas por PyTorch.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/go234/smolvla_pick-two-cubes-v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/pick-two-cubes_20261123_231046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/pick-two-cubes_20261123_231046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
