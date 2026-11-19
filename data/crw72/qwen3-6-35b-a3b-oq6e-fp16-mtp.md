# crw72/Qwen3.6-35B-A3B-oQ6e-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ6e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario crw72 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del modelo base de Qwen, convertido al formato MLX y cuantizado con la herramienta oQ (oMLX v0.8.0) para su ejecución eficiente en hardware Apple Silicon. El resultado es un artefacto de 35.951.822.704 parámetros totales con un peso medio efectivo de 6,961 bits por parámetro y un tamaño de repositorio de 31,3 GB.

El modelo base pertenece a la familia Qwen3.6 con arquitectura MoE (mezcla de expertos), tal como indica el tag `qwen3_5_moe`, e incluye componentes de lenguaje, visión y una cabeza MTP (multi-token prediction). La cuantización preserva estas tres partes con precisiones distintas: el grueso del modelo de lenguaje en 6 bits, la torre de visión en FP32 y la cabeza MTP en FP16, lo que refleja una estrategia deliberada de mantener en alta precisión los módulos pequeños y sensibles.

Su relevancia es doble: por un lado, permite ejecutar un modelo de casi 36.000 millones de parámetros en equipos con memoria unificada de Apple dentro de un rango de ~30 GiB de pesos; por otro, sirve como referencia de cómo aplicar cuantización mixta por componente en lugar de una cuantización uniforme. La licencia Apache 2.0 del modelo base se mantiene en este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con torre de visión y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16, FP32 (media efectiva 6,961 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 34,661 B | 28,791 GB / 26,813 GiB |
| Visión | 0,447 B | 1,786 GB / 1,664 GiB |
| Cabeza MTP | 0,845 B | 0,704 GB / 0,656 GiB |
| Total | 35,952 B | 31,281 GB / 29,133 GiB |

Distribución de precisión:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 6-bit, grupo 64 | 33,018 B | 91,838 % | 24,984 GiB | 6,50 |
| Affine 8-bit, grupo 128 | 0,129 B | 0,359 % | 0,124 GiB | 8,25 |
| Affine 8-bit, grupo 64 | 2,328 B | 6,474 % | 2,303 GiB | 8,50 |
| FP16 | 0,031 B | 0,086 % | 0,058 GiB | 16,00 |
| FP32 | 0,447 B | 1,242 % | 1,664 GiB | 32,00 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE), según el tag `qwen3_5_moe` del repositorio. El checkpoint incluye tres bloques diferenciados: un modelo de lenguaje de 34,661 B de parámetros, una torre de visión de 0,447 B y una cabeza MTP de 0,845 B. La presencia de la cabeza MTP sugiere soporte para decodificación multi-token, una técnica de decodificación especulativa que predice varios tokens por paso para aumentar el throughput. El número de parámetros activos por token, el número de expertos y la dimensión oculta no se detallan en la información disponible.

No se dispone de información sobre el proceso de entrenamiento del modelo base: ni el volumen de tokens, ni la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La contribución técnica de este repositorio concreto es la cuantización mixta: se aplica 6 bits con grupo 64 al 91,8 % de los pesos (el núcleo del modelo de lenguaje), se reservan 8 bits para un 6,8 % de los pesos presumiblemente más sensibles, y se mantienen en FP16 y FP32 los módulos pequeños (cabeza MTP y visión), donde el ahorro de memoria es marginal y la pérdida de precisión sería más costosa. El resultado son 29,133 GiB de pesos con una media efectiva de 6,961 bits por parámetro.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,447 B de parámetros en FP32, lo que indica capacidades multimodales de entrada visual.
- Decodificación multi-token: la cabeza MTP de 0,845 B en FP16 está diseñada para predecir varios tokens por paso y acelerar la generación.
- Ejecución nativa en MLX, con soporte para memoria unificada de Apple Silicon.
- Tool calling y function calling: no confirmado en la información disponible.
- Comportamiento agéntico y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible el listado de idiomas soportados.
- Modo thinking explícito: no confirmado en la información disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 29,133 GiB de pesos, el modelo se puede cargar en equipos Apple con 32 GB o más de memoria unificada, lo que permite disponer de un modelo de ~36 B de parámetros en local sin GPU dedicada, usando MLX como runtime.
- Prototipado multimodal en estación de trabajo: la torre de visión en FP32 permite experimentar con tareas de imagen a texto en local antes de escalar a infraestructura con GPU, manteniendo la calidad de la parte visual al no cuantizarla.
- Evaluación de cuantización mixta: el repositorio documenta con precisión la distribución de bits por tensor, lo que lo convierte en un caso de referencia para comparar la pérdida de calidad de una cuantización mixta frente a una uniforme de 6 bits sobre el mismo modelo base.
- Generación acelerada con MTP: la cabeza MTP en FP16 está pensada para decodificación especulativa; en entornos MLX se puede usar para reducir la latencia por token en generación de texto largo, como resúmenes o traducciones de documentos.
- Desarrollo de asistentes de código en local: si el modelo base conserva las capacidades de código de la familia Qwen, este checkpoint permite integrar un asistente en el flujo de trabajo de un desarrollador con hardware Apple, sin enviar código a servicios externos.
- Investigación sobre eficiencia de memoria: sirve para medir el equilibrio entre precisión y huella de memoria en arquitecturas MoE con componentes auxiliares (visión, MTP), comparando el comportamiento de los pesos en 6 bits frente a los que se mantienen en 8 bits, FP16 y FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 29,133 GiB solo para los pesos; hay que añadir el espacio para KV cache, activaciones y overhead del runtime MLX. En la práctica se recomienda un mínimo de 36-40 GB de memoria unificada para contexto moderado.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (familias M1/M2/M3/M4 Pro, Max y Ultra). El formato MLX no está pensado para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? En GPUs dedicadas de consumo no es un formato utilizable directamente (MLX). En Apple Silicon, sí: equipos con 36 GB o más de memoria unificada, como Mac Studio o MacBook Pro con chip Max/Ultra.
- Opciones de despliegue: MLX (runtime nativo) y herramientas del ecosistema oMLX/oQ. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan este formato de pesos MLX cuantizado.
- Latencia y throughput estimados: no disponibles. La presencia de la cabeza MTP sugiere que el modelo está preparado para decodificación especulativa, lo que debería mejorar el throughput frente a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Precision media | Licencia | Formato |
|---|---|---|---|---|---|
| crw72/Qwen3.6-35B-A3B-oQ6e-fp16-mtp | 35,952 B | no disponible | 6,961 bits/peso | Apache 2.0 | MLX safetensors |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952 B (aprox.) | no disponible | BF16/FP16 (no confirmado) | Apache 2.0 | safetensors |
| Alternativas de ~30-40 B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base sin cuantizar: este checkpoint reduce el almacenamiento a 29,133 GiB con una media de 6,961 bits/peso, frente a los aproximadamente 72 GB que ocuparían los mismos parámetros en FP16. No se dispone de información sobre otras cuantizaciones del mismo modelo base ni de modelos comparables de la misma categoría en formato MLX.

## Limitaciones y advertencias

- Artefacto derivado, no modelo original: cualquier limitación del Qwen3.6-35B-A3B base (sesgos, alucinaciones, cobertura idiomática) se hereda aquí, y la cuantización puede añadir degradación adicional.
- Pérdida de calidad por cuantización: el 91,8 % de los pesos está en 6 bits con grupo 64; aunque la media efectiva es 6,961 bits/peso, no se han publicado evaluaciones que cuantifiquen la pérdida respecto al modelo en FP16.
- Dependencia de plataforma: el formato MLX limita el uso a hardware Apple Silicon; no es desplegable en GPUs NVIDIA, TPUs ni en la mayoría de infraestructuras cloud estándar.
- Idiomas no documentados: la model card no lista los idiomas soportados, por lo que el rendimiento multilingüe no está verificado para este checkpoint.
- Contexto no documentado: se desconoce la longitud máxima de contexto utilizable, lo que impide planificar aplicaciones con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.6-35B-A3B y de las herramientas de cuantización (oQ/oMLX) antes de un despliegue en producción.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni reportes de uso en producción.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crw72/Qwen3.6-35B-A3B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
