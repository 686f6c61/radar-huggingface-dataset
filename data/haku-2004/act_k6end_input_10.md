# Haku-2004/act_k6end_input_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Este checkpoint concreto, publicado por el usuario Haku-2004 bajo el identificador `act_k6end_input_10`, ha sido entrenado con la librería LeRobot de Hugging Face sobre el dataset `Haku-2004/k6_4seg` y está empaquetado en formato safetensors con 51.671.174 parámetros (aproximadamente 51,7 millones).

El modelo resuelve el problema del control fino en tareas de manipulación robótica aprendidas a partir de demostraciones teleoperadas. Al predecir secuencias de acciones en lugar de comandos aislados, ACT reduce el error de composición acumulado y mitiga el problema de la varianza en la predicción de acciones individuales, lo que se traduce en tasas de éxito más altas en tareas de precisión con brazos robóticos de bajo coste.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas de imitación en hardware asequible como el brazo SO-100/SO-101. El checkpoint tiene un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y desplegable en GPUs de consumo, y se distribuye con licencia Apache 2.0, lo que facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de observaciones y decoder de acciones (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT emplea una arquitectura transformer con un encoder que procesa las observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y un decoder que genera un chunk de acciones futuras de longitud fija. La innovación principal del método, descrita en el paper arXiv:2304.13705, es la predicción de secuencias de acciones con un objetivo de tipo L1 y un mecanismo de *temporal ensembling* que suaviza las predicciones entre chunks solapados. Esto reduce el ruido y mejora la estabilidad del control en tiempo real.

El entrenamiento se realiza por imitación supervisada sobre episodios teleoperados del dataset `Haku-2004/k6_4seg`. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de robótica). El checkpoint fue generado con LeRobot, que estandariza el pipeline de entrenamiento mediante el comando `lerobot-train` con `--policy.type=act`.

## Capacidades

- Generación de chunks de acciones para control de brazos robóticos manipuladores.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones multimodales: imágenes de cámara y estado de articulaciones.
- Control de precisión en tareas de manipulación de corto horizonte.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Ejecución de inferencia en tiempo real en GPUs de consumo.
- Soporte de *temporal ensembling* para suavizar transiciones entre chunks de acción.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades de lenguaje natural.

## Casos de uso

- Manipulación robótica de precisión: el modelo predice chunks de acciones que permiten al brazo SO-100/SO-101 ejecutar tareas como recoger y colocar objetos, con una tasa de éxito superior a la de políticas que predicen acciones individuales gracias a la reducción del error acumulado.
- Automatización de tareas repetitivas en laboratorio: entrenado sobre el dataset `k6_4seg`, puede replicar secuencias de manipulación grabadas por un operador humano, liberando al personal de tareas monótonas de pick-and-place.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT, cambios en el dataset o técnicas de *ensembling* en experimentos académicos.
- Prototipado rápido de políticas robóticas: con 51,7 M de parámetros y 0,2 GB de pesos, permite iterar en estaciones de trabajo con una sola GPU consumer, reduciendo el coste de experimentación.
- Despliegue en robots educativos: adecuado para cursos y talleres de robótica donde se enseña el pipeline completo de LeRobot, desde la teleoperación hasta la evaluación con `lerobot-record`.
- Evaluación comparativa de hardware: al ser un checkpoint ligero, permite medir latencia y throughput en distintas GPUs (RTX 4090, A100, etc.) para dimensionar sistemas de control en tiempo real.
- Integración en pipelines de investigación reproducibles: el formato safetensors y la licencia Apache 2.0 facilitan su inclusión en repositorios y flujos de CI para validación de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros en FP32 ≈ 207 MB de pesos, más overhead de activaciones y buffers de imágenes).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack de Hugging Face; no se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, que no están orientados a políticas robóticas.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6end_input_10 | 51,7 M | no disponible | Manipulación robótica (ACT) | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no disponible | Manipulación robótica (ACT) | no disponible | Paper y código de referencia |
| Políticas Diffusion Policy | no disponible | no disponible | Manipulación robótica | no disponible | Implementaciones en LeRobot |
| Políticas VQ-BeT | no disponible | no disponible | Manipulación robótica | no disponible | Implementaciones en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre el dataset `Haku-2004/k6_4seg`, el modelo está especializado en las condiciones de esa tarea y ese hardware; generalizará mal a otros robots, cámaras o entornos.
- Riesgo de alucinación: en robótica, se traduce en acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento; requiere supervisión y límites de seguridad en el robot.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni mantiene conversaciones. La ventana de observación depende de la configuración de entrenamiento, no documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; el despliegue en producción es responsabilidad del integrador.
- Caveats para producción: checkpoint con 0 descargas y 0 likes, sin validación comunitaria; no se documentan métricas de éxito, número de episodios de entrenamiento ni protocolo de evaluación. Verificar el comportamiento en el robot objetivo antes de cualquier uso real.
- El modelo card no incluye información sobre la composición del dataset ni sobre posibles datos sensibles en las grabaciones teleoperadas.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6end_input_10
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
