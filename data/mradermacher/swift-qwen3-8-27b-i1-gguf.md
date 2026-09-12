# mradermacher/Swift-Qwen3.8-27b-i1-GGUF

## Resumen

`mradermacher/Swift-Qwen3.8-27b-i1-GGUF` es un repositorio de pesos cuantizados en formato GGUF publicado por el usuario mradermacher, derivado del modelo `ukisai/Swift-Qwen3.8-27b`. No se trata de un modelo entrenado desde cero, sino de una distribucion de cuantizaciones generadas con llama.cpp sobre los pesos originales, empleando calibracion con matriz de importancia (imatrix, de ahi el sufijo `i1`). El modelo base cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones).

El repositorio incluye 23 variantes de cuantizacion, desde IQ1_S (la mas agresiva) hasta Q6_K (la mas cercana al modelo original), lo que permite desplegar un modelo de clase 27B en hardware muy diverso: desde tarjetas graficas de gama media de 12-16 GB de VRAM hasta estaciones de trabajo sin GPU, usando la CPU y memoria RAM. El tamano del repositorio declarado por HuggingFace es de 10,9 GB.

La relevancia de esta publicacion es practica: es una de las pocas vias para ejecutar localmente la base Swift-Qwen3.8-27b sin acceso a infraestructura de datacenter. Sin embargo, la model card es minima, no se declara licencia ni idiomas, y no hay resultados de evaluacion publicados, por lo que cualquier uso en produccion exige una verificacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo base sugiere la familia Qwen3, sin confirmar en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (aprox. 27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Metodo de cuantizacion | imatrix (weighted/imatrix quants), quantize_version 2 de llama.cpp |
| Modelo base | ukisai/Swift-Qwen3.8-27b |
| Tamano del repositorio | 10,9 GB (segun metadatos de HuggingFace) |
| Fecha de publicacion | 2026-09-12 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es el resultado de aplicar el pipeline de cuantizacion de llama.cpp sobre los pesos del modelo `ukisai/Swift-Qwen3.8-27b`. Los metadatos internos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos en formato HuggingFace (safetensors) a GGUF seguida de cuantizacion. El prefijo `i1` identifica variantes generadas con imatrix, un metodo de calibracion que pondera la importancia de cada tensor segun su sensibilidad estadistica, lo que en teoria reduce la perdida de calidad en regimenes de baja precision (IQ1, IQ2, IQ3).

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, numero de capas o cabezas), ni sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. Tampoco hay datos sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, mezcla de expertos) en la informacion proporcionada. El nombre `Qwen3.8` apunta a un derivado de la familia Qwen, pero esto no esta confirmado por ninguna fuente accesible y no debe asumirse.

## Capacidades

Las capacidades reales no estan documentadas en la informacion disponible. Las etiquetas del repositorio permiten afirmar unicamente lo siguiente:

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo base esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a traves de una interfaz HTTP compatible con el formato de la API de OpenAI, aunque la conformidad exacta no esta verificada.
- Inferencia local: el formato GGUF permite ejecucion en CPU y en GPU con llama.cpp y derivados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponible.
- Capacidades de codigo o matematicas: no disponible.

## Casos de uso

- Ejecucion local en estaciones de trabajo sin GPU de datacenter: las variantes IQ2_M, IQ3_M o Q4_K_S permiten cargar un modelo de 27B en equipos con 12-16 GB de VRAM o incluso en CPU con suficiente RAM, gracias al formato GGUF y a la gestion de memoria por capas de llama.cpp.
- Servicio de API autoalojado: la etiqueta `endpoints_compatible` permite desplegar el modelo con `llama-server` o con Ollama y exponer una interfaz HTTP que los clientes existentes (SDK de OpenAI, LangChain, LlamaIndex) pueden consumir sin cambios en el codigo de integracion.
- Despliegue on-premise con requisitos de privacidad: en entornos sanitarios, juridicos o financieros donde los datos no pueden salir de la infraestructura propia, el modelo se ejecuta integramente en local, sin llamadas a APIs externas.
- Seleccion de la cuantizacion optima mediante evaluacion empirica: el repositorio ofrece 23 variantes del mismo modelo base, lo que permite al integrador medir la degradacion real entre IQ1_S, Q2_K, Q4_K_M y Q6_K sobre su propio conjunto de validacion y elegir el punto de equilibrio entre calidad y consumo de memoria.
- Prototipado rapido de aplicaciones conversacionales: con las variantes de menor tamano (IQ1_S, IQ2_XXS) se puede levantar un prototipo funcional en portatiles con 8-16 GB de RAM antes de invertir en hardware o en un endpoint gestionado.
- Distribucion offline o en entornos aislados: los ficheros GGUF son autocontenidos y no requieren conexion a internet en tiempo de ejecucion, lo que resulta util en escenarios de formacion, investigacion de campo o sistemas air-gapped.
- Reproduccion del pipeline de cuantizacion: un equipo de ingenieria puede usar este repositorio como referencia para replicar el proceso imatrix de mradermacher sobre su propio modelo afinado y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y tampoco se dispone de datos de perplejidad por cuantizacion.

## Requisitos de hardware

Los tamanos de fichero que se indican a continuacion son estimaciones calculadas a partir del numero de parametros declarado (27.320.697.856) y de los bits por peso tipicos de cada tipo de cuantizacion en llama.cpp. No son cifras oficiales. La VRAM total necesaria es superior, ya que hay que anadir la cache KV y el overhead de runtime.

| Cuantizacion | Bits por peso aprox. | Tamano estimado de pesos | Hardware orientativo |
|---|---|---|---|
| IQ1_S | 1,56 | ~5,3 GB | GPU de 8 GB o CPU con 16 GB de RAM |
| IQ2_M | 2,70 | ~9,2 GB | GPU de 12 GB |
| Q2_K | 2,63 | ~9,0 GB | GPU de 12 GB |
| IQ3_M | 3,66 | ~12,5 GB | GPU de 16 GB |
| Q3_K_M | 3,91 | ~13,4 GB | GPU de 16 GB |
| IQ4_XS | 4,25 | ~14,5 GB | GPU de 16-24 GB |
| Q4_K_M | 4,85 | ~16,6 GB | GPU de 24 GB |
| Q5_K_M | 5,67 | ~19,4 GB | GPU de 24 GB (ajustado) |
| Q6_K | 6,56 | ~22,4 GB | GPU de 24 GB (muy ajustado) o 32 GB |

- VRAM estimada para inferencia: no disponible de forma oficial. Depende del tipo de cuantizacion, de la longitud de contexto configurada y del numero de capas y cabezas KV del modelo base, que no se detallan en la informacion proporcionada. La cache KV puede anadir varios gigabytes en contextos largos.
- GPU recomendadas: para las variantes Q4_K_M y superiores, una RTX 4090, RTX 3090, L4 (24 GB) o A100/H100 de 40-80 GB. Para IQ1_S a Q3_K_M, tarjetas de 12-16 GB como RTX 4070 Ti, RTX 4080 o Tesla T4/V100.
- Cabe en GPU de consumo: si. Las variantes IQ1_S, IQ2 y Q3 caben en GPUs de consumo de 12-16 GB (RTX 4070, 4080, 3080 Ti). Q4_K_M cabe en una RTX 4090 o 3090 de 24 GB con contexto moderado. Q6_K requiere 24 GB con contexto reducido o reparto parcial con CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y Jan. vLLM y TGI no estan optimizados para GGUF, por lo que no son la via recomendada.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las variantes.

## Comparativa con modelos similares

No se dispone de datos de otros modelos en la informacion proporcionada, por lo que no es posible establecer una comparativa con cifras verificables. La comparacion mas util que permite este repositorio es interna, entre sus propias cuantizaciones del mismo modelo base:

| Variante | Bits por peso aprox. | Tamano estimado | Compromiso |
|---|---|---|---|
| IQ1_S | 1,56 | ~5,3 GB | Maxima compresion, degradacion esperada alta |
| IQ2_M | 2,70 | ~9,2 GB | Compresion fuerte, calidad moderada |
| Q3_K_M | 3,91 | ~13,4 GB | Equilibrio habitual para GPU de 16 GB |
| Q4_K_M | 4,85 | ~16,6 GB | Punto de equilibrio estandar de la comunidad |
| Q6_K | 6,56 | ~22,4 GB | Perdida minima, requisitos altos |

Por clase de tamano, los comparables naturales serian otras cuantizaciones comunitarias de modelos de 27B a 32B (por ejemplo, alternativas de las familias Qwen o Gemma 2 27B), pero no hay datos de parametros, contexto, rendimiento ni licencia de esos modelos en la informacion proporcionada que permitan una tabla fiable.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Es imprescindible verificar la licencia del modelo base `ukisai/Swift-Qwen3.8-27b` antes de cualquier uso comercial, ya que la ausencia de licencia implica ausencia de permisos explicitos.
- Perdida por cuantizacion: toda cuantizacion introduce degradacion. En las variantes extremas (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) la perdida de calidad puede ser sustancial y afectar a tareas de razonamiento o codigo. No hay mediciones publicadas de esta degradacion.
- Ausencia de evaluacion: no hay benchmarks, ni datos de perplejidad, ni comparaciones con el modelo en precision completa. No es posible afirmar que la calidad sea adecuada para produccion.
- Idiomas no declarados: se desconoce si el modelo base tiene un buen rendimiento en castellano o si esta predominantemente entrenado en ingles y chino.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo (analisis de documentos extensos, conversaciones prolongadas).
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos. Sin evaluacion disponible, el riesgo no esta cuantificado y debe mitigarse con verificacion externa y recuperacion aumentada.
- Model card minima: la documentacion del autor se limita a una linea de texto y a metadatos HTML comentados. No hay guia de prompt, ni plantilla de chat documentada, lo que puede provocar un formateo incorrecto de las conversaciones si no se inspecciona el tokenizador embebido en el GGUF.
- Inconsistencia del tamano de repositorio: los 10,9 GB declarados por HuggingFace son dificilmente compatibles con 23 cuantizaciones de un modelo de 27B, cuyo conjunto superaria ampliamente esa cifra. La cifra probablemente corresponde a un subconjunto de ficheros; conviene verificar los tamanos reales en la pagina del repositorio.
- Falta de validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no ha sido contrastado por terceros.
- Compatibilidad de endpoints: la etiqueta `endpoints_compatible` no garantiza conformidad completa con la API de OpenAI; hay que verificar el soporte de tool calling, streaming y formato de respuesta antes de integrarlo.
- Fecha de publicacion: los metadatos indican 2026-09-12, fecha que conviene contrastar con la cronologia real del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Swift-Qwen3.8-27b-i1-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime para GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue simplificado de GGUF): https://github.com/ollama/ollama

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; todas las referencias recuperadas correspondian a servicios de mensajeria ajenos al contenido solicitado. No se han podido localizar papers, blogs tecnicos ni demos asociados al modelo.
