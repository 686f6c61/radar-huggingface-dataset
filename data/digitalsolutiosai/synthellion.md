# digitalsolutiosai/synthellion

## Resumen

SynthelionML (repositorio `digitalsolutiosai/synthellion`) es un compresor de prompts neuronal desarrollado por el autor de Synthelion, un proyecto disponible en GitHub bajo el identificador `francescopaolopassaro/Synthelion`. No es un modelo generativo: es un encoder transformer pequeno (10,42 millones de parametros) que realiza una clasificacion binaria por token (mantener o descartar) con el objetivo de reducir la longitud de un prompt conservando su significado. Se ejecuta de forma completamente offline y solo en CPU, y se distribuye en tres formatos (state_dict de PyTorch, SafeTensors y ONNX opset 17), lo que lo hace apto para entornos de borde, navegador y movil.

La relevancia del modelo esta en el problema que aborda: el coste y la latencia de los sistemas basados en LLM crecen con la longitud del contexto, y una parte sustancial de los tokens de un prompt es redundante. SynthelionML aprende a identificar esos tokens mediante auto-destilacion: el compresor basado en reglas del proyecto Synthelion (etiquetado como "SYNTACTIC") genera las etiquetas de referencia y el encoder aprende a generalizar mas alla de esas reglas atendiendo al contexto circundante. El resultado es un clasificador de 10,4 M de parametros, multilingue (39 idiomas, incluyendo castellano, catalan, euskera y gallego) y con licencia MIT.

Sus cifras principales son modestas por diseno: `d_model` de 128, 4 cabezas de atencion, 2 capas, `ffn_dim` de 512, vocabulario de 70.000 palabras mas 8.192 buckets de hashing de n-gramas de caracteres, y una longitud maxima de secuencia de 96 tokens por ventana. Con 0 descargas y 1 "like" en el momento de la consulta, se trata de un modelo recien publicado y practicamente sin adopcion publica registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (2 capas, `d_model`=128, 4 cabezas, `ffn_dim`=512) con hashing de n-gramas de caracteres y caracteristicas discretas de entrada |
| Parametros totales | 10.420.098 (10,4 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Secuencia maxima de 96 tokens por ventana |
| Tipos de cuantizacion | No disponible. Solo se distribuyen pesos en precision completa (tres ficheros de 39,8 MB) |
| Idiomas soportados | 39: af, be, bg, ca, cs, da, de, el, en, es, et, eu, fi, fr, ga, gl, hi, hr, hu, is, it, ja, la, lt, lv, mk, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, uk, zh |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (`model.bin`), SafeTensors (`model.safetensors`), ONNX opset 17 (`synthelionml.onnx`) |
| Vocabulario | 70.000 palabras + 8.192 buckets de n-gramas de caracteres |
| Caracteristicas de entrada | 18 (stopword, capitalizacion, buckets de longitud) |
| Salida | 2 logits por token (drop / keep) |
| Libreria | `synthelionml` |
| Pipeline declarado | `text-classification` (con etiquetas `token-classification` y `prompt-compression`) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creacion en HuggingFace | 2026-09-17 (segun metadatos del repositorio) |
| Ultima actualizacion | 2026-09-17 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de dos capas con `d_model`=128, 4 cabezas de atencion y dimension de feed-forward de 512. El flujo de procesamiento descrito en la model card es: hashing de n-gramas de caracteres -> embedding de palabra + embedding de caracteristicas -> codificacion posicional -> `TransformerEncoder` de 2 capas -> capa `Linear(2)` que produce los logits de mantener o descartar para cada token. La entrada combina dos representaciones: una basada en un vocabulario de 70.000 palabras y otra basada en 8.192 buckets de hashing de n-gramas de caracteres, lo que proporciona robustez ante palabras fuera del vocabulario. Ademas se inyectan 18 caracteristicas discretas por token (condicion de stopword, capitalizacion y buckets de longitud), lo que da al encoder senales explicitas que un transformer puro no derivaria de forma fiable con solo dos capas.

El entrenamiento se realizo sobre los corpus de Wikipedia del proyecto Synthelion, con 74.100 ejemplos de entrenamiento y 3.900 de evaluacion, y auto-destilacion como estrategia de etiquetado: el compresor agresivo basado en reglas ("SYNTACTIC") actua como profesor y genera las etiquetas de referencia, mientras que el encoder aprende a predecir esas decisiones atendiendo al contexto de los tokens vecinos. El objetivo declarado es generalizar mas alla de las reglas simples. Se aplica un controlador de ratio basado en rangos con una compresion minima del 70%. El entrenamiento y la inferencia son completamente offline y orientados a CPU. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO (no aplicables, en principio, a un clasificador de este tipo).

## Capacidades

- Clasificacion binaria por token: para cada token de la entrada produce dos logits (descartar / mantener).
- Compresion de prompts: elimina tokens preservando el significado, con un ratio de compresion minima del 70% controlado por un controlador de ratio basado en rangos.
- Multilingue: cubre 39 idiomas segun la lista de `trained_languages` en `config.json`.
- Robustez ante vocabulario fuera de lista mediante hashing de n-gramas de caracteres (8.192 buckets).
- Ejecucion completamente offline y en CPU, sin dependencia de servicios externos.
- Exportacion a ONNX opset 17 para su uso en ONNX Runtime, JavaScript, C# y plataformas moviles.
- Compatibilidad con HuggingFace a traves de SafeTensors (`model.safetensors`) y `tokenizer.json`.
- Uso como etapa de preprocesado dentro de pipelines de LLM (no como modelo autonomo de generacion).
- No genera texto, no mantiene dialogos, no realiza razonamiento multi-paso por si mismo y no soporta tool calling ni function calling.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad multimodal.
- Aunque puede integrarse en arquitecturas agenticas como modulo de compresion de contexto, no implementa planificacion ni uso de herramientas.

## Casos de uso

- Compresion de prompts en pipelines RAG: antes de enviar el contexto recuperado al LLM, se pasa por SynthelionML para descartar tokens redundantes; con un ratio minimo del 70% se reduce proporcionalmente el coste por token y la latencia de prefill, y el modelo cabe en CPU dentro del mismo nodo de servicio.
- Reduccion de coste en APIs de LLM de pago: al operar solo sobre la longitud del prompt de entrada, la compresion se traduce directamente en facturacion menor por tokens de entrada en proveedores que cobran por token, sin tocar el prompt de sistema ni la logica de negocio.
- Preprocesado en dispositivo o en el borde: al ser un modelo de 10,4 M de parametros y 39,8 MB, el export ONNX permite ejecutar la compresion en navegador (JS), aplicaciones .NET o moviles, evitando enviar el texto completo a un servidor.
- Gestion de historiales de conversacion en agentes: en un bucle agentico multi-turno el historial crece rapidamente; aplicar el compresor a los turnos antiguos mantiene el hilo semantico dentro de ventanas de contexto limitadas.
- Limpieza y normalizacion de corpus para entrenamiento: el clasificador puede usarse para eliminar tokens de baja aportacion informativa en corpus multilingues, como etapa previa a la tokenizacion de un modelo mayor.
- Indexacion y busqueda semantica mas baratas: comprimir los documentos antes de generar embeddings reduce el numero de tokens que pasan por el modelo de embeddings, con el consiguiente ahorro en almacenamiento vectorial y tiempo de indexacion.
- Analisis linguistico y etiquetado de tokens: como clasificador por token, puede emplearse para estudiar que elementos (stopwords, puntuacion, tokens cortos) resultan prescindibles en distintos idiomas, aprovechando su cobertura de 39 lenguas.
- Reduccion de contexto en entornos con ventana estricta: en modelos con limites duros de contexto, la compresion permite encajar mas informacion util en la misma ventana de 96 tokens por bloque procesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de entrenamiento (74.100 ejemplos de entrenamiento, 3.900 de evaluacion, auto-destilacion desde el compresor basado en reglas, compresion minima del 70%) pero no incluye metricas cuantitativas como precision, recall o F1 del clasificador keep/drop, ni comparaciones con otras tecnicas de compresion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en precision completa ocupan 39,8 MB por fichero (41,68 MB en bytes para 10.420.098 parametros en fp32), por lo que la huella de memoria es minima incluso con los buffers de activacion.
- GPU recomendadas: no requiere GPU. Funciona en CPU exclusivamente, tal y como declara el autor ("fully offline, CPU-only"). Cualquier GPU, incluida una integrada, es mas que suficiente si se desea acelerar por lotes.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo (por ejemplo, serie RTX 40, RTX 30 o anterior) e incluso sin GPU dedicada. No es necesario disponer de A100, H100 ni VRAM elevada.
- Opciones de despliegue: PyTorch nativo mediante la clase `SynthelionMLCompressor`; ONNX Runtime a traves de `synthelionml.onnx` (opset 17), exportable a JavaScript, C# y movil; carga directa de SafeTensors con `safetensors.torch.load_file`. No se menciona soporte de vLLM, llama.cpp, Ollama o TGI, que no aplican a un encoder de clasificacion de este tamano.
- Latencia y throughput estimados: no disponibles. Al tratarse de un encoder de 2 capas y 10,4 M de parametros ejecutado en CPU, es razonable esperar latencias de orden de milisegundos por secuencia de 96 tokens, pero no se proporciona ninguna cifra medida en la informacion disponible.
- Limitacion operativa relevante: la ventana de 96 tokens obliga a procesar entradas largas por ventanas sucesivas, lo que anade complejidad de orquestacion en el pipeline de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SynthelionML (digitalsolutiosai/synthellion) | 10,4 M | 96 tokens por ventana | Encoder transformer con clasificacion binaria keep/drop, auto-destilado desde reglas | MIT | HuggingFace (PyTorch, SafeTensors, ONNX) |
| Compresor basado en reglas SYNTACTIC (Synthelion) | No disponible | No disponible | Reglas heuristicas, sin aprendizaje; actua como profesor del modelo anterior | No disponible en la informacion proporcionada | Repositorio GitHub de Synthelion |
| Otras soluciones de compresion de prompts (por ejemplo, la familia LLMLingua) | No disponible | No disponible | Compresion de prompts basada en modelos tipo encoder | No disponible | No disponible en la informacion proporcionada |

La busqueda web realizada no ha devuelto resultados relacionados con el modelo; los enlaces obtenidos corresponden a un portal de servicios energeticos (TELESON) y no guardan relacion con SynthelionML. Por tanto, los datos comparativos de terceros no estan disponibles en esta ficha.

## Limitaciones y advertencias

- Uso restringido a clasificacion de tokens: no genera texto, no responde preguntas y no debe presentarse como un asistente conversacional.
- Ventana de 96 tokens: las entradas mas largas requieren segmentacion en ventanas y un controlador de ratio que agregue las decisiones, lo que puede degradar la coherencia de la compresion en fronteras de ventana.
- Riesgo de perdida de informacion: descartar tokens es irreversible; si el clasificador se equivoca en un token critico (por ejemplo, una negacion o una cifra), el prompt comprimido puede cambiar de significado. La model card no aporta metricas de fidelidad semantica.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos positivos de descarte que alteren el contenido.
- Sesgos: no se documenta ningun analisis de sesgos. El modelo se entrena con corpus de Wikipedia en 39 idiomas, por lo que heredara los desequilibrios de cobertura y representacion de esas fuentes, con un rendimiento previsiblemente inferior en idiomas con menos volumen de datos.
- Dependencia del profesor: al emplear auto-destilacion desde un compresor de reglas, el modelo tiende a reproducir los sesgos y heuristicas de ese compresor, con una capacidad de mejora acotada por la calidad de las etiquetas de origen.
- Idiomas no cubiertos: las lenguas ausentes de la lista de 39 no estan soportadas y el comportamiento del hashing de caracteres en ellas es impredecible.
- Licencia: MIT, permisiva y compatible con uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No se declaran restricciones adicionales de uso.
- Madurez: 0 descargas y 1 "like" en el momento de la consulta; no hay evidencia publica de validacion independiente ni de uso en produccion. No deberia adoptarse en sistemas criticos sin una evaluacion propia previa.
- Fechas de publicacion: los metadatos indican creacion y actualizacion el 2026-09-17, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/digitalsolutiosai/synthellion
- Repositorio de Synthelion en GitHub: https://github.com/francescopaolopassaro/Synthelion
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a TELESON (https://auth.teleson.de/, https://www.teleson.de/, https://telesonpower.de/home/kundenportal-strom/, https://kundenportal.teleson.de/, https://portal.teleson.de/portal/) y no guardan relacion con SynthelionML.
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
