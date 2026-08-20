# adipotnis/pi05-libero-full-repro

## Resumen

El modelo `adipotnis/pi05-libero-full-repro` es un checkpoint de π₀.₅ (Pi0.5), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado por la comunidad LeRobot. Este modelo está específicamente entrenado y evaluado en el benchmark LIBERO, un conjunto de tareas de manipulación robótica de largo horizonte en entornos simulados. Su objetivo es ejecutar tareas complejas que requieren razonamiento espacial, planificación multi-paso y generalización a escenarios no vistos.

La relevancia de este modelo radica en que π₀.₅ es una versión mejorada de π₀, con mejor generalización a entornos del mundo real gracias a su co-entrenamiento con demostraciones robóticas y datos multimodales a gran escala. El checkpoint presentado aquí es una reproducción completa del entrenamiento en LIBERO, lo que permite a investigadores y desarrolladores evaluar el rendimiento del modelo en tareas estandarizadas de robótica. El repositorio tiene un tamaño de 12,4 GB y está sujeto a acceso restringido (gated) en HuggingFace, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en π₀.₅, con head de acción por flow-matching |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a procesamiento de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de visión-lenguaje-acción que combina un codificador de visión, un modelo de lenguaje y un head de acción basado en flow-matching. A diferencia de los modelos autoregresivos tradicionales, el head de acción genera trayectorias continuas mediante un proceso de flujo, lo que permite una mayor precisión en el control robótico. El modelo se co-entrena con demostraciones de robots y datos multimodales a gran escala, lo que le confiere capacidades de generalización a entornos y objetos no vistos.

El checkpoint `pi05-libero-full-repro` es una reproducción del entrenamiento completo en el benchmark LIBERO, que incluye tareas como abrir cajones, recoger objetos y colocarlos en posiciones específicas, entre otras. La implementación de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence, soporta únicamente el head de acción por flow-matching, no el head autoregresivo alternativo. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Ejecución de tareas de manipulación robótica de largo horizonte en entornos simulados (benchmark LIBERO).
- Generalización a escenarios no vistos gracias al co-entrenamiento con datos multimodales.
- Razonamiento espacial y planificación multi-paso para tareas que requieren secuencias de acciones.
- Integración con el ecosistema LeRobot para entrenamiento y evaluación de políticas robóticas.
- Soporte de head de acción por flow-matching (no soporta head autoregresivo).
- Capacidades de visión-lenguaje-acción: el modelo procesa observaciones visuales e instrucciones en lenguaje natural para generar acciones de control.

## Casos de uso

- Investigación en robótica: el modelo sirve como punto de partida para estudiar el rendimiento de VLAs en tareas estandarizadas de LIBERO, permitiendo comparaciones con otros enfoques.
- Desarrollo de políticas de manipulación: se puede utilizar como base para fine-tuning en tareas específicas de agarre, apilado o ensamblaje en entornos simulados.
- Evaluación de generalización: al estar entrenado en LIBERO, es adecuado para probar la capacidad de un VLA de transferir conocimiento a variaciones de tareas no vistas.
- Benchmarking de arquitecturas: investigadores pueden comparar este checkpoint con otras implementaciones de π₀.₅ o modelos VLA alternativos en el mismo entorno.
- Educación y formación: sirve como ejemplo práctico de entrenamiento y despliegue de un VLA con flow-matching en el framework LeRobot.
- Reproducibilidad: al ser una reproducción completa, permite verificar resultados publicados y explorar variaciones en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo está entrenado y evaluado en LIBERO, pero no se proporcionan métricas concretas (éxito por tarea, etc.) en la ficha de HuggingFace ni en los resultados de búsqueda. Se recomienda consultar el repositorio de LeRobot o el paper de π₀.₅ para obtener datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 12,4 GB, lo que sugiere que el checkpoint completo podría requerir al menos 16-24 GB de VRAM para inferencia en precisión completa, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Dado el tamaño, es probable que se necesite una GPU con al menos 24 GB (por ejemplo, RTX 3090/4090, A10G) para cargar el modelo en FP16, pero no se especifica.
- Compatibilidad con GPU de consumo: incierto. Sin datos de cuantización, no se puede afirmar si cabe en GPUs de 8-12 GB.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que se puede ejecutar con su pipeline. También podría usarse con OpenPI, aunque no se detallan opciones como vLLM u Ollama (no aplicables a modelos de robótica).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| π₀.₅ (este checkpoint) | VLA con flow-matching | LIBERO | Apache-2.0 | Gated en HuggingFace |
| π₀ (original) | VLA con flow-matching | Datos robóticos y multimodales | Apache-2.0 | Open source en OpenPI |
| π₀-FAST | VLA autoregresivo con tokenizador FAST | Datos robóticos | Apache-2.0 | Open source en OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos arquitectónicos y de disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace antes de poder descargarlo, lo que puede limitar su uso inmediato.
- Solo soporta head de acción por flow-matching: no es compatible con el head autoregresivo de π₀.₅, lo que reduce su flexibilidad.
- Enfocado a robótica simulada: el entrenamiento en LIBERO no garantiza rendimiento en robots físicos reales sin fine-tuning adicional.
- Sin datos de sesgos o alucinación: al ser un modelo de acción, no genera texto libre, pero podría producir acciones subóptimas en entornos no vistos.
- Tamaño del repositorio (12,4 GB) puede requerir recursos de almacenamiento y memoria considerables.
- No se especifican idiomas soportados: las instrucciones en lenguaje natural probablemente están en inglés, pero no se confirma.
- Licencia Apache-2.0 permite uso comercial, pero el acceso gated implica que el autor puede imponer restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adipotnis/pi05-libero-full-repro
- Repositorio LeRobot (π₀.₅): https://huggingface.co/lerobot/pi05-libero
- Checkpoint base de LeRobot: https://huggingface.co/lerobot/pi05_libero_base
- Documentación de LeRobot para π₀.₅: https://github.com/huggingface/lerobot/blob/main/docs/source/pi05.mdx
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Modelo en ModelScope (fine-tuned v044): https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned_v044
