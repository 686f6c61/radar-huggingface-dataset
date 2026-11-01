# ketiholo/demo3_noside_env_bias2_ch100

## Resumen

`ketiholo/demo3_noside_env_bias2_ch100` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario ketiholo en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y se distribuye con licencia Apache 2.0.

Se trata de un checkpoint de demostración entrenado sobre el dataset `ketiholo/demo3`, sin datos publicados sobre el robot objetivo, la tarea concreta ni el número de episodios de entrenamiento. El sufijo del identificador (`noside_env_bias2_ch100`) sugiere una variante sin visión lateral, con sesgo de entorno y un chunk size de 100 acciones, aunque el autor no documenta estos detalles en la model card.

Su relevancia es acotada: es un ejemplo reproducible de un pipeline completo de LeRobot con ACT, útil para desarrolladores que quieran inspeccionar cómo se estructura una política de imitación entrenada con esta herramienta, más que un modelo listo para desplegar en producción. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es ligero y se puede ejecutar en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.676.295 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador de observaciones (imágenes de cámara y estado del robot) con un transformer que genera un *chunk* de acciones futuras de una sola pasada, en lugar de predecir una acción por paso. Esta predicción por bloques reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. El modelo también incorpora un estilo de entrenamiento con autoencoder condicionado (CVAE) para capturar la variabilidad de las demostraciones humanas.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento, el número de episodios de teleoperación ni si se aplicaron técnicas de aumento de datos o regularización específicas. El nombre del checkpoint sugiere un `chunk_size` de 100, pero el autor no lo confirma. Tampoco se documenta el robot o el entorno físico empleado.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones a partir de observaciones visuales y del estado del robot.
- Predicción de *action chunks*: emite bloques de acciones (posiblemente de 100 pasos según el identificador) que se ejecutan de forma continua.
- Aprendizaje a partir de demostraciones teleoperadas: el modelo se entrena con el dataset `ketiholo/demo3`.
- Integración con LeRobot: se puede cargar con `lerobot-record` y `--policy.path` para evaluación en robot real.
- Sin capacidades de lenguaje natural, tool calling, agentes, matemáticas ni generación de texto.
- Sin capacidades multimodales más allá de la visión necesaria para la política (cámaras del robot).

## Casos de uso

- Evaluación de pipelines de LeRobot: sirve como checkpoint de referencia para probar el flujo `lerobot-record` con un robot SO-100 follower, tal y como sugiere la model card.
- Reproducción de experimentos de ACT: permite inspeccionar la estructura de pesos y la configuración de entrenamiento de una política ACT entrenada con LeRobot.
- Base para *fine-tuning* en tareas similares: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, se puede reentrenar sobre un dataset propio de teleoperación con `lerobot-train`.
- Docencia y prototipado en robótica de imitación: útil en cursos o talleres para mostrar el ciclo completo de entrenamiento y despliegue de una política de imitación.
- Pruebas de integración de hardware: sirve para validar la comunicación entre LeRobot y un brazo robótico antes de entrenar una política definitiva.
- Comparación de variantes de ACT: el nombre del checkpoint sugiere variantes con y sin visión lateral, lo que permite comparar configuraciones de entrada en un mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en fp32), la inferencia cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para pruebas, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo3_noside_env_bias2_ch100 | 51,7 M | no disponible | ACT para robótica | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | ACT para robótica | Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no disponible | Difusión para robótica | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de demostración sin documentación sobre la tarea, el robot ni el dataset de entrenamiento; no se recomienda su uso en producción sin validación previa.
- Riesgo de sobreajuste al dataset `ketiholo/demo3`, del que no se conoce el tamaño ni la diversidad.
- Sin información sobre sesgos: al ser un modelo de control robótico, los sesgos se manifestarían como comportamientos indeseados en el robot, no como sesgos lingüísticos.
- No apto para tareas fuera de la distribución de entrenamiento; la generalización a nuevos entornos u objetos no está garantizada.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset subyacente impide verificar la procedencia de los datos de entrenamiento.
- El nombre del checkpoint sugiere una configuración concreta (sin visión lateral, chunk de 100), pero el autor no lo confirma; verificar antes de reutilizarlo.

## Enlaces

- Hugging Face: https://huggingface.co/ketiholo/demo3_noside_env_bias2_ch100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo3
