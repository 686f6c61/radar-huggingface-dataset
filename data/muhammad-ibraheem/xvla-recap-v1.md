# muhammad-ibraheem/xvla-recap-v1

## Resumen

X-VLA + Recap (round 1) es un ajuste fino del modelo de visión-lenguaje-acción (VLA) X-VLA, desarrollado por el usuario muhammad-ibraheem y publicado en Hugging Face bajo el identificador `xvla-recap-v1`. El modelo está especializado en robótica de manipulación fina, concretamente en la tarea de inserción de cables (cable insertion) dentro del entorno AIC, y se distribuye con la librería LeRobot. Cuenta con 879.687.256 parámetros (aproximadamente 880 millones) y un repositorio de 1,8 GB en formato safetensors.

El modelo aplica una técnica de ajuste fino condicionado por ventaja (advantage-conditioned fine-tuning) inspirada en el enfoque Recap de Physical Intelligence (π*0.6). Para ello se emplearon 120 rollouts grabados del modelo base X-VLA con recompensas ground-truth, una función de valor privilegiada y fragmentos etiquetados como `Advantage: positive` o `Advantage: negative`, complementados con 585 demostraciones CheatCode. El entrenamiento se realizó durante 20.000 pasos partiendo del checkpoint `xvla-aic-v4`.

La relevancia de este modelo es acotada y experimental: se trata de la primera ronda de un ciclo de ajuste por refuerzo sobre X-VLA, y el propio autor la marca como superada por su versión posterior `xvla-recap-v2-20k`. Resulta útil como referencia para investigadores que estudien técnicas de RL aplicadas a políticas VLA en tareas de inserción precisa, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en X-VLA |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de X-VLA, una política de visión-lenguaje-acción que procesa observaciones visuales junto con instrucciones en lenguaje natural para producir acciones de control robótico. Sobre esta base se aplica un ajuste fino condicionado por ventaja al estilo Recap: se recopilaron 120 rollouts del modelo X-VLA con recompensas ground-truth, se entrenó una función de valor privilegiada y se etiquetaron fragmentos de trayectoria como `Advantage: positive` (el 30 % superior más las inserciones exitosas) o `Advantage: negative`. A este conjunto se añadieron 585 demostraciones CheatCode, conformando el dataset `aic-recap-v1`.

El entrenamiento se ejecutó durante 20.000 pasos partiendo del checkpoint `xvla-aic-v4`. En inferencia, la condición de ventaja se introduce como texto añadiendo el sufijo `" Advantage: positive"` a la instrucción de la tarea, tal como se define en `aic_context.json`. El código de entrenamiento y evaluación está disponible en el repositorio GitHub del autor. No se dispone de información sobre el número total de tokens, la composición detallada del dataset más allá de lo indicado, ni sobre el uso de RLHF o DPO convencionales.

## Capacidades

- Control robótico de manipulación fina orientado a la tarea de inserción de cables en el entorno AIC.
- Procesamiento conjunto de observaciones visuales e instrucciones en lenguaje natural (paradigma VLA).
- Condicionamiento por ventaja en inferencia mediante el sufijo `" Advantage: positive"` en el texto de la tarea.
- Aprendizaje por refuerzo offline a partir de rollouts con recompensas ground-truth y función de valor privilegiada.
- Ejecución de políticas multi-paso dentro de episodios de manipulación.
- No se ha documentado soporte de tool calling, function calling, agentes generales, capacidades multilingües ni modos de razonamiento extendido (thinking).

## Casos de uso

- Investigación en RL aplicado a políticas VLA: sirve como punto de comparación reproducible para estudiar cómo el ajuste condicionado por ventaja mejora la tasa de éxito frente al modelo base X-VLA en una tarea concreta.
- Inserción de cables en entornos de laboratorio: el modelo está entrenado específicamente para esta tarea y puede desplegarse en un banco de pruebas AIC para evaluar tasas de inserción completa o parcial.
- Reproducción de experimentos de Recap: junto con el dataset `aic-recap-v1` y el código del repositorio, permite replicar el pipeline de etiquetado por ventaja y el ajuste fino sobre X-VLA.
- Evaluación comparativa de checkpoints: útil para contrastar la ronda 1 con la ronda 2 (`xvla-recap-v2-20k`) y con el modelo base `xvla-aic-v4` bajo el mismo protocolo de 36 ensayos.
- Generación de datos de entrenamiento: los rollouts y recompensas asociados pueden reutilizarse para entrenar funciones de valor o para aumentar el conjunto de demostraciones en tareas de ensamblaje.
- Docencia y divulgación técnica: ejemplo práctico y de pequeño tamaño (880 M de parámetros) para explicar técnicas de RL offline en robótica sin requerir infraestructura de gran escala.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 36 ensayos (semillas 100 y 101, más tableros de entrenamiento):

| Modelo | Semilla 100 | Semilla 101 | Tableros de entrenamiento | Total (36 ensayos) | Inserciones |
|---|---|---|---|---|---|
| Recap round 2, 20k pasos (`xvla-recap-v2-20k`) — mejor | 393 | 409 | 427 | 1229 | 2 completas |
| Recap round 1 (este modelo) | 368 | 348 | 447 | 1163 | 2 completas |
| X-VLA (`xvla-aic-v4`) | 327 | 364 | 361 | 1052 | 2 completas + 1 parcial |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 879,7 M de parámetros, una estimación razonable en FP16 ronda los 1,8 GB de pesos, más el overhead de las observaciones visuales y del procesador VLA.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros podría caber en GPUs consumer con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: la librería indicada es LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el marco habitual para políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (36 ensayos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xvla-recap-v1` (este modelo) | 879,7 M | no disponible | 1163 | no disponible | Hugging Face |
| `xvla-recap-v2-20k` | no disponible | no disponible | 1229 | no disponible | Hugging Face |
| `xvla-aic-v4` (X-VLA base) | no disponible | no disponible | 1052 | no disponible | Hugging Face |

La comparación se limita a los tres checkpoints reportados por el autor en la misma tarea y protocolo de evaluación. No se dispone de datos para comparar con otras familias de modelos VLA ajenas a este proyecto.

## Limitaciones y advertencias

- Modelo superado por su propia versión posterior (`xvla-recap-v2-20k`), que obtiene 1229 frente a 1163 en el total de 36 ensayos; el autor lo indica explícitamente en la model card.
- Especialización muy estrecha: entrenado para inserción de cables en el entorno AIC, no es un modelo de propósito general ni transferible sin ajuste a otras tareas.
- El condicionamiento por ventaja requiere añadir el sufijo `" Advantage: positive"` a la instrucción de la tarea; omitirlo puede degradar el comportamiento esperado.
- Licencia no especificada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no documentados; las instrucciones de tarea parecen estar en inglés según el formato del sufijo.
- Riesgo de sobreajuste a los tableros de entrenamiento: el rendimiento en la columna de tableros de entrenamiento (447) es superior al de las semillas independientes (368 y 348).
- Solo 2 inserciones completas en 36 ensayos, lo que indica una tasa de éxito baja en la tarea final.
- No hay información sobre sesgos, alucinaciones en el componente de lenguaje ni sobre el volumen y diversidad del dataset de entrenamiento.
- Sin métricas de latencia ni requisitos de hardware documentados, lo que dificulta planificar un despliegue en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhammad-ibraheem/xvla-recap-v1
- Versión posterior: https://huggingface.co/muhammad-ibraheem/xvla-recap-v2-20k
- Código del proyecto: https://github.com/ibraheem-111/eee598-aic
- Dataset: `aic-recap-v1` (referenciado en la model card; no se proporciona URL directa)
- Modelo base X-VLA: `xvla-aic-v4` (referenciado en la model card; no se proporciona URL directa)
- Referencia técnica del enfoque Recap: Physical Intelligence, π*0.6 (citado en la model card; no se proporciona URL directa)
