# richardyoung/CardioEmbed-Qwen3-8B

## Resumen

CardioEmbed-Qwen3-8B es un adaptador LoRA publicado por Richard Young (DeepNeuro.AI) sobre el modelo de embeddings Qwen/Qwen3-Embedding-8B, especializado en texto clinico de cardiologia. No es un modelo generativo: es un modelo de representacion (feature-extraction) cuyo proposito es producir vectores densos de alta calidad para similitud semantica, recuperacion de informacion y comparacion de documentos medicos. Forma parte de la serie CardioEmbed, que incluye variantes sobre BGE-M3 y Qwen3-Embedding-4B, y esta respaldada por el articulo "CardioEmbed: Domain-Specialized Text Embeddings for Clinical Cardiology" (arXiv:2511.10930).

El modelo hereda la arquitectura del transformer denso de Qwen3-Embedding-8B (aproximadamente 8.000 millones de parametros) y anade un adaptador LoRA de bajo rango entrenado sobre corpus de cardiologia. El repositorio pesa solo 0,5 GB porque contiene unicamente los pesos del adaptador en safetensors, no el modelo base completo. La licencia es Apache 2.0 tanto en el adaptador como, presumiblemente, en el modelo base subyacente.

Su relevancia actual radica en la especializacion de dominio: los embeddings generalistas rinden peor en terminologia clinica densa (sindromes coronarios, fraccion de eyeccion, clasificaciones NYHA, codigos ICD) donde la similitud lexica y semantica diverge del lenguaje comun. Un adaptador LoRA permite obtener esa mejora sin reentrenar los 8.000 millones de parametros, manteniendo el coste de almacenamiento y despliegue muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-Embedding-8B) con adaptador LoRA |
| Parametros totales | Aproximadamente 8.000 millones en el modelo base; el adaptador LoRA ocupa 0,5 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-Embedding-8B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen/Qwen3-Embedding-8B, un transformer denso de la familia Qwen3 orientado a generacion de embeddings. El entrenamiento se realizo mediante ajuste fino supervisado con LoRA sobre datos del dominio de cardiologia, segun se describe en el articulo CardioEmbed (arXiv:2511.10930). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de contraste (por ejemplo, pares positivo-negativo, triplet loss o InfoNCE), aunque por la naturaleza de la tarea de embeddings es esperable un entrenamiento contrastivo.

La innovacion principal no es arquitectonica sino de eficiencia y especializacion: un adaptador de rango bajo permite adaptar un modelo de 8.000 millones de parametros a un dominio tecnico con un coste de almacenamiento de 0,5 GB y sin modificar los pesos base. Esto facilita el versionado, la sustitucion de adaptadores por especialidad y el despliegue compartiendo un unico modelo base entre multiples dominios. No se documentan en la informacion disponible innovaciones como atencion lineal, decodificacion especulativa ni modos de razonamiento.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion de informacion.
- Especializacion en terminologia y lenguaje clinico de cardiologia.
- Recuperacion de documentos medicos (medical document retrieval).
- Comparacion de similitud entre notas clinicas.
- Busqueda en literatura cardiologica.
- Emparejamiento de casos de pacientes (patient case matching).
- Salida de vectores densos aptos para indexacion en bases de datos vectoriales.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un modelo de representacion.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Recuperacion aumentada (RAG) sobre historiales clinicos: indexar notas de cardiologia en una base vectorial y recuperar los fragmentos mas relevantes para una consulta clinica, aprovechando que el adaptador esta ajustado al vocabulario y las abreviaturas propias del dominio.
- Busqueda en literatura cardiologica: construir un indice de articulos y guias de practica clinica para que investigadores y clinicos localicen evidencia por similitud semantica en lugar de coincidencia exacta de terminos.
- Deduplicacion y agrupacion de notas clinicas: detectar registros duplicados o pacientes con historiales solapados comparando embeddings de notas, util en procesos de limpieza de datos hospitalarios.
- Emparejamiento de casos de pacientes: dado un caso nuevo, recuperar casos historicos similares para apoyo a la decision clinica o para seleccion de cohortes en estudios retrospectivos.
- Clasificacion y enrutamiento de documentos medicos: usar los embeddings como caracteristicas de entrada para clasificadores downstream (por ejemplo, derivar informes a subespecialidades) sin reentrenar un modelo grande.
- Sistemas de alerta y triaje documental: comparar la descripcion de sintomas de un paciente con una base de protocolos y guias para sugerir documentos relevantes al personal sanitario.
- Construccion de datasets de evaluacion clinica: generar representaciones para medir similitud entre pares de frases clinicas y validar la calidad de corpus anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo arXiv:2511.10930 para los detalles del entrenamiento y la evaluacion, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,5 GB, pero la inferencia requiere cargar el modelo base Qwen3-Embedding-8B completo.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 16 GB solo para pesos, mas memoria para activaciones y lote; en la practica se recomienda 24 GB o mas.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 8-9 GB; con 4 bits: aproximadamente 4-5 GB, aunque la cuantizacion del modelo base y el adaptador LoRA debe validarse empiricamente.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en produccion con lotes grandes; RTX 4090 (24 GB) es viable en FP16 con lotes pequenos.
- En GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con lotes moderados; en GPUs de 12-16 GB requiere cuantizacion.
- Opciones de despliegue: transformers + PEFT (ruta documentada en la model card), y previsiblemente vLLM, TGI o Text Embeddings Inference con soporte de adaptadores, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-Qwen3-8B | Aprox. 8.000 M (base) + LoRA | No disponible | Cardiologia (ingles) | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-Embedding-8B | Aprox. 8.000 M | No disponible | Generalista, multilingue | Apache 2.0 | Hugging Face |
| CardioEmbed-Qwen3-4B | Aprox. 4.000 M (base) + LoRA | No disponible | Cardiologia (ingles) | Apache 2.0 | Hugging Face |
| CardioEmbed-BGE-M3 | Base BGE-M3 + LoRA | No disponible | Cardiologia (ingles) | Apache 2.0 | Hugging Face |

La comparativa cuantitativa de rendimiento entre estas variantes no esta disponible en la informacion proporcionada; el articulo arXiv:2511.10930 es la fuente indicada para dicha comparacion.

## Limitaciones y advertencias

- Entrenado y declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Es un modelo de embeddings, no generativo: no puede responder preguntas ni producir texto.
- No se documentan evaluaciones de sesgo; los corpus clinicos pueden contener sesgos demograficos y de practica medica que se reflejen en los embeddings.
- Riesgo de falsa similitud semantica: dos notas con terminologia parecida pero significado clinico distinto pueden quedar proximas en el espacio vectorial; requiere validacion con datos propios.
- El repositorio contiene solo el adaptador; es imprescindible cargar el modelo base Qwen3-Embedding-8B, lo que implica asumir su licencia y sus requisitos de hardware.
- La model card no especifica la longitud de contexto efectiva ni el pooling recomendado mas alla del ejemplo con media de last_hidden_state.
- Uso clinico: no debe emplearse como unico criterio en decisiones medicas; es una herramienta de recuperacion y similitud, no un dispositivo medico validado.
- Con 17 descargas y 0 likes en el momento de la consulta, la adopcion y validacion externa son muy limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Articulo CardioEmbed: https://arxiv.org/abs/2511.10930
- CardioEmbed (variante base): https://huggingface.co/richardyoung/CardioEmbed
- CardioEmbed-BGE-M3: https://huggingface.co/richardyoung/CardioEmbed-BGE-M3
- CardioEmbed-Qwen3-4B: https://huggingface.co/richardyoung/CardioEmbed-Qwen3-4B
- Perfil del autor: https://deepneuro.ai/richard
- DeepNeuro.AI: https://deepneuro.ai
