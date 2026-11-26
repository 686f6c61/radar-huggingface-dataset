# Haku-2004/act_ie_input_20

## Resumen

`Haku-2004/act_ie_input_20` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el artículo arXiv 2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está pensado para controlar robots manipuladores a partir de datos de teleoperación. En lugar de predecir una única acción por paso, ACT predice fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y suele elevar las tasas de éxito en tareas de manipulación.

El checkpoint tiene 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. Se distribuye en formato safetensors bajo licencia Apache 2.0 y está asociado al dataset `Haku-2004/i_4seg`, empleado como datos de entrenamiento. No es un modelo de lenguaje: su pipeline es `robotics` y su salida son comandos de acción para un robot, no texto.

Su relevancia es acotada pero clara para quien trabaja en robótica de imitación: sirve como referencia reproducible de un entrenamiento ACT con LeRobot, con instrucciones de entrenamiento e inferencia incluidas en la model card. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no publica resultados de evaluación ni detalles del dataset más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre observaciones por paso y un horizonte de chunk de acciones no especificado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF, AWQ ni similares) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (típicamente un codificador tipo ResNet preentrenado) con un transformer que procesa la secuencia de observaciones y estados, y un decodificador que genera un chunk de acciones de longitud fija en lugar de una acción por paso. Esta formulación, descrita en el paper 2304.13705, mitiga el problema de la predicción de acciones individuales, donde pequeños errores se acumulan y desestabilizan la política. El modelo se entrena por imitación supervisada sobre demostraciones de teleoperación, sin refuerzo ni RLHF.

En este checkpoint concreto, el entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/i_4seg`. La model card no especifica el número de episodios, la composición del dataset, el número de tokens ni la configuración exacta del entrenamiento (learning rate, batch size, número de épocas, resolución de imagen, horizonte de chunk). Tampoco se documenta si hubo aumentos de datos o regularización específica. Toda esa información debe considerarse no disponible.

## Capacidades

- Control de robots manipuladores mediante predicción de chunks de acciones a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones de teleoperación, sin necesidad de definir recompensas.
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-record` y `--policy.path`.
- Integración con robots tipo SO-100 follower, según el ejemplo de evaluación de la model card.
- Entrenamiento reproducible desde cero con `lerobot-train` y `--policy.type=act`.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo predice chunks de acciones que reducen la acumulación de error, adecuado para tareas de pick-and-place con el robot SO-100 follower mencionado en la model card.
- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar configuraciones de ACT entrenadas con LeRobot sobre el mismo dataset u otros similares.
- Evaluación de políticas en entornos controlados: con `lerobot-record` y `--episodes=10` se puede medir la tasa de éxito de forma estandarizada antes de desplegar en un robot real.
- Prototipado rápido en robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, cabe en GPUs de consumo y permite iterar en estaciones de trabajo sin clúster.
- Docencia y formación en aprendizaje por imitación: el flujo completo de entrenamiento e inferencia está documentado en la model card y en la guía de LeRobot, lo que facilita usarlo como ejemplo práctico.
- Base para fine-tuning sobre nuevos datasets de teleoperación: al ser un checkpoint Apache 2.0, puede reentrenarse con `lerobot-train` sobre datos propios para adaptar la política a otra tarea o robot.
- Integración en pipelines de investigación reproducibles: el par modelo-dataset (`Haku-2004/i_4seg`) permite replicar el entrenamiento y auditar la política resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,671 M de parámetros en safetensors (aproximadamente 0,2 GB en fp32), la huella de pesos es inferior a 1 GB, por lo que cualquier GPU con 4 GB o más debería poder cargarla.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060, RTX 4060 o superior es suficiente para inferencia, y una RTX 4090 o A100 acelera el entrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con al menos 4-6 GB de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de dispositivo CUDA mediante `--policy.device=cuda` en entrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_ie_input_20 | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Diffusion Policy (referencia del paper original) | no disponible en la informacion | no aplica | no disponible | no disponible | no disponible |
| Otras políticas ACT publicadas en LeRobot Hub | variable | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de robótica, no de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con benchmarks de LLM.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones que permitan estimar su calidad real; el hecho de tener 0 descargas y 0 likes indica que no ha sido validado por la comunidad.
- Dependencia del dataset `Haku-2004/i_4seg`: la política está ajustada a las condiciones, robot y tarea de ese dataset; su generalización a otros entornos no está documentada.
- Riesgo de sobreajuste a las demostraciones de teleoperación, habitual en aprendizaje por imitación cuando el dataset es pequeño o poco diverso.
- Sesgos en los datos de teleoperación: las políticas de imitación reproducen los sesgos y errores del operador humano que generó las demostraciones.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No se documentan limitaciones de contexto o idioma porque el modelo no procesa lenguaje.
- Para producción, es imprescindible evaluar la política en el robot objetivo antes de desplegarla, dado que no existen métricas de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_ie_input_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/Haku-2004/i_4seg
