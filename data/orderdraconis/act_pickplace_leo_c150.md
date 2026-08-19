# OrderDraconis/act_pickplace_leo_c150

## Resumen

OrderDraconis/act_pickplace_leo_c150 es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. El modelo implementa aprendizaje por imitación a partir de datos teleoperados para ejecutar una tarea concreta de manipulación: recoger la pieza superior de tela y colocarla en un cuadrado objetivo. Se trata de un modelo de visión y control de tamaño reducido (51,7 millones de parámetros) que consume tres flujos de imagen y el estado articular del robot para predecir secuencias de acciones de 12 dimensiones.

El modelo es relevante como ejemplo práctico de política robótica entrenada con pocas demostraciones (122 episodios) y publicada en el Hub de Hugging Face con formato safetensors, listo para ser cargado y ejecutado mediante las herramientas de LeRobot. Su arquitectura transformer con decodificación por chunks permite generar trayectorias suaves y robustas frente a perturbaciones, una característica clave del método ACT. La licencia Apache 2.0 facilita su uso y modificación en entornos de investigación y desarrollo industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.732.108 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizar) |
| Idiomas soportados | no disponible (modelo de control robótico, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques de acciones (chunks) en lugar de acciones individuales. La arquitectura combina un codificador visual basado en ResNet para procesar las imágenes de las cámaras, un codificador de estado para las observaciones del robot, y un decodificador transformer con atención cruzada que genera secuencias de acciones. Incluye además una variable latente de estilo (VAE) que captura la variabilidad de las demostraciones, lo que mejora la robustez frente a pequeñas perturbaciones en el entorno.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset Pink-Viking/pick_and_place_combined, que contiene 122 episodios y 96.339 fotogramas a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 48, optimizador AdamW con tasa de aprendizaje 3e-5 y semilla 1000. El modelo fue entrenado para la tarea específica de recoger la pieza superior de tela y colocarla en el cuadrado objetivo, utilizando tres cámaras (left_left_jaw, right_right_jaw, right_topdown) con resolución 480x640.

## Capacidades

- Control robótico de manipulación: genera acciones de 12 dimensiones (posición, orientación y posiblemente velocidad) para un robot de tipo bi_so_follower.
- Percepción multimodal: integra tres flujos de imagen simultáneos (dos cámaras de pinza y una vista superior) junto con el estado del robot (12 valores).
- Predicción por chunks: produce secuencias de acciones de longitud fija, lo que permite trayectorias suaves y coordinadas.
- Aprendizaje por imitación: reproduce comportamientos teleoperados sin necesidad de recompensas explícitas.
- Ejecución en tiempo real: pensado para inferencia a 30 FPS con los fotogramas de las cámaras.
- Integración con LeRobot: compatible con las herramientas de entrenamiento, evaluación y despliegue del ecosistema.

## Casos de uso

- Automatización de tareas de pick-and-place textil: el modelo puede controlar un robot para recoger piezas de tela y colocarlas en una posición definida, útil en líneas de ensamblaje de confección o clasificación de materiales.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a cambios de iluminación y posición de objetos.
- Prototipado rápido de políticas robóticas: al estar publicado en el Hub con LeRobot, permite a equipos de desarrollo cargar el modelo y probarlo en su propio hardware con mínima configuración.
- Evaluación de métodos de control basados en transformers: el modelo puede utilizarse como referencia comparativa frente a otras arquitecturas (Diffusion Policy, etc.) en tareas de manipulación.
- Entrenamiento por imitación en entornos simulados: aunque el modelo fue entrenado con datos reales, puede adaptarse a simuladores para acelerar el desarrollo de nuevas variantes.
- Educación y formación en robótica: su tamaño reducido y licencia permisiva lo hacen adecuado para cursos y talleres donde se enseña el despliegue de políticas de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parámetros, los pesos en FP32 ocupan aproximadamente 207 MB y en FP16 unos 104 MB. Las activaciones para procesar tres imágenes 480x640 y el estado del robot son modestas; se estima que la inferencia cabe en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, desde una NVIDIA RTX 3060 (12 GB) hasta una A100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, el modelo es lo bastante pequeño para ejecutarse en tarjetas de gama media e incluso en integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo conectan al robot y las cámaras. También es posible exportar los pesos a otros formatos si se requiere integración con vLLM, llama.cpp u otros runners, aunque no es el flujo habitual.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño del modelo y la resolución de entrada, se espera una inferencia en el rango de milisegundos en GPU moderna, suficiente para el control a 30 FPS.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia conceptual, el método ACT original (paper 2304.13705) reporta tasas de éxito superiores al 90 % en tareas de manipulación con pocas demostraciones, pero esos resultados corresponden a otros entornos y robots. Otras alternativas en el mismo espacio de políticas robóticas de imitación son Diffusion Policy (Chi et al., 2023) y los modelos basados en RNN/transformers de LeRobot, pero no hay benchmarks compartidos con este checkpoint concreto.

## Limitaciones y advertencias

- Entrenado para una única tarea específica: recoger la pieza superior de tela y colocarla en el cuadrado objetivo. No generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: el modelo espera exactamente las tres cámaras y el tipo de robot `bi_so_follower` con los que fue entrenado. Cambiar la configuración de cámaras o el robot invalida la política.
- Sin evaluación reportada: la model card indica que no hay resultados de éxito en pruebas reales, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste: con solo 122 episodios de entrenamiento, el modelo puede memorizar las demostraciones y fallar ante variaciones significativas de iluminación, posición de objetos o distracciones.
- Sesgos del dataset: los datos provienen de un único operador y entorno, lo que puede introducir sesgos en el estilo de movimiento.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.
- No apto para tareas de lenguaje o razonamiento: es un modelo de control robótico exclusivamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OrderDraconis/act_pickplace_leo_c150
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Pink-Viking/pick_and_place_combined
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
