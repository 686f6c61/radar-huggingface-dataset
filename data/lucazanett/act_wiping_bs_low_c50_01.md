# lucazanett/act_wiping_bs_low_c50_01

## Resumen

`lucazanett/act_wiping_bs_low_c50_01` es una política de imitación basada en Action Chunking with Transformers (ACT), un método presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está pensado para controlar un robot seguidor tipo SO-100 en una tarea concreta de limpieza o wiping.

Se trata de un modelo pequeño, de 51.631.754 parámetros (unos 51,6 millones), distribuido en formato safetensors con un repositorio de 0,2 GB. No es un modelo de lenguaje: su pipeline es `robotics` y su función es mapear observaciones (imágenes de cámara y estado de las articulaciones) a comandos de acción motora. El entrenamiento se realizó sobre el dataset `lucazanett/new_setup_baseline_low`, un conjunto de demostraciones teleoperadas.

Su relevancia es práctica: permite reproducir y desplegar una política de manipulación robótica entrenada con LeRobot sin necesidad de infraestructura pesada, ya que cabe en GPU de consumo. La licencia Apache 2.0 facilita su reutilización y adaptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.631.754 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de una única acción por paso. Esto reduce el error de acumulación y mejora la estabilidad del control. El modelo incorpora habitualmente un encoder visual (típicamente ResNet) para procesar las observaciones de cámara y un decoder transformer que genera los chunks de acción, junto con una cabeza de estilo CVAE para modelar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset `lucazanett/new_setup_baseline_low`, compuesto por demostraciones teleoperadas de la tarea de wiping. No se dispone de información sobre el número de episodios, tokens de entrenamiento (no aplica), composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto). El sufijo `c50` del nombre sugiere un chunk size de 50, aunque este dato no está confirmado en la información disponible.

## Capacidades

- Control robótico por imitación: genera comandos de acción para un robot seguidor SO-100 a partir de observaciones visuales y de estado.
- Predicción de action chunks: emite secuencias cortas de acciones, lo que mejora la suavidad y robustez del control frente a políticas paso a paso.
- Ejecución de tareas de manipulación específicas: entrenado para la tarea de wiping (limpieza) sobre una superficie.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación e inferencia mediante los comandos `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling, agentes multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Automatización de tareas de limpieza en entornos controlados: el modelo ejecuta la política de wiping sobre un robot SO-100, adecuado para laboratorios o líneas de montaje donde la tarea está bien delimitada.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, tamaños de chunk o configuraciones de dataset.
- Prototipado rápido de políticas robóticas: gracias a sus 51,6 M de parámetros y 0,2 GB, se puede entrenar y desplegar en estaciones de trabajo con una sola GPU.
- Evaluación de pipelines de teleoperación: permite validar la cadena completa de LeRobot (grabación de demostraciones, entrenamiento y evaluación con `lerobot-record`).
- Docencia y formación en robótica: ejemplo práctico y ligero para enseñar el flujo de trabajo de imitación con LeRobot.
- Despliegue en robots de bajo coste: al caber en GPU de consumo, es viable en configuraciones de hardware asequible para pruebas de concepto.
- Reentrenamiento con nuevos datasets: la licencia Apache 2.0 y el formato safetensors permiten adaptar la política a otras tareas de manipulación con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,6 M de parámetros, más el overhead del encoder visual y del runtime; en la práctica, menos de 2-4 GB según el framework.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 3060, RTX 4090 o superior es más que suficiente. También es viable en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1060 en adelante).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `lucazanett/act_wiping_bs_low_c50_01` | 51,6 M | no aplica | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | variable | Hugging Face |
| Políticas Diffusion Policy | variable | no aplica | variable | Hugging Face / repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para una tarea concreta (wiping) y un robot concreto (SO-100); no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Sin datos de evaluación publicados: no hay métricas de éxito, lo que impide valorar su fiabilidad en producción.
- Riesgo de sobreajuste al dataset de demostraciones: la variabilidad de posiciones, iluminación y objetos puede degradar el rendimiento.
- Dependencia del hardware y calibración del robot: cambios en cámaras, montaje o calibración pueden invalidar la política.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; las expectativas deben limitarse al control motor.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las condiciones del dataset de entrenamiento (`lucazanett/new_setup_baseline_low`) antes de un despliegue comercial.
- Sin información sobre sesgos: no se documentan sesgos, pero al ser un modelo de imitación puede reproducir sesgos presentes en las demostraciones humanas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucazanett/act_wiping_bs_low_c50_01
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_baseline_low
