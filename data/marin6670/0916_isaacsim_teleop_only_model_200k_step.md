# marin6670/0916_isaacsim_teleop_only_model_200k_step

## Resumen

0916_isaacsim_teleop_only_model_200k_step es un ajuste fino de SmolVLA, el modelo vision-lenguaje-acción (VLA) compacto del ecosistema LeRobot, publicado por el usuario marin6670. Se trata de un checkpoint de robótica entrenado durante 200.000 pasos de optimizador sobre un dataset propio de teleoperación en Isaac Sim con el brazo SO101 y cuatro objetivos de manipulación: bloques, balón de baloncesto, lata de Coca-Cola y mando de TV Samsung.

El modelo no es un modelo de lenguaje conversacional: recibe tres flujos de cámara (frontal, superior y muñeca) junto con el estado del robot y produce secuencias de acciones (chunks) de 50 pasos para el control del brazo. Con 450.046.176 parámetros según el recuento de safetensors y un repositorio de 0,9 GB, está pensado para ejecutarse en hardware modesto y para servir de referencia reproducible en experimentos de imitation learning en simulación.

Su relevancia es doble: por un lado, documenta el flujo completo de fine-tuning de SmolVLA sobre un dataset propio, con la configuración de entrenamiento preservada en `provenance/`; por otro, es un ejemplo de publicación temprana sin evaluación, ya que el autor indica explícitamente que los resultados de evaluación están pendientes y que no se reclama ninguna tasa de éxito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo vision-lenguaje-acción) ajustado desde `lerobot/smolvla_base` |
| Parámetros totales | 450.046.176 (recuento real de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje conversacional) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Pasos de entrenamiento | 200.000 pasos de optimizador |
| Dataset | marin6670/0916_isaacsim_so101_teleop_block_basketball_coca_cola_samsung_tv_remote_control_dataset (200 episodios, 50 por objetivo) |
| Chunk de acciones | 50 pasos (chunk size 50 / action steps 50) |
| Entradas | 3 cámaras (front→camera1, top→camera2, wrist→camera3) más estado del robot |
| Robot objetivo | SO101 en Isaac Sim |
| Fecha de publicación | 16 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

SmolVLA es una familia de modelos vision-lenguaje-acción compactos distribuidos dentro del ecosistema LeRobot, pensados para control robótico por imitación con requisitos de cómputo reducidos. La información proporcionada no detalla la composición interna de la red más allá de dos hechos relevantes para este ajuste: el codificador visual se mantuvo congelado durante todo el entrenamiento y se activaron las opciones "train expert only" y "state projection", es decir, solo se actualizó el experto de acciones y la proyección del vector de estado, manteniendo intacta la representación visual del modelo base.

La configuración de entrenamiento reportada es la siguiente: 200.000 pasos de optimizador con tamaño de lote 8 y semilla 1000; tasa de aprendizaje inicial de 0,0001 con 1.000 pasos de warmup y decaimiento coseno hasta 0,0000025; chunk de acciones y horizonte de acción de 50 pasos. El dataset consta de 200 episodios de teleoperación en Isaac Sim, 50 por cada uno de los cuatro objetivos (bloque, balón de baloncesto, lata de Coca-Cola y mando de TV Samsung), con el mapeo de cámaras fijado a frontal, superior y muñeca. No se documenta el número total de tokens o frames de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO; se trata de aprendizaje por imitación a partir de demostraciones teleoperadas. El estado del optimizador y del generador de números aleatorios no se incluye en el repositorio: solo se publica el checkpoint de inferencia de 200.000 pasos junto con las estadísticas de preprocesado y postprocesado.

## Capacidades

- Control robótico por imitación: genera chunks de 50 acciones para el brazo SO101 a partir de observaciones visuales y de estado.
- Percepción multimodal con tres cámaras simultáneas (vista frontal, vista superior y vista de muñeca).
- Condicionamiento por estado del robot, con la proyección de estado activada durante el entrenamiento.
- Ejecución de cuatro tareas de manipulación específicas: manipulación de bloques, de un balón de baloncesto, de una lata de Coca-Cola y de un mando de TV Samsung.
- Inferencia en simulación sobre Isaac Sim, que es el entorno en el que se recogieron las demostraciones.
- No soporta tool calling ni function calling: el modelo base es un VLA, no un modelo de lenguaje instruido para llamadas a herramientas.
- No soporta agentes ni razonamiento multi-paso en el sentido conversacional.
- Sin capacidades multilingües documentadas y sin interfaz de lenguaje natural confirmada en la información disponible.
- Sin modo thinking, sin audio y sin visión general de imágenes: las entradas visuales están ligadas a las tres cámaras definidas en el pipeline de entrenamiento.

## Casos de uso

- Automatización de pick-and-place en simulación: el modelo puede colocar bloques en posiciones objetivo dentro de Isaac Sim usando la vista superior y de muñeca, lo que permite validar políticas antes de tocar hardware real.
- Recogida de objetos cotidianos en banca de pruebas: las cuatro tareas entrenadas (balón, lata, mando de TV y bloque) cubren objetos de geometría y agarre distintos, útiles para medir generalización dentro del mismo dominio simulado.
- Generación de datos sintéticos y aumento de dataset: al ejecutarse en Isaac Sim, las trayectorias generadas por la política pueden usarse como demostraciones adicionales para otros modelos o para análisis de fallos.
- Línea base de imitation learning: sirve como referencia reproducible (semilla, learning rate, batch y número de pasos documentados) para comparar variantes de fine-tuning de SmolVLA con encoder congelado frente a encoder descongelado.
- Evaluación de infraestructura LeRobot: al ser un checkpoint de la librería lerobot, permite probar el pipeline completo de carga de pesos, preprocesado y postprocesado de acciones sobre un robot SO101.
- Investigación en transferencia sim-to-real: el checkpoint puede emplearse como punto de partida para experimentos de adaptación al robot físico, midiendo la degradación al cambiar iluminación, texturas y dinámicas.
- Despliegue en hardware de borde para robótica: con 450 millones de parámetros y 0,9 GB de pesos, es viable ejecutarlo en GPUs de gama media integradas en una célula robótica.
- Estudio de robustez ante cambios de cámara: al tener fijado el mapeo front/top/wrist, se pueden hacer ablaciones sustituyendo o eliminando vistas para cuantificar su dependencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación están pendientes y que no se reclamó ninguna tasa de éxito en esta publicación inicial. En consecuencia, no se presentan cifras de éxito por tarea, ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 0,9 GB; en fp32, unos 1,8 GB. Hay que sumar las activaciones y el procesado de tres flujos de cámara simultáneos, por lo que una estimación conservadora se sitúa en el rango de 3 a 6 GB según resolución de imagen y tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para el modelo en sí (RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4, A10). El cuello de botella real suele ser el simulador Isaac Sim, no la política.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo modernas con 8 GB o más, dado el tamaño de 450 millones de parámetros.
- Opciones de despliegue: carga mediante la librería lerobot y PyTorch; el repositorio no documenta soporte para vLLM, llama.cpp, Ollama o TGI (son servidores orientados a modelos de lenguaje, no a políticas de acción). La ejecución en simulación requiere Isaac Sim.
- Latencia y throughput estimados: no disponibles. El chunk de 50 pasos define el horizonte de acción, pero no se publican mediciones de tiempo de inferencia ni de frecuencia de control alcanzada.
- Almacenamiento: el repositorio ocupa 0,9 GB, incluyendo el checkpoint final y las estadísticas de preprocesado y postprocesado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune de SmolVLA, 200k pasos) | 450.046.176 | no disponible | no disponible | safetensors | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `lerobot/smolvla_base` (modelo base) | mismo orden de magnitud (el ajuste no altera la topología) | no disponible | no disponible | safetensors | HuggingFace |
| OpenVLA | aproximadamente 7.000 millones (dato aproximado, no verificado en la información proporcionada) | no disponible | no disponible | no disponible | HuggingFace |
| pi0 (Physical Intelligence) | aproximadamente 3.000 millones (dato aproximado, no verificado en la información proporcionada) | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de rendimiento no es posible: este checkpoint no publica tasas de éxito y la búsqueda web realizada no devolvió información técnica relevante sobre modelos comparables, solo resultados sin relación con el tema.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, ni curva de aprendizaje, ni métricas por tarea. No debe citarse como referencia de rendimiento.
- Entrenamiento exclusivamente con teleoperación ("teleop-only"): no se usaron datos autónomos ni correcciones humanas durante la ejecución, lo que limita la capacidad de recuperación ante estados fuera de distribución.
- Dominio simulado: todos los datos provienen de Isaac Sim. El salto sim-to-real no está cuantificado y se esperan degradaciones por diferencias de iluminación, texturas, fricción y dinámica del robot físico.
- Dataset muy pequeño: 200 episodios en total, 50 por objetivo y solo cuatro objetos. La cobertura de posiciones, orientaciones y condiciones de agarre es reducida.
- Encoder visual congelado: la representación visual no se adaptó al dominio concreto del dataset, lo que puede penalizar la precisión en escenas con apariencia distinta a la de entrenamiento.
- Dependencia del mapeo de cámaras: el modelo espera exactamente las vistas frontal, superior y de muñeca en las posiciones camera1, camera2 y camera3. Cambiar la configuración de sensores invalida las estadísticas de preprocesado.
- Licencia no disponible: al no declararse una licencia, el uso comercial y la redistribución quedan en una situación jurídica ambigua; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas no disponibles y sin capacidades de lenguaje: no puede recibir instrucciones en lenguaje natural ni mantener conversaciones.
- Riesgo de alucinación en sentido estricto no aplica, pero sí existe riesgo de acciones erráticas, bloqueos o movimientos inseguros, especialmente en tareas para las que no fue entrenado.
- El estado del optimizador y del generador aleatorio no se publica, por lo que el entrenamiento no es reanudable a partir de este repositorio.
- Trazabilidad: el autor indica que las referencias de repositorio y job usan nombres de publicación distintos a los del entrenamiento original; la configuración original se conserva en `provenance/`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marin6670/0916_isaacsim_teleop_only_model_200k_step
- Dataset de entrenamiento: https://huggingface.co/datasets/marin6670/0916_isaacsim_so101_teleop_block_basketball_coca_cola_samsung_tv_remote_control_dataset
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: no se proporcionó enlace directo en la información disponible
- Paper o blog técnico: no disponible
- Demo o espacio interactivo: no disponible
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre avisos de un vehículo Honda Civic), por lo que no se incluye ninguno como referencia técnica.
