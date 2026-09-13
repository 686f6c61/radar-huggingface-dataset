# kkahn2014/omx_act_policy2

## Resumen

`kkahn2014/omx_act_policy2` es una política de control robótico basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705. En lugar de predecir una acción única por paso de control, el modelo predice fragmentos (chunks) de acciones futuras, lo que reduce el error de acumulación y permite ejecutar movimientos finos con hardware de bajo coste. Está entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El checkpoint tiene 51.668.614 parámetros (aproximadamente 51,7 millones), un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache-2.0. Es un modelo denso, no un modelo de lenguaje: consume observaciones (imágenes de cámara y estado del robot) y produce comandos de acción, por lo que no tiene longitud de contexto, idiomas ni capacidades de generación de texto.

Fue publicado por el usuario kkahn2014 y está asociado al dataset `kkahn2014/pick_and_place1`, lo que sugiere un caso de uso de recogida y colocación (pick and place) entrenado sobre datos de teleoperación propios. Su relevancia es acotada: se trata de un checkpoint de investigación con 7 descargas y 0 valoraciones, sin documentación específica sobre el robot objetivo, el número de episodios de entrenamiento ni métricas de éxito publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder CVAE y decoder de acciones, según el método del artículo arXiv:2304.13705 |
| Parámetros totales | 51.668.614 (≈51,7 M) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. La ventana de observación y el número de acciones por chunk no están documentados en la información disponible |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones; solo se indica que el repositorio contiene safetensors en su precisión de entrenamiento) |
| Idiomas soportados | No aplica: política de control robótico que consume imágenes y estado y emite acciones; no procesa lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Librería | LeRobot (`library_name: lerobot`) |
| Pipeline | Robotics |
| Dataset de entrenamiento | `kkahn2014/pick_and_place1` |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de comportamiento-clonado (behavior cloning) que combina un encoder tipo CVAE con un transformer encoder-decoder. El encoder CVAE toma el estado y las observaciones junto con una variable latente de estilo, y el decoder genera una secuencia de k acciones futuras de forma no autorregresiva. En inferencia, la latencia de la variable latente se fija a la media de la prior, lo que da un comportamiento determinista. El método se popularizó por lograr manipulaciones finas y bimanuales con brazos de bajo coste, y LeRobot lo incluye como tipo de política (`--policy.type=act`) entrenable con `lerobot-train`.

En cuanto a este checkpoint concreto, la información disponible no detalla el número de tokens o muestras de entrenamiento, la composición del dataset `kkahn2014/pick_and_place1`, el número de episodios, la resolución de las cámaras, la configuración del brazo robótico, el número de acciones por chunk ni si se aplicaron fases de ajuste posteriores (RLHF/DPO no aplican a este tipo de modelo; sí podrían aplicarse variantes de regularización como el término KL del CVAE, pero no se documenta). Tampoco se especifican las innovaciones particulares de esta copia respecto a la implementación de referencia de LeRobot. Todos estos datos figuran como no disponibles.

## Capacidades

- Control robótico por imitación: genera chunks de acciones de manipulación a partir de observaciones visuales y de estado.
- Ejecución de tareas de pick and place, según se deduce del dataset asociado `kkahn2014/pick_and_place1`.
- Aprendizaje desde datos de teleoperación: la política se entrena con demostraciones humanas, no con recompensas.
- Predicción de acciones multi-paso: al emitir secuencias de acciones en lugar de pasos individuales, reduce el error de acumulación típico del control paso a paso.
- Compatibilidad con el ecosistema LeRobot para entrenamiento (`lerobot-train`), evaluación y registro de episodios (`lerobot-record`).
- Integración con brazos de bajo coste tipo follower mediante el parámetro `--robot.type` (el ejemplo de la model card usa `so100_follower`; el robot específico de este checkpoint no está documentado).
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso simbólico, multilingüismo, visión general, audio ni modo de pensamiento: no es un modelo de lenguaje ni un VLM de propósito general.

## Casos de uso

- Recogida y colocación en línea de laboratorio: la política ejecuta la secuencia de aproximación, agarre y depósito aprendida del dataset `pick_and_place1`, adecuada para prototipos de manipulación repetitiva.
- Automatización de tareas de bin picking en investigación: con 51,7 M de parámetros, el modelo cabe en GPUs modestas y permite iterar rápidamente sobre distintas configuraciones de cámara y de objeto.
- Evaluación comparativa de políticas de imitación: sirve como referencia ACT frente a otros métodos (Diffusion Policy, VQ-BeT) dentro del mismo banco de pruebas LeRobot.
- Reproducción de experimentos de teleoperación: al estar entrenado con un dataset público asociado, permite auditar el pipeline completo desde la recogida de datos hasta la inferencia.
- Despliegue en brazos de bajo coste: con menos de 1 GB de pesos en fp32, es viable en equipos de sobremesa con GPU de gama media o incluso en CPU para pruebas no críticas en tiempo real.
- Base para ajuste fino con datos propios: el tipo de política ACT de LeRobot admite reentrenamiento sobre nuevos datasets de manipulación para adaptar la política a otro robot o a otra tarea.
- Docencia y formación en robótica con aprendizaje profundo: el tamaño reducido y el código abierto de LeRobot facilitan usarlo como ejemplo didáctico de comportamiento-clonado con transformers.
- Prototipado de células de montaje simples: para tareas de un solo brazo con posiciones repetibles, la política puede sustituir a la programación manual por trayectorias fijas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas. El artículo de ACT (arXiv:2304.13705) reporta sus propios resultados experimentales, pero no son atribuibles a este checkpoint concreto, que no documenta su configuración de entrenamiento ni de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 207 MB para los pesos en fp32 (51,67 M × 4 bytes) y unos 103 MB en fp16; con activaciones y buffers de imagen, el consumo real se mantiene holgadamente por debajo de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con CUDA de gama media o superior (RTX 3060, RTX 4090, A100, H100). El modelo es pequeño para todas ellas; la elección depende más del bucle de control en tiempo real que de la memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en CPU para pruebas sin requisitos de latencia.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` con `--policy.path` para inferencia/evaluación) sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. No se documentan frecuencia de control, tiempo de inferencia por chunk ni rendimiento medido.
- Almacenamiento: el repositorio ocupa 0,2 GB, por lo que el coste de descarga y de disco es mínimo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| omx_act_policy2 (este) | ACT, comportamiento-clonado | 51,7 M | No aplica | Apache-2.0 | Hugging Face, 7 descargas | Checkpoint específico para `pick_and_place1` |
| Diffusion Policy | Política por difusión | No disponible en la información proporcionada | No aplica | No disponible | Implementación pública en investigación | Genera secuencias mediante pasos de denoising; coste de inferencia mayor por los múltiples pasos |
| VQ-BeT | Transformer autoregresivo con VQ-VAE | No disponible en la información proporcionada | No aplica | No disponible | Implementación pública en investigación | Cuantiza acciones en un libro de códigos y genera la secuencia de forma autoregresiva |
| Política ACT de referencia (LeRobot) | ACT, comportamiento-clonado | No disponible en la información proporcionada | No aplica | Apache-2.0 | Hugging Face / GitHub | Implementación base sobre la que se entrena este checkpoint; sin los datos de este ajuste |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento no verificado: no hay tasas de éxito publicadas, ni número de episodios de evaluación, ni vídeos de despliegue. La utilidad real del checkpoint es desconocida.
- Especificidad del dominio: la política está entrenada sobre `kkahn2014/pick_and_place1`; fuera de esa distribución de objetos, iluminación, cámara o robot, el comportamiento esperado es degradación o fallo.
- Sobrecarga de conocimiento (overfitting) probable: con un único dataset asociado, la política puede memorizar trayectorias en lugar de generalizar.
- Sin información sobre el robot objetivo: el nombre `omx` no se explica en la model card y la única pista es el ejemplo genérico `so100_follower` de la plantilla de LeRobot. Es necesario confirmar la morfología y las dimensiones de acción antes de cualquier despliegue.
- Sensibilidad a la calibración: como toda política de imitación con observaciones visuales, depende de la calibración de cámaras y de la repetibilidad del hardware.
- Interfaz de seguridad: no se documentan límites de par, de velocidad ni paradas de emergencia. En un robot real es imprescindible envolver la política con capas de seguridad externas.
- Riesgo de alucinación en el sentido de acciones fuera de distribución: existe, aunque el término se usa aquí de forma analógica; el modelo puede emitir comandos incoherentes si la observación se aleja de los datos de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero al derivar del método ACT conviene revisar también las condiciones de la implementación de LeRobot empleada y de los datos de entrenamiento originales, que no se detallan.
- Sesgos: no disponibles. No se documenta la demografía, el entorno ni la variabilidad de los datos de teleoperación.
- Trazabilidad limitada: 0 valoraciones, 7 descargas y ausencia de documentación sobre hiperparámetros, épocas o composición del dataset.
- Fecha de creación registrada: 2026-09-13, según los metadatos del repositorio.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/kkahn2014/omx_act_policy2
- Dataset asociado: https://huggingface.co/datasets/kkahn2014/pick_and_place1
- Artículo de ACT: https://huggingface.co/papers/2304.13705
- Artículo de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces recuperados correspondían a foros y sitios institucionales sin relación con el checkpoint.
