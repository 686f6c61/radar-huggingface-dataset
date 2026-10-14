# Deviant65/act_3camnew_32b

## Resumen

`Deviant65/act_3camnew_32b` es una política de imitación (imitation learning) para control robótico, entrenada con el framework LeRobot de Hugging Face. Implementa el método ACT (Action Chunking with Transformers), descrito en el artículo 2304.13705, que en lugar de predecir acciones paso a paso genera "trozos" (chunks) de acciones de corta duración a partir de demostraciones teleoperadas. El modelo está pensado para un robot `so_follower` (familia SO-101, brazo de bajo coste) con tres cámaras de entrada (`wrist`, `top`, `base`) y una tarea concreta: recoger un bloque rojo y depositarlo en una caja marrón.

Contiene 51.668.614 parámetros (aproximadamente 51,7 M), no 32 mil millones: el sufijo "32b" del identificador se refiere al tamano de lote (batch size = 32) usado en el entrenamiento, segun se deduce de la configuración de entrenamiento y de los modelos relacionados del mismo autor (`so101_redcube_3cam_32batch`). Es un modelo muy pequeno orientado a inferencia en tiempo real sobre el propio robot. El repositorio ocupa unos 0,2 GB.

Su relevancia es practica para robótica de bajo coste y experimentación en laboratorio: es un ejemplo reproducible de entrenamiento de políticas ACT con LeRobot 0.6.2, licencia Apache 2.0 y pesos en safetensors. No es un modelo de lenguaje ni un modelo de propósito general; es una política visomotora específica de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder para imitación visomotora |
| Parametros totales | 51.668.614 |
| Longitud de contexto | no aplica / no disponible (política de control; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (el repo usa safetensors de LeRobot; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica / no disponible (política robótica; tarea en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `top`, `base` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640), `observation.images.base` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | Deviant65/so101_redcube_3new |
| Episodios | 143 |
| Fotogramas | 132.974 |
| Frecuencia de captura | 30 FPS |
| Tarea | "Pick up the red block and place it in the brown box" |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice chunks de acciones (secuencias cortas de comandos) en lugar de una única acción por paso, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La política consume el estado del robot (6 dimensiones), tres flujos de imagen RGB a 480x640 y produce un vector de acción de 6 dimensiones, adecuado para el brazo `so_follower`. El artículo de referencia del método es "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Deviant65/so101_redcube_3new` (143 episodios, 132.974 fotogramas a 30 FPS, tarea única de recogida de bloque rojo). La configuración declarada incluye 100.000 pasos de entrenamiento, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta en la información disponible si hubo fases de RLHF/DPO ni detalles adicionales sobre la composición del dataset o la innovación interna de la arquitectura (más allá de lo descrito por el método ACT).

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado y tres cámaras.
- Ejecución de una tarea concreta de pick-and-place: "Pick up the red block and place it in the brown box".
- Aprendizaje por imitación a partir de datos teleoperados (no es un modelo generativo de texto ni un LLM).
- Entrada multimodal limitada a visión (tres camaras RGB) más estado proprioceptivo de 6 dimensiones.
- Inferencia en tiempo real sobre el robot `so_follower` mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, audio ni modo "thinking".

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar de forma autónoma la recogida de un bloque rojo y su depósito en una caja marrón, ideal para validar flujos de aprendizaje por imitación en robótica de bajo coste.
- Reproducción de experimentos ACT: sirve como referencia reproducible para comparar configuraciones (numero de camaras, batch size, tasa de aprendizaje) en el marco de LeRobot.
- Generación de datos sintéticos o evaluación de políticas: puede usarse como política base en pipelines de evaluación de tareas de manipulación con SO-101.
- Prototipado docente: ejemplo práctico para ensenar aprendizaje por imitación, despliegue con `lerobot-rollout` y registro de demostraciones con hardware asequible.
- Automatización de líneas de clasificación simples: adaptando el dataset y reentrenando, el mismo esquema ACT puede aplicarse a tareas repetitivas de recogida y colocación de objetos.
- Investigación en chunking de acciones: permite estudiar el efecto de predecir chunks frente a acciones individuales en estabilidad y tasa de éxito.
- Integración con bancos de pruebas de robótica: uso como componente de control en entornos simulados o reales que repliquen la configuración de tres cámaras y el robot `so_follower`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet."). Por tanto, no hay tablas de tasa de éxito, MMLU, HumanEval ni métricas equivalentes, que además no aplican a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en fp32 los pesos ocupan aproximadamente 207 MB y en fp16/bf16 unos 103 MB. El grueso del consumo de memoria proviene de las activaciones de los tres codificadores de imagen a 480x640, no de los pesos. Estas cifras son cálculos derivados del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, es viable en cualquier GPU consumer moderna (por ejemplo RTX 3060/4060 o superiores) e incluso en CPU para inferencia de baja frecuencia.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el reducido numero de parámetros; la limitación real es la latencia de procesamiento de las tres cámaras a 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Deviant65/act_3camnew_32b`). No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Deviant65/act_3camnew_32b | 51,7 M | ACT / robótica (imitación) | apache-2.0 | Hugging Face (lerobot) |
| Deviant65/act_so101_redcube_batch32_kl5 | 51,7 M (segun listado) | ACT / robótica | no disponible en la busqueda | Hugging Face (lerobot) |
| Deviant65/so101_redcube_3cam_32batch | no disponible | ACT / robótica | no disponible en la busqueda | Hugging Face (lerobot) |

No se dispone de datos comparativos de rendimiento (tasas de éxito) entre estos modelos. La busqueda web no aporta resultados de benchmarks para esta categoría de políticas. Los modelos comparables son variantes del mismo autor sobre el mismo robot y tarea.

## Limitaciones y advertencias

- Es una política específica de tarea: solo se ha entrenado para "Pick up the red block and place it in the brown box"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración de hardware: requiere un robot `so_follower` y exactamente tres camaras con los nombres `wrist`, `top`, `base`, en la disposición del entrenamiento.
- Sensibilidad al entorno: cambios en iluminación, posiciones de objetos, distractores o un robot distinto pueden degradar el rendimiento (la propia plantilla de la model card advierte de estos factores).
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que no se puede estimar su fiabilidad en producción.
- Riesgo de fallo en ejecución: como toda política de imitación, puede producir acciones erroneas ante situaciones fuera de la distribución de los datos de entrenamiento.
- Sesgos: no disponibles (no aplica el concepto de sesgo de lenguaje, pero sí posibles sesgos hacia las condiciones de grabación del dataset).
- Idiomas: no aplica; no es un modelo de lenguaje.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el usuario debe citar el método (arXiv:2304.13705) y LeRobot segun indica la model card.
- El identificador "32b" puede inducir a error: no son 32.000 millones de parámetros, sino 51,7 M, con batch size 32 en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/act_3camnew_32b
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/so101_redcube_3new
- Paper ACT (arXiv): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/Deviant65/models
