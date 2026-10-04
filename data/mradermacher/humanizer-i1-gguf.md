# mradermacher/humanizer-i1-GGUF

## Resumen

humanizer-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo jialinyyzz/humanizer, publicado por mradermacher (nethype GmbH). El modelo base es un sistema especializado en reescritura de texto ("humanization"), es decir, transformar texto generado por máquina en texto con un registro más natural, parafrasear y transferir estilo, con soporte declarado para inglés (en) y chino (zh).

El modelo base cuenta con 11.907.350.576 parámetros (unos 11,9 mil millones) segun los datos reales de safetensors, y la model card incluye la etiqueta `gemma4`, lo que apunta a la familia de arquitecturas Gemma, aunque no se detalla la arquitectura exacta ni la longitud de contexto en la informacion disponible. La model card indica ademas que se trata de un modelo con capacidad de vision, cuyos ficheros `mmproj` (si existen) se alojan en el repositorio de cuantizaciones estaticas, no en este.

Su relevancia practica es doble: por un lado, ofrece 25 cuantizaciones distintas (desde i1-IQ1_S de 3,1 GB hasta i1-Q6_K de 9,9 GB), lo que permite ejecutar un modelo de casi 12B en hardware de consumo; por otro lado, todas las cuantizaciones se han generado con imatrix (importance matrix), lo que mejora la calidad respecto a las cuantizaciones estaticas equivalentes del mismo autor. La licencia Apache 2.0 facilita el uso comercial, y el repositorio incluye variantes compatibles con llama.cpp y MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. La model card incluye la etiqueta `gemma4`, lo que sugiere la familia Gemma; es un modelo multimodal (la model card lo describe como "vision model") |
| Parametros totales | 11.907.350.576 (unos 11,9 B), segun datos reales de safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizaciones i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, ademas del fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio incluye la etiqueta `mlx` y la libreria declarada es `transformers` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base jialinyyzz/humanizer: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, cabezas de atencion o dimension del modelo. La unica pista estructural es la etiqueta `gemma4`, que situa el modelo en la familia Gemma de Google. La model card de esta cuantizacion se limita a describir el proceso de cuantizacion, no el entrenamiento del modelo original.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Lo que si se documenta es el pipeline de post-procesado por parte de mradermacher: las cuantizaciones se han generado a partir de los pesos en formato HuggingFace (`convert_type: hf`) con `quantize_version: 2` y `output_tensor_quantised: 1`, usando una importance matrix (imatrix) generada con el corpus `nicoboss`, lo que segun el autor produce cuantizaciones de mayor calidad que las estaticas disponibles en el repositorio paralelo humanizer-GGUF.

## Capacidades

- Reescritura de texto ("humanization"): transformar texto con registro artificial o generado por maquina en texto de apariencia mas natural.
- Parafraseo: reformulacion de contenidos manteniendo el significado.
- Transferencia de estilo (style transfer): adaptacion del tono y registro de un texto a otro estilo objetivo.
- Generacion de texto general, heredada del modelo base sobre el que se ha entrenado.
- Capacidad multimodal declarada: la model card indica explicitamente que es un modelo de vision y remite a los ficheros `mmproj` del repositorio estatico. Los ficheros mmproj estan marcados como omitidos en esta cuantizacion (`skip_mmproj: 1`).
- Soporte multilingue limitado a ingles y chino segun los metadatos de idioma del repositorio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta un modo de razonamiento explicito (thinking mode) ni capacidades de audio.

## Casos de uso

- Reescribir borradores generados por LLM: el modelo puede tomar la salida de otro modelo (por ejemplo, un asistente que redacta correos) y reformularla para que no suene a texto automatico antes de enviarla.
- Adaptacion de registro en documentacion tecnica: convertir notas internas o apuntes tecnicos en prosa publicable con un tono mas cercano, manteniendo la terminologia.
- Localizacion de estilo para mercados en y zh: al soportar ambos idiomas, puede reescribir textos traducidos automaticamente para que suenen naturales en cada idioma.
- Preprocesado de corpus para entrenamiento: parafrasear ejemplos de un dataset para aumentar la diversidad lexica y sintactica antes de usarlo en fine-tuning.
- Normalizacion de contenido generado por plantillas: en sistemas que producen descripciones de producto o fichas a partir de plantillas, el modelo puede variar la redaccion para evitar duplicidad de contenido.
- Reescritura orientada a SEO: generar variantes de un mismo texto para distintas paginas o campañas sin cambiar el mensaje subyacente.
- Moderacion y reformulacion de respuestas: reescribir respuestas predefinidas de un bot para que no resulten repetitivas en conversaciones largas.
- Evaluacion comparativa de "detectores de IA": usar el modelo como generador controlado de texto humanizado para probar la robustez de clasificadores, dentro de un marco de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni de tareas especificas de reescritura o parafraseo, y tampoco se aportan metricas de similitud semantica, BLEU, ROUGE o tasas de deteccion por clasificadores.

## Requisitos de hardware

El repositorio ocupa 140,3 GB en total, correspondientes al conjunto de 25 cuantizaciones. Para inferencia hay que sumar al tamano del fichero GGUF un margen de aproximadamente 1 a 3 GB para cache KV y overhead del runtime, en funcion del contexto configurado.

| Cuantizacion | Tamano (GB) | VRAM estimada en inferencia (GB) | Notas de la model card |
|---|---|---|---|
| i1-IQ1_S | 3,1 | ~4-5 | "for the desperate" |
| i1-IQ1_M | 3,3 | ~4-5 | "mostly desperate" |
| i1-IQ2_XXS | 3,7 | ~5-6 | |
| i1-IQ2_XS | 4,0 | ~5-6 | |
| i1-IQ2_S | 4,2 | ~5-7 | |
| i1-IQ2_M | 4,5 | ~6-7 | |
| i1-Q2_K_S | 4,6 | ~6-7 | "very low quality" |
| i1-IQ3_XXS | 4,9 | ~6-7 | "lower quality" |
| i1-Q3_K_S | 5,6 | ~7-8 | IQ3_XS probablemente mejor |
| i1-IQ3_S | 5,6 | ~7-8 | "beats Q3_K*" |
| i1-IQ3_M | 5,8 | ~7-8 | |
| i1-Q3_K_M | 6,2 | ~7-9 | IQ3_S probablemente mejor |
| i1-IQ4_XS | 6,7 | ~8-9 | |
| i1-Q4_0 | 7,1 | ~8-10 | "fast, low quality" |
| i1-Q4_K_S | 7,1 | ~8-10 | "optimal size/speed/quality" |
| i1-Q4_K_M | 7,5 | ~9-10 | "fast, recommended" |
| i1-Q5_K_M | 8,6 | ~10-12 | |
| i1-Q6_K | 9,9 | ~11-13 | "practically like static Q6_K" |

- Cabe en GPU de consumo: practicamente todas las cuantizaciones hasta Q4_K_M (7,5 GB) entran en tarjetas con 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. Las variantes Q5 y Q6 requieren 12-16 GB.
- GPU profesionales: en A100 40/80 GB, H100 o L40S se puede cargar cualquier cuantizacion con contexto largo y procesamiento por lotes.
- CPU y desagregacion: al ser GGUF, es viable ejecutar las cuantizaciones bajas (IQ2/IQ3) en CPU con RAM suficiente, o repartir capas entre GPU y CPU con `llama.cpp`.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server, Ollama, LM Studio, kobold.cpp) son las rutas naturales para GGUF. El repositorio declara compatibilidad con MLX (Apple Silicon) y la libreria `transformers`, aunque para los pesos GGUF el runtime de referencia es llama.cpp.
- Vision: los ficheros `mmproj` no estan en este repositorio (`skip_mmproj: 1`); para usar la parte multimodal hay que acudir al repositorio estatico humanizer-GGUF.
- Latencia y throughput: no disponible. No hay cifras de tokens por segundo publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. No hay benchmarks ni especificaciones de contexto que permitan situar este modelo frente a alternativas de reescritura, parafraseo o humanizacion. Las unicas referencias utiles son las dos variantes publicadas por el mismo autor y el modelo origen:

| Modelo | Relacion | Parametros | Formato | Licencia |
|---|---|---|---|---|
| jialinyyzz/humanizer | Modelo base sin cuantizar | 11,9 B (safetensors) | safetensors (HuggingFace) | Apache 2.0 (segun metadatos del repo derivado) |
| mradermacher/humanizer-GGUF | Cuantizaciones estaticas del mismo modelo base | 11,9 B | GGUF | Apache 2.0 |
| mradermacher/humanizer-i1-GGUF | Cuantizaciones con imatrix (este repositorio) | 11,9 B | GGUF | Apache 2.0 |

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede verificar la calidad de la reescritura ni compararla con alternativas de forma objetiva.
- Riesgo de alucinacion y de deriva semantica: en tareas de parafraseo, los modelos generativos pueden alterar el significado original, introducir afirmaciones no presentes en el texto fuente o eliminar matices relevantes.
- Idiomas limitados: los metadatos solo declaran ingles y chino. El rendimiento en castellano no esta documentado y probablemente sea degradado.
- La model card advierte de que el modelo base es multimodal, pero los ficheros de proyeccion visual no estan en este repositorio. Usar las cuantizaciones i1 sin `mmproj` limita la inferencia a texto.
- Ficheros de gran tamano: el repositorio completo son 140,3 GB. Descargar todos los quants no tiene sentido para un uso normal; conviene elegir una sola variante.
- Calidad de las cuantizaciones mas agresivas: el propio autor etiqueta las variantes IQ1 e IQ2 como "for the desperate" o "very low quality". Por debajo de IQ3_XXS la perdida de calidad es apreciable.
- Uso responsable: un modelo especializado en "humanizar" texto puede emplearse para ocultar el origen automatico de contenidos, por ejemplo para evadir detectores de IA en contextos academicos o de publicacion. La licencia Apache 2.0 no restringe ese uso, pero la responsabilidad etica y legal recae en quien despliega el modelo.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre su calidad real.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No hay clausulas de uso aceptable adicionales en la informacion disponible.
- Procedencia del modelo base: no se ha podido verificar la model card original de jialinyyzz/humanizer en la informacion proporcionada, por lo que no se conocen detalles sobre su entrenamiento, datos ni posibles sesgos.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/humanizer-i1-GGUF
- Modelo base: https://huggingface.co/jialinyyzz/humanizer
- Cuantizaciones estaticas del mismo autor (incluye los ficheros `mmproj` de vision): https://huggingface.co/mradermacher/humanizer-GGUF
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#humanizer-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/humanizer-i1-GGUF/resolve/main/humanizer.imatrix.gguf
- Preguntas frecuentes y peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los enlaces obtenidos correspondian a anuncios de servicios de acompañamiento sin relacion alguna con el modelo, por lo que se han descartado y no se incluyen en esta ficha.
