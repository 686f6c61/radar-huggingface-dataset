# eVorob/my_policy

## Resumen

`eVorob/my_policy` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de control motor que aprende directamente de datos de teleoperación y predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación.

El modelo está entrenado para un robot `so_follower` (SO-100/SO-101 de LeRobot) con dos cámaras (`wrist` y `top`) a resolución 480x640, y produce acciones de 6 dimensiones a partir de un estado de 6 dimensiones. La tarea concreta aprendida es "Grab the plastic objects of the 3d-print bed", con un dataset de solo 5 episodios y 4341 fotogramas a 30 FPS.

Es relevante como ejemplo reproducible del flujo completo de LeRobot (grabación, entrenamiento y despliegue) y como referencia de las limitaciones típicas de las políticas ACT entrenadas con pocos datos: alta especialización a la escena y baja generalización. Con 51,7 millones de parámetros y 0,2 GB de pesos, es extremadamente ligero y desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación temporal propia de ACT) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder visual (basado en ResNet) con un transformer encoder-decoder que predice secuencias de acciones (chunks) en lugar de una sola acción por paso. Esta formulación mitiga el problema de la varianza en la predicción de acciones y el error de composición que sufren las políticas paso a paso. El modelo consume `observation.state` de dimensión 6, dos imágenes RGB de 3x480x640 (`wrist` y `top`) y emite un vector de acción de dimensión 6.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `eVorob/record-test_20261103_214506`: 5 episodios, 4341 fotogramas a 30 FPS, una única tarea. Configuración: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta uso de RLHF, DPO ni aumento de datos; es aprendizaje supervisado puro sobre teleoperación. El volumen de datos es muy reducido, lo que condiciona fuertemente la generalización.

## Capacidades

- Control motor de manipulación robótica: predice acciones de 6 grados de libertad para el robot `so_follower`.
- Percepción visual multi-cámara: integra dos vistas simultáneas (muñeca y vista superior) a 480x640.
- Predicción por chunks: emite secuencias cortas de acciones, lo que estabiliza la ejecución frente a políticas paso a paso.
- Ejecución de una tarea específica: "Grab the plastic objects of the 3d-print bed".
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, agentes, razonamiento multi-paso simbólico, ni capacidades multilingües.

## Casos de uso

- Recogida de piezas en entorno controlado: el modelo puede ejecutar la tarea de retirada de objetos plásticos de una cama de impresión 3D con la misma configuración de robot y cámaras usada en el entrenamiento, aprovechando que la política está especializada en esa escena.
- Prototipado rápido de pipelines de imitación: sirve como referencia para validar el flujo completo de LeRobot (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de escalar a datasets mayores.
- Base para fine-tuning con más datos: al ser una política ACT ligera (51,7 M de parámetros), puede reentrenarse o ajustarse con datasets adicionales para ampliar la variedad de objetos o posiciones.
- Docencia y divulgación en robótica de imitación: su tamaño reducido y licencia permisiva lo hacen adecuado para demostraciones en cursos y talleres sobre aprendizaje por imitación.
- Benchmark interno de hardware de bajo coste: permite medir latencia y estabilidad de un robot SO-100/SO-101 con dos cámaras en un PC con GPU de consumo.
- Automatización de tareas repetitivas de pick-and-place en laboratorio: con la escena fija y objetos similares a los del entrenamiento, puede sustituir la teleoperación manual en ciclos repetidos.
- Investigación en generalización: útil como punto de partida para estudiar cómo varía la tasa de éxito al cambiar iluminación, posiciones de objetos o cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), scripts de LeRobot en Python; no aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del robot, del bucle de control y del hardware de inferencia. La tasa de control del dataset es de 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eVorob/my_policy (ACT) | 51,7 M | Política de imitación ACT | no aplica | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | variable (decenas de millones) | Política de imitación ACT | no aplica | normalmente Apache 2.0 | Hugging Face Hub / LeRobot |
| Diffusion Policy | variable (mayor que ACT típicamente) | Política de imitación por difusión | no aplica | variable según implementación | Repos académicos / LeRobot |
| π0 (Physical Intelligence) | varios miles de millones | Modelo fundacional de robótica (VLA) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, tipo y licencia.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 5 episodios y 4341 fotogramas, lo que implica baja generalización a nuevas posiciones, objetos o condiciones de iluminación.
- Tarea única: el modelo solo ha sido entrenado para "Grab the plastic objects of the 3d-print bed"; no se espera que funcione en otras tareas sin reentrenamiento.
- Especialización de hardware: asume robot `so_follower` y cámaras `wrist` y `top` a 480x640; cambios en la configuración invalidan la política.
- Sin evaluación publicada: no hay tasas de éxito medidas, por lo que no puede afirmarse su fiabilidad en producción.
- Riesgo de sobreajuste a la escena de entrenamiento y a la disposición concreta de los objetos.
- No es un modelo de lenguaje: no tiene capacidades de razonamiento simbólico, tool calling ni comprensión de instrucciones en lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- En producción robótica, requiere mecanismos de seguridad externos (paradas de emergencia, límites de par) independientes de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eVorob/my_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/eVorob/record-test_20261103_214506
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eVorob/record-test_20261103_214506
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
