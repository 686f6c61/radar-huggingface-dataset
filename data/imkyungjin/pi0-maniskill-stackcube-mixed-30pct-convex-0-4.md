# ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.4

## Resumen

El modelo `ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.4` es un ajuste fino de π₀ (Pi0), un modelo Vision-Language-Action (VLA) para control robótico general desarrollado originalmente por Physical Intelligence. La implementación utilizada para entrenar y publicar este checkpoint es la de LeRobot, la librería de robótica de Hugging Face, adaptada del repositorio abierto OpenPI del propio laboratorio. El modelo acepta observaciones visuales e instrucciones en lenguaje natural y produce acciones motoras, en lugar de texto.

El checkpoint tiene 3.501.372.176 parámetros almacenados en formato safetensors (aproximadamente 3,5 mil millones, con un repositorio de 7,0 GB, consistente con pesos en bf16/fp16). El identificador del repositorio sugiere un entrenamiento sobre un dataset mixto de la tarea StackCube de ManiSkill, con un porcentaje de mezcla del 30 % y un parámetro adicional ("convex-0.4") que no se documenta en la model card. La licencia es Apache-2.0.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino publicado en el Hub con 0 descargas y 0 me gusta en el momento de la consulta, sin resultados de evaluación publicados y sin documentación del recetario de entrenamiento más allá de la plantilla estándar de LeRobot. Es útil como referencia para reproducir pipelines de entrenamiento de políticas VLA con LeRobot y como punto de partida para evaluar técnicas de mezcla de datos en tareas de manipulación, pero no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) para control robótico; detalles internos (backbone, mecanismo de acción) no disponibles en la información proporcionada |
| Parametros totales | 3.501.372.176 |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors sin versiones cuantizadas documentadas |
| Idiomas soportados | No disponible: el modelo consume instrucciones en lenguaje natural, pero no se especifican idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repositorio de 7,0 GB, consistente con bf16/fp16) |

## Arquitectura y entrenamiento

La model card describe π₀ como un modelo Vision-Language-Action para control robótico general, el primero de este tipo desarrollado por Physical Intelligence, y lo presenta como una política generalista capaz de interpretar entradas visuales e instrucciones en lenguaje natural para controlar distintos robots y tareas. La implementación empleada aquí procede de LeRobot, que a su vez adapta el repositorio OpenPI de Physical Intelligence. La información proporcionada no detalla el backbone de visión o de lenguaje, el mecanismo de generación de acciones, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

El identificador del modelo apunta a un ajuste fino sobre `local/maniskill_stackcube_mixed_30pct`, un dataset local (no público en el Hub) vinculado a la tarea StackCube de ManiSkill, con una mezcla del 30 % y un parámetro "convex-0.4" cuyo significado no se especifica. La model card no incluye hiperparámetros, configuración de entrenamiento, número de pasos ni curvas de pérdida, por lo que el recetario exacto queda como no disponible. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) para este checkpoint concreto.

## Capacidades

- Control robótico guiado por visión: genera acciones motoras a partir de observaciones visuales, propiocepción y una instrucción en lenguaje natural.
- Interpretación de instrucciones en lenguaje natural dentro del contexto de una tarea de manipulación.
- Política generalista en su formulación original (π₀ base), pensada para operar sobre distintos robots y tareas; este checkpoint está especializado en la tarea y el dataset indicados en su nombre.
- Ejecución de tareas de manipulación tipo apilado de cubos (StackCube) en el entorno de ManiSkill, según se deduce del dataset declarado.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación o registro con `lerobot-record`.
- Ejemplo de evaluación documentado sobre un robot SO-100 seguidor (`so100_follower`), lo que indica compatibilidad con esa plataforma en el flujo de LeRobot.
- Soporte de tool calling o function calling: no disponible / no aplica a un modelo de política robótica.
- Soporte de agentes multi-paso basados en texto: no disponible / no aplica.
- Capacidades multilingües: no documentadas.
- Modo de razonamiento explícito (thinking), visión general o audio: no disponibles.

## Casos de uso

- Investigación en aprendizaje por imitación: usar el checkpoint como referencia reproducible de un ajuste fino de π₀ con LeRobot sobre una tarea de manipulación concreta, comparando curvas de éxito frente a variantes entrenadas con otras mezclas de datos.
- Evaluación de estrategias de mezcla de datos: el sufijo "mixed_30pct" permite estudiar cómo afecta el porcentaje de mezcla del dataset al rendimiento en la tarea objetivo, manteniendo el resto del pipeline constante.
- Apilado de cubos en simulación: ejecutar la política en ManiSkill sobre la tarea StackCube para medir tasas de éxito antes de plantear cualquier transferencia a hardware.
- Transferencia sim-a-real como línea de base: emplear el checkpoint como punto de partida para ajustes posteriores con datos reales capturados mediante LeRobot y un robot SO-100, comparando la degradación respecto al entorno simulado.
- Docencia y formación en robótica: ilustrar de forma práctica el ciclo completo de un pipeline VLA (dataset, entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) en cursos o talleres técnicos.
- Validación de infraestructura de entrenamiento e inferencia: al tener 3,5 mil millones de parámetros y pesos en safetensors de 7,0 GB, sirve para probar entornos LeRobot, asignación de GPU y almacenamiento con un modelo de tamaño moderado.
- Pruebas de regresión en plataformas robóticas: integrar el checkpoint en una batería automatizada de evaluaciones de política para detectar degradaciones cuando se actualiza la librería o el entorno de simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de ManiSkill, comparaciones con la política π₀ base ni ningún otro dato cuantitativo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, sin incluir activaciones del codificador visual ni cachés): en fp32, en torno a 14 GB; en bf16/fp16, en torno a 7 GB; en int8, unos 3,5 GB; en int4, unos 1,75 GB. Los formatos cuantizados no están documentados por el autor.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con margen suficiente.
- ¿Cabe en GPU de consumo? Sí, en bf16 cabría en tarjetas de 12-16 GB o superiores (RTX 4080, 4070 Ti Super, 3090, 4090), siempre que el resto del pipeline de robótica no consuma VRAM adicional de forma significativa. El repositorio de 7,0 GB es coherente con pesos en bf16/fp16.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para inferencia y evaluación) sobre PyTorch con CUDA. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI, y es esperable que no sean aplicables al tratarse de una política con salida de acciones y no de un modelo de lenguaje causal estándar.
- Latencia y throughput: no disponibles. En control robótico la latencia de inferencia es un requisito crítico, ya que condiciona la frecuencia de control del robot; no hay datos publicados al respecto para este checkpoint.
- Almacenamiento: el repositorio ocupa 7,0 GB, más el dataset de entrenamiento y los checkpoints intermedios en caso de reentrenar.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte de la información proporcionada y deben verificarse en sus fichas oficiales antes de usarlos en una decisión técnica.

| Modelo | Desarrollador | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0-maniskill-stackcube-mixed-30pct-convex-0.4 (este modelo) | ImKyungjin (ajuste fino sobre π₀) | 3.501.372.176 | No disponible | Apache-2.0 | Hugging Face, safetensors, librería lerobot |
| π₀ base | Physical Intelligence | No disponible en la información proporcionada (el checkpoint ajustado tiene 3,5 mil millones de parámetros) | No disponible | No disponible en la información proporcionada | Repositorio OpenPI citado en la model card |
| Otros modelos VLA del ecosistema LeRobot | Varios | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

Rendimiento comparado: no disponible, al no existir benchmarks publicados para este checkpoint ni datos de evaluación en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el nombre del repositorio indica un entrenamiento orientado a la tarea StackCube de ManiSkill con una mezcla concreta de datos, por lo que la generalización a otras tareas o entornos no está respaldada por ninguna evaluación publicada.
- Sin benchmarks: no hay tasas de éxito ni métricas de ningún tipo, de modo que no es posible cuantificar su rendimiento ni compararlo con la política base.
- Sesgos desconocidos: no se documenta la composición del dataset `local/maniskill_stackcube_mixed_30pct`, por lo que no pueden evaluarse sesgos de distribución, de objetos ni de escenarios.
- Riesgo de comportamiento errático fuera de distribución: como toda política aprendida por imitación, puede producir acciones incoherentes ante observaciones distintas de las de entrenamiento, con riesgo físico si se despliega en un robot real.
- Idiomas no documentados: se desconoce en qué lenguas acepta instrucciones y con qué calidad.
- Sin validación de la comunidad: 0 descargas y 0 me gusta en el momento de la consulta, sin issues ni discusiones públicas.
- Cuantización no documentada: no se ofrecen versiones GGUF, AWQ, GPTQ ni similares, lo que limita el despliegue en hardware con poca VRAM o en dispositivos embebidos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se distribuye "tal cual", sin garantías; la responsabilidad por fallos en un robot físico recae íntegramente en quien lo despliega.
- Trazabilidad limitada: no se documentan hiperparámetros, número de pasos de entrenamiento ni el significado del sufijo "convex-0.4", lo que dificulta la reproducción del experimento.
- Metadatos a verificar: las fechas de creación y actualización del repositorio (13-09-2026) y la ausencia de métricas de uso impiden validar su historial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex-0.4
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo (aparecen referencias a ChatGPT, subreddits y foros sin relación con robótica o modelos VLA), por lo que no se incluyen.
