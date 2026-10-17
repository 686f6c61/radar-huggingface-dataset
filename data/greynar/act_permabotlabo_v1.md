# Greynar/act_PermaBotLabo_v1

## Resumen

Greynar/act_PermaBotLabo_v1 es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado con la librería LeRobot de Hugging Face y publicado en el Hub por el usuario Greynar, asociado al dataset Greynar/PermaBotLabo_v1. No se trata de un modelo de lenguaje: es una política de control visuomotor para robots manipuladores.

El problema que resuelve es el control de un brazo robótico a partir de demostraciones teleoperadas, sin necesidad de definir reglas de control manualmente. ACT se entrena sobre pares observación-acción y, en inferencia, produce secuencias de acciones que se ejecutan de forma conjunta, lo que reduce la acumulación de error respecto a políticas que predicen un único paso. Según el artículo de referencia (arXiv 2304.13705), este enfoque alcanza tasas de éxito elevadas en tareas de manipulación con datos de teleoperación.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que caben holgadamente en GPU de consumo. La licencia es Apache 2.0. Los metadatos del Hub indican fecha de creación del 16 de octubre de 2026, cero descargas y cero "likes" en el momento de la consulta. La información pública disponible sobre el entrenamiento concreto, el hardware objetivo y los resultados obtenidos es muy limitada: la model card reproduce la plantilla estándar de LeRobot y no aporta detalles del dataset ni métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para aprendizaje por imitación (ACT, Action Chunking with Transformers); predice chunks de acciones |
| Parámetros totales | 51.668.614 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT opera sobre ventanas de observaciones, sin valor publicado) |
| Tipos de cuantización | no disponible (no se documentan pesos GGUF, AWQ, GPTQ ni similares en el repositorio) |
| Idiomas soportados | no aplica / no disponible (política robótica visuomotora; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | Greynar/PermaBotLabo_v1 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrito en el artículo referenciado por el modelo (arXiv 2304.13705), es un método de aprendizaje por imitación que combina un transformer con un esquema de codificación estilo CVAE y una predicción por bloques de acciones. En lugar de emitir una acción por paso de control, el modelo genera un chunk de k acciones futuras a partir de la observación actual (habitualmente imágenes de cámara y el estado de las articulaciones), y esas acciones se ejecutan de forma agregada. El artículo propone además el ensamblado temporal (temporal ensembling) para suavizar la transición entre chunks consecutivos durante la inferencia.

El entrenamiento se realiza con la herramienta `lerobot-train` de LeRobot, seguido de evaluación con `lerobot-record`, tal y como indica la propia model card. El número de tokens de entrenamiento, la composición exacta del dataset Greynar/PermaBotLabo_v1, el número de episodios de teleoperación, la resolución de las cámaras y si se aplicaron fases de ajuste adicionales (RLHF, DPO u otras) no están documentados en la información disponible. Tampoco se detalla la configuración de hiperparámetros, el número de pasos de entrenamiento ni el robot concreto utilizado.

## Capacidades

- Control visuomotor de robots manipuladores mediante aprendizaje por imitación.
- Predicción de chunks de acciones (varias acciones por inferencia), lo que reduce la frecuencia de recálculo y la acumulación de error.
- Ejecución de tareas de manipulación aprendidas de demostraciones teleoperadas, con tasas de éxito altas según el artículo de ACT.
- Integración nativa con el ecosistema LeRobot: entrenamiento, serialización y evaluación con las mismas herramientas (`lerobot-train`, `lerobot-record`).
- Compatible con robots del ecosistema LeRobot, como la configuración `so100_follower` que aparece en el ejemplo de evaluación de la model card.
- No dispone de tool calling, function calling ni capacidades de agente en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de generación de texto, de código, de matemáticas ni de visión descriptiva: su salida son comandos de acción.
- No se documentan capacidades multimodales adicionales (audio, vídeo generativo) ni modos de razonamiento explícito.

## Casos de uso

- Manipulación robótica con brazos de bajo coste: la política se puede desplegar sobre robots tipo SO-100/SO-101 mediante LeRobot, ejecutando tareas de pick-and-place aprendidas de demostraciones, con un coste de cómputo mínimo gracias a sus 51,7 millones de parámetros.
- Automatización de laboratorio: recogida, traslado y colocación de muestras o material fungible en un banco de trabajo, aprovechando que el modelo predice chunks de acciones y produce movimientos más suaves que una política paso a paso.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar ACT frente a otras políticas del mismo ecosistema, ya que se entrena y evalúa con los mismos comandos de LeRobot.
- Ajuste fino con datos propios: al estar publicado con licencia Apache 2.0 y en safetensors, se puede reentrenar sobre un dataset específico de una tarea nueva sin restricciones de uso comercial.
- Teleoperación asistida y semiautónoma: el modelo puede completar de forma autónoma secuencias ya demostradas mientras el operador interviene solo en los tramos que fallan.
- Agricultura de precisión y entornos de permacultura: por el nombre del dataset asociado (PermaBotLabo), el caso plausible es el de un robot de laboratorio o de campo que realice tareas repetitivas de manipulación de plantas, sustratos o muestras, sobre hardware de gama baja.
- Prototipado rápido en robótica educativa: al requerir poca VRAM y ofrecer un flujo de entrenamiento en línea de comandos, es adecuado para prácticas docentes donde el alumnado entrena y evalúa una política en una sola sesión.
- Despliegue en el borde (edge): el tamaño de los pesos permite ejecutar la inferencia en GPUs integradas o incluso en CPU, útil para robots con cómputo embebido limitado, siempre que se valide la latencia real en el hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de éxito por tarea, ni comparaciones cuantitativas, ni métricas de simulación o de robot real. El repositorio registra 0 descargas y 0 likes, por lo que no existen datos de uso que permitan inferir un rendimiento en producción. La búsqueda web realizada no devolvió fuentes técnicas relevantes sobre este modelo concreto (solo resultados no relacionados de LinkedIn).

## Requisitos de hardware

- Memoria para los pesos (estimación calculada a partir de 51.668.614 parámetros): aproximadamente 207 MB en fp32, 103 MB en fp16/bf16 y 52 MB en int8.
- VRAM estimada para inferencia: por debajo de 1 GB solo para los pesos; con buffers de activaciones, normalización de observaciones e imágenes de entrada, es razonable reservar entre 2 y 4 GB. No se dispone de una medición publicada.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente en principio; una RTX 3060, RTX 4060 o superior ofrece margen sobrado. No se requiere A100 ni H100 para la inferencia.
- Cabe en GPU de consumo: sí. También es viable la inferencia en CPU para frecuencias de control bajas, aunque la latencia dependerá del preprocesado de imagen.
- Opciones de despliegue: LeRobot con PyTorch (`lerobot-record --policy.path=...`), tal y como documenta la model card. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje ni se distribuyen pesos GGUF. La exportación a ONNX o TensorRT no está documentada en la información disponible.
- Latencia y throughput: no disponibles. Dependen por completo del robot, la frecuencia de control, la resolución de cámara y el hardware de inferencia, y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Greynar/act_PermaBotLabo_v1 | ACT (aprendizaje por imitación, transformer) | 51,7 M | no disponible | Apache 2.0 | Hub de Hugging Face, 0 descargas |
| Diffusion Policy | Política de difusión para control robótico | no disponible en la información proporcionada | no disponible | no disponible | Artículo y repositorio públicos |
| Políticas VLA (por ejemplo SmolVLA o π0) | Visión-lenguaje-acción | no disponible en la información proporcionada | no disponible | no disponible | Hub de Hugging Face y repositorios públicos |
| Otras políticas ACT de LeRobot | ACT | variable según el caso | no disponible | habitualmente Apache 2.0 | Hub de Hugging Face |

No se dispone de datos numéricos verificables para esta comparativa; los valores de parámetros, contexto y rendimiento de las alternativas no constan en la información proporcionada y no se han estimado. La diferencia cualitativa principal es que ACT es una política ligera entrenada por imitación sobre datos teleoperados, mientras que las políticas VLA incorporan un componente de lenguaje que permite condicionar la tarea mediante instrucciones textuales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones escritas y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Sobreajuste al dominio: al ser una política entrenada sobre un dataset concreto (PermaBotLabo_v1), su comportamiento fuera de las condiciones de ese dataset (iluminación, disposición de objetos, robot distinto) no está garantizado y no se ha documentado.
- Ausencia de métricas: no hay tasas de éxito publicadas, ni número de episodios de evaluación, ni comparación con una línea base. Cualquier uso en producción requiere una validación propia.
- Riesgo de fallo silencioso: en robótica, una política que falla puede provocar colisiones o daños físicos. Es imprescindible implementar límites de par, paradas de emergencia y supervisión humana durante las pruebas.
- Idiomas: no aplica; no procesa lenguaje natural, por lo que no existe soporte multilingüe que evaluar.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y se incluya una copia de la licencia. No se documentan restricciones adicionales del autor.
- Procedencia y madurez: el repositorio tiene 0 descargas y 0 likes, sin historial de uso ni mantenimiento conocido. No hay garantía de soporte, actualizaciones ni compatibilidad futura con versiones de LeRobot.
- Fecha de referencia: los metadatos del Hub indican creación el 16 de octubre de 2026; conviene verificar ese dato antes de citarlo.
- Sesgos: no hay información sobre la diversidad de los datos de teleoperación (operadores, entornos, objetos), por lo que no se pueden evaluar sesgos de comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Greynar/act_PermaBotLabo_v1
- Dataset asociado: https://huggingface.co/datasets/Greynar/PermaBotLabo_v1
- Artículo de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Ficha del artículo en Hugging Face Papers: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: la búsqueda web realizada no proporcionó enlaces adicionales relevantes sobre este modelo; los resultados obtenidos no guardaban relación con el mismo.
