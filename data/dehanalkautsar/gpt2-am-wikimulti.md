# dehanalkautsar/gpt2-am-wikimulti

## Resumen

GPT-2 Amharic WikiMulti es un modelo de generacion de texto causal entrenado desde cero por el usuario de HuggingFace dehanalkautsar sobre la porcion en amharico del dataset WikiMulti. No se trata de un ajuste fino (fine-tuning) del GPT-2 original: tanto los pesos del transformer como el tokenizador Byte-Level BPE se inicializaron y entrenaron desde cero usando exclusivamente texto en amharico, lo que lo convierte en un modelo mono-idioma para esa lengua.

Arquitectonicamente replica la configuracion de GPT-2 small: 12 capas, tamano oculto de 768, 12 cabezas de atencion y una longitud maxima de contexto de 1024 tokens, con un vocabulario de 50257 entradas. El recuento real de parametros segun los pesos en safetensors es de 124.439.808, en linea con los ~124M de GPT-2 small.

Su relevancia es acotada pero clara: el amharico es una lengua etiope con relativamente pocos recursos y con una representacion limitada en modelos generativos abiertos. Este checkpoint ofrece una base pequena, entrenable y desplegable en hardware de consumo para tareas de generacion en amharico. El resultado publicado por el autor es modesto: perdida de validacion de 5,9865 y perplejidad de 398,03, lo que indica un modelo de baja calidad relativa y util principalmente como punto de partida para experimentacion o ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (GPT-2 small) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precision completa; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | amharico (am) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 12 |
| Tamano oculto | 768 |
| Cabezas de atencion | 12 |
| Tamano de vocabulario | 50257 |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estandar, sin mecanismos de atencion lineal, decodificacion especulativa ni componentes de tipo MoE o SSM. Se trata de la configuracion clasica de GPT-2 small: 12 bloques con atencion multi-cabeza de 12 cabezas, normalizacion previa y embeddings posicionales aprendidos. El tokenizador es un Byte-Level BPE entrenado exclusivamente sobre el split de entrenamiento en amharico, con un vocabulario de 50257 entradas, por lo que no reutiliza el vocabulario ni las reglas de merge del GPT-2 original en ingles.

El entrenamiento se realizo en una unica NVIDIA RTX A6000 con precision FP16 y TF32 activado, batch de 8 por GPU con acumulacion de gradiente de 4 (batch efectivo de 32 secuencias), longitud de secuencia de 1024, learning rate de 5e-05, scheduler lineal y semilla fija de 42. El limite era de 50 epocas, con validacion cada 500 pasos de optimizador y parada temprana con paciencia de 3 y umbral 0,0. El proceso se detuvo cuando la perdida de validacion dejo de mejorar durante 3 rondas consecutivas. No se documenta fase de RLHF, DPO ni ajuste por instrucciones, ni se especifica el numero total de tokens vistos, la composicion exacta del dataset mas alla del fichero `20260801_am_wiki.parquet` y el campo `text`, ni la receta de preprocesado.

El mejor modelo alcanzo una perdida de validacion de 5,986520767211914 y una perplejidad de 398,0273681880695, cifras que reflejan un ajuste limitado. Para contexto, una perplejidad de ese orden en un corpus de wiki indica una capacidad de modelado del lenguaje bastante pobre: el modelo probablemente produce texto gramaticalmente plausible a nivel local pero con escasa coherencia de largo alcance.

## Capacidades

- Generacion de texto causal en amharico: continuacion de prompts, completado de parrafos y generacion libre a partir de un contexto.
- Modelado del lenguaje: al ser un modelo preentrenado, es util como base para extraer probabilidades y para ajuste fino supervisado posterior.
- Tokenizacion especifica de amharico: el tokenizador BPE entrenado sobre esa lengua evita buena parte de la fragmentacion excesiva que sufriria el vocabulario original de GPT-2 sobre el alfabeto ge'ez.
- Soporte de tool calling o function calling: no disponible; no se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; solo se ha entrenado con datos en amharico.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ajuste por instrucciones o dialogo: no disponible; es un modelo base, no un modelo de chat.

## Casos de uso

- Ajuste fino supervisado para tareas concretas en amharico: al ser un modelo base pequeno, se puede reentrenar la cabeza de generacion con datasets etiquetados (clasificacion de texto, resumen, respuesta a preguntas) en una sola GPU, algo inviable con modelos multilingues de mayor tamano.
- Generacion de texto auxiliar en amharico: redaccion de borradores, completado de parrafos o generacion de variaciones sobre un texto semilla, siempre con revision humana dado el nivel de perplejidad.
- Investigacion sobre bajos recursos linguisticos: sirve como linea base reproducible para comparar tecnicas de tokenizacion o de preentrenamiento en lenguas con pocos datos disponibles.
- Experimentacion con tokenizadores para ge'ez: el modelo permite medir el impacto de un BPE entrenado solo en amharico frente a vocabularios multilingues en tareas de generacion.
- Generacion de datos sinteticos para aumentar corpus en amharico: se puede emplear para producir texto adicional que, tras filtrado, alimente otros pipelines. Requiere verificacion estricta por la tasa esperable de alucinacion y degradacion.
- Docencia y prototipado en entornos con hardware limitado: cabe en cualquier GPU de consumo, por lo que es adecuado para practicas de ajuste fino, cuantizacion y despliegue sin infraestructura dedicada.
- Analisis de perplejidad sobre dominios en amharico: util como estimador de dificultad o de anomalia de un corpus, ya que su perplexidad es conocida y reproducible.
- Pruebas de pipelines de inferencia (transformers, TGI, vLLM) antes de escalar a modelos mayores: su tamano reducido permite validar la integracion con un coste minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, Belebele u otros) en la informacion disponible. Los unicos datos de evaluacion facilitados por el autor son los de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion (mejor modelo) | 5,986520767211914 |
| Perdida de validacion final del mejor modelo | 5,986520767211914 |
| Perplejidad | 398,0273681880695 |

No se especifica sobre que split o subconjunto se calcularon estas cifras mas alla de la validacion del propio entrenamiento, ni existe comparacion publicada con otros modelos en amharico.

## Requisitos de hardware

- VRAM estimada para inferencia: FP32 en torno a 0,5 GB solo en pesos; FP16/BF16 en torno a 0,25 GB; INT8 en torno a 0,13 GB; INT4 en torno a 0,07 GB. A ello hay que sumar la cache KV, que para 1024 tokens y un lote pequeno es de decenas de MB, por lo que el consumo total se mantiene muy por debajo de 1 GB en FP16.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM. Modelos como RTX 3060, RTX 4060, RTX 4090, A6000, A100 o H100 lo ejecutan sin dificultad; el modelo fue entrenado en una RTX A6000.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas de los ultimos anos, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` presente en el repositorio) y endpoints compatibles (`endpoints_compatible`). vLLM y TGI estan soportados por arquitectura GPT-2, aunque no se documenta configuracion probada. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no incluye ese formato.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor ni de terceros. Dado el tamano (124M de parametros), en una GPU de consumo moderna la generacion deberia situarse en el orden de cientos a miles de tokens por segundo por secuencia, pero se trata de una estimacion por tamano, no de un dato medido.

## Comparativa con modelos similares

No se dispone de informacion verificada sobre otros modelos GPT-2 entrenados especificamente en amharico que permita una comparacion cuantitativa. La comparacion con el GPT-2 small original es la unica que puede hacerse con datos contrastables de arquitectura y licencia.

| Modelo | Parametros | Contexto | Vocabulario | Idiomas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| gpt2-am-wikimulti | 124.439.808 | 1024 | 50257 (BPE propio en amharico) | amharico | no disponible | Perplejidad 398,03 (validacion propia) |
| GPT-2 small original (OpenAI) | ~124M | 1024 | 50257 (BPE en ingles) | ingles (multilingue limitado por transferencia) | MIT | Benchmarks publicos en ingles; no comparable en amharico |
| Modelos multilingues tipo mGPT / XLM-R | no disponible para una comparacion directa en generacion en amharico | no disponible | no disponible | multilingue | no disponible | no disponible |
| Otros checkpoints en amharico de GPT-2 publicados en HuggingFace | no disponible | no disponible | no disponible | amharico | no disponible | no disponible |

La diferencia funcional clave frente a GPT-2 small original es el tokenizador: al haberse entrenado con BPE sobre amharico, cabe esperar una tokenizacion mas eficiente del texto en ge'ez, aunque no se han publicado mediciones de fertilidad del tokenizador.

## Limitaciones y advertencias

- Calidad limitada: la perplejidad de 398,03 en validacion indica un modelado del lenguaje pobre. Es esperable texto incoherente a nivel de parrafo, repeticiones y desviaciones del tema. No es adecuado para produccion sin ajuste adicional y supervision.
- Sesgos conocidos: no se documenta analisis de sesgos. Al entrenar sobre Wikipedia en amharico (WikiMulti), el modelo hereda los sesgos de cobertura, sesgo de genero y sesgo geografico propios de ese corpus.
- Riesgo de alucinacion: alto. Es un modelo base sin alineacion, sin RLHF ni ajuste por instrucciones, por lo que puede generar afirmaciones factualmente falsas con total fluidez aparente.
- Limitaciones de contexto: 1024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o resumen de articulos completos.
- Limitaciones de idioma: solo amharico. No se ha entrenado con otros idiomas, de modo que el rendimiento fuera del amharico sera esencialmente aleatorio.
- Restricciones de licencia: el repositorio no declara licencia. Sin una licencia explicita, no hay autorizacion clara para uso comercial y el estatus legal del modelo es ambiguo; conviene contactar con el autor antes de cualquier uso en produccion.
- Datos de procedencia del corpus: la composicion exacta, la fecha de extraccion y el filtrado de WikiMulti no se detallan en la model card, lo que dificulta auditar posibles contenidos problematicos o contaminacion.
- Ausencia de benchmarks: no hay evaluaciones estandar ni comparaciones independientes, por lo que cualquier afirmacion de calidad relativa frente a otros modelos carece de respaldo.
- Mantenimiento: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto sin comunidad activa ni garantias de mantenimiento o actualizacion.
- Fecha de creacion inusual: el repositorio figura creado el 2026-09-23, lo que puede indicar un error de metadatos o una publicacion reciente; no afecta al contenido tecnico pero conviene verificarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dehanalkautsar/gpt2-am-wikimulti
- Dataset WikiMulti (referenciado en la model card): https://huggingface.co/datasets/dehanalkautsar/WikiMulti
- Fichero de datos de entrenamiento: `20260801_am_wiki.parquet` dentro del dataset WikiMulti
- Paper asociado: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
