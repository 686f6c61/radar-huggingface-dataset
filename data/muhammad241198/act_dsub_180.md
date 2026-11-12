# Muhammad241198/act_dsub_180

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este checkpoint concreto, publicado por el usuario Muhammad241198 bajo el identificador `act_dsub_180`, ha sido entrenado con la librería LeRobot de Hugging Face sobre el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`, y está empaquetado en formato safetensors con 51.766.919 parámetros (aproximadamente 51,8 millones).

El modelo se enmarca en la categoría de políticas visuomotoras: recibe observaciones (típicamente imágenes de cámara y estado de las articulaciones) y emite comandos de control para un brazo robótico. La técnica de action chunking reduce el error de acumulación y mejora la estabilidad de las trayectorias frente a políticas que predicen un único paso, lo que la hace especialmente adecuada para tareas de manipulación de precisión como inserción de conectores o montaje.

Es relevante porque ejemplifica el flujo actual de entrenamiento y despliegue de políticas robóticas de código abierto con LeRobot, reproducible de extremo a extremo con comandos de CLI. No obstante, se trata de un checkpoint de autor individual, sin métricas publicadas ni validación externa, por lo que su uso debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para action chunking (ACT), política de aprendizaje por imitación |
| Parametros totales | 51.766.919 (aprox. 51,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT se basa en un transformer que, a partir de un historial corto de observaciones, predice un chunk de acciones futuras de longitud fija. La arquitectura original combina un codificador visual (típicamente ResNet) con un transformer que modela la secuencia de acciones, e incorpora una cabeza de estilo CVAE para capturar la multimodalidad de las demostraciones humanas. El entrenamiento es de tipo supervisado por imitación sobre datos de teleoperación, sin refuerzo ni preferencias humanas.

En este caso concreto, el entrenamiento se ha realizado con LeRobot sobre el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`. No se dispone de información sobre el número de episodios, el número de tokens o pasos de entrenamiento, la composición del dataset, la resolución de las cámaras ni la plataforma robótica exacta utilizada. Tampoco se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de comandos de control robótico a partir de observaciones visuales y de estado de las articulaciones.
- Predicción de chunks de acciones, lo que reduce la frecuencia de inferencia necesaria y suaviza las trayectorias.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y grabación de episodios.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingües, de visión general ni de audio; su entrada visual está limitada a las cámaras del robot.
- No se documenta un modo de razonamiento explícito (thinking mode).

## Casos de uso

- Montaje e inserción de precisión: el modelo puede ejecutar secuencias cortas de acciones para alinear y insertar conectores o piezas, aprovechando el action chunking para mantener trayectorias estables en tareas con tolerancias ajustadas.
- Manipulación de objetos en línea de producción: integrado en una celda robotizada, recibe imágenes de cámara y estado de articulaciones y emite comandos de articulación para recoger y colocar piezas de forma repetitiva.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar variantes de ACT, ajustar hiperparámetros o evaluar la influencia del dataset de teleoperación.
- Prototipado rápido con LeRobot: permite entrenar y desplegar una política en un brazo tipo SO-100/SO-101 siguiendo los comandos `lerobot-train` y `lerobot-record` documentados en la model card.
- Evaluación de políticas en entornos controlados: útil para medir tasas de éxito en tareas de pick-and-place antes de escalar a un modelo mayor o a un dataset más amplio.
- Docencia y formación en robótica: ejemplo completo de pipeline de datos, entrenamiento y evaluación con licencia Apache 2.0, adecuado para prácticas universitarias o cursos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,8 M de parámetros, el peso en fp32 ocupa aproximadamente 207 MB y en fp16 unos 104 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento se recomienda al menos una RTX 3090/4090 por comodidad, aunque el tamaño reducido permite entrenar en GPUs de gama media.
- Cabe en GPU consumer: sí, en cualquier GPU con 4-8 GB de VRAM para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de dispositivo CUDA o CPU según la configuración del entorno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_dsub_180 (este) | 51,8 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la información | no disponible | tasas de éxito reportadas en el paper original | no disponible | paper y código de referencia |
| Diffusion Policy | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de autor individual con 0 descargas y 0 likes en el momento de la consulta; no ha pasado validación externa ni revisión por pares.
- No se publican métricas de tasa de éxito, número de episodios de entrenamiento ni condiciones de evaluación, por lo que se desconoce su robustez real.
- Riesgo de sobreajuste al dataset `DSUB-installnew2026_20261026_033023`: probablemente funcione solo en condiciones muy similares a las de las demostraciones (iluminación, posición de cámara, tipo de objeto).
- No hay información sobre sesgos, pero al ser un modelo entrenado con teleoperación, hereda las limitaciones y sesgos de las demostraciones humanas.
- No apto para uso comercial en producción sin una evaluación propia: la licencia Apache 2.0 lo permite legalmente, pero la falta de validación técnica desaconseja su despliegue directo.
- Sin soporte de lenguaje natural ni de instrucciones en texto; la interfaz es exclusivamente visuomotora.
- El tamaño del repo es de 0,2 GB, coherente con el número de parámetros, pero no se documentan dependencias de versión de LeRobot ni compatibilidad con versiones futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muhammad241198/act_dsub_180
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/rbtrprjkt/DSUB-installnew2026_20261026_033023
