# Gyseop/omx_realreal4

## Resumen

`Gyseop/omx_realreal4` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), entrenada y publicada con la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje: es un controlador visomotor que, a partir de observaciones (imágenes de cámara y estado de las articulaciones), predice secuencias cortas de acciones ("chunks") en lugar de comandos paso a paso. El autor es el usuario Gyseop y el modelo se ha entrenado sobre el dataset `Gyseop/record-realreal4`, presumiblemente de teleoperación de un brazo robótico.

El modelo resuelve el problema clásico de la manipulación robótica por aprendizaje: convertir demostraciones teleoperadas en una política que generalice a ejecuciones autónomas. ACT aborda la varianza temporal de las políticas de imitación prediciendo bloques de acciones de forma conjunta, lo que reduce el error acumulado y la discontinuidad en el control. Con 51,67 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto, pensado para inferencia en tiempo real en hardware modesto.

Su relevancia es práctica: encaja en el ecosistema LeRobot, que estandariza entrenamiento, evaluación y despliegue de políticas robóticas en formato safetensors, y permite reproducir el flujo completo con los comandos `lerobot-train` y `lerobot-record`. Es un artefacto de investigación reproducible, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora. El modelo procesa observaciones multimodales (imágenes de cámaras y vector de estado de las articulaciones) mediante un codificador visual y un transformer que fusiona la información, y emite un chunk de acciones futuras en una sola pasada. Esta predicción por bloques es la innovación central frente a políticas que predicen una acción por paso: estabiliza el control y mitiga el problema de la multimodalidad en los datos de demostración. La implementación concreta de esta política sigue la referencia del paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot sobre el dataset `Gyseop/record-realreal4`, que no está documentado en la información disponible (número de episodios, tareas, cámaras y frecuencia de control no disponibles). No hay información sobre datos sintéticos, aumento de datos, RLHF/DPO ni ajuste fino posterior; en imitación supervisada estos mecanismos no aplican de forma estándar. Tampoco se detalla la configuración de hiperparámetros (tamaño de chunk, resolución de imagen, horizonte de predicción).

## Capacidades

- Control robótico visomotor por imitación: genera comandos de acción a partir de imágenes y estado de articulaciones.
- Predicción de chunks de acciones, lo que permite ejecutar movimientos suaves y coherentes sin replanificación paso a paso.
- Aprendizaje a partir de teleoperación: reproduce tareas demostradas por un operador humano.
- Integración nativa con LeRobot para entrenamiento (`lerobot-train`) y evaluación/despliegue (`lerobot-record`).
- Compatible con robots del ecosistema LeRobot, como el `so100_follower` citado en la model card.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, visión general, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos en mesa: la política ejecuta agarres y colocaciones aprendidos de demostraciones teleoperadas, adecuada para tareas repetitivas de pick-and-place en laboratorio.
- Investigación en imitación robótica: sirve como línea base reproducible de ACT para comparar con otras políticas (diffusion policy, VLA) usando el mismo pipeline de LeRobot.
- Prototipado rápido de un brazo de bajo coste: con 51,7 M de parámetros y pesos safetensors de 0,2 GB, se puede entrenar y evaluar en una sola GPU de consumo.
- Automatización de tareas de laboratorio: recogida y recolocación de muestras o herramientas sobre una superficie acotada, donde el entorno es controlado y las variaciones son limitadas.
- Evaluación comparativa de datasets de teleoperación: permite medir la calidad de `record-realreal4` frente a otros datasets mediante la tasa de éxito en `lerobot-record` con `--episodes`.
- Educación y formación: demostración completa del ciclo entrenamiento-inferencia de una política robótica en cursos y talleres, gracias a los comandos documentados y a la licencia permisiva.
- Despliegue embebido en estaciones de trabajo con GPU: al ser un modelo pequeño, puede ejecutarse en tiempo real junto al lazo de control del robot sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM vendrá dominada por el codificador visual y los buffers de inferencia, no por los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente por tamaño; una RTX 4090 o A100 ofrecen margen sobrado para inferencia en tiempo real.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM como mínimo práctico; el límite real es la latencia del lazo de control, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gyseop/omx_realreal4 (ACT) | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face |
| Otros checkpoints ACT en LeRobot | variable | no aplica | no disponible | variable (habitualmente apache-2.0) | Hugging Face |
| Diffusion Policy (referencia) | variable | no aplica | no disponible | variable | Repositorios de investigación |
| Políticas VLA tipo RT-2/OpenVLA | miles de millones | cientos de tokens | no disponible | variable | Hugging Face / repositorios |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un dataset propio y acotado, la política hereda los sesgos de las demostraciones (posiciones, objetos y condiciones del entorno de grabación).
- Riesgo de fallo por generalización: al ser imitación supervisada sobre `record-realreal4`, es probable que falle ante objetos, iluminación o configuraciones de cámara distintas de las del entrenamiento; no hay datos que cuantifiquen esta degradación.
- Sin información sobre el dataset: se desconoce el número de episodios, tareas y frecuencia de control, lo que impide evaluar la cobertura del espacio de estados.
- Limitaciones de idioma y contexto: no aplican en el sentido de LLM, pero no hay ventana de contexto ni capacidades lingüísticas.
- Licencia apache-2.0: permite uso comercial y modificación con atribución; conviene revisar las licencias de las dependencias (LeRobot, PyTorch) y del dataset asociado.
- Para producción: requiere validación en el robot real, protocolos de parada segura y supervisión humana; un fallo de la política puede provocar colisiones o daños materiales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso externo ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyseop/omx_realreal4
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyseop/record-realreal4
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
