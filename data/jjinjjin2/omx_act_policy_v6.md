# JJinJJin2/omx_act_policy_v6

## Resumen

`omx_act_policy_v6` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario JJinJJin2 en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de un controlador neuronal entrenado para predecir secuencias cortas de acciones motoras ("action chunks") a partir de observaciones visuales y proprioceptivas del robot. El modelo se ha entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, sobre el dataset `JJinJJin2/pick_and_place_v3`.

El método ACT, descrito en el paper arXiv:2304.13705, sustituye la predicción paso a paso por la predicción de bloques de acciones, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación aprendidas a partir de demostraciones teleoperadas. Este checkpoint concreto tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware modesto.

Su relevancia es doble: por un lado, ilustra el flujo de trabajo estándar de LeRobot para entrenar y evaluar políticas de imitación; por otro, sirve como referencia práctica para quien quiera reproducir una tarea de pick-and-place con un robot tipo SO-100. Al ser un modelo de nicho con cero descargas y cero likes en el momento de la consulta, debe tratarse como un checkpoint experimental de un autor individual, no como un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; opera sobre ventanas de observación, no sobre contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de emitir una única acción por paso, el modelo genera un bloque de k acciones futuras y lo ejecuta de forma temporalmente agregada. Esto mitiga el problema de las predicciones individuales inconsistentes y permite explotar correlaciones temporales entre pasos consecutivos. La arquitectura típica de ACT incluye un codificador de imágenes (por ejemplo, ResNet) para las observaciones visuales, un codificador de estado proprioceptivo y un decodificador transformer que produce las acciones, además de una cabeza de estilo VAE opcional para modelar variabilidad en las demostraciones.

El entrenamiento se realiza sobre datos teleoperados: el dataset `JJinJJin2/pick_and_place_v3` contiene episodios de una tarea de recogida y colocación. No se dispone de información sobre el número de episodios, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos o regularización adicionales. El flujo de entrenamiento documentado por el autor usa `lerobot-train` con `--policy.type=act`, dispositivo CUDA y registro opcional en Weights & Biases.

## Capacidades

- Control robótico por imitación: predice chunks de acciones motoras a partir de observaciones visuales y de estado del robot.
- Ejecución de tareas de manipulación aprendidas de demostraciones teleoperadas, en este caso pick-and-place.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatibilidad con robots tipo SO-100 follower, según el ejemplo de evaluación de la model card.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling ni capacidades multilingües.
- No se documentan modos especiales (thinking, audio, agentes multi-paso) porque no aplican a esta categoría de modelo.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la política aprendida sobre el dataset `pick_and_place_v3`, adecuado para validar el pipeline completo de LeRobot antes de escalar a tareas más complejas.
- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar variantes de ACT (distintos tamaños de chunk, codificadores visuales o datasets) manteniendo el mismo entorno de evaluación.
- Prototipado rápido en robot SO-100: con 51,7 millones de parámetros y 0,2 GB de pesos, permite iterar en estaciones de trabajo con una sola GPU consumer.
- Docencia y formación en robótica de imitación: el flujo `lerobot-train` / `lerobot-record` documentado facilita explicar el ciclo completo de recogida de datos, entrenamiento y evaluación.
- Evaluación comparativa de políticas: al estar publicado con licencia apache-2.0, puede usarse como baseline en estudios internos sobre robustez a cambios de iluminación o posición inicial.
- Integración en pipelines de investigación: el formato safetensors y la integración nativa con LeRobot permiten cargar el checkpoint en scripts de evaluación automatizados sin conversiones intermedias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 millones de parámetros, 0,2 GB de pesos), la inferencia cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el entrenamiento documentado usa `--policy.device=cuda`.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con posibilidad de exportar a otros runtimes según la documentación de LeRobot; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_act_policy_v6 | 51.668.614 | no aplica | Pick-and-place (ACT) | apache-2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación general | apache-2.0 (según repositorio) | Hub de Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación visomotora | variable según checkpoint | Hub de Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por terceros.
- Entrenado sobre un único dataset (`JJinJJin2/pick_and_place_v3`): la generalización a otras tareas, objetos o entornos no está demostrada.
- Sin información sobre sesgos, composición del dataset ni diversidad de demostraciones; posibles sesgos hacia posiciones, iluminación o objetos presentes en los datos de entrenamiento.
- Riesgo de fallo en producción si el entorno físico difiere del de entrenamiento (cámaras, calibración, fricción, altura de mesa).
- No hay datos publicados de benchmarks ni de tasas de éxito, por lo que no puede recomendarse como solución de producción sin evaluación propia.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las licencias de las dependencias (LeRobot, pesos de codificadores visuales preentrenados) antes de desplegar.
- No procesa lenguaje ni texto: cualquier expectativa de uso como modelo conversacional es incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JJinJJin2/omx_act_policy_v6
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/JJinJJin2/pick_and_place_v3
