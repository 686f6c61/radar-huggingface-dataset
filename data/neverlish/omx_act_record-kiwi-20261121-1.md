# neverlish/omx_act_record-kiwi-20261121-1

## Resumen

`neverlish/omx_act_record-kiwi-20261121-1` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers), publicado originalmente en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario `neverlish` y se ha entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es un controlador que traduce observaciones visuales y de estado del robot en secuencias de acciones motoras.

La arquitectura es un transformer ACT con 51.668.614 parámetros (aproximadamente 51,7 M), empaquetado en safetensors con un tamaño de repositorio de 0,2 GB. La licencia es Apache 2.0 y el pipeline declarado es `robotics`. El modelo se ha entrenado sobre el dataset `neverlish/record-kiwi-20261116-1`, presumiblemente una grabación de teleoperación asociada a una tarea concreta (el sufijo "kiwi" sugiere un objeto o entorno específico).

Su relevancia es acotada: se trata de un checkpoint de política para un robot y una tarea concretos, útil para reproducir el entrenamiento o evaluar el pipeline de LeRobot, pero no es un modelo general. No tiene capacidades de generación de texto, razonamiento lingüístico ni visión general; su función es el control motor aprendido por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observación y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. La formulación original combina un codificador visual, un transformer que procesa la secuencia de observaciones y un decodificador que emite un chunk de acciones; el chunking reduce el error de acumulación y mejora la estabilidad del control. El modelo tiene 51.668.614 parámetros y se distribuye en safetensors dentro del ecosistema LeRobot.

El entrenamiento se ha realizado con LeRobot sobre el dataset `neverlish/record-kiwi-20261116-1`, que no está descrito en detalle en la información disponible (número de episodios, composición, frecuencia de control y configuración del robot no disponibles). No se documenta si hubo aumento de datos, regularización o ajuste fino posterior. La model card no incluye detalles sobre hiperparámetros, número de tokens ni proceso de validación.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones, orientado a tareas de manipulación teleoperadas.
- Aprendizaje a partir de demostraciones: reproduce comportamientos capturados en el dataset de entrenamiento.
- Integración con LeRobot: entrenamiento con `lerobot-train` y evaluación/inferencia con `lerobot-record`.
- Compatibilidad con robots del ecosistema LeRobot (la model card cita `so100_follower` como ejemplo de evaluación).
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas ni visión general.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica.

## Casos de uso

- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar configuraciones de ACT dentro de LeRobot, cargándolo con `--policy.path` en `lerobot-record`.
- Evaluación de pipelines de teleoperación: permite validar de extremo a extremo la captura de datos, el entrenamiento y la ejecución en un robot `so100_follower` con un número fijo de episodios.
- Control de manipulación en laboratorio: adecuado para tareas acotadas y repetitivas (por ejemplo, manipular un objeto concreto como sugiere el nombre "kiwi") en entornos controlados.
- Docencia y formación: útil para demostrar el flujo completo de aprendizaje por imitación con LeRobot sin necesidad de entrenar desde cero.
- Base para ajuste fino: al ser un checkpoint ACT pequeño (51,7 M de parámetros), puede servir como punto de partida para reentrenar sobre nuevos datasets de teleoperación.
- Pruebas de integración de hardware: permite comprobar la comunicación entre el stack de LeRobot y un robot físico antes de invertir en grabaciones de datos más amplias.
- Benchmark interno de políticas: comparar la tasa de éxito de esta política frente a otras políticas ACT entrenadas con el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros, el peso en precisión completa ronda los 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060 o superior es más que adecuada. Para entrenamiento, se recomienda una GPU con al menos 8-12 GB de VRAM, aunque el dato exacto no está disponible.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de CUDA mediante `--policy.device=cuda`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-kiwi-20261121-1 | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | no disponible | normalmente Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | normalmente Apache 2.0 | Hugging Face |
| Políticas VQ-BeT / TDMPC (LeRobot) | no disponible | no aplica | no disponible | normalmente Apache 2.0 | Hugging Face |

No se dispone de datos cuantitativos para una comparación rigurosa con alternativas concretas; la comparativa se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea y un robot concretos; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin datos de evaluación: no hay tasas de éxito publicadas, por lo que no se puede garantizar su fiabilidad en producción.
- Dependencia del dataset: el comportamiento hereda los sesgos y la distribución de `neverlish/record-kiwi-20261116-1`, cuyas características no están documentadas.
- Riesgo de fallo fuera de distribución: cambios de iluminación, posición de cámara u objeto pueden degradar el rendimiento sin aviso.
- Sin capacidades lingüísticas ni multimodales generales: no debe emplearse como modelo de texto o visión.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las dependencias de LeRobot y del dataset asociado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- Caveat de producción: requiere integración con el stack LeRobot y con el hardware específico; no es un servicio desplegable de forma genérica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neverlish/omx_act_record-kiwi-20261121-1
- Dataset de entrenamiento: https://huggingface.co/datasets/neverlish/record-kiwi-20261116-1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
