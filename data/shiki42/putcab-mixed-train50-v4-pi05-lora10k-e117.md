# Shiki42/PutCab-Mixed-Train50-V4-PI05-LoRA10K-E117

## Resumen

PutCab-Mixed-Train50-V4-PI05-LoRA10K-E117 es un checkpoint de inferencia publicado por el usuario Shiki42 en Hugging Face, etiquetado como `robotics`, `pi05`, `lora` y `jax`. Corresponde al paso 10.000 del experimento E117: un adaptador LoRA entrenado sobre una inicialización "PI0.5 Base mirror" con un único *action expert*, lote de 16 y semilla de entrenamiento 87431. El repositorio ocupa 6,3 GB e incluye los parámetros en formato Orbax, los activos de normalización específicos del dataset, la configuración resuelta y los metadatos de procedencia; no incluye estado del optimizador ni del cargador de datos.

El modelo se apoya en el ecosistema OpenPI (Physical Intelligence), referenciado en la model card con el commit `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`, y se entrenó sobre el dataset `Shiki42/PutCab-Mixed-Train50-V4` en el commit `a7e496ffc2fb2f1f13bb8637193e0f7985c2acb6`. Es importante subrayar que **no es un checkpoint de Transformers**: requiere el código JAX de OpenPI y la configuración correspondiente para cargarse, y debe usarse con los activos de normalización incluidos en el propio repositorio.

Su relevancia es acotada y de carácter investigador. La propia model card lo describe como "research artifact" con una única semilla de entrenamiento, resultados de evaluación pendientes de auditoría y una advertencia explícita sobre el 80% reportado previamente para FixedRole100, que sigue bajo investigación. El repositorio acumula 0 descargas y 0 *likes*, y no declara licencia ni idiomas soportados, por lo que cualquier uso en producción exige una revisión previa de la procedencia y de los términos aplicables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de la familia PI0.5 con un único *action expert* y adaptadores LoRA sobre inicialización "PI0.5 Base mirror"; ejecución JAX/OpenPI. No se detalla la topología interna (transformer, MoE u otra) en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio publica parámetros en formato Orbax y no documenta variantes cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponible (checkpoint de robótica; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX). No es un checkpoint de Transformers |
| Tamaño del repositorio | 6,3 GB |
| Pipeline declarado | robotics |
| Paso de entrenamiento | 10.000 (experimento E117) |
| Semilla de entrenamiento | 87431 |
| Tamaño de lote | 16 |
| Dataset de entrenamiento | Shiki42/PutCab-Mixed-Train50-V4 (commit a7e496ffc2fb2f1f13bb8637193e0f7985c2acb6) |
| Commit de OpenPI | e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead |
| Estado del optimizador | omitido |
| Estado del cargador de datos | omitido |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |
| Última actualización | 2026-09-13 |

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un checkpoint de inferencia con un único *action expert*, inicialización espejo sobre PI0.5 Base y adaptación mediante LoRA, entrenado con lote 16 y semilla 87431 durante 10.000 pasos. La referencia a OpenPI y el uso de Orbax sitúan el entrenamiento y la inferencia en el stack JAX de Physical Intelligence, no en el ecosistema PyTorch/Transformers. No se especifican en la model card el número de parámetros del modelo base, la dimensión de los adaptadores LoRA (rango, alpha, módulos objetivo), el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias; todos esos datos quedan como "no disponible".

El aspecto técnico más relevante que sí está documentado es la gestión de la normalización: el repositorio incluye activos de normalización específicos del dataset y la model card insiste en que deben usarse los incluidos, lo que implica que la política está condicionada a las estadísticas concretas de `PutCab-Mixed-Train50-V4`. Cualquier evaluación con otras estadísticas de normalización invalidaría la comparación. Además, la ausencia de estados de optimizador y de cargador de datos limita el checkpoint a inferencia o a un reinicio de ajuste desde cero del optimizador, no a una reanudación exacta del entrenamiento.

## Capacidades

- Política de acción robótica: el checkpoint contiene un *action expert* entrenado para producir acciones motoras a partir de observaciones, no para generar texto. El pipeline declarado es `robotics`.
- Ejecución condicionada a la tarea: el nombre del artefacto y del dataset (`PutCab-Mixed-Train50-V4`) apuntan a una familia de tareas de colocación de objetos; no se documenta el espacio de acciones ni la morfología del robot.
- Carga reproducible con OpenPI: incluye configuración resuelta y metadatos de procedencia que permiten reconstruir el entorno de inferencia con el commit indicado.
- Compatibilidad con normalización específica: los activos de normalización incluidos permiten reproducir la escala de entradas y salidas del entrenamiento.
- Generación de texto: no documentada; no es un modelo de lenguaje.
- Razonamiento, matemáticas y código: no aplica.
- *Tool calling* o *function calling*: no aplica.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales adicionales (*thinking mode*, visión, audio): no documentadas más allá del dominio robótico implícito en el pipeline. No se confirma si la entrada incluye imágenes o instrucciones en lenguaje natural.

## Casos de uso

- Manipulación robótica de colocación de objetos: el checkpoint puede emplearse como política para tareas de la familia "PutCab", ejecutando acciones motoras a partir de observaciones en el mismo dominio del dataset de entrenamiento, siempre que se respeten sus activos de normalización.
- Reproducción del experimento E117: con la semilla 87431, el commit de OpenPI y el commit del dataset documentados, es posible reconstruir el entorno de inferencia y verificar los resultados del paso 10.000.
- Estudio del efecto de LoRA sobre PI0.5 Base: al existir una inicialización "mirror" y un adaptador de bajo rango, el checkpoint sirve para comparar el comportamiento del adaptador frente al modelo base sin ajustar, en igualdad de condiciones de normalización.
- Base para *fine-tuning* posterior: al haberse omitido los estados del optimizador, es un punto de partida razonable para un nuevo ajuste supervisado sobre tareas adicionales del mismo dominio.
- Evaluación en simulación con el stack OpenPI: integrable en *pipelines* de evaluación de políticas donde se registren tasas de éxito por tarea y por semilla.
- Auditoría de resultados pendientes: la model card menciona que la evaluación de FixedRole100 está "audit pending" y que los resultados de Fixed100 están registrados por separado; el checkpoint es material de partida para esas auditorías.
- Docencia y laboratorios de aprendizaje por imitación en robótica: sirve como ejemplo real de adaptación LoRA en JAX con trazabilidad de commits y semillas, útil para enseñar reproducibilidad en investigación.
- Investigación sobre robustez ante cambios de normalización: permite medir cuánto se degrada la política al aplicar estadísticas de normalización distintas de las incluidas, un factor crítico en la transferencia entre *setups*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación están pendientes de auditoría, que el 80% previamente reportado para CTR/FixedRole100 sigue bajo investigación y que la publicación del checkpoint "no confirma rendimiento ni afirmaciones de causalidad temporal". La evaluación de Fixed100 está registrada aparte y no se reclama ningún resultado para ella en este repositorio.

| Benchmark | Resultado | Notas |
|---|---|---|
| Evaluación del experimento E117 | no disponible | "Evaluation results remain audit pending" |
| CTR / FixedRole100 | no confirmado | 80% previamente reportado, bajo investigación |
| Fixed100 | no disponible | Evaluación registrada por separado, sin resultado reclamado |

## Requisitos de hardware

- El repositorio en sí ocupa 6,3 GB, pero corresponde a un adaptador y a los parámetros en Orbax; hay que sumar el checkpoint del modelo base PI0.5 y el *runtime* JAX/OpenPI para poder inferir.
- VRAM estimada para inferencia: no disponible. Depende del modelo base, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponibles por modelo concreto. Al tratarse de un *stack* JAX, conviene hardware con buen soporte bf16 y memoria abundante (familias A100, H100 o equivalentes); en tarjetas de consumo como la RTX 4090 la viabilidad depende del tamaño del modelo base, que aquí no se documenta.
- ¿Cabe en GPU de consumo?: no disponible; no puede determinarse sin conocer el tamaño del modelo base.
- Opciones de despliegue: *runtime* JAX de OpenPI con el commit `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead` y la configuración resuelta incluida en el repositorio. **No** es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint de Transformers ni se publican pesos en GGUF o safetensors.
- Latencia y *throughput*: no disponibles.
- Almacenamiento y memoria de host: hay que prever espacio para el repositorio (6,3 GB) más el modelo base y los activos de normalización.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Los términos de comparación naturales serían el propio PI0.5 Base sin adaptador, otros checkpoints LoRA de OpenPI/pi0.5 y políticas visión-lenguaje-acción como OpenVLA o alternativas del mismo segmento, pero no se han facilitado cifras de parámetros, contexto, rendimiento ni licencia para ninguno de ellos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PutCab-Mixed-Train50-V4-PI05-LoRA10K-E117 | no disponible | no disponible | no disponible (auditoría pendiente) | no disponible | Repositorio HF público, 0 descargas |
| PI0.5 Base (sin LoRA) | no disponible | no disponible | no disponible | no disponible | Referenciado como inicialización, sin enlace en la model card |
| Otros checkpoints LoRA de OpenPI/pi0.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas VLA alternativas (OpenVLA, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigación: la model card lo califica expresamente como "research artifact" y advierte de que la publicación no confirma rendimiento ni afirmaciones de causalidad temporal.
- Una sola semilla de entrenamiento (87431): no hay evidencia de estabilidad entre semillas ni de intervalos de confianza.
- Evaluación pendiente de auditoría: los resultados del experimento E117 no están verificados; el 80% reportado para CTR/FixedRole100 sigue bajo investigación.
- Licencia no disponible: no se puede asumir uso comercial. La ausencia de licencia explícita es un riesgo legal relevante para cualquier despliegue en producción.
- Dependencia fuerte del entorno: sin el código JAX de OpenPI en el commit indicado y sin la configuración resuelta, el checkpoint no es cargable. No hay camino de despliegue estándar vía Transformers, vLLM, Ollama o llama.cpp.
- Normalización acoplada al dataset: usar activos de normalización distintos de los incluidos invalida los resultados y probablemente degrada la política.
- Estados omitidos: al no incluir estado del optimizador ni del cargador de datos, no es posible reanudar el entrenamiento de forma exacta, solo reiniciar el ajuste.
- Idiomas no declarados: no hay información sobre si la política acepta instrucciones en lenguaje natural ni en qué idiomas.
- Riesgo de sobreajuste al dominio: el entrenamiento se limita a `PutCab-Mixed-Train50-V4`; no hay datos sobre generalización a otras tareas, objetos, iluminaciones o morfologías de robot.
- Sesgos: no disponibles. No se documenta composición del dataset ni posibles sesgos de recogida de datos.
- Riesgo de alucinación: el término no aplica a una política de acción en el sentido de generación de texto; el riesgo análogo es la ejecución de acciones incorrectas o inseguras, especialmente fuera de la distribución de entrenamiento.
- Advertencia sobre las búsquedas web: los resultados de búsqueda obtenidos no guardan relación con este modelo (tratan sobre pasarelas de pago con criptomonedas y facturación en *blockchain*), por lo que no aportan información utilizable y no se han empleado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiki42/PutCab-Mixed-Train50-V4-PI05-LoRA10K-E117
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Mixed-Train50-V4 (commit a7e496ffc2fb2f1f13bb8637193e0f7985c2acb6)
- Repositorio OpenPI (Physical Intelligence), referenciado mediante el commit e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead: https://github.com/Physical-Intelligence/openpi
- Paper o blog del modelo base PI0.5: no disponible en la información proporcionada
- Demos o espacios asociados: no disponibles
- Resultados de búsqueda web: no relevantes para este modelo (contenido sobre criptomonedas y facturación)
