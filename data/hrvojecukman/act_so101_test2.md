# hrvojecukman/act_so101_test2

## Resumen

`hrvojecukman/act_so101_test2` es una política de imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario hrvojecukman en Hugging Face. No es un modelo de lenguaje: es un modelo de robótica entrenado con LeRobot que consume observaciones multimodales (estado de las articulaciones e imagen de cámara frontal) y emite comandos de acción de 6 dimensiones para un robot de tipo `so_follower` (SO-101). El modelo resuelve una tarea concreta de manipulación: "Pick up the dice and put it in the box".

El método ACT, descrito en el paper arXiv:2304.13705, predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y permite un control más suave en tareas de imitación aprendidas a partir de demostraciones teleoperadas. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras ejecutables en hardware de consumo.

Es relevante ahora como ejemplo práctico y reproducible del flujo de trabajo de LeRobot: entrenamiento con pocos episodios (5 episodios, 2999 frames), configuración de entrenamiento documentada y comandos de despliegue listos para usar. Su utilidad es principalmente experimental y educativa, no de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana temporal definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un encoder visual y un decoder que predice secuencias de acciones (chunks) en lugar de una única acción por paso. La política recibe `observation.state` con forma `(6,)` y `observation.images.front` con forma `(3, 720, 1280)`, y produce `action` con forma `(6,)`. El objetivo es aprender una política de control a partir de demostraciones teleoperadas, mitigando el problema de compounding error típico de los métodos paso a paso.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `hrvojecukman/so101_test2_20261030_112321`, compuesto por 5 episodios, 2999 frames a 30 FPS y una única tarea ("Pick up the dice and put it in the box"). La configuración fue: 2000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documentan detalles sobre aumentos de datos, composición adicional del dataset ni uso de RLHF/DPO (no aplica en este paradigma).

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Percepción visual: procesa imágenes RGB de una cámara frontal a resolución 720x1280.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación.
- Predicción de chunks de acción: emite secuencias cortas de acciones, lo que mejora la estabilidad del control.
- Ejecución de una tarea específica: recoger un dado y depositarlo en una caja.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Reproducción de una tarea de pick-and-place en un SO-101: el modelo ejecuta la política entrenada mediante `lerobot-rollout` con `--policy.path=hrvojecukman/act_so101_test2`, adecuado para validar el pipeline completo de LeRobot en un robot real.
- Docencia y formación en aprendizaje por imitación: sirve como ejemplo mínimo (5 episodios, 2000 pasos) para explicar el ciclo de grabación de datos, entrenamiento y despliegue de una política ACT.
- Prototipado rápido de políticas robóticas: al ser ligero (51,7 M de parámetros, 0,2 GB), permite iterar en estaciones de trabajo con GPU de consumo antes de escalar a datasets mayores.
- Benchmark interno de infraestructura de robótica: útil para comprobar latencia, FPS y estabilidad del lazo de control con cámaras OpenCV a 30 FPS.
- Base para fine-tuning con datos propios: el comando `lerobot-train` documentado permite reentrenar el modelo con un dataset distinto y la misma arquitectura ACT.
- Pruebas de integración de LeRobot 0.6.2: valida compatibilidad de versiones, formato de dataset y convenciones de nombres de cámaras (`front`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, ~0,2 GB en safetensors) es plausible ejecutarlo en GPUs con 4-8 GB de VRAM, aunque no se documenta.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) como vía documentada. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se publican métricas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hrvojecukman/act_so101_test2 | 51.668.614 | ACT (LeRobot) | no aplica | apache-2.0 | Hugging Face |
| Otros modelos ACT en LeRobot Hub | no disponible | ACT | no aplica | variable | Hugging Face |
| Políticas de imitación alternativas (p. ej. Diffusion Policy) | no disponible | difusión | no aplica | variable | Hugging Face / repos académicos |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 5 episodios y 2999 frames: alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación o distracciones distintas.
- Tarea única: no es un modelo generalista; solo se ha entrenado para "Pick up the dice and put it in the box".
- Sin evaluación publicada: no hay tasas de éxito verificadas en robot real.
- Dependencia de la cámara frontal y del robot `so_follower`: cambios de hardware o de resolución pueden degradar el rendimiento.
- Riesgo de fallo ante objetos no vistos o configuraciones distintas de la mesa.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- El repositorio tiene pocas descargas (22) y 0 likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrvojecukman/act_so101_test2
- Dataset de entrenamiento: https://huggingface.co/datasets/hrvojecukman/so101_test2_20261030_112321
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hrvojecukman/so101_test2_20261030_112321
