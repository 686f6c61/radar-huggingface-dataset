# mariofromars/act_so101_pickplace_v1

## Resumen

act_so101_pickplace_v1 es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers) y publicada en HuggingFace Hub por el usuario mariofromars dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones visuales y el estado de las articulaciones de un brazo robótico SO-101 y emite comandos de acción para ejecutar una tarea de recogida y colocación (pick-and-place).

El modelo tiene 51.668.614 parámetros (unos 51,7 M) almacenados en formato safetensors, con un repositorio de 0,2 GB, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La arquitectura sigue el diseño descrito en el artículo ACT (arXiv:2304.13705), que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control.

Su relevancia actual reside en que ejemplifica el flujo de trabajo de LeRobot para llevar políticas de imitación de bajo coste a hardware accesible: se entrena desde un dataset de demostraciones teleoperadas (mariofromars/so101_pickplace_v1) y se despliega sobre un brazo SO-101 real con un único comando de evaluación. Es, por tanto, un punto de partida reproducible para investigación en manipulación robótica y no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE sobre observaciones visuales y estado proprioceptivo |
| Parámetros totales | 51.668.614 (≈51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de imitación; no procesa contexto textual) |
| Tipos de cuantización | no disponible (solo se documenta el checkpoint en safetensors; sin variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no aplica (modelo robótico; sin entrada ni salida de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | mariofromars/so101_pickplace_v1 |
| Robot objetivo | SO-101 (brazo de bajo coste del ecosistema LeRobot) |
| Descargas / likes en el Hub | 0 / 0 |
| Fecha de creación | 2026-10-01 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un autocodificador variacional condicional (CVAE) con un transformer encoder-decoder. El encoder procesa las observaciones (imágenes de cámara y estado de las articulaciones) junto con una variable latente de estilo, mientras que el decoder genera un chunk de acciones futuras en lugar de un único paso. Esta predicción por bloques es la innovación central del método: mitiga el problema de compounding error típico de las políticas paso a paso y suaviza las trayectorias, algo crítico en manipulación fina con hardware de bajo coste.

El checkpoint se ha entrenado con LeRobot a partir del dataset mariofromars/so101_pickplace_v1, compuesto por demostraciones teleoperadas sobre un SO-101. La model card no especifica el número de episodios, la composición del dataset, la resolución de las cámaras empleadas ni si se aplicaron técnicas de aumento de datos o regularización concretas, por lo que esos detalles se consideran no disponibles. Tampoco se documentan fases de RLHF, DPO ni ajuste por preferencias, algo esperable en una política de imitación supervisada. El artículo de referencia reporta el uso de temporal ensembling en inferencia para promediar predicciones solapadas de chunks, pero no se confirma que esta configuración concreta lo active.

## Capacidades

- Control robótico de pick-and-place: genera comandos articulares para recoger un objeto y colocarlo en una posición objetivo sobre un SO-101.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita ni entorno simulado.
- Predicción de chunks de acción, lo que aporta trayectorias más suaves y mayor tolerancia al ruido que una política paso a paso.
- Fusión de observaciones multimodales: imágenes de cámara más estado proprioceptivo del robot como entrada.
- Ejecución en tiempo real sobre hardware de bajo coste (SO-101), con integración directa en el ecosistema LeRobot.
- Reentrenamiento y ajuste fino sobre nuevos datasets mediante el comando `lerobot-train`.
- Evaluación reproducible con `lerobot-record` y `--policy.path`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Recogida y colocación automatizada en un banco de pruebas: la política ejecuta la tarea de pick-and-place sobre un SO-101 para la que fue entrenada, integrándose en una celda de laboratorio mediante `lerobot-record`.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar ACT frente a otras políticas de LeRobot (por ejemplo, Diffusion Policy) manteniendo el mismo robot y dataset.
- Reentrenamiento con datos propios: partiendo de este checkpoint, un equipo puede grabar nuevas demostraciones con el SO-101 y ajustar la política para una tarea distinta, aprovechando la canalización de entrenamiento de LeRobot.
- Docencia y formación en robótica: al requerir menos de 1 GB de VRAM en inferencia, permite montar prácticas de manipulación robótica en equipos de laboratorio con GPUs modestas.
- Prototipado de bajo coste en startups: sustituye a brazos industriales en pruebas de concepto donde el presupuesto y el espacio son limitados, validando la viabilidad de una tarea antes de escalar el hardware.
- Generación de datos sintéticos de política: las trayectorias producidas pueden registrarse como nuevos episodios y utilizarse para ampliar datasets o comparar estrategias de chunking.
- Integración en pipelines de evaluación continua: conectada a un banco de pruebas automatizado, la política puede evaluarse periódicamente tras cada reentrenamiento para detectar regresiones de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se limita a citar el artículo original de ACT (arXiv:2304.13705) y no reporta tasas de éxito, número de episodios de evaluación ni métricas de precisión para este checkpoint concreto. Tampoco se dispone de comparaciones medidas frente a otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,21 GB para los pesos en FP32 (51,7 M de parámetros) y unos 0,10 GB en FP16. Sumando el encoder visual y las activaciones con batch 1, el consumo total estimado se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una GTX 1050 Ti o similar. Para control a frecuencia de bucle alto se recomienda una RTX 3060 o superior, o una NVIDIA Jetson Orin integrada en el robot.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años, e incluso es viable ejecutar la inferencia en CPU para frecuencias de control bajas.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no expone una interfaz de generación de texto.
- Latencia y throughput: no disponibles, no se publican mediciones en la información proporcionada. La latencia vendrá dominada por el encoder visual y la frecuencia de captura de cámara más que por el coste de los 51,7 M de parámetros.
- Almacenamiento: 0,2 GB de repositorio, irrelevante para cualquier equipo actual.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_pickplace_v1 | ACT (CVAE + transformer) | 51,7 M | no aplica | Apache 2.0 | HuggingFace Hub, 0 descargas |
| Checkpoint ACT de ALOHA (referencia del método) | ACT (CVAE + transformer) | no disponible | no aplica | no disponible | repositorio del proyecto original |
| Diffusion Policy | política basada en difusión | no disponible | no aplica | no disponible | implementaciones públicas en LeRobot y repositorios de investigación |
| SmolVLA | VLA (visión-lenguaje-acción) | no disponible en la información proporcionada | no aplica | no disponible | HuggingFace Hub |

La comparación cuantitativa no es posible con los datos disponibles: solo se conoce el recuento de parámetros de este checkpoint. Como referencia cualitativa, ACT predice chunks de acción mediante un transformer con CVAE, mientras que Diffusion Policy genera acciones iterando un proceso de difusión, y los modelos VLA como SmolVLA incorporan además condicionamiento por lenguaje, lo que permite especificar la tarea con instrucciones de texto algo que este checkpoint no soporta.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea de pick-and-place sobre un SO-101 concreto; no generaliza a otros objetos, posiciones o tareas sin reentrenamiento.
- Dependencia del montaje físico: cambios en la colocación de las cámaras, la iluminación, la calibración del brazo o la superficie de trabajo degradan el rendimiento, ya que la política aprende correlaciones específicas del entorno de demostración.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, y sin métricas de éxito publicadas, por lo que no hay evidencia externa de su fiabilidad.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política generativa, puede producir trayectorias que parecen válidas y no alcanzan el objeto, sin señal de incertidumbre calibrada.
- Ausencia de condicionamiento por lenguaje: no se puede especificar la tarea en tiempo de ejecución con una instrucción textual; el comportamiento está fijado por los pesos.
- Riesgos de seguridad física: es un controlador que mueve hardware real. No incorpora detección de colisiones, parada de emergencia ni limitación de par; estas protecciones deben implementarse en el entorno del robot.
- Sesgos de datos: al provenir de demostraciones teleoperadas por una o pocas personas, hereda los sesgos de estilo y velocidad de esas demostraciones, y probablemente fallará ante configuraciones poco representadas.
- Licencia Apache 2.0: permisiva y apta para uso comercial, sin obligación de compartir derivados, aunque se debe conservar el aviso de licencia y el reconocimiento de autoría.
- Documentación incompleta: no se especifican hiperparámetros de entrenamiento, número de episodios, resolución de imagen ni semillas, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mariofromars/act_so101_pickplace_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mariofromars/so101_pickplace_v1
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 y https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de las referencias citadas en la propia model card.
