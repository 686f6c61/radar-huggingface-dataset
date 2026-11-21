# Josebarv01/act_pti_todo_v2

## Resumen

`Josebarv01/act_pti_todo_v2` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face por el usuario Josebarv01 y entrenada con la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un robot y dos flujos de cámara (vista superior y vista de muñeca) y emite comandos de acción de 6 dimensiones. El modelo es un fine-tuning de `Josebarv01/act_pti_todo_v1` sobre el dataset propio `Josebarv01/pti_todo_v2`.

El interés técnico reside en que ejemplifica el flujo completo de imitación de bajo coste con LeRobot: 51,7 millones de parámetros, 123 episodios de teleoperación (95.099 frames a 30 FPS) y dos tareas concretas de manipulación ("pick up the cup from the holder" y "pick up the cup, follow the laser and place it where the laser turns off"). Es un artefacto de investigación reproducible más que un modelo listo para producción: no hay métricas de éxito publicadas ni licencia declarada.

La relevancia es acotada pero clara para quien trabaja en robótica de manipulación con hardware asequible (robot `so_follower`, el seguidor de SO-100/SO-101 del ecosistema LeRobot). Sirve como referencia de cómo se estructura un checkpoint ACT en el Hub, qué entradas y salidas espera y cómo se lanza un rollout con la CLI de LeRobot 0.6.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (varios pasos futuros de una vez) en lugar de una acción por inferencia, lo que reduce el error de acumulación y suaviza la trayectoria. La arquitectura combina un backbone visual tipo ResNet para procesar las dos cámaras (`observation.images.top` y `observation.images.wrist`, ambas a 3×480×640), una proyección del estado articular (`observation.state`, vector de 6 componentes) y un transformer encoder-decoder que genera la secuencia de acciones (`action`, vector de 6 componentes). El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 durante 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, partiendo del checkpoint `Josebarv01/act_pti_todo_v1`. El dataset `Josebarv01/pti_todo_v2` contiene 123 episodios y 95.099 frames grabados a 30 FPS sobre un robot `so_follower` con dos cámaras. No se documenta aumento de datos, composición demográfica del dataset ni uso de RLHF/DPO (no aplicable en imitación supervisada). Tampoco se especifica el número exacto de épocas ni si hubo early stopping.

## Capacidades

- Control visomotor de manipulación: genera comandos de 6 grados de libertad a partir de estado y dos imágenes.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas sin recalcular en cada frame.
- Ejecución de dos tareas concretas aprendidas por imitación: coger un vaso del soporte y seguimiento de un láser hasta apagarlo.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, audio ni thinking mode.
- No dispone de mecanismo de generalización explícito a objetos, posiciones o iluminaciones no vistas en el dataset.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como punto de partida para validar el pipeline de LeRobot 0.6.2 con un robot `so_follower` y dos cámaras antes de grabar datos propios.
- Fine-tuning sobre tareas nuevas: al estar publicado el checkpoint base `act_pti_todo_v1`, se puede reentrenar con un dataset propio manteniendo la arquitectura y el preprocesado de observaciones.
- Benchmark interno de manipulación pick-and-place: la tarea "pick up the cup from the holder" es un caso canónico para medir tasas de éxito de políticas ACT en laboratorio.
- Seguimiento visual de un objetivo móvil (láser): útil para estudiar cómo se comporta una política de imitación ante estímulos dinámicos y condiciones de iluminación variables.
- Docencia y formación en robótica de bajo coste: el tamaño reducido (51,7 M de parámetros, 0,2 GB) permite entrenar y desplegar en una estación con GPU de consumo.
- Base para comparativas de métodos de imitación: al ser un checkpoint ACT estándar, se puede contrastar con Diffusion Policy o VQ-BeT sobre el mismo dataset.
- Validación de infraestructura de despliegue: probar `lerobot-rollout` con `--strategy.type=base` y `--duration` para verificar latencias de inferencia en el hardware objetivo antes de invertir en grabaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota literal: "No evaluation results have been provided for this policy yet." No hay tasas de éxito por tarea, ni comparación con el checkpoint base, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Por el tamaño del checkpoint (0,2 GB en safetensors, 51,7 M de parámetros), la huella en FP32 ronda los 0,2 GB de pesos, a lo que hay que sumar activaciones de las dos cámaras a 480×640 y el estado del decoder; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU NVIDIA con soporte CUDA es suficiente para inferencia; para entrenamiento (10.000 pasos, batch 8) una RTX 3060/4060 en adelante es razonable, aunque no hay datos publicados.
- Cabe en GPU de consumo: sí, por tamaño de modelo; la limitación real es la latencia de captura y preprocesado de las dos cámaras a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Josebarv01/act_pti_todo_v2`. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Josebarv01/act_pti_todo_v2` | 51,7 M | ACT (imitación) | no aplica | no disponible | Hugging Face, LeRobot |
| `Josebarv01/act_pti_todo_v1` | no disponible | ACT (imitación) | no aplica | no disponible | Hugging Face, LeRobot (checkpoint base) |
| Diffusion Policy (referencia metodológica) | no disponible | difusión para acciones | no aplica | según implementación | paper y repos públicos |
| VQ-BeT (referencia metodológica) | no disponible | discretización + transformer | no aplica | según implementación | paper y repos públicos |

La comparación con Diffusion Policy y VQ-BeT es metodológica, no de rendimiento: no hay benchmarks comunes publicados para este checkpoint. Frente a su base `act_pti_todo_v1`, la diferencia es el fine-tuning sobre `pti_todo_v2`, pero no se documenta la mejora cuantitativa.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "[More Information Needed]", por lo que el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- Sin evaluación empírica: no hay tasa de éxito publicada, así que no se puede afirmar que la política funcione de forma fiable ni siquiera en las tareas para las que fue entrenada.
- Dataset muy pequeño y específico: 123 episodios y dos tareas acotadas; la generalización a objetos, posiciones, iluminación o robots distintos es esperablemente nula.
- Dependencia de hardware concreto: el robot es `so_follower` y las cámaras deben llamarse `top` y `wrist` con la resolución 480×640 para que las claves de observación coincidan.
- Riesgo de sobreajuste al entorno de grabación: sin datos de aumento ni variabilidad documentada, la política puede fallar ante cambios menores de fondo o de colocación de objetos.
- Sin información sobre sesgos: no aplica en el sentido de sesgos sociales, pero sí hay un sesgo de distribución hacia las condiciones exactas de teleoperación.
- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval ni GSM8K, y no sirve para tareas de texto, código o razonamiento simbólico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Josebarv01/act_pti_todo_v2
- Checkpoint base: https://huggingface.co/Josebarv01/act_pti_todo_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Josebarv01/pti_todo_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Josebarv01/pti_todo_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
