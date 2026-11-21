# SamShumChun/lerobot_sayhi_pose_a_old

## Resumen

`lerobot_sayhi_pose_a_old` es un modelo de política robótica entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Lo publica el usuario SamShumChun y está asociado a la arquitectura ACT (Action Chunking Transformer), descrita en el paper arXiv:2304.13705, que combina un transformer con un autoencoder condicionado para predecir secuencias de acciones a partir de observaciones visuales y de estado. El modelo resuelve la tarea concreta de generar comandos de pose ("say hi") a partir de demostraciones teleoperadas.

Con 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors, se trata de un checkpoint pequeño, orientado a control de robots manipuladores o brazos articulados en entornos de laboratorio. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que mapea observaciones (imágenes de cámara y estado de las articulaciones) a acciones motoras.

Su relevancia es práctica para quienes trabajan con LeRobot y quieren reproducir o reutilizar una política de saludo. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ACT, una arquitectura presentada en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT emplea un transformer que recibe como entrada las observaciones visuales (imágenes de cámaras) y el estado de las articulaciones, y predice un chunk de acciones futuras en lugar de una única acción. Este enfoque de predicción por bloques reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. El modelo incluye un componente de autoencoder condicionado (CVAE) que modela la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con la librería LeRobot sobre el dataset `SamShumChun/lerobot_sayhi_dataset_a_20261114_124837`, que contiene demostraciones teleoperadas de la tarea de saludo. No se dispone de información sobre el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización adicional. No hay datos públicos sobre el proceso de entrenamiento más allá de lo indicado en la model card.

## Capacidades

- Generación de secuencias de acciones motoras para control de robots a partir de observaciones visuales y de estado.
- Ejecución de la tarea específica de saludo ("say hi") con un brazo robótico o manipulador.
- Predicción de chunks de acciones (action chunking), lo que permite movimientos suaves y coherentes.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Reproducción de la tarea de saludo en un robot de laboratorio: el modelo puede cargarse en LeRobot y ejecutarse sobre un brazo articulado para que realice el gesto de saludo, sirviendo como punto de partida para experimentos de imitación.
- Docencia y formación en robótica: útil para que estudiantes aprendan a entrenar y desplegar políticas ACT con LeRobot usando un checkpoint ya entrenado y un dataset de ejemplo.
- Benchmark de referencia para nuevas políticas: al ser un modelo pequeño y con licencia permisiva, puede servir como línea base en comparaciones de algoritmos de imitación sobre la misma tarea.
- Prototipado rápido de demos interactivas: en ferias o presentaciones, un robot puede ejecutar el saludo de forma autónoma tras cargar el checkpoint, sin necesidad de teleoperación en tiempo real.
- Investigación en aprendizaje por imitación: el checkpoint permite analizar el comportamiento de ACT en tareas de contacto humano-robot y estudiar la generalización a variaciones de posición o iluminación.
- Integración en pipelines de evaluación de LeRobot: puede usarse como política de referencia para validar métricas de éxito, robustez y suavidad de trayectorias en entornos simulados o reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7 M de parámetros, la inferencia cabe holgadamente en GPUs de consumo. En fp32 ocuparía aproximadamente 0,2 GB de pesos; en fp16, unos 0,1 GB. La VRAM adicional depende de las imágenes de entrada y del tamaño del batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para entrenamiento se recomienda al menos 8-12 GB.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna, e incluso en CPU para inferencia con latencia aceptable.
- Opciones de despliegue: LeRobot (librería oficial), PyTorch, y potencialmente exportación a ONNX o TensorRT para optimización. No se dispone de soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del número de cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lerobot_sayhi_pose_a_old | 51,7 M | no aplica | Saludo con brazo robótico (ACT) | Apache 2.0 | Gated en HF |
| ACT original (paper) | ~80 M (referencia) | no aplica | Manipulación bimanual fina | MIT (código) | GitHub |
| Diffusion Policy | variable (según config) | no aplica | Políticas de imitación visual | MIT | GitHub |
| RT-1 / RT-2 (Google) | 35 M / 55 B | no aplica | Control robótico generalista | no disponible | No público |

La comparación con ACT original y Diffusion Policy es cualitativa: no se dispone de métricas de éxito comparables en la información proporcionada. RT-1 y RT-2 son modelos de mayor escala y no directamente comparables en tamaño ni en disponibilidad.

## Limitaciones y advertencias

- Modelo específico para una única tarea ("say hi"): no generaliza a otras tareas sin reentrenamiento.
- Entrenado sobre un dataset concreto; puede fallar ante cambios de iluminación, posición de cámara, fondo o configuración del robot.
- Riesgo de sobreajuste a las demostraciones: la variabilidad de las trayectorias puede ser limitada.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas ni mantiene conversaciones.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de las dependencias de PyTorch, cuyas licencias deben revisarse por separado.
- No se dispone de información sobre sesgos, ya que no maneja datos lingüísticos ni sociales.
- Para producción robótica se recomienda validación extensiva en el entorno real, ya que el checkpoint no incluye garantías de seguridad física.
- El repositorio tiene pocas descargas (32) y ningún "like", lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/SamShumChun/lerobot_sayhi_pose_a_old
- Dataset asociado: https://huggingface.co/datasets/SamShumChun/lerobot_sayhi_dataset_a_20261114_124837
- Paper ACT: https://arxiv.org/abs/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- LeRobot (documentación): https://huggingface.co/docs/lerobot
