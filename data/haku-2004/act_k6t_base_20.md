# Haku-2004/act_k6t_base_20

## Resumen

`act_k6t_base_20` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), publicada por el usuario Haku-2004 en Hugging Face y entrenada con LeRobot, la librería de aprendizaje por imitación de Hugging Face. El modelo no es un LLM: es un controlador visomotor que, a partir de observaciones (imágenes de cámara y estado de las articulaciones), predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y estabiliza la ejecución en tareas de manipulación.

El modelo tiene 51.668.614 parámetros (dato real de los pesos en safetensors) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la gama ligera y permite inferencia en tiempo real en GPUs de consumo. Se entrenó sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente teleoperado, y se distribuye bajo licencia Apache 2.0. La relevancia actual radica en que ACT es una de las referencias estándar de imitación en robótica de bajo coste (brazos tipo SO-100/SO-101) y este checkpoint es un ejemplo reproducible de extremo a extremo con el ecosistema LeRobot.

La información pública es escasa: no hay benchmarks publicados, ni detalles del dataset, ni idiomas declarados (no aplica en robótica). Esta ficha se limita a lo verificable en la model card, los metadatos del Hub y el paper de ACT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con encoder visual y decoder de acciones (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) combina un backbone de visión (típicamente ResNet preentrenado) que codifica las imágenes de las cámaras con un transformer que fusiona esas características con el estado de las articulaciones y genera, de forma autorregresiva, un chunk de k acciones futuras. La innovación clave del método es predecir secuencias de acciones en lugar de pasos aislados, lo que mitiga el compounding error de la imitación y permite políticas más suaves y robustas. El paper original (arXiv:2304.13705) introduce además una variante con CVAE para modelar la multimodalidad de las demostraciones humanas.

No se dispone de información sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas. El modelo se entrenó con `lerobot-train` sobre el dataset `Haku-2004/k6_20_20261113_173939`; la model card solo indica la receta genérica de LeRobot. No se documentan detalles del robot, del número de episodios, de la frecuencia de control ni del número de cámaras.

## Capacidades

- Control visomotor por imitación: genera chunks de acciones a partir de imágenes y estado proprioceptivo.
- Ejecución de tareas de manipulación aprendidas de demostraciones teleoperadas.
- Predicción de acciones en lote (action chunking), lo que reduce la frecuencia de inferencia necesaria.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue.
- Compatible con robots de bajo coste tipo SO-100/SO-101 (según la receta de evaluación de la model card).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de laboratorio: reproducir una tarea concreta (por ejemplo, recoger y colocar objetos) entrenando o afinando ACT sobre demostraciones teleoperadas con un brazo SO-100; el chunking de acciones aporta movimientos más estables que un control paso a paso.
- Prototipado rápido de políticas con LeRobot: usar este checkpoint como base para experimentar con `lerobot-record` y evaluar la tasa de éxito en 10 episodios antes de invertir en más datos.
- Investigación en aprendizaje por imitación: servir de referencia reproducible para comparar variantes de ACT (con y sin CVAE, distintos tamaños de chunk) en el mismo entorno.
- Educación y docencia en robótica: desplegar una política entrenada en hardware asequible para ilustrar el pipeline completo observación-acción en un curso.
- Automatización de tareas repetitivas de pick-and-place en entornos controlados, donde la variabilidad visual es baja y el modelo puede generalizar dentro de la distribución de entrenamiento.
- Base para fine-tuning con datos propios: al ser Apache 2.0 y ligero (0,2 GB), es viable reentrenarlo o adaptarlo en una estación de trabajo con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para 51,7 M de parámetros, más el coste del backbone visual y de los buffers de imagen; en la práctica, menos de 4 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una RTX 3060 o superior; también es viable en CPU para evaluación no interactiva.
- Cabe en GPU de consumo: sí, en toda la gama RTX y en GPUs integradas con suficiente memoria compartida para inferencia lenta.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; dependen del robot, la resolución de cámara y el tamaño del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6t_base_20 | 51,7 M | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (paper 2304.13705) | no disponible | no aplica | tasas de éxito reportadas en el paper | según implementación | código y pesos de referencia |
| Diffusion Policy | no disponible | no aplica | alternativa de imitación con difusión | según implementación | disponible en LeRobot |
| VQ-BeT | no disponible | no aplica | alternativa de imitación con discretización | según implementación | disponible en LeRobot |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa de su rendimiento fuera del dataset de entrenamiento.
- Sesgo de distribución: al ser imitación, generaliza mal fuera de las condiciones visuales, de iluminación y de posición de las demostraciones.
- Riesgo de fallo silencioso: un modelo de imitación puede ejecutar acciones incorrectas con alta confianza; requiere supervisión y paradas de seguridad en hardware real.
- Sin información sobre el dataset: se desconoce el número de episodios, el robot objetivo y la frecuencia de control, lo que dificulta reproducir el entrenamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse con benchmarks de LLM.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el integrador.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni issues conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6t_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
