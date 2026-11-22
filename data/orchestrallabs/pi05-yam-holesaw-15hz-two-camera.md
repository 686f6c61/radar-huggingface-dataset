# orchestrallabs/pi05-yam-holesaw-15hz-two-camera

## Resumen

π0.5 YAM holesaw 15 Hz two-camera es una política robótica de imitación publicada por Orchestral Labs, derivada del modelo base π0.5 de Physical Intelligence mediante ajuste fino completo de parámetros. El modelo controla el brazo izquierdo de un robot YAM para recoger sierras de corona (hole saws) de una cinta transportadora en movimiento y depositarlas en una caja roja, mientras el brazo derecho permanece estacionario. Se trata de un modelo especializado en una tarea concreta, no de un modelo de propósito general.

La política recibe una observación visual y predice 15 comandos consecutivos de siete dimensiones a una frecuencia de 15 Hz. Utiliza dos cámaras (vista superior y muñeca izquierda), con la entrada de la muñeca derecha enmascarada tanto en entrenamiento como en inferencia. El modelo se distribuye en formato de pesos de OpenPI y está pensado para integrarse en el stack de despliegue de OpenPI.

Es relevante por dos motivos: por un lado, ejemplifica el flujo actual de especialización de modelos fundacionales de robótica mediante ajuste fino sobre datasets de manipulación reales; por otro, publica métricas de evaluación offline reproducibles (MAE articular, MAE de pinza, precisión de apertura/cierre) junto con la configuración exacta de entrenamiento, lo que facilita la auditoría y la comparación con la variante de tres cámaras del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de imitación derivada de π0.5; el modelo base π0.5 es un VLA transformer con mezcla de expertos, dato no confirmado en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de acción: 15 pasos de 7 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico; instrucción en inglés) |
| Licencia | Gemma Terms of Use (incluye restricciones de uso de la sección 3.2 y política de uso prohibido de Google) |
| Formato de pesos | pesos OpenPI en `params/` (tamaño del repo: 12,4 GB) |
| Frecuencia de control | 15 Hz |
| Cámaras de entrada | 2 (`base_0_rgb`, `left_wrist_0_rgb`; `right_wrist_0_rgb` enmascarada) |
| Resolución de entrada | 224 × 224 RGB con `resize_with_pad` |
| Dimensión de acción | 32 (`model_action_dim=32` en la importación a Orchestral) |
| Dataset de entrenamiento | `orchestrallabs/holesaw-conveyor-praxis-yam-15hz` (101 grabaciones de entrenamiento, 11 de evaluación) |

## Arquitectura y entrenamiento

El modelo parte de los pesos base de π0.5 de Physical Intelligence y se somete a un ajuste fino de todos los parámetros durante 10.000 actualizaciones, con un tamaño de lote global de 32 y semilla 42. El entrenamiento usa 101 grabaciones fuente y reserva 11 grabaciones para evaluación, manteniendo juntos los segmentos de una misma grabación para evitar fuga de información entre conjuntos. El cargador consume directamente las filas publicadas a 15 Hz del dataset, sin remuestreo adicional.

La interfaz de robot es explícita: la entrada cruda es `observation.joint_state` y el objetivo es `action.joint`, cada uno con seis ángulos articulares de YAM seguidos de una pinza continua donde 1 significa abierta. El cargador aplica `1 - g` a la pinza tanto en el estado como en el objetivo antes de la normalización. Cada uno de los seis objetivos articulares es relativo al estado articular de la consulta, mientras que el objetivo de pinza es absoluto. Para la importación en Orchestral se usa la familia OpenPI con `policy_config=none` y `model_action_dim=32`; el checkpoint aporta su propio mapeo de cámaras y horizonte de acción. El cliente envía el estado con la pinza convertida a convenciones de π y, para las acciones devueltas, suma los ángulos articulares de la consulta a los seis deltas predichos y convierte cada pinza con `clip(1 - g, 0, 1)`.

## Capacidades

- Control robótico de manipulación de una sola tarea: recogida de sierras de corona de una cinta transportadora en movimiento y colocación en una caja roja.
- Predicción de secuencias de acción: genera 15 comandos consecutivos de siete dimensiones por observación, a 15 Hz.
- Fusión de dos vistas: integra una cámara superior y una cámara de muñeca izquierda en una representación de 224 × 224 con preservación de relación de aspecto.
- Control articular relativo con pinza absoluta: los seis deltas articulares se suman al estado de la consulta; la pinza se predice en escala absoluta 0–1.
- Enmascaramiento de entrada: la cámara de muñeca derecha se ignora de forma consistente en entrenamiento e inferencia.
- Seguimiento de instrucción en lenguaje natural: la política está condicionada por la instrucción `Pick up the hole saws from the moving conveyor belt and place them in the red case`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el modelo no es un LLM de propósito general.

## Casos de uso

- Automatización de línea de recogida en cinta transportadora: la política está entrenada específicamente para sincronizar la recogida con el movimiento de la cinta, por lo que puede integrarse en una celda donde el brazo izquierdo extrae piezas de una cinta en marcha y las deposita en un contenedor fijo.
- Control de brazo único con brazo secundario estacionario: útil en configuraciones bimanuales donde solo se dispone de un manipulador activo y el segundo permanece aparcado, evitando reentrenar una política bimanual completa.
- Prototipado rápido de tareas pick-and-place sobre hardware YAM: al publicarse la configuración exacta de importación (`policy_config=none`, `model_action_dim=32`, conversión de pinza), sirve como plantilla para desplegar políticas π0.5 ajustadas en el mismo robot.
- Evaluación offline de políticas antes de despliegue físico: el modelo incluye métricas de validación sobre 128 observaciones retenidas con 15 pasos objetivo, lo que permite comparar variantes (dos frente a tres cámaras) sin acceso al robot.
- Investigación en imitación con datasets de frecuencia fija: el uso directo de filas a 15 Hz y el particionado por grabación documentado facilitan reproducir el pipeline de ajuste fino y estudiar el efecto del remuestreo.
- Base para ajuste fino en tareas de manipulación similares: al derivar de π0.5 con licencia Gemma, puede reutilizarse como punto de partida para otras tareas de recogida y colocación, siempre respetando las restricciones de la licencia.
- Benchmark interno de control articular: las métricas de MAE articular (0,08590 rad) y MAE de pinza (0,09747) permiten fijar una línea base cuantitativa para comparar nuevas políticas en el mismo robot y dataset.

## Benchmarks y rendimiento

Evaluación offline sobre 128 observaciones retenidas equiespaciadas, con 15 pasos objetivo por observación:

| Metrica | Valor |
|---|---|
| MAE articular | 0,08590 rad |
| MAE de pinza (escala nativa 0–1) | 0,09747 |
| Precisión apertura/cierre de pinza (umbral 0,5) | 90,1 % |
| Éxito físico de pick-and-place | no medido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable en un modelo de robótica especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, pero no se especifica el tamaño en parámetros ni la precisión de los pesos, por lo que no puede derivarse una cifra fiable de VRAM.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño real del modelo base π0.5 y del backend de inferencia.
- Opciones de despliegue: stack OpenPI (librería `openpi`), con importación en Orchestral mediante `policy_config=none` y `model_action_dim=32`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 15 Hz y predice 15 pasos por observación, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 YAM holesaw 15 Hz two-camera (este modelo) | no disponible | 15 pasos × 7 dims a 15 Hz | MAE articular 0,08590 rad; MAE pinza 0,09747; precisión pinza 90,1 % | Gemma Terms of Use | Hugging Face (orchestrallabs) |
| π0.5 YAM holesaw 15 Hz three-camera (variante del mismo autor) | no disponible | 15 pasos × 7 dims a 15 Hz | no disponible en la información proporcionada | Gemma Terms of Use | Hugging Face (orchestrallabs) |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Pesos base referenciados por el autor |

No se dispone de datos suficientes para comparar con otras políticas robóticas de la misma categoría (por ejemplo, otros VLA ajustados para manipulación); la comparación fiable más directa es la variante de tres cámaras del mismo autor, entrenada con el mismo dataset y protocolo.

## Limitaciones y advertencias

- Modelo de una sola tarea: no es un modelo generalista; fuera de la recogida de sierras de corona en la cinta y su colocación en la caja roja, su comportamiento no está validado.
- Éxito físico no medido: las métricas publicadas son offline (MAE y precisión de pinza); no hay evidencia de tasa de éxito en el robot real.
- Dependencia de la configuración de cámara: el mapeo `top_left` → `base_0_rgb` y `wrist_left` → `left_wrist_0_rgb` es fijo; cambiar la disposición o el tipo de cámara invalida la política.
- Enmascaramiento de la muñeca derecha: cualquier información de esa vista se descarta, lo que limita la percepción a dos cámaras.
- Convenciones de acción específicas: requiere aplicar `1 - g` a la pinza y sumar deltas articulares al estado de la consulta; un error en estas conversiones produce comandos incorrectos.
- Frecuencia fija de 15 Hz: el cargador consume filas a 15 Hz sin remuestreo; desviarse de esa frecuencia puede degradar el rendimiento.
- Riesgo de alucinación y sesgo: no se documentan análisis de sesgo ni de robustez ante cambios de iluminación, textura o velocidad de la cinta; como toda política de imitación, puede fallar fuera de la distribución de las 101 grabaciones de entrenamiento.
- Restricciones de licencia: los pesos están sujetos a los Gemma Terms of Use, incluida la sección 3.2 y la política de uso prohibido de Google; el uso comercial y la redistribución deben verificarse contra esos términos.
- Ausencia de datos de hardware: no se publican requisitos de VRAM, GPU recomendadas ni latencias, lo que complica la planificación de despliegue.
- Idiomas: no se declaran idiomas soportados; la instrucción de la tarea está en inglés y no hay evidencia de generalización a otras formulaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-two-camera
- Variante de tres cámaras: https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-three-camera
- Dataset de entrenamiento: https://huggingface.co/datasets/orchestrallabs/holesaw-conveyor-praxis-yam-15hz
- Dataset fijado (commit): https://huggingface.co/datasets/orchestrallabs/holesaw-conveyor-praxis-yam-15hz/tree/fdae77def041115298f5720480925faa1ee3748b
- Configuración del procesador: https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-two-camera/blob/main/openpi_config.json
- Métricas de evaluación: https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-two-camera/blob/main/evaluation.json
- Licencia: https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-two-camera/blob/main/LICENSE
- Atribución y modificaciones: https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-two-camera/blob/main/NOTICE
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
