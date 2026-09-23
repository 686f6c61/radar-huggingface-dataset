# alexz949/BasisServe-CALS

## Resumen

BasisServe-CALS es una colección de checkpoints de investigación publicada por el usuario alexz949 en Hugging Face, asociada al repositorio de código abierto del mismo nombre. No es un modelo de lenguaje en el sentido habitual: no contiene pesos completos ni se puede cargar con `AutoModelForCausalLM.from_pretrained()`. Lo que distribuye son factores de compresión de bajo rango (low-rank) para las proyecciones Value de la atención, la comunicación tensor-parallel y las proyecciones `down_proj` de la MLP de varios modelos base conocidos: Llama-3.1-8B, Llama-3.1-70B, Qwen3-8B-Base, Qwen3-32B y DeepSeek-V2-Lite.

El interés técnico de la colección está en que publica tanto una línea base PaLU (con asignación de rango uniforme y basada en Fisher) como los checkpoints de los métodos propios C1, conscientes del coste de comunicación en despliegues con tensor parallelism. Los artefactos se acompañan de manifiestos con revisiones exactas del modelo base y hashes de configuración, lo que permite reproducir las condiciones de evaluación. El tamaño del repositorio es de 471,6 GB, coherente con almacenar factores BF16 por capa para cinco familias de modelos.

La relevancia actual es de nicho pero clara: la compresión de la caché KV y la reducción del tráfico de AllGather en inferencia multi-GPU son dos de los cuellos de botella dominantes al servir modelos de 8B a 70B con contexto largo. Los números publicados en la propia model card (por ejemplo, 25% de reducción total de caché KV con los checkpoints V64 de Qwen3, o 50% de reducción de comunicación en la salida de atención de DeepSeek-V2-Lite con rank 128 medio) son medibles y acotados, aunque la validación externa es nula por ahora: el repositorio acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo completo. Son factores de compresión de bajo rango aplicables a las proyecciones Value de la atención, a la salida de atención en tensor parallelism y a `down_proj` de la MLP de transformadores densos (Llama-3.1, Qwen3) y de un modelo con MLA (DeepSeek-V2-Lite) |
| Parámetros totales | No aplica a los factores. Los modelos base cubiertos van de 8B a 70B: Llama-3.1-8B, Llama-3.1-70B, Qwen3-8B-Base, Qwen3-32B y DeepSeek-V2-Lite |
| Parámetros activos | No disponible en la información proporcionada (DeepSeek-V2-Lite emplea MLA según la model card, pero no se detallan cifras de parámetros activos) |
| Longitud de contexto | No especificada. La calibración de los checkpoints C1 de Qwen3 usa 256 documentos de C4 para ajuste y 64 retenidos, con las 2048 posiciones de token contribuyendo mediante estadísticos suficientes en streaming |
| Tipos de cuantización | No se publican variantes cuantizadas. Los factores se distribuyen en BF16 Safetensors |
| Idiomas soportados | No disponible (los hereda del modelo base correspondiente) |
| Licencia | No disponible. El texto de la model card está truncado en la indicación de que el uso de cada checkpoint queda sujeto a la licencia del modelo base |
| Formato de pesos | Safetensors BF16 acompañados de `manifest.json` o `result.json`. Los directorios no son directamente cargables con `AutoModelForCausalLM.from_pretrained()` |

Contenido de la release:

| Familia | Modelo base | Variantes publicadas | Objeto comprimido |
|---|---|---|---|
| PaLU | Llama-3.1-8B | V25 uniform, V25 Fisher | Proyección/caché Value; Key permanece densa |
| PaLU | Llama-3.1-70B | V25 uniform, V25 Fisher | Proyección/caché Value; Key permanece densa |
| PaLU | Qwen3-8B-Base | V25 uniform, V25 Fisher, V64 Fisher | Proyección/caché Value; Key permanece densa |
| PaLU | Qwen3-32B | V25 uniform, V25 Fisher, V64 Fisher | Proyección/caché Value; Key permanece densa |
| Attention C1 | Qwen3-8B-Base | uniform V64 ALS5, per-layer Global-KL avg64 ALS5 | Caché Value y comunicación TP de la salida de atención |
| Attention C1 | Qwen3-32B | uniform V64 ALS5, per-layer Global-KL avg64 ALS5 | Caché Value y comunicación TP de la salida de atención |
| Attention-output C1 | DeepSeek-V2-Lite | per-layer Global-KL avg128 ALS5 | AllGather denso de la salida de atención; el KV latente MLA no se modifica |
| KQ-SVD | Qwen3-8B-Base | post-RoPE K/Q rank64 | Caché Key; pensado para emparejarse con Qwen3-8B C1 V64 |
| MLP C1 | Qwen3-8B-Base | per-layer Global-KL mean-DP avg2560 | Comunicación de `down_proj` en row-parallel |

## Arquitectura y entrenamiento

La colección agrupa cuatro líneas de trabajo. PaLU comprime la proyección y la caché Value mediante blanqueado (whitening) y asignación de rango basada en Fisher; la clave queda densa, de modo que `V25` (reducción del 25% del ancho Value, típicamente rango 96 sobre una dimensión física de cabeza de 128) implica un 12,5% de reducción total de la caché KV, y `V64` (rango Value medio de 64) implica aproximadamente un 50% de reducción Value y un 25% de reducción total de caché KV. Los checkpoints Attention C1 de Qwen3 mantienen la Key densa, ajustan conjuntamente todas las fuentes Value físicas y el decodificador de salida completo, y cierran el decodificador después de cada barrido ALS. El pipeline asociado incluye recolección de covarianzas de C4 en streaming, perfilado Global-KL de logits terminales y programación dinámica con presupuesto exacto, según se describe en el repositorio de código.

La variante para DeepSeek-V2-Lite no comprime la caché KV latente de MLA ni la altera: comprime únicamente el AllGather de tensor-parallel posterior a la atención, con un rango fuente medio de 128, lo que corresponde a un 50% de reducción de comunicación frente al AllGather denso. El checkpoint MLP C1 de Qwen3-8B usa un rango medio de 2560 con una reducción teórica del 37,5% de comunicación para la salida row-parallel de la MLP; se exporta el esquema `mean_dp` seleccionado de forma independiente y se omite deliberadamente la copia de factores UCB no utilizada. La release KQ-SVD contiene solo los factores de despliegue y su manifiesto de resultados (se omite un artefacto de gramianas/estadísticos post-RoPE de 144 MiB) y aplica una SVD sobre K y Q en espacio post-RoPE con rango 64. No se documentan en la información disponible fases de RLHF, DPO ni un entrenamiento generativo propio: se trata de ajustes de compresión sobre pesos ya entrenados.

## Capacidades

- Compresión de caché KV en las proyecciones Value: 12,5% de reducción total con los checkpoints V25 y aproximadamente 25% con los V64, manteniendo la Key densa.
- Compresión de la caché Key mediante KQ-SVD post-RoPE a rango 64, que retiene el 50% del ancho KV denso completo cuando se empareja con Qwen3-8B C1 V64.
- Reducción de comunicación tensor-parallel: 50% en el AllGather de salida de atención de DeepSeek-V2-Lite con rango medio 128 y 37,5% teórico en la salida row-parallel de la MLP de Qwen3-8B con rango medio 2560.
- Ajuste conjunto de todas las fuentes Value físicas y del decodificador de salida completo en los checkpoints Attention C1 de Qwen3, con cierre del decodificador tras cada barrido ALS.
- Dos políticas de asignación de rango comparables entre sí: uniforme y Global-KL por capa, lo que permite estudiar el reparto de presupuesto de rango.
- Trazabilidad: cada manifiesto registra la revisión exacta del modelo base y hashes de configuración; se incluyen diagnósticos por capa y manifiestos autenticados de resultados.
- No incorpora capacidades generativas propias: generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes y multilingüismo dependen exclusivamente del modelo base sobre el que se instalen los factores.

## Casos de uso

- Servicio de Qwen3-32B con contexto largo en clústeres con memoria limitada: los factores V64 reducen aproximadamente un 25% el ancho total de la caché KV, lo que permite alojar más secuencias concurrentes o ampliar la longitud efectiva sin cambiar el modelo base.
- Optimización de inferencia tensor-parallel: los checkpoints C1 rebajan el volumen del AllGather de salida de atención en un 50% en DeepSeek-V2-Lite, un escenario típico de despliegue multi-GPU donde la comunicación entre nodos domina el tiempo por token.
- Reducción de tráfico en la MLP row-parallel: el checkpoint MLP C1 de Qwen3-8B ofrece un 37,5% teórico de reducción de comunicación en `down_proj`, útil para clústeres con interconnect limitado (por ejemplo, Ethernet de 100 GbE frente a InfiniBand).
- Investigación reproducible en compresión de bajo rango: la publicación conjunta de la línea base PaLU y de los métodos C1, con manifiestos y hashes de revisión, permite reproducir comparaciones controladas entre asignación uniforme y asignación Global-KL.
- Estudio del compromiso precisión/comunicación: el par de checkpoints KQ-SVD rank64 y C1 V64 con Key densa (12,18063 frente a 8,42927 de perplejidad en WikiText-2) sirve como caso de análisis cuantitativo de cuánta calidad se cede por reducir la caché Key.
- Evaluación de métodos de compresión en modelos con MLA: el checkpoint de DeepSeek-V2-Lite permite medir el efecto de comprimir únicamente la comunicación de salida de atención dejando el KV latente intacto, con una perplejidad de WikiText-2 de 6,69518 frente a 6,65635 del control uniforme.
- Despliegue de Llama-3.1-70B en GPUs con memoria ajustada: los factores PaLU V25 reducen el ancho Value un 25% sin tocar la Key, lo que alivia la presión de memoria de la caché KV en servicios de chat multi-turno de larga duración.
- Generación de artefactos para pipelines internos de CI: los manifiestos con revisión del modelo base y hashes permiten validar automáticamente que un checkpoint de factores corresponde a la revisión esperada antes de desplegarlo.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son perplejidades de WikiText-2 para dos de los checkpoints. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible.

| Checkpoint | Modelo base | Perplejidad WikiText-2 | Referencia de comparación | Perplejidad de la referencia |
|---|---|---|---|---|
| Attention-output C1 per-layer Global-KL avg128 ALS5 | DeepSeek-V2-Lite | 6,69518 | Control C1 uniforme rango 128 | 6,65635 |
| C1 V64 con KQ-SVD rank64 | Qwen3-8B | 12,18063 | C1 V64 con Key densa | 8,42927 |

El checkpoint C1 de DeepSeek-V2-Lite se sitúa un 0,58% por encima del control uniforme en perplejidad, mientras que la combinación C1 V64 más KQ-SVD rank64 empeora un 44,5% respecto al mismo checkpoint C1 V64 con Key densa. Para el resto de variantes (PaLU V25/V64 sobre Llama-3.1 y Qwen3, Attention C1 de Qwen3-32B y MLP C1) no se proporcionan valores numéricos en la información disponible.

## Requisitos de hardware

- Espacio en disco: el repositorio ocupa 471,6 GB, cantidad que hay que sumar al almacenamiento de los modelos base correspondientes.
- VRAM estimada de los modelos base (cálculo derivado del recuento de parámetros, no publicado por el autor): Llama-3.1-8B y Qwen3-8B-Base en BF16 alrededor de 16 GB; Qwen3-32B en BF16 alrededor de 64 GB; Llama-3.1-70B en BF16 alrededor de 140 GB. En cuantización de 4 bits, las cifras bajarían aproximadamente a 5 GB, 18-20 GB y 35-40 GB respectivamente.
- GPUs recomendadas: los modelos de 8B caben en RTX 4090 (24 GB) en BF16 con margen justo y en 4 bits con holgura; Qwen3-32B requiere A100 40/80 GB, H100 o dos GPUs de 24-48 GB; Llama-3.1-70B requiere A100 80 GB, H100 o configuraciones multi-GPU. Para los experimentos de tensor parallelism descritos (Qwen3 y DeepSeek) es necesario al menos un nodo multi-GPU.
- Cabe en GPU de consumo: sí para las variantes de 8B (RTX 4090, RTX 3090, y GPUs de 16 GB solo en cuantización de 4 bits). Las variantes de 32B y 70B no caben en una GPU de consumo única sin cuantización agresiva.
- Opciones de despliegue: los runtimes documentados son los específicos de Qwen3 y DeepSeek con tensor parallelism incluidos en el repositorio BasisServe-CALS. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, y los directorios no son cargables mediante `AutoModelForCausalLM.from_pretrained()`.
- Latencia y throughput: no disponible. El autor declara reducciones de comunicación (50% en la salida de atención de DeepSeek-V2-Lite y 37,5% teórico en la MLP de Qwen3-8B), pero no se publican medidas de latencia ni de tokens por segundo en la información disponible.

## Comparativa con modelos similares

Esta publicación no es un modelo, por lo que la comparación pertinente es entre las variantes de compresión que incluye y frente al modelo base sin comprimir. No se han publicado comparaciones con otras herramientas o publicaciones de compresión de caché KV en la información disponible.

| Variante | Modelo base | Objeto comprimido | Reducción declarada | Perplejidad WikiText-2 |
|---|---|---|---|---|
| PaLU V25 / V25 Fisher | Llama-3.1-8B, Llama-3.1-70B, Qwen3-8B-Base, Qwen3-32B | Value (proyección y caché); Key densa | 12,5% de caché KV total | No disponible |
| PaLU V64 Fisher | Qwen3-8B-Base, Qwen3-32B | Value (proyección y caché); Key densa | ~25% de caché KV total | No disponible |
| Attention C1 V64 ALS5 | Qwen3-8B-Base, Qwen3-32B | Caché Value y comunicación TP de salida | ~25% de caché KV total | 8,42927 (Qwen3-8B, Key densa) |
| Attention-output C1 avg128 ALS5 | DeepSeek-V2-Lite | AllGather de salida de atención; MLA intacto | 50% de comunicación | 6,69518 |
| KQ-SVD rank64 | Qwen3-8B-Base | Caché Key post-RoPE | 50% del ancho KV denso al emparejar con C1 V64 | 12,18063 |
| MLP C1 mean-DP avg2560 | Qwen3-8B-Base | `down_proj` row-parallel | 37,5% teórico de comunicación | No disponible |
| Modelo base sin comprimir | Los cinco modelos citados | Ninguno | 0% | 8,42927 (referencia C1 V64 con Key densa) |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base en la revisión exacta indicada en el manifiesto, los factores no son utilizables. Las rutas absolutas de los manifiestos apuntan al entorno original de generación y deben sustituirse por los campos de repositorio y revisión de Hugging Face adyacentes.
- Licencia no disponible y texto de model card truncado. El uso comercial queda condicionado por las licencias de los modelos base (Llama-3.1, Qwen3 y DeepSeek-V2-Lite), que el autor no reproduce en la información proporcionada. Verificar antes de cualquier despliegue en producción.
- Degradación de calidad medible en al menos una configuración: la combinación de KQ-SVD rank64 con C1 V64 eleva la perplejidad de WikiText-2 de 8,42927 a 12,18063, un 44,5% peor. La compresión de la caché Key no es gratuita.
- Cobertura de evaluación muy estrecha: solo se publican perplejidades de WikiText-2 para dos checkpoints. No hay MMLU, HumanEval, GSM8K, ni evaluaciones de razonamiento, código, matemáticas o multilingüismo, por lo que no puede caracterizarse el impacto en tareas downstream.
- El checkpoint de DeepSeek-V2-Lite no reduce la caché KV en absoluto: solo comprime la comunicación del AllGather de salida de atención. La ganancia en memoria es nula en ese caso.
- La reducción del 37,5% en MLP C1 y la del 25% de caché KV en V64 son cifras derivadas del presupuesto de rango, no medidas de extremo a extremo en producción; dependen del grado de solapamiento real de la comunicación en el runtime.
- Sesgos: no evaluados ni documentados. Al ser factores de compresión, los sesgos del modelo base se mantienen y podrían amplificarse o desplazarse de forma no medida.
- Riesgo de alucinación: no medido. La perplejidad es un indicador indirecto; un aumento de perplejidad no cuantifica por sí solo el incremento de alucinación en generación abierta.
- Idiomas soportados: no disponibles. La calibración usa documentos de C4 en inglés, lo que puede sesgar el ajuste hacia ese idioma con independencia de las capacidades multilingües del modelo base.
- Sin validación externa: 0 descargas y 0 likes en el repositorio, y la propia model card indica que se trata de un repositorio privado de checkpoints de investigación. No hay evidencia independiente de que los factores funcionen fuera del pipeline del autor.
- Requisitos de almacenamiento elevados (471,6 GB) y ausencia de variantes cuantizadas o formatos ligeros, lo que dificulta su uso en entornos con disco limitado.
- Ausencia de integración con los runtimes de inferencia más habituales (vLLM, TGI, llama.cpp, Ollama); el despliegue depende de los runtimes propios del repositorio de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexz949/BasisServe-CALS
- Repositorio de código BasisServe-CALS: https://github.com/alexz949/BasisServe-CALS
- Commit de preparación de la release: https://github.com/alexz949/BasisServe-CALS/commit/e9252e74431ffa91bcd1d2966287db6455bf1a57
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base Llama-3.1-70B: https://huggingface.co/meta-llama/Llama-3.1-70B
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Modelo base DeepSeek-V2-Lite: https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite
