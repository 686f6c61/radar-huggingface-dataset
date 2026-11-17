# lucazanett/act_wiping_bs_high_c50_01

## Resumen

El modelo `lucazanett/act_wiping_bs_high_c50_01` es una política de aprendizaje por imitación entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv 2304.13705. Lo desarrolla el usuario lucazanett y está alojado en Hugging Face dentro del ecosistema LeRobot, la librería de Hugging Face para robótica. El modelo resuelve el problema de generar acciones motoras continuas a partir de observaciones visuales: en lugar de predecir un único paso, predice fragmentos cortos de acción (action chunks), lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación.

Se trata de una política concreta entrenada sobre el dataset `lucazanett/new_setup_baseline_high`, orientada a una tarea de limpieza o frotado ("wiping") en un entorno de laboratorio. El nombre del checkpoint sugiere una variante con tamaño de chunk 50 y una configuración "bs_high" (probablemente batch size alto), aunque estos detalles no están documentados de forma explícita en la model card. Cuenta con 51.631.754 parámetros y un repositorio de 0,2 GB, lo que lo sitúa en la gama de políticas compactas aptas para inferencia en tiempo real sobre hardware de consumo.

Su relevancia actual radica en que ejemplifica el flujo de trabajo estándar de LeRobot para entrenar y desplegar políticas robóticas de código abierto con licencia Apache 2.0, permitiendo reproducir el pipeline completo desde la teleoperación hasta la evaluación en un robot SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.631.754 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (habitualmente ResNet) con un transformer que actúa como decodificador de acciones. La innovación central es la predicción de chunks de acción: el modelo emite k acciones futuras de golpe (en este caso, presumiblemente k=50 según el sufijo `c50` del nombre) en lugar de una sola, lo que mitiga el problema de compounding errors típico de las políticas de imitación y produce movimientos más suaves y coherentes. El transformer usa consultas aprendidas (query tokens) para generar las acciones condicionadas en las observaciones visuales y en el estado de las articulaciones.

El entrenamiento se realiza sobre datos de teleoperación recogidos con LeRobot, en este caso del dataset `lucazanett/new_setup_baseline_high`. No se documenta en la model card el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de augmentación o regularización específicas. El sufijo `bs_high` sugiere un batch size elevado durante el entrenamiento, pero este dato no está confirmado. No se menciona RLHF, DPO ni ningún otro ajuste posterior; es aprendizaje supervisado puro por imitación.

## Capacidades

- Generación de secuencias de acciones motoras continuas a partir de observaciones visuales en entornos de manipulación robótica.
- Predicción de chunks de acción (action chunking) para movimientos suaves y reducción del error acumulado.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas ni entorno simulado.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Compatible con robots tipo SO-100 (so100_follower) según los comandos de ejemplo de la model card.
- No dispone de capacidades de lenguaje natural, tool calling, agentes, visión general, audio ni modos de razonamiento; es una política motora especializada.

## Casos de uso

- Automatización de tareas de frotado o limpieza en laboratorio: el modelo ejecuta la política aprendida sobre el robot SO-100 para realizar movimientos de wiping sobre superficies, usando las observaciones de cámara como entrada y prediciendo chunks de acción de forma continua.
- Reproducción de experimentos de aprendizaje por imitación: investigadores pueden clonar el repositorio, cargar el checkpoint con `lerobot-record` y comparar la tasa de éxito frente a otras políticas ACT entrenadas con distintos hiperparámetros.
- Base para fine-tuning en tareas similares: al ser una política ACT con licencia Apache 2.0, puede servir como punto de partida para reentrenar sobre nuevos datasets de teleoperación con `lerobot-train`.
- Evaluación comparativa de configuraciones de chunk: el sufijo `c50` permite estudiar el efecto del tamaño de chunk en la estabilidad de la política, comparándolo con variantes de chunk menor o mayor.
- Despliegue en robots de bajo coste: con ~51,6 M parámetros y 0,2 GB de pesos, la política puede ejecutarse en GPUs de consumo o incluso en CPU para inferencia de baja frecuencia, facilitando prototipos educativos.
- Docencia y demostraciones de robótica: sirve como ejemplo didáctico del pipeline completo de LeRobot (teleoperación, entrenamiento, evaluación) en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,6 M parámetros en fp32 ocupan aproximadamente 0,2 GB), por lo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. Para entrenamiento se recomienda al menos 8-16 GB de VRAM según el batch size.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer, e incluso es viable en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con robots SO-100; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_wiping_bs_high_c50_01 (este) | 51,6 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | ~50 M (variable) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no disponible | no disponible | Apache 2.0 | Hugging Face |
| VQ-BeT (LeRobot) | variable | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparativa se limita a aspectos de disponibilidad y licencia.

## Limitaciones y advertencias

- Es una política especializada en una única tarea (wiping) y un único entorno; no generaliza a otras tareas ni setups sin reentrenamiento.
- No hay datos publicados sobre tasa de éxito, robustez ante variaciones de iluminación, posición de objetos o cambios en el entorno.
- Riesgo de sobreajuste al dataset de teleoperación concreto (`new_setup_baseline_high`); el comportamiento fuera de la distribución de entrenamiento es desconocido.
- No dispone de capacidades de lenguaje, visión general ni interacción multimodal; no debe evaluarse como modelo de propósito general.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la ficha.
- Los detalles de configuración (tamaño de chunk, batch size, número de episodios) no están documentados de forma explícita, lo que dificulta la reproducibilidad exacta.
- No se documentan sesgos específicos, pero al derivar de datos de teleoperación humanos puede heredar sesgos de movimiento o preferencias del operador.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lucazanett/act_wiping_bs_high_c50_01)
- [Paper ACT (arXiv 2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento](https://huggingface.co/datasets/lucazanett/new_setup_baseline_high)
