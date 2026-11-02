# neverlish/omx_act_record-test-20261102-1

## Resumen

`neverlish/omx_act_record-test-20261102-1` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el paper arXiv:2304.13705. El modelo predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación y suele lograr tasas de éxito altas a partir de datos de teleoperación. Lo desarrolla el usuario neverlish y se ha publicado en el Hub mediante la librería LeRobot de Hugging Face.

Se trata de un modelo de tamaño reducido, con 51.668.614 parámetros en formato safetensors y un repositorio de 0,2 GB, pensado para control de robots en entornos de laboratorio o prototipado. El pipeline declarado es `robotics` y la licencia es Apache 2.0. El identificador y la fecha de creación (2026-11-02) sugieren un experimento de prueba asociado al dataset `neverlish/record-test-20261102-1`, por lo que no debe considerarse un modelo de producción validado.

Su relevancia actual es la de un ejemplo canónico del flujo de trabajo de LeRobot: entrenamiento de una política ACT desde un dataset de demostraciones y despliegue sobre un robot seguidor tipo SO-100. No es un modelo de lenguaje y no procesa texto ni imágenes de forma general; su entrada y salida son observaciones y acciones robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de observaciones (típicamente una CNN o ViT para las imágenes de cámara y una MLP para el estado del robot) con un transformer que decodifica una secuencia de acciones futuras, el llamado action chunk. Predecir un bloque de acciones en lugar de una sola reduce el horizonte efectivo de decisión y mitiga el error compuesto característico de las políticas paso a paso. La arquitectura incluye mecanismos de atención sobre las observaciones y un estilo de entrenamiento tipo CVAE (conditional VAE) para modelar la multimodalidad de las demostraciones humanas.

El modelo se ha entrenado con LeRobot a partir del dataset `neverlish/record-test-20261102-1`, que por su nombre parece un conjunto de grabaciones de prueba. No se dispone de información sobre el número de episodios, la composición de las demostraciones, el robot utilizado ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco hay datos sobre RLHF, DPO ni ajuste fino posterior; en ACT el entrenamiento es supervisado sobre pares observación-acción. No se documentan innovaciones adicionales más allá de las propias del método ACT original.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y del estado del robot.
- Predicción de action chunks: emite bloques de acciones de horizonte corto, lo que estabiliza la ejecución en tareas de manipulación.
- Aprendizaje a partir de teleoperación: se entrena con demostraciones humanas grabadas mediante LeRobot.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Despliegue sobre robots seguidores: la model card muestra el ejemplo con `so100_follower`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Prototipado de políticas de manipulación en laboratorio: entrenar ACT sobre un dataset propio de demostraciones y evaluar la tasa de éxito en tareas como apilar o colocar objetos, usando `lerobot-train` y `lerobot-record`.
- Replicación de experimentos de investigación: servir como referencia para comparar variantes de ACT, cambios en el horizonte de action chunk o estrategias de aumento de datos.
- Automatización de tareas repetitivas en un banco de pruebas con robot SO-100: el modelo ejecuta secuencias de agarre y colocación aprendidas de teleoperadores, reduciendo la programación manual de trayectorias.
- Evaluación de pipelines de datos de teleoperación: el dataset asociado (`record-test-20261102-1`) y la política permiten validar la captura, el formato y el reentrenamiento en LeRobot antes de escalar a datasets mayores.
- Docencia y formación en aprendizaje por imitación: ejemplo completo y ligero (0,2 GB, ~51,7 M de parámetros) para explicar el ciclo demostración-entrenamiento-despliegue en robótica.
- Base para ajuste fino con nuevos datasets: al ser Apache 2.0 y tener un tamaño reducido, se puede reentrenar o adaptar a otras tareas de manipulación con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM, incluyendo las integradas modernas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella será el preprocesado de imágenes, no el modelo.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales; también es viable en CPU para pruebas de latencia no crítica.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de checkpoints locales o del Hub; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; dependerán del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-test-20261102-1 | 51,7 M | no aplica | no disponible | Apache 2.0 | Hub de Hugging Face |
| Políticas ACT de referencia en LeRobot | variable | no aplica | no disponible | Apache 2.0 | Hub de Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | no disponible | MIT/Apache 2.0 según implementación | Hub de Hugging Face |
| VQ-BeT (LeRobot) | variable | no aplica | no disponible | Apache 2.0 | Hub de Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de prueba: el nombre (`record-test`) y el dataset asociado indican un experimento, no una política validada para producción.
- Sin documentación de entrenamiento: se desconoce el número de episodios, el robot, las tareas y las métricas de éxito, lo que impide evaluar su robustez.
- Sesgos y generalización: al entrenarse con un dataset pequeño y específico, es probable que no generalice a otras cámaras, iluminación, objetos o robots distintos de los vistos en las demostraciones.
- Riesgo de fallo en ejecución: las políticas de imitación pueden producir acciones erráticas ante observaciones fuera de distribución; se recomienda supervisión humana y parada de emergencia.
- Sin capacidades de lenguaje: no debe usarse para tareas de texto, razonamiento, código o visión general.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las condiciones del dataset asociado antes de redistribuir derivados.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX u otras que faciliten el despliegue en entornos no CUDA.
- Fecha de creación futura (2026-11-02): conviene verificar la procedencia y la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neverlish/omx_act_record-test-20261102-1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/neverlish/record-test-20261102-1
