# jogarulfop/policy_2026-09-21_cheap_shakeit_bench_3sensors_v2_pzt_disk_nfft_512

## Resumen

El modelo `jogarulfop/policy_2026-09-21_cheap_shakeit_bench_3sensors_v2_pzt_disk_nfft_512` es una política robótica de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario jogarulfop en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de observaciones (imágenes y estado de las articulaciones), predice secuencias cortas de acciones —los denominados *action chunks*— en lugar de un único paso de control. Se ha entrenado y subido al Hub con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El modelo resuelve el problema clásico de la imitación robótica: dado un conjunto de demostraciones teleoperadas, aprender una política que reproduzca la tarea con alta tasa de éxito y sin acumulación de error paso a paso. ACT aborda esto prediciendo bloques de acciones y empleando un autoencoder variacional condicional (CVAE) que captura la variabilidad de las demostraciones humanas, lo que reduce el *compounding error* típico de las políticas de imitación.

Es relevante por su tamaño reducido (51.668.614 parámetros, unos 0,2 GB de repositorio) y su licencia Apache-2.0, que permiten desplegarlo en hardware de bajo coste, incluidos brazos tipo SO-100 y GPUs de gama de consumo. El identificador del modelo indica que se entrenó sobre el dataset `jogarulfop/2026-09-21_cheap_shakeit_bench_3sensors_v2_pzt_disk_nfft_512`, aparentemente ligado a un banco de pruebas con sensores piezoeléctricos de disco y características espectrales (NFFT = 512), aunque no se dispone de la ficha del dataset para confirmar la composición exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado con CVAE para aprendizaje por imitacion |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de contexto de un LLM; ACT opera sobre una ventana de observaciones y un horizonte de acciones configurable) |
| Tipos de cuantizacion | no disponible (los pesos se publican en precision completa en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robotico, sin capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato nativo de LeRobot) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | jogarulfop/2026-09-21_cheap_shakeit_bench_3sensors_v2_pzt_disk_nfft_512 |
| Robot de evaluacion documentado | so100_follower |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de *imitation learning* que combina un backbone de vision (típicamente una red convolucional tipo ResNet) con un transformer encoder-decoder. La política recibe observaciones multimodales —imágenes de cámara y el estado de las articulaciones— y genera una secuencia de acciones de longitud fija (el *chunk*), lo que aporta coherencia temporal y reduce la acumulación de error. Un componente clave es el CVAE: durante el entrenamiento se introduce una variable latente que modela la variabilidad estocástica de las demostraciones humanas; en inferencia el prior se fija (habitualmente a cero), obteniéndose un comportamiento determinista y estable. El paper de referencia es *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705).

Respecto al entrenamiento concreto de esta política, la model card únicamente indica que fue entrenada con LeRobot y que se apoya en un dataset propio de nombre `2026-09-21_cheap_shakeit_bench_3sensors_v2_pzt_disk_nfft_512`. No se documentan el número de episodios, el número de demostraciones, la composición del dataset, el número de pasos de entrenamiento, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos. El identificador sugiere tres sensores, un componente piezoeléctrico de disco (*pzt disk*) y una transformada de Fourier de 512 bins (*nfft 512*), lo que apuntaría a un banco de pruebas con señal vibracional o táctil, pero es una inferencia a partir de la nomenclatura y no un dato confirmado en la información disponible.

## Capacidades

- Generación de acciones robóticas en forma de *chunks*: predice secuencias cortas de comandos de articulación en lugar de un único paso, lo que mejora la estabilidad del control.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de definir una función de recompensa ni un simulador.
- Control visomotor: procesa observaciones de cámara junto con el estado de las articulaciones para producir acciones.
- Gestión de multimodalidad en las demostraciones mediante el CVAE, que modela variabilidad en las trayectorias humanas.
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación en robot real (`lerobot-record`).
- Compatible con robots de bajo coste del ecosistema LeRobot, como el SO-100 (*so100_follower* aparece en el ejemplo de evaluación de la model card).
- Entrada multisensorial: el nombre del dataset apunta a tres sensores y a características espectrales (NFFT = 512), aunque no se detalla el esquema de entrada final.
- No dispone de *tool calling*, razonamiento multi-paso simbólico, capacidades multilingües ni generación de texto: es exclusivamente una política de control.

## Casos de uso

- Pick-and-place en línea de montaje: la política predice chunks de acciones que permiten recoger una pieza y depositarla en una posición objetivo a partir de demostraciones teleoperadas, con la ventaja de que el uso de chunks reduce las paradas y los temblores típicos del control paso a paso.
- Manipulación fina con realimentación táctil o vibracional: dado que el dataset de entrenamiento parece incorporar sensores piezoeléctricos de disco y características FFT, el modelo es adecuado para tareas de inserción o agarre donde la señal de contacto aporta información que la cámara no captura.
- Reproducción de experimentos de imitación robótica: sirve como política de referencia en investigaciones sobre ACT, permitiendo comparar variantes de arquitectura, número de demostraciones o esquemas de sensores sobre el mismo banco de pruebas.
- Control de brazos de bajo coste en docencia: al tener 51,7 millones de parámetros y licencia Apache-2.0, puede desplegarse en un SO-100 con una GPU modesta o incluso en CPU, lo que facilita prácticas de laboratorio de robótica.
- Teleoperación asistida y aumento de datos: la política puede ejecutar tramos repetitivos de una tarea mientras el operador interviene solo en los segmentos críticos, generando nuevas demostraciones que alimenten reentrenamientos.
- Automatización de laboratorio: trasvase de muestras, agitación o colocación de portamuestras en posiciones fijas, donde la repetibilidad importa más que la generalización a objetos nuevos.
- Despliegue en robótica móvil o *edge*: por su tamaño, puede ejecutarse en dispositivos tipo NVIDIA Jetson dentro del bucle de control, sin depender de conectividad con un servidor central.
- Evaluación de robustez multisensor: al haberse entrenado con una configuración concreta de tres sensores, permite estudiar la degradación de la política cuando se elimina o perturba una de las modalidades de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas. El paper de ACT reporta tasas de éxito elevadas en tareas bimanuales de precisión, pero esos resultados corresponden a la configuración experimental del artículo y no a este checkpoint concreto, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 51.668.614 parámetros ocupan aproximadamente 207 MB; en bf16/fp16, unos 103 MB; en int8, unos 52 MB. A esto hay que sumar la memoria de las activaciones y del backbone de visión, no documentado.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2-4 GB de VRAM es suficiente, por ejemplo RTX 3050, RTX 3060, RTX 4060 o superiores. El ejemplo de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- Cabe en GPU de consumo: sí, con holgura. También es viable la inferencia en CPU para tareas de baja frecuencia de control, y en dispositivos integrados tipo NVIDIA Jetson.
- Opciones de despliegue: LeRobot con PyTorch (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluación sobre robot real). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponible. En robótica, la latencia del bucle de control es crítica y depende del backbone de visión, de la resolución de imagen y del hardware; la model card no publica mediciones.
- Espacio en disco: el repositorio ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT) | Imitacion, action chunking con CVAE | 51.668.614 | No disponible | Apache-2.0 | Hugging Face, via LeRobot |
| Diffusion Policy | Imitacion, difusion sobre acciones | no disponible | No disponible | habitualmente Apache-2.0 en LeRobot | Implementado en LeRobot |
| SmolVLA | VLA (vision-language-action) | no disponible | No disponible | no disponible | Hugging Face, via LeRobot |
| ACT original (paper arXiv:2304.13705) | Imitacion, action chunking con CVAE | no disponible | No disponible | no disponible | Codigo de referencia del paper |

La comparación cuantitativa no es posible con la información disponible: no se han publicado parámetros, contextos ni tasas de éxito de las alternativas en los datos proporcionados. A nivel cualitativo, ACT se distingue de Diffusion Policy por predecir directamente el chunk de acciones en lugar de generar mediante un proceso de difusión iterativo, lo que suele traducirse en menor coste de inferencia; frente a los modelos VLA como SmolVLA, carece de entrada de lenguaje y de generalización a instrucciones en lenguaje natural.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser una política de imitación, hereda los sesgos de las demostraciones humanas con las que se entrenó, tanto en trayectorias como en posiciones de agarre.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el equivalente conductual: la política puede generar acciones fuera de distribución cuando el entorno difiere del visto en entrenamiento, sin señal de incertidumbre explícita.
- Limitaciones de contexto: el horizonte de acciones y la ventana de observación no se documentan. ACT no mantiene memoria de largo plazo; el comportamiento depende de las observaciones recientes y del estado latente fijado en inferencia.
- Dependencia del entorno de entrenamiento: la política está ajustada a una configuración concreta de robot, cámaras y sensores. Cambiar la iluminación, la cámara, la posición de la mesa o la tarea degradará el rendimiento.
- Generalización limitada a objetos y posiciones nuevos: como toda política de imitación entrenada con un dataset específico, no se puede asumir que transfiera a objetos o disposiciones no presentes en las demostraciones.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No hay cláusulas de uso aceptable adicionales documentadas.
- Trazabilidad escasa: no se publican número de episodios, composición del dataset, hiperparámetros ni métricas de evaluación. El modelo tiene 0 descargas y 0 likes, y no consta validación externa.
- Ausencia de datos de seguridad: no hay documentación sobre comportamientos peligrosos, límites de par, paradas de emergencia ni validación en entornos compartidos con personas. Cualquier despliegue físico exige salvaguardas externas.
- Caveat de producción: la licencia del dataset de entrenamiento no está confirmada, lo que puede condicionar la redistribución del modelo derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jogarulfop/policy_2026-09-21_cheap_shakeit_bench_3sensors_v2_pzt_disk_nfft_512
- Dataset de entrenamiento: https://huggingface.co/datasets/jogarulfop/2026-09-21_cheap_shakeit_bench_3sensors_v2_pzt_disk_nfft_512
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a contenido no relacionado (foros y preguntas sobre Netflix) y se han descartado.
