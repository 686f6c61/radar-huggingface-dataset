# phawitbinabik/act_lerobot_p3_split_act

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `phawitbinabik/act_lerobot_p3_split_act`, contiene una política ACT entrenada con LeRobot sobre el dataset `phawitbinabik/lerobot_p3_split_act` y publicada en Hugging Face Hub con licencia Apache 2.0.

El modelo resuelve el problema del control robótico de manipulación a partir de demostraciones teleoperadas: en lugar de predecir una acción por paso de control, genera un bloque de acciones futuras que se ejecutan de forma consistente, lo que reduce el error de acumulación y mejora la estabilidad en tareas de precisión. Es relevante para quien quiera desplegar o reproducir políticas de imitación sobre robots tipo SO-100/SO-101 con el ecosistema LeRobot sin entrenar desde cero.

La ficha se basa exclusivamente en la información pública del repositorio: 51.689.104 parámetros en formato safetensors, un tamaño de repositorio de 0,2 GB, 22 descargas y ningún "like". No se han publicado detalles sobre composición del dataset, hiperparámetros de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no aplica: modelo de robótica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de aprendizaje por imitación compuesta por un encoder visual (habitualmente ResNet preentrenado) que procesa las observaciones de cámara, un transformer encoder que fusiona observaciones y estado propioceptivo, y un transformer decoder que predice un chunk de acciones de longitud fija. La innovación central del método es la predicción de chunks con agregación temporal (temporal ensembling), que suaviza las transiciones entre chunks consecutivos y mitiga el problema de la varianza en la predicción paso a paso.

El entrenamiento se realiza por imitación supervisada sobre episodios teleoperados. En este repositorio no se especifican el número de episodios, la composición del dataset `phawitbinabik/lerobot_p3_split_act`, el número de tokens o frames procesados, ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco se documentan hiperparámetros como la longitud del chunk, el tamaño del batch o la resolución de entrada. La model card únicamente indica que la política fue entrenada y subida al Hub con LeRobot.

## Capacidades

- Control robótico de manipulación mediante predicción de chunks de acciones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones visuales y estado propioceptivo del robot.
- Ejecución de políticas en robots compatibles con LeRobot (la model card menciona `so100_follower` en el ejemplo de evaluación).
- Integración con el flujo de entrenamiento y evaluación de LeRobot (`lerobot-train`, `lerobot-record`).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: es una política de robótica, no un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni generación de texto.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política predice chunks de acciones que se ejecutan de forma consistente, lo que resulta adecuado para tareas de pick-and-place donde el error acumulado por paso es crítico.
- Reproducción de experimentos de aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT sobre el mismo dataset `lerobot_p3_split_act` sin reentrenar desde cero.
- Despliegue en robots de bajo coste tipo SO-100: el tamaño de 51,7 M de parámetros y 0,2 GB de pesos permite ejecutar la política en hardware modesto junto al stack LeRobot.
- Evaluación de políticas con `lerobot-record`: el modelo puede cargarse directamente con `--policy.path` para generar episodios de evaluación y medir tasas de éxito.
- Prototipado de pipelines de teleoperación a imitación: útil para validar la cadena completa dataset → entrenamiento → despliegue en un robot real antes de escalar a datasets mayores.
- Docencia y formación en robótica: ejemplo reproducible de ACT con licencia permisiva para usar en cursos o talleres sobre LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas sobre el dataset `phawitbinabik/lerobot_p3_split_act`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros (los pesos ocupan aproximadamente 0,2 GB en safetensors); el consumo real depende del encoder visual y del tamaño de las observaciones de entrada.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el despliegue sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch en CUDA o CPU.
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y la resolución de las cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phawitbinabik/act_lerobot_p3_split_act | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (referencia) | variable según checkpoint | no aplica | no disponible | apache-2.0 | Hugging Face Hub / LeRobot |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | Repositorios de investigación |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría (políticas de imitación para robótica) y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset concreto (`lerobot_p3_split_act`), la política hereda los sesgos de las demostraciones teleoperadas: posiciones iniciales, iluminación, objetos y disposición del entorno.
- Riesgo de alucinación: en robótica se traduce en acciones fuera de distribución cuando el entorno difiere del de entrenamiento; no hay evaluación publicada que cuantifique este riesgo.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje, pero la generalización está limitada al dominio visual y físico del dataset de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Caveats para producción: no se documentan la longitud del chunk, la frecuencia de control ni las cámaras utilizadas; es imprescindible validar la política en el robot objetivo antes de desplegarla.
- El repositorio tiene 22 descargas y 0 "likes", lo que indica escasa validación por parte de la comunidad.
- No se especifican los requisitos exactos de versión de LeRobot ni de las dependencias, lo que puede complicar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/act_lerobot_p3_split_act
- Dataset de entrenamiento: https://huggingface.co/datasets/phawitbinabik/lerobot_p3_split_act
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
