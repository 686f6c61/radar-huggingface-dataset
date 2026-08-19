# OrderDraconis/act_pickplace_leo_c57

## Resumen

El modelo `OrderDraconis/act_pickplace_leo_c57` es una política de imitación (policy) para control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot. Desarrollado por el usuario OrderDraconis, este modelo resuelve una tarea concreta de manipulación: recoger la pieza superior de tela y colocarla en un cuadrado objetivo. Se trata de un modelo de 51,6 millones de parámetros, con una arquitectura transformer encoder-decoder que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que permite un control más fluido y robusto en entornos reales.

La relevancia de este modelo radica en su aplicación práctica en robótica de manipulación: está entrenado con datos teleoperados de un robot bimanual (bi_so_follower) y utiliza tres cámaras RGB para percibir el entorno. Al estar publicado bajo licencia Apache 2.0 y ser compatible con el ecosistema LeRobot, cualquier desarrollador puede reproducir el entrenamiento, adaptarlo a nuevas tareas o ejecutarlo en su propio hardware. El modelo se distribuye en formato safetensors y está diseñado para inferencia en tiempo real, lo que lo convierte en un punto de partida sólido para proyectos de automatización industrial o investigación en aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer encoder-decoder con VAE/CVAE |
| Parametros totales | 51.636.876 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la ventana de acción no se especifica en la documentación) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. ACT utiliza un transformer encoder-decoder que, a partir de observaciones visuales (tres cámaras RGB de 480x640) y del estado del robot (vector de 12 dimensiones), predice un chunk de acciones futuras (también de 12 dimensiones). La clave del método es que el decoder se condiciona mediante un CVAE (Conditional Variational Autoencoder) entrenado con un estilo de entrenamiento de "temporización" (temporal ensembling), lo que permite generar trayectorias suaves y robustas frente a perturbaciones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `Pink-Viking/pick_and_place_combined`, que contiene 122 episodios teleoperados (96.339 frames a 30 FPS) de la tarea de pick-and-place de tela. La configuración de entrenamiento incluye 100.000 pasos, batch size de 48, optimizador AdamW con learning rate de 3e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO, ya que es un método de imitación supervisada pura.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de recoger una pieza de tela y colocarla en una posición objetivo, usando tres cámaras y el estado articular del robot.
- Percepción visual multimodal: procesa tres flujos de imagen simultáneos (izquierda-mandíbula, derecha-mandíbula y vista superior) para localizar el objeto y el área de destino.
- Generación de acciones en chunk: predice secuencias de acciones (no pasos individuales), lo que mejora la suavidad del movimiento y la tolerancia a errores de percepción.
- Inferencia en tiempo real: diseñado para ejecutarse en bucle de control con latencia baja, compatible con el pipeline de rollout de LeRobot.
- Entrenamiento por imitación: puede reentrenarse con nuevos datos teleoperados para adaptarse a variaciones de la tarea o a entornos diferentes.

## Casos de uso

- Automatización de pick-and-place en líneas de producción: el modelo puede integrarse en un robot bimanual para clasificar o reubicar piezas textiles, reduciendo la intervención humana en tareas repetitivas.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede cargar el modelo y ejecutarlo en un robot real con el comando `lerobot-rollout`, lo que permite validar la tarea en pocos minutos.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar métodos como Diffusion Policy o ACT con variantes, ya que el código de entrenamiento está disponible y es reproducible.
- Teleoperación asistida: el modelo puede complementar la teleoperación humana, sugiriendo acciones o completando trayectorias parciales en entornos de colaboración humano-robot.
- Educación en robótica: al ser un modelo pequeño (51M) y con licencia permisiva, es adecuado para cursos universitarios donde se enseñan conceptos de visión por computador, control y aprendizaje automático.
- Despliegue en entornos de investigación con robots de bajo coste: el robot `bi_so_follower` es un diseño de código abierto, y el modelo puede ejecutarse en GPUs de gama media, lo que facilita la experimentación en laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no es posible comparar cuantitativamente su tasa de éxito con otros modelos en esta tarea.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,6 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 200 MB de pesos). Incluso en una GPU integrada sería viable, aunque se recomienda una GPU dedicada para latencias bajas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050 o superior). Para entrenamiento desde cero, se recomienda una GPU con 8-12 GB (RTX 3060, RTX 4070, A100) para manejar el batch size de 48 y las imágenes de alta resolución.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo básicas y medias.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, que soporta inferencia en tiempo real con `lerobot-rollout`. También puede integrarse en ROS (Robot Operating System) mediante los adaptadores de LeRobot. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos medidos. Sin embargo, al ser un transformer pequeño y con entrada de imágenes de 640x480, se espera una latencia de inferencia en el rango de 10-30 ms en una GPU moderna, suficiente para control en bucle cerrado a 30 Hz.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/ventana | Tarea | Licencia |
|---|---|---|---|---|---|
| OrderDraconis/act_pickplace_leo_c57 | ACT (transformer + CVAE) | 51,6 M | no disponible | pick-and-place de tela | Apache 2.0 |
| Diffusion Policy (Chi et al., 2023) | Diffusion model (U-Net) | variable (10-100 M) | ventana de acción típica 8-16 | manipulacion general | MIT (codigo) |
| ACT original (Zhao et al., 2023) | Transformer + CVAE | ~80 M (config. base) | chunk size 10-100 | manipulacion variada | MIT (codigo) |

La comparativa se basa en características generales, ya que no hay resultados de evaluación publicados para este modelo concreto. El modelo aquí descrito es una instancia entrenada de ACT, por lo que su comportamiento esperado es similar al del método original, aunque adaptado a una tarea específica y con un tamaño de parámetros menor que la configuración base del paper.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay datos de tasa de éxito ni de robustez frente a variaciones de iluminación, posición de objetos o perturbaciones. Cualquier despliegue en producción requiere una validación propia.
- Tarea específica: el modelo está entrenado únicamente para la tarea "pick up the upper piece of fabric and place it in the target square". No generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración del robot: las observaciones de estado y las cámaras están calibradas para el robot `bi_so_follower`. Usarlo en otro hardware requiere recalibración y posiblemente reentrenamiento.
- Riesgo de sobreajuste al dataset: con solo 122 episodios, el modelo puede memorizar las trayectorias teleoperadas y fallar ante configuraciones nuevas (posición de la tela, orientación, etc.).
- Alucinación no aplica (no es un modelo generativo de texto), pero sí existe riesgo de predicciones de acción erróneas si la percepción visual falla o si el objeto está fuera del campo de visión.
- Licencia Apache 2.0 permite uso comercial, pero el dataset asociado (`Pink-Viking/pick_and_place_combined`) debe verificarse por separado para conocer sus términos de uso.
- El modelo no incluye mecanismos de seguridad ni de parada de emergencia; es responsabilidad del usuario implementar salvaguardas en el sistema robótico.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/OrderDraconis/act_pickplace_leo_c57
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Pink-Viking/pick_and_place_combined
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
