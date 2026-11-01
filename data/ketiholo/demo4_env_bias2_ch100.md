# ketiholo/demo4_env_bias2_ch100

## Resumen

El modelo `ketiholo/demo4_env_bias2_ch100` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el paper arXiv:2304.13705. Lo publica el usuario ketiholo en HuggingFace usando la librería LeRobot de HuggingFace, y está pensado para controlar robots manipuladores a partir de datos de teleoperación. No es un modelo de lenguaje: es un modelo de control motor que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación.

El modelo tiene 51.676.295 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real en hardware de consumo. Está entrenado sobre el dataset `ketiholo/demo4`, presumiblemente una colección de demostraciones teleoperadas, y se distribuye bajo licencia Apache 2.0.

Su relevancia actual es la de un ejemplo práctico de política ACT reproducible con LeRobot: sirve como referencia para quien quiera entrenar o evaluar políticas de imitación en robots tipo SO-100/SO-101, y como punto de partida para experimentar con variantes de configuración (el sufijo `ch100` sugiere un chunk size de 100 pasos y `env_bias2` una variante de sesgo ambiental).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parametros totales | 51.676.295 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para aprendizaje por imitación. El encoder procesa las observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y el decoder genera un chunk de acciones futuras de forma autorregresiva. La innovación clave del método es predecir un bloque de acciones (chunking) en lugar de una sola acción por paso, lo que mitiga el problema de error compounding en políticas de imitación y permite un control más suave. El paper original también introduce una técnica de ensamblado temporal (temporal ensembling) para combinar chunks solapados durante la inferencia.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset `ketiholo/demo4`, ni si se aplicaron técnicas de regularización adicionales. El nombre del repositorio sugiere un chunk size de 100 y una variante de sesgo ambiental (`env_bias2`), pero no hay documentación que confirme estos detalles. No se indica si hubo RLHF, DPO ni ningún tipo de ajuste por preferencias humanas; en el contexto de ACT esto no es habitual, ya que el entrenamiento es puramente supervisado sobre demostraciones.

## Capacidades

- Control de robots manipuladores mediante predicción de chunks de acciones.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Procesamiento de observaciones multimodales (imágenes de cámaras y estado de articulaciones) en el encoder.
- Generación de secuencias de acciones de longitud fija (chunk size, presumiblemente 100 según el nombre).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general ni audio.

## Casos de uso

- Manipulación robótica de precisión: el modelo puede ejecutar tareas de pick-and-place o ensamblaje aprendidas de demostraciones humanas, prediciendo chunks de acciones que suavizan la trayectoria y reducen el error acumulado.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT (distintos chunk sizes, configuraciones de sesgo) sobre el mismo dataset de demostraciones.
- Prototipado rápido en robots de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, puede desplegarse en un SO-100 o SO-101 con una GPU de consumo, lo que facilita iterar en laboratorios con presupuesto limitado.
- Evaluación de políticas en entornos simulados o reales: el flujo `lerobot-record` permite grabar episodios de evaluación y medir la tasa de éxito de la política en tareas concretas.
- Educación y formación: el modelo y su pipeline de entrenamiento son un ejemplo didáctico de cómo se entrena una política ACT desde cero con LeRobot, adecuado para cursos de robótica o aprendizaje automático.
- Automatización de tareas repetitivas en laboratorio: tareas como mover tubos de ensayo o clasificar piezas pueden aprenderse con pocas demostraciones y ejecutarse de forma autónoma con esta política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,2 GB en precisión nativa (fp32). En fp16 serían unos 0,1 GB, y en int8 unos 0,05 GB. La VRAM real necesaria depende del tamaño de las imágenes de entrada y del batch, pero en cualquier caso es muy inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede usar una RTX 3050, RTX 4060, RTX 4090, A100 o H100 sin problema. También es viable en CPU para inferencia de baja frecuencia, aunque no se recomienda para control en tiempo real.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (comando `lerobot-record` con `--policy.path`), y potencialmente exportación a ONNX o TorchScript para integración en pipelines propios. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un transformer de 51,7 M de parámetros, la inferencia por chunk debería ser del orden de milisegundos en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo4_env_bias2_ch100 | 51,7 M | no aplica | no disponible | Apache 2.0 | HuggingFace |
| ACT original (paper 2304.13705) | ~80 M (según paper, no confirmado) | no aplica | éxito alto en tareas de manipulación (según paper) | no disponible | Código en repositorios de investigación |
| Diffusion Policy (paper 2303.04137) | variable según configuración | no aplica | competitivo en manipulación | no disponible | Código disponible |
| RT-1 / RT-2 (Google) | miles de millones | no aplica | alto en tareas generales | no disponible | No público |

No se dispone de datos de rendimiento comparativo directo para este checkpoint concreto. La comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset específico (`ketiholo/demo4`), la política hereda los sesgos de las demostraciones (posiciones, velocidades, objetos y entornos concretos). No generalizará a configuraciones de robot distintas ni a objetos no vistos.
- Riesgo de alucinación: en el contexto de políticas de imitación, el equivalente es la generación de acciones no válidas o inseguras cuando la observación se sale de la distribución de entrenamiento. No hay mecanismos de seguridad incorporados.
- Limitaciones de contexto o idioma: no aplica en el sentido de modelos de lenguaje, pero la ventana de observación está fijada por la configuración de entrenamiento; no se documenta su tamaño.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el dataset subyacente (`ketiholo/demo4`) puede tener sus propias restricciones no indicadas en la model card.
- Caveats para producción: no se han publicado métricas de tasa de éxito, robustez ni latencia. El modelo tiene solo 20 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad. No se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa en el robot y entorno objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/ketiholo/demo4_env_bias2_ch100
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset: https://huggingface.co/datasets/ketiholo/demo4
