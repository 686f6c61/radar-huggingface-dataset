# fecasado/gfm-kitchen-toasts-22dZ

## Resumen

`gfm-kitchen-toasts-22dZ` es una política de imitación (imitation learning) para robótica real desarrollada por el usuario fecasado y publicada en Hugging Face Hub. Utiliza la librería LeRobot de Hugging Face y el método `gaze_flow_matching`, un enfoque basado en flow matching que incorpora información de mirada (gaze) como señal adicional de condicionamiento. El modelo resuelve la tarea concreta de manipulación "coger una rebanada de pan de la tostadora y colocarla en el plato", entrenada sobre 115 episodios de demostración teleoperada.

A diferencia de los LLM, este artefacto no es un modelo de lenguaje: es un controlador visomotor que consume tres cámaras RGB (izquierda, derecha y vista del usuario) más un vector de estado de 55 dimensiones, y produce un vector de acción de 26 dimensiones para el robot `blueberry_ros`. Su relevancia radica en ser un ejemplo reproducible de policy de manipulación con flow matching y condicionamiento por gaze, un área activa de investigación en aprendizaje por imitación.

El modelo tiene 75,2 millones de parámetros en formato safetensors, ocupa 0,3 GB en el repositorio y se distribuye bajo licencia Apache 2.0. No hay resultados de evaluación publicados ni datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Policy de imitación visomotora basada en flow matching con condicionamiento por gaze (gaze_flow_matching), implementada en LeRobot |
| Parametros totales | 75.242.458 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal definida por la política de observación de LeRobot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural como entrada principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `blueberry_ros` |
| Cámaras de entrada | `left`, `right`, `user`, `user_gaze` |
| Entrada de estado | `observation.state` con shape `(55,)` |
| Salida de acción | `action` con shape `(26,)` |
| Resolución de imagen | 240 x 320 x 3 por cámara |
| Dataset de entrenamiento | `fecasado/toasts-to-plate-320x240` (115 episodios, 75.032 frames, 15 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 128 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La arquitectura es una policy de imitación del tipo `gaze_flow_matching`, integrada en el framework LeRobot. El método se basa en flow matching, una familia de modelos generativos que aprende un campo vectorial que transporta una distribución simple (por ejemplo, ruido gaussiano) hacia la distribución de acciones expertas. A diferencia de las políticas de regresión directa (que colapsan en la media de las acciones) o de los modelos de difusión (que requieren múltiples pasos de denoising), el flow matching aprende una trayectoria continua y puede generar acciones multimodales con relativamente pocos pasos de integración. La particularidad de esta variante es que incorpora la mirada del usuario (`user_gaze`) como señal de condicionamiento, lo que permite al policy alinear la atención visual con la intención humana durante la demostración.

El entrenamiento se realizó sobre 115 episodios teleoperados (75.032 frames a 15 FPS) del dataset `fecasado/toasts-to-plate-320x240`, con dos tareas descritas: "Take one slice of bread out of the toaster and place it on the empty plate" y "Take the last slice of bread from the toaster and place it on top of the sandwich". Se usaron 100.000 pasos con batch size 128, optimizador AdamW y learning rate 1e-4. No se documenta el uso de RLHF, DPO ni fine-tuning por preferencias; es aprendizaje por imitación supervisado puro. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal, ya que no aplican a este tipo de modelo.

## Capacidades

- Control visomotor de un brazo robótico `blueberry_ros` para tareas de manipulación de pan y tostadora.
- Percepción multimodal con tres cámaras RGB (izquierda, derecha y vista del usuario) a 240x320.
- Condicionamiento por mirada del usuario (`user_gaze`) para alinear la atención del policy con la intención del operador.
- Generación de acciones continuas de 26 dimensiones a partir de un estado de 55 dimensiones.
- Ejecución de dos tareas específicas de pick-and-place descritas en el dataset.
- No soporta tool calling, function calling, agentes multi-step, razonamiento simbólico ni capacidades multilingües.
- No tiene modo "thinking", visión semántica de alto nivel ni procesamiento de audio.

## Casos de uso

- Automatización de líneas de montaje alimentaria: el policy puede ejecutar la secuencia de extraer una rebanada de la tostadora y depositarla en un plato, integrándose en una celda robotizada con cámara cenital y laterales.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de flow matching frente a diffusion policies o ACT en tareas de manipulación con condicionamiento por gaze.
- Prototipado de interfaces humano-robot con seguimiento de mirada: el uso de `user_gaze` como entrada permite estudiar cómo la atención del operador mejora la generalización del policy en entornos con distracciones.
- Reentrenamiento con nuevos datasets: al estar integrado en LeRobot, se puede reutilizar el pipeline `lerobot-train` con `--policy.type=gaze_flow_matching` para adaptar la policy a otras tareas de cocina o picking.
- Evaluación de robustez ante cambios de iluminación y posición de objetos: útil para medir la degradación de políticas visomotoras en condiciones fuera de distribución.
- Docencia y demos de robótica: el repositorio de 0,3 GB y la licencia Apache 2.0 facilitan su uso en cursos de robótica de manipulación y en demostraciones con robots de bajo coste.
- Benchmark interno de latencia de inferencia: al ser un modelo pequeño (75 M de parámetros), permite medir tiempos de inferencia en GPUs de consumo y en CPU para control en bucle cerrado a 15 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito por tarea, ni comparación con otras políticas, ni métricas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 75,2 M de parámetros en fp32, el peso de los parámetros ocupa aproximadamente 300 MB; el consumo real depende del backbone visual y de los buffers de las tres cámaras a 240x320.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; se recomienda una RTX 3060/4060 o superior para inferencia en tiempo real.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset se grabó a 15 FPS, lo que sugiere que el bucle de control debe operar al menos a esa frecuencia, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gfm-kitchen-toasts-22dZ` | 75,2 M | 3 cámaras 240x320 + estado 55D | Pick-and-place de pan | Apache 2.0 | Hugging Face Hub |
| ACT (Action Chunking Transformer, Zhao et al.) | no disponible en esta ficha | variables según implementación | Imitación visomotora | MIT (implementación original) | Repositorios públicos |
| Diffusion Policy (Chi et al.) | no disponible en esta ficha | variables según implementación | Imitación visomotora multimodal | MIT (implementación original) | Repositorios públicos |
| Otras policies LeRobot del Hub | variables | variables | Manipulación genérica | variables | Hugging Face Hub |

La comparación cuantitativa con ACT o Diffusion Policy no está disponible porque no se han publicado métricas de éxito para esta policy. La comparación se limita a categoria metodológica y licencia.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot, tanto en las condiciones de entrenamiento como fuera de distribución.
- El modelo está entrenado para un robot concreto (`blueberry_ros`) y una configuración de cámaras concreta; no es transferible directamente a otros brazos sin reentrenamiento.
- Solo cubre dos tareas muy específicas de cocina; no generaliza a otras manipulaciones sin fine-tuning.
- Riesgo de sobreajuste al dataset de 115 episodios: la variabilidad de posiciones, iluminación y objetos es limitada.
- Dependencia de la mirada del usuario (`user_gaze`): si el operador no está presente o el tracking de gaze falla, el condicionamiento puede degradarse.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda policy de imitación, puede producir trayectorias fuera de distribución con consecuencias físicas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- No se documentan sesgos demográficos ni lingüísticos porque el modelo no procesa lenguaje ni personas; el sesgo relevante es el de las demostraciones (posiciones, objetos y entorno del dataset).
- Requiere calibración de cámaras y del robot; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-toasts-22dZ
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/toasts-to-plate-320x240
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fecasado/toasts-to-plate-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
