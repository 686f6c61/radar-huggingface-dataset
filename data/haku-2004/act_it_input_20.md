# Haku-2004/act_it_input_20

## Resumen

`act_it_input_20` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario Haku-2004 en Hugging Face. No es un modelo de lenguaje: es un controlador robótico entrenado con LeRobot que, a partir de observaciones visuales y del estado del robot, predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo tiene 51.671.174 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo se ha entrenado sobre el dataset `Haku-2004/i_4seg`, presumiblemente una colección de episodios de teleoperación segmentados. El pipeline declarado es `robotics` y la librería asociada es `lerobot`, lo que implica que su uso previsto es el entrenamiento y la evaluación de políticas de manipulación con el stack de Hugging Face para robótica.

Su relevancia es acotada: se trata de un checkpoint de investigación sin descargas ni validación pública (0 descargas, 0 likes en el momento de la consulta), por lo que debe considerarse un artefacto experimental reproducible antes que un componente listo para producción. La información disponible sobre datos de entrenamiento, hiperparámetros y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; depende de la ventana de observaciones configurada en LeRobot) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone transformer que procesa las observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) con un decodificador que genera un chunk de acciones futuras de forma conjunta. La predicción por chunks reduce el error de compounding y suaviza el control, lo que en la práctica se traduce en tasas de éxito superiores a las de políticas que predicen un único paso. El modelo incorpora habitualmente un estilo de entrenamiento con regularización tipo CVAE sobre la variable latente de estilo, tal como describe el paper original.

En cuanto a los datos, la model card solo indica el dataset `Haku-2004/i_4seg`; no se especifican número de episodios, número de tokens ni composición. No hay información sobre RLHF, DPO ni ajuste posterior: es aprendizaje supervisado por imitación puro. Tampoco se documentan hiperparámetros de entrenamiento (tamaño de chunk, resolución de imagen, aumentos de datos) más allá de los valores por defecto que aplica `lerobot-train` con `--policy.type=act`. Cualquier reproducción exigirá consultar la configuración del dataset de origen.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de un modelo de recompensa.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatible con robots del ecosistema LeRobot, como el `so100_follower` que aparece en los ejemplos de la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, de audio ni modo de razonamiento explícito.
- No se documentan capacidades de generalización zero-shot a tareas u objetos no vistos.

## Casos de uso

- Manipulación robótica de laboratorio: replicar una tarea de pick-and-place teleoperada sobre un brazo tipo SO-100, usando el checkpoint como punto de partida y evaluándolo con `lerobot-record` sobre 10 episodios para medir la tasa de éxito.
- Reproducción de experimentos de ACT: servir como referencia para comparar configuraciones de tamaño de chunk, resolución de cámara o aumentos de datos sobre el mismo dataset `i_4seg`.
- Fine-tuning sobre un dataset propio: partir de estos pesos y reentrenar con `lerobot-train --policy.type=act` sobre episodios adicionales del mismo robot para adaptar la política a nuevas posiciones de objetos.
- Docencia y prototipado en robótica: demostrar el flujo completo de LeRobot (grabación, entrenamiento, evaluación) con un modelo pequeño de 51,7 M de parámetros que cabe en una GPU de consumo.
- Investigación en aprendizaje por imitación: analizar el efecto del chunking de acciones sobre la suavidad de la trayectoria y la acumulación de error en horizontes largos.
- Base para pipelines de evaluación automatizada: integrar el checkpoint en un banco de pruebas que ejecute episodios repetidos y registre métricas de éxito y de esfuerzo de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas entrenadas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión de entrenamiento (fp32) para 51,7 M de parámetros; en la práctica, el consumo dominante proviene de los buffers de imagen y del runtime de PyTorch, no de los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA moderna es suficiente; una RTX 3060 o superior permite entrenamiento y evaluación sin problemas.
- Cabe en GPU de consumo: sí, en toda la gama RTX 20xx/30xx/40xx y en GPUs de portátil con al menos 4-6 GB de VRAM para el entrenamiento con lotes pequeños.
- Opciones de despliegue: el stack nativo es LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Dependen del robot, de la frecuencia de control y del hardware de inferencia; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_it_input_20 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | tasas de éxito altas reportadas en el paper, sin cifras en esta ficha | no disponible en la informacion | referencia académica |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible en la informacion | no disponible | no disponible | varía según checkpoint | ecosistema LeRobot |

La comparación cuantitativa no es posible con la información disponible: no hay métricas publicadas para este checkpoint ni cifras extraídas del paper en el material proporcionado.

## Limitaciones y advertencias

- Modelo de nicho sin validación pública: 0 descargas y 0 likes, sin evidencia de que la política funcione fuera del entorno de entrenamiento.
- Fuerte dependencia del dataset `Haku-2004/i_4seg`: la política probablemente no generaliza a otras cámaras, brazos, iluminación o posiciones de objetos distintas de las vistas en teleoperación.
- Riesgo de sobreajuste y de fallo silencioso: un modelo de imitación puede ejecutar trayectorias plausibles pero incorrectas sin señal de error explícita.
- Sin información sobre sesgos: no se documenta la composición del dataset ni posibles desequilibrios en las demostraciones.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación de entrenamiento traslada todo el riesgo de validación al integrador.
- No apto para seguridad crítica: no hay análisis de modos de fallo, límites de par ni paradas de emergencia documentadas; cualquier despliegue físico requiere capas de seguridad externas.
- Idiomas y contexto: no aplica; no debe evaluarse como un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_it_input_20
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_4seg
