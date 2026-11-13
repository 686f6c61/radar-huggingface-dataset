# Haku-2004/act_k5ot_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k5ot_input_20`, es una política entrenada con LeRobot sobre el dataset `Haku-2004/k5_4seg` y publicada en Hugging Face con licencia Apache 2.0. El modelo resuelve el problema del control robótico de manipulación a partir de demostraciones teleoperadas, y es relevante porque ACT es una de las referencias más citadas en imitation learning de bajo coste, con éxito demostrado en brazos como el SO-100.

El checkpoint tiene 51.671.174 parámetros en formato safetensors, ocupa 0,2 GB en el repositorio y se distribuye con la librería `lerobot`. Se trata de un modelo pequeño, orientado a inferencia en tiempo real sobre hardware modesto, no a generación de texto ni a tareas de propósito general. La información pública disponible es la de la model card estándar generada por LeRobot, sin métricas de éxito, sin detalles del dataset de entrenamiento más allá de su identificador y sin datos de benchmarks.

Esta ficha describe lo que se puede afirmar con la información proporcionada. Cualquier dato no documentado por el autor se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones con consultas aprendidas |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el modelo consume observaciones por paso y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para este checkpoint) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k5_4seg |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación. El modelo recibe observaciones (típicamente imágenes de cámara y el estado de las articulaciones) y predice un *chunk* de acciones futuras de longitud fija, en lugar de una única acción por paso. Esta predicción por bloques reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad del control. La arquitectura incorpora un encoder visual y un decoder con consultas latentes que generan las acciones de forma paralela, lo que permite inferencia rápida en tiempo real.

El entrenamiento se realiza con LeRobot a partir de demostraciones teleoperadas. En este caso, el autor indica el dataset `Haku-2004/k5_4seg` como fuente, pero no se documentan el número de episodios, la composición de las trayectorias, el robot empleado ni si hubo aumentos de datos. Tampoco se especifica si se aplicaron técnicas adicionales como regularización temporal o *temporal ensembling* en la inferencia. La model card es la plantilla estándar de LeRobot y no aporta detalles técnicos adicionales.

## Capacidades

- Control robótico de manipulación mediante predicción de chunks de acciones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones multimodales (imágenes de cámara y estado de articulaciones) según la configuración estándar de ACT en LeRobot.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Inferencia en tiempo real sobre GPU de consumo, dado el tamaño reducido del modelo.
- Compatible con el flujo `lerobot-record` para evaluación con robots como `so100_follower`.
- No soporta tool calling, function calling, agentes basados en lenguaje ni razonamiento multi-paso simbólico.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Manipulación robótica de laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas del dataset `k5_4seg` sobre un brazo tipo SO-100, usando `lerobot-record` con `--policy.path` apuntando a este checkpoint.
- Reentrenamiento y ajuste fino: al estar publicada con LeRobot, sirve como punto de partida para fine-tuning con nuevos datasets teleoperados mediante `lerobot-train --policy.type=act`.
- Evaluación comparativa de políticas ACT: útil como referencia base para comparar variantes de arquitectura o de datos en experimentos de imitation learning.
- Prototipado rápido en robótica de bajo coste: sus 51,7 M de parámetros y 0,2 GB permiten desplegarlo en estaciones con GPU de consumo, reduciendo la barrera de entrada frente a políticas más grandes.
- Docencia e investigación en aprendizaje por imitación: el checkpoint permite reproducir el pipeline completo de LeRobot (entrenamiento, evaluación, grabación de episodios) con un modelo ya entrenado.
- Integración en pipelines de robótica con ROS u otros frameworks: la política puede invocarse como componente de control dentro de un bucle de percepción-acción, siempre que se respete el formato de observaciones esperado por LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,671 M de parámetros; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; el flujo de LeRobot usa `--policy.device=cuda`. Una RTX 3060, RTX 4090 o A100 son válidas, aunque el modelo no necesita las de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida, aunque la latencia no está documentada.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de carga desde el Hub o desde checkpoint local mediante `--policy.path`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control ni de tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5ot_input_20 | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible en esta ficha | no aplica | tasas de éxito publicadas en el paper, no replicadas aquí | no disponible en esta ficha | paper y código de referencia |
| Diffusion Policy | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha | implementaciones públicas |
| Otras políticas LeRobot del Hub | variable | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos verificados para establecer una comparación cuantitativa con alternativas. La comparación se limita a categoría y licencia.

## Limitaciones y advertencias

- El modelo está entrenado sobre un dataset concreto (`Haku-2004/k5_4seg`); su comportamiento fuera de la distribución de ese dataset no está garantizado.
- No se documentan tasas de éxito ni protocolo de evaluación, por lo que no se puede afirmar su robustez en producción.
- Riesgo de sobreajuste a las condiciones de iluminación, cámara y robot del dataset original.
- Sin información sobre sesgos, pero al ser una política de imitación hereda los sesgos y errores de las demostraciones teleoperadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- No es un modelo de lenguaje: no debe evaluarse con métricas de MMLU, HumanEval o GSM8K.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-13) es futura respecto a la información habitual de publicación; conviene verificar la procedencia del checkpoint antes de usarlo en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5ot_input_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
