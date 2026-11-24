# sameer-s1/act-ball-in-the-hole

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `sameer-s1/act-ball-in-the-hole`, es una política entrenada con LeRobot sobre el dataset `sameer-s1/ball-in-the-hole`, orientada a la tarea de insertar una bola en un agujero mediante un brazo robótico teleoperado.

El modelo emplea una arquitectura transformer con un codificador visual y un decodificador de acciones con mecanismo de chunking, diseñado para mitigar el problema de acumulación de errores típico de las políticas paso a paso. Con 51.668.614 parámetros (aproximadamente 51,7 M) y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto.

Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas robóticas de código abierto con licencia Apache 2.0, lo que facilita la reproducibilidad y la experimentación en laboratorios con recursos limitados. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin datos publicados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual y decodificador de acciones con chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un backbone visual (codificador de imágenes) con un decodificador autorregresivo que genera secuencias de acciones. La innovación principal es el *action chunking*: en lugar de predecir una sola acción por paso, el modelo predice un bloque de acciones futuras, lo que reduce la acumulación de errores y mejora la estabilidad en tareas de manipulación. El modelo incluye además un mecanismo de *temporal ensembling* para suavizar las predicciones entre chunks consecutivos.

El entrenamiento se realizó mediante aprendizaje por imitación supervisada sobre el dataset `sameer-s1/ball-in-the-hole`, compuesto por demostraciones teleoperadas. No se dispone de información sobre el número de episodios, el número de tokens de entrenamiento (concepto no aplicable directamente a políticas robóticas), la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El pipeline de entrenamiento se ejecutó con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

## Capacidades

- Predicción de acciones motoras para brazos robóticos teleoperados, concretamente para la tarea de inserción de una bola en un agujero.
- Generación de fragmentos de acción (action chunks) en lugar de pasos individuales, lo que mejora la robustez frente a errores acumulados.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Compatible con el robot `so100_follower` según los comandos de evaluación de la model card.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito; es un modelo puramente motor.

## Casos de uso

- **Automatización de tareas de inserción en línea de montaje**: el modelo puede ejecutar la tarea de insertar una bola en un agujero en un brazo robótico de bajo coste como el SO-100, adecuado para prototipos de fabricación y demostraciones educativas.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida reproducible para estudiar el efecto del action chunking y del temporal ensembling en tareas de manipulación precisa, gracias a su licencia Apache 2.0 y su integración con LeRobot.
- **Docencia en robótica**: el modelo y su dataset asociado permiten a estudiantes entrenar y evaluar una política completa con comandos de LeRobot en pocas horas, sin necesidad de GPUs de gama alta.
- **Benchmark interno de políticas robóticas**: puede usarse como línea base para comparar nuevas arquitecturas o datasets sobre la misma tarea de inserción.
- **Pruebas de despliegue en hardware de bajo coste**: con 51,7 M de parámetros y 0,2 GB de pesos, es viable ejecutarlo en un ordenador con GPU consumer o incluso en CPU para inferencia de baja frecuencia.
- **Generación de datos sintéticos de evaluación**: la política puede ejecutar rollouts en simulación o en hardware real para generar trayectorias adicionales que enriquezcan el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 51,7 M de parámetros, los pesos en precisión FP32 ocupan aproximadamente 0,2 GB; en FP16, alrededor de 0,1 GB. La VRAM adicional depende del codificador visual y del tamaño del batch, pero en cualquier caso es inferior a 2 GB en configuraciones típicas.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; se han usado históricamente tarjetas como RTX 3060, RTX 4090, A100 o H100 para entrenamiento, aunque para inferencia basta con hardware mucho más modesto.
- **Cabe en GPU consumer**: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia de baja frecuencia.
- **Opciones de despliegue**: LeRobot (`lerobot-record` con `--policy.path`), con soporte para ejecución en CUDA o CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependen del hardware, de la frecuencia de control del robot y del tamaño del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sameer-s1/act-ball-in-the-hole` | 51,7 M | no disponible | Inserción bola-agujero (SO-100) | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | ~50 M (típico) | no disponible | Manipulación teleoperada | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | variable | no disponible | Manipulación visomotora | MIT (implementaciones) | Repositorios de investigación |
| RT-1 / RT-2 (Google) | miles de millones | no disponible | Manipulación generalista | no abierta | No público |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **Sesgos**: al entrenarse sobre un dataset concreto de teleoperación, la política hereda los sesgos de las demostraciones (posiciones iniciales, velocidades, condiciones de iluminación y configuración del robot). No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- **Riesgo de alucinación**: en el contexto robótico, el equivalente es la ejecución de trayectorias incorrectas o inseguras cuando el estado observado se aleja de la distribución de entrenamiento.
- **Limitaciones de contexto e idioma**: no aplica; el modelo no procesa lenguaje natural ni tiene ventana de contexto textual.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; el uso en producción requiere validación propia y cumplimiento de las normas de seguridad del robot.
- **Caveats para producción**: con cero descargas y cero likes, el modelo no tiene validación comunitaria; no se han publicado métricas de éxito, número de episodios de entrenamiento ni condiciones de evaluación. No se recomienda su uso en entornos industriales sin una evaluación exhaustiva previa.
- **Dependencia de hardware**: está diseñado para el robot `so100_follower`; su uso con otros brazos requiere adaptar las interfaces de observación y acción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sameer-s1/act-ball-in-the-hole)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset ball-in-the-hole](https://huggingface.co/datasets/sameer-s1/ball-in-the-hole)
