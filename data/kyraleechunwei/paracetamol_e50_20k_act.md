# KyraLeeChunWei/Paracetamol_e50_20K_ACT

## Resumen

Paracetamol_e50_20K_ACT es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario KyraLeeChunWei en Hugging Face mediante la librería LeRobot, el framework de Hugging Face para entrenamiento y despliegue de políticas robóticas. El nombre sugiere un entrenamiento de 20.000 pasos sobre el dataset Paracetamol_e50, aunque la model card no detalla la composición de ese dataset.

Se trata de un modelo de robótica de 51,7 millones de parámetros, no de un modelo de lenguaje: su salida son comandos de control para un robot manipulador, típicamente un brazo SO-100 en configuración follower. Resuelve el problema de aprender tareas de manipulación a partir de demostraciones teleoperadas, sin necesidad de programación explícita de la trayectoria ni de un entorno de simulación.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento, publicación en el Hub, evaluación con `lerobot-record`), útil para quien quiera replicar el flujo de trabajo de ACT con hardware de bajo coste. La licencia Apache 2.0 facilita su reutilización, aunque el modelo carece de descargas y validación externa en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política recibe observaciones (imágenes de cámaras y estado de las articulaciones del robot) y predice un fragmento de acciones futuras en lugar de un único paso, lo que reduce el error de composición acumulado típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un codificador visual, un transformer que fusiona observaciones y un decodificador que emite el chunk de acciones.

El modelo se ha entrenado con el flujo de LeRobot sobre el dataset KyraLeeChunWei/Paracetamol_e50, con un total de 20.000 pasos según el identificador del repositorio. No se especifican en la información disponible el número de episodios de demostración, la composición del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF, DPO ni ningún ajuste posterior al entrenamiento supervisado por imitación.

## Capacidades

- Generación de comandos de control para un robot manipulador a partir de observaciones visuales y propioceptivas.
- Predicción de chunks de acciones, lo que permite movimientos más suaves y menor acumulación de error que las políticas de un solo paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita ni entorno simulado.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Despliegue previsto sobre robots SO-100 en configuración follower, según el ejemplo de evaluación de la model card.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modo thinking: no es un modelo generativo de texto.

## Casos de uso

- Replicación de experimentos de ACT: sirve como punto de partida para reproducir el pipeline de LeRobot con un dataset propio, sustituyendo el dataset Paracetamol_e50 por las demostraciones del usuario y comparando curvas de entrenamiento.
- Manipulación de objetos en laboratorio: el modelo puede ejecutar una tarea de pick-and-place aprendida de demostraciones teleoperadas sobre un brazo SO-100, adecuado para prototipos de investigación con hardware de bajo coste.
- Docencia y formación en robótica: permite mostrar de extremo a extremo cómo se entrena, publica y evalúa una política de imitación con LeRobot, incluyendo la evaluación con `lerobot-record` y el registro de episodios.
- Base para fine-tuning con datos propios: al estar en formato safetensors y licencia Apache 2.0, se puede reentrenar o ajustar con un dataset específico de una tarea concreta sin restricciones de uso comercial.
- Evaluación comparativa de políticas: sirve como referencia de ACT de 51,7 M de parámetros frente a alternativas como Diffusion Policy o VQ-BeT dentro del mismo framework, midiendo tasas de éxito en la misma tarea.
- Integración en pipelines de investigación reproducible: el repositorio incluye los comandos exactos de entrenamiento y evaluación, lo que facilita automatizar experimentos y versionar checkpoints en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 51,7 M de parámetros, el peso en precisión completa ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna; el consumo real dependerá de la resolución y número de cámaras de entrada.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento, el comando de ejemplo usa `--policy.device=cuda`; para evaluación, una GPU consumer de gama media es suficiente en la mayoría de configuraciones.
- Cabe en GPU consumer: sí, por tamaño de parámetros; la limitación práctica será el número de cámaras y la resolución de las observaciones.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e50_20K_ACT | 51,7 M | ACT (imitación) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Diffusion Policy | no disponible | Política por difusión | no aplica | según implementación | Disponible en LeRobot |
| VQ-BeT | no disponible | Política con cuantización vectorial | no aplica | según implementación | Disponible en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada. La comparación se limita a la categoría (políticas de imitación integradas en LeRobot) y a la licencia.

## Limitaciones y advertencias

- Modelo específico de una tarea: entrenado sobre el dataset Paracetamol_e50, probablemente no generaliza a otras tareas, objetos o entornos sin reentrenamiento.
- Sin validación externa: cero descargas y cero likes en el momento de la ficha; no hay evidencia pública de tasas de éxito.
- Dataset no documentado: se desconoce el número de episodios, la configuración de cámaras y las condiciones de recogida de datos, lo que dificulta evaluar su calidad.
- Riesgo de sobreajuste al entorno de entrenamiento: cambios de iluminación, posición de la cámara o del robot pueden degradar el rendimiento.
- Sin información sobre sesgos: no aplica el análisis de sesgos de modelos de lenguaje, pero sí el riesgo de que las demostraciones teleoperadas introduzcan sesgos de trayectoria o de operador.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se identifican restricciones adicionales en la información disponible.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni usarse para generación de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Paracetamol_e50_20K_ACT
- Dataset de entrenamiento: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e50
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
