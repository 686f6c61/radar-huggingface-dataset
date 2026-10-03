# Rajeshwari-Chanda/bloom-560m_sparsegpt_0.5

## Resumen

El modelo `Rajeshwari-Chanda/bloom-560m_sparsegpt_0.5` es una versión podada de BLOOM-560m, el miembro más pequeño de la familia BLOOM desarrollada por BigScience. Sobre el checkpoint original se ha aplicado SparseGPT, un método de poda *one-shot* que elimina pesos sin necesidad de reentrenamiento, y el sufijo `0.5` indica un ratio de poda del 50 %. El resultado es un modelo de 559.214.592 parámetros (559 M) orientado a generación de texto, con la misma arquitectura transformer decoder-only del modelo base.

La relevancia de esta publicación es fundamentalmente experimental: sirve como artefacto de investigación sobre poda de modelos multilingües pequeños y sobre la viabilidad de comprimir checkpoints de la familia BLOOM. No se trata de un modelo afinado para una tarea concreta ni de un lanzamiento oficial de BigScience, sino de un experimento alojado en Hugging Face con 0 descargas y 0 *likes* en el momento de redactar esta ficha, y con una model card autogenerada que no documenta el proceso de poda ni sus hiperparámetros.

El repositorio ocupa 2,3 GB, un tamaño coherente con 559 M de parámetros almacenados en fp32 de forma densa. Esto implica que la poda no se traduce en una reducción del espacio en disco ni de la memoria necesaria para cargar el modelo: los pesos podados se almacenan como ceros dentro de tensores de forma completa, por lo que el beneficio solo se materializa si el *runtime* de inferencia explota explícitamente el patrón de dispersión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM) con poda no estructurada al 50 % mediante SparseGPT |
| Parámetros totales | 559.214.592 (559 M), según los safetensors del repositorio |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2048 tokens (heredada del modelo base BLOOM-560m) |
| Tipos de cuantización | El repositorio publica pesos en fp32; no se declaran variantes cuantizadas. Compatible con cuantización posterior vía bitsandbytes, GPTQ o conversión a GGUF |
| Idiomas soportados | No declarados en el repositorio. El modelo base BLOOM se entrenó con 46 lenguajes naturales y 13 lenguajes de programación mediante un tokenizador BPE multilingüe |
| Licencia | No disponible en el repositorio. El modelo base BLOOM se distribuye bajo BigScience BLOOM RAIL 1.0 |
| Formato de pesos | safetensors (fp32, almacenamiento denso) |
| Dispersión (*sparsity*) | 50 % no estructurada, aplicada con SparseGPT según el nombre del modelo |
| Librería | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM-560m: un transformer decoder-only con 24 capas, dimensión oculta 1024, 16 cabezas de atención, embeddings posicionales ALiBi (en lugar de posiciones aprendidas) y un tokenizador BPE multilingüe con un vocabulario del orden de 250.000 tokens. El modelo fue entrenado por BigScience sobre el corpus ROOTS, un conjunto multilingüe de aproximadamente 1,6 TB de texto en 46 lenguajes naturales, siguiendo la misma receta que el resto de la familia BLOOM (aproximadamente 366.000 millones de tokens vistos durante el entrenamiento, con ajuste por RLHF en las variantes mayores).

Sobre ese checkpoint se aplicó SparseGPT, el método presentado por Frantar y Alistarh (2023), que formula la poda como un problema de reconstrucción de mínimos cuadrados resuelto capa por capa mediante la inversa de la matriz de Hessiana aproximada con las activaciones de calibración. La poda es *one-shot*: no hay reentrenamiento posterior ni ajuste fino tras eliminar el 50 % de los pesos. Los resultados originales de SparseGPT se reportaron sobre todo en modelos de 7 B a 175 B parámetros, donde el 50 % de dispersión no estructurada apenas degrada la perplejidad; no hay ninguna evidencia publicada en este repositorio de que ese comportamiento se mantenga en un modelo de 559 M parámetros, y tampoco se documentan en la model card el conjunto de calibración, el número de muestras ni si se aplicó poda estructurada 2:4 o no estructurada.

Un detalle técnico relevante para quien vaya a desplegar el modelo: al tratarse de dispersión no estructurada, los *kernels* densos convencionales (cuBLAS, FlashAttention, la mayoría de los servidores de inferencia) no obtienen ninguna aceleración, ya que multiplican igualmente por los ceros. El ahorro real solo aparece con *hardware* o librerías que exploten dispersión (por ejemplo, sparse tensor cores de las arquitecturas Ampere y posteriores con patrones 2:4, o kernels específicos para CSR/block-sparse).

## Capacidades

- Generación de texto autorregresiva en modo completado y conversación, con el estilo y las limitaciones típicas de un modelo de 559 M parámetros.
- Multilingüismo heredado de BLOOM: el tokenizador y los datos de entrenamiento cubren 46 lenguajes naturales, aunque el rendimiento en lenguajes con pocos recursos es limitado.
- Generación de código básico, gracias a la presencia de 13 lenguajes de programación en el corpus ROOTS, sin garantías de corrección sintáctica o semántica.
- Continuación de texto y *prompt completion*, la tarea para la que está etiquetado en el Hub (`text-generation`).
- Inferencia sobre CPU y GPU de gama baja, dado su tamaño reducido.
- No hay evidencia en la información disponible de soporte de *tool calling*, *function calling*, razonamiento multi-paso, modo *thinking*, visión, audio ni capacidades de agente. Estas funciones no se mencionan en la model card ni en los metadatos del repositorio.
- No se documentan capacidades específicas de instrucción (*instruction following*); al derivar de un modelo base y no de un modelo ajustado con instrucciones, el comportamiento esperado es el de un modelo de continuación de texto.

## Casos de uso

- Investigación sobre poda de redes neuronales: el modelo sirve como punto de comparación directo frente a BLOOM-560m sin podar, para medir la degradación de perplejidad y de calidad de generación a un 50 % de dispersión en modelos pequeños.
- Experimentos de compresión extrema en entornos académicos: permite estudiar si técnicas de destilación o ajuste fino posterior recuperan la calidad perdida tras la poda, con un coste de cómputo bajo.
- *Benchmarking* de *runtimes* con soporte de dispersión: útil para validar si kernels sparse-aware (2:4, CSR) ofrecen ganancias reales de latencia frente a la ejecución densa equivalente.
- Generación de texto en aplicaciones de baja exigencia y sin fines comerciales: completado de frases, prototipos de chatbots o generación de texto de relleno en entornos de desarrollo donde la calidad no es crítica y el despliegue debe caber en hardware modesto.
- Docencia y material didáctico sobre modelos de lenguaje: su tamaño permite ejecutarlo en un portátil y examinar pesos, activaciones y patrones de dispersión con herramientas estándar de transformers.
- Pruebas de integración de *pipelines* de Hugging Face, TGI o vLLM en un entorno de CI, usando un modelo de 559 M como sustituto ligero de modelos mayores para validar la infraestructura antes de escalar.
- Investigación sobre sesgos multilingües en modelos pequeños podados: comparar si la poda afecta de forma desigual a distintos idiomas del corpus ROOTS.

Ninguno de estos casos está respaldado por evaluaciones publicadas del modelo; son aplicaciones plausibles derivadas de su tamaño, su arquitectura y su naturaleza experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio es una plantilla autogenerada por Hugging Face en la que todos los apartados de evaluación figuran como `[More Information Needed]`. Tampoco se proporcionan métricas de perplejidad en wikitext, MMLU, HumanEval, GSM8K ni comparaciones con el modelo base sin podar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB en fp32 (coincide con el tamaño del repositorio), en torno a 1,1 GB en fp16/bf16, unos 0,6 GB en int8 y del orden de 0,3-0,4 GB en cuantización de 4 bits, más el *overhead* del *runtime* y de la caché KV.
- La caché KV para el contexto máximo es pequeña: 24 capas × 2 (claves y valores) × 16 cabezas × 64 dimensiones por cabeza × 2048 tokens, del orden de decenas de MB en fp16.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1660, e incluso iGPU con memoria compartida suficiente. También se puede ejecutar íntegramente en CPU.
- GPU recomendadas para producción: no requiere GPU de centro de datos. Una T4, L4 o A10 es más que suficiente; A100 o H100 resultan desproporcionadas salvo para *batching* masivo.
- Opciones de despliegue: `transformers` con PyTorch, Text Generation Inference (TGI), vLLM (soporta arquitectura BLOOM) y llama.cpp u Ollama previa conversión a GGUF. Para aprovechar la dispersión haría falta un *runtime* con kernels sparse-aware, del que no se documenta compatibilidad.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia cualitativa, la dispersión no estructurada no reduce el tiempo de inferencia en *hardware* denso convencional, por lo que el rendimiento esperado es aproximadamente el de BLOOM-560m en fp32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bloom-560m_sparsegpt_0.5 | 559 M | 2048 | No disponible en el repositorio (base BLOOM: RAIL 1.0) | Hugging Face, 0 descargas | Podado al 50 % con SparseGPT; sin benchmarks publicados |
| BLOOM-560m | 559 M | 2048 | BigScience BLOOM RAIL 1.0 | Hugging Face, ampliamente usado | Modelo base sin podar; referencia natural para medir el efecto de la poda |
| BLOOM-1b1 | 1.100 M | 2048 | BigScience BLOOM RAIL 1.0 | Hugging Face | Mismo tokenizador y familia; mayor capacidad a costa del doble de parámetros |
| Qwen2.5-0.5B | aprox. 490 M | 32.768 | Apache 2.0 | Hugging Face | Alternativa moderna de tamaño comparable, contexto muy superior y licencia permisiva; monolingüe dominante en chino e inglés |

Los datos de los modelos comparativos proceden de su documentación pública y pueden variar respecto a las versiones concretas publicadas; conviene verificarlos antes de tomar decisiones de producción.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada: no documenta datos de entrenamiento, hiperparámetros de poda, conjunto de calibración ni evaluación. No hay información verificable sobre el proceso.
- No hay benchmarks ni métricas de perplejidad publicadas para este checkpoint, por lo que se desconoce cuánta calidad se ha perdido respecto a BLOOM-560m. La poda al 50 % sin reentrenamiento degrada más a los modelos pequeños que a los grandes, donde SparseGPT fue validado.
- El repositorio no declara licencia. Aunque el modelo base BLOOM está sujeto a BigScience BLOOM RAIL 1.0, que impone restricciones de uso basadas en casos (por ejemplo, usos médicos o de vigilancia), la ausencia de una licencia explícita en este derivado genera incertidumbre jurídica para cualquier uso comercial. Conviene contactar con la autora antes de desplegarlo.
- Riesgo elevado de alucinación y de incoherencia en generaciones largas: es un modelo base de 559 M parámetros, sin ajuste por instrucciones ni por preferencias humanas.
- Ventana de contexto de 2048 tokens, insuficiente para tareas de documento largo, RAG con muchos fragmentos o conversaciones multi-turno extensas.
- Sesgos conocidos del corpus ROOTS, que está sobrerrepresentado en inglés y en contenidos web occidentales; el rendimiento en lenguajes con pocos recursos es notablemente inferior.
- La dispersión no estructurada no se traduce en ahorro de memoria en disco ni en VRAM cuando los pesos se almacenan de forma densa en fp32, como es el caso. Cualquier estimación de ahorro de recursos basada únicamente en el 50 % de poda sería incorrecta.
- Ausencia total de validación comunitaria: 0 descargas y 0 *likes* en el momento de redactar la ficha. No hay informes independientes de funcionamiento en producción.
- No se documenta soporte de *tool calling*, agentes ni modos de razonamiento; asumir esas capacidades sería un error de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_sparsegpt_0.5
- Modelo base BLOOM-560m: https://huggingface.co/bigscience/bloom-560m
- Paper de SparseGPT (Frantar y Alistarh, 2023): https://arxiv.org/abs/2301.00774
- Repositorio de SparseGPT: https://github.com/IST-DASLab/sparsegpt
- Paper de BLOOM (Scao et al., 2022): https://arxiv.org/abs/2211.05100
- Organización BigScience: https://huggingface.co/bigscience
- Referencia sobre emisiones de carbono citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo (los resultados recibidos correspondían a la aplicación Mensajes de Apple y no guardan relación con el contenido solicitado).
