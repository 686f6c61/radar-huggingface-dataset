# KyraLeeChunWei/Oxymetazoline_e50_20K_ACT

## Resumen

El modelo `KyraLeeChunWei/Oxymetazoline_e50_20K_ACT` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Lo publica el usuario KyraLeeChunWei en Hugging Face mediante la librería LeRobot, el framework de Hugging Face para robótica de código abierto, y se distribuye con licencia Apache 2.0.

El modelo tiene 51.678.855 parámetros y un tamaño de repositorio de 0,2 GB, con pesos en formato safetensors. Está entrenado sobre el dataset `KyraLeeChunWei/Oxymetazoline_e50`, del que no se detalla composición ni número de episodios. La nomenclatura del identificador sugiere una configuración de entrenamiento con 50 épocas y un horizonte o número de muestras de 20K, aunque la model card no lo confirma explícitamente.

Su relevancia es acotada: no es un modelo de lenguaje, sino un controlador robótico especializado para una tarea concreta, pensado para ejecutarse con LeRobot sobre robots tipo SO-100/SO-101. No dispone de descargas ni valoraciones en el momento de la consulta y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT), según el paper arXiv:2304.13705 |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control robótico, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, a partir de demostraciones teleoperadas, predice bloques de acciones futuras en lugar de una única acción por paso. La arquitectura combina un codificador visual, un transformer que fusiona observaciones y estado, y una cabeza de decodificación que emite el chunk de acciones. Esta formulación reduce el error de acumulación y el compounding error típico de las políticas paso a paso, y suele alcanzar tasas de éxito altas en tareas de manipulación con datos limitados.

En este caso, el entrenamiento se ha realizado con LeRobot sobre el dataset `KyraLeeChunWei/Oxymetazoline_e50`. No se especifican en la model card el número de episodios, el número de tokens o frames, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta el robot objetivo ni la tarea concreta. El identificador sugiere 50 épocas de entrenamiento, pero es una inferencia a partir del nombre y no un dato confirmado.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y del estado del robot.
- Ejecución de tareas de manipulación aprendidas de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot (`lerobot-train`, `lerobot-record`).
- Compatible con robots del ecosistema LeRobot, como el SO-100 follower mencionado en los comandos de ejemplo.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.
- No dispone de API conversacional ni de generación de texto.

## Casos de uso

- Replicación de una tarea de manipulación concreta: cargar la política con `lerobot-record` y `--policy.path` para que el robot reproduzca la tarea aprendida en el dataset de entrenamiento.
- Evaluación comparativa de políticas ACT: servir como checkpoint de referencia para medir tasas de éxito frente a otras políticas entrenadas con el mismo dataset.
- Prototipado en laboratorio con robots SO-100/SO-101: al ser un modelo pequeño (51,7 M de parámetros, 0,2 GB), se puede desplegar en estaciones de trabajo con GPU modesta para ciclos rápidos de prueba.
- Base para fine-tuning: al estar en formato LeRobot y con licencia Apache 2.0, se puede reentrenar con nuevos datasets teleoperados para adaptar la política a variantes de la tarea.
- Docencia y reproducción de experimentos: útil para demostrar el flujo completo de entrenamiento y evaluación de ACT dentro de LeRobot sin necesidad de infraestructura pesada.
- Integración en pipelines de investigación de imitación: permite comparar action chunking frente a políticas paso a paso en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros, ~0,2 GB en safetensors), la huella en memoria es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento de ejemplo usa `--policy.device=cuda`, por lo que se espera una GPU NVIDIA. Para inferencia, cualquier GPU con unos pocos GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna de consumo; no se han publicado requisitos mínimos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`); no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Oxymetazoline_e50_20K_ACT (este) | 51,7 M | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | habitualmente Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea y un dataset concretos; no generaliza a otras tareas sin reentrenamiento.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones que permitan valorar su calidad real.
- Dataset poco documentado: se desconoce el número de episodios, la calidad de las demostraciones y las condiciones de captura.
- Riesgo de sobreajuste: con 50 épocas (según el nombre) y un dataset no descrito, existe riesgo de sobreajuste a las condiciones de entrenamiento.
- Sin soporte lingüístico ni conversacional: no debe usarse como modelo de lenguaje ni para tareas de texto.
- Sesgos: no evaluados; en robótica por imitación, los sesgos provienen de las demostraciones y pueden reproducir sesgos del operador o del entorno de captura.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Oxymetazoline_e50_20K_ACT
- Dataset de entrenamiento: https://huggingface.co/datasets/KyraLeeChunWei/Oxymetazoline_e50
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
