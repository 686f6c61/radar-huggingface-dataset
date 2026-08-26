# cbrian/pi05_task1_MM5_epi_100_step_10000_batch_32

## Resumen

El modelo `cbrian/pi05_task1_MM5_epi_100_step_10000_batch_32` es una política de control robótico basada en π₀.₅ (Pi05), un modelo Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence para lograr generalización en entornos abiertos. Esta implementación concreta ha sido entrenada y publicada mediante la librería LeRobot de Hugging Face, partiendo del checkpoint base `lerobot/pi05_libero` y ajustada con el dataset `cbrian/merge_task1_MM_epi_100`, que contiene 100 episodios de demostraciones de tareas de manipulación.

El modelo cuenta con 3.616.757.520 parámetros (aproximadamente 3,6 mil millones), lo que lo sitúa en la gama de los VLA de tamaño medio. Su relevancia actual radica en que π₀.₅ introduce mejoras frente a π₀ en cuanto a generalización a escenarios nunca vistos durante el entrenamiento, gracias a un entrenamiento conjunto con datos heterogéneos y una técnica denominada "knowledge insulation". Este fine-tune concreto está orientado a una tarea específica de manipulación, probablemente sobre un robot SO-100 u otro brazo de bajo coste, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, con experto de acciones (action expert) |
| Parametros totales | 3.616.757.520 (3,6 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, presumiblemente en BF16) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en ingles, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 7,5 GB) |

## Arquitectura y entrenamiento

π₀.₅ es un modelo VLA que combina un codificador de vision, un modelo de lenguaje y un "action expert" que genera acciones continuas de forma autoregresiva. La arquitectura general se describe en el articulo de arXiv 2504.16054, donde se detalla que el modelo se entrena mediante co-training con datos heterogeneos: demostraciones teleoperadas, datos de internet y datos sinteticos, lo que mejora la generalizacion a entornos nuevos. La tecnica de "knowledge insulation" permite separar el conocimiento linguistico-visual del control motor, evitando interferencias durante el ajuste fino.

En el caso de este checkpoint concreto, el entrenamiento se ha realizado con LeRobot sobre el dataset `cbrian/merge_task1_MM_epi_100`, con 100 episodios y 10.000 pasos de optimizacion (segun el nombre del repo). No se especifican detalles sobre el dataset (composicion, numero de tokens, si se uso RLHF o DPO), ni sobre la configuracion exacta de hiperparametros. El checkpoint base es `lerobot/pi05_libero`, que a su vez deriva de `lerobot/pi05_base`, preentrenado con mas de 10.000 horas de datos roboticos.

## Capacidades

- Control robotico de bajo nivel: genera acciones de articulacion (posicion, velocidad o esfuerzo) a partir de observaciones visuales y una instruccion en lenguaje natural.
- Generalizacion a entornos no vistos: gracias al entrenamiento con datos heterogeneos, puede adaptarse a disposiciones de objetos, iluminacion o fondos diferentes a los del entrenamiento.
- Manipulacion de objetos: adecuado para tareas de pick-and-place, apilado, insercion y otras tareas de mesa tipicas en benchmarks como LIBERO.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluacion y despliegue en robots reales (SO-100, SO-101, etc.).
- No soporta tool calling ni razonamiento multi-paso en el sentido de los LLM; su salida es directamente la secuencia de acciones del robot.
- Capacidades multilingues: no documentadas; probablemente limitadas al ingles de las instrucciones de entrenamiento.

## Casos de uso

- Automatizacion de tareas de laboratorio: el modelo puede controlar un brazo robotico para realizar experimentos repetitivos de manipulacion, como pipeteo o colocacion de muestras, gracias a su capacidad de seguir instrucciones en lenguaje natural.
- Pruebas de concepto en investigacion de VLA: sirve como punto de partida para investigadores que quieran estudiar el ajuste fino de π₀.₅ en tareas especificas sin entrenar desde cero, dado su tamano moderado y licencia permisiva.
- Despliegue en robots de bajo coste: al ser un modelo de 3,6 B, puede ejecutarse en GPUs de consumo (p. ej., RTX 3090) con cuantizacion, lo que permite prototipar en entornos academicos o de pequena empresa.
- Evaluacion de generalizacion open-world: se puede utilizar para medir hasta que punto un VLA ajustado con pocos episodios (100) generaliza a variaciones del entorno, comparando con el modelo base.
- Generacion de datos de entrenamiento: el modelo puede emplearse para recopilar demostraciones adicionales mediante control compartido (human-in-the-loop) y ampliar el dataset original.
- Educacion en robotica: como ejemplo de fine-tune de un VLA moderno con herramientas open source (LeRobot), es util para cursos de robotica y aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint en la informacion disponible. El articulo de π₀.₅ (arXiv 2504.16054) reporta mejoras frente a π₀ en tareas de generalizacion open-world, pero no se proporcionan numeros concretos para este fine-tune. Se recomienda consultar el paper original para metricas generales del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,6 B de parametros en BF16, el modelo ocupa aproximadamente 7,2 GB solo en pesos. Anadiendo el procesamiento de imagenes y el contexto, se estima un consumo de 10-12 GB en FP16/BF16. Con cuantizacion a 8 bits, podria reducirse a unos 5-6 GB.
- GPU recomendadas: una RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente para inferencia sin cuantizacion. Para entrenamiento o fine-tune, se recomienda al menos 24 GB de VRAM, aunque con tecnicas como LoRA podria bastar con 16 GB.
- Compatibilidad con GPUs de consumo: si, una RTX 3060 de 12 GB podria ejecutar el modelo con cuantizacion a 8 bits, aunque con latencia mayor.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluacion; tambien se puede exportar a formatos como ONNX o TensorRT, aunque no hay documentacion oficial al respecto. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un LLM generativo clasico.
- Latencia y throughput: no disponibles. Depende de la GPU, la resolucion de las imagenes de entrada y el numero de pasos de accion generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cbrian/pi05_task1_MM5_epi_100 (este) | 3,6 B | no disponible | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 3,6 B (estimado) | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7 B | 2048 tokens | MIT | Hugging Face |
| π₀ (original) | 3,2 B (estimado) | no disponible | no publica pesos | propietario |

Nota: los datos de OpenVLA y π₀ son de conocimiento general; no se dispone de comparativas directas de rendimiento con este checkpoint. El modelo base `lerobot/pi05_base` es el punto de partida para este fine-tune, por lo que comparte arquitectura y tamano.

## Limitaciones y advertencias

- Sesgos del dataset: al entrenarse con solo 100 episodios de un dataset concreto, el modelo puede sobreajustarse a las condiciones especificas de ese dataset (posicion de camara, iluminacion, color de objetos) y fallar en entornos muy diferentes.
- Riesgo de alucinacion de acciones: como cualquier VLA, puede generar secuencias de acciones incoherentes o peligrosas si la observacion visual es ambigua o fuera de distribucion. Es imprescindible supervisar la ejecucion en robot real.
- Limitaciones de contexto: no se ha documentado la longitud de contexto; es probable que este limitada a unas pocas decenas de tokens de instruccion y una o varias imagenes.
- Idioma: no se especifican idiomas soportados; el entrenamiento base de π₀.₅ se realizo principalmente con instrucciones en ingles, por lo que otros idiomas pueden degradar el rendimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero hay que atribuir la autoria y mantener el aviso de licencia. No hay restricciones adicionales conocidas.
- Dependencia de LeRobot: el modelo esta empaquetado para LeRobot; su uso fuera de este ecosistema requiere conversion de formatos, que no esta documentada.
- Fecha de creacion: el modelo fue creado en agosto de 2026 (segun los metadatos), lo que sugiere que es un artefacto reciente y posiblemente experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrian/pi05_task1_MM5_epi_100_step_10000_batch_32
- Modelo base de LeRobot: https://huggingface.co/lerobot/pi05_base
- Repositorio de π₀.₅ (GitHub): https://github.com/ldddddddl/pi05
- Articulo de arXiv: https://arxiv.org/abs/2504.16054
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Ejemplo de fine-tune similar: https://huggingface.co/jaywu109/pi05_task1_MM3_epi_500_step_25000_batch_32
