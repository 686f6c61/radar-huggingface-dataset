# lair-nyu/yor_icl_pi05_sanity15k_continued_15k

## Resumen

El modelo `lair-nyu/yor_icl_pi05_sanity15k_continued_15k` es un checkpoint experimental de un modelo de visión-lenguaje-acción (VLA) basado en π0.5, desarrollado por el equipo de Physical Intelligence. Este repositorio concreto, publicado por el usuario `lair-nyu`, contiene los pesos de una continuación de entrenamiento de 15.000 pasos adicionales sobre el checkpoint final de `yor_icl_pi05_easy_pnp_v2_sanity15k`, con el objetivo de evaluar si un programa de annealing (decaimiento de la tasa de aprendizaje) correctamente escalado mejora los resultados frente a un baseline que no usa annealing. El entrenamiento se realizó con el framework openpi sobre el conjunto de datos `icl-dataset`, y el checkpoint guardado corresponde al paso 14.999.

La relevancia de este modelo reside en su carácter de experimento de investigación: no es un modelo listo para producción, sino una pieza en un estudio sobre estrategias de entrenamiento para VLA. Al estar basado en π0.5, hereda la arquitectura de co-entrenamiento heterogéneo que permite generalización a tareas del mundo real, pero este checkpoint específico se centra en validar hipótesis sobre el ajuste del learning rate durante el entrenamiento continuado. El repositorio incluye únicamente los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador, lo que impide reanudar el entrenamiento desde este punto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 (transformer con flow matching y co-entrenamiento heterogéneo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `params/` (pesos desplegables) y `assets/` (estadísticas de normalización); formato interno de openpi, probablemente safetensors |

## Arquitectura y entrenamiento

π0.5 es un modelo de visión-lenguaje-acción que extiende π0 mediante co-entrenamiento en una mezcla heterogénea de tareas, combinando datos de manipulación móvil con anotaciones semánticas de subtareas. La arquitectura emplea un transformer que procesa observaciones visuales y lenguaje, y genera acciones a través de un mecanismo de flow matching, lo que permite una decodificación fluida y estable. En este checkpoint concreto, el entrenamiento se reanuda desde el paso 14.999 del modelo `yor_icl_pi05_easy_pnp_v2_sanity15k` (solo los parámetros, sin estado del optimizador) y se extiende otros 15.000 pasos con un programa de cosine decay reiniciado desde cero. El objetivo es comprobar si un annealing correctamente escalado (es decir, con una curva de decaimiento adaptada al nuevo presupuesto de pasos) supera al baseline sin annealing, que mantiene una tasa de aprendizaje constante durante toda la fase de entrenamiento continuado. El entrenamiento se llevó a cabo con el framework openpi sobre el `icl-dataset`, un conjunto de datos no especificado en detalle pero orientado a tareas de manipulación robótica.

## Capacidades

- Control robótico de bajo nivel: generación de acciones de articulación (joint) para manipuladores móviles, basado en observaciones visuales y lenguaje.
- Percepción visual integrada: procesa imágenes de cámara para guiar la interacción con objetos en entornos no estructurados.
- Razonamiento de subtareas: el modelo base π0.5 predice primero una subtarea semántica de alto nivel y luego condiciona la generación de acciones a esa subtarea, habilitando comportamientos secuenciales.
- Generalización a entornos abiertos: el co-entrenamiento heterogéneo le permite transferir habilidades entre tareas y escenarios distintos, según lo reportado en el paper de π0.5.
- Multilingüismo: no disponible; el modelo no documenta idiomas soportados en este checkpoint.
- Tool calling / function calling: no aplicable; es un modelo de control motor, no un agente conversacional.

## Casos de uso

- Investigación en estrategias de entrenamiento: este checkpoint sirve para comparar el efecto del annealing en el rendimiento final de un VLA, permitiendo a otros investigadores reproducir y validar los resultados del experimento.
- Fine-tuning posterior para tareas específicas: los pesos desplegables pueden usarse como punto de partida para ajustar el modelo en un dominio robótico concreto (por ejemplo, recogida y colocación de objetos) aprovechando las 15.000 iteraciones adicionales de entrenamiento.
- Evaluación de generalización en robótica: al estar entrenado en el `icl-dataset`, puede evaluarse en entornos simulados o reales para medir su capacidad de adaptación frente a variaciones de iluminación, disposición de objetos o instrucciones de lenguaje.
- Benchmark de annealing: el modelo permite contrastar métricas (éxito en tareas, precisión de acciones) contra el baseline sin annealing, contribuyendo a la literatura sobre programación de tasas de aprendizaje en modelos de control.
- Desarrollo de políticas de manipulación móvil: aunque no es un modelo final, sus pesos pueden integrarse en pipelines de openpi para desplegar comportamientos básicos en robots móviles con brazo.
- Estudio de co-entrenamiento heterogéneo: al ser una continuación de un modelo co-entrenado, facilita el análisis de cómo el entrenamiento continuado afecta la retención de habilidades previas y la adquisición de nuevas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, y la model card solo describe las condiciones de entrenamiento. No se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 12,4 GB, lo que sugiere pesos en precisión fp32 o bf16 sin cuantizar; una inferencia típica requeriría al menos 24 GB de VRAM para cargar el modelo completo, aunque podría reducirse con cuantización posterior.
- GPU recomendadas: para cargar los pesos sin cuantizar, se necesitaría una GPU con al menos 24 GB de VRAM, como una RTX 3090/4090 o una A100 de 40 GB. Para entrenamiento o fine-tuning, se recomiendan GPUs de centro de datos (A100, H100) con memoria superior.
- Si cabe en consumer GPU: posiblemente sí en una RTX 4090 (24 GB) si se aplican técnicas de reducción de memoria (por ejemplo, carga en bf16 o cuantización), pero no se ha verificado.
- Opciones de despliegue: al estar entrenado con openpi, el despliegue natural es mediante ese framework. También podría exportarse a formatos compatibles con vLLM o TGI si se adapta, aunque no está documentado. Para inferencia ligera, llama.cpp no es aplicable directamente por ser un modelo de control motor, no de lenguaje generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `lair-nyu/yor_icl_pi05_sanity15k_continued_15k` | VLA π0.5 | no disponible | no disponible | no publicado | no disponible |
| `lair-nyu/yor_icl_pi05_easy_pnp_v2_sanity15k` | VLA π0.5 | no disponible | no disponible | no publicado | no disponible |
| π0.5 (original, Physical Intelligence) | VLA π0.5 | no disponible | no disponible | reportado en paper (no incluido aquí) | no disponible |
| π0 (base) | VLA transformer con flow matching | 3.3B (según paper, no confirmado) | no disponible | reportado en paper | no disponible |

La comparativa se limita a modelos de la misma familia; no hay datos de modelos alternativos como OpenVLA o RT-2 en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint es un experimento de investigación, no un modelo listo para producción; su rendimiento en tareas reales no está validado.
- No se incluye el estado del optimizador (`train_state/`), por lo que no es posible reanudar el entrenamiento desde este punto; solo se pueden cargar los pesos para inferencia o fine-tuning.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución. Se recomienda contactar con el autor antes de utilizarlo en proyectos con fines lucrativos.
- No hay información sobre sesgos o alucinaciones; al ser un modelo de control motor, el riesgo principal es la ejecución de acciones inseguras en entornos reales si no se valida adecuadamente.
- El dataset de entrenamiento (`icl-dataset`) no está documentado en detalle, por lo que se desconocen posibles sesgos en la distribución de tareas o entornos.
- La longitud de contexto y los idiomas soportados no están disponibles, lo que limita su uso en aplicaciones que requieran instrucciones lingüísticas extensas o multilingües.
- El modelo está etiquetado con `region:us`, lo que puede indicar restricciones geográficas o de acceso, aunque no se detalla.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lair-nyu/yor_icl_pi05_sanity15k_continued_15k
- Checkpoint previo: https://huggingface.co/lair-nyu/yor_icl_pi05_easy_pnp_v2_sanity15k
- Repositorio relacionado con annealing: https://huggingface.co/lair-nyu/sanity15k_annealing
- Paper de π0.5: https://arxiv.org/abs/2504.16054
- Versión HTML del paper: https://arxiv.org/html/2504.16054v1
- Framework openpi: https://github.com/Physical-Intelligence/openpi
