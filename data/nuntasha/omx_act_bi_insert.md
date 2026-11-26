# nuntasha/omx_act_bi_insert

## Resumen

`nuntasha/omx_act_bi_insert` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario nuntasha en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado al dataset `nuntasha/omx_bi_insert`, presumiblemente teleoperado sobre un robot tipo SO-100.

El modelo tiene 51.680.908 parámetros (unos 51,7 millones), un tamaño muy contenido que lo sitúa en la categoría de políticas ligeras para control robótico de brazos, no en la de modelos de lenguaje. Se distribuye en formato safetensors con un repositorio de 0,2 GB y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su pipeline declarado es `robotics` y la librería de referencia es `lerobot`.

Es relevante para quienes trabajan en manipulación robótica de bajo coste porque ACT es uno de los métodos de referencia del paper 2304.13705 (Zhao et al., 2023) y LeRobot permite entrenar, evaluar y desplegar estas políticas con comandos de línea de órdenes. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y no incluye métricas de éxito publicadas, por lo que debe tratarse como un checkpoint experimental más que como un modelo validado en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.680.908 (51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (no aplica: política de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, a partir de observaciones (típicamente imágenes de cámara y estado de las articulaciones), predice un chunk de acciones futuras en lugar de una sola acción. Esta predicción por chunks reduce el error de acumulación y mejora la estabilidad temporal en tareas de manipulación. El paper original incorpora un mecanismo de *temporal ensembling* que promedia predicciones solapadas entre chunks para suavizar la trayectoria.

El entrenamiento de este checkpoint concreto se realizó con LeRobot sobre el dataset `nuntasha/omx_bi_insert`, que por el nombre sugiere una tarea de inserción bimodal (`bi_insert`) sobre un robot OMX. No se dispone de información sobre el número de episodios, la composición del dataset, la resolución de las cámaras ni si se aplicaron aumentos de datos. El autor no documenta hiperparámetros de entrenamiento, número de tokens ni etapas de RLHF o DPO (no aplicables a este tipo de política).

## Capacidades

- Control robótico por imitación: genera chunks de acciones para brazos manipuladores a partir de observaciones visuales y propioceptivas.
- Predicción multi-paso: emite secuencias de acciones en lugar de pasos individuales, lo que reduce el error acumulado.
- Integración con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatibilidad con robots SO-100: el ejemplo de la model card usa `so100_follower` como robot de evaluación.
- Tarea específica de inserción: el nombre del dataset (`omx_bi_insert`) indica que está especializado en una tarea de inserción, no en manipulación general.
- No soporta tool calling, agentes, razonamiento multi-paso simbólico, visión general, audio ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Automatización de inserción de piezas: el modelo está entrenado específicamente para una tarea de inserción (`bi_insert`), por lo que puede emplearse en células de ensamblaje donde se requiera colocar una pieza en una ranura o conector con tolerancias ajustadas.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT, cambios en el dataset o estrategias de *temporal ensembling* en el mismo entorno OMX.
- Prototipado rápido con LeRobot: al estar en formato LeRobot, se puede cargar con `--policy.path` y evaluar en 10 episodios con `lerobot-record`, lo que acelera la validación de la política antes de integrarla en un pipeline mayor.
- Manipulación de bajo coste con SO-100: el ejemplo de la model card apunta a robots de bajo coste, por lo que encaja en laboratorios con presupuesto limitado que no pueden permitirse brazos industriales.
- Generación de datos sintéticos de trayectorias: las predicciones de chunks pueden usarse para aumentar datasets de teleoperación con trayectorias plausibles adicionales.
- Despliegue en entornos con GPU modesta: con 51,7 M de parámetros, la inferencia cabe en GPUs de consumo, lo que permite montar estaciones de evaluación económicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros (unos 207 MB de pesos) más el coste de las activaciones y del codificador visual; en la práctica, cualquier GPU con 4 GB o más es suficiente.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo es tan pequeño que la GPU no es el cuello de botella, sino la latencia de las cámaras y del bus del robot.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), y en general el runtime de PyTorch que use LeRobot; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robótica.
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y la resolución de las cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nuntasha/omx_act_bi_insert | 51,7 M | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (Zhao et al., 2023) | ~80 M (según paper) | no aplica | tasas de éxito publicadas en el paper | MIT (código de referencia) | GitHub + paper |
| Diffusion Policy (Chi et al., 2023) | variable según configuración | no aplica | benchmarks en paper | MIT | GitHub + paper |
| Checkpoints ACT de LeRobot en el Hub | ~50 M típicamente | no aplica | variables, muchos sin métricas | Apache 2.0 | Hugging Face |

La comparación con Diffusion Policy y con el ACT original es cualitativa: no se dispone de resultados de este checkpoint frente a ellos en el mismo entorno. La ventaja principal de este modelo es su integración directa con LeRobot y su licencia permisiva; la desventaja es la ausencia de métricas y de documentación del dataset.

## Limitaciones y advertencias

- Especialización extrema: el nombre del dataset (`omx_bi_insert`) indica que la política está entrenada para una única tarea de inserción; no se espera que generalice a otras tareas sin reentrenamiento.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de que la política funcione, ni siquiera en el entorno de entrenamiento.
- Dataset no documentado: se desconoce el número de episodios, la variabilidad de posiciones iniciales y la calidad de la teleoperación, lo que impide estimar la robustez.
- Riesgo de sobreajuste al entorno: al no haber datos de evaluación, es probable que la política dependa de la iluminación, la cámara y la configuración exacta del robot usados en la grabación.
- Sesgos: no aplica el concepto de sesgo lingüístico, pero sí el sesgo de distribución del dataset (posiciones, objetos y condiciones limitadas).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes: no hay comunidad que haya validado el checkpoint; trátese como material experimental.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código, razonamiento simbólico ni tareas multimodales generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuntasha/omx_act_bi_insert
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/nuntasha/omx_bi_insert
