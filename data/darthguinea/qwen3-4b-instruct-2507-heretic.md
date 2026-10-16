# darthguinea/Qwen3-4B-Instruct-2507-heretic

## Resumen

`darthguinea/Qwen3-4B-Instruct-2507-heretic` es un modelo de lenguaje de 4.022.468.096 parametros publicado en HuggingFace por el usuario `darthguinea`. Se trata de un derivado de Qwen3-4B-Instruct-2507, el modelo denso de 4B de la familia Qwen3 en su revision de julio de 2025 y en modo "solo instruct" (sin bloque de razonamiento explicito). El sufijo "heretic" hace referencia al proceso de abliteracion automatica (ablacion direccional de las direcciones de rechazo) que se aplica a modelos alineados para eliminar total o parcialmente sus negativas a responder; es una inferencia razonable a partir del nombre, no un dato documentado en la ficha.

La model card del repositorio es la plantilla autogenerada de `transformers` y no contiene ni un solo campo completado: no declara autor efectivo, datos de entrenamiento, hiperparametros, licencia ni evaluacion. La unica informacion dura disponible es la metadata del Hub (tags, tamano de repo de 8,1 GB y recuento de parametros de safetensors). El modelo acumulaba 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

Su relevancia practica es doble: por un lado, ofrece una ventana de contexto nominal de 262.144 tokens (heredada del modelo base) en un tamano que cabe en GPU de consumo; por otro, es un caso de estudio de como los derivados sin documentar de modelos con licencia permisiva circulan por el Hub sin trazabilidad de entrenamiento ni garantias de seguridad. Cualquier uso en produccion deberia partir de una evaluacion propia, dado que no hay benchmarks publicados para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Qwen3); herencia inferida del modelo base, no confirmada en la ficha |
| Parametros totales | 4.022.468.096 (4,02 B, dato de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en Qwen3-4B-Instruct-2507; no confirmado para este derivado |
| Tipos de cuantizacion | no disponible; el repo solo contiene safetensors (previsiblemente bf16/fp16). Compatible con cuantizaciones generadas por terceros (GGUF, GPTQ, AWQ, bitsandbytes) |
| Idiomas soportados | no disponible en la ficha; el modelo base Qwen3 declara soporte de 119 idiomas y dialectos |
| Licencia | no disponible (la ficha no declara licencia; el modelo base Qwen3-4B-Instruct-2507 se publica bajo Apache 2.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,1 GB |
| Libreria declarada | transformers (tags: text-generation-inference, endpoints_compatible) |
| Pipeline | text-generation |
| Modalidad | texto unicamente |
| Modo de razonamiento | no disponible; el modelo base de la serie 2507 Instruct opera sin bloque de "thinking" |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento en la informacion disponible: la model card es la plantilla vacia de `transformers` y no documenta dataset, numero de tokens, regimen de precision, hiperparametros, ni si hubo RLHF, DPO u otra fase de post-entrenamiento. Tampoco se indica que metodo concreto de abliteracion se aplico, cuantas matrices se modificaron ni con que dataset de calibracion. Todo lo que se puede afirmar con rigor es el recuento de parametros (4,02 B) y el formato de pesos (safetensors).

Lo que si puede describirse es la arquitectura del modelo base del que deriva, Qwen3-4B-Instruct-2507: un transformer decoder-only denso con 36 capas, `hidden_size` de 2560, 32 cabezas de atencion con 8 cabezas KV (GQA, `head_dim` de 128), `intermediate_size` de 9728, vocabulario de 151.936 tokens, normalizacion RMSNorm y embeddings rotatorios (RoPE). La familia Qwen3 se entreno sobre decenas de billones de tokens (el fabricante declara 36 billones para la generacion base de Qwen3); la revision 2507 del modo Instruct amplia el post-entrenamiento y elimina el modo de razonamiento explicito, orientandola a instrucciones directas. Cualquier afirmacion sobre cuantas de estas caracteristicas sobreviven intactas tras la abliteracion es especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat de Qwen3 (`apply_chat_template`) y soporte de `system` prompt.
- Razonamiento e instrucciones directas en modo no-thinking, que reduce latencia frente a los modelos con cadena de pensamiento explicita.
- Generacion de codigo y tareas de edicion sobre fragmentos de codigo, en linea con las capacidades del modelo base.
- Matematicas y tareas de varios pasos de dificultad media, limitadas por el tamano de 4B.
- Contexto largo: la ventana nominal de 262.144 tokens permite procesar libros completos, bases de codigo extensas o historiales de conversacion muy largos, siempre que la VRAM lo permita.
- Capacidades multilingues: no documentadas en este derivado; el modelo base declara 119 idiomas.
- Tool calling / function calling: no documentado en la ficha; el modelo base Qwen3 soporta invocacion de herramientas en su formato de chat.
- Uso como agente y razonamiento multi-paso: no documentado para este checkpoint.
- Comportamiento "sin rechazos": presumiblemente reduccion de negativas por abliteracion (no verificado ni documentado por el autor). No es una capacidad tecnica sino un cambio de comportamiento, con implicaciones eticas y legales.
- Capacidades de vision y audio: no soportadas (modelo exclusivamente de texto).

## Casos de uso

- Evaluacion de seguridad y red-teaming: al ser un derivado con las capas de rechazo presumiblemente atenuadas, resulta util como sujeto de prueba en pipelines de auditoria de modelos, para medir la eficacia de clasificadores de contenido y de filtros de entrada/salida antes de desplegar un sistema real.
- Generacion de datos sinteticos para entrenar clasificadores de seguridad: un modelo mas permisivo puede producir ejemplos dificiles (prompts y respuestas limite) que sirvan como conjunto de entrenamiento o de evaluacion de un moderador, siempre dentro de un entorno controlado y con revision humana.
- Escritura creativa y ficcion sin restricciones tematicas: narrativa con violencia, contenido adulto o temas sensibles, donde los modelos alineados suelen derivar o negarse. Requiere verificacion previa del marco legal aplicable en la jurisdiccion de despliegue.
- Asistente local sobre documentacion extensa: con 262.144 tokens de contexto nominal, puede cargar manuales tecnicos, expedientes o repositorios completos y responder preguntas sobre ellos, ejecutandose en una sola GPU de consumo o incluso en CPU con cuantizacion de 4 bits.
- Analisis de codigo en local: revision de fragmentos, generacion de tests y refactorizaciones sencillas en entornos con requisitos de confidencialidad, donde no se puede enviar el codigo a una API externa.
- Prototipado rapido con vLLM o TGI: al ser un checkpoint de 4B en safetensors, se integra directamente en los servicios compatibles con la API de OpenAI que el Hub etiqueta como `endpoints_compatible`, lo que simplifica sustituir un endpoint por otro en fases de prueba.
- Fine-tuning posterior especifico de dominio: su tamano permite reentrenar o aplicar LoRA en una unica GPU de 24 GB, partiendo de un modelo ya desprovisto de restricciones de rechazo cuando el caso de uso lo requiere.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna seccion de evaluacion completada y no existe documentacion adicional del autor. Para referencias del modelo base (MMLU, MMLU-Pro, GPQA, AIME, LiveCodeBench, etc.) hay que acudir a los materiales publicados por el equipo Qwen, teniendo en cuenta que la abliteracion puede degradar el rendimiento general y que ese efecto no esta cuantificado en ningun sitio para este checkpoint.

## Requisitos de hardware

- Pesos completos en bf16/fp16: aproximadamente 8,0-8,1 GB (coincide con el tamano del repositorio). Cabe en GPUs de 12 GB o mas, y en CPU con RAM suficiente.
- Cuantizacion de 8 bits: aproximadamente 4,3 GB. Cuantizacion de 4 bits (GGUF Q4_K_M, GPTQ o AWQ): aproximadamente 2,3-2,7 GB. En este rango funciona en GPUs de 8 GB y en CPU moderna con 8-16 GB de RAM.
- Cache KV en fp16: con 36 capas, 8 cabezas KV y `head_dim` 128, cada token ocupa unos 144 KiB. Esto supone aproximadamente 4,7 GB a 32K tokens, 18,9 GB a 128K y 37,7 GB a 262K. El contexto nominal de 262K no es viable en GPU de consumo sin cuantizacion de la cache (FP8/INT8) o sin atencion con memoria eficiente.
- GPUs recomendadas: RTX 4090 o L40S (24-48 GB) para contexto largo sin cuantizar; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o A10G para inferencia en bf16 con contexto moderado; A100 40/80 GB o H100 para lotes grandes y contexto completo.
- Cabe en GPU de consumo: si, en bf16 desde 12 GB (con contexto reducido) y en 4-8 bits desde 8 GB.
- Opciones de despliegue: `transformers`, vLLM, SGLang, TGI, llama.cpp y Ollama (estos dos ultimos requieren convertir los safetensors a GGUF). Los tags del repositorio indican compatibilidad con text-generation-inference y con endpoints compatibles con la API de OpenAI.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-heretic (este) | 4,02 B denso | 262.144 tokens (heredado, no confirmado) | no disponible en la ficha | HuggingFace, safetensors | No disponible |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B denso | 262.144 tokens | Apache 2.0 | HuggingFace, safetensors, GGUF de terceros | Datos publicados por el fabricante |
| Qwen3-4B-Thinking-2507 | 4,02 B denso | 262.144 tokens | Apache 2.0 | HuggingFace | Datos publicados por el fabricante |
| Llama-3.1-8B-Instruct | 8,03 B denso | 131.072 tokens | Licencia comunitaria de Llama 3.1 | HuggingFace, GGUF oficiales | Datos publicados por el fabricante |

La diferencia relevante frente al modelo base no es de parametros ni de contexto, sino de comportamiento: el derivado intercambia garantias de alineacion y trazabilidad por una mayor permisividad, y pierde la documentacion y el respaldo del fabricante. Frente a Llama-3.1-8B-Instruct, este modelo ofrece la mitad de parametros y el doble de contexto nominal, a costa de una licencia no declarada.

## Limitaciones y advertencias

- Model card vacia: no hay documentacion de entrenamiento, datos, hiperparametros ni evaluacion. Cualquier afirmacion sobre su comportamiento debe verificarse empiricamente.
- Licencia no declarada en el repositorio. El modelo base es Apache 2.0, pero eso no garantiza por si solo que el derivado herede esa licencia ni que el autor pueda relicenciarlo. Antes de un uso comercial conviene aclarar la situacion legal con el publicador del checkpoint.
- La abliteracion es una modificacion no supervisada de los pesos que altera las direcciones de activacion asociadas al rechazo. Suele degradar capacidades generales (razonamiento, coherencia en tareas largas) y puede aumentar la tasa de respuestas erroneas o inventadas al eliminar la tendencia a negarse ante peticiones dudosas. No hay mediciones de esta degradacion para este checkpoint.
- Riesgo de alucinacion: inherente a un modelo de 4B sin datos de evaluacion publicados. No hay ninguna medicion de fidelidad factual ni de calibracion.
- Sesgos: no hay evaluacion de sesgos en la informacion disponible. El modelo base arrastra los sesgos de su corpus de entrenamiento y la abliteracion no los corrige; es probable que los amplifique en temas sensibles.
- Contenido danino: al reducir las negativas, el modelo puede generar instrucciones peligrosas, discurso de odio o contenido ilegal en determinadas jurisdicciones. Su uso en productos de cara al publico sin moderacion externa es desaconsejable y puede incumplir normativa (por ejemplo, la Ley de Servicios Digitales de la UE o la Ley de IA).
- Cobertura de idiomas no documentada: aunque el modelo base declara 119 idiomas, no hay garantia de que la abliteracion no haya degradado el rendimiento en idiomas distintos del ingles y el chino.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento del analisis, y una fecha de creacion anomala (2026) en la metadata del Hub, lo que impide contrastar su comportamiento con otros usuarios.
- Contexto largo no garantizado: la ventana de 262.144 tokens es una caracteristica del modelo base; la calidad de recuperacion en contextos muy largos no esta medida para este checkpoint y el coste de memoria de la cache KV es elevado.
- Sin garantias de produccion: no existe version cuantizada oficial, ni plantilla de prompt validada, ni soporte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darthguinea/Qwen3-4B-Instruct-2507-heretic
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Blog de la serie Qwen3 (referencia del fabricante): https://qwenlm.github.io/blog/qwen3/
- Repositorio de la herramienta de abliteracion Heretic (origen probable del sufijo, no confirmado por el autor): https://github.com/p-e-w/heretic
- Referencia del template de model card para el calculo de emisiones: https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019). Es el unico enlace con identificador arXiv presente en el repositorio y proviene de la plantilla autogenerada, no de documentacion del modelo.
- Nota: la busqueda web realizada no devolvio ningun enlace tecnico relevante sobre este modelo; los resultados obtenidos no guardaban relacion con el checkpoint ni con inteligencia artificial y se han descartado.
