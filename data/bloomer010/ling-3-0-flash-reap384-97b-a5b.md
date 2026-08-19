# bloomer010/Ling-3.0-flash-REAP384-97B-A5B

## Resumen

El modelo `Ling-3.0-flash-REAP384-97B-A5B` es un artefacto de investigacion desarrollado por el usuario `bloomer010` que aplica la tecnica de poda de expertos REAP (Router-weighted Expert Activation Pruning) sobre el modelo base `inclusionAI/Ling-3.0-flash`. El objetivo principal es reducir el tamano total del modelo de 124.000 millones de parametros a 96.519 millones, manteniendo intactos los 5.100 millones de parametros activos por token. Esta reduccion se consigue eliminando el 25% de los expertos enrutados en cada capa (de 512 se pasa a 384), lo que permite estudiar el impacto de la poda en arquitecturas de mezcla de expertos (MoE) sin necesidad de reentrenamiento.

La relevancia de este modelo radica en que demuestra una metodologia de compresion one-shot que no requiere fine-tuning ni entrenamiento de recuperacion, lo que supone un ahorro computacional significativo frente a tecnicas de destilacion o poda iterativa. La calibracion se realiza con un millon de tokens del dataset Ultrachat, exclusivamente orientado a chat. Se distribuye en formato BF16 con safetensors y requiere el uso de codigo personalizado (`bailing_hybrid` / BailingMoeV3) para su carga, por lo que es necesario ejecutarlo con `trust_remote_code=True`. Es un modelo pensado para la comunidad cientifica y para desarrolladores interesados en tecnicas de compresion de modelos MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (BailingMoeV3 / `bailing_hybrid`) |
| Parametros totales | 96.519.001.952 (96,5B) |
| Parametros activos | 5.100.000.000 (5,1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo (safetensors); versiones GGUF en repositorio hermano |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura MoE del modelo base `inclusionAI/Ling-3.0-flash`, que utiliza el codigo personalizado `bailing_hybrid` y la implementacion BailingMoeV3. La innovacion principal es la aplicacion de REAP, una tecnica de poda de expertos one-shot. En este proceso, cada experto se puntua multiplicando el valor de la puerta del router por la norma L2 de su salida, calculada sobre datos de calibracion. Los expertos con menor puntuacion se eliminan directamente, sin realizar ningun tipo de fine-tuning posterior.

La calibracion se realizo con un millon de tokens del dataset Ultrachat, lo que implica que la poda esta optimizada para tareas de conversacion y generacion de texto en ese dominio. Al no haber entrenamiento de recuperacion, se espera una cierta degradacion del rendimiento respecto al modelo original, aunque esta degradacion es precisamente el objeto de estudio del artefacto. El resultado es un modelo con 384 de los 512 expertos por capa, lo que reduce el numero total de parametros en un 22,2% (de 124B a 96,5B) manteniendo la misma latencia por token, ya que los parametros activos no cambian.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base `Ling-3.0-flash`, aunque la poda puede afectar a la calidad de las respuestas.
- Investigacion sobre poda de expertos: es un artefacto disenado para estudiar el comportamiento de los modelos MoE tras la eliminacion de expertos.
- Analisis de la distribucion de pesos del router: permite inspeccionar como se redistribuyen las cargas entre los expertos supervivientes.
- Compatibilidad con cuantizacion posterior: al existir un repositorio hermano con versiones GGUF, puede utilizarse en entornos con recursos limitados.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion academica sobre compresion de modelos MoE: el modelo permite analizar como afecta la poda de expertos a la perplejidad, la coherencia y la diversidad de las respuestas generadas, sirviendo como base para publicaciones cientificas.
- Evaluacion de la degradacion de rendimiento tras poda: los investigadores pueden comparar las salidas de este modelo con las del modelo base `Ling-3.0-flash` para cuantificar la perdida de calidad y validar la eficacia del metodo REAP.
- Estudio de la distribucion de pesos del router: al mantener el codigo BailingMoeV3, es posible inspeccionar como se redistribuyen las activaciones entre los 384 expertos restantes, lo que ayuda a entender la redundancia en arquitecturas MoE.
- Base para fine-tuning posterior con recuperacion de rendimiento: dado que no se ha realizado entrenamiento de recuperacion, los desarrolladores pueden aplicar tecnicas de fine-tuning especificas para intentar recuperar parte de la precision perdida y obtener un modelo mas compacto y eficiente.
- Despliegue en entornos con restricciones de memoria: gracias al repositorio hermano con versiones GGUF, es posible cuantizar el modelo y ejecutarlo en GPUs de consumo, aunque el tamano total en BF16 (193,1 GB) requiere hardware de datacenter.
- Comparativa de eficiencia entre distintos niveles de poda: al existir otros artefactos similares (por ejemplo, con distinto numero de expertos), se puede construir una curva de trade-off entre tamano y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 193,1 GB en BF16, segun el tamano del repositorio. Esto implica que se necesitan multiples GPUs de datacenter.
- GPU recomendadas: para ejecutar el modelo en BF16 se requieren al menos tres GPUs A100 80GB o H100 80GB en paralelo, o un nodo con memoria unificada suficiente.
- Compatibilidad con GPU de consumo: no es viable ejecutar el modelo en BF16 en GPUs como la RTX 4090 (24 GB) sin cuantizacion. Sin embargo, las versiones GGUF del repositorio hermano podrian permitir su ejecucion en estas tarjetas con cuantizaciones de 4 o 8 bits.
- Opciones de despliegue: el modelo se carga con la libreria `transformers` utilizando `trust_remote_code=True`. Para entornos de produccion, se puede considerar vLLM o TGI si soportan el codigo personalizado, aunque no esta confirmado. La opcion mas segura es usar `llama.cpp` con los pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-flash-REAP384-97B-A5B (este modelo) | 96,5B | 5,1B | no disponible | no disponible | safetensors / GGUF |
| inclusionAI/Ling-3.0-flash (modelo base) | 124B | 5,1B | no disponible | no disponible | safetensors |
| Mixtral 8x7B (referencia MoE) | 46,7B | 12,9B | 32k | Apache 2.0 | safetensors / GGUF |

La comparativa se limita a parametros y disponibilidad, ya que no se dispone de datos de benchmarks. Este modelo se distingue por mantener el mismo numero de parametros activos que su base (5,1B), lo que lo hace mas eficiente en latencia que Mixtral 8x7B, aunque su tamano total en disco es mayor. La principal ventaja es que permite estudiar la poda sin cambiar la arquitectura de inferencia.

## Limitaciones y advertencias

- Sesgos conocidos: al estar calibrado exclusivamente con Ultrachat, puede presentar sesgos propios de ese dataset, aunque no se han documentado explicitamente.
- Riesgo de alucinacion: al ser un modelo de generacion de texto, existe riesgo inherente de alucinacion, especialmente tras la poda que puede degradar la coherencia.
- Limitaciones de contexto: la longitud de contexto no esta especificada, por lo que se desconoce su capacidad para manejar secuencias largas.
- Restricciones de licencia: la licencia no esta disponible, lo que supone un riesgo legal para cualquier uso comercial o despliegue en produccion.
- Requisito de codigo personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del autor. Se recomienda auditar el codigo antes de su uso en entornos de produccion.
- Degradacion de rendimiento: al ser un artefacto de investigacion sin fine-tuning posterior, es probable que el rendimiento en tareas complejas sea inferior al del modelo base.
- Idiomas soportados: no se especifican, por lo que no se garantiza un comportamiento adecuado en castellano u otros idiomas.

## Enlaces

- Repositorio HuggingFace: [bloomer010/Ling-3.0-flash-REAP384-97B-A5B](https://huggingface.co/bloomer010/Ling-3.0-flash-REAP384-97B-A5B)
- Modelo base: [inclusionAI/Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- Paper de referencia REAP: [arXiv:2510.13999](https://arxiv.org/abs/2510.13999)
