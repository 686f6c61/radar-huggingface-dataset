# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ8e-fp16-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ8e-fp16-mtp es una cuantización de precisión mixta del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El checkpoint resultante contiene 179.999.981.459 parámetros (aproximadamente 180.000 millones) y se distribuye en formato MLX con safetensors, lo que lo orienta al ecosistema de Apple Silicon mediante la librería MLX. El autor lo ha generado con la herramienta oQ de oMLX v0.7.4.dev1, aplicando una estrategia de cuantización mixta que combina bloques de 8 bits afines con grupos de 64 y 128, además de capas en FP16 y FP32.

El modelo base pertenece a la familia Qwen3.8 Flash Next según su denominación, e incorpora componentes diferenciados: un modelo de lenguaje de 125.744 millones de pesos lógicos, una tabla de embeddings N-gram de 51.200 millones, un módulo de visión de 0.449 millones y una cabeza MTP (multi-token prediction) de 2.607 millones. Esta combinación sugiere un modelo multimodal con decodificación especulativa mediante predicción multi-token, aunque la model card no detalla la arquitectura interna ni los datos de entrenamiento.

La relevancia de esta ficha radica en que documenta una de las pocas cuantizaciones de 8 bits publicadas para un modelo de 180.000 millones de parámetros en formato MLX, con un tamaño de repositorio de 337,5 GB y un promedio efectivo de 8,700 bits por peso en el checkpoint completo. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, benchmarks ni detalles de entrenamiento, lo que restringe la evaluación rigurosa del modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8 Flash Next; incluye módulo de visión y cabeza MTP) |
| Parametros totales | 179.999.981.459 (~180.000 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit grupo 128, affine 8-bit grupo 64, FP16, FP32, N-gram affine 8-bit grupo 32; promedio efectivo 8,700 bits/peso (8,581 sin la tabla N-gram) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 8-bit cuantizado |
| Tamano del repositorio | 337,5 GB |
| Desglose de almacenamiento | LM: 133,590 GB; N-gram embedding: 57,600 GB; visión: 1,796 GB; cabeza MTP: 2,770 GB; total: 195,756 GB (182,312 GiB) |
| Libreria | mlx |
| Modelo base | ukisai/Swift1.5-Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

La información disponible no permite describir con detalle la arquitectura interna del modelo base. La model card del checkpoint cuantizado indica únicamente que se trata de una cuantización del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, y el desglose de componentes revela la presencia de un modelo de lenguaje, un módulo de visión, una cabeza MTP y una tabla de embeddings N-gram. La inclusión de una cabeza MTP (multi-token prediction) de 2.607 millones de parámetros apunta a una estrategia de decodificación especulativa o predicción multi-token, habitual en modelos optimizados para latencia de inferencia, pero no se detalla su funcionamiento.

En cuanto al entrenamiento, no se han publicado en la información disponible datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. El proceso documentado es exclusivamente el de cuantización: el autor indica que el modelo fue recuantizado el 2026-11-11 con oMLX v0.7.4.dev1, y que se recomienda volver a descargar si se tenía una copia anterior. La distribución de bits muestra que el 69,932% de los pesos lógicos se almacena en affine 8-bit con grupo 64 (8,50 bits/peso efectivos), el 28,445% en la tabla N-gram affine 8-bit con grupo 32 (9,00 bits/peso), y solo un 0,037% y un 0,249% permanecen en FP16 y FP32 respectivamente.

## Capacidades

- Generación de texto y modelado de lenguaje: el componente LM de 125.744 millones de pesos lógicos sugiere capacidad para generación y razonamiento general, aunque no se detallan capacidades específicas en la información disponible.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0.449 millones de pesos lógicos (1.796 GB de almacenamiento), lo que indica soporte multimodal de entrada de imagen, si bien no se especifica la resolución ni el formato admitido.
- Predicción multi-token (MTP): la cabeza MTP de 2.607 millones de parámetros apunta a decodificación especulativa o generación acelerada, sin que la model card describa su uso concreto.
- Embeddings N-gram: la tabla N-gram de 51.200 millones de pesos lógicos (28,445% del total) sugiere un mecanismo de representación léxica o de recuperación basado en n-gramas, sin detalles funcionales publicados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de alta gama: el formato MLX y la cuantización de 8 bits permiten ejecutar un modelo de 180.000 millones de parámetros en equipos con memoria unificada muy amplia (por encima de 192 GB), lo que lo hace adecuado para estaciones de trabajo Mac Studio o Mac Pro con M-Ultra y memoria suficiente.
- Prototipado de aplicaciones multimodales: la presencia del módulo de visión permite experimentar con tareas que combinen texto e imagen, aunque sin documentación sobre resolución o formato de entrada habría que validar el comportamiento empíricamente.
- Investigación sobre cuantización mixta: el checkpoint sirve como caso de estudio de la técnica oQ de oMLX, con una distribución de bits documentada al detalle (8,25, 8,50, 9,00 y 16,00 bits/peso según el bloque), útil para analizar el impacto de la precisión mixta en la calidad de salida.
- Evaluación de decodificación especulativa: la cabeza MTP incorporada permite estudiar estrategias de predicción multi-token en un modelo de gran escala, comparando latencia y calidad frente a decodificación autoregresiva estándar.
- Despliegue de referencia en entornos MLX: al ser una de las pocas cuantizaciones publicadas de este modelo base, puede emplearse como checkpoint de referencia para pipelines de MLX en investigación, con la advertencia de que el tamaño de 337,5 GB exige almacenamiento dedicado.
- Reproducción de experimentos: dado que el autor documenta la versión exacta de la herramienta (oMLX v0.7.4.dev1) y la fecha de recuantización, el checkpoint facilita la reproducibilidad de experimentos de cuantización en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 182,312 GiB (195,756 GB) de almacenamiento; la inferencia requiere al menos esa cantidad de memoria unificada o VRAM, más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 192 GB y idealmente 256 GB o más.
- GPU recomendadas: no se especifican en la información disponible; por el formato MLX, el objetivo natural son chips Apple Silicon (M-Ultra) con memoria unificada amplia. No hay datos sobre compatibilidad con GPU NVIDIA.
- GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en configuraciones multi-GPU estándar sin agregación de memoria muy superior.
- Opciones de despliegue: MLX (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ8e-fp16-mtp (este) | ~180.000 M | no disponible | 8-bit mixta (oQ) | no disponible | MLX, safetensors |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | ~180.000 M (presumible) | no disponible | no cuantizado | no disponible | no disponible en la información |
| Alternativas de ~180.000 M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría, tamaño o tarea en la documentación proporcionada. La comparativa queda limitada al modelo base, del que solo se conoce su identificador en Hugging Face.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del checkpoint ni la del modelo base, lo que impide determinar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Idiomas no documentados: no se especifican los idiomas soportados, por lo que no puede garantizarse un comportamiento adecuado en castellano u otras lenguas.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, lo que impide cuantificar la calidad del modelo o compararlo con alternativas.
- Riesgo de alucinación: no evaluado en la información disponible; al no haber datos de entrenamiento ni evaluaciones, no puede estimarse la fiabilidad factual.
- Sesgos: no documentados; sin información sobre la composición del dataset de entrenamiento no es posible identificar sesgos conocidos.
- Contexto no especificado: se desconoce la longitud máxima de contexto, lo que limita el diseño de aplicaciones que dependan de ventanas largas.
- Restricciones de hardware: el tamaño de 182,312 GiB en memoria y 337,5 GB en disco restringe severamente el despliegue; no es viable en GPU de consumo ni en la mayoría de servidores sin memoria unificada o agregada muy amplia.
- Dependencia del ecosistema MLX: el checkpoint está empaquetado para MLX, lo que limita su uso a entornos Apple Silicon o a herramientas compatibles; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Versión específica de la herramienta: el autor advierte que el modelo fue recuantizado con oMLX v0.7.4.dev1 y que las copias anteriores deben descargarse de nuevo; la reproducibilidad depende de esa versión concreta.
- Madurez del proyecto: con 183 descargas y 1 like en el momento de la consulta, se trata de un checkpoint de nicho sin validación comunitaria extensa.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
