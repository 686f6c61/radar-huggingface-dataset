# Haku-2004/act_k6s45_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones ("chunks") en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. El modelo `Haku-2004/act_k6s45_input_20` es un checkpoint concreto de esta política, entrenado con LeRobot sobre el dataset `Haku-2004/k6_4seg` y publicado en Hugging Face con licencia Apache 2.0. Con 51.671.174 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB, se trata de un modelo compacto diseñado para control de robots, no para generación de texto.

La relevancia de ACT radica en su formulación como transformer condicionado por observaciones (típicamente imágenes de cámaras y estado de las articulaciones) que genera una secuencia de acciones de horizonte fijo, lo que estabiliza el entrenamiento y mejora la tasa de éxito frente a políticas que predicen una sola acción por paso. Este checkpoint concreto está pensado para ser evaluado con `lerobot-record` sobre un robot tipo SO-100 (según el ejemplo de la model card) y forma parte del ecosistema LeRobot de Hugging Face.

Al no estar orientado a lenguaje, carece de capacidades conversacionales, multilingües o de razonamiento simbólico; su utilidad es exclusivamente robótica y está ligada al dataset y a la morfología del robot con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política de aprendizaje por imitación |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción definido por la configuración de entrenamiento, no documentado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo implementa la política ACT descrita en el paper arXiv:2304.13705. Se trata de un transformer que recibe como entrada observaciones (típicamente imágenes de una o varias cámaras junto con el estado de las articulaciones) y produce un chunk de acciones de longitud fija. Esta predicción por bloques mitiga el problema de la varianza en el etiquetado humano y el error acumulado de las políticas paso a paso, y suele combinarse con un autoencoder condicionado (CVAE) durante el entrenamiento para modelar la variabilidad de las demostraciones.

El entrenamiento se ha realizado con LeRobot sobre el dataset `Haku-2004/k6_4seg`, que corresponde a teleoperación segmentada en cuatro segmentos según el nombre del repositorio. No se especifican en la información disponible el número de episodios, el número de tokens o muestras, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos. Tampoco se documentan detalles de la configuración de entrenamiento (resolución de imagen, número de cámaras, frecuencia de control o tamaño del chunk de acción).

## Capacidades

- Predicción de chunks de acciones para control de robots manipuladores en tareas de imitación.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones visuales y de estado de articulaciones como entrada (segun la formulación estándar de ACT; la configuración concreta no está detallada en la model card).
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación/inferencia (`lerobot-record`).
- No soporta tool calling, function calling, agentes de texto ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales fuera del ámbito robótico.

## Casos de uso

- Manipulación robótica de precisión en entornos de laboratorio: el modelo predice chunks de acciones que estabilizan el control de un brazo SO-100, lo que resulta adecuado para tareas de pick-and-place repetitivas donde el error acumulado es crítico.
- Evaluación comparativa de políticas de imitación: al ser un checkpoint LeRobot, permite reproducir el pipeline `lerobot-record` con `--episodes=10` para medir tasas de éxito frente a otras políticas entrenadas sobre el mismo dataset.
- Prototipado rápido de nuevas tareas de teleoperación: partiendo de un dataset segmentado como `k6_4seg`, se puede reentrenar o ajustar la política para tareas similares dentro del mismo entorno físico.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para estudiar el efecto del chunking de acciones, la arquitectura transformer y el condicionamiento por observaciones.
- Automatización de tareas de ensamblaje en cadenas de montaje ligeras: la predicción por bloques reduce la latencia de decisión y mejora la suavidad de las trayectorias en robots de bajo coste.
- Docencia y formación en robótica: al ser un modelo pequeño (0,2 GB) y con licencia permisiva, es adecuado para prácticas de entrenamiento y despliegue en laboratorios con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7 M de parámetros, la inferencia en FP32 requiere aproximadamente 0,2 GB de pesos, más el coste de las activaciones y del codificador visual; en la práctica, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; el ejemplo de la model card usa `--policy.device=cuda`. Para entrenamiento se recomienda al menos una RTX 3060/4060 o superior; para inferencia, incluso una GPU integrada o CPU puede ser viable, aunque no se documenta latencia.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM; el repositorio ocupa 0,2 GB.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), y potencialmente exportación a otros runtimes, aunque no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k6s45_input_20` (ACT) | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (referencia) | ~50 M (típico) | no disponible | no disponible | Apache 2.0 | Hugging Face / GitHub |
| Diffusion Policy (referencia) | variable | no disponible | no disponible | MIT (implementación de referencia) | GitHub |
| VQ-BeT (referencia) | variable | no disponible | no disponible | MIT (implementación de referencia) | GitHub |

No se dispone de datos comparativos de rendimiento publicados para este checkpoint concreto en la información proporcionada; la comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- El modelo está entrenado sobre un dataset concreto (`Haku-2004/k6_4seg`) y una morfología de robot específica; su generalización a otros robots, cámaras o entornos no está garantizada.
- No se documentan sesgos, pero al ser un modelo de imitación hereda los sesgos y la variabilidad de las demostraciones teleoperadas del dataset.
- Riesgo de alucinación no aplicable en el sentido de lenguaje; sin embargo, puede generar trayectorias no válidas fuera de la distribución de entrenamiento.
- No soporta idiomas ni texto; cualquier uso conversacional o de generación de lenguaje queda fuera de su ámbito.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar los derechos sobre el dataset y las imágenes utilizadas en el entrenamiento.
- No se documentan limitaciones de contexto ni de idioma por tratarse de un modelo robótico.
- Para producción, es necesario validar la política en el robot objetivo y con las condiciones de iluminación y calibración adecuadas; la model card no incluye métricas de éxito ni curvas de aprendizaje.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Haku-2004/act_k6s45_input_20)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas en LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset utilizado: Haku-2004/k6_4seg](https://huggingface.co/datasets/Haku-2004/k6_4seg)
