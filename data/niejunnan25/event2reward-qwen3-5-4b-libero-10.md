# niejunnan25/Event2Reward-Qwen3.5-4B-LIBERO-10

## Resumen

Event2Reward-Qwen3.5-4B-LIBERO-10 es un modelo de recompensa para robótica desarrollado por Junnan Nie y colaboradores en el marco del trabajo Event2Reward: Learning Robotic Rewards from Progress Relations. Se construye sobre Qwen3.5-4B y se especializa en estimar el progreso de una tarea de manipulación a partir de una descripción textual, la imagen inicial del episodio, una imagen objetivo procedente de otra trayectoria exitosa independiente y cinco fotogramas recientes. La variación de esa estimación de progreso se utiliza como recompensa densa para aprendizaje por refuerzo.

El modelo resuelve el problema de la escasez de recompensas en RL robótico: en lugar de depender de una señal binaria de éxito al final del episodio, proporciona una señal continua en el intervalo [0, 1] que refleja el avance hacia el objetivo. Esta versión concreta está ajustada sobre el benchmark LIBERO-10 durante 500 pasos, partiendo del checkpoint Stage2, e incorpora una cabeza de progreso de 101 bins y una cabeza auxiliar de tendencia de tres clases, todo en BF16.

Es relevante porque demuestra que un modelo de lenguaje de 4 000 millones de parámetros puede actuar como estimador de recompensa visual-temporal en entornos de manipulación, y porque el sistema completo de RL (SAC residual con esta recompensa) alcanza un 54,64 ± 8,70 % de éxito de política en LIBERO-10 según el paper, un resultado que corresponde al sistema de RL completo y no al checkpoint aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con cabeza de progreso de 101 bins y cabeza de tendencia de 3 clases |
| Parametros totales | 4B (aproximado, segun el nombre del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados en BF16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 9,1 GB |
| Pipeline | robotics |
| Modelo base | niejunnan25/Event2Reward-Qwen3.5-4B-Stage2 |
| Entrada | tarea (texto), imagen inicial, imagen objetivo, 5 fotogramas recientes a 10 Hz |
| Salida | progreso en [0, 1] y tendencia (3 clases) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 4 000 millones de parámetros, y le añade dos cabezas: una cabeza de progreso con 101 bins que discretiza la estimación de avance en [0, 1], y una cabeza de tendencia de tres clases que actúa como señal auxiliar. La entrada combina una descripción textual de la tarea, la primera imagen del episodio, una imagen objetivo tomada de una trayectoria exitosa independiente y cinco fotogramas recientes muestreados a 10 Hz, lo que exige un codificador visual y un mecanismo de fusión multimodal-temporal.

El entrenamiento se realizó en dos etapas: primero un checkpoint Stage2 y después un ajuste fino sobre LIBERO-10 durante 500 pasos, con supervisión temporal sobre demostraciones exitosas y relaciones de progreso sobre rollouts anotados con eventos. El paper describe el uso de esta señal como recompensa densa en un esquema de SAC residual. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Estimación de progreso de tareas de manipulación robótica en el intervalo [0, 1] a partir de observaciones visuales y descripción textual.
- Cálculo de recompensa densa mediante la diferencia de estimaciones de progreso entre pasos consecutivos.
- Procesamiento multimodal: texto de tarea, imagen inicial, imagen objetivo e historial de cinco fotogramas.
- Salida auxiliar de tendencia (tres clases) como señal complementaria, no validada como detector de eventos.
- Ajuste específico al benchmark LIBERO-10 de manipulación.
- Integración con el paquete `event2reward` para inferencia por lotes y línea de comandos.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni multilingüismo general; el modelo está especializado en estimación de recompensa.

## Casos de uso

- Entrenamiento por refuerzo de políticas de manipulación: el modelo proporciona recompensas densas paso a paso que sustituyen a la señal binaria de éxito, permitiendo aprender con más señal por episodio en tareas de LIBERO-10.
- Evaluación de trayectorias en producción robótica: dado un episodio grabado, se estima el progreso en cada paso para detectar estancamientos o retrocesos antes de que el robot falle.
- Filtrado de datos de demostración: se puntúan trayectorias recogidas por teleoperación y se descartan aquellas con progreso inconsistente o decreciente.
- Recompensa en entornos simulados con objetivo visual: al usar una imagen meta de otra trayectoria exitosa, el modelo se adapta a variaciones de escena sin reentrenar la política.
- Supervisión de tareas de apilado y colocación: la descripción textual permite reutilizar el mismo modelo para distintas instrucciones del benchmark sin cambiar los pesos.
- Investigación en aprendizaje por refuerzo con recompensas aprendidas: sirve como componente de referencia para comparar estimadores de progreso en LIBERO-10.
- Análisis de rollouts para depuración: la salida de tendencia ayuda a inspeccionar tramos de un episodio, con la cautela de que no es un detector de eventos validado.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Éxito de política en LIBERO-10 | 54,64 ± 8,70 % | SAC residual con esta recompensa; media ± desviación típica sobre cinco semillas; resultado del sistema de RL completo, no del checkpoint aislado |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8-9 GB solo para pesos, más memoria para el codificador visual, el historial de cinco fotogramas y las activaciones; se recomienda al menos 16 GB para operar con comodidad.
- El tamaño del repositorio es de 9,1 GB, coherente con pesos en BF16 de un modelo de 4B más componentes adicionales.
- GPU recomendadas: A100 o H100 para inferencia por lotes y entrenamiento de políticas; RTX 4090 (24 GB) para inferencia individual y experimentación.
- Cabe en GPU de consumo con 24 GB en BF16; en GPUs de 16 GB puede requerir cuantización, que no está documentada en la información disponible.
- Opciones de despliegue: el paquete `event2reward` con su API `Event2Reward.from_pretrained` y su interfaz de línea de comandos; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Event2Reward-Qwen3.5-4B-LIBERO-10 | 4B | no disponible | Recompensa/progreso en LIBERO-10 | Apache-2.0 | Hugging Face |
| Event2Reward-Qwen3.5-4B-Stage2 | 4B | no disponible | Etapa previa del mismo pipeline | Apache-2.0 (presumible, no confirmado) | Hugging Face |
| Qwen3.5-4B | 4B | no disponible | Modelo de lenguaje general | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El progreso es una estimación aprendida, no una probabilidad de éxito: puede disminuir, subestimar una tarea completada o sobreestimar una fallida.
- No existe un umbral que separe éxito de fracaso a partir de la salida de progreso.
- La salida de tendencia es auxiliar y no constituye un detector de eventos validado.
- La imagen objetivo debe provenir de un episodio distinto al que se evalúa; usar el propio episodio invalida la señal.
- Los fotogramas deben muestrearse a 10 Hz desde una única cámara externa; al inicio del episodio se repite el primer fotograma.
- El ajuste está realizado sobre LIBERO-10; no se documenta su generalización a otros entornos o tareas.
- No se documentan sesgos conocidos, riesgos de alucinación lingüística ni comportamiento multilingüe, al ser un modelo especializado en estimación de recompensa.
- El resultado del 54,64 % corresponde al sistema de RL completo con cinco semillas, no al checkpoint de forma aislada; no debe citarse como rendimiento del modelo por sí solo.
- Licencia Apache-2.0, derivada de Qwen3.5-4B; deben revisarse LICENSE, NOTICE y LICENSES del repositorio para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-LIBERO-10
- Modelo base Stage2: https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-Stage2
- Modelo Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2610.39212
- Página del proyecto: https://niejunnan25.github.io/Event2Reward/
- Código: https://github.com/niejunnan25/Event2Reward
- Guía de inferencia: https://github.com/niejunnan25/Event2Reward/blob/main/docs/inference.md
- Guía de entrenamiento (LIBERO): https://github.com/niejunnan25/Event2Reward/blob/main/docs/training.md#libero
- Instalación: https://github.com/niejunnan25/Event2Reward#installation
