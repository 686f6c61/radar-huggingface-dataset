# SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_ACT_500k

## Resumen

VLA_Samer_22.11.2026_200eps_policy_ACT_500k es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario SamerAyyad en Hugging Face mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje generativo, sino un controlador robótico entrenado para predecir secuencias cortas de acciones (action chunks) a partir de observaciones visuales y del estado del robot, siguiendo el método descrito en el artículo ACT (arXiv:2304.13705).

El modelo cuenta con 51.670.663 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Está entrenado sobre el dataset SamerAyyad/VLA_Samer_22.11.2026_200eps, compuesto por 200 episodios de teleoperación, y está pensado para su despliegue con el stack LeRobot, en particular con robots tipo SO-100/SO-101.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento y publicación de políticas robóticas de código abierto: un pipeline reproducible con `lerobot-train` y `lerobot-record`, licencia Apache 2.0 y pesos listos para evaluación. Al no disponer de benchmarks publicados ni de descargas, debe considerarse un artefacto experimental de investigación más que un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con acción fragmentada (ACT, Action Chunking with Transformers) para aprendizaje por imitación |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada visual y de estado del robot) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un fragmento de acciones futuras (chunk). La arquitectura combina un codificador visual y de estado con un transformer que genera esos chunks, lo que reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. El artículo original reporta altas tasas de éxito en tareas de teleoperación con datos limitados.

El entrenamiento se realizó con LeRobot sobre el dataset SamerAyyad/VLA_Samer_22.11.2026_200eps, que contiene 200 episodios de teleoperación. No se dispone de información sobre el número de tokens, la composición exacta del dataset, el uso de RLHF/DPO (no aplicable en este paradigma) ni sobre innovaciones adicionales más allá de las propias del método ACT. El checkpoint publicado corresponde a 500k pasos de entrenamiento según el nombre del repositorio.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos en entornos de laboratorio o mesa de trabajo, típicamente con robots SO-100/SO-101.
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-record` y `--policy.path`.
- Aprendizaje a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No dispone de capacidades multilingües, de visión general, audio ni modo thinking.

## Casos de uso

- Automatización de tareas de pick-and-place: la política puede ejecutar secuencias de agarre y colocación aprendidas de teleoperación, adecuada por su predicción de chunks que reduce la acumulación de error.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT con el mismo dataset de 200 episodios.
- Prototipado con robots SO-100/SO-101: integración directa con LeRobot para validar pipelines de entrenamiento y evaluación en hardware de bajo coste.
- Evaluación de políticas en laboratorio: uso de `lerobot-record` con `--episodes=10` para medir tasas de éxito en tareas concretas.
- Docencia y formación: ejemplo completo de entrenamiento y despliegue de una política robótica de código abierto con licencia permisiva.
- Reentrenamiento con datos propios: punto de partida para fine-tuning sobre nuevos datasets de teleoperación manteniendo la arquitectura ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,67 M de parámetros; en la práctica, el consumo depende del codificador visual y del tamaño de lote.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es lo suficientemente pequeño para GPUs de consumo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs NVIDIA modernas e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record`, `--policy.path`), con soporte de pesos safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLA_Samer_22.11.2026_200eps_policy_ACT_500k | 51,67 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (arXiv:2304.13705) | no disponible en la información | no disponible | tasas de éxito reportadas en el paper | no disponible | paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | no disponible | no disponible | según repositorio | Hugging Face (LeRobot) |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 200 episodios de teleoperación de un único operador y entorno, la política puede sobreajustarse a condiciones específicas de iluminación, posiciones de objetos y configuración del robot.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni soporta instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validar la seguridad del despliegue recae en el integrador.
- Caveats para producción: sin benchmarks publicados, sin descargas ni validación externa, y con fecha de creación futura en los metadatos; debe tratarse como artefacto experimental y validarse exhaustivamente antes de cualquier uso real.

## Enlaces

- Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_ACT_500k
- Dataset: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_22.11.2026_200eps
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
