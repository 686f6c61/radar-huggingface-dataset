# Haku-2004/act_k6s120e_c50_base_20

## Resumen

`act_k6s120e_c50_base_20` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario Haku-2004 en Hugging Face mediante la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica. El repositorio se creó el 26 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes.

El modelo resuelve el problema de control robótico de manipulación a partir de demostraciones teleoperadas: dado un conjunto de observaciones (típicamente imágenes de cámara y estado de las articulaciones), genera comandos de acción para un robot seguidor, en este caso del tipo SO-100 follower según los comandos de evaluación de la model card. Con 51.617.414 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto.

Su relevancia es acotada y práctica: se trata de un checkpoint concreto entrenado sobre el dataset `Haku-2004/k6_20_20261113_173939`, útil como referencia para reproducir el pipeline de entrenamiento y evaluación de ACT con LeRobot, y no como un modelo de propósito general. No hay información publicada sobre idiomas, benchmarks ni composición detallada del dataset más allá de su identificador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.617.414 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k6_20_20261113_173939 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer que procesa las observaciones (imágenes de las cámaras del robot y el estado de las articulaciones) con un decodificador que emite chunks de acciones, es decir, varias acciones futuras en una sola pasada. Esta predicción por bloques reduce el error de acumulación típico de las políticas que predicen un único paso y mejora la estabilidad del control. El modelo incluye además un mecanismo de estilo CVAE para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, cuyo contenido, número de episodios, número de tokens o frames y composición no se detallan en la información disponible. Tampoco se documenta si hubo aumento de datos, qué cámaras se usaron ni la configuración exacta de hiperparámetros (el nombre del checkpoint sugiere 120 épocas y un tamaño de chunk de 50, pero esto no está confirmado en la model card). No se indica el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de robótica de imitación.

## Capacidades

- Control robótico de manipulación mediante predicción de chunks de acciones a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Evaluación e inferencia integradas en LeRobot mediante `lerobot-record` con un robot `so100_follower`.
- Entrenamiento reproducible desde cero con `lerobot-train` y registro opcional en Weights & Biases.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión general.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No hay capacidades multilingües declaradas; el modelo no procesa lenguaje natural.
- No se documentan modos especiales como thinking, audio o visión de propósito general.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede controlar un brazo SO-100 follower en tareas de pick-and-place aprendidas de demostraciones, usando las cámaras del robot como entrada y emitiendo chunks de 50 acciones para suavizar el control.
- Reproducción de experimentos de ACT: sirve como checkpoint de referencia para validar el pipeline de LeRobot (`lerobot-train` y `lerobot-record`) en un entorno concreto y comparar curvas de éxito con otras configuraciones.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del tamaño de chunk, el número de épocas y la composición del dataset sobre la tasa de éxito en tareas de manipulación.
- Prototipado de políticas para robots de bajo coste: con 51,6 millones de parámetros y 0,2 GB de pesos, es viable ejecutarlo en una GPU consumer o incluso en CPU para pruebas de latencia.
- Evaluación comparativa de datasets: al estar atado a un dataset concreto (`k6_20_20261113_173939`), facilita analizar cómo afecta la calidad y cantidad de demostraciones al rendimiento final.
- Formación y docencia: útil como ejemplo didáctico de un flujo completo de entrenamiento y despliegue de una política ACT con LeRobot, desde la teleoperación hasta la evaluación con episodios registrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 millones de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la huella de memoria es muy reducida y el cuello de botella será el procesamiento de imágenes en tiempo real.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente para inferencia; para entrenamiento se recomienda al menos una RTX 3090 o superior, aunque no hay cifras oficiales.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6s120e_c50_base_20 | 51,6 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | reportado en el paper, no comparable directamente | no disponible | paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | variable | no aplica | no disponible | según checkpoint | Hugging Face (LeRobot) |

No se dispone de datos de benchmarks homogéneos que permitan una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- El modelo está entrenado para un robot y un dataset concretos; su generalización a otras tareas, cámaras o morfologías no está garantizada y probablemente sea nula fuera del dominio de entrenamiento.
- No hay información sobre sesgos, pero al ser un modelo de imitación hereda los sesgos y errores de las demostraciones humanas, incluidas trayectorias subóptimas o inconsistencias.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de comportamientos erráticos o inseguros ante observaciones fuera de distribución.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el uso en robots reales requiere validación de seguridad independiente; el autor no ofrece garantías.
- El repositorio no registra descargas ni validación externa, por lo que la calidad del checkpoint no está contrastada por la comunidad.
- No se especifican los hiperparámetros exactos ni la composición del dataset, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6s120e_c50_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
