# Haku-2004/act_k4

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y permite alcanzar tasas de éxito elevadas con datos de teleoperación. Este repositorio concreto, `Haku-2004/act_k4`, es una política ACT entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, sobre el dataset `Haku-2004/k4_20261102_134735`.

El modelo cuenta con 51.668.614 parámetros (aproximadamente 51,7 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Está etiquetado con el pipeline `robotics` y la licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones (típicamente imágenes de cámaras y estado de las articulaciones) a comandos de actuación para un robot.

Su relevancia es acotada y práctica: sirve como checkpoint de referencia para reproducir o desplegar una política de manipulación entrenada con LeRobot sobre un robot tipo SO-100 (el ejemplo de evaluación de la model card usa `so100_follower`). Al tener cero descargas y cero likes en el momento de la consulta, debe tratarse como un artefacto experimental de un autor individual, no como un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observación definidas por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un codificador visual (procesa las imágenes de las cámaras del robot) con un transformer codificador-decodificador que genera un chunk de acciones futuras de longitud fija en cada paso de inferencia. La innovación central del método, descrita en el paper arXiv:2304.13705, es predecir secuencias de acciones en lugar de acciones individuales, lo que mitiga el problema de composición de errores en tareas de manipulación de horizonte largo y estabiliza el comportamiento. El modelo incorpora además una técnica de temporal ensembling durante la inferencia para suavizar las predicciones entre chunks consecutivos.

En cuanto al entrenamiento, se trata de aprendizaje por imitación supervisado (behavior cloning) sobre el dataset `Haku-2004/k4_20261102_134735`, compuesto por episodios de teleoperación. No se dispone de información sobre el número de episodios, el número de tokens o muestras, la composición exacta del dataset, ni sobre el uso de RLHF o DPO (técnicas no aplicables a este tipo de política). Tampoco se documentan en la información disponible los hiperparámetros de entrenamiento, la resolución de las cámaras ni la configuración del robot empleada.

## Capacidades

- Control robótico por imitación: genera comandos de actuación a partir de observaciones visuales y del estado del robot.
- Predicción de chunks de acciones: emite secuencias cortas de acciones por paso de inferencia, lo que reduce la acumulación de errores.
- Manipulación de horizonte corto y medio: adecuado para tareas de pick-and-place, empuje, inserción y similares, siempre que se hayan demostrado en el dataset de entrenamiento.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes basados en lenguaje; el "multi-paso" se limita a la ejecución secuencial de chunks de acción.
- Capacidades multilingües: no aplica.
- Capacidades especiales: temporal ensembling en inferencia; no dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación pick-and-place en laboratorio: desplegar la política en un robot SO-100 con `lerobot-record` para recoger y depositar objetos previamente demostrados en teleoperación; el chunking de acciones aporta estabilidad en el agarre.
- Reproducción de experimentos de aprendizaje por imitación: usar el checkpoint como línea base para comparar variantes de ACT, cambios en el dataset o configuraciones de cámara, dado su tamaño reducido (0,2 GB) y su licencia permisiva.
- Prototipado rápido de políticas robóticas: al estar entrenado y empaquetado en formato LeRobot, permite iterar sobre la evaluación sin reentrenar desde cero.
- Investigación en comportamiento clonado: servir como ejemplo reproducible de un pipeline completo (dataset, entrenamiento, checkpoint, evaluación) para docencia o publicaciones.
- Automatización de tareas repetitivas de sobremesa: tareas de apilado, ordenación o traslado de piezas pequeñas en un entorno controlado con iluminación y disposición similares a las del dataset de entrenamiento.
- Base para fine-tuning con datos propios: partir de estos pesos y añadir episodios adicionales del mismo robot para adaptar la política a nuevas posiciones de objetos o variaciones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, e incluso en CPU para evaluación no interactiva.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); para entrenamiento desde cero se recomienda al menos una RTX 3090 o superior, aunque no se dispone de cifras oficiales de consumo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas; el cuello de botella real es el procesamiento de imágenes de las cámaras y la frecuencia de control del robot, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware, del número de cámaras y de la frecuencia de control configurada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k4 | 51,7 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (paper arXiv:2304.13705) | no disponible en la información | no disponible | tasas de éxito reportadas en el paper, no comparables directamente | código de referencia público | paper y repositorio de los autores |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | no disponible | no disponible | variable según checkpoint | Hugging Face / LeRobot |

No se dispone de datos suficientes para establecer una comparación cuantitativa fiable con alternativas; la comparativa anterior es meramente cualitativa.

## Limitaciones y advertencias

- Modelo específico de una tarea y un robot: la política está entrenada sobre un único dataset (`k4_20261102_134735`) y probablemente sobre una configuración concreta de robot y cámaras; su generalización a otras tareas, objetos o entornos es muy limitada.
- Sin validación comunitaria: cero descargas y cero likes; no hay evidencia externa de su rendimiento real ni de la calidad de los episodios de entrenamiento.
- Riesgo de fallo silencioso: en aprendizaje por imitación, el modelo puede ejecutar acciones plausibles pero incorrectas ante distribuciones de observación no vistas (cambios de iluminación, oclusiones, objetos nuevos).
- Sesgos de los datos de teleoperación: el comportamiento refleja los sesgos del operador humano que generó las demostraciones (velocidad, trayectorias, preferencias de agarre).
- Sin capacidades lingüísticas ni de razonamiento simbólico: no debe usarse para tareas de texto, código o matemáticas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; para producción conviene auditar el dataset de origen y los términos del robot empleado.
- Caveat de producción: no se documentan métricas de éxito, número de episodios ni protocolo de evaluación, por lo que no se recomienda su despliegue en entornos reales sin una evaluación propia con `lerobot-record`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k4
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k4_20261102_134735
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
