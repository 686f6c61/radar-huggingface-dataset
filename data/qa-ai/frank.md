# QA-AI/frank

## Resumen

Frank es un modelo de lenguaje de 1.988.497.968 parametros (~1,99B) desarrollado por el equipo independiente QA-AI y publicado en Hugging Face bajo licencia MIT. Se trata de un transformer decoder-only de 24 capas, 1536 dimensiones ocultas y 12 cabezas de atencion (MHA), entrenado desde cero por un coste declarado de unos 92 dolares sobre una unica GPU NVIDIA A100 de 40 GB. Su propuesta no es competir en calidad de generacion, sino demostrar un concepto: que es posible incorporar capacidad epistemica (una nocion interna y calibrada de cuanto sabe el modelo sobre cada token) directamente en la arquitectura.

El modelo se basa libremente en nanochat de Andrej Karpathy (enero de 2025) e introduce dos elementos poco habituales: una tabla de embeddings de valor anadida en las capas impares (~604M parametros) y un segundo espacio de embeddings epistemicos con 12 tablas de 32.768 x 1536 mas 12 escalares (otros ~604M parametros). Este espacio registra como de bien aprendido esta cada token del vocabulario y permite al modelo modular su confianza de forma fundamentada en lugar de depender solo del ruido de muestreo.

Es relevante ahora por tres motivos: primero, es un experimento reproducible de entrenamiento completo por menos de 100 dolares; segundo, propone una via concreta para la calibracion de confianza y la deteccion de incertidumbre; y tercero, su publicacion es reciente (16 de septiembre de 2026). Como contrapartida, el checkpoint no es cargable con transformers sin adaptacion, no se ha publicado todavia el harness de inferencia y no hay resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 24 capas, 1536 hidden, 12 cabezas de atencion (MHA), RoPE, RMSNorm pre-norm sin parametros, normalizacion QK, activaciones ReLU al cuadrado, logit softcapping (cap 20), sin terminos de bias, atencion de ventana deslizante |
| Parametros totales | 1.988.497.968 (~1,99B): ~1,38B entrenables estandar, ~604M en embeddings de valor, ~604M en tabla de embeddings epistemicos |
| Parametros activos | No aplica (no es MoE; todos los parametros participan en cada pasada) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible. El unico checkpoint publicado esta en bfloat16; no se han publicado cuantizaciones GGUF, GPTQ, AWQ ni similares |
| Idiomas soportados | Ingles (vocabulario BPE de 32.768 tokens, centrado en ingles) |
| Licencia | MIT (pesos y harness de inferencia) |
| Formato de pesos | safetensors (dump 1:1 del checkpoint de entrenamiento, 174 tensores en bfloat16, ~3,98 GB); tokenizer en formato HF `tokenizers` |

## Arquitectura y entrenamiento

Frank es un transformer decoder-only con componentes semi-modernos: Rotary Position Embeddings, RMSNorm pre-norm sin parametros, normalizacion QK, activaciones ReLU al cuadrado, softcapping de logits con cap de 20 y ausencia total de bias. La innovacion estructural mas visible es la atencion de ventana deslizante: la mayoria de capas atienden solo a una ventana local de tokens, la ventana crece a lo largo de la red y unicamente la capa final atiende al contexto completo de 1024 tokens. Esto mantiene el coste de atencion bajo para su escala. Adicionalmente, en las capas impares se suman embeddings de valor (12 tablas de 32.768 x 1536, ~604M parametros) que aumentan la capacidad de almacenamiento de informacion con un coste computacional casi nulo, y hay una compuerta `ve_gate` de 12 x 32 por capa impar.

El segundo pilar es el espacio de embeddings epistemicos: 12 tablas de 32.768 x 1536 mas 12 escalares de 32.768, que registran para cada token del vocabulario el grado de interiorizacion por parte del modelo. La model card indica que esta tabla se congela en inferencia y no se actualiza durante el chat. El autor propone tres usos: mostrar al usuario la fiabilidad esperada de la salida (en su interfaz web coloreaban los tokens segun su valor epistemico), filtrar candidatos en el muestreo (de los top-10 tokens, descartar los que superan cierto umbral epistemico y aplicar temperatura sobre los residuales) y calibrar la confianza expresada.

El entrenamiento base se hizo desde cero en ClimbMix-400B con aproximadamente 6,9B tokens en bfloat16 sobre una A100 de 40 GB, con un coste total declarado de unos 92 dolares. El optimizador combina Muon para matrices de pesos y AdamW para embeddings y el resto. El checkpoint publicado corresponde al paso 300 de un ajuste supervisado (SFT) sobre una mezcla de conversaciones sinteticas de identidad, MMLU (auxiliary_train) y GSM8K (main), con 1.044.480 tokens por iteracion. La model card proporcionada esta truncada en la seccion de hiperparametros, por lo que no se dispone del resto de valores de entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, con plantilla de chat que incluye rol de sistema, usuario y asistente.
- Razonamiento basico y resolucion de problemas aritmeticos de nivel escolar, inducidos por el SFT sobre GSM8K.
- Conocimiento general enciclopedico limitado, inducido por el SFT sobre el split auxiliary_train de MMLU.
- Estimacion de confianza epistemica por token: el modelo mantiene una senal interna de cuanto conoce cada unidad del vocabulario y puede exponerla como lectura de confianza.
- Muestreo filtrado por epistemica: es posible restringir el muestreo a tokens con valores epistemicos por debajo de un umbral, lo que en la practica reduce respuestas sobre dominios poco aprendidos.
- Mantenimiento de identidad conversacional coherente gracias al SFT con conversaciones sinteticas de identidad.
- Capacidades no confirmadas: no se documenta soporte de tool calling o function calling, ni de agentes, ni de razonamiento multi-paso explicito, ni modos de pensamiento (thinking), ni vision, ni audio.
- Capacidades multilingues: no disponibles; el modelo es exclusivamente en ingles.

## Casos de uso

- Investigacion sobre calibracion de confianza: Frank es un banco de pruebas reproducible para estudiar si una senal epistemica interna correlaciona con la exactitud real de las respuestas y como usarla para decidir cuando abstenerse.
- Deteccion de dominios poco aprendidos: mediante el filtrado por valores epistemicos en el muestreo, se pueden marcar consultas fuera de la distribucion de entrenamiento y derivarlas a un humano o a otro modelo.
- Interfaz de asistencia con indicador de fiabilidad: integrar la lectura epistemica como semaforo de confianza por token o por respuesta, siguiendo el enfoque que el propio autor describe para su chat web.
- Experimentos academicos de bajo presupuesto: con ~3,98 GB de pesos en bfloat16 y un entrenamiento declarado de 92 dolares, sirve para replicar estudios de escalado, tokenizacion o tecnicas de atencion en una sola GPU.
- Prototipado de asistentes conversacionales en ingles de proposito general: conversaciones cortas con contexto de hasta 1024 tokens, sin requisitos de tiempo real estricto.
- Pruebas de destilacion y comparacion arquitectonica: la combinacion de embeddings de valor, atencion de ventana deslizante y espacio epistemico es un caso de estudio para medir el efecto de cada componente sobre la perdida de validacion.
- Docencia y formacion tecnica: al estar liberado bajo MIT con todos los tensores documentados uno a uno, es util para explicar el desglose de parametros de un transformer moderno en un curso de posgrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el SFT uso MMLU (auxiliary_train) y GSM8K (main) como datos de entrenamiento, pero no reporta ninguna metrica de evaluacion (MMLU, HumanEval, GSM8K ni perdida de validacion). Tampoco hay comparaciones con otros modelos. Como referencia, el propio autor describe el modelo como una prueba de concepto de capacidad epistemica y no como un modelo competitivo en tareas de generacion.

| Benchmark | Frank | Modelos comparables |
|---|---|---|
| MMLU | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| Perdida de validacion | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: en torno a 4,5-6 GB (3,98 GB de pesos mas activaciones, buffers y cache KV).
- Cache KV: muy reducida, del orden de 150 MB para los 1024 tokens de contexto (24 capas x 12 cabezas x 128 dimensiones de cabeza x 2 tensores K/V, en bfloat16). No supone un cuello de botella.
- VRAM estimada en float32: alrededor de 8-9 GB, ya que los pesos pasarian a ~7,95 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas. Cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100. En GPUs de 6 GB (GTX 1660, RTX 2060) el margen es minimo en precision reducida.
- Inferencia en CPU: posible en teoria por tamano (~4 GB de pesos), aunque no se ha publicado ningun backend optimizado para CPU.
- Opciones de despliegue: limitadas. El layout de tensores es personalizado (tipo de modelo `frank_llm`) y no es compatible con transformers tal cual. El autor anuncia un harness de inferencia propio "en breve", que cargara `model.safetensors` junto al tokenizer y expondra la lectura de confianza epistemica. No hay soporte documentado de vLLM, llama.cpp, Ollama, TGI ni SGLang. Tampoco se han publicado cuantizaciones que permitan usar esos runners.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no hay datos de rendimiento publicados para Frank.

| Modelo | Parametros | Contexto | Licencia | Formatos disponibles | Rendimiento publicado |
|---|---|---|---|---|---|
| Frank (QA-AI) | 1,99B | 1024 tokens | MIT | safetensors bfloat16 (layout propio, no compatible con transformers) | No disponible |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8192 tokens | Apache 2.0 | safetensors, GGUF | Si, publicados en su model card |
| Qwen2.5-1.5B (Alibaba) | 1,54B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | safetensors, GPTQ, AWQ, GGUF | Si, publicados en su model card |
| Llama-3.2-1B (Meta) | 1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF (comunidad) | Si, publicados en su model card |
| TinyLlama-1.1B (equipo TinyLlama) | 1,1B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Si, publicados en su model card |

La diferencia principal de Frank respecto a estas alternativas es su rasgo distintivo (el espacio de embeddings epistemicos) y su licencia MIT, combinados con una compatibilidad de herramienta mucho menor, un contexto de solo 1024 tokens y la ausencia de evaluaciones publicas.

## Limitaciones y advertencias

- Ventana de contexto de solo 1024 tokens, muy inferior a la de los modelos de su categoria (8K a 128K), lo que descarta tareas de documento largo o conversaciones extensas.
- Modelo exclusivamente en ingles. El vocabulario BPE de 32.768 tokens esta centrado en ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Arquitectura personalizada: los pesos no cargan con transformers sin un harness especifico que aun no esta publicado. No hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- Sin resultados de benchmarks ni evaluacion independiente. Con 0 descargas y 1 "like" en el momento de la consulta, no existe validacion por parte de la comunidad.
- Riesgo de alucinacion alto. El entrenamiento base cubre unos 6,9B tokens (muy poco para 2B parametros) y el SFT mezcla conversaciones sinteticas de identidad con MMLU y GSM8K, lo que puede favorecer respuestas de identidad memorizadas y sobreajuste a los formatos de esos conjuntos.
- La senal epistemica es una senal interna del modelo, no una garantia de veracidad. Que el modelo se declare seguro no implica que sea correcto; la propia model card la describe como prueba de concepto.
- La tabla de embeddings epistemicos se congela en inferencia, por lo que no se adapta al contexto ni al dominio de la conversacion en curso.
- Sesgos: heredados de ClimbMix-400B y de las conversaciones sinteticas de identidad, sin documentacion de filtrado ni de mitigacion por parte del autor.
- Restricciones de licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. Es una de las licencias mas permisivas disponibles, por lo que no hay friccion legal, pero tampoco existe soporte ni mantenimiento garantizado.
- Caveat de produccion: al no existir harness publicado, cuantizaciones ni backends soportados, no es desplegable hoy en un entorno de produccion estandar; su uso realista es la investigacion y el prototipado.
- La model card disponible esta truncada en la seccion de hiperparametros de SFT, por lo que no se conocen el numero total de pasos, la tasa de aprendizaje, el esquema de decaimiento ni la composicion exacta de la mezcla de datos.
- Fecha de publicacion reciente (16 de septiembre de 2026) en el momento de la consulta; el ecosistema alrededor del modelo puede cambiar si el autor libera el harness anunciado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QA-AI/frank
- nanochat (Andrej Karpathy, enero de 2025), base conceptual del proyecto: https://github.com/karpathy/nanochat
- ClimbMix-400B: dataset de entrenamiento base citado en la model card; enlace directo no disponible en la informacion proporcionada
- Harness de inferencia de Frank: anunciado por el autor, todavia no publicado; enlace no disponible
- Resultados de busqueda web: no aportan informacion relevante sobre el modelo (los resultados obtenidos corresponden a definiciones genericas de "QA" y a proveedores de formacion, sin relacion con QA-AI/frank)
