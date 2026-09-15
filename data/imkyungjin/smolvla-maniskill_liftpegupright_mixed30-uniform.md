# ImKyungjin/smolvla-maniskill_liftpegupright_mixed30-uniform

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto orientado a control robótico, publicado por el usuario ImKyungjin sobre el checkpoint base `lerobot/smolvla_base` de Hugging Face. El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y un tamaño de repositorio de 0,9 GB, lo que lo sitúa en la gama de políticas robóticas ligeras capaces de ejecutarse en hardware de consumo según la propia model card.

El ajuste se ha realizado con LeRobot sobre un dataset local identificado como `maniskill_liftpegupright_mixed30`, y el sufijo "uniform" del nombre del repositorio apunta a una variante de muestreo uniforme en el entrenamiento, aunque este extremo no está documentado en la información disponible. El pipeline declarado es `robotics` y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las del propio SmolVLA base.

Su relevancia es de tipo práctico para investigación en robótica: sirve como punto de partida reproducible para tareas de manipulación tipo *lift peg upright* en ManiSkill, y como ejemplo de fine-tune de una política VLA pequeña con el ecosistema LeRobot. No se han publicado resultados de benchmarks ni métricas de éxito en la información proporcionada, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; basado en SmolVLA (paper arXiv:2506.01844). Detalle interno de capas no disponible en la información proporcionada |
| Parámetros totales | 450.046.176 (≈450 M), dato real de los pesos safetensors |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; los pesos se distribuyen en safetensors (0,9 GB, coherente con bf16/fp16) |
| Idiomas soportados | no disponible (el modelo se usa para control robótico, no para generación de texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Dataset de entrenamiento | local/maniskill_liftpegupright_mixed30 (no publicado en el Hub según la información disponible) |
| Pipeline / tarea | robotics |

## Arquitectura y entrenamiento

SmolVLA se presenta en su documentación como un modelo de visión-lenguaje-acción compacto y eficiente, que logra rendimiento competitivo con coste computacional reducido y puede desplegarse en hardware de consumo. En este repositorio concreto no se detalla la composición interna (codificador visual, columna vertebral de lenguaje, experto de acción), el número de tokens de entrenamiento ni la composición del dataset, por lo que esos datos figuran como no disponibles en esta ficha.

Lo que sí se documenta es el procedimiento: el modelo se entrenó y se subió al Hub con LeRobot, y se ajustó a partir de `lerobot/smolvla_base` sobre el dataset `maniskill_liftpegupright_mixed30`. El nombre del dataset sugiere episodios de la tarea de manipulación *lift peg upright* de ManiSkill y un conjunto mixto de aproximadamente 30 episodios, pero esta interpretación se deriva únicamente del identificador y no está confirmada en la información proporcionada. Tampoco se especifica si hubo fases de RLHF, DPO u otra optimización posterior al ajuste supervisado.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales y del estado del robot (política VLA), que es la función principal del modelo.
- Procesamiento conjunto de entrada visual y de lenguaje, dado que SmolVLA es un modelo de visión-lenguaje-acción; las instrucciones en lenguaje natural son parte del diseño de la familia, aunque no se detallan en esta model card.
- Ejecución de políticas de manipulación entrenadas por imitación, orientadas a la tarea del dataset de ajuste (elevación y colocación vertical de una pieza o clavija).
- Integración directa con LeRobot para entrenamiento (`lerobot-train`) y evaluación/inferencia (`lerobot-record`), incluido el ejemplo con un brazo `so100_follower`.
- Despliegue en hardware de consumo, según la afirmación explícita de la model card de SmolVLA.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión generativa o audio: no disponible.

## Casos de uso

- Manipulación robótica en simulación: reproducción de la tarea *lift peg upright* en ManiSkill mediante `lerobot-record`, usando el checkpoint como política de referencia para comparar variantes de entrenamiento.
- Investigación en aprendizaje por imitación con pocos datos: el ajuste parte de un dataset reducido (aproximadamente 30 episodios según el identificador), lo que lo convierte en un caso de estudio sobre cuánta demostración necesita una política VLA de 450 M de parámetros.
- Ablaciones de muestreo de acciones: el sufijo "uniform" del repositorio sugiere una variante de distribución de muestreo; el modelo permite comparar esa elección frente a otras variantes del mismo autor o del checkpoint base.
- Base para fine-tunes propios: al derivar de `lerobot/smolvla_base` y tener licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre datasets propios de otras tareas de manipulación.
- Prototipado en robótica de bajo coste: dado su tamaño (0,9 GB de pesos) y la afirmación de despliegue en hardware de consumo, es viable probarlo en estaciones con una única GPU de gama media y brazos tipo SO-100.
- Docencia y formación en VLA: sirve como ejemplo mínimo y ejecutable del flujo completo de LeRobot (dataset, entrenamiento, evaluación con `--policy.path`), sin necesidad de clústeres de GPU.
- Evaluación de robustez sim-a-real: como política entrenada en simulación, puede emplearse para medir la degradación al transferir a un brazo real, aunque no hay datos publicados de esa transferencia en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reproduce la descripción genérica de SmolVLA ("rendimiento competitivo con coste computacional reducido") sin cifras de tasa de éxito, MMLU, HumanEval, GSM8K ni métricas de simulación, que por otra parte no son aplicables a un modelo de política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 450 M de parámetros): ≈1,8 GB en fp32, ≈0,9 GB en bf16/fp16, ≈0,45 GB en int8. A ello hay que sumar memoria para activaciones, imágenes de las cámaras y buffers de inferencia.
- Estimación práctica: menos de 4 GB de VRAM en bf16 con lote 1 y una o dos cámaras, aunque no hay mediciones publicadas en la información disponible.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4-6 GB de VRAM. La model card de SmolVLA afirma explícitamente que puede desplegarse en hardware de consumo, lo que incluye tarjetas tipo RTX 3060/4060/4090; para entrenamiento conviene una GPU con más VRAM (RTX 4090, A100, H100) según el tamaño de lote y la resolución de imagen.
- Cabe en GPU de consumo: sí, según la afirmación del fabricante del modelo base; no se indica el modelo exacto mínimo.
- Opciones de despliegue: LeRobot (comandos `lerobot-train` y `lerobot-record`), con PyTorch y CUDA. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no son herramientas orientadas a políticas VLA).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados en la información proporcionada para comparar rendimiento. La siguiente tabla recoge únicamente lo confirmado para este repositorio y el resto se marca como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ImKyungjin/smolvla-maniskill_liftpegupright_mixed30-uniform | 450.046.176 | no disponible | apache-2.0 | Hugging Face (0 descargas) | Fine-tune de `lerobot/smolvla_base` sobre dataset local de ManiSkill |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face | Checkpoint base del que deriva este modelo |
| Otras políticas del ecosistema LeRobot (ACT, entre otras) y VLA de mayor tamaño (OpenVLA, pi0, GR00T N1) | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos verificados para esta ficha |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentación sobre sesgos de la política ni sobre su comportamiento diferencial por escenario.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero sí existe riesgo de acciones erráticas o fuera de distribución cuando la observación se aleja de la distribución del dataset de entrenamiento (aproximadamente 30 episodios, según el identificador).
- Sobreajuste probable: un ajuste sobre un dataset reducido y específico de una única tarea limita la generalización a otras tareas, objetos, iluminaciones o cámaras.
- Limitaciones de contexto e idioma: no disponible; no se especifica ventana de contexto ni cobertura de idiomas para instrucciones.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial, pero el usuario debe verificar las condiciones del modelo base `lerobot/smolvla_base` y del código de LeRobot, así como los términos del dataset original de ManiSkill.
- Trazabilidad: el dataset `local/maniskill_liftpegupright_mixed30` no está publicado en el Hub según la información disponible, lo que impide reproducir el entrenamiento tal cual.
- Falta de validación: 0 descargas y 0 interacciones; no hay métricas de éxito, comparativas ni validación externa. No se recomienda su uso en producción sin una evaluación previa en el entorno objetivo.
- Ausencia de datos operativos: no se documentan latencias, frecuencia de control, requisitos de calibración del robot ni resolución de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/smolvla-maniskill_liftpegupright_mixed30-uniform
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (referencia arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
