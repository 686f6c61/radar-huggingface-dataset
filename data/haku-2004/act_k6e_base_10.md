# Haku-2004/act_k6e_base_10

## Resumen

`act_k6e_base_10` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario Haku-2004 en Hugging Face mediante la librería LeRobot de Hugging Face, y se distribuye con licencia Apache 2.0. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a control de robots manipuladores.

El modelo resuelve el problema de la generación de políticas de control a partir de demostraciones teleoperadas: aprende de un dataset concreto (`Haku-2004/k6_20_20261113_173939`) y produce secuencias de acciones para un robot seguidor (el ejemplo de la model card usa `so100_follower`). No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que mapea observaciones (típicamente imágenes de cámaras y estado de las articulaciones) a comandos motores.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, evaluación y despliegue de políticas robóticas open source con un formato reproducible. Su tamaño reducido permite ejecutarlo en hardware modesto, lo que lo hace útil para prototipado rápido en laboratorios y proyectos de robótica de bajo coste. No se dispone de información sobre idiomas soportados ni sobre resultados de benchmarks publicados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de texto; opera sobre ventanas de observación definidas en la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT combina un codificador visual (típicamente una CNN o un backbone tipo ResNet) que procesa las imágenes de las cámaras del robot, un codificador de estado que procesa las lecturas de las articulaciones y un decodificador transformer que genera un *chunk* de acciones futuras. La innovación principal del método, descrita en el paper arXiv:2304.13705, es predecir bloques de acciones en lugar de una acción por paso, lo que reduce el error de acumulación y mejora la estabilidad del control. Se emplea además una técnica de *temporal ensembling* para suavizar las predicciones entre chunks consecutivos.

El entrenamiento es de tipo imitación supervisada (behavior cloning) sobre el dataset `Haku-2004/k6_20_20261113_173939`, compuesto por episodios teleoperados. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens o pasos de entrenamiento, ni sobre el uso de RLHF o DPO (técnicas que no aplican a este tipo de política). El modelo se ha entrenado y publicado con LeRobot, lo que implica que sigue la configuración estándar de la herramienta para el tipo de política `act`.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y de estado.
- Predicción por chunks de acciones, lo que mejora la suavidad y la robustez frente a errores acumulados.
- Integración con LeRobot para entrenamiento (`lerobot-train`) y evaluación/inferencia (`lerobot-record`).
- Compatible con robots seguidores tipo `so100_follower` según el ejemplo de la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión general, audio ni modo *thinking*.
- No se documentan capacidades de generalización más allá del dataset y la tarea de entrenamiento.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de demostraciones teleoperadas, usando las cámaras del robot como entrada y generando comandos articulares en tiempo real.
- Prototipado rápido de políticas con LeRobot: un equipo puede entrenar una política ACT desde cero con `lerobot-train` sobre su propio dataset y desplegarla con `lerobot-record` en pocas horas, gracias al tamaño compacto del modelo (51,7 M de parámetros).
- Evaluación comparativa de métodos de imitación: sirve como línea base ACT para comparar con otros métodos de la misma familia (Diffusion Policy, VQ-BeT) en el mismo robot y dataset.
- Robots de bajo coste tipo SO-100/SO-101: el reducido tamaño del modelo permite inferencia en GPUs de consumo o incluso en CPU, adecuado para plataformas educativas y de aficionado.
- Automatización de tareas repetitivas en entornos controlados: el modelo aprende una tarea concreta y la reproduce de forma consistente, útil en cadenas de montaje sencillas o clasificación de objetos.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del *action chunking* y del *temporal ensembling* en la estabilidad del control con un modelo de referencia reproducible.
- Reentrenamiento y ajuste fino sobre nuevos datasets: al ser Apache 2.0 y estar integrado en LeRobot, se puede adaptar a otras tareas o morfologías de robot con un coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 dado el tamaño del modelo (51,7 M de parámetros, aproximadamente 0,2 GB de pesos); en FP16 o cuantizado, aún menos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se ha documentado entrenamiento con `--policy.device=cuda` en LeRobot, por lo que una RTX 3060, RTX 4090, A100 o H100 funcionan sobradamente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso es viable la inferencia en CPU para tareas de baja frecuencia de control.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la frecuencia de control del robot y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6e_base_10 (este modelo) | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no disponible | no disponible | MIT (implementación de referencia) | Repositorios de investigación |
| VQ-BeT | no disponible | no disponible | no disponible | MIT (implementación de referencia) | Repositorios de investigación |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación rigurosa con alternativas de la misma categoría. Las alternativas citadas (Diffusion Policy, VQ-BeT) son métodos de imitación comparables en el ecosistema LeRobot, pero sus métricas dependen de la tarea y del dataset, por lo que no se pueden comparar directamente sin una evaluación común.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset concreto de teleoperación, la política hereda los sesgos y patrones de las demostraciones (posiciones, velocidades, objetos y condiciones de iluminación específicas).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de generalización errónea fuera de la distribución del dataset, produciendo acciones incorrectas o inseguras.
- Limitaciones de contexto e idioma: el modelo no procesa lenguaje natural ni tiene capacidades multilingües; su "contexto" es la ventana de observaciones definida en la configuración de entrenamiento, no disponible en la información.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Caveat para producción: es un modelo de investigación con 0 descargas y 0 likes en el momento de la ficha, sin evaluación publicada; no debe desplegarse en entornos físicos sin pruebas de seguridad exhaustivas.
- Dependencia del dataset y del robot: el modelo está entrenado para un robot y una tarea específicos; su uso con otra morfología o cámara requerirá reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6e_base_10
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
