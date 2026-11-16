# Haku-2004/act_k6e_base_15

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de composición acumulado y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6e_base_15`, es una política ACT entrenada con LeRobot (la librería de robótica de Hugging Face) sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente datos de teleoperación de un brazo robótico tipo SO-100/SO-101.

El modelo pesa 51.668.614 parámetros en formato safetensors (aproximadamente 51,7 M), lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre GPU de consumo. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones visuales y propioceptivas del robot a comandos de acción de baja dimensión.

Su relevancia es la de un artefacto de investigación reproducible: el autor publica un checkpoint de imitación con licencia Apache 2.0 y la receta completa de entrenamiento/evaluación vía LeRobot, lo que permite replicar el pipeline y adaptarlo a otros robots y tareas. No hay métricas de rendimiento publicadas ni documentación sobre el hardware o la tarea concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), encoder visual + decoder de acciones con chunking |
| Parámetros totales | 51.668.614 (~51,7 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; procesa observaciones por paso) |
| Tipos de cuantización | No disponible (safetensors en precisión nativa; se puede cuantizar con herramientas genéricas) |
| Idiomas soportados | No disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT sigue la propuesta de Zhao et al. (2023, arXiv:2304.13705). La arquitectura combina un backbone visual (encoder de imágenes por frame, habitualmente ResNet con posición codificada) con un transformer encoder-decoder que recibe la observación actual (imágenes de cámaras y estado articular) y emite un *chunk* de acciones futuras de longitud fija (por defecto k=100 en la implementación de LeRobot). El objetivo es aprender una política de imitación a partir de demostraciones teleoperadas, con un término de regularización tipo CVAE (encoder de estilo latente z) que captura la variabilidad humana y cuya contribución se reduce a cero en inferencia mediante *temporal ensembling*: se promedian las predicciones solapadas de chunks consecutivos para suavizar la trayectoria.

El entrenamiento se ha realizado con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`. No se especifican en la model card el número de episodios, la composición del dataset, el número de tokens/iteraciones de entrenamiento, el robot objetivo ni si hubo aumento de datos. Tampoco se documentan innovaciones adicionales más allá de las propias de ACT (chunking de acciones y ensamblado temporal).

## Capacidades

- Control robótico por imitación: predice secuencias de acciones de baja dimensión (típicamente 6-7 grados de libertad) a partir de observaciones visuales y propioceptivas.
- Procesamiento multimodal de entrada: imágenes de una o varias cámaras más estado articular del robot.
- Generación de *action chunks*: emite bloques de acciones futuras que se ejecutan de forma abierta en bucle (*open-loop*) entre inferencias.
- Ensamblado temporal: combina predicciones solapadas para producir comandos suaves y continuos.
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y despliegue en robots SO-100/SO-101.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de lenguaje.
- No incluye visión de propósito general ni comprensión semántica de escenas; la percepción está acoplada a la tarea entrenada.

## Casos de uso

- Manipulación robótica de laboratorio: réplica de la política sobre un brazo SO-100/SO-101 para tareas de pick-and-place sobre las que se recogieron las demostraciones; el chunking de acciones reduce el jitter y mejora la tasa de éxito frente a políticas paso a paso.
- Investigación en aprendizaje por imitación: punto de partida reproducible para comparar ACT con otros métodos (Diffusion Policy, VQ-BeT) usando el mismo dataset y el mismo pipeline de LeRobot.
- *Fine-tuning* sobre nuevas tareas: el checkpoint de 51,7 M de parámetros se puede reentrenar en pocas horas en una GPU de consumo, lo que lo hace útil para prototipado rápido de nuevas habilidades.
- Evaluación de infraestructura robótica: sirve como política de referencia para validar cámaras, calibración y latencia del bucle de control antes de desplegar modelos más pesados.
- Docencia y formación: ejemplo didáctico completo de un pipeline de imitación (grabación de datos, entrenamiento, evaluación) con comandos reproducibles.
- Integración en simuladores o gemelos digitales: al ser una política ligera, puede ejecutarse a alta frecuencia en entornos simulados para generar datos sintéticos o validar controladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, números de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB en FP32 para 51,7 M de parámetros (el checkpoint completo ocupa ~0,2 GB en safetensors); en la práctica el cuello de botella es el backbone visual y el tamaño del batch, por lo que 2-4 GB son suficientes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. En CPU es viable con latencias mayores.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida para inferencia por lotes pequeños.
- Opciones de despliegue: `lerobot-record` con `--policy.path` apuntando al checkpoint (PyTorch); exportación a ONNX/TensorRT posible de forma manual, aunque no documentada por el autor.
- Latencia y throughput: no disponibles. En una GPU de consumo se espera inferencia por debajo de decenas de milisegundos por chunk, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este repositorio) | ~51,7 M | Imitación con transformer + CVAE, chunks de acciones | No disponible (chunk típico k=100 en LeRobot) | Apache 2.0 | Hugging Face, librería LeRobot |
| Diffusion Policy | Depende de la implementación (decenas de M) | Imitación generativa con difusión | Chunks de acciones, horizonte configurable | MIT/Apache según implementación | Repositorios públicos y LeRobot |
| VQ-BeT | Depende de la implementación | Imitación con cuantización vectorial de comportamiento | Chunks de acciones | MIT (implementación de referencia) | Repositorios públicos |
| SmolVLA | Cientos de M | VLA ligero con backbone de lenguaje | Contexto textual + acciones | Apache 2.0 | Hugging Face / LeRobot |

La comparación concreta de rendimiento no está disponible porque este checkpoint no publica métricas. Los datos de parámetros y licencia de los modelos alternativos corresponden a sus implementaciones de referencia y pueden variar según la versión.

## Limitaciones y advertencias

- Política específica de tarea: solo es válida para el robot, la cámara y la distribución de escenas del dataset `k6_20_20261113_173939`; fuera de ese dominio el rendimiento cae drásticamente.
- Sin documentación de la tarea: no se indica qué objeto manipula, cuántos episodios hay ni la tasa de éxito, lo que impide evaluar su calidad antes de usarlo.
- Riesgo de sobreajuste y de fallo ante cambios de iluminación, posición de cámara o fondo.
- Sin datos de sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí sesgos de los demostradores (velocidad, precisión y estilo de teleoperación).
- Sin mecanismos de seguridad: la política no incluye parada de emergencia ni límites articulares; deben implementarse en el controlador del robot.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el dataset y los datos de teleoperación recae en el usuario.
- Fecha de creación futura (2026-11-15) en los metadatos: conviene verificar la integridad del repositorio antes de desplegarlo en producción.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6e_base_15
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
