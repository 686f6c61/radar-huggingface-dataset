# mradermacher/Kronumos-GGUF

## Resumen

Kronumos-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo base NadevA23/Kronumos. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización posterior pensada para ejecución en CPU y GPU de gama de consumo mediante llama.cpp y sus derivados. El recuento real de parámetros del modelo base, según los metadatos de safetensors, es de 7.615.616.512 parámetros, lo que lo sitúa en la categoría de los modelos densos de aproximadamente 7-8 mil millones de parámetros.

La relevancia de este tipo de repositorios es práctica: permiten desplegar un modelo de ese tamaño en hardware modesto (desde Q2_K, en torno a 3 GB, hasta Q8_0, en torno a 8 GB) sin necesidad de infraestructura de servidor. El repositorio incluye doce niveles de cuantización distintos, desde IQ4_XS hasta f16, cubriendo el espectro habitual de compromisos entre calidad y consumo de memoria.

La información pública disponible es muy limitada. La model card del repositorio se reduce a los metadatos de la herramienta de cuantización y a la referencia al modelo original. No se documentan arquitectura concreta, longitud de contexto, idiomas soportados, licencia ni datos de entrenamiento, por lo que buena parte de las especificaciones de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no confirmada en la informacion proporcionada) |
| Parametros totales | 7.615.616.512 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (x-f16), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Modelo base | NadevA23/Kronumos |
| Herramienta de cuantizacion | llama.cpp (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf) |
| Tamano del repositorio | 63,9 GB (suma de todos los ficheros de cuantizacion) |
| Fecha de creacion (metadatos) | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en los datos proporcionados. El unico dato estructural fiable es el recuento de parametros (7.615.616.512), coherente con un transformer denso de la familia de 7-8B, pero esto es una inferencia por tamano y no una confirmacion documentada. Tampoco se especifica si emplea atencion con ventana deslizante, atencion lineal, mezcla de expertos u otro esquema.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni tecnicas de alineacion. La model card del repositorio de cuantizacion indica unicamente que se trata de cuantizaciones estaticas del modelo NadevA23/Kronumos, con metadatos que revelan el uso del cuantizador de llama.cpp en su version 2 y que los tensores de salida tambien fueron cuantizados (output_tensor_quantised: 1), un ajuste que en la practica implica que la capa de salida y los embeddings comparten el mismo esquema de cuantizacion que el resto del modelo.

La unica innovacion tecnica atribuible a este repositorio es, por tanto, el propio proceso de cuantizacion: la disponibilidad de doce variantes permite ajustar el equilibrio entre perplejidad y huella de memoria sin reentrenar nada. Las cuantizaciones K-quant (Q2_K a Q6_K) y la variante IQ4_XS (de la familia I-quant) ofrecen distintos compromisos, siendo IQ4_XS y Q4_K_M las opciones habitualmente mas equilibradas en modelos de este tamano.

## Capacidades

La informacion disponible no permite verificar capacidades concretas. El unico indicio es la etiqueta `conversational` del repositorio, que sugiere un ajuste orientado a dialogo. A partir de ahi, y sin datos de evaluacion, solo cabe enumerar lo que seria esperable en un modelo denso de ~7,6B con ajuste conversacional, marcandolo explicitamente como no confirmado:

- Generacion de texto y dialogo multiturno: la etiqueta `conversational` apunta a este uso, pero no hay confirmacion documentada.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Modo de ajuste: no disponible; no se documenta plantilla de prompt ni tokens especiales de chat. Este punto es critico en la practica, ya que un GGUF sin plantilla de chat correctamente configurada produce respuestas degradadas.

## Casos de uso

Los siguientes casos de uso son escenarios plausibles para un modelo denso de ~7,6B cuantizado en GGUF de caracter conversacional. Deben validarse empiricamente antes de llevarlos a produccion, ya que no hay benchmarks ni documentacion de capacidades.

- Asistente conversacional autoalojado: desplegado con Ollama o llama.cpp en una estacion de trabajo, el modelo puede atender conversaciones multiturno sin enviar datos a terceros. Es adecuado cuando la privacidad del contenido es un requisito y no se necesita razonamiento complejo.
- Prototipado rapido en portatil: las variantes Q3_K_M o Q4_K_M caben en GPU integradas o en GPU de consumo con 6-8 GB de VRAM, lo que permite iterar sobre prompts y flujos de chat sin acceso a servidores.
- Clasificacion y etiquetado de texto: tareas de extraccion de entidades, categorizacion de tickets o resumen de documentos cortos pueden resolverse por lotes con llama.cpp, aprovechando el bajo coste por token de la inferencia local.
- Generacion de borradores de documentacion tecnica: redaccion asistida de README, notas de version o comentarios de codigo, con revision humana obligatoria dado el riesgo de alucinacion inherente a modelos de este tamano.
- Backend de bajo coste para aplicaciones de escritorio: integrado mediante llama-cpp-python en una aplicacion nativa, el modelo puede ofrecer funciones de autocompletado de texto o reformulacion sin dependencia de APIs externas.
- Evaluacion y experimentacion en investigacion: como punto de comparacion cuantizado frente a otros modelos de ~7B, resulta util para estudiar el impacto de la cuantizacion en la calidad de salida (por ejemplo, comparando Q2_K con Q8_0 sobre el mismo conjunto de prompts).
- Filtrado previo en pipelines mayores: usado como modelo de triaje para descartar o marcar entradas antes de pasarlas a un modelo mayor, reduciendo el coste total de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan datos de perplexity por nivel de cuantizacion.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones calculadas a partir del recuento de parametros (7.615.616.512) y del tamano tipico por parametro de cada esquema de cuantizacion. No son datos publicados por el autor y deben tratarse como orientativas.

- VRAM estimada para los pesos, por cuantizacion:
  - Q2_K: ~2,9 GB
  - Q3_K_S: ~3,4 GB
  - Q3_K_M: ~3,8 GB
  - Q3_K_L: ~4,1 GB
  - IQ4_XS: ~4,1 GB
  - Q4_K_S: ~4,4 GB
  - Q4_K_M: ~4,7 GB
  - Q5_K_S: ~5,2 GB
  - Q5_K_M: ~5,4 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
- Anadir entre 1 y 3 GB adicionales de VRAM para el contexto (KV cache) segun la longitud de contexto configurada y el numero de capas; el valor exacto depende de una arquitectura que no se ha documentado.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090 24 GB y equivalentes de AMD. Cualquiera de ellas ejecuta sin problemas las variantes Q4 y Q5 completas en VRAM.
- GPU de gama baja o iGPU: las variantes Q2_K y Q3_K caben en tarjetas con 4-6 GB de VRAM, y la ejecucion hibrida CPU+GPU es viable con llama.cpp.
- GPU de centro de datos (A100 40/80 GB, H100, L40S, A6000): sobredimensionadas para un modelo de este tamano, pero utiles si se sirven muchas peticiones concurrentes o si se usa la variante f16 con contexto largo.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`, lo que indica compatibilidad con despliegues de tipo text-generation-inference en Hugging Face. La integracion con vLLM es limitada para GGUF y no esta documentada para este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

El modelo carece de datos publicos de rendimiento, licencia y contexto, por lo que la comparacion solo puede establecerse en terminos de categoria y formato. La tabla siguiente usa especificaciones publicas ampliamente documentadas de modelos alternativos de tamano similar, a modo de referencia de mercado.

| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento |
|---|---|---|---|---|---|
| Kronumos-GGUF (mradermacher) | 7,62B | no disponible | no disponible | GGUF (12 cuantizaciones) | no disponible |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF (comunidad) | ampliamente evaluado en benchmarks publicos |
| Qwen2.5 7B Instruct | 7,61B | 131.072 tokens | Apache 2.0 | safetensors, GGUF (comunidad) | ampliamente evaluado en benchmarks publicos |
| Mistral 7B Instruct v0.3 | 7,25B | 32.000 tokens | Apache 2.0 | safetensors, GGUF (comunidad) | ampliamente evaluado en benchmarks publicos |

Nota: la coincidencia casi exacta entre el recuento de parametros de Kronumos (7.615.616.512) y el de Qwen2.5-7B (7,61B) es llamativa, pero no constituye prueba de que Kronumos sea un ajuste derivado de Qwen2.5. No hay informacion que lo confirme o desmienta.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se declara arquitectura, contexto, idiomas, licencia ni datos de entrenamiento. Cualquier uso en produccion exige una evaluacion propia previa.
- Licencia no disponible: sin una licencia explicita, no puede asumirse permiso para uso comercial. Ademas, la licencia del modelo base NadevA23/Kronumos es igualmente desconocida, y una cuantizacion no puede otorgar derechos mas amplios que el modelo original. Es imprescindible contactar con el autor del modelo base antes de cualquier explotacion comercial.
- Riesgo de alucinacion: los modelos densos de ~7-8B presentan tasas de alucinacion notablemente superiores a los de mayor tamano. En tareas factuales o de resumen sin contexto verificable, requiere supervision humana.
- Degradacion por cuantizacion agresiva: las variantes Q2_K y Q3_K_S reducen la huella de memoria de forma drastica a costa de perplejidad y coherencia. Para uso conversacional se recomienda Q4_K_M o superior; IQ4_XS es una alternativa de compromiso.
- Tensores de salida cuantizados: el metadato `output_tensor_quantised: 1` indica que la capa de salida tambien esta cuantizada, lo que en algunos modelos incrementa ligeramente la degradacion de calidad respecto a dejar esa capa en precision superior.
- Plantilla de chat desconocida: sin informacion sobre el formato de prompt, el modelo puede responder de forma degradada si el runtime aplica una plantilla generica incorrecta. Verificar el formato esperado antes del despliegue.
- Idiomas no declarados: no hay garantia de rendimiento en castellano ni en ningun otro idioma distinto del que se uso en el ajuste, presumiblemente el ingles dado el tag `region:us`.
- Modelo sin traccion: cero descargas y cero likes en el momento de la consulta. No hay comunidad, reportes de uso ni validacion independiente que respalden su calidad.
- Fechas de metadatos anomales: la fecha de creacion indicada (2026-09-24) es posterior a la fecha actual en la mayoria de contextos, lo que sugiere un error de marca temporal o una carga programada. No afecta al contenido, pero conviene tenerlo en cuenta al citar el repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kronumos-GGUF
- Modelo base: https://huggingface.co/NadevA23/Kronumos
- Perfil del cuantizador: https://huggingface.co/mradermacher

No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
