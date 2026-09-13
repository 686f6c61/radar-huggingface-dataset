# ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-no-coherence

## Resumen

El modelo `ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-no-coherence` es un checkpoint de política robótica publicado en HuggingFace por el usuario ImKyungjin, basado en π₀ (Pi0), el modelo de visión-lenguaje-acción (VLA) para control general de robots desarrollado por Physical Intelligence. La implementación empleada es la de LeRobot, la librería de HuggingFace, adaptada a su vez del repositorio OpenPI de Physical Intelligence. El checkpoint pesa 3.501.372.176 parámetros (aproximadamente 3,5 mil millones) y ocupa 7,0 GB en el repositorio, lo que es coherente con pesos almacenados en safetensors a 16 bits.

El propósito declarado de π₀ es actuar como política generalista: recibe imágenes de cámaras e instrucciones en lenguaje natural y emite comandos motores para distintos robots y tareas, en lugar de estar programado para una única secuencia repetitiva. Este checkpoint concreto parece ser un ajuste fino sobre el dataset `local/maniskill_stackcube_mixed_30pct`, cuyo nombre sugiere una mezcla de datos de la tarea StackCube de ManiSkill, aunque la model card no documenta ni la composición del dataset ni el significado de los sufijos "mixed-30pct" y "no-coherence".

La relevancia de esta ficha es limitada pero concreta: se trata de un checkpoint con 0 descargas y 0 likes, publicado el 13 de septiembre de 2026, sin resultados de benchmarks ni documentación específica más allá de la plantilla genérica de LeRobot. Es útil como ejemplo de flujo de trabajo de ajuste fino de π₀ en LeRobot y como punto de partida para reproducir experimentos, pero no debe considerarse un artefacto validado para producción sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀ (Pi0), variante de transformer multimodal con experto de acción; detalles concretos de capas y atención no disponibles |
| Parametros totales | 3.501.372.176 (aproximadamente 3,5 mil millones, dato real de safetensors) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible (no es una ventana de contexto textual al uso; la model card no especifica horizonte de observación ni número de pasos de acción) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (el modelo interpreta instrucciones en lenguaje natural; no se especifica qué idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería declarada: lerobot) |

Datos adicionales: pipeline declarado `robotics`, autor `ImKyungjin`, región `us`, tamaño del repositorio 7,0 GB, dataset asociado `local/maniskill_stackcube_mixed_30pct`, fecha de creación 2026-09-13 y última actualización 2026-09-13. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

La model card describe π₀ como un modelo de visión-lenguaje-acción para control general de robots: entiende entradas visuales, interpreta instrucciones en lenguaje natural y controla distintos tipos de robot en tareas diversas. La implementación de LeRobot está adaptada del repositorio OpenPI de Physical Intelligence, y la referencia técnica principal es el blog de Physical Intelligence sobre π₀. La información proporcionada no detalla la arquitectura interna (número de capas, tipo de atención, mecanismo de decodificación de acciones, uso de flow matching u otra formulación), ni el número de tokens de entrenamiento, ni la composición del dataset.

Tampoco consta información sobre técnicas de alineación (RLHF, DPO) ni sobre innovaciones específicas de este checkpoint. La única pista sobre el entrenamiento es el nombre del dataset asociado, `local/maniskill_stackcube_mixed_30pct`, que apunta a un ajuste sobre datos de la tarea StackCube de ManiSkill con algún tipo de mezcla al 30 por ciento, y el sufijo `no-coherence` del identificador, que sugiere la desactivación o exclusión de algún término de coherencia en la configuración de entrenamiento. Ninguno de estos extremos está documentado en la model card y, por tanto, deben tratarse como hipótesis a verificar por quien vaya a reutilizar el checkpoint.

Un detalle práctico: la model card incluye un comando de entrenamiento de ejemplo con `--policy.type=act`, que es un residuo de la plantilla genérica de LeRobot y no describe la política π₀ de este repositorio. Ese comando no debe copiarse tal cual para reproducir este modelo.

## Capacidades

- Control robótico guiado por visión: genera acciones motoras a partir de observaciones visuales, según la descripción de π₀ como política generalista.
- Seguimiento de instrucciones en lenguaje natural: el modelo está diseñado para interpretar órdenes verbales y traducirlas en comportamiento motor.
- Generalidad entre tareas y plataformas: la model card afirma que π₀ puede controlar distintos robots en tareas diversas, frente a políticas especializadas en una única tarea.
- Integración con el ecosistema LeRobot: entrenamiento e inferencia mediante `lerobot-train` y `lerobot-record`, con registro de episodios de evaluación.
- Compatibilidad con robots tipo `so100_follower` en los ejemplos de la model card (aunque se trata del ejemplo genérico de la plantilla).
- Capacidades de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, agentes multi-paso, visión general, audio o modo "thinking": no disponibles o no aplicables según la información proporcionada; se trata de un modelo de política robótica, no de un modelo de lenguaje conversacional.

## Casos de uso

- Manipulación tipo pick-and-place en logística: el modelo puede recibir la imagen de la cámara y una instrucción del tipo "coloca el cubo sobre la bandeja" y emitir la secuencia de acciones del brazo. Es adecuado porque π₀ está diseñado como política viso-motora generalista y este checkpoint parece ajustado sobre una tarea de apilado de cubos.
- Evaluación de tareas StackCube en ManiSkill: sirve como referencia para medir el efecto de mezclar datos al 30 por ciento en el rendimiento de apilado, siempre que se construya un protocolo de evaluación propio, ya que no hay métricas publicadas.
- Investigación sobre ajuste fino de modelos VLA: el checkpoint es un ejemplo reproducible del flujo `lerobot-train` sobre un dataset propio, útil para comparar hiperparámetros, número de episodios y composición de datos.
- Recogida de datos y teleoperación con brazos tipo SO-100: mediante `lerobot-record` se pueden grabar episodios de evaluación con `--policy.path` apuntando a este checkpoint, generando datasets etiquetados para iterar el entrenamiento.
- Prototipado en robótica educativa o de laboratorio: al caber en una GPU de consumo en precisión de 16 bits, permite montar una celda de experimentación con un brazo de bajo coste y una estación con RTX 4090 o similar.
- Base para ajuste específico de dominio: partir de estos 3,5 mil millones de parámetros y reentrenar con datos propios de una tarea industrial concreta, con la ventaja de no empezar desde cero.
- Comparación de estrategias de mezcla de datos: el sufijo `mixed-30pct` del identificador sugiere un experimento de ablación; el checkpoint puede usarse como una de las condiciones de comparación frente a otros porcentajes de mezcla, si el autor publica el resto de variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en StackCube, ni métricas de ManiSkill, ni comparaciones con otras políticas. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existe retroalimentación de la comunidad que permita inferir su rendimiento.

## Requisitos de hardware

- Peso de los pesos: 3.501.372.176 parámetros. En bfloat16 o float16 equivalen a aproximadamente 7,0 GB (coincide con el tamaño del repositorio). En float32 serían aproximadamente 14,0 GB.
- VRAM estimada para inferencia: alrededor de 8-12 GB en bfloat16 contando activaciones, buffers de imagen y overhead del runtime; el dato exacto no está documentado y depende del número de cámaras y de la resolución de entrada.
- GPU recomendadas para inferencia: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB), A10G (24 GB) o A100 40/80 GB. Cabe en GPU de consumo en bfloat16.
- GPU para reajuste completo: con optimizador Adam en float32 se necesitan del orden de 40-60 GB o más, por lo que se recomienda A100 80 GB o H100. El ajuste con LoRA o congelando el codificador visual es viable en 24 GB.
- Plataformas embebidas: Jetson AGX Orin de 64 GB es una opción razonable para despliegue a bordo en 16 bits; Jetson Orin NX de 16 GB requeriría cuantización adicional, no documentada para este checkpoint.
- Opciones de despliegue: LeRobot con PyTorch es la vía soportada (`lerobot-train` para entrenamiento, `lerobot-record` para inferencia y evaluación). No se documentan soportes para vLLM, TGI, llama.cpp, Ollama ni motores de inferencia de texto, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles. La model card no publica frecuencia de control, tiempo de inferencia por paso ni número de pasos de acción por predicción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pi0-maniskill-stackcube-mixed-30pct-no-coherence (este checkpoint) | 3.501.372.176 | No disponible | apache-2.0 | safetensors (LeRobot) | Publicado en HuggingFace, 0 descargas |
| π₀ original (Physical Intelligence / OpenPI) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado en la model card mediante el blog de Physical Intelligence y el repositorio OpenPI |
| ACT (LeRobot) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Citado únicamente en el comando de ejemplo `--policy.type=act` de la model card |
| Otras políticas de LeRobot | No disponible | No disponible | No disponible | No disponible | La model card remite a la documentación de LeRobot, sin listar alternativas concretas |

La información proporcionada no permite establecer una comparación cuantitativa fiable con alternativas. Cualquier comparación de tasa de éxito, latencia o robustez requeriría evaluar el checkpoint en el mismo entorno y con el mismo protocolo que los modelos de referencia.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes, sin benchmarks ni métricas publicadas. No hay evidencia externa de que el ajuste funcione correctamente.
- Model card genérica: el texto es la plantilla estándar de LeRobot para π₀ y no describe este checkpoint en particular. El comando de entrenamiento de ejemplo usa `--policy.type=act`, lo que indica que no fue adaptado al modelo real.
- Nomenclatura no documentada: el significado de `mixed-30pct` y `no-coherence` en el identificador no se explica. Cualquier interpretación (porcentaje de mezcla de datos, pérdida de coherencia desactivada) es una hipótesis sin confirmar.
- Dataset local: el dataset asociado es `local/maniskill_stackcube_mixed_30pct`, una referencia local que puede no ser accesible públicamente, lo que dificulta la reproducibilidad del ajuste.
- Sesgos y generalización: no hay información sobre la diversidad de datos, condiciones de iluminación, tipos de robot o variabilidad de objetos. Un ajuste sobre una única tarea (apilado de cubos) puede degradar la generalidad del π₀ original.
- Riesgo de alucinación motora: como toda política viso-motora, puede generar trayectorias plausibles pero incorrectas ante entradas fuera de distribución; requiere supervisión y paradas de seguridad en entornos físicos.
- Idiomas: no se especifica qué lenguas entiende para las instrucciones en lenguaje natural; es probable que el ajuste se haya hecho solo con las instrucciones presentes en el dataset, no disponibles.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del repositorio OpenPI y de los pesos originales de π₀ de los que deriva la implementación, ya que la model card no detalla la cadena de licencias.
- Uso en producción: no recomendado sin una evaluación propia en el robot y el entorno objetivo, con protocolo de seguridad validado.
- Fecha de publicación: el repositorio está fechado en septiembre de 2026; verificar si ha habido revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-no-coherence
- Blog de π₀ de Physical Intelligence, citado en la model card: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI, del que se adapta la implementación de LeRobot (citado en la model card, sin URL explícita en la información proporcionada): https://github.com/Physical-Intelligence/openpi
- LeRobot, repositorio de la librería: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron únicamente páginas del portal italiano Quattroruote sobre anuncios de coches usados, sin relación con el modelo.
