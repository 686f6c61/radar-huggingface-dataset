# 0x795E2795/Obsidian-Alpha-26B-A4B-it-qat-w4a16-ct

## Resumen

Obsidian Alpha 26B-A4B es un modelo de lenguaje experimental de tipo Mixture-of-Experts (MoE) disperso, publicado por el usuario 0x795E2795 como un ajuste fino del modelo base google/gemma-4-26B-A4B. Se distribuye como un checkpoint W4A16 entrenado con cuantizacion consciente del entrenamiento (QAT), con pesos en INT4/INT8 y activaciones en BF16. La cifra real de parametros reportada por los tensores safetensors es de 27.898.336.846 (aproximadamente 27,9 mil millones), aunque el autor lo describe comercialmente como "clase 26B".

El modelo declara 30 capas, 128 expertos con enrutamiento top-8 y unos 3,6 mil millones de parametros activos por token, lo que lo situa en la categoria de MoE disperso de coste de inferencia bajo: la computacion por token se aproxima a la de un modelo denso de ~4B, mientras que la memoria de pesos corresponde a un modelo de casi 28B. Su ventana de contexto configurada es de 262.144 tokens, con una ventana de atencion deslizante local de 1.024 tokens.

Es relevante ahora porque combina tres tendencias activas en IA open source: arquitecturas MoE dispersas, despliegue en precision reducida (W4A16) y entrenamiento consciente de cuantizacion en lugar de cuantizacion posterior al entrenamiento. El propio autor lo etiqueta como version alpha experimental, orientada a razonamiento, matematicas, codigo, inferencia local y experimentacion con modelos de bajos bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) disperso, transformer, 30 capas, 128 expertos, enrutamiento top-8 |
| Parametros totales | 27.898.336.846 (~27,9B segun safetensors; el autor indica "clase 26B") |
| Parametros activos | ~3,6B por token |
| Longitud de contexto | 262.144 tokens (ventana de atencion deslizante local de 1.024 tokens) |
| Tipos de cuantizacion | W4A16 con QAT: pesos INT4 e INT8, activaciones BF16, grupo simetrico de tamano 32, formato compressed-tensors |
| Idiomas soportados | 19: coreano, ingles, chino, japones, frances, aleman, espanol, italiano, ruso, arabe, hindi, portugues, vietnamita, tailandes, indonesio, neerlandes, danes, polaco y turco |
| Licencia | apache-2.0 (declarada en el repositorio; el modelo base es de Google, conviene verificar los terminos aplicables) |
| Formato de pesos | safetensors en formato compressed-tensors (W4A16); el autor menciona posibles releases GGUF distribuidas por separado |
| Tamano del repositorio | 17,7 GB |
| Estado de release | Alpha / experimental |
| Pipeline | text-generation (variante instruct, sufijo "-it") |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de Mixture-of-Experts disperso: 30 capas, 128 expertos y seleccion top-8 por token, con aproximadamente 3,6B de parametros activos sobre un total de ~27,9B. Incorpora una ventana de atencion deslizante local de 1.024 tokens dentro de una configuracion de contexto de 262.144 tokens, un patron habitual en modelos con contextos muy largos para acotar el coste de atencion. No se especifica en la informacion disponible si se trata de atencion completa combinada con ventanas locales, de atencion lineal ni el numero de cabezas de atencion o de KV heads.

El rasgo tecnologico mas destacado es el metodo de cuantizacion: no es una cuantizacion posterior al entrenamiento, sino QAT, es decir, la cuantizacion de 4 bits con grupo de tamano 32 se integra en el proceso de entrenamiento para que el modelo se adapte al comportamiento numerico de baja precision antes de su publicacion. El checkpoint deriva del modelo base google/gemma-4-26B-A4B mediante ajuste fino, y el sufijo "-it" junto con la etiqueta "conversational" indica una variante orientada a instrucciones, aunque la model card no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineamiento como RLHF o DPO: esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y matematicas: el autor situa explicitamente estos ambitos entre los objetivos del modelo.
- Generacion de codigo, tambien declarada como caso de uso principal en la model card.
- Tareas generales de lenguaje, incluyendo resumen, redaccion y comprension.
- Cobertura multilingue declarada en 19 idiomas, con coreano, ingles y chino listados en primer lugar, seguidos de japones, frances, aleman, espanol, italiano, ruso, arabe, hindi, portugues, vietnamita, tailandes, indonesio, neerlandes, danes, polaco y turco.
- Procesamiento de contextos largos de hasta 262.144 tokens configurados, con comportamiento en contextos muy largos marcado como experimental.
- Inferencia local en precision reducida: el checkpoint esta pensado para ejecucion en hardware de consumo cuando el backend soporta kernels INT4 nativos.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (thinking), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo declara capacidades de codigo y un coste de inferencia bajo derivado de sus ~3,6B de parametros activos, lo que permite integrarlo en asistentes de autocompletado o revision de parches sin el coste de un modelo denso de 28B.
- Analisis de repositorios y documentacion extensa: con 262.144 tokens de contexto configurado se pueden pasar ficheros completos, historiales de issues o documentacion tecnica larga en una sola llamada, siempre que el backend y la VRAM disponible lo permitan.
- Razonamiento matematico y resolucion de problemas paso a paso: el autor incluye matematicas entre los objetivos de diseno, adecuado para tutoria automatica o generacion de ejercicios resueltos.
- Atencion al cliente multilingue: con 19 idiomas declarados y formato conversacional, permite atender usuarios en espanol, aleman, arabe, hindi o tailandes con un unico modelo en lugar de varios especializados por idioma.
- Procesamiento por lotes de bajo coste: la combinacion de pesos INT4 y activaciones de solo ~3,6B por token reduce el coste por token frente a un denso equivalente, util para clasificacion, extraccion de entidades o resumen a gran escala.
- Investigacion en cuantizacion de bajos bits: al ser un checkpoint QAT W4A16 con formato compressed-tensors, sirve como banco de pruebas para comparar kernels INT4 nativos frente a rutas de dequantizacion en distintos motores de inferencia.
- Despliegue en entornos con GPU de consumo: el repositorio ocupa 17,7 GB, lo que permite cargar los pesos en GPUs de 24 GB como la RTX 3090 o la RTX 4090 para contextos moderados.
- Evaluacion comparativa de arquitecturas MoE dispersas: util para medir la relacion entre parametros activos (3,6B) y calidad en tareas de razonamiento frente a MoE de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MATH ni de ninguna otra evaluacion, y tampoco proporciona comparaciones con modelos de referencia. La unica indicacion metodologica es que, para evaluar el modelo, debe usarse la configuracion de muestreo exigida por cada benchmark en lugar de los ajustes recomendados para conversacion.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 14-18 GB segun el reparto real entre tensores INT4 e INT8; el repositorio completo ocupa 17,7 GB en safetensors.
- VRAM practica para inferencia: un minimo aproximado de 24 GB para contextos cortos, sumando pesos y buffers de activaciones BF16. Estas cifras son estimaciones derivadas del tamano de los pesos, no datos publicados por el autor.
- Memoria para contexto largo: la model card advierte explicitamente de que usar la longitud de contexto completa de 262.144 tokens puede requerir mucha mas memoria que la carga de pesos, y que depende de la precision del KV-cache, del backend y de la estrategia de offloading. El tamano exacto del KV-cache no esta disponible porque no se publican el numero de capas KV ni las cabezas de atencion.
- GPU de consumo: cabe en GPUs de 24 GB (RTX 3090, RTX 4090) para contextos moderados; GPUs de 32-48 GB (RTX 5090, A6000, L40S) ofrecen margen para contextos mas largos.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y similares para servicio concurrente o contextos muy largos; con 27,9B de parametros totales cabe en una sola GPU de 80 GB sin tensor parallelism, aunque la longitud de contexto efectiva dependera del KV-cache.
- Opciones de despliegue mencionadas por el autor: Hugging Face Transformers, vLLM, runtimes compatibles con compressed-tensors, motores de inferencia personalizados y runtimes GGUF convertidos (el autor indica que las versiones GGUF pueden distribuirse por separado).
- Latencia y throughput: no disponibles. Como referencia estructural, al activar ~3,6B de parametros por token el coste computacional por token se aproxima al de un modelo denso de ese tamano, mientras que el ancho de banda de memoria necesario para leer los pesos es mayor al estar los expertos dispersos en disco o VRAM.
- Advertencia de compatibilidad: cargar el checkpoint con exito no garantiza que el backend este ejecutando computo W4A16 nativo; algunos frameworks dequantizan los pesos o usan rutas de ejecucion alternativas, lo que cambia el rendimiento y puede cambiar las salidas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Obsidian Alpha 26B-A4B (este modelo) | 27,9B (safetensors) | ~3,6B | 262.144 tokens | apache-2.0 (declarada) | Hugging Face, safetensors W4A16 |
| google/gemma-4-26B-A4B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Qwen3-30B-A3B | 30,5B (dato publico de su model card) | 3,3B | 32.768 tokens nativo, ampliable a 131.072 | apache-2.0 | Hugging Face, GGUF, vLLM |
| Mixtral 8x7B | 46,7B (dato publico de su model card) | 12,9B | 32.768 tokens | apache-2.0 | Hugging Face, GGUF, vLLM |

Nota: las filas de Qwen3-30B-A3B y Mixtral 8x7B proceden de la documentacion publica de esos modelos, no de la informacion proporcionada en esta busqueda, y se incluyen unicamente como referencia de categoria. No hay datos de benchmarks de Obsidian Alpha que permitan una comparacion de calidad.

## Limitaciones y advertencias

- Estado alpha: el autor advierte de que el comportamiento, la compatibilidad, el formato, la configuracion y los pesos pueden cambiar en revisiones futuras. No es un checkpoint estable para produccion critica.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en razonamiento, matematicas o codigo frente a alternativas.
- Contexto largo experimental: los 262.144 tokens son la configuracion maxima, pero la model card indica que el comportamiento en contextos muy largos sigue siendo experimental y depende del backend, la precision del KV-cache y la memoria disponible.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni tasas de alucinacion; al ser un modelo de 3,6B de parametros activos, la capacidad de recuperacion factual es limitada en comparacion con modelos densos mayores.
- Sesgos: no se documenta ningun analisis de sesgos ni la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, idioma o cultura.
- Cobertura idiomatica desigual: aunque se declaran 19 idiomas, no se especifica el volumen de datos por idioma; el rendimiento en idiomas como danes, polaco o tailandes puede ser notablemente inferior al de ingles o coreano.
- Compatibilidad de kernels: el soporte de compressed-tensors W4A16 depende de la version del backend; algunos motores cargan el checkpoint pero dequantizan los pesos, de modo que las salidas pueden no coincidir entre motores.
- Licencia: el repositorio declara apache-2.0, pero el modelo base es google/gemma-4-26B-A4B, sujeto presumiblemente a los terminos de Google. Antes de un uso comercial conviene verificar la compatibilidad de ambas licencias, ya que una licencia Apache declarada por el autor del fine-tuning no elimina necesariamente las obligaciones derivadas del modelo base.
- Inconsistencia en la configuracion de muestreo: el texto recomienda temperature 1.0 mientras que el ejemplo de codigo usa 1.225. Conviene fijar un valor y validarlo con datos propios.
- Sin informacion sobre alineamiento: no se detalla si hubo RLHF, DPO u otro proceso de alineamiento, ni si existen filtros de seguridad.
- Parametros totales ambiguos: el autor indica "clase 26B" mientras que safetensors reporta 27.898.336.846 parametros; la diferencia depende de si se cuentan embeddings, tensores auxiliares y componentes de enrutamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0x795E2795/Obsidian-Alpha-26B-A4B-it-qat-w4a16-ct
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Busqueda web: los resultados devueltos corresponden a paginas de seguimiento de paquetes (USPS, UPS, DHL, 17TRACK) y no guardan relacion con este modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
