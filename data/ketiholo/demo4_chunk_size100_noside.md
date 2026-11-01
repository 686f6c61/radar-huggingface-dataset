# ketiholo/demo4_chunk_size100_noside

## Resumen

`ketiholo/demo4_chunk_size100_noside` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset `ketiholo/demo4`.

El modelo resuelve el problema del control robótico a partir de demostraciones teleoperadas: dado un conjunto de observaciones (típicamente imágenes de cámara y estado de las articulaciones), genera comandos de acción para el robot. La nomenclatura del repositorio sugiere un entrenamiento con `chunk_size=100` (predicción de bloques de 100 acciones) y sin componente lateral o auxiliar (`noside`), aunque la model card no detalla estas variaciones.

Con 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, es un modelo compacto orientado a despliegue en hardware de robótica de bajo coste. Su relevancia actual radica en la creciente adopción de LeRobot como ecosistema estándar para políticas de manipulación robótica reproducibles y de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformer que predice bloques de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador visual, un codificador de estado de las articulaciones y un decodificador transformer que genera la secuencia de acciones. El nombre del repositorio indica un `chunk_size` de 100 acciones por predicción y una variante `noside`, presumiblemente sin entrada lateral adicional.

El entrenamiento se realizó con LeRobot sobre el dataset `ketiholo/demo4`, compuesto por demostraciones teleoperadas. La model card no especifica el número de episodios, el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; ACT es un método puramente supervisado de imitación. No se dispone de información sobre aumentos de datos, resolución de las cámaras de entrada ni configuración exacta del robot empleado durante la recogida de datos.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks de 100 pasos) a partir de observaciones visuales y de estado.
- Manipulación de precisión: ACT está diseñado para tareas de manipulación que requieren coordinación fina, como agarrar y colocar objetos.
- Predicción multi-paso: al predecir bloques de acciones, reduce el error de acumulación típico de políticas paso a paso.
- Integración con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Despliegue en robots SO-100: la documentación de LeRobot referencia el robot `so100_follower` para la evaluación.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso general ni procesamiento de lenguaje natural.
- No se documentan capacidades multilingües ni modos de pensamiento (thinking mode).

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede controlar un brazo robótico en tareas de pick-and-place entrenadas con demostraciones teleoperadas, aprovechando la predicción de chunks de 100 acciones para movimientos suaves y estables.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar variantes de ACT (por ejemplo, con y sin componente lateral) sobre el mismo dataset `demo4`.
- Prototipado en robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, es viable en estaciones de trabajo con GPU consumer para iterar rápidamente sobre nuevas demostraciones.
- Evaluación de políticas con LeRobot: se puede desplegar con `lerobot-record` sobre un robot SO-100 para medir tasas de éxito en 10 episodios de evaluación, tal como indica la model card.
- Automatización de tareas repetitivas en entornos controlados: tareas de ensamblaje o clasificación de objetos donde las condiciones de iluminación y posición sean estables, al estilo de las demostraciones de entrenamiento.
- Base para fine-tuning con nuevos datasets: al ser una política compacta y con licencia Apache 2.0, puede reentrenarse o ajustarse con datos adicionales de otro robot o tarea dentro del ecosistema LeRobot.
- Docencia y formación: útil para ilustrar el flujo completo de LeRobot (grabación de datos, entrenamiento, evaluación) en cursos de robótica o aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en fp32), la inferencia requiere menos de 1 GB de VRAM, aunque el consumo real depende del codificador visual y del tamaño de las imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se recomienda una RTX 3060 o superior para entrenamiento, y una GPU integrada o CPU para inferencia en el robot.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante) e incluso en dispositivos de borde con aceleración.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo4_chunk_size100_noside (ACT) | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot (otras variantes) | variable (decenas de M) | no aplica | no disponible | apache-2.0 | Hugging Face |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación rigurosa con Diffusion Policy, VQ-BeT u otras políticas de imitación. La comparación se limita a la categoría (políticas de imitación para robótica) y a la licencia.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo es válido para la tarea y el robot con los que fue entrenado; no generaliza a otras tareas sin reentrenamiento.
- Dataset no documentado: la model card no detalla el número de episodios, la configuración del robot ni las condiciones de recogida, lo que dificulta evaluar su robustez.
- Riesgo de sobreajuste: con un dataset llamado `demo4`, es probable que el número de demostraciones sea reducido, lo que puede provocar un rendimiento pobre ante variaciones de iluminación, posición de objetos o fondo.
- Sin métricas publicadas: no hay tasas de éxito ni comparaciones que permitan estimar su fiabilidad en producción.
- Sesgos desconocidos: no se documentan sesgos, pero al entrenarse con demostraciones humanas puede heredar sesgos de los operadores (velocidad, trayectorias, preferencias de agarre).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset `ketiholo/demo4` y los datos de teleoperación asociados no tengan restricciones adicionales.
- Sin soporte multilingüe ni de lenguaje natural: no es un modelo de texto; cualquier caso de uso conversacional queda fuera de su alcance.
- Nomenclatura no verificada: la variante `noside` y el `chunk_size=100` no están explicados en la model card, por lo que su impacto en el rendimiento es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/demo4_chunk_size100_noside
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset asociado: https://huggingface.co/datasets/ketiholo/demo4
