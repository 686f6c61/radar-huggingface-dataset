# kavin734/ihategreenblocks_merged_act_20261125_122325

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, publicado por el usuario kavin734 bajo el identificador `ihategreenblocks_merged_act_20261125_122325`, contiene una política ACT entrenada con LeRobot sobre el dataset `kavin734/ihategreenblocks_merged`. El modelo está pensado para ejecutar tareas de manipulación sobre un robot tipo SO-100 (según el comando de evaluación de la model card) y se distribuye con licencia Apache 2.0.

El modelo es un transformer ligero de aproximadamente 51,7 millones de parámetros (dato extraído del archivo safetensors del repositorio), con un tamaño total de repo de 0,2 GB. No es un modelo de lenguaje: no procesa texto ni genera respuestas, sino que mapea observaciones visuales y de estado del robot a secuencias de acciones motoras. Su relevancia radica en que ejemplifica el flujo de trabajo actual de LeRobot para entrenar y desplegar políticas de imitación en hardware asequible, y sirve como referencia práctica de cómo se publican y versionan políticas robóticas en Hugging Face.

Al tratarse de un repositorio de autor individual, con cero descargas y cero likes en el momento de la consulta, y sin model card extendida más allá de la plantilla estándar de LeRobot, la información disponible es limitada. Los datos que faltan se indican explícitamente como "no disponible" a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política robótica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador visual (que procesa las imágenes de las cámaras del robot) con un transformer que genera predicciones de acciones en forma de chunks: en lugar de predecir una única acción por paso de tiempo, el modelo emite una secuencia corta de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. El paper original reporta altas tasas de éxito en tareas de manipulación aprendidas a partir de datos de teleoperación.

Este repositorio concreto ha sido entrenado con LeRobot sobre el dataset `kavin734/ihategreenblocks_merged`, presumiblemente una fusión de episodios de teleoperación. No se dispone de información sobre el número de episodios, el número de tokens o frames de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos o regularización específicas. Tampoco se documenta el uso de RLHF, DPO ni ningún otro ajuste posterior al entrenamiento supervisado. La model card únicamente incluye los comandos de entrenamiento y evaluación estándar de LeRobot, sin detalles adicionales sobre hiperparámetros.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos: entrenado específicamente para la tarea del dataset `ihategreenblocks_merged`, cuyo nombre sugiere una tarea de recogida o manipulación de bloques verdes.
- Ejecución en robots SO-100: la model card incluye un ejemplo de evaluación con `--robot.type=so100_follower`, lo que indica compatibilidad con esa plataforma.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades propias de los modelos fundacionales multimodales.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: la política puede ejecutar la secuencia de recogida y colocación de bloques sobre la que fue entrenada, usando las cámaras del robot SO-100 como entrada y emitiendo chunks de acciones articulares.
- Reproducción de demostraciones de teleoperación: útil para validar que el pipeline de LeRobot captura correctamente las trayectorias y que la política las reproduce con fidelidad en el mismo entorno.
- Prototipado rápido de políticas de imitación: sirve como plantilla para equipos que quieran entrenar su propia política ACT sobre un dataset propio, copiando la estructura de repositorio y los comandos de la model card.
- Evaluación comparativa de métodos de imitación: al ser una política ACT estándar, puede usarse como línea base frente a otros métodos disponibles en LeRobot (por ejemplo, Diffusion Policy) sobre la misma tarea.
- Docencia y formación en robótica de imitación: el reducido tamaño del modelo (51,7 M de parámetros, 0,2 GB) permite experimentar en hardware modesto y entender el flujo completo de entrenamiento y evaluación.
- Integración en bancos de pruebas de robot learning: el checkpoint puede cargarse con `--policy.path` en scripts de evaluación automatizada para medir tasas de éxito por episodio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa (FP32) el peso de los parámetros ronda los 207 MB, y en FP16 unos 103 MB, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no disponible; por el tamaño del modelo, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para inferencia, aunque no hay datos oficiales.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas como RTX 3060, RTX 4060 o superiores, dado el reducido número de parámetros; sin confirmación del autor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado en la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kavin734/ihategreenblocks_merged_act_20261125_122325 (ACT) | 51.678.855 | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | no disponible | Apache 2.0 (segun LeRobot) | Hugging Face |
| Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada. La comparación se limita a la disponibilidad y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser una política entrenada sobre un dataset concreto, heredará los sesgos de las demostraciones de teleoperación (posiciones, iluminación, objetos y configuraciones específicas).
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero la política puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni soporta instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset `ihategreenblocks_merged` antes de un uso comercial.
- Caveat para producción: el repositorio tiene cero descargas y cero likes, sin documentación adicional sobre hiperparámetros, número de episodios o tasas de éxito; no se recomienda su uso en producción sin una evaluación independiente en el robot objetivo.
- El nombre del repositorio incluye una fecha futura (20261125), lo que sugiere un versionado automático y no una validación manual del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kavin734/ihategreenblocks_merged_act_20261125_122325
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
