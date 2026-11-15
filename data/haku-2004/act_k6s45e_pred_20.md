# Haku-2004/act_k6s45e_pred_20

## Resumen

`Haku-2004/act_k6s45e_pred_20` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Su función es predecir secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación aprendidas a partir de demostraciones teleoperadas.

El modelo cuenta con 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Está entrenado sobre el dataset `Haku-2004/k6_4seg` y se distribuye bajo licencia Apache 2.0 en formato safetensors, con integración nativa en el ecosistema LeRobot.

Se trata de un modelo de nicho, sin descargas ni likes en el momento de la ficha, orientado a experimentación con brazos robóticos tipo SO-100/SO-101 y flujos de trabajo de imitación. Su relevancia radica en que ejemplifica el pipeline completo de LeRobot: entrenamiento desde cero, evaluación con `lerobot-record` y despliegue sobre un robot follower.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observación fijas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un esquema de predicción por chunks. El modelo recibe observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y predice un bloque de acciones futuras de longitud fija, lo que permite un control más suave y robusto que la predicción paso a paso. La arquitectura incluye un encoder visual y un decoder autorregresivo o no autorregresivo según la configuración de LeRobot, junto con una componente de estilo CVAE que modela la variabilidad de las demostraciones humanas.

El entrenamiento se realiza sobre el dataset `Haku-2004/k6_4seg`, compuesto por episodios teleoperados. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto). La innovación principal es el propio chunking de acciones, que reduce el horizonte efectivo de predicción y mitiga el compounding error característico de las políticas de imitación.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones multimodales (imágenes de cámaras y estado de articulaciones) según la configuración de LeRobot.
- Integración con el pipeline de LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Despliegue sobre robots follower tipo SO-100/SO-101.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Manipulación robótica de precisión: el modelo predice chunks de acciones que permiten al brazo ejecutar tareas de pick-and-place con mayor suavidad y menor acumulación de error que políticas paso a paso.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, datasets y configuraciones de entrenamiento dentro de LeRobot.
- Prototipado rápido de políticas sobre SO-100/SO-101: al ser un modelo ligero (51,7 M de parámetros, 0,2 GB), se puede entrenar y evaluar en estaciones de trabajo con una sola GPU consumer.
- Evaluación de datasets teleoperados: el modelo permite validar la calidad del dataset `Haku-2004/k6_4seg` midiendo la tasa de éxito en episodios de evaluación con `lerobot-record`.
- Automatización de tareas repetitivas en laboratorio: tareas de recogida, colocación o clasificación de objetos que requieran demostraciones cortas y control continuo.
- Educación y docencia en robótica: ejemplo completo y ligero del ciclo entrenamiento-despliegue con LeRobot, adecuado para cursos y talleres prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el consumo depende del tamaño de las imágenes de entrada y del batch, pero cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; para inferencia en tiempo real basta una GPU de gama media.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack de Hugging Face; no se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6s45e_pred_20 | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | variable | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy | variable | no aplica | no disponible | variable | Hugging Face |
| Políticas VQ-BeT | variable | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas. La comparación se limita a categoría (políticas de imitación en LeRobot), licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho sin descargas ni validación comunitaria; el rendimiento real no está verificado de forma independiente.
- Entrenado sobre un único dataset (`Haku-2004/k6_4seg`); probable sobreajuste al entorno, objetos y configuración de cámara de ese dataset.
- No generaliza a tareas, robots o disposiciones de cámara distintas sin reentrenamiento.
- Riesgo de fallo ante condiciones de iluminación, oclusiones o variaciones no presentes en las demostraciones.
- No es un modelo lingüístico: no procesa texto ni mantiene conversaciones.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos específicos; en robótica, los sesgos provienen de la distribución de las demostraciones teleoperadas.
- Requiere el stack LeRobot y un robot compatible (SO-100/SO-101) para su uso práctico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6s45e_pred_20
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
