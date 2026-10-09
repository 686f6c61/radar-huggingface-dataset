# map-boy/wandaa-kin-gpt

## Resumen

wandaa-kin-gpt es un modelo de lenguaje de tipo GPT entrenado desde cero (no es un fine-tune) sobre texto en kinyarwanda. Lo desarrolla map-boy como proyecto de investigacion de VAF Ubwenge Tech, con un enfoque iterativo y explicitamente incremental: empezar pequeno, medir, corregir el corpus y repetir. Su funcion actual es la continuacion de texto, no la conversacion: el propio autor indica que todavia no es un chatbot.

Se trata de un transformer decoder-only muy compacto, de 9,7 millones de parametros, con embeddings de token y posicion de 256 dimensiones, 128 posiciones de contexto, 6 bloques pre-norm, 8 cabezas de atencion de 32 dimensiones y una feed-forward de 256-1024-256 con activacion GELU. El vocabulario es de 8000 tokens con un tokenizador BPE de estilo GPT-2, y el corpus de entrenamiento de la mejor version (v3) ronda los 6,6 millones de tokens procedentes de noticias, web y libros de texto.

Su relevancia es doble. Por un lado, es un caso de estudio de bajo coste computacional para lenguas de bajos recursos: cuantifica su progreso con una metrica fija (bits/char sobre 10 frases cotidianas en kinyarwanda) y publica tanto el tokenizador como el corpus. Por otro, documenta con honestidad sus limitaciones: el texto generado es fluido en gramatica y estilo, pero deriva en significado y no responde a preguntas. La hoja de ruta declarada apunta a 50M+ tokens de datos, un tokenizador BPE de 16k-32k, un modelo de 30-50M de parametros con contexto de 256 tokens y un posterior ajuste en datos de pregunta-respuesta y dialogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 6 bloques pre-norm, 8 cabezas de atencion de 32 dims |
| Parametros totales | 9,7 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos float32 en PyTorch) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | no disponible |
| Formato de pesos | PyTorch .pt (state dict); no se publican safetensors ni GGUF |
| Dimension de embedding | 256 |
| Cabezas de atencion | 8 (32 dimensiones por cabeza) |
| Feed-forward | 256-1024-256, activacion GELU |
| Vocabulario | 8000 tokens, BPE estilo GPT-2 |
| Tokens de entrenamiento | ~6,6 M (version v3: noticias, web y libros de texto) |
| Normalizacion | LayerNorm final y pre-norm en cada bloque |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clasico y minimalista: suma embeddings de token y de posicion aprendidos (256 dimensiones, 128 posiciones), los pasa por 6 bloques con normalizacion previa a la atencion y a la feed-forward, aplica un LayerNorm final y proyecta mediante una cabeza lineal a los 8000 tokens del vocabulario. No incorpora atencion lineal, SSM, decodificacion especulativa ni tecnicas de atencion eficiente; toda la innovacion del proyecto esta en el proceso de datos y en la medicion sistematica, no en el bloque arquitectonico.

El entrenamiento se documenta por versiones. `model.pt` corresponde a la primera ejecucion (paso 5000, corpus de libros de texto, 2,382 bits/char). `checkpoint.pt` llega a la epoca 299 (1,981 bits/char). La version v2 retoma ese checkpoint y corrige la particion de validacion (val 2,757; 1,768 bits/char). La v3 amplia el corpus a 6,6 millones de tokens con fuentes de noticias, web y libros de texto y unifica el estilo de apostrofos (val 3,745 sobre un conjunto de validacion nuevo; 1,379 bits/char, el mejor resultado publicado). La v4 repite la receta de v3 eliminando la fuente de libros de texto, lo que mejora ligeramente en texto de estilo noticia (val 3,941 en news/web) y empeora en texto de manual. No se documenta el uso de RLHF, DPO ni ajuste por preferencias en ninguna version.

## Capacidades

- Generacion y continuacion de texto en kinyarwanda a partir de un prefijo (por ejemplo, "Kigali ni umujyi").
- Produccion de texto gramaticalmente fluido y con estilo coherente segun el registro del corpus (noticia, web o manual), segun la version empleada.
- Modelado de lenguaje a nivel de caracter medible: 1,379 bits/char en la version v3 sobre 10 frases cotidianas fuera del conjunto de entrenamiento.
- No soporta tool calling ni function calling: no se documenta plantilla de herramientas ni formato de llamadas.
- No soporta agentes ni razonamiento multi-paso; el propio autor indica que no responde a preguntas.
- Multilingue: no. El modelo esta entrenado y evaluado unicamente en kinyarwanda (codigo de idioma rw).
- Modo de pensamiento (thinking), vision y audio: no disponibles.

## Casos de uso

- Investigacion en lenguas de bajos recursos: sirve como linea base reproducible para medir el efecto de ampliar corpus (de libros de texto a noticias y web) sobre una metrica fija en bits/char, sin necesidad de GPU de gama alta.
- Generacion de texto sintetico en kinyarwanda para preentrenamiento o aumento de datos: al ser un modelo pequeno de 9,7M de parametros, se puede ejecutar en CPU para producir grandes volumenes de texto de forma economica, siempre con revision y filtrado humano.
- Estudio de tokenizadores para kinyarwanda: el tokenizador BPE de 8000 tokens publicado de forma independiente permite analizar la fragmentacion de morfologia aglutinante antes de escalar a vocabularios de 16k-32k en futuras versiones.
- Educacion y prototipado de NLP en kinyarwanda: el cargador autonomo `v3/model.py` junto con el tokenizador permite montar un entorno minimo de inferencia en pocas lineas para docencia o pruebas de concepto.
- Completado de texto en tareas de estilo periodistico: la version v4 (receta sin libros de texto) es la mas adecuada para continuar texto de registro informativo, segun los propios datos de validacion del autor.
- Benchmark de infraestructura de entrenamiento de bajo coste: con 6,6M tokens y un modelo de 9,7M de parametros, es un banco de pruebas realista para validar pipelines de datos, guardado de mejores checkpoints y particiones de validacion fijas.
- No es adecuado, en su estado actual, para atencion al cliente, asistentes conversacionales, generacion de codigo ni matematicas: no responde preguntas ni soporta instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica evaluacion reportada por el autor es una metrica interna de bits por caracter sobre 10 frases cotidianas en kinyarwanda ajenas al entrenamiento, mas la perdida en conjuntos de validacion que cambian entre versiones.

| Version | Cambio principal | Score en held-out | EVAL bits/char |
|---|---|---|---|
| model.pt | Primera ejecucion, paso 5000, corpus de libros de texto | no comparable | 2,382 |
| checkpoint.pt | Epoca 299 | no comparable | 1,981 |
| v2 | Reanudado desde checkpoint.pt, particion de validacion corregida | val 2,757 | 1,768 |
| v3 | Corpus v3: 6,6M tokens (noticias, web, libros de texto), un solo estilo de apostrofo | val 3,745 (conjunto de validacion nuevo) | 1,379 |
| v4 | Receta de v3 sin la fuente de libros de texto | news/web val 3,941 | 1,423 |

Advertencia del autor: los conjuntos de validacion difieren entre versiones, por lo que la columna de score solo es comparable dentro del mismo grupo de filas. La metrica EVAL bits/char si es comparable entre versiones porque se mide sobre el mismo conjunto fijo de 10 frases. El mejor modelo publicado es v3.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 de un modelo de 9,7M de parametros ocupan aproximadamente 39 MB, por lo que la huella de memoria es marginal; no se publican cifras oficiales de VRAM ni de memoria pico.
- GPU recomendadas: no se especifican. Cualquier GPU con al menos unos cientos de MB libres es suficiente; el modelo carga con `map_location="cpu"` en el ejemplo oficial del autor.
- GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo, e incluso en CPU, dado el tamano del modelo y su contexto de 128 tokens.
- Opciones de despliegue: el autor proporciona un cargador autonomo (`v3/model.py`) que se usa con `torch.load` y `importlib`, no con `AutoModelForCausalLM`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparables de otros modelos de kinyarwanda o de tamano similar, y no se aportan datos de benchmarks estandar que permitan una comparacion rigurosa. La unica referencia interna es la comparacion entre las propias versiones v2, v3 y v4 del mismo proyecto (ver seccion de benchmarks).

## Limitaciones y advertencias

- Deriva de significado: el propio autor reconoce que la salida es fluida en gramatica y estilo, pero pierde coherencia semantica, lo que hace inviable su uso como fuente de informacion sin revision humana.
- No responde a preguntas ni mantiene conversacion: es un modelo de continuacion de texto, no un asistente entrenado con instrucciones.
- Contexto muy corto: 128 tokens limitan cualquier tarea que requiera memoria a medio plazo o documentos extensos.
- Cobertura de datos reducida: 6,6M tokens de entrenamiento y 8000 tokens de vocabulario, muy por debajo de lo necesario para un modelado robusto del kinyarwanda; el autor senala los datos como el principal cuello de botella.
- Sesgos: no se documenta ningun analisis de sesgos ni de toxicidad; el corpus mezcla noticias, web y libros de texto sin auditoria publicada.
- Riesgo de alucinacion: alto en terminos de fidelidad factual, ya que no existe ajuste por preferencias ni verificacion factual y el modelo se limita a predecir continuaciones plausibles.
- Idioma: soporte exclusivo de kinyarwanda (rw); no se garantiza ningun comportamiento util en otros idiomas.
- Licencia: no disponible. Al no declararse una licencia explicita en la model card, no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Formato de pesos: solo se publican checkpoints de PyTorch, sin safetensors; requiere cargar codigo Python del repositorio (`model.py`) para instanciar el modelo, lo que implica ejecutar codigo de terceros como parte del flujo de inferencia.
- Versionado: los conjuntos de validacion cambian entre versiones publicadas, lo que complica la trazabilidad de las comparaciones si no se respeta la advertencia del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/map-boy/wandaa-kin-gpt
- Tokenizador: https://huggingface.co/map-boy/wandaa-kin-tokenizer
- Corpus de entrenamiento: https://huggingface.co/map-boy/wandaa-kin-traindata
- Perfil del autor: https://huggingface.co/map-boy

Nota: la busqueda web realizada no ha devuelto resultados relevantes para este modelo (unicamente enlaces a servicios de mapas), por lo que no se incluyen como fuentes. No se han encontrado papers, blogs, repositorios adicionales ni demos publicadas en la informacion disponible.
