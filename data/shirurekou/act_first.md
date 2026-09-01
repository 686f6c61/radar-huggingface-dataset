# shirurekou/act_first

## Resumen

El modelo `shirurekou/act_first` es una política de robótica basada en el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, utilizando el dataset `shirurekou/first`. El modelo está diseñado para controlar robots manipuladores a partir de datos teleoperados, logrando altas tasas de éxito en tareas de manipulación.

Con aproximadamente 51,7 millones de parámetros, es un modelo relativamente compacto, adecuado para ejecutarse en hardware de gama media. Su relevancia radica en que representa un ejemplo práctico de aplicación de transformers a la robótica, siguiendo la línea del paper original de ACT (arXiv:2304.13705). La licencia Apache 2.0 permite su uso comercial y modificación sin restricciones significativas.

La información disponible sobre este modelo concreto es limitada: no se especifican detalles de entrenamiento, contexto, ni benchmarks. La ficha se basa en las características generales de la arquitectura ACT y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer con codificador y decodificador |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (Zhao et al., 2023). ACT utiliza un transformer con codificador y decodificador que procesa observaciones (imágenes y estados del robot) y genera "chunks" de acciones futuras, es decir, secuencias de comandos de articulación para varios pasos temporales. Esta predicción por lotes reduce la acumulación de errores y mejora la estabilidad del control en comparación con políticas que predicen un solo paso.

El entrenamiento se realizó con el framework LeRobot, que gestiona el dataset, el bucle de entrenamiento y la evaluación. El dataset `shirurekou/first` contiene episodios teleoperados, aunque no se han publicado detalles sobre el número de episodios, la composición de las observaciones ni el uso de técnicas como RLHF o DPO. No se dispone de información sobre el número de tokens de entrenamiento ni sobre innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control de robots manipuladores mediante aprendizaje por imitación: el modelo predice secuencias de acciones articulares a partir de observaciones visuales y de estado.
- Ejecución de tareas de manipulación bimanual y unimanual, como recoger, colocar o ensamblar objetos, siempre que los datos de entrenamiento cubran dichas tareas.
- Generalización a variaciones de posición y orientación de objetos dentro del espacio de trabajo visto en el entrenamiento.
- Integración con el ecosistema LeRobot: permite entrenar, evaluar y desplegar la política mediante comandos estándar de la librería.
- No soporta generación de texto, tool calling, agentes conversacionales ni capacidades multimodales fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede controlar un brazo robótico para recoger objetos de una posición y colocarlos en otra, basándose en demostraciones teleoperadas.
- Ensamblaje de piezas pequeñas en líneas de producción flexibles: gracias a la predicción de chunks de acción, puede ejecutar secuencias de movimiento coordinadas con mayor suavidad que políticas paso a paso.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning con nuevos datasets o para comparar variantes de ACT.
- Demostraciones educativas de robótica con hardware de bajo coste (por ejemplo, brazos SO-100): el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo, facilitando su uso en aulas.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede complementar el control manual sugiriendo acciones o completando trayectorias parciales.
- Evaluación de políticas en simulación: puede integrarse en entornos simulados (por ejemplo, MuJoCo) para validar algoritmos de control antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de éxito en tareas robóticas específicas para este modelo concreto. El paper original de ACT reporta tasas de éxito superiores al 80% en tareas de manipulación bimanual, pero esos resultados corresponden a los modelos entrenados por los autores, no a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 207 MB. En FP16 serían unos 103 MB. La VRAM real dependerá del tamaño de lote y de las imágenes de entrada, pero es probable que quepa en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A100 o H100 si se requiere mayor throughput.
- Sí cabe en GPUs de consumo: es un modelo pequeño, adecuado para tarjetas de gama media e incluso para CPU en inferencia lenta.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia. También puede exportarse a formatos como ONNX o TensorRT, aunque no hay versiones precompiladas. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la resolución de las imágenes de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existen otros checkpoints de ACT publicados en Hugging Face (por ejemplo, `ujss/first_act`), pero no se conocen sus parámetros ni rendimiento. En la literatura, ACT se compara con métodos como Diffusion Policy o Behavior Transformers, pero no hay datos de este modelo concreto frente a ellos. Por tanto, la comparativa se limita a indicar que el modelo sigue la arquitectura ACT estándar, con un tamaño de parámetros típico para esta familia (los modelos ACT suelen tener entre 20 y 100 millones de parámetros).

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de imitación, hereda los sesgos de los datos de demostración. Si las demostraciones provienen de un único operador o de un entorno específico, la generalización a otros entornos será limitada.
- Riesgo de alucinación: en robótica, el equivalente es la ejecución de acciones no seguras o no previstas. No hay garantías de seguridad en el control del robot; se requiere supervisión humana en entornos reales.
- Limitaciones de contexto: la ventana de contexto (número de pasos de observación) no está documentada. La política solo puede operar sobre la información que recibe en cada paso, sin memoria a largo plazo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías. El usuario es responsable de la seguridad en aplicaciones físicas.
- Caveat para producción: no se han publicado métricas de robustez ni pruebas en entornos reales. Antes de usar en producción, es imprescindible validar el modelo en el hardware y entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shirurekou/act_first
- Dataset de entrenamiento: https://huggingface.co/datasets/shirurekou/first
- Paper original de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
