# dogeum/demo_0915_masked_act

## Resumen

`dogeum/demo_0915_masked_act` es una política de robótica entrenada con aprendizaje por imitación mediante el método ACT (Action Chunking with Transformers, arXiv:2304.13705) y publicada en el Hub con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política visomotora que, a partir de observaciones (imágenes de cámara y estado de las articulaciones), predice trozos de acciones (*action chunks*) en lugar de un único paso de control, lo que reduce el error de acumulación y permite ejecutar maniobras finas con hardware de bajo coste.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y su repositorio ocupa 0,2 GB en formato safetensors. Está asociado al dataset `dogeum/demo_0915_masked`, presumiblemente compuesto por demostraciones teleoperadas, aunque la model card no detalla el número de episodios, las tareas concretas ni las características del robot empleado durante el entrenamiento.

Su relevancia es la de un artefacto de investigación reproducible: se publica bajo licencia Apache-2.0, con 0 descargas y 0 *likes* en el momento de la consulta, y sirve como ejemplo práctico del flujo de trabajo de LeRobot (`lerobot-train` para entrenar y `lerobot-record` para evaluar sobre un robot real). No incluye métricas de éxito ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con componente CVAE según el método de arXiv:2304.13705 |
| Parámetros totales | 51.668.614 (≈51,7 M), dato real de safetensors |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (ACT opera con un horizonte fijo de observaciones y un tamaño de chunk k, no especificados en la información proporcionada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (política robótica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | dogeum/demo_0915_masked |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El método ACT, descrito en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (Zhao et al., 2023), combina un codificador visual basado en ResNet-18 con un transformer de tipo encoder-decoder. Durante el entrenamiento incorpora un esquema CVAE con una variable latente de estilo que ayuda a modelar la variabilidad entre demostraciones humanas; la función de pérdida combina reconstrucción L1 de las acciones con una regularización KL sobre esa variable latente. En inferencia, el modelo predice un chunk de k acciones futuras y el artículo propone *temporal ensembling* para agregar las predicciones solapadas de pasos consecutivos y suavizar la trayectoria.

El entrenamiento es de tipo aprendizaje por imitación (behavior cloning) a partir de datos teleoperados, no de refuerzo ni de RLHF/DPO. La información proporcionada no especifica el número de episodios, la composición del dataset `dogeum/demo_0915_masked`, el número de tokens o pasos de entrenamiento, la política de aumento de datos, ni el desglose de parámetros entre el *backbone* visual y el transformer. El sufijo `masked` del dataset sugiere algún tipo de enmascarado en las observaciones, pero su significado concreto no está documentado.

## Capacidades

- Predicción de chunks de acciones continuas para control robótico, en lugar de pasos individuales de control.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere un simulador ni un modelo del entorno.
- Consumo de observaciones multimodales: en la implementación de referencia de LeRobot, ACT procesa imágenes (`observation.images.*`) y estado de las articulaciones (`observation.state`).
- Ejecución de maniobras finas y tareas de manipulación de precisión cuando el dataset de entrenamiento las cubre.
- Capacidad de reentrenamiento y ajuste fino mediante `lerobot-train` sobre nuevos datasets de LeRobot.
- Evaluación sobre robot real con `lerobot-record`, registrando episodios en el Hub.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso en lenguaje, planificación simbólica, agentes conversacionales ni generación de texto.
- No soporta visión general (VQA, OCR), audio ni modo *thinking*.
- Capacidades multilingües: no aplicables.

## Casos de uso

- Manipulación robótica en laboratorio: la política puede ejecutar de forma autónoma tareas de pick-and-place aprendidas de demostraciones, siempre que el entorno de despliegue se parezca al de recogida de datos.
- Reproducción de demostraciones teleoperadas: sustituye al operador humano en tareas repetitivas una vez entrenada sobre el dataset correspondiente, reduciendo el coste por ciclo.
- Línea base de investigación en aprendizaje por imitación: al ser una implementación ACT de LeRobot, permite comparar de forma directa contra Diffusion Policy o SmolVLA bajo el mismo *pipeline* de datos.
- Ajuste fino sobre dominios propios: partiendo de estos pesos, se puede reentrenar con un dataset específico de una célula de fabricación o de un puesto de ensamblaje.
- Prototipado con hardware de bajo coste: el flujo de LeRobot incluye ejemplos de evaluación sobre robots tipo `so100_follower`, lo que abarata la validación experimental (el ejemplo de la model card usa ese tipo de robot; no se confirma que sea el usado en el entrenamiento).
- Docencia y formación en robótica: sirve como caso de estudio completo de un *pipeline* de imitación, desde la teleoperación hasta la inferencia en el robot.
- Evaluación de robustez: útil para medir la degradación de la política ante cambios de iluminación, posición de objetos o ligeras variaciones del entorno respecto al dataset original.
- Investigación en generalización de políticas visomotoras: al tener solo 51,7 M de parámetros, permite iterar experimentos con un coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, número de episodios de evaluación, ni comparación con otras políticas. El repositorio registra 0 descargas y 0 *likes*, por lo que tampoco existen métricas de uso de la comunidad.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 207 MB en fp32, unos 103 MB en fp16/bf16 y unos 52 MB en int8, calculados a partir de los 51,7 M de parámetros. Hay que sumar el coste de activaciones, el *backbone* visual y los búferes asociados al chunk de acciones; el desglose real no está documentado.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100, L4) sin necesidad de reparto entre dispositivos.
- La inferencia en CPU es viable por el reducido tamaño del modelo, aunque la latencia dependerá del *backbone* visual y del número de cámaras de entrada.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluación), sobre PyTorch. No aplican servidores de inferencia de LLM como vLLM, TGI, Ollama o llama.cpp, ya que la salida es un vector de acciones continuas y no texto.
- Latencia y throughput estimados: no disponibles.
- El cuello de botella real en producción no es el cómputo, sino la frecuencia del lazo de control del robot y la latencia de captura de las cámaras.

## Comparativa con modelos similares

No se dispone de datos numéricos de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a aspectos cualitativos de categoría.

| Modelo | Enfoque | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| `dogeum/demo_0915_masked_act` (este modelo) | ACT, aprendizaje por imitación con chunks de acciones | 51.668.614 | apache-2.0 | Hugging Face + LeRobot |
| Diffusion Policy (Cheng et al., 2023) | Aprendizaje por imitación basado en modelos de difusión | no disponible | no disponible | implementación disponible en LeRobot |
| SmolVLA (Hugging Face) | Modelo visión-lenguaje-acción de Hugging Face, integrado en LeRobot | no disponible | no disponible | Hugging Face + LeRobot |
| pi0 / pi0.5 (Physical Intelligence) | Modelo visión-lenguaje-acción de gran escala | no disponible | no disponible | Hugging Face + openpi |
| GR00T N1 (NVIDIA) | Modelo fundacional para robótica humanoide | no disponible | no disponible | Hugging Face / NVIDIA |

La diferencia principal de este modelo frente a las alternativas VLA (SmolVLA, pi0, GR00T N1) es que ACT no procesa instrucciones en lenguaje: está especializado en una única tarea o conjunto reducido de tareas definidas por el dataset, a cambio de un tamaño mucho menor y de un coste de entrenamiento sensiblemente inferior.

## Limitaciones y advertencias

- Política especializada: solo reproduce comportamientos presentes en el dataset `dogeum/demo_0915_masked`; fuera de esa distribución la tasa de éxito cae de forma abrupta.
- No hay métricas publicadas de éxito, robustez ni generalización; no se puede evaluar su calidad sin ejecutarla en el robot correspondiente.
- Dependencia fuerte del montaje físico: cambios en la cinemática del robot, la posición de las cámaras o la calibración invalidan los pesos.
- Sesgos conocidos: los derivados de las demostraciones humanas (estilo de teleoperación, velocidades, sesgos de posición). El modelo imita al operador, incluidas sus ineficiencias.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser un modelo generativo de acciones, puede producir movimientos inseguros ante observaciones fuera de distribución.
- Sin soporte multilingüe ni de lenguaje: no admite instrucciones textuales ni *prompts*.
- Licencia apache-2.0 para los pesos, lo que permite uso comercial de los mismos; no obstante, la licencia del dataset `dogeum/demo_0915_masked` no se especifica en la información disponible y debe verificarse por separado.
- Repositorio sin tracción (0 descargas, 0 *likes*) y con una única revisión: no hay validación externa ni mantenimiento conocido.
- Las fechas de creación y actualización del repositorio (19 de septiembre de 2026) corresponden al momento de publicación en el Hub.
- Antes de usar el modelo en un robot real hay que aplicar límites de par, paradas de emergencia y validación en espacio restringido: es una política aprendida, sin garantías formales de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dogeum/demo_0915_masked_act
- Dataset asociado: https://huggingface.co/datasets/dogeum/demo_0915_masked
- Artículo ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 / https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos correspondían a sitios de streaming sin relación con robótica o aprendizaje automático.
